import React, { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, Progress, Spin } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import { useWallet } from "../../contexts/WalletContext";
import BalanceChart from "../../components/wallet/BalanceChart";
import AssetPieChart from "../../components/wallet/AssetPieChart";
import {
  api,
  AggregatedData,
  HistoryData,
  BalanceData,
} from "../../services/api";
import styles from "./index.module.less";

const DashboardPage: React.FC = () => {
  const { state } = useWallet();
  const [loading, setLoading] = useState(false);
  const [aggregatedData, setAggregatedData] = useState<AggregatedData | null>(
    null
  );
  const [historyData, setHistoryData] = useState<HistoryData[] | null>(null);
  const [latestBalance, setLatestBalance] = useState<BalanceData | null>(null);

  useEffect(() => {
    if (state.wallets.length > 0) {
      const fetchData = async () => {
        setLoading(true);
        try {
          // Note: The backend only supports one wallet, we use the first one for now
          const currentWallet = state.wallets[0].address;
          const [aggData, histData, latestData] = await Promise.all([
            api.getAggregatedBalance(currentWallet),
            api.getBalanceHistory(currentWallet, "7d"),
            api.getLatestBalance(currentWallet),
          ]);
          setAggregatedData(aggData);
          setHistoryData(histData);
          setLatestBalance(latestData);
        } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [state.wallets]);

  // 模拟数据
  const mockData = {
    totalWallets: 3,
    totalValue: 125000,
    dailyChange: 2.5,
    weeklyChange: -1.2,
    monthlyChange: 8.7,
  };

  const weeklyChange = aggregatedData?.price.changePercent ?? 0;

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>仪表盘</h1>
        <p>Solana 钱包监控与分析系统</p>
      </div>

      <Spin spinning={loading}>
        {/* 统计卡片 */}
        <Row gutter={[16, 16]} className={styles.statsRow}>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.statCard}>
              <Statistic
                title="总钱包数"
                value={state.wallets.length}
                suffix="个"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.statCard}>
              <Statistic
                title="总资产价值"
                value={aggregatedData?.balance.max ?? 0}
                precision={2}
                prefix="$"
                suffix={
                  <span className={styles.changePositive}>
                    <ArrowUpOutlined /> +
                    {aggregatedData?.price.changePercent ?? 0}%
                  </span>
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.statCard}>
              <Statistic
                title="周变化"
                value={weeklyChange}
                precision={1}
                prefix={
                  weeklyChange >= 0 ? (
                    <ArrowUpOutlined />
                  ) : (
                    <ArrowDownOutlined />
                  )
                }
                suffix="%"
                valueStyle={{
                  color: weeklyChange >= 0 ? "#3f8600" : "#cf1322",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.statCard}>
              <Statistic
                title="月变化"
                value={0}
                precision={1}
                prefix={<ArrowUpOutlined />}
                suffix="%"
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
        </Row>

        {/* 图表区域 */}
        <Row gutter={[16, 16]} className={styles.chartsRow}>
          <Col xs={24} lg={16}>
            <Card title="余额变化趋势" className={styles.chartCard}>
              <BalanceChart historyData={historyData} />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="资产分布" className={styles.chartCard}>
              <AssetPieChart balanceData={latestBalance} />
            </Card>
          </Col>
        </Row>
      </Spin>

      {/* 快速操作 */}
      <Row gutter={[16, 16]} className={styles.actionsRow}>
        <Col xs={24} md={8}>
          <Card title="系统状态" className={styles.statusCard}>
            <div className={styles.statusItem}>
              <span>API 连接</span>
              <Progress percent={95} size="small" status="active" />
            </div>
            <div className={styles.statusItem}>
              <span>数据同步</span>
              <Progress percent={88} size="small" />
            </div>
            <div className={styles.statusItem}>
              <span>告警系统</span>
              <Progress percent={100} size="small" status="success" />
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="最近活动" className={styles.activityCard}>
            <div className={styles.activityItem}>
              <span className={styles.activityTime}>2分钟前</span>
              <span className={styles.activityText}>钱包余额更新</span>
            </div>
            <div className={styles.activityItem}>
              <span className={styles.activityTime}>5分钟前</span>
              <span className={styles.activityText}>新钱包连接</span>
            </div>
            <div className={styles.activityItem}>
              <span className={styles.activityTime}>10分钟前</span>
              <span className={styles.activityText}>价格告警触发</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="快速操作" className={styles.quickActionsCard}>
            <div className={styles.actionButtons}>
              <button className={styles.actionButton}>添加钱包</button>
              <button className={styles.actionButton}>查看交易</button>
              <button className={styles.actionButton}>设置告警</button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
