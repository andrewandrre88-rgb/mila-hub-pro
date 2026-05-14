import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, ShoppingCart, Users, Package, Factory, Truck,
  CreditCard, FileText, BarChart3, Bell, Settings, Boxes
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useI18n, type TKey } from "@/lib/i18n";

const main = [
  { tkey: "nav.dashboard" as TKey, url: "/", icon: LayoutDashboard },
  { tkey: "nav.orders" as TKey, url: "/orders", icon: ShoppingCart },
  { tkey: "nav.customers" as TKey, url: "/customers", icon: Users },
  { tkey: "nav.products" as TKey, url: "/products", icon: Package },
];
const ops = [
  { tkey: "nav.production" as TKey, url: "/production", icon: Factory },
  { tkey: "nav.shipping" as TKey, url: "/shipping", icon: Truck },
  { tkey: "nav.payments" as TKey, url: "/payments", icon: CreditCard },
  { tkey: "nav.documents" as TKey, url: "/documents", icon: FileText },
];
const insights = [
  { tkey: "nav.analytics" as TKey, url: "/analytics", icon: BarChart3 },
  { tkey: "nav.notifications" as TKey, url: "/notifications", icon: Bell },
  { tkey: "nav.settings" as TKey, url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { user, signOut } = useAuth();
  const { t } = useI18n();
  const isActive = (u: string) => u === "/" ? path === "/" : path.startsWith(u);

  const renderGroup = (label: string, items: typeof main) => (
    <SidebarGroup>
      {!collapsed && <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((it) => (
            <SidebarMenuItem key={it.url}>
              <SidebarMenuButton asChild isActive={isActive(it.url)} className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary data-[active=true]:font-medium hover:bg-sidebar-accent/60">
                <Link to={it.url} className="flex items-center gap-3">
                  <it.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{t(it.tkey)}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-elegant">
            <Boxes className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-semibold text-sidebar-foreground">MILA PLASTICS</div>
              <div className="text-xs text-sidebar-foreground/60">Quzhou, China</div>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {renderGroup(t("nav.main"), main)}
        {renderGroup(t("nav.operations"), ops)}
        {renderGroup(t("nav.insights"), insights)}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        {!collapsed && user && (
          <div className="flex items-center justify-between gap-2 px-2">
            <div className="min-w-0">
              <div className="truncate text-sm text-sidebar-foreground">{user.email}</div>
            </div>
            <Button size="sm" variant="ghost" onClick={signOut} className="text-sidebar-foreground/70 hover:text-sidebar-foreground">Sign out</Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
