import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";

interface ServicesRecord {
  id: string;
  name: string;
  date: string;
  amount: number;
}

export default function ServicesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: services, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const response = await fetch("/api/services");
      if (!response.ok) throw new Error("Failed to fetch services");
      return response.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: async (newRecord: Omit<ServicesRecord, "id">) => {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecord),
      });
      if (!response.ok) throw new Error("Failed to create service");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast({ title: "Service created successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: ServicesRecord) => {
      const response = await fetch(`/api/services/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error("Failed to update service");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast({ title: "Service updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete service");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast({ title: "Service deleted successfully" });
    },
  });

  const handleAdd = (record: ServicesRecord) => {
    const { no, ...rest } = (record as any) || {};
    addMutation.mutate(rest as Omit<ServicesRecord, "id">);
  };

  const handleEdit = (id: string, record: ServicesRecord) => {
    const { no, ...rest } = (record as any) || {};
    updateMutation.mutate({ id, ...(rest as ServicesRecord) });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return <div className="p-6">Loading services...</div>;
  }

  const columns = [
    { key: "no", label: "No" },
    { key: "name", label: "Name", type: "text" as const },
    { key: "date", label: "Date", type: "date" as const },
    { key: "amount", label: "Amount", type: "number" as const },
  ];

  return (
    <div className="p-6">
      <DataTable
        title="Services"
        data={(services || []).map((item: any, index: number) => ({ ...item, no: index + 1 }))}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        datasetName="services"
      />
    </div>
  );
}