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
  EntrepreneurshipMentorshipMatchingService, 
  EntrepreneurshipDomain,
  MatchingComplexity 
} from '@/lib/mentorship/entrepreneurship-mentorship-matching-service';
import { 
  RadarChart, 
  BarChart, 
  NetworkGraph,
  TimelineChart 
} from '@/components/charts';
import { toast } from 'react-toastify';

export function EntrepreneurshipMentorshipDashboard() {
  const [activeTab, setActiveTab] = useState('matching');
  const [profiles, setProfiles] = useState([]);
  const [selectedMenteeProfile, setSelectedMenteeProfile] = useState(null);
  const [mentorshipMatches, setMentorshipMatches] = useState(null);
  const [selectedMentorshipConnection, setSelectedMentorshipConnection] = useState(null);
  const [connectionDetails, setConnectionDetails] = useState(null);

  const mentorshipService = new EntrepreneurshipMentorshipMatchingService();

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (selectedMenteeProfile) {
      findMentorshipMatches();
    }
  }, [selectedMenteeProfile]);

  useEffect(() => {
    if (selectedMentorshipConnection) {
      trackMentorshipProgress();
    }
  }, [selectedMentorshipConnection]);

  const fetchProfiles = async () => {
    try {
      const organizationId = 'current-organization-id'; // Replace with actual logic
      const fetchedProfiles = await mentorshipService.createMentorshipProfile(
        organizationId
      );
      
      setProfiles(fetchedProfiles.profiles);
      setSelectedMenteeProfile(
        fetchedProfiles.profiles.find(p => p.role === 'MENTEE')?.id
      );
    } catch (error) {
      toast.error('Failed to fetch profiles');
    }
  };

  const findMentorshipMatches = async () => {
    try {
      const matchesResult = await mentorshipService.findMentorshipMatches(
        selectedMenteeProfile,
        MatchingComplexity.ADVANCED
      );
      
      setMentorshipMatches(matchesResult);
    } catch (error) {
      toast.error('Failed to find mentorship matches');
    }
  };

  const recommendMentorshipConnection = async (mentorProfileId: string) => {
    try {
      const connectionResult = await mentorshipService.recommendMentorshipConnection(
        selectedMenteeProfile,
        mentorProfileId
      );
      
      setSelectedMentorshipConnection(connectionResult.mentorshipConnection.id);
      toast.success('Mentorship connection recommended');
    } catch (error) {
      toast.error('Failed to recommend mentorship connection');
    }
  };

  const trackMentorshipProgress = async () => {
    try {
      const progressResult = await mentorshipService.trackMentorshipProgress(
        selectedMentorshipConnection
      );
      
      setConnectionDetails(progressResult);
    } catch (error) {
      toast.error('Failed to track mentorship progress');
    }
  };

  const renderMentorshipMatching = () => {
    if (!mentorshipMatches) return null;

    const { menteeProfile, matches, matchingInsights } = mentorshipMatches;

    return (
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Mentorship Matching Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <RadarChart 
              data={{
                labels: [
                  'Domain Alignment', 
                  'Skills Compatibility', 
                  'Experience Complementarity', 
                  'Potential Impact'
                ],
                datasets: [{
                  label: 'Matching Metrics',
                  data: [
                    matchingInsights?.domainAlignment || 0,
                    matchingInsights?.skillsCompatibility || 0,
                    matchingInsights?.experienceComplementarity || 0,
                    matchingInsights?.potentialImpact || 0
                  ]
                }]
              }}
            />
            <div className="mt-4 text-center">
              <Badge variant="outline">
                Mentee Domain: {menteeProfile.domain}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mentee Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="bg-gray-100 p-2 rounded">
                <strong>Domain:</strong> {menteeProfile.domain}
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <strong>Skills:</strong> {menteeProfile.skills}
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <strong>Experience:</strong> {menteeProfile.experience} years
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <strong>Goals:</strong> {menteeProfile.goals}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Mentor Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {matches.map((match, index) => (
                <li 
                  key={match.mentor.id} 
                  className="bg-gray-100 p-2 rounded flex justify-between items-center"
                >
                  <div>
                    <strong>{match.mentor.userId}</strong>
                    <div className="text-sm text-gray-600">
                      Match Score: {(match.matchScore * 100).toFixed(2)}%
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => recommendMentorshipConnection(match.mentor.id)}
                  >
                    Connect
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Matching Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {matchingInsights && 
                Object.entries(matchingInsights).map(([key, value]) => (
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

  const renderMentorshipConnections = () => {
    if (!connectionDetails) return null;

    const { mentorshipConnection, progressTracking } = connectionDetails;

    return (
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Mentorship Connection Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <TimelineChart 
              data={{
                events: progressTracking?.progressSteps || []
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connection Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="bg-gray-100 p-2 rounded">
                <strong>Status:</strong> {mentorshipConnection.status}
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <strong>Mentee:</strong> {mentorshipConnection.menteeId}
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <strong>Mentor:</strong> {mentorshipConnection.mentorId}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Progress Tracking Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {progressTracking && 
                Object.entries(progressTracking).map(([key, value]) => (
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

  const renderDomainDistribution = () => {
    return (
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Entrepreneurship Domain Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={{
                labels: Object.values(EntrepreneurshipDomain),
                datasets: [{
                  label: 'Profiles per Domain',
                  data: Object.values(EntrepreneurshipDomain).map(domain => 
                    profiles.filter(p => p.domain === domain).length
                  )
                }]
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mentorship Network</CardTitle>
          </CardHeader>
          <CardContent>
            <NetworkGraph 
              data={{
                nodes: profiles.map(profile => ({
                  id: profile.id,
                  label: profile.userId,
                  size: profile.role === 'MENTOR' ? 1 : 0.5
                })),
                edges: profiles
                  .filter(p => p.role === 'MENTEE')
                  .map(mentee => ({
                    source: mentee.id,
                    target: mentorshipMatches?.matches[0]?.mentor?.id
                  }))
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
          <CardTitle>Entrepreneurship Mentorship Matching</CardTitle>
          <CardDescription>
            AI-powered mentorship connections for entrepreneurial growth
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <select
              value={selectedMenteeProfile || ''}
              onChange={(e) => setSelectedMenteeProfile(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {profiles
                .filter(p => p.role === 'MENTEE')
                .map(profile => (
                  <option key={profile.id} value={profile.id}>
                    {profile.userId} - {profile.domain}
                  </option>
                ))
              }
            </select>
            <Button onClick={findMentorshipMatches}>
              Find Matches
            </Button>
          </div>

          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
          >
            <TabsList>
              <TabsTrigger value="matching">Mentorship Matching</TabsTrigger>
              <TabsTrigger value="connections">Mentorship Connections</TabsTrigger>
              <TabsTrigger value="distribution">Domain Distribution</TabsTrigger>
            </TabsList>
            
            <TabsContent value="matching">
              {renderMentorshipMatching()}
            </TabsContent>
            
            <TabsContent value="connections">
              {renderMentorshipConnections()}
            </TabsContent>
            
            <TabsContent value="distribution">
              {renderDomainDistribution()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
