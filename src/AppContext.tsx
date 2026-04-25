import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme, Language, AppSettings } from './types';

interface AppContextType {
  settings: AppSettings;
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  es: {
    'nav.dashboard': 'Panel de Control',
    'nav.newStudy': 'Nuevo Estudio',
    'nav.maintenance': 'Mantenimiento',
    'nav.library': 'Biblioteca',
    'nav.settings': 'Configuración',
    'dashboard.title': 'Panel de Control',
    'dashboard.subtitle': 'Resumen de estudios y mantenimientos industriales.',
    'study.btn.new': 'Nuevo Estudio',
    'study.title': 'Registro de Estudio',
    'study.subtitle': 'Determinación de conformidad de iluminancia media.',
    'maint.title': 'Agenda de Mantenimiento',
    'maint.subtitle': 'Programación de intervenciones preventivas y correctivas.',
    'lib.title': 'Biblioteca Técnica',
    'lib.subtitle': 'Normativas COVENIN y especificaciones.',
    'common.save': 'Guardar',
    'common.next': 'Siguiente',
    'common.prev': 'Anterior',
    'common.finish': 'Finalizar y Guardar',
    'study.success.title': '¡Estudio Completado!',
    'study.success.desc': 'Los datos han sido validados y sincronizados correctamente.',
    'study.success.pdf': 'Descargar PDF',
    'study.success.whatsapp': 'Compartir WhatsApp',
    'study.success.again': 'Realizar otro estudio',
    'settings.contractors': 'Contratistas (Proveedores)',
    'settings.clients': 'Contratantes (Clientes)',
  },
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.newStudy': 'New Study',
    'nav.maintenance': 'Maintenance',
    'nav.library': 'Tech Library',
    'nav.settings': 'Settings',
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Summary of industrial studies and maintenance.',
    'study.btn.new': 'New Study',
    'study.title': 'Study Record',
    'study.subtitle': 'Determination of average illuminance conformity.',
    'maint.title': 'Maintenance Schedule',
    'maint.subtitle': 'Scheduling of preventive and corrective interventions.',
    'lib.title': 'Technical Library',
    'lib.subtitle': 'COVENIN standards and specifications.',
    'common.save': 'Save',
    'common.next': 'Next',
    'common.prev': 'Previous',
    'common.finish': 'Finish & Save',
    'study.success.title': 'Study Completed!',
    'study.success.desc': 'Data has been validated and synced correctly.',
    'study.success.pdf': 'Download PDF',
    'study.success.whatsapp': 'Share WhatsApp',
    'study.success.again': 'Perform another study',
    'settings.contractors': 'Contractors (Providers)',
    'settings.clients': 'Contracting Entities (Clients)',
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const defaultContractor = {
    name: 'KATET INGENIERÍA & SUMINISTROS, C.A.',
    id: 'J-50233495-5',
    address: 'Valencia, Estado Carabobo',
    phone: '0241-1234567',
    email: 'contacto@katet.com.ve',
    contactPerson: 'Francisco Rojas',
    technicians: [
      { name: 'Francisco Rojas Pineda', id: 'V-12033632', role: 'Lcdo. Especialista' },
      { name: 'Hugo Vera Blasco', id: 'V-7416208', role: 'Lcdo. Especialista' }
    ]
  };

  const defaultClient = {
    name: 'CERVECERÍA POLAR, C.A. / APC PLANTA CHIVACOA',
    id: 'J-0006372-9',
    address: 'Carretera Nacional Vía Nirgua Troncal 11, Chivacoa, Estado Yaracuy',
    phone: '0251-7654321',
    email: 'apc.chivacoa@polar.com.ve',
    contactPerson: 'Gerente de Planta',
    technicians: []
  };

  const [settings, setSettings] = useState<AppSettings>({
    theme: 'light',
    language: 'es',
    contractors: [defaultContractor],
    activeContractorId: defaultContractor.id,
    clients: [defaultClient],
    activeClientId: defaultClient.id
  });

  const setTheme = (theme: Theme) => setSettings(s => ({ ...s, theme }));
  const setLanguage = (language: Language) => setSettings(s => ({ ...s, language }));
  const updateSettings = (newSettings: Partial<AppSettings>) => 
    setSettings(s => ({ ...s, ...newSettings }));

  const t = (key: string) => translations[settings.language][key] || key;

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'medium');
    
    if (settings.theme === 'medium') {
      root.classList.add('medium');
    } else {
      root.classList.add(settings.theme);
    }
  }, [settings.theme]);

  return (
    <AppContext.Provider value={{ settings, setTheme, setLanguage, updateSettings, t }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
