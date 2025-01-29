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
  ProductLifecycleManagementService, 
  ProductLifecycleStage 
} from '@/lib/innovation/product-lifecycle-management-service';
import { 
  LineChart, 
  BarChart, 
  RadarChart, 
  StageProgressBar 
} from '@/components/charts';
import { toast } from 'react-toastify';

export function ProductLifecycleManagementDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [productLifecycleData, setProductLifecycleData] = useState({});

  const lifecycleService = new ProductLifecycleManagementService();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      fetchProductLifecycleAnalysis();
    }
  }, [selectedProduct]);

  const fetchProducts = async () => {
    try {
      const fetchedProducts = await lifecycleService.fetchProducts();
      setProducts(fetchedProducts);
      setSelectedProduct(fetchedProducts[0]?.id);
    } catch (error) {
      toast.error('Failed to fetch products');
    }
  };

  const fetchProductLifecycleAnalysis = async () => {
    try {
      const lifecycleAnalysis = await lifecycleService.analyzeProductLifecycle(
        selectedProduct
      );

      setProductLifecycleData(lifecycleAnalysis);
    } catch (error) {
      toast.error('Failed to fetch product lifecycle analysis');
    }
  };

  const handleStageTransition = async (newStage: ProductLifecycleStage) => {
    try {
      await lifecycleService.updateProductStage(
        selectedProduct, 
        newStage
      );
      
      fetchProductLifecycleAnalysis();
      toast.success(`Product stage transitioned to ${newStage}`);
    } catch (error) {
      toast.error('Failed to transition product stage');
    }
  };

  const renderProductOverview = () => {
    const product = productLifecycleData.product;
    const predictions = productLifecycleData.lifecyclePredictions;
    const aiAnalysis = productLifecycleData.aiLifecycleAnalysis;

    return (
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <strong>Name:</strong> {product?.name}
              </div>
              <div>
                <strong>Current Stage:</strong> 
                <Badge variant="outline">
                  {product?.currentStage}
                </Badge>
              </div>
              <div>
                <strong>Innovation Score:</strong> 
                {product?.innovationScore?.toFixed(2)}
              </div>
              <div>
                <strong>Market Potential:</strong> 
                {product?.marketPotential?.toFixed(2)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lifecycle Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <RadarChart 
              data={{
                labels: [
                  'Success Probability', 
                  'Time to Next Stage', 
                  'Resource Efficiency'
                ],
                datasets: [{
                  label: 'Lifecycle Metrics',
                  data: [
                    predictions?.successProbability || 0,
                    predictions?.timeToNextStage || 0,
                    predictions?.resourceEfficiencyScore || 0
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
              {aiAnalysis && Object.entries(aiAnalysis).map(([key, value]) => (
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

  const renderStageTransition = () => {
    const product = productLifecycleData.product;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Stage Transition Management</CardTitle>
          <CardDescription>
            Navigate and manage product lifecycle stages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StageProgressBar 
            currentStage={product?.currentStage}
            stages={Object.values(ProductLifecycleStage)}
          />

          <div className="mt-6 grid grid-cols-5 gap-4">
            {Object.values(ProductLifecycleStage)
              .filter(stage => stage !== product?.currentStage)
              .map(stage => (
                <Button 
                  key={stage}
                  variant="outline"
                  onClick={() => handleStageTransition(stage)}
                >
                  Move to {stage}
                </Button>
              ))
            }
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPerformanceAnalytics = () => {
    const product = productLifecycleData.product;

    return (
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Innovation Trajectory</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart 
              data={{
                labels: product?.stageHistory?.map(
                  history => history.stage
                ) || [],
                datasets: [{
                  label: 'Innovation Score',
                  data: product?.stageHistory?.map(
                    history => JSON.parse(history.metadata).innovationScore
                  ) || []
                }]
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market Potential Evolution</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={{
                labels: product?.stageHistory?.map(
                  history => history.stage
                ) || [],
                datasets: [{
                  label: 'Market Potential',
                  data: product?.stageHistory?.map(
                    history => JSON.parse(history.metadata).marketPotential
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
          <CardTitle>Product Lifecycle Management</CardTitle>
          <CardDescription>
            Comprehensive tracking and strategic management of product development
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
            <Button onClick={fetchProductLifecycleAnalysis}>
              Refresh Analysis
            </Button>
          </div>

          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
          >
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="stage">Stage Transition</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              {renderProductOverview()}
            </TabsContent>
            
            <TabsContent value="stage">
              {renderStageTransition()}
            </TabsContent>
            
            <TabsContent value="performance">
              {renderPerformanceAnalytics()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
