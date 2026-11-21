# Dernière Sirène

[Jouer sur GitHub Pages](https://kyllox57300-web.github.io/Teste-de-jeux-/derniere-sirene/)

Douze missions de stratégie en temps réel dans des villes en 3D. Préparez vos défenses puis lancez l’épidémie. Tenez les abris et éliminez tous les infectés. Les brèches secondaires des dernières missions imposent de défendre plusieurs axes.

## Jouer

- Pendant la préparation, placez des défenses sur les rues. Les défenses retirées sont remboursées. Tracez des couloirs vers les zones sûres pour attirer les civils loin des infectés.
- Après « Prêt », appelez des renforts, tracez de nouveaux couloirs ou faites exploser les charges posées. Les tirs et les explosions attirent certains infectés. Une frappe qui touche des civils réduit le score.
- Sur ordinateur, cliquez pour placer, glissez pour déplacer la caméra, utilisez le clic droit pour la tourner et la molette pour zoomer. Les touches 1 à 6 sélectionnent les renforts. Les touches 7, 8 et 9 sélectionnent les explosifs, le couloir et la pause. Échap ouvre le menu de pause.
- Sur téléphone, touchez les rues pour placer, faites glisser pour déplacer la caméra et pincez pour zoomer. Pour déplacer la caméra en mode tracé, glissez avec deux doigts. Les boutons à côté de la minicarte permettent de tourner et de recentrer la vue.
- La progression, les compétences, les succès et les villes créées restent dans le navigateur. Exportez une sauvegarde JSON depuis les paramètres pour la transférer vers un autre appareil.

Après un premier chargement complet du site, le jeu peut être rouvert hors ligne dans le même navigateur. Pour une copie locale, conservez ensemble `index.html`, `style.css`, `game.js` et `signal.png`, puis ouvrez `index.html` dans un navigateur compatible WebGL 2. Three.js est livré dans `game.js`. Les décors et les sons sont générés par le jeu.

## Développement

Depuis le dossier `source`, lancez `npm ci` puis `npm run build`. Pour servir le dépôt localement, lancez `node ../tools/serve.mjs` et ouvrez l’adresse affichée.

`npm test` simule la campagne, les opérations spéciales et la survie. `npm run qa` vérifie une partie dans Chromium sur bureau et écran tactile, puis écrit les captures dans `captures`. Au besoin, renseignez le chemin de Chromium dans la variable `SIRENE_CHROME`.

Three.js est distribué sous licence MIT. Son avis de licence figure dans le bundle.
