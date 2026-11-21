const epsilon=1e-7;
const cross=(x,z,u,v)=>x*v-z*u;
const same=(a,b)=>Math.abs(a[0]-b[0])<epsilon&&Math.abs(a[1]-b[1])<epsilon;

export function rectangle(grid,from,to) {
  if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=grid.w*grid.h||to>=grid.w*grid.h) return [];
  const [ax,az]=grid.point(from),[bx,bz]=grid.point(to);
  const left=Math.min(ax,bx)-.5,right=Math.max(ax,bx)+.5;
  const top=Math.min(az,bz)-.5,bottom=Math.max(az,bz)+.5;
  return [[left,top],[right,top],[right,bottom],[left,bottom]];
}

export function pointToSegment(p,a,b) {
  const dx=b[0]-a[0],dz=b[1]-a[1];
  const length=dx*dx+dz*dz;
  const t=length?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/length)):0;
  return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz);
}

export function simplify(points,closed=false) {
  const clean=points.filter((p,i)=>!i||!same(p,points[i-1]));
  if(closed&&clean.length>2&&Math.hypot(clean[0][0]-clean.at(-1)[0],clean[0][1]-clean.at(-1)[1])<.23) clean.pop();
  if(clean.length<3) return clean;
  const keep=new Set([0,clean.length-1]);
  const ranges=[[0,clean.length-1]];
  while(ranges.length) {
    const [a,b]=ranges.pop();
    let pivot=-1, distance=.19;
    for(let i=a+1;i<b;i++) {
      const d=pointToSegment(clean[i],clean[a],clean[b]);
      if(d>distance) {distance=d;pivot=i;}
    }
    if(pivot>=0) {
      keep.add(pivot);
      ranges.push([a,pivot],[pivot,b]);
    }
  }
  return clean.filter((_,i)=>keep.has(i));
}

// Fractions along each segment at their intersection.
export function crossing(a,b,c,d) {
  const dx=b[0]-a[0],dz=b[1]-a[1], ux=d[0]-c[0],uz=d[1]-c[1];
  const denominator=cross(dx,dz,ux,uz);
  const qx=c[0]-a[0],qz=c[1]-a[1];
  if(Math.abs(denominator)<epsilon) {
    const length=dx*dx+dz*dz,width=ux*ux+uz*uz;
    if(length<epsilon||width<epsilon||Math.abs(cross(qx,qz,dx,dz))>epsilon) return null;
    const first=(qx*dx+qz*dz)/length;
    const last=first+(ux*dx+uz*dz)/length;
    const lo=Math.max(0,Math.min(first,last)),hi=Math.min(1,Math.max(first,last));
    if(lo>hi+epsilon) return null;
    const t=(lo+hi)*.5;
    return [t,((t*dx-qx)*ux+(t*dz-qz)*uz)/width];
  }
  const t=cross(qx,qz,ux,uz)/denominator, u=cross(qx,qz,dx,dz)/denominator;
  return t>=-epsilon&&t<=1+epsilon&&u>=-epsilon&&u<=1+epsilon?[t,u]:null;
}

export function polygonError(points) {
  if(points.length<3) return 'Trace au moins trois côtés pour fermer la zone.';
  let area=0;
  for(let i=0;i<points.length;i++) {
    const a=points[i],b=points[(i+1)%points.length];
    area+=cross(...a,...b);
    for(let j=i+2;j<points.length;j++) {
      if(i===0&&j===points.length-1) continue;
      if(crossing(a,b,points[j],points[(j+1)%points.length])) return 'Trace un contour qui ne se croise pas.';
    }
  }
  return Math.abs(area)<1.6?'Agrandis le contour de la zone.':'';
}

export function within(point,polygon) {
  const [x,z]=point;
  let inside=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++) {
    const a=polygon[j],b=polygon[i];
    if(x>=Math.min(a[0],b[0])-epsilon&&x<=Math.max(a[0],b[0])+epsilon
      &&z>=Math.min(a[1],b[1])-epsilon&&z<=Math.max(a[1],b[1])+epsilon
      &&Math.abs(cross(x-a[0],z-a[1],b[0]-a[0],b[1]-a[1]))<epsilon) return true;
    if((a[1]>z)!==(b[1]>z) && x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0]) inside=!inside;
  }
  return inside;
}

function segmentKey(a,b) {
  return [a,b].map(p=>p.map(v=>Math.round(v*32)).join(',')).sort().join('/');
}

export function wallSections(path,closed=false) {
  if(path.length<2) return [];
  const segments=[];
  const count=closed?path.length:path.length-1;
  for(let i=0;i<count;i++) {
    const a=path[i],b=path[(i+1)%path.length];
    const length=Math.hypot(b[0]-a[0],b[1]-a[1]);
    if(length<epsilon) continue;
    const n=Math.ceil(length/1.25);
    const at=t=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
    let p=a;
    for(let j=1;j<=n;j++) {
      const q=j===n?b:at(j/n);
      segments.push({a:p,b:q,key:segmentKey(p,q),price:Math.max(1,Math.round(24*length/n)),
        endpoint:!closed&&i===count-1&&j===n});
      p=q;
    }
  }
  return segments;
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
