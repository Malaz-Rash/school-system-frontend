import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, useNavigate } from 'react-router-dom';
import bgImage from './bg1.jpg';
import './HomePage.css';

function AllStudentResults() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
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

  useEffect(() => {
    const fetchApplications = async () => {
      let token = localStorage.getItem('token');
      if (!token) {
        setError('Your session has expired or you are not logged in. Please log in again.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        let response = await fetch('https://school-system-backend-yr14.onrender.com/api/applications', {
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

          response = await fetch('https://school-system-backend-yr14.onrender.com/api/applications', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
        }

        const data = await response.json();
        if (response.ok) {
          setApplications(data.applications);
          if (data.applications.length === 0) {
            setError('No student applications found. Please register a new student first.');
          }
        } else {
          setError(data.error || 'Error fetching applications.');
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        setError('Error fetching applications. Please try again.');
      }
    };

    fetchApplications();
  }, [navigate]);

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
        <h2 className="subtitle mb-2">All Student Results</h2>
        <p className="lead mb-3">View Exam Results for All Students</p>
        {error && <p className="text-danger mb-3">{error}</p>}
        {applications.length === 0 && !error ? (
          <p>No applications found. Please register a new student first.</p>
        ) : (
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Division</th>
                <th>Stage</th>
                <th>Level</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, index) => (
                <tr key={index}>
                  <td>{app.studentId?.name || 'N/A'}</td>
                  <td>{app.division}</td>
                  <td>{app.stage}</td>
                  <td>{app.level}</td>
                  <td>
                    {app._id && app._id !== 'undefined' ? (
                      <Link
                        to={`/student-exam-result/${app._id}`}
                        className="btn btn-primary btn-sm"
                      >
                        View Results
                      </Link>
                    ) : (
                      <span className="text-muted">No results available</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="nav-buttons">
          <button
            onClick={() => navigate('/department-head-results')}
            className="btn nav-btn"
          >
            Back to Dashboard
          </button>
          <Link to="/" className="btn nav-btn">Home</Link>
        </div>
      </div>
    </div>
  );
}

export default AllStudentResults;