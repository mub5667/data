import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, FileSpreadsheet, Receipt, DollarSign, FileText, Award, UserPlus, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Dashboard() {
  const { data: abeerData = [] } = useQuery<any[]>({ queryKey: ['/api/abeer'] });
  const { data: dataRecords = [] } = useQuery<any[]>({ queryKey: ['/api/data-records'] });
  const { data: commissionData = [] } = useQuery<any[]>({ queryKey: ['/api/commission'] });
  const { data: invoiceData = [] } = useQuery<any[]>({ queryKey: ['/api/invoices'] });
  const { data: bonusData = [] } = useQuery<any[]>({ queryKey: ['/api/bonus'] });
  const { data: registrationData = [] } = useQuery<any[]>({ queryKey: ['/api/registration'] });

  const totalRecords = dataRecords.length + commissionData.length + invoiceData.length + bonusData.length + registrationData.length;
  
  const totalIncome = abeerData.reduce((sum: number, item: any) => sum + (item.totalIncome || 0), 0);
  const totalOutcome = abeerData.reduce((sum: number, item: any) => sum + (item.totalOutcome || 0), 0);
  const netProfit = totalIncome - totalOutcome;

  const monthlyData = abeerData.map((item: any) => ({
    month: item.month,
    income: item.totalIncome,
    outcome: item.totalOutcome,
    profit: item.totalIncome - item.totalOutcome
  }));

  const uniDistribution = dataRecords.reduce((acc: any, record: any) => {
    acc[record.uni] = (acc[record.uni] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(uniDistribution).slice(0, 6).map(([name, value]) => ({
    name,
    value
  }));

  const stats = [
    { 
      title: "Total Records", 
      value: totalRecords.toLocaleString(), 
      icon: Database, 
      description: "Across all datasets" 
    },
    { 
      title: "Total Income", 
      value: `RM ${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      icon: TrendingUp, 
      description: "Year to date" 
    },
    { 
      title: "Total Outcome", 
      value: `RM ${totalOutcome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      icon: TrendingDown, 
      description: "Year to date" 
    },
    { 
      title: "Net Profit", 
      value: `RM ${netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      icon: Activity, 
      description: netProfit >= 0 ? "Positive balance" : "Negative balance" 
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-dashboard-title">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2">
          Monitor and manage all your datasets from a single location
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
            <CardDescription>Income vs Outcome by Month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }} 
                />
                <Legend />
                <Bar dataKey="income" fill="#3b82f6" name="Income" />
                <Bar dataKey="outcome" fill="#ef4444" name="Outcome" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Distribution by University</CardTitle>
            <CardDescription>Top 6 universities</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profit Trend</CardTitle>
          <CardDescription>Monthly profit/loss analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }} 
              />
              <Legend />
              <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Net Profit" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Dataset Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { name: "ABEER 2025", count: abeerData.length, icon: Database },
              { name: "DATA 2025", count: dataRecords.length, icon: FileSpreadsheet },
              { name: "COMMISSION 24", count: commissionData.length, icon: DollarSign },
              { name: "INVOICES", count: invoiceData.length, icon: Receipt },
              { name: "BONUS 2024", count: bonusData.length, icon: Award },
              { name: "REGISTRATION 2025", count: registrationData.length, icon: UserPlus },
            ].map((dataset, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-md hover-elevate"
                data-testid={`dataset-summary-${index}`}
              >
                <div className="flex items-center gap-2">
                  <dataset.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{dataset.name}</span>
                </div>
                <span className="text-sm font-semibold">{dataset.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Top Universities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(uniDistribution)
              .sort(([,a]: any, [,b]: any) => b - a)
              .slice(0, 5)
              .map(([uni, count], index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-md hover-elevate"
                  data-testid={`top-uni-${index}`}
                >
                  <span className="text-sm">{uni}</span>
                  <span className="text-sm font-semibold">{count as number}</span>
                </div>
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Commission Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between p-2 rounded-md hover-elevate">
              <span className="text-sm">Total Commissions</span>
              <span className="text-sm font-semibold">{commissionData.length}</span>
            </div>
            <div className="flex justify-between p-2 rounded-md hover-elevate">
              <span className="text-sm">Total Bonuses</span>
              <span className="text-sm font-semibold">{bonusData.length}</span>
            </div>
            <div className="flex justify-between p-2 rounded-md hover-elevate">
              <span className="text-sm">Total Invoices</span>
              <span className="text-sm font-semibold">{invoiceData.length}</span>
            </div>
            <div className="flex justify-between p-2 rounded-md hover-elevate">
              <span className="text-sm">Registrations</span>
              <span className="text-sm font-semibold">{registrationData.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
