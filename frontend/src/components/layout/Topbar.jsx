import { Menu, Moon, Sun, Search, Bell } from "lucide-react";

import { useAuth } from "@/stores/auth.store";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { Input } from "@/components/ui/input";

export function Topbar({ onMenu }) {
  const { user, theme, setTheme } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 backdrop-blur-xl px-4 lg:px-6">
      <button onClick={onMenu} className="hover:cursor-pointer lg:hidden ">
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative hidden md:block w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          placeholder="Search bills, customers, lots..."
          className="pl-9 bg-secondary border-0 h-10"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="grid h-10 w-10 place-items-center rounded-lg hover:bg-secondary transition-colors hover:cursor-pointer"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        <button className="relative grid h-10 w-10 place-items-center rounded-lg hover:bg-secondary transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent" />
        </button>

        <div className="flex items-center gap-2.5 pl-2 border-l border-border">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-gradient-primary text-primary-foreground font-medium text-sm">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-tight">
              {user?.name || "User"}
            </p>

            <p className="text-xs text-muted-foreground leading-tight">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
