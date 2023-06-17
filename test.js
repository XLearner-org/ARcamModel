import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/controls/OrbitControls.js';

class BasicWorldDemo {
    constructor() {
        this._Initialize();
    }

    _Initialize() {
        this._threejs = new THREE.WebGLRenderer({
            antialias: true,
        });

        this._threejs.shadowMap.enabled = true;
        this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
        this._threejs.setPixelRatio(window.devicePixelRatio);
        this._threejs.setSize(window.innerWidth, window.innerHeight);

        document.body.appendChild(this._threejs.domElement);

        window.addEventListener('resize', () => {
            this._OnWindowResize();
        }, false);

        const fov = 60;
        const aspect = window.innerWidth / window.innerHeight;
        const near = 1.0;
        const far = 1000.0;
        this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this._camera.position.set(75, 20, 0);

        this._scene = new THREE.Scene();

        const loader = new GLTFLoader();
        loader.load('https://rawcdn.githack.com/nitrohero/gltf-models/e7a55e20abae73d05cef4ca386701f2d9862eba0/ferrari.gltf',
            (gltf) => {
                const model = gltf.scene;
                model.position.set(3, 2, 0); // Adjust the position of the model relative to the plane
                model.scale.set(1, 1, 1); // Set the model to its original size
                model.rotation.set(0, Math.PI, 0); // Adjust the rotation of the model if needed
                this._scene.add(model);
            },
            undefined,
            (error) => {
                console.error('Error loading model:', error);
            }
        );

        const floorTexture = new THREE.TextureLoader().load('https://rawcdn.githack.com/nitrohero/textures/f9d3fc235596c5f7a88c668f6ff3aa684e6792af/checkerboard.jpg');
        floorTexture.wrapS = THREE.RepeatWrapping;
        floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set(20, 20); // Adjust the repeat values to control the number of tiles
        const floorMaterial = new THREE.MeshStandardMaterial({
            map: floorTexture,
            roughness: 0.8,
            metalness: 0.2,
        });
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(1000, 1000, 10, 10),
            floorMaterial
        );
        floor.receiveShadow = true;
        floor.rotation.x = -Math.PI / 2; // Rotate the floor to be horizontal
        this._scene.add(floor);

        const background = new THREE.Mesh(
            new THREE.PlaneGeometry(1000, 1000),
            new THREE.MeshBasicMaterial({ color: 0xCCCCCC })
        );
        background.position.z = -500;
        this._scene.add(background);

        const light = new THREE.DirectionalLight(0xffffff, 1.0);
        light.position.set(20, 100, 10);
        light.target.position.set(0, 0, 0);
        light.castShadow = true;
        light.shadow.bias = -0.001;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 500.0;
        light.shadow.camera.left = 100;
        light.shadow.camera.right = -100;
        light.shadow.camera.top = 100;
        light.shadow.camera.bottom = -100;
        this._scene.add(light);

        const ambientLight = new THREE.AmbientLight(0x101010);
        this._scene.add(ambientLight);

        const controls = new OrbitControls(this._camera, this._threejs.domElement);
        controls.target.set(0, 20, 0);
        controls.update();

        this._RAF();
    }

    _OnWindowResize() {
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
        this._threejs.setSize(window.innerWidth, window.innerHeight);
    }

    _RAF() {
        requestAnimationFrame(() => {
            this._threejs.render(this._scene, this._camera);
            this._RAF();
        });
    }
}

let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
    _APP = new BasicWorldDemo();
});
