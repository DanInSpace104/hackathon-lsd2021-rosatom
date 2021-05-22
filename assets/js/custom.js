import {OrbitControls} from '/assets/libjs/OrbitControls.js';
import {} from '/assets/libjs/socket.io.min.js';
// import {readyPage} from "./wsocket-flask.js";
// import {myfunc} from '/assets/js/custom.js';

let namespace;
let wsuripath;
var connectStatus;
var  myfunc;

function readyPage() {
    namespace = "/apisocket0"; //TODO в конфигах
    wsuripath = "ws://127.0.0.1:5000/apisocket0" //2.57.186.96
    console.log("connect"); //location.protocol + '//' + document.domain + ':' + location.port + namespace
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
    socket.on('my_response', function (msg) { console.log(msg) } ); //myfunc();
    socket.on('my_message', function (msg) { console.log(msg) })
}




function main() {
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
    gltfLoader.load('/assets/scheme/scene.gltf', (gltf) => {
      const root = gltf.scene;
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

  myfunc = function(msg) {
    var i;
    var text;
    var lights;
    lights = [{'x': 5, 'y': 10, 'z': 2}, {'x': 5, 'y': 5, 'z': 2}, {'x': 3, 'y': 2, 'z': 1}, {'x': 5, 'y': 1, 'z': 2},
      {'x': 5, 'y': 5, 'z': 3}, {'x': 3, 'y': 15, 'z': 14}, {'x': 1750, 'y': 450, 'z': -2700}, {
        'x': 1750,
        'y': 450,
        'z': -2700
      }
      , {'x': 1750, 'y': 450, 'z': -3270}, {'x': 1500, 'y': 450, 'z': -2700}, {'x': 2000, 'y': 450, 'z': -300}]

    for (i = 0; i < lights.length; i++) {
      // const color = 0xFF8844;
      // const intensity = 0.1;
      // const light = new THREE.AmbientLight(color, intensity);
      // light.position.set(lights[i]['x'], lights[i]['y'], lights[i]['z']);
      // scene.add(light);
      // scene.add(light.target);
      let bulbLight, bulbMat, hemiLight, stats;
      let ballMat, cubeMat, floorMat;
      const bulbGeometry = new THREE.SphereGeometry(200, 16, 8);
      bulbLight = new THREE.PointLight(0xffee88, 1, 100, 2);

      bulbMat = new THREE.MeshStandardMaterial({
        emissive: 0xffffee,
        emissiveIntensity: 1,
        color: 0x000000
      });

      console.log(msg);
      bulbLight.add(new THREE.Mesh(bulbGeometry, bulbMat));
      bulbLight.position.set(lights[i]['x'], lights[i]['y'], lights[i]['z']);
      bulbLight.castShadow = true;
      bulbLight.decay = 100
      bulbLight.power = 300
      scene.add(bulbLight);
    }
  }
  let hemiLight;
  hemiLight = new THREE.HemisphereLight( 0xddeeff, 0x0f0e0d, 0.02 );
  scene.add( hemiLight );



//   var geometry = new THREE.CylinderBufferGeometry(200, 5, 20, 16, 4, true);
// geometry.computeBoundingBox();
// var material = new THREE.ShaderMaterial({
//   uniforms: {
//     color1: {
//       value: new THREE.Color("red")
//     },
//     color2: {
//       value: new THREE.Color("purple")
//     },
//     bboxMin: {
//       value: geometry.boundingBox.min
//     },
//     bboxMax: {
//       value: geometry.boundingBox.max
//     }
//   },
//   vertexShader: `
//     uniform vec3 bboxMin;
//     uniform vec3 bboxMax;
//
//     varying vec2 vUv;
//
//     void main() {
//       vUv.y = (position.y - bboxMin.y) / (bboxMax.y - bboxMin.y);
//       gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
//     }
//   `,
//   fragmentShader: `
//     uniform vec3 color1;
//     uniform vec3 color2;
//
//     varying vec2 vUv;
//
//     void main() {
//
//       gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
//     }
//   `,
//   wireframe: true
// });
//
//   scene.add(new THREE.Mesh(geometry, material));

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
