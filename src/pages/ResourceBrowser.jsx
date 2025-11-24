import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Database, Share2, Server, Key, Package, Users, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const resourceTypes = [
  { key: 'proxies', label: 'API Proxies', icon: Database, color: 'blue' },
  { key: 'shared_flows', label: 'Shared Flows', icon: Share2, color: 'purple' },
  { key: 'target_servers', label: 'Target Servers', icon: Server, color: 'green' },
  { key: 'kvms', label: 'KVMs', icon: Key, color: 'amber' },
  { key: 'api_products', label: 'API Products', icon: Package, color: 'pink' },
  { key: 'developers', label: 'Developers', icon: Users, color: 'cyan' },
  { key: 'developer_apps', label: 'Developer Apps', icon: Smartphone, color: 'indigo' },
];

export default function ResourceBrowser() {
  const navigate = useNavigate();
  const [resources, setResources] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState(null);

  useEffect(() => {
    loadAllResources();
  }, []);

  const loadAllResources = async () => {
    try {
      const response = await axios.get(`${API}/mock/edge-export`);
      setResources(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load resources:', error);
      toast.error('Failed to load resources');
      setLoading(false);
    }
  };

  const ResourceCard = ({ type, items }) => {
    const config = resourceTypes.find(r => r.key === type);
    if (!config) return null;

    const Icon = config.icon;
    const count = Array.isArray(items) ? items.length : 0;

    return (
      <Card 
        className="border-slate-200/50 hover:shadow-md transition-all duration-200 cursor-pointer"
        onClick={() => setSelectedResource({ type, items, config })}
        data-testid={`resource-card-${type}`}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 bg-${config.color}-50 rounded-lg`}>
                <Icon className={`w-5 h-5 text-${config.color}-600`} />
              </div>
              <div>
                <CardTitle className="text-lg">{config.label}</CardTitle>
                <CardDescription>{count} items</CardDescription>
              </div>
            </div>
            <Badge className="text-lg font-semibold">{count}</Badge>
          </div>
        </CardHeader>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-testid="resource-browser-page">
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Resource Browser</h1>
          <p className="text-slate-600">Explore Apigee Edge resources available for migration</p>
        </div>

        {!selectedResource ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resourceTypes.map(type => (
              <ResourceCard 
                key={type.key} 
                type={type.key} 
                items={resources[type.key]} 
              />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setSelectedResource(null)}
                data-testid="back-to-overview-btn"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Overview
              </Button>
              <h2 className="text-2xl font-bold text-slate-900">{selectedResource.config.label}</h2>
            </div>

            <div className="grid gap-4">
              {selectedResource.items.map((item, index) => {
                const itemName = item.name || item.email || `Item ${index + 1}`;
                return (
                  <Card key={index} className="border-slate-200/50" data-testid={`resource-item-${index}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{itemName}</CardTitle>
                        {item.revision && <Badge variant="outline">Rev {item.revision}</Badge>}
                      </div>
                      {item.description && (
                        <CardDescription>{item.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-slate-950 text-slate-100 p-4 rounded-lg overflow-auto max-h-[300px] text-sm font-mono">
                        {JSON.stringify(item, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
