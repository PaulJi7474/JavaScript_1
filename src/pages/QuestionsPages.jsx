import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { getQuestionsByInterview } from "../api/questions";
import { APPLICANTS } from "../data/applicantsData";
import "./interviewsCss.css";

const getQuestionText = (question) => {
  if (!question || typeof question !== "object") {
    return "";
  }

  const possibleKeys = [
    "question_text",
    "question",
    "text",
    "prompt",
    "title",
    "description",
  ];

  for (const key of possibleKeys) {
    const value = question[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
};

const getQuestionDifficulty = (question) => {
  if (!question || typeof question !== "object") {
    return "";
  }

  const rawDifficulty = question.difficulty || question.level;
  if (typeof rawDifficulty === "string" && rawDifficulty.trim()) {
    return rawDifficulty.trim();
  }

  return "";
};

export default function QuestionsPages() {
  const { id: interviewId, applicantId } = useParams();
  const { state } = useLocation();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const interviewTitle =
    (typeof state?.interviewTitle === "string" && state.interviewTitle.trim()) ||
    "Untitled Interview";
  const applicantFromState = state?.applicant;
  const applicantDetails =
    applicantFromState || APPLICANTS.find((applicant) => applicant.id === applicantId);

  useEffect(() => {
    let isMounted = true;

    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getQuestionsByInterview(interviewId);
        if (!isMounted) {
          return;
        }

        const questionRows = Array.isArray(response) ? response : [];
        setQuestions(questionRows);
        setCurrentIndex(0);
        setHasSubmitted(false);
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        setError("Failed to load questions. Please try again later.");
        setQuestions([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchQuestions();

    return () => {
      isMounted = false;
    };
  }, [interviewId]);

  const totalQuestions = questions.length;
  const hasQuestions = totalQuestions > 0;
  const currentQuestion = hasQuestions ? questions[currentIndex] : null;
  const questionText = useMemo(() => {
    const text = getQuestionText(currentQuestion);
    return text || "Untitled question";
  }, [currentQuestion]);
  const difficulty = useMemo(() => getQuestionDifficulty(currentQuestion), [currentQuestion]);
  const isLastQuestion = hasQuestions && currentIndex === totalQuestions - 1;
  const progressValue = hasQuestions ? ((currentIndex + 1) / totalQuestions) * 100 : 0;
  const progressLabel = hasQuestions
    ? `Question ${currentIndex + 1} of ${totalQuestions}`
    : "No questions available";

  const primaryButtonLabel = !hasQuestions
    ? "No questions available"
    : isLastQuestion
      ? hasSubmitted
        ? "Interview submitted"
        : "Submit interview"
      : "Next Question";
  const isPrimaryButtonDisabled =
    !hasQuestions || (isLastQuestion && hasSubmitted) || loading || Boolean(error);
  const actionMessage = hasSubmitted
    ? "Submission saved"
    : !hasQuestions
      ? "Add questions to this interview to begin"
      : "Audio recorder is ready";

  const handlePrimaryAction = () => {
    if (!hasQuestions || loading || error) {
      return;
    }

    if (isLastQuestion) {
      setHasSubmitted(true);
      return;
    }

    setCurrentIndex((previousIndex) => {
      const nextIndex = previousIndex + 1;
      if (nextIndex >= totalQuestions) {
        return previousIndex;
      }
      return nextIndex;
    });
  };

  return (
    <div className="page-layout take-interview-page">
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
          <div className="back-to-interviews">
            <Link to={`/interviews/${interviewId}/applicants`} className="back-link">
              ← Back to Applicants
            </Link>
          </div>

          <section className="card question-page-card">
            <div className="card__body card__body--question-page">
              <div className="question-page__header">
                <p className="question-page__eyebrow">{interviewTitle}</p>
                {applicantDetails ? (
                  <p className="question-page__applicant">Interviewing {applicantDetails.name}</p>
                ) : null}
              </div>

              <div className="question-progress">
                <div className="question-progress__header">
                  <p className="question-progress__label">{progressLabel}</p>
                  {difficulty ? (
                    <span className="question-progress__difficulty">Difficulty: {difficulty}</span>
                  ) : null}
                </div>
                <div
                  className="question-progress__bar"
                  role="progressbar"
                  aria-valuenow={Math.round(progressValue)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Interview progress"
                >
                  <div
                    className="question-progress__fill"
                    style={{ width: `${progressValue}%` }}
                  />
                </div>
              </div>

              {loading ? (
                <p className="question-page__status">Loading questions...</p>
              ) : error ? (
                <p className="question-page__status question-page__status--error">{error}</p>
              ) : !hasQuestions ? (
                <p className="question-page__status">No questions available for this interview.</p>
              ) : (
                <>
                  {!hasSubmitted ? (
                    <>
                      <div className="question-content">
                        <h3 className="question-content__title">Question {currentIndex + 1}:</h3>
                        <p className="question-content__text">{questionText}</p>
                      </div>

                      <section className="audio-recorder">
                        <h4 className="audio-recorder__title">Audio recorder</h4>
                        <div className="audio-recorder__controls">
                          <button type="button" className="rect-button rect-button--outline">
                            ▶ Start Recording
                          </button>
                          <p className="audio-recorder__hint">
                            Click Start Recording to begin
                          </p>
                        </div>
                      </section>
                    </>
                  ) : (
                    <div className="question-complete" role="status">
                      <h3 className="question-complete__title">Interview submitted</h3>
                      <p className="question-complete__text">
                        Thank you for completing the interview. You may close this window or return
                        to the applicants list.
                      </p>
                    </div>
                  )}
                </>
              )}

              <div className="question-actions">
                <div className="question-actions__message">{actionMessage}</div>
                <button
                  type="button"
                  className="rect-button rect-button--primary question-actions__primary"
                  onClick={handlePrimaryAction}
                  disabled={isPrimaryButtonDisabled}
                >
                  {primaryButtonLabel}
                </button>
              </div>
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