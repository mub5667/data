import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Search } from "lucide-react";

export default function BonusAddPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("claimed");
  const [searchPassport, setSearchPassport] = useState("");
  const [studentData, setStudentData] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // Form fields for claimed
  const [claimedFormData, setClaimedFormData] = useState({
    name: "",
    passportNumber: "",
    visa: "",
    intake: "",
    tuitionFeesPayment: "",
    enrollment: "",
    commission: "",
    rm: "",
    usd: "",
    claimedDate: new Date().toISOString().split('T')[0], // Default to today's date
    claimedBy: "",
  });
  
  // Form fields for not claimed
  const [notClaimedFormData, setNotClaimedFormData] = useState({
    name: "",
    passportNumber: "",
    visa: "",
    intake: "",
    tuitionFeesPayment: "",
    enrollment: "",
    commission: "",
    rm: "",
    usd: "",
  });

  // Search student by passport number
  const searchStudent = async () => {
    if (!searchPassport.trim()) {
      toast({
        title: "Error",
        description: "Please enter a passport number",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/students/search?passportNumber=${searchPassport}`);
      if (!response.ok) {
        throw new Error("Failed to find student");
      }
      
      const data = await response.json();
      if (data) {
        setStudentData(data);
        
        // Update form data based on active tab
        if (activeTab === "claimed") {
          setClaimedFormData({
            ...claimedFormData,
            name: data.name || "",
            passportNumber: data.passportNumber || "",
          });
        } else {
          setNotClaimedFormData({
            ...notClaimedFormData,
            name: data.name || "",
            passportNumber: data.passportNumber || "",
          });
        }
        
        toast({
          title: "Student found",
          description: `Found student: ${data.name}`,
        });
      } else {
        toast({
          title: "Student not found",
          description: "No student found with this passport number",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to search student",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Add claimed bonus mutation
  const addClaimedMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/bonus/claimed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to add claimed bonus");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bonus/claimed"] });
      toast({
        title: "Success",
        description: "Claimed bonus added successfully",
      });
      resetClaimedForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add claimed bonus",
        variant: "destructive",
      });
    },
  });

  // Add not claimed bonus mutation
  const addNotClaimedMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/bonus/not-claimed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to add not claimed bonus");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bonus/not-claimed"] });
      toast({
        title: "Success",
        description: "Not claimed bonus added successfully",
      });
      resetNotClaimedForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add not claimed bonus",
        variant: "destructive",
      });
    },
  });

  // Handle claimed form submission
  const handleClaimedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!claimedFormData.name || !claimedFormData.passportNumber) {
      toast({
        title: "Error",
        description: "Name and passport number are required",
        variant: "destructive",
      });
      return;
    }
    
    addClaimedMutation.mutate(claimedFormData);
  };

  // Handle not claimed form submission
  const handleNotClaimedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!notClaimedFormData.name || !notClaimedFormData.passportNumber) {
      toast({
        title: "Error",
        description: "Name and passport number are required",
        variant: "destructive",
      });
      return;
    }
    
    addNotClaimedMutation.mutate(notClaimedFormData);
  };

  // Reset claimed form
  const resetClaimedForm = () => {
    setClaimedFormData({
      name: "",
      passportNumber: "",
      visa: "",
      intake: "",
      tuitionFeesPayment: "",
      enrollment: "",
      commission: "",
      rm: "",
      usd: "",
      claimedDate: new Date().toISOString().split('T')[0], // Default to today's date
      claimedBy: "",
    });
    setStudentData(null);
    setSearchPassport("");
  };

  // Reset not claimed form
  const resetNotClaimedForm = () => {
    setNotClaimedFormData({
      name: "",
      passportNumber: "",
      visa: "",
      intake: "",
      tuitionFeesPayment: "",
      enrollment: "",
      commission: "",
      rm: "",
      usd: "",
    });
    setStudentData(null);
    setSearchPassport("");
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setStudentData(null);
    setSearchPassport("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
          Add Bonus
        </h1>
        <p className="text-muted-foreground mt-2">Add new bonus records</p>
      </div>

      <Tabs defaultValue="claimed" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="claimed">Claimed</TabsTrigger>
          <TabsTrigger value="not-claimed">Not Claimed</TabsTrigger>
        </TabsList>
        
        {/* Claimed Tab Content */}
        <TabsContent value="claimed">
          <Card>
            <CardHeader>
              <CardTitle>Add Claimed Bonus</CardTitle>
              <CardDescription>
                Search for a student by passport number and add claimed bonus details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Search Section */}
                <div className="flex items-end gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="searchPassport">Search by Passport Number</Label>
                    <Input
                      id="searchPassport"
                      placeholder="Enter passport number"
                      value={searchPassport}
                      onChange={(e) => setSearchPassport(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={searchStudent} 
                    disabled={isSearching}
                    className="mb-0.5"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {isSearching ? "Searching..." : "Search"}
                  </Button>
                </div>

                {/* Form */}
                <form onSubmit={handleClaimedSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="Student name"
                        value={claimedFormData.name}
                        onChange={(e) => setClaimedFormData({...claimedFormData, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passportNumber">Passport Number</Label>
                      <Input
                        id="passportNumber"
                        placeholder="Passport number"
                        value={claimedFormData.passportNumber}
                        onChange={(e) => setClaimedFormData({...claimedFormData, passportNumber: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="visa">Visa</Label>
                      <Input
                        id="visa"
                        placeholder="Visa"
                        value={claimedFormData.visa}
                        onChange={(e) => setClaimedFormData({...claimedFormData, visa: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="intake">Intake</Label>
                      <Input
                        id="intake"
                        placeholder="Intake"
                        value={claimedFormData.intake}
                        onChange={(e) => setClaimedFormData({...claimedFormData, intake: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tuitionFeesPayment">Tuition Fees Payment</Label>
                      <Input
                        id="tuitionFeesPayment"
                        placeholder="Tuition fees payment"
                        value={claimedFormData.tuitionFeesPayment}
                        onChange={(e) => setClaimedFormData({...claimedFormData, tuitionFeesPayment: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="enrollment">Enrollment</Label>
                      <Input
                        id="enrollment"
                        placeholder="Enrollment"
                        value={claimedFormData.enrollment}
                        onChange={(e) => setClaimedFormData({...claimedFormData, enrollment: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="commission">Commission</Label>
                      <Input
                        id="commission"
                        placeholder="Commission"
                        value={claimedFormData.commission}
                        onChange={(e) => setClaimedFormData({...claimedFormData, commission: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rm">RM</Label>
                      <Input
                        id="rm"
                        placeholder="RM"
                        value={claimedFormData.rm}
                        onChange={(e) => setClaimedFormData({...claimedFormData, rm: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="usd">USD</Label>
                      <Input
                        id="usd"
                        placeholder="USD"
                        value={claimedFormData.usd}
                        onChange={(e) => setClaimedFormData({...claimedFormData, usd: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="claimedDate">Claimed Date</Label>
                      <Input
                        id="claimedDate"
                        type="date"
                        value={claimedFormData.claimedDate}
                        onChange={(e) => setClaimedFormData({...claimedFormData, claimedDate: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="claimedBy">Claimed By</Label>
                      <Input
                        id="claimedBy"
                        placeholder="Claimed By"
                        value={claimedFormData.claimedBy}
                        onChange={(e) => setClaimedFormData({...claimedFormData, claimedBy: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={resetClaimedForm}>
                      Reset
                    </Button>
                    <Button type="submit" disabled={addClaimedMutation.isPending}>
                      {addClaimedMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Not Claimed Tab Content */}
        <TabsContent value="not-claimed">
          <Card>
            <CardHeader>
              <CardTitle>Add Not Claimed Bonus</CardTitle>
              <CardDescription>
                Search for a student by passport number and add not claimed bonus details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Search Section */}
                <div className="flex items-end gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="searchPassportNotClaimed">Search by Passport Number</Label>
                    <Input
                      id="searchPassportNotClaimed"
                      placeholder="Enter passport number"
                      value={searchPassport}
                      onChange={(e) => setSearchPassport(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={searchStudent} 
                    disabled={isSearching}
                    className="mb-0.5"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {isSearching ? "Searching..." : "Search"}
                  </Button>
                </div>

                {/* Form */}
                <form onSubmit={handleNotClaimedSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nameNotClaimed">Name</Label>
                      <Input
                        id="nameNotClaimed"
                        placeholder="Student name"
                        value={notClaimedFormData.name}
                        onChange={(e) => setNotClaimedFormData({...notClaimedFormData, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passportNumberNotClaimed">Passport Number</Label>
                      <Input
                        id="passportNumberNotClaimed"
                        placeholder="Passport number"
                        value={notClaimedFormData.passportNumber}
                        onChange={(e) => setNotClaimedFormData({...notClaimedFormData, passportNumber: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="visaNotClaimed">Visa</Label>
                      <Input
                        id="visaNotClaimed"
                        placeholder="Visa"
                        value={notClaimedFormData.visa}
                        onChange={(e) => setNotClaimedFormData({...notClaimedFormData, visa: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="intakeNotClaimed">Intake</Label>
                      <Input
                        id="intakeNotClaimed"
                        placeholder="Intake"
                        value={notClaimedFormData.intake}
                        onChange={(e) => setNotClaimedFormData({...notClaimedFormData, intake: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tuitionFeesPaymentNotClaimed">Tuition Fees Payment</Label>
                      <Input
                        id="tuitionFeesPaymentNotClaimed"
                        placeholder="Tuition fees payment"
                        value={notClaimedFormData.tuitionFeesPayment}
                        onChange={(e) => setNotClaimedFormData({...notClaimedFormData, tuitionFeesPayment: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="enrollmentNotClaimed">Enrollment</Label>
                      <Input
                        id="enrollmentNotClaimed"
                        placeholder="Enrollment"
                        value={notClaimedFormData.enrollment}
                        onChange={(e) => setNotClaimedFormData({...notClaimedFormData, enrollment: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="commissionNotClaimed">Commission</Label>
                      <Input
                        id="commissionNotClaimed"
                        placeholder="Commission"
                        value={notClaimedFormData.commission}
                        onChange={(e) => setNotClaimedFormData({...notClaimedFormData, commission: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rmNotClaimed">RM</Label>
                      <Input
                        id="rmNotClaimed"
                        placeholder="RM"
                        value={notClaimedFormData.rm}
                        onChange={(e) => setNotClaimedFormData({...notClaimedFormData, rm: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="usdNotClaimed">USD</Label>
                      <Input
                        id="usdNotClaimed"
                        placeholder="USD"
                        value={notClaimedFormData.usd}
                        onChange={(e) => setNotClaimedFormData({...notClaimedFormData, usd: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={resetNotClaimedForm}>
                      Reset
                    </Button>
                    <Button type="submit" disabled={addNotClaimedMutation.isPending}>
                      {addNotClaimedMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}