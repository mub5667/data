import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";

interface MoneyTransferRecord {
  id: string;
  amount: number;
  date: string;
  ref: string;
}

export default function MoneyTransferPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: moneyTransfer, isLoading } = useQuery({
    queryKey: ["money-transfer"],
    queryFn: async () => {
      const response = await fetch("/api/money-transfer");
      if (!response.ok) throw new Error("Failed to fetch money transfer");
      return response.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: async (newRecord: Omit<MoneyTransferRecord, "id">) => {
      const response = await fetch("/api/money-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecord),
      });
      if (!response.ok) throw new Error("Failed to create money transfer");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["money-transfer"] });
      toast({ title: "Money transfer created successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: MoneyTransferRecord) => {
      const response = await fetch(`/api/money-transfer/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error("Failed to update money transfer");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["money-transfer"] });
      toast({ title: "Money transfer updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/money-transfer/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete money transfer");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["money-transfer"] });
      toast({ title: "Money transfer deleted successfully" });
    },
  });

  const handleAdd = (record: any) => {
    const { no, ...rest } = (record as any) || {};
    addMutation.mutate(rest as Omit<MoneyTransferRecord, "id">);
  };

  const handleEdit = (id: string, record: any) => {
    const { no, id: _ignored, ...rest } = (record as any) || {};
    updateMutation.mutate({ id, ...(rest as Omit<MoneyTransferRecord, 'id'>) });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return <div className="p-6">Loading money transfer...</div>;
  }

  const columns = [
    { key: "no", label: "No" },
    { key: "amount", label: "Amount", type: "number" as const },
    { key: "date", label: "Date", type: "date" as const },
    { key: "ref", label: "Reference", type: "text" as const },
  ];

  return (
    <div className="p-6">
      <DataTable
        title="Money Transfer"
        data={(moneyTransfer || []).map((item: any, index: number) => ({ ...item, no: index + 1 }))}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        datasetName="money-transfer"
      />
    </div>
  );
}