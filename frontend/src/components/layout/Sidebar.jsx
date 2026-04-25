import { NavLink } from "react-router-dom";
import { LayoutDashboard, FileText, Users, BarChart3, Settings, LogOut, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/common/Logo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/stores/auth.store";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const nav = [
  { to: "/app/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/app/bills", icon: FileText, label: "Bills" },
  { to: "/app/customers", icon: Users, label: "Customers" },
  { to: "/app/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/app/settings", icon: Settings, label: "Settings" },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();
  const handleLogout = async () => { await logout(); toast.success("Signed out"); navigate("/login"); };

  const content = (
    <aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center justify-between p-5">
        <Logo />
        <button onClick={onClose} className="lg:hidden text-sidebar-foreground"><X className="h-5 w-5" /></button>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map((item) => (
          <NavLink key={item.to} to={item.to} onClick={onClose}
            className={({ isActive }) => cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            )}>
            {({ isActive }) => (
              <>
                <span className={cn("grid h-8 w-8 place-items-center rounded-lg transition-all",
                  isActive ? "bg-gradient-primary text-primary-foreground shadow-elegant" : "bg-transparent")}>
                  <item.icon className="h-4 w-4" />
                </span>
                <span>{item.label}</span>
                {isActive && <motion.span layoutId="dot" className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="p-3">
        <div className="mb-2 rounded-xl bg-gradient-soft p-4">
          <p className="text-xs font-medium text-foreground">Need help?</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Contact support anytime for assistance.</p>
        </div>
        <button onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:block">{content}</div>
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose} className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm lg:hidden" />
            <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden">{content}</motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
