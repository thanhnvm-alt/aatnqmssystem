import React, { useState, useEffect } from 'react';
import { QmsApiService } from '../services/apiService';

interface SystemStatusProps {
  initialError?: string | null;
}

const SystemStatus: React.FC<SystemStatusProps> = ({ initialError }) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [version, setVersion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const performCheck = async () => {
    setStatus('loading');
    setError(null);
    try {
      const dbVersion = await QmsApiService.testDatabaseConnection();
      setVersion(dbVersion);
      setStatus('success');
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
    }
  };

  useEffect(() => {
    if (initialError) {
      setError(initialError);
      setStatus('error');
    } else {
      performCheck();
    }
  }, [initialError]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <p className="font-bold text-slate-700">Pinging Supabase Node...</p>
              <p className="text-xs text-slate-500">Verifying schema 'appQAQC' visibility.</p>
            </div>
          </div>
        );
      case 'success':
        return (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl">
              <i className="fas fa-check-circle"></i>
            </div>
            <div>
              <p className="font-bold text-emerald-700 text-lg">PostgreSQL Connection Verified</p>
              <p className="text-xs text-slate-500 font-mono truncate" title={version || ''}>{version}</p>
            </div>
          </div>
        );
      case 'error':
        const isSchemaCacheError = error?.includes('Could not find the table') || error?.includes('schema cache') || error?.includes('42P01') || error?.includes('42883');
        return (
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xl">
                <i className="fas fa-times-circle"></i>
              </div>
              <div>
                <p className="font-bold text-rose-700 text-lg">
                  {isSchemaCacheError ? 'Database Schema Mismatch' : 'Connection Failed or Schema Misconfigured'}
                </p>
                <p className="text-xs text-slate-500">
                  {isSchemaCacheError ? 'The API cannot find a required table or function.' : 'The application cannot verify the database integrity.'}
                </p>
              </div>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-rose-300 border border-slate-700 overflow-x-auto">
              <p className="font-bold text-rose-400 mb-2">[DIAGNOSTIC_MESSAGE]</p>
              <p>{error}</p>
            </div>
            <div className="mt-4 p-4 bg-amber-500/10 border-l-4 border-amber-500 text-amber-700 text-xs">
              <p className="font-bold mb-2 text-amber-800">ISO Recovery Procedure:</p>
              <p className="mb-2">This error typically indicates the Supabase API's schema cache is out of sync with the actual database, or the initial setup is incomplete.</p>
              <ol className="list-decimal list-inside space-y-2 font-medium">
                <li>
                  <strong>Run Setup Script:</strong> In your Supabase SQL Editor, execute the full content of the <code className="bg-amber-200/50 text-amber-900 px-1 py-0.5 rounded">supabase_setup.sql</code> file. This script is safe to run multiple times.
                </li>
                <li>
                  <strong>Restart the API (Most Common Fix):</strong> Go to your Supabase Dashboard: <strong className="text-amber-900">Project Settings &rarr; API</strong>, scroll to the bottom, and click the **Restart** button. This forces the API to refresh its schema cache.
                </li>
                <li>
                  <strong>Refresh This Page:</strong> After restarting the API, refresh this application page.
                </li>
              </ol>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
        <i className="fas fa-database"></i>
        Authoritative Source Connectivity Test
      </h3>
      {renderContent()}
    </div>
  );
};

export default SystemStatus;