import { useQuery, useMutation } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function DataPage() {
  const { toast } = useToast();
  const { data = [] } = useQuery<any[]>({ queryKey: ['/api/data-records'] });

  const columns = [
    { key: 'month', label: 'Month' },
    { key: 'no', label: 'No' },
    { key: 'name', label: 'Name' },
    { key: 'uni', label: 'University' },
    { key: 'program', label: 'Program' },
  ];

  const addMutation = useMutation({
    mutationFn: (record: any) => apiRequest('/api/data-records', 'POST', record),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/data-records'] });
      toast({ title: "Record added successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest(`/api/data-records/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/data-records'] });
      toast({ title: "Record updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/data-records/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/data-records'] });
      toast({ title: "Record deleted successfully" });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">DATA 2025</h1>
        <p className="text-muted-foreground mt-2">Student enrollment and program data</p>
      </div>
      
      <DataTable
        title="DATA 2025 Student Records"
        data={data}
        columns={columns}
        onAdd={(row) => addMutation.mutate(row)}
        onEdit={(id, row) => updateMutation.mutate({ id, data: row })}
        onDelete={(id) => deleteMutation.mutate(id)}
        datasetName="data"
      />
    </div>
  );
}
