import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useParams, useNavigate, Link } from 'react-router-dom';
import bgImage from './bg1.jpg';
import './HomePage.css';

function StudentExamResult() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [application, setApplication] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResult = async () => {
      const token = localStorage.getItem('token');
      const department = localStorage.getItem('department');
      console.log('Fetching result for applicationId:', applicationId);
      console.log('Token:', token);
      console.log('Department:', department);

      if (!token) {
        setError('You must be logged in to view this page.');
        return;
      }

      if (!department) {
        setError('Department information is missing in local storage.');
        return;
      }

      try {
        // جلب بيانات الطلب للحصول على اسم الطالب، المرحلة، والمستوى
        console.log('Fetching application data from /api/applications/:id');
        const appResponse = await fetch(`http://localhost:5000/api/applications/${applicationId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log('Application Response status:', appResponse.status);
        const appData = await appResponse.json();
        console.log('Application Response data:', appData);

        if (appResponse.ok) {
          setApplication(appData.application);
        } else {
          setError(appData.error || 'Error fetching application data.');
          return;
        }

        // جلب نتائج الامتحان
        console.log('Fetching exam results from /api/applications/:id/results');
        const response = await fetch(`http://localhost:5000/api/applications/${applicationId}/results`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log('Results Response status:', response.status);
        const data = await response.json();
        console.log('Results Response data:', data);

        if (response.ok) {
          // نأخذ نتيجة الامتحان التي تخص قسم المستخدم فقط
          const departmentResult = data.results.find(
            exam => {
              console.log('Checking exam:', exam);
              return exam.subject === department;
            }
          );
          console.log('Department Result:', departmentResult);

          if (departmentResult) {
            setResult(departmentResult);

            // تحديث حالة seenByDepartmentHead إلى true
            console.log('Marking result as seen via /api/applications/:id/mark-seen');
            const markSeenResponse = await fetch(`http://localhost:5000/api/applications/${applicationId}/mark-seen`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            const markSeenData = await markSeenResponse.json();
            console.log('Mark seen response:', markSeenData);
          } else {
            setError('No results found for your department.');
          }
        } else {
          setError(data.error || 'Error fetching result.');
        }
      } catch (error) {
        console.error('Error fetching result:', error);
        setError('Error fetching result. Please try again.');
      }
    };

    fetchResult();
  }, [applicationId]);

  if (error) {
    return (
      <div className="home-container" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="card">
          <p className="text-danger">{error}</p>
          <div className="nav-buttons">
            <button
              onClick={() => navigate(-1)}
              className="btn nav-btn"
            >
              Go Back
            </button>
            <Link to="/" className="btn nav-btn">
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!result || !application) {
    return (
      <div className="home-container" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="card">
          <p>Loading result...</p>
          <div className="nav-buttons">
            <button
              onClick={() => navigate(-1)}
              className="btn nav-btn"
            >
              Go Back
            </button>
            <Link to="/" className="btn nav-btn">
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
        <h2 className="subtitle mb-2">Student Exam Result</h2>
        <p className="lead mb-3">
          {`Result for ${application.studentId?.fullNameEn || 'N/A'} (Stage: ${application.stage}, Level: ${application.level})`}
        </p>
        <p className="mb-3">{`Subject: ${result.subject}`}</p>
        <div className="mb-3">
          <h5>Score: {result.score}%</h5>
          <p>{result.comments}</p>
        </div>
        {result.results.map((q, index) => {
          console.log(`Question ${index + 1} image path:`, q.image); // تسجيل مسار الصورة
          console.log(`Does image exist for question ${index + 1}?:`, !!q.image); // تسجيل ما إذا كان هناك صورة
          return (
            <div key={index} className="mb-3">
              <p><strong>{`Question ${index + 1}: `}</strong>{q.question}</p>
              {q.image ? (
                <div className="mb-2">
                  <img
                    src={`http://localhost:5000${q.image}`}
                    alt={`Diagram for question ${index + 1}`}
                    style={{ maxWidth: '300px', maxHeight: '300px', width: '100%', height: 'auto' }}
                    onError={(e) => console.log(`Failed to load image for question ${index + 1}:`, e)}
                  />
                </div>
              ) : (
                <p>No image available for this question.</p>
              )}
              <p><strong>Student Answer: </strong>{q.studentAnswer}</p>
              <p><strong>Correct Answer: </strong>{q.correctAnswer}</p>
              <p className={q.isCorrect ? 'text-success' : 'text-danger'}>
                {q.isCorrect ? 'Correct' : 'Incorrect'}
              </p>
            </div>
          );
        })}
        <div className="nav-buttons">
          <button
            className="btn nav-btn"
            onClick={() => navigate('/all-student-results')}
          >
            Back to Results
          </button>
          <Link to="/" className="btn nav-btn">Home</Link>
        </div>
      </div>
    </div>
  );
}

export default StudentExamResult;