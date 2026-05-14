import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Clock, Package, CreditCard, Truck } from "lucide-react";

export const Route = createFileRoute("/notifications")({ component: () => <DashboardLayout><Notifications/></DashboardLayout> });

const items: { i: typeof AlertTriangle; c: string; t: string; d: string; time: string }[] = [];

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
