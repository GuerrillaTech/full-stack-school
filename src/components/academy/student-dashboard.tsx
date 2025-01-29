'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AcademyService } from '@/lib/academy/academy-service';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export function StudentDashboard({ studentId }: { studentId: string }) {
  const [studentAnalytics, setStudentAnalytics] = useState<any>(null);
  const [supportPlan, setSupportPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const academyService = new AcademyService();

  useEffect(() => {
    async function fetchStudentData() {
      setLoading(true);
      try {
        const analytics = await academyService.getStudentAnalytics(studentId);
        const support = await academyService.generateAcademicSupportPlan(studentId);
        
        setStudentAnalytics(analytics);
        setSupportPlan(support);
      } catch (error) {
        console.error('Failed to fetch student data', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStudentData();
  }, [studentId]);

  if (loading) {
    return <div>Loading student dashboard...</div>;
  }

  if (!studentAnalytics || !supportPlan) {
    return <div>Unable to load student data</div>;
  }

  const performanceData = studentAnalytics.basicProgress.student.results.map((result: any) => ({
    subject: result.exam?.lesson?.subject?.name || result.assignment?.lesson?.subject?.name,
    score: result.score
  }));

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold">Student Academic Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Academic Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Scholarship Eligibility */}
        <Card>
          <CardHeader>
            <CardTitle>Scholarship Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Current Level</h3>
                <p>{supportPlan.scholarshipEligibility?.scholarshipRecommendation.level}</p>
              </div>
              <div>
                <h3 className="font-semibold">Funding Potential</h3>
                <Progress 
                  value={supportPlan.scholarshipEligibility?.scholarshipRecommendation.fundingPercentage} 
                />
                <p>
                  {supportPlan.scholarshipEligibility?.scholarshipRecommendation.fundingPercentage}% 
                  Scholarship Potential
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Intervention Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Academic Support Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h3 className="font-semibold">Recommended Interventions</h3>
              {supportPlan.supportPlan.interventionStrategy.map((intervention: any) => (
                <div key={intervention.subject} className="bg-gray-100 p-2 rounded">
                  <p className="font-medium">{intervention.subject}</p>
                  <ul className="list-disc pl-5 text-sm">
                    {intervention.suggestedResources.map((resource: string) => (
                      <li key={resource}>{resource}</li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="mt-4">
                <h4 className="font-semibold">Additional Resources</h4>
                <ul className="list-disc pl-5">
                  {supportPlan.supportPlan.additionalResources.map((resource: string) => (
                    <li key={resource}>{resource}</li>
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
