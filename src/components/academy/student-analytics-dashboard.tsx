'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { AcademyService } from '@/lib/academy/academy-service';
import { Progress } from '@/components/ui/progress';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { toast } from 'react-toastify';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function StudentAnalyticsDashboard() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [studentAnalytics, setStudentAnalytics] = useState<any>(null);
  const [performanceHistory, setPerformanceHistory] = useState<any[]>([]);

  const academyService = new AcademyService();

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

  // Fetch student analytics when a student is selected
  useEffect(() => {
    const fetchStudentAnalytics = async () => {
      if (!selectedStudent) return;

      try {
        const analytics = await academyService.getStudentAnalytics(selectedStudent);
        setStudentAnalytics(analytics);

        // Simulate performance history data
        const mockPerformanceHistory = [
          { month: 'Jan', progress: 65, interventions: 3 },
          { month: 'Feb', progress: 72, interventions: 2 },
          { month: 'Mar', progress: 78, interventions: 1 },
          { month: 'Apr', progress: 85, interventions: 0 },
        ];
        setPerformanceHistory(mockPerformanceHistory);
      } catch (error) {
        toast.error('Failed to fetch student analytics');
      }
    };

    fetchStudentAnalytics();
  }, [selectedStudent]);

  // Generate Academic Support Plan
  const generateSupportPlan = async () => {
    if (!selectedStudent) {
      toast.error('Please select a student');
      return;
    }

    try {
      const supportPlan = await academyService.generateAcademicSupportPlan(selectedStudent);
      
      // Open dialog to show support plan
      Dialog.open({
        title: 'Academic Support Plan',
        content: (
          <div>
            <h3>Intervention Strategy</h3>
            <ul>
              {supportPlan.supportPlan.interventionStrategy.map((intervention, index) => (
                <li key={index}>
                  {intervention.subject} - {intervention.intensityLevel}
                </li>
              ))}
            </ul>
            <h3>Additional Resources</h3>
            <ul>
              {supportPlan.supportPlan.additionalResources.map((resource, index) => (
                <li key={index}>{resource}</li>
              ))}
            </ul>
          </div>
        )
      });
    } catch (error) {
      toast.error('Failed to generate support plan');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Student Analytics</h2>
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

      {selectedStudent && studentAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Progress Card */}
          <Card>
            <CardHeader>
              <CardTitle>Academic Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Overall Progress</p>
                  <Progress 
                    value={studentAnalytics.basicProgress.overallProgress} 
                    className="w-full" 
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subjects Mastered</p>
                  <div className="flex gap-2">
                    {studentAnalytics.basicProgress.masteredSubjects.map(subject => (
                      <Badge key={subject} variant="secondary">{subject}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personalized Learning Card */}
          <Card>
            <CardHeader>
              <CardTitle>Personalized Learning Path</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Recommended Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentAnalytics.personalizedLearning.recommendedLearningPath.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.subject}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.recommendationType}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Performance History Card */}
          <Card>
            <CardHeader>
              <CardTitle>Performance History</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={performanceHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="progress" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="interventions" 
                    stroke="#82ca9d" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedStudent && (
        <div className="mt-6 flex justify-end">
          <Button onClick={generateSupportPlan}>
            Generate Academic Support Plan
          </Button>
        </div>
      )}
    </div>
  );
}
