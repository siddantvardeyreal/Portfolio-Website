import "./styles/Work.css";
import WorkImage from "./WorkImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const projects = [
  {
    title: "AI Dev Radar",
    category: "Mobile App / AI News",
    description: "A mobile news aggregator that uses LLMs to curate, summarise, and cite the latest AI developments from across the web, keeping developers informed without the noise.",
    tools: "React Native, LLM APIs, Source Citation, TypeScript",
    image: "/images/project-ai-radar.jpg",
    link: "https://web-nu-liart-21.vercel.app/",
    mobileBest: true,
  },
  {
    title: "RAG Smart Loan Advisor",
    category: "Generative AI / FinTech",
    description: "A conversational FinTech advisor that retrieves relevant loan policies and financial documents to answer eligibility and planning questions with accurate, source-backed responses.",
    tools: "Python, RAG, LangChain, FAISS/Pinecone, FastAPI, LLM APIs",
    image: "/images/project-loan.jpg",
    link: "https://rag-loan-advisor.onrender.com/",
    mobileBest: true,
  },
  {
    title: "LLM Evaluation & RLHF Pipeline",
    category: "Generative AI",
    description: "Built a pipeline to evaluate LLM outputs using custom metrics and human feedback loops. Implements RLHF techniques to iteratively align model responses with quality and safety targets.",
    tools: "Python, RLHF, Prompt Engineering, Evaluation Frameworks",
    image: "/images/project-rlhf.jpg",
  },
  {
    title: "Agentic AI Automation System",
    category: "Generative AI",
    description: "Developed an autonomous agent that orchestrates multi-step LLM calls, tool use, and decision branching to automate complex workflows end-to-end with minimal human intervention.",
    tools: "LLM APIs, Agentic Workflows, Prompt Engineering, API Integration",
    image: "/images/project-agentic.jpg",
  },
  {
    title: "RAG-Based Document QA System",
    category: "Generative AI",
    description: "Ingests and indexes documents into a vector store, then answers natural language queries with grounded, cited responses using retrieval-augmented generation.",
    tools: "Python, LangChain, FAISS/Pinecone, OpenAI/HF, Embeddings",
    image: "/images/project-rag.jpg",
  },
  {
    title: "AI Workflow Optimization System",
    category: "Generative AI",
    description: "Engineered data pipelines and CI/CD automation to streamline AI model deployment and monitoring, significantly reducing manual overhead across development and production environments.",
    tools: "Python, Data Pipelines, CI/CD, AI Tooling",
    image: "/images/project-workflow.jpg",
  },
  {
    title: "Darzivo",
    category: "Mobile App / Fashion Tech",
    description: "A fashion-tech mobile app featuring AI-powered virtual try-on using MediaPipe pose estimation, letting users visualise outfits on themselves in real time before purchasing.",
    tools: "React Native, MediaPipe, Python, FastAPI, Supabase, Railway, TypeScript",
    image: "/images/project-darzivo.jpg",
  },
];

const Work = () => {
  useGSAP(() => {
  // Mobile uses native horizontal swipe — skip GSAP pin entirely
  if (window.innerWidth <= 1024) return;

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
                {(project.link || project.mobileBest) && (
                  <div className="work-badges">
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="work-badge work-badge--live"
                        data-cursor="disable"
                      >
                        Live ↗
                      </a>
                    )}
                    {project.mobileBest && (
                      <span className="work-badge work-badge--mobile">
                        Best on mobile
                      </span>
                    )}
                  </div>
                )}
                <p className="work-description">{project.description}</p>
                <h4>Tools and features</h4>
                <p>{project.tools}</p>
              </div>
              <WorkImage image={project.image} alt={project.title} link={project.link} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Work;
