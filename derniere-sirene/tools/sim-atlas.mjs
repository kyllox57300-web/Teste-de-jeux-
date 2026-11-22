import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {atlas,defenses,terrain,withMutators} from '../source/data.mjs';
import {open} from '../source/city.mjs';
import {Game} from '../source/game.mjs';
import {defaults,finish,learn,parseSave,skillPoints} from '../source/progress.mjs';

const requested=process.argv.find(arg=>arg.startsWith('--city='))?.slice(7);
const missions=await Promise.all(atlas.filter(m=>!requested||m.mapId===requested).map(async mission=>({...mission,geography:JSON.parse(
  await readFile(new URL('../maps/'+mission.mapId+'.json',import.meta.url),'utf8')
)})));
const steps=.08;
function prepare(game,offset) {
  const {cells,start,end,homes}=game.map;
  const {field,dist,adjacent}=game.grid;
  const distance=field([start],i=>open(cells,i));
  const ring=5+offset;
  const options=cells.flatMap((_,i)=>game.canBuild(i)&&Math.abs(distance[i]-ring)<=5&&adjacent[i].filter(j=>open(cells,j)).length>=2?[i]:[]);
  for(const id of ['mortar','sniper','turret','sniper','mortar','soldier','sniper','turret','mines','explosive','soldier']) {
    const spec=defenses[id];
    if(game.money<spec.price+300) break;
    const ranked=options.filter(i=>game.legal(id,i)).map(i=>{
      const [x,z]=game.location(i);
      const contacts=game.zombies.filter(foe=>Math.hypot(foe.x-x,foe.z-z)<(spec.range||2)
        &&(id==='mortar'||id==='sniper'||game.visible(x,z,foe))).length;
      const spread=Math.min(4,...[...game.units.keys()].map(j=>dist(i,j)));
      return [i,contacts*.75+spread*.57-Math.abs(distance[i]-ring)*.63];
    }).sort((a,b)=>b[1]-a[1]);
    if(ranked.length) game.place(id,ranked[0][0]);
  }
  if(offset>0&&game.money>=390) {
    const refugee=homes.find(i=>dist(i,end)>8&&distance[i]>ring+12&&game.legal('safe',i));
    if(refugee!==undefined) {
      game.place('safe',refugee);
      game.setGuide([refugee,end]);
    }
  }
}
function react(game) {
  const crowds=new Map();
  for(const {i} of game.zombies) crowds.set(i,(crowds.get(i)||0)+1);
  const targets=[...crowds].sort((a,b)=>b[1]-a[1]).slice(0,8);
  for(const [i] of targets) {
    const [x,z]=game.location(i);
    const near=p=>Math.hypot(p.x-x,p.z-z);
    const cluster=game.zombies.filter(p=>near(p)<2.25).length;
    const civilians=game.civs.filter(p=>near(p)<2.8).length;
    if(cluster>=6&&civilians<=9&&(game.call('missile',i)||game.call('air',i)||game.call('gas',i))) return;
    const patrol=game.reinf.some(r=>r.id==='heli'||r.id==='para');
    if(game.time>12&&!patrol&&(cluster>=5||game.remaining<=5)&&(game.call('heli',i)||game.call('para',i))) return;
    if(cluster>=8&&civilians>12&&game.call('flash',i)) return;
  }
  for(const u of game.units.values()) if(u.id==='explosive'&&game.zombies.filter(z=>game.grid.dist(z.i,u.i)<=1).length>=4) {
    game.detonate(u.i);
  }
  if(game.remaining>6||game.time<13||game.marches.length) return;
  const target=targets[0]?.[0];
  if(target===undefined) return;
  const {field,dist}=game.grid;
  const responders=[...game.units.values()].filter(u=>game.canMove(u.i));
  if(responders.some(u=>u.id==='sniper'&&dist(u.i,target)<=5)) return;
  const route=field([target],(i,j)=>game.civilPass(i,j));
  responders.sort((a,b)=>route[a.i]-route[b.i]);
  const unit=responders.find(u=>route[u.i]<30000);
  if(!unit) return;
  const destination=game.map.homes.find(i=>route[i]===2&&!game.units.has(i)&&dist(unit.i,i)>1);
  if(destination!==undefined) game.order(unit.i,destination);
}
function run(mission,offset) {
  const game=new Game(mission);
  if(offset!==null) prepare(game,offset);
  game.prepare();
  let peak=game.remaining;
  for(let tick=0;tick<3400&&game.combat;tick++) {
    if(offset!==null&&tick%28===0) react(game);
    game.step(steps);
    peak=Math.max(peak,game.remaining);
    game.events.length=0;
  }
  return {game,peak,...game.result()};
}
const explore=process.argv.includes('--explore');
const save=defaults();
const report=[];
for(const mission of missions) {
  const base=new Game(mission);
  assert.ok(base.grid.field([base.map.start],i=>open(base.map.cells,i))[base.map.end]<30000);
  assert.ok(base.map.cells.includes(terrain.bridge));
  const failure=run(mission,null);
  const attempts=[0,5,12].map(offset=>run(mission,offset));
  const winner=attempts.filter(r=>r.game.phase==='won').sort((a,b)=>b.saved-a.saved)[0];
  report.push({ville:mission.name,population:mission.pop,
    'sans défense':failure.game.phase, 'pic sans défense':failure.peak,
    'essais (sauvés)':attempts.map(r=>r.game.phase==='won'?r.saved:r.game.phase+' '+r.saved).join(' / '),
    'meilleur (s)':winner?.time||0});
  if(winner) {
    assert.equal(winner.game.remaining,0);
    assert.equal(winner.saved+winner.lost,mission.pop);
    assert.equal(winner.score,Math.max(0,winner.saved*100-winner.friendly*175));
    finish(save,winner.game);
  }
}
console.table(report);
if(!explore) {
  assert.ok(report.every(r=>r['sans défense']==='lost'&&r['pic sans défense']>1000));
  assert.equal(skillPoints(save),missions.length);
  assert.ok(missions.every(m=>save.containment[m.id].saved>=m.pop*.6));
  assert.ok(learn(save,'reserve')===false);
  assert.ok(learn(save,'bunks'));
  assert.deepEqual(parseSave(JSON.stringify(save)),save);

  const metz=new Game(missions[0]);
  const roof=metz.map.buildings.sites.find(site=>metz.roofAccess('soldier',site)!==undefined);
  const entrance=metz.roofAccess('soldier',roof),credits=metz.money;
  assert.ok(metz.place('soldier',entrance,false,roof));
  assert.equal(metz.units.get(entrance).building,roof);
  assert.equal(metz.roofAccess('sniper',roof),undefined);
  assert.notEqual(metz.money,credits);
  assert.ok(metz.sell(entrance));
  assert.equal(metz.money,credits);
  assert.equal(metz.roofAccess('soldier',roof),entrance);
  const district=metz.drawZone([[44,37],[46,35.65],[48.75,36.45],[49.55,38.75],[47.75,41.75],[43.7,41.4],[43.15,38.8]]);
  assert.ok(district.roofs.length>1&&district.entries.size>0);
  assert.ok(district.roofs.includes(district.building));
  for(const i of district.entries) assert.equal(metz.shelterAt(i),district);
  const charge=metz.map.homes.find(i=>metz.legal('explosive',i));
  assert.ok(metz.place('explosive',charge));
  assert.equal(metz.units.get(charge).building,undefined);

  const game=new Game(withMutators(missions[0],new Set(['horde','austerity','night','fragile'])));
  assert.equal(game.remaining,65);
  assert.equal(game.money,1037);
  assert.equal(game.mission.light,'night');
  const bridge=game.map.cells.indexOf(terrain.bridge);
  game.prepare();
  assert.ok(game.call('missile',bridge));
  for(let i=0;i<23;i++) game.step(steps);
  assert.ok(game.bridgeDamage.has(bridge));

  const waiting=new Game(missions[0]);
  const path=[[43,36],[48,36],[49,39],[46,41],[43,40]];
  assert.ok(waiting.drawWaiting(path));
  const route=waiting.waitingZones[0].tiles;
  waiting.prepare();
  waiting.zombies.length=0;
  waiting.routes();
  const person=waiting.person(route[0],{wait:0,speed:2});
  waiting.moveCiv(person,steps);
  assert.equal(person.target,route[0]);
  waiting.releaseWaiting();
  waiting.routes();
  assert.equal(waiting.waitingField,null);
  const start=waiting.map.homes.find(i=>waiting.safeField[i]>15&&waiting.safeField[i]<32);
  waiting.setGuide([start,waiting.map.end]);
  waiting.routes();
  const walker=waiting.person(start,{wait:0,speed:2});
  waiting.moveCiv(walker,steps);
  assert.equal(walker.target,waiting.guide[1]);
  console.log('Bâtiments et accès, mutateurs, budget, ponts, couloirs, zones d’attente et sauvegarde vérifiés.');
}
