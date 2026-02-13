'use client';

import { type Issue, SEVERITY_CONFIG, STATUS_CONFIG, PRIORITY_CONFIG } from '@/data/issues';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  FileSpreadsheet, 
  FileText,
  Globe
} from 'lucide-react';

interface IssueExportProps {
  issues: Issue[];
}

export function IssueExport({ issues }: IssueExportProps) {
  
  // Export to HTML with embedded screenshots (best for viewing)
  const exportToHTML = () => {
    if (issues.length === 0) return;

    let html = `<!DOCTYPE html>
<html>
<head>
  <title>QieWallet Issue Report</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; max-width: 1200px; margin: 0 auto; }
    h1 { color: #7c3aed; border-bottom: 3px solid #ec4899; padding-bottom: 10px; }
    .summary { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .issue { background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .issue-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px; }
    .issue-id { font-family: monospace; background: #e2e8f0; padding: 4px 12px; border-radius: 4px; font-size: 12px; }
    .issue-title { font-size: 18px; font-weight: bold; margin: 10px 0; color: #1f2937; }
    .badges { display: flex; gap: 8px; margin: 10px 0; flex-wrap: wrap; }
    .badge { padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 500; }
    .severity-critical { background: #fee2e2; color: #991b1b; }
    .severity-major { background: #fed7aa; color: #9a3412; }
    .severity-minor { background: #fef08a; color: #854d0e; }
    .severity-trivial { background: #e2e8f0; color: #475569; }
    .status-open { background: #dbeafe; color: #1e40af; }
    .status-in-progress { background: #f3e8ff; color: #7c3aed; }
    .status-resolved { background: #dcfce7; color: #166534; }
    .status-closed { background: #e2e8f0; color: #475569; }
    .status-wont-fix { background: #f1f5f9; color: #475569; }
    .section { margin: 15px 0; }
    .section-title { font-weight: 600; color: #374151; margin-bottom: 8px; }
    .steps { list-style: decimal; padding-left: 20px; }
    .steps li { margin: 5px 0; color: #4b5563; }
    .behavior-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; }
    @media (max-width: 768px) { .behavior-grid { grid-template-columns: 1fr; } }
    .expected { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 15px; }
    .actual { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 15px; }
    .screenshots { display: flex; flex-wrap: wrap; gap: 15px; margin-top: 10px; }
    .screenshot { max-width: 400px; border-radius: 8px; border: 1px solid #e5e7eb; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .meta { color: #6b7280; font-size: 13px; }
    .meta-item { display: inline-block; margin-right: 20px; margin-bottom: 5px; }
    .env-section { background: #f8fafc; padding: 15px; border-radius: 8px; margin-top: 15px; }
    .notes-section { background: #fffbeb; padding: 15px; border-radius: 8px; margin-top: 15px; border: 1px solid #fcd34d; }
    .stats { display: flex; gap: 20px; flex-wrap: wrap; }
    .stat-item { text-align: center; padding: 10px 20px; background: #f1f5f9; border-radius: 8px; }
    .stat-value { font-size: 24px; font-weight: bold; color: #7c3aed; }
    .stat-label { font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <h1>🪙 QieWallet Bug Report</h1>
  
  <div class="summary">
    <h2>Report Summary</h2>
    <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
    <div class="stats">
      <div class="stat-item">
        <div class="stat-value">${issues.length}</div>
        <div class="stat-label">Total Issues</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${issues.filter(i => i.status === 'open').length}</div>
        <div class="stat-label">Open</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${issues.filter(i => i.status === 'in-progress').length}</div>
        <div class="stat-label">In Progress</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${issues.filter(i => i.status === 'resolved').length}</div>
        <div class="stat-label">Resolved</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${issues.reduce((acc, i) => acc + i.screenshots.length, 0)}</div>
        <div class="stat-label">Screenshots</div>
      </div>
    </div>
  </div>
`;

    issues.forEach(issue => {
      const severityClass = `severity-${issue.severity}`;
      const statusClass = `status-${issue.status}`;
      
      html += `
  <div class="issue">
    <div class="issue-header">
      <span class="issue-id">${issue.id}</span>
    </div>
    <div class="issue-title">${issue.title}</div>
    <div class="badges">
      <span class="badge ${severityClass}">${SEVERITY_CONFIG[issue.severity].label}</span>
      <span class="badge ${statusClass}">${STATUS_CONFIG[issue.status].label}</span>
      <span class="badge" style="background: #fef3c7; color: #92400e;">${PRIORITY_CONFIG[issue.priority].label} Priority</span>
      ${issue.screenshots.length > 0 ? `<span class="badge" style="background: #e0e7ff; color: #3730a3;">📷 ${issue.screenshots.length} screenshot(s)</span>` : ''}
    </div>
    
    <div class="meta">
      <span class="meta-item">📁 ${issue.screen}</span>
      <span class="meta-item">📅 ${new Date(issue.createdAt).toLocaleDateString()}</span>
      ${issue.reportedBy ? `<span class="meta-item">👤 Reported by: ${issue.reportedBy}</span>` : ''}
      ${issue.assignedTo ? `<span class="meta-item">👥 Assigned to: ${issue.assignedTo}</span>` : ''}
    </div>

    ${issue.description ? `
    <div class="section">
      <div class="section-title">📝 Description</div>
      <p style="color: #4b5563;">${issue.description}</p>
    </div>` : ''}

    ${issue.stepsToReproduce.length > 0 ? `
    <div class="section">
      <div class="section-title">🔄 Steps to Reproduce</div>
      <ol class="steps">
        ${issue.stepsToReproduce.map(step => `<li>${step}</li>`).join('')}
      </ol>
    </div>` : ''}

    <div class="behavior-grid">
      ${issue.expectedBehavior ? `
      <div class="expected">
        <div class="section-title">✅ Expected Behavior</div>
        <p style="color: #166534;">${issue.expectedBehavior}</p>
      </div>` : '<div></div>'}
      
      ${issue.actualBehavior ? `
      <div class="actual">
        <div class="section-title">❌ Actual Behavior</div>
        <p style="color: #991b1b;">${issue.actualBehavior}</p>
      </div>` : '<div></div>'}
    </div>

    ${issue.screenshots.length > 0 ? `
    <div class="section">
      <div class="section-title">📸 Screenshots (${issue.screenshots.length})</div>
      <div class="screenshots">
        ${issue.screenshots.map(ss => `
        <div>
          <img src="${ss.dataUrl}" alt="${ss.fileName}" class="screenshot">
          <p style="font-size: 11px; color: #9ca3af; margin-top: 5px;">${ss.fileName}</p>
        </div>
        `).join('')}
      </div>
    </div>` : ''}

    ${issue.notes ? `
    <div class="notes-section">
      <div class="section-title">📋 Notes</div>
      <p style="color: #92400e;">${issue.notes}</p>
    </div>` : ''}

    ${(issue.environment || issue.device || issue.osVersion || issue.appVersion) ? `
    <div class="env-section">
      <div class="section-title">🖥️ Environment Details</div>
      <div class="meta">
        ${issue.environment ? `<span class="meta-item">Environment: <strong>${issue.environment}</strong></span>` : ''}
        ${issue.device ? `<span class="meta-item">Device: <strong>${issue.device}</strong></span>` : ''}
        ${issue.osVersion ? `<span class="meta-item">OS: <strong>${issue.osVersion}</strong></span>` : ''}
        ${issue.appVersion ? `<span class="meta-item">App Version: <strong>${issue.appVersion}</strong></span>` : ''}
      </div>
    </div>` : ''}
  </div>
`;
    });

    html += `
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qiewallet-issue-report-${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportIssueToMarkdown = () => {
    if (issues.length === 0) return;

    let md = `# QieWallet Bug Report\n\n`;
    md += `**Generated:** ${new Date().toLocaleString()}\n\n`;
    md += `**Total Issues:** ${issues.length}\n\n`;
    md += `---\n\n`;

    issues.forEach(issue => {
      md += `## ${issue.id}: ${issue.title}\n\n`;
      md += `| Field | Value |\n`;
      md += `|-------|-------|\n`;
      md += `| **Status** | ${STATUS_CONFIG[issue.status].label} |\n`;
      md += `| **Severity** | ${SEVERITY_CONFIG[issue.severity].label} |\n`;
      md += `| **Priority** | ${PRIORITY_CONFIG[issue.priority].label} |\n`;
      md += `| **Screen** | ${issue.screen} |\n`;
      if (issue.reportedBy) md += `| **Reported By** | ${issue.reportedBy} |\n`;
      if (issue.assignedTo) md += `| **Assigned To** | ${issue.assignedTo} |\n`;
      md += `| **Created** | ${new Date(issue.createdAt).toLocaleString()} |\n`;
      md += `\n`;

      if (issue.description) {
        md += `### Description\n${issue.description}\n\n`;
      }

      if (issue.stepsToReproduce.length > 0) {
        md += `### Steps to Reproduce\n`;
        issue.stepsToReproduce.forEach((step, i) => {
          md += `${i + 1}. ${step}\n`;
        });
        md += `\n`;
      }

      if (issue.expectedBehavior) {
        md += `### ✅ Expected Behavior\n${issue.expectedBehavior}\n\n`;
      }

      if (issue.actualBehavior) {
        md += `### ❌ Actual Behavior\n${issue.actualBehavior}\n\n`;
      }

      if (issue.screenshots.length > 0) {
        md += `### 📸 Screenshots (${issue.screenshots.length})\n`;
        md += `> Note: Screenshots are embedded in the HTML export. For Markdown, use the HTML export to view images.\n\n`;
      }

      if (issue.notes) {
        md += `### Notes\n${issue.notes}\n\n`;
      }

      if (issue.environment || issue.device || issue.osVersion || issue.appVersion) {
        md += `### Environment\n`;
        if (issue.environment) md += `- **Environment:** ${issue.environment}\n`;
        if (issue.device) md += `- **Device:** ${issue.device}\n`;
        if (issue.osVersion) md += `- **OS Version:** ${issue.osVersion}\n`;
        if (issue.appVersion) md += `- **App Version:** ${issue.appVersion}\n`;
        md += `\n`;
      }

      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qiewallet-issue-report-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportIssueToCSV = () => {
    if (issues.length === 0) return;

    let csv = 'ID,Title,Description,Screen,Severity,Priority,Status,Steps to Reproduce,Expected Behavior,Actual Behavior,Screenshot Count,Screenshot Filenames,Environment,Device,OS Version,App Version,Reported By,Assigned To,Created At,Notes\n';
    
    const escapeCSV = (str: string) => `"${str.replace(/"/g, '""')}"`;
    
    issues.forEach(issue => {
      csv += `${escapeCSV(issue.id)},`;
      csv += `${escapeCSV(issue.title)},`;
      csv += `${escapeCSV(issue.description)},`;
      csv += `${escapeCSV(issue.screen)},`;
      csv += `${escapeCSV(SEVERITY_CONFIG[issue.severity].label)},`;
      csv += `${escapeCSV(PRIORITY_CONFIG[issue.priority].label)},`;
      csv += `${escapeCSV(STATUS_CONFIG[issue.status].label)},`;
      csv += `${escapeCSV(issue.stepsToReproduce.join(' | '))},`;
      csv += `${escapeCSV(issue.expectedBehavior)},`;
      csv += `${escapeCSV(issue.actualBehavior)},`;
      csv += `${issue.screenshots.length},`;
      csv += `${escapeCSV(issue.screenshots.map(s => s.fileName).join('; '))},`;
      csv += `${escapeCSV(issue.environment)},`;
      csv += `${escapeCSV(issue.device)},`;
      csv += `${escapeCSV(issue.osVersion)},`;
      csv += `${escapeCSV(issue.appVersion)},`;
      csv += `${escapeCSV(issue.reportedBy)},`;
      csv += `${escapeCSV(issue.assignedTo)},`;
      csv += `${escapeCSV(new Date(issue.createdAt).toLocaleString())},`;
      csv += `${escapeCSV(issue.notes)}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qiewallet-issue-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalScreenshots = issues.reduce((acc, i) => acc + i.screenshots.length, 0);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button variant="outline" size="sm" onClick={exportIssueToCSV} disabled={issues.length === 0}>
        <FileSpreadsheet className="w-4 h-4 mr-2" />
        CSV
      </Button>
      <Button variant="outline" size="sm" onClick={exportIssueToMarkdown} disabled={issues.length === 0}>
        <FileText className="w-4 h-4 mr-2" />
        Markdown
      </Button>
      <Button 
        variant="default" 
        size="sm" 
        onClick={exportToHTML} 
        disabled={issues.length === 0}
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
      >
        <Globe className="w-4 h-4 mr-2" />
        Export HTML {totalScreenshots > 0 && `(${totalScreenshots} 📷)`}
      </Button>
    </div>
  );
}
