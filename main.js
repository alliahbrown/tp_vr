"use strict";
// ⚠️ DO NOT EDIT main.js DIRECTLY ⚠️
// This file is generated from the TypeScript source main.ts
// Any changes made here will be overwritten.
// Import only what you need, to help your bundler optimize final code size using tree shaking
// see https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking)
import { BoxGeometry, HemisphereLight, Mesh, Vector3, PerspectiveCamera, Scene, WebGLRenderer, RingGeometry, MeshBasicMaterial, Object3D, } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { ARButton } from 'three/examples/jsm/Addons.js';
// Example of hard link to official repo for data, if needed
// const MODEL_PATH = 'https://raw.githubusercontent.com/mrdoob/three.js/r173/examples/models/gltf/LeePerrySmith/LeePerrySmith.glb';
// INSERT CODE HERE
let camera, scene, renderer;
let container;
let controller1, controller2;
let reticle;
let vinyl_player;
let hitTestSource = null;
let cssRenderer;
let helixVisible = false;
let hitTestSourceRequested = false;
function loadData() {
    new GLTFLoader()
        .setPath('assets/models/')
        .load('vinyl_player.glb', gltfReader);
}
function gltfReader(gltf) {
    if (!gltf.scene) {
        console.log("Load FAILED.");
        return;
    }
    vinyl_player = gltf.scene;
    console.log('vinyl_player loaded:', vinyl_player);
}
const mockAlbums = Array.from({ length: 10 }, (_, i) => ({
    name: `Album ${i + 1}`,
    cover: `https://picsum.photos/seed/${i + 10}/80/80`,
}));
function buildHelix() {
    if (!vinyl_player)
        return;
    const radius = 0.15;
    const verticalGap = 0.04;
    const angleStep = 0.6;
    const total = mockAlbums.length;
    const totalHeight = (total - 1) * verticalGap;
    const anchor = new Object3D();
    anchor.position.copy(vinyl_player.position);
    anchor.position.y += 0.1;
    scene.add(anchor);
    // Ancre au dessus du vinyle
    mockAlbums.forEach((album, i) => {
        // Maths helix : cercle + montee verticale
        const angle = i * angleStep;
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        const y = i * verticalGap - totalHeight / 2;
        const el = document.createElement('div');
        el.style.cssText = `
      width:80px; height:80px;
      border-radius:6px;
      background: url('${album.cover}') center/cover;
      box-shadow: 0 4px 15px rgba(0,0,0,0.8);
      pointer-events:auto;
      cursor:pointer;
    `;
        el.title = album.name;
        el.addEventListener('click', () => alert(album.name));
        const obj = new CSS3DObject(el);
        obj.position.set(x, y, z);
        obj.rotation.y = -angle + Math.PI;
        obj.scale.setScalar(0.001);
        anchor.add(obj);
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
    cssRenderer = new CSS3DRenderer();
    cssRenderer.setSize(window.innerWidth, window.innerHeight);
    cssRenderer.domElement.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;';
    document.body.appendChild(cssRenderer.domElement);
    renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);
    //
    document.body.appendChild(ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] }));
    //
    const geometry = new BoxGeometry(0.1, 0.1, 0.2, 32).translate(0, 0.1, 0);
    function onSelect() {
        if (reticle.visible && vinyl_player) {
            reticle.matrix.decompose(vinyl_player.position, vinyl_player.quaternion, vinyl_player.scale);
            vinyl_player.scale.setScalar(0.2);
            scene.add(vinyl_player);
            buildHelix();
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
    //
    window.addEventListener('resize', onWindowResize);
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    /////////////////////////////////////////////////
    const targets = { helix: [], grid: [] };
    const objects = [];
    const vector = new Vector3();
    const periodic_table = [
        'H', 'Hydrogen', '1.00794', 1, 1,
        'He', 'Helium', '4.002602', 18, 1,
        'Li', 'Lithium', '6.941', 1, 2,
        'Be', 'Beryllium', '9.012182', 2, 2,
        'B', 'Boron', '10.811', 13, 2,
        'C', 'Carbon', '12.0107', 14, 2,
        'N', 'Nitrogen', '14.0067', 15, 2,
        'O', 'Oxygen', '15.9994', 16, 2,
        'F', 'Fluorine', '18.9984032', 17, 2
    ];
    for (let i = 0, l = objects.length; i < l; i++) {
        const theta = i * 0.175 + Math.PI;
        const y = -(i * 8) + 450;
        const object = new Object3D();
        object.position.setFromCylindricalCoords(900, theta, y);
        vector.x = object.position.x * 2;
        vector.y = object.position.y;
        vector.z = object.position.z * 2;
        object.lookAt(vector);
        targets.helix.push(object);
    }
    ///////////////////////////////////////
    function animate(timestamp, frame) {
        if (frame) {
            const referenceSpace = renderer.xr.getReferenceSpace();
            const session = renderer.xr.getSession();
            if (hitTestSourceRequested === false) {
                if (session) {
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
            }
            if (hitTestSource) {
                const hitTestResults = frame.getHitTestResults(hitTestSource);
                if (hitTestResults.length) {
                    const hit = hitTestResults[0];
                    reticle.visible = true;
                    reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);
                }
                else {
                    reticle.visible = false;
                }
            }
        }
        renderer.render(scene, camera);
        cssRenderer.render(scene, camera);
    }
};
init();
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
function animate(_time, _frame) {
    throw new Error('Function not implemented.');
}
//# sourceMappingURL=main.js.map