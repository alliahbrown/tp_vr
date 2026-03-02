"use strict";

// ⚠️ DO NOT EDIT main.js DIRECTLY ⚠️
// This file is generated from the TypeScript source main.ts
// Any changes made here will be overwritten.

// Import only what you need, to help your bundler optimize final code size using tree shaking
// see https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking)

import {
  AmbientLight,
  BoxGeometry,
  Timer,
  Color,
  CylinderGeometry,
  HemisphereLight,
  Mesh,
  MeshNormalMaterial,
  MeshPhongMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  RingGeometry,
  MeshBasicMaterial,
  Object3D,
  Object3DEventMap
} from 'three';

// XR Emulator
import { DevUI } from '@iwer/devui';
import { XRDevice, metaQuest3 } from 'iwer';

// XR
import { XRButton } from 'three/addons/webxr/XRButton.js';

// If you prefer to import the whole library, with the THREE prefix, use the following line instead:
// import * as THREE from 'three'

// NOTE: three/addons alias is supported by Rollup: you can use it interchangeably with three/examples/jsm/  

// Importing Ammo can be tricky.
// Vite supports webassembly: https://vitejs.dev/guide/features.html#webassembly
// so in theory this should work:
//
// import ammoinit from 'three/addons/libs/ammo.wasm.js?init';
// ammoinit().then((AmmoLib) => {
//  Ammo = AmmoLib.exports.Ammo()
// })
//
// But the Ammo lib bundled with the THREE js examples does not seem to export modules properly.
// A solution is to treat this library as a standalone file and copy it using 'vite-plugin-static-copy'.
// See vite.config.js
// 
// Consider using alternatives like Oimo or cannon-es
import {
  OrbitControls
} from 'three/addons/controls/OrbitControls.js';

import {
  GLTFLoader
} from 'three/addons/loaders/GLTFLoader.js';
import { XRController } from 'iwer/lib/device/XRController';
import { ARButton } from 'three/examples/jsm/Addons.js';

// Example of hard link to official repo for data, if needed
// const MODEL_PATH = 'https://raw.githubusercontent.com/mrdoob/three.js/r173/examples/models/gltf/LeePerrySmith/LeePerrySmith.glb';




// INSERT CODE HERE
let camera: PerspectiveCamera, scene: Scene, renderer: WebGLRenderer;
let container: any

let controller1, controller2

let reticle: Object3D<Object3DEventMap>;

let hitTestSource = null;
let hitTestSourceRequested = false;


const init = () => {
  container = document.createElement('div');
  document.body.appendChild(container);

  scene = new Scene();

  camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

  const light = new HemisphereLight(0xffffff, 0xbbbbff, 3);
  light.position.set(0.5, 1, 0.25);
  scene.add(light);

  //

  renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  renderer.xr.enabled = true;
  container.appendChild(renderer.domElement);

  //

  document.body.appendChild(ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] }));

  //

  const geometry = new CylinderGeometry(0.1, 0.1, 0.2, 32).translate(0, 0.1, 0);

  function onSelect() {

    if (reticle.visible) {

      const material = new MeshPhongMaterial({ color: 0xffffff * Math.random() });
      const mesh = new Mesh(geometry, material);
      reticle.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
      mesh.scale.y = Math.random() * 2 + 1;
      scene.add(mesh);

    }

  }

  controller1 = renderer.xr.getController(0);
  controller1.addEventListener('select', onSelect);
  scene.add(controller1);

  controller2 = renderer.xr.getController(1);
  controller2.addEventListener('select', onSelect);
  scene.add(controller2);

  reticle = new Mesh(
    new RingGeometry(0.15, 0.2, 32).rotateX(- Math.PI / 2),
    new MeshBasicMaterial()
  );
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add(reticle);

  //

  window.addEventListener('resize', onWindowResize);


}

init();

//

/*
function loadData() {
  new GLTFLoader()
    .setPath('assets/models/')
    .load('test.glb', gltfReader);
}


function gltfReader(gltf) {
  let testModel = null;

  testModel = gltf.scene;

  if (testModel != null) {
    console.log("Model loaded:  " + testModel);
    scene.add(gltf.scene);
  } else {
    console.log("Load FAILED.  ");
  }
}

loadData();
*/


// camera.position.z = 3;




function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}
function animate(time: number, frame: XRFrame): void {
  throw new Error('Function not implemented.');
}

