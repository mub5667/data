import { useQuery, useMutation } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function SubagentPage() {
  const { toast } = useToast();
  const { data = [] } = useQuery<any[]>({ queryKey: ['/api/subagent'] });

  const columns = [
    { key: 'no', label: 'No' },
    { key: 'subagentName', label: 'Subagent name' },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'ref', label: 'REF' },
    { key: 'referralCommissionOn', label: 'Referral commission on' },
    { key: 'amount', label: 'Amount', type: 'number' },
    { key: 'month', label: 'Month' },
  ];

  const addMutation = useMutation({
    mutationFn: (record: any) => apiRequest('/api/subagent', 'POST', record),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subagent'] });
      toast({ title: "Subagent record added" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest(`/api/subagent/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subagent'] });
      toast({ title: "Subagent record updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/subagent/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subagent'] });
      toast({ title: "Subagent record deleted" });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subagent</h1>
        <p className="text-muted-foreground mt-2">Subagent referral commissions</p>
      </div>
      <DataTable
        title="Subagent Records"
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
        datasetName="subagent"
      />
    </div>
  );
}


