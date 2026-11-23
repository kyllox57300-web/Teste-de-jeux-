# Brumeterre 🏮

Roguelite d'action jouable à un pouce, en mode portrait.
Une brume maléfique a englouti le monde : partez en expédition avec votre lanterne, combattez, sauvez des survivants
et reconstruisez le village entre deux parties.

## Jouer
- En ligne : https://kyllox57300-web.github.io/Teste-de-jeux-/brumeterre/
- Installer sur le téléphone (comme une appli, plein écran, marche sans internet) :
  - **iPhone (Safari)** : ouvrir le lien → bouton Partager → « Sur l'écran d'accueil ».
  - **Android (Chrome)** : ouvrir le lien → menu ⋮ → « Installer l'application » (ou « Ajouter à l'écran d'accueil »).
- Les parties sont sauvegardées sur l'appareil (Paramètres → Exporter pour garder une copie).

## Contrôles
- Glisser le pouce n'importe où : déplacer le héros (joystick flottant, ou fixe dans les réglages).
- Le héros attaque tout seul.
- Gros bouton rond : capacité spéciale quand elle brille.
- Clavier (ordinateur) : ZQSD / WASD / flèches, Espace = capacité, Échap = pause.

## Technique
Aucun fichier externe : graphismes dessinés en Canvas 2D, sons et musiques synthétisés avec Web Audio.
Équilibrage vérifié avec `node tools/sim.js` (un robot joue avec le vrai moteur et progresse au village).
