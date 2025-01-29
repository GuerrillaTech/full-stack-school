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
  InnovationPipelineVisualizationService, 
  InnovationStage,
  InnovationDomain 
} from '@/lib/innovation/innovation-pipeline-visualization-service';
import { 
  RadarChart, 
  BarChart, 
  LineChart,
  SankeyChart,
  NetworkGraph 
} from '@/components/charts';
import { toast } from 'react-toastify';

export function InnovationPipelineVisualizationDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [innovationProjects, setInnovationProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);
  const [portfolioAnalysis, setPortfolioAnalysis] = useState(null);
  const [collaborationRecommendations, setCollaborationRecommendations] = useState(null);

  const pipelineService = new InnovationPipelineVisualizationService();

  useEffect(() => {
    fetchInnovationProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchProjectDetails();
    }
  }, [selectedProject]);

  const fetchInnovationProjects = async () => {
    try {
      const organizationId = 'current-organization-id'; // Replace with actual logic
      const portfolioData = await pipelineService.analyzeInnovationPortfolio(
        organizationId
      );
      
      setInnovationProjects(portfolioData.projects);
      setSelectedProject(portfolioData.projects[0]?.id);
      setPortfolioAnalysis(portfolioData.portfolioAnalysis);

      // Fetch collaboration recommendations
      const collaborationData = await pipelineService.generateCrossProjectCollaborationRecommendations(
        organizationId
      );
      setCollaborationRecommendations(collaborationData);
    } catch (error) {
      toast.error('Failed to fetch innovation projects');
    }
  };

  const fetchProjectDetails = async () => {
    try {
      const progressPrediction = await pipelineService.predictInnovationProjectTrajectory(
        selectedProject
      );
      
      const project = innovationProjects.find(p => p.id === selectedProject);
      
      setProjectDetails({
        ...project,
        progressPrediction
      });
    } catch (error) {
      toast.error('Failed to fetch project details');
    }
  };

  const renderInnovationOverview = () => {
    if (!projectDetails) return null;

    return (
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Project Trajectory</CardTitle>
          </CardHeader>
          <CardContent>
            <RadarChart 
              data={{
                labels: [
                  'Success Probability', 
                  'Time to Commercialization', 
                  'Resource Intensity'
                ],
                datasets: [{
                  label: 'Project Metrics',
                  data: [
                    projectDetails.progressPrediction.successProbability,
                    projectDetails.progressPrediction.timeToCommercialization,
                    projectDetails.progressPrediction.resourceIntensity
                  ]
                }]
              }}
            />
            <div className="mt-4 text-center space-x-2">
              <Badge variant="outline">
                Stage: {projectDetails.currentStage}
              </Badge>
              <Badge variant="outline">
                Domain: {projectDetails.domain}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stage Progression</CardTitle>
          </CardHeader>
          <CardContent>
            <SankeyChart 
              data={{
                nodes: Object.values(InnovationStage).map(stage => ({
                  name: stage,
                  color: stage === projectDetails.currentStage ? 'green' : 'gray'
                })),
                links: JSON.parse(projectDetails.stageHistory || '[]').map((entry, index, arr) => ({
                  source: arr[index - 1]?.stage || 'IDEATION',
                  target: entry.stage,
                  value: 1
                }))
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Strategic Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {projectDetails.aiStrategy && 
                Object.entries(JSON.parse(projectDetails.aiStrategy)).map(([key, value]) => (
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

  const renderInnovationPortfolio = () => {
    if (!portfolioAnalysis) return null;

    return (
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Composition</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={{
                labels: Object.values(InnovationDomain),
                datasets: [{
                  label: 'Projects per Domain',
                  data: Object.values(InnovationDomain).map(domain => 
                    innovationProjects.filter(p => p.domain === domain).length
                  )
                }]
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Innovation Potential</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart 
              data={{
                labels: innovationProjects.map(project => project.name),
                datasets: [{
                  label: 'Success Probability',
                  data: innovationProjects.map(project => project.successProbability || 0)
                }]
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Network</CardTitle>
          </CardHeader>
          <CardContent>
            <NetworkGraph 
              data={{
                nodes: innovationProjects.map(project => ({
                  id: project.id,
                  label: project.name,
                  size: project.successProbability || 0.5
                })),
                edges: portfolioAnalysis.projectConnections || []
              }}
            />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Portfolio Strategic Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {portfolioAnalysis.strategicRecommendations && 
                Object.entries(portfolioAnalysis.strategicRecommendations).map(
                  ([key, value]) => (
                    <div key={key} className="bg-gray-100 p-2 rounded">
                      <strong>{key}:</strong> {String(value)}
                    </div>
                  )
                )
              }
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCrossProjectCollaboration = () => {
    if (!collaborationRecommendations) return null;

    return (
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Cross-Project Collaboration Network</CardTitle>
          </CardHeader>
          <CardContent>
            <NetworkGraph 
              data={{
                nodes: innovationProjects.map(project => ({
                  id: project.id,
                  label: project.name,
                  size: project.successProbability || 0.5
                })),
                edges: collaborationRecommendations.projectConnections || []
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Collaboration Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {collaborationRecommendations.collaborationOpportunities?.map(
                (opportunity, index) => (
                  <li 
                    key={index} 
                    className="bg-gray-100 p-2 rounded flex justify-between"
                  >
                    <span>{opportunity.description}</span>
                    <Badge variant="outline">{opportunity.type}</Badge>
                  </li>
                )
              )}
            </ul>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Strategic Collaboration Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {collaborationRecommendations.strategicInsights && 
                Object.entries(collaborationRecommendations.strategicInsights).map(
                  ([key, value]) => (
                    <div key={key} className="bg-gray-100 p-2 rounded">
                      <strong>{key}:</strong> {String(value)}
                    </div>
                  )
                )
              }
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Innovation Pipeline Visualization</CardTitle>
          <CardDescription>
            Comprehensive innovation journey tracking and strategic insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <select
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {innovationProjects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <Button onClick={fetchProjectDetails}>
              Refresh Project Details
            </Button>
          </div>

          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
          >
            <TabsList>
              <TabsTrigger value="overview">Project Overview</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio Analysis</TabsTrigger>
              <TabsTrigger value="collaboration">Cross-Project Collaboration</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              {renderInnovationOverview()}
            </TabsContent>
            
            <TabsContent value="portfolio">
              {renderInnovationPortfolio()}
            </TabsContent>
            
            <TabsContent value="collaboration">
              {renderCrossProjectCollaboration()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
