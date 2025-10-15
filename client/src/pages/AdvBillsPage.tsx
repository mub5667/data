import { useQuery, useMutation } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AdvBillsPage() {
  const { toast } = useToast();
  const { data = [] } = useQuery<any[]>({ queryKey: ['/api/adv-bills'] });
  
  const columns: { key: string; label: string; type?: 'text' | 'number' | 'date' | 'status' }[] = [
    { key: 'no', label: 'No' },
    { key: 'billId', label: 'Bill id', type: 'text' },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'description', label: 'Description', type: 'text' },
    { key: 'amount', label: 'Amount (RM)', type: 'number' },
  ];

  const addMutation = useMutation({
    mutationFn: (record: any) => apiRequest('/api/adv-bills', 'POST', record),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/adv-bills'] });
      toast({ title: "Advance bill added successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest(`/api/adv-bills/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/adv-bills'] });
      toast({ title: "Advance bill updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/adv-bills/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/adv-bills'] });
      toast({ title: "Advance bill deleted successfully" });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">ADV BILLS 2025-2026</h1>
        <p className="text-muted-foreground mt-2">Advance bill records and payments</p>
      </div>
      
      <DataTable
        title="Advance Bills Records"
        data={(data || []).map((item: any, index: number) => ({ ...item, no: index + 1 }))}
        columns={columns}
        onAdd={(row) => {
          const { no, ...rest } = row as any;
          addMutation.mutate(rest);
        }}
        onEdit={(id, row) => {
          const { no, ...rest } = row as any;
          updateMutation.mutate({ id, data: rest });
        }}
        onDelete={(id) => deleteMutation.mutate(id)}
        datasetName="adv-bills"
      />
    </div>
  );
}
