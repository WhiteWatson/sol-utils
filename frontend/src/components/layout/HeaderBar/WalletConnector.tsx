import React from "react";
import { Button, Dropdown, MenuProps } from "antd";
import { WalletOutlined, DisconnectOutlined } from "@ant-design/icons";
import { useWallet, Wallet } from "../../../contexts/WalletContext";
import styles from "./WalletConnector.module.less";

const WalletConnector: React.FC = () => {
  const { state, addWallet, removeWallet } = useWallet();
  const [currentWallet, setCurrentWallet] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (state.wallets.length > 0 && !currentWallet) {
      setCurrentWallet(state.wallets[0].address);
    }
    if (state.wallets.length === 0) {
      setCurrentWallet(null);
    }
  }, [state.wallets, currentWallet]);

  const handleConnect = () => {
    // 模拟连接钱包
    const walletAddress = prompt("请输入钱包地址:");
    if (walletAddress) {
      addWallet({ address: walletAddress });
      setCurrentWallet(walletAddress);
    }
  };

  const handleRemoveWallet = (walletAddress: string) => {
    removeWallet(walletAddress);
  };

  const walletMenuItems: MenuProps["items"] = [
    ...state.wallets.map((wallet: Wallet) => ({
      key: wallet.address,
      label: (
        <div className={styles.walletItem}>
          <span className={styles.walletAddress}>
            {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
          </span>
          <DisconnectOutlined
            className={styles.removeIcon}
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveWallet(wallet.address);
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
      onClick: handleConnect,
    },
  ];

  if (currentWallet) {
    return (
      <Dropdown menu={{ items: walletMenuItems }} placement="bottomRight" arrow>
        <Button
          type="primary"
          icon={<WalletOutlined />}
          className={styles.connectedButton}
        >
          {currentWallet.slice(0, 6)}...{currentWallet.slice(-4)}
        </Button>
      </Dropdown>
    );
  }

  return (
    <Button
      type="primary"
      icon={<WalletOutlined />}
      onClick={handleConnect}
      className={styles.connectButton}
    >
      连接钱包
    </Button>
  );
};

export default WalletConnector;
