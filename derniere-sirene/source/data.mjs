export const terrain = { road: 0, block: 1, water: 2, park: 3, bridge: 4 };
export const W = 25, H = 19;

export const defenses = {
  soldier: { name:'Soldats', icon:'♟', price:65, range:3.3, hit:17, delay:.48, info:'Tir polyvalent, efficace aux carrefours.' },
  sniper: { name:'Sniper', icon:'⊙', price:105, range:6.4, hit:66, delay:1.3, info:'Longue portée et priorité aux cibles robustes.' },
  turret: { name:'Tourelle', icon:'⌖', price:125, range:3.5, hit:13, delay:.22, info:'Tir rapide et continu contre les hordes.' },
  mortar: { name:'Mortier', icon:'◔', price:155, range:6.4, hit:48, delay:2.6, blast:1.55, friendly:.22, info:'Obus de zone. Éloignez les civils.' },
  flame: { name:'Lance-flammes', icon:'♨', price:115, range:2, hit:31, delay:.46, blast:.85, info:'Brûle les groupes proches.' },
  mines: { name:'Champ de mines', icon:'⁙', price:55, range:.85, hit:72, delay:1.1, blast:1.25, charges:3, friendly:.35, info:'Trois charges automatiques au passage des infectés.' },
  explosive: { name:'Explosifs', icon:'✷', price:45, range:0, hit:175, blast:2.1, charges:1, friendly:.65, info:'Touchez la charge pour la déclencher pendant l’épidémie.' },
  safe: { name:'Zone sûre', icon:'✚', price:110, hp:210, cap:21, info:'Accueille 21 civils. Peut être submergée.' },
  wall: { name:'Mur', icon:'▤', price:45, hp:420, barrier:true, info:'Bloque la rue et encaisse longtemps.' },
  barricade: { name:'Barricade', icon:'╳', price:35, hp:235, barrier:true, info:'Ferme rapidement un passage.' },
  gate: { name:'Porte', icon:'▥', price:70, hp:315, barrier:true, passCivil:true, info:'Bloque les infectés et laisse passer les civils.' },
  watch: { name:'Tour de guet', icon:'⚑', price:175, range:5, hit:29, delay:.56, hp:260, info:'Tir surélevé, longue portée et bonne résistance.' }
};

export const support = {
  para: { name:'Parachutistes', icon:'⇣', price:95, cd:15, info:'Deux escouades déployées au sol.' },
  air: { name:'Frappe aérienne', icon:'➤', price:145, cd:25, info:'Balaye la rue. Dégâts civils possibles.', air:true },
  missile: { name:'Missile', icon:'↯', price:160, cd:31, info:'Impact concentré. Dégâts civils possibles.', air:true },
  gas: { name:'Gaz', icon:'◉', price:80, cd:21, info:'Ralentit et use les infectés. Évitez les civils.' },
  heli: { name:'Hélicoptère', icon:'✣', price:180, cd:39, info:'Tire sur les infectés et extrait jusqu’à huit civils.', air:true },
  tank: { name:'Blindé', icon:'▰', price:240, cd:45, info:'Ancre la ligne pour 28 secondes.' },
};
export const atlasSupport = {
  para:{...support.para,chargeCost:1},
  air:{...support.air,chargeCost:2},
  missile:{...support.missile,chargeCost:2},
  gas:{...support.gas,chargeCost:1},
  heli:{...support.heli,chargeCost:2},
  tank:{...support.tank,chargeCost:2},
  decoy:{name:'Leurre sonore',icon:'◌',chargeCost:1,cd:19,info:'Attire les infectés proches pendant 12 secondes.'},
  medevac:{name:'Évacuation',icon:'✚',chargeCost:1,cd:32,info:'Extrait jusqu’à 80 civils proches sans tirer.',air:true},
  flash:{name:'Éblouissement',icon:'✦',chargeCost:1,cd:24,info:'Immobilise les infectés proches pendant cinq secondes.'}
};

export const infected = {
  slow:{ name:'Rôdeur', hp:38, speed:1.35, damage:26, color:0xe4ff89, size:1, value:6 },
  fast:{ name:'Coupe-file', hp:27, speed:2.6, damage:25, color:0xffd07a, size:.85, value:7 },
  brute:{ name:'Colosse', hp:145, speed:.94, damage:59, color:0xf088b5, size:1.42, value:14 },
  bomb:{ name:'Gonflé', hp:49, speed:1.6, damage:28, color:0xffa04b, size:1.18, value:9 },
  spit:{ name:'Cracheur', hp:65, speed:1.22, damage:24, color:0xb3a2ff, size:1.12, value:12 },
  boss:{ name:'L’Amiral', hp:1420, speed:.7, damage:106, color:0xff5c53, size:2.6, value:100 },
};

// name, terrain, time of day, city zone, seed, budget, population, first wave, additional waves
const scenarios = [
  ['Rue des Verriers','city','dusk','CENTRE-VILLE',783,565,58,10,1],
  ['Quai des Ormes','port','day','PORT DE COMMERCE',948,625,69,15,2],
  ['Les Hauts-Jardins','suburb','day','BANLIEUE',488,650,80,21,2],
  ['Le Val des Écluses','rural','dusk','CAMPAGNE',832,685,90,24,3],
  ['Île aux Forges','island','day','ÎLE FLUVIALE',619,720,96,27,3],
  ['Raffinerie Octant','industry','dusk','ZONE INDUSTRIELLE',127,760,106,31,3],
  ['Belvédère Nord','city','night','VILLE NOCTURNE',562,780,115,35,4],
  ['Bassin des Tempêtes','port','night','CHANTIER NAVAL',611,810,125,39,4],
  ['La Ceinture verte','rural','day','AÉRODROME RURAL',296,830,134,44,4],
  ['Digue d’Argile','industry','day','DIGUE INDUSTRIELLE',309,860,142,49,4],
  ['Station Horizon','suburb','night','STATION DE RECHERCHE',417,910,155,53,5],
  ['Dernier Feu','island','dusk','ESTUAIRE',985,990,168,60,6]
];

const briefings = [
  ['Générale Varga','La première sirène vient de sonner. Les habitants courent vers la place. Trouvez-leur un abri.'],
  ['Capitaine Sol','J’ai vu des caisses frappées du logo Horizon tomber d’un cargo. Depuis, silence radio sur le quai.'],
  ['Dre Imani','Les premiers malades ont traversé le fleuve avant le couvre-feu. Protégez chaque sortie du quartier.'],
  ['Générale Varga','Ils remontent le courant vers les écluses. Les ponts offrent les seuls passages aux familles isolées.'],
  ['Capitaine Sol','Deux ponts pour une île entière. Tenez-en un pour les civils, attirez la horde vers l’autre.'],
  ['Dre Imani','J’ai retrouvé le registre des caisses. La station Horizon étudiait un champignon marin cultivé sur place.'],
  ['Générale Varga','Le réseau électrique vient de tomber. Nos observateurs tiennent jusqu’à l’aube.'],
  ['Capitaine Sol','Une silhouette énorme a traversé le bassin. Les équipes du chantier l’appellent l’Amiral.'],
  ['Dre Imani','Les spores perdent leur activité en air sec. Le hangar de l’aérodrome peut servir de refuge.'],
  ['Générale Varga','Encore une ville entre nous et Horizon. La dernière colonne de secours traverse la digue.'],
  ['Dre Imani','J’ai trouvé la fuite. Le courant emporte encore des spores. L’amplificateur de brume est dans l’estuaire.'],
  ['Capitaine Sol','Les derniers bateaux attendent derrière la digue. Ouvrez un couloir. Imani et moi allons fermer la station.']
];

export const missions = scenarios.map(([name, theme, light, zone, seed, budget, pop, count, waves], id) =>
  ({id, name, theme, light, zone, seed, budget, pop, count, waves, briefing:briefings[id], boss:id===7 || id===11}));

export const specials = [
  {...missions[4], name:'Ponts de verre', id:'fragile', rule:'Ponts fragiles · les explosions peuvent les détruire.', fragile:true, budget:785},
  {...missions[2], name:'Marée humaine', id:'horde', rule:'Horde · effectifs infectés doublés.', count:42, waves:4, budget:805},
  {...missions[5], name:'Solde zéro', id:'budget', rule:'Austérité · des crédits de départ réduits.', budget:465},
  {...missions[6], name:'Ciel fermé', id:'noair', rule:'Nuit noire · les renforts aériens sont indisponibles.', noair:true, budget:850}
];
export const endless = {...missions[0], id:'survival', name:'Radio Silence', rule:'Survie · une vague toutes les 19 secondes.', budget:760, count:16, waves:Infinity, pop:100, seed:7734};
export const containment = [
  {id:'canal',name:'Canal des Verreries',theme:'port',light:'day',zone:'DEUX RIVES · TROIS PONTS',
    seed:3485,budget:810,pop:410,count:13,cap:57,loadout:['marks','rotor'],
    briefing:['Capitaine Sol','Le premier foyer se trouve parmi les ateliers de la rive est. Gardez au moins un pont ouvert pour les familles et couvrez ses deux accès.']},
  {id:'rail',name:'Les Faubourgs du Rail',theme:'suburb',light:'dusk',zone:'QUARTIERS DENSES · VIADUC',
    seed:4317,budget:1070,pop:610,count:21,cap:71,loadout:['marks','mining','rotor'],
    briefing:['Générale Varga','Les rues autour de la gare sont pleines. Les passages sous le viaduc sont étroits. Gardez une escouade mobile pour les carrefours de l’ouest.']},
  {id:'delta',name:'Estuaire de l’Orme',theme:'island',light:'night',zone:'DEUX CHENAUX · QUATRE PASSAGES',
    seed:9612,budget:1170,pop:820,count:28,cap:94,loadout:['marks','incend','rotor','guided'],
    briefing:['Dre Imani','Les quais se remplissent pendant la marée haute. Il y a deux chenaux à traverser. Guidez les civils jusqu’au premier refuge avant de vider l’île.']}
].map(m=>({...m,containment:true,waves:0}));
export const metz = {
  id:'metz',name:'Metz · Les Îles et la Moselle',theme:'city',light:'day',zone:'CARTE DE METZ · SCÉNARIO FICTIF',
  seed:6103,budget:1840,pop:2300,count:42,cap:125,quota:.30,waves:0,metro:true,containment:true,
  loadout:['marks','mining','rotor','guided','towers'],
  briefing:['Générale Varga','Les appels affluent du nord-est. Les rues du centre convergent vers les ponts. Pose des refuges des deux côtés de la Moselle et protège leurs accès.'],
};
export const atlasLoadout=['marks','mining','artillery','rotor','guided','tank'];
const atlasSectors=[
  ['metz','Metz','MOSELLE','city',6103,2300,42,1440,'Surveillez les ponts entre les Îles et le centre.'],
  ['strasbourg','Strasbourg','GRANDE ÎLE','island',3812,2100,46,1450,'Les boucles de l’Ill étranglent les sorties de la Grande Île.'],
  ['dunkerque','Dunkerque','PORT ET BASSINS','port',7251,1800,38,1350,'Le vieux port découpe la ville. Gardez une route de repli le long des bassins.'],
  ['bordeaux','Bordeaux','GARONNE','city',4145,2250,52,1500,'Les rues étroites débouchent sur les quais et le pont de pierre.'],
  ['lyon','Lyon','PRESQU’ÎLE','island',2837,2450,55,1600,'La Saône et le Rhône laissent peu de sorties à la presqu’île.'],
  ['toulouse','Toulouse','GARONNE ET PONT NEUF','city',9146,2650,62,1680,'Saint-Cyprien s’organise sur la rive ouest. Tenez les passages vers le centre-ville.']
];
export const atlas=atlasSectors.map(([mapId,name,zone,theme,seed,pop,count,budget,brief])=>({
  id:'atlas-'+mapId,mapId,name,zone,theme,seed,pop,count,budget,briefing:['Générale Varga',brief],
  atlas:true,metro:true,containment:true,light:'dusk',waves:0,cap:260,loadout:atlasLoadout
}));
export const mutators={
  horde:'Horde renforcée',fragile:'Ponts fragiles',austerity:'Budget réduit',night:'Nuit'
};
export function withMutators(mission,ids) {
  return {
    ...mission, modifiers:[...ids],
    budget:ids.has('austerity')?Math.round(mission.budget*.72):mission.budget,
    count:ids.has('horde')?Math.round(mission.count*1.55):mission.count,
    light:ids.has('night')?'night':mission.light,
    fragile:ids.has('fragile')
  };
}
export const difficulty = {
  easy:{name:'Facile', factor:.76, budget:1.2}, normal:{name:'Normal', factor:1, budget:1}, hard:{name:'Difficile', factor:1.23, budget:.88}
};

export const tree = [
  {name:'Infanterie', icon:'♟', nodes:[
    ['marks','Tireurs d’élite','Débloque le sniper. En ville réelle, portée +20 %.'],
    ['incend','Barrage thermique','Débloque le lance-flammes.'],
    ['veteran','Première ligne','Les unités commencent au grade 2.'],
    ['burst','Tirs groupés','Les tirs font 25 % de dégâts en plus.']
  ]},
  {name:'Défenses', icon:'▤', nodes:[
    ['towers','Postes surélevés','Débloque la tour de guet.'],
    ['mining','Sapeurs','Débloque les mines. En ville réelle, une charge de plus.'],
    ['concrete','Béton renforcé','Les structures gagnent 40 % de résistance.'],
    ['artillery','Artillerie','Débloque le mortier. En ville réelle, rechargement accéléré.']
  ]},
  {name:'Aviation', icon:'✣', nodes:[
    ['rotor','Extraction','Débloque l’hélicoptère. En ville réelle, six secondes de plus en vol.'],
    ['guided','Guidage','Débloque le missile. En ville réelle, réduit les pertes civiles du missile.'],
    ['dispatch','Alerte avancée','Recharge des renforts réduite de 25 %.'],
    ['wing','Escadrille','Deux charges d’appui de plus en ville réelle. Dans les autres modes, les renforts aériens coûtent 30 % de moins.']
  ]},
  {name:'Logistique', icon:'✚', nodes:[
    ['bunks','Abris étendus','Huit places de plus par refuge, ou quarante en ville réelle.'],
    ['reserve','Réserve d’urgence','110 crédits de départ supplémentaires.'],
    ['tank','Colonne blindée','Débloque le blindé. En ville réelle, huit secondes de présence en plus.'],
    ['train','Exercices d’évacuation','Les civils courent 25 % plus vite.']
  ]}
];

export const unlock = {sniper:'marks',flame:'incend',watch:'towers',mines:'mining',mortar:'artillery',heli:'rotor',missile:'guided',tank:'tank'};
export const canUse = (id, skills) => !unlock[id] || skills.includes(unlock[id]);

export const badges = [
  ['first','Premier silence','Remporter une mission.'],['rescue','À l’abri','Évacuer 20 civils en une mission.'],
  ['three','Opération exemplaire','Décrocher trois étoiles.'],['perfect','Pas un de moins','Sauver chaque civil.'],
  ['guide','Ligne de vie','Tracer un couloir de dix cases.'],['boom','Boum','Déclencher des explosifs.'],
  ['noharm','Tir discipliné','Gagner avec zéro perte alliée.'],['skills','Formation accélérée','Acheter une compétence.'],
  ['veteran','Galons','Amener une unité au grade 3.'],['half','Le courant remonte','Finir six missions.'],
  ['boss','Brise-Amiral','Abattre un boss.'],['story','Après la sirène','Terminer la campagne.'],
  ['hard','Sous pression','Gagner en difficulté Difficile.'],['air','Ciel ami','Appeler une frappe aérienne.'],
  ['heli','Cabine comble','Évacuer quatre civils avec un hélicoptère.'],['special','Cas particulier','Remporter une opération spéciale.'],
  ['wave5','En sursis','Atteindre la vague 5 en survie.'],['wave10','Radio toujours active','Atteindre la vague 10 en survie.'],
  ['builder','Urbaniste','Enregistrer une ville.'],['local','Votre juridiction','Gagner sur une ville créée.'],
  ['score','Contre-offensive','Abattre 150 infectés en une partie.'],['bank','Fonds de crise','Finir avec 500 crédits.'],
  ['stars','Constellation','Accumuler 30 étoiles.'],['fort','Ligne de défense','Poser huit structures en une partie.']
];
