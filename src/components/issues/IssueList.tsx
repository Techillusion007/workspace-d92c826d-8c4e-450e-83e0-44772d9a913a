'use client';

import { useState } from 'react';
import { 
  type Issue, 
  SEVERITY_CONFIG, 
  STATUS_CONFIG, 
  PRIORITY_CONFIG 
} from '@/data/issues';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  ChevronDown, 
  ChevronUp, 
  Edit, 
  Trash2, 
  MoreVertical, 
  Image as ImageIcon,
  Calendar,
  User,
  Bug,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface IssueListProps {
  issues: Issue[];
  onEdit: (issue: Issue) => void;
  onDelete: (issueId: string) => void;
  onUpdateStatus: (issueId: string, status: Issue['status']) => void;
}

export function IssueList({ issues, onEdit, onDelete, onUpdateStatus }: IssueListProps) {
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const toggleExpand = (issueId: string) => {
    setExpandedIssues(prev => {
      const newSet = new Set(prev);
      if (newSet.has(issueId)) {
        newSet.delete(issueId);
      } else {
        newSet.add(issueId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (issues.length === 0) {
    return (
      <Card className="border-slate-200 bg-white/60 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <Bug className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">No issues reported yet</p>
          <p className="text-sm text-slate-400 mt-1">Click "Report Issue" to add a new bug report</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {issues.map(issue => {
          const isExpanded = expandedIssues.has(issue.id);
          const severityConfig = SEVERITY_CONFIG[issue.severity];
          const statusConfig = STATUS_CONFIG[issue.status];
          const priorityConfig = PRIORITY_CONFIG[issue.priority];

          return (
            <Card key={issue.id} className="border-slate-200 bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
              <CardHeader className="p-4 cursor-pointer" onClick={() => toggleExpand(issue.id)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                      issue.status === 'open' ? 'bg-blue-500' :
                      issue.status === 'in-progress' ? 'bg-purple-500' :
                      issue.status === 'resolved' ? 'bg-green-500' :
                      'bg-gray-400'
                    }`} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="font-mono text-xs shrink-0">
                          {issue.id}
                        </Badge>
                        <Badge className={`${severityConfig.bgColor} ${severityConfig.color} text-xs`}>
                          {severityConfig.label}
                        </Badge>
                        <Badge className={`${priorityConfig.bgColor} ${priorityConfig.color} text-xs`}>
                          {priorityConfig.label}
                        </Badge>
                        {issue.screenshots.length > 0 && (
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            {issue.screenshots.length}
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="font-medium text-slate-800 mt-2 truncate">
                        {issue.title}
                      </h3>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Bug className="w-3 h-3" />
                          {issue.screen}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(issue.createdAt)}
                        </span>
                        {issue.reportedBy && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {issue.reportedBy}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <Select 
                      value={issue.status} 
                      onValueChange={(v) => onUpdateStatus(issue.id, v as Issue['status'])}
                    >
                      <SelectTrigger className={`w-[120px] ${statusConfig.bgColor} ${statusConfig.color}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent onClick={(e) => e.stopPropagation()}>
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>{config.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(issue)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Issue
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => setDeleteConfirm(issue.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Issue
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="px-4 pb-4 pt-0">
                  <Separator className="mb-4" />
                  
                  {issue.description && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-slate-700 mb-1">Description</h4>
                      <p className="text-sm text-slate-600">{issue.description}</p>
                    </div>
                  )}

                  {issue.stepsToReproduce.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-slate-700 mb-2">Steps to Reproduce</h4>
                      <ol className="list-decimal list-inside text-sm text-slate-600 space-y-1">
                        {issue.stepsToReproduce.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {issue.expectedBehavior && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <h4 className="text-sm font-medium text-green-800 mb-1 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Expected Behavior
                        </h4>
                        <p className="text-sm text-green-700">{issue.expectedBehavior}</p>
                      </div>
                    )}
                    
                    {issue.actualBehavior && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <h4 className="text-sm font-medium text-red-800 mb-1 flex items-center gap-2">
                          <XCircle className="w-4 h-4" />
                          Actual Behavior
                        </h4>
                        <p className="text-sm text-red-700">{issue.actualBehavior}</p>
                      </div>
                    )}
                  </div>

                  {/* Screenshots */}
                  {issue.screenshots.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-slate-700 mb-2">Screenshots ({issue.screenshots.length})</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {issue.screenshots.map(screenshot => (
                          <div 
                            key={screenshot.id}
                            className="aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setPreviewImage(screenshot.dataUrl)}
                          >
                            <img
                              src={screenshot.dataUrl}
                              alt={screenshot.fileName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {issue.environment && (
                      <div>
                        <span className="text-slate-500">Environment:</span>
                        <p className="font-medium text-slate-700">{issue.environment}</p>
                      </div>
                    )}
                    {issue.device && (
                      <div>
                        <span className="text-slate-500">Device:</span>
                        <p className="font-medium text-slate-700">{issue.device}</p>
                      </div>
                    )}
                    {issue.osVersion && (
                      <div>
                        <span className="text-slate-500">OS Version:</span>
                        <p className="font-medium text-slate-700">{issue.osVersion}</p>
                      </div>
                    )}
                    {issue.appVersion && (
                      <div>
                        <span className="text-slate-500">App Version:</span>
                        <p className="font-medium text-slate-700">{issue.appVersion}</p>
                      </div>
                    )}
                  </div>

                  {issue.notes && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-yellow-800 mb-1 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Notes
                      </h4>
                      <p className="text-sm text-yellow-700">{issue.notes}</p>
                    </div>
                  )}

                  {issue.assignedTo && (
                    <div className="mt-4 text-sm text-slate-500">
                      Assigned to: <span className="font-medium text-slate-700">{issue.assignedTo}</span>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Screenshot Preview</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="rounded-lg overflow-hidden">
              <img src={previewImage} alt="Preview" className="w-full h-auto" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Issue</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this issue? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                if (deleteConfirm) {
                  onDelete(deleteConfirm);
                  setDeleteConfirm(null);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
