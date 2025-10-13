import { useQuery, useMutation } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function RegistrationValApprovedPage() {
  const { toast } = useToast();
  
  // Fetch data with proper error handling
  const { data = [], isLoading, error } = useQuery<any[]>({ 
    queryKey: ["/api/registration/val-approved"],
    queryFn: async () => {
      const response = await fetch('/api/registration/val-approved');
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
    // Only add percentage to numeric visa values
    visa: item.visa ? (
      // If it's already a string with %, keep it as is
      item.visa.toString().includes('%') ? item.visa : 
      // If it's a number, add percentage
      !isNaN(Number(item.visa)) ? (
        // If it's a decimal (like 0.85), convert to whole number percentage (85%)
        item.visa < 1 ? `${Math.round(Number(item.visa) * 100)}%` : `${item.visa}%`
      ) : 
      // If it's not a number, keep as is without adding %
      item.visa
    ) : ""
  }));

  const columns = [
    { key: "no", label: "No" },
    { key: "name", label: "Name" },
    { key: "uni", label: "University" },
    { key: "passportNumber", label: "Passport Number" },
    { key: "nationality", label: "Nationality" },
    { key: "visa", label: "Visa" },
    { key: "valApproval", label: "VAL Approval" },
    { key: "counselor", label: "Counselor" },
    { key: "program", label: "Program" },
    { key: "submissionMonth", label: "Submission Month" },
    { key: "paidMonth", label: "Paid Month" },
    { key: "arrivalDate", label: "Arrival Date" },
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
      const { no, ...recordWithoutNo } = record;
      return makeApiRequest('/api/registration/val-approved', 'POST', recordWithoutNo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/registration/val-approved"] });
      toast({ title: "Val Approved record added successfully" });
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
      const { no, ...dataWithoutNo } = data;
      return makeApiRequest(`/api/registration/val-approved/${id}`, 'PUT', dataWithoutNo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/registration/val-approved"] });
      toast({ title: "Val Approved record updated successfully" });
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
    mutationFn: (id: string) => makeApiRequest(`/api/registration/val-approved/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/registration/val-approved"] });
      toast({ title: "Val Approved record deleted successfully" });
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
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Registration - Val Approved</h1>
          <p className="text-muted-foreground mt-2">Students with validated approval status</p>
        </div>
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
          <h3 className="text-destructive font-semibold">Failed to load data</h3>
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
          Registration - Val Approved
        </h1>
        <p className="text-muted-foreground mt-2">Students with validated approval status</p>
      </div>

      <DataTable
        title="Val Approved Records"
        data={dataWithRowNumbers}
        columns={columns}
        onAdd={(row) => addMutation.mutate(row)}
        onEdit={(id, row) => updateMutation.mutate({ id, data: row })}
        onDelete={(id) => deleteMutation.mutate(id)}
        datasetName="registration-val-approved"
      />
    </div>
  );
}