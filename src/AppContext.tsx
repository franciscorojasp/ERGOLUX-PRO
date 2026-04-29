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
    'nav.library': 'Biblioteca',
    'nav.settings': 'Configuración',
    'header.online': 'Sistema Online',
    'header.theme': 'Modo Visual',
    'header.lang': 'Idioma',
    'theme.light': 'Claro',
    'theme.medium': 'Medio',
    'theme.dark': 'Oscuro',
    'dashboard.title': 'Panel de Control',
    'dashboard.subtitle': 'Sistema de Gestión y Análisis de Estudios de Iluminación.',
    'dashboard.stats.total': 'Estudios Totales',
    'dashboard.stats.compliance': 'Conformidad Promedio',
    'dashboard.stats.points': 'Puntos Monitoreados',
    'dashboard.chart.title': 'Niveles de Iluminancia',
    'dashboard.chart.compliant': 'Conforme',
    'dashboard.chart.noncompliant': 'Fuera de Rango',
    'dashboard.recent.title': 'Últimos Estudios',
    'dashboard.recent.loading': 'Cargando datos maestros...',
    'dashboard.recent.none': 'Sin registros previos',
    'dashboard.recent.more': 'Explorar Historial Completo',
    'study.btn.new': 'Nuevo Estudio',
    'study.title': 'Registro de Estudio',
    'study.subtitle': 'Determinación de conformidad de iluminancia media.',
    'study.step.1': 'General',
    'study.step.2': 'Puntos',
    'study.step.3': 'Revisión',
    'study.step.4': 'Finalizar',
    'study.step.config': 'Configuración',
    'study.step.sampling': 'Muestreo',
    'study.step.review': 'Revisión',
    'study.step.success': 'Éxito',
    'study.points.label': 'N° Puntos',
    'study.compliance.conform': 'CONFORME',
    'study.compliance.nonconform': 'NO CONFORME',
    'study.success.title': '¡Estudio Finalizado!',
    'study.success.desc': 'El reporte ha sido generado y sincronizado correctamente.',
    'study.success.pdf': 'Descargar PDF',
    'study.success.whatsapp': 'WhatsApp',
    'study.success.edit': 'Editar Estudio',
    'study.success.new': 'Nuevo Registro',
    'study.field.contractor': 'Contratista',
    'study.field.client': 'Cliente',
    'study.field.projectName': 'Nombre del Proyecto',
    'study.field.date': 'Fecha',
    'study.status.drafts': 'Borradores',
    'report.title': 'Estudio de Iluminación',
    'report.subtitle': 'Determinación de Conformidad de Iluminancia Media en Servicio',
    'report.contractor': 'Nombre del Aliado',
    'report.rif': 'Registro Fiscal (RIF)',
    'report.location': 'Ubicación Centro',
    'report.attention': 'Atención a',
    'report.contact': 'Contacto',
    'report.summary': 'Resumen Ejecutivo',
    'report.legal': 'Marco Técnico Legal',
    'report.methodology': 'Metodología',
    'report.equipment': 'Equipos Utilizados',
    'report.results': 'Resultados Detallados',
    'report.conclusions': 'Conclusiones',
    'report.recommendations': 'Recomendaciones',
    'report.technician': 'Técnico Responsable',
    'report.date': 'Fecha de Emisión',
    'report.standard': 'Normativa de Referencia',
    'report.page': 'Página',
    'report.confidential': 'Confidencial',
    'report.generated': 'Documento Generado vía ERGOLUX PRO v1.0',
    'report.averageDiurnal': 'Promedio Diurno',
    'report.averageNocturnal': 'Promedio Nocturno',
    'report.averageDiurnalShort': 'D',
    'report.averageNocturnalShort': 'N',
    'report.average': 'Promedio Área',
    'report.compliant': 'CONFORME',
    'report.nonCompliant': 'NO CONFORME',
    'report.integrity': 'Verificación de Integridad',
    'report.signature': 'Firma Digital',
    'report.observation.title': 'Observación Técnica',
    'report.summary.default': 'El presente estudio tuvo como objetivo principal evaluar y determinar la conformidad de los niveles de iluminancia en las áreas del proyecto con la normativa vigente.',
    'report.methodology.default': 'Se siguió el procedimiento estimado en la Norma Venezolana Covenin 2249-1993, estableciendo una cuadrícula de muestreo representativa.',
    'report.observation.compliant': 'Los niveles de iluminación medidos cumplen satisfactoriamente con la normativa. Se recomienda mantener el programa de limpieza de luminarias.',
    'report.observation.noncompliant': 'Se detectó deficiencia de iluminación, con el promedio por debajo de lo requerido. Es imperativo revisar el sistema de iluminación artificial.',
    'settings.contractors': 'Contratistas (Proveedores)',
    'settings.clients': 'Contratantes (Clientes)',
    'common.save': 'Guardar',
    'common.next': 'Siguiente',
    'common.prev': 'Anterior',
    'common.finish': 'Finalizar y Emitir',
    'common.draft': 'Guardar Borrador',
    'common.load': 'Cargar',
    'common.processing': 'Procesando...',
    'common.select': 'Seleccionar',
    'wizard.title': 'Registro de Estudio',
    'wizard.subtitle': 'DETERMINACIÓN DE CONFORMIDAD DE ILUMINANCIA MEDIA',
    'wizard.steps.general': 'General',
    'wizard.steps.info': 'Información General',
    'wizard.steps.points': 'Puntos de Muestreo',
    'wizard.steps.review': 'Revisión y Análisis',
    'wizard.general.title': 'Información General',
    'wizard.general.contractor': 'Empresa Proveedora (Contratista)',
    'wizard.general.client': 'Empresa Cliente (Contratante)',
    'wizard.sampling.title': 'Tipo de Muestreo',
    'wizard.sampling.diurnal': 'Sólo Diurno',
    'wizard.sampling.diurnalNocturnal': 'Diurno y Nocturno',
    'wizard.standards.title': 'Normativa Aplicable',
    'wizard.standards.others': 'Otras (Anexas)',
    'wizard.drafts.title': 'Borradores Locales',
    'wizard.drafts.unnamed': 'Proyecto sin nombre',
    'wizard.drafts.updated': 'Actualizado',
    'wizard.points.addBtn': 'Añadir Área',
    'wizard.points.addSubtitle': 'DEFINA LOS SECTORES Y REGISTRE LAS MEDICIONES',
    'wizard.points.dragHint': 'Arrastrar para reordenar',
    'wizard.points.areaName': 'Nombre del Área / Sector',
    'wizard.points.standard': 'Norma (Min Lux)',
    'wizard.points.count': 'N° Puntos',
    'wizard.points.point': 'Punto',
    'wizard.points.pointName': 'Punto de Medición',
    'wizard.points.department': 'Departamento / Sección',
    'wizard.points.visualReq': 'Req. Visual',
    'wizard.points.lux': 'Iluminancia (Lux)',
    'wizard.points.luxDiurnal': 'Lux Diurno',
    'wizard.points.luxNocturnal': 'Lux Nocturno',
    'wizard.points.lampType': 'Fuente Lumínica',
    'wizard.points.lampCount': 'Total Lámparas',
    'wizard.points.operative': 'Operativas',
    'wizard.points.nonOperative': 'No Op.',
    'wizard.points.observations': 'Observaciones Técnicas',
    'wizard.visualReq.low': 'Bajo (Cargas)',
    'wizard.visualReq.medium': 'Medio (Oficinas)',
    'wizard.visualReq.high': 'Alto (Precisión)',
    'wizard.points.photoBtn': 'Foto',
    'wizard.points.registerPoint': 'Registrar Punto en',
    'wizard.points.area': 'Área',
    'wizard.review.subtitle': 'VERIFIQUE LOS RESULTADOS Y REDACTE EL ANÁLISIS FINAL',
    'wizard.review.analysisTitle': 'Análisis Final del Especialista',
    'wizard.review.conclusionsPlaceholder': 'Determine si el lugar de trabajo cumple globalmente...',
    'wizard.review.recommendationsPlaceholder': 'Sugerencias de mejora (luminarias LED, limpieza, etc.)...',
    'wizard.review.finishBtn': 'Finalizar y Emitir Informe',
    'wizard.success.title': '¡Estudio Finalizado!',
    'wizard.success.subtitle': 'EL INFORME HA SIDO GENERADO Y SINCRONIZADO CORRECTAMENTE',
    'wizard.success.editBtn': 'Seguir Editando',
    'wizard.success.pdfBtn': 'Descargar Informe PDF',
    'wizard.success.newBtn': 'Iniciar Nuevo Registro',
  },
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.newStudy': 'New Study',
    'nav.library': 'Library',
    'nav.settings': 'Settings',
    'header.online': 'System Online',
    'header.theme': 'Visual Mode',
    'header.lang': 'Language',
    'theme.light': 'Light',
    'theme.medium': 'Medium',
    'theme.dark': 'Dark',
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Illumination Study Management and Analysis System.',
    'dashboard.stats.total': 'Total Studies',
    'dashboard.stats.compliance': 'Average Compliance',
    'dashboard.stats.points': 'Monitored Points',
    'dashboard.chart.title': 'Illuminance Levels',
    'dashboard.chart.compliant': 'Compliant',
    'dashboard.chart.noncompliant': 'Out of Range',
    'dashboard.recent.title': 'Latest Studies',
    'dashboard.recent.loading': 'Loading master data...',
    'dashboard.recent.none': 'No previous records',
    'dashboard.recent.more': 'Explore Full History',
    'study.btn.new': 'New Study',
    'study.title': 'Study Registration',
    'study.subtitle': 'Determination of average illuminance conformity.',
    'study.step.1': 'General',
    'study.step.2': 'Points',
    'study.step.3': 'Review',
    'study.step.4': 'Finish',
    'study.step.config': 'Configuration',
    'study.step.sampling': 'Sampling',
    'study.step.review': 'Review',
    'study.step.success': 'Success',
    'study.points.label': 'Points Qty',
    'study.compliance.conform': 'COMPLIANT',
    'study.compliance.nonconform': 'NON-COMPLIANT',
    'study.success.title': 'Study Finished!',
    'study.success.desc': 'The report has been generated and synchronized correctly.',
    'study.success.pdf': 'Download PDF',
    'study.success.whatsapp': 'WhatsApp',
    'study.success.edit': 'Edit Study',
    'study.success.new': 'New Record',
    'study.field.contractor': 'Contractor',
    'study.field.client': 'Client',
    'study.field.projectName': 'Project Name',
    'study.field.date': 'Date',
    'study.status.drafts': 'Drafts',
    'report.title': 'Illumination Study',
    'report.subtitle': 'Determination of Average Illuminance Conformity in Service',
    'report.contractor': 'Ally Name',
    'report.rif': 'Tax Registry (RIF)',
    'report.location': 'Center Location',
    'report.attention': 'Attention to',
    'report.contact': 'Contact',
    'report.summary': 'Executive Summary',
    'report.legal': 'Technical Legal Framework',
    'report.methodology': 'Methodology',
    'report.equipment': 'Equipment Used',
    'report.results': 'Detailed Results',
    'report.conclusions': 'Conclusions',
    'report.recommendations': 'Recommendations',
    'report.technician': 'Responsible Technician',
    'report.date': 'Issue Date',
    'report.standard': 'Reference Standard',
    'report.page': 'Page',
    'report.confidential': 'Confidential',
    'report.generated': 'Document Generated via ERGOLUX PRO v1.0',
    'report.averageDiurnal': 'Diurnal Average',
    'report.averageNocturnal': 'Nocturnal Average',
    'report.averageDiurnalShort': 'D',
    'report.averageNocturnalShort': 'N',
    'report.average': 'Area Average',
    'report.compliant': 'COMPLIANT',
    'report.nonCompliant': 'NON-COMPLIANT',
    'report.integrity': 'Integrity Verification',
    'report.signature': 'Digital Signature',
    'report.observation.title': 'Technical Observation',
    'report.summary.default': 'The present study had the primary objective of evaluating and determining the compliance of illuminance levels in the project areas with current regulations.',
    'report.methodology.default': 'The procedure estimated in the Venezuelan Standard Covenin 2249-1993 was followed, establishing a representative sampling grid.',
    'report.observation.compliant': 'The measured illumination levels satisfactorily comply with the standard. It is recommended to maintain the lighting fixture cleaning program.',
    'report.observation.noncompliant': 'A lighting deficiency was detected, with the average falling below the requirement. It is imperative to review the artificial lighting system.',
    'settings.contractors': 'Contractors (Providers)',
    'settings.clients': 'Contracting Entities (Clients)',
    'common.save': 'Save',
    'common.next': 'Next',
    'common.prev': 'Previous',
    'common.finish': 'Finish & Issue',
    'common.draft': 'Save Draft',
    'common.load': 'Load',
    'common.processing': 'Processing...',
    'common.select': 'Select',
    'wizard.title': 'Study Registration',
    'wizard.subtitle': 'DETERMINATION OF AVERAGE ILLUMINANCE CONFORMITY',
    'wizard.steps.general': 'General',
    'wizard.steps.info': 'General Information',
    'wizard.steps.points': 'Sampling Points',
    'wizard.steps.review': 'Review & Analysis',
    'wizard.general.title': 'General Information',
    'wizard.general.contractor': 'Provider Company (Contractor)',
    'wizard.general.client': 'Client Company (Contracting)',
    'wizard.sampling.title': 'Sampling Type',
    'wizard.sampling.diurnal': 'Diurnal Only',
    'wizard.sampling.diurnalNocturnal': 'Diurnal and Nocturnal',
    'wizard.standards.title': 'Applicable Standards',
    'wizard.standards.others': 'Others (Attached)',
    'wizard.drafts.title': 'Local Drafts',
    'wizard.drafts.unnamed': 'Unnamed Project',
    'wizard.drafts.updated': 'Updated',
    'wizard.points.addBtn': 'Add Area',
    'wizard.points.addSubtitle': 'DEFINE SECTORS AND RECORD MEASUREMENTS',
    'wizard.points.dragHint': 'Drag to reorder',
    'wizard.points.areaName': 'Area / Sector Name',
    'wizard.points.standard': 'Standard (Min Lux)',
    'wizard.points.count': 'Points Qty',
    'wizard.points.point': 'Point',
    'wizard.points.pointName': 'Measurement Point',
    'wizard.points.department': 'Dept / Section',
    'wizard.points.visualReq': 'Visual Req.',
    'wizard.points.lux': 'Illuminance (Lux)',
    'wizard.points.luxDiurnal': 'Diurnal Lux',
    'wizard.points.luxNocturnal': 'Nocturnal Lux',
    'wizard.points.lampType': 'Light Source',
    'wizard.points.lampCount': 'Total Lamps',
    'wizard.points.operative': 'Operative',
    'wizard.points.nonOperative': 'Non-Op.',
    'wizard.points.observations': 'Technical Observations',
    'wizard.visualReq.low': 'Low (Loads)',
    'wizard.visualReq.medium': 'Medium (Offices)',
    'wizard.visualReq.high': 'High (Precision)',
    'wizard.points.photoBtn': 'Photo',
    'wizard.points.registerPoint': 'Register Point in',
    'wizard.points.area': 'Area',
    'wizard.review.subtitle': 'VERIFY RESULTS AND WRITE FINAL ANALYSIS',
    'wizard.review.analysisTitle': 'Specialist Final Analysis',
    'wizard.review.conclusionsPlaceholder': 'Determine if the workplace complies globally...',
    'wizard.review.recommendationsPlaceholder': 'Improvement suggestions (LED fixtures, cleaning, etc)...',
    'wizard.review.finishBtn': 'Finish and Issue Report',
    'wizard.success.title': 'Study Finished!',
    'wizard.success.subtitle': 'THE REPORT HAS BEEN GENERATED AND SYNCHRONIZED CORRECTLY',
    'wizard.success.editBtn': 'Continue Editing',
    'wizard.success.pdfBtn': 'Download PDF Report',
    'wizard.success.newBtn': 'Start New Registration',
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const defaultContractor = {
    name: 'KATET INGENIERÍA & SUMINISTROS, C.A.',
    id: 'J-50233495-5',
    address: 'Valencia, Estado Carabobo',
    addressWorksite: 'Valencia, Estado Carabobo',
    phone: '0241-1234567',
    email: 'contacto@katet.com.ve',
    contactPerson: 'Francisco Rojas',
    logo: '',
    technicians: [
      { name: 'Francisco Rojas Pineda', id: 'V-12033632', role: 'Lcdo. Especialista' },
      { name: 'Hugo Vera Blasco', id: 'V-7416208', role: 'Lcdo. Especialista' }
    ]
  };

  const defaultClient = {
    name: 'CERVECERÍA POLAR, C.A. / APC PLANTA CHIVACOA',
    id: 'J-0006372-9',
    address: 'Carretera Nacional Vía Nirgua Troncal 11',
    addressWorksite: 'Chivacoa, Estado Yaracuy',
    phone: '0251-7654321',
    email: 'apc.chivacoa@polar.com.ve',
    contactPerson: 'Gerente de Planta',
    logo: '',
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

  // Load dynamic settings from backend
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { studyService } = await import('./services/studyService');
        const backendSettings = await studyService.getSettings();
        if (backendSettings.contractors?.length || backendSettings.clients?.length) {
          updateSettings({
            contractors: backendSettings.contractors?.length ? backendSettings.contractors : settings.contractors,
            clients: backendSettings.clients?.length ? backendSettings.clients : settings.clients,
            activeContractorId: backendSettings.contractors?.[0]?.id || settings.activeContractorId,
            activeClientId: backendSettings.clients?.[0]?.id || settings.activeClientId,
          });
        }
      } catch (error) {
        console.error('Error loading backend settings:', error);
      }
    };
    loadSettings();
  }, []);

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
