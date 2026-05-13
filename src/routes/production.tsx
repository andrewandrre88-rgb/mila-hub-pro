import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge } from "@/components/StatusBadge";
import { Factory } from "lucide-react";

export const Route = createFileRoute("/production")({ component: () => <DashboardLayout><Production/></DashboardLayout> });

function Production() {
  const { data: orders = [] } = useQuery({
    queryKey: ["production-orders"],
    queryFn: async () => (await supabase.from("orders").select("*, customers(company, name)").in("status", ["deposit_paid","in_production","quality_check","packaging","ready_to_ship"]).order("estimated_delivery", { ascending: true, nullsFirst: false })).data ?? [],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Production tracking</h1>
        <p className="text-sm text-muted-foreground">{orders.length} active orders on the factory floor</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Capacity used", v: "92%", sub: "Target: 95%", c: "from-primary/15 to-primary/0 text-primary" },
          { label: "Avg lead time", v: "21 days", sub: "Sprayers + pumps", c: "from-success/15 to-success/0 text-success" },
          { label: "Today's output", v: "26,500 units", sub: "vs 24,000 yest.", c: "from-warning/20 to-warning/0 text-warning" },
        ].map((s)=>(
          <Card key={s.label} className="relative overflow-hidden p-5 shadow-card">
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60 ${s.c}`}/>
            <div className="relative flex items-start justify-between">
              <div>
                <div className="text-sm font-medium text-muted-foreground">{s.label}</div>
                <div className="mt-1 text-3xl font-semibold">{s.v}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.sub}</div>
              </div>
              <Factory className="h-5 w-5 text-primary"/>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 shadow-card">
        <h3 className="mb-4 font-semibold">Active production orders</h3>
        <div className="space-y-4">
          {orders.length === 0 && <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">No orders in production right now.</div>}
          {orders.map((o: any) => (
            <div key={o.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{o.order_number}</div>
                  <div className="text-xs text-muted-foreground">{o.customers?.company || o.customers?.name}</div>
                </div>
                <StatusBadge status={o.status}/>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Progress value={o.production_progress ?? 0} className="h-2"/>
                <span className="text-sm font-medium">{o.production_progress ?? 0}%</span>
              </div>
              {o.estimated_delivery && <div className="mt-2 text-xs text-muted-foreground">Target ship: {new Date(o.estimated_delivery).toLocaleDateString()}</div>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
