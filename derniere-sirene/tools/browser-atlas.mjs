import assert from 'node:assert/strict';
import {mkdir,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {chromium} from '../source/node_modules/playwright-core/index.mjs';
import {PerspectiveCamera,Vector3} from '../source/node_modules/three/build/three.module.js';
import {atlas} from '../source/data.mjs';
import {Game} from '../source/game.mjs';
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
  const zoom=Math.max(game.grid.h,game.grid.w/aspect)/(2*Math.tan(22*Math.PI/180))*1.08*.84**steps;
  const camera=new PerspectiveCamera(44,aspect,.12,290);
  camera.position.set(x,zoom*Math.sin(1.48),z+zoom*Math.cos(1.48));
  camera.lookAt(x,0,z);
  camera.updateMatrixWorld();
  return (point,height=1.46)=>{
    const p=new Vector3(point[0],height,point[1]).project(camera);
    return [box.x+(p.x+1)*box.width/2,box.y+(1-p.y)*box.height/2];
  };
}
async function draw(page,points) {
  await page.mouse.move(...points[0]);
  await page.mouse.down();
  for(const p of points.slice(1)) await page.mouse.move(...p,{steps:4});
  await page.mouse.up();
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

try {
  const desktop=await browser.newPage({viewport:{width:1440,height:900}});
  monitor(desktop);
  await atlasMenu(desktop);
  await snap(desktop,'17-villes-reelles');
  for(const id of ['horde','fragile','austerity','night']) await desktop.locator(`[data-value="${id}"]`).click();
  await city(desktop,'lyon');
  assert.equal(await desktop.locator('.metric.cash strong').textContent(),'1152');
  assert.equal(await desktop.locator('.metric.infect strong').textContent(),'85');
  await snap(desktop,'18-lyon-de-nuit');
  await button(desktop,'Pause').click();
  await button(desktop,'Quitter la mission').click();
  for(const id of ['horde','fragile','austerity','night']) await desktop.locator(`[data-value="${id}"]`).click();
  await city(desktop,'metz');
  const metz=await contents('metz');
  const focus=[46,39], steps=5;
  await center(desktop,metz,focus,steps);
  const screen=await project(desktop,metz,focus,steps);
  const refuge=[[44,37],[46,35.65],[48.75,36.45],[49.55,38.75],[47.75,41.75],[43.7,41.4],[43.15,38.8]];
  await button(desktop,'Zone sûre').click();
  await draw(desktop,refuge.map(p=>screen(p)));
  await button(desktop,'Ceinturer').click();
  const zone=metz.drawZone(refuge);
  assert.ok(zone&&metz.surround(zone));
  const gate=[...metz.walls.sections.values()].find(s=>s.a[0]>49&&s.a[1]<38&&metz.walls.openings(s).length);
  await desktop.mouse.click(...screen(metz.walls.openings(gate)[0],1.54));
  assert.match(await desktop.locator('#toast').textContent(),/Porte posée/);
  const wait=[[51.5,37],[54,36.2],[56.5,38],[57,41],[53,42],[51.5,39]];
  await button(desktop,'Zone d’attente').click();
  await draw(desktop,wait.map(p=>screen(p)));
  await button(desktop,'Libérer l’attente').waitFor();
  await snap(desktop,'19-metz-perimetre');
  await button(desktop,'Libérer l’attente').click();
  assert.equal(await button(desktop,'Libérer l’attente').isVisible(),false);
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
  assert.equal(await desktop.locator('.kit .tool').count(),9);
  await button(desktop,'Vitesse ×4').click();
  await desktop.waitForFunction(()=>Number(document.querySelector('.metric.infect strong')?.textContent)>170);
  await button(desktop,'Mettre en pause').click();
  await snap(desktop,'21-toulouse-infection');
  for(let key=1;key<=9;key++) {
    await desktop.keyboard.press(String(key));
    const tool=desktop.locator('.kit .tool').nth(key-1);
    assert.equal(await tool.getAttribute('aria-pressed'),'true');
  }
  const toulouse=await contents('toulouse');
  const outbreak=toulouse.grid.point(toulouse.map.start);
  await center(desktop,toulouse,outbreak,7);
  const aim=await project(desktop,toulouse,outbreak,7);
  await desktop.keyboard.press('3');
  await desktop.mouse.click(...aim(toulouse.location(toulouse.map.start),0));
  assert.equal(await desktop.locator('.metric.cash strong').textContent(),'1520');
  await button(desktop,'Vitesse ×0,5').click();
  await desktop.waitForTimeout(950);
  await button(desktop,'Mettre en pause').click();
  await snap(desktop,'23-toulouse-missile');
  await button(desktop,'Rejouer').click();
  assert.equal(await desktop.locator('#clock').textContent(),'EN ATTENTE');
  assert.equal(await desktop.locator('#modal').isVisible(),false);
  await button(desktop,'Pause').click();
  await button(desktop,'Quitter la mission').click();
  await button(desktop,'Importer une carte OSM').click();
  await desktop.locator('#osm-file').setInputFiles({name:'Quartier test.osm',mimeType:'text/xml',buffer:osmFixture()});
  await button(desktop,'Examiner la carte').click();
  assert.equal(await desktop.locator('.dock h2').textContent(),'Quartier test');
  await desktop.getByRole('link',{name:/OpenStreetMap/}).waitFor();

  const mobile=await browser.newPage({viewport:{width:412,height:883},deviceScaleFactor:2,hasTouch:true,isMobile:true});
  monitor(mobile);
  await atlasMenu(mobile);
  await city(mobile,'dunkerque');
  await button(mobile,'Paramètres').tap();
  const density=mobile.getByLabel('Foule à l’écran');
  assert.equal(await density.inputValue(),'auto');
  await density.selectOption('low');
  await button(mobile,'Fermer').tap();
  const box=await mobile.locator(canvas).boundingBox();
  const cdp=await mobile.context().newCDPSession(mobile);
  const at=(dx,id)=>({x:box.x+box.width/2+dx,y:box.y+box.height*.46,id});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[at(-38,1),at(38,2)]});
  for(let n=1;n<=6;n++) {
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[at(-38-n*10,1),at(38+n*10,2)]});
  }
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
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
  await snap(mobile,'22-dunkerque-mobile');

  assert.deepEqual(errors,[],'Erreurs ou avertissements Chromium');
  console.log('Six villes dans le menu, mutateurs cumulés, portes, zones d’attente, touches 1–9, import OSM, reprise et tactile vérifiés.');
  console.log(`Profil tactile Chromium (412 × 883, DPR 2, foule réduite) : médiane de ${frameTime} ms entre images.`);
  console.log('Captures : '+folder);
} finally {
  await browser.close();
  local?.server.close();
}
