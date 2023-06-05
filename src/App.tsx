import "./App.css";
import * as THREE from "three";
import { useEffect, useRef } from "react";
import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader";

const FOV = 75;
const NEAR_CLIPPING_PLANE = 0.1;
const FAR_CLIPPING_PLANE = 1000;
const MODEL_SCALE = 0.0008;
const MODEL_ROTATION_SPEED = 0.006;
const MIXER_UPDATE_RATE = 0.4;
const LIGHT_COLOR = 0xffffff;
const LIGHT_INTENSITY = 1;

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const sizesRef = useRef({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    // SCENE
    const scene: THREE.Scene = new THREE.Scene();
    // CAMERA
    const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
      FOV, // FOV
      sizesRef.current.width / sizesRef.current.height, // Aspect Ratio
      NEAR_CLIPPING_PLANE, // Near Clipping Plane
      FAR_CLIPPING_PLANE // Far Clipping Plane
    );
    camera.position.set(0, 0.1, 2.2);

    // RENDERER
    const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current!,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(sizesRef.current.width, sizesRef.current.height);
    renderer.setPixelRatio(window.devicePixelRatio);

    // MODEL
    const gltfLoader: GLTFLoader = new GLTFLoader();
    gltfLoader.load(
      "./models/scene.gltf",
      (gltf: GLTF) => {
        const model = gltf.scene;
        modelRef.current = model;
        model.scale.set(MODEL_SCALE, MODEL_SCALE, MODEL_SCALE);
        model.rotation.y = Math.PI / 2;
        scene.add(model);

        const mixer = new THREE.AnimationMixer(model);
        mixerRef.current = mixer;
        const clips = gltf.animations;
        clips.forEach((clip: THREE.AnimationClip) => {
          mixer.clipAction(clip).play();
        });
      },
      undefined,
      (error: ErrorEvent) => {
        console.error("An error occurred while loading the GLTF model:", error);
      }
    );

    // LIGHTS
    const ambientLight: THREE.AmbientLight = new THREE.AmbientLight(
      LIGHT_COLOR,
      LIGHT_INTENSITY
    );
    const pointLight: THREE.PointLight = new THREE.PointLight(
      LIGHT_COLOR,
      2,
      100
    );
    scene.add(ambientLight);
    scene.add(pointLight);

    // RESIZE
    const handleResize = () => {
      sizesRef.current.width = window.innerWidth;
      sizesRef.current.height = window.innerHeight;
      renderer.setSize(sizesRef.current.width, sizesRef.current.height);
      camera.aspect = sizesRef.current.width / sizesRef.current.height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    // ANIMATE
    const animate = () => {
      requestAnimationFrame(animate);
      const model = modelRef.current;
      const mixer = mixerRef.current;
      if (model && mixer) {
        model.rotation.y += MODEL_ROTATION_SPEED;
        mixer.update(MIXER_UPDATE_RATE);
        renderer.render(scene, camera);
      }
    };
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} id="canvas" />;
}

export default App;
