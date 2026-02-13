'use client';

import { useState, useRef } from 'react';
import { 
  type Issue, 
  type IssueSeverity, 
  type IssueStatus, 
  type IssuePriority, 
  type IssueScreenshot,
  ISSUE_SCREENS, 
  SEVERITY_CONFIG, 
  STATUS_CONFIG, 
  PRIORITY_CONFIG,
  generateIssueId,
  createEmptyIssue
} from '@/data/issues';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  X, 
  ChevronDown, 
  ChevronUp,
  Save,
  RotateCcw
} from 'lucide-react';

interface IssueFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (issue: Issue) => void;
  editingIssue?: Issue | null;
}

export function IssueForm({ isOpen, onClose, onSave, editingIssue }: IssueFormProps) {
  const [formData, setFormData] = useState<Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>>(
    editingIssue ? {
      title: editingIssue.title,
      description: editingIssue.description,
      screen: editingIssue.screen,
      severity: editingIssue.severity,
      priority: editingIssue.priority,
      status: editingIssue.status,
      stepsToReproduce: editingIssue.stepsToReproduce,
      expectedBehavior: editingIssue.expectedBehavior,
      actualBehavior: editingIssue.actualBehavior,
      screenshots: editingIssue.screenshots,
      environment: editingIssue.environment,
      device: editingIssue.device,
      osVersion: editingIssue.osVersion,
      appVersion: editingIssue.appVersion,
      reportedBy: editingIssue.reportedBy,
      assignedTo: editingIssue.assignedTo,
      notes: editingIssue.notes,
    } : createEmptyIssue()
  );
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStepChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      stepsToReproduce: prev.stepsToReproduce.map((step, i) => 
        i === index ? value : step
      ),
    }));
  };

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      stepsToReproduce: [...prev.stepsToReproduce, ''],
    }));
  };

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      stepsToReproduce: prev.stepsToReproduce.filter((_, i) => i !== index),
    }));
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const screenshot: IssueScreenshot = {
          id: `ss-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          fileName: file.name,
          dataUrl,
          uploadedAt: new Date().toISOString(),
        };
        setFormData(prev => ({
          ...prev,
          screenshots: [...prev.screenshots, screenshot],
        }));
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeScreenshot = (screenshotId: string) => {
    setFormData(prev => ({
      ...prev,
      screenshots: prev.screenshots.filter(s => s.id !== screenshotId),
    }));
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) return;

    const now = new Date().toISOString();
    const issue: Issue = {
      ...formData,
      id: editingIssue?.id || generateIssueId(),
      createdAt: editingIssue?.createdAt || now,
      updatedAt: now,
      stepsToReproduce: formData.stepsToReproduce.filter(s => s.trim()),
    };

    onSave(issue);
    handleClose();
  };

  const handleClose = () => {
    setFormData(createEmptyIssue());
    setShowAdvanced(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {editingIssue ? 'Edit Issue' : 'Report New Issue'}
            <Badge variant="outline" className="font-mono">
              {editingIssue?.id || generateIssueId()}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to report a bug or issue
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="required">Issue Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Brief description of the issue"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Detailed description of the issue..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Screen/Module</Label>
                <Select value={formData.screen} onValueChange={(v) => handleInputChange('screen', v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ISSUE_SCREENS.map(screen => (
                      <SelectItem key={screen} value={screen}>{screen}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Severity</Label>
                <Select 
                  value={formData.severity} 
                  onValueChange={(v) => handleInputChange('severity', v as IssueSeverity)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SEVERITY_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(v) => handleInputChange('priority', v as IssuePriority)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(v) => handleInputChange('status', v as IssueStatus)}
              >
                <SelectTrigger className="mt-1 w-full md:w-1/3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Steps to Reproduce */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Steps to Reproduce</Label>
              <Button variant="outline" size="sm" onClick={addStep}>
                <Plus className="w-4 h-4 mr-1" />
                Add Step
              </Button>
            </div>
            <div className="space-y-2">
              {formData.stepsToReproduce.map((step, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-sm font-medium text-slate-500 mt-2 w-6">{index + 1}.</span>
                  <Input
                    value={step}
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    placeholder={`Step ${index + 1}`}
                    className="flex-1"
                  />
                  {formData.stepsToReproduce.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeStep(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Expected Behavior</Label>
              <Textarea
                value={formData.expectedBehavior}
                onChange={(e) => handleInputChange('expectedBehavior', e.target.value)}
                placeholder="What should happen?"
                rows={2}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Actual Behavior</Label>
              <Textarea
                value={formData.actualBehavior}
                onChange={(e) => handleInputChange('actualBehavior', e.target.value)}
                placeholder="What actually happened?"
                rows={2}
                className="mt-1"
              />
            </div>
          </div>

          <Separator />

          {/* Screenshot Upload */}
          <div>
            <Label>Screenshots</Label>
            <div className="mt-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleScreenshotUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-dashed border-2 h-24"
              >
                <Upload className="w-5 h-5 mr-2" />
                Click to upload screenshots
              </Button>
            </div>
            
            {formData.screenshots.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                {formData.screenshots.map(screenshot => (
                  <div key={screenshot.id} className="relative group">
                    <div 
                      className="aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer"
                      onClick={() => setPreviewImage(screenshot.dataUrl)}
                    >
                      <img
                        src={screenshot.dataUrl}
                        alt={screenshot.fileName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeScreenshot(screenshot.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    <p className="text-xs text-slate-500 mt-1 truncate">{screenshot.fileName}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Advanced Options */}
          <div>
            <Button
              variant="ghost"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full justify-between"
            >
              <span>Advanced Options</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            
            {showAdvanced && (
              <div className="mt-4 space-y-4 p-4 bg-slate-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Environment</Label>
                    <Input
                      value={formData.environment}
                      onChange={(e) => handleInputChange('environment', e.target.value)}
                      placeholder="Production / Staging / Dev"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Device</Label>
                    <Input
                      value={formData.device}
                      onChange={(e) => handleInputChange('device', e.target.value)}
                      placeholder="iPhone 14 / Samsung S23"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>OS Version</Label>
                    <Input
                      value={formData.osVersion}
                      onChange={(e) => handleInputChange('osVersion', e.target.value)}
                      placeholder="iOS 17.1 / Android 14"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>App Version</Label>
                    <Input
                      value={formData.appVersion}
                      onChange={(e) => handleInputChange('appVersion', e.target.value)}
                      placeholder="v1.0.0"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Reported By</Label>
                    <Input
                      value={formData.reportedBy}
                      onChange={(e) => handleInputChange('reportedBy', e.target.value)}
                      placeholder="Your name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Assigned To</Label>
                    <Input
                      value={formData.assignedTo}
                      onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                      placeholder="Developer name"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Additional notes..."
                    rows={2}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!formData.title.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {editingIssue ? 'Update Issue' : 'Create Issue'}
          </Button>
        </DialogFooter>
      </DialogContent>

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
    </Dialog>
  );
}
