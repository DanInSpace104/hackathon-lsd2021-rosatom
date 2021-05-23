import * as THREE from '/assets/libjs/three.module.js';

import { } from '/assets/libjs/socket.io.min.js';
import { } from '/assets/libjs/yaml.min.js';
import { OrbitControls } from '/assets/libjs/OrbitControls.js';
import { OBJLoader } from '/assets/libjs/OBJLoader.js';
import { MTLLoader } from '/assets/libjs/MTLLoader.js';
import Stats from '/assets/libjs/stats.module.js';


let config = YAML.load("/assets/scheme/sheme1.yaml")['SensorParams']
let data

const resolution = 100
const STEP = 0.14
const field = [] // 2d array
const particles = resolution * resolution
for (let i = 0; i < resolution; i++) {
    field.push([])
    for (let j = 0; j < resolution; j++) {
        field[i].push(0)
    }
}
const NET_ZERO_X = -5
const NET_ZERO_Z = -5
const HEIGHT = 3.3
const SIZE = 0.3

let namespace;
let wsuripath;
let connectStatus;
function readyPage() {
    namespace = "/apisocket0";
    wsuripath = "ws://2.57.186.96:5000/apisocket2"
    console.log("connect");
    const socket = io.connect(wsuripath);
    socket.on('connect', function () {
        console.log('Websocket connect', wsuripath);
        socket.emit('join', 0);
        connectStatus = 1;
    });

    socket.on('connection', function () {
        console.log('Websocket connection');
        connectStatus = 2;
    });

    socket.on('disconnect', function () {
        console.log('Websocket disconnect');
        connectStatus = -1;
    });

    socket.on('my_response_electro', function (msg) {
        // console.log(msg)
        console.log(msg,'hello')
        data = msg
    })
}

let container, stats;

let camera, scene, renderer;

let points;
var geometry

init();
animate();

function init() {
    readyPage()

    const canvas = document.getElementById('c');

    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 5, 3500);
    camera.position.z = 40;
    camera.position.x = 40;
    camera.position.y = 15;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    scene.fog = new THREE.Fog(0x050505, 2000, 3500);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 5, 0);
    controls.update();
    {
        const skyColor = 0xB1E1FF;  // light blue
        const groundColor = 0xB97A20;  // brownish orange
        const intensity = 0.5;
        const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        scene.add(light);
    }
    {
        const color = 0xFFFFFF;
        const intensity = 0.5;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(5, 10, 2);
        scene.add(light);
        scene.add(light.target);
    }
    const objLoader = new OBJLoader();
    const mtlLoader = new MTLLoader();
    mtlLoader.load('/assets/scheme/sha3.mtl', (mtl) => {
        mtl.preload();
        objLoader.setMaterials(mtl);
        objLoader.load('/assets/scheme/sha3.obj', (root) => {
            scene.add(root);
        });
    });

    let geometry = new THREE.BufferGeometry();

    const positions = [];
    var colors = [];

    const color = new THREE.Color();

    const n = 5, n2 = n / 2; // particles spread in the cube

    for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution; j++) {
            const x = NET_ZERO_X + i * STEP;
            const y = HEIGHT;
            const z = NET_ZERO_Z + j * STEP;
            positions.push(x, y, z);

            const vx = (x / n) + 0.5;
            const vy = (y / n) + 0.5;
            const vz = (z / n) + 0.5;
            color.setRGB(1, 1, 1);
            colors.push(color.r, color.g, color.b);
        }

    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    geometry.computeBoundingSphere();

    //

    let material = new THREE.PointsMaterial({ size: SIZE, vertexColors: true });

    points = new THREE.Points(geometry, material);
    scene.add(points);

    geometry = new THREE.BoxGeometry( 1, 1, 0.4 );
    material = new THREE.MeshBasicMaterial( {color: "rgb(255, 186, 0)"} );
    let cube = new THREE.Mesh( geometry, material );
    cube.position.set(-4.5,2,4.8)
    scene.add( cube );

    geometry = new THREE.BoxGeometry(1, 1, 0.4 );
    material = new THREE.MeshBasicMaterial( {color: "rgb(255, 186, 0)"} );
    cube = new THREE.Mesh( geometry, material );
    cube.position.set(8.5,2,6)
    scene.add( cube );

    geometry = new THREE.BoxGeometry( 0.8, 0.8, 0.2 );
    material = new THREE.MeshBasicMaterial( {color: "rgb(255, 186, 0)"} );
    cube = new THREE.Mesh( geometry, material );
    cube.position.set(-4.2,2,-5.2)
    scene.add( cube );

    geometry = new THREE.BoxGeometry( 0.8, 0.8, 0.2 );
    material = new THREE.MeshBasicMaterial( {color: "rgb(255, 186, 0)"} );
    cube = new THREE.Mesh( geometry, material );
    cube.position.set(7,2,-3.2)
    scene.add( cube );
    renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);


    //

    stats = new Stats();
    canvas.appendChild(stats.dom);

    //

    window.addEventListener('resize', onWindowResize);

}


function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

//
var counter = 0
function animate() {
    counter++
    requestAnimationFrame(animate);

    render();
    stats.update();

    const positions = [];
    var colors = [];

    const color = new THREE.Color();


    colors = [];

    for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution; j++) {
            // console.log(data)
            colors.push(data[i][j][0] / 255, data[i][j][1] / 255, data[i][j][2] / 255)
            // console.log(data[i][j])
        }
    }

    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

}

function render() {

    renderer.render(scene, camera);

}
