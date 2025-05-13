import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import bgImage from './bg1.jpg';
import './HomePage.css';

function SelectLevel() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const division = searchParams.get('division');
  const stage = searchParams.get('stage');

  const levels = {
    'American': {
      'Kindergarten': ['KG1', 'KG2', 'KG3'],
      'Primary': ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'],
      'Middle': ['Grade 7', 'Grade 8', 'Grade 9'],
      'High': ['Grade 10', 'Grade 11', 'Grade 12'],
    },
    'British': {
      'Kindergarten': ['KG1', 'KG2', 'KG3'],
      'Primary': ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      'Lower Secondary': ['Year 6', 'Year 7', 'Year 8'],
      'Upper Secondary': ['IGCSE', 'IAL'],
    }
  };

  const subStages = stage === 'Upper Secondary' && division === 'British'
    ? levels[division][stage]
    : null;

  const stageLevels = subStages
    ? null
    : levels[division][stage] || [];

  return (
    <div className="home-container" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="card">
        <p className="breadcrumb">
          {division} <span>➡️</span> {stage}
          {subStages && <span> ➡️ Choose Sub-Stage</span>}
        </p>
        <img
          src="/images/logo.jpg"
          alt="شعار مدارس الجيل الجديد العالمية"
          className="logo mb-3"
          style={{ maxWidth: '40px' }}
        />
        <p className="lead mb-3">
          {subStages
            ? `Choose the sub-stage for ${division} ${stage}:`
            : `Choose the level for ${division} ${stage}:`}
        </p>
        <div className="stage-buttons">
          {subStages
            ? subStages.map((subStage) => (
                <Link
                  key={subStage}
                  to={`/select-sub-level?division=${division}&stage=${stage}&subStage=${subStage}`}
                  className="btn section-btn"
                >
                  {subStage}
                </Link>
              ))
            : stageLevels.map((level) => (
                <Link
                  key={level}
                  to={`/register?division=${division}&stage=${stage}&level=${level}`}
                  className="btn section-btn"
                >
                  {level}
                </Link>
              ))}
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

export default SelectLevel;