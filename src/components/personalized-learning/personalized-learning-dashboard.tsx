'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  PieChart, 
  Pie, 
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { 
  Target, 
  BookOpen, 
  TrendingUp, 
  Star, 
  Compass 
} from 'lucide-react';
import { PersonalizedLearningPathwayService } from '@/lib/personalized-learning/personalized-learning-service';
import { 
  LearningPathwayType, 
  SkillLevel 
} from '@/lib/personalized-learning/personalized-learning-engine';

export function PersonalizedLearningDashboard({ userId }: { userId: string }) {
  const [learningPathways, setLearningPathways] = useState<any[]>([]);
  const [skillDevelopment, setSkillDevelopment] = useState<any[]>([]);
  const [careerDevelopment, setCareerDevelopment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const personalizedLearningService = new PersonalizedLearningPathwayService();

  useEffect(() => {
    async function fetchPersonalizedLearningData() {
      setLoading(true);
      try {
        // Fetch User's Learning Pathways
        const learningPathwaysResult = await fetchUserLearningPathways(userId);
        setLearningPathways(learningPathwaysResult);

        // Fetch Skill Development Tracking
        const skillDevelopmentResult = await fetchUserSkillDevelopment(userId);
        setSkillDevelopment(skillDevelopmentResult);

        // Fetch Career Development Pathway
        const careerDevelopmentResult = await fetchUserCareerDevelopment(userId);
        setCareerDevelopment(careerDevelopmentResult);

      } catch (err) {
        console.error('Failed to fetch personalized learning data', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPersonalizedLearningData();
  }, [userId]);

  // Utility methods to fetch user data
  async function fetchUserLearningPathways(userId: string) {
    try {
      const response = await fetch(`/api/learning-pathways/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch learning pathways');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching learning pathways:', error);
      return [];
    }
  }

  async function fetchUserSkillDevelopment(userId: string) {
    try {
      const response = await fetch(`/api/skill-development/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch skill development');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching skill development:', error);
      return [];
    }
  }

  async function fetchUserCareerDevelopment(userId: string) {
    try {
      const response = await fetch(`/api/career-development/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch career development');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching career development:', error);
      return null;
    }
  }

  if (loading) {
    return <div>Loading Personalized Learning Dashboard...</div>;
  }

  if (error) {
    return <div>Error loading personalized learning data: {error}</div>;
  }

  // Prepare Learning Pathway Data for Line Chart
  const learningPathwayData = learningPathways.map((pathway, index) => ({
    name: `Pathway ${index + 1}`,
    progress: pathway.progressPercentage || 0
  }));

  // Prepare Skill Development Data for Bar Chart
  const skillDevelopmentData = skillDevelopment.map(skill => ({
    skillName: skill.skillName,
    skillLevel: skill.currentSkillLevel === SkillLevel.BEGINNER ? 1 :
               skill.currentSkillLevel === SkillLevel.INTERMEDIATE ? 2 :
               skill.currentSkillLevel === SkillLevel.ADVANCED ? 3 : 4
  }));

  // Prepare Career Development Data for Pie Chart
  const careerDevelopmentData = careerDevelopment ? [
    { 
      name: 'Skill Gap', 
      value: careerDevelopment.skillGapAssessment.length 
    },
    { 
      name: 'Development Roadmap', 
      value: careerDevelopment.skillDevelopmentRoadmap.length 
    },
    { 
      name: 'Opportunities', 
      value: careerDevelopment.challengesAndOpportunities.length 
    }
  ] : [];

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold">Personalized Learning Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Learning Pathways */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2" /> Learning Pathways
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={learningPathwayData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="progress" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 text-sm">
              <p>
                <strong>Total Pathways:</strong> {learningPathways.length}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Skill Development */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2" /> Skill Development
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={skillDevelopmentData}>
                <XAxis dataKey="skillName" />
                <YAxis domain={[0, 4]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="skillLevel" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-sm">
              <p>
                <strong>Total Skills:</strong> {skillDevelopment.length}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Career Development */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2" /> Career Development
            </CardTitle>
          </CardHeader>
          <CardContent>
            {careerDevelopment ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={careerDevelopmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {careerDevelopmentData.map((entry, index) => (
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
            ) : (
              <div className="text-center text-gray-500">
                No career development pathway available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Learning Achievements */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="mr-2" /> Learning Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { 
                  title: 'Active Learning Pathways', 
                  value: learningPathways.length, 
                  icon: <Target /> 
                },
                { 
                  title: 'Skills in Development', 
                  value: skillDevelopment.length, 
                  icon: <BookOpen /> 
                },
                { 
                  title: 'Career Development Progress', 
                  value: careerDevelopment 
                    ? careerDevelopmentData.reduce((sum, item) => sum + item.value, 0) 
                    : 0, 
                  icon: <Compass /> 
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
