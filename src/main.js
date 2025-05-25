import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lights
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Camera initial position and look at center
camera.position.set(0, 5, 15);
camera.lookAt(0, 0, 0);

// OrbitControls for mouse interaction
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;   // smooth camera motion
controls.dampingFactor = 0.05;
controls.update();

// Ground plane
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshStandardMaterial({ color: 0x222222, side: THREE.DoubleSide })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Helpers
const gridHelper = new THREE.GridHelper(50, 50);
scene.add(gridHelper);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Car mesh
const car = new THREE.Mesh(
  new THREE.BoxGeometry(1, 0.5, 2),
  new THREE.MeshStandardMaterial({ color: 0xff0000 })
);
scene.add(car);
car.visible = false;

// Car animation variables
let carActive = false;
let carDirection = 1;
let carTimer = 0;
let carSpeed = 10;

function triggerCar() {
  car.visible = true;
  carActive = true;
  carDirection = Math.random() < 0.5 ? 1 : -1;
  car.position.set(carDirection * 15, 0, 0);
}

triggerCar();

let lastTime = performance.now();

function animate() {
  const currentTime = performance.now();
  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  carTimer += deltaTime;
  if (carTimer >= 10) {
    triggerCar();
    carTimer = 0;
  }

  if (carActive) {
    car.position.x -= carDirection * carSpeed * deltaTime;

    if (Math.abs(car.position.x) > 20) {
      car.visible = false;
      carActive = false;
    }
  }

  controls.update(); // update orbit controls

  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// Handle browser resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});
