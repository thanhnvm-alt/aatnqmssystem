import React, { useState, useEffect } from 'react';
import { NCRDetail, WorkflowState, UserContext, UserRole } from '../types';
import { StatusBadge } from './InspectionList';

interface Props {
  ncr: NCRDetail;
  user: UserContext;
  onBack: () => void;
  onSave: (updates: Partial<NCRDetail>) => void;
  onAction: (action: 'submit' | 'approve' | 'close') => void;
}

const NcrDetailView: React.FC<Props> = ({ ncr, user, onBack, onSave, onAction }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<NCRDetail>>({});

  useEffect(() => {
    setFormData({
      description: ncr.description,
      root_cause: ncr.root_cause,
      corrective_action: ncr.corrective_action,
      preventive_action: ncr.preventive_action,
    });
  }, [ncr]);
  
  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setFormData({
      description: ncr.description,
      root_cause: ncr.root_cause,
      corrective_action: ncr.corrective_action,
      preventive_action: ncr.preventive_action,
    });
    setIsEditing(false);
  }

  const severityConfig = {
    low: 'bg-slate-100 text-slate-600',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-rose-100 text-rose-700',
  };

  const canEdit = user.role !== UserRole.QC && (ncr.status === WorkflowState.DRAFT || ncr.status === WorkflowState.SUBMITTED);
  const canSubmit = user.role !== UserRole.QC && ncr.status === WorkflowState.DRAFT;
  const canApprove = user.role === UserRole.MANAGER && ncr.status === WorkflowState.SUBMITTED;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300 pb-20">
      <button 
        onClick={onBack}
        className="text-slate-500 hover:text-slate-800 flex items-center gap-2 text-sm font-semibold transition-colors"
      >
        <i className="fas fa-arrow-left"></i>
        {ncr.inspection_id ? 'Back to Inspection' : 'Back to NCR List'}
      </button>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {/* Detail Header */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{ncr.code}</h2>
              <StatusBadge status={ncr.status as WorkflowState} />
            </div>
            <p className="text-slate-500 text-sm font-medium">
              Project: {ncr.project_reference} • Raised on {new Date(ncr.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && canEdit && (
                <button onClick={() => setIsEditing(true)} className="bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">
                  <i className="fas fa-pencil-alt mr-2"></i> Edit
                </button>
            )}
             {isEditing && (
              <>
                 <button onClick={handleCancel} className="bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                 <button onClick={handleSave} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-colors">Save Changes</button>
              </>
            )}
            {canSubmit && <button onClick={() => onAction('submit')} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm">Submit for Approval</button>}
            {canApprove && <button onClick={() => onAction('approve')} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm">Approve & Close</button>}
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <InfoCard icon="fa-triangle-exclamation" label="Severity" value={ncr.severity} valueClass={severityConfig[ncr.severity]} />
          <InfoCard icon="fa-diagram-project" label="Project Reference" value={ncr.project_reference} />
          <InfoCard icon="fa-link" label="Linked Inspection" value={ncr.inspection_id ? 'View Record' : 'N/A'} />
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100">
          <TextField
            label="Description of Non-Conformance"
            value={formData.description || ''}
            isEditing={isEditing}
            onChange={e => setFormData(prev => ({...prev, description: e.target.value}))}
          />
          <TextField
            label="Root Cause Analysis"
            value={formData.root_cause || ''}
            isEditing={isEditing}
            onChange={e => setFormData(prev => ({...prev, root_cause: e.target.value}))}
          />
           <TextField
            label="Corrective Action Plan"
            value={formData.corrective_action || ''}
            isEditing={isEditing}
            onChange={e => setFormData(prev => ({...prev, corrective_action: e.target.value}))}
          />
           <TextField
            label="Preventive Action Plan"
            value={formData.preventive_action || ''}
            isEditing={isEditing}
            onChange={e => setFormData(prev => ({...prev, preventive_action: e.target.value}))}
          />
        </div>

      </div>
    </div>
  );
};


const InfoCard = ({ icon, label, value, valueClass = 'bg-slate-100 text-slate-800' }: {icon: string; label: string; value: string; valueClass?: string}) => (
    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs">
                <i className={`fas ${icon}`}></i>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
        </div>
        <div className="mt-3">
            <p className={`text-sm font-bold capitalize px-3 py-1 rounded-md inline-block ${valueClass}`}>{value}</p>
        </div>
    </div>
)

const TextField = ({ label, value, isEditing, onChange }: { label: string; value: string; isEditing: boolean; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void }) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest">{label}</h3>
      {isEditing ? (
        <textarea
          value={value}
          onChange={onChange}
          rows={5}
          className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition"
        />
      ) : (
         <div className="prose prose-sm max-w-none p-4 bg-slate-50 rounded-lg border border-slate-200 min-h-[120px]">
           {value ? <div dangerouslySetInnerHTML={{ __html: value.replace(/\n/g, '<br />') }} /> : <p className="italic text-slate-400">Not yet documented.</p>}
        </div>
      )}
    </div>
  );
};


export default NcrDetailView;
