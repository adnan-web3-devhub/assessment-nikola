const { ethers } = require('ethers');

class ProviderHealth {
    constructor() {
        this.providerStatus = new Map();
        this.healthCheckTimeout = 5000; // 5 seconds
    }

    async checkProviderHealth(provider, url) {
        try {
            const startTime = Date.now();
            const blockNumber = await Promise.race([
                provider.getBlockNumber(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Health check timeout')), this.healthCheckTimeout)
                )
            ]);
            
            const responseTime = Date.now() - startTime;
            
            this.providerStatus.set(url, {
                healthy: true,
                lastChecked: new Date().toISOString(),
                responseTime,
                blockNumber
            });
            
            return true;
        } catch (error) {
            this.providerStatus.set(url, {
                healthy: false,
                lastChecked: new Date().toISOString(),
                error: error.message,
                responseTime: null
            });
            
            return false;
        }
    }

    async getHealthyProviders(providers) {
        const healthyProviders = [];
        
        for (const { provider, url } of providers) {
            const isHealthy = await this.checkProviderHealth(provider, url);
            if (isHealthy) {
                healthyProviders.push({ provider, url });
            }
        }
        
        return healthyProviders;
    }

    getProviderStatus(url) {
        return this.providerStatus.get(url) || null;
    }

    getAllProviderStatus() {
        return Object.fromEntries(this.providerStatus);
    }
}

module.exports = new ProviderHealth();
