import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import bgImage from './bg1.jpg';
import './HomePage.css';

function RegisterForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const division = searchParams.get('division') || '';
  const stage = searchParams.get('stage') || '';
  const subStage = searchParams.get('subStage') || '';
  const level = searchParams.get('level') || '';

  const [formData, setFormData] = useState({
    fullNameAr: '',
    fullNameEn: '',
    nationalId: '',
    birthDate: '',
    passportNumber: '',
    nationality: '',
    previousSchool: '',
    fatherNationalId: '',
    fatherPhone: '',
    motherPhone: '',
    fatherJob: '',
    fatherWorkplace: '',
    gender: '',
    email: '',
    address: '',
    medicalConditions: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // التحقق من أن division وstage وlevel ليست فارغة
    if (!division || !stage || !level) {
      setError('Division, Stage, and Level are required. Please go back and select them.');
      return;
    }

    // التحقق من أن fullNameEn ليس فارغًا
    if (!formData.fullNameEn) {
      setError('Full Name (English) is required.');
      return;
    }

    const dataToSubmit = {
      name: formData.fullNameEn,
      fullNameAr: formData.fullNameAr,
      fullNameEn: formData.fullNameEn,
      nationalId: formData.nationalId,
      birthDate: formData.birthDate,
      passportNumber: formData.passportNumber,
      nationality: formData.nationality,
      previousSchool: formData.previousSchool,
      fatherNationalId: formData.fatherNationalId,
      fatherPhone: formData.fatherPhone,
      motherPhone: formData.motherPhone,
      fatherJob: formData.fatherJob,
      fatherWorkplace: formData.fatherWorkplace,
      division,
      stage,
      level,
    };

    try {
      const response = await fetch('https://school-system-backend-yr14.onrender.com/api/parent-register-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Registration submitted successfully!');
        navigate(`/admission-exam?division=${division}&stage=${stage}${subStage ? `&subStage=${subStage}` : ''}&level=${level}&applicationId=${data.application._id}`);
      } else {
        setError(data.error || 'Error submitting registration. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting registration:', error);
      setError('Error submitting registration: Network issue or server error. Please try again.');
    }
  };

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
        <p className="lead mb-3">Student Registration Form</p>
        {error && <p className="text-danger mb-3">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="fullNameAr" className="form-label">Full Name (Arabic)</label>
            <input
              type="text"
              className="form-control"
              id="fullNameAr"
              name="fullNameAr"
              value={formData.fullNameAr}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="fullNameEn" className="form-label">Full Name (English)</label>
            <input
              type="text"
              className="form-control"
              id="fullNameEn"
              name="fullNameEn"
              value={formData.fullNameEn}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="nationalId" className="form-label">National ID</label>
            <input
              type="text"
              className="form-control"
              id="nationalId"
              name="nationalId"
              value={formData.nationalId}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="birthDate" className="form-label">Date of Birth</label>
            <input
              type="date"
              className="form-control"
              id="birthDate"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="passportNumber" className="form-label">Passport Number</label>
            <input
              type="text"
              className="form-control"
              id="passportNumber"
              name="passportNumber"
              value={formData.passportNumber}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="nationality" className="form-label">Nationality</label>
            <input
              type="text"
              className="form-control"
              id="nationality"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="gender" className="form-label">Gender (Optional)</label>
            <select
              className="form-control"
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="previousSchool" className="form-label">Previous School (Optional)</label>
            <input
              type="text"
              className="form-control"
              id="previousSchool"
              name="previousSchool"
              value={formData.previousSchool}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="fatherNationalId" className="form-label">Father's National ID</label>
            <input
              type="text"
              className="form-control"
              id="fatherNationalId"
              name="fatherNationalId"
              value={formData.fatherNationalId}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="fatherPhone" className="form-label">Father's Phone Number</label>
            <input
              type="tel"
              className="form-control"
              id="fatherPhone"
              name="fatherPhone"
              value={formData.fatherPhone}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="motherPhone" className="form-label">Mother's Phone Number</label>
            <input
              type="tel"
              className="form-control"
              id="motherPhone"
              name="motherPhone"
              value={formData.motherPhone}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="fatherJob" className="form-label">Father's Job</label>
            <input
              type="text"
              className="form-control"
              id="fatherJob"
              name="fatherJob"
              value={formData.fatherJob}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="fatherWorkplace" className="form-label">Father's Workplace</label>
            <input
              type="text"
              className="form-control"
              id="fatherWorkplace"
              name="fatherWorkplace"
              value={formData.fatherWorkplace}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email Address (Optional)</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="address" className="form-label">Address (Optional)</label>
            <textarea
              className="form-control"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="medicalConditions" className="form-label">Medical Conditions (Optional)</label>
            <textarea
              className="form-control"
              id="medicalConditions"
              name="medicalConditions"
              value={formData.medicalConditions}
              onChange={handleChange}
            />
          </div>
          <div className="stage-buttons">
            <button type="submit" className="btn section-btn">Submit</button>
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
        </form>
      </div>
    </div>
  );
}

export default RegisterForm;