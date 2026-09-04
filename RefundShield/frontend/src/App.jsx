import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Clusters from './pages/Clusters';
import Investigation from './pages/Investigation';
import Metrics from './pages/Metrics';
import { Shield, LayoutDashboard, Users, Activity, BarChart3, Sun, Moon } from 'lucide-react';

function Sidebar({ darkMode, toggleDarkMode }) {
  const location = useLocation();
  
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
      <div className="p-4 border-t border-gray-200 dark:border-white/5">
        <button 
          onClick={toggleDarkMode}
          className="flex items-center space-x-3 w-full p-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all duration-300"
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-blue-600" />}
          <span className="font-medium">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
      <div className="p-4 text-xs text-gray-500 font-medium">
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
    <Router>
      <div className={`${darkMode ? 'dark' : ''}`}>
        <div className="flex bg-[#F8FAFC] dark:bg-[#0B0F19] min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-500 relative overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 dark:bg-blue-600/5 blur-[100px] pointer-events-none mix-blend-screen"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 dark:bg-indigo-600/5 blur-[100px] pointer-events-none mix-blend-screen"></div>

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
  );
}

export default App;
