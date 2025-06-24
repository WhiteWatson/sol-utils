import { Connection, PublicKey } from '@solana/web3.js';

// 钱包类型枚举
export enum WalletType {
    PHANTOM = 'phantom',
    SOLFLARE = 'solflare',
    OKX = 'okx',
    METAMASK = 'metamask',
    BACKPACK = 'backpack',
    SLOPE = 'slope',
    EXODUS = 'exodus',
    COINBASE = 'coinbase',
}

// 钱包信息接口
export interface WalletInfo {
    type: WalletType;
    name: string;
    icon: string;
    installed: boolean;
    connected: boolean;
    address?: string;
}

// 钱包连接状态
export interface WalletConnectionState {
    connected: boolean;
    connecting: boolean;
    wallet: WalletInfo | null;
    error: string | null;
}

// 检测钱包是否已安装
export const detectWallet = (walletType: WalletType): boolean => {
    if (typeof window === 'undefined') return false;

    switch (walletType) {
        case WalletType.PHANTOM:
            return !!(window.phantom && 'solana' in window.phantom);
        case WalletType.SOLFLARE:
            return 'solflare' in window;
        case WalletType.OKX:
            return 'okxwallet' in window;
        case WalletType.METAMASK:
            return !!(window.ethereum && 'isMetaMask' in window.ethereum);
        case WalletType.BACKPACK:
            return 'backpack' in window;
        case WalletType.SLOPE:
            return 'slope' in window;
        case WalletType.EXODUS:
            return 'exodus' in window;
        case WalletType.COINBASE:
            return 'coinbaseWalletExtension' in window;
        default:
            return false;
    }
};

// 获取钱包实例
export const getWalletInstance = (walletType: WalletType): any => {
    if (typeof window === 'undefined') return null;

    switch (walletType) {
        case WalletType.PHANTOM:
            return window.phantom?.solana;
        case WalletType.SOLFLARE:
            return window.solflare;
        case WalletType.OKX:
            return window.okxwallet;
        case WalletType.METAMASK:
            return window.ethereum;
        case WalletType.BACKPACK:
            return window.backpack;
        case WalletType.SLOPE:
            return window.slope;
        case WalletType.EXODUS:
            return window.exodus;
        case WalletType.COINBASE:
            return window.coinbaseWalletExtension;
        default:
            return null;
    }
};

// 连接钱包
export const connectWallet = async (walletType: WalletType): Promise<WalletInfo> => {
    try {
        const wallet = getWalletInstance(walletType);

        if (!wallet) {
            throw new Error(`${walletType} 钱包未安装`);
        }

        // 请求连接
        const response = await wallet.connect();

        if (!response.publicKey) {
            throw new Error('连接失败：未获取到公钥');
        }

        const address = response.publicKey.toString();

        return {
            type: walletType,
            name: getWalletName(walletType),
            icon: getWalletIcon(walletType),
            installed: true,
            connected: true,
            address,
        };
    } catch (error) {
        console.error(`连接 ${walletType} 钱包失败:`, error);
        throw error;
    }
};

// 断开钱包连接
export const disconnectWallet = async (walletType: WalletType): Promise<void> => {
    try {
        const wallet = getWalletInstance(walletType);

        if (wallet && wallet.disconnect) {
            await wallet.disconnect();
        }
    } catch (error) {
        console.error(`断开 ${walletType} 钱包连接失败:`, error);
        throw error;
    }
};

// 获取钱包名称
export const getWalletName = (walletType: WalletType): string => {
    const names: Record<WalletType, string> = {
        [WalletType.PHANTOM]: 'Phantom',
        [WalletType.SOLFLARE]: 'Solflare',
        [WalletType.OKX]: 'OKX Wallet',
        [WalletType.METAMASK]: 'MetaMask',
        [WalletType.BACKPACK]: 'Backpack',
        [WalletType.SLOPE]: 'Slope',
        [WalletType.EXODUS]: 'Exodus',
        [WalletType.COINBASE]: 'Coinbase Wallet',
    };
    return names[walletType];
};

// 获取钱包图标
export const getWalletIcon = (walletType: WalletType): string => {
    const icons: Record<WalletType, string> = {
        [WalletType.PHANTOM]: '👻',
        [WalletType.SOLFLARE]: '🔥',
        [WalletType.OKX]: '🟢',
        [WalletType.METAMASK]: '🦊',
        [WalletType.BACKPACK]: '🎒',
        [WalletType.SLOPE]: '📱',
        [WalletType.EXODUS]: '🚀',
        [WalletType.COINBASE]: '🪙',
    };
    return icons[walletType];
};

// 获取所有可用钱包
export const getAvailableWallets = (): WalletInfo[] => {
    return Object.values(WalletType).map(type => ({
        type,
        name: getWalletName(type),
        icon: getWalletIcon(type),
        installed: detectWallet(type),
        connected: false,
    }));
};

// 检查钱包连接状态
export const checkWalletConnection = async (walletType: WalletType): Promise<boolean> => {
    try {
        const wallet = getWalletInstance(walletType);

        if (!wallet) return false;

        // 检查是否已连接
        if (wallet.isConnected) {
            return wallet.isConnected();
        }

        // 对于某些钱包，检查是否有公钥
        if (wallet.publicKey) {
            return !!wallet.publicKey;
        }

        return false;
    } catch (error) {
        console.error(`检查 ${walletType} 连接状态失败:`, error);
        return false;
    }
};

// 获取当前连接的钱包地址
export const getConnectedWalletAddress = async (walletType: WalletType): Promise<string | null> => {
    try {
        const wallet = getWalletInstance(walletType);

        if (!wallet) return null;

        if (wallet.publicKey) {
            return wallet.publicKey.toString();
        }

        return null;
    } catch (error) {
        console.error(`获取 ${walletType} 地址失败:`, error);
        return null;
    }
};

// 监听钱包连接状态变化
export const listenToWalletChanges = (
    walletType: WalletType,
    onConnect: (address: string) => void,
    onDisconnect: () => void
): (() => void) => {
    const wallet = getWalletInstance(walletType);

    if (!wallet) {
        return () => { };
    }

    const handleConnect = () => {
        if (wallet.publicKey) {
            onConnect(wallet.publicKey.toString());
        }
    };

    const handleDisconnect = () => {
        onDisconnect();
    };

    // 添加事件监听器
    if (wallet.on) {
        wallet.on('connect', handleConnect);
        wallet.on('disconnect', handleDisconnect);
    }

    // 返回清理函数
    return () => {
        if (wallet.removeListener) {
            wallet.removeListener('connect', handleConnect);
            wallet.removeListener('disconnect', handleDisconnect);
        }
    };
};

// 声明全局类型
declare global {
    interface Window {
        phantom?: {
            solana?: any;
        };
        solflare?: any;
        okxwallet?: any;
        ethereum?: any;
        backpack?: any;
        slope?: any;
        exodus?: any;
        coinbaseWalletExtension?: any;
    }
} 