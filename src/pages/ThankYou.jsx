import React, { useMemo } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import "./interviewsCss.css";
import { APPLICANTS } from "../data/applicantsData";

const deriveApplicantDetails = (applicant, applicantId) => {
  if (applicant && typeof applicant === "object") {
    return applicant;
  }

  if (!applicantId) {
    return null;
  }

  return APPLICANTS.find((entry) => entry.id === applicantId) || null;
};

const getApplicantName = (applicant) => {
  if (!applicant || typeof applicant !== "object") {
    return "Unnamed Applicant";
  }

  if (typeof applicant.name === "string" && applicant.name.trim()) {
    return applicant.name.trim();
  }

  const fullNameSegments = [applicant.title, applicant.firstname, applicant.surname]
    .filter((segment) => typeof segment === "string" && segment.trim())
    .join(" ");

  if (fullNameSegments) {
    return fullNameSegments;
  }

  if (typeof applicant.full_name === "string" && applicant.full_name.trim()) {
    return applicant.full_name.trim();
  }

  return "Unnamed Applicant";
};

export default function ThankYou() {
  const { id: interviewId, applicantId } = useParams();
  const { state } = useLocation();

  const interviewTitle = useMemo(() => {
    if (typeof state?.interviewTitle === "string" && state.interviewTitle.trim()) {
      return state.interviewTitle.trim();
    }

    return "Untitled Interview";
  }, [state?.interviewTitle]);

  const applicantDetails = useMemo(
    () => deriveApplicantDetails(state?.applicant, applicantId),
    [state?.applicant, applicantId],
  );

  const applicantName = useMemo(() => getApplicantName(applicantDetails), [applicantDetails]);

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
          <section className="card thank-you-card">
            <div className="card__body thank-you-card__body">
              <div className="thank-you-card__icon" aria-hidden="true">
                ✓
              </div>

              <h2 className="thank-you-card__title">Thank You for Completing the Interview!</h2>
              <p className="thank-you-card__subtitle">
                Your responses have been successfully recorded. Our team will review your interview and
                get back to you soon.
              </p>
              <p className="thank-you-card__subtitle">You may now close this window.</p>

              <div className="thank-you-card__details" role="group" aria-label="Interview summary">
                <p className="thank-you-card__detail">
                  <span className="thank-you-card__detail-label">Interview completed for:</span>
                  <span className="thank-you-card__detail-value">{applicantName}</span>
                </p>
                <p className="thank-you-card__detail">
                  <span className="thank-you-card__detail-label">Interview:</span>
                  <span className="thank-you-card__detail-value">{interviewTitle}</span>
                </p>
              </div>

              <div className="thank-you-card__actions">
                <Link
                  to={interviewId ? `/interviews/${interviewId}/applicants` : "/"}
                  className="rect-button rect-button--primary"
                >
                  Back to Applicants
                </Link>
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