import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Bot, ShieldAlert, Cpu, MapPin, CreditCard, Play, Building2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const API_BASE = 'http://127.0.0.1:8000/api';

export default function Investigation() {
  const { id } = useParams();
  const [cluster, setCluster] = useState(null);
  const [report, setReport] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE}/clusters/${id}`).then(res => setCluster(res.data)).catch(console.error);
  }, [id]);

  const runInvestigation = async () => {
    setLoadingAI(true);
    try {
      const res = await axios.post(`${API_BASE}/investigate/${id}`);
      setReport(res.data);
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
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
              cluster.risk_level === 'HIGH' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50' : 
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
          disabled={loadingAI || report}
          className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all shadow-sm
            ${report ? 'bg-green-100 text-green-700 cursor-not-allowed border border-green-200' : 
              loadingAI ? 'bg-blue-100 text-blue-700 cursor-wait' : 'bg-razorpay-blue text-white hover:bg-blue-900 hover:shadow-md'}`}
        >
          {loadingAI ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700 mr-2"></div>
          ) : report ? (
            <Bot className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 fill-current" />
          )}
          <span>{loadingAI ? 'Agent Investigating...' : report ? 'Investigation Complete' : 'Run AI Investigation'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Data & Graph */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 flex space-x-12">
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Accounts</p>
              <p className="text-2xl font-bold dark:text-white">{cluster.num_accounts}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Orders</p>
              <p className="text-2xl font-bold dark:text-white">{cluster.num_orders}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Refund Rate</p>
              <p className={`text-2xl font-bold ${cluster.refund_rate > 0.5 ? 'text-red-600 dark:text-red-400' : 'dark:text-white'}`}>{(cluster.refund_rate * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Total Refund Value</p>
              <p className="text-2xl font-bold dark:text-white">₹{cluster.refund_value.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
            <h3 className="text-lg font-bold mb-4 dark:text-white">Entity Relationships</h3>
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
          
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
            <h3 className="text-lg font-bold mb-4 dark:text-white">Order History</h3>
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
                <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                  {cluster.order_details.slice(0, 15).map(o => (
                    <tr key={o.order_id}>
                      <td className="py-2 text-gray-600 dark:text-slate-300">{o.account_id}</td>
                      <td className="py-2 font-mono text-gray-900 dark:text-slate-100">{o.order_id}</td>
                      <td className="py-2 font-medium dark:text-slate-200">₹{o.amount.toFixed(2)}</td>
                      <td className="py-2">
                        {o.refund_requested ? <span className="text-red-600 dark:text-red-400 font-semibold text-xs">REFUNDED</span> : <span className="text-green-600 dark:text-green-400 font-semibold text-xs">COMPLETED</span>}
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
          <div className={`rounded-xl shadow-sm border p-6 min-h-full transition-all duration-500
            ${report ? 'bg-white dark:bg-slate-800 border-blue-100 dark:border-blue-900/50 ring-4 ring-blue-50 dark:ring-blue-900/20' : 'bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 border-dashed'}`}>
            
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100 dark:border-slate-700">
              <div className={`p-2 rounded-lg ${report ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500'}`}>
                <Bot className="w-6 h-6" />
              </div>
              <h2 className={`font-bold text-lg ${report ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-500'}`}>
                AI Investigator Report
              </h2>
            </div>

            {loadingAI ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
                <div className="h-20 bg-gray-200 dark:bg-slate-700 rounded w-full mt-6"></div>
              </div>
            ) : report ? (
              <div className="prose prose-sm max-w-none text-gray-700 dark:text-slate-300 
                prose-headings:text-gray-900 dark:prose-headings:text-white prose-headings:font-bold prose-headings:mb-2 prose-headings:mt-4
                prose-p:mb-3 prose-li:mb-1">
                <ReactMarkdown>{report.report}</ReactMarkdown>
                
                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-lg">
                  <p className="text-xs text-blue-800 dark:text-blue-300 font-semibold uppercase tracking-wider mb-1">Recommended Action</p>
                  <p className="text-sm font-bold text-blue-900 dark:text-blue-100">{report.recommended_action}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 dark:text-slate-500">
                <Bot className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Click "Run AI Investigation" to task the agent to review this cluster.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
