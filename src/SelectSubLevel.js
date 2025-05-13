import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import bgImage from './bg1.jpg';
import './HomePage.css';

function SelectSubLevel() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const division = searchParams.get('division');
  const stage = searchParams.get('stage');
  const subStage = searchParams.get('subStage');

  const subLevels = {
    'IGCSE': ['Year 9', 'Year 10'],
    'IAL': ['Year 11', 'Year 12']
  };

  const levels = subLevels[subStage] || [];

  return (
    <div className="home-container" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="card">
        <p className="breadcrumb">
          {division} <span>➡️</span> {stage} <span>➡️</span> {subStage}
        </p>
        <img
          src="/images/logo.jpg"
          alt="شعار مدارس الجيل الجديد العالمية"
          className="logo mb-3"
          style={{ maxWidth: '40px' }}
        />
        <p className="lead mb-3">Choose the level for {division} {stage} ({subStage}):</p>
        <div className="stage-buttons">
          {levels.map((level) => (
            <Link
              key={level}
              to={`/register?division=${division}&stage=${stage}&subStage=${subStage}&level=${level}`}
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

export default SelectSubLevel;