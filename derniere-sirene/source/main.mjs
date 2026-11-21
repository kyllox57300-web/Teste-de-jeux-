import { W,H,terrain as t,defenses,support,missions,specials,endless,difficulty,tree,badges,canUse } from './data.mjs';
import { Game } from './game.mjs';
import { generate,open,point,cell,validCustom } from './city.mjs';
import { available,award,finish,learn,load,parseSave,skillPoints,store } from './progress.mjs';
import { View } from './view.mjs';
import { Audio } from './sound.mjs';

const $=id=>document.getElementById(id);
const dom=Object.fromEntries(['app','topbar','screen','hud','metrics','stage','brief','dock','pins','world','radar','modal','toast','file'].map(id=>[id,$(id)]));
const escape=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(text,action,cls='button',value='')=>`<button class="${cls}" data-action="${action}" data-value="${value}">${text}</button>`;
const clock=t=>`${String(Math.floor(t/60)).padStart(2,'0')}:${String(Math.floor(t%60)).padStart(2,'0')}`;
const stars=n=>'★'.repeat(n)+'☆'.repeat(3-n);
const routeTabs=[['campaign','Campagne'],['special','Opérations spéciales'],['survival','Survie'],['tree','Compétences'],['badges','Succès'],['editor','Éditeur']];
const speeds=[0,.5,1,2,4];
const speedName=v=>v===0?'Ⅱ':v===.5?'×0,5':'×'+v;
const colors=['#414c61','#75839d','#245872','#4e705e','#b9a083'];
const tools=[...Object.keys(support)];
const pointers=new Map();
const audio=new Audio();
const radarCtx=dom.radar.getContext('2d');
let save=load(), page='title', modal='', speed=1, selected='soldier', status='', game=new Game(missions[0]), edit;
let tut=0,tutSteps=0,toastTimer,result,frameClock=0,hudClock=0,acc=0,rafLast=0,view,gesture;

try {
  view=new View(dom.world);
} catch {
  dom.stage.innerHTML='';
  showModal('error','WebGL indisponible',`<p>Le rendu 3D nécessite WebGL 2. Activez l’accélération graphique ou ouvrez le jeu dans un navigateur récent.</p><p><a class="button" href="../">Revenir aux jeux</a></p>`);
}
if(view) {
  view.quality(save.opts.quality);
  go('title');
  requestAnimationFrame(loop);
}

function writeSave() {
  if(!store(save)) notify('Le stockage du navigateur est indisponible. Exportez votre sauvegarde.');
}
function notify(text) {
  dom.toast.textContent=text;
  dom.toast.hidden=false;
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>dom.toast.hidden=true,2600);
}
function header() {
  dom.topbar.innerHTML=`<button class="brand" data-action="${page==='mission'?'pause':'home'}"><span class="logo" aria-hidden="true">◬</span> Dernière Sirène</button><div class="top-actions">${page==='mission'
    ?button('Pause','pause','small')+button('Paramètres','settings','small')
    :button('Paramètres','settings','small')+'<a class="small" href="../">Mes jeux</a>'}</div>`;
}
function go(next) {
  page=next;
  closeModal();
  dom.app.className='app '+(page==='mission'?'mission':page==='title'?'title':'menu');
  dom.hud.hidden=page!=='mission';
  dom.stage.hidden=page!=='mission'&&page!=='title';
  dom.pins.replaceChildren();
  header();
  if(page==='title') {
    game=new Game(missions[0]);
    view.resize();
    view.build(game,true);
    dom.screen.innerHTML=`<section class="title-copy">
      <div class="eyebrow">Commandement de crise</div>
      <h1>Dernière<br><em>Sirène</em></h1>
      <p>Une ville sous vos ordres. Une horde dans ses rues. Faites sortir les civils avant que les abris ne tombent.</p>
      <div class="title-actions">${button(Object.keys(save.records).length?'Reprendre la campagne':'Jouer','nav','button primary','campaign')}${button('Mode survie','nav','button outline','survival')}</div>
    </section><footer class="title-footer">STRATÉGIE EN TEMPS RÉEL · 12 MISSIONS</footer>
    <div class="title-address"><span>◬ FOYER SIGNALÉ</span><br>RUE DES VERRIERS</div>`;
    return;
  }
  if(page==='mission') {
    dom.screen.replaceChildren();
    view.resize();
    view.build(game);
    showHUD(true);
    return;
  }
  menu();
}
function card(m,action,value,locked=false,score=0) {
  return `<button class="mission-card ${m.theme}" data-action="${action}" data-value="${value}" ${locked?'disabled':''}>
    <small class="eyebrow">${typeof m.id==='number'?String(m.id+1).padStart(2,'0')+' · ':''}${m.zone}</small><strong>${escape(m.name)}</strong>
    ${m.rule?`<small>${escape(m.rule)}</small>`:locked?'<small>Mission précédente requise</small>':`<span class="stars" aria-label="${score} étoiles">${stars(score)}</span>`}
  </button>`;
}
function menu() {
  const titles={campaign:'Carte des missions',special:'Opérations spéciales',survival:'Survie infinie',tree:'Arbre de compétences',badges:'Succès',editor:'Éditeur de ville'};
  const total=Object.values(save.records).reduce((a,b)=>a+b.stars,0);
  const captions={campaign:`${Object.keys(save.records).length} / 12 terminées · ${total} / 36 étoiles`,special:'Des règles qui changent la défense.',survival:`Record · ${save.survival} vague${save.survival===1?'':'s'}`,tree:`${skillPoints(save)} point(s) disponible(s). Une première victoire rapporte un point.`,badges:`${save.badges.length} / ${badges.length} déverrouillés`,editor:'Dessinez votre ville, testez-la et sauvegardez-la sur cet appareil.'};
  let body='';
  if(page==='campaign') body=`<div class="matrix">${missions.map(m=>card(m,'mission',m.id,!available(save,m.id),save.records[m.id]?.stars||0)).join('')}</div>`;
  if(page==='special') body=`<div class="matrix">${specials.map(m=>card(m,'mission',m.id)).join('')}</div>`;
  if(page==='survival') body=`<div class="matrix">${card(endless,'mission',endless.id)}</div>`;
  if(page==='tree') body=`<div class="matrix tree-grid">${tree.map(branch=>`<section class="tree-card"><h3>${branch.icon} ${branch.name}</h3>${branch.nodes.map(([id,name,help],i)=>{
    const done=save.skills.includes(id);
    const ready=!done&&skillPoints(save)>0&&(i===0||save.skills.includes(branch.nodes[i-1][0]));
    return `<button class="tree-node ${done?'learned':''}" data-action="learn" data-value="${id}" ${ready?'':'disabled'}><strong>${name}${done?' ✓':''}</strong><small>${help}</small></button>`;
  }).join('')}</section>`).join('')}</div>`;
  if(page==='badges') body=`<div class="matrix">${badges.map(([id,name,help])=>`<div class="badge-card ${save.badges.includes(id)?'complete':''}"><strong>${save.badges.includes(id)?'★':'☆'} ${name}</strong><small>${help}</small></div>`).join('')}</div>`;
  if(page==='editor') {
    if(!edit) startEdit();
    body=`<div class="editor"><canvas id="editor-grid" width="625" height="475" aria-label="Grille de la ville à éditer"></canvas><div class="editor-tools">
      <label>Nom de la ville <input id="city-name" maxlength="38" value="${escape(edit.name)}"></label>
      <div class="options-row">${['Rue','Bâtiment','Parc','Eau','Pont','Foyer','Refuge'].map((label,i)=>button(label,'paint','tab '+(edit.brush===i?'active':''),i)).join('')}</div>
      <div class="options-row">${button('Enregistrer','saveCity','button primary')}${button('Tester','testCity')}${button('Nouvelle grille','newCity')}</div>
      <div id="cities">${save.cities.map((c,i)=>`<div class="city-card"><strong>${escape(c.name)}</strong><div class="options-row">${button('Modifier','editCity','small',i)}${button('Jouer','runCity','small',i)}${button('Supprimer','deleteCity','small',i)}</div></div>`).join('')}</div>
    </div></div>`;
  }
  const diffSelect=['campaign','special','survival'].includes(page)?`<div class="options-row">${Object.entries(difficulty).map(([id,d])=>button(d.name,'difficulty','tab '+(id===save.opts.level?'active':''),id)).join('')}</div>`:'';
  dom.screen.innerHTML=`<section class="shell"><div class="content"><div class="heading"><div><div class="eyebrow">Poste de commandement</div><h1>${titles[page]}</h1><p>${captions[page]}</p></div>${diffSelect}</div>
    <nav class="tabs" aria-label="Modes de jeu">${routeTabs.map(([id,name])=>button(name,'nav','tab '+(id===page?'active':''),id)).join('')}</nav>${body}
  </div></section>`;
  if(page==='editor') wireEditor();
}
function startEdit(source=null,index=-1) {
  const seed=source?.seed||Math.floor(Math.random()*30000)+1;
  const map=source?{cells:source.layout,start:source.start,end:source.end}:generate({...missions[0],seed});
  edit={name:source?.name||'Nouvelle ville',layout:map.cells.slice(),start:map.start,end:map.end,seed,brush:0,index};
}
function drawEditor() {
  const ctx=$('editor-grid').getContext('2d');
  const s=25;
  for(const [i,kind] of edit.layout.entries()) {
    const [x,z]=point(i);
    ctx.fillStyle=colors[kind];
    ctx.fillRect(x*s,z*s,s-1,s-1);
    if(i===edit.start||i===edit.end) {
      ctx.fillStyle=i===edit.start?'#ffa787':'#88ffda';
      ctx.beginPath();ctx.arc(x*s+s/2,z*s+s/2,8,0,Math.PI*2);ctx.fill();
    }
  }
}
function wireEditor() {
  const cv=$('editor-grid');
  drawEditor();
  $('city-name').oninput=e=>edit.name=e.target.value;
  const paint=e=>{
    const rect=cv.getBoundingClientRect();
    const x=Math.floor((e.clientX-rect.left)/rect.width*W),z=Math.floor((e.clientY-rect.top)/rect.height*H);
    if(x<0||x>=W||z<0||z>=H) return;
    const i=cell(x,z);
    if(edit.brush===5||edit.brush===6) {
      if(!open(edit.layout,i)) edit.layout[i]=t.road;
      edit[edit.brush===5?'start':'end']=i;
    } else edit.layout[i]=[t.road,t.block,t.park,t.water,t.bridge][edit.brush];
    drawEditor();
  };
  cv.onpointerdown=e=>{cv.setPointerCapture(e.pointerId);paint(e);};
  cv.onpointermove=e=>{if(e.buttons||cv.hasPointerCapture(e.pointerId)) paint(e);};
}
function localMission(city) {
  return {...missions[2],...city,id:'local-'+city.seed,zone:'VILLE PERSONNALISÉE',boss:false,briefing:['Commandement','Votre ville, vos itinéraires. Installez vos équipes et ouvrez les abris.']};
}
function editCity(test=false) {
  if(!edit.name.trim()) return notify('Donnez un nom à la ville.');
  if(!validCustom(edit.layout,edit.start,edit.end)) return notify('Reliez le foyer au refuge et prévoyez au moins 30 cases habitables.');
  const city={name:edit.name.trim(),layout:edit.layout.slice(),start:edit.start,end:edit.end,seed:edit.seed};
  if(test) return start(localMission(city));
  if(edit.index<0) {
    if(save.cities.length>=20) return notify('Limite de 20 villes atteinte.');
    edit.index=save.cities.push(city)-1;
  } else save.cities[edit.index]=city;
  award(save,'builder');
  writeSave();menu();notify('Ville enregistrée.');
}
function start(m) {
  if(!m) return;
  game=new Game(m,save.opts.level,save.skills.slice());
  selected='soldier';speed=save.opts.speed;acc=0;status='';result=null;
  tut=m.id===0&&!save.seen?1:0;
  tutSteps=0;
  go('mission');
  if(tut) opening();
  else showModal('briefing',m.name,`<p class="eyebrow">${escape(m.briefing[0])}</p><p>« ${escape(m.briefing[1])} »</p>${m.rule?`<p>${escape(m.rule)}</p>`:''}<div class="dialog-actions">${button('Examiner la carte','close','button primary')}</div>`);
}
function opening() {
  showModal('briefing','La première sirène',`<p class="eyebrow">Générale Varga · Canal 01</p><p>« Foyer confirmé à l’est. Protégez les carrefours et conduisez les habitants au refuge. Nous commençons quand vous êtes prêt. »</p>
    <p><strong>Mission</strong> · Éliminez tous les infectés et sauvez le plus de civils possible.</p>
    <div class="dialog-actions">${button('Prendre le commandement','close','button primary')}${button('Passer le tutoriel','skip')}</div>`);
}
function begin() {
  if(!game.prepare()) return;
  selected='';
  if(tut) {tut=4;save.seen=true;writeSave();}
  showHUD(true);
}
function showHUD(rebuild=false) {
  const live=game.combat;
  const items=live?support:defenses;
  if(rebuild) {
    dom.dock.innerHTML=`<div class="dock-head"><div><span class="eyebrow">${live?'Épidémie':'Préparation'}</span><h2>${escape(game.mission.name)}</h2></div><span class="clock" id="clock"></span></div>
      <div class="kit" aria-label="${live?'Renforts':'Défenses'}">${Object.entries(items).map(([id,info],n)=>`<button class="tool" data-action="tool" data-value="${id}" title="${info.info}" aria-label="${info.name}"><span class="icon" aria-hidden="true">${info.icon}</span><span><span class="tool-label">${info.name}</span><span class="tool-price" id="price-${id}">${live?(n+1)+' · ':''}${game.cost(id)} cr</span></span></button>`).join('')}</div>
      <div class="tool-detail" id="detail"></div>
      <div class="tools-extra">${button('Tracer un couloir','tool','small','guide')}${button('Effacer le couloir','erase','small')}${live?button('Détoner','tool','small','boom'):button('Retirer','tool','small','sell')}</div>
      <footer><div class="speed" aria-label="Vitesse">${speeds.map(v=>button(speedName(v),'speed','',v)).join('')}</div>${live?'':button('Prêt · lancer l’épidémie','ready','button primary')}</footer>`;
  }
  const metrics=[['cash','Crédits',game.money],['rescue','À l’abri',game.sheltered+'/'+game.mission.pop],['infect','Infectés',game.remaining],['','Victimes',game.lost]];
  dom.metrics.innerHTML=metrics.map(([cls,name,n])=>`<div class="metric ${cls}"><strong>${n}</strong><small>${name}</small></div>`).join('');
  $('clock').textContent=live?clock(game.time)+' · V'+game.wave:'EN ATTENTE';
  $('detail').textContent=items[selected]?.info||({
    guide:'Glissez sur les rues pour tracer un itinéraire vers la croix verte. Sur mobile, utilisez deux doigts pour déplacer la carte.',
    sell:'Touchez une défense pour la retirer et récupérer son coût.',
    boom:'Touchez une charge posée pour la déclencher.'
  }[selected])||(live?'Choisissez un renfort, puis sa cible sur la carte.':'Cliquez sur une rue pour placer la défense choisie.');
  for(const btn of dom.dock.querySelectorAll('[data-action="tool"]')) {
    const id=btn.dataset.value;
    btn.classList.toggle('active',selected===id);
    btn.setAttribute('aria-pressed',selected===id);
    if(!items[id]) continue;
    const cost=game.cost(id), cd=live?Math.max(0,Math.ceil((game.cd[id]||0)-game.time)):0;
    const locked=!canUse(id,game.skills);
    const noair=!!(live&&game.mission.noair&&items[id].air);
    btn.disabled=locked||noair||cd>0||cost>game.money;
    $('price-'+id).textContent=locked?'Compétence':noair?'Indisponible':cd>0?'⏱ '+cd+' s':(live?(tools.indexOf(id)+1)+' · ':'')+cost+' cr';
  }
  for(const btn of dom.dock.querySelectorAll('[data-action="speed"]')) {
    btn.classList.toggle('active',Number(btn.dataset.value)===speed);
    btn.setAttribute('aria-label', Number(btn.dataset.value)===0?'Mettre en pause':'Vitesse '+btn.textContent);
  }
  const hints={
    1:['Placez deux escouades','Touchez des rues entre le foyer orange et les civils. Les tirs peuvent attirer la horde.'],
    2:['Donnez une direction aux civils','Sélectionnez « Tracer un couloir », puis touchez ou glissez le long des rues vers la croix verte.'],
    3:['Lancez l’épidémie','Appuyez sur « Prêt ». Vous gagnerez des crédits en éliminant les infectés et en accueillant des civils.'],
    4:['Crédits, renforts et pause','Sélectionnez un renfort, puis sa cible. Évitez les civils avec les attaques de zone.']
  };
  const hint=hints[tut];
  dom.brief.innerHTML=hint?`<strong>${hint[0]}</strong><p>${hint[1]}</p>`:status?`<strong>${escape(status)}</strong>`:!live?`<strong>${escape(game.mission.zone)}</strong><p>${escape(game.mission.rule||'Protégez les accès aux refuges. Le temps est arrêté.')}</p>`:'';
}
function choose(id) {
  if(id==='guide' || id==='boom' || id==='sell') selected=selected===id?'':id;
  else if(game.combat?game.legal(id,game.map.end):defenses[id]&&canUse(id,game.skills)&&game.cost(id)<=game.money) selected=id;
  showHUD();
}
function mapAction(i,append=false) {
  if(i<0||modal||page!=='mission') return;
  if(selected==='guide') {
    if(!open(game.map.cells,i)) return;
    game.setGuide([i],append);
    if(tut===2) tut=3;
  } else if(selected==='sell') {
    if(!game.sell(i)) return;
  } else if(selected==='boom' || (game.combat&&!selected)) {
    if(!game.detonate(i)) return;
  } else if(selected) {
    const ok=game.combat?game.call(selected,i):game.place(selected,i);
    if(ok && tut===1 && ++tutSteps>=2) tut=2;
    if(!ok) {
      const u=game.units.get(i);
      if(u?.id==='safe') return notify(`Zone sûre · ${u.sheltered}/${u.cap} personnes · intégrité ${Math.round(u.hp/u.maxHp*100)} %`);
      return notify('Choisissez une rue libre et vérifiez votre budget.');
    }
  } else {
    const u=game.units.get(i);
    if(u?.id==='safe') notify(`Zone sûre · ${u.sheltered}/${u.cap} personnes`);
  }
  showHUD();
}
function settings() {
  const opts=save.opts;
  const options=(entries,value)=>entries.map(([id,label])=>`<option value="${id}" ${String(id)===String(value)?'selected':''}>${label}</option>`).join('');
  showModal('settings','Paramètres',`
    <label class="setting">Effets sonores <input type="checkbox" data-opt="sound" ${opts.sound?'checked':''}></label>
    <label class="setting">Musique <input type="checkbox" data-opt="music" ${opts.music?'checked':''}></label>
    <label class="setting">Qualité graphique <select data-opt="quality">${options([['low','Bas'],['medium','Moyen'],['high','Haut']],opts.quality)}</select></label>
    <label class="setting">Vitesse initiale <select data-opt="speed">${options(speeds.slice(1).map(v=>[v,speedName(v)]),opts.speed)}</select></label>
    <label class="setting">Difficulté <select data-opt="level">${options(Object.entries(difficulty).map(([k,v])=>[k,v.name]),opts.level)}</select></label>
    <div class="dialog-actions">${button('Exporter la sauvegarde','export')}${button('Importer','import')}${button('Fermer','close','button primary')}</div>`);
}
function showModal(kind,title,html) {
  modal=kind;
  dom.modal.hidden=false;
  dom.modal.innerHTML=`<section class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><div class="eyebrow">Dernière Sirène</div><h2 id="dialog-title">${title}</h2>${html}</section>`;
  dom.modal.querySelector('button')?.focus();
}
function closeModal() {
  modal='';
  dom.modal.hidden=true;
  dom.modal.replaceChildren();
}
function pause() {
  if(page!=='mission'||modal==='result') return;
  showModal('pause','Opération en pause',`<p>Les équipes attendent vos ordres.</p><div class="dialog-actions">${button('Reprendre','close','button primary')}${button('Recommencer','retry')}${button('Quitter la mission','quit','button danger')}</div>`);
}
function endMission() {
  result=finish(save,game);
  writeSave();
  const won=game.phase==='won', finale=won&&game.mission.id===11, survival=game.mission.id==='survival';
  if(finale) audio.tick([{type:'rescue'}],save.opts,false,true);
  const title=finale?'Après la sirène':survival?'Fin de transmission':won?'Ville sécurisée':'Opération compromise';
  const total=Object.values(save.records).reduce((a,b)=>a+b.stars,0);
  const stats=[['Sauvés',result.saved+'/'+game.mission.pop],['Victimes',result.lost],['Infectés éliminés',result.kills],['Pertes alliées',result.friendly],['Score',result.score.toLocaleString('fr-FR')],[survival?'Vague':'Durée',survival?result.wave:clock(result.time)]];
  const epilogue=finale?`<p>« Les bateaux ont quitté l’estuaire. Imani a fermé l’installation. Pour la première fois depuis les Verriers, la radio ne demande plus de secours. » — Capitaine Sol</p><p>Bilan de campagne · ${Object.keys(save.records).length} villes sécurisées · ${total}/36 étoiles · ${Object.values(save.records).reduce((a,b)=>a+b.saved,0)} civils sauvés sur vos meilleurs résultats.</p>`:'';
  const next=won&&typeof game.mission.id==='number'&&game.mission.id<missions.length-1?button('Mission suivante','next','button primary'):'';
  showModal('result',title,`${won?`<p class="stars" aria-label="${result.stars} étoiles">${stars(result.stars)}</p>`:''}${epilogue}
    <div class="stats">${stats.map(([label,n])=>`<div><strong>${n}</strong>${label}</div>`).join('')}</div>
    <div class="dialog-actions">${next}${button('Rejouer','retry')}${button('Retour au commandement','quit')}</div>`);
}
function dispatch(action,value) {
  audio.wake();
  if(action==='home') go('title');
  if(action==='nav') go(value);
  if(action==='mission') start(missions.find(m=>String(m.id)===value&&available(save,m.id))||specials.find(m=>m.id===value)||(value===endless.id?endless:null));
  if(action==='settings') settings();
  if(action==='difficulty') {save.opts.level=value;writeSave();menu();}
  if(action==='learn'&&learn(save,value)) {writeSave();menu();notify('Compétence acquise.');}
  if(action==='tool') choose(value);
  if(action==='erase') {game.setGuide([]);showHUD();}
  if(action==='ready') begin();
  if(action==='pause') pause();
  if(action==='speed') {speed=Number(value);showHUD();}
  if(action==='zoom-in') view.zoomBy(.84);
  if(action==='zoom-out') view.zoomBy(1.19);
  if(action==='rotate') {view.angle+=Math.PI/4;view.cameraAt();}
  if(action==='resetcam') view.reset();
  if(action==='close') closeModal();
  if(action==='skip') {tut=0;save.seen=true;writeSave();closeModal();showHUD();}
  if(action==='retry') start(game.mission);
  if(action==='next') start(missions[game.mission.id+1]);
  if(action==='quit') {
    const id=game.mission.id;
    go(typeof id==='number'?'campaign':id==='survival'?'survival':id.startsWith('local')?'editor':'special');
  }
  if(action==='export') {
    const url=URL.createObjectURL(new Blob([JSON.stringify(save,null,2)],{type:'application/json'}));
    const a=document.createElement('a');
    a.href=url;a.download='derniere-sirene-sauvegarde.json';a.click();
    setTimeout(()=>URL.revokeObjectURL(url),5000);
  }
  if(action==='import') dom.file.click();
  if(action==='paint') {edit.brush=Number(value);menu();}
  if(action==='saveCity') editCity();
  if(action==='testCity') editCity(true);
  if(action==='newCity') {startEdit();menu();}
  if(action==='editCity') {startEdit(save.cities[Number(value)],Number(value));menu();}
  if(action==='runCity') start(localMission(save.cities[Number(value)]));
  if(action==='deleteCity') showModal('delete','Supprimer cette ville ?',`<p>${escape(save.cities[Number(value)].name)}</p><div class="dialog-actions">${button('Annuler','close')}${button('Supprimer','confirmDelete','button danger',value)}</div>`);
  if(action==='confirmDelete') {
    save.cities.splice(Number(value),1);
    startEdit();writeSave();closeModal();menu();
  }
}
dom.app.addEventListener('click',e=>{
  const b=e.target.closest('[data-action]');
  if(b) dispatch(b.dataset.action,b.dataset.value);
});
dom.modal.addEventListener('change',e=>{
  const {opt}=e.target.dataset;
  if(!opt) return;
  save.opts[opt]=e.target.type==='checkbox'?e.target.checked:opt==='speed'?Number(e.target.value):e.target.value;
  if(opt==='quality') view.quality(save.opts.quality);
  if(opt==='speed'&&page==='mission') {speed=save.opts.speed;showHUD();}
  writeSave();
});
dom.file.addEventListener('change',async()=>{
  const file=dom.file.files[0];
  if(!file) return;
  try {
    const data=parseSave(await file.text());
    save=data;
    edit=null;
    writeSave();view.quality(save.opts.quality);go('campaign');
    notify('Sauvegarde importée.');
  } catch(e) {notify('Import impossible. '+e.message);}
  dom.file.value='';
});
window.addEventListener('keydown',e=>{
  if(e.key==='Escape') {
    if(modal&&modal!=='result') closeModal();
    else if(page==='mission') pause();
    return;
  }
  if(page!=='mission'||modal||e.repeat||e.target.matches('input,select')) return;
  if(e.code==='Space'&&!e.target.closest('button')) {
    e.preventDefault();speed=speed?0:save.opts.speed;showHUD();
  }
  if(/^[1-9]$/.test(e.key)&&game.combat) choose(tools[Number(e.key)-1]);
  const dirs={ArrowLeft:[45,0],ArrowRight:[-45,0],ArrowUp:[0,45],ArrowDown:[0,-45]};
  if(dirs[e.key]) {e.preventDefault();view.pan(...dirs[e.key]);}
});

const canvas=dom.world;
const location=e=>({x:e.clientX,y:e.clientY});
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const centroid=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('wheel',e=>{
  if(page!=='mission'||modal) return;
  e.preventDefault();view.zoomBy(Math.exp(Math.max(-110,Math.min(110,e.deltaY))*.0036));
},{passive:false});
canvas.addEventListener('pointerdown',e=>{
  if(page!=='mission'||modal) return;
  canvas.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId,location(e));
  if(pointers.size===1) gesture={start:location(e),moved:false,rotate:e.button===2,pan:e.button===1||e.shiftKey,drawing:selected==='guide'&&e.button===0&&!e.shiftKey,painted:false};
  if(pointers.size>1) {gesture.moved=true;gesture.drawing=false;}
});
canvas.addEventListener('pointermove',e=>{
  if(page!=='mission'||modal) return;
  const at=location(e), before=pointers.get(e.pointerId);
  const i=view.pick(at.x,at.y);
  if(e.pointerType==='mouse') view.highlight(i,selected,game.legal(selected,i)||selected==='guide'||selected==='sell'||selected==='boom');
  if(!before||!gesture) return;
  if(pointers.size>=2) {
    const other=[...pointers].find(([id])=>id!==e.pointerId)[1];
    const prev=distance(other,before), now=distance(other,at);
    const a=centroid(other,before), b=centroid(other,at);
    if(prev>5&&now>5) view.zoomBy(prev/now);
    view.pan(b.x-a.x,b.y-a.y);
  } else if(distance(at,gesture.start)>5||gesture.moved) {
    gesture.moved=true;
    if(gesture.rotate) {
      view.angle-=(at.x-before.x)*.0085;
      view.tilt=Math.max(.48,Math.min(1.44,view.tilt+(at.y-before.y)*.004));
      view.cameraAt();
    } else if(gesture.drawing) {
      if(!gesture.painted) {
        const first=view.pick(gesture.start.x,gesture.start.y);
        if(first>=0) mapAction(first,true);
      }
      if(i!==gesture.last) mapAction(i,true);
      gesture.last=i;
      gesture.painted=true;
    } else view.pan(at.x-before.x,at.y-before.y);
  }
  pointers.set(e.pointerId,at);
});
function release(e) {
  if(!pointers.has(e.pointerId)) return;
  pointers.delete(e.pointerId);
  if(pointers.size) return;
  if(gesture && !gesture.moved && !gesture.rotate && !gesture.pan && e.type==='pointerup') {
    audio.wake();
    mapAction(view.pick(e.clientX,e.clientY),true);
  }
  gesture=null;
}
canvas.addEventListener('pointerup',release);
canvas.addEventListener('pointercancel',release);
canvas.addEventListener('lostpointercapture',release);
canvas.addEventListener('pointerleave',()=>{if(view)view.highlight(-1,'',false);});
dom.radar.addEventListener('pointerdown',e=>{
  const r=dom.radar.getBoundingClientRect();
  const i=cell(Math.floor((e.clientX-r.left)/r.width*W),Math.floor((e.clientY-r.top)/r.height*H));
  view.focusAt(i);
});
function mapOverlay() {
  const ctx=radarCtx, w=5;
  ctx.clearRect(0,0,W*w,H*w);
  for(const [i,type] of game.map.cells.entries()) {
    const [x,z]=point(i);
    ctx.fillStyle=game.fog[i]>.42?'#a7544c':colors[type];
    ctx.fillRect(x*w,z*w,w,w);
  }
  for(const c of game.civs) {
    ctx.fillStyle='#8bd7ee';ctx.fillRect(c.x*w+1,c.z*w+1,2,2);
  }
  for(const z of game.zombies) {
    ctx.fillStyle='#ff9c72';ctx.fillRect(z.x*w+1,z.z*w+1,2,2);
  }
  for(const u of game.units.values()) {
    const [x,z]=point(u.i);
    ctx.fillStyle=u.id==='safe'?'#91ffe3':'#adbdcc';
    ctx.fillRect(x*w+1,z*w+1,3,3);
  }
  ctx.strokeStyle='#fff2c5';
  ctx.strokeRect(view.focus.x*w-3,view.focus.z*w-3,9,9);
}
function pins() {
  const safe=[...game.units.values()].filter(u=>u.id==='safe');
  const pinData=[...safe.map(u=>[u.i,`✚ ${u.sheltered}/${u.cap}`,'']),[game.map.start,game.phase==='prep'?'◬ FOYER':'◬ V'+game.wave,'hot']];
  while(dom.pins.children.length<pinData.length) dom.pins.append(document.createElement('div'));
  while(dom.pins.children.length>pinData.length) dom.pins.lastChild.remove();
  pinData.forEach(([i,text,cls],index)=>{
    const [x,z]=point(i);
    const [sx,sy,on]=view.project(x,z,.82);
    const pin=dom.pins.children[index];
    pin.className='pin '+cls;
    if(pin.textContent!==text) pin.textContent=text;
    pin.style.left=sx+'px';pin.style.top=sy+'px';
    pin.hidden=!on||sx<4||sx>view.width-4||sy<5||sy>view.height;
  });
}
function loop(nowMs) {
  requestAnimationFrame(loop);
  const now=nowMs/1000, dt=Math.min(.12,Math.max(0,now-(rafLast||now)));
  rafLast=now;
  if(page==='mission') {
    if(game.combat&&speed&&!modal) {
      acc+=dt*speed;
      while(acc>=.08&&game.combat) {game.step(.08);acc-=.08;}
      if(game.mission.id==='survival'&&game.wave>save.survival) {
        save.survival=game.wave;for(const id of game.flags) award(save,id);writeSave();
      }
      if(!game.combat) endMission();
    }
    if(game.events.length) {
      view.addEffects(game.events);
      audio.tick(game.events,save.opts,game.combat,!modal);
      const alert=game.events.find(e=>e.type==='boss'||e.type==='collapse');
      if(alert) {
        status=alert.type==='boss'?'Contact lourd · L’Amiral entre en ville.':'Position perdue · Défense submergée.';
        setTimeout(()=>{if(page==='mission') status='';},4500);
      }
      game.events.length=0;
    } else audio.tick([],save.opts,game.combat,!modal);
    if(now-hudClock>.16) {
      hudClock=now;
      if(!result) showHUD();
      mapOverlay();
    }
    if(now-frameClock>(save.opts.quality==='low'?.031:.015)) {
      frameClock=now;
      view.render(game,now,dt,false,!!modal||speed===0);
      pins();
    }
  } else if(page==='title'&&now-frameClock>.033) {
    frameClock=now;view.render(game,now,dt,true);audio.tick([],save.opts,false,!modal);
  }
}

if(locationIsSecure() && 'serviceWorker' in navigator) navigator.serviceWorker.register('./offline.js').catch(()=>{});
function locationIsSecure() { return window.location.protocol==='https:'||window.location.hostname==='localhost'||window.location.hostname==='127.0.0.1'; }
