import React from "react";
import { Layout, Space, Button, Dropdown, Avatar, Badge } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { useApp } from "../../../contexts/AppContext";
import WalletConnector from "./WalletConnector";
import LanguageSwitcher from "./LanguageSwitcher";
import styles from "./index.module.less";

const { Header } = Layout;

const HeaderBar: React.FC = () => {
  const { state, toggleCollapsed } = useApp();

  const userMenuItems = [
    {
      key: "profile",
      label: "个人资料",
      icon: <UserOutlined />,
    },
    {
      key: "settings",
      label: "设置",
      icon: <SettingOutlined />,
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      label: "退出登录",
    },
  ];

  return (
    <Header className={styles.header}>
      <div className={styles.left}>
        <Button
          type="text"
          icon={state.collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleCollapsed}
          className={styles.trigger}
        />
        <div className={styles.logo}>
          <span className={styles.title}>Sol-Utils</span>
        </div>
      </div>

      <div className={styles.right}>
        <Space size="middle">
          <WalletConnector />
          <LanguageSwitcher />

          <Badge count={5} size="small">
            <Button
              type="text"
              icon={<BellOutlined />}
              className={styles.iconButton}
            />
          </Badge>

          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            arrow
          >
            <Avatar icon={<UserOutlined />} className={styles.avatar} />
          </Dropdown>
        </Space>
      </div>
    </Header>
  );
};

export default HeaderBar;
