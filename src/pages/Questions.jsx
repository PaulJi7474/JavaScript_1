import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { deleteQuestion, getQuestionsByInterview } from "../api/questions";
import "./interviewsCss.css";

const difficultyClassMap = {
  Easy: "difficulty-badge--easy",
  Intermediate: "difficulty-badge--intermediate",
  Advanced: "difficulty-badge--advanced",
};

function DifficultyBadge({ level }) {
  return (
    <span className={`difficulty-badge ${difficultyClassMap[level] || ""}`}>
      {level}
    </span>
  );
}

export default function Questions() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const interviewTitle = location.state?.interviewTitle || "Untitled Interview";
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    () => location.state?.successMessage || "",
  );
  const [pendingDeletionId, setPendingDeletionId] = useState(null);

  useEffect(() => {
    if (location.state?.successMessage) {
      navigate(location.pathname, {
        replace: true,
        state: { interviewTitle },
      });
    }
  }, [location.state?.successMessage, navigate, location.pathname, interviewTitle]);

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 2000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    let isMounted = true;

    async function fetchQuestions() {
      if (!id) {
        setError("Invalid interview reference.");
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const data = await getQuestionsByInterview(id);
        if (isMounted) {
          setQuestions(Array.isArray(data) ? data : []);
          setError("");
        }
      } catch (fetchError) {
        console.error("Failed to fetch questions", fetchError);
        if (isMounted) {
          setError("Unable to load questions. Please try again later.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchQuestions();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleAddQuestion = () => {
    if (!id) {
      return;
    }

    navigate(`/interviews/${id}/questions/new`, {
      state: { interviewTitle },
    });
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!questionId || pendingDeletionId) {
      return;
    }

    const confirmationMessage =
      "Are you sure you want to delete this question? This action cannot be undone.";

    if (typeof window !== "undefined" && !window.confirm(confirmationMessage)) {
      return;
    }

    setPendingDeletionId(questionId);
    setError("");

    try {
      await deleteQuestion(questionId);
      setQuestions((prevQuestions) =>
        prevQuestions.filter((question) => question?.id !== questionId),
      );
      setSuccessMessage("Question deleted successfully.");
    } catch (deleteError) {
      console.error("Failed to delete question", deleteError);
      setError("Failed to delete the question. Please try again later.");
      setSuccessMessage("");
    } finally {
      setPendingDeletionId(null);
    }
  };

  const renderTableBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="4" className="text-center">
            Loading questions...
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan="4" className="text-center error-text">
            {error}
          </td>
        </tr>
      );
    }

    if (!questions.length) {
      return (
        <tr>
          <td colSpan="4" className="text-center">
            No questions found.
          </td>
        </tr>
      );
    }

    return questions.map((row, index) => {
      const key = row?.id ?? index;
      const questionId = row?.id;
      const isDeleting = pendingDeletionId === questionId;
      const questionText =
        (typeof row?.question_text === "string" && row.question_text.trim()) ||
        (typeof row?.question === "string" && row.question.trim()) ||
        (typeof row?.text === "string" && row.text.trim()) ||
        "Untitled question";
      const difficulty =
        (typeof row?.difficulty === "string" && row.difficulty.trim()) || "Unknown";

      return (
        <tr key={key}>
          <td>{questionText}</td>
          <td>{interviewTitle}</td>
          <td>
            <DifficultyBadge level={difficulty} />
          </td>
          <td>
            <div className="actions">
              <button type="button" className="action-button" aria-label="Edit question">
                ✏️
              </button>
              <button
                type="button"
                className="action-button"
                aria-label="Delete question"
                title={isDeleting ? "Deleting..." : "Delete question"}
                disabled={!questionId || isDeleting}
                onClick={() => handleDeleteQuestion(questionId)}
              >
                {isDeleting ? "⌛" : "🗑️"}
              </button>
            </div>
          </td>
        </tr>
      );
    });
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
        <div className="content">
          <div className="back-link-container">
            <Link to="/" className="back-link">
              ← Back to Interviews
            </Link>
          </div>

          <section className="card">
            <div className="card__header">
              <div>
                <h2 className="card__title">Questions Management</h2>
                <p className="card__subtitle">Interview: {interviewTitle}</p>
              </div>
              <button
                type="button"
                className="add-interview add-question"
                onClick={handleAddQuestion}
                disabled={!id}
              >
                + Add Question
              </button>
            </div>

            {successMessage ? (
              <p className="form-success" role="status">
                {successMessage}
              </p>
            ) : null}

            <div className="table-wrapper">
              <table className="questions-table">
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Interview</th>
                    <th>Difficulty</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>{renderTableBody()}</tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      <footer className="footer">
        © 2025 ReadySetHire - Streamlining the hiring process with AI
      </footer>
    </div>
  );
}