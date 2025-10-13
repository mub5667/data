import { useQuery, useMutation } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function BonusNotClaimedPage() {
  const { toast } = useToast();
  
  // Fetch data with proper error handling
  const { data = [], isLoading, error } = useQuery<any[]>({ 
    queryKey: ["/api/bonus/not-claimed"],
    queryFn: async () => {
      const response = await fetch('/api/bonus/not-claimed');
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      return response.json();
    }
  });

  // Add sequential row numbers to the data
  const dataWithRowNumbers = data.map((item, index) => ({
    ...item,
    no: index + 1,
  }));

  const columns = [
    { key: "no", label: "No" },
    { key: "name", label: "Name" },
    { key: "passportNumber", label: "Passport Number" },
    { key: "visa", label: "Visa" },
    { key: "intake", label: "Intake" },
    { key: "tuitionFeesPayment", label: "Tuition Fees Payment" },
    { key: "enrollment", label: "Enrollment" },
    { key: "commission", label: "Commission" },
    { key: "rm", label: "RM" },
    { key: "usd", label: "USD" },
  ];

  // Helper function for API requests
  const makeApiRequest = async (url: string, method: string, data?: any) => {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  const addMutation = useMutation({
    mutationFn: (record: any) => {
      // Remove the 'no' field before sending to API since it's frontend-only
      const { no, ...recordWithoutNo } = record;
      return makeApiRequest("/api/bonus/not-claimed", "POST", recordWithoutNo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bonus/not-claimed"] });
      toast({ title: "Not claimed bonus record added successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error adding record", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => {
      // Remove the 'no' field before sending to API since it's frontend-only
      const { no, ...dataWithoutNo } = data;
      return makeApiRequest(`/api/bonus/not-claimed/${id}`, "PUT", dataWithoutNo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bonus/not-claimed"] });
      toast({ title: "Not claimed bonus record updated successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error updating record", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => makeApiRequest(`/api/bonus/not-claimed/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bonus/not-claimed"] });
      toast({ title: "Not claimed bonus record deleted successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error deleting record", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading not claimed bonus data...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bonus - Not Claimed</h1>
          <p className="text-muted-foreground mt-2">Not claimed bonus records</p>
        </div>
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
          <h3 className="text-destructive font-semibold">Failed to load not claimed bonus data</h3>
          <p className="text-destructive/80 mt-1">Error: {error.message}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Please check if the backend server is running and the API endpoint is correct.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
          Bonus - Not Claimed
        </h1>
        <p className="text-muted-foreground mt-2">Not claimed bonus records</p>
      </div>

      <DataTable
        title="Not Claimed Bonus Records"
        data={dataWithRowNumbers}
        columns={columns}
        onAdd={(row) => addMutation.mutate(row)}
        onEdit={(id, row) => updateMutation.mutate({ id, data: row })}
        onDelete={(id) => deleteMutation.mutate(id)}
        datasetName="bonus-not-claimed"
      />
    </div>
  );
}