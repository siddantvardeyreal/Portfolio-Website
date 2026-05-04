import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import setCharacter from "./utils/character";
import setLighting from "./utils/lighting";
import { useLoading } from "../../context/LoadingProvider";
import handleResize from "./utils/resizeUtils";
import {
  handleMouseMove,
  handleTouchEnd,
  handleHeadRotation,
  handleTouchMove,
} from "./utils/mouseUtils";
import setAnimations from "./utils/animationUtils";

// Loading screen close timing (ms): 600 loaded + 1000 isLoaded + 900 click animation
const INTRO_DELAY = 2600;

const Scene = () => {
  const canvasDiv = useRef<HTMLDivElement | null>(null);
  const hoverDivRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef(new THREE.Scene());
  const { setLoading } = useLoading();

  const [character, setChar] = useState<THREE.Object3D | null>(null);

  useEffect(() => {
    if (!canvasDiv.current) return;

    let cancelled = false;

    const rect = canvasDiv.current.getBoundingClientRect();
    const container = { width: rect.width, height: rect.height };
    const scene = sceneRef.current;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: window.devicePixelRatio < 2,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.width, container.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    canvasDiv.current.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(
      14.5,
      container.width / container.height,
      0.1,
      1000
    );
    camera.position.set(0, 13.1, 24.7);
    camera.zoom = 1.1;
    camera.updateProjectionMatrix();

    let headBone: THREE.Object3D | null = null;
    let screenLight: any = null;
    let mixer: THREE.AnimationMixer;
    const clock = new THREE.Clock();
    const light = setLighting(scene);
    const { loadCharacter } = setCharacter(renderer, scene, camera);

    // pass setLoading directly — character.ts drives real progress
    loadCharacter(setLoading).then((gltf) => {
      if (!gltf || cancelled) return;

      const animations = setAnimations(gltf);
      hoverDivRef.current && animations.hover(gltf, hoverDivRef.current);
      mixer = animations.mixer;

      const character = gltf.scene;
      setChar(character);
      scene.add(character);
      headBone = character.getObjectByName("spine006") ?? null;
      screenLight = character.getObjectByName("screenlight") ?? null;

      // signal 100% so the loading screen begins its close animation
      setLoading(100);

      // start intro after loading screen finishes closing
      setTimeout(() => {
        light.turnOnLights();
        animations.startIntro();
      }, INTRO_DELAY);

      window.addEventListener("resize", () =>
        handleResize(renderer, camera, canvasDiv, character)
      );
    });

    let mouse = { x: 0, y: 0 };
    let interpolation = { x: 0.1, y: 0.2 };

    const onMouseMove = (event: MouseEvent) =>
      handleMouseMove(event, (x, y) => (mouse = { x, y }));

    let debounce: ReturnType<typeof setTimeout> | undefined;
    const onTouchStart = (event: TouchEvent) => {
      const element = event.target as HTMLElement;
      debounce = setTimeout(() => {
        element?.addEventListener("touchmove", (e: TouchEvent) =>
          handleTouchMove(e, (x, y) => (mouse = { x, y }))
        );
      }, 200);
    };
    const onTouchEnd = () =>
      handleTouchEnd((x, y, ix, iy) => {
        mouse = { x, y };
        interpolation = { x: ix, y: iy };
      });

    document.addEventListener("mousemove", onMouseMove);
    const landingDiv = document.getElementById("landingDiv");
    landingDiv?.addEventListener("touchstart", onTouchStart);
    landingDiv?.addEventListener("touchend", onTouchEnd);

    let rafId: number;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      if (document.hidden) return; // pause when tab not visible
      if (headBone) {
        handleHeadRotation(
          headBone,
          mouse.x,
          mouse.y,
          interpolation.x,
          interpolation.y,
          THREE.MathUtils.lerp
        );
        light.setPointLight(screenLight);
      }
      mixer?.update(clock.getDelta());
      renderer.render(scene, camera);
    };
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      clearTimeout(debounce);
      scene.clear();
      renderer.dispose();
      document.removeEventListener("mousemove", onMouseMove);
      landingDiv?.removeEventListener("touchstart", onTouchStart);
      landingDiv?.removeEventListener("touchend", onTouchEnd);
      if (canvasDiv.current?.contains(renderer.domElement)) {
        canvasDiv.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="character-container">
      <div className="character-model" ref={canvasDiv}>
        <div className="character-rim"></div>
        <div className="character-hover" ref={hoverDivRef}></div>
      </div>
    </div>
  );
};

export default Scene;
