import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './PortfolioView.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const PortfolioView = () => {
  const { id } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [viewingCertificate, setViewingCertificate] = useState(null);
  const shareUrl = `${window.location.origin}/portfolio/${id}`;

  useEffect(() => {
    loadPortfolio();
    // Auto-refresh every 30 seconds to get updates
    const interval = setInterval(loadPortfolio, 30000);
    return () => clearInterval(interval);
  }, [id]);

  const loadPortfolio = async () => {
    try {
      if (!id) {
        setError('Portfolio ID is missing');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/portfolio/${id}`);
      if (response.data.success) {
        setPortfolio(response.data.portfolio);
        setError(null);
      } else {
        setError('Portfolio not found');
        console.error('Portfolio not found. Response:', response.data);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error 
        || err.message 
        || 'Error loading portfolio';
      setError(errorMessage);
      console.error('Error loading portfolio:', err);
      console.error('Portfolio ID:', id);
      console.error('API URL:', API_URL);
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async (filename, name) => {
    try {
      const response = await axios.get(`${API_URL}/certificate/${filename}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', name || filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Error downloading certificate');
    }
  };

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const element = document.getElementById('resume-content');
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = portfolio?.personalInfo?.fullName 
        ? `${portfolio.personalInfo.fullName}_Resume.pdf`
        : 'Portfolio_Resume.pdf';
      
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading portfolio...</div>;
  }

  if (error || !portfolio) {
    return <div className="error">Error: {error || 'Portfolio not found'}</div>;
  }

  const { personalInfo, summary, experience, education, skills, certificates, projects } = portfolio;

  const viewCertificate = (cert) => {
    setViewingCertificate(cert);
  };

  const closeCertificateView = () => {
    setViewingCertificate(null);
  };

  return (
    <div className="portfolio-view-container">
      <div className="view-header">
        <div className="header-content">
          <h1>📄 Portfolio Resume</h1>
          <div className="share-url-banner">
            <span className="share-label">Share this portfolio:</span>
            <input 
              type="text" 
              value={shareUrl} 
              readOnly 
              className="share-url-input"
              onClick={(e) => e.target.select()}
            />
            <button 
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                alert('✅ URL copied to clipboard!');
              }}
              className="copy-share-btn"
            >
              📋 Copy
            </button>
          </div>
        </div>
        <div className="action-buttons">
          <button onClick={downloadPDF} disabled={downloading} className="download-btn">
            {downloading ? '⏳ Generating PDF...' : '📥 Download Resume (PDF)'}
          </button>
        </div>
      </div>

      <div id="resume-content" className="resume-content">
        {/* Header Section */}
        <div className="resume-header">
          <h1 className="resume-name">{personalInfo?.fullName || 'Your Name'}</h1>
          <div className="resume-contact">
            {personalInfo?.email && <span>📧 {personalInfo.email}</span>}
            {personalInfo?.phone && <span>📱 {personalInfo.phone}</span>}
            {personalInfo?.address && <span>📍 {personalInfo.address}</span>}
          </div>
          <div className="resume-links">
            {personalInfo?.linkedin && (
              <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            )}
            {personalInfo?.github && (
              <a href={personalInfo.github} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            )}
            {personalInfo?.website && (
              <a href={personalInfo.website} target="_blank" rel="noopener noreferrer">
                Website
              </a>
            )}
          </div>
        </div>

        {/* Professional Summary */}
        {summary && (
          <section className="resume-section">
            <h2 className="section-title">Professional Summary</h2>
            <p className="section-content">{summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <section className="resume-section">
            <h2 className="section-title">Work Experience</h2>
            {experience.map((exp, index) => (
              <div key={index} className="experience-item">
                <div className="experience-header">
                  <h3>{exp.title || 'Job Title'}</h3>
                  <span className="experience-date">
                    {exp.startDate || ''} - {exp.endDate || 'Present'}
                  </span>
                </div>
                <div className="experience-company">{exp.company || ''}</div>
                {exp.description && <p className="experience-description">{exp.description}</p>}
              </div>
            ))}
          </section>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <section className="resume-section">
            <h2 className="section-title">Education</h2>
            {education.map((edu, index) => (
              <div key={index} className="education-item">
                <h3>{edu.degree || 'Degree'}</h3>
                <div className="education-details">
                  <span>{edu.institution || 'Institution'}</span>
                  {edu.year && <span> • {edu.year}</span>}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <section className="resume-section">
            <h2 className="section-title">Skills</h2>
            <div className="skills-display">
              {skills.map((skill, index) => (
                <span key={index} className="skill-badge">{skill}</span>
              ))}
            </div>
          </section>
        )}

        {/* Certificates */}
        {certificates && certificates.length > 0 && (
          <section className="resume-section">
            <h2 className="section-title">Certificates</h2>
            <div className="certificates-display">
              {certificates.map((cert, index) => (
                <div key={index} className="certificate-display-item">
                  <div className="cert-info">
                    <span className="cert-name">📜 {cert.name}</span>
                  </div>
                  <div className="cert-actions">
                    <button
                      onClick={() => viewCertificate(cert)}
                      className="cert-view-btn"
                    >
                      👁️ View
                    </button>
                    <button
                      onClick={() => downloadCertificate(cert.filename, cert.name)}
                      className="cert-download-btn"
                    >
                      📥 Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <section className="resume-section">
            <h2 className="section-title">Projects</h2>
            {projects.map((project, index) => (
              <div key={index} className="project-item">
                <div className="project-header">
                  <h3>{project.name || 'Project Name'}</h3>
                  {project.link && (
                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="project-link">
                      View Project →
                    </a>
                  )}
                </div>
                {project.description && <p className="project-description">{project.description}</p>}
              </div>
            ))}
          </section>
        )}
      </div>

      {/* Certificate View Modal */}
      {viewingCertificate && (
        <div className="certificate-modal" onClick={closeCertificateView}>
          <div className="certificate-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={closeCertificateView}>×</button>
            <h3>{viewingCertificate.name}</h3>
            <div className="certificate-image-container">
              <img 
                src={`${API_URL.replace('/api', '')}${viewingCertificate.url}`} 
                alt={viewingCertificate.name}
                className="certificate-image"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EImage not found%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
            <div className="modal-actions">
              <button
                onClick={() => downloadCertificate(viewingCertificate.filename, viewingCertificate.name)}
                className="modal-download-btn"
              >
                📥 Download Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioView;
