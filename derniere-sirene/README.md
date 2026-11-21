# Dernière Sirène

[Jouer sur GitHub Pages](https://kyllox57300-web.github.io/Teste-de-jeux-/derniere-sirene/)

Ouvrez **Contenir un foyer**, puis **Metz · Les Îles et la Moselle** pour commander l’évacuation de 2 300 civils sur une carte d’environ trois kilomètres de large. Les navettes partent toutes les douze secondes des refuges occupés. Évacuez au moins 690 civils et éliminez les infectés. Quand la ville est assainie, vous pouvez continuer l’évacuation ou valider le bilan une fois le quota atteint.

Les trois autres secteurs de **Confinement** comptent de 410 à 820 habitants. Un foyer unique se propage en capturant des civils. Les bâtiments bloquent les tirs directs. La caméra démarre près de la verticale et le bouton **3D** permet de revenir au relief.

La **Campagne** propose douze missions, des renforts à débloquer et un récit jusqu’à l’estuaire. Les brèches secondaires des dernières missions imposent de défendre plusieurs axes.

## Jouer

- Pendant la préparation, placez des défenses sur les rues. Les défenses retirées sont remboursées. Tracez des couloirs vers les zones sûres pour attirer les civils loin des infectés.
- Sélectionnez **Zone sûre**, puis **Main levée**. Tracez le contour sur la carte et relâchez pour le fermer. Le mode rectangle reste accessible en désactivant **Main levée**. L’aperçu affiche le prix et la capacité, qui dépend des rues et espaces accessibles dans la zone.
- Utilisez **Ceinturer** pour construire un mur continu sur le contour, ou choisissez **Mur** pour tirer une ligne à la main. Les points verts indiquent où les rues traversent le mur. Avec **Porte**, touchez l’un de ces points pour laisser entrer les civils. Une ouverture devient accessible aux infectés quand ils brisent le mur ou la porte. Les murs et portes se posent pendant la préparation.
- Après « Prêt », appelez des renforts, tracez de nouveaux couloirs ou faites exploser les charges posées. Les tirs et les explosions attirent certains infectés. Une frappe qui touche des civils réduit le score.
- Sélectionnez **Ordres** ou appuyez sur **M**. Choisissez des soldats, un sniper ou un lance-flammes, puis une rue vide. L’escouade rejoint sa nouvelle position par les rues et reprend le tir à l’arrivée.
- À Metz, vous pouvez ouvrir un **Refuge avancé** en cours de mission. Touchez le compteur **Infectés** pour recentrer la caméra sur la horde ou chercher les derniers groupes.
- Sur ordinateur, cliquez pour placer, glissez pour déplacer la caméra, utilisez le clic droit pour la tourner et la molette pour zoomer. Les touches 1 à 6 sélectionnent les renforts. Les touches 7, 8 et 9 sélectionnent les explosifs, le couloir et la pause. Échap ouvre le menu de pause.
- Sur téléphone, touchez les rues pour placer, faites glisser pour déplacer la caméra et pincez pour zoomer. Pour déplacer la caméra en mode tracé, glissez avec deux doigts. Les boutons à côté de la minicarte permettent de tourner et de recentrer la vue.
- La progression, les records de confinement, les compétences, les succès et les villes créées restent dans le navigateur. Exportez une sauvegarde JSON depuis les paramètres pour la transférer vers un autre appareil.

Après un premier chargement complet du site, le jeu peut être rouvert hors ligne dans le même navigateur. Pour une copie locale, conservez ensemble `index.html`, `style.css`, `game.js` et `signal.png`, puis ouvrez `index.html` dans un navigateur compatible WebGL 2. Three.js est livré dans `game.js`. Les décors et les sons sont générés par le jeu.

## Développement

Depuis le dossier `source`, lancez `npm ci` puis `npm run build`. Pour servir le dépôt localement, lancez `node ../tools/serve.mjs` et ouvrez l’adresse affichée.

`npm test` simule la campagne, les opérations spéciales et la survie. `npm run qa` vérifie une partie dans Chromium sur bureau et écran tactile, puis écrit les captures dans `captures`. Au besoin, renseignez le chemin de Chromium dans la variable `SIRENE_CHROME`.

Three.js est distribué sous licence MIT. Son avis de licence figure dans le bundle.

La géographie de Metz provient des contributeurs d’OpenStreetMap. Le réseau de déplacement est simplifié pour le jeu. Les personnages, le foyer et l’évacuation sont fictifs. [Source et licence des données](maps/README.md)
