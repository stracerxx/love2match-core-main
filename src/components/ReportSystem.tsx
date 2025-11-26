import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { useToast } from './ui/use-toast';
import { useAuth } from '../hooks/useAuth';

interface Report {
  id: string;
  reporter_email: string;
  reported_user_email?: string;
  reported_content_id?: string;
  reported_entity_type: 'user' | 'content' | 'message' | 'profile' | 'business' | 'event';
  report_type: 'spam' | 'harassment' | 'inappropriate' | 'fake_profile' | 'scam' | 'other';
  description: string;
  evidence_urls?: string[];
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

interface ReportSystemProps {
  initialReportType?: 'user' | 'content' | 'message' | 'profile' | 'business' | 'event';
  initialReportedId?: string;
  onReportSubmitted?: (report: Report) => void;
  showHistory?: boolean;
}

export const ReportSystem: React.FC<ReportSystemProps> = ({
  initialReportType = 'user',
  initialReportedId,
  onReportSubmitted,
  showHistory = true
}) => {
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [reportType, setReportType] = useState<'user' | 'content' | 'message' | 'profile' | 'business' | 'event'>(initialReportType);
  const [reportCategory, setReportCategory] = useState<'spam' | 'harassment' | 'inappropriate' | 'fake_profile' | 'scam' | 'other'>('spam');
  const [description, setDescription] = useState('');
  const [reportedId, setReportedId] = useState(initialReportedId || '');
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>(['']);
  const [submitting, setSubmitting] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const reportTypes = [
    { value: 'user', label: 'User', icon: '👤' },
    { value: 'content', label: 'Content', icon: '📱' },
    { value: 'message', label: 'Message', icon: '💬' },
    { value: 'profile', label: 'Profile', icon: '📝' },
    { value: 'business', label: 'Business', icon: '🏢' },
    { value: 'event', label: 'Event', icon: '🎉' }
  ];

  const reportCategories = [
    { value: 'spam', label: 'Spam', description: 'Unsolicited or repetitive messages' },
    { value: 'harassment', label: 'Harassment', description: 'Bullying, threats, or unwanted attention' },
    { value: 'inappropriate', label: 'Inappropriate Content', description: 'Offensive or explicit material' },
    { value: 'fake_profile', label: 'Fake Profile', description: 'Impersonation or fake identity' },
    { value: 'scam', label: 'Scam/Fraud', description: 'Financial scams or deceptive behavior' },
    { value: 'other', label: 'Other', description: 'Other issues not listed' }
  ];

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a description of the issue',
        variant: 'destructive'
      });
      return;
    }

    if (!reportedId.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide the ID of what you are reporting',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSubmitting(true);
      
      // Mock API call - replace with actual implementation
      const newReport: Report = {
        id: `report_${Date.now()}`,
        reporter_email: user?.email || '',
        reported_user_email: reportType === 'user' ? reportedId : undefined,
        reported_content_id: ['content', 'message'].includes(reportType) ? reportedId : undefined,
        reported_entity_type: reportType,
        report_type: reportCategory,
        description: description.trim(),
        evidence_urls: evidenceUrls.filter(url => url.trim()),
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add to local state
      setReports(prev => [newReport, ...prev]);
      
      // Reset form
      setDescription('');
      setReportedId('');
      setEvidenceUrls(['']);
      
      toast({
        title: 'Report Submitted',
        description: 'Your report has been received and will be reviewed by our team.',
      });

      onReportSubmitted?.(newReport);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit report. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const addEvidenceUrl = () => {
    setEvidenceUrls(prev => [...prev, '']);
  };

  const updateEvidenceUrl = (index: number, value: string) => {
    setEvidenceUrls(prev => prev.map((url, i) => i === index ? value : url));
  };

  const removeEvidenceUrl = (index: number) => {
    setEvidenceUrls(prev => prev.filter((_, i) => i !== index));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'Pending' },
      under_review: { variant: 'default' as const, label: 'Under Review' },
      resolved: { variant: 'default' as const, label: 'Resolved' },
      dismissed: { variant: 'outline' as const, label: 'Dismissed' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getReportTypeIcon = (type: string) => {
    const typeConfig = reportTypes.find(t => t.value === type);
    return typeConfig?.icon || '📋';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      {showHistory && (
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'new'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('new')}
          >
            New Report
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('history')}
          >
            Report History
          </button>
        </div>
      )}

      {/* New Report Form */}
      {activeTab === 'new' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🚨</span>
              Submit a Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitReport} className="space-y-6">
              {/* Report Type Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  What are you reporting?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {reportTypes.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      className={`p-4 border rounded-lg text-center transition-all ${
                        reportType === type.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setReportType(type.value as any)}
                    >
                      <div className="text-2xl mb-2">{type.icon}</div>
                      <div className="text-sm font-medium">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reported ID */}
              <div>
                <label htmlFor="reportedId" className="text-sm font-medium mb-2 block">
                  {reportType === 'user' && 'User Email or ID'}
                  {reportType === 'content' && 'Content ID'}
                  {reportType === 'message' && 'Message ID'}
                  {reportType === 'profile' && 'Profile ID'}
                  {reportType === 'business' && 'Business ID'}
                  {reportType === 'event' && 'Event ID'}
                </label>
                <Input
                  id="reportedId"
                  value={reportedId}
                  onChange={(e) => setReportedId(e.target.value)}
                  placeholder={`Enter ${reportType} ID...`}
                />
              </div>

              {/* Report Category */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  What type of issue is this?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {reportCategories.map(category => (
                    <button
                      key={category.value}
                      type="button"
                      className={`p-4 border rounded-lg text-left transition-all ${
                        reportCategory === category.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setReportCategory(category.value as any)}
                    >
                      <div className="font-medium mb-1">{category.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {category.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="text-sm font-medium mb-2 block">
                  Please describe the issue in detail
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide as much detail as possible about what happened, when it occurred, and why you're reporting it..."
                  rows={5}
                  required
                />
              </div>

              {/* Evidence URLs */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Evidence (URLs, screenshots, etc.)
                </label>
                <div className="space-y-3">
                  {evidenceUrls.map((url, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={url}
                        onChange={(e) => updateEvidenceUrl(index, e.target.value)}
                        placeholder="https://example.com/screenshot.jpg"
                        type="url"
                      />
                      {evidenceUrls.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeEvidenceUrl(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addEvidenceUrl}
                  >
                    Add More Evidence
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={submitting || !description.trim()}
                className="w-full"
              >
                {submitting ? 'Submitting Report...' : 'Submit Report'}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                Your report will be reviewed by our moderation team. We take all reports seriously and will investigate promptly.
              </p>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Report History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📋</span>
                Your Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📝</div>
                  <h3 className="text-lg font-medium mb-2">No Reports Yet</h3>
                  <p className="text-muted-foreground">
                    You haven't submitted any reports yet. Use the "New Report" tab to report any issues you encounter.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map(report => (
                    <Card key={report.id} className="border-l-4 border-l-yellow-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {getReportTypeIcon(report.reported_entity_type)}
                            </span>
                            <div>
                              <h3 className="font-medium capitalize">
                                {report.report_type.replace('_', ' ')} Report
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {formatTimeAgo(report.created_at)}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(report.status)}
                        </div>
                        
                        <p className="text-sm mb-3">{report.description}</p>
                        
                        {report.evidence_urls && report.evidence_urls.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium mb-2">Evidence:</p>
                            <div className="flex flex-wrap gap-2">
                              {report.evidence_urls.map((url, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    Evidence {index + 1}
                                  </a>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {report.admin_notes && (
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-sm font-medium mb-1">Admin Response:</p>
                            <p className="text-sm">{report.admin_notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};