'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  BlockchainCredentialVerificationService, 
  CredentialType,
  VerificationStatus 
} from '@/lib/credential/blockchain-credential-verification-service';
import { 
  RadarChart, 
  BarChart, 
  NetworkGraph,
  TimelineChart 
} from '@/components/charts';
import { toast } from 'react-toastify';

export function BlockchainCredentialVerificationDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [credentials, setCredentials] = useState([]);
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [credentialDetails, setCredentialDetails] = useState(null);
  const [networkAnalysis, setNetworkAnalysis] = useState(null);

  const credentialService = new BlockchainCredentialVerificationService();

  useEffect(() => {
    fetchCredentials();
  }, []);

  useEffect(() => {
    if (selectedCredential) {
      fetchCredentialDetails();
    }
  }, [selectedCredential]);

  const fetchCredentials = async () => {
    try {
      const organizationId = 'current-organization-id'; // Replace with actual logic
      const fetchedCredentials = await credentialService.generateCredentialAuditTrail(
        organizationId
      );
      
      setCredentials(fetchedCredentials.credentials);
      setSelectedCredential(fetchedCredentials.credentials[0]?.id);
      setNetworkAnalysis(fetchedCredentials.networkAnalysis);
    } catch (error) {
      toast.error('Failed to fetch credentials');
    }
  };

  const fetchCredentialDetails = async () => {
    try {
      const verificationResult = await credentialService.verifyCredential(
        selectedCredential
      );
      
      setCredentialDetails(verificationResult);
    } catch (error) {
      toast.error('Failed to fetch credential details');
    }
  };

  const renderCredentialOverview = () => {
    if (!credentialDetails) return null;

    const { credential, blockchainVerification, aiVerificationAnalysis } = credentialDetails;

    return (
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Credential Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <RadarChart 
              data={{
                labels: [
                  'Blockchain Verification', 
                  'Institutional Credibility', 
                  'Fraud Risk', 
                  'Contextual Validity'
                ],
                datasets: [{
                  label: 'Verification Metrics',
                  data: [
                    blockchainVerification ? 1 : 0,
                    aiVerificationAnalysis?.institutionalCredibility || 0,
                    1 - (aiVerificationAnalysis?.fraudRisk || 0),
                    aiVerificationAnalysis?.contextualValidity || 0
                  ]
                }]
              }}
            />
            <div className="mt-4 text-center">
              <Badge 
                variant={
                  blockchainVerification ? 'default' : 'destructive'
                }
              >
                Blockchain Verification: 
                {blockchainVerification ? 'Verified' : 'Rejected'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credential Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="bg-gray-100 p-2 rounded">
                <strong>Holder:</strong> {credential.holderDid}
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <strong>Institution:</strong> {credential.institutionDid}
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <strong>Type:</strong> {credential.credentialType}
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <strong>Title:</strong> {credential.title}
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <strong>Issued:</strong> {new Date(credential.issuedDate).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Verification Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {aiVerificationAnalysis && 
                Object.entries(aiVerificationAnalysis).map(([key, value]) => (
                  <div key={key} className="bg-gray-100 p-2 rounded">
                    <strong>{key}:</strong> {String(value)}
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCredentialNetwork = () => {
    if (!networkAnalysis) return null;

    return (
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Credential Verification Network</CardTitle>
          </CardHeader>
          <CardContent>
            <NetworkGraph 
              data={{
                nodes: credentials.map(credential => ({
                  id: credential.id,
                  label: credential.holderDid,
                  size: credential.verificationStatus === VerificationStatus.VERIFIED ? 1 : 0.5
                })),
                edges: networkAnalysis.networkConnections || []
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credential Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={{
                labels: Object.values(CredentialType),
                datasets: [{
                  label: 'Credentials per Type',
                  data: Object.values(CredentialType).map(type => 
                    credentials.filter(c => c.credentialType === type).length
                  )
                }]
              }}
            />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Verification Network Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {networkAnalysis.networkInsights && 
                Object.entries(networkAnalysis.networkInsights).map(
                  ([key, value]) => (
                    <div key={key} className="bg-gray-100 p-2 rounded">
                      <strong>{key}:</strong> {String(value)}
                    </div>
                  )
                )
              }
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCredentialAuditTrail = () => {
    if (!credentialDetails) return null;

    const { transactionHistory, auditTrailAnalysis } = credentialDetails;

    return (
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Credential Transaction Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <TimelineChart 
              data={{
                events: transactionHistory.map(transaction => ({
                  timestamp: transaction.timestamp,
                  type: transaction.type,
                  description: transaction.description
                }))
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verification Events</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {transactionHistory.map((event, index) => (
                <li 
                  key={index} 
                  className="bg-gray-100 p-2 rounded flex justify-between"
                >
                  <span>{event.description}</span>
                  <Badge variant="outline">{event.type}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Audit Trail Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {auditTrailAnalysis && 
                Object.entries(auditTrailAnalysis).map(([key, value]) => (
                  <div key={key} className="bg-gray-100 p-2 rounded">
                    <strong>{key}:</strong> {String(value)}
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Blockchain Credential Verification</CardTitle>
          <CardDescription>
            Secure, transparent, and tamper-proof academic credential management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <select
              value={selectedCredential || ''}
              onChange={(e) => setSelectedCredential(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {credentials.map(credential => (
                <option key={credential.id} value={credential.id}>
                  {credential.title}
                </option>
              ))}
            </select>
            <Button onClick={fetchCredentialDetails}>
              Verify Credential
            </Button>
          </div>

          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
          >
            <TabsList>
              <TabsTrigger value="overview">Credential Overview</TabsTrigger>
              <TabsTrigger value="network">Verification Network</TabsTrigger>
              <TabsTrigger value="audit-trail">Audit Trail</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              {renderCredentialOverview()}
            </TabsContent>
            
            <TabsContent value="network">
              {renderCredentialNetwork()}
            </TabsContent>
            
            <TabsContent value="audit-trail">
              {renderCredentialAuditTrail()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
