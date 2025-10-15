import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";

interface EventsRecord {
  id: string;
  no: number;
  date: string;
  uni: string;
  currency: string;
  income: number;
  expenses: number;
  country: string;
}

export default function EventsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const response = await fetch("/api/events");
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: async (newRecord: Omit<EventsRecord, "id">) => {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecord),
      });
      if (!response.ok) throw new Error("Failed to create event");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({ title: "Event created successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: EventsRecord) => {
      const response = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error("Failed to update event");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({ title: "Event updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/events/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete event");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({ title: "Event deleted successfully" });
    },
  });

  const handleAdd = (record: EventsRecord) => {
    addMutation.mutate(record);
  };

  const handleEdit = (id: string, record: EventsRecord) => {
    updateMutation.mutate({ id, ...record });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return <div className="p-6">Loading events...</div>;
  }

  const columns = [
    { key: "no", label: "No", type: "number" as const },
    { key: "date", label: "Date", type: "date" as const },
    { key: "uni", label: "University", type: "text" as const },
    { key: "currency", label: "Currency", type: "text" as const },
    { key: "income", label: "Income", type: "number" as const },
    { key: "expenses", label: "Expenses", type: "number" as const },
    { key: "country", label: "Country", type: "text" as const },
  ];

  return (
    <div className="p-6">
      <DataTable
        title="Events"
        data={events || []}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        datasetName="events"
      />
    </div>
  );
}
