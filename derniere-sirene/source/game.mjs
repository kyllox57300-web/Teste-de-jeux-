import { defenses, support, infected, difficulty, canUse, terrain as t } from './data.mjs';
import { random, generate, open, baseGrid } from './city.mjs';
import { largestArea,rectangle } from './placement.mjs';

const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const metric = (a,b) => Math.hypot(a.x-b.x,a.z-b.z);
const mobile = new Set(['soldier','sniper','flame']);
const streetFire = new Set(['soldier','sniper','turret','flame','para']);

export class Game {
  constructor(mission, level='normal', skills=[]) {
    this.mission=mission;
    this.level=level;
    this.difficulty=difficulty[level];
    this.skills=[...new Set([...skills,...(mission.loadout||[])])];
    this.map=generate(mission);
    this.grid=this.map.grid||baseGrid;
    this.rng=random(mission.seed+4321);
    this.phase='prep';
    this.money=Math.round(mission.budget*this.difficulty.budget)+(this.has('reserve') ? 110 : 0);
    this.units=new Map();
    this.zoneCells=new Map();
    this.marches=[];
    this.reinf=[];
    this.guide=[];
    this.zombies=[];
    this.civs=[];
    this.fog=new Float32Array(this.grid.w*this.grid.h);
    this.clouds=[];
    this.noises=[];
    this.events=[];
    this.cd={};
    this.time=0;
    this.wave=0;
    this.nextWave=mission.id==='survival'?19:14;
    this.routeClock=0;
    this.alarm=0;
    this.kills=0;
    this.friendly=0;
    this.lost=0;
    this.evacuated=0;
    this.quota=mission.metro?Math.ceil(mission.pop*mission.quota):0;
    this.clearedAt=null;
    this.extractions=0;
    this.flags=new Set();
    this.bridgeDamage=new Set();
    this.place('safe',this.map.end,true);
    const homes = this.map.homes.slice();
    const far=this.grid.field([this.map.start],i=>open(this.map.cells,i));
    const towards=this.grid.field([this.map.end],i=>open(this.map.cells,i));
    for (let i=homes.length-1;i>0;i--) {
      const j=Math.floor(this.rng()*(i+1));
      [homes[i],homes[j]]=[homes[j],homes[i]];
    }
    const favorable=homes.filter(i=>far[i]>(mission.id===0?13:8) && towards[i]<(mission.metro?60:24));
    const exposed=mission.containment?homes.filter(i=>far[i]<(mission.metro?15:12)):[];
    for(let i=0;i<mission.pop;i++) {
      const group=exposed.length&&i%5===0?exposed:i%4!==0&&favorable.length?favorable:homes;
      this.civs.push(this.person(group[i%group.length],{speed:(1.15+this.rng()*.55)*(this.has('train')?1.25:1), wait:this.rng()*(mission.containment?3.5:2)}));
    }
    this.spawnWave(true);
  }

  location(i) { return this.map.anchors?.[i]||this.grid.point(i); }
  has(id) { return this.skills.includes(id); }
  person(i, extra={}) {
    const [x,z]=this.location(i);
    const spacing=this.mission.metro?.42:.59;
    const ox=(this.rng()-.5)*spacing, oz=(this.rng()-.5)*spacing;
    return {i,target:i,x:x+ox,z:z+oz,ox,oz, angle:0, ...extra};
  }
  get sheltered() {
    let total=this.evacuated;
    for(const u of this.units.values()) total+=u.sheltered;
    return total;
  }
  get remaining() { return this.zombies.length; }
  get combat() { return this.phase==='live'; }
  get canConfirm() { return this.combat&&this.clearedAt!==null&&this.evacuated>=this.quota; }
  zoneAt(i) { return this.zoneCells.get(i); }
  baseCapacity() { return (this.mission.cap||defenses.safe.cap)+(this.has('bunks')?8:0); }
  canBuild(i) { return open(this.map.cells,i)&&this.grid.dist(this.map.start,i)>(this.mission.containment?2:0); }
  civilPass(i) {
    const structure=defenses[this.units.get(i)?.id];
    return open(this.map.cells,i)&&(!structure?.barrier||structure.passCivil===true);
  }
  gateCost(i) {
    const before=this.units.get(i);
    return this.cost('gate')-(before?.id==='wall'||before?.id==='barricade'?before.paid:0);
  }
  legal(id,i) {
    if(id==='safe'&&this.zoneAt(i)) return false;
    if(id==='safe'&&this.combat&&this.mission.metro) return open(this.map.cells,i)&&!this.units.has(i)&&!this.marches.some(m=>m.to===i)&&this.money>=this.cost(id);
    if(id==='gate'&&this.phase==='prep'&&this.canBuild(i)) {
      const before=this.units.get(i);
      return (!before||before.id==='wall'||before.id==='barricade')&&this.money>=this.gateCost(i);
    }
    if (!this.combat || !support[id]) return this.phase==='prep' && defenses[id] && this.canBuild(i)
      && !this.units.has(i) && canUse(id,this.skills) && this.money>=this.cost(id);
    return open(this.map.cells,i) && !(this.mission.noair && support[id].air) && canUse(id,this.skills) && this.money>=this.cost(id) && !(this.cd[id]>this.time);
  }
  cost(id) {
    const info=defenses[id]||support[id];
    return Math.round(info.price*(support[id]?.air && this.has('wing') ? .7 : 1));
  }
  place(id,i,free=false) {
    if (!free && !this.legal(id,i)) return false;
    const d=defenses[id];
    const hp=(d.hp || 115)*(this.has('concrete')&&d.hp ? 1.4 : 1);
    const cap=d.cap?this.baseCapacity():0;
    const old=id==='gate'?this.units.get(i):null;
    const paid=free?0:this.cost(id);
    const debit=old?this.gateCost(i):paid;
    const u={id,i,hp,maxHp:hp,level:this.has('veteran')?2:1,xp:0,fireAt:0,sheltered:0,cap,rescueAt:this.time+12,charges:d.charges,fixed:free,angle:old?.angle||0,paid};
    this.units.set(i,u);
    if(id==='safe') {
      u.tiles=[i];
      this.zoneCells.set(i,u);
    }
    if(!free) {
      this.money-=debit;
      this.emit('build',i,id);
      if (this.units.size>=9) this.flags.add('fort');
    }
    this.routeClock=0;
    return true;
  }
  planZone(from,to) {
    const plan={tiles:[],price:this.cost('safe'),cap:this.baseCapacity()};
    if(this.phase!=='prep'&&!(this.combat&&this.mission.metro)) return {...plan,error:'Le tracé se fait pendant la préparation.'};
    const area=rectangle(this.grid,from,to).filter(i=>(this.combat?open(this.map.cells,i):this.canBuild(i))
      &&!this.zoneAt(i)&&!defenses[this.units.get(i)?.id]?.barrier);
    plan.tiles=largestArea(this.grid,area);
    const limit=this.mission.metro?48:32;
    if(plan.tiles.length>limit) return {...plan,error:`Réduis le tracé à ${limit} cases accessibles.`};
    if(plan.tiles.length<2) return {...plan,error:'Trace une zone avec au moins deux cases de rue ou de parc reliées.'};
    const [ax,az]=this.grid.point(from),[bx,bz]=this.grid.point(to);
    const position=this.grid.cell(Math.floor((ax+bx)/2),Math.floor((az+bz)/2));
    const choices=plan.tiles.filter(i=>!this.units.has(i)&&!this.marches.some(m=>m.to===i));
    plan.anchor=choices.sort((a,b)=>this.grid.dist(a,position)-this.grid.dist(b,position))[0];
    plan.price+=(plan.tiles.length-1)*10;
    plan.cap+=(plan.tiles.length-1)*(this.mission.metro?6:4);
    if(plan.anchor===undefined) plan.error='Laisse une case libre pour le refuge.';
    else if(this.zombies.some(z=>plan.tiles.includes(z.i))) plan.error='Écarte le tracé des infectés.';
    else if(plan.price>this.money) plan.error=`Budget insuffisant · ${plan.price} cr nécessaires.`;
    return plan;
  }
  drawZone(from,to) {
    const plan=this.planZone(from,to);
    if(plan.error||!this.place('safe',plan.anchor)) return null;
    const zone=this.units.get(plan.anchor);
    this.money-=plan.price-zone.paid;
    zone.paid=plan.price;
    zone.cap=plan.cap;
    zone.tiles=plan.tiles;
    for(const i of zone.tiles) this.zoneCells.set(i,zone);
    return zone;
  }
  planWalls(cells) {
    const tiles=this.phase==='prep'?[...new Set(cells)].filter(i=>this.canBuild(i)&&!this.units.has(i)):[];
    return {tiles,price:tiles.length*this.cost('wall')};
  }
  perimeter(zone) {
    const boundary=new Map();
    if(!zone||this.units.get(zone.i)!==zone) return boundary;
    for(const i of zone.tiles) {
      for(const j of this.grid.adjacent[i]) {
        if(!open(this.map.cells,j)||this.zoneAt(j)===zone) continue;
        boundary.set(j,Math.abs(j-i)===1?Math.PI/2:0);
      }
    }
    return boundary;
  }
  fortification(zone) {
    const boundary=this.perimeter(zone);
    const gaps=[...boundary.keys()].filter(i=>!defenses[this.units.get(i)?.id]?.barrier);
    const {tiles,price}=this.planWalls(gaps.filter(i=>!this.zoneAt(i)));
    return {tiles,price,complete:tiles.length===gaps.length,
      gates:[...boundary.keys()].filter(i=>this.units.get(i)?.id==='gate').length};
  }
  drawWalls(cells,angles=null) {
    const {tiles,price}=this.planWalls(cells);
    if(!tiles.length||price>this.money) return false;
    const line=new Set(tiles);
    for(const i of tiles) {
      this.place('wall',i);
      const alongZ=this.grid.adjacent[i].some(j=>Math.abs(j-i)===this.grid.w
        &&(line.has(j)||defenses[this.units.get(j)?.id]?.barrier));
      this.units.get(i).angle=angles?.get(i)??(alongZ?Math.PI/2:0);
    }
    return true;
  }
  surround(zone) {
    const plan=this.fortification(zone);
    return plan.complete&&this.drawWalls(plan.tiles,this.perimeter(zone));
  }
  removeUnit(u) {
    this.units.delete(u.i);
    for(const i of u.tiles||[]) this.zoneCells.delete(i);
    this.routeClock=0;
  }
  sell(i) {
    const u=this.units.get(i)||this.zoneAt(i);
    if (this.phase!=='prep' || !u || u.fixed) return false;
    this.money+=u.paid;
    this.removeUnit(u);
    return true;
  }
  canMove(i) { return this.combat&&mobile.has(this.units.get(i)?.id); }
  order(from,to) {
    if(!this.canMove(from)||!open(this.map.cells,to)||this.units.has(to)||this.marches.some(m=>m.to===to)) return false;
    const paths=this.grid.field([to],i=>this.civilPass(i));
    if(paths[from]>=30000) return false;
    const route=[from];
    for(let i=from;i!==to;) {
      i=this.grid.adjacent[i].find(j=>paths[j]<paths[i]);
      route.push(i);
    }
    const u=this.units.get(from);
    const [x,z]=this.location(from);
    this.units.delete(from);
    this.marches.push({u,to,route,next:1,x,z,i:from,target:route[1],ox:0,oz:0,angle:u.angle});
    this.routeClock=0;
    return true;
  }
  march(dt) {
    for(const m of this.marches) {
      if(!open(this.map.cells,m.target)) {
        m.done=true;
        if(!this.units.has(m.i)&&open(this.map.cells,m.i)) {
          m.u.i=m.i;
          this.units.set(m.i,m.u);
        } else this.emit('collapse',m.i,m.u.id);
        this.routeClock=0;
        continue;
      }
      const danger=this.zombies.some(z=>z.hp>0&&Math.abs(z.x-m.x)<.45&&Math.abs(z.z-m.z)<.45);
      if(danger) m.u.hp-=dt*68;
      if(m.u.hp<=0) {
        m.done=true;
        this.emit('collapse',m.i,m.u.id);
        continue;
      }
      if(this.travel(m,dt,2.55)) continue;
      if(m.i===m.to) {
        m.u.i=m.to;
        m.u.angle=m.angle;
        this.units.set(m.to,m.u);
        this.emit('build',m.to,m.u.id);
        m.done=true;
        this.routeClock=0;
      } else m.target=m.route[++m.next];
    }
    if(this.marches.some(m=>m.done)) this.marches=this.marches.filter(m=>!m.done);
  }
  setGuide(cells, append=false) {
    const course=append ? this.guide.slice() : [];
    for(const i of cells) if (open(this.map.cells,i) && course.at(-1)!==i) {
      const a=course.at(-1);
      if(a!==undefined && this.grid.dist(a,i)>1) {
        const path=this.grid.field([i],j=>open(this.map.cells,j));
        let j=a;
        while(path[j]>1 && path[j]<30000) {
          j=this.grid.adjacent[j].find(k=>path[k]<path[j]);
          course.push(j);
        }
      }
      course.push(i);
    }
    this.guide=[...new Set(course)].slice(this.mission.metro?-320:-100);
    if(this.guide.length>=10) this.flags.add('guide');
    this.routeClock=0;
  }
  prepare() {
    if (this.phase!=='prep') return false;
    this.phase='live';
    this.emit('siren',this.map.start);
    return true;
  }
  confirmRescue() {
    if(!this.canConfirm) return false;
    this.phase='won';
    return true;
  }
  emit(type,i,id,from) { this.events.push({type,i,id,from}); }
  shout(i,power,duration=3) { this.noises.push({i,power,until:this.time+duration}); }
  spawn(i,id='slow') {
    const spec=infected[id];
    const f=this.difficulty.factor;
    this.zombies.push(this.person(i,{id,hp:spec.hp*f,maxHp:spec.hp*f,speed:spec.speed*(.8+f*.2),attackAt:0}));
    this.fog[i]=1;
  }
  spawnWave(first=false) {
    const {count,id,waves,boss}=this.mission;
    const wave=this.wave;
    const rank=typeof id==='number'?id:(id==='survival'?this.wave+2:this.mission.containment?0:6);
    const origin=this.map.start;
    const starts=[origin,...this.grid.adjacent[origin].filter(i=>open(this.map.cells,i))];
    if(this.mission.containment) {
      const paths=this.grid.field([origin],i=>open(this.map.cells,i));
      const margin=this.map.cells.flatMap((_,i)=>paths[i]>=2&&paths[i]<=(this.mission.metro?9:5)?[i]:[]);
      for(let n=0; n<(this.mission.metro?14:6) && margin.length; n++) starts.push(margin.splice(Math.floor(this.rng()*margin.length),1)[0]);
    }
    const breach=!first&&this.map.breach!=null&&wave%2===1 ? this.map.breach : null;
    const number=first ? count : (id==='survival' ? 10+wave*5 : Math.round(count*(.28+.055*wave)));
    const amount=Math.round(number*this.difficulty.factor);
    for(let n=0;n<amount;n++) {
      const r=this.rng();
      let kind='slow';
      if (r<Math.min(.5,.16+rank*.022) && (rank>0 || !first || this.mission.containment)) kind='fast';
      if (r>.76 && rank>=2) kind='brute';
      if (r>.88 && rank>=4) kind='bomb';
      if (r>.94 && rank>=5) kind='spit';
      this.spawn(breach!==null&&n%5<2 ? breach : starts[n%starts.length],kind);
    }
    if ((!first && boss && wave===Math.ceil(waves*.62)) || (id==='survival' && wave>0 && wave%5===0)) {
      this.spawn(this.map.start,'boss');
      this.emit('boss',this.map.start);
    }
    this.wave++;
    if(id==='survival' && this.wave>=5) this.flags.add('wave5');
    if(id==='survival' && this.wave>=10) this.flags.add('wave10');
    if(!first) this.emit('wave',this.map.start,this.wave);
    if(breach!==null) this.emit('breach',breach);
    this.routeClock=0;
  }
  damage(z,hit,u=null) {
    if(z.hp<=0) return;
    z.hp-=hit;
    if(z.hp>0) return;
    this.kills++;
    this.money+=infected[z.id].value;
    this.emit('down',z.i,z.id);
    if(this.kills>=150) this.flags.add('score');
    if(z.id==='boss') this.flags.add('boss');
    if(u) {
      u.xp++;
      const level=Math.max(this.has('veteran')?2:1,u.xp>=10?3:u.xp>=4?2:1);
      if(level>u.level) this.emit('level',u.i,level);
      u.level=level;
      if(level===3) this.flags.add('veteran');
    }
    if(z.id==='bomb') this.blast(z.i,38,1.19,.28,null,'infected');
  }
  blast(i,hit,radius,friendly=0,u=null,kind='blast') {
    const [x,z]=this.location(i);
    for(const foe of this.zombies) if(metric({x,z},foe)<=radius) this.damage(foe,hit,u);
    if(friendly) for(const c of this.civs) if(!c.dead && metric({x,z},c)<=radius && this.rng()<friendly) {
      c.dead=true;
      this.lost++;
      if(kind!=='infected') this.friendly++;
    }
    if(this.mission.fragile && hit>=90) {
      for(let j=0;j<this.map.cells.length;j++) if(this.map.cells[j]===t.bridge && this.grid.dist(i,j)<=radius) {
        this.map.cells[j]=t.water;
        this.bridgeDamage.add(j);
        const u=this.units.get(j)||this.zoneAt(j);
        if(u) this.collapse(u,j);
      }
      this.routeClock=0;
    }
    this.emit(kind,i);
    this.shout(i,13,5);
  }
  collapse(u,at=u.i) {
    this.removeUnit(u);
    const exit=open(this.map.cells,at)?at:(u.tiles||this.grid.adjacent[at]).find(i=>open(this.map.cells,i));
    if(exit!==undefined) for(let n=0;n<u.sheltered;n++) this.spawn(exit, n%5===0 ? 'fast' : 'slow');
    this.lost+=u.sheltered;
    this.emit('collapse',u.i,u.id);
    this.routeClock=0;
  }
  detonate(i) {
    const u=this.units.get(i);
    if (!this.combat || u?.id!=='explosive') return false;
    this.blast(i,defenses.explosive.hit,defenses.explosive.blast,defenses.explosive.friendly,u);
    this.units.delete(i);
    this.flags.add('boom');
    return true;
  }
  call(id,i) {
    if(!this.combat || !this.legal(id,i)) return false;
    this.money-=this.cost(id);
    this.cd[id]=this.time+support[id].cd*(this.has('dispatch')?.75:1);
    this.emit('support',i,id);
    if(id==='air') this.flags.add('air');
    this.reinf.push({id,i,t:this.time+({para:1.4,air:1.05,missile:1.55,gas:.65,heli:1.45,tank:.85}[id]),until:this.time+(id==='heli'?12:28), saved:0,angle:0,level:1,xp:0,fireAt:0});
    return true;
  }
  operateSupport() {
    for(const r of this.reinf) {
      if(r.done || r.t>this.time) continue;
      const [x,z]=this.location(r.i);
      if(r.id==='heli'||r.id==='tank'||r.id==='para') {
        if(this.time>=r.until) { r.done=true; continue; }
        const target=this.target(r,r.id==='heli'?5.5:4.5);
        if(target && r.fireAt<=this.time) {
          r.fireAt=this.time+(r.id==='tank'?.85:.41);
          if(r.id==='tank') this.blast(target.i,50,1.15,.12,r);
          else this.damage(target,r.id==='heli'?37:26,r);
          this.emit('shot',target.i,r.id,r.i);
        }
        if(r.id==='heli' && r.saved<8 && (!r.nextRescue || r.nextRescue<=this.time)) {
          const c=this.civs.find(c=>!c.dead && metric({x,z},c)<3.8);
          if(c) {
            c.dead=true; r.saved++; this.evacuated++; this.extractions++;
            r.nextRescue=this.time+.7;
            if(r.saved>=4) this.flags.add('heli');
          }
        }
        continue;
      }
      if(r.id==='missile') this.blast(r.i,315,2.25,.62);
      if(r.id==='air') for(const n of [-2,0,2]) this.blast(this.grid.cell(Math.round(clamp(x+n,0,this.grid.w-1)),Math.round(z)),119,1.75,.43);
      if(r.id==='gas') {
        this.clouds.push({i:r.i,x,z,until:this.time+7});
        this.emit('gas',r.i);
      }
      r.done=true;
    }
    this.reinf=this.reinf.filter(r=>!r.done);
  }
  operateConvoys() {
    for(const u of this.units.values()) {
      if(u.id!=='safe'||u.rescueAt>this.time||!u.sheltered) continue;
      const taken=Math.min(u.sheltered,85);
      u.sheltered-=taken;
      this.evacuated+=taken;
      this.money+=Math.ceil(taken/8);
      u.rescueAt=this.time+12;
      this.emit('convoy',u.i,taken);
      this.routeClock=0;
    }
  }
  target(u,range) {
    const [x,z]=this.location(u.i);
    let best, value=-Infinity;
    for(const foe of this.zombies) {
      if(foe.hp<=0 || Math.abs(x-foe.x)>range || Math.abs(z-foe.z)>range) continue;
      const d=metric({x,z},foe);
      if(d>range) continue;
      const p=u.id==='sniper' ? Math.min(foe.hp,95)-d : -d;
      if(p>value && (!this.mission.containment||!streetFire.has(u.id)||this.visible(x,z,foe))) {
        best=foe;
        value=p;
      }
    }
    return best;
  }
  visible(x,z,foe) {
    const dx=foe.x-x, dz=foe.z-z;
    const steps=Math.ceil(Math.max(Math.abs(dx),Math.abs(dz))*3);
    for(let n=1;n<steps;n++) {
      const i=this.grid.cell(Math.round(x+dx*n/steps),Math.round(z+dz*n/steps));
      if(this.map.cells[i]===t.block) return false;
    }
    return true;
  }
  shoot(u) {
    const d=defenses[u.id];
    if(!d.range || u.fireAt>this.time) return;
    const target=this.target(u,d.range);
    if(!target) return;
    const [x,z]=this.location(u.i);
    u.angle=Math.atan2(target.x-x,target.z-z);
    u.fireAt=this.time+d.delay*(1-(u.level-1)*.1);
    const hit=d.hit*(1+(u.level-1)*.25)*(this.has('burst')?1.25:1);
    if(d.blast) {
      this.blast(target.i,hit,d.blast,d.friendly||0,u,u.id==='flame'?'flame':'blast');
    } else {
      this.damage(target,hit,u);
      this.emit('shot',target.i,u.id,u.i);
      this.shout(u.i,u.id==='sniper'?7:4,2);
    }
    if(u.charges && --u.charges===0) this.units.delete(u.i);
  }
  routes() {
    const pass=i=>open(this.map.cells,i);
    const civilPass=i=>this.civilPass(i);
    const intake=[];
    for(const [i,u] of this.zoneCells) if(u.sheltered<u.cap&&civilPass(i)) intake.push(i);
    this.safeField=this.grid.field(intake,civilPass);
    this.guideRoute=new Set(this.guide);
    this.guideField=this.grid.field(this.guide.filter(i=>this.safeField[i]<30000),civilPass);
    const live=this.zombies.filter(z=>z.hp>0);
    this.threat=this.grid.field(live.map(z=>z.i),pass);
    const occupied=this.civs.filter(c=>!c.dead).map(c=>c.i);
    const targets=[...occupied,...this.units.keys(),...this.zoneCells.keys()];
    this.hunt=this.grid.field(targets.length?targets:[this.map.end],pass);
    if(this.mission.containment) this.crowd=this.grid.field(occupied,pass);
    this.noises=this.noises.filter(n=>n.until>this.time).slice(-12);
    this.lure=this.noises.length?this.grid.field(this.noises.map(n=>n.i),pass):null;
    this.civByCell=new Map();
    for(const c of this.civs) {
      if(!this.civByCell.has(c.i)) this.civByCell.set(c.i,[]);
      this.civByCell.get(c.i).push(c);
    }
  }
  travel(p,dt,speed) {
    const [x,z]=this.location(p.target);
    const dx=x+p.ox-p.x, dz=z+p.oz-p.z;
    const d=Math.hypot(dx,dz);
    if(d<.025) { p.i=p.target; return false; }
    const step=Math.min(d,speed*dt);
    p.x+=dx/d*step; p.z+=dz/d*step;
    p.angle=Math.atan2(dx,dz);
    return true;
  }
  moveCiv(c,dt) {
    if(c.dead || c.wait>this.time || this.travel(c,dt,c.speed)) return;
    const shelter=this.zoneAt(c.i);
    if(shelter&&shelter.sheltered<shelter.cap&&this.civilPass(c.i)) {
      shelter.sheltered++;
      this.money+=3;
      this.emit('rescue',c.i);
      c.dead=true;
      return;
    }
    const danger=this.threat[c.i];
    const here=this.guideRoute.has(c.i);
    let best=c.i, high=-Infinity;
    for(const i of this.grid.adjacent[c.i]) if(this.civilPass(i)) {
      const goal=clamp(this.safeField[c.i]-this.safeField[i],-2,2);
      const escape=clamp(this.threat[i]-danger,-2,2)*(danger<5?5:danger<8?1.5:.35);
      const guide=clamp(this.guideField[c.i]-this.guideField[i],-2,2);
      const score=goal*(here?5:3)+escape+(here?Number(this.guideRoute.has(i))*1.2:guide*.9)+this.rng()*.7;
      if(score>high) { best=i; high=score; }
    }
    if(high>0 || (danger<4 && high>-1) || this.rng()<.11) c.target=best;
    c.wait=this.time+.09+this.rng()*.14;
  }
  moveFoe(z,dt) {
    if(z.hp<=0 || this.travel(z,dt,z.speed*(z.gassed?.58:1))) return;
    const spec=infected[z.id];
    const near=[z.i,...this.grid.adjacent[z.i]];
    if (z.attackAt<=this.time && z.id==='spit') {
      const [x,zz]=this.location(z.i);
      const victim=this.civs.find(c=>!c.dead && metric({x,z:zz},c)<2.25);
      if(victim) {
        victim.speed*=.64;
        z.attackAt=this.time+2.8;
        this.emit('spit',victim.i,z.id,z.i);
      }
    }
    for(const i of near) for(const c of (this.civByCell.get(i)||[])) {
      if(!c.dead && metric(z,c)<(this.mission.containment?.56:.43) && z.attackAt<=this.time) {
        c.dead=true; this.lost++;
        this.spawn(c.i,this.rng()<.18?'fast':'slow');
        this.emit('infect',c.i);
        z.attackAt=this.time+(this.mission.containment?.32:.55);
        return;
      }
    }
    const lure=this.lure && this.noises.some(n=>this.grid.dist(n.i,z.i)<=n.power) && this.lure[z.i]>0 && this.hunt[z.i]>2;
    const nav=lure?this.lure:this.crowd?.[z.i]<7?this.crowd:this.hunt;
    let best=z.i, high=Infinity;
    for(const i of this.grid.adjacent[z.i]) if(open(this.map.cells,i)) {
      const score=nav[i]+this.rng()*.38;
      if(score<high) { best=i; high=score; }
    }
    const here=this.units.get(z.i)||this.zoneAt(z.i);
    const obstruction=this.units.get(best);
    const target=here || (obstruction && defenses[obstruction.id].barrier ? obstruction : null);
    if(target) {
      if(z.attackAt<=this.time) {
        z.attackAt=this.time+.65;
        target.hp-=spec.damage*this.difficulty.factor*.65;
        this.emit('hit',target.i);
        if(target.hp<=0) this.collapse(target,target===here?z.i:target.i);
      }
    } else if(high<nav[z.i]+.4 || this.rng()<.16) z.target=best;
  }
  step(dt) {
    if(!this.combat) return;
    this.time+=dt;
    if(this.wave<=this.mission.waves && this.time>=this.nextWave) {
      this.spawnWave();
      this.nextWave+=this.mission.id==='survival'?19:15.5;
    }
    this.routeClock-=dt;
    if(this.routeClock<=0) { this.routes(); this.routeClock=.27; }
    this.operateSupport();
    if(this.marches.length) this.march(dt);
    if(this.mission.metro) this.operateConvoys();
    for(const u of this.units.values()) this.shoot(u);
    this.clouds=this.clouds.filter(g=>g.until>this.time);
    for(const z of this.zombies) {
      z.gassed=this.clouds.some(g=>metric(z,g)<2.5);
      if(z.gassed) this.damage(z,22*dt);
      if(z.hp>0) this.moveFoe(z,dt);
      if(z.hp>0) this.fog[z.i]=1;
    }
    for(const c of this.civs) {
      this.moveCiv(c,dt);
      if(!c.dead && this.clouds.some(g=>metric(c,g)<2.5) && this.rng()<dt*.25) {
        c.dead=true; this.lost++; this.friendly++;
      }
    }
    this.zombies=this.zombies.filter(z=>z.hp>0);
    this.civs=this.civs.filter(c=>!c.dead);
    for(let i=0;i<this.fog.length;i++) if(this.fog[i]>.015) this.fog[i]*=Math.pow(.77,dt);
    const overrun=this.mission.id==='survival' && this.zombies.length>0 && !this.units.size && !this.marches.length
      && !this.reinf.some(r=>['para','tank','heli'].includes(r.id));
    const cutOff=this.mission.containment && this.zombies.length>0 && !this.civs.length && !this.units.size
      && !this.marches.length && !this.reinf.length && !this.clouds.length
      && !Object.keys(support).some(id=>canUse(id,this.skills)&&this.money>=this.cost(id));
    if((!this.civs.length&&!this.sheltered)||overrun||cutOff||(this.mission.metro&&this.sheltered+this.civs.length<this.quota)) this.phase='lost';
    const final=this.wave>this.mission.waves;
    if(this.combat&&final&&!this.zombies.length&&this.mission.metro) {
      if(this.clearedAt===null) {
        this.clearedAt=this.time;
        this.emit('secure',this.map.end);
      }
      if(this.evacuated>=this.mission.pop-this.lost || this.time-this.clearedAt>=105) {
        this.phase=this.evacuated>=this.quota?'won':'lost';
      }
    } else if(this.combat && final && !this.zombies.length) {
      this.evacuated+=this.civs.length;
      this.civs.length=0;
      this.phase='won';
    }
  }
  result() {
    const saved=this.mission.metro?this.evacuated:this.sheltered;
    const ratio=saved/this.mission.pop;
    const score=Math.max(0,Math.round(saved*100+this.kills*8-this.friendly*175));
    const rank=ratio>=.88&&this.friendly<=2?3:ratio>=.60?2:1;
    return {saved, lost:this.lost, kills:this.kills, friendly:this.friendly, score, time:Math.floor(this.time), wave:this.wave, stars:this.phase==='won'?rank:0, money:this.money};
  }
}
