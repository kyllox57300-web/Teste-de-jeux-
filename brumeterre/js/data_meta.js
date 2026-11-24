// Brumeterre — contenu permanent : survivants, bâtiments, talents, objets, événements, défis, succès, histoire
(function (B) {
  'use strict';

  // ───────────── SURVIVANTS ─────────────
  // b : biome où on peut les trouver ; bld : bâtiment débloqué ; st : bonus permanent
  B.SURVIVORS = [
    { id: 'brann', n: 'Brann', r: 'Forgeron', i: '🧔', b: 0, bld: 'forge', col: '#a0522d', st: {},
      lines: ['Le feu de ma forge s\'était éteint… Grâce à toi, il brûle de nouveau.', 'Rapporte-moi du bois-de-lune, et je ferai de tes armes des légendes.', 'Une bonne lame, c\'est comme une bonne lanterne : il faut l\'entretenir.'],
      q: [{ k: 'elite', n: 10, rw: { bois: 30 } }, { k: 'items', n: 15, rw: { braise: 600 } }, { k: 'upgrade', n: 5, rw: { aube: 1 } }] },
    { id: 'gaspard', n: 'Gaspard', r: 'Aubergiste', i: '🍺', b: 0, bld: 'tavern', col: '#c08a3a', st: {},
      lines: ['Une taverne sans clients, c\'est une tombe avec des tables !', 'Les aventuriers qui passent ici cherchent du travail. Paie-les bien.', 'Raconte-moi ta dernière expédition, et je t\'offre une soupe.'],
      q: [{ k: 'runs', n: 5, rw: { braise: 300 } }, { k: 'heroes', n: 3, rw: { essence: 20 } }, { k: 'heroes', n: 6, rw: { aube: 2 } }] },
    { id: 'odile', n: 'Mère Odile', r: 'Érudite', i: '👵', b: 0, bld: 'academy', col: '#6a5aa0', st: {},
      lines: ['J\'ai sauvé trois livres de la brume. Trois ! Le reste… perdu.', 'Le savoir est une lumière qui ne s\'éteint pas, mon petit.', 'Chaque essence que tu rapportes est une page de plus à notre histoire.'],
      q: [{ k: 'talents', n: 5, rw: { essence: 15 } }, { k: 'evo', n: 3, rw: { essence: 40 } }, { k: 'talents', n: 30, rw: { aube: 2 } }] },
    { id: 'pip', n: 'Pip', r: 'Jardinière', i: '👩‍🌾', b: 0, bld: 'garden', col: '#5a9a4a', st: {},
      lines: ['Même dans la brume, les herbes poussent si on leur parle gentiment.', 'Rapporte-moi des herbes, je te ferai des potions qui piquent !', 'Tu savais que les champignonnets sont comestibles ? Moi non plus.'],
      q: [{ k: 'herbs', n: 20, rw: { braise: 400 } }, { k: 'potions', n: 5, rw: { herbe: 15 } }, { k: 'kill', m: 'f_shroomling', n: 300, rw: { aube: 1 } }] },
    { id: 'marguerite', n: 'Marguerite', r: 'Boulangère', i: '🥐', b: 0, col: '#e0a060', st: { hp_pct: 0.05 },
      lines: ['Du pain chaud chaque matin pour les expéditions ! (Vie max +5 %)', 'Le four, c\'est ma lanterne à moi.', 'Reviens vivant, sinon qui mangera mes brioches ?'],
      q: [{ k: 'kill', m: 'f_wolf', n: 200, rw: { braise: 500 } }, { k: 'clear', b: 1, rw: { essence: 25 } }] },
    { id: 'ambre', n: 'Sœur Ambre', r: 'Prêtresse', i: '🙏', b: 1, bld: 'altar', col: '#d0b060', st: {},
      lines: ['La lumière ne meurt jamais tout à fait. Elle attend.', 'Prie à l\'autel avant de partir : la brume craint la foi.', 'J\'ai vu des choses dans le marais… Des choses qui priaient aussi.'],
      q: [{ k: 'boss', id: 'b_hydra', rw: { essence: 30 } }, { k: 'blessed', n: 10, rw: { aube: 1 } }] },
    { id: 'tilda', n: 'Tilda', r: 'Dresseuse', i: '🧑‍🦰', b: 1, bld: 'stable', col: '#8a6a3a', st: {},
      lines: ['Les bêtes sentent la brume avant nous. Écoute-les.', 'Un compagnon fidèle vaut dix épées.', 'Mon renardeau a encore volé une saucisse à Marguerite.'],
      q: [{ k: 'compLvl', n: 5, rw: { braise: 800 } }, { k: 'comps', n: 4, rw: { essence: 40 } }, { k: 'compLvl', n: 10, rw: { aube: 2 } }] },
    { id: 'nella', n: 'Nella', r: 'Guérisseuse', i: '👩‍⚕️', b: 1, col: '#5ab0a0', st: { healPow: 0.1 },
      lines: ['Je soigne mieux quand on ne me ramène pas des morceaux. (Soins +10 %)', 'Bois ça. Non, ne sens pas. Bois.', 'La brume rend les blessures plus froides.'],
      q: [{ k: 'runsWon', n: 3, rw: { herbe: 20 } }, { k: 'noHit', n: 1, rw: { essence: 30 } }] },
    { id: 'jory', n: 'Jory', r: 'Enfant perdu', i: '🧒', b: 1, col: '#e0c060', st: { luck: 0.05 },
      lines: ['T\'as vu ? J\'ai trouvé un caillou qui brille ! (Chance +5)', 'Quand je serai grand, je porterai une lanterne aussi !', 'Les grenouilles du marais m\'ont dit un secret. Je le dirai pas.'],
      q: [{ k: 'kill', m: 's_frog', n: 150, rw: { braise: 700 } }, { k: 'gold', n: 300, rw: { aube: 1 } }] },
    { id: 'orion', n: 'Orion', r: 'Astronome', i: '🔭', b: 2, bld: 'observatory', col: '#4a6ab0', st: {},
      lines: ['Au-dessus de la brume, les étoiles brillent encore. Je les ai vues.', 'Les défis des étoiles changent chaque jour. Relève-les !', 'Il y a un niveau de brume plus profond. Bien plus profond.'],
      q: [{ k: 'daily', n: 3, rw: { essence: 40 } }, { k: 'endless', n: 300, rw: { aube: 2 } }] },
    { id: 'lise', n: 'Lise', r: 'Marchande', i: '👩‍💼', b: 2, col: '#b05a8a', st: { shop: 1 },
      lines: ['Les marchands de la brume me connaissent : ils te feront un prix. (Marchands −10 %)', 'Tout s\'achète. Sauf un bon conseil, que je donne gratuitement.', 'Ramène de l\'or, beaucoup d\'or.'],
      q: [{ k: 'buy', n: 15, rw: { braise: 1500 } }, { k: 'gold', n: 1000, rw: { aube: 1 } }] },
    { id: 'fenwick', n: 'Fenwick', r: 'Cartographe', i: '🗺️', b: 2, col: '#7a8a5a', st: { mapSee: 1 },
      lines: ['J\'ai dessiné les chemins de la brume. Ils bougent, mais pas trop. (Salles mystère révélées)', 'Un bon chemin vaut mieux qu\'une bonne épée.', 'Les ruines cachent des passages secrets.'],
      q: [{ k: 'events', n: 25, rw: { essence: 50 } }, { k: 'clear', b: 3, rw: { aube: 2 } }] },
    { id: 'hugo', n: 'Hugo', r: 'Chasseur', i: '🏹', b: 3, col: '#6a8a4a', st: { xp: 0.05 },
      lines: ['Je connais chaque bête de ces montagnes. (Expérience +5 %)', 'Le Yéti ? Je l\'ai raté de peu. Il ne m\'a pas raté.', 'Vise les élites d\'abord. Toujours.'],
      q: [{ k: 'kill', m: 'm_wolf', n: 300, rw: { braise: 2000 } }, { k: 'boss', id: 'g_yeti', rw: { aube: 1 } }] },
    { id: 'barnabe', n: 'Barnabé', r: 'Bûcheron', i: '🪓', b: 3, col: '#8a5a2a', st: { boisMul: 0.15 },
      lines: ['Du bois-de-lune ? J\'en coupe les yeux fermés. (Bois +15 %)', 'Les pins gelés chantent quand on les coupe.', 'Construis grand. Construis haut.'],
      q: [{ k: 'fanal', n: 7, rw: { bois: 150 } }, { k: 'buildings', n: 30, rw: { aube: 2 } }] },
    { id: 'ysa', n: 'Ysa', r: 'Musicienne', i: '🎻', b: 4, col: '#a05ab0', st: { gold: 0.08 },
      lines: ['Ma musique éloigne la brume… un peu. (Braises +8 %)', 'Tu entends ? Le village chante de nouveau.', 'Quand tout sera fini, je jouerai pour toi.'],
      q: [{ k: 'kills', n: 50000, rw: { aube: 2 } }, { k: 'boss', id: 'b_mist', rw: { aube: 3 } }] },
    { id: 'aldwin', n: 'Aldwin', r: 'Vieux garde', i: '💂', b: 4, col: '#5a5a7a', st: { armor: 1 },
      lines: ['J\'ai gardé les portes du royaume jusqu\'au bout. (Armure +1)', 'Le Chevalier Creux… c\'était mon capitaine.', 'Tiens ta lanterne haute, Porteur.'],
      q: [{ k: 'boss', id: 'g_knight', rw: { essence: 120 } }, { k: 'deep', n: 5, rw: { aube: 3 } }] }
  ];

  // ───────────── BÂTIMENTS ─────────────
  B.BUILDINGS = [
    { id: 'fanal', n: 'Grand Fanal', i: '🗼', d: 'Le cœur du village. Plus il brille, plus la brume recule et plus le village peut grandir.', max: 10,
      cost: [null, { braise: 250, bois: 8 }, { braise: 700, bois: 22 }, { braise: 1600, bois: 45, essence: 10 }, { braise: 3200, bois: 80, essence: 25 }, { braise: 5500, bois: 130, essence: 50 }, { braise: 8500, bois: 190, essence: 85 }, { braise: 12500, bois: 260, essence: 130 }, { braise: 18000, bois: 350, essence: 190 }, { braise: 26000, bois: 480, essence: 270 }],
      eff: (l) => 'Ressources gagnées +' + (l * 3) + ' %. Niveau max des autres bâtiments : ' + Math.min(5, Math.ceil(l / 2) + 1) + '.' },
    { id: 'forge', n: 'Forge', i: '⚒️', d: 'Améliorez et recyclez votre équipement. Au niveau 5, transmutez un objet légendaire en mythique.', max: 5, need: 'brann',
      cost: [{ braise: 150, bois: 5 }, { braise: 900, bois: 30 }, { braise: 2500, bois: 70, essence: 20 }, { braise: 6000, bois: 140, essence: 60 }, { braise: 14000, bois: 260, essence: 150 }],
      eff: (l) => ['', 'Amélioration jusqu\'à +3, recyclage', 'Amélioration jusqu\'à +5', 'Amélioration jusqu\'à +7, relance d\'une ligne', 'Amélioration jusqu\'à +10', 'Transmutation mythique'][l] },
    { id: 'academy', n: 'Académie', i: '📚', d: 'Mère Odile y enseigne l\'arbre des talents. Chaque niveau ouvre une rangée de talents.', max: 5, need: 'odile',
      cost: [{ braise: 200, bois: 6 }, { braise: 1100, bois: 30 }, { braise: 3000, bois: 75, essence: 25 }, { braise: 7000, bois: 150, essence: 70 }, { braise: 15000, bois: 280, essence: 160 }],
      eff: (l) => 'Talents de rang ' + l + ' disponibles.' },
    { id: 'tavern', n: 'Taverne', i: '🍻', d: 'Des aventuriers attendent qu\'on les engage. Chaque niveau en attire de nouveaux.', max: 4, need: 'gaspard',
      cost: [{ braise: 150, bois: 5 }, { braise: 1200, bois: 35 }, { braise: 3500, bois: 80, essence: 30 }, { braise: 8000, bois: 160, essence: 80 }],
      eff: (l) => 'Héros de rang ' + l + ' recrutables.' },
    { id: 'altar', n: 'Autel', i: '⛩️', d: 'Priez avant de partir pour recevoir des bénédictions.', max: 5, need: 'ambre',
      cost: [{ braise: 500, bois: 15 }, { braise: 1500, bois: 40, essence: 10 }, { braise: 3500, bois: 80, essence: 35 }, { braise: 7000, bois: 150, essence: 80 }, { braise: 13000, bois: 250, essence: 140 }],
      eff: (l) => [0, 1, 1, 2, 2, 3][l] + ' bénédiction(s) par expédition, ' + [0, 4, 6, 8, 10, 12][l] + ' bénédictions connues.' },
    { id: 'garden', n: 'Jardin', i: '🌿', d: 'Pip y cultive des herbes et prépare des potions à emporter.', max: 5, need: 'pip',
      cost: [{ braise: 250, bois: 8 }, { braise: 1000, bois: 30 }, { braise: 2800, bois: 65, essence: 20 }, { braise: 6000, bois: 130, essence: 55 }, { braise: 12000, bois: 230, essence: 120 }],
      eff: (l) => '+' + l * 2 + ' herbes par expédition, ' + Math.min(6, l + 1) + ' recettes, ' + (l >= 3 ? 2 : 1) + ' potion(s) emportée(s).' },
    { id: 'stable', n: 'Écurie', i: '🐾', d: 'Tilda y soigne et entraîne les compagnons.', max: 5, need: 'tilda',
      cost: [{ braise: 400, bois: 12 }, { braise: 1400, bois: 40 }, { braise: 3500, bois: 80, essence: 30 }, { braise: 7500, bois: 150, essence: 75 }, { braise: 14000, bois: 260, essence: 150 }],
      eff: (l) => 'Compagnons jusqu\'au niveau ' + l * 2 + '.' },
    { id: 'observatory', n: 'Observatoire', i: '🔭', d: 'Orion y lit les étoiles : défis du jour et de la semaine, mode Infini et Brume Profonde.', max: 3, need: 'orion',
      cost: [{ braise: 1500, bois: 40, essence: 15 }, { braise: 5000, bois: 110, essence: 60 }, { braise: 12000, bois: 220, essence: 140 }],
      eff: (l) => ['', 'Défis du jour', 'Défis de la semaine et mode Infini', 'Brume Profonde (après la victoire finale)'][l] }
  ];

  // ───────────── TALENTS (65) ─────────────
  // [id, branche, rang, nom, icône, description, max, stats par niveau, drapeau]
  const T = [
    ['t_con', 0, 1, 'Constitution', '❤️', 'Vie max +5 %', 5, { hp_pct: 0.05 }],
    ['t_hide', 0, 1, 'Peau dure', '🦔', 'Armure +1', 3, { armor: 1 }],
    ['t_breath', 0, 1, 'Second souffle', '🌬️', 'Régénération +0,15/s', 3, { regen: 0.15 }],
    ['t_dodge', 0, 2, 'Pas assuré', '🍃', 'Esquive +2 %', 3, { dodge: 0.02 }],
    ['t_band', 0, 2, 'Bandages', '🩹', 'Soins +10 %', 3, { healPow: 0.1 }],
    ['t_camp', 0, 2, 'Veillée', '🔥', 'Les feux de camp soignent +10 % de plus', 3, {}, 'campHeal'],
    ['t_aegis', 0, 3, 'Égide innée', '🔰', 'Bloque le premier coup de chaque combat', 1, {}, 'startShield'],
    ['t_boss', 0, 3, 'Robustesse', '🗿', 'Vie max +15', 3, { hp: 15 }],
    ['t_vig', 0, 3, 'Vigueur d\'aube', '💗', 'Vie max +4 %', 3, { hp_pct: 0.04 }],
    ['t_last', 0, 4, 'Dernier rempart', '🧱', 'Armure +2', 2, { armor: 2 }],
    ['t_after', 0, 4, 'Repos du guerrier', '🛏️', 'Récupère 4 % de vie après chaque combat', 3, {}, 'postHeal'],
    ['t_rev', 0, 5, 'Renaissance', '🐦‍🔥', 'Une résurrection par expédition', 1, { revive: 1 }],
    ['t_unb', 0, 5, 'Inébranlable', '⛰️', 'Vie max +8 %', 2, { hp_pct: 0.08 }],

    ['t_sharp', 1, 1, 'Affûtage', '🗡️', 'Dégâts +4 %', 5, { dmg: 0.04 }],
    ['t_quick', 1, 1, 'Vivacité', '⚡', 'Recharge −3 %', 3, { cd: 0.03 }],
    ['t_prec', 1, 1, 'Précision', '🎯', 'Critique +2 %', 3, { crit: 0.02 }],
    ['t_fatal', 1, 2, 'Coup fatal', '💀', 'Dégâts critiques +10 %', 3, { critd: 0.1 }],
    ['t_hunt', 1, 2, 'Chasseur d\'élite', '🏹', 'Dégâts contre élites et boss +6 %', 3, { elite: 0.06 }],
    ['t_area', 1, 2, 'Envergure', '⭕', 'Zone +4 %', 3, { area: 0.04 }],
    ['t_pspd', 1, 3, 'Projectiles affûtés', '🪶', 'Vitesse des projectiles +8 %', 2, { pspd: 0.08 }],
    ['t_elem', 1, 3, 'Éléments', '🌈', 'Dégâts de tous les éléments +5 %', 3, { fireDmg: 0.05, iceDmg: 0.05, boltDmg: 0.05, poisonDmg: 0.05, lightDmg: 0.05, shadowDmg: 0.05, natureDmg: 0.05, arcaneDmg: 0.05 }],
    ['t_dur', 1, 3, 'Persistance', '⏱️', 'Durée +6 %', 3, { dur: 0.06 }],
    ['t_multi', 1, 4, 'Multiplication', '🔁', '+1 projectile', 1, { n: 1 }],
    ['t_spch', 1, 4, 'Charge rapide', '🌟', 'Capacité spéciale −8 % de recharge', 3, { spCharge: 0.08 }],
    ['t_master', 1, 5, 'Maître d\'armes', '⚔️', 'Dégâts +7 %', 3, { dmg: 0.07 }],
    ['t_heart', 1, 5, 'Cœur de braise', '❤️‍🔥', 'Commence l\'expédition un niveau plus haut', 2, {}, 'startLvl'],

    ['t_wick', 2, 1, 'Mèche longue', '🕯️', 'Lanterne +5 %', 3, { light: 0.05 }],
    ['t_mag', 2, 1, 'Attraction', '🧲', 'Ramassage +10 %', 3, { pick: 0.1 }],
    ['t_run', 2, 1, 'Pas rapide', '👟', 'Vitesse +3 %', 3, { spd: 0.03 }],
    ['t_wis', 2, 2, 'Sagesse', '📖', 'Expérience +5 %', 3, { xp: 0.05 }],
    ['t_glow', 2, 2, 'Lueur', '✨', 'Lanterne +4 %, chance +3', 3, { light: 0.04, luck: 0.03 }],
    ['t_watch', 2, 2, 'Veilleur', '🌙', 'La capacité spéciale démarre chargée à moitié', 1, {}, 'spStart'],
    ['t_four', 2, 3, 'Pouvoirs connus', '🃏', '4 cartes au choix au lieu de 3', 1, {}, 'fourCards'],
    ['t_reroll', 2, 3, 'Relance', '🎲', '+1 relance de cartes par expédition', 3, {}, 'reroll'],
    ['t_ban', 2, 3, 'Bannissement', '🚫', '+1 bannissement de carte par expédition', 3, {}, 'banish'],
    ['t_clar', 2, 4, 'Clarté', '💡', 'Lanterne +8 %, chance +5', 2, { light: 0.08, luck: 0.05 }],
    ['t_wslot', 2, 4, 'Arsenal', '🗃️', '+1 emplacement d\'arme', 1, {}, 'wslot'],
    ['t_pslot', 2, 5, 'Grimoire', '📜', '+1 emplacement de passif', 1, {}, 'pslot'],
    ['t_inner', 2, 5, 'Phare intérieur', '🗼', 'Expérience +8 %', 2, { xp: 0.08 }],

    ['t_glean', 3, 1, 'Glaneur', '🔥', 'Braises +5 %', 5, {}, 'braiseMul'],
    ['t_coins', 3, 1, 'Bourse', '🪙', 'Or +8 %', 3, { gold: 0.08 }],
    ['t_wood', 3, 1, 'Bûcheronnage', '🪵', 'Bois-de-lune +8 %', 3, {}, 'boisMul'],
    ['t_luck', 3, 2, 'Bonne étoile', '🍀', 'Chance +5', 3, { luck: 0.05 }],
    ['t_barg', 3, 2, 'Marchandage', '🤝', 'Prix des marchands −7 %', 3, {}, 'shop'],
    ['t_cache', 3, 2, 'Trésor caché', '💎', 'Les trésors donnent +40 % d\'or', 2, {}, 'treasure'],
    ['t_keep', 3, 3, 'Prévoyance', '🎒', 'En cas de mort, garde +8 % des ressources', 3, {}, 'keep'],
    ['t_ess', 3, 3, 'Essence pure', '💧', 'Essences +8 %', 3, {}, 'essMul'],
    ['t_inh', 3, 3, 'Héritage', '👛', 'Commence avec 25 pièces d\'or', 3, {}, 'startGold'],
    ['t_eye', 3, 4, 'Œil d\'expert', '🧐', 'Meilleure rareté des objets trouvés', 3, {}, 'itemLuck'],
    ['t_herb', 3, 4, 'Herboriste', '🌱', '+1 herbe par combat gagné', 2, {}, 'herbPer'],
    ['t_dawn', 3, 5, 'Fortune d\'aube', '✨', '+1 Éclat d\'Aube par boss final vaincu', 1, {}, 'aubeBoss'],
    ['t_mag2', 3, 5, 'Magnat', '👑', 'Toutes les ressources +6 %', 2, {}, 'allMul'],

    ['t_beast', 4, 1, 'Ami des bêtes', '🐾', 'Compagnons +10 % de dégâts', 3, {}, 'compDmg'],
    ['t_appr', 4, 1, 'Apprenti', '🎓', 'Maîtrise des héros +12 %', 3, {}, 'heroXp'],
    ['t_pot', 4, 1, 'Besace', '🧪', '+1 potion emportée', 2, {}, 'potSlot'],
    ['t_train', 4, 2, 'Dressage', '🦴', 'Expérience des compagnons +20 %', 3, {}, 'compXp'],
    ['t_bless', 4, 2, 'Ferveur', '🙏', '+1 bénédiction', 1, {}, 'blessSlot'],
    ['t_alch', 4, 2, 'Alchimie', '⚗️', 'Potions +20 % plus efficaces', 3, {}, 'potPow'],
    ['t_aff', 4, 3, 'Affinité', '🔮', 'Votre élément le plus présent compte pour un pouvoir de plus', 1, {}, 'affinity'],
    ['t_poly', 4, 3, 'Polyvalence', '🎭', 'Dégâts +2 % par arme possédée', 3, {}, 'poly'],
    ['t_calm', 4, 3, 'Sang-froid', '🧊', 'Dégâts reçus −3 %', 2, {}, 'calm'],
    ['t_second', 4, 4, 'Second départ', '🎁', 'Commence avec une arme aléatoire en plus', 1, {}, 'extraWeapon'],
    ['t_talis', 4, 4, 'Talisman', '🧿', 'Commence avec un passif aléatoire', 1, {}, 'extraPassive'],
    ['t_leg', 4, 5, 'Légende', '🌠', 'Évolutions : dégâts +12 %', 2, {}, 'evoDmg'],
    ['t_asc', 4, 5, 'Ascension', '🔆', 'L\'arme de départ commence au niveau 2', 1, {}, 'startW2']
  ];
  B.TALENT_BRANCHES = [{ n: 'Survie', i: '❤️', c: '#ff6a6a' }, { n: 'Puissance', i: '⚔️', c: '#ffb43c' }, { n: 'Lanterne', i: '🏮', c: '#ffe08a' }, { n: 'Fortune', i: '💰', c: '#7ae09a' }, { n: 'Maîtrise', i: '🔮', c: '#c9a0ff' }];
  B.TALENTS = T.map(a => ({ id: a[0], br: a[1], tier: a[2], n: a[3], i: a[4], d: a[5], max: a[6], st: a[7], flag: a[8] || null }));
  B.TALENT = {}; B.TALENTS.forEach(t => { B.TALENT[t.id] = t; });
  B.talentCost = (t, rank) => Math.round([0, 4, 10, 20, 34, 56][t.tier] * (1 + rank * 0.6));

  // ───────────── BÉNÉDICTIONS (autel) ─────────────
  B.BLESSINGS = [
    { id: 'bl_vig', n: 'Vigueur', i: '❤️', d: 'Vie max +15 %', st: { hp_pct: 0.15 } },
    { id: 'bl_str', n: 'Force', i: '💪', d: 'Dégâts +10 %', st: { dmg: 0.1 } },
    { id: 'bl_swift', n: 'Célérité', i: '👟', d: 'Vitesse +10 %', st: { spd: 0.1 } },
    { id: 'bl_wis', n: 'Sagesse', i: '📖', d: 'Expérience +12 %', st: { xp: 0.12 } },
    { id: 'bl_fort', n: 'Fortune', i: '💰', d: 'Braises gagnées +20 %', flag: 'braise20' },
    { id: 'bl_light', n: 'Lumière', i: '🕯️', d: 'Lanterne +20 %', st: { light: 0.2 } },
    { id: 'bl_luck', n: 'Chance', i: '🍀', d: 'Chance +15', st: { luck: 0.15 } },
    { id: 'bl_dawn', n: 'Aube', i: '🌅', d: 'Capacité spéciale −20 %', st: { spCharge: 0.2 } },
    { id: 'bl_arsenal', n: 'Arsenal', i: '🗡️', d: 'Commence avec une arme aléatoire', flag: 'blWeapon' },
    { id: 'bl_iron', n: 'Fer', i: '🛡️', d: 'Armure +3', st: { armor: 3 } },
    { id: 'bl_phoenix', n: 'Phénix', i: '🐦‍🔥', d: 'Une résurrection', st: { revive: 1 } },
    { id: 'bl_star', n: 'Étoile', i: '⭐', d: 'Le premier choix de pouvoir est épique ou mieux', flag: 'blStar' }
  ];

  // ───────────── POTIONS (jardin) ─────────────
  B.POTIONS = [
    { id: 'po_heal', n: 'Potion de soin', i: '🧪', d: 'Rend 45 % de la vie.', cost: { herbe: 3, braise: 40 } },
    { id: 'po_rage', n: 'Élixir de rage', i: '🔴', d: 'Dégâts +30 % pendant le prochain combat.', cost: { herbe: 4, braise: 80 } },
    { id: 'po_iron', n: 'Tonique de fer', i: '⚙️', d: 'Armure +6 pendant le prochain combat.', cost: { herbe: 4, braise: 80 } },
    { id: 'po_wis', n: 'Infusion de sagesse', i: '📗', d: 'Expérience +60 % pendant le prochain combat.', cost: { herbe: 5, braise: 120 } },
    { id: 'po_light', n: 'Huile de lumière', i: '🕯️', d: 'Lanterne +50 % pendant le prochain combat.', cost: { herbe: 5, braise: 120 } },
    { id: 'po_luck', n: 'Philtre de chance', i: '🍀', d: 'Le prochain choix de pouvoir contient une carte épique ou mieux.', cost: { herbe: 7, braise: 200 } }
  ];

  // ───────────── ÉQUIPEMENT ─────────────
  B.ITEM_BASES = {
    weapon: ['Épée', 'Hache', 'Arc', 'Bâton', 'Dague', 'Marteau', 'Lance', 'Fléau'],
    armor: ['Tunique', 'Cotte', 'Manteau', 'Cuirasse', 'Robe', 'Brigandine'],
    jewel: ['Anneau', 'Amulette', 'Broche', 'Talisman', 'Pendentif', 'Bracelet']
  };
  B.SLOT_ICON = { weapon: '🗡️', armor: '🛡️', jewel: '💍' };
  B.SLOT_NAME = { weapon: 'Arme', armor: 'Armure', jewel: 'Bijou' };
  // affixes : [stat, min, max, libellé]
  B.AFFIX = {
    weapon: [['dmg', 0.03, 0.07, 'Dégâts +{v} %'], ['crit', 0.01, 0.03, 'Critique +{v} %'], ['critd', 0.06, 0.14, 'Dégâts critiques +{v} %'], ['cd', 0.02, 0.045, 'Recharge −{v} %'], ['elite', 0.04, 0.09, 'Contre élites/boss +{v} %'], ['area', 0.03, 0.07, 'Zone +{v} %'], ['pspd', 0.05, 0.12, 'Vitesse des projectiles +{v} %'], ['dur', 0.04, 0.09, 'Durée +{v} %']],
    armor: [['hp_pct', 0.03, 0.08, 'Vie max +{v} %'], ['armor', 1, 2.5, 'Armure +{v}'], ['regen', 0.1, 0.3, 'Régénération +{v}/s'], ['dodge', 0.01, 0.025, 'Esquive +{v} %'], ['thorns', 3, 9, 'Épines +{v}'], ['healPow', 0.05, 0.12, 'Soins +{v} %'], ['hp', 8, 20, 'Vie max +{v}']],
    jewel: [['luck', 0.03, 0.08, 'Chance +{v}'], ['xp', 0.03, 0.07, 'Expérience +{v} %'], ['pick', 0.08, 0.18, 'Ramassage +{v} %'], ['light', 0.04, 0.1, 'Lanterne +{v} %'], ['gold', 0.04, 0.1, 'Or +{v} %'], ['spd', 0.02, 0.045, 'Vitesse +{v} %'], ['cd', 0.015, 0.035, 'Recharge −{v} %'], ['spCharge', 0.03, 0.07, 'Capacité spéciale −{v} %']]
  };
  B.UNIQUES = [
    { id: 'u_dusk', slot: 'weapon', n: 'Lame du Crépuscule', d: 'Les critiques ont 20 % de chance d\'exploser.', flag: 'critBoom' },
    { id: 'u_dawnbow', slot: 'weapon', n: 'Arc de l\'Aube', d: '+1 projectile.', st: { n: 1 } },
    { id: 'u_inferno', slot: 'weapon', n: 'Cœur de Forge', d: 'Tous vos coups enflamment.', flag: 'allBurn' },
    { id: 'u_frost', slot: 'weapon', n: 'Croc du Givre', d: 'Les ennemis gelés volent en éclats.', flag: 'shatter', st: { iceDmg: 0.1 } },
    { id: 'u_storm', slot: 'weapon', n: 'Sceptre de l\'Orage', d: 'La foudre frappe 3 ennemis toutes les 2,5 s.', flag: 'skyBolt' },
    { id: 'u_venom', slot: 'weapon', n: 'Dard de la Reine', d: 'Les ennemis empoisonnés subissent +20 % de dégâts.', flag: 'weaken', st: { poisonPow: 0.2 } },
    { id: 'u_phoenix', slot: 'armor', n: 'Manteau du Phénix', d: 'Une résurrection de plus.', st: { revive: 1 } },
    { id: 'u_thorn', slot: 'armor', n: 'Cotte de Ronces', d: 'Épines +35.', st: { thorns: 35 } },
    { id: 'u_aegis', slot: 'armor', n: 'Égide du Veilleur', d: 'Bloque un coup toutes les 10 s.', st: { aegis: 3 } },
    { id: 'u_vamp', slot: 'armor', n: 'Cuirasse Écarlate', d: 'Vol de vie +1,2 %.', st: { lifesteal: 0.012 } },
    { id: 'u_bloom', slot: 'armor', n: 'Robe de Floraison', d: 'Soins doublés, vie max +25 %.', flag: 'bloom' },
    { id: 'u_lantern', slot: 'jewel', n: 'Œil du Phare', d: 'Lanterne +30 %. Ennemis éclairés : +15 % de dégâts reçus.', flag: 'radiant', st: { light: 0.3 } },
    { id: 'u_clover', slot: 'jewel', n: 'Trèfle d\'Or', d: 'Chance +35.', st: { luck: 0.35 } },
    { id: 'u_echo', slot: 'jewel', n: 'Cloche d\'Écho', d: 'Toutes les 8 s, vos armes tirent deux fois.', flag: 'echo' },
    { id: 'u_reaper', slot: 'jewel', n: 'Sablier du Faucheur', d: 'Achève les ennemis (hors boss) sous 12 % de vie.', flag: 'execute' },
    { id: 'u_hour', slot: 'jewel', n: 'Sablier d\'Argent', d: 'Recharge −15 %.', st: { cd: 0.15 } }
  ];

  // ───────────── MALÉDICTIONS (pactes) ─────────────
  B.CURSES = {
    c_frail: { n: 'Fragilité', d: 'Vie max −15 %', st: { hp_pct: -0.15 } },
    c_slow: { n: 'Lourdeur', d: 'Vitesse −10 %', st: { spd: -0.1 } },
    c_dark: { n: 'Pénombre', d: 'Lanterne −20 %', st: { light: -0.2 } },
    c_weak: { n: 'Faiblesse', d: 'Dégâts −8 %', st: { dmg: -0.08 } },
    c_blind: { n: 'Malchance', d: 'Chance −20', st: { luck: -0.2 } }
  };

  // ───────────── ÉVÉNEMENTS MYSTÈRES ─────────────
  // Chaque option : t (texte), d (effet affiché), f(R) → texte du résultat (R = expédition en cours)
  B.EVENTS = [
    { id: 'demon', n: 'Pacte démoniaque', i: '😈', d: 'Une silhouette cornue sort de la brume. « Un pouvoir légendaire… contre un petit morceau de toi. »',
      o: [{ t: 'Accepter le pacte', d: 'Pouvoir légendaire + malédiction', f: (R) => { R.flag('pact'); R.curse(R.rng.pick(['c_frail', 'c_slow', 'c_dark', 'c_weak'])); R.offer({ minRar: 3 }); return 'Le démon ricane. Une marque brûlante apparaît sur votre bras.'; } },
        { t: 'Exiger un autre prix', d: 'Perdre 25 % de vie, pouvoir épique', f: (R) => { R.hurt(0.25); R.offer({ minRar: 2 }); return '« Soit. Ta douleur me suffira. »'; } },
        { t: 'Le chasser avec la lanterne', d: 'Rien… ou un combat', f: (R) => { if (R.rng() < 0.5) { R.fight('ambush'); return 'Il hurle et appelle ses serviteurs !'; } return 'Il se dissout en fumée noire.'; } }] },
    { id: 'chest', n: 'Coffre piégé', i: '🧰', d: 'Un coffre richement décoré, posé au milieu de nulle part. Trop beau pour être vrai ?',
      o: [{ t: 'L\'ouvrir', d: '60 % : trésor · 40 % : mimique', f: (R) => { if (R.rng() < 0.6) { R.gold(25 + R.biome * 15); R.item(1); return 'Il était vrai ! De l\'or et un bel objet.'; } R.fight('mimic'); return 'Le coffre ouvre une gueule pleine de dents !'; } },
        { t: 'Le crocheter prudemment', d: 'Perdre 10 % de vie, or assuré', f: (R) => { R.hurt(0.1); R.gold(20 + R.biome * 12); return 'Une aiguille empoisonnée vous pique, mais le coffre s\'ouvre.'; } },
        { t: 'Passer son chemin', d: 'Rien', f: () => 'Mieux vaut prudence que dents.' }] },
    { id: 'traveler', n: 'Voyageur étrange', i: '🧙', d: 'Un vieil homme au chapeau trop grand vous tend une main gantée. « Échange ? »',
      o: [{ t: 'Échanger 30 or', d: 'Un pouvoir rare ou mieux', need: { gold: 30 }, f: (R) => { R.gold(-30); R.offer({ minRar: 1 }); return '« Bon choix. Enfin, je crois. »'; } },
        { t: 'Échanger de la vie', d: 'Vie max −10, améliore un pouvoir', f: (R) => { R.maxHp(-10); const n = R.upgradeRandom(); return n ? n + ' devient plus fort.' : 'Il n\'y avait rien à améliorer…'; } },
        { t: 'Refuser poliment', d: 'Il vous donne quand même quelque chose', f: (R) => { R.gold(8); return 'Il vous lance une pièce en riant.'; } }] },
    { id: 'fountain', n: 'Fontaine lumineuse', i: '⛲', d: 'Une eau claire qui brille doucement, intacte malgré la brume.',
      o: [{ t: 'Boire', d: 'Soigne 35 %', f: (R) => { R.heal(0.35); return 'Une chaleur douce vous envahit.'; } },
        { t: 'Remplir sa lanterne', d: 'Lanterne +12 % pour l\'expédition', f: (R) => { R.stat('light', 0.12); return 'Votre flamme brille plus fort.'; } },
        { t: 'Jeter une pièce', d: '10 or : un souhait…', need: { gold: 10 }, f: (R) => { R.gold(-10); if (R.rng() < 0.4) { R.offer({ minRar: 2 }); return 'La fontaine exauce votre vœu !'; } R.heal(0.15); return 'Un petit soin. C\'est déjà ça.'; } }] },
    { id: 'wounded', n: 'Survivant blessé', i: '🤕', d: 'Quelqu\'un gémit sous des branches. Il a besoin d\'aide, mais la brume approche.',
      o: [{ t: 'Le soigner', d: 'Perdre 15 % de vie, il rejoint le village', f: (R) => { R.hurt(0.15); const s = R.survivor(); return s ? s + ' vous remercie et part vers le village !' : 'Il se relève, vous remercie et vous donne de l\'or.'; } },
        { t: 'Lui laisser des provisions', d: 'Perdre 15 or, gagner des herbes', f: (R) => { R.gold(-15); R.res('herbe', 4); return 'Il vous indique un coin d\'herbes rares.'; } }] },
    { id: 'dice', n: 'Joueur de dés', i: '🎲', d: 'Une créature masquée agite des dés en os. « Pair ou impair ? »',
      o: [{ t: 'Parier 20 or', d: '50 % : gagner 50 or', need: { gold: 20 }, f: (R) => { R.gold(-20); if (R.rng() < 0.5) { R.gold(50); return 'Gagné ! Il grogne.'; } return 'Perdu. Il ricane.'; } },
        { t: 'Parier sa vie', d: '50 % : pouvoir épique · sinon −25 % vie', f: (R) => { if (R.rng() < 0.5) { R.offer({ minRar: 2 }); return 'Les dés vous sourient.'; } R.hurt(0.25); return 'Les dés sont cruels.'; } },
        { t: 'Partir', d: 'Rien', f: () => 'Il range ses dés, déçu.' }] },
    { id: 'shrine', n: 'Autel oublié', i: '🗿', d: 'Une statue couverte de mousse. Des offrandes anciennes l\'entourent.',
      o: [{ t: 'Prier', d: 'Soigne 15 %, chance +5', f: (R) => { R.heal(0.15); R.stat('luck', 0.05); return 'Une paix étrange descend sur vous.'; } },
        { t: 'Prendre les offrandes', d: '40 or… mais malchance', f: (R) => { R.gold(40); R.curse('c_blind'); return 'La statue semble vous regarder partir.'; } }] },
    { id: 'mirror', n: 'Miroir de brume', i: '🪞', d: 'Votre reflet vous sourit. Il a l\'air plus fort que vous.',
      o: [{ t: 'Toucher le miroir', d: 'Améliore 2 pouvoirs, −20 % vie', f: (R) => { R.hurt(0.2); const a = R.upgradeRandom(), b = R.upgradeRandom(); return 'Votre reflet vous rend un peu de sa force. (' + [a, b].filter(Boolean).join(', ') + ')'; } },
        { t: 'Briser le miroir', d: 'Combat… puis pouvoir rare', f: (R) => { R.fight('ambush'); R.offer({ minRar: 1, after: 1 }); return 'Les éclats prennent vie !'; } },
        { t: 'Détourner les yeux', d: 'Rien', f: () => 'Sage décision.' }] },
    { id: 'library', n: 'Bibliothèque en ruine', i: '📚', d: 'Des livres moisis… mais certains brillent encore d\'une encre magique.',
      o: [{ t: 'Étudier', d: 'Un pouvoir au choix', f: (R) => { R.offer({}); return 'Vous déchiffrez une formule ancienne.'; } },
        { t: 'Emporter les livres', d: 'Essences +' , f: (R) => { R.res('essence', 3 + R.biome * 2); return 'Mère Odile va adorer.'; } }] },
    { id: 'mushroom', n: 'Champignon étrange', i: '🍄', d: 'Un champignon géant pulse d\'une lumière violette. Il sent… bon ?',
      o: [{ t: 'Le manger', d: '50 % : vie max +20 · 50 % : poison', f: (R) => { if (R.rng() < 0.5) { R.maxHp(20); return 'Délicieux ! Vous vous sentez plus robuste.'; } R.hurt(0.2); return 'Beurk. Vous êtes malade.'; } },
        { t: 'Le cueillir', d: 'Herbes +5', f: (R) => { R.res('herbe', 5); return 'Pip en fera quelque chose.'; } }] },
    { id: 'cartographer', n: 'Carte oubliée', i: '🗺️', d: 'Une carte griffonnée est clouée à un arbre. Elle montre les chemins devant vous.',
      o: [{ t: 'La lire', d: 'Révèle les salles mystère + or', f: (R) => { R.reveal(); R.gold(10); return 'Vous voyez mieux ce qui vous attend.'; } }] },
    { id: 'well', n: 'Puits sans fond', i: '🕳️', d: 'On n\'entend pas le fond. Une voix murmure : « Donne… »',
      o: [{ t: 'Donner 30 or', d: 'Récompense inconnue', need: { gold: 30 }, f: (R) => { R.gold(-30); const r = R.rng(); if (r < 0.35) { R.item(2); return 'Un objet remonte du puits !'; } if (r < 0.7) { R.offer({ minRar: 1 }); return 'Une lumière jaillit.'; } R.res('aube', 1); return 'Un Éclat d\'Aube flotte jusqu\'à vous !'; } },
        { t: 'Crier dans le puits', d: 'Hmm…', f: (R) => { if (R.rng() < 0.5) { R.fight('ambush'); return 'Quelque chose remonte. Vite.'; } return 'L\'écho vous répond. Rien d\'autre.'; } }] },
    { id: 'spirit', n: 'Esprit errant', i: '👻', d: 'Un esprit triste flotte en rond. « J\'ai perdu ma lanterne… »',
      o: [{ t: 'Partager votre lumière', d: 'Lanterne −10 %, pouvoir rare', f: (R) => { R.stat('light', -0.1); R.offer({ minRar: 1 }); return 'L\'esprit s\'illumine et vous offre un souvenir.'; } },
        { t: 'Le guider', d: 'Expérience', f: (R) => { R.xp(0.6); return 'Il vous murmure des secrets en partant.'; } }] },
    { id: 'beast', n: 'Bête blessée', i: '🦌', d: 'Un jeune cerf, la patte prise dans un piège rouillé.',
      o: [{ t: 'Le libérer', d: 'Compagnon : expérience +', f: (R) => { R.compXp(40); R.heal(0.1); return 'Il s\'enfuit. Votre compagnon semble fier de vous.'; } },
        { t: 'Prendre le piège', d: 'Arme « Pièges à braises »', f: (R) => { const n = R.give('w_mine'); return n ? 'Vous apprenez à fabriquer des pièges.' : 'Vous connaissez déjà ce piège. Il vous rapporte de l\'or.'; } }] },
    { id: 'merchantghost', n: 'Marchand fantôme', i: '🧛', d: '« Mes prix sont… mortels. » Il ouvre un manteau plein de fioles.',
      o: [{ t: 'Acheter une fiole (25 or)', d: 'Soigne 60 %', need: { gold: 25 }, f: (R) => { R.gold(-25); R.heal(0.6); return 'Ça a un goût de cendre et de menthe.'; } },
        { t: 'Vendre un souvenir', d: 'Perdre un passif au hasard, +60 or', f: (R) => { const n = R.removePassive(); if (n) { R.gold(60); return 'Vous lui cédez ' + n + '.'; } return 'Vous n\'avez rien qui l\'intéresse.'; } },
        { t: 'Partir', d: 'Rien', f: () => 'Il disparaît en riant.' }] },
    { id: 'altar_blood', n: 'Autel de sang', i: '🩸', d: 'Une pierre noire suinte. Elle réclame un sacrifice.',
      o: [{ t: 'Sacrifier 30 % de vie', d: 'Dégâts +10 % pour l\'expédition', f: (R) => { R.hurt(0.3); R.stat('dmg', 0.1); return 'La pierre boit. Vous vous sentez féroce.'; } },
        { t: 'Sacrifier vie max', d: 'Vie max −20, chance de critique +6 %', f: (R) => { R.maxHp(-20); R.stat('crit', 0.06); return 'Votre regard devient plus perçant.'; } },
        { t: 'S\'éloigner', d: 'Rien', f: () => 'Elle gronde dans votre dos.' }] },
    { id: 'campers', n: 'Campement abandonné', i: '⛺', d: 'Un feu à peine éteint. Des sacs abandonnés à la hâte.',
      o: [{ t: 'Fouiller', d: 'Or et objets', f: (R) => { R.gold(15 + R.biome * 8); if (R.rng() < 0.35) R.item(0); return 'Vous trouvez quelques affaires utiles.'; } },
        { t: 'Se reposer', d: 'Soigne 25 %', f: (R) => { R.heal(0.25); return 'Quelques minutes de calme.'; } }] },
    { id: 'statue', n: 'Statue du héros', i: '🗽', d: 'La statue d\'un ancien Porteur de Lanterne. Une inscription : « Que ta flamme guide. »',
      o: [{ t: 'Saluer', d: 'Capacité spéciale chargée, soin 10 %', f: (R) => { R.spFull(); R.heal(0.1); return 'Vous sentez une présence bienveillante.'; } },
        { t: 'Lire l\'inscription', d: 'Une page d\'histoire', f: (R) => { R.lore(); return 'Une page de plus dans l\'encyclopédie.'; } }] }
  ];

  B.EVENTS.push(
    { id: 'forge_ghost', n: 'Forge abandonnée', i: '⚒️', d: 'Une enclume encore tiède au milieu des ruines. Quelqu\'un y travaillait il y a peu.',
      o: [{ t: 'Forger (20 or)', d: 'Améliore un pouvoir de 2 niveaux', need: { gold: 20 }, f: (R) => { R.gold(-20); const a = R.upgradeRandom(), b = R.upgradeRandom(); return 'Le métal chante sous le marteau. (' + [a, b].filter(Boolean).join(', ') + ')'; } },
        { t: 'Récupérer le métal', d: 'Bois-de-lune +6', f: (R) => { R.res('bois', 6); return 'Brann sera content.'; } }] },
    { id: 'lost_child', n: 'Enfant perdu', i: '🧒', d: 'Un enfant pleure, accroché à une lanterne éteinte.',
      o: [{ t: 'Rallumer sa lanterne', d: 'Lanterne −5 %, chance +10', f: (R) => { R.stat('light', -0.05); R.stat('luck', 0.1); return 'Il sourit et vous offre un trèfle à quatre feuilles.'; } },
        { t: 'Le ramener au village', d: 'Survivant… ou or', f: (R) => { const s = R.survivor(); return s ? s + ' rejoint le village grâce à vous !' : 'Ses parents vous récompensent.'; } }] },
    { id: 'gambler', n: 'Roue de la fortune', i: '🎡', d: 'Une roue grince dans la brume. Elle est couverte de symboles.',
      o: [{ t: 'Faire tourner (15 or)', d: 'Récompense au hasard', need: { gold: 15 }, f: (R) => { R.gold(-15); const r = R.rng(); if (r < 0.25) { R.offer({ minRar: 2 }); return 'Jackpot ! Un pouvoir épique.'; } if (r < 0.55) { R.gold(35); return 'Vous gagnez 35 or.'; } if (r < 0.8) { R.heal(0.4); return 'Une douce lumière vous soigne.'; } R.hurt(0.15); return 'Perdu ! La roue vous mord.'; } },
        { t: 'Passer', d: 'Rien', f: () => 'La roue tourne seule derrière vous…' }] },
    { id: 'ancient_tree', n: 'Arbre ancien', i: '🌳', d: 'Un arbre gigantesque, aux racines lumineuses. Il semble respirer.',
      o: [{ t: 'Méditer à ses pieds', d: 'Expérience (presque un niveau)', f: (R) => { const n = R.xp(0.9); return n ? 'Vous gagnez un niveau !' : 'Vous vous sentez plus sage.'; } },
        { t: 'Cueillir ses fruits', d: 'Vie max +12, herbes +3', f: (R) => { R.maxHp(12); R.res('herbe', 3); return 'Juteux et sucrés.'; } }] },
    { id: 'cursed_idol', n: 'Idole maudite', i: '🗿', d: 'Une idole aux yeux de rubis. Elle chuchote des promesses.',
      o: [{ t: 'Arracher les rubis', d: '+70 or, malédiction', f: (R) => { R.gold(70); R.curse(R.rng.pick(['c_frail', 'c_weak', 'c_dark'])); return 'Les yeux s\'éteignent. Quelque chose vous suit.'; } },
        { t: 'Briser l\'idole', d: 'Combat, puis pouvoir rare', f: (R) => { R.fight('ambush'); R.offer({ minRar: 1, after: 1 }); return 'Les gardiens de l\'idole se réveillent !'; } },
        { t: 'S\'éloigner', d: 'Rien', f: () => 'Les chuchotements faiblissent.' }] },
    { id: 'hot_spring', n: 'Source chaude', i: '♨️', d: 'Une eau fumante qui sent le soufre et la menthe.',
      o: [{ t: 'Se baigner', d: 'Soigne 50 %', f: (R) => { R.heal(0.5); return 'Vos muscles se détendent enfin.'; } },
        { t: 'Remplir une fiole', d: 'Une potion de soin', f: (R) => { R.potion('po_heal'); return 'Une fiole de plus dans la besace.'; } }] }
  );

  // ───────────── BRUME PROFONDE (20 niveaux) ─────────────
  B.DEEP = [
    { d: 'Ennemis +15 % de vie', m: { hpMul: 1.15 } },
    { d: 'Une élite surprise dans les combats', m: { moreElites: 1 } },
    { d: 'Ennemis +10 % de dégâts', m: { dmgMul: 1.1 } },
    { d: 'Moins de pain sur les monstres', m: { noHealDrops: 1 } },
    { d: 'Ennemis +8 % de vitesse', m: { spdMul: 1.08 } },
    { d: 'Boss plus agressifs', m: { bossFast: 1 } },
    { d: 'Ennemis +20 % de vie', m: { hpMul: 1.2 } },
    { d: 'Brume toxique : la vie baisse doucement', m: { toxicFog: 1 } },
    { d: 'Marchands +25 % plus chers', m: { priceMul: 1.25 } },
    { d: 'Lanterne −15 %', m: { lightMul: 0.85 } },
    { d: 'Élites +30 % de vie', m: { eliteHp: 1.3 } },
    { d: 'Ennemis +15 % de dégâts', m: { dmgMul: 1.15 } },
    { d: 'Plus d\'ennemis', m: { spawnMul: 1.2 } },
    { d: 'Vie de départ −15 %', m: { startHp: 0.85 } },
    { d: 'Ennemis +25 % de vie', m: { hpMul: 1.25 } },
    { d: 'Ennemis +8 % de vitesse', m: { spdMul: 1.08 } },
    { d: 'Feux de camp moins efficaces', m: { campMul: 0.5 } },
    { d: 'Ennemis +20 % de dégâts', m: { dmgMul: 1.2 } },
    { d: 'Ennemis +20 % de vie', m: { hpMul: 1.2 } },
    { d: 'Brume absolue : lanterne −20 %', m: { lightMul: 0.8, hpMul: 1.1 } }
  ];
  B.deepMods = function (lvl) {
    const m = { hpMul: 1, dmgMul: 1, spdMul: 1, lightMul: 1 };
    for (let i = 0; i < lvl && i < B.DEEP.length; i++) for (const k in B.DEEP[i].m) { const v = B.DEEP[i].m[k]; if (k === 'hpMul' || k === 'dmgMul' || k === 'spdMul' || k === 'lightMul' || k === 'priceMul' || k === 'eliteHp' || k === 'spawnMul' || k === 'startHp' || k === 'campMul') m[k] = (m[k] || 1) * v; else m[k] = v; }
    return m;
  };

  // ───────────── DÉFIS ─────────────
  B.RULES = [
    { id: 'glass', n: 'Canon de verre', i: '💥', d: 'Vos dégâts ×2, votre vie ×0,5', m: { dmgOut: 2 }, st: { hp_pct: -0.5 } },
    { id: 'horde', n: 'La Horde', i: '👹', d: 'Ennemis ×1,6, expérience +30 %', m: { spawnMul: 1.6, xpMul: 1.3 } },
    { id: 'night', n: 'Nuit noire', i: '🌑', d: 'Lanterne −40 %', m: { lightMul: 0.6 } },
    { id: 'rush', n: 'Précipitation', i: '💨', d: 'Ennemis +30 % de vitesse, vous +20 %', m: { spdMul: 1.3 }, st: { spd: 0.2 } },
    { id: 'elites', n: 'Élites partout', i: '💀', d: 'Une élite surprise dans chaque combat', m: { moreElites: 1 } },
    { id: 'nohe', n: 'Sans soins', i: '🚫', d: 'Pas de pain ni de feux de camp', m: { noHealDrops: 1, noCamp: 1 } },
    { id: 'chaos', n: 'Chaos', i: '🎲', d: 'Les pouvoirs sont choisis au hasard', m: { autoPick: 1 } },
    { id: 'arsenal', n: 'Arsenal', i: '🗡️', d: 'Commencez avec 3 armes au hasard', m: { arsenal: 3 } },
    { id: 'rich', n: 'Ruée vers l\'or', i: '🪙', d: 'Or ×3, marchands partout', m: { goldMul: 3, moreShops: 1 } },
    { id: 'short', n: 'Expédition éclair', i: '⏩', d: 'Carte plus courte, combats plus durs', m: { shortMap: 1, hpMul: 1.3 } },
    { id: 'giant', n: 'Géants', i: '🦣', d: 'Ennemis plus gros, plus lents, +50 % de vie', m: { hpMul: 1.5, spdMul: 0.85 } },
    { id: 'tiny', n: 'Fourmilière', i: '🐜', d: 'Ennemis −40 % de vie mais bien plus nombreux', m: { hpMul: 0.6, spawnMul: 1.9 } }
  ];

  // ───────────── LANTERNES (cosmétiques, Éclats d'Aube) ─────────────
  B.LANTERNS = [
    { id: 'ember', n: 'Braise', c: '#ffd36a', g: '#ff9a40', cost: 0 },
    { id: 'moon', n: 'Lune bleue', c: '#a8d8ff', g: '#5ab0ff', cost: 3 },
    { id: 'jade', n: 'Émeraude', c: '#a8ffc8', g: '#40e08a', cost: 3 },
    { id: 'amethyst', n: 'Améthyste', c: '#e0b0ff', g: '#b060ff', cost: 4 },
    { id: 'ruby', n: 'Rubis', c: '#ff9aa8', g: '#ff3a5a', cost: 5 },
    { id: 'dawn', n: 'Aube dorée', c: '#fff6c0', g: '#ffd040', cost: 8 },
    { id: 'ghost', n: 'Flamme spectrale', c: '#d0fff8', g: '#60ffe0', cost: 10 }
  ];

  // ───────────── HISTOIRE ─────────────
  B.LORE = [
    { id: 'l_start', n: 'La nuit de la Brume', t: 'Personne ne sait d\'où elle est venue. Un soir d\'automne, une brume grise est descendue des montagnes et n\'est jamais repartie. Ceux qu\'elle touchait oubliaient leur nom, puis leur visage, puis devenaient autre chose.' },
    { id: 'l_lantern', n: 'Les Porteurs de Lanterne', t: 'Seule la flamme des anciennes lanternes du Fanal repousse la brume. Leurs porteurs étaient autrefois des gardiens de phare. Aujourd\'hui, ils sont les derniers à oser sortir.' },
    { id: 'l_village', n: 'Le dernier village', t: 'Autour du Grand Fanal, une poignée de maisons a tenu bon. Chaque survivant ramené rallume une fenêtre. Chaque fenêtre repousse la brume d\'un pas.' },
    { id: 'l_forest', n: 'La Forêt Sombre', t: 'La forêt était le jardin du royaume. La Mère-Racine y veillait sur chaque arbre. La brume a trouvé ses racines en premier, et ce qu\'elle protégeait est devenu ce qui chasse.' },
    { id: 'l_swamp', n: 'Le Marais Putride', t: 'Les tourbières gardent tout : les corps, les secrets, les promesses. L\'Hydre y dort depuis avant le royaume. La brume l\'a réveillée en lui murmurant qu\'elle avait faim.' },
    { id: 'l_ruins', n: 'Le Royaume englouti', t: 'Valdor, la cité aux mille colonnes, a sombré en une seule nuit. Sa grande bibliothèque contenait, dit-on, la recette de la brume elle-même. La Liche Archiviste la garde toujours.' },
    { id: 'l_peaks', n: 'Les Cimes Gelées', t: 'Au sommet du monde, le Wyrm de Givre couvait le froid pour que les étés ne brûlent pas tout. Sans lui, la brume aurait gelé. Avec lui, elle a appris le froid.' },
    { id: 'l_heart', n: 'Le Cœur de la Brume', t: 'Là où la brume est la plus épaisse, on entend un battement. Lent. Patient. Les anciens disaient qu\'un roi, refusant de mourir, avait offert son ombre à la nuit.' },
    { id: 'l_knight', n: 'Le Chevalier Creux', t: 'Le capitaine de la garde de Valdor a juré de protéger son roi pour l\'éternité. Il a tenu parole. Son armure marche encore, vide, devant la porte du Cœur.' },
    { id: 'l_end', n: 'L\'aube', t: 'La Brume Incarnée s\'est dissipée dans un dernier soupir. Pour la première fois depuis des années, le soleil a touché le Fanal. Mais la brume n\'oublie jamais. Plus loin, plus profond, elle attend.' },
    { id: 'l_deep', n: 'La Brume Profonde', t: 'Orion l\'a vue dans ses lunettes : sous la brume, une autre brume, plus épaisse, plus froide. Ceux qui y descendent reviennent changés, couverts d\'éclats d\'aube.' },
    { id: 'l_aube', n: 'Les Éclats d\'Aube', t: 'Quand une grande créature de la brume meurt, elle laisse parfois un éclat de lumière pure. Les forgerons d\'autrefois en faisaient des armes mythiques.' },
    { id: 'l_heroes', n: 'Les compagnons d\'armes', t: 'Maëlle la chasseresse, Borin le forgeron, Isolde l\'alchimiste, Kael l\'ombre, Séraphine la prêtresse, Ossian le lieur d\'âmes, Rune la tempêtière : chacun a perdu quelque chose dans la brume. Chacun a une raison de revenir.' },
    { id: 'l_pets', n: 'Les bêtes fidèles', t: 'La brume transforme les bêtes sauvages, mais pas toutes. Certaines choisissent la lumière. Tilda dit que ce sont elles qui nous choisissent, pas l\'inverse.' },
    { id: 'l_statue', n: 'Le premier Porteur', t: 'Avant le village, avant le Fanal, une femme a marché dans la brume avec une simple bougie. Elle est revenue avec trente personnes. Son nom est effacé de la statue, mais sa flamme brûle dans chaque lanterne.' }
  ];

  // ───────────── SUCCÈS (≥ 60) ─────────────
  // test(P) : P = profil ; rw : récompense
  const A = [];
  const ach = (id, n, d, i, test, rw) => A.push({ id: id, n: n, d: d, i: i, test: test, rw: rw || { aube: 1 } });
  ach('a_tuto', 'Première lueur', 'Terminer la première expédition.', '🕯️', P => P.st.runs >= 1, { braise: 100 });
  [[100, 'Chasseur de brume'], [1000, 'Fléau des ombres'], [5000, 'Exterminateur'], [20000, 'Légende vivante'], [100000, 'Celui qui ne s\'arrête pas']].forEach(([n, t], i) => ach('a_kill' + i, t, 'Vaincre ' + B.fmt(n) + ' monstres.', '⚔️', P => P.st.kills >= n, i < 2 ? { braise: 200 * (i + 1) } : { aube: i }));
  ['g_stag', 'b_root', 'g_toad', 'b_hydra', 'g_golem', 'b_lich', 'g_yeti', 'b_wyrm', 'g_knight', 'b_mist'].forEach((id, i) => ach('a_' + id, 'Tombeur : ' + B.MONSTERS[id].n, 'Vaincre ' + B.MONSTERS[id].n + '.', i % 2 ? '👑' : '🛡️', P => (P.bossKills[id] || 0) > 0, { aube: i % 2 ? 2 : 1 }));
  [[2, 'Recruteur'], [4, 'Capitaine'], [8, 'La compagnie au complet']].forEach(([n, t], i) => ach('a_hero' + i, t, 'Débloquer ' + n + ' héros.', '🧑‍🤝‍🧑', P => Object.keys(P.heroes).length >= n));
  B.HEROES.forEach(h => ach('a_win_' + h.id, 'Victoire : ' + h.n, 'Vaincre la Brume Incarnée avec ' + h.n + '.', '🏆', P => P.heroWins && P.heroWins[h.id] > 0, { aube: 2 }));
  [[4, 'Sauveteur'], [8, 'Bon samaritain'], [16, 'Le village renaît']].forEach(([n, t], i) => ach('a_surv' + i, t, 'Sauver ' + n + ' survivants.', '🙋', P => Object.keys(P.survivors).length >= n));
  [[3, 'Petite flamme'], [6, 'Feu de joie'], [10, 'Phare du monde']].forEach(([n, t], i) => ach('a_fanal' + i, t, 'Grand Fanal niveau ' + n + '.', '🗼', P => P.bld.fanal >= n));
  [[1, 'Alchimie des pouvoirs'], [6, 'Collectionneur d\'évolutions'], [18, 'Toutes les évolutions']].forEach(([n, t], i) => ach('a_evo' + i, t, 'Découvrir ' + n + ' évolution(s).', '🌟', P => Object.keys(P.evos).length >= n));
  [[20, 'Aguerri'], [30, 'Vétéran'], [40, 'Surpuissant']].forEach(([n, t], i) => ach('a_lvl' + i, t, 'Atteindre le niveau ' + n + ' dans une expédition.', '📈', P => P.st.bestLvl >= n));
  [[50, 'Briseur d\'élites'], [250, 'Fléau des champions']].forEach(([n, t], i) => ach('a_elite' + i, t, 'Vaincre ' + n + ' élites.', '💀', P => P.st.elites >= n));
  ach('a_leg', 'Lueur dorée', 'Trouver un objet légendaire.', '🟧', P => P.st.legendary >= 1);
  ach('a_myth', 'Forgé dans l\'aube', 'Transmuter un objet mythique.', '🟥', P => P.st.mythic >= 1, { aube: 2 });
  [1, 5, 10, 20].forEach((n, i) => ach('a_deep' + i, 'Brume Profonde ' + n, 'Vaincre le boss final en Brume Profonde ' + n + '.', '🌫️', P => P.st.deepWon >= n, { aube: [2, 3, 4, 6][i] }));
  [[300, 'Endurant'], [600, 'Increvable'], [1200, 'Éternel']].forEach(([n, t], i) => ach('a_end' + i, t, 'Survivre ' + n / 60 + ' minutes en mode Infini.', '♾️', P => P.st.endlessBest >= n, { aube: i + 1 }));
  [[1, 'Sous les étoiles'], [10, 'Astrologue']].forEach(([n, t], i) => ach('a_chal' + i, t, 'Réussir ' + n + ' défi(s).', '⭐', P => P.st.challenges >= n, { aube: i + 1 }));
  ach('a_nohit', 'Intouchable', 'Gagner un combat sans être touché.', '🍃', P => P.st.noHit >= 1);
  ach('a_pact', 'Marché du diable', 'Accepter un pacte démoniaque.', '😈', P => P.st.pacts >= 1);
  ach('a_rich', 'Trésorier', 'Gagner 50 000 braises au total.', '🔥', P => P.st.braiseTotal >= 50000, { aube: 2 });
  ach('a_best', 'Bestiaire complet', 'Rencontrer tous les monstres et boss.', '📕', P => Object.keys(P.seen).length >= Object.keys(B.MONSTERS).length, { aube: 3 });
  ach('a_pow', 'Encyclopédiste', 'Découvrir tous les pouvoirs.', '📘', P => Object.keys(P.powersSeen).length >= Object.keys(B.POWERS).length, { aube: 3 });
  [[30, 'Studieux'], [65, 'Savant']].forEach(([n, t], i) => ach('a_tal' + i, t, 'Acheter ' + n + ' niveaux de talents.', '🎓', P => P.st.talentRanks >= n, { aube: i + 1 }));
  ach('a_comp', 'Meilleur ami', 'Un compagnon au niveau 10.', '🐾', P => Object.values(P.comps).some(c => c.lvl >= 10), { aube: 2 });
  ach('a_plus10', 'Chef-d\'œuvre', 'Améliorer un objet à +10.', '⚒️', P => P.st.maxUpgrade >= 10, { aube: 2 });
  ach('a_runs', 'Habitué de la brume', 'Partir 50 fois en expédition.', '🧭', P => P.st.runs >= 50, { aube: 2 });
  ach('a_gold', 'Bourse pleine', 'Avoir 300 pièces d\'or pendant une expédition.', '🪙', P => P.st.maxGold >= 300);
  ach('a_quests', 'Serviable', 'Terminer 15 quêtes de survivants.', '📜', P => P.st.quests >= 15, { aube: 2 });
  ach('a_lore', 'Historien', 'Débloquer toutes les pages d\'histoire.', '📖', P => Object.keys(P.lore).length >= B.LORE.length, { aube: 2 });
  ach('a_fast', 'Éclair', 'Vaincre un boss final en moins de 60 secondes.', '⏱️', P => P.st.fastBoss >= 1);
  B.ACHIEVEMENTS = A;

  B.TIPS = [
    'Votre héros attaque tout seul : concentrez-vous sur l\'esquive !',
    'Une arme au niveau 5 + le bon passif = une évolution légendaire.',
    'Rassemblez 2, 4 ou 6 pouvoirs du même élément pour des bonus d\'ensemble.',
    'Les zones rouges au sol annoncent une attaque : sortez-en vite.',
    'Les élites lâchent des coffres : ils contiennent des pouvoirs gratuits.',
    'Sauvez les survivants : chacun apporte quelque chose au village.',
    'Le bouton de capacité spéciale brille quand il est prêt.',
    'Les yeux qui brillent dans la brume… ce sont des monstres.',
    'Au feu de camp, vous pouvez vous soigner ou renforcer un pouvoir.',
    'Le Grand Fanal fait reculer la brume autour du village.',
    'Même en cas de défaite, vous gardez une partie des ressources.',
    'Les marchands acceptent l\'or trouvé pendant l\'expédition.',
    'Les événements mystères peuvent rapporter gros… ou coûter cher.',
    'Les compagnons gagnent de l\'expérience à chaque expédition.'
  ];
})(this.B || (this.B = {}));
