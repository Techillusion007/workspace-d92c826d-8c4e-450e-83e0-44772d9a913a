'use client';

import { useState } from 'react';
import { 
  Issue, 
  ISSUE_SEVERITY, 
  ISSUE_STATUS, 
  ISSUE_TYPES,
  type IssueSeverity,
  type IssueStatus,
  type IssueType
} from '@/data/issues';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Edit, 
  Trash2, 
  Image as ImageIcon, 
  Calendar,
  User,
  ChevronRight,
  Eye
} from 'lucide-react';

interface IssueListProps {
  issues: Issue[];
  onEdit: (issue: Issue) => void;
  onDelete: (id: string) => void;
}

export function IssueList({ issues, onEdit, onDelete }: IssueListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = searchQuery === '' ||
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = filterSeverity === 'all' || issue.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || issue.status === filterStatus;
    const matchesType = filterType === 'all' || issue.type === filterType;
    
    return matchesSearch && matchesSeverity && matchesStatus && matchesType;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="border-slate-200 bg-white/60 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-slate-200"
              />
            </div>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-full md:w-[140px] bg-white border-slate-200">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                {Object.entries(ISSUE_SEVERITY).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[140px] bg-white border-slate-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(ISSUE_STATUS).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val.icon} {val.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[150px] bg-white border-slate-200">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(ISSUE_TYPES).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val.icon} {val.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Issues List */}
      {filteredIssues.length === 0 ? (
        <Card className="border-slate-200 bg-white/60 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <ImageIcon className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">No issues found</p>
            <p className="text-sm text-slate-400 mt-1">Create a new issue to get started</p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="max-h-[calc(100vh-350px)]">
          <div className="space-y-3 pr-4">
            {filteredIssues.map(issue => (
              <Card key={issue.id} className="border-slate-200 bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="font-mono text-xs shrink-0">
                          {issue.id}
                        </Badge>
                        <span className="text-lg">{ISSUE_STATUS[issue.status].icon}</span>
                        <Badge className={`${ISSUE_SEVERITY[issue.severity].bgColor} ${ISSUE_SEVERITY[issue.severity].color} text-xs`}>
                          {ISSUE_SEVERITY[issue.severity].label}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {ISSUE_TYPES[issue.type].icon} {ISSUE_TYPES[issue.type].label}
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-medium text-slate-800">
                        {issue.title}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => onEdit(issue)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600" onClick={() => onDelete(issue.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  {issue.description && (
                    <p className="text-sm text-slate-600 mb-3">{issue.description}</p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(issue.createdAt)}
                    </span>
                    {issue.reportedBy && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Reported by: {issue.reportedBy}
                      </span>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {issue.screen}
                    </Badge>
                  </div>

                  {issue.screenshots.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Attachments:</span>
                      <div className="flex gap-2">
                        {issue.screenshots.slice(0, 4).map((ss, idx) => (
                          <button
                            key={ss.id}
                            onClick={() => setSelectedImage(ss.data)}
                            className="relative group"
                          >
                            <div className="w-12 h-12 rounded border border-slate-200 overflow-hidden bg-slate-100">
                              <img src={ss.data} alt={ss.name} className="w-full h-full object-cover" />
                            </div>
                            {idx === 3 && issue.screenshots.length > 4 && (
                              <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center text-white text-xs">
                                +{issue.screenshots.length - 4}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Image Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-4">
          <DialogHeader>
            <DialogTitle>Screenshot Preview</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="relative w-full h-full flex items-center justify-center bg-slate-100 rounded-lg overflow-hidden">
              <img src={selectedImage} alt="Screenshot" className="max-w-full max-h-[70vh] object-contain" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
