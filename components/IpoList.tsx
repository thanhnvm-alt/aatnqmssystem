import React, { useState } from 'react';
import { IPOSummary, WorkflowState } from '../types';
import { StatusBadge } from './InspectionList';
import { IpoFilters } from '../services/apiService';

interface Props {
  ipos: IPOSummary[];
  loading: boolean;
  error?: string | null;
  onFilterChange: (filters: IpoFilters) => void;
  onRetry: () => void;
  onAdd: () => void;
  onEdit: (ipo: IPOSummary) => void;
  onDelete: (id: string) => void;
}

const IpoList: React.FC<Props> = ({ ipos, loading, error, onFilterChange, onRetry, onAdd, onEdit, onDelete }) => {
  const [localFilters, setLocalFilters] = useState<IpoFilters>({
    projectName: '',
    status: undefined
  });

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(localFilters);
  };

  const handleClearFilters = () => {
    const cleared = { projectName: '', status: undefined };
    setLocalFilters(cleared);
    onFilterChange(cleared);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
       <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
       <p className="text-slate-400 font-medium animate-pulse">Syncing with Supabase Node...</p>
    </div>
  );

  if (error) return (
    <div className="p-8 bg-white border-2 border-rose-500 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300">
      <div className="flex items-center gap-4 text-rose-600 mb-6">
        <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center text-3xl">
          <i className="fas fa-satellite-dish"></i>
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-rose-700">ISO System Integrity Fault</h2>
          <p className="text-sm font-bold opacity-80 text-rose-500 tracking-wide underline underline-offset-4">Supabase Node Is Unreachable or Misconfigured</p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 mb-6 font-mono text-sm shadow-inner border border-slate-700">
        <p className="text-rose-400 mb-3 font-bold tracking-widest flex items-center gap-2">
           <i className="fas fa-terminal"></i>
           [CRITICAL ERROR DIAGNOSTICS]
        </p>
        <div className="space-y-2 text-slate-300 overflow-x-auto">
          <p><span className="text-slate-500 font-bold w-24 inline-block">Service:</span> <span className="text-emerald-300">Supabase</span></p>
          <p><span className="text-slate-500 font-bold w-24 inline-block">Error:</span> <span className="text-rose-300 whitespace-pre-wrap">{error}</span></p>
          <div className="mt-4 p-4 bg-amber-500/10 border-l-4 border-amber-500 text-amber-200">
             <p className="font-bold flex items-center gap-2 mb-1">
               <i className="fas fa-lightbulb"></i>
               ISO Compliance Recovery Procedure:
             </p>
             <p className="text-xs opacity-90 leading-relaxed">
               The application cannot connect to the Supabase backend. This indicates a configuration or policy issue.
             </p>
             <ul className="list-decimal ml-5 mt-2 space-y-1 text-xs opacity-90">
                <li><strong>Verify Supabase Config:</strong> Check the `supabaseUrl`, `supabaseAnonKey`, and `schema` config in <code className="bg-slate-700 text-amber-300 px-1.5 py-0.5 rounded-md">services/supabaseClient.ts</code>. The schema should be set to `appQAQC`.</li>
                <li><strong>Check RLS Policies:</strong> Go to your Supabase dashboard, navigate to "Authentication" &rarr; "Policies", and ensure a permissive `SELECT` policy is enabled for the `ipo` table within the `appQAQC` schema.</li>
                <li><strong>Check Network Tab:</strong> Open browser developer tools (F12), go to the "Network" tab, and inspect the failed `fetch` request for more details from Supabase.</li>
             </ul>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={onRetry}
          className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-lg active:scale-[0.98]"
        >
          <i className="fas fa-sync-alt"></i>
          Retry Connection
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">IPO Master Tracking (Node: appQAQC)</h2>
          <p className="text-xs text-slate-500 font-medium">Verified data from appQAQC.ipo Table</p>
        </div>
        <button 
          onClick={onAdd}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-transform"
        >
          <i className="fas fa-plus"></i>
          Add New IPO
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 ml-1">Project Name</label>
            <input 
              type="text" 
              placeholder="Search projects..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              value={localFilters.projectName}
              onChange={(e) => setLocalFilters({...localFilters, projectName: e.target.value})}
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 ml-1">Status</label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all appearance-none"
              value={localFilters.status || ''}
              onChange={(e) => setLocalFilters({...localFilters, status: e.target.value ? e.target.value as WorkflowState : undefined})}
            >
              <option value="">All Statuses</option>
              {Object.values(WorkflowState).map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-slate-900 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-slate-800">Filter</button>
            <button type="button" onClick={handleClearFilters} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold">Clear All</button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              <th className="px-6 py-4">IPO Number</th>
              <th className="px-6 py-4">Project</th>
              <th className="px-6 py-4">Material</th>
              <th className="px-6 py-4 text-center">Qty</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Unit</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ipos.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">No real-time records synced from Supabase database.</td>
              </tr>
            ) : (
              ipos.map((ipo) => (
                <tr key={ipo.id} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-indigo-700 text-sm">{ipo.IPO_Number}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-700">{ipo.Project_name}</td>
                  <td className="px-6 py-4 text-xs text-slate-500 line-clamp-1">{ipo.Material_description}</td>
                  <td className="px-6 py-4 text-center font-black">{ipo.Quantity_IPO}</td>
                  <td className="px-6 py-4"><StatusBadge status={ipo.status} /></td>
                  <td className="px-6 py-4 text-center text-[10px] font-bold uppercase">{ipo.Base_Unit}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => onEdit(ipo)} className="text-xs font-bold text-slate-500 hover:text-indigo-600 px-2 py-1 rounded hover:bg-slate-100">Edit</button>
                      <button onClick={() => onDelete(ipo.id)} className="text-xs font-bold text-rose-500 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50">Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IpoList;