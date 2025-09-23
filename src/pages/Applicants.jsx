import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import "./interviewsCss.css";
import { getApplicantsByInterview } from "../api/applicants";

const statusClassMap = {
  Completed: "status-tag status-tag--completed",
  "Not Started": "status-tag status-tag--pending",
};

export default function Applicants() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: interviewId } = useParams();
  const interviewTitle = location.state?.interviewTitle || "Untitled Interview";
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    () => location.state?.successMessage || "",
  );

  useEffect(() => {
    if (location.state?.successMessage) {
      navigate(location.pathname, {
        replace: true,
        state: { interviewTitle },
      });
    }
  }, [location.state?.successMessage, navigate, location.pathname, interviewTitle]);

  const fetchApplicants = useCallback(async () => {
    if (!interviewId) {
      setApplicants([]);
      setError("Invalid interview reference.");
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const data = await getApplicantsByInterview(interviewId);
      setApplicants(Array.isArray(data) ? data : []);
      setError("");
    } catch (fetchError) {
      console.error("Failed to load applicants", fetchError);
      setError("Unable to load applicants. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [interviewId]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  useEffect(() => {
    if (successMessage) {
      fetchApplicants();
    }
  }, [successMessage, fetchApplicants]);

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 2000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  const normalizedApplicants = useMemo(() => {
    if (!Array.isArray(applicants)) {
      return [];
    }

    return applicants.map((entry, index) => {
      const splitName = [entry?.title, entry?.firstname, entry?.surname]
        .filter((segment) => typeof segment === "string" && segment.trim())
        .join(" ");
      const name =
        (splitName && splitName.trim()) ||
        (typeof entry?.name === "string" && entry.name.trim()) ||
        (typeof entry?.full_name === "string" && entry.full_name.trim()) ||
        "Unnamed Applicant";
      const email =
        (typeof entry?.email === "string" && entry.email.trim()) ||
        (typeof entry?.email_address === "string" && entry.email_address.trim()) ||
        "";
      const phone =
        (typeof entry?.phone === "string" && entry.phone.trim()) ||
        (typeof entry?.phone_number === "string" && entry.phone_number.trim()) ||
        "";
      const status =
        (typeof entry?.status === "string" && entry.status.trim()) ||
        (typeof entry?.application_status === "string" && entry.application_status.trim()) ||
        (typeof entry?.interview_status === "string" && entry.interview_status.trim()) ||
        "Not Started";
      const identifier =
        entry?.id ??
        entry?.applicant_id ??
        entry?.applicantId ??
        (email ? email : index);

      return {
        id: identifier,
        name,
        email,
        phone,
        status,
      };
    });
  }, [applicants]);

  const renderTableBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="6" className="text-center">
            Loading applicants...
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan="6" className="text-center error-text">
            {error}
          </td>
        </tr>
      );
    }

    if (!normalizedApplicants.length) {
      return (
        <tr>
          <td colSpan="6" className="text-center">
            No applicants found.
          </td>
        </tr>
      );
    }

    return normalizedApplicants.map((applicant) => (
      <tr key={applicant.id}>
        <td>{applicant.name}</td>
        <td>{applicant.email || "-"}</td>
        <td>{applicant.phone || "-"}</td>
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
    ));
  };

  const handleAddApplicant = () => {
    if (!interviewId) {
      return;
    }

    navigate(`/interviews/${interviewId}/applicants/new`, {
      state: { interviewTitle },
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
          <Link to="/" className="back-link">
            ← Back to Interviews
          </Link>

          <section className="card">
            <div className="card__header">
              <div>
                <h2 className="card__title">Applicants Management</h2>
                <p className="card__subtitle">Interview: {interviewTitle}</p>
              </div>
              <button
                type="button"
                className="rect-button rect-button--primary"
                onClick={handleAddApplicant}
              >
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
                <tbody>{renderTableBody()}</tbody>
              </table>
            </div>
            {successMessage ? (
              <p className="form-success" role="status">
                {successMessage}
              </p>
            ) : null}
          </section>
        </div>
      </main>

      <footer className="footer">
        © 2025 ReadySetHire - Streamlining the hiring process with AI
      </footer>
    </div>
  );
}