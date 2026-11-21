export function createGrid(w,h) {
  const cell=(x,z)=>z*w+x;
  const point=i=>[i%w,Math.floor(i/w)];
  const dist=(a,b)=>Math.abs(a%w-b%w)+Math.abs(Math.floor(a/w)-Math.floor(b/w));
  const adjacent=Array.from({length:w*h},(_,i)=>{
    const [x,z]=point(i);
    const neighbors=[];
    if(x>0) neighbors.push(i-1);
    if(x<w-1) neighbors.push(i+1);
    if(z>0) neighbors.push(i-w);
    if(z<h-1) neighbors.push(i+w);
    return neighbors;
  });
  function field(sources,passable) {
    const values=new Int16Array(w*h).fill(30000);
    const queue=new Int32Array(w*h);
    let cursor=0,length=0;
    for(const i of sources) {
      if(values[i]!==30000) continue;
      values[i]=0;
      queue[length++]=i;
    }
    while(cursor<length) {
      const i=queue[cursor++];
      for(const j of adjacent[i]) if(values[j]===30000&&passable(j,i)) {
        values[j]=values[i]+1;
        queue[length++]=j;
      }
    }
    return values;
  }
  return {w,h,cell,point,dist,adjacent,field};
}
