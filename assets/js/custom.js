import { OrbitControls } from '/assets/libjs/OrbitControls.js';
import { } from '/assets/libjs/socket.io.min.js';
// import { } from '/assets/libjs/yaml.min.js';
import { OBJLoader } from '/assets/libjs/OBJLoader.js';
import { MTLLoader } from '/assets/libjs/MTLLoader.js';

let namespace;
let wsuripath;
let connectStatus;
var data = {};
function readyPage() {
    namespace = "/apisocket0";
    wsuripath = "ws://2.57.186.96:5000/apisocket0"
    console.log("connect");
    const socket = io.connect(wsuripath);
    socket.on('connect', function () {
        console.log('Websocket connect', wsuripath);
        socket.emit('join', 0); //TODO shemeid
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

    socket.on('my_response', function (msg) {
        data = msg
        console.log(data)
    })
}


function main() {
    // readyPage()

    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({ canvas });

    const fov = 45;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 10, 20);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 5, 0);
    controls.update();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('black');


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

    function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
        const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
        const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
        const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
        // compute a unit vector that points in the direction the camera is now
        // in the xz plane from the center of the box
        const direction = (new THREE.Vector3())
            .subVectors(camera.position, boxCenter)
            .multiply(new THREE.Vector3(1, 0, 1))
            .normalize();

        // move the camera to a position distance units way from the center
        // in whatever direction the camera was from the center already
        camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

        // pick some near and far values for the frustum that
        // will contain the box.
        camera.near = boxSize / 100;
        camera.far = boxSize * 100;

        camera.updateProjectionMatrix();

        // point the camera to look at the center of the box
        camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
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


    function randomVelocity() {
        var dx = 0.001 + 0.003 * Math.random();
        var dy = 0.001 + 0.003 * Math.random();
        var dz = 0.001 + 0.003 * Math.random();
        if (Math.random() < 0.5) {
            dx = -dx;
        }
        if (Math.random() < 0.5) {
            dy = -dy;
        }
        if (Math.random() < 0.5) {
            dz = -dz;
        }
        return new THREE.Vector3(dx, dy, dz);
    }

    function makePointCloud(color, dx, dy, dz) {
        var MAX_POINTS = 10000;
        var spinSpeeds;
        var driftSpeeds;
        var i = 0;
        var material;
        var pointCloud;
        const points = [];

        spinSpeeds = new Array(MAX_POINTS);
        driftSpeeds = new Array(MAX_POINTS);
        var i = 0;
        var yaxis = new THREE.Vector3(1, 0, 1);
        while (i < MAX_POINTS) {
            var x = 2 * Math.random() - 1;
            var y = 2 * Math.random() - 1;
            var z = 2 * Math.random() - 1;
            if (x * x + y * y + z * z < 1) {  // only use points inside the unit sphere
                var yaxis = new THREE.Vector3(1, 0, 1);
                var angularSpeed = 10.001 + Math.random() / 5;  // angular speed of rotation about the y-axis
                spinSpeeds[i] = new THREE.Quaternion();
                spinSpeeds[i].setFromAxisAngle(yaxis, angularSpeed);  // The quaternian for rotation by angularSpeed radians about the y-axis.
                driftSpeeds[i] = randomVelocity();
                points.push(new THREE.Vector3(x + dx, y + dy, z + dz))
                i++;
            }
        }
        let geometry = new THREE.BufferGeometry().setFromPoints(points);
        material = new THREE.PointsMaterial({
            color: color,
            size: 2,
            sizeAttenuation: false
        });
        geometry.scale(300, 300, 300);
        pointCloud = new THREE.Points(geometry, material);
        return pointCloud;
    }

    {
        const color = 0xFF0000;
        const intensity = 1;
        const light = new THREE.PointLight(color, intensity);
        light.position.set(530, 10, -2720);
        scene.add(light);

        scene.add(makePointCloud('red', 0, 0, 0));
        scene.add(makePointCloud('green', 0.5, 1, 1));
        scene.add(makePointCloud('', 0.5, 1, 1));


        const helper = new THREE.PointLightHelper(light, 100);
        scene.add(helper);

        function updateLight() {
            helper.update();
        }

    }
    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    function render() {
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();
