import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { createApplicant } from "../api/applicants";
import "./interviewsCss.css";

const DEFAULT_STATUS = "Not Started";

const KNOWN_TITLES = new Set([
  "mr",
  "mrs",
  "ms",
  "miss",
  "mx",
  "dr",
  "prof",
]);

function parseApplicantName(rawName) {
  if (typeof rawName !== "string") {
    return { title: "", firstname: "", surname: "" };
  }

  const segments = rawName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!segments.length) {
    return { title: "", firstname: "", surname: "" };
  }

  const normalizedFirst = segments[0].replace(/\./g, "").toLowerCase();
  let title = "";
  let remainingSegments = segments;

  if (KNOWN_TITLES.has(normalizedFirst)) {
    [title, ...remainingSegments] = segments;
  }

  if (!remainingSegments.length) {
    return { title, firstname: "", surname: "" };
  }

  if (remainingSegments.length === 1) {
    return { title, firstname: remainingSegments[0], surname: "" };
  }

  return {
    title,
    firstname: remainingSegments[0],
    surname: remainingSegments.slice(1).join(" "),
  };
}

export default function AddApplicant() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: interviewId } = useParams();
  const interviewTitle = location.state?.interviewTitle || "Untitled Interview";
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const interviewReference = useMemo(() => {
    const numericId = Number(interviewId);
    if (Number.isFinite(numericId) && numericId > 0) {
      return numericId;
    }
    return interviewId;
  }, [interviewId]);

  useEffect(() => {
    if (!interviewId) {
      setError("Invalid interview reference.");
    }
  }, [interviewId]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const onCancel = () => {
    if (!interviewId) {
      navigate("/");
      return;
    }

    navigate(`/interviews/${interviewId}/applicants`, {
      state: { interviewTitle },
      replace: true,
    });
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!interviewId) {
      setError("Unable to submit applicant without a valid interview.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    const trimmedForm = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    };

    if (!trimmedForm.name) {
      setError("Name is required.");
      setIsSubmitting(false);
      return;
    }

    const parsedName = parseApplicantName(trimmedForm.name);

    try {
      await createApplicant({
        title: parsedName.title,
        firstname: parsedName.firstname,
        surname: parsedName.surname,
        email_address: trimmedForm.email,
        phone_number: trimmedForm.phone,
        interview_status: DEFAULT_STATUS,
        interview_id: interviewReference,
      });

      navigate(`/interviews/${interviewId}/applicants`, {
        replace: true,
        state: {
          interviewTitle,
          successMessage: "Add applicants success",
        },
      });
    } catch (submissionError) {
      console.error("Failed to add applicant", submissionError);
      setError("Failed to add applicant. Please try again later.");
    } finally {
      setIsSubmitting(false);
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
        <div className="content content--narrow">
          <section className="card card--form">
            <div className="form-card__header">
              <Link
                to={`/interviews/${interviewId}/applicants`}
                state={{ interviewTitle }}
                className="back-link"
              >
                ← Back to applicants
              </Link>
              <h2 className="card__title">Add Applicant</h2>
            </div>

            <form onSubmit={onSubmit} className="form">
              {error ? (
                <p className="form-error" role="alert">
                  {error}
                </p>
              ) : null}

              <div className="form-field">
                <label htmlFor="name">Name *</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={onChange}
                  placeholder="Applicant name"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="Applicant email"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="phone">Phone *</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={onChange}
                  placeholder="Applicant phone"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="interview">Interview *</label>
                <input
                  id="interview"
                  name="interview"
                  type="text"
                  value={interviewTitle}
                  readOnly
                  disabled
                />
              </div>

              <div className="form-field">
                <label htmlFor="status">Status *</label>
                <input
                  id="status"
                  name="status"
                  type="text"
                  value={DEFAULT_STATUS}
                  readOnly
                  disabled
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="button button--primary"
                  disabled={isSubmitting}
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={onCancel}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>

      <footer className="footer">
        © 2025 ReadySetHire - Streamlining the hiring process with AI
      </footer>
    </div>
  );
}