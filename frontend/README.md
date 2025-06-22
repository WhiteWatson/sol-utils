# Solana 余额监控系统 - 前端

## 功能特性

- ✅ 钱包地址输入验证
- ✅ 实时余额展示 (SOL/USDC/USDT)
- ✅ 美元价值转换
- ✅ 余额历史图表
- ✅ 响应式移动端设计
- ✅ Ant Design UI 组件

## 快速开始

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 访问应用

打开 `http://localhost:5173`

## 组件说明

### WalletInput

钱包地址输入组件，支持格式验证

### BalanceCard

余额展示卡片，显示各币种余额及美元价值

### BalanceChart

余额历史趋势图表，基于 Chart.js

## 技术栈

- React 18 + TypeScript
- Vite 构建工具
- Ant Design UI 库
- Chart.js 图表库
- Axios HTTP 客户端

## 项目结构

```
src/
├── components/         # UI 组件
│   ├── WalletInput.tsx
│   ├── BalanceCard.tsx
│   └── BalanceChart.tsx
├── services/           # API 服务
│   └── api.ts
├── App.tsx            # 主应用
└── main.tsx           # 入口文件
```
