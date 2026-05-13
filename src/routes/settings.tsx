import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/settings")({ component: () => <DashboardLayout><Settings/></DashboardLayout> });

function Settings() {
  const { user, roles } = useAuth();
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
  }, []);
  const toggleDark = (v: boolean) => {
    setDark(v);
    document.documentElement.classList.toggle("dark", v);
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold">Settings</h1><p className="text-sm text-muted-foreground">Company, account and preferences</p></div>

      <Card className="p-6 shadow-card">
        <h3 className="font-semibold">Company</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Company name</Label><Input defaultValue="MILA PLASTICS"/></div>
          <div className="space-y-2"><Label>Location</Label><Input defaultValue="Quzhou, China"/></div>
          <div className="space-y-2"><Label>Currency</Label><Input defaultValue="USD"/></div>
          <div className="space-y-2"><Label>Timezone</Label><Input defaultValue="Asia/Shanghai"/></div>
        </div>
        <div className="mt-4"><Button className="bg-gradient-primary">Save</Button></div>
      </Card>

      <Card className="p-6 shadow-card">
        <h3 className="font-semibold">Your account</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Email</Label><Input value={user?.email ?? ""} disabled/></div>
          <div className="space-y-2"><Label>Roles</Label><Input value={roles.join(", ") || "—"} disabled/></div>
        </div>
      </Card>

      <Card className="p-6 shadow-card">
        <div className="flex items-center justify-between">
          <div><h3 className="font-semibold">Dark mode</h3><p className="text-sm text-muted-foreground">Use dark theme across the dashboard.</p></div>
          <Switch checked={dark} onCheckedChange={toggleDark}/>
        </div>
      </Card>
    </div>
  );
}
