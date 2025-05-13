import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import bgImage from './bg1.jpg';
import './HomePage.css';

function SelectStage() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const division = searchParams.get('division');

  const stages = division === 'American'
    ? ['Kindergarten', 'Primary', 'Middle', 'High']
    : ['Kindergarten', 'Primary', 'Lower Secondary', 'Upper Secondary'];

  return (
    <div className="home-container" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="card">
        <p className="breadcrumb">{division}</p>
        <img
          src="/images/logo.jpg"
          alt="شعار مدارس الجيل الجديد العالمية"
          className="logo mb-3"
          style={{ maxWidth: '40px' }}
        />
        <h1 className="title mb-2" style={{ fontSize: '1.2rem' }}>
          New Generation International Schools
        </h1>
        <h2 className="subtitle mb-2" style={{ fontSize: '1rem' }}>
          Admission System
        </h2>
        <p className="lead mb-3">Choose the academic stage for {division} Section:</p>
        <div className="stage-buttons">
          {stages.map((stage) => (
            <Link
              key={stage}
              to={`/select-level?division=${division}&stage=${stage}`}
              className="btn section-btn"
            >
              {stage}
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

export default SelectStage;