import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { getApplicant, updateApplicant } from "../api/applicants";
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

function buildDisplayName(applicant) {
  if (!applicant || typeof applicant !== "object") {
    return "";
  }

  const segments = [
    applicant?.title,
    applicant?.firstname ?? applicant?.first_name,
    applicant?.surname ?? applicant?.last_name,
  ]
    .map((segment) => (typeof segment === "string" ? segment.trim() : ""))
    .filter(Boolean);

  if (segments.length) {
    return segments.join(" ");
  }

  const fallbackName =
    applicant?.name ??
    applicant?.full_name ??
    applicant?.display_name ??
    "";

  return typeof fallbackName === "string" ? fallbackName.trim() : "";
}

function extractEmail(applicant) {
  const email =
    applicant?.email ??
    applicant?.email_address ??
    applicant?.emailAddress ??
    "";

  return typeof email === "string" ? email.trim() : "";
}

function extractPhone(applicant) {
  const phone =
    applicant?.phone ??
    applicant?.phone_number ??
    applicant?.phoneNumber ??
    "";

  return typeof phone === "string" ? phone.trim() : "";
}

function extractStatus(applicant) {
  const status =
    applicant?.interview_status ??
    applicant?.application_status ??
    applicant?.status ??
    DEFAULT_STATUS;

  return typeof status === "string" && status.trim()
    ? status.trim()
    : DEFAULT_STATUS;
}

function extractInterviewTitle(applicant) {
  const title = applicant?.interview_title ?? applicant?.interviewTitle ?? "";
  return typeof title === "string" ? title.trim() : "";
}

export default function EditApplicant() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: interviewId, applicantId } = useParams();
  const incomingInterviewTitle =
    location.state?.interviewTitle || "Untitled Interview";
  const applicantFromState = location.state?.applicant;
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    status: DEFAULT_STATUS,
  });
  const [interviewTitle, setInterviewTitle] = useState(
    incomingInterviewTitle,
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const normalizedApplicantFromState = useMemo(() => {
    if (!applicantFromState) {
      return null;
    }

    return {
      name: buildDisplayName(applicantFromState),
      email: extractEmail(applicantFromState),
      phone: extractPhone(applicantFromState),
      status: extractStatus(applicantFromState),
      interviewTitle: extractInterviewTitle(applicantFromState),
    };
  }, [applicantFromState]);

  useEffect(() => {
    if (normalizedApplicantFromState) {
      setForm({
        name: normalizedApplicantFromState.name,
        email: normalizedApplicantFromState.email,
        phone: normalizedApplicantFromState.phone,
        status: normalizedApplicantFromState.status,
      });

      if (normalizedApplicantFromState.interviewTitle) {
        setInterviewTitle(normalizedApplicantFromState.interviewTitle);
      }

      setIsLoading(false);
    }
  }, [normalizedApplicantFromState]);

  useEffect(() => {
    if (normalizedApplicantFromState) {
      return;
    }

    let isMounted = true;

    async function fetchApplicant() {
      if (!applicantId) {
        setError("Invalid applicant reference.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const data = await getApplicant(applicantId);

        if (!isMounted) {
          return;
        }

        if (data) {
          setForm({
            name: buildDisplayName(data),
            email: extractEmail(data),
            phone: extractPhone(data),
            status: extractStatus(data),
          });

          const fetchedInterviewTitle = extractInterviewTitle(data);
          if (fetchedInterviewTitle) {
            setInterviewTitle(fetchedInterviewTitle);
          }
        } else {
          setError("Applicant not found.");
        }
      } catch (fetchError) {
        console.error("Failed to load applicant", fetchError);
        setError("Unable to load applicant. Please try again later.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchApplicant();

    return () => {
      isMounted = false;
    };
  }, [applicantId, normalizedApplicantFromState]);

  const onChange = (event) => {
    const { name, value } = event.target;

    if (!name) {
      return;
    }

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

    if (!interviewId || !applicantId) {
      setError("Invalid interview or applicant reference.");
      return;
    }

    setError("");
    setSuccess("");
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

    if (!trimmedForm.email) {
      setError("Email is required.");
      setIsSubmitting(false);
      return;
    }

    const parsedName = parseApplicantName(trimmedForm.name);

    try {
      await updateApplicant(applicantId, {
        title: parsedName.title,
        firstname: parsedName.firstname,
        surname: parsedName.surname,
        email_address: trimmedForm.email,
        phone_number: trimmedForm.phone,
      });

      setSuccess("Applicant successfully updated");

      navigate(`/interviews/${interviewId}/applicants`, {
        replace: true,
        state: {
          interviewTitle,
          successMessage: "Applicant updated successfully",
        },
      });
    } catch (submissionError) {
      console.error("Failed to update applicant", submissionError);
      setError("Failed to update applicant. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-layout">
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
          <section className="card card--form">
            <div className="form-card__header">
              <Link
                to={`/interviews/${interviewId}/applicants`}
                state={{ interviewTitle: incomingInterviewTitle }}
                className="back-link"
              >
                ← Back to applicants
              </Link>
              <h2 className="card__title">Edit Applicant</h2>
            </div>

            {isLoading ? (
              <p className="form-info">Loading applicant...</p>
            ) : (
              <form onSubmit={onSubmit} className="form">
                {error ? (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                ) : null}

                {success ? (
                  <p className="form-success" role="status">
                    {success}
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
                  <label htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={onChange}
                    placeholder="Applicant phone"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="interviewTitle">Interview</label>
                  <input
                    id="interviewTitle"
                    type="text"
                    value={interviewTitle}
                    disabled
                    readOnly
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="status">Status</label>
                  <input
                    id="status"
                    type="text"
                    value={form.status}
                    disabled
                    readOnly
                  />
                </div>
                <div className="form-actions">
                  <button
                    type="submit"
                    className="button button--primary"
                    disabled={isSubmitting}
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={onCancel}
                    className="button button--secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </main>

      <footer className="footer">
        © 2025 ReadySetHire - Streamlining the hiring process with AI
      </footer>
    </div>
  );
}