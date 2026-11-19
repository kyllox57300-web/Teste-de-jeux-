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
- `bitcoin-a-la-benne/` : passé en **3D** le 18-19/11 (Three.js, low poly). `jeu.html` = version 3D (fichier unique,
  marche hors ligne). Ancienne version 2D gardée : `jeu-2d.html` (lien sur la page d'accueil).
  - Source : `source/` (`npm install`, puis `node tools/build.mjs` → écrit `../jeu.html`). Fichiers : `data.js` (données),
    `core.js` (toute la logique, sans affichage), `render.js` (3D), `models.js` (modèles en code), `ui.js`, `main.js`, `audio.js`.
  - Simulation d'équilibrage : `node tools/sim.mjs 2 3` (robot qui joue avec le vrai moteur) → fin en ~60-80 min.
  - Fait : 7 quartiers (588 tas à couches, qui rétrécissent, déchets 3D qui s'envolent), objets à ramasser (56 + rareté
    qui brille, rayon de lumière pour les légendaires), gros objets à porter / pousser / lancer (télé, frigo, machine, moto,
    statue, coffre-fort), contenants à fouiller (poubelle, valise, armoire, coffre de voiture), coffre-fort avec mini-jeu,
    objets cassés + mini-jeu de réparation, outils (pelle 4 paliers, détecteur + trésors enfouis, aimant, aspirateur,
    grue, pelleteuse, drone), camion, 6 employés animés, arbre de compétences (4 branches × 7, ultimes : Séisme, Hercule,
    Loup de la Benne, MacGyver + robot R0B0), XP/niveaux, album avec bonus de séries, commande de Josiane, combo, bonus de
    nuit, cycle jour/nuit (7 min), lampadaires, mouettes, mouches, fumée, vue 3e / 1re personne, ZQSD + souris,
    qualité basse/moyenne/haute/auto (baisse auto si ça rame), sauvegarde/hors ligne/export/prestige.
  - 19/11 : personnages et accessoires refaits plus détaillés (`source/src/chars.js`) : visages, mains, coudes et genoux
    animés, vêtements (capuche, ceinture, baskets…), outils, brouette, chien, gros objets et contenants arrondis.
    Robot employé = modèle animé CC0 « RobotExpressive » (Quaternius, via le dépôt three.js) dans `source/assets/`.
    Kenney / OpenGameArt / Quaternius restent inaccessibles depuis l'environnement (seul GitHub l'est).
  - 19/11 (suite) : vrais modèles 3D gratuits (CC0) trouvés sur GitHub et intégrés (`source/src/kaykit.js`) :
    personnages animés KayKit (Kévin = capuche bleue, Josiane, Gégé, stagiaire, ferrailleuse ; 12 animations gardées),
    camion et moto de Kenney. Les anciens personnages dessinés en code restent en secours. Jeu ≈ 3,3 Mo.
    Banc d'essai des poses : `npx esbuild tools/bench-entry.js --bundle --loader:.glb=binary`.
  - 19/11 (fin) : décor et déchets avec des objets gratuits KayKit (ville, meubles, restaurant, Halloween ; CC0) :
    cartons, caisses, sacs, frigo, chaises, livres, pots… dans les tas, épaves de voitures, lampadaires, sapins d'automne,
    arbres morts, buissons, bennes, ville au bout de la route. Conversion : `node tools/props.mjs` (liste dans
    `tools/props-list.json`, packs clonés dans /home/user/kaykit-game-assets) → `assets/props.bin`, chargé par `src/props.js`.
    Plus de triangles qu'avant (+5 à +20 % selon la vue) : surveiller la fluidité sur téléphone.
  - Bug corrigé (19/11) : Kévin restait bloqué en mode « pousser » un gros objet si le trajet vers Josiane était
    coupé (autre ordre, tas qui réapparaît) → il ne répondait plus. Maintenant il reprend la route ou Josiane rachète
    l'objet directement. Test : scratchpad push.js (pousse + coupure + chemin bloqué).
  - 19/11 : 5 nouveaux gros objets (micro-ondes, lampadaire, fauteuil, commode, canapé ; modèles KayKit) → 11 dans la
    série « Gros objets ». Josiane applaudit à chaque vente, Kévin fouille les contenants avec les mains et lance (ultime Hercule).
  - 19/11 : météo (core.js `WEATHERS`, render.js `updateWeather`, audio `ambience`) : pluie (chance +30 %, équipe −15 %),
    brouillard (prix +15 %), coups de vent (objets qui s'envolent vers Kévin). Toutes les 2 à 4 min, dure 70 à 120 s.
  - À tester sur un vrai téléphone (fluidité, taille des boutons, facilité à toucher les objets au sol).
  - Idées : sons plus riches, boutique de karma (refusée pour l'instant par l'utilisateur), objets à ramasser en modèles 3D.
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
