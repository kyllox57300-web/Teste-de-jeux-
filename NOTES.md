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

- `dernier-rempart/` : FPS zombies en 3D (Three.js), un seul fichier `index.html` (~6,5 Mo).
  Code source, modèles et outils dans `dernier-rempart/source/` (`npm install` puis `node tools/build.mjs`,
  copier `dist/DernierRempart-local.html` vers `../index.html`).
  - Fait : 7 zones, 17 armes, atouts, courant à rétablir, mode test, commandes tactiles
    (joystick, visée au doigt, aide à la visée, bouton ACTION qui s'allume), attente en vertical.
  - Démarche des zombies refaite en code (pas besoin de Blender) : dos voûté (il penchait en arrière avant),
    boiterie, petits pas traînants pour les lents, bras tendus / un bras / bras ballants selon le zombie,
    tête penchée avec des à-coups, élan quand ils frappent, recul sous les gros tirs.
    Outil pour filmer la démarche : `source/tools/t/gaitsheet.sh walk|jog|run`.
  - Testé sur téléphone par l'utilisateur : jouable mais plus dur. Le jeu vise surtout le PC
    (clavier + souris) ; le téléphone reste un bonus.
  - Idées : continuer visuels, sons, zombies, armes et carte selon les envies.
  - Plus tard : un vrai « mode téléphone » (aide à la visée plus forte, tir automatique sous le viseur,
    zombies un peu plus lents et moins nombreux).
- `errant/` : aventure dans le désert (le plus gros, ~310 Ko).
- `errant-3d/` : essai d'Errant avec personnages détaillés.
- `croissant/` : L'Empire du Croissant (clicker). Code de sauvegarde pour transférer une partie.
- `bastion-du-fanal/` : tower defense.
- `eclats/` : tir et esquive, améliorations permanentes.
- `singularite/` : jeu « Singularité ».
- `snake/` : snake simple.
- `roue-noel/` : roue du Père Noël secret (outil, pas un jeu).

## À faire

- Rien en attente pour l'instant.
