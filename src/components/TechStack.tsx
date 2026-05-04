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

const skills = [
  { name: "Python",       color: "#8b5cf6" },
  { name: "Node.js",      color: "#10b981" },
  { name: "TypeScript",   color: "#3b82f6" },
  { name: "LangChain",    color: "#f59e0b" },
  { name: "LLM APIs",     color: "#ec4899" },
  { name: "RAG",          color: "#06b6d4" },
  { name: "RLHF",         color: "#a855f7" },
  { name: "Prompt Eng.",  color: "#f97316" },
  { name: "Hugging Face", color: "#facc15" },
  { name: "Docker",       color: "#38bdf8" },
  { name: "AWS",          color: "#fb923c" },
  { name: "FAISS",        color: "#4ade80" },
  { name: "Pinecone",     color: "#e879f9" },
  { name: "REST APIs",    color: "#34d399" },
  { name: "CI/CD",        color: "#60a5fa" },
  { name: "Git",          color: "#f87171" },
];

function createSkillTexture(name: string, color: string): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fillStyle = "#0e0c1a";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 5, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 6;
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const words = name.split(" ");
  const len = name.replace(/ /g, "").length;
  const fontSize = len <= 3 ? 46 : len <= 6 ? 36 : len <= 9 ? 28 : len <= 12 ? 22 : 17;
  ctx.font = `700 ${fontSize}px Arial, sans-serif`;

  if (words.length === 1) {
    ctx.fillText(name, size / 2, size / 2);
  } else {
    const lineH = fontSize * 1.25;
    const half = Math.ceil(words.length / 2);
    ctx.fillText(words.slice(0, half).join(" "), size / 2, size / 2 - lineH / 2);
    ctx.fillText(words.slice(half).join(" "), size / 2, size / 2 + lineH / 2);
  }

  return new THREE.CanvasTexture(canvas);
}

const textures = skills.map((s) => createSkillTexture(s.name, s.color));

const sphereGeometry = new THREE.SphereGeometry(1, 24, 24);
const spheres = skills.map((_, i) => ({
  scale: [0.7, 1, 0.8, 1, 1][Math.floor(Math.random() * 5)],
  materialIndex: i,
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
      (texture, i) =>
        new THREE.MeshPhysicalMaterial({
          map: texture,
          emissive: skills[i].color,
          emissiveIntensity: 0.15,
          metalness: 0.2,
          roughness: 0.7,
          clearcoat: 0.4,
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

      <div className="skill-tags">
        {skills.map((skill) => (
          <span
            key={skill.name}
            className="skill-tag"
            style={{
              borderColor: skill.color,
              color: skill.color,
              boxShadow: `0 0 8px ${skill.color}30`,
            }}
          >
            {skill.name}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TechStack;
