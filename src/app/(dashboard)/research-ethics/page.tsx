'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from 'react';

export default function ResearchEthicsDashboard() {
  const [ethicalStandards, setEthicalStandards] = useState([
    'SPEC-001: AI Bias Mitigation',
    'SPEC-002: Quantum AI Integration',
    'SPEC-000: Foundational Ethical Principles'
  ]);

  const addEthicalStandard = () => {
    const newStandard = prompt('Enter a new ethical standard:');
    if (newStandard) {
      setEthicalStandards([...ethicalStandards, newStandard]);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Research and Ethics Division</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Applied AI Research</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Ethical AI Systems Development</p>
            <div className="mt-4 space-y-2">
              <p>Active Research Projects: 6</p>
              <p>Publication Submissions: 3</p>
              <Button variant="outline" className="mt-2">Research Portfolio</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ethical Standards</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 max-h-40 overflow-y-auto">
              {ethicalStandards.map((standard, index) => (
                <li key={index} className="flex justify-between items-center">
                  {standard}
                </li>
              ))}
            </ul>
            <Button onClick={addEthicalStandard} className="mt-4 w-full">Add Standard</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ethical Oversight</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>Bias Mitigation: Active</p>
              <p>AI Explainability: 92% Transparent</p>
              <p>Ethical Compliance: Verified</p>
              <Button variant="outline" className="mt-2">Compliance Report</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quantum AI Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>Quantum Plugins: SPEC-002</p>
              <p>Problem-Solving Efficiency: +45%</p>
              <p>Research Complexity: Advanced</p>
              <Button variant="outline" className="mt-2">Quantum Research</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leadership Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>Applied AI Research Lead: Dr. Elena Rodriguez</p>
              <p>Ethical Oversight Commander: David Kim</p>
              <p>Quantum Integration Lead: Dr. Aisha Patel</p>
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
              <Button className="w-full">Initiate Ethical Review</Button>
              <Button className="w-full">Launch Research Project</Button>
              <Button className="w-full">Update Ethical Framework</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
