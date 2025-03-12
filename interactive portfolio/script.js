import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';

// 🚀 Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 12);

const canvas = document.querySelector('#three-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// 🚀 Postprocessing Effects
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85));
composer.addPass(new GlitchPass());

// 🚀 Black Hole Shader Material
const blackHoleShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 1.0 },
        distortionStrength: { value: 0.2 },
        mousePos: { value: new THREE.Vector2(0.5, 0.5) }
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
        uniform vec2 mousePos;
        uniform float distortionStrength;
        varying vec2 vUv;

        void main() {
            float dist = distance(vUv, vec2(0.5, 0.5));
            float warp = sin(time + dist * 10.0) * distortionStrength;
            float blackHole = smoothstep(0.25 + warp, 0.35, dist);
            float glow = smoothstep(0.4, 0.5, dist) * (sin(time * 2.0) * 0.5 + 0.5);
            vec3 color = mix(vec3(0.0, 0.0, 0.0), vec3(1.0, 0.5, 0.0), glow);
            gl_FragColor = vec4(color, 1.0 - blackHole);
        }
    `,
});

// 🚀 Create Bigger Black Hole (No Accretion Disk)
const blackHoleGeometry = new THREE.SphereGeometry(4, 64, 64);
const blackHole = new THREE.Mesh(blackHoleGeometry, blackHoleShaderMaterial);
blackHole.position.z = -8;
scene.add(blackHole);

// 🚀 Starfield (Stars Pulled into Black Hole)
const starGeometry = new THREE.BufferGeometry();
const starPositions = new Float32Array(1200 * 3);
for (let i = 0; i < starPositions.length; i++) {
  starPositions[i] = (Math.random() - 0.5) * 60;
}
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05 });
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// 🚀 Animate Scene
function animate() {
    requestAnimationFrame(animate);
    
    blackHoleShaderMaterial.uniforms.time.value += 0.02;

    // 🌀 Star Pull Effect
    const positions = stars.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
        let x = positions[i];
        let y = positions[i + 1];
        let z = positions[i + 2];

        let dx = -x * 0.0005;
        let dy = -y * 0.0005;
        let dz = -z * 0.0005;

        positions[i] += dx;
        positions[i + 1] += dy;
        positions[i + 2] += dz;

        // Respawn stars when they reach the black hole
        if (Math.abs(x) < 0.5 && Math.abs(y) < 0.5 && Math.abs(z) < 0.5) {
            positions[i] = (Math.random() - 0.5) * 60;
            positions[i + 1] = (Math.random() - 0.5) * 60;
            positions[i + 2] = (Math.random() - 0.5) * 60;
        }
    }
    stars.geometry.attributes.position.needsUpdate = true;

    composer.render();
}
animate();

// 🚀 Mouse Interaction
document.addEventListener('mousemove', (event) => {
    const mouseX = event.clientX / window.innerWidth;
    const mouseY = event.clientY / window.innerHeight;
    blackHoleShaderMaterial.uniforms.mousePos.value.set(mouseX, mouseY);
});

// 🚀 Handle Resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});


// 🚀 Navigation Glitch Effect
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

document.querySelectorAll("nav ul li a").forEach((item) => {
    const originalText = item.innerText;
    item.setAttribute("data-value", originalText);
    
    let interval = null;

    item.onmouseover = (event) => {
        let iteration = 0;
        clearInterval(interval);

        interval = setInterval(() => {
            event.target.innerText = originalText
                .split("")
                .map((letter, index) => {
                    if (index < iteration) {
                        return originalText[index];
                    }
                    return letters[Math.floor(Math.random() * 26)];
                })
                .join("");

            if (iteration >= originalText.length) {
                clearInterval(interval);
            }

            iteration += 1 / 3;
        }, 30);
    };

    item.onmouseleave = (event) => {
        clearInterval(interval);
        event.target.innerText = event.target.dataset.value;
    };

    item.onclick = (event) => {
        window.location.href = item.getAttribute("href");
    };
});

// 🚀 Typing Effect
const textArray = ["Data Engineer Intern", "Data analyst", "IT Technician"];
const typedText = document.querySelector(".typed-text");
const cursor = document.querySelector(".cursor");

let textIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
    if (!typedText) return; // Prevent errors if the element is missing

    let currentText = textArray[textIndex];

    if (isDeleting) {
        typedText.textContent = currentText.substring(0, charIndex--);
    } else {
        typedText.textContent = currentText.substring(0, charIndex++);
    }

    let typingSpeed = isDeleting ? 50 : 100;

    if (!isDeleting && charIndex === currentText.length) {
        isDeleting = true;
        typingSpeed = 1500;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % textArray.length;
    }

    setTimeout(typeEffect, typingSpeed);
}

// Run typing effect after the DOM has loaded
document.addEventListener("DOMContentLoaded", () => {
    typeEffect();
});


