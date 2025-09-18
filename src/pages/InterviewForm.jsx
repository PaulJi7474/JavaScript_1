import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Interviews.css";

export default function InterviewForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    jobRole: "",
    description: "",
    status: "Draft",
  });

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    const newId = Date.now();
    navigate(`/interviews/${newId}/questions`, {
      state: { interviewTitle: form.title },
    });
  };

  return (
    <div className="page-layout">
      <header className="header">
        <div className="header__right">
          <Link to="/" className="header__action">
            Interviews
          </Link>
        </div>
        <h1 className="header__title">ReadySetHire - AI-Powered Interview Platform</h1>
      </header>

      <main className="main">
        <div className="content content--narrow">
          <section className="card card--form">
            <div className="form-card__header">
              <Link to="/" className="back-link">
                ← Back to Interviews
              </Link>
              <h2 className="card__title">Add New Interview</h2>
            </div>

            <form onSubmit={onSubmit} className="form">
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
                <button type="submit" className="button button--primary">
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