import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Interviews from "./pages/interviews";
import InterviewForm from "./pages/InterviewForm";
import Questions from "./pages/Questions";
import Applicants from "./pages/Applicants";
import TakeInterview from "./pages/TakeInterview";
import "./App.css";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element = {<Interviews />} />
        <Route path="/interviews/new" element = {<InterviewForm />} />
        <Route path="/interviews/:id/questions" element = {<Questions />} />
        <Route path="interviews/:id/applicants" element = {<Applicants/>}/>
        <Route
          path="interviews/:id/applicants/:applicantId/interview"
          element={<TakeInterview />}
        />
      </Routes>
    </Router>
  );
}