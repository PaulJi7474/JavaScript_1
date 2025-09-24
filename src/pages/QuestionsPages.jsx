import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { getQuestionsByInterview } from "../api/questions";
import { APPLICANTS } from "../data/applicantsData";
import "./interviewsCss.css";
import { createApplicantAnswer } from "../api/applicantAnswers";
import { updateApplicantStatus } from "../api/applicants";

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
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [microphonePermissionGranted, setMicrophonePermissionGranted] = useState(false);
  const [hasStartedRecording, setHasStartedRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasAnsweredQuestion, setHasAnsweredQuestion] = useState(false);
  const [isRecognitionActive, setIsRecognitionActive] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [recorderError, setRecorderError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadingAnswer, setUploadingAnswer] = useState(false);

  const recognitionConstructorRef = useRef(null);
  const recognitionRef = useRef(null);
  const recognitionStatusRef = useRef({ shouldRestart: false });
  const finalTranscriptRef = useRef("");

  const interviewTitle =
    (typeof state?.interviewTitle === "string" && state.interviewTitle.trim()) ||
    "Untitled Interview";
  const applicantFromState = state?.applicant;
  const applicantDetails =
    applicantFromState || APPLICANTS.find((applicant) => applicant.id === applicantId);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const userAllowedMicrophone = window.confirm(
      "ReadySetHire needs to use your microphone to record answers. Do you allow access?",
    );

    if (!userAllowedMicrophone) {
      navigate(`/interviews/${interviewId}/applicants`, { replace: true });
      return;
    }

    setMicrophonePermissionGranted(true);
  }, [navigate, interviewId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const Constructor = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!Constructor) {
      setRecorderError("Speech recognition is not supported in this browser.");
      return;
    }

    recognitionConstructorRef.current = Constructor;
  }, []);

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

        console.error("Failed to load questions", fetchError);
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
  const displayedTranscript = useMemo(() => {
    const segments = [transcript.trim(), interimTranscript.trim()].filter(
      (segment) => segment && segment.length > 0,
    );
    return segments.join(" ");
  }, [transcript, interimTranscript]);

  const primaryButtonLabel = !hasQuestions
    ? "No questions available"
    : isLastQuestion
      ? hasSubmitted
        ? "Interview submitted"
        : "Submit interview"
      : "Next Question";
  const isPrimaryButtonDisabled =
    !hasQuestions || (isLastQuestion && hasSubmitted) || loading || Boolean(error) || uploadingAnswer;
  const actionMessage = hasSubmitted
    ? "Submission saved"
    : !hasQuestions
      ? "Add questions to this interview to begin"
      : uploadingAnswer
        ? "Saving your answer..."
        : uploadError
          ? uploadError
          : recorderError
            ? recorderError
            : hasAnsweredQuestion
              ? "Question answered"
              : hasStartedRecording
                ? isPaused
                  ? "Recording paused"
                  : isRecognitionActive
                    ? "Recording in progress"
                    : "Audio recorder is getting ready"
                : "Audio recorder is ready. Please click Stop to submit your answer.";

  const handlePrimaryAction = async () => {
    if (!hasQuestions || loading || error) {
      return;
    }

    if (isLastQuestion) {
      const completedStatus = "Completed";
      setHasSubmitted(true);
      const applicantIdentifier = applicantDetails?.id || applicantId;
      const updatedApplicant =
        applicantDetails && typeof applicantDetails === "object"
          ? { ...applicantDetails, status: completedStatus, interview_status: completedStatus }
          : applicantDetails;

      if (applicantIdentifier) {
        try {
          await updateApplicantStatus(applicantIdentifier, completedStatus);
        } catch (statusError) {
          console.error("Failed to update applicant status", statusError);
        }
      }

      if (interviewId && applicantIdentifier) {
        navigate(
          `/interviews/${interviewId}/applicants/${applicantIdentifier}/interview/completed`,
          {
            state: {
              interviewTitle,
              applicant: updatedApplicant,
            },
          },
        );
      }

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

  const resetRecorderState = useCallback(() => {
    setHasStartedRecording(false);
    setIsPaused(false);
    setHasAnsweredQuestion(false);
    setIsRecognitionActive(false);
    setTranscript("");
    setInterimTranscript("");
    if (recognitionConstructorRef.current) {
      setRecorderError("");
    }
    setUploadError("");
    setUploadingAnswer(false);
    recognitionStatusRef.current = { shouldRestart: false };
    finalTranscriptRef.current = "";
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.onstart = null;
      try {
        recognitionRef.current.stop();
      } catch (stopError) {
        console.error("Failed to stop recognition", stopError);
      }
      recognitionRef.current = null;
    }
  }, []);

  useEffect(() => {
    resetRecorderState();
  }, [resetRecorderState, currentQuestion?.id]);

  useEffect(() => {
    return () => {
      resetRecorderState();
    };
  }, [resetRecorderState]);

  const ensureRecognitionInstance = () => {
    if (!recognitionConstructorRef.current) {
      setRecorderError("Speech recognition is not supported in this browser.");
      return null;
    }

    if (!recognitionRef.current) {
      const recognition = new recognitionConstructorRef.current();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsRecognitionActive(true);
        setRecorderError("");
      };

      recognition.onresult = (event) => {
        let interim = "";
        let finalChunk = "";

        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i];
          const textSegment = result[0]?.transcript ?? "";
          if (result.isFinal) {
            finalChunk += textSegment;
          } else {
            interim += textSegment;
          }
        }

        if (finalChunk) {
          finalTranscriptRef.current = `${`${finalTranscriptRef.current} ${finalChunk}`.trim()}`;
          setTranscript(finalTranscriptRef.current);
        }

        setInterimTranscript(interim);
      };

      recognition.onerror = (event) => {
        if (event.error === "no-speech") {
          return;
        }
        console.error("Speech recognition error", event.error);
        setRecorderError("We couldn't capture audio. Please speak clearly and try again.");
      };

      recognition.onend = () => {
        setIsRecognitionActive(false);
        if (recognitionStatusRef.current.shouldRestart) {
          try {
            recognition.start();
          } catch (startError) {
            console.error("Failed to restart recognition", startError);
            setRecorderError("Microphone stopped unexpectedly. Please resume to continue.");
            setIsPaused(true);
            recognitionStatusRef.current.shouldRestart = false;
          }
        }
      };

      recognitionRef.current = recognition;
    }

    return recognitionRef.current;
  };

  const getFullTranscript = () => {
    const finalText = finalTranscriptRef.current.trim();
    const interimText = interimTranscript.trim();
    const segments = [finalText, interimText].filter((segment) => segment && segment.length > 0);
    return segments.join(" ");
  };

  const handleStartRecording = () => {
    if (hasAnsweredQuestion || !microphonePermissionGranted) {
      return;
    }

    const recognition = ensureRecognitionInstance();
    if (!recognition) {
      return;
    }

    setHasStartedRecording(true);
    setIsPaused(false);
    setRecorderError("");
    setUploadError("");
    setTranscript("");
    setInterimTranscript("");
    finalTranscriptRef.current = "";
    recognitionStatusRef.current = { shouldRestart: true };

    try {
      recognition.start();
    } catch (startError) {
      if (startError.name !== "InvalidStateError") {
        console.error("Failed to start recognition", startError);
        setRecorderError("Unable to start recording. Please try again.");
      }
    }
  };

  const handlePauseResume = () => {
    const recognition = recognitionRef.current;
    if (!recognition || hasAnsweredQuestion) {
      return;
    }

    if (isPaused) {
      recognitionStatusRef.current = { shouldRestart: true };
      setIsPaused(false);
      setRecorderError("");
      try {
        recognition.start();
      } catch (startError) {
        if (startError.name !== "InvalidStateError") {
          console.error("Failed to resume recognition", startError);
          setRecorderError("Unable to resume recording. Please try again.");
        }
      }
      return;
    }

    recognitionStatusRef.current = { shouldRestart: false };
    setIsPaused(true);
    setIsRecognitionActive(false);
    try {
      recognition.stop();
    } catch (stopError) {
      console.error("Failed to pause recognition", stopError);
      setRecorderError("Unable to pause recording. Please try again.");
    }
  };

  const handleEndRecording = async () => {
    const recognition = recognitionRef.current;

    recognitionStatusRef.current = { shouldRestart: false };
    setIsPaused(false);
    setIsRecognitionActive(false);
    setHasAnsweredQuestion(true);

    if (recognition) {
      try {
        recognition.stop();
      } catch (stopError) {
        console.error("Failed to stop recognition", stopError);
      }
    }

    const recordedTranscript = getFullTranscript();

    if (!recordedTranscript) {
      setUploadError("No speech detected. Your answer was not saved.");
      return;
    }

    if (!currentQuestion) {
      setUploadError("Unable to determine the question to save your answer.");
      return;
    }

    const questionIdentifier =
      typeof currentQuestion.id !== "undefined"
        ? currentQuestion.id
        : currentQuestion.question_id ?? null;

    if (questionIdentifier === null || typeof questionIdentifier === "undefined") {
      setUploadError("Unable to determine the question to save your answer.");
      return;
    }

    const payload = {
      interview_id: Number.isNaN(Number(interviewId)) ? interviewId : Number(interviewId),
      question_id: Number.isNaN(Number(questionIdentifier))
        ? questionIdentifier
        : Number(questionIdentifier),
      applicant_id: Number.isNaN(Number(applicantId)) ? applicantId : Number(applicantId),
      answer: recordedTranscript,
    };

    setUploadingAnswer(true);
    setUploadError("");

    try {
      await createApplicantAnswer(payload);
    } catch (submitError) {
      console.error("Failed to submit applicant answer", submitError);
      setUploadError("We could not save your answer. Please contact the interviewer.");
    } finally {
      setUploadingAnswer(false);
    }
  };

  return (
    <div className="page-layout take-interview-page">
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
                          {!microphonePermissionGranted ? (
                            <p className="audio-recorder__hint">Microphone permission is required.</p>
                          ) : !recognitionConstructorRef.current ? (
                            <p
                              className={`audio-recorder__hint${
                                recorderError ? " audio-recorder__hint--error" : ""
                              }`}
                            >
                              {recorderError || "Preparing microphone..."}
                            </p>
                          ) : !hasStartedRecording ? (
                            <>
                              <button
                                type="button"
                                className="rect-button rect-button--outline"
                                onClick={handleStartRecording}
                                disabled={hasAnsweredQuestion || uploadingAnswer}
                              >
                                ▶ Start Recording
                              </button>
                              <p className="audio-recorder__hint">
                                Click Start Recording to begin. Your recording will be automatically converted to text.
                              </p>
                            </>
                          ) : !hasAnsweredQuestion ? (
                            <div className="audio-recorder__button-group">
                              <button
                                type="button"
                                className="rect-button rect-button--outline"
                                onClick={handlePauseResume}
                                disabled={uploadingAnswer}
                                >
                                  {isPaused ? "▶ Resume" : "⏸ Pause"}
                              </button>
                              <button
                                type="button"
                                className="rect-button rect-button--danger"
                                onClick={handleEndRecording}
                                disabled={uploadingAnswer}
                              >
                                ■ End
                              </button>
                            </div>
                          ) : (
                            <p className="audio-recorder__hint audio-recorder__hint--success">
                              Question answered
                            </p>
                          )}
                        </div>
                        {displayedTranscript && (
                          <div className="audio-recorder__transcript" aria-live="polite">
                            <p className="audio-recorder__transcript-label">Transcribed answer:</p>
                            <p className="audio-recorder__transcript-text">
                              {displayedTranscript}
                            </p>
                          </div>
                        )}
                        {recorderError && recognitionConstructorRef.current && (
                          <p className="audio-recorder__hint audio-recorder__hint--error">{recorderError}</p>
                        )}
                        {hasAnsweredQuestion && !uploadError && (
                          <p className="audio-recorder__hint audio-recorder__hint--success">
                            Question answered
                          </p>
                        )}
                        {uploadError && (
                          <p className="audio-recorder__hint audio-recorder__hint--error">{uploadError}</p>
                        )}
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