import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useParams, useNavigate, Link } from 'react-router-dom';
import bgImage from './bg1.jpg';
import './HomePage.css';

function EditExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [examData, setExamData] = useState({
    subject: '',
    questions: [],
    division: '',
    stage: '',
    level: '',
  });
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
    const fetchExam = async () => {
      let token = localStorage.getItem('token');
      if (!token) {
        setError('Your session has expired or you are not logged in. Please log in again.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      const department = localStorage.getItem('department');
      const division = localStorage.getItem('division');

      if (!department || !division) {
        setError('Please log in to edit exams for your department.');
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
            setError('Your session has expired. Please log in again.');
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
          const exam = data.exams.find(exam => exam._id === id);
          if (exam) {
            if (exam.subject !== department || exam.division !== division) {
              setError('You can only edit exams for your department and division.');
              return;
            }
            setExamData({
              subject: exam.subject,
              questions: exam.questions,
              division: exam.division,
              stage: exam.stage,
              level: exam.level,
            });
            setImageFiles(new Array(exam.questions.length).fill(null));
          } else {
            setError('Exam not found.');
          }
        } else {
          setError(data.error || 'Error fetching exam.');
        }
      } catch (error) {
        console.error('Error fetching exam:', error);
        setError('Error fetching exam. Please try again.');
      }
    };

    fetchExam();
  }, [id, navigate]);

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...examData.questions];
    if (field === 'question') {
      newQuestions[index].question = value;
    } else if (field.startsWith('option')) {
      const optionIndex = parseInt(field.split('-')[1]);
      newQuestions[index].options[optionIndex] = value;
    } else if (field === 'correctAnswer') {
      newQuestions[index].correctAnswer = value;
    }
    setExamData({ ...examData, questions: newQuestions });
  };

  const handleImageChange = (index, file) => {
    const newImageFiles = [...imageFiles];
    newImageFiles[index] = file;
    setImageFiles(newImageFiles);
  };

  const addQuestion = () => {
    setExamData({
      ...examData,
      questions: [
        ...examData.questions,
        {
          question: '',
          options: ['', '', '', ''],
          correctAnswer: '',
          image: ''
        }
      ]
    });
    setImageFiles([...imageFiles, null]);
  };

  const deleteQuestion = (index) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this question? This action cannot be undone.');
    if (!confirmDelete) return;

    const newQuestions = examData.questions.filter((_, i) => i !== index);
    const newImageFiles = imageFiles.filter((_, i) => i !== index);
    setExamData({ ...examData, questions: newQuestions });
    setImageFiles(newImageFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let token = localStorage.getItem('token');
    if (!token) {
      setError('Your session has expired or you are not logged in. Please log in again.');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    const department = localStorage.getItem('department');
    const division = localStorage.getItem('division');

    if (!department || !division) {
      setError('Please log in to edit exams for your department.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('subject', examData.subject);
      formData.append('division', examData.division);
      formData.append('stage', examData.stage);
      formData.append('level', examData.level);
      formData.append('questions', JSON.stringify(examData.questions));

      imageFiles.forEach((file, index) => {
        if (file) {
          formData.append(`images[${index}]`, file);
        }
      });

      console.log('Submitting updated exam with data:');
      console.log('Exam Data:', examData);
      console.log('Image Files:', imageFiles);

      let response = await fetch(`https://school-system-backend-yr14.onrender.com/api/exams/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.status === 403 || response.status === 401) {
        token = await refreshToken();
        if (!token) {
          setError('Your session has expired. Please log in again.');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        response = await fetch(`https://school-system-backend-yr14.onrender.com/api/exams/${id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });
      }

      const data = await response.json();
      if (response.ok) {
        alert('Exam updated successfully!');
        navigate('/view-exams');
      } else {
        setError(data.error || 'Error updating exam. Please try again.');
      }
    } catch (error) {
      console.error('Error updating exam:', error);
      setError('Error updating exam. Please try again.');
    }
  };

  return (
    <div className="home-container" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="card">
        <img
          src="/images/logo.jpg"
          alt="New Generation International Schools Logo"
          className="logo mb-3"
          style={{ maxWidth: '40px' }}
        />
        <h1 className="title mb-2">New Generation International Schools</h1>
        <h2 className="subtitle mb-2">Edit Exam</h2>
        <p className="lead mb-3">Modify Exam Details</p>
        {error && <p className="text-danger mb-3">{error}</p>}
        {error ? (
          <div className="nav-buttons">
            <Link to="/view-exams" className="btn nav-btn">Back to Exams List</Link>
            <Link to="/" className="btn nav-btn">Home</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="division" className="form-label">Division</label>
              <input
                type="text"
                className="form-control"
                id="division"
                value={examData.division}
                readOnly
              />
            </div>
            <div className="mb-3">
              <label htmlFor="subject" className="form-label">Subject</label>
              <input
                type="text"
                className="form-control"
                id="subject"
                value={examData.subject}
                readOnly
              />
            </div>
            <div className="mb-3">
              <label htmlFor="stage" className="form-label">Stage</label>
              <input
                type="text"
                className="form-control"
                id="stage"
                value={examData.stage}
                readOnly
              />
            </div>
            <div className="mb-3">
              <label htmlFor="level" className="form-label">Level</label>
              <input
                type="text"
                className="form-control"
                id="level"
                value={examData.level}
                readOnly
              />
            </div>
            {examData.questions.map((q, index) => (
              <div key={index} className="mb-3 p-3 border rounded position-relative">
                <label className="form-label">{`Question ${index + 1}`}</label>
                <button
                  type="button"
                  className="btn btn-danger btn-sm position-absolute"
                  style={{ top: '10px', right: '10px' }}
                  onClick={() => deleteQuestion(index)}
                >
                  Delete Question
                </button>
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Enter question"
                  value={q.question}
                  onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                  required
                />
                {q.image && q.image !== '' && (
                  <div className="mb-2">
                    <p>Current Image:</p>
                    <img
                      src={q.image}
                      alt={`Diagram for question ${index + 1}`}
                      style={{ maxWidth: '300px', maxHeight: '300px', width: '100%', height: 'auto' }}
                    />
                  </div>
                )}
                <label className="form-label">Upload New Image (Optional)</label>
                <input
                  type="file"
                  className="form-control mb-2"
                  accept="image/*"
                  onChange={(e) => handleImageChange(index, e.target.files[0])}
                />
                {imageFiles[index] && (
                  <div className="mb-2">
                    <p>New Image Preview:</p>
                    <img
                      src={URL.createObjectURL(imageFiles[index])}
                      alt={`New diagram for question ${index + 1}`}
                      style={{ maxWidth: '300px', maxHeight: '300px', width: '100%', height: 'auto' }}
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
            <div className="stage-buttons mb-3">
              <button type="button" className="btn section-btn me-2" onClick={addQuestion}>
                Add New Question
              </button>
              <button type="submit" className="btn section-btn">Update Exam</button>
            </div>
            <div className="nav-buttons">
              <Link to="/view-exams" className="btn nav-btn">Back to Exams List</Link>
              <Link to="/" className="btn nav-btn">Home</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default EditExam;