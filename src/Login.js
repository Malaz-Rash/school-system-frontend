import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate, Link } from 'react-router-dom';
import bgImage from './bg1.jpg';
import './HomePage.css';

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Login form submitted with username:', username); // سجل للتحقق من بدء العملية
    try {
      const response = await fetch('https://school-system-backend-yr14.onrender.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('Response status:', response.status); // سجل للتحقق من حالة الاستجابة
      const data = await response.json();
      console.log('Login response data:', data); // سجل للتحقق من البيانات المستلمة
      if (response.ok) {
        console.log('Role received:', data.role); // سجل للتحقق من قيمة data.role
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('role', data.role);
        localStorage.setItem('department', data.department);
        localStorage.setItem('division', data.division);
        alert('Login successful!');
        if (data.role === 'DepartmentHead') {
          console.log('Navigating to /department-head-results'); // سجل للتحقق من التوجيه
          navigate('/department-head-results');
        } else if (data.role === 'Registrar') {
          console.log('Navigating to /registrar-students'); // سجل للتحقق من التوجيه
          navigate('/registrar-students');
        } else {
          console.log('Navigating to / (default route)'); // سجل للتحقق من التوجيه
          navigate('/');
        }
      } else {
        console.log('Login failed with error:', data.error); // سجل للتحقق من الخطأ
        setError(data.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError('Error during login. Please try again.');
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
        <h2 className="subtitle mb-2">Admission System</h2>
        <p className="lead mb-3">Login</p>
        {error && <p className="text-danger mb-3">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="stage-buttons">
            <button type="submit" className="btn section-btn">Login</button>
          </div>
          <div className="nav-buttons">
            <Link to="/" className="btn nav-btn">Home</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;