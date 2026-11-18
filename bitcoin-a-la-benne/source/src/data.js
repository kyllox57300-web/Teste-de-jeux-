/* =========================================================
   DONNÉES DU JEU (aucune dépendance : utilisable aussi par la simulation Node)
   ========================================================= */

/** Grille de la décharge : 7 quartiers de 12 x 7 tas, plus la cour d'entrée */
export const CELL = 2.6;               // taille d'une case en mètres
export const COLS = 12, QROWS = 7, NQ = 7, YARD = 6;
export const ROWS = NQ * QROWS + YARD;
export const GATE = 6;                 // colonne des portails entre quartiers

/** Quartiers : couches des tas, solidité d'une couche, valeur de base, prix du portail, couleurs */
export const QUARTERS = [
  {n:'Le Parking des Bennes',     e:'🗑️', L:[1,2], hp:14,     v:1.5,   cost:0,
   col:{mound:0x8a7458, ground:0x9b8462}, deco:['bag','bag','can','box','bottle','paper','tire','bagG']},
  {n:'La Colline des Sacs',       e:'🛍️', L:[2,3], hp:84,    v:9,     cost:150,
   col:{mound:0x6f7d55, ground:0x8a7a58}, deco:['bag','bagG','bagB','bagW','bag','bagY','paper','bottle']},
  {n:'Le Cimetière Électronique', e:'🖥️', L:[2,4], hp:504,    v:54,    cost:3000,
   col:{mound:0x666c7a, ground:0x77736c}, deco:['monitor','keyboard','pcb','monitor','can','box','tv','cable']},
  {n:'Le Lac de Lixiviat',        e:'🧪', L:[3,4], hp:3000,   v:330,   cost:40000,
   col:{mound:0x5a7a5c, ground:0x667458}, deco:['barrel','duck','tire','bottle','bag','barrelB','barrel']},
  {n:'La Montagne de Matelas',    e:'🛏️', L:[3,5], hp:18000,  v:2000,  cost:500000,
   col:{mound:0xa3868b, ground:0x8a7466}, deco:['mattress','pillow','mattressP','box','bagW','mattress']},
  {n:'Le Mont Ordure',            e:'🏔️', L:[4,6], hp:110000,  v:12000, cost:6e6,
   col:{mound:0x84745a, ground:0x806c50}, deco:['tire','fridge','cart','box','barrel','tire','plank']},
  {n:'La Fosse Originelle',       e:'🕳️', L:[5,6], hp:650000, v:72000, cost:7e7,
   col:{mound:0x5f4e6b, ground:0x564a58}, deco:['cd','pizza','monitor','tire','bag','cd','hdd']},
];

/** Raretés */
export const RAR = {
  c:{w:1000, m:1,   n:'Commun',     col:'#e9edf2', xp:1},
  r:{w:80,   m:6,   n:'Rare',       col:'#59b0ff', xp:12},
  e:{w:12,   m:40,  n:'Épique',     col:'#c98bff', xp:50},
  l:{w:1.5,  m:300, n:'Légendaire', col:'#ffc43a', xp:250},
};
export const RK = ['c','r','e','l'];

/** Petits objets à ramasser : 8 par quartier [emoji, nom, rareté, modèle 3D, métal ?] */
export const LOOT = [
  [['🥫','Canette écrasée','c','can',1],['🧦','Chaussette orpheline','c','sock',0],['📱','Vieux téléphone','c','phone',1],['📰','Journal mouillé','c','paper',0],
   ['⌚','Montre en plastique','r','watch',1],['📼','Cassette VHS de mariage','r','vhs',0],['🎮','Console portable','e','console',0],['💾','Disquette « NE PAS JETER »','l','floppy',0]],
  [['🍞','Grille-pain fatigué','c','toaster',1],['🧸','Peluche borgne','c','teddy',0],['🍾','Bouteille consignée','c','bottle',0],['🔑','Trousseau de clés','c','keys',1],
   ['📿','Collier fantaisie','r','necklace',1],['🛴','Trottinette pliée','r','scooter',1],['🦸','Figurine de collection','e','figure',0],['🍫','Lingot (en chocolat)','l','ingot',0]],
  [['🔌','Câble emmêlé','c','cable',1],['⌨️','Clavier sans Entrée','c','keyboard',0],['🖱️','Souris à boule','c','mouse',0],['📱','Téléphone à clapet','c','phone',1],
   ['🎞️','Carte graphique','r','gpu',1],['💍','Bague en argent','r','ring',1],['☎️','Minitel','e','console',0],['📞','Téléphone indestructible','l','phone',1]],
  [['🛢️','Bidon suspect','c','barrelS',1],['🦆','Canard fluo','c','duck',0],['👢','Botte orpheline','c','boot',0],['🔧','Clé à molette','c','wrench',1],
   ['⚙️','Pièce de moteur','r','gear',1],['🛵','Jante de mobylette','r','rim',1],['🔒','Cadenas en or','e','lock',1],['🐠','Poisson rouge immortel','l','fish',0]],
  [['🌀','Ressort fou','c','spring',1],['🛏️','Oreiller jauni','c','pillowS',0],['🐻','Doudou abandonné','c','teddy',0],['⌚','Réveil cassé','c','watch',1],
   ['💶','Liasse de billets','r','cash',0],['🦷','Dentier en or','r','teeth',1],['💎','Broche en diamant','e','gem',1],['💰','Bas de laine de Mamie','l','moneybag',0]],
  [['🛞','Enjoliveur','c','rim',1],['🔩','Boulons géants','c','gear',1],['🗿','Nain de jardin','c','gnome',0],['🔋','Batterie de voiture','c','battery',1],
   ['🏍️','Phare de moto chromé','r','lamp',1],['🏆','Trophée de pétanque','r','trophy',1],['☄️','Météorite (probablement)','e','meteor',1],['👑','Couronne du Roi des Ordures','l','crown',1]],
  [['🍕','Fossile de pizza','c','pizza',0],['💽','Disque dur (pas le bon)','c','hdd',1],['💿','CD d\'installation','c','cd',0],['🥚','Animal virtuel','c','egg',0],
   ['🪙','Bitcoin en métal','r','coin',1],['💌','Lettre d\'amour de 2009','r','letter',0],['🖥️','Ordinateur d\'un inconnu célèbre','e','computer',1],['🥔','Clé privée sur une patate','l','potato',0]],
];

/** Gros objets (à porter ou à pousser) : poids 1 à 5, valeur = v du quartier x mult */
export const BIG = [
  {id:'tv',     n:'Vieille télé',      e:'📺', w:1, m:6, model:'tvBig'},
  {id:'fridge', n:'Frigo américain',   e:'🧊', w:2, m:10, model:'fridgeBig', open:true},
  {id:'wash',   n:'Machine à laver',   e:'🫧', w:2, m:9, model:'washer'},
  {id:'moto',   n:'Moto de collection', e:'🏍️', w:3, m:25, model:'moto'},
  {id:'statue', n:'Statue en bronze',  e:'🗽', w:3, m:20, model:'statue'},
  {id:'safe',   n:'Coffre-fort',       e:'🔐', w:5, m:14, model:'safe', open:true, safe:true},
];
/** Choses à ouvrir et fouiller (posées dans la décharge) */
export const CONTAINERS = [
  {id:'bin',    n:'Poubelle',          e:'🗑️', items:[1,3], minR:null, time:0.8},
  {id:'case',   n:'Valise abandonnée', e:'🧳', items:[2,4], minR:null, time:1.2},
  {id:'ward',   n:'Vieille armoire',   e:'🚪', items:[3,5], minR:'r',  time:1.6},
  {id:'trunk',  n:'Coffre de voiture', e:'🚗', items:[3,5], minR:'r',  time:1.6},
];

/** Paliers de l'outil (l'outil change dans la main de Kévin) */
export const TOOL_TIERS = [{lvl:0, n:'Pelle rouillée'}, {lvl:10, n:'Pioche'}, {lvl:25, n:'Marteau-piqueur'}, {lvl:45, n:'Pelle en or'}];
/** Sac : paliers de capacité */
export const SACKS = [{cap:8}, {cap:12, cost:25}, {cap:16, cost:70}, {cap:22, cost:200}, {cap:28, cost:600}, {cap:36, cost:1800}, {cap:45, cost:6000},
  {cap:56, cost:20000}, {cap:70, cost:70000}, {cap:85, cost:2.5e5}, {cap:100, cost:9e5}];
/** Améliorations à niveaux (prix x1,15 par niveau) */
export const LEVELED = [
  {id:'tool',  ic:'⛏️', n:'Outil de Kévin',          base:10,   max:120, z:0},
  {id:'luck',  ic:'🔦', n:'Lampe frontale',          base:200,  max:60,  z:1},
  {id:'boots', ic:'👟', n:'Bottes de chantier',      base:60,   max:12,  z:0},
  {id:'team',  ic:'📋', n:'Formation de l\'équipe',  base:300,  max:60,  z:1},
  {id:'detR',  ic:'📶', n:'Antenne du détecteur',    base:3000, max:10,  z:2, need:'det'},
];
/** Outils et véhicules (achats uniques) : chacun change la façon de jouer */
export const ONCE = [
  {id:'brou',   ic:'🛒', n:'Brouette',            cost:200,   z:0, d:'+15 places, et permet de transporter un gros objet de plus (poids +1).'},
  {id:'det',    ic:'📡', n:'Détecteur de métaux', cost:900,   z:1, d:'Nouvel outil : bipe près des trésors enfouis. Touchez le sol pour creuser à l\'endroit précis.'},
  {id:'magnet', ic:'🧲', n:'Aimant géant',        cost:1500,  z:1, d:'Nouvel outil : attire tous les objets en métal autour de vous, même ceux cachés dans les tas.'},
  {id:'truck',  ic:'🚛', n:'Camion de livraison', cost:3000,  z:2, d:'Vient chercher votre sac quand il se remplit et le vend chez Josiane.'},
  {id:'vacuum', ic:'🌀', n:'Aspirateur à ordures', cost:6000, z:2, d:'Nouvel outil : aspire les petits objets de loin (rayon x3) et vide les sacs-poubelle 2x plus vite.'},
  {id:'crane',  ic:'🏗️', n:'Grue de chantier',    cost:40000, z:3, d:'Nouvel outil : la grue attrape un gros objet n\'importe où et le dépose chez Josiane.'},
  {id:'digger', ic:'🚜', n:'Pelleteuse',          cost:60000, z:3, d:'Nouveau véhicule : force x4, vide 3 tas d\'un coup. Kévin la conduit.'},
  {id:'drone',  ic:'🚁', n:'Drone de repérage',   cost:2e6,   z:6, d:'Survole la Fosse et entoure la zone où se cache le disque dur.'},
];
/** Employés : ils marchent jusqu'aux tas et les vident (revente directe) */
export const EMPS = [
  {id:'gege',  e:'🥴', n:'Gégé le clochard',     pow:1,    base:40,    z:0, d:'Connaît chaque sac par son prénom.'},
  {id:'stag',  e:'🧑‍🎓', n:'Stagiaire non payé', pow:4.5,  base:400,   z:1, d:'Payé en « expérience ».'},
  {id:'ferr',  e:'👷', n:'Ferrailleur',          pow:20,   base:3000,  z:2, d:'Entend le métal à 3 mètres.'},
  {id:'chien', e:'🐕', n:'Chien renifleur',      pow:90,   base:20000, z:3, d:'Creuse avec les pattes. Très motivé.'},
  {id:'dozer', e:'🚧', n:'Mini-bulldozer',       pow:400,  base:1.5e5, z:4, d:'Subtil comme un bulldozer.'},
  {id:'robot', e:'🤖', n:'Robot fouilleur',      pow:1800, base:1e6,   z:5, d:'Hallucine parfois des trésors.'},
];
export const EMP_MAX = 5, GROWTH = 1.15;

/* ---------- ARBRE DE COMPÉTENCES : 4 branches, une ultime au bout de chacune ----------
   Forme de chaque branche : 1 → (2, 3) ; 2 → 4 ; 3 → 5 ; (4 ou 5) → 6 ; 6 → ULTIME */
export const BRANCHES = [
  {id:'F', n:'Fouilleur',  col:'#5fd068', ic:'⛏️'},
  {id:'C', n:'Costaud',    col:'#ff7a5c', ic:'💪'},
  {id:'M', n:'Commerçant', col:'#ffcf3a', ic:'💰'},
  {id:'B', n:'Bricoleur',  col:'#59b0ff', ic:'🔧'},
];
export const SKILLS = [
  {id:'F1', b:'F', ic:'👊', n:'Coup sûr',        d:'Force de fouille x1,5.', req:[], cost:1},
  {id:'F2', b:'F', ic:'⚡', n:'Rafale',          d:'Kévin creuse 60 % plus vite (coups plus rapides).', req:['F1'], cost:1},
  {id:'F3', b:'F', ic:'👁️', n:'Œil de lynx',     d:'Objets rares, épiques et légendaires 2x plus fréquents.', req:['F1'], cost:1},
  {id:'F4', b:'F', ic:'🧺', n:'Poches profondes', d:'Chaque couche vidée donne 1 objet de plus.', req:['F2'], cost:2},
  {id:'F5', b:'F', ic:'✨', n:'Flair',            d:'Les objets rares brillent de loin, et 25 % de chance de trouver un trésor en vidant un tas.', req:['F3'], cost:2},
  {id:'F6', b:'F', ic:'💥', n:'Double couche',   d:'30 % de chance de vider 2 couches d\'un seul coup.', req:['F4','F5'], any:true, cost:2},
  {id:'FU', b:'F', ic:'🌋', n:'SÉISME',          d:'ULTIME : Kévin frappe le sol et retire une couche à TOUS les tas autour de lui (7 m). Toutes les 40 s.', req:['F6'], cost:3, ult:true},
  {id:'C1', b:'C', ic:'🎒', n:'Dos solide',      d:'Sac +10 places.', req:[], cost:1},
  {id:'C2', b:'C', ic:'💪', n:'Biceps',          d:'Peut porter les objets de poids 2 (frigo, machine à laver) sans brouette.', req:['C1'], cost:1},
  {id:'C3', b:'C', ic:'🏃', n:'Jambes de feu',   d:'Vitesse de marche x1,4.', req:['C1'], cost:1},
  {id:'C4', b:'C', ic:'🦍', n:'Gros bras',       d:'Poids +2 (moto, statue) et plus aucun ralentissement en portant.', req:['C2'], cost:2},
  {id:'C5', b:'C', ic:'🧳', n:'Sac sans fond',   d:'Sac +30 places.', req:['C3'], cost:2},
  {id:'C6', b:'C', ic:'🏋️', n:'Force tranquille', d:'Peut soulever un coffre-fort (poids 5) et pousse les gros objets 2x plus vite.', req:['C4','C5'], any:true, cost:2},
  {id:'CU', b:'C', ic:'🦸', n:'HERCULE',         d:'ULTIME : porte n\'importe quoi et LANCE les gros objets jusqu\'à la cabane de Josiane, d\'où qu\'il soit.', req:['C6'], cost:3, ult:true},
  {id:'M1', b:'M', ic:'🗣️', n:'Bagou',           d:'Josiane paie tout 30 % plus cher.', req:[], cost:1},
  {id:'M2', b:'M', ic:'🏷️', n:'Client fidèle',   d:'Toutes les améliorations coûtent 20 % moins cher.', req:['M1'], cost:1},
  {id:'M3', b:'M', ic:'🤝', n:'Marchandage',     d:'À chaque vente, 30 % de chance que Josiane paie +100 %.', req:['M1'], cost:1},
  {id:'M4', b:'M', ic:'📈', n:'Initié',          d:'Marché : plus de frais, et une flèche annonce la tendance des 10 prochaines secondes.', req:['M2'], cost:2},
  {id:'M5', b:'M', ic:'🤵', n:'Réseau',          d:'Les employés revendent au prix plein et travaillent 50 % plus fort.', req:['M3'], cost:2},
  {id:'M6', b:'M', ic:'📚', n:'Collectionneur',  d:'Les bonus de séries de l\'album sont doublés.', req:['M4','M5'], any:true, cost:2},
  {id:'MU', b:'M', ic:'🐺', n:'LE LOUP DE LA BENNE', d:'ULTIME : tous les prix x2, et une vente sur 5 devient une ENCHÈRE x5 avec la foule.', req:['M6'], cost:3, ult:true},
  {id:'B1', b:'B', ic:'🩹', n:'Rafistolage',     d:'Réparer devient facile (zone verte 2x plus grande) et un objet réparé vaut x1,5.', req:[], cost:1},
  {id:'B2', b:'B', ic:'🗝️', n:'Crocheteur',      d:'Poubelles, valises, armoires s\'ouvrent instantanément ; coffres-forts en 2 étapes au lieu de 3.', req:['B1'], cost:1},
  {id:'B3', b:'B', ic:'🛠️', n:'Outils affûtés',  d:'Force de l\'outil x1,6.', req:['B1'], cost:1},
  {id:'B4', b:'B', ic:'♻️', n:'Pièces détachées', d:'Les objets cassés se vendent au prix plein, même sans réparation.', req:['B2'], cost:2},
  {id:'B5', b:'B', ic:'🔋', n:'Gadgets boostés', d:'Aimant, aspirateur et détecteur : portée x2, recharge 2x plus rapide.', req:['B3'], cost:2},
  {id:'B6', b:'B', ic:'🚜', n:'Mécano',          d:'Pelleteuse et employés-machines (bulldozer, robot) x2 plus forts.', req:['B4','B5'], any:true, cost:2},
  {id:'BU', b:'B', ic:'🤖', n:'MACGYVER',        d:'ULTIME : R0B0, un petit robot, vous suit et ramasse tout. Réparations automatiques (valeur x3), coffres ouverts d\'un geste.', req:['B6'], cost:3, ult:true},
];
export const SKILL_BY_ID = Object.fromEntries(SKILLS.map(s => [s.id, s]));

/* ---------- Histoire ---------- */
export const CHARS = {k:{n:'Kévin (vous)', e:'🧔'}, j:{n:'Josiane, gardienne', e:'👵'}, g:{n:'Gégé', e:'🥴'}, n:{n:'Narrateur', e:'📜'}};
export const INTRO = [
  ['n','2010. Vous achetez des bitcoins pour le prix de deux pizzas. Bravo.'],
  ['n','2013. Grand ménage de printemps. Un vieux disque dur part à la poubelle. Bravo, encore.'],
  ['k','Aujourd\'hui ce disque vaut une fortune. Et moi, je vaux… 3 € et un ticket de métro.'],
  ['j','Bienvenue à la décharge de Saint-Benne-sur-Ordure ! Tu veux fouiller ? Vas-y. Je rachète tout ce que tu trouves, à ma cabane.'],
  ['k','Mon disque est quelque part sous ces montagnes. Je vais vider cette décharge tas par tas s\'il le faut.'],
];
export const TUTO = [
  ['j','Petit tuto ! Touchez un tas d\'ordures : Kévin y va tout seul et le creuse, couche par couche.'],
  ['j','Les objets volent hors du tas. Kévin ramasse ce qui tombe près de lui. Les objets qui brillent sont rares : allez les chercher !'],
  ['j','Gros objets, poubelles, valises, coffres… touchez-les pour les porter ou les fouiller.'],
  ['j','Sac plein ? Touchez « Vendre » ou ma cabane. Avec l\'argent : outils, employés, gadgets… Et chaque niveau vous donne des points de compétence !'],
  ['g','Pour regarder autour : glissez le doigt. Pour zoomer : pincez. Sur ordinateur : ZQSD et la souris. Moi je dis ça…'],
];
export const CHAPTERS = [
  {t:'Le Grand Plongeon',
   dlg:[['j','La Colline des Sacs ! Attention, certains sacs mordent.'],['k','Je sens que je me rapproche. Enfin… je sens surtout le kebab.'],
        ['g','Psst. Moi c\'est Gégé. Pour quelques euros, mes copains et moi on vide des tas pour toi. Même la nuit. Surtout la nuit.'],
        ['k','Une équipe… comme une vraie start-up ! Mais en plus sale.']]},
  {t:'Les Petites Mains',
   dlg:[['j','Le Cimetière Électronique. Ici reposent les ordinateurs de 1998 à… hier.'],
        ['g','J\'ai vu un boîtier de disque avec un autocollant « NE PAS JETER », quelque part là-dedans.'],
        ['k','Mon boîtier ! Avec un détecteur de métaux, je le trouverai.']]},
  {t:'Le Cimetière des Machines',
   dlg:[['j','Le Lac de Lixiviat. Ne buvez pas l\'eau. Ne regardez pas l\'eau. Ne parlez pas à l\'eau.'],
        ['k','Le poisson à trois yeux me fixe… Il sait quelque chose.'],
        ['g','Les anciens disent que tout finit au sommet du Mont Ordure… puis tombe dans la Fosse.']]},
  {t:'La Montagne Maudite',
   dlg:[['k','Du sommet, je vois tout. Mes erreurs. Mes regrets. Un pigeon.'],
        ['j','Derrière, c\'est la Fosse Originelle. La toute première poubelle de la ville. Personne n\'en est revenu… propre.'],
        ['k','Mon disque est là-dedans. Je le sens jusque dans mes clés privées.']]},
  {t:'La Fosse Originelle', dlg:null},
];
export const STORY_DLG = [
  ['k','LE BOÎTIER ! Mon autocollant « NE PAS JETER » ! Mais… il est vide.'],
  ['j','Les camions tassent tout vers le fond. Ton disque a glissé tout au fond, dans la Fosse.'],
  ['n','Indice : une rayure sur le boîtier montre la direction. Le disque est du côté %SIDE% de la Fosse.'],
];
export const END_DLG = [
  ['n','Sous le dernier tas, au fond de la Fosse, quelque chose brille.'],
  ['k','C\'est… c\'est LUI ! Mon disque dur ! Avec l\'autocollant ! Et une odeur de fromage !'],
  ['g','Alors, t\'es riche ?'],
  ['k','Je branche… ça démarre… « Entrez le mot de passe »… … C\'était quoi, le mot de passe ?'],
  ['j','Ha ! Bienvenue au club, mon grand.'],
  ['k','Peu importe. J\'ai une entreprise, une équipe, une collection d\'ordures légendaires… et des bras comme des jambons.'],
  ['n','FIN. (Le mot de passe était « motdepasse ». Il le découvrira plus tard.)'],
];
