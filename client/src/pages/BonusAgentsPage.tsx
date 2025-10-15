import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Plus, User } from "lucide-react";
import { useLocation } from "wouter";

// Predefined agents from the requirement
const DEFAULT_AGENTS = [
  "Mamoun", "Dan", "Mokhar", "Hakam", "Ahmed KSA", 
  "Majd", "Omar", "Sara", "Mayar", "Christina"
];

// Predefined agents for quick add functionality
const PREDEFINED_AGENTS = [
  "Mamoun", "Dan", "Mokhar", "Hakam", "Ahmed KSA", 
  "Majd", "Omar", "Sara", "Mayar", "Christina"
];

export default function BonusAgentsPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [newAgentName, setNewAgentName] = useState("");
  const [isAddAgentOpen, setIsAddAgentOpen] = useState(false);

  // Fetch agents
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/agents");
        if (!response.ok) {
          throw new Error("Failed to fetch agents");
        }
        return response.json();
      } catch (error) {
        console.error("Error fetching agents:", error);
        // Return default agents if API fails
        return DEFAULT_AGENTS.map(name => ({ id: name.toLowerCase().replace(/\s+/g, '-'), name, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
      }
    },
  });

  // Add agent mutation
  const addAgentMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to add agent");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast({
        title: "Success",
        description: "Agent added successfully",
      });
      setNewAgentName("");
      setIsAddAgentOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add agent",
        variant: "destructive",
      });
    },
  });

  // Add all predefined agents
  const addAllPredefinedAgents = async () => {
    try {
      // Check which predefined agents are not already in the list
      const existingAgentNames = agents.map((agent: any) => agent.name.toLowerCase());
      const agentsToAdd = PREDEFINED_AGENTS.filter(
        name => !existingAgentNames.some((existing: string) =>
          existing.includes(name.toLowerCase()) || 
          name.toLowerCase().includes(existing)
        )
      );
      
      if (agentsToAdd.length === 0) {
        toast({
          title: "Info",
          description: "All predefined agents are already added",
        });
        return;
      }
      
      // Add each agent sequentially
      for (const name of agentsToAdd) {
        await addAgentMutation.mutateAsync(name);
      }
      
      toast({
        title: "Success",
        description: `Added ${agentsToAdd.length} predefined agents`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add all predefined agents",
        variant: "destructive",
      });
    }
  };

  // Handle add agent form submission
  const handleAddAgent = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAgentName.trim()) {
      toast({
        title: "Error",
        description: "Agent name is required",
        variant: "destructive",
      });
      return;
    }
    
    addAgentMutation.mutate(newAgentName);
  };

  // Navigate to agent detail page
  const navigateToAgentPage = (agentName: string) => {
    // Convert agent name to URL-friendly format
    const agentSlug = agentName.toLowerCase().replace(/\s+/g, '-');
    setLocation(`/agent-bonuses/${agentSlug}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            Bonus Agents
          </h1>
          <p className="text-muted-foreground mt-2">Manage bonus agents and their records</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={addAllPredefinedAgents} 
            disabled={addAgentMutation.isPending}
          >
            Quick Add All Agents
          </Button>
          
          <Dialog open={isAddAgentOpen} onOpenChange={setIsAddAgentOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Agent
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Agent</DialogTitle>
                <DialogDescription>
                  Enter the name of the new agent to add them to the system.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleAddAgent}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="agentName">Agent Name</Label>
                    <Input
                      id="agentName"
                      placeholder="Enter agent name"
                      value={newAgentName}
                      onChange={(e) => setNewAgentName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddAgentOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={addAgentMutation.isPending}
                  >
                    {addAgentMutation.isPending ? "Adding..." : "Add Agent"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <p>Loading agents...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent: any, index: number) => (
            <Card 
              key={index} 
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => navigateToAgentPage(agent.name)}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">{agent.name}</h3>
                  <p className="text-muted-foreground text-sm">View agent details</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}