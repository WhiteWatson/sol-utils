import React, { useState } from "react";
import { Input, Button, Card, message } from "antd";
import { WalletOutlined } from "@ant-design/icons";

interface WalletInputProps {
  onWalletChange: (wallet: string) => void;
}

const WalletInput: React.FC<WalletInputProps> = ({ onWalletChange }) => {
  const [wallet, setWallet] = useState("");

  const handleSubmit = () => {
    if (!wallet.trim()) {
      message.error("请输入钱包地址");
      return;
    }
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(wallet)) {
      message.error("无效的钱包地址格式");
      return;
    }
    onWalletChange(wallet);
    message.success("钱包地址已设置");
  };

  return (
    <Card title="钱包地址" style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <Input
          placeholder="输入 Solana 钱包地址"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          prefix={<WalletOutlined />}
          style={{ flex: 1 }}
        />
        <Button type="primary" onClick={handleSubmit}>
          查询余额
        </Button>
      </div>
    </Card>
  );
};

export default WalletInput;
