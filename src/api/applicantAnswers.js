import { apiRequest } from "./app";

export function createApplicantAnswer(answer) {
  if (!answer || typeof answer !== "object") {
    return Promise.reject(new Error("Answer payload is required"));
  }

  return apiRequest("/applicant_answer", "POST", answer);
}