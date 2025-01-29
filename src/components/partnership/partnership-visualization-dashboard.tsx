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
  PartnershipVisualizationService 
} from '@/lib/partnership/partnership-visualization-service';
import { 
  PartnershipRiskAssessmentService, 
  RiskCategory 
} from '@/lib/partnership/partnership-risk-assessment-service';
import { 
  NetworkGraph, 
  SankeyDiagram, 
  HeatmapChart, 
  TimelineChart, 
  RadarChart 
} from '@/components/charts'; // Assume these are custom chart components
import { toast } from 'react-toastify';

export function PartnershipVisualizationDashboard() {
  const [activeTab, setActiveTab] = useState('network');
  const [visualizationData, setVisualizationData] = useState({});
  const [visualizationInsights, setVisualizationInsights] = useState(null);
  const [riskAssessment, setRiskAssessment] = useState(null);

  const visualizationService = new PartnershipVisualizationService();
  const riskAssessmentService = new PartnershipRiskAssessmentService();

  useEffect(() => {
    fetchVisualizationData();
    fetchRiskAssessment();
  }, []);

  const fetchVisualizationData = async () => {
    try {
      const organizationId = 'current-organization-id'; // Replace with actual logic

      const datasets = {
        network: await visualizationService.generatePartnershipNetworkGraph(
          organizationId, 
          { type: 'NETWORK', dimensions: [], metrics: [] }
        ),
        sankey: await visualizationService.generateKnowledgeTransferSankeyDiagram(
          organizationId
        ),
        heatmap: await visualizationService.generateCollaborationPerformanceHeatmap(
          organizationId
        ),
        timeline: await visualizationService.generateCollaborationTimeline(
          organizationId
        ),
        radar: await visualizationService.generatePartnershipRadarChart(
          organizationId
        )
      };

      setVisualizationData(datasets);

      // Generate AI insights for each visualization
      const insights = {};
      for (const [type, data] of Object.entries(datasets)) {
        insights[type] = await visualizationService.generateVisualizationInsights(
          type, 
          data
        );
      }
      setVisualizationInsights(insights);
    } catch (error) {
      toast.error('Failed to fetch visualization data');
    }
  };

  const fetchRiskAssessment = async () => {
    try {
      const organizationId = 'current-organization-id'; // Replace with actual logic
      const assessment = await riskAssessmentService.assessPartnershipRisks(
        organizationId
      );
      setRiskAssessment(assessment);
    } catch (error) {
      toast.error('Failed to assess partnership risks');
    }
  };

  const renderVisualizationTab = (type: string) => {
    const data = visualizationData[type];
    const insights = visualizationInsights?.[type];

    switch (type) {
      case 'network':
        return (
          <div className="grid grid-cols-3 gap-4">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Partnership Network Graph</CardTitle>
              </CardHeader>
              <CardContent>
                <NetworkGraph data={data} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>AI Insights</CardTitle>
              </CardHeader>
              <CardContent>
                {insights && (
                  <ul className="space-y-2">
                    {Object.entries(insights).map(([key, value]) => (
                      <li key={key}>
                        <strong>{key}:</strong> {String(value)}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        );
      case 'sankey':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Transfer Sankey Diagram</CardTitle>
            </CardHeader>
            <CardContent>
              <SankeyDiagram data={data} />
            </CardContent>
          </Card>
        );
      case 'heatmap':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Collaboration Performance Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <HeatmapChart data={data} />
            </CardContent>
          </Card>
        );
      case 'timeline':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Collaboration Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <TimelineChart data={data} />
            </CardContent>
          </Card>
        );
      case 'radar':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Partnership Radar Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <RadarChart data={data} />
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Partnership Analytics Visualization</CardTitle>
          <CardDescription>
            Explore comprehensive insights into your organizational partnerships
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
          >
            <TabsList>
              <TabsTrigger value="network">Network</TabsTrigger>
              <TabsTrigger value="sankey">Knowledge Transfer</TabsTrigger>
              <TabsTrigger value="heatmap">Performance</TabsTrigger>
              <TabsTrigger value="timeline">Collaboration Timeline</TabsTrigger>
              <TabsTrigger value="radar">Partnership Assessment</TabsTrigger>
            </TabsList>
            
            {Object.keys(visualizationData).map(type => (
              <TabsContent key={type} value={type}>
                {renderVisualizationTab(type)}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {riskAssessment && (
        <Card>
          <CardHeader>
            <CardTitle>Partnership Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {riskAssessment.riskPredictions.map(risk => (
                <Card key={risk.partnerId}>
                  <CardHeader>
                    <CardTitle>Partner Risk</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span>Risk Score:</span>
                      <Badge 
                        variant={
                          risk.riskCategory === RiskCategory.LOW 
                            ? 'default' 
                            : risk.riskCategory === RiskCategory.MODERATE 
                            ? 'outline' 
                            : 'destructive'
                        }
                      >
                        {risk.riskCategory}
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <strong>Score:</strong> {risk.riskScore.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
