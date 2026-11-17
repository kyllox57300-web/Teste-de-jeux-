# Dernier Rempart

Jeu de survie à la première personne contre des vagues de zombies, en 3D dans le navigateur (Three.js).
Tout le jeu tient dans un seul fichier : `index.html` (≈ 6,5 Mo, sons et modèles compris).

## Jouer

- **Sur ordinateur** : ouvrir `index.html` dans Chrome, Edge ou Firefox. Clavier + souris.
- **Sur téléphone ou tablette** : ouvrir la page, puis **tenir le téléphone à l'horizontale**.
  Les commandes tactiles apparaissent toutes seules.

### Commandes tactiles

| Geste / bouton | Effet |
|---|---|
| Pouce gauche (n'importe où à gauche) | Joystick : se déplacer. Poussé à fond vers l'avant : sprint |
| Pouce droit (glisser sur la droite de l'écran) | Regarder autour |
| **TIR** | Tirer. On peut aussi glisser le doigt dessus pour viser en tirant |
| **VISER** | Épauler. L'arme se cale doucement sur le zombie le plus proche |
| **ACTION** | Acheter, ouvrir une porte, prendre une arme ; maintenir pour réparer une barricade. Le bouton s'allume quand une action est possible. Le texte au centre de l'écran peut aussi être touché |
| ↻ / ⌃ | Recharger / sauter |
| **ARME**, **CROSSE**, grenade | Changer d'arme, coup de crosse, lancer une grenade |
| II (en haut) | Pause |

Si le téléphone est tenu à la verticale, le jeu se met en attente jusqu'à ce qu'on le tourne.

### Commandes clavier / souris

ZQSD ou WASD pour bouger, Maj pour sprinter, Espace pour sauter, souris pour viser, clic gauche pour tirer,
clic droit pour épauler, R recharger, F acheter/réparer, V coup de crosse, G grenade, 1/2/3 ou molette
pour changer d'arme, L lampe, Échap pause.

## Code source

Le dossier `source/` contient le code (`source/src/`), les modèles et textures (`source/assets/`)
et les outils de construction.

```bash
cd dernier-rempart/source
npm install
node tools/build.mjs
cp dist/DernierRempart-local.html ../index.html
```

`tools/t/` contient les scripts de test automatiques (Playwright). Les fichiers bruts d'origine des
modèles (`assets/raw/`, utilisés seulement par `tools/prep*.mjs`) ne sont pas inclus : les modèles
déjà préparés suffisent pour construire le jeu.
