import { cn } from "@/lib/utils";
import type { BillStatus, PaymentStatus } from "@/types";

const statusMap: Record<BillStatus, string> = {
  working: "bg-warning/10 text-warning border-warning/20",
  completed: "bg-success/10 text-success border-success/20",
};
const payMap: Record<PaymentStatus, string> = {
  not_received: "bg-destructive/10 text-destructive border-destructive/20",
  partially: "bg-warning/10 text-warning border-warning/20",
  received: "bg-success/10 text-success border-success/20",
};
const labels: Record<string, string> = {
  working: "Working", completed: "Completed",
  not_received: "Unpaid", partially: "Partial", received: "Paid",
};

export function StatusBadge({ status, type }: { status: BillStatus | PaymentStatus; type: "order" | "payment" }) {
  const cls = type === "order" ? statusMap[status as BillStatus] : payMap[status as PaymentStatus];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", cls)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {labels[status]}
    </span>
  );
}
