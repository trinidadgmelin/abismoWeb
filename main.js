
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


// ========================================
// 1. CONFIGURACIÓN DE LA ESCENA
// ========================================

const interactiveArea = document.querySelector('.interactive-area');
const container = document.getElementById('three-container');
const light = document.querySelector('.cursor-light');

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  1,
  0.1,
  100
);

camera.position.z = 5;


// ========================================
// 2. RENDERER
// ========================================

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);


// Ajustar el canvas al tamaño del escenario interactivo

function resizeScene() {
  const width = interactiveArea.clientWidth;
  const height = interactiveArea.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}

resizeScene();

window.addEventListener('resize', resizeScene);


// ========================================
// 3. ILUMINACIÓN
// ========================================

const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(2, 3, 5);
scene.add(directionalLight);


// ========================================
// 4. CARGA DEL MODELO 3D
// ========================================

let fish = null;

const loader = new GLTFLoader();

loader.load(
  './assets/pez.glb',

  function (gltf) {
    fish = gltf.scene;

    // Centrar el modelo automáticamente
    const box = new THREE.Box3().setFromObject(fish);
    const center = box.getCenter(new THREE.Vector3());

    fish.position.sub(center);

    // Escalar el modelo según su tamaño
    const size = box.getSize(new THREE.Vector3());
    const maxSize = Math.max(size.x, size.y, size.z);

    fish.scale.setScalar(2 / maxSize);

    scene.add(fish);

    console.log('Pez cargado correctamente');
  },

  undefined,

  function (error) {
    console.error('Error cargando el pez:', error);
  }
);


// ========================================
// 5. MOVIMIENTO DEL CURSOR
// ========================================

const mouse = new THREE.Vector2(0, 0);

window.addEventListener('mousemove', (event) => {

  // Coordenadas relativas al escenario derecho
  const rect = interactiveArea.getBoundingClientRect();

  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Luz que sigue al cursor
  if (light) {
    light.style.left = x + 'px';
    light.style.top = y + 'px';
  }

  // Normalizar posición del mouse
  mouse.x = (x / rect.width) * 2 - 1;
  mouse.y = -(y / rect.height) * 2 + 1;

  // Distancia del cursor al borde izquierdo
  const fadeDistance = 150;

  // Calcular opacidad según la distancia
  const opacity = Math.min(x / fadeDistance, 1);

  // Aplicar opacidad progresiva
  light.style.opacity = opacity;

});


// ========================================
// 6. ANIMACIÓN Y ROTACIÓN DEL PEZ
// ========================================

function animate() {

  requestAnimationFrame(animate);

  if (fish) {

    // Movimiento horizontal
    const targetY = mouse.x * 0.45;

    // Movimiento vertical (signo invertido)
    const targetX = -mouse.y * 0.25;

    // Suavizar la rotación
    fish.rotation.y += (targetY - fish.rotation.y) * 0.04;
    fish.rotation.x += (targetX - fish.rotation.x) * 0.04;

  }

  renderer.render(scene, camera);
}

animate();
