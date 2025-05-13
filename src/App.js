import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import SelectStage from './SelectStage';
import SelectLevel from './SelectLevel';
import SelectSubLevel from './SelectSubLevel';
import RegisterForm from './RegisterForm';
import AdmissionExam from './AdmissionExam';
import Login from './Login';
import CreateExam from './CreateExam';
import ThankYouPage from './ThankYouPage';
import DepartmentHeadResults from './DepartmentHeadResults';
import ViewExams from './ViewExams';
import EditExam from './EditExam';
import StudentExamResult from './StudentExamResult';
import AllStudentResults from './AllStudentResults';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/select-stage" element={<SelectStage />} />
          <Route path="/select-level" element={<SelectLevel />} />
          <Route path="/select-sub-level" element={<SelectSubLevel />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/admission-exam" element={<AdmissionExam />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create-exam" element={<CreateExam />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
          <Route path="/department-head-results" element={<DepartmentHeadResults />} />
          <Route path="/view-exams" element={<ViewExams />} />
          <Route path="/edit-exam/:id" element={<EditExam />} />
          <Route path="/student-exam-result/:applicationId" element={<StudentExamResult />} />
          <Route path="/all-student-results" element={<AllStudentResults />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;