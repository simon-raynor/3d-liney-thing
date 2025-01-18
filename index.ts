import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Grid from './Grid';
import PathsTexture from './PathsTexture';


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



const gridtypes = [
    'square',
    'hex',
    'cube',
    'rhombic'
];

const RADIUS = 10;

const paths: THREE.Vector3[][] = [];

gridtypes.forEach(
    (t, idx) => {
        const shift = new THREE.Vector3(idx * 25, 0, 0);

        // @ts-ignore because I CBA
        const grid = new Grid(t);

        for (let i = 0; i < 128; i++) {
            const path = grid.randomPathFromCenter(RADIUS);

            paths.push(path.map(v => v.add(shift)));
        }
    }
);

const pathsTexture = new PathsTexture(paths);



const points: number[] = [];

const TRAIL_LENGTH = 200;

for (let i = 0; i < pathsTexture.paths.length; i++) {
    const p = (i + 0.5) / pathsTexture.HEIGHT; // which path we're on
    const l = pathsTexture.pathLengths[i]; // length of path
    const t = Math.random(); // random time offset

    for (let i = 0; i < TRAIL_LENGTH; i++) {
        points.push(
            p,
            l,
            t + ( i / (25 * l) )
        );
    }
}



const geom = new THREE.BufferGeometry();
geom.setAttribute('position', new THREE.BufferAttribute(
    new Float32Array(points),
    3
));


const material = new THREE.ShaderMaterial({
    uniforms: {
        pathsTexture: {
            value: pathsTexture.texture
        },
        t: {
            value: 0
        }
    },
    vertexShader: `
uniform sampler2D pathsTexture;

uniform float t;

varying float T;

void main() {
    T = fract(
            position.z + (t / (position.y * 500.))
        );

    vec3 posn = texture2D(
        pathsTexture,
        vec2(
            T,
            position.x
        )
    ).xyz;

    vec4 mvPosition = viewMatrix * vec4(posn, 1.0);

    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = ( 75. / -mvPosition.z );
}
    `,
    fragmentShader: `
varying float T;

void main() {
    float rad = length(gl_PointCoord-0.5);
    float a = smoothstep(0., .1, 1. - T)
            * (1. - smoothstep(0., .5, rad));

    gl_FragColor = vec4(1., 1., 1., a);
}
    `,

    transparent: true,
    depthTest: false
});


const P = new THREE.Points(
    geom,
    material
);
P.frustumCulled = false;

scene.add(P);



let t = 0;

function animate(_t: number) {
    const dt = (_t - t) / 1000;
    t = _t;
    material.uniforms.t.value = t;

    requestAnimationFrame(animate);


    orbCtrls.update();
    stats.update();


    renderer.render( scene, camera );
}

animate(0);