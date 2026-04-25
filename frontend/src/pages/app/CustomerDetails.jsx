import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Phone, MapPin } from "lucide-react";
import { customersService } from "@/services/customers.service";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Shimmer } from "@/components/common/Skeleton";

export default function CustomerDetails() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  useEffect(() => { if (id) customersService.get(id).then(setData); }, [id]);

  if (!data) return <div className="space-y-4"><Shimmer className="h-32" /><Shimmer className="h-48" /></div>;

  const { customer, analytics, recentBills } = data;

  const stats = [
    { label: "Total Orders", value: analytics.totalOrders, money: false },
    { label: "Total Business", value: analytics.totalBusinessAmount, money: true },
    { label: "Received", value: analytics.totalReceivedAmount, money: true },
    { label: "Pending", value: analytics.totalPendingAmount, money: true, warn: true },
  ];

  return (
    <div className="space-y-6">
      <Link to="/app/customers" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> All customers</Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-hero text-white p-6 lg:p-8 shadow-elegant relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-primary-glow blur-3xl" />
        </div>
        <div className="relative flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white font-display text-2xl font-bold">
            {customer?.name?.[0]}
          </div>
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-white">{customer?.name}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-white/70">
              <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{customer?.phone}</span>
              {customer?.address && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{customer.address}</span>}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 shadow-card">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`font-display text-xl lg:text-2xl font-bold mt-1 ${s.warn ? "text-destructive" : ""}`}>
              {s.money ? formatCurrency(s.value) : s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
        <div className="p-5 border-b border-border"><p className="font-medium">Recent bills</p></div>
        <div className="divide-y divide-border">
          {recentBills.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No bills yet.</div>}
          {recentBills.map((b: any) => (
            <Link to={`/app/bills/${b._id}`} key={b._id} className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
              <div>
                <p className="font-medium">{b.billNumber}</p>
                <p className="text-xs text-muted-foreground">Lot {b.lotNumber} · {formatDate(b.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={b.paymentStatus} type="payment" />
                <p className="font-display font-semibold">{formatCurrency(b.totalAmount)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
