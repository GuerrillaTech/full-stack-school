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
  AdaptiveLearningService, 
  LearningPathType, 
  LearningStyle 
} from '@/lib/adaptive-learning/adaptive-learning-service';
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

export function AdaptiveLearningDashboard() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [learningPaths, setLearningPaths] = useState<any[]>([]);
  const [selectedLearningPath, setSelectedLearningPath] = useState<string | null>(null);
  const [learningPathDetails, setLearningPathDetails] = useState<any>(null);
  const [recommendedResources, setRecommendedResources] = useState<any[]>([]);

  const adaptiveLearningService = new AdaptiveLearningService();

  // Fetch students on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // TODO: Implement method to fetch students
        const fetchedStudents = [
          { id: '1', name: 'Emily Chen', grade: '10th' },
          { id: '2', name: 'Michael Rodriguez', grade: '11th' },
          { id: '3', name: 'Sarah Kim', grade: '9th' },
        ];
        setStudents(fetchedStudents);
      } catch (error) {
        toast.error('Failed to fetch student data');
      }
    };

    fetchInitialData();
  }, []);

  // Generate Learning Path
  const generateLearningPath = async (pathType: LearningPathType) => {
    if (!selectedStudent) {
      toast.error('Please select a student');
      return;
    }

    try {
      const learningPath = await adaptiveLearningService.generateLearningPath(
        selectedStudent,
        pathType
      );
      
      setLearningPaths(prevPaths => [...prevPaths, learningPath]);
      toast.success('Learning path generated successfully');
    } catch (error) {
      toast.error('Failed to generate learning path');
    }
  };

  // View Learning Path Details
  const viewLearningPathDetails = async (learningPathId: string) => {
    try {
      const pathDetails = await adaptiveLearningService.updateLearningPathProgress(
        learningPathId,
        {} // Empty progress data for initial view
      );
      
      setLearningPathDetails(pathDetails);
      
      // Recommend additional resources
      const resources = await adaptiveLearningService.recommendLearningResources(
        pathDetails.studentId,
        pathDetails
      );
      
      setRecommendedResources(resources);
    } catch (error) {
      toast.error('Failed to retrieve learning path details');
    }
  };

  // Learning Path Distribution Chart
  const renderLearningPathDistributionChart = () => {
    if (!learningPaths.length) return null;

    const pathTypeData = learningPaths.reduce((acc, path) => {
      acc[path.type] = (acc[path.type] || 0) + 1;
      return acc;
    }, {});

    const data = Object.entries(pathTypeData).map(([type, count]) => 
      ({ type, count })
    );

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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

  // Learning Resource Recommendation Chart
  const renderLearningResourceRecommendationChart = () => {
    if (!recommendedResources.length) return null;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={recommendedResources}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="title" />
          <YAxis label={{ value: 'Recommendation Score', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar 
            dataKey="recommendationScore" 
            fill="#8884d8" 
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Recommended Learning Resources
  const renderRecommendedResources = () => {
    if (!recommendedResources.length) return null;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recommended Learning Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendedResources.map((resource, index) => (
              <div key={index} className="border p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">{resource.title}</h4>
                  <Badge variant="outline">{resource.type}</Badge>
                </div>
                <p className="text-muted-foreground mt-2">{resource.subject}</p>
                <div className="mt-2 flex justify-between items-center">
                  <p>Recommendation Score: {(resource.recommendationScore * 100).toFixed(2)}%</p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(resource.url, '_blank')}
                  >
                    Access Resource
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
        <h2 className="text-2xl font-bold">Adaptive Learning Dashboard</h2>
        <div className="flex space-x-4">
          <Select onValueChange={setSelectedStudent}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select Student" />
            </SelectTrigger>
            <SelectContent>
              {students.map(student => (
                <SelectItem key={student.id} value={student.id}>
                  {student.name} (Grade: {student.grade})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="space-x-2">
            <Button 
              onClick={() => generateLearningPath(LearningPathType.ACADEMIC_ENRICHMENT)}
              disabled={!selectedStudent}
            >
              Academic Enrichment
            </Button>
            <Button 
              onClick={() => generateLearningPath(LearningPathType.SKILL_DEVELOPMENT)}
              disabled={!selectedStudent}
            >
              Skill Development
            </Button>
          </div>
        </div>
      </div>

      {/* Learning Paths Overview */}
      {learningPaths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Learning Paths Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {renderLearningPathDistributionChart()}
          </CardContent>
        </Card>
      )}

      {/* Learning Path Details */}
      {learningPaths.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Learning Paths</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {learningPaths.map((path, index) => (
                <div 
                  key={index} 
                  className="border p-4 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-semibold">{path.title}</h4>
                    <p className="text-muted-foreground">{path.type}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline">{path.progressStatus}</Badge>
                    <Progress value={path.completionPercentage} />
                    <Button 
                      size="sm" 
                      onClick={() => viewLearningPathDetails(path.id)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning Path Details */}
      {learningPathDetails && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Learning Path Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Primary Objective</p>
                <p className="text-lg font-semibold">{learningPathDetails.primaryObjective}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Learning Style</p>
                <p className="text-lg font-semibold">{learningPathDetails.learningStyle}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="text-lg font-semibold">
                  {new Date(learningPathDetails.startDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expected Completion</p>
                <p className="text-lg font-semibold">
                  {new Date(learningPathDetails.expectedCompletionDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Learning Resources */}
      {renderRecommendedResources()}

      {/* Learning Resource Recommendations */}
      {recommendedResources.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Resource Recommendation Scores</CardTitle>
          </CardHeader>
          <CardContent>
            {renderLearningResourceRecommendationChart()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
