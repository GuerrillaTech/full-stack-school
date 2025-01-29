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
  EthicalStandardComplianceService, 
  EthicalStandardCategory,
  ComplianceStatus 
} from '@/lib/ethics/ethical-standard-compliance-service';
import { 
  RadarChart, 
  BarChart, 
  NetworkGraph,
  TimelineChart 
} from '@/components/charts';
import { toast } from 'react-toastify';

export function EthicalStandardComplianceDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [ethicalStandards, setEthicalStandards] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [complianceReport, setComplianceReport] = useState(null);
  const [selectedStandard, setSelectedStandard] = useState(null);
  const [standardDetails, setStandardDetails] = useState(null);

  const complianceService = new EthicalStandardComplianceService();

  useEffect(() => {
    fetchComplianceReport();
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedStandard) {
      fetchStandardDetails();
    }
  }, [selectedStandard]);

  const fetchComplianceReport = async () => {
    try {
      const organizationId = 'current-organization-id'; // Replace with actual logic
      const reportResult = await complianceService.generateComplianceReport(
        organizationId,
        selectedCategory
      );
      
      setEthicalStandards(reportResult.ethicalStandards);
      setComplianceReport(reportResult.complianceReport);
    } catch (error) {
      toast.error('Failed to fetch compliance report');
    }
  };

  const fetchStandardDetails = async () => {
    try {
      const assessmentResult = await complianceService.assessEthicalStandardCompliance(
        selectedStandard
      );
      
      setStandardDetails(assessmentResult);
    } catch (error) {
      toast.error('Failed to fetch standard details');
    }
  };

  const renderComplianceOverview = () => {
    if (!complianceReport) return null;

    return (
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Ethical Compliance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <RadarChart 
              data={{
                labels: [
                  'Data Privacy', 
                  'AI Fairness', 
                  'Algorithmic Transparency', 
                  'Technological Impact'
                ],
                datasets: [{
                  label: 'Compliance Metrics',
                  data: [
                    complianceReport?.dataPrivacyCompliance || 0,
                    complianceReport?.aiFairnessCompliance || 0,
                    complianceReport?.algorithmicTransparencyCompliance || 0,
                    complianceReport?.technologicalImpactCompliance || 0
                  ]
                }]
              }}
            />
            <div className="mt-4 text-center">
              <Badge variant={
                complianceReport?.overallComplianceScore > 0.7 
                  ? 'default' 
                  : 'destructive'
              }>
                Overall Compliance: {(complianceReport?.overallComplianceScore * 100).toFixed(2)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={{
                labels: Object.values(ComplianceStatus),
                datasets: [{
                  label: 'Standards per Compliance Status',
                  data: Object.values(ComplianceStatus).map(status => 
                    ethicalStandards.filter(s => s.status === status).length
                  )
                }]
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ethical Standard Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={{
                labels: Object.values(EthicalStandardCategory),
                datasets: [{
                  label: 'Standards per Category',
                  data: Object.values(EthicalStandardCategory).map(category => 
                    ethicalStandards.filter(s => s.category === category).length
                  )
                }]
              }}
            />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Compliance Report Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {complianceReport && 
                Object.entries(complianceReport).map(([key, value]) => (
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

  const renderStandardDetails = () => {
    if (!standardDetails) return null;

    const { 
      ethicalStandard, 
      compliancePrediction,
      complianceAnalysis 
    } = standardDetails;

    return (
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Standard Compliance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <RadarChart 
              data={{
                labels: [
                  'Compliance Score', 
                  'Risk Assessment', 
                  'Improvement Potential', 
                  'Contextual Alignment'
                ],
                datasets: [{
                  label: 'Compliance Metrics',
                  data: [
                    compliancePrediction.score,
                    complianceAnalysis?.riskAssessment || 0,
                    complianceAnalysis?.improvementPotential || 0,
                    complianceAnalysis?.contextualAlignment || 0
                  ]
                }]
              }}
            />
            <div className="mt-4 text-center">
              <Badge variant={
                compliancePrediction.status === ComplianceStatus.COMPLIANT 
                  ? 'default' 
                  : 'destructive'
              }>
                Status: {compliancePrediction.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Standard Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="bg-gray-100 p-2 rounded">
                <strong>Category:</strong> {ethicalStandard.category}
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <strong>Name:</strong> {ethicalStandard.standardName}
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <strong>Description:</strong> {ethicalStandard.description}
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <strong>Compliance Requirements:</strong>
                {ethicalStandard.complianceRequirements}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {complianceAnalysis && 
                Object.entries(complianceAnalysis).map(([key, value]) => (
                  <div key={key} className="bg-gray-100 p-2 rounded">
                    <strong>{key}:</strong> {String(value)}
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Improvement Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {complianceAnalysis?.recommendations && 
                Object.entries(complianceAnalysis.recommendations).map(([key, value]) => (
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

  const renderComplianceNetwork = () => {
    return (
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Ethical Standard Compliance Network</CardTitle>
          </CardHeader>
          <CardContent>
            <NetworkGraph 
              data={{
                nodes: ethicalStandards.map(standard => ({
                  id: standard.id,
                  label: standard.standardName,
                  size: standard.status === ComplianceStatus.COMPLIANT ? 1 : 0.5
                })),
                edges: ethicalStandards
                  .filter(s => s.status === ComplianceStatus.COMPLIANT)
                  .map((standard, index) => ({
                    source: standard.id,
                    target: ethicalStandards[index + 1]?.id
                  }))
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Trend Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <TimelineChart 
              data={{
                events: ethicalStandards.map(standard => ({
                  timestamp: standard.createdAt,
                  type: standard.status,
                  description: standard.standardName
                }))
              }}
            />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Ethical Standard Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {complianceReport?.networkInsights && 
                Object.entries(complianceReport.networkInsights).map(([key, value]) => (
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
          <CardTitle>Ethical Standard Compliance Tracking</CardTitle>
          <CardDescription>
            Advanced ethical governance and compliance management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">All Categories</option>
              {Object.values(EthicalStandardCategory).map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              value={selectedStandard || ''}
              onChange={(e) => setSelectedStandard(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Standard</option>
              {ethicalStandards.map(standard => (
                <option key={standard.id} value={standard.id}>
                  {standard.standardName} - {standard.status}
                </option>
              ))}
            </select>
          </div>

          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
          >
            <TabsList>
              <TabsTrigger value="overview">Compliance Overview</TabsTrigger>
              <TabsTrigger value="standard-details">Standard Details</TabsTrigger>
              <TabsTrigger value="compliance-network">Compliance Network</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              {renderComplianceOverview()}
            </TabsContent>
            
            <TabsContent value="standard-details">
              {renderStandardDetails()}
            </TabsContent>
            
            <TabsContent value="compliance-network">
              {renderComplianceNetwork()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
