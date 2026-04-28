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
  X,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from 'sonner';
import Dashboard from '@/components/Dashboard';
import StudyWizard from '@/components/StudyWizard';
import ReferenceLibrary from '@/components/ReferenceLibrary';
import SettingsPage from '@/components/SettingsPage';
import { cn } from '@/lib/utils';

import { AppProvider, useApp } from './AppContext';

type Page = 'dashboard' | 'new-study' | 'library' | 'settings';

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
    { id: 'library', label: t('nav.library'), icon: BookOpen },
    { id: 'settings', label: t('nav.settings'), icon: Settings },
  ];

  return (
    <div className={cn("min-h-screen flex bg-background text-foreground transition-colors duration-500", settings.theme)}>
      <Toaster position="top-right" theme={settings.theme === 'light' ? 'light' : 'dark'} />
      
      {/* Sidebar - ERGODENTAL Style */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:relative lg:translate-x-0 border-r border-border bg-card/98 backdrop-blur-2xl",
          !isSidebarOpen && "-translate-x-full"
        )}
        id="app-sidebar"
      >
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary p-[2px]">
              <div className="w-full h-full bg-card rounded-[10px] flex items-center justify-center">
                <LayoutDashboard className="text-primary w-5 h-5" />
              </div>
            </div>
            <span className="font-black text-xl tracking-tight text-foreground italic uppercase">ERGOLUX <span className="text-primary">PRO</span></span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-foreground/50 hover:text-foreground">
            <X size={24} />
          </button>
        </div>

        <nav className="mt-8 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => {
                setCurrentPage(item.id as Page);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative",
                currentPage === item.id 
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_30px_rgba(var(--primary-rgb),0.05)]" 
                  : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              )}
            >
              <item.icon size={22} className={cn("transition-transform duration-300 group-hover:scale-110", currentPage === item.id ? "text-primary" : "text-muted-foreground")} />
              <span className="font-bold text-sm tracking-wide uppercase">{item.label}</span>
              {currentPage === item.id && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-primary rounded-r-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.8)]" />
              )}
            </button>
          ))}
        </nav>

        {/* User Profile Mini - Bottom */}
        <div className="absolute bottom-8 left-4 right-4">
          <div className="p-4 rounded-3xl bg-foreground/5 border border-border flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center font-black text-foreground shadow-lg">
                {(activeContractor.technicians?.[0]?.name || 'U').split(' ').map(n => n[0]).join('')}
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-foreground truncate uppercase tracking-wider">{activeContractor.technicians?.[0]?.name || 'Usuario'}</p>
                <p className="text-[10px] text-muted-foreground truncate font-bold">{activeContractor.technicians?.[0]?.role || 'Técnico Especialista'}</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header - Glassmorphism */}
        <header className="h-20 border-b border-border flex items-center justify-between px-10 shrink-0 z-40 bg-background/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className={cn("p-2 hover:bg-foreground/5 rounded-2xl lg:hidden", isSidebarOpen && "hidden")}>
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2 bg-foreground/5 px-4 py-2 rounded-2xl border border-border">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary-rgb),1)]" />
                <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">{t('header.online')}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Theme Switcher */}
             <div className="flex bg-foreground/5 p-1 rounded-2xl border border-border gap-1">
                <button 
                  onClick={() => setTheme('light')}
                  className={cn("p-2 rounded-xl transition-all", settings.theme === 'light' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground")}
                  title={t('theme.light')}
                >
                  <Sun size={16} />
                </button>
                <button 
                  onClick={() => setTheme('medium')}
                  className={cn("p-2 rounded-xl transition-all", settings.theme === 'medium' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground")}
                  title={t('theme.medium')}
                >
                  <Monitor size={16} />
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  className={cn("p-2 rounded-xl transition-all", settings.theme === 'dark' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground")}
                  title={t('theme.dark')}
                >
                  <Moon size={16} />
                </button>
             </div>

             {/* Language Switcher */}
             <div className="flex bg-foreground/5 p-1 rounded-2xl border border-border gap-1">
                <button 
                  onClick={() => setLanguage('es')}
                  className={cn("px-3 py-1 rounded-xl text-[10px] font-black transition-all", settings.language === 'es' ? "bg-accent text-accent-foreground shadow-lg" : "text-muted-foreground hover:text-foreground")}
                >
                  ES
                </button>
                <button 
                  onClick={() => setLanguage('en')}
                  className={cn("px-3 py-1 rounded-xl text-[10px] font-black transition-all", settings.language === 'en' ? "bg-accent text-accent-foreground shadow-lg" : "text-muted-foreground hover:text-foreground")}
                >
                  EN
                </button>
             </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                id="content-container"
              >
                {currentPage === 'dashboard' && <Dashboard onNavigate={setCurrentPage} />}
                {currentPage === 'new-study' && <StudyWizard />}
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


export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
