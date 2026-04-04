import { NavLink } from "react-router";
import {
  LayoutDashboard,
  ClipboardList,
  Plus,
  Search,
  BarChart3,
  User,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/cases", label: "Cases", icon: ClipboardList },
  { to: "/cases/new", label: "New Case", icon: Plus },
  { to: "/search", label: "Search", icon: Search },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const { isAdmin } = useAuth();
  const allItems = isAdmin
    ? [...navItems, { to: "/admin", label: "Admin", icon: Shield }]
    : navItems;

  return (
    <aside className="hidden lg:flex flex-col w-60 border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] h-screen sticky top-0">
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-[hsl(var(--border))]">
        <div className="w-8 h-8 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center">
          <ClipboardList className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight">CaseLog</span>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1">
        {allItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm"
                  : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]",
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-3 border-t border-[hsl(var(--border))]">
        <p className="text-[10px] text-[hsl(var(--muted-foreground))] text-center">
          Patient Case Tracker
        </p>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const { isAdmin } = useAuth();

  // Items for left side (before FAB)
  const leftItems = [
    navItems[0]!, // Dashboard
    navItems[1]!, // Cases
  ];

  // Items for right side (after FAB)
  const rightItems = isAdmin
    ? [
        navItems[3]!, // Search
        { to: "/admin", label: "Admin", icon: Shield },
      ]
    : [
        navItems[3]!, // Search
        navItems[4]!, // Profile
      ];

  // The center FAB item
  const fabItem = navItems[2]!; // New Case

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] flex items-end justify-around px-1 sm:px-2 pt-1 pb-1 safe-area-pb">
      {/* Left items */}
      {leftItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-0.5 py-1.5 px-2 sm:px-3 rounded-lg text-[10px] sm:text-xs font-medium transition-colors min-w-0 flex-1 max-w-[72px]",
              isActive
                ? "text-[hsl(var(--primary))]"
                : "text-[hsl(var(--muted-foreground))]",
            )
          }
        >
          <item.icon className="h-5 w-5" />
          <span>{item.label}</span>
        </NavLink>
      ))}

      {/* Center FAB — raised circle */}
      <NavLink
        to={fabItem.to}
        className={({ isActive }) =>
          cn(
            "flex items-center justify-center -mt-5 w-14 h-14 rounded-full shadow-lg transition-all",
            "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]",
            "hover:shadow-xl hover:scale-105 active:scale-95",
            isActive &&
              "ring-2 ring-[hsl(var(--primary))] ring-offset-2 ring-offset-[hsl(var(--card))]",
          )
        }
      >
        <Plus className="h-7 w-7" strokeWidth={2.5} />
      </NavLink>

      {/* Right items */}
      {rightItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-0.5 py-1.5 px-2 sm:px-3 rounded-lg text-[10px] sm:text-xs font-medium transition-colors min-w-0 flex-1 max-w-[72px]",
              isActive
                ? "text-[hsl(var(--primary))]"
                : "text-[hsl(var(--muted-foreground))]",
            )
          }
        >
          <item.icon className="h-5 w-5" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
