import React from 'react';
import { InspectionSummary, WorkflowState } from '../types';

interface Props {
  inspections: InspectionSummary[];
  loading: boolean;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

const InspectionList: React.FC<Props> = ({ inspections, loading, onSelect, onAdd }) => {
  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
       <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
       <p className="text-slate-400 font-medium animate-pulse">Consulting PostgreSQL Nodes...</p>
    </div>
  );

  return (
    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-xl font-bold text-slate-800">Quality Inspections</h2>
        <button 
          onClick={onAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"
        >
          <i className="fas fa-plus"></i>
          New Record
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-widest">ID / Reference</th>
              <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-widest">Project</th>
              <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-widest">Status</th>
              <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-widest">Created</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inspections.map((insp) => (
              <tr 
                key={insp.id} 
                className="hover:bg-blue-50/30 cursor-pointer transition-colors"
                onClick={() => onSelect(insp.id)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center">
                      <i className="fas fa-file-contract text-slate-400 text-xs"></i>
                    </div>
                    <span className="font-bold text-slate-900 text-sm tracking-tight">{insp.code}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-600">{insp.project_reference}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={insp.status} />
                </td>
                <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                  {new Date(insp.created_at).toLocaleDateString()}
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

export const StatusBadge = ({ status }: { status: WorkflowState }) => {
  const configs: Record<WorkflowState, string> = {
    [WorkflowState.DRAFT]: 'bg-slate-100 text-slate-600 border-slate-200',
    [WorkflowState.SUBMITTED]: 'bg-blue-100 text-blue-600 border-blue-200',
    [WorkflowState.APPROVED]: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    [WorkflowState.REJECTED]: 'bg-rose-100 text-rose-600 border-rose-200',
    [WorkflowState.VERIFIED]: 'bg-indigo-100 text-indigo-600 border-indigo-200',
    [WorkflowState.LOCKED]: 'bg-slate-900 text-white border-slate-900',
  };

  return (
    <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider border ${configs[status]}`}>
      {status}
    </span>
  );
};

export default InspectionList;
