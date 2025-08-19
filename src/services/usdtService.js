const { ethers } = require('ethers');
const { EthMainnet } = require('../config/constant');
const USDT_ABI = require('../contract/usdtAbi.json');

// USDT Contract Configuration
const USDT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

class USDTService {
    constructor() {
        this.provider = new ethers.JsonRpcProvider(EthMainnet);
        this.contract = null;
    }

    async getContract() {
        console.log(this.provider);
        if (!this.provider) {
            throw new Error('Provider not initialized');
        }
        if (!this.contract) {
            this.contract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, this.provider);
        }

        console.log(this.contract);
        return this.contract;
    }

    async getUSDTData() {
        try {
            const contract = await this.getContract();

            const [name, symbol] = await Promise.all([
                contract.name(),
                contract.symbol()
            ]);

            return {
                name,
                symbol
            };
            
        } catch (error) {
            console.error('USDT data fetch failed:', error.message);
            throw new Error(`Failed to fetch USDT data: ${error.message}`);
        }
    }

    async getProviderStatus() {
        return {
            providerUrl: EthMainnet,
            providerStatus: 'single-provider-mode'
        };
    }
}

module.exports = new USDTService();
