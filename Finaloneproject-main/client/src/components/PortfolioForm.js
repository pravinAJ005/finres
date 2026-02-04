import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PortfolioForm.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const PortfolioForm = () => {
  const navigate = useNavigate();
  const [portfolioId, setPortfolioId] = useState(null);
  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      linkedin: '',
      github: '',
      website: ''
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    certificates: [],
    projects: []
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
      loadPortfolio(id);
    }
  }, []);

  const loadPortfolio = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/portfolio/${id}`);
      if (response.data.success) {
        setFormData(response.data.portfolio);
        setPortfolioId(id);
        setShareUrl(`${window.location.origin}/portfolio/${id}`);
      }
    } catch (error) {
      console.error('Error loading portfolio:', error);
    }
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleArrayChange = (section, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addArrayItem = (section, defaultItem) => {
    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], defaultItem]
    }));
  };

  const removeArrayItem = (section, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const handleCertificateUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload an image file (JPEG, PNG, GIF, or WebP).');
      e.target.value = '';
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size too large. Maximum size is 10MB.');
      e.target.value = '';
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('certificate', file);

    try {
      const response = await axios.post(`${API_URL}/upload-certificate`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000 // 30 second timeout
      });

      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          certificates: [...prev.certificates, {
            name: file.name,
            url: response.data.url,
            filename: response.data.filename
          }]
        }));
        alert('Certificate uploaded successfully!');
      } else {
        throw new Error(response.data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading certificate:', error);
      const errorMessage = error.response?.data?.error 
        || error.message 
        || 'Error uploading certificate. Please check your connection and try again.';
      alert(errorMessage);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeCertificate = (index) => {
    setFormData(prev => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await axios.post(`${API_URL}/portfolio`, {
        ...formData,
        id: portfolioId
      });

      if (response.data.success) {
        const id = response.data.id;
        setPortfolioId(id);
        const url = `${window.location.origin}/portfolio/${id}`;
        setShareUrl(url);
        
        // Verify the portfolio was saved by fetching it
        try {
          const verifyResponse = await axios.get(`${API_URL}/portfolio/${id}`);
          if (verifyResponse.data.success) {
            alert('✅ Portfolio saved successfully!');
          } else {
            alert('⚠️ Portfolio saved but verification failed. Please try viewing again.');
          }
        } catch (verifyError) {
          console.error('Verification error:', verifyError);
          alert('⚠️ Portfolio saved but could not verify. Please try viewing again.');
        }
      } else {
        throw new Error(response.data.error || 'Save failed');
      }
    } catch (error) {
      console.error('Error saving portfolio:', error);
      const errorMessage = error.response?.data?.error 
        || error.message 
        || 'Error saving portfolio. Please try again.';
      alert(`Error: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleView = async () => {
    if (!portfolioId) {
      alert('Please save your portfolio first!');
      return;
    }

    // Verify portfolio exists before navigating
    try {
      const response = await axios.get(`${API_URL}/portfolio/${portfolioId}`);
      if (response.data.success) {
        navigate(`/portfolio/${portfolioId}`);
      } else {
        alert('Portfolio not found. Please save your portfolio again.');
      }
    } catch (error) {
      console.error('Error verifying portfolio:', error);
      alert('Error loading portfolio. Please save your portfolio again and try viewing.');
    }
  };

  return (
    <div className="portfolio-form-container">
      <div className="form-header">
        <h1>Create Your Portfolio</h1>
        {shareUrl && (
          <div className="share-section">
            <h3>🔗 Your Shareable Portfolio URL</h3>
            <p className="share-description">Share this URL with others to let them view and download your portfolio:</p>
            <div className="url-display">
              <input type="text" value={shareUrl} readOnly id="share-url-input" />
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  alert('✅ URL copied to clipboard! Share it with your friends.');
                }}
                className="copy-btn"
              >
                📋 Copy URL
              </button>
            </div>
            <div className="share-actions">
              <a 
                href={shareUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="preview-link"
              >
                👁️ Preview Portfolio
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="form-content">
        {/* Personal Information */}
        <section className="form-section">
          <h2>Personal Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                value={formData.personalInfo.fullName}
                onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={formData.personalInfo.email}
                onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={formData.personalInfo.phone}
                onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                value={formData.personalInfo.address}
                onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>LinkedIn</label>
              <input
                type="url"
                value={formData.personalInfo.linkedin}
                onChange={(e) => handleInputChange('personalInfo', 'linkedin', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>GitHub</label>
              <input
                type="url"
                value={formData.personalInfo.github}
                onChange={(e) => handleInputChange('personalInfo', 'github', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Website</label>
              <input
                type="url"
                value={formData.personalInfo.website}
                onChange={(e) => handleInputChange('personalInfo', 'website', e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Professional Summary */}
        <section className="form-section">
          <h2>Professional Summary</h2>
          <textarea
            value={formData.summary}
            onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
            rows="5"
            placeholder="Write a brief summary about yourself..."
          />
        </section>

        {/* Experience */}
        <section className="form-section">
          <h2>Work Experience</h2>
          {formData.experience.map((exp, index) => (
            <div key={index} className="array-item">
              <div className="form-grid">
                <div className="form-group">
                  <label>Job Title</label>
                  <input
                    type="text"
                    value={exp.title || ''}
                    onChange={(e) => handleArrayChange('experience', index, 'title', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Company</label>
                  <input
                    type="text"
                    value={exp.company || ''}
                    onChange={(e) => handleArrayChange('experience', index, 'company', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="text"
                    value={exp.startDate || ''}
                    onChange={(e) => handleArrayChange('experience', index, 'startDate', e.target.value)}
                    placeholder="MM/YYYY"
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="text"
                    value={exp.endDate || ''}
                    onChange={(e) => handleArrayChange('experience', index, 'endDate', e.target.value)}
                    placeholder="MM/YYYY or Present"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={exp.description || ''}
                  onChange={(e) => handleArrayChange('experience', index, 'description', e.target.value)}
                  rows="3"
                />
              </div>
              <button type="button" onClick={() => removeArrayItem('experience', index)} className="remove-btn">
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem('experience', {})} className="add-btn">
            + Add Experience
          </button>
        </section>

        {/* Education */}
        <section className="form-section">
          <h2>Education</h2>
          {formData.education.map((edu, index) => (
            <div key={index} className="array-item">
              <div className="form-grid">
                <div className="form-group">
                  <label>Degree</label>
                  <input
                    type="text"
                    value={edu.degree || ''}
                    onChange={(e) => handleArrayChange('education', index, 'degree', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Institution</label>
                  <input
                    type="text"
                    value={edu.institution || ''}
                    onChange={(e) => handleArrayChange('education', index, 'institution', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Year</label>
                  <input
                    type="text"
                    value={edu.year || ''}
                    onChange={(e) => handleArrayChange('education', index, 'year', e.target.value)}
                  />
                </div>
              </div>
              <button type="button" onClick={() => removeArrayItem('education', index)} className="remove-btn">
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem('education', {})} className="add-btn">
            + Add Education
          </button>
        </section>

        {/* Skills */}
        <section className="form-section">
          <h2>Skills</h2>
          <div className="form-group">
            <input
              type="text"
              placeholder="Enter skills separated by commas (e.g., JavaScript, React, Node.js)"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const skills = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                  if (skills.length > 0) {
                    setFormData(prev => ({
                      ...prev,
                      skills: [...prev.skills, ...skills]
                    }));
                    e.target.value = '';
                  }
                }
              }}
            />
          </div>
          <div className="skills-list">
            {formData.skills.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
                <button type="button" onClick={() => removeArrayItem('skills', index)}>×</button>
              </span>
            ))}
          </div>
        </section>

        {/* Certificates */}
        <section className="form-section">
          <h2>Certificates</h2>
          <div className="certificate-upload">
            <input
              type="file"
              accept="image/*"
              onChange={handleCertificateUpload}
              disabled={uploading}
            />
            {uploading && <p>Uploading...</p>}
          </div>
          <div className="certificates-list">
            {formData.certificates.map((cert, index) => (
              <div key={index} className="certificate-item">
                <span>{cert.name}</span>
                <button type="button" onClick={() => removeCertificate(index)}>Remove</button>
              </div>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section className="form-section">
          <h2>Projects</h2>
          {formData.projects.map((project, index) => (
            <div key={index} className="array-item">
              <div className="form-grid">
                <div className="form-group">
                  <label>Project Name</label>
                  <input
                    type="text"
                    value={project.name || ''}
                    onChange={(e) => handleArrayChange('projects', index, 'name', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Link</label>
                  <input
                    type="url"
                    value={project.link || ''}
                    onChange={(e) => handleArrayChange('projects', index, 'link', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={project.description || ''}
                  onChange={(e) => handleArrayChange('projects', index, 'description', e.target.value)}
                  rows="3"
                />
              </div>
              <button type="button" onClick={() => removeArrayItem('projects', index)} className="remove-btn">
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem('projects', {})} className="add-btn">
            + Add Project
          </button>
        </section>

        {/* Action Buttons */}
        <div className="form-actions">
          <button onClick={handleSave} disabled={saving} className="save-btn">
            {saving ? 'Saving...' : 'Save Portfolio'}
          </button>
          <button onClick={handleView} className="view-btn">
            View Portfolio
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioForm;
