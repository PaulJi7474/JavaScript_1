import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./interviewsCss.css";

const QUESTION_ROWS = [
  {
    question: "Tell me about your experience with React",
    difficulty: "Easy",
  },
  {
    question: "How do you handle state management?",
    difficulty: "Intermediate",
  },
  {
    question: "Explain the virtual DOM",
    difficulty: "Advanced",
  },
];

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
  const { state } = useLocation();
  const interviewTitle = state?.interviewTitle || "Untitled Interview";

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
              <button type="button" className="add-interview add-question">
                + Add Question
              </button>
            </div>

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
                <tbody>
                  {QUESTION_ROWS.map((row, index) => (
                    <tr key={index}>
                      <td>{row.question}</td>
                      <td>{interviewTitle}</td>
                      <td>
                        <DifficultyBadge level={row.difficulty} />
                      </td>
                      <td>
                        <div className="actions">
                          <button
                            type="button"
                            className="action-button"
                            aria-label="Edit question"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="action-button"
                            aria-label="Delete question"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
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