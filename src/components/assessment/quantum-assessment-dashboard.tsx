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
  QuantumEnhancedAssessmentService, 
  AssessmentType,
  QuantumComplexityLevel 
} from '@/lib/assessment/quantum-enhanced-assessment-service';
import { 
  RadarChart, 
  BarChart, 
  NetworkGraph,
  TimelineChart 
} from '@/components/charts';
import { toast } from 'react-toastify';

export function QuantumAssessmentDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [assessmentDetails, setAssessmentDetails] = useState(null);
  const [quantumAnalysis, setQuantumAnalysis] = useState(null);

  const assessmentService = new QuantumEnhancedAssessmentService();

  useEffect(() => {
    fetchAssessments();
  }, []);

  useEffect(() => {
    if (selectedAssessment) {
      fetchAssessmentDetails();
    }
  }, [selectedAssessment]);

  const fetchAssessments = async () => {
    try {
      const organizationId = 'current-organization-id'; // Replace with actual logic
      const fetchedAssessments = await assessmentService.compareQuantumAndClassicalAssessments(
        organizationId
      );
      
      setAssessments(fetchedAssessments.assessments);
      setSelectedAssessment(fetchedAssessments.assessments[0]?.id);
      setQuantumAnalysis(fetchedAssessments.quantumAnalysis);
    } catch (error) {
      toast.error('Failed to fetch assessments');
    }
  };

  const fetchAssessmentDetails = async () => {
    try {
      const assessmentResult = await assessmentService.initializeQuantumAssessment(
        selectedAssessment
      );
      
      setAssessmentDetails(assessmentResult);
    } catch (error) {
      toast.error('Failed to fetch assessment details');
    }
  };

  const renderAssessmentOverview = () => {
    if (!assessmentDetails) return null;

    const { 
      assessment, 
      quantumCircuit, 
      preparedQuantumState, 
      assessmentPrediction,
      assessmentAnalysis 
    } = assessmentDetails;

    return (
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Quantum Assessment Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <RadarChart 
              data={{
                labels: [
                  'Quantum Accuracy', 
                  'Measurement Precision', 
                  'Computational Efficiency', 
                  'Probabilistic Performance'
                ],
                datasets: [{
                  label: 'Assessment Metrics',
                  data: [
                    assessmentAnalysis?.quantumAccuracy || 0,
                    assessmentAnalysis?.measurementPrecision || 0,
                    assessmentAnalysis?.computationalEfficiency || 0,
                    assessmentAnalysis?.probabilisticPerformance || 0
                  ]
                }]
              }}
            />
            <div className="mt-4 text-center">
              <Badge variant="outline">
                Complexity: {assessment.complexityLevel}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assessment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="bg-gray-100 p-2 rounded">
                <strong>Type:</strong> {assessment.type}
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <strong>Complexity:</strong> {assessment.complexityLevel}
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <strong>Parameters:</strong> {JSON.stringify(assessment.parameters)}
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <strong>Quantum Circuit:</strong> {quantumCircuit.toString()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quantum State Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="bg-gray-100 p-2 rounded">
                <strong>Measurement Probabilities:</strong>
                {JSON.stringify(preparedQuantumState.probabilities)}
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <strong>Assessment Prediction:</strong>
                {JSON.stringify(assessmentPrediction)}
              </div>
              {assessmentAnalysis && 
                Object.entries(assessmentAnalysis).map(([key, value]) => (
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

  const renderQuantumComparison = () => {
    if (!quantumAnalysis) return null;

    return (
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Quantum vs Classical Assessment Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={{
                labels: ['Quantum Accuracy', 'Classical Accuracy', 'Computational Efficiency'],
                datasets: [{
                  label: 'Performance Comparison',
                  data: [
                    quantumAnalysis.quantumAccuracy || 0,
                    quantumAnalysis.classicalAccuracy || 0,
                    quantumAnalysis.computationalEfficiency || 0
                  ]
                }]
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assessment Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={{
                labels: Object.values(AssessmentType),
                datasets: [{
                  label: 'Assessments per Type',
                  data: Object.values(AssessmentType).map(type => 
                    assessments.filter(a => a.type === type).length
                  )
                }]
              }}
            />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quantum Comparison Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {quantumAnalysis.comparisonInsights && 
                Object.entries(quantumAnalysis.comparisonInsights).map(
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

  const renderErrorMitigation = () => {
    if (!assessmentDetails) return null;

    const { assessment, assessmentDetails: details } = assessmentDetails;

    return (
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Quantum Error Mitigation Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <TimelineChart 
              data={{
                events: details.errorMitigationAnalysis?.mitigationSteps || []
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {details.errorMitigationAnalysis?.errorSources?.map((error, index) => (
                <li 
                  key={index} 
                  className="bg-gray-100 p-2 rounded flex justify-between"
                >
                  <span>{error.description}</span>
                  <Badge variant="destructive">{error.severity}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Error Mitigation Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {details.errorMitigationAnalysis?.recommendations && 
                Object.entries(details.errorMitigationAnalysis.recommendations).map(([key, value]) => (
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quantum-Enhanced Assessment System</CardTitle>
          <CardDescription>
            Advanced quantum computing techniques for precise and efficient assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <select
              value={selectedAssessment || ''}
              onChange={(e) => setSelectedAssessment(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {assessments.map(assessment => (
                <option key={assessment.id} value={assessment.id}>
                  {assessment.type} - {assessment.complexityLevel}
                </option>
              ))}
            </select>
            <Button onClick={fetchAssessmentDetails}>
              Analyze Assessment
            </Button>
          </div>

          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
          >
            <TabsList>
              <TabsTrigger value="overview">Assessment Overview</TabsTrigger>
              <TabsTrigger value="comparison">Quantum Comparison</TabsTrigger>
              <TabsTrigger value="error-mitigation">Error Mitigation</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              {renderAssessmentOverview()}
            </TabsContent>
            
            <TabsContent value="comparison">
              {renderQuantumComparison()}
            </TabsContent>
            
            <TabsContent value="error-mitigation">
              {renderErrorMitigation()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
