import React, { useState, useEffect } from 'react';
import { InspectionDetail, UserContext } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any, files: File[]) => void;
  initialData: InspectionDetail | null;
  isSaving: boolean;
  user: UserContext;
}

interface ChecklistSection {
  title: string;
  items: string[];
}

const InspectionFormModal: React.FC<Props> = ({ isOpen, onClose, onSave, initialData, isSaving, user }) => {
  const [code, setCode] = useState('');
  const [projectReference, setProjectReference] = useState('');
  const [checklist, setChecklist] = useState<ChecklistSection[]>([{ title: 'General Checks', items: [''] }]);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    // Note: Edit functionality is not yet implemented in this version.
    // This resets the form when the modal is opened for a new entry.
    if (isOpen && !initialData) {
      setCode(`INSP-${Date.now().toString().slice(-6)}`);
      setProjectReference('');
      setChecklist([{ title: 'General Checks', items: [''] }]);
      setFiles([]);
      setPreviews([]);
    }
  }, [initialData, isOpen]);
  
  useEffect(() => {
    // Cleanup object URLs to prevent memory leaks
    return () => previews.forEach(url => URL.revokeObjectURL(url));
  }, [previews]);

  if (!isOpen) {
    return null;
  }

  // --- Checklist Handlers ---
  const handleSectionChange = (index: number, value: string) => {
    const newChecklist = [...checklist];
    newChecklist[index].title = value;
    setChecklist(newChecklist);
  };

  const handleItemChange = (secIndex: number, itemIndex: number, value: string) => {
    const newChecklist = [...checklist];
    newChecklist[secIndex].items[itemIndex] = value;
    setChecklist(newChecklist);
  };
  
  const addSection = () => {
    setChecklist([...checklist, { title: '', items: [''] }]);
  };
  
  const addItem = (secIndex: number) => {
    const newChecklist = [...checklist];
    newChecklist[secIndex].items.push('');
    setChecklist(newChecklist);
  };
  
  const removeItem = (secIndex: number, itemIndex: number) => {
    const newChecklist = [...checklist];
    newChecklist[secIndex].items.splice(itemIndex, 1);
    setChecklist(newChecklist);
  };
  
  const removeSection = (secIndex: number) => {
    const newChecklist = [...checklist];
    newChecklist.splice(secIndex, 1);
    setChecklist(newChecklist);
  };

  // --- File Handlers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      // FIX: Cast 'file' to Blob to fix a type error where it was being inferred as 'unknown'.
      // This is a safe operation because File objects are a type of Blob.
      const newPreviews = newFiles.map(file => URL.createObjectURL(file as Blob));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  // --- Form Submission ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inspectionData = {
      code,
      project_reference: projectReference,
      checklist_json: { sections: checklist },
    };
    onSave(inspectionData, files);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              {initialData ? 'Edit Inspection Record' : 'Create New Inspection Record'}
            </h2>
            <button type="button" onClick={onClose} className="w-8 h-8 rounded-full text-slate-400 hover:bg-slate-100">&times;</button>
          </div>
          
          {/* Main Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Inspection Code" name="code" value={code} onChange={e => setCode(e.target.value)} required />
            <InputField label="Project Reference" name="projectReference" value={projectReference} onChange={e => setProjectReference(e.target.value)} required />
          </div>

          {/* Dynamic Checklist */}
          <div>
            <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 pb-2 mb-4">Technical Checklist Builder</h3>
            <div className="space-y-4">
              {checklist.map((section, secIndex) => (
                <div key={secIndex} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Section Title (e.g., Structural Integrity)"
                      value={section.title}
                      onChange={(e) => handleSectionChange(secIndex, e.target.value)}
                      className="flex-grow font-bold text-slate-700 bg-white border border-slate-300 rounded-lg py-2 px-3 text-sm"
                    />
                    <button type="button" onClick={() => removeSection(secIndex)} className="text-rose-500 hover:bg-rose-100 h-8 w-8 rounded-full text-xs">&times;</button>
                  </div>
                  <div className="pl-4 space-y-2">
                    {section.items.map((item, itemIndex) => (
                       <div key={itemIndex} className="flex gap-2 items-center">
                         <input
                           type="text"
                           placeholder="Checklist Item (e.g., Verify rebar spacing)"
                           value={item}
                           onChange={(e) => handleItemChange(secIndex, itemIndex, e.target.value)}
                           className="flex-grow bg-white border border-slate-200 rounded-lg py-2 px-3 text-sm"
                         />
                         <button type="button" onClick={() => removeItem(secIndex, itemIndex)} className="text-slate-400 hover:bg-slate-200 h-6 w-6 rounded-full text-[10px]">&times;</button>
                       </div>
                    ))}
                    <button type="button" onClick={() => addItem(secIndex)} className="text-xs font-bold text-blue-600 hover:underline">+ Add Item</button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addSection} className="text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg">+ Add Section</button>
            </div>
          </div>
          
          {/* File Uploads */}
          <div>
             <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 pb-2 mb-4">Evidence Upload</h3>
             <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl text-center">
                <input type="file" id="file-upload" multiple onChange={handleFileChange} className="hidden" />
                <label htmlFor="file-upload" className="cursor-pointer text-blue-600 font-bold">
                  <i className="fas fa-upload mr-2"></i>
                  Choose files to upload
                </label>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF up to 10MB</p>
             </div>
             {previews.length > 0 && (
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                  {previews.map((src, index) => (
                    <div key={index} className="relative aspect-square group">
                      <img src={src} alt="Preview" className="w-full h-full object-cover rounded-xl border border-slate-200" />
                      <button type="button" onClick={() => removeFile(index)} className="absolute -top-1 -right-1 bg-rose-600 text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                    </div>
                  ))}
                </div>
             )}
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
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isSaving ? 'Saving Record...' : 'Save as Draft'}
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
      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition"
    />
  </div>
);

export default InspectionFormModal;
