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
  CurriculumManagementService 
} from '@/lib/ohio-tech-academy/curriculum-management-service';
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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function CurriculumManagementDashboard() {
  const [curricula, setCurricula] = useState<any[]>([]);
  const [selectedCurriculum, setSelectedCurriculum] = useState<string | null>(null);
  const [curriculumDetails, setCurriculumDetails] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [learningOutcomes, setLearningOutcomes] = useState<any[]>([]);

  const [isAddCurriculumDialogOpen, setIsAddCurriculumDialogOpen] = useState(false);
  const [newCurriculumData, setNewCurriculumData] = useState({
    title: '',
    code: '',
    type: 'ACADEMIC',
    department: '',
    academicLevel: '',
    description: ''
  });

  const curriculumManagementService = new CurriculumManagementService();

  // Fetch Curricula
  useEffect(() => {
    const fetchCurricula = async () => {
      try {
        // TODO: Implement method to fetch curricula
        const fetchedCurricula = [
          { 
            id: '1', 
            title: 'Advanced Computer Science', 
            type: 'STEM',
            status: 'ACTIVE' 
          },
          { 
            id: '2', 
            title: 'Digital Marketing Strategies', 
            type: 'PROFESSIONAL_DEVELOPMENT',
            status: 'UNDER_REVIEW' 
          },
        ];
        setCurricula(fetchedCurricula);
      } catch (error) {
        toast.error('Failed to fetch curricula');
      }
    };

    fetchCurricula();
  }, []);

  // View Curriculum Details
  const viewCurriculumDetails = async (curriculumId: string) => {
    try {
      const curriculumInsights = await curriculumManagementService.getCurriculumPerformanceInsights(
        curriculumId
      );
      
      setCurriculumDetails(curriculumInsights);
      setCourses(curriculumInsights.courses);
      setLearningOutcomes(curriculumInsights.learningOutcomes);
    } catch (error) {
      toast.error('Failed to retrieve curriculum details');
    }
  };

  // Add New Curriculum
  const handleAddCurriculum = async () => {
    try {
      const newCurriculum = await curriculumManagementService.createCurriculum(
        newCurriculumData
      );
      
      setCurricula(prevCurricula => [...prevCurricula, newCurriculum]);
      setIsAddCurriculumDialogOpen(false);
      toast.success('Curriculum added successfully');
    } catch (error) {
      toast.error('Failed to add curriculum');
    }
  };

  // Curriculum Type Distribution Chart
  const renderCurriculumTypeChart = () => {
    if (!curricula.length) return null;

    const curriculumTypeData = curricula.reduce((acc, curriculum) => {
      acc[curriculum.type] = (acc[curriculum.type] || 0) + 1;
      return acc;
    }, {});

    const data = Object.entries(curriculumTypeData).map(([type, count]) => 
      ({ type, count })
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

  // Course Performance Chart
  const renderCoursePerformanceChart = () => {
    if (!courses.length) return null;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={courses}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="title" />
          <YAxis 
            label={{ 
              value: 'Student Enrollment', 
              angle: -90, 
              position: 'insideLeft' 
            }} 
          />
          <Tooltip />
          <Legend />
          <Bar 
            dataKey="enrolledStudents.length" 
            fill="#8884d8" 
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Curriculum Management Dashboard</h2>
        <div className="flex space-x-4">
          <Select onValueChange={setSelectedCurriculum}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select Curriculum" />
            </SelectTrigger>
            <SelectContent>
              {curricula.map(curriculum => (
                <SelectItem key={curriculum.id} value={curriculum.id}>
                  {curriculum.title} ({curriculum.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={() => setIsAddCurriculumDialogOpen(true)}
          >
            Add Curriculum
          </Button>
        </div>
      </div>

      {/* Curriculum Type Distribution */}
      {curricula.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Curriculum Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {renderCurriculumTypeChart()}
          </CardContent>
        </Card>
      )}

      {/* Curricula Overview */}
      {curricula.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Curricula</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {curricula.map((curriculum, index) => (
                <div 
                  key={index} 
                  className="border p-4 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-semibold">{curriculum.title}</h4>
                    <p className="text-muted-foreground">{curriculum.type}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline">{curriculum.status}</Badge>
                    <Button 
                      size="sm" 
                      onClick={() => viewCurriculumDetails(curriculum.id)}
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

      {/* Curriculum Details */}
      {curriculumDetails && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Curriculum Details: {curriculumDetails.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Curriculum Type</p>
                <p className="text-lg font-semibold">{curriculumDetails.type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="text-lg font-semibold">{curriculumDetails.department}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Academic Level</p>
                <p className="text-lg font-semibold">{curriculumDetails.academicLevel}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Student Enrollment</p>
                <p className="text-lg font-semibold">
                  {curriculumDetails.studentEnrollmentCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Courses */}
      {courses.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {renderCoursePerformanceChart()}
            <div className="space-y-4 mt-4">
              {courses.map((course, index) => (
                <div 
                  key={index} 
                  className="border p-4 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-semibold">{course.title}</h4>
                    <p className="text-muted-foreground">{course.code}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline">
                      {course.enrolledStudents.length} Students
                    </Badge>
                    <Badge variant="outline">
                      {course.creditHours} Credit Hours
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning Outcomes */}
      {learningOutcomes.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Learning Outcomes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {learningOutcomes.map((outcome, index) => (
                <div 
                  key={index} 
                  className="border p-4 rounded-lg"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold">{outcome.title}</h4>
                    <Badge variant="outline">{outcome.category}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Performance Indicators</p>
                      <ul className="list-disc list-inside text-sm">
                        {outcome.performanceIndicators.slice(0, 3).map((indicator, idx) => (
                          <li key={idx}>{indicator}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Assessment Methods</p>
                      <ul className="list-disc list-inside text-sm">
                        {outcome.assessmentMethods.slice(0, 3).map((method, idx) => (
                          <li key={idx}>{method}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Curriculum Dialog */}
      <Dialog 
        open={isAddCurriculumDialogOpen} 
        onOpenChange={setIsAddCurriculumDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Curriculum</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={newCurriculumData.title}
                onChange={(e) => setNewCurriculumData({
                  ...newCurriculumData, 
                  title: e.target.value
                })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                Code
              </Label>
              <Input
                id="code"
                value={newCurriculumData.code}
                onChange={(e) => setNewCurriculumData({
                  ...newCurriculumData, 
                  code: e.target.value
                })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select 
                value={newCurriculumData.type}
                onValueChange={(value) => setNewCurriculumData({
                  ...newCurriculumData, 
                  type: value
                })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Curriculum Type" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    'ACADEMIC', 'VOCATIONAL', 
                    'PROFESSIONAL_DEVELOPMENT', 
                    'STEM', 'ARTS', 
                    'HUMANITIES', 'INTERDISCIPLINARY'
                  ].map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="department" className="text-right">
                Department
              </Label>
              <Input
                id="department"
                value={newCurriculumData.department}
                onChange={(e) => setNewCurriculumData({
                  ...newCurriculumData, 
                  department: e.target.value
                })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="academicLevel" className="text-right">
                Academic Level
              </Label>
              <Input
                id="academicLevel"
                value={newCurriculumData.academicLevel}
                onChange={(e) => setNewCurriculumData({
                  ...newCurriculumData, 
                  academicLevel: e.target.value
                })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={newCurriculumData.description}
                onChange={(e) => setNewCurriculumData({
                  ...newCurriculumData, 
                  description: e.target.value
                })}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsAddCurriculumDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddCurriculum}>
              Add Curriculum
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
