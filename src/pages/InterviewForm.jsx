// src/pages/InterviewForm.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function onSubmit(e) {
  e.preventDefault();
  const newId = Date.now(); // 先占位；接 API 后换成返回的 id
  navigate(`/interviews/${newId}/questions`, {
    state: { interviewTitle: form.title },
  });
}

export default function InterviewForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    jobRole: "",
    description: "",
    status: "Draft",
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    // TODO: 这里将来改成 POST /interview，并用返回的 id
    const newId = Date.now(); // 占位 id
    navigate(`/interviews/${newId}/questions`, {
      state: { interviewTitle: form.title },
    });
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto border border-gray-300 p-6 rounded">
        <Link to="/" className="text-blue-600 inline-block mb-4">← Back to Interviews</Link>
        <h2 className="text-2xl font-semibold mb-6">Add New Interview</h2>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block font-medium mb-2">Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={onChange}
              placeholder="Interview Title"
              className="w-full border border-gray-300 rounded px-3 py-3"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Job Role *</label>
            <input
              name="jobRole"
              value={form.jobRole}
              onChange={onChange}
              placeholder="Job Role"
              className="w-full border border-gray-300 rounded px-3 py-3"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              placeholder="Interview Description"
              rows={6}
              className="w-full border border-gray-300 rounded px-3 py-3"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Status *</label>
            <select
              name="status"
              value={form.status}
              onChange={onChange}
              className="w-full border border-gray-300 rounded px-3 py-3"
              required
            >
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </select>
          </div>

          <div className="flex gap-4">
            <button type="submit" className="bg-blue-600 text-white px-5 py-3 rounded">
              Add Interview
            </button>
            <button type="button" onClick={() => navigate(-1)} className="border border-gray-300 px-5 py-3 rounded">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
