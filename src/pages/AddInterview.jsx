import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createInterview } from "../api/app";
import "./interviewsCss.css";
const STATUS_OPTIONS = ["Draft", "Published"];

export default function InterviewForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    jobRole: "",
    description: "",
    status: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigationTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (navigationTimerRef.current) {
        clearTimeout(navigationTimerRef.current);
      }
    };
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (navigationTimerRef.current) {
      clearTimeout(navigationTimerRef.current);
      navigationTimerRef.current = null;
    }
    setIsSubmitting(true);

    try {
      const data = await createInterview({
        title: form.title.trim(),
        job_role: form.jobRole.trim(),
        description: form.description.trim(),
        status: STATUS_OPTIONS.includes(form.status)
          ? form.status
          : STATUS_OPTIONS[0],
      });

      const interviewId =
        data?.id ?? data?.interviewId ?? data?.interview_id ?? data?.ID;

      if (interviewId) {
        setSuccess("Interview successfully added");
        navigationTimerRef.current = setTimeout(() => {
          navigate(`/interviews/${interviewId}/questions`, {
            state: { interviewTitle: form.title },
          });
          navigationTimerRef.current = null;
        }, 1200);
      } else {
        navigate("/", { replace: true });
      }
    } catch (submissionError) {
      console.error("Failed to add interview", submissionError);
      setError("Failed to add interview. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-layout">
      <header className="header header_brand_left">
        <h1 className="header__title header__title--left">
          ReadySetHire - AI-Powered Interview Platform
        </h1>
        <div className="header__left">
          <Link to="/" className="header__action">
            Interviews
          </Link>
        </div>
      </header>

      <main className="main">
        <div className="content content--narrow">
          <section className="card card--form">
            <div className="form-card__header">
              <Link to="/" className="back-link">
                ← Back to interviews
              </Link>
              <h2 className="card__title">Add New Interview</h2>
            </div>

            <form onSubmit={onSubmit} className="form">
              {error ? <p className="form-error">{error}</p> : null}
              {success ? <p className="form-success">{success}</p> : null}
              <div className="form-field">
                <label htmlFor="title">Title *</label>
                <input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={onChange}
                  placeholder="Interview Title"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="jobRole">Job Role *</label>
                <input
                  id="jobRole"
                  name="jobRole"
                  value={form.jobRole}
                  onChange={onChange}
                  placeholder="Job Role"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  placeholder="Interview Description"
                  rows={6}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="status">Status *</label>
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={onChange}
                  required
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="button button--primary"
                  disabled={isSubmitting}
                >
                  Add Interview
                </button>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="button button--secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>

      <footer className="footer">
        © 2025 ReadySetHire - Streamlining the hiring process with AI
      </footer>
    </div>
  );
}