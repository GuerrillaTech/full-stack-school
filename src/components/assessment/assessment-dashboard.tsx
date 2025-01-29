'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AssessmentService } from '@/lib/assessment/assessment-service';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

export function AssessmentDashboard({ studentId }: { studentId: string }) {
  const [performanceAnalysis, setPerformanceAnalysis] = useState<any>(null);
  const [learningInterventions, setLearningInterventions] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const assessmentService = new AssessmentService();

  useEffect(() => {
    async function fetchAssessmentData() {
      setLoading(true);
      try {
        const performance = await assessmentService.analyzeStudentPerformance(studentId);
        const interventions = await assessmentService.recommendLearningInterventions(studentId);
        
        setPerformanceAnalysis(performance);
        setLearningInterventions(interventions);
      } catch (error) {
        console.error('Failed to fetch assessment data', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAssessmentData();
  }, [studentId]);

  if (loading) {
    return <div>Loading assessment dashboard...</div>;
  }

  if (!performanceAnalysis || !learningInterventions) {
    return <div>Unable to load assessment data</div>;
  }

  // Transform performance data for charts
  const performanceData = Object.entries(performanceAnalysis.performanceBySubject).map(
    ([subject, data]) => ({
      subject,
      averageScore: data.averageScore
    })
  );

  const performanceTrendData = performanceAnalysis.performanceTrend.map(
    (trend: any) => ({
      date: new Date(trend.date).toLocaleDateString(),
      score: trend.score
    })
  );

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold">Comprehensive Assessment Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Subject Performance */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Subject Performance Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <XAxis dataKey="subject" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="averageScore" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Overall Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Performance Classification</h3>
                <p>{performanceAnalysis.performanceInsights.overallPerformance}</p>
              </div>
              <div>
                <h3 className="font-semibold">Overall Average Score</h3>
                <Progress 
                  value={performanceAnalysis.overallAverageScore} 
                />
                <p>{performanceAnalysis.overallAverageScore.toFixed(2)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Trend */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceTrendData}>
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Learning Interventions */}
        <Card>
          <CardHeader>
            <CardTitle>Learning Intervention Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {learningInterventions.recommendedInterventions.map((intervention: any) => (
                <div key={intervention.subject} className="bg-gray-100 p-3 rounded-lg">
                  <h4 className="font-semibold">{intervention.subject}</h4>
                  <ul className="list-disc pl-5 text-sm">
                    {intervention.suggestedResources.map((resource: string) => (
                      <li key={resource}>{resource}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
