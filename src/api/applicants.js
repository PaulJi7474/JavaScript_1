import { apiRequest } from "./app";

export function getApplicantsByInterview(interviewId) {
  if (!interviewId) {
    return Promise.resolve([]);
  }

  return apiRequest(`/applicant?interview_id=eq.${interviewId}`);
}

export function createApplicant(applicant) {
  return apiRequest("/applicant", "POST", applicant);
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