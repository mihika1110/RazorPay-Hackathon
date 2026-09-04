import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, Activity, ShoppingCart, IndianRupee, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE = 'http://127.0.0.1:8000/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE}/stats`).then(res => setStats(res.data));
    axios.get(`${API_BASE}/orders`).then(res => setOrders(res.data));
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Risk Overview</h1>
      
      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard title="Orders Analyzed" value={stats.total_orders.toLocaleString()} icon={<ShoppingCart className="w-8 h-8 text-blue-500" />} />
          <StatCard title="Flagged Orders" value={stats.flagged_orders.toLocaleString()} icon={<Activity className="w-8 h-8 text-yellow-500" />} />
          <StatCard title="Suspicious Clusters" value={stats.suspicious_clusters} icon={<ShieldAlert className="w-8 h-8 text-red-500" />} />
          <StatCard title="Verified Dense Nodes" value={stats.dense_nodes} icon={<Building2 className="w-8 h-8 text-indigo-500" />} />
          <StatCard title="Refund Exposure" value={`₹${stats.potential_exposure.toLocaleString(undefined, {minimumFractionDigits: 2})}`} icon={<IndianRupee className="w-8 h-8 text-green-500" />} />
        </div>
      ) : (
        <div className="h-24 flex items-center justify-center"><div className="animate-pulse bg-gray-200 h-20 w-full rounded-xl"></div></div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Recent High-Risk Orders</h2>
          <Link to="/clusters" className="text-blue-600 hover:text-blue-700 text-sm font-semibold">Investigate Clusters →</Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 dark:text-slate-400 text-sm border-b dark:border-slate-700">
                <th className="pb-3 font-medium">Order ID</th>
                <th className="pb-3 font-medium">Account</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
              {orders.slice(0, 10).map((order) => (
                <tr key={order.order_id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="py-4 text-sm font-medium text-gray-900 dark:text-slate-100">{order.order_id}</td>
                  <td className="py-4 text-sm text-gray-600 dark:text-slate-300">{order.account_id}</td>
                  <td className="py-4 text-sm font-medium">₹{order.amount.toFixed(2)}</td>
                  <td className="py-4 text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${order.refund_requested ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300'}`}>
                      {order.refund_requested ? 'REFUNDED' : 'COMPLETED'}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-right">
                    <RiskBadge level={order.risk_level} score={order.risk_score} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
        </div>
        <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );
}

export function RiskBadge({ level, score }) {
  const colors = {
    HIGH: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50',
    MEDIUM: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50',
    LOW: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50'
  };
  return (
    <div className="flex flex-col items-end">
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colors[level] || colors.LOW}`}>
        {level}
      </span>
      {score !== undefined && <span className="text-xs text-gray-400 mt-1">{(score*100).toFixed(0)}%</span>}
    </div>
  );
}
