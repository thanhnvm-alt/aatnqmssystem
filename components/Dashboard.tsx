import React from 'react';
import { UserContext, AuditLogEntry } from '../types';
import SystemStatus from './SystemStatus';

interface DashboardProps {
  user: UserContext;
  logs: AuditLogEntry[];
  loading: boolean;
  systemError: string | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user, logs, loading, systemError }) => {
  const counters = (user as any).counters || { pending_inspections: 0, open_ncrs: 0 };

  const formatAction = (log: AuditLogEntry) => {
    const actionText = log.action.replace(/_/g, ' ').toLowerCase();
    const entityText = log.entity.replace(/s$/, ''); // singularize
    return `${actionText} on ${entityText} ${log.new_value?.code || log.old_value?.code || log.new_value?.IPO_Number || ''}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">System Oversight</h2>
        <p className="text-slate-500">ISO 9001 compliance summary for your site location.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon="fa-clipboard-list" 
          label="Pending Inspections" 
          value={counters.pending_inspections} 
          color="blue" 
          trend="+2 since yesterday"
        />
        <StatCard 
          icon="fa-triangle-exclamation" 
          label="Open NCRs" 
          value={counters.open_ncrs} 
          color="amber" 
          trend="Critical risk detected"
        />
        <StatCard 
          icon="fa-check-double" 
          label="Compliance Score" 
          value="98.2%" 
          color="emerald" 
          trend="ISO Target: 95%"
        />
      </div>

      <SystemStatus initialError={systemError} />

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <i className="fas fa-tower-observation text-blue-600"></i>
          Project Audit Log (Last 5 Actions)
        </h3>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-slate-400 py-8">Loading audit trail...</div>
          ) : logs.length === 0 && !systemError ? (
            <div className="text-center text-slate-400 py-8 italic">No audit records found.</div>
          ) : (
            logs.map(log => (
              <div key={log.id} className="flex gap-4 pb-4 border-b border-slate-50 last:border-0">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center">
                  <i className="fas fa-history text-slate-400 text-sm"></i>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 capitalize">{formatAction(log)}</p>
                  <p className="text-xs text-slate-500">
                    By {log.user_context_json.name} • {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color, trend }: any) => (
  <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
      color === 'blue' ? 'bg-blue-50 text-blue-600' : 
      color === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
    }`}>
      <i className={`fas ${icon} text-xl`}></i>
    </div>
    <p className="text-slate-500 text-sm font-medium">{label}</p>
    <div className="flex items-baseline gap-2 mt-1">
      <h4 className="text-3xl font-black text-slate-900">{value}</h4>
    </div>
    <p className={`text-[10px] mt-2 font-bold uppercase tracking-wider ${
       color === 'amber' ? 'text-rose-500' : 'text-slate-400'
    }`}>{trend}</p>
  </div>
);

export default Dashboard;