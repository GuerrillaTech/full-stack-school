'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  ResearchIntegrationService, 
  ResearchDomain, 
  ResearchStatus 
} from '@/lib/research/research-integration-service';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'react-toastify';

export function ResearchIntegrationDashboard() {
  const [researchers, setResearchers] = useState<any[]>([]);
  const [selectedResearcher, setSelectedResearcher] = useState<string | null>(null);
  const [researchImpact, setResearchImpact] = useState<any>(null);
  const [collaborationOpportunities, setCollaborationOpportunities] = useState<any[]>([]);

  const researchService = new ResearchIntegrationService();

  // Fetch researchers and research impact on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // TODO: Implement method to fetch all researchers
        const fetchedResearchers = [
          { id: '1', name: 'Dr. Emily Chen', department: 'Education Technology' },
          { id: '2', name: 'Prof. Michael Rodriguez', department: 'Learning Sciences' },
          { id: '3', name: 'Dr. Sarah Kim', department: 'Pedagogical Innovation' },
        ];
        setResearchers(fetchedResearchers);

        // Fetch research impact analysis
        const impact = await researchService.analyzeResearchImpact();
        setResearchImpact(impact);
      } catch (error) {
        toast.error('Failed to fetch initial research data');
      }
    };

    fetchInitialData();
  }, []);

  // Find Research Collaboration Opportunities
  const findCollaborationOpportunities = async () => {
    if (!selectedResearcher) {
      toast.error('Please select a researcher');
      return;
    }

    try {
      const opportunities = await researchService.recommendResearchCollaborations(
        selectedResearcher
      );
      setCollaborationOpportunities(opportunities);
      toast.success('Research collaboration opportunities generated');
    } catch (error) {
      toast.error('Failed to find collaboration opportunities');
    }
  };

  // Research Domain Distribution Chart
  const renderDomainDistributionChart = () => {
    if (!researchImpact?.domainDistribution) return null;

    const data = Object.entries(researchImpact.domainDistribution).map(
      ([domain, count]) => ({ domain, count })
    );

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
            label={({ name, percent }) => 
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // Collaboration Metrics Chart
  const renderCollaborationMetricsChart = () => {
    if (!researchImpact?.collaborationMetrics) return null;

    const data = [
      { 
        metric: 'Interdisciplinary Projects', 
        value: researchImpact.collaborationMetrics.interdisciplinaryProjects 
      },
      { 
        metric: 'Student Involvement', 
        value: researchImpact.collaborationMetrics.studentInvolvement 
      },
      { 
        metric: 'External Partnerships', 
        value: researchImpact.collaborationMetrics.externalPartnerships 
      }
    ];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="metric" />
          <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar 
            dataKey="value" 
            fill={(data) => {
              switch (data.metric) {
                case 'Interdisciplinary Projects': return '#0088FE';
                case 'Student Involvement': return '#00C49F';
                case 'External Partnerships': return '#FFBB28';
                default: return '#8884D8';
              }
            }} 
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Collaboration Opportunities
  const renderCollaborationOpportunities = () => {
    if (!collaborationOpportunities.length) return null;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Research Collaboration Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {collaborationOpportunities.map((opportunity, index) => (
              <div key={index} className="border p-4 rounded-lg">
                <h4 className="font-semibold">{opportunity.title}</h4>
                <p className="text-muted-foreground">{opportunity.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <Badge variant="outline">{opportunity.domain}</Badge>
                  <Button size="sm" variant="outline">
                    Explore Opportunity
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Research Integration Dashboard</h2>
        <div className="flex space-x-4">
          <Select onValueChange={setSelectedResearcher}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select Researcher" />
            </SelectTrigger>
            <SelectContent>
              {researchers.map(researcher => (
                <SelectItem key={researcher.id} value={researcher.id}>
                  {researcher.name} ({researcher.department})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={findCollaborationOpportunities}
            disabled={!selectedResearcher}
          >
            Find Collaboration Opportunities
          </Button>
        </div>
      </div>

      {/* Research Impact Analysis */}
      {researchImpact && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Research Domain Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {renderDomainDistributionChart()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Collaboration Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              {renderCollaborationMetricsChart()}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Collaboration Opportunities */}
      {collaborationOpportunities.length > 0 && 
        renderCollaborationOpportunities()}
    </div>
  );
}
