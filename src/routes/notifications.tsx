import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Clock, Package, CreditCard, Truck } from "lucide-react";

export const Route = createFileRoute("/notifications")({ component: () => <DashboardLayout><Notifications/></DashboardLayout> });

const items = [
  { i: CreditCard, c: "destructive", t: "Late payment", d: "Order MP-104238 — balance overdue 12 days", time: "2h ago" },
  { i: Clock, c: "warning", t: "Production delayed", d: "MP-104301 (Trigger sprayers) behind schedule by 3 days", time: "5h ago" },
  { i: Package, c: "primary", t: "New order", d: "BellaCare Cosmetics placed an order for 50,000 lotion pumps", time: "1d ago" },
  { i: Truck, c: "success", t: "Shipment delivered", d: "MP-103998 cleared customs in Hamburg", time: "1d ago" },
  { i: AlertTriangle, c: "warning", t: "Low inventory", d: "PET Bottle 500ml below MOQ", time: "2d ago" },
];

const accent: Record<string, string> = {
  destructive: "bg-destructive/10 text-destructive",
  warning: "bg-warning/15 text-warning-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
};

function Notifications() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold">Notifications</h1><p className="text-sm text-muted-foreground">Recent alerts across the workshop</p></div>
      <Card className="divide-y shadow-card">
        {items.map((n, i) => (
          <div key={i} className="flex items-start gap-4 p-5 transition-colors hover:bg-muted/30">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accent[n.c]}`}><n.i className="h-5 w-5"/></div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="font-medium">{n.t}</div>
                <div className="text-xs text-muted-foreground">{n.time}</div>
              </div>
              <div className="mt-0.5 text-sm text-muted-foreground">{n.d}</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
