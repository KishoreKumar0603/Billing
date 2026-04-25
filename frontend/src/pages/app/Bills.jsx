import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Search, FileText, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { billsService } from "@/services/bills.service";
import type { Bill, Customer } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Shimmer } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function Bills() {
  const [data, setData] = useState<{ bills: Bill[]; total: number } | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const limit = 10;

  const load = () => {
    setData(null);
    billsService.list({
      search, page, limit,
      status: status === "all" ? undefined : status,
      paymentStatus: paymentStatus === "all" ? undefined : paymentStatus,
    }).then((r) => setData(r as any));
  };
  useEffect(() => { const t = setTimeout(load, 200); return () => clearTimeout(t); }, [search, status, paymentStatus, page]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try { await billsService.remove(toDelete); toast.success("Bill deleted"); setToDelete(null); load(); }
    catch { toast.error("Delete failed"); }
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / limit)) : 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold">Delivery Challans</h1>
          <p className="text-muted-foreground mt-1">All your bills and lot deliveries.</p>
        </div>
        <Link to="/app/bills/new">
          <Button className="bg-gradient-primary shadow-elegant"><Plus className="h-4 w-4 mr-1" /> Create Bill</Button>
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card p-3 lg:p-4 shadow-card flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search bill #, lot, customer..." className="pl-9 h-10 border-0 bg-secondary" />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-[160px] h-10 border-0 bg-secondary"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="working">Working</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={paymentStatus} onValueChange={(v) => { setPaymentStatus(v); setPage(1); }}>
          <SelectTrigger className="w-[160px] h-10 border-0 bg-secondary"><SelectValue placeholder="Payment" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="received">Paid</SelectItem>
            <SelectItem value="partially">Partial</SelectItem>
            <SelectItem value="not_received">Unpaid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-medium">Bill</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Lot / Vehicle</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium text-right">Total</th>
                <th className="px-5 py-3 font-medium text-right">Balance</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data === null && [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-border">
                  {[...Array(8)].map((_, j) => <td key={j} className="px-5 py-4"><Shimmer className="h-4 w-20" /></td>)}
                </tr>
              ))}
              {data?.bills.map((b, i) => (
                <motion.tr key={b._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="border-b border-border hover:bg-secondary/40 transition-colors">
                  <td className="px-5 py-3"><p className="font-medium">{b.billNumber}</p></td>
                  <td className="px-5 py-3">
                    <p className="font-medium">{(b.customer as Customer).name}</p>
                    <p className="text-xs text-muted-foreground">{(b.customer as Customer).phone}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-mono text-xs">{b.lotNumber}</p>
                    <p className="text-xs text-muted-foreground">{b.vehicleNumber}</p>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground text-xs">{formatDate(b.createdAt)}</td>
                  <td className="px-5 py-3 text-right font-display font-semibold">{formatCurrency(b.totalAmount)}</td>
                  <td className={`px-5 py-3 text-right font-display font-semibold ${b.balanceAmount > 0 ? "text-destructive" : "text-success"}`}>{formatCurrency(b.balanceAmount)}</td>
                  <td className="px-5 py-3"><div className="flex flex-col gap-1 items-start"><StatusBadge status={b.status} type="order" /><StatusBadge status={b.paymentStatus} type="payment" /></div></td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <Link to={`/app/bills/${b._id}`}><Button size="icon" variant="ghost" className="h-8 w-8"><Eye className="h-4 w-4" /></Button></Link>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setToDelete(b._id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {data && data.bills.length === 0 && (
          <EmptyState icon={<FileText className="h-6 w-6" />} title="No bills yet" description="Create your first delivery challan to get started."
            action={<Link to="/app/bills/new"><Button className="bg-gradient-primary"><Plus className="h-4 w-4 mr-1" /> Create Bill</Button></Link>} />
        )}
        {data && data.total > limit && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">Showing {(page-1)*limit + 1}–{Math.min(page*limit, data.total)} of {data.total}</p>
            <div className="flex gap-1">
              <Button size="icon" variant="outline" className="h-8 w-8" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
              <div className="grid h-8 min-w-8 place-items-center rounded-md border border-border px-2 text-xs">{page} / {totalPages}</div>
              <Button size="icon" variant="outline" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this bill?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. The bill will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
