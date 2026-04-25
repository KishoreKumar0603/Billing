import { cn } from "@/lib/utils";

const statusMap = {
  working:
    "bg-warning/10 text-warning border-warning/20",

  completed:
    "bg-success/10 text-success border-success/20",
};

const payMap = {
  not_received:
    "bg-destructive/10 text-destructive border-destructive/20",

  partially:
    "bg-warning/10 text-warning border-warning/20",

  received:
    "bg-success/10 text-success border-success/20",
};

const labels = {
  working: "Working",

  completed:
    "Completed",

  not_received:
    "Unpaid",

  partially: "Partial",

  received: "Paid",
};

export function StatusBadge({
  status,
  type,
}) {
  const cls =
    type === "order"
      ? statusMap[status]
      : payMap[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        cls
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />

      {labels[status]}
    </span>
  );
}