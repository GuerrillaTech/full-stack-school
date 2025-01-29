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
  ProductInnovationTrackingService, 
  InnovationCategory 
} from '@/lib/innovation/product-innovation-tracking-service';
import { 
  NetworkGraph, 
  RadarChart, 
  BarChart, 
  LineChart 
} from '@/components/charts';
import { toast } from 'react-toastify';

export function ProductInnovationTrackingDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [innovationData, setInnovationData] = useState({});
  const [ecosystemAnalysis, setEcosystemAnalysis] = useState(null);

  const innovationService = new ProductInnovationTrackingService();

  useEffect(() => {
    fetchProducts();
    fetchOrganizationInnovationEcosystem();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      fetchProductInnovationAnalysis();
    }
  }, [selectedProduct]);

  const fetchProducts = async () => {
    try {
      const fetchedProducts = await innovationService.fetchProducts();
      setProducts(fetchedProducts);
      setSelectedProduct(fetchedProducts[0]?.id);
    } catch (error) {
      toast.error('Failed to fetch products');
    }
  };

  const fetchProductInnovationAnalysis = async () => {
    try {
      const innovationAnalysis = await innovationService.analyzeInnovationPotential({
        productId: selectedProduct,
        innovationScore: 0.7,
        disruptivePotential: 0.6,
        technologicalNovelty: 0.8,
        marketDifferentiation: 0.7
      });

      setInnovationData(innovationAnalysis);
    } catch (error) {
      toast.error('Failed to fetch product innovation analysis');
    }
  };

  const fetchOrganizationInnovationEcosystem = async () => {
    try {
      const organizationId = 'current-organization-id'; // Replace with actual logic
      const ecosystem = await innovationService.mapInnovationEcosystem(
        organizationId
      );
      setEcosystemAnalysis(ecosystem);
    } catch (error) {
      toast.error('Failed to fetch innovation ecosystem');
    }
  };

  const renderInnovationOverview = () => {
    const { innovationRecord, innovationPredictions, aiInnovationAnalysis } = innovationData;

    return (
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Innovation Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <RadarChart 
              data={{
                labels: [
                  'Innovation Score', 
                  'Disruptive Potential', 
                  'Technological Novelty', 
                  'Market Differentiation'
                ],
                datasets: [{
                  label: 'Innovation Dimensions',
                  data: [
                    innovationRecord?.innovationScore || 0,
                    innovationRecord?.disruptivePotential || 0,
                    innovationRecord?.technologicalNovelty || 0,
                    innovationRecord?.marketDifferentiation || 0
                  ]
                }]
              }}
            />
            <div className="mt-4">
              <Badge variant="outline">
                Category: {innovationRecord?.category}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Innovation Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={{
                labels: [
                  'Breakthrough Probability', 
                  'Market Disruption', 
                  'Tech Leadership'
                ],
                datasets: [{
                  label: 'Innovation Potential',
                  data: [
                    innovationPredictions?.breakthroughProbability || 0,
                    innovationPredictions?.marketDisruptionScore || 0,
                    innovationPredictions?.technologicalLeadershipPotential || 0
                  ]
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
              {aiInnovationAnalysis && Object.entries(aiInnovationAnalysis).map(([key, value]) => (
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

  const renderInnovationEcosystem = () => {
    if (!ecosystemAnalysis) return null;

    const { ecosystemAnalysis: analysis, aiEcosystemInsights } = ecosystemAnalysis;

    return (
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Innovation Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={{
                labels: Object.keys(InnovationCategory),
                datasets: [{
                  label: 'Innovation Categories',
                  data: Object.values(analysis.innovationCategories)
                }]
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Innovation Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.topInnovationAreas.map(area => (
                <li key={area} className="bg-gray-100 p-2 rounded">
                  {area}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Innovation Network</CardTitle>
          </CardHeader>
          <CardContent>
            <NetworkGraph 
              data={analysis.innovationNetworkGraph}
            />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>AI Ecosystem Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {aiEcosystemInsights && Object.entries(aiEcosystemInsights).map(([key, value]) => (
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

  const renderInnovationTrends = () => {
    return (
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Innovation Score Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart 
              data={{
                labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                datasets: [{
                  label: 'Innovation Score',
                  data: [0.5, 0.6, 0.7, 0.8]
                }]
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disruptive Potential Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart 
              data={{
                labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                datasets: [{
                  label: 'Disruptive Potential',
                  data: [0.4, 0.5, 0.6, 0.7]
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
          <CardTitle>Product Innovation Tracking</CardTitle>
          <CardDescription>
            Comprehensive monitoring and strategic analysis of product innovation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <select
              value={selectedProduct || ''}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
            <Button onClick={fetchProductInnovationAnalysis}>
              Refresh Analysis
            </Button>
          </div>

          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
          >
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="ecosystem">Innovation Ecosystem</TabsTrigger>
              <TabsTrigger value="trends">Innovation Trends</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              {renderInnovationOverview()}
            </TabsContent>
            
            <TabsContent value="ecosystem">
              {renderInnovationEcosystem()}
            </TabsContent>
            
            <TabsContent value="trends">
              {renderInnovationTrends()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
