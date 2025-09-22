import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getInterviews } from "../api/app";
import "./interviewsCss.css";

const STATUS_CLASS_MAP = {
  Published: "status-badge status-badge--published",
  Draft: "status-badge status-badge--draft",
};

export default function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchInterviews() {
      try {
        const data = await getInterviews();
        if (isMounted) {
          setInterviews(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError("Unable to load interviews. Please try again later.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchInterviews();

    return () => {
      isMounted = false;
    };
  }, []);

  const aggregatedInterviews = useMemo(() => {
    if (!Array.isArray(interviews) || !interviews.length) {
      return [];
    }

    const groups = new Map();

    interviews.forEach((interview) => {
      if (!interview || typeof interview !== "object") {
        return;
      }

      const normalizedTitle = interview.title?.trim() || "Untitled Interview";
      const normalizedJobRole = interview.job_role?.trim() || "Unknown role";
      const normalizedStatus = interview.status || "Unknown";
      const groupKey =
        interview.id ??
        `${normalizedTitle.toLowerCase()}|${normalizedJobRole.toLowerCase()}|${normalizedStatus.toLowerCase()}`;

      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          interview: {
            ...interview,
            title: normalizedTitle,
            job_role: normalizedJobRole,
            status: normalizedStatus,
          },
          count: 0,
        });
      }

      const entry = groups.get(groupKey);
      entry.count += 1;

      if (!entry.interview.id && interview.id) {
        entry.interview = {
          ...interview,
          title: normalizedTitle,
          job_role: normalizedJobRole,
          status: normalizedStatus,
        };
      }
    });

    return Array.from(groups.values());
  }, [interviews]);

  const renderStatusBadge = (status) => {
    const text = status || "Unknown";
    const className = STATUS_CLASS_MAP[text] || "status-badge";
    return <span className={className}>{text}</span>;
  };

  const renderTableBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="6" className="text-center">
            Loading interviews...
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

    if (!aggregatedInterviews.length) {
      return (
        <tr>
          <td colSpan="6" className="text-center">
            No interviews found.
          </td>
        </tr>
      );
    }

    return aggregatedInterviews.map(({ interview, count }) => {
      const { id, title, job_role: jobRole, status } = interview;
      const questionLabel = `${count} Question${count > 1 ? "s" : ""}`;
      const interviewId = id ?? title.toLowerCase();
      const rowKey = id ?? `${title}-${jobRole}-${status}`;

      return (
        <tr key={rowKey}>
          <td>{title}</td>
          <td>{jobRole}</td>
          <td>{renderStatusBadge(status)}</td>
          <td>
            <Link
              to={`/interviews/${interviewId}/questions`}
              state={{ interviewTitle: title }}
              className="link"
            >
              {questionLabel}
            </Link>
          </td>
          <td>
            <Link
              to={`/interviews/${interviewId}/applicants`}
              state={{ interviewTitle: title }}
              className="link"
            >
              View Applicants
            </Link>
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

// ------------------------------------------------

import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { deleteInterview, getInterviews } from "../api/app";
import "./interviewsCss.css";

const STATUS_CLASS_MAP = {
  Published: "status-badge status-badge--published",
  Draft: "status-badge status-badge--draft",
};

export default function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function fetchInterviews() {
      try {
        const data = await getInterviews();
        if (isMounted) {
          setInterviews(Array.isArray(data) ? data : []);
          setActionError("");
        }
      } catch (fetchError) {
        console.error("Unable to load interviews", fetchError);
        if (isMounted) {
          setError("Unable to load interviews. Please try again later.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchInterviews();

    return () => {
      isMounted = false;
    };
  }, []);

  const aggregatedInterviews = useMemo(() => {
    if (!Array.isArray(interviews) || !interviews.length) {
      return [];
    }

    const groups = new Map();

    interviews.forEach((interview) => {
      if (!interview || typeof interview !== "object") {
        return;
      }

      const normalizedTitle = interview.title?.trim() || "Untitled Interview";
      const normalizedJobRole = interview.job_role?.trim() || "Unknown role";
      const normalizedStatus = interview.status || "Unknown";
      const groupKey =
        interview.id ??
        `${normalizedTitle.toLowerCase()}|${normalizedJobRole.toLowerCase()}|${normalizedStatus.toLowerCase()}`;

      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          interview: {
            ...interview,
            title: normalizedTitle,
            job_role: normalizedJobRole,
            status: normalizedStatus,
          },
          count: 0,
        });
      }

      const entry = groups.get(groupKey);
      entry.count += 1;

      if (!entry.interview.id && interview.id) {
        entry.interview = {
          ...interview,
          title: normalizedTitle,
          job_role: normalizedJobRole,
          status: normalizedStatus,
        };
      }
    });

    return Array.from(groups.values());
  }, [interviews]);

  const renderStatusBadge = (status) => {
    const text = status || "Unknown";
    const className = STATUS_CLASS_MAP[text] || "status-badge";
    return <span className={className}>{text}</span>;
  };

  const renderTableBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="6" className="text-center">
            Loading interviews...
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

    if (!aggregatedInterviews.length) {
      return (
        <tr>
          <td colSpan="6" className="text-center">
            No interviews found.
          </td>
        </tr>
      );
    }

    return aggregatedInterviews.map(({ interview, count }) => {
      const { id, title, job_role: jobRole, status } = interview;
      const questionLabel = `${count} Question${count > 1 ? "s" : ""}`;
      const interviewId = id ?? title.toLowerCase();
      const rowKey = id ?? `${title}-${jobRole}-${status}`;

      return (
        <tr key={rowKey}>
          <td>{title}</td>
          <td>{jobRole}</td>
          <td>{renderStatusBadge(status)}</td>
          <td>
            <Link
              to={`/interviews/${interviewId}/questions`}
              state={{ interviewTitle: title }}
              className="link"
            >
              {questionLabel}
            </Link>
          </td>
          <td>
            <Link
              to={`/interviews/${interviewId}/applicants`}
              state={{ interviewTitle: title }}
              className="link"
            >
              View Applicants
            </Link>
          </td>
          <td>
            <div className="actions">
              <button
                type="button"
                className="action-button"
                aria-label="Edit interview"
                onClick={() => id && navigate(`/interviews/${id}/edit`)}
                disabled={!id}
              >
                ✏️
              </button>
              <button
                type="button"
                className="action-button"
                aria-label="Delete interview"
                onClick={() => handleDelete(id)}
                disabled={!id || deletingId === id}
              >
                {deletingId === id ? "⌛" : "🗑️"}
              </button>
            </div>
          </td>
        </tr>
      );
    });
  };

  const handleDelete = async (id) => {
    if (!id) {
      return;
    }

    const confirmed = window.confirm("Are you sure you want to delete this interview?");

    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setActionError("");

    try {
      await deleteInterview(id);
      setInterviews((previous) =>
        Array.isArray(previous) ? previous.filter((interview) => interview?.id !== id) : previous,
      );
    } catch (deleteError) {
      console.error("Failed to delete interview", deleteError);
      setActionError("Failed to delete interview. Please try again.");
    } finally {
      setDeletingId(null);
    }
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
          <section className="card">
            <div className="card__header">
              <h2 className="card__title">Interviews Management</h2>
              <Link to="/interviews/new" className="add-interview">
                + Add Interview
              </Link>
            </div>

            <div className="table-wrapper">
              {actionError ? (
                <div className="error-text" role="alert">
                  {actionError}
                </div>
              ) : null}
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