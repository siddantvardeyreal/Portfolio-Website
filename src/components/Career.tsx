import "./styles/Career.css";

const Career = () => {
  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          My career <span>&</span>
          <br /> experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>

          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Software Developer Engineer - I</h4>
                <h5>Spacejoy</h5>
              </div>
              <h3>2020</h3>
            </div>
            <p>
              Re-engineered website processes and page communication flows,
              reducing user drop-offs by 30%. Built missing SEO pages, improving
              search rankings by 45%.
            </p>
          </div>

          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Software Developer Engineer - II</h4>
                <h5>Spacejoy</h5>
              </div>
              <h3>2023</h3>
            </div>
            <p>
              Engineered high-performance interactive 3D applications with
              Three.js, increasing user engagement by 25%. Optimized web
              performance, reducing page load time by 40% and improving Core Web
              Vitals by 15%.
            </p>
          </div>

          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Software Developer Engineer - II</h4>
                <h5>Kreditbee</h5>
              </div>
              <h3>2022</h3>
            </div>
            <p>
              Resolved 50+ web and mobile issues, improving operational
              efficiency by 20% and reducing customer support tickets by 15%.
              Boosted blog engagement by 25% through CMS enhancements.
            </p>
          </div>

          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Software Engineer II – Consultant</h4>
                <h5>People Prime Worldwide (Client: Turing)</h5>
              </div>
              <h3>NOW</h3>
            </div>
            <p>
              Performing RLHF evaluations for Meta's physics simulation project
              and designing LLM-driven agentic workflows for Amazon's HR &amp;
              finance automation. Leading a team of 4–6 reviewers ensuring AI
              output quality and consistency.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Career;
