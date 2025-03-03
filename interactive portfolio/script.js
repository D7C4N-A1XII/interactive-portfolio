import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';

// 🚀 Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 8);

const canvas = document.querySelector('#three-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// 🚀 Postprocessing Composer
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

// 🌟 Bloom Effect (Glowing Space-Time Around Black Hole)
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
composer.addPass(bloomPass);

// ⚡ Glitch Effect (Subtle Sci-Fi Distortion)
const glitchPass = new GlitchPass();
composer.addPass(glitchPass);

// 🚀 Black Hole Shader Material
const blackHoleShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 1.0 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        void main() {
            float dist = distance(vUv, vec2(0.5, 0.5));
            float blackHole = smoothstep(0.3, 0.5, dist);
            float glow = smoothstep(0.45, 0.5, dist) * (sin(time * 2.0) * 0.5 + 0.5);
            vec3 color = mix(vec3(0.0, 0.0, 0.0), vec3(1.0, 0.5, 0.0), glow); // Accretion disk color
            gl_FragColor = vec4(color, 1.0 - blackHole);
        }
    `,
});

// 🚀 Create Black Hole Mesh
const blackHoleGeometry = new THREE.SphereGeometry(2, 64, 64);
const blackHole = new THREE.Mesh(blackHoleGeometry, blackHoleShaderMaterial);
scene.add(blackHole);

// 🚀 Starfield (Moving Stars)
const starGeometry = new THREE.BufferGeometry();
const starPositions = new Float32Array(1000 * 3);
for (let i = 0; i < starPositions.length; i++) {
  starPositions[i] = (Math.random() - 0.5) * 50;
}
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05 });
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// 🚀 Animate Black Hole & Stars
function animate() {
    requestAnimationFrame(animate);
    
    blackHole.rotation.y += 0.002;
    blackHoleShaderMaterial.uniforms.time.value += 0.02;

    composer.render();
}
animate();

// 🚀 Handle Resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});
