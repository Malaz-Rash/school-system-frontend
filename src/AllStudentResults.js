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
    const fetchApplications = async () => {
      let token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found in localStorage');
        setError('Your session has expired or you are not logged in. Please log in again.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        console.log('Fetching applications...');
        let response = await fetch('https://school-system-backend-yr14.onrender.com/api/applications', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Fetch applications response status:', response.status);
        if (response.status === 403 || response.status === 401) {
          console.log('Token expired, attempting to refresh...');
          token = await refreshToken();
          if (!token) {
            console.log('Token refresh failed, redirecting to login');
            setError('Your session has expired. Please log in again.');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            setTimeout(() => navigate('/login'), 3000);
            return;
          }

          console.log('Retrying fetch applications with new token...');
          response = await fetch('https://school-system-backend-yr14.onrender.com/api/applications', {
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
          console.log('Applications retrieved:', data.applications);
          setApplications(data.applications);
          if (data.applications.length === 0) {
            setError('No student applications found. Please register a new student first.');
          }
        } else {
          console.error('Error fetching applications:', data.error);
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
              {applications.map((app, index) => {
                console.log(`Rendering application ${index}:`, app);
                return (
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
                          onClick={() => console.log(`Navigating to /student-exam-result/${app._id}`)}
                        >
                          View Results
                        </Link>
                      ) : (
                        <span className="text-muted">No results available</span>
                      )}
                    </td>
                  </tr>
                );
              })}
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