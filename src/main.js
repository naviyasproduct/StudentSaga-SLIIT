import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";



const pcNotice = document.getElementById("pc-notice");
if (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
  pcNotice.style.display = "none";
}


const mobileControls = document.getElementById("mobile-controls");
if (/Mobi|Android/i.test(navigator.userAgent)) {
  mobileControls.style.display = "flex";
}

document.querySelectorAll("#mobile-controls .arrow").forEach(button => {
  const key = button.dataset.key;

  button.addEventListener("touchstart", () => {
    keysPressed[key] = true;
  });

  button.addEventListener("touchend", () => {
    keysPressed[key] = false;
  });
});



const phoneIcon = document.getElementById("phone-icon");
const phoneUI = document.getElementById("phone-ui");

phoneIcon.addEventListener("click", () => {
  const isPhoneVisible = phoneUI.style.display === "flex";
  phoneUI.style.display = isPhoneVisible ? "none" : "flex";

  if (!isPhoneVisible) {
    document.exitPointerLock();
  }
});

// Mobile arrow buttons control integration
const mobileControls = {
  "arrow-up": "arrowup",
  "arrow-down": "arrowdown",
  "arrow-left": "arrowleft",
  "arrow-right": "arrowright"
};

Object.entries(mobileControls).forEach(([btnId, keyName]) => {
  const btn = document.getElementById(btnId);

  // Touch and mouse support (for both mobile and desktop testing)
  const startHandler = (e) => {
    e.preventDefault();
    keysPressed[keyName] = true;
  };

  const endHandler = (e) => {
    e.preventDefault();
    keysPressed[keyName] = false;
  };

  btn.addEventListener("touchstart", startHandler);
  btn.addEventListener("touchend", endHandler);
  btn.addEventListener("touchcancel", endHandler);

  btn.addEventListener("mousedown", startHandler);
  btn.addEventListener("mouseup", endHandler);
  btn.addEventListener("mouseleave", endHandler);
});


const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xcce0ff, 50, 500);
scene.background = new THREE.Color(0xcce0ff);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const sun = new THREE.DirectionalLight(0xfff0bb, 3);
sun.position.set(100, 150, 100);
sun.castShadow = true;
scene.add(sun);
scene.add(new THREE.AmbientLight(0xffffff, 0.15));

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(10000, 10000),
  new THREE.MeshStandardMaterial({ color: 0x7ec850 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const loader = new GLTFLoader();
loader.load("models/map-f-hand-test2.glb", (gltf) => {
  const model = gltf.scene;
  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  model.scale.set(1, 1, 1);
  scene.add(model);
}, undefined, (error) => console.error("Map load error:", error));

let player, mixer, walkAction;
const clock = new THREE.Clock();
const keysPressed = {};
const moveSpeed = 0.5;

function loadCharacter(type) {
  const charPath = type === "boy" ? "models/boy1.glb" : "models/girl-w.glb";
  const charLoader = new GLTFLoader();
  charLoader.load(charPath, (gltf) => {
    if (player) scene.remove(player);
    player = gltf.scene;
    player.scale.set(0.5, 0.5, 0.5);
    player.position.set(-135, 0, 103);
    player.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(player);
    mixer = new THREE.AnimationMixer(player);
    const clips = gltf.animations;
    if (clips.length > 0) {
      walkAction = mixer.clipAction(clips[0]);
      walkAction.timeScale = 2.9;
    }
    updateCameraPosition();
  }, undefined, (err) => console.error(`${type} model load error:`, err));
}

window.addEventListener("load", () => loadCharacter("boy"));
document.getElementById("select-boy").addEventListener("click", () => {
  document.getElementById("character-selection").style.display = "none";
  document.getElementById("character-selection-logo").style.display = "none";
  
});
document.getElementById("select-girl").addEventListener("click", () => {
  loadCharacter("girl");
  document.getElementById("character-selection").style.display = "none";
  document.getElementById("character-selection-logo").style.display = "none";

});

window.addEventListener("keydown", (e) => { keysPressed[e.key.toLowerCase()] = true; });
window.addEventListener("keyup", (e) => { keysPressed[e.key.toLowerCase()] = false; });

let isPointerLocked = false;
let yaw = 0, pitch = 0;
const pitchLimit = Math.PI / 3;

document.body.addEventListener("click", () => {
  if (!isPointerLocked && phoneUI.style.display !== "flex") {
    renderer.domElement.requestPointerLock();
  }
});

document.addEventListener("pointerlockchange", () => {
  isPointerLocked = document.pointerLockElement === renderer.domElement;
});

document.addEventListener("mousemove", (event) => {
  if (!isPointerLocked) return;
  yaw -= event.movementX * 0.002;
  pitch += event.movementY * 0.002;
  pitch = Math.max(-pitchLimit, Math.min(pitchLimit, pitch));
});

// === ARROWS ===
const arrowLoader = new GLTFLoader();
let entranceArrow, exitArrow;

arrowLoader.load('models/direction_arrow.glb', (gltf) => {
  entranceArrow = gltf.scene.clone();
  entranceArrow.scale.set(1, 1, 1);
  entranceArrow.position.set(-125, 5, 100);
  entranceArrow.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      child.material = new THREE.MeshStandardMaterial({ color: 0x0000ff }); // blue debug material
    }
  });
  scene.add(entranceArrow);

  exitArrow = gltf.scene.clone();
  exitArrow.scale.set(1, 1, 1);
  exitArrow.position.set(-125, 5, 104);
  exitArrow.rotation.y = Math.PI;
  exitArrow.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      child.material = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    }
  });
  scene.add(exitArrow);
}, undefined, (error) => console.error("Arrow load error:", error));

const arrowFloatSpeed = 2;
const arrowFloatHeight = 0.5;

function updateCameraPosition() {
  if (!player) return;
  const offset = new THREE.Vector3(
    10 * Math.sin(yaw) * Math.cos(pitch),
    10 * Math.sin(pitch) + 5,
    10 * Math.cos(yaw) * Math.cos(pitch)
  );
  camera.position.copy(player.position).add(offset);
  camera.lookAt(player.position.clone().setY(player.position.y + 2));
}

function animate(time) {
  requestAnimationFrame(animate);
  const t = time * 0.001;

  if (entranceArrow) {
    entranceArrow.position.y = 5 + Math.sin(t * arrowFloatSpeed) * arrowFloatHeight;
  }

  if (exitArrow) {
    exitArrow.position.y = 5 + Math.sin(t * arrowFloatSpeed) * arrowFloatHeight;
  }

  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);

  if (player) {
    const moveDir = new THREE.Vector3();
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    if (keysPressed["w"] || keysPressed["arrowup"]) moveDir.add(forward);
    if (keysPressed["s"] || keysPressed["arrowdown"]) moveDir.sub(forward);
    if (keysPressed["a"] || keysPressed["arrowleft"]) moveDir.sub(right);
    if (keysPressed["d"] || keysPressed["arrowright"]) moveDir.add(right);

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize();
      player.position.add(moveDir.multiplyScalar(moveSpeed));
      player.rotation.y = Math.atan2(moveDir.x, moveDir.z);
      if (walkAction && !walkAction.isRunning()) walkAction.play();
    } else {
      if (walkAction && walkAction.isRunning()) walkAction.stop();
    }

    updateCameraPosition();
  }

  renderer.render(scene, camera);
}

animate();
