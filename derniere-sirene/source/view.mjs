import * as T from 'three';
import { W,H,terrain as t,infected,defenses } from './data.mjs';
import {baseGrid,point,random,open} from './city.mjs';
import {buildMapArt,diffusionTexture} from './map-art.mjs';
import {within} from './placement.mjs';

const cx=(W-1)/2, cz=(H-1)/2;
const palettes={
  city:[0x8c7769,0x687e91,0xab8675,0x746d81,0xc1a28a],
  port:[0x678393,0x9c866b,0xb47063,0x749995,0x9ea2aa],
  island:[0xc09378,0x919c78,0xb7897b,0x6c8c8c,0xa0a2a8],
  industry:[0x667b87,0xb7825c,0x836967,0x7e858c,0x929679],
  suburb:[0xb59b7c,0xb77770,0x737c91,0xb98f6d,0xa497a7],
  rural:[0x9f765c,0x9ea874,0xb8a176,0x7c9682,0xb98269]
};
const atmos={
  dusk:{fog:0x252c42,sky:0xb9bbff,sun:0xffc18e,energy:2.9,ambient:2.6,x:-15,y:16,z:-11},
  night:{fog:0x121c34,sky:0x9cb7ff,sun:0x98bbff,energy:1.3,ambient:1.67,x:15,y:19,z:-16},
  day:{fog:0x374c60,sky:0xc6e2ff,sun:0xffebca,energy:2.45,ambient:2.75,x:-13,y:22,z:-10}
};
const daylight=[atmos.day,atmos.dusk,atmos.night];
const atlasSunset={...atmos.dusk,fog:0x252931,sky:0xd7dce2,sun:0xffcfaa,y:7,ambient:2.15,energy:2.7};
const tint={safe:0x50e4bc,soldier:0x86cbd4,watch:0x9ad4ea,sniper:0x9faeff,flame:0xffad61,turret:0x71c8dd,mortar:0xb2a6e8,wall:0x798c9c,barricade:0xcb894d,gate:0x77ae91,mines:0xffbc68,explosive:0xff7454,tank:0x8eb399,para:0x9dd6e8,heli:0x73caae};
const defenseMarkers={soldier:0x89d6f6,sniper:0xd4b9ff,turret:0x98ddd6,mortar:0xffbc83,mines:0xeece85,explosive:0xf99079,watch:0xa3d6f7,flame:0xf98d67};
const roofColors={safe:0x36968d,soldier:0xe48163,sniper:0x749bdc,mortar:0x9e76c9,turret:0xe5b35f,watch:0x52a0c6,flame:0xe69d73};
const atlasAngle=.43, atlasTilt=1.48;
export function atlasPlanCamera({w,h},aspect) {
  return {angle:atlasAngle,tilt:atlasTilt,zoom:Math.max(9,Math.min(w/(1.19*aspect),h/1.35))};
}
function barrierColor(u,base,time) {
  const ratio=u.hp/u.maxHp;
  if(u.lastHit!==undefined&&time-u.lastHit<.27) return 0xff8768;
  return ratio<.33?0xff785e:ratio<.68?0xf7bf7c:base;
}
const geom={
  box:new T.BoxGeometry(1,1,1),
  ball:new T.IcosahedronGeometry(.5,0),
  round:new T.CylinderGeometry(.5,.5,1,8),
  cone:new T.ConeGeometry(.5,1,6),
  flat:new T.PlaneGeometry(1,1),
  ring:new T.RingGeometry(.46,.5,56),
  thinRing:new T.RingGeometry(.491,.5,64),
};
const obj=new T.Object3D(), color=new T.Color();
const yAxis=new T.Vector3(0,1,0);
const basic=(colorValue,extra={})=>new T.MeshBasicMaterial({color:colorValue,...extra});
const shaded=new T.MeshStandardMaterial({roughness:.9});
const lit=basic(0xffffff);
const double=basic(0xffffff,{side:T.DoubleSide});

function stamp(mesh,n,x,y,z,sx,sy,sz,c,ry=0,rx=0) {
  obj.position.set(x,y,z);
  obj.rotation.set(rx,ry,0,'YXZ');
  obj.scale.set(sx,sy,sz);
  obj.updateMatrix();
  mesh.setMatrixAt(n,obj.matrix);
  mesh.setColorAt(n,color.set(c));
}
function batch(group,kind,n,material=shaded,shadow=false) {
  const mesh=new T.InstancedMesh(geom[kind],material,n);
  mesh.castShadow=shadow;
  mesh.receiveShadow=material===shaded;
  mesh.frustumCulled=false;
  mesh.count=0;
  group.add(mesh);
  return mesh;
}
function fill(mesh,items) {
  items.forEach((item,n)=>stamp(mesh,n,...item));
  mesh.count=items.length;
  mesh.instanceMatrix.needsUpdate=true;
  if(mesh.instanceColor) mesh.instanceColor.needsUpdate=true;
}
function remove(group) {
  for(const child of [...group.children]) {
    child.dispose?.();
    group.remove(child);
  }
}
const placeAt=(list,x,z,y,sx,sy,sz,c,angle=0)=>list.push([x,y,z,sx,sy,sz,c,angle]);

export class View {
  constructor(canvas, setting='medium') {
    this.canvas=canvas;
    this.renderer=new T.WebGLRenderer({canvas,antialias:setting!=='low',alpha:false,powerPreference:'high-performance'});
    this.renderer.outputColorSpace=T.SRGBColorSpace;
    this.renderer.toneMapping=T.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure=1.05;
    this.renderer.shadowMap.type=T.PCFShadowMap;
    this.scene=new T.Scene();
    this.scene.fog=new T.FogExp2(0x252c42,.016);
    this.skyBlend=new T.Color();
    this.camera=new T.PerspectiveCamera(44,1,.12,105);
    this.grid=baseGrid;
    this.focus=new T.Vector3(cx,0,cz);
    this.angle=.16; this.tilt=.96; this.zoom=27;
    this.sun=new T.DirectionalLight(0xffc18e,2);
    this.sun.target.position.set(cx,0,cz);
    this.sun.shadow.camera.left=-19;
    this.sun.shadow.camera.right=19;
    this.sun.shadow.camera.top=16;
    this.sun.shadow.camera.bottom=-16;
    this.sun.shadow.camera.far=70;
    this.sun.shadow.normalBias=.035;
    this.sun.shadow.bias=-.00015;
    this.sun.shadow.radius=2;
    this.sun.castShadow=true;
    this.sky=new T.HemisphereLight(0xc6dfff,0x50505e,2);
    this.scene.add(this.sun,this.sun.target,this.sky);
    this.city=new T.Group();
    this.scene.add(this.city);
    this.dynamic=new T.Group();
    this.scene.add(this.dynamic);
    this.people=batch(this.dynamic,'box',4096,shaded);
    this.heads=batch(this.dynamic,'ball',4096,shaded);
    this.contacts=batch(this.dynamic,'round',4096,lit);
    this.gear=batch(this.dynamic,'box',4400,shaded,true);
    this.radars=batch(this.dynamic,'ring',500,double);
    this.trails=batch(this.dynamic,'box',420,lit);
    this.debris=batch(this.dynamic,'ball',650,shaded);
    this.guides=batch(this.dynamic,'box',900,lit);
    this.flare=batch(this.dynamic,'ball',520,lit);
    this.outbreak=batch(this.dynamic,'flat',W*H,basic(0xffffff,{side:T.DoubleSide,transparent:true,opacity:.61,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));
    this.outbreak.renderOrder=1;
    this.zoneFill=new T.Mesh(new T.BufferGeometry(),basic(0xffffff,{vertexColors:true,side:T.DoubleSide,transparent:true,opacity:.32,depthWrite:false}));
    this.zoneFill.renderOrder=2;
    this.zoneFill.frustumCulled=false;
    this.zoneFill.visible=false;
    this.dynamic.add(this.zoneFill);
    this.areas=[];
    this.zoneOutline=batch(this.dynamic,'box',4600,lit);
    this.hover=new T.Mesh(geom.ring,basic(0xffd081,{side:T.DoubleSide,transparent:true,opacity:.72,depthWrite:false}));
    this.hover.rotation.x=-Math.PI/2;
    this.hover.visible=false;
    this.scene.add(this.hover);
    this.unitRange=new T.Mesh(new T.RingGeometry(.981,1,96),
      basic(0xa5e9fb,{side:T.DoubleSide,transparent:true,opacity:.85,depthTest:false,depthWrite:false,toneMapped:false}));
    this.unitCoverage=new T.Mesh(new T.CircleGeometry(1,72),
      basic(0x58bad6,{side:T.DoubleSide,transparent:true,opacity:.13,depthWrite:false}));
    this.unitRange.renderOrder=5;
    this.unitCoverage.renderOrder=2;
    this.defenseCoverage=batch(this.dynamic,'thinRing',160,basic(0xffffff,{
      side:T.DoubleSide,transparent:true,opacity:.62,depthTest:false,depthWrite:false,toneMapped:false
    }));
    this.defenseCoverage.renderOrder=4;
    for(const mesh of [this.unitRange,this.unitCoverage]) {
      mesh.rotation.x=-Math.PI/2;
      mesh.visible=false;
      this.dynamic.add(mesh);
    }
    this.ray=new T.Raycaster();
    this.floor=new T.Plane(yAxis,0);
    this.vec=new T.Vector3();
    this.fx=[];
    this.last=-1;
    this.slowFrame=0;
    this.quality(setting);
    this.resize();
  }
  quality(setting) {
    if(this.setting===setting) return;
    this.setting=setting;
    const low=setting==='low';
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, low?.85:setting==='high'?1.85:1.3));
    this.renderer.shadowMap.enabled=!low;
    this.sun.shadow.map?.dispose();
    this.sun.shadow.map=null;
    this.sun.shadow.mapSize.set(setting==='high'?2048:1024,setting==='high'?2048:1024);
    this.renderer.shadowMap.needsUpdate=true;
    this.resize();
  }
  resize() {
    const w=this.canvas.clientWidth||1,h=this.canvas.clientHeight||1;
    if(w===this.width && h===this.height && this.pixelRatio===this.renderer.getPixelRatio()) return;
    this.width=w;this.height=h;this.pixelRatio=this.renderer.getPixelRatio();
    this.renderer.setSize(w,h,false);
    this.camera.aspect=w/h;
    this.camera.updateProjectionMatrix();
    this.updateFit();
  }
  cameraAt() {
    this.camera.position.set(this.focus.x+Math.sin(this.angle)*Math.cos(this.tilt)*this.zoom,
      this.zoom*Math.sin(this.tilt),this.focus.z+Math.cos(this.angle)*Math.cos(this.tilt)*this.zoom);
    this.camera.lookAt(this.focus);
    this.camera.updateMatrixWorld();
  }
  updateFit() {
    const {w,h}=this.grid;
    this.fit=Math.max(h,w/this.camera.aspect)/(2*Math.tan(T.MathUtils.degToRad(this.camera.fov/2)))*1.08;
  }
  reset(title=false) {
    this.angle=title?-.52:this.tactical?0:.16;
    this.tilt=title?(this.map.art?1.15:.63):this.tactical?(this.map.art?1.48:1.45):.99;
    const {w,h}=this.grid;
    this.updateFit();
    this.zoom=this.map.art?(title?Math.min(this.fit*.78,94):this.fit):title?30:this.tactical?(this.camera.aspect<1?41:29):(this.camera.aspect<1?35:27);
    this.focus.set(title&&!this.map.art?10.5:(w-1)/2,0,title&&!this.map.art?7:(h-1)/2);
    if(this.atlasPlan) {
      const opening=atlasPlanCamera(this.grid,this.camera.aspect);
      this.angle=opening.angle;
      this.tilt=this.tactical?opening.tilt:.99;
      this.zoom=opening.zoom;
      const [x,z]=this.grid.point(this.map.end);
      this.focus.x=T.MathUtils.lerp(this.focus.x,x,.18);
      this.focus.z=T.MathUtils.lerp(this.focus.z,z,.18);
    }
    this.cameraAt();
  }
  overview() {
    this.angle=0;
    this.zoom=this.fit;
    this.focus.set((this.grid.w-1)/2,0,(this.grid.h-1)/2);
    this.cameraAt();
  }
  switchProjection() {
    this.tactical=!this.tactical;
    this.tilt=this.tactical?(this.map.art?1.48:1.45):.99;
    this.angle=this.atlasPlan?atlasAngle:this.tactical?0:.16;
    this.city.scale.y=this.tactical?.69:1;
    this.renderer.shadowMap.needsUpdate=true;
    this.cameraAt();
  }
  focusAt(i) {
    const [x,z]=this.grid.point(i);
    this.focus.set(x,0,z);
    this.cameraAt();
  }
  worldAt(x,y,height=0) {
    const rect=this.canvas.getBoundingClientRect();
    this.ray.setFromCamera({x:(x-rect.left)/rect.width*2-1,y:1-(y-rect.top)/rect.height*2},this.camera);
    this.floor.constant=-height;
    return this.ray.ray.intersectPlane(this.floor,this.vec)?[this.vec.x,this.vec.z]:null;
  }
  planHeight() { return this.tactical&&this.map.art?1.46:.034; }
  drawPoint(x,y) {
    const p=this.worldAt(x,y,this.planHeight());
    if(!p) return null;
    const {w,h}=this.grid;
    return [T.MathUtils.clamp(p[0],-.5,w-.5),T.MathUtils.clamp(p[1],-.5,h-.5)];
  }
  wallAt(game,x,y) {
    const plane=this.tactical&&this.map.art?this.planHeight()+.08:.24;
    const limit=T.MathUtils.clamp(this.zoom/Math.max(240,this.height)*8,.23,1.08);
    return game.walls.nearest(this.worldAt(x,y,plane),limit);
  }
  roofAt(x,y) {
    const buildings=this.map.buildings;
    if(!buildings) return null;
    const ground=this.worldAt(x,y);
    if(!ground) return null;
    this.floor.constant=-2*this.city.scale.y;
    const top=this.ray.ray.intersectPlane(this.floor,this.vec);
    if(!top) return null;
    let nearest=null;
    for(const site of buildings.near(ground,[top.x,top.z])) {
      if(nearest&&site.height<nearest.height) continue;
      this.floor.constant=-this.roofHeight(site);
      const hit=this.ray.ray.intersectPlane(this.floor,this.vec);
      if(hit&&within([hit.x,hit.z],site.polygon)) nearest=site;
    }
    return nearest;
  }
  roofHeight(site) { return site.height*this.city.scale.y; }
  pick(x,y,snap=true) {
    const p=this.worldAt(x,y);
    if(!p) return -1;
    const xx=Math.round(p[0]),zz=Math.round(p[1]);
    const {w,h,cell}=this.grid;
    if(xx<0||zz<0||xx>=w||zz>=h) return -1;
    const here=cell(xx,zz);
    if(!snap||!this.map.art||open(this.map.cells,here)) return here;
    let closest=here, distance=.97;
    for(let z=Math.max(0,zz-1);z<=Math.min(h-1,zz+1);z++) for(let x=Math.max(0,xx-1);x<=Math.min(w-1,xx+1);x++) {
      const i=cell(x,z);
      if(!open(this.map.cells,i)) continue;
      const [a,b]=this.location(i);
      const d=Math.hypot(a-p[0],b-p[1]);
      if(d<distance) {closest=i;distance=d;}
    }
    return closest;
  }
  project(x,z,height=.55) {
    this.vec.set(x,height,z).project(this.camera);
    return [(this.vec.x+1)*.5*this.width,(1-this.vec.y)*.5*this.height,this.vec.z<1];
  }
  pan(dx,dy) {
    const scale=this.zoom/Math.max(300,this.height)*.83;
    const a=this.angle;
    this.focus.x=T.MathUtils.clamp(this.focus.x+(-Math.cos(a)*dx-Math.sin(a)*dy)*scale,0,this.grid.w-1);
    this.focus.z=T.MathUtils.clamp(this.focus.z+(Math.sin(a)*dx-Math.cos(a)*dy)*scale,0,this.grid.h-1);
    this.cameraAt();
  }
  zoomBy(v) {
    this.zoom=T.MathUtils.clamp(this.zoom*v,9,this.map.art?this.fit*1.23:(this.camera.aspect<1?46:38));
    this.cameraAt();
  }
  location(i) { return this.map.anchors?.[i]||this.grid.point(i); }
  build(game, title=false) {
    this.map=game.map;
    this.grid=game.grid;
    this.camera.far=this.map.art?290:105;
    this.camera.updateProjectionMatrix();
    this.sun.target.position.set((this.grid.w-1)/2,0,(this.grid.h-1)/2);
    this.tactical=!title&&!!game.mission.containment;
    const atlas=!!game.mission.atlas;
    this.atlasPlan=!title&&atlas;
    this.commandOrigin=-1;
    this.activeZone=null;
    this.placementPreview=null;
    this.hoverWall=null;
    this.hoverRoof=null;
    this.showEntrances=false;
    this.showCoverage=false;
    this.inspected=null;
    this.selectedUnit=null;
    this.hover.visible=false;
    this.city.scale.y=this.tactical?.69:1;
    const night=game.mission.light==='night';
    this.light=atmos[game.mission.light]||atmos.dusk;
    if(game.mission.atlas&&!night) this.light=atlasSunset;
    this.scene.background=new T.Color(this.light.fog);
    this.scene.fog.color.copy(this.scene.background);
    this.scene.fog.density=this.map.art?.0027:.016;
    const reuseArt=this.map.art&&this.art===this.map.art&&this.artNight===night&&this.artAtlas===atlas;
    if(!reuseArt) {
      this.mapArt?.dispose();
      this.mapArt=null;
      remove(this.city);
    }
    this.art=this.map.art;
    this.artNight=night;
    this.artAtlas=atlas;
    this.zoneFill.material.opacity=this.atlasPlan?.24:.32;
    this.fx.length=0;
    this.last=-1;
    if(this.map.art) {
      if(!reuseArt) this.mapArt=buildMapArt(this.city,this.map.art,night,atlas);
      if(!this.diffusion) {
        this.diffusion=batch(this.dynamic,'flat',112*112,
          basic(0xffffff,{map:diffusionTexture(),transparent:true,opacity:.79,side:T.DoubleSide,depthWrite:false,toneMapped:false}));
        this.diffusion.renderOrder=1;
      }
    } else this.cityParts(game);
    this.renderer.shadowMap.needsUpdate=true;
    this.reset(title);
  }
  cityParts(game) {
    const {cells,seed}=game.map;
    const rng=random(seed+11);
    const {theme,light}=game.mission;
    const pal=palettes[theme]||palettes.city;
    const city=theme==='city', factory=theme==='industry', port=theme==='port';
    const night=light==='night', green=theme==='rural'||theme==='suburb';
    const solids=[],lum=[],ground=[],cones=[],balls=[],water=[],lamps=[],tanks=[];
    placeAt(ground,cx,cz,-.28,W+.72,.35,H+.72,0x323c4e);
    placeAt(ground,cx,cz,-.56,W+.25,.2,H+.25,0x485166);
    placeAt(ground,cx,cz,-.87,185,.2,185,0x222c43);
    for(let i=0;i<cells.length;i++) {
      const [x,z]=point(i);
      const type=cells[i],r=rng();
      if(type===t.water || type===t.bridge) {
        placeAt(ground,x,z,-.13,1.005,.08,1.005,0x24627a);
        for(let n=0;n<3;n++) placeAt(water,x+(rng()-.5)*.8,z+(rng()-.5)*.95,-.079,.13+rng()*.38,.008,.018,0x6aa6b9);
        if(type===t.water) continue;
      }
      const isRoad=type===t.road||type===t.bridge;
      let surface=0x414957;
      if(type===t.block) surface=0x77747c;
      if(type===t.park) surface=green?0x59745a:0x506c60;
      placeAt(ground,x,z,isRoad?-.058:.005,1.008,.105,1.008,surface);
      if(type===t.bridge) {
        for(const s of [-1,1]) {
          placeAt(solids,x,z+s*.42,.10,.99,.145,.065,0x91a3a6);
          placeAt(lum,x,z+s*.36,.015,.91,.012,.025,0xffc579);
        }
      }
      if(type===t.block) {
        const houseColor=pal[Math.floor(r*pal.length)];
        const tall=city&&r>.69;
        const height=(tall?1.35:(green?.31:factory?.44:.54))+(tall?1.42:green?.47:.7)*rng();
        const width=factory || port?.81:.61+rng()*.18;
        const depth=.59+rng()*.23;
        placeAt(ground,x,z,.07,.91,.11,.89,0x87858b);
        placeAt(solids,x,z,height/2+.07,width,height,depth,houseColor);
        placeAt(solids,x,z,height+.09,width+.045,.085,depth+.045,green?0x4f5261:0x424a62);
        if(green && r>.4) placeAt(cones,x,z,height+.22,width*1.15,.3,depth*1.09,0x70505e,Math.PI/4);
        if(r>.3 || factory) {
          placeAt(solids,x+.14,z-.14,height+.17,.22,.13,.23,0x9497a1);
          if(tall) placeAt(solids,x+.14,z-.14,height+.32,.035,.31,.035,0xd0aeb2);
        }
        if(port && r<.29) for(let n=0;n<3;n++) placeAt(solids,x,z,height+.18+n*.04,width*.85,.09,.26,pal[(n+2)%pal.length]);
        if(factory && r>.66) {
          placeAt(tanks,x+.18,z+.15,height+.36,.31,.57,.31,0x9b9695);
          placeAt(tanks,x+.18,z+.15,height+.67,.37,.07,.37,0x4e5361);
        }
        if(port && z>=14 && r>.63) {
          placeAt(solids,x-.25,z,height+.56,.08,1,.08,0xe8ae6f);
          placeAt(solids,x+.07,z,height+1.02,.76,.08,.08,0xd69f63);
          placeAt(solids,x+.39,z,height+.76,.023,.48,.023,0x57596d);
        }
        for(let floor=.24;floor<height-.03;floor+=.29) for(const off of [-.18,.03,.23]) {
          const window=rng()>(night?.44:.86)?0xffcb79:0x555e76;
          placeAt(lum,x+off,z+depth/2+.008,floor,.105,.094,.014,window);
          placeAt(lum,x-width/2-.007,z+off,floor,.013,.094,.10,window);
        }
      }
      if(type===t.park) {
        for(let n=0;n<(r>.68?3:1);n++) {
          const tx=x+(rng()-.5)*.72,tz=z+(rng()-.5)*.72;
          const h=.35+rng()*.34;
          placeAt(solids,tx,tz,h*.29,.075,h*.55,.075,0x69524d);
          placeAt(balls,tx,tz,h*.84,.42,h*.85,.40, n%2?0x719384:green?0x68915b:0x538472);
          placeAt(balls,tx+.09,tz-.08,h*1.05,.28,h*.67,.28,0x81a086);
        }
      }
      if(isRoad) {
        const east=x<W-1&&open(cells,i+1), south=z<H-1&&open(cells,i+W);
        if(east) placeAt(ground,x,z,.002,.39,.008,.025,0x7a7474);
        if(south) placeAt(ground,x,z,.003,.025,.008,.39,0x7a7474);
        if(east&&south&&x>0&&z>0&&open(cells,i-1)&&open(cells,i-W)) {
          for(let j=-2;j<=2;j++) {
            placeAt(ground,x+j*.10,z+.32,.014,.053,.008,.15,0xaaa5a1);
            placeAt(ground,x+.32,z+j*.10,.014,.15,.008,.053,0xaaa5a1);
          }
        }
        if(r>.87) {
          placeAt(solids,x-.39,z+.37,.26,.027,.52,.027,0x2d3446);
          placeAt(lamps,x-.35,z+.37,.53,.11,.031,.068,0xffc17b);
        }
        if(r<.075) {
          const angle=east?Math.PI/2:0;
          placeAt(solids,x-.20,z-.20,.07,.19,.12,.38,pal[(i+2)%pal.length],angle);
          placeAt(solids,x-.20,z-.20,.142,.16,.045,.205,0x37485b,angle);
        }
      }
    }
    this.waterItems=water;
    this.waterMesh=batch(this.city,'box',water.length||1,lit);
    fill(this.waterMesh,water);
    this.lampItems=lamps;
    this.lampMesh=batch(this.city,'box',lamps.length||1,lit);
    fill(this.lampMesh,lamps);
    fill(batch(this.city,'box',ground.length,shaded),ground);
    fill(batch(this.city,'box',solids.length,shaded,true),solids);
    fill(batch(this.city,'box',lum.length,lit),lum);
    fill(batch(this.city,'cone',cones.length||1,shaded,true),cones);
    fill(batch(this.city,'ball',balls.length||1,shaded,true),balls);
    fill(batch(this.city,'round',tanks.length||1,shaded,true),tanks);
  }
  highlight(i,id,allowed) {
    this.hover.visible=i>=0 && !!id;
    if(!this.hover.visible) return;
    const [x,z]=this.location(i);
    const d=defenses[id];
    const radius=d?.range||({air:2.3,missile:2.25,gas:2.5,heli:3.8,tank:4.5,para:1})[id]||.52;
    this.hover.position.set(x,.086,z);
    this.hover.scale.setScalar(radius*2.03);
    this.hover.material.color.set(allowed?0x79f4d1:0xff9981);
  }
  showUnitRange(game,outline) {
    const unit=this.selectedUnit;
    const visible=game.hasBuildingDefense(unit);
    this.unitRange.visible=this.unitCoverage.visible=visible;
    if(!visible) return;
    const {range}=game.combatStats(unit);
    const [x,z]=game.location(unit.i);
    for(const mesh of [this.unitRange,this.unitCoverage]) {
      mesh.position.set(x,.092,z);
      mesh.scale.setScalar(range);
    }
    const site=unit.building, y=this.roofHeight(site)+.027;
    for(const [i,point] of site.polygon.entries()) {
      this.segment(outline,site.polygon.at(i-1),point,y,.023,.085,0xffdd9e);
    }
  }
  showDefenseCoverage(game) {
    const visible=this.showCoverage&&game.phase==='prep';
    this.defenseCoverage.visible=visible;
    if(!visible) return;
    const rings=[];
    const add=(unit,c)=>{
      const {range}=game.combatStats(unit),[x,z]=game.location(unit.i);
      rings.push([x,.10,z,range*2,range*2,1,c,0,-Math.PI/2]);
    };
    for(const unit of game.units.values()) if(defenses[unit.id].range) add(unit,0x8bcbe9);
    const plan=this.placementPreview;
    if(plan?.kind==='roof-batch') for(const {site,i} of plan.placements||[]) {
      add({id:plan.id,i,building:site,level:1},0xffcd8c);
    }
    fill(this.defenseCoverage,rings.slice(0,this.defenseCoverage.instanceMatrix.count));
  }
  addEffects(events) {
    for(const {type,i,id,from} of events) {
      if(this.atlasPlan&&type==='siren') continue;
      if(['wave','breach','boss','gas','blast','impact','infected','flame','shot','spit','infect','collapse','rescue','support','siren','level','build','convoy','repair','flash','decoy'].includes(type)) {
        this.fx.push({type,i,id,from,age:0,seed:Math.random()*1000});
      }
    }
    if(this.fx.length>130) this.fx.splice(0,this.fx.length-130);
  }
  render(game,now,dt,title=false, paused=false) {
    this.resize();
    if(title) { this.angle=-.52+Math.sin(now*.19)*.085; this.cameraAt(); }
    const progression=game.mission.atlas?0:Math.max(0,game.time-12)/93;
    const segment=(daylight.indexOf(this.light)+Math.floor(progression))%daylight.length;
    const light=game.mission.atlas?this.light:daylight[segment], next=game.mission.atlas?light:daylight[(segment+1)%daylight.length];
    const cycle=T.MathUtils.smoothstep(progression%1,0,1);
    const mix=T.MathUtils.lerp;
    this.sun.color.set(light.sun).lerp(this.skyBlend.set(next.sun),cycle);
    this.sun.position.set((this.grid.w-1)/2+mix(light.x,next.x,cycle),mix(light.y,next.y,cycle),(this.grid.h-1)/2+mix(light.z,next.z,cycle));
    this.sun.intensity=mix(light.energy,next.energy,cycle);
    this.sky.color.set(light.sky).lerp(this.skyBlend.set(next.sky),cycle);
    this.sky.intensity=mix(light.ambient,next.ambient,cycle);
    this.scene.background.set(light.fog).lerp(this.skyBlend.set(next.fog),cycle);
    this.scene.fog.color.copy(this.scene.background);
    if(!this.map.art&&game.bridgeDamage.size!==this.last&&game.bridgeDamage.size) {
      remove(this.city);
      this.cityParts(game);
      this.last=game.bridgeDamage.size;
    }
    const bodies=[],heads=[],contacts=[],gear=[],marks=[],trace=[],particles=[],hot=[],routes=[],heat=[],areas=[],outline=[];
    const detail=this.setting!=='low'||this.zoom<18;
    const reduced=this.crowd==='low'||(this.crowd==='auto'&&(this.width<700||this.setting==='low'));
    for(const list of [game.civs,game.visibleZombies]) for(const p of list) {
      if(bodies.length+contacts.length>=4096) break;
      const spec=infected[p.id];
      if(reduced&&list.length>160&&p.visualID%3!==0) continue;
      const s=spec?.size||.91;
      if(this.tactical) {
        const marker=this.map.art?(spec?.size||1)*(spec?.32:.25):(spec?.size||1)*(p.id==='fast'?.31:.19);
        placeAt(contacts,p.x,p.z,.12,marker,.041,marker,spec?(game.mission.atlas?0xf6aaff:0xff795b):0xf6f3e6);
        if(p.id==='boss') placeAt(hot,p.x,p.z,.37,.46,.46,.46,0xff512f);
        continue;
      }
      const bob=.016*Math.sin(now*16+p.ox*21)*s;
      const body=spec?(game.mission.atlas?0xcf6df9:spec.color):0xb1e3cd;
      placeAt(bodies,p.x,p.z,.17*s+bob,.14*s,.22*s,.11*s,body,p.angle);
      if(detail||p.id==='boss') placeAt(heads,p.x,p.z,.32*s+bob,.13*s,.145*s,.13*s,spec?body:0xf4c3a6,p.angle);
      if(p.id==='boss') {
        placeAt(gear,p.x,p.z,.33,.78,.16,.18,0xb1527b,p.angle);
        placeAt(hot,p.x,p.z,.96,.5,.04,.08,0xff5b5b);
      }
    }
    const flatPlan=this.tactical&&!!this.map.art;
    const atlasPlan=flatPlan&&this.atlasPlan;
    const planHeight=this.planHeight();
    this.showUnitRange(game,outline);
    this.showDefenseCoverage(game);
    const roofs=new Map();
    for(const u of game.units.values()) if(u.id==='safe') {
      for(const site of u.roofs||[]) roofs.set(site.id,roofColors.safe);
      if(u.building) roofs.set(u.building.id,roofColors.safe);
    }
    for(const site of this.placementPreview?.roofs||[]) if(!roofs.has(site.id)) roofs.set(site.id,0x78c8bb);
    if(this.placementPreview?.kind==='roof-batch') {
      for(const {site} of this.placementPreview.placements) roofs.set(site.id,0xf4aa7c);
    }
    for(const {contour} of game.waitingZones) {
      areas.push({points:contour,c:0x52cef7,y:planHeight});
      for(let i=0;i<contour.length;i++) this.segment(outline,contour.at(i-1),contour[i],planHeight+.04,.024,.075,0x89e3ff);
    }
    if(this.map.art) for(const i of game.bridgeDamage) {
      const [x,z]=this.location(i);
      placeAt(outline,x,z,planHeight+.04,.63,.03,.69,0x26223b,Math.PI/4);
    }
    for(const u of game.units.values()) {
      if(u.building) {
        if(u.id!=='safe') roofs.set(u.building.id,roofColors[u.id]);
      } else if(this.atlasPlan&&u.id==='safe') {
        const [x,z]=this.location(u.i);
        placeAt(outline,x,z,.034,.10,.035,.54,0x8debd4);
        placeAt(outline,x,z,.035,.54,.035,.10,0x8debd4);
      } else this.unit(gear,marks,hot,u,now);
      if(atlasPlan&&!u.building&&defenseMarkers[u.id]) {
        const [x,z]=this.location(u.i);
        placeAt(outline,x,z,.034,.94,.025,.94,0x26333b,Math.PI/4);
        placeAt(outline,x,z,.066,.76,.028,.76,defenseMarkers[u.id],Math.PI/4);
      }
      if(u.contour) {
        const chosen=u===this.activeZone||u===this.inspected;
        const c=atlasPlan?(chosen?0x96ebff:0x6dc5e5):(chosen?0x82f7d1:0x44c69a);
        areas.push({points:u.contour,c:atlasPlan?0x247d9a:c,y:atlasPlan?.048:planHeight});
        for(const s of u.edge) if(!game.walls.sections.has(s.key)) {
          this.perimeter(outline,s.a,s.b,planHeight+.03,c,atlasPlan?.10:.062,atlasPlan);
        }
      }
      if(flatPlan&&defenses[u.id]?.barrier) {
        const [x,z]=this.location(u.i);
        const a=u.angle;
        if(u.id==='gate'&&!u.closed) {
          const c=barrierColor(u,atlasPlan?0xffca7b:0x72ffd0,game.time);
          for(const side of [-1,1]) placeAt(outline,x+side*Math.cos(a)*.36,z-side*Math.sin(a)*.36,
            planHeight+.08,.31,.022,atlasPlan?.24:.13,c,a);
        } else placeAt(outline,x,z,planHeight+.08,1,.023,.13,barrierColor(u,u.closed?0xeeab64:0xd5dce3,game.time),a);
      }
    }
    if(this.hoverRoof) {
      const {site,allowed,id}=this.hoverRoof;
      if(allowed) roofs.set(site.id,roofColors[id]);
      else if(!roofs.has(site.id)) roofs.set(site.id,0xa05050);
    }
    this.mapArt?.mark(roofs);
    for(const wall of game.walls.sections.values()) {
      const focused=this.hoverWall===wall||this.inspected===wall;
      const base=wall.id==='gate'?(wall.closed?0xf0aa59:atlasPlan?0xffc979:0x72ffd0):atlasPlan?0x72d7ff:0xd8e3e8;
      const c=barrierColor(wall,focused?0xffdc9d:base,game.time);
      if(wall.id==='gate'&&!wall.closed) {
        const [x,z]=wall.a,[u,v]=wall.b;
        const at=k=>[x+(u-x)*k,z+(v-z)*k];
        const pieces=[[wall.a,at(.22)],[at(.78),wall.b]];
        for(const [a,b] of pieces) {
          this.segment(gear,a,b,.225,.45,.17,c);
          if(flatPlan||focused) this.perimeter(outline,a,b,flatPlan?planHeight+.08:.48,c,atlasPlan?.24:.16,atlasPlan);
        }
        if(atlasPlan) this.segment(outline,at(.24),at(.76),planHeight+.073,.018,.053,0xffd697);
        this.segment(gear,wall.a,wall.b,.47,.055,.15,0x75edc3);
      } else {
        this.segment(gear,wall.a,wall.b,.21,.42,.17,c);
        if(flatPlan||focused) this.perimeter(outline,wall.a,wall.b,flatPlan?planHeight+.08:.46,c,atlasPlan?.17:wall.closed?.18:.13,atlasPlan);
      }
      if(this.showEntrances&&wall.id==='wall') for(const [x,z] of game.walls.openings(wall)) {
        const size=atlasPlan?.29:.16;
        if(atlasPlan) placeAt(outline,x,z,planHeight+.101,size+.1,.026,size+.1,0x25333b,Math.PI/4);
        placeAt(outline,x,z,flatPlan?planHeight+.13:.48,size,.025,size,0x8fffd3,Math.PI/4);
      }
    }
    if(this.placementPreview) {
      const p=this.placementPreview;
      const c=p.error?0xf58970:p.kind==='roof-batch'?0xffcb9f:p.kind==='waiting'?0x89e3ff:atlasPlan?0xa0edff:0xa5ffe1;
      if(['safe','waiting','roof-batch'].includes(p.kind)) {
        const path=p.contour;
        if(p.kind==='roof-batch'&&!p.error) areas.push({points:path,c,y:.05});
        else if(p.validShape) areas.push({points:path,c,y:planHeight+.025});
        for(let i=1;i<path.length;i++) this.segment(outline,path[i-1],path[i],planHeight+.062,.025,.085,c);
        if(path.length>2) this.segment(outline,path.at(-1),path[0],planHeight+.059,.018,.052,c);
      } else {
        for(const s of p.segments) this.segment(outline,s.a,s.b,planHeight+.08,.024,.12,c);
      }
    }
    for(const m of game.marches) {
      this.unit(gear,marks,hot,m.u,now,[m.x,m.z],m.angle);
      const [x,z]=this.location(m.to);
      if(this.tactical) marks.push([x,.038,z,.88,.88,1,0x99d6fc,0,-Math.PI/2]);
    }
    if(game.units.has(this.commandOrigin)) {
      const [x,z]=this.location(this.commandOrigin);
      marks.push([x,.055,z,1.22,1.22,1,0x94efdd,0,-Math.PI/2]);
    }
    for(const r of game.reinf) if(['heli','tank','para'].includes(r.id)&&game.time>=r.t) this.unit(gear,marks,hot,r,now);
    for(const g of game.clouds) {
      for(let n=0;n<10;n++){
        const a=n*.87+now*.45;
        placeAt(particles,g.x+Math.cos(a)*(1+n%3*.37),g.z+Math.sin(a)*(1+n%3*.37),.18+Math.sin(a*2)*.08,.52,.21,.52,0x92a75b);
      }
    }
    const fog=game.visibleFog;
    for(let i=0;fog&&i<fog.length;i++) {
      const v=fog[i];
      if(v<.16 || !open(game.map.cells,i)) continue;
      const [x,z]=this.location(i);
      const c=game.mission.atlas?(v>.69?0xbe39ff:v>.35?0x944adc:0x7248b3)
        :this.tactical?(v>.69?0xc65340:v>.35?0x953d37:0x633632):(v>.69?0xe77740:v>.35?0xab5753:0x764755);
      const size=this.map.art?1.03+v*1.68:.91;
      heat.push([x,.026,z,size,size,1,c,0,-Math.PI/2]);
    }
    if(game.guide.length) {
      const atlas=game.mission.atlas;
      for(const [n,i] of game.guide.entries()) {
        const [x,z]=this.location(i);
        const prev=game.guide[n-1];
        const endpoint=n===0||n===game.guide.length-1;
        const size=atlas?(endpoint?.39:.24):.15;
        const color=atlas&&game.guideBlocked(i,i)?0xffb35d:0x6bfad6;
        placeAt(routes,x,z,atlas?.075:.049,size,.02,size,color,atlas?Math.PI/4:0);
        if(prev!==undefined&&this.grid.dist(i,prev)===1) {
          const [px,pz]=this.location(prev);
          if(atlas&&game.guideBlocked(prev,i)) {
            placeAt(routes,(px+x)/2,Math.max(.53,planHeight+.18),(pz+z)/2,.41,.035,.41,0xffb35d,Math.PI/4);
          } else {
            const dx=x-px,dz=z-pz;
            placeAt(routes,(px+x)/2,atlas?.065:.042,(pz+z)/2,atlas?.15:this.map.art?.12:.047,
              .012,Math.hypot(dx,dz),0x4cb5ac,Math.atan2(dx,dz));
          }
        }
      }
    }
    if(!title&&!game.mission.atlas&&game.clearedAt===null&&(game.combat||game.phase==='prep')) {
      const [x,z]=this.location(game.map.start);
      const signal=(now*1.45)%1;
      const width=.74+signal*1.65;
      const c=signal<.55?0xffa571:0x964c49;
      marks.push([x,.042,z,width,width,1,c,0,-Math.PI/2]);
      if(game.mission.containment&&game.phase==='prep') marks.push([x,.043,z,4.5,4.5,1,c,0,-Math.PI/2]);
    }
    for(const fx of this.fx) {
      if(!paused) fx.age+=dt;
      this.effect(fx,trace,particles,hot,now);
    }
    this.fx=this.fx.filter(f=>f.age<3.5);
    if(!this.map.art&&this.setting!=='low'&&now-this.slowFrame>.11) {
      for(const [i,item] of this.waterItems.entries()) {
        const [x,y,z,sx,sy,sz,c]=item;
        stamp(this.waterMesh,i,x+Math.sin(now+i)*.043,y,z,sx*(.82+.18*Math.sin(now+i)),sy,sz,c);
      }
      this.waterMesh.instanceMatrix.needsUpdate=true;
      for(let i=0;i<this.lampItems.length;i+=7) {
        const flash=Math.sin(now*20+i)+Math.sin(now*6+i*4);
        this.lampMesh.setColorAt(i,color.set(flash>-.9?0xffcf8c:0x746d7e));
      }
      if(this.lampMesh.instanceColor) this.lampMesh.instanceColor.needsUpdate=true;
      this.slowFrame=now;
    }
    this.paintAreas(areas);
    for(const [mesh,array] of [[this.people,bodies],[this.heads,heads],[this.contacts,contacts],[this.gear,gear],[this.radars,marks],[this.trails,trace],[this.debris,particles],[this.flare,hot],[this.outbreak,this.map.art?[]:heat],[this.diffusion,this.map.art?heat:[]],[this.guides,routes],[this.zoneOutline,outline]]) {
      if(mesh) fill(mesh,array.length>mesh.instanceMatrix.count?array.slice(0,mesh.instanceMatrix.count):array);
    }
    this.renderer.render(this.scene,this.camera);
  }
  segment(items,a,b,y,height,width,c) {
    const dx=b[0]-a[0],dz=b[1]-a[1];
    placeAt(items,(a[0]+b[0])/2,(a[1]+b[1])/2,y,Math.hypot(dx,dz)+.023,height,width,c,-Math.atan2(dz,dx));
  }
  perimeter(items,a,b,y,c,width,tactical) {
    if(tactical) this.segment(items,a,b,y-.021,.025,width+.14,0x254655);
    this.segment(items,a,b,y,.025,width,c);
  }
  paintAreas(areas) {
    if(areas.length===this.areas.length&&areas.every(({points,c,y},i)=>
        points===this.areas[i].points&&c===this.areas[i].c&&y===this.areas[i].y)) return;
    this.areas=areas;
    const positions=[],colors=[];
    for(const {points,c,y} of areas) {
      const polygon=points.map(([x,z])=>new T.Vector2(x,z));
      color.set(c);
      for(const face of T.ShapeUtils.triangulateShape(polygon,[])) for(const i of face) {
        positions.push(polygon[i].x,y,polygon[i].y);
        colors.push(color.r,color.g,color.b);
      }
    }
    this.zoneFill.geometry.dispose();
    const geometry=new T.BufferGeometry();
    geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
    geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));
    this.zoneFill.geometry=geometry;
    this.zoneFill.visible=positions.length>0;
  }
  unit(gear,marks,hot,u,now,position=this.location(u.i),facing=u.angle) {
    const [x,z]=position, id=u.id;
    const c=tint[id]||0xa7d9e2;
    const box=(y,sx,sy,sz,k=c,angle=0,dx=0,dz=0)=>placeAt(gear,x+dx,z+dz,y,sx,sy,sz,k,angle);
    const marker=(radius,c)=>marks.push([x,.041,z,radius,radius,1,c,0,-Math.PI/2]);
    if(id==='safe') {
      box(.12,.72,.23,.72,0x254655);
      box(.28,.63,.12,.60,c);
      box(.354,.10,.02,.39,0xf1ffeb);
      box(.355,.38,.02,.10,0xf1ffeb);
      marker(1.06,0x72ecc5);
    } else if(id==='heli') {
      const y=1.21+.09*Math.sin(now*2.5);
      box(y,.37,.21,.68);
      box(y,.093,.072,.76,c,0,0,-.46);
      box(y+.13,1.6,.028,.067,0x97b5ce, now*16);
      box(y+.04,.84,.026,.075,0x93bed1,now*13);
      marker(1,0x72ecc5);
    } else if(id==='wall'||id==='barricade'||id==='gate') {
      const a=facing||0;
      box(.05,.98,.07,.3,0x314457,a);
      if(id==='gate'&&!u.closed) {
        box(.44,.95,.09,.18,0x9ee7bf,a);
        for(const side of [-1,1]) box(.22,.19,.43,.25,c,a,side*.37*Math.cos(a),-side*.37*Math.sin(a));
        box(.095,.47,.03,.18,0x66efbf,a);
      } else {
        box(.23,.98,id==='barricade'?.25:.39,.25,u.closed?0xe5a760:c,a);
        box(.39,.98,.055,.26,id==='wall'?0xbecbd2:0xf1b879,a);
      }
    } else if(id==='mines'||id==='explosive') {
      for(const [dx,dz] of [[-.17,.16],[.19,.13],[0,-.21]]) {
        box(.075,.20,.12,.19,0x504752,0,dx,dz);
        if(Math.sin(now*4+dx*13)>0) placeAt(hot,x+dx,z+dz,.15,.075,.075,.075,c);
      }
      marker(.75,c);
    } else {
      const height=id==='watch'?.58:id==='tank'?.26:.19;
      box(.07,.58,.13,.56,0x344d5e);
      box(height*.68,id==='watch'?.24:.43,height,.38,c);
      const a=facing||0;
      box(height+.12,.35,.15,.30,c,a);
      if(id==='para') box(height+.11,.15,.23,.16,0xabdfec,0,-.22,.12);
      box(height+.16,.093,.074,id==='sniper'?.51:.37,0x2c3953,a,Math.sin(a)*.21,Math.cos(a)*.21);
      marker(.83,0x51889a);
    }
    if(u.level>1) for(let n=1;n<u.level;n++) placeAt(hot,x-.23+n*.14,z+.28,.43,.08,.075,.08,0xffd67b);
  }
  effect(fx,trace,particles,hot,now) {
    const [x,z]=this.location(fx.i), a=fx.age;
    if(fx.type==='shot'||fx.type==='spit') {
      if(a>.22) return;
      const [u,v]=this.location(fx.from);
      const d=Math.hypot(u-x,v-z);
      const c=fx.type==='spit'?0xbb94ff:0xffd68c;
      placeAt(trace,(x+u)/2,(z+v)/2,.29,.026,.025,d,c,Math.atan2(x-u,z-v));
      placeAt(hot,x,z,.28,.115,.115,.115,c);
      placeAt(particles,u+.14+a,v-.16,.2+a*.65,.05,.055,.09,0xcba564);
    } else if(['convoy','repair','decoy','flash'].includes(fx.type)&&a<1.55) {
      const radius=.16+Math.sqrt(a)*(fx.type==='repair'?1.1:1.7);
      for(let n=0;n<16;n++) {
        const angle=n*Math.PI/8+a*.7;
        placeAt(hot,x+Math.cos(angle)*radius,z+Math.sin(angle)*radius,.13,.14,.12,.14,fx.type==='flash'?0xffffcd:0x77e7c7);
      }
    } else if(['blast','impact','infected','flame','collapse'].includes(fx.type)) {
      const fire=fx.type==='flame';
      const scale=fx.type==='impact'&&this.map.art?1.8:1;
      const max=this.setting==='low'?4:fire?5:12;
      for(let n=0;n<max;n++) {
        const th=n*2.399+fx.seed, rad=(n%4+1)*a*.49*scale;
        const y=.18+Math.max(0,Math.sin(Math.min(1,a)*Math.PI*.85))*(n%3+1)*.47;
        if(a<.56) {
          const s=(this.tactical?.29+.115*(n%4):.38+.18*(n%5))*(1-a)*(fire?.56:scale);
          placeAt(hot,x+Math.cos(th)*rad,z+Math.sin(th)*rad,y,s,s*1.1,s,n%2?0xffbb54:0xff713d);
        }
        if(!fire && a<2.8) {
          const s=(.34+.052*n)*(1-a/3.2);
          placeAt(particles,x+Math.cos(th)*rad*.63,z+Math.sin(th)*rad*.63,y+a*.31,s,s,s,n%2?0x4c4b58:0x666475);
          if(a<.91) placeAt(particles,x+Math.cos(th)*rad*1.9,z+Math.sin(th)*rad*1.9,y,.065,.067,.089,0xaa765b);
        }
      }
    } else if(fx.type==='support' && a<1.8) {
      const scale=this.map.art?2.2:1;
      if(['air','heli','medevac'].includes(fx.id)) {
        const xx=x+12-a*11, zz=z-5+a*5.2, y=2.7-a*.55;
        placeAt(trace,xx,zz,y,1.32*scale,.13,.31*scale,0x8db2cc,-.44);
        placeAt(trace,xx,zz,y,.26*scale,.19,.91*scale,0xacc3d5,-.44);
        if(fx.id!=='air') placeAt(trace,xx,zz,y+.17,1.9*scale,.027,.05*scale,0xa9d4d7,now*22);
      } else if(fx.id==='missile'&&a<1.57) {
        const h=2.3*(1.6-a)*scale;
        const xx=x+(1.56-a)*scale,zShift=(1.56-a)*scale*.5;
        placeAt(hot,xx,z+zShift,h,.19*scale,.53*scale,.18*scale,0xffb654);
        for(let n=0;n<10;n++) {
          const k=n*.13*scale;
          placeAt(particles,xx+k,z+zShift+k*.5,h+k*2,.23*scale,.30*scale,.23*scale,n<2?0xffd083:0xa2a0ad);
        }
      } else if(fx.id==='para'&&a<1.45) {
        for(let n=0;n<3;n++) {
          const h=1.8*(1.45-a);
          placeAt(hot,x-.5+n*.45,z+.18*n,h+.16,.4,.20,.37,0xe4f4d4);
          placeAt(trace,x-.5+n*.45,z+.18*n,h,.073,.26,.073,0xacc3d5);
        }
      }
    } else if(a<.61 && ['rescue','infect','level','boss','siren','build','breach'].includes(fx.type)) {
      const c=['infect','boss','siren','breach'].includes(fx.type)?0xff9660:0x79e7cc;
      const r=.22+a*.56;
      for(let n=0;n<4;n++) placeAt(hot,x+Math.cos(n*1.57+a)*r,z+Math.sin(n*1.57+a)*r,.21+a*.47,.085,.085,.085,c);
    }
    if(this.setting!=='low' && (fx.type==='siren'||fx.type==='breach')) {
      for(let n=0;n<9;n++) {
        const xx=x+Math.cos(n*2.39)*a*(1.35+n*.14), zz=z+Math.sin(n*2.39)*a*2.4;
        const y=.68+a*(.8+n*.15), flap=.11*Math.sin(a*18+n);
        placeAt(trace,xx-.085,zz,y+flap,.19,.022,.05,0xc1becb,-.45);
        placeAt(trace,xx+.085,zz,y-flap,.19,.022,.05,0xc1becb,.45);
      }
    }
  }
}
