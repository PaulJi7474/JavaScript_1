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