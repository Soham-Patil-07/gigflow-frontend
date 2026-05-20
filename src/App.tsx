import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('token'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="relative">
      {}
      <div className="absolute top-6 right-6 z-10 flex items-center gap-3">
        <span className="text-xs font-medium bg-gray-200/80 backdrop-blur text-gray-700 px-3 py-1.5 rounded-full shadow-sm hidden sm:inline-block">
          I.D: {JSON.parse(localStorage.getItem('user') || '{}').name} ({JSON.parse(localStorage.getItem('user') || '{}').role})
        </span>
        <button 
          onClick={handleLogout}
          className="text-xs font-semibold bg-white text-rose-600 border border-rose-100 px-3 py-1.5 rounded-md shadow-sm hover:bg-rose-50 transition"
        >
          🚪 Logout
        </button>
      </div>
      
      <Dashboard />
    </div>
  );
}