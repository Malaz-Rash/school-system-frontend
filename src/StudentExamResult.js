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
    const fetchApplication = async () => {
      if (!id || id === 'undefined') {
        setError('معرف الطلب غير صالح. يرجى العودة واختيار طالب صالح.');
        return;
      }

      let token = localStorage.getItem('token');
      if (!token) {
        setError('انتهت جلستك أو أنك لم تسجل الدخول. يرجى تسجيل الدخول مرة أخرى.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        let response = await fetch(`https://school-system-backend-yr14.onrender.com/api/applications/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 403 || response.status === 401) {
          // محاولة تحديث الـ token
          token = await refreshToken();
          if (!token) {
            setError('انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            setTimeout(() => navigate('/login'), 3000);
            return;
          }

          // إعادة المحاولة مع الـ token الجديد
          response = await fetch(`https://school-system-backend-yr14.onrender.com/api/applications/${id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
        }

        const data = await response.json();
        if (response.ok) {
          setApplication(data.application);
        } else {
          setError(data.error || 'خطأ في جلب تفاصيل الطلب.');
        }
      } catch (error) {
        console.error('Error fetching application:', error);
        setError('خطأ في جلب تفاصيل الطلب بسبب مشكلة في الشبكة. يرجى المحاولة مرة أخرى.');
      }
    };

    fetchApplication();
  }, [id, navigate]);

  const markAsSeen = async () => {
    let token = localStorage.getItem('token');
    if (!token) {
      setError('انتهت جلستك أو أنك لم تسجل الدخول. يرجى تسجيل الدخول مرة أخرى.');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    try {
      let response = await fetch(`https://school-system-backend-yr14.onrender.com/api/applications/${id}/mark-seen`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 403 || response.status === 401) {
        // محاولة تحديث الـ token
        token = await refreshToken();
        if (!token) {
          setError('انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // إعادة المحاولة مع الـ token الجديد
        response = await fetch(`https://school-system-backend-yr14.onrender.com/api/applications/${id}/mark-seen`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }

      const data = await response.json();
      if (response.ok) {
        alert('تم وضع علامة "تمت المشاهدة" على النتائج بنجاح.');
        navigate('/all-student-results');
      } else {
        setError(data.error || 'خطأ في وضع علامة "تمت المشاهدة".');
      }
    } catch (error) {
      console.error('Error marking results as seen:', error);
      setError('خطأ في وضع علامة "تمت المشاهدة" بسبب مشكلة في الشبكة. يرجى المحاولة مرة أخرى.');
    }
  };

  if (error) {
    return (
      <div className="home-container" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="card">
          <h2>خطأ</h2>
          <p className="text-danger">{error}</p>
          <div className="nav-buttons">
            <Link to="/all-student-results" className="btn nav-btn">العودة إلى قائمة النتائج</Link>
            <Link to="/" className="btn nav-btn">الرئيسية</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="home-container" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="card">
          <h2>جارٍ التحميل...</h2>
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
          alt="شعار مدارس الجيل الجديد العالمية"
          className="logo mb-3"
          style={{ maxWidth: '40px' }}
        />
        <h1 className="title mb-2">New Generation International Schools</h1>
        <h2 className="subtitle mb-2">نتائج امتحان الطالب</h2>
        <p className="lead mb-3">مراجعة أداء الطالب</p>
        {relevantExams.length === 0 ? (
          <p>لا توجد امتحانات لقسمك.</p>
        ) : (
          relevantExams.map((exam, examIndex) => (
            <div key={examIndex} className="mb-4">
              <h3>امتحان {exam.subject}</h3>
              <p>الدرجة: {exam.score}%</p>
              <p>{exam.comments}</p>
              {exam.results.map((result, resultIndex) => (
                <div key={resultIndex} className="mb-3 p-3 border rounded">
                  <p>
                    <span style={{ marginRight: '10px' }}>
                      {result.isCorrect ? '✅' : '❌'}
                    </span>
                    <strong>السؤال {resultIndex + 1}:</strong> {result.question}
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
                  <p><strong>إجابة الطالب:</strong> {result.studentAnswer}</p>
                  <p><strong>الإجابة الصحيحة:</strong> {result.correctAnswer}</p>
                </div>
              ))}
            </div>
          ))
        )}
        <div className="nav-buttons">
          <button onClick={markAsSeen} className="btn section-btn me-2">
            وضع علامة "تمت المشاهدة"
          </button>
          <Link to="/all-student-results" className="btn nav-btn">العودة إلى قائمة النتائج</Link>
          <Link to="/" className="btn nav-btn">الرئيسية</Link>
        </div>
      </div>
    </div>
  );
}

export default StudentExamResult;