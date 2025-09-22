import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { createQuestion } from "../api/questions";
import "./interviewsCss.css";

const DIFFICULTY_OPTIONS = ["Easy", "Intermediate", "Advanced"];

export default function AddQuestion() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const interviewTitle = location.state?.interviewTitle ?? "Untitled Interview";

  const [form, setForm] = useState({
    question: "",
    difficulty: DIFFICULTY_OPTIONS[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleCancel = () => {
    if (id) {
      navigate(`/interviews/${id}/questions`, {
        state: { interviewTitle },
      });
    } else {
      navigate("/");
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const trimmedQuestion = form.question.trim();
    if (!trimmedQuestion) {
      setError("Question is required.");
      return;
    }

    if (!id) {
      setError("Missing interview reference.");
      return;
    }

    setIsSubmitting(true);

    const interviewIdNumber = Number(id);
    const payload = {
      interview_id: Number.isFinite(interviewIdNumber) ? interviewIdNumber : id,
      question: trimmedQuestion,
      difficulty: DIFFICULTY_OPTIONS.includes(form.difficulty)
        ? form.difficulty
        : DIFFICULTY_OPTIONS[0],
    };

    try {
      await createQuestion(payload);
      navigate(`/interviews/${id}/questions`, {
        replace: true,
        state: {
          interviewTitle,
          successMessage: "Add question success",
        },
      });
    } catch (submissionError) {
      console.error("Failed to add question", submissionError);
      setError("Failed to add question. Please try again.");
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
              <Link
                to={id ? `/interviews/${id}/questions` : "/"}
                state={id ? { interviewTitle } : undefined}
                className="back-link"
              >
                ← Back to Questions
              </Link>
              <h2 className="card__title">Add Question</h2>
            </div>

            <form onSubmit={onSubmit} className="form">
              {error ? <p className="form-error">{error}</p> : null}

              <div className="form-field">
                <label htmlFor="question">Question *</label>
                <textarea
                  id="question"
                  name="question"
                  value={form.question}
                  onChange={onChange}
                  placeholder="Enter question text"
                  rows={5}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="difficulty">Difficulty *</label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={form.difficulty}
                  onChange={onChange}
                  required
                >
                  {DIFFICULTY_OPTIONS.map((option) => (
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
                  Submit
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="button button--secondary"
                  disabled={isSubmitting}
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