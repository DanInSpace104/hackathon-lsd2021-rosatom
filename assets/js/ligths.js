import {OrbitControls} from '/assets/js/OrbitControls.js';


function main() {
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

  //   {
  //   const gltfLoader = new GLTFLoader();
  //   gltfLoader.load('/assets/scene.gltf', (gltf) => {
  //     const root = gltf.scene;
  //     scene.add(root);
  //
  //     // compute the box that contains all the stuff
  //     // from root and below
  //     const box = new THREE.Box3().setFromObject(root);
  //
  //     const boxSize = box.getSize(new THREE.Vector3()).length();
  //     const boxCenter = box.getCenter(new THREE.Vector3());
  //
  //     // set the camera to frame the box
  //     frameArea(boxSize * 0.5, boxSize, boxCenter, camera);
  //
  //     // update the Trackball controls to handle the new size
  //     controls.maxDistance = boxSize * 10;
  //     controls.target.copy(boxCenter);
  //     controls.update();
  //   });
  // }
  var i;
  var text;
  var lights;
  lights = [{'x':5,'y':10,'z':2}, {'x':5,'y':5,'z':2},{'x':3,'y':2,'z':1},{'x':5,'y':1,'z':2},
  {'x':5,'y':5,'z':3},{'x':3,'y':15,'z':14}]

  for (i = 0; i < lights.length; i++) {
    // const color = 0xFF8844;
    // const intensity = 0.1;
    // const light = new THREE.AmbientLight(color, intensity);
    // light.position.set(lights[i]['x'], lights[i]['y'], lights[i]['z']);
    // scene.add(light);
    // scene.add(light.target);
    let bulbLight, bulbMat, hemiLight, stats;
    let ballMat, cubeMat, floorMat;
    const bulbGeometry = new THREE.SphereGeometry(0.2, 16, 8);
    bulbLight = new THREE.PointLight(0xffee88, 1, 100, 2);

    bulbMat = new THREE.MeshStandardMaterial({
      emissive: 0xffffee,
      emissiveIntensity: 1,
      color: 0x000000
    });
    bulbLight.add(new THREE.Mesh(bulbGeometry, bulbMat));
    bulbLight.position.set(lights[i]['x'],lights[i]['y'],lights[i]['z']);
    bulbLight.castShadow = true;
    bulbLight.decay = 10
    bulbLight.power = 30
    scene.add(bulbLight);
  }
  let hemiLight;
  hemiLight = new THREE.HemisphereLight( 0xddeeff, 0x0f0e0d, 0.02 );
  scene.add( hemiLight );

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