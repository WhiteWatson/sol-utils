import React from "react";
import { Row, Col, Card, Statistic, Button, Space } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useWallet } from "@/contexts/WalletContext";
import BalanceCard from "@/components/wallet/BalanceCard";
import BalanceChart from "@/components/wallet/BalanceChart";
import AssetPieChart from "@/components/wallet/AssetPieChart";
import styles from "./index.module.less";

const BalanceOverview: React.FC = () => {
  const { state, getTotalValue } = useWallet();

  const handleRefresh = () => {
    // 刷新余额数据
    console.log("刷新余额数据");
  };

  return (
    <div className={styles.balanceOverview}>
      <div className={styles.header}>
        <div className={styles.title}>
          <h1>余额概览</h1>
          <p>监控您的 Solana 钱包余额变化</p>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={state.loading}
          >
            刷新
          </Button>
        </Space>
      </div>

      {/* 余额卡片 */}
      <Row gutter={[16, 16]} className={styles.balanceCards}>
        <Col xs={24} sm={8}>
          <BalanceCard
            title="SOL"
            balance={130}
            price={100}
            change={2.5}
            color="#9945FF"
          />
        </Col>
        <Col xs={24} sm={8}>
          <BalanceCard
            title="USDC"
            balance={70000}
            price={1}
            change={-1.2}
            color="#2775CA"
          />
        </Col>
        <Col xs={24} sm={8}>
          <BalanceCard
            title="USDT"
            balance={42000}
            price={1}
            change={0.8}
            color="#26A17B"
          />
        </Col>
      </Row>

      {/* 总资产统计 */}
      <Row gutter={[16, 16]} className={styles.totalStats}>
        <Col xs={24} md={8}>
          <Card className={styles.statCard}>
            <Statistic
              title="总资产价值"
              value={125000}
              precision={2}
              prefix="$"
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className={styles.statCard}>
            <Statistic
              title="24小时变化"
              value={2.5}
              precision={1}
              prefix="+"
              suffix="%"
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className={styles.statCard}>
            <Statistic
              title="7天变化"
              value={-1.2}
              precision={1}
              suffix="%"
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} className={styles.chartsRow}>
        <Col xs={24} lg={16}>
          <Card title="余额变化趋势" className={styles.chartCard}>
            <BalanceChart />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="资产分布" className={styles.chartCard}>
            <AssetPieChart />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BalanceOverview;
