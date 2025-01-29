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
  AIBiasDetectionService, 
  BiasType,
  BiasSeverityLevel 
} from '@/lib/ethics/ai-bias-detection-service';
import { 
  RadarChart, 
  BarChart, 
  HeatmapChart,
  NetworkGraph 
} from '@/components/charts';
import { toast } from 'react-toastify';

export function AIBiasDetectionDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [biasDetectionConfigs, setBiasDetectionConfigs] = useState([]);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [biasAnalysis, setBiasAnalysis] = useState(null);
  const [biasMitigationRecommendations, setBiasMitigationRecommendations] = useState(null);

  const biasDetectionService = new AIBiasDetectionService();

  useEffect(() => {
    fetchBiasDetectionConfigs();
  }, []);

  useEffect(() => {
    if (selectedConfig) {
      fetchBiasAnalysis();
    }
  }, [selectedConfig]);

  const fetchBiasDetectionConfigs = async () => {
    try {
      const configs = await biasDetectionService.prisma.aiBiasDetectionConfig.findMany();
      setBiasDetectionConfigs(configs);
    } catch (error) {
      toast.error('Failed to fetch bias detection configurations');
    }
  };

  const fetchBiasAnalysis = async () => {
    try {
      const analysisResult = await biasDetectionService.performComprehensiveBiasAnalysis(
        selectedConfig.id
      );
      
      setBiasAnalysis(analysisResult);
      
      // Fetch Bias Mitigation Recommendations
      const mitigationRecommendations = await biasDetectionService.generateBiasMitigationRecommendations(
        selectedConfig.id
      );
      
      setBiasMitigationRecommendations(mitigationRecommendations);
    } catch (error) {
      toast.error('Failed to fetch bias analysis');
    }
  };

  const renderBiasOverview = () => {
    if (!biasDetectionConfigs.length) return null;

    return (
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Bias Detection Configurations</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={{
                labels: biasDetectionConfigs.map(config => config.modelName),
                datasets: [{
                  label: 'Bias Detection Configurations',
                  data: biasDetectionConfigs.map(() => 1)
                }]
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bias Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={{
                labels: Object.values(BiasType),
                datasets: [{
                  label: 'Bias Type Occurrences',
                  data: Object.values(BiasType).map(biasType => 
                    biasDetectionConfigs.filter(
                      config => JSON.parse(config.biasDetectionResults || '{}')
                        .biasRiskProbabilities?.some(
                          risk => risk.biasType === biasType
                        )
                    ).length
                  )
                }]
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bias Severity Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={{
                labels: Object.values(BiasSeverityLevel),
                datasets: [{
                  label: 'Bias Severity Distribution',
                  data: Object.values(BiasSeverityLevel).map(severityLevel => 
                    biasDetectionConfigs.filter(
                      config => JSON.parse(config.comprehensiveBiasAnalysis || '{}')
                        .biasSeverity === severityLevel
                    ).length
                  )
                }]
              }}
            />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Bias Detection Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <HeatmapChart 
              data={{
                xLabels: biasDetectionConfigs.map(config => config.modelName),
                yLabels: Object.values(BiasType),
                data: biasDetectionConfigs.map(config => 
                  Object.values(BiasType).map(biasType => 
                    JSON.parse(config.biasDetectionResults || '{}')
                      .biasRiskProbabilities?.find(
                        risk => risk.biasType === biasType
                      )?.riskProbability || 0
                  )
                )
              }}
            />
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderBiasAnalysis = () => {
    if (!biasAnalysis) return null;

    const { 
      biasDetectionConfig, 
      biasMetrics, 
      biasDetectionPrediction,
      comprehensiveBiasAnalysis 
    } = biasAnalysis;

    return (
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Bias Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <RadarChart 
              data={{
                labels: Object.keys(biasMetrics),
                datasets: [{
                  label: 'Bias Metrics',
                  data: Object.values(biasMetrics).map(
                    (metric: any) => metric.representationDisparity
                  )
                }]
              }}
            />
            <div className="mt-4 text-center">
              <Badge variant={
                Object.values(biasMetrics).some(
                  (metric: any) => metric.biasSeverity !== BiasSeverityLevel.LOW
                ) ? 'destructive' : 'default'
              }>
                Overall Bias Severity: {
                  Object.values(biasMetrics).reduce(
                    (max, metric: any) => 
                      metric.biasSeverity > max ? metric.biasSeverity : max, 
                    BiasSeverityLevel.LOW
                  )
                }
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bias Risk Probabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={{
                labels: biasDetectionPrediction.biasRiskProbabilities.map(
                  risk => risk.biasType
                ),
                datasets: [{
                  label: 'Bias Risk Probabilities',
                  data: biasDetectionPrediction.biasRiskProbabilities.map(
                    risk => risk.riskProbability
                  )
                }]
              }}
            />
            <div className="mt-4 text-center">
              <Badge variant={
                biasDetectionPrediction.overallBiasRisk > 0.5 
                  ? 'destructive' 
                  : 'default'
              }>
                Overall Bias Risk: {
                  (biasDetectionPrediction.overallBiasRisk * 100).toFixed(2)
                }%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bias Detection Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="bg-gray-100 p-2 rounded">
                <strong>Model Name:</strong> {biasDetectionConfig.modelName}
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <strong>Sensitive Attributes:</strong> 
                {biasDetectionConfig.sensitiveAttributes}
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <strong>Dataset Characteristics:</strong>
                {JSON.stringify(
                  JSON.parse(biasDetectionConfig.datasetCharacteristics), 
                  null, 
                  2
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Comprehensive Bias Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {comprehensiveBiasAnalysis && 
                Object.entries(comprehensiveBiasAnalysis).map(([key, value]) => (
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

  const renderBiasMitigationRecommendations = () => {
    if (!biasMitigationRecommendations) return null;

    return (
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Bias Mitigation Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(biasMitigationRecommendations).map(([key, value]) => (
                <div key={key} className="bg-gray-100 p-2 rounded">
                  <strong>{key}:</strong> {String(value)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mitigation Strategy Network</CardTitle>
          </CardHeader>
          <CardContent>
            <NetworkGraph 
              data={{
                nodes: Object.keys(biasMitigationRecommendations).map(key => ({
                  id: key,
                  label: key
                })),
                edges: Object.keys(biasMitigationRecommendations).map((key, index) => ({
                  source: key,
                  target: Object.keys(biasMitigationRecommendations)[index + 1]
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
          <CardTitle>AI Bias Detection Framework</CardTitle>
          <CardDescription>
            Advanced AI bias detection, analysis, and mitigation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <select
              value={selectedConfig?.id || ''}
              onChange={(e) => {
                const config = biasDetectionConfigs.find(
                  c => c.id === e.target.value
                );
                setSelectedConfig(config);
              }}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Configuration</option>
              {biasDetectionConfigs.map(config => (
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
              <TabsTrigger value="overview">Bias Overview</TabsTrigger>
              <TabsTrigger value="bias-analysis">Bias Analysis</TabsTrigger>
              <TabsTrigger value="mitigation-recommendations">
                Mitigation Recommendations
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              {renderBiasOverview()}
            </TabsContent>
            
            <TabsContent value="bias-analysis">
              {renderBiasAnalysis()}
            </TabsContent>
            
            <TabsContent value="mitigation-recommendations">
              {renderBiasMitigationRecommendations()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
