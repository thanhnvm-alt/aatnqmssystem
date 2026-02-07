import React, { useState } from 'react';
import { QmsApiService } from '../services/apiService';
import { UserContext } from '../types';

interface LoginProps {
  onLoginSuccess: (user: UserContext) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await QmsApiService.login(email, password);
      if (user) {
        onLoginSuccess(user);
      } else {
        setError("Invalid email or password.");
      }
    } catch (error: any) {
      setError(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white border border-slate-200 rounded-3xl shadow-lg animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center">
          <div className="bg-slate-900 p-3 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <i className="fas fa-shield-halved text-3xl text-white"></i>
          </div>
          <h1 className="text-2xl font-black text-slate-900">ISO-QMS Digital Node</h1>
          <p className="text-slate-500 mt-2">Secure access required. Please authenticate.</p>
        </div>
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="qms.user@example.com"
            />
          </div>
          <div>
            <label htmlFor="password"  className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-rose-50 border-l-4 border-rose-400 text-rose-700 p-3 text-xs font-semibold rounded-r-lg">
              <p>{error}</p>
            </div>
           )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 mt-2 border border-transparent rounded-xl shadow-lg shadow-blue-500/20 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Login to Secure Node'
              )}
            </button>
          </div>
        </form>
         <p className="text-center text-xs text-slate-400 pt-4 border-t border-slate-100">
            This system is for authorized personnel only. All activities are monitored and logged for ISO 9001 compliance.
         </p>
      </div>
    </div>
  );
};

export default Login;
