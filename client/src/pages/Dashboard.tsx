import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, FileSpreadsheet, Receipt, DollarSign, FileText, Award, UserPlus, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Dashboard() {
  const { data: abeerData = [] } = useQuery<any[]>({ queryKey: ['/api/abeer'] });
  const { data: incomeOutcome = [] } = useQuery<any[]>({ queryKey: ['/api/incomeoutcome'] });
  const { data: dataRecords = [] } = useQuery<any[]>({ queryKey: ['/api/data-records'] });
  const { data: commissionData = [] } = useQuery<any[]>({ queryKey: ['/api/commission'] });
  const { data: invoiceData = [] } = useQuery<any[]>({ queryKey: ['/api/invoices'] });
  const { data: bonusData = [] } = useQuery<any[]>({ queryKey: ['/api/bonus'] });
  const { data: registrationData = [] } = useQuery<any[]>({ queryKey: ['/api/registration'] });

  const totalRecords = dataRecords.length + commissionData.length + invoiceData.length + bonusData.length + registrationData.length;
  
  // Aggregate totals across all countries from incomeOutcome
  const totalIncome = incomeOutcome.reduce((sum: number, row: any) => sum + (Number(row.income) || 0), 0);
  const totalOutcome = incomeOutcome.reduce((sum: number, row: any) => sum + (Number(row.outcome) || 0), 0);
  const netProfit = totalIncome - totalOutcome;

  // Build monthly aggregation from incomeOutcome (all countries)
  const monthlyMap = incomeOutcome.reduce((acc: Record<string, { income: number; outcome: number; label: string; ts: number }>, row: any) => {
    const d = row.date ? new Date(row.date) : null;
    // Fallback: if date missing or invalid, skip the row for monthly aggregation
    if (!d || isNaN(d.getTime())) return acc;
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
    const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const ts = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
    if (!acc[ym]) acc[ym] = { income: 0, outcome: 0, label, ts };
    acc[ym].income += Number(row.income) || 0;
    acc[ym].outcome += Number(row.outcome) || 0;
    return acc;
  }, {} as Record<string, { income: number; outcome: number; label: string; ts: number }>);

  const monthlyData = Object.values(monthlyMap)
    .sort((a, b) => a.ts - b.ts)
    .map(m => ({
      month: m.label,
      income: m.income,
      outcome: m.outcome,
      profit: m.income - m.outcome,
    }));

  // Process income/outcome data by country and month
  const countryFinancialData = incomeOutcome.reduce((acc: any, record: any) => {
    const country = record.country || 'Unknown';
    const date = record.date || '';
    const month = date ? new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown';
    
    if (!acc[country]) {
      acc[country] = {};
    }
    
    if (!acc[country][month]) {
      acc[country][month] = { income: 0, outcome: 0 };
    }
    
    acc[country][month].income += Number(record.income) || 0;
    acc[country][month].outcome += Number(record.outcome) || 0;
    
    return acc;
  }, {});

  // Create country summary data
  const countrySummary = Object.entries(countryFinancialData).map(([country, months]: [string, any]) => {
    const totalIncome = Object.values(months).reduce((sum: number, month: any) => sum + month.income, 0);
    const totalOutcome = Object.values(months).reduce((sum: number, month: any) => sum + month.outcome, 0);
    
    return {
      country,
      totalIncome,
      totalOutcome,
      profit: totalIncome - totalOutcome
    };
  }).sort((a, b) => b.totalIncome - a.totalIncome);

  // Create monthly breakdown by country for the chart
  const allMonths = new Set<string>();
  Object.values(countryFinancialData).forEach((months: any) => {
    Object.keys(months).forEach(month => allMonths.add(month));
  });
  
  const monthlyCountryData = Array.from(allMonths).sort().map(month => {
    const monthData: any = { month };
    
    Object.entries(countryFinancialData).forEach(([country, months]: [string, any]) => {
      if (months[month]) {
        monthData[`${country}_income`] = months[month].income;
        monthData[`${country}_outcome`] = months[month].outcome;
      } else {
        monthData[`${country}_income`] = 0;
        monthData[`${country}_outcome`] = 0;
      }
    });
    
    return monthData;
  });

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
      value: `RM ${Math.round(totalIncome).toLocaleString()}`, 
      icon: TrendingUp, 
      description: "Year to date" 
    },
    { 
      title: "Total Outcome", 
      value: `RM ${Math.round(totalOutcome).toLocaleString()}`, 
      icon: TrendingDown, 
      description: "Year to date" 
    },
    { 
      title: "Net Profit", 
      value: `RM ${Math.round(netProfit).toLocaleString()}`, 
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
            <CardTitle>Financial Overview by Month</CardTitle>
            <CardDescription>Income vs Outcome trends over time</CardDescription>
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
                  formatter={(value: any) => [`RM ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, '']}
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
            <CardTitle>Financial Performance by Country</CardTitle>
            <CardDescription>Total income and outcome by country</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={countrySummary}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="country" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }} 
                  formatter={(value: any) => [`RM ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, '']}
                />
                <Legend />
                <Bar dataKey="totalIncome" fill="#3b82f6" name="Total Income" />
                <Bar dataKey="totalOutcome" fill="#ef4444" name="Total Outcome" />
              </BarChart>
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
                formatter={(value: any) => [`RM ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, '']}
              />
              <Legend />
              <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Net Profit" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comprehensive Financial Overview</CardTitle>
          <CardDescription>Income and outcome breakdown by country and month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Country Performance Summary */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Country Performance Summary</h4>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {countrySummary.slice(0, 6).map((country, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h5 className="font-medium text-sm mb-2">{country.country}</h5>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Income:</span>
                        <span className="text-green-600 font-medium">
                          RM {country.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Outcome:</span>
                        <span className="text-red-600 font-medium">
                          RM {country.totalOutcome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-1">
                        <span className="text-muted-foreground">Profit:</span>
                        <span className={`font-medium ${country.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          RM {country.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Country Breakdown Chart */}
            {monthlyCountryData.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold mb-4">Monthly Financial Breakdown by Country</h4>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={monthlyCountryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }} 
                      formatter={(value: any, name: string) => [
                        `RM ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
                        name.replace('_', ' ').replace(/([A-Z])/g, ' $1').trim()
                      ]}
                    />
                    <Legend />
                    {Object.keys(countryFinancialData).slice(0, 5).map((country, index) => (
                      <Bar 
                        key={`${country}_income`} 
                        dataKey={`${country}_income`} 
                        fill={COLORS[index % COLORS.length]} 
                        name={`${country} Income`}
                        stackId="income"
                      />
                    ))}
                    {Object.keys(countryFinancialData).slice(0, 5).map((country, index) => (
                      <Bar 
                        key={`${country}_outcome`} 
                        dataKey={`${country}_outcome`} 
                        fill={COLORS[index % COLORS.length]} 
                        name={`${country} Outcome`}
                        stackId="outcome"
                        opacity={0.7}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      
    </div>
  );
}
