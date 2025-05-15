import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import bgImage from './bg1.jpg';
import './HomePage.css';

function StudentExamResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplication = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to view this page.');
        return;
      }

      try {
        const response = await fetch(`https://school-system-backend-yr14.onrender.com/api/applications/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (response.ok) {
          setApplication(data.application);
        } else {
          setError(data.error || 'Error fetching application details.');
        }
      } catch (error) {
        console.error('Error fetching application:', error);
        setError('Error fetching application details. Please try again.');
      }
    };

    fetchApplication();
  }, [id]);

  const markAsSeen = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to perform this action.');
      return;
    }

    try {
      const response = await fetch(`https://school-system-backend-yr14.onrender.com/api/applications/${id}/mark-seen`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok) {
        alert('Results marked as seen.');
        navigate('/all-student-results');
      } else {
        setError(data.error || 'Error marking results as seen.');
      }
    } catch (error) {
      console.error('Error marking results as seen:', error);
      setError('Error marking results as seen. Please try again.');
    }
  };

  if (!application) {
    return (
      <div className="home-container" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="card">
          <h2>Loading...</h2>
          {error && <p className="text-danger">{error}</p>}
        </div>
      </div>
    );
  }

  const department = localStorage.getItem('department');
  const relevantExams = application.exams.filter(exam => exam.subject === department);

  return (
    <div className="home-container" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="card">
        <img
          src="/images/logo.jpg"
          alt="شعار مدارس الجيل الجديد العالمية"
          className="logo mb-3"
          style={{ maxWidth: '40px' }}
        />
        <h1 className="title mb-2">New Generation International Schools</h1>
        <h2 className="subtitle mb-2">Student Exam Results</h2>
        <p className="lead mb-3">Review Student Performance</p>
        {error && <p className="text-danger mb-3">{error}</p>}
        {relevantExams.length === 0 ? (
          <p>No exams found for your department.</p>
        ) : (
          relevantExams.map((exam, examIndex) => (
            <div key={examIndex} className="mb-4">
              <h3>{exam.subject} Exam</h3>
              <p>Score: {Math.round(exam.score)}%</p>
              <p>{exam.comments}</p>
              {exam.results.map((result, resultIndex) => (
                <div key={resultIndex} className="mb-3 p-3 border rounded">
                  <p>
                    <span style={{ marginRight: '10px' }}>
                      {result.isCorrect ? '✅' : '❌'}
                    </span>
                    <strong>Question {resultIndex + 1}:</strong> {result.question}
                  </p>
                  {result.image && (
                    <div className="mb-2">
                      <img
                        src={`https://school-system-backend-yr14.onrender.com${result.image}`}
                        alt={`Diagram for question ${resultIndex + 1}`}
                        style={{ maxWidth: '300px', maxHeight: '300px', width: '100%', height: 'auto' }}
                      />
                    </div>
                  )}
                  <p><strong>Student's Answer:</strong> {result.studentAnswer}</p>
                  <p><strong>Correct Answer:</strong> {result.correctAnswer}</p>
                </div>
              ))}
            </div>
          ))
        )}
        <div className="nav-buttons">
          <button onClick={markAsSeen} className="btn section-btn me-2">
            Mark as Seen
          </button>
          <Link to="/all-student-results" className="btn nav-btn">Back to Results List</Link>
          <Link to="/" className="btn nav-btn">Home</Link>
        </div>
      </div>
    </div>
  );
}

export default StudentExamResult;