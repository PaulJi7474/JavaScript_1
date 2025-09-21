import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./interviews.css";
// import axios from "axios";
// import dotenv from "dotenv";

// dotenv.config();

// const tmdbApiKey = import.meta.env.VITE_TMDB_API_KEY;
  // import.meta.env?.VITE_TMDB_API_KEY ??
  // (typeof globalThis !== "undefined" &&
  //   typeof globalThis.process !== "undefined"
  //     ? globalThis.process.env?.TMDB_API_KEY
  //     : undefined);

export default function InterviewForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    id: Date.now(),
    title: "",
    jobRole: "",
    description: "",
    status: "Draft",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        "https://comp2140a2.uqcloud.net/api/interview",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${tmdbApiKey}`,
            Authorization:`Bearer ${process.env.VITE_TMDB_API_KEY}`
            // Authorization:`Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic3R1ZGVudCIsInVzZXJuYW1lIjoiczQ4NDkxMjMifQ.zloDtPVIpdCxmfBWaTQDJHt6kJHIz3xqY1sfZ4ZYElA`
          },
          body: JSON.stringify({
            id: form.id,
            title: form.title,
            jobRole: form.jobRole,
            description: form.description,
            status: form.status,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json().catch(() => ({}));

      const interviewId =
        data?.id ?? data?.interviewId ?? data?.interview_id ?? data?.ID;

      if (interviewId) {
        navigate(`/interviews/${interviewId}/questions`, {
          state: { interviewTitle: form.title },
        });
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
      <header className="header header--brand-left">
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
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
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