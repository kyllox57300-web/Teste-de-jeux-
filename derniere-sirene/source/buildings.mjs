import {terrain} from './data.mjs';
import {pointToSegment,within} from './placement.mjs';

export const roofRoles=new Set(['safe','soldier','sniper','mortar','turret','watch','flame']);
const accessDistance=1.65;

function bounds(points) {
  const xs=points.map(([x])=>x),zs=points.map(([,z])=>z);
  return [Math.min(...xs),Math.min(...zs),Math.max(...xs),Math.max(...zs)];
}
function cellsIn(grid,[left,top,right,bottom],margin,visit) {
  for(let z=Math.max(0,Math.ceil(top-margin));z<=Math.min(grid.h-1,Math.floor(bottom+margin));z++) {
    for(let x=Math.max(0,Math.ceil(left-margin));x<=Math.min(grid.w-1,Math.floor(right+margin));x++) visit(grid.cell(x,z));
  }
}
function distanceTo(point,polygon) {
  if(within(point,polygon)) return 0;
  let best=Infinity;
  for(let i=0;i<polygon.length;i++) best=Math.min(best,pointToSegment(point,polygon.at(i-1),polygon[i]));
  return best;
}
function roofCenter(polygon,box) {
  const [left,top,right,bottom]=box;
  const center=[(left+right)/2,(top+bottom)/2];
  if(within(center,polygon)) return center;
  const origin=polygon[0];
  for(let i=2;i<polygon.length;i++) {
    const a=polygon[i-1],b=polygon[i];
    const point=[(origin[0]+a[0]+b[0])/3,(origin[1]+a[1]+b[1])/3];
    if(within(point,polygon)) return point;
  }
  return origin;
}

export function indexBuildings(art,grid,cells,anchors,paths) {
  const footprints=[],entrances=[];
  const sites=art.buildings.map(([height,coords],id)=>{
    const polygon=[];
    for(let k=0;k<coords.length;k+=2) polygon.push([coords[k],coords[k+1]]);
    const box=bounds(polygon),point=roofCenter(polygon,box);
    const site={id,height,polygon,point,access:[]};
    cellsIn(grid,box,.5,i=>(footprints[i]??=[]).push(site));
    const candidates=[];
    cellsIn(grid,box,accessDistance+.65,i=>{
      if(paths[i]>=30000||cells[i]!==terrain.road&&cells[i]!==terrain.park) return;
      const at=anchors[i]||grid.point(i);
      const distance=distanceTo(at,polygon);
      if(distance>accessDistance) return;
      const rank=distance+.045*Math.hypot(at[0]-point[0],at[1]-point[1])+(cells[i]===terrain.park?.18:0);
      candidates.push([i,rank]);
      (entrances[i]??=[]).push([site,rank]);
    });
    site.access=candidates.sort((a,b)=>a[1]-b[1]).map(([i])=>i);
    return site;
  });
  const byAccess=entrances.map(list=>list.sort((a,b)=>a[1]-b[1]).map(([site])=>site));
  return {
    sites,byAccess,
    near(a,b) {
      const hits=new Set();
      const box=[Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1])];
      cellsIn(grid,box,.5,i=>{for(const site of footprints[i]||[]) hits.add(site);});
      return hits;
    }
  };
}
