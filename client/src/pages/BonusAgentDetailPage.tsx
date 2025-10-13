import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Search } from "lucide-react";

// Type definitions
interface Agent {
  id: string;
  name: string;
}

interface Student {
  id: string;
  name: string;
  uni: string;
  program: string;
}

interface AgentBonus {
  id: string;
  agentId: string;
  studentName: string;
  uni: string;
  program: string;
  month: string;
  tuitionFeesPayment: string;
  enrollment: string;
  enrollmentBonus: number;
  visaBonus: number;
  commissionFromUni: string;
  createdAt: string;
}

export default function BonusAgentDetailPage() {
  const { agentSlug } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [passportNumber, setPassportNumber] = useState("");
  const [isAddBonusOpen, setIsAddBonusOpen] = useState(false);
  const [bonusData, setBonusData] = useState({
    month: "",
    enrollment: "",
    enrollmentBonus: 0,
    visaBonus: 0,
    commissionFromUni: ""
  });

  // Fetch agent details
  const { data: agent, isLoading: isAgentLoading } = useQuery({
    queryKey: ["agent", agentSlug],
    queryFn: async () => {
      const response = await fetch(`/api/agents`);
      if (!response.ok) {
        throw new Error("Failed to fetch agent");
      }
      const agents = await response.json();
      // Find agent by name (converted to slug) instead of by ID
      const agent = agents.find((a: Agent) => 
        a.name.toLowerCase().replace(/\s+/g, '-') === agentSlug
      );
      if (!agent) {
        throw new Error("Agent not found");
      }
      return agent;
    },
  });

  // Fetch agent bonuses
  const { data: bonuses = [], isLoading: isBonusesLoading } = useQuery({
    queryKey: ["agent-bonuses", agentSlug, agent?.id],
    queryFn: async () => {
      if (!agent) return [];
      // Use the correct API endpoint for agent bonuses
      const response = await fetch(`/api/agent-bonuses/${agent.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch agent bonuses");
      }
      return response.json() as Promise<AgentBonus[]>;
    },
    enabled: !!agent?.id,
  });
  
  // Add sequential row numbers to the data
  const dataWithRowNumbers = bonuses.map((item, index) => ({
    ...item,
    no: index + 1,
  }));

  // Search student by passport number
  const searchStudentMutation = useMutation({
    mutationFn: async (passportNumber: string) => {
      const response = await fetch(`/api/students/search?passportNumber=${passportNumber}`);
      if (!response.ok) {
        throw new Error("Student not found");
      }
      return response.json() as Promise<Student>;
    },
    onSuccess: (student) => {
      setIsAddBonusOpen(true);
      toast({
        title: "Student Found",
        description: `Found ${student.name} from ${student.uni}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Student not found",
        variant: "destructive",
      });
    },
  });

  // Add bonus mutation
  const addBonusMutation = useMutation({
    mutationFn: async (data: { 
      agentId: string; 
      studentId: string; 
      passportNumber: string;
      month: string;
      enrollment: string;
      enrollmentBonus: number;
      visaBonus: number;
      commissionFromUni: string;
    }) => {
      const response = await fetch("/api/agent-bonuses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to add bonus");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-bonuses", agentSlug] });
      toast({
        title: "Success",
        description: "Bonus added successfully",
      });
      setIsAddBonusOpen(false);
      setPassportNumber("");
      setBonusData({
        month: "",
        enrollment: "",
        enrollmentBonus: 0,
        visaBonus: 0,
        commissionFromUni: ""
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add bonus",
        variant: "destructive",
      });
    },
  });

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (passportNumber.trim()) {
      searchStudentMutation.mutate(passportNumber);
    }
  };

  // Handle add bonus form submission
  const handleAddBonus = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchStudentMutation.data) {
      toast({
        title: "Error",
        description: "Please search for a student first",
        variant: "destructive",
      });
      return;
    }
    
    addBonusMutation.mutate({
      agentId: agent.id, // Use the actual agent ID, not the slug
      studentId: searchStudentMutation.data.id,
      passportNumber: searchStudentMutation.data.passportNumber,
      month: bonusData.month,
      enrollment: bonusData.enrollment,
      enrollmentBonus: bonusData.enrollmentBonus,
      visaBonus: bonusData.visaBonus,
      commissionFromUni: bonusData.commissionFromUni
    });
  };

  // Define columns for the DataTable
  const columns = [
    { key: "no", label: "No" },
    { key: "studentName", label: "Name" },
    { key: "uni", label: "University" },
    { key: "program", label: "Program" },
    { 
      key: "month", 
      label: "Month",
      render: (value: any) => value || "N/A"
    },
    { 
      key: "tuitionFeesPayment", 
      label: "Tuition Fees Payment",
      render: (value: any) => value || "N/A"
    },
    { 
      key: "enrollment", 
      label: "Enrollment",
      render: (value: any) => value || "N/A"
    },
    { 
      key: "enrollmentBonus", 
      label: "Enrollment Bonus",
      render: (value: any) => value !== null && value !== undefined ? value : "N/A"
    },
    { 
      key: "visaBonus", 
      label: "Visa Bonus",
      render: (value: any) => value !== null && value !== undefined ? value : "N/A"
    },
    { 
      key: "commissionFromUni", 
      label: "Commission from Uni",
      render: (value: any) => value || "N/A"
    },
    { 
      key: "createdAt", 
      label: "Created Date",
      render: (value: any) => value ? new Date(value).toLocaleDateString() : "N/A"
    },
  ];

  // Helper function for API requests
  const makeApiRequest = async (url: string, method: string, data?: any) => {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => {
      // Remove the 'no' field before sending to API since it's frontend-only
      const { no, ...dataWithoutNo } = data;
      return makeApiRequest(`/api/agent-bonuses/${id}`, "PUT", dataWithoutNo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-bonuses", agentSlug] });
      toast({ title: "Agent bonus record updated successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error updating record", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => makeApiRequest(`/api/agent-bonuses/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-bonuses", agentSlug] });
      toast({ title: "Agent bonus record deleted successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error deleting record", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  if (isAgentLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading agent details...</div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent Details</h1>
          <p className="text-muted-foreground mt-2">Agent not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Agent: ${agent.name}`}
        description="Manage bonus data for this agent"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Add New Bonus</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Search Student by Passport</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSearch} className="space-y-4 mt-4">
                  <div className="flex gap-2">
                    <Input
                      value={passportNumber}
                      onChange={(e) => setPassportNumber(e.target.value)}
                      placeholder="Enter passport number"
                      required
                    />
                    <Button type="submit" disabled={searchStudentMutation.isPending}>
                      <Search className="h-4 w-4 mr-2" /> Search
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {searchStudentMutation.data && (
        <Dialog open={isAddBonusOpen} onOpenChange={setIsAddBonusOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Bonus for {searchStudentMutation.data.name}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddBonus} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Student Details</Label>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Name: <span className="font-medium">{searchStudentMutation.data.name}</span></div>
                  <div>Passport: <span className="font-medium">{searchStudentMutation.data.passportNumber}</span></div>
                  <div>University: <span className="font-medium">{searchStudentMutation.data.uni}</span></div>
                  <div>Program: <span className="font-medium">{searchStudentMutation.data.program}</span></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <Input
                  id="month"
                  type="text"
                  value={bonusData.month}
                  onChange={(e) => setBonusData({...bonusData, month: e.target.value})}
                  placeholder="Enter month (e.g., January 2023)"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="enrollment">Enrollment</Label>
                <Input
                  id="enrollment"
                  type="text"
                  value={bonusData.enrollment}
                  onChange={(e) => setBonusData({...bonusData, enrollment: e.target.value})}
                  placeholder="Enter enrollment status"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="enrollmentBonus">Enrollment Bonus</Label>
                <Input
                  id="enrollmentBonus"
                  type="number"
                  value={bonusData.enrollmentBonus}
                  onChange={(e) => setBonusData({...bonusData, enrollmentBonus: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="visaBonus">Visa Bonus</Label>
                <Input
                  id="visaBonus"
                  type="number"
                  value={bonusData.visaBonus}
                  onChange={(e) => setBonusData({...bonusData, visaBonus: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="commissionFromUni">Commission from University</Label>
                <Input
                  id="commissionFromUni"
                  type="text"
                  value={bonusData.commissionFromUni}
                  onChange={(e) => setBonusData({...bonusData, commissionFromUni: e.target.value})}
                  placeholder="Enter commission details"
                  required
                />
              </div>
              
              <Button type="submit" disabled={addBonusMutation.isPending} className="w-full">
                {addBonusMutation.isPending ? "Saving..." : "Save Bonus Data"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Show loading state */}
      {isBonusesLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading bonus data...</div>
        </div>
      ) : (
        <DataTable
          title="Agent Bonus Records"
          data={dataWithRowNumbers}
          columns={columns}
          onAdd={(row) => addBonusMutation.mutate(row)}
          onEdit={(id, row) => updateMutation.mutate({ id, data: row })}
          onDelete={(id) => deleteMutation.mutate(id)}
          datasetName="agent-bonus"
        />
      )}
    </div>
  );
}