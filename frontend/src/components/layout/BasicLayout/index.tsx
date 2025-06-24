import React from "react";
import { Layout } from "antd";
import { Outlet, useLocation } from "react-router-dom";
import HeaderBar from "../HeaderBar";
import SiderMenu from "../SiderMenu";
import styles from "./index.module.less";

const { Content } = Layout;

const BasicLayout: React.FC = () => {
  const location = useLocation();

  return (
    <Layout className={styles.root}>
      <HeaderBar />
      <Layout>
        <SiderMenu />
        <Content className={styles.content} key={location.pathname}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default BasicLayout;
