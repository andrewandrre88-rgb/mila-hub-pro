import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge } from "@/components/StatusBadge";
import { Truck, Container, Plane, Ship } from "lucide-react";

export const Route = createFileRoute("/shipping")({ component: () => <DashboardLayout><Shipping/></DashboardLayout> });

function Shipping() {
  const { data: shipments = [] } = useQuery({
    queryKey: ["shipping"],
    queryFn: async () => (await supabase.from("orders").select("*, customers(company, name, country)").in("status", ["ready_to_ship", "shipped", "delivered"]).order("created_at", { ascending: false })).data ?? [],
  });

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold">Shipping</h1><p className="text-sm text-muted-foreground">Track containers, carriers and deliveries</p></div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { i: Ship, l: "Sea freight", v: 0 }, { i: Plane, l: "Air freight", v: 0 },
          { i: Truck, l: "Land", v: 0 }, { i: Container, l: "In transit", v: 0 },
        ].map(s => (
          <Card key={s.l} className="flex items-center gap-4 p-5 shadow-card">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-elegant"><s.i className="h-5 w-5"/></div>
            <div><div className="text-2xl font-semibold">{s.v}</div><div className="text-xs text-muted-foreground">{s.l}</div></div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Order</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Carrier</th><th className="px-4 py-3">Tracking</th><th className="px-4 py-3">ETA</th><th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {shipments.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No shipments yet.</td></tr>}
            {shipments.map((o: any) => (
              <tr key={o.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{o.order_number}</td>
                <td className="px-4 py-3">{o.customers?.company || o.customers?.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.customers?.country || "—"}</td>
                <td className="px-4 py-3">{o.shipping_company || o.shipping_method || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.tracking_number || "—"}</td>
                <td className="px-4 py-3">{o.estimated_delivery ? new Date(o.estimated_delivery).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-3"><StatusBadge status={o.status}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
