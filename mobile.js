
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


// ========================================
// 1. CONFIGURACIÓN DE LA ESCENA
// ========================================

const container = document.getElementById('three-container');
const categories = [...document.querySelectorAll('.category')];

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
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
renderer.setSize(window.innerWidth, window.innerHeight);

container.appendChild(renderer.domElement);


// El canvas ocupa siempre la pantalla completa

function resizeScene() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

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

    // Centrar el modelo
    const box = new THREE.Box3().setFromObject(fish);
    const center = box.getCenter(new THREE.Vector3());

    fish.position.sub(center);

    // Escalar automáticamente
    const size = box.getSize(new THREE.Vector3());
    const maxSize = Math.max(size.x, size.y, size.z);

    fish.scale.setScalar(1.2 / maxSize);

    scene.add(fish);

    console.log('Pez cargado correctamente');
  },

  undefined,

  function (error) {
    console.error('Error cargando el pez:', error);
  }
);


// ========================================
// 5. CATEGORÍAS ACTIVAS
// ========================================

let activeCategory = categories[0] || null;

function activateCategory(category) {

  if (!category) return;

  activeCategory = category;

  categories.forEach((item) => {
    item.classList.toggle('active', item === category);
  });
}

// Activar la primera categoría inicialmente
if (activeCategory) {
  activateCategory(activeCategory);
}


// Detectar cuando una categoría llega
// a la zona central de la pantalla

const observer = new IntersectionObserver(
  (entries) => {

    entries.forEach((entry) => {

      if (entry.isIntersecting) {
        activateCategory(entry.target);
      }

    });

  },
  {
    root: null,
    rootMargin: '-40% 0px -40% 0px',
    threshold: 0
  }
);

categories.forEach((category) => {
  observer.observe(category);
});


// ========================================
// 6. RECORRIDO DEL PEZ
// ========================================

const targetPosition = new THREE.Vector3();
const currentPosition = new THREE.Vector3();

let scrollDirection = 0;
let previousScroll = window.scrollY;


// Detectar dirección del scroll

window.addEventListener('scroll', () => {

  const currentScroll = window.scrollY;

  scrollDirection = currentScroll > previousScroll ? 1 : -1;

  previousScroll = currentScroll;

}, { passive: true });


// Calcular dónde debería estar el pez
// según la posición de la categoría activa

function updateFishTarget() {

  if (!activeCategory) return;

  const rect = activeCategory.getBoundingClientRect();

  // Centro de la categoría en pantalla
  const categoryX = rect.left + rect.width / 2;
  const categoryY = rect.top + rect.height / 2;

  // El pez aparece a un costado de la etiqueta
  const offsetX = categoryX < window.innerWidth / 2 ? 75 : -75;

  const screenX = THREE.MathUtils.clamp(
    categoryX + offsetX,
    30,
    window.innerWidth - 30
  );

  const screenY = categoryY;

  // Convertir coordenadas de pantalla a coordenadas 3D
  const ndcX = (screenX / window.innerWidth) * 2 - 1;
  const ndcY = -(screenY / window.innerHeight) * 2 + 1;

  const visibleHeight =
    2 * camera.position.z * Math.tan(
      THREE.MathUtils.degToRad(camera.fov / 2)
    );

  const visibleWidth =
    visibleHeight * camera.aspect;

  targetPosition.x = ndcX * visibleWidth / 2;
  targetPosition.y = ndcY * visibleHeight / 2;
  targetPosition.z = 0;
}


// ========================================
// 7. ANIMACIÓN
// ========================================

function animate() {

  requestAnimationFrame(animate);

  if (fish && activeCategory) {

    updateFishTarget();

    // Movimiento suave hacia la categoría
    fish.position.lerp(targetPosition, 0.045);

    // Pequeña inclinación según el movimiento
    const targetRotationX = scrollDirection * 0.10;

    fish.rotation.x +=
      (targetRotationX - fish.rotation.x) * 0.035;

    // Leve orientación lateral según su posición
    const targetRotationY = fish.position.x * 0.12;

    fish.rotation.y +=
      (targetRotationY - fish.rotation.y) * 0.035;
  }

  renderer.render(scene, camera);
}

animate();
