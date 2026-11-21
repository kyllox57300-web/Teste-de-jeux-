import assert from 'node:assert/strict';
import { Game } from '../source/game.mjs';
import { containment, missions, specials, endless, metz, terrain as t } from '../source/data.mjs';
import { adjacent, baseGrid, dist, field, open, validCustom } from '../source/city.mjs';
import { available, defaults, finish, learn, parseSave, skillPoints } from '../source/progress.mjs';
import { wallSections,within } from '../source/placement.mjs';

function defend(g, offset=0) {
  const { cells,start,end,homes }=g.map;
  const way=field([start],i=>open(cells,i));
  const toSafe=field([end],i=>open(cells,i));
  const paths=homes.filter(i=>adjacent[i].filter(j=>open(cells,j)).length>=2);
  const goal=(g.mission.containment?4:7)+offset;
  const ranked=paths.slice().sort((a,b)=>Math.abs(way[a]-goal)-Math.abs(way[b]-goal)||dist(a,start)-dist(b,start));
  const reserve=paths.slice().sort((a,b)=>Math.abs(toSafe[a]-5)-Math.abs(toSafe[b]-5));
  const hide=reserve.find(i=>dist(i,end)>3 && dist(i,start)>12);
  if(hide!==undefined) {
    g.place('safe',hide);
    g.setGuide([hide,end]);
  }
  const targets=ranked.filter(i=>way[i]<(goal+5));
  const roster=['turret',...Array(g.mission.containment?14:10).fill('soldier')];
  if(g.mission.containment) roster.splice(1,0,'sniper');
  for(const id of roster) {
    const i=targets.find(i=>!g.units.has(i));
    if(i!==undefined) g.place(id,i);
  }
}
function intervene(g) {
  const { start,cells }=g.map;
  if(g.remaining<4) return;
  const crowd=g.zombies.filter(z=>z.hp>0).reduce((map,p)=>map.set(p.i,(map.get(p.i)||0)+1),new Map());
  const groups=[...crowd].sort((a,b)=>b[1]-a[1]);
  for(const [i,amount] of groups) {
    if(amount<3||!open(cells,i)) continue;
    const neighbors=g.zombies.filter(z=>dist(z.i,i)<=2).length;
    const risk=g.civs.filter(c=>dist(c.i,i)<=2).length;
    if(neighbors>=9 && risk<2 && g.call('air',i)) break;
    if(neighbors>=5 && risk<2 && g.call('gas',i)) break;
    if(neighbors>=5 && dist(i,start)>2 && g.call('para',i)) break;
  }
}
function run(m,mode='normal',policy='prepared',offset=0) {
  const g=new Game(m,mode);
  if(policy!=='none') defend(g,offset);
  g.prepare();
  for(let tick=0;tick<4100&&g.combat;tick++) {
    if(tick%15===0&&policy==='managed') intervene(g);
    g.step(.08);
    g.events.length=0;
  }
  return g;
}

function runMetz(prepared) {
  const g=new Game(metz);
  const {cells,start,end,homes}=g.map;
  const {dist:distance,field:route}=g.grid;
  const nav=route([start],i=>open(cells,i));
  assert.ok(nav[end]<30000);
  if(prepared) {
    const near=homes.filter(i=>nav[i]>=22&&nav[i]<=39&&distance(end,i)>8);
    const far=homes.slice().sort((a,b)=>nav[b]-nav[a]);
    for(const options of [near,far,near,far]) {
      const at=options.find(i=>g.legal('safe',i)&&[...g.units.values()].every(u=>u.id!=='safe'||distance(i,u.i)>13));
      assert.ok(g.place('safe',at));
    }
    const positions=homes.slice().sort((a,b)=>Math.abs(nav[a]-10)-Math.abs(nav[b]-10)||distance(a,start)-distance(b,start));
    for(const id of ['turret','sniper','watch','soldier','soldier','sniper',...Array(11).fill('soldier')]) {
      const at=positions.find(i=>g.legal(id,i));
      if(at!==undefined) g.place(id,at);
    }
  }
  g.prepare();
  let trips=0, peak=g.remaining;
  for(let i=0;i<4700&&g.combat;i++) {
    if(prepared&&i%32===0&&g.remaining>0&&g.time>3) {
      const density=g.zombies.reduce((m,p)=>m.set(p.i,(m.get(p.i)||0)+1),new Map());
      const sweep=g.remaining<=12&&g.time>=64;
      const target=[...density].sort((a,b)=>b[1]-a[1]).slice(0,8)
        .find(([ix,n])=>(n>=3||sweep)&&g.civs.filter(c=>distance(c.i,ix)<=2).length<6)?.[0];
      if(target!==undefined&&!g.call('missile',target)&&!g.call('gas',target)&&g.remaining<=12) g.call('para',target);
    }
    g.step(.08);
    trips+=g.events.filter(e=>e.type==='convoy').length;
    peak=Math.max(peak,g.remaining);
    g.events.length=0;
  }
  return {g,trips,peak};
}

function verifyFortifications() {
  const {cell,w,h}=baseGrid;
  const layout=new Array(w*h).fill(t.block);
  for(let x=1;x<=22;x++) layout[cell(x,9)]=t.road;
  for(let z=8;z<=10;z++) for(let x=10;x<=12;x++) layout[cell(x,z)]=t.park;
  const g=new Game({...missions[0],layout,start:cell(20,9),end:cell(3,9)});
  const initial=g.money, from=cell(10,8), to=cell(12,10);
  const west=cell(9,9), inside=cell(10,9), east=cell(13,9), innerEast=cell(12,9);
  const outline=[[9.53,7.65],[11.65,7.42],[12.55,8.08],[12.7,10.55],[10.4,10.65],[9.62,10.12]];
  const loop=wallSections(outline,true);
  assert.ok(loop.every((s,i)=>s.b===loop[(i+1)%loop.length].a));
  const preview=g.planZone(outline);
  assert.equal(preview.tiles.length,9);
  assert.equal(preview.cap,53);
  assert.match(g.planZone([[10,8],[12,10],[12,8],[10,10]]).error,/croise/);
  g.money=preview.price-1;
  assert.equal(g.drawZone(outline),null);
  assert.equal(g.zoneAt(from),undefined);
  g.money=initial;
  const zone=g.drawZone(outline);
  assert.equal(g.money,initial-preview.price);
  assert.equal(g.zoneAt(from),zone);
  assert.equal(g.zoneAt(to),zone);
  assert.ok(!g.legal('safe',from));
  assert.ok(g.sell(from));
  assert.equal(g.money,initial);
  assert.equal(g.zoneAt(to),undefined);
  const rebuilt=g.drawZone(outline);
  const line=[[13.63,8.64],[13.63,9.41]];
  const lineCost=g.planWalls(line).price;
  assert.ok(g.drawWalls(line));
  assert.equal(g.money,initial-preview.price-lineCost);
  const section=g.walls.obstruction(east,cell(14,9));
  assert.ok(section);
  assert.ok(g.sellWall(section));
  assert.equal(g.walls.obstruction(east,cell(14,9)),null);
  const perimeter=g.fortification(rebuilt);
  assert.ok(g.surround(rebuilt));
  assert.equal(g.money,initial-preview.price-perimeter.price);
  assert.ok(!g.surround(rebuilt));
  assert.ok(g.walls.obstruction(east,innerEast));
  assert.equal(g.civilPass(inside,west),false);
  const balance=g.money;
  const door=g.walls.obstruction(inside,west);
  assert.ok(g.gateWall(door));
  assert.equal(balance-g.money,g.wallGatePrice());
  assert.equal(g.fortification(rebuilt).gates,1);
  assert.equal(g.walls.obstruction(inside,west).id,'gate');

  g.prepare();
  g.zombies.length=0;
  const civilian=g.person(cell(8,9),{speed:2.5,wait:0});
  g.civs=[civilian];
  g.routes();
  assert.equal(g.civilPass(inside,west),true);
  assert.equal(g.civilPass(innerEast,east),false);
  const visited=new Set();
  for(let i=0;i<80&&!civilian.dead;i++) {
    g.time+=.08;
    g.moveCiv(civilian,.08);
    visited.add(civilian.i);
  }
  assert.ok(visited.has(west));
  assert.equal(rebuilt.sheltered,1);

  g.spawn(west);
  const z=g.zombies[0];
  g.routes();
  g.moveFoe(z,.08);
  assert.equal(z.target,z.i);
  assert.ok(door.hp<door.maxHp);
  g.time=z.attackAt;
  door.hp=1;
  g.moveFoe(z,.08);
  assert.equal(g.walls.obstruction(inside,west),null);
  assert.equal(g.zoneAt(from),rebuilt);
  g.collapse(rebuilt,to);
  assert.equal(g.zoneAt(from),undefined);
  assert.equal(g.zoneAt(to),undefined);
  assert.equal(g.lost,1);

  const city=new Game(metz);
  const block=[[44,37],[46,35.65],[48.75,36.45],[49.55,38.75],[47.75,41.75],[43.7,41.4],[43.15,38.8]];
  const refuge=city.drawZone(block);
  assert.ok(refuge&&city.surround(refuge));
  let crossings=0;
  for(let a=0;a<city.map.cells.length;a++) for(const b of city.grid.adjacent[a]) {
    if(b<=a||!city.civilPass(a)||!city.civilPass(b)||within(city.location(a),block)===within(city.location(b),block)) continue;
    crossings++;
    assert.ok(city.walls.obstruction(a,b),`Ouverture dans l’enceinte à Metz entre ${a} et ${b}`);
  }
  assert.ok(crossings>=5);

  // A path that meets a corner and then runs along the wall used to bypass the last section.
  const square=new Game({...missions[0],layout:new Array(w*h).fill(t.road),start:cell(21,9),end:cell(1,9),budget:3000,pop:22});
  const corner=[[10.5,11.5],[12,11],[13,9.5],[13,7.5],[11.5,6.5],[9.5,6.5],[8,7.5],[7.5,9.5],[9,11]];
  const compound=square.drawZone(corner);
  assert.ok(compound&&square.surround(compound));
  assert.ok(square.walls.obstruction(cell(13,9),cell(13,10)));
  assert.equal(square.civilPass(cell(13,9),cell(13,10)),false);
}

const verify=!process.argv.includes('--explore');
const campaign=defaults();
const rows=[];
for(const m of missions) {
  assert.ok(available(campaign,m.id)||!verify);
  const attempts=[0,3,6,9].map(offset=>run(m,'normal','managed',offset));
  const winner=attempts.filter(g=>g.phase==='won').sort((a,b)=>b.result().saved-a.result().saved)[0];
  const unprepared=run(m,'normal','none');
  rows.push({mission:m.name,plans:attempts.map(g=>g.phase==='won'?g.result().saved:g.phase).join('/'),unprepared:unprepared.phase,kills:winner?.kills??0});
  if(winner) finish(campaign,winner);
}
console.table(rows);
if(verify) {
  verifyFortifications();
  assert.equal(Object.keys(campaign.records).length,12,'Une stratégie viable par mission en difficulté normale');
  assert.ok(rows.every(r=>r.unprepared!=='won'),'Une ville laissée sans défense tombe');
  assert.equal(skillPoints(campaign),12);
  assert.ok(!learn(campaign,'mortar'));
  assert.ok(learn(campaign,'marks'));
  assert.ok(learn(campaign,'incend'));
  assert.ok(!learn(campaign,'marks'));
  assert.ok(campaign.badges.includes('story'));
  assert.ok(campaign.badges.includes('boss'));
  const g=new Game(missions[4]);
  const c={name:'Quartier test',layout:g.map.cells,start:g.map.start,end:g.map.end,seed:3};
  assert.ok(validCustom(c.layout,c.start,c.end));
  assert.ok(!validCustom(c.layout,c.start,c.start));
  campaign.cities.push(c);
  assert.deepEqual(parseSave(JSON.stringify(campaign)),campaign);
  for(const m of specials) assert.ok(run(m,'normal','managed',3).wave>1);
  assert.ok(run(endless,'easy','managed',3).wave>=3);
  const fragile=new Game(specials[0],'normal',['guided','rotor']);
  const bridge=fragile.map.cells.indexOf(4);
  fragile.prepare();
  assert.ok(fragile.call('missile',bridge));
  assert.ok(!fragile.call('missile',bridge));
  for(let i=0;i<30;i++) fragile.step(.08);
  assert.ok(fragile.bridgeDamage.has(bridge));
  const stress=new Game({...missions[11],count:650});
  stress.prepare();
  const start=performance.now();
  for(let i=0;i<150;i++) {stress.step(.08);stress.events.length=0;}
  assert.ok(stress.zombies.length>=600);
  console.log(`Charge : ${stress.zombies.length} infectés, 150 pas de simulation en ${Math.round(performance.now()-start)} ms.`);
  const sectors=defaults();
  for(const mission of containment) {
    const failed=run(mission,'normal','none');
    assert.equal(failed.phase,'lost');
    assert.equal(failed.lost,mission.pop);
    const plans=[0,2,4,6,8].map(offset=>run(mission,'normal','managed',offset));
    const winner=plans.filter(g=>g.phase==='won').sort((a,b)=>b.result().saved-a.result().saved)[0];
    assert.ok(winner,`Confinement faisable dans ${mission.name}`);
    assert.ok(winner.sheltered>=mission.pop*.6,`Une stratégie protège la majorité des civils dans ${mission.name}`);
    assert.equal(winner.wave,1);
    assert.ok(plans.some(g=>g.lost>mission.pop*.06),`Un mauvais placement laisse l’épidémie s’étendre dans ${mission.name}`);
    const winnerStats=finish(sectors,winner);
    console.log(`Confinement — ${mission.name} : ${winnerStats.saved}/${mission.pop} civils sauvés, ${winnerStats.kills} infectés éliminés.`);
  }
  assert.deepEqual(parseSave(JSON.stringify(sectors)),sectors);
  const old={...sectors};
  delete old.containment;
  assert.deepEqual(parseSave(JSON.stringify(old)).containment,{});
  assert.equal(skillPoints(sectors),0);

  const moving=new Game(containment[0]);
  const from=moving.map.homes.find(i=>dist(i,moving.map.start)>17&&moving.legal('soldier',i)&&adjacent[i].some(j=>open(moving.map.cells,j)&&!moving.units.has(j)));
  const to=adjacent[from].find(j=>open(moving.map.cells,j)&&!moving.units.has(j));
  assert.ok(moving.place('soldier',from));
  const unit=moving.units.get(from);
  unit.xp=6;
  assert.ok(!moving.order(from,to));
  moving.prepare();
  assert.ok(moving.order(from,to));
  assert.ok(!moving.units.has(from));
  assert.ok(!moving.units.has(to));
  for(let i=0;i<12;i++) moving.step(.08);
  assert.equal(moving.units.get(to),unit);
  assert.ok(!moving.marches.length);
  const undefended=runMetz(false);
  assert.equal(undefended.g.phase,'lost');
  assert.ok(undefended.peak>1000);
  const downtown=runMetz(true);
  assert.equal(downtown.g.phase,'won');
  assert.ok(downtown.trips>=10);
  assert.ok(downtown.g.result().saved>=downtown.g.quota);
  assert.equal(downtown.g.remaining,0);
  assert.ok(downtown.g.map.art.buildings.length>7000);
  finish(sectors,downtown.g);
  assert.deepEqual(parseSave(JSON.stringify(sectors)),sectors);
  console.log(`Metz — ${downtown.g.evacuated}/${metz.pop} civils dans ${downtown.trips} navettes · ${downtown.peak} infectés au pic.`);
  console.log('Progression, succès, import/export, cartes et survie vérifiés.');
}
