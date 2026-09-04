import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, Filter, AlertTriangle } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000/api';

export default function Clusters() {
  const [clusters, setClusters] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE}/clusters`).then(res => setClusters(res.data));
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Suspicious Clusters</h1>
          <p className="text-gray-500 mt-1">Groups of accounts sharing devices, addresses, and suspicious behavior.</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
            <input type="text" placeholder="Search clusters..." className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm">
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
          <tbody className="divide-y divide-gray-100">
            {clusters.map((cluster) => (
              <tr key={cluster.cluster_id} className="hover:bg-blue-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-gray-900">
                  <div className="flex items-center space-x-2">
                    {cluster.risk_level === 'HIGH' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    <span>{cluster.cluster_id}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-center">
                  <span className="bg-gray-100 px-3 py-1 rounded-full font-medium text-gray-700">{cluster.num_accounts}</span>
                </td>
                <td className="px-6 py-4 text-sm text-center text-gray-600">{cluster.devices.length}</td>
                <td className="px-6 py-4 text-sm text-center text-gray-600">{cluster.addresses.length}</td>
                <td className="px-6 py-4 text-sm text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <span className={`font-semibold ${cluster.refund_rate > 0.5 ? 'text-red-600' : 'text-gray-700'}`}>
                      {(cluster.refund_rate * 100).toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium">₹{cluster.refund_value.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${cluster.risk_level === 'HIGH' ? 'bg-red-100 text-red-700' :
                      cluster.risk_level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>
                    {cluster.risk_level}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link to={`/clusters/${cluster.cluster_id}`} className="inline-flex items-center justify-center px-4 py-2 bg-razorpay-blue text-white rounded-lg text-sm font-medium hover:bg-blue-900 transition-colors">
                    Investigate
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clusters.length === 0 && (
          <div className="p-12 text-center text-gray-500">Loading clusters...</div>
        )}
      </div>
    </div>
  );
}
