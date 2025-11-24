import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Database, Cloud, CheckCircle, AlertCircle, PlayCircle, Rocket } from 'lucide-react';
import { toast } from 'sonner';
import MigrationWizard from '@/components/MigrationWizard';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    failed: 0
  });
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API}/migrations`);
      const jobsData = response.data;
      setJobs(jobsData);
      
      const completed = jobsData.filter(j => j.status === 'completed').length;
      const inProgress = jobsData.filter(j => ['exporting', 'transforming', 'importing', 'validating'].includes(j.status)).length;
      const failed = jobsData.filter(j => j.status === 'failed').length;
      
      setStats({
        total: jobsData.length,
        completed,
        inProgress,
        failed
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { variant: 'default', icon: <CheckCircle className="w-3 h-3" />, className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
      failed: { variant: 'destructive', icon: <AlertCircle className="w-3 h-3" />, className: 'bg-red-500/10 text-red-600 border-red-500/20' },
      pending: { variant: 'secondary', icon: <PlayCircle className="w-3 h-3" />, className: 'bg-slate-500/10 text-slate-600 border-slate-500/20' },
    };
    
    const config = statusConfig[status] || { variant: 'default', icon: <PlayCircle className="w-3 h-3" />, className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
    
    return (
      <Badge variant={config.variant} className={`flex items-center gap-1 ${config.className}`}>
        {config.icon}
        {status}
      </Badge>
    );
  };

  if (showWizard) {
    return <MigrationWizard onClose={() => setShowWizard(false)} />;
  }

  return (
    <div className="min-h-screen" data-testid="dashboard">
      {/* Hero Section */}
      <div className="border-b border-slate-200/50 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6 border border-blue-200/50">
              <Cloud className="w-4 h-4" />
              Production-Grade Migration Tool
            </div>
            <h1 className="text-5xl font-bold text-slate-900 mb-4">Apigee Migration Hub</h1>
            <p className="text-xl text-slate-600 mb-8">Automate your Edge → Apigee X migration with confidence</p>
            <Button 
              onClick={() => setShowWizard(true)}
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 px-8 py-6 text-lg"
              data-testid="start-migration-btn"
            >
              <Rocket className="mr-2 w-5 h-5" />
              Start Migration
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        {stats.total > 0 && (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Migration Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-200" data-testid="stat-total">
                <CardHeader className="pb-3">
                  <CardDescription className="text-slate-500 text-sm font-medium">Total Migrations</CardDescription>
                  <CardTitle className="text-3xl font-bold text-slate-900">{stats.total}</CardTitle>
                </CardHeader>
              </Card>
              
              <Card className="border-emerald-200/50 shadow-sm hover:shadow-md transition-all duration-200" data-testid="stat-completed">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-slate-500 text-sm font-medium">Completed</CardDescription>
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-emerald-600">{stats.completed}</CardTitle>
                </CardHeader>
              </Card>
              
              <Card className="border-blue-200/50 shadow-sm hover:shadow-md transition-all duration-200" data-testid="stat-in-progress">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-slate-500 text-sm font-medium">In Progress</CardDescription>
                    <PlayCircle className="w-5 h-5 text-blue-500" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-blue-600">{stats.inProgress}</CardTitle>
                </CardHeader>
              </Card>
              
              <Card className="border-red-200/50 shadow-sm hover:shadow-md transition-all duration-200" data-testid="stat-failed">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-slate-500 text-sm font-medium">Failed</CardDescription>
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-red-600">{stats.failed}</CardTitle>
                </CardHeader>
              </Card>
            </div>
          </>
        )}

        {/* Recent Migrations */}
        {stats.total > 0 && (
          <Card className="border-slate-200/50 shadow-sm" data-testid="recent-migrations">
            <CardHeader>
              <CardTitle className="text-xl">Recent Migrations</CardTitle>
              <CardDescription>Latest migration jobs and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-slate-500">Loading migrations...</div>
              ) : (
                <div className="space-y-3">
                  {jobs.slice(0, 5).map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 border border-slate-200/50 rounded-lg hover:bg-slate-50/50 transition-all duration-200 cursor-pointer"
                      onClick={() => navigate(`/migration/${job.id}`)}
                      data-testid={`migration-item-${job.id}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900">{job.name}</h3>
                          {getStatusBadge(job.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span>{job.edge_org} → {job.apigee_x_org}</span>
                          {job.total_resources > 0 && (
                            <span>{job.completed_resources}/{job.total_resources} resources</span>
                          )}
                        </div>
                        {job.total_resources > 0 && (
                          <Progress 
                            value={(job.completed_resources / job.total_resources) * 100} 
                            className="h-1.5 mt-2"
                          />
                        )}
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Feature Highlights */}
        {stats.total === 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-slate-200/50">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                    <Database className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Automated Export</CardTitle>
                  <CardDescription>Extract all resources from Apigee Edge including proxies, KVMs, target servers, and more</CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-slate-200/50">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
                    <ArrowRight className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg">Smart Transformation</CardTitle>
                  <CardDescription>Automatic policy conversion and compatibility checks for seamless Apigee X migration</CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-slate-200/50">
                <CardHeader>
                  <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-4">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                  <CardTitle className="text-lg">Validation & Reports</CardTitle>
                  <CardDescription>Comprehensive validation with detailed reports and diff viewer for confidence</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
