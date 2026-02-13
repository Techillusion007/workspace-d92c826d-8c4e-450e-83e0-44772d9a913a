'use client';

import { useState, useRef } from 'react';
import { 
  Issue, 
  IssueScreenshot, 
  ISSUE_SEVERITY, 
  ISSUE_STATUS, 
  ISSUE_TYPES, 
  SCREENS_LIST,
  type IssueSeverity,
  type IssueStatus,
  type IssueType
} from '@/data/issues';
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
  Camera, 
  ImagePlus, 
  X, 
  Plus, 
  Trash2, 
  Send, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function MobileIssueReporter() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<IssueSeverity>('medium');
  const [status, setStatus] = useState<IssueStatus>('open');
  const [type, setType] = useState<IssueType>('bug');
  const [screen, setScreen] = useState(SCREENS_LIST[0]);
  const [stepsToReproduce, setStepsToReproduce] = useState<string[]>(['']);
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [actualBehavior, setActualBehavior] = useState('');
  const [screenshots, setScreenshots] = useState<IssueScreenshot[]>([]);
  const [device, setDevice] = useState('');
  const [osVersion, setOsVersion] = useState('');
  const [appVersion, setAppVersion] = useState('');
  const [reportedBy, setReportedBy] = useState('');
  const [notes, setNotes] = useState('');
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;
    
    const newScreenshots: IssueScreenshot[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      
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
    
    setScreenshots(prev => [...prev, ...newScreenshots]);
  };

  const removeScreenshot = (id: string) => {
    setScreenshots(prev => prev.filter(s => s.id !== id));
  };

  const addStep = () => {
    setStepsToReproduce(prev => [...prev, '']);
  };

  const updateStep = (index: number, value: string) => {
    setStepsToReproduce(prev => prev.map((s, i) => i === index ? value : s));
  };

  const removeStep = (index: number) => {
    if (stepsToReproduce.length > 1) {
      setStepsToReproduce(prev => prev.filter((_, i) => i !== index));
    }
  };

  const generateIssueId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `ISS-${timestamp}-${random}`;
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('Please enter a title for the issue');
      return;
    }

    setIsSubmitting(true);

    const now = new Date().toISOString();
    const issue: Issue = {
      id: generateIssueId(),
      title,
      description,
      severity,
      status,
      type,
      screen,
      stepsToReproduce: stepsToReproduce.filter(s => s.trim()),
      expectedBehavior,
      actualBehavior,
      screenshots,
      environment: 'Production',
      device,
      osVersion,
      appVersion,
      reportedBy,
      assignedTo: '',
      notes,
      createdAt: now,
      updatedAt: now,
    };
    
    try {
      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(issue),
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          resetForm();
        }, 2000);
      } else {
        const error = await response.json();
        alert('Failed to save issue: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving issue:', error);
      alert('Failed to save issue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSeverity('medium');
    setStatus('open');
    setType('bug');
    setScreen(SCREENS_LIST[0]);
    setStepsToReproduce(['']);
    setExpectedBehavior('');
    setActualBehavior('');
    setScreenshots([]);
    setDevice('');
    setOsVersion('');
    setAppVersion('');
    setReportedBy('');
    setNotes('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                Issue Reporter
              </h1>
              <p className="text-xs text-slate-400">QieWallet Mobile Testing</p>
            </div>
            <Badge variant="outline" className="border-green-600 text-green-400 bg-green-950/30">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
              Online
            </Badge>
          </div>
        </div>
      </header>

      {/* Success Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm">
          <div className="text-center">
            <CheckCircle className="w-20 h-20 mx-auto text-green-400 mb-4 animate-bounce" />
            <h2 className="text-xl font-bold text-white mb-2">Issue Saved!</h2>
            <p className="text-slate-400">Synced to dashboard</p>
          </div>
        </div>
      )}

      <main className="px-4 py-4 pb-24">
        {/* Quick Actions - Screenshot Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button
            onClick={() => cameraInputRef.current?.click()}
            disabled={isSubmitting}
            className="h-20 bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl flex flex-col items-center justify-center gap-1 disabled:opacity-50"
          >
            <Camera className="w-8 h-8" />
            <span className="text-xs">Take Photo</span>
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isSubmitting}
            className="h-20 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl flex flex-col items-center justify-center gap-1 disabled:opacity-50"
          >
            <ImagePlus className="w-8 h-8" />
            <span className="text-xs">From Gallery</span>
          </Button>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
        </div>

        {/* Screenshot Previews */}
        {screenshots.length > 0 && (
          <div className="mb-6">
            <Label className="text-slate-300 text-sm mb-2 block">Screenshots ({screenshots.length})</Label>
            <div className="grid grid-cols-3 gap-2">
              {screenshots.map(ss => (
                <div key={ss.id} className="relative aspect-video rounded-lg overflow-hidden bg-slate-700">
                  <img src={ss.data} alt={ss.name} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeScreenshot(ss.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Title */}
        <div className="mb-4">
          <Label className="text-slate-300 text-sm">Issue Title *</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief description..."
            disabled={isSubmitting}
            className="mt-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-12"
          />
        </div>

        {/* Type & Severity Row */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <Label className="text-slate-300 text-sm">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as IssueType)} disabled={isSubmitting}>
              <SelectTrigger className="mt-1 bg-slate-800 border-slate-700 text-white h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ISSUE_TYPES).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val.icon} {val.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-slate-300 text-sm">Severity</Label>
            <Select value={severity} onValueChange={(v) => setSeverity(v as IssueSeverity)} disabled={isSubmitting}>
              <SelectTrigger className="mt-1 bg-slate-800 border-slate-700 text-white h-12">
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
        </div>

        {/* Screen */}
        <div className="mb-4">
          <Label className="text-slate-300 text-sm">Screen</Label>
          <Select value={screen} onValueChange={setScreen} disabled={isSubmitting}>
            <SelectTrigger className="mt-1 bg-slate-800 border-slate-700 text-white h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SCREENS_LIST.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="mb-4">
          <Label className="text-slate-300 text-sm">Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's the issue?"
            disabled={isSubmitting}
            className="mt-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 min-h-[80px]"
          />
        </div>

        <Separator className="bg-slate-700 my-4" />

        {/* Steps to Reproduce */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-slate-300 text-sm">Steps to Reproduce</Label>
            <Button variant="ghost" size="sm" onClick={addStep} disabled={isSubmitting} className="text-slate-400 h-8 w-8 p-0">
              <Plus className="w-5 h-5" />
            </Button>
          </div>
          <div className="space-y-2">
            {stepsToReproduce.map((step, index) => (
              <div key={index} className="flex items-center gap-2">
                <Badge variant="outline" className="shrink-0 border-slate-600 text-slate-400 w-7 h-7 flex items-center justify-center">
                  {index + 1}
                </Badge>
                <Input
                  value={step}
                  onChange={(e) => updateStep(index, e.target.value)}
                  placeholder={`Step ${index + 1}...`}
                  disabled={isSubmitting}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-12"
                />
                {stepsToReproduce.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => removeStep(index)} disabled={isSubmitting} className="text-red-400 h-12 w-12 p-0 shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Expected & Actual */}
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div>
            <Label className="text-green-400 text-sm">Expected Behavior</Label>
            <Textarea
              value={expectedBehavior}
              onChange={(e) => setExpectedBehavior(e.target.value)}
              placeholder="What should happen?"
              disabled={isSubmitting}
              className="mt-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 min-h-[70px]"
            />
          </div>
          <div>
            <Label className="text-red-400 text-sm">Actual Behavior</Label>
            <Textarea
              value={actualBehavior}
              onChange={(e) => setActualBehavior(e.target.value)}
              placeholder="What actually happened?"
              disabled={isSubmitting}
              className="mt-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 min-h-[70px]"
            />
          </div>
        </div>

        <Separator className="bg-slate-700 my-4" />

        {/* Environment Info */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <Label className="text-slate-300 text-sm">Device</Label>
            <Input
              value={device}
              onChange={(e) => setDevice(e.target.value)}
              placeholder="e.g., Samsung S23"
              disabled={isSubmitting}
              className="mt-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-12"
            />
          </div>
          <div>
            <Label className="text-slate-300 text-sm">Android Version</Label>
            <Input
              value={osVersion}
              onChange={(e) => setOsVersion(e.target.value)}
              placeholder="e.g., Android 14"
              disabled={isSubmitting}
              className="mt-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-12"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <Label className="text-slate-300 text-sm">App Version</Label>
            <Input
              value={appVersion}
              onChange={(e) => setAppVersion(e.target.value)}
              placeholder="e.g., 1.2.3"
              disabled={isSubmitting}
              className="mt-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-12"
            />
          </div>
          <div>
            <Label className="text-slate-300 text-sm">Reported By</Label>
            <Input
              value={reportedBy}
              onChange={(e) => setReportedBy(e.target.value)}
              placeholder="Your name"
              disabled={isSubmitting}
              className="mt-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-12"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <Label className="text-slate-300 text-sm">Additional Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any extra context..."
            disabled={isSubmitting}
            className="mt-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 min-h-[60px]"
          />
        </div>
      </main>

      {/* Fixed Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full h-14 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-lg font-semibold rounded-xl disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Save Issue
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
