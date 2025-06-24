import React from "react";
import { Badge, Tooltip } from "antd";
import { useWallet } from "../../contexts/WalletContext";
import { WalletType, getWalletName } from "../../services/walletService";

interface WalletStatusIndicatorProps {
  walletType: WalletType;
  className?: string;
}

const WalletStatusIndicator: React.FC<WalletStatusIndicatorProps> = ({
  walletType,
  className,
}) => {
  const { state } = useWallet();

  // 检查钱包是否已连接
  const isConnected = state.wallets.some(
    (wallet) => wallet.type === walletType
  );

  // 检查钱包是否已安装
  const isInstalled =
    state.availableWallets.find((w) => w.type === walletType)?.installed ||
    false;

  const getStatusColor = () => {
    if (isConnected) return "success";
    if (isInstalled) return "processing";
    return "default";
  };

  const getStatusText = () => {
    if (isConnected) return "已连接";
    if (isInstalled) return "已安装";
    return "未安装";
  };

  const getTooltipText = () => {
    const walletName = getWalletName(walletType);
    if (isConnected) return `${walletName} 已连接`;
    if (isInstalled) return `${walletName} 已安装，点击连接`;
    return `${walletName} 未安装，请先安装钱包插件`;
  };

  return (
    <Tooltip title={getTooltipText()}>
      <Badge
        status={getStatusColor() as any}
        text={getStatusText()}
        className={className}
      />
    </Tooltip>
  );
};

export default WalletStatusIndicator;
