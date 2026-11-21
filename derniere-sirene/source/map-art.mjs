import * as T from 'three';

function path(ctx,points,closed) {
  ctx.moveTo(points[0],points[1]);
  for(let i=2;i<points.length;i+=2) ctx.lineTo(points[i],points[i+1]);
  if(closed) ctx.closePath();
}
function areas(ctx,shapes,fill,outline) {
  ctx.fillStyle=fill;
  ctx.strokeStyle=outline;
  for(const polygon of shapes) {
    ctx.beginPath();
    path(ctx,polygon,true);
    ctx.fill();
    if(outline) ctx.stroke();
  }
}
function mapTexture(art) {
  const canvas=document.createElement('canvas');
  const scale=29;
  canvas.width=art.w*scale;
  canvas.height=art.h*scale;
  const ctx=canvas.getContext('2d');
  ctx.scale(scale,scale);
  ctx.translate(.5,.5);
  ctx.fillStyle='#4b5655';
  ctx.fillRect(-.5,-.5,art.w,art.h);
  ctx.lineJoin='round';
  ctx.lineCap='round';
  ctx.lineWidth=.045;
  areas(ctx,art.parks,'#526e5e','#688575');
  ctx.strokeStyle='#306674';
  for(const [width,points] of art.rivers) {
    ctx.lineWidth=width;
    ctx.beginPath();
    path(ctx,points,false);
    ctx.stroke();
  }
  ctx.lineWidth=.14;
  areas(ctx,art.water,'#306674','#61929a');
  for(let group=0;group<=2;group++) {
    const width=[.105,.218,.35][group];
    ctx.lineWidth=width+.083;
    ctx.strokeStyle=['#46504c','#6f7469','#9a967f'][group];
    ctx.beginPath();
    for(const [kind,,points] of art.roads) if(kind===group) path(ctx,points,false);
    ctx.stroke();
    ctx.lineWidth=width;
    ctx.strokeStyle=['#293634','#252d32','#283138'][group];
    ctx.stroke();
  }
  const texture=new T.CanvasTexture(canvas);
  texture.colorSpace=T.SRGBColorSpace;
  texture.anisotropy=4;
  return texture;
}

function buildings(art) {
  const positions=[],colors=[];
  const roof=new T.Color(), facade=new T.Color();
  function vertex(p,y,c) {
    positions.push(p.x,y,p.y);
    colors.push(c.r,c.g,c.b);
  }
  for(const [n,[height,coords]] of art.buildings.entries()) {
    const points=[];
    for(let i=0;i<coords.length;i+=2) points.push(new T.Vector2(coords[i],coords[i+1]));
    roof.set(['#9c947f','#c2b39b','#aeaa99','#b7b0a0','#a9a498','#c6b9a2','#989c91'][n%7]);
    facade.copy(roof).multiplyScalar(.61);
    for(const [i,j,k] of T.ShapeUtils.triangulateShape(points,[])) {
      vertex(points[k],height,roof);vertex(points[j],height,roof);vertex(points[i],height,roof);
    }
    if(height<.22) continue;
    for(let i=0;i<points.length;i++) {
      const a=points[i],b=points[(i+1)%points.length];
      vertex(a,0,facade);vertex(b,0,facade);vertex(a,height,facade);
      vertex(a,height,facade);vertex(b,0,facade);vertex(b,height,facade);
    }
  }
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  geometry.computeVertexNormals();
  return geometry;
}

export function buildMapArt(group,art) {
  const texture=mapTexture(art);
  const surface=new T.Mesh(new T.PlaneGeometry(art.w,art.h),new T.MeshBasicMaterial({map:texture}));
  surface.rotation.x=-Math.PI/2;
  surface.position.set((art.w-1)/2,-.022,(art.h-1)/2);
  const blocks=new T.Mesh(buildings(art),new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide}));
  group.add(surface,blocks);
  return ()=>{
    for(const mesh of [surface,blocks]) {
      mesh.geometry.dispose();
      mesh.material.dispose();
    }
    texture.dispose();
  };
}

export function diffusionTexture() {
  const canvas=document.createElement('canvas');
  canvas.width=canvas.height=32;
  const ctx=canvas.getContext('2d');
  const fade=ctx.createRadialGradient(16,16,0,16,16,16);
  fade.addColorStop(0,'rgba(255,255,255,0.97)');
  fade.addColorStop(.29,'rgba(255,255,255,0.75)');
  fade.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=fade;
  ctx.fillRect(0,0,32,32);
  return new T.CanvasTexture(canvas);
}
