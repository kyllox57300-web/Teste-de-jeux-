import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from '../source/node_modules/esbuild/lib/main.js';
import { chromium } from '../source/node_modules/playwright-core/index.mjs';
import { PerspectiveCamera,Vector3 } from '../source/node_modules/three/build/three.module.js';
import { serve } from './serve.mjs';

const captures=resolve(process.env.SIRENE_CAPTURES||fileURLToPath(new URL('../captures/',import.meta.url)));
await mkdir(captures,{recursive:true});
const {server,url}=await serve();
let browser;
try {
  browser=await chromium.launch({
    executablePath:process.env.SIRENE_CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args:process.env.SIRENE_SOFTWARE?['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--enable-unsafe-swiftshader'],
    headless:true
  });
  const failures=[];
  function observe(page) {
    page.on('pageerror',e=>failures.push(e.stack||e.message));
    page.on('console',msg=>{if(msg.type()==='error'||msg.type()==='warning') failures.push(msg.text());});
  }
  async function snap(page,name) {
    await page.screenshot({path:resolve(captures,name+'.jpg'),quality:90,timeout:30000});
  }
  async function projector(page) {
    const box=await page.locator('#world').boundingBox();
    const aspect=box.width/box.height, zoom=aspect<1?35:27;
    const camera=new PerspectiveCamera(44,aspect,.12,105);
    camera.position.set(12+Math.sin(.16)*Math.cos(.99)*zoom,zoom*Math.sin(.99),9+Math.cos(.16)*Math.cos(.99)*zoom);
    camera.lookAt(12,0,9);
    camera.updateMatrixWorld();
    return (x,z)=>{
      const p=new Vector3(x,0,z).project(camera);
      return [box.x+(p.x+1)/2*box.width,box.y+(1-p.y)/2*box.height];
    };
  }
  const context=await browser.newContext({viewport:{width:1440,height:900},acceptDownloads:true});
  const desktop=await context.newPage();
  observe(desktop);
  await desktop.goto(url);
  await desktop.getByRole('button',{name:'Jouer',exact:true}).waitFor({timeout:18000});
  await snap(desktop,'01-titre');
  await desktop.getByRole('button',{name:'Jouer',exact:true}).click();
  assert.equal(await desktop.locator('.mission-card').count(),12);
  assert.equal(await desktop.locator('.mission-card:disabled').count(),11);
  await snap(desktop,'02-campagne');
  await desktop.getByRole('button',{name:/Rue des Verriers/}).click();
  await desktop.getByRole('button',{name:'Prendre le commandement'}).click();
  const point=await projector(desktop);
  await desktop.getByRole('button',{name:'Tourelle',exact:true}).click();
  await desktop.mouse.click(...point(22,6));
  await desktop.getByRole('button',{name:'Soldats',exact:true}).click();
  for(const [x,z] of [[21,7],[23,7],[19,9],[18,10],[16,12]]) await desktop.mouse.click(...point(x,z));
  await desktop.getByRole('button',{name:'Zone sûre',exact:true}).click();
  await desktop.mouse.click(...point(1,6));
  assert.equal(await desktop.locator('.metric.cash strong').textContent(),'5');
  await desktop.getByRole('button',{name:'Tracer un couloir'}).click();
  await desktop.mouse.move(...point(9,10));
  await desktop.mouse.down();
  await desktop.mouse.move(...point(2,10),{steps:16});
  await desktop.mouse.up();
  await snap(desktop,'03-preparation');
  await desktop.getByRole('button',{name:/Prêt · lancer/}).click();
  await desktop.getByRole('button',{name:'Vitesse ×4'}).click();
  await desktop.waitForFunction(()=>Number(document.querySelector('.metric.infect strong').textContent)<9,{},{timeout:25000});
  await desktop.keyboard.press('9');
  await snap(desktop,'04-epidemie');
  assert.equal(await desktop.locator('.kit button').count(),6);
  await desktop.keyboard.press('Escape');
  await desktop.getByRole('button',{name:'Reprendre',exact:true}).click();
  await desktop.getByRole('button',{name:'Vitesse ×4'}).click();
  await desktop.getByRole('heading',{name:'Ville sécurisée'}).waitFor({timeout:35000});
  await desktop.getByRole('button',{name:'Retour au commandement'}).click();
  assert.equal(await desktop.locator('.mission-card:disabled').count(),10);
  await desktop.getByRole('button',{name:'Compétences',exact:true}).click();
  await desktop.getByRole('button',{name:/Tireurs d’élite/}).click();
  await desktop.getByText('Compétence acquise.').waitFor();
  assert.equal(await desktop.locator('.tree-node.learned').count(),1);

  await desktop.getByRole('button',{name:'Éditeur',exact:true}).click();
  await desktop.getByLabel('Nom de la ville').fill('Quartier de test');
  await desktop.getByRole('button',{name:'Parc',exact:true}).click();
  await desktop.locator('#editor-grid').click({position:{x:9,y:9}});
  await desktop.getByRole('button',{name:'Enregistrer',exact:true}).click();
  await desktop.getByText('Ville enregistrée.').waitFor();
  await desktop.getByRole('button',{name:'Jouer',exact:true}).click();
  await desktop.getByRole('heading',{name:'Quartier de test'}).first().waitFor();
  await desktop.getByRole('button',{name:'Examiner la carte'}).click();
  await desktop.getByRole('button',{name:'Paramètres'}).click();
  const dl=desktop.waitForEvent('download');
  await desktop.getByRole('button',{name:'Exporter la sauvegarde'}).click();
  const download=await dl;
  await desktop.locator('#file').setInputFiles(await download.path());
  await desktop.getByText('Sauvegarde importée.').waitFor();
  await desktop.getByRole('button',{name:'Succès',exact:true}).click();
  assert.equal(await desktop.locator('.badge-card').count(),24);
  await desktop.getByText(/Urbaniste/).waitFor();
  assert.ok(await desktop.locator('.badge-card.complete').getByText(/Urbaniste/).count());
  await desktop.getByRole('button',{name:'Compétences',exact:true}).click();
  assert.equal(await desktop.locator('.tree-node').count(),16);

  const mobileContext=await browser.newContext({viewport:{width:375,height:667},isMobile:true,hasTouch:true,deviceScaleFactor:1.35});
  const phone=await mobileContext.newPage();
  observe(phone);
  await phone.goto(url);
  await phone.getByRole('button',{name:'Jouer',exact:true}).tap();
  await phone.getByRole('button',{name:/Rue des Verriers/}).tap();
  await phone.getByRole('button',{name:'Passer le tutoriel'}).tap();
  const dimensions=await phone.locator('#world').boundingBox();
  assert.ok(dimensions.height>=350);
  assert.ok(await phone.locator('#dock').evaluate(d=>d.scrollWidth<=d.clientWidth));
  const touch=await projector(phone);
  await phone.touchscreen.tap(...touch(16,12));
  assert.equal(await phone.locator('.metric.cash strong').textContent(),'500');
  const cdp=await mobileContext.newCDPSession(phone);
  const mx=Math.round(dimensions.x+dimensions.width*.51), my=Math.round(dimensions.y+dimensions.height*.60);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:mx-28,y:my,id:1},{x:mx+28,y:my,id:2}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:mx-68,y:my+20,id:1},{x:mx+68,y:my+20,id:2}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert.equal(await phone.locator('.metric.cash strong').textContent(),'500');
  await phone.getByRole('button',{name:'Recentrer'}).tap();
  await phone.getByRole('button',{name:'Rapprocher'}).tap();
  await phone.getByRole('button',{name:'Éloigner'}).tap();
  await phone.getByRole('button',{name:/Prêt · lancer/}).tap();
  await phone.getByRole('button',{name:'Mettre en pause'}).tap();
  await snap(phone,'05-mobile');

  await desktop.evaluate(()=>navigator.serviceWorker.ready);
  await desktop.waitForFunction(()=>!!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await desktop.reload();
  await desktop.getByRole('heading',{name:'Dernière Sirène'}).waitFor();
  await context.close();
  await mobileContext.close();

  const stressPage=await browser.newPage({viewport:{width:800,height:450}});
  observe(stressPage);
  await stressPage.setContent('<canvas id="map" style="width:790px;height:440px"></canvas>');
  const stressScript=await build({write:false,bundle:true,stdin:{resolveDir:fileURLToPath(new URL('../source/',import.meta.url)),contents:`
    import {Game} from './game.mjs';
    import {View} from './view.mjs';
    import {missions} from './data.mjs';
    const game=new Game({...missions[11],count:650});
    const view=new View(document.getElementById('map'),'low');
    view.build(game);
    game.prepare();
    const gl=view.renderer.getContext();
    const debug=gl.getExtension('WEBGL_debug_renderer_info');
    const engine=debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):'WebGL';
    let frames=0,started=0;
    const draw=()=>{
      game.step(.08);
      view.render(game,frames/30,1/30);
      frames++;
      if(frames===4) started=performance.now();
      if(frames<52) requestAnimationFrame(draw);
      else window.report={ms:Math.round(performance.now()-started),count:game.remaining,engine};
    };
    requestAnimationFrame(draw);
  `}});
  await stressPage.addScriptTag({content:stressScript.outputFiles[0].text});
  await stressPage.waitForFunction(()=>window.report,{},{timeout:20000});
  const perf=await stressPage.evaluate(()=>window.report);
  assert.ok(perf.count>=600);
  console.log(`Rendu Chromium : ${perf.count} infectés, 48 images en ${perf.ms} ms (${perf.engine}).`);
  await stressPage.close();
  assert.deepEqual(failures,[]);
  console.log('Bureau, tactile, sauvegarde, éditeur, succès, réglages et rechargement hors ligne vérifiés.');
} finally {
  await browser?.close();
  server.close();
}
