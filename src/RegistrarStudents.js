import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import bgImage from './bg1.jpg';
import './HomePage.css';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function RegistrarStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [error, setError] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      console.log('No refresh token found in localStorage');
      return null;
    }

    try {
      console.log('Attempting to refresh token...');
      const response = await fetch('https://school-system-backend-yr14.onrender.com/api/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      console.log('Refresh token response status:', response.status);
      const data = await response.json();
      if (response.ok) {
        console.log('Token refreshed successfully:', data.token);
        localStorage.setItem('token', data.token);
        return data.token;
      } else {
        console.error('Failed to refresh token:', data.error);
        throw new Error(data.error || 'Failed to refresh token');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchStudents = async () => {
      let token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found in localStorage');
        setError('Your session has expired or you are not logged in. Please log in again.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        console.log('Fetching students data...');
        let response = await fetch('https://school-system-backend-yr14.onrender.com/api/students', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Fetch students response status:', response.status);
        if (response.status === 403 || response.status === 401) {
          console.log('Token expired, attempting to refresh...');
          token = await refreshToken();
          if (!token) {
            console.log('Token refresh failed, redirecting to login');
            setError('Your session has expired. Please log in again.');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            setTimeout(() => navigate('/login'), 3000);
            return;
          }

          console.log('Retrying fetch students with new token...');
          response = await fetch('https://school-system-backend-yr14.onrender.com/api/students', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          console.log('Retry fetch response status:', response.status);
        }

        const data = await response.json();
        if (response.ok) {
          console.log('Students data retrieved:', data.students);
          setStudents(data.students);
          setFilteredStudents(data.students);
          if (data.students.length === 0) {
            setError('No student data found.');
          }
        } else {
          console.error('Error fetching students:', data.error);
          setError(data.error || 'Error fetching students data.');
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        setError('Error fetching students data. Please try again.');
      }
    };

    fetchStudents();
  }, [navigate]);

  // دالة لتصفية البيانات بناءً على القسم، المرحلة، والمستوى
  const handleFilter = () => {
    let filtered = [...students];
    if (divisionFilter) {
      filtered = filtered.filter(student => student.division === divisionFilter);
    }
    if (stageFilter) {
      filtered = filtered.filter(student => student.stage === stageFilter);
    }
    if (levelFilter) {
      filtered = filtered.filter(student => student.level === levelFilter);
    }
    setFilteredStudents(filtered);
  };

  // دالة لتصدير البيانات إلى Excel
  const exportToExcel = () => {
    const exportData = filteredStudents.map(student => ({
      'Student Name': student.name || 'N/A',
      'Full Name (Arabic)': student.fullNameAr || 'N/A',
      'Full Name (English)': student.fullNameEn || 'N/A',
      'National ID': student.nationalId || 'N/A',
      'Birth Date': student.birthDate || 'N/A',
      'Nationality': student.nationality || 'N/A',
      "Father's Phone": student.fatherPhone || 'N/A',
      "Mother's Phone": student.motherPhone || 'N/A',
      'Division': student.division || 'N/A',
      'Stage': student.stage || 'N/A',
      'Level': student.level || 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    XLSX.writeFile(workbook, 'students_data.xlsx');
  };

  // دالة لتصدير البيانات إلى PDF مع دعم اللغة العربية وتحسين التنسيق
  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape', // استخدام الاتجاه الأفقي لتتناسب مع عدد الأعمدة
    });

    // إضافة عنوان الملف
    doc.text('Students Data', 10, 10);

    // تحديد الأعمدة مع عرض مخصص لكل عمود
    const columns = [
      { header: 'Student Name', dataKey: 'studentName', width: 30 },
      { header: 'Full Name (Arabic)', dataKey: 'fullNameAr', width: 30 },
      { header: 'Full Name (English)', dataKey: 'fullNameEn', width: 30 },
      { header: 'National ID', dataKey: 'nationalId', width: 20 },
      { header: 'Birth Date', dataKey: 'birthDate', width: 20 },
      { header: 'Nationality', dataKey: 'nationality', width: 20 },
      { header: "Father's Phone", dataKey: 'fatherPhone', width: 20 },
      { header: "Mother's Phone", dataKey: 'motherPhone', width: 20 },
      { header: 'Division', dataKey: 'division', width: 20 },
      { header: 'Stage', dataKey: 'stage', width: 20 },
      { header: 'Level', dataKey: 'level', width: 20 },
    ];

    // تحضير البيانات
    const data = filteredStudents.map(student => ({
      studentName: student.name || 'N/A',
      fullNameAr: student.fullNameAr || 'N/A',
      fullNameEn: student.fullNameEn || 'N/A',
      nationalId: student.nationalId || 'N/A',
      birthDate: student.birthDate || 'N/A',
      nationality: student.nationality || 'N/A',
      fatherPhone: student.fatherPhone || 'N/A',
      motherPhone: student.motherPhone || 'N/A',
      division: student.division || 'N/A',
      stage: student.stage || 'N/A',
      level: student.level || 'N/A',
    }));

    // إعدادات autoTable مع دعم RTL وتحسين التنسيق
    autoTable(doc, {
      columns: columns,
      body: data,
      startY: 20,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 2,
        overflow: 'linebreak', // السماح بالالتفاف التلقائي للنصوص الطويلة
        halign: 'right', // محاذاة النصوص إلى اليمين لدعم اللغة العربية
        valign: 'middle',
      },
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: [0, 0, 0],
        halign: 'right', // محاذاة رأس الجدول إلى اليمين
      },
      columnStyles: {
        studentName: { cellWidth: 30 },
        fullNameAr: { cellWidth: 30 },
        fullNameEn: { cellWidth: 30 },
        nationalId: { cellWidth: 20 },
        birthDate: { cellWidth: 20 },
        nationality: { cellWidth: 20 },
        fatherPhone: { cellWidth: 20 },
        motherPhone: { cellWidth: 20 },
        division: { cellWidth: 20 },
        stage: { cellWidth: 20 },
        level: { cellWidth: 20 },
      },
      didDrawCell: (data) => {
        // لضمان أن النصوص العربية تظهر بشكل صحيح (إذا كان هناك دعم إضافي للخطوط)
        if (data.column.dataKey === 'fullNameAr') {
          doc.setTextColor(0, 0, 0);
        }
      },
    });

    doc.save('students_data.pdf');
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
        <h2 className="subtitle mb-2">Registrar Dashboard</h2>
        <p className="lead mb-3">Review Student Registration Data</p>
        {error && <p className="text-danger mb-3">{error}</p>}

        {/* فلاتر التصفية */}
        <div className="mb-3">
          <label htmlFor="divisionFilter" className="form-label">Filter by Division</label>
          <select
            id="divisionFilter"
            className="form-control mb-2"
            value={divisionFilter}
            onChange={(e) => setDivisionFilter(e.target.value)}
          >
            <option value="">All Divisions</option>
            <option value="British">British</option>
            <option value="American">American</option>
          </select>

          <label htmlFor="stageFilter" className="form-label">Filter by Stage</label>
          <select
            id="stageFilter"
            className="form-control mb-2"
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
          >
            <option value="">All Stages</option>
            <option value="Kindergarten">Kindergarten</option>
            <option value="Primary">Primary</option>
            <option value="Lower Secondary">Lower Secondary</option>
            <option value="Upper Secondary">Upper Secondary</option>
          </select>

          <label htmlFor="levelFilter" className="form-label">Filter by Level</label>
          <select
            id="levelFilter"
            className="form-control mb-2"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
          >
            <option value="">All Levels</option>
            <option value="KG1">KG1</option>
            <option value="KG2">KG2</option>
            <option value="KG3">KG3</option>
            <option value="Year 1">Year 1</option>
            <option value="Year 2">Year 2</option>
            <option value="Year 3">Year 3</option>
            <option value="Year 4">Year 4</option>
            <option value="Year 5">Year 5</option>
            <option value="Year 6">Year 6</option>
            <option value="Year 7">Year 7</option>
            <option value="Year 8">Year 8</option>
            <option value="Year 9">Year 9</option>
            <option value="Year 10">Year 10</option>
            <option value="Year 11">Year 11</option>
            <option value="Year 12">Year 12</option>
            <option value="Grade 1">Grade 1</option>
            <option value="Grade 2">Grade 2</option>
            <option value="Grade 3">Grade 3</option>
            <option value="Grade 4">Grade 4</option>
            <option value="Grade 5">Grade 5</option>
            <option value="Grade 6">Grade 6</option>
            <option value="Grade 7">Grade 7</option>
            <option value="Grade 8">Grade 8</option>
            <option value="Grade 9">Grade 9</option>
            <option value="Grade 10">Grade 10</option>
            <option value="Grade 11">Grade 11</option>
            <option value="Grade 12">Grade 12</option>
          </select>

          <button className="btn section-btn" onClick={handleFilter}>
            Apply Filters
          </button>
        </div>

        {/* أزرار التصدير */}
        <div className="mb-3">
          <button className="btn section-btn me-2" onClick={exportToExcel}>
            Export to Excel
          </button>
          <button className="btn section-btn" onClick={exportToPDF}>
            Export to PDF
          </button>
        </div>

        {filteredStudents.length === 0 && !error ? (
          <p>No students found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Full Name (Arabic)</th>
                  <th>Full Name (English)</th>
                  <th>National ID</th>
                  <th>Birth Date</th>
                  <th>Nationality</th>
                  <th>Father's Phone</th>
                  <th>Mother's Phone</th>
                  <th>Division</th>
                  <th>Stage</th>
                  <th>Level</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <tr key={index}>
                    <td>{student.name || 'N/A'}</td>
                    <td>{student.fullNameAr || 'N/A'}</td>
                    <td>{student.fullNameEn || 'N/A'}</td>
                    <td>{student.nationalId || 'N/A'}</td>
                    <td>{student.birthDate || 'N/A'}</td>
                    <td>{student.nationality || 'N/A'}</td>
                    <td>{student.fatherPhone || 'N/A'}</td>
                    <td>{student.motherPhone || 'N/A'}</td>
                    <td>{student.division || 'N/A'}</td>
                    <td>{student.stage || 'N/A'}</td>
                    <td>{student.level || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="nav-buttons">
          <Link to="/" className="btn nav-btn">Home</Link>
        </div>
      </div>
    </div>
  );
}

export default RegistrarStudents;