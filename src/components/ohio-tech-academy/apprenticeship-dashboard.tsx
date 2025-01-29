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
  ApprenticeshipTrackingService 
} from '@/lib/ohio-tech-academy/apprenticeship-tracking-service';
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

export function ApprenticeshipDashboard() {
  const [partners, setPartners] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [apprenticeships, setApprenticeships] = useState<any[]>([]);

  const [isAddPartnerDialogOpen, setIsAddPartnerDialogOpen] = useState(false);
  const [newPartnerData, setNewPartnerData] = useState({
    name: '',
    industry: '',
    contactPerson: '',
    email: '',
    phone: ''
  });

  const [isAddProgramDialogOpen, setIsAddProgramDialogOpen] = useState(false);
  const [newProgramData, setNewProgramData] = useState({
    title: '',
    code: '',
    partnerId: '',
    category: 'TECHNICAL',
    duration: 6,
    learningObjectives: [''],
    requiredSkills: ['']
  });

  const apprenticeshipTrackingService = new ApprenticeshipTrackingService();

  // Fetch Apprenticeship Partners
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        // TODO: Implement method to fetch partners
        const fetchedPartners = [
          { 
            id: '1', 
            name: 'TechInnovate Solutions', 
            industry: 'Software Development',
            successRate: 85 
          },
          { 
            id: '2', 
            name: 'CreativeLabs', 
            industry: 'Design & Media',
            successRate: 75 
          },
        ];
        setPartners(fetchedPartners);
      } catch (error) {
        toast.error('Failed to fetch apprenticeship partners');
      }
    };

    fetchPartners();
  }, []);

  // Fetch Apprenticeship Programs
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        // TODO: Implement method to fetch programs
        const fetchedPrograms = [
          { 
            id: '1', 
            title: 'Software Engineering Apprenticeship', 
            category: 'TECHNICAL',
            duration: 12 
          },
          { 
            id: '2', 
            title: 'UX Design Professional Track', 
            category: 'CREATIVE',
            duration: 6 
          },
        ];
        setPrograms(fetchedPrograms);
      } catch (error) {
        toast.error('Failed to fetch apprenticeship programs');
      }
    };

    fetchPrograms();
  }, []);

  // Add New Apprenticeship Partner
  const handleAddPartner = async () => {
    try {
      const newPartner = await apprenticeshipTrackingService.registerApprenticeshipPartner(
        newPartnerData
      );
      
      setPartners(prevPartners => [...prevPartners, newPartner]);
      setIsAddPartnerDialogOpen(false);
      toast.success('Apprenticeship Partner added successfully');
    } catch (error) {
      toast.error('Failed to add apprenticeship partner');
    }
  };

  // Add New Apprenticeship Program
  const handleAddProgram = async () => {
    try {
      const newProgram = await apprenticeshipTrackingService.createApprenticeshipProgram({
        ...newProgramData,
        partnerId: selectedPartner || ''
      });
      
      setPrograms(prevPrograms => [...prevPrograms, newProgram]);
      setIsAddProgramDialogOpen(false);
      toast.success('Apprenticeship Program added successfully');
    } catch (error) {
      toast.error('Failed to add apprenticeship program');
    }
  };

  // Partner Distribution Chart
  const renderPartnerDistributionChart = () => {
    if (!partners.length) return null;

    const partnerIndustryData = partners.reduce((acc, partner) => {
      acc[partner.industry] = (acc[partner.industry] || 0) + 1;
      return acc;
    }, {});

    const data = Object.entries(partnerIndustryData).map(([industry, count]) => 
      ({ industry, count })
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

  // Apprenticeship Program Performance Chart
  const renderProgramPerformanceChart = () => {
    if (!programs.length) return null;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={programs}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="title" />
          <YAxis 
            label={{ 
              value: 'Program Duration', 
              angle: -90, 
              position: 'insideLeft' 
            }} 
          />
          <Tooltip />
          <Legend />
          <Bar 
            dataKey="duration" 
            fill="#8884d8" 
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Apprenticeship Tracking Dashboard</h2>
        <div className="flex space-x-4">
          <Button 
            onClick={() => setIsAddPartnerDialogOpen(true)}
          >
            Add Partner
          </Button>
          <Button 
            onClick={() => setIsAddProgramDialogOpen(true)}
            disabled={!selectedPartner}
          >
            Add Program
          </Button>
        </div>
      </div>

      {/* Partner Selection */}
      <div className="mb-6">
        <Select onValueChange={setSelectedPartner}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Apprenticeship Partner" />
          </SelectTrigger>
          <SelectContent>
            {partners.map(partner => (
              <SelectItem key={partner.id} value={partner.id}>
                {partner.name} ({partner.industry})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Partner Distribution */}
      {partners.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Apprenticeship Partner Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {renderPartnerDistributionChart()}
          </CardContent>
        </Card>
      )}

      {/* Apprenticeship Partners */}
      {partners.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Apprenticeship Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {partners.map((partner, index) => (
                <div 
                  key={index} 
                  className="border p-4 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-semibold">{partner.name}</h4>
                    <p className="text-muted-foreground">{partner.industry}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline">
                      Success Rate: {partner.successRate}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Apprenticeship Programs */}
      {programs.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Apprenticeship Programs</CardTitle>
          </CardHeader>
          <CardContent>
            {renderProgramPerformanceChart()}
            <div className="space-y-4 mt-4">
              {programs.map((program, index) => (
                <div 
                  key={index} 
                  className="border p-4 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-semibold">{program.title}</h4>
                    <p className="text-muted-foreground">{program.category}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline">
                      Duration: {program.duration} months
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Partner Dialog */}
      <Dialog 
        open={isAddPartnerDialogOpen} 
        onOpenChange={setIsAddPartnerDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Apprenticeship Partner</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newPartnerData.name}
                onChange={(e) => setNewPartnerData({
                  ...newPartnerData, 
                  name: e.target.value
                })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="industry" className="text-right">
                Industry
              </Label>
              <Input
                id="industry"
                value={newPartnerData.industry}
                onChange={(e) => setNewPartnerData({
                  ...newPartnerData, 
                  industry: e.target.value
                })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contactPerson" className="text-right">
                Contact Person
              </Label>
              <Input
                id="contactPerson"
                value={newPartnerData.contactPerson}
                onChange={(e) => setNewPartnerData({
                  ...newPartnerData, 
                  contactPerson: e.target.value
                })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={newPartnerData.email}
                onChange={(e) => setNewPartnerData({
                  ...newPartnerData, 
                  email: e.target.value
                })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                value={newPartnerData.phone}
                onChange={(e) => setNewPartnerData({
                  ...newPartnerData, 
                  phone: e.target.value
                })}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsAddPartnerDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddPartner}>
              Add Partner
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Program Dialog */}
      <Dialog 
        open={isAddProgramDialogOpen} 
        onOpenChange={setIsAddProgramDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Apprenticeship Program</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={newProgramData.title}
                onChange={(e) => setNewProgramData({
                  ...newProgramData, 
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
                value={newProgramData.code}
                onChange={(e) => setNewProgramData({
                  ...newProgramData, 
                  code: e.target.value
                })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select 
                value={newProgramData.category}
                onValueChange={(value) => setNewProgramData({
                  ...newProgramData, 
                  category: value
                })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Program Category" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    'TECHNICAL', 'PROFESSIONAL', 
                    'CREATIVE', 'RESEARCH', 
                    'ENTREPRENEURIAL', 'SOCIAL_IMPACT'
                  ].map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duration (months)
              </Label>
              <Input
                id="duration"
                type="number"
                value={newProgramData.duration}
                onChange={(e) => setNewProgramData({
                  ...newProgramData, 
                  duration: parseInt(e.target.value)
                })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="learningObjectives" className="text-right">
                Learning Objectives
              </Label>
              <div className="col-span-3 space-y-2">
                {newProgramData.learningObjectives.map((objective, index) => (
                  <Input
                    key={index}
                    value={objective}
                    onChange={(e) => {
                      const updatedObjectives = [...newProgramData.learningObjectives];
                      updatedObjectives[index] = e.target.value;
                      setNewProgramData({
                        ...newProgramData,
                        learningObjectives: updatedObjectives
                      });
                    }}
                    className="w-full"
                  />
                ))}
                <Button 
                  variant="outline" 
                  onClick={() => setNewProgramData({
                    ...newProgramData,
                    learningObjectives: [...newProgramData.learningObjectives, '']
                  })}
                >
                  Add Objective
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="requiredSkills" className="text-right">
                Required Skills
              </Label>
              <div className="col-span-3 space-y-2">
                {newProgramData.requiredSkills.map((skill, index) => (
                  <Input
                    key={index}
                    value={skill}
                    onChange={(e) => {
                      const updatedSkills = [...newProgramData.requiredSkills];
                      updatedSkills[index] = e.target.value;
                      setNewProgramData({
                        ...newProgramData,
                        requiredSkills: updatedSkills
                      });
                    }}
                    className="w-full"
                  />
                ))}
                <Button 
                  variant="outline" 
                  onClick={() => setNewProgramData({
                    ...newProgramData,
                    requiredSkills: [...newProgramData.requiredSkills, '']
                  })}
                >
                  Add Skill
                </Button>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsAddProgramDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddProgram}>
              Add Program
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
