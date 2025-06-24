import React, { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, Spin, Alert } from "antd";
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
  const [error, setError] = useState<string | null>(null);
  const [aggregatedData, setAggregatedData] = useState<AggregatedData | null>(
    null
  );
  const [historyData, setHistoryData] = useState<HistoryData[] | null>(null);
  const [latestBalance, setLatestBalance] = useState<BalanceData | null>(null);

  useEffect(() => {
    if (state.wallets.length > 0) {
      const fetchData = async () => {
        setLoading(true);
        setError(null);
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
          setError("获取仪表盘数据失败，请稍后重试");
          // 设置默认值以避免错误
          setAggregatedData(null);
          setHistoryData(null);
          setLatestBalance(null);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [state.wallets]);

  // 安全地获取数据，提供默认值
  const getWeeklyChange = () => {
    if (!aggregatedData?.price?.changePercent) return 0;
    const changePercent = parseFloat(aggregatedData.price.changePercent);
    return isNaN(changePercent) ? 0 : changePercent;
  };

  const getTotalValue = () => {
    return aggregatedData?.balance?.max ?? 0;
  };

  const getPriceChangePercent = () => {
    if (!aggregatedData?.price?.changePercent) return 0;
    const changePercent = parseFloat(aggregatedData.price.changePercent);
    return isNaN(changePercent) ? 0 : changePercent;
  };

  const weeklyChange = getWeeklyChange();

  // 如果没有连接钱包，显示提示
  if (state.wallets.length === 0) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.header}>
          <h1>仪表盘</h1>
          <p>Solana 钱包监控与分析系统</p>
        </div>
        <Alert
          message="未连接钱包"
          description="请先连接您的钱包以查看仪表盘数据"
          type="info"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>仪表盘</h1>
        <p>Solana 钱包监控与分析系统</p>
      </div>

      {error && (
        <Alert
          message="数据获取失败"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Spin spinning={loading}>
        {/* 统计卡片 */}
        <Row gutter={[24, 24]} className={styles.statsRow}>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.statCard}>
              <Statistic
                title="总钱包数"
                value={state.wallets.length}
                suffix="个"
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.statCard}>
              <Statistic
                title="总资产价值"
                value={getTotalValue()}
                precision={2}
                prefix="$"
                valueStyle={{ color: "#52c41a" }}
                suffix={
                  <span className={styles.changePositive}>
                    <ArrowUpOutlined /> +{getPriceChangePercent()}%
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
        <Row gutter={[24, 24]} className={styles.chartsRow}>
          <Col xs={24} lg={16}>
            <Card
              title="余额变化趋势"
              className={styles.chartCard}
              bodyStyle={{ padding: 0, height: "100%" }}
            >
              <div style={{ height: "400px", padding: "20px" }}>
                <BalanceChart historyData={historyData} />
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card
              title="资产分布"
              className={styles.chartCard}
              bodyStyle={{ padding: 0, height: "100%" }}
            >
              <div style={{ height: "400px", padding: "20px" }}>
                <AssetPieChart balanceData={latestBalance} />
              </div>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default DashboardPage;
