'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StrategicInitiativesDashboard } from '@/components/admiralty/strategic-initiatives-dashboard';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function AdmiraltyDashboard() {
  const router = useRouter();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admiralty Strategic Command</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fleet Admiral Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Placeholder for high-level metrics */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Initiatives</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Initiatives</p>
                <p className="text-2xl font-bold">5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Placeholder for budget visualization */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">$1,250,000</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Allocated</p>
                <p className="text-2xl font-bold">$750,000</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button variant="outline" className="w-full">
                New Strategic Initiative
              </Button>
              <Button variant="outline" className="w-full">
                Generate Performance Report
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organizational Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>Divisions: 4</p>
              <p>Strategic Partnerships: 12</p>
              <p>Ethical Standards: 3</p>
              <Button variant="outline" className="mt-4">Detailed Report</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Budget Allocation</p>
            <div className="mt-4 space-y-2">
              <p>Education: 40%</p>
              <p>Research: 30%</p>
              <p>Innovation: 20%</p>
              <p>Overhead: 10%</p>
              <Button variant="outline" className="mt-4">Detailed Financials</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ethical Governance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>SPEC-001 Compliance: ✓</p>
              <p>SPEC-002 Integration: ✓</p>
              <p>Equity Monitoring: Active</p>
              <Button variant="outline" className="mt-4">Ethics Report</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Division Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button onClick={() => router.push('/dashboard/command')} className="w-full">Command Division</Button>
              <Button onClick={() => router.push('/dashboard/academy')} className="w-full">Ohio Tech Academy</Button>
              <Button onClick={() => router.push('/dashboard/sallirreug-tech')} className="w-full">SallirreugTech</Button>
              <Button onClick={() => router.push('/dashboard/research-ethics')} className="w-full">Research & Ethics</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategic Initiatives Dashboard */}
      <StrategicInitiativesDashboard />
    </div>
  );
}
