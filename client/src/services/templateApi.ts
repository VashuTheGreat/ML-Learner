import api from './api';

// A premium, modern, professional resume HTML/CSS generator
function generateResumeHtml(data: any): string {
    if (!data) {
        return '<div style="font-family: \'Inter\', sans-serif; text-align: center; padding: 40px; color: #666;">No resume data found. Please complete your profile.</div>';
    }

    const name = data.name || data.fullName || 'Professional Candidate';
    const email = data.email || '';
    const phone = data.phone || '';
    const location = data.location || '';
    const summary = data.summary || data.aboutUser || '';
    const apparentSeniority = data.apparentSeniority || '';

    const skills = Array.isArray(data.skills) ? data.skills : [];
    const experience = Array.isArray(data.experience) ? data.experience : [];
    const education = Array.isArray(data.education) ? data.education : [];
    const projects = Array.isArray(data.projects) ? data.projects : [];
    
    // Support nested links structure
    const socialLinks = data.links?.social_links || (Array.isArray(data.links) ? data.links : []);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${name} - Resume</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #2563eb;
      --primary-dark: #1d4ed8;
      --text-main: #1f2937;
      --text-muted: #4b5563;
      --bg: #ffffff;
      --border: #e5e7eb;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Inter', sans-serif;
      color: var(--text-main);
      background-color: var(--bg);
      line-height: 1.6;
      padding: 40px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    header {
      border-bottom: 2px solid var(--primary);
      padding-bottom: 20px;
      margin-bottom: 25px;
    }
    h1 {
      font-size: 32px;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.025em;
      margin-bottom: 5px;
    }
    .seniority {
      display: inline-block;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: #eff6ff;
      color: var(--primary);
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 700;
      margin-bottom: 10px;
    }
    .contact-info {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      font-size: 14px;
      color: var(--text-muted);
      margin-top: 10px;
    }
    .contact-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .contact-item a {
      color: var(--text-muted);
      text-decoration: none;
    }
    .contact-item a:hover {
      color: var(--primary);
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--primary);
      border-bottom: 1px solid var(--border);
      padding-bottom: 5px;
      margin-bottom: 15px;
    }
    .summary-text {
      font-size: 15px;
      color: var(--text-muted);
      text-align: justify;
    }
    .item {
      margin-bottom: 20px;
    }
    .item:last-child {
      margin-bottom: 0;
    }
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 5px;
    }
    .item-title {
      font-size: 16px;
      font-weight: 700;
    }
    .item-subtitle {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-muted);
    }
    .item-date {
      font-size: 13px;
      color: var(--text-muted);
      font-weight: 500;
    }
    .item-summary {
      font-size: 14px;
      color: var(--text-muted);
      margin-top: 5px;
    }
    .bullet-list {
      list-style-type: square;
      padding-left: 20px;
      margin-top: 8px;
      font-size: 14px;
      color: var(--text-muted);
    }
    .bullet-list li {
      margin-bottom: 4px;
    }
    .skills-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .skill-tag {
      font-size: 13px;
      background-color: #f3f4f6;
      color: var(--text-main);
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 500;
      border: 1px solid var(--border);
    }
    .social-links {
      margin-top: 5px;
      display: flex;
      gap: 10px;
    }
    .social-links a {
      font-size: 13px;
      color: var(--primary);
      text-decoration: none;
      font-weight: 500;
    }
    .social-links a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${name}</h1>
      ${apparentSeniority ? `<div class="seniority">${apparentSeniority} Level</div>` : ''}
      <div class="contact-info">
        ${email ? `<div class="contact-item">✉ ${email}</div>` : ''}
        ${phone ? `<div class="contact-item">📞 ${phone}</div>` : ''}
        ${location ? `<div class="contact-item">📍 ${location}</div>` : ''}
      </div>
      ${socialLinks.length > 0 ? `
        <div class="social-links">
          ${socialLinks.map((link: string) => `<a href="${link}" target="_blank">${link.replace('https://', '').replace('www.', '')}</a>`).join(' | ')}
        </div>
      ` : ''}
    </header>

    ${summary ? `
      <div class="section">
        <h2 class="section-title">Professional Summary</h2>
        <p class="summary-text">${summary}</p>
      </div>
    ` : ''}

    ${experience.length > 0 ? `
      <div class="section">
        <h2 class="section-title">Work Experience</h2>
        ${experience.map((exp: any) => `
          <div class="item">
            <div class="item-header">
              <div class="item-title">${exp.role || ''}</div>
              <div class="item-subtitle">${exp.company || ''}</div>
            </div>
            <div class="item-summary">${exp.summary || ''}</div>
          </div>
        `).join('')}
      </div>
    ` : ''}

    ${projects.length > 0 ? `
      <div class="section">
        <h2 class="section-title">Projects</h2>
        ${projects.map((proj: any) => `
          <div class="item">
            <div class="item-header">
              <div class="item-title">${proj.title || ''}</div>
              ${proj.links && proj.links.length > 0 ? `
                <div class="item-date">
                  ${proj.links.map((link: string) => `<a href="${link}" target="_blank" style="color: var(--primary); text-decoration: none;">Link</a>`).join(', ')}
                </div>
              ` : ''}
            </div>
            ${proj.bullet_points && proj.bullet_points.length > 0 ? `
              <ul class="bullet-list">
                ${proj.bullet_points.map((pt: string) => `<li>${pt}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        `).join('')}
      </div>
    ` : ''}

    ${education.length > 0 ? `
      <div class="section">
        <h2 class="section-title">Education</h2>
        ${education.map((edu: any) => `
          <div class="item">
            <div class="item-header">
              <div class="item-title">${edu.degree || ''}</div>
              <div class="item-date">${edu.start || ''} - ${edu.end || 'Present'}</div>
            </div>
            <div class="item-subtitle">${edu.college || edu.university || ''}</div>
          </div>
        `).join('')}
      </div>
    ` : ''}

    ${skills.length > 0 ? `
      <div class="section">
        <h2 class="section-title">Skills</h2>
        <div class="skills-grid">
          ${skills.map((skill: string) => `<span class="skill-tag">${skill}</span>`).join('')}
        </div>
      </div>
    ` : ''}
  </div>
</body>
</html>
    `;
}

class TemplateApi {
    // ── Resume Templates ──────────────────────────────────────────────────
    async createResumeTemplate(file: File) {
        const formData = new FormData();
        formData.append('upload_file', file);
        const response = await api.post('/template/resume', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data.data;
    }

    async getResumeTemplate() {
        const response = await api.get('/template/resume');
        return response.data.data;
    }

    async updateResumeTemplate(content: any) {
        const response = await api.put('/template/resume', { content });
        return response.data.data;
    }

    // ── Coding Workspace Templates ────────────────────────────────────────
    async createCodingTemplate(content: any) {
        const response = await api.post('/template/coding', { content });
        return response.data.data;
    }

    async getCodingTemplate() {
        const response = await api.get('/template/coding');
        return response.data.data;
    }

    // ── Legacy Compatibility Layer ───────────────────────────────────────
    async getTemplate(id: string) {
        try {
            const data = await this.getResumeTemplate();
            return {
                _id: 'resume',
                title: 'AI Generated Resume',
                to_render: generateResumeHtml(data?.content),
                ...data
            };
        } catch {
            return {
                _id: 'resume',
                title: 'AI Generated Resume',
                to_render: ''
            };
        }
    }

    async createTemplate(formData: FormData) {
        // Fallback for form-data template upload
        const file = formData.get('template') as File;
        if (file) {
            return this.createResumeTemplate(file);
        }
        return null;
    }

    async getAllTemplates() {
        // Return a default AI template to keep the dashboard / selection active
        return [{
            _id: 'resume',
            title: 'AI Generated Resume',
            description: 'A premium, modern resume template automatically compiled from your profile schema.',
            to_render: ''
        }];
    }

    async getTemplateByData(templateId: string, tempData: any) {
        // Standardize structure
        const data = tempData?.userDetails ? tempData.userDetails : tempData;
        return {
            to_render: generateResumeHtml(data)
        };
    }
}

export default new TemplateApi();
