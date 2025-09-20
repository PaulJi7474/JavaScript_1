import React from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import "./interviews.css";
import { APPLICANTS } from "../data/applicants";

const statusClassMap = {
  Completed: "status-tag status-tag--completed",
  "Not Started": "status-tag status-tag--pending",
};

export default function Applicants() {
  const { id: interviewId } = useParams();
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
          <Link to="/" className="back-link">
            ← Back to Interviews
          </Link>

          <section className="card">
            <div className="card__header">
              <div>
                <h2 className="card__title">Applicants Management</h2>
                <p className="card__subtitle">Interview: {interviewTitle}</p>
              </div>
              <button type="button" className="rect-button rect-button--primary">
                + Add Applicant
              </button>
            </div>

            <div className="table-wrapper">
              <table className="interviews-table applicants-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Interview</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {APPLICANTS.map((applicant) => (
                    <tr key={applicant.email}>
                      <td>{applicant.name}</td>
                      <td>{applicant.email}</td>
                      <td>{applicant.phone}</td>
                      <td>{interviewTitle}</td>
                      <td>
                        <span className={statusClassMap[applicant.status] || "status-tag"}>
                          {applicant.status}
                        </span>
                      </td>
                      <td>
                        <div className="actions">
                          <button type="button" className="rect-button rect-button--ghost">
                            Copy Link
                          </button>
                          <Link
                            to={`/interviews/${interviewId}/applicants/${applicant.id}/interview`}
                            state={{ interviewTitle, applicant }}
                            className="rect-button rect-button--outline"
                          >
                            Take Interview
                          </Link>
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