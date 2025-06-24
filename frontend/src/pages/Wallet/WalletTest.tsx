import React from "react";
import { Card, Button, Space, Typography, Alert, Divider } from "antd";
import { useWallet } from "../../contexts/WalletContext";
import {
  WalletType,
  getWalletName,
  getWalletIcon,
} from "../../services/walletService";

const { Title, Text } = Typography;

const WalletTest: React.FC = () => {
  const { state, connectWeb3Wallet, disconnectWeb3Wallet } = useWallet();

  const handleConnect = async (walletType: WalletType) => {
    try {
      await connectWeb3Wallet(walletType);
    } catch (error) {
      console.error("连接失败:", error);
    }
  };

  const handleDisconnect = async (walletType: WalletType) => {
    try {
      await disconnectWeb3Wallet(walletType);
    } catch (error) {
      console.error("断开连接失败:", error);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>钱包连接测试</Title>

      <Alert
        message="钱包连接状态"
        description={`已连接 ${state.wallets.length} 个钱包`}
        type="info"
        showIcon
        style={{ marginBottom: "24px" }}
      />

      <Card title="已连接的钱包" style={{ marginBottom: "24px" }}>
        {state.wallets.length === 0 ? (
          <Text type="secondary">暂无连接的钱包</Text>
        ) : (
          <Space direction="vertical" style={{ width: "100%" }}>
            {state.wallets.map((wallet) => (
              <div
                key={wallet.address}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px",
                  border: "1px solid #d9d9d9",
                  borderRadius: "6px",
                }}
              >
                <div>
                  <Text strong>
                    {wallet.walletInfo?.icon ||
                      (wallet.type ? getWalletIcon(wallet.type) : "💼")}{" "}
                    {wallet.walletInfo?.name ||
                      wallet.name ||
                      (wallet.type ? getWalletName(wallet.type) : "未知钱包")}
                  </Text>
                  <br />
                  <Text code>{wallet.address}</Text>
                </div>
                {wallet.type && (
                  <Button danger onClick={() => handleDisconnect(wallet.type!)}>
                    断开连接
                  </Button>
                )}
              </div>
            ))}
          </Space>
        )}
      </Card>

      <Card title="可用的钱包">
        <Space wrap>
          {state.availableWallets.map((wallet) => {
            const isConnected = state.wallets.some(
              (w) => w.type === wallet.type
            );
            return (
              <Button
                key={wallet.type}
                type={isConnected ? "default" : "primary"}
                disabled={!wallet.installed}
                onClick={() =>
                  isConnected
                    ? handleDisconnect(wallet.type)
                    : handleConnect(wallet.type)
                }
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  height: "80px",
                  width: "120px",
                }}
              >
                <span style={{ fontSize: "24px", marginBottom: "8px" }}>
                  {wallet.icon}
                </span>
                <Text style={{ fontSize: "12px" }}>{wallet.name}</Text>
                <Text
                  style={{
                    fontSize: "10px",
                    color: wallet.installed ? "#52c41a" : "#ff4d4f",
                  }}
                >
                  {wallet.installed ? "已安装" : "未安装"}
                </Text>
              </Button>
            );
          })}
        </Space>
      </Card>
    </div>
  );
};

export default WalletTest;
