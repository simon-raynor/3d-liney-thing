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
    //'square',
    //'hex',
    'cube',
    'rhombic'
];

const RADIUS = 7;

const paths: THREE.Vector3[][] = [];

const posns: number[] = [];


const PATHS_PER_TYPE = 25;

gridtypes.forEach(
    (t, idx) => {
        // @ts-ignore because I CBA
        const grid = new Grid(t);

        for (let i = 0; i < PATHS_PER_TYPE; i++) {
            const path = grid.randomPathFromCenter(RADIUS);

            paths.push(path);
        }
    }
);

const pathsTexture = new PathsTexture(paths);



const pathinfo: number[] = [];

const TRAIL_LENGTH = 100;

for (let i = 0; i < pathsTexture.paths.length; i++) {
    const p = (i + 0.5) / pathsTexture.HEIGHT; // which path we're on
    const l = pathsTexture.pathLengths[i]; // length of path
    const t = Math.random(); // random time offset

    for (let i = 0; i < TRAIL_LENGTH; i++) {
        pathinfo.push(
            p,
            l,
            t + ( i / (25 * l) ),
            i + 1
        );

        posns.push(0, 0, 0);
    }
}



const geom = new THREE.BufferGeometry();
geom.setAttribute('position', new THREE.BufferAttribute(
    new Float32Array(posns),
    3
));
geom.setAttribute('pathinfo', new THREE.BufferAttribute(
    new Float32Array(pathinfo),
    4
));


const material = new THREE.ShaderMaterial({
    uniforms: {
        pathsTexture: {
            value: pathsTexture.texture
        },
        t: {
            value: 0
        },
        totalradius: {
            value: RADIUS
        }
    },
    vertexShader: `
uniform sampler2D pathsTexture;
uniform float t;
uniform float totalradius;

varying float D;
varying float T;
varying float P;

attribute vec4 pathinfo;

void main() {
    float pathNumber = pathinfo.x;
    float pathLength = pathinfo.y;
    float randomOffset = pathinfo.z;
    float posnInPath = pathinfo.w;

    T = fract(
            randomOffset + (t / (pathLength * 200.))
        );

    T = (T * T);

    vec3 posn = texture2D(
        pathsTexture,
        vec2(
            T,
            pathNumber
        )
    ).xyz;

    D = length(posn) / (totalradius / 2.);

    P = (posnInPath / ${TRAIL_LENGTH}.);

    vec4 mvPosition = viewMatrix * vec4(posn, 1.0);

    gl_Position = projectionMatrix * mvPosition;

    float sizeMod = 500. * (1. + smoothstep(.9, 1., 1. - D))
                    * ((1. + (P)) * .5);

    gl_PointSize = ( sizeMod * ${
        /* TODO could this error? it's definitely bad lol */
        window.devicePixelRatio
    }. / -mvPosition.z );
}
    `,
    fragmentShader: `
varying float D;
varying float T;
varying float P;

void main() {
    float rad = length(gl_PointCoord-0.5);
    float a = smoothstep(0., .5, 1. - T)
            * (1. - smoothstep(.0, .45, rad))
            * (1. - smoothstep(.0, .45, rad))
            * P;
            //* (1. - D);

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