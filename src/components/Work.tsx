import "./styles/Work.css";
import WorkImage from "./WorkImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const projects = [
  {
    title: "LLM Evaluation & RLHF Pipeline",
    category: "Generative AI",
    tools: "Python, RLHF, Prompt Engineering, Evaluation Frameworks",
    image: "/images/project-rlhf.jpg",
  },
  {
    title: "Agentic AI Automation System",
    category: "Generative AI",
    tools: "LLM APIs, Agentic Workflows, Prompt Engineering, API Integration",
    image: "/images/project-agentic.jpg",
  },
  {
    title: "RAG-Based Document QA System",
    category: "Generative AI",
    tools: "Python, LangChain, FAISS/Pinecone, OpenAI/HF, Embeddings",
    image: "/images/project-rag.jpg",
  },
  {
    title: "AI Workflow Optimization System",
    category: "Generative AI",
    tools: "Python, Data Pipelines, CI/CD, AI Tooling",
    image: "/images/project-workflow.jpg",
  },
  {
    title: "Darzivo",
    category: "Mobile App / Fashion Tech",
    tools: "React Native, MediaPipe, Python, FastAPI, Supabase, Railway, TypeScript",
    image: "/images/project-darzivo.jpg",
  },
  {
    title: "AI Dev Radar",
    category: "Mobile App / AI News",
    tools: "React Native, LLM APIs, Source Citation, TypeScript",
    image: "/images/project-ai-radar.jpg",
  },
  {
    title: "RAG Smart Loan Advisor",
    category: "Generative AI / FinTech",
    tools: "Python, RAG, LangChain, FAISS/Pinecone, FastAPI, LLM APIs",
    image: "/images/project-loan.jpg",
  },
];

const Work = () => {
  useGSAP(() => {
  let translateX: number = 0;

  function setTranslateX() {
    const workFlex = document.querySelector(".work-flex") as HTMLElement;
    const lastBox = document.querySelector(".work-box:last-child") as HTMLElement;
    if (!workFlex || !lastBox) return;
    // Use last box position instead of scrollWidth — the ::before/::after pseudo-elements
    // are 50000vw wide and inflate scrollWidth, causing thousands of extra scroll pixels.
    const paddingRight = parseFloat(getComputedStyle(workFlex).paddingRight) || 0;
    translateX = Math.max(
      0,
      workFlex.offsetLeft + lastBox.offsetLeft + lastBox.offsetWidth + paddingRight - window.innerWidth
    );
  }

  setTranslateX();

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".work-section",
      start: "top top",
      end: () => `+=${translateX}`,
      scrub: true,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      id: "work",
      onRefreshInit: setTranslateX,
    },
  });

  timeline.to(".work-flex", {
    x: () => -translateX,
    ease: "none",
  });

  return () => {
    timeline.kill();
    ScrollTrigger.getById("work")?.kill();
  };
}, []);
  return (
    <div className="work-section" id="work">
      <div className="work-container section-container">
        <h2>
          My <span>Work</span>
        </h2>
        <div className="work-flex">
          {projects.map((project, index) => (
            <div className="work-box" key={index}>
              <div className="work-info">
                <div className="work-title">
                  <h3>{String(index + 1).padStart(2, "0")}</h3>
                  <div>
                    <h4>{project.title}</h4>
                    <p>{project.category}</p>
                  </div>
                </div>
                <h4>Tools and features</h4>
                <p>{project.tools}</p>
              </div>
              <WorkImage image={project.image} alt={project.title} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Work;
