import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchExams = async () => {
      let token = localStorage.getItem('token');
      if (!token) {
        setError('انتهت جلستك أو أنك لم تسجل الدخول. يرجى تسجيل الدخول مرة أخرى.');
        setTimeout(() => navigate('/login'), 3000);
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
            setError('انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.');
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
          const filteredExams = data.exams.filter(
            exam => exam.subject === localStorage.getItem('department') && exam.division === localStorage.getItem('division')
          );
          setExams(filteredExams);
        } else {
          setError(data.error || 'خطأ في جلب الامتحانات.');
        }
      } catch (error) {
        console.error('Error fetching exams:', error);
        setError('خطأ في جلب الامتحانات. يرجى المحاولة مرة أخرى.');
      }
    };

    fetchExams();
  }, [navigate]);

  const handleDelete = async (examId) => {
    const confirmDelete = window.confirm('هل أنت متأكد من حذف هذا الامتحان؟ لا يمكن التراجع عن هذا الإجراء.');
    if (!confirmDelete) {
      return;
    }

    let token = localStorage.getItem('token');
    if (!token) {
      setError('انتهت جلستك أو أنك لم تسجل الدخول. يرجى تسجيل الدخول مرة أخرى.');
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
          setError('انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.');
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

      const data = await response.json();
      if (response.ok) {
        setExams(exams.filter(exam => exam._id !== examId));
        alert('تم حذف الامتحان بنجاح!');
      } else {
        setError(data.error || 'خطأ في حذف الامتحان.');
      }
    } catch (error) {
      console.error('Error deleting exam:', error);
      setError('خطأ في حذف الامتحان. يرجى المحاولة مرة أخرى.');
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
        <h2 className="subtitle mb-2">عرض الامتحانات</h2>
        <p className="lead mb-3">قائمة الامتحانات المُعدة</p>
        {error && <p className="text-danger mb-3">{error}</p>}
        {error ? (
          <div className="nav-buttons">
            <button
              className="btn nav-btn"
              onClick={() => navigate('/department-head-results')}
            >
              العودة إلى لوحة التحكم
            </button>
            <Link to="/" className="btn nav-btn">الرئيسية</Link>
          </div>
        ) : exams.length === 0 ? (
          <p>لا توجد امتحانات لقسمك في هذه الشعبة.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>المادة</th>
                  <th>الشعبة</th>
                  <th>المرحلة</th>
                  <th>المستوى</th>
                  <th>عدد الأسئلة</th>
                  <th>الأسئلة</th>
                  <th>الإجراءات</th>
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
                      {exam.questions.map((question, index) => (
                        <div key={index} className="mb-2">
                          <p><strong>السؤال {index + 1}:</strong> {question.question}</p>
                          {question.image && question.image !== '' && (
                            <div className="mb-2">
                              <img
                                src={question.image}
                                alt={`الرسم التوضيحي للسؤال ${index + 1}`}
                                style={{ maxWidth: '300px', maxHeight: '300px', width: '100%', height: 'auto' }}
                              />
                            </div>
                          )}
                          <p><strong>الخيارات:</strong> {question.options.join(', ')}</p>
                          <p><strong>الإجابة الصحيحة:</strong> {question.correctAnswer}</p>
                        </div>
                      ))}
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm me-2"
                        onClick={() => navigate(`/edit-exam/${exam._id}`)}
                      >
                        تعديل
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(exam._id)}
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!error && (
          <div className="nav-buttons">
            <button
              className="btn nav-btn"
              onClick={() => navigate('/department-head-results')}
            >
              العودة إلى لوحة التحكم
            </button>
            <Link to="/" className="btn nav-btn">الرئيسية</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewExams;