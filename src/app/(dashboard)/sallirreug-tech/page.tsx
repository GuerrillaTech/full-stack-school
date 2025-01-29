'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from 'react';

export default function SallirreugTechDashboard() {
  const [products, setProducts] = useState([
    'AI Ethical Framework Plugin',
    'Quantum Problem Solver',
    'Education Analytics Platform'
  ]);

  const addProduct = () => {
    const newProduct = prompt('Enter a new product in development:');
    if (newProduct) {
      setProducts([...products, newProduct]);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">SallirreugTech Division</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Research & Development</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Transforming Academy Ideas into Solutions</p>
            <div className="mt-4 space-y-2">
              <p>Active Research Projects: 8</p>
              <p>Potential Commercialization: 5</p>
              <Button variant="outline" className="mt-2">R&D Portfolio</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 max-h-40 overflow-y-auto">
              {products.map((product, index) => (
                <li key={index} className="flex justify-between items-center">
                  {product}
                </li>
              ))}
            </ul>
            <Button onClick={addProduct} className="mt-4 w-full">Add Product</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Commercialization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>Market-Ready Products: 3</p>
              <p>Startup Incubations: 2</p>
              <p>Revenue Generated: $1.2M</p>
              <Button variant="outline" className="mt-2">Financial Report</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technical Infrastructure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>AI Servers: Titan A900</p>
              <p>Quantum AI Plugin: QAI-LLM</p>
              <p>System Reliability: 99.9%</p>
              <Button variant="outline" className="mt-2">Infrastructure Details</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Entrepreneurship Support</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>Graduates Supported: 12</p>
              <p>Startup Mentorship: Active</p>
              <p>Incubation Success Rate: 75%</p>
              <Button variant="outline" className="mt-2">Startup Tracker</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full">Initiate New Research</Button>
              <Button className="w-full">Launch Product</Button>
              <Button className="w-full">Support Startup</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
