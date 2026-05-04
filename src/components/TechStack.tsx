import * as THREE from "three";
import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import {
  BallCollider,
  Physics,
  RigidBody,
  CylinderCollider,
  RapierRigidBody,
} from "@react-three/rapier";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const textureLoader = new THREE.TextureLoader();
const imageUrls = [
  "/images/react2.webp",
  "/images/next2.webp",
  "/images/node2.webp",
  "/images/express.webp",
  "/images/mongo.webp",
  "/images/mysql.webp",
  "/images/typescript.webp",
  "/images/javascript.webp",
];
const textures = imageUrls.map((url) => textureLoader.load(url));

// reduced from 30 → 20; material index pre-assigned so render is stable
const sphereGeometry = new THREE.SphereGeometry(1, 24, 24); // 24 segments vs 28 saves ~30% verts
const SPHERE_COUNT = 20;
const spheres = [...Array(SPHERE_COUNT)].map((_, i) => ({
  scale: [0.7, 1, 0.8, 1, 1][Math.floor(Math.random() * 5)],
  materialIndex: i % textures.length, // stable, no random on render
}));

type SphereProps = {
  vec?: THREE.Vector3;
  scale: number;
  r?: typeof THREE.MathUtils.randFloatSpread;
  material: THREE.MeshPhysicalMaterial;
  isActive: boolean;
};

function SphereGeo({
  vec = new THREE.Vector3(),
  scale,
  r = THREE.MathUtils.randFloatSpread,
  material,
  isActive,
}: SphereProps) {
  const api = useRef<RapierRigidBody | null>(null);

  useFrame((_state, delta) => {
    if (!isActive) return;
    delta = Math.min(0.1, delta);
    const impulse = vec
      .copy(api.current!.translation())
      .normalize()
      .multiply(
        new THREE.Vector3(
          -50 * delta * scale,
          -150 * delta * scale,
          -50 * delta * scale
        )
      );

    api.current?.applyImpulse(impulse, true);
  });

  return (
    <RigidBody
      linearDamping={0.75}
      angularDamping={0.15}
      friction={0.2}
      position={[r(20), r(20) - 25, r(20) - 10]}
      ref={api}
      colliders={false}
    >
      <BallCollider args={[scale]} />
      <CylinderCollider
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, 1.2 * scale]}
        args={[0.15 * scale, 0.275 * scale]}
      />
      <mesh
        castShadow
        receiveShadow
        scale={scale}
        geometry={sphereGeometry}
        material={material}
        rotation={[0.3, 1, 1]}
      />
    </RigidBody>
  );
}

type PointerProps = {
  vec?: THREE.Vector3;
  isActive: boolean;
};

function Pointer({ vec = new THREE.Vector3(), isActive }: PointerProps) {
  const ref = useRef<RapierRigidBody>(null);

  useFrame(({ pointer, viewport }) => {
    if (!isActive) return;
    const targetVec = vec.lerp(
      new THREE.Vector3(
        (pointer.x * viewport.width) / 2,
        (pointer.y * viewport.height) / 2,
        0
      ),
      0.2
    );
    ref.current?.setNextKinematicTranslation(targetVec);
  });

  return (
    <RigidBody
      position={[100, 100, 100]}
      type="kinematicPosition"
      colliders={false}
      ref={ref}
    >
      <BallCollider args={[2]} />
    </RigidBody>
  );
}

const TechStack = () => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let translateX = 0;
    const updateTranslateX = () => {
      const workEl = document.getElementById("work");
      if (!workEl) { translateX = 0; return; }
      const workFlex = workEl.querySelector(".work-flex") as HTMLElement | null;
      const lastBox = workEl.querySelector(".work-box:last-child") as HTMLElement | null;
      if (!workFlex || !lastBox) { translateX = 0; return; }
      // Use last box position to avoid ::before/::after pseudo-elements inflating scrollWidth
      const paddingRight = parseFloat(getComputedStyle(workFlex).paddingRight) || 0;
      translateX = Math.max(
        0,
        workFlex.offsetLeft + lastBox.offsetLeft + lastBox.offsetWidth + paddingRight - window.innerWidth
      );
    };

    const handleScroll = () => {
      const workEl = document.getElementById("work");
      if (!workEl) {
        setIsActive(false);
        return;
      }
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const threshold = workEl.offsetTop + translateX;
      setIsActive(scrollY > threshold);
    };

    // Initialize
    updateTranslateX();
    handleScroll();

    // Listen for resize to update translateX
    window.addEventListener("resize", updateTranslateX, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Also listen for clicks on header links to update after smooth scroll
    document.querySelectorAll(".header a").forEach((elem) => {
      const element = elem as HTMLAnchorElement;
      element.addEventListener("click", () => {
        const interval = setInterval(() => {
          updateTranslateX();
          handleScroll();
        }, 10);
        setTimeout(() => clearInterval(interval), 500);
      });
    });

    setTimeout(() => {
      ScrollTrigger.refresh();
      window.dispatchEvent(new Event("resize"));
    }, 500);

    return () => {
      window.removeEventListener("resize", updateTranslateX);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const materials = useMemo(() => {
    return textures.map(
      (texture) =>
        new THREE.MeshPhysicalMaterial({
          map: texture,
          emissive: "#ffffff",
          emissiveMap: texture,
          emissiveIntensity: 0.3,
          metalness: 0.5,
          roughness: 1,
          clearcoat: 0.1,
        })
    );
  }, []);

  return (
    <div className="techstack">
      <h2> My Techstack</h2>

      <Canvas
        shadows={false} // shadows disabled — not visible at this scale, saves GPU
        gl={{
          alpha: true,
          stencil: false,
          depth: false,
          antialias: false,
          powerPreference: "high-performance",
        }}
        camera={{ position: [0, 0, 20], fov: 32.5, near: 1, far: 100 }}
        onCreated={(state) => {
          state.gl.toneMappingExposure = 1.5;
          state.gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }}
        className="tech-canvas"
      >
        <ambientLight intensity={1} />
        <spotLight
          position={[20, 20, 25]}
          penumbra={1}
          angle={0.2}
          color="white"
          castShadow={false}
        />
        <directionalLight position={[0, 5, -4]} intensity={2} />
        <Physics gravity={[0, 0, 0]}>
          <Pointer isActive={isActive} />
          {spheres.map((props, i) => (
            <SphereGeo
              key={i}
              scale={props.scale}
              material={materials[props.materialIndex]}
              isActive={isActive}
            />
          ))}
        </Physics>
        <Environment
          files="/models/char_enviorment.hdr"
          environmentIntensity={0.5}
          environmentRotation={[0, 4, 2]}
        />
        {/* N8AO removed — ambient occlusion on 20 bouncing spheres is the #1 GPU bottleneck */}
      </Canvas>
    </div>
  );
};

export default TechStack;
