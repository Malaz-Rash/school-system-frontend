import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate, Link } from 'react-router-dom';
import bgImage from './bg1.jpg';
import './HomePage.css';

function DepartmentHeadResults() {
  const navigate = useNavigate();
  const [newApplications, setNewApplications] = useState([]);
  const [stageCounts, setStageCounts] = useState({});
  const [error, setError] = useState('');

  // جلب الطلبات الجديدة (غير المطلع عليها)
  useEffect(() => {
    const fetchNewApplications = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to view this page.');
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/applications`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          console.log('All applications data:', data.applications);
          // تصفية الطلبات الجديدة (غير المطلع عليها)
          const unseenApps = data.applications.filter(app =>
            app.exams.some(exam => exam.subject === localStorage.getItem('department') && !exam.seenByDepartmentHead)
          );
          setNewApplications(unseenApps);

          // ترتيب المراحل
          const stageOrder = ['Kindergarten', 'Primary', 'Lower Secondary', 'Upper Secondary'];
          // حساب عدد الطلبات لكل مرحلة
          const counts = unseenApps.reduce((acc, app) => {
            const stage = app.stage;
            acc[stage] = (acc[stage] || 0) + 1;
            return acc;
          }, {});
          // ترتيب المراحل حسب stageOrder
          const orderedCounts = {};
          stageOrder.forEach(stage => {
            if (counts[stage]) {
              orderedCounts[stage] = counts[stage];
            }
          });
          setStageCounts(orderedCounts);
        } else {
          setError(data.error || 'Error fetching applications.');
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        setError('Error fetching applications. Please try again.');
      }
    };

    fetchNewApplications();
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
        <h2 className="subtitle mb-2">Department Head Dashboard</h2>
        <p className="lead mb-3">Manage Exams and View Results</p>
        {error && <p className="text-danger mb-3">{error}</p>}

        {/* تنبيه يُظهر عدد الطلبات الجديدة حسب المرحلة */}
        {newApplications.length > 0 && (
          <div className="alert alert-info mb-3" role="alert">
            <strong>New Applications Alert:</strong> You have {newApplications.length} new application(s) to review.{' '}
            {Object.entries(stageCounts).map(([stage, count], index) => (
              <span key={stage}>
                {stage}: {count}
                {index < Object.entries(stageCounts).length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        )}

        <div className="stage-buttons mb-3">
          <button
            className="btn section-btn me-2"
            onClick={() => navigate('/create-exam')}
          >
            Create New Exam
          </button>
          <button
            className="btn section-btn me-2"
            onClick={() => navigate('/view-exams')}
          >
            View Prepared Exams
          </button>
          <button
            className="btn section-btn"
            onClick={() => navigate('/all-student-results')}
          >
            View All Results
          </button>
        </div>
        <div className="nav-buttons">
          <Link to="/" className="btn nav-btn">Home</Link>
        </div>
      </div>
    </div>
  );
}

export default DepartmentHeadResults;