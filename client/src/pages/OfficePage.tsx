import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

interface RentRecord {
  id: string;
  amount: number;
  date: string;
  ref: string;
}

interface LawyerTaxContractRecord {
  id: string;
  amount: number;
  date: string;
  ref: string;
}

interface BillsRecord {
  id: string;
  amount: number;
  date: string;
  ref: string;
}

interface MaintenanceRecord {
  id: string;
  amount: number;
  date: string;
  ref: string;
}

interface MedicalExpensesRecord {
  id: string;
  amount: number;
  date: string;
  ref: string;
}

interface GeneralExpensesRecord {
  id: string;
  amount: number;
  date: string;
  ref: string;
}

interface SocialMediaRecord {
  id: string;
  amount: number;
  date: string;
  ref: string;
}

export default function OfficePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("rent");

  // Rent Data
  const { data: rent, isLoading: isLoadingRent } = useQuery({
    queryKey: ["rent"],
    queryFn: async () => {
      const response = await fetch("/api/rent");
      if (!response.ok) throw new Error("Failed to fetch rent");
      return response.json();
    },
  });

  // Lawyer Tax Contract Data
  const { data: lawyerTaxContract, isLoading: isLoadingLawyer } = useQuery({
    queryKey: ["lawyer-tax-contract"],
    queryFn: async () => {
      const response = await fetch("/api/lawyer-tax-contract");
      if (!response.ok) throw new Error("Failed to fetch lawyer tax contract");
      return response.json();
    },
  });

  // Bills Data
  const { data: bills, isLoading: isLoadingBills } = useQuery({
    queryKey: ["bills"],
    queryFn: async () => {
      const response = await fetch("/api/bills");
      if (!response.ok) throw new Error("Failed to fetch bills");
      return response.json();
    },
  });

  // Maintenance Data
  const { data: maintenance, isLoading: isLoadingMaintenance } = useQuery({
    queryKey: ["maintenance"],
    queryFn: async () => {
      const response = await fetch("/api/maintenance");
      if (!response.ok) throw new Error("Failed to fetch maintenance");
      return response.json();
    },
  });

  // Medical Expenses Data
  const { data: medicalExpenses, isLoading: isLoadingMedical } = useQuery({
    queryKey: ["medical-expenses"],
    queryFn: async () => {
      const response = await fetch("/api/medical-expenses");
      if (!response.ok) throw new Error("Failed to fetch medical expenses");
      return response.json();
    },
  });

  // General Expenses Data
  const { data: generalExpenses, isLoading: isLoadingGeneral } = useQuery({
    queryKey: ["general-expenses"],
    queryFn: async () => {
      const response = await fetch("/api/general-expenses");
      if (!response.ok) throw new Error("Failed to fetch general expenses");
      return response.json();
    },
  });

  // Social Media Data
  const { data: socialMedia, isLoading: isLoadingSocial } = useQuery({
    queryKey: ["social-media"],
    queryFn: async () => {
      const response = await fetch("/api/social-media");
      if (!response.ok) throw new Error("Failed to fetch social media");
      return response.json();
    },
  });

  // Generic mutation handlers
  const createMutation = useMutation({
    mutationFn: async ({ endpoint, data }: { endpoint: string; data: any }) => {
      const response = await fetch(`/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`Failed to create ${endpoint}`);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.endpoint] });
      toast({ title: "Record created successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ endpoint, id, data }: { endpoint: string; id: string; data: any }) => {
      const response = await fetch(`/api/${endpoint}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`Failed to update ${endpoint}`);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.endpoint] });
      toast({ title: "Record updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ endpoint, id }: { endpoint: string; id: string }) => {
      const response = await fetch(`/api/${endpoint}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`Failed to delete ${endpoint}`);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.endpoint] });
      toast({ title: "Record deleted successfully" });
    },
  });

  const getCurrentEndpoint = () => {
    switch (activeTab) {
      case "rent": return "rent";
      case "lawyer-tax-contract": return "lawyer-tax-contract";
      case "bills": return "bills";
      case "maintenance": return "maintenance";
      case "medical-expenses": return "medical-expenses";
      case "general-expenses": return "general-expenses";
      case "social-media": return "social-media";
      default: return "";
    }
  };

  const handleAdd = (record: any) => {
    const { no, ...rest } = record || {};
    createMutation.mutate({ endpoint: getCurrentEndpoint(), data: rest });
  };

  const handleEdit = (id: string, record: any) => {
    const { no, ...rest } = record || {};
    updateMutation.mutate({ endpoint: getCurrentEndpoint(), id, data: rest });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ endpoint: getCurrentEndpoint(), id });
  };

  const isLoading = isLoadingRent || isLoadingLawyer || isLoadingBills || isLoadingMaintenance || isLoadingMedical || isLoadingGeneral || isLoadingSocial;

  if (isLoading) {
    return <div className="p-6">Loading data...</div>;
  }

  const officeColumns = [
    { key: "no", label: "No" },
    { key: "amount", label: "Amount", type: "number" as const },
    { key: "date", label: "Date", type: "date" as const },
    { key: "ref", label: "Reference", type: "text" as const },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Office</h1>
        <p className="text-muted-foreground">Manage office expenses and related data</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TooltipProvider>
          <TabsList className="flex w-full gap-2 overflow-x-auto p-1 bg-card rounded-lg">
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="rent" className="whitespace-nowrap px-3 sm:px-4 hover:bg-primary/10 data-[state=active]:bg-primary/20 data-[state=active]:text-foreground rounded-md transition-colors">Rent</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>Rent</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="lawyer-tax-contract" className="whitespace-nowrap px-3 sm:px-4 hover:bg-primary/10 data-[state=active]:bg-primary/20 data-[state=active]:text-foreground rounded-md transition-colors">Lawyer/Tax/Contract</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>Lawyer/Tax/Contract</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="bills" className="whitespace-nowrap px-3 sm:px-4 hover:bg-primary/10 data-[state=active]:bg-primary/20 data-[state=active]:text-foreground rounded-md transition-colors">Bills</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>Bills</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="maintenance" className="whitespace-nowrap px-3 sm:px-4 hover:bg-primary/10 data-[state=active]:bg-primary/20 data-[state=active]:text-foreground rounded-md transition-colors">Maintenance</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>Maintenance</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="medical-expenses" className="whitespace-nowrap px-3 sm:px-4 hover:bg-primary/10 data-[state=active]:bg-primary/20 data-[state=active]:text-foreground rounded-md transition-colors">Medical Expenses</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>Medical Expenses</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="general-expenses" className="whitespace-nowrap px-3 sm:px-4 hover:bg-primary/10 data-[state=active]:bg-primary/20 data-[state=active]:text-foreground rounded-md transition-colors">General Expenses</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>General Expenses</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="social-media" className="whitespace-nowrap px-3 sm:px-4 hover:bg-primary/10 data-[state=active]:bg-primary/20 data-[state=active]:text-foreground rounded-md transition-colors">Social Media</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>Social Media</TooltipContent>
            </Tooltip>
          </TabsList>
        </TooltipProvider>

        <TabsContent value="rent">
          <DataTable
            title="Rent"
            data={(rent || []).map((item: any, index: number) => ({ ...item, no: index + 1 }))}
            columns={officeColumns}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            datasetName="rent"
          />
        </TabsContent>

        <TabsContent value="lawyer-tax-contract">
          <DataTable
            title="Lawyer/Tax/Contract"
            data={(lawyerTaxContract || []).map((item: any, index: number) => ({ ...item, no: index + 1 }))}
            columns={officeColumns}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            datasetName="lawyer-tax-contract"
          />
        </TabsContent>

        <TabsContent value="bills">
          <DataTable
            title="Bills"
            data={(bills || []).map((item: any, index: number) => ({ ...item, no: index + 1 }))}
            columns={officeColumns}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            datasetName="bills"
          />
        </TabsContent>

        <TabsContent value="maintenance">
          <DataTable
            title="Maintenance"
            data={(maintenance || []).map((item: any, index: number) => ({ ...item, no: index + 1 }))}
            columns={officeColumns}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            datasetName="maintenance"
          />
        </TabsContent>

        <TabsContent value="medical-expenses">
          <DataTable
            title="Medical Expenses"
            data={(medicalExpenses || []).map((item: any, index: number) => ({ ...item, no: index + 1 }))}
            columns={officeColumns}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            datasetName="medical-expenses"
          />
        </TabsContent>

        <TabsContent value="general-expenses">
          <DataTable
            title="General Expenses"
            data={(generalExpenses || []).map((item: any, index: number) => ({ ...item, no: index + 1 }))}
            columns={officeColumns}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            datasetName="general-expenses"
          />
        </TabsContent>

        <TabsContent value="social-media">
          <DataTable
            title="Social Media"
            data={(socialMedia || []).map((item: any, index: number) => ({ ...item, no: index + 1 }))}
            columns={officeColumns}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            datasetName="social-media"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}