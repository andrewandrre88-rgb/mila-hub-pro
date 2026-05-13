import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/documents")({ component: () => <DashboardLayout><Documents/></DashboardLayout> });

const docs = [
  { name: "Invoices", count: 84, color: "from-primary/20 to-primary/0" },
  { name: "Packing Lists", count: 56, color: "from-success/20 to-success/0" },
  { name: "Contracts", count: 23, color: "from-warning/20 to-warning/0" },
  { name: "Product Photos", count: 412, color: "from-chart-4/20 to-chart-4/0" },
  { name: "Shipping Docs", count: 67, color: "from-destructive/20 to-destructive/0" },
];

function Documents() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div><h1 className="text-2xl font-semibold">Documents</h1><p className="text-sm text-muted-foreground">Invoices, packing lists, contracts and more</p></div>
        <Button className="bg-gradient-primary shadow-elegant"><Upload className="mr-1 h-4 w-4"/>Upload</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {docs.map(d => (
          <Card key={d.name} className={`relative overflow-hidden p-5 shadow-card transition-all hover:shadow-elegant`}>
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60 ${d.color}`}/>
            <div className="relative">
              <FileText className="h-8 w-8 text-primary"/>
              <div className="mt-3 text-2xl font-semibold">{d.count}</div>
              <div className="text-sm text-muted-foreground">{d.name}</div>
            </div>
          </Card>
        ))}
      </div>
      <Card className="p-12 text-center shadow-card">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground/40"/>
        <p className="mt-4 text-muted-foreground">Drag & drop files here, or click upload to attach documents to orders.</p>
      </Card>
    </div>
  );
}
