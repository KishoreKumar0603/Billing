import {
  useEffect,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Coins,
  FileText,
  Wallet,
  TrendingUp,
} from "lucide-react";

import { dashboardService } from "@/services/dashboard.service";

import {
  formatCurrency,
  formatNumber,
} from "@/lib/format";

import { Shimmer } from "@/components/common/Skeleton";

import { AnalyticsChart } from "@/components/charts/AnalyticsChart";

import { Link } from "react-router-dom";

const cards = [
  {
    key: "totalOrders",
    label: "Total Orders",
    icon: FileText,
    gradient:
      "from-indigo-500 to-violet-500",
    format: formatNumber,
  },

  {
    key: "completedOrders",
    label: "Completed",
    icon: CheckCircle2,
    gradient:
      "from-emerald-500 to-teal-500",
    format: formatNumber,
  },

  {
    key: "workingOrders",
    label: "In Progress",
    icon: Clock,
    gradient:
      "from-amber-500 to-orange-500",
    format: formatNumber,
  },

  {
    key: "totalRevenue",
    label: "Revenue",
    icon: Coins,
    gradient:
      "from-fuchsia-500 to-pink-500",
    format: formatCurrency,
  },

  {
    key: "pendingPayments",
    label: "Pending Payments",
    icon: Wallet,
    gradient:
      "from-rose-500 to-red-500",
    format: formatCurrency,
  },

  {
    key: "totalBusinessAmount",
    label: "Total Business",
    icon: TrendingUp,
    gradient:
      "from-sky-500 to-blue-500",
    format: formatCurrency,
  },
];

export default function Dashboard() {
  const [summary, setSummary] =
    useState(null);

  const [orders, setOrders] =
    useState([]);

  const [revenue, setRevenue] =
    useState([]);

  useEffect(() => {
    dashboardService
      .summary()
      .then(setSummary);

    dashboardService
      .orders("30days")
      .then((r) =>
        setOrders(r.analytics)
      );

    dashboardService
      .revenue("30days")
      .then((r) =>
        setRevenue(r.analytics)
      );
  }, []);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold">
            Welcome back 👋
          </h1>

          <p className="text-muted-foreground mt-1">
            Here's what's happening
            with your business
            today.
          </p>
        </div>

        {summary && (
          <div className="rounded-2xl border border-border bg-card p-4 shadow-card flex items-center gap-4">
            <div>
              <p className="text-xs text-muted-foreground">
                Today
              </p>

              <p className="font-display font-bold text-xl">
                {formatCurrency(
                  summary.today
                    .revenue
                )}
              </p>
            </div>

            <div className="h-10 w-px bg-border" />

            <div>
              <p className="text-xs text-muted-foreground">
                Orders
              </p>

              <p className="font-display font-bold text-xl">
                {
                  summary.today
                    .orders
                }
              </p>
            </div>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;

          const value =
            summary
              ? summary
                  .overview[
                  c.key
                ]
              : null;

          return (
            <motion.div
              key={c.key}
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay:
                  i * 0.05,
              }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-elegant transition-all"
            >
              <div
                className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${c.gradient} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity`}
              />

              <div className="flex items-start justify-between relative">
                <div
                  className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${c.gradient} text-white shadow-sm`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                {c.label}
              </p>

              {value ===
              null ? (
                <Shimmer className="h-8 w-24 mt-1" />
              ) : (
                <p className="font-display text-2xl font-bold mt-0.5">
                  {c.format(
                    value
                  )}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium">
                Orders — last
                30 days
              </p>

              <p className="text-xs text-muted-foreground">
                Completed
                orders trend
              </p>
            </div>

            <Link
              to="/app/analytics"
              className="text-xs text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          {orders.length ? (
            <AnalyticsChart
              data={orders}
              color="hsl(var(--primary))"
            />
          ) : (
            <Shimmer className="h-[280px]" />
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium">
                Revenue — last
                30 days
              </p>

              <p className="text-xs text-muted-foreground">
                Daily received
                amount
              </p>
            </div>

            <Link
              to="/app/analytics"
              className="text-xs text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          {revenue.length ? (
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
        </div>
      </div>
    </div>
  );
}