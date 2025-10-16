import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, PillTabsList as TabsList, PillTabsTrigger as TabsTrigger } from "@/components/ui/tailwind-tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "../lib/api";
import { useQueryClient } from "@tanstack/react-query";

export default function AddStudentPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("new");
  const [searchPassport, setSearchPassport] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [studentFound, setStudentFound] = useState<any>(null);
  
  // Form states for different categories
  const [newStudentForm, setNewStudentForm] = useState({
    passportNumber: "",
    name: "",
    nationality: "",
    uni: "",
    program: "",
    counselor: ""
  });

  const [valApprovalForm, setValApprovalForm] = useState({
    valApproval: undefined as Date | undefined,
    visa: "",
    submissionMonth: undefined as Date | undefined,
    paidMonth: undefined as Date | undefined,
    arrivalDate: undefined as Date | undefined
  });

  const [enrollmentForm, setEnrollmentForm] = useState({
    intake: undefined as Date | undefined,
    visa: "",
    submissionMonth: undefined as Date | undefined,
    paidMonth: undefined as Date | undefined
  });

  const [visaProcessForm, setVisaProcessForm] = useState({
    visa: "",
    submissionMonth: undefined as Date | undefined,
    paidMonth: undefined as Date | undefined,
    notes: ""
  });

  const [notSubmittedForm, setNotSubmittedForm] = useState({
    month: undefined as Date | undefined,
    payment: ""
  });

  const [cancelledForm, setCancelledForm] = useState({
    month: undefined as Date | undefined,
    payment: ""
  });

  const handleNewStudentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewStudentForm({
      ...newStudentForm,
      [e.target.name]: e.target.value
    });
  };

  const handleValApprovalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValApprovalForm({
      ...valApprovalForm,
      [e.target.name]: e.target.value
    });
  };

  const handleEnrollmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEnrollmentForm({
      ...enrollmentForm,
      [e.target.name]: e.target.value
    });
  };

  const handleVisaProcessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVisaProcessForm({
      ...visaProcessForm,
      [e.target.name]: e.target.value
    });
  };

  const handleNotSubmittedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNotSubmittedForm({
      ...notSubmittedForm,
      [e.target.name]: e.target.value
    });
  };

  const handleCancelledChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCancelledForm({
      ...cancelledForm,
      [e.target.name]: e.target.value
    });
  };

  const searchStudent = async () => {
    if (!searchPassport) {
      toast({ title: "Please enter a passport number", variant: "destructive" });
      return;
    }

    setIsSearching(true);
    try {
      const response = await apiRequest(`/api/students/search?passport=${searchPassport}`, "GET");
      if (response) {
        setStudentFound(response);
        toast({ title: "Student found" });
      } else {
        setStudentFound(null);
        toast({ title: "Student not found", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error searching student:", error);
      toast({ title: "Error searching student", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  // Check if student exists in main student database
  const checkPassportExists = async (passportNumber: string): Promise<boolean> => {
    try {
      const response = await apiRequest(`/api/students/check-passport?passportNumber=${passportNumber}`, "GET");
      return response.exists;
    } catch (error) {
      console.error("Error checking passport:", error);
      return false;
    }
  };

  // Check if student already exists in specific category
  const checkStudentInCategory = async (passportNumber: string, category: string): Promise<boolean> => {
    try {
      const response = await apiRequest(`/api/registration/check-student?passportNumber=${passportNumber}&category=${category}`, "GET");
      return response.exists;
    } catch (error) {
      console.error(`Error checking student in ${category}:`, error);
      return false;
    }
  };

  const addNewStudent = async () => {
    // Validate form
    if (!newStudentForm.passportNumber || !newStudentForm.name || !newStudentForm.nationality || 
        !newStudentForm.uni || !newStudentForm.program || !newStudentForm.counselor) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    // Check if passport already exists in main student database
    const passportExists = await checkPassportExists(newStudentForm.passportNumber);
    if (passportExists) {
      toast({ title: "Student already exists with this passport number", variant: "destructive" });
      return;
    }

    try {
      const response = await apiRequest("/api/students", "POST", newStudentForm);
      if (response) {
        toast({ title: "Student added successfully" });
        queryClient.invalidateQueries({ queryKey: ["/api/students"] });
        // Reset form
        setNewStudentForm({
          passportNumber: "",
          name: "",
          nationality: "",
          uni: "",
          program: "",
          counselor: ""
        });
      }
    } catch (error: any) {
      console.error("Error adding student:", error);
      if (error.message?.includes("already exists")) {
        toast({ title: "Student already exists with this passport number", variant: "destructive" });
      } else {
        toast({ title: "Error adding student", variant: "destructive" });
      }
    }
  };

  const addToValApproval = async () => {
    if (!studentFound) {
      toast({ title: "Please search for a student first", variant: "destructive" });
      return;
    }

    if (!valApprovalForm.valApproval || !valApprovalForm.submissionMonth || !valApprovalForm.paidMonth) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    // Check if student already exists in Val Approval category
    const studentExistsInCategory = await checkStudentInCategory(studentFound.passportNumber, "val-approved");
    if (studentExistsInCategory) {
      toast({ title: "Student already exists in Val Approval category", variant: "destructive" });
      return;
    }

    try {
      const record = {
        name: studentFound.name,
        uni: studentFound.uni,
        passportNumber: studentFound.passportNumber,
        nationality: studentFound.nationality,
        counselor: studentFound.counselor,
        program: studentFound.program,
        valApproval: format(valApprovalForm.valApproval, "yyyy-MM-dd"),
        visa: valApprovalForm.visa,
        submissionMonth: format(valApprovalForm.submissionMonth, "yyyy-MM-dd"),
        paidMonth: format(valApprovalForm.paidMonth, "yyyy-MM-dd"),
        arrivalDate: valApprovalForm.arrivalDate ? format(valApprovalForm.arrivalDate, "yyyy-MM-dd") : "",
        sheetType: "Val Approved"
      };

      const response = await apiRequest("/api/registration/val-approved", "POST", record);
      if (response) {
        toast({ title: "Student added to Val Approval successfully" });
        queryClient.invalidateQueries({ queryKey: ["/api/registration/val-approved"] });
        // Reset form
        setValApprovalForm({
          valApproval: undefined,
          visa: "",
          submissionMonth: undefined,
          paidMonth: undefined,
          arrivalDate: undefined
        });
        setStudentFound(null);
        setSearchPassport("");
      }
    } catch (error: any) {
      console.error("Error adding to Val Approval:", error);
      if (error.message?.includes("already exists")) {
        toast({ title: "Student already exists in Val Approval category", variant: "destructive" });
      } else {
        toast({ title: "Error adding to Val Approval", variant: "destructive" });
      }
    }
  };

  const addToEnrollment = async () => {
    if (!studentFound) {
      toast({ title: "Please search for a student first", variant: "destructive" });
      return;
    }

    if (!enrollmentForm.intake || !enrollmentForm.submissionMonth || !enrollmentForm.paidMonth) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    // Check if student already exists in Enrollment category
   

    try {
      const record = {
        name: studentFound.name,
        uni: studentFound.uni,
        passportNumber: studentFound.passportNumber,
        nationality: studentFound.nationality,
        counselor: studentFound.counselor,
        program: studentFound.program,
        intake: format(enrollmentForm.intake,"yyyy-MM-dd"),
        visa: enrollmentForm.visa,
        submissionMonth: format(enrollmentForm.submissionMonth, "yyyy-MM-dd"),
        paidMonth: format(enrollmentForm.paidMonth, "yyyy-MM-dd"),
        sheetType: "Enrollment"
      };

      const response = await apiRequest("/api/registration/enrollment", "POST", record);
      if (response) {
        toast({ title: "Student added to Enrollment successfully" });
        queryClient.invalidateQueries({ queryKey: ["/api/registration/enrollment"] });
        // Reset form
        setEnrollmentForm({
          intake: undefined,
          visa: "",
          submissionMonth: undefined,
          paidMonth: undefined
        });
        setStudentFound(null);
        setSearchPassport("");
      }
    } catch (error: any) {
      console.error("Error adding to Enrollment:", error);
      if (error.message?.includes("already exists")) {
        toast({ title: "Student already exists in Enrollment category", variant: "destructive" });
      } else {
        toast({ title: "Error adding to Enrollment", variant: "destructive" });
      }
    }
  };

  const addToVisaProcess = async () => {
    if (!studentFound) {
      toast({ title: "Please search for a student first", variant: "destructive" });
      return;
    }

    if (!visaProcessForm.submissionMonth || !visaProcessForm.paidMonth) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    // Check if student already exists in Visa Process category
    const studentExistsInCategory = await checkStudentInCategory(studentFound.passportNumber, "visa-process");
    if (studentExistsInCategory) {
      toast({ title: "Student already exists in Visa Process category", variant: "destructive" });
      return;
    }

    try {
      const record = {
        name: studentFound.name,
        uni: studentFound.uni,
        passportNumber: studentFound.passportNumber,
        nationality: studentFound.nationality,
        counselor: studentFound.counselor,
        program: studentFound.program,
        visa: visaProcessForm.visa,
        submissionMonth: format(visaProcessForm.submissionMonth, "yyyy-MM-dd"),
        paidMonth: format(visaProcessForm.paidMonth, "yyyy-MM-dd"),
        note: visaProcessForm.notes,
        sheetType: "Visa Process"
      };

      const response = await apiRequest("/api/registration/visa-process", "POST", record);
      if (response) {
        toast({ title: "Student added to Visa Process successfully" });
        queryClient.invalidateQueries({ queryKey: ["/api/registration/visa-process"] });
        // Reset form
        setVisaProcessForm({
          visa: "",
          submissionMonth: undefined,
          paidMonth: undefined,
          notes: ""
        });
        setStudentFound(null);
        setSearchPassport("");
      }
    } catch (error: any) {
      console.error("Error adding to Visa Process:", error);
      if (error.message?.includes("already exists")) {
        toast({ title: "Student already exists in Visa Process category", variant: "destructive" });
      } else {
        toast({ title: "Error adding to Visa Process", variant: "destructive" });
      }
    }
  };

  const addToNotSubmitted = async () => {
    if (!studentFound) {
      toast({ title: "Please search for a student first", variant: "destructive" });
      return;
    }

    if (!notSubmittedForm.month || !notSubmittedForm.payment) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    // Check if student already exists in Not Submitted category
    const studentExistsInCategory = await checkStudentInCategory(studentFound.passportNumber, "not-submitted");
    if (studentExistsInCategory) {
      toast({ title: "Student already exists in Not Submitted category", variant: "destructive" });
      return;
    }

    try {
      const record = {
        name: studentFound.name,
        uni: studentFound.uni,
        passportNumber: studentFound.passportNumber,
        nationality: studentFound.nationality,
        program: studentFound.program,
        counselor: studentFound.counselor,
        month: format(notSubmittedForm.month, "yyyy-MM-dd"),
        payment: notSubmittedForm.payment,
        sheetType: "Not Submitted"
      };

      const response = await apiRequest("/api/registration/not-submitted", "POST", record);
      if (response) {
        toast({ title: "Student added to Not Submitted successfully" });
        queryClient.invalidateQueries({ queryKey: ["/api/registration/not-submitted"] });
        // Reset form
        setNotSubmittedForm({
          month: undefined,
          payment: ""
        });
        setStudentFound(null);
        setSearchPassport("");
      }
    } catch (error: any) {
      console.error("Error adding to Not Submitted:", error);
      if (error.message?.includes("already exists")) {
        toast({ title: "Student already exists in Not Submitted category", variant: "destructive" });
      } else {
        toast({ title: "Error adding to Not Submitted", variant: "destructive" });
      }
    }
  };

  const addToCancelled = async () => {
    if (!studentFound) {
      toast({ title: "Please search for a student first", variant: "destructive" });
      return;
    }

    if (!cancelledForm.month || !cancelledForm.payment) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    // Check if student already exists in Cancelled category
    const studentExistsInCategory = await checkStudentInCategory(studentFound.passportNumber, "cancelled");
    if (studentExistsInCategory) {
      toast({ title: "Student already exists in Cancelled category", variant: "destructive" });
      return;
    }

    try {
      const record = {
        name: studentFound.name,
        uni: studentFound.uni,
        passportNumber: studentFound.passportNumber,
        nationality: studentFound.nationality,
        program: studentFound.program,
        counselor: studentFound.counselor,
        month: format(cancelledForm.month, "yyyy-MM-dd"),
        payment: cancelledForm.payment,
        sheetType: "Cancelled"
      };

      const response = await apiRequest("/api/registration/cancelled", "POST", record);
      if (response) {
        toast({ title: "Student added to Cancelled successfully" });
        queryClient.invalidateQueries({ queryKey: ["/api/registration/cancelled"] });
        // Reset form
        setCancelledForm({
          month: undefined,
          payment: ""
        });
        setStudentFound(null);
        setSearchPassport("");
      }
    } catch (error: any) {
      console.error("Error adding to Cancelled:", error);
      if (error.message?.includes("already exists")) {
        toast({ title: "Student already exists in Cancelled category", variant: "destructive" });
      } else {
        toast({ title: "Error adding to Cancelled", variant: "destructive" });
      }
    }
  };

  // Date Picker Component for reusability
  const DatePicker = ({ 
    date, 
    setDate, 
    className = "",
    placeholder = "Pick a date"
  }: {
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
    className?: string;
    placeholder?: string;
  }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      <div className="text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight" data-testid="text-page-title">Add Student</h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">Add new students or add existing students to different categories</p>
      </div>

      <Tabs defaultValue="new" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex w-full gap-5 mb-3 overflow-x-auto p-1 bg-card rounded-lg">
          <TabsTrigger value="new" className="text-xs md:text-sm px-2 py-2">New Student</TabsTrigger>
          <TabsTrigger value="val-approval" className="text-xs md:text-sm px-2 py-2">Val Approval</TabsTrigger>
          <TabsTrigger value="enrollment" className="text-xs md:text-sm px-2 py-2">Enrollment</TabsTrigger>
          <TabsTrigger value="visa-process" className="text-xs md:text-sm px-2 py-2">Visa Process</TabsTrigger>
          <TabsTrigger value="not-submitted" className="text-xs md:text-sm px-2 py-2">Not Submitted</TabsTrigger>
          <TabsTrigger value="cancelled" className="text-xs md:text-sm px-2 py-2">Cancelled</TabsTrigger>
        </TabsList>

        {/* Rest of your JSX remains the same */}
        {/* New Student Form */}
        <TabsContent value="new" className="mt-4 md:mt-6">
          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg md:text-xl">Add New Student</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passportNumber" className="text-sm">Passport Number *</Label>
                  <Input 
                    id="passportNumber" 
                    name="passportNumber" 
                    value={newStudentForm.passportNumber} 
                    onChange={handleNewStudentChange} 
                    placeholder="Enter passport number" 
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm">Name *</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={newStudentForm.name} 
                    onChange={handleNewStudentChange} 
                    placeholder="Enter name" 
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality" className="text-sm">Nationality *</Label>
                  <Input 
                    id="nationality" 
                    name="nationality" 
                    value={newStudentForm.nationality} 
                    onChange={handleNewStudentChange} 
                    placeholder="Enter nationality" 
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uni" className="text-sm">University *</Label>
                  <Input 
                    id="uni" 
                    name="uni" 
                    value={newStudentForm.uni} 
                    onChange={handleNewStudentChange} 
                    placeholder="Enter university" 
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="program" className="text-sm">Program *</Label>
                  <Input 
                    id="program" 
                    name="program" 
                    value={newStudentForm.program} 
                    onChange={handleNewStudentChange} 
                    placeholder="Enter program" 
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="counselor" className="text-sm">Counselor *</Label>
                  <Input 
                    id="counselor" 
                    name="counselor" 
                    value={newStudentForm.counselor} 
                    onChange={handleNewStudentChange} 
                    placeholder="Enter counselor" 
                    className="text-sm"
                  />
                </div>
              </div>
              <Button className="mt-4 w-full sm:w-auto text-sm md:text-base" onClick={addNewStudent}>
                Add Student
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Val Approval Form */}
        <TabsContent value="val-approval" className="mt-4 md:mt-6">
          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg md:text-xl">Add to Val Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <Input 
                    placeholder="Enter passport number" 
                    value={searchPassport} 
                    onChange={(e) => setSearchPassport(e.target.value)} 
                    className="flex-1 text-sm"
                  />
                  <Button onClick={searchStudent} disabled={isSearching} className="sm:w-auto text-sm">
                    {isSearching ? "Searching..." : "Search"}
                  </Button>
                </div>

                {studentFound && (
                  <div className="border p-3 md:p-4 rounded-md bg-slate-50">
                    <h3 className="font-semibold mb-2 text-sm md:text-base">Student Information</h3>
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-xs md:text-sm">
                      <div><span className="font-medium">Name:</span> {studentFound.name}</div>
                      <div><span className="font-medium">Passport:</span> {studentFound.passportNumber}</div>
                      <div><span className="font-medium">Nationality:</span> {studentFound.nationality}</div>
                      <div><span className="font-medium">University:</span> {studentFound.uni}</div>
                      <div><span className="font-medium">Program:</span> {studentFound.program}</div>
                      <div><span className="font-medium">Counselor:</span> {studentFound.counselor}</div>
                    </div>
                  </div>
                )}

                {studentFound && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="valApproval" className="text-sm">VAL Approval *</Label>
                      <DatePicker
                        date={valApprovalForm.valApproval}
                        setDate={(date) => setValApprovalForm({...valApprovalForm, valApproval: date})}
                        placeholder="Select VAL approval date"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="visa" className="text-sm">Visa *</Label>
                      <Input 
                        id="visa" 
                        name="visa" 
                        value={valApprovalForm.visa} 
                        onChange={handleValApprovalChange} 
                        placeholder="Enter Visa" 
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Submission Month *</Label>
                      <DatePicker
                        date={valApprovalForm.submissionMonth}
                        setDate={(date) => setValApprovalForm({...valApprovalForm, submissionMonth: date})}
                        placeholder="Select submission month"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Paid Month *</Label>
                      <DatePicker
                        date={valApprovalForm.paidMonth}
                        setDate={(date) => setValApprovalForm({...valApprovalForm, paidMonth: date})}
                        placeholder="Select paid month"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                      <Label className="text-sm">Arrival Date</Label>
                      <DatePicker
                        date={valApprovalForm.arrivalDate}
                        setDate={(date) => setValApprovalForm({...valApprovalForm, arrivalDate: date})}
                        placeholder="Select arrival date"
                      />
                    </div>
                  </div>
                )}

                {studentFound && (
                  <Button className="w-full sm:w-auto text-sm md:text-base" onClick={addToValApproval}>
                    Add to Val Approval
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enrollment Form */}
        <TabsContent value="enrollment" className="mt-4 md:mt-6">
          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg md:text-xl">Add to Enrollment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <Input 
                    placeholder="Enter passport number" 
                    value={searchPassport} 
                    onChange={(e) => setSearchPassport(e.target.value)} 
                    className="flex-1 text-sm"
                  />
                  <Button onClick={searchStudent} disabled={isSearching} className="sm:w-auto text-sm">
                    {isSearching ? "Searching..." : "Search"}
                  </Button>
                </div>

                {studentFound && (
                  <div className="border p-3 md:p-4 rounded-md bg-slate-50">
                    <h3 className="font-semibold mb-2 text-sm md:text-base">Student Information</h3>
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-xs md:text-sm">
                      <div><span className="font-medium">Name:</span> {studentFound.name}</div>
                      <div><span className="font-medium">Passport:</span> {studentFound.passportNumber}</div>
                      <div><span className="font-medium">Nationality:</span> {studentFound.nationality}</div>
                      <div><span className="font-medium">University:</span> {studentFound.uni}</div>
                      <div><span className="font-medium">Program:</span> {studentFound.program}</div>
                      <div><span className="font-medium">Counselor:</span> {studentFound.counselor}</div>
                    </div>
                  </div>
                )}

                {studentFound && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="intake" className="text-sm">Intake *</Label>
                   
                        <DatePicker
                        date={enrollmentForm.intake}
                        setDate={(date) => setEnrollmentForm({...enrollmentForm, intake: date})}
                        placeholder="Select submission month"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="visa" className="text-sm">Visa *</Label>
                      <Input 
                        id="visa" 
                        name="visa" 
                        value={enrollmentForm.visa} 
                        onChange={handleEnrollmentChange} 
                        placeholder="Enter visa"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Submission Month *</Label>
                      <DatePicker
                        date={enrollmentForm.submissionMonth}
                        setDate={(date) => setEnrollmentForm({...enrollmentForm, submissionMonth: date})}
                        placeholder="Select submission month"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Paid Month *</Label>
                      <DatePicker
                        date={enrollmentForm.paidMonth}
                        setDate={(date) => setEnrollmentForm({...enrollmentForm, paidMonth: date})}
                        placeholder="Select paid month"
                      />
                    </div>
                  </div>
                )}

                {studentFound && (
                  <Button className="w-full sm:w-auto text-sm md:text-base" onClick={addToEnrollment}>
                    Add to Enrollment
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visa Process Form */}
        <TabsContent value="visa-process" className="mt-4 md:mt-6">
          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg md:text-xl">Add to Visa Process</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <Input 
                    placeholder="Enter passport number" 
                    value={searchPassport} 
                    onChange={(e) => setSearchPassport(e.target.value)} 
                    className="flex-1 text-sm"
                  />
                  <Button onClick={searchStudent} disabled={isSearching} className="sm:w-auto text-sm">
                    {isSearching ? "Searching..." : "Search"}
                  </Button>
                </div>

                {studentFound && (
                  <div className="border p-3 md:p-4 rounded-md bg-slate-50">
                    <h3 className="font-semibold mb-2 text-sm md:text-base">Student Information</h3>
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-xs md:text-sm">
                      <div><span className="font-medium">Name:</span> {studentFound.name}</div>
                      <div><span className="font-medium">Passport:</span> {studentFound.passportNumber}</div>
                      <div><span className="font-medium">Nationality:</span> {studentFound.nationality}</div>
                      <div><span className="font-medium">University:</span> {studentFound.uni}</div>
                      <div><span className="font-medium">Program:</span> {studentFound.program}</div>
                      <div><span className="font-medium">Counselor:</span> {studentFound.counselor}</div>
                    </div>
                  </div>
                )}

                {studentFound && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="visa" className="text-sm">Visa *</Label>
                      <Input 
                        id="visa" 
                        name="visa" 
                        value={visaProcessForm.visa} 
                        onChange={handleVisaProcessChange} 
                        placeholder="Enter visa" 
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Submission Month *</Label>
                      <DatePicker
                        date={visaProcessForm.submissionMonth}
                        setDate={(date) => setVisaProcessForm({...visaProcessForm, submissionMonth: date})}
                        placeholder="Select submission month"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Paid Month *</Label>
                      <DatePicker
                        date={visaProcessForm.paidMonth}
                        setDate={(date) => setVisaProcessForm({...visaProcessForm, paidMonth: date})}
                        placeholder="Select paid month"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                      <Label htmlFor="notes" className="text-sm">Notes (Optional)</Label>
                      <Input 
                        id="notes" 
                        name="notes" 
                        value={visaProcessForm.notes} 
                        onChange={handleVisaProcessChange} 
                        placeholder="Enter notes" 
                        className="text-sm"
                      />
                    </div>
                  </div>
                )}

                {studentFound && (
                  <Button className="w-full sm:w-auto text-sm md:text-base" onClick={addToVisaProcess}>
                    Add to Visa Process
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Not Submitted Form */}
        <TabsContent value="not-submitted" className="mt-4 md:mt-6">
          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg md:text-xl">Add to Not Submitted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <Input 
                    placeholder="Enter passport number" 
                    value={searchPassport} 
                    onChange={(e) => setSearchPassport(e.target.value)} 
                    className="flex-1 text-sm"
                  />
                  <Button onClick={searchStudent} disabled={isSearching} className="sm:w-auto text-sm">
                    {isSearching ? "Searching..." : "Search"}
                  </Button>
                </div>

                {studentFound && (
                  <div className="border p-3 md:p-4 rounded-md bg-slate-50">
                    <h3 className="font-semibold mb-2 text-sm md:text-base">Student Information</h3>
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-xs md:text-sm">
                      <div><span className="font-medium">Name:</span> {studentFound.name}</div>
                      <div><span className="font-medium">Passport:</span> {studentFound.passportNumber}</div>
                      <div><span className="font-medium">University:</span> {studentFound.uni}</div>
                      <div><span className="font-medium">Program:</span> {studentFound.program}</div>
                      <div><span className="font-medium">Nationality:</span> {studentFound.nationality}</div>
                      <div><span className="font-medium">Counselor:</span> {studentFound.counselor}</div>
                    </div>
                  </div>
                )}

                {studentFound && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 max-w-md">
                    <div className="space-y-2">
                      <Label className="text-sm">Month *</Label>
                      <DatePicker
                        date={notSubmittedForm.month}
                        setDate={(date) => setNotSubmittedForm({...notSubmittedForm, month: date})}
                        placeholder="Select month"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payment" className="text-sm">Payment *</Label>
                      <Input 
                        id="payment" 
                        name="payment" 
                        value={notSubmittedForm.payment} 
                        onChange={handleNotSubmittedChange} 
                        placeholder="Enter payment" 
                        className="text-sm"
                      />
                    </div>
                  </div>
                )}

                {studentFound && (
                  <Button className="w-full sm:w-auto text-sm md:text-base" onClick={addToNotSubmitted}>
                    Add to Not Submitted
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cancelled Form */}
        <TabsContent value="cancelled" className="mt-4 md:mt-6">
          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg md:text-xl">Add to Cancelled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <Input 
                    placeholder="Enter passport number" 
                    value={searchPassport} 
                    onChange={(e) => setSearchPassport(e.target.value)} 
                    className="flex-1 text-sm"
                  />
                  <Button onClick={searchStudent} disabled={isSearching} className="sm:w-auto text-sm">
                    {isSearching ? "Searching..." : "Search"}
                  </Button>
                </div>

                {studentFound && (
                  <div className="border p-3 md:p-4 rounded-md bg-slate-50">
                    <h3 className="font-semibold mb-2 text-sm md:text-base">Student Information</h3>
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-xs md:text-sm">
                      <div><span className="font-medium">Name:</span> {studentFound.name}</div>
                      <div><span className="font-medium">University:</span> {studentFound.uni}</div>
                      <div><span className="font-medium">Program:</span> {studentFound.program}</div>
                      <div><span className="font-medium">Counselor:</span> {studentFound.counselor}</div>
                    </div>
                  </div>
                )}

                {studentFound && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 max-w-md">
                    <div className="space-y-2">
                      <Label className="text-sm">Month *</Label>
                      <DatePicker
                        date={cancelledForm.month}
                        setDate={(date) => setCancelledForm({...cancelledForm, month: date})}
                        placeholder="Select month"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payment" className="text-sm">Payment *</Label>
                      <Input 
                        id="payment" 
                        name="payment" 
                        value={cancelledForm.payment} 
                        onChange={handleCancelledChange} 
                        placeholder="Enter payment" 
                        className="text-sm"
                      />
                    </div>
                  </div>
                )}

                {studentFound && (
                  <Button className="w-full sm:w-auto text-sm md:text-base" onClick={addToCancelled}>
                    Add to Cancelled
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}