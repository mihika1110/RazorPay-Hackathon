import { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Activity, Zap, Server, CheckCircle2, XCircle, Database, PieChart } from 'lucide-react';
import { useStream } from '../context/StreamContext';
import { API_BASE } from '../config';

export default function Metrics() {
  const [metrics, setMetrics] = useState(null);
  const { isStreaming } = useStream();

  useEffect(() => {
    const fetchMetrics = () =>
      axios.get(`${API_BASE}/metrics`).then(res => setMetrics(res.data));
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, []);

  if (!metrics) return <div className="p-12 text-center text-gray-500">Loading metrics...</div>;
  if (metrics.error) return <div className="p-12 text-center text-red-500">{metrics.error}</div>;

  const [tn, fp] = metrics.confusion_matrix[0];
  const [fn, tp] = metrics.confusion_matrix[1];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white animate-fade-up">Model Performance Metrics</h1>
          <p className="text-gray-500 dark:text-slate-400 animate-fade-up [animation-delay:100ms] opacity-0 fill-mode-forwards">
            {metrics.live_mode
              ? 'Live test metrics — computed on real-time streaming orders (unseen during training).'
              : 'Validation set metrics — live test metrics will appear once data starts streaming.'}
          </p>
        </div>

        <div
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border transition-all duration-300 shadow-sm animate-fade-up ${isStreaming
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400'
            : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-400'
            }`}
        >
          <span className="relative flex h-2 w-2">
            {isStreaming && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isStreaming ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </span>
          <span className="text-xs font-semibold tracking-wide">
            {isStreaming ? 'LIVE' : 'PAUSED'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 h-48">
        <div className="animate-fade-up [animation-delay:200ms] opacity-0 fill-mode-forwards"><MetricCard title="Precision" value={`${metrics.precision}%`} icon={<Target className="text-blue-500" />} desc="Accuracy of flagged orders" formula="TP / (TP + FP)" formulaDesc="Out of all orders we flagged as abuse, what percentage were actually abuse?" legend="TP = True Positives, FP = False Positives" /></div>
        <div className="animate-fade-up [animation-delay:300ms] opacity-0 fill-mode-forwards"><MetricCard title="Recall" value={`${metrics.recall}%`} icon={<Zap className="text-yellow-500" />} desc="Detection rate of abusive orders" formula="TP / (TP + FN)" formulaDesc="Out of all actual abusive orders, what percentage did we successfully flag?" legend="TP = True Positives, FN = False Negatives" /></div>
        <div className="animate-fade-up [animation-delay:400ms] opacity-0 fill-mode-forwards"><MetricCard title="F1 Score" value={`${metrics.f1}%`} icon={<Activity className="text-green-500" />} desc="Harmonic mean of precision and recall" formula="2 × (P × R) / (P + R)" formulaDesc="A balanced measure that is only high if both Precision and Recall are high." legend="P = Precision, R = Recall" /></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">

        {/* Confusion Matrix */}
        <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl rounded-xl shadow-lg border border-gray-100/50 dark:border-slate-700/50 p-6 animate-fade-up [animation-delay:500ms] opacity-0 fill-mode-forwards">
          <h3 className="text-lg font-bold mb-6 dark:text-white flex items-center space-x-2">
            <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
            <span>Confusion Matrix</span>
          </h3>

          <div className="grid grid-cols-3 gap-2 text-sm text-center">
            <div className="p-4"></div>
            <div className="p-4 font-semibold text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-700/50 rounded">Predicted Normal</div>
            <div className="p-4 font-semibold text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-700/50 rounded">Predicted Abuse</div>

            <div className="p-4 font-semibold text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-700/50 rounded flex items-center justify-center">Actual Normal</div>
            <div className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 rounded-lg flex flex-col items-center justify-center hover:scale-[1.05] hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 cursor-default animate-fade-up [animation-delay:600ms] opacity-0 fill-mode-forwards">
              <span className="text-2xl font-bold text-green-700 dark:text-green-400">{tn}</span>
              <span className="text-xs text-green-600 dark:text-green-500 mt-1">True Negatives</span>
            </div>
            <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-lg flex flex-col items-center justify-center hover:scale-[1.05] hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 cursor-default animate-fade-up [animation-delay:700ms] opacity-0 fill-mode-forwards">
              <span className="text-2xl font-bold text-red-700 dark:text-red-400">{fp}</span>
              <span className="text-xs text-red-600 dark:text-red-500 mt-1">False Positives</span>
            </div>

            <div className="p-4 font-semibold text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-700/50 rounded flex items-center justify-center">Actual Abuse</div>
            <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800/50 rounded-lg flex flex-col items-center justify-center hover:scale-[1.05] hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-300 cursor-default animate-fade-up [animation-delay:800ms] opacity-0 fill-mode-forwards">
              <span className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{fn}</span>
              <span className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">False Negatives</span>
            </div>
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-lg flex flex-col items-center justify-center hover:scale-[1.05] hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 cursor-default animate-fade-up [animation-delay:900ms] opacity-0 fill-mode-forwards">
              <span className="text-2xl font-bold text-blue-700 dark:text-blue-400">{tp}</span>
              <span className="text-xs text-blue-600 dark:text-blue-500 mt-1">True Positives</span>
            </div>
          </div>
        </div>

        {/* Dataset Info */}
        <div className="space-y-6">
          <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl rounded-xl shadow-lg border border-gray-100/50 dark:border-slate-700/50 p-6 animate-fade-up [animation-delay:600ms] opacity-0 fill-mode-forwards">
            <h3 className="text-lg font-bold mb-4 dark:text-white flex items-center space-x-2">
              <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
              <span>Dataset Details</span>
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <div className="flex items-center space-x-3 text-gray-700 dark:text-slate-300">
                  <Server className="w-5 h-5 text-gray-400 dark:text-slate-500" />
                  <span className="font-medium">Training Records</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">{metrics.train_records.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <div className="flex items-center space-x-3 text-gray-700 dark:text-slate-300">
                  <Database className="w-5 h-5 text-gray-400 dark:text-slate-500" />
                  <span className="font-medium">Validation Set (Hyperparameter Tuning)</span>
                </div>
                <span className="font-bold dark:text-white">{metrics.val_records?.toLocaleString() || 0} records</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg border-2 border-dashed border-green-300 dark:border-green-700/50 bg-green-50/50 dark:bg-green-900/10">
                <div className="flex items-center space-x-3 text-gray-700 dark:text-slate-300">
                  <PieChart className="w-5 h-5 text-green-500" />
                  <div>
                    <span className="font-medium block">Live Test Set (Real-World Evaluation)</span>
                    <span className="text-xs text-gray-400 dark:text-slate-500">New streaming orders — never seen during training</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold dark:text-white block">{metrics.test_records.toLocaleString()} records</span>
                  {!metrics.live_mode && <span className="text-xs text-gray-400 dark:text-slate-500">Waiting for stream...</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl rounded-xl shadow-lg border border-gray-100/50 dark:border-slate-700/50 p-6 animate-fade-up [animation-delay:700ms] opacity-0 fill-mode-forwards">
            <h3 className="text-lg font-bold mb-4 dark:text-white flex items-center space-x-2">
              <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
              <span>Business Impact</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 text-sm">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <p className="text-gray-600 dark:text-slate-400">
                  <strong className="text-gray-900 dark:text-white">False Positive Rate: {metrics.false_positive_rate}%</strong>
                  <br />Low FPR ensures legitimate customers are not unnecessarily blocked or delayed.
                </p>
              </div>
              <div className="flex items-start space-x-3 text-sm mt-4">
                <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-gray-600 dark:text-slate-400">
                  <strong className="text-gray-900 dark:text-white">False Negative Rate: {metrics.false_negative_rate}%</strong>
                  <br />Minimizing FNR maximizes the detection of coordinated abuse clusters.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, desc, formula, formulaDesc, legend }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="group cursor-pointer relative h-48 w-full [perspective:1000px] hover:-translate-y-2 hover:scale-[1.02] transition-transform duration-300"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>

        {/* Front */}
        <div className="absolute w-full h-full bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl p-6 rounded-xl shadow-sm border border-gray-100/50 dark:border-slate-700/50 flex flex-col justify-between hover:shadow-lg dark:hover:shadow-blue-500/20 dark:hover:border-blue-500/50 hover:border-blue-400/50 transition-all duration-500 [backface-visibility:hidden] overflow-hidden">

          {/* Hover Shine Animation */}
          <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/60 dark:via-white/10 to-transparent skew-x-[-25deg] group-hover:animate-[shine_1s_ease-in-out_forwards] pointer-events-none"></div>

          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{title}</h3>
            <div className="p-2 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-700/50 dark:to-slate-800/50 rounded-lg border border-white/50 dark:border-white/5 shadow-inner group-hover:scale-110 transition-transform">{icon}</div>
          </div>
          <div className="relative z-10 flex flex-col justify-end h-full mt-2">
            <p className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 tracking-tighter drop-shadow-sm">{value}</p>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 leading-snug">{desc}</p>
          </div>
        </div>

        {/* Back */}
        <div className="absolute w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-xl shadow-lg border border-blue-400/30 flex flex-col justify-center items-center text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <h3 className="text-sm font-bold text-blue-200 uppercase tracking-wider mb-2">{title} Formula</h3>
          <p className="text-xl font-mono bg-black/20 px-4 py-2 rounded-lg mb-2 shadow-inner w-full">{formula}</p>
          <p className="text-xs text-blue-200 font-mono mb-2 bg-black/10 px-2 py-1 rounded w-full">{legend}</p>
          <p className="text-xs text-blue-100 leading-tight">{formulaDesc}</p>
        </div>

      </div>
    </div>
  );
}
