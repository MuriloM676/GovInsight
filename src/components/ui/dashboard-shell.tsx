"use client";

import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  Landmark,
  TrendingUp,
  Lightbulb,
  ChevronLeft,
  Menu,
  Moon,
  Sun,
  Home,
} from "lucide-react";
import { Button } from "./button";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/", label: "Início", icon: Home },
  { href: "/executivo", label: "Executivo", icon: BarChart3 },
  { href: "/gestao-fiscal", label: "Gestão Fiscal", icon: Landmark },
  { href: "/patrimonio", label: "Patrimônio", icon: TrendingUp },
  { href: "/insights", label: "Insights", icon: Lightbulb },
];

function DashboardSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-16" : "w-56",
      )}
    >
      <div className="flex h-14 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
          GI
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold tracking-tight">GovInsight</span>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggle}
          className="ml-auto shrink-0"
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          <ChevronLeft className={cn("size-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                collapsed && "justify-center px-2",
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-2">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="size-2 rounded-full bg-emerald-500 shrink-0" />
          {!collapsed && (
            <span className="text-xs text-sidebar-foreground/60">São Manuel, SP</span>
          )}
        </div>
      </div>
    </aside>
  );
}

function DashboardHeader({
  onMenuToggle,
  sidebarCollapsed,
}: {
  onMenuToggle: () => void;
  sidebarCollapsed: boolean;
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-4">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onMenuToggle}
        className="lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="size-4" />
      </Button>
      <div className="flex-1" />
      {mounted && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Alternar tema"
        >
          {theme === "dark" ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
        </Button>
      )}
    </header>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <DashboardSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <DashboardSidebar
              collapsed={false}
              onToggle={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          "lg:pl-56",
          collapsed && "lg:pl-16",
        )}
      >
        <DashboardHeader
          sidebarCollapsed={collapsed}
          onMenuToggle={() => setMobileOpen(!mobileOpen)}
        />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
