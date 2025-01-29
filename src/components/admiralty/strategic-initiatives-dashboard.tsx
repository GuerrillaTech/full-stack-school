'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { AdmiraltyService } from '@/lib/admiralty/admiralty-service';
import { StrategicInitiativeDetails } from '@/types/admiralty';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-toastify';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export function StrategicInitiativesDashboard() {
  const [initiatives, setInitiatives] = useState<StrategicInitiativeDetails[]>([]);
  const [newInitiative, setNewInitiative] = useState({
    title: '',
    description: '',
    budget: 0,
    divisions: [] as string[],
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { user } = useUser();
  const admiraltyService = new AdmiraltyService();

  // Fetch initiatives on component mount
  useEffect(() => {
    const fetchInitiatives = async () => {
      try {
        const fetchedInitiatives = await admiraltyService.getAllStrategicInitiatives();
        setInitiatives(fetchedInitiatives);
      } catch (error) {
        toast.error('Failed to fetch strategic initiatives');
      }
    };

    fetchInitiatives();
  }, []);

  // Create new strategic initiative
  const handleCreateInitiative = async () => {
    if (!user) {
      toast.error('Authentication required');
      return;
    }

    try {
      const initiative = await admiraltyService.proposeStrategicInitiative(
        newInitiative.title,
        newInitiative.description,
        user.id,
        newInitiative.divisions as any,
        newInitiative.budget
      );
      
      setInitiatives([...initiatives, initiative]);
      setNewInitiative({ title: '', description: '', budget: 0, divisions: [] });
      setIsDialogOpen(false);
      toast.success('Strategic initiative created successfully');
    } catch (error) {
      toast.error('Failed to create initiative');
    }
  };

  // Update initiative status
  const handleUpdateStatus = async (
    initiativeId: string, 
    status: 'PROPOSED' | 'IN_PROGRESS' | 'COMPLETED' | 'SUSPENDED'
  ) => {
    try {
      const updatedInitiative = await admiraltyService.updateInitiativeStatus(
        initiativeId, 
        status
      );
      
      setInitiatives(
        initiatives.map(init => 
          init.id === initiativeId ? updatedInitiative : init
        )
      );
      toast.success(`Initiative status updated to ${status}`);
    } catch (error) {
      toast.error('Failed to update initiative status');
    }
  };

  // Render initiative status badge
  const renderStatusBadge = (status: string) => {
    const statusColors = {
      'PROPOSED': 'bg-blue-100 text-blue-800',
      'IN_PROGRESS': 'bg-yellow-100 text-yellow-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'SUSPENDED': 'bg-red-100 text-red-800',
    };

    return (
      <Badge 
        variant="outline" 
        className={statusColors[status as keyof typeof statusColors] || ''}
      >
        {status}
      </Badge>
    );
  };

  // Calculate initiative progress
  const calculateProgress = (initiative: StrategicInitiativeDetails) => {
    // Implement progress calculation logic based on start/end dates and status
    const totalDuration = initiative.endDate 
      ? (new Date(initiative.endDate).getTime() - new Date(initiative.startDate).getTime()) 
      : 0;
    const elapsedDuration = new Date().getTime() - new Date(initiative.startDate).getTime();
    
    const baseProgress = totalDuration > 0 
      ? Math.min(100, (elapsedDuration / totalDuration) * 100) 
      : 0;

    // Adjust progress based on status
    switch (initiative.status) {
      case 'COMPLETED': return 100;
      case 'SUSPENDED': return 0;
      case 'PROPOSED': return 10;
      default: return baseProgress;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Strategic Initiatives</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Create Initiative</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Propose Strategic Initiative</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input 
                placeholder="Initiative Title" 
                value={newInitiative.title}
                onChange={(e) => setNewInitiative({
                  ...newInitiative, 
                  title: e.target.value
                })}
              />
              <Textarea 
                placeholder="Description" 
                value={newInitiative.description}
                onChange={(e) => setNewInitiative({
                  ...newInitiative, 
                  description: e.target.value
                })}
              />
              <Input 
                type="number" 
                placeholder="Budget" 
                value={newInitiative.budget}
                onChange={(e) => setNewInitiative({
                  ...newInitiative, 
                  budget: parseFloat(e.target.value)
                })}
              />
              <Select 
                onValueChange={(value) => setNewInitiative({
                  ...newInitiative, 
                  divisions: [value]
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Division" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACADEMY">Academy</SelectItem>
                  <SelectItem value="SALLIRREUG_TECH">SallirreugTech</SelectItem>
                  <SelectItem value="RESEARCH_ETHICS">Research Ethics</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleCreateInitiative}>
                Propose Initiative
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initiatives.map((initiative) => (
            <TableRow key={initiative.id}>
              <TableCell>{initiative.title}</TableCell>
              <TableCell>{initiative.description}</TableCell>
              <TableCell>${initiative.budget.toLocaleString()}</TableCell>
              <TableCell>
                {renderStatusBadge(initiative.status)}
              </TableCell>
              <TableCell>
                <Progress 
                  value={calculateProgress(initiative)} 
                  className="w-full" 
                />
              </TableCell>
              <TableCell>
                <Select 
                  onValueChange={(status) => handleUpdateStatus(
                    initiative.id, 
                    status as any
                  )}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Update Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PROPOSED">Propose</SelectItem>
                    <SelectItem value="IN_PROGRESS">Start</SelectItem>
                    <SelectItem value="COMPLETED">Complete</SelectItem>
                    <SelectItem value="SUSPENDED">Suspend</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
