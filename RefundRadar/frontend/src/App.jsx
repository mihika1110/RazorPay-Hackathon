import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Clusters from './pages/Clusters';
import Investigation from './pages/Investigation';
import Metrics from './pages/Metrics';
import { Shield, LayoutDashboard, Users, Activity, BarChart3, Sun, Moon, Radio, Pause, Play, Loader2 } from 'lucide-react';
import { StreamProvider, useStream } from './context/StreamContext';

function Sidebar({ darkMode, toggleDarkMode }) {
  const location = useLocation();
  const { isStreaming, isToggling, toggleStream } = useStream();
  
  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Clusters', path: '/clusters', icon: Users },
    { name: 'Metrics', path: '/metrics', icon: BarChart3 },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gradient-to-b dark:from-[#02042b] dark:to-[#0a1128] text-gray-900 dark:text-white h-screen flex flex-col fixed border-r border-gray-200 dark:border-gray-800/50 shadow-lg dark:shadow-2xl z-50 transition-colors duration-500">
      <div className="p-6 flex items-center space-x-3 border-b border-gray-200 dark:border-white/5">
        <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400 dark:drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
        <span className="text-xl font-bold tracking-wide">RefundShield</span>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {links.map(link => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path || (location.pathname.startsWith('/clusters') && link.path === '/clusters');
          return (
            <Link key={link.path} to={link.path} className={`group flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${isActive ? 'bg-blue-600/10 dark:bg-blue-600/90 text-blue-700 dark:text-white dark:shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-100'}`}>
              <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="font-medium">{link.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Live Stream Controller */}
      <div className="p-4 border-t border-gray-200 dark:border-white/5 space-y-3">
        <div className="bg-gray-50 dark:bg-slate-800/40 p-3 rounded-xl border border-gray-200/60 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                {isStreaming && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isStreaming ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              </span>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {isStreaming ? 'Live Stream' : 'Stream Paused'}
              </span>
            </div>
            {isToggling && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />}
          </div>

          <button
            onClick={toggleStream}
            disabled={isToggling}
            className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-all duration-300 ${
              isStreaming
                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30'
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30'
            }`}
            title={isStreaming ? "Pause synthetic order generation" : "Resume synthetic order generation"}
          >
            {isStreaming ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Generation</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Start Simulation</span>
              </>
            )}
          </button>
        </div>

        <button 
          onClick={toggleDarkMode}
          className="flex items-center space-x-3 w-full p-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all duration-300 text-sm"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-blue-600" />}
          <span className="font-medium">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>

      <div className="px-4 pb-4 text-[11px] text-gray-400 dark:text-gray-500 font-medium text-center">
        Razorpay AI Buildathon 2026
      </div>
    </div>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <StreamProvider>
      <Router>
        <div className={`${darkMode ? 'dark' : ''}`}>
          <div className="flex bg-[#F8FAFC] dark:bg-[#0B0F19] min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-500 relative overflow-hidden">
            {/* Ambient Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 dark:bg-blue-600/5 blur-[100px] pointer-events-none mix-blend-screen animate-float"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 dark:bg-indigo-600/5 blur-[100px] pointer-events-none mix-blend-screen animate-float [animation-delay:2s]"></div>

            <Sidebar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            
            <div className="flex-1 ml-64 p-8 overflow-y-auto h-screen relative z-10">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/clusters" element={<Clusters />} />
                <Route path="/clusters/:id" element={<Investigation />} />
                <Route path="/metrics" element={<Metrics />} />
              </Routes>
            </div>
          </div>
        </div>
      </Router>
    </StreamProvider>
  );
}

export default App;
