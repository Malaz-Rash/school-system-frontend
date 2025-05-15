import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, useNavigate } from 'react-router-dom';
import bgImage from './bg1.jpg';
import './HomePage.css';

function AllStudentResults() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to view this page.');
        return;
      }

      try {
        const response = await fetch('https://school-system-backend-yr14.onrender.com/api/applications', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (response.ok) {
          setApplications(data.applications);
        } else {
          setError(data.error || 'Error fetching applications.');
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        setError('Error fetching applications. Please try again.');
      }
    };

    fetchApplications();
  }, []);

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
        <h2 className="subtitle mb-2">All Student Results</h2>
        <p className="lead mb-3">View Exam Results for All Students</p>
        {error && <p className="text-danger mb-3">{error}</p>}
        {applications.length === 0 ? (
          <p>No applications found.</p>
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
                    {app._id ? (
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
            Go Back
          </button>
          <Link to="/" className="btn nav-btn">Home</Link>
        </div>
      </div>
    </div>
  );
}

export default AllStudentResults;