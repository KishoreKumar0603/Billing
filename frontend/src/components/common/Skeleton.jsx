import { cn } from "@/lib/utils";
export function Shimmer({ className }: { className?: string }) {
  return <div className={cn("animate-shimmer rounded-md bg-muted", className)} />;
}
