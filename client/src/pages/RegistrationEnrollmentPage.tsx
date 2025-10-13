import { useQuery, useMutation } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function RegistrationEnrollmentPage() {
  const { toast } = useToast();
  
  // Fetch data with proper error handling
  const { data = [], isLoading, error } = useQuery<any[]>({ 
    queryKey: ["/api/registration/enrollment"],
    queryFn: async () => {
      const response = await fetch('/api/registration/enrollment');
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

  // Transform data to ensure intake is displayed
  const dataWithTransformedFields = dataWithRowNumbers.map(item => ({
    ...item,
    // Ensure intake is properly displayed by converting null/undefined to empty string
    intake: item.intake || "",
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
    { key: "counselor", label: "Counselor" },
    { key: "program", label: "Program" },
    { key: "intake", label: "Intake" },
    { key: "submissionMonth", label: "Submission Month" },
    { key: "paidMonth", label: "Paid Month" },
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
      return makeApiRequest("/api/registration/enrollment", "POST", recordWithoutNo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/registration/enrollment"] });
      toast({ title: "Enrollment record added successfully" });
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
      return makeApiRequest(`/api/registration/enrollment/${id}`, "PUT", dataWithoutNo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/registration/enrollment"] });
      toast({ title: "Enrollment record updated successfully" });
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
    mutationFn: (id: string) => makeApiRequest(`/api/registration/enrollment/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/registration/enrollment"] });
      toast({ title: "Enrollment record deleted successfully" });
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
        <div className="text-lg">Loading enrollment data...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Registration - Enrollment</h1>
          <p className="text-muted-foreground mt-2">Students in the enrollment process</p>
        </div>
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
          <h3 className="text-destructive font-semibold">Failed to load enrollment data</h3>
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
          Registration - Enrollment
        </h1>
        <p className="text-muted-foreground mt-2">Students in the enrollment process</p>
      </div>

      <DataTable
        title="Enrollment Records"
        data={dataWithTransformedFields}
        columns={columns}
        onAdd={(row) => addMutation.mutate(row)}
        onEdit={(id, row) => updateMutation.mutate({ id, data: row })}
        onDelete={(id) => deleteMutation.mutate(id)}
        datasetName="registration-enrollment"
      />
    </div>
  );
}