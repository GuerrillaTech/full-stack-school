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
  ScholarshipEquityService 
} from '@/lib/ohio-tech-academy/scholarship-equity-service';
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
import { Textarea } from '@/components/ui/textarea';

export function ScholarshipEquityDashboard() {
  const [scholarshipPrograms, setScholarshipPrograms] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [programDetails, setProgramDetails] = useState<any>(null);
  const [scholarships, setScholarships] = useState<any[]>([]);

  const [isAddProgramDialogOpen, setIsAddProgramDialogOpen] = useState(false);
  const [newProgramData, setNewProgramData] = useState({
    title: '',
    code: '',
    description: '',
    type: 'MERIT_BASED',
    fundingSource: 'INSTITUTIONAL',
    totalFundingAmount: 0,
    individualAwardAmount: 0,
    eligibilityCriteria: ['ACADEMIC_PERFORMANCE'],
    minimumGPA: 3.0,
    applicationStartDate: new Date(),
    applicationEndDate: new Date(),
    fundingPeriodStart: new Date(),
    fundingPeriodEnd: new Date(),
    totalAwardsAvailable: 0,
    termsAndConditions: ''
  });

  const scholarshipEquityService = new ScholarshipEquityService();

  // Fetch Scholarship Programs
  useEffect(() => {
    const fetchScholarshipPrograms = async () => {
      try {
        // TODO: Implement method to fetch scholarship programs
        const fetchedPrograms = [
          { 
            id: '1', 
            title: 'STEM Excellence Scholarship', 
            type: 'STEM_SUPPORT',
            totalFundingAmount: 500000,
            totalAwardsAvailable: 50
          },
          { 
            id: '2', 
            title: 'Diversity in Innovation Grant', 
            type: 'DIVERSITY_INCLUSION',
            totalFundingAmount: 250000,
            totalAwardsAvailable: 25
          },
        ];
        setScholarshipPrograms(fetchedPrograms);
      } catch (error) {
        toast.error('Failed to fetch scholarship programs');
      }
    };

    fetchScholarshipPrograms();
  }, []);

  // View Program Details
  const viewProgramDetails = async (programId: string) => {
    try {
      const programInsights = await scholarshipEquityService.getScholarshipProgramInsights(
        programId
      );
      
      setProgramDetails(programInsights);
      setScholarships(programInsights.awardedScholarships);
    } catch (error) {
      toast.error('Failed to retrieve program details');
    }
  };

  // Add New Scholarship Program
  const handleAddScholarshipProgram = async () => {
    try {
      const newProgram = await scholarshipEquityService.createScholarshipProgram(
        newProgramData
      );
      
      setScholarshipPrograms(prevPrograms => [...prevPrograms, newProgram]);
      setIsAddProgramDialogOpen(false);
      toast.success('Scholarship Program added successfully');
    } catch (error) {
      toast.error('Failed to add scholarship program');
    }
  };

  // Scholarship Type Distribution Chart
  const renderScholarshipTypeChart = () => {
    if (!scholarshipPrograms.length) return null;

    const scholarshipTypeData = scholarshipPrograms.reduce((acc, program) => {
      acc[program.type] = (acc[program.type] || 0) + 1;
      return acc;
    }, {});

    const data = Object.entries(scholarshipTypeData).map(([type, count]) => 
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

  // Scholarship Funding Distribution Chart
  const renderScholarshipFundingChart = () => {
    if (!scholarshipPrograms.length) return null;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={scholarshipPrograms}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="title" />
          <YAxis 
            label={{ 
              value: 'Total Funding ($)', 
              angle: -90, 
              position: 'insideLeft' 
            }} 
          />
          <Tooltip />
          <Legend />
          <Bar 
            dataKey="totalFundingAmount" 
            fill="#8884d8" 
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Scholarship and Equity Dashboard</h2>
        <Button 
          onClick={() => setIsAddProgramDialogOpen(true)}
        >
          Add Scholarship Program
        </Button>
      </div>

      {/* Scholarship Type Distribution */}
      {scholarshipPrograms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scholarship Program Types</CardTitle>
          </CardHeader>
          <CardContent>
            {renderScholarshipTypeChart()}
          </CardContent>
        </Card>
      )}

      {/* Scholarship Funding Distribution */}
      {scholarshipPrograms.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Scholarship Funding Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {renderScholarshipFundingChart()}
          </CardContent>
        </Card>
      )}

      {/* Scholarship Programs Overview */}
      {scholarshipPrograms.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Scholarship Programs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scholarshipPrograms.map((program, index) => (
                <div 
                  key={index} 
                  className="border p-4 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-semibold">{program.title}</h4>
                    <p className="text-muted-foreground">{program.type}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline">
                      ${program.totalFundingAmount.toLocaleString()}
                    </Badge>
                    <Badge variant="outline">
                      {program.totalAwardsAvailable} Awards
                    </Badge>
                    <Button 
                      size="sm" 
                      onClick={() => viewProgramDetails(program.id)}
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

      {/* Program Details */}
      {programDetails && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Program Details: {programDetails.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Scholarship Type</p>
                <p className="text-lg font-semibold">{programDetails.type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Funding Source</p>
                <p className="text-lg font-semibold">{programDetails.fundingSource}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Funding</p>
                <p className="text-lg font-semibold">
                  ${programDetails.totalFundingAmount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Awards Available</p>
                <p className="text-lg font-semibold">
                  {programDetails.totalAwardsAvailable}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Awarded Scholarships */}
      {scholarships.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Awarded Scholarships</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scholarships.map((scholarship, index) => (
                <div 
                  key={index} 
                  className="border p-4 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-semibold">
                      {scholarship.student.name}
                    </h4>
                    <p className="text-muted-foreground">
                      {scholarship.student.email}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline">
                      ${scholarship.awardAmount.toLocaleString()}
                    </Badge>
                    <Badge variant={
                      scholarship.status === 'ACTIVE' 
                        ? 'default' 
                        : scholarship.status === 'PENDING'
                        ? 'outline'
                        : 'destructive'
                    }>
                      {scholarship.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Scholarship Program Dialog */}
      <Dialog 
        open={isAddProgramDialogOpen} 
        onOpenChange={setIsAddProgramDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Scholarship Program</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newProgramData.title}
                onChange={(e) => setNewProgramData({
                  ...newProgramData, 
                  title: e.target.value
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Program Code</Label>
              <Input
                id="code"
                value={newProgramData.code}
                onChange={(e) => setNewProgramData({
                  ...newProgramData, 
                  code: e.target.value
                })}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newProgramData.description}
                onChange={(e) => setNewProgramData({
                  ...newProgramData, 
                  description: e.target.value
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Scholarship Type</Label>
              <Select 
                value={newProgramData.type}
                onValueChange={(value) => setNewProgramData({
                  ...newProgramData, 
                  type: value
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    'MERIT_BASED', 'NEED_BASED', 
                    'DIVERSITY_INCLUSION', 'STEM_SUPPORT', 
                    'RESEARCH_GRANT', 'ENTREPRENEURIAL_SUPPORT', 
                    'COMMUNITY_SERVICE'
                  ].map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fundingSource">Funding Source</Label>
              <Select 
                value={newProgramData.fundingSource}
                onValueChange={(value) => setNewProgramData({
                  ...newProgramData, 
                  fundingSource: value
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Source" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    'INSTITUTIONAL', 'CORPORATE_SPONSOR', 
                    'GOVERNMENT_GRANT', 'PRIVATE_DONOR', 
                    'ALUMNI_CONTRIBUTION', 'RESEARCH_FOUNDATION'
                  ].map(source => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalFundingAmount">Total Funding Amount</Label>
              <Input
                id="totalFundingAmount"
                type="number"
                value={newProgramData.totalFundingAmount}
                onChange={(e) => setNewProgramData({
                  ...newProgramData, 
                  totalFundingAmount: parseFloat(e.target.value)
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="individualAwardAmount">Individual Award Amount</Label>
              <Input
                id="individualAwardAmount"
                type="number"
                value={newProgramData.individualAwardAmount}
                onChange={(e) => setNewProgramData({
                  ...newProgramData, 
                  individualAwardAmount: parseFloat(e.target.value)
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minimumGPA">Minimum GPA</Label>
              <Input
                id="minimumGPA"
                type="number"
                step="0.1"
                value={newProgramData.minimumGPA}
                onChange={(e) => setNewProgramData({
                  ...newProgramData, 
                  minimumGPA: parseFloat(e.target.value)
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalAwardsAvailable">Total Awards Available</Label>
              <Input
                id="totalAwardsAvailable"
                type="number"
                value={newProgramData.totalAwardsAvailable}
                onChange={(e) => setNewProgramData({
                  ...newProgramData, 
                  totalAwardsAvailable: parseInt(e.target.value)
                })}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="termsAndConditions">Terms and Conditions</Label>
              <Textarea
                id="termsAndConditions"
                value={newProgramData.termsAndConditions}
                onChange={(e) => setNewProgramData({
                  ...newProgramData, 
                  termsAndConditions: e.target.value
                })}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsAddProgramDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddScholarshipProgram}>
              Add Scholarship Program
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
