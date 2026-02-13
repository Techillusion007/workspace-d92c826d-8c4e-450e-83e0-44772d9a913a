// QieWallet App - Issue Tracking Types

export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IssueStatus = 'open' | 'in-progress' | 'resolved' | 'closed' | 'wont-fix';
export type IssueType = 'bug' | 'enhancement' | 'feature-request' | 'documentation';

export interface IssueScreenshot {
  id: string;
  name: string;
  data: string; // base64 data
  type: string; // mime type
  size: number;
  uploadedAt: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  severity: IssueSeverity;
  status: IssueStatus;
  type: IssueType;
  screen: string;
  stepsToReproduce: string[];
  expectedBehavior: string;
  actualBehavior: string;
  screenshots: IssueScreenshot[];
  environment: string;
  device: string;
  osVersion: string;
  appVersion: string;
  reportedBy: string;
  assignedTo: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export const ISSUE_SEVERITY: Record<IssueSeverity, { label: string; color: string; bgColor: string }> = {
  critical: { label: 'Critical', color: 'text-red-700', bgColor: 'bg-red-100 border-red-300' },
  high: { label: 'High', color: 'text-orange-700', bgColor: 'bg-orange-100 border-orange-300' },
  medium: { label: 'Medium', color: 'text-yellow-700', bgColor: 'bg-yellow-100 border-yellow-300' },
  low: { label: 'Low', color: 'text-slate-700', bgColor: 'bg-slate-100 border-slate-300' },
};

export const ISSUE_STATUS: Record<IssueStatus, { label: string; color: string; icon: string }> = {
  open: { label: 'Open', color: 'bg-red-500', icon: '🔴' },
  'in-progress': { label: 'In Progress', color: 'bg-blue-500', icon: '🔵' },
  resolved: { label: 'Resolved', color: 'bg-green-500', icon: '🟢' },
  closed: { label: 'Closed', color: 'bg-gray-500', icon: '⚫' },
  'wont-fix': { label: 'Won\'t Fix', color: 'bg-purple-500', icon: '🟣' },
};

export const ISSUE_TYPES: Record<IssueType, { label: string; icon: string }> = {
  bug: { label: 'Bug', icon: '🐛' },
  enhancement: { label: 'Enhancement', icon: '⬆️' },
  'feature-request': { label: 'Feature Request', icon: '✨' },
  documentation: { label: 'Documentation', icon: '📄' },
};

export const SCREENS_LIST = [
  'Swap Screen (Main)',
  'Token Selection Modal',
  'Chain Selection Modal',
  'Network Selection Modal',
  'Fixed/Floating Rate Modal',
  'Swap History Screen',
  'Wallet Home',
  'Settings',
  'Other',
] as const;

export function createEmptyIssue(): Omit<Issue, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    title: '',
    description: '',
    severity: 'medium',
    status: 'open',
    type: 'bug',
    screen: 'Swap Screen (Main)',
    stepsToReproduce: [''],
    expectedBehavior: '',
    actualBehavior: '',
    screenshots: [],
    environment: 'Production',
    device: '',
    osVersion: '',
    appVersion: '',
    reportedBy: '',
    assignedTo: '',
    notes: '',
  };
}

export function generateIssueId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `ISS-${timestamp}-${random}`;
}
