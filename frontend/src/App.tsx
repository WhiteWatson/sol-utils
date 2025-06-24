import React from "react";
import { BrowserRouter, useRoutes } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import { WalletProvider } from "./contexts/WalletContext";
import { routes } from "./routes";
import "antd/dist/reset.css";
import "./styles/global.less";

function AppRoutes() {
  return useRoutes(routes);
}

const App: React.FC = () => {
  return (
    <AppProvider>
      <WalletProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </WalletProvider>
    </AppProvider>
  );
};

export default App;
