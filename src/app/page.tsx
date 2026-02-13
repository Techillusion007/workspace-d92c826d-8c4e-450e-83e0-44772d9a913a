'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { testCases, CATEGORIES, PRIORITIES, SCREENS, TEST_SUMMARY, type TestCase, type TestCategory, type TestPriority, type TestStatus } from '@/data/test-cases';
import { Issue, ISSUE_SEVERITY, ISSUE_STATUS, ISSUE_TYPES, type IssueSeverity, type IssueStatus, type IssueType } from '@/data/issues';
import { IssueForm } from '@/components/issue-form';
import { IssueList } from '@/components/issue-list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Filter, 
  Download, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Bug,
  Shield,
  Zap,
  Eye,
  Layout,
  Database,
  TestTube,
  Plus,
  AlertCircle,
  FileSpreadsheet,
  FileImage,
  Smartphone,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const STATUS_CONFIG: Record<TestStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-700 border-gray-300', icon: <Clock className="w-4 h-4" /> },
  passed: { label: 'Passed', color: 'bg-green-100 text-green-700 border-green-300', icon: <CheckCircle2 className="w-4 h-4" /> },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700 border-red-300', icon: <XCircle className="w-4 h-4" /> },
  blocked: { label: 'Blocked', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: <AlertTriangle className="w-4 h-4" /> },
};

const CATEGORY_ICONS: Record<TestCategory, React.ReactNode> = {
  functional: <TestTube className="w-4 h-4" />,
  'ui-ux': <Eye className="w-4 h-4" />,
  'input-validation': <Database className="w-4 h-4" />,
  negative: <XCircle className="w-4 h-4" />,
  'edge-case': <Bug className="w-4 h-4" />,
  performance: <Zap className="w-4 h-4" />,
  security: <Shield className="w-4 h-4" />,
  accessibility: <Layout className="w-4 h-4" />,
  integration: <FileText className="w-4 h-4" />,
};

export default function QAWalletTestReport() {
  // Test Cases State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScreen, setSelectedScreen] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [testCaseStatuses, setTestCaseStatuses] = useState<Record<string, TestStatus>>({});
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  
  // Issues State
  const [issues, setIssues] = useState<Issue[]>([]);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [activeTab, setActiveTab] = useState<string>('testcases');
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Load issues from API
  const loadIssues = useCallback(async () => {
    try {
      const response = await fetch('/api/issues');
      if (response.ok) {
        const data = await response.json();
        setIssues(data.issues);
        setLastSync(new Date());
      }
    } catch (error) {
      console.error('Failed to load issues:', error);
    }
  }, []);

  // Load issues on mount and poll periodically
  useEffect(() => {
    // Initial load
    fetch('/api/issues')
      .then(res => res.json())
      .then(data => {
        setIssues(data.issues);
        setLastSync(new Date());
      })
      .catch(console.error);
    
    // Poll for updates every 5 seconds
    const interval = setInterval(() => {
      fetch('/api/issues')
        .then(res => res.json())
        .then(data => {
          setIssues(data.issues);
          setLastSync(new Date());
        })
        .catch(console.error);
    }, 5000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Filtered Test Cases
  const filteredTests = useMemo(() => {
    return testCases.filter(tc => {
      const matchesSearch = searchQuery === '' || 
        tc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tc.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesScreen = selectedScreen === 'all' || tc.screen === selectedScreen;
      const matchesCategory = selectedCategory === 'all' || tc.category === selectedCategory;
      const matchesPriority = selectedPriority === 'all' || tc.priority === selectedPriority;
      
      return matchesSearch && matchesScreen && matchesCategory && matchesPriority;
    });
  }, [searchQuery, selectedScreen, selectedCategory, selectedPriority]);

  // Test Stats
  const stats = useMemo(() => {
    const total = filteredTests.length;
    const byStatus = {
      pending: filteredTests.filter(tc => (testCaseStatuses[tc.id] || 'pending') === 'pending').length,
      passed: filteredTests.filter(tc => testCaseStatuses[tc.id] === 'passed').length,
      failed: filteredTests.filter(tc => testCaseStatuses[tc.id] === 'failed').length,
      blocked: filteredTests.filter(tc => testCaseStatuses[tc.id] === 'blocked').length,
    };
    return { total, ...byStatus };
  }, [filteredTests, testCaseStatuses]);

  // Issue Stats
  const issueStats = useMemo(() => {
    const total = issues.length;
    const open = issues.filter(i => i.status === 'open').length;
    const inProgress = issues.filter(i => i.status === 'in-progress').length;
    const resolved = issues.filter(i => i.status === 'resolved').length;
    const critical = issues.filter(i => i.severity === 'critical').length;
    return { total, open, inProgress, resolved, critical };
  }, [issues]);

  const updateTestStatus = (testId: string, status: TestStatus) => {
    setTestCaseStatuses(prev => ({
      ...prev,
      [testId]: status,
    }));
  };

  const toggleCardExpansion = (testId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(testId)) {
        newSet.delete(testId);
      } else {
        newSet.add(testId);
      }
      return newSet;
    });
  };

  // Issue Handlers
  const handleIssueSubmit = async (issue: Issue) => {
    try {
      if (editingIssue) {
        // Update existing issue
        const response = await fetch(`/api/issues/${issue.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(issue),
        });
        if (response.ok) {
          const data = await response.json();
          setIssues(prev => prev.map(i => i.id === issue.id ? data.issue : i));
        }
      } else {
        // Create new issue
        const response = await fetch('/api/issues', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(issue),
        });
        if (response.ok) {
          const data = await response.json();
          setIssues(prev => [data.issue, ...prev]);
        }
      }
    } catch (error) {
      console.error('Failed to save issue:', error);
    }
    setShowIssueForm(false);
    setEditingIssue(null);
  };

  const handleIssueEdit = (issue: Issue) => {
    setEditingIssue(issue);
    setShowIssueForm(true);
  };

  const handleIssueDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this issue?')) {
      try {
        const response = await fetch(`/api/issues/${id}`, { method: 'DELETE' });
        if (response.ok) {
          setIssues(prev => prev.filter(i => i.id !== id));
        }
      } catch (error) {
        console.error('Failed to delete issue:', error);
      }
    }
  };

  // Export Functions
  const exportTestCasesToMarkdown = () => {
    let md = `# QieWallet App - QA Test Cases Report\n\n`;
    md += `Generated: ${new Date().toLocaleDateString()}\n\n`;
    md += `## Summary\n\n`;
    md += `- **Total Test Cases:** ${TEST_SUMMARY.totalTests}\n\n`;
    md += `### By Screen\n`;
    Object.entries(TEST_SUMMARY.byScreen).forEach(([screen, count]) => {
      md += `- ${screen}: ${count}\n`;
    });
    md += `\n### By Category\n`;
    Object.entries(TEST_SUMMARY.byCategory).forEach(([cat, count]) => {
      md += `- ${CATEGORIES[cat as TestCategory].label}: ${count}\n`;
    });
    md += `\n---\n\n`;

    Object.values(SCREENS).forEach(screen => {
      const screenTests = testCases.filter(tc => tc.screen === screen);
      if (screenTests.length > 0) {
        md += `## ${screen}\n\n`;
        screenTests.forEach(tc => {
          const status = testCaseStatuses[tc.id] || 'pending';
          md += `### ${tc.id}: ${tc.title}\n`;
          md += `**Status:** ${status.toUpperCase()}\n`;
          md += `**Priority:** ${PRIORITIES[tc.priority].label}\n`;
          md += `**Category:** ${CATEGORIES[tc.category].label}\n\n`;
          md += `**Description:** ${tc.description}\n\n`;
          md += `**Pre-conditions:**\n`;
          tc.preConditions.forEach(pc => md += `- ${pc}\n`);
          md += `\n**Steps:**\n`;
          tc.steps.forEach((step, i) => md += `${i + 1}. ${step}\n`);
          md += `\n**Expected Result:** ${tc.expectedResult}\n\n`;
          md += `---\n\n`;
        });
      }
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qiewallet-test-cases.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportTestCasesToCSV = () => {
    let csv = 'ID,Screen,Category,Priority,Title,Description,Pre-conditions,Steps,Expected Result,Status\n';
    testCases.forEach(tc => {
      const status = testCaseStatuses[tc.id] || 'pending';
      csv += `"${tc.id}","${tc.screen}","${CATEGORIES[tc.category].label}","${PRIORITIES[tc.priority].label}","${tc.title}","${tc.description}","${tc.preConditions.join('; ')}","${tc.steps.join('; ')}","${tc.expectedResult}","${status}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qiewallet-test-cases.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportIssuesToCSV = () => {
    let csv = 'ID,Title,Type,Severity,Status,Screen,Description,Steps to Reproduce,Expected Behavior,Actual Behavior,Environment,Device,OS Version,App Version,Reported By,Assigned To,Notes,Created At,Updated At,Screenshot Count,Screenshot Files\n';
    
    issues.forEach(issue => {
      const screenshotNames = issue.screenshots.map(s => s.name).join('; ');
      csv += `"${issue.id}","${issue.title}","${ISSUE_TYPES[issue.type].label}","${ISSUE_SEVERITY[issue.severity].label}","${ISSUE_STATUS[issue.status].label}","${issue.screen}","${issue.description.replace(/"/g, '""')}","${issue.stepsToReproduce.filter(s => s).join('; ')}","${issue.expectedBehavior}","${issue.actualBehavior}","${issue.environment}","${issue.device}","${issue.osVersion}","${issue.appVersion}","${issue.reportedBy}","${issue.assignedTo}","${issue.notes}","${issue.createdAt}","${issue.updatedAt}","${issue.screenshots.length}","${screenshotNames}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qiewallet-issues.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportIssuesToHTML = () => {
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QieWallet Issues Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; background: #f8fafc; }
    h1 { color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
    h2 { color: #334155; margin-top: 30px; }
    .issue { background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
    .issue-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
    .issue-title { font-size: 18px; font-weight: 600; color: #1e293b; margin: 0; }
    .issue-id { font-family: monospace; font-size: 12px; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 4px; }
    .badges { display: flex; gap: 8px; margin: 10px 0; flex-wrap: wrap; }
    .badge { padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 500; }
    .badge-critical { background: #fee2e2; color: #dc2626; }
    .badge-high { background: #ffedd5; color: #ea580c; }
    .badge-medium { background: #fef9c3; color: #ca8a04; }
    .badge-low { background: #f1f5f9; color: #475569; }
    .badge-open { background: #fee2e2; color: #dc2626; }
    .badge-in-progress { background: #dbeafe; color: #2563eb; }
    .badge-resolved { background: #dcfce7; color: #16a34a; }
    .badge-closed { background: #f1f5f9; color: #64748b; }
    .badge-wont-fix { background: #f3e8ff; color: #9333ea; }
    .meta { color: #64748b; font-size: 13px; margin: 10px 0; }
    .meta span { margin-right: 15px; }
    .section { margin: 15px 0; }
    .section-title { font-weight: 600; color: #475569; margin-bottom: 8px; font-size: 14px; }
    .steps { list-style: decimal; padding-left: 20px; margin: 0; }
    .steps li { color: #334155; margin: 5px 0; }
    .screenshots { display: flex; gap: 15px; flex-wrap: wrap; margin-top: 15px; }
    .screenshot { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    .screenshot img { max-width: 300px; height: auto; display: block; }
    .screenshot-info { padding: 8px; background: #f8fafc; font-size: 12px; color: #64748b; }
    .description { color: #334155; line-height: 1.6; }
    .behavior-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 15px 0; }
    .behavior-box { padding: 15px; border-radius: 8px; }
    .expected { background: #f0fdf4; border: 1px solid #bbf7d0; }
    .actual { background: #fef2f2; border: 1px solid #fecaca; }
    .behavior-title { font-weight: 600; margin-bottom: 8px; }
    .summary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 12px; margin-bottom: 30px; }
    .summary h2 { margin: 0 0 15px 0; color: white; }
    .summary-stats { display: flex; gap: 30px; flex-wrap: wrap; }
    .stat { text-align: center; }
    .stat-value { font-size: 32px; font-weight: 700; }
    .stat-label { font-size: 14px; opacity: 0.9; }
    @media print { body { background: white; } .issue { break-inside: avoid; } }
  </style>
</head>
<body>
  <h1>🐛 QieWallet Issues Report</h1>
  <p style="color: #64748b;">Generated: ${new Date().toLocaleString()}</p>
  
  <div class="summary">
    <h2>Summary</h2>
    <div class="summary-stats">
      <div class="stat"><div class="stat-value">${issues.length}</div><div class="stat-label">Total Issues</div></div>
      <div class="stat"><div class="stat-value">${issueStats.open}</div><div class="stat-label">Open</div></div>
      <div class="stat"><div class="stat-value">${issueStats.inProgress}</div><div class="stat-label">In Progress</div></div>
      <div class="stat"><div class="stat-value">${issueStats.resolved}</div><div class="stat-label">Resolved</div></div>
      <div class="stat"><div class="stat-value">${issueStats.critical}</div><div class="stat-label">Critical</div></div>
    </div>
  </div>
  
  <h2>Issues (${issues.length})</h2>
  
  ${issues.map(issue => `
    <div class="issue">
      <div class="issue-header">
        <div>
          <span class="issue-id">${issue.id}</span>
          <h3 class="issue-title">${issue.title}</h3>
        </div>
      </div>
      
      <div class="badges">
        <span class="badge badge-${issue.severity}">${ISSUE_SEVERITY[issue.severity].label}</span>
        <span class="badge badge-${issue.status}">${ISSUE_STATUS[issue.status].label}</span>
        <span class="badge" style="background: #f1f5f9;">${ISSUE_TYPES[issue.type].icon} ${ISSUE_TYPES[issue.type].label}</span>
        <span class="badge" style="background: #e0e7ff; color: #4338ca;">${issue.screen}</span>
      </div>
      
      ${issue.description ? `<p class="description">${issue.description}</p>` : ''}
      
      ${issue.stepsToReproduce.filter(s => s).length > 0 ? `
        <div class="section">
          <div class="section-title">Steps to Reproduce:</div>
          <ol class="steps">
            ${issue.stepsToReproduce.filter(s => s).map(step => `<li>${step}</li>`).join('')}
          </ol>
        </div>
      ` : ''}
      
      ${(issue.expectedBehavior || issue.actualBehavior) ? `
        <div class="behavior-grid">
          ${issue.expectedBehavior ? `
            <div class="behavior-box expected">
              <div class="behavior-title">✅ Expected Behavior</div>
              <div>${issue.expectedBehavior}</div>
            </div>
          ` : ''}
          ${issue.actualBehavior ? `
            <div class="behavior-box actual">
              <div class="behavior-title">❌ Actual Behavior</div>
              <div>${issue.actualBehavior}</div>
            </div>
          ` : ''}
        </div>
      ` : ''}
      
      ${issue.screenshots.length > 0 ? `
        <div class="section">
          <div class="section-title">📸 Screenshots (${issue.screenshots.length})</div>
          <div class="screenshots">
            ${issue.screenshots.map(ss => `
              <div class="screenshot">
                <img src="${ss.data}" alt="${ss.name}" />
                <div class="screenshot-info">${ss.name} (${(ss.size / 1024).toFixed(1)} KB)</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      <div class="meta">
        ${issue.environment ? `<span>🖥️ ${issue.environment}</span>` : ''}
        ${issue.device ? `<span>📱 ${issue.device}</span>` : ''}
        ${issue.osVersion ? `<span>💾 ${issue.osVersion}</span>` : ''}
        ${issue.appVersion ? `<span>📦 v${issue.appVersion}</span>` : ''}
      </div>
      
      <div class="meta">
        ${issue.reportedBy ? `<span>👤 Reported by: ${issue.reportedBy}</span>` : ''}
        ${issue.assignedTo ? `<span>👉 Assigned to: ${issue.assignedTo}</span>` : ''}
        <span>📅 Created: ${new Date(issue.createdAt).toLocaleString()}</span>
      </div>
      
      ${issue.notes ? `<div class="section"><div class="section-title">📝 Notes</div><div style="color: #64748b;">${issue.notes}</div></div>` : ''}
    </div>
  `).join('')}
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qiewallet-issues-with-screenshots.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSync = useCallback(async () => {
    await loadIssues();
  }, [loadIssues]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                QieWallet QA Report
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Test Cases & Issue Tracking Dashboard
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Mobile Reporter Link */}
              <a href="/mobile" target="_blank" className="hidden sm:flex">
                <Button variant="outline" size="sm" className="gap-2">
                  <Smartphone className="w-4 h-4" />
                  Mobile Reporter
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </a>
              {activeTab === 'issues' && (
                <Button variant="ghost" size="sm" onClick={handleSync} title="Sync from mobile">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              )}
              {activeTab === 'issues' && (
                <>
                  <Button variant="outline" size="sm" onClick={exportIssuesToCSV}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button variant="default" size="sm" onClick={exportIssuesToHTML} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <FileImage className="w-4 h-4 mr-2" />
                    Export HTML with Screenshots
                  </Button>
                </>
              )}
              {activeTab === 'testcases' && (
                <>
                  <Button variant="outline" size="sm" onClick={exportTestCasesToCSV}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button variant="default" size="sm" onClick={exportTestCasesToMarkdown} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <FileText className="w-4 h-4 mr-2" />
                    Export Markdown
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 flex-1">
        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-white/60 backdrop-blur-sm border border-slate-200 p-1">
            <TabsTrigger value="testcases" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
              <TestTube className="w-4 h-4 mr-2" />
              Test Cases ({testCases.length})
            </TabsTrigger>
            <TabsTrigger value="issues" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
              <AlertCircle className="w-4 h-4 mr-2" />
              Issues ({issues.length})
            </TabsTrigger>
          </TabsList>

          {/* Test Cases Tab */}
          <TabsContent value="testcases" className="space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="border-slate-200 bg-white/60 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-slate-700">{stats.total}</div>
                  <div className="text-sm text-slate-500">Total Tests</div>
                </CardContent>
              </Card>
              <Card className="border-slate-200 bg-white/60 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
                  <div className="text-sm text-slate-500">Passed</div>
                </CardContent>
              </Card>
              <Card className="border-slate-200 bg-white/60 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                  <div className="text-sm text-slate-500">Failed</div>
                </CardContent>
              </Card>
              <Card className="border-slate-200 bg-white/60 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-yellow-600">{stats.blocked}</div>
                  <div className="text-sm text-slate-500">Blocked</div>
                </CardContent>
              </Card>
              <Card className="border-slate-200 bg-white/60 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-slate-600">{stats.pending}</div>
                  <div className="text-sm text-slate-500">Pending</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="border-slate-200 bg-white/60 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search test cases..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white border-slate-200"
                    />
                  </div>
                  <Select value={selectedScreen} onValueChange={setSelectedScreen}>
                    <SelectTrigger className="w-full md:w-[200px] bg-white border-slate-200">
                      <SelectValue placeholder="Filter by Screen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Screens</SelectItem>
                      {Object.values(SCREENS).map(screen => (
                        <SelectItem key={screen} value={screen}>{screen}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full md:w-[180px] bg-white border-slate-200">
                      <SelectValue placeholder="Filter by Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {Object.entries(CATEGORIES).map(([key, val]) => (
                        <SelectItem key={key} value={key}>{val.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                    <SelectTrigger className="w-full md:w-[150px] bg-white border-slate-200">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      {Object.entries(PRIORITIES).map(([key, val]) => (
                        <SelectItem key={key} value={key}>{val.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Test Cases List */}
            <ScrollArea className="max-h-[calc(100vh-400px)]">
              <div className="space-y-3 pr-4">
                {filteredTests.map(tc => {
                  const status = testCaseStatuses[tc.id] || 'pending';
                  const isExpanded = expandedCards.has(tc.id);
                  
                  return (
                    <Card key={tc.id} className="border-slate-200 bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
                      <CardHeader className="p-4 cursor-pointer" onClick={() => toggleCardExpansion(tc.id)}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <Badge variant="outline" className="font-mono text-xs shrink-0">
                              {tc.id}
                            </Badge>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base font-medium text-slate-800 truncate">
                                {tc.title}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <Badge className={`${PRIORITIES[tc.priority].color} text-white text-xs`}>
                                  {PRIORITIES[tc.priority].label}
                                </Badge>
                                <Badge variant="outline" className="text-xs flex items-center gap-1">
                                  {CATEGORY_ICONS[tc.category]}
                                  {CATEGORIES[tc.category].label}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {tc.screen}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Select value={status} onValueChange={(val) => updateTestStatus(tc.id, val as TestStatus)}>
                              <SelectTrigger className={`w-[100px] ${STATUS_CONFIG[status].color}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                  <SelectItem key={key} value={key}>
                                    <div className="flex items-center gap-2">
                                      {config.icon}
                                      {config.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                          </div>
                        </div>
                      </CardHeader>
                      
                      {isExpanded && (
                        <CardContent className="px-4 pb-4 pt-0">
                          <Separator className="mb-4" />
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-medium text-slate-700 mb-1">Description</h4>
                              <p className="text-sm text-slate-600">{tc.description}</p>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-slate-700 mb-2">Pre-conditions</h4>
                              <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                {tc.preConditions.map((pc, i) => (
                                  <li key={i}>{pc}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-slate-700 mb-2">Test Steps</h4>
                              <ol className="list-decimal list-inside text-sm text-slate-600 space-y-1">
                                {tc.steps.map((step, i) => (
                                  <li key={i}>{step}</li>
                                ))}
                              </ol>
                            </div>
                            
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <h4 className="text-sm font-medium text-green-800 mb-1 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                Expected Result
                              </h4>
                              <p className="text-sm text-green-700">{tc.expectedResult}</p>
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Issues Tab */}
          <TabsContent value="issues" className="space-y-4">
            {/* Issue Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="border-slate-200 bg-white/60 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-slate-700">{issueStats.total}</div>
                  <div className="text-sm text-slate-500">Total Issues</div>
                </CardContent>
              </Card>
              <Card className="border-slate-200 bg-white/60 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-600">{issueStats.open}</div>
                  <div className="text-sm text-slate-500">Open</div>
                </CardContent>
              </Card>
              <Card className="border-slate-200 bg-white/60 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{issueStats.inProgress}</div>
                  <div className="text-sm text-slate-500">In Progress</div>
                </CardContent>
              </Card>
              <Card className="border-slate-200 bg-white/60 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">{issueStats.resolved}</div>
                  <div className="text-sm text-slate-500">Resolved</div>
                </CardContent>
              </Card>
              <Card className="border-slate-200 bg-white/60 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-orange-600">{issueStats.critical}</div>
                  <div className="text-sm text-slate-500">Critical</div>
                </CardContent>
              </Card>
            </div>

            {/* Add Issue Button */}
            <div className="flex justify-end">
              <Button onClick={() => { setEditingIssue(null); setShowIssueForm(true); }} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                <Plus className="w-4 h-4 mr-2" />
                Report New Issue
              </Button>
            </div>

            {/* Issue Form Dialog */}
            <Dialog open={showIssueForm} onOpenChange={setShowIssueForm}>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
                <IssueForm
                  onSubmit={handleIssueSubmit}
                  onCancel={() => { setShowIssueForm(false); setEditingIssue(null); }}
                  initialData={editingIssue || undefined}
                />
              </DialogContent>
            </Dialog>

            {/* Issues List */}
            <IssueList
              issues={issues}
              onEdit={handleIssueEdit}
              onDelete={handleIssueDelete}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white/60 backdrop-blur-sm py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
          QieWallet QA Report - Test Cases & Issue Tracking
        </div>
      </footer>
    </div>
  );
}
