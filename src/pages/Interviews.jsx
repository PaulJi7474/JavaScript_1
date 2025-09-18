// src/pages/Interviews.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Interviews() {
  return (
    <div className="min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold m-0">Interview Management</h3>

        {/* 跳到 InterviewNew */}
        <Link
          to="/interviews/new"
          className="bg-blue-500 text-white px-4 py-2 rounded inline-block"
        >
          + Add Interview
        </Link>
      </div>

      {/* 表格（暂用静态占位） */}
      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-200">
          <tr>
            <th className="border px-4 py-2 text-left">Title</th>
            <th className="border px-4 py-2 text-left">Job Role</th>
            <th className="border px-4 py-2 text-left">Status</th>
            <th className="border px-4 py-2 text-left">Questions</th>
            <th className="border px-4 py-2 text-left">Applicants</th>
            <th className="border px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border px-4 py-2">Frontend Developer Interview</td>
            <td className="border px-4 py-2">Frontend Developer</td>
            <td className="border px-4 py-2">Published</td>
            <td className="border px-4 py-2">3</td>
            <td className="border px-4 py-2">2</td>
            <td className="border px-4 py-2">
              <div className="flex gap-2">
                <button className="text-blue-500">✏️</button>
                <button className="text-red-500">🗑️</button>
              </div>
            </td>
          </tr>
          <tr>
            <td className="border px-4 py-2">Backend Engineer Assessment</td>
            <td className="border px-4 py-2">Backend Engineer</td>
            <td className="border px-4 py-2">Draft</td>
            <td className="border px-4 py-2">0</td>
            <td className="border px-4 py-2">0</td>
            <td className="border px-4 py-2">
              <div className="flex gap-2">
                <button className="text-blue-500">✏️</button>
                <button className="text-red-500">🗑️</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
