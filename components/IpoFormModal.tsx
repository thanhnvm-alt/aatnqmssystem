import React, { useState, useEffect } from 'react';
import { IPOSummary, WorkflowState } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<IPOSummary>) => void;
  initialData: IPOSummary | null;
  isSaving: boolean;
}

const IpoFormModal: React.FC<Props> = ({ isOpen, onClose, onSave, initialData, isSaving }) => {
  const [formData, setFormData] = useState<Partial<IPOSummary>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Reset form for new entry
      setFormData({
        IPO_Number: '',
        Project_name: '',
        Material_description: '',
        Quantity_IPO: 0,
        Base_Unit: '',
        status: WorkflowState.DRAFT,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              {initialData ? 'Edit IPO Record' : 'Add New IPO Record'}
            </h2>
            <button type="button" onClick={onClose} className="w-8 h-8 rounded-full text-slate-400 hover:bg-slate-100">&times;</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Form Fields */}
            <InputField label="IPO Number" name="IPO_Number" value={formData.IPO_Number} onChange={handleChange} required />
            <InputField label="Project Name" name="Project_name" value={formData.Project_name} onChange={handleChange} required />
            <div className="md:col-span-2">
              <TextAreaField label="Material Description" name="Material_description" value={formData.Material_description} onChange={handleChange} />
            </div>
            <InputField label="Quantity" name="Quantity_IPO" type="number" value={formData.Quantity_IPO} onChange={handleChange} required />
            <InputField label="Base Unit" name="Base_Unit" value={formData.Base_Unit} onChange={handleChange} />
            <InputField label="Project ID" name="ID_Project" value={formData.ID_Project} onChange={handleChange} />
            <InputField label="Factory Order ID" name="ID_Factory_Order" value={formData.ID_Factory_Order} onChange={handleChange} />
            <InputField label="BOQ Type" name="BOQ_type" value={formData.BOQ_type} onChange={handleChange} />
            <InputField label="IPO Line" name="IPO_Line" value={formData.IPO_Line} onChange={handleChange} />
            <InputField label="Tender Code" name="Ma_Tender" value={formData.Ma_Tender} onChange={handleChange} />
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select
                name="status"
                value={formData.status || ''}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition"
              >
                {Object.values(WorkflowState).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="bg-white text-slate-700 border border-slate-200 px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputField = ({ label, name, value, onChange, type = 'text', required = false }: any) => (
  <div>
    <label className="block text-xs font-medium text-slate-600 mb-1">{label}{required && ' *'}</label>
    <input
      type={type}
      name={name}
      value={value || ''}
      onChange={onChange}
      required={required}
      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition"
    />
  </div>
);

const TextAreaField = ({ label, name, value, onChange }: any) => (
  <div>
    <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
    <textarea
      name={name}
      value={value || ''}
      onChange={onChange}
      rows={3}
      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition"
    />
  </div>
);

export default IpoFormModal;
