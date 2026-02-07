import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import InspectionList from './components/InspectionList';
import InspectionDetailView from './components/InspectionDetail';
import NcrList from './components/NcrList';
import NcrDetailView from './components/NcrDetailView';
import IpoList from './components/IpoList';
import UserManagement from './components/UserManagement';
import IpoFormModal from './components/IpoFormModal';
import InspectionFormModal from './components/InspectionFormModal';
import Login from './components/Login';
import { QmsApiService, IpoFilters } from './services/apiService';
import { UserContext, InspectionSummary, InspectionDetail, NCRSummary, NCRDetail, IPOSummary, AuditLogEntry } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<UserContext | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [inspections, setInspections] = useState<InspectionSummary[]>([]);
  const [ncrs, setNcrs] = useState<NCRSummary[]>([]);
  const [ipos, setIpos] = useState<IPOSummary[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [ipoFilters, setIpoFilters] = useState<IpoFilters>({});
  
  const [selectedInspection, setSelectedInspection] = useState<InspectionDetail | null>(null);
  const [selectedNcr, setSelectedNcr] = useState<NCRDetail | null>(null);

  const [loading, setLoading] = useState(false);
  const [ipoError, setIpoError] = useState<string | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // IPO Modal State
  const [isIpoModalOpen, setIsIpoModalOpen] = useState(false);
  const [editingIpo, setEditingIpo] = useState<IPOSummary | null>(null);
  
  // Inspection Modal State
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [editingInspection, setEditingInspection] = useState<InspectionDetail | null>(null);
  
  // --- Custom Authentication State Management ---
  useEffect(() => {
    // Check for a user session in localStorage on initial app load.
    try {
      const sessionUser = localStorage.getItem('qms-user-session');
      if (sessionUser) {
        setUser(JSON.parse(sessionUser));
      }
    } catch (error) {
      console.error("Failed to parse user session from localStorage", error);
      localStorage.removeItem('qms-user-session');
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const handleLoginSuccess = (loggedInUser: UserContext) => {
    setUser(loggedInUser);
    localStorage.setItem('qms-user-session', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('qms-user-session');
    setActiveTab('dashboard'); // Reset to default tab on logout
  };


  const fetchInspectionData = async () => {
    setLoading(true);
    try {
      setInspections(await QmsApiService.getInspectionList());
    } catch (err: any) {
      console.error("Data Sync Failure", err);
      setInspections([]);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchNcrData = async () => {
    setLoading(true);
    try {
      setNcrs(await QmsApiService.getNcrList());
    } catch(err:any) {
      console.error("Data Sync Failure", err);
      setNcrs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchIpoData = async () => {
    setLoading(true);
    setIpoError(null);
    try {
      const list = await QmsApiService.getIpoList(ipoFilters);
      setIpos(list);
    } catch (err: any) {
      setIpoError(err.message || "Failed to connect to the Supabase Node.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    
    const fetchDataForTab = async () => {
      setLoading(true);
      setDashboardError(null);
      try {
        switch (activeTab) {
          case 'inspections':
            fetchInspectionData();
            break;
          case 'ncr':
            fetchNcrData();
            break;
          case 'dashboard':
            setAuditLogs(await QmsApiService.getAuditLogs());
            break;
        }
      } catch (err: any) {
        console.error("Data Sync Failure", err);
        if (activeTab === 'dashboard') {
          setDashboardError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (activeTab === 'dashboard' || activeTab === 'inspections' || activeTab === 'ncr') {
        fetchDataForTab();
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (user && activeTab === 'ipo') {
      fetchIpoData();
    }
  }, [activeTab, user, ipoFilters]);

  const handleSelectInspection = async (id: string) => {
    setLoading(true);
    setSelectedNcr(null);
    try {
      const detail = await QmsApiService.getInspectionDetail(id);
      setSelectedInspection(detail);
    } catch (err: any) {
      console.error("Failed to fetch inspection details", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectNcr = async (id: string) => {
    setLoading(true);
    try {
      const detail = await QmsApiService.getNcrDetail(id);
      setSelectedNcr(detail);
    } catch (err: any) {
      console.error("Failed to fetch NCR details", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectNcrFromInspection = (ncrSummary: NCRSummary) => {
    handleSelectNcr(ncrSummary.id);
  };

  const handleWorkflowAction = async (id: string, action: 'submit' | 'approve' | 'reject') => {
    if (!user || !selectedInspection) return;
    setActionLoading(true);
    try {
      await QmsApiService.processAction(id, action, user, selectedInspection);
      const updatedDetail = await QmsApiService.getInspectionDetail(id);
      setSelectedInspection(updatedDetail);
    } catch (err: any) {
      alert(`Workflow State Violation: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleNcrAction = async (action: 'submit' | 'approve' | 'close') => {
    if (!user || !selectedNcr) return;
    setActionLoading(true);
    try {
      const updatedNcr = await QmsApiService.processNcrAction(selectedNcr.id, action, user, selectedNcr);
      setSelectedNcr(updatedNcr);
    } catch(err: any) {
       alert(`NCR Workflow Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  }
  
  const handleSaveNcr = async (updates: Partial<NCRDetail>) => {
    if (!user || !selectedNcr) return;
    setActionLoading(true);
    try {
      const updatedNcr = await QmsApiService.updateNcr(selectedNcr.id, updates, user, selectedNcr);
      setSelectedNcr(updatedNcr);
    } catch (err: any) {
      alert(`Failed to save NCR: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenAddIpoModal = () => { setEditingIpo(null); setIsIpoModalOpen(true); };
  const handleOpenAddInspectionModal = () => { setEditingInspection(null); setIsInspectionModalOpen(true); };
  const handleOpenEditIpoModal = (ipo: IPOSummary) => { setEditingIpo(ipo); setIsIpoModalOpen(true); };
  const handleCloseIpoModal = () => { setIsIpoModalOpen(false); setEditingIpo(null); };
  const handleCloseInspectionModal = () => { setIsInspectionModalOpen(false); setEditingInspection(null); }

  const handleSaveIpo = async (ipoData: Partial<IPOSummary>) => {
    if (!user) return;
    setActionLoading(true);
    try {
      if (editingIpo) {
        await QmsApiService.updateIpo(editingIpo.id, ipoData, user, editingIpo);
      } else {
        await QmsApiService.createIpo(ipoData, user);
      }
      handleCloseIpoModal();
      await fetchIpoData();
    } catch (err: any) {
      alert(`Failed to save IPO: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveInspection = async (inspectionData: any, files: File[]) => {
    if (!user) return;
    setActionLoading(true);
    try {
      await QmsApiService.createInspection(inspectionData, files, user);
      handleCloseInspectionModal();
      await fetchInspectionData();
    } catch (err: any) {
      alert(`Failed to save Inspection: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteIpo = async (id: string) => {
    if (!user) return;
    const ipoToDelete = ipos.find(ipo => ipo.id === id);
    if (!ipoToDelete) {
        alert("Integrity Error: Could not find IPO to delete in local state.");
        return;
    }

    if (window.confirm('Are you sure you want to permanently delete this IPO record? This action cannot be undone.')) {
      setActionLoading(true);
      try {
        await QmsApiService.deleteIpo(id, user, ipoToDelete);
        await fetchIpoData();
      } catch (err: any) {
        alert(`Failed to delete IPO: ${err.message}`);
      } finally {
        setActionLoading(false);
      }
    }
  };

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-mono text-sm uppercase tracking-widest text-blue-400 tracking-tighter">Initializing ISO Digital Node...</p>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }
  
  const renderContent = () => {
    if (selectedNcr && (selectedInspection || activeTab === 'ncr')) {
      return <NcrDetailView 
        ncr={selectedNcr} 
        user={user}
        onBack={() => setSelectedNcr(null)}
        onSave={handleSaveNcr}
        onAction={handleNcrAction}
      />;
    }
    if (selectedInspection) {
      return (
        <InspectionDetailView 
          inspection={selectedInspection} 
          user={user!} 
          onBack={() => setSelectedInspection(null)}
          onAction={handleWorkflowAction}
          onSelectNcr={handleSelectNcrFromInspection}
        />
      );
    }
    
    switch (activeTab) {
        case 'dashboard':
          return <Dashboard user={user} logs={auditLogs} loading={loading} systemError={dashboardError} />;
        case 'inspections':
          return <InspectionList inspections={inspections} loading={loading} onSelect={handleSelectInspection} onAdd={handleOpenAddInspectionModal} />;
        case 'ncr':
          return <NcrList ncrs={ncrs} loading={loading} onSelect={handleSelectNcr} />;
        case 'ipo':
          return (
            <IpoList 
              ipos={ipos} 
              loading={loading} 
              error={ipoError}
              onFilterChange={(f) => setIpoFilters(f)} 
              onRetry={fetchIpoData}
              onAdd={handleOpenAddIpoModal}
              onEdit={handleOpenEditIpoModal}
              onDelete={handleDeleteIpo}
            />
          );
        case 'users':
          return <UserManagement />;
        default:
          return null;
      }
  };

  return (
    <Layout 
      user={user} 
      activeTab={activeTab} 
      onTabChange={(tab) => {
        setActiveTab(tab);
        setSelectedInspection(null);
        setSelectedNcr(null);
        setIpoError(null);
        setDashboardError(null);
      }}
      onLogout={handleLogout}
    >
      <div className="max-w-6xl mx-auto w-full">
        {renderContent()}
      </div>

      <IpoFormModal
        isOpen={isIpoModalOpen}
        onClose={handleCloseIpoModal}
        onSave={handleSaveIpo}
        initialData={editingIpo}
        isSaving={actionLoading}
      />

      <InspectionFormModal
        isOpen={isInspectionModalOpen}
        onClose={handleCloseInspectionModal}
        onSave={handleSaveInspection}
        initialData={editingInspection}
        isSaving={actionLoading}
        user={user}
      />

      {actionLoading && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-3xl shadow-2xl text-center">
             <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
             <p className="font-bold text-slate-900 uppercase text-xs">Writing to Supabase Ledger...</p>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;