import { apiRequest } from "./client";

export async function getQuestionCountByInterview(interviewId) {
  const rows = await apiRequest(`/question?interview_id=eq.${interviewId}&select=id`);
  return rows.length;
}
