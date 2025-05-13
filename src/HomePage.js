import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import bgImage from './bg1.jpg';
import './HomePage.css';

function HomePage() {
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
        <h2 className="subtitle mb-2">Admission System</h2>
        <p className="lead mb-3">Choose the academic section:</p>
        <div className="stage-buttons">
          <Link to="/select-stage?division=British" className="btn section-btn">
            British Section
          </Link>
          <Link to="/select-stage?division=American" className="btn section-btn">
            American Section
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HomePage;