import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { ShoppingCart, Factory, Truck, CreditCard, Package, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { StatusBadge } from "@/components/StatusBadge";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip,
  BarChart, Bar, CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";

export const Route = createFileRoute("/")({ component: () => <DashboardLayout><Dashboard /></DashboardLayout> });

const revenueData = [
  { m: "Jan", r: 0 }, { m: "Feb", r: 0 }, { m: "Mar", r: 0 },
  { m: "Apr", r: 0 }, { m: "May", r: 0 }, { m: "Jun", r: 0 },
  { m: "Jul", r: 0 }, { m: "Aug", r: 0 }, { m: "Sep", r: 0 },
  { m: "Oct", r: 0 }, { m: "Nov", r: 0 }, { m: "Dec", r: 0 },
];

const productionData = [
  { day: "Mon", sprayers: 0, pumps: 0 },
  { day: "Tue", sprayers: 0, pumps: 0 },
  { day: "Wed", sprayers: 0, pumps: 0 },
  { day: "Thu", sprayers: 0, pumps: 0 },
  { day: "Fri", sprayers: 0, pumps: 0 },
  { day: "Sat", sprayers: 0, pumps: 0 },
];

const PIE_COLORS = ["oklch(0.52 0.19 260)", "oklch(0.65 0.18 255)", "oklch(0.78 0.15 75)", "oklch(0.65 0.16 155)"];

function Dashboard() {
  const { t, money } = useI18n();
  const shippingPie = [
    { name: t("ship.sea"), value: 58 },
    { name: t("ship.air"), value: 22 },
    { name: t("ship.express"), value: 14 },
    { name: t("ship.land"), value: 6 },
  ];
  const { data: orders = [] } = useQuery({
    queryKey: ["orders-overview"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*, customers(name, company, country)").order("created_at", { ascending: false }).limit(8);
      return data ?? [];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const [{ count: total }, { count: prod }, { count: shipped }] = await Promise.all([
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "in_production"),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "shipped"),
      ]);
      const { data: pending } = await supabase.from("orders").select("balance").in("payment_status", ["unpaid", "deposit_paid", "partial"]);
      const pendingTotal = (pending ?? []).reduce((s, o) => s + Number(o.balance ?? 0), 0);
      return { total: total ?? 0, prod: prod ?? 0, shipped: shipped ?? 0, pending: pendingTotal };
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("dash.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("dash.subtitle")}</p>
        </div>
        <Button asChild className="bg-gradient-primary shadow-elegant"><Link to="/orders">{t("dash.newOrder")}</Link></Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("stat.totalOrders")} value={stats?.total ?? 0} delta="12.4%" trend="up" icon={ShoppingCart} accent="primary" />
        <StatCard label={t("stat.inProduction")} value={stats?.prod ?? 0} delta="3.1%" trend="up" icon={Factory} accent="warning" />
        <StatCard label={t("stat.shipped")} value={stats?.shipped ?? 0} delta="8.7%" trend="up" icon={Truck} accent="success" />
        <StatCard label={t("stat.pendingPayments")} value={money(stats?.pending ?? 0)} delta="2.3%" trend="down" icon={CreditCard} accent="destructive" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{t("card.monthlyRevenue")}</h3>
              <p className="text-xs text-muted-foreground">{t("card.last12")}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold">{money(1838000)}</div>
              <div className="text-xs text-success">↑ 18.2% YoY</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.52 0.19 260)" stopOpacity={0.4}/>
                  <stop offset="100%" stopColor="oklch(0.52 0.19 260)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 252)" vertical={false}/>
              <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: "oklch(0.5 0.02 252)", fontSize: 12 }}/>
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "oklch(0.5 0.02 252)", fontSize: 12 }} tickFormatter={(v)=>`${v/1000}k`}/>
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.92 0.01 252)" }} formatter={(v: number)=>money(v)}/>
              <Area type="monotone" dataKey="r" stroke="oklch(0.52 0.19 260)" strokeWidth={2.5} fill="url(#rev)"/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 shadow-card">
          <h3 className="font-semibold">{t("card.shippingMix")}</h3>
          <p className="text-xs text-muted-foreground">{t("card.last30")}</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={shippingPie} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {shippingPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }}/>
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{t("card.production")}</h3>
              <p className="text-xs text-muted-foreground">{t("card.productionSub")}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={productionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 252)" vertical={false}/>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "oklch(0.5 0.02 252)", fontSize: 12 }}/>
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "oklch(0.5 0.02 252)", fontSize: 12 }}/>
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.92 0.01 252)" }}/>
              <Bar dataKey="sprayers" fill="oklch(0.52 0.19 260)" radius={[4,4,0,0]}/>
              <Bar dataKey="pumps" fill="oklch(0.65 0.18 255)" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 shadow-card">
          <h3 className="font-semibold">{t("card.quickStats")}</h3>
          <div className="mt-4 space-y-4">
            {[
              { icon: Users, label: t("qs.activeCustomers"), v: "184" },
              { icon: Package, label: t("qs.skus"), v: "76" },
              { icon: Factory, label: t("qs.capacity"), v: "92%" },
              { icon: Truck, label: t("qs.onTime"), v: "98.4%" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <s.icon className="h-4 w-4"/>
                </div>
                <div className="flex flex-1 items-center justify-between">
                  <span className="text-sm text-muted-foreground">{s.label}</span>
                  <span className="font-semibold">{s.v}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{t("card.recentOrders")}</h3>
            <p className="text-xs text-muted-foreground">{t("card.recentOrdersSub")}</p>
          </div>
          <Button variant="outline" size="sm" asChild><Link to="/orders">{t("card.viewAll")}</Link></Button>
        </div>
        {orders.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
            {t("empty.orders")} <Link to="/orders" className="text-primary underline">{t("empty.createFirst")}</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2 pr-4">{t("table.order")}</th>
                  <th className="py-2 pr-4">{t("table.customer")}</th>
                  <th className="py-2 pr-4">{t("table.country")}</th>
                  <th className="py-2 pr-4">{t("table.total")}</th>
                  <th className="py-2 pr-4">{t("table.status")}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o: any) => (
                  <tr key={o.id} className="border-b last:border-0 hover:bg-muted/40">
                    <td className="py-3 pr-4 font-medium">{o.order_number}</td>
                    <td className="py-3 pr-4">{o.customers?.company ?? o.customers?.name ?? "—"}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{o.customers?.country ?? "—"}</td>
                    <td className="py-3 pr-4">{money(Number(o.total_amount), o.currency || "USD")}</td>
                    <td className="py-3 pr-4"><StatusBadge status={o.status}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
