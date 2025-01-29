'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CollaborationService } from '@/lib/organizational-integration/collaboration-service';
import { DivisionType } from '@prisma/client';

export function CrossDivisionCollaborationDashboard() {
  const [selectedDivision, setSelectedDivision] = useState<DivisionType>('ADMIRALTY');
  const [collaborationInsights, setCollaborationInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const collaborationService = new CollaborationService();

  useEffect(() => {
    async function fetchCollaborationInsights() {
      setLoading(true);
      try {
        const insights = await collaborationService.getCollaborationInsights(selectedDivision);
        setCollaborationInsights(insights);
      } catch (error) {
        console.error('Failed to fetch collaboration insights', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCollaborationInsights();
  }, [selectedDivision]);

  const divisions: DivisionType[] = [
    'ADMIRALTY', 
    'COMMAND', 
    'OHIO_TECH', 
    'SALLIRREUG_TECH', 
    'RESEARCH_ETHICS'
  ];

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold">Cross-Division Collaboration Dashboard</h1>
      
      <div className="flex space-x-2 mb-4">
        {divisions.map(division => (
          <Button
            key={division}
            variant={selectedDivision === division ? 'default' : 'outline'}
            onClick={() => setSelectedDivision(division)}
          >
            {division.replace('_', ' ')}
          </Button>
        ))}
      </div>

      {loading ? (
        <div>Loading collaboration insights...</div>
      ) : collaborationInsights ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Collaboration Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>Total Initiatives: {collaborationInsights.monthlyReport.metrics.totalInitiatives}</p>
                <p>Unique Collaborating Divisions: {collaborationInsights.monthlyReport.metrics.uniqueCollaboratingDivisions}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Collaboration Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h3 className="font-semibold">Recommended Divisions:</h3>
                <ul className="list-disc pl-5">
                  {collaborationInsights.recommendations.recommendedDivisions.map((div: string) => (
                    <li key={div}>{div}</li>
                  ))}
                </ul>
                <h3 className="font-semibold mt-2">Potential Initiatives:</h3>
                <ul className="list-disc pl-5">
                  {collaborationInsights.recommendations.potentialInitiatives.map((initiative: string) => (
                    <li key={initiative}>{initiative}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Initiative Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(collaborationInsights.monthlyReport.metrics.initiativesByStatus || {}).map(([status, count]) => (
                  <div 
                    key={status} 
                    className="bg-gray-100 p-3 rounded-lg text-center"
                  >
                    <h4 className="font-semibold">{status}</h4>
                    <p className="text-xl">{count}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div>No collaboration insights available.</div>
      )}
    </div>
  );
}
