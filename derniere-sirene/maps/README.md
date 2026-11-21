# Carte de Metz

© Les contributeurs d’OpenStreetMap. L’extrait dérivé [metz.json](metz.json) est distribué sous [Open Data Commons Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/). [Attribution OpenStreetMap](https://www.openstreetmap.org/copyright)

Le fichier contient les données utilisées par le jeu. Les coordonnées, contours bâtis et tronçons sont projetés sur une carte locale de 97 × 78 cellules. Les chemins utilisés pour la simulation sont simplifiés tandis que le dessin des rues conserve la géométrie des sources.

Pour reconstruire l’extrait, récupérer séparément les quatre zones suivantes via [l’API cartographique d’OpenStreetMap](https://wiki.openstreetmap.org/wiki/API_v0.6#Retrieving_map_data_by_bounding_box:_GET_/api/0.6/map).

| Extrait | Emprise ouest, sud, est, nord |
| --- | --- |
| 1 | 6.155,49.104,6.176,49.115 |
| 2 | 6.176,49.104,6.197,49.115 |
| 3 | 6.155,49.115,6.176,49.126 |
| 4 | 6.176,49.115,6.197,49.126 |

Utiliser la réponse JSON de `/api/0.6/map.json?bbox=…`. Dans le dossier du jeu, lancer `node tools/import-metz.mjs extrait-1.json extrait-2.json extrait-3.json extrait-4.json`, puis reconstruire le bundle depuis `source`. La carte fonctionne hors ligne depuis le bundle distribué.
