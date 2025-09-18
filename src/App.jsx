import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Interviews from "./pages/Interviews";
import InterviewForm from "./pages/InterviewForm";
import Questions from "./pages/Questions";
import "./App.css";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Interviews />} />
        <Route path="/interviews/new" element={<InterviewForm />} />
        <Route path="/interviews/:id/questions" element={<Questions />} />
      </Routes>
    </Router>
  );
}
