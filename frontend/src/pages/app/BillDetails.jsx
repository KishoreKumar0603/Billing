import { useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

import { ArrowLeft, Download, Pencil, Printer } from "lucide-react";

import { billsService } from "@/services/bills.service";

import { Shimmer } from "@/components/common/Skeleton";

import { Button } from "@/components/ui/button";

import { formatCurrency, formatDate } from "@/lib/format";

import { StatusBadge } from "@/components/common/StatusBadge";

import { PaymentManager } from "@/components/bills/PaymentManager";

import { motion } from "framer-motion";

import { toast } from "sonner";

export default function BillDetails() {
  const { id } = useParams();

  const [bill, setBill] = useState(null);

  const loadBill = async () => {
    if (id) {
      const b = await billsService.get(id);
      setBill(b || null);
    }
  };

  useEffect(() => {
    loadBill();
  }, [id]);

  if (!bill) {
    return (
      <div className="space-y-4">
        <Shimmer className="h-16" />

        <Shimmer className="h-96" />
      </div>
    );
  }

  console.table(bill);

  const customer = bill.customer;

  const handleOnClick = async () => {
    try {
      const blob = await billsService.downloadPdf(id);

      const url = window.URL.createObjectURL(new Blob([blob]));

      const link = document.createElement("a");

      link.href = url;

      link.setAttribute("download", `bill-${id}.pdf`);

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success("PDF downloaded");
    } catch (error) {
      toast.error("Failed to download PDF");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3 print:hidden">
        <Link
          to="/app/bills"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Bills
        </Link>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-1" />
            Print
          </Button>

          <Button variant="outline" onClick={handleOnClick}>
            <Download className="h-4 w-4 mr-1" />
            PDF
          </Button>

          <Link to={`/app/bills/${bill._id}/edit`}>
            <Button className="bg-gradient-primary">
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="mx-auto max-w-3xl rounded-2xl border border-border bg-card shadow-card overflow-hidden print:shadow-none print:border-0"
      >
        <div className="bg-gradient-hero text-white p-6 lg:p-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary-glow blur-3xl" />
          </div>

          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                Delivery Challan
              </p>

              <h1 className="font-display text-3xl font-bold mt-1 text-white">
                {bill.billNumber}
              </h1>

              <p className="text-sm text-white/70 mt-1">
                {formatDate(bill.createdAt)}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={bill.status} type="order" />

              <StatusBadge status={bill.paymentStatus} type="payment" />
            </div>
          </div>
        </div>

        <div className="p-6 lg:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                From
              </p>

              <p className="font-medium mt-1">{bill.fromName}</p>

              <p className="text-muted-foreground">{bill.address}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Delivered To
              </p>

              <p className="font-medium mt-1">{customer?.name}</p>

              <p className="text-muted-foreground">{customer?.phone}</p>

              {customer?.address && (
                <p className="text-muted-foreground">{customer.address}</p>
              )}
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Lot Number
              </p>

              <p className="font-mono font-medium mt-1">{bill.lotNumber}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Vehicle
              </p>

              <p className="font-mono font-medium mt-1 uppercase">
                {bill.vehicleNumber}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Label</th>

                  <th className="px-4 py-2.5 font-medium text-right">
                    Quantity
                  </th>

                  <th className="px-4 py-2.5 font-medium text-right">Rate</th>

                  <th className="px-4 py-2.5 font-medium text-right">Amount</th>
                </tr>
              </thead>

              <tbody>
                {bill.rows.map((r, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{r.label}</td>

                    <td className="px-4 py-3 text-right tabular-nums">
                      {r.quantity}
                    </td>

                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatCurrency(r.rate)}
                    </td>

                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {formatCurrency(r.amount ?? r.quantity * r.rate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-secondary/40 p-4">
              <p className="text-xs text-muted-foreground">Total</p>

              <p className="font-display text-xl font-bold mt-1">
                {formatCurrency(bill.totalAmount)}
              </p>
            </div>

            <div className="rounded-xl bg-success/10 p-4">
              <p className="text-xs text-success">Received</p>

              <p className="font-display text-xl font-bold mt-1 text-success">
                {formatCurrency(bill.receivedAmount)}
              </p>
            </div>

            <div
              className={`rounded-xl p-4 ${
                bill.balanceAmount > 0 ? "bg-destructive/10" : "bg-muted"
              }`}
            >
              <p
                className={`text-xs ${
                  bill.balanceAmount > 0
                    ? "text-destructive"
                    : "text-muted-foreground"
                }`}
              >
                Balance
              </p>

              <p
                className={`font-display text-xl font-bold mt-1 ${
                  bill.balanceAmount > 0 ? "text-destructive" : ""
                }`}
              >
                {formatCurrency(bill.balanceAmount)}
              </p>
            </div>
          </div>

          {bill.notes && (
            <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              {bill.notes}
            </div>
          )}

          {/* Payment Manager (Production-level) */}
          <div className="mt-8 pt-6 border-t border-border">
            <PaymentManager billId={bill._id} onPaymentChange={loadBill} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
