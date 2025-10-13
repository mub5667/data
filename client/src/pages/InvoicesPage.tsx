import { useQuery, useMutation } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function InvoicesPage() {
  const { toast } = useToast();
  const { data = [] } = useQuery<any[]>({ queryKey: ['/api/invoices'] });

  const columns = [
    { key: 'no', label: 'No.' },
    { key: 'uni', label: 'University' },
    { key: 'type', label: 'Type' },
    { key: 'date', label: 'Date' },
  ];

  const addMutation = useMutation({
    mutationFn: (record: any) => apiRequest('/api/invoices', 'POST', record),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      toast({ title: "Invoice added successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest(`/api/invoices/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      toast({ title: "Invoice updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/invoices/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      toast({ title: "Invoice deleted successfully" });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">INVOICES</h1>
        <p className="text-muted-foreground mt-2">Invoice records and payment status</p>
      </div>
      
      <DataTable
        title="Invoice Records"
        data={data}
        columns={columns}
        onAdd={(row) => addMutation.mutate(row)}
        onEdit={(id, row) => updateMutation.mutate({ id, data: row })}
        onDelete={(id) => deleteMutation.mutate(id)}
        datasetName="invoices"
      />
    </div>
  );
}
