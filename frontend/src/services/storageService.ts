// 存储键名常量
const STORAGE_KEYS = {
    WALLETS: 'sol_utils_wallets',
    WALLET_CONNECTIONS: 'sol_utils_wallet_connections',
    SETTINGS: 'sol_utils_settings',
} as const;

// 钱包连接信息接口
export interface StoredWalletConnection {
    type: string;
    address: string;
    name: string;
    connectedAt: number;
}

// 存储服务类
export class StorageService {
    // 检查localStorage是否可用
    private static isStorageAvailable(): boolean {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    }

    // 保存钱包连接信息
    static saveWalletConnections(connections: StoredWalletConnection[]): void {
        if (!this.isStorageAvailable()) {
            console.warn('localStorage不可用，无法保存钱包连接状态');
            return;
        }

        try {
            localStorage.setItem(STORAGE_KEYS.WALLET_CONNECTIONS, JSON.stringify(connections));
        } catch (error) {
            console.error('保存钱包连接信息失败:', error);
        }
    }

    // 获取保存的钱包连接信息
    static getWalletConnections(): StoredWalletConnection[] {
        if (!this.isStorageAvailable()) {
            return [];
        }

        try {
            const stored = localStorage.getItem(STORAGE_KEYS.WALLET_CONNECTIONS);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('获取钱包连接信息失败:', error);
        }

        return [];
    }

    // 添加钱包连接
    static addWalletConnection(connection: StoredWalletConnection): void {
        const connections = this.getWalletConnections();
        const existingIndex = connections.findIndex(c => c.type === connection.type);

        if (existingIndex >= 0) {
            // 更新现有连接
            connections[existingIndex] = connection;
        } else {
            // 添加新连接
            connections.push(connection);
        }

        this.saveWalletConnections(connections);
    }

    // 移除钱包连接
    static removeWalletConnection(walletType: string): void {
        const connections = this.getWalletConnections();
        const filtered = connections.filter(c => c.type !== walletType);
        this.saveWalletConnections(filtered);
    }

    // 清除所有钱包连接
    static clearWalletConnections(): void {
        if (!this.isStorageAvailable()) {
            return;
        }

        try {
            localStorage.removeItem(STORAGE_KEYS.WALLET_CONNECTIONS);
        } catch (error) {
            console.error('清除钱包连接信息失败:', error);
        }
    }

    // 检查钱包连接是否过期（默认24小时）
    static isConnectionExpired(connection: StoredWalletConnection, maxAge: number = 24 * 60 * 60 * 1000): boolean {
        const now = Date.now();
        return (now - connection.connectedAt) > maxAge;
    }

    // 清理过期的连接
    static cleanupExpiredConnections(maxAge: number = 24 * 60 * 60 * 1000): void {
        const connections = this.getWalletConnections();
        const validConnections = connections.filter(c => !this.isConnectionExpired(c, maxAge));

        if (validConnections.length !== connections.length) {
            this.saveWalletConnections(validConnections);
        }
    }

    // 保存应用设置
    static saveSettings(settings: Record<string, any>): void {
        if (!this.isStorageAvailable()) {
            return;
        }

        try {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        } catch (error) {
            console.error('保存设置失败:', error);
        }
    }

    // 获取应用设置
    static getSettings(): Record<string, any> {
        if (!this.isStorageAvailable()) {
            return {};
        }

        try {
            const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('获取设置失败:', error);
        }

        return {};
    }

    // 获取特定设置项
    static getSetting<T>(key: string, defaultValue: T): T {
        const settings = this.getSettings();
        return settings[key] !== undefined ? settings[key] : defaultValue;
    }

    // 设置特定设置项
    static setSetting<T>(key: string, value: T): void {
        const settings = this.getSettings();
        settings[key] = value;
        this.saveSettings(settings);
    }
} 