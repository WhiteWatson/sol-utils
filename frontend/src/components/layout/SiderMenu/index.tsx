import React from "react";
import { Layout, Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { getMenuItems } from "@/routes";
import styles from "./index.module.less";

const { Sider } = Layout;

const SiderMenu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useApp();
  const menuItems = getMenuItems();

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const getSelectedKeys = (): string[] => {
    const pathname = location.pathname;
    const keys: string[] = [];

    const findKeys = (items: any[], path: string): boolean => {
      for (const item of items) {
        if (item.path === path) {
          keys.push(item.path);
          return true;
        }
        if (item.children) {
          if (findKeys(item.children, path)) {
            keys.push(item.path);
            return true;
          }
        }
      }
      return false;
    };

    findKeys(menuItems, pathname);
    return keys;
  };

  const getOpenKeys = (): string[] => {
    const pathname = location.pathname;
    const keys: string[] = [];

    const findOpenKeys = (items: any[], path: string): boolean => {
      for (const item of items) {
        if (item.children) {
          if (findOpenKeys(item.children, path)) {
            keys.push(item.path);
            return true;
          }
        }
      }
      return false;
    };

    findOpenKeys(menuItems, pathname);
    return keys;
  };

  const renderMenuItems = (items: any[]) => {
    return items.map((item) => {
      if (item.children) {
        return {
          key: item.path,
          icon: item.icon,
          label: item.name,
          children: renderMenuItems(item.children),
        };
      }
      return {
        key: item.path,
        icon: item.icon,
        label: item.name,
      };
    });
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={state.collapsed}
      className={styles.sider}
      width={240}
      collapsedWidth={80}
    >
      <Menu
        mode="inline"
        selectedKeys={getSelectedKeys()}
        defaultOpenKeys={getOpenKeys()}
        items={renderMenuItems(menuItems)}
        onClick={handleMenuClick}
        className={styles.menu}
      />
    </Sider>
  );
};

export default SiderMenu;
