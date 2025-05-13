import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import bgImage from './bg1.jpg';
import './HomePage.css';

function AdmissionExam() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const division = searchParams.get('division');
  const stage = searchParams.get('stage');
  const subStage = searchParams.get('subStage');
  const level = searchParams.get('level');
  const applicationId = searchParams.get('applicationId');

  const [exams, setExams] = useState([]);
  const [currentExamIndex, setCurrentExamIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isArabicSpeaker, setIsArabicSpeaker] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState('');

  // تحديد المواد بناءً على القسم مع إعادة الترتيب
  useEffect(() => {
    if (division === 'British') {
      setSubjects(['Math', 'English', 'Science']);
    } else if (division === 'American') {
      setSubjects(['Math', 'English']);
    }
  }, [division]);

  // تحديث المواد بناءً على اختيار الطالب الأمريكي للغة العربية
  useEffect(() => {
    if (division === 'American' && isArabicSpeaker) {
      setSubjects(['Math', 'English', 'Arabic']);
    }
  }, [isArabicSpeaker, division]);

  // جلب الامتحانات عند تحديد المواد
  useEffect(() => {
    const fetchExams = async () => {
      if (subjects.length === 0) return;

      const fetchedExams = [];
      for (const subject of subjects) {
        try {
          const response = await fetch(`https://school-system-backend-yr14.onrender.com/api/exams?division=${division}&stage=${stage}&level=${level}&subject=${subject}`);
          const data = await response.json();
          if (response.ok && data.exam) {
            fetchedExams.push(data.exam);
            console.log(`Exam found for ${subject}:`, data.exam);
          } else {
            console.log(`No exam found for ${subject}`);
            // لا نوقف العملية، بل نستمر في جلب الامتحانات الأخرى
          }
        } catch (error) {
          console.error(`Error fetching exam for ${subject}:`, error);
          // لا نوقف العملية، بل نستمر في جلب الامتحانات الأخرى
        }
      }

      if (fetchedExams.length === 0) {
        setError('No exams available for your division, stage, and level.');
      } else {
        setExams(fetchedExams);
        setAnswers(new Array(fetchedExams[0].questions.length).fill(''));
      }
    };

    if (isArabicSpeaker !== null || division === 'British') {
      fetchExams();
    }
  }, [subjects, isArabicSpeaker, division, stage, level]);

  // التعامل مع اختيار الطالب الأمريكي للغة العربية
  const handleArabicSpeakerSelection = (isSpeaker) => {
    setIsArabicSpeaker(isSpeaker);
  };

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!applicationId || !exams[currentExamIndex]) {
      alert('Application ID or exam not found.');
      return;
    }

    try {
      const response = await fetch(`https://school-system-backend-yr14.onrender.com/api/applications/${applicationId}/submit-exam`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          examId: exams[currentExamIndex]._id,
          answers,
        }),
      });

      if (response.ok) {
        if (currentExamIndex < exams.length - 1) {
          setCurrentExamIndex(currentExamIndex + 1);
          setAnswers(new Array(exams[currentExamIndex + 1].questions.length).fill(''));
          alert('Exam submitted successfully! Moving to the next exam.');
        } else {
          navigate('/thank-you');
        }
      } else {
        alert('Error submitting exam. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('Error submitting exam. Please try again.');
    }
  };

  if (division === 'American' && isArabicSpeaker === null) {
    return (
      <div className="home-container" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="card">
          <p className="breadcrumb">
            {division} <span>➡️</span> {stage}
            {subStage && <span> ➡️ {subStage}</span>} <span>➡️</span> {level}
          </p>
          <img
            src="/images/logo.jpg"
            alt="شعار مدارس الجيل الجديد العالمية"
            className="logo mb-3"
            style={{ maxWidth: '40px' }}
          />
          <p className="lead mb-3">Language Selection</p>
          <p className="mb-3">Are you an Arabic speaker?</p>
          <div className="stage-buttons">
            <button
              className="btn section-btn"
              onClick={() => handleArabicSpeakerSelection(true)}
            >
              Yes
            </button>
            <button
              className="btn section-btn"
              onClick={() => handleArabicSpeakerSelection(false)}
            >
              No
            </button>
          </div>
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

  if (exams.length === 0) {
    return (
      <div className="home-container" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="card">
          <p>{error || 'Loading exams...'}</p>
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

  if (!exams[currentExamIndex]) {
    return (
      <div className="home-container" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="card">
          <p>No more exams to display.</p>
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

  const isArabic = exams[currentExamIndex].subject === 'Arabic';

  return (
    <div className="home-container" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className={`card ${isArabic ? 'arabic' : ''}`}>
        <p className="breadcrumb">
          {division} <span>{isArabic ? '⬅️' : '➡️'}</span> {stage}
          {subStage && <span> {isArabic ? '⬅️' : '➡️'} {subStage}</span>} <span>{isArabic ? '⬅️' : '➡️'}</span> {level}
        </p>
        <img
          src="/images/logo.jpg"
          alt="شعار مدارس الجيل الجديد العالمية"
          className="logo mb-3"
          style={{ maxWidth: '40px' }}
        />
        <p className="lead mb-3">{isArabic ? `امتحان القبول - ${exams[currentExamIndex].subject}` : `Admission Exam - ${exams[currentExamIndex].subject}`}</p>
        {error && <p className="text-danger mb-3">{error}</p>}
        <form onSubmit={handleSubmit}>
          {exams[currentExamIndex].questions.map((question, index) => (
            <div key={index} className="mb-3">
              <label className="form-label">{isArabic ? `سؤال ${index + 1}: ${question.question}` : `Question ${index + 1}: ${question.question}`}</label>
              {question.image && (
                <div className="mb-2">
                  <img
                    src={`https://school-system-backend-yr14.onrender.com${question.image}`}
                    alt={`Diagram for question ${index + 1}`}
                    style={{ maxWidth: '500px', maxHeight: '500px', width: '100%', height: 'auto' }}
                  />
                </div>
              )}
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="form-check">
                  <input
                    type="radio"
                    className="form-check-input"
                    name={`question-${index}`}
                    value={option}
                    checked={answers[index] === option}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    required
                  />
                  <label className="form-check-label">{option}</label>
                </div>
              ))}
            </div>
          ))}
          <div className="stage-buttons">
            <button type="submit" className="btn section-btn">{isArabic ? 'إرسال الامتحان' : 'Submit Exam'}</button>
          </div>
          <div className="nav-buttons">
            <button
              onClick={() => navigate(-1)}
              className="btn nav-btn"
            >
              {isArabic ? 'رجوع' : 'Go Back'}
            </button>
            <Link to="/" className="btn nav-btn">
              {isArabic ? 'الرئيسية' : 'Home'}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdmissionExam;