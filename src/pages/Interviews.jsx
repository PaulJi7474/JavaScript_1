import React from "react";
import { Link } from "react-router-dom";
import "./interviewsCss.css";

export default function Interviews() {
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
          <section className="card">
            <div className="card__header">
              <h2 className="card__title">Interviews Management</h2>
              <Link to="/interviews/new" className="add-interview">
                + Add Interview
              </Link>
            </div>

            <div className="table-wrapper">
              <table className="interviews-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Job Role</th>
                    <th>Status</th>
                    <th>Questions</th>
                    <th>Applicants</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Frontend Developer Interview</td>
                    <td>Frontend Developer</td>
                    <td>
                      <span className="status-badge status-badge--published">Published</span>
                    </td>
                    <td>
                      <Link
                        to="/interviews/1/questions"
                        state={{ interviewTitle: "Frontend Developer Interview" }}
                        className="link"
                      >
                        3 Questions
                      </Link>
                    </td>
                    <td>
                      <div className="applicants">
                        <div className="applicants__summary">
                          <span>2 Applicants</span>
                          <small>1 Completed</small>
                          <small>1 Pending</small>
                        </div>
                        <Link
                          to="/interviews/1/applicants"
                          state={{ interviewTitle: "Frontend Developer Interview" }}
                          className="link link--inline"
                        >
                          View Applicants
                        </Link>
                      </div>
                    </td>
                    <td>
                      <div className="actions">
                        <button type="button" className="action-button" aria-label="Edit interview">
                          ✏️
                        </button>
                        <button type="button" className="action-button" aria-label="Delete interview">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>Backend Engineer Assessment</td>
                    <td>Backend Engineer</td>
                    <td>
                      <span className="status-badge status-badge--draft">Draft</span>
                    </td>
                    <td>
                      <span className="link">0 Questions</span>
                    </td>
                    <td>
                      <div className="applicants">
                        <span>0 Applicants</span>
                      </div>
                    </td>
                    <td>
                      <div className="actions">
                        <button type="button" className="action-button" aria-label="Edit interview">
                          ✏️
                        </button>
                        <button type="button" className="action-button" aria-label="Delete interview">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
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