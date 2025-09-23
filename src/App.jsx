import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Interviews from "./pages/Interviews";
import InterviewForm from "./pages/AddInterview";
import TakeInterview from "./pages/TakeInterview";
import EditInterview from "./pages/EditInterview";
import Questions from "./pages/Questions";
import AddQuestion from "./pages/AddQuestion";
import QuestionsPages from "./pages/QuestionsPages";
import Applicants from "./pages/Applicants";
import AddApplicant from "./pages/AddApplicant"
import ThankYou from "./pages/ThankYou";

import "./App.css";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Interviews />} />
        <Route path="/interviews/new" element={<InterviewForm />} />
        <Route path="/interviews/:id/edit" element={<EditInterview />} />
        <Route path="/interviews/:id/questions" element={<Questions />} />
        <Route path="/interviews/:id/questions/new" element={<AddQuestion />} />
        <Route
          path="interviews/:id/applicants/:applicantId/interview/questions"
          element={<QuestionsPages />}
        />
        <Route path="/interviews/:id/applicants" element={<Applicants />} />
        <Route path="/interviews/:id/applicants/new" element={<AddApplicant />} />
        <Route
          path="interviews/:id/applicants/:applicantId/interview/completed"
          element={<ThankYou />}
        />
        <Route
          path="interviews/:id/applicants/:applicantId/interview"
          element={<TakeInterview />}
        />
      </Routes>
    </Router>
  );
}