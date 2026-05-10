import "./styles/Work.css";
import WorkImage from "./WorkImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const projects = [
  {
    title: "AI Startup Simulator",
    category: "Agentic AI / Multi-Agent Systems",
    description: "Six autonomous AI agents — CEO, PM, Engineering, Finance, Marketing, and Investor — run a startup together. Each quarter they deliberate, critique each other's plans, resolve conflicts, and execute decisions. You watch the metrics move.",
    tools: "FastAPI, LangGraph, LangChain, Ollama, Qdrant, PostgreSQL, Next.js, Docker",
    image: "/images/project-startup-simulator.png",
    link: "https://startup-simulator-tau.vercel.app/",
    desktopBest: true,
  },
  {
    title: "AI Dev Radar",
    category: "Mobile App / AI News",
    description: "A mobile news aggregator that uses LLMs to curate, summarise, and cite the latest AI developments from across the web, keeping developers informed without the noise.",
    tools: "React Native, LLM APIs, Source Citation, TypeScript",
    image: "/images/project-ai-radar.png",
    link: "https://web-nu-liart-21.vercel.app/",
    mobileBest: true,
  },
  {
    title: "RAG Smart Loan Advisor",
    category: "Generative AI / FinTech",
    description: "A conversational FinTech advisor that compares loan rates across banks in real time, answers eligibility questions, and calculates EMIs — powered by RAG over live financial documents.",
    tools: "Python, RAG, LangChain, FAISS/Pinecone, FastAPI, LLM APIs",
    image: "/images/project-loan.png",
    link: "https://rag-loan-advisor.onrender.com/",
    mobileBest: true,
  },
  {
    title: "Darzivo",
    category: "Mobile App / Fashion Tech",
    description: "A fashion-tech mobile app featuring AI-powered virtual try-on using MediaPipe pose estimation, letting users visualise outfits on themselves in real time before purchasing.",
    tools: "React Native, MediaPipe, Python, FastAPI, Supabase, Railway, TypeScript",
    image: "/images/project-darzivo.jpg",
    inProgress: true,
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
                {(project.link || project.mobileBest || project.desktopBest || project.inProgress) && (
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
                    {project.desktopBest && (
                      <span className="work-badge work-badge--desktop">
                        Best on desktop
                      </span>
                    )}
                    {project.inProgress && (
                      <span className="work-badge work-badge--progress">
                        In Progress
                      </span>
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
