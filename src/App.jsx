import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Interviews from './pages/interviews'
import Header  from './pages/header'
import InterviewForm from './pages/InterviewForm'
import Questions from "./pages/Questions"; 

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


