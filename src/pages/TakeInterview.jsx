import React from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import "./interviewsCss.css";
import { APPLICANTS } from "../data/applicantsData";

export default function TakeInterview() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id: interviewId, applicantId } = useParams();
  const interviewTitle = state?.interviewTitle || "Untitled Interview";
  const applicantFromState = state?.applicant;
  const applicantDetails =
    applicantFromState || APPLICANTS.find((applicant) => applicant.id === applicantId);

  const handleStartInterview = () => {
    if (!interviewId || !applicantDetails?.id) {
      return;
    }

    navigate(
      `/interviews/${interviewId}/applicants/${applicantDetails.id}/interview/questions`,
      {
        state: {
          interviewTitle,
          applicant: applicantDetails,
        },
      },
    );
  }

  if (!applicantDetails) {
    return (
      <div className="page-layout">
        <header className="header">
          <div className="header__left">
            <Link to="/" className="header__action">
              Interviews
            </Link>
          </div>
          <h1 className="header__title">ReadySetHire - AI-Powered Interview Platform</h1>
        </header>
        <main className="main">
          <div className="content">
            <div className="card">
              <h2 className="card__title">Applicant not found</h2>
              <p>The applicant you are looking for could not be located.</p>
              <Link to={`/interviews/${interviewId}/applicants`} className="rect-button rect-button--primary">
                Back to Applicants
              </Link>
            </div>
          </div>
        </main>
        <footer className="footer">
          © 2025 ReadySetHire - Streamlining the hiring process with AI
        </footer>
      </div>
    );
  }

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

          <section className="card card--centered take-interview-card">
            <div className="card__body card__body--take-interview">
              <h2 className="card__title">Welcome to Your Interview</h2>
              <div className="take-interview__details">
                <div className="take-interview__section">
                  <h3 className="take-interview__heading">Applicant Details:</h3>
                  <p>{applicantDetails.name}</p>
                  <p>{applicantDetails.email}</p>
                </div>
                <div className="take-interview__section">
                  <h3 className="take-interview__heading">Interview:</h3>
                  <p>{interviewTitle}</p>
                  <p>Interview for {interviewTitle} position</p>
                </div>
              </div>
              <button
                type="button"
                className="rect-button rect-button--primary start-interview__button"
                onClick={handleStartInterview}
              >
                Start Interview
              </button>
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