import assert from 'node:assert/strict';
import { Game } from '../source/game.mjs';
import { containment, missions, specials, endless, metz } from '../source/data.mjs';
import { adjacent, dist, field, open, validCustom } from '../source/city.mjs';
import { available, defaults, finish, learn, parseSave, skillPoints } from '../source/progress.mjs';

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
