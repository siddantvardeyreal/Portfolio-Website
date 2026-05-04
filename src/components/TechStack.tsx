import * as THREE from "three";
import { useRef, useMemo, useState, useEffect, useCallback } from "react";
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

type Category = "genai" | "aiml" | "frameworks" | "backend" | "devops";

const categoryConfig: Record<Category, { label: string; color: string }> = {
  genai:      { label: "GenAI / LLM",  color: "#8b5cf6" },
  aiml:       { label: "AI / ML",       color: "#3b82f6" },
  frameworks: { label: "Frameworks",    color: "#06b6d4" },
  backend:    { label: "Backend",       color: "#10b981" },
  devops:     { label: "DevOps",        color: "#f59e0b" },
};

const skills: { name: string; category: Category }[] = [
  { name: "RAG",          category: "genai" },
  { name: "RLHF",         category: "genai" },
  { name: "LLM APIs",     category: "genai" },
  { name: "Prompt Eng.",  category: "genai" },
  { name: "Hugging Face", category: "aiml" },
  { name: "FAISS",        category: "aiml" },
  { name: "Pinecone",     category: "aiml" },
  { name: "LangChain",    category: "frameworks" },
  { name: "REST APIs",    category: "frameworks" },
  { name: "Python",       category: "backend" },
  { name: "Node.js",      category: "backend" },
  { name: "TypeScript",   category: "backend" },
  { name: "AWS",          category: "backend" },
  { name: "Docker",       category: "devops" },
  { name: "CI/CD",        category: "devops" },
  { name: "Git",          category: "devops" },
];

const sphereGeometry = new THREE.SphereGeometry(1, 24, 24);

const sphereData = skills.map((skill, i) => ({
  scale: ([0.7, 1, 0.8, 1, 1] as const)[i % 5],
  color: categoryConfig[skill.category].color,
  name: skill.name,
}));

type SphereProps = {
  vec?: THREE.Vector3;
  scale: number;
  r?: typeof THREE.MathUtils.randFloatSpread;
  color: string;
  isActive: boolean;
  isHovered: boolean;
  onPointerOver: (e: any) => void;
  onPointerMove: (e: any) => void;
  onPointerOut: () => void;
};

function SphereGeo({
  vec = new THREE.Vector3(),
  scale,
  r = THREE.MathUtils.randFloatSpread,
  color,
  isActive,
  isHovered,
  onPointerOver,
  onPointerMove,
  onPointerOut,
}: SphereProps) {
  const api = useRef<RapierRigidBody | null>(null);

  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.12,
        metalness: 0.3,
        roughness: 0.4,
        clearcoat: 0.6,
      }),
    [color]
  );

  useFrame((_state, delta) => {
    material.emissiveIntensity = THREE.MathUtils.lerp(
      material.emissiveIntensity,
      isHovered ? 0.85 : 0.12,
      0.12
    );

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
        onPointerOver={(e) => { e.stopPropagation(); onPointerOver(e); }}
        onPointerMove={(e) => { e.stopPropagation(); onPointerMove(e); }}
        onPointerOut={onPointerOut}
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

type Tooltip = { x: number; y: number; name: string; color: string };

const TechStack = () => {
  const [isActive, setIsActive] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  const handlePointerOver = useCallback(
    (index: number, name: string, color: string, e: any) => {
      setHoveredIndex(index);
      setTooltip({ x: e.clientX, y: e.clientY, name, color });
    },
    []
  );

  const handlePointerMove = useCallback((e: any) => {
    setTooltip((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null));
  }, []);

  const handlePointerOut = useCallback(() => {
    setHoveredIndex(null);
    setTooltip(null);
  }, []);

  useEffect(() => {
    let translateX = 0;
    const updateTranslateX = () => {
      const workEl = document.getElementById("work");
      if (!workEl) { translateX = 0; return; }
      const workFlex = workEl.querySelector(".work-flex") as HTMLElement | null;
      const lastBox = workEl.querySelector(".work-box:last-child") as HTMLElement | null;
      if (!workFlex || !lastBox) { translateX = 0; return; }
      const paddingRight = parseFloat(getComputedStyle(workFlex).paddingRight) || 0;
      translateX = Math.max(
        0,
        workFlex.offsetLeft + lastBox.offsetLeft + lastBox.offsetWidth + paddingRight - window.innerWidth
      );
    };

    const handleScroll = () => {
      const workEl = document.getElementById("work");
      if (!workEl) { setIsActive(false); return; }
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setIsActive(scrollY > workEl.offsetTop + translateX);
    };

    updateTranslateX();
    handleScroll();

    window.addEventListener("resize", updateTranslateX, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    document.querySelectorAll(".header a").forEach((elem) => {
      const element = elem as HTMLAnchorElement;
      element.addEventListener("click", () => {
        const interval = setInterval(() => { updateTranslateX(); handleScroll(); }, 10);
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

  return (
    <div className="techstack">
      <h2>My Techstack</h2>

      <div style={{ position: "relative" }}>
        <Canvas
          shadows={false}
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
            {sphereData.map((props, i) => (
              <SphereGeo
                key={i}
                scale={props.scale}
                color={props.color}
                isActive={isActive}
                isHovered={hoveredIndex === i}
                onPointerOver={(e) => handlePointerOver(i, props.name, props.color, e)}
                onPointerMove={handlePointerMove}
                onPointerOut={handlePointerOut}
              />
            ))}
          </Physics>
          <Environment
            files="/models/char_enviorment.hdr"
            environmentIntensity={0.5}
            environmentRotation={[0, 4, 2]}
          />
        </Canvas>

        {tooltip && (
          <div
            style={{
              position: "fixed",
              left: tooltip.x + 14,
              top: tooltip.y - 36,
              background: "rgba(10, 8, 20, 0.92)",
              color: tooltip.color,
              border: `1px solid ${tooltip.color}`,
              borderRadius: "6px",
              padding: "5px 12px",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "0.5px",
              pointerEvents: "none",
              zIndex: 1000,
              backdropFilter: "blur(8px)",
              whiteSpace: "nowrap",
              boxShadow: `0 0 12px ${tooltip.color}40`,
            }}
          >
            {tooltip.name}
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          justifyContent: "center",
          marginTop: "16px",
          padding: "0 20px",
        }}
      >
        {Object.values(categoryConfig).map(({ label, color }) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              fontSize: "13px",
              color: "#aaa",
              fontWeight: 300,
              letterSpacing: "0.3px",
            }}
          >
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: color,
                display: "inline-block",
                flexShrink: 0,
                boxShadow: `0 0 6px ${color}`,
              }}
            />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechStack;
