// Brumeterre — textes courts (FR par défaut, EN partiel)
(function (B) {
  'use strict';
  Object.assign(B.STR.fr, { esquive: 'Esquive !', bloque: 'Bloqué !', bouclier: 'Bouclier !', renait: 'Renaissance !', sauve: 'Sauvé !', enrage: 'ENRAGÉ !', lumiere_faiblit: 'Votre lumière faiblit…' });
  Object.assign(B.STR.en, { esquive: 'Dodge!', bloque: 'Blocked!', bouclier: 'Shield!', renait: 'Reborn!', sauve: 'Rescued!', enrage: 'ENRAGED!', lumiere_faiblit: 'Your light is fading…' });
})(this.B || (this.B = {}));

// Traduction anglaise des menus : remplace les textes affichés (les noms de pouvoirs et de monstres restent en français)
(function (B) {
  'use strict';
  const EN = {
    'Continuer l\'expédition': 'Continue expedition', 'Jouer': 'Play', 'Nouvelle partie': 'New game', 'Paramètres': 'Settings', 'Crédits': 'Credits',
    'Porteurs de Lanterne': 'Lantern Bearers', 'Héros': 'Heroes', 'Inventaire': 'Inventory', 'Expédition': 'Expedition', 'Défis': 'Challenges', 'Encyclo.': 'Encyclo.',
    'Encyclopédie': 'Encyclopedia', 'Succès': 'Achievements', 'Pause': 'Pause', 'Reprendre': 'Resume', 'Voir mes pouvoirs': 'My powers', 'Abandonner': 'Give up',
    'Mes pouvoirs': 'My powers', 'Fermer': 'Close', 'Continuer': 'Continue', 'Rejouer': 'Play again', 'Retour au village': 'Back to village', 'Nouveautés': 'New',
    'La brume recule': 'The mist recedes', 'Gardien vaincu !': 'Guardian defeated!', 'Victoire !': 'Victory!', 'La brume vous a eu…': 'The mist got you…',
    'Feu de camp': 'Campfire', 'Se reposer': 'Rest', 'S\'entraîner': 'Train', 'Marchand': 'Merchant', 'Continuer la route': 'Move on', 'Trésor !': 'Treasure!', 'Prendre': 'Take',
    'Nouveau pouvoir': 'New power', 'Choisissez un pouvoir': 'Choose a power', 'Relancer': 'Reroll', 'Bannir': 'Banish', 'Sons': 'Sounds', 'Musique': 'Music', 'Vibrations': 'Vibration',
    'Tremblements d\'écran': 'Screen shake', 'Chiffres de dégâts': 'Damage numbers', 'Capacité spéciale automatique': 'Auto special ability', 'Qualité graphique': 'Graphics quality',
    'Joystick': 'Joystick', 'Main': 'Hand', 'Langue': 'Language', 'Auto': 'Auto', 'Basse': 'Low', 'Moyenne': 'Medium', 'Haute': 'High', 'Flottant': 'Floating', 'Fixe': 'Fixed',
    'Droite': 'Right', 'Gauche': 'Left', 'Exporter': 'Export', 'Importer': 'Import', 'Effacer la sauvegarde': 'Delete save', 'Oui': 'Yes', 'Non': 'No', 'OK': 'OK', 'Annuler': 'Cancel',
    'Confirmer': 'Confirm', 'Destination': 'Destination', 'Compagnon': 'Companion', 'Équipement': 'Equipment', 'Aucune': 'None', 'Aucun': 'None', 'Équipé': 'Equipped', 'Sac': 'Bag',
    'Tout': 'All', 'Armes': 'Weapons', 'Armures': 'Armors', 'Bijoux': 'Jewels', 'Équiper': 'Equip', 'Retirer': 'Unequip', 'Recycler': 'Salvage', 'Bestiaire': 'Bestiary', 'Pouvoirs': 'Powers',
    'Objets': 'Items', 'Histoire': 'Lore', 'Biomes': 'Biomes', 'Passifs': 'Passives', 'Évolutions': 'Evolutions', 'Statistiques': 'Stats', 'Synergies': 'Synergies', 'Quête': 'Quest',
    'Réclamer': 'Claim', 'Au revoir': 'Goodbye', 'Emmener': 'Take along', 'Choisi': 'Selected', 'Engager': 'Hire', 'Relever le défi': 'Take the challenge', 'Lancer le mode Infini': 'Start Endless mode',
    'Défi du jour': 'Daily challenge', 'Défi de la semaine': 'Weekly challenge', 'Mode Infini': 'Endless mode', 'Brume Profonde': 'Deep Mist', 'Le village': 'The village',
    'Expéditions': 'Expeditions', 'Victoires': 'Wins', 'Monstres vaincus': 'Monsters slain', 'Élites vaincues': 'Elites slain', 'Meilleur niveau': 'Best level', 'Survivants sauvés': 'Survivors rescued',
    'Braises gagnées': 'Embers earned', 'Talents achetés': 'Talents bought', 'Objets trouvés': 'Items found', 'Record Infini': 'Endless record', 'Brume Profonde vaincue': 'Deep Mist cleared',
    'Défis réussis': 'Challenges won', 'Temps de jeu': 'Play time', 'Compris !': 'Got it!', 'Bienvenue !': 'Welcome!', 'Suite': 'Next', 'Partir dans la brume': 'Into the mist',
    'Touchez un cercle doré pour avancer': 'Tap a golden circle to move on', 'Cadeau du jour': 'Daily gift', 'Merci !': 'Thanks!', 'Préparer': 'Brew', 'Emporter': 'Take along',
    'La carte': 'The map', 'Maîtrise': 'Mastery', 'Héros choisi': 'Hero selected', 'Comment ça marche': 'How it works', 'Carnage !': 'Carnage!', 'Massacre !': 'Massacre!', 'Butin': 'Loot', 'Expédition éclair': 'Blitz expedition', 'Construire': 'Build', 'Niveau maximum': 'Max level'
  };
  const RX = [[/^Niv\. (\d+)$/, 'Lv. $1'], [/^Partir : (.*)$/, 'Go: $1'], [/^Niveau (\d+) !$/, 'Level $1!'], [/^Améliorer niv\. (\d+)/, 'Upgrade to lv. $1']];
  function tr(root) {
    if (B.lang !== 'en' || !root) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n; while ((n = w.nextNode())) {
      const raw = n.nodeValue, t = raw.trim(); if (!t) continue;
      const clean = t.replace(/^[^\wÀ-ÿ'«]+/u, '').trim();
      if (EN[t]) { n.nodeValue = raw.replace(t, EN[t]); continue; }
      if (clean && EN[clean]) { n.nodeValue = raw.replace(clean, EN[clean]); continue; }
      for (const [re, rep] of RX) if (re.test(t)) { n.nodeValue = raw.replace(t, t.replace(re, rep)); break; }
    }
  }
  B.translate = tr;
  if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', () => {
    const mo = new MutationObserver((ms) => { if (B.lang !== 'en') return; for (const m of ms) for (const a of m.addedNodes) if (a.nodeType === 1) tr(a); });
    mo.observe(document.getElementById('app'), { childList: true, subtree: true });
  });
})(this.B || (this.B = {}));
