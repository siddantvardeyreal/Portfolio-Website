import { useEffect, useState } from "react";
import "./styles/Loading.css";
import { useLoading } from "../context/LoadingProvider";
import Marquee from "react-fast-marquee";

const STAGES: { upTo: number; label: string }[] = [
  { upTo: 5,  label: "Initializing..." },
  { upTo: 85, label: "Downloading character model..." },
  { upTo: 88, label: "Parsing model..." },
  { upTo: 95, label: "Compiling shaders..." },
  { upTo: 99, label: "Setting up scene..." },
  { upTo: 100, label: "Almost there..." },
];

function getStageLabel(p: number) {
  return STAGES.find((s) => p <= s.upTo)?.label ?? "Ready";
}

const Loading = ({ percent }: { percent: number }) => {
  const { setIsLoading } = useLoading();
  const [loaded, setLoaded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    if (percent >= 100) {
      const t1 = setTimeout(() => {
        setLoaded(true);
        const t2 = setTimeout(() => setIsLoaded(true), 1000);
        return () => clearTimeout(t2);
      }, 600);
      return () => clearTimeout(t1);
    }
  }, [percent]);

  useEffect(() => {
    if (!isLoaded) return;
    import("./utils/initialFX").then((module) => {
      setClicked(true);
      setTimeout(() => {
        module.initialFX?.();
        setIsLoading(false);
      }, 900);
    });
  }, [isLoaded]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  return (
    <>
      <div className="loading-header">
        <a href="/#" className="loader-title" data-cursor="disable">
          SV
        </a>
        <div className={`loaderGame ${clicked && "loader-out"}`}>
          <div className="loaderGame-container">
            <div className="loaderGame-in">
              {[...Array(27)].map((_, i) => (
                <div className="loaderGame-line" key={i}></div>
              ))}
            </div>
            <div className="loaderGame-ball"></div>
          </div>
        </div>
      </div>
      <div className="loading-screen">
        <div className="loading-marquee">
          <Marquee>
            <span> A Creative Developer</span>{" "}
            <span>A Generative AI Engineer</span>
            <span> A Creative Developer</span>{" "}
            <span>A Generative AI Engineer</span>
          </Marquee>
        </div>
        <p className={`loading-status ${loaded ? "loading-status-hide" : ""}`}>
          {getStageLabel(percent)}
        </p>
        <div
          className={`loading-wrap ${clicked && "loading-clicked"}`}
          onMouseMove={handleMouseMove}
        >
          <div className="loading-hover"></div>
          <div className={`loading-button ${loaded && "loading-complete"}`}>
            <div className="loading-container">
              <div className="loading-content">
                <div className="loading-content-in">
                  Loading <span>{percent}%</span>
                </div>
              </div>
              <div className="loading-box"></div>
            </div>
            <div className="loading-content2">
              <span>Welcome</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Loading;
