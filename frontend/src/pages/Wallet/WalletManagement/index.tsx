import React from "react";
import {
  Card,
  List,
  Button,
  Space,
  Tag,
  Typography,
  Empty,
  Spin,
  message,
} from "antd";
import {
  WalletOutlined,
  PlusOutlined,
  ReloadOutlined,
  DisconnectOutlined,
} from "@ant-design/icons";
import { useWallet } from "../../../contexts/WalletContext";
import {
  WalletType,
  getWalletName,
  getWalletIcon,
} from "../../../services/walletService";
import WalletStatusIndicator from "../../../components/wallet/WalletStatusIndicator";
import WalletConnectionStatus from "../../../components/wallet/WalletConnectionStatus";
import styles from "./index.module.less";

const { Title, Text } = Typography;

const WalletManagement: React.FC = () => {
  const {
    state,
    connectWeb3Wallet,
    disconnectWeb3Wallet,
    removeWallet,
    refreshAvailableWallets,
  } = useWallet();

  const [connectingWallet, setConnectingWallet] =
    React.useState<WalletType | null>(null);

  // 处理连接钱包
  const handleConnectWallet = async (walletType: WalletType) => {
    try {
      setConnectingWallet(walletType);
      await connectWeb3Wallet(walletType);
      message.success(`成功连接到 ${getWalletName(walletType)}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "连接失败";
      message.error(errorMessage);
    } finally {
      setConnectingWallet(null);
    }
  };

  // 处理断开钱包
  const handleDisconnectWallet = async (wallet: any) => {
    try {
      if (wallet.type) {
        await disconnectWeb3Wallet(wallet.type);
        message.success("钱包已断开连接");
      } else {
        removeWallet(wallet.address);
        message.success("钱包已移除");
      }
    } catch (error) {
      message.error("断开连接失败");
    }
  };

  // 刷新钱包列表
  const handleRefreshWallets = () => {
    refreshAvailableWallets();
    message.success("钱包列表已刷新");
  };

  // 渲染已连接的钱包
  const renderConnectedWallets = () => {
    if (state.wallets.length === 0) {
      return (
        <Empty
          description="暂无连接的钱包"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    return (
      <List
        dataSource={state.wallets}
        renderItem={(wallet) => (
          <List.Item
            className={styles.walletItem}
            actions={[
              <Button
                key="disconnect"
                type="text"
                danger
                icon={<DisconnectOutlined />}
                onClick={() => handleDisconnectWallet(wallet)}
              >
                断开
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={
                <div className={styles.walletAvatar}>
                  <span className={styles.walletIcon}>
                    {wallet.walletInfo?.icon ||
                      (wallet.type ? getWalletIcon(wallet.type) : "💼")}
                  </span>
                </div>
              }
              title={
                <Space>
                  <Text strong>
                    {wallet.walletInfo?.name ||
                      wallet.name ||
                      (wallet.type ? getWalletName(wallet.type) : "未知钱包")}
                  </Text>
                  {wallet.type && (
                    <WalletStatusIndicator walletType={wallet.type} />
                  )}
                </Space>
              }
              description={
                <div className={styles.walletDetails}>
                  <Text code className={styles.walletAddress}>
                    {wallet.address}
                  </Text>
                  <div className={styles.walletTags}>
                    {wallet.type && (
                      <Tag color="blue">{getWalletName(wallet.type)}</Tag>
                    )}
                    <Tag color="green">已连接</Tag>
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
    );
  };

  // 渲染可用的钱包
  const renderAvailableWallets = () => {
    const availableWallets = state.availableWallets.filter((w) => !w.installed);

    if (availableWallets.length === 0) {
      return (
        <Empty
          description="所有支持的钱包都已安装"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    return (
      <List
        dataSource={availableWallets}
        renderItem={(wallet) => (
          <List.Item className={`${styles.walletItem} ${styles.disabled}`}>
            <List.Item.Meta
              avatar={
                <div className={styles.walletAvatar}>
                  <span className={styles.walletIcon}>{wallet.icon}</span>
                </div>
              }
              title={
                <Space>
                  <Text strong>{wallet.name}</Text>
                  <Tag color="red">未安装</Tag>
                </Space>
              }
              description={
                <div className={styles.walletDetails}>
                  <Text type="secondary">
                    请先安装 {wallet.name} 浏览器插件
                  </Text>
                  <div className={styles.walletTags}>
                    <Tag color="orange">需要安装</Tag>
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
    );
  };

  // 渲染已安装但未连接的钱包
  const renderInstalledWallets = () => {
    const installedWallets = state.availableWallets.filter(
      (w) =>
        w.installed &&
        !state.wallets.some((connected) => connected.type === w.type)
    );

    if (installedWallets.length === 0) {
      return null;
    }

    return (
      <List
        dataSource={installedWallets}
        renderItem={(wallet) => (
          <List.Item
            className={styles.walletItem}
            actions={[
              <Button
                key="connect"
                type="primary"
                loading={connectingWallet === wallet.type}
                onClick={() => handleConnectWallet(wallet.type)}
              >
                连接
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={
                <div className={styles.walletAvatar}>
                  <span className={styles.walletIcon}>{wallet.icon}</span>
                </div>
              }
              title={
                <Space>
                  <Text strong>{wallet.name}</Text>
                  <WalletStatusIndicator walletType={wallet.type} />
                </Space>
              }
              description={
                <div className={styles.walletDetails}>
                  <Text type="secondary">点击连接按钮连接到 {wallet.name}</Text>
                  <div className={styles.walletTags}>
                    <Tag color="processing">已安装</Tag>
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
    );
  };

  return (
    <div className={styles.walletManagement}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <Title level={2}>
            <WalletOutlined /> 钱包管理
          </Title>
          <WalletConnectionStatus />
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefreshWallets}
            loading={state.loading}
          >
            刷新
          </Button>
        </Space>
      </div>

      <div className={styles.content}>
        {/* 已连接的钱包 */}
        <Card
          title="已连接的钱包"
          className={styles.walletCard}
          extra={
            <Text type="secondary">{state.wallets.length} 个钱包已连接</Text>
          }
        >
          {renderConnectedWallets()}
        </Card>

        {/* 已安装但未连接的钱包 */}
        {renderInstalledWallets() && (
          <Card
            title="可连接的钱包"
            className={styles.walletCard}
            extra={<Text type="secondary">点击连接按钮连接到已安装的钱包</Text>}
          >
            {renderInstalledWallets()}
          </Card>
        )}

        {/* 未安装的钱包 */}
        <Card
          title="未安装的钱包"
          className={styles.walletCard}
          extra={<Text type="secondary">请先安装对应的浏览器插件</Text>}
        >
          {renderAvailableWallets()}
        </Card>
      </div>
    </div>
  );
};

export default WalletManagement;
