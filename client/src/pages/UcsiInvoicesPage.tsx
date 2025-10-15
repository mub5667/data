import { useQuery, useMutation } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function UcsiInvoicesPage() {
  const { toast } = useToast();
  const { data = [], isLoading, error } = useQuery<any[]>({ 
    queryKey: ['/api/ucsi-invoices'],
    queryFn: async () => {
      const res = await fetch('/api/ucsi-invoices');
      if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
      return res.json();
    }
  });

  const dataWithRowNumbers = data.map((item, index) => ({ ...item, no: index + 1 }));

  const columns = [
    { key: 'no', label: 'No.' },
    { key: 'uni', label: 'University' },
    { key: 'type', label: 'Type' },
    { key: 'date', label: 'Date' },
    { key: 'currency', label: 'Currency' },
    { key: 'amount', label: 'Amount' },
    { key: 'receivedDate', label: 'Received Date' },
  ];

  const addMutation = useMutation({
    mutationFn: (record: any) => {
      const { no, ...payload } = record;
      return apiRequest('/api/ucsi-invoices', 'POST', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ucsi-invoices'] });
      toast({ title: "UCSI invoice added successfully" });
    },
    onError: (err: any) => {
      toast({ title: "Error adding record", description: err?.message, variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => {
      const { no, ...payload } = data;
      return apiRequest(`/api/ucsi-invoices/${id}`, 'PUT', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ucsi-invoices'] });
      toast({ title: "UCSI invoice updated successfully" });
    },
    onError: (err: any) => {
      toast({ title: "Error updating record", description: err?.message, variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/ucsi-invoices/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ucsi-invoices'] });
      toast({ title: "UCSI invoice deleted successfully" });
    },
    onError: (err: any) => {
      toast({ title: "Error deleting record", description: err?.message, variant: "destructive" });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading UCSI Invoices...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">UCSI INVOICES</h1>
          <p className="text-muted-foreground mt-2">UCSI invoice records and payment status</p>
        </div>
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
          <h3 className="text-destructive font-semibold">Failed to load UCSI Invoices</h3>
          <p className="text-destructive/80 mt-1">Error: {(error as any)?.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">UCSI INVOICES</h1>
        <p className="text-muted-foreground mt-2">UCSI invoice records and payment status</p>
      </div>
      
      <DataTable
        title="UCSI Invoice Records"
        data={dataWithRowNumbers}
        columns={columns}
        onAdd={(row) => addMutation.mutate(row)}
        onEdit={(id, row) => updateMutation.mutate({ id, data: row })}
        onDelete={(id) => deleteMutation.mutate(id)}
        datasetName="ucsi-invoices"
      />
    </div>
  );
}