import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Rocket, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function NewMigration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    edge_org: 'demo-edge-org',
    edge_env: 'prod',
    apigee_x_org: 'demo-apigee-x-org',
    apigee_x_env: 'prod',
    dry_run: true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Migration name is required');
      return;
    }
    
    setLoading(true);
    
    try {
      // Create migration job
      const response = await axios.post(`${API}/migrations`, formData);
      const job = response.data;
      
      toast.success('Migration job created successfully');
      
      // Start the migration
      await axios.post(`${API}/migrations/${job.id}/start`);
      
      toast.info('Migration started');
      
      // Navigate to detail page
      navigate(`/migration/${job.id}`);
      
    } catch (error) {
      console.error('Failed to create migration:', error);
      toast.error('Failed to create migration job');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" data-testid="new-migration-page">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
          data-testid="back-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">New Migration</h1>
          <p className="text-slate-600">Configure and start a new Apigee Edge to X migration</p>
        </div>

        <Alert className="mb-6 border-blue-200 bg-blue-50/50" data-testid="demo-alert">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <strong>Demo Mode:</strong> This is running with mock data. In production, provide real Apigee Edge and X credentials.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit}>
          <Card className="border-slate-200/50 shadow-sm mb-6">
            <CardHeader>
              <CardTitle>Migration Configuration</CardTitle>
              <CardDescription>Define source and target organizations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-slate-700 font-medium">Migration Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Production Migration Q1 2025"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1.5"
                  data-testid="migration-name-input"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 p-4 bg-slate-50/50 rounded-lg border border-slate-200/50">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Source: Apigee Edge
                  </h3>
                  
                  <div>
                    <Label htmlFor="edge_org" className="text-slate-700">Organization</Label>
                    <Input
                      id="edge_org"
                      value={formData.edge_org}
                      onChange={(e) => setFormData({ ...formData, edge_org: e.target.value })}
                      className="mt-1.5"
                      data-testid="edge-org-input"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edge_env" className="text-slate-700">Environment</Label>
                    <Input
                      id="edge_env"
                      value={formData.edge_env}
                      onChange={(e) => setFormData({ ...formData, edge_env: e.target.value })}
                      className="mt-1.5"
                      data-testid="edge-env-input"
                    />
                  </div>
                </div>

                <div className="space-y-4 p-4 bg-emerald-50/30 rounded-lg border border-emerald-200/50">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    Target: Apigee X
                  </h3>
                  
                  <div>
                    <Label htmlFor="apigee_x_org" className="text-slate-700">Organization</Label>
                    <Input
                      id="apigee_x_org"
                      value={formData.apigee_x_org}
                      onChange={(e) => setFormData({ ...formData, apigee_x_org: e.target.value })}
                      className="mt-1.5"
                      data-testid="x-org-input"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="apigee_x_env" className="text-slate-700">Environment</Label>
                    <Input
                      id="apigee_x_env"
                      value={formData.apigee_x_env}
                      onChange={(e) => setFormData({ ...formData, apigee_x_env: e.target.value })}
                      className="mt-1.5"
                      data-testid="x-env-input"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/50 shadow-sm mb-6">
            <CardHeader>
              <CardTitle>Migration Options</CardTitle>
              <CardDescription>Advanced settings for migration execution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-amber-50/50 rounded-lg border border-amber-200/50">
                <div>
                  <Label htmlFor="dry_run" className="text-slate-900 font-medium">Dry Run Mode</Label>
                  <p className="text-sm text-slate-600 mt-1">
                    Validate migration without importing to Apigee X
                  </p>
                </div>
                <Switch
                  id="dry_run"
                  checked={formData.dry_run}
                  onCheckedChange={(checked) => setFormData({ ...formData, dry_run: checked })}
                  data-testid="dry-run-switch"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-4">
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="start-migration-btn"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Starting Migration...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  Start Migration
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
              disabled={loading}
              data-testid="cancel-btn"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
