// src/pages/Questions.jsx
import React from "react";
import { Link, useLocation, useParams } from "react-router-dom";

const DifficultyBadge = ({ level }) => {
  const base = "px-2 py-1 rounded text-sm";
  const styles = {
    Easy: `${base} bg-blue-100 text-blue-800`,
    Intermediate: `${base} bg-amber-100 text-amber-800`,
    Advanced: `${base} bg-rose-100 text-rose-800`,
  };
  return <span className={styles[level] || base}>{level}</span>;
};

export default function Questions() {
  const { id } = useParams();
  const { state } = useLocation();
  const interviewTitle = state?.interviewTitle || "Untitled Interview";

  // 占位数据；接 API 后替换
  const rows = [
    { q: "Tell me about your experience with React", level: "Easy" },
    { q: "How do you handle state management?", level: "Intermediate" },
    { q: "Explain the virtual DOM", level: "Advanced" },
  ];

  return (
    <div className="min-h-screen p-6">
      {/* 返回 */}
      <div className="mb-4">
        <Link to="/" className="text-blue-600 hover:underline">
          ← Back to Interviews
        </Link>
      </div>

      {/* 标题 + 右侧按钮 */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-semibold">Questions Management</h2>
          <p className="text-gray-600">Interview: {interviewTitle}</p>
        </div>
        <button className="bg-indigo-500 text-white px-4 py-2 rounded">
          + Add Question
        </button>
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left">Question</th>
              <th className="border px-4 py-2 text-left">Interview</th>
              <th className="border px-4 py-2 text-left">Difficulty</th>
              <th className="border px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="border px-4 py-3">{r.q}</td>
                <td className="border px-4 py-3">{interviewTitle}</td>
                <td className="border px-4 py-3">
                  <DifficultyBadge level={r.level} />
                </td>
                <td className="border px-4 py-3">
                  <div className="flex gap-3 text-lg">
                    <button title="Edit" className="text-blue-600">✏️</button>
                    <button title="Delete" className="text-red-600">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 防止未使用变量告警 */}
      <span className="sr-only">Interview ID: {id}</span>
    </div>
  );
}
