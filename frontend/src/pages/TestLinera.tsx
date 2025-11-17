import { useEffect, useState } from 'react';
import { lineraClient } from '../api/linera-client';

const TestLinera = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [marketCount, setMarketCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setStatus('checking');
    setError(null);
    
    try {
      const isAvailable = await lineraClient.isAvailable();
      
      if (isAvailable) {
        setStatus('connected');
        const count = await lineraClient.getMarketCount();
        setMarketCount(count);
      } else {
        setStatus('disconnected');
        setError('Linera service is not available');
      }
    } catch (err: any) {
      setStatus('disconnected');
      setError(err.message || 'Failed to connect to Linera service');
    }
  };

  const loadMarkets = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await lineraClient.getMarkets();
      setMarkets(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load markets');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Linera Connection Test</h1>

        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <h2 className="text-2xl font-semibold mb-4">Connection Status</h2>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-4 h-4 rounded-full ${
              status === 'connected' ? 'bg-green-500' : 
              status === 'disconnected' ? 'bg-red-500' : 
              'bg-yellow-500 animate-pulse'
            }`}></div>
            <span className="text-lg font-medium">
              {status === 'connected' ? '✅ Connected to Linera Testnet' :
               status === 'disconnected' ? '❌ Disconnected' :
               '⏳ Checking...'}
            </span>
          </div>

          {marketCount !== null && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-900 font-semibold">
                📊 Market Count: {marketCount}
              </p>
              <p className="text-blue-700 text-sm mt-1">
                {marketCount === 0 ? 'No markets created yet' : `${marketCount} markets on-chain`}
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-900 font-semibold">Error:</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          )}

          <button
            onClick={checkConnection}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>

        {/* Contract Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <h2 className="text-2xl font-semibold mb-4">Contract Information</h2>
          
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-semibold text-gray-700">Chain ID:</span>
              <p className="text-gray-600 font-mono text-xs break-all mt-1">
                10c453e40426ef2bdbe6d9ddf0164c04e24fbb9d5695c26f65df24c5d852d9f0
              </p>
            </div>
            
            <div>
              <span className="font-semibold text-gray-700">Application ID:</span>
              <p className="text-gray-600 font-mono text-xs break-all mt-1">
                3910a3b9f7f92fb9c47d9d460a26b4d7819c0a7f01a9cefbe5f575c4e74b6a76
              </p>
            </div>
            
            <div>
              <span className="font-semibold text-gray-700">GraphQL Endpoint:</span>
              <p className="text-gray-600 font-mono text-xs break-all mt-1">
                http://localhost:8080/chains/.../applications/...
              </p>
            </div>
            
            <div>
              <span className="font-semibold text-gray-700">Testnet:</span>
              <p className="text-gray-600 mt-1">Conway</p>
            </div>
          </div>
        </div>

        {/* Load Markets Test */}
        {status === 'connected' && (
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold mb-4">Query Markets</h2>
            
            <button
              onClick={loadMarkets}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mb-4"
            >
              {loading ? 'Loading...' : 'Load Markets from Chain'}
            </button>

            {markets.length > 0 ? (
              <div className="space-y-3">
                <p className="text-green-600 font-semibold">
                  ✅ Found {markets.length} markets on-chain!
                </p>
                {markets.map((market) => (
                  <div key={market.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="font-semibold text-gray-900">{market.question}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Category: {market.category} | Status: {market.status}
                    </p>
                    <p className="text-sm text-gray-600">
                      Pools: YES={market.yesPool} | NO={market.noPool}
                    </p>
                  </div>
                ))}
              </div>
            ) : marketCount === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-900">
                  ℹ️ No markets on-chain yet. Contract is deployed but empty.
                </p>
                <p className="text-yellow-700 text-sm mt-2">
                  To create markets, you need to submit operations via integration tests or a Go client.
                </p>
              </div>
            ) : null}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 How to Use</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
            <li>Ensure Linera service is running: <code className="bg-blue-100 px-2 py-1 rounded">linera service --port 8080</code></li>
            <li>Check connection status above</li>
            <li>Click "Load Markets from Chain" to query on-chain data</li>
            <li>If connected, frontend can read from deployed contract! ✅</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TestLinera;

