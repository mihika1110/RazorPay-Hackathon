import { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Activity, Zap, Server, CheckCircle2, XCircle } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000/api';

export default function Metrics() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE}/metrics`).then(res => setMetrics(res.data));
  }, []);

  if (!metrics) return <div className="p-12 text-center text-gray-500">Loading metrics...</div>;
  if (metrics.error) return <div className="p-12 text-center text-red-500">{metrics.error}</div>;

  const [tn, fp] = metrics.confusion_matrix[0];
  const [fn, tp] = metrics.confusion_matrix[1];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl">
      <h1 className="text-3xl font-bold text-gray-900">Model Performance Metrics</h1>
      <p className="text-gray-500">Evaluated on a held-out synthetic test set.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <MetricCard title="Precision" value={`${metrics.precision}%`} icon={<Target className="text-blue-500" />} desc="Accuracy of flagged orders" />
        <MetricCard title="Recall" value={`${metrics.recall}%`} icon={<Zap className="text-yellow-500" />} desc="Detection rate of abusive orders" />
        <MetricCard title="F1 Score" value={`${metrics.f1}%`} icon={<Activity className="text-green-500" />} desc="Harmonic mean of precision and recall" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        
        {/* Confusion Matrix */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold mb-6">Confusion Matrix</h3>
          
          <div className="grid grid-cols-3 gap-2 text-sm text-center">
            <div className="p-4"></div>
            <div className="p-4 font-semibold text-gray-600 bg-gray-50 rounded">Predicted Normal</div>
            <div className="p-4 font-semibold text-gray-600 bg-gray-50 rounded">Predicted Abuse</div>
            
            <div className="p-4 font-semibold text-gray-600 bg-gray-50 rounded flex items-center justify-center">Actual Normal</div>
            <div className="p-6 bg-green-50 border border-green-100 rounded-lg flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-green-700">{tn}</span>
              <span className="text-xs text-green-600 mt-1">True Negatives</span>
            </div>
            <div className="p-6 bg-red-50 border border-red-100 rounded-lg flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-red-700">{fp}</span>
              <span className="text-xs text-red-600 mt-1">False Positives</span>
            </div>
            
            <div className="p-4 font-semibold text-gray-600 bg-gray-50 rounded flex items-center justify-center">Actual Abuse</div>
            <div className="p-6 bg-yellow-50 border border-yellow-100 rounded-lg flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-yellow-700">{fn}</span>
              <span className="text-xs text-yellow-600 mt-1">False Negatives</span>
            </div>
            <div className="p-6 bg-blue-50 border border-blue-100 rounded-lg flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-blue-700">{tp}</span>
              <span className="text-xs text-blue-600 mt-1">True Positives</span>
            </div>
          </div>
        </div>

        {/* Dataset Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold mb-4">Dataset Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3 text-gray-700">
                  <Server className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">Training Records</span>
                </div>
                <span className="font-bold text-gray-900">{metrics.train_records.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3 text-gray-700">
                  <Server className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">Held-Out Test Records</span>
                </div>
                <span className="font-bold text-gray-900">{metrics.test_records.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold mb-4">Business Impact</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 text-sm">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <p className="text-gray-600">
                  <strong className="text-gray-900">False Positive Rate: {metrics.false_positive_rate}%</strong>
                  <br/>Low FPR ensures legitimate customers are not unnecessarily blocked or delayed.
                </p>
              </div>
              <div className="flex items-start space-x-3 text-sm mt-4">
                <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-gray-600">
                  <strong className="text-gray-900">False Negative Rate: {metrics.false_negative_rate}%</strong>
                  <br/>Minimizing FNR maximizes the detection of coordinated abuse clusters.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, desc }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
      </div>
      <div>
        <p className="text-4xl font-black text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-2">{desc}</p>
      </div>
    </div>
  );
}
