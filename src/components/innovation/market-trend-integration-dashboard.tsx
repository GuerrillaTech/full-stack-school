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
  MarketTrendIntegrationService, 
  MarketTrendCategory 
} from '@/lib/innovation/market-trend-integration-service';
import { 
  NetworkGraph, 
  RadarChart, 
  BarChart, 
  LineChart,
  HeatmapChart 
} from '@/components/charts';
import { toast } from 'react-toastify';

export function MarketTrendIntegrationDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [marketTrends, setMarketTrends] = useState({});
  const [selectedTrendCategory, setSelectedTrendCategory] = useState(
    MarketTrendCategory.TECHNOLOGICAL
  );
  const [productTrendImpact, setProductTrendImpact] = useState([]);

  const trendService = new MarketTrendIntegrationService();

  useEffect(() => {
    fetchMarketTrends();
  }, []);

  useEffect(() => {
    if (marketTrends.aggregatedTrends) {
      fetchProductTrendImpact();
    }
  }, [marketTrends]);

  const fetchMarketTrends = async () => {
    try {
      const organizationId = 'current-organization-id'; // Replace with actual logic
      const trends = await trendService.aggregateMarketTrends(
        organizationId, 
        [selectedTrendCategory]
      );
      setMarketTrends(trends);
    } catch (error) {
      toast.error('Failed to fetch market trends');
    }
  };

  const fetchProductTrendImpact = async () => {
    try {
      const organizationId = 'current-organization-id'; // Replace with actual logic
      const impact = await trendService.assessTrendImpactOnProducts(
        organizationId, 
        marketTrends.aggregatedTrends
      );
      setProductTrendImpact(impact);
    } catch (error) {
      toast.error('Failed to assess product trend impact');
    }
  };

  const renderTrendOverview = () => {
    const { aggregatedTrends, trendPredictions, aiTrendAnalysis } = marketTrends;

    return (
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Trend Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={{
                labels: aggregatedTrends?.map(trend => trend.domain) || [],
                datasets: [{
                  label: 'Trend Strength',
                  data: aggregatedTrends?.map(trend => trend.trendStrength) || []
                }]
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trend Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <RadarChart 
              data={{
                labels: [
                  'Growth Probability', 
                  'Disruption Intensity', 
                  'Transformative Potential'
                ],
                datasets: [{
                  label: 'Trend Metrics',
                  data: trendPredictions?.map(
                    pred => [
                      pred.growthProbability,
                      pred.disruptionIntensity,
                      pred.transformativePotential
                    ]
                  )[0] || []
                }]
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
              {aiTrendAnalysis && Object.entries(aiTrendAnalysis).map(([key, value]) => (
                <div key={key} className="bg-gray-100 p-2 rounded">
                  <strong>{key}:</strong> {String(value)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderProductTrendImpact = () => {
    return (
      <div className="grid grid-cols-2 gap-4">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Product-Trend Impact Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <HeatmapChart 
              data={{
                labels: {
                  x: productTrendImpact.map(impact => impact.productName),
                  y: marketTrends.aggregatedTrends?.map(trend => trend.domain) || []
                },
                datasets: productTrendImpact.map(impact => ({
                  label: impact.productName,
                  data: marketTrends.aggregatedTrends?.map(trend => 
                    impact.relevantTrends.some(
                      relevantTrend => relevantTrend.domain === trend.domain
                    ) ? trend.trendStrength : 0
                  ) || []
                }))
              }}
            />
          </CardContent>
        </Card>

        {productTrendImpact.map(impact => (
          <Card key={impact.productId}>
            <CardHeader>
              <CardTitle>{impact.productName} Trend Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <strong>Relevant Trends:</strong>
                <ul>
                  {impact.relevantTrends.map(trend => (
                    <li key={trend.id} className="bg-gray-100 p-2 rounded">
                      {trend.domain}
                      <Badge variant="outline" className="ml-2">
                        {trend.trendStrength.toFixed(2)}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderTrendTrajectory = () => {
    return (
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Trend Growth Trajectory</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart 
              data={{
                labels: marketTrends.trendPredictions?.map(
                  pred => pred.domain
                ) || [],
                datasets: [{
                  label: 'Growth Probability',
                  data: marketTrends.trendPredictions?.map(
                    pred => pred.growthProbability
                  ) || []
                }]
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disruption Potential</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart 
              data={{
                labels: marketTrends.trendPredictions?.map(
                  pred => pred.domain
                ) || [],
                datasets: [{
                  label: 'Disruption Intensity',
                  data: marketTrends.trendPredictions?.map(
                    pred => pred.disruptionIntensity
                  ) || []
                }]
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
          <CardTitle>Market Trend Integration</CardTitle>
          <CardDescription>
            Comprehensive market trend analysis and strategic insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <select
              value={selectedTrendCategory}
              onChange={(e) => {
                setSelectedTrendCategory(
                  e.target.value as MarketTrendCategory
                );
                fetchMarketTrends();
              }}
              className="w-full p-2 border rounded"
            >
              {Object.values(MarketTrendCategory).map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <Button onClick={fetchMarketTrends}>
              Refresh Trends
            </Button>
          </div>

          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
          >
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="product-impact">Product Impact</TabsTrigger>
              <TabsTrigger value="trajectory">Trend Trajectory</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              {renderTrendOverview()}
            </TabsContent>
            
            <TabsContent value="product-impact">
              {renderProductTrendImpact()}
            </TabsContent>
            
            <TabsContent value="trajectory">
              {renderTrendTrajectory()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
