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
  InterventionPlanningService, 
  InterventionType, 
  InterventionOutcome 
} from '@/lib/intervention/intervention-planning-service';
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

export function InterventionPlanningDashboard() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [interventionStrategy, setInterventionStrategy] = useState<any>(null);
  const [interventionProgress, setInterventionProgress] = useState<any>(null);
  const [outcomeAnalysis, setOutcomeAnalysis] = useState<any>(null);

  const interventionPlanningService = new InterventionPlanningService();

  // Fetch students and outcome analysis on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // TODO: Implement method to fetch all students
        const fetchedStudents = [
          { id: '1', name: 'Alice Johnson', grade: '10' },
          { id: '2', name: 'Bob Smith', grade: '11' },
          { id: '3', name: 'Charlie Brown', grade: '9' },
        ];
        setStudents(fetchedStudents);

        // Fetch outcome analysis
        const analysis = await interventionPlanningService.analyzeInterventionOutcomes();
        setOutcomeAnalysis(analysis);
      } catch (error) {
        toast.error('Failed to fetch initial data');
      }
    };

    fetchInitialData();
  }, []);

  // Generate Intervention Strategy
  const generateInterventionStrategy = async (riskCategory: string) => {
    if (!selectedStudent) {
      toast.error('Please select a student');
      return;
    }

    try {
      const strategy = await interventionPlanningService.generateInterventionStrategy(
        selectedStudent, 
        riskCategory
      );
      setInterventionStrategy(strategy);
      toast.success('Intervention strategy generated successfully');
    } catch (error) {
      toast.error('Failed to generate intervention strategy');
    }
  };

  // Track Intervention Progress
  const trackInterventionProgress = async () => {
    if (!interventionStrategy) {
      toast.error('No intervention strategy available');
      return;
    }

    try {
      const progress = await interventionPlanningService.trackInterventionProgress(
        interventionStrategy.id
      );
      setInterventionProgress(progress);
    } catch (error) {
      toast.error('Failed to track intervention progress');
    }
  };

  // Optimize Intervention Strategy
  const optimizeInterventionStrategy = async () => {
    if (!interventionStrategy) {
      toast.error('No intervention strategy available');
      return;
    }

    try {
      const optimizedStrategy = await interventionPlanningService.optimizeInterventionStrategy(
        interventionStrategy.id
      );
      setInterventionStrategy(optimizedStrategy);
      toast.success('Intervention strategy optimized successfully');
    } catch (error) {
      toast.error('Failed to optimize intervention strategy');
    }
  };

  // Outcome Distribution Chart
  const renderOutcomeDistributionChart = () => {
    if (!outcomeAnalysis?.outcomeDistribution) return null;

    const data = Object.entries(outcomeAnalysis.outcomeDistribution).map(
      ([outcome, count]) => ({ outcome, count })
    );

    const COLORS = ['#00C49F', '#FFBB28', '#FF8042'];

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

  // Risk Category Effectiveness Chart
  const renderRiskCategoryEffectivenessChart = () => {
    if (!outcomeAnalysis?.riskCategoryEffectiveness) return null;

    const data = Object.entries(outcomeAnalysis.riskCategoryEffectiveness).map(
      ([category, data]) => ({
        category, 
        totalInterventions: data.totalInterventions,
        averageProgress: data.averageProgressPercentage
      })
    );

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis label={{ value: 'Average Progress %', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="totalInterventions" fill="#8884d8" name="Total Interventions" />
          <Bar dataKey="averageProgress" fill="#82ca9d" name="Average Progress %" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Intervention Strategy Details
  const renderInterventionStrategyDetails = () => {
    if (!interventionStrategy) return null;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Intervention Strategy Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">Basic Information</h4>
              <p><strong>Risk Category:</strong> {interventionStrategy.riskCategory}</p>
              <p><strong>Intervention Type:</strong> {interventionStrategy.interventionType}</p>
              <p><strong>Start Date:</strong> {new Date(interventionStrategy.startDate).toLocaleDateString()}</p>
              <p><strong>Expected Duration:</strong> {interventionStrategy.expectedDuration} weeks</p>
            </div>
            <div>
              <h4 className="font-semibold">Strategy Details</h4>
              <p><strong>Description:</strong> {interventionStrategy.description}</p>
              <h4 className="font-semibold mt-2">Target Outcomes</h4>
              <ul className="list-disc pl-5">
                {interventionStrategy.targetOutcomes.map((outcome, idx) => (
                  <li key={idx}>{outcome}</li>
                ))}
              </ul>
            </div>
          </div>

          {interventionProgress && (
            <div className="mt-4">
              <h4 className="font-semibold">Progress Tracking</h4>
              <Progress 
                value={interventionProgress.progressPercentage} 
                className="mt-2" 
              />
              <div className="mt-2">
                <p><strong>Current Phase:</strong> {interventionProgress.currentPhase}</p>
                <h4 className="font-semibold mt-2">Milestones</h4>
                <div className="space-y-2">
                  {interventionProgress.milestones.map((milestone, idx) => (
                    <div key={idx} className="flex items-center">
                      <Badge 
                        variant={milestone.completed ? 'default' : 'outline'}
                      >
                        {milestone.name}
                      </Badge>
                      {milestone.completed && (
                        <span className="ml-2 text-sm text-muted-foreground">
                          {new Date(milestone.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Intervention Planning Dashboard</h2>
        <Select onValueChange={setSelectedStudent}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select Student" />
          </SelectTrigger>
          <SelectContent>
            {students.map(student => (
              <SelectItem key={student.id} value={student.id}>
                {student.name} (Grade {student.grade})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Outcome Analysis Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Intervention Outcome Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {renderOutcomeDistributionChart()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Category Effectiveness</CardTitle>
          </CardHeader>
          <CardContent>
            {renderRiskCategoryEffectivenessChart()}
          </CardContent>
        </Card>
      </div>

      {/* Intervention Strategy Generation */}
      {selectedStudent && (
        <div className="mt-6 space-y-4">
          <div className="flex space-x-4">
            {Object.values(RiskCategory).map(category => (
              <Button 
                key={category} 
                variant="outline"
                onClick={() => generateInterventionStrategy(category)}
              >
                Generate {category} Intervention
              </Button>
            ))}
          </div>

          {/* Intervention Strategy Details */}
          {interventionStrategy && renderInterventionStrategyDetails()}

          {/* Intervention Strategy Actions */}
          {interventionStrategy && (
            <div className="mt-4 flex space-x-4 justify-end">
              <Button onClick={trackInterventionProgress}>
                Track Progress
              </Button>
              <Button 
                variant="secondary" 
                onClick={optimizeInterventionStrategy}
              >
                Optimize Strategy
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
