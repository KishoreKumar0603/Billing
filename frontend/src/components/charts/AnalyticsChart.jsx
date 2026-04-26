import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { motion } from "framer-motion";

export function AnalyticsChart({
  data,
  color = "hsl(var(--primary))",
  formatter,
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.6,
      }}
      className="h-[280px] w-full"
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            bottom: 0,
            left: -10,
          }}
        >
          <defs>
            <linearGradient
              id="fill"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={color}
                stopOpacity={0.35}
              />

              <stop
                offset="100%"
                stopColor={color}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            vertical={false}
          />

          <XAxis
            dataKey="label"
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={
              formatter
            }
          />

          <Tooltip
            contentStyle={{
              background:
                "hsl(var(--popover))",

              border:
                "1px solid hsl(var(--border))",

              borderRadius: 12,

              fontSize: 12,
            }}
            formatter={(v) => [
              formatter
                ? formatter(v)
                : v,
              "",
            ]}
          />

          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            fill="url(#fill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}