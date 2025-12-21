import { useState } from "react";
import { NavLink as RouterNavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Building2,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Properties", href: "/properties", icon: Building2 },
  { name: "Reports", href: "/reports", icon: TrendingUp },
];

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center h-16 px-4 border-b border-sidebar-border",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
              <span className="text-sm font-bold text-sidebar-primary-foreground">C</span>
            </div>
            <div>
              <span className="font-semibold text-sidebar-foreground">CirclePe</span>
              <span className="text-xs text-sidebar-foreground/60 block">× Truliv</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <span className="text-sm font-bold text-sidebar-primary-foreground">C</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <RouterNavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-sidebar-primary")} />
              {!collapsed && <span>{item.name}</span>}
            </RouterNavLink>
          );
        })}
      </nav>

      {/* User Info & Sign Out */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        {/* User Info */}
        <div className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 bg-sidebar-accent/30",
          collapsed && "justify-center px-0"
        )}>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary shrink-0">
            <User className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">
                {user?.email || 'User'}
              </p>
            </div>
          )}
        </div>

        {/* Sign Out */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className={cn(
            "w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Sign Out</span>}
        </Button>

        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
            collapsed && "justify-center px-0"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
