// 应用配置
export const config = {
    // 是否启用价格数据（需要网络请求）
    enablePriceData: true,

    // 是否启用价格缓存
    enablePriceCache: true,

    // 价格缓存时间（毫秒）
    priceCacheDuration: 5 * 60 * 1000, // 5分钟

    // API 基础路径
    apiBaseUrl: '/api',

    // 默认 RPC 端点
    defaultRpcEndpoint: 'https://api.mainnet-beta.solana.com',

    // 支持的代币
    supportedTokens: ['SOL', 'USDC', 'USDT', 'BONK', 'JUP'],

    // 默认价格（当API不可用时使用）
    defaultPrices: {
        'SOL': 150.0,
        'USDC': 1.0,
        'USDT': 1.0,
        'BONK': 0.00002,
        'JUP': 0.5,
    },

    // 代币颜色配置
    tokenColors: {
        'SOL': '#9945FF',
        'USDC': '#2775CA',
        'USDT': '#26A17B',
        'BONK': '#FF6B35',
        'JUP': '#FF6B35',
    }
}; 