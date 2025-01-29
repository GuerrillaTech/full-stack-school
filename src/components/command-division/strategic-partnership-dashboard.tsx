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
  StrategicPartnershipService 
} from '@/lib/command-division/strategic-partnership-service';
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

export function StrategicPartnershipDashboard() {
  const [strategicPartners, setStrategicPartners] = useState<any[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [partnerDetails, setPartnerDetails] = useState<any>(null);
  const [activeProjects, setActiveProjects] = useState<any[]>([]);
  const [performanceReviews, setPerformanceReviews] = useState<any[]>([]);

  const [isAddPartnerDialogOpen, setIsAddPartnerDialogOpen] = useState(false);
  const [newPartnerData, setNewPartnerData] = useState({
    name: '',
    type: 'INDUSTRY',
    primaryContactName: '',
    primaryContactEmail: '',
    description: ''
  });

  const strategicPartnershipService = new StrategicPartnershipService();

  // Fetch Strategic Partners
  useEffect(() => {
    const fetchStrategicPartners = async () => {
      try {
        // TODO: Implement method to fetch strategic partners
        const fetchedPartners = [
          { 
            id: '1', 
            name: 'TechInnovate Solutions', 
            type: 'TECHNOLOGY',
            partnershipStatus: 'ACTIVE' 
          },
          { 
            id: '2', 
            name: 'Global Research Institute', 
            type: 'RESEARCH',
            partnershipStatus: 'NEGOTIATION' 
          },
        ];
        setStrategicPartners(fetchedPartners);
      } catch (error) {
        toast.error('Failed to fetch strategic partners');
      }
    };

    fetchStrategicPartners();
  }, []);

  // View Partner Details
  const viewPartnerDetails = async (partnerId: string) => {
    try {
      const partnerInsights = await strategicPartnershipService.getStrategicPartnershipInsights(
        partnerId
      );
      
      setPartnerDetails(partnerInsights);
      setActiveProjects(partnerInsights.activeProjects);
      setPerformanceReviews(partnerInsights.performanceReviews);
    } catch (error) {
      toast.error('Failed to retrieve partner details');
    }
  };

  // Add New Strategic Partner
  const handleAddPartner = async () => {
    try {
      const newPartner = await strategicPartnershipService.createStrategicPartnership(
        newPartnerData
      );
      
      setStrategicPartners(prevPartners => [...prevPartners, newPartner]);
      setIsAddPartnerDialogOpen(false);
      toast.success('Strategic Partner added successfully');
    } catch (error) {
      toast.error('Failed to add strategic partner');
    }
  };

  // Partnership Type Distribution Chart
  const renderPartnershipTypeChart = () => {
    if (!strategicPartners.length) return null;

    const partnerTypeData = strategicPartners.reduce((acc, partner) => {
      acc[partner.type] = (acc[partner.type] || 0) + 1;
      return acc;
    }, {});

    const data = Object.entries(partnerTypeData).map(([type, count]) => 
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

  // Active Projects Performance Chart
  const renderActiveProjectsChart = () => {
    if (!activeProjects.length) return null;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={activeProjects}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="title" />
          <YAxis 
            label={{ 
              value: 'Progress', 
              angle: -90, 
              position: 'insideLeft' 
            }} 
          />
          <Tooltip />
          <Legend />
          <Bar 
            dataKey="progressPercentage" 
            fill="#8884d8" 
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Strategic Partnership Dashboard</h2>
        <div className="flex space-x-4">
          <Select onValueChange={setSelectedPartner}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select Strategic Partner" />
            </SelectTrigger>
            <SelectContent>
              {strategicPartners.map(partner => (
                <SelectItem key={partner.id} value={partner.id}>
                  {partner.name} ({partner.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={() => setIsAddPartnerDialogOpen(true)}
          >
            Add Strategic Partner
          </Button>
        </div>
      </div>

      {/* Partnership Type Distribution */}
      {strategicPartners.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Partnership Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {renderPartnershipTypeChart()}
          </CardContent>
        </Card>
      )}

      {/* Strategic Partners Overview */}
      {strategicPartners.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Strategic Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {strategicPartners.map((partner, index) => (
                <div 
                  key={index} 
                  className="border p-4 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-semibold">{partner.name}</h4>
                    <p className="text-muted-foreground">{partner.type}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline">{partner.partnershipStatus}</Badge>
                    <Button 
                      size="sm" 
                      onClick={() => viewPartnerDetails(partner.id)}
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

      {/* Partner Details */}
      {partnerDetails && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Partner Details: {partnerDetails.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Partnership Type</p>
                <p className="text-lg font-semibold">{partnerDetails.type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Strategic Alignment Score</p>
                <p className="text-lg font-semibold">
                  {partnerDetails.strategicAlignmentScore?.toFixed(2) || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Partnership Status</p>
                <p className="text-lg font-semibold">{partnerDetails.partnershipStatus}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Compliance Level</p>
                <p className="text-lg font-semibold">{partnerDetails.complianceLevel}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Projects */}
      {activeProjects.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {renderActiveProjectsChart()}
            <div className="space-y-4 mt-4">
              {activeProjects.map((project, index) => (
                <div 
                  key={index} 
                  className="border p-4 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-semibold">{project.title}</h4>
                    <p className="text-muted-foreground">{project.description}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Progress value={project.progressPercentage} />
                    <Badge variant="outline">
                      {project.progressPercentage}% Complete
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Reviews */}
      {performanceReviews.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Performance Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceReviews.map((review, index) => (
                <div 
                  key={index} 
                  className="border p-4 rounded-lg"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold">
                      Review Period: {new Date(review.reviewPeriodStart).toLocaleDateString()} 
                      - {new Date(review.reviewPeriodEnd).toLocaleDateString()}
                    </h4>
                    <Badge variant="outline">
                      Overall Score: {review.overallPerformanceScore.toFixed(2)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Strategic Alignment</p>
                      <p className="text-lg font-semibold">
                        {review.strategicAlignmentScore.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Collaboration Effectiveness</p>
                      <p className="text-lg font-semibold">
                        {review.collaborationEffectivenessScore.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Strengths</p>
                      <ul className="list-disc list-inside text-sm">
                        {review.strengths.slice(0, 3).map((strength, idx) => (
                          <li key={idx}>{strength}</li>
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

      {/* Add Strategic Partner Dialog */}
      <Dialog 
        open={isAddPartnerDialogOpen} 
        onOpenChange={setIsAddPartnerDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Strategic Partner</DialogTitle>
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
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select 
                value={newPartnerData.type}
                onValueChange={(value) => setNewPartnerData({
                  ...newPartnerData, 
                  type: value
                })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Partnership Type" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    'RESEARCH', 'ACADEMIC', 'INDUSTRY', 
                    'GOVERNMENT', 'NON_PROFIT', 
                    'TECHNOLOGY', 'INNOVATION'
                  ].map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contactName" className="text-right">
                Contact Name
              </Label>
              <Input
                id="contactName"
                value={newPartnerData.primaryContactName}
                onChange={(e) => setNewPartnerData({
                  ...newPartnerData, 
                  primaryContactName: e.target.value
                })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contactEmail" className="text-right">
                Contact Email
              </Label>
              <Input
                id="contactEmail"
                type="email"
                value={newPartnerData.primaryContactEmail}
                onChange={(e) => setNewPartnerData({
                  ...newPartnerData, 
                  primaryContactEmail: e.target.value
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
                value={newPartnerData.description}
                onChange={(e) => setNewPartnerData({
                  ...newPartnerData, 
                  description: e.target.value
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
    </div>
  );
}
