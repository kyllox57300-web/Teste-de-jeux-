import { W,H,terrain as t,defenses,missions,specials,endless,metz,containment,atlas,mutators,withMutators,difficulty,tree,badges,canUse } from './data.mjs';
import { Game } from './game.mjs';
import { generate,open,point,cell,validCustom } from './city.mjs';
import { available,award,finish,learn,load,parseSave,skillPoints,store } from './progress.mjs';
import { View } from './view.mjs';
import { Audio } from './sound.mjs';
import { convertOSM,parseOSM } from './osm.mjs';

const $=id=>document.getElementById(id);
const dom=Object.fromEntries(['app','topbar','screen','hud','metrics','stage','brief','dock','pins','world','radar','modal','toast','file'].map(id=>[id,$(id)]));
const escape=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(text,action,cls='button',value='')=>`<button class="${cls}" data-action="${action}" data-value="${value}">${text}</button>`;
const clock=t=>`${String(Math.floor(t/60)).padStart(2,'0')}:${String(Math.floor(t%60)).padStart(2,'0')}`;
const stars=n=>'★'.repeat(n)+'☆'.repeat(3-n);
const routeTabs=[['atlas','Villes réelles'],['tree','Compétences'],['campaign','Campagne'],['containment','Confinement'],['special','Opérations spéciales'],['survival','Survie'],['badges','Succès'],['editor','Éditeur']];
const estuary=[[5,62],[13,68],[21,51],[29,41],[37,59],[45,56],[53,34],[61,46],[69,64],[77,57],[85,39],[94,41]];
const speeds=[0,.5,1,2,4];
const speedName=v=>v===0?'Ⅱ':v===.5?'×0,5':'×'+v;
const colors=['#414c61','#75839d','#245872','#4e705e','#b9a083'];
const structureNames={safe:'Zone sûre',wall:'Mur',gate:'Porte',barricade:'Barricade'};
const sectors=[metz,...containment];
const advancedShelter={...defenses.safe,name:'Refuge avancé',info:'Ouvre un refuge desservi par les navettes.'};
const atlasDefenses={
  soldier:{...defenses.soldier,name:'Garnison'},sniper:defenses.sniper,turret:defenses.turret,mortar:defenses.mortar,mines:defenses.mines,
  explosive:{...defenses.explosive,name:'C4'},safe:{...defenses.safe,info:'Affecte un bâtiment au refuge ou trace un quartier à protéger.'},
  wall:defenses.wall,gate:defenses.gate
};
const modifiers=new Set();
const atlasMaps=new Map();
let loading=null;
const pointers=new Map();
const audio=new Audio();
const radarCtx=dom.radar.getContext('2d');
let save=load(), page='title', modal='', speed=1, selected='soldier', status='', game=new Game(missions[0]), edit, freehand=false;
let tut=0,tutSteps=0,toastTimer,result,frameClock=0,hudClock=0,acc=0,rafLast=0,view,gesture;

try {
  view=new View(dom.world,save.opts.quality);
  view.crowd=save.opts.crowd;
} catch {
  dom.stage.innerHTML='';
  showModal('error','WebGL indisponible',`<p>Le rendu 3D nécessite WebGL 2. Activez l’accélération graphique ou ouvrez le jeu dans un navigateur récent.</p><p><a class="button" href="../">Revenir aux jeux</a></p>`);
}
if(view) {
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
    ?(game.mission.atlas?button('Rejouer','retry','small'):'')+button('Pause','pause','small')+button('Paramètres','settings','small')
    :button('Paramètres','settings','small')+'<a class="small" href="../">Mes jeux</a>'}</div>`;
}
function go(next) {
  page=next;
  loading=null;
  pointers.clear();
  gesture=null;
  view.placementPreview=null;
  closeModal();
  dom.app.className='app '+(page==='mission'?'mission':page==='title'?'title':'menu');
  dom.app.classList.toggle('atlas-mission',page==='mission'&&!!game.mission.atlas);
  dom.hud.hidden=page!=='mission';
  dom.stage.hidden=page!=='mission'&&page!=='title';
  $('map-source').hidden=page!=='title'&&(page!=='mission'||!game.mission.metro);
  dom.pins.replaceChildren();
  header();
  if(page==='title') {
    game=new Game(atlas[0]);
    view.resize();
    view.build(game,true);
    dom.screen.innerHTML=`<section class="title-copy">
      <div class="eyebrow">Commandement de crise</div>
      <h1>Dernière<br><em>Sirène</em></h1>
      <p>Une sirène. Des milliers de civils. Boucle les rues avant que l’infection franchisse ton périmètre.</p>
      <div class="title-actions">${button('Villes réelles','nav','button primary','atlas')}${button('Campagne','nav','button outline','campaign')}${button('Contenir un foyer','nav','button outline','containment')}</div>
    </section><div class="title-address">METZ · MOSELLE</div>`;
    return;
  }
  if(page==='mission') {
    dom.screen.replaceChildren();
    view.resize();
    view.build(game);
    $('overview').hidden=!game.mission.atlas;
    projectionLabel();
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
function campaignMap() {
  return `<div class="campaign-map" aria-label="Itinéraire des opérations"><canvas id="estuary" width="1000" height="164" aria-hidden="true"></canvas>
    ${missions.map(({id,name})=>{
      const [x,y]=estuary[id], label=String(id+1).padStart(2,'0');
      return `<button class="map-node ${save.records[id]?'cleared':available(save,id)?'next':''}" style="--x:${x}%;--y:${y}%" data-action="mission" data-value="${id}" title="${escape(name)}" aria-label="Secteur ${label}" ${available(save,id)?'':'disabled'}>${label}</button>`;
    }).join('')}
  </div>`;
}
function paintEstuary() {
  const ctx=$('estuary').getContext('2d');
  ctx.fillStyle='#172d3b';ctx.fillRect(0,0,1000,164);
  for(const side of [-1,1]) {
    ctx.beginPath();ctx.moveTo(-40,82+side*28);
    ctx.bezierCurveTo(210,102+side*39,290,27+side*50,490,70+side*34);
    ctx.bezierCurveTo(620,97+side*48,740,108+side*28,1010,39+side*48);
    ctx.lineTo(1010,side>0?165:-1);ctx.lineTo(-40,side>0?165:-1);ctx.closePath();
    ctx.fillStyle=side>0?'#283a3c':'#263640';ctx.fill();
    ctx.strokeStyle='#577067';ctx.lineWidth=1.4;ctx.stroke();
  }
  for(let x=35;x<1000;x+=45) {
    ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,164);ctx.strokeStyle='#bed1e216';ctx.lineWidth=1;ctx.stroke();
  }
  for(let y=12;y<164;y+=23) {
    ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(1000,y);ctx.stroke();
  }
  ctx.lineWidth=2;
  ctx.lineJoin='round';
  for(let i=1;i<estuary.length;i++) {
    const [a,b]=estuary[i-1], [x,y]=estuary[i];
    ctx.beginPath();ctx.moveTo(a*10,b*1.64);ctx.lineTo(x*10,y*1.64);
    ctx.strokeStyle=available(save,i)?'#8fe4c4':'#929ca282';
    ctx.setLineDash(available(save,i)?[]:[5,4]);ctx.stroke();
  }
}
function menu() {
  const titles={atlas:'Villes réelles',containment:'Confinement',campaign:'Carte des missions',special:'Opérations spéciales',survival:'Survie infinie',tree:'Arbre de compétences',badges:'Succès',editor:'Éditeur de ville'};
  const total=Object.values(save.records).reduce((a,b)=>a+b.stars,0);
  const captions={atlas:'Choisis un secteur. La carte et les traversées viennent d’OpenStreetMap.',containment:'Un foyer au départ. Chaque civil infecté rejoint la horde. Élimine-la pour sécuriser le secteur.',campaign:`${Object.keys(save.records).length} / 12 terminées · ${total} / 36 étoiles`,special:'Des règles qui changent la défense.',survival:`Record · ${save.survival} vague${save.survival===1?'':'s'}`,tree:`${skillPoints(save)} point(s) disponible(s). Une première victoire rapporte un point.`,badges:`${save.badges.length} / ${badges.length} déverrouillés`,editor:'Dessinez votre ville, testez-la et sauvegardez-la sur cet appareil.'};
  let body='';
  if(page==='atlas') body=`<div class="atlas-controls"><div class="options-row" aria-label="Mutateurs">${Object.entries(mutators).map(([id,name])=>
    `<button class="tab ${modifiers.has(id)?'active':''}" data-action="mutator" data-value="${id}" aria-pressed="${modifiers.has(id)}">${name}</button>`).join('')}</div>
    ${button('Importer une carte OSM','osm-help','button outline')}</div>
    <div class="matrix atlas-grid">${atlas.map(m=>{
      const record=save.containment[m.id];
      return `<button class="mission-card ${m.theme}" data-action="atlas-city" data-value="${m.id}" ${loading?'disabled':''}>
        <small class="eyebrow">${m.zone}</small><strong>${m.name}</strong><small>${loading?.id===m.id?'Chargement…':m.pop.toLocaleString('fr-FR')+' civils'}${record?' · '+record.saved+' sauvés':''}</small>
        ${record?`<span class="stars">${stars(record.stars)}</span>`:''}</button>`;
    }).join('')}</div>`;
  if(page==='containment') body=`<div class="matrix">${sectors.map(m=>{
    const record=save.containment[m.id];
    return `<button class="mission-card ${m.metro?'atlas-card':''} ${m.theme}" data-action="mission" data-value="${m.id}">
      <small class="eyebrow">${m.zone}</small><strong>${m.name}</strong><small>${m.pop.toLocaleString('fr-FR')} civils${m.metro?' · Navettes et objectif d’évacuation':''}${record?` · Record ${record.saved} sauvés`:''}</small>${record?`<span class="stars">${stars(record.stars)}</span>`:''}
    </button>`;
  }).join('')}</div>`;
  if(page==='campaign') body=campaignMap()+`<div class="matrix">${missions.map(m=>card(m,'mission',m.id,!available(save,m.id),save.records[m.id]?.stars||0)).join('')}</div>`;
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
  const diffSelect=['atlas','containment','campaign','special','survival'].includes(page)?`<div class="options-row">${Object.entries(difficulty).map(([id,d])=>button(d.name,'difficulty','tab '+(id===save.opts.level?'active':''),id)).join('')}</div>`:'';
  dom.screen.innerHTML=`<section class="shell"><div class="content"><div class="heading"><div><div class="eyebrow">Poste de commandement</div><h1>${titles[page]}</h1><p>${captions[page]}</p></div>${diffSelect}</div>
    <nav class="tabs" aria-label="Modes de jeu">${routeTabs.map(([id,name])=>button(name,'nav','tab '+(id===page?'active':''),id)).join('')}</nav>${body}
  </div></section>`;
  if(page==='campaign') paintEstuary();
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
async function startAtlas(m) {
  if(!m||loading) return;
  const mission=withMutators(m,modifiers);
  if(m.mapId==='metz') return start(mission);
  loading=m;
  menu();
  try {
    let geography=atlasMaps.get(m.mapId);
    if(!geography) {
      const response=await fetch('./maps/'+m.mapId+'.json');
      if(!response.ok) throw Error('Carte indisponible.');
      geography=await response.json();
      atlasMaps.set(m.mapId,geography);
    }
    if(loading===m&&page==='atlas') start({...mission,geography});
  } catch {
    if(loading!==m||page!=='atlas') return;
    loading=null;
    menu();
    showModal('map-error','Carte indisponible',`<p>Ouvre cette ville une première fois avec une connexion Internet. Metz est disponible immédiatement.</p>
      <div class="dialog-actions">${button('Fermer','close','button primary')}</div>`);
  }
}
function osmHelp() {
  showModal('osm','Importer une ville',`<ol class="osm-steps">
    <li>Sur <a href="https://www.openstreetmap.org/export" target="_blank" rel="noopener">OpenStreetMap</a>, zoome sur un quartier d’environ 1 à 3 km de large.</li>
    <li>Dans <strong>Exporter</strong>, utilise au besoin la sélection manuelle de la zone, puis télécharge <em>map.osm</em>.</li>
    <li>Sélectionne le fichier téléchargé. Les exports OpenStreetMap XML et les réponses JSON avec nœuds et chemins sont acceptés.</li>
    </ol><div class="dialog-actions">${button('Choisir le fichier','osm-choose','button primary')}${button('Fermer','close')}</div>`);
}
async function importOSM(file) {
  try {
    if(file.size>40*1024*1024) throw Error('Le fichier dépasse 40 Mo. Exporte un quartier plus petit.');
    showModal('osm-loading','Lecture de la ville', '<p>Construction du réseau de rues depuis le fichier local…</p>');
    const raw=await file.text();
    if(modal!=='osm-loading') return;
    const geography=convertOSM([parseOSM(raw)]);
    const name=file.name.replace(/\.(osm|xml|json)$/i,'').trim().slice(0,38)||'Quartier importé';
    const pop=Math.min(2650,Math.max(420,Math.round(geography.anchors.length*.5)));
    start(withMutators({...atlas[0],id:'atlas-local',name,zone:'CARTE OPENSTREETMAP IMPORTÉE',geography,pop,
      count:Math.round(12+pop*.017),briefing:['Générale Varga','Reconnais les rues et trace un repli vers le refuge.']},modifiers));
  } catch(error) {
    showModal('osm-error','Import impossible',`<p>${escape(error.message)}</p><div class="dialog-actions">
      ${button('Réessayer','osm-help','button primary')}${button('Fermer','close')}</div>`);
  }
}
function start(m,brief=true) {
  if(!m) return;
  game=new Game(m,save.opts.level,save.skills.slice());
  selected='soldier';speed=save.opts.speed;acc=0;status='';result=null;
  if(m.atlas) freehand=true;
  tut=m.id===0&&!save.seen?1:0;
  tutSteps=0;
  go('mission');
  if(tut) opening();
  else if(brief) showModal('briefing',m.name,`<p class="eyebrow">${escape(m.briefing[0])}</p><p>« ${escape(m.briefing[1])} »</p>${m.atlas?
    `<p>Place tes défenses à l’arrêt. Garde des crédits pour les renforts, puis élimine tous les infectés.</p>${m.modifiers?.length?`<p>${m.modifiers.map(id=>mutators[id]).join(' · ')}</p>`:''}`
    :game.quota?`<p><strong>Objectif</strong> · Élimine la horde et évacue au moins ${game.quota} personnes. Les navettes partent des refuges toutes les 12 secondes. Zoome pour bien viser les rues.</p>`
    :m.containment?'<p>Les escouades peuvent changer de rue après le départ. Sélectionne « Ordres », une escouade, puis sa destination.</p>':m.rule?`<p>${escape(m.rule)}</p>`:''}<div class="dialog-actions">${button('Examiner la carte','close','button primary')}</div>`);
}
function opening() {
  showModal('briefing','La première sirène',`<p class="eyebrow">Générale Varga · Canal 01</p><p>« Foyer confirmé à l’est. Protégez les carrefours et conduisez les habitants au refuge. Nous commençons quand vous êtes prêt. »</p>
    <p><strong>Mission</strong> · Éliminez tous les infectés et sauvez le plus de civils possible.</p>
    <div class="dialog-actions">${button('Prendre le commandement','close','button primary')}${button('Passer le tutoriel','skip')}</div>`);
}
function begin() {
  if(!game.prepare()) return;
  if(gesture?.kind) {
    pointers.clear();
    gesture=null;
    view.placementPreview=null;
  }
  selected='';
  view.commandOrigin=-1;
  if(tut) {tut=4;save.seen=true;writeSave();}
  showHUD(true);
}
function kitMarkup(items,live,support) {
  const tools=Object.entries(items).map(([id,info],n)=>`<button class="tool" data-action="tool" data-value="${id}" title="${info.info}" aria-label="${info.name}"><span class="icon" aria-hidden="true">${info.icon}</span><span><span class="tool-label">${info.name}</span><span class="tool-price" id="price-${id}">${live&&support[id]?(n+1)+' · ':''}${game.cost(id)} cr</span></span></button>`);
  if(!game.mission.atlas) return tools.join('');
  const group=(label,list)=>`<div class="kit-group" role="group" aria-label="${label}"><h3>${label}</h3><div class="kit-slots">${list.join('')}</div></div>`;
  if(live) return group('Renforts',tools);
  const fieldwork=['safe','wall','gate'];
  const entries=Object.keys(items);
  return group('Déployer',tools.filter((_,n)=>!fieldwork.includes(entries[n])))
    +group('Fortifier',tools.filter((_,n)=>fieldwork.includes(entries[n])));
}
function showHUD(rebuild=false) {
  const live=game.combat;
  const support=game.support, tools=Object.keys(support);
  let items=live?(game.quota?{...support,safe:advancedShelter}:support):defenses;
  if(!live&&game.mission.atlas) {
    items={...atlasDefenses};
    for(const id of ['flame','watch']) if(canUse(id,game.skills)) items[id]=defenses[id];
  }
  if(rebuild) {
    dom.dock.innerHTML=`<div class="dock-head"><div><span class="eyebrow">${live?'Épidémie':'Préparation'}</span><h2>${escape(game.mission.name)}</h2></div><span class="clock" id="clock"></span></div>
      <div class="kit" aria-label="${live?'Renforts':'Défenses'}">${kitMarkup(items,live,support)}</div>
      ${game.mission.atlas?'<div class="field-label">'+(live?'Terrain':'Civils et tracés')+'</div>':''}
      <div class="tool-detail" id="detail"></div>
      <div class="tool-detail fort-status" id="fort-status" hidden>
        <div><strong id="fort-name"></strong><span id="fort-percent"></span></div>
        <progress id="fort-health" max="100" aria-label="Intégrité"></progress>
        <small id="fort-state"></small>
      </div>
      <div class="tools-extra" id="normal-tools"><button class="small" data-action="tool" data-value="guide" aria-label="Tracer un couloir">Couloir</button>
      <button id="erase-guide" class="small" data-action="erase" aria-label="Effacer le couloir" hidden>Effacer</button>
      ${game.mission.atlas?button('Zone d’attente','tool','small','waiting')+'<button id="release-waiting" class="small" data-action="release-waiting" hidden>Libérer l’attente</button>':''}
      <button id="shape" class="small" data-action="shape" aria-pressed="false" hidden>Main levée</button>
      ${live?button('Ordres','tool','small','command')+button('Fortifs','tool','small','inspect')+button('Détoner','tool','small','boom'):button('Retirer','tool','small','sell')+'<button id="fortify" class="small" data-action="fortify" hidden>Ceinturer</button>'}</div>
      <div class="tools-extra" id="fort-controls" hidden>
        <button id="gate-control" class="small" data-action="toggle-gate" hidden></button>
        <button id="repair" class="small" data-action="repair">Réparer</button>
        <button class="small" data-action="inspect-back">Retour</button>
      </div>
      <footer><div class="speed" aria-label="Vitesse">${speeds.map(v=>button(speedName(v),'speed','',v)).join('')}</div>${live?(game.quota?'<button id="confirm-rescue" class="button mint" data-action="confirm-rescue" hidden>Valider le bilan</button>':''):button('Prêt · lancer l’épidémie','ready','button primary')}</footer>`;
  }
  const metrics=[['cash','Crédits',game.money],['rescue','À l’abri',game.sheltered+'/'+game.mission.pop],['infect','Infectés',game.remaining],['','Victimes',game.lost]];
  if(game.quota) metrics[1]=['rescue','Évacués',game.evacuated+'/'+game.quota];
  if(game.mission.containment) metrics.splice(2,0,['street','En rue',game.civs.length]);
  if(rebuild) dom.metrics.innerHTML=metrics.map(([cls,name])=>{
    const value=`<strong></strong><small>${name}</small>`;
    return cls==='infect'&&game.mission.metro
      ?`<button class="metric infect metric-locate" data-action="locate" title="Centrer sur les infectés" aria-label="Centrer sur les infectés">${value}</button>`
      :`<div class="metric ${cls}">${value}</div>`;
  }).join('');
  for(const [i,[,,value]] of metrics.entries()) {
    const element=dom.metrics.children[i].firstElementChild;
    const label=String(value);
    if(element.textContent!==label) element.textContent=label;
  }
  if(game.mission.metro) dom.metrics.querySelector('.metric-locate').disabled=!game.remaining;
  $('clock').textContent=live?clock(game.time)+(game.mission.containment?'':' · V'+game.wave):'EN ATTENTE';
  dom.dock.classList.toggle('combat',live);
  if(view.activeZone&&game.units.get(view.activeZone.i)!==view.activeZone) view.activeZone=null;
  const zone=view.activeZone;
  const perimeter=!live&&zone?game.fortification(zone):null;
  const fortify=$('fortify');
  if(fortify) {
    fortify.hidden=!perimeter?.segments.length;
    fortify.disabled=!!perimeter&&perimeter.price>game.money;
    fortify.title=perimeter?.segments.length?`Suivre le contour · ${perimeter.price} cr`:'Entourer la zone de murs';
  }
  $('erase-guide').hidden=!game.guide.length;
  if($('release-waiting')) $('release-waiting').hidden=!game.waitingZones.length;
  const shape=$('shape');
  shape.hidden=selected!=='safe';
  shape.setAttribute('aria-pressed',String(freehand));
  shape.classList.toggle('active',freehand);
  view.showEntrances=selected==='gate';
  const preview=view.placementPreview;
  const perimeterInfo=!perimeter||!zone.edge.length?'':perimeter.segments.length?` Ceinturer coûte ${perimeter.price} cr.`
    :perimeter.gates?'':' Pose une porte pour laisser entrer les civils.';
  const shelterInfo=zone?`Zone sûre · ${zone.sheltered}/${zone.cap} à l’abri.${perimeterInfo}`
    :freehand?(game.usesRoof('safe')?'Touche un bâtiment pour en faire un refuge, ou trace le contour d’un quartier.':'Trace le contour avec le doigt ou la souris. Il se ferme quand tu relâches.')
      :'Glisse d’un coin à l’autre pour tracer un rectangle. Active Main levée pour dessiner le contour.';
  const drawHint={
    safe:shelterInfo,
    waiting:'Trace une zone bleue à main levée. Les civils proches y attendent si la rue est sûre. Libère la zone pour les laisser repartir.',
    wall:'Glisse pour tracer un mur continu. Utilise deux doigts ou Maj + glisser pour déplacer la carte.',
    gate:`Touche un point vert sur le mur pour poser une porte (${game.wallGatePrice()} cr). Les infectés doivent la briser.`
  };
  $('detail').textContent=(preview?preview.error||(
    preview.kind==='waiting'?`${preview.tiles.length} cases d’attente`:preview.kind==='safe'?`${preview.tiles.length} cases · ${preview.cap} places · ${preview.price} cr`
      :`${preview.segments.length} section(s) de mur · ${preview.price} cr`):null)||drawHint[selected]
    ||(!live&&game.usesRoof(selected)&&items[selected]?'Sélectionne un bâtiment accessible. '+items[selected].info:items[selected]?.info)||({
    guide:'Glissez sur les rues pour tracer un itinéraire vers la croix verte. Sur mobile, utilisez deux doigts pour déplacer la carte.',
    sell:'Touchez une défense pour la retirer et récupérer son coût.',
    boom:'Touchez une charge posée pour la déclencher.',
    command:view.commandOrigin<0?'Choisis une escouade au sol.':'Désigne une rue libre. L’escouade cesse le tir pendant son déplacement.',
    inspect:'Touche un mur, une porte ou une zone sûre pour voir son état.'
  }[selected])||(live?'Choisissez un renfort, puis sa cible sur la carte.':'Cliquez sur une rue pour placer la défense choisie.');
  for(const btn of dom.dock.querySelectorAll('[data-action="tool"]')) {
    const id=btn.dataset.value;
    btn.classList.toggle('active',selected===id);
    btn.setAttribute('aria-pressed',selected===id);
    if(!items[id]) continue;
    const cost=game.cost(id), cd=live?Math.max(0,Math.ceil((game.cd[id]||0)-game.time)):0;
    const locked=!canUse(id,game.skills);
    const noair=!!(live&&game.mission.noair&&items[id].air);
    const needed=id==='gate'?minimumGateCost():cost;
    btn.disabled=locked||noair||cd>0||needed>game.money;
    $('price-'+id).textContent=locked?'Compétence':noair?'Indisponible':cd>0?'⏱ '+cd+' s':needed<cost?`dès ${needed} cr`:(live&&support[id]?(tools.indexOf(id)+1)+' · ':'')+cost+' cr';
  }
  if($('confirm-rescue')) $('confirm-rescue').hidden=!game.canConfirm;
  showFortification();
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
  let brief='';
  if(live&&game.latestBreach) brief=`<strong>Brèche · ${structureNames[game.latestBreach.id]} détruit${['safe','gate','barricade'].includes(game.latestBreach.id)?'e':''}</strong>
    ${button('Voir la brèche','locate-breach','small breach-focus')}`;
  else if(live&&game.clearedAt!==null) brief=`<strong>Ville assainie</strong><p>${game.canConfirm?'Objectif atteint. Continue les évacuations ou valide le bilan.':'Ouvre des refuges et laisse les navettes atteindre le quota.'}</p>`;
  else brief=hint?`<strong>${hint[0]}</strong><p>${hint[1]}</p>`:status?`<strong>${escape(status)}</strong>`:!live&&!game.mission.atlas?`<strong>${escape(game.mission.zone)}</strong><p>${escape(game.mission.rule||(game.mission.metro?'Prévois plusieurs refuges et protège les accès.':game.mission.containment?'Interdiction de placer des défenses dans le périmètre orange.':'Protégez les accès aux refuges. Le temps est arrêté.'))}</p>`:'';
  if(dom.brief.innerHTML!==brief) dom.brief.innerHTML=brief;
}
function showFortification() {
  if(!game.hasStructure(view.inspected)||selected!=='inspect') view.inspected=null;
  const u=view.inspected;
  $('fort-status').hidden=!u;
  $('detail').hidden=!!u;
  $('normal-tools').hidden=!!u;
  $('fort-controls').hidden=!u;
  if(!u) return;
  const hp=Math.floor(u.hp/u.maxHp*100);
  $('fort-name').textContent=structureNames[u.id];
  $('fort-percent').textContent=hp+' %';
  $('fort-health').value=hp;
  $('fort-health').className=hp<35?'critical':hp<68?'warning':'';
  $('fort-state').textContent=u.id==='gate'?(u.closed?'Porte fermée':'Passage ouvert aux civils')
    :u.id==='safe'?`${u.sheltered}/${u.cap} personnes à l’abri`:hp<100?'Section endommagée':'Section intacte';
  const gate=$('gate-control');
  gate.hidden=u.id!=='gate';
  gate.textContent=u.closed?'Ouvrir la porte':'Fermer la porte';
  const repair=$('repair'), pending=game.repairs.get(u), quote=game.repairPlan(u);
  repair.disabled=!quote||quote.price>game.money;
  repair.textContent=pending?`Réparation · ${Math.ceil(pending.until-game.time)} s`:quote?`Réparer · ${quote.price} cr`:'Réparer';
  repair.title=quote?`Restaure ${Math.ceil(quote.gain)} points d’intégrité en 3 secondes.`:'Réparation';
}
function minimumGateCost() {
  let price=game.cost('gate');
  for(const wall of game.walls.sections.values()) if(wall.id==='wall'&&game.walls.openings(wall).length) price=Math.min(price,game.wallGatePrice());
  for(const u of game.units.values()) if(u.id==='wall'||u.id==='barricade') price=Math.min(price,game.gateCost(u.i));
  return price;
}
function projectionLabel() {
  const b=$('projection');
  b.textContent=view.tactical?'3D':'Plan';
  b.setAttribute('aria-label',view.tactical?'Vue en relief':'Vue tactique');
  dom.app.classList.toggle('tactical',view.tactical);
}
function choose(id) {
  const support=game.support;
  if(['guide','waiting','boom','sell','command','inspect'].includes(id)) selected=selected===id?'':id;
  else if(game.combat&&id==='safe'&&game.quota&&game.money>=game.cost(id)) selected=id;
  else if(game.combat
    ?support[id]&&canUse(id,game.skills)&&game.cost(id)<=game.money&&!(game.cd[id]>game.time)&&!(game.mission.noair&&support[id].air)
    :defenses[id]&&canUse(id,game.skills)&&(id==='gate'?minimumGateCost():game.cost(id))<=game.money) selected=id;
  if(selected!=='command') view.commandOrigin=-1;
  view.hoverWall=null;
  view.hoverRoof=null;
  showHUD();
}
function tapRoof(site) {
  const unit=game.roofOccupant(site);
  if(selected==='sell') {
    const target=unit||game.roofZone(site);
    if(!target) return false;
    if(game.sell(target.i)) showHUD();
    return true;
  }
  if(game.combat&&selected==='command') {
    if(unit&&game.canMove(unit.i)) mapAction(unit.i);
    else if(view.commandOrigin<0) notify('Choisis d’abord une escouade.');
    else if(site.access.some(i=>game.order(view.commandOrigin,i,site))) {
      view.commandOrigin=-1;
      notify('Escouade en mouvement vers le bâtiment.');
      showHUD();
    } else notify('Ce bâtiment est occupé ou inaccessible.');
    return true;
  }
  if(!game.combat&&game.usesRoof(selected)) {
    const shelter=selected==='safe'&&game.roofZone(site);
    if(shelter) view.activeZone=shelter;
    else {
      const access=game.roofAccess(selected,site);
      if(access===undefined) {
        notify(unit?'Ce bâtiment est déjà occupé.':'Choisis un bâtiment libre avec un accès à la rue.');
        return true;
      }
      game.place(selected,access,false,site);
      if(selected==='safe') view.activeZone=game.zoneAt(access);
      notify('Bâtiment réquisitionné.');
    }
    view.hoverRoof=null;
    showHUD();
    return true;
  }
  return false;
}
function tapMap(x,y) {
  const i=view.pick(x,y);
  const canPickRoof=game.usesRoof(selected)||['command','inspect','sell',''].includes(selected);
  const site=canPickRoof?view.roofAt(x,y):null;
  if(game.combat&&(selected==='inspect'||!selected)) {
    const structure=view.wallAt(game,x,y)||(site&&game.roofZone(site))||game.structureAt(i);
    if(structure) {
      selected='inspect';
      view.inspected=structure;
      showHUD();
      return;
    }
    if(selected==='inspect') return;
  }
  if(selected==='gate'||selected==='sell') {
    const wall=view.wallAt(game,x,y);
    if(wall) {
      if(selected==='sell') {
        if(game.sellWall(wall)) notify('Section de mur retirée.');
      } else if(wall.id==='gate') notify('Cette porte laisse passer les civils.');
      else if(!game.walls.openings(wall).length) notify('Pose la porte sur un point vert, là où une rue traverse le mur.');
      else if(game.gateWall(wall)) notify('Porte posée. Les civils peuvent la franchir.');
      else notify('Crédits insuffisants pour la porte.');
      view.hoverWall=null;
      showHUD();
      return;
    }
    if(selected==='gate'&&game.walls.sections.size&&!defenses[game.units.get(i)?.id]?.barrier) {
      notify('Touche un point vert sur le mur pour poser une porte.');
      return;
    }
  }
  if(site&&tapRoof(site)) return;
  mapAction(i,true);
}
function mapAction(i,append=false) {
  if(i<0||modal||page!=='mission') return;
  if(selected==='guide') {
    if(!open(game.map.cells,i)) return;
    game.setGuide([i],append);
    if(tut===2) tut=3;
  } else if(selected==='command') {
    if(game.canMove(i)) {
      view.commandOrigin=view.commandOrigin===i?-1:i;
    } else if(view.commandOrigin<0) {
      return notify('Choisis d’abord des soldats, un sniper ou un lance-flammes.');
    } else if(game.order(view.commandOrigin,i)) {
      view.commandOrigin=-1;
      notify('Escouade en mouvement.');
    } else return notify('Cette rue est inaccessible ou déjà occupée.');
  } else if(selected==='safe'&&game.zoneAt(i)) {
    view.activeZone=game.zoneAt(i);
  } else if(selected==='sell') {
    if(!game.sell(i)) return;
  } else if(selected==='boom') {
    if(!game.detonate(i)) return;
  } else if(!selected&&game.zoneAt(i)) {
    view.activeZone=game.zoneAt(i);
    notify(`Zone sûre · ${view.activeZone.sheltered}/${view.activeZone.cap} personnes`);
  } else if(game.combat&&!selected) {
    if(!game.detonate(i)) return;
  } else if(selected) {
    const ok=game.combat&&game.support[selected]?game.call(selected,i):game.place(selected,i);
    if(ok&&selected==='safe') view.activeZone=game.zoneAt(i);
    if(ok&&selected==='gate') notify('Porte posée. Les civils peuvent la franchir.');
    if(ok && tut===1 && ++tutSteps>=2) tut=2;
    if(!ok) {
      const u=game.units.get(i);
      if(u?.id==='safe') return notify(`Zone sûre · ${u.sheltered}/${u.cap} personnes · intégrité ${Math.round(u.hp/u.maxHp*100)} %`);
      return notify(game.usesRoof(selected)?'Choisis un bâtiment libre avec un accès à la rue.':'Choisissez une rue libre et vérifiez votre budget.');
    }
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
    <label class="setting">Foule à l’écran <select data-opt="crowd">${options([['auto','Automatique'],['full','Complète'],['low','Réduite']],opts.crowd)}</select></label>
    <label class="setting">Vitesse initiale <select data-opt="speed">${options(speeds.slice(1).map(v=>[v,speedName(v)]),opts.speed)}</select></label>
    <label class="setting">Difficulté <select data-opt="level">${options(Object.entries(difficulty).map(([k,v])=>[k,v.name]),opts.level)}</select></label>
    <div class="dialog-actions">${button('Exporter la sauvegarde','export')}${button('Importer','import')}${button('Fermer','close','button primary')}</div>`);
}
function showModal(kind,title,html) {
  modal=kind;
  dom.modal.hidden=false;
  dom.modal.innerHTML=`<section class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><div class="eyebrow">Dernière Sirène</div><h2 id="dialog-title">${escape(title)}</h2>${html}</section>`;
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
  const stats=[[game.quota?'Évacués':'Sauvés',result.saved+'/'+game.mission.pop],['Victimes',result.lost],['Infectés éliminés',result.kills],['Tirs alliés',result.friendly],['Score',result.score.toLocaleString('fr-FR')],[survival?'Vague':'Durée',survival?result.wave:clock(result.time)]];
  const epilogue=finale?`<p>« Les bateaux ont quitté l’estuaire. Imani a fermé l’installation. Pour la première fois depuis les Verriers, la radio ne demande plus de secours. » — Capitaine Sol</p><p>Bilan de campagne · ${Object.keys(save.records).length} villes sécurisées · ${total}/36 étoiles · ${Object.values(save.records).reduce((a,b)=>a+b.saved,0)} civils sauvés sur vos meilleurs résultats.</p>`:'';
  const next=won&&typeof game.mission.id==='number'&&game.mission.id<missions.length-1?button('Mission suivante','next','button primary'):'';
  showModal('result',title,`${won?`<p class="stars" aria-label="${result.stars} étoiles">${stars(result.stars)}</p>`:''}${epilogue}
    <div class="stats">${stats.map(([label,n])=>`<div><strong>${n}</strong>${label}</div>`).join('')}</div>
    <div class="dialog-actions">${next}${button('Rejouer','retry',game.mission.atlas?'button primary':'button')}${won&&game.mission.atlas?button('Compétences','nav','button','tree'):''}${button('Retour au commandement','quit')}</div>`);
}
function dispatch(action,value) {
  audio.wake();
  if(action==='home') go('title');
  if(action==='nav') go(value);
  if(action==='mission') start(missions.find(m=>String(m.id)===value&&available(save,m.id))||sectors.find(m=>m.id===value)||specials.find(m=>m.id===value)||(value===endless.id?endless:null));
  if(action==='atlas-city') startAtlas(atlas.find(m=>m.id===value));
  if(action==='osm-help') osmHelp();
  if(action==='osm-choose') $('osm-file').click();
  if(action==='mutator'&&Object.hasOwn(mutators,value)) {
    if(modifiers.has(value)) modifiers.delete(value);
    else modifiers.add(value);
    menu();
  }
  if(action==='settings') settings();
  if(action==='difficulty') {save.opts.level=value;writeSave();menu();}
  if(action==='learn'&&learn(save,value)) {writeSave();menu();notify('Compétence acquise.');}
  if(action==='tool') choose(value);
  if(action==='toggle-gate'&&game.toggleGate(view.inspected)) {
    notify(view.inspected.closed?'Porte fermée. Les civils cherchent un autre accès.':'Porte rouverte aux civils.');
    showHUD();
  }
  if(action==='repair'&&game.startRepair(view.inspected)) showHUD();
  if(action==='inspect-back') {view.inspected=null;showHUD();}
  if(action==='shape') {
    freehand=!freehand;
    notify(freehand?'Trace le contour à main levée. Relâche pour le fermer.':'Mode rectangle · glisse d’un coin à l’autre.');
    showHUD();
  }
  if(action==='fortify'&&game.surround(view.activeZone)) {
    choose('gate');
    notify('Contour fortifié. Pose une porte sur un point vert pour laisser entrer les civils.');
  }
  if(action==='erase') {game.setGuide([]);showHUD();}
  if(action==='release-waiting') {game.releaseWaiting();showHUD();}
  if(action==='ready') begin();
  if(action==='confirm-rescue'&&game.confirmRescue()) endMission();
  if(action==='pause') pause();
  if(action==='speed') {speed=Number(value);showHUD();}
  if(action==='zoom-in') view.zoomBy(.84);
  if(action==='zoom-out') view.zoomBy(1.19);
  if(action==='rotate') {view.angle+=Math.PI/4;view.cameraAt();}
  if(action==='resetcam') view.reset();
  if(action==='overview') view.overview();
  if(action==='projection') {view.switchProjection();projectionLabel();}
  if(action==='locate-breach'&&game.latestBreach) {
    const [x,z]=game.latestBreach.point;
    view.focus.set(x,0,z);
    view.zoomBy(view.zoom>26?26/view.zoom:1);
  }
  if(action==='locate'&&game.remaining) {
    const {cell,dist}=game.grid;
    const origin=cell(Math.round(view.focus.x),Math.round(view.focus.z));
    let target=game.zombies[0].i, range=-1;
    for(const z of game.zombies) {
      const d=dist(origin,z.i);
      if(d>range) {range=d;target=z.i;}
    }
    view.focusAt(target);
    if(view.zoom>47) view.zoomBy(47/view.zoom);
  }
  if(action==='close') closeModal();
  if(action==='skip') {tut=0;save.seen=true;writeSave();closeModal();showHUD();}
  if(action==='retry') start(game.mission,!game.mission.atlas);
  if(action==='next') start(missions[game.mission.id+1]);
  if(action==='quit') {
    const id=game.mission.id;
    go(typeof id==='number'?'campaign':game.mission.atlas?'atlas':game.mission.containment?'containment':id==='survival'?'survival':id.startsWith('local')?'editor':'special');
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
dom.dock.addEventListener('pointerup',e=>{
  const b=e.target.closest('#fortify');
  if(e.pointerType==='touch'&&b&&!b.disabled) dispatch('fortify');
});
dom.modal.addEventListener('change',e=>{
  const {opt}=e.target.dataset;
  if(!opt) return;
  save.opts[opt]=e.target.type==='checkbox'?e.target.checked:opt==='speed'?Number(e.target.value):e.target.value;
  if(opt==='quality') view.quality(save.opts.quality);
  if(opt==='crowd') view.crowd=save.opts.crowd;
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
    writeSave();view.quality(save.opts.quality);view.crowd=save.opts.crowd;go('campaign');
    notify('Sauvegarde importée.');
  } catch(e) {notify('Import impossible. '+e.message);}
  dom.file.value='';
});
$('osm-file').addEventListener('change',e=>{
  const file=e.target.files[0];
  e.target.value='';
  if(file) importOSM(file);
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
  if(game.combat&&/^[1-9]$/.test(e.key)) {
    const tools=Object.keys(game.support);
    const id=tools[Number(e.key)-1];
    if(id) choose(id);
  }
  if(e.code==='KeyC'&&game.combat||!game.mission.atlas&&e.key==='7'&&game.combat) choose('boom');
  if(e.code==='KeyG'||!game.mission.atlas&&e.key==='8') choose('guide');
  if(e.code==='KeyZ'&&game.mission.atlas) choose('waiting');
  if(!game.mission.atlas&&e.key==='9') {speed=speed?0:save.opts.speed;showHUD();}
  if(e.code==='KeyM'&&game.combat) choose('command');
  if(e.code==='KeyI'&&game.combat) choose('inspect');
  const dirs={ArrowLeft:[45,0],ArrowRight:[-45,0],ArrowUp:[0,45],ArrowDown:[0,-45]};
  if(dirs[e.key]) {e.preventDefault();view.pan(...dirs[e.key]);}
});

const canvas=dom.world;
const location=e=>({x:e.clientX,y:e.clientY});
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const centroid=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
function previewPlacement(x,y) {
  const {kind,path,first}=gesture;
  if(path) {
    const q=view.drawPoint(x,y),p=path.at(-1);
    if(!q||path.length>=512||Math.hypot(q[0]-p[0],q[1]-p[1])<.13) return;
    path.push(q);
    if(kind==='safe') view.placementPreview={kind,from:path,...game.planZone(path)};
    else if(kind==='waiting') view.placementPreview={kind,from:path,...game.planWaiting(path)};
    else {
      const plan=game.planWalls(path);
      const error=plan.price>game.money?`Budget insuffisant · ${plan.price} cr nécessaires.`:'';
      view.placementPreview={kind,from:path,...plan,error};
    }
  } else {
    const i=view.pick(x,y,false);
    if(i<0||i===gesture.last) return;
    gesture.last=i;
    view.placementPreview={kind,from:first,to:i,...game.planZone(first,i)};
  }
  view.highlight(-1,'',false);
  showHUD();
}
function finishPlacement() {
  const plan=view.placementPreview;
  view.placementPreview=null;
  if(!plan) return;
  if(plan.error) notify(plan.error);
  else if(plan.kind==='safe') {
    const zone=game.drawZone(plan.from,plan.to);
    if(zone) {
      view.activeZone=zone;
      notify(`Zone tracée · ${zone.cap} places`);
    } else notify('Le terrain a changé. Trace une nouvelle zone.');
  } else if(plan.kind==='waiting') {
    if(game.drawWaiting(plan.from)) notify('Zone d’attente tracée.');
  } else if(game.drawWalls(plan.from)) notify('Mur continu posé.');
  showHUD();
}
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('wheel',e=>{
  if(page!=='mission'||modal) return;
  e.preventDefault();view.zoomBy(Math.exp(Math.max(-110,Math.min(110,e.deltaY))*.0036));
},{passive:false});
canvas.addEventListener('pointerdown',e=>{
  if(page!=='mission'||modal) return;
  canvas.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId,location(e));
  if(pointers.size===1) {
    const left=e.button===0&&!e.shiftKey;
    const kind=left&&['safe','wall','waiting'].includes(selected)?selected:'';
    const first=kind?view.pick(e.clientX,e.clientY,false):-1;
    const p=first>=0&&(kind!=='safe'||freehand)?view.drawPoint(e.clientX,e.clientY):null;
    view.placementPreview=null;
    gesture={start:location(e),moved:false,rotate:e.button===2,pan:e.button===1||e.shiftKey,kind:first>=0?kind:'',
      first,last:first,path:p?[p]:null,drawing:left&&selected==='guide',painted:false};
  } else {
    gesture.moved=true;
    gesture.kind='';
    gesture.drawing=false;
    view.placementPreview=null;
    showHUD();
  }
});
canvas.addEventListener('pointermove',e=>{
  if(page!=='mission'||modal) return;
  const at=location(e), before=pointers.get(e.pointerId);
  const i=view.pick(at.x,at.y);
  if(e.pointerType==='mouse') {
    view.hoverWall=selected==='gate'||selected==='sell'||selected==='inspect'?view.wallAt(game,at.x,at.y):null;
    const site=!before&&!game.combat&&game.usesRoof(selected)?view.roofAt(at.x,at.y):null;
    view.hoverRoof=site?{site,id:selected,occupant:game.roofOccupant(site),allowed:game.roofAccess(selected,site)!==undefined}:null;
    view.highlight(view.hoverWall||site?-1:i,selected,game.legal(selected,i)||selected==='guide'||selected==='sell'||selected==='boom'
      ||selected==='command'&&(game.canMove(i)||view.commandOrigin>=0&&open(game.map.cells,i)&&!game.units.has(i)));
  }
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
      view.tilt=Math.max(.48,Math.min(game.mission.atlas?1.53:1.44,view.tilt+(at.y-before.y)*.004));
      view.cameraAt();
    } else if(gesture.kind) {
      previewPlacement(at.x,at.y);
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
  if(gesture&&e.type==='pointerup'&&!modal&&page==='mission') {
    if(gesture.kind&&gesture.moved) {
      audio.wake();
      previewPlacement(e.clientX,e.clientY);
      finishPlacement();
    } else if(!gesture.moved&&!gesture.rotate&&!gesture.pan) {
      audio.wake();
      tapMap(e.clientX,e.clientY);
    }
  }
  if(view.placementPreview) {view.placementPreview=null;if(page==='mission'&&!result)showHUD();}
  gesture=null;
}
canvas.addEventListener('pointerup',release);
canvas.addEventListener('pointercancel',release);
canvas.addEventListener('lostpointercapture',release);
canvas.addEventListener('pointerleave',()=>{if(view){view.hoverWall=null;view.hoverRoof=null;view.highlight(-1,'',false);}});
dom.radar.addEventListener('pointerdown',e=>{
  const r=dom.radar.getBoundingClientRect();
  const {w,h,cell}=game.grid;
  const i=cell(Math.min(w-1,Math.floor((e.clientX-r.left)/r.width*w)),Math.min(h-1,Math.floor((e.clientY-r.top)/r.height*h)));
  view.focusAt(i);
});
function mapOverlay() {
  const ctx=radarCtx, {w,h,point}=game.grid;
  const sx=ctx.canvas.width/w, sz=ctx.canvas.height/h;
  ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
  for(const [i,type] of game.map.cells.entries()) {
    const [x,z]=point(i);
    ctx.fillStyle=game.fog[i]>.42?(game.mission.atlas?'#a944e4':'#a7544c'):colors[type];
    ctx.fillRect(x*sx,z*sz,sx+.4,sz+.4);
  }
  for(const c of game.civs) {
    ctx.fillStyle='#8bd7ee';ctx.fillRect((c.x+.4)*sx,(c.z+.4)*sz,game.mission.metro?1:2,game.mission.metro?1:2);
  }
  for(const z of game.zombies) {
    ctx.fillStyle=game.mission.atlas?'#f0a5ff':'#ff9c72';ctx.fillRect((z.x+.4)*sx,(z.z+.4)*sz,2,2);
  }
  for(const u of game.units.values()) {
    const [x,z]=point(u.i);
    ctx.fillStyle=u.id==='safe'?'#91ffe3':'#adbdcc';
    ctx.fillRect((x+.4)*sx,(z+.4)*sz,3,3);
  }
  ctx.strokeStyle='#fff2c5';
  ctx.strokeRect(view.focus.x*sx-3,view.focus.z*sz-3,9,9);
  ctx.strokeStyle='#ff987a';
  for(const {point:[x,z]} of game.breaches) ctx.strokeRect((x+.4)*sx-2.5,(z+.4)*sz-2.5,5,5);
}
function pins() {
  const safe=[...game.units.values()].filter(u=>u.id==='safe');
  const pinData=safe.map(u=>[u.building?.point||game.location(u.i),`✚ ${u.sheltered}/${u.cap}`,view.activeZone===u?'chosen':'',u.building?view.roofHeight(u.building)+.1:.82]);
  if(game.clearedAt===null) pinData.push([game.location(game.map.start),game.phase==='prep'||game.mission.containment?'◬ FOYER':'◬ V'+game.wave,'hot']);
  if(game.map.breach!=null) pinData.push([game.location(game.map.breach),'◬ BRÈCHE','hot']);
  for(const breach of game.breaches) pinData.push([breach.point,'! RUPTURE','rupture']);
  const inspected=view.inspected;
  if(game.hasStructure(inspected)&&inspected.id!=='safe') {
    pinData.push([game.structurePosition(inspected),`${structureNames[inspected.id]} · ${Math.floor(inspected.hp/inspected.maxHp*100)} %`,'chosen']);
  }
  const wall=view.hoverWall;
  if(game.mission.atlas&&selected==='gate'&&wall?.id==='wall'&&game.walls.openings(wall).length) {
    pinData.push([game.structurePosition(wall),`Porte · ${game.wallGatePrice()} cr`,'gate-label']);
  }
  if(view.hoverRoof?.allowed||view.hoverRoof?.occupant) {
    const {site,id,occupant}=view.hoverRoof;
    const role=occupant?.id||id;
    const name=atlasDefenses[role]?.name||defenses[role].name;
    pinData.push([site.point,`${name} · ${occupant?'En place':game.cost(id)+' cr'}`,'roof-label',view.roofHeight(site)+.16]);
  }
  if(game.map.art) for(const [label,x,z] of game.map.art.labels) pinData.push([[x,z],label,'geo']);
  while(dom.pins.children.length<pinData.length) dom.pins.append(document.createElement('div'));
  while(dom.pins.children.length>pinData.length) dom.pins.lastChild.remove();
  pinData.forEach(([[x,z],text,cls,height],index)=>{
    const [sx,sy,on]=view.project(x,z,height??(cls==='gate-label'?view.planHeight()+.12:.82));
    const pin=dom.pins.children[index];
    pin.className='pin '+cls;
    if(pin.textContent!==text) pin.textContent=text;
    pin.style.left=sx+'px';pin.style.top=sy+'px';
    pin.hidden=!on||sx<4||sx>view.width-4||sy<5||sy>view.height||(cls==='geo'&&view.zoom<31);
  });
}
function loop(nowMs) {
  requestAnimationFrame(loop);
  const now=nowMs/1000, dt=Math.min(.12,Math.max(0,now-(rafLast||now)));
  rafLast=now;
  if(document.hidden) return;
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
      const alert=game.events.find(e=>e.type==='boss'||e.type==='collapse'||e.type==='breach');
      if(alert) {
        status={boss:'Contact lourd · L’Amiral entre en ville.',collapse:'Position perdue · Défense submergée.',breach:'Brèche · Une seconde horde entre en ville.'}[alert.type];
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
      view.render(game,now,game.mission.atlas?dt*speed:dt,false,!!modal||speed===0);
      pins();
    }
  } else if(page==='title'&&now-frameClock>.033) {
    frameClock=now;view.render(game,now,dt,true);audio.tick([],save.opts,false,!modal);
  }
}

if(locationIsSecure() && 'serviceWorker' in navigator) navigator.serviceWorker.register('./offline.js').catch(()=>{});
function locationIsSecure() { return window.location.protocol==='https:'||window.location.hostname==='localhost'||window.location.hostname==='127.0.0.1'; }
