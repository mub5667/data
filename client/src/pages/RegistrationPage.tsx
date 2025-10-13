import { useQuery, useMutation } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function RegistrationPage() {
  const { toast } = useToast();
  const { data = [] } = useQuery<any[]>({ queryKey: ['/api/registration'] });

  const columns = [
    { key: 'no', label: 'No' },
    { key: 'name', label: 'Name' },
    { key: 'uni', label: 'University' },
    { key: 'passportNumber', label: 'Passport Number' },
    { key: 'nationality', label: 'Nationality' },
    { key: 'visa', label: 'Visa' },
    { key: 'valApproval', label: 'VAL Approval' },
    { key: 'counselor', label: 'Counselor' },
    { key: 'program', label: 'Program' },
    { key: 'submissionMonth', label: 'Submission Month' },
    { key: 'paidMonth', label: 'Paid Month' },
    { key: 'arrivalDate', label: 'Arrival Date' },
    { key: 'note', label: 'Note' },
  ];

  const addMutation = useMutation({
    mutationFn: (record: any) => apiRequest('/api/registration', 'POST', record),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/registration'] });
      toast({ title: "Registration added successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest(`/api/registration/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/registration'] });
      toast({ title: "Registration updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/registration/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/registration'] });
      toast({ title: "Registration deleted successfully" });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Registration Form 2025</h1>
        <p className="text-muted-foreground mt-2">Student registration and application tracking</p>
      </div>
      
      <DataTable
        title="Registration Records"
        data={data}
        columns={columns}
        onAdd={(row) => addMutation.mutate(row)}
        onEdit={(id, row) => updateMutation.mutate({ id, data: row })}
        onDelete={(id) => deleteMutation.mutate(id)}
        datasetName="registration"
      />
    </div>
  );
}
