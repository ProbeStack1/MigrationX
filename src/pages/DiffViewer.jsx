import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, GitCompare, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function DiffViewer() {
  const navigate = useNavigate();
  const [edgeResource, setEdgeResource] = useState(null);
  const [xResource, setXResource] = useState(null);
  const [diff, setDiff] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadSampleDiff = async () => {
    setLoading(true);
    try {
      // Load mock proxy for demo
      const mockResponse = await axios.get(`${API}/mock/resources/proxies`);
      const proxy = mockResponse.data[0];
      
      setEdgeResource(proxy);
      
      // Simulate transformation for diff
      const transformedProxy = { ...proxy };
      // Remove some policies to show diff
      if (transformedProxy.policies) {
        transformedProxy.policies = transformedProxy.policies.filter(p => p.type !== 'JavaCallout');
      }
      setXResource(transformedProxy);
      
      // Calculate diff
      const diffResponse = await axios.post(`${API}/diff/calculate`, {
        edge_resource: proxy,
        x_resource: transformedProxy,
        resource_type: 'proxy',
        resource_name: proxy.name
      });
      
      setDiff(diffResponse.data);
      toast.success('Sample diff loaded');
    } catch (error) {
      console.error('Failed to load diff:', error);
      toast.error('Failed to load diff');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" data-testid="diff-viewer-page">
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

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Diff Viewer</h1>
          <p className="text-slate-600">Compare Edge and Apigee X resources side-by-side</p>
        </div>

        {!diff ? (
          <Card className="border-slate-200/50">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                <GitCompare className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Resource Comparison</CardTitle>
              <CardDescription>Load resources to view differences</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-8">
              <Button 
                onClick={loadSampleDiff} 
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700"
                data-testid="load-sample-btn"
              >
                {loading ? 'Loading...' : 'Load Sample Diff'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Diff Header */}
            <Card className="border-slate-200/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{diff.resource_name}</CardTitle>
                    <CardDescription>Resource Type: {diff.resource_type}</CardDescription>
                  </div>
                  <Badge className={`${
                    diff.status === 'identical' ? 'bg-emerald-500' :
                    diff.status === 'modified' ? 'bg-amber-500' :
                    'bg-blue-500'
                  }`}>
                    {diff.status}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Side-by-side comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-blue-200/50" data-testid="edge-resource-card">
                <CardHeader className="bg-blue-50/50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Apigee Edge
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <pre className="bg-slate-950 text-slate-100 p-4 rounded-lg overflow-auto max-h-[500px] text-sm font-mono">
                    {JSON.stringify(edgeResource, null, 2)}
                  </pre>
                </CardContent>
              </Card>

              <Card className="border-emerald-200/50" data-testid="x-resource-card">
                <CardHeader className="bg-emerald-50/30">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    Apigee X
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <pre className="bg-slate-950 text-slate-100 p-4 rounded-lg overflow-auto max-h-[500px] text-sm font-mono">
                    {JSON.stringify(xResource, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </div>

            {/* Differences */}
            {diff.differences && diff.differences.length > 0 && (
              <Card className="border-slate-200/50" data-testid="differences-card">
                <CardHeader>
                  <CardTitle>Detected Changes</CardTitle>
                  <CardDescription>{diff.differences.length} differences found</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {diff.differences.map((change, index) => (
                      <div 
                        key={index} 
                        className="p-4 border border-slate-200/50 rounded-lg bg-slate-50/50"
                        data-testid={`diff-item-${index}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-slate-900">{change.field}</span>
                          <Badge variant="outline" className="capitalize">
                            {change.change_type}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-slate-500 mb-1">Edge Value:</div>
                            <code className="bg-white p-2 rounded border border-slate-200 block">
                              {JSON.stringify(change.edge_value)}
                            </code>
                          </div>
                          <div>
                            <div className="text-slate-500 mb-1">X Value:</div>
                            <code className="bg-white p-2 rounded border border-slate-200 block">
                              {JSON.stringify(change.x_value)}
                            </code>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-center">
              <Button 
                onClick={loadSampleDiff}
                variant="outline"
                data-testid="load-another-btn"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Load Another Sample
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
