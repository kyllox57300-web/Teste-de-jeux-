# Cartes OpenStreetMap

© Les contributeurs d’OpenStreetMap. Les six extraits dérivés sont distribués sous [Open Data Commons Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/). [Attribution OpenStreetMap](https://www.openstreetmap.org/copyright)

Les fichiers conservent les contours et tronçons projetés en coordonnées locales, avec une grille simplifiée pour la simulation. Les routes, parcs, plans d’eau et empreintes proviennent des données cartographiques. Les zones jouables et points de départ sont choisis pour chaque mission. Extraits de novembre 2026.

| Fichier | Emprise ouest, sud, est, nord |
| --- | --- |
| [Metz](metz.json) | 6.155,49.104,6.197,49.126 |
| [Strasbourg](strasbourg.json) | 7.727,48.575,7.756,48.590 |
| [Dunkerque](dunkerque.json) | 2.356,51.025,2.391,51.045 |
| [Bordeaux](bordeaux.json) | -0.588,44.835,-0.555,44.854 |
| [Lyon](lyon.json) | 4.814,45.747,4.845,45.771 |
| [Toulouse](toulouse.json) | 1.424,43.588,1.456,43.608 |

Pour reconstruire une carte, divisez son emprise au milieu de la longitude et de la latitude. Téléchargez le sud-ouest, le sud-est, le nord-ouest puis le nord-est à partir du point d’accès `/api/0.6/map.json?bbox=ouest,sud,est,nord` sur `api.openstreetmap.org`. [Documentation de l’API OpenStreetMap](https://wiki.openstreetmap.org/wiki/API_v0.6#Retrieving_map_data_by_bounding_box:_GET_/api/0.6/map)

Pour Metz, depuis le dossier du jeu, lancez `node tools/import-metz.mjs extrait-0.json extrait-1.json extrait-2.json extrait-3.json`, puis reconstruisez le bundle. Pour les autres villes, placez les fichiers dans le dossier temporaire système en utilisant les noms `sirene-area-<ville>-0.json` à `sirene-area-<ville>-3.json`. Dans le dossier du jeu, lancez `node tools/import-atlas.mjs <ville>`, par exemple `node tools/import-atlas.mjs toulouse`.
