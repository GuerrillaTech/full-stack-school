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
  CrossOrganizationalInsightsService 
} from '@/lib/partnership/cross-organizational-insights-service';
import { 
  BarChart, 
  LineChart, 
  RadarChart, 
  ScatterPlot 
} from '@/components/charts';
import { toast } from 'react-toastify';

export function CrossOrganizationalInsightsDashboard() {
  const [activeTab, setActiveTab] = useState('innovation');
  const [insightsData, setInsightsData] = useState({});
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [organizations, setOrganizations] = useState([]);

  const insightsService = new CrossOrganizationalInsightsService();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrganization) {
      fetchCrossOrganizationalInsights();
    }
  }, [selectedOrganization]);

  const fetchOrganizations = async () => {
    try {
      const orgs = await insightsService.fetchOrganizations();
      setOrganizations(orgs);
      setSelectedOrganization(orgs[0]?.id);
    } catch (error) {
      toast.error('Failed to fetch organizations');
    }
  };

  const fetchCrossOrganizationalInsights = async () => {
    try {
      const insights = await insightsService.generateCrossOrganizationalInsights({
        organizationId: selectedOrganization,
        analysisScopes: [
          'TECHNOLOGICAL_INNOVATION',
          'RESEARCH_COLLABORATION',
          'SKILL_DEVELOPMENT',
          'MARKET_TRENDS',
          'TALENT_ACQUISITION',
          'STRATEGIC_ALIGNMENT'
        ],
        timeframe: {
          start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          end: new Date()
        },
        depth: 'INTERMEDIATE'
      });

      setInsightsData(insights);
    } catch (error) {
      toast.error('Failed to generate cross-organizational insights');
    }
  };

  const renderInsightTab = (type: string) => {
    const data = insightsData[type];

    switch (type) {
      case 'technologicalInnovation':
        return (
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Research Projects</CardTitle>
                <CardDescription>
                  Innovation Metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart 
                  data={{
                    labels: ['Research Projects', 'Publications', 'Patents'],
                    datasets: [{
                      label: 'Count',
                      data: [
                        data?.researchProjectCount || 0,
                        data?.publicationCount || 0,
                        data?.patentCount || 0
                      ]
                    }]
                  }} 
                />
                <div className="mt-4">
                  <Badge>
                    Innovation Score: {data?.innovationScore?.toFixed(2) || 'N/A'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Innovation Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart 
                  data={{
                    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                    datasets: [{
                      label: 'Innovation Potential',
                      data: [0.6, 0.7, 0.8, 0.9]
                    }]
                  }}
                />
              </CardContent>
            </Card>
          </div>
        );
      case 'researchCollaboration':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Research Collaboration Network</CardTitle>
            </CardHeader>
            <CardContent>
              <ScatterPlot 
                data={{
                  datasets: [{
                    label: 'Collaboration Intensity',
                    data: [
                      { x: data?.collaborationCount || 0, y: data?.partnerDiversity || 0 }
                    ]
                  }]
                }}
              />
              <div className="mt-4">
                <Badge>
                  Collaboration Intensity: {data?.collaborationIntensity?.toFixed(2) || 'N/A'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      case 'skillDevelopment':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Skill Development Landscape</CardTitle>
            </CardHeader>
            <CardContent>
              <RadarChart 
                data={{
                  labels: ['Programs', 'Participants', 'Skill Tracks'],
                  datasets: [{
                    label: 'Skill Development',
                    data: [
                      data?.programCount || 0,
                      data?.participantCount || 0,
                      data?.skillTrackCount || 0
                    ]
                  }]
                }}
              />
              <div className="mt-4">
                <Badge>
                  Skill Diversity Score: {data?.skillDiversityScore?.toFixed(2) || 'N/A'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      case 'marketTrends':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Market Research Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart 
                data={{
                  labels: ['Market Research Count'],
                  datasets: [{
                    label: 'Research Volume',
                    data: [data?.researchCount || 0]
                  }]
                }}
              />
              <div className="mt-4">
                <Badge>
                  Trend Alignment Score: {data?.trendAlignmentScore?.toFixed(2) || 'N/A'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      case 'talentAcquisition':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Talent Acquisition Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart 
                data={{
                  labels: ['Hiring Count'],
                  datasets: [{
                    label: 'Talent Acquisition',
                    data: [data?.hiringCount || 0]
                  }]
                }}
              />
              <div className="mt-4">
                <Badge>
                  Talent Pool Quality: {data?.talentPoolQuality?.toFixed(2) || 'N/A'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      case 'strategicAlignment':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Strategic Initiatives</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart 
                data={{
                  labels: ['Strategic Initiatives'],
                  datasets: [{
                    label: 'Initiative Count',
                    data: [data?.initiativeCount || 0]
                  }]
                }}
              />
              <div className="mt-4">
                <Badge>
                  Strategic Alignment Score: {data?.alignmentScore?.toFixed(2) || 'N/A'}
                </Badge>
              </div>
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
          <CardTitle>Cross-Organizational Insights</CardTitle>
          <CardDescription>
            Comprehensive analytics across organizational boundaries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <select
              value={selectedOrganization || ''}
              onChange={(e) => setSelectedOrganization(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {organizations.map(org => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
            <Button onClick={fetchCrossOrganizationalInsights}>
              Refresh Insights
            </Button>
          </div>

          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
          >
            <TabsList>
              <TabsTrigger value="innovation">Innovation</TabsTrigger>
              <TabsTrigger value="collaboration">Research Collaboration</TabsTrigger>
              <TabsTrigger value="skills">Skill Development</TabsTrigger>
              <TabsTrigger value="market">Market Trends</TabsTrigger>
              <TabsTrigger value="talent">Talent Acquisition</TabsTrigger>
              <TabsTrigger value="strategy">Strategic Alignment</TabsTrigger>
            </TabsList>
            
            {[
              'technologicalInnovation', 
              'researchCollaboration', 
              'skillDevelopment', 
              'marketTrends', 
              'talentAcquisition', 
              'strategicAlignment'
            ].map(type => (
              <TabsContent key={type} value={type.replace(/([A-Z])/g, match => match.toLowerCase())}>
                {renderInsightTab(type)}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {insightsData.aiGeneratedInsights && (
        <Card>
          <CardHeader>
            <CardTitle>AI-Generated Strategic Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(insightsData.aiGeneratedInsights).map(([key, value]) => (
                <div key={key} className="bg-gray-100 p-3 rounded">
                  <strong>{key}:</strong> {String(value)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
