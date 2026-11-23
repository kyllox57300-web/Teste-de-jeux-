import assert from 'node:assert/strict';
import {mkdir,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {chromium} from '../source/node_modules/playwright-core/index.mjs';
import {PerspectiveCamera,Plane,Raycaster,Vector3} from '../source/node_modules/three/build/three.module.js';
import {atlas} from '../source/data.mjs';
import {Game} from '../source/game.mjs';
import {atlasPlanCamera} from '../source/view.mjs';
import {serve} from './serve.mjs';

const folder=process.env.SIRENE_CAPTURES||join(tmpdir(),'sirene-atlas');
await mkdir(folder,{recursive:true});
const local=process.env.SIRENE_PUBLIC_URL?null:await serve();
const url=process.env.SIRENE_PUBLIC_URL||local.url;
const browser=await chromium.launch({
  executablePath:process.env.SIRENE_CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',
  args:['--enable-unsafe-swiftshader'],headless:true
});
const errors=[];
const canvas='#world';
const button=(page,name)=>page.getByRole('button',{name,exact:true});
const action=(page,value)=>page.locator(`[data-action="${value}"]`);
const snap=(page,name)=>page.screenshot({path:join(folder,name+'.jpg'),quality:92,timeout:30000});
const radarShowsInfection=(expected=true)=> {
  const canvas=document.querySelector('#radar');
  const copy=document.createElement('canvas');
  copy.width=canvas.width;
  copy.height=canvas.height;
  const ctx=copy.getContext('2d',{willReadFrequently:true});
  ctx.drawImage(canvas,0,0);
  const pixels=ctx.getImageData(0,0,copy.width,copy.height).data;
  for(let i=0;i<pixels.length;i+=4) {
    if(pixels[i]===240&&pixels[i+1]===165&&pixels[i+2]===255) return expected;
  }
  return !expected;
};

function monitor(page) {
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'||m.type()==='warning') errors.push(m.text());});
}
async function atlasMenu(page) {
  await page.goto(url);
  await button(page,'Villes réelles').click();
  assert.equal(await action(page,'atlas-city').count(),6);
}
async function city(page,id) {
  await page.locator(`[data-value="atlas-${id}"]`).click();
  await button(page,'Examiner la carte').click();
  await page.getByRole('link',{name:/OpenStreetMap/}).waitFor();
}
async function contents(id) {
  const geography=JSON.parse(await readFile(new URL('../maps/'+id+'.json',import.meta.url),'utf8'));
  return new Game({...atlas.find(m=>m.mapId===id),geography});
}
async function center(page,game,[x,z],steps) {
  const radar=page.locator('#radar');
  const box=await radar.boundingBox();
  await radar.click({position:{x:(x+.5)*box.width/game.grid.w,y:(z+.5)*box.height/game.grid.h}});
  for(let i=0;i<steps;i++) await button(page,'Rapprocher').click();
}
async function project(page,game,[x,z],steps) {
  const box=await page.locator(canvas).boundingBox();
  const aspect=box.width/box.height;
  const {angle,tilt,zoom:initialZoom}=atlasPlanCamera(game.grid,aspect);
  const zoom=Math.max(9,initialZoom*.84**steps);
  const camera=new PerspectiveCamera(44,aspect,.12,290);
  camera.position.set(x+zoom*Math.sin(angle)*Math.cos(tilt),zoom*Math.sin(tilt),z+zoom*Math.cos(angle)*Math.cos(tilt));
  camera.lookAt(x,0,z);
  camera.updateMatrixWorld();
  const screen=(point,height=1.46)=>{
    const p=new Vector3(point[0],height,point[1]).project(camera);
    return [box.x+(p.x+1)*box.width/2,box.y+(1-p.y)*box.height/2];
  };
  screen.frame=([x1,y1],[x2,y2])=>{
    const ray=new Raycaster(),plane=new Plane(new Vector3(0,1,0),-1.46),hit=new Vector3();
    return [[x1,y1],[x2,y1],[x2,y2],[x1,y2]].map(([x,y])=>{
      ray.setFromCamera({x:2*(x-box.x)/box.width-1,y:1-2*(y-box.y)/box.height},camera);
      assert.ok(ray.ray.intersectPlane(plane,hit));
      return [hit.x,hit.z];
    });
  };
  return screen;
}
async function draw(page,points) {
  await page.mouse.move(...points[0]);
  await page.mouse.down();
  for(const p of points.slice(1)) await page.mouse.move(...p,{steps:4});
  await page.mouse.up();
}
function roofNear(game,id,[x,z]) {
  const sites=game.map.buildings.sites.filter(site=>game.roofAccess(id,site)!==undefined);
  return sites.sort((a,b)=>Math.hypot(a.point[0]-x,a.point[1]-z)-Math.hypot(b.point[0]-x,b.point[1]-z))[0];
}
function osmFixture() {
  const nodes=[],ways=[];
  for(let i=0;i<121;i++) nodes.push(`<node id="${i+1}" lon="${6+(i%11)*.001}" lat="${49+Math.floor(i/11)*.001}"/>`);
  for(let n=0;n<11;n++) for(const [offset,step] of [[1+n*11,1],[1+n,11]]) {
    const line=Array.from({length:11},(_,i)=>`<nd ref="${offset+step*i}"/>`).join('');
    ways.push(`<way id="${ways.length+501}">${line}<tag k="highway" v="residential"/></way>`);
  }
  return Buffer.from(`<osm version="0.6"><bounds minlon="6" minlat="49" maxlon="6.01" maxlat="49.01"/>${nodes.join('')}${ways.join('')}</osm>`);
}

async function playFirstStage() {
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  monitor(page);
  await page.addInitScript(()=>{
    const key='derniere-sirene-v1';
    if(!localStorage.getItem(key)) localStorage.setItem(key,JSON.stringify({
      v:1,records:{},skills:[],badges:[],cities:[],atlasProgress:{'atlas-lyon':1}
    }));
  });
  await atlasMenu(page);
  await city(page,'metz');
  assert.equal(await page.locator('#pins .pin').filter({hasText:'✚'}).count(),0);
  const option=id=>page.locator(`[data-action="equip-support"][data-value="${id}"]`);
  await button(page,'Renforts').click();
  assert.equal(await page.locator('#loadout-count').textContent(),'6 / 7 renforts');
  await option('medevac').click();
  assert.equal(await page.locator('#loadout-points').textContent(),'1 point réservé · 0 disponibles');
  assert.equal(await option('flash').isDisabled(),true);
  await option('tank').click();
  assert.match(await page.locator('#loadout-points').textContent(),/1 disponible/);
  await option('decoy').click();
  await button(page,'Retour à la carte').click();
  await button(page,'Compétences').click();
  const marks=page.locator('.training-dialog [data-value="marks"]');
  assert.equal(await marks.isDisabled(),true);
  await button(page,'Retour à la carte').click();
  const metz=await contents('metz');
  const focus=metz.grid.point(metz.outbreak);
  await center(page,metz,focus,2);
  const aim=await project(page,metz,focus,2);
  const plan=[
    ['mortar',[66.38,17.71]],['sniper',[70.115,13.945]],['turret',[70.685,12.505]],
    ['sniper',[70.2,17.455]],['mortar',[69.9033,18.1167]],['soldier',[64.985,13.33]],
    ['sniper',[67.12,18.2]],['turret',[69.785,17.1]],['mines',[73,16]],
    ['explosive',[62,14]],['soldier',[63.64,13.84]]
  ];
  let mortar,sniper;
  for(const [id,point] of plan) {
    const roof=metz.usesRoof(id)?roofNear(metz,id,point):null;
    const i=roof?metz.roofAccess(id,roof):metz.grid.cell(...point);
    const target=roof?aim(roof.point,roof.height*.69):aim(point,0);
    if(id==='mortar'&&!mortar) mortar=target;
    if(id==='sniper'&&!sniper) sniper=target;
    await page.locator(`.kit [data-value="${id}"]`).click();
    await page.mouse.click(...target);
    assert.ok(metz.place(id,i,false,roof));
    assert.equal(Number(await page.locator('.metric.cash strong').textContent()),metz.money);
  }
  await button(page,'Mettre en pause').click();
  await button(page,'Prêt · lancer l’épidémie').click();
  assert.equal(await page.locator('.kit [data-value="tank"]').count(),0);
  assert.equal(await page.locator('.kit [data-value="medevac"]').count(),1);
  for(const id of ['missile','heli','para']) {
    await page.locator(`.kit [data-value="${id}"]`).click();
    await page.mouse.click(...aim(focus,0));
  }
  assert.equal(await page.locator('#support-stock').textContent(),'Appuis · 3');
  await button(page,'Vitesse ×4').click();
  await page.locator('#stage-count[aria-label="Étape 2 sur 3"]').waitFor({timeout:25000});
  assert.equal(await page.locator('#modal').isVisible(),false);
  assert.equal(await page.locator('#clock').textContent(),'EN ATTENTE');
  assert.equal(await page.locator('.metric.infect strong').textContent(),'Masqué');
  assert.equal(await button(page,'Centrer sur les infectés').count(),0);
  assert.equal(await page.locator('#support-stock').textContent(),'Appuis · 7');
  assert.equal(await page.locator('#retry-count').textContent(),'0');
  assert.equal(Number(await page.locator('.metric.cash strong').textContent()),metz.money+576);
  await page.waitForFunction(radarShowsInfection,false);
  await page.mouse.click(...mortar);
  assert.equal(await page.locator('#unit-name').textContent(),'Mortier');
  await button(page,'Fermer la fiche').click();
  await snap(page,'37-metz-etape-2');
  await button(page,'Renforts').click();
  assert.equal(await option('tank').getAttribute('aria-pressed'),'false');
  assert.equal(await option('medevac').getAttribute('aria-pressed'),'true');
  assert.equal(await option('decoy').getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('#loadout-points').textContent(),'1 point réservé · 1 disponible');
  await snap(page,'39-renforts-etape-2');
  await button(page,'Retour à la carte').click();
  await page.mouse.click(...sniper);
  assert.equal(await page.locator('#unit-name').textContent(),'Sniper');
  const range=await page.locator('#unit-range').textContent();
  await button(page,'Fermer la fiche').click();
  await button(page,'Compétences').click();
  assert.equal(await page.locator('#skill-points').textContent(),'1 point disponible');
  await marks.click();
  assert.equal(await page.locator('#skill-points').textContent(),'0 points disponibles');
  assert.equal(await marks.evaluate(el=>el.classList.contains('learned')),true);
  await snap(page,'38-competences-entre-les-etapes');
  await button(page,'Retour à la carte').click();
  await page.mouse.click(...sniper);
  assert.notEqual(await page.locator('#unit-range').textContent(),range);
  await button(page,'Fermer la fiche').click();
  await button(page,'Mettre en pause').click();
  await button(page,'Prêt · lancer l’épidémie').click();
  assert.equal(await page.locator('#stage-count').textContent(),'2/3');
  assert.equal(await page.locator('#clock').textContent(),'00:00');
  assert.equal(await page.locator('.metric.infect strong').textContent(),'50');
  await page.keyboard.press('6');
  assert.match(await page.locator('#toast').textContent(),/pas partie de ta sélection/);
  await page.keyboard.press('8');
  assert.equal(await page.locator('.kit [data-value="medevac"]').getAttribute('aria-pressed'),'true');
  const budget=await page.locator('.metric.cash strong').textContent();
  await page.mouse.click(...aim(focus,0));
  for(const id of ['missile','air','decoy']) {
    await page.locator(`.kit [data-value="${id}"]`).click();
    await page.mouse.click(...aim(focus,0));
  }
  assert.equal(await page.locator('#support-stock').textContent(),'Appuis · 1');
  assert.equal(await page.locator('.metric.cash strong').textContent(),budget);
  assert.match(await page.locator('#price-air').textContent(),/Manque 1 ch\./);
  assert.match(await page.locator('#price-heli').textContent(),/En approche|En patrouille|Ravit\./);
  await button(page,'Hélicoptère').click();
  await page.mouse.click(...aim(focus,0));
  assert.match(await page.locator('#toast').textContent(),/Nouvelle zone de patrouille/);
  assert.equal(await page.locator('#support-stock').textContent(),'Appuis · 1');
  await snap(page,'44-helicoptere-conserve');
  await button(page,'Rejouer').click();
  assert.equal(await page.locator('#stage-count').textContent(),'1/3');
  await atlasMenu(page);
  await city(page,'lyon');
  await button(page,'Compétences').click();
  assert.equal(await marks.evaluate(el=>el.classList.contains('learned')),true);
  assert.equal(await page.locator('#skill-points').textContent(),'1 point disponible');
  await page.close();
}

try {
  await playFirstStage();
  const desktop=await browser.newPage({viewport:{width:1440,height:900}});
  monitor(desktop);
  await atlasMenu(desktop);
  await snap(desktop,'17-villes-reelles');
  for(const id of ['horde','fragile','austerity','night']) await desktop.locator(`[data-value="${id}"]`).click();
  await city(desktop,'lyon');
  assert.equal(await desktop.locator('.metric.cash strong').textContent(),'1152');
  assert.equal(await desktop.locator('.metric.infect strong').textContent(),'Masqué');
  assert.equal(await button(desktop,'Centrer sur les infectés').count(),0);
  assert.equal(await desktop.locator('.pin.hot').count(),0);
  assert.equal(await desktop.evaluate(radarShowsInfection),false);
  await snap(desktop,'18-lyon-de-nuit');
  await button(desktop,'Pause').click();
  await button(desktop,'Quitter la mission').click();
  for(const id of ['horde','fragile','austerity','night']) await desktop.locator(`[data-value="${id}"]`).click();
  await city(desktop,'metz');
  const desktopMap=await desktop.locator(canvas).boundingBox();
  const dock=await desktop.locator('#dock').boundingBox();
  assert.equal(desktopMap.width,1440);
  assert.equal(desktopMap.y,0);
  assert.equal(Math.round(desktopMap.height+dock.height),900);
  assert.equal(Math.round(dock.y),Math.round(desktopMap.height));
  await button(desktop,'Vue d’ensemble').click();
  await button(desktop,'Recentrer').click();
  const metz=await contents('metz');
  const focus=[47,39], steps=2;
  await center(desktop,metz,focus,steps);
  const screen=await project(desktop,metz,focus,steps);
  const refuge=[[44,37],[46,35.65],[48.75,36.45],[49.55,38.75],[47.75,41.75],[43.7,41.4],[43.15,38.8]];
  await button(desktop,'Zone sûre').click();
  const outline=refuge.map(p=>screen(p));
  await desktop.mouse.move(...outline[0]);
  await desktop.mouse.down();
  for(const p of outline.slice(1)) await desktop.mouse.move(...p,{steps:4});
  assert.match(await desktop.locator('#detail').textContent(),/cr avec murs/);
  await snap(desktop,'45-prix-du-refuge');
  await desktop.mouse.up();
  const zone=metz.drawZone(refuge);
  assert.ok(zone&&metz.walls.sections.size>0);
  assert.equal(Number(await desktop.locator('.metric.cash strong').textContent()),metz.money);
  assert.equal(await button(desktop,'Ceinturer').isVisible(),false);
  await snap(desktop,'40-zone-et-murs-en-un-trace');
  const gate=[...metz.walls.sections.values()].find(s=>s.a[0]>49&&s.a[1]<38&&metz.walls.openings(s).length);
  const entrance=screen(metz.walls.openings(gate)[0],1.54);
  await desktop.mouse.move(...entrance);
  await desktop.locator('.pin.gate-label').waitFor();
  await desktop.mouse.click(...entrance);
  assert.match(await desktop.locator('#toast').textContent(),/Porte posée/);
  assert.ok(metz.gateWall(gate));
  assert.ok(zone.roofs.length>=2);
  const refugePin=desktop.locator(`.zone-pin[data-value="${zone.i}"]`);
  await refugePin.click();
  assert.equal(await desktop.locator('#fort-name').textContent(),'Zone sûre · Niv. 1/3');
  assert.equal(await desktop.locator('#fort-percent').textContent(),'210/210 PV');
  assert.match(await desktop.locator('#fort-state').textContent(),/Mur le plus faible 100 %/);
  const reinforcement=metz.zoneUpgradePlan(zone);
  await button(desktop,`Améliorer · ${reinforcement.price} cr`).click();
  assert.ok(metz.upgradeZone(zone));
  assert.equal(await desktop.locator('#fort-percent').textContent(),'315/315 PV');
  assert.equal(await desktop.locator('#fort-name').textContent(),'Zone sûre · Niv. 2/3');
  await desktop.locator(`.zone-pin[data-value="${zone.i}"][aria-label$="315/315 PV"]`).waitFor();
  await snap(desktop,'46-zone-renforcee');
  await button(desktop,'Retour').click();
  let soldierPoint;
  for(const [id,name,point] of [['soldier','Garnison',[46,39]],['sniper','Sniper',[47,36]],['mortar','Mortier',[49,41]],['safe','Zone sûre',[43,35]]]) {
    const site=roofNear(metz,id,point);
    const access=metz.roofAccess(id,site);
    const [x,y]=screen(site.point,site.height*.69);
    await button(desktop,name).click();
    await desktop.mouse.move(x,y);
    await desktop.locator('.pin.roof-label').waitFor();
    await desktop.mouse.click(x,y);
    assert.ok(metz.place(id,access,false,site));
    assert.match(await desktop.locator('#toast').textContent(),/Bâtiment réquisitionné/);
    if(id==='soldier') {
      soldierPoint=[x,y];
      await desktop.mouse.click(...soldierPoint);
      assert.equal(await desktop.locator('#unit-name').textContent(),'Garnison');
      assert.equal(await desktop.locator('#unit-equipment').textContent(),'Équipement 1/3');
      const range=await desktop.locator('#unit-range').textContent();
      assert.match(range,/^≈ \d+ m$/);
      await button(desktop,'Améliorer · 40 cr').click();
      assert.ok(metz.upgradeUnit(metz.units.get(access)));
      assert.equal(await desktop.locator('#unit-equipment').textContent(),'Équipement 2/3');
      assert.notEqual(await desktop.locator('#unit-range').textContent(),range);
      await button(desktop,'Fermer la fiche').click();
    }
  }
  assert.equal(Number(await desktop.locator('.metric.cash strong').textContent()),metz.money);
  await snap(desktop,'28-batiments-requisitionnes-metz');
  await button(desktop,'Tracer un couloir').click();
  for(const point of [[54,34],[50,38],[49,38]]) await desktop.mouse.click(...screen(point,0));
  await button(desktop,'Effacer le couloir').waitFor();
  assert.match(await desktop.locator('#detail').textContent(),/point orange/);
  await snap(desktop,'35-couloir-vers-le-refuge');
  const wait=[[51.5,37],[54,36.2],[56.5,38],[57,41],[53,42],[51.5,39]];
  await button(desktop,'Zone d’attente').click();
  await draw(desktop,wait.map(p=>screen(p)));
  await button(desktop,'Libérer l’attente').waitFor();
  await snap(desktop,'29-refuges-et-zone-attente');
  await button(desktop,'Libérer l’attente').click();
  assert.equal(await button(desktop,'Libérer l’attente').isVisible(),false);
  await button(desktop,'Garnison').click();
  await desktop.mouse.click(...soldierPoint);
  await desktop.waitForTimeout(100);
  await snap(desktop,'30-fiche-garnison-metz');
  await desktop.keyboard.press('Escape');
  assert.equal(await desktop.locator('#unit-inspector').isVisible(),false);

  const batchStart=screen([50,32]),batchEnd=screen([62,46]);
  const batch=metz.planRoofBatch('soldier',screen.frame(batchStart,batchEnd));
  assert.ok(batch.placements.length>=2);
  await button(desktop,'Couverture').click();
  assert.equal(await button(desktop,'Couverture').getAttribute('aria-pressed'),'true');
  await button(desktop,'Garnison').click();
  await desktop.mouse.move(...batchStart);
  await desktop.mouse.down();
  await desktop.mouse.move(...batchEnd,{steps:10});
  assert.match(await desktop.locator('#detail').textContent(),new RegExp(`${batch.placements.length} bâtiments · Garnison · ${batch.price} cr`));
  await snap(desktop,'41-deploiement-et-couverture');
  await desktop.mouse.up();
  assert.equal(Number(await desktop.locator('.metric.cash strong').textContent()),metz.money-batch.price);
  assert.match(await desktop.locator('#price-soldier').textContent(),/^Manque \d+ cr$/);
  await button(desktop,'Mettre en pause').click();
  await button(desktop,'Prêt · lancer l’épidémie').click();
  const initialCash=metz.money-batch.price;
  assert.ok(initialCash<65);
  assert.equal(await desktop.locator('#clock').textContent(),'00:00');
  assert.equal(await desktop.locator('#support-stock').textContent(),'Appuis · 8');
  await refugePin.click();
  assert.equal(await desktop.locator('#fort-percent').textContent(),'315/315 PV');
  assert.equal(await desktop.locator('#zone-upgrade').isVisible(),false);
  await button(desktop,'Retour').click();
  await button(desktop,'Inspecter').click();
  await desktop.mouse.click(...entrance);
  await button(desktop,'Fermer la porte').click();
  assert.match(await desktop.locator('#toast').textContent(),/autre accès/);
  await button(desktop,'Retour').click();
  await button(desktop,'Tracer un couloir').click();
  await snap(desktop,'36-couloir-porte-fermee');
  await button(desktop,'Inspecter').click();
  await desktop.mouse.click(...entrance);
  await button(desktop,'Ouvrir la porte').click();
  await button(desktop,'Retour').click();
  await button(desktop,'Parachutistes').click();
  await desktop.mouse.click(...screen(metz.location(metz.map.end),0));
  assert.equal(await desktop.locator('#support-stock').textContent(),'Appuis · 7');
  assert.equal(Number(await desktop.locator('.metric.cash strong').textContent()),initialCash);
  await desktop.waitForTimeout(100);
  await snap(desktop,'34-appuis-en-combat');
  await button(desktop,'Inspecter').click();
  await desktop.mouse.click(...soldierPoint);
  assert.equal(await desktop.locator('#unit-equipment').textContent(),'Équipement 2/3');
  assert.equal(await button(desktop,'Améliorer · 60 cr').isDisabled(),true);
  await button(desktop,'Pause').click();
  await button(desktop,'Quitter la mission').click();

  for(const id of ['strasbourg','bordeaux']) {
    await city(desktop,id);
    await button(desktop,'Pause').click();
    await button(desktop,'Quitter la mission').click();
  }
  await city(desktop,'toulouse');
  await snap(desktop,'20-toulouse-preparation');
  await button(desktop,'Prêt · lancer l’épidémie').click();
  await button(desktop,'Centrer sur les infectés').waitFor();
  await desktop.waitForFunction(radarShowsInfection);
  assert.equal(await desktop.locator('.kit .tool').count(),6);
  await button(desktop,'Vitesse ×4').click();
  await desktop.waitForFunction(()=>Number(document.querySelector('.metric.infect strong')?.textContent)>170);
  await button(desktop,'Mettre en pause').click();
  await button(desktop,'Vue d’ensemble').click();
  await desktop.locator('.pin.cluster:visible').first().waitFor();
  await snap(desktop,'26-toulouse-infection');
  for(let key=1;key<=6;key++) {
    await desktop.keyboard.press(String(key));
    const tool=desktop.locator('.kit .tool').nth(key-1);
    assert.equal(await tool.getAttribute('aria-pressed'),'true');
  }
  const toulouse=await contents('toulouse');
  const outbreak=toulouse.grid.point(toulouse.map.start);
  await center(desktop,toulouse,outbreak,3);
  const aim=await project(desktop,toulouse,outbreak,3);
  const wallet=Number(await desktop.locator('.metric.cash strong').textContent());
  await desktop.keyboard.press('3');
  await desktop.mouse.click(...aim(toulouse.location(toulouse.map.start),0));
  assert.equal(Number(await desktop.locator('.metric.cash strong').textContent()),wallet);
  assert.equal(await desktop.locator('#support-stock').textContent(),'Appuis · 6');
  await button(desktop,'Vitesse ×0,5').click();
  await desktop.waitForTimeout(950);
  await button(desktop,'Mettre en pause').click();
  await snap(desktop,'23-toulouse-missile');
  await button(desktop,'Rejouer').click();
  assert.equal(await desktop.locator('#clock').textContent(),'EN ATTENTE');
  assert.equal(await desktop.locator('#retry-count').textContent(),'1');
  assert.equal(await desktop.locator('#support-stock').textContent(),'Appuis · 8');
  assert.equal(await button(desktop,'Centrer sur les infectés').count(),0);
  await desktop.waitForFunction(radarShowsInfection,false);
  assert.equal(await desktop.locator('#modal').isVisible(),false);
  await atlasMenu(desktop);
  assert.match(await desktop.locator('[data-value="atlas-toulouse"]').textContent(),/1 relance/);
  await button(desktop,'Importer une carte OSM').click();
  await desktop.locator('#osm-file').setInputFiles({name:'Quartier test.osm',mimeType:'text/xml',buffer:osmFixture()});
  await button(desktop,'Examiner la carte').click();
  assert.equal(await desktop.locator('.dock h2').textContent(),'Quartier test');
  await desktop.getByRole('link',{name:/OpenStreetMap/}).waitFor();

  const narrow=await browser.newPage({viewport:{width:768,height:730}});
  monitor(narrow);
  await narrow.addInitScript(()=>{
    const key='derniere-sirene-v1';
    if(!localStorage.getItem(key)) localStorage.setItem(key,JSON.stringify({
      v:1,records:{},skills:[],badges:[],cities:[],defeats:{'atlas-metz':2}
    }));
  });
  await atlasMenu(narrow);
  await city(narrow,'metz');
  assert.equal(await narrow.locator('.metric.cash strong').textContent(),'1590');
  assert.match(await narrow.locator('#brief').textContent(),/\+150 cr.*2 défaites d’affilée/);
  await button(narrow,'Rejouer').click();
  assert.equal(await narrow.locator('.metric.cash strong').textContent(),'1590');
  assert.equal(await narrow.locator('#retry-count').textContent(),'1');
  await narrow.waitForTimeout(100);
  await snap(narrow,'33-aide-et-foyer-masque');
  const narrowMap=await narrow.locator(canvas).boundingBox();
  const narrowDock=await narrow.locator('#dock').boundingBox();
  assert.equal(narrowMap.width,768);
  assert.equal(narrowDock.y,Math.round(narrowMap.height));
  await button(narrow,'Prêt · lancer l’épidémie').click();
  await button(narrow,'Mettre en pause').click();
  for(const tool of await narrow.locator('.kit .tool').all()) {
    const box=await tool.boundingBox();
    assert.ok(box.x>=0&&box.x+box.width<=768);
    assert.ok(box.y>=narrowDock.y&&box.y+box.height<=730);
  }
  await button(narrow,'Vitesse ×4').click();
  await narrow.getByRole('heading',{name:'Opération compromise'}).waitFor({timeout:55000});
  assert.match(await narrow.locator('#modal').textContent(),/sur les 115 nécessaires/);
  await snap(narrow,'43-bilan-metz-seuil-de-survie');
  await narrow.close();

  const mobile=await browser.newPage({viewport:{width:412,height:883},deviceScaleFactor:2,hasTouch:true,isMobile:true});
  monitor(mobile);
  await atlasMenu(mobile);
  await city(mobile,'dunkerque');
  await button(mobile,'Renforts').tap();
  assert.equal(await mobile.locator('#loadout-count').textContent(),'6 / 6 renforts');
  await mobile.locator('[data-action="equip-support"][data-value="tank"]').tap();
  const evacuation=mobile.locator('[data-action="equip-support"][data-value="medevac"]');
  await evacuation.tap();
  assert.equal(await evacuation.getAttribute('aria-pressed'),'true');
  await button(mobile,'Retour à la carte').tap();
  await button(mobile,'Paramètres').tap();
  const density=mobile.getByLabel('Foule à l’écran');
  assert.equal(await density.inputValue(),'auto');
  await density.selectOption('low');
  await button(mobile,'Fermer').tap();
  const dunkerque=await contents('dunkerque');
  const harbor=dunkerque.grid.point(dunkerque.map.end);
  await center(mobile,dunkerque,harbor,0);
  const touchRoof=roofNear(dunkerque,'soldier',harbor);
  const harborScreen=await project(mobile,dunkerque,harbor,0);
  await button(mobile,'Garnison').tap();
  const mobileRoof=harborScreen(touchRoof.point,touchRoof.height*.69);
  await mobile.touchscreen.tap(...mobileRoof);
  assert.equal(await mobile.locator('.metric.cash strong').textContent(),'1295');
  await mobile.touchscreen.tap(...mobileRoof);
  await button(mobile,'Améliorer · 40 cr').tap();
  assert.equal(await mobile.locator('#unit-equipment').textContent(),'Équipement 2/3');
  await mobile.waitForTimeout(100);
  await snap(mobile,'32-fiche-mobile');
  await button(mobile,'Fermer la fiche').tap();
  assert.ok(dunkerque.place('soldier',dunkerque.roofAccess('soldier',touchRoof),false,touchRoof));
  const shelterRoof=roofNear(dunkerque,'safe',[harbor[0]-5,harbor[1]+3]);
  await button(mobile,'Zone sûre').tap();
  await mobile.touchscreen.tap(...harborScreen(shelterRoof.point,shelterRoof.height*.69));
  await mobile.locator('.zone-pin').tap();
  assert.equal(await mobile.locator('#fort-percent').textContent(),'210/210 PV');
  await button(mobile,'Améliorer · 45 cr').tap();
  assert.equal(await mobile.locator('#fort-percent').textContent(),'315/315 PV');
  await snap(mobile,'47-vie-du-refuge-mobile');
  await button(mobile,'Retour').tap();
  const box=await mobile.locator(canvas).boundingBox();
  const cdp=await mobile.context().newCDPSession(mobile);
  await button(mobile,'Tourelle').tap();
  await button(mobile,'Pose en série').tap();
  assert.equal(await button(mobile,'Pose en série').getAttribute('aria-pressed'),'true');
  const ready=await button(mobile,'Prêt · lancer l’épidémie').boundingBox();
  assert.ok(ready.y+ready.height<=883);
  const detail=await mobile.locator('#detail').boundingBox(),field=await mobile.locator('#normal-tools').boundingBox();
  assert.ok(detail.y+detail.height<=field.y);
  const beforeBatch=Number(await mobile.locator('.metric.cash strong').textContent());
  const [from,to]=[harborScreen([harbor[0]-7,harbor[1]-6]),harborScreen([harbor[0]+7,harbor[1]+6])];
  const send=(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points});
  await send('touchStart',[{x:from[0],y:from[1],id:1}]);
  for(let n=1;n<=6;n++) await send('touchMove',[{x:from[0]+(to[0]-from[0])*n/6,y:from[1]+(to[1]-from[1])*n/6,id:1}]);
  await send('touchEnd',[]);
  const afterBatch=Number(await mobile.locator('.metric.cash strong').textContent());
  assert.ok(beforeBatch-afterBatch>=250);
  assert.match(await mobile.locator('#toast').textContent(),/bâtiments équipés/);
  await snap(mobile,'42-tourelles-en-serie-mobile');
  const at=(dx,id)=>({x:box.x+box.width/2+dx,y:box.y+box.height*.46,id});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[at(-38,1),at(38,2)]});
  for(let n=1;n<=6;n++) {
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[at(-38-n*10,1),at(38+n*10,2)]});
  }
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert.equal(Number(await mobile.locator('.metric.cash strong').textContent()),afterBatch);
  await button(mobile,'Prêt · lancer l’épidémie').tap();
  await button(mobile,'Vitesse ×2').tap();
  await mobile.waitForFunction(()=>Number(document.querySelector('.metric.infect strong')?.textContent)>65);
  const frameTime=await mobile.evaluate(()=>new Promise(resolve=>{
    const gaps=[];
    let previous=0;
    function sample(now) {
      if(previous) gaps.push(now-previous);
      previous=now;
      if(gaps.length===40) resolve(Math.round(gaps.sort((a,b)=>a-b)[20]));
      else requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  }));
  await button(mobile,'Mettre en pause').tap();
  await button(mobile,'Centrer sur les infectés').tap();
  await button(mobile,'Éloigner').tap();
  await button(mobile,'Éloigner').tap();
  await snap(mobile,'27-dunkerque-mobile');

  assert.deepEqual(errors,[],'Erreurs ou avertissements Chromium');
  console.log('Déploiement en série, portée, repérage des hordes, fin de partie et contrôles tactiles vérifiés.');
  console.log(`Profil tactile Chromium (412 × 883, DPR 2, foule réduite) : médiane de ${frameTime} ms entre images.`);
  console.log('Captures : '+folder);
} finally {
  await browser.close();
  local?.server.close();
}
