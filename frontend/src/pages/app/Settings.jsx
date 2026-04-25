import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Moon, Sun, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/stores/auth.store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  phone: z.string().trim().max(20).optional(),
});
type Form = z.infer<typeof schema>;

export default function Settings() {
  const { user, updateProfile, logout, theme, setTheme } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name, email: user?.email, phone: user?.phone || "" },
  });
  const onSubmit = async (v: Form) => { try { await updateProfile(v); toast.success("Profile updated"); } catch { toast.error("Failed to update"); } };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile and preferences.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-16 w-16"><AvatarFallback className="bg-gradient-primary text-primary-foreground font-display text-xl font-bold">{user?.name?.[0]?.toUpperCase() || "U"}</AvatarFallback></Avatar>
          <div><p className="font-display font-bold text-lg">{user?.name}</p><p className="text-sm text-muted-foreground">{user?.email}</p></div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>Full name</Label><Input {...register("name")} className="mt-1.5 h-11" />{errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}</div>
          <div><Label>Email</Label><Input type="email" {...register("email")} className="mt-1.5 h-11" />{errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}</div>
          <div><Label>Phone</Label><Input {...register("phone")} className="mt-1.5 h-11" /></div>
          <div className="md:col-span-2 flex justify-end">
            <Button disabled={isSubmitting} className="bg-gradient-primary shadow-elegant">{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}</Button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-card p-6 space-y-4">
        <p className="font-medium">Preferences</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-soft text-primary">{theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}</div>
            <div><p className="text-sm font-medium">Dark mode</p><p className="text-xs text-muted-foreground">Toggle between light and dark themes.</p></div>
          </div>
          <Switch checked={theme === "dark"} onCheckedChange={(c) => setTheme(c ? "dark" : "light")} />
        </div>
      </div>

      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
        <p className="font-medium">Sign out</p>
        <p className="text-sm text-muted-foreground mt-1">End your current session.</p>
        <Button variant="outline" className="mt-4 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={async () => { await logout(); toast.success("Signed out"); navigate("/login"); }}>
          <LogOut className="h-4 w-4 mr-1" /> Logout
        </Button>
      </div>
    </div>
  );
}
