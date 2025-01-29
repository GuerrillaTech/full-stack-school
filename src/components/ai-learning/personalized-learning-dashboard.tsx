'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PersonalizedLearningService } from '@/lib/ai-learning/personalized-learning-service';
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
  LineChart,
  Line
} from 'recharts';

export function PersonalizedLearningDashboard({ studentId }: { studentId: string }) {
  const [learningPathRecommendation, setLearningPathRecommendation] = useState<any>(null);
  const [learningProgress, setLearningProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const personalizedLearningService = new PersonalizedLearningService();

  useEffect(() => {
    async function fetchPersonalizedLearningData() {
      setLoading(true);
      try {
        const pathRecommendation = await personalizedLearningService.recommendLearningPath(studentId);
        const progressTracking = await personalizedLearningService.trackLearningProgress(studentId);
        
        setLearningPathRecommendation(pathRecommendation);
        setLearningProgress(progressTracking);
      } catch (error) {
        console.error('Failed to fetch personalized learning data', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPersonalizedLearningData();
  }, [studentId]);

  if (loading) {
    return <div>Loading personalized learning dashboard...</div>;
  }

  if (!learningPathRecommendation || !learningProgress) {
    return <div>Unable to load personalized learning data</div>;
  }

  // Prepare data for Performance Metrics Radar Chart
  const performanceMetricsData = [
    { subject: 'Academic', A: learningProgress.performanceMetrics.academicPerformance * 10 },
    { subject: 'Skills', A: learningProgress.performanceMetrics.skillDevelopment * 10 },
    { subject: 'Career', A: learningProgress.performanceMetrics.careerPreparation * 10 },
    { subject: 'Personal Growth', A: learningProgress.performanceMetrics.personalGrowth * 10 }
  ];

  // Prepare data for Learning Path Progress
  const learningPathProgressData = learningProgress.learningPathProgress.pathSpecificProgress.map(
    (path: any) => ({
      pathType: path.pathType.replace('_', ' '),
      progress: path.progressPercentage
    })
  );

  // Prepare Strategic Learning Plan Data
  const strategicPlanData = learningPathRecommendation.comprehensiveLearningRecommendation;

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold">AI-Powered Personalized Learning Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={performanceMetricsData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis />
                <Radar 
                  dataKey="A" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.6} 
                />
              </RadarChart>
            </ResponsiveContainer>
            <div className="text-center mt-4">
              <p>Overall Performance Score: {learningProgress.learningPathProgress.overallProgress.toFixed(2)}%</p>
            </div>
          </CardContent>
        </Card>

        {/* Learning Path Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Learning Path Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={learningPathProgressData}>
                <XAxis dataKey="pathType" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="progress" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
            <div className="text-center mt-4">
              <p>Recommended Primary Path: {learningPathRecommendation.recommendedPrimaryPath.path}</p>
            </div>
          </CardContent>
        </Card>

        {/* Strategic Learning Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Strategic Learning Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Primary Focus</h3>
                <p>{learningPathRecommendation.recommendedPrimaryPath.path.replace('_', ' ')}</p>
              </div>
              <div>
                <h3 className="font-semibold">Strategic Objectives</h3>
                <ul className="list-disc pl-5">
                  {learningPathRecommendation.strategicLearningPlan.strategicObjectives.map(
                    (objective: string) => (
                      <li key={objective} className="text-sm">{objective}</li>
                    )
                  )}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold">Support Mechanisms</h3>
                <ul className="list-disc pl-5">
                  {learningPathRecommendation.strategicLearningPlan.supportMechanisms.map(
                    (mechanism: string) => (
                      <li key={mechanism} className="text-sm">{mechanism}</li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Learning Recommendations */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Comprehensive Learning Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Academic Improvement */}
              <div>
                <h3 className="font-semibold mb-2">Academic Improvement</h3>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="font-medium">Focus Areas:</p>
                  <ul className="list-disc pl-5 text-sm">
                    {strategicPlanData.academicImprovement.recommendedLearningPaths.focusAreas?.map(
                      (area: string) => (
                        <li key={area}>{area}</li>
                      )
                    )}
                  </ul>
                </div>
              </div>

              {/* Skill Development */}
              <div>
                <h3 className="font-semibold mb-2">Skill Development</h3>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="font-medium">Skill Tracks:</p>
                  <ul className="list-disc pl-5 text-sm">
                    {strategicPlanData.skillDevelopment.recommendedLearningPaths.skillDevelopmentTracks?.map(
                      (track: any) => (
                        <li key={track.skill}>{track.skill}</li>
                      )
                    )}
                  </ul>
                </div>
              </div>

              {/* Career Preparation */}
              <div>
                <h3 className="font-semibold mb-2">Career Preparation</h3>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="font-medium">Potential Careers:</p>
                  <ul className="list-disc pl-5 text-sm">
                    {strategicPlanData.careerPreparation.recommendedLearningPaths.potentialCareers?.map(
                      (career: string) => (
                        <li key={career}>{career}</li>
                      )
                    )}
                  </ul>
                </div>
              </div>

              {/* Personal Growth */}
              <div>
                <h3 className="font-semibold mb-2">Personal Growth</h3>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="font-medium">Growth Areas:</p>
                  <ul className="list-disc pl-5 text-sm">
                    {strategicPlanData.personalGrowth.recommendedLearningPaths.growthAreas?.map(
                      (area: string) => (
                        <li key={area}>{area}</li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
