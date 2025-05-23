import React, { useState, useEffect, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, useNavigate } from 'react-router-dom';
import bgImage from './bg1.jpg';
import './HomePage.css';

function ViewExams() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [error, setError] = useState('');

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch('https://school-system-backend-yr14.onrender.com/api/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        return data.token;
      } else {
        throw new Error(data.error || 'Failed to refresh token');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  };

  const fetchExams = useCallback(async () => {
    let token = localStorage.getItem('token');
    if (!token) {
      setError('Your session has expired or you are not logged in. Please log in again.');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    const department = localStorage.getItem('department');
    const division = localStorage.getItem('division');
    const userRole = localStorage.getItem('role');

    if (userRole !== 'Admin' && (!department || !division)) {
      setError('Please log in to view exams for your department.');
      return;
    }

    try {
      let response = await fetch(`https://school-system-backend-yr14.onrender.com/api/exams`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 403 || response.status === 401) {
        token = await refreshToken();
        if (!token) {
          setError('Your session has expired. Please log in again.');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        response = await fetch(`https://school-system-backend-yr14.onrender.com/api/exams`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }

      const data = await response.json();
      if (response.ok) {
        const filteredExams = userRole === 'Admin' 
          ? data.exams 
          : data.exams.filter(exam => exam.subject === department && exam.division === division);
        setExams(filteredExams);
        if (filteredExams.length === 0) {
          setError('No exams found for your department in this division.');
        } else {
          setError('');
        }
      } else {
        setError(data.error || 'Error fetching exams.');
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      setError('Error fetching exams. Please try again.');
    }
  }, [navigate]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handleDelete = async (examId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this exam? This action cannot be undone.');
    if (!confirmDelete) {
      return;
    }

    let token = localStorage.getItem('token');
    if (!token) {
      setError('Your session has expired or you are not logged in. Please log in again.');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    try {
      let response = await fetch(`https://school-system-backend-yr14.onrender.com/api/exams/${examId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 403 || response.status === 401) {
        token = await refreshToken();
        if (!token) {
          setError('Your session has expired. Please log in again.');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        response = await fetch(`https://school-system-backend-yr14.onrender.com/api/exams/${examId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Error parsing response as JSON:', jsonError);
        setError('Unexpected response from server. Please try again.');
        return;
      }

      if (response.ok) {
        alert('Exam deleted successfully!');
        fetchExams();
      } else {
        setError(data.error || 'Error deleting exam.');
      }
    } catch (error) {
      console.error('Error deleting exam:', error);
      setError('Error deleting exam. Please try again.');
    }
  };

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
        <h2 className="subtitle mb-2">View Exams</h2>
        <p className="lead mb-3">List of Prepared Exams</p>
        {error ? (
          <>
            <p className="text-danger mb-3">{error}</p>
            <div className="nav-buttons">
              <button
                className="btn nav-btn"
                onClick={() => navigate(localStorage.getItem('role') === 'Admin' ? '/admin-dashboard' : '/department-head-results')}
              >
                Back to Dashboard
              </button>
              <Link to="/" className="btn nav-btn">Home</Link>
            </div>
          </>
        ) : (
          <div className="table-responsive">
            {exams.length === 0 ? (
              <p>No exams found for your department in this division.</p>
            ) : (
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Division</th>
                    <th>Stage</th>
                    <th>Level</th>
                    <th>Number of Questions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((exam) => (
                    <tr key={exam._id}>
                      <td>{exam.subject}</td>
                      <td>{exam.division}</td>
                      <td>{exam.stage}</td>
                      <td>{exam.level}</td>
                      <td>{exam.questions.length}</td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm me-2"
                          onClick={() => navigate(`/edit-exam/${exam._id}`)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(exam._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="nav-buttons">
              <button
                className="btn nav-btn"
                onClick={() => navigate(localStorage.getItem('role') === 'Admin' ? '/admin-dashboard' : '/department-head-results')}
              >
                Back to Dashboard
              </button>
              <Link to="/" className="btn nav-btn">Home</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewExams;