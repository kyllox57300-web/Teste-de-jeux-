# Brumeterre — plan de conception

Roguelite d'action en portrait, jouable à un pouce. Canvas 2D dessiné en code (aucune image externe),
sons et musiques générés en direct (Web Audio). PWA : marche hors ligne et s'installe sur l'écran d'accueil.

## Boucle
Village → choix héros/équipement/compagnon/bénédiction → carte du biome (12 rangées à embranchements)
→ combats de 35 à 70 s (attaque auto, joystick pour esquiver) → montée de niveau = 1 pouvoir sur 3
→ gardien (rangée 6) → boss (rangée 12) → retour au village (100 % des ressources si victoire, 50 % + talents si mort).
Une expédition dure 10 à 15 min. Battre le boss d'un biome débloque le suivant.

## Biomes (5) — 8 monstres + 2 boss chacun
| Biome | Ambiance | Gardien | Boss |
|---|---|---|---|
| Forêt Sombre | verts, lucioles | Cerf Pourri (charges, bois en étoile) | Mère-Racine (racines sous le joueur, spores) |
| Marais Putride | violets/verts, bulles | Crapaud-Roi (sauts, langue, flaques) | Hydre des Tourbières (3 têtes, plongées) |
| Ruines Englouties | pierre bleue, runes | Golem de Ruine (onde de choc, rochers) | Liche Archiviste (spirales, téléportation) |
| Cimes Gelées | bleu glacier, neige | Yéti Hurleur (blocs, cri qui ralentit) | Wyrm de Givre (souffle en cône, pics de glace) |
| Cœur de la Brume | noir et rouge braise | Chevalier Creux (fentes, vagues d'épée) | La Brume Incarnée (3 phases, la lumière rétrécit) |
Comportements de monstres : poursuivant, essaim, tank, chargeur, tireur, tireur en étoile, kamikaze,
qui se divise, invocateur, téléporteur, fouisseur, soigneur/bouclier, sauteur, laisse une traînée.
Élites = monstre plus gros avec un affixe (rapide, blindé, vampire, explosif, gelé…).

## Héros (8)
Aldric (équilibré, éclats de lumière / Flamboiement), Maëlle (flèches perçantes / Pluie de flèches),
Borin (marteau en arc, tank / Séisme), Isolde (fioles de poison / Grand Chaudron), Kael (dagues, critiques /
Pas de l'Ombre), Séraphine (orbes sacrés, soins / Sanctuaire), Ossian (âmes invoquées / Armée des Âmes),
Rune (foudre en chaîne / Orage). Débloqués à la taverne (prix croissants + conditions de progression).

## Pouvoirs (≥ 80)
- 28 armes (dont les 8 de départ), niveaux 1 à 5 : projectiles, orbites, auras, frappes, chaînes, arcs,
  flaques, boomerangs, rayons, novas, invocations, pièges.
- 36 passifs (statistiques et déclencheurs : à l'élimination, au coup reçu, toutes les X s…), niveaux 1 à 5.
- 18 évolutions légendaires : arme niveau 5 + passif précis → pouvoir fusionné (bien affiché sur les cartes).
- Éléments (Feu, Glace, Foudre, Poison, Lumière, Ombre, Nature, Arcane) : 2/4/6 pouvoirs d'un même
  élément donnent un bonus d'ensemble. Les cartes montrent la rareté, l'élément et « Synergie ! ».
- Garde-fous d'équilibrage : bonus multiplicatifs plafonnés, rendement décroissant sur réduction de recharge,
  critiques et esquive plafonnés, les évolutions ne cumulent pas avec elles-mêmes.

## Équipement
Arme / Armure / Bijou. Raretés : commun (1 ligne), rare (2), épique (3), légendaire (3 + effet unique),
mythique (4 + effet unique renforcé, uniquement par transmutation à la forge avec des Éclats d'Aube).
La forge améliore (+1 à +10), recycle en matériaux, et transmute.

## Compagnons (8)
Luciole, Renardeau, Hibou, Salamandre, Corbeau, Tortue, Chat spectral, Dragonnet. Ils gagnent de l'expérience
et débloquent 3 pouvoirs chacun (écurie).

## Village
Grand Fanal (niveau du village, repousse la brume), Forge, Académie (65 talents en 5 branches), Taverne,
Autel (bénédictions de départ), Jardin (potions), Écurie, Observatoire (défis, Brume Profonde, mode infini),
et une maison par survivant sauvé (16 survivants nommés, avec dialogues et quêtes).
Les bâtiments clés sont débloqués en sauvant leur artisan (au début, presque chaque partie débloque un truc).

## Ressources
En expédition : Or (marchands, événements ; le reste devient des Braises). Permanentes : Braises (monnaie),
Bois-de-lune (construction), Essences (talents, héros), Herbes (potions), Éclats d'Aube (rare : boss en
Brume Profonde, défis, succès → cosmétiques, transmutation mythique, jamais de puissance brute écrasante).

## Après la fin
Brume Profonde 1 à 20 (une contrainte de plus à chaque niveau), mode Infini (record de survie),
défis du jour et de la semaine (graine fixe + règles spéciales), 60 succès, encyclopédie (bestiaire,
pouvoirs, héros, objets, histoire).

## Rythme visé
Biome 1 battu vers la 3e-5e partie, biome 5 vers la 60e-80e partie (≈ 15-20 h). Vérifié par `tools/sim.js`.
