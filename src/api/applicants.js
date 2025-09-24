import { apiRequest } from "./app";

export function getApplicantsByInterview(interviewId) {
  if (!interviewId) {
    return Promise.resolve([]);
  }

  return apiRequest(`/applicant?interview_id=eq.${interviewId}`);
}

export async function getApplicantCountByInterview(interviewId) {
  const rows = await getApplicantsByInterview(interviewId);
  return Array.isArray(rows) ? rows.length : 0;
}

export function createApplicant(applicant) {
  return apiRequest("/applicant", "POST", applicant);
}

export function getApplicant(applicantId) {
  if (!applicantId) {
    return Promise.resolve(null);
  }

  const encodedId = encodeURIComponent(applicantId);

  return apiRequest(`/applicant?id=eq.${encodedId}`).then((rows) => {
    if (Array.isArray(rows)) {
      return rows[0] ?? null;
    }

    return rows ?? null;
  });
}

export function updateApplicant(applicantId, applicant) {
  if (!applicantId || !applicant) {
    return Promise.reject(
      new Error("Applicant id and update payload are required"),
    );
  }

  const encodedId = encodeURIComponent(applicantId);

  return apiRequest(`/applicant?id=eq.${encodedId}`, "PATCH", applicant);
}

export function updateApplicantStatus(applicantId, status) {
  const normalizedStatus = typeof status === "string" ? status.trim() : "";

  if (!applicantId || !normalizedStatus) {
    return Promise.reject(new Error("Applicant id and status are required"));
  }

  const encodedId = encodeURIComponent(applicantId);

  return apiRequest(`/applicant?id=eq.${encodedId}`, "PATCH", {
    interview_status: normalizedStatus,
  });
}