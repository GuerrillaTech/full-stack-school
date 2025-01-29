'use client';

import { useState, useEffect } from 'react';
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
  Tooltip, 
  Legend,
  PieChart, 
  Pie, 
  Cell,
  ResponsiveContainer
} from 'recharts';
import { 
  Network, 
  BookOpen, 
  Users, 
  Award 
} from 'lucide-react';
import { CollaborativeLearningService } from '@/lib/collaborative-learning/collaborative-learning-service';
import { 
  CollaborationMode, 
  KnowledgeType 
} from '@/lib/collaborative-learning/collaborative-learning-engine';

export function CollaborativeLearningDashboard({ userId }: { userId: string }) {
  const [knowledgeNetworks, setKnowledgeNetworks] = useState<any[]>([]);
  const [crossDisciplinaryLearning, setCrossDisciplinaryLearning] = useState<any[]>([]);
  const [knowledgeContributions, setKnowledgeContributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const collaborativeLearningService = new CollaborativeLearningService();

  useEffect(() => {
    async function fetchCollaborativeLearningData() {
      setLoading(true);
      try {
        // Fetch Knowledge Networks
        const knowledgeNetworksResult = await collaborativeLearningService.discoverKnowledgeNetworks(
          userId
        );
        
        if (knowledgeNetworksResult.success) {
          setKnowledgeNetworks(knowledgeNetworksResult.knowledgeNetworks);
        } else {
          throw new Error(knowledgeNetworksResult.error);
        }

        // Fetch Cross-Disciplinary Learning Opportunities
        const crossDisciplinaryResult = await collaborativeLearningService.exploreCrossDisciplinaryLearning(
          userId
        );

        if (crossDisciplinaryResult.success) {
          setCrossDisciplinaryLearning(
            crossDisciplinaryResult.crossDisciplinaryOpportunities
          );
        } else {
          throw new Error(crossDisciplinaryResult.error);
        }

        // Fetch User's Knowledge Contributions
        const userContributions = await fetchUserKnowledgeContributions(userId);
        setKnowledgeContributions(userContributions);

      } catch (err) {
        console.error('Failed to fetch collaborative learning data', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCollaborativeLearningData();
  }, [userId]);

  // Utility method to fetch user's knowledge contributions
  async function fetchUserKnowledgeContributions(userId: string) {
    try {
      const response = await fetch(`/api/knowledge-contributions/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch knowledge contributions');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching knowledge contributions:', error);
      return [];
    }
  }

  if (loading) {
    return <div>Loading Collaborative Learning Dashboard...</div>;
  }

  if (error) {
    return <div>Error loading collaborative learning data: {error}</div>;
  }

  // Prepare Knowledge Contribution Data for Bar Chart
  const knowledgeContributionData = Object.values(
    knowledgeContributions.reduce((acc, contribution) => {
      const type = contribution.knowledgeType;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {})
  ).map((count, index) => ({
    type: Object.keys(KnowledgeType)[index],
    count
  }));

  // Prepare Knowledge Network Data for Pie Chart
  const knowledgeNetworkData = knowledgeNetworks.map(network => ({
    name: network.name,
    collaborationScore: network.collaborationScore
  }));

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold">Collaborative Learning Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Knowledge Networks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Network className="mr-2" /> Knowledge Networks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={knowledgeNetworkData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="collaborationScore"
                >
                  {knowledgeNetworkData.map((entry, index) => (
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
            <div className="mt-4 text-sm">
              <p>
                <strong>Total Potential Collaborators:</strong> {knowledgeNetworks.length}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Knowledge Contributions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2" /> Knowledge Contributions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={knowledgeContributionData}>
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-sm">
              <p>
                <strong>Total Contributions:</strong> {knowledgeContributions.length}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cross-Disciplinary Learning */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2" /> Cross-Disciplinary Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {crossDisciplinaryLearning.map((opportunity, index) => (
                <div 
                  key={index} 
                  className="bg-gray-100 p-3 rounded-lg"
                >
                  <h3 className="font-semibold mb-1">
                    {opportunity.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {opportunity.domain}
                  </p>
                  <p className="text-xs mt-2">
                    {opportunity.recommendationReason}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Collaborative Learning Achievements */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="mr-2" /> Learning Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { 
                  title: 'Knowledge Sharing', 
                  value: knowledgeContributions.length, 
                  icon: <BookOpen /> 
                },
                { 
                  title: 'Collaboration Score', 
                  value: knowledgeNetworks.reduce(
                    (sum, network) => sum + network.collaborationScore, 
                    0
                  ).toFixed(2), 
                  icon: <Network /> 
                },
                { 
                  title: 'Cross-Disciplinary Opportunities', 
                  value: crossDisciplinaryLearning.length, 
                  icon: <Users /> 
                }
              ].map((achievement, index) => (
                <div 
                  key={index} 
                  className="bg-gray-100 p-4 rounded-lg flex items-center"
                >
                  <div className="mr-4 text-blue-500">
                    {achievement.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{achievement.title}</p>
                    <p className="text-lg font-bold">{achievement.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
