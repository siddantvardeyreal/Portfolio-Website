import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";

const setCharacter = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
) => {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(dracoLoader);

  const loadCharacter = async (
    onProgress?: (percent: number) => void
  ): Promise<GLTF | null> => {
    onProgress?.(5);

    try {
      // Use loader.load (not loadAsync) so we get the onProgress ProgressEvent
      const gltf = await new Promise<GLTF>((resolve, reject) => {
        let simPercent = 5;
        let simInterval: ReturnType<typeof setInterval> | null = null;

        loader.load(
          "/models/character.glb",
          (loaded) => {
            // download done — clear any simulated progress
            if (simInterval) clearInterval(simInterval);
            resolve(loaded);
          },
          (event) => {
            if (event.lengthComputable) {
              // real bytes: map 0-100% download → 5-85% on the loading bar
              const p = 5 + Math.round((event.loaded / event.total) * 80);
              onProgress?.(p);
            } else {
              // server didn't send Content-Length — simulate smooth progress toward 80%
              if (!simInterval) {
                simInterval = setInterval(() => {
                  if (simPercent < 80) {
                    simPercent = Math.min(80, simPercent + 2);
                    onProgress?.(simPercent);
                  } else {
                    clearInterval(simInterval!);
                    simInterval = null;
                  }
                }, 200);
              }
            }
          },
          reject
        );
      });

      onProgress?.(88); // parsing done
      const character = gltf.scene;

      // compileAsync pushes shader compilation off the main render loop
      await renderer.compileAsync(character, camera, scene);
      onProgress?.(95); // GPU compile done

      // defer traverse to idle so it doesn't block frames
      await yieldToIdle(() => {
        character.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            (child as THREE.Mesh).frustumCulled = true;
          }
        });
      });

      setCharTimeline(character, camera);
      setAllTimeline();

      const footR = character.getObjectByName("footR");
      const footL = character.getObjectByName("footL");
      if (footR) footR.position.y = 3.36;
      if (footL) footL.position.y = 3.36;

      dracoLoader.dispose();
      onProgress?.(99);
      return gltf;
    } catch (err) {
      console.error("Error loading character:", err);
      onProgress?.(100); // unblock loading screen even on error
      return null;
    }
  };

  return { loadCharacter };
};

function yieldToIdle(fn: () => void): Promise<void> {
  return new Promise((resolve) => {
    const run = () => { fn(); resolve(); };
    if ("requestIdleCallback" in window) {
      requestIdleCallback(run, { timeout: 2000 });
    } else {
      setTimeout(run, 0);
    }
  });
}

export default setCharacter;
