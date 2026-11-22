import { createGrid } from './grid.mjs';
import { terrain as t } from './data.mjs';
import { within } from './placement.mjs';

export function convertOSM(documents, options={}) {
  const [west,south,east,north]=options.bounds||osmBounds(documents[0]);
  if(![west,south,east,north].every(Number.isFinite)||west>=east||south>=north
    ||west< -180||east>180||south< -85||north>85) throw Error('Emprise OpenStreetMap invalide.');
  const kmX=(east-west)*111.32*Math.cos((south+north)*Math.PI/360);
  const kmZ=(north-south)*111.32;
  const cellKm=Math.max(.019,Math.max(kmX,kmZ)/112);
  const w=options.w||Math.max(16,Math.round(kmX/cellKm));
  const h=options.h||Math.max(16,Math.round(kmZ/cellKm));
  const meters=options.meters||cellKm*1000;
  const entry=options.entry||[west+(east-west)*.78,south+(north-south)*.63];
  const refuge=options.refuge||[west+(east-west)*.24,south+(north-south)*.36];
  const names=options.labels||[];
  const grid=createGrid(w,h);
  const elements=new Map(documents.flatMap(doc=>doc.elements.map(e=>[e.type+'/'+e.id,e])));
  const ways=[...elements.values()].filter(e=>e.type==='way');
  const roads=[], buildings=[], parks=[], water=[], rivers=[];
  const waterCutouts={};
  const cells=new Array(w*h).fill(t.block);
  const anchors=new Map();
  const bounds=[[-.5,w-.5],[-.5,h-.5]];
  const highway=new Map([
    ['footway',0],['cycleway',0],['path',0],['steps',0],['service',0],['track',0],
    ['pedestrian',1],['living_street',1],['residential',1],['unclassified',1],
    ['tertiary',2],['secondary',2],['primary',2],['trunk',2],['motorway',2],
    ['tertiary_link',1],['secondary_link',1],['primary_link',1],['trunk_link',1],['motorway_link',1]
  ]);

  const round=n=>Math.round(n*100)/100;
  const project=(lon,lat)=>[round((lon-west)/(east-west)*w-.5),round((north-lat)/(north-south)*h-.5)];
  const coord=id=>{
    const node=elements.get('node/'+id);
    return node&&project(node.lon,node.lat);
  };
  function overlaps(points) {
    return bounds.every(([lo,hi],axis)=>points.some(p=>p[axis]>=lo)&&points.some(p=>p[axis]<=hi));
  }
  function clip(points) {
    let polygon=points;
    for(const [axis,[lo,hi]] of bounds.entries()) for(const [limit,sign] of [[lo,1],[hi,-1]]) {
      const next=[];
      for(let i=0;i<polygon.length;i++) {
        const a=polygon.at(i-1), b=polygon[i];
        const aIn=(a[axis]-limit)*sign>=0, bIn=(b[axis]-limit)*sign>=0;
        if(aIn!==bIn) {
          const u=(limit-a[axis])/(b[axis]-a[axis]);
          next.push([round(a[0]+u*(b[0]-a[0])),round(a[1]+u*(b[1]-a[1]))]);
        }
        if(bIn) next.push(b);
      }
      polygon=next;
    }
    return polygon;
  }
  const area=(p)=>Math.abs(p.reduce((sum,v,i)=>sum+v[0]*p[(i+1)%p.length][1]-v[1]*p[(i+1)%p.length][0],0))*.5;
  const closed=ids=>ids[0]===ids.at(-1);
  function polygon(coords,minArea) {
    const clipped=clip(coords.slice(0,-1));
    return clipped.length>=3&&area(clipped)>minArea?clipped.flat():null;
  }
  const wet=tags=>tags.natural==='water'||['riverbank','dock'].includes(tags.waterway);
  for(const way of ways) {
    const tags=way.tags;
    if(!tags) continue;
    const coords=way.nodes.map(coord);
    if(coords.length<2||coords.some(p=>!p)||!overlaps(coords)) continue;
    if(highway.has(tags.highway)&&tags.access!=='private'&&tags.area!=='yes') {
      roads.push([highway.get(tags.highway),Number(tags.bridge&&tags.bridge!=='no'||tags.tunnel&&tags.tunnel!=='no'),coords.flat()]);
    }
    if(['canal','river','stream'].includes(tags.waterway)&&!tags.tunnel) {
      const width=Number.parseFloat(tags.width)/meters||(tags.waterway==='river'?.68:tags.waterway==='canal'?.41:.12);
      rivers.push([width,coords.flat()]);
    }
    if(!closed(way.nodes)) continue;
    if(wet(tags)) {
      const p=polygon(coords,.028);
      if(p) water.push(p);
    } else if(tags.building&&tags.building!=='no') {
      const p=polygon(coords,.014);
      if(p) {
        const levels=Number.parseFloat(tags['building:levels']);
        const height=Number.parseFloat(tags.height)/meters||((Number.isFinite(levels)?levels:2+(way.id%4))*3.2)/meters;
        buildings.push([round(Math.min(1.95,Math.max(.14,height))),p]);
      }
    } else if(['park','garden','pitch','recreation_ground','nature_reserve','golf_course'].includes(tags.leisure)
      ||['grass','forest','recreation_ground','meadow','cemetery','allotments'].includes(tags.landuse)||tags.natural==='wood') {
      const p=polygon(coords,.16);
      if(p) parks.push(p);
    }
  }
  function rings(relation,role) {
    const segments=(relation.members||[]).filter(m=>m.type==='way'&&m.role===role)
      .map(m=>elements.get('way/'+m.ref)?.nodes).filter(Boolean);
    const found=[];
    while(segments.length) {
      let ring=segments.pop();
      while(!closed(ring)) {
        const at=segments.findIndex(seg=>seg[0]===ring.at(-1)||seg.at(-1)===ring.at(-1));
        if(at<0) break;
        const next=segments.splice(at,1)[0];
        ring=ring.concat((next[0]===ring.at(-1)?next:next.slice().reverse()).slice(1));
      }
      const coords=ring.map(coord);
      if(!closed(ring)||coords.some(p=>!p)||!overlaps(coords)) continue;
      found.push(coords);
    }
    return found;
  }
  for(const relation of elements.values()) if(relation.type==='relation'&&wet(relation.tags||{})) {
    const holes=rings(relation,'inner');
    for(const outer of rings(relation,'outer')) {
      const outline=polygon(outer,.028);
      if(!outline) continue;
      const cutouts=holes.filter(h=>within(h[0],outer.slice(0,-1))).map(h=>polygon(h,.028)).filter(Boolean);
      if(cutouts.length) waterCutouts[water.length]=cutouts;
      water.push(outline);
    }
  }

  function fill(list,type,cutouts={}) {
    for(const [index,p] of list.entries()) {
      const xs=p.filter((_,i)=>!(i%2)), zs=p.filter((_,i)=>i%2);
      const holes=(cutouts[index]||[]).map(h=>h.filter((_,i)=>i%2===0).map((x,i)=>[x,h[i*2+1]]));
      for(let z=Math.max(0,Math.ceil(Math.min(...zs)));z<=Math.min(h-1,Math.floor(Math.max(...zs)));z++)
        for(let x=Math.max(0,Math.ceil(Math.min(...xs)));x<=Math.min(w-1,Math.floor(Math.max(...xs)));x++) {
          let inside=false;
          for(let i=0,j=xs.length-1;i<xs.length;j=i++) {
            if((zs[i]>z)!==(zs[j]>z) && x<(xs[j]-xs[i])*(z-zs[i])/(zs[j]-zs[i])+xs[i]) inside=!inside;
          }
          if(inside&&!holes.some(h=>within([x,z],h))) cells[grid.cell(x,z)]=type;
        }
    }
  }
  fill(parks,t.park);
  fill(water,t.water,waterCutouts);
  const inGrid=(x,z)=>x>=0&&x<w&&z>=0&&z<h;
  function roadAt(x,z,px,pz,crossing) {
    if(!inGrid(x,z)) return;
    const i=grid.cell(x,z);
    if(cells[i]===t.water&&!crossing) return;
    cells[i]=cells[i]===t.water||cells[i]===t.bridge?t.bridge:t.road;
    const d=(x-px)**2+(z-pz)**2;
    if(d<(anchors.get(i)?.[2]??Infinity)) anchors.set(i,[round(px),round(pz),d]);
  }
  for(const [,crossing,coords] of roads) {
    let previous;
    for(let j=2;j<coords.length;j+=2) {
      const [a,b,c,d]=coords.slice(j-2,j+2);
      const steps=Math.ceil(Math.hypot(c-a,d-b)*6);
      for(let s=0;s<=steps&&steps>0;s++) {
        const px=a+(c-a)*s/steps, pz=b+(d-b)*s/steps;
        const x=Math.round(px), z=Math.round(pz);
        if(previous&&x!==previous[0]&&z!==previous[1]) roadAt(x,previous[1],px,pz,crossing);
        roadAt(x,z,px,pz,crossing);
        previous=[x,z];
      }
    }
  }

  const walk=i=>[t.road,t.park,t.bridge].includes(cells[i]);
  const startHint=project(...entry);
  const endHint=project(...refuge);
  const near=([x,z],choices)=>choices.reduce((best,i)=>{
    const [vx,vz]=grid.point(i);
    const d=Math.hypot(vx-x,vz-z);
    return d<best[1]?[i,d]:best;
  },[null,Infinity])[0];
  let component=[];
  const seen=new Set();
  for(const i of anchors.keys()) if(!seen.has(i)) {
    const range=grid.field([i],walk);
    const found=cells.flatMap((_,j)=>range[j]<30000?[j]:[]);
    for(const j of found) seen.add(j);
    if(found.length>component.length) component=found;
  }
  const candidates=component.filter(i=>cells[i]===t.road);
  const start=near(startHint,candidates),end=near(endHint,candidates);
  if(start===null||end===null||component.length<80||start===end) throw Error('Réseau routier inexploitable.');
  const labels=names.map(([name,lon,lat])=>[name,...project(lon,lat)]);
  return {w,h,bounds:[west,south,east,north],start,end,cells:cells.join(''),roads,rivers,parks,water,waterCutouts,buildings,labels,
    anchors:[...anchors].map(([i,[x,z]])=>[i,x,z])};
}

function osmBounds(doc) {
  if(doc.bounds) {
    const {minlon,minlat,maxlon,maxlat}=doc.bounds;
    return [minlon,minlat,maxlon,maxlat].map(Number);
  }
  const bounds=[Infinity,Infinity,-Infinity,-Infinity];
  for(const {type,lon,lat} of doc.elements) if(type==='node'&&Number.isFinite(lon)&&Number.isFinite(lat)) {
    bounds[0]=Math.min(bounds[0],lon);
    bounds[1]=Math.min(bounds[1],lat);
    bounds[2]=Math.max(bounds[2],lon);
    bounds[3]=Math.max(bounds[3],lat);
  }
  return bounds;
}

export function parseOSM(text) {
  if(text.trimStart().startsWith('{')) {
    const doc=JSON.parse(text);
    if(!Array.isArray(doc.elements)) throw Error('Ce JSON doit contenir des éléments OSM.');
    return doc;
  }
  const root=new DOMParser().parseFromString(text,'text/xml').documentElement;
  if(root.localName!=='osm') throw Error('Sélectionne un export OpenStreetMap au format .osm ou .json.');
  const num=(node,key)=>Number(node.getAttribute(key));
  const bound=root.querySelector('bounds');
  const bounds=bound?Object.fromEntries(['minlon','minlat','maxlon','maxlat'].map(k=>[k,num(bound,k)])):null;
  const elements=[];
  for(const node of root.children) {
    const type=node.localName, id=num(node,'id');
    if(type==='node') elements.push({type,id,lat:num(node,'lat'),lon:num(node,'lon')});
    if(type==='way'||type==='relation') {
      const tags={}, nodes=[], members=[];
      for(const child of node.children) {
        if(child.localName==='tag') tags[child.getAttribute('k')]=child.getAttribute('v');
        if(child.localName==='nd') nodes.push(num(child,'ref'));
        if(child.localName==='member') members.push({type:child.getAttribute('type'),ref:num(child,'ref'),role:child.getAttribute('role')});
      }
      elements.push({type,id,tags,nodes,members});
    }
  }
  return {bounds,elements};
}
