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
import { RiskPredictionService } from '@/lib/risk-detection/risk-prediction-service';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';

export function RiskDashboard() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [riskPredictions, setRiskPredictions] = useState<any[]>([]);
  const [riskTrends, setRiskTrends] = useState<any>(null);

  const riskPredictionService = new RiskPredictionService();

  // Fetch students on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // TODO: Implement method to fetch all students
        const fetchedStudents = [
          { id: '1', name: 'Alice Johnson', grade: '10' },
          { id: '2', name: 'Bob Smith', grade: '11' },
          { id: '3', name: 'Charlie Brown', grade: '9' },
        ];
        setStudents(fetchedStudents);
      } catch (error) {
        toast.error('Failed to fetch students');
      }
    };

    fetchStudents();
    fetchRiskTrends();
  }, []);

  // Fetch risk predictions when a student is selected
  useEffect(() => {
    const fetchRiskPredictions = async () => {
      if (!selectedStudent) return;

      try {
        const predictions = await riskPredictionService.predictStudentRisks(selectedStudent);
        setRiskPredictions(predictions);
      } catch (error) {
        toast.error('Failed to fetch risk predictions');
      }
    };

    fetchRiskPredictions();
  }, [selectedStudent]);

  // Fetch risk trends
  const fetchRiskTrends = async () => {
    try {
      const trends = await riskPredictionService.analyzeRiskTrends();
      setRiskTrends(trends);
    } catch (error) {
      toast.error('Failed to fetch risk trends');
    }
  };

  // Risk Distribution Chart
  const renderRiskDistributionChart = () => {
    if (!riskTrends?.overallRiskDistribution) return null;

    const data = Object.entries(riskTrends.overallRiskDistribution).map(
      ([category, count]) => ({ category, count })
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

  // Risk Prediction Details
  const renderRiskPredictionDetails = () => {
    return riskPredictions.map((prediction, index) => (
      <Card key={index} className="mb-4">
        <CardHeader>
          <CardTitle>{prediction.riskCategory} Risk</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Badge 
                variant={
                  prediction.confidenceLevel === 'HIGH' 
                    ? 'destructive' 
                    : prediction.confidenceLevel === 'MEDIUM' 
                      ? 'default' 
                      : 'secondary'
                }
              >
                {prediction.confidenceLevel} Confidence
              </Badge>
              <p className="mt-2">
                <strong>Prediction Score:</strong> {prediction.predictionScore.toFixed(2)}
              </p>
              <p>
                <strong>Predicted Outcome:</strong> {prediction.predictedOutcome}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Contributing Factors</h4>
              <ul className="list-disc pl-5">
                {prediction.contributingFactors.map((factor, idx) => (
                  <li key={idx}>{factor}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Recommended Preventive Actions</h4>
            <div className="flex flex-wrap gap-2">
              {prediction.recommendedPreventiveActions.map((action, idx) => (
                <Badge key={idx} variant="outline">{action}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    ));
  };

  // Confidence Level Breakdown Chart
  const renderConfidenceLevelChart = () => {
    if (!riskTrends?.confidenceLevelBreakdown) return null;

    const data = Object.entries(riskTrends.confidenceLevelBreakdown).map(
      ([level, count]) => ({ level, count })
    );

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="level" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar 
            dataKey="count" 
            fill={(data) => {
              switch (data.level) {
                case 'HIGH': return '#ff4d4f';
                case 'MEDIUM': return '#ffa940';
                default: return '#52c41a';
              }
            }} 
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Risk Detection & Prediction Dashboard</h2>
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

      {/* Risk Trends Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {renderRiskDistributionChart()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Confidence Level Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {renderConfidenceLevelChart()}
          </CardContent>
        </Card>
      </div>

      {/* Individual Student Risk Predictions */}
      {selectedStudent && riskPredictions.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">
            Risk Predictions for Selected Student
          </h3>
          {renderRiskPredictionDetails()}
        </div>
      )}

      <div className="mt-6 flex justify-end space-x-4">
        <Button variant="outline" onClick={fetchRiskTrends}>
          Refresh Risk Trends
        </Button>
      </div>
    </div>
  );
}
