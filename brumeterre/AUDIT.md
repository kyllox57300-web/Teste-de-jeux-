# Brumeterre — audit et révision (24/11/2026)

Copie de la version d'avant : `versions/brumeterre-v1.0.zip` (et le commit 9386996 dans l'historique Git).
Méthode : robots qui jouent dans un vrai navigateur (format iPhone 13), captures d'écran, 18 joueurs simulés
avec le vrai moteur (`tools/sim.js`), mesure des dégâts de chaque arme, relecture du code.

✅ = corrigé dans cette révision · ⏳ = reste à faire

## 1. Bugs et plantages
1. ✅ **Fermer l'appli en plein combat faisait garder les niveaux gagnés** pendant ce combat, alors que le combat
   recommençait (on pouvait « farmer »). L'état est maintenant copié avant chaque combat et restauré.
2. ✅ **Un choix de pouvoir en cours était perdu** si l'appli se fermait à ce moment-là (la file d'attente retirait la carte trop tôt).
3. ✅ **Deux fenêtres (niveau + coffre) pouvaient s'ouvrir en même temps** : évolution prise deux fois, combat qui reprenait derrière (corrigé juste avant la révision, revérifié).
4. ✅ **« Révèle les salles mystère »** (Fenwick, Hibou niveau 8, carte oubliée) n'avait aucun effet : l'événement exact s'affiche maintenant sur la carte.
5. ✅ Mode Infini : plantage au lancement et ressources non comptées (corrigé juste avant la révision, revérifié).
6. ✅ Vérifié sans erreur : sauvegarde v1.0 chargée dans la nouvelle version (ressources, talents, héros, objets, expédition en cours), mode hors ligne, reprise après rechargement, événement → mimique → carte, tous les monstres et boss simulés 40 s.

## 2. Sensations de jeu
1. ✅ Les coups manquaient d'impact : monstres qui « s'écrasent » quand on les touche, silhouette blanche qui éclate à leur mort, micro-pause (hitstop) sur les gros coups, les élites et les boss.
2. ✅ Être touché se sentait peu : flash rouge en plus du tremblement.
3. ✅ La montée de niveau passait inaperçue : cercle doré, pluie d'étincelles, « NIVEAU ! » au-dessus du héros.
4. ✅ Aucune récompense aux grosses séries : annonces « Carnage ! », « Massacre ! », « Apocalypse ! » avec son et vibration.
5. ✅ Le héros semblait passif : la lanterne s'illumine à chaque tir, poussière sous les pas, traînées derrière les flèches et dagues.
6. ✅ Capacité spéciale prête : petit carillon, vibration et anneau autour du héros.

## 3. Équilibrage
1. ✅ **Gardien des Cimes (Yéti)** : 59 échecs pour 15 victoires → sauts plus petits et mieux annoncés, cri moins paralysant, moins de vie.
2. ✅ **Crapaud-Roi plus dur que l'Hydre** (le boss du même biome) → inversé.
3. ✅ **Chevalier Creux et Brume Incarnée** : combats de 2 min 30 à 9 min → moins de vie ; après 2 min 30 tous les boss entrent en « FUREUR » (plus rapides) pour qu'aucun combat ne s'éternise.
4. ✅ Écarts de puissance entre armes (Fioles ×2,2 la moyenne, Orbes ×0,57) → rapprochées (corrigé juste avant la révision).
5. ✅ Poison qui s'empilait trop fort.
6. ⏳ La chance pèse beaucoup : selon les parties simulées, la victoire finale arrive entre la ~50e et la ~150e expédition.

## 4. Rythme et envie de rejouer
1. ✅ Les combats d'un même biome se ressemblaient → **8 particularités de salle** (Pleine lune, Ruée vers l'or, Horde, Orage, Brume épaisse, Lune de sang, Coffres cachés, Faille), visibles sur la carte.
2. ✅ Un clic obligatoire après chaque combat → l'écran de victoire passe tout seul (ou d'un tap).
3. ✅ « Rejouer » renvoyait à l'écran de préparation → relance directe ; « Changer » et « Village » à côté.
4. ✅ Rien ne faisait revenir chaque jour → **cadeau du jour** avec série de 7 jours (Éclat d'Aube au 7e).
5. ✅ Les niveaux de héros donnaient peu → **paliers de maîtrise** (niv. 3, 6, 10).
6. ✅ Défaite décourageante → message d'encouragement + conseil ; « Prochain objectif » cliquable vers le village.

## 5. Graphismes et animations
1. ✅ Écran titre vide → un Porteur de Lanterne sur sa colline, lanterne qui se balance.
2. ✅ Fond de carte gris uni → sol et arbres du biome.
3. ✅ Position sur la carte peu claire → lanterne animée sur la salle actuelle.
4. ✅ Gains sans animation → nombres qui défilent, confettis à la victoire, à la construction et au recrutement.
5. ✅ Boutons principaux : reflet qui passe régulièrement.

## 6. Interface et menus
1. ✅ Bouton « Améliorer » des bâtiments : texte et prix coupés → titre sur une ligne, prix en dessous.
2. ✅ Forge peu claire → encadré « Comment ça marche » + **comparaison avec l'objet équipé** (▲ vert / ▼ rouge).
3. ✅ Jardin confus (il fallait toucher le texte pour emporter une potion) → boutons « Préparer » et « Emporter ».
4. ✅ Symboles de la carte non expliqués → bouton « ? » (légende + particularités).
5. ⏳ La traduction anglaise ne couvre que les menus.

## 7. Son et musique
1. ✅ Silence entre les effets pendant les combats → **ambiance par biome** (vent, oiseaux, bulles et grenouilles, gouttes, blizzard, battement de cœur).
2. ✅ Musiques répétitives → deux mélodies par morceau qui alternent.
3. ✅ Nouveaux sons : séries d'éliminations, capacité prête, cadeau.
4. ⏳ Mixage à vérifier à l'oreille sur un vrai téléphone.

## 8. Performances et batterie
1. ✅ Mesuré : moins de 2 ms de calcul par image avec 125 monstres, 53 à 60 images/s en rendu logiciel (sans carte graphique).
2. ✅ Le fond animé ralentit à 12 images/s quand un menu le recouvre (batterie).

## 9. Contenu
1. ✅ 8 particularités de salle, 6 nouveaux événements (24 au total), paliers de maîtrise des héros, cadeau du jour, 3 nouveaux succès (69 au total).
2. ⏳ Idées pour la suite : apparences de héros (Éclats d'Aube), un 6e biome après la Brume Profonde, boss secrets, mode coopératif local.
