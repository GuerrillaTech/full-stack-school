'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { EarlyWarningService, RiskCategory, InterventionPriority } from '@/lib/intervention/early-warning-service';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'react-toastify';

export function InterventionDashboard() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [interventionRisks, setInterventionRisks] = useState<any[]>([]);
  const [interventionPlan, setInterventionPlan] = useState<any>(null);

  const earlyWarningService = new EarlyWarningService();

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

  // Fetch intervention risks when a student is selected
  useEffect(() => {
    const fetchInterventionRisks = async () => {
      if (!selectedStudent) return;

      try {
        const risks = await earlyWarningService.assessStudentRisks(selectedStudent);
        setInterventionRisks(risks);
      } catch (error) {
        toast.error('Failed to fetch intervention risks');
      }
    };

    fetchInterventionRisks();
  }, [selectedStudent]);

  // Create Intervention Plan
  const createInterventionPlan = async () => {
    if (!selectedStudent) {
      toast.error('Please select a student');
      return;
    }

    try {
      const plan = await earlyWarningService.createInterventionPlan(selectedStudent);
      setInterventionPlan(plan);
      toast.success('Intervention plan created successfully');
    } catch (error) {
      toast.error('Failed to create intervention plan');
    }
  };

  // Track Intervention Effectiveness
  const trackInterventionEffectiveness = async () => {
    if (!interventionPlan) {
      toast.error('No intervention plan available');
      return;
    }

    try {
      const effectivenessReport = await earlyWarningService.trackInterventionEffectiveness(
        interventionPlan.id
      );
      
      Dialog.open({
        title: 'Intervention Effectiveness Report',
        content: (
          <div>
            <h3>Intervention Impact</h3>
            <p>Initial Risk Level: {effectivenessReport.initialRiskLevel}</p>
            <p>Current Risk Level: {effectivenessReport.currentRiskLevel}</p>
            <p>Improvement: {effectivenessReport.improvementPercentage.toFixed(2)}%</p>
          </div>
        )
      });
    } catch (error) {
      toast.error('Failed to track intervention effectiveness');
    }
  };

  const renderRiskChart = () => {
    const riskData = interventionRisks.map(risk => ({
      category: risk.riskCategory,
      riskScore: risk.riskScore,
      priority: risk.priority
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={riskData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis label={{ value: 'Risk Score', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar 
            dataKey="riskScore" 
            fill={(data) => {
              const risk = riskData.find(r => r.category === data.category);
              switch (risk?.priority) {
                case InterventionPriority.CRITICAL: return '#ff4d4f';
                case InterventionPriority.HIGH: return '#ff7a45';
                case InterventionPriority.MEDIUM: return '#ffa940';
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
        <h2 className="text-2xl font-bold">Student Intervention Dashboard</h2>
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

      {selectedStudent && interventionRisks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Risk Assessment Card */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              {renderRiskChart()}
              <div className="mt-4 space-y-2">
                {interventionRisks.map((risk, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <Badge 
                      variant={
                        risk.priority === InterventionPriority.CRITICAL 
                          ? 'destructive' 
                          : risk.priority === InterventionPriority.HIGH 
                            ? 'default' 
                            : 'secondary'
                      }
                    >
                      {risk.riskCategory}
                    </Badge>
                    <span>{risk.triggerDetails.join(', ')}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Intervention Recommendations Card */}
          <Card>
            <CardHeader>
              <CardTitle>Intervention Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {interventionRisks.map((risk, index) => (
                  <div key={index}>
                    <h4 className="font-semibold mb-2">{risk.riskCategory} Interventions</h4>
                    <ul className="list-disc pl-5">
                      {risk.recommendedInterventions.map((intervention, idx) => (
                        <li key={idx}>{intervention}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedStudent && (
        <div className="mt-6 flex space-x-4 justify-end">
          <Button onClick={createInterventionPlan}>
            Create Intervention Plan
          </Button>
          {interventionPlan && (
            <Button 
              variant="outline" 
              onClick={trackInterventionEffectiveness}
            >
              Track Effectiveness
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
