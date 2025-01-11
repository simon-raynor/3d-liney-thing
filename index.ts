import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Grid from './Grid';


const stats = new Stats();
document.body.appendChild( stats.dom );


const scene = new THREE.Scene();
scene.background = new THREE.Color(0x221122);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);


document.getElementById('stage')?.appendChild(renderer.domElement);


const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.5,
    750
);

const C_DISTANCE = 10;

camera.position.set(-C_DISTANCE, C_DISTANCE, -C_DISTANCE)
camera.lookAt(new THREE.Vector3(0, 0, 0));


const orbCtrls = new OrbitControls( camera, renderer.domElement );
orbCtrls.target = new THREE.Vector3(0, 0, 0);
orbCtrls.update();


const points: number[] = [];


const gridtypes = [
    'square',
    'hex',
    'cube',
    'rhombic'
];

const RADIUS = 10;

const paths = [];



gridtypes.forEach(
    (t, idx) => {
        const shift = idx * 25;

        // @ts-ignore because I CBA
        const grid = new Grid(t);

        for (let i = 0; i < 100; i++) {
            const path = grid.randomPathFromCenter(RADIUS);

            points.push(...path.map((v, idx) => (idx % 3) === 0 ? v + shift : v));
        }

        /* grid.directions.forEach(
            d => {
                for (let i = 1; i < RADIUS; i++) {
                    points.push(
                        i * d.x + shift,
                        i * d.y,
                        i * d.z
                    );
                }
            }
        ) */
    }
);

const geom = new THREE.BufferGeometry();
geom.setAttribute('position', new THREE.BufferAttribute(
    new Float32Array(points),
    3
));

const P = new THREE.Points(
    geom,
    new THREE.PointsMaterial()
);
scene.add(P);



let t = 0;

function animate(_t: number) {
    const dt = (_t - t) / 1000;
    t = _t;

    requestAnimationFrame(animate);


    orbCtrls.update();
    stats.update();


    renderer.render( scene, camera );
}

animate(0);