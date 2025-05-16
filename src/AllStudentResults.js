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
        setError('انتهت جلستك أو أنك لم تسجل الدخول. يرجى تسجيل الدخول مرة أخرى.');
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
            setError('انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.');
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
            setError('لا توجد طلبات طلاب لعرضها. يرجى تسجيل طالب جديد أولاً.');
          }
        } else {
          setError(data.error || 'خطأ في جلب الطلبات.');
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        setError('خطأ في جلب الطلبات. يرجى المحاولة مرة أخرى.');
      }
    };

    fetchApplications();
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
        <h2 className="subtitle mb-2">جميع نتائج الطلاب</h2>
        <p className="lead mb-3">عرض نتائج امتحانات جميع الطلاب</p>
        {error && <p className="text-danger mb-3">{error}</p>}
        {applications.length === 0 && !error ? (
          <p>لا توجد طلبات لعرضها. يرجى تسجيل طالب جديد أولاً.</p>
        ) : (
          <table className="table table-striped">
            <thead>
              <tr>
                <th>اسم الطالب</th>
                <th>الشعبة</th>
                <th>المرحلة</th>
                <th>المستوى</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, index) => (
                <tr key={index}>
                  <td>{app.studentId?.name || 'غير متوفر'}</td>
                  <td>{app.division}</td>
                  <td>{app.stage}</td>
                  <td>{app.level}</td>
                  <td>
                    {app._id && app._id !== 'undefined' ? (
                      <Link
                        to={`/student-exam-result/${app._id}`}
                        className="btn btn-primary btn-sm"
                      >
                        عرض النتائج
                      </Link>
                    ) : (
                      <span className="text-muted">لا توجد نتائج متاحة</span>
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
            العودة إلى لوحة التحكم
          </button>
          <Link to="/" className="btn nav-btn">الرئيسية</Link>
        </div>
      </div>
    </div>
  );
}

export default AllStudentResults;