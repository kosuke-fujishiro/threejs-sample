import "./App.css";
import * as THREE from "three";
import { useEffect } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

function App() {
  let canvas: HTMLCanvasElement;
  let model: THREE.Group;

  useEffect(() => {
    canvas = document.getElementById("canvas") as HTMLCanvasElement;

    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // SCENE
    const scene: THREE.Scene = new THREE.Scene();

    // CAMERA
    const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
      75, // FOV
      sizes.width / sizes.height, // Aspect Ratio
      0.1, // Near Clipping Plane
      1000 // Far Clipping Plane
    );
    camera.position.set(0, 0.1, 2.2);

    // RENDERER
    const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(window.devicePixelRatio);

    // MODEL
    let mixer: THREE.AnimationMixer;
    const gltfLoader: GLTFLoader = new GLTFLoader();
    gltfLoader.load("./models/scene.gltf", (gltf: any) => {
      model = gltf.scene;
      model.scale.set(0.0008, 0.0008, 0.0008);
      model.rotation.y = Math.PI / 2;
      scene.add(model);

      mixer = new THREE.AnimationMixer(model);
      const clips = gltf.animations;
      clips.forEach((clip: any) => {
        mixer.clipAction(clip).play();
      });
    });

    // LIGHTS
    const ambientLight: THREE.AmbientLight = new THREE.AmbientLight(
      0xffffff,
      1
    );
    const pointLight: THREE.PointLight = new THREE.PointLight(0xffffff, 2, 100);
    scene.add(ambientLight);
    scene.add(pointLight);

    // ANIMATE
    const animate = () => {
      requestAnimationFrame(animate);
      if (model) {
        model.rotation.y += 0.006;
      }
      if (mixer) {
        mixer.update(0.4);
      }
      renderer.render(scene, camera);
    };
    animate();
  }, []);

  return <canvas id="canvas" />;
}

export default App;
