# Notes de suivi

Où on en est, jeu par jeu. Mis à jour à la fin de chaque séance.

## Général

- Site : https://kyllox57300-web.github.io/Teste-de-jeux-/ (page d'accueil `index.html` qui liste les jeux).
- Dépôt public, GitHub Pages activé sur `main` / racine.
- Accès réseau pour les installations activé dans les réglages Claude (outils de test possibles).
- Les jeux viennent d'anciens artefacts Claude (importés le 17/11/2026). Ceux qui utilisaient la
  sauvegarde cloud des artefacts (`window.claude`) retombent sur la sauvegarde locale du navigateur
  sur GitHub Pages : ça marche, mais la partie reste sur l'appareil.
- Quand on ajoute un jeu : créer son dossier et ajouter un lien dans `index.html`.

## Jeux

- `errant/` : aventure dans le désert (le plus gros, ~310 Ko).
- `errant-3d/` : essai d'Errant avec personnages détaillés.
- `croissant/` : L'Empire du Croissant (clicker). Code de sauvegarde pour transférer une partie.
- `bastion-du-fanal/` : tower defense.
- `eclats/` : tir et esquive, améliorations permanentes.
- `singularite/` : jeu « Singularité ».
- `snake/` : snake simple.
- `roue-noel/` : roue du Père Noël secret (outil, pas un jeu).

## À faire

- **Dernier Rempart** pas encore importé : l'artefact fait plus de 4 Mo, trop gros pour être
  récupéré depuis une session cloud. À importer depuis le PC (Claude Code) ou à alléger.
