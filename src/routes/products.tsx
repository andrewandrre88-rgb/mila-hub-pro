import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Package } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { money, num } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/products")({ component: () => <DashboardLayout><Products /></DashboardLayout> });

const CATS = ["Trigger Sprayer", "Mist Sprayer", "Lotion Pump", "Foam Pump", "Plastic Bottle"];

function Products() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => (await supabase.from("products").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div><h1 className="text-2xl font-semibold">Products</h1><p className="text-sm text-muted-foreground">{products.length} SKUs</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="bg-gradient-primary shadow-elegant"><Plus className="mr-1 h-4 w-4"/>Add product</Button></DialogTrigger>
          <NewProductDialog onClose={() => setOpen(false)} onCreated={() => qc.invalidateQueries({ queryKey: ["products"] })}/>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.length === 0 && <Card className="col-span-full p-12 text-center text-muted-foreground shadow-card">No products yet.</Card>}
        {products.map((p: any) => (
          <Card key={p.id} className="overflow-hidden shadow-card transition-all hover:shadow-elegant">
            <div className="aspect-square bg-gradient-to-br from-muted to-accent flex items-center justify-center">
              {p.image_url ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover"/> : <Package className="h-16 w-16 text-muted-foreground/40"/>}
            </div>
            <div className="p-4">
              <div className="text-xs uppercase tracking-wider text-primary">{p.category}</div>
              <div className="mt-1 font-semibold">{p.name}</div>
              <div className="mt-1 text-xs text-muted-foreground">SKU: {p.sku} {p.size && `· ${p.size}`} {p.color && `· ${p.color}`}</div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">{money(Number(p.unit_price))}</div>
                  <div className="text-xs text-muted-foreground">MOQ {num(p.moq)}</div>
                </div>
                <div className={`rounded-md px-2 py-1 text-xs font-medium ${p.stock < (p.moq ?? 1000) ? "bg-warning/20 text-warning-foreground" : "bg-success/20 text-success"}`}>
                  Stock: {num(p.stock)}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function NewProductDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [f, setF] = useState({ sku: "", name: "", category: "Trigger Sprayer", size: "", color: "", moq: 1000, unit_price: 0, stock: 0, image_url: "" });
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!f.sku || !f.name) { toast.error("SKU and Name required"); return; }
    setBusy(true);
    const { error } = await supabase.from("products").insert(f);
    setBusy(false);
    if (error) toast.error(error.message); else { toast.success("Product added"); onCreated(); onClose(); }
  };
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Add product</DialogTitle></DialogHeader>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2"><Label>SKU</Label><Input value={f.sku} onChange={(e)=>setF({...f, sku: e.target.value})}/></div>
        <div className="space-y-2"><Label>Name</Label><Input value={f.name} onChange={(e)=>setF({...f, name: e.target.value})}/></div>
        <div className="space-y-2"><Label>Category</Label>
          <select className="h-9 w-full rounded-md border bg-background px-3 text-sm" value={f.category} onChange={(e)=>setF({...f, category: e.target.value})}>
            {CATS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-2"><Label>Size</Label><Input value={f.size} onChange={(e)=>setF({...f, size: e.target.value})}/></div>
        <div className="space-y-2"><Label>Color</Label><Input value={f.color} onChange={(e)=>setF({...f, color: e.target.value})}/></div>
        <div className="space-y-2"><Label>MOQ</Label><Input type="number" value={f.moq} onChange={(e)=>setF({...f, moq: +e.target.value})}/></div>
        <div className="space-y-2"><Label>Unit price</Label><Input type="number" step="0.01" value={f.unit_price} onChange={(e)=>setF({...f, unit_price: +e.target.value})}/></div>
        <div className="space-y-2"><Label>Stock</Label><Input type="number" value={f.stock} onChange={(e)=>setF({...f, stock: +e.target.value})}/></div>
        <div className="col-span-2 space-y-2"><Label>Image URL</Label><Input value={f.image_url} onChange={(e)=>setF({...f, image_url: e.target.value})}/></div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={submit} disabled={busy} className="bg-gradient-primary">{busy ? "Saving…" : "Add product"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}
