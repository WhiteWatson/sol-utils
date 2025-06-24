import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";
import {
  WalletType,
  WalletInfo,
  connectWallet,
  disconnectWallet,
  getAvailableWallets,
  checkWalletConnection,
  getConnectedWalletAddress,
  listenToWalletChanges,
} from "../services/walletService";
import {
  StorageService,
  StoredWalletConnection,
} from "../services/storageService";

// 余额数据接口
export interface BalanceData {
  sol: number;
  usdc: number;
  usdt: number;
  solPrice: number;
  usdcPrice: number;
  usdtPrice: number;
  lastUpdated: string;
}

// 告警设置接口
export interface AlertSetting {
  id: string;
  type: "balance" | "price";
  token: "sol" | "usdc" | "usdt";
  condition: "above" | "below";
  value: number;
  enabled: boolean;
  notification: boolean;
  email: boolean;
}

export interface Wallet {
  address: string;
  name?: string;
  type?: WalletType;
  walletInfo?: WalletInfo;
}

// 钱包状态接口
export interface WalletState {
  wallets: Wallet[];
  availableWallets: WalletInfo[];
  balances: Record<string, BalanceData>;
  alerts: AlertSetting[];
  loading: boolean;
  error: string | null;
  connecting: boolean;
  autoConnecting: boolean;
}

// 初始状态
const initialState: WalletState = {
  wallets: [],
  availableWallets: [],
  balances: {},
  alerts: [],
  loading: false,
  error: null,
  connecting: false,
  autoConnecting: false,
};

// Action类型
export type WalletAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_CONNECTING"; payload: boolean }
  | { type: "SET_AUTO_CONNECTING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "ADD_WALLET"; payload: Wallet }
  | { type: "REMOVE_WALLET"; payload: string }
  | { type: "SET_AVAILABLE_WALLETS"; payload: WalletInfo[] }
  | {
      type: "UPDATE_WALLET_INFO";
      payload: { address: string; walletInfo: WalletInfo };
    }
  | {
      type: "UPDATE_BALANCE";
      payload: { wallet: string; balance: BalanceData };
    }
  | { type: "SET_BALANCES"; payload: Record<string, BalanceData> }
  | { type: "ADD_ALERT"; payload: AlertSetting }
  | { type: "UPDATE_ALERT"; payload: AlertSetting }
  | { type: "REMOVE_ALERT"; payload: string }
  | { type: "SET_ALERTS"; payload: AlertSetting[] }
  | { type: "TOGGLE_ALERT"; payload: string };

// Reducer函数
const walletReducer = (
  state: WalletState,
  action: WalletAction
): WalletState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_CONNECTING":
      return { ...state, connecting: action.payload };
    case "SET_AUTO_CONNECTING":
      return { ...state, autoConnecting: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "ADD_WALLET":
      if (state.wallets.find((w) => w.address === action.payload.address)) {
        return state;
      }
      return { ...state, wallets: [...state.wallets, action.payload] };
    case "REMOVE_WALLET":
      const newBalances = { ...state.balances };
      delete newBalances[action.payload];
      return {
        ...state,
        wallets: state.wallets.filter((w) => w.address !== action.payload),
        balances: newBalances,
      };
    case "SET_AVAILABLE_WALLETS":
      return { ...state, availableWallets: action.payload };
    case "UPDATE_WALLET_INFO":
      return {
        ...state,
        wallets: state.wallets.map((wallet) =>
          wallet.address === action.payload.address
            ? { ...wallet, walletInfo: action.payload.walletInfo }
            : wallet
        ),
      };
    case "UPDATE_BALANCE":
      return {
        ...state,
        balances: {
          ...state.balances,
          [action.payload.wallet]: action.payload.balance,
        },
      };
    case "SET_BALANCES":
      return { ...state, balances: action.payload };
    case "ADD_ALERT":
      return {
        ...state,
        alerts: [...state.alerts, action.payload],
      };
    case "UPDATE_ALERT":
      return {
        ...state,
        alerts: state.alerts.map((alert) =>
          alert.id === action.payload.id ? action.payload : alert
        ),
      };
    case "REMOVE_ALERT":
      return {
        ...state,
        alerts: state.alerts.filter((alert) => alert.id !== action.payload),
      };
    case "SET_ALERTS":
      return { ...state, alerts: action.payload };
    case "TOGGLE_ALERT":
      return {
        ...state,
        alerts: state.alerts.map((alert) =>
          alert.id === action.payload
            ? { ...alert, enabled: !alert.enabled }
            : alert
        ),
      };
    default:
      return state;
  }
};

// Context接口
interface WalletContextType {
  state: WalletState;
  dispatch: React.Dispatch<WalletAction>;
  removeWallet: (address: string) => void;
  connectWeb3Wallet: (walletType: WalletType) => Promise<void>;
  disconnectWeb3Wallet: (walletType: WalletType) => Promise<void>;
  refreshAvailableWallets: () => void;
  updateBalance: (wallet: string, balance: BalanceData) => void;
  addAlert: (alert: Omit<AlertSetting, "id">) => void;
  updateAlert: (alert: AlertSetting) => void;
  removeAlert: (id: string) => void;
  toggleAlert: (id: string) => void;
  getBalance: (wallet: string) => BalanceData | null;
  getTotalValue: (wallet: string) => number;
}

// 创建Context
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Provider组件
interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  // 刷新可用钱包列表
  const refreshAvailableWallets = () => {
    const availableWallets = getAvailableWallets();
    dispatch({ type: "SET_AVAILABLE_WALLETS", payload: availableWallets });
  };

  // 连接Web3钱包
  const connectWeb3Wallet = async (walletType: WalletType) => {
    try {
      dispatch({ type: "SET_CONNECTING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      const walletInfo = await connectWallet(walletType);

      const wallet: Wallet = {
        address: walletInfo.address!,
        name: walletInfo.name,
        type: walletType,
        walletInfo,
      };

      dispatch({ type: "ADD_WALLET", payload: wallet });

      // 保存连接信息到localStorage
      const connection: StoredWalletConnection = {
        type: walletType,
        address: walletInfo.address!,
        name: walletInfo.name,
        connectedAt: Date.now(),
      };
      StorageService.addWalletConnection(connection);

      // 设置钱包变化监听器
      const cleanup = listenToWalletChanges(
        walletType,
        (address) => {
          // 钱包重新连接
          dispatch({
            type: "UPDATE_WALLET_INFO",
            payload: { address, walletInfo },
          });
        },
        () => {
          // 钱包断开连接
          dispatch({ type: "REMOVE_WALLET", payload: walletInfo.address! });
          // 从localStorage中移除连接信息
          StorageService.removeWalletConnection(walletType);
        }
      );

      // 存储清理函数
      (window as any).__walletCleanup = cleanup;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "连接钱包失败";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: "SET_CONNECTING", payload: false });
    }
  };

  // 断开Web3钱包连接
  const disconnectWeb3Wallet = async (walletType: WalletType) => {
    try {
      await disconnectWallet(walletType);

      // 找到对应的钱包并移除
      const walletToRemove = state.wallets.find((w) => w.type === walletType);
      if (walletToRemove) {
        dispatch({ type: "REMOVE_WALLET", payload: walletToRemove.address });
      }

      // 从localStorage中移除连接信息
      StorageService.removeWalletConnection(walletType);

      // 清理监听器
      if ((window as any).__walletCleanup) {
        (window as any).__walletCleanup();
        delete (window as any).__walletCleanup;
      }
    } catch (error) {
      console.error("断开钱包连接失败:", error);
      throw error;
    }
  };

  // 自动恢复连接
  const autoReconnectWallets = async () => {
    try {
      dispatch({ type: "SET_AUTO_CONNECTING", payload: true });

      // 清理过期的连接
      StorageService.cleanupExpiredConnections();

      // 获取保存的连接信息
      const storedConnections = StorageService.getWalletConnections();

      if (storedConnections.length === 0) {
        return;
      }

      console.log("尝试自动恢复钱包连接...", storedConnections);

      // 逐个尝试恢复连接
      for (const connection of storedConnections) {
        try {
          const walletType = connection.type as WalletType;

          // 检查钱包是否已安装
          const availableWallets = getAvailableWallets();
          const isInstalled = availableWallets.find(
            (w) => w.type === walletType
          )?.installed;

          if (!isInstalled) {
            console.log(`${connection.name} 未安装，跳过自动连接`);
            continue;
          }

          // 检查钱包是否仍然连接
          const isConnected = await checkWalletConnection(walletType);

          if (isConnected) {
            // 获取当前地址
            const currentAddress = await getConnectedWalletAddress(walletType);

            if (currentAddress === connection.address) {
              // 地址匹配，恢复连接
              const walletInfo: WalletInfo = {
                type: walletType,
                name: connection.name,
                icon: "", // 这里可以添加图标获取逻辑
                installed: true,
                connected: true,
                address: currentAddress,
              };

              const wallet: Wallet = {
                address: currentAddress,
                name: connection.name,
                type: walletType,
                walletInfo,
              };

              dispatch({ type: "ADD_WALLET", payload: wallet });
              console.log(`成功恢复 ${connection.name} 连接`);
            } else {
              // 地址不匹配，移除过期的连接信息
              StorageService.removeWalletConnection(walletType);
              console.log(`${connection.name} 地址不匹配，移除连接信息`);
            }
          } else {
            // 钱包未连接，尝试重新连接
            console.log(`尝试重新连接 ${connection.name}...`);
            await connectWeb3Wallet(walletType);
          }
        } catch (error) {
          console.error(`恢复 ${connection.name} 连接失败:`, error);
          // 移除失败的连接信息
          StorageService.removeWalletConnection(connection.type);
        }
      }
    } catch (error) {
      console.error("自动恢复钱包连接失败:", error);
    } finally {
      dispatch({ type: "SET_AUTO_CONNECTING", payload: false });
    }
  };

  const removeWallet = (address: string) => {
    dispatch({ type: "REMOVE_WALLET", payload: address });
  };

  const updateBalance = (wallet: string, balance: BalanceData) => {
    dispatch({ type: "UPDATE_BALANCE", payload: { wallet, balance } });
  };

  const addAlert = (alert: Omit<AlertSetting, "id">) => {
    const newAlert: AlertSetting = {
      ...alert,
      id: Date.now().toString(),
    };
    dispatch({ type: "ADD_ALERT", payload: newAlert });
  };

  const updateAlert = (alert: AlertSetting) => {
    dispatch({ type: "UPDATE_ALERT", payload: alert });
  };

  const removeAlert = (id: string) => {
    dispatch({ type: "REMOVE_ALERT", payload: id });
  };

  const toggleAlert = (id: string) => {
    dispatch({ type: "TOGGLE_ALERT", payload: id });
  };

  const getBalance = (wallet: string): BalanceData | null => {
    return state.balances[wallet] || null;
  };

  const getTotalValue = (wallet: string): number => {
    const balance = state.balances[wallet];
    if (!balance) return 0;

    return (
      balance.sol * balance.solPrice +
      balance.usdc * balance.usdcPrice +
      balance.usdt * balance.usdtPrice
    );
  };

  // 初始化时刷新可用钱包列表并尝试自动恢复连接
  useEffect(() => {
    refreshAvailableWallets();

    // 延迟执行自动恢复，确保页面完全加载
    const timer = setTimeout(() => {
      autoReconnectWallets();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const contextValue: WalletContextType = {
    state,
    dispatch,
    removeWallet,
    connectWeb3Wallet,
    disconnectWeb3Wallet,
    refreshAvailableWallets,
    updateBalance,
    addAlert,
    updateAlert,
    removeAlert,
    toggleAlert,
    getBalance,
    getTotalValue,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

// Hook
export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
