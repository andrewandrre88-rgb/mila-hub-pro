import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo, useState } from "react";
import { money, STATUS_LABELS, PAYMENT_LABELS } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";

export const Route = createFileRoute("/orders")({ component: () => <DashboardLayout><Orders /></DashboardLayout> });

const STATUSES = Object.keys(STATUS_LABELS);

function Orders() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState<string>("all");
  const [open, setOpen] = useState(false);

  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*, customers(name, company, country)").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const { data: customers = [] } = useQuery({
    queryKey: ["customers-list"],
    queryFn: async () => (await supabase.from("customers").select("id, name, company, country")).data ?? [],
  });

  const filtered = useMemo(() => orders.filter((o: any) => {
    const matchQ = !q || o.order_number.toLowerCase().includes(q.toLowerCase()) || o.customers?.company?.toLowerCase().includes(q.toLowerCase()) || o.customers?.name?.toLowerCase().includes(q.toLowerCase());
    const matchS = statusF === "all" || o.status === statusF;
    return matchQ && matchS;
  }), [orders, q, statusF]);

  const remove = async (id: string) => {
    if (!confirm("Delete this order?")) return;
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Order deleted"); qc.invalidateQueries({ queryKey: ["orders"] }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Orders</h1>
          <p className="text-sm text-muted-foreground">{orders.length} total · {filtered.length} shown</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-elegant"><Plus className="mr-1 h-4 w-4"/>New order</Button>
          </DialogTrigger>
          <NewOrderDialog customers={customers} onClose={() => setOpen(false)} onCreated={() => qc.invalidateQueries({ queryKey: ["orders"] })}/>
        </Dialog>
      </div>

      <Card className="p-4 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
            <Input placeholder="Search by order # or customer…" className="pl-9" value={q} onChange={(e)=>setQ(e.target.value)}/>
          </div>
          <Select value={statusF} onValueChange={setStatusF}>
            <SelectTrigger className="sm:w-56"><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map(s => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Order #</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Balance</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">No orders match your filters.</td></tr>
              )}
              {filtered.map((o: any) => (
                <tr key={o.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{o.order_number}</td>
                  <td className="px-4 py-3">{o.customers?.company || o.customers?.name || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{o.customers?.country || "—"}</td>
                  <td className="px-4 py-3">{money(Number(o.total_amount), o.currency || "USD")}</td>
                  <td className="px-4 py-3">{money(Number(o.balance), o.currency || "USD")}</td>
                  <td className="px-4 py-3 text-muted-foreground">{PAYMENT_LABELS[o.payment_status]}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status}/></td>
                  <td className="px-4 py-3 text-right">
                    <Button size="icon" variant="ghost" onClick={() => remove(o.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function NewOrderDialog({ customers, onClose, onCreated }: { customers: any[]; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    order_number: `MP-${Date.now().toString().slice(-6)}`,
    customer_id: "",
    product_name: "Trigger Sprayer 28/410",
    quantity: 10000,
    unit_price: 0.18,
    deposit_paid: 0,
    status: "inquiry" as const,
    shipping_method: "Sea Freight",
    notes: "",
  });
  const [busy, setBusy] = useState(false);

  const total = form.quantity * form.unit_price;
  const balance = Math.max(0, total - form.deposit_paid);

  const submit = async () => {
    if (!form.customer_id) { toast.error("Pick a customer"); return; }
    setBusy(true);
    const { data: order, error } = await supabase.from("orders").insert({
      order_number: form.order_number,
      customer_id: form.customer_id,
      status: form.status,
      total_amount: total,
      deposit_paid: form.deposit_paid,
      balance,
      payment_status: form.deposit_paid >= total ? "paid" : form.deposit_paid > 0 ? "deposit_paid" : "unpaid",
      shipping_method: form.shipping_method,
      notes: form.notes,
    }).select().single();
    if (error || !order) { setBusy(false); toast.error(error?.message ?? "Failed"); return; }
    await supabase.from("order_items").insert({
      order_id: order.id, product_name: form.product_name, quantity: form.quantity, unit_price: form.unit_price,
    });
    setBusy(false);
    toast.success("Order created");
    onCreated(); onClose();
  };

  return (
    <DialogContent className="max-w-xl">
      <DialogHeader><DialogTitle>Create new order</DialogTitle></DialogHeader>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Order number</Label><Input value={form.order_number} onChange={(e)=>setForm({...form, order_number: e.target.value})}/></div>
        <div className="space-y-2">
          <Label>Customer</Label>
          <Select value={form.customer_id} onValueChange={(v)=>setForm({...form, customer_id: v})}>
            <SelectTrigger><SelectValue placeholder={customers.length ? "Select…" : "No customers yet"}/></SelectTrigger>
            <SelectContent>
              {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.company || c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-2"><Label>Product</Label><Input value={form.product_name} onChange={(e)=>setForm({...form, product_name: e.target.value})}/></div>
        <div className="space-y-2"><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={(e)=>setForm({...form, quantity: +e.target.value})}/></div>
        <div className="space-y-2"><Label>Unit price (USD)</Label><Input type="number" step="0.01" value={form.unit_price} onChange={(e)=>setForm({...form, unit_price: +e.target.value})}/></div>
        <div className="space-y-2"><Label>Deposit paid</Label><Input type="number" step="0.01" value={form.deposit_paid} onChange={(e)=>setForm({...form, deposit_paid: +e.target.value})}/></div>
        <div className="space-y-2"><Label>Shipping</Label><Input value={form.shipping_method} onChange={(e)=>setForm({...form, shipping_method: e.target.value})}/></div>
        <div className="col-span-2 grid grid-cols-2 gap-4 rounded-lg border bg-muted/30 p-3 text-sm">
          <div><div className="text-muted-foreground">Total</div><div className="font-semibold">{money(total)}</div></div>
          <div><div className="text-muted-foreground">Balance</div><div className="font-semibold">{money(balance)}</div></div>
        </div>
        <div className="col-span-2 space-y-2"><Label>Notes</Label><Input value={form.notes} onChange={(e)=>setForm({...form, notes: e.target.value})}/></div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={submit} disabled={busy} className="bg-gradient-primary">{busy ? "Creating…" : "Create order"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}
