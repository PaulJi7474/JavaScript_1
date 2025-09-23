import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getInterview, updateInterview } from "../api/app";
import "./interviewsCss.css";

const STATUS_OPTIONS = ["Draft", "Published"];

export default function EditInterview() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({
    title: "",
    jobRole: "",
    description: "",
    status: STATUS_OPTIONS[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigationTimerRef = useRef(null);

  useEffect(() => {
    async function fetchInterview() {
      try {
        const data = await getInterview(id);
        const interview = Array.isArray(data) ? data[0] : data;

        if (interview?.id) {
          setForm({
            title: interview.title ?? "",
            jobRole: interview.job_role ?? "",
            description: interview.description ?? "",
            status: STATUS_OPTIONS.includes(interview.status)
              ? interview.status
              : STATUS_OPTIONS[0],
          });
        } else {
          setError("Interview not found.");
        }
      } catch (fetchError) {
        console.error("Failed to load interview", fetchError);
        setError("Unable to load interview. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchInterview();

    return () => {
      if (navigationTimerRef.current) {
        clearTimeout(navigationTimerRef.current);
      }
    };
  }, [id]);

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
      await updateInterview(id, {
        title: form.title.trim(),
        job_role: form.jobRole.trim(),
        description: form.description.trim(),
        status: STATUS_OPTIONS.includes(form.status) ? form.status : STATUS_OPTIONS[0],
      });

      setSuccess("Interview successfully updated");

      navigationTimerRef.current = setTimeout(() => {
        navigate("/", { replace: true });
        navigationTimerRef.current = null;
      }, 1200);
    } catch (submissionError) {
      console.error("Failed to update interview", submissionError);
      setError("Failed to update interview. Please try again.");
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
              <h2 className="card__title">Edit Interview</h2>
            </div>

            {isLoading ? (
              <p className="form-info">Loading interview...</p>
            ) : (
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
                    Save Changes
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
            )}
          </section>
        </div>
      </main>

      <footer className="footer">
        © 2025 ReadySetHire - Streamlining the hiring process with AI
      </footer>
    </div>
  );
}