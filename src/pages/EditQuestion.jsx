import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { getQuestion, updateQuestion } from "../api/questions";
import "./interviewsCss.css";

const DIFFICULTY_OPTIONS = ["Easy", "Intermediate", "Advanced"];

export default function EditQuestion() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id, questionId } = useParams();
  const interviewTitle = location.state?.interviewTitle ?? "Untitled Interview";

  const [form, setForm] = useState({
    question: "",
    difficulty: DIFFICULTY_OPTIONS[0],
  });
  const [questionField, setQuestionField] = useState("question");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigationTimerRef = useRef(null);

  useEffect(() => {
    async function fetchQuestion() {
      if (!questionId) {
        setError("Question not found.");
        setIsLoading(false);
        return;
      }

      try {
        const data = await getQuestion(questionId);
        const question = Array.isArray(data) ? data[0] : data;

        if (question?.id) {
          const detectedField =
            typeof question.question_text === "string"
              ? "question_text"
              : typeof question.question === "string"
                ? "question"
                : typeof question.text === "string"
                  ? "text"
                  : "question";
          const questionText =
            (typeof question.question_text === "string" && question.question_text) ||
            (typeof question.question === "string" && question.question) ||
            (typeof question.text === "string" && question.text) ||
            "";
          const difficulty =
            typeof question.difficulty === "string" && question.difficulty.trim()
              ? question.difficulty.trim()
              : DIFFICULTY_OPTIONS[0];

          setForm({
            question: questionText,
            difficulty: DIFFICULTY_OPTIONS.includes(difficulty)
              ? difficulty
              : DIFFICULTY_OPTIONS[0],
          });
          setQuestionField(detectedField);
        } else {
          setError("Question not found.");
        }
      } catch (fetchError) {
        console.error("Failed to load question", fetchError);
        setError("Unable to load question. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchQuestion();

    return () => {
      if (navigationTimerRef.current) {
        clearTimeout(navigationTimerRef.current);
      }
    };
  }, [questionId]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleCancel = () => {
    if (!id) {
      navigate("/");
      return;
    }

    navigate(`/interviews/${id}/questions`, {
      state: { interviewTitle },
    });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const trimmedQuestion = form.question.trim();
    if (!trimmedQuestion) {
      setError("Question is required.");
      return;
    }

    if (!questionId) {
      setError("Missing question reference.");
      return;
    }

    if (navigationTimerRef.current) {
      clearTimeout(navigationTimerRef.current);
      navigationTimerRef.current = null;
    }

    setIsSubmitting(true);

    const payload = {
      difficulty: DIFFICULTY_OPTIONS.includes(form.difficulty)
        ? form.difficulty
        : DIFFICULTY_OPTIONS[0],
    };

    if (questionField) {
      payload[questionField] = trimmedQuestion;
    } else {
      payload.question = trimmedQuestion;
    }

    try {
      await updateQuestion(questionId, payload);
      setSuccess("Question updated successfully.");

      navigationTimerRef.current = setTimeout(() => {
        if (id) {
          navigate(`/interviews/${id}/questions`, {
            replace: true,
            state: {
              interviewTitle,
              successMessage: "Question updated successfully.",
            },
          });
        } else {
          navigate("/", { replace: true });
        }
        navigationTimerRef.current = null;
      }, 1200);
    } catch (submissionError) {
      console.error("Failed to update question", submissionError);
      setError("Failed to update question. Please try again.");
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
              <Link
                to={id ? `/interviews/${id}/questions` : "/"}
                state={id ? { interviewTitle } : undefined}
                className="back-link"
              >
                ← Back to Questions
              </Link>
              <h2 className="card__title">Edit Question</h2>
            </div>

            {isLoading ? (
              <p className="form-info">Loading question...</p>
            ) : (
              <form onSubmit={onSubmit} className="form">
                {error ? <p className="form-error">{error}</p> : null}
                {success ? <p className="form-success">{success}</p> : null}

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
                    Save Changes
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