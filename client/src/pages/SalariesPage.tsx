import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";

interface SalariesRecord {
  id: string;
  name: string;
  amount: number;
  date: string;
}

export default function SalariesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: salaries, isLoading } = useQuery({
    queryKey: ["salaries"],
    queryFn: async () => {
      const response = await fetch("/api/salaries");
      if (!response.ok) throw new Error("Failed to fetch salaries");
      return response.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: async (newRecord: Omit<SalariesRecord, "id">) => {
      const response = await fetch("/api/salaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecord),
      });
      if (!response.ok) throw new Error("Failed to create salary");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salaries"] });
      toast({ title: "Salary created successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: SalariesRecord) => {
      const response = await fetch(`/api/salaries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error("Failed to update salary");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salaries"] });
      toast({ title: "Salary updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/salaries/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete salary");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salaries"] });
      toast({ title: "Salary deleted successfully" });
    },
  });

  const handleAdd = (record: any) => {
    const { no, ...rest } = (record as any) || {};
    addMutation.mutate(rest as Omit<SalariesRecord, "id">);
  };

  const handleEdit = (id: string, record: any) => {
    const { no, id: _ignored, ...rest } = (record as any) || {};
    updateMutation.mutate({ id, ...(rest as Omit<SalariesRecord, 'id'>) });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return <div className="p-6">Loading salaries...</div>;
  }

  const columns = [
    { key: "no", label: "No" },
    { key: "name", label: "Name", type: "text" as const },
    { key: "amount", label: "Amount", type: "number" as const },
    { key: "date", label: "Date", type: "date" as const },
  ];

  return (
    <div className="p-6">
      <DataTable
        title="Salaries"
        data={(salaries || []).map((item: any, index: number) => ({ ...item, no: index + 1 }))}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        datasetName="salaries"
      />
    </div>
  );
}
