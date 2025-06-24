import React from "react";
import { Button, Dropdown, MenuProps, Modal, List, Spin, message } from "antd";
import {
  WalletOutlined,
  DisconnectOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useWallet } from "../../../contexts/WalletContext";
import {
  WalletType,
  getWalletName,
  getWalletIcon,
} from "../../../services/walletService";
import styles from "./WalletConnector.module.less";

const WalletConnector: React.FC = () => {
  const {
    state,
    removeWallet,
    connectWeb3Wallet,
    disconnectWeb3Wallet,
    refreshAvailableWallets,
  } = useWallet();

  const [currentWallet, setCurrentWallet] = React.useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [connectingWallet, setConnectingWallet] =
    React.useState<WalletType | null>(null);

  React.useEffect(() => {
    if (state.wallets.length > 0 && !currentWallet) {
      setCurrentWallet(state.wallets[0].address);
    }
    if (state.wallets.length === 0) {
      setCurrentWallet(null);
    }
  }, [state.wallets, currentWallet]);

  // 处理连接Web3钱包
  const handleConnectWeb3Wallet = async (walletType: WalletType) => {
    try {
      setConnectingWallet(walletType);
      await connectWeb3Wallet(walletType);
      message.success(`成功连接到 ${getWalletName(walletType)}`);
      setIsModalVisible(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "连接失败";
      message.error(errorMessage);
    } finally {
      setConnectingWallet(null);
    }
  };

  // 处理断开钱包连接
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

  // 刷新可用钱包列表
  const handleRefreshWallets = () => {
    refreshAvailableWallets();
    message.success("钱包列表已刷新");
  };

  // 钱包菜单项
  const walletMenuItems: MenuProps["items"] = [
    ...state.wallets.map((wallet: any) => ({
      key: wallet.address,
      label: (
        <div className={styles.walletItem}>
          <div className={styles.walletInfo}>
            <span className={styles.walletIcon}>
              {wallet.walletInfo?.icon || wallet.type
                ? getWalletIcon(wallet.type)
                : "💼"}
            </span>
            <span className={styles.walletName}>
              {wallet.walletInfo?.name ||
                wallet.name ||
                getWalletName(wallet.type)}
            </span>
            <span className={styles.walletAddress}>
              {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
            </span>
          </div>
          <DisconnectOutlined
            className={styles.removeIcon}
            onClick={(e) => {
              e.stopPropagation();
              handleDisconnectWallet(wallet);
            }}
          />
        </div>
      ),
      onClick: () => setCurrentWallet(wallet.address),
    })),
    {
      type: "divider" as const,
    },
    {
      key: "connect",
      label: "连接新钱包",
      onClick: () => setIsModalVisible(true),
    },
  ];

  // 获取当前钱包信息
  const getCurrentWalletInfo = () => {
    if (!currentWallet) return null;
    return state.wallets.find((w) => w.address === currentWallet);
  };

  const currentWalletInfo = getCurrentWalletInfo();

  // 钱包选择模态框
  const WalletSelectionModal = () => (
    <Modal
      title="选择钱包连接"
      open={isModalVisible}
      onCancel={() => setIsModalVisible(false)}
      footer={null}
      width={500}
    >
      <div className={styles.walletSelection}>
        <div className={styles.modalHeader}>
          <span>可用的钱包</span>
          <Button
            icon={<ReloadOutlined />}
            size="small"
            onClick={handleRefreshWallets}
          >
            刷新
          </Button>
        </div>

        <List
          dataSource={state.availableWallets}
          renderItem={(wallet) => (
            <List.Item
              className={`${styles.walletOption} ${
                !wallet.installed ? styles.disabled : ""
              }`}
              onClick={() =>
                wallet.installed && handleConnectWeb3Wallet(wallet.type)
              }
            >
              <div className={styles.walletOptionContent}>
                <span className={styles.walletIcon}>{wallet.icon}</span>
                <div className={styles.walletDetails}>
                  <div className={styles.walletName}>{wallet.name}</div>
                  <div className={styles.walletStatus}>
                    {wallet.installed ? "已安装" : "未安装"}
                  </div>
                </div>
                {connectingWallet === wallet.type && <Spin size="small" />}
              </div>
            </List.Item>
          )}
        />
      </div>
    </Modal>
  );

  if (currentWallet) {
    return (
      <>
        <Dropdown
          menu={{ items: walletMenuItems }}
          placement="bottomRight"
          arrow
        >
          <Button
            type="primary"
            icon={<WalletOutlined />}
            className={styles.connectedButton}
          >
            <div className={styles.connectedWalletInfo}>
              <span className={styles.walletIcon}>
                {currentWalletInfo?.walletInfo?.icon ||
                  (currentWalletInfo?.type
                    ? getWalletIcon(currentWalletInfo.type)
                    : "💼")}
              </span>
              <span className={styles.walletAddress}>
                {currentWallet.slice(0, 6)}...{currentWallet.slice(-4)}
              </span>
            </div>
          </Button>
        </Dropdown>
        <WalletSelectionModal />
      </>
    );
  }

  return (
    <>
      <Button
        type="primary"
        icon={<WalletOutlined />}
        onClick={() => setIsModalVisible(true)}
        className={styles.connectButton}
        loading={state.connecting || state.autoConnecting}
      >
        {state.autoConnecting ? "自动连接中..." : "连接钱包"}
      </Button>
      <WalletSelectionModal />
    </>
  );
};

export default WalletConnector;
