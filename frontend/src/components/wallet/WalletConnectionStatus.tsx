import React from "react";
import { Badge, Tooltip } from "antd";
import { useWallet } from "../../contexts/WalletContext";

interface WalletConnectionStatusProps {
  className?: string;
}

const WalletConnectionStatus: React.FC<WalletConnectionStatusProps> = ({
  className,
}) => {
  const { state } = useWallet();

  const getStatusInfo = () => {
    if (state.autoConnecting) {
      return {
        status: "processing" as const,
        text: "自动连接中",
        color: "#1890ff",
        tooltip: "正在尝试恢复之前的钱包连接...",
      };
    }

    if (state.connecting) {
      return {
        status: "processing" as const,
        text: "连接中",
        color: "#1890ff",
        tooltip: "正在连接钱包...",
      };
    }

    if (state.wallets.length > 0) {
      return {
        status: "success" as const,
        text: `已连接 ${state.wallets.length} 个钱包`,
        color: "#52c41a",
        tooltip: `已连接 ${state.wallets.length} 个钱包`,
      };
    }

    return {
      status: "default" as const,
      text: "未连接",
      color: "#8c8c8c",
      tooltip: "点击连接钱包按钮来连接您的钱包",
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <Tooltip title={statusInfo.tooltip}>
      <Badge
        status={statusInfo.status}
        text={statusInfo.text}
        className={className}
      />
    </Tooltip>
  );
};

export default WalletConnectionStatus;
