import {OrbitControls} from '/assets/libjs/OrbitControls.js';
import {} from '/assets/libjs/socket.io.min.js';
import {} from '/assets/libjs/yaml.min.js';

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
        // data[msg.uuid] = msg
        // console.log(data.length)
        console.log(msg.uuid)
    })
    socket.on('my_message', function (msg) {
        data[msg['uuid']] = msg
    })
}


function main() {
    let schemeObject = YAML.load("/assets/scheme/sheme1.yaml")
    console.log(schemeObject)
    readyPage();
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({canvas});

    const fov = 45;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 10, 20);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 5, 0);
    controls.update();
    var mesh;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('black');

    {
        const planeSize = 40;

        const loader = new THREE.TextureLoader();
        const texture = loader.load('https://threejsfundamentals.org/threejs/resources/images/checker.png');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.NearestFilter;
        const repeats = planeSize / 2;
        texture.repeat.set(repeats, repeats);

        const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
        const planeMat = new THREE.MeshPhongMaterial({
            map: texture,
            side: THREE.DoubleSide,
        });
        mesh = new THREE.Mesh(planeGeo, planeMat);
        mesh.rotation.x = Math.PI * -.5;
        scene.add(mesh);
    }

    {
        const skyColor = 0xB1E1FF;  // light blue
        const groundColor = 0xB97A20;  // brownish orange
        const intensity = 1;
        const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        scene.add(light);
    }

    {
        const gltfLoader = new GLTFLoader();
        gltfLoader.load('/assets/scene.gltf', (gltf) => {
            var root = gltf.scene;
            root.transparent = true
            scene.add(root);

            // compute the box that contains all the stuff
            // from root and below
            const box = new THREE.Box3().setFromObject(root);

            const boxSize = box.getSize(new THREE.Vector3()).length();
            const boxCenter = box.getCenter(new THREE.Vector3());

            // set the camera to frame the box
            frameArea(boxSize * 0.5, boxSize, boxCenter, camera);

            // update the Trackball controls to handle the new size
            controls.maxDistance = boxSize * 10;
            controls.target.copy(boxCenter);
            controls.update();
        });
    }

    schemeObject = schemeObject['SensorParams']
    for (let i = 0; i < schemeObject.length; i++) {

        let bulbLight, bulbMat;

        const bulbGeometry = new THREE.SphereGeometry(schemeObject[i]['size'][0] / 2, 16, 8);
        bulbLight = new THREE.PointLight(0xffffff, 1, 100, 2);
        bulbLight.name = schemeObject[i]['uuid']
        let color = 0xffff00
        if (bulbLight.name in data) {
            color = new THREE.Color(0xf20000);
        }
        bulbMat = new THREE.MeshStandardMaterial({
            emissive: color,
            emissiveIntensity: 1,
            color: 0xf20000
        });

        bulbLight.add(new THREE.Mesh(bulbGeometry, bulbMat));
        bulbLight.position.set(schemeObject[i]['size'][0], schemeObject[i]['size'][1], schemeObject[i]['size'][2]);
        bulbLight.decay = 10
        bulbLight.power = 3000
        scene.add(bulbLight);

    }
    let hemiLight;
    hemiLight = new THREE.HemisphereLight(0xddeeff, 0x0f0e0d, 0.02);
    scene.add(hemiLight);


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

        scene.getObjectByName('')
        camera.updateProjectionMatrix();

        // point the camera to look at the center of the box
        camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
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
        // console.log(data)
        // scene.getObjectByName('light1').position.set(data.val,100,200)
        renderer.render(scene, camera);
        // scene.getObjectByName('light2').material.color.set("rgb(255, 0, 0)");
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();

function myfunc(msg) {
    console.log(msg);
}
