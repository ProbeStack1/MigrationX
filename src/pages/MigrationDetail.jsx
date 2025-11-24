import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function MigrationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [progress, setProgress] = useState(null);
  const [logs, setLogs] = useState({ logs: [], errors: [], warnings: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobDetails();
    fetchProgress();
    fetchLogs();
    
    const interval = setInterval(() => {
      fetchProgress();
      fetchLogs();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const response = await axios.get(`${API}/migrations/${id}`);
      setJob(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch job:', error);
      toast.error('Failed to load migration details');
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await axios.get(`${API}/migrations/${id}/progress`);
      setProgress(response.data);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await axios.get(`${API}/migrations/${id}/logs`);
      setLogs(response.data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading migration details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-600 mb-4">Migration job not found</p>
          <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const progressPercentage = progress?.progress_percentage || 0;
  const isActive = ['exporting', 'transforming', 'importing', 'validating'].includes(job.status);

  return (
    <div className="min-h-screen" data-testid="migration-detail-page">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
          data-testid="back-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Job Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{job.name}</h1>
              <p className="text-slate-600 mt-1">{job.edge_org} → {job.apigee_x_org}</p>
            </div>
            <div className="flex items-center gap-3">
              {job.dry_run && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Dry Run</Badge>
              )}
              <Badge className={`capitalize ${
                job.status === 'completed' ? 'bg-emerald-500' :
                job.status === 'failed' ? 'bg-red-500' :
                'bg-blue-500'
              }`} data-testid="status-badge">
                {job.status}
              </Badge>
            </div>
          </div>

          {/* Progress Bar */}
          {isActive && (
            <div className="bg-white p-6 rounded-lg border border-slate-200/50 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-700">Migration Progress</span>
                <span className="text-sm font-semibold text-blue-600">{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2.5 mb-2" data-testid="progress-bar" />
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>{progress?.completed_resources || 0} / {progress?.total_resources || 0} resources</span>
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>In progress...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-slate-200/50" data-testid="total-resources-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-500">Total Resources</CardTitle>
              <div className="text-3xl font-bold text-slate-900">{job.total_resources}</div>
            </CardHeader>
          </Card>

          <Card className="border-emerald-200/50" data-testid="completed-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-500">Completed</CardTitle>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
                <div className="text-3xl font-bold text-emerald-600">{job.completed_resources}</div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-red-200/50" data-testid="failed-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-500">Failed</CardTitle>
              <div className="flex items-center gap-2">
                <XCircle className="w-6 h-6 text-red-500" />
                <div className="text-3xl font-bold text-red-600">{job.failed_resources}</div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Tabs for Logs and Resources */}
        <Card className="border-slate-200/50">
          <Tabs defaultValue="logs" className="w-full">
            <CardHeader>
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="logs" data-testid="logs-tab">Logs</TabsTrigger>
                <TabsTrigger value="errors" data-testid="errors-tab">
                  Errors {logs.errors.length > 0 && <Badge className="ml-2 bg-red-500">{logs.errors.length}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="warnings" data-testid="warnings-tab">
                  Warnings {logs.warnings.length > 0 && <Badge className="ml-2 bg-amber-500">{logs.warnings.length}</Badge>}
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="logs">
                <ScrollArea className="h-[400px] w-full rounded-lg bg-slate-950 p-4" data-testid="logs-scroll">
                  <div className="font-mono text-sm space-y-1">
                    {logs.logs.length === 0 ? (
                      <div className="text-slate-500">No logs yet...</div>
                    ) : (
                      logs.logs.map((log, index) => (
                        <div key={index} className="text-slate-300">{log}</div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="errors">
                <ScrollArea className="h-[400px] w-full rounded-lg bg-red-950/20 border border-red-200/20 p-4" data-testid="errors-scroll">
                  <div className="font-mono text-sm space-y-2">
                    {logs.errors.length === 0 ? (
                      <div className="text-slate-500 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        No errors
                      </div>
                    ) : (
                      logs.errors.map((error, index) => (
                        <div key={index} className="text-red-600 flex items-start gap-2">
                          <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{error}</span>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="warnings">
                <ScrollArea className="h-[400px] w-full rounded-lg bg-amber-950/10 border border-amber-200/20 p-4" data-testid="warnings-scroll">
                  <div className="font-mono text-sm space-y-2">
                    {logs.warnings.length === 0 ? (
                      <div className="text-slate-500 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        No warnings
                      </div>
                    ) : (
                      logs.warnings.map((warning, index) => (
                        <div key={index} className="text-amber-600 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{warning}</span>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
