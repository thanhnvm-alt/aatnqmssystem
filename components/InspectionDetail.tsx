import React from 'react';
import { InspectionDetail, WorkflowState, UserContext, UserRole, NCRSummary } from '../types';
import { StatusBadge } from './InspectionList';

interface Props {
  inspection: InspectionDetail;
  user: UserContext;
  onAction: (id: string, action: 'submit' | 'approve' | 'reject') => void;
  onBack: () => void;
  onSelectNcr: (ncr: NCRSummary) => void;
}

const InspectionDetailView: React.FC<Props> = ({ inspection, user, onAction, onBack, onSelectNcr }) => {
  const canApprove = (user.role === UserRole.QA || user.role === UserRole.MANAGER) && inspection.status === WorkflowState.SUBMITTED;
  const canSubmit = user.role === UserRole.QC && inspection.status === WorkflowState.DRAFT;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300 pb-20">
      <button 
        onClick={onBack}
        className="text-slate-500 hover:text-slate-800 flex items-center gap-2 text-sm font-semibold transition-colors"
      >
        <i className="fas fa-arrow-left"></i>
        Back to Inventory
      </button>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {/* Detail Header */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{inspection.code}</h2>
              <StatusBadge status={inspection.status} />
            </div>
            <p className="text-slate-500 text-sm font-medium">Project: {inspection.project_reference} • Created {new Date(inspection.created_at).toLocaleDateString()}</p>
          </div>

          <div className="flex gap-2">
            {canSubmit && (
              <button 
                onClick={() => onAction(inspection.id, 'submit')}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-colors"
              >
                Submit for QA Review
              </button>
            )}
            {canApprove && (
              <>
                <button 
                  onClick={() => onAction(inspection.id, 'reject')}
                  className="bg-white text-rose-600 border border-rose-100 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-rose-50 transition-colors"
                >
                  Raise NCR (Reject)
                </button>
                <button 
                  onClick={() => onAction(inspection.id, 'approve')}
                  className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 transition-colors"
                >
                  Approve Record
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content Tabs */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Checklist Result */}
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest border-b border-slate-50 pb-2">Technical Checklist Results</h3>
            {inspection.checklist_json?.sections?.map((section: any, idx: number) => (
               <div key={idx} className="space-y-4">
                 <h4 className="font-bold text-slate-800 flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-slate-100 text-[10px] flex items-center justify-center text-slate-500">{idx + 1}</div>
                   {section.title}
                 </h4>
                 <div className="pl-8 space-y-3">
                   {section.items.map((item: string, iIdx: number) => {
                     const answer = inspection.results_json?.answers?.find((a: any) => a.item === item);
                     return (
                       <div key={iIdx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
                         <div className={`mt-1 h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${
                            answer?.value === 'Pass' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                         }`}>
                           <i className={`fas ${answer?.value === 'Pass' ? 'fa-check' : 'fa-xmark'}`}></i>
                         </div>
                         <div className="flex-1">
                           <p className="text-sm font-semibold text-slate-800">{item}</p>
                           {answer?.comment && <p className="text-xs text-slate-500 mt-1 italic">"{answer.comment}"</p>}
                         </div>
                         <span className={`text-[10px] font-bold uppercase ${answer?.value === 'Pass' ? 'text-emerald-600' : 'text-rose-600'}`}>
                           {answer?.value}
                         </span>
                       </div>
                     )
                   })}
                 </div>
               </div>
            ))}
          </div>

          {/* Right Column: Evidence & NCRs */}
          <div className="space-y-8">
            {/* Evidence & Visual References */}
            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest border-b border-slate-50 pb-2">Evidence & Visual References</h3>
              <div className="grid grid-cols-2 gap-4">
                {inspection.attachments?.map((attachment) => (
                  <div key={attachment.id} className="group relative aspect-square bg-slate-100 rounded-3xl overflow-hidden border border-slate-200">
                    <img src={attachment.file_url} alt={attachment.file_name || 'Evidence'} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <p className="text-[10px] font-bold text-white uppercase truncate">{attachment.file_name || attachment.id}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Linked NCRs */}
            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest border-b border-slate-50 pb-2">Linked Non-Conformances</h3>
              {inspection.ncrs && inspection.ncrs.length > 0 ? (
                <div className="space-y-3">
                  {inspection.ncrs.map(ncr => (
                    <div 
                      key={ncr.id} 
                      onClick={() => onSelectNcr(ncr)} 
                      className="bg-white p-4 rounded-2xl border border-amber-200 hover:bg-amber-50 cursor-pointer transition-colors shadow-sm flex justify-between items-center"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-amber-100 flex items-center justify-center">
                          <i className="fas fa-triangle-exclamation text-amber-600 text-xs"></i>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm tracking-tight">{ncr.code}</p>
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-sm ${
                            ncr.severity === 'critical' ? 'bg-rose-100 text-rose-700' :
                            ncr.severity === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {ncr.severity}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={ncr.status} />
                        <i className="fas fa-chevron-right text-slate-300"></i>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <i className="fas fa-check-circle text-emerald-500 text-2xl mb-2"></i>
                  <p className="text-sm font-semibold text-slate-700">No NCRs Raised</p>
                  <p className="text-xs text-slate-400">This inspection record is currently compliant.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Audit Trail Section - ISO Mandatory (Rule 2) */}
        <div className="bg-slate-50 p-6 border-t border-slate-200">
          <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest mb-4 flex items-center gap-2">
            <i className="fas fa-shield-check text-slate-400"></i>
            Immutable Audit Trail
          </h3>
          <div className="space-y-3">
            {(inspection as any).audit_trail?.map((entry: any) => (
              <div key={entry.id} className="flex gap-4 items-start bg-white p-3 rounded-xl border border-slate-200/60 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-fingerprint text-slate-400 text-xs"></i>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-slate-900">{entry.who}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{new Date(entry.when * 1000).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{entry.what}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-mono">{entry.before_state}</span>
                    <i className="fas fa-arrow-right text-[8px] text-slate-300"></i>
                    <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-bold font-mono uppercase">{entry.after_state}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionDetailView;