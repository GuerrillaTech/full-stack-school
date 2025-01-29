'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  EthicalTechnologyAssessmentService, 
  TechnologyDomain,
  EthicalRiskLevel,
  ImpactCategory 
} from '@/lib/ethics/ethical-technology-assessment-service';
import { 
  RadarChart, 
  BarChart, 
  HeatmapChart,
  NetworkGraph,
  PieChart 
} from '@/components/charts';
import { toast } from 'react-toastify';

export function EthicalTechnologyAssessmentDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [technologyAssessments, setTechnologyAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [assessmentAnalysis, setAssessmentAnalysis] = useState(null);
  const [governanceRecommendations, setGovernanceRecommendations] = useState(null);

  const ethicalTechnologyService = new EthicalTechnologyAssessmentService();

  useEffect(() => {
    fetchTechnologyAssessments();
  }, []);

  useEffect(() => {
    if (selectedAssessment) {
      fetchAssessmentAnalysis();
    }
  }, [selectedAssessment]);

  const fetchTechnologyAssessments = async () => {
    try {
      const assessments = await ethicalTechnologyService.prisma.ethicalTechnologyAssessment.findMany();
      setTechnologyAssessments(assessments);
    } catch (error) {
      toast.error('Failed to fetch technology assessments');
    }
  };

  const fetchAssessmentAnalysis = async () => {
    try {
      const analysisResult = await ethicalTechnologyService.performEthicalTechnologyAssessment(
        selectedAssessment.id
      );
      
      setAssessmentAnalysis(analysisResult);
      
      // Fetch Ethical Governance Recommendations
      const recommendations = await ethicalTechnologyService.generateEthicalGovernanceRecommendations(
        selectedAssessment.id
      );
      
      setGovernanceRecommendations(recommendations);
    } catch (error) {
      toast.error('Failed to fetch ethical technology assessment');
    }
  };

  const renderTechnologyOverview = () => {
    if (!technologyAssessments.length) return null;

    return (
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Technology Domains</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={{
                labels: Object.values(TechnologyDomain),
                datasets: [{
                  label: 'Technology Domain Distribution',
                  data: Object.values(TechnologyDomain).map(domain => 
                    technologyAssessments.filter(
                      assessment => JSON.parse(assessment.configDetails).domain === domain
                    ).length
                  )
                }]
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ethical Risk Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart 
              data={{
                labels: Object.values(EthicalRiskLevel),
                datasets: [{
                  label: 'Ethical Risk Distribution',
                  data: Object.values(EthicalRiskLevel).map(riskLevel => 
                    technologyAssessments.filter(
                      assessment => JSON.parse(assessment.ethicalRiskPrediction || '{}').riskLevel === riskLevel
                    ).length
                  )
                }]
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Impact Category Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <HeatmapChart 
              data={{
                xLabels: technologyAssessments.map(assessment => assessment.technologyName),
                yLabels: Object.values(ImpactCategory),
                data: technologyAssessments.map(assessment => 
                  Object.values(ImpactCategory).map(category => 
                    JSON.parse(assessment.ethicalConsiderations || '{}')[category] || 0
                  )
                )
              }}
            />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Technology Assessment Network</CardTitle>
          </CardHeader>
          <CardContent>
            <NetworkGraph 
              data={{
                nodes: technologyAssessments.map(assessment => ({
                  id: assessment.id,
                  label: assessment.technologyName,
                  size: JSON.parse(assessment.ethicalRiskPrediction || '{}').riskScore || 0.5
                })),
                edges: technologyAssessments.map((assessment, index) => ({
                  source: assessment.id,
                  target: technologyAssessments[index + 1]?.id
                })).slice(0, -1)
              }}
            />
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAssessmentAnalysis = () => {
    if (!assessmentAnalysis) return null;

    const { 
      ethicalTechnologyAssessment, 
      ethicalRiskPrediction,
      stakeholderImpactAnalysis,
      comprehensiveEthicalAssessment 
    } = assessmentAnalysis;

    return (
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Ethical Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <RadarChart 
              data={{
                labels: Object.values(ImpactCategory),
                datasets: [{
                  label: 'Impact Scores',
                  data: Object.values(ImpactCategory).map(
                    category => ethicalRiskPrediction.impactScores[category]
                  )
                }]
              }}
            />
            <div className="mt-4 text-center">
              <Badge variant={
                ethicalRiskPrediction.riskLevel === EthicalRiskLevel.NEGLIGIBLE 
                  ? 'default' 
                  : 'destructive'
              }>
                Risk Level: {ethicalRiskPrediction.riskLevel}
                (Score: {(ethicalRiskPrediction.riskScore * 100).toFixed(2)}%)
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stakeholder Impact Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={{
                labels: stakeholderImpactAnalysis.map(analysis => analysis.group),
                datasets: [
                  {
                    label: 'Benefit Confidence',
                    data: stakeholderImpactAnalysis.map(analysis => 
                      analysis.benefitClassifications.reduce(
                        (sum, benefit) => sum + benefit.confidence, 0
                      ) / analysis.benefitClassifications.length
                    )
                  },
                  {
                    label: 'Risk Confidence',
                    data: stakeholderImpactAnalysis.map(analysis => 
                      analysis.riskClassifications.reduce(
                        (sum, risk) => sum + risk.confidence, 0
                      ) / analysis.riskClassifications.length
                    )
                  }
                ]
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technology Assessment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="bg-gray-100 p-2 rounded">
                <strong>Technology Name:</strong> {ethicalTechnologyAssessment.technologyName}
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <strong>Domain:</strong> {ethicalTechnologyAssessment.domain}
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <strong>Development Stage:</strong> 
                {JSON.parse(ethicalTechnologyAssessment.configDetails).developmentStage}
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <strong>Stakeholder Groups:</strong>
                {ethicalTechnologyAssessment.stakeholderGroups}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Comprehensive Ethical Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {comprehensiveEthicalAssessment && 
                Object.entries(comprehensiveEthicalAssessment).map(([key, value]) => (
                  <div key={key} className="bg-gray-100 p-2 rounded">
                    <strong>{key}:</strong> {String(value)}
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderGovernanceRecommendations = () => {
    if (!governanceRecommendations) return null;

    return (
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Ethical Technology Governance Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(governanceRecommendations).map(([key, value]) => (
                <div key={key} className="bg-gray-100 p-2 rounded">
                  <strong>{key}:</strong> {String(value)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Governance Strategy Network</CardTitle>
          </CardHeader>
          <CardContent>
            <NetworkGraph 
              data={{
                nodes: Object.keys(governanceRecommendations).map(key => ({
                  id: key,
                  label: key
                })),
                edges: Object.keys(governanceRecommendations).map((key, index) => ({
                  source: key,
                  target: Object.keys(governanceRecommendations)[index + 1]
                })).slice(0, -1)
              }}
            />
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ethical Technology Assessment Platform</CardTitle>
          <CardDescription>
            Comprehensive technological ethics and governance evaluation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <select
              value={selectedAssessment?.id || ''}
              onChange={(e) => {
                const assessment = technologyAssessments.find(
                  a => a.id === e.target.value
                );
                setSelectedAssessment(assessment);
              }}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Technology Assessment</option>
              {technologyAssessments.map(assessment => (
                <option key={assessment.id} value={assessment.id}>
                  {assessment.technologyName} - {assessment.domain}
                </option>
              ))}
            </select>
          </div>

          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
          >
            <TabsList>
              <TabsTrigger value="overview">Technology Overview</TabsTrigger>
              <TabsTrigger value="assessment-analysis">
                Assessment Analysis
              </TabsTrigger>
              <TabsTrigger value="governance-recommendations">
                Governance Recommendations
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              {renderTechnologyOverview()}
            </TabsContent>
            
            <TabsContent value="assessment-analysis">
              {renderAssessmentAnalysis()}
            </TabsContent>
            
            <TabsContent value="governance-recommendations">
              {renderGovernanceRecommendations()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
