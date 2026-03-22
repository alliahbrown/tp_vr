# tp_vr — Lecteur Vinyle en Réalité Augmentée

Live : https://alliahbrown.github.io/tp_vr/

---

## Objectif

Créer une expérience web en réalité augmentée avec Three.js et WebXR.

L'idée : pointer son téléphone vers une surface, poser un lecteur vinyle virtuel dans la pièce, puis afficher les albums Spotify en cercle autour de lui. Cliquer sur une pochette lance la musique.

---

## Ce qui fonctionne

- Détection de surface AR avec hit-test WebXR
- Placement du lecteur vinyle dans la scène en appuyant sur l'écran
- Affichage des pochettes Spotify en cercle autour du vinyle
- Authentification Spotify via OAuth PKCE (sans secret)


---

## Ce qui ne fonctionne pas encore

- Les pochettes Spotify s'affichent en gris (problème CORS sur les images)
- Le preview audio ne se lance pas (Spotify bloque les previews sur certains tracks)
- La lecture complète nécessite Spotify Premium et un appareil actif
- L'hélice CSS3D n'est pas visible en AR WebXR (le canvas WebGL passe par dessus)

---

## Mode d'emploi

1. Ouvrir le lien sur iPhone dans Safari
2. Appuyer sur **Start AR**
3. Pointer la caméra vers une surface (table, sol)
4. Quand le cercle vert apparait, appuyer sur l'écran pour poser le vinyle
5. Appuyer sur **Connecter Spotify** et se connecter
6. Appuyer à nouveau sur l'écran — les pochettes apparaissent en cercle


---

## Stack

- Three.js + WebXR
- TypeScript + Vite
- CSS3DRenderer (Three.js)
- Spotify Web API (OAuth PKCE)

---

## Installation

```bash
git clone https://github.com/alliahbrown/tp_vr.git
cd tp_vr
npm install
npm run dev
```

---

## Licence

MIT
