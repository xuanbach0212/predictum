import { useEffect, useState } from 'react';
import { getMarketFromLinera, type LineraMarket } from '../api/lineraQueries';
import type { Market } from '../types';

interface LineraDataCardProps {
  marketId: number;
  postgresMarket: Market;
}

type SyncStatus = 'synced' | 'pending' | 'failed' | 'checking';

const LineraDataCard = ({ marketId, postgresMarket }: LineraDataCardProps) => {
  const [lineraMarket, setLineraMarket] = useState<LineraMarket | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('checking');
  const [showComparison, setShowComparison] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLineraData();
  }, [marketId]);

  const loadLineraData = async () => {
    setLoading(true);
    setSyncStatus('checking');
    
    const result = await getMarketFromLinera(marketId);
    
    if (result.error) {
      setSyncStatus('failed');
      setLoading(false);
      return;
    }

    if (!result.data) {
      setSyncStatus('pending');
      setLoading(false);
      return;
    }

    setLineraMarket(result.data);
    
    // Compare data to determine sync status
    const isInSync = 
      result.data.question === postgresMarket.question &&
      result.data.status === postgresMarket.status;
    
    setSyncStatus(isInSync ? 'synced' : 'pending');
    setLoading(false);
  };

  const getStatusColor = (status: SyncStatus) => {
    switch (status) {
      case 'synced':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'checking':
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: SyncStatus) => {
    switch (status) {
      case 'synced':
        return '✅';
      case 'pending':
        return '⏳';
      case 'failed':
        return '❌';
      case 'checking':
        return '🔄';
    }
  };

  const getStatusText = (status: SyncStatus) => {
    switch (status) {
      case 'synced':
        return 'Synced to Linera';
      case 'pending':
        return 'Sync Pending';
      case 'failed':
        return 'Sync Failed';
      case 'checking':
        return 'Checking...';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span className="text-2xl">⛓️</span>
          On-Chain Data
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(syncStatus)}`}>
          {getStatusIcon(syncStatus)} {getStatusText(syncStatus)}
        </span>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-600">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-2"></div>
          <p className="text-sm">Loading on-chain data...</p>
        </div>
      ) : syncStatus === 'failed' ? (
        <div className="text-center py-8">
          <p className="text-red-600 mb-2">Failed to connect to Linera service</p>
          <button
            onClick={loadLineraData}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            Retry
          </button>
        </div>
      ) : syncStatus === 'pending' ? (
        <div className="text-center py-8">
          <p className="text-yellow-600 mb-2">Market not yet synced to blockchain</p>
          <p className="text-sm text-gray-600">Sync will happen automatically</p>
        </div>
      ) : lineraMarket ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {showComparison ? 'Hide' : 'Show'} Data Comparison
            </button>
            <a
              href={`http://localhost:8080/chains/10c453e40426ef2bdbe6d9ddf0164c04e24fbb9d5695c26f65df24c5d852d9f0/applications/3910a3b9f7f92fb9c47d9d460a26b4d7819c0a7f01a9cefbe5f575c4e74b6a76`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View on Linera
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {showComparison && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Field</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">PostgreSQL</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Linera</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 font-medium text-gray-700">Status</td>
                    <td className="px-4 py-2 text-gray-600">{postgresMarket.status}</td>
                    <td className="px-4 py-2 text-gray-600">{lineraMarket.status}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium text-gray-700">YES Pool</td>
                    <td className="px-4 py-2 text-gray-600">{postgresMarket.yesPool.toFixed(2)}</td>
                    <td className="px-4 py-2 text-gray-600">{lineraMarket.yesPool.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium text-gray-700">NO Pool</td>
                    <td className="px-4 py-2 text-gray-600">{postgresMarket.noPool.toFixed(2)}</td>
                    <td className="px-4 py-2 text-gray-600">{lineraMarket.noPool.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium text-gray-700">Winning Outcome</td>
                    <td className="px-4 py-2 text-gray-600">{postgresMarket.winningOutcome || 'N/A'}</td>
                    <td className="px-4 py-2 text-gray-600">{lineraMarket.winningOutcome || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ Hybrid Architecture:</strong> This market is stored in both PostgreSQL (for fast reads) 
              and Linera blockchain (for immutable verification). Critical operations are synced asynchronously.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default LineraDataCard;

