(()=>{var Fe={road:0,block:1,water:2,park:3,bridge:4},Ze=25,ft=19,Lt={soldier:{name:"Soldats",icon:"\u265F",price:65,range:3.3,hit:17,delay:.48,info:"Tir polyvalent, efficace aux carrefours."},sniper:{name:"Sniper",icon:"\u2299",price:105,range:6.4,hit:66,delay:1.3,info:"Longue port\xE9e et priorit\xE9 aux cibles robustes."},turret:{name:"Tourelle",icon:"\u2316",price:125,range:3.5,hit:13,delay:.22,info:"Tir rapide et continu contre les hordes."},mortar:{name:"Mortier",icon:"\u25D4",price:155,range:6.4,hit:48,delay:2.6,blast:1.55,friendly:.22,info:"Obus de zone. \xC9loignez les civils."},flame:{name:"Lance-flammes",icon:"\u2668",price:115,range:2,hit:31,delay:.46,blast:.85,info:"Br\xFBle les groupes proches."},mines:{name:"Champ de mines",icon:"\u2059",price:55,range:.85,hit:72,delay:1.1,blast:1.25,charges:3,friendly:.35,info:"Trois charges automatiques au passage des infect\xE9s."},explosive:{name:"Explosifs",icon:"\u2737",price:45,range:0,hit:175,blast:2.1,charges:1,friendly:.65,info:"Touchez la charge pour la d\xE9clencher pendant l\u2019\xE9pid\xE9mie."},safe:{name:"Zone s\xFBre",icon:"\u271A",price:110,hp:210,cap:21,info:"Accueille 21 civils. Peut \xEAtre submerg\xE9e."},wall:{name:"Mur",icon:"\u25A4",price:45,hp:420,barrier:!0,info:"Bloque la rue et encaisse longtemps."},barricade:{name:"Barricade",icon:"\u2573",price:35,hp:235,barrier:!0,info:"Ferme rapidement un passage."},gate:{name:"Porte",icon:"\u25A5",price:70,hp:315,barrier:!0,passCivil:!0,info:"Bloque les infect\xE9s et laisse passer les civils."},watch:{name:"Tour de guet",icon:"\u2691",price:175,range:5,hit:29,delay:.56,hp:260,info:"Tir sur\xE9lev\xE9, longue port\xE9e et bonne r\xE9sistance."}},mi={para:{name:"Parachutistes",icon:"\u21E3",price:95,cd:15,info:"Deux escouades d\xE9ploy\xE9es au sol."},air:{name:"Frappe a\xE9rienne",icon:"\u27A4",price:145,cd:25,info:"Balaye la rue. D\xE9g\xE2ts civils possibles.",air:!0},missile:{name:"Missile",icon:"\u21AF",price:160,cd:31,info:"Impact concentr\xE9. D\xE9g\xE2ts civils possibles.",air:!0},gas:{name:"Gaz",icon:"\u25C9",price:80,cd:21,info:"Ralentit et use les infect\xE9s. \xC9vitez les civils."},heli:{name:"H\xE9licopt\xE8re",icon:"\u2723",price:180,cd:39,info:"Tire sur les infect\xE9s et extrait jusqu\u2019\xE0 huit civils.",air:!0},tank:{name:"Blind\xE9",icon:"\u25B0",price:240,cd:45,info:"Ancre la ligne pour 28 secondes."}},jn={slow:{name:"R\xF4deur",hp:38,speed:1.35,damage:26,color:15007625,size:1,value:6},fast:{name:"Coupe-file",hp:27,speed:2.6,damage:25,color:16765050,size:.85,value:7},brute:{name:"Colosse",hp:145,speed:.94,damage:59,color:15763637,size:1.42,value:14},bomb:{name:"Gonfl\xE9",hp:49,speed:1.6,damage:28,color:16752715,size:1.18,value:9},spit:{name:"Cracheur",hp:65,speed:1.22,damage:24,color:11772671,size:1.12,value:12},boss:{name:"L\u2019Amiral",hp:1420,speed:.7,damage:106,color:16735315,size:2.6,value:100}},ad=[["Rue des Verriers","city","dusk","CENTRE-VILLE",783,565,58,10,1],["Quai des Ormes","port","day","PORT DE COMMERCE",948,625,69,15,2],["Les Hauts-Jardins","suburb","day","BANLIEUE",488,650,80,21,2],["Le Val des \xC9cluses","rural","dusk","CAMPAGNE",832,685,90,24,3],["\xCEle aux Forges","island","day","\xCELE FLUVIALE",619,720,96,27,3],["Raffinerie Octant","industry","dusk","ZONE INDUSTRIELLE",127,760,106,31,3],["Belv\xE9d\xE8re Nord","city","night","VILLE NOCTURNE",562,780,115,35,4],["Bassin des Temp\xEAtes","port","night","CHANTIER NAVAL",611,810,125,39,4],["La Ceinture verte","rural","day","A\xC9RODROME RURAL",296,830,134,44,4],["Digue d\u2019Argile","industry","day","DIGUE INDUSTRIELLE",309,860,142,49,4],["Station Horizon","suburb","night","STATION DE RECHERCHE",417,910,155,53,5],["Dernier Feu","island","dusk","ESTUAIRE",985,990,168,60,6]],od=[["G\xE9n\xE9rale Varga","La premi\xE8re sir\xE8ne vient de sonner. Les habitants courent vers la place. Trouvez-leur un abri."],["Capitaine Sol","J\u2019ai vu des caisses frapp\xE9es du logo Horizon tomber d\u2019un cargo. Depuis, silence radio sur le quai."],["Dre Imani","Les premiers malades ont travers\xE9 le fleuve avant le couvre-feu. Prot\xE9gez chaque sortie du quartier."],["G\xE9n\xE9rale Varga","Ils remontent le courant vers les \xE9cluses. Les ponts offrent les seuls passages aux familles isol\xE9es."],["Capitaine Sol","Deux ponts pour une \xEEle enti\xE8re. Tenez-en un pour les civils, attirez la horde vers l\u2019autre."],["Dre Imani","J\u2019ai retrouv\xE9 le registre des caisses. La station Horizon \xE9tudiait un champignon marin cultiv\xE9 sur place."],["G\xE9n\xE9rale Varga","Le r\xE9seau \xE9lectrique vient de tomber. Nos observateurs tiennent jusqu\u2019\xE0 l\u2019aube."],["Capitaine Sol","Une silhouette \xE9norme a travers\xE9 le bassin. Les \xE9quipes du chantier l\u2019appellent l\u2019Amiral."],["Dre Imani","Les spores perdent leur activit\xE9 en air sec. Le hangar de l\u2019a\xE9rodrome peut servir de refuge."],["G\xE9n\xE9rale Varga","Encore une ville entre nous et Horizon. La derni\xE8re colonne de secours traverse la digue."],["Dre Imani","J\u2019ai trouv\xE9 la fuite. Le courant emporte encore des spores. L\u2019amplificateur de brume est dans l\u2019estuaire."],["Capitaine Sol","Les derniers bateaux attendent derri\xE8re la digue. Ouvrez un couloir. Imani et moi allons fermer la station."]],zt=ad.map(([n,e,t,i,s,r,a,o,c],l)=>({id:l,name:n,theme:e,light:t,zone:i,seed:s,budget:r,pop:a,count:o,waves:c,briefing:od[l],boss:l===7||l===11})),Ko=[{...zt[4],name:"Ponts de verre",id:"fragile",rule:"Ponts fragiles \xB7 les explosions peuvent les d\xE9truire.",fragile:!0,budget:785},{...zt[2],name:"Mar\xE9e humaine",id:"horde",rule:"Horde \xB7 effectifs infect\xE9s doubl\xE9s.",count:42,waves:4,budget:805},{...zt[5],name:"Solde z\xE9ro",id:"budget",rule:"Aust\xE9rit\xE9 \xB7 des cr\xE9dits de d\xE9part r\xE9duits.",budget:465},{...zt[6],name:"Ciel ferm\xE9",id:"noair",rule:"Nuit noire \xB7 les renforts a\xE9riens sont indisponibles.",noair:!0,budget:850}],Os={...zt[0],id:"survival",name:"Radio Silence",rule:"Survie \xB7 une vague toutes les 19 secondes.",budget:760,count:16,waves:1/0,pop:100,seed:7734},Qn=[{id:"canal",name:"Canal des Verreries",theme:"port",light:"day",zone:"DEUX RIVES \xB7 TROIS PONTS",seed:3485,budget:810,pop:410,count:13,cap:57,loadout:["marks","rotor"],briefing:["Capitaine Sol","Le premier foyer se trouve parmi les ateliers de la rive est. Gardez au moins un pont ouvert pour les familles et couvrez ses deux acc\xE8s."]},{id:"rail",name:"Les Faubourgs du Rail",theme:"suburb",light:"dusk",zone:"QUARTIERS DENSES \xB7 VIADUC",seed:4317,budget:1070,pop:610,count:21,cap:71,loadout:["marks","mining","rotor"],briefing:["G\xE9n\xE9rale Varga","Les rues autour de la gare sont pleines. Les passages sous le viaduc sont \xE9troits. Gardez une escouade mobile pour les carrefours de l\u2019ouest."]},{id:"delta",name:"Estuaire de l\u2019Orme",theme:"island",light:"night",zone:"DEUX CHENAUX \xB7 QUATRE PASSAGES",seed:9612,budget:1170,pop:820,count:28,cap:94,loadout:["marks","incend","rotor","guided"],briefing:["Dre Imani","Les quais se remplissent pendant la mar\xE9e haute. Il y a deux chenaux \xE0 traverser. Guidez les civils jusqu\u2019au premier refuge avant de vider l\u2019\xEEle."]}].map(n=>({...n,containment:!0,waves:0})),Un={easy:{name:"Facile",factor:.76,budget:1.2},normal:{name:"Normal",factor:1,budget:1},hard:{name:"Difficile",factor:1.23,budget:.88}},Hr=[{name:"Infanterie",icon:"\u265F",nodes:[["marks","Tireurs d\u2019\xE9lite","D\xE9bloque le sniper."],["incend","Barrage thermique","D\xE9bloque le lance-flammes."],["veteran","Premi\xE8re ligne","Les unit\xE9s commencent au grade 2."],["burst","Tirs group\xE9s","Les tirs font 25 % de d\xE9g\xE2ts en plus."]]},{name:"D\xE9fenses",icon:"\u25A4",nodes:[["towers","Postes sur\xE9lev\xE9s","D\xE9bloque la tour de guet."],["mining","Sapeurs","D\xE9bloque les mines."],["concrete","B\xE9ton renforc\xE9","Les structures gagnent 40 % de r\xE9sistance."],["artillery","Artillerie","D\xE9bloque le mortier."]]},{name:"Aviation",icon:"\u2723",nodes:[["rotor","Extraction","D\xE9bloque l\u2019h\xE9licopt\xE8re."],["guided","Guidage","D\xE9bloque le missile."],["dispatch","Alerte avanc\xE9e","Recharge des renforts r\xE9duite de 25 %."],["wing","Escadrille","Les renforts a\xE9riens co\xFBtent 30 % de moins."]]},{name:"Logistique",icon:"\u271A",nodes:[["bunks","Abris \xE9tendus","Huit places de plus dans chaque zone s\xFBre."],["reserve","R\xE9serve d\u2019urgence","110 cr\xE9dits de d\xE9part suppl\xE9mentaires."],["tank","Colonne blind\xE9e","D\xE9bloque le blind\xE9."],["train","Exercices d\u2019\xE9vacuation","Les civils courent 25 % plus vite."]]}],Nc={sniper:"marks",flame:"incend",watch:"towers",mines:"mining",mortar:"artillery",heli:"rotor",missile:"guided",tank:"tank"},dn=(n,e)=>!Nc[n]||e.includes(Nc[n]),Bs=[["first","Premier silence","Remporter une mission."],["rescue","\xC0 l\u2019abri","\xC9vacuer 20 civils en une mission."],["three","Op\xE9ration exemplaire","D\xE9crocher trois \xE9toiles."],["perfect","Pas un de moins","Sauver chaque civil."],["guide","Ligne de vie","Tracer un couloir de dix cases."],["boom","Boum","D\xE9clencher des explosifs."],["noharm","Tir disciplin\xE9","Gagner avec z\xE9ro perte alli\xE9e."],["skills","Formation acc\xE9l\xE9r\xE9e","Acheter une comp\xE9tence."],["veteran","Galons","Amener une unit\xE9 au grade 3."],["half","Le courant remonte","Finir six missions."],["boss","Brise-Amiral","Abattre un boss."],["story","Apr\xE8s la sir\xE8ne","Terminer la campagne."],["hard","Sous pression","Gagner en difficult\xE9 Difficile."],["air","Ciel ami","Appeler une frappe a\xE9rienne."],["heli","Cabine comble","\xC9vacuer quatre civils avec un h\xE9licopt\xE8re."],["special","Cas particulier","Remporter une op\xE9ration sp\xE9ciale."],["wave5","En sursis","Atteindre la vague 5 en survie."],["wave10","Radio toujours active","Atteindre la vague 10 en survie."],["builder","Urbaniste","Enregistrer une ville."],["local","Votre juridiction","Gagner sur une ville cr\xE9\xE9e."],["score","Contre-offensive","Abattre 150 infect\xE9s en une partie."],["bank","Fonds de crise","Finir avec 500 cr\xE9dits."],["stars","Constellation","Accumuler 30 \xE9toiles."],["fort","Ligne de d\xE9fense","Poser huit structures en une partie."]];function es(n){return()=>(n=Math.imul(1664525,n)+1013904223>>>0,n/4294967296)}var jt=(n,e)=>e*Ze+n,ot=n=>[n%Ze,Math.floor(n/Ze)],zs=(n,e)=>Math.abs(n%Ze-e%Ze)+Math.abs(Math.floor(n/Ze)-Math.floor(e/Ze)),at=(n,e)=>n[e]===Fe.road||n[e]===Fe.park||n[e]===Fe.bridge,fn=Array.from({length:Ze*ft},(n,e)=>{let[t,i]=ot(e);return[[t-1,i],[t+1,i],[t,i-1],[t,i+1]].filter(([s,r])=>s>=0&&r>=0&&s<Ze&&r<ft).map(([s,r])=>jt(s,r))});function Qt(n,e){let t=new Int16Array(Ze*ft).fill(3e4),i=new Int16Array(Ze*ft),s=0,r=0;for(let a of n)t[a]!==0&&(t[a]=0,i[r++]=a);for(;s<r;){let a=i[s++];for(let o of fn[a])t[o]===3e4&&e(o)&&(t[o]=t[a]+1,i[r++]=o)}return t}function Xr(n){if(n.layout)return{cells:n.layout.slice(),start:n.start,end:n.end,homes:Wr(n.layout,n.start),seed:n.seed};if(n.containment)return cd(n);let e=es(n.seed),t=new Array(Ze*ft).fill(Fe.block),i=["island","port","rural"].includes(n.theme),s=n.theme==="island"?[4,13]:[4,10,16];for(let l=0;l<ft;l++)for(let h=0;h<Ze;h++){let f=n.seed%2===0?0:1,u=l%3===1||h%3===1||h===22&&l%2===0,p=u?Fe.road:Fe.block;!u&&e()<({city:.18,port:.2,island:.24,rural:.72,suburb:.46,industry:.35}[n.theme]||.25)&&(p=Fe.park),i&&(h===10+f||h===11+f||n.theme==="island"&&h===12+f)&&(p=s.includes(l)?Fe.bridge:Fe.water),n.theme==="port"&&l>=17&&(h<7||h>17)&&(p=Fe.water),t[jt(h,l)]=p}let r=jt(22,n.seed%2===0?4:13),a=jt(2,10);t[r]=t[a]=Fe.road;let o=n.seed%2===0?16:1,c=typeof n.id=="number"&&n.id>=5?jt(n.id>=9?16:19,o):null;return{cells:t,start:r,end:a,breach:c,homes:Wr(t,r),seed:n.seed}}var ld={canal:{avenues:[1,5,8,12,15,20,23],streets:[2,5,9,13,17],crossing:[5,9,13],entry:[22,13],refuge:[2,5]},rail:{avenues:[2,6,10,14,19,23],streets:[1,4,8,12,16],crossing:[6,14,23],entry:[21,4],refuge:[2,16]},delta:{avenues:[1,4,8,12,16,21,23],streets:[2,6,10,14,17],crossing:[6,14],entry:[22,14],refuge:[2,6]}};function cd(n){let e=es(n.seed),{avenues:t,streets:i,crossing:s,entry:r,refuge:a}=ld[n.id],o=new Array(Ze*ft);for(let h=0;h<ft;h++)for(let f=0;f<Ze;f++){let u=t.includes(f)||i.includes(h),p=h===7&&f<9||h===11&&f>=16&&f<=21||f===18&&h>=4&&h<=8,_=Fe.block;if(u||p?_=Fe.road:e()<.17&&(_=Fe.park),n.id==="canal"){let M=h<9?10:11;(f===M||f===M+1)&&(_=s.includes(h)?Fe.bridge:Fe.water)}else n.id==="rail"&&(h===9||h===10)?_=s.includes(f)?Fe.road:Fe.block:n.id==="delta"&&[6,7,17,18].includes(f)&&(_=s.includes(h)?Fe.bridge:Fe.water);o[jt(f,h)]=_}let c=jt(...r),l=jt(...a);return{cells:o,start:c,end:l,homes:Wr(o,c),seed:n.seed}}function Wr(n,e){let t=Qt([e],i=>at(n,i));return n.flatMap((i,s)=>(i===Fe.road||i===Fe.park)&&t[s]>4&&t[s]<3e4?[s]:[])}function qr(n,e,t){return!Array.isArray(n)||n.length!==Ze*ft||n.some(s=>!Number.isInteger(s)||s<0||s>4)||![e,t].every(s=>Number.isInteger(s)&&at(n,s))||e===t?!1:Qt([e],s=>at(n,s))[t]<3e4&&Wr(n,e).length>=30}var Yr=(n,e,t)=>Math.max(e,Math.min(t,n)),pn=(n,e)=>Math.hypot(n.x-e.x,n.z-e.z),hd=new Set(["soldier","sniper","flame"]),ud=new Set(["soldier","sniper","turret","flame","para"]),ts=class{constructor(e,t="normal",i=[]){this.mission=e,this.level=t,this.difficulty=Un[t],this.skills=[...new Set([...i,...e.loadout||[]])],this.map=Xr(e),this.rng=es(e.seed+4321),this.phase="prep",this.money=Math.round(e.budget*this.difficulty.budget)+(this.has("reserve")?110:0),this.units=new Map,this.marches=[],this.reinf=[],this.guide=[],this.zombies=[],this.civs=[],this.fog=new Float32Array(Ze*ft),this.clouds=[],this.noises=[],this.events=[],this.cd={},this.time=0,this.wave=0,this.nextWave=e.id==="survival"?19:14,this.routeClock=0,this.alarm=0,this.kills=0,this.friendly=0,this.lost=0,this.evacuated=0,this.extractions=0,this.flags=new Set,this.bridgeDamage=new Set,this.place("safe",this.map.end,!0);let s=this.map.homes.slice(),r=Qt([this.map.start],l=>at(this.map.cells,l)),a=Qt([this.map.end],l=>at(this.map.cells,l));for(let l=s.length-1;l>0;l--){let h=Math.floor(this.rng()*(l+1));[s[l],s[h]]=[s[h],s[l]]}let o=s.filter(l=>r[l]>(e.id===0?13:8)&&a[l]<24),c=e.containment?s.filter(l=>r[l]<12):[];for(let l=0;l<e.pop;l++){let h=c.length&&l%5===0?c:l%4!==0&&o.length?o:s;this.civs.push(this.person(h[l%h.length],{speed:(1.15+this.rng()*.55)*(this.has("train")?1.25:1),wait:this.rng()*(e.containment?3.5:2)}))}this.spawnWave(!0)}has(e){return this.skills.includes(e)}person(e,t={}){let[i,s]=ot(e),r=(this.rng()-.5)*.59,a=(this.rng()-.5)*.59;return{i:e,target:e,x:i+r,z:s+a,ox:r,oz:a,angle:0,...t}}get sheltered(){let e=this.evacuated;for(let t of this.units.values())e+=t.sheltered;return e}get remaining(){return this.zombies.length}get combat(){return this.phase==="live"}legal(e,t){return!this.combat||!mi[e]?this.phase==="prep"&&Lt[e]&&at(this.map.cells,t)&&zs(this.map.start,t)>(this.mission.containment?2:0)&&!this.units.has(t)&&dn(e,this.skills)&&this.money>=this.cost(e):at(this.map.cells,t)&&!(this.mission.noair&&mi[e].air)&&dn(e,this.skills)&&this.money>=this.cost(e)&&!(this.cd[e]>this.time)}cost(e){let t=Lt[e]||mi[e];return Math.round(t.price*(mi[e]?.air&&this.has("wing")?.7:1))}place(e,t,i=!1){if(!i&&!this.legal(e,t))return!1;let s=Lt[e],r=(s.hp||115)*(this.has("concrete")&&s.hp?1.4:1),a=s.cap?(this.mission.cap||s.cap)+(this.has("bunks")?8:0):0,o={id:e,i:t,hp:r,maxHp:r,level:this.has("veteran")?2:1,xp:0,fireAt:0,sheltered:0,cap:a,charges:s.charges,fixed:i,angle:0};return this.units.set(t,o),i||(this.money-=this.cost(e),this.emit("build",t,e),this.units.size>=9&&this.flags.add("fort")),!0}sell(e){let t=this.units.get(e);return this.phase!=="prep"||!t||t.fixed?!1:(this.money+=this.cost(t.id),this.units.delete(e),!0)}canMove(e){return this.combat&&hd.has(this.units.get(e)?.id)}order(e,t){if(!this.canMove(e)||!at(this.map.cells,t)||this.units.has(t)||this.marches.some(l=>l.to===t))return!1;let s=Qt([t],l=>{let h=this.units.get(l);return at(this.map.cells,l)&&(!h||!Lt[h.id].barrier||Lt[h.id].passCivil)});if(s[e]>=3e4)return!1;let r=[e];for(let l=e;l!==t;)l=fn[l].find(h=>s[h]<s[l]),r.push(l);let a=this.units.get(e),[o,c]=ot(e);return this.units.delete(e),this.marches.push({u:a,to:t,route:r,next:1,x:o,z:c,i:e,target:r[1],ox:0,oz:0,angle:a.angle}),this.routeClock=0,!0}march(e){for(let t of this.marches){if(!at(this.map.cells,t.target)){t.done=!0,!this.units.has(t.i)&&at(this.map.cells,t.i)?(t.u.i=t.i,this.units.set(t.i,t.u)):this.emit("collapse",t.i,t.u.id),this.routeClock=0;continue}if(this.zombies.some(s=>s.hp>0&&Math.abs(s.x-t.x)<.45&&Math.abs(s.z-t.z)<.45)&&(t.u.hp-=e*68),t.u.hp<=0){t.done=!0,this.emit("collapse",t.i,t.u.id);continue}this.travel(t,e,2.55)||(t.i===t.to?(t.u.i=t.to,t.u.angle=t.angle,this.units.set(t.to,t.u),this.emit("build",t.to,t.u.id),t.done=!0,this.routeClock=0):t.target=t.route[++t.next])}this.marches.some(t=>t.done)&&(this.marches=this.marches.filter(t=>!t.done))}setGuide(e,t=!1){let i=t?this.guide.slice():[];for(let s of e)if(at(this.map.cells,s)&&i.at(-1)!==s){let r=i.at(-1);if(r!==void 0&&zs(r,s)>1){let a=Qt([s],c=>at(this.map.cells,c)),o=r;for(;a[o]>1&&a[o]<3e4;)o=fn[o].find(c=>a[c]<a[o]),i.push(o)}i.push(s)}this.guide=[...new Set(i)].slice(-100),this.guide.length>=10&&this.flags.add("guide"),this.routeClock=0}prepare(){return this.phase!=="prep"?!1:(this.phase="live",this.emit("siren",this.map.start),!0)}emit(e,t,i,s){this.events.push({type:e,i:t,id:i,from:s})}shout(e,t,i=3){this.noises.push({i:e,power:t,until:this.time+i})}spawn(e,t="slow"){let i=jn[t],s=this.difficulty.factor;this.zombies.push(this.person(e,{id:t,hp:i.hp*s,maxHp:i.hp*s,speed:i.speed*(.8+s*.2),attackAt:0})),this.fog[e]=1}spawnWave(e=!1){let{count:t,id:i,waves:s,boss:r}=this.mission,a=this.wave,o=typeof i=="number"?i:i==="survival"?this.wave+2:this.mission.containment?0:6,c=this.map.start,l=[c,...fn[c].filter(p=>at(this.map.cells,p))];if(this.mission.containment){let p=Qt([c],M=>at(this.map.cells,M)),_=this.map.cells.flatMap((M,m)=>p[m]>=2&&p[m]<=5?[m]:[]);for(let M=0;M<6&&_.length;M++)l.push(_.splice(Math.floor(this.rng()*_.length),1)[0])}let h=!e&&this.map.breach!=null&&a%2===1?this.map.breach:null,f=e?t:i==="survival"?10+a*5:Math.round(t*(.28+.055*a)),u=Math.round(f*this.difficulty.factor);for(let p=0;p<u;p++){let _=this.rng(),M="slow";_<Math.min(.5,.16+o*.022)&&(o>0||!e||this.mission.containment)&&(M="fast"),_>.76&&o>=2&&(M="brute"),_>.88&&o>=4&&(M="bomb"),_>.94&&o>=5&&(M="spit"),this.spawn(h!==null&&p%5<2?h:l[p%l.length],M)}(!e&&r&&a===Math.ceil(s*.62)||i==="survival"&&a>0&&a%5===0)&&(this.spawn(this.map.start,"boss"),this.emit("boss",this.map.start)),this.wave++,i==="survival"&&this.wave>=5&&this.flags.add("wave5"),i==="survival"&&this.wave>=10&&this.flags.add("wave10"),e||this.emit("wave",this.map.start,this.wave),h!==null&&this.emit("breach",h),this.routeClock=0}damage(e,t,i=null){if(!(e.hp<=0)&&(e.hp-=t,!(e.hp>0))){if(this.kills++,this.money+=jn[e.id].value,this.emit("down",e.i,e.id),this.kills>=150&&this.flags.add("score"),e.id==="boss"&&this.flags.add("boss"),i){i.xp++;let s=Math.max(this.has("veteran")?2:1,i.xp>=10?3:i.xp>=4?2:1);s>i.level&&this.emit("level",i.i,s),i.level=s,s===3&&this.flags.add("veteran")}e.id==="bomb"&&this.blast(e.i,38,1.19,.28,null,"infected")}}blast(e,t,i,s=0,r=null,a="blast"){let[o,c]=ot(e);for(let l of this.zombies)pn({x:o,z:c},l)<=i&&this.damage(l,t,r);if(s)for(let l of this.civs)!l.dead&&pn({x:o,z:c},l)<=i&&this.rng()<s&&(l.dead=!0,this.lost++,a!=="infected"&&this.friendly++);if(this.mission.fragile&&t>=90){for(let l=0;l<this.map.cells.length;l++)if(this.map.cells[l]===Fe.bridge&&zs(e,l)<=i){this.map.cells[l]=Fe.water,this.bridgeDamage.add(l);let h=this.units.get(l);h&&this.collapse(h)}this.routeClock=0}this.emit(a,e),this.shout(e,13,5)}collapse(e){this.units.delete(e.i);for(let t=0;t<e.sheltered;t++)this.spawn(e.i,t%5===0?"fast":"slow");this.lost+=e.sheltered,this.emit("collapse",e.i,e.id),this.routeClock=0}detonate(e){let t=this.units.get(e);return!this.combat||t?.id!=="explosive"?!1:(this.blast(e,Lt.explosive.hit,Lt.explosive.blast,Lt.explosive.friendly,t),this.units.delete(e),this.flags.add("boom"),!0)}call(e,t){return!this.combat||!this.legal(e,t)?!1:(this.money-=this.cost(e),this.cd[e]=this.time+mi[e].cd*(this.has("dispatch")?.75:1),this.emit("support",t,e),e==="air"&&this.flags.add("air"),this.reinf.push({id:e,i:t,t:this.time+{para:1.4,air:1.05,missile:1.55,gas:.65,heli:1.45,tank:.85}[e],until:this.time+(e==="heli"?12:28),saved:0,angle:0,level:1,xp:0,fireAt:0}),!0)}operateSupport(){for(let e of this.reinf){if(e.done||e.t>this.time)continue;let[t,i]=ot(e.i);if(e.id==="heli"||e.id==="tank"||e.id==="para"){if(this.time>=e.until){e.done=!0;continue}let s=this.target(e,e.id==="heli"?5.5:4.5);if(s&&e.fireAt<=this.time&&(e.fireAt=this.time+(e.id==="tank"?.85:.41),e.id==="tank"?this.blast(s.i,50,1.15,.12,e):this.damage(s,e.id==="heli"?37:26,e),this.emit("shot",s.i,e.id,e.i)),e.id==="heli"&&e.saved<8&&(!e.nextRescue||e.nextRescue<=this.time)){let r=this.civs.find(a=>!a.dead&&pn({x:t,z:i},a)<3.8);r&&(r.dead=!0,e.saved++,this.evacuated++,this.extractions++,e.nextRescue=this.time+.7,e.saved>=4&&this.flags.add("heli"))}continue}if(e.id==="missile"&&this.blast(e.i,315,2.25,.62),e.id==="air")for(let s of[-2,0,2])this.blast(jt(Yr(t+s,0,Ze-1),i),119,1.75,.43);e.id==="gas"&&(this.clouds.push({i:e.i,x:t,z:i,until:this.time+7}),this.emit("gas",e.i)),e.done=!0}this.reinf=this.reinf.filter(e=>!e.done)}target(e,t){let[i,s]=ot(e.i),r,a=-1/0;for(let o of this.zombies){if(o.hp<=0||Math.abs(i-o.x)>t||Math.abs(s-o.z)>t)continue;let c=pn({x:i,z:s},o);if(c>t)continue;let l=e.id==="sniper"?Math.min(o.hp,95)-c:-c;l>a&&(!this.mission.containment||!ud.has(e.id)||this.visible(i,s,o))&&(r=o,a=l)}return r}visible(e,t,i){let s=i.x-e,r=i.z-t,a=Math.ceil(Math.max(Math.abs(s),Math.abs(r))*3);for(let o=1;o<a;o++){let c=jt(Math.round(e+s*o/a),Math.round(t+r*o/a));if(this.map.cells[c]===Fe.block)return!1}return!0}shoot(e){let t=Lt[e.id];if(!t.range||e.fireAt>this.time)return;let i=this.target(e,t.range);if(!i)return;let[s,r]=ot(e.i);e.angle=Math.atan2(i.x-s,i.z-r),e.fireAt=this.time+t.delay*(1-(e.level-1)*.1);let a=t.hit*(1+(e.level-1)*.25)*(this.has("burst")?1.25:1);t.blast?this.blast(i.i,a,t.blast,t.friendly||0,e,e.id==="flame"?"flame":"blast"):(this.damage(i,a,e),this.emit("shot",i.i,e.id,e.i),this.shout(e.i,e.id==="sniper"?7:4,2)),e.charges&&--e.charges===0&&this.units.delete(e.i)}routes(){let e=a=>at(this.map.cells,a),t=a=>{let o=this.units.get(a);return e(a)&&(!o||!Lt[o.id].barrier||Lt[o.id].passCivil)};this.safeField=Qt([...this.units.values()].filter(a=>a.id==="safe"&&a.sheltered<a.cap).map(a=>a.i),t),this.guideRoute=new Set(this.guide),this.guideField=Qt(this.guide.filter(a=>this.safeField[a]<3e4),t);let i=this.zombies.filter(a=>a.hp>0);this.threat=Qt(i.map(a=>a.i),e);let s=this.civs.filter(a=>!a.dead).map(a=>a.i),r=[...s,...this.units.keys()];this.hunt=Qt(r.length?r:[this.map.end],e),this.mission.containment&&(this.crowd=Qt(s,e)),this.noises=this.noises.filter(a=>a.until>this.time).slice(-12),this.lure=this.noises.length?Qt(this.noises.map(a=>a.i),e):null,this.civilPass=t,this.civByCell=new Map;for(let a of this.civs)this.civByCell.has(a.i)||this.civByCell.set(a.i,[]),this.civByCell.get(a.i).push(a)}travel(e,t,i){let[s,r]=ot(e.target),a=s+e.ox-e.x,o=r+e.oz-e.z,c=Math.hypot(a,o);if(c<.025)return e.i=e.target,!1;let l=Math.min(c,i*t);return e.x+=a/c*l,e.z+=o/c*l,e.angle=Math.atan2(a,o),!0}moveCiv(e,t){if(e.dead||e.wait>this.time||this.travel(e,t,e.speed))return;let i=this.units.get(e.i);if(i?.id==="safe"&&i.sheltered<i.cap){i.sheltered++,this.money+=3,this.emit("rescue",e.i),e.dead=!0;return}let s=this.threat[e.i],r=this.guideRoute.has(e.i),a=e.i,o=-1/0;for(let c of fn[e.i])if(this.civilPass(c)){let l=Yr(this.safeField[e.i]-this.safeField[c],-2,2),h=Yr(this.threat[c]-s,-2,2)*(s<5?5:s<8?1.5:.35),f=Yr(this.guideField[e.i]-this.guideField[c],-2,2),u=l*(r?5:3)+h+(r?Number(this.guideRoute.has(c))*1.2:f*.9)+this.rng()*.7;u>o&&(a=c,o=u)}(o>0||s<4&&o>-1||this.rng()<.11)&&(e.target=a),e.wait=this.time+.09+this.rng()*.14}moveFoe(e,t){if(e.hp<=0||this.travel(e,t,e.speed*(e.gassed?.58:1)))return;let i=jn[e.id],s=[e.i,...fn[e.i]];if(e.attackAt<=this.time&&e.id==="spit"){let[u,p]=ot(e.i),_=this.civs.find(M=>!M.dead&&pn({x:u,z:p},M)<2.25);_&&(_.speed*=.64,e.attackAt=this.time+2.8,this.emit("spit",_.i,e.id,e.i))}for(let u of s)for(let p of this.civByCell.get(u)||[])if(!p.dead&&pn(e,p)<(this.mission.containment?.56:.43)&&e.attackAt<=this.time){p.dead=!0,this.lost++,this.spawn(p.i,this.rng()<.18?"fast":"slow"),this.emit("infect",p.i),e.attackAt=this.time+(this.mission.containment?.32:.55);return}let a=this.lure&&this.noises.some(u=>zs(u.i,e.i)<=u.power)&&this.lure[e.i]>0&&this.hunt[e.i]>2?this.lure:this.crowd?.[e.i]<7?this.crowd:this.hunt,o=e.i,c=1/0;for(let u of fn[e.i])if(at(this.map.cells,u)){let p=a[u]+this.rng()*.38;p<c&&(o=u,c=p)}let l=this.units.get(e.i),h=this.units.get(o),f=l||(h&&Lt[h.id].barrier?h:null);f?e.attackAt<=this.time&&(e.attackAt=this.time+.65,f.hp-=i.damage*this.difficulty.factor*.65,this.emit("hit",f.i),f.hp<=0&&this.collapse(f)):(c<a[e.i]+.4||this.rng()<.16)&&(e.target=o)}step(e){if(!this.combat)return;this.time+=e,this.wave<=this.mission.waves&&this.time>=this.nextWave&&(this.spawnWave(),this.nextWave+=this.mission.id==="survival"?19:15.5),this.routeClock-=e,this.routeClock<=0&&(this.routes(),this.routeClock=.27),this.operateSupport(),this.marches.length&&this.march(e);for(let r of this.units.values())this.shoot(r);this.clouds=this.clouds.filter(r=>r.until>this.time);for(let r of this.zombies)r.gassed=this.clouds.some(a=>pn(r,a)<2.5),r.gassed&&this.damage(r,22*e),r.hp>0&&this.moveFoe(r,e),r.hp>0&&(this.fog[r.i]=1);for(let r of this.civs)this.moveCiv(r,e),!r.dead&&this.clouds.some(a=>pn(r,a)<2.5)&&this.rng()<e*.25&&(r.dead=!0,this.lost++,this.friendly++);this.zombies=this.zombies.filter(r=>r.hp>0),this.civs=this.civs.filter(r=>!r.dead);for(let r=0;r<this.fog.length;r++)this.fog[r]>.015&&(this.fog[r]*=Math.pow(.77,e));let t=this.mission.id==="survival"&&this.zombies.length>0&&!this.units.size&&!this.marches.length&&!this.reinf.some(r=>["para","tank","heli"].includes(r.id)),i=this.mission.containment&&this.zombies.length>0&&!this.civs.length&&!this.units.size&&!this.marches.length&&!this.reinf.length&&!this.clouds.length&&!Object.keys(mi).some(r=>dn(r,this.skills)&&this.money>=this.cost(r));(!this.civs.length&&!this.sheltered||t||i)&&(this.phase="lost");let s=this.wave>this.mission.waves;this.combat&&s&&!this.zombies.length&&(this.evacuated+=this.civs.length,this.civs.length=0,this.phase="won")}result(){let e=this.sheltered/this.mission.pop,t=Math.max(0,Math.round(this.sheltered*100+this.kills*8-this.friendly*175)),i=e>=.88&&this.friendly<=2?3:e>=.6?2:1;return{saved:this.sheltered,lost:this.lost,kills:this.kills,friendly:this.friendly,score:t,time:Math.floor(this.time),wave:this.wave,stars:this.phase==="won"?i:0,money:this.money}}};var Uc="derniere-sirene-v1",dd=new Set(Bs.map(n=>n[0])),jo=()=>({v:1,records:{},containment:{},skills:[],badges:[],cities:[],survival:0,opts:{sound:!0,music:!0,quality:"medium",speed:1,level:"normal"},seen:!1}),$r=n=>Object.keys(n.records).length-n.skills.length,mn=(n,e)=>e===0||!!n.records[e-1];function Qo(n,e){return $r(n)<=0||n.skills.includes(e)||!Hr.some(t=>{let i=t.nodes.findIndex(s=>s[0]===e);return i===0||i>0&&n.skills.includes(t.nodes[i-1][0])})?!1:(n.skills.push(e),Di(n,"skills"),!0)}function Di(n,e){dd.has(e)&&!n.badges.includes(e)&&n.badges.push(e)}function Fc(n,e){let t=e.result(),i=e.mission.id;for(let s of e.flags)Di(n,s);if(i==="survival"&&(n.survival=Math.max(n.survival,t.wave)),e.phase!=="won")return t;for(let[s,r]of[["first",!0],["rescue",t.saved>=20],["three",t.stars===3],["perfect",t.saved===e.mission.pop],["noharm",!t.friendly],["hard",e.level==="hard"],["local",typeof i=="string"&&i.startsWith("local")],["special",typeof i=="string"&&!i.startsWith("local")&&i!=="survival"&&!e.mission.containment],["bank",t.money>=500]])r&&Di(n,s);if(e.mission.containment&&t.score>(n.containment[i]?.score??-1)&&(n.containment[i]={stars:t.stars,saved:t.saved,score:t.score}),typeof i=="number"){let s=n.records[i]||{stars:0,saved:0,score:0};n.records[i]={stars:Math.max(s.stars,t.stars),saved:Math.max(s.saved,t.saved),score:Math.max(s.score,t.score)},Object.keys(n.records).length>=6&&Di(n,"half"),i===zt.length-1&&Di(n,"story"),Object.values(n.records).reduce((r,a)=>r+a.stars,0)>=30&&Di(n,"stars")}return t}function el(n){let e=JSON.parse(n);if(e?.v!==1||!e.records||!Array.isArray(e.skills)||!Array.isArray(e.cities)||!Array.isArray(e.badges))throw Error("Format de sauvegarde inconnu.");let t=jo();for(let{id:s,pop:r}of zt){let a=e.records[s];if(!a||!mn(t,s)||!Number.isInteger(a.stars)||a.stars<1||a.stars>3||!Number.isInteger(a.saved)||a.saved>r||a.saved<0||!Number.isInteger(a.score)||a.score<0)break;t.records[s]={stars:a.stars,saved:a.saved,score:a.score}}for(let{id:s,pop:r}of Qn){let a=e.containment?.[s];a&&Number.isInteger(a.stars)&&a.stars>=1&&a.stars<=3&&Number.isInteger(a.saved)&&a.saved<=r&&a.saved>=0&&Number.isSafeInteger(a.score)&&a.score>=0&&(t.containment[s]={stars:a.stars,saved:a.saved,score:a.score})}for(let s of e.badges)typeof s=="string"&&Di(t,s);for(let s of e.skills)typeof s=="string"&&Qo(t,s);t.survival=Number.isSafeInteger(e.survival)&&e.survival>0?e.survival:0,t.seen=e.seen===!0;for(let{name:s,layout:r,start:a,end:o,seed:c}of e.cities.slice(0,20).filter(l=>l&&typeof l=="object"))typeof s=="string"&&s.trim()&&qr(r,a,o)&&Number.isSafeInteger(c)&&t.cities.push({name:s.trim().slice(0,38),layout:r,start:a,end:o,seed:c});let i=e.opts||{};return typeof i.sound=="boolean"&&(t.opts.sound=i.sound),typeof i.music=="boolean"&&(t.opts.music=i.music),["low","medium","high"].includes(i.quality)&&(t.opts.quality=i.quality),[.5,1,2,4].includes(i.speed)&&(t.opts.speed=i.speed),Object.hasOwn(Un,i.level)&&(t.opts.level=i.level),t}function Oc(){try{let n=localStorage.getItem(Uc);return n?el(n):jo()}catch{return jo()}}function Bc(n){try{return localStorage.setItem(Uc,JSON.stringify(n)),!0}catch{return!1}}var fh=0,Rl=1,ph=2;var Gn=1,mh=2,Es=3,Rn=0,Zt=1,ii=2,Vn=0,Cs=1,Il=2,Pl=3,Ll=4,gh=5;var Hn=100,_h=101,xh=102,vh=103,yh=104,Mh=200,Sh=201,bh=202,Th=203,Dl=204,Nl=205,wh=206,Ah=207,Eh=208,Ch=209,Rh=210,Ih=211,Ph=212,Lh=213,Dh=214,xa=0,va=1,ya=2,_s=3,Ma=4,Sa=5,ba=6,Ta=7,Ul=0,Nh=1,Uh=2,Gi=0,Fl=1,Ol=2,Bl=3,Sr=4,zl=5,kl=6,Gl=7;var Vl=300,Wn=301,Rs=302,$a=303,Za=304,wa=1e3,Ui=1001,Aa=1002,Nt=1003,Fh=1004;var br=1005;var $t=1006,Ja=1007;var sn=1008;var ni=1009,Hl=1010,Wl=1011,Is=1012,Ka=1013,Ai=1014,xi=1015,Ei=1016,ja=1017,Qa=1018,Xn=1020,Xl=35902,ql=35899,Yl=1021,$l=1022,Ci=1023,en=1026,rn=1027,eo=1028,to=1029,In=1030,io=1031;var no=1033,Tr=33776,wr=33777,Ar=33778,Er=33779,so=35840,ro=35841,ao=35842,oo=35843,lo=36196,co=37492,ho=37496,uo=37488,fo=37489,Cr=37490,po=37491,mo=37808,go=37809,_o=37810,xo=37811,vo=37812,yo=37813,Mo=37814,So=37815,bo=37816,To=37817,wo=37818,Ao=37819,Eo=37820,Co=37821,Ro=36492,Io=36494,Po=36495,Lo=36283,Do=36284,Rr=36285,No=36286;var Zs=2300,Ea=2301,ga=2302,Ml=2303,Sl=2400,bl=2401,Tl=2402;var Oh=3200;var Uo=0,Bh=1,an="",qt="srgb",Js="srgb-linear",Ks="linear",nt="srgb";var _a=7680;var zh=519,kh=512,Gh=513,Vh=514,Zl=515,Hh=516,Wh=517,Jl=518,Kl=519,Xh=35044;var jl="300 es",_i=2e3,xs=2001;function fd(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function pd(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}function js(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function qh(){let n=js("canvas");return n.style.display="block",n}var zc={},vs=null;function Ql(...n){let e="THREE."+n.shift();vs?vs("log",e,...n):console.log(e,...n)}function Yh(n){let e=n[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=n[1];t&&t.isStackTrace?n[0]+=" "+t.getLocation():n[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return n}function Ie(...n){n=Yh(n);let e="THREE."+n.shift();if(vs)vs("warn",e,...n);else{let t=n[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...n)}}function De(...n){n=Yh(n);let e="THREE."+n.shift();if(vs)vs("error",e,...n);else{let t=n[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...n)}}function qs(...n){let e=n.join(" ");e in zc||(zc[e]=!0,Ie(...n))}function $h(n,e,t){return new Promise(function(i,s){function r(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:i()}}setTimeout(r,t)})}var Zh={[xa]:xa,[ya]:ba,[Ma]:Ma,[_s]:Sa,[va]:va,[ba]:ya,[Ta]:Ta,[Sa]:_s},Oi=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){let i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){let i=this._listeners;if(i===void 0)return;let s=i[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let i=t[e.type];if(i!==void 0){e.target=this;let s=i.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}},Vt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],kc=1234567,Ys=Math.PI/180,ys=180/Math.PI;function Ps(){let n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Vt[n&255]+Vt[n>>8&255]+Vt[n>>16&255]+Vt[n>>24&255]+"-"+Vt[e&255]+Vt[e>>8&255]+"-"+Vt[e>>16&15|64]+Vt[e>>24&255]+"-"+Vt[t&63|128]+Vt[t>>8&255]+"-"+Vt[t>>16&255]+Vt[t>>24&255]+Vt[i&255]+Vt[i>>8&255]+Vt[i>>16&255]+Vt[i>>24&255]).toLowerCase()}function Ke(n,e,t){return Math.max(e,Math.min(t,n))}function ec(n,e){return(n%e+e)%e}function md(n,e,t,i,s){return i+(n-e)*(s-i)/(t-e)}function gd(n,e,t){return n!==e?(t-n)/(e-n):0}function $s(n,e,t){return(1-t)*n+t*e}function _d(n,e,t,i){return $s(n,e,1-Math.exp(-t*i))}function xd(n,e=1){return e-Math.abs(ec(n,e*2)-e)}function vd(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*(3-2*n))}function yd(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*n*(n*(n*6-15)+10))}function Md(n,e){return n+Math.floor(Math.random()*(e-n+1))}function Sd(n,e){return n+Math.random()*(e-n)}function bd(n){return n*(.5-Math.random())}function Td(n){n!==void 0&&(kc=n);let e=kc+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function wd(n){return n*Ys}function Ad(n){return n*ys}function Ed(n){return n>0&&Number.isInteger(n)&&2**Math.round(Math.log2(n))===n}function Cd(n){return Math.pow(2,Math.ceil(Math.log(n)/Math.LN2))}function tc(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function Rd(n,e,t,i,s){let r=Math.cos,a=Math.sin,o=r(t/2),c=a(t/2),l=r((e+i)/2),h=a((e+i)/2),f=r((e-i)/2),u=a((e-i)/2),p=r((i-e)/2),_=a((i-e)/2);switch(s){case"XYX":n.set(o*h,c*f,c*u,o*l);break;case"YZY":n.set(c*u,o*h,c*f,o*l);break;case"ZXZ":n.set(c*f,c*u,o*h,o*l);break;case"XZX":n.set(o*h,c*_,c*p,o*l);break;case"YXY":n.set(c*p,o*h,c*_,o*l);break;case"ZYZ":n.set(c*_,c*p,o*h,o*l);break;default:Ie("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function ic(n){switch(n.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function Jh(n,e){if(e.constructor===Float32Array)return n;let t=ic(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.max(n/t,-1)}function Kh(n,e){if(e.constructor===Float32Array)return n;let t=ic(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.round(n*t)}var qn={DEG2RAD:Ys,RAD2DEG:ys,generateUUID:Ps,clamp:Ke,euclideanModulo:ec,mapLinear:md,inverseLerp:gd,lerp:$s,damp:_d,pingpong:xd,smoothstep:vd,smootherstep:yd,randInt:Md,randFloat:Sd,randFloatSpread:bd,seededRandom:Td,degToRad:wd,radToDeg:Ad,isPowerOfTwo:Ed,ceilPowerOfTwo:Cd,floorPowerOfTwo:tc,setQuaternionFromProperEuler:Rd,normalize:Kh,denormalize:Jh},He=class{static{this.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,i=this.y,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6],this.y=s[1]*t+s[4]*i+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Ke(this.x,e.x,t.x),this.y=Ke(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Ke(this.x,e,t),this.y=Ke(this.y,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Ke(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(Ke(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let i=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*i-a*s+e.x,this.y=r*s+a*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Bi=class{constructor(e=0,t=0,i=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=s}static slerpFlat(e,t,i,s,r,a,o){let c=i[s+0],l=i[s+1],h=i[s+2],f=i[s+3],u=r[a+0],p=r[a+1],_=r[a+2],M=r[a+3];if(f!==M||c!==u||l!==p||h!==_){let m=c*u+l*p+h*_+f*M;m<0&&(u=-u,p=-p,_=-_,M=-M,m=-m);let g=1-o;if(m<.9995){let S=Math.acos(m),A=Math.sin(S);g=Math.sin(g*S)/A,o=Math.sin(o*S)/A,c=c*g+u*o,l=l*g+p*o,h=h*g+_*o,f=f*g+M*o}else{c=c*g+u*o,l=l*g+p*o,h=h*g+_*o,f=f*g+M*o;let S=1/Math.sqrt(c*c+l*l+h*h+f*f);c*=S,l*=S,h*=S,f*=S}}e[t]=c,e[t+1]=l,e[t+2]=h,e[t+3]=f}static multiplyQuaternionsFlat(e,t,i,s,r,a){let o=i[s],c=i[s+1],l=i[s+2],h=i[s+3],f=r[a],u=r[a+1],p=r[a+2],_=r[a+3];return e[t]=o*_+h*f+c*p-l*u,e[t+1]=c*_+h*u+l*f-o*p,e[t+2]=l*_+h*p+o*u-c*f,e[t+3]=h*_-o*f-c*u-l*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,s){return this._x=e,this._y=t,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let i=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,c=Math.sin,l=o(i/2),h=o(s/2),f=o(r/2),u=c(i/2),p=c(s/2),_=c(r/2);switch(a){case"XYZ":this._x=u*h*f+l*p*_,this._y=l*p*f-u*h*_,this._z=l*h*_+u*p*f,this._w=l*h*f-u*p*_;break;case"YXZ":this._x=u*h*f+l*p*_,this._y=l*p*f-u*h*_,this._z=l*h*_-u*p*f,this._w=l*h*f+u*p*_;break;case"ZXY":this._x=u*h*f-l*p*_,this._y=l*p*f+u*h*_,this._z=l*h*_+u*p*f,this._w=l*h*f-u*p*_;break;case"ZYX":this._x=u*h*f-l*p*_,this._y=l*p*f+u*h*_,this._z=l*h*_-u*p*f,this._w=l*h*f+u*p*_;break;case"YZX":this._x=u*h*f+l*p*_,this._y=l*p*f+u*h*_,this._z=l*h*_-u*p*f,this._w=l*h*f-u*p*_;break;case"XZY":this._x=u*h*f-l*p*_,this._y=l*p*f-u*h*_,this._z=l*h*_+u*p*f,this._w=l*h*f+u*p*_;break;default:Ie("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let i=t/2,s=Math.sin(i);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,i=t[0],s=t[4],r=t[8],a=t[1],o=t[5],c=t[9],l=t[2],h=t[6],f=t[10],u=i+o+f;if(u>0){let p=.5/Math.sqrt(u+1);this._w=.25/p,this._x=(h-c)*p,this._y=(r-l)*p,this._z=(a-s)*p}else if(i>o&&i>f){let p=2*Math.sqrt(1+i-o-f);this._w=(h-c)/p,this._x=.25*p,this._y=(s+a)/p,this._z=(r+l)/p}else if(o>f){let p=2*Math.sqrt(1+o-i-f);this._w=(r-l)/p,this._x=(s+a)/p,this._y=.25*p,this._z=(c+h)/p}else{let p=2*Math.sqrt(1+f-i-o);this._w=(a-s)/p,this._x=(r+l)/p,this._y=(c+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Ke(this.dot(e),-1,1)))}rotateTowards(e,t){let i=this.angleTo(e);if(i===0)return this;let s=Math.min(1,t/i);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let i=e._x,s=e._y,r=e._z,a=e._w,o=t._x,c=t._y,l=t._z,h=t._w;return this._x=i*h+a*o+s*l-r*c,this._y=s*h+a*c+r*o-i*l,this._z=r*h+a*l+i*c-s*o,this._w=a*h-i*o-s*c-r*l,this._onChangeCallback(),this}slerp(e,t){let i=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(i=-i,s=-s,r=-r,a=-a,o=-o);let c=1-t;if(o<.9995){let l=Math.acos(o),h=Math.sin(l);c=Math.sin(c*l)/h,t=Math.sin(t*l)/h,this._x=this._x*c+i*t,this._y=this._y*c+s*t,this._z=this._z*c+r*t,this._w=this._w*c+a*t,this._onChangeCallback()}else this._x=this._x*c+i*t,this._y=this._y*c+s*t,this._z=this._z*c+r*t,this._w=this._w*c+a*t,this.normalize();return this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},B=class{static{this.prototype.isVector3=!0}constructor(e=0,t=0,i=0){this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Gc.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Gc.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6]*s,this.y=r[1]*t+r[4]*i+r[7]*s,this.z=r[2]*t+r[5]*i+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,i=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*i+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*i+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*i+r[10]*s+r[14])*a,this}applyQuaternion(e){let t=this.x,i=this.y,s=this.z,r=e.x,a=e.y,o=e.z,c=e.w,l=2*(a*s-o*i),h=2*(o*t-r*s),f=2*(r*i-a*t);return this.x=t+c*l+a*f-o*h,this.y=i+c*h+o*l-r*f,this.z=s+c*f+r*h-a*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*i+r[8]*s,this.y=r[1]*t+r[5]*i+r[9]*s,this.z=r[2]*t+r[6]*i+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Ke(this.x,e.x,t.x),this.y=Ke(this.y,e.y,t.y),this.z=Ke(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Ke(this.x,e,t),this.y=Ke(this.y,e,t),this.z=Ke(this.z,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Ke(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let i=e.x,s=e.y,r=e.z,a=t.x,o=t.y,c=t.z;return this.x=s*c-r*o,this.y=r*a-i*c,this.z=i*o-s*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return tl.copy(this).projectOnVector(e),this.sub(tl)}reflect(e){return this.sub(tl.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(Ke(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y,s=this.z-e.z;return t*t+i*i+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){let s=Math.sin(t)*e;return this.x=s*Math.sin(i),this.y=Math.cos(t)*e,this.z=s*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},tl=new B,Gc=new Bi,Ne=class{static{this.prototype.isMatrix3=!0}constructor(e,t,i,s,r,a,o,c,l){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,a,o,c,l)}set(e,t,i,s,r,a,o,c,l){let h=this.elements;return h[0]=e,h[1]=s,h[2]=o,h[3]=t,h[4]=r,h[5]=c,h[6]=i,h[7]=a,h[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,s=t.elements,r=this.elements,a=i[0],o=i[3],c=i[6],l=i[1],h=i[4],f=i[7],u=i[2],p=i[5],_=i[8],M=s[0],m=s[3],g=s[6],S=s[1],A=s[4],b=s[7],E=s[2],T=s[5],d=s[8];return r[0]=a*M+o*S+c*E,r[3]=a*m+o*A+c*T,r[6]=a*g+o*b+c*d,r[1]=l*M+h*S+f*E,r[4]=l*m+h*A+f*T,r[7]=l*g+h*b+f*d,r[2]=u*M+p*S+_*E,r[5]=u*m+p*A+_*T,r[8]=u*g+p*b+_*d,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],h=e[8];return t*a*h-t*o*l-i*r*h+i*o*c+s*r*l-s*a*c}invert(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],h=e[8],f=h*a-o*l,u=o*c-h*r,p=l*r-a*c,_=t*f+i*u+s*p;if(_===0)return this.set(0,0,0,0,0,0,0,0,0);let M=1/_;return e[0]=f*M,e[1]=(s*l-h*i)*M,e[2]=(o*i-s*a)*M,e[3]=u*M,e[4]=(h*t-s*c)*M,e[5]=(s*r-o*t)*M,e[6]=p*M,e[7]=(i*c-l*t)*M,e[8]=(a*t-i*r)*M,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,s,r,a,o){let c=Math.cos(r),l=Math.sin(r);return this.set(i*c,i*l,-i*(c*a+l*o)+a+e,-s*l,s*c,-s*(-l*a+c*o)+o+t,0,0,1),this}scale(e,t){return qs("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(il.makeScale(e,t)),this}rotate(e){return qs("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(il.makeRotation(-e)),this}translate(e,t){return qs("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(il.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,i=e.elements;for(let s=0;s<9;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}},il=new Ne,Vc=new Ne().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Hc=new Ne().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Id(){let n={enabled:!0,workingColorSpace:Js,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===nt&&(s.r=Qi(s.r),s.g=Qi(s.g),s.b=Qi(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===nt&&(s.r=gs(s.r),s.g=gs(s.g),s.b=gs(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===an?Ks:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[a].fromXYZ).multiply(this.spaces[r].toXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[Js]:{primaries:e,whitePoint:i,transfer:Ks,toXYZ:Vc,fromXYZ:Hc,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:qt},outputColorSpaceConfig:{drawingBufferColorSpace:qt}},[qt]:{primaries:e,whitePoint:i,transfer:nt,toXYZ:Vc,fromXYZ:Hc,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:qt}}}),n}var Je=Id();function Qi(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function gs(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}var is,Ca=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{is===void 0&&(is=js("canvas")),is.width=e.width,is.height=e.height;let s=is.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),i=is}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=js("canvas");t.width=e.width,t.height=e.height;let i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);let s=i.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Qi(r[a]/255)*255;return i.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(Qi(t[i]/255)*255):t[i]=Qi(t[i]);return{data:t,width:e.width,height:e.height}}else return Ie("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Pd=0,Ms=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Pd++}),this.uuid=Ps(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width||0,t.height||0,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(nl(s[a].image)):r.push(nl(s[a]))}else r=nl(s);i.url=r}return t||(e.images[this.uuid]=i),i}};function nl(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?Ca.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(Ie("Texture: Unable to serialize Texture."),{})}var Ld=0,sl=new B,ei=class n extends Oi{constructor(e=n.DEFAULT_IMAGE,t=n.DEFAULT_MAPPING,i=Ui,s=Ui,r=$t,a=sn,o=Ci,c=ni,l=n.DEFAULT_ANISOTROPY,h=an){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Ld++}),this.uuid=Ps(),this.name="",this.source=new Ms(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=l,this.format=o,this.internalFormat=null,this.type=c,this.offset=new He(0,0),this.repeat=new He(1,1),this.center=new He(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ne,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(sl).x}get height(){return this.source.getSize(sl).y}get depth(){return this.source.getSize(sl).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.mipmapsAutoUpdate=e.mipmapsAutoUpdate,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isPMREMTexture=e.isPMREMTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let i=e[t];if(i===void 0){Ie(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Ie(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Vl)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case wa:e.x=e.x-Math.floor(e.x);break;case Ui:e.x=e.x<0?0:1;break;case Aa:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case wa:e.y=e.y-Math.floor(e.y);break;case Ui:e.y=e.y<0?0:1;break;case Aa:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};ei.DEFAULT_IMAGE=null;ei.DEFAULT_MAPPING=Vl;ei.DEFAULT_ANISOTROPY=1;var _t=class{static{this.prototype.isVector4=!0}constructor(e=0,t=0,i=0,s=1){this.x=e,this.y=t,this.z=i,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,s){return this.x=e,this.y=t,this.z=i,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,i=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*i+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*i+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*i+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*i+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,s,r,c=e.elements,l=c[0],h=c[4],f=c[8],u=c[1],p=c[5],_=c[9],M=c[2],m=c[6],g=c[10];if(Math.abs(h-u)<.01&&Math.abs(f-M)<.01&&Math.abs(_-m)<.01){if(Math.abs(h+u)<.1&&Math.abs(f+M)<.1&&Math.abs(_+m)<.1&&Math.abs(l+p+g-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let A=(l+1)/2,b=(p+1)/2,E=(g+1)/2,T=(h+u)/4,d=(f+M)/4,v=(_+m)/4;return A>b&&A>E?A<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(A),s=T/i,r=d/i):b>E?b<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(b),i=T/s,r=v/s):E<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(E),i=d/r,s=v/r),this.set(i,s,r,t),this}let S=Math.sqrt((m-_)*(m-_)+(f-M)*(f-M)+(u-h)*(u-h));return Math.abs(S)<.001&&(S=1),this.x=(m-_)/S,this.y=(f-M)/S,this.z=(u-h)/S,this.w=Math.acos((l+p+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Ke(this.x,e.x,t.x),this.y=Ke(this.y,e.y,t.y),this.z=Ke(this.z,e.z,t.z),this.w=Ke(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Ke(this.x,e,t),this.y=Ke(this.y,e,t),this.z=Ke(this.z,e,t),this.w=Ke(this.w,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Ke(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Ra=class extends Oi{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:$t,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new _t(0,0,e,t),this.scissorTest=!1,this.viewport=new _t(0,0,e,t),this.textures=[];let s=i.count;for(let r=0;r<s;r++)this.textures[r]=new ei({width:e,height:t,depth:i.depth}),this.textures[r].isRenderTargetTexture=!0,this.textures[r].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveColorBuffer=i.resolveColorBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.storeMultisampledColorBuffer=i.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=i.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=i.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:$t,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.mipmapsAutoUpdate!==void 0&&(t.mipmapsAutoUpdate=e.mipmapsAutoUpdate),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=i,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new Ms(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;else this.depthTexture=null;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},ci=class extends Ra{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}},Qs=class extends ei{constructor(e=null,t=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Nt,this.minFilter=Nt,this.wrapR=Ui,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var Ia=class extends ei{constructor(e=null,t=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Nt,this.minFilter=Nt,this.wrapR=Ui,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}};var lt=class n{static{this.prototype.isMatrix4=!0}constructor(e,t,i,s,r,a,o,c,l,h,f,u,p,_,M,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,a,o,c,l,h,f,u,p,_,M,m)}set(e,t,i,s,r,a,o,c,l,h,f,u,p,_,M,m){let g=this.elements;return g[0]=e,g[4]=t,g[8]=i,g[12]=s,g[1]=r,g[5]=a,g[9]=o,g[13]=c,g[2]=l,g[6]=h,g[10]=f,g[14]=u,g[3]=p,g[7]=_,g[11]=M,g[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new n().fromArray(this.elements)}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){let t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),i.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,i=e.elements,s=1/ns.setFromMatrixColumn(e,0).length(),r=1/ns.setFromMatrixColumn(e,1).length(),a=1/ns.setFromMatrixColumn(e,2).length();return t[0]=i[0]*s,t[1]=i[1]*s,t[2]=i[2]*s,t[3]=0,t[4]=i[4]*r,t[5]=i[5]*r,t[6]=i[6]*r,t[7]=0,t[8]=i[8]*a,t[9]=i[9]*a,t[10]=i[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,i=e.x,s=e.y,r=e.z,a=Math.cos(i),o=Math.sin(i),c=Math.cos(s),l=Math.sin(s),h=Math.cos(r),f=Math.sin(r);if(e.order==="XYZ"){let u=a*h,p=a*f,_=o*h,M=o*f;t[0]=c*h,t[4]=-c*f,t[8]=l,t[1]=p+_*l,t[5]=u-M*l,t[9]=-o*c,t[2]=M-u*l,t[6]=_+p*l,t[10]=a*c}else if(e.order==="YXZ"){let u=c*h,p=c*f,_=l*h,M=l*f;t[0]=u+M*o,t[4]=_*o-p,t[8]=a*l,t[1]=a*f,t[5]=a*h,t[9]=-o,t[2]=p*o-_,t[6]=M+u*o,t[10]=a*c}else if(e.order==="ZXY"){let u=c*h,p=c*f,_=l*h,M=l*f;t[0]=u-M*o,t[4]=-a*f,t[8]=_+p*o,t[1]=p+_*o,t[5]=a*h,t[9]=M-u*o,t[2]=-a*l,t[6]=o,t[10]=a*c}else if(e.order==="ZYX"){let u=a*h,p=a*f,_=o*h,M=o*f;t[0]=c*h,t[4]=_*l-p,t[8]=u*l+M,t[1]=c*f,t[5]=M*l+u,t[9]=p*l-_,t[2]=-l,t[6]=o*c,t[10]=a*c}else if(e.order==="YZX"){let u=a*c,p=a*l,_=o*c,M=o*l;t[0]=c*h,t[4]=M-u*f,t[8]=_*f+p,t[1]=f,t[5]=a*h,t[9]=-o*h,t[2]=-l*h,t[6]=p*f+_,t[10]=u-M*f}else if(e.order==="XZY"){let u=a*c,p=a*l,_=o*c,M=o*l;t[0]=c*h,t[4]=-f,t[8]=l*h,t[1]=u*f+M,t[5]=a*h,t[9]=p*f-_,t[2]=_*f-p,t[6]=o*h,t[10]=M*f+u}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Dd,e,Nd)}lookAt(e,t,i){let s=this.elements;return ai.subVectors(e,t),ai.lengthSq()===0&&(ai.z=1),ai.normalize(),gn.crossVectors(i,ai),gn.lengthSq()===0&&(Math.abs(i.z)===1?ai.x+=1e-4:ai.z+=1e-4,ai.normalize(),gn.crossVectors(i,ai)),gn.normalize(),Zr.crossVectors(ai,gn),s[0]=gn.x,s[4]=Zr.x,s[8]=ai.x,s[1]=gn.y,s[5]=Zr.y,s[9]=ai.y,s[2]=gn.z,s[6]=Zr.z,s[10]=ai.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,s=t.elements,r=this.elements,a=i[0],o=i[4],c=i[8],l=i[12],h=i[1],f=i[5],u=i[9],p=i[13],_=i[2],M=i[6],m=i[10],g=i[14],S=i[3],A=i[7],b=i[11],E=i[15],T=s[0],d=s[4],v=s[8],P=s[12],C=s[1],D=s[5],N=s[9],V=s[13],R=s[2],k=s[6],q=s[10],G=s[14],te=s[3],W=s[7],j=s[11],ee=s[15];return r[0]=a*T+o*C+c*R+l*te,r[4]=a*d+o*D+c*k+l*W,r[8]=a*v+o*N+c*q+l*j,r[12]=a*P+o*V+c*G+l*ee,r[1]=h*T+f*C+u*R+p*te,r[5]=h*d+f*D+u*k+p*W,r[9]=h*v+f*N+u*q+p*j,r[13]=h*P+f*V+u*G+p*ee,r[2]=_*T+M*C+m*R+g*te,r[6]=_*d+M*D+m*k+g*W,r[10]=_*v+M*N+m*q+g*j,r[14]=_*P+M*V+m*G+g*ee,r[3]=S*T+A*C+b*R+E*te,r[7]=S*d+A*D+b*k+E*W,r[11]=S*v+A*N+b*q+E*j,r[15]=S*P+A*V+b*G+E*ee,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[4],s=e[8],r=e[12],a=e[1],o=e[5],c=e[9],l=e[13],h=e[2],f=e[6],u=e[10],p=e[14],_=e[3],M=e[7],m=e[11],g=e[15],S=c*p-l*u,A=o*p-l*f,b=o*u-c*f,E=a*p-l*h,T=a*u-c*h,d=a*f-o*h;return t*(M*S-m*A+g*b)-i*(_*S-m*E+g*T)+s*(_*A-M*E+g*d)-r*(_*b-M*T+m*d)}determinantAffine(){let e=this.elements,t=e[0],i=e[4],s=e[8],r=e[1],a=e[5],o=e[9],c=e[2],l=e[6],h=e[10];return t*(a*h-o*l)-i*(r*h-o*c)+s*(r*l-a*c)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=i),this}invert(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],h=e[8],f=e[9],u=e[10],p=e[11],_=e[12],M=e[13],m=e[14],g=e[15],S=t*o-i*a,A=t*c-s*a,b=t*l-r*a,E=i*c-s*o,T=i*l-r*o,d=s*l-r*c,v=h*M-f*_,P=h*m-u*_,C=h*g-p*_,D=f*m-u*M,N=f*g-p*M,V=u*g-p*m,R=S*V-A*N+b*D+E*C-T*P+d*v;if(R===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let k=1/R;return e[0]=(o*V-c*N+l*D)*k,e[1]=(s*N-i*V-r*D)*k,e[2]=(M*d-m*T+g*E)*k,e[3]=(u*T-f*d-p*E)*k,e[4]=(c*C-a*V-l*P)*k,e[5]=(t*V-s*C+r*P)*k,e[6]=(m*b-_*d-g*A)*k,e[7]=(h*d-u*b+p*A)*k,e[8]=(a*N-o*C+l*v)*k,e[9]=(i*C-t*N-r*v)*k,e[10]=(_*T-M*b+g*S)*k,e[11]=(f*b-h*T-p*S)*k,e[12]=(o*P-a*D-c*v)*k,e[13]=(t*D-i*P+s*v)*k,e[14]=(M*A-_*E-m*S)*k,e[15]=(h*E-f*A+u*S)*k,this}scale(e){let t=this.elements,i=e.x,s=e.y,r=e.z;return t[0]*=i,t[4]*=s,t[8]*=r,t[1]*=i,t[5]*=s,t[9]*=r,t[2]*=i,t[6]*=s,t[10]*=r,t[3]*=i,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,s))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let i=Math.cos(t),s=Math.sin(t),r=1-i,a=e.x,o=e.y,c=e.z,l=r*a,h=r*o;return this.set(l*a+i,l*o-s*c,l*c+s*o,0,l*o+s*c,h*o+i,h*c-s*a,0,l*c-s*o,h*c+s*a,r*c*c+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,s,r,a){return this.set(1,i,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,i){let s=this.elements,r=t._x,a=t._y,o=t._z,c=t._w,l=r+r,h=a+a,f=o+o,u=r*l,p=r*h,_=r*f,M=a*h,m=a*f,g=o*f,S=c*l,A=c*h,b=c*f,E=i.x,T=i.y,d=i.z;return s[0]=(1-(M+g))*E,s[1]=(p+b)*E,s[2]=(_-A)*E,s[3]=0,s[4]=(p-b)*T,s[5]=(1-(u+g))*T,s[6]=(m+S)*T,s[7]=0,s[8]=(_+A)*d,s[9]=(m-S)*d,s[10]=(1-(u+M))*d,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,i){let s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];let r=this.determinantAffine();if(r===0)return i.set(1,1,1),t.identity(),this;let a=ns.set(s[0],s[1],s[2]).length(),o=ns.set(s[4],s[5],s[6]).length(),c=ns.set(s[8],s[9],s[10]).length();r<0&&(a=-a),Mi.copy(this);let l=1/a,h=1/o,f=1/c;return Mi.elements[0]*=l,Mi.elements[1]*=l,Mi.elements[2]*=l,Mi.elements[4]*=h,Mi.elements[5]*=h,Mi.elements[6]*=h,Mi.elements[8]*=f,Mi.elements[9]*=f,Mi.elements[10]*=f,t.setFromRotationMatrix(Mi),i.x=a,i.y=o,i.z=c,this}makePerspective(e,t,i,s,r,a,o=_i,c=!1){let l=this.elements,h=2*r/(t-e),f=2*r/(i-s),u=(t+e)/(t-e),p=(i+s)/(i-s),_,M;if(c)_=r/(a-r),M=a*r/(a-r);else if(o===_i)_=-(a+r)/(a-r),M=-2*a*r/(a-r);else if(o===xs)_=-a/(a-r),M=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=h,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=f,l[9]=p,l[13]=0,l[2]=0,l[6]=0,l[10]=_,l[14]=M,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,i,s,r,a,o=_i,c=!1){let l=this.elements,h=2/(t-e),f=2/(i-s),u=-(t+e)/(t-e),p=-(i+s)/(i-s),_,M;if(c)_=1/(a-r),M=a/(a-r);else if(o===_i)_=-2/(a-r),M=-(a+r)/(a-r);else if(o===xs)_=-1/(a-r),M=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=h,l[4]=0,l[8]=0,l[12]=u,l[1]=0,l[5]=f,l[9]=0,l[13]=p,l[2]=0,l[6]=0,l[10]=_,l[14]=M,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,i=e.elements;for(let s=0;s<16;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}},ns=new B,Mi=new lt,Dd=new B(0,0,0),Nd=new B(1,1,1),gn=new B,Zr=new B,ai=new B,Wc=new lt,Xc=new Bi,tn=class n{constructor(e=0,t=0,i=0,s=n.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,s=this._order){return this._x=e,this._y=t,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){let s=e.elements,r=s[0],a=s[4],o=s[8],c=s[1],l=s[5],h=s[9],f=s[2],u=s[6],p=s[10];switch(t){case"XYZ":this._y=Math.asin(Ke(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(u,l),this._z=0);break;case"YXZ":this._x=Math.asin(-Ke(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-f,r),this._z=0);break;case"ZXY":this._x=Math.asin(Ke(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-f,p),this._z=Math.atan2(-a,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-Ke(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(u,p),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-a,l));break;case"YZX":this._z=Math.asin(Ke(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-h,l),this._y=Math.atan2(-f,r)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-Ke(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(u,l),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,p),this._y=0);break;default:Ie("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return Wc.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Wc,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Xc.setFromEuler(this),this.setFromQuaternion(Xc,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};tn.DEFAULT_ORDER="XYZ";var Ss=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},Ud=0,qc=new B,ss=new Bi,$i=new lt,Jr=new B,ks=new B,Fd=new B,Od=new Bi,Yc=new B(1,0,0),$c=new B(0,1,0),Zc=new B(0,0,1),Jc={type:"added"},Bd={type:"removed"},rs={type:"childadded",child:null},rl={type:"childremoved",child:null},Ut=class n extends Oi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Ud++}),this.uuid=Ps(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=n.DEFAULT_UP.clone();let e=new B,t=new tn,i=new Bi,s=new B(1,1,1);function r(){i.setFromEuler(t,!1)}function a(){t.setFromQuaternion(i,void 0,!1)}t._onChange(r),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new lt},normalMatrix:{value:new Ne}}),this.matrix=new lt,this.matrixWorld=new lt,this.matrixAutoUpdate=n.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Ss,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return ss.setFromAxisAngle(e,t),this.quaternion.multiply(ss),this}rotateOnWorldAxis(e,t){return ss.setFromAxisAngle(e,t),this.quaternion.premultiply(ss),this}rotateX(e){return this.rotateOnAxis(Yc,e)}rotateY(e){return this.rotateOnAxis($c,e)}rotateZ(e){return this.rotateOnAxis(Zc,e)}translateOnAxis(e,t){return qc.copy(e).applyQuaternion(this.quaternion),this.position.add(qc.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Yc,e)}translateY(e){return this.translateOnAxis($c,e)}translateZ(e){return this.translateOnAxis(Zc,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4($i.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?Jr.copy(e):Jr.set(e,t,i);let s=this.parent;this.updateWorldMatrix(!0,!1),ks.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?$i.lookAt(ks,Jr,this.up):$i.lookAt(Jr,ks,this.up),this.quaternion.setFromRotationMatrix($i),s&&($i.extractRotation(s.matrixWorld),ss.setFromRotationMatrix($i),this.quaternion.premultiply(ss.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(De("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Jc),rs.child=e,this.dispatchEvent(rs),rs.child=null):De("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Bd),rl.child=e,this.dispatchEvent(rl),rl.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),$i.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),$i.multiply(e.parent.matrixWorld)),e.applyMatrix4($i),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Jc),rs.child=e,this.dispatchEvent(rs),rs.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,s=this.children.length;i<s;i++){let a=this.children[i].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ks,e,Fd),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ks,Od,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(e){e(this);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,i=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*i-r[8]*s,r[13]+=i-r[1]*t-r[5]*i-r[9]*s,r[14]+=s-r[2]*t-r[6]*i-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t,i=!1){let s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),t===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,i)}}toJSON(e){let t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let c=o.shapes;if(Array.isArray(c))for(let l=0,h=c.length;l<h;l++){let f=c[l];r(e.shapes,f)}else r(e.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let c=0,l=this.material.length;c<l;c++)o.push(r(e.materials,this.material[c]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let c=this.animations[o];s.animations.push(r(e.animations,c))}}if(t){let o=a(e.geometries),c=a(e.materials),l=a(e.textures),h=a(e.images),f=a(e.shapes),u=a(e.skeletons),p=a(e.animations),_=a(e.nodes);o.length>0&&(i.geometries=o),c.length>0&&(i.materials=c),l.length>0&&(i.textures=l),h.length>0&&(i.images=h),f.length>0&&(i.shapes=f),u.length>0&&(i.skeletons=u),p.length>0&&(i.animations=p),_.length>0&&(i.nodes=_)}return i.object=s,i;function a(o){let c=[];for(let l in o){let h=o[l];delete h.metadata,c.push(h)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){let s=e.children[i];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};Ut.DEFAULT_UP=new B(0,1,0);Ut.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ut.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Fi=class extends Ut{constructor(){super(),this.isGroup=!0,this.type="Group"}},zd={type:"move"},bs=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Fi,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Fi,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new B,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new B),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Fi,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new B,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new B,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let s=null,r=null,a=null,o=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){a=!0;for(let M of e.hand.values()){let m=t.getJointPose(M,i),g=this._getHandJoint(l,M);m!==null&&(g.matrix.fromArray(m.transform.matrix),g.matrix.decompose(g.position,g.quaternion,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=m.radius),g.visible=m!==null}let h=l.joints["index-finger-tip"],f=l.joints["thumb-tip"],u=h.position.distanceTo(f.position),p=.02,_=.005;l.inputState.pinching&&u>p+_?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&u<=p-_&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,i),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.quaternion,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1,c.eventsEnabled&&c.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(zd)))}return o!==null&&(o.visible=s!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let i=new Fi;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}},jh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},_n={h:0,s:0,l:0},Kr={h:0,s:0,l:0};function al(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}var ke=class{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=qt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Je.colorSpaceToWorking(this,t),this}setRGB(e,t,i,s=Je.workingColorSpace){return this.r=e,this.g=t,this.b=i,Je.colorSpaceToWorking(this,s),this}setHSL(e,t,i,s=Je.workingColorSpace){if(e=ec(e,1),t=Ke(t,0,1),i=Ke(i,0,1),t===0)this.r=this.g=this.b=i;else{let r=i<=.5?i*(1+t):i+t-i*t,a=2*i-r;this.r=al(a,r,e+1/3),this.g=al(a,r,e),this.b=al(a,r,e-1/3)}return Je.colorSpaceToWorking(this,s),this}setStyle(e,t=qt){function i(r){r!==void 0&&parseFloat(r)<1&&Ie("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(100,parseFloat(r[1]))/100,Math.min(100,parseFloat(r[2]))/100,Math.min(100,parseFloat(r[3]))/100,t);break;case"hsl":case"hsla":if(r=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Ie("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);Ie("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=qt){let i=jh[e.toLowerCase()];return i!==void 0?this.setHex(i,t):Ie("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Qi(e.r),this.g=Qi(e.g),this.b=Qi(e.b),this}copyLinearToSRGB(e){return this.r=gs(e.r),this.g=gs(e.g),this.b=gs(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=qt){return Je.workingToColorSpace(Ht.copy(this),e),Math.round(Ke(Ht.r*255,0,255))*65536+Math.round(Ke(Ht.g*255,0,255))*256+Math.round(Ke(Ht.b*255,0,255))}getHexString(e=qt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Je.workingColorSpace){Je.workingToColorSpace(Ht.copy(this),t);let i=Ht.r,s=Ht.g,r=Ht.b,a=Math.max(i,s,r),o=Math.min(i,s,r),c,l,h=(o+a)/2;if(o===a)c=0,l=0;else{let f=a-o;switch(l=h<=.5?f/(a+o):f/(2-a-o),a){case i:c=(s-r)/f+(s<r?6:0);break;case s:c=(r-i)/f+2;break;case r:c=(i-s)/f+4;break}c/=6}return e.h=c,e.s=l,e.l=h,e}getRGB(e,t=Je.workingColorSpace){return Je.workingToColorSpace(Ht.copy(this),t),e.r=Ht.r,e.g=Ht.g,e.b=Ht.b,e}getStyle(e=qt){Je.workingToColorSpace(Ht.copy(this),e);let t=Ht.r,i=Ht.g,s=Ht.b;return e!==qt?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(e,t,i){return this.getHSL(_n),this.setHSL(_n.h+e,_n.s+t,_n.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(_n),e.getHSL(Kr);let i=$s(_n.h,Kr.h,t),s=$s(_n.s,Kr.s,t),r=$s(_n.l,Kr.l,t);return this.setHSL(i,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,i=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*i+r[6]*s,this.g=r[1]*t+r[4]*i+r[7]*s,this.b=r[2]*t+r[5]*i+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Ht=new ke;ke.NAMES=jh;var er=class n{constructor(e,t=25e-5){this.isFogExp2=!0,this.name="",this.color=new ke(e),this.density=t}clone(){return new n(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}};var tr=class extends Ut{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new tn,this.environmentIntensity=1,this.environmentRotation=new tn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),this.background=e.background!==null?e.background.clone():null,this.environment=e.environment!==null?e.environment.clone():null,this.fog=e.fog!==null?e.fog.clone():null,this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),this.overrideMaterial=e.overrideMaterial!==null?e.overrideMaterial.clone():null,this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},Si=new B,Zi=new B,ol=new B,Ji=new B,as=new B,os=new B,Kc=new B,ll=new B,cl=new B,hl=new B,ul=new _t,dl=new _t,fl=new _t,Mn=class n{constructor(e=new B,t=new B,i=new B){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,s){s.subVectors(i,t),Si.subVectors(e,t),s.cross(Si);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,i,s,r){Si.subVectors(s,t),Zi.subVectors(i,t),ol.subVectors(e,t);let a=Si.dot(Si),o=Si.dot(Zi),c=Si.dot(ol),l=Zi.dot(Zi),h=Zi.dot(ol),f=a*l-o*o;if(f===0)return r.set(0,0,0),null;let u=1/f,p=(l*c-o*h)*u,_=(a*h-o*c)*u;return r.set(1-p-_,_,p)}static containsPoint(e,t,i,s){return this.getBarycoord(e,t,i,s,Ji)===null?!1:Ji.x>=0&&Ji.y>=0&&Ji.x+Ji.y<=1}static getInterpolation(e,t,i,s,r,a,o,c){return this.getBarycoord(e,t,i,s,Ji)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,Ji.x),c.addScaledVector(a,Ji.y),c.addScaledVector(o,Ji.z),c)}static getInterpolatedAttribute(e,t,i,s,r,a){return ul.setScalar(0),dl.setScalar(0),fl.setScalar(0),ul.fromBufferAttribute(e,t),dl.fromBufferAttribute(e,i),fl.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(ul,r.x),a.addScaledVector(dl,r.y),a.addScaledVector(fl,r.z),a}static isFrontFacing(e,t,i,s){return Si.subVectors(i,t),Zi.subVectors(e,t),Si.cross(Zi).dot(s)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,s){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,i,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Si.subVectors(this.c,this.b),Zi.subVectors(this.a,this.b),Si.cross(Zi).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return n.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return n.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,s,r){return n.getInterpolation(e,this.a,this.b,this.c,t,i,s,r)}containsPoint(e){return n.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return n.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let i=this.a,s=this.b,r=this.c,a,o;as.subVectors(s,i),os.subVectors(r,i),ll.subVectors(e,i);let c=as.dot(ll),l=os.dot(ll);if(c<=0&&l<=0)return t.copy(i);cl.subVectors(e,s);let h=as.dot(cl),f=os.dot(cl);if(h>=0&&f<=h)return t.copy(s);let u=c*f-h*l;if(u<=0&&c>=0&&h<=0&&c-h>0)return a=c/(c-h),t.copy(i).addScaledVector(as,a);hl.subVectors(e,r);let p=as.dot(hl),_=os.dot(hl);if(_>=0&&p<=_)return t.copy(r);let M=p*l-c*_;if(M<=0&&l>=0&&_<=0)return o=l/(l-_),t.copy(i).addScaledVector(os,o);let m=h*_-p*f;if(m<=0&&f-h>=0&&p-_>=0)return Kc.subVectors(r,s),o=(f-h)/(f-h+(p-_)),t.copy(s).addScaledVector(Kc,o);let g=1/(m+M+u);return a=M*g,o=u*g,t.copy(i).addScaledVector(as,a).addScaledVector(os,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},zi=class{constructor(e=new B(1/0,1/0,1/0),t=new B(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(bi.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(bi.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let i=bi.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let i=e.geometry;if(i!==void 0){let r=i.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0&&e.isBatchedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,bi):bi.fromBufferAttribute(r,a),bi.applyMatrix4(e.matrixWorld),this.expandByPoint(bi);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),jr.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),jr.copy(i.boundingBox)),jr.applyMatrix4(e.matrixWorld),this.union(jr)}let s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,bi),bi.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Gs),Qr.subVectors(this.max,Gs),ls.subVectors(e.a,Gs),cs.subVectors(e.b,Gs),hs.subVectors(e.c,Gs),xn.subVectors(cs,ls),vn.subVectors(hs,cs),Fn.subVectors(ls,hs);let t=[0,-xn.z,xn.y,0,-vn.z,vn.y,0,-Fn.z,Fn.y,xn.z,0,-xn.x,vn.z,0,-vn.x,Fn.z,0,-Fn.x,-xn.y,xn.x,0,-vn.y,vn.x,0,-Fn.y,Fn.x,0];return!pl(t,ls,cs,hs,Qr)||(t=[1,0,0,0,1,0,0,0,1],!pl(t,ls,cs,hs,Qr))?!1:(ea.crossVectors(xn,vn),t=[ea.x,ea.y,ea.z],pl(t,ls,cs,hs,Qr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,bi).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(bi).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Ki[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Ki[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Ki[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Ki[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Ki[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Ki[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Ki[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Ki[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Ki),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Ki=[new B,new B,new B,new B,new B,new B,new B,new B],bi=new B,jr=new zi,ls=new B,cs=new B,hs=new B,xn=new B,vn=new B,Fn=new B,Gs=new B,Qr=new B,ea=new B,On=new B;function pl(n,e,t,i,s){for(let r=0,a=n.length-3;r<=a;r+=3){On.fromArray(n,r);let o=s.x*Math.abs(On.x)+s.y*Math.abs(On.y)+s.z*Math.abs(On.z),c=e.dot(On),l=t.dot(On),h=i.dot(On);if(Math.max(-Math.max(c,l,h),Math.min(c,l,h))>o)return!1}return!0}var bt=new B,ta=new He,kd=0,Ti=class extends Oi{constructor(e,t,i=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:kd++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=Xh,this.updateRanges=[],this.gpuType=xi,this.version=0,this._normalizationScale=e!==void 0?ic(e):void 0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this._normalizationScale=e._normalizationScale,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[i+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)ta.fromBufferAttribute(this,t),ta.applyMatrix3(e),this.setXY(t,ta.x,ta.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)bt.fromBufferAttribute(this,t),bt.applyMatrix3(e),this.setXYZ(t,bt.x,bt.y,bt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)bt.fromBufferAttribute(this,t),bt.applyMatrix4(e),this.setXYZ(t,bt.x,bt.y,bt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)bt.fromBufferAttribute(this,t),bt.applyNormalMatrix(e),this.setXYZ(t,bt.x,bt.y,bt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)bt.fromBufferAttribute(this,t),bt.transformDirection(e),this.setXYZ(t,bt.x,bt.y,bt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=this._denormalize(i)),i}setComponent(e,t,i){return this.normalized&&(i=this._normalize(i)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=this._denormalize(t)),t}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=this._denormalize(t)),t}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=this._denormalize(t)),t}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=this._denormalize(t)),t}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),i=this._normalize(i)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,s){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),i=this._normalize(i),s=this._normalize(s)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),i=this._normalize(i),s=this._normalize(s),r=this._normalize(r)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(e){let t=this._normalizationScale;return t!==void 0?Math.max(e/t,-1):Jh(e,this.array)}_normalize(e){let t=this._normalizationScale;return t!==void 0?Math.round(e*t):Kh(e,this.array)}};var ir=class extends Ti{constructor(e,t,i){super(new Uint16Array(e),t,i)}};var nr=class extends Ti{constructor(e,t,i){super(new Uint32Array(e),t,i)}};var yt=class extends Ti{constructor(e,t,i){super(new Float32Array(e),t,i)}},Gd=new zi,Vs=new B,ml=new B,Sn=class{constructor(e=new B,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let i=this.center;t!==void 0?i.copy(t):Gd.setFromPoints(e).getCenter(i);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Vs.subVectors(e,this.center);let t=Vs.lengthSq();if(t>this.radius*this.radius){let i=Math.sqrt(t),s=(i-this.radius)*.5;this.center.addScaledVector(Vs,s/i),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(ml.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Vs.copy(e.center).add(ml)),this.expandByPoint(Vs.copy(e.center).sub(ml))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Vd=0,gi=new lt,gl=new Ut,us=new B,oi=new zi,Hs=new zi,Dt=new B,wi=class n extends Oi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Vd++}),this.uuid=Ps(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(fd(e)?nr:ir)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let r=new Ne().getNormalMatrix(e);i.applyNormalMatrix(r),i.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return gi.makeRotationFromQuaternion(e),this.applyMatrix4(gi),this}rotateX(e){return gi.makeRotationX(e),this.applyMatrix4(gi),this}rotateY(e){return gi.makeRotationY(e),this.applyMatrix4(gi),this}rotateZ(e){return gi.makeRotationZ(e),this.applyMatrix4(gi),this}translate(e,t,i){return gi.makeTranslation(e,t,i),this.applyMatrix4(gi),this}scale(e,t,i){return gi.makeScale(e,t,i),this.applyMatrix4(gi),this}lookAt(e){return gl.lookAt(e),gl.updateMatrix(),this.applyMatrix4(gl.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(us).negate(),this.translate(us.x,us.y,us.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let i=[];for(let s=0,r=e.length;s<r;s++){let a=e[s];i.push(a.x,a.y,a.z||0)}this.setAttribute("position",new yt(i,3))}else{let i=Math.min(e.length,t.count);for(let s=0;s<i;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Ie("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new zi);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){De("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new B(-1/0,-1/0,-1/0),new B(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,s=t.length;i<s;i++){let r=t[i];oi.setFromBufferAttribute(r),this.morphTargetsRelative?(Dt.addVectors(this.boundingBox.min,oi.min),this.boundingBox.expandByPoint(Dt),Dt.addVectors(this.boundingBox.max,oi.max),this.boundingBox.expandByPoint(Dt)):(this.boundingBox.expandByPoint(oi.min),this.boundingBox.expandByPoint(oi.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&De('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Sn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){De("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new B,1/0);return}if(e){let i=this.boundingSphere.center;if(oi.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){let o=t[r];Hs.setFromBufferAttribute(o),this.morphTargetsRelative?(Dt.addVectors(oi.min,Hs.min),oi.expandByPoint(Dt),Dt.addVectors(oi.max,Hs.max),oi.expandByPoint(Dt)):(oi.expandByPoint(Hs.min),oi.expandByPoint(Hs.max))}oi.getCenter(i);let s=0;for(let r=0,a=e.count;r<a;r++)Dt.fromBufferAttribute(e,r),s=Math.max(s,i.distanceToSquared(Dt));if(t)for(let r=0,a=t.length;r<a;r++){let o=t[r],c=this.morphTargetsRelative;for(let l=0,h=o.count;l<h;l++)Dt.fromBufferAttribute(o,l),c&&(us.fromBufferAttribute(e,l),Dt.add(us)),s=Math.max(s,i.distanceToSquared(Dt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&De('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){De("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=t.position,s=t.normal,r=t.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==i.count)&&(a=new Ti(new Float32Array(4*i.count),4),this.setAttribute("tangent",a));let o=[],c=[],l=new Uint8Array(i.count);for(let P=0;P<i.count;P++)o[P]=new B,c[P]=new B;let h=new B,f=new B,u=new B,p=new He,_=new He,M=new He,m=new B,g=new B;function S(P,C,D){l[P]=l[C]=l[D]=1,h.fromBufferAttribute(i,P),f.fromBufferAttribute(i,C),u.fromBufferAttribute(i,D),p.fromBufferAttribute(r,P),_.fromBufferAttribute(r,C),M.fromBufferAttribute(r,D),f.sub(h),u.sub(h),_.sub(p),M.sub(p);let N=1/(_.x*M.y-M.x*_.y);isFinite(N)&&(m.copy(f).multiplyScalar(M.y).addScaledVector(u,-_.y).multiplyScalar(N),g.copy(u).multiplyScalar(_.x).addScaledVector(f,-M.x).multiplyScalar(N),o[P].add(m),o[C].add(m),o[D].add(m),c[P].add(g),c[C].add(g),c[D].add(g))}let A=this.groups;A.length===0&&(A=[{start:0,count:e.count}]);for(let P=0,C=A.length;P<C;++P){let D=A[P],N=D.start,V=D.count;for(let R=N,k=N+V;R<k;R+=3)S(e.getX(R+0),e.getX(R+1),e.getX(R+2))}let b=new B,E=new B,T=new B,d=new B;function v(P){T.fromBufferAttribute(s,P),d.copy(T);let C=o[P];b.copy(C),b.sub(T.multiplyScalar(T.dot(C))).normalize(),E.crossVectors(d,C);let N=E.dot(c[P])<0?-1:1;a.setXYZW(P,b.x,b.y,b.z,N)}for(let P=0,C=i.count;P<C;++P)l[P]&&v(P);this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==t.count)i=new Ti(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let u=0,p=i.count;u<p;u++)i.setXYZ(u,0,0,0);let s=new B,r=new B,a=new B,o=new B,c=new B,l=new B,h=new B,f=new B;if(e)for(let u=0,p=e.count;u<p;u+=3){let _=e.getX(u+0),M=e.getX(u+1),m=e.getX(u+2);s.fromBufferAttribute(t,_),r.fromBufferAttribute(t,M),a.fromBufferAttribute(t,m),h.subVectors(a,r),f.subVectors(s,r),h.cross(f),o.fromBufferAttribute(i,_),c.fromBufferAttribute(i,M),l.fromBufferAttribute(i,m),o.add(h),c.add(h),l.add(h),i.setXYZ(_,o.x,o.y,o.z),i.setXYZ(M,c.x,c.y,c.z),i.setXYZ(m,l.x,l.y,l.z)}else for(let u=0,p=t.count;u<p;u+=3)s.fromBufferAttribute(t,u+0),r.fromBufferAttribute(t,u+1),a.fromBufferAttribute(t,u+2),h.subVectors(a,r),f.subVectors(s,r),h.cross(f),i.setXYZ(u+0,h.x,h.y,h.z),i.setXYZ(u+1,h.x,h.y,h.z),i.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)Dt.fromBufferAttribute(e,t),Dt.normalize(),e.setXYZ(t,Dt.x,Dt.y,Dt.z)}toNonIndexed(){function e(o,c){let l=o.array,h=o.itemSize,f=o.normalized,u=new l.constructor(c.length*h),p=0,_=0;for(let M=0,m=c.length;M<m;M++){o.isInterleavedBufferAttribute?p=c[M]*o.data.stride+o.offset:p=c[M]*h;for(let g=0;g<h;g++)u[_++]=l[p++]}return new Ti(u,h,f)}if(this.index===null)return Ie("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new n,i=this.index.array,s=this.attributes;for(let o in s){let c=s[o],l=e(c,i);t.setAttribute(o,l)}let r=this.morphAttributes;for(let o in r){let c=[],l=r[o];for(let h=0,f=l.length;h<f;h++){let u=l[h],p=e(u,i);c.push(p)}t.morphAttributes[o]=c}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,c=a.length;o<c;o++){let l=a[o];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let c=this.parameters;for(let l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let i=this.attributes;for(let c in i){let l=i[c];e.data.attributes[c]=l.toJSON(e.data)}let s={},r=!1;for(let c in this.morphAttributes){let l=this.morphAttributes[c],h=[];for(let f=0,u=l.length;f<u;f++){let p=l[f];h.push(p.toJSON(e.data))}h.length>0&&(s[c]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let i=e.index;i!==null&&this.setIndex(i.clone());let s=e.attributes;for(let l in s){let h=s[l];this.setAttribute(l,h.clone(t))}let r=e.morphAttributes;for(let l in r){let h=[],f=r[l];for(let u=0,p=f.length;u<p;u++)h.push(f[u].clone(t));this.morphAttributes[l]=h}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let l=0,h=a.length;l<h;l++){let f=a[l];this.addGroup(f.start,f.count,f.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var _l=new B,Hd=new B,Wd=new Ne,li=class{constructor(e=new B(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,s){return this.normal.set(e,t,i),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){let s=_l.subVectors(i,t).cross(Hd.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,i=!0){let s=e.delta(_l),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/r;return i===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(s,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let i=t||Wd.getNormalMatrix(e),s=this.coplanarPoint(_l).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},Xd=0,bn=class extends Oi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Xd++}),this.uuid=Ps(),this.name="",this.type="Material",this.blending=Cs,this.side=Rn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Dl,this.blendDst=Nl,this.blendEquation=Hn,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new ke(0,0,0),this.blendAlpha=0,this.depthFunc=_s,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=zh,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=_a,this.stencilZFail=_a,this.stencilZPass=_a,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let i=e[t];if(i===void 0){Ie(`Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Ie(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector2&&i&&i.isVector2||s&&s.isEuler&&i&&i.isEuler||s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,i.blending=this.blending,i.side=this.side,i.shadowSide=this.shadowSide,i.vertexColors=this.vertexColors,i.opacity=this.opacity,i.transparent=this.transparent,i.blendSrc=this.blendSrc,i.blendDst=this.blendDst,i.blendEquation=this.blendEquation,i.blendSrcAlpha=this.blendSrcAlpha,i.blendDstAlpha=this.blendDstAlpha,i.blendEquationAlpha=this.blendEquationAlpha,i.blendColor=this.blendColor.getHex(),i.blendAlpha=this.blendAlpha,i.depthFunc=this.depthFunc,i.depthTest=this.depthTest,i.depthWrite=this.depthWrite,i.colorWrite=this.colorWrite,i.clipIntersection=this.clipIntersection,i.clipShadows=this.clipShadows,i.stencilWriteMask=this.stencilWriteMask,i.stencilFunc=this.stencilFunc,i.stencilRef=this.stencilRef,i.stencilFuncMask=this.stencilFuncMask,i.stencilFail=this.stencilFail,i.stencilZFail=this.stencilZFail,i.stencilZPass=this.stencilZPass,i.stencilWrite=this.stencilWrite,i.polygonOffset=this.polygonOffset,i.polygonOffsetFactor=this.polygonOffsetFactor,i.polygonOffsetUnits=this.polygonOffsetUnits,i.dithering=this.dithering,i.alphaTest=this.alphaTest,i.alphaHash=this.alphaHash,i.alphaToCoverage=this.alphaToCoverage,i.premultipliedAlpha=this.premultipliedAlpha,i.forceSinglePass=this.forceSinglePass,i.allowOverride=this.allowOverride,i.visible=this.visible,i.toneMapped=this.toneMapped,i.name=this.name,this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(i.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(i.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(e).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(i.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(i.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(i.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(i.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(i.rotation=this.rotation),this.depthPacking!==void 0&&(i.depthPacking=this.depthPacking),this.linewidth!==void 0&&(i.linewidth=this.linewidth),this.linecap!==void 0&&(i.linecap=this.linecap),this.linejoin!==void 0&&(i.linejoin=this.linejoin),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.wireframe!==void 0&&(i.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(i.flatShading=this.flatShading),this.fog!==void 0&&(i.fog=this.fog),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){let a=[];for(let o in r){let c=r[o];delete c.metadata,a.push(c)}return a}if(t){let r=s(e.textures),a=s(e.images);r.length>0&&(i.textures=r),a.length>0&&(i.images=a)}return i}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new ke().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.diffuseRoughness!==void 0&&(this.diffuseRoughness=e.diffuseRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum),e.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1]),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(i=>new li().fromJSON(i))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let i=e.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new He().fromArray(i)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new He().fromArray(e.clearcoatNormalScale)),e.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=t[e.diffuseRoughnessMap]||null),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,i=null;if(t!==null){let s=t.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=t[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}};var ji=new B,xl=new B,ia=new B,na=new B,sr=class{constructor(e=new B,t=new B(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ji)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=ji.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(ji.copy(this.origin).addScaledVector(this.direction,t),ji.distanceToSquared(e))}distanceSqToSegment(e,t,i,s){xl.copy(e).add(t).multiplyScalar(.5),ia.copy(t).sub(e).normalize(),na.copy(this.origin).sub(xl);let r=e.distanceTo(t)*.5,a=-this.direction.dot(ia),o=na.dot(this.direction),c=-na.dot(ia),l=na.lengthSq(),h=Math.abs(1-a*a),f,u,p,_;if(h>0)if(f=a*c-o,u=a*o-c,_=r*h,f>=0)if(u>=-_)if(u<=_){let M=1/h;f*=M,u*=M,p=f*(f+a*u+2*o)+u*(a*f+u+2*c)+l}else u=r,f=Math.max(0,-(a*u+o)),p=-f*f+u*(u+2*c)+l;else u=-r,f=Math.max(0,-(a*u+o)),p=-f*f+u*(u+2*c)+l;else u<=-_?(f=Math.max(0,-(-a*r+o)),u=f>0?-r:Math.min(Math.max(-r,-c),r),p=-f*f+u*(u+2*c)+l):u<=_?(f=0,u=Math.min(Math.max(-r,-c),r),p=u*(u+2*c)+l):(f=Math.max(0,-(a*r+o)),u=f>0?r:Math.min(Math.max(-r,-c),r),p=-f*f+u*(u+2*c)+l);else u=a>0?-r:r,f=Math.max(0,-(a*u+o)),p=-f*f+u*(u+2*c)+l;return i&&i.copy(this.origin).addScaledVector(this.direction,f),s&&s.copy(xl).addScaledVector(ia,u),p}intersectSphere(e,t){if(e.radius<0)return null;ji.subVectors(e.center,this.origin);let i=ji.dot(this.direction),s=ji.dot(ji)-i*i,r=e.radius*e.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=i-a,c=i+a;return c<0?null:o<0?this.at(c,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){let i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,s,r,a,o,c,l=1/this.direction.x,h=1/this.direction.y,f=1/this.direction.z,u=this.origin;return l>=0?(i=(e.min.x-u.x)*l,s=(e.max.x-u.x)*l):(i=(e.max.x-u.x)*l,s=(e.min.x-u.x)*l),h>=0?(r=(e.min.y-u.y)*h,a=(e.max.y-u.y)*h):(r=(e.max.y-u.y)*h,a=(e.min.y-u.y)*h),i>a||r>s||((r>i||isNaN(i))&&(i=r),(a<s||isNaN(s))&&(s=a),f>=0?(o=(e.min.z-u.z)*f,c=(e.max.z-u.z)*f):(o=(e.max.z-u.z)*f,c=(e.min.z-u.z)*f),i>c||o>s)||((o>i||i!==i)&&(i=o),(c<s||s!==s)&&(s=c),s<0)?null:this.at(i>=0?i:s,t)}intersectsBox(e){return this.intersectBox(e,ji)!==null}intersectTriangle(e,t,i,s,r){let a=this.origin,o=this.direction,c=o.x,l=o.y,h=o.z,f=e.x-a.x,u=e.y-a.y,p=e.z-a.z,_=t.x-a.x,M=t.y-a.y,m=t.z-a.z,g=i.x-a.x,S=i.y-a.y,A=i.z-a.z,b=Math.abs(c),E=Math.abs(l),T=Math.abs(h),d,v,P,C,D,N,V,R,k,q,G,te;if(b>=E&&b>=T?(P=c,N=f,k=_,te=g,c>=0?(d=l,v=h,C=u,D=p,V=M,R=m,q=S,G=A):(d=h,v=l,C=p,D=u,V=m,R=M,q=A,G=S)):E>=T?(P=l,N=u,k=M,te=S,l>=0?(d=h,v=c,C=p,D=f,V=m,R=_,q=A,G=g):(d=c,v=h,C=f,D=p,V=_,R=m,q=g,G=A)):(P=h,N=p,k=m,te=A,h>=0?(d=c,v=l,C=f,D=u,V=_,R=M,q=g,G=S):(d=l,v=c,C=u,D=f,V=M,R=_,q=S,G=g)),P===0)return null;let W=d/P,j=v/P,ee=1/P,Te=C-W*N,Oe=D-j*N,Z=V-W*k,me=R-j*k,ve=q-W*te,Ce=G-j*te,ge=ve*me-Ce*Z,ze=Te*Ce-Oe*ve,Mt=Z*Oe-me*Te;if(s){if(ge<0||ze<0||Mt<0)return null}else if((ge<0||ze<0||Mt<0)&&(ge>0||ze>0||Mt>0))return null;let Le=ge+ze+Mt;if(Le===0)return null;let st=ee*(ge*N+ze*k+Mt*te);return(Le>0?st<0:st>0)?null:this.at(st/Le,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Ts=class extends bn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new ke(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new tn,this.combine=Ul,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},jc=new lt,Bn=new sr,sa=new Sn,Qc=new B,ra=new B,aa=new B,oa=new B,vl=new B,la=new B,eh=new B,ca=new B,ti=class extends Ut{constructor(e=new wi,t=new Ts){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){let i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,a=i.morphTargetsRelative;t.fromBufferAttribute(s,e);let o=this.morphTargetInfluences;if(r&&o){la.set(0,0,0);for(let c=0,l=r.length;c<l;c++){let h=o[c],f=r[c];h!==0&&(vl.fromBufferAttribute(f,e),a?la.addScaledVector(vl,h):la.addScaledVector(vl.sub(t),h))}t.add(la)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),sa.copy(i.boundingSphere),sa.applyMatrix4(r),Bn.copy(e.ray).recast(e.near),!(sa.containsPoint(Bn.origin)===!1&&(Bn.intersectSphere(sa,Qc)===null||Bn.origin.distanceToSquared(Qc)>(e.far-e.near)**2))&&(jc.copy(r).invert(),Bn.copy(e.ray).applyMatrix4(jc),!(i.boundingBox!==null&&Bn.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,Bn)))}_computeIntersections(e,t,i){let s,r=this.geometry,a=this.material,o=r.index,c=r.attributes.position,l=r.attributes.uv,h=r.attributes.uv1,f=r.attributes.normal,u=r.groups,p=r.drawRange;if(o!==null)if(Array.isArray(a))for(let _=0,M=u.length;_<M;_++){let m=u[_],g=a[m.materialIndex],S=Math.max(m.start,p.start),A=Math.min(o.count,Math.min(m.start+m.count,p.start+p.count));for(let b=S,E=A;b<E;b+=3){let T=o.getX(b),d=o.getX(b+1),v=o.getX(b+2);s=ha(this,g,e,i,l,h,f,T,d,v),s&&(s.faceIndex=Math.floor(b/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let _=Math.max(0,p.start),M=Math.min(o.count,p.start+p.count);for(let m=_,g=M;m<g;m+=3){let S=o.getX(m),A=o.getX(m+1),b=o.getX(m+2);s=ha(this,a,e,i,l,h,f,S,A,b),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(c!==void 0)if(Array.isArray(a))for(let _=0,M=u.length;_<M;_++){let m=u[_],g=a[m.materialIndex],S=Math.max(m.start,p.start),A=Math.min(c.count,Math.min(m.start+m.count,p.start+p.count));for(let b=S,E=A;b<E;b+=3){let T=b,d=b+1,v=b+2;s=ha(this,g,e,i,l,h,f,T,d,v),s&&(s.faceIndex=Math.floor(b/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let _=Math.max(0,p.start),M=Math.min(c.count,p.start+p.count);for(let m=_,g=M;m<g;m+=3){let S=m,A=m+1,b=m+2;s=ha(this,a,e,i,l,h,f,S,A,b),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}};function qd(n,e,t,i,s,r,a,o){let c;if(e.side===Zt?c=i.intersectTriangle(a,r,s,!0,o):c=i.intersectTriangle(s,r,a,e.side===Rn,o),c===null)return null;ca.copy(o),ca.applyMatrix4(n.matrixWorld);let l=t.ray.origin.distanceTo(ca);return l<t.near||l>t.far?null:{distance:l,point:ca.clone(),object:n}}function ha(n,e,t,i,s,r,a,o,c,l){n.getVertexPosition(o,ra),n.getVertexPosition(c,aa),n.getVertexPosition(l,oa);let h=qd(n,e,t,i,ra,aa,oa,eh);if(h){let f=new B;Mn.getBarycoord(eh,ra,aa,oa,f),s&&(h.uv=Mn.getInterpolatedAttribute(s,o,c,l,f,new He)),r&&(h.uv1=Mn.getInterpolatedAttribute(r,o,c,l,f,new He)),a&&(h.normal=Mn.getInterpolatedAttribute(a,o,c,l,f,new B),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));let u={a:o,b:c,c:l,normal:new B,materialIndex:0};Mn.getNormal(ra,aa,oa,u.normal),h.face=u,h.barycoord=f}return h}var rr=class extends ei{constructor(e=null,t=1,i=1,s,r,a,o,c,l=Nt,h=Nt,f,u){super(null,a,o,c,l,h,s,r,f,u),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var ar=class extends Ti{constructor(e,t,i,s=1){super(e,t,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},ds=new lt,th=new lt,ua=[],ih=new zi,Yd=new lt,Ws=new ti,Xs=new Sn,or=class extends ti{constructor(e,t,i){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new ar(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<i;s++)this.setMatrixAt(s,Yd)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new zi),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,ds),ih.copy(e.boundingBox).applyMatrix4(ds),this.boundingBox.union(ih)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Sn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,ds),Xs.copy(e.boundingSphere).applyMatrix4(ds),this.boundingSphere.union(Xs)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),this.morphTexture=e.morphTexture!==null?e.morphTexture.clone():null,this.instanceColor=e.instanceColor!==null?e.instanceColor.clone():null,this.count=e.count,this.boundingBox=e.boundingBox!==null?e.boundingBox.clone():null,this.boundingSphere=e.boundingSphere!==null?e.boundingSphere.clone():null,this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let i=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=i.length+1,a=e*r+1;for(let o=0;o<i.length;o++)i[o]=s[a+o]}raycast(e,t){let i=this.matrixWorld,s=this.count;if(Ws.geometry=this.geometry,Ws.material=this.material,Ws.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Xs.copy(this.boundingSphere),Xs.applyMatrix4(i),e.ray.intersectsSphere(Xs)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,ds),th.multiplyMatrices(i,ds),Ws.matrixWorld=th,Ws.raycast(e,ua);for(let a=0,o=ua.length;a<o;a++){let c=ua[a];c.instanceId=r,c.object=this,t.push(c)}ua.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new ar(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let i=t.morphTargetInfluences,s=i.length+1;this.morphTexture===null&&(this.morphTexture=new rr(new Float32Array(s*this.count),s,this.count,eo,xi));let r=this.morphTexture.source.data.data,a=0;for(let l=0;l<i.length;l++)a+=i[l];let o=this.geometry.morphTargetsRelative?1:1-a,c=s*e;return r[c]=o,r.set(i,c+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.instanceMatrix.dispose(),this.instanceColor!==null&&this.instanceColor.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},zn=new Sn,$d=new He(.5,.5),da=new B,Tn=class{constructor(e=new li,t=new li,i=new li,s=new li,r=new li,a=new li){this.planes=[e,t,i,s,r,a]}set(e,t,i,s,r,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(i),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){let t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=_i,i=!1){let s=this.planes,r=e.elements,a=r[0],o=r[1],c=r[2],l=r[3],h=r[4],f=r[5],u=r[6],p=r[7],_=r[8],M=r[9],m=r[10],g=r[11],S=r[12],A=r[13],b=r[14],E=r[15];if(s[0].setComponents(l-a,p-h,g-_,E-S).normalize(),s[1].setComponents(l+a,p+h,g+_,E+S).normalize(),s[2].setComponents(l+o,p+f,g+M,E+A).normalize(),s[3].setComponents(l-o,p-f,g-M,E-A).normalize(),i)s[4].setComponents(c,u,m,b).normalize(),s[5].setComponents(l-c,p-u,g-m,E-b).normalize();else if(s[4].setComponents(l-c,p-u,g-m,E-b).normalize(),t===_i)s[5].setComponents(l+c,p+u,g+m,E+b).normalize();else if(t===xs)s[5].setComponents(c,u,m,b).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),zn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),zn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(zn)}intersectsSprite(e){zn.center.set(0,0,0);let t=$d.distanceTo(e.center);return zn.radius=.7071067811865476+t,zn.applyMatrix4(e.matrixWorld),this.intersectsSphere(zn)}intersectsSphere(e){let t=this.planes,i=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let i=0;i<6;i++){let s=t[i];if(da.x=s.normal.x>0?e.max.x:e.min.x,da.y=s.normal.y>0?e.max.y:e.min.y,da.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(da)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},nh=new lt,Pa=class n{constructor(){this.coordinateSystem=_i,this._frustums=[],this._count=0}setFromArrayCamera(e){let t=e.cameras,i=this._frustums;for(let s=0;s<t.length;s++){let r=t[s];nh.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),i[s]===void 0&&(i[s]=new Tn),i[s].setFromProjectionMatrix(nh,r.coordinateSystem,r.reversedDepth)}return this._count=t.length,this}getFrustum(e){return this._frustums[e]}intersectsObject(e){let t=this._frustums;for(let i=0;i<this._count;i++)if(t[i].intersectsObject(e))return!0;return!1}intersectsSprite(e){let t=this._frustums;for(let i=0;i<this._count;i++)if(t[i].intersectsSprite(e))return!0;return!1}intersectsSphere(e){let t=this._frustums;for(let i=0;i<this._count;i++)if(t[i].intersectsSphere(e))return!0;return!1}intersectsBox(e){let t=this._frustums;for(let i=0;i<this._count;i++)if(t[i].intersectsBox(e))return!0;return!1}containsPoint(e){let t=this._frustums;for(let i=0;i<this._count;i++)if(t[i].containsPoint(e))return!0;return!1}copy(e){this.coordinateSystem=e.coordinateSystem;let t=this._frustums,i=e._frustums;for(let s=0;s<e._count;s++)t[s]===void 0&&(t[s]=new Tn),t[s].copy(i[s]);return this._count=e._count,this}clone(){return new n().copy(this)}};var lr=class extends ei{constructor(e=[],t=Wn,i,s,r,a,o,c,l,h){super(e,t,i,s,r,a,o,c,l,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}};var nn=class extends ei{constructor(e,t,i=Ai,s,r,a,o=Nt,c=Nt,l,h=en,f=1){if(h!==en&&h!==rn)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:e,height:t,depth:f};super(u,s,r,a,o,c,h,i,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Ms(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},cr=class extends nn{constructor(e,t=Ai,i=Wn,s,r,a=Nt,o=Nt,c,l=en){let h={width:e,height:e,depth:1},f=[h,h,h,h,h,h];super(e,e,t,i,s,r,a,o,c,l),this.image=f,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},hr=class extends ei{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},wn=class n extends wi{constructor(e=1,t=1,i=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let c=[],l=[],h=[],f=[],u=0,p=0;_("z","y","x",-1,-1,i,t,e,a,r,0),_("z","y","x",1,-1,i,t,-e,a,r,1),_("x","z","y",1,1,e,i,t,s,a,2),_("x","z","y",1,-1,e,i,-t,s,a,3),_("x","y","z",1,-1,e,t,i,s,r,4),_("x","y","z",-1,-1,e,t,-i,s,r,5),this.setIndex(c),this.setAttribute("position",new yt(l,3)),this.setAttribute("normal",new yt(h,3)),this.setAttribute("uv",new yt(f,2));function _(M,m,g,S,A,b,E,T,d,v,P){let C=b/d,D=E/v,N=b/2,V=E/2,R=T/2,k=d+1,q=v+1,G=0,te=0,W=new B;for(let j=0;j<q;j++){let ee=j*D-V;for(let Te=0;Te<k;Te++){let Oe=Te*C-N;W[M]=Oe*S,W[m]=ee*A,W[g]=R,l.push(W.x,W.y,W.z),W[M]=0,W[m]=0,W[g]=T>0?1:-1,h.push(W.x,W.y,W.z),f.push(Te/d),f.push(1-j/v),G+=1}}for(let j=0;j<v;j++)for(let ee=0;ee<d;ee++){let Te=u+ee+k*j,Oe=u+ee+k*(j+1),Z=u+(ee+1)+k*(j+1),me=u+(ee+1)+k*j;c.push(Te,Oe,me),c.push(Oe,Z,me),te+=6}o.addGroup(p,te,P),p+=te,u+=G}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var ws=class n extends wi{constructor(e=1,t=1,i=1,s=32,r=1,a=!1,o=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:c};let l=this;s=Math.floor(s),r=Math.floor(r);let h=[],f=[],u=[],p=[],_=0,M=[],m=i/2,g=0;S(),a===!1&&(e>0&&A(!0),t>0&&A(!1)),this.setIndex(h),this.setAttribute("position",new yt(f,3)),this.setAttribute("normal",new yt(u,3)),this.setAttribute("uv",new yt(p,2));function S(){let b=new B,E=new B,T=0,d=(t-e)/i;for(let v=0;v<=r;v++){let P=[],C=v/r,D=C*(t-e)+e;for(let N=0;N<=s;N++){let V=N/s,R=V*c+o,k=Math.sin(R),q=Math.cos(R);E.x=D*k,E.y=-C*i+m,E.z=D*q,f.push(E.x,E.y,E.z),b.set(k,d,q).normalize(),u.push(b.x,b.y,b.z),p.push(V,1-C),P.push(_++)}M.push(P)}for(let v=0;v<s;v++)for(let P=0;P<r;P++){let C=M[P][v],D=M[P+1][v],N=M[P+1][v+1],V=M[P][v+1];(e>0||P!==0)&&(h.push(C,D,V),T+=3),(t>0||P!==r-1)&&(h.push(D,N,V),T+=3)}l.addGroup(g,T,0),g+=T}function A(b){let E=_,T=new He,d=new B,v=0,P=b===!0?e:t,C=b===!0?1:-1;for(let N=1;N<=s;N++)f.push(0,m*C,0),u.push(0,C,0),p.push(.5,.5),_++;let D=_;for(let N=0;N<=s;N++){let R=N/s*c+o,k=Math.cos(R),q=Math.sin(R);d.x=P*q,d.y=m*C,d.z=P*k,f.push(d.x,d.y,d.z),u.push(0,C,0),T.x=k*.5+.5,T.y=q*.5*C+.5,p.push(T.x,T.y),_++}for(let N=0;N<s;N++){let V=E+N,R=D+N;b===!0?h.push(R,R+1,V):h.push(R+1,R,V),v+=3}l.addGroup(g,v,b===!0?1:2),g+=v}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},ur=class n extends ws{constructor(e=1,t=1,i=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,e,t,i,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:i,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(e){return new n(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},La=class n extends wi{constructor(e=[],t=[],i=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:i,detail:s};let r=[],a=[];o(s),l(i),h(),this.setAttribute("position",new yt(r,3)),this.setAttribute("normal",new yt(r.slice(),3)),this.setAttribute("uv",new yt(a,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function o(S){let A=new B,b=new B,E=new B;for(let T=0;T<t.length;T+=3)p(t[T+0],A),p(t[T+1],b),p(t[T+2],E),c(A,b,E,S)}function c(S,A,b,E){let T=E+1,d=[];for(let v=0;v<=T;v++){d[v]=[];let P=S.clone().lerp(b,v/T),C=A.clone().lerp(b,v/T),D=T-v;for(let N=0;N<=D;N++)N===0&&v===T?d[v][N]=P:d[v][N]=P.clone().lerp(C,N/D)}for(let v=0;v<T;v++)for(let P=0;P<2*(T-v)-1;P++){let C=Math.floor(P/2);P%2===0?(u(d[v][C+1]),u(d[v+1][C]),u(d[v][C])):(u(d[v][C+1]),u(d[v+1][C+1]),u(d[v+1][C]))}}function l(S){let A=new B;for(let b=0;b<r.length;b+=3)A.x=r[b+0],A.y=r[b+1],A.z=r[b+2],A.normalize().multiplyScalar(S),r[b+0]=A.x,r[b+1]=A.y,r[b+2]=A.z}function h(){let S=new B;for(let A=0;A<r.length;A+=3){S.x=r[A+0],S.y=r[A+1],S.z=r[A+2];let b=m(S)/2/Math.PI+.5,E=g(S)/Math.PI+.5;a.push(b,1-E)}_(),f()}function f(){for(let S=0;S<a.length;S+=6){let A=a[S+0],b=a[S+2],E=a[S+4],T=Math.max(A,b,E),d=Math.min(A,b,E);T>.9&&d<.1&&(A<.2&&(a[S+0]+=1),b<.2&&(a[S+2]+=1),E<.2&&(a[S+4]+=1))}}function u(S){r.push(S.x,S.y,S.z)}function p(S,A){let b=S*3;A.x=e[b+0],A.y=e[b+1],A.z=e[b+2]}function _(){let S=new B,A=new B,b=new B,E=new B,T=new He,d=new He,v=new He;for(let P=0,C=0;P<r.length;P+=9,C+=6){S.set(r[P+0],r[P+1],r[P+2]),A.set(r[P+3],r[P+4],r[P+5]),b.set(r[P+6],r[P+7],r[P+8]),T.set(a[C+0],a[C+1]),d.set(a[C+2],a[C+3]),v.set(a[C+4],a[C+5]),E.copy(S).add(A).add(b).divideScalar(3);let D=m(E);M(T,C+0,S,D),M(d,C+2,A,D),M(v,C+4,b,D)}}function M(S,A,b,E){E<0&&S.x===1&&(a[A]=S.x-1),b.x===0&&b.z===0&&(a[A]=E/2/Math.PI+.5)}function m(S){return Math.atan2(S.z,-S.x)}function g(S){return Math.atan2(-S.y,Math.sqrt(S.x*S.x+S.z*S.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.vertices,e.indices,e.radius,e.detail)}};var dr=class n extends La{constructor(e=1,t=0){let i=(1+Math.sqrt(5))/2,s=[-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new n(e.radius,e.detail)}};var kn=class n extends wi{constructor(e=1,t=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:s};let r=e/2,a=t/2,o=Math.floor(i),c=Math.floor(s),l=o+1,h=c+1,f=e/o,u=t/c,p=[],_=[],M=[],m=[];for(let g=0;g<h;g++){let S=g*u-a;for(let A=0;A<l;A++){let b=A*f-r;_.push(b,-S,0),M.push(0,0,1),m.push(A/o),m.push(1-g/c)}}for(let g=0;g<c;g++)for(let S=0;S<o;S++){let A=S+l*g,b=S+l*(g+1),E=S+1+l*(g+1),T=S+1+l*g;p.push(A,b,T),p.push(b,E,T)}this.setIndex(p),this.setAttribute("position",new yt(_,3)),this.setAttribute("normal",new yt(M,3)),this.setAttribute("uv",new yt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.widthSegments,e.heightSegments)}},fr=class n extends wi{constructor(e=.5,t=1,i=32,s=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:i,phiSegments:s,thetaStart:r,thetaLength:a},i=Math.max(3,i),s=Math.max(1,s);let o=[],c=[],l=[],h=[],f=e,u=(t-e)/s,p=new B,_=new He;for(let M=0;M<=s;M++){for(let m=0;m<=i;m++){let g=r+m/i*a;p.x=f*Math.cos(g),p.y=f*Math.sin(g),c.push(p.x,p.y,p.z),l.push(0,0,1),_.x=(p.x/t+1)/2,_.y=(p.y/t+1)/2,h.push(_.x,_.y)}f+=u}for(let M=0;M<s;M++){let m=M*(i+1);for(let g=0;g<i;g++){let S=g+m,A=S,b=S+i+1,E=S+i+2,T=S+1;o.push(A,b,T),o.push(b,E,T)}}this.setIndex(o),this.setAttribute("position",new yt(c,3)),this.setAttribute("normal",new yt(l,3)),this.setAttribute("uv",new yt(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}};function Yn(n){let e={};for(let t in n){e[t]={};for(let i in n[t]){let s=n[t][i];if(sh(s))s.isRenderTargetTexture?(Ie("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=s.clone();else if(Array.isArray(s))if(sh(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();e[t][i]=r}else e[t][i]=s.slice();else e[t][i]=s}}return e}function Wt(n){let e={};for(let t=0;t<n.length;t++){let i=Yn(n[t]);for(let s in i)e[s]=i[s]}return e}function sh(n){return n&&(n.isColor||n.isMatrix3||n.isMatrix4||n.isVector2||n.isVector3||n.isVector4||n.isTexture||n.isQuaternion)}function Zd(n){let e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function nc(n){let e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Je.workingColorSpace}var Qh={clone:Yn,merge:Wt},Jd=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Kd=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,ki=class extends bn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Jd,this.fragmentShader=Kd,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Yn(e.uniforms),this.uniformsGroups=Zd(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let i={};for(let s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let i in e.uniforms){let s=e.uniforms[i];switch(this.uniforms[i]={},s.type){case"t":this.uniforms[i].value=t[s.value]||null;break;case"c":this.uniforms[i].value=new ke().setHex(s.value);break;case"v2":this.uniforms[i].value=new He().fromArray(s.value);break;case"v3":this.uniforms[i].value=new B().fromArray(s.value);break;case"v4":this.uniforms[i].value=new _t().fromArray(s.value);break;case"m3":this.uniforms[i].value=new Ne().fromArray(s.value);break;case"m4":this.uniforms[i].value=new lt().fromArray(s.value);break;default:this.uniforms[i].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let i in e.extensions)this.extensions[i]=e.extensions[i];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},Da=class extends ki{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},pr=class extends bn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new ke(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ke(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Uo,this.normalScale=new He(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new tn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};var Na=class extends bn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Oh,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Ua=class extends bn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function fs(n,e){return!n||n.constructor===e?n:typeof e.BYTES_PER_ELEMENT=="number"?new e(n):Array.prototype.slice.call(n)}function fa(n){return n!==void 0&&n.inTangents!==void 0&&n.outTangents!==void 0}var An=class{constructor(e,t,i,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,i=this._cachedIndex,s=t[i],r=t[i-1];i:{e:{let a;t:{n:if(!(e<s)){for(let o=i+2;;){if(s===void 0){if(e<r)break n;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===o)break;if(r=s,s=t[++i],e<s)break e}a=t.length;break t}if(!(e>=r)){let o=t[1];e<o&&(i=2,r=o);for(let c=i-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===c)break;if(s=r,r=t[--i-1],e>=r)break e}a=i,i=0;break t}break i}for(;i<a;){let o=i+a>>>1;e<t[o]?a=o:i=o+1}if(s=t[i],r=t[i-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,r,s)}return this.interpolate_(i,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,i=this.sampleValues,s=this.valueSize,r=e*s;for(let a=0;a!==s;++a)t[a]=i[r+a];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},Fa=class extends An{constructor(e,t,i,s){super(e,t,i,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Sl,endingEnd:Sl}}intervalChanged_(e,t,i){let s=this.parameterPositions,r=e-2,a=e+1,o=s[r],c=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case bl:r=e,o=2*t-i;break;case Tl:r=s.length-2,o=t+s[r]-s[r+1];break;default:r=e,o=i}if(c===void 0)switch(this.getSettings_().endingEnd){case bl:a=e,c=2*i-t;break;case Tl:a=1,c=i+s[1]-s[0];break;default:a=e-1,c=t}let l=(i-t)*.5,h=this.valueSize;this._weightPrev=l/(t-o),this._weightNext=l/(c-i),this._offsetPrev=r*h,this._offsetNext=a*h}interpolate_(e,t,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,h=this._offsetPrev,f=this._offsetNext,u=this._weightPrev,p=this._weightNext,_=(i-t)/(s-t),M=_*_,m=M*_,g=-u*m+2*u*M-u*_,S=(1+u)*m+(-1.5-2*u)*M+(-.5+u)*_+1,A=(-1-p)*m+(1.5+p)*M+.5*_,b=p*m-p*M;for(let E=0;E!==o;++E)r[E]=g*a[h+E]+S*a[l+E]+A*a[c+E]+b*a[f+E];return r}},Oa=class extends An{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,h=(i-t)/(s-t),f=1-h;for(let u=0;u!==o;++u)r[u]=a[l+u]*f+a[c+u]*h;return r}},Ba=class extends An{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e){return this.copySampleValue_(e-1)}},za=class extends An{interpolate_(e,t,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,h=this.inTangents,f=this.outTangents;if(!h||!f){let _=(i-t)/(s-t),M=1-_;for(let m=0;m!==o;++m)r[m]=a[l+m]*M+a[c+m]*_;return r}let u=o*2,p=e-1;for(let _=0;_!==o;++_){let M=a[l+_],m=a[c+_],g=p*u+_*2,S=f[g],A=f[g+1],b=e*u+_*2,E=h[b],T=h[b+1],d=Qd(i,t,S,E,s);r[_]=eu(d,M,A,T,m)}return r}};function eu(n,e,t,i,s){let r=1-n;return r*r*r*e+3*r*r*n*t+3*r*n*n*i+n*n*n*s}function jd(n,e,t,i,s){let r=1-n;return 3*r*r*(t-e)+6*r*n*(i-t)+3*n*n*(s-i)}function Qd(n,e,t,i,s){let r=(n-e)/(s-e);for(let a=0;a<8;a++){let o=eu(r,e,t,i,s)-n;if(Math.abs(o)<1e-10)break;let c=jd(r,e,t,i,s);if(Math.abs(c)<1e-10)break;r=Math.max(0,Math.min(1,r-o/c))}return r}var hi=class{constructor(e,t,i,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=fs(t,this.TimeBufferType),this.values=fs(i,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:fs(e.times,Array),values:fs(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(i.interpolation=s),fa(e.settings)&&(i.settings={inTangents:fs(e.settings.inTangents,Array),outTangents:fs(e.settings.outTangents,Array)})}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new Ba(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Oa(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Fa(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new za(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Zs:t=this.InterpolantFactoryMethodDiscrete;break;case Ea:t=this.InterpolantFactoryMethodLinear;break;case ga:t=this.InterpolantFactoryMethodSmooth;break;case Ml:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return Ie("KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Zs;case this.InterpolantFactoryMethodLinear:return Ea;case this.InterpolantFactoryMethodSmooth:return ga;case this.InterpolantFactoryMethodBezier:return Ml}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]+=e;fa(this.settings)&&(rh(this.settings.inTangents,e),rh(this.settings.outTangents,e))}return this}scale(e){if(e!==1){let t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]*=e;fa(this.settings)&&(ah(this.settings.inTangents,e),ah(this.settings.outTangents,e))}return this}trim(e,t){let i=this.times,s=i.length,r=0,a=s-1;for(;r!==s&&i[r]<e;)++r;for(;a!==-1&&i[a]>t;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=i.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(De("KeyframeTrack: Invalid value size in track.",this),e=!1);let i=this.times,s=this.values,r=i.length;r===0&&(De("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){let c=i[o];if(typeof c=="number"&&isNaN(c)){De("KeyframeTrack: Time is not a valid number.",this,o,c),e=!1;break}if(a!==null&&a>c){De("KeyframeTrack: Out of order keys.",this,o,c,a),e=!1;break}a=c}if(s!==void 0&&pd(s))for(let o=0,c=s.length;o!==c;++o){let l=s[o];if(isNaN(l)){De("KeyframeTrack: Value is not a valid number.",this,o,l),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),s=this.getInterpolation()===ga,r=e.length-1,a=1;for(let o=1;o<r;++o){let c=!1,l=e[o],h=e[o+1];if(l!==h&&(o!==1||l!==e[0]))if(s)c=!0;else{let f=o*i,u=f-i,p=f+i;for(let _=0;_!==i;++_){let M=t[f+_];if(M!==t[u+_]||M!==t[p+_]){c=!0;break}}}if(c){if(o!==a){e[a]=e[o];let f=o*i,u=a*i;for(let p=0;p!==i;++p)t[u+p]=t[f+p]}++a}}if(r>0){e[a]=e[r];for(let o=r*i,c=a*i,l=0;l!==i;++l)t[c+l]=t[o+l];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*i)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),i=this.constructor,s=new i(this.name,e,t);return s.createInterpolant=this.createInterpolant,fa(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function rh(n,e){for(let t=0,i=n.length;t!==i;t+=2)n[t]+=e}function ah(n,e){for(let t=0,i=n.length;t!==i;t+=2)n[t]*=e}hi.prototype.ValueTypeName="";hi.prototype.TimeBufferType=Float32Array;hi.prototype.ValueBufferType=Float32Array;hi.prototype.DefaultInterpolation=Ea;var En=class extends hi{constructor(e,t,i){super(e,t,i)}};En.prototype.ValueTypeName="bool";En.prototype.ValueBufferType=Array;En.prototype.DefaultInterpolation=Zs;En.prototype.InterpolantFactoryMethodLinear=void 0;En.prototype.InterpolantFactoryMethodSmooth=void 0;var ka=class extends hi{constructor(e,t,i,s){super(e,t,i,s)}};ka.prototype.ValueTypeName="color";var Ga=class extends hi{constructor(e,t,i,s){super(e,t,i,s)}};Ga.prototype.ValueTypeName="number";var Va=class extends An{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=(i-t)/(s-t),l=e*o;for(let h=l+o;l!==h;l+=4)Bi.slerpFlat(r,0,a,l-o,a,l,c);return r}},mr=class extends hi{constructor(e,t,i,s){super(e,t,i,s)}InterpolantFactoryMethodLinear(e){return new Va(this.times,this.values,this.getValueSize(),e)}};mr.prototype.ValueTypeName="quaternion";mr.prototype.InterpolantFactoryMethodSmooth=void 0;var Cn=class extends hi{constructor(e,t,i){super(e,t,i)}};Cn.prototype.ValueTypeName="string";Cn.prototype.ValueBufferType=Array;Cn.prototype.DefaultInterpolation=Zs;Cn.prototype.InterpolantFactoryMethodLinear=void 0;Cn.prototype.InterpolantFactoryMethodSmooth=void 0;var Ha=class extends hi{constructor(e,t,i,s){super(e,t,i,s)}};Ha.prototype.ValueTypeName="vector";var Wa=class{constructor(e,t,i){let s=this,r=!1,a=0,o=0,c,l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this._abortController=null,this.itemStart=function(h){o++,r===!1&&s.onStart!==void 0&&s.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,s.onProgress!==void 0&&s.onProgress(h,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),c?c(h):h},this.setURLModifier=function(h){return c=h,this},this.addHandler=function(h,f){return l.push(h,f),this},this.removeHandler=function(h){let f=l.indexOf(h);return f!==-1&&l.splice(f,2),this},this.getHandler=function(h){for(let f=0,u=l.length;f<u;f+=2){let p=l[f],_=l[f+1];if(p.global&&(p.lastIndex=0),p.test(h))return _}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},tu=new Wa,Xa=class{constructor(e){this.manager=e!==void 0?e:tu,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},this.priority="auto",this.cache="default",typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let i=this;return new Promise(function(s,r){i.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}setPriority(e){return this.priority=e,this}setCache(e){return this.cache=e,this}abort(){return this}};Xa.DEFAULT_MATERIAL_NAME="__DEFAULT";var gr=class extends Ut{static registerNode(e){this.prototype._lightNode=e}constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new ke(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},_r=class extends gr{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Ut.DEFAULT_UP),this.updateMatrix(),this.groundColor=new ke(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},yl=new lt,oh=new B,lh=new B,qa=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new He(512,512),this.mapType=ni,this.map=null,this.mapPass=null,this.matrix=new lt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Tn,this._frameExtents=new He(1,1),this._viewportCount=1,this._viewports=[new _t(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;oh.setFromMatrixPosition(e.matrixWorld),t.position.copy(oh),lh.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(lh),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,i,s){yl.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),i.setFromProjectionMatrix(yl,e.coordinateSystem,e.reversedDepth);let r=this._frameExtents,a=s?s.z/r.x:1,o=s?s.w/r.y:1,c=s?s.x/r.x:0,l=s?s.y/r.y:0;e.coordinateSystem===xs||e.reversedDepth?t.set(.5*a,0,0,.5*a+c,0,.5*o,0,.5*o+l,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+c,0,.5*o,0,.5*o+l,0,0,.5,.5,0,0,0,1),t.multiply(yl)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.mapType=e.mapType,this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.mapType=this.mapType,e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},pa=new B,ma=new Bi,Ni=new B,xr=class extends Ut{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new lt,this.projectionMatrix=new lt,this.projectionMatrixInverse=new lt,this.coordinateSystem=_i,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(pa,ma,Ni),Ni.x===1&&Ni.y===1&&Ni.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(pa,ma,Ni.set(1,1,1)).invert()}updateWorldMatrix(e,t,i=!1){super.updateWorldMatrix(e,t,i),this.matrixWorld.decompose(pa,ma,Ni),Ni.x===1&&Ni.y===1&&Ni.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(pa,ma,Ni.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},yn=new B,ch=new He,hh=new He,Yt=class extends xr{constructor(e=50,t=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=ys*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Ys*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return ys*2*Math.atan(Math.tan(Ys*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){yn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(yn.x,yn.y).multiplyScalar(-e/yn.z),yn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(yn.x,yn.y).multiplyScalar(-e/yn.z)}getViewSize(e,t){return this.getViewBounds(e,ch,hh),t.subVectors(hh,ch)}setViewOffset(e,t,i,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Ys*.5*this.fov)/this.zoom,i=2*t,s=this.aspect*i,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let c=a.fullWidth,l=a.fullHeight;r+=a.offsetX*s/c,t-=a.offsetY*i/l,s*=a.width/c,i*=a.height/l}let o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}};var vr=class extends xr{constructor(e=-1,t=1,i=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=i-e,a=i+e,o=s+t,c=s-t;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,a=r+l*this.view.width,o-=h*this.view.offsetY,c=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},wl=class extends qa{constructor(){super(new vr(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},yr=class extends gr{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ut.DEFAULT_UP),this.updateMatrix(),this.target=new Ut,this.shadow=new wl}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}};var ps=-90,ms=1,As=class extends Ut{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Yt(ps,ms,e,t);s.layers=this.layers,this.add(s);let r=new Yt(ps,ms,e,t);r.layers=this.layers,this.add(r);let a=new Yt(ps,ms,e,t);a.layers=this.layers,this.add(a);let o=new Yt(ps,ms,e,t);o.layers=this.layers,this.add(o);let c=new Yt(ps,ms,e,t);c.layers=this.layers,this.add(c);let l=new Yt(ps,ms,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[i,s,r,a,o,c]=t;for(let l of t)this.remove(l);if(e===_i)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===xs)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,c,l,h]=this.children,f=e.getRenderTarget(),u=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),_=e.xr.enabled;e.xr.enabled=!1;let M=i.texture.mipmapsAutoUpdate;i.texture.mipmapsAutoUpdate=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(i,0,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(i,1,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(i,2,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(i,3,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),e.setRenderTarget(i,4,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),i.texture.mipmapsAutoUpdate=M,e.setRenderTarget(i,5,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,h),e.setRenderTarget(f,u,p),e.xr.enabled=_,i.texture.needsPMREMUpdate=!0}},Ya=class extends Yt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e,this.perCameraFrustumCulled=!1}};var sc="\\[\\]\\.:\\/",ef=new RegExp("["+sc+"]","g"),rc="[^"+sc+"]",tf="[^"+sc.replace("\\.","")+"]",nf=/((?:WC+[\/:])*)/.source.replace("WC",rc),sf=/(WCOD+)?/.source.replace("WCOD",tf),rf=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",rc),af=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",rc),of=new RegExp("^"+nf+sf+rf+af+"$"),lf=["material","materials","bones","map"],Al=class{constructor(e,t,i){let s=i||pt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let i=this._targetGroup.nCachedObjects_,s=this._bindings[i];s!==void 0&&s.getValue(e,t)}setValue(e,t){let i=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=i.length;s!==r;++s)i[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].unbind()}},pt=class n{constructor(e,t,i){this.path=t,this.parsedPath=i||n.parseTrackName(t),this.node=n.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,i){return e&&e.isAnimationObjectGroup?new n.Composite(e,t,i):new n(e,t,i)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(ef,"")}static parseTrackName(e){let t=of.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let i={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=i.nodeName&&i.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=i.nodeName.substring(s+1);lf.indexOf(r)!==-1&&(i.nodeName=i.nodeName.substring(0,s),i.objectName=r)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let i=e.skeleton.getBoneByName(t);if(i!==void 0)return i}if(e.children){let i=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===t||o.uuid===t)return o;let c=i(o.children);if(c)return c}return null},s=i(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)e[t++]=i[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,i=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=n.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){Ie("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let l=t.objectIndex;switch(i){case"materials":if(!e.material){De("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){De("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){De("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===l){l=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){De("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){De("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[i]===void 0){De("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[i]}if(l!==void 0){if(e[l]===void 0){De("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[l]}}let a=e[s];if(a===void 0){let l=t.nodeName;De("PropertyBinding: Trying to update property for track: "+l+"."+s+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){De("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){De("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(c=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};pt.Composite=Al;pt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};pt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};pt.prototype.GetterByBindingType=[pt.prototype._getValue_direct,pt.prototype._getValue_array,pt.prototype._getValue_arrayElement,pt.prototype._getValue_toArray];pt.prototype.SetterByBindingTypeAndVersioning=[[pt.prototype._setValue_direct,pt.prototype._setValue_direct_setNeedsUpdate,pt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[pt.prototype._setValue_array,pt.prototype._setValue_array_setNeedsUpdate,pt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[pt.prototype._setValue_arrayElement,pt.prototype._setValue_arrayElement_setNeedsUpdate,pt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[pt.prototype._setValue_fromArray,pt.prototype._setValue_fromArray_setNeedsUpdate,pt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var T_=new Float32Array(1);var uh=new lt,Mr=class{constructor(e,t,i=0,s=1/0){this.ray=new sr(e,t),this.near=i,this.far=s,this.camera=null,this.layers=new Ss,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):De("Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return uh.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(uh),this}intersectObject(e,t=!0,i=[]){return El(e,this,i,t),i.sort(dh),i}intersectObjects(e,t=!0,i=[]){for(let s=0,r=e.length;s<r;s++)El(e[s],this,i,t);return i.sort(dh),i}};function dh(n,e){return n.distance-e.distance}function El(n,e,t,i){let s=!0;if(n.layers.test(e.layers)&&n.raycast(e,t)===!1&&(s=!1),s===!0&&i===!0){let r=n.children;for(let a=0,o=r.length;a<o;a++)El(r[a],e,t,!0)}}var Cl=class{static{this.prototype.isMatrix2=!0}constructor(e,t,i,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,i,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let i=0;i<4;i++)this.elements[i]=e[i+t];return this}set(e,t,i,s){let r=this.elements;return r[0]=e,r[2]=t,r[1]=i,r[3]=s,this}};function ac(n,e,t,i){let s=cf(i);switch(t){case Yl:return n*e;case eo:return n*e/s.components*s.byteLength;case to:return n*e/s.components*s.byteLength;case In:return n*e*2/s.components*s.byteLength;case io:return n*e*2/s.components*s.byteLength;case $l:return n*e*3/s.components*s.byteLength;case Ci:return n*e*4/s.components*s.byteLength;case no:return n*e*4/s.components*s.byteLength;case Tr:case wr:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Ar:case Er:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case ro:case oo:return Math.max(n,16)*Math.max(e,8)/4;case so:case ao:return Math.max(n,8)*Math.max(e,8)/2;case lo:case co:case uo:case fo:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case ho:case Cr:case po:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case mo:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case go:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case _o:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case xo:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case vo:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case yo:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case Mo:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case So:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case bo:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case To:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case wo:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case Ao:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case Eo:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case Co:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case Ro:case Io:case Po:return Math.ceil(n/4)*Math.ceil(e/4)*16;case Lo:case Do:return Math.ceil(n/4)*Math.ceil(e/4)*8;case Rr:case No:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function cf(n){switch(n){case ni:case Hl:return{byteLength:1,components:1};case Is:case Wl:case Ei:return{byteLength:2,components:1};case ja:case Qa:return{byteLength:2,components:4};case Ai:case Ka:case xi:return{byteLength:4,components:1};case Xl:case ql:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"187"}}));typeof window<"u"&&(window.__THREE__?Ie("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="187");function bu(){let n=null,e=!1,t=null,i=null;function s(r,a){i=n.requestAnimationFrame(s),t(r,a)}return{start:function(){e!==!0&&t!==null&&n!==null&&(i=n.requestAnimationFrame(s),e=!0)},stop:function(){n!==null&&n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){n=r}}}function uf(n){let e=new WeakMap;function t(o,c){let l=o.array,h=o.usage,f=l.byteLength,u=n.createBuffer();n.bindBuffer(c,u),n.bufferData(c,l,h),o.onUploadCallback();let p;if(l instanceof Float32Array)p=n.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)p=n.HALF_FLOAT;else if(l instanceof Uint16Array)o.isFloat16BufferAttribute?p=n.HALF_FLOAT:p=n.UNSIGNED_SHORT;else if(l instanceof Int16Array)p=n.SHORT;else if(l instanceof Uint32Array)p=n.UNSIGNED_INT;else if(l instanceof Int32Array)p=n.INT;else if(l instanceof Int8Array)p=n.BYTE;else if(l instanceof Uint8Array)p=n.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)p=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:u,type:p,bytesPerElement:l.BYTES_PER_ELEMENT,version:o.version,size:f}}function i(o,c,l){let h=c.array,f=c.updateRanges;if(n.bindBuffer(l,o),f.length===0)n.bufferSubData(l,0,h);else{f.sort((p,_)=>p.start-_.start);let u=0;for(let p=1;p<f.length;p++){let _=f[u],M=f[p];M.start<=_.start+_.count+1?_.count=Math.max(_.count,M.start+M.count-_.start):(++u,f[u]=M)}f.length=u+1;for(let p=0,_=f.length;p<_;p++){let M=f[p];n.bufferSubData(l,M.start*h.BYTES_PER_ELEMENT,h,M.start,M.count)}c.clearUpdateRanges()}c.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let c=e.get(o);c&&(n.deleteBuffer(c.buffer),e.delete(o))}function a(o,c){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let h=e.get(o);(!h||h.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let l=e.get(o);if(l===void 0)e.set(o,t(o,c));else if(l.version<o.version){if(l.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(l.buffer,o,c),l.version=o.version}}return{get:s,remove:r,update:a}}var df=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,ff=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,pf=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,mf=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,gf=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,_f=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,xf=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,vf=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,yf=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,Mf=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Sf=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,bf=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Tf=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,wf=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Af=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Ef=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Cf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Rf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,If=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Pf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Lf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Df=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Nf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,Uf=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Ff=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,Of=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Bf=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,zf=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,kf=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Gf="gl_FragColor = linearToOutputTexel( gl_FragColor );",Vf=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Hf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,Wf=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,Xf=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,qf=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Yf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,$f=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Zf=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Jf=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Kf=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,jf=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Qf=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,ep=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,tp=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,ip=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,np=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * worldNormal, ENVMAP_MAX_LOD );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * reflectVec, roughnessToMip( roughness ) );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureLod( envMap, envMapRotation * retroVec, roughnessToMip( roughness ) );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_PMREM
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,sp=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,rp=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,ap=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,op=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lp=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.045 );
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef USE_DIFFUSE_ROUGHNESS
	float diffuseRoughnessFactor = diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		diffuseRoughnessFactor *= texture2D( diffuseRoughnessMap, vDiffuseRoughnessMapUv ).r;
	#endif
	material.diffuseRoughness = saturate( diffuseRoughnessFactor );
#endif
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.045 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,cp=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float diffuseRoughness;
	#endif
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
#ifdef USE_DIFFUSE_ROUGHNESS
	const float EON_EPSILON = 1e-7;
	float FON_DirectionalAlbedo( const in float mu, const in float roughness, const in float A ) {
		float muComp = 1.0 - mu;
		float gOverPi = muComp * ( 0.0571085289 + muComp * ( 0.491881867 + muComp * ( - 0.332181442 + muComp * 0.0714429953 ) ) );
		return A * ( 1.0 + roughness * gOverPi );
	}
	vec3 BRDF_EON( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 diffuseColor, const in float roughness ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return BRDF_Lambert( rho );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float s = dot( lightDir, viewDir ) - dotNL * dotNV;
		float sOverT = ( s > 0.0 ) ? s / max( max( dotNL, dotNV ), EON_EPSILON ) : s;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		vec3 singleScatter = rho * RECIPROCAL_PI * A * ( 1.0 + roughness * sOverT );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		float albedoV = FON_DirectionalAlbedo( dotNV, roughness, A );
		float albedoL = FON_DirectionalAlbedo( dotNL, roughness, A );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		vec3 multiScatter = rhoMultiScatter * RECIPROCAL_PI
			* max( EON_EPSILON, 1.0 - albedoV )
			* max( EON_EPSILON, 1.0 - albedoL )
			/ max( EON_EPSILON, 1.0 - averageAlbedo );
		return singleScatter + multiScatter;
	}
	vec3 EON_DirectionalAlbedo( const in vec3 diffuseColor, const in float roughness, const in float dotNV ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return rho;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		float directionalAlbedo = FON_DirectionalAlbedo( dotNV, roughness, A );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		return rho * directionalAlbedo + rhoMultiScatter * ( 1.0 - directionalAlbedo );
	}
#endif
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = max( material.clearcoatRoughness, 0.045 );
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = max( material.roughness, 0.045 );
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float alphaT = max( material.alphaT, alpha );
		float V = V_GGX_SmithCorrelated_Anisotropic( alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		vec3 diffuseBRDF = BRDF_EON( directLight.direction, geometryViewDir, geometryNormal, material.diffuseColor, material.diffuseRoughness ) * ( 1.0 - material.metalness );
	#else
		vec3 diffuseBRDF = BRDF_Lambert( material.diffuseContribution );
	#endif
	reflectedLight.directDiffuse += irradiance * diffuseBRDF * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuseAlbedo = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness );
		vec3 diffuse = irradiance * RECIPROCAL_PI * diffuseAlbedo * ( 1.0 - singleScattering - multiScattering );
	#else
		vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#endif
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuse = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness ) * ( 1.0 - totalScatteringDielectric );
	#else
		vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	#endif
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,hp=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_LIGHT_PROBE_GRIDS > 0
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		int probeGrid = - 1;
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( isInsideLightProbeGrid( probeWorldPos, probeWorldNormal, probesMin[ i ], probesMax[ i ], probesResolution[ i ] ) ) probeGrid = UNROLLED_LOOP_INDEX;
		}
		#pragma unroll_loop_end
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( probeGrid == UNROLLED_LOOP_INDEX ) irradiance += getLightProbeGridIrradiance( probesSH[ i ], probesMin[ i ], probesMax[ i ], probesResolution[ i ], probeWorldPos, probeWorldNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,up=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,dp=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,fp=`#if NUM_LIGHT_PROBE_GRIDS > 0
uniform highp sampler3D probesSH[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMin[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMax[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesResolution[ NUM_LIGHT_PROBE_GRIDS ];
bool isInsideLightProbeGrid( vec3 worldPos, vec3 worldNormal, vec3 probesMin, vec3 probesMax, vec3 probesResolution ) {
	vec3 spacing = ( probesMax - probesMin ) / probesResolution;
	vec3 samplePos = worldPos + worldNormal * spacing * 0.5;
	vec3 margin = spacing * 0.01;
	return all( greaterThanEqual( samplePos, probesMin - margin ) ) && all( lessThanEqual( samplePos, probesMax + margin ) );
}
vec3 getLightProbeGridIrradiance( highp sampler3D probesSH, vec3 probesMin, vec3 probesMax, vec3 probesResolution, vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 probeSpacing = gridRange / res;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.5 / res, 1.0 - 0.5 / res );
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,pp=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,mp=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,gp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,_p=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,xp=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,vp=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,yp=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Mp=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Sp=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,bp=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Tp=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,wp=`#if defined( USE_MORPHCOLORS )
	#if defined( USE_COLOR_ALPHA )
		vColor *= morphTargetBaseInfluence;
	#elif defined( USE_COLOR )
		vColor.rgb *= morphTargetBaseInfluence;
	#endif
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor.rgb += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Ap=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Ep=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Cp=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Rp=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Ip=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Pp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Lp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Dp=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Np=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Up=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Fp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Op=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Bp=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,zp=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,kp=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,Gp=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Vp=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Hp=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Wp=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Xp=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,qp=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Yp=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				vec2 radius = shadowRadius * texelSize;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float lightDistance = length( lightToPosition );
			float depthRange = shadowCameraFar - shadowCameraNear;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float depthA = - shadowCameraNear / depthRange - shadowBias;
				float depthB = shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#else
				float depthA = shadowCameraFar / depthRange + shadowBias;
				float depthB = - shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			shadow = 0.0;
			for ( int i = 0; i < 5; i ++ ) {
				vec2 offset = vogelDiskSample( i, 5, phi );
				vec3 direction = bd3D + ( tangent * offset.x + bitangent * offset.y ) * texelSize;
				vec3 absDirection = abs( direction );
				float dp = depthA + depthB / max( max( absDirection.x, absDirection.y ), absDirection.z );
				shadow += texture( shadowMap, vec4( direction, dp ) );
			}
			shadow *= 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,$p=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Zp=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Jp=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Kp=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,jp=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Qp=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,em=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,tm=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,im=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,nm=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,sm=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,rm=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,am=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,om=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,lm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	uniform mat3 diffuseRoughnessMapTransform;
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,cm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	vDiffuseRoughnessMapUv = ( diffuseRoughnessMapTransform * vec3( DIFFUSE_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,hm=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,um=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,dm=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,fm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,pm=`uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <envmap_common_pars_fragment>
void main() {
	#ifdef ENVMAP_TYPE_PMREM
		vec4 texColor = textureLod( envMap, backgroundRotation * vWorldDirection, roughnessToMip( backgroundBlurriness ) );
	#else
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,mm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,gm=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,_m=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,xm=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,vm=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,ym=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,Mm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Sm=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,bm=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Tm=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,wm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Am=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Em=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Cm=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Rm=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Im=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Pm=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Lm=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Dm=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Nm=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Um=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Fm=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DIFFUSE_ROUGHNESS
	uniform float diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		uniform sampler2D diffuseRoughnessMap;
	#endif
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Om=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Bm=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,zm=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,km=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Gm=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Vm=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Hm=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Wm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,We={alphahash_fragment:df,alphahash_pars_fragment:ff,alphamap_fragment:pf,alphamap_pars_fragment:mf,alphatest_fragment:gf,alphatest_pars_fragment:_f,aomap_fragment:xf,aomap_pars_fragment:vf,batching_pars_vertex:yf,batching_vertex:Mf,begin_vertex:Sf,beginnormal_vertex:bf,bsdfs:Tf,iridescence_fragment:wf,bumpmap_pars_fragment:Af,clipping_planes_fragment:Ef,clipping_planes_pars_fragment:Cf,clipping_planes_pars_vertex:Rf,clipping_planes_vertex:If,color_fragment:Pf,color_pars_fragment:Lf,color_pars_vertex:Df,color_vertex:Nf,common:Uf,defaultnormal_vertex:Ff,displacementmap_pars_vertex:Of,displacementmap_vertex:Bf,emissivemap_fragment:zf,emissivemap_pars_fragment:kf,colorspace_fragment:Gf,colorspace_pars_fragment:Vf,envmap_fragment:Hf,envmap_common_pars_fragment:Wf,envmap_pars_fragment:Xf,envmap_pars_vertex:qf,envmap_physical_pars_fragment:np,envmap_vertex:Yf,fog_vertex:$f,fog_pars_vertex:Zf,fog_fragment:Jf,fog_pars_fragment:Kf,gradientmap_pars_fragment:jf,lightmap_pars_fragment:Qf,lights_lambert_fragment:ep,lights_lambert_pars_fragment:tp,lights_pars_begin:ip,lights_toon_fragment:sp,lights_toon_pars_fragment:rp,lights_phong_fragment:ap,lights_phong_pars_fragment:op,lights_physical_fragment:lp,lights_physical_pars_fragment:cp,lights_fragment_begin:hp,lights_fragment_maps:up,lights_fragment_end:dp,lightprobes_pars_fragment:fp,logdepthbuf_fragment:pp,logdepthbuf_pars_fragment:mp,logdepthbuf_pars_vertex:gp,logdepthbuf_vertex:_p,map_fragment:xp,map_pars_fragment:vp,map_particle_fragment:yp,map_particle_pars_fragment:Mp,metalnessmap_fragment:Sp,metalnessmap_pars_fragment:bp,morphinstance_vertex:Tp,morphcolor_vertex:wp,morphnormal_vertex:Ap,morphtarget_pars_vertex:Ep,morphtarget_vertex:Cp,normal_fragment_begin:Rp,normal_fragment_maps:Ip,normal_pars_fragment:Pp,normal_pars_vertex:Lp,normal_vertex:Dp,normalmap_pars_fragment:Np,clearcoat_normal_fragment_begin:Up,clearcoat_normal_fragment_maps:Fp,clearcoat_pars_fragment:Op,iridescence_pars_fragment:Bp,opaque_fragment:zp,packing:kp,premultiplied_alpha_fragment:Gp,project_vertex:Vp,dithering_fragment:Hp,dithering_pars_fragment:Wp,roughnessmap_fragment:Xp,roughnessmap_pars_fragment:qp,shadowmap_pars_fragment:Yp,shadowmap_pars_vertex:$p,shadowmap_vertex:Zp,shadowmask_pars_fragment:Jp,skinbase_vertex:Kp,skinning_pars_vertex:jp,skinning_vertex:Qp,skinnormal_vertex:em,specularmap_fragment:tm,specularmap_pars_fragment:im,tonemapping_fragment:nm,tonemapping_pars_fragment:sm,transmission_fragment:rm,transmission_pars_fragment:am,uv_pars_fragment:om,uv_pars_vertex:lm,uv_vertex:cm,worldpos_vertex:hm,background_vert:um,background_frag:dm,backgroundCube_vert:fm,backgroundCube_frag:pm,cube_vert:mm,cube_frag:gm,depth_vert:_m,depth_frag:xm,distance_vert:vm,distance_frag:ym,equirect_vert:Mm,equirect_frag:Sm,linedashed_vert:bm,linedashed_frag:Tm,meshbasic_vert:wm,meshbasic_frag:Am,meshlambert_vert:Em,meshlambert_frag:Cm,meshmatcap_vert:Rm,meshmatcap_frag:Im,meshnormal_vert:Pm,meshnormal_frag:Lm,meshphong_vert:Dm,meshphong_frag:Nm,meshphysical_vert:Um,meshphysical_frag:Fm,meshtoon_vert:Om,meshtoon_frag:Bm,points_vert:zm,points_frag:km,shadow_vert:Gm,shadow_frag:Vm,sprite_vert:Hm,sprite_frag:Wm},pe={common:{diffuse:{value:new ke(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ne},alphaMap:{value:null},alphaMapTransform:{value:new Ne},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ne}},envmap:{envMap:{value:null},envMapRotation:{value:new Ne},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ne}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ne}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ne},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ne},normalScale:{value:new He(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ne},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ne}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ne}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ne}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new ke(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new ke(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ne},alphaTest:{value:0},uvTransform:{value:new Ne}},sprite:{diffuse:{value:new ke(16777215)},opacity:{value:1},center:{value:new He(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ne},alphaMap:{value:null},alphaMapTransform:{value:new Ne},alphaTest:{value:0}}},Hi={basic:{uniforms:Wt([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.fog]),vertexShader:We.meshbasic_vert,fragmentShader:We.meshbasic_frag},lambert:{uniforms:Wt([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,pe.lights,{emissive:{value:new ke(0)},envMapIntensity:{value:1}}]),vertexShader:We.meshlambert_vert,fragmentShader:We.meshlambert_frag},phong:{uniforms:Wt([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,pe.lights,{emissive:{value:new ke(0)},specular:{value:new ke(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:We.meshphong_vert,fragmentShader:We.meshphong_frag},standard:{uniforms:Wt([pe.common,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.roughnessmap,pe.metalnessmap,pe.fog,pe.lights,{emissive:{value:new ke(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:We.meshphysical_vert,fragmentShader:We.meshphysical_frag},toon:{uniforms:Wt([pe.common,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.gradientmap,pe.fog,pe.lights,{emissive:{value:new ke(0)}}]),vertexShader:We.meshtoon_vert,fragmentShader:We.meshtoon_frag},matcap:{uniforms:Wt([pe.common,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,{matcap:{value:null}}]),vertexShader:We.meshmatcap_vert,fragmentShader:We.meshmatcap_frag},points:{uniforms:Wt([pe.points,pe.fog]),vertexShader:We.points_vert,fragmentShader:We.points_frag},dashed:{uniforms:Wt([pe.common,pe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:We.linedashed_vert,fragmentShader:We.linedashed_frag},depth:{uniforms:Wt([pe.common,pe.displacementmap]),vertexShader:We.depth_vert,fragmentShader:We.depth_frag},normal:{uniforms:Wt([pe.common,pe.bumpmap,pe.normalmap,pe.displacementmap,{opacity:{value:1}}]),vertexShader:We.meshnormal_vert,fragmentShader:We.meshnormal_frag},sprite:{uniforms:Wt([pe.sprite,pe.fog]),vertexShader:We.sprite_vert,fragmentShader:We.sprite_frag},background:{uniforms:{uvTransform:{value:new Ne},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:We.background_vert,fragmentShader:We.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ne}},vertexShader:We.backgroundCube_vert,fragmentShader:We.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:We.cube_vert,fragmentShader:We.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:We.equirect_vert,fragmentShader:We.equirect_frag},distance:{uniforms:Wt([pe.common,pe.displacementmap,{referencePosition:{value:new B},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:We.distance_vert,fragmentShader:We.distance_frag},shadow:{uniforms:Wt([pe.lights,pe.fog,{color:{value:new ke(0)},opacity:{value:1}}]),vertexShader:We.shadow_vert,fragmentShader:We.shadow_frag}};Hi.physical={uniforms:Wt([Hi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ne},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ne},clearcoatNormalScale:{value:new He(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ne},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new Ne},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ne},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ne},sheen:{value:0},sheenColor:{value:new ke(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ne},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ne},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ne},transmissionSamplerSize:{value:new He},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ne},attenuationDistance:{value:0},attenuationColor:{value:new ke(0)},specularColor:{value:new ke(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ne},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ne},anisotropyVector:{value:new He},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ne}}]),vertexShader:We.meshphysical_vert,fragmentShader:We.meshphysical_frag};var Fo={r:0,b:0,g:0},Xm=new lt,Tu=new Ne;Tu.set(-1,0,0,0,1,0,0,0,1);function qm(n,e,t,i,s,r){let a=new ke(0),o=s===!0?0:1,c,l,h=null,f=0,u=null;function p(S){let A=S.isScene===!0?S.background:null;if(A&&A.isTexture){let b=S.backgroundBlurriness>0;A=e.get(A,b)}return A}function _(S){let A=!1,b=p(S);b===null?m(a,o):b&&b.isColor&&(m(b,1),A=!0);let E=n.xr.getEnvironmentBlendMode();E==="additive"?t.buffers.color.setClear(0,0,0,1,r):E==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(n.autoClear||A)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function M(S,A){let b=p(A);b&&b.isCubeTexture?(l===void 0&&(l=new ti(new wn(1,1,1),new ki({name:"BackgroundCubeMaterial",uniforms:Yn(Hi.backgroundCube.uniforms),vertexShader:Hi.backgroundCube.vertexShader,fragmentShader:Hi.backgroundCube.fragmentShader,side:Zt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),l.geometry.deleteAttribute("uv"),l.onBeforeRender=function(E,T,d){this.matrixWorld.copyPosition(d.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(l)),l.material.uniforms.envMap.value=b,l.material.uniforms.backgroundBlurriness.value=A.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(Xm.makeRotationFromEuler(A.backgroundRotation)).transpose(),b.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(Tu),l.material.toneMapped=Je.getTransfer(b.colorSpace)!==nt,(h!==b||f!==b.version||u!==n.toneMapping)&&(l.material.needsUpdate=!0,h=b,f=b.version,u=n.toneMapping),l.layers.enableAll(),S.unshift(l,l.geometry,l.material,0,0,null)):b&&b.isTexture&&(c===void 0&&(c=new ti(new kn(2,2),new ki({name:"BackgroundMaterial",uniforms:Yn(Hi.background.uniforms),vertexShader:Hi.background.vertexShader,fragmentShader:Hi.background.fragmentShader,side:Rn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(c)),c.material.uniforms.t2D.value=b,c.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,c.material.toneMapped=Je.getTransfer(b.colorSpace)!==nt,b.matrixAutoUpdate===!0&&b.updateMatrix(),c.material.uniforms.uvTransform.value.copy(b.matrix),(h!==b||f!==b.version||u!==n.toneMapping)&&(c.material.needsUpdate=!0,h=b,f=b.version,u=n.toneMapping),c.layers.enableAll(),S.unshift(c,c.geometry,c.material,0,0,null))}function m(S,A){S.getRGB(Fo,nc(n)),t.buffers.color.setClear(Fo.r,Fo.g,Fo.b,A,r)}function g(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return a},setClearColor:function(S,A=1){a.set(S),o=A,m(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(S){o=S,m(a,o)},render:_,addToRenderList:M,dispose:g}}function Ym(n,e){let t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=u(null),r=s,a=!1;function o(D,N,V,R,k){let q=!1,G=f(D,R,V,N);r!==G&&(r=G,l(r.object)),q=p(D,R,V,k),q&&_(D,R,V,k),k!==null&&e.update(k,n.ELEMENT_ARRAY_BUFFER),(q||a)&&(a=!1,b(D,N,V,R),k!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(k).buffer))}function c(){return n.createVertexArray()}function l(D){return n.bindVertexArray(D)}function h(D){return n.deleteVertexArray(D)}function f(D,N,V,R){let k=R.wireframe===!0,q=i[N.id];q===void 0&&(q={},i[N.id]=q);let G=D.isInstancedMesh===!0?D.id:0,te=q[G];te===void 0&&(te={},q[G]=te);let W=te[V.id];W===void 0&&(W={},te[V.id]=W);let j=W[k];return j===void 0&&(j=u(c()),W[k]=j),j}function u(D){let N=[],V=[],R=[];for(let k=0;k<t;k++)N[k]=0,V[k]=0,R[k]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:N,enabledAttributes:V,attributeDivisors:R,object:D,attributes:{},index:null}}function p(D,N,V,R){let k=r.attributes,q=N.attributes,G=0,te=V.getAttributes();for(let W in te)if(te[W].location>=0){let ee=k[W],Te=q[W];if(Te===void 0&&(W==="instanceMatrix"&&D.instanceMatrix&&(Te=D.instanceMatrix),W==="instanceColor"&&D.instanceColor&&(Te=D.instanceColor)),ee===void 0||ee.attribute!==Te||Te&&ee.data!==Te.data)return!0;G++}return r.attributesNum!==G||r.index!==R}function _(D,N,V,R){let k={},q=N.attributes,G=0,te=V.getAttributes();for(let W in te)if(te[W].location>=0){let ee=q[W];ee===void 0&&(W==="instanceMatrix"&&D.instanceMatrix&&(ee=D.instanceMatrix),W==="instanceColor"&&D.instanceColor&&(ee=D.instanceColor));let Te={};Te.attribute=ee,ee&&ee.data&&(Te.data=ee.data),k[W]=Te,G++}r.attributes=k,r.attributesNum=G,r.index=R}function M(){let D=r.newAttributes;for(let N=0,V=D.length;N<V;N++)D[N]=0}function m(D){g(D,0)}function g(D,N){let V=r.newAttributes,R=r.enabledAttributes,k=r.attributeDivisors;V[D]=1,R[D]===0&&(n.enableVertexAttribArray(D),R[D]=1),k[D]!==N&&(n.vertexAttribDivisor(D,N),k[D]=N)}function S(){let D=r.newAttributes,N=r.enabledAttributes;for(let V=0,R=N.length;V<R;V++)N[V]!==D[V]&&(n.disableVertexAttribArray(V),N[V]=0)}function A(D,N,V,R,k,q,G){G===!0?n.vertexAttribIPointer(D,N,V,k,q):n.vertexAttribPointer(D,N,V,R,k,q)}function b(D,N,V,R){M();let k=R.attributes,q=V.getAttributes(),G=N.defaultAttributeValues;for(let te in q){let W=q[te];if(W.location>=0){let j=k[te];if(j===void 0&&(te==="instanceMatrix"&&D.instanceMatrix&&(j=D.instanceMatrix),te==="instanceColor"&&D.instanceColor&&(j=D.instanceColor)),j!==void 0){let ee=j.normalized,Te=j.itemSize,Oe=e.get(j);if(Oe===void 0)continue;let Z=Oe.buffer,me=Oe.type,ve=Oe.bytesPerElement,Ce=me===n.INT||me===n.UNSIGNED_INT||j.gpuType===Ka;if(j.isInterleavedBufferAttribute){let ge=j.data,ze=ge.isInterleavedBuffer===!0?ge.stride:ge.itemSize,Mt=j.offset;if(ge.isInstancedInterleavedBuffer||ge.isInstancedBufferAttribute){for(let Le=0;Le<W.locationSize;Le++)g(W.location+Le,ge.meshPerAttribute);D.isInstancedMesh!==!0&&R._maxInstanceCount===void 0&&(R._maxInstanceCount=ge.meshPerAttribute*ge.count)}else for(let Le=0;Le<W.locationSize;Le++)m(W.location+Le);n.bindBuffer(n.ARRAY_BUFFER,Z);for(let Le=0;Le<W.locationSize;Le++)A(W.location+Le,Te/W.locationSize,me,ee,ze*ve,(Mt+Te/W.locationSize*Le)*ve,Ce)}else{if(j.isInstancedBufferAttribute){for(let ge=0;ge<W.locationSize;ge++)g(W.location+ge,j.meshPerAttribute);D.isInstancedMesh!==!0&&R._maxInstanceCount===void 0&&(R._maxInstanceCount=j.meshPerAttribute*j.count)}else for(let ge=0;ge<W.locationSize;ge++)m(W.location+ge);n.bindBuffer(n.ARRAY_BUFFER,Z);for(let ge=0;ge<W.locationSize;ge++)A(W.location+ge,Te/W.locationSize,me,ee,Te*ve,Te/W.locationSize*ge*ve,Ce)}}else if(G!==void 0){let ee=G[te];if(ee!==void 0)switch(ee.length){case 2:n.vertexAttrib2fv(W.location,ee);break;case 3:n.vertexAttrib3fv(W.location,ee);break;case 4:n.vertexAttrib4fv(W.location,ee);break;default:n.vertexAttrib1fv(W.location,ee)}}}}S()}function E(){P();for(let D in i){let N=i[D];for(let V in N){let R=N[V];for(let k in R){let q=R[k];for(let G in q)h(q[G].object),delete q[G];delete R[k]}}delete i[D]}}function T(D){if(i[D.id]===void 0)return;let N=i[D.id];for(let V in N){let R=N[V];for(let k in R){let q=R[k];for(let G in q)h(q[G].object),delete q[G];delete R[k]}}delete i[D.id]}function d(D){for(let N in i){let V=i[N];for(let R in V){let k=V[R];if(k[D.id]===void 0)continue;let q=k[D.id];for(let G in q)h(q[G].object),delete q[G];delete k[D.id]}}}function v(D){for(let N in i){let V=i[N],R=D.isInstancedMesh===!0?D.id:0,k=V[R];if(k!==void 0){for(let q in k){let G=k[q];for(let te in G)h(G[te].object),delete G[te];delete k[q]}delete V[R],Object.keys(V).length===0&&delete i[N]}}}function P(){C(),a=!0,r!==s&&(r=s,l(r.object))}function C(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:P,resetDefaultState:C,dispose:E,releaseStatesOfGeometry:T,releaseStatesOfObject:v,releaseStatesOfProgram:d,initAttributes:M,enableAttribute:m,disableUnusedAttributes:S}}function $m(n,e,t){let i;function s(c){i=c}function r(c,l){n.drawArrays(i,c,l),t.update(l,i,1)}function a(c,l,h){h!==0&&(n.drawArraysInstanced(i,c,l,h),t.update(l,i,h))}function o(c,l,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,l,0,h);let u=0;for(let p=0;p<h;p++)u+=l[p];t.update(u,i,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function Zm(n,e,t,i){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let d=e.get("EXT_texture_filter_anisotropic");s=n.getParameter(d.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(d){return!(d!==Ci&&i.convert(d)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(d){let v=d===Ei&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(d!==ni&&d!==xi&&!v&&i.convert(d)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE))}function c(d){if(d==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";d="mediump"}return d==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp",h=c(l);h!==l&&(Ie("WebGLRenderer:",l,"not supported, using",h,"instead."),l=h);let f=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),u=t.logarithmicDepthBuffer===!0&&f===!1;t.reversedDepthBuffer===!0&&f===!1&&Ie("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer."),t.logarithmicDepthBuffer===!0&&f===!0&&Ie("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");let p=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),_=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),M=n.getParameter(n.MAX_TEXTURE_SIZE),m=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),g=n.getParameter(n.MAX_VERTEX_ATTRIBS),S=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),A=n.getParameter(n.MAX_VARYING_VECTORS),b=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),E=n.getParameter(n.MAX_SAMPLES),T=n.getParameter(n.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:a,textureTypeReadable:o,precision:l,logarithmicDepthBuffer:u,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:_,maxTextureSize:M,maxCubemapSize:m,maxAttributes:g,maxVertexUniforms:S,maxVaryings:A,maxFragmentUniforms:b,maxSamples:E,samples:T}}function Jm(n){let e=this,t=null,i=0,s=!1,r=!1,a=new li,o=new Ne,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(f,u){let p=f.length!==0||u||i!==0||s;return s=u,i=f.length,p},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(f,u){t=h(f,u,0)},this.setState=function(f,u,p){let _=f.clippingPlanes,M=f.clipIntersection,m=f.clipShadows,g=n.get(f);if(!s||_===null||_.length===0||r&&!m)r?h(null):l();else{let S=r?0:i,A=S*4,b=g.clippingState||null;c.value=b,b=h(_,u,A,p);for(let E=0;E!==A;++E)b[E]=t[E];g.clippingState=b,this.numIntersection=M?this.numPlanes:0,this.numPlanes+=S}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function h(f,u,p,_){let M=f!==null?f.length:0,m=null;if(M!==0){if(m=c.value,_!==!0||m===null){let g=p+M*4,S=u.matrixWorldInverse;o.getNormalMatrix(S),(m===null||m.length<g)&&(m=new Float32Array(g));for(let A=0,b=p;A!==M;++A,b+=4)a.copy(f[A]).applyMatrix4(S,o),a.normal.toArray(m,b),m[b+3]=a.constant}c.value=m,c.needsUpdate=!0}return e.numPlanes=M,e.numIntersection=0,m}}var Lr=class extends ci{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let i={width:e,height:e,depth:1},s=[i,i,i,i,i,i];this.texture=new lr(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new wn(5,5,5),r=new ki({name:"CubemapFromEquirect",uniforms:Yn(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Zt,blending:Vn});r.uniforms.tEquirect.value=t;let a=new ti(s,r),o=t.minFilter;return t.minFilter===sn&&(t.minFilter=$t),new As(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,i=!0,s=!0){let r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,i,s);e.setRenderTarget(r)}},iu=256,Km=3,jm=20,wu=256,Au=16,Qm=3,eg=new B,tg=new ke,Bo=class n{constructor(e){this._renderer=e,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new As(1,10,null),this._boxMesh=new ti(new wn(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(e,t=0,i=.1,s=100,r={}){let{size:a=256,position:o=eg}=r,c=this._renderer;this._setSize(a);let l=this._allocateTarget(),h=this._getSourceTarget(!0);t>0&&(h.texture.mipmapsAutoUpdate=!1);let f=c.autoClear,u=c.autoClearColor,p=c.autoClearDepth,_=c.autoClearStencil,M=e.background;c.autoClear=!0,c.autoClearColor=!0,c.autoClearDepth=!0,c.autoClearStencil=!0,M===null&&(e.background=c.getClearColor(tg));let m=new As(i,s,h);return m.position.copy(o),m.update(c,e),c.autoClear=f,c.autoClearColor=u,c.autoClearDepth=p,c.autoClearStencil=_,e.background=M,t>0&&(h.texture.mipmapsAutoUpdate=!0,this._blur(l,t)),this._applyPMREM(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=ru(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=su(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(e,t){return t>0?1-Math.sqrt(1-e/t):0}_setSize(e){this._cubeSize=Math.max(iu,tc(e))}_fromTexture(e,t){e.mapping===Wn||e.mapping===Rs?this._setSize(e.image.length===0?iu:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4);let i=t||this._allocateTarget();return this._textureToCubemap(e),this._applyPMREM(i),i}_allocateTarget(){let e=this._cubeSize,t=nu(e,!1,!1),i=Math.log2(e)-Km;for(let s=0;s<=i;s++)t.texture.mipmaps.push({width:e>>s,height:e>>s});return t.texture.name="PMREM",t.texture.isPMREMTexture=!0,t}_getSourceTarget(e=!1){let t=this._cubeSize,i=this._sourceTarget;return(i===null||i.width!==t||e&&i.depthBuffer===!1)&&(i!==null&&i.dispose(),this._sourceTarget=nu(t,!0,e)),this._sourceTarget}_compileMaterial(e){this._boxMesh.material=e,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(e,t,i){let s=this._boxMesh,r=this._cubeCamera;s.material=i,r.renderTarget=e,r.activeMipmapLevel=t;let a=e.width>>t;e.viewport.set(0,0,a,a),r.update(this._renderer,s),e.viewport.set(0,0,e.width,e.height)}_textureToCubemap(e){let t;e.mapping===Wn||e.mapping===Rs?(this._cubemapMaterial===null&&(this._cubemapMaterial=ru()),t=this._cubemapMaterial,t.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=su()),t=this._equirectMaterial),t.uniforms.envMap.value=e,this._renderCube(this._getSourceTarget(),0,t)}_applyPMREM(e){this._ggxMaterial===null&&(this._ggxMaterial=ig(),this._integrationMaterial=ng());let t=this._cubeSize,i=e.texture.mipmaps.length-1,s=this._ggxMaterial.uniforms;s.envMap.value=this._sourceTarget.texture;let r=this._integrationMaterial.uniforms;r.envMap.value=this._sourceTarget.texture,r.sourceLod.value=Math.log2(t/Au);for(let a=0;a<=i;a++){let o=n.lodToRoughness(a,i);if(a>i-Qm)r.roughness.value=o,this._renderCube(e,a,this._integrationMaterial);else{let c=o>0?Math.log2(t)+.5*Math.log2(6/(wu*Math.pow(o,4)))+.5:0;s.roughness.value=o,s.lodBias.value=c,this._renderCube(e,a,this._ggxMaterial)}}}_blur(e,t){this._blurMaterial===null&&(this._blurMaterial=sg());let i=this._blurMaterial,s=i.uniforms,r=this._sourceTarget;s.sigma.value=Math.min(t,Math.PI)/Math.SQRT2,s.envMap.value=r.texture,this._renderCube(e,0,i),s.envMap.value=e.texture,this._renderCube(r,0,i)}};function nu(n,e,t){return new Lr(n,{minFilter:sn,generateMipmaps:e,type:Ei,colorSpace:Js,depthBuffer:t})}function Dr(n,e,t){return new ki({name:n,uniforms:e,vertexShader:We.cube_vert,fragmentShader:t,side:Zt,blending:Vn,depthTest:!1,depthWrite:!1})}function ig(){return Dr("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${wu}u

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float lodBias;

		#include <common>

		// Van der Corput radical inverse
		float radicalInverse_VdC( uint bits ) {

			bits = ( bits << 16u ) | ( bits >> 16u );
			bits = ( ( bits & 0x55555555u ) << 1u ) | ( ( bits & 0xAAAAAAAAu ) >> 1u );
			bits = ( ( bits & 0x33333333u ) << 2u ) | ( ( bits & 0xCCCCCCCCu ) >> 2u );
			bits = ( ( bits & 0x0F0F0F0Fu ) << 4u ) | ( ( bits & 0xF0F0F0F0u ) >> 4u );
			bits = ( ( bits & 0x00FF00FFu ) << 8u ) | ( ( bits & 0xFF00FF00u ) >> 8u );
			return float( bits ) * 2.3283064365386963e-10; // / 0x100000000

		}

		// Hammersley sequence
		vec2 hammersley( uint i, uint N ) {

			return vec2( float( i ) / float( N ), radicalInverse_VdC( i ) );

		}

		void main() {

			vec3 N = normalize( vWorldDirection );

			// For very low roughness, just sample the environment directly
			if ( roughness < 0.001 ) {

				gl_FragColor = vec4( textureLod( envMap, N, 0.0 ).rgb, 1.0 );
				return;

			}

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			// Tangent space basis for VNDF sampling
			vec3 up = abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, N ) );
			vec3 bitangent = cross( N, tangent );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			for ( uint i = 0u; i < GGX_SAMPLES; i ++ ) {

				vec2 Xi = hammersley( i, GGX_SAMPLES );

				// With V = N, sample the reflected direction directly.
				float invQ = 1.0 / ( 1.0 - Xi.x + alpha2 * Xi.x );
				float NdotL = ( 1.0 - Xi.x - alpha2 * Xi.x ) * invQ;

				if ( NdotL > 0.0 ) {

					float phi = 2.0 * PI * Xi.y;
					float sinTheta = 2.0 * alpha * sqrt( Xi.x * ( 1.0 - Xi.x ) ) * invQ;
					vec3 L = N * NdotL + ( tangent * cos( phi ) + bitangent * sin( phi ) ) * sinTheta;

					// Match the source mip to the sample's solid angle. The terms
					// independent of the sample are precomputed in lodBias.
					float d = alpha2 * invQ;
					float lod = max( log2( d ) + lodBias, 0.0 );

					// Weight by NdotL for the split-sum approximation
					prefilteredColor += textureLod( envMap, L, lod ).rgb * NdotL;
					totalWeight += NdotL;

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function ng(){return Dr("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:Au}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float sourceLod;
		uniform int sourceSize;

		void main() {

			vec3 N = normalize( vWorldDirection );

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			float texelSize = 2.0 / float( sourceSize );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			// Pair opposite texels: only the one in N's hemisphere contributes.
			for ( int face = 0; face < 3; face ++ ) {

				for ( int y = 0; y < sourceSize; y ++ ) {

					for ( int x = 0; x < sourceSize; x ++ ) {

						vec2 uv = ( vec2( x, y ) + 0.5 ) * texelSize - 1.0;
						vec3 texelDirection = face == 0 ? vec3( 1.0, uv ) : ( face == 1 ? vec3( uv.x, 1.0, uv.y ) : vec3( uv, 1.0 ) );

						float invDistance = inversesqrt( 1.0 + dot( uv, uv ) );
						float NdotL = dot( N, texelDirection );
						texelDirection *= NdotL < 0.0 ? - 1.0 : 1.0;
						NdotL = abs( NdotL ) * invDistance;

						// With V = N, NdotH squared is ( 1 + NdotL ) / 2. Common factors
						// in the GGX distribution and texel solid angle cancel when normalized.
						float d = 1.0 + alpha2 + ( alpha2 - 1.0 ) * NdotL;
						float weight = NdotL * invDistance * invDistance * invDistance / ( d * d );

						prefilteredColor += textureLod( envMap, texelDirection, sourceLod ).rgb * weight;
						totalWeight += weight;

					}

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function sg(){return Dr("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${jm}
		#define GOLDEN_ANGLE 2.39996322973

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float sigma;

		#include <common>

		void main() {

			vec3 outputDirection = normalize( vWorldDirection );

			vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, outputDirection ) );
			vec3 bitangent = cross( outputDirection, tangent );

			// Truncate the kernel at three standard deviations or at the antipode.
			float thetaMax = min( 3.0 * sigma, PI );
			float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

			vec3 accumColor = vec3( 0.0 );
			float accumWeight = 0.0;

			for ( int i = 0; i < SAMPLES; i ++ ) {

				// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
				float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
				float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
				float phi = float( i ) * GOLDEN_ANGLE;

				vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
				vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

				// Correct the planar sample density to solid angle.
				float weight = sin( theta ) / theta;

				accumColor += weight * textureLod( envMap, sampleDirection, 0.0 ).rgb;
				accumWeight += weight;

			}

			gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

		}
	`)}function su(){return Dr("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

		varying vec3 vWorldDirection;

		uniform sampler2D envMap;

		#include <common>

		void main() {

			// Average four subpixel samples to preserve small, bright features.
			vec3 direction = normalize( vWorldDirection );
			vec3 dx = dFdx( direction ) * 0.25;
			vec3 dy = dFdy( direction ) * 0.25;

			vec3 color = textureLod( envMap, equirectUv( normalize( direction - dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction - dx + dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx + dy ) ), 0.0 ).rgb;
			gl_FragColor = vec4( color * 0.25, 1.0 );

		}
	`)}function ru(){return Dr("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function rg(n){let e=new WeakMap,t=new WeakMap,i=null;function s(u,p=!1){return u==null?null:p?a(u):r(u)}function r(u){if(u&&u.isTexture){let p=u.mapping;if(p===$a||p===Za)if(e.has(u)){let _=e.get(u).texture;return o(_,u.mapping)}else{let _=u.image;if(_&&_.height>0){let M=new Lr(_.height);return M.fromEquirectangularTexture(n,u),e.set(u,M),u.addEventListener("dispose",l),o(M.texture,u.mapping)}else return null}}return u}function a(u){if(u&&u.isTexture&&u.isPMREMTexture!==!0){let p=u.mapping,_=p===$a||p===Za,M=p===Wn||p===Rs;if(_||M){let m=t.get(u),g=m!==void 0?m.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==g)return i===null&&(i=new Bo(n)),m=_?i.fromEquirectangular(u,m):i.fromCubemap(u,m),m.texture.pmremVersion=u.pmremVersion,t.set(u,m),m.texture;if(m!==void 0)return m.texture;{let S=u.image;return _&&S&&S.height>0||M&&S&&c(S)?(i===null&&(i=new Bo(n)),m=_?i.fromEquirectangular(u):i.fromCubemap(u),m.texture.pmremVersion=u.pmremVersion,t.set(u,m),u.addEventListener("dispose",h),m.texture):null}}}return u}function o(u,p){return p===$a?u.mapping=Wn:p===Za&&(u.mapping=Rs),u}function c(u){let p=0,_=6;for(let M=0;M<_;M++)u[M]!==void 0&&p++;return p===_}function l(u){let p=u.target;p.removeEventListener("dispose",l);let _=e.get(p);_!==void 0&&(e.delete(p),_.dispose())}function h(u){let p=u.target;p.removeEventListener("dispose",h);let _=t.get(p);_!==void 0&&(t.delete(p),_.dispose())}function f(){e=new WeakMap,t=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:s,dispose:f}}function ag(n){let e={};function t(i){if(e[i]!==void 0)return e[i];let s=n.getExtension(i);return e[i]=s,s}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){let s=t(i);return s===null&&qs("WebGLRenderer: "+i+" extension not supported."),s}}}function og(n,e,t,i){let s={},r=new WeakMap,a=new FinalizationRegistry(_=>delete s[_]);function o(_){c(_.target)}function c(_){_.index!==null&&e.remove(_.index);for(let m in _.attributes)e.remove(_.attributes[m]);_.removeEventListener("dispose",o),delete s[_.id],a.unregister(_);let M=r.get(_);M&&(e.remove(M),r.delete(_)),i.releaseStatesOfGeometry(_),_.isInstancedBufferGeometry===!0&&delete _._maxInstanceCount,t.memory.geometries--}function l(_,M){return s[M.id]!==void 0||(M.addEventListener("dispose",o),s[M.id]=new WeakRef(M),a.register(M,M.id,M),t.memory.geometries++),M}function h(_){let M=_.attributes;for(let m in M)e.update(M[m],n.ARRAY_BUFFER)}function f(_){let M=_.index,m=_.attributes.position,g=0;if(m===void 0)return;let S=M!==null?M.array.length:m.array.length/3-1,A=m.count>=65535?nr:ir,b=new A(Math.ceil(S/3)*6,1),E=b.array;if(M!==null){let d=M.array;g=M.version;for(let v=0,P=0;v<S;v+=3){let C=d[v+0],D=d[v+1],N=d[v+2];E[P++]=C,E[P++]=D,E[P++]=D,E[P++]=N,E[P++]=N,E[P++]=C}}else{g=m.version;for(let d=0,v=0;d<S;d+=3){let P=d+0,C=d+1,D=d+2;E[v++]=P,E[v++]=C,E[v++]=C,E[v++]=D,E[v++]=D,E[v++]=P}}b.version=g;let T=r.get(_);T&&e.remove(T),r.set(_,b)}function u(_){let M=r.get(_);if(M){let m=_.index;m!==null&&M.version<m.version&&f(_)}else f(_);return r.get(_)}function p(){for(let _ in s){let M=s[_].deref();M!==void 0&&c(M)}}return{get:l,update:h,getWireframeAttribute:u,dispose:p}}function lg(n,e,t){let i;function s(f){i=f}let r,a;function o(f){r=f.type,a=f.bytesPerElement}function c(f,u){n.drawElements(i,u,r,f*a),t.update(u,i,1)}function l(f,u,p){p!==0&&(n.drawElementsInstanced(i,u,r,f*a,p),t.update(u,i,p))}function h(f,u,p){if(p===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,u,0,r,f,0,p);let M=0;for(let m=0;m<p;m++)M+=u[m];t.update(M,i,1)}this.setMode=s,this.setIndex=o,this.render=c,this.renderInstances=l,this.renderMultiDraw=h}function cg(n){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,a,o){switch(t.calls++,a){case n.TRIANGLES:t.triangles+=o*(r/3);break;case n.LINES:t.lines+=o*(r/2);break;case n.LINE_STRIP:t.lines+=o*(r-1);break;case n.LINE_LOOP:t.lines+=o*r;break;case n.POINTS:t.points+=o*r;break;default:De("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:i}}function hg(n,e,t){let i=new WeakMap,s=new _t;function r(a,o,c){let l=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,f=h!==void 0?h.length:0,u=i.get(o);if(u===void 0||u.count!==f){let P=function(){d.dispose(),i.delete(o),o.removeEventListener("dispose",P)};u!==void 0&&u.texture.dispose();let p=o.morphAttributes.position!==void 0,_=o.morphAttributes.normal!==void 0,M=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],g=o.morphAttributes.normal||[],S=o.morphAttributes.color||[],A=0;p===!0&&(A=1),_===!0&&(A=2),M===!0&&(A=3);let b=o.attributes.position.count*A,E=1;b>e.maxTextureSize&&(E=Math.ceil(b/e.maxTextureSize),b=e.maxTextureSize);let T=new Float32Array(b*E*4*f),d=new Qs(T,b,E,f);d.type=xi,d.needsUpdate=!0;let v=A*4;for(let C=0;C<f;C++){let D=m[C],N=g[C],V=S[C],R=b*E*4*C;for(let k=0;k<D.count;k++){let q=k*v;p===!0&&(s.fromBufferAttribute(D,k),T[R+q+0]=s.x,T[R+q+1]=s.y,T[R+q+2]=s.z,T[R+q+3]=0),_===!0&&(s.fromBufferAttribute(N,k),T[R+q+4]=s.x,T[R+q+5]=s.y,T[R+q+6]=s.z,T[R+q+7]=0),M===!0&&(s.fromBufferAttribute(V,k),T[R+q+8]=s.x,T[R+q+9]=s.y,T[R+q+10]=s.z,T[R+q+11]=V.itemSize===4?s.w:1)}}u={count:f,texture:d,size:new He(b,E)},i.set(o,u),o.addEventListener("dispose",P)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)c.getUniforms().setValue(n,"morphTexture",a.morphTexture,t);else{let p=0;for(let M=0;M<l.length;M++)p+=l[M];let _=o.morphTargetsRelative?1:1-p;c.getUniforms().setValue(n,"morphTargetBaseInfluence",_),c.getUniforms().setValue(n,"morphTargetInfluences",l)}c.getUniforms().setValue(n,"morphTargetsTexture",u.texture,t),c.getUniforms().setValue(n,"morphTargetsTextureSize",u.size)}return{update:r}}function ug(n,e,t,i,s){let r=new WeakMap;function a(l){let h=s.render.frame,f=l.geometry,u=e.get(l,f);if(r.get(u)!==h&&(e.update(u),r.set(u,h)),l.isInstancedMesh&&(l.hasEventListener("dispose",c)===!1&&l.addEventListener("dispose",c),r.get(l)!==h&&(t.update(l.instanceMatrix,n.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,n.ARRAY_BUFFER),r.set(l,h))),l.isSkinnedMesh){let p=l.skeleton;r.get(p)!==h&&(p.update(),r.set(p,h))}return u}function o(){r=new WeakMap}function c(l){let h=l.target;h.removeEventListener("dispose",c),i.releaseStatesOfObject(h),t.remove(h.instanceMatrix),h.instanceColor!==null&&t.remove(h.instanceColor)}return{update:a,dispose:o}}var dg={[Fl]:"LINEAR_TONE_MAPPING",[Ol]:"REINHARD_TONE_MAPPING",[Bl]:"CINEON_TONE_MAPPING",[Sr]:"ACES_FILMIC_TONE_MAPPING",[kl]:"AGX_TONE_MAPPING",[Gl]:"NEUTRAL_TONE_MAPPING",[zl]:"CUSTOM_TONE_MAPPING"};function fg(n,e,t,i,s,r){let a=new ci(e,t,{type:n,depthBuffer:s,stencilBuffer:r,samples:i?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,c=null,l=null,h=new wi;h.setAttribute("position",new yt([-1,3,0,-1,-1,0,3,-1,0],3)),h.setAttribute("uv",new yt([0,2,0,0,2,0],2));let f=new Da({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),u=new ti(h,f),p=new vr(-1,1,1,-1,0,1),_=null,M=null,m=!1,g,S=null,A=[],b=!1;this.setSize=function(E,T){a.setSize(E,T),o!==null&&o.setSize(E,T),c!==null&&c.setSize(E,T);for(let d=0;d<A.length;d++){let v=A[d];v.setSize&&v.setSize(E,T)}},this.setEffects=function(E){A=E,b=A.length>0&&A[0].isRenderPass===!0;let T=a.width,d=a.height;A.length>0&&o===null&&(o=new ci(T,d,{type:Ei,depthBuffer:!1,stencilBuffer:!1}),c=new ci(T,d,{type:Ei,depthBuffer:!1,stencilBuffer:!1}));let v=s===!0&&A.some(P=>P.needsDepthTexture===!0);v!==(a.depthTexture!==null)&&(v===!0&&l===null&&(l=new nn(T,d),r===!0&&(l.format=rn,l.type=Xn)),a.dispose(),a.depthTexture=v?l:null,a.resolveDepthBuffer=v,a.storeMultisampledDepthBuffer=v);for(let P=0;P<A.length;P++){let C=A[P];C.setSize&&C.setSize(T,d),v&&C.needsDepthTexture===!0&&C.setDepthTexture&&C.setDepthTexture(l)}},this.begin=function(E,T){if(m||E.toneMapping===Gi&&A.length===0)return!1;if(S=T,T!==null){let d=T.width,v=T.height;(a.width!==d||a.height!==v)&&this.setSize(d,v)}return b===!1&&E.setRenderTarget(a),g=E.toneMapping,E.toneMapping=Gi,!0},this.hasRenderPass=function(){return b},this.end=function(E,T){E.toneMapping=g,m=!0;let d=a,v=o;for(let P=0;P<A.length;P++){let C=A[P];C.enabled!==!1&&(C.render(E,v,d,T),C.needsSwap!==!1&&(d=v,v=v===o?c:o))}if(_!==E.outputColorSpace||M!==E.toneMapping){_=E.outputColorSpace,M=E.toneMapping,f.defines={},Je.getTransfer(_)===nt&&(f.defines.SRGB_TRANSFER="");let P=dg[M];P&&(f.defines[P]=""),f.needsUpdate=!0}f.uniforms.tDiffuse.value=d.texture,E.setRenderTarget(S),E.render(u,p),S=null,m=!1},this.isCompositing=function(){return m},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),c!==null&&c.dispose(),h.dispose(),f.dispose()}}var Eu=new ei,Cu=new nn(1,1),Ru=new cr(1),Iu=new Qs,Pu=new Ia,Lu=new lr,au=[],ou=[],lu=new Float32Array(16),cu=new Float32Array(9),hu=new Float32Array(4);function Ds(n,e,t){let i=n[0];if(i<=0||i>0)return n;let s=e*t,r=au[s];if(r===void 0&&(r=new Float32Array(s),au[s]=r),e!==0){i.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,n[a].toArray(r,o)}return r}function Et(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function Ct(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function ko(n,e){let t=ou[e];t===void 0&&(t=new Int32Array(e),ou[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function pg(n,e){let t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function mg(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Et(t,e))return;n.uniform2fv(this.addr,e),Ct(t,e)}}function gg(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Et(t,e))return;n.uniform3fv(this.addr,e),Ct(t,e)}}function _g(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Et(t,e))return;n.uniform4fv(this.addr,e),Ct(t,e)}}function xg(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Et(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),Ct(t,e)}else{if(Et(t,i))return;hu.set(i),n.uniformMatrix2fv(this.addr,!1,hu),Ct(t,i)}}function vg(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Et(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),Ct(t,e)}else{if(Et(t,i))return;cu.set(i),n.uniformMatrix3fv(this.addr,!1,cu),Ct(t,i)}}function yg(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Et(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),Ct(t,e)}else{if(Et(t,i))return;lu.set(i),n.uniformMatrix4fv(this.addr,!1,lu),Ct(t,i)}}function Mg(n,e){let t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function Sg(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Et(t,e))return;n.uniform2iv(this.addr,e),Ct(t,e)}}function bg(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Et(t,e))return;n.uniform3iv(this.addr,e),Ct(t,e)}}function Tg(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Et(t,e))return;n.uniform4iv(this.addr,e),Ct(t,e)}}function wg(n,e){let t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function Ag(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Et(t,e))return;n.uniform2uiv(this.addr,e),Ct(t,e)}}function Eg(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Et(t,e))return;n.uniform3uiv(this.addr,e),Ct(t,e)}}function Cg(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Et(t,e))return;n.uniform4uiv(this.addr,e),Ct(t,e)}}function Go(n){return n.version===0&&(n.compareFunction=Kl,n.needsUpdate=!0),n}function Rg(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_2D_SHADOW?r=Go(Cu):r=Eu,t.setTexture2D(e||r,s)}function Ig(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture3D(e||Pu,s)}function Pg(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_CUBE_SHADOW?r=Go(Ru):r=Lu,t.setTextureCube(e||r,s)}function Lg(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture2DArray(e||Iu,s)}function Dg(n){switch(n){case 5126:return pg;case 35664:return mg;case 35665:return gg;case 35666:return _g;case 35674:return xg;case 35675:return vg;case 35676:return yg;case 5124:case 35670:return Mg;case 35667:case 35671:return Sg;case 35668:case 35672:return bg;case 35669:case 35673:return Tg;case 5125:return wg;case 36294:return Ag;case 36295:return Eg;case 36296:return Cg;case 35678:case 36198:case 36298:case 36306:case 35682:return Rg;case 35679:case 36299:case 36307:return Ig;case 35680:case 36300:case 36308:case 36293:return Pg;case 36289:case 36303:case 36311:case 36292:return Lg}}function Ng(n,e){n.uniform1fv(this.addr,e)}function Ug(n,e){let t=Ds(e,this.size,2);n.uniform2fv(this.addr,t)}function Fg(n,e){let t=Ds(e,this.size,3);n.uniform3fv(this.addr,t)}function Og(n,e){let t=Ds(e,this.size,4);n.uniform4fv(this.addr,t)}function Bg(n,e){let t=Ds(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function zg(n,e){let t=Ds(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function kg(n,e){let t=Ds(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function Gg(n,e){n.uniform1iv(this.addr,e)}function Vg(n,e){n.uniform2iv(this.addr,e)}function Hg(n,e){n.uniform3iv(this.addr,e)}function Wg(n,e){n.uniform4iv(this.addr,e)}function Xg(n,e){n.uniform1uiv(this.addr,e)}function qg(n,e){n.uniform2uiv(this.addr,e)}function Yg(n,e){n.uniform3uiv(this.addr,e)}function $g(n,e){n.uniform4uiv(this.addr,e)}function Zg(n,e,t){let i=this.cache,s=e.length,r=ko(t,s);Et(i,r)||(n.uniform1iv(this.addr,r),Ct(i,r));let a;this.type===n.SAMPLER_2D_SHADOW?a=Go(Cu):a=Eu;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||a,r[o])}function Jg(n,e,t){let i=this.cache,s=e.length,r=ko(t,s);Et(i,r)||(n.uniform1iv(this.addr,r),Ct(i,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||Pu,r[a])}function Kg(n,e,t){let i=this.cache,s=e.length,r=ko(t,s);Et(i,r)||(n.uniform1iv(this.addr,r),Ct(i,r));let a;this.type===n.SAMPLER_CUBE_SHADOW?a=Go(Ru):a=Lu;for(let o=0;o!==s;++o)t.setTextureCube(e[o]||a,r[o])}function jg(n,e,t){let i=this.cache,s=e.length,r=ko(t,s);Et(i,r)||(n.uniform1iv(this.addr,r),Ct(i,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||Iu,r[a])}function Qg(n){switch(n){case 5126:return Ng;case 35664:return Ug;case 35665:return Fg;case 35666:return Og;case 35674:return Bg;case 35675:return zg;case 35676:return kg;case 5124:case 35670:return Gg;case 35667:case 35671:return Vg;case 35668:case 35672:return Hg;case 35669:case 35673:return Wg;case 5125:return Xg;case 36294:return qg;case 36295:return Yg;case 36296:return $g;case 35678:case 36198:case 36298:case 36306:case 35682:return Zg;case 35679:case 36299:case 36307:return Jg;case 35680:case 36300:case 36308:case 36293:return Kg;case 36289:case 36303:case 36311:case 36292:return jg}}var cc=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=Dg(t.type)}},hc=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Qg(t.type)}},uc=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(e,t[o.id],i)}}},oc=/(\w+)(\])?(\[|\.)?/g;function uu(n,e){n.seq.push(e),n.map[e.id]=e}function e0(n,e,t){let i=n.name,s=i.length;for(oc.lastIndex=0;;){let r=oc.exec(i),a=oc.lastIndex,o=r[1],c=r[2]==="]",l=r[3];if(c&&(o=o|0),l===void 0||l==="["&&a+2===s){uu(t,l===void 0?new cc(o,n,e):new hc(o,n,e));break}else{let f=t.map[o];f===void 0&&(f=new uc(o),uu(t,f)),t=f}}}var Ls=class{constructor(e,t){this.seq=[],this.map={};let i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<i;++a){let o=e.getActiveUniform(t,a),c=e.getUniformLocation(t,o.name);e0(o,c,this)}let s=[],r=[];for(let a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,i,s){let r=this.map[t];r!==void 0&&r.setValue(e,i,s)}setOptional(e,t,i){let s=t[i];s!==void 0&&this.setValue(e,i,s)}static upload(e,t,i,s){for(let r=0,a=t.length;r!==a;++r){let o=t[r],c=i[o.id];c.needsUpdate!==!1&&o.setValue(e,c.value,s)}}static seqWithValue(e,t){let i=[];for(let s=0,r=e.length;s!==r;++s){let a=e[s];a.id in t&&i.push(a)}return i}};function du(n,e,t){let i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}var t0=37297,i0=0;function n0(n,e){let t=n.split(`
`),i=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){let o=a+1;i.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return i.join(`
`)}var fu=new Ne;function s0(n){Je._getMatrix(fu,Je.workingColorSpace,n);let e=`mat3( ${fu.elements.map(t=>t.toFixed(4))} )`;switch(Je.getTransfer(n)){case Ks:return[e,"LinearTransferOETF"];case nt:return[e,"sRGBTransferOETF"];default:return Ie("WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function pu(n,e,t){let i=n.getShaderParameter(e,n.COMPILE_STATUS),r=(n.getShaderInfoLog(e)||"").trim();if(i&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+n0(n.getShaderSource(e),o)}else return r}function r0(n,e){let t=s0(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( ${t[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}var a0={[Fl]:"Linear",[Ol]:"Reinhard",[Bl]:"Cineon",[Sr]:"ACESFilmic",[kl]:"AgX",[Gl]:"Neutral",[zl]:"Custom"};function o0(n,e){let t=a0[e];return t===void 0?(Ie("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+n+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var Oo=new B;function l0(){Je.getLuminanceCoefficients(Oo);let n=Oo.x.toFixed(4),e=Oo.y.toFixed(4),t=Oo.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function c0(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Pr).join(`
`)}function h0(n){let e=[];for(let t in n){let i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function u0(n,e){let t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){let r=n.getActiveAttrib(e,s),a=r.name,o=1;r.type===n.FLOAT_MAT2&&(o=2),r.type===n.FLOAT_MAT3&&(o=3),r.type===n.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:n.getAttribLocation(e,a),locationSize:o}}return t}function Pr(n){return n!==""}function mu(n,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,e.numLightProbeGrids)}function gu(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var d0=/^[ \t]*#include +<([\w\d./]+)>/gm;function dc(n){return n.replace(d0,f0)}function f0(n,e){let t=We[e];if(t===void 0)throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">");return dc(t)}var p0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function _u(n){return n.replace(p0,m0)}function m0(n,e,t,i){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function xu(n){let e=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?e+=`
#define HIGH_PRECISION`:n.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}var g0={[Gn]:"SHADOWMAP_TYPE_PCF",[Es]:"SHADOWMAP_TYPE_VSM"};function _0(n){return g0[n.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var x0={[Rs]:"ENVMAP_MODE_REFRACTION"};function v0(n){return n.envMap===!1?"ENVMAP_MODE_REFLECTION":x0[n.envMapMode]||"ENVMAP_MODE_REFLECTION"}var y0={[Ul]:"ENVMAP_BLENDING_MULTIPLY",[Nh]:"ENVMAP_BLENDING_MIX",[Uh]:"ENVMAP_BLENDING_ADD"};function M0(n){return n.envMap===!1?"ENVMAP_BLENDING_NONE":y0[n.combine]||"ENVMAP_BLENDING_NONE"}function S0(n,e,t,i){let s=n.getContext(),r=t.defines,a=t.vertexShader,o=t.fragmentShader,c=_0(t),l=t.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",h=v0(t),f=M0(t),u=c0(t),p=h0(r),_=s.createProgram(),M,m,g=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(M=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p].filter(Pr).join(`
`),M.length>0&&(M+=`
`),m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p].filter(Pr).join(`
`),m.length>0&&(m+=`
`)):(M=[xu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+t.diffuseRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Pr).join(`
`),m=[xu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+h:"",t.envMap?"#define "+f:"",t.envMapPMREM?"#define ENVMAP_MAX_LOD "+t.envMapMaxLod+".0":"",t.envMapPMREM?"#define ENVMAP_SIZE "+t.envMapSize+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Gi?"#define TONE_MAPPING":"",t.toneMapping!==Gi?We.tonemapping_pars_fragment:"",t.toneMapping!==Gi?o0("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",We.colorspace_pars_fragment,r0("linearToOutputTexel",t.outputColorSpace),l0(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Pr).join(`
`)),a=dc(a),a=mu(a,t),a=gu(a,t),o=dc(o),o=mu(o,t),o=gu(o,t),a=_u(a),o=_u(o),t.isRawShaderMaterial!==!0&&(g=`#version 300 es
`,M=[u,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+M,m=["#define varying in",t.glslVersion===jl?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===jl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);let S=g+M+a,A=g+m+o,b=du(s,s.VERTEX_SHADER,S),E=du(s,s.FRAGMENT_SHADER,A);s.attachShader(_,b),s.attachShader(_,E),t.index0AttributeName!==void 0?s.bindAttribLocation(_,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(_,0,"position"),s.linkProgram(_);function T(C){if(n.debug.checkShaderErrors){let D=s.getProgramInfoLog(_)||"",N=s.getShaderInfoLog(b)||"",V=s.getShaderInfoLog(E)||"",R=D.trim(),k=N.trim(),q=V.trim(),G=!0,te=!0;if(s.getProgramParameter(_,s.LINK_STATUS)===!1)if(G=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,_,b,E);else{let W=pu(s,b,"vertex"),j=pu(s,E,"fragment");De("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(_,s.VALIDATE_STATUS)+`

Material Name: `+C.name+`
Material Type: `+C.type+`

Program Info Log: `+R+`
`+W+`
`+j)}else R!==""?Ie("WebGLProgram: Program Info Log:",R):(k===""||q==="")&&(te=!1);te&&(C.diagnostics={runnable:G,programLog:R,vertexShader:{log:k,prefix:M},fragmentShader:{log:q,prefix:m}})}s.deleteShader(b),s.deleteShader(E),d=new Ls(s,_),v=u0(s,_)}let d;this.getUniforms=function(){return d===void 0&&T(this),d};let v;this.getAttributes=function(){return v===void 0&&T(this),v};let P=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return P===!1&&(P=s.getProgramParameter(_,t0)),P},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(_),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=i0++,this.cacheKey=e,this.usedTimes=1,this.program=_,this.vertexShader=b,this.fragmentShader=E,this}var b0=0,fc=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,i){let s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(i)===!1&&(s.add(i),i.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){let t=this.shaderCache,i=t.get(e);return i===void 0&&(i=new pc(e),t.set(e,i)),i}},pc=class{constructor(e){this.id=b0++,this.code=e,this.usedTimes=0}};function T0(n){return n===In||n===Cr||n===Rr}function w0(n,e,t,i,s,r){let a=new Ss,o=new fc,c=new Set,l=[],h=new Map,f=i.logarithmicDepthBuffer,u={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function p(d){return c.add(d),d===0?"uv":`uv${d}`}function _(d,v,P,C,D,N){let V=C.fog,R=D.geometry,k=d.isMeshStandardMaterial||d.isMeshLambertMaterial||d.isMeshPhongMaterial?C.environment:null,q=d.isMeshStandardMaterial||d.isMeshLambertMaterial&&!d.envMap||d.isMeshPhongMaterial&&!d.envMap,G=e.get(d.envMap||k,q),te=u[d.type],W=i.precision;d.precision!==null&&(W=i.getMaxPrecision(d.precision),W!==d.precision&&Ie("WebGLProgram.getParameters:",d.precision,"not supported, using",W,"instead."));let j=R.morphAttributes.position||R.morphAttributes.normal||R.morphAttributes.color,ee=j!==void 0?j.length:0,Te=0;R.morphAttributes.position!==void 0&&(Te=1),R.morphAttributes.normal!==void 0&&(Te=2),R.morphAttributes.color!==void 0&&(Te=3);let Oe,Z,me,ve;if(te){let fe=Hi[te];Oe=fe.vertexShader,Z=fe.fragmentShader}else{Oe=d.vertexShader,Z=d.fragmentShader;let fe=o.getVertexShaderStage(d),rt=o.getFragmentShaderStage(d);o.update(d,fe,rt),me=fe.id,ve=rt.id}let Ce=n.getRenderTarget(),ge=n.state.buffers.depth.getReversed(),ze=D.isInstancedMesh===!0,Mt=D.isBatchedMesh===!0,Le=!!d.map,st=!!d.matcap,ct=!!G,qe=ct&&G.isPMREMTexture===!0,Ot=!!d.aoMap,wt=!!d.lightMap,Kt=!!d.bumpMap&&d.wireframe===!1,xt=!!d.normalMap,Li=!!d.displacementMap,Rt=!!d.emissiveMap,ui=!!d.metalnessMap,di=!!d.roughnessMap,fi=d.anisotropy>0,U=d.clearcoat>0,pi=d.diffuseRoughness>0,mt=d.dispersion>0,gt=d.retroreflectivity>0,de=d.iridescence>0,At=d.sheen>0,Re=d.transmission>0,Ue=fi&&!!d.anisotropyMap,w=U&&!!d.clearcoatMap,x=U&&!!d.clearcoatNormalMap,O=U&&!!d.clearcoatRoughnessMap,ie=pi&&!!d.diffuseRoughnessMap,K=de&&!!d.iridescenceMap,re=de&&!!d.iridescenceThicknessMap,he=At&&!!d.sheenColorMap,Y=At&&!!d.sheenRoughnessMap,$=!!d.specularMap,oe=!!d.specularColorMap,I=!!d.specularIntensityMap,J=Re&&!!d.transmissionMap,X=Re&&!!d.thicknessMap,le=!!d.gradientMap,se=!!d.alphaMap,ae=d.alphaTest>0,Ae=!!d.alphaHash,Ve=!!d.extensions,ne=Gi;d.toneMapped&&(Ce===null||Ce.isXRRenderTarget===!0)&&(ne=n.toneMapping);let Ee=qe?G.isCompressedCubeTexture?G.image[0].mipmaps:G.mipmaps:null,Ge={shaderID:te,shaderType:d.type,shaderName:d.name,vertexShader:Oe,fragmentShader:Z,defines:d.defines,customVertexShaderID:me,customFragmentShaderID:ve,isRawShaderMaterial:d.isRawShaderMaterial===!0,glslVersion:d.glslVersion,precision:W,batching:Mt,batchingColor:Mt&&D._colorsTexture!==null,instancing:ze,instancingColor:ze&&D.instanceColor!==null,instancingMorph:ze&&D.morphTexture!==null,outputColorSpace:Ce===null?n.outputColorSpace:Ce.isXRRenderTarget===!0?Ce.texture.colorSpace:Je.workingColorSpace,alphaToCoverage:!!d.alphaToCoverage,map:Le,matcap:st,envMap:ct,envMapMode:ct&&G.mapping,envMapPMREM:qe,envMapMaxLod:qe?Ee.length-1:null,envMapSize:qe?Ee[0].width:null,aoMap:Ot,lightMap:wt,bumpMap:Kt,normalMap:xt,displacementMap:Li,emissiveMap:Rt,normalMapObjectSpace:xt&&d.normalMapType===Bh,normalMapTangentSpace:xt&&d.normalMapType===Uo,packedNormalMap:xt&&d.normalMapType===Uo&&T0(d.normalMap.format),metalnessMap:ui,roughnessMap:di,anisotropy:fi,anisotropyMap:Ue,clearcoat:U,clearcoatMap:w,clearcoatNormalMap:x,clearcoatRoughnessMap:O,diffuseRoughness:pi,diffuseRoughnessMap:ie,dispersion:mt,retroreflection:gt,iridescence:de,iridescenceMap:K,iridescenceThicknessMap:re,sheen:At,sheenColorMap:he,sheenRoughnessMap:Y,specularMap:$,specularColorMap:oe,specularIntensityMap:I,transmission:Re,transmissionMap:J,thicknessMap:X,gradientMap:le,opaque:d.transparent===!1&&d.blending===Cs&&d.alphaToCoverage===!1,alphaMap:se,alphaTest:ae,alphaHash:Ae,combine:d.combine,mapUv:Le&&p(d.map.channel),aoMapUv:Ot&&p(d.aoMap.channel),lightMapUv:wt&&p(d.lightMap.channel),bumpMapUv:Kt&&p(d.bumpMap.channel),normalMapUv:xt&&p(d.normalMap.channel),displacementMapUv:Li&&p(d.displacementMap.channel),emissiveMapUv:Rt&&p(d.emissiveMap.channel),metalnessMapUv:ui&&p(d.metalnessMap.channel),roughnessMapUv:di&&p(d.roughnessMap.channel),anisotropyMapUv:Ue&&p(d.anisotropyMap.channel),clearcoatMapUv:w&&p(d.clearcoatMap.channel),clearcoatNormalMapUv:x&&p(d.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:O&&p(d.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:ie&&p(d.diffuseRoughnessMap.channel),iridescenceMapUv:K&&p(d.iridescenceMap.channel),iridescenceThicknessMapUv:re&&p(d.iridescenceThicknessMap.channel),sheenColorMapUv:he&&p(d.sheenColorMap.channel),sheenRoughnessMapUv:Y&&p(d.sheenRoughnessMap.channel),specularMapUv:$&&p(d.specularMap.channel),specularColorMapUv:oe&&p(d.specularColorMap.channel),specularIntensityMapUv:I&&p(d.specularIntensityMap.channel),transmissionMapUv:J&&p(d.transmissionMap.channel),thicknessMapUv:X&&p(d.thicknessMap.channel),alphaMapUv:se&&p(d.alphaMap.channel),vertexTangents:!!R.attributes.tangent&&(xt||fi),vertexNormals:!!R.attributes.normal,vertexColors:d.vertexColors,vertexAlphas:d.vertexColors===!0&&!!R.attributes.color&&R.attributes.color.itemSize===4,pointsUvs:D.isPoints===!0&&!!R.attributes.uv&&(Le||se),fog:!!V,useFog:d.fog===!0,fogExp2:!!V&&V.isFogExp2,flatShading:d.wireframe===!1&&(d.flatShading===!0||R.attributes.normal===void 0&&xt===!1&&(d.isMeshLambertMaterial||d.isMeshPhongMaterial||d.isMeshStandardMaterial||d.isMeshPhysicalMaterial)),sizeAttenuation:d.sizeAttenuation===!0,logarithmicDepthBuffer:f,reversedDepthBuffer:ge,skinning:D.isSkinnedMesh===!0,hasPositionAttribute:R.attributes.position!==void 0,morphTargets:R.morphAttributes.position!==void 0,morphNormals:R.morphAttributes.normal!==void 0,morphColors:R.morphAttributes.color!==void 0,morphTargetsCount:ee,morphTextureStride:Te,numSunLights:v.sun.length,numDirLights:v.directional.length,numPointLights:v.point.length,numSpotLights:v.spot.length,numSpotLightMaps:v.spotLightMap.length,numRectAreaLights:v.rectArea.length,numHemiLights:v.hemi.length,numSunLightShadows:v.sunShadowMap.length,numDirLightShadows:v.directionalShadowMap.length,numPointLightShadows:v.pointShadowMap.length,numSpotLightShadows:v.spotShadowMap.length,numSpotLightShadowsWithMaps:v.numSpotLightShadowsWithMaps,numLightProbes:v.numLightProbes,numLightProbeGrids:N.filter(fe=>fe.texture!==null).length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:d.dithering,shadowMapEnabled:n.shadowMap.enabled&&P.length>0,shadowMapType:n.shadowMap.type,toneMapping:ne,decodeVideoTexture:Le&&d.map.isVideoTexture===!0&&Je.getTransfer(d.map.colorSpace)===nt,decodeVideoTextureEmissive:Rt&&d.emissiveMap.isVideoTexture===!0&&Je.getTransfer(d.emissiveMap.colorSpace)===nt,premultipliedAlpha:d.premultipliedAlpha,doubleSided:d.side===ii,flipSided:d.side===Zt,useDepthPacking:d.depthPacking>=0,depthPacking:d.depthPacking||0,index0AttributeName:d.index0AttributeName,extensionClipCullDistance:Ve&&d.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ve&&d.extensions.multiDraw===!0||Mt)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:d.customProgramCacheKey()};return Ge.vertexUv1s=c.has(1),Ge.vertexUv2s=c.has(2),Ge.vertexUv3s=c.has(3),c.clear(),Ge}function M(d){let v=[];if(d.shaderID?v.push(d.shaderID):(v.push(d.customVertexShaderID),v.push(d.customFragmentShaderID)),d.defines!==void 0)for(let P in d.defines)v.push(P),v.push(d.defines[P]);return d.isRawShaderMaterial===!1&&(m(v,d),g(v,d),v.push(n.outputColorSpace)),v.push(d.customProgramCacheKey),v.join()}function m(d,v){d.push(v.precision),d.push(v.outputColorSpace),d.push(v.envMapMode),d.push(v.envMapPMREM),d.push(v.envMapMaxLod),d.push(v.envMapSize),d.push(v.mapUv),d.push(v.alphaMapUv),d.push(v.lightMapUv),d.push(v.aoMapUv),d.push(v.bumpMapUv),d.push(v.normalMapUv),d.push(v.displacementMapUv),d.push(v.emissiveMapUv),d.push(v.metalnessMapUv),d.push(v.roughnessMapUv),d.push(v.anisotropyMapUv),d.push(v.clearcoatMapUv),d.push(v.clearcoatNormalMapUv),d.push(v.clearcoatRoughnessMapUv),d.push(v.diffuseRoughnessMapUv),d.push(v.iridescenceMapUv),d.push(v.iridescenceThicknessMapUv),d.push(v.sheenColorMapUv),d.push(v.sheenRoughnessMapUv),d.push(v.specularMapUv),d.push(v.specularColorMapUv),d.push(v.specularIntensityMapUv),d.push(v.transmissionMapUv),d.push(v.thicknessMapUv),d.push(v.combine),d.push(v.fogExp2),d.push(v.sizeAttenuation),d.push(v.morphTargetsCount),d.push(v.numSunLights),d.push(v.numDirLights),d.push(v.numPointLights),d.push(v.numSpotLights),d.push(v.numSpotLightMaps),d.push(v.numHemiLights),d.push(v.numRectAreaLights),d.push(v.numSunLightShadows),d.push(v.numDirLightShadows),d.push(v.numPointLightShadows),d.push(v.numSpotLightShadows),d.push(v.numSpotLightShadowsWithMaps),d.push(v.numLightProbes),d.push(v.numLightProbeGrids),d.push(v.shadowMapType),d.push(v.toneMapping),d.push(v.numClippingPlanes),d.push(v.numClipIntersection),d.push(v.depthPacking)}function g(d,v){a.disableAll(),v.instancing&&a.enable(0),v.instancingColor&&a.enable(1),v.instancingMorph&&a.enable(2),v.matcap&&a.enable(3),v.envMap&&a.enable(4),v.normalMapObjectSpace&&a.enable(5),v.normalMapTangentSpace&&a.enable(6),v.clearcoat&&a.enable(7),v.iridescence&&a.enable(8),v.alphaTest&&a.enable(9),v.vertexColors&&a.enable(10),v.vertexAlphas&&a.enable(11),v.vertexUv1s&&a.enable(12),v.vertexUv2s&&a.enable(13),v.vertexUv3s&&a.enable(14),v.vertexTangents&&a.enable(15),v.anisotropy&&a.enable(16),v.alphaHash&&a.enable(17),v.batching&&a.enable(18),v.dispersion&&a.enable(19),v.retroreflection&&a.enable(24),v.diffuseRoughness&&a.enable(25),v.batchingColor&&a.enable(20),v.gradientMap&&a.enable(21),v.packedNormalMap&&a.enable(22),v.vertexNormals&&a.enable(23),d.push(a.mask),a.disableAll(),v.fog&&a.enable(0),v.useFog&&a.enable(1),v.flatShading&&a.enable(2),v.logarithmicDepthBuffer&&a.enable(3),v.reversedDepthBuffer&&a.enable(4),v.skinning&&a.enable(5),v.morphTargets&&a.enable(6),v.morphNormals&&a.enable(7),v.morphColors&&a.enable(8),v.premultipliedAlpha&&a.enable(9),v.shadowMapEnabled&&a.enable(10),v.doubleSided&&a.enable(11),v.flipSided&&a.enable(12),v.useDepthPacking&&a.enable(13),v.dithering&&a.enable(14),v.transmission&&a.enable(15),v.sheen&&a.enable(16),v.opaque&&a.enable(17),v.pointsUvs&&a.enable(18),v.decodeVideoTexture&&a.enable(19),v.decodeVideoTextureEmissive&&a.enable(20),v.alphaToCoverage&&a.enable(21),v.numLightProbeGrids>0&&a.enable(22),v.hasPositionAttribute&&a.enable(23),d.push(a.mask)}function S(d){let v=u[d.type],P;if(v){let C=Hi[v];P=Qh.clone(C.uniforms)}else P=d.uniforms;return P}function A(d,v){let P=h.get(v);return P!==void 0?++P.usedTimes:(P=new S0(n,v,d,s),l.push(P),h.set(v,P)),P}function b(d){if(--d.usedTimes===0){let v=l.indexOf(d);l[v]=l[l.length-1],l.pop(),h.delete(d.cacheKey),d.destroy()}}function E(d){o.remove(d)}function T(){o.dispose()}return{getParameters:_,getProgramCacheKey:M,getUniforms:S,acquireProgram:A,releaseProgram:b,releaseShaderCache:E,programs:l,dispose:T}}function A0(){let n=new WeakMap;function e(a){return n.has(a)}function t(a){let o=n.get(a);return o===void 0&&(o={},n.set(a,o)),o}function i(a){n.delete(a)}function s(a,o,c){n.get(a)[o]=c}function r(){n=new WeakMap}return{has:e,get:t,remove:i,update:s,dispose:r}}function E0(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.materialVariant!==e.materialVariant?n.materialVariant-e.materialVariant:n.z!==e.z?n.z-e.z:n.id-e.id}function vu(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function yu(){let n=[],e=0,t=[],i=[],s=[];function r(){e=0,t.length=0,i.length=0,s.length=0}function a(u){let p=0;return u.isInstancedMesh&&(p+=2),u.isSkinnedMesh&&(p+=1),p}function o(u,p,_,M,m,g){let S=n[e];return S===void 0?(S={id:u.id,object:u,geometry:p,material:_,materialVariant:a(u),groupOrder:M,renderOrder:u.renderOrder,z:m,group:g},n[e]=S):(S.id=u.id,S.object=u,S.geometry=p,S.material=_,S.materialVariant=a(u),S.groupOrder=M,S.renderOrder=u.renderOrder,S.z=m,S.group=g),e++,S}function c(u,p,_,M,m,g,S){S.reversedDepth===!0&&(m=-m);let A=o(u,p,_,M,m,g);_.transmission>0?i.push(A):_.transparent===!0?s.push(A):t.push(A)}function l(u,p,_,M,m,g){let S=o(u,p,_,M,m,g);_.transmission>0?i.unshift(S):_.transparent===!0?s.unshift(S):t.unshift(S)}function h(u,p){t.length>1&&t.sort(u||E0),i.length>1&&i.sort(p||vu),s.length>1&&s.sort(p||vu)}function f(){for(let u=e,p=n.length;u<p;u++){let _=n[u];if(_.id===null)break;_.id=null,_.object=null,_.geometry=null,_.material=null,_.group=null}}return{opaque:t,transmissive:i,transparent:s,init:r,push:c,unshift:l,finish:f,sort:h}}function C0(){let n=new WeakMap;function e(i,s){let r=n.get(i),a;return r===void 0?(a=new yu,n.set(i,[a])):s>=r.length?(a=new yu,r.push(a)):a=r[s],a}function t(){n=new WeakMap}return{get:e,dispose:t}}function R0(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new B,color:new ke};break;case"SpotLight":t={position:new B,direction:new B,color:new ke,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new B,color:new ke,distance:0,decay:0};break;case"HemisphereLight":t={direction:new B,skyColor:new ke,groundColor:new ke};break;case"RectAreaLight":t={color:new ke,position:new B,halfWidth:new B,halfHeight:new B};break}return n[e.id]=t,t}}}function I0(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new He};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new He};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new He,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}var P0=0;function L0(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function D0(n){let e=new R0,t=I0(),i={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)i.probe.push(new B);let s=new B,r=new lt,a=new lt;function o(l){let h=0,f=0,u=0;for(let N=0;N<9;N++)i.probe[N].set(0,0,0);let p=0,_=0,M=0,m=0,g=0,S=0,A=0,b=0,E=0,T=0,d=0,v=0,P=0,C=0;l.sort(L0);for(let N=0,V=l.length;N<V;N++){let R=l[N],k=R.color,q=R.intensity,G=R.distance,te=null;if(R.shadow&&R.shadow.map&&(R.shadow.map.texture.format===In?te=R.shadow.map.texture:te=R.shadow.map.depthTexture||R.shadow.map.texture),R.isAmbientLight)h+=k.r*q,f+=k.g*q,u+=k.b*q;else if(R.isLightProbe){for(let W=0;W<9;W++)i.probe[W].addScaledVector(R.sh.coefficients[W],q);C++}else if(R.isSunLight){let W=e.get(R);if(W.color.copy(R.color).multiplyScalar(R.intensity),R.castShadow){let j=R.shadow,ee=t.get(R);ee.shadowIntensity=j.intensity,ee.shadowBias=j.bias,ee.shadowNormalBias=j.normalBias,ee.shadowRadius=j.radius,ee.shadowMapSize.copy(j.mapSize).multiply(j.getFrameExtents()),i.sunShadow[_]=ee,i.sunShadowMap[_]=te;let Te=j.getViewportCount();for(let Oe=0;Oe<Te;Oe++)i.sunShadowMatrix[M+Oe]=j.getMatrix(Oe),i.sunShadowCascade[M+Oe]=j._cascadeData[Oe];M+=Te,_++}i.sun[p]=W,p++}else if(R.isDirectionalLight){let W=e.get(R);if(W.color.copy(R.color).multiplyScalar(R.intensity),R.castShadow){let j=R.shadow,ee=t.get(R);ee.shadowIntensity=j.intensity,ee.shadowBias=j.bias,ee.shadowNormalBias=j.normalBias,ee.shadowRadius=j.radius,ee.shadowMapSize=j.mapSize,i.directionalShadow[m]=ee,i.directionalShadowMap[m]=te,i.directionalShadowMatrix[m]=R.shadow.matrix,E++}i.directional[m]=W,m++}else if(R.isSpotLight){let W=e.get(R);W.position.setFromMatrixPosition(R.matrixWorld),W.color.copy(k).multiplyScalar(q),W.distance=G,W.coneCos=Math.cos(R.angle),W.penumbraCos=Math.cos(R.angle*(1-R.penumbra)),W.decay=R.decay,i.spot[S]=W;let j=R.shadow;if(R.map&&(i.spotLightMap[v]=R.map,v++,j.updateMatrices(R),R.castShadow&&P++),i.spotLightMatrix[S]=j.matrix,R.castShadow){let ee=t.get(R);ee.shadowIntensity=j.intensity,ee.shadowBias=j.bias,ee.shadowNormalBias=j.normalBias,ee.shadowRadius=j.radius,ee.shadowMapSize=j.mapSize,i.spotShadow[S]=ee,i.spotShadowMap[S]=te,d++}S++}else if(R.isRectAreaLight){let W=e.get(R);W.color.copy(k).multiplyScalar(q),W.halfWidth.set(R.width*.5,0,0),W.halfHeight.set(0,R.height*.5,0),i.rectArea[A]=W,A++}else if(R.isPointLight){let W=e.get(R);if(W.color.copy(R.color).multiplyScalar(R.intensity),W.distance=R.distance,W.decay=R.decay,R.castShadow){let j=R.shadow,ee=t.get(R);ee.shadowIntensity=j.intensity,ee.shadowBias=j.bias,ee.shadowNormalBias=j.normalBias,ee.shadowRadius=j.radius,ee.shadowMapSize=j.mapSize,ee.shadowCameraNear=j.camera.near,ee.shadowCameraFar=j.camera.far,i.pointShadow[g]=ee,i.pointShadowMap[g]=te,i.pointShadowMatrix[g]=R.shadow.matrix,T++}i.point[g]=W,g++}else if(R.isHemisphereLight){let W=e.get(R);W.skyColor.copy(R.color).multiplyScalar(q),W.groundColor.copy(R.groundColor).multiplyScalar(q),i.hemi[b]=W,b++}}A>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=pe.LTC_FLOAT_1,i.rectAreaLTC2=pe.LTC_FLOAT_2):(i.rectAreaLTC1=pe.LTC_HALF_1,i.rectAreaLTC2=pe.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=f,i.ambient[2]=u;let D=i.hash;(D.sunLength!==p||D.directionalLength!==m||D.pointLength!==g||D.spotLength!==S||D.rectAreaLength!==A||D.hemiLength!==b||D.numSunShadows!==_||D.numDirectionalShadows!==E||D.numPointShadows!==T||D.numSpotShadows!==d||D.numSpotMaps!==v||D.numLightProbes!==C)&&(i.sun.length=p,i.directional.length=m,i.spot.length=S,i.rectArea.length=A,i.point.length=g,i.hemi.length=b,i.sunShadow.length=_,i.sunShadowMap.length=_,i.sunShadowMatrix.length=M,i.sunShadowCascade.length=M,i.directionalShadow.length=E,i.directionalShadowMap.length=E,i.directionalShadowMatrix.length=E,i.pointShadow.length=T,i.pointShadowMap.length=T,i.pointShadowMatrix.length=T,i.spotShadow.length=d,i.spotShadowMap.length=d,i.spotLightMatrix.length=d+v-P,i.spotLightMap.length=v,i.numSpotLightShadowsWithMaps=P,i.numLightProbes=C,D.sunLength=p,D.directionalLength=m,D.pointLength=g,D.spotLength=S,D.rectAreaLength=A,D.hemiLength=b,D.numSunShadows=_,D.numDirectionalShadows=E,D.numPointShadows=T,D.numSpotShadows=d,D.numSpotMaps=v,D.numLightProbes=C,i.version=P0++)}function c(l,h){let f=0,u=0,p=0,_=0,M=0,m=0,g=h.matrixWorldInverse;for(let S=0,A=l.length;S<A;S++){let b=l[S];if(b.isSunLight){let E=i.sun[f];E.direction.setFromMatrixPosition(b.matrixWorld),E.direction.transformDirection(g),f++}else if(b.isDirectionalLight){let E=i.directional[u];E.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(g),u++}else if(b.isSpotLight){let E=i.spot[_];E.position.setFromMatrixPosition(b.matrixWorld),E.position.applyMatrix4(g),E.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(g),_++}else if(b.isRectAreaLight){let E=i.rectArea[M];E.position.setFromMatrixPosition(b.matrixWorld),E.position.applyMatrix4(g),a.identity(),r.copy(b.matrixWorld),r.premultiply(g),a.extractRotation(r),E.halfWidth.set(b.width*.5,0,0),E.halfHeight.set(0,b.height*.5,0),E.halfWidth.applyMatrix4(a),E.halfHeight.applyMatrix4(a),M++}else if(b.isPointLight){let E=i.point[p];E.position.setFromMatrixPosition(b.matrixWorld),E.position.applyMatrix4(g),p++}else if(b.isHemisphereLight){let E=i.hemi[m];E.direction.setFromMatrixPosition(b.matrixWorld),E.direction.transformDirection(g),m++}}}return{setup:o,setupView:c,state:i}}function Mu(n){let e=new D0(n),t=[],i=[],s=[];function r(f){h.camera=f,t.length=0,i.length=0,s.length=0}function a(f){f.isLightProbeGrid?s.push(f):t.push(f)}function o(f){i.push(f)}function c(){e.setup(t),s.sort((f,u)=>f.priority-u.priority||f.id-u.id)}function l(f){e.setupView(t,f)}let h={lightsArray:t,shadowsArray:i,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:h,setupLights:c,setupLightsView:l,pushLight:a,pushShadow:o}}function N0(n){let e=new WeakMap;function t(s,r=0){let a=e.get(s),o;return a===void 0?(o=new Mu(n),e.set(s,[o])):r>=a.length?(o=new Mu(n),a.push(o)):o=a[r],o}function i(){e=new WeakMap}return{get:t,dispose:i}}var U0=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,F0=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,O0=[new B(1,0,0),new B(-1,0,0),new B(0,1,0),new B(0,-1,0),new B(0,0,1),new B(0,0,-1)],B0=[new B(0,-1,0),new B(0,-1,0),new B(0,0,1),new B(0,0,-1),new B(0,-1,0),new B(0,-1,0)],Su=new lt,Ir=new B,lc=new B;function z0(n,e,t){let i=new Tn,s=new He,r=new He,a=new _t,o=new Na,c=new Ua,l={},h=t.maxTextureSize,f={[Rn]:Zt,[Zt]:Rn,[ii]:ii},u=new ki({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new He},radius:{value:4}},vertexShader:U0,fragmentShader:F0}),p=u.clone();p.defines.HORIZONTAL_PASS=1;let _=new wi;_.setAttribute("position",new Ti(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let M=new ti(_,u),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Gn;let g=this.type;this.render=function(T,d,v){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||T.length===0)return;this.type===mh&&(Ie("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Gn);let P=n.getRenderTarget(),C=n.getActiveCubeFace(),D=n.getActiveMipmapLevel(),N=n.state;N.setBlending(Vn),N.buffers.depth.getReversed()===!0?N.buffers.color.setClear(0,0,0,0):N.buffers.color.setClear(1,1,1,1),N.buffers.depth.setTest(!0),N.setScissorTest(!1);let V=g!==this.type;V&&d.traverse(function(R){R.material&&(Array.isArray(R.material)?R.material.forEach(k=>k.needsUpdate=!0):R.material.needsUpdate=!0)});for(let R=0,k=T.length;R<k;R++){let q=T[R],G=q.shadow;if(G===void 0){Ie("WebGLShadowMap:",q,"has no shadow.");continue}if(G.autoUpdate===!1&&G.needsUpdate===!1)continue;s.copy(G.mapSize);let te=G.getFrameExtents();s.multiply(te),r.copy(G.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/te.x),s.x=r.x*te.x,G.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/te.y),s.y=r.y*te.y,G.mapSize.y=r.y));let W=n.state.buffers.depth.getReversed();if(G.camera._reversedDepth=W,G.map===null||V===!0){if(G.map!==null&&(G.map.depthTexture!==null&&(G.map.depthTexture.dispose(),G.map.depthTexture=null),G.map.dispose()),this.type===Es){if(q.isPointLight){Ie("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}G.map=new ci(s.x,s.y,{format:In,type:Ei,minFilter:$t,magFilter:$t,generateMipmaps:!1}),G.map.texture.name=q.name+".shadowMap",G.map.depthTexture=new nn(s.x,s.y,xi),G.map.depthTexture.name=q.name+".shadowMapDepth",G.map.depthTexture.format=en,G.map.depthTexture.compareFunction=null,G.map.depthTexture.minFilter=Nt,G.map.depthTexture.magFilter=Nt}else q.isPointLight?(G.map=new Lr(s.x),G.map.depthTexture=new cr(s.x,Ai)):(G.map=new ci(s.x,s.y),G.map.depthTexture=new nn(s.x,s.y,Ai)),G.map.depthTexture.name=q.name+".shadowMap",G.map.depthTexture.format=en,this.type===Gn?(G.map.depthTexture.compareFunction=W?Jl:Zl,G.map.depthTexture.minFilter=$t,G.map.depthTexture.magFilter=$t):(G.map.depthTexture.compareFunction=null,G.map.depthTexture.minFilter=Nt,G.map.depthTexture.magFilter=Nt);G.camera.updateProjectionMatrix()}G.map.isWebGLCubeRenderTarget!==!0&&(G.map.width!==s.x||G.map.height!==s.y)&&G.map.setSize(s.x,s.y);let j=G.map.isWebGLCubeRenderTarget?6:G.getViewportCount();q.isPointLight!==!0&&G.updateMatrices(q,v);let ee=(G.camera.layers.mask&4294967294)!==0?G.camera.layers:v.layers;for(let Te=0;Te<j;Te++){let Oe=G.getCamera(Te);if(q.isPointLight){let Z=G.camera,me=G.matrix,ve=q.distance||Z.far;ve!==Z.far&&(Z.far=ve,Z.updateProjectionMatrix()),Ir.setFromMatrixPosition(q.matrixWorld),Z.position.copy(Ir),lc.copy(Z.position),lc.add(O0[Te]),Z.up.copy(B0[Te]),Z.lookAt(lc),Z.updateMatrixWorld(),me.makeTranslation(-Ir.x,-Ir.y,-Ir.z),Su.multiplyMatrices(Z.projectionMatrix,Z.matrixWorldInverse),G._frustum.setFromProjectionMatrix(Su,Z.coordinateSystem,Z.reversedDepth)}if(G.map.isWebGLCubeRenderTarget)n.setRenderTarget(G.map,Te),n.clear();else{Te===0&&(n.setRenderTarget(G.map),n.clear());let Z=G.getViewport(Te);a.set(r.x*Z.x,r.y*Z.y,r.x*Z.z,r.y*Z.w),N.viewport(a)}i=G.getFrustum(Te),b(d,v,Oe,q,ee,this.type)}G.isPointLightShadow!==!0&&this.type===Es&&S(G,v),G.needsUpdate=!1}g=this.type,m.needsUpdate=!1,n.setRenderTarget(P,C,D)};function S(T,d){let v=e.update(M);u.defines.VSM_SAMPLES!==T.blurSamples&&(u.defines.VSM_SAMPLES=T.blurSamples,p.defines.VSM_SAMPLES=T.blurSamples,u.needsUpdate=!0,p.needsUpdate=!0),T.mapPass===null?T.mapPass=new ci(s.x,s.y,{format:In,type:Ei}):(T.mapPass.width!==T.map.width||T.mapPass.height!==T.map.height)&&T.mapPass.setSize(T.map.width,T.map.height),u.uniforms.shadow_pass.value=T.map.depthTexture,u.uniforms.resolution.value.set(T.map.width,T.map.height),u.uniforms.radius.value=T.radius,n.setRenderTarget(T.mapPass),n.clear(),n.renderBufferDirect(d,null,v,u,M,null),p.uniforms.shadow_pass.value=T.mapPass.texture,p.uniforms.resolution.value.set(T.map.width,T.map.height),p.uniforms.radius.value=T.radius,n.setRenderTarget(T.map),n.clear(),n.renderBufferDirect(d,null,v,p,M,null)}function A(T,d,v,P){let C=null,D=v.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(D!==void 0)C=D;else if(C=v.isPointLight===!0?c:o,n.localClippingEnabled&&d.clipShadows===!0&&Array.isArray(d.clippingPlanes)&&d.clippingPlanes.length!==0||d.displacementMap&&d.displacementScale!==0||d.alphaMap&&d.alphaTest>0||d.map&&d.alphaTest>0||d.alphaToCoverage===!0){let N=C.uuid,V=d.uuid,R=l[N];R===void 0&&(R={},l[N]=R);let k=R[V];k===void 0&&(k=C.clone(),R[V]=k,d.addEventListener("dispose",E)),C=k}if(C.visible=d.visible,C.wireframe=d.wireframe,P===Es?C.side=d.shadowSide!==null?d.shadowSide:d.side:C.side=d.shadowSide!==null?d.shadowSide:f[d.side],C.alphaMap=d.alphaMap,C.alphaTest=d.alphaToCoverage===!0?.5:d.alphaTest,C.map=d.map,C.clipShadows=d.clipShadows,C.clippingPlanes=d.clippingPlanes,C.clipIntersection=d.clipIntersection,C.displacementMap=d.displacementMap,C.displacementScale=d.displacementScale,C.displacementBias=d.displacementBias,C.wireframeLinewidth=d.wireframeLinewidth,C.linewidth=d.linewidth,v.isPointLight===!0&&C.isMeshDistanceMaterial===!0){let N=n.properties.get(C);N.light=v}return C}function b(T,d,v,P,C,D){if(T.visible===!1)return;if(T.layers.test(C)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&D===Es)&&(!T.frustumCulled||T.intersectsFrustum(i))){T.modelViewMatrix.multiplyMatrices(v.matrixWorldInverse,T.matrixWorld);let R=e.update(T),k=T.material;if(Array.isArray(k)){let q=R.groups;for(let G=0,te=q.length;G<te;G++){let W=q[G],j=k[W.materialIndex];if(j&&j.visible){let ee=A(T,j,P,D);T.onBeforeShadow(n,T,d,v,R,ee,W),n.renderBufferDirect(v,null,R,ee,T,W),T.onAfterShadow(n,T,d,v,R,ee,W)}}}else if(k.visible){let q=A(T,k,P,D);T.onBeforeShadow(n,T,d,v,R,q,null),n.renderBufferDirect(v,null,R,q,T,null),T.onAfterShadow(n,T,d,v,R,q,null)}}let V=T.children;for(let R=0,k=V.length;R<k;R++)b(V[R],d,v,P,C,D)}function E(T){T.target.removeEventListener("dispose",E);for(let v in l){let P=l[v],C=T.target.uuid;C in P&&(P[C].dispose(),delete P[C])}}}function k0(n,e){function t(){let I=!1,J=new _t,X=null,le=new _t(0,0,0,0);return{setMask:function(se){X!==se&&!I&&(n.colorMask(se,se,se,se),X=se)},setLocked:function(se){I=se},setClear:function(se,ae,Ae,Ve,ne){ne===!0&&(se*=Ve,ae*=Ve,Ae*=Ve),J.set(se,ae,Ae,Ve),le.equals(J)===!1&&(n.clearColor(se,ae,Ae,Ve),le.copy(J))},reset:function(){I=!1,X=null,le.set(-1,0,0,0)}}}function i(){let I=!1,J=!1,X=null,le=null,se=null;return{setReversed:function(ae){if(J!==ae){let Ae=e.get("EXT_clip_control");ae?Ae.clipControlEXT(Ae.LOWER_LEFT_EXT,Ae.ZERO_TO_ONE_EXT):Ae.clipControlEXT(Ae.LOWER_LEFT_EXT,Ae.NEGATIVE_ONE_TO_ONE_EXT),J=ae;let Ve=se;se=null,this.setClear(Ve)}},getReversed:function(){return J},setTest:function(ae){ae?ge(n.DEPTH_TEST):ze(n.DEPTH_TEST)},setMask:function(ae){X!==ae&&!I&&(n.depthMask(ae),X=ae)},setFunc:function(ae){if(J&&(ae=Zh[ae]),le!==ae){switch(ae){case xa:n.depthFunc(n.NEVER);break;case va:n.depthFunc(n.ALWAYS);break;case ya:n.depthFunc(n.LESS);break;case _s:n.depthFunc(n.LEQUAL);break;case Ma:n.depthFunc(n.EQUAL);break;case Sa:n.depthFunc(n.GEQUAL);break;case ba:n.depthFunc(n.GREATER);break;case Ta:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}le=ae}},setLocked:function(ae){I=ae},setClear:function(ae){se!==ae&&(se=ae,J&&(ae=1-ae),n.clearDepth(ae))},reset:function(){I=!1,X=null,le=null,se=null,J=!1}}}function s(){let I=!1,J=null,X=null,le=null,se=null,ae=null,Ae=null,Ve=null,ne=null;return{setTest:function(Ee){I||(Ee?ge(n.STENCIL_TEST):ze(n.STENCIL_TEST))},setMask:function(Ee){J!==Ee&&!I&&(n.stencilMask(Ee),J=Ee)},setFunc:function(Ee,Ge,fe){(X!==Ee||le!==Ge||se!==fe)&&(n.stencilFunc(Ee,Ge,fe),X=Ee,le=Ge,se=fe)},setOp:function(Ee,Ge,fe){(ae!==Ee||Ae!==Ge||Ve!==fe)&&(n.stencilOp(Ee,Ge,fe),ae=Ee,Ae=Ge,Ve=fe)},setLocked:function(Ee){I=Ee},setClear:function(Ee){ne!==Ee&&(n.clearStencil(Ee),ne=Ee)},reset:function(){I=!1,J=null,X=null,le=null,se=null,ae=null,Ae=null,Ve=null,ne=null}}}let r=new t,a=new i,o=new s,c={},l=new WeakMap,h={},f={},u={},p=new WeakMap,_=[],M=null,m=!1,g=null,S=null,A=null,b=null,E=null,T=null,d=null,v=new ke(0,0,0),P=0,C=!1,D=null,N=null,V=null,R=null,k=null,q=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS),G=!1,te=0,W=n.getParameter(n.VERSION);W.indexOf("WebGL")!==-1?(te=parseFloat(/^WebGL (\d)/.exec(W)[1]),G=te>=1):W.indexOf("OpenGL ES")!==-1&&(te=parseFloat(/^OpenGL ES (\d)/.exec(W)[1]),G=te>=2);let j=null,ee={},Te=n.getParameter(n.SCISSOR_BOX),Oe=n.getParameter(n.VIEWPORT),Z=new _t().fromArray(Te),me=new _t().fromArray(Oe);function ve(I,J,X,le){let se=new Uint8Array(4),ae=n.createTexture();n.bindTexture(I,ae),n.texParameteri(I,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(I,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let Ae=0;Ae<X;Ae++)I===n.TEXTURE_3D||I===n.TEXTURE_2D_ARRAY?n.texImage3D(J,0,n.RGBA,1,1,le,0,n.RGBA,n.UNSIGNED_BYTE,se):n.texImage2D(J+Ae,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,se);return ae}let Ce={};Ce[n.TEXTURE_2D]=ve(n.TEXTURE_2D,n.TEXTURE_2D,1),Ce[n.TEXTURE_CUBE_MAP]=ve(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),Ce[n.TEXTURE_2D_ARRAY]=ve(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),Ce[n.TEXTURE_3D]=ve(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),ge(n.DEPTH_TEST),a.setFunc(_s),Kt(!1),xt(Rl),ge(n.CULL_FACE),Ot(Vn);function ge(I){h[I]!==!0&&(n.enable(I),h[I]=!0)}function ze(I){h[I]!==!1&&(n.disable(I),h[I]=!1)}function Mt(I,J){return u[I]!==J?(n.bindFramebuffer(I,J),u[I]=J,I===n.DRAW_FRAMEBUFFER&&(u[n.FRAMEBUFFER]=J),I===n.FRAMEBUFFER&&(u[n.DRAW_FRAMEBUFFER]=J),!0):!1}function Le(I,J){let X=_,le=!1;if(I){X=p.get(J),X===void 0&&(X=[],p.set(J,X));let se=I.textures;if(X.length!==se.length||X[0]!==n.COLOR_ATTACHMENT0){for(let ae=0,Ae=se.length;ae<Ae;ae++)X[ae]=n.COLOR_ATTACHMENT0+ae;X.length=se.length,le=!0}}else X[0]!==n.BACK&&(X[0]=n.BACK,le=!0);le&&n.drawBuffers(X)}function st(I){return M!==I?(n.useProgram(I),M=I,!0):!1}let ct={[Hn]:n.FUNC_ADD,[_h]:n.FUNC_SUBTRACT,[xh]:n.FUNC_REVERSE_SUBTRACT};ct[vh]=n.MIN,ct[yh]=n.MAX;let qe={[Mh]:n.ZERO,[Sh]:n.ONE,[bh]:n.SRC_COLOR,[Dl]:n.SRC_ALPHA,[Rh]:n.SRC_ALPHA_SATURATE,[Eh]:n.DST_COLOR,[wh]:n.DST_ALPHA,[Th]:n.ONE_MINUS_SRC_COLOR,[Nl]:n.ONE_MINUS_SRC_ALPHA,[Ch]:n.ONE_MINUS_DST_COLOR,[Ah]:n.ONE_MINUS_DST_ALPHA,[Ih]:n.CONSTANT_COLOR,[Ph]:n.ONE_MINUS_CONSTANT_COLOR,[Lh]:n.CONSTANT_ALPHA,[Dh]:n.ONE_MINUS_CONSTANT_ALPHA};function Ot(I,J,X,le,se,ae,Ae,Ve,ne,Ee){if(I===Vn){m===!0&&(ze(n.BLEND),m=!1);return}if(m===!1&&(ge(n.BLEND),m=!0),I!==gh){if(I!==g||Ee!==C){if((S!==Hn||E!==Hn)&&(n.blendEquation(n.FUNC_ADD),S=Hn,E=Hn),Ee)switch(I){case Cs:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Il:n.blendFunc(n.ONE,n.ONE);break;case Pl:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Ll:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:De("WebGLState: Invalid blending: ",I);break}else switch(I){case Cs:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Il:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case Pl:De("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Ll:De("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:De("WebGLState: Invalid blending: ",I);break}A=null,b=null,T=null,d=null,v.set(0,0,0),P=0,g=I,C=Ee}return}se=se||J,ae=ae||X,Ae=Ae||le,(J!==S||se!==E)&&(n.blendEquationSeparate(ct[J],ct[se]),S=J,E=se),(X!==A||le!==b||ae!==T||Ae!==d)&&(n.blendFuncSeparate(qe[X],qe[le],qe[ae],qe[Ae]),A=X,b=le,T=ae,d=Ae),(Ve.equals(v)===!1||ne!==P)&&(n.blendColor(Ve.r,Ve.g,Ve.b,ne),v.copy(Ve),P=ne),g=I,C=!1}function wt(I,J){I.side===ii?ze(n.CULL_FACE):ge(n.CULL_FACE);let X=I.side===Zt;J&&(X=!X),Kt(X),I.blending===Cs&&I.transparent===!1?Ot(Vn):Ot(I.blending,I.blendEquation,I.blendSrc,I.blendDst,I.blendEquationAlpha,I.blendSrcAlpha,I.blendDstAlpha,I.blendColor,I.blendAlpha,I.premultipliedAlpha),a.setFunc(I.depthFunc),a.setTest(I.depthTest),a.setMask(I.depthWrite),r.setMask(I.colorWrite);let le=I.stencilWrite;o.setTest(le),le&&(o.setMask(I.stencilWriteMask),o.setFunc(I.stencilFunc,I.stencilRef,I.stencilFuncMask),o.setOp(I.stencilFail,I.stencilZFail,I.stencilZPass)),Rt(I.polygonOffset,I.polygonOffsetFactor,I.polygonOffsetUnits),I.alphaToCoverage===!0?ge(n.SAMPLE_ALPHA_TO_COVERAGE):ze(n.SAMPLE_ALPHA_TO_COVERAGE)}function Kt(I){D!==I&&(I?n.frontFace(n.CW):n.frontFace(n.CCW),D=I)}function xt(I){I!==fh?(ge(n.CULL_FACE),I!==N&&(I===Rl?n.cullFace(n.BACK):I===ph?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):ze(n.CULL_FACE),N=I}function Li(I){I!==V&&(G&&n.lineWidth(I),V=I)}function Rt(I,J,X){I?(ge(n.POLYGON_OFFSET_FILL),(R!==J||k!==X)&&(R=J,k=X,a.getReversed()&&(J=-J,X=-X),n.polygonOffset(J,X))):ze(n.POLYGON_OFFSET_FILL)}function ui(I){I?ge(n.SCISSOR_TEST):ze(n.SCISSOR_TEST)}function di(I){I===void 0&&(I=n.TEXTURE0+q-1),j!==I&&(n.activeTexture(I),j=I)}function fi(I,J,X){X===void 0&&(j===null?X=n.TEXTURE0+q-1:X=j);let le=ee[X];le===void 0&&(le={type:void 0,texture:void 0},ee[X]=le),(le.type!==I||le.texture!==J)&&(j!==X&&(n.activeTexture(X),j=X),n.bindTexture(I,J||Ce[I]),le.type=I,le.texture=J)}function U(){let I=ee[j];I!==void 0&&I.type!==void 0&&(n.bindTexture(I.type,null),I.type=void 0,I.texture=void 0)}function pi(){try{n.compressedTexImage2D(...arguments)}catch(I){De("WebGLState:",I)}}function mt(){try{n.compressedTexImage3D(...arguments)}catch(I){De("WebGLState:",I)}}function gt(){try{n.texSubImage2D(...arguments)}catch(I){De("WebGLState:",I)}}function de(){try{n.texSubImage3D(...arguments)}catch(I){De("WebGLState:",I)}}function At(){try{n.compressedTexSubImage2D(...arguments)}catch(I){De("WebGLState:",I)}}function Re(){try{n.compressedTexSubImage3D(...arguments)}catch(I){De("WebGLState:",I)}}function Ue(){try{n.texStorage2D(...arguments)}catch(I){De("WebGLState:",I)}}function w(){try{n.texStorage3D(...arguments)}catch(I){De("WebGLState:",I)}}function x(){try{n.texImage2D(...arguments)}catch(I){De("WebGLState:",I)}}function O(){try{n.texImage3D(...arguments)}catch(I){De("WebGLState:",I)}}function ie(I){return f[I]!==void 0?f[I]:n.getParameter(I)}function K(I,J){f[I]!==J&&(n.pixelStorei(I,J),f[I]=J)}function re(I){Z.equals(I)===!1&&(n.scissor(I.x,I.y,I.z,I.w),Z.copy(I))}function he(I){me.equals(I)===!1&&(n.viewport(I.x,I.y,I.z,I.w),me.copy(I))}function Y(I,J){let X=l.get(J);X===void 0&&(X=new WeakMap,l.set(J,X));let le=X.get(I);le===void 0&&(le=n.getUniformBlockIndex(J,I.name),n.uniformBlockBinding(J,le,le),X.set(I,le))}function $(I,J,X){let se=l.get(J).get(I);c[se]!==X&&(n.bindBufferBase(n.UNIFORM_BUFFER,se,X),c[se]=X)}function oe(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),a.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),n.pixelStorei(n.PACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,!1),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,n.BROWSER_DEFAULT_WEBGL),n.pixelStorei(n.PACK_ROW_LENGTH,0),n.pixelStorei(n.PACK_SKIP_PIXELS,0),n.pixelStorei(n.PACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_ROW_LENGTH,0),n.pixelStorei(n.UNPACK_IMAGE_HEIGHT,0),n.pixelStorei(n.UNPACK_SKIP_PIXELS,0),n.pixelStorei(n.UNPACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_SKIP_IMAGES,0),h={},f={},j=null,ee={},u={},c={},p=new WeakMap,_=[],M=null,m=!1,g=null,S=null,A=null,b=null,E=null,T=null,d=null,v=new ke(0,0,0),P=0,C=!1,D=null,N=null,V=null,R=null,k=null,Z.set(0,0,n.canvas.width,n.canvas.height),me.set(0,0,n.canvas.width,n.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:ge,disable:ze,bindFramebuffer:Mt,drawBuffers:Le,useProgram:st,setBlending:Ot,setMaterial:wt,setFlipSided:Kt,setCullFace:xt,setLineWidth:Li,setPolygonOffset:Rt,setScissorTest:ui,activeTexture:di,bindTexture:fi,unbindTexture:U,compressedTexImage2D:pi,compressedTexImage3D:mt,texImage2D:x,texImage3D:O,pixelStorei:K,getParameter:ie,updateUBOMapping:Y,uniformBlockBinding:$,texStorage2D:Ue,texStorage3D:w,texSubImage2D:gt,texSubImage3D:de,compressedTexSubImage2D:At,compressedTexSubImage3D:Re,scissor:re,viewport:he,reset:oe}}function G0(n,e,t,i,s,r,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new He,h=new WeakMap,f=new Set,u,p=new WeakMap,_=new Set,M=new FinalizationRegistry(w=>_.delete(w)),m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(w,x){return m?new OffscreenCanvas(w,x):js("canvas")}function S(w,x,O){let ie=1,K=Ue(w);if((K.width>O||K.height>O)&&(ie=O/Math.max(K.width,K.height)),ie<1)if(typeof HTMLImageElement<"u"&&w instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&w instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&w instanceof ImageBitmap||typeof VideoFrame<"u"&&w instanceof VideoFrame){let re=Math.floor(ie*K.width),he=Math.floor(ie*K.height);u===void 0&&(u=g(re,he));let Y=x?g(re,he):u;return Y.width=re,Y.height=he,Y.getContext("2d").drawImage(w,0,0,re,he),Ie("WebGLRenderer: Texture has been resized from ("+K.width+"x"+K.height+") to ("+re+"x"+he+")."),Y}else return"data"in w&&Ie("WebGLRenderer: Image in DataTexture is too big ("+K.width+"x"+K.height+")."),w;return w}function A(w){return w.generateMipmaps}function b(w){n.generateMipmap(w)}function E(w){return w.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:w.isWebGL3DRenderTarget?n.TEXTURE_3D:w.isWebGLArrayRenderTarget||w.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function T(w,x,O,ie,K,re=!1){if(w!==null){if(n[w]!==void 0)return n[w];Ie("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+w+"'")}let he;ie&&(he=e.get("EXT_texture_norm16"),he||Ie("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Y=x;if(x===n.RED&&(O===n.FLOAT&&(Y=n.R32F),O===n.HALF_FLOAT&&(Y=n.R16F),O===n.UNSIGNED_BYTE&&(Y=n.R8),O===n.UNSIGNED_SHORT&&he&&(Y=he.R16_EXT),O===n.SHORT&&he&&(Y=he.R16_SNORM_EXT)),x===n.RED_INTEGER&&(O===n.UNSIGNED_BYTE&&(Y=n.R8UI),O===n.UNSIGNED_SHORT&&(Y=n.R16UI),O===n.UNSIGNED_INT&&(Y=n.R32UI),O===n.BYTE&&(Y=n.R8I),O===n.SHORT&&(Y=n.R16I),O===n.INT&&(Y=n.R32I)),x===n.RG&&(O===n.FLOAT&&(Y=n.RG32F),O===n.HALF_FLOAT&&(Y=n.RG16F),O===n.UNSIGNED_BYTE&&(Y=n.RG8),O===n.UNSIGNED_SHORT&&he&&(Y=he.RG16_EXT),O===n.SHORT&&he&&(Y=he.RG16_SNORM_EXT)),x===n.RG_INTEGER&&(O===n.UNSIGNED_BYTE&&(Y=n.RG8UI),O===n.UNSIGNED_SHORT&&(Y=n.RG16UI),O===n.UNSIGNED_INT&&(Y=n.RG32UI),O===n.BYTE&&(Y=n.RG8I),O===n.SHORT&&(Y=n.RG16I),O===n.INT&&(Y=n.RG32I)),x===n.RGB_INTEGER&&(O===n.UNSIGNED_BYTE&&(Y=n.RGB8UI),O===n.UNSIGNED_SHORT&&(Y=n.RGB16UI),O===n.UNSIGNED_INT&&(Y=n.RGB32UI),O===n.BYTE&&(Y=n.RGB8I),O===n.SHORT&&(Y=n.RGB16I),O===n.INT&&(Y=n.RGB32I)),x===n.RGBA_INTEGER&&(O===n.UNSIGNED_BYTE&&(Y=n.RGBA8UI),O===n.UNSIGNED_SHORT&&(Y=n.RGBA16UI),O===n.UNSIGNED_INT&&(Y=n.RGBA32UI),O===n.BYTE&&(Y=n.RGBA8I),O===n.SHORT&&(Y=n.RGBA16I),O===n.INT&&(Y=n.RGBA32I)),x===n.RGB&&(O===n.UNSIGNED_SHORT&&he&&(Y=he.RGB16_EXT),O===n.SHORT&&he&&(Y=he.RGB16_SNORM_EXT),O===n.UNSIGNED_INT_5_9_9_9_REV&&(Y=n.RGB9_E5),O===n.UNSIGNED_INT_10F_11F_11F_REV&&(Y=n.R11F_G11F_B10F)),x===n.RGBA){let $=re?Ks:Je.getTransfer(K);O===n.FLOAT&&(Y=n.RGBA32F),O===n.HALF_FLOAT&&(Y=n.RGBA16F),O===n.UNSIGNED_BYTE&&(Y=$===nt?n.SRGB8_ALPHA8:n.RGBA8),O===n.UNSIGNED_SHORT&&he&&(Y=he.RGBA16_EXT),O===n.SHORT&&he&&(Y=he.RGBA16_SNORM_EXT),O===n.UNSIGNED_SHORT_4_4_4_4&&(Y=n.RGBA4),O===n.UNSIGNED_SHORT_5_5_5_1&&(Y=n.RGB5_A1)}return(Y===n.R16F||Y===n.R32F||Y===n.RG16F||Y===n.RG32F||Y===n.RGBA16F||Y===n.RGBA32F)&&e.get("EXT_color_buffer_float"),Y}function d(w,x){let O;return w?x===null||x===Ai||x===Xn?O=n.DEPTH24_STENCIL8:x===xi?O=n.DEPTH32F_STENCIL8:x===Is&&(O=n.DEPTH24_STENCIL8,Ie("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):x===null||x===Ai||x===Xn?O=n.DEPTH_COMPONENT24:x===xi?O=n.DEPTH_COMPONENT32F:x===Is&&(O=n.DEPTH_COMPONENT16),O}function v(w,x){return A(w)===!0||w.isFramebufferTexture&&w.minFilter!==Nt&&w.minFilter!==$t?Math.log2(Math.max(x.width,x.height))+1:w.mipmaps.length>0?w.mipmaps.length:w.isCompressedTexture&&Array.isArray(w.image)?x.mipmaps.length:1}function P(w){let x=new WeakRef(w);i.get(w).__ref=x,_.add(x),M.register(w,x,x)}function C(w){let x=i.get(w).__ref;x!==void 0&&(_.delete(x),M.unregister(x))}function D(w){V(w.target)}function N(w){R(w.target)}function V(w){w.removeEventListener("dispose",D),C(w),q(w),w.isVideoTexture&&h.delete(w),w.isHTMLTexture&&f.delete(w)}function R(w){w.removeEventListener("dispose",N),C(w),te(w)}function k(){for(let w of _){let x=w.deref();x!==void 0&&(x.isRenderTarget===!0?R(x):V(x))}_.clear(),f.clear()}function q(w){let x=i.get(w);if(x.__webglInit===void 0)return;let O=w.source,ie=p.get(O);if(ie){let K=ie[x.__cacheKey];K.usedTimes--,K.usedTimes===0&&G(w),Object.keys(ie).length===0&&p.delete(O)}i.remove(w)}function G(w){let x=i.get(w);n.deleteTexture(x.__webglTexture);let O=w.source,ie=p.get(O);delete ie[x.__cacheKey],a.memory.textures--}function te(w){let x=i.get(w);x.__depthDisposeCallback&&x.__depthDisposeCallback();let O=w.depthTexture;if(O&&O.renderTarget===w&&V(O),w.isWebGLCubeRenderTarget)for(let K=0;K<6;K++){if(Array.isArray(x.__webglFramebuffer[K]))for(let re=0;re<x.__webglFramebuffer[K].length;re++)n.deleteFramebuffer(x.__webglFramebuffer[K][re]);else n.deleteFramebuffer(x.__webglFramebuffer[K]);x.__webglDepthbuffer&&n.deleteRenderbuffer(x.__webglDepthbuffer[K])}else{if(Array.isArray(x.__webglFramebuffer))for(let K=0;K<x.__webglFramebuffer.length;K++)n.deleteFramebuffer(x.__webglFramebuffer[K]);else n.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&n.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&n.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let K=0;K<x.__webglColorRenderbuffer.length;K++)x.__webglColorRenderbuffer[K]&&n.deleteRenderbuffer(x.__webglColorRenderbuffer[K]);x.__webglDepthRenderbuffer&&n.deleteRenderbuffer(x.__webglDepthRenderbuffer)}let ie=w.textures;for(let K=0,re=ie.length;K<re;K++){let he=i.get(ie[K]);he.__webglTexture&&(n.deleteTexture(he.__webglTexture),a.memory.textures--),i.remove(ie[K])}i.remove(w)}let W=0;function j(){W=0}function ee(){return W}function Te(w){W=w}function Oe(){let w=W;return w>=s.maxTextures&&Ie("WebGLTextures: Trying to use "+(w+1)+" texture units while this GPU supports only "+s.maxTextures),W+=1,w}function Z(w){let x=[];return x.push(w.wrapS),x.push(w.wrapT),x.push(w.wrapR||0),x.push(w.magFilter),x.push(w.minFilter),x.push(w.anisotropy),x.push(w.internalFormat),x.push(w.format),x.push(w.type),x.push(w.generateMipmaps),x.push(w.mipmapsAutoUpdate),x.push(w.premultiplyAlpha),x.push(w.flipY),x.push(w.unpackAlignment),x.push(w.colorSpace),x.join()}function me(w,x){let O=i.get(w);if(w.isVideoTexture&&At(w),w.isRenderTargetTexture===!1&&w.isExternalTexture!==!0&&w.version>0&&O.__version!==w.version){let ie=w.image;if(ie===null)Ie("WebGLRenderer: Texture marked for update but no image data found.");else if(ie.complete===!1)Ie("WebGLRenderer: Texture marked for update but image is incomplete");else{wt(O,w,x);return}}else w.isExternalTexture&&(O.__webglTexture=w.sourceTexture?w.sourceTexture:null);t.bindTexture(n.TEXTURE_2D,O.__webglTexture,n.TEXTURE0+x)}function ve(w,x){let O=i.get(w);if(w.isRenderTargetTexture===!1&&w.version>0&&O.__version!==w.version){wt(O,w,x);return}else w.isExternalTexture&&(O.__webglTexture=w.sourceTexture?w.sourceTexture:null);t.bindTexture(n.TEXTURE_2D_ARRAY,O.__webglTexture,n.TEXTURE0+x)}function Ce(w,x){let O=i.get(w);if(w.isRenderTargetTexture===!1&&w.version>0&&O.__version!==w.version){wt(O,w,x);return}t.bindTexture(n.TEXTURE_3D,O.__webglTexture,n.TEXTURE0+x)}function ge(w,x){let O=i.get(w);if(w.version>0&&O.__version!==w.version){Kt(O,w,x);return}t.bindTexture(n.TEXTURE_CUBE_MAP,O.__webglTexture,n.TEXTURE0+x)}let ze={[wa]:n.REPEAT,[Ui]:n.CLAMP_TO_EDGE,[Aa]:n.MIRRORED_REPEAT},Mt={[Nt]:n.NEAREST,[Fh]:n.NEAREST_MIPMAP_NEAREST,[br]:n.NEAREST_MIPMAP_LINEAR,[$t]:n.LINEAR,[Ja]:n.LINEAR_MIPMAP_NEAREST,[sn]:n.LINEAR_MIPMAP_LINEAR},Le={[kh]:n.NEVER,[Kl]:n.ALWAYS,[Gh]:n.LESS,[Zl]:n.LEQUAL,[Vh]:n.EQUAL,[Jl]:n.GEQUAL,[Hh]:n.GREATER,[Wh]:n.NOTEQUAL};function st(w,x){if(x.type===xi&&e.has("OES_texture_float_linear")===!1&&(x.magFilter===$t||x.magFilter===Ja||x.magFilter===br||x.magFilter===sn||x.minFilter===$t||x.minFilter===Ja||x.minFilter===br||x.minFilter===sn)&&Ie("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(w,n.TEXTURE_WRAP_S,ze[x.wrapS]),n.texParameteri(w,n.TEXTURE_WRAP_T,ze[x.wrapT]),(w===n.TEXTURE_3D||w===n.TEXTURE_2D_ARRAY)&&n.texParameteri(w,n.TEXTURE_WRAP_R,ze[x.wrapR]),n.texParameteri(w,n.TEXTURE_MAG_FILTER,Mt[x.magFilter]),n.texParameteri(w,n.TEXTURE_MIN_FILTER,Mt[x.minFilter]),x.compareFunction&&(n.texParameteri(w,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(w,n.TEXTURE_COMPARE_FUNC,Le[x.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===Nt||x.minFilter!==br&&x.minFilter!==sn||x.type===xi&&e.has("OES_texture_float_linear")===!1)return;if(x.anisotropy>1||i.get(x).__currentAnisotropy){let O=e.get("EXT_texture_filter_anisotropic");n.texParameterf(w,O.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,s.getMaxAnisotropy())),i.get(x).__currentAnisotropy=x.anisotropy}}}function ct(w,x){let O=!1;w.__webglInit===void 0&&(w.__webglInit=!0,x.addEventListener("dispose",D),P(x));let ie=x.source,K=p.get(ie);K===void 0&&(K={},p.set(ie,K));let re=Z(x);if(re!==w.__cacheKey){K[re]===void 0&&(K[re]={texture:n.createTexture(),usedTimes:0},a.memory.textures++,O=!0),K[re].usedTimes++;let he=K[w.__cacheKey];he!==void 0&&(K[w.__cacheKey].usedTimes--,he.usedTimes===0&&G(x)),w.__cacheKey=re,w.__webglTexture=K[re].texture}return O}function qe(w,x,O){return Math.floor(Math.floor(w/O)/x)}function Ot(w,x,O,ie){let re=w.updateRanges;if(re.length===0)t.texSubImage2D(n.TEXTURE_2D,0,0,0,x.width,x.height,O,ie,x.data);else{re.sort((I,J)=>I.start-J.start);let he=0;for(let I=1;I<re.length;I++){let J=re[he],X=re[I],le=J.start+J.count,se=qe(X.start,x.width,4),ae=qe(J.start,x.width,4);X.start<=le+1&&se===ae&&qe(X.start+X.count-1,x.width,4)===se?J.count=Math.max(J.count,X.start+X.count-J.start):(++he,re[he]=X)}re.length=he+1;let Y=t.getParameter(n.UNPACK_ROW_LENGTH),$=t.getParameter(n.UNPACK_SKIP_PIXELS),oe=t.getParameter(n.UNPACK_SKIP_ROWS);t.pixelStorei(n.UNPACK_ROW_LENGTH,x.width);for(let I=0,J=re.length;I<J;I++){let X=re[I],le=Math.floor(X.start/4),se=Math.ceil(X.count/4),ae=le%x.width,Ae=Math.floor(le/x.width),Ve=se,ne=1;t.pixelStorei(n.UNPACK_SKIP_PIXELS,ae),t.pixelStorei(n.UNPACK_SKIP_ROWS,Ae),t.texSubImage2D(n.TEXTURE_2D,0,ae,Ae,Ve,ne,O,ie,x.data)}w.clearUpdateRanges(),t.pixelStorei(n.UNPACK_ROW_LENGTH,Y),t.pixelStorei(n.UNPACK_SKIP_PIXELS,$),t.pixelStorei(n.UNPACK_SKIP_ROWS,oe)}}function wt(w,x,O){let ie=n.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&(ie=n.TEXTURE_2D_ARRAY),x.isData3DTexture&&(ie=n.TEXTURE_3D);let K=ct(w,x),re=x.source;t.bindTexture(ie,w.__webglTexture,n.TEXTURE0+O);let he=i.get(re);if(re.version!==he.__version||K===!0){if(t.activeTexture(n.TEXTURE0+O),(typeof ImageBitmap<"u"&&x.image instanceof ImageBitmap)===!1){let ne=Je.getPrimaries(Je.workingColorSpace),Ee=x.colorSpace===an?null:Je.getPrimaries(x.colorSpace),Ge=x.colorSpace===an||ne===Ee?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ge)}t.pixelStorei(n.UNPACK_ALIGNMENT,x.unpackAlignment);let $=S(x.image,!1,s.maxTextureSize);$=Re(x,$);let oe=r.convert(x.format,x.colorSpace),I=r.convert(x.type),J=T(x.internalFormat,oe,I,x.normalized,x.colorSpace,x.isVideoTexture);st(ie,x);let X,le=x.mipmaps,se=x.isVideoTexture!==!0,ae=he.__version===void 0||K===!0,Ae=re.dataReady,Ve=v(x,$);if(x.isDepthTexture)J=d(x.format===rn,x.type),ae&&(se?t.texStorage2D(n.TEXTURE_2D,1,J,$.width,$.height):t.texImage2D(n.TEXTURE_2D,0,J,$.width,$.height,0,oe,I,null));else if(x.isDataTexture)if(le.length>0){se&&ae&&t.texStorage2D(n.TEXTURE_2D,Ve,J,le[0].width,le[0].height);for(let ne=0,Ee=le.length;ne<Ee;ne++)X=le[ne],se?Ae&&t.texSubImage2D(n.TEXTURE_2D,ne,0,0,X.width,X.height,oe,I,X.data):t.texImage2D(n.TEXTURE_2D,ne,J,X.width,X.height,0,oe,I,X.data);x.generateMipmaps=!1}else se?(ae&&t.texStorage2D(n.TEXTURE_2D,Ve,J,$.width,$.height),Ae&&Ot(x,$,oe,I)):t.texImage2D(n.TEXTURE_2D,0,J,$.width,$.height,0,oe,I,$.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){se&&ae&&t.texStorage3D(n.TEXTURE_2D_ARRAY,Ve,J,le[0].width,le[0].height,$.depth);for(let ne=0,Ee=le.length;ne<Ee;ne++)if(X=le[ne],x.format!==Ci)if(oe!==null)if(se){if(Ae)if(x.layerUpdates.size>0){let Ge=ac(X.width,X.height,x.format,x.type);for(let fe of x.layerUpdates){let rt=X.data.subarray(fe*Ge/X.data.BYTES_PER_ELEMENT,(fe+1)*Ge/X.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,ne,0,0,fe,X.width,X.height,1,oe,rt)}}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,ne,0,0,0,X.width,X.height,$.depth,oe,X.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,ne,J,X.width,X.height,$.depth,0,X.data,0,0);else Ie("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else se?Ae&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,ne,0,0,0,X.width,X.height,$.depth,oe,I,X.data):t.texImage3D(n.TEXTURE_2D_ARRAY,ne,J,X.width,X.height,$.depth,0,oe,I,X.data);x.layerUpdates.size>0&&x.clearLayerUpdates()}else{se&&ae&&t.texStorage2D(n.TEXTURE_2D,Ve,J,le[0].width,le[0].height);for(let ne=0,Ee=le.length;ne<Ee;ne++)X=le[ne],x.format!==Ci?oe!==null?se?Ae&&t.compressedTexSubImage2D(n.TEXTURE_2D,ne,0,0,X.width,X.height,oe,X.data):t.compressedTexImage2D(n.TEXTURE_2D,ne,J,X.width,X.height,0,X.data):Ie("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):se?Ae&&t.texSubImage2D(n.TEXTURE_2D,ne,0,0,X.width,X.height,oe,I,X.data):t.texImage2D(n.TEXTURE_2D,ne,J,X.width,X.height,0,oe,I,X.data)}else if(x.isDataArrayTexture)if(se){if(ae&&t.texStorage3D(n.TEXTURE_2D_ARRAY,Ve,J,$.width,$.height,$.depth),Ae)if(x.layerUpdates.size>0){let ne=ac($.width,$.height,x.format,x.type);for(let Ee of x.layerUpdates){let Ge=$.data.subarray(Ee*ne/$.data.BYTES_PER_ELEMENT,(Ee+1)*ne/$.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,Ee,$.width,$.height,1,oe,I,Ge)}x.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,$.width,$.height,$.depth,oe,I,$.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,J,$.width,$.height,$.depth,0,oe,I,$.data);else if(x.isData3DTexture)se?(ae&&t.texStorage3D(n.TEXTURE_3D,Ve,J,$.width,$.height,$.depth),Ae&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,$.width,$.height,$.depth,oe,I,$.data)):t.texImage3D(n.TEXTURE_3D,0,J,$.width,$.height,$.depth,0,oe,I,$.data);else if(x.isFramebufferTexture){if(ae)if(se)t.texStorage2D(n.TEXTURE_2D,Ve,J,$.width,$.height);else{let ne=$.width,Ee=$.height;for(let Ge=0;Ge<Ve;Ge++)t.texImage2D(n.TEXTURE_2D,Ge,J,ne,Ee,0,oe,I,null),ne>>=1,Ee>>=1}}else if(x.isHTMLTexture){if("texElementImage2D"in n){let ne=n.canvas;if(ne.hasAttribute("layoutsubtree")||ne.setAttribute("layoutsubtree","true"),$.parentNode!==ne){ne.appendChild($),f.add(x),ne.onpaint=Ee=>{let Ge=Ee.changedElements;for(let fe of f)Ge.includes(fe.image)&&(fe.needsUpdate=!0)},ne.requestPaint();return}if(n.texElementImage2D.length===3)n.texElementImage2D(n.TEXTURE_2D,n.RGBA8,$);else{let Ge=n.RGBA,fe=n.RGBA,rt=n.UNSIGNED_BYTE;n.texElementImage2D(n.TEXTURE_2D,0,Ge,fe,rt,$)}n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE)}}else if(le.length>0){if(se&&ae){let ne=Ue(le[0]);t.texStorage2D(n.TEXTURE_2D,Ve,J,ne.width,ne.height)}for(let ne=0,Ee=le.length;ne<Ee;ne++)X=le[ne],se?Ae&&t.texSubImage2D(n.TEXTURE_2D,ne,0,0,oe,I,X):t.texImage2D(n.TEXTURE_2D,ne,J,oe,I,X);x.generateMipmaps=!1}else if(se){if(ae){let ne=Ue($);t.texStorage2D(n.TEXTURE_2D,Ve,J,ne.width,ne.height)}Ae&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,oe,I,$)}else t.texImage2D(n.TEXTURE_2D,0,J,oe,I,$);A(x)&&x.mipmapsAutoUpdate===!0&&b(ie),he.__version=re.version,x.onUpdate&&x.onUpdate(x)}w.__version=x.version}function Kt(w,x,O){if(x.image.length!==6)return;let ie=ct(w,x),K=x.source;t.bindTexture(n.TEXTURE_CUBE_MAP,w.__webglTexture,n.TEXTURE0+O);let re=i.get(K);if(K.version!==re.__version||ie===!0){t.activeTexture(n.TEXTURE0+O);let he=Je.getPrimaries(Je.workingColorSpace),Y=x.colorSpace===an?null:Je.getPrimaries(x.colorSpace),$=x.colorSpace===an||he===Y?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(n.UNPACK_ALIGNMENT,x.unpackAlignment),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,$);let oe=x.isCompressedTexture||x.image[0].isCompressedTexture,I=x.image[0]&&x.image[0].isDataTexture,J=[];for(let fe=0;fe<6;fe++)!oe&&!I?J[fe]=S(x.image[fe],!0,s.maxCubemapSize):J[fe]=I?x.image[fe].image:x.image[fe],J[fe]=Re(x,J[fe]);let X=J[0],le=r.convert(x.format,x.colorSpace),se=r.convert(x.type),ae=T(x.internalFormat,le,se,x.normalized,x.colorSpace),Ae=x.isVideoTexture!==!0,Ve=re.__version===void 0||ie===!0,ne=K.dataReady,Ee=v(x,X);st(n.TEXTURE_CUBE_MAP,x);let Ge;if(x.isDepthTexture){if(ae=d(x.format===rn,x.type),Ve)if(Ae)t.texStorage2D(n.TEXTURE_CUBE_MAP,1,ae,X.width,X.height);else for(let fe=0;fe<6;fe++)t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,0,ae,X.width,X.height,0,le,se,null)}else if(oe){Ae&&Ve&&t.texStorage2D(n.TEXTURE_CUBE_MAP,Ee,ae,X.width,X.height);for(let fe=0;fe<6;fe++){Ge=J[fe].mipmaps;for(let rt=0;rt<Ge.length;rt++){let It=Ge[rt];x.format!==Ci?le!==null?Ae?ne&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,rt,0,0,It.width,It.height,le,It.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,rt,ae,It.width,It.height,0,It.data):Ie("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ae?ne&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,rt,0,0,It.width,It.height,le,se,It.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,rt,ae,It.width,It.height,0,le,se,It.data)}}}else{if(Ge=x.mipmaps,Ae&&Ve){Ge.length>0&&Ee++;let fe=Ue(J[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,Ee,ae,fe.width,fe.height)}for(let fe=0;fe<6;fe++)if(I){Ae?ne&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,0,0,0,J[fe].width,J[fe].height,le,se,J[fe].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,0,ae,J[fe].width,J[fe].height,0,le,se,J[fe].data);for(let rt=0;rt<Ge.length;rt++){let hn=Ge[rt].image[fe].image;Ae?ne&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,rt+1,0,0,hn.width,hn.height,le,se,hn.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,rt+1,ae,hn.width,hn.height,0,le,se,hn.data)}}else{Ae?ne&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,0,0,0,le,se,J[fe]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,0,ae,le,se,J[fe]);for(let rt=0;rt<Ge.length;rt++){let It=Ge[rt];Ae?ne&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,rt+1,0,0,le,se,It.image[fe]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,rt+1,ae,le,se,It.image[fe])}}}A(x)&&x.mipmapsAutoUpdate===!0&&b(n.TEXTURE_CUBE_MAP),re.__version=K.version,x.onUpdate&&x.onUpdate(x)}w.__version=x.version}function xt(w,x,O,ie,K,re){let he=r.convert(O.format,O.colorSpace),Y=r.convert(O.type),$=T(O.internalFormat,he,Y,O.normalized,O.colorSpace),oe=i.get(x),I=i.get(O);if(I.__renderTarget=x,!oe.__hasExternalTextures){let J=Math.max(1,x.width>>re),X=Math.max(1,x.height>>re);K===n.TEXTURE_3D||K===n.TEXTURE_2D_ARRAY?t.texImage3D(K,re,$,J,X,x.depth,0,he,Y,null):t.texImage2D(K,re,$,J,X,0,he,Y,null)}t.bindFramebuffer(n.FRAMEBUFFER,w),de(x)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,ie,K,I.__webglTexture,0,gt(x)):(K===n.TEXTURE_2D||K>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&K<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,ie,K,I.__webglTexture,re),t.bindFramebuffer(n.FRAMEBUFFER,null)}function Li(w,x,O){if(n.bindRenderbuffer(n.RENDERBUFFER,w),x.depthBuffer){let ie=x.depthTexture,K=ie&&ie.isDepthTexture?ie.type:null,re=d(x.stencilBuffer,K),he=x.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;de(x)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,gt(x),re,x.width,x.height):O?n.renderbufferStorageMultisample(n.RENDERBUFFER,gt(x),re,x.width,x.height):n.renderbufferStorage(n.RENDERBUFFER,re,x.width,x.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,he,n.RENDERBUFFER,w)}else{let ie=x.textures;for(let K=0;K<ie.length;K++){let re=ie[K],he=r.convert(re.format,re.colorSpace),Y=r.convert(re.type),$=T(re.internalFormat,he,Y,re.normalized,re.colorSpace);de(x)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,gt(x),$,x.width,x.height):O?n.renderbufferStorageMultisample(n.RENDERBUFFER,gt(x),$,x.width,x.height):n.renderbufferStorage(n.RENDERBUFFER,$,x.width,x.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function Rt(w,x,O){let ie=x.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(n.FRAMEBUFFER,w),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let K=i.get(x.depthTexture);K.__renderTarget=x;let re=ie?x.depthTexture.image[0]:x.depthTexture.image;(!K.__webglTexture||re.width!==x.width||re.height!==x.height)&&(re.width=x.width,re.height=x.height,x.depthTexture.needsUpdate=!0),ie?ge(x.depthTexture,0):me(x.depthTexture,0);let he=K.__webglTexture,Y=gt(x),$=ie?n.TEXTURE_CUBE_MAP_POSITIVE_X+O:n.TEXTURE_2D,oe=x.depthTexture.format===rn?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;if(x.depthTexture.format===en)de(x)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,oe,$,he,0,Y):n.framebufferTexture2D(n.FRAMEBUFFER,oe,$,he,0);else if(x.depthTexture.format===rn)de(x)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,oe,$,he,0,Y):n.framebufferTexture2D(n.FRAMEBUFFER,oe,$,he,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function ui(w){let x=i.get(w),O=w.isWebGLCubeRenderTarget===!0;if(x.__boundDepthTexture!==w.depthTexture){let ie=w.depthTexture;if(x.__depthDisposeCallback&&x.__depthDisposeCallback(),ie){let K=()=>{delete x.__boundDepthTexture,delete x.__depthDisposeCallback,ie.removeEventListener("dispose",K)};ie.addEventListener("dispose",K),x.__depthDisposeCallback=K}x.__boundDepthTexture=ie}if(w.depthTexture&&!x.__autoAllocateDepthBuffer)if(O)for(let ie=0;ie<6;ie++)Rt(x.__webglFramebuffer[ie],w,ie);else w.texture.mipmaps.length>0?Rt(x.__webglFramebuffer[0],w,0):Rt(x.__webglFramebuffer,w,0);else if(O){x.__webglDepthbuffer=[];for(let ie=0;ie<6;ie++)if(t.bindFramebuffer(n.FRAMEBUFFER,x.__webglFramebuffer[ie]),x.__webglDepthbuffer[ie]===void 0)x.__webglDepthbuffer[ie]=n.createRenderbuffer(),Li(x.__webglDepthbuffer[ie],w,!1);else{let K=w.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,re=x.__webglDepthbuffer[ie];n.bindRenderbuffer(n.RENDERBUFFER,re),n.framebufferRenderbuffer(n.FRAMEBUFFER,K,n.RENDERBUFFER,re)}}else if(w.texture.mipmaps.length>0?t.bindFramebuffer(n.FRAMEBUFFER,x.__webglFramebuffer[0]):t.bindFramebuffer(n.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer===void 0)x.__webglDepthbuffer=n.createRenderbuffer(),Li(x.__webglDepthbuffer,w,!1);else{let K=w.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,re=x.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,re),n.framebufferRenderbuffer(n.FRAMEBUFFER,K,n.RENDERBUFFER,re)}t.bindFramebuffer(n.FRAMEBUFFER,null)}function di(w,x,O){let ie=i.get(w);x!==void 0&&xt(ie.__webglFramebuffer,w,w.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),O!==void 0&&ui(w)}function fi(w){let x=w.texture,O=i.get(w),ie=i.get(x);w.addEventListener("dispose",N),P(w);let K=w.textures,re=w.isWebGLCubeRenderTarget===!0,he=K.length>1;if(he||(ie.__webglTexture===void 0&&(ie.__webglTexture=n.createTexture()),ie.__version=x.version,a.memory.textures++),re){O.__webglFramebuffer=[];for(let Y=0;Y<6;Y++)if(x.mipmaps.length>0){O.__webglFramebuffer[Y]=[];for(let $=0;$<x.mipmaps.length;$++)O.__webglFramebuffer[Y][$]=n.createFramebuffer()}else O.__webglFramebuffer[Y]=n.createFramebuffer()}else{if(x.mipmaps.length>0){O.__webglFramebuffer=[];for(let Y=0;Y<x.mipmaps.length;Y++)O.__webglFramebuffer[Y]=n.createFramebuffer()}else O.__webglFramebuffer=n.createFramebuffer();if(he)for(let Y=0,$=K.length;Y<$;Y++){let oe=i.get(K[Y]);oe.__webglTexture===void 0&&(oe.__webglTexture=n.createTexture(),a.memory.textures++)}if(w.samples>0&&de(w)===!1){O.__webglMultisampledFramebuffer=n.createFramebuffer(),O.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,O.__webglMultisampledFramebuffer);for(let Y=0;Y<K.length;Y++){let $=K[Y];O.__webglColorRenderbuffer[Y]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,O.__webglColorRenderbuffer[Y]);let oe=r.convert($.format,$.colorSpace),I=r.convert($.type),J=T($.internalFormat,oe,I,$.normalized,$.colorSpace,w.isXRRenderTarget===!0),X=gt(w);n.renderbufferStorageMultisample(n.RENDERBUFFER,X,J,w.width,w.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Y,n.RENDERBUFFER,O.__webglColorRenderbuffer[Y])}n.bindRenderbuffer(n.RENDERBUFFER,null),w.depthBuffer&&(O.__webglDepthRenderbuffer=n.createRenderbuffer(),Li(O.__webglDepthRenderbuffer,w,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(re){t.bindTexture(n.TEXTURE_CUBE_MAP,ie.__webglTexture),st(n.TEXTURE_CUBE_MAP,x);for(let Y=0;Y<6;Y++)if(x.mipmaps.length>0)for(let $=0;$<x.mipmaps.length;$++)xt(O.__webglFramebuffer[Y][$],w,x,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+Y,$);else xt(O.__webglFramebuffer[Y],w,x,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0);A(x)?b(n.TEXTURE_CUBE_MAP):x.mipmaps.length>0&&n.texParameteri(n.TEXTURE_CUBE_MAP,n.TEXTURE_MAX_LEVEL,x.mipmaps.length-1),t.unbindTexture()}else if(he){for(let Y=0,$=K.length;Y<$;Y++){let oe=K[Y],I=i.get(oe),J=n.TEXTURE_2D;(w.isWebGL3DRenderTarget||w.isWebGLArrayRenderTarget)&&(J=w.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(J,I.__webglTexture),st(J,oe),xt(O.__webglFramebuffer,w,oe,n.COLOR_ATTACHMENT0+Y,J,0),A(oe)&&b(J)}t.unbindTexture()}else{let Y=n.TEXTURE_2D;if((w.isWebGL3DRenderTarget||w.isWebGLArrayRenderTarget)&&(Y=w.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(Y,ie.__webglTexture),st(Y,x),x.mipmaps.length>0)for(let $=0;$<x.mipmaps.length;$++)xt(O.__webglFramebuffer[$],w,x,n.COLOR_ATTACHMENT0,Y,$);else xt(O.__webglFramebuffer,w,x,n.COLOR_ATTACHMENT0,Y,0);A(x)?b(Y):x.mipmaps.length>0&&n.texParameteri(Y,n.TEXTURE_MAX_LEVEL,x.mipmaps.length-1),t.unbindTexture()}w.depthBuffer&&ui(w)}function U(w){let x=w.textures;for(let O=0,ie=x.length;O<ie;O++){let K=x[O];if(A(K)&&K.mipmapsAutoUpdate===!0){let re=E(w),he=i.get(K).__webglTexture;t.bindTexture(re,he),b(re),t.unbindTexture()}}}let pi=[];function mt(w){if(w.samples>0){if(de(w)===!1){let x=w.textures,O=w.width,ie=w.height,K=n.COLOR_BUFFER_BIT,re=w.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,he=i.get(w),Y=x.length>1;if(Y)for(let oe=0;oe<x.length;oe++)t.bindFramebuffer(n.FRAMEBUFFER,he.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+oe,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,he.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+oe,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,he.__webglMultisampledFramebuffer),w.texture.mipmaps.length>0?t.bindFramebuffer(n.DRAW_FRAMEBUFFER,he.__webglFramebuffer[0]):t.bindFramebuffer(n.DRAW_FRAMEBUFFER,he.__webglFramebuffer);for(let oe=0;oe<x.length;oe++){if(w.resolveDepthBuffer&&(w.depthBuffer&&(K|=n.DEPTH_BUFFER_BIT),w.stencilBuffer&&w.resolveStencilBuffer&&(K|=n.STENCIL_BUFFER_BIT)),Y){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,he.__webglColorRenderbuffer[oe]);let I=i.get(x[oe]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,I,0)}n.blitFramebuffer(0,0,O,ie,0,0,O,ie,K,n.NEAREST),c===!0&&(pi.length=0,pi.push(n.COLOR_ATTACHMENT0+oe),w.depthBuffer&&w.storeMultisampledDepthBuffer===!1&&pi.push(re),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,pi))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),Y)for(let oe=0;oe<x.length;oe++){t.bindFramebuffer(n.FRAMEBUFFER,he.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+oe,n.RENDERBUFFER,he.__webglColorRenderbuffer[oe]);let I=i.get(x[oe]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,he.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+oe,n.TEXTURE_2D,I,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,he.__webglMultisampledFramebuffer)}else if(w.depthBuffer&&w.storeMultisampledDepthBuffer===!1&&c){let x=w.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[x])}}}function gt(w){return Math.min(s.maxSamples,w.samples)}function de(w){let x=i.get(w);return w.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function At(w){let x=a.render.frame;h.get(w)!==x&&(h.set(w,x),w.update())}function Re(w,x){let O=w.colorSpace,ie=w.format,K=w.type;return w.isCompressedTexture===!0||w.isVideoTexture===!0||O!==Js&&O!==an&&(Je.getTransfer(O)===nt?(ie!==Ci||K!==ni)&&Ie("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):De("WebGLTextures: Unsupported texture color space:",O)),x}function Ue(w){return typeof HTMLImageElement<"u"&&w instanceof HTMLImageElement?(l.width=w.naturalWidth||w.width,l.height=w.naturalHeight||w.height):typeof VideoFrame<"u"&&w instanceof VideoFrame?(l.width=w.displayWidth,l.height=w.displayHeight):(l.width=w.width,l.height=w.height),l}this.allocateTextureUnit=Oe,this.resetTextureUnits=j,this.getTextureUnits=ee,this.setTextureUnits=Te,this.setTexture2D=me,this.setTexture2DArray=ve,this.setTexture3D=Ce,this.setTextureCube=ge,this.rebindTextures=di,this.setupRenderTarget=fi,this.updateRenderTargetMipmap=U,this.updateMultisampleRenderTarget=mt,this.setupDepthRenderbuffer=ui,this.setupFrameBufferTexture=xt,this.useMultisampledRTT=de,this.dispose=k}function V0(n,e){function t(i,s=an){let r,a=Je.getTransfer(s);if(i===ni)return n.UNSIGNED_BYTE;if(i===ja)return n.UNSIGNED_SHORT_4_4_4_4;if(i===Qa)return n.UNSIGNED_SHORT_5_5_5_1;if(i===Xl)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===ql)return n.UNSIGNED_INT_10F_11F_11F_REV;if(i===Hl)return n.BYTE;if(i===Wl)return n.SHORT;if(i===Is)return n.UNSIGNED_SHORT;if(i===Ka)return n.INT;if(i===Ai)return n.UNSIGNED_INT;if(i===xi)return n.FLOAT;if(i===Ei)return n.HALF_FLOAT;if(i===Yl)return n.ALPHA;if(i===$l)return n.RGB;if(i===Ci)return n.RGBA;if(i===en)return n.DEPTH_COMPONENT;if(i===rn)return n.DEPTH_STENCIL;if(i===eo)return n.RED;if(i===to)return n.RED_INTEGER;if(i===In)return n.RG;if(i===io)return n.RG_INTEGER;if(i===no)return n.RGBA_INTEGER;if(i===Tr||i===wr||i===Ar||i===Er)if(a===nt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===Tr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===wr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Ar)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Er)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===Tr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===wr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Ar)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Er)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===so||i===ro||i===ao||i===oo)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===so)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===ro)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===ao)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===oo)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===lo||i===co||i===ho||i===uo||i===fo||i===Cr||i===po)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===lo||i===co)return a===nt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===ho)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===uo)return r.COMPRESSED_R11_EAC;if(i===fo)return r.COMPRESSED_SIGNED_R11_EAC;if(i===Cr)return r.COMPRESSED_RG11_EAC;if(i===po)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===mo||i===go||i===_o||i===xo||i===vo||i===yo||i===Mo||i===So||i===bo||i===To||i===wo||i===Ao||i===Eo||i===Co)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===mo)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===go)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===_o)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===xo)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===vo)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===yo)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Mo)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===So)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===bo)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===To)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===wo)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Ao)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Eo)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Co)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Ro||i===Io||i===Po)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===Ro)return a===nt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Io)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Po)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Lo||i===Do||i===Rr||i===No)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===Lo)return r.COMPRESSED_RED_RGTC1_EXT;if(i===Do)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Rr)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===No)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Xn?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}var H0=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,W0=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,mc=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let i=new hr(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,i=new ki({vertexShader:H0,fragmentShader:W0,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new ti(new kn(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},gc=class extends Oi{constructor(e,t){super();let i=this,s=null,r=1,a=null,o="local-floor",c=1,l=null,h=null,f=null,u=null,p=null,_=null,M=typeof XRWebGLBinding<"u",m=new mc,g={},S=t.getContextAttributes(),A=null,b=null,E=[],T=[],d=new He,v=null,P=null,C=new Yt;C.viewport=new _t;let D=new Yt;D.viewport=new _t;let N=[C,D],V=new Ya,R=null,k=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Z){let me=E[Z];return me===void 0&&(me=new bs,E[Z]=me),me.getTargetRaySpace()},this.getControllerGrip=function(Z){let me=E[Z];return me===void 0&&(me=new bs,E[Z]=me),me.getGripSpace()},this.getHand=function(Z){let me=E[Z];return me===void 0&&(me=new bs,E[Z]=me),me.getHandSpace()};function q(Z){let me=T.indexOf(Z.inputSource);if(me===-1)return;let ve=E[me];ve!==void 0&&(ve.update(Z.inputSource,Z.frame,l||a),ve.dispatchEvent({type:Z.type,data:Z.inputSource}))}function G(){s.removeEventListener("select",q),s.removeEventListener("selectstart",q),s.removeEventListener("selectend",q),s.removeEventListener("squeeze",q),s.removeEventListener("squeezestart",q),s.removeEventListener("squeezeend",q),s.removeEventListener("end",G),s.removeEventListener("inputsourceschange",te);for(let Z=0;Z<E.length;Z++){let me=T[Z];me!==null&&(T[Z]=null,E[Z].disconnect(me))}R=null,k=null,m.reset();for(let Z in g)delete g[Z];if(e.setRenderTarget(A),p=null,u=null,f=null,s=null,b=null,Oe.stop(),i.isPresenting=!1,e.setPixelRatio(v),e.setSize(d.width,d.height,!1),P!==null){let Z=P.camera;Z.fov=P.fov,Z.zoom=P.zoom,Z.updateProjectionMatrix(),P=null}i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Z){r=Z,i.isPresenting===!0&&Ie("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Z){o=Z,i.isPresenting===!0&&Ie("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||a},this.setReferenceSpace=function(Z){l=Z},this.getBaseLayer=function(){return u!==null?u:p},this.getBinding=function(){return f===null&&M&&(f=new XRWebGLBinding(s,t)),f},this.getFrame=function(){return _},this.getSession=function(){return s},this.setSession=async function(Z){if(s=Z,s!==null){if(A=e.getRenderTarget(),s.addEventListener("select",q),s.addEventListener("selectstart",q),s.addEventListener("selectend",q),s.addEventListener("squeeze",q),s.addEventListener("squeezestart",q),s.addEventListener("squeezeend",q),s.addEventListener("end",G),s.addEventListener("inputsourceschange",te),S.xrCompatible!==!0&&await t.makeXRCompatible(),v=e.getPixelRatio(),e.getSize(d),M&&"createProjectionLayer"in XRWebGLBinding.prototype){let ve=null,Ce=null,ge=null;S.depth&&(ge=S.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ve=S.stencil?rn:en,Ce=S.stencil?Xn:Ai);let ze={colorFormat:t.RGBA8,depthFormat:ge,scaleFactor:r};f=this.getBinding(),u=f.createProjectionLayer(ze),s.updateRenderState({layers:[u]}),e.setPixelRatio(1),e.setSize(u.textureWidth,u.textureHeight,!1),b=new ci(u.textureWidth,u.textureHeight,{format:Ci,type:ni,depthTexture:new nn(u.textureWidth,u.textureHeight,Ce,void 0,void 0,void 0,void 0,void 0,void 0,ve),stencilBuffer:S.stencil,colorSpace:e.outputColorSpace,samples:S.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1,storeMultisampledDepthBuffer:u.ignoreDepthValues===!1,storeMultisampledStencilBuffer:u.ignoreDepthValues===!1})}else{let ve={antialias:S.antialias,alpha:!0,depth:S.depth,stencil:S.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,t,ve),s.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),b=new ci(p.framebufferWidth,p.framebufferHeight,{format:Ci,type:ni,colorSpace:e.outputColorSpace,stencilBuffer:S.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1,storeMultisampledDepthBuffer:p.ignoreDepthValues===!1,storeMultisampledStencilBuffer:p.ignoreDepthValues===!1})}b.isXRRenderTarget=!0,this.setFoveation(c),l=null,a=await s.requestReferenceSpace(o),Oe.setContext(s),Oe.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function te(Z){for(let me=0;me<Z.removed.length;me++){let ve=Z.removed[me],Ce=T.indexOf(ve);Ce>=0&&(T[Ce]=null,E[Ce].disconnect(ve))}for(let me=0;me<Z.added.length;me++){let ve=Z.added[me],Ce=T.indexOf(ve);if(Ce===-1){for(let ze=0;ze<E.length;ze++)if(ze>=T.length){T.push(ve),Ce=ze;break}else if(T[ze]===null){T[ze]=ve,Ce=ze;break}if(Ce===-1)break}let ge=E[Ce];ge&&ge.connect(ve)}}function W(Z,me){me===null?Z.matrixWorld.copy(Z.matrix):Z.matrixWorld.multiplyMatrices(me.matrixWorld,Z.matrix),Z.matrixWorldInverse.copy(Z.matrixWorld).invert()}this.updateCamera=function(Z){if(s===null)return;let me=Z.near,ve=Z.far;m.texture!==null&&(m.depthNear>0&&(me=m.depthNear),m.depthFar>0&&(ve=m.depthFar)),V.near=D.near=C.near=me,V.far=D.far=C.far=ve,(R!==V.near||k!==V.far)&&(s.updateRenderState({depthNear:V.near,depthFar:V.far}),R=V.near,k=V.far),V.layers.mask=Z.layers.mask|6,C.layers.mask=V.layers.mask&-5,D.layers.mask=V.layers.mask&-3;let Ce=Z.parent,ge=V.cameras;W(V,Ce);for(let ze=0;ze<ge.length;ze++)W(ge[ze],Ce);V.projectionMatrix.copy(C.projectionMatrix),V.projectionMatrixInverse.copy(C.projectionMatrixInverse),P===null&&Z.isPerspectiveCamera&&(P={camera:Z,fov:Z.fov,zoom:Z.zoom}),j(Z,V,Ce)};function j(Z,me,ve){ve===null?Z.matrix.copy(me.matrixWorld):(Z.matrix.copy(ve.matrixWorld),Z.matrix.invert(),Z.matrix.multiply(me.matrixWorld)),Z.matrix.decompose(Z.position,Z.quaternion,Z.scale),Z.updateMatrixWorld(!0),Z.projectionMatrix.copy(me.projectionMatrix),Z.projectionMatrixInverse.copy(me.projectionMatrixInverse),Z.isPerspectiveCamera&&(Z.fov=ys*2*Math.atan(1/Z.projectionMatrix.elements[5]),Z.zoom=1)}this.getCamera=function(){return V},this.getFoveation=function(){if(!(u===null&&p===null))return c},this.setFoveation=function(Z){c=Z,u!==null&&(u.fixedFoveation=Z),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=Z)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(V)},this.getCameraTexture=function(Z){return g[Z]};let ee=null;function Te(Z,me){if(h=me.getViewerPose(l||a),_=me,h!==null){let ve=h.views;p!==null&&(e.setRenderTargetFramebuffer(b,p.framebuffer),e.setRenderTarget(b));let Ce=!1;ve.length!==V.cameras.length&&(V.cameras.length=0,Ce=!0);for(let Le=0;Le<ve.length;Le++){let st=ve[Le],ct=null;if(p!==null)ct=p.getViewport(st);else{let Ot=f.getViewSubImage(u,st);ct=Ot.viewport,Le===0&&(e.setRenderTargetTextures(b,Ot.colorTexture,Ot.depthStencilTexture),e.setRenderTarget(b))}let qe=N[Le];qe===void 0&&(qe=new Yt,qe.layers.enable(Le),qe.viewport=new _t,N[Le]=qe),qe.matrix.fromArray(st.transform.matrix),qe.matrix.decompose(qe.position,qe.quaternion,qe.scale),qe.projectionMatrix.fromArray(st.projectionMatrix),qe.projectionMatrixInverse.copy(qe.projectionMatrix).invert(),qe.viewport.set(ct.x,ct.y,ct.width,ct.height),Le===0&&(V.matrix.copy(qe.matrix),V.matrix.decompose(V.position,V.quaternion,V.scale)),Ce===!0&&V.cameras.push(qe)}let ge=s.enabledFeatures;if(ge&&ge.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&M){f=i.getBinding();let Le=f.getDepthInformation(ve[0]);Le&&Le.isValid&&Le.texture&&m.init(Le,s.renderState)}if(ge&&ge.includes("camera-access")&&M){e.state.unbindTexture(),f=i.getBinding();for(let Le=0;Le<ve.length;Le++){let st=ve[Le].camera;if(st){let ct=g[st];ct||(ct=new hr,g[st]=ct);let qe=f.getCameraImage(st);ct.sourceTexture=qe}}}}for(let ve=0;ve<E.length;ve++){let Ce=T[ve],ge=E[ve];Ce!==null&&ge!==void 0&&ge.update(Ce,me,l||a)}ee&&ee(Z,me),me.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:me}),_=null}let Oe=new bu;Oe.setAnimationLoop(Te),this.setAnimationLoop=function(Z){ee=Z},this.dispose=function(){}}},X0=new lt,Du=new Ne;Du.set(-1,0,0,0,1,0,0,0,1);function q0(n,e){function t(m,g){m.matrixAutoUpdate===!0&&m.updateMatrix(),g.value.copy(m.matrix)}function i(m,g){g.color.getRGB(m.fogColor.value,nc(n)),g.isFog?(m.fogNear.value=g.near,m.fogFar.value=g.far):g.isFogExp2&&(m.fogDensity.value=g.density)}function s(m,g,S,A,b){g.isNodeMaterial?g.uniformsNeedUpdate=!1:g.isMeshBasicMaterial?r(m,g):g.isMeshLambertMaterial?(r(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshToonMaterial?(r(m,g),f(m,g)):g.isMeshPhongMaterial?(r(m,g),h(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshStandardMaterial?(r(m,g),u(m,g),g.isMeshPhysicalMaterial&&p(m,g,b)):g.isMeshMatcapMaterial?(r(m,g),_(m,g)):g.isMeshDepthMaterial?r(m,g):g.isMeshDistanceMaterial?(r(m,g),M(m,g)):g.isMeshNormalMaterial?r(m,g):g.isLineBasicMaterial?(a(m,g),g.isLineDashedMaterial&&o(m,g)):g.isPointsMaterial?c(m,g,S,A):g.isSpriteMaterial?l(m,g):g.isShadowMaterial?(m.color.value.copy(g.color),m.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function r(m,g){m.opacity.value=g.opacity,g.color&&m.diffuse.value.copy(g.color),g.emissive&&m.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(m.map.value=g.map,t(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.bumpMap&&(m.bumpMap.value=g.bumpMap,t(g.bumpMap,m.bumpMapTransform),m.bumpScale.value=g.bumpScale,g.side===Zt&&(m.bumpScale.value*=-1)),g.normalMap&&(m.normalMap.value=g.normalMap,t(g.normalMap,m.normalMapTransform),m.normalScale.value.copy(g.normalScale),g.side===Zt&&m.normalScale.value.negate()),g.displacementMap&&(m.displacementMap.value=g.displacementMap,t(g.displacementMap,m.displacementMapTransform),m.displacementScale.value=g.displacementScale,m.displacementBias.value=g.displacementBias),g.emissiveMap&&(m.emissiveMap.value=g.emissiveMap,t(g.emissiveMap,m.emissiveMapTransform)),g.specularMap&&(m.specularMap.value=g.specularMap,t(g.specularMap,m.specularMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest);let S=e.get(g),A=S.envMap,b=S.envMapRotation;A&&(m.envMap.value=A,m.envMapRotation.value.setFromMatrix4(X0.makeRotationFromEuler(b)).transpose(),A.isCubeTexture&&A.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(Du),m.reflectivity.value=g.reflectivity,m.ior.value=g.ior,m.refractionRatio.value=g.refractionRatio),g.lightMap&&(m.lightMap.value=g.lightMap,m.lightMapIntensity.value=g.lightMapIntensity,t(g.lightMap,m.lightMapTransform)),g.aoMap&&(m.aoMap.value=g.aoMap,m.aoMapIntensity.value=g.aoMapIntensity,t(g.aoMap,m.aoMapTransform))}function a(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,g.map&&(m.map.value=g.map,t(g.map,m.mapTransform))}function o(m,g){m.dashSize.value=g.dashSize,m.totalSize.value=g.dashSize+g.gapSize,m.scale.value=g.scale}function c(m,g,S,A){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.size.value=g.size*S,m.scale.value=A*.5,g.map&&(m.map.value=g.map,t(g.map,m.uvTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function l(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.rotation.value=g.rotation,g.map&&(m.map.value=g.map,t(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function h(m,g){m.specular.value.copy(g.specular),m.shininess.value=Math.max(g.shininess,1e-4)}function f(m,g){g.gradientMap&&(m.gradientMap.value=g.gradientMap)}function u(m,g){m.metalness.value=g.metalness,g.metalnessMap&&(m.metalnessMap.value=g.metalnessMap,t(g.metalnessMap,m.metalnessMapTransform)),m.roughness.value=g.roughness,g.roughnessMap&&(m.roughnessMap.value=g.roughnessMap,t(g.roughnessMap,m.roughnessMapTransform)),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)}function p(m,g,S){m.ior.value=g.ior,g.diffuseRoughness>0&&(m.diffuseRoughness.value=g.diffuseRoughness,g.diffuseRoughnessMap&&(m.diffuseRoughnessMap.value=g.diffuseRoughnessMap,t(g.diffuseRoughnessMap,m.diffuseRoughnessMapTransform))),g.sheen>0&&(m.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),m.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(m.sheenColorMap.value=g.sheenColorMap,t(g.sheenColorMap,m.sheenColorMapTransform)),g.sheenRoughnessMap&&(m.sheenRoughnessMap.value=g.sheenRoughnessMap,t(g.sheenRoughnessMap,m.sheenRoughnessMapTransform))),g.clearcoat>0&&(m.clearcoat.value=g.clearcoat,m.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(m.clearcoatMap.value=g.clearcoatMap,t(g.clearcoatMap,m.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,t(g.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(m.clearcoatNormalMap.value=g.clearcoatNormalMap,t(g.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===Zt&&m.clearcoatNormalScale.value.negate())),g.dispersion>0&&(m.dispersion.value=g.dispersion),g.retroreflectivity>0&&(m.retroreflectivity.value=g.retroreflectivity),g.iridescence>0&&(m.iridescence.value=g.iridescence,m.iridescenceIOR.value=g.iridescenceIOR,m.iridescenceThicknessMinimum.value=g.iridescenceThicknessMinimum,m.iridescenceThicknessMaximum.value=g.iridescenceThicknessMaximum,g.iridescenceMap&&(m.iridescenceMap.value=g.iridescenceMap,t(g.iridescenceMap,m.iridescenceMapTransform)),g.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=g.iridescenceThicknessMap,t(g.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),g.transmission>0&&(m.transmission.value=g.transmission,m.transmissionSamplerMap.value=S.texture,m.transmissionSamplerSize.value.set(S.width,S.height),g.transmissionMap&&(m.transmissionMap.value=g.transmissionMap,t(g.transmissionMap,m.transmissionMapTransform)),m.thickness.value=g.thickness,g.thicknessMap&&(m.thicknessMap.value=g.thicknessMap,t(g.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=g.attenuationDistance,m.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(m.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(m.anisotropyMap.value=g.anisotropyMap,t(g.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=g.specularIntensity,m.specularColor.value.copy(g.specularColor),g.specularColorMap&&(m.specularColorMap.value=g.specularColorMap,t(g.specularColorMap,m.specularColorMapTransform)),g.specularIntensityMap&&(m.specularIntensityMap.value=g.specularIntensityMap,t(g.specularIntensityMap,m.specularIntensityMapTransform))}function _(m,g){g.matcap&&(m.matcap.value=g.matcap)}function M(m,g){let S=e.get(g).light;m.referencePosition.value.setFromMatrixPosition(S.matrixWorld),m.nearDistance.value=S.shadow.camera.near,m.farDistance.value=S.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function Y0(n,e,t,i){let s={},r={};function a(S,A){let b=A.program;i.uniformBlockBinding(S,b,s[S.id])}function o(S,A){let b=s[S.id];b===void 0&&(_(S),b=c(S),s[S.id]=b,S.addEventListener("dispose",m));let E=A.program;i.updateUBOMapping(S,E);let T=e.render.frame;r[S.id]!==T&&(l(S),r[S.id]=T)}function c(S){let A=n.createBuffer(),b=S.__size,E=S.usage;return n.bindBuffer(n.UNIFORM_BUFFER,A),n.bufferData(n.UNIFORM_BUFFER,b,E),n.bindBuffer(n.UNIFORM_BUFFER,null),A}function l(S){let A=s[S.id],b=S.uniforms,E=S.__cache;n.bindBuffer(n.UNIFORM_BUFFER,A);for(let T=0,d=b.length;T<d;T++){let v=b[T];if(Array.isArray(v))for(let P=0,C=v.length;P<C;P++)h(v[P],T,P,E);else h(v,T,0,E)}n.bindBuffer(n.UNIFORM_BUFFER,null)}function h(S,A,b,E){if(u(S,A,b,E)===!0){let T=S.__offset,d=S.value;if(Array.isArray(d)){let v=0;for(let P=0;P<d.length;P++){let C=d[P],D=M(C,!0);f(C,S.__data,v),v+=D.storage/Float32Array.BYTES_PER_ELEMENT}}else f(d,S.__data,0);n.bufferSubData(n.UNIFORM_BUFFER,T,S.__data)}}function f(S,A,b){typeof S=="number"||typeof S=="boolean"?A[b]=S:S.isMatrix3?(A[b]=S.elements[0],A[b+1]=S.elements[1],A[b+2]=S.elements[2],A[b+3]=0,A[b+4]=S.elements[3],A[b+5]=S.elements[4],A[b+6]=S.elements[5],A[b+7]=0,A[b+8]=S.elements[6],A[b+9]=S.elements[7],A[b+10]=S.elements[8],A[b+11]=0):ArrayBuffer.isView(S)?A.set(S.subarray(0,A.length-b),b):S.toArray(A,b)}function u(S,A,b,E){let T=S.value,d=A+"_"+b;if(Array.isArray(T)){E[d]===void 0&&(E[d]=[]);let v=E[d],P=!1;for(let C=0;C<T.length;C++)p(T[C],v,C)===!0&&(P=!0);return P}return p(T,E,d)}function p(S,A,b){if(A[b]===void 0)return typeof S=="number"||typeof S=="boolean"?A[b]=S:ArrayBuffer.isView(S)?A[b]=S.slice():A[b]=S.clone(),!0;{let E=A[b];if(typeof S=="number"||typeof S=="boolean"){if(E!==S)return A[b]=S,!0}else{if(ArrayBuffer.isView(S))return!0;if(E.equals(S)===!1)return E.copy(S),!0}}return!1}function _(S){let A=S.uniforms,b=0,E=16;for(let d=0,v=A.length;d<v;d++){let P=Array.isArray(A[d])?A[d]:[A[d]];for(let C=0,D=P.length;C<D;C++){let N=P[C],V=Array.isArray(N.value)?N.value:[N.value],R=Array.isArray(A[d])||Array.isArray(N.value),k=b;for(let G=0,te=V.length;G<te;G++){let W=V[G],j=M(W,R),ee=b%E,Te=ee%j.boundary,Oe=ee+Te;b+=Te,Oe!==0&&E-Oe<j.storage&&(b+=E-Oe),G===0&&(k=b),b+=j.storage}let q=N.type==="int"?Int32Array:N.type==="uint"?Uint32Array:Float32Array;N.__data=new q((b-k)/Float32Array.BYTES_PER_ELEMENT),N.__offset=k}}let T=b%E;return T>0&&(b+=E-T),S.__size=b,S.__cache={},this}function M(S,A){let b={boundary:0,storage:0};return typeof S=="number"||typeof S=="boolean"?(b.boundary=4,b.storage=4):S.isVector2?(b.boundary=8,b.storage=8):S.isVector3||S.isColor?(b.boundary=16,b.storage=12):S.isVector4?(b.boundary=16,b.storage=16):S.isMatrix3?(b.boundary=16,b.storage=48):S.isMatrix4?(b.boundary=16,b.storage=64):S.isTexture?Ie("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(S)?(b.boundary=16,b.storage=S.byteLength):Ie("WebGLRenderer: Unsupported uniform value type.",S),A===!0&&(b.boundary=16,b.storage=Math.ceil(b.storage/16)*16),b}function m(S){let A=S.target;A.removeEventListener("dispose",m),n.deleteBuffer(s[A.id]),delete s[A.id],delete r[A.id]}function g(){for(let S in s)n.deleteBuffer(s[S]);s={},r={}}return{bind:a,update:o,dispose:g}}var $0=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Vi=null;function Z0(){return Vi===null&&(Vi=new rr($0,16,16,In,Ei),Vi.name="DFG_LUT",Vi.minFilter=$t,Vi.magFilter=$t,Vi.wrapS=Ui,Vi.wrapT=Ui,Vi.generateMipmaps=!1,Vi.needsUpdate=!0),Vi}var zo=class{constructor(e={}){let{canvas:t=qh(),context:i=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:f=!1,reversedDepthBuffer:u=!1,outputBufferType:p=ni}=e;this.isWebGLRenderer=!0;let _;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");_=i.getContextAttributes().alpha}else _=a;let M=p,m=new Set([no,io,to]),g=new Set([ni,Ai,Is,Xn,ja,Qa]),S=new Uint32Array(4),A=new Int32Array(4),b={textures:[],min:[],max:[],resolution:[]},E=null,T=null,d=[],v=[],P=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Gi,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let C=this,D=!1,N=null,V=null,R=null,k=null;this._outputColorSpace=qt;let q=0,G=0,te=null,W=-1,j=null,ee=new _t,Te=new _t,Oe=null,Z=new ke(0),me=0,ve=t.width,Ce=t.height,ge=1,ze=null,Mt=null,Le=new _t(0,0,ve,Ce),st=new _t(0,0,ve,Ce),ct=!1,qe=new Tn,Ot=new Pa,wt=!1,Kt=!1,xt=new lt,Li=new B,Rt=new _t,ui={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},di=!1;function fi(){return te===null?ge:1}let U=i;function pi(y,L){return t.getContext(y,L)}let mt,gt,de,At,Re,Ue,w,x,O,ie,K,re,he,Y,$,oe,I,J,X,le,se,ae,Ae;try{let y={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:h,failIfMajorPerformanceCaveat:f};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"187"}`),t.addEventListener("webglcontextlost",Ee,!1),t.addEventListener("webglcontextrestored",Ge,!1),t.addEventListener("webglcontextcreationerror",fe,!1),U===null){let L="webgl2";if(U=pi(L,y),U===null)throw pi(L)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Ve()}catch(y){throw t.removeEventListener("webglcontextlost",Ee,!1),t.removeEventListener("webglcontextrestored",Ge,!1),t.removeEventListener("webglcontextcreationerror",fe,!1),De("WebGLRenderer: "+y.message),y}function Ve(){mt=new ag(U),mt.init(),se=new V0(U,mt),gt=new Zm(U,mt,e,se),de=new k0(U,mt),gt.reversedDepthBuffer&&u&&de.buffers.depth.setReversed(!0),V=U.createFramebuffer(),R=U.createFramebuffer(),k=U.createFramebuffer(),At=new cg(U),Re=new A0,Ue=new G0(U,mt,de,Re,gt,se,At),w=new rg(C),x=new uf(U),ae=new Ym(U,x),O=new og(U,x,At,ae),ie=new ug(U,O,x,ae,At),J=new hg(U,gt,Ue),$=new Jm(Re),K=new w0(C,w,mt,gt,ae,$),re=new q0(C,Re),he=new C0,Y=new N0(mt),I=new qm(C,w,de,ie,_,c),oe=new z0(C,ie,gt),Ae=new Y0(U,At,gt,de),X=new $m(U,mt,At),le=new lg(U,mt,At),At.programs=K.programs,C.capabilities=gt,C.extensions=mt,C.properties=Re,C.renderLists=he,C.shadowMap=oe,C.state=de,C.info=At}M!==ni&&(P=new fg(M,t.width,t.height,o,s,r));let ne=new gc(C,U);this.xr=ne,this.getContext=function(){return U},this.getContextAttributes=function(){return U.getContextAttributes()},this.forceContextLoss=function(){let y=mt.get("WEBGL_lose_context");y&&y.loseContext()},this.forceContextRestore=function(){let y=mt.get("WEBGL_lose_context");y&&y.restoreContext()},this.getPixelRatio=function(){return ge},this.setPixelRatio=function(y){y!==void 0&&(ge=y,this.setSize(ve,Ce,!1))},this.getSize=function(y){return y.set(ve,Ce)},this.setSize=function(y,L,H=!0){if(ne.isPresenting){Ie("WebGLRenderer: Can't change size while VR device is presenting.");return}ve=y,Ce=L,t.width=Math.floor(y*ge),t.height=Math.floor(L*ge),H===!0&&(t.style.width=y+"px",t.style.height=L+"px"),P!==null&&P.setSize(t.width,t.height),this.setViewport(0,0,y,L)},this.getDrawingBufferSize=function(y){return y.set(ve*ge,Ce*ge).floor()},this.setDrawingBufferSize=function(y,L,H){ve=y,Ce=L,ge=H,t.width=Math.floor(y*H),t.height=Math.floor(L*H),this.setViewport(0,0,y,L)},this.setEffects=function(y){if(M===ni){De("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(y){for(let L=0;L<y.length;L++)if(y[L].isOutputPass===!0){Ie("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}P.setEffects(y||[])},this.getCurrentViewport=function(y){return y.copy(ee)},this.getViewport=function(y){return y.copy(Le)},this.setViewport=function(y,L,H,F){y.isVector4?Le.set(y.x,y.y,y.z,y.w):Le.set(y,L,H,F),de.viewport(ee.copy(Le).multiplyScalar(fi()).round())},this.getScissor=function(y){return y.copy(st)},this.setScissor=function(y,L,H,F){y.isVector4?st.set(y.x,y.y,y.z,y.w):st.set(y,L,H,F),de.scissor(Te.copy(st).multiplyScalar(fi()).round())},this.getScissorTest=function(){return ct},this.setScissorTest=function(y){de.setScissorTest(ct=y)},this.setOpaqueSort=function(y){ze=y},this.setTransparentSort=function(y){Mt=y},this.getClearColor=function(y){return y.copy(I.getClearColor())},this.setClearColor=function(){I.setClearColor(...arguments)},this.getClearAlpha=function(){return I.getClearAlpha()},this.setClearAlpha=function(){I.setClearAlpha(...arguments)},this.clear=function(y=!0,L=!0,H=!0){let F=0;if(y){let z=!1;if(te!==null){let ue=te.texture.format;z=m.has(ue)}if(z){let ue=te.texture.type,xe=g.has(ue),ce=I.getClearColor(),_e=I.getClearAlpha(),we=ce.r,Be=ce.g,Ye=ce.b;xe?(S[0]=we,S[1]=Be,S[2]=Ye,S[3]=_e,U.clearBufferuiv(U.COLOR,0,S)):(A[0]=we,A[1]=Be,A[2]=Ye,A[3]=_e,U.clearBufferiv(U.COLOR,0,A))}else F|=U.COLOR_BUFFER_BIT}L&&(F|=U.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),H&&(F|=U.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),F!==0&&U.clear(F)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(y){y.setRenderer(this),N=y},this.dispose=function(){t.removeEventListener("webglcontextlost",Ee,!1),t.removeEventListener("webglcontextrestored",Ge,!1),t.removeEventListener("webglcontextcreationerror",fe,!1),I.dispose(),he.dispose(),Y.dispose(),Ue.dispose(),Re.dispose(),w.dispose(),ie.dispose(),O.dispose(),ae.dispose(),Ae.dispose(),K.dispose(),ne.dispose(),ne.removeEventListener("sessionstart",Tc),ne.removeEventListener("sessionend",wc),Ln.stop()};function Ee(y){y.preventDefault(),Ql("WebGLRenderer: Context Lost."),D=!0}function Ge(){Ql("WebGLRenderer: Context Restored."),D=!1;let y=At.autoReset,L=oe.enabled,H=oe.autoUpdate,F=oe.needsUpdate,z=oe.type;Ve(),At.autoReset=y,oe.enabled=L,oe.autoUpdate=H,oe.needsUpdate=F,oe.type=z}function fe(y){De("WebGLRenderer: A WebGL context could not be created. Reason: ",y.statusMessage)}function rt(y){let L=y.target;L.removeEventListener("dispose",rt),It(L)}function It(y){hn(y),Re.remove(y)}function hn(y){let L=Re.get(y).programs;L!==void 0&&(L.forEach(function(H){K.releaseProgram(H)}),y.isShaderMaterial&&K.releaseShaderCache(y))}this.renderBufferDirect=function(y,L,H,F,z,ue){L===null&&(L=ui);let xe=z.isMesh&&z.matrixWorld.determinantAffine()<0,ce=nd(y,L,H,F,z);de.setMaterial(F,xe);let _e=H.index,we=1;if(F.wireframe===!0){if(_e=O.getWireframeAttribute(H),_e===void 0)return;we=2}let Be=H.drawRange,Ye=H.attributes.position,ye=Be.start*we,$e=(Be.start+Be.count)*we;ue!==null&&(ye=Math.max(ye,ue.start*we),$e=Math.min($e,(ue.start+ue.count)*we)),_e!==null?(ye=Math.max(ye,0),$e=Math.min($e,_e.count)):Ye!=null&&(ye=Math.max(ye,0),$e=Math.min($e,Ye.count));let St=$e-ye;if(St<0||St===1/0)return;ae.setup(z,F,ce,H,_e);let ut,ht=X;if(_e!==null&&(ut=x.get(_e),ht=le,ht.setIndex(ut)),z.isMesh)F.wireframe===!0?(de.setLineWidth(F.wireframeLinewidth*fi()),ht.setMode(U.LINES)):ht.setMode(U.TRIANGLES);else if(z.isLine){let kt=F.linewidth;kt===void 0&&(kt=1),de.setLineWidth(kt*fi()),z.isLineSegments?ht.setMode(U.LINES):z.isLineLoop?ht.setMode(U.LINE_LOOP):ht.setMode(U.LINE_STRIP)}else z.isPoints?ht.setMode(U.POINTS):z.isSprite&&ht.setMode(U.TRIANGLES);if(z.isBatchedMesh)if(mt.get("WEBGL_multi_draw"))ht.renderMultiDraw(z._multiDrawStarts,z._multiDrawCounts,z._multiDrawCount);else{let kt=z._multiDrawStarts,Me=z._multiDrawCounts,Xt=z._multiDrawCount,tt=_e?x.get(_e).bytesPerElement:1,Dn=Re.get(F).currentProgram.getUniforms();for(let Gt=0;Gt<Xt;Gt++)Dn.setValue(U,"_gl_DrawID",Gt),ht.render(kt[Gt]/tt,Me[Gt])}else if(z.isInstancedMesh)ht.renderInstances(ye,St,z.count);else if(H.isInstancedBufferGeometry){let kt=H._maxInstanceCount!==void 0?H._maxInstanceCount:1/0,Me=Math.min(H.instanceCount,kt);ht.renderInstances(ye,St,Me)}else ht.render(ye,St)};function bc(y,L,H,F){N!==null&&y.isNodeMaterial&&N.setObject(F,y),wt===!0&&$.setState(y,H,!1),y.transparent===!0&&y.side===ii&&y.forceSinglePass===!1?(y.side=Zt,y.needsUpdate=!0,Fs(y,L,F),y.side=Rn,y.needsUpdate=!0,Fs(y,L,F),y.side=ii):Fs(y,L,F)}this.compile=function(y,L,H=null){H===null&&(H=y),N!==null&&N.renderStart(y,L,H),T=Y.get(H),T.init(L),v.push(T),H.traverseVisible(function(z){z.isLight&&z.layers.test(L.layers)&&(T.pushLight(z),z.castShadow&&T.pushShadow(z))}),y!==H&&y.traverseVisible(function(z){z.isLight&&z.layers.test(L.layers)&&(T.pushLight(z),z.castShadow&&T.pushShadow(z))}),T.setupLights(),N!==null&&N.updateLights(T.state.lightsArray),Kt=this.localClippingEnabled,wt=$.init(this.clippingPlanes,Kt),wt===!0&&$.setGlobalState(this.clippingPlanes,L),N!==null&&oe.render(T.state.shadowsArray,H,L);let F=new Set;return y.traverse(function(z){if(!(z.isMesh||z.isPoints||z.isLine||z.isSprite))return;let ue=z.material;if(ue)if(Array.isArray(ue))for(let xe=0;xe<ue.length;xe++){let ce=ue[xe];bc(ce,H,L,z),F.add(ce)}else bc(ue,H,L,z),F.add(ue)}),T=v.pop(),N!==null&&N.renderEnd(),F},this.compileAsync=function(y,L,H=null){let F=this.compile(y,L,H);return new Promise(z=>{function ue(){if(F.forEach(function(xe){let _e=Re.get(xe).currentProgram;(_e===void 0||_e.isReady())&&F.delete(xe)}),F.size===0){z(y);return}setTimeout(ue,10)}mt.get("KHR_parallel_shader_compile")!==null?ue():setTimeout(ue,10)})};let Zo=null;function td(y){Zo&&Zo(y)}function Tc(){Ln.stop()}function wc(){Ln.start()}let Ln=new bu;Ln.setAnimationLoop(td),typeof self<"u"&&Ln.setContext(self),this.setAnimationLoop=function(y){Zo=y,ne.setAnimationLoop(y),y===null?Ln.stop():Ln.start()},ne.addEventListener("sessionstart",Tc),ne.addEventListener("sessionend",wc),this.render=function(y,L){if(L!==void 0&&L.isCamera!==!0){De("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(D===!0)return;N!==null&&N.renderStart(y,L);let H=ne.enabled===!0&&ne.isPresenting===!0,F=P!==null&&(te===null||H)&&P.begin(C,te);if(y.matrixWorldAutoUpdate===!0&&y.updateMatrixWorld(),L.parent===null&&L.matrixWorldAutoUpdate===!0&&L.updateMatrixWorld(),ne.enabled===!0&&ne.isPresenting===!0&&(P===null||P.isCompositing()===!1)&&(ne.cameraAutoUpdate===!0&&ne.updateCamera(L),L=ne.getCamera()),y.isScene===!0&&y.onBeforeRender(C,y,L,te),T=Y.get(y,v.length),T.init(L),T.state.textureUnits=Ue.getTextureUnits(),v.push(T),xt.multiplyMatrices(L.projectionMatrix,L.matrixWorldInverse),L.isArrayCamera?Ot.setFromArrayCamera(L):qe.setFromProjectionMatrix(xt,_i,L.reversedDepth),Kt=this.localClippingEnabled,wt=$.init(this.clippingPlanes,Kt),E=he.get(y,d.length),E.init(),d.push(E),this.info.render.frame++,ne.enabled===!0&&ne.isPresenting===!0){let xe=C.xr.getDepthSensingMesh();xe!==null&&Jo(xe,L,-1/0,C.sortObjects)}Jo(y,L,0,C.sortObjects),E.finish(),N!==null&&N.updateLights(T.state.lightsArray),C.sortObjects===!0&&E.sort(ze,Mt),di=ne.enabled===!1||ne.isPresenting===!1||ne.hasDepthSensing()===!1,di&&I.addToRenderList(E,y),this.info.autoReset===!0&&this.info.reset(),wt===!0&&$.beginShadows();let z=T.state.shadowsArray;if(oe.render(z,y,L),wt===!0&&$.endShadows(),(F&&P.hasRenderPass())===!1){let xe=E.opaque,ce=E.transmissive;if(T.setupLights(),L.isArrayCamera){let _e=L.cameras;if(ce.length>0)for(let we=0,Be=_e.length;we<Be;we++){let Ye=_e[we];Ec(xe,ce,y,Ye)}di&&I.render(y);for(let we=0,Be=_e.length;we<Be;we++){let Ye=_e[we];Ac(E,y,Ye,Ye.viewport)}}else ce.length>0&&Ec(xe,ce,y,L),di&&I.render(y),Ac(E,y,L)}te!==null&&G===0&&(Ue.updateMultisampleRenderTarget(te),Ue.updateRenderTargetMipmap(te)),F&&P.end(C),y.isScene===!0&&y.onAfterRender(C,y,L),ae.resetDefaultState(),W=-1,j=null,v.pop(),v.length>0?(T=v[v.length-1],Ue.setTextureUnits(T.state.textureUnits),wt===!0&&$.setGlobalState(C.clippingPlanes,T.state.camera)):T=null,d.pop(),d.length>0?E=d[d.length-1]:E=null,N!==null&&N.renderEnd()};function Jo(y,L,H,F){if(y.visible===!1)return;if(y.layers.test(L.layers)){if(y.isGroup)H=y.renderOrder;else if(y.isLOD)y.autoUpdate===!0&&y.update(L);else if(y.isLight)T.pushLight(y),y.castShadow&&T.pushShadow(y);else if(y.isSprite){let xe=L.isArrayCamera?Ot:qe;if(!y.frustumCulled||y.intersectsFrustum(xe)){F&&Rt.setFromMatrixPosition(y.matrixWorld).applyMatrix4(xt);let ce=ie.update(y),_e=y.material;_e.visible&&E.push(y,ce,_e,H,Rt.z,null,L)}}else if(y.isMesh||y.isLine||y.isPoints){let xe=L.isArrayCamera?Ot:qe;if(!y.frustumCulled||y.intersectsFrustum(xe)){let ce=ie.update(y),_e=y.material;if(F&&(y.boundingSphere!==void 0?(y.boundingSphere===null&&y.computeBoundingSphere(),Rt.copy(y.boundingSphere.center)):(ce.boundingSphere===null&&ce.computeBoundingSphere(),Rt.copy(ce.boundingSphere.center)),Rt.applyMatrix4(y.matrixWorld).applyMatrix4(xt)),Array.isArray(_e)){let we=ce.groups;for(let Be=0,Ye=we.length;Be<Ye;Be++){let ye=we[Be],$e=_e[ye.materialIndex];$e&&$e.visible&&E.push(y,ce,$e,H,Rt.z,ye,L)}}else _e.visible&&E.push(y,ce,_e,H,Rt.z,null,L)}}}let ue=y.children;for(let xe=0,ce=ue.length;xe<ce;xe++)Jo(ue[xe],L,H,F)}function Ac(y,L,H,F){let{opaque:z,transmissive:ue,transparent:xe}=y;T.setupLightsView(H),wt===!0&&$.setGlobalState(C.clippingPlanes,H),F&&de.viewport(ee.copy(F)),z.length>0&&Gr(z,L,H),ue.length>0&&Gr(ue,L,H),xe.length>0&&Gr(xe,L,H),de.buffers.depth.setTest(!0),de.buffers.depth.setMask(!0),de.buffers.color.setMask(!0),de.setPolygonOffset(!1)}function Ec(y,L,H,F){if((H.isScene===!0?H.overrideMaterial:null)!==null)return;if(T.state.transmissionRenderTarget[F.id]===void 0){let ye=mt.has("EXT_color_buffer_half_float")||mt.has("EXT_color_buffer_float");T.state.transmissionRenderTarget[F.id]=new ci(1,1,{generateMipmaps:!0,type:ye?Ei:ni,minFilter:sn,samples:Math.max(4,gt.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:Je.workingColorSpace})}let ue=T.state.transmissionRenderTarget[F.id],xe=F.viewport||ee;ue.setSize(xe.z*C.transmissionResolutionScale,xe.w*C.transmissionResolutionScale);let ce=C.getRenderTarget(),_e=C.getActiveCubeFace(),we=C.getActiveMipmapLevel();C.setRenderTarget(ue),C.getClearColor(Z),me=C.getClearAlpha(),me<1&&C.setClearColor(16777215,.5),C.clear(),di&&I.render(H);let Be=C.toneMapping;C.toneMapping=Gi;let Ye=F.viewport;if(F.viewport!==void 0&&(F.viewport=void 0),T.setupLightsView(F),wt===!0&&$.setGlobalState(C.clippingPlanes,F),Gr(y,H,F),Ue.updateMultisampleRenderTarget(ue),Ue.updateRenderTargetMipmap(ue),mt.has("WEBGL_multisampled_render_to_texture")===!1){let ye=!1;for(let $e=0,St=L.length;$e<St;$e++){let ut=L[$e],{object:ht,geometry:kt,material:Me,group:Xt}=ut;if(Me.side===ii&&ht.layers.test(F.layers)){let tt=Me.side;Me.side=Zt,Me.needsUpdate=!0,Cc(ht,H,F,kt,Me,Xt),Me.side=tt,Me.needsUpdate=!0,ye=!0}}ye===!0&&(Ue.updateMultisampleRenderTarget(ue),Ue.updateRenderTargetMipmap(ue))}C.setRenderTarget(ce,_e,we),C.setClearColor(Z,me),Ye!==void 0&&(F.viewport=Ye),C.toneMapping=Be}function Gr(y,L,H){let F=L.isScene===!0?L.overrideMaterial:null;for(let z=0,ue=y.length;z<ue;z++){let xe=y[z],{object:ce,geometry:_e,group:we}=xe,Be=xe.material;Be.allowOverride===!0&&F!==null&&(Be=F),ce.layers.test(H.layers)&&Cc(ce,L,H,_e,Be,we)}}function Cc(y,L,H,F,z,ue){N!==null&&z.isNodeMaterial&&N.setObject(y,z),y.onBeforeRender(C,L,H,F,z,ue),y.modelViewMatrix.multiplyMatrices(H.matrixWorldInverse,y.matrixWorld),y.normalMatrix.getNormalMatrix(y.modelViewMatrix),z.onBeforeRender(C,L,H,F,y,ue),z.transparent===!0&&z.side===ii&&z.forceSinglePass===!1?(z.side=Zt,z.needsUpdate=!0,C.renderBufferDirect(H,L,F,z,y,ue),z.side=Rn,z.needsUpdate=!0,C.renderBufferDirect(H,L,F,z,y,ue),z.side=ii):C.renderBufferDirect(H,L,F,z,y,ue),y.onAfterRender(C,L,H,F,z,ue)}function Rc(y){let L=0;for(let H of y)H.texture!==null&&L++;return L}function Fs(y,L,H){L.isScene!==!0&&(L=ui);let F=Re.get(y),z=T.state.lights,ue=T.state.shadowsArray,xe=z.state.version,ce=K.getParameters(y,z.state,ue,L,H,T.state.lightProbeGridArray),_e=K.getProgramCacheKey(ce),we=F.programs;F.environment=y.isMeshStandardMaterial||y.isMeshLambertMaterial||y.isMeshPhongMaterial?L.environment:null,F.fog=L.fog;let Be=y.isMeshStandardMaterial||y.isMeshLambertMaterial&&!y.envMap||y.isMeshPhongMaterial&&!y.envMap;F.envMap=w.get(y.envMap||F.environment,Be),F.envMapRotation=F.environment!==null&&y.envMap===null?L.environmentRotation:y.envMapRotation,we===void 0&&(y.addEventListener("dispose",rt),we=new Map,F.programs=we,F.programVariants=new Map);let Ye=we.get(_e);if(Ye!==void 0){if(F.currentProgram===Ye&&F.lightsStateVersion===xe)return Pc(y,ce),Ye}else ce.uniforms=K.getUniforms(y),N!==null&&y.isNodeMaterial&&N.build(y,H,ce),y.onBeforeCompile(ce,C),Ye=K.acquireProgram(ce,_e),we.set(_e,Ye),F.uniforms=ce.uniforms;let ye=F.uniforms;return(!y.isShaderMaterial&&!y.isRawShaderMaterial||y.clipping===!0)&&(ye.clippingPlanes=$.uniform),Pc(y,ce),F.needsLights=rd(y),F.lightsStateVersion=xe,F.needsLights&&(ye.ambientLightColor.value=z.state.ambient,ye.lightProbe.value=z.state.probe,ye.sunLights.value=z.state.sun,ye.sunLightShadows.value=z.state.sunShadow,ye.directionalLights.value=z.state.directional,ye.directionalLightShadows.value=z.state.directionalShadow,ye.spotLights.value=z.state.spot,ye.spotLightShadows.value=z.state.spotShadow,ye.rectAreaLights.value=z.state.rectArea,ye.ltc_1.value=z.state.rectAreaLTC1,ye.ltc_2.value=z.state.rectAreaLTC2,ye.pointLights.value=z.state.point,ye.pointLightShadows.value=z.state.pointShadow,ye.hemisphereLights.value=z.state.hemi,ye.sunShadowMatrix.value=z.state.sunShadowMatrix,ye.sunShadowCascade.value=z.state.sunShadowCascade,ye.directionalShadowMatrix.value=z.state.directionalShadowMatrix,ye.spotLightMatrix.value=z.state.spotLightMatrix,ye.spotLightMap.value=z.state.spotLightMap,ye.pointShadowMatrix.value=z.state.pointShadowMatrix),F.numLightProbeGrids=Rc(T.state.lightProbeGridArray),F.currentProgram=Ye,F.uniformsList=null,Ye}function id(y,L,H,F,z){let ue=Re.get(y),xe=ue.currentProgram.id+","+F+","+z,ce=ue.programVariants.get(xe);return ce===void 0?(ce=Fs(y,L,H),ue.programVariants.set(xe,ce)):(ue.currentProgram=ce,ue.uniformsList=null,ue.outputColorSpace=F,ue.toneMapping=z),ce}function Ic(y){if(y.uniformsList===null){let L=y.currentProgram.getUniforms();y.uniformsList=Ls.seqWithValue(L.seq,y.uniforms)}return y.uniformsList}function Pc(y,L){let H=Re.get(y);H.outputColorSpace=L.outputColorSpace,H.batching=L.batching,H.batchingColor=L.batchingColor,H.instancing=L.instancing,H.instancingColor=L.instancingColor,H.instancingMorph=L.instancingMorph,H.skinning=L.skinning,H.morphTargets=L.morphTargets,H.morphNormals=L.morphNormals,H.morphColors=L.morphColors,H.morphTargetsCount=L.morphTargetsCount,H.numClippingPlanes=L.numClippingPlanes,H.numIntersection=L.numClipIntersection,H.vertexAlphas=L.vertexAlphas,H.vertexTangents=L.vertexTangents,H.toneMapping=L.toneMapping}function nd(y,L,H,F,z){L.isScene!==!0&&(L=ui),Ue.resetTextureUnits();let ue=L.fog,xe=F.isMeshStandardMaterial||F.isMeshLambertMaterial||F.isMeshPhongMaterial?L.environment:null,ce=te===null?C.outputColorSpace:te.isXRRenderTarget===!0?te.texture.colorSpace:Je.workingColorSpace,_e=F.isMeshStandardMaterial||F.isMeshLambertMaterial&&!F.envMap||F.isMeshPhongMaterial&&!F.envMap,we=w.get(F.envMap||xe,_e),Be=F.vertexColors===!0&&!!H.attributes.color&&H.attributes.color.itemSize===4,Ye=!!H.attributes.tangent&&(!!F.normalMap||F.anisotropy>0),ye=!!H.morphAttributes.position,$e=!!H.morphAttributes.normal,St=!!H.morphAttributes.color,ut=Gi;F.toneMapped&&(te===null||te.isXRRenderTarget===!0)&&(ut=C.toneMapping);let ht=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,kt=ht!==void 0?ht.length:0,Me=Re.get(F),Xt=T.state.lights;if(wt===!0&&(Kt===!0||y!==j)){let vt=y===j&&F.id===W;$.setState(F,y,vt)}let tt=!1,Dn=!1;F.version===Me.__version?Me.needsLights&&Me.lightsStateVersion!==Xt.state.version||z.isBatchedMesh&&Me.batching===!1||!z.isBatchedMesh&&Me.batching===!0||z.isBatchedMesh&&Me.batchingColor===!0&&z._colorsTexture===null||z.isBatchedMesh&&Me.batchingColor===!1&&z._colorsTexture!==null||z.isInstancedMesh&&Me.instancing===!1||!z.isInstancedMesh&&Me.instancing===!0||z.isSkinnedMesh&&Me.skinning===!1||!z.isSkinnedMesh&&Me.skinning===!0||z.isInstancedMesh&&Me.instancingColor===!0&&z.instanceColor===null||z.isInstancedMesh&&Me.instancingColor===!1&&z.instanceColor!==null||z.isInstancedMesh&&Me.instancingMorph===!0&&z.morphTexture===null||z.isInstancedMesh&&Me.instancingMorph===!1&&z.morphTexture!==null||Me.envMap!==we||F.fog===!0&&Me.fog!==ue||Me.numClippingPlanes!==void 0&&(Me.numClippingPlanes!==$.numPlanes||Me.numIntersection!==$.numIntersection)||Me.vertexAlphas!==Be||Me.vertexTangents!==Ye||Me.morphTargets!==ye||Me.morphNormals!==$e||Me.morphColors!==St||Me.morphTargetsCount!==kt||Me.numLightProbeGrids!==Rc(T.state.lightProbeGridArray)?tt=!0:(Me.outputColorSpace!==ce||Me.toneMapping!==ut)&&(Dn=!0):(tt=!0,Me.__version=F.version);let Gt=Me.currentProgram;(tt===!0||Dn===!0)&&(Gt=Dn===!0?id(F,L,z,ce,ut):Fs(F,L,z),N&&F.isNodeMaterial&&N.onUpdateProgram(F,Gt,Me));let Vr=!1,un=!1,Nn=!1,et=Gt.getUniforms(),Bt=Me.uniforms;if(de.useProgram(Gt.program)&&(Vr=!0,un=!0,Nn=!0),F.id!==W&&(W=F.id,un=!0),Vr||j!==y){de.buffers.depth.getReversed()&&y.reversedDepth!==!0&&(y._reversedDepth=!0,y.updateProjectionMatrix()),et.setValue(U,"projectionMatrix",y.projectionMatrix),et.setValue(U,"viewMatrix",y.matrixWorldInverse);let Pt=et.map.cameraPosition;Pt!==void 0&&Pt.setValue(U,Li.setFromMatrixPosition(y.matrixWorld)),gt.logarithmicDepthBuffer&&et.setValue(U,"logDepthBufFC",2/(Math.log(y.far+1)/Math.LN2)),(F.isMeshPhongMaterial||F.isMeshToonMaterial||F.isMeshLambertMaterial||F.isMeshBasicMaterial||F.isMeshStandardMaterial||F.isShaderMaterial)&&et.setValue(U,"isOrthographic",y.isOrthographicCamera===!0),j!==y&&(j=y,un=!0,Nn=!0)}if(Me.needsLights&&(Xt.state.sunShadowMap.length>0&&et.setValue(U,"sunShadowMap",Xt.state.sunShadowMap,Ue),Xt.state.directionalShadowMap.length>0&&et.setValue(U,"directionalShadowMap",Xt.state.directionalShadowMap,Ue),Xt.state.spotShadowMap.length>0&&et.setValue(U,"spotShadowMap",Xt.state.spotShadowMap,Ue),Xt.state.pointShadowMap.length>0&&et.setValue(U,"pointShadowMap",Xt.state.pointShadowMap,Ue)),z.isSkinnedMesh){et.setOptional(U,z,"bindMatrix"),et.setOptional(U,z,"bindMatrixInverse");let vt=z.skeleton;vt&&(vt.boneTexture===null&&vt.computeBoneTexture(),et.setValue(U,"boneTexture",vt.boneTexture,Ue))}z.isBatchedMesh&&(et.setOptional(U,z,"batchingTexture"),et.setValue(U,"batchingTexture",z._matricesTexture,Ue),et.setOptional(U,z,"batchingIdTexture"),et.setValue(U,"batchingIdTexture",z._indirectTexture,Ue),et.setOptional(U,z,"batchingColorTexture"),z._colorsTexture!==null&&et.setValue(U,"batchingColorTexture",z._colorsTexture,Ue));let yi=H.morphAttributes;if((yi.position!==void 0||yi.normal!==void 0||yi.color!==void 0)&&J.update(z,H,Gt),(un||Me.receiveShadow!==z.receiveShadow)&&(Me.receiveShadow=z.receiveShadow,et.setValue(U,"receiveShadow",z.receiveShadow)),(F.isMeshStandardMaterial||F.isMeshLambertMaterial||F.isMeshPhongMaterial)&&F.envMap===null&&L.environment!==null&&(Bt.envMapIntensity.value=L.environmentIntensity),Bt.dfgLUT!==void 0&&(Bt.dfgLUT.value=Z0()),un){if(et.setValue(U,"toneMappingExposure",C.toneMappingExposure),Me.needsLights&&sd(Bt,Nn),ue&&F.fog===!0&&re.refreshFogUniforms(Bt,ue),re.refreshMaterialUniforms(Bt,F,ge,Ce,T.state.transmissionRenderTarget[y.id]),Me.needsLights&&Me.numLightProbeGrids>0){let vt=b,Pt=0;for(let Yi of T.state.lightProbeGridArray)Yi.texture!==null&&(vt.textures[Pt]=Yi.texture,vt.min[Pt]=Yi.boundingBox.min,vt.max[Pt]=Yi.boundingBox.max,vt.resolution[Pt]=Yi.resolution,Pt++);for(let Yi in vt)vt[Yi].length=Pt;Bt.probesSH.value=vt.textures,Bt.probesMin.value=vt.min,Bt.probesMax.value=vt.max,Bt.probesResolution.value=vt.resolution}Ls.upload(U,Ic(Me),Bt,Ue)}if(F.isShaderMaterial&&F.uniformsNeedUpdate===!0&&(Ls.upload(U,Ic(Me),Bt,Ue),F.uniformsNeedUpdate=!1),F.isSpriteMaterial&&et.setValue(U,"center",z.center),et.setValue(U,"modelViewMatrix",z.modelViewMatrix),et.setValue(U,"normalMatrix",z.normalMatrix),et.setValue(U,"modelMatrix",z.matrixWorld),F.uniformsGroups!==void 0){let vt=F.uniformsGroups;for(let Pt=0,Yi=vt.length;Pt<Yi;Pt++){let Dc=vt[Pt];Ae.update(Dc,Gt),Ae.bind(Dc,Gt)}}return Gt}function sd(y,L){y.ambientLightColor.needsUpdate=L,y.lightProbe.needsUpdate=L,y.sunLights.needsUpdate=L,y.sunLightShadows.needsUpdate=L,y.directionalLights.needsUpdate=L,y.directionalLightShadows.needsUpdate=L,y.pointLights.needsUpdate=L,y.pointLightShadows.needsUpdate=L,y.spotLights.needsUpdate=L,y.spotLightShadows.needsUpdate=L,y.rectAreaLights.needsUpdate=L,y.hemisphereLights.needsUpdate=L}function rd(y){return y.isMeshLambertMaterial||y.isMeshToonMaterial||y.isMeshPhongMaterial||y.isMeshStandardMaterial||y.isShadowMaterial||y.isShaderMaterial&&y.lights===!0}this.getActiveCubeFace=function(){return q},this.getActiveMipmapLevel=function(){return G},this.getRenderTarget=function(){return te},this.setRenderTargetTextures=function(y,L,H){let F=Re.get(y);F.__autoAllocateDepthBuffer=y.resolveDepthBuffer===!1,F.__autoAllocateDepthBuffer===!1&&(F.__useRenderToTexture=!1),Re.get(y.texture).__webglTexture=L,Re.get(y.depthTexture).__webglTexture=F.__autoAllocateDepthBuffer?void 0:H,F.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(y,L){let H=Re.get(y);H.__webglFramebuffer=L,H.__useDefaultFramebuffer=L===void 0},this.setRenderTarget=function(y,L=0,H=0){te=y,q=L,G=H;let F=null,z=!1,ue=!1;if(y){let ce=Re.get(y);if(ce.__useDefaultFramebuffer!==void 0){de.bindFramebuffer(U.FRAMEBUFFER,ce.__webglFramebuffer),ee.copy(y.viewport),Te.copy(y.scissor),Oe=y.scissorTest,de.viewport(ee),de.scissor(Te),de.setScissorTest(Oe),W=-1;return}else if(ce.__webglFramebuffer===void 0)Ue.setupRenderTarget(y);else if(ce.__hasExternalTextures)Ue.rebindTextures(y,Re.get(y.texture).__webglTexture,Re.get(y.depthTexture).__webglTexture);else if(y.depthBuffer){let Be=y.depthTexture;if(ce.__boundDepthTexture!==Be){if(Be!==null&&Re.has(Be)&&(y.width!==Be.image.width||y.height!==Be.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Ue.setupDepthRenderbuffer(y)}}let _e=y.texture;(_e.isData3DTexture||_e.isDataArrayTexture||_e.isCompressedArrayTexture)&&(ue=!0);let we=Re.get(y).__webglFramebuffer;y.isWebGLCubeRenderTarget?(Array.isArray(we[L])?F=we[L][H]:F=we[L],z=!0):y.samples>0&&Ue.useMultisampledRTT(y)===!1?F=Re.get(y).__webglMultisampledFramebuffer:Array.isArray(we)?F=we[H]:F=we,ee.copy(y.viewport),Te.copy(y.scissor),Oe=y.scissorTest}else ee.copy(Le).multiplyScalar(ge).floor(),Te.copy(st).multiplyScalar(ge).floor(),Oe=ct;if(H!==0&&(F=V),de.bindFramebuffer(U.FRAMEBUFFER,F)&&de.drawBuffers(y,F),de.viewport(ee),de.scissor(Te),de.setScissorTest(Oe),z){let ce=Re.get(y.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_CUBE_MAP_POSITIVE_X+L,ce.__webglTexture,H)}else if(ue){let ce=L;for(let _e=0;_e<y.textures.length;_e++){let we=Re.get(y.textures[_e]);U.framebufferTextureLayer(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0+_e,we.__webglTexture,H,ce)}}else if(y!==null&&H!==0){let ce=Re.get(y.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,ce.__webglTexture,H)}W=-1};function Lc(y){let L=Re.get(y);return(L.__readFormat!==y.format||L.__readType!==y.type)&&(L.__readFormat=y.format,L.__readType=y.type,L.__formatReadable=gt.textureFormatReadable(y.format),L.__typeReadable=gt.textureTypeReadable(y.type)),L}this.readRenderTargetPixels=function(y,L,H,F,z,ue,xe,ce=0){if(!(y&&y.isWebGLRenderTarget)){De("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let _e=Re.get(y).__webglFramebuffer;if(y.isWebGLCubeRenderTarget&&xe!==void 0&&(_e=_e[xe],Array.isArray(_e)&&(_e=_e[0])),_e){de.bindFramebuffer(U.FRAMEBUFFER,_e);try{let we=y.textures[ce],Be=we.format,Ye=we.type;y.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+ce);let ye=Lc(we);if(ye.__formatReadable===!1){De("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(ye.__typeReadable===!1){De("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}L>=0&&L<=y.width-F&&H>=0&&H<=y.height-z&&U.readPixels(L,H,F,z,se.convert(Be),se.convert(Ye),ue)}finally{let we=te!==null?Re.get(te).__webglFramebuffer:null;de.bindFramebuffer(U.FRAMEBUFFER,we)}}},this.readRenderTargetPixelsAsync=async function(y,L,H,F,z,ue,xe,ce=0){if(!(y&&y.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let _e=Re.get(y).__webglFramebuffer;if(y.isWebGLCubeRenderTarget&&xe!==void 0&&(_e=_e[xe],Array.isArray(_e)&&(_e=_e[0])),_e)if(L>=0&&L<=y.width-F&&H>=0&&H<=y.height-z){de.bindFramebuffer(U.FRAMEBUFFER,_e);let we=y.textures[ce],Be=we.format,Ye=we.type;y.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+ce);let ye=Lc(we);if(ye.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(ye.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let $e=U.createBuffer();U.bindBuffer(U.PIXEL_PACK_BUFFER,$e),U.bufferData(U.PIXEL_PACK_BUFFER,ue.byteLength,U.STREAM_READ),U.readPixels(L,H,F,z,se.convert(Be),se.convert(Ye),0),U.bindBuffer(U.PIXEL_PACK_BUFFER,null);let St=te!==null?Re.get(te).__webglFramebuffer:null;de.bindFramebuffer(U.FRAMEBUFFER,St);let ut=U.fenceSync(U.SYNC_GPU_COMMANDS_COMPLETE,0);return U.flush(),await $h(U,ut,4),U.bindBuffer(U.PIXEL_PACK_BUFFER,$e),U.getBufferSubData(U.PIXEL_PACK_BUFFER,0,ue),U.bindBuffer(U.PIXEL_PACK_BUFFER,null),U.deleteBuffer($e),U.deleteSync(ut),ue}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(y,L=null,H=0){let F=Math.pow(2,-H),z=Math.floor(y.image.width*F),ue=Math.floor(y.image.height*F),xe=L!==null?L.x:0,ce=L!==null?L.y:0;Ue.setTexture2D(y,0),U.copyTexSubImage2D(U.TEXTURE_2D,H,0,0,xe,ce,z,ue),de.unbindTexture()},this.copyTextureToTexture=function(y,L,H=null,F=null,z=0,ue=0){let xe,ce,_e,we,Be,Ye,ye,$e,St,ut=y.isCompressedTexture?y.mipmaps[ue]:y.image;if(H!==null)xe=H.max.x-H.min.x,ce=H.max.y-H.min.y,_e=H.isBox3?H.max.z-H.min.z:1,we=H.min.x,Be=H.min.y,Ye=H.isBox3?H.min.z:0;else{let et=Math.pow(2,-z);xe=Math.floor(ut.width*et),ce=Math.floor(ut.height*et),y.isDataArrayTexture?_e=ut.depth:y.isData3DTexture?_e=Math.floor(ut.depth*et):_e=1,we=0,Be=0,Ye=0}F!==null?(ye=F.x,$e=F.y,St=F.z):(ye=0,$e=0,St=0);let ht=se.convert(L.format),kt=se.convert(L.type),Me;L.isData3DTexture?(Ue.setTexture3D(L,0),Me=U.TEXTURE_3D):L.isDataArrayTexture||L.isCompressedArrayTexture?(Ue.setTexture2DArray(L,0),Me=U.TEXTURE_2D_ARRAY):(Ue.setTexture2D(L,0),Me=U.TEXTURE_2D),de.activeTexture(U.TEXTURE0),de.pixelStorei(U.UNPACK_FLIP_Y_WEBGL,L.flipY),de.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL,L.premultiplyAlpha),de.pixelStorei(U.UNPACK_ALIGNMENT,L.unpackAlignment);let Xt=de.getParameter(U.UNPACK_ROW_LENGTH),tt=de.getParameter(U.UNPACK_IMAGE_HEIGHT),Dn=de.getParameter(U.UNPACK_SKIP_PIXELS),Gt=de.getParameter(U.UNPACK_SKIP_ROWS),Vr=de.getParameter(U.UNPACK_SKIP_IMAGES);de.pixelStorei(U.UNPACK_ROW_LENGTH,ut.width),de.pixelStorei(U.UNPACK_IMAGE_HEIGHT,ut.height),de.pixelStorei(U.UNPACK_SKIP_PIXELS,we),de.pixelStorei(U.UNPACK_SKIP_ROWS,Be),de.pixelStorei(U.UNPACK_SKIP_IMAGES,Ye);let un=y.isDataArrayTexture||y.isData3DTexture,Nn=L.isDataArrayTexture||L.isData3DTexture;if(y.isDepthTexture){let et=Re.get(y),Bt=Re.get(L),yi=Re.get(et.__renderTarget),vt=Re.get(Bt.__renderTarget);de.bindFramebuffer(U.READ_FRAMEBUFFER,yi.__webglFramebuffer),de.bindFramebuffer(U.DRAW_FRAMEBUFFER,vt.__webglFramebuffer);for(let Pt=0;Pt<_e;Pt++)un&&(U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Re.get(y).__webglTexture,z,Ye+Pt),U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Re.get(L).__webglTexture,ue,St+Pt)),U.blitFramebuffer(we,Be,we+xe,Be+ce,ye,$e,ye+xe,$e+ce,U.DEPTH_BUFFER_BIT,U.NEAREST);de.bindFramebuffer(U.READ_FRAMEBUFFER,null),de.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else if(z!==0||y.isRenderTargetTexture||Re.has(y)){let et=Re.get(y),Bt=Re.get(L);de.bindFramebuffer(U.READ_FRAMEBUFFER,R),de.bindFramebuffer(U.DRAW_FRAMEBUFFER,k);for(let yi=0;yi<_e;yi++)un?U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,et.__webglTexture,z,Ye+yi):U.framebufferTexture2D(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,et.__webglTexture,z),Nn?U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Bt.__webglTexture,ue,St+yi):U.framebufferTexture2D(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,Bt.__webglTexture,ue),z!==0?U.blitFramebuffer(we,Be,we+xe,Be+ce,ye,$e,ye+xe,$e+ce,U.COLOR_BUFFER_BIT,U.NEAREST):Nn?U.copyTexSubImage3D(Me,ue,ye,$e,St+yi,we,Be,xe,ce):U.copyTexSubImage2D(Me,ue,ye,$e,we,Be,xe,ce);de.bindFramebuffer(U.READ_FRAMEBUFFER,null),de.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else Nn?y.isDataTexture||y.isData3DTexture?U.texSubImage3D(Me,ue,ye,$e,St,xe,ce,_e,ht,kt,ut.data):L.isCompressedArrayTexture?U.compressedTexSubImage3D(Me,ue,ye,$e,St,xe,ce,_e,ht,ut.data):U.texSubImage3D(Me,ue,ye,$e,St,xe,ce,_e,ht,kt,ut):y.isDataTexture?U.texSubImage2D(U.TEXTURE_2D,ue,ye,$e,xe,ce,ht,kt,ut.data):y.isCompressedTexture?U.compressedTexSubImage2D(U.TEXTURE_2D,ue,ye,$e,ut.width,ut.height,ht,ut.data):U.texSubImage2D(U.TEXTURE_2D,ue,ye,$e,xe,ce,ht,kt,ut);de.pixelStorei(U.UNPACK_ROW_LENGTH,Xt),de.pixelStorei(U.UNPACK_IMAGE_HEIGHT,tt),de.pixelStorei(U.UNPACK_SKIP_PIXELS,Dn),de.pixelStorei(U.UNPACK_SKIP_ROWS,Gt),de.pixelStorei(U.UNPACK_SKIP_IMAGES,Vr),ue===0&&L.generateMipmaps===!0&&L.mipmapsAutoUpdate===!0&&U.generateMipmap(Me),de.unbindTexture()},this.initRenderTarget=function(y){Re.get(y).__webglFramebuffer===void 0&&Ue.setupRenderTarget(y)},this.initTexture=function(y){y.isCubeTexture?Ue.setTextureCube(y,0):y.isData3DTexture?Ue.setTexture3D(y,0):y.isDataArrayTexture||y.isCompressedArrayTexture?Ue.setTexture2DArray(y,0):Ue.setTexture2D(y,0),de.unbindTexture()},this.resetState=function(){q=0,G=0,te=null,de.reset(),ae.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return _i}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=Je._getDrawingBufferColorSpace(e),t.unpackColorSpace=Je._getUnpackColorSpace()}};var $n=(Ze-1)/2,Zn=(ft-1)/2,Nu={city:[9205609,6848145,11241077,7630209,12690058],port:[6783891,10258027,11825251,7641493,10396330],island:[12620664,9542776,12028283,7113868,10527400],industry:[6716295,12026460,8612199,8291724,9606777],suburb:[11901820,12023664,7568529,12160877,10786727],rural:[10450524,10397812,12099958,8164994,12157545]},Fr={dusk:{fog:2436162,sky:12172287,sun:16761230,energy:2.9,ambient:2.6,x:-15,y:16,z:-11},night:{fog:1186868,sky:10270719,sun:10009599,energy:1.3,ambient:1.67,x:15,y:19,z:-16},day:{fog:3624032,sky:13034239,sun:16772042,energy:2.45,ambient:2.75,x:-13,y:22,z:-10}},Nr=[Fr.day,Fr.dusk,Fr.night],K0={safe:5301436,soldier:8834004,watch:10147050,sniper:10465023,flame:16756065,turret:7456989,mortar:11708136,wall:7965852,barricade:13338957,gate:7843473,mines:16759912,explosive:16741460,tank:9352089,para:10344168,heli:7588526},Fu={box:new wn(1,1,1),ball:new dr(.5,0),round:new ws(.5,.5,1,8),cone:new ur(.5,1,6),flat:new kn(1,1),ring:new fr(.46,.5,56)},Ur=new Ut,Ou=new ke,j0=new B(0,1,0),Vo=(n,e={})=>new Ts({color:n,...e}),Ri=new pr({roughness:.9}),Jn=Vo(16777215),Q0=Vo(16777215,{side:ii});function Bu(n,e,t,i,s,r,a,o,c,l=0,h=0){Ur.position.set(t,i,s),Ur.rotation.set(h,l,0,"YXZ"),Ur.scale.set(r,a,o),Ur.updateMatrix(),n.setMatrixAt(e,Ur.matrix),n.setColorAt(e,Ou.set(c))}function Ft(n,e,t,i=Ri,s=!1){let r=new or(Fu[e],i,t);return r.castShadow=s,r.receiveShadow=i===Ri,r.frustumCulled=!1,r.count=0,n.add(r),r}function on(n,e){e.forEach((t,i)=>Bu(n,i,...t)),n.count=e.length,n.instanceMatrix.needsUpdate=!0,n.instanceColor&&(n.instanceColor.needsUpdate=!0)}function Uu(n){for(let e of[...n.children])e.dispose?.(),n.remove(e)}var Se=(n,e,t,i,s,r,a,o,c=0)=>n.push([e,i,t,s,r,a,o,c]),Ho=class{constructor(e,t="medium"){this.canvas=e,this.renderer=new zo({canvas:e,antialias:t!=="low",alpha:!1,powerPreference:"high-performance"}),this.renderer.outputColorSpace=qt,this.renderer.toneMapping=Sr,this.renderer.toneMappingExposure=1.05,this.renderer.shadowMap.type=Gn,this.scene=new tr,this.scene.fog=new er(2436162,.016),this.skyBlend=new ke,this.camera=new Yt(44,1,.12,105),this.focus=new B($n,0,Zn),this.angle=.16,this.tilt=.96,this.zoom=27,this.sun=new yr(16761230,2),this.sun.target.position.set($n,0,Zn),this.sun.shadow.camera.left=-19,this.sun.shadow.camera.right=19,this.sun.shadow.camera.top=16,this.sun.shadow.camera.bottom=-16,this.sun.shadow.camera.far=70,this.sun.shadow.normalBias=.035,this.sun.shadow.bias=-15e-5,this.sun.shadow.radius=2,this.sun.castShadow=!0,this.sky=new _r(13033471,5263454,2),this.scene.add(this.sun,this.sun.target,this.sky),this.city=new Fi,this.scene.add(this.city),this.dynamic=new Fi,this.scene.add(this.dynamic),this.people=Ft(this.dynamic,"box",4096,Ri),this.heads=Ft(this.dynamic,"ball",4096,Ri),this.contacts=Ft(this.dynamic,"round",4096,Jn),this.gear=Ft(this.dynamic,"box",4400,Ri,!0),this.radars=Ft(this.dynamic,"ring",500,Q0),this.trails=Ft(this.dynamic,"box",420,Jn),this.debris=Ft(this.dynamic,"ball",650,Ri),this.guides=Ft(this.dynamic,"box",550,Jn),this.flare=Ft(this.dynamic,"ball",520,Jn),this.outbreak=Ft(this.dynamic,"flat",Ze*ft,Vo(16777215,{side:ii,transparent:!0,opacity:.61,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-2})),this.outbreak.renderOrder=1,this.hover=new ti(Fu.ring,Vo(16765057,{side:ii,transparent:!0,opacity:.72,depthWrite:!1})),this.hover.rotation.x=-Math.PI/2,this.hover.visible=!1,this.scene.add(this.hover),this.ray=new Mr,this.floor=new li(j0,0),this.vec=new B,this.fx=[],this.last=-1,this.slowFrame=0,this.quality(t),this.resize()}quality(e){if(this.setting===e)return;this.setting=e;let t=e==="low";this.renderer.setPixelRatio(Math.min(devicePixelRatio,t?.85:e==="high"?1.85:1.3)),this.renderer.shadowMap.enabled=!t,this.sun.shadow.map?.dispose(),this.sun.shadow.map=null,this.sun.shadow.mapSize.set(e==="high"?2048:1024,e==="high"?2048:1024),this.renderer.shadowMap.needsUpdate=!0,this.resize()}resize(){let e=this.canvas.clientWidth||1,t=this.canvas.clientHeight||1;e===this.width&&t===this.height&&this.pixelRatio===this.renderer.getPixelRatio()||(this.width=e,this.height=t,this.pixelRatio=this.renderer.getPixelRatio(),this.renderer.setSize(e,t,!1),this.camera.aspect=e/t,this.camera.updateProjectionMatrix())}cameraAt(){this.camera.position.set(this.focus.x+Math.sin(this.angle)*Math.cos(this.tilt)*this.zoom,this.zoom*Math.sin(this.tilt),this.focus.z+Math.cos(this.angle)*Math.cos(this.tilt)*this.zoom),this.camera.lookAt(this.focus),this.camera.updateMatrixWorld()}reset(e=!1){this.angle=e?-.52:this.tactical?0:.16,this.tilt=e?.63:this.tactical?1.45:.99,this.zoom=e?30:this.tactical?this.camera.aspect<1?41:29:this.camera.aspect<1?35:27,this.focus.set(e?10.5:$n,0,e?7:Zn),this.cameraAt()}switchProjection(){this.tactical=!this.tactical,this.tilt=this.tactical?1.45:.99,this.angle=this.tactical?0:.16,this.city.scale.y=this.tactical?.69:1,this.renderer.shadowMap.needsUpdate=!0,this.cameraAt()}focusAt(e){let[t,i]=ot(e);this.focus.set(t,0,i),this.cameraAt()}pick(e,t){let i=this.canvas.getBoundingClientRect();if(this.ray.setFromCamera({x:(e-i.left)/i.width*2-1,y:1-(t-i.top)/i.height*2},this.camera),!this.ray.ray.intersectPlane(this.floor,this.vec))return-1;let s=Math.round(this.vec.x),r=Math.round(this.vec.z);return s<0||r<0||s>=Ze||r>=ft?-1:r*Ze+s}project(e,t,i=.55){return this.vec.set(e,i,t).project(this.camera),[(this.vec.x+1)*.5*this.width,(1-this.vec.y)*.5*this.height,this.vec.z<1]}pan(e,t){let i=this.zoom/Math.max(300,this.height)*.83,s=this.angle;this.focus.x=qn.clamp(this.focus.x+(-Math.cos(s)*e-Math.sin(s)*t)*i,0,Ze-1),this.focus.z=qn.clamp(this.focus.z+(Math.sin(s)*e-Math.cos(s)*t)*i,0,ft-1),this.cameraAt()}zoomBy(e){this.zoom=qn.clamp(this.zoom*e,9,this.camera.aspect<1?46:38),this.cameraAt()}build(e,t=!1){this.map=e.map,this.tactical=!t&&!!e.mission.containment,this.commandOrigin=-1,this.hover.visible=!1,this.city.scale.y=this.tactical?.69:1,this.light=Fr[e.mission.light]||Fr.dusk,this.scene.background=new ke(this.light.fog),this.scene.fog.color.copy(this.scene.background),Uu(this.city),this.fx.length=0,this.last=-1,this.cityParts(e),this.renderer.shadowMap.needsUpdate=!0,this.reset(t)}cityParts(e){let{cells:t,seed:i}=e.map,s=es(i+11),{theme:r,light:a}=e.mission,o=Nu[r]||Nu.city,c=r==="city",l=r==="industry",h=r==="port",f=a==="night",u=r==="rural"||r==="suburb",p=[],_=[],M=[],m=[],g=[],S=[],A=[],b=[];Se(M,$n,Zn,-.28,Ze+.72,.35,ft+.72,3292238),Se(M,$n,Zn,-.56,Ze+.25,.2,ft+.25,4739430),Se(M,$n,Zn,-.87,185,.2,185,2239555);for(let E=0;E<t.length;E++){let[T,d]=ot(E),v=t[E],P=s();if(v===Fe.water||v===Fe.bridge){Se(M,T,d,-.13,1.005,.08,1.005,2384506);for(let N=0;N<3;N++)Se(S,T+(s()-.5)*.8,d+(s()-.5)*.95,-.079,.13+s()*.38,.008,.018,6989497);if(v===Fe.water)continue}let C=v===Fe.road||v===Fe.bridge,D=4278615;if(v===Fe.block&&(D=7828604),v===Fe.park&&(D=u?5862490:5270624),Se(M,T,d,C?-.058:.005,1.008,.105,1.008,D),v===Fe.bridge)for(let N of[-1,1])Se(p,T,d+N*.42,.1,.99,.145,.065,9544614),Se(_,T,d+N*.36,.015,.91,.012,.025,16762233);if(v===Fe.block){let N=o[Math.floor(P*o.length)],V=c&&P>.69,R=(V?1.35:u?.31:l?.44:.54)+(V?1.42:u?.47:.7)*s(),k=l||h?.81:.61+s()*.18,q=.59+s()*.23;if(Se(M,T,d,.07,.91,.11,.89,8881547),Se(p,T,d,R/2+.07,k,R,q,N),Se(p,T,d,R+.09,k+.045,.085,q+.045,u?5198433:4344418),u&&P>.4&&Se(m,T,d,R+.22,k*1.15,.3,q*1.09,7360606,Math.PI/4),(P>.3||l)&&(Se(p,T+.14,d-.14,R+.17,.22,.13,.23,9738145),V&&Se(p,T+.14,d-.14,R+.32,.035,.31,.035,13676210)),h&&P<.29)for(let G=0;G<3;G++)Se(p,T,d,R+.18+G*.04,k*.85,.09,.26,o[(G+2)%o.length]);l&&P>.66&&(Se(b,T+.18,d+.15,R+.36,.31,.57,.31,10196629),Se(b,T+.18,d+.15,R+.67,.37,.07,.37,5133153)),h&&d>=14&&P>.63&&(Se(p,T-.25,d,R+.56,.08,1,.08,15249007),Se(p,T+.07,d,R+1.02,.76,.08,.08,14065507),Se(p,T+.39,d,R+.76,.023,.48,.023,5724525));for(let G=.24;G<R-.03;G+=.29)for(let te of[-.18,.03,.23]){let W=s()>(f?.44:.86)?16763769:5594742;Se(_,T+te,d+q/2+.008,G,.105,.094,.014,W),Se(_,T-k/2-.007,d+te,G,.013,.094,.1,W)}}if(v===Fe.park)for(let N=0;N<(P>.68?3:1);N++){let V=T+(s()-.5)*.72,R=d+(s()-.5)*.72,k=.35+s()*.34;Se(p,V,R,k*.29,.075,k*.55,.075,6902349),Se(g,V,R,k*.84,.42,k*.85,.4,N%2?7443332:u?6852955:5473394),Se(g,V+.09,R-.08,k*1.05,.28,k*.67,.28,8495238)}if(C){let N=T<Ze-1&&at(t,E+1),V=d<ft-1&&at(t,E+Ze);if(N&&Se(M,T,d,.002,.39,.008,.025,8025204),V&&Se(M,T,d,.003,.025,.008,.39,8025204),N&&V&&T>0&&d>0&&at(t,E-1)&&at(t,E-Ze))for(let R=-2;R<=2;R++)Se(M,T+R*.1,d+.32,.014,.053,.008,.15,11183521),Se(M,T+.32,d+R*.1,.014,.15,.008,.053,11183521);if(P>.87&&(Se(p,T-.39,d+.37,.26,.027,.52,.027,2962502),Se(A,T-.35,d+.37,.53,.11,.031,.068,16761211)),P<.075){let R=N?Math.PI/2:0;Se(p,T-.2,d-.2,.07,.19,.12,.38,o[(E+2)%o.length],R),Se(p,T-.2,d-.2,.142,.16,.045,.205,3623003,R)}}}this.waterItems=S,this.waterMesh=Ft(this.city,"box",S.length||1,Jn),on(this.waterMesh,S),this.lampItems=A,this.lampMesh=Ft(this.city,"box",A.length||1,Jn),on(this.lampMesh,A),on(Ft(this.city,"box",M.length,Ri),M),on(Ft(this.city,"box",p.length,Ri,!0),p),on(Ft(this.city,"box",_.length,Jn),_),on(Ft(this.city,"cone",m.length||1,Ri,!0),m),on(Ft(this.city,"ball",g.length||1,Ri,!0),g),on(Ft(this.city,"round",b.length||1,Ri,!0),b)}highlight(e,t,i){if(this.hover.visible=e>=0&&!!t,!this.hover.visible)return;let[s,r]=ot(e),o=Lt[t]?.range||{air:2.3,missile:2.25,gas:2.5,heli:3.8,tank:4.5,para:1}[t]||.52;this.hover.position.set(s,.086,r),this.hover.scale.setScalar(o*2.03),this.hover.material.color.set(i?7992529:16750977)}addEffects(e){for(let{type:t,i,id:s,from:r}of e)["wave","breach","boss","gas","blast","infected","flame","shot","spit","infect","collapse","rescue","support","siren","level","build"].includes(t)&&this.fx.push({type:t,i,id:s,from:r,age:0,seed:Math.random()*1e3});this.fx.length>130&&this.fx.splice(0,this.fx.length-130)}render(e,t,i,s=!1,r=!1){this.resize(),s&&(this.angle=-.52+Math.sin(t*.19)*.085,this.cameraAt());let a=Math.max(0,e.time-12)/93,o=(Nr.indexOf(this.light)+Math.floor(a))%Nr.length,c=Nr[o],l=Nr[(o+1)%Nr.length],h=qn.smoothstep(a%1,0,1),f=qn.lerp;this.sun.color.set(c.sun).lerp(this.skyBlend.set(l.sun),h),this.sun.position.set($n+f(c.x,l.x,h),f(c.y,l.y,h),Zn+f(c.z,l.z,h)),this.sun.intensity=f(c.energy,l.energy,h),this.sky.color.set(c.sky).lerp(this.skyBlend.set(l.sky),h),this.sky.intensity=f(c.ambient,l.ambient,h),this.scene.background.set(c.fog).lerp(this.skyBlend.set(l.fog),h),this.scene.fog.color.copy(this.scene.background),e.bridgeDamage.size!==this.last&&e.bridgeDamage.size&&(Uu(this.city),this.cityParts(e),this.last=e.bridgeDamage.size);let u=[],p=[],_=[],M=[],m=[],g=[],S=[],A=[],b=[],E=[],T=this.setting!=="low"||this.zoom<18;for(let d of[e.civs,e.zombies])for(let v of d){if(u.length+_.length>=4096)break;let P=jn[v.id],C=P?.size||.91;if(this.tactical){let N=(P?.size||1)*(v.id==="fast"?.31:.19);Se(_,v.x,v.z,.12,N,.041,N,P?16742747:10348031),v.id==="boss"&&Se(A,v.x,v.z,.37,.46,.46,.46,16732463);continue}let D=.016*Math.sin(t*16+v.ox*21)*C;Se(u,v.x,v.z,.17*C+D,.14*C,.22*C,.11*C,P?P.color:7921141,v.angle),(T||v.id==="boss")&&Se(p,v.x,v.z,.32*C+D,.13*C,.145*C,.13*C,P?P.color:16040870,v.angle),v.id==="boss"&&(Se(M,v.x,v.z,.33,.78,.16,.18,11620987,v.angle),Se(A,v.x,v.z,.96,.5,.04,.08,16735067))}for(let d of e.units.values())this.unit(M,m,A,d,t);for(let d of e.marches){this.unit(M,m,A,d.u,t,[d.x,d.z],d.angle);let[v,P]=ot(d.to);this.tactical&&m.push([v,.038,P,.88,.88,1,10082044,0,-Math.PI/2])}if(e.units.has(this.commandOrigin)){let[d,v]=ot(this.commandOrigin);m.push([d,.055,v,1.22,1.22,1,9760733,0,-Math.PI/2])}for(let d of e.reinf)["heli","tank","para"].includes(d.id)&&e.time>=d.t&&this.unit(M,m,A,d,t);for(let d of e.clouds)for(let v=0;v<10;v++){let P=v*.87+t*.45;Se(S,d.x+Math.cos(P)*(1+v%3*.37),d.z+Math.sin(P)*(1+v%3*.37),.18+Math.sin(P*2)*.08,.52,.21,.52,9611099)}for(let d=0;d<e.fog.length;d++){let v=e.fog[d];if(v<.16||!at(e.map.cells,d))continue;let[P,C]=ot(d),D=this.tactical?v>.69?12997440:v>.35?9780535:6501938:v>.69?15169344:v>.35?11229011:7751509;E.push([P,.025,C,.91,.91,1,D,0,-Math.PI/2])}if(e.guide.length)for(let[d,v]of e.guide.entries()){let[P,C]=ot(v),D=d>0?ot(e.guide[d-1]):null;Se(b,P,C,.049,.15,.015,.15,7076566),D&&Math.abs(P-D[0])+Math.abs(C-D[1])===1&&Se(b,(P+D[0])/2,(C+D[1])/2,.042,P===D[0]?.047:.94,.012,C===D[1]?.047:.94,5027244)}if(!s&&(e.combat||e.phase==="prep")){let[d,v]=ot(e.map.start),P=t*1.45%1,C=.74+P*1.65;m.push([d,.042,v,C,C,1,P<.55?16754033:9849929,0,-Math.PI/2]),e.mission.containment&&e.phase==="prep"&&m.push([d,.043,v,4.5,4.5,1,12543313,0,-Math.PI/2])}for(let d of this.fx)r||(d.age+=i),this.effect(d,g,S,A,t);if(this.fx=this.fx.filter(d=>d.age<3.5),this.setting!=="low"&&t-this.slowFrame>.11){for(let[d,v]of this.waterItems.entries()){let[P,C,D,N,V,R,k]=v;Bu(this.waterMesh,d,P+Math.sin(t+d)*.043,C,D,N*(.82+.18*Math.sin(t+d)),V,R,k)}this.waterMesh.instanceMatrix.needsUpdate=!0;for(let d=0;d<this.lampItems.length;d+=7){let v=Math.sin(t*20+d)+Math.sin(t*6+d*4);this.lampMesh.setColorAt(d,Ou.set(v>-.9?16764812:7630206))}this.lampMesh.instanceColor&&(this.lampMesh.instanceColor.needsUpdate=!0),this.slowFrame=t}for(let[d,v]of[[this.people,u],[this.heads,p],[this.contacts,_],[this.gear,M],[this.radars,m],[this.trails,g],[this.debris,S],[this.flare,A],[this.outbreak,E],[this.guides,b]])on(d,v.length>d.instanceMatrix.count?v.slice(0,d.instanceMatrix.count):v);this.renderer.render(this.scene,this.camera)}unit(e,t,i,s,r,a=ot(s.i),o=s.angle){let[c,l]=a,h=s.id,f=K0[h]||11000290,u=(_,M,m,g,S=f,A=0,b=0,E=0)=>Se(e,c+b,l+E,_,M,m,g,S,A),p=(_,M)=>t.push([c,.041,l,_,_,1,M,0,-Math.PI/2]);if(h==="safe")u(.12,.72,.23,.72,2442837),u(.28,.63,.12,.6,f),u(.354,.1,.02,.39,15859691),u(.355,.38,.02,.1,15859691),p(1.06,7531717);else if(h==="heli"){let _=1.21+.09*Math.sin(r*2.5);u(_,.37,.21,.68),u(_,.093,.072,.76,f,0,0,-.46),u(_+.13,1.6,.028,.067,9942478,r*16),u(_+.04,.84,.026,.075,9682641,r*13),p(1,7531717)}else if(h==="wall"||h==="barricade"||h==="gate"){if(u(.097,.69,.18,.66,3228759),u(.23,.86,h==="wall"?.39:.25,.26,f),h!=="wall")for(let _ of[-.3,0,.3])u(.37,.095,.19,.3,14202237,0,_,0)}else if(h==="mines"||h==="explosive"){for(let[_,M]of[[-.17,.16],[.19,.13],[0,-.21]])u(.075,.2,.12,.19,5261138,0,_,M),Math.sin(r*4+_*13)>0&&Se(i,c+_,l+M,.15,.075,.075,.075,f);p(.75,f)}else{let _=h==="watch"?.58:h==="tank"?.26:.19;u(.07,.58,.13,.56,3427678),u(_*.68,h==="watch"?.24:.43,_,.38,f);let M=o||0;u(_+.12,.35,.15,.3,f,M),h==="para"&&u(_+.11,.15,.23,.16,11263980,0,-.22,.12),u(_+.16,.093,.074,h==="sniper"?.51:.37,2898259,M,Math.sin(M)*.21,Math.cos(M)*.21),p(.83,5343386)}if(s.level>1)for(let _=1;_<s.level;_++)Se(i,c-.23+_*.14,l+.28,.43,.08,.075,.08,16766587)}effect(e,t,i,s,r){let[a,o]=ot(e.i),c=e.age;if(e.type==="shot"||e.type==="spit"){if(c>.22)return;let[l,h]=ot(e.from),f=Math.hypot(l-a,h-o),u=e.type==="spit"?12293375:16766604;Se(t,(a+l)/2,(o+h)/2,.29,.026,.025,f,u,Math.atan2(a-l,o-h)),Se(s,a,o,.28,.115,.115,.115,u),Se(i,l+.14+c,h-.16,.2+c*.65,.05,.055,.09,13346148)}else if(e.type==="blast"||e.type==="infected"||e.type==="flame"||e.type==="collapse"){let l=e.type==="flame",h=this.setting==="low"?4:l?5:12;for(let f=0;f<h;f++){let u=f*2.399+e.seed,p=(f%4+1)*c*.49,_=.18+Math.max(0,Math.sin(Math.min(1,c)*Math.PI*.85))*(f%3+1)*.47;if(c<.56){let M=(this.tactical?.29+.115*(f%4):.38+.18*(f%5))*(1-c)*(l?.56:1);Se(s,a+Math.cos(u)*p,o+Math.sin(u)*p,_,M,M*1.1,M,f%2?16759636:16740669)}if(!l&&c<2.8){let M=(.34+.052*f)*(1-c/3.2);Se(i,a+Math.cos(u)*p*.63,o+Math.sin(u)*p*.63,_+c*.31,M,M,M,f%2?5000024:6710389),c<.91&&Se(i,a+Math.cos(u)*p*1.9,o+Math.sin(u)*p*1.9,_,.065,.067,.089,11171419)}}}else if(e.type==="support"&&c<1.8){if(e.id==="air"||e.id==="heli"){let l=a+12-c*11,h=o-5+c*5.2,f=2.7-c*.55;Se(t,l,h,f,1.32,.13,.31,9286348,-.44),Se(t,l,h,f,.26,.19,.91,11322325,-.44),e.id==="heli"&&Se(t,l,h,f+.17,1.9,.027,.05,11130071,r*22)}else if(e.id==="missile"&&c<1.57){let l=2.3*(1.6-c);Se(s,a+c*.26,o+.23,l,.19,.53,.18,16758356);for(let h=0;h<8;h++)Se(i,a+c*.26,o+.23,l+h*.23,.23,.3,.23,10657965)}else if(e.id==="para"&&c<1.45)for(let l=0;l<3;l++){let h=1.8*(1.45-c);Se(s,a-.5+l*.45,o+.18*l,h+.16,.4,.2,.37,15004884),Se(t,a-.5+l*.45,o+.18*l,h,.073,.26,.073,11322325)}}else if(c<.61&&["rescue","infect","level","boss","siren","build","breach"].includes(e.type)){let l=["infect","boss","siren","breach"].includes(e.type)?16750176:7989196,h=.22+c*.56;for(let f=0;f<4;f++)Se(s,a+Math.cos(f*1.57+c)*h,o+Math.sin(f*1.57+c)*h,.21+c*.47,.085,.085,.085,l)}if(this.setting!=="low"&&(e.type==="siren"||e.type==="breach"))for(let l=0;l<9;l++){let h=a+Math.cos(l*2.39)*c*(1.35+l*.14),f=o+Math.sin(l*2.39)*c*2.4,u=.68+c*(.8+l*.15),p=.11*Math.sin(c*18+l);Se(t,h-.085,f,u+p,.19,.022,.05,12697291,-.45),Se(t,h+.085,f,u-p,.19,.022,.05,12697291,.45)}}};var e_=[48,51,55,58,46,50,53,57],Wo=class{async wake(){try{if(!this.ctx){this.ctx=new(window.AudioContext||window.webkitAudioContext),this.noise=this.ctx.createBuffer(1,this.ctx.sampleRate,this.ctx.sampleRate);let e=this.noise.getChannelData(0);for(let t=0;t<e.length;t++)e[t]=Math.random()*2-1}this.ctx.state==="suspended"&&await this.ctx.resume()}catch{}}voice(e,t,i,s,r="sine",a=0){if(this.ctx?.state!=="running")return;let o=this.ctx.currentTime+a,c=this.ctx.createOscillator(),l=this.ctx.createGain();c.type=r,c.frequency.setValueAtTime(e,o),c.frequency.exponentialRampToValueAtTime(Math.max(18,t),o+i),l.gain.setValueAtTime(1e-4,o),l.gain.exponentialRampToValueAtTime(s,o+Math.min(.035,i*.4)),l.gain.exponentialRampToValueAtTime(1e-4,o+i),c.connect(l).connect(this.ctx.destination),c.start(o),c.stop(o+i+.02)}rustle(e,t,i){if(this.ctx?.state!=="running")return;let s=this.ctx.currentTime,r=this.ctx.createBufferSource(),a=this.ctx.createBiquadFilter(),o=this.ctx.createGain();r.buffer=this.noise,a.type="lowpass",a.frequency.setValueAtTime(e,s),a.frequency.exponentialRampToValueAtTime(57,s+t),o.gain.setValueAtTime(i,s),o.gain.exponentialRampToValueAtTime(1e-4,s+t),r.connect(a).connect(o).connect(this.ctx.destination),r.start(s),r.stop(s+t+.02)}tick(e,t,i,s){if(this.ctx?.state!=="running")return;let r=this.ctx.currentTime,a=new Set(e.map(l=>l.type));if(t.sound){if(a.has("shot")&&r>(this.lastShot||0)&&(this.rustle(1600,.11,.034),this.lastShot=r+.085),(a.has("blast")||a.has("collapse"))&&(this.rustle(550,.66,.08),this.voice(83,25,.49,.066,"triangle")),a.has("flame")&&this.rustle(2100,.34,.031),a.has("infect")&&r>(this.lastGrowl||0)&&(this.voice(89,46,.31,.032,"sawtooth"),this.lastGrowl=r+.31),(a.has("siren")||a.has("boss")||a.has("wave")||a.has("breach"))&&(this.voice(280,490,.42,.041,"triangle"),this.voice(490,260,.63,.042,"triangle",.37)),a.has("support")&&e.some(l=>l.id==="heli"||l.id==="air"))for(let l=0;l<12;l++)this.voice(70-l*2,37,.18,.027,"triangle",l*.11);(a.has("build")||a.has("level"))&&this.voice(520,680,.14,.029,"triangle"),a.has("rescue")&&r>(this.lastRescue||0)&&(this.voice(482,660,.2,.019),this.lastRescue=r+.37)}if(!t.music||!s||r<(this.next||0))return;let o=this.note||0,c=440*2**((e_[o%8]-(i?14:0)-69)/12);this.voice(c,c*(i?.985:1),i?.57:1.68,.027,i?"triangle":"sine"),o%4===0&&this.voice(c*.5,c*.5,i?1.32:2.55,.046),this.next=r+(i?.36:1.13),this.note=o+1}};var ln=n=>document.getElementById(n),Xe=Object.fromEntries(["app","topbar","screen","hud","metrics","stage","brief","dock","pins","world","radar","modal","toast","file"].map(n=>[n,ln(n)])),ri=n=>String(n).replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]),je=(n,e,t="button",i="")=>`<button class="${t}" data-action="${e}" data-value="${i}">${n}</button>`,Xu=n=>`${String(Math.floor(n/60)).padStart(2,"0")}:${String(Math.floor(n%60)).padStart(2,"0")}`,Mc=n=>"\u2605".repeat(n)+"\u2606".repeat(3-n),t_=[["containment","Confinement"],["campaign","Campagne"],["special","Op\xE9rations sp\xE9ciales"],["survival","Survie"],["tree","Comp\xE9tences"],["badges","Succ\xE8s"],["editor","\xC9diteur"]],qo=[[5,62],[13,68],[21,51],[29,41],[37,59],[45,56],[53,34],[61,46],[69,64],[77,57],[85,39],[94,41]],qu=[0,.5,1,2,4],Yu=n=>n===0?"\u2161":n===.5?"\xD70,5":"\xD7"+n,$u=["#414c61","#75839d","#245872","#4e705e","#b9a083"],Zu=[...Object.keys(mi)],Wi=new Map,Ns=new Wo,i_=Xe.radar.getContext("2d"),be=Oc(),Qe="title",Jt="",Ii=1,dt="soldier",kr="",Q=new ts(zt[0]),it,Xi=0,Ju=0,zu,vi,Xo=0,ku=0,Yo=0,Gu=0,Pe,Tt;try{Pe=new Ho(Xe.world,be.opts.quality)}catch{Xe.stage.innerHTML="",Kn("error","WebGL indisponible",'<p>Le rendu 3D n\xE9cessite WebGL 2. Activez l\u2019acc\xE9l\xE9ration graphique ou ouvrez le jeu dans un navigateur r\xE9cent.</p><p><a class="button" href="../">Revenir aux jeux</a></p>')}Pe&&(Us("title"),requestAnimationFrame(ed));function qi(){Bc(be)||si("Le stockage du navigateur est indisponible. Exportez votre sauvegarde.")}function si(n){Xe.toast.textContent=n,Xe.toast.hidden=!1,clearTimeout(zu),zu=setTimeout(()=>Xe.toast.hidden=!0,2600)}function n_(){Xe.topbar.innerHTML=`<button class="brand" data-action="${Qe==="mission"?"pause":"home"}"><span class="logo" aria-hidden="true">\u25EC</span> Derni\xE8re Sir\xE8ne</button><div class="top-actions">${Qe==="mission"?je("Pause","pause","small")+je("Param\xE8tres","settings","small"):je("Param\xE8tres","settings","small")+'<a class="small" href="../">Mes jeux</a>'}</div>`}function Us(n){if(Qe=n,zr(),Xe.app.className="app "+(Qe==="mission"?"mission":Qe==="title"?"title":"menu"),Xe.hud.hidden=Qe!=="mission",Xe.stage.hidden=Qe!=="mission"&&Qe!=="title",Xe.pins.replaceChildren(),n_(),Qe==="title"){Q=new ts({...Qn[0],light:"dusk"}),Pe.resize(),Pe.build(Q,!0),Xe.screen.innerHTML=`<section class="title-copy">
      <div class="eyebrow">Commandement de crise</div>
      <h1>Derni\xE8re<br><em>Sir\xE8ne</em></h1>
      <p>Un foyer vient d\u2019appara\xEEtre en ville. Ouvre les voies d\u2019\xE9vacuation et d\xE9place tes escouades avant que la horde ne gagne les rues voisines.</p>
      <div class="title-actions">${je("Contenir un foyer","nav","button primary","containment")}${je("Campagne","nav","button outline","campaign")}</div>
    </section><footer class="title-footer">CONFINEMENT \xB7 CAMPAGNE \xB7 SURVIE</footer>
    <div class="title-address"><span>\u25EC FOYER SIGNAL\xC9</span><br>CANAL DES VERRERIES</div>`;return}if(Qe==="mission"){Xe.screen.replaceChildren(),Pe.resize(),Pe.build(Q),ju(),Pi(!0);return}Pn()}function _c(n,e,t,i=!1,s=0){return`<button class="mission-card ${n.theme}" data-action="${e}" data-value="${t}" ${i?"disabled":""}>
    <small class="eyebrow">${typeof n.id=="number"?String(n.id+1).padStart(2,"0")+" \xB7 ":""}${n.zone}</small><strong>${ri(n.name)}</strong>
    ${n.rule?`<small>${ri(n.rule)}</small>`:i?"<small>Mission pr\xE9c\xE9dente requise</small>":`<span class="stars" aria-label="${s} \xE9toiles">${Mc(s)}</span>`}
  </button>`}function s_(){return`<div class="campaign-map" aria-label="Itin\xE9raire des op\xE9rations"><canvas id="estuary" width="1000" height="164" aria-hidden="true"></canvas>
    ${zt.map(({id:n,name:e})=>{let[t,i]=qo[n],s=String(n+1).padStart(2,"0");return`<button class="map-node ${be.records[n]?"cleared":mn(be,n)?"next":""}" style="--x:${t}%;--y:${i}%" data-action="mission" data-value="${n}" title="${ri(e)}" aria-label="Secteur ${s}" ${mn(be,n)?"":"disabled"}>${s}</button>`}).join("")}
  </div>`}function r_(){let n=ln("estuary").getContext("2d");n.fillStyle="#172d3b",n.fillRect(0,0,1e3,164);for(let e of[-1,1])n.beginPath(),n.moveTo(-40,82+e*28),n.bezierCurveTo(210,102+e*39,290,27+e*50,490,70+e*34),n.bezierCurveTo(620,97+e*48,740,108+e*28,1010,39+e*48),n.lineTo(1010,e>0?165:-1),n.lineTo(-40,e>0?165:-1),n.closePath(),n.fillStyle=e>0?"#283a3c":"#263640",n.fill(),n.strokeStyle="#577067",n.lineWidth=1.4,n.stroke();for(let e=35;e<1e3;e+=45)n.beginPath(),n.moveTo(e,0),n.lineTo(e,164),n.strokeStyle="#bed1e216",n.lineWidth=1,n.stroke();for(let e=12;e<164;e+=23)n.beginPath(),n.moveTo(0,e),n.lineTo(1e3,e),n.stroke();n.lineWidth=2,n.lineJoin="round";for(let e=1;e<qo.length;e++){let[t,i]=qo[e-1],[s,r]=qo[e];n.beginPath(),n.moveTo(t*10,i*1.64),n.lineTo(s*10,r*1.64),n.strokeStyle=mn(be,e)?"#8fe4c4":"#929ca282",n.setLineDash(mn(be,e)?[]:[5,4]),n.stroke()}}function Pn(){let n={containment:"Confinement",campaign:"Carte des missions",special:"Op\xE9rations sp\xE9ciales",survival:"Survie infinie",tree:"Arbre de comp\xE9tences",badges:"Succ\xE8s",editor:"\xC9diteur de ville"},e=Object.values(be.records).reduce((r,a)=>r+a.stars,0),t={containment:"Un foyer au d\xE9part. Chaque civil infect\xE9 rejoint la horde. \xC9limine-la pour s\xE9curiser le secteur.",campaign:`${Object.keys(be.records).length} / 12 termin\xE9es \xB7 ${e} / 36 \xE9toiles`,special:"Des r\xE8gles qui changent la d\xE9fense.",survival:`Record \xB7 ${be.survival} vague${be.survival===1?"":"s"}`,tree:`${$r(be)} point(s) disponible(s). Une premi\xE8re victoire rapporte un point.`,badges:`${be.badges.length} / ${Bs.length} d\xE9verrouill\xE9s`,editor:"Dessinez votre ville, testez-la et sauvegardez-la sur cet appareil."},i="";Qe==="containment"&&(i=`<div class="matrix">${Qn.map(r=>{let a=be.containment[r.id];return`<button class="mission-card ${r.theme}" data-action="mission" data-value="${r.id}">
      <small class="eyebrow">${r.zone}</small><strong>${r.name}</strong><small>${r.pop} civils${a?` \xB7 Record ${a.saved} sauv\xE9s`:""}</small>${a?`<span class="stars">${Mc(a.stars)}</span>`:""}
    </button>`}).join("")}</div>`),Qe==="campaign"&&(i=s_()+`<div class="matrix">${zt.map(r=>_c(r,"mission",r.id,!mn(be,r.id),be.records[r.id]?.stars||0)).join("")}</div>`),Qe==="special"&&(i=`<div class="matrix">${Ko.map(r=>_c(r,"mission",r.id)).join("")}</div>`),Qe==="survival"&&(i=`<div class="matrix">${_c(Os,"mission",Os.id)}</div>`),Qe==="tree"&&(i=`<div class="matrix tree-grid">${Hr.map(r=>`<section class="tree-card"><h3>${r.icon} ${r.name}</h3>${r.nodes.map(([a,o,c],l)=>{let h=be.skills.includes(a),f=!h&&$r(be)>0&&(l===0||be.skills.includes(r.nodes[l-1][0]));return`<button class="tree-node ${h?"learned":""}" data-action="learn" data-value="${a}" ${f?"":"disabled"}><strong>${o}${h?" \u2713":""}</strong><small>${c}</small></button>`}).join("")}</section>`).join("")}</div>`),Qe==="badges"&&(i=`<div class="matrix">${Bs.map(([r,a,o])=>`<div class="badge-card ${be.badges.includes(r)?"complete":""}"><strong>${be.badges.includes(r)?"\u2605":"\u2606"} ${a}</strong><small>${o}</small></div>`).join("")}</div>`),Qe==="editor"&&(it||$o(),i=`<div class="editor"><canvas id="editor-grid" width="625" height="475" aria-label="Grille de la ville \xE0 \xE9diter"></canvas><div class="editor-tools">
      <label>Nom de la ville <input id="city-name" maxlength="38" value="${ri(it.name)}"></label>
      <div class="options-row">${["Rue","B\xE2timent","Parc","Eau","Pont","Foyer","Refuge"].map((r,a)=>je(r,"paint","tab "+(it.brush===a?"active":""),a)).join("")}</div>
      <div class="options-row">${je("Enregistrer","saveCity","button primary")}${je("Tester","testCity")}${je("Nouvelle grille","newCity")}</div>
      <div id="cities">${be.cities.map((r,a)=>`<div class="city-card"><strong>${ri(r.name)}</strong><div class="options-row">${je("Modifier","editCity","small",a)}${je("Jouer","runCity","small",a)}${je("Supprimer","deleteCity","small",a)}</div></div>`).join("")}</div>
    </div></div>`);let s=["containment","campaign","special","survival"].includes(Qe)?`<div class="options-row">${Object.entries(Un).map(([r,a])=>je(a.name,"difficulty","tab "+(r===be.opts.level?"active":""),r)).join("")}</div>`:"";Xe.screen.innerHTML=`<section class="shell"><div class="content"><div class="heading"><div><div class="eyebrow">Poste de commandement</div><h1>${n[Qe]}</h1><p>${t[Qe]}</p></div>${s}</div>
    <nav class="tabs" aria-label="Modes de jeu">${t_.map(([r,a])=>je(a,"nav","tab "+(r===Qe?"active":""),r)).join("")}</nav>${i}
  </div></section>`,Qe==="campaign"&&r_(),Qe==="editor"&&a_()}function $o(n=null,e=-1){let t=n?.seed||Math.floor(Math.random()*3e4)+1,i=n?{cells:n.layout,start:n.start,end:n.end}:Xr({...zt[0],seed:t});it={name:n?.name||"Nouvelle ville",layout:i.cells.slice(),start:i.start,end:i.end,seed:t,brush:0,index:e}}function Vu(){let n=ln("editor-grid").getContext("2d"),e=25;for(let[t,i]of it.layout.entries()){let[s,r]=ot(t);n.fillStyle=$u[i],n.fillRect(s*e,r*e,e-1,e-1),(t===it.start||t===it.end)&&(n.fillStyle=t===it.start?"#ffa787":"#88ffda",n.beginPath(),n.arc(s*e+e/2,r*e+e/2,8,0,Math.PI*2),n.fill())}}function a_(){let n=ln("editor-grid");Vu(),ln("city-name").oninput=t=>it.name=t.target.value;let e=t=>{let i=n.getBoundingClientRect(),s=Math.floor((t.clientX-i.left)/i.width*Ze),r=Math.floor((t.clientY-i.top)/i.height*ft);if(s<0||s>=Ze||r<0||r>=ft)return;let a=jt(s,r);it.brush===5||it.brush===6?(at(it.layout,a)||(it.layout[a]=Fe.road),it[it.brush===5?"start":"end"]=a):it.layout[a]=[Fe.road,Fe.block,Fe.park,Fe.water,Fe.bridge][it.brush],Vu()};n.onpointerdown=t=>{n.setPointerCapture(t.pointerId),e(t)},n.onpointermove=t=>{(t.buttons||n.hasPointerCapture(t.pointerId))&&e(t)}}function Ku(n){return{...zt[2],...n,id:"local-"+n.seed,zone:"VILLE PERSONNALIS\xC9E",boss:!1,briefing:["Commandement","Votre ville, vos itin\xE9raires. Installez vos \xE9quipes et ouvrez les abris."]}}function Hu(n=!1){if(!it.name.trim())return si("Donnez un nom \xE0 la ville.");if(!qr(it.layout,it.start,it.end))return si("Reliez le foyer au refuge et pr\xE9voyez au moins 30 cases habitables.");let e={name:it.name.trim(),layout:it.layout.slice(),start:it.start,end:it.end,seed:it.seed};if(n)return Or(Ku(e));if(it.index<0){if(be.cities.length>=20)return si("Limite de 20 villes atteinte.");it.index=be.cities.push(e)-1}else be.cities[it.index]=e;Di(be,"builder"),qi(),Pn(),si("Ville enregistr\xE9e.")}function Or(n){n&&(Q=new ts(n,be.opts.level,be.skills.slice()),dt="soldier",Ii=be.opts.speed,Yo=0,kr="",vi=null,Xi=n.id===0&&!be.seen?1:0,Ju=0,Us("mission"),Xi?o_():Kn("briefing",n.name,`<p class="eyebrow">${ri(n.briefing[0])}</p><p>\xAB ${ri(n.briefing[1])} \xBB</p>${n.containment?"<p>Les escouades peuvent changer de rue apr\xE8s le d\xE9part. S\xE9lectionne \xAB Ordres \xBB, une escouade, puis sa destination.</p>":n.rule?`<p>${ri(n.rule)}</p>`:""}<div class="dialog-actions">${je("Examiner la carte","close","button primary")}</div>`))}function o_(){Kn("briefing","La premi\xE8re sir\xE8ne",`<p class="eyebrow">G\xE9n\xE9rale Varga \xB7 Canal 01</p><p>\xAB Foyer confirm\xE9 \xE0 l\u2019est. Prot\xE9gez les carrefours et conduisez les habitants au refuge. Nous commen\xE7ons quand vous \xEAtes pr\xEAt. \xBB</p>
    <p><strong>Mission</strong> \xB7 \xC9liminez tous les infect\xE9s et sauvez le plus de civils possible.</p>
    <div class="dialog-actions">${je("Prendre le commandement","close","button primary")}${je("Passer le tutoriel","skip")}</div>`)}function l_(){Q.prepare()&&(dt="",Pe.commandOrigin=-1,Xi&&(Xi=4,be.seen=!0,qi()),Pi(!0))}function Pi(n=!1){let e=Q.combat,t=e?mi:Lt;n&&(Xe.dock.innerHTML=`<div class="dock-head"><div><span class="eyebrow">${e?"\xC9pid\xE9mie":"Pr\xE9paration"}</span><h2>${ri(Q.mission.name)}</h2></div><span class="clock" id="clock"></span></div>
      <div class="kit" aria-label="${e?"Renforts":"D\xE9fenses"}">${Object.entries(t).map(([a,o],c)=>`<button class="tool" data-action="tool" data-value="${a}" title="${o.info}" aria-label="${o.name}"><span class="icon" aria-hidden="true">${o.icon}</span><span><span class="tool-label">${o.name}</span><span class="tool-price" id="price-${a}">${e?c+1+" \xB7 ":""}${Q.cost(a)} cr</span></span></button>`).join("")}</div>
      <div class="tool-detail" id="detail"></div>
      <div class="tools-extra">${je("Tracer un couloir","tool","small","guide")}${je("Effacer le couloir","erase","small")}${e?je("Ordres","tool","small","command")+je("D\xE9toner","tool","small","boom"):je("Retirer","tool","small","sell")}</div>
      <footer><div class="speed" aria-label="Vitesse">${qu.map(a=>je(Yu(a),"speed","",a)).join("")}</div>${e?"":je("Pr\xEAt \xB7 lancer l\u2019\xE9pid\xE9mie","ready","button primary")}</footer>`);let i=[["cash","Cr\xE9dits",Q.money],["rescue","\xC0 l\u2019abri",Q.sheltered+"/"+Q.mission.pop],["infect","Infect\xE9s",Q.remaining],["","Victimes",Q.lost]];Q.mission.containment&&i.splice(2,0,["street","En rue",Q.civs.length]),Xe.metrics.innerHTML=i.map(([a,o,c])=>`<div class="metric ${a}"><strong>${c}</strong><small>${o}</small></div>`).join(""),ln("clock").textContent=e?Xu(Q.time)+(Q.mission.containment?"":" \xB7 V"+Q.wave):"EN ATTENTE",ln("detail").textContent=(dt==="safe"&&Q.mission.cap?`Accueille ${Q.mission.cap+(Q.has("bunks")?8:0)} civils. Prot\xE9gez les acc\xE8s.`:t[dt]?.info)||{guide:"Glissez sur les rues pour tracer un itin\xE9raire vers la croix verte. Sur mobile, utilisez deux doigts pour d\xE9placer la carte.",sell:"Touchez une d\xE9fense pour la retirer et r\xE9cup\xE9rer son co\xFBt.",boom:"Touchez une charge pos\xE9e pour la d\xE9clencher.",command:Pe.commandOrigin<0?"Choisis une escouade au sol.":"D\xE9signe une rue libre. L\u2019escouade cesse le tir pendant son d\xE9placement."}[dt]||(e?"Choisissez un renfort, puis sa cible sur la carte.":"Cliquez sur une rue pour placer la d\xE9fense choisie.");for(let a of Xe.dock.querySelectorAll('[data-action="tool"]')){let o=a.dataset.value;if(a.classList.toggle("active",dt===o),a.setAttribute("aria-pressed",dt===o),!t[o])continue;let c=Q.cost(o),l=e?Math.max(0,Math.ceil((Q.cd[o]||0)-Q.time)):0,h=!dn(o,Q.skills),f=!!(e&&Q.mission.noair&&t[o].air);a.disabled=h||f||l>0||c>Q.money,ln("price-"+o).textContent=h?"Comp\xE9tence":f?"Indisponible":l>0?"\u23F1 "+l+" s":(e?Zu.indexOf(o)+1+" \xB7 ":"")+c+" cr"}for(let a of Xe.dock.querySelectorAll('[data-action="speed"]'))a.classList.toggle("active",Number(a.dataset.value)===Ii),a.setAttribute("aria-label",Number(a.dataset.value)===0?"Mettre en pause":"Vitesse "+a.textContent);let r={1:["Placez deux escouades","Touchez des rues entre le foyer orange et les civils. Les tirs peuvent attirer la horde."],2:["Donnez une direction aux civils","S\xE9lectionnez \xAB Tracer un couloir \xBB, puis touchez ou glissez le long des rues vers la croix verte."],3:["Lancez l\u2019\xE9pid\xE9mie","Appuyez sur \xAB Pr\xEAt \xBB. Vous gagnerez des cr\xE9dits en \xE9liminant les infect\xE9s et en accueillant des civils."],4:["Cr\xE9dits, renforts et pause","S\xE9lectionnez un renfort, puis sa cible. \xC9vitez les civils avec les attaques de zone."]}[Xi];Xe.brief.innerHTML=r?`<strong>${r[0]}</strong><p>${r[1]}</p>`:kr?`<strong>${ri(kr)}</strong>`:e?"":`<strong>${ri(Q.mission.zone)}</strong><p>${ri(Q.mission.rule||(Q.mission.containment?"Interdiction de placer des d\xE9fenses dans le p\xE9rim\xE8tre orange.":"Prot\xE9gez les acc\xE8s aux refuges. Le temps est arr\xEAt\xE9."))}</p>`}function ju(){let n=ln("projection");n.textContent=Pe.tactical?"3D":"Plan",n.setAttribute("aria-label",Pe.tactical?"Vue en relief":"Vue tactique"),Xe.app.classList.toggle("tactical",Pe.tactical)}function Br(n){n==="guide"||n==="boom"||n==="sell"||n==="command"?dt=dt===n?"":n:(Q.combat?mi[n]&&dn(n,Q.skills)&&Q.cost(n)<=Q.money&&!(Q.cd[n]>Q.time)&&!(Q.mission.noair&&mi[n].air):Lt[n]&&dn(n,Q.skills)&&Q.cost(n)<=Q.money)&&(dt=n),dt!=="command"&&(Pe.commandOrigin=-1),Pi()}function vc(n,e=!1){if(!(n<0||Jt||Qe!=="mission")){if(dt==="guide"){if(!at(Q.map.cells,n))return;Q.setGuide([n],e),Xi===2&&(Xi=3)}else if(dt==="command")if(Q.canMove(n))Pe.commandOrigin=Pe.commandOrigin===n?-1:n;else{if(Pe.commandOrigin<0)return si("Choisis d\u2019abord des soldats, un sniper ou un lance-flammes.");if(Q.order(Pe.commandOrigin,n))Pe.commandOrigin=-1,si("Escouade en mouvement.");else return si("Cette rue est inaccessible ou d\xE9j\xE0 occup\xE9e.")}else if(dt==="sell"){if(!Q.sell(n))return}else if(dt==="boom"||Q.combat&&!dt){if(!Q.detonate(n))return}else if(dt){let t=Q.combat?Q.call(dt,n):Q.place(dt,n);if(t&&Xi===1&&++Ju>=2&&(Xi=2),!t){let i=Q.units.get(n);return i?.id==="safe"?si(`Zone s\xFBre \xB7 ${i.sheltered}/${i.cap} personnes \xB7 int\xE9grit\xE9 ${Math.round(i.hp/i.maxHp*100)} %`):si("Choisissez une rue libre et v\xE9rifiez votre budget.")}}else{let t=Q.units.get(n);t?.id==="safe"&&si(`Zone s\xFBre \xB7 ${t.sheltered}/${t.cap} personnes`)}Pi()}}function c_(){let n=be.opts,e=(t,i)=>t.map(([s,r])=>`<option value="${s}" ${String(s)===String(i)?"selected":""}>${r}</option>`).join("");Kn("settings","Param\xE8tres",`
    <label class="setting">Effets sonores <input type="checkbox" data-opt="sound" ${n.sound?"checked":""}></label>
    <label class="setting">Musique <input type="checkbox" data-opt="music" ${n.music?"checked":""}></label>
    <label class="setting">Qualit\xE9 graphique <select data-opt="quality">${e([["low","Bas"],["medium","Moyen"],["high","Haut"]],n.quality)}</select></label>
    <label class="setting">Vitesse initiale <select data-opt="speed">${e(qu.slice(1).map(t=>[t,Yu(t)]),n.speed)}</select></label>
    <label class="setting">Difficult\xE9 <select data-opt="level">${e(Object.entries(Un).map(([t,i])=>[t,i.name]),n.level)}</select></label>
    <div class="dialog-actions">${je("Exporter la sauvegarde","export")}${je("Importer","import")}${je("Fermer","close","button primary")}</div>`)}function Kn(n,e,t){Jt=n,Xe.modal.hidden=!1,Xe.modal.innerHTML=`<section class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><div class="eyebrow">Derni\xE8re Sir\xE8ne</div><h2 id="dialog-title">${ri(e)}</h2>${t}</section>`,Xe.modal.querySelector("button")?.focus()}function zr(){Jt="",Xe.modal.hidden=!0,Xe.modal.replaceChildren()}function Qu(){Qe!=="mission"||Jt==="result"||Kn("pause","Op\xE9ration en pause",`<p>Les \xE9quipes attendent vos ordres.</p><div class="dialog-actions">${je("Reprendre","close","button primary")}${je("Recommencer","retry")}${je("Quitter la mission","quit","button danger")}</div>`)}function h_(){vi=Fc(be,Q),qi();let n=Q.phase==="won",e=n&&Q.mission.id===11,t=Q.mission.id==="survival";e&&Ns.tick([{type:"rescue"}],be.opts,!1,!0);let i=e?"Apr\xE8s la sir\xE8ne":t?"Fin de transmission":n?"Ville s\xE9curis\xE9e":"Op\xE9ration compromise",s=Object.values(be.records).reduce((c,l)=>c+l.stars,0),r=[["Sauv\xE9s",vi.saved+"/"+Q.mission.pop],["Victimes",vi.lost],["Infect\xE9s \xE9limin\xE9s",vi.kills],["Pertes alli\xE9es",vi.friendly],["Score",vi.score.toLocaleString("fr-FR")],[t?"Vague":"Dur\xE9e",t?vi.wave:Xu(vi.time)]],a=e?`<p>\xAB Les bateaux ont quitt\xE9 l\u2019estuaire. Imani a ferm\xE9 l\u2019installation. Pour la premi\xE8re fois depuis les Verriers, la radio ne demande plus de secours. \xBB \u2014 Capitaine Sol</p><p>Bilan de campagne \xB7 ${Object.keys(be.records).length} villes s\xE9curis\xE9es \xB7 ${s}/36 \xE9toiles \xB7 ${Object.values(be.records).reduce((c,l)=>c+l.saved,0)} civils sauv\xE9s sur vos meilleurs r\xE9sultats.</p>`:"",o=n&&typeof Q.mission.id=="number"&&Q.mission.id<zt.length-1?je("Mission suivante","next","button primary"):"";Kn("result",i,`${n?`<p class="stars" aria-label="${vi.stars} \xE9toiles">${Mc(vi.stars)}</p>`:""}${a}
    <div class="stats">${r.map(([c,l])=>`<div><strong>${l}</strong>${c}</div>`).join("")}</div>
    <div class="dialog-actions">${o}${je("Rejouer","retry")}${je("Retour au commandement","quit")}</div>`)}function u_(n,e){if(Ns.wake(),n==="home"&&Us("title"),n==="nav"&&Us(e),n==="mission"&&Or(zt.find(t=>String(t.id)===e&&mn(be,t.id))||Qn.find(t=>t.id===e)||Ko.find(t=>t.id===e)||(e===Os.id?Os:null)),n==="settings"&&c_(),n==="difficulty"&&(be.opts.level=e,qi(),Pn()),n==="learn"&&Qo(be,e)&&(qi(),Pn(),si("Comp\xE9tence acquise.")),n==="tool"&&Br(e),n==="erase"&&(Q.setGuide([]),Pi()),n==="ready"&&l_(),n==="pause"&&Qu(),n==="speed"&&(Ii=Number(e),Pi()),n==="zoom-in"&&Pe.zoomBy(.84),n==="zoom-out"&&Pe.zoomBy(1.19),n==="rotate"&&(Pe.angle+=Math.PI/4,Pe.cameraAt()),n==="resetcam"&&Pe.reset(),n==="projection"&&(Pe.switchProjection(),ju()),n==="close"&&zr(),n==="skip"&&(Xi=0,be.seen=!0,qi(),zr(),Pi()),n==="retry"&&Or(Q.mission),n==="next"&&Or(zt[Q.mission.id+1]),n==="quit"){let t=Q.mission.id;Us(typeof t=="number"?"campaign":Q.mission.containment?"containment":t==="survival"?"survival":t.startsWith("local")?"editor":"special")}if(n==="export"){let t=URL.createObjectURL(new Blob([JSON.stringify(be,null,2)],{type:"application/json"})),i=document.createElement("a");i.href=t,i.download="derniere-sirene-sauvegarde.json",i.click(),setTimeout(()=>URL.revokeObjectURL(t),5e3)}n==="import"&&Xe.file.click(),n==="paint"&&(it.brush=Number(e),Pn()),n==="saveCity"&&Hu(),n==="testCity"&&Hu(!0),n==="newCity"&&($o(),Pn()),n==="editCity"&&($o(be.cities[Number(e)],Number(e)),Pn()),n==="runCity"&&Or(Ku(be.cities[Number(e)])),n==="deleteCity"&&Kn("delete","Supprimer cette ville ?",`<p>${ri(be.cities[Number(e)].name)}</p><div class="dialog-actions">${je("Annuler","close")}${je("Supprimer","confirmDelete","button danger",e)}</div>`),n==="confirmDelete"&&(be.cities.splice(Number(e),1),$o(),qi(),zr(),Pn())}Xe.app.addEventListener("click",n=>{let e=n.target.closest("[data-action]");e&&u_(e.dataset.action,e.dataset.value)});Xe.modal.addEventListener("change",n=>{let{opt:e}=n.target.dataset;e&&(be.opts[e]=n.target.type==="checkbox"?n.target.checked:e==="speed"?Number(n.target.value):n.target.value,e==="quality"&&Pe.quality(be.opts.quality),e==="speed"&&Qe==="mission"&&(Ii=be.opts.speed,Pi()),qi())});Xe.file.addEventListener("change",async()=>{let n=Xe.file.files[0];if(n){try{be=el(await n.text()),it=null,qi(),Pe.quality(be.opts.quality),Us("campaign"),si("Sauvegarde import\xE9e.")}catch(e){si("Import impossible. "+e.message)}Xe.file.value=""}});window.addEventListener("keydown",n=>{if(n.key==="Escape"){Jt&&Jt!=="result"?zr():Qe==="mission"&&Qu();return}if(Qe!=="mission"||Jt||n.repeat||n.target.matches("input,select"))return;n.code==="Space"&&!n.target.closest("button")&&(n.preventDefault(),Ii=Ii?0:be.opts.speed,Pi()),/^[1-6]$/.test(n.key)&&Q.combat&&Br(Zu[Number(n.key)-1]),n.key==="7"&&Q.combat&&Br("boom"),n.key==="8"&&Br("guide"),n.key==="9"&&(Ii=Ii?0:be.opts.speed,Pi()),n.code==="KeyM"&&Q.combat&&Br("command");let e={ArrowLeft:[45,0],ArrowRight:[-45,0],ArrowUp:[0,45],ArrowDown:[0,-45]};e[n.key]&&(n.preventDefault(),Pe.pan(...e[n.key]))});var cn=Xe.world,yc=n=>({x:n.clientX,y:n.clientY}),xc=(n,e)=>Math.hypot(n.x-e.x,n.y-e.y),Wu=(n,e)=>({x:(n.x+e.x)/2,y:(n.y+e.y)/2});cn.addEventListener("contextmenu",n=>n.preventDefault());cn.addEventListener("wheel",n=>{Qe!=="mission"||Jt||(n.preventDefault(),Pe.zoomBy(Math.exp(Math.max(-110,Math.min(110,n.deltaY))*.0036)))},{passive:!1});cn.addEventListener("pointerdown",n=>{Qe!=="mission"||Jt||(cn.setPointerCapture(n.pointerId),Wi.set(n.pointerId,yc(n)),Wi.size===1&&(Tt={start:yc(n),moved:!1,rotate:n.button===2,pan:n.button===1||n.shiftKey,drawing:dt==="guide"&&n.button===0&&!n.shiftKey,painted:!1}),Wi.size>1&&(Tt.moved=!0,Tt.drawing=!1))});cn.addEventListener("pointermove",n=>{if(Qe!=="mission"||Jt)return;let e=yc(n),t=Wi.get(n.pointerId),i=Pe.pick(e.x,e.y);if(n.pointerType==="mouse"&&Pe.highlight(i,dt,Q.legal(dt,i)||dt==="guide"||dt==="sell"||dt==="boom"||dt==="command"&&(Q.canMove(i)||Pe.commandOrigin>=0&&at(Q.map.cells,i)&&!Q.units.has(i))),!(!t||!Tt)){if(Wi.size>=2){let s=[...Wi].find(([l])=>l!==n.pointerId)[1],r=xc(s,t),a=xc(s,e),o=Wu(s,t),c=Wu(s,e);r>5&&a>5&&Pe.zoomBy(r/a),Pe.pan(c.x-o.x,c.y-o.y)}else if(xc(e,Tt.start)>5||Tt.moved)if(Tt.moved=!0,Tt.rotate)Pe.angle-=(e.x-t.x)*.0085,Pe.tilt=Math.max(.48,Math.min(1.44,Pe.tilt+(e.y-t.y)*.004)),Pe.cameraAt();else if(Tt.drawing){if(!Tt.painted){let s=Pe.pick(Tt.start.x,Tt.start.y);s>=0&&vc(s,!0)}i!==Tt.last&&vc(i,!0),Tt.last=i,Tt.painted=!0}else Pe.pan(e.x-t.x,e.y-t.y);Wi.set(n.pointerId,e)}});function Sc(n){Wi.has(n.pointerId)&&(Wi.delete(n.pointerId),!Wi.size&&(Tt&&!Tt.moved&&!Tt.rotate&&!Tt.pan&&n.type==="pointerup"&&(Ns.wake(),vc(Pe.pick(n.clientX,n.clientY),!0)),Tt=null))}cn.addEventListener("pointerup",Sc);cn.addEventListener("pointercancel",Sc);cn.addEventListener("lostpointercapture",Sc);cn.addEventListener("pointerleave",()=>{Pe&&Pe.highlight(-1,"",!1)});Xe.radar.addEventListener("pointerdown",n=>{let e=Xe.radar.getBoundingClientRect(),t=jt(Math.floor((n.clientX-e.left)/e.width*Ze),Math.floor((n.clientY-e.top)/e.height*ft));Pe.focusAt(t)});function d_(){let n=i_,e=5;n.clearRect(0,0,Ze*e,ft*e);for(let[t,i]of Q.map.cells.entries()){let[s,r]=ot(t);n.fillStyle=Q.fog[t]>.42?"#a7544c":$u[i],n.fillRect(s*e,r*e,e,e)}for(let t of Q.civs)n.fillStyle="#8bd7ee",n.fillRect(t.x*e+1,t.z*e+1,2,2);for(let t of Q.zombies)n.fillStyle="#ff9c72",n.fillRect(t.x*e+1,t.z*e+1,2,2);for(let t of Q.units.values()){let[i,s]=ot(t.i);n.fillStyle=t.id==="safe"?"#91ffe3":"#adbdcc",n.fillRect(i*e+1,s*e+1,3,3)}n.strokeStyle="#fff2c5",n.strokeRect(Pe.focus.x*e-3,Pe.focus.z*e-3,9,9)}function f_(){let e=[...[...Q.units.values()].filter(t=>t.id==="safe").map(t=>[t.i,`\u271A ${t.sheltered}/${t.cap}`,""]),[Q.map.start,Q.phase==="prep"||Q.mission.containment?"\u25EC FOYER":"\u25EC V"+Q.wave,"hot"]];for(Q.map.breach!=null&&e.push([Q.map.breach,"\u25EC BR\xC8CHE","hot"]);Xe.pins.children.length<e.length;)Xe.pins.append(document.createElement("div"));for(;Xe.pins.children.length>e.length;)Xe.pins.lastChild.remove();e.forEach(([t,i,s],r)=>{let[a,o]=ot(t),[c,l,h]=Pe.project(a,o,.82),f=Xe.pins.children[r];f.className="pin "+s,f.textContent!==i&&(f.textContent=i),f.style.left=c+"px",f.style.top=l+"px",f.hidden=!h||c<4||c>Pe.width-4||l<5||l>Pe.height})}function ed(n){requestAnimationFrame(ed);let e=n/1e3,t=Math.min(.12,Math.max(0,e-(Gu||e)));if(Gu=e,!document.hidden)if(Qe==="mission"){if(Q.combat&&Ii&&!Jt){for(Yo+=t*Ii;Yo>=.08&&Q.combat;)Q.step(.08),Yo-=.08;if(Q.mission.id==="survival"&&Q.wave>be.survival){be.survival=Q.wave;for(let i of Q.flags)Di(be,i);qi()}Q.combat||h_()}if(Q.events.length){Pe.addEffects(Q.events),Ns.tick(Q.events,be.opts,Q.combat,!Jt);let i=Q.events.find(s=>s.type==="boss"||s.type==="collapse"||s.type==="breach");i&&(kr={boss:"Contact lourd \xB7 L\u2019Amiral entre en ville.",collapse:"Position perdue \xB7 D\xE9fense submerg\xE9e.",breach:"Br\xE8che \xB7 Une seconde horde entre en ville."}[i.type],setTimeout(()=>{Qe==="mission"&&(kr="")},4500)),Q.events.length=0}else Ns.tick([],be.opts,Q.combat,!Jt);e-ku>.16&&(ku=e,vi||Pi(),d_()),e-Xo>(be.opts.quality==="low"?.031:.015)&&(Xo=e,Pe.render(Q,e,t,!1,!!Jt||Ii===0),f_())}else Qe==="title"&&e-Xo>.033&&(Xo=e,Pe.render(Q,e,t,!0),Ns.tick([],be.opts,!1,!Jt))}p_()&&"serviceWorker"in navigator&&navigator.serviceWorker.register("./offline.js").catch(()=>{});function p_(){return window.location.protocol==="https:"||window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1"}})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
