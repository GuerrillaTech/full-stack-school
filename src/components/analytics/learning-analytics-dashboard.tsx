'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LearningAnalyticsService } from '@/lib/analytics/learning-analytics-service';
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
  Tooltip
} from 'recharts';

export function LearningAnalyticsDashboard({ studentId }: { studentId: string }) {
  const [learningProfile, setLearningProfile] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const learningAnalyticsService = new LearningAnalyticsService();

  useEffect(() => {
    async function fetchLearningAnalyticsData() {
      setLoading(true);
      try {
        const profile = await learningAnalyticsService.generateStudentLearningProfile(studentId);
        const recommendedLearning = await learningAnalyticsService.generateLearningRecommendations(studentId);
        
        setLearningProfile(profile);
        setRecommendations(recommendedLearning);
      } catch (error) {
        console.error('Failed to fetch learning analytics data', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLearningAnalyticsData();
  }, [studentId]);

  if (loading) {
    return <div>Loading learning analytics dashboard...</div>;
  }

  if (!learningProfile || !recommendations) {
    return <div>Unable to load learning analytics data</div>;
  }

  // Prepare data for Radar Chart (Learning Styles)
  const learningStyleData = [
    { subject: 'Visual', A: learningProfile.learningProfile.learningStyle === 'VISUAL' ? 100 : 20 },
    { subject: 'Auditory', A: learningProfile.learningProfile.learningStyle === 'AUDITORY' ? 100 : 20 },
    { subject: 'Kinesthetic', A: learningProfile.learningProfile.learningStyle === 'KINESTHETIC' ? 100 : 20 },
    { subject: 'Reading/Writing', A: learningProfile.learningProfile.learningStyle === 'READING_WRITING' ? 100 : 20 }
  ];

  // Prepare data for Cognitive Load Bar Chart
  const cognitiveLoadData = Object.entries(learningProfile.learningProfile.cognitiveLoadProfile.factors).map(
    ([key, value]) => ({ factor: key, score: value as number })
  );

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold">Personalized Learning Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Learning Style Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Learning Style Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={learningStyleData}>
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
              <p>Primary Learning Style: {learningProfile.learningProfile.learningStyle}</p>
              <p>{learningProfile.learningProfile.insights.learningStyleStrengths}</p>
            </div>
          </CardContent>
        </Card>

        {/* Cognitive Load Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Cognitive Load Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cognitiveLoadData}>
                <XAxis dataKey="factor" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
            <div className="text-center mt-4">
              <p>Cognitive Load Level: {learningProfile.learningProfile.cognitiveLoadProfile.level}</p>
              <p>{learningProfile.learningProfile.insights.cognitiveLoadInsight}</p>
            </div>
          </CardContent>
        </Card>

        {/* Performance Prediction */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Prediction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Predicted Performance</h3>
                <Progress 
                  value={learningProfile.learningProfile.performancePrediction.predictedScore} 
                  max={100}
                />
                <p>{learningProfile.learningProfile.insights.performancePotential}</p>
              </div>
              <div>
                <h3 className="font-semibold">Confidence Interval</h3>
                <p>
                  {learningProfile.learningProfile.performancePrediction.confidenceInterval.lower} - 
                  {learningProfile.learningProfile.performancePrediction.confidenceInterval.upper}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Recommendations */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personalized Learning Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Learning Style Recommendations */}
              <div>
                <h3 className="font-semibold mb-2">Learning Style Resources</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {recommendations.recommendations.learningStyleOptimizedResources.map((resource: string) => (
                    <li key={resource} className="text-sm">{resource}</li>
                  ))}
                </ul>
              </div>

              {/* Cognitive Load Strategies */}
              <div>
                <h3 className="font-semibold mb-2">Cognitive Load Management</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {recommendations.recommendations.cognitiveLoadManagementStrategies.map((strategy: string) => (
                    <li key={strategy} className="text-sm">{strategy}</li>
                  ))}
                </ul>
              </div>

              {/* Performance Enhancement Plan */}
              <div>
                <h3 className="font-semibold mb-2">Performance Enhancement</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {recommendations.recommendations.performanceEnhancementPlan.recommendedResources.map((resource: string) => (
                    <li key={resource} className="text-sm">{resource}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
