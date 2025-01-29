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
  QuantumAIIntegrationService, 
  QuantumAIIntegrationMode,
  QuantumCircuitComplexity 
} from '@/lib/quantum/quantum-ai-integration-service';
import { 
  RadarChart, 
  BarChart, 
  HeatmapChart,
  NetworkGraph,
  LineChart 
} from '@/components/charts';
import { toast } from 'react-toastify';

export function QuantumAIIntegrationDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [quantumAIConfigs, setQuantumAIConfigs] = useState([]);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [quantumIntegrationAnalysis, setQuantumIntegrationAnalysis] = useState(null);
  const [quantumAIRecommendations, setQuantumAIRecommendations] = useState(null);

  const quantumAIService = new QuantumAIIntegrationService();

  useEffect(() => {
    fetchQuantumAIConfigs();
  }, []);

  useEffect(() => {
    if (selectedConfig) {
      fetchQuantumIntegrationAnalysis();
    }
  }, [selectedConfig]);

  const fetchQuantumAIConfigs = async () => {
    try {
      const configs = await quantumAIService.prisma.quantumAIIntegrationConfig.findMany();
      setQuantumAIConfigs(configs);
    } catch (error) {
      toast.error('Failed to fetch Quantum AI configurations');
    }
  };

  const fetchQuantumIntegrationAnalysis = async () => {
    try {
      const analysisResult = await quantumAIService.performQuantumAIIntegrationAnalysis(
        selectedConfig.id
      );
      
      setQuantumIntegrationAnalysis(analysisResult);
      
      // Fetch Quantum AI Integration Recommendations
      const recommendations = await quantumAIService.generateQuantumAIIntegrationRecommendations(
        selectedConfig.id
      );
      
      setQuantumAIRecommendations(recommendations);
    } catch (error) {
      toast.error('Failed to fetch Quantum AI integration analysis');
    }
  };

  const renderQuantumAIOverview = () => {
    if (!quantumAIConfigs.length) return null;

    return (
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Quantum AI Integration Modes</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={{
                labels: Object.values(QuantumAIIntegrationMode),
                datasets: [{
                  label: 'Integration Mode Distribution',
                  data: Object.values(QuantumAIIntegrationMode).map(mode => 
                    quantumAIConfigs.filter(config => 
                      JSON.parse(config.configDetails).integrationMode === mode
                    ).length
                  )
                }]
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quantum Circuit Complexity</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={{
                labels: Object.values(QuantumCircuitComplexity),
                datasets: [{
                  label: 'Circuit Complexity Distribution',
                  data: Object.values(QuantumCircuitComplexity).map(complexity => 
                    quantumAIConfigs.filter(config => 
                      config.quantumCircuitComplexity === complexity
                    ).length
                  )
                }]
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quantum AI Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <HeatmapChart 
              data={{
                xLabels: quantumAIConfigs.map(config => config.modelName),
                yLabels: Object.values(QuantumAIIntegrationMode),
                data: quantumAIConfigs.map(config => 
                  Object.values(QuantumAIIntegrationMode).map(mode => {
                    const hybridResults = JSON.parse(
                      config.hybridModelTrainingResults || '{}'
                    );
                    return hybridResults?.modelPerformance?.accuracy || 0;
                  })
                )
              }}
            />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quantum AI Integration Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <NetworkGraph 
              data={{
                nodes: quantumAIConfigs.map(config => ({
                  id: config.id,
                  label: config.modelName,
                  size: JSON.parse(
                    config.hybridModelTrainingResults || '{}'
                  )?.modelPerformance?.accuracy || 0.5
                })),
                edges: quantumAIConfigs.map((config, index) => ({
                  source: config.id,
                  target: quantumAIConfigs[index + 1]?.id
                })).slice(0, -1)
              }}
            />
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderQuantumIntegrationAnalysis = () => {
    if (!quantumIntegrationAnalysis) return null;

    const { 
      quantumAIConfig, 
      quantumFeatures, 
      hybridModelTrainingResults,
      quantumIntegrationAnalysis: analysisDetails 
    } = quantumIntegrationAnalysis;

    return (
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Quantum Features</CardTitle>
          </CardHeader>
          <CardContent>
            <RadarChart 
              data={{
                labels: [
                  'State Vector Complexity', 
                  'Probability Distribution', 
                  'Measurement Outcomes', 
                  'Quantum Coherence'
                ],
                datasets: [{
                  label: 'Quantum Feature Metrics',
                  data: [
                    quantumFeatures.stateVector.length,
                    math.max(...quantumFeatures.probabilities),
                    quantumFeatures.measurementOutcomes.length,
                    quantumFeatures.stateVector.reduce(
                      (sum, val) => sum + Math.abs(val), 0
                    )
                  ]
                }]
              }}
            />
            <div className="mt-4 text-center">
              <Badge variant="default">
                Integration Mode: {quantumFeatures.mode}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hybrid Model Training Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart 
              data={{
                labels: ['Epoch 1', 'Epoch 10', 'Epoch 25', 'Epoch 50'],
                datasets: [
                  {
                    label: 'Training Loss',
                    data: [
                      hybridModelTrainingResults.trainingHistory.loss[0],
                      hybridModelTrainingResults.trainingHistory.loss[9],
                      hybridModelTrainingResults.trainingHistory.loss[24],
                      hybridModelTrainingResults.trainingHistory.loss[49]
                    ]
                  },
                  {
                    label: 'Training Accuracy',
                    data: [
                      hybridModelTrainingResults.trainingHistory.accuracy[0],
                      hybridModelTrainingResults.trainingHistory.accuracy[9],
                      hybridModelTrainingResults.trainingHistory.accuracy[24],
                      hybridModelTrainingResults.trainingHistory.accuracy[49]
                    ]
                  }
                ]
              }}
            />
            <div className="mt-4 text-center">
              <Badge variant={
                hybridModelTrainingResults.modelPerformance.accuracy > 0.8 
                  ? 'default' 
                  : 'destructive'
              }>
                Final Accuracy: {
                  (hybridModelTrainingResults.modelPerformance.accuracy * 100).toFixed(2)
                }%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quantum AI Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="bg-gray-100 p-2 rounded">
                <strong>Model Name:</strong> {quantumAIConfig.modelName}
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <strong>Integration Mode:</strong> 
                {JSON.parse(quantumAIConfig.configDetails).integrationMode}
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <strong>Quantum Circuit Depth:</strong>
                {JSON.parse(quantumAIConfig.configDetails).quantumCircuitDepth}
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <strong>Quantum Bit Count:</strong>
                {JSON.parse(quantumAIConfig.configDetails).quantumBitCount}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quantum Integration Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysisDetails && 
                Object.entries(analysisDetails).map(([key, value]) => (
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

  const renderQuantumAIRecommendations = () => {
    if (!quantumAIRecommendations) return null;

    return (
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quantum AI Integration Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(quantumAIRecommendations).map(([key, value]) => (
                <div key={key} className="bg-gray-100 p-2 rounded">
                  <strong>{key}:</strong> {String(value)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quantum AI Strategy Network</CardTitle>
          </CardHeader>
          <CardContent>
            <NetworkGraph 
              data={{
                nodes: Object.keys(quantumAIRecommendations).map(key => ({
                  id: key,
                  label: key
                })),
                edges: Object.keys(quantumAIRecommendations).map((key, index) => ({
                  source: key,
                  target: Object.keys(quantumAIRecommendations)[index + 1]
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
          <CardTitle>Quantum AI Integration Toolkit</CardTitle>
          <CardDescription>
            Advanced quantum computing and AI integration platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <select
              value={selectedConfig?.id || ''}
              onChange={(e) => {
                const config = quantumAIConfigs.find(
                  c => c.id === e.target.value
                );
                setSelectedConfig(config);
              }}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Configuration</option>
              {quantumAIConfigs.map(config => (
                <option key={config.id} value={config.id}>
                  {config.modelName}
                </option>
              ))}
            </select>
          </div>

          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
          >
            <TabsList>
              <TabsTrigger value="overview">Quantum AI Overview</TabsTrigger>
              <TabsTrigger value="integration-analysis">
                Integration Analysis
              </TabsTrigger>
              <TabsTrigger value="ai-recommendations">
                AI Recommendations
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              {renderQuantumAIOverview()}
            </TabsContent>
            
            <TabsContent value="integration-analysis">
              {renderQuantumIntegrationAnalysis()}
            </TabsContent>
            
            <TabsContent value="ai-recommendations">
              {renderQuantumAIRecommendations()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
