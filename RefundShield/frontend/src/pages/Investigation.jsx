import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Bot, ShieldAlert, Cpu, MapPin, CreditCard, Play } from 'lucide-react';
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
      <Link to="/clusters" className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Clusters</span>
      </Link>

      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Cluster {cluster.cluster_id}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              cluster.risk_level === 'HIGH' ? 'bg-red-100 text-red-700' : 
              cluster.risk_level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
            }`}>
              {cluster.risk_level} RISK
            </span>
          </div>
          <p className="text-gray-500">Showing structured risk signals and relationship data.</p>
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
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex space-x-12">
            <div>
              <p className="text-sm text-gray-500 mb-1">Accounts</p>
              <p className="text-2xl font-bold">{cluster.num_accounts}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Orders</p>
              <p className="text-2xl font-bold">{cluster.num_orders}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Refund Rate</p>
              <p className={`text-2xl font-bold ${cluster.refund_rate > 0.5 ? 'text-red-600' : ''}`}>{(cluster.refund_rate * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Refund Value</p>
              <p className="text-2xl font-bold">₹{cluster.refund_value.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold mb-4">Entity Relationships</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center space-x-2 text-gray-700 font-semibold mb-3">
                  <Cpu className="w-5 h-5" />
                  <span>Shared Devices ({cluster.devices.length})</span>
                </div>
                <div className="space-y-2">
                  {cluster.devices.map(d => <div key={d} className="text-sm font-mono bg-white p-2 border border-gray-100 rounded">{d}</div>)}
                </div>
              </div>
              <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center space-x-2 text-gray-700 font-semibold mb-3">
                  <MapPin className="w-5 h-5" />
                  <span>Shared Addresses ({cluster.addresses.length})</span>
                </div>
                <div className="space-y-2">
                  {cluster.addresses.map(a => <div key={a} className="text-sm font-mono bg-white p-2 border border-gray-100 rounded">{a}</div>)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold mb-4">Order History</h3>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="pb-2">Account</th>
                    <th className="pb-2">Order ID</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {cluster.order_details.slice(0, 15).map(o => (
                    <tr key={o.order_id}>
                      <td className="py-2 text-gray-600">{o.account_id}</td>
                      <td className="py-2 font-mono text-gray-900">{o.order_id}</td>
                      <td className="py-2 font-medium">₹{o.amount.toFixed(2)}</td>
                      <td className="py-2">
                        {o.refund_requested ? <span className="text-red-600 font-semibold text-xs">REFUNDED</span> : <span className="text-green-600 font-semibold text-xs">COMPLETED</span>}
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
            ${report ? 'bg-white border-blue-100 ring-4 ring-blue-50' : 'bg-gray-50 border-gray-200 border-dashed'}`}>
            
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
              <div className={`p-2 rounded-lg ${report ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400'}`}>
                <Bot className="w-6 h-6" />
              </div>
              <h2 className={`font-bold text-lg ${report ? 'text-gray-900' : 'text-gray-400'}`}>
                AI Investigator Report
              </h2>
            </div>

            {loadingAI ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-20 bg-gray-200 rounded w-full mt-6"></div>
              </div>
            ) : report ? (
              <div className="prose prose-sm max-w-none text-gray-700 
                prose-headings:text-gray-900 prose-headings:font-bold prose-headings:mb-2 prose-headings:mt-4
                prose-p:mb-3 prose-li:mb-1">
                <ReactMarkdown>{report.report}</ReactMarkdown>
                
                <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-xs text-blue-800 font-semibold uppercase tracking-wider mb-1">Recommended Action</p>
                  <p className="text-sm font-bold text-blue-900">{report.recommended_action}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
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
