'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StudentAnalyticsDashboard } from '@/components/academy/student-analytics-dashboard';
import { EquityDashboard } from '@/components/equity/equity-dashboard';
import { InterventionDashboard } from '@/components/intervention/intervention-dashboard';
import { RiskDashboard } from '@/components/risk-detection/risk-dashboard';
import { InterventionPlanningDashboard } from '@/components/intervention/intervention-planning-dashboard';
import { MLSupportDashboard } from '@/components/ml-support/ml-support-dashboard';
import { StudentGrowthDashboard } from '@/components/student-development/student-growth-dashboard';
import { ResearchIntegrationDashboard } from '@/components/research/research-integration-dashboard';
import { DivisionManagementDashboard } from '@/components/division/division-management-dashboard';
import { AssessmentInfrastructureDashboard } from '@/components/assessment/assessment-infrastructure-dashboard';
import { AdaptiveLearningDashboard } from '@/components/adaptive-learning/adaptive-learning-dashboard';
import { StrategicPartnershipDashboard } from '@/components/command-division/strategic-partnership-dashboard';

export default function OhioTechAcademyDashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Ohio Tech Academy Division</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Curriculum Development</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Curricula</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Programs</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Button variant="outline" className="w-full mt-4">
                Create New Curriculum
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Learning Pathways</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Personalized Paths</p>
                <p className="text-2xl font-bold">348</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Students Tracked</p>
                <p className="text-2xl font-bold">1,256</p>
              </div>
              <Button variant="outline" className="w-full mt-4">
                Generate Learning Paths
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scholarship & Support</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Scholarship Candidates</p>
                <p className="text-2xl font-bold">42</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Academic Interventions</p>
                <p className="text-2xl font-bold">87</p>
              </div>
              <Button variant="outline" className="w-full mt-4">
                Review Support Plans
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <StudentAnalyticsDashboard />
      <EquityDashboard />
      <InterventionDashboard />
      <RiskDashboard />
      <InterventionPlanningDashboard />
      <MLSupportDashboard />
      <StudentGrowthDashboard />
      <ResearchIntegrationDashboard />
      <DivisionManagementDashboard />
      <AssessmentInfrastructureDashboard />
      <AdaptiveLearningDashboard />
      <StrategicPartnershipDashboard />
    </div>
  );
}
