/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Wrench, 
  BookOpen, 
  Settings,
  PlusCircle,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from 'sonner';
import Dashboard from '@/components/Dashboard';
import StudyWizard from '@/components/StudyWizard';
import MaintenanceSchedule from '@/components/MaintenanceSchedule';
import ReferenceLibrary from '@/components/ReferenceLibrary';
import { cn } from '@/lib/utils';

import { AppProvider, useApp } from './AppContext';

type Page = 'dashboard' | 'new-study' | 'maintenance' | 'library' | 'settings';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { settings, setTheme, setLanguage, t } = useApp();

  // Responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeContractor = settings.contractors.find(c => c.id === settings.activeContractorId) || settings.contractors[0];

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'new-study', label: t('nav.newStudy'), icon: ClipboardList },
    { id: 'maintenance', label: t('nav.maintenance'), icon: Wrench },
    { id: 'library', label: t('nav.library'), icon: BookOpen },
    { id: 'settings', label: t('nav.settings'), icon: Settings },
  ];

  return (
    <div className={cn(
      "min-h-screen flex",
      settings.theme === 'dark' ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
    )}>
      <Toaster position="top-right" />
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 border-r",
          settings.theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-slate-900 border-slate-200",
          !isSidebarOpen && "-translate-x-full"
        )}
        id="app-sidebar"
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain rounded bg-white p-1" />
            <span className="font-bold text-xl tracking-tight text-white italic">ERGOLUX</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white/50 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="mt-6 px-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => {
                setCurrentPage(item.id as Page);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                currentPage === item.id 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              )}
            >
              <item.icon size={20} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Theme/Lang Mini Toggle */}
        <div className="absolute bottom-6 left-6 right-6 space-y-4">
           <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
             <button onClick={() => setLanguage('es')} className={cn("flex-1 text-[10px] font-bold py-1 px-2 rounded", settings.language === 'es' ? "bg-blue-600 text-white" : "text-slate-400")}>ES</button>
             <button onClick={() => setLanguage('en')} className={cn("flex-1 text-[10px] font-bold py-1 px-2 rounded", settings.language === 'en' ? "bg-blue-600 text-white" : "text-slate-400")}>EN</button>
           </div>
           
           <div className="grid grid-cols-3 gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700">
              <button onClick={() => setTheme('light')} className={cn("text-[8px] font-black py-1 rounded", settings.theme === 'light' ? "bg-white text-black" : "text-slate-500")}>LIGHT</button>
              <button onClick={() => setTheme('medium')} className={cn("text-[8px] font-black py-1 rounded", settings.theme === 'medium' ? "bg-amber-100 text-amber-900" : "text-slate-500")}>MID</button>
              <button onClick={() => setTheme('dark')} className={cn("text-[8px] font-black py-1 rounded", settings.theme === 'dark' ? "bg-slate-700 text-white" : "text-slate-500")}>DARK</button>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className={cn(
          "h-16 border-b flex items-center justify-between px-6 shrink-0 z-40 transition-colors",
          settings.theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        )}>
          <button onClick={() => setIsSidebarOpen(true)} className={cn("p-2 hover:bg-slate-100 rounded-lg lg:hidden", isSidebarOpen && "hidden")}>
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold">{activeContractor.technicians?.[0]?.name || 'Usuario'}</p>
              <p className="text-xs text-slate-500 italic">{activeContractor.technicians?.[0]?.role || 'Técnico'}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full border border-blue-200 overflow-hidden flex items-center justify-center text-blue-600 font-bold">
              {(activeContractor.technicians?.[0]?.name || 'U').split(' ').map(n => n[0]).join('')}
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                id="content-container"
              >
                {currentPage === 'dashboard' && <Dashboard onNavigate={setCurrentPage} />}
                {currentPage === 'new-study' && <StudyWizard />}
                {currentPage === 'maintenance' && <MaintenanceSchedule />}
                {currentPage === 'library' && <ReferenceLibrary />}
                {currentPage === 'settings' && <SettingsPage />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

import SettingsPage from './components/SettingsPage';

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
