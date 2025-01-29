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
  MachineLearningSupport, 
  SupportModelType 
} from '@/lib/ml-support/ml-support-modeling-service';
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

export function MLSupportDashboard() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [supportModel, setSupportModel] = useState<any>(null);
  const [modelEvaluation, setModelEvaluation] = useState<any>(null);

  const mlSupportService = new MachineLearningSupport();

  // Fetch students and model evaluation on component mount
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

        // Fetch model evaluation
        const evaluation = await mlSupportService.evaluateSupportModels();
        setModelEvaluation(evaluation);
      } catch (error) {
        toast.error('Failed to fetch initial data');
      }
    };

    fetchInitialData();
  }, []);

  // Generate ML Support Model
  const generateSupportModel = async (modelType: SupportModelType) => {
    if (!selectedStudent) {
      toast.error('Please select a student');
      return;
    }

    try {
      const model = await mlSupportService.generateSupportModel(
        selectedStudent, 
        modelType
      );
      setSupportModel(model);
      toast.success('ML Support Model generated successfully');
    } catch (error) {
      toast.error('Failed to generate ML support model');
    }
  };

  // Model Type Distribution Chart
  const renderModelTypeDistributionChart = () => {
    if (!modelEvaluation?.modelTypeDistribution) return null;

    const data = Object.entries(modelEvaluation.modelTypeDistribution).map(
      ([type, count]) => ({ type, count })
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

  // Performance Metrics Chart
  const renderPerformanceMetricsChart = () => {
    if (!modelEvaluation?.performanceMetrics) return null;

    const data = [
      { metric: 'Accuracy', value: modelEvaluation.performanceMetrics.accuracy * 100 },
      { metric: 'Precision', value: modelEvaluation.performanceMetrics.precision * 100 },
      { metric: 'Recall', value: modelEvaluation.performanceMetrics.recall * 100 }
    ];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="metric" />
          <YAxis label={{ value: 'Percentage', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar 
            dataKey="value" 
            fill={(data) => {
              switch (data.metric) {
                case 'Accuracy': return '#0088FE';
                case 'Precision': return '#00C49F';
                case 'Recall': return '#FFBB28';
                default: return '#8884D8';
              }
            }} 
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Support Model Details
  const renderSupportModelDetails = () => {
    if (!supportModel) return null;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>ML Support Model Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">Model Information</h4>
              <p><strong>Model Type:</strong> {supportModel.modelType}</p>
              <p><strong>Prediction Confidence:</strong> {(supportModel.predictionConfidence * 100).toFixed(2)}%</p>
              
              <h4 className="font-semibold mt-4">Training Metrics</h4>
              <div className="space-y-2">
                <div>
                  <p>Accuracy: {(supportModel.trainingMetrics.accuracy * 100).toFixed(2)}%</p>
                  <Progress value={supportModel.trainingMetrics.accuracy * 100} />
                </div>
                <div>
                  <p>Precision: {(supportModel.trainingMetrics.precision * 100).toFixed(2)}%</p>
                  <Progress value={supportModel.trainingMetrics.precision * 100} />
                </div>
                <div>
                  <p>Recall: {(supportModel.trainingMetrics.recall * 100).toFixed(2)}%</p>
                  <Progress value={supportModel.trainingMetrics.recall * 100} />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold">Predictions and Recommendations</h4>
              <div>
                <h5 className="font-semibold mt-2">Predicted Outcomes</h5>
                <ul className="list-disc pl-5">
                  {supportModel.predictedOutcomes.map((outcome, idx) => (
                    <li key={idx}>{outcome}</li>
                  ))}
                </ul>

                <h5 className="font-semibold mt-2">Recommended Interventions</h5>
                <div className="flex flex-wrap gap-2">
                  {supportModel.recommendedInterventions.map((intervention, idx) => (
                    <Badge key={idx} variant="outline">{intervention}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Machine Learning Support Dashboard</h2>
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

      {/* Model Evaluation Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Model Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {renderModelTypeDistributionChart()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            {renderPerformanceMetricsChart()}
          </CardContent>
        </Card>
      </div>

      {/* ML Support Model Generation */}
      {selectedStudent && (
        <div className="mt-6 space-y-4">
          <div className="flex space-x-4">
            {Object.values(SupportModelType).map(modelType => (
              <Button 
                key={modelType} 
                variant="outline"
                onClick={() => generateSupportModel(modelType)}
              >
                Generate {modelType.replace(/_/g, ' ')} Model
              </Button>
            ))}
          </div>

          {/* Support Model Details */}
          {supportModel && renderSupportModelDetails()}
        </div>
      )}
    </div>
  );
}
