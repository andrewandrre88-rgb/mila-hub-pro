import { type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string | number;
  delta?: string;
  trend?: "up" | "down";
  icon: LucideIcon;
  accent?: "primary" | "success" | "warning" | "destructive";
}

const accents = {
  primary: "from-primary/15 to-primary/0 text-primary",
  success: "from-success/15 to-success/0 text-success",
  warning: "from-warning/20 to-warning/0 text-warning",
  destructive: "from-destructive/15 to-destructive/0 text-destructive",
};

export function StatCard({ label, value, delta, trend, icon: Icon, accent = "primary" }: Props) {
  return (
    <Card className="group relative overflow-hidden border-border/60 p-5 shadow-card transition-all hover:shadow-elegant">
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60", accents[accent])} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
          {delta && (
            <p className={cn("mt-2 text-xs font-medium", trend === "up" ? "text-success" : "text-destructive")}>
              {trend === "up" ? "↑" : "↓"} {delta} vs last month
            </p>
          )}
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg bg-background/80 backdrop-blur", accents[accent].split(" ").pop())}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
