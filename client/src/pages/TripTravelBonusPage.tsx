import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";

interface TripTravelBonusRecord {
  id: string;
  name: string;
  amount: number;
  date: string;
}

export default function TripTravelBonusPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tripTravelBonus, isLoading } = useQuery({
    queryKey: ["trip-travel-bonus"],
    queryFn: async () => {
      const response = await fetch("/api/trip-travel-bonus");
      if (!response.ok) throw new Error("Failed to fetch trip travel bonus");
      return response.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: async (newRecord: Omit<TripTravelBonusRecord, "id"> & { no?: number }) => {
      const { no, ...payload } = newRecord as any;
      const response = await fetch("/api/trip-travel-bonus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to create trip travel bonus");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip-travel-bonus"] });
      toast({ title: "Trip travel bonus created successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: TripTravelBonusRecord & { no?: number }) => {
      const { no, ...payload } = updateData as any;
      const response = await fetch(`/api/trip-travel-bonus/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to update trip travel bonus");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip-travel-bonus"] });
      toast({ title: "Trip travel bonus updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/trip-travel-bonus/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete trip travel bonus");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip-travel-bonus"] });
      toast({ title: "Trip travel bonus deleted successfully" });
    },
  });

  const handleAdd = (record: TripTravelBonusRecord) => {
    addMutation.mutate(record);
  };

  const handleEdit = (id: string, record: TripTravelBonusRecord) => {
    updateMutation.mutate({ id, ...record });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return <div className="p-6">Loading trip travel bonus...</div>;
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
        title="Trip/Travel/Bonus"
        data={(tripTravelBonus || []).map((item: any, index: number) => ({ ...item, no: index + 1 }))}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        datasetName="trip-travel-bonus"
      />
    </div>
  );
}