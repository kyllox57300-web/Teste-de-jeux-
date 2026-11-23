import { defenses, support, atlasSupport, atlasStageCount, infected, difficulty, canUse, terrain as t } from './data.mjs';
import { random, generate, open, baseGrid } from './city.mjs';
import { largestArea,polygonError,polygonsOverlap,rectangle,simplify,wallSections,within } from './placement.mjs';
import { Fortifications } from './fortification.mjs';
import { roofRoles } from './buildings.mjs';

const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const metric = (a,b) => Math.hypot(a.x-b.x,a.z-b.z);
const mobile = new Set(['soldier','sniper','flame']);
const streetFire = new Set(['soldier','sniper','turret','flame','para']);
export const maxEquipment=3;
export const freeSupportSlots=6;
const reserves={easy:10,normal:8,hard:6};
const hiddenZombies=[];
const unreachable=30000;
const evacuationClearance=5;
const waitingClearance=9;
const refuelTime=10;
const departureTime=2;
const returnTime=2.2;
const atlasPrices={soldier:55,safe:75};

export class Game {
  constructor(mission, level='normal', skills=[], {attempt=0,bonus=0}={}) {
    this.mission=mission;
    this.level=level;
    this.difficulty=difficulty[level];
    this.training=mission.atlas?new Set(skills):new Set();
    this.skills=[...new Set([...skills,...(mission.loadout||[])])];
    this.support=mission.atlas?atlasSupport:support;
    this.preparedSupport=mission.atlas?new Set(Object.keys(this.support).filter(id=>this.canPrepareSupport(id)).slice(0,freeSupportSlots)):null;
    this.supportCapacity=mission.atlas?reserves[level]+(this.has('wing')?2:0):null;
    this.supportReserve=this.supportCapacity;
    this.map=generate(mission);
    this.grid=this.map.grid||baseGrid;
    this.rng=random(mission.seed+4321);
    this.phase='prep';
    this.recoveryAid=mission.atlas?bonus:0;
    this.money=Math.round(mission.budget*this.difficulty.budget)+(this.has('reserve') ? 110 : 0)+this.recoveryAid;
    this.units=new Map();
    this.zoneCells=new Map();
    this.walls=new Fortifications(this.grid,i=>this.location(i),i=>open(this.map.cells,i));
    this.repairs=new Map();
    this.breaches=[];
    this.marches=[];
    this.reinf=[];
    this.guide=[];
    this.waitingZones=[];
    this.personCount=0;
    this.zombies=[];
    this.civs=[];
    this.fog=new Float32Array(this.grid.w*this.grid.h);
    this.clouds=[];
    this.noises=[];
    this.breachHistory=[];
    this.events=[];
    this.cd={};
    this.time=0;
    this.lastProgressAt=0;
    this.contactGroups=[];
    this.stage=1;
    this.stageStartedAt=0;
    this.stageGrant=0;
    this.wave=0;
    this.nextWave=mission.id==='survival'?19:14;
    this.routeClock=0;
    this.alarm=0;
    this.kills=0;
    this.friendly=0;
    this.lost=0;
    this.evacuated=0;
    this.quota=mission.quota?Math.ceil(mission.pop*mission.quota):0;
    this.rescueMinimum=mission.atlas?Math.ceil(mission.pop*.05):0;
    this.clearedAt=null;
    this.extractions=0;
    this.flags=new Set();
    this.bridgeDamage=new Set();
    if(!mission.atlas) this.place('safe',this.map.end,true);
    const homes = this.map.homes.slice();
    const far=this.grid.field([this.map.start],i=>open(this.map.cells,i));
    const towards=this.grid.field([this.map.end],i=>open(this.map.cells,i));
    for (let i=homes.length-1;i>0;i--) {
      const j=Math.floor(this.rng()*(i+1));
      [homes[i],homes[j]]=[homes[j],homes[i]];
    }
    const favorable=homes.filter(i=>far[i]>(mission.id===0?13:8) && towards[i]<(mission.metro?60:24));
    const exposed=mission.containment?homes.filter(i=>far[i]<(mission.metro?15:12)):[];
    const exposure=mission.atlas?17:5;
    for(let i=0;i<mission.pop;i++) {
      const group=exposed.length&&i%exposure===0?exposed:i%4!==0&&favorable.length?favorable:homes;
      this.civs.push(this.person(group[i%group.length],{speed:(1.15+this.rng()*.55)*(this.has('train')?1.25:1), wait:this.rng()*(mission.containment?3.5:2)}));
    }
    this.outbreak=mission.atlas&&attempt?this.chooseOutbreak(attempt,far,towards):this.map.start;
    this.outbreakHistory=new Set([this.outbreak]);
    this.spawnWave(true);
  }

  chooseOutbreak(attempt,far,towards) {
    const {start,end,cells,seed}=this.map;
    const distance=towards[start];
    const nearby=cells.flatMap((type,i)=>type===t.road&&far[i]>=10&&far[i]<=32&&towards[i]>=Math.min(16,distance)?[i]:[]);
    const similar=nearby.filter(i=>Math.abs(towards[i]-distance)<=15);
    const sites=similar.length>=12?similar:nearby;
    const rng=random(seed+8329);
    const origins=[start];
    while(sites.length&&origins.length<8) {
      const n=Math.floor(rng()*sites.length), site=sites[n];
      sites[n]=sites.at(-1);
      sites.pop();
      if(origins.every(i=>this.grid.dist(i,site)>=8)) origins.push(site);
    }
    if(origins.length===1) {
      const alternative=cells.findIndex((type,i)=>type===t.road&&i!==end&&far[i]>=4&&far[i]<30000&&towards[i]>=4);
      if(alternative>=0) origins.push(alternative);
    }
    return origins[attempt%origins.length];
  }

  location(i) { return this.map.anchors?.[i]||this.grid.point(i); }
  has(id) { return this.skills.includes(id); }
  person(i, extra={}) {
    const [x,z]=this.location(i);
    const spacing=this.walls.near.has(i)?0:this.mission.metro?.42:.59;
    const ox=(this.rng()-.5)*spacing, oz=(this.rng()-.5)*spacing;
    return {i,target:i,x:x+ox,z:z+oz,ox,oz,visualID:this.personCount++,angle:0,...extra};
  }
  get sheltered() {
    let total=this.evacuated;
    for(const u of this.units.values()) total+=u.sheltered;
    return total;
  }
  get remaining() { return this.zombies.length; }
  get helicopter() { return this.reinf.find(r=>r.id==='heli'&&!r.done); }
  get survivors() { return this.mission.pop-this.lost; }
  get stalled() { return this.mission.atlas&&this.combat&&this.remaining>0&&this.time-this.lastProgressAt>=24; }
  get stages() { return this.mission.atlas?atlasStageCount:1; }
  get outbreakHidden() { return this.mission.atlas&&this.phase==='prep'; }
  get visibleZombies() { return this.outbreakHidden?hiddenZombies:this.zombies; }
  get visibleFog() { return this.outbreakHidden?null:this.fog; }
  get combat() { return this.phase==='live'; }
  get canConfirm() { return this.combat&&this.clearedAt!==null&&this.evacuated>=this.quota; }
  get latestBreach() { return this.breaches.at(-1); }
  learnTraining(id) {
    if(!this.mission.atlas||this.phase!=='prep'||this.training.has(id)) return false;
    this.training.add(id);
    if(!this.has(id)) this.skills.push(id);
    if(id==='reserve') this.money+=110;
    if(id==='wing') {
      this.supportCapacity+=2;
      this.supportReserve+=2;
    }
    if(id==='train') for(const c of this.civs) c.speed*=1.25;
    for(const u of [...this.units.values(),...this.marches.map(m=>m.u),...this.walls.sections.values()]) {
      if(id==='bunks'&&u.id==='safe') u.cap+=40;
      if(id==='veteran') u.level=Math.max(u.level??1,2);
      if(id==='mining'&&u.id==='mines') u.charges++;
      if(id==='concrete'&&defenses[u.id].hp) {
        u.hp*=1.4;
        u.maxHp*=1.4;
      }
    }
    return true;
  }
  zoneAt(i) { return this.zoneCells.get(i); }
  shelterAt(i) {
    const zone=this.zoneAt(i);
    return zone?.entries&&!zone.entries.has(i)?undefined:zone;
  }
  usesRoof(id) { return !!this.map.buildings&&roofRoles.has(id); }
  roofOccupant(site) {
    for(const u of this.units.values()) if(u.building===site) return u;
    return this.marches.find(m=>m.building===site&&!m.done)?.u;
  }
  roofZone(site) {
    for(const u of this.units.values()) if(u.id==='safe'&&(u.building===site||u.roofs?.includes(site))) return u;
  }
  availableRoof(site) { return !this.roofOccupant(site); }
  roofFor(i) { return this.map.buildings?.byAccess[i]?.find(site=>this.availableRoof(site)); }
  roofAccess(id,site) { return site.access.find(i=>this.legal(id,i,site)); }
  hasBuildingDefense(u) {
    return !!u?.building&&this.units.get(u.i)===u&&!!defenses[u.id]?.range;
  }
  combatStats(u,equipment=u.equipment??1) {
    const spec=defenses[u.id], bonus=equipment-1;
    const trainedSniper=u.id==='sniper'&&this.training.has('marks');
    const trainedMortar=u.id==='mortar'&&this.training.has('artillery');
    return {
      range:spec.range*(trainedSniper?1.2:1)*(1+bonus*.12)*(this.mission.atlas&&u.id==='sniper'&&u.building
        ?1+clamp((u.building.height-.45)*.22,0,.22):1),
      hit:spec.hit*(1+(u.level-1)*.25)*(this.has('burst')?1.25:1)*(1+bonus*.15),
      delay:spec.delay*(1-(u.level-1)*.1)*(trainedMortar?.77:1)
    };
  }
  upgradePlan(u) {
    if(!this.hasBuildingDefense(u)||this.phase!=='prep'&&!this.combat) return null;
    const equipment=(u.equipment??1)+1;
    if(equipment>maxEquipment) return null;
    const price=Math.max(25,Math.round(defenses[u.id].price*(equipment===2?.62:.9)/5)*5);
    return {equipment,price,...this.combatStats(u,equipment)};
  }
  upgradeUnit(u) {
    const plan=this.upgradePlan(u);
    if(!plan||plan.price>this.money) return false;
    this.money-=plan.price;
    u.paid+=plan.price;
    u.equipment=plan.equipment;
    this.emit('level',u.i,u.level);
    return true;
  }
  canBatchRoof(id) {
    return this.phase==='prep'&&this.usesRoof(id)&&!!defenses[id].range&&canUse(id,this.skills);
  }
  planRoofBatch(id,contour,from=contour[0]) {
    const plan={contour,placements:[],price:0};
    if(!this.canBatchRoof(id)) return {...plan,error:'Choisis une défense à installer sur les bâtiments.'};
    const xs=contour.map(p=>p[0]),zs=contour.map(p=>p[1]);
    const left=Math.min(...xs),right=Math.max(...xs),top=Math.min(...zs),bottom=Math.max(...zs);
    const cost=this.cost(id),limit=Math.floor(this.money/cost);
    if(!limit) return {...plan,error:`Il manque ${cost-this.money} cr pour équiper un bâtiment.`};
    const candidates=[...this.map.buildings.near([left,top],[right,bottom])]
      .filter(site=>this.availableRoof(site)&&(within(site.point,contour)||polygonsOverlap(site.polygon,contour)))
      .sort((a,b)=>Math.hypot(a.point[0]-from[0],a.point[1]-from[1])-Math.hypot(b.point[0]-from[0],b.point[1]-from[1]));
    const access=new Map(),claims=new Map();
    function assign(site,visited) {
      for(const i of access.get(site)) if(!claims.has(i)) {
        claims.set(i,site);
        return true;
      }
      for(const i of access.get(site)) if(!visited.has(i)) {
        visited.add(i);
        if(assign(claims.get(i),visited)) {
          claims.set(i,site);
          return true;
        }
      }
      return false;
    }
    for(const site of candidates) {
      access.set(site,site.access.filter(i=>this.legal(id,i,site)));
      assign(site,new Set());
      if(claims.size===limit) break;
    }
    plan.placements=[...claims].map(([i,site])=>({site,i}));
    plan.price=plan.placements.length*cost;
    if(!plan.price) plan.error='Aucun bâtiment libre et accessible dans le secteur.';
    return plan;
  }
  deployRoofBatch(id,plan) {
    let count=0;
    for(const {site,i} of plan.placements) if(this.place(id,i,false,site)) count++;
    return count;
  }
  baseCapacity() { return (this.mission.cap||defenses.safe.cap)+(this.has('bunks')?(this.mission.atlas?40:8):0); }
  canBuild(i) { return open(this.map.cells,i)&&(this.mission.atlas||this.grid.dist(this.map.start,i)>(this.mission.containment?2:0)); }
  civilPass(i,from=i) {
    const u=this.units.get(i),structure=defenses[u?.id];
    return open(this.map.cells,i)&&(!structure?.barrier||(structure.passCivil===true&&!u.closed))&&!this.walls.obstruction(from,i,true);
  }
  guideBlocked(from,to) {
    return !this.civilPass(from)||!this.civilPass(to,from)||this.combat&&
      (this.threat?.[from]<evacuationClearance||this.threat?.[to]<evacuationClearance);
  }
  structureAt(i) {
    const u=this.units.get(i);
    return defenses[u?.id]?.barrier?u:this.zoneAt(i);
  }
  hasStructure(u) {
    return !!u&&(u.edges?this.walls.sections.get(u.key)===u:this.structureAt(u.i)===u);
  }
  structurePosition(u) {
    return u.edges?[(u.a[0]+u.b[0])/2,(u.a[1]+u.b[1])/2]:this.location(u.i);
  }
  toggleGate(gate) {
    if(!this.combat||!this.hasStructure(gate)||gate.id!=='gate') return false;
    gate.closed=!gate.closed;
    this.routeClock=0;
    this.emit('gate',gate.i);
    return true;
  }
  repairPlan(u) {
    if(!this.hasStructure(u)||!this.combat||u.hp>=u.maxHp||this.repairs.has(u)) return null;
    const gain=Math.min(120,u.maxHp-u.hp);
    return {gain,price:Math.max(5,Math.ceil(gain*.35))};
  }
  startRepair(u) {
    const plan=this.repairPlan(u);
    if(!plan||plan.price>this.money) return false;
    this.money-=plan.price;
    this.repairs.set(u,{...plan,until:this.time+3});
    return true;
  }
  finishRepairs() {
    for(const [u,repair] of this.repairs) if(repair.until<=this.time) {
      this.repairs.delete(u);
      if(this.hasStructure(u)) {
        u.hp=Math.min(u.maxHp,u.hp+repair.gain);
        this.emit('repair',u.i);
      } else this.money+=repair.price;
    }
  }
  wallGatePrice() { return this.cost('gate')-this.cost('wall'); }
  gateCost(i) {
    const before=this.units.get(i);
    return this.cost('gate')-(before?.id==='wall'||before?.id==='barricade'?before.paid:0);
  }
  legal(id,i,building=null) {
    if(id==='safe'&&this.zoneAt(i)) return false;
    if(this.phase==='prep'&&this.marches.some(m=>m.to===i)) return false;
    if(id==='safe'&&this.combat&&this.quota) return open(this.map.cells,i)&&!this.units.has(i)&&!this.marches.some(m=>m.to===i)&&this.money>=this.cost(id);
    if(id==='gate'&&this.phase==='prep'&&this.canBuild(i)) {
      const before=this.units.get(i);
      return (!before||before.id==='wall'||before.id==='barricade')&&this.money>=this.gateCost(i);
    }
    if (!this.combat || !this.support[id]) return this.phase==='prep' && defenses[id] && this.canBuild(i)
      && !this.units.has(i) && canUse(id,this.skills) && this.money>=this.cost(id)
      && (!this.usesRoof(id)||(building?building.access.includes(i)&&this.availableRoof(building):!!this.roofFor(i)));
    return open(this.map.cells,i)&&this.canDirectSupport(id);
  }
  cost(id) {
    const info=defenses[id]||this.support[id];
    const price=this.mission.atlas?(atlasPrices[id]??info.price):info.price;
    return Math.round(price*(this.support[id]?.air && this.has('wing') ? .7 : 1));
  }
  supportCost(id) {
    return this.mission.atlas?this.support[id].chargeCost:this.cost(id);
  }
  get supportKit() {
    if(!this.preparedSupport) return this.support;
    return Object.fromEntries(Object.entries(this.support).filter(([id])=>this.preparedSupport.has(id)));
  }
  get reservedSupportPoints() {
    return Math.max(0,(this.preparedSupport?.size||0)-freeSupportSlots);
  }
  canPrepareSupport(id) {
    return Object.hasOwn(this.support,id)&&!(this.mission.noair&&this.support[id].air)&&canUse(id,this.skills);
  }
  canToggleSupport(id,points) {
    return !!this.preparedSupport&&this.phase==='prep'&&this.canPrepareSupport(id)
      &&(this.preparedSupport.has(id)||this.preparedSupport.size<freeSupportSlots+points);
  }
  toggleSupport(id,points) {
    if(!this.canToggleSupport(id,points)) return false;
    if(!this.preparedSupport.delete(id)) this.preparedSupport.add(id);
    return true;
  }
  supportStatus(id) {
    if(!this.combat||!Object.hasOwn(this.support,id)||this.mission.noair&&this.support[id].air
      ||this.preparedSupport&&!this.preparedSupport.has(id)) return 'unavailable';
    if(!canUse(id,this.skills)) return 'locked';
    const flight=this.mission.atlas&&id==='heli'?this.helicopter:null;
    if(flight) {
      return this.time>=flight.t?'patrol':flight.departedAt!==undefined?'refueling':'incoming';
    }
    const balance=this.mission.atlas?this.supportReserve:this.money;
    if(balance<this.supportCost(id)) return 'empty';
    return this.cd[id]>this.time?'cooldown':'ready';
  }
  canDirectSupport(id) {
    return ['ready','patrol','refueling','incoming'].includes(this.supportStatus(id));
  }
  place(id,i,free=false,building=null) {
    if (!free && !this.legal(id,i,building)) return false;
    const d=defenses[id];
    const hp=(d.hp || 115)*(this.has('concrete')&&d.hp ? 1.4 : 1);
    const cap=d.cap?this.baseCapacity():0;
    const old=id==='gate'?this.units.get(i):null;
    const paid=free?0:this.cost(id);
    const debit=old?this.gateCost(i):paid;
    const charges=id==='mines'&&this.training.has('mining')?d.charges+1:d.charges;
    const u={id,i,hp,maxHp:hp,level:this.has('veteran')?2:1,xp:0,fireAt:0,sheltered:0,cap,rescueAt:this.time+12,charges,fixed:free,angle:old?.angle||0,paid};
    if(this.usesRoof(id)) u.building=building||this.roofFor(i);
    this.units.set(i,u);
    if(id==='safe') {
      u.tiles=[i];
      u.edge=u.building?[]:wallSections(rectangle(this.grid,i,i),true);
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
    const contour=Array.isArray(from)?simplify(from,true):rectangle(this.grid,from,to);
    const plan={tiles:[],contour,price:this.cost('safe'),cap:this.baseCapacity()};
    if(this.phase!=='prep'&&!(this.combat&&this.quota)) return {...plan,error:'Le tracé se fait pendant la préparation.'};
    const error=polygonError(contour);
    if(error) return {...plan,error};
    plan.validShape=true;
    const xs=contour.map(p=>p[0]),zs=contour.map(p=>p[1]);
    const left=Math.min(...xs),right=Math.max(...xs),top=Math.min(...zs),bottom=Math.max(...zs);
    plan.tiles=this.cellsInside(contour,i=>(this.combat?open(this.map.cells,i):this.canBuild(i))
      &&!this.zoneAt(i)&&!defenses[this.units.get(i)?.id]?.barrier);
    const limit=this.mission.metro?48:32;
    if(plan.tiles.length>limit) return {...plan,error:`Réduis le tracé à ${limit} cases accessibles.`};
    if(plan.tiles.length<2) return {...plan,error:'Trace une zone avec au moins deux cases de rue ou de parc reliées.'};
    const position=this.grid.cell(Math.floor((left+right)/2),Math.floor((top+bottom)/2));
    const choices=plan.tiles.filter(i=>!this.units.has(i)&&!this.marches.some(m=>m.to===i));
    choices.sort((a,b)=>this.grid.dist(a,position)-this.grid.dist(b,position));
    plan.anchor=choices[0];
    plan.price+=(plan.tiles.length-1)*(this.mission.atlas?4:10);
    plan.cap+=(plan.tiles.length-1)*(this.mission.metro?6:4);
    if(this.usesRoof('safe')) {
      const tiles=new Set(plan.tiles);
      const roofs=new Set(plan.tiles.flatMap(i=>this.map.buildings.byAccess[i]||[]));
      plan.roofs=[...roofs].filter(site=>within(site.point,contour));
      const allowed=new Set(plan.roofs);
      const anchor=choices.find(i=>{
        plan.building=this.map.buildings.byAccess[i]?.find(site=>allowed.has(site)&&this.availableRoof(site));
        return !!plan.building;
      });
      if(anchor===undefined) return {...plan,error:'Inclus un bâtiment libre et son accès dans le contour.'};
      plan.anchor=anchor;
      plan.entries=new Set(plan.roofs.map(site=>site.access.find(i=>tiles.has(i))));
      plan.entries.add(anchor);
    }
    plan.edge=wallSections(contour,true,this.mission.atlas?10:undefined);
    if(this.mission.atlas&&this.phase==='prep') {
      plan.walls=this.walls.plan(plan.edge);
      plan.price+=plan.walls.price;
      plan.residents=this.civs.filter(c=>c.x>=left&&c.x<=right&&c.z>=top&&c.z<=bottom&&within([c.x,c.z],contour)).length;
    }
    if(plan.anchor===undefined) plan.error='Laisse une case libre pour le refuge.';
    else if(this.visibleZombies.some(z=>within(this.location(z.i),contour))) plan.error='Écarte le tracé des infectés.';
    else if(plan.price>this.money) plan.error=plan.walls
      ?`Il manque ${plan.price-this.money} cr pour la zone et ses murs (${plan.price} cr).`
      :`Budget insuffisant · ${plan.price} cr nécessaires.`;
    return plan;
  }
  cellsInside(contour,pass) {
    const xs=contour.map(p=>p[0]),zs=contour.map(p=>p[1]),{w,h,cell}=this.grid;
    const tiles=[];
    const right=Math.min(w-1,Math.ceil(Math.max(...xs))+1);
    const bottom=Math.min(h-1,Math.ceil(Math.max(...zs))+1);
    for(let z=Math.max(0,Math.floor(Math.min(...zs))-1);z<=bottom;z++) {
      for(let x=Math.max(0,Math.floor(Math.min(...xs))-1);x<=right;x++) {
        const i=cell(x,z);
        if(pass(i)&&within(this.location(i),contour)) tiles.push(i);
      }
    }
    return largestArea(this.grid,tiles);
  }
  planWaiting(path) {
    const contour=simplify(path,true), plan={contour,tiles:[]};
    const error=polygonError(contour);
    if(error||!this.mission.atlas||this.phase!=='prep'&&!this.combat) return {...plan,error:error||'Tracé indisponible.'};
    plan.validShape=true;
    if(this.waitingZones.length>=4) return {...plan,error:'Libère les zones d’attente avant d’en tracer d’autres.'};
    plan.tiles=this.cellsInside(contour,i=>this.civilPass(i)&&!this.zoneAt(i)&&!this.waitingZones.some(z=>z.tiles.includes(i)));
    if(plan.tiles.length<2||plan.tiles.length>48) plan.error='Trace de 2 à 48 cases de rue ou de parc reliées.';
    else if(this.visibleZombies.some(z=>within([z.x,z.z],contour))) plan.error='Écarte la zone d’attente des infectés.';
    return plan;
  }
  drawWaiting(path) {
    const plan=this.planWaiting(path);
    if(plan.error) return false;
    this.waitingZones.push(plan);
    this.routeClock=0;
    return true;
  }
  releaseWaiting() {
    this.waitingZones=[];
    this.routeClock=0;
  }
  drawZone(from,to) {
    const plan=this.planZone(from,to);
    if(plan.error||!this.place('safe',plan.anchor,false,plan.building)) return null;
    const zone=this.units.get(plan.anchor);
    const zonePrice=plan.price-(plan.walls?.price||0);
    this.money-=zonePrice-zone.paid;
    zone.paid=zonePrice;
    zone.cap=plan.cap;
    zone.tiles=plan.tiles;
    zone.contour=plan.contour;
    zone.roofs=plan.roofs;
    zone.entries=plan.entries;
    zone.edge=plan.edge;
    for(const i of zone.tiles) this.zoneCells.set(i,zone);
    if(plan.walls?.segments.length) this.buildWalls(plan.walls);
    return zone;
  }
  planWalls(path) {
    return this.walls.plan(wallSections(simplify(path),false,this.mission.atlas?18:undefined));
  }
  fortification(zone) {
    const sections=zone&&this.units.get(zone.i)===zone?zone.edge:[];
    return {...this.walls.plan(sections),gates:sections.filter(s=>this.walls.sections.get(s.key)?.id==='gate').length};
  }
  buildWalls({segments,price}) {
    if(this.phase!=='prep'||!segments.length||price>this.money) return false;
    const hp=defenses.wall.hp*(this.has('concrete')?1.4:1);
    for(const section of segments) this.walls.add(section,hp);
    this.money-=price;
    this.routeClock=0;
    if(this.units.size+this.walls.sections.size>=9) this.flags.add('fort');
    this.emit('build',this.walls.sections.get(segments[0].key).i,'wall');
    return true;
  }
  drawWalls(path) { return this.buildWalls(this.planWalls(path)); }
  surround(zone) { return this.buildWalls(this.fortification(zone)); }
  gateWall(wall) {
    const price=this.wallGatePrice();
    if(this.phase!=='prep'||this.walls.sections.get(wall.key)!==wall||wall.id!=='wall'||!this.walls.openings(wall).length||price>this.money) return false;
    wall.id='gate';
    wall.paid+=price;
    wall.hp=wall.maxHp=defenses.gate.hp*(this.has('concrete')?1.4:1);
    this.money-=price;
    this.routeClock=0;
    this.emit('build',wall.i,'gate');
    return true;
  }
  sellWall(wall) {
    if(this.phase!=='prep'||!this.walls.remove(wall)) return false;
    this.money+=wall.paid;
    this.routeClock=0;
    return true;
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
  order(from,to,building=null) {
    if(!this.canMove(from)||!open(this.map.cells,to)||this.units.has(to)||this.marches.some(m=>m.to===to)) return false;
    const route=this.walkRoute(from,to);
    if(!route) return false;
    const u=this.units.get(from);
    const [x,z]=this.location(from);
    if(building&&(!this.availableRoof(building)||!building.access.includes(to))) return false;
    this.units.delete(from);
    u.building=undefined;
    this.marches.push({u,to,building,route,next:1,x,z,i:from,target:route[1],ox:0,oz:0,angle:u.angle,retryAt:0});
    this.routeClock=0;
    return true;
  }
  walkRoute(from,to) {
    if(!this.civilPass(to)) return null;
    const paths=this.grid.field([to],(i,j)=>this.civilPass(i,j));
    if(paths[from]>=30000) return null;
    const route=[from];
    for(let i=from;i!==to;) {
      i=this.grid.adjacent[i].find(j=>paths[j]<paths[i]&&this.civilPass(j,i));
      route.push(i);
    }
    return route;
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
      if(!m.route) {
        if(m.retryAt>this.time) continue;
        m.route=this.walkRoute(m.i,m.to);
        m.retryAt=this.time+1;
        if(!m.route) continue;
        m.next=1;
        m.target=m.route[1];
      }
      if(this.travel(m,dt,2.55)) continue;
      if(m.i===m.to) {
        m.u.i=m.to;
        m.u.angle=m.angle;
        m.u.building=m.building;
        this.units.set(m.to,m.u);
        this.emit('build',m.to,m.u.id);
        m.done=true;
        this.routeClock=0;
      } else {
        const next=m.route[++m.next];
        if(this.civilPass(next,m.i)) m.target=next;
        else {
          m.target=m.i;
          m.route=null;
          m.retryAt=0;
        }
      }
    }
    if(this.marches.some(m=>m.done)) this.marches=this.marches.filter(m=>!m.done);
  }
  setGuide(cells, append=false) {
    const course=append ? this.guide.slice() : [];
    for(const i of cells) if (this.civilPass(i) && course.at(-1)!==i) {
      const a=course.at(-1);
      if(a!==undefined&&(this.grid.dist(a,i)>1||!this.civilPass(i,a))) {
        const path=this.grid.field([i],(j,k)=>this.civilPass(j,k));
        if(path[a]>=30000) continue;
        let j=a;
        while(path[j]>1 && path[j]<30000) {
          j=this.grid.adjacent[j].find(k=>path[k]<path[j]&&this.civilPass(k,j));
          this.extendGuide(course,j);
        }
      }
      this.extendGuide(course,i);
    }
    this.guide=[...new Set(course)].slice(this.mission.metro?-320:-100);
    if(this.guide.length>=10) this.flags.add('guide');
    this.routeClock=0;
  }
  extendGuide(course,i) {
    const revisit=this.mission.atlas?course.indexOf(i):-1;
    if(revisit>=0) course.length=revisit+1;
    else course.push(i);
  }
  prepare() {
    if (this.phase!=='prep') return false;
    if(this.walls.sections.size) for(const p of [...this.civs,...this.zombies]) if(this.walls.near.has(p.i)) {
      [p.x,p.z]=this.location(p.i);
    }
    this.stageStartedAt=this.time;
    this.lastProgressAt=this.time;
    this.contactGroups=[];
    this.phase='live';
    this.emit('siren',this.outbreak);
    return true;
  }
  advanceStage() {
    const {cells,homes}=this.map;
    const walkable=i=>open(cells,i);
    const territory=this.grid.field([...this.civs.map(c=>c.i),...this.zoneCells.keys()].filter(walkable),walkable);
    const previous=this.grid.field([this.outbreak],walkable);
    const sites=homes.filter(i=>cells[i]===t.road&&territory[i]<unreachable&&!this.zoneAt(i)&&!this.outbreakHistory.has(i));
    const nearby=sites.filter(i=>previous[i]>=12&&previous[i]<=34);
    const choices=nearby.length?nearby:sites;
    this.outbreak=choices[Math.floor(this.rng()*choices.length)]??cells.findIndex(walkable);
    this.outbreakHistory.add(this.outbreak);
    this.stage++;
    this.stageGrant=Math.round(this.mission.budget*this.difficulty.budget*(this.stage===2?.40:.48));
    this.money+=this.stageGrant;
    this.supportReserve=Math.min(this.supportCapacity,this.supportReserve+Math.ceil(this.supportCapacity/2));
    this.reinf=this.reinf.filter(r=>!r.done&&(r.id==='para'||r.id==='heli'));
    this.clouds=[];
    this.noises=[];
    this.breaches=[];
    this.cd={};
    for(const m of this.marches) {
      [m.x,m.z]=this.location(m.i);
      m.target=m.i;
      m.route=null;
      m.retryAt=0;
    }
    this.fog.fill(0);
    this.wave=0;
    this.phase='prep';
    this.spawnWave(true);
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
    const fastRate=this.mission.atlas&&this.stage>1?.28:Math.min(.5,.16+rank*.022);
    const finalStage=this.mission.atlas&&this.stage===this.stages;
    const origin=this.outbreak;
    const starts=[origin,...this.grid.adjacent[origin].filter(i=>open(this.map.cells,i))];
    if(this.mission.containment) {
      const paths=this.grid.field([origin],i=>open(this.map.cells,i));
      const reach=this.mission.mapId==='strasbourg'?8:this.mission.atlas?6:this.mission.metro?9:5;
      const margin=this.map.cells.flatMap((_,i)=>paths[i]>=2&&paths[i]<=reach?[i]:[]);
      const spread=this.mission.atlas?7:this.mission.metro?14:6;
      for(let n=0; n<spread && margin.length; n++) starts.push(margin.splice(Math.floor(this.rng()*margin.length),1)[0]);
    }
    const breach=!first&&this.map.breach!=null&&wave%2===1 ? this.map.breach : null;
    const number=first ? count*(1+.2*(this.stage-1))
      : (id==='survival' ? 10+wave*5 : Math.round(count*(.28+.055*wave)));
    const amount=Math.round(number*this.difficulty.factor);
    for(let n=0;n<amount;n++) {
      const r=this.rng();
      let kind='slow';
      if (r<fastRate && (rank>0 || !first || this.mission.containment)) kind='fast';
      if (r>.76&&rank>=2||r>.90&&finalStage) kind='brute';
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
    if(!this.mission.atlas) this.money+=infected[z.id].value;
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
      const broken=new Set();
      for(let j=0;j<this.map.cells.length;j++) if(this.map.cells[j]===t.bridge && this.grid.dist(i,j)<=radius) {
        this.map.cells[j]=t.water;
        broken.add(j);
        this.bridgeDamage.add(j);
        const u=this.units.get(j)||this.zoneAt(j);
        if(u) this.collapse(u,j);
      }
      if(broken.size) {
        for(const c of this.civs) if(!c.dead&&broken.has(c.i)) {
          c.dead=true;
          this.lost++;
          if(kind!=='infected') this.friendly++;
        }
        for(const z of this.zombies) if(broken.has(z.i)) this.damage(z,Infinity,u);
        for(const p of [...this.civs,...this.zombies]) if(broken.has(p.target)) p.target=p.i;
      }
      this.routeClock=0;
    }
    this.emit(kind,i);
    this.shout(i,13,5);
  }
  collapse(u,at=u.i) {
    const repair=this.repairs.get(u);
    if(repair) {
      this.money+=repair.price;
      this.repairs.delete(u);
    }
    if(this.hasStructure(u)) {
      const breach={id:u.id,point:this.structurePosition(u),until:this.time+18};
      this.breaches.push(breach);
      if(this.breaches.length>4) this.breaches.shift();
      if(this.mission.atlas) {
        this.breachHistory.push(breach);
        if(this.breachHistory.length>4) this.breachHistory.shift();
      }
    }
    if(u.edges) {
      this.walls.remove(u);
      this.emit('collapse',u.i,u.id);
      this.routeClock=0;
      return;
    }
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
    if(!open(this.map.cells,i)||!this.canDirectSupport(id)) return false;
    if(this.mission.atlas&&id==='heli'&&this.helicopter) {
      this.helicopter.i=i;
      return true;
    }
    const cost=this.supportCost(id);
    if(this.mission.atlas) this.supportReserve-=cost;
    else this.money-=cost;
    this.cd[id]=this.time+this.support[id].cd*(this.has('dispatch')?.75:1);
    this.emit('support',i,id);
    if(id==='air') this.flags.add('air');
    const delay={para:1.4,air:1.05,missile:1.55,gas:.65,heli:1.45,tank:.85,decoy:.45,medevac:1.45,flash:.7};
    const duration=id==='heli'?(this.training.has('rotor')?18:12):id==='tank'&&this.training.has('tank')?36:28;
    const r={id,i,t:this.time+delay[id],until:this.time+duration,saved:0,angle:0,level:1,xp:0,fireAt:0};
    if(this.mission.atlas&&id==='para') {
      [r.x,r.z]=this.location(i);
      Object.assign(r,{target:i,ox:0,oz:0,hp:120,until:Infinity});
      this.routeClock=0;
    }
    if(this.mission.atlas&&id==='heli') {
      const [x,z]=this.location(i);
      r.until=r.t+this.helicopterEndurance();
      r.enterAt=this.time;
      r.base=[x<this.grid.w/2?-5:this.grid.w+4,z];
      [r.x,r.z]=r.base;
    }
    this.reinf.push(r);
    return true;
  }
  moveParatroopers(r,dt) {
    if(!open(this.map.cells,r.i)) {r.done=true;return;}
    const near=[r.i,...this.grid.adjacent[r.i]];
    let pressure=0;
    for(const i of near) for(const z of this.foesByCell?.get(i)||[]) {
      if(z.hp>0&&!(z.stunnedUntil>this.time)&&metric(z,r)<.64&&!this.walls.crosses(r.i,[r.x,r.z],[z.x,z.z])) pressure++;
    }
    r.hp-=Math.min(4,pressure)*22*dt;
    if(r.hp<=0) {
      r.done=true;
      this.emit('squad-lost',r.i);
      this.routeClock=0;
      return;
    }
    const target=r.fireAt<=this.time||r.target===r.i?this.target(r,3.8):null;
    this.fireSupport(r,target,.56,21);
    if(r.target!==r.i&&!this.civilPass(r.target,r.i)) r.target=r.i;
    if(this.travel(r,dt,2.15)||target&&metric(r,target)<2.7) return;
    const paths=this.pursuit;
    if(!paths) return;
    const next=this.grid.adjacent[r.i].find(i=>paths[i]<paths[r.i]&&this.civilPass(i,r.i));
    if(next!==undefined) r.target=next;
  }
  helicopterEndurance() { return this.training.has('rotor')?26:20; }
  flyHelicopter(r,dt) {
    if(this.time>=r.until) {
      r.departedAt=r.until;
      r.departure=[r.x,r.z];
      r.t=r.until+refuelTime;
      r.until=r.t+this.helicopterEndurance();
      r.enterAt=r.t-returnTime;
      r.saved=0;
    }
    const [x,z]=this.location(r.i);
    if(this.time<r.t) {
      const entering=this.time>=r.enterAt;
      const leaving=r.departedAt!==undefined&&this.time<r.departedAt+departureTime;
      r.airborne=entering||leaving;
      if(leaving) this.positionFlight(r,r.departure,r.base,(this.time-r.departedAt)/departureTime);
      else if(entering) this.positionFlight(r,r.base,[x,z],(this.time-r.enterAt)/(r.t-r.enterAt));
      return;
    }
    r.airborne=true;
    const heading=this.time*.85;
    const to=[x+Math.cos(heading),z+Math.sin(heading)];
    const distance=Math.hypot(to[0]-r.x,to[1]-r.z);
    this.positionFlight(r,[r.x,r.z],to, distance?Math.min(1,dt*8/distance):1);
    const tile=this.grid.cell(clamp(Math.round(r.x),0,this.grid.w-1),clamp(Math.round(r.z),0,this.grid.h-1));
    if(r.fireAt<=this.time) this.fireSupport(r,this.target(r,5.5),.57,34,tile);
    this.helicopterRescue(r);
  }
  positionFlight(r,from,to,progress) {
    const dx=to[0]-from[0],dz=to[1]-from[1];
    r.x=from[0]+progress*dx;
    r.z=from[1]+progress*dz;
    if(dx||dz) r.angle=Math.atan2(dx,dz);
  }
  fireSupport(r,target,delay,hit,origin=r.i) {
    if(!target||r.fireAt>this.time) return;
    r.angle=Math.atan2(target.x-r.x,target.z-r.z);
    r.fireAt=this.time+delay;
    this.damage(target,hit,r);
    this.emit('shot',target.i,r.id,origin);
  }
  helicopterRescue(r,position=r) {
    if(r.saved>=8||r.nextRescue>this.time) return;
    const c=this.civs.find(c=>!c.dead&&metric(position,c)<3.8);
    if(!c) return;
    c.dead=true; r.saved++; this.evacuated++; this.extractions++;
    r.nextRescue=this.time+.7;
    if(r.saved>=4) this.flags.add('heli');
  }
  operateSupport(dt) {
    for(const r of this.reinf) {
      if(!r.done&&this.mission.atlas&&r.id==='heli') {this.flyHelicopter(r,dt);continue;}
      if(r.done || r.t>this.time) continue;
      if(this.mission.atlas&&r.id==='para') {this.moveParatroopers(r,dt);continue;}
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
        if(r.id==='heli') this.helicopterRescue(r,{x,z});
        continue;
      }
      if(r.id==='missile') this.blast(r.i,315,2.25,this.training.has('guided')?.39:.62,null,'impact');
      if(r.id==='air') for(const n of [-2,0,2]) this.blast(this.grid.cell(Math.round(clamp(x+n,0,this.grid.w-1)),Math.round(z)),119,1.75,.43,null,'impact');
      if(r.id==='gas') {
        this.clouds.push({i:r.i,x,z,until:this.time+7});
        this.emit('gas',r.i);
      }
      if(r.id==='decoy') {
        this.shout(r.i,18,12);
        this.routeClock=0;
        this.emit('decoy',r.i);
      }
      if(r.id==='medevac') {
        const nearby=this.civs.filter(c=>!c.dead&&metric({x,z},c)<5).slice(0,80);
        for(const c of nearby) c.dead=true;
        this.evacuated+=nearby.length;
        this.emit('convoy',r.i,nearby.length);
      }
      if(r.id==='flash') {
        for(const z of this.zombies) if(metric({x,z},z)<4) z.stunnedUntil=this.time+5;
        this.emit('flash',r.i);
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
    const [x,z]=u.x===undefined?this.location(u.i):[u.x,u.z];
    let best, value=-Infinity;
    for(const foe of this.zombies) {
      if(foe.hp<=0 || Math.abs(x-foe.x)>range || Math.abs(z-foe.z)>range) continue;
      const d=metric({x,z},foe);
      if(d>range) continue;
      const p=u.id==='sniper' ? Math.min(foe.hp,95)-d : -d;
      const rooftop=this.mission.atlas&&u.id==='sniper';
      if(p>value && (rooftop||!this.mission.containment||!streetFire.has(u.id)||this.visible(x,z,foe))) {
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
    const {range,delay,hit}=this.combatStats(u);
    const target=this.target(u,range);
    if(!target) return;
    const [x,z]=this.location(u.i);
    u.angle=Math.atan2(target.x-x,target.z-z);
    u.fireAt=this.time+delay;
    if(d.blast) {
      this.blast(target.i,hit,d.blast,this.mission.atlas?0:d.friendly||0,u,u.id==='flame'?'flame':'blast');
    } else {
      this.damage(target,hit,u);
      this.emit('shot',target.i,u.id,u.i);
      this.shout(u.i,u.id==='sniper'?7:4,2);
    }
    if(u.charges && --u.charges===0) this.units.delete(u.i);
  }
  routes() {
    const pass=i=>open(this.map.cells,i);
    const civilPass=(i,j)=>this.civilPass(i,j);
    const atlas=this.mission.atlas;
    const intake=[];
    for(const [i,u] of this.zoneCells) if((!u.entries||u.entries.has(i))&&u.sheltered<u.cap&&civilPass(i)) intake.push(i);
    this.safeField=this.grid.field(intake,civilPass);
    const live=this.zombies.filter(z=>z.hp>0);
    const squads=this.mission.atlas?this.reinf.filter(r=>r.id==='para'&&!r.done&&r.t<=this.time):[];
    this.foesByCell=null;
    this.pursuit=null;
    if(squads.length) {
      this.foesByCell=new Map();
      for(const z of live) {
        if(!this.foesByCell.has(z.i)) this.foesByCell.set(z.i,[]);
        this.foesByCell.get(z.i).push(z);
      }
      this.pursuit=this.grid.field([...this.foesByCell.keys()].filter(i=>civilPass(i)),civilPass);
    }
    if(atlas) {
      const counts=new Map(),groups=new Map();
      for(const z of live) counts.set(z.i,(counts.get(z.i)||0)+1);
      for(const [i,count] of counts) {
        const [x,z]=this.grid.point(i),key=Math.floor(z/5)*this.grid.w+Math.floor(x/5);
        const group=groups.get(key)||{i,count:0,peak:0};
        group.count+=count;
        if(count>group.peak) {group.i=i;group.peak=count;}
        groups.set(key,group);
      }
      this.contactGroups=[...groups.values()].sort((a,b)=>b.count-a.count).slice(0,5);
    }
    this.threat=this.grid.field(live.map(z=>z.i),(i,j)=>pass(i)&&!this.walls.obstruction(i,j)
      &&(!atlas||!defenses[this.units.get(i)?.id]?.barrier));
    const clearPass=(i,j)=>this.threat[i]>=evacuationClearance&&civilPass(i,j);
    this.clearField=atlas&&live.length?this.grid.field(intake.filter(i=>clearPass(i)),clearPass):this.safeField;
    const calm=i=>this.threat[i]>=waitingClearance;
    this.retreatField=null;
    if(atlas&&live.length&&this.civs.some(c=>!calm(c.i)&&this.clearField[c.i]>=unreachable)) {
      const streets=[];
      for(let i=0;i<this.map.cells.length;i++) if(calm(i)&&civilPass(i)) streets.push(i);
      this.retreatField=this.grid.field(streets,civilPass);
    }
    this.guideRoute=new Set(this.guide);
    this.guideNext=null;
    this.guideExit=unreachable;
    this.guideStreetExit=-1;
    if(atlas&&this.guide.length) {
      const route=this.clearField[this.guide[0]]<this.clearField[this.guide.at(-1)]?this.guide.slice().reverse():this.guide;
      const exit=route.at(-1);
      this.guideExit=this.clearField[exit];
      if(this.guideExit===unreachable&&calm(exit)&&civilPass(exit)) this.guideStreetExit=exit;
      this.guideNext=new Map();
      if(this.guideExit<unreachable||this.guideStreetExit>=0) for(let n=route.length-1;n>0;n--) {
        const before=route[n-1], after=route[n];
        if(this.grid.dist(before,after)!==1||this.guideBlocked(before,after)) break;
        this.guideNext.set(before,after);
      }
      this.guideField=this.grid.field(this.guideNext.keys(),clearPass);
    } else this.guideField=this.grid.field(this.guide.filter(i=>this.safeField[i]<unreachable),civilPass);
    this.waitingField=this.waitingZones.length?this.grid.field(
      this.waitingZones.flatMap(z=>z.tiles.filter(i=>this.threat[i]>=waitingClearance)),
      (i,j)=>this.threat[i]>=waitingClearance&&civilPass(i,j)):null;
    const occupied=this.civs.filter(c=>!c.dead).map(c=>c.i);
    const targets=[...occupied,...this.units.keys(),...squads.map(r=>r.i)];
    for(const [i,zone] of this.zoneCells) if(!zone.entries||zone.entries.has(i)) targets.push(i);
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
    const offset=this.walls.near.has(p.target)?0:1;
    const dx=x+p.ox*offset-p.x, dz=z+p.oz*offset-p.z;
    const d=Math.hypot(dx,dz);
    if(d<.025) { p.i=p.target; return false; }
    const step=Math.min(d,speed*dt);
    p.x+=dx/d*step; p.z+=dz/d*step;
    p.angle=Math.atan2(dx,dz);
    return true;
  }
  moveCiv(c,dt) {
    if(c.dead || c.wait>this.time) return;
    const atlas=this.mission.atlas;
    if(atlas&&c.target!==c.i&&!this.civilPass(c.target,c.i)) c.target=c.i;
    if(this.travel(c,dt,c.speed)) return;
    const shelter=this.shelterAt(c.i);
    if(shelter&&shelter.sheltered<shelter.cap&&this.civilPass(c.i)) {
      shelter.sheltered++;
      if(!atlas) this.money+=3;
      else if(shelter.sheltered===shelter.cap) this.routeClock=0;
      this.emit('rescue',c.i);
      c.dead=true;
      return;
    }
    const danger=this.threat[c.i];
    const waiting=this.waitingField?.[c.i];
    if(waiting===0&&danger>=waitingClearance) return;
    const staging=waiting<19&&danger>=waitingClearance;
    const safeRoute=this.clearField[c.i]<unreachable;
    const junction=this.guideField[c.i]<8&&(safeRoute?this.clearField[c.i]>this.guideExit+2:this.guideStreetExit>=0);
    const follow=this.guideNext?.get(c.i);
    if(!staging&&follow!==undefined&&(!safeRoute||this.guideStreetExit<0)&&!this.guideBlocked(c.i,follow)) {
      c.target=follow;
      return;
    }
    if(atlas&&!safeRoute&&!staging&&danger>=waitingClearance&&(!junction||c.i===this.guideStreetExit)) return;
    const destination=safeRoute?this.clearField:atlas?this.retreatField:this.safeField;
    const here=this.guideRoute.has(c.i);
    let best=c.i, high=-Infinity;
    for(const i of this.grid.adjacent[c.i]) if(this.civilPass(i,c.i)) {
      const nextDanger=this.threat[i];
      if(atlas&&nextDanger<danger&&nextDanger<evacuationClearance) continue;
      const goal=destination?clamp(destination[c.i]-destination[i],-2,2):0;
      const escape=clamp(nextDanger-danger,-2,2)*(danger<evacuationClearance?5:danger<8?1.5:.35);
      const guide=clamp(this.guideField[c.i]-this.guideField[i],-2,2);
      const stage=staging?clamp(waiting-this.waitingField[i],-2,2)*9:0;
      const guidance=atlas?(junction&&!staging?guide*4.6:0):here?Number(this.guideRoute.has(i))*1.2:guide*.9;
      const detour=atlas&&!safeRoute&&this.clearField[i]<unreachable?15:0;
      const score=goal*(here?5:3)+escape+guidance+stage+detour+this.rng()*.7;
      if(score>high) { best=i; high=score; }
    }
    if(high>0 || (danger<4 && high>-1) || this.rng()<.11) c.target=best;
    c.wait=this.time+.09+this.rng()*.14;
  }
  moveFoe(z,dt) {
    if(z.hp<=0 || z.stunnedUntil>this.time || this.travel(z,dt,z.speed*(z.gassed?.58:1))) return;
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
    const reach=this.mission.atlas?.47:this.mission.containment?.56:.43;
    for(const i of near) for(const c of (this.civByCell.get(i)||[])) {
      if(!c.dead&&metric(z,c)<reach&&z.attackAt<=this.time
        &&!this.walls.obstruction(z.i,c.i)&&!this.walls.crosses(z.i,[z.x,z.z],[c.x,c.z])) {
        c.dead=true; this.lost++;
        this.spawn(c.i,this.rng()<.18?'fast':'slow');
        this.emit('infect',c.i);
        z.attackAt=this.time+(this.mission.atlas?.46:this.mission.containment?.32:.55);
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
    const here=this.units.get(z.i)||this.shelterAt(z.i);
    const obstruction=this.units.get(best);
    const target=here||this.walls.obstruction(z.i,best)||(obstruction&&defenses[obstruction.id].barrier?obstruction:null);
    if(target) {
      if(z.attackAt<=this.time) {
        z.attackAt=this.time+.65;
        target.hp-=spec.damage*this.difficulty.factor*.65;
        target.lastHit=this.time;
        this.emit('hit',target.i);
        if(target.hp<=0) this.collapse(target,target===here?z.i:target.i);
      }
    } else if(high<nav[z.i]+.4 || this.rng()<.16) z.target=best;
  }
  step(dt) {
    if(!this.combat) return;
    const {lost,kills}=this;
    this.time+=dt;
    while(this.breaches.length&&this.breaches[0].until<=this.time) this.breaches.shift();
    if(this.repairs.size) this.finishRepairs();
    if(this.wave<=this.mission.waves && this.time>=this.nextWave) {
      this.spawnWave();
      this.nextWave+=this.mission.id==='survival'?19:15.5;
    }
    this.routeClock-=dt;
    if(this.routeClock<=0) { this.routes(); this.routeClock=.27; }
    this.operateSupport(dt);
    if(this.marches.length) this.march(dt);
    if(this.quota) this.operateConvoys();
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
    if(this.lost!==lost||this.kills!==kills) this.lastProgressAt=this.time;
    const fading=Math.pow(this.mission.atlas?.89:.77,dt);
    for(let i=0;i<this.fog.length;i++) if(this.fog[i]>.015) this.fog[i]*=fading;
    const overrun=this.mission.id==='survival' && this.zombies.length>0 && !this.units.size && !this.marches.length
      && !this.reinf.some(r=>['para','tank','heli'].includes(r.id));
    const cutOff=this.mission.containment && this.zombies.length>0 && !this.civs.length && !this.units.size
      && !this.marches.length && !this.reinf.length && !this.clouds.length
      && !Object.keys(this.support).some(id=>{
        const status=this.supportStatus(id);
        return status==='ready'||status==='cooldown';
      });
    const final=this.wave>this.mission.waves;
    if((!this.civs.length&&!this.sheltered)||overrun||cutOff||this.survivors<this.rescueMinimum
      ||this.quota&&this.sheltered+this.civs.length<this.quota) this.phase='lost';
    if(this.combat&&final&&!this.zombies.length&&this.quota) {
      if(this.clearedAt===null) {
        this.clearedAt=this.time;
        this.emit('secure',this.map.end);
      }
      if(this.evacuated>=this.mission.pop-this.lost || this.time-this.clearedAt>=105) {
        this.phase=this.evacuated>=this.quota?'won':'lost';
      }
    } else if(this.combat && final && !this.zombies.length) {
      if(this.stage<this.stages) this.advanceStage();
      else {
        this.evacuated+=this.civs.length;
        this.civs.length=0;
        this.phase='won';
      }
    }
  }
  result() {
    const saved=this.quota?this.evacuated:this.sheltered+(this.mission.atlas?this.civs.length:0);
    const ratio=saved/this.mission.pop;
    const score=Math.max(0,Math.round(saved*100+(this.mission.atlas?0:this.kills*8)-this.friendly*175));
    const rank=ratio>=.88&&this.friendly<=2?3:ratio>=.60?2:1;
    return {saved, lost:this.lost, kills:this.kills, friendly:this.friendly, score, time:Math.floor(this.time), wave:this.wave, stars:this.phase==='won'?rank:0, money:this.money};
  }
}
