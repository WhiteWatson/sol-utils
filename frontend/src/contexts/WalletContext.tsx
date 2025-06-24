import React, { createContext, useContext, useReducer, ReactNode } from "react";

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
}

// 钱包状态接口
export interface WalletState {
  wallets: Wallet[];
  balances: Record<string, BalanceData>;
  alerts: AlertSetting[];
  loading: boolean;
  error: string | null;
}

// 初始状态
const initialState: WalletState = {
  wallets: [],
  balances: {},
  alerts: [],
  loading: false,
  error: null,
};

// Action类型
export type WalletAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "ADD_WALLET"; payload: Wallet }
  | { type: "REMOVE_WALLET"; payload: string }
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
  addWallet: (wallet: Wallet) => void;
  removeWallet: (address: string) => void;
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

  // 便捷方法
  const addWallet = (wallet: Wallet) => {
    dispatch({ type: "ADD_WALLET", payload: wallet });
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

  const value: WalletContextType = {
    state,
    dispatch,
    addWallet,
    removeWallet,
    updateBalance,
    addAlert,
    updateAlert,
    removeAlert,
    toggleAlert,
    getBalance,
    getTotalValue,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
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
