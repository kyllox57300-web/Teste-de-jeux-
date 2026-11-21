import { crossing,pointToSegment } from './placement.mjs';

export class Fortifications {
  constructor(grid,location,walkable) {
    this.grid=grid;
    this.location=location;
    this.walkable=walkable;
    this.sections=new Map();
    this.edges=new Map();
    this.near=new Map();
  }
  edge(a,b) {
    return Math.min(a,b)*(this.grid.w*this.grid.h)+Math.max(a,b);
  }
  obstruction(a,b,civilian=false) {
    if(a===b||!this.edges.size) return null;
    const crossings=this.edges.get(this.edge(a,b));
    if(!crossings) return null;
    for(const wall of crossings) if(!civilian||wall.id!=='gate'||wall.closed) return wall;
    return null;
  }
  plan(sections) {
    const unique=new Map();
    for(const s of sections) if(!this.sections.has(s.key)) unique.set(s.key,s);
    const pending=[...unique.values()];
    return {segments:pending,price:pending.reduce((total,s)=>total+s.price,0)};
  }
  add(section,hp) {
    const [x,z]=section.a,[u,v]=section.b;
    const {w,h,cell,adjacent}=this.grid;
    const i=cell(Math.max(0,Math.min(w-1,Math.round((x+u)/2))),Math.max(0,Math.min(h-1,Math.round((z+v)/2))));
    const wall={...section,id:'wall',i,hp,maxHp:hp,paid:section.price,edges:[],entrances:[],sites:[]};
    // Raster paths use subcell road anchors in Metz. Include a margin around each segment.
    for(let zz=Math.max(0,Math.floor(Math.min(z,v))-2);zz<=Math.min(h-1,Math.ceil(Math.max(z,v))+2);zz++) {
      for(let xx=Math.max(0,Math.floor(Math.min(x,u))-2);xx<=Math.min(w-1,Math.ceil(Math.max(x,u))+2);xx++) {
        const a=cell(xx,zz);
        const nearby=this.near.get(a)||new Set();
        nearby.add(wall);
        this.near.set(a,nearby);
        wall.sites.push(a);
        if(!this.walkable(a)) continue;
        for(const b of adjacent[a]) {
          if(b<=a||!this.walkable(b)) continue;
          const p=this.location(a),q=this.location(b);
          const hit=crossing(p,q,section.a,section.b);
          // The next section owns the shared endpoint.
          if(!hit||(!section.endpoint&&hit[1]>1-1e-7)) continue;
          const key=this.edge(a,b);
          const list=this.edges.get(key)||new Set();
          list.add(wall);
          this.edges.set(key,list);
          wall.edges.push(key);
          wall.entrances.push([p[0]+(q[0]-p[0])*hit[0],p[1]+(q[1]-p[1])*hit[0]]);
        }
      }
    }
    this.sections.set(section.key,wall);
  }
  remove(wall) {
    if(this.sections.get(wall.key)!==wall) return false;
    this.sections.delete(wall.key);
    for(const key of wall.edges) {
      const list=this.edges.get(key);
      list.delete(wall);
      if(!list.size) this.edges.delete(key);
    }
    for(const i of wall.sites) {
      const list=this.near.get(i);
      list.delete(wall);
      if(!list.size) this.near.delete(i);
    }
    return true;
  }
  crosses(i,a,b) {
    const nearby=this.near.get(i);
    if(!nearby) return false;
    for(const wall of nearby) if(crossing(a,b,wall.a,wall.b)) return true;
    return false;
  }
  openings(wall) {
    return wall.entrances.filter((_,i)=>{
      const neighbors=this.edges.get(wall.edges[i]);
      for(const other of neighbors) if(other!==wall&&(other.id!=='gate'||other.closed)) return false;
      return true;
    });
  }
  nearest(point,tolerance) {
    if(!point) return null;
    let best=null;
    for(const wall of this.sections.values()) {
      const distance=pointToSegment(point,wall.a,wall.b);
      if(distance<tolerance) {
        best=wall;
        tolerance=distance;
      }
    }
    return best;
  }
}
