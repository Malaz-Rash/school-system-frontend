import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import bgImage from './bg1.jpg';
import './HomePage.css';

function CreateExam() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const division = searchParams.get('division') || localStorage.getItem('division') || '';
  const subject = localStorage.getItem('department') || '';

  const [stages, setStages] = useState([]);
  const [levels, setLevels] = useState([]);
  const [subStages, setSubStages] = useState([]);
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedSubStage, setSelectedSubStage] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [questions, setQuestions] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
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
    if (division === 'British') {
      setStages(['Kindergarten', 'Primary', 'Lower Secondary', 'Upper Secondary']);
    } else if (division === 'American') {
      setStages(['Kindergarten', 'Primary', 'Middle', 'High']);
    }
  }, [division]);

  useEffect(() => {
    if (division === 'British') {
      if (selectedStage === 'Kindergarten') {
        setLevels(['KG1', 'KG2', 'KG3']);
        setSubStages([]);
        setSelectedSubStage('');
      } else if (selectedStage === 'Primary') {
        setLevels(['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5']);
        setSubStages([]);
        setSelectedSubStage('');
      } else if (selectedStage === 'Lower Secondary') {
        setLevels(['Year 6', 'Year 7', 'Year 8']);
        setSubStages([]);
        setSelectedSubStage('');
      } else if (selectedStage === 'Upper Secondary') {
        setSubStages(['IGCSE', 'IAL']);
        setLevels([]);
      } else {
        setLevels([]);
        setSubStages([]);
        setSelectedSubStage('');
      }
    } else if (division === 'American') {
      if (selectedStage === 'Kindergarten') {
        setLevels(['KG1', 'KG2', 'KG3']);
        setSubStages([]);
        setSelectedSubStage('');
      } else if (selectedStage === 'Primary') {
        setLevels(['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6']);
        setSubStages([]);
        setSelectedSubStage('');
      } else if (selectedStage === 'Middle') {
        setLevels(['Grade 7', 'Grade 8', 'Grade 9']);
        setSubStages([]);
        setSelectedSubStage('');
      } else if (selectedStage === 'High') {
        setLevels(['Grade 10', 'Grade 11', 'Grade 12']);
        setSubStages([]);
        setSelectedSubStage('');
      } else {
        setLevels([]);
        setSubStages([]);
        setSelectedSubStage('');
      }
    }
  }, [selectedStage, division]);

  useEffect(() => {
    if (division === 'British' && selectedStage === 'Upper Secondary') {
      if (selectedSubStage === 'IGCSE') {
        setLevels(['Year 9', 'Year 10']);
      } else if (selectedSubStage === 'IAL') {
        setLevels(['Year 11', 'Year 12']);
      } else {
        setLevels([]);
      }
    }
  }, [selectedSubStage, selectedStage, division]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
      },
    ]);
    setImageFiles([...imageFiles, null]);
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    if (field === 'question') {
      newQuestions[index].question = value;
    } else if (field === 'correctAnswer') {
      newQuestions[index].correctAnswer = value;
    } else if (field.startsWith('option')) {
      const optionIndex = parseInt(field.split('-')[1]);
      newQuestions[index].options[optionIndex] = value;
    }
    setQuestions(newQuestions);
  };

  const handleImageChange = (index, file) => {
    const newImageFiles = [...imageFiles];
    newImageFiles[index] = file;
    setImageFiles(newImageFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Create Exam button clicked, starting handleSubmit...');

    let token = localStorage.getItem('token');
    if (!token) {
      setError('انتهت جلستك أو أنك لم تسجل الدخول. يرجى تسجيل الدخول مرة أخرى.');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    if (!division || !selectedStage || !selectedLevel) {
      console.log('Validation failed: Division, Stage, or Level missing');
      console.log('Division:', division);
      console.log('Selected Stage:', selectedStage);
      console.log('Selected Level:', selectedLevel);
      setError('يرجى تحديد الشعبة، المرحلة، والمستوى.');
      return;
    }

    if (!questions || questions.length === 0) {
      console.log('Validation failed: No questions provided');
      setError('يرجى إضافة سؤال واحد على الأقل.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('subject', subject);
      formData.append('division', division);
      formData.append('stage', selectedStage);
      formData.append('level', selectedLevel);
      formData.append('questions', JSON.stringify(questions));

      imageFiles.forEach((file, index) => {
        if (file) {
          formData.append(`images[${index}]`, file);
        }
      });

      console.log('Submitting exam with data:');
      console.log('Division:', division);
      console.log('Stage:', selectedStage);
      console.log('Sub-Stage:', selectedSubStage || 'N/A');
      console.log('Level:', selectedLevel);
      console.log('Subject:', subject);
      console.log('Questions:', questions);
      console.log('Image Files:', imageFiles);

      let response = await fetch('https://school-system-backend-yr14.onrender.com/api/exams', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
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

        response = await fetch('https://school-system-backend-yr14.onrender.com/api/exams', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });
      }

      console.log('Response received from server:', response);

      const data = await response.json();
      console.log('Server Response Data:', data);

      if (response.ok) {
        console.log('Exam created successfully, navigating to department-head-results');
        alert('تم إنشاء الامتحان بنجاح!');
        navigate('/department-head-results');
      } else {
        console.log('Server returned an error:', data.error);
        setError(data.error || 'خطأ في إنشاء الامتحان. يرجى المحاولة مرة أخرى.');
      }
    } catch (error) {
      console.error('Error during fetch in handleSubmit:', error.message, error.stack);
      setError('خطأ في إنشاء الامتحان: ' + error.message);
    }
  };

  return (
    <div className="home-container" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="card">
        <p className="breadcrumb">
          {division} <span>➡️</span> {selectedStage}
          {selectedSubStage && <span> ➡️ {selectedSubStage}</span>} <span>➡️</span> {selectedLevel}
        </p>
        <img
          src="/images/logo.jpg"
          alt="شعار مدارس الجيل الجديد العالمية"
          className="logo mb-3"
          style={{ maxWidth: '40px' }}
        />
        <h1 className="title mb-2">New Generation International Schools</h1>
        <h2 className="subtitle mb-2">إنشاء امتحان</h2>
        <p className="lead mb-3">إضافة أسئلة امتحان جديد</p>
        {error && <p className="text-danger mb-3">{error}</p>}
        {error ? (
          <div className="nav-buttons">
            <button
              onClick={() => navigate('/department-head-results')}
              className="btn nav-btn"
            >
              العودة
            </button>
            <Link to="/" className="btn nav-btn">الرئيسية</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="division" className="form-label">الشعبة</label>
              <input
                type="text"
                className="form-control"
                id="division"
                value={division}
                readOnly
              />
            </div>
            <div className="mb-3">
              <label htmlFor="stage" className="form-label">المرحلة</label>
              <select
                id="stage"
                className="form-control"
                value={selectedStage}
                onChange={(e) => {
                  setSelectedStage(e.target.value);
                  setSelectedSubStage('');
                  setSelectedLevel('');
                }}
                required
              >
                <option value="">-- اختر المرحلة --</option>
                {stages.map((stageOption, index) => (
                  <option key={index} value={stageOption}>{stageOption}</option>
                ))}
              </select>
            </div>
            {selectedStage === 'Upper Secondary' && division === 'British' && (
              <div className="mb-3">
                <label htmlFor="subStage" className="form-label">المرحلة الفرعية</label>
                <select
                  id="subStage"
                  className="form-control"
                  value={selectedSubStage}
                  onChange={(e) => {
                    setSelectedSubStage(e.target.value);
                    setSelectedLevel('');
                  }}
                  required
                >
                  <option value="">-- اختر المرحلة الفرعية --</option>
                  {subStages.map((subStageOption, index) => (
                    <option key={index} value={subStageOption}>{subStageOption}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="mb-3">
              <label htmlFor="level" className="form-label">المستوى</label>
              <select
                id="level"
                className="form-control"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                required
              >
                <option value="">-- اختر المستوى --</option>
                {levels.map((levelOption, index) => (
                  <option key={index} value={levelOption}>{levelOption}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="subject" className="form-label">المادة</label>
              <input
                type="text"
                className="form-control"
                id="subject"
                value={subject}
                readOnly
              />
            </div>
            {questions.map((q, index) => (
              <div key={index} className="mb-3">
                <label className="form-label">{`السؤال ${index + 1}`}</label>
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="أدخل السؤال"
                  value={q.question}
                  onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                  required
                />
                <label className="form-label">رفع صورة (اختياري)</label>
                <input
                  type="file"
                  className="form-control mb-2"
                  accept="image/*"
                  onChange={(e) => handleImageChange(index, e.target.files[0])}
                />
                {imageFiles[index] && (
                  <div className="mb-2">
                    <img
                      src={URL.createObjectURL(imageFiles[index])}
                      alt={`معاينة السؤال ${index + 1}`}
                      style={{ maxWidth: '200px', maxHeight: '200px' }}
                    />
                  </div>
                )}
                {q.options.map((option, optIndex) => (
                  <input
                    key={optIndex}
                    type="text"
                    className="form-control mb-1"
                    placeholder={`الخيار ${optIndex + 1}`}
                    value={option}
                    onChange={(e) => handleQuestionChange(index, `option-${optIndex}`, e.target.value)}
                    required
                  />
                ))}
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="الإجابة الصحيحة"
                  value={q.correctAnswer}
                  onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
                  required
                />
              </div>
            ))}
            <div className="stage-buttons">
              <button type="button" className="btn section-btn" onClick={addQuestion}>
                إضافة سؤال
              </button>
              <button type="submit" className="btn section-btn">إنشاء الامتحان</button>
            </div>
            <div className="nav-buttons">
              <button
                onClick={() => navigate('/department-head-results')}
                className="btn nav-btn"
              >
                العودة
              </button>
              <Link to="/" className="btn nav-btn">الرئيسية</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default CreateExam;