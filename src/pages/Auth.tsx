import { useState } from 'react';
import axios from 'axios';

interface AuthProps {
  onAuthSuccess: () => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<'Admin' | 'Sales User'>('Sales User');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Hit your live Render login endpoint
        const response = await axios.post('https://gigflow-backend-ctno.onrender.com/api/auth/login', { email, password });
        if (response.data.success) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          onAuthSuccess();
        }
      } else {
        // Hit your live Render registration endpoint
        const response = await axios.post('https://gigflow-backend-ctno.onrender.com/api/auth/register', { name, email, password, role });
        if (response.data.success) {
          setIsLogin(true);
          setError('Registration successful! Please log in.');
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Authentication pipeline failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100 max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Smart Leads</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isLogin ? 'Access your lead pipeline infrastructure' : 'Register a new dashboard identity'}
          </p>
        </div>

        {error && (
          <div className={`p-3 text-xs font-medium rounded border ${error.includes('successful') ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Som Patil" className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@company.com" className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Organizational Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value as any)} className="w-full px-3 py-2 border rounded-md text-sm outline-none bg-white focus:ring-2 focus:ring-blue-500 text-gray-700">
                <option value="Sales User">Sales User (View & Edit Only)</option>
                <option value="Admin">Admin (Full Clearance + Delete)</option>
              </select>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 shadow-sm transition disabled:opacity-50">
            {loading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100">
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-xs text-blue-600 hover:underline font-medium">
            {isLogin ? "Don't have an account? Register here" : 'Already registered? Sign in instead'}
          </button>
        </div>
      </div>
    </div>
  );
}