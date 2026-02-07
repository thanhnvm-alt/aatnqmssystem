import React from 'react';
import { UserContext } from '../types';

interface LayoutProps {
  user: UserContext | null;
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ user, children, activeTab, onTabChange, onLogout }) => {
  const isFallback = false;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className={`text-white p-4 shadow-lg flex justify-between items-center z-20 transition-colors duration-500 bg-slate-900`}>
        <div className="flex items-center gap-3">
          <div className={`bg-blue-600 p-2 rounded-lg transition-colors`}>
            <i className={`fas fa-shield-halved text-xl`}></i>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">ISO-QMS Digital</h1>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">
              Lead Auditor Node
            </p>
          </div>
        </div>
        
        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user.name}</p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                user.role === 'MANAGER' ? 'bg-purple-500/20 text-purple-400' :
                user.role === 'QA' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
              }`}>
                {user.role} Enforced
              </span>
            </div>
            <div className="h-10 w-10 bg-slate-700 rounded-full flex items-center justify-center border border-slate-600 overflow-hidden">
               {user.avatar_url ? (
                <img src={user.avatar_url} alt="User Avatar" className="w-full h-full object-cover" />
              ) : (
                <i className="fas fa-user"></i>
              )}
            </div>
             <button onClick={onLogout} className="h-10 w-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:bg-rose-500 hover:text-white transition-colors" title="Logout">
                <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Nav (Desktop) */}
        <nav className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 p-4 gap-2">
          <NavItem 
            icon="fa-chart-pie" 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => onTabChange('dashboard')} 
          />
          <NavItem 
            icon="fa-list-check" 
            label="Inspections" 
            active={activeTab === 'inspections'} 
            onClick={() => onTabChange('inspections')} 
          />
          <NavItem 
            icon="fa-box-open" 
            label="IPO Tracking" 
            active={activeTab === 'ipo'} 
            onClick={() => onTabChange('ipo')} 
          />
          <NavItem 
            icon="fa-circle-exclamation" 
            label="Non-Conformances" 
            active={activeTab === 'ncr'} 
            onClick={() => onTabChange('ncr')} 
          />
          <div className="mt-auto pt-4 border-t border-slate-100 space-y-2">
             <NavItem 
                icon="fa-users-cog" 
                label="User Management" 
                active={activeTab === 'users'} 
                onClick={() => onTabChange('users')} 
              />
             <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">System Integrity</p>
                <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                  <div className={`w-2 h-2 rounded-full animate-pulse bg-green-500`}></div>
                  PostgreSQL Locked
                </div>
             </div>
          </div>
        </nav>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 relative">
          {children}
        </main>
      </div>

      {/* Mobile Footer Nav */}
      <nav className="md:hidden bg-white border-t border-slate-200 flex justify-around p-3 pb-6 z-20">
        <MobileNavItem icon="fa-chart-pie" active={activeTab === 'dashboard'} onClick={() => onTabChange('dashboard')} />
        <MobileNavItem icon="fa-list-check" active={activeTab === 'inspections'} onClick={() => onTabChange('inspections')} />
        <MobileNavItem icon="fa-box-open" active={activeTab === 'ipo'} onClick={() => onTabChange('ipo')} />
        <MobileNavItem icon="fa-circle-exclamation" active={activeTab === 'ncr'} onClick={() => onTabChange('ncr')} />
        <MobileNavItem icon="fa-users-cog" active={activeTab === 'users'} onClick={() => onTabChange('users')} />
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: { icon: string, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-slate-500 hover:bg-slate-50'
    }`}
  >
    <i className={`fas ${icon} text-lg w-6 text-center`}></i>
    <span className="font-semibold">{label}</span>
  </button>
);

const MobileNavItem = ({ icon, active, onClick }: { icon: string, active: boolean, onClick: () => void }) => (
  <button onClick={onClick} className={`p-2 transition-colors ${active ? 'text-blue-600' : 'text-slate-400'}`}>
    <i className={`fas ${icon} text-xl`}></i>
  </button>
);

export default Layout;
