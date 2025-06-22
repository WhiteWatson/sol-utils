# Solana 余额监控系统

基于 Node.js + React 的 Solana 钱包余额实时监控平台，支持 SOL、USDC、USDT 等多种资产的余额跟踪和价格转换。

## 🚀 快速开始

### 1. 安装依赖

```bash
# 安装 pnpm (如果未安装)
npm install -g pnpm

# 安装所有依赖
pnpm install:all
```

### 2. 配置环境变量

复制配置示例文件：

```bash
cp backend/config.example.env backend/.env
```

编辑 `backend/.env` 文件，配置你的：

- MongoDB 连接字符串
- Solana RPC 端点
- 监控的钱包地址

### 3. 启动项目

```bash
# 同时启动前后端
pnpm dev

# 或分别启动
pnpm dev:backend  # 后端 http://localhost:3000
pnpm dev:frontend # 前端 http://localhost:5173
```

## 📁 项目结构

```
solana-monitor/
├── backend/           # Node.js 后端
│   ├── src/
│   │   ├── api/      # API 接口
│   │   ├── collector/ # 数据采集
│   │   ├── storage/   # 数据存储
│   │   └── config/    # 配置管理
│   └── .env          # 环境变量
├── frontend/          # React 前端
│   ├── src/
│   │   ├── components/ # UI 组件
│   │   └── services/   # API 服务
│   └── package.json
└── package.json       # 根目录配置
```

## 🔧 配置说明

### 环境变量配置

在 `backend/.env` 中配置：

```env
# MongoDB 连接
MONGO_URI=mongodb://sol_db:bai2849245705@115.159.83.89:27017/sol_db

# Solana RPC 端点
SOLANA_RPC=https://rpc.shyft.to?api_key=sjQlJp1a3ZqZSM-F

# 监控的钱包地址
MONITOR_WALLETS=wallet1,wallet2
```

### 安全配置

- `.env` 文件已添加到 `.gitignore`，不会被提交到代码仓库
- 使用 `config.example.env` 作为配置模板

## 📊 功能特性

- ✅ 实时余额监控 (SOL/USDC/USDT)
- ✅ 价格转换 (USD 价值)
- ✅ 历史数据图表
- ✅ 定时数据采集
- ✅ 移动端响应式设计
- ✅ API 文档 (Swagger)

## 🛠️ 开发工具

- **包管理器**: pnpm
- **后端**: Node.js + TypeScript + Express
- **前端**: React 18 + TypeScript + Vite
- **数据库**: MongoDB
- **UI 库**: Ant Design

## 📝 API 文档

启动后端服务后访问：`http://localhost:3000/api-docs`

## 🐳 Docker 部署

```bash
docker-compose up -d
```

## �� 许可证

MIT License
