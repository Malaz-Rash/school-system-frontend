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

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      console.log('No refresh token found in localStorage');
      return null;
    }

    try {
      console.log('Attempting to refresh token...');
      const response = await fetch('https://school-system-backend-yr14.onrender.com/api/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      console.log('Refresh token response status:', response.status);
      const data = await response.json();
      if (response.ok) {
        console.log('Token refreshed successfully:', data.token);
        localStorage.setItem('token', data.token);
        return data.token;
      } else {
        console.error('Failed to refresh token:', data.error);
        throw new Error(data.error || 'Failed to refresh token');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchApplication = async () => {
      if (!id || id === 'undefined') {
        console.log('Invalid application ID:', id);
        setError('Invalid application ID. Please go back and select a valid student.');
        return;
      }

      let token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found in localStorage');
        setError('Your session has expired or you are not logged in. Please log in again.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        console.log(`Fetching application with ID ${id} using token: ${token.substring(0, 10)}...`);
        let response = await fetch(`https://school-system-backend-yr14.onrender.com/api/applications/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Fetch application response status:', response.status);
        if (response.status === 403 || response.status === 401) {
          console.log('Token expired or unauthorized, attempting to refresh token...');
          token = await refreshToken();
          if (!token) {
            console.log('Token refresh failed, redirecting to login');
            setError('Your session has expired. Please log in again.');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            setTimeout(() => navigate('/login'), 3000);
            return;
          }

          console.log('Retrying fetch with new token...');
          response = await fetch(`https://school-system-backend-yr14.onrender.com/api/applications/${id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          console.log('Retry fetch response status:', response.status);
        }

        const data = await response.json();
        if (response.ok) {
          console.log('Application data retrieved successfully:', data.application);
          setApplication(data.application);
        } else {
          console.error('Error fetching application:', data.error);
          setError(data.error || 'Error fetching application details.');
        }
      } catch (error) {
        console.error('Error fetching application:', error);
        setError('Error fetching application details due to network issue. Please try again.');
      }
    };

    fetchApplication();
  }, [id, navigate]);

  const markAsSeen = async () => {
    let token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found for markAsSeen');
      setError('Your session has expired or you are not logged in. Please log in again.');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    try {
      console.log(`Marking application ${id} as seen...`);
      let response = await fetch(`https://school-system-backend-yr14.onrender.com/api/applications/${id}/mark-seen`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Mark as seen response status:', response.status);
      if (response.status === 403 || response.status === 401) {
        console.log('Token expired for markAsSeen, attempting to refresh...');
        token = await refreshToken();
        if (!token) {
          console.log('Token refresh failed for markAsSeen, redirecting to login');
          setError('Your session has expired. Please log in again.');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        console.log('Retrying markAsSeen with new token...');
        response = await fetch(`https://school-system-backend-yr14.onrender.com/api/applications/${id}/mark-seen`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        console.log('Retry markAsSeen response status:', response.status);
      }

      const data = await response.json();
      if (response.ok) {
        alert('Results marked as seen successfully.');
        navigate('/all-student-results');
      } else {
        console.error('Error marking as seen:', data.error);
        setError(data.error || 'Error marking results as seen.');
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
          alt="New Generation International Schools Logo"
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