import { useState } from "react";
import { uploadResume, analyzeResume, generateCoverLetter } from "./api";

const asList = (value) => (Array.isArray(value) ? value : []);

const clampScore = (score) => {
  const parsed = Number.parseInt(score, 10);
  if (Number.isNaN(parsed)) {
    return 0;
  }
  return Math.min(100, Math.max(0, parsed));
};

const getErrorMessage = (error, fallback) => {
  return error?.response?.data?.detail || error?.message || fallback;
};

function App() {
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");

  const extractResumeText = async () => {
    if (!file) {
      alert("Select a PDF");
      return "";
    }

    try {
      setUploadLoading(true);
      setUploadStatus("Extracting resume text...");
      const result = await uploadResume(file);
      const extractedText = result.resume_text || "";
      setResumeText(extractedText);
      setUploadStatus("Resume text extracted");
      return extractedText;
    } catch (error) {
      console.error(error);
      setUploadStatus("");
      alert(getErrorMessage(error, "Upload failed"));
      return "";
    } finally {
      setUploadLoading(false);
    }
  };

  const handleUpload = async () => {
    const extractedText = await extractResumeText();
    if (extractedText) {
      alert("Resume uploaded successfully");
    }
  };

  const getReadyResumeText = async () => {
    if (resumeText) {
      return resumeText;
    }

    if (file) {
      return extractResumeText();
    }

    alert("Select a PDF resume first");
    return "";
  };

  const handleAnalyze = async () => {
    if (!jobDescription) {
      alert("Enter a job description");
      return;
    }

    try {
      setLoading(true);
      const readyResumeText = await getReadyResumeText();
      if (!readyResumeText) {
        return;
      }

      const result = await analyzeResume(readyResumeText, jobDescription);
      setAnalysis(result);
    } catch (error) {
      console.error(error);
      alert(getErrorMessage(error, "Analysis failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!jobDescription) {
      alert("Enter a job description");
      return;
    }

    try {
      setCoverLoading(true);
      setCopyStatus("");
      const readyResumeText = await getReadyResumeText();
      if (!readyResumeText) {
        return;
      }

      const result = await generateCoverLetter(readyResumeText, jobDescription);
      setCoverLetter(result.cover_letter || "");
    } catch (error) {
      console.error(error);
      alert(getErrorMessage(error, "Cover letter generation failed"));
    } finally {
      setCoverLoading(false);
    }
  };

  const handleCopyCoverLetter = async () => {
    if (!coverLetter) {
      return;
    }

    try {
      await navigator.clipboard.writeText(coverLetter);
      setCopyStatus("Copied");
    } catch (error) {
      console.error(error);
      setCopyStatus("Copy failed");
    }
  };

  const matchScore = clampScore(analysis?.match_score);
  const hasResume = Boolean(resumeText);
  const hasJobDescription = jobDescription.trim().length > 0;
  const hasResumeSource = hasResume || Boolean(file);
  const canAnalyze = hasResumeSource && hasJobDescription && !loading && !uploadLoading;
  const canGenerateCoverLetter =
    hasResumeSource && hasJobDescription && !coverLoading && !uploadLoading;
  const jobWordCount = jobDescription.trim().split(/\s+/).filter(Boolean).length;

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Resume intelligence</p>
          <h1>AI Career Copilot</h1>
          <p className="hero-copy">
            Compare your resume to a target role, spot the gaps, and turn the
            next application into a sharper shot.
          </p>
        </div>

        <div className="hero-stats" aria-label="Analysis progress">
          <span className={hasResume ? "status-pill done" : "status-pill"}>
            Resume {hasResume ? "ready" : "needed"}
          </span>
          <span className={hasJobDescription ? "status-pill done" : "status-pill"}>
            Job details {hasJobDescription ? "ready" : "needed"}
          </span>
        </div>
      </section>

      <section className="workspace-grid" aria-label="Resume analysis inputs">
        <div className="panel upload-panel">
          <div className="panel-header">
            <p className="section-kicker">Step 1</p>
            <h2>Upload resume</h2>
          </div>

          <label className="file-drop">
            <input
              type="file"
              accept=".pdf"
              onChange={(event) => {
                setFile(event.target.files[0] || null);
                setResumeText("");
                setUploadStatus("");
                setAnalysis(null);
                setCoverLetter("");
              }}
            />
            <span className="file-icon">PDF</span>
            <span className="file-title">
              {file ? file.name : "Choose your resume PDF"}
            </span>
            <span className="file-hint">
              {hasResume
                ? "Text extracted and ready"
                : file
                ? "Ready to upload or analyze"
                : "Upload once before analysis"}
            </span>
          </label>

          <button
            className="primary-button"
            onClick={handleUpload}
            disabled={!file || uploadLoading}
          >
            {uploadLoading ? "Uploading..." : hasResume ? "Re-upload Resume" : "Upload Resume"}
          </button>
          {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
        </div>

        <div className="panel job-panel">
          <div className="panel-header">
            <p className="section-kicker">Step 2</p>
            <h2>Paste job description</h2>
          </div>

          <textarea
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            placeholder="Paste the role requirements, responsibilities, and preferred skills here."
          />

          <div className="job-actions">
            <span>{jobWordCount} words</span>
            <button
              className="primary-button"
              onClick={handleAnalyze}
              disabled={!canAnalyze}
            >
              {loading ? "Analyzing..." : "Analyze Match"}
            </button>
            <button
              className="secondary-button"
              onClick={handleGenerateCoverLetter}
              disabled={!canGenerateCoverLetter}
            >
              {coverLoading ? "Writing..." : "Generate Cover Letter"}
            </button>
          </div>
        </div>
      </section>

      {loading && (
        <section className="panel loading-panel" aria-live="polite">
          <div className="loading-bar" />
          <p>Reading the resume against the role...</p>
        </section>
      )}

      {coverLoading && (
        <section className="panel loading-panel" aria-live="polite">
          <div className="loading-bar" />
          <p>Drafting a tailored cover letter...</p>
        </section>
      )}

      {analysis ? (
        <section className="results-grid" aria-label="Analysis result">
          <div className="panel score-panel">
            <p className="section-kicker">Match score</p>
            <div className="score-number">{matchScore}%</div>
            <div
              className="score-track"
              role="progressbar"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={matchScore}
            >
              <div className="score-fill" style={{ width: `${matchScore}%` }} />
            </div>
            <p className="score-note">
              {matchScore >= 80
                ? "Strong alignment. Tune the details and apply with confidence."
                : matchScore >= 60
                ? "Promising fit. A few targeted edits could lift this quickly."
                : "Needs positioning work. Focus on the missing skills and evidence."}
            </p>
          </div>

          <ResultList title="Strengths" items={asList(analysis.strengths)} tone="good" />
          <ResultList title="Weaknesses" items={asList(analysis.weaknesses)} tone="watch" />
          <ResultList
            title="Missing Skills"
            items={asList(analysis.missing_skills)}
            tone="gap"
          />
        </section>
      ) : (
        <section className="empty-state">
          <p>Upload a resume and paste a job description to reveal your match score.</p>
        </section>
      )}

      {coverLetter && (
        <section className="panel cover-letter-panel" aria-label="Generated cover letter">
          <div className="cover-letter-header">
            <div>
              <p className="section-kicker">Generated draft</p>
              <h2>Cover letter</h2>
            </div>
            <div className="cover-letter-actions">
              {copyStatus && <span>{copyStatus}</span>}
              <button className="secondary-button compact" onClick={handleCopyCoverLetter}>
                Copy Letter
              </button>
            </div>
          </div>
          <div className="cover-letter-copy">
            {coverLetter.split("\n").map((line, index) => (
              <p key={index}>{line || "\u00a0"}</p>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function ResultList({ title, items, tone }) {
  return (
    <div className={`panel insight-card ${tone}`}>
      <h3>{title}</h3>
      {items.length > 0 ? (
        <ul>
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="muted">No items returned yet.</p>
      )}
    </div>
  );
}

export default App;
