import React, { createContext, useContext, useReducer, ReactNode } from "react";

// 应用状态接口
export interface AppState {
  language: string;
  collapsed: boolean;
  loading: boolean;
}

// 初始状态
const initialState: AppState = {
  language: "zh-CN",
  collapsed: false,
  loading: false,
};

// Action类型
export type AppAction =
  | { type: "SET_LANGUAGE"; payload: string }
  | { type: "TOGGLE_COLLAPSED" }
  | { type: "SET_COLLAPSED"; payload: boolean }
  | { type: "SET_LOADING"; payload: boolean };

// Reducer函数
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "SET_LANGUAGE":
      return { ...state, language: action.payload };
    case "TOGGLE_COLLAPSED":
      return { ...state, collapsed: !state.collapsed };
    case "SET_COLLAPSED":
      return { ...state, collapsed: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

// Context接口
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  setLanguage: (language: string) => void;
  toggleCollapsed: () => void;
  setLoading: (loading: boolean) => void;
}

// 创建Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider组件
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 便捷方法
  const setLanguage = (language: string) => {
    dispatch({ type: "SET_LANGUAGE", payload: language });
  };

  const toggleCollapsed = () => {
    dispatch({ type: "TOGGLE_COLLAPSED" });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  };

  const value: AppContextType = {
    state,
    dispatch,
    setLanguage,
    toggleCollapsed,
    setLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Hook
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
