function Resume() {
  return (
    <section className="resume" id="resume" data-screen-label="Resume">
      <div className="section-marker"><span className="num">06</span> Resume</div>
      <div className="resume-grid">
        <div className="resume-left">
          <div className="eyebrow" style={{marginBottom: 24}}>— Document</div>
          <h2>The <span className="it">CV</span>,<br/>uncut.</h2>
          <p>
            Two pages. Education, six roles, three projects, a stack, three certifications.
          </p>
          <div className="resume-actions">
            <a className="btn-primary" href="assets/Siddharth_Singh_Resume.pdf" download>
              <span>Download PDF</span><span>↓</span>
            </a>
            <a className="btn-secondary" href="assets/Siddharth_Singh_Resume.pdf" target="_blank" rel="noreferrer">
              <span>Open in new tab</span><span>↗</span>
            </a>
          </div>
        </div>
        <div className="resume-viewer">
          <div className="frame-bar">
            <div className="dots"><span className="dot"></span><span className="dot"></span><span className="dot"></span></div>
            <span className="file">Siddharth_Singh_Resume.pdf</span>
          </div>
          <iframe src="assets/Siddharth_Singh_Resume.pdf#view=FitH" title="resume"></iframe>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Resume });
