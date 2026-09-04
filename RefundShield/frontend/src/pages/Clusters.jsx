import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, Filter, AlertTriangle, Building2 } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000/api';

export default function Clusters() {
  const [clusters, setClusters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE}/clusters`).then(res => setClusters(res.data));
  }, []);

  const filteredClusters = clusters.filter(c => {
    const matchesSearch = c.cluster_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = riskFilter === 'ALL' || c.risk_level === riskFilter;
    return matchesSearch && matchesFilter;
  });

  const selectFilter = (level) => {
    setRiskFilter(level);
    setIsFilterOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div className="animate-fade-up">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Suspicious Clusters</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Groups of accounts sharing devices, addresses, and suspicious behavior.</p>
        </div>
        <div className="flex space-x-3 relative z-50 animate-fade-up [animation-delay:100ms] opacity-0 fill-mode-forwards">
          <div className="relative group">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search clusters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm dark:text-white transition-all shadow-sm"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-200 dark:border-slate-700/50 rounded-lg bg-white/80 dark:bg-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-700 backdrop-blur-sm transition-all shadow-sm hover:shadow-md"
            >
              <Filter className="w-4 h-4" />
              <span>{riskFilter === 'ALL' ? 'Filter' : `Risk: ${riskFilter}`}</span>
            </button>
            
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
                {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((level) => (
                  <button
                    key={level}
                    onClick={() => selectFilter(level)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors ${riskFilter === level ? 'font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20' : 'text-gray-700 dark:text-slate-300'}`}
                  >
                    {level === 'ALL' ? 'All Risks' : level}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl rounded-xl shadow-lg border border-gray-100/50 dark:border-slate-700/50 overflow-hidden animate-fade-up [animation-delay:200ms] opacity-0 fill-mode-forwards">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 dark:bg-slate-800/30 text-gray-600 dark:text-slate-400 text-sm border-b dark:border-slate-700/50 backdrop-blur-md">
            <tr>
              <th className="px-6 py-4 font-semibold">Cluster ID</th>
              <th className="px-6 py-4 font-semibold text-center">Accounts</th>
              <th className="px-6 py-4 font-semibold text-center">Shared Devices</th>
              <th className="px-6 py-4 font-semibold text-center">Shared Addresses</th>
              <th className="px-6 py-4 font-semibold text-center">Refund Rate</th>
              <th className="px-6 py-4 font-semibold">Total Exposure</th>
              <th className="px-6 py-4 font-semibold">Risk Level</th>
              <th className="px-6 py-4 font-semibold"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
            {filteredClusters.map((cluster, index) => (
              <tr key={cluster.cluster_id} className="group hover:bg-blue-50/50 dark:hover:bg-slate-700/30 transition-all duration-300 animate-fade-up opacity-0 fill-mode-forwards" style={{ animationDelay: `${300 + index * 50}ms` }}>
                <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  <div className="flex items-center space-x-2">
                    {cluster.risk_level === 'HIGH' && <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />}
                    <span>{cluster.cluster_id}</span>
                    {cluster.is_dense_living && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400" title={`Verified: ${cluster.location_type}`}>
                        <Building2 className="w-3 h-3 mr-1" />
                        Dense Node
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-center">
                  <span className="bg-gray-100 dark:bg-slate-700/50 border border-transparent dark:border-slate-600 px-3 py-1 rounded-full font-medium text-gray-700 dark:text-slate-300">{cluster.num_accounts}</span>
                </td>
                <td className="px-6 py-4 text-sm text-center text-gray-600 dark:text-slate-400">{cluster.devices.length}</td>
                <td className="px-6 py-4 text-sm text-center text-gray-600 dark:text-slate-400">{cluster.addresses.length}</td>
                <td className="px-6 py-4 text-sm text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <span className={`font-semibold ${cluster.refund_rate > 0.5 ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-slate-300'}`}>
                      {(cluster.refund_rate * 100).toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium">₹{cluster.refund_value.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm ${cluster.risk_level === 'HIGH' ? 'bg-red-100/80 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]' :
                    cluster.risk_level === 'MEDIUM' ? 'bg-yellow-100/80 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50' : 'bg-green-100/80 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50'
                    }`}>
                    {cluster.risk_level}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link to={`/clusters/${cluster.cluster_id}`} className="inline-flex items-center space-x-1 text-sm font-semibold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Investigate</span>
                    <span className="text-lg leading-none">&rarr;</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clusters.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-slate-400">Loading clusters...</div>
        ) : filteredClusters.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-slate-400">No clusters found matching your search.</div>
        ) : null}
      </div>
    </div>
  );
}
