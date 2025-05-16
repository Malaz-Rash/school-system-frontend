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
    const fetchNewApplications = async () => {
      let token = localStorage.getItem('token');
      if (!token) {
        setError('انتهت جلستك أو أنك لم تسجل الدخول. يرجى تسجيل الدخول مرة أخرى.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        let response = await fetch(`https://school-system-backend-yr14.onrender.com/api/applications`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 403 || response.status === 401) {
          token = await refreshToken();
          if (!token) {
            setError('انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            setTimeout(() => navigate('/login'), 3000);
            return;
          }

          response = await fetch(`https://school-system-backend-yr14.onrender.com/api/applications`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
        }

        const data = await response.json();
        if (response.ok) {
          console.log('All applications data:', data.applications);
          const unseenApps = data.applications.filter(app =>
            app.exams.some(exam => exam.subject === localStorage.getItem('department') && !exam.seenByDepartmentHead)
          );
          setNewApplications(unseenApps);

          const stageOrder = ['Kindergarten', 'Primary', 'Lower Secondary', 'Upper Secondary'];
          const counts = unseenApps.reduce((acc, app) => {
            const stage = app.stage;
            acc[stage] = (acc[stage] || 0) + 1;
            return acc;
          }, {});
          const orderedCounts = {};
          stageOrder.forEach(stage => {
            if (counts[stage]) {
              orderedCounts[stage] = counts[stage];
            }
          });
          setStageCounts(orderedCounts);
        } else {
          setError(data.error || 'خطأ في جلب الطلبات.');
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        setError('خطأ في جلب الطلبات. يرجى المحاولة مرة أخرى.');
      }
    };

    fetchNewApplications();
  }, [navigate]);

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
        <h2 className="subtitle mb-2">لوحة تحكم رئيس القسم</h2>
        <p className="lead mb-3">إدارة الامتحانات وعرض النتائج</p>
        {error && <p className="text-danger mb-3">{error}</p>}

        {newApplications.length > 0 && (
          <div className="alert alert-info mb-3" role="alert">
            <strong>تنبيه بوجود طلبات جديدة:</strong> لديك {newApplications.length} طلب/طلبات جديدة لمراجعتها.{' '}
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
            إنشاء امتحان جديد
          </button>
          <button
            className="btn section-btn me-2"
            onClick={() => navigate('/view-exams')}
          >
            عرض الامتحانات المُعدة
          </button>
          <button
            className="btn section-btn"
            onClick={() => navigate('/all-student-results')}
          >
            عرض جميع النتائج
          </button>
        </div>
        <div className="nav-buttons">
          <Link to="/" className="btn nav-btn">الرئيسية</Link>
        </div>
      </div>
    </div>
  );
}

export default DepartmentHeadResults;