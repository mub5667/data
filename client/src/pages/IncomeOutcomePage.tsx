import { useQuery, useMutation } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { Tabs, TabsContent, PillTabsList as TabsList, PillTabsTrigger as TabsTrigger } from "@/components/ui/tailwind-tabs";

export default function IncomeOutcomePage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("malaysia");
  const { data: allData = [] } = useQuery<any[]>({ queryKey: ['/api/incomeoutcome'] });

  // Filter data by country
  const malaysiaData = allData.filter(item => item.country === "Malaysia");
  const egyptData = allData.filter(item => item.country === "Egypt");
  const uaeData = allData.filter(item => item.country === "UAE");
  const saudiArabiaData = allData.filter(item => item.country === "Saudi Arabia");

  // Malaysia columns - show all columns
  const malaysiaColumns = [
    { key: 'no', label: 'No' },
    { key: 'date', label: 'Date' },
    { key: 'income', label: 'Income' },
    { key: 'office', label: 'Office' },
    { key: 'salaries', label: 'Salaries' },
    { key: 'subagent', label: 'Sub Agent' },
    { key: 'socialmedia', label: 'Social Media' },
    { key: 'outcome', label: 'Outcome' },
  ];
  
  // Egypt, UAE, Saudi Arabia columns - show only no, date, income, outcome
  const limitedColumns = [
    { key: 'no', label: 'No' },
    { key: 'date', label: 'Date' },
    { key: 'income', label: 'Income' },
    { key: 'outcome', label: 'Outcome' },
  ];

  const addMutation = useMutation({
    mutationFn: (record: any) => {
      // Add the country based on active tab
      const recordWithCountry = {
        ...record,
        country: activeTab === "malaysia" ? "Malaysia" : 
                 activeTab === "egypt" ? "Egypt" : 
                 activeTab === "uae" ? "UAE" : "Saudi Arabia"
      };
      return apiRequest('/api/incomeoutcome', 'POST', recordWithCountry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/incomeoutcome'] });
      toast({ title: "Record added successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest(`/api/incomeoutcome/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/incomeoutcome'] });
      toast({ title: "Record updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/incomeoutcome/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/incomeoutcome'] });
      toast({ title: "Record deleted successfully" });
    },
  });

  return (
    <div className="space-y-6 ">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Income & Outcome</h1>
        <p className="text-muted-foreground mt-2">Financial data and income/outcome analysis by country</p>
      </div>
      
      <Tabs defaultValue="malaysia" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex w-full gap-5 mb-5 overflow-x-auto p-1 bg-card rounded-lg">
          <TabsTrigger value="malaysia">Malaysia</TabsTrigger>
          <TabsTrigger value="egypt">Egypt</TabsTrigger>
          <TabsTrigger value="uae">UAE</TabsTrigger>
          <TabsTrigger value="saudiarabia">Saudi Arabia</TabsTrigger>
        </TabsList>
        
        <TabsContent value="malaysia">
          <DataTable
            title="Malaysia Income & Outcome Records"
            data={malaysiaData}
            columns={malaysiaColumns}
            onAdd={(row) => addMutation.mutate(row)}
            onEdit={(id, row) => updateMutation.mutate({ id, data: row })}
            onDelete={(id) => deleteMutation.mutate(id)}
            datasetName="incomeoutcome-malaysia"
          />
        </TabsContent>
        
        <TabsContent value="egypt">
          <DataTable
            title="Egypt Income & Outcome Records"
            data={egyptData}
            columns={limitedColumns}
            onAdd={(row) => addMutation.mutate(row)}
            onEdit={(id, row) => updateMutation.mutate({ id, data: row })}
            onDelete={(id) => deleteMutation.mutate(id)}
            datasetName="incomeoutcome-egypt"
          />
        </TabsContent>
        
        <TabsContent value="uae">
          <DataTable
            title="UAE Income & Outcome Records"
            data={uaeData}
            columns={limitedColumns}
            onAdd={(row) => addMutation.mutate(row)}
            onEdit={(id, row) => updateMutation.mutate({ id, data: row })}
            onDelete={(id) => deleteMutation.mutate(id)}
            datasetName="incomeoutcome-uae"
          />
        </TabsContent>
        
        <TabsContent value="saudiarabia">
          <DataTable
            title="Saudi Arabia Income & Outcome Records"
            data={saudiArabiaData}
            columns={limitedColumns}
            onAdd={(row) => addMutation.mutate(row)}
            onEdit={(id, row) => updateMutation.mutate({ id, data: row })}
            onDelete={(id) => deleteMutation.mutate(id)}
            datasetName="incomeoutcome-saudiarabia"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}