'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdmiraltyService } from '@/lib/admiralty/admiralty-service';
import { StrategicInitiativeDetails } from '@/lib/admiralty/types';

export function StrategicInitiativesManager() {
  const [initiatives, setInitiatives] = useState<StrategicInitiativeDetails[]>([]);
  const [newInitiative, setNewInitiative] = useState({
    title: '',
    description: '',
    leaderId: '' // TODO: Integrate with authentication
  });

  const admiraltyService = new AdmiraltyService();

  const handleCreateInitiative = async () => {
    try {
      const initiative = await admiraltyService.proposeStrategicInitiative(
        newInitiative.title,
        newInitiative.description,
        newInitiative.leaderId,
        ['ACADEMY', 'SALLIRREUG_TECH'] // Example divisions
      );
      
      setInitiatives([...initiatives, initiative]);
      // Reset form
      setNewInitiative({ title: '', description: '', leaderId: '' });
    } catch (error) {
      console.error('Failed to create initiative', error);
    }
  };

  const updateInitiativeStatus = async (
    initiativeId: string, 
    status: 'PROPOSED' | 'IN_PROGRESS' | 'COMPLETED' | 'SUSPENDED'
  ) => {
    try {
      const updatedInitiative = await admiraltyService.updateInitiativeStatus(
        initiativeId, 
        status
      );
      
      setInitiatives(initiatives.map(init => 
        init.id === initiativeId ? updatedInitiative : init
      ));
    } catch (error) {
      console.error('Failed to update initiative status', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Strategic Initiatives Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Propose New Initiative</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Propose Strategic Initiative</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input 
                    id="title" 
                    value={newInitiative.title}
                    onChange={(e) => setNewInitiative({
                      ...newInitiative, 
                      title: e.target.value
                    })}
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Input 
                    id="description" 
                    value={newInitiative.description}
                    onChange={(e) => setNewInitiative({
                      ...newInitiative, 
                      description: e.target.value
                    })}
                    className="col-span-3" 
                  />
                </div>
              </div>
              <Button onClick={handleCreateInitiative}>
                Create Initiative
              </Button>
            </DialogContent>
          </Dialog>

          <div className="mt-6 space-y-4">
            {initiatives.map((initiative) => (
              <Card key={initiative.id} className="w-full">
                <CardHeader>
                  <CardTitle>{initiative.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{initiative.description}</p>
                  <div className="mt-4 flex space-x-2">
                    <Button 
                      variant={initiative.status === 'IN_PROGRESS' ? 'default' : 'outline'}
                      onClick={() => updateInitiativeStatus(initiative.id, 'IN_PROGRESS')}
                    >
                      Start
                    </Button>
                    <Button 
                      variant={initiative.status === 'COMPLETED' ? 'default' : 'outline'}
                      onClick={() => updateInitiativeStatus(initiative.id, 'COMPLETED')}
                    >
                      Complete
                    </Button>
                    <Button 
                      variant={initiative.status === 'SUSPENDED' ? 'destructive' : 'outline'}
                      onClick={() => updateInitiativeStatus(initiative.id, 'SUSPENDED')}
                    >
                      Suspend
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
