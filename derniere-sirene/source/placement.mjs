export function rectangle(grid,from,to) {
  if(from<0||to<0||from>=grid.w*grid.h||to>=grid.w*grid.h) return [];
  const [ax,az]=grid.point(from),[bx,bz]=grid.point(to);
  const result=[];
  for(let z=Math.min(az,bz);z<=Math.max(az,bz);z++) {
    for(let x=Math.min(ax,bx);x<=Math.max(ax,bx);x++) result.push(grid.cell(x,z));
  }
  return result;
}

export function stroke(grid,from,to) {
  const [ax,az]=grid.point(from),[bx,bz]=grid.point(to);
  const dx=Math.abs(bx-ax),dz=Math.abs(bz-az);
  const sx=Math.sign(bx-ax),sz=Math.sign(bz-az);
  let x=ax,z=az,ix=0,iz=0;
  const result=[from];
  while(ix<dx||iz<dz) {
    if(ix<dx&&(iz===dz||(ix+.5)*dz<=(iz+.5)*dx)) {x+=sx;ix++;}
    else {z+=sz;iz++;}
    result.push(grid.cell(x,z));
  }
  return result;
}

export function largestArea(grid,cells) {
  const unseen=new Set(cells);
  let largest=[];
  while(unseen.size) {
    const first=unseen.values().next().value;
    const connected=[first];
    unseen.delete(first);
    for(let n=0;n<connected.length;n++) {
      for(const i of grid.adjacent[connected[n]]) if(unseen.delete(i)) connected.push(i);
    }
    if(connected.length>largest.length) largest=connected;
  }
  return largest;
}
