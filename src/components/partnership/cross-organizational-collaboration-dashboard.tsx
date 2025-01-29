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
  StrategicPartnershipAnalyticsService 
} from '@/lib/partnership/strategic-partnership-analytics-service';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'react-toastify';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

export function CrossOrganizationalCollaborationDashboard() {
  const [partnerships, setPartnerships] = useState([]);
  const [selectedPartnership, setSelectedPartnership] = useState(null);
  const [collaborationInsights, setCollaborationInsights] = useState(null);
  const [performanceEvaluation, setPerformanceEvaluation] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const partnershipService = new StrategicPartnershipAnalyticsService();

  useEffect(() => {
    fetchPartnershipRecommendations();
  }, []);

  const fetchPartnershipRecommendations = async () => {
    try {
      const recommendations = await partnershipService.generatePartnershipRecommendations({
        organizationType: 'ACADEMIC',
        domain: 'TECHNOLOGY_EDUCATION'
      });
      setPartnerships(recommendations);
    } catch (error) {
      toast.error('Failed to fetch partnership recommendations');
    }
  };

  const handlePartnershipDetails = async (partnership) => {
    try {
      const insights = await partnershipService.generateCollaborationInsights(
        partnership.partnerId
      );
      setCollaborationInsights(insights);
      
      const performance = await partnershipService.evaluateCollaborationPerformance(
        partnership.id
      );
      setPerformanceEvaluation(performance);
      
      setSelectedPartnership(partnership);
      setIsDialogOpen(true);
    } catch (error) {
      toast.error('Failed to retrieve partnership details');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Strategic Partnership Analytics</CardTitle>
          <CardDescription>
            Discover and evaluate potential cross-organizational collaborations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner</TableHead>
                <TableHead>Potential Impact</TableHead>
                <TableHead>Alignment Score</TableHead>
                <TableHead>Recommendation Confidence</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partnerships.map((partnership) => (
                <TableRow key={partnership.partnerId}>
                  <TableCell>{partnership.partnerName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {partnership.potentialImpact.toFixed(2)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {partnership.alignmentScore.toFixed(2)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        partnership.recommendationConfidence > 0.7 
                          ? 'default' 
                          : 'destructive'
                      }
                    >
                      {(partnership.recommendationConfidence * 100).toFixed(0)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="sm" 
                      onClick={() => handlePartnershipDetails(partnership)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Partnership Insights: {selectedPartnership?.partnerName}
            </DialogTitle>
            <DialogDescription>
              Comprehensive analysis of potential collaboration
            </DialogDescription>
          </DialogHeader>
          
          {collaborationInsights && performanceEvaluation && (
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Collaboration Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {Object.entries(collaborationInsights).map(([key, value]) => (
                      <li key={key}>
                        <strong>{key}:</strong> {String(value)}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Evaluation</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {Object.entries(performanceEvaluation).map(([key, value]) => (
                      <li key={key}>
                        <strong>{key}:</strong> {String(value)}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Collaboration Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <LineChart width={800} height={300} data={performanceEvaluation.performanceTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="innovationScore" 
                      stroke="#8884d8" 
                      name="Innovation Score" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="knowledgeTransferScore" 
                      stroke="#82ca9d" 
                      name="Knowledge Transfer" 
                    />
                  </LineChart>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
