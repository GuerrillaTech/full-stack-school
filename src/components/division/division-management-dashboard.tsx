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
  DivisionManagementService, 
  DivisionType, 
  PerformanceMetricType 
} from '@/lib/division/division-management-service';
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

export function DivisionManagementDashboard() {
  const [divisions, setDivisions] = useState<any[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);
  const [divisionPerformance, setDivisionPerformance] = useState<any>(null);
  const [divisionSynergies, setDivisionSynergies] = useState<any>(null);

  const divisionService = new DivisionManagementService();

  // Fetch divisions and synergies on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // TODO: Implement method to fetch all divisions
        const fetchedDivisions = [
          { id: '1', name: 'Academic Division', type: 'ACADEMIC' },
          { id: '2', name: 'Research Division', type: 'RESEARCH' },
          { id: '3', name: 'Student Support Division', type: 'STUDENT_SUPPORT' },
        ];
        setDivisions(fetchedDivisions);

        // Fetch division synergies
        const synergies = await divisionService.analyzeDivisionSynergies();
        setDivisionSynergies(synergies);
      } catch (error) {
        toast.error('Failed to fetch initial division data');
      }
    };

    fetchInitialData();
  }, []);

  // Track Division Performance
  const trackDivisionPerformance = async () => {
    if (!selectedDivision) {
      toast.error('Please select a division');
      return;
    }

    try {
      const performance = await divisionService.trackDivisionPerformance(
        selectedDivision
      );
      setDivisionPerformance(performance);
      toast.success('Division performance tracked successfully');
    } catch (error) {
      toast.error('Failed to track division performance');
    }
  };

  // Performance Metrics Chart
  const renderPerformanceMetricsChart = () => {
    if (!divisionPerformance?.performanceMetrics) return null;

    const data = Object.entries(divisionPerformance.performanceMetrics).map(
      ([metric, data]) => ({
        metric: metric.replace(/_/g, ' '),
        currentValue: data.currentValue,
        targetValue: data.targetValue
      })
    );

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="metric" />
          <YAxis label={{ value: 'Performance', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar 
            dataKey="currentValue" 
            name="Current Value" 
            fill="#8884d8" 
          />
          <Bar 
            dataKey="targetValue" 
            name="Target Value" 
            fill="#82ca9d" 
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Division Synergies Chart
  const renderDivisionSynergiesChart = () => {
    if (!divisionSynergies?.crossDivisionInitiatives) return null;

    const data = divisionSynergies.crossDivisionInitiatives.map(
      (initiative, index) => ({
        name: `Initiative ${index + 1}`,
        impactScore: initiative.impactScore || 0
      })
    );

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
            dataKey="impactScore"
            label={({ name, percent }) => 
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`hsl(${index * 60}, 70%, 50%)`} 
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // Strategic Initiatives
  const renderStrategicInitiatives = () => {
    if (!divisionPerformance?.strategicInitiatives) return null;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Strategic Initiatives</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {divisionPerformance.strategicInitiatives.map((initiative, index) => (
              <div key={index} className="border p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">{initiative.name}</h4>
                  <Badge variant="outline">{initiative.status}</Badge>
                </div>
                <p className="text-muted-foreground mt-2">{initiative.description}</p>
                <div className="mt-2">
                  <p>Progress</p>
                  <Progress value={initiative.progress} />
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
        <h2 className="text-2xl font-bold">Division Management Dashboard</h2>
        <div className="flex space-x-4">
          <Select onValueChange={setSelectedDivision}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select Division" />
            </SelectTrigger>
            <SelectContent>
              {divisions.map(division => (
                <SelectItem key={division.id} value={division.id}>
                  {division.name} ({division.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={trackDivisionPerformance}
            disabled={!selectedDivision}
          >
            Track Performance
          </Button>
        </div>
      </div>

      {/* Division Synergies Overview */}
      {divisionSynergies && (
        <Card>
          <CardHeader>
            <CardTitle>Cross-Division Synergies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Resource Allocation Efficiency</p>
                <p className="text-2xl font-bold">
                  {(divisionSynergies.resourceAllocationEfficiency * 100).toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Collaboration Initiatives</p>
                <p className="text-2xl font-bold">
                  {divisionSynergies.crossDivisionInitiatives.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Collaboration Impact</p>
                <p className="text-2xl font-bold">
                  {(divisionSynergies.collaborationImpactScore * 10).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Analysis */}
      {divisionPerformance && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              {renderPerformanceMetricsChart()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cross-Division Synergies</CardTitle>
            </CardHeader>
            <CardContent>
              {renderDivisionSynergiesChart()}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Strategic Initiatives */}
      {divisionPerformance && renderStrategicInitiatives()}
    </div>
  );
}
