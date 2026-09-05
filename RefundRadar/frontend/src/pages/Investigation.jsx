import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Bot, ShieldAlert, Cpu, MapPin, CreditCard, Play, Building2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { API_BASE } from '../config';

export default function Investigation() {
  const { id } = useParams();
  const [cluster, setCluster] = useState(null);
  const [report, setReport] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const fetchCluster = () => {
    axios.get(`${API_BASE}/clusters/${id}`)
      .then(res => setCluster(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchCluster();
    const interval = setInterval(fetchCluster, 8000); // sync with live stream
    return () => clearInterval(interval);
  }, [id]);

  const runInvestigation = async () => {
    setLoadingAI(true);
    try {
      const res = await axios.post(`${API_BASE}/investigate/${id}`);
      setReport(res.data);
      // Immediately refresh the cluster state to sync with latest stream updates
      fetchCluster();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAI(false);
    }
  };

  if (!cluster) return <div className="p-12 text-center">Loading cluster...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <Link to="/clusters" className="flex items-center space-x-2 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Clusters</span>
      </Link>

      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cluster {cluster.cluster_id}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${cluster.risk_level === 'HIGH' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50' :
              cluster.risk_level === 'MEDIUM' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50'
              }`}>
              {cluster.risk_level} RISK
            </span>
            {cluster.is_dense_living && (
              <span className="flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 shadow-sm" title="Verified via Maps API">
                <Building2 className="w-4 h-4 mr-1.5" />
                DENSE LIVING AREA ({cluster.location_type})
              </span>
            )}
          </div>
          <p className="text-gray-500 dark:text-slate-400">Showing structured risk signals and relationship data.</p>
        </div>

        <button
          onClick={runInvestigation}
          disabled={loadingAI}
          className="relative group flex items-center space-x-2 px-6 py-3 rounded-lg font-bold text-white transition-all overflow-hidden shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-[length:200%_auto] animate-[gradient_2s_linear_infinite] opacity-90 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative flex items-center space-x-2">
            {loadingAI ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Play className="w-5 h-5 fill-current" />
            )}
            <span>{loadingAI ? 'Analyzing...' : 'Run AI Investigation'}</span>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Data & Graph */}
        <div className="lg:col-span-2 space-y-6">

          <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl rounded-xl shadow-lg border border-gray-100/50 dark:border-slate-700/50 p-6 flex space-x-12">
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Accounts</p>
              <p className="text-3xl font-bold dark:text-white tracking-tight">{cluster.num_accounts}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Orders</p>
              <p className="text-3xl font-bold dark:text-white tracking-tight">{cluster.num_orders}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Refund Rate</p>
              <p className={`text-3xl font-bold tracking-tight ${cluster.refund_rate > 0.5 ? 'text-red-600 dark:text-red-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]' : 'dark:text-white'}`}>{(cluster.refund_rate * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Total Refund Value</p>
              <p className="text-3xl font-bold dark:text-white tracking-tight">₹{cluster.refund_value.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl rounded-xl shadow-lg border border-gray-100/50 dark:border-slate-700/50 p-6">
            <h3 className="text-lg font-bold mb-4 dark:text-white flex items-center space-x-2">
              <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
              <span>Entity Relationships</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-gray-100 dark:border-slate-700 rounded-lg p-4 bg-gray-50 dark:bg-slate-700/50">
                <div className="flex items-center space-x-2 text-gray-700 dark:text-slate-200 font-semibold mb-3">
                  <Cpu className="w-5 h-5" />
                  <span>Shared Devices ({cluster.devices.length})</span>
                </div>
                <div className="space-y-2">
                  {cluster.devices.map(d => <div key={d} className="text-sm font-mono bg-white dark:bg-slate-800 p-2 border border-gray-100 dark:border-slate-600 rounded">{d}</div>)}
                </div>
              </div>
              <div className="border border-gray-100 dark:border-slate-700 rounded-lg p-4 bg-gray-50 dark:bg-slate-700/50">
                <div className="flex items-center space-x-2 text-gray-700 dark:text-slate-200 font-semibold mb-3">
                  <MapPin className="w-5 h-5" />
                  <span>Shared Addresses ({cluster.addresses.length})</span>
                </div>
                <div className="space-y-2">
                  {cluster.addresses.map(a => <div key={a} className="text-sm font-mono bg-white dark:bg-slate-800 p-2 border border-gray-100 dark:border-slate-600 rounded">{a}</div>)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl rounded-xl shadow-lg border border-gray-100/50 dark:border-slate-700/50 p-6">
            <h3 className="text-lg font-bold mb-4 dark:text-white flex items-center space-x-2">
              <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
              <span>Order History</span>
            </h3>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b dark:border-slate-700 text-gray-500 dark:text-slate-400">
                    <th className="pb-2">Account</th>
                    <th className="pb-2">Order ID</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                  {cluster.order_details.slice(0, 15).map(o => (
                    <tr key={o.order_id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-all duration-300">
                      <td className="py-3 text-gray-600 dark:text-slate-300 group-hover:text-blue-500 transition-colors">{o.account_id}</td>
                      <td className="py-3 font-mono text-gray-900 dark:text-slate-100">{o.order_id}</td>
                      <td className="py-3 font-medium dark:text-slate-200">₹{o.amount.toFixed(2)}</td>
                      <td className="py-3">
                        {o.refund_requested ? <span className="text-red-600 dark:text-red-400 font-semibold text-xs border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded">REFUNDED</span> : <span className="text-green-600 dark:text-green-400 font-semibold text-xs border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">COMPLETED</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: AI Report */}
        <div className="lg:col-span-1">
          <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl rounded-xl shadow-lg border border-gray-100/50 dark:border-slate-700/50 p-6 min-h-full transition-all duration-300 relative overflow-hidden">

            {report && (
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600"></div>
            )}

            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100 dark:border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${report ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500'}`}>
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-gray-900 dark:text-white">
                    AI Investigator Report
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Autonomous analysis</p>
                </div>
              </div>

              {report && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${report.risk_level === 'HIGH' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50' :
                  report.risk_level === 'MEDIUM' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50'
                  }`}>
                  {report.risk_level} RISK
                </span>
              )}
            </div>

            {loadingAI ? (
              <div className="space-y-4 py-4 animate-pulse">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping"></div>
                  <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
                </div>
                <div className="h-16 bg-gray-50 dark:bg-slate-700/50 rounded-lg w-full"></div>
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-10 bg-gray-50 dark:bg-slate-700/50 rounded-lg w-full"></div>
                  <div className="h-10 bg-gray-50 dark:bg-slate-700/50 rounded-lg w-full"></div>
                </div>
                <div className="h-12 bg-blue-50/50 dark:bg-slate-700/50 rounded-lg w-full mt-4"></div>
              </div>
            ) : report ? (
              <div className="space-y-4 text-xs">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    table: ({ node, ...props }) => (
                      <div className="overflow-x-auto my-3 rounded-xl border border-gray-200 dark:border-slate-700/80 shadow-sm bg-white/70 dark:bg-slate-900/60">
                        <table className="w-full text-left border-collapse text-[11px] sm:text-xs" {...props} />
                      </div>
                    ),
                    thead: ({ node, ...props }) => (
                      <thead className="bg-gray-100/90 dark:bg-slate-800/90 border-b border-gray-200 dark:border-slate-700" {...props} />
                    ),
                    th: ({ node, ...props }) => (
                      <th className="px-3 py-2 font-bold text-gray-800 dark:text-gray-200 tracking-wide" {...props} />
                    ),
                    tbody: ({ node, ...props }) => (
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60" {...props} />
                    ),
                    td: ({ node, ...props }) => (
                      <td className="px-3 py-2 text-gray-700 dark:text-slate-300 whitespace-normal leading-relaxed align-top" {...props} />
                    ),
                    h1: ({ children }) => (
                      <div className="pb-2 mb-3 border-b border-gray-100 dark:border-slate-700/50">
                        <span className="text-xs font-mono font-semibold text-gray-500 dark:text-slate-400">
                          {children}
                        </span>
                      </div>
                    ),
                    h2: ({ children }) => (
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white flex items-center space-x-2 mt-4 mb-2">
                        <span className="w-1.5 h-3.5 bg-blue-500 rounded-full"></span>
                        <span>{children}</span>
                      </h3>
                    ),
                    ul: ({ children }) => (
                      <ul className="space-y-2 my-2">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="space-y-2 my-2">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="flex items-start space-x-2 text-xs text-gray-700 dark:text-slate-200 bg-gray-50 dark:bg-slate-700/50 p-2.5 rounded-lg border border-gray-100 dark:border-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        <span className="leading-relaxed flex-1">{children}</span>
                      </li>
                    ),
                    p: ({ children }) => (
                      <p className="text-xs leading-relaxed text-gray-600 dark:text-slate-300 mb-2">{children}</p>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>
                    ),
                    blockquote: ({ children }) => (
                      <div className="p-3 my-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 text-xs text-blue-900 dark:text-blue-200">
                        {children}
                      </div>
                    )
                  }}
                >
                  {report.report}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 dark:text-slate-500">
                <Bot className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-xs">Click "Run AI Investigation" to task the agent to review this cluster.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
