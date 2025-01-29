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
  Tooltip
} from 'recharts';
import { EthicalAIGovernanceService } from '@/lib/ethical-ai/ethical-ai-governance-service';
import { AIEthicalPrincipal, BiasCategory } from '@/lib/ethical-ai/ethical-ai-governance-engine';

export function EthicalAIDashboard({ aiSystemId }: { aiSystemId: string }) {
  const [ethicalAssessment, setEthicalAssessment] = useState<any>(null);
  const [biasAnalysis, setBiasAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ethicalAIService = new EthicalAIGovernanceService();

  useEffect(() => {
    async function fetchEthicalAIData() {
      setLoading(true);
      try {
        // Fetch Ethical Assessment
        const assessmentResult = await ethicalAIService.assessAISystemEthics(aiSystemId);
        
        if (assessmentResult.success) {
          setEthicalAssessment(assessmentResult.assessment);
        } else {
          throw new Error(assessmentResult.error);
        }

        // Fetch Bias Analysis for each category
        const biasAnalysisResults = {};
        for (const category of Object.values(BiasCategory)) {
          const biasResult = await ethicalAIService.detectAndMitigateBias(
            aiSystemId, 
            category
          );

          if (biasResult.success) {
            biasAnalysisResults[category] = biasResult;
          }
        }

        setBiasAnalysis(biasAnalysisResults);
      } catch (err) {
        console.error('Failed to fetch ethical AI data', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchEthicalAIData();
  }, [aiSystemId]);

  if (loading) {
    return <div>Loading Ethical AI Dashboard...</div>;
  }

  if (error) {
    return <div>Error loading Ethical AI data: {error}</div>;
  }

  // Prepare Ethical Principals Data for Radar Chart
  const ethicalPrincipalsData = Object.entries(
    ethicalAssessment.principalEvaluations
  ).map(([principal, evaluation]) => ({
    principal,
    complianceScore: (evaluation as any).complianceScore * 10
  }));

  // Prepare Bias Analysis Data for Bar Chart
  const biasAnalysisData = Object.entries(biasAnalysis || {}).map(
    ([category, analysis]) => ({
      category,
      biasSeverity: (analysis as any).biasDetectionResult.biasSeverityScore * 10
    })
  );

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold">Ethical AI Governance Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ethical Principals Compliance */}
        <Card>
          <CardHeader>
            <CardTitle>Ethical Principals Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={ethicalPrincipalsData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="principal" />
                <PolarRadiusAxis domain={[0, 10]} />
                <Radar 
                  dataKey="complianceScore" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.6} 
                />
              </RadarChart>
            </ResponsiveContainer>
            <div className="text-center mt-4">
              <p>
                Overall Ethical Score: 
                {(ethicalAssessment.overallEthicalScore * 100).toFixed(2)}%
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bias Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Bias Detection Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={biasAnalysisData}>
                <XAxis dataKey="category" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Bar dataKey="biasSeverity" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
            <div className="text-center mt-4">
              <p>Bias Severity Across Different Categories</p>
            </div>
          </CardContent>
        </Card>

        {/* Ethical Interventions */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recommended Ethical Interventions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ethicalAssessment.recommendedInterventions.map(
                (intervention, index) => (
                  <div 
                    key={index} 
                    className="bg-gray-100 p-3 rounded-lg"
                  >
                    <h3 className="font-semibold mb-2">
                      {intervention.principal || intervention.category}
                    </h3>
                    <p className="text-sm mb-2">
                      {intervention.description}
                    </p>
                    <div>
                      <p className="font-medium">Recommended Actions:</p>
                      <ul className="list-disc pl-5 text-sm">
                        {intervention.recommendedActions.map(
                          (action, actionIndex) => (
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
