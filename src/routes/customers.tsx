import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Mail, Phone, MessageCircle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/customers")({ component: () => <DashboardLayout><Customers /></DashboardLayout> });

function Customers() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => (await supabase.from("customers").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const filtered = customers.filter((c: any) => !q || (c.name + c.company + c.country).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Customers</h1>
          <p className="text-sm text-muted-foreground">{customers.length} customers worldwide</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="bg-gradient-primary shadow-elegant"><Plus className="mr-1 h-4 w-4"/>Add customer</Button></DialogTrigger>
          <NewCustomerDialog onClose={() => setOpen(false)} onCreated={() => qc.invalidateQueries({ queryKey: ["customers"] })}/>
        </Dialog>
      </div>
      <Input placeholder="Search customers…" className="max-w-md" value={q} onChange={(e)=>setQ(e.target.value)}/>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 && <Card className="col-span-full p-12 text-center text-muted-foreground shadow-card">No customers yet. Add your first.</Card>}
        {filtered.map((c: any) => (
          <Card key={c.id} className="group p-5 shadow-card transition-all hover:shadow-elegant">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-primary text-lg font-semibold text-primary-foreground shadow-elegant">
                {(c.company || c.name || "?")[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{c.company || c.name}</div>
                <div className="truncate text-xs text-muted-foreground">{c.name} · {c.country || "—"}</div>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              {c.email && <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5"/>{c.email}</div>}
              {c.phone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5"/>{c.phone}</div>}
              {c.whatsapp && <div className="flex items-center gap-2 text-muted-foreground"><MessageCircle className="h-3.5 w-3.5"/>WhatsApp: {c.whatsapp}</div>}
              {c.wechat && <div className="flex items-center gap-2 text-muted-foreground"><MessageCircle className="h-3.5 w-3.5"/>WeChat: {c.wechat}</div>}
            </div>
            {c.notes && <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">{c.notes}</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}

function NewCustomerDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [f, setF] = useState({ name: "", company: "", email: "", phone: "", whatsapp: "", wechat: "", country: "", notes: "" });
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!f.name) { toast.error("Name is required"); return; }
    setBusy(true);
    const { error } = await supabase.from("customers").insert(f);
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Customer added"); onCreated(); onClose(); }
  };
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Add customer</DialogTitle></DialogHeader>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2"><Label>Contact name</Label><Input value={f.name} onChange={(e)=>setF({...f, name: e.target.value})}/></div>
        <div className="space-y-2"><Label>Company</Label><Input value={f.company} onChange={(e)=>setF({...f, company: e.target.value})}/></div>
        <div className="space-y-2"><Label>Email</Label><Input type="email" value={f.email} onChange={(e)=>setF({...f, email: e.target.value})}/></div>
        <div className="space-y-2"><Label>Phone</Label><Input value={f.phone} onChange={(e)=>setF({...f, phone: e.target.value})}/></div>
        <div className="space-y-2"><Label>WhatsApp</Label><Input value={f.whatsapp} onChange={(e)=>setF({...f, whatsapp: e.target.value})}/></div>
        <div className="space-y-2"><Label>WeChat</Label><Input value={f.wechat} onChange={(e)=>setF({...f, wechat: e.target.value})}/></div>
        <div className="col-span-2 space-y-2"><Label>Country</Label><Input value={f.country} onChange={(e)=>setF({...f, country: e.target.value})}/></div>
        <div className="col-span-2 space-y-2"><Label>Notes</Label><Input value={f.notes} onChange={(e)=>setF({...f, notes: e.target.value})}/></div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={submit} disabled={busy} className="bg-gradient-primary">{busy ? "Saving…" : "Add customer"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}
