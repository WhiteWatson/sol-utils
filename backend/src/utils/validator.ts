import * as Joi from 'joi';

export const walletSchema = Joi.object({
    wallet: Joi.string().required().pattern(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/).message('无效的钱包地址')
});

export const historySchema = Joi.object({
    wallet: Joi.string().required().pattern(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    interval: Joi.string().valid('hourly', 'daily').optional()
});

export const aggregatedSchema = Joi.object({
    wallet: Joi.string().required().pattern(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/),
    period: Joi.string().pattern(/^\d+d$/).optional()
});

export function validateWallet(wallet: string): boolean {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(wallet);
} 