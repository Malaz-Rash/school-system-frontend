import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, useNavigate } from 'react-router-dom';
import bgImage from './bg1.jpg';
import './HomePage.css';

function ViewExams() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExams = async () => {
      const token = localStorage.getItem('token');
      const department = localStorage.getItem('department');
      const division = localStorage.getItem('division');
      if (!token || !department || !division) {
        setError('You must be logged in with a valid department and division to view this page.');
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/exams`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          // تصفية الامتحانات بناءً على قسم المستخدم ومادته
          const filteredExams = data.exams.filter(
            exam => exam.subject === department && exam.division === division
          );
          setExams(filteredExams);
        } else {
          setError(data.error || 'Error fetching exams.');
        }
      } catch (error) {
        console.error('Error fetching exams:', error);
        setError('Error fetching exams. Please try again.');
      }
    };

    fetchExams();
  }, []);

  const handleDelete = async (examId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this exam? This action cannot be undone.');
    if (!confirmDelete) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to delete an exam.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/exams/${examId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setExams(exams.filter(exam => exam._id !== examId));
        alert('Exam deleted successfully!');
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
          alt="شعار مدارس الجيل الجديد العالمية"
          className="logo mb-3"
          style={{ maxWidth: '40px' }}
        />
        <h1 className="title mb-2">New Generation International Schools</h1>
        <h2 className="subtitle mb-2">View Exams</h2>
        <p className="lead mb-3">List of Exams Prepared</p>
        {error && <p className="text-danger mb-3">{error}</p>}
        {exams.length === 0 && !error ? (
          <p>No exams found for your department in this division.</p>
        ) : (
          <div className="table-responsive">
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
          </div>
        )}
        <div className="nav-buttons">
          <button
            className="btn nav-btn"
            onClick={() => navigate('/department-head-results')}
          >
            Back to Dashboard
          </button>
          <Link to="/" className="btn nav-btn">Home</Link>
        </div>
      </div>
    </div>
  );
}

export default ViewExams;