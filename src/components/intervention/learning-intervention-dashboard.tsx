'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';
import { LearningInterventionService } from '@/lib/intervention/learning-intervention-service';
import { InterventionType, RiskLevel } from '@/lib/intervention/learning-intervention-engine';

export function LearningInterventionDashboard({ studentId }: { studentId: string }) {
  const [comprehensiveSupport, setComprehensiveSupport] = useState<any>(null);
  const [earlyWarningData, setEarlyWarningData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const interventionService = new LearningInterventionService();

  useEffect(() => {
    async function fetchInterventionData() {
      setLoading(true);
      try {
        // Fetch Comprehensive Student Support
        const comprehensiveSupportResult = await interventionService.provideComprehensiveStudentSupport(
          studentId
        );
        
        if (comprehensiveSupportResult.success) {
          setComprehensiveSupport(comprehensiveSupportResult);
        } else {
          throw new Error(comprehensiveSupportResult.error);
        }

        // Fetch Early Warning System Data
        const earlyWarningResult = await interventionService.earlyWarningAndSupportSystem(
          studentId
        );

        if (earlyWarningResult.success) {
          setEarlyWarningData(earlyWarningResult);
        } else {
          throw new Error(earlyWarningResult.error);
        }
      } catch (err) {
        console.error('Failed to fetch intervention data', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchInterventionData();
  }, [studentId]);

  if (loading) {
    return <div>Loading Learning Intervention Dashboard...</div>;
  }

  if (error) {
    return <div>Error loading intervention data: {error}</div>;
  }

  // Prepare Risk Assessment Data for Radar Chart
  const riskAssessmentData = [
    { 
      dimension: 'Academic', 
      riskLevel: comprehensiveSupport.riskAssessment.riskAssessment.academicRiskLevel === RiskLevel.LOW ? 1 :
                 comprehensiveSupport.riskAssessment.riskAssessment.academicRiskLevel === RiskLevel.MODERATE ? 2 :
                 comprehensiveSupport.riskAssessment.riskAssessment.academicRiskLevel === RiskLevel.HIGH ? 3 : 4
    },
    { 
      dimension: 'Emotional', 
      riskLevel: comprehensiveSupport.riskAssessment.riskAssessment.emotionalRiskLevel === RiskLevel.LOW ? 1 :
                 comprehensiveSupport.riskAssessment.riskAssessment.emotionalRiskLevel === RiskLevel.MODERATE ? 2 :
                 comprehensiveSupport.riskAssessment.riskAssessment.emotionalRiskLevel === RiskLevel.HIGH ? 3 : 4
    },
    { 
      dimension: 'Skill Development', 
      riskLevel: comprehensiveSupport.riskAssessment.riskAssessment.skillDevelopmentRiskLevel === RiskLevel.LOW ? 1 :
                 comprehensiveSupport.riskAssessment.riskAssessment.skillDevelopmentRiskLevel === RiskLevel.MODERATE ? 2 :
                 comprehensiveSupport.riskAssessment.riskAssessment.skillDevelopmentRiskLevel === RiskLevel.HIGH ? 3 : 4
    },
    { 
      dimension: 'Career Preparation', 
      riskLevel: comprehensiveSupport.riskAssessment.riskAssessment.careerPreparationRiskLevel === RiskLevel.LOW ? 1 :
                 comprehensiveSupport.riskAssessment.riskAssessment.careerPreparationRiskLevel === RiskLevel.MODERATE ? 2 :
                 comprehensiveSupport.riskAssessment.riskAssessment.careerPreparationRiskLevel === RiskLevel.HIGH ? 3 : 4
    }
  ];

  // Prepare Early Warning Triggers Data
  const earlyWarningTriggersData = earlyWarningData.earlyWarningTriggers.map(
    (trigger: any) => ({
      riskType: trigger.riskType.replace('Risk', ''),
      riskLevel: trigger.currentRiskLevel === RiskLevel.LOW ? 1 :
                 trigger.currentRiskLevel === RiskLevel.MODERATE ? 2 :
                 trigger.currentRiskLevel === RiskLevel.HIGH ? 3 : 4
    })
  );

  // Determine Overall Risk Level Icon
  const getRiskLevelIcon = (riskLevel: RiskLevel) => {
    switch (riskLevel) {
      case RiskLevel.LOW:
        return <CheckCircle className="text-green-500" />;
      case RiskLevel.MODERATE:
        return <AlertTriangle className="text-yellow-500" />;
      case RiskLevel.HIGH:
        return <AlertCircle className="text-orange-500" />;
      case RiskLevel.CRITICAL:
        return <AlertCircle className="text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold">Learning Intervention Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Risk Assessment Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-4">
              {getRiskLevelIcon(comprehensiveSupport.riskAssessment.riskAssessment.overallRiskLevel)}
              <span className="ml-2 font-semibold">
                Overall Risk Level: {comprehensiveSupport.riskAssessment.riskAssessment.overallRiskLevel}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={riskAssessmentData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="dimension" />
                <PolarRadiusAxis domain={[0, 4]} />
                <Radar 
                  dataKey="riskLevel" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.6} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Early Warning Triggers */}
        <Card>
          <CardHeader>
            <CardTitle>Early Warning Triggers</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={earlyWarningTriggersData}>
                <XAxis dataKey="riskType" />
                <YAxis domain={[0, 4]} />
                <Tooltip />
                <Bar dataKey="riskLevel" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4">
              <p className="font-semibold">Active Warning Triggers:</p>
              <ul className="list-disc pl-5 text-sm">
                {earlyWarningData.earlyWarningTriggers.map(
                  (trigger: any, index: number) => (
                    <li key={index}>
                      {trigger.riskType.replace('Risk', '')}: {trigger.triggerDescription}
                    </li>
                  )
                )}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Intervention Plans */}
        <Card>
          <CardHeader>
            <CardTitle>Intervention Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {comprehensiveSupport.interventionPlans.interventionPlans.map(
                (plan: any, index: number) => (
                  <div 
                    key={index} 
                    className="bg-gray-100 p-3 rounded-lg"
                  >
                    <h3 className="font-semibold mb-2">
                      {plan.interventionType} Intervention
                    </h3>
                    <div className="text-sm">
                      <p className="font-medium">Strategic Objectives:</p>
                      <ul className="list-disc pl-5">
                        {plan.strategicObjectives.slice(0, 3).map(
                          (objective: string, objIndex: number) => (
                            <li key={objIndex}>{objective}</li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Proactive Support Recommendations */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Proactive Support Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {earlyWarningData.proactiveSupportRecommendations.map(
                (recommendation: any, index: number) => (
                  <div 
                    key={index} 
                    className="bg-gray-100 p-3 rounded-lg"
                  >
                    <h3 className="font-semibold mb-2">
                      {recommendation.trigger.riskType.replace('Risk', '')} Support
                    </h3>
                    <div className="text-sm">
                      <p className="font-medium">Recommended Actions:</p>
                      <ul className="list-disc pl-5">
                        {recommendation.interventionPlan.actionSteps.slice(0, 3).map(
                          (action: string, actionIndex: number) => (
                            <li key={actionIndex}>{action}</li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
