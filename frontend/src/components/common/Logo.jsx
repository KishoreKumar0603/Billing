import { motion } from "framer-motion";
export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <motion.div
        initial={{ rotate: -10, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }}
        className="relative h-9 w-9 rounded-xl bg-gradient-primary shadow-elegant grid place-items-center"
      >
        <span className="text-primary-foreground font-display font-bold text-lg">B</span>
        <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-accent animate-pulse-glow" />
      </motion.div>
      <div className="flex flex-col leading-none">
        <span className="font-display font-bold text-lg tracking-tight">BillingIT</span>
        <span className="text-[10px] text-muted-foreground tracking-wider uppercase">Textile Suite</span>
      </div>
    </div>
  );
}
