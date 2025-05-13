import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate, Link } from 'react-router-dom';
import bgImage from './bg1.jpg';
import './HomePage.css';

function AllStudentResults() {
  const navigate = useNavigate();
  const [allResults, setAllResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [stages, setStages] = useState([]);
  const [levels, setLevels] = useState([]);
  const [subStages, setSubStages] = useState([]);
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedSubStage, setSelectedSubStage] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [error, setError] = useState('');

  // جلب المراحل (Stages) بناءً على القسم (Division)
  useEffect(() => {
    const division = localStorage.getItem('division');
    if (division === 'British') {
      setStages(['Kindergarten', 'Primary', 'Lower Secondary', 'Upper Secondary']);
    } else if (division === 'American') {
      setStages(['Kindergarten', 'Primary', 'Middle', 'High']);
    }
  }, []);

  // تحديد المستويات (Levels) أو التقسيم الفرعي (Sub-Stages) بناءً على المرحلة (Stage)
  useEffect(() => {
    const division = localStorage.getItem('division');
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
  }, [selectedStage]);

  // تحديد المستويات (Levels) بناءً على التقسيم الفرعي (Sub-Stage) في Upper Secondary
  useEffect(() => {
    const division = localStorage.getItem('division');
    if (division === 'British' && selectedStage === 'Upper Secondary') {
      if (selectedSubStage === 'IGCSE') {
        setLevels(['Year 9', 'Year 10']);
      } else if (selectedSubStage === 'IAL') {
        setLevels(['Year 11', 'Year 12']);
      } else {
        setLevels([]);
      }
    }
  }, [selectedSubStage, selectedStage]);

  // جلب جميع الطلبات
  useEffect(() => {
    const fetchAllResults = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to view this page.');
        return;
      }

      try {
        const response = await fetch(`https://school-system-backend-yr14.onrender.com/api/applications`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          console.log('All results data:', data.applications);
          // فرز الطلبات حسب الأحدث أولاً (باستخدام مقارنة ObjectId)
          const sortedResults = data.applications.sort((a, b) => {
            return b._id.localeCompare(a._id);
          });
          setAllResults(sortedResults);
          setFilteredResults(sortedResults);
        } else {
          setError(data.error || 'Error fetching results.');
        }
      } catch (error) {
        console.error('Error fetching results:', error);
        setError('Error fetching results. Please try again.');
      }
    };

    fetchAllResults();
  }, []);

  // تصفية الطلبات بناءً على المرحلة والمستوى
  useEffect(() => {
    let filtered = allResults;

    if (selectedStage) {
      filtered = filtered.filter(app => app.stage === selectedStage);
    }

    if (selectedLevel) {
      filtered = filtered.filter(app => app.level === selectedLevel);
    }

    setFilteredResults(filtered);
  }, [selectedStage, selectedLevel, allResults]);

  return (
    <div className="home-container" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="card shadow-lg p-4">
        <div className="d-flex justify-content-center mb-4">
          <img
            src="/images/logo.jpg"
            alt="شعار مدارس الجيل الجديد العالمية"
            className="logo"
            style={{ maxWidth: '40px' }}
          />
        </div>
        <h1 className="title text-center mb-2">New Generation International Schools</h1>
        <h2 className="subtitle text-center mb-3">All Student Results</h2>
        <p className="lead text-center mb-4">View and Filter Results for All Students</p>
        {error && <p className="text-danger text-center mb-3">{error}</p>}

        {/* فلاتر المراحل والمستويات */}
        <div className="row mb-4 g-3">
          <div className="col-md-4">
            <label htmlFor="stage" className="form-label fw-bold">Stage</label>
            <select
              id="stage"
              className="form-select shadow-sm"
              value={selectedStage}
              onChange={(e) => {
                setSelectedStage(e.target.value);
                setSelectedSubStage('');
                setSelectedLevel('');
              }}
            >
              <option value="">All Stages</option>
              {stages.map((stage, index) => (
                <option key={index} value={stage}>{stage}</option>
              ))}
            </select>
          </div>
          {selectedStage === 'Upper Secondary' && (
            <div className="col-md-4">
              <label htmlFor="subStage" className="form-label fw-bold">Sub-Stage</label>
              <select
                id="subStage"
                className="form-select shadow-sm"
                value={selectedSubStage}
                onChange={(e) => setSelectedSubStage(e.target.value)}
              >
                <option value="">All Sub-Stages</option>
                {subStages.map((subStage, index) => (
                  <option key={index} value={subStage}>{subStage}</option>
                ))}
              </select>
            </div>
          )}
          <div className="col-md-4">
            <label htmlFor="level" className="form-label fw-bold">Level</label>
            <select
              id="level"
              className="form-select shadow-sm"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              disabled={!selectedStage || (selectedStage === 'Upper Secondary' && !selectedSubStage)}
            >
              <option value="">All Levels</option>
              {levels.map((level, index) => (
                <option key={index} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>

        {/* قسم نتائج الطلاب */}
        <div className="mb-4">
          {filteredResults.length === 0 ? (
            <p className="text-center text-muted">No results available.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-bordered shadow-sm">
                <thead className="table-dark">
                  <tr>
                    <th scope="col">Student Name</th>
                    <th scope="col">Stage</th>
                    <th scope="col">Level</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((app) => {
                    const isUnseen = app.exams.some(
                      exam => exam.subject === localStorage.getItem('department') && !exam.seenByDepartmentHead
                    );
                    console.log(`Rendering Application ${app._id} - Is Unseen: ${isUnseen}, Color Class: ${isUnseen ? 'unseen-row' : 'seen-row'}`);
                    return (
                      <tr
                        key={app._id}
                        className={isUnseen ? 'unseen-row' : 'seen-row'}
                      >
                        <td>{app.studentId?.fullNameEn || 'N/A'}</td>
                        <td>{app.stage}</td>
                        <td>{app.level}</td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm shadow-sm"
                            onClick={() => navigate(`/student-exam-result/${app._id}`)}
                          >
                            View Result
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="nav-buttons d-flex justify-content-center gap-3">
          <button
            className="btn nav-btn btn-secondary shadow-sm"
            onClick={() => navigate('/department-head-results')}
          >
            Back to Dashboard
          </button>
          <Link to="/" className="btn nav-btn btn-primary shadow-sm">Home</Link>
        </div>
      </div>
    </div>
  );
}

export default AllStudentResults;