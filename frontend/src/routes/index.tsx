import React from "react";
import { RouteObject } from "react-router-dom";
import {
  DashboardOutlined,
  WalletOutlined,
  TransactionOutlined,
  AimOutlined,
  SettingOutlined,
} from "@ant-design/icons";

// 布局组件
import BasicLayout from "@/components/layout/BasicLayout";

// 页面组件
import DashboardPage from "@/pages/Dashboard";
import BalanceOverview from "@/pages/Wallet/BalanceOverview";
import AlertSettings from "@/pages/Wallet/AlertSettings";
import TransactionHistory from "@/pages/Transaction/History";
import FundFlow from "@/pages/Transaction/FundFlow";
import SniperConsole from "@/pages/SniperConsole";

// 路由项接口
export interface RouteItem extends RouteObject {
  name?: string;
  icon?: React.ReactNode;
  hidden?: boolean;
  children?: RouteItem[];
}

// 路由配置
export const routes: RouteItem[] = [
  {
    path: "/",
    element: <BasicLayout />,
    children: [
      {
        path: "/",
        redirect: "/dashboard",
      },
      {
        path: "/dashboard",
        name: "仪表盘",
        icon: <DashboardOutlined />,
        element: <DashboardPage />,
      },
      {
        path: "/wallet",
        name: "钱包监控",
        icon: <WalletOutlined />,
        children: [
          {
            path: "/wallet/overview",
            name: "余额概览",
            element: <BalanceOverview />,
          },
          {
            path: "/wallet/alerts",
            name: "告警设置",
            element: <AlertSettings />,
          },
        ],
      },
      {
        path: "/transaction",
        name: "交易分析",
        icon: <TransactionOutlined />,
        children: [
          {
            path: "/transaction/history",
            name: "交易历史",
            element: <TransactionHistory />,
          },
          {
            path: "/transaction/flow",
            name: "资金流向",
            element: <FundFlow />,
          },
        ],
      },
      {
        path: "/sniper",
        name: "狙击控制台",
        icon: <AimOutlined />,
        element: <SniperConsole />,
      },
      {
        path: "/settings",
        name: "系统设置",
        icon: <SettingOutlined />,
        hidden: true,
        element: <div>系统设置页面</div>,
      },
    ],
  },
];

// 获取菜单项
export const getMenuItems = (): RouteItem[] => {
  return routes[0].children?.filter((item) => !item.hidden) || [];
};

// 获取面包屑
export const getBreadcrumbs = (
  pathname: string
): { name: string; path: string }[] => {
  const breadcrumbs: { name: string; path: string }[] = [];

  const findBreadcrumbs = (items: RouteItem[], path: string): boolean => {
    for (const item of items) {
      if (item.path === path && item.name) {
        breadcrumbs.push({ name: item.name, path: item.path || "" });
        return true;
      }

      if (item.children) {
        if (findBreadcrumbs(item.children, path)) {
          if (item.name) {
            breadcrumbs.unshift({ name: item.name, path: item.path || "" });
          }
          return true;
        }
      }
    }
    return false;
  };

  findBreadcrumbs(routes[0].children || [], pathname);
  return breadcrumbs;
};

// 获取路由标题
export const getRouteTitle = (pathname: string): string => {
  const breadcrumbs = getBreadcrumbs(pathname);
  return breadcrumbs[breadcrumbs.length - 1]?.name || "Sol-Utils";
};
