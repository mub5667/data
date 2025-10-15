import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

interface StudentHotelRecord {
  id: string;
  name: string;
  date: string;
  amount: number;
}

interface StudentFlightTicketRecord {
  id: string;
  name: string;
  date: string;
  amount: number;
}

interface AuthenticationPapersRecord {
  id: string;
  amount: number;
  ref: string;
  date: string;
  ref1: string;
}

interface StudentVisaRecord {
  id: string;
  amount: number;
  date: string;
  ref: string;
  uni: string;
}

interface ApplicationFeesRecord {
  id: string;
  amount: number;
  date: string;
  ref: string;
  uni: string;
}

interface AirlineTicketsRecord {
  id: string;
  amount: number;
  date: string;
  ref: string;
}

export default function ProcedureReceivingStudentPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("student-hotel");

  // Student Hotel Data
  const { data: studentHotel, isLoading: isLoadingHotel } = useQuery({
    queryKey: ["student-hotel"],
    queryFn: async () => {
      const response = await fetch("/api/student-hotel");
      if (!response.ok) throw new Error("Failed to fetch student hotel");
      return response.json();
    },
  });

  // Student Flight Ticket Data
  const { data: studentFlightTicket, isLoading: isLoadingFlight } = useQuery({
    queryKey: ["student-flight-ticket"],
    queryFn: async () => {
      const response = await fetch("/api/student-flight-ticket");
      if (!response.ok) throw new Error("Failed to fetch student flight ticket");
      return response.json();
    },
  });

  // Authentication Papers Data
  const { data: authenticationPapers, isLoading: isLoadingAuth } = useQuery({
    queryKey: ["authentication-papers"],
    queryFn: async () => {
      const response = await fetch("/api/authentication-papers");
      if (!response.ok) throw new Error("Failed to fetch authentication papers");
      return response.json();
    },
  });

  // Student Visa Data
  const { data: studentVisa, isLoading: isLoadingVisa } = useQuery({
    queryKey: ["student-visa"],
    queryFn: async () => {
      const response = await fetch("/api/student-visa");
      if (!response.ok) throw new Error("Failed to fetch student visa");
      return response.json();
    },
  });

  // Application Fees Data
  const { data: applicationFees, isLoading: isLoadingFees } = useQuery({
    queryKey: ["application-fees"],
    queryFn: async () => {
      const response = await fetch("/api/application-fees");
      if (!response.ok) throw new Error("Failed to fetch application fees");
      return response.json();
    },
  });

  // Airline Tickets Data
  const { data: airlineTickets, isLoading: isLoadingTickets } = useQuery({
    queryKey: ["airline-tickets"],
    queryFn: async () => {
      const response = await fetch("/api/airline-tickets");
      if (!response.ok) throw new Error("Failed to fetch airline tickets");
      return response.json();
    },
  });

  // Generic mutation handlers
  const createMutation = useMutation({
    mutationFn: async ({ endpoint, data }: { endpoint: string; data: any }) => {
      const response = await fetch(`/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`Failed to create ${endpoint}`);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.endpoint] });
      toast({ title: "Record created successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ endpoint, id, data }: { endpoint: string; id: string; data: any }) => {
      const response = await fetch(`/api/${endpoint}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`Failed to update ${endpoint}`);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.endpoint] });
      toast({ title: "Record updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ endpoint, id }: { endpoint: string; id: string }) => {
      const response = await fetch(`/api/${endpoint}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`Failed to delete ${endpoint}`);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.endpoint] });
      toast({ title: "Record deleted successfully" });
    },
  });

  const getCurrentData = () => {
    switch (activeTab) {
      case "student-hotel": return studentHotel;
      case "student-flight-ticket": return studentFlightTicket;
      case "authentication-papers": return authenticationPapers;
      case "student-visa": return studentVisa;
      case "application-fees": return applicationFees;
      case "airline-tickets": return airlineTickets;
      default: return [];
    }
  };

  const getCurrentEndpoint = () => {
    switch (activeTab) {
      case "student-hotel": return "student-hotel";
      case "student-flight-ticket": return "student-flight-ticket";
      case "authentication-papers": return "authentication-papers";
      case "student-visa": return "student-visa";
      case "application-fees": return "application-fees";
      case "airline-tickets": return "airline-tickets";
      default: return "";
    }
  };

  const handleAdd = (record: any) => {
    const { no, ...rest } = record || {};
    createMutation.mutate({ endpoint: getCurrentEndpoint(), data: rest });
  };

  const handleEdit = (id: string, record: any) => {
    const { no, ...rest } = record || {};
    updateMutation.mutate({ endpoint: getCurrentEndpoint(), id, data: rest });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ endpoint: getCurrentEndpoint(), id });
  };

  const isLoading = isLoadingHotel || isLoadingFlight || isLoadingAuth || isLoadingVisa || isLoadingFees || isLoadingTickets;

  if (isLoading) {
    return <div className="p-6">Loading data...</div>;
  }

  const studentHotelColumns = [
    { key: "no", label: "No" },
    { key: "name", label: "Name", type: "text" as const },
    { key: "date", label: "Date", type: "date" as const },
    { key: "amount", label: "Amount", type: "number" as const },
  ];

  const studentFlightTicketColumns = [
    { key: "no", label: "No" },
    { key: "name", label: "Name", type: "text" as const },
    { key: "date", label: "Date", type: "date" as const },
    { key: "amount", label: "Amount", type: "number" as const },
  ];

  const authenticationPapersColumns = [
    { key: "no", label: "No" },
    { key: "amount", label: "Amount", type: "number" as const },
    { key: "ref", label: "Reference", type: "text" as const },
    { key: "date", label: "Date", type: "date" as const },
    { key: "ref1", label: "Reference 1", type: "text" as const },
  ];

  const studentVisaColumns = [
    { key: "no", label: "No" },
    { key: "amount", label: "Amount", type: "number" as const },
    { key: "date", label: "Date", type: "date" as const },
    { key: "ref", label: "Reference", type: "text" as const },
    { key: "uni", label: "University", type: "text" as const },
  ];

  const applicationFeesColumns = [
    { key: "no", label: "No" },
    { key: "amount", label: "Amount", type: "number" as const },
    { key: "date", label: "Date", type: "date" as const },
    { key: "ref", label: "Reference", type: "text" as const },
    { key: "uni", label: "University", type: "text" as const },
  ];

  const airlineTicketsColumns = [
    { key: "no", label: "No" },
    { key: "amount", label: "Amount", type: "number" as const },
    { key: "date", label: "Date", type: "date" as const },
    { key: "ref", label: "Reference", type: "text" as const },
  ];

  const getCurrentColumns = () => {
    switch (activeTab) {
      case "student-hotel": return studentHotelColumns;
      case "student-flight-ticket": return studentFlightTicketColumns;
      case "authentication-papers": return authenticationPapersColumns;
      case "student-visa": return studentVisaColumns;
      case "application-fees": return applicationFeesColumns;
      case "airline-tickets": return airlineTicketsColumns;
      default: return [];
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Procedure of Receiving Student</h1>
        <p className="text-muted-foreground">Manage student procedure data across different categories</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TooltipProvider>
          <TabsList className="flex w-full gap-2 overflow-x-auto p-1 bg-card rounded-lg">
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="student-hotel" className="whitespace-nowrap px-3 sm:px-4 hover:bg-primary/10 data-[state=active]:bg-primary/20 data-[state=active]:text-foreground rounded-md transition-colors">Hotel</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>Hotel</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="student-flight-ticket" className="whitespace-nowrap px-3 sm:px-4 hover:bg-primary/10 data-[state=active]:bg-primary/20 data-[state=active]:text-foreground rounded-md transition-colors">Flight Ticket</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>Flight Ticket</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="authentication-papers" className="whitespace-nowrap px-3 sm:px-4 hover:bg-primary/10 data-[state=active]:bg-primary/20 data-[state=active]:text-foreground rounded-md transition-colors">Papers Authentication</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>Papers Authentication</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="student-visa" className="whitespace-nowrap px-3 sm:px-4 hover:bg-primary/10 data-[state=active]:bg-primary/20 data-[state=active]:text-foreground rounded-md transition-colors">Visa</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>Visa</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="application-fees" className="whitespace-nowrap px-3 sm:px-4 hover:bg-primary/10 data-[state=active]:bg-primary/20 data-[state=active]:text-foreground rounded-md transition-colors">Application Fees</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>Application Fees</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="airline-tickets" className="whitespace-nowrap px-3 sm:px-4 hover:bg-primary/10 data-[state=active]:bg-primary/20 data-[state=active]:text-foreground rounded-md transition-colors">Airline Tickets</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>Airline Tickets</TooltipContent>
            </Tooltip>
          </TabsList>
        </TooltipProvider>

        <TabsContent value="student-hotel">
          <DataTable
            title="Student Hotel"
            data={(studentHotel || []).map((item: any, index: number) => ({ ...item, no: index + 1 }))}
            columns={studentHotelColumns}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            datasetName="student-hotel"
          />
        </TabsContent>

        <TabsContent value="student-flight-ticket">
          <DataTable
            title="Student Flight Ticket"
            data={(studentFlightTicket || []).map((item: any, index: number) => ({ ...item, no: index + 1 }))}
            columns={studentFlightTicketColumns}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            datasetName="student-flight-ticket"
          />
        </TabsContent>

        <TabsContent value="authentication-papers">
          <DataTable
            title="Authentication of Papers"
            data={(authenticationPapers || []).map((item: any, index: number) => ({ ...item, no: index + 1 }))}
            columns={authenticationPapersColumns}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            datasetName="authentication-papers"
          />
        </TabsContent>

        <TabsContent value="student-visa">
          <DataTable
            title="Student Visa"
            data={(studentVisa || []).map((item: any, index: number) => ({ ...item, no: index + 1 }))}
            columns={studentVisaColumns}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            datasetName="student-visa"
          />
        </TabsContent>

        <TabsContent value="application-fees">
          <DataTable
            title="Application Fees"
            data={(applicationFees || []).map((item: any, index: number) => ({ ...item, no: index + 1 }))}
            columns={applicationFeesColumns}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            datasetName="application-fees"
          />
        </TabsContent>

        <TabsContent value="airline-tickets">
          <DataTable
            title="Airline Tickets"
            data={(airlineTickets || []).map((item: any, index: number) => ({ ...item, no: index + 1 }))}
            columns={airlineTicketsColumns}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            datasetName="airline-tickets"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}