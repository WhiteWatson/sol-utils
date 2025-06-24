import React, { useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Button,
  Space,
  Empty,
  Spin,
  Alert,
} from "antd";
import { ReloadOutlined, WalletOutlined } from "@ant-design/icons";
import { useWallet } from "@/contexts/WalletContext";
import BalanceCard from "@/components/wallet/BalanceCard";
import BalanceChart from "@/components/wallet/BalanceChart";
import AssetPieChart from "@/components/wallet/AssetPieChart";
import { BalanceData as ApiBalanceData, HistoryData } from "@/services/api";
import styles from "./index.module.less";

const BalanceOverview: React.FC = () => {
  const { state, getTotalValue, refreshAllBalances } = useWallet();

  const handleRefresh = async () => {
    await refreshAllBalances();
  };

  // 获取所有钱包的总资产价值
  const getTotalAssetsValue = () => {
    return state.wallets.reduce((total, wallet) => {
      return total + getTotalValue(wallet.address);
    }, 0);
  };

  // 获取所有代币余额
  const getAllTokenBalances = () => {
    const allTokens = new Map<
      string,
      {
        symbol: string;
        name: string;
        balance: number;
        price: number;
        usdValue: number;
        color: string;
      }
    >();

    state.wallets.forEach((wallet) => {
      const balance = state.balances[wallet.address];
      if (balance) {
        balance.tokenBalances.forEach((token) => {
          const existing = allTokens.get(token.symbol);
          if (existing) {
            existing.balance += token.balance;
            existing.usdValue += token.usdValue;
          } else {
            allTokens.set(token.symbol, { ...token });
          }
        });
      }
    });

    return Array.from(allTokens.values());
  };

  // 获取主要代币的余额卡片数据
  const getMainTokenCards = () => {
    const allTokens = getAllTokenBalances();
    const mainTokens = ["SOL", "USDC", "USDT"];

    return mainTokens.map((symbol) => {
      const token = allTokens.find((t) => t.symbol === symbol);
      if (token) {
        return {
          title: token.symbol,
          balance: token.balance,
          price: token.price,
          change: 0, // 暂时设为0，可以后续添加24小时变化
          color: token.color,
        };
      }
      return {
        title: symbol,
        balance: 0,
        price: 0,
        change: 0,
        color:
          symbol === "SOL"
            ? "#9945FF"
            : symbol === "USDC"
            ? "#2775CA"
            : "#26A17B",
      };
    });
  };

  // 转换为API格式的余额数据
  const getApiBalanceData = (): ApiBalanceData | null => {
    const allTokens = getAllTokenBalances();
    const solToken = allTokens.find((t) => t.symbol === "SOL");
    const usdcToken = allTokens.find((t) => t.symbol === "USDC");
    const usdtToken = allTokens.find((t) => t.symbol === "USDT");

    if (!solToken && !usdcToken && !usdtToken) {
      return null;
    }

    return {
      sol: solToken?.balance || 0,
      usdc: usdcToken?.balance || 0,
      usdt: usdtToken?.balance || 0,
      prices: {
        sol: solToken?.price || 0,
        usdc: usdcToken?.price || 0,
        usdt: usdtToken?.price || 0,
      },
    };
  };

  // 生成模拟历史数据
  const getHistoryData = (): HistoryData[] => {
    const balanceData = getApiBalanceData();
    if (!balanceData) return [];

    // 生成最近7天的模拟数据
    const historyData: HistoryData[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // 添加一些随机变化来模拟真实数据
      const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 到 1.1 之间的随机数

      historyData.push({
        timestamp: date.toISOString(),
        sol: balanceData.sol * randomFactor,
        usdc: balanceData.usdc * randomFactor,
        usdt: balanceData.usdt * randomFactor,
      });
    }

    return historyData;
  };

  // 自动刷新余额
  useEffect(() => {
    if (state.wallets.length > 0) {
      refreshAllBalances();
    }
  }, [state.wallets.length]);

  const mainTokenCards = getMainTokenCards();
  const totalAssetsValue = getTotalAssetsValue();
  const allTokens = getAllTokenBalances();
  const apiBalanceData = getApiBalanceData();
  const historyData = getHistoryData();

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
            loading={state.balanceLoading}
          >
            刷新
          </Button>
        </Space>
      </div>

      {/* 钱包连接状态 */}
      {state.wallets.length === 0 && (
        <Alert
          message="未连接钱包"
          description="请先连接您的钱包以查看余额信息"
          type="info"
          showIcon
          icon={<WalletOutlined />}
          style={{ marginBottom: 24 }}
        />
      )}

      {/* 余额卡片 */}
      {state.wallets.length > 0 ? (
        <>
          <Row gutter={[16, 16]} className={styles.balanceCards}>
            {mainTokenCards.map((token) => (
              <Col xs={24} sm={8} key={token.title}>
                <BalanceCard
                  title={token.title}
                  balance={token.balance}
                  price={token.price}
                  change={token.change}
                  color={token.color}
                />
              </Col>
            ))}
          </Row>

          {/* 总资产统计 */}
          <Row gutter={[16, 16]} className={styles.totalStats}>
            <Col xs={24} md={8}>
              <Card className={styles.statCard}>
                <Statistic
                  title="总资产价值"
                  value={totalAssetsValue}
                  precision={2}
                  prefix="$"
                  valueStyle={{ color: "#3f8600" }}
                  loading={state.balanceLoading}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className={styles.statCard}>
                <Statistic
                  title="已连接钱包"
                  value={state.wallets.length}
                  suffix="个"
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className={styles.statCard}>
                <Statistic
                  title="代币种类"
                  value={allTokens.length}
                  suffix="种"
                  valueStyle={{ color: "#722ed1" }}
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
                <AssetPieChart balanceData={apiBalanceData} />
              </Card>
            </Col>
          </Row>

          {/* 所有代币列表 */}
          {allTokens.length > 0 && (
            <Card title="所有代币" className={styles.tokenListCard}>
              <Row gutter={[16, 16]}>
                {allTokens.map((token) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={token.symbol}>
                    <Card size="small" className={styles.tokenCard}>
                      <div className={styles.tokenInfo}>
                        <div
                          className={styles.tokenColor}
                          style={{ backgroundColor: token.color }}
                        />
                        <div className={styles.tokenDetails}>
                          <div className={styles.tokenName}>{token.name}</div>
                          <div className={styles.tokenBalance}>
                            {token.balance.toLocaleString(undefined, {
                              maximumFractionDigits: 6,
                            })}{" "}
                            {token.symbol}
                          </div>
                          <div className={styles.tokenValue}>
                            $
                            {token.usdValue.toLocaleString(undefined, {
                              maximumFractionDigits: 2,
                            })}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          )}
        </>
      ) : (
        <Empty
          description="连接钱包后查看余额信息"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </div>
  );
};

export default BalanceOverview;
