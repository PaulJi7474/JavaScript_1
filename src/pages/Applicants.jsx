import React from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import "./Interviews.css";

const applicants = [
  {
    name: "Mr John Smith",
    email: "john@email.com",
    phone: "555-0123",
    status: "Completed",
  },
  {
    name: "Ms Sarah Johnson",
    email: "sarah@email.com",
    phone: "555-0456",
    status: "Not Started",
  },
];

const statusClassMap = {
  Completed: "status-tag status-tag--completed",
  "Not Started": "status-tag status-tag--pending",
};

export default function Applicants() {
  const { id } = useParams();
  const { state } = useLocation();
  const interviewTitle = state?.interviewTitle || "Untitled Interview";

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
                  {applicants.map((applicant) => (
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
                          <button type="button" className="rect-button rect-button--outline">
                            Take Interview
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