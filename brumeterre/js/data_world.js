// Brumeterre — biomes, monstres, boss, événements mystères
(function (B) {
  'use strict';

  B.BIOMES = [
    { id: 'forest', n: 'Forêt Sombre', d: 'Des arbres immenses où la brume s\'accroche aux branches. Les loups y chassent en silence.',
      pal: { g1: '#1f3a2a', g2: '#27472f', g3: '#173022', fog: [44, 60, 64], acc: '#9be37a', eb: '#ff5a4a', deco: ['tree', 'bush', 'mushroom', 'grass', 'flower', 'rock', 'stump'] },
      amb: 'firefly', music: 'forest', guard: 'g_stag', boss: 'b_root',
      mobs: ['f_wolf', 'f_shroomling', 'f_boar', 'f_spider', 'f_rootimp', 'f_wisp', 'f_toadstool', 'f_treant'],
      en: { n: 'Dark Forest', d: 'Huge trees where the mist clings to the branches. Wolves hunt there in silence.' } },
    { id: 'swamp', n: 'Marais Putride', d: 'Une eau noire qui bouillonne. Ce qui s\'y noie ne reste pas mort.',
      pal: { g1: '#2a2a33', g2: '#33303d', g3: '#22222a', fog: [54, 46, 68], acc: '#b07aff', eb: '#ff5ad8', deco: ['reed', 'puddle', 'deadtree', 'lily', 'rock', 'grass'] },
      amb: 'bubble', music: 'swamp', guard: 'g_toad', boss: 'b_hydra',
      mobs: ['s_leech', 's_mosquito', 's_frog', 's_drowned', 's_slime', 's_witch', 's_croc', 's_marshlight'],
      en: { n: 'Putrid Swamp', d: 'Black water that bubbles. What drowns here does not stay dead.' } },
    { id: 'ruins', n: 'Ruines Englouties', d: 'Les restes d\'un royaume ancien. Ses gardiens de pierre veillent encore.',
      pal: { g1: '#2b3140', g2: '#343b4d', g3: '#232836', fog: [46, 54, 76], acc: '#7ab8ff', eb: '#ff9a2a', deco: ['pillar', 'brokenwall', 'rock', 'rune', 'grass', 'skull'] },
      amb: 'dust', music: 'ruins', guard: 'g_golem', boss: 'b_lich',
      mobs: ['r_skel', 'r_archer', 'r_gargoyle', 'r_specter', 'r_golem', 'r_rat', 'r_cultist', 'r_statue'],
      en: { n: 'Sunken Ruins', d: 'The remains of an ancient kingdom. Its stone guardians still keep watch.' } },
    { id: 'peaks', n: 'Cimes Gelées', d: 'Un froid qui mord les os. Le vent hurle des noms oubliés.',
      pal: { g1: '#c9d6e3', g2: '#b8c8d8', g3: '#a8bccf', fog: [92, 110, 134], acc: '#bfe8ff', eb: '#ff2a6a', deco: ['pine', 'icerock', 'snowdrift', 'crystal', 'rock'] },
      amb: 'snow', music: 'peaks', guard: 'g_yeti', boss: 'b_wyrm',
      mobs: ['m_wolf', 'm_harpy', 'm_icegolem', 'm_blizzard', 'm_goat', 'm_goblin', 'm_yetiling', 'm_frostwisp'],
      en: { n: 'Frozen Peaks', d: 'A cold that bites to the bone. The wind howls forgotten names.' } },
    { id: 'heart', n: 'Cœur de la Brume', d: 'Là où tout a commencé. La brume y respire comme une bête.',
      pal: { g1: '#1c1418', g2: '#24181d', g3: '#150f12', fog: [54, 20, 28], acc: '#ff5a3c', eb: '#ffd83a', deco: ['spike', 'tendril', 'ember', 'skull', 'blackrock', 'eyeplant'] },
      amb: 'ember', music: 'heart', guard: 'g_knight', boss: 'b_mist',
      mobs: ['h_stalker', 'h_shade', 'h_eye', 'h_crawler', 'h_spawn', 'h_reaper', 'h_priest', 'h_colossus'],
      en: { n: 'Heart of the Mist', d: 'Where it all began. The mist breathes there like a beast.' } }
  ];

  // Archétypes de dessin : quad, blob, mush, bug, hum, wisp, brute, fly, eye, frog
  // beh : chase, swarm, tank, charge, shoot, radial, bomber, split, summon, blink, burrow, healer, leap, trail, flyer
  const M = [
    // Forêt
    { id: 'f_wolf', n: 'Loup de brume', b: 0, beh: 'chase', hp: 14, spd: 80, dmg: 8, r: 13, xp: 1, L: { a: 'quad', c: ['#5d6b80', '#3e4859', '#c9d3e0'], eye: '#ffd84a', ears: 1 }, d: 'Il chasse en meute, attiré par la lumière.' },
    { id: 'f_shroomling', n: 'Champignonnet', b: 0, beh: 'swarm', hp: 6, spd: 96, dmg: 5, r: 9, xp: 1, L: { a: 'mush', c: ['#d9443a', '#f2e6cf', '#fff'], eye: '#1a1a1a', dots: 1 }, d: 'Minuscule, mais jamais seul.' },
    { id: 'f_boar', n: 'Sanglier sombre', b: 0, beh: 'charge', hp: 32, spd: 58, dmg: 14, r: 16, xp: 3, L: { a: 'quad', c: ['#5a3b2a', '#3a2418', '#e8dcc0'], eye: '#ff4a2a', tusk: 1 }, d: 'Il gratte le sol avant de charger. Écartez-vous de sa ligne !' },
    { id: 'f_spider', n: 'Araignée sylvestre', b: 0, beh: 'shoot', hp: 16, spd: 55, dmg: 7, r: 13, xp: 2, p: { range: 230, cd: 2.6, bspd: 170, slow: 1 }, L: { a: 'bug', c: ['#3a2f4a', '#6a4f8a', '#b9f'], eye: '#ff3a6a', legs: 8 }, d: 'Crache des toiles qui ralentissent.' },
    { id: 'f_rootimp', n: 'Lutin des racines', b: 0, beh: 'burrow', hp: 18, spd: 95, dmg: 10, r: 11, xp: 2, L: { a: 'hum', c: ['#6a5a2a', '#9a7a3a', '#5a8a3a'], eye: '#bfff4a', leaf: 1 }, d: 'Il voyage sous terre et jaillit sous vos pieds.' },
    { id: 'f_wisp', n: 'Feu follet', b: 0, beh: 'bomber', hp: 8, spd: 118, dmg: 16, r: 10, xp: 1, p: { boom: 58 }, L: { a: 'wisp', c: ['#7affd0', '#2ab890', '#e8fff8'], eye: '#fff' }, d: 'Une flamme instable qui éclate au contact.' },
    { id: 'f_toadstool', n: 'Vesse-de-loup', b: 0, beh: 'radial', hp: 28, spd: 32, dmg: 6, r: 15, xp: 2, p: { cd: 3.2, n: 8, bspd: 120 }, L: { a: 'mush', c: ['#c9b07a', '#efe2c0', '#8a6a3a'], eye: '#3a2a1a', wide: 1 }, d: 'Lâche des nuages de spores en étoile.' },
    { id: 'f_treant', n: 'Jeune sylvain', b: 0, beh: 'tank', hp: 85, spd: 40, dmg: 16, r: 22, xp: 5, L: { a: 'brute', c: ['#5a4a2f', '#3e3220', '#5fae4a'], eye: '#ffe04a', moss: 1 }, d: 'Un arbre en colère. Lent, mais il encaisse.' },
    // Marais
    { id: 's_leech', n: 'Sangsue géante', b: 1, beh: 'chase', hp: 22, spd: 70, dmg: 9, r: 13, xp: 1, L: { a: 'blob', c: ['#5a2a3a', '#3a1a28', '#ff8aa0'], eye: '#ffda4a', long: 1 }, d: 'Elle se gave de votre sang.' },
    { id: 's_mosquito', n: 'Moustique géant', b: 1, beh: 'flyer', hp: 7, spd: 125, dmg: 5, r: 9, xp: 1, L: { a: 'fly', c: ['#4a4a3a', '#8a8a6a', '#c0e0ff'], eye: '#ff4a4a', thin: 1 }, d: 'Son bourdonnement annonce la nuée.' },
    { id: 's_frog', n: 'Grenouille acide', b: 1, beh: 'leap', hp: 26, spd: 50, dmg: 12, r: 14, xp: 2, p: { cd: 3, range: 260 }, L: { a: 'frog', c: ['#6ab02a', '#3a7a1a', '#e0ff8a'], eye: '#ffef4a' }, d: 'Saute sur sa proie. Regardez où elle va atterrir.' },
    { id: 's_drowned', n: 'Noyé', b: 1, beh: 'trail', hp: 60, spd: 38, dmg: 14, r: 17, xp: 4, L: { a: 'hum', c: ['#4a6a6a', '#2a3a3a', '#8aa'], eye: '#9affef', hunch: 1 }, d: 'Il laisse derrière lui une eau empoisonnée.' },
    { id: 's_slime', n: 'Gluant des marais', b: 1, beh: 'split', hp: 34, spd: 48, dmg: 10, r: 17, xp: 2, p: { child: 's_slimelet', k: 3 }, L: { a: 'blob', c: ['#7a5aaa', '#4a3a7a', '#e0c0ff'], eye: '#fff' }, d: 'Coupez-le, il se divise.' },
    { id: 's_slimelet', n: 'Gouttelette', b: 1, beh: 'swarm', hp: 9, spd: 85, dmg: 5, r: 9, xp: 0.5, child: 1, L: { a: 'blob', c: ['#8a6aba', '#5a4a8a', '#e0c0ff'], eye: '#fff' }, d: 'Un morceau de gluant, toujours affamé.' },
    { id: 's_witch', n: 'Sorcière des tourbières', b: 1, beh: 'summon', hp: 40, spd: 45, dmg: 8, r: 15, xp: 5, p: { cd: 6, child: 's_mosquito', k: 3, range: 260 }, L: { a: 'hum', c: ['#3a2a4a', '#6a4a2a', '#9aff4a'], eye: '#9aff4a', hat: 1 }, d: 'Elle appelle les nuées de moustiques.' },
    { id: 's_croc', n: 'Crocodile', b: 1, beh: 'charge', hp: 48, spd: 50, dmg: 16, r: 18, xp: 4, L: { a: 'quad', c: ['#3a5a2a', '#2a3a1a', '#d0c080'], eye: '#ffcf2a', snout: 1, low: 1 }, d: 'Il glisse hors de l\'eau en un éclair.' },
    { id: 's_marshlight', n: 'Feu des marais', b: 1, beh: 'blink', hp: 20, spd: 60, dmg: 8, r: 11, xp: 2, p: { cd: 3.5, shoot: 1 }, L: { a: 'wisp', c: ['#c08aff', '#7a3aff', '#fff'], eye: '#fff' }, d: 'Il disparaît et réapparaît pour vous tirer dessus.' },
    // Ruines
    { id: 'r_skel', n: 'Squelette', b: 2, beh: 'chase', hp: 30, spd: 70, dmg: 11, r: 13, xp: 1, L: { a: 'hum', c: ['#e8e0c8', '#a8a090', '#5a5a6a'], eye: '#6af0ff', bones: 1 }, d: 'Un soldat oublié, toujours en service.' },
    { id: 'r_archer', n: 'Archer squelette', b: 2, beh: 'shoot', hp: 24, spd: 55, dmg: 10, r: 13, xp: 2, p: { range: 250, cd: 2.2, bspd: 260, n: 1 }, L: { a: 'hum', c: ['#e0d8c0', '#9a9080', '#7a5a3a'], eye: '#ff6a3a', bones: 1, bow: 1 }, d: 'Ses flèches ne ratent jamais un immobile.' },
    { id: 'r_gargoyle', n: 'Gargouille', b: 2, beh: 'charge', hp: 46, spd: 75, dmg: 14, r: 16, xp: 3, L: { a: 'fly', c: ['#6a7080', '#4a5060', '#aab'], eye: '#ff3a3a', horns: 1 }, d: 'Elle plonge du haut des colonnes.' },
    { id: 'r_specter', n: 'Spectre', b: 2, beh: 'blink', hp: 30, spd: 80, dmg: 12, r: 13, xp: 2, p: { cd: 3 }, L: { a: 'wisp', c: ['#9ab0ff', '#5a6aaa', '#e0e8ff'], eye: '#fff', ghost: 1 }, d: 'Il traverse les murs et le temps.' },
    { id: 'r_golem', n: 'Golem mineur', b: 2, beh: 'tank', hp: 140, spd: 36, dmg: 20, r: 22, xp: 6, L: { a: 'brute', c: ['#6a6f80', '#4a4f5f', '#6ab8ff'], eye: '#6ab8ff', runes: 1 }, d: 'Des runes bleues l\'animent encore.' },
    { id: 'r_rat', n: 'Rat des égouts', b: 2, beh: 'swarm', hp: 10, spd: 110, dmg: 6, r: 9, xp: 0.5, L: { a: 'quad', c: ['#5a504a', '#3a3430', '#f0a0a0'], eye: '#ff3a3a', tail: 1 }, d: 'Il en sort toujours un de plus.' },
    { id: 'r_cultist', n: 'Cultiste', b: 2, beh: 'healer', hp: 40, spd: 50, dmg: 8, r: 14, xp: 4, p: { cd: 4, range: 180 }, L: { a: 'hum', c: ['#6a1a2a', '#3a0a1a', '#ffcf4a'], eye: '#ffcf4a', hood: 1 }, d: 'Il protège ses alliés par des boucliers. À abattre en premier.' },
    { id: 'r_statue', n: 'Statue animée', b: 2, beh: 'radial', hp: 70, spd: 26, dmg: 9, r: 18, xp: 4, p: { cd: 2.8, n: 10, bspd: 140, spin: 1 }, L: { a: 'brute', c: ['#8a8a7a', '#6a6a5a', '#ffe08a'], eye: '#ffe08a', statue: 1 }, d: 'Ses yeux de pierre lancent des éclats en tournoyant.' },
    // Cimes gelées
    { id: 'm_wolf', n: 'Loup des neiges', b: 3, beh: 'chase', hp: 40, spd: 98, dmg: 13, r: 14, xp: 1, L: { a: 'quad', c: ['#e8eef5', '#b8c4d0', '#5a6a7a'], eye: '#4ac8ff', ears: 1 }, d: 'Blanc comme la neige, rapide comme le vent.' },
    { id: 'm_harpy', n: 'Harpie', b: 3, beh: 'flyer', hp: 30, spd: 110, dmg: 12, r: 14, xp: 2, L: { a: 'fly', c: ['#8a6a9a', '#5a4a6a', '#e0c0a0'], eye: '#ffef4a', feather: 1 }, d: 'Elle fond sur vous en hurlant.' },
    { id: 'm_icegolem', n: 'Golem de glace', b: 3, beh: 'split', hp: 120, spd: 40, dmg: 18, r: 21, xp: 5, p: { child: 'm_shard', k: 4 }, L: { a: 'brute', c: ['#9ad8f5', '#5aa8d0', '#fff'], eye: '#fff', ice: 1 }, d: 'Brisé, il éclate en morceaux vivants.' },
    { id: 'm_shard', n: 'Éclat vivant', b: 3, beh: 'swarm', hp: 16, spd: 100, dmg: 7, r: 9, xp: 0.5, child: 1, L: { a: 'wisp', c: ['#bfeaff', '#7ac8f0', '#fff'], eye: '#1a4a6a', crystal: 1 }, d: 'Un fragment de golem qui refuse de fondre.' },
    { id: 'm_blizzard', n: 'Esprit du blizzard', b: 3, beh: 'radial', hp: 50, spd: 50, dmg: 10, r: 15, xp: 3, p: { cd: 2.6, n: 12, bspd: 150, slow: 1 }, L: { a: 'wisp', c: ['#e0f4ff', '#9ad0f0', '#fff'], eye: '#3a8aff' }, d: 'Il souffle des aiguilles de glace.' },
    { id: 'm_goat', n: 'Bouquetin cornu', b: 3, beh: 'charge', hp: 70, spd: 62, dmg: 20, r: 17, xp: 3, L: { a: 'quad', c: ['#a08a6a', '#6a5a4a', '#f0e8d8'], eye: '#ff8a2a', horns: 1 }, d: 'Ses cornes peuvent fendre la roche.' },
    { id: 'm_goblin', n: 'Gobelin des glaces', b: 3, beh: 'shoot', hp: 38, spd: 60, dmg: 12, r: 12, xp: 2, p: { range: 240, cd: 2, bspd: 230, n: 3, spread: 0.25 }, L: { a: 'hum', c: ['#5a9aaa', '#3a6a7a', '#e0f0ff'], eye: '#ffef4a', ears: 1 }, d: 'Lance des stalactites par trois.' },
    { id: 'm_yetiling', n: 'Petit yéti', b: 3, beh: 'leap', hp: 80, spd: 55, dmg: 18, r: 17, xp: 4, p: { cd: 3.2, range: 280 }, L: { a: 'brute', c: ['#f0f4f8', '#c0ccd8', '#6a8aaa'], eye: '#3a6aff', fur: 1 }, d: 'Petit, mais il saute très haut.' },
    { id: 'm_frostwisp', n: 'Feu gelé', b: 3, beh: 'bomber', hp: 22, spd: 112, dmg: 18, r: 11, xp: 1, p: { boom: 64, freeze: 1 }, L: { a: 'wisp', c: ['#7ae0ff', '#2a9ad0', '#fff'], eye: '#fff' }, d: 'Explose en une onde qui gèle.' },
    // Cœur de la brume
    { id: 'h_stalker', n: 'Rôdeur de brume', b: 4, beh: 'chase', hp: 60, spd: 92, dmg: 16, r: 14, xp: 1, L: { a: 'quad', c: ['#2a1a22', '#1a0e14', '#ff5a3c'], eye: '#ff3a1a', spikes: 1 }, d: 'Fait de brume solide. Il ne dort jamais.' },
    { id: 'h_shade', n: 'Ombre', b: 4, beh: 'blink', hp: 50, spd: 85, dmg: 15, r: 13, xp: 2, p: { cd: 2.6 }, L: { a: 'wisp', c: ['#2a2a3a', '#0a0a14', '#ff3a6a'], eye: '#ff3a6a', ghost: 1 }, d: 'Votre propre ombre, devenue affamée.' },
    { id: 'h_eye', n: 'Œil flottant', b: 4, beh: 'shoot', hp: 55, spd: 50, dmg: 13, r: 15, xp: 3, p: { range: 260, cd: 2.2, bspd: 220, n: 5, spread: 0.3 }, L: { a: 'eye', c: ['#e8d8d0', '#8a2a3a', '#ff3a2a'], eye: '#ff2a1a' }, d: 'Il vous fixe. Puis il tire.' },
    { id: 'h_crawler', n: 'Horreur rampante', b: 4, beh: 'split', hp: 110, spd: 45, dmg: 18, r: 20, xp: 4, p: { child: 'h_spawn', k: 4 }, L: { a: 'blob', c: ['#3a1a2a', '#1a0a14', '#ff5a3c'], eye: '#ffcf2a', tent: 1 }, d: 'Un amas de brume qui grouille de petits.' },
    { id: 'h_spawn', n: 'Engeance', b: 4, beh: 'swarm', hp: 22, spd: 115, dmg: 9, r: 9, xp: 0.5, L: { a: 'bug', c: ['#4a1a2a', '#2a0a14', '#ff5a3c'], eye: '#ff3a1a', legs: 6 }, d: 'Né de la brume, il ne vit que pour mordre.' },
    { id: 'h_reaper', n: 'Moissonneur', b: 4, beh: 'charge', hp: 100, spd: 70, dmg: 24, r: 17, xp: 4, L: { a: 'hum', c: ['#1a1a22', '#3a3a4a', '#c0c0d0'], eye: '#ff2a1a', hood: 1, scythe: 1 }, d: 'Sa faux trace une ligne : ne restez pas dessus.' },
    { id: 'h_priest', n: 'Prêtre de la brume', b: 4, beh: 'summon', hp: 80, spd: 45, dmg: 12, r: 15, xp: 5, p: { cd: 5, child: 'h_spawn', k: 4, range: 270 }, L: { a: 'hum', c: ['#4a0a1a', '#2a0a10', '#ff8a3a'], eye: '#ff8a3a', hood: 1, staff: 1 }, d: 'Il prie la brume, et la brume répond.' },
    { id: 'h_colossus', n: 'Colosse', b: 4, beh: 'radial', hp: 260, spd: 30, dmg: 24, r: 26, xp: 8, p: { cd: 3, n: 14, bspd: 130 }, L: { a: 'brute', c: ['#2a1a1a', '#1a0a0a', '#ff4a2a'], eye: '#ff4a2a', spikes: 1 }, d: 'Une montagne de chair et de cendre.' },
    // Spécial
    { id: 'x_mimic', n: 'Mimique', b: -1, beh: 'charge', hp: 120, spd: 70, dmg: 18, r: 18, xp: 10, L: { a: 'mimic', c: ['#8a5a2a', '#5a3a1a', '#ffcf4a'], eye: '#ff3a3a' }, d: 'Un coffre avec des dents. Le butin était trop beau.' }
  ];

  // ───────────── BOSS ─────────────
  // Attaques : radial, aimed, spiral, charge, slam, target, line, summon, leap, cone, pools, teleport, darken
  const BO = [
    { id: 'g_stag', n: 'Cerf Pourri', b: 0, guard: 1, hp: 900, r: 34, spd: 70, dmg: 16, L: { a: 'quad', c: ['#4a3a2a', '#2a2018', '#c8e0a0'], eye: '#bfff4a', antlers: 1, sc: 1 },
      d: 'Le roi de la forêt, rongé par la brume. Ses bois poussent comme des ronces.',
      atk: [{ t: 'charge', w: 3, n: 1 }, { t: 'radial', w: 2, n: 14, bspd: 150, rep: 2 }, { t: 'summon', w: 1, m: 'f_wolf', k: 3 }],
      ph2: [{ t: 'charge', w: 3, n: 2 }, { t: 'radial', w: 2, n: 18, bspd: 160, rep: 3 }, { t: 'target', w: 2, k: 4, r: 50 }] },
    { id: 'b_root', n: 'Mère-Racine', b: 0, hp: 2200, r: 44, spd: 0, dmg: 18, L: { a: 'root', c: ['#4a3a24', '#2a2014', '#8ae05a'], eye: '#ff9a2a', sc: 1 },
      d: 'Le cœur pourri de la Forêt Sombre. Ses racines sont partout.',
      atk: [{ t: 'target', w: 3, k: 5, r: 48, delay: 0.9 }, { t: 'aimed', w: 2, n: 5, spread: 0.5, bspd: 210, rep: 3 }, { t: 'summon', w: 1, m: 'f_shroomling', k: 6 }],
      ph2: [{ t: 'target', w: 3, k: 7, r: 52, delay: 0.8 }, { t: 'spiral', w: 2, arms: 3, dur: 3, rate: 0.12, bspd: 150 }, { t: 'summon', w: 1, m: 'f_treant', k: 2 }, { t: 'line', w: 2, k: 3 }] },
    { id: 'g_toad', n: 'Crapaud-Roi', b: 1, guard: 1, hp: 1350, r: 38, spd: 40, dmg: 16, L: { a: 'frog', c: ['#6a8a2a', '#3a5a1a', '#ffcf2a'], eye: '#ff6a2a', crown: 1, sc: 1 },
      d: 'Il règne sur la vase et dévore ses sujets.',
      atk: [{ t: 'leap', w: 3 }, { t: 'line', w: 2, k: 1, tongue: 1 }, { t: 'pools', w: 2, k: 5 }],
      ph2: [{ t: 'leap', w: 3, n: 2 }, { t: 'radial', w: 2, n: 16, bspd: 150, rep: 2 }, { t: 'pools', w: 2, k: 6 }, { t: 'summon', w: 1, m: 's_frog', k: 2 }] },
    { id: 'b_hydra', n: 'Hydre des Tourbières', b: 1, hp: 3900, r: 46, spd: 0, dmg: 20, L: { a: 'hydra', c: ['#3a6a4a', '#1a3a2a', '#c0ff8a'], eye: '#ffef2a', sc: 1 },
      d: 'Trois têtes, trois faims. Elle plonge et resurgit où on ne l\'attend pas.',
      atk: [{ t: 'aimed', w: 3, n: 3, spread: 0.35, bspd: 230, rep: 4 }, { t: 'teleport', w: 1 }, { t: 'cone', w: 2 }, { t: 'pools', w: 1, k: 6 }],
      ph2: [{ t: 'aimed', w: 3, n: 5, spread: 0.4, bspd: 250, rep: 5 }, { t: 'teleport', w: 2 }, { t: 'spiral', w: 2, arms: 3, dur: 3, rate: 0.1, bspd: 170 }, { t: 'summon', w: 1, m: 's_slime', k: 3 }] },
    { id: 'g_golem', n: 'Golem de Ruine', b: 2, guard: 1, hp: 2600, r: 42, spd: 34, dmg: 24, L: { a: 'brute', c: ['#7a7f90', '#4a4f60', '#6ab8ff'], eye: '#6ab8ff', runes: 1, sc: 1 },
      d: 'Le dernier gardien du royaume englouti. Chaque pas fait trembler les ruines.',
      atk: [{ t: 'slam', w: 3, r: 150 }, { t: 'aimed', w: 2, n: 1, big: 1, bspd: 200, rep: 3 }, { t: 'radial', w: 2, n: 20, bspd: 140, gap: 1 }],
      ph2: [{ t: 'slam', w: 3, r: 180, n: 2 }, { t: 'target', w: 2, k: 6, r: 60 }, { t: 'radial', w: 2, n: 24, bspd: 160, gap: 1, rep: 2 }, { t: 'summon', w: 1, m: 'r_skel', k: 4 }] },
    { id: 'b_lich', n: 'Liche Archiviste', b: 2, hp: 5200, r: 34, spd: 50, dmg: 22, L: { a: 'lich', c: ['#3a2a5a', '#1a1030', '#6af0ff'], eye: '#6af0ff', sc: 1 },
      d: 'Elle a lu tous les livres du monde, et elle veut écrire sa fin.',
      atk: [{ t: 'spiral', w: 3, arms: 4, dur: 3.5, rate: 0.1, bspd: 160 }, { t: 'teleport', w: 2 }, { t: 'summon', w: 1, m: 'r_skel', k: 5 }, { t: 'aimed', w: 2, n: 7, spread: 0.6, bspd: 220, rep: 3 }],
      ph2: [{ t: 'spiral', w: 3, arms: 6, dur: 4, rate: 0.09, bspd: 170 }, { t: 'teleport', w: 2 }, { t: 'target', w: 2, k: 8, r: 50 }, { t: 'summon', w: 1, m: 'r_specter', k: 4 }] },
    { id: 'g_yeti', n: 'Yéti Hurleur', b: 3, guard: 1, hp: 3900, r: 40, spd: 55, dmg: 22, L: { a: 'brute', c: ['#f0f4f8', '#b0c0d0', '#6a8aaa'], eye: '#2a6aff', fur: 1, sc: 1 },
      d: 'Son cri fait trembler la montagne. Et vos jambes.',
      atk: [{ t: 'leap', w: 3 }, { t: 'aimed', w: 2, n: 1, big: 1, bspd: 230, rep: 4 }, { t: 'roar', w: 1 }],
      ph2: [{ t: 'leap', w: 3, n: 2 }, { t: 'roar', w: 1 }, { t: 'radial', w: 2, n: 22, bspd: 170, rep: 2 }, { t: 'summon', w: 1, m: 'm_yetiling', k: 2 }] },
    { id: 'b_wyrm', n: 'Wyrm de Givre', b: 3, hp: 7600, r: 30, spd: 120, dmg: 26, L: { a: 'wyrm', c: ['#9ad8f5', '#3a7aa8', '#fff'], eye: '#ff4a8a', sc: 1 },
      d: 'Un dragon de glace qui ondule dans le blizzard.',
      atk: [{ t: 'cone', w: 3, ice: 1 }, { t: 'line', w: 2, k: 3 }, { t: 'charge', w: 2, n: 2 }, { t: 'radial', w: 1, n: 18, bspd: 160 }],
      ph2: [{ t: 'cone', w: 3, ice: 1, wide: 1 }, { t: 'line', w: 2, k: 5 }, { t: 'charge', w: 2, n: 3 }, { t: 'spiral', w: 2, arms: 4, dur: 3, rate: 0.09, bspd: 170 }] },
    { id: 'g_knight', n: 'Chevalier Creux', b: 4, guard: 1, hp: 5000, r: 30, spd: 80, dmg: 30, L: { a: 'knight', c: ['#3a3a4a', '#1a1a24', '#ff5a3c'], eye: '#ff3a1a', sc: 1 },
      d: 'Une armure vide qui sert encore un roi disparu.',
      atk: [{ t: 'charge', w: 3, n: 3 }, { t: 'aimed', w: 2, n: 1, wave: 1, bspd: 260, rep: 3 }, { t: 'slam', w: 2, r: 130 }],
      ph2: [{ t: 'charge', w: 3, n: 4 }, { t: 'aimed', w: 2, n: 3, wave: 1, spread: 0.5, bspd: 280, rep: 3 }, { t: 'target', w: 2, k: 6, r: 55 }, { t: 'summon', w: 1, m: 'h_shade', k: 3 }] },
    { id: 'b_mist', n: 'La Brume Incarnée', b: 4, hp: 11000, r: 50, spd: 30, dmg: 30, L: { a: 'mistlord', c: ['#1a0a14', '#3a1a2a', '#ff5a3c'], eye: '#ff3a1a', sc: 1 },
      d: 'La source de tout. Elle veut éteindre la dernière lanterne.',
      atk: [{ t: 'spiral', w: 3, arms: 5, dur: 3.5, rate: 0.08, bspd: 170 }, { t: 'target', w: 2, k: 7, r: 55 }, { t: 'summon', w: 1, m: 'h_spawn', k: 8 }, { t: 'darken', w: 1 }],
      ph2: [{ t: 'spiral', w: 3, arms: 6, dur: 4, rate: 0.075, bspd: 180 }, { t: 'line', w: 2, k: 5 }, { t: 'radial', w: 2, n: 26, bspd: 170, gap: 1, rep: 3 }, { t: 'darken', w: 1 }, { t: 'summon', w: 1, m: 'h_reaper', k: 3 }],
      ph3: [{ t: 'spiral', w: 3, arms: 8, dur: 4, rate: 0.07, bspd: 190 }, { t: 'target', w: 2, k: 10, r: 55 }, { t: 'charge', w: 2, n: 3 }, { t: 'cone', w: 2, wide: 1 }, { t: 'darken', w: 1 }] }
  ];

  B.MONSTERS = {}; M.forEach(m => { m.kind = 'm'; B.MONSTERS[m.id] = m; });
  BO.forEach(m => { m.kind = 'boss'; B.MONSTERS[m.id] = m; });
  B.MONSTER_LIST = M; B.BOSS_LIST = BO;

  B.ELITE_AFFIX = [
    { id: 'swift', n: 'Rapide', d: 'Se déplace beaucoup plus vite.' },
    { id: 'armored', n: 'Blindé', d: 'Encaisse 40 % de dégâts en moins.' },
    { id: 'vampire', n: 'Vampire', d: 'Se soigne quand il vous touche.' },
    { id: 'explosive', n: 'Explosif', d: 'Explose à sa mort.' },
    { id: 'frozen', n: 'Glacial', d: 'Vous ralentit quand vous êtes proche.' },
    { id: 'shielded', n: 'Protégé', d: 'Un bouclier se recharge sans cesse.' },
    { id: 'berserk', n: 'Enragé', d: 'Plus rapide et plus fort quand il est blessé.' },
    { id: 'splitter', n: 'Diviseur', d: 'Se divise en deux à sa mort.' }
  ];
})(this.B || (this.B = {}));
// Particularités de salle (affichées sur la carte) : rendent chaque combat un peu différent
(function (B) {
  'use strict';
  B.VARIANTS = [
    { id: 'moon', n: 'Pleine lune', i: '🌕', d: 'Lanterne +40 %, expérience +20 %.' },
    { id: 'gold', n: 'Ruée vers l\'or', i: '💰', d: 'Les monstres lâchent trois fois plus d\'or.' },
    { id: 'horde', n: 'La horde', i: '👹', d: 'Bien plus de monstres, mais plus fragiles. Expérience +25 %.' },
    { id: 'storm', n: 'Orage', i: '🌩️', d: 'La foudre tombe au hasard : elle blesse tout le monde. Essences +2.' },
    { id: 'fog', n: 'Brume épaisse', i: '🌫️', d: 'Lanterne −30 %, mais braises +50 %.' },
    { id: 'blood', n: 'Lune de sang', i: '🩸', d: 'Monstres +25 % de dégâts. Un objet garanti à la fin.' },
    { id: 'chests', n: 'Coffres cachés', i: '🎁', d: 'Deux coffres sont cachés dans la brume. Trouvez-les !' },
    { id: 'rift', n: 'Faille', i: '🌀', d: 'Une élite surgit en plein combat. Essences +3.' }
  ];
})(this.B || (this.B = {}));
