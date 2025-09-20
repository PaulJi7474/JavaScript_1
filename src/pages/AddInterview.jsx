import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./interviews.css";

export default function InterviewForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    key: Date.now(),
    title: "",
    jobRole: "",
    description: "",
    status: "Draft",
  });

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleAddInterview = async () => {
    try {
      const token = window?.localStorage?.getItem("authToken");
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        "https://comp2140a2.uqcloud.net/api/interview",
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            // id: form.id,
            title: form.title,
            job_role: form.jobRole,
            description: form.description,
            status: form.status,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const contentLengthHeader = response.headers.get("content-length");
      const contentTypeHeader = response.headers.get("content-type");

      const parsedContentLength =
        contentLengthHeader !== null
          ? Number.parseInt(contentLengthHeader, 10)
          : Number.NaN;

      const shouldParseJson =
        Number.isFinite(parsedContentLength) && parsedContentLength > 0
          ? true
          : !contentLengthHeader &&
            typeof contentTypeHeader === "string" &&
            contentTypeHeader.toLowerCase().includes("application/json");

      const data = shouldParseJson ? (await response.json()) ?? {} : {};

      const toInteger = (value) => {
        const numericValue = Number(value);
        return Number.isInteger(numericValue) ? numericValue : null;
      };

      // const createdId =
      //   toInteger(data?.id) ??
      //   toInteger(data?.interviewId) ??
      //   toInteger(data?.interview_id) ??
      //   toInteger(data?.data?.id) ??
      //   toInteger(form.id) ??
      //   Date.now();

      navigate(`/interviews/${createdId}/questions`, {
        state: { interviewTitle: form.title },
      });
    } catch (error) {
      console.error("Failed to create interview:", error);
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

            <form className="form">
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
                  type="button"
                  onClick={handleAddInterview}
                  className="button button--primary"
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