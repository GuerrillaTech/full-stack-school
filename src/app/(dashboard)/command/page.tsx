'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from 'react';

export default function CommandDivisionDashboard() {
  const [partnerships, setPartnerships] = useState([
    'Academic Institution A',
    'Corporate Partner B',
    'Government Entity C'
  ]);

  const addPartnership = () => {
    const newPartnership = prompt('Enter a new strategic partnership:');
    if (newPartnership) {
      setPartnerships([...partnerships, newPartnership]);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Command Division</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Operations Leadership</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Fleet Captain of Operations</p>
            <div className="mt-4 space-y-2">
              <p>Daily Coordination Status: Active</p>
              <p>Inter-Division Alignment: Optimal</p>
              <Button variant="outline" className="mt-2">Operational Details</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Governance & Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>Ethical Safeguards: Implemented</p>
              <p>Regulatory Compliance: ✓</p>
              <p>Recent Audits: Passed</p>
              <Button variant="outline" className="mt-2">Compliance Report</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Strategic Partnerships</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 max-h-40 overflow-y-auto">
              {partnerships.map((partner, index) => (
                <li key={index} className="flex justify-between items-center">
                  {partner}
                </li>
              ))}
            </ul>
            <Button onClick={addPartnership} className="mt-4 w-full">Add Partnership</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coordination Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>Cross-Division Meetings: 24/month</p>
              <p>Collaboration Initiatives: 12</p>
              <p>Communication Efficiency: 95%</p>
              <Button variant="outline" className="mt-2">Detailed Metrics</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leadership Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>Fleet Captain: Dr. Emily Rodriguez</p>
              <p>Governance Commander: Michael Chen</p>
              <p>Partnerships Lead: Sarah Thompson</p>
              <Button variant="outline" className="mt-2">Team Details</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full">Schedule Coordination Meeting</Button>
              <Button className="w-full">Generate Compliance Report</Button>
              <Button className="w-full">Update Partnership Tracker</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
