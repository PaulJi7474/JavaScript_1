// /question 相关
import { apiRequest } from "./client";

// 只取 id，减少流量；返回数量
export async function getQuestionCountByInterview(interviewId) {
  const rows = await apiRequest(`/question?interview_id=eq.${interviewId}&select=id`);
  return rows.length;
}
