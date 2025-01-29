'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis 
} from 'recharts';
import { 
  StudentGrowthTrackingService, 
  GrowthDimension, 
  ProgressStatus 
} from '@/lib/student-development/student-growth-tracking-service';
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

export function StudentGrowthDashboard() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [growthProfile, setGrowthProfile] = useState<any>(null);
  const [longitudinalAnalysis, setLongitudinalAnalysis] = useState<any>(null);

  const growthTrackingService = new StudentGrowthTrackingService();

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
  }, []);

  // Generate Student Growth Profile
  const generateGrowthProfile = async () => {
    if (!selectedStudent) {
      toast.error('Please select a student');
      return;
    }

    try {
      const profile = await growthTrackingService.generateStudentGrowthProfile(
        selectedStudent
      );
      setGrowthProfile(profile);

      const analysis = await growthTrackingService.analyzeLongitudinalGrowth(
        selectedStudent
      );
      setLongitudinalAnalysis(analysis);

      toast.success('Student Growth Profile Generated');
    } catch (error) {
      toast.error('Failed to generate growth profile');
    }
  };

  // Dimensional Growth Radar Chart
  const renderDimensionalGrowthChart = () => {
    if (!growthProfile) return null;

    const radarData = growthProfile.metrics.map((metric: any) => ({
      dimension: metric.dimension.replace(/_/g, ' '),
      score: metric.score,
      status: metric.status
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={radarData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="dimension" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar 
            dataKey="score" 
            stroke="#8884d8" 
            fill="#8884d8" 
            fillOpacity={0.6} 
          />
          <Tooltip 
            formatter={(value, name, props) => {
              const metric = radarData.find(
                (m: any) => m.dimension === name
              );
              return [
                `${value} (${metric?.status})`, 
                name
              ];
            }} 
          />
        </RadarChart>
      </ResponsiveContainer>
    );
  };

  // Longitudinal Growth Trend Chart
  const renderLongitudinalGrowthChart = () => {
    if (!longitudinalAnalysis) return null;

    const trendData = longitudinalAnalysis.trendAnalysis.flatMap(
      (analysis: any) => 
        analysis.dimension !== 'dimension' 
          ? [{
              name: analysis.dimension.replace(/_/g, ' '),
              trend: analysis.overallTrend,
              volatility: analysis.volatility,
              averageScore: analysis.averageScore
            }] 
          : []
    );

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis 
            label={{ 
              value: 'Average Score', 
              angle: -90, 
              position: 'insideLeft' 
            }} 
          />
          <Tooltip 
            formatter={(value, name, props) => {
              const trendData = props.payload;
              return [
                `${value} (${trendData.trend})`, 
                name
              ];
            }} 
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="averageScore" 
            stroke="#8884d8" 
            activeDot={{ r: 8 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  // Growth Profile Details
  const renderGrowthProfileDetails = () => {
    if (!growthProfile) return null;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Student Growth Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">Overall Progress</h4>
              <div className="space-y-2">
                <p><strong>Progress Score:</strong> {growthProfile.overallProgressScore.toFixed(2)}</p>
                <Progress value={growthProfile.overallProgressScore} />
                
                <p><strong>Development Potential:</strong> {growthProfile.developmentPotential.toFixed(2)}</p>
                <Progress value={growthProfile.developmentPotential} />
              </div>

              <h4 className="font-semibold mt-4">Growth Metrics</h4>
              {growthProfile.metrics.map((metric: any, index: number) => (
                <div key={index} className="mt-2">
                  <p>
                    <strong>{metric.dimension.replace(/_/g, ' ')}:</strong> 
                    {metric.score.toFixed(2)} ({metric.status})
                  </p>
                  <Progress value={metric.score} />
                </div>
              ))}
            </div>
            
            <div>
              <h4 className="font-semibold">Recommended Interventions</h4>
              <div className="flex flex-wrap gap-2">
                {growthProfile.recommendedInterventions.map((intervention: string, idx: number) => (
                  <Badge key={idx} variant="outline">{intervention}</Badge>
                ))}
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
        <h2 className="text-2xl font-bold">Holistic Student Development Dashboard</h2>
        <div className="flex space-x-4">
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
          <Button 
            onClick={generateGrowthProfile}
            disabled={!selectedStudent}
          >
            Generate Growth Profile
          </Button>
        </div>
      </div>

      {/* Dimensional Growth Chart */}
      {growthProfile && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Dimensional Growth Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {renderDimensionalGrowthChart()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Longitudinal Growth Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {renderLongitudinalGrowthChart()}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Growth Profile Details */}
      {growthProfile && renderGrowthProfileDetails()}
    </div>
  );
}
