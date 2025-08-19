const usdtService = require('../services/usdtService');

const createErrorResponse = (message, code = 'INTERNAL_ERROR', details = null) => ({
    error: {
        message,
        code,
        timestamp: new Date().toISOString(),
        ...(details && { details })
    }
});

class USDTController {
    async getUSDTData(req, res) {
        try {
            console.log('Fetching USDT data from Ethereum mainnet...');
            
            const data = await usdtService.getUSDTData();
            
            console.log('USDT data fetched successfully:', {
                provider: data.providerUrl,
                totalSupply: data.totalSupply,
                timestamp: data.timestamp
            });
            
            res.json({
                success: true,
                data
            });

        } catch (error) {
            console.error('USDT API Error:', {
                message: error.message,
                code: error.code || 'UNKNOWN_ERROR',
                stack: error.stack
            });

            // Handle specific error types
            let errorMessage = 'Failed to fetch USDT data';
            let errorCode = 'BLOCKCHAIN_ERROR';
            let details = null;

            if (error.message.includes('NETWORK_ERROR') || error.message.includes('connection')) {
                errorMessage = 'Network connection failed. Please check your internet connection';
                errorCode = 'NETWORK_ERROR';
                details = {
                    suggestion: 'Try again later or contact support if the issue persists',
                    providerStatus: await usdtService.getProviderStatus().catch(() => null)
                };
            } else if (error.message.includes('rate limit') || error.message.includes('429')) {
                errorMessage = 'Rate limit exceeded. Please try again in a few minutes';
                errorCode = 'RATE_LIMIT';
                details = {
                    suggestion: 'Wait a few minutes before retrying',
                    providerStatus: await usdtService.getProviderStatus().catch(() => null)
                };
            } else if (error.message.includes('timeout')) {
                errorMessage = 'Request timeout. The network might be slow';
                errorCode = 'TIMEOUT';
                details = {
                    suggestion: 'Try again in a moment',
                    providerStatus: await usdtService.getProviderStatus().catch(() => null)
                };
            } else if (error.message.includes('All providers failed') || error.message.includes('No healthy providers')) {
                errorMessage = 'All blockchain providers are currently unavailable';
                errorCode = 'PROVIDER_UNAVAILABLE';
                details = {
                    suggestion: 'This is a temporary issue. Please try again in a few minutes',
                    providerStatus: await usdtService.getProviderStatus().catch(() => null)
                };
            }

            res.status(500).json(createErrorResponse(errorMessage, errorCode, details));
        }
    }

    async getProviderStatus(req, res) {
        try {
            const status = await usdtService.getProviderStatus();
            res.json({
                success: true,
                data: status
            });
        } catch (error) {
            res.status(500).json(createErrorResponse(
                'Failed to get provider status',
                'STATUS_ERROR'
            ));
        }
    }
}

module.exports = new USDTController();
