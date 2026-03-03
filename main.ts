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
  Vector3,
  MeshNormalMaterial,
  MeshPhongMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  RingGeometry,
  MeshBasicMaterial,
  Object3D,
  Object3DEventMap,
} from 'three';

import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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


import { XRController } from 'iwer/lib/device/XRController';
import { ARButton } from 'three/examples/jsm/Addons.js';

// Example of hard link to official repo for data, if needed
// const MODEL_PATH = 'https://raw.githubusercontent.com/mrdoob/three.js/r173/examples/models/gltf/LeePerrySmith/LeePerrySmith.glb';




// INSERT CODE HERE
let camera: PerspectiveCamera, scene: Scene, renderer: WebGLRenderer;
let container: any

let controller1, controller2

let reticle: Object3D<Object3DEventMap>;

let vinyl_player: Object3D
let hitTestSource: XRHitTestSource | null = null;
let hitTestSourceRequested = false;

function loadData() {
  new GLTFLoader()
    .setPath('assets/models/')
    .load('v3.glb', gltfReader);

  new GLTFLoader()
    .setPath('assets/models/')
    .load('vinyl_player.glb', gltfReader);
}


function gltfReader(gltf: GLTF) {
  if (!gltf.scene) { console.log("Load FAILED."); return; }
  vinyl_player = gltf.scene;
  console.log('vinyl_player loaded:', vinyl_player);
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

  //

  document.body.appendChild(ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] }));

  //

  const geometry = new BoxGeometry(0.1, 0.1, 0.2, 32).translate(0, 0.1, 0);

  function onSelect() {
    if (reticle.visible && vinyl_player) {
      reticle.matrix.decompose(
        vinyl_player.position,
        vinyl_player.quaternion,
        vinyl_player.scale
      );
      vinyl_player.scale.setScalar(0.5);
      scene.add(vinyl_player);
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
    const y = - (i * 8) + 450;

    const object = new Object3D();

    object.position.setFromCylindricalCoords(900, theta, y);

    vector.x = object.position.x * 2;
    vector.y = object.position.y;
    vector.z = object.position.z * 2;

    object.lookAt(vector);

    targets.helix.push(object);

  }





  ///////////////////////////////////////


  function animate(timestamp: any, frame: { getHitTestResults: (arg0: XRHitTestSource) => any; }) {

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

        } else {

          reticle.visible = false;

        }

      }

    }

    renderer.render(scene, camera);

  }

}

init();



function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}
function animate(_time: number, _frame: XRFrame): void {
  throw new Error('Function not implemented.');
}

