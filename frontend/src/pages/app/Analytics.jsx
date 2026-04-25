import {
  useEffect,
  useState,
} from "react";

import { motion } from "framer-motion";

import { AnalyticsChart } from "@/components/charts/AnalyticsChart";

import { dashboardService } from "@/services/dashboard.service";

import { Shimmer } from "@/components/common/Skeleton";

import { formatCurrency } from "@/lib/format";

import { cn } from "@/lib/utils";

const ranges = [
  {
    key: "7days",
    label: "7D",
  },
  {
    key: "30days",
    label: "30D",
  },
  {
    key: "90days",
    label: "90D",
  },
  {
    key: "1year",
    label: "1Y",
  },
];

function Card({
  title,
  subtitle,
  range,
  onRange,
  children,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="rounded-2xl border border-border bg-card p-5 shadow-card"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-medium">
            {title}
          </p>

          <p className="text-xs text-muted-foreground">
            {subtitle}
          </p>
        </div>

        <div className="flex gap-1 rounded-lg border border-border p-1">
          {ranges.map((r) => (
            <button
              key={r.key}
              onClick={() =>
                onRange(r.key)
              }
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",

                range === r.key
                  ? "bg-gradient-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {children}
    </motion.div>
  );
}

export default function Analytics() {
  const [ordersRange, setOrdersRange] =
    useState("30days");

  const [
    revenueRange,
    setRevenueRange,
  ] = useState("30days");

  const [orders, setOrders] =
    useState(null);

  const [revenue, setRevenue] =
    useState(null);

  useEffect(() => {
    setOrders(null);

    dashboardService
      .orders(ordersRange)
      .then((r) =>
        setOrders(r.analytics)
      );
  }, [ordersRange]);

  useEffect(() => {
    setRevenue(null);

    dashboardService
      .revenue(revenueRange)
      .then((r) =>
        setRevenue(r.analytics)
      );
  }, [revenueRange]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold">
          Analytics
        </h1>

        <p className="text-muted-foreground mt-1">
          Insights into your orders
          and revenue.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card
          title="Completed Orders"
          subtitle="Order volume over time"
          range={ordersRange}
          onRange={setOrdersRange}
        >
          {orders ? (
            <AnalyticsChart
              data={orders}
              color="hsl(var(--primary))"
            />
          ) : (
            <Shimmer className="h-[280px]" />
          )}
        </Card>

        <Card
          title="Revenue"
          subtitle="Received amount over time"
          range={revenueRange}
          onRange={setRevenueRange}
        >
          {revenue ? (
            <AnalyticsChart
              data={revenue}
              color="hsl(var(--accent))"
              formatter={(v) =>
                formatCurrency(v)
              }
            />
          ) : (
            <Shimmer className="h-[280px]" />
          )}
        </Card>
      </div>
    </div>
  );
}