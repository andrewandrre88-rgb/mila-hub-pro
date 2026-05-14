import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/analytics")({ component: () => <DashboardLayout><Analytics/></DashboardLayout> });

const sales = [
  { m:"Jan", v: 0 }, { m:"Feb", v: 0 }, { m:"Mar", v: 0 }, { m:"Apr", v: 0 },
  { m:"May", v: 0 }, { m:"Jun", v: 0 }, { m:"Jul", v: 0 }, { m:"Aug", v: 0 },
  { m:"Sep", v: 0 }, { m:"Oct", v: 0 }, { m:"Nov", v: 0 }, { m:"Dec", v: 0 },
];
const products: { p: string; v: number }[] = [];
const countries: { c: string; v: number }[] = [];

function Analytics() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold">Analytics</h1><p className="text-sm text-muted-foreground">Performance, products and export markets</p></div>

      <Card className="p-6 shadow-card">
        <h3 className="font-semibold">Revenue trend</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={sales}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 252)" vertical={false}/>
            <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: "oklch(0.5 0.02 252)", fontSize: 12 }}/>
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "oklch(0.5 0.02 252)", fontSize: 12 }} tickFormatter={(v)=>`$${v/1000}k`}/>
            <Tooltip contentStyle={{ borderRadius: 8 }}/>
            <Line type="monotone" dataKey="v" stroke="oklch(0.52 0.19 260)" strokeWidth={3} dot={{ r: 4, fill: "oklch(0.52 0.19 260)" }}/>
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6 shadow-card">
          <h3 className="font-semibold">Best-selling products</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={products} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 252)" horizontal={false}/>
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(v)=>`$${v/1000}k`}/>
              <YAxis dataKey="p" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} width={140}/>
              <Tooltip/>
              <Bar dataKey="v" fill="oklch(0.52 0.19 260)" radius={[0,6,6,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 shadow-card">
          <h3 className="font-semibold">Top export countries</h3>
          <div className="mt-4 space-y-3">
            {countries.map((c)=>(
              <div key={c.c}>
                <div className="mb-1 flex justify-between text-sm"><span>{c.c}</span><span className="text-muted-foreground">{c.v}%</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-gradient-primary" style={{ width: `${c.v * 2.5}%` }}/></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
