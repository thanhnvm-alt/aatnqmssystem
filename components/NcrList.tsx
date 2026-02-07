import React from 'react';
import { NCRSummary, WorkflowState } from '../types';
import { StatusBadge } from './InspectionList';

interface Props {
  ncrs: NCRSummary[];
  loading: boolean;
  onSelect: (id: string) => void;
}

const NcrList: React.FC<Props> = ({ ncrs, loading, onSelect }) => {
  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
       <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
       <p className="text-slate-400 font-medium animate-pulse">Scanning Defect Register...</p>
    </div>
  );

  return (
    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-xl font-bold text-slate-800">Non-Conformance Reports (NCR)</h2>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-widest">NCR Reference</th>
              <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-widest">Severity</th>
              <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-widest">Status</th>
              <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-widest">Raised</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ncrs.map((ncr) => (
              <tr 
                key={ncr.id} 
                onClick={() => onSelect(ncr.id)}
                className="hover:bg-amber-50/30 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-amber-100 flex items-center justify-center">
                      <i className="fas fa-triangle-exclamation text-amber-600 text-xs"></i>
                    </div>
                    <span className="font-bold text-slate-900 text-sm tracking-tight">{ncr.code}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    ncr.severity === 'critical' ? 'bg-rose-100 text-rose-700' :
                    ncr.severity === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {ncr.severity}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={ncr.status as WorkflowState} />
                </td>
                <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                  {new Date(ncr.created_at).toLocaleDateString()}
                </td>
                 <td className="px-6 py-4 text-right">
                  <i className="fas fa-chevron-right text-slate-300"></i>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NcrList;