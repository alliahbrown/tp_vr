"use strict";
import { HemisphereLight, Mesh, Vector3, PerspectiveCamera, Scene, WebGLRenderer, RingGeometry, MeshBasicMaterial, CanvasTexture, PlaneGeometry, DoubleSide, Vector2, Raycaster, } from 'three';
import { spotifyLogin, getToken, getStoredToken, searchTracks } from './spotify';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ARButton } from 'three/examples/jsm/Addons.js';
let camera, scene, renderer;
let container;
let controller1, controller2;
let reticle;
let vinyl_player;
let hitTestSource = null;
let hitTestSourceRequested = false;
let spotifyToken = null;
let spotifyAlbums = [];
let vinylPlaced = false;
let currentAudio = null;
function loadData() {
    new GLTFLoader()
        .setPath('assets/models/')
        .load('vinyl_player.glb', gltfReader);
}
function gltfReader(gltf) {
    if (!gltf.scene)
        return;
    vinyl_player = gltf.scene;
}
const mockAlbums = [
    { name: 'Blinding Lights', artist: 'The Weeknd', cover: null, preview: null },
    { name: 'Levitating', artist: 'Dua Lipa', cover: null, preview: null },
    { name: 'Stay', artist: 'Kid Laroi', cover: null, preview: null },
    { name: 'Peaches', artist: 'Justin Bieber', cover: null, preview: null },
    { name: 'Good 4 U', artist: 'Olivia', cover: null, preview: null },
    { name: 'Montero', artist: 'Lil Nas X', cover: null, preview: null },
    { name: 'Kiss Me More', artist: 'Doja Cat', cover: null, preview: null },
    { name: 'Leave The Door', artist: 'Bruno Mars', cover: null, preview: null },
    { name: 'Butter', artist: 'BTS', cover: null, preview: null },
    { name: 'Traitor', artist: 'Olivia R.', cover: null, preview: null },
];
function onAlbumClick(album) {
    const info = document.getElementById('info') || document.createElement('div');
    info.id = 'info';
    info.style.cssText = `
    position: fixed; bottom: 100px; left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.8); color: white;
    padding: 10px 20px; border-radius: 20px;
    font-family: sans-serif; font-size: 16px;
    z-index: 9999;
  `;
    info.textContent = `${album.name} — ${album.artist}`;
    document.body.appendChild(info);
    setTimeout(() => info.remove(), 3000);
    if (album.preview) {
        if (currentAudio)
            currentAudio.pause();
        currentAudio = new Audio(album.preview);
        currentAudio.play();
    }
}
function buildCircle() {
    if (!vinyl_player)
        return;
    const vinylPos = new Vector3();
    vinyl_player.getWorldPosition(vinylPos);
    const radius = 0.4;
    const albums = spotifyAlbums.length > 0 ? spotifyAlbums : mockAlbums;
    const count = albums.length;
    albums.forEach((album, i) => {
        const angle = (i / count) * Math.PI * 2;
        const x = vinylPos.x + radius * Math.cos(angle);
        const z = vinylPos.z + radius * Math.sin(angle);
        const y = vinylPos.y + 0.3;
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1db954';
        ctx.fillRect(0, 0, 256, 256);
        ctx.fillStyle = 'white';
        ctx.font = '22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(album.name, 128, 110);
        ctx.fillText(album.artist ?? '', 128, 150);
        const texture = new CanvasTexture(canvas);
        if (album.cover) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                ctx.drawImage(img, 0, 0, 256, 256);
                texture.needsUpdate = true;
            };
            img.src = `https://corsproxy.io/?${encodeURIComponent(album.cover)}`;
        }
        const geo = new PlaneGeometry(0.15, 0.15);
        const mat = new MeshBasicMaterial({ map: texture, side: DoubleSide });
        const plane = new Mesh(geo, mat);
        plane.position.set(x, y, z);
        plane.lookAt(vinylPos.x, y, vinylPos.z);
        plane.userData.onClick = () => onAlbumClick(album);
        scene.add(plane);
    });
}
const init = () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    scene = new Scene();
    loadData();
    camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
    const light = new HemisphereLight(0xffffff, 0xbbbbff, 3);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);
    renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);
    document.body.appendChild(ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] }));
    function onSelect() {
        if (reticle.visible && vinyl_player && !vinylPlaced) {
            reticle.matrix.decompose(vinyl_player.position, vinyl_player.quaternion, vinyl_player.scale);
            vinyl_player.scale.setScalar(0.1);
            scene.add(vinyl_player);
            vinylPlaced = true;
            buildCircle();
        }
    }
    controller1 = renderer.xr.getController(0);
    controller1.addEventListener('select', onSelect);
    scene.add(controller1);
    controller2 = renderer.xr.getController(1);
    controller2.addEventListener('select', onSelect);
    scene.add(controller2);
    reticle = new Mesh(new RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2), new MeshBasicMaterial());
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);
    window.addEventListener('click', (event) => {
        const mouse = new Vector2((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
        const ray = new Raycaster();
        ray.setFromCamera(mouse, camera);
        const hits = ray.intersectObjects(scene.children, true);
        if (hits.length > 0 && hits[0].object.userData.onClick) {
            hits[0].object.userData.onClick();
        }
    });
    window.addEventListener('resize', onWindowResize);
    function animate(_timestamp, frame) {
        if (frame) {
            const referenceSpace = renderer.xr.getReferenceSpace();
            const session = renderer.xr.getSession();
            if (!hitTestSourceRequested && session) {
                session.requestReferenceSpace('viewer').then(function (referenceSpace) {
                    session.requestHitTestSource?.({ space: referenceSpace })?.then(function (source) {
                        hitTestSource = source;
                    });
                });
                session.addEventListener('end', function () {
                    hitTestSourceRequested = false;
                    hitTestSource = null;
                });
                hitTestSourceRequested = true;
            }
            if (hitTestSource) {
                const hitTestResults = frame.getHitTestResults(hitTestSource);
                if (hitTestResults.length) {
                    const hit = hitTestResults[0];
                    reticle.visible = !vinylPlaced;
                    reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);
                }
                else {
                    reticle.visible = false;
                }
            }
        }
        renderer.render(scene, camera);
    }
};
async function initSpotify() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
        spotifyToken = await getToken(code);
        window.history.replaceState({}, '', window.location.pathname);
    }
    else {
        spotifyToken = getStoredToken();
    }
    if (spotifyToken) {
        spotifyAlbums = await searchTracks('lofi chill', spotifyToken);
        showLoginButton(false);
        // Si le vinyle est deja place, rebuild le cercle avec les vrais albums
        if (vinylPlaced)
            buildCircle();
    }
    else {
        showLoginButton(true);
    }
}
function showLoginButton(show) {
    let btn = document.getElementById('spotify-btn');
    if (!btn) {
        btn = document.createElement('button');
        btn.id = 'spotify-btn';
        btn.textContent = 'Connecter Spotify';
        btn.style.cssText = `
      position: fixed; bottom: 40px; left: 50%;
      transform: translateX(-50%);
      background: #1db954; color: white;
      border: none; border-radius: 25px;
      padding: 12px 24px; font-size: 16px;
      cursor: pointer; z-index: 9999;
    `;
        btn.addEventListener('click', spotifyLogin);
        document.body.appendChild(btn);
    }
    btn.style.display = show ? 'block' : 'none';
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
init();
initSpotify();
//# sourceMappingURL=main.js.map