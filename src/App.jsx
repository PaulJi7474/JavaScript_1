import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Interviews from "./pages/Interviews";
import InterviewForm from "./pages/AddInterview";
import Questions from "./pages/Questions";
import Applicants from "./pages/Applicants";
import TakeInterview from "./pages/TakeInterview";
import EditInterview from "./pages/EditInterview";
import "./App.css";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Interviews />} />
        <Route path="/interviews/new" element={<InterviewForm />} />
        <Route path="/interviews/:id/edit" element={<EditInterview />} />
        <Route path="/interviews/:id/questions" element={<Questions />} />
        <Route path="interviews/:id/applicants" element={<Applicants />} />
        <Route
          path="interviews/:id/applicants/:applicantId/interview"
          element={<TakeInterview />}
        />
      </Routes>
    </Router>
  );
}