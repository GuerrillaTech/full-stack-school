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
  StartupIncubationTrackingService, 
  StartupLifecycleStage,
  StartupPotentialCriteria 
} from '@/lib/innovation/startup-incubation-tracking-service';
import { 
  RadarChart, 
  BarChart, 
  LineChart,
  NetworkGraph 
} from '@/components/charts';
import { toast } from 'react-toastify';

export function StartupIncubationTrackingDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [startups, setStartups] = useState([]);
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [startupDetails, setStartupDetails] = useState(null);
  const [portfolioAnalysis, setPortfolioAnalysis] = useState(null);

  const incubationService = new StartupIncubationTrackingService();

  useEffect(() => {
    fetchStartups();
  }, []);

  useEffect(() => {
    if (selectedStartup) {
      fetchStartupDetails();
    }
  }, [selectedStartup]);

  const fetchStartups = async () => {
    try {
      const organizationId = 'current-organization-id'; // Replace with actual logic
      const fetchedStartups = await incubationService.manageStartupPortfolio(
        organizationId
      );
      
      setStartups(fetchedStartups.startups);
      setSelectedStartup(fetchedStartups.startups[0]?.id);
      setPortfolioAnalysis(fetchedStartups.portfolioAnalysis);
    } catch (error) {
      toast.error('Failed to fetch startups');
    }
  };

  const fetchStartupDetails = async () => {
    try {
      const potentialScore = await incubationService.assessStartupPotential(
        selectedStartup
      );
      
      const startup = startups.find(s => s.id === selectedStartup);
      
      setStartupDetails({
        ...startup,
        potentialScore
      });
    } catch (error) {
      toast.error('Failed to fetch startup details');
    }
  };

  const renderStartupOverview = () => {
    if (!startupDetails) return null;

    const potentialAssessment = JSON.parse(startupDetails.potentialAssessment);

    return (
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Startup Potential Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <RadarChart 
              data={{
                labels: Object.values(StartupPotentialCriteria),
                datasets: [{
                  label: 'Potential Dimensions',
                  data: Object.values(StartupPotentialCriteria).map(
                    criteria => potentialAssessment[criteria] || 0
                  )
                }]
              }}
            />
            <div className="mt-4 text-center">
              <Badge variant="outline">
                Potential Score: {startupDetails.potentialScore.toFixed(2)}
              </Badge>
              <Badge variant="outline" className="ml-2">
                Risk Score: {startupDetails.riskScore.toFixed(2)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lifecycle Stage Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={{
                labels: Object.values(StartupLifecycleStage),
                datasets: [{
                  label: 'Stage Progression',
                  data: Object.values(StartupLifecycleStage).map(
                    stage => stage === startupDetails.currentStage ? 1 : 0
                  )
                }]
              }}
            />
            <div className="mt-4 text-center">
              <Badge variant="default">
                Current Stage: {startupDetails.currentStage}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Strategic Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {startupDetails.aiStrategy && 
                Object.entries(startupDetails.aiStrategy).map(([key, value]) => (
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

  const renderStartupPortfolio = () => {
    if (!portfolioAnalysis) return null;

    return (
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Diversity</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={{
                labels: Object.keys(portfolioAnalysis.portfolioDiversity || {}),
                datasets: [{
                  label: 'Startup Domain Distribution',
                  data: Object.values(portfolioAnalysis.portfolioDiversity || {})
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
                labels: startups.map(startup => startup.name),
                datasets: [{
                  label: 'Startup Potential Scores',
                  data: startups.map(startup => 
                    JSON.parse(startup.potentialAssessment).INNOVATION_LEVEL || 0
                  )
                }]
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Startup Network</CardTitle>
          </CardHeader>
          <CardContent>
            <NetworkGraph 
              data={{
                nodes: startups.map(startup => ({
                  id: startup.id,
                  label: startup.name,
                  size: startup.potentialScore || 0.5
                })),
                edges: portfolioAnalysis.startupConnections || []
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

  const renderStartupMentorship = () => {
    const [mentorMatching, setMentorMatching] = useState(null);

    const fetchMentorMatching = async () => {
      try {
        const matching = await incubationService.matchStartupWithMentors(
          selectedStartup
        );
        setMentorMatching(matching);
      } catch (error) {
        toast.error('Failed to fetch mentor matching');
      }
    };

    useEffect(() => {
      if (selectedStartup) {
        fetchMentorMatching();
      }
    }, [selectedStartup]);

    if (!mentorMatching) return null;

    return (
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Recommended Mentors</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {mentorMatching.recommendedMentors?.map(mentor => (
                <li 
                  key={mentor.id} 
                  className="bg-gray-100 p-2 rounded flex justify-between"
                >
                  <span>{mentor.name}</span>
                  <Badge variant="outline">{mentor.expertise}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Networking Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {mentorMatching.networkingOpportunities?.map(opportunity => (
                <li 
                  key={opportunity.id} 
                  className="bg-gray-100 p-2 rounded flex justify-between"
                >
                  <span>{opportunity.name}</span>
                  <Badge variant="outline">{opportunity.type}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Funding Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {mentorMatching.fundingSources?.map(source => (
                <li 
                  key={source.id} 
                  className="bg-gray-100 p-2 rounded flex justify-between"
                >
                  <span>{source.name}</span>
                  <Badge variant="outline">{source.type}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Startup Incubation Tracking</CardTitle>
          <CardDescription>
            Comprehensive startup lifecycle management and innovation acceleration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <select
              value={selectedStartup || ''}
              onChange={(e) => setSelectedStartup(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {startups.map(startup => (
                <option key={startup.id} value={startup.id}>
                  {startup.name}
                </option>
              ))}
            </select>
            <Button onClick={fetchStartupDetails}>
              Refresh Startup Details
            </Button>
          </div>

          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
          >
            <TabsList>
              <TabsTrigger value="overview">Startup Overview</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio Analysis</TabsTrigger>
              <TabsTrigger value="mentorship">Mentorship & Resources</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              {renderStartupOverview()}
            </TabsContent>
            
            <TabsContent value="portfolio">
              {renderStartupPortfolio()}
            </TabsContent>
            
            <TabsContent value="mentorship">
              {renderStartupMentorship()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
