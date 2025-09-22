import { apiRequest } from "./app";

export async function getQuestionCountByInterview(interviewId) {
  const rows = await apiRequest(`/question?interview_id=eq.${interviewId}&select=id`);
  return rows.length;
}

export function getQuestionsByInterview(interviewId) {
  if (!interviewId) {
    return Promise.resolve([]);
  }

  return apiRequest(`/question?interview_id=eq.${interviewId}`);
}

export function createQuestion(question) {
  return apiRequest("/question", "POST", question);
}