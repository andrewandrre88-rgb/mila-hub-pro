export const money = (n: number, ccy = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: ccy, maximumFractionDigits: 0 }).format(n);

export const num = (n: number) => new Intl.NumberFormat("en-US").format(n);

export const STATUS_LABELS: Record<string, string> = {
  inquiry: "Inquiry",
  quotation_sent: "Quotation Sent",
  deposit_paid: "Deposit Paid",
  in_production: "In Production",
  quality_check: "Quality Check",
  packaging: "Packaging",
  ready_to_ship: "Ready to Ship",
  shipped: "Shipped",
  delivered: "Delivered",
  completed: "Completed",
};

export const STATUS_COLORS: Record<string, string> = {
  inquiry: "bg-muted text-muted-foreground",
  quotation_sent: "bg-accent text-accent-foreground",
  deposit_paid: "bg-primary/15 text-primary",
  in_production: "bg-warning/20 text-warning-foreground border border-warning/40",
  quality_check: "bg-warning/20 text-warning-foreground",
  packaging: "bg-primary/15 text-primary",
  ready_to_ship: "bg-primary/20 text-primary",
  shipped: "bg-chart-4/20 text-chart-4",
  delivered: "bg-success/20 text-success",
  completed: "bg-success/20 text-success",
};

export const PAYMENT_LABELS: Record<string, string> = {
  unpaid: "Unpaid",
  deposit_paid: "Deposit",
  partial: "Partial",
  paid: "Paid",
};
