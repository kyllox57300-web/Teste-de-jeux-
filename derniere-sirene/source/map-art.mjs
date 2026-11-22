import * as T from 'three';

function path(ctx,points,closed) {
  ctx.moveTo(points[0],points[1]);
  for(let i=2;i<points.length;i+=2) ctx.lineTo(points[i],points[i+1]);
  if(closed) ctx.closePath();
}
function areas(ctx,shapes,fill,outline,cutouts={}) {
  ctx.fillStyle=fill;
  ctx.strokeStyle=outline;
  for(const [i,polygon] of shapes.entries()) {
    ctx.beginPath();
    path(ctx,polygon,true);
    for(const hole of cutouts[i]||[]) path(ctx,hole,true);
    ctx.fill('evenodd');
    if(outline) ctx.stroke();
  }
}
function paintShadows(ctx,art,scale) {
  const stencil=document.createElement('canvas');
  stencil.width=ctx.canvas.width;
  stencil.height=ctx.canvas.height;
  const shadow=stencil.getContext('2d');
  shadow.scale(scale,scale);
  shadow.translate(.5,.5);
  shadow.fillStyle='#211e3d';
  for(const [height,points] of art.buildings) {
    const dx=height*2.8,dz=height*1.8;
    shadow.beginPath();
    for(let i=0;i<points.length;i+=2) {
      const x=points[i]+dx,z=points[i+1]+dz;
      if(i===0) shadow.moveTo(x,z);
      else shadow.lineTo(x,z);
    }
    shadow.closePath();
    shadow.fill();
    for(let i=0;i<points.length;i+=2) {
      const next=(i+2)%points.length;
      const a=points[i],b=points[i+1],x=points[next],z=points[next+1];
      shadow.beginPath();
      shadow.moveTo(a,b);
      shadow.lineTo(x,z);
      shadow.lineTo(x+dx,z+dz);
      shadow.lineTo(a+dx,b+dz);
      shadow.closePath();
      shadow.fill();
    }
  }
  ctx.save();
  ctx.resetTransform();
  ctx.globalAlpha=.36;
  ctx.drawImage(stencil,0,0);
  ctx.restore();
}
function mapTexture(art,night) {
  const canvas=document.createElement('canvas');
  const scale=22;
  canvas.width=art.w*scale;
  canvas.height=art.h*scale;
  const ctx=canvas.getContext('2d');
  ctx.scale(scale,scale);
  ctx.translate(.5,.5);
  ctx.fillStyle='#8b8077';
  ctx.fillRect(-.5,-.5,art.w,art.h);
  ctx.lineJoin='round';
  ctx.lineCap='round';
  ctx.lineWidth=.045;
  areas(ctx,art.parks,'#758b71','#a1a589');
  ctx.strokeStyle='#526f91';
  for(const [width,points] of art.rivers) {
    ctx.lineWidth=width;
    ctx.beginPath();
    path(ctx,points,false);
    ctx.stroke();
  }
  ctx.lineWidth=.14;
  areas(ctx,art.water,'#526f91','#a0a3ac',art.waterCutouts);
  for(let group=0;group<=2;group++) {
    const width=[.105,.218,.35][group];
    ctx.lineWidth=width+.083;
    ctx.strokeStyle=['#7f7375','#9e8b83','#c4a994'][group];
    ctx.beginPath();
    for(const [kind,,points] of art.roads) if(kind===group) path(ctx,points,false);
    ctx.stroke();
    ctx.lineWidth=width;
    ctx.strokeStyle=['#655b63','#504852','#49444f'][group];
    ctx.stroke();
  }
  paintShadows(ctx,art,scale);
  if(night) {
    ctx.fillStyle='#10132987';
    ctx.fillRect(-.5,-.5,art.w,art.h);
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
    roof.set(['#c4b6aa','#e0c6b0','#cec1bb','#d9b4a5','#b5b8b1','#eed0b8','#aaa7b6'][n%7]);
    facade.copy(roof).multiplyScalar(.65);
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

export function buildMapArt(group,art,night) {
  const texture=mapTexture(art,night);
  const surface=new T.Mesh(new T.PlaneGeometry(art.w,art.h),new T.MeshBasicMaterial({map:texture,toneMapped:false}));
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
