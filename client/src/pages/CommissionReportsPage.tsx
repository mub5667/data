import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define the colors for the charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function CommissionReportsPage() {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [currency, setCurrency] = useState("All");

  // Fetch commission data
  const { data: commissions, isLoading, error } = useQuery({
    queryKey: ["commissions"],
    queryFn: async () => {
      const response = await fetch("/api/commission");
      if (!response.ok) {
        throw new Error("Failed to fetch commission data");
      }
      return response.json();
    },
  });

  // Process data for monthly commission
  const getMonthlyData = () => {
    if (!commissions) return [];

    // Filter by selected currency if needed
    const filteredData = currency === "All" 
      ? commissions 
      : commissions.filter((item: any) => item.currency === currency);

    // Group by month and sum commission amounts
    const monthlyData = filteredData.reduce((acc: any, curr: any) => {
      // Extract month and year from the month field
      const monthYear = curr.month || 'Unknown';
      
      // Filter by selected year
      if (!monthYear.includes(year)) return acc;
      
      if (!acc[monthYear]) {
        acc[monthYear] = {
          month: monthYear,
          commission: 0,
        };
      }
      
      acc[monthYear].commission += Number(curr.amount) || 0;
      
      return acc;
    }, {});
    
    return Object.values(monthlyData);
  };

  // Process data for university distribution
  const getUniversityData = () => {
    if (!commissions) return [];

    // Filter by selected currency if needed
    const filteredData = currency === "All" 
      ? commissions 
      : commissions.filter((item: any) => item.currency === currency);

    // Filter by selected year
    const yearFilteredData = filteredData.filter((item: any) => {
      const monthYear = item.month || '';
      return monthYear.includes(year);
    });

    // Group by university and sum amounts
    const universityData = yearFilteredData.reduce((acc: any, curr: any) => {
      const university = curr.university || 'Unknown';
      
      if (!acc[university]) {
        acc[university] = {
          name: university,
          value: 0
        };
      }
      
      acc[university].value += Number(curr.amount) || 0;
      
      return acc;
    }, {});
    
    return Object.values(universityData);
  };

  // Get available years from data
  const getAvailableYears = () => {
    if (!commissions) return [new Date().getFullYear().toString()];
    
    const years = new Set<string>();
    commissions.forEach((item: any) => {
      const monthYear = item.month || '';
      const yearMatch = monthYear.match(/\d{4}/);
      if (yearMatch) {
        years.add(yearMatch[0]);
      }
    });
    
    return Array.from(years).sort();
  };

  // Get available currencies from data
  const getAvailableCurrencies = () => {
    if (!commissions) return ["All"];
    
    const currencies = new Set<string>(["All"]);
    commissions.forEach((item: any) => {
      if (item.currency) {
        currencies.add(item.currency);
      }
    });
    
    return Array.from(currencies);
  };

  const monthlyData = getMonthlyData();
  const universityData = getUniversityData();
  const availableYears = getAvailableYears();
  const availableCurrencies = getAvailableCurrencies();

  // Calculate totals
  const totalCommission = monthlyData.reduce((sum, item: any) => sum + (item.commission || 0), 0);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load commission data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Commission Reports</h1>
        <div className="flex gap-4">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((y) => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Currency" />
            </SelectTrigger>
            <SelectContent>
              {availableCurrencies.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Commission Given</CardTitle>
            <CardDescription>Year {year}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCommission.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="monthly">
        <TabsList>
          <TabsTrigger value="monthly">Commission</TabsTrigger>
          <TabsTrigger value="university">University Distribution</TabsTrigger>
        </TabsList>
        <TabsContent value="monthly" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Commission Given ({year})</CardTitle>
              <CardDescription>Commission by month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" angle={-45} textAnchor="end" height={70} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="commission" name="Commission" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">No data available for selected filters</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="university" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>University Distribution ({year})</CardTitle>
              <CardDescription>Commission by university</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {universityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={universityData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {universityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => value.toLocaleString()} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">No data available for selected filters</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}