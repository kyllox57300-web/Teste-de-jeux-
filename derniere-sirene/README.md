# Dernière Sirène

[Jouer sur GitHub Pages](https://kyllox57300-web.github.io/Teste-de-jeux-/derniere-sirene/)

**Villes réelles** ouvre six secteurs indépendants sur des plans OpenStreetMap. Choisissez entre Metz et la Moselle, Strasbourg et la Grande Île, les bassins de Dunkerque, les quais de Bordeaux, la presqu’île de Lyon et Toulouse autour du Pont-Neuf. Les personnages, les foyers et les opérations sont fictifs et se déroulent dans l’univers de Dernière Sirène.

## Prendre le commandement

- Examinez la ville pendant que le temps est arrêté. Placez garnisons, snipers, tourelles, mortiers, mines et C4. Retirer un équipement pendant la préparation rembourse son coût.
- Le plan tactique ouvre sur le quartier. **Vue d’ensemble** cadre toute la ville et **Recentrer** rétablit le cadrage initial. Les outils sont regroupés en bas de l’écran sur ordinateur.
- Tracez les zones sûres à main levée ou en rectangle. Utilisez **Ceinturer** pour suivre le contour et posez des **Portes** aux points verts pour laisser passer les civils. En combat, **Fortifs** permet de vérifier l’intégrité des murs, de fermer les portes et de commander des réparations.
- Dessinez un **Couloir** le long des rues et délimitez une **Zone d’attente** bleue loin du foyer. Les civils proches y restent si l’endroit est sûr. Utilisez **Libérer l’attente** pour qu’ils repartent vers les refuges.
- Appuyez sur **Prêt**. Les civils attrapés rejoignent la horde. Chaque rue récemment infectée reste marquée en violet. La partie se termine à l’élimination du dernier infecté. Chaque personne sauvée rapporte 100 points et chaque victime de tirs alliés coûte 175 points supplémentaires.
- Conservez des crédits pour les renforts. Sur clavier, les touches **1 à 9** sélectionnent les parachutistes, la frappe aérienne, le missile, le gaz, l’hélicoptère, le blindé, le leurre, l’évacuation et l’éblouissement. Appuyez sur **C** pour le C4, **G** pour le couloir, **Z** pour l’attente, **M** pour déplacer les escouades et **I** pour inspecter les fortifications. Espace met la simulation en pause. Le bandeau de vitesse va de ×0,5 à ×4.
- Sur téléphone, touchez pour placer ou appeler un renfort. Glissez pour déplacer la carte et pincez pour zoomer. Avec un outil de tracé, glissez à deux doigts pour déplacer la carte. Réglez **Foule à l’écran** sur Réduite si nécessaire. La population simulée reste la même.
- **Rejouer** réinitialise immédiatement l’opération avec la même difficulté et les mêmes mutateurs. Combinez **Horde renforcée**, **Ponts fragiles**, **Budget réduit** et **Nuit** avant de choisir une ville. Chaque première victoire dans un secteur officiel rapporte un point de compétence.
- La campagne d’origine, les opérations spéciales, le confinement avec navettes, la survie et l’éditeur sont accessibles depuis le commandement. La progression, les réglages, les succès et les villes de l’éditeur sont sauvegardés dans le navigateur. L’export JSON se trouve dans les paramètres.

## Importer un quartier d’OpenStreetMap

1. Ouvrez [Exporter sur OpenStreetMap](https://www.openstreetmap.org/export) et zoomez sur un quartier d’environ 1 à 3 km de large.
2. Dans **Exporter**, utilisez au besoin **Sélectionner manuellement une autre zone**, ajustez le cadre et téléchargez le fichier **map.osm**. Si la zone est refusée, réduisez le cadre et relancez l’export.
3. Ouvrez **Villes réelles**, puis **Importer une carte OSM** et **Choisir le fichier**. Sélectionnez le fichier dans vos téléchargements. Les exports XML .osm ou .xml et les JSON OSM comprenant nœuds et chemins sont pris en charge, jusqu’à 40 Mo.

L’import est traité dans le navigateur et disponible jusqu’à la fermeture ou au rechargement de la page. Les côtes et relations incomplètes d’un export peuvent perdre des détails. Préférez un secteur comportant un réseau de rues connecté.

Après un premier chargement complet du jeu, le menu et Metz sont disponibles hors ligne. Ouvrez les cinq autres villes une première fois avec Internet pour peupler le cache de ce navigateur. Pour servir une copie locale complète, conservez le dossier du jeu avec ses cartes et utilisez le serveur de développement.

## Développement

Depuis le dossier `source`, lancez `npm ci` puis `npm run build`. `node ../tools/serve.mjs` sert le dépôt localement.

`npm test` vérifie la campagne et les six villes réelles avec plusieurs plans, dont un essai sans défense. `npm run qa` vérifie le rendu, les commandes, les réglages et l’import OSM dans Chromium sur bureau et avec un profil tactile. Les captures de la refonte sont dans [captures](captures/). Les variables `SIRENE_CHROME` et `SIRENE_CAPTURES` permettent de choisir le navigateur et le dossier des captures.

La simulation simplifie le réseau des rues sur une grille. Three.js est distribué sous licence MIT. Les cartes dérivées d’OpenStreetMap sont distribuées sous ODbL. [Source et licence des données](maps/README.md)
