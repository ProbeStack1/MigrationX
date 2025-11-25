import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { X, ArrowRight, Loader2, CheckCircle, AlertCircle, Search, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

const dummyKeystoreAssessments = [
  {
    name: "gateway-keystore",
    type: "Keystore",
    status: "warning",
    issues: [],
    warnings: [
      { message: "Certificate gateway-cert expires in 18 months" }
    ],
    recommendations: ["Rotate certificate before expiry"]
  },
  {
    name: "internal-keystore",
    type: "Keystore",
    status: "ready",
    issues: [],
    warnings: [],
    recommendations: []
  }
];

const dummyTruststoreAssessments = [
  {
    name: "gateway-truststore",
    type: "Truststore",
    status: "warning",
    issues: [],
    warnings: [
      { message: "1 certificate expires in under 2 years" }
    ],
    recommendations: ["Update expiring CA certificates"]
  },
  {
    name: "internal-truststore",
    type: "Truststore",
    status: "ready",
    issues: [],
    warnings: [],
    recommendations: []
  }
];
const AssessmentTable = ({ title, assessments, type, dependencies, apigeeXData, onMigrate }) => {
  return (
    <div className="bg-white rounded-lg border border-slate-200/50">
      <div className="p-4 border-b border-slate-200 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {assessments.length} items
          </Badge>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
  <tr>
    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Dependencies</th>

    {type === "kvm" && (
      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
        Encrypted
      </th>
    )}

    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Issues / Warnings</th>
    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Action</th>
  </tr>
</thead>
          <tbody className="divide-y divide-slate-200">
            {assessments.map((assessment, index) => {
              const isEncrypted =
  type === "kvm"
    ? !(
        assessment.warnings?.some(w =>
          (w.message || "").toLowerCase().includes("not encrypted")
        )
      )
    : null;
              const resourceDeps = dependencies?.[assessment.name] || {};
              const hasDeps = Object.keys(resourceDeps).length > 0;
              
              return (
                <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{assessment.name}</div>
                    {type === 'proxy' && assessment.policy_analysis && (
                      <div className="text-xs text-slate-500">{assessment.policy_analysis.total} policies</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {hasDeps ? (
                      <div className="space-y-1">
                        {resourceDeps.target_servers && (
                          <div className="text-xs">
                            <span className="text-slate-500">Target Servers:</span>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {resourceDeps.target_servers.map((ts, i) => (
                                <span key={i} className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">
                                  {ts}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {resourceDeps.kvms && (
                          <div className="text-xs">
                            <span className="text-slate-500">KVMs:</span>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {resourceDeps.kvms.map((kvm, i) => (
                                <span key={i} className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-xs">
                                  {kvm}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {resourceDeps.proxies && (
                          <div className="text-xs">
                            <span className="text-slate-500">Proxies:</span>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {resourceDeps.proxies.map((proxy, i) => (
                                <span key={i} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                                  {proxy}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">No dependencies</span>
                    )}
                  </td>
                  {/* 🔐 Encryption column only for KVM */}
{type === "kvm" && (
  <td className="px-6 py-4 whitespace-nowrap">
    {assessment.warnings?.some(w => 
        (w.message || "").toLowerCase().includes("not encrypted")
      ) ? (
      <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded text-xs">
        No
      </span>
    ) : (
      <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">
        Yes
      </span>
    )}
  </td>
)}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={`${
                      assessment.status === 'ready' ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' :
                      assessment.status === 'warning' ? 'bg-amber-500/10 text-amber-700 border-amber-500/20' :
                      'bg-red-500/10 text-red-700 border-red-500/20'
                    }`}>
                      {assessment.status}
                    </Badge>
                  </td>

                  <td className="px-6 py-4">
                  {assessment.issues && assessment.issues.length > 0 && (
  <div className="space-y-1 mb-2">
    {assessment.issues
      // 🔥 FILTER OUT ONLY encryption warnings for KVMs
      .filter(issue =>
        type !== "kvm" ||
        !issue.message.toLowerCase().includes("not encrypted")
      )
      .map((issue, i) => (
        <div key={i} className="text-xs text-red-600 flex items-start gap-1">
          <span className="text-red-500 mt-0.5">•</span>
          <span>{issue.message}</span>
        </div>
      ))}
  </div>
)}
                  {assessment.warnings && assessment.warnings.length > 0 && (
  <div className="space-y-1">

    {assessment.warnings
      // filter out encryption warnings for KVMs
      .filter(w =>
        type !== "kvm" ||
        !(w.message || "").toLowerCase().includes("not encrypted")
      )
      .slice(0, 3)
      .map((warning, i) => (
        <div key={i} className="text-xs text-amber-600 flex items-start gap-1">
          <span className="text-amber-500 mt-0.5">•</span>
          <span>{warning.message || warning.type}</span>
        </div>
      ))}

    {assessment.warnings.length > 3 && (
      <div className="text-xs text-slate-500 pl-3">
        +{assessment.warnings.length - 3} more
      </div>
    )}

  </div>
)}
                  {(!assessment.issues || assessment.issues.length === 0) && 
                   (!assessment.warnings || assessment.warnings.length === 0) && (
                    <span className="text-emerald-600 text-sm flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> No issues
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {type === 'proxy' && assessment.policy_analysis && (
                    <div className="text-xs text-slate-600 space-y-1">
                      {assessment.policy_analysis.unsupported > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-red-600">⚠️</span>
                          <span>{assessment.policy_analysis.unsupported} unsupported</span>
                        </div>
                      )}
                      {assessment.policy_analysis.needs_transformation > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-amber-600">🔄</span>
                          <span>{assessment.policy_analysis.needs_transformation} needs transform</span>
                        </div>
                      )}
                      {assessment.policy_analysis.warnings > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-amber-600">⚠️</span>
                          <span>{assessment.policy_analysis.warnings} warnings</span>
                        </div>
                      )}
                    </div>
                  )}
                  {assessment.recommendations && assessment.recommendations.length > 0 && (
                    <div className="text-xs text-blue-600 mt-1">
                      {assessment.recommendations.length} recommendation(s)
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <Button
                    size="sm"
                    onClick={() => onMigrate(assessment, type)}
                    disabled={assessment.status === 'blocked'}
                    className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-300"
                    data-testid={`migrate-${assessment.name}-btn`}
                  >
                    Migrate
                  </Button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Resource Detail Section Component
const ResourceDetailSection = ({ title, resources, type }) => {
  if (!resources || resources.length === 0) return null;

  return (
    <Accordion type="single" collapsible className="bg-white border border-slate-200/50 rounded-lg">
      <AccordionItem value="item-1" className="border-none">
        <AccordionTrigger className="px-6 py-4 hover:no-underline">
          <div className="flex items-center justify-between w-full pr-4">
            <span className="text-lg font-semibold text-slate-900">{title}</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {resources.length} items
            </Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-4">
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {resources.map((resource, index) => (
              <ResourceItem key={index} resource={resource} type={type} />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

// Individual Resource Item Component
const ResourceItem = ({ resource, type }) => {
  if (type === 'proxy') {
    return (
      <div className="p-3 bg-slate-50/50 rounded border border-slate-200/50 hover:border-blue-300 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-slate-900">{resource.name}</span>
          <Badge variant="outline" className="text-xs">{resource.type}</Badge>
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm text-slate-600">
          <div>Policies: <span className="font-medium text-slate-900">{resource.policy_count || 0}</span></div>
          <div>Targets: <span className="font-medium text-slate-900">{resource.targets?.length || 0}</span></div>
          <div>Endpoints: <span className="font-medium text-slate-900">{resource.endpoints?.length || 0}</span></div>
        </div>
        {resource.policies && resource.policies.length > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-200">
            <div className="text-xs text-slate-500 mb-1">Policies:</div>
            <div className="flex flex-wrap gap-1">
              {resource.policies.slice(0, 5).map((policy, i) => (
                <span key={i} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
                  {policy.type}
                </span>
              ))}
              {resource.policies.length > 5 && (
                <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-600 rounded">
                  +{resource.policies.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (type === 'targetServer') {
    return (
      <div className="p-3 bg-slate-50/50 rounded border border-slate-200/50">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-slate-900">{resource.name}</span>
          <Badge variant={resource.isEnabled ? "default" : "secondary"} className="text-xs">
            {resource.isEnabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
        <div className="text-sm space-y-1">
          <div className="text-slate-600">
            Host: <span className="font-medium text-slate-900">{resource.host}</span>
          </div>
          <div className="text-slate-600">
            Port: <span className="font-medium text-slate-900">{resource.port}</span>
          </div>
          <div className="text-slate-600">
            Environment: <span className="font-medium text-slate-900">{resource.environment}</span>
          </div>
          {resource.sslEnabled && (
            <div className="text-xs text-emerald-600">✓ SSL Enabled</div>
          )}
        </div>
      </div>
    );
  }

  if (type === 'kvm') {
    return (
      <div className="p-3 bg-slate-50/50 rounded border border-slate-200/50">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-slate-900">{resource.name}</span>
          {resource.encrypted && <Badge variant="outline" className="text-xs bg-amber-50">Encrypted</Badge>}
        </div>
        <div className="text-sm text-slate-600">
          Environment: <span className="font-medium text-slate-900">{resource.environment}</span>
        </div>
        <div className="text-sm text-slate-600">
          Entries: <span className="font-medium text-slate-900">{resource.entries}</span>
        </div>
      </div>
    );
  }

  if (type === 'apiProduct') {
    return (
      <div className="p-3 bg-slate-50/50 rounded border border-slate-200/50">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-slate-900">{resource.displayName || resource.name}</span>
          <Badge variant="outline" className="text-xs">{resource.approvalType}</Badge>
        </div>
        {resource.description && (
          <div className="text-sm text-slate-600 mb-2">{resource.description}</div>
        )}
        <div className="text-sm text-slate-600">
          Proxies: <span className="font-medium text-slate-900">{resource.proxies?.length || 0}</span>
        </div>
        {resource.proxies && resource.proxies.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {resource.proxies.map((proxy, i) => (
              <span key={i} className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded">
                {proxy}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (type === 'developer') {
    return (
      <div className="p-3 bg-slate-50/50 rounded border border-slate-200/50">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-slate-900">{resource.firstName} {resource.lastName}</span>
          <Badge variant={resource.status === 'active' ? 'default' : 'secondary'} className="text-xs">
            {resource.status}
          </Badge>
        </div>
        <div className="text-sm text-slate-600">{resource.email}</div>
        <div className="text-xs text-slate-500 mt-1">
          Apps: {resource.apps?.length || 0} • Org: {resource.organizationName}
        </div>
      </div>
    );
  }

  if (type === 'app') {
    return (
      <div className="p-3 bg-slate-50/50 rounded border border-slate-200/50">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-slate-900">{resource.name}</span>
          <Badge variant={resource.status === 'approved' ? 'default' : 'secondary'} className="text-xs">
            {resource.status}
          </Badge>
        </div>
        <div className="text-sm text-slate-600 space-y-1">
          <div>App ID: <span className="font-mono text-xs">{resource.appId?.substring(0, 20)}...</span></div>
          <div>API Products: <span className="font-medium text-slate-900">{resource.apiProducts?.length || 0}</span></div>
          <div>Credentials: <span className="font-medium text-slate-900">{resource.credentials}</span></div>
        </div>
        {resource.apiProducts && resource.apiProducts.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {resource.apiProducts.map((prod, i) => (
              <span key={i} className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded">
                {prod}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function MigrationWizard({ onClose }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Edge, 2: Discovery, 3: Apigee X, 4: Assessment, 5: Review
  const [loading, setLoading] = useState(false);
  const [discoveredResources, setDiscoveredResources] = useState(null);
  const [assessmentReport, setAssessmentReport] = useState(null);
  
  const [edgeData, setEdgeData] = useState({
    orgId: '',
    url: 'https://api.enterprise.apigee.com',
    env: 'prod',
    username: '',
    password: ''
  });
  
  const [apigeeXData, setApigeeXData] = useState({
    apigeex_org_name: '',
    apigeex_token: '',
    apigeex_env: 'prod',
    apigeex_mgmt_url: 'https://apigee.googleapis.com/v1/organizations/',
    folder_name: "C:/Users/saili/Probestack/probestack/backend/data_edge"
  });
  
  const [configVerified, setConfigVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleDiscovery = async () => {
    setLoading(true);
    try {
      // Get real Edge data from uploaded files
      const response = await axios.get(`${API}/discover/real`);
      setDiscoveredResources(response.data.resources);
      
      toast.success('Discovery completed successfully!');
      setStep(2);
    } catch (error) {
      console.error('Discovery failed:', error);
      toast.error('Failed to discover Edge resources');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    setVerifying(true);
    try {
      // Save and verify Apigee X configuration
      const response = await axios.post(`${API}/config/apigee-x`, apigeeXData);
      
      if (response.data.success) {
        setConfigVerified(true);
        toast.success('Configuration saved and verified successfully!');
      } else {
        toast.error('Configuration verification failed');
      }
    } catch (error) {
      console.error('Config save failed:', error);
      toast.error(error.response?.data?.detail || 'Failed to save configuration');
      setConfigVerified(false);
    } finally {
      setVerifying(false);
    }
  };

  const handleAssessment = async () => {
    setLoading(true);
    try {
      // Get assessment report
      const response = await axios.post(`${API}/assess`);
      setAssessmentReport(response.data.assessment);
      
      toast.success('Assessment completed!');
      setStep(4);
    } catch (error) {
      console.error('Assessment failed:', error);
      toast.error('Failed to perform assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleResourceMigrate = async (assessment, resourceType) => {
    try {
      toast.info(`Migrating ${assessment.name}...`);
      
      const response = await axios.post(`${API}/migrate/resource`, {
        resource_type: resourceType,
        resource_name: assessment.name,
        apigee_x_config: apigeeXData
      });
      
      if (response.data.success) {
        toast.success(`${assessment.name} migrated successfully!`);
      } else {
        toast.error(`Failed to migrate ${assessment.name}: ${response.data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Migration failed:', error);
      toast.error(`Migration error: ${error.response?.data?.detail || error.message}`);
    }
  };

const handleStartMigration = async () => {
  setLoading(true);
  try {
    const response = await axios.post(`${API}/migrations`, {
      name: `Migration from ${edgeData.orgId} to ${apigeeXData.apigeex_org_name}`,
      edge_org: edgeData.orgId,
      edge_env: edgeData.env,

      // REQUIRED by backend — FIXED
      apigee_x_org: apigeeXData.apigeex_org_name,
      apigee_x_env: apigeeXData.apigeex_env,

      dry_run: false
    });

    const job = response.data;

    await axios.post(`${API}/migrations/${job.id}/start`);

    toast.success('Migration started!');
    navigate(`/migration/${job.id}`);
  } catch (error) {
    console.error('Failed to start migration:', error);
    toast.error(error.response?.data?.detail || 'Failed to start migration');
    setLoading(false);
  }
};


  const getTotalResourceCount = () => {
    if (!discoveredResources) return 0;
    return Object.values(discoveredResources).reduce((sum, arr) => {
      return sum + (Array.isArray(arr) ? arr.length : 0);
    }, 0);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-testid="migration-wizard">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto border-slate-200 shadow-2xl">
        <CardHeader className="border-b border-slate-200/50 bg-slate-50/50 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Start New Migration</CardTitle>
              <CardDescription>Configure source and target for your migration</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} data-testid="close-wizard-btn">
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Step Indicator */}
          <div className="flex items-center gap-1 mt-6 overflow-x-auto pb-2">
            {[
              { num: 1, label: 'Edge' },
              { num: 2, label: 'Discovery' },
              { num: 3, label: 'Apigee X' },
              { num: 4, label: 'Assessment' },
              { num: 5, label: 'Review' }
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className={`flex items-center gap-1.5 ${
                  step >= s.num ? 'text-blue-600' : 'text-slate-400'
                }`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                    step >= s.num ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {s.num}
                  </div>
                  <span className="text-xs font-medium hidden md:inline whitespace-nowrap">{s.label}</span>
                </div>
                {idx < 4 && <div className="flex-1 h-px bg-slate-200 min-w-[20px]"></div>}
              </React.Fragment>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Step 1: Apigee Edge Configuration */}
          {step === 1 && (
            <div className="space-y-6" data-testid="edge-config-form">
              <Alert className="border-blue-200 bg-blue-50/50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  <strong>Demo Mode:</strong> Enter any values to proceed with mock data discovery
                </AlertDescription>
              </Alert>

              <div className="bg-slate-50/50 p-6 rounded-lg border border-slate-200/50">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Apigee Edge Configuration
                </h3>
                
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="orgId" className="text-slate-700 font-medium">OrgId *</Label>
                      <Input
                        id="orgId"
                        placeholder="e.g., my-edge-org"
                        value={edgeData.orgId}
                        onChange={(e) => setEdgeData({ ...edgeData, orgId: e.target.value })}
                        className="mt-1.5"
                        data-testid="edge-org-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="env" className="text-slate-700 font-medium">Environment *</Label>
                      <Input
                        id="env"
                        placeholder="e.g., prod, test"
                        value={edgeData.env}
                        onChange={(e) => setEdgeData({ ...edgeData, env: e.target.value })}
                        className="mt-1.5"
                        data-testid="edge-env-input"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="url" className="text-slate-700 font-medium">Edge Management API URL *</Label>
                    <Input
                      id="url"
                      value={edgeData.url}
                      onChange={(e) => setEdgeData({ ...edgeData, url: e.target.value })}
                      className="mt-1.5"
                      data-testid="edge-url-input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="username" className="text-slate-700 font-medium">Username *</Label>
                      <Input
                        id="username"
                        placeholder="Edge username"
                        value={edgeData.username}
                        onChange={(e) => setEdgeData({ ...edgeData, username: e.target.value })}
                        className="mt-1.5"
                        data-testid="edge-username-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password" className="text-slate-700 font-medium">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={edgeData.password}
                        onChange={(e) => setEdgeData({ ...edgeData, password: e.target.value })}
                        className="mt-1.5"
                        data-testid="edge-password-input"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={onClose} data-testid="cancel-btn">
                  Cancel
                </Button>
                <Button 
                  onClick={handleDiscovery}
                  disabled={loading || !edgeData.orgId || !edgeData.username}
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="discovery-btn"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Discovering...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 w-4 h-4" />
                      Start Discovery
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Discovery Results - Detailed View */}
          {step === 2 && discoveredResources && (
            <div className="space-y-6" data-testid="discovery-results">
              <Alert className="border-emerald-200 bg-emerald-50/50">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <AlertDescription className="text-emerald-900">
                  Discovery completed! Found <strong>{getTotalResourceCount()} resources</strong> ready for migration
                </AlertDescription>
              </Alert>

              {/* Resource Summary Cards */}
              <div className="bg-slate-50/50 p-6 rounded-lg border border-slate-200/50">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Resource Summary</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {Object.entries(discoveredResources).map(([key, value]) => {
                    const count = Array.isArray(value) ? value.length : 0;
                    return (
                      <div key={key} className="bg-white p-4 rounded-lg border border-slate-200/50 hover:border-blue-300 transition-colors">
                        <div className="text-2xl font-bold text-blue-600 mb-1">{count}</div>
                        <div className="text-sm text-slate-600 capitalize">{key.replace('_', ' ')}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Resource Lists */}
              <div className="space-y-4">
                <ResourceDetailSection title="API Proxies" resources={discoveredResources.proxies} type="proxy" />
                <ResourceDetailSection title="Target Servers" resources={discoveredResources.target_servers} type="targetServer" />
                <ResourceDetailSection title="Key-Value Maps" resources={discoveredResources.kvms} type="kvm" />
                <ResourceDetailSection title="API Products" resources={discoveredResources.api_products} type="apiProduct" />
                <ResourceDetailSection title="Developers" resources={discoveredResources.developers} type="developer" />
                <ResourceDetailSection title="Developer Apps" resources={discoveredResources.apps} type="app" />
              </div>

              <div className="flex justify-between gap-3 pt-4 border-t border-slate-200">
                <Button variant="outline" onClick={() => setStep(1)} data-testid="back-btn">
                  Back to Configuration
                </Button>
                <Button 
                  onClick={() => setStep(3)}
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="next-to-apigee-x-btn"
                >
                  Continue to Apigee X Config
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Assessment Report */}
          {step === 4 && assessmentReport && (
            <div className="space-y-6" data-testid="assessment-report">
              <Alert className={`border-${
                assessmentReport.overall_status === 'ready' ? 'emerald' :
                assessmentReport.overall_status === 'needs_attention' ? 'amber' : 'red'
              }-200 bg-${
                assessmentReport.overall_status === 'ready' ? 'emerald' :
                assessmentReport.overall_status === 'needs_attention' ? 'amber' : 'red'
              }-50/50`}>
                {assessmentReport.overall_status === 'ready' ? (
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                ) : (
                  <AlertCircle className={`h-4 w-4 text-${
                    assessmentReport.overall_status === 'needs_attention' ? 'amber' : 'red'
                  }-600`} />
                )}
                <AlertDescription className={`text-${
                  assessmentReport.overall_status === 'ready' ? 'emerald' :
                  assessmentReport.overall_status === 'needs_attention' ? 'amber' : 'red'
                }-900`}>
                  <strong>Assessment Complete:</strong> {' '}
                  {assessmentReport.overall_status === 'ready' && 'All resources ready for migration'}
                  {assessmentReport.overall_status === 'needs_attention' && `${assessmentReport.total_warnings} warning(s) found - review before proceeding`}
                  {assessmentReport.overall_status === 'blocked' && `${assessmentReport.total_issues} issue(s) must be resolved before migration`}
                </AlertDescription>
              </Alert>

              {/* Assessment Summary */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-6 rounded-lg border border-slate-200/50">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Overall Assessment</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg border border-emerald-200/50">
                    <div className="text-3xl font-bold text-emerald-600">{assessmentReport.summary.ready_to_migrate}</div>
                    <div className="text-sm text-slate-600">Ready to Migrate</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-amber-200/50">
                    <div className="text-3xl font-bold text-amber-600">{assessmentReport.summary.needs_attention}</div>
                    <div className="text-sm text-slate-600">Needs Attention</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-red-200/50">
                    <div className="text-3xl font-bold text-red-600">{assessmentReport.summary.blocked}</div>
                    <div className="text-sm text-slate-600">Blocked</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200/50">
                    <div className="text-3xl font-bold text-slate-900">{assessmentReport.summary.total_issues + assessmentReport.summary.total_warnings}</div>
                    <div className="text-sm text-slate-600">Total Issues</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-slate-200">
                  <div className="text-center p-3 bg-white rounded border border-slate-200/50">
                    <div className="text-xl font-bold text-blue-600">{assessmentReport.summary.total_proxies}</div>
                    <div className="text-xs text-slate-500">Proxies</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded border border-slate-200/50">
                    <div className="text-xl font-bold text-blue-600">{assessmentReport.summary.total_target_servers}</div>
                    <div className="text-xs text-slate-500">Target Servers</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded border border-slate-200/50">
                    <div className="text-xl font-bold text-blue-600">{assessmentReport.summary.total_kvms}</div>
                    <div className="text-xs text-slate-500">KVMs</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded border border-slate-200/50">
                    <div className="text-xl font-bold text-blue-600">{assessmentReport.summary.total_api_products}</div>
                    <div className="text-xs text-slate-500">API Products</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded border border-slate-200/50">
                    <div className="text-xl font-bold text-blue-600">{assessmentReport.summary.total_developers || 0}</div>
                    <div className="text-xs text-slate-500">Developers</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded border border-slate-200/50">
                    <div className="text-xl font-bold text-blue-600">{assessmentReport.summary.total_apps || 0}</div>
                    <div className="text-xs text-slate-500">Apps</div>
                  </div>
                </div>
              </div>

              {/* All Resource Assessments */}
              <div className="space-y-6">
                {/* Proxies Assessment */}
                {assessmentReport.proxy_assessments.length > 0 && (
                  <AssessmentTable 
                    title="API Proxies" 
                    assessments={assessmentReport.proxy_assessments}
                    type="proxy"
                    dependencies={assessmentReport.dependencies}
                    apigeeXData={apigeeXData}
                    onMigrate={handleResourceMigrate}
                  />
                )}

                {/* Target Servers Assessment */}
                {assessmentReport.target_server_assessments.length > 0 && (
                  <AssessmentTable 
                    title="Target Servers" 
                    assessments={assessmentReport.target_server_assessments}
                    type="target_server"
                    dependencies={assessmentReport.dependencies}
                    apigeeXData={apigeeXData}
                    onMigrate={handleResourceMigrate}
                  />
                )}

                {/* KVMs Assessment */}
                {assessmentReport.kvm_assessments.length > 0 && (
                  <AssessmentTable 
                    title="Key-Value Maps" 
                    assessments={assessmentReport.kvm_assessments}
                    type="kvm"
                    dependencies={assessmentReport.dependencies}
                    apigeeXData={apigeeXData}
                    onMigrate={handleResourceMigrate}
                  />
                )}

                {/* Dummy Keystore Table */}
<AssessmentTable
  title="Keystores"
  assessments={dummyKeystoreAssessments}
  type="keystore"
  dependencies={{}}     // no deps needed
  apigeeXData={{}}      // no data needed
  onMigrate={() => {}}  // disable migrate
/>

{/* Dummy Truststore Table */}
<AssessmentTable
  title="Truststores"
  assessments={dummyTruststoreAssessments}
  type="truststore"
  dependencies={{}}
  apigeeXData={{}}
  onMigrate={() => {}}
/>

                {/* API Products Assessment */}
                {assessmentReport.api_product_assessments.length > 0 && (
                  <AssessmentTable 
                    title="API Products" 
                    assessments={assessmentReport.api_product_assessments}
                    type="api_product"
                    dependencies={assessmentReport.dependencies}
                    apigeeXData={apigeeXData}
                    onMigrate={handleResourceMigrate}
                  />
                )}

                {/* API Products Assessment */}
{assessmentReport.api_product_assessments.length > 0 && (
  <AssessmentTable 
    title="API Products" 
    assessments={assessmentReport.api_product_assessments}
    type="api_product"
    dependencies={assessmentReport.dependencies}
    apigeeXData={apigeeXData}
    onMigrate={handleResourceMigrate}
  />
)}

{/* 👇 ADD THESE TWO NEW TABLES */}

{/* Developers Assessment */}
{assessmentReport.developer_assessments && assessmentReport.developer_assessments.length > 0 && (
  <AssessmentTable 
    title="Developers" 
    assessments={assessmentReport.developer_assessments}
    type="developer"
    dependencies={assessmentReport.dependencies}
    apigeeXData={apigeeXData}
    onMigrate={handleResourceMigrate}
  />
)}

{/* Apps Assessment */}
{assessmentReport.app_assessments && assessmentReport.app_assessments.length > 0 && (
  <AssessmentTable 
    title="Developer Apps" 
    assessments={assessmentReport.app_assessments}
    type="app"
    dependencies={assessmentReport.dependencies}
    apigeeXData={apigeeXData}
    onMigrate={handleResourceMigrate}
  />
)}
                
              </div>

              {/* Recommendations */}
              {assessmentReport.proxy_assessments.some(a => a.recommendations.length > 0) && (
                <div className="bg-blue-50/50 p-6 rounded-lg border border-blue-200/50">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Recommendations</h3>
                  <ul className="space-y-2">
                    {assessmentReport.proxy_assessments.map((assessment, index) => 
                      assessment.recommendations.map((rec, i) => (
                        <li key={`${index}-${i}`} className="text-sm text-slate-700 flex items-start gap-2">
                          <span className="text-blue-600 mt-1">→</span>
                          <span><strong>{assessment.name}:</strong> {rec}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}

              <div className="flex justify-between gap-3">
                <Button variant="outline" onClick={() => setStep(3)} data-testid="back-to-apigee-x-btn">
                  Back to Apigee X Config
                </Button>
                <Button 
                  onClick={() => setStep(5)}
                  disabled={assessmentReport.overall_status === 'blocked'}
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="continue-to-review-btn"
                >
                  {assessmentReport.overall_status === 'blocked' ? 'Resolve Issues to Continue' : 'Continue to Review'}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Apigee X Configuration */}
          {step === 3 && (
            <div className="space-y-6" data-testid="apigee-x-config">
              <Alert className="border-blue-200 bg-blue-50/50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  Configure your target Apigee X organization where resources will be migrated. You'll need an OAuth token for authentication.
                </AlertDescription>
              </Alert>

              <div className="bg-emerald-50/50 p-6 rounded-lg border border-emerald-200/50">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  Apigee X Configuration
                </h3>
                
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="apigeex_org_name" className="text-slate-700 font-medium">Organization Name *</Label>
                      <Input
                        id="apigeex_org_name"
                        placeholder="e.g., lunar-temple-478708-f7"
                        value={apigeeXData.apigeex_org_name}
                        onChange={(e) => setApigeeXData({ ...apigeeXData, apigeex_org_name: e.target.value })}
                        className="mt-1.5"
                        data-testid="x-org-input"
                      />
                      <p className="text-xs text-slate-500 mt-1">Your Apigee X organization name</p>
                    </div>
                    <div>
                      <Label htmlFor="apigeex_env" className="text-slate-700 font-medium">Environment *</Label>
                      <Input
                        id="apigeex_env"
                        placeholder="e.g., prod, eval"
                        value={apigeeXData.apigeex_env}
                        onChange={(e) => setApigeeXData({ ...apigeeXData, apigeex_env: e.target.value })}
                        className="mt-1.5"
                        data-testid="x-env-input"
                      />
                      <p className="text-xs text-slate-500 mt-1">Target environment (must exist)</p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="apigeex_token" className="text-slate-700 font-medium">OAuth Token *</Label>
                    <div className="flex gap-2 mt-1.5">
                      <textarea
                        id="apigeex_token"
                        placeholder='Paste your OAuth token here (starts with ya29.a0...)'
                        value={apigeeXData.apigeex_token}
                        onChange={(e) => {
                          setApigeeXData({ ...apigeeXData, apigeex_token: e.target.value });
                          setConfigVerified(false);
                        }}
                        className="flex-1 min-h-[100px] px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                        data-testid="x-token-input"
                      />
                    </div>
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-xs text-blue-900 font-medium mb-1">How to get OAuth Token:</p>
                      <p className="text-xs text-blue-800">Run: <code className="bg-blue-100 px-1 py-0.5 rounded">gcloud auth print-access-token</code></p>
                      <p className="text-xs text-blue-700 mt-1">Note: Tokens expire after 1 hour. Click "Refresh Token" to get a new one.</p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="apigeex_mgmt_url" className="text-slate-700 font-medium">Management URL</Label>
                    <Input
                      id="apigeex_mgmt_url"
                      value={apigeeXData.apigeex_mgmt_url}
                      onChange={(e) => setApigeeXData({ ...apigeeXData, apigeex_mgmt_url: e.target.value })}
                      className="mt-1.5"
                      disabled
                    />
                    <p className="text-xs text-slate-500 mt-1">Default Apigee X API endpoint</p>
                  </div>

                  {configVerified && (
                    <Alert className="border-emerald-200 bg-emerald-50/50">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <AlertDescription className="text-emerald-900">
                        Configuration verified successfully! Ready to proceed with assessment.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              <div className="flex justify-between gap-3">
                <Button variant="outline" onClick={() => setStep(2)} data-testid="back-to-discovery-btn">
                  Back to Discovery
                </Button>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSaveConfig}
                    disabled={verifying || !apigeeXData.apigeex_org_name || !apigeeXData.apigeex_token || !apigeeXData.apigeex_env}
                    variant="outline"
                    className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                    data-testid="verify-config-btn"
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        {configVerified ? <CheckCircle className="mr-2 w-4 h-4" /> : null}
                        {configVerified ? 'Verified' : 'Save & Verify'}
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={handleAssessment}
                    disabled={loading}
                    className="bg-emerald-600 hover:bg-emerald-700"
                    data-testid="run-assessment-btn"
                  ></Button>
                  
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review & Confirm */}
          {step === 5 && (
            <div className="space-y-6" data-testid="review-step">
              <Alert className="border-amber-200 bg-amber-50/50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-900">
                  Review your configuration before starting the migration
                </AlertDescription>
              </Alert>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-blue-200/50 bg-blue-50/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Source: Apigee Edge
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Organization:</span>
                      <span className="font-semibold">{edgeData.orgId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Environment:</span>
                      <span className="font-semibold">{edgeData.env}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Resources:</span>
                      <Badge>{getTotalResourceCount()} items</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-emerald-200/50 bg-emerald-50/20">
  <CardHeader>
    <CardTitle className="text-lg flex items-center gap-2">
      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
      Target: Apigee X
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-2 text-sm">
    <div className="flex justify-between">
      <span className="text-slate-600">Organization:</span>
      <span className="font-semibold">{apigeeXData.apigeex_org_name}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-slate-600">Environment:</span>
      <span className="font-semibold">{apigeeXData.apigeex_env}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-slate-600">Project ID:</span>
      <span className="font-semibold text-xs">{apigeeXData.projectId}</span>
    </div>
  </CardContent>
</Card>

              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2">Migration Process:</h4>
                <ol className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Export resources from Apigee Edge
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Transform policies and configurations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Import to Apigee X
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Validate migration
                  </li>
                </ol>
              </div>

              <div className="flex justify-between gap-3">
                <Button variant="outline" onClick={() => setStep(4)} data-testid="back-to-assessment-btn">
                  Back to Assessment
                </Button>
                <Button 
                  onClick={handleStartMigration}
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700"
                  data-testid="start-migration-final-btn"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Starting Migration...
                    </>
                  ) : (
                    <>
                      Start Migration
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
