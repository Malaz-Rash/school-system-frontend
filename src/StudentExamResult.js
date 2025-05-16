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
      if (!id || id === 'undefined') {
        setError('Invalid application ID. Please go back and select a valid student.');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Your session has expired or you are not logged in. Please log in again.');
        setTimeout(() => navigate('/login'), 3000); // إعادة توجيه بعد 3 ثوانٍ
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
          if (response.status === 401 || response.status === 403) {
            setError('Your session has expired. Please log in again.');
            localStorage.removeItem('token'); // إزالة الـ token القديم
            setTimeout(() => navigate('/login'), 3000); // إعادة توجيه بعد 3 ثوانٍ
          } else {
            setError(data.error || 'Error fetching application details.');
          }
        }
      } catch (error) {
        console.error('Error fetching application:', error);
        setError('Error fetching application details due to network issue. Please try again.');
      }
    };

    fetchApplication();
  }, [id, navigate]);

  const markAsSeen = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Your session has expired or you are not logged in. Please log in again.');
      setTimeout(() => navigate('/login'), 3000);
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
        if (response.status === 401 || response.status === 403) {
          setError('Your session has expired. Please log in again.');
          localStorage.removeItem('token');
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setError(data.error || 'Error marking results as seen.');
        }
      }
    } catch (error) {
      console.error('Error marking results as seen:', error);
      setError('Error marking results as seen due to network issue. Please try again.');
    }
  };

  if (error) {
    return (
      <div className="home-container" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="card">
          <h2>Error</h2>
          <p className="text-danger">{error}</p>
          <div className="nav-buttons">
            <Link to="/all-student-results" className="btn nav-btn">Back to Results List</Link>
            <Link to="/" className="btn nav-btn">Home</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="home-container" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="card">
          <h2>Loading...</h2>
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
        {relevantExams.length === 0 ? (
          <p>No exams found for your department.</p>
        ) : (
          relevantExams.map((exam, examIndex) => (
            <div key={examIndex} className="mb-4">
              <h3>{exam.subject} Exam</h3>
              <p>Score: {exam.score}%</p>
              <p>{exam.comments}</p>
              {exam.results.map((result, resultIndex) => (
                <div key={resultIndex} className="mb-3 p-3 border rounded">
                  <p>
                    <span style={{ marginRight: '10px' }}>
                      {result.isCorrect ? '✅' : '❌'}
                    </span>
                    <strong>Question {resultIndex + 1}:</strong> {result.question}
                  </p>
                  {result.image && result.image !== '' && (
                    <div className="mb-2">
                      <img
                        src={result.image}
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