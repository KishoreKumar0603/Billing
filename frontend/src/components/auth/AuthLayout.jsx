import { motion } from "framer-motion";

import { Logo } from "@/components/common/Logo";

export function AuthLayout({
  title,
  subtitle,
  children,
}) {
  return (
    <div className="relative min-h-screen flex flex-col lg:flex-row overflow-hidden bg-background">
      <div className="flex-1 flex flex-col justify-center px-6 py-10 lg:px-16">
        <div className="w-full max-w-md mx-auto">
          <Logo className="mb-10" />

          <motion.div
            initial={{
              opacity: 0,
              y: 16,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
          >
            <h1 className="font-display text-3xl font-bold tracking-tight">
              {title}
            </h1>

            {subtitle && (
              <p className="mt-2 text-muted-foreground">
                {subtitle}
              </p>
            )}

            <div className="mt-8">
              {children}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 relative bg-gradient-hero text-white overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-primary-glow blur-3xl animate-float" />

          <div
            className="absolute bottom-20 right-10 h-80 w-80 rounded-full bg-primary blur-3xl animate-float"
            style={{
              animationDelay:
                "2s",
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div />

          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.3,
            }}
          >
            <h2 className="font-display text-4xl font-bold leading-tight text-white">
              Run your textile
              business
              <br />
              like a{" "}
              <span className="bg-gradient-to-r from-white to-primary-glow bg-clip-text text-transparent">
                modern SaaS.
              </span>
            </h2>

            <p className="mt-4 text-white/70 max-w-md">
              Delivery
              challans, lot
              tracking,
              customer
              ledgers and
              real-time
              analytics —
              all in one
              elegant
              workspace.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                {
                  k: "2.4k+",
                  v: "Bills",
                },

                {
                  k: "98%",
                  v: "Uptime",
                },

                {
                  k: "180+",
                  v:
                    "Businesses",
                },
              ].map((s) => (
                <div
                  key={s.v}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                >
                  <p className="font-display text-2xl font-bold text-white">
                    {s.k}
                  </p>

                  <p className="text-xs text-white/60 mt-1">
                    {s.v}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}