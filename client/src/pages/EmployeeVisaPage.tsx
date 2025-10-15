import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";

interface EmployeeVisaRecord {
  id: string;
  employeeName: string;
  amount: number;
  date: string;
  ref: string;
}

export default function EmployeeVisaPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: employeeVisa, isLoading } = useQuery({
    queryKey: ["employee-visa"],
    queryFn: async () => {
      const response = await fetch("/api/employee-visa");
      if (!response.ok) throw new Error("Failed to fetch employee visa");
      return response.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: async (newRecord: Omit<EmployeeVisaRecord, "id">) => {
      const response = await fetch("/api/employee-visa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecord),
      });
      if (!response.ok) throw new Error("Failed to create employee visa");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-visa"] });
      toast({ title: "Employee visa created successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: EmployeeVisaRecord) => {
      const response = await fetch(`/api/employee-visa/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error("Failed to update employee visa");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-visa"] });
      toast({ title: "Employee visa updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/employee-visa/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete employee visa");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-visa"] });
      toast({ title: "Employee visa deleted successfully" });
    },
  });

  const handleAdd = (record: any) => {
    const { no, ...rest } = (record as any) || {};
    addMutation.mutate(rest as Omit<EmployeeVisaRecord, "id">);
  };

  const handleEdit = (id: string, record: any) => {
    const { no, id: _ignored, ...rest } = (record as any) || {};
    updateMutation.mutate({ id, ...(rest as Omit<EmployeeVisaRecord, 'id'>) });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return <div className="p-6">Loading employee visa...</div>;
  }

  const columns = [
    { key: "no", label: "No" },
    { key: "employeeName", label: "Employee Name", type: "text" as const },
    { key: "amount", label: "Amount", type: "number" as const },
    { key: "date", label: "Date", type: "date" as const },
    { key: "ref", label: "Reference", type: "text" as const },
  ];

  return (
    <div className="p-6">
      <DataTable
        title="Employee Visa"
        data={(employeeVisa || []).map((item: any, index: number) => ({ ...item, no: index + 1 }))}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        datasetName="employee-visa"
      />
    </div>
  );
}