import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "en" | "zh";
export type Currency = "USD" | "CNY";

// Approximate CNY per 1 USD; adjust as needed.
export const USD_TO_CNY = 7.2;

const dict = {
  en: {
    "nav.main": "Main",
    "nav.operations": "Operations",
    "nav.insights": "Insights",
    "nav.dashboard": "Dashboard",
    "nav.orders": "Orders",
    "nav.customers": "Customers",
    "nav.products": "Products",
    "nav.production": "Production",
    "nav.shipping": "Shipping",
    "nav.payments": "Payments",
    "nav.documents": "Documents",
    "nav.analytics": "Analytics",
    "nav.notifications": "Notifications",
    "nav.settings": "Settings",
    "header.search": "Search orders, customers, products…",
    "header.signout": "Sign out",
    "dash.title": "Operations overview",
    "dash.subtitle": "Welcome back. Here's what's happening at the factory today.",
    "dash.newOrder": "+ New order",
    "stat.totalOrders": "Total orders",
    "stat.inProduction": "In production",
    "stat.shipped": "Shipped",
    "stat.pendingPayments": "Pending payments",
    "card.monthlyRevenue": "Monthly revenue",
    "card.last12": "Last 12 months",
    "card.shippingMix": "Shipping mix",
    "card.last30": "Last 30 days",
    "card.production": "Production output",
    "card.productionSub": "Units assembled this week",
    "card.quickStats": "Quick stats",
    "card.recentOrders": "Recent orders",
    "card.recentOrdersSub": "Latest orders across the workshop",
    "card.viewAll": "View all",
    "table.order": "Order",
    "table.customer": "Customer",
    "table.country": "Country",
    "table.total": "Total",
    "table.status": "Status",
    "empty.orders": "No orders yet.",
    "empty.createFirst": "Create your first order →",
    "qs.activeCustomers": "Active customers",
    "qs.skus": "SKUs in stock",
    "qs.capacity": "Production capacity",
    "qs.onTime": "On-time delivery",
    "ship.sea": "Sea Freight",
    "ship.air": "Air Freight",
    "ship.express": "Express",
    "ship.land": "Land",
    "lang.label": "Language",
    "currency.label": "Currency",
  },
  zh: {
    "nav.main": "主菜单",
    "nav.operations": "运营",
    "nav.insights": "洞察",
    "nav.dashboard": "仪表盘",
    "nav.orders": "订单",
    "nav.customers": "客户",
    "nav.products": "产品",
    "nav.production": "生产",
    "nav.shipping": "物流",
    "nav.payments": "付款",
    "nav.documents": "文档",
    "nav.analytics": "分析",
    "nav.notifications": "通知",
    "nav.settings": "设置",
    "header.search": "搜索订单、客户、产品…",
    "header.signout": "退出登录",
    "dash.title": "运营概览",
    "dash.subtitle": "欢迎回来。这是工厂今日的最新动态。",
    "dash.newOrder": "+ 新建订单",
    "stat.totalOrders": "订单总数",
    "stat.inProduction": "生产中",
    "stat.shipped": "已发货",
    "stat.pendingPayments": "待收款",
    "card.monthlyRevenue": "月度收入",
    "card.last12": "近 12 个月",
    "card.shippingMix": "运输方式",
    "card.last30": "近 30 天",
    "card.production": "生产产量",
    "card.productionSub": "本周装配数量",
    "card.quickStats": "快速统计",
    "card.recentOrders": "最近订单",
    "card.recentOrdersSub": "车间最新订单",
    "card.viewAll": "查看全部",
    "table.order": "订单",
    "table.customer": "客户",
    "table.country": "国家",
    "table.total": "总额",
    "table.status": "状态",
    "empty.orders": "暂无订单。",
    "empty.createFirst": "创建第一笔订单 →",
    "qs.activeCustomers": "活跃客户",
    "qs.skus": "库存 SKU",
    "qs.capacity": "产能",
    "qs.onTime": "准时交付率",
    "ship.sea": "海运",
    "ship.air": "空运",
    "ship.express": "快递",
    "ship.land": "陆运",
    "lang.label": "语言",
    "currency.label": "币种",
  },
} as const;

export type TKey = keyof typeof dict["en"];

type Ctx = {
  lang: Lang;
  currency: Currency;
  setLang: (l: Lang) => void;
  setCurrency: (c: Currency) => void;
  t: (key: TKey) => string;
  money: (usd: number, sourceCurrency?: string) => string;
};

const AppI18nCtx = createContext<Ctx | null>(null);

export function AppI18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [currency, setCurrencyState] = useState<Currency>("USD");

  useEffect(() => {
    const l = (localStorage.getItem("mila.lang") as Lang) || "en";
    const c = (localStorage.getItem("mila.currency") as Currency) || "USD";
    setLangState(l); setCurrencyState(c);
    document.documentElement.lang = l === "zh" ? "zh-CN" : "en";
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("mila.lang", l);
    document.documentElement.lang = l === "zh" ? "zh-CN" : "en";
  };
  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("mila.currency", c);
  };

  const value = useMemo<Ctx>(() => ({
    lang, currency, setLang, setCurrency,
    t: (k) => dict[lang][k] ?? dict.en[k] ?? k,
    money: (amount, sourceCurrency = "USD") => {
      // Convert source -> USD baseline
      let usd = amount;
      if (sourceCurrency === "CNY") usd = amount / USD_TO_CNY;
      const display = currency === "CNY" ? usd * USD_TO_CNY : usd;
      const locale = lang === "zh" ? "zh-CN" : "en-US";
      return new Intl.NumberFormat(locale, {
        style: "currency", currency, maximumFractionDigits: 0,
      }).format(display);
    },
  }), [lang, currency]);

  return <AppI18nCtx.Provider value={value}>{children}</AppI18nCtx.Provider>;
}

export function useI18n() {
  const ctx = useContext(AppI18nCtx);
  if (!ctx) throw new Error("useI18n must be used within AppI18nProvider");
  return ctx;
}
