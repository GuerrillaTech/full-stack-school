'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { EquityMetricsService, DiversityCategory } from '@/lib/equity/equity-metrics-service';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { toast } from 'react-toastify';

export function EquityDashboard() {
  const [diversityMetrics, setDiversityMetrics] = useState([]);
  const [inclusionScore, setInclusionScore] = useState(null);
  const [interventions, setInterventions] = useState([]);
  const [historicalTrends, setHistoricalTrends] = useState({});

  const equityService = new EquityMetricsService();

  useEffect(() => {
    const fetchEquityData = async () => {
      try {
        const metrics = await equityService.calculateDiversityMetrics();
        const score = await equityService.calculateInclusionScore();
        const recommendedInterventions = await equityService.generateInclusionInterventions();
        const trends = await equityService.analyzeInclusionTrends();

        setDiversityMetrics(metrics);
        setInclusionScore(score);
        setInterventions(recommendedInterventions);
        setHistoricalTrends(trends);
      } catch (error) {
        toast.error('Failed to fetch equity metrics');
      }
    };

    fetchEquityData();
  }, []);

  const renderDiversityChart = () => {
    const chartData = diversityMetrics.map(metric => ({
      category: metric.category,
      representation: metric.representation * 100,
      benchmarkComparison: metric.benchmarkComparison * 100
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis label={{ value: 'Representation (%)', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="representation" fill="#8884d8" name="Current Representation" />
          <Bar dataKey="benchmarkComparison" fill="#82ca9d" name="Benchmark Comparison" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderInclusionScoreBreakdown = () => {
    if (!inclusionScore) return null;

    return (
      <div className="space-y-4">
        {Object.entries(inclusionScore.subScores).map(([key, value]) => (
          <div key={key} className="flex items-center space-x-4">
            <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
            <Progress value={value} className="flex-1" />
            <Badge variant="secondary">{value.toFixed(1)}%</Badge>
          </div>
        ))}
      </div>
    );
  };

  const openInterventionDialog = () => {
    Dialog.open({
      title: 'Recommended Inclusion Interventions',
      content: (
        <div>
          <h3>Proposed Actions to Improve Equity</h3>
          <ul className="space-y-2">
            {interventions.map((intervention, index) => (
              <li key={index} className="flex items-center space-x-2">
                <Badge variant="outline">Intervention {index + 1}</Badge>
                <span>{intervention}</span>
              </li>
            ))}
          </ul>
        </div>
      )
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Equity and Inclusion Dashboard</h2>
        <Button onClick={openInterventionDialog} variant="outline">
          View Interventions
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Diversity Representation Card */}
        <Card>
          <CardHeader>
            <CardTitle>Diversity Representation</CardTitle>
          </CardHeader>
          <CardContent>
            {renderDiversityChart()}
          </CardContent>
        </Card>

        {/* Inclusion Score Card */}
        <Card>
          <CardHeader>
            <CardTitle>Inclusion Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Overall Inclusion Score</span>
                <Badge variant={
                  inclusionScore?.overallScore > 75 
                    ? 'default' 
                    : inclusionScore?.overallScore > 50 
                      ? 'secondary' 
                      : 'destructive'
                }>
                  {inclusionScore?.overallScore.toFixed(1)}%
                </Badge>
              </div>
              {renderInclusionScoreBreakdown()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
