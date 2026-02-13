'use client';

import { useState, useRef } from 'react';
import { 
  Issue, 
  IssueScreenshot, 
  ISSUE_SEVERITY, 
  ISSUE_STATUS, 
  ISSUE_TYPES, 
  SCREENS_LIST,
  createEmptyIssue,
  generateIssueId,
  type IssueSeverity,
  type IssueStatus,
  type IssueType
} from '@/data/issues';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Save, 
  FileImage,
  AlertCircle
} from 'lucide-react';

interface IssueFormProps {
  onSubmit: (issue: Issue) => void;
  onCancel: () => void;
  initialData?: Issue;
}

export function IssueForm({ onSubmit, onCancel, initialData }: IssueFormProps) {
  const [formData, setFormData] = useState<Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>>(
    initialData ? {
      title: initialData.title,
      description: initialData.description,
      severity: initialData.severity,
      status: initialData.status,
      type: initialData.type,
      screen: initialData.screen,
      stepsToReproduce: initialData.stepsToReproduce,
      expectedBehavior: initialData.expectedBehavior,
      actualBehavior: initialData.actualBehavior,
      screenshots: initialData.screenshots,
      environment: initialData.environment,
      device: initialData.device,
      osVersion: initialData.osVersion,
      appVersion: initialData.appVersion,
      reportedBy: initialData.reportedBy,
      assignedTo: initialData.assignedTo,
      notes: initialData.notes,
    } : createEmptyIssue()
  );
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;
    
    const newScreenshots: IssueScreenshot[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      
      // Limit file size to 5MB
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 5MB.`);
        continue;
      }
      
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      
      newScreenshots.push({
        id: `ss-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        data: base64,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      });
    }
    
    setFormData(prev => ({
      ...prev,
      screenshots: [...prev.screenshots, ...newScreenshots],
    }));
  };

  const removeScreenshot = (id: string) => {
    setFormData(prev => ({
      ...prev,
      screenshots: prev.screenshots.filter(s => s.id !== id),
    }));
  };

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      stepsToReproduce: [...prev.stepsToReproduce, ''],
    }));
  };

  const updateStep = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      stepsToReproduce: prev.stepsToReproduce.map((s, i) => i === index ? value : s),
    }));
  };

  const removeStep = (index: number) => {
    if (formData.stepsToReproduce.length > 1) {
      setFormData(prev => ({
        ...prev,
        stepsToReproduce: prev.stepsToReproduce.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      alert('Please enter a title for the issue');
      return;
    }

    const now = new Date().toISOString();
    const issue: Issue = {
      ...formData,
      id: initialData?.id || generateIssueId(),
      createdAt: initialData?.createdAt || now,
      updatedAt: now,
    };
    
    onSubmit(issue);
  };

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-slate-200">
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          {initialData ? 'Edit Issue' : 'Report New Issue'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="title">Issue Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Brief description of the issue"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label>Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(val) => setFormData(prev => ({ ...prev, type: val as IssueType }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ISSUE_TYPES).map(([key, val]) => (
                  <SelectItem key={key} value={key}>
                    {val.icon} {val.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Screen/Component</Label>
            <Select 
              value={formData.screen} 
              onValueChange={(val) => setFormData(prev => ({ ...prev, screen: val }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCREENS_LIST.map(screen => (
                  <SelectItem key={screen} value={screen}>{screen}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Severity</Label>
            <Select 
              value={formData.severity} 
              onValueChange={(val) => setFormData(prev => ({ ...prev, severity: val as IssueSeverity }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ISSUE_SEVERITY).map(([key, val]) => (
                  <SelectItem key={key} value={key}>
                    <span className={val.color}>{val.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(val) => setFormData(prev => ({ ...prev, status: val as IssueStatus }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ISSUE_STATUS).map(([key, val]) => (
                  <SelectItem key={key} value={key}>
                    {val.icon} {val.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Detailed description of the issue..."
            className="mt-1 min-h-[80px]"
          />
        </div>

        <Separator />

        {/* Steps to Reproduce */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Steps to Reproduce</Label>
            <Button variant="outline" size="sm" onClick={addStep}>
              <Plus className="w-4 h-4 mr-1" /> Add Step
            </Button>
          </div>
          <div className="space-y-2">
            {formData.stepsToReproduce.map((step, index) => (
              <div key={index} className="flex items-start gap-2">
                <Badge variant="outline" className="mt-2 shrink-0">{index + 1}</Badge>
                <Input
                  value={step}
                  onChange={(e) => updateStep(index, e.target.value)}
                  placeholder={`Step ${index + 1}...`}
                  className="flex-1"
                />
                {formData.stepsToReproduce.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeStep(index)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
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
              onChange={(e) => setFormData(prev => ({ ...prev, expectedBehavior: e.target.value }))}
              placeholder="What should happen..."
              className="mt-1 min-h-[80px]"
            />
          </div>
          <div>
            <Label>Actual Behavior</Label>
            <Textarea
              value={formData.actualBehavior}
              onChange={(e) => setFormData(prev => ({ ...prev, actualBehavior: e.target.value }))}
              placeholder="What actually happened..."
              className="mt-1 min-h-[80px]"
            />
          </div>
        </div>

        <Separator />

        {/* Screenshot Upload */}
        <div>
          <Label>Screenshots</Label>
          <div
            className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
              dragOver ? 'border-purple-500 bg-purple-50' : 'border-slate-300 hover:border-slate-400'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFileUpload(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
            <Upload className="w-10 h-10 mx-auto text-slate-400 mb-2" />
            <p className="text-sm text-slate-600">
              Drag & drop screenshots here, or click to browse
            </p>
            <p className="text-xs text-slate-400 mt-1">
              PNG, JPG, GIF up to 5MB each
            </p>
          </div>

          {/* Screenshot Previews */}
          {formData.screenshots.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {formData.screenshots.map(screenshot => (
                <div key={screenshot.id} className="relative group">
                  <div className="aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                    <img
                      src={screenshot.data}
                      alt={screenshot.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeScreenshot(screenshot.id); }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <p className="text-xs text-slate-500 mt-1 truncate">{screenshot.name}</p>
                  <p className="text-xs text-slate-400">
                    {(screenshot.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Environment Details */}
        <div>
          <Label className="text-base">Environment Details</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
            <div>
              <Label className="text-sm text-slate-500">Environment</Label>
              <Input
                value={formData.environment}
                onChange={(e) => setFormData(prev => ({ ...prev, environment: e.target.value }))}
                placeholder="e.g., Production, Staging"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm text-slate-500">Device</Label>
              <Input
                value={formData.device}
                onChange={(e) => setFormData(prev => ({ ...prev, device: e.target.value }))}
                placeholder="e.g., iPhone 14, Samsung S23"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm text-slate-500">OS Version</Label>
              <Input
                value={formData.osVersion}
                onChange={(e) => setFormData(prev => ({ ...prev, osVersion: e.target.value }))}
                placeholder="e.g., iOS 17.1, Android 14"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm text-slate-500">App Version</Label>
              <Input
                value={formData.appVersion}
                onChange={(e) => setFormData(prev => ({ ...prev, appVersion: e.target.value }))}
                placeholder="e.g., 1.2.3"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm text-slate-500">Reported By</Label>
            <Input
              value={formData.reportedBy}
              onChange={(e) => setFormData(prev => ({ ...prev, reportedBy: e.target.value }))}
              placeholder="Your name"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm text-slate-500">Assigned To</Label>
            <Input
              value={formData.assignedTo}
              onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
              placeholder="Developer name"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label>Additional Notes</Label>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Any additional context, links, or notes..."
            className="mt-1"
          />
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
          >
            <Save className="w-4 h-4 mr-2" />
            {initialData ? 'Update Issue' : 'Save Issue'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
