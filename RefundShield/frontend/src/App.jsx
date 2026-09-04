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
    <div className="w-64 bg-razorpay-blue text-white h-screen flex flex-col fixed">
      <div className="p-6 flex items-center space-x-3 border-b border-gray-700">
        <Shield className="w-8 h-8 text-blue-400" />
        <span className="text-xl font-bold tracking-wide">RefundShield</span>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {links.map(link => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path || (location.pathname.startsWith('/clusters') && link.path === '/clusters');
          return (
            <Link key={link.path} to={link.path} className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}>
              <Icon className="w-5 h-5" />
              <span>{link.name}</span>
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button 
          onClick={toggleDarkMode}
          className="flex items-center space-x-3 w-full p-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
      <div className="p-4 text-xs text-gray-400">
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
        <div className="flex bg-razorpay-light dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-200">
          <Sidebar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          <div className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
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
