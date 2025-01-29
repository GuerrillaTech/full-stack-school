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
  AssessmentInfrastructureService, 
  AssessmentType, 
  DifficultyLevel 
} from '@/lib/assessment/assessment-infrastructure-service';
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

export function AssessmentInfrastructureDashboard() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null);
  const [assessmentInsights, setAssessmentInsights] = useState<any>(null);
  const [studentPerformance, setStudentPerformance] = useState<any>(null);

  const assessmentService = new AssessmentInfrastructureService();

  // Fetch assessments on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // TODO: Implement method to fetch all assessments
        const fetchedAssessments = [
          { id: '1', title: 'Mathematics Diagnostic', type: 'DIAGNOSTIC' },
          { id: '2', title: 'Science Formative', type: 'FORMATIVE' },
          { id: '3', title: 'Performance-Based Assessment', type: 'PERFORMANCE_BASED' },
        ];
        setAssessments(fetchedAssessments);
      } catch (error) {
        toast.error('Failed to fetch initial assessment data');
      }
    };

    fetchInitialData();
  }, []);

  // Generate Assessment Insights
  const generateAssessmentInsights = async () => {
    if (!selectedAssessment) {
      toast.error('Please select an assessment');
      return;
    }

    try {
      const insights = await assessmentService.generateAssessmentInsights(
        selectedAssessment
      );
      setAssessmentInsights(insights);
      toast.success('Assessment insights generated successfully');
    } catch (error) {
      toast.error('Failed to generate assessment insights');
    }
  };

  // Performance Distribution Chart
  const renderPerformanceDistributionChart = () => {
    if (!assessmentInsights?.overallPerformance) return null;

    const performanceData = [
      { 
        level: 'High Performers', 
        count: assessmentInsights.overallPerformance.highPerformers || 0 
      },
      { 
        level: 'Mid-Level Performers', 
        count: assessmentInsights.overallPerformance.midPerformers || 0 
      },
      { 
        level: 'Low Performers', 
        count: assessmentInsights.overallPerformance.lowPerformers || 0 
      }
    ];

    const COLORS = ['#00C49F', '#FFBB28', '#FF8042'];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={performanceData}
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
            {performanceData.map((entry, index) => (
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

  // Learning Gap Analysis Chart
  const renderLearningGapAnalysisChart = () => {
    if (!assessmentInsights?.learningGapAnalysis) return null;

    const gapData = Object.entries(assessmentInsights.learningGapAnalysis).map(
      ([topic, gap]) => ({ topic, gap })
    );

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={gapData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="topic" />
          <YAxis label={{ value: 'Learning Gap', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar 
            dataKey="gap" 
            fill="#8884d8" 
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Recommended Interventions
  const renderRecommendedInterventions = () => {
    if (!assessmentInsights?.recommendedInterventions) return null;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recommended Interventions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assessmentInsights.recommendedInterventions.map((intervention, index) => (
              <div key={index} className="border p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">{intervention.name}</h4>
                  <Badge variant="outline">{intervention.type}</Badge>
                </div>
                <p className="text-muted-foreground mt-2">{intervention.description}</p>
                <div className="mt-2">
                  <p>Estimated Impact</p>
                  <Progress value={intervention.estimatedImpact * 10} />
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
        <h2 className="text-2xl font-bold">Assessment Infrastructure Dashboard</h2>
        <div className="flex space-x-4">
          <Select onValueChange={setSelectedAssessment}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select Assessment" />
            </SelectTrigger>
            <SelectContent>
              {assessments.map(assessment => (
                <SelectItem key={assessment.id} value={assessment.id}>
                  {assessment.title} ({assessment.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={generateAssessmentInsights}
            disabled={!selectedAssessment}
          >
            Generate Insights
          </Button>
        </div>
      </div>

      {/* Performance Analysis */}
      {assessmentInsights && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {renderPerformanceDistributionChart()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Learning Gap Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {renderLearningGapAnalysisChart()}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recommended Interventions */}
      {assessmentInsights && renderRecommendedInterventions()}
    </div>
  );
}
