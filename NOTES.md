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
  - Morts variées (18/11) dans `source/src/deaths.js` : s'écroule (tir à la tête), tombe à genoux puis bascule,
    trébuche en avant, projeté en arrière (gros dégâts), tourne sur lui-même, envolé par une explosion,
    se débat en brûlant, s'assoit s'il est contre un mur. Le corps se pose toujours sur le sol.
    Sons : chute du corps, craquement à la tête, râles différents selon la mort.
    Outil pour filmer : `source/tools/t/deathsheet.sh back,knees,...`.
  - Sang projeté sur les murs derrière un zombie touché (il coule un peu). Tir dans les jambes : le zombie
    plonge sur un genou puis repart.
  - Renversé sans mourir (fusil à pompe de près, explosion, coup de crosse) : il tombe en arrière ou en avant,
    reste au sol un instant puis se relève (`knockB` / `knockF` dans `deaths.js`, test `tools/t/knock.js`).
  - Dehors : éclairs visibles dans le ciel, flaques qui reflètent les lumières (cour et cimetière).
    Ambiance sonore : corbeaux, chien qui hurle au loin, cloche du village, cri lointain, bruit de verre.
  - Bug connu de l'outil de test (déjà là avant) : `tools/t/all.js` finit par une attente trop longue
    de l'écran de fin ; tous les contrôles avant passent.
  - Testé sur téléphone par l'utilisateur : jouable mais plus dur. Le jeu vise surtout le PC
    (clavier + souris) ; le téléphone reste un bonus.
  - Idées : améliorer les armes (sensations de tir, recul, nouvelles armes), détailler la crypte et le cimetière.
  - Plus tard : un vrai « mode téléphone » (aide à la visée plus forte, tir automatique sous le viseur,
    zombies un peu plus lents et moins nombreux).
- `bitcoin-a-la-benne/` : jeu de gestion « vider la décharge », fichier unique `jeu.html` (`index.html` redirige).
  - Refait le 18/11 en monde vu de dessus, tout dessiné en code (canvas) : 7 quartiers de 160 tas (1 à 6 couches),
    séparés par des grillages à portail payant. On touche un tas → Kévin y va (chemin calculé) et le vide couche par couche
    (toucher le tas en cours = coup en plus). Sac → vente chez Josiane (puis camion de livraison automatique).
  - Fait : outil (paliers visibles pelle/pioche/marteau-piqueur/pelle en or), sac, brouette, bottes, lampe (chance),
    pelleteuse (Kévin la conduit), camion, 6 types d'employés visibles (Gégé, stagiaire, ferrailleur, chien, mini-bulldozer,
    robot), détecteur qui bipe (boîtier puis disque), indice « côté de la Fosse », drone, vitrine/collection, marché Bitcoin,
    9 événements à choix (dont camion-benne qui recouvre des tas), 28 quêtes, 27 succès, 5 chapitres + fin, prestige Karma,
    sauvegarde auto + export/import, hors ligne (équipe à 50 %), sons + musique, réglages.
  - Sécurité anti-blocage : si plus aucun tas accessible, la ville livre de nouveaux tas.
  - Équilibrage par robot (`GAME` exposé, mode `headless`) : fin en 52-83 min (robot), ~35 min après prestige.
    Réglages : `QUARTERS` (hp, v, cost), `EMPS`, `LEVELED`, `ONCE`, `SACKS`.
  - À tester sur un vrai téléphone (lisibilité, confort des touchers). Idées : sons plus riches, plus de types de tas.
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
