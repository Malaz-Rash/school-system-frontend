import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import bgImage from './bg1.jpg';
import './HomePage.css';

function ThankYouPage() {
  return (
    <div className="home-container" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="card text-center">
        <img
          src="/images/logo.jpg"
          alt="شعار مدارس الجيل الجديد العالمية"
          className="logo mb-3 mx-auto"
          style={{ maxWidth: '40px' }}
        />
        <h1 className="title mb-2">New Generation International Schools</h1>
        <h2 className="subtitle mb-3">Thank You!</h2>
        <div className="p-4">
          <p className="lead mb-3" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
            Congratulations on completing your registration form and all required admission exams! 🎉
          </p>
          <p className="mb-3" style={{ fontSize: '1rem', color: '#555' }}>
            We appreciate your effort and dedication. Our administration team will reach out to you soon to discuss your results and evaluate your academic level.
          </p>
          <p className="mb-4" style={{ fontSize: '0.9rem', color: '#777' }}>
            Stay tuned for updates, and we look forward to welcoming you to our community!
          </p>
          <div className="nav-buttons">
            <Link to="/" className="btn nav-btn">Return to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThankYouPage;