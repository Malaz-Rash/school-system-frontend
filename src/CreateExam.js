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

  // تحديد المراحل (Stages) بناءً على القسم (Division)
  useEffect(() => {
    if (division === 'British') {
      setStages(['Kindergarten', 'Primary', 'Lower Secondary', 'Upper Secondary']);
    } else if (division === 'American') {
      setStages(['Kindergarten', 'Primary', 'Middle', 'High']);
    }
  }, [division]);

  // تحديد المستويات (Levels) أو التقسيم الفرعي (Sub-Stages) بناءً على المرحلة (Stage)
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

  // تحديد المستويات (Levels) بناءً على التقسيم الفرعي (Sub-Stage) في Upper Secondary
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
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to create an exam.');
      return;
    }

    if (!division || !selectedStage || !selectedLevel) {
      setError('Please select Division, Stage, and Level.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('subject', subject);
      formData.append('division', division);
      formData.append('stage', selectedStage);
      formData.append('level', selectedLevel);
      formData.append('questions', JSON.stringify(questions));

      // إضافة الصور باسم الحقل 'images'
      imageFiles.forEach((file) => {
        if (file) {
          formData.append('images', file);
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

      const response = await fetch('https://school-system-backend-yr14.onrender.com/api/exams', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      console.log('Server Response:', data);

      if (response.ok) {
        alert('Exam created successfully!');
        navigate('/department-head-results');
      } else {
        setError(data.error || 'Error creating exam. Please try again.');
      }
    } catch (error) {
      console.error('Error creating exam:', error);
      setError('Error creating exam. Please try again.');
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
        <h2 className="subtitle mb-2">Create Exam</h2>
        <p className="lead mb-3">Add New Exam Questions</p>
        {error && <p className="text-danger mb-3">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="division" className="form-label">Division</label>
            <input
              type="text"
              className="form-control"
              id="division"
              value={division}
              readOnly
            />
          </div>
          <div className="mb-3">
            <label htmlFor="stage" className="form-label">Stage</label>
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
              <option value="">-- Select Stage --</option>
              {stages.map((stageOption, index) => (
                <option key={index} value={stageOption}>{stageOption}</option>
              ))}
            </select>
          </div>
          {selectedStage === 'Upper Secondary' && division === 'British' && (
            <div className="mb-3">
              <label htmlFor="subStage" className="form-label">Sub-Stage</label>
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
                <option value="">-- Select Sub-Stage --</option>
                {subStages.map((subStageOption, index) => (
                  <option key={index} value={subStageOption}>{subStageOption}</option>
                ))}
              </select>
            </div>
          )}
          <div className="mb-3">
            <label htmlFor="level" className="form-label">Level</label>
            <select
              id="level"
              className="form-control"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              required
            >
              <option value="">-- Select Level --</option>
              {levels.map((levelOption, index) => (
                <option key={index} value={levelOption}>{levelOption}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="subject" className="form-label">Subject</label>
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
              <label className="form-label">{`Question ${index + 1}`}</label>
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Enter question"
                value={q.question}
                onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                required
              />
              <label className="form-label">Upload Image (Optional)</label>
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
                    alt={`Preview for question ${index + 1}`}
                    style={{ maxWidth: '200px', maxHeight: '200px' }}
                  />
                </div>
              )}
              {q.options.map((option, optIndex) => (
                <input
                  key={optIndex}
                  type="text"
                  className="form-control mb-1"
                  placeholder={`Option ${optIndex + 1}`}
                  value={option}
                  onChange={(e) => handleQuestionChange(index, `option-${optIndex}`, e.target.value)}
                  required
                />
              ))}
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Correct Answer"
                value={q.correctAnswer}
                onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
                required
              />
            </div>
          ))}
          <div className="stage-buttons">
            <button type="button" className="btn section-btn" onClick={addQuestion}>
              Add Question
            </button>
            <button type="submit" className="btn section-btn">Create Exam</button>
          </div>
          <div className="nav-buttons">
            <button
              onClick={() => navigate('/department-head-results')}
              className="btn nav-btn"
            >
              Go Back
            </button>
            <Link to="/" className="btn nav-btn">Home</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateExam;