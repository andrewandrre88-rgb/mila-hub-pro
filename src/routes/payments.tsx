import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { money, PAYMENT_LABELS } from "@/lib/format";

export const Route = createFileRoute("/payments")({ component: () => <DashboardLayout><Payments/></DashboardLayout> });

function Payments() {
  const { data: orders = [] } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => (await supabase.from("orders").select("*, customers(company, name)").order("created_at", { ascending: false })).data ?? [],
  });

  const totals = orders.reduce((a: any, o: any) => {
    a.total += +o.total_amount; a.paid += +o.deposit_paid; a.balance += +o.balance;
    return a;
  }, { total: 0, paid: 0, balance: 0 });

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold">Payments</h1><p className="text-sm text-muted-foreground">Deposits, balances, and invoice status</p></div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5 shadow-card"><div className="text-sm text-muted-foreground">Total billed</div><div className="mt-1 text-3xl font-semibold">{money(totals.total)}</div></Card>
        <Card className="p-5 shadow-card border-success/30"><div className="text-sm text-muted-foreground">Received</div><div className="mt-1 text-3xl font-semibold text-success">{money(totals.paid)}</div></Card>
        <Card className="p-5 shadow-card border-destructive/30"><div className="text-sm text-muted-foreground">Outstanding</div><div className="mt-1 text-3xl font-semibold text-destructive">{money(totals.balance)}</div></Card>
      </div>
      <Card className="overflow-hidden shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Paid</th><th className="px-4 py-3">Balance</th><th className="px-4 py-3">Status</th></tr>
          </thead>
          <tbody>
            {orders.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No payments to track yet.</td></tr>}
            {orders.map((o: any) => (
              <tr key={o.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{o.order_number}</td>
                <td className="px-4 py-3">{o.customers?.company || o.customers?.name}</td>
                <td className="px-4 py-3">{money(+o.total_amount)}</td>
                <td className="px-4 py-3 text-success">{money(+o.deposit_paid)}</td>
                <td className="px-4 py-3 text-destructive">{money(+o.balance)}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-muted px-2 py-0.5 text-xs">{PAYMENT_LABELS[o.payment_status]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
