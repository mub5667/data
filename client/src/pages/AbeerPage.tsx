import { useQuery, useMutation } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AbeerPage() {
  const { toast } = useToast();
  const { data = [] } = useQuery<any[]>({ queryKey: ['/api/abeer'] });

  const columns = [
    { key: 'month', label: 'Month' },
    { key: 'incomeMalaysia', label: 'Income Malaysia' },
    { key: 'totalIncome', label: 'Total Income' },
    { key: 'malaysiaOffice', label: 'Malaysia Office' },
    { key: 'salaries', label: 'Salaries' },
    { key: 'subAgent', label: 'Sub Agent' },
    { key: 'socialMedia', label: 'Social Media' },
    { key: 'totalOutcome', label: 'Total Outcome' },
  ];

  const addMutation = useMutation({
    mutationFn: (record: any) => apiRequest('/api/abeer', 'POST', record),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/abeer'] });
      toast({ title: "Record added successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest(`/api/abeer/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/abeer'] });
      toast({ title: "Record updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/abeer/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/abeer'] });
      toast({ title: "Record deleted successfully" });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">ABEER 2025</h1>
        <p className="text-muted-foreground mt-2">Financial data and income/outcome analysis</p>
      </div>
      
      <DataTable
        title="ABEER 2025 Financial Records"
        data={data}
        columns={columns}
        onAdd={(row) => addMutation.mutate(row)}
        onEdit={(id, row) => updateMutation.mutate({ id, data: row })}
        onDelete={(id) => deleteMutation.mutate(id)}
        datasetName="abeer"
      />
    </div>
  );
}
