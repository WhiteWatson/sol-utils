import React, { useState, useEffect } from "react";
import { Layout, Typography, Row, Col, Spin, message } from "antd";
import WalletInput from "./components/WalletInput";
import BalanceCard from "./components/BalanceCard";
import BalanceChart from "./components/BalanceChart";
import { api, BalanceData, HistoryData } from "./services/api";

const { Header, Content } = Layout;

function App() {
  const [wallet, setWallet] = useState("");
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [historyData, setHistoryData] = useState<HistoryData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBalance = async (walletAddress: string) => {
    setLoading(true);
    try {
      const balance = await api.getLatestBalance(walletAddress);
      setBalanceData(balance);

      // 获取历史数据
      const history = await api.getBalanceHistory(walletAddress);
      setHistoryData(history);
    } catch (error) {
      message.error("获取余额失败");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleWalletChange = (walletAddress: string) => {
    setWallet(walletAddress);
    fetchBalance(walletAddress);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ color: "#fff", fontSize: 20 }}>Solana 余额监控</Header>
      <Content style={{ padding: 24 }}>
        <WalletInput onWalletChange={handleWalletChange} />

        {loading && (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spin size="large" />
          </div>
        )}

        {balanceData && (
          <Row gutter={16}>
            <Col span={24}>
              <BalanceCard data={balanceData} loading={loading} />
            </Col>
          </Row>
        )}

        {historyData.length > 0 && (
          <Row gutter={16}>
            <Col span={24}>
              <BalanceChart data={historyData} loading={loading} />
            </Col>
          </Row>
        )}
      </Content>
    </Layout>
  );
}

export default App;
