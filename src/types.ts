export type Theme = 'light' | 'medium' | 'dark';
export type Language = 'es' | 'en';

export type AppSettings = {
  theme: Theme;
  language: Language;
  contractors: CompanyInfo[];    // Prestadores de servicio
  activeContractorId: string;
  clients: CompanyInfo[];        // Empresas contratantes (clientes)
  activeClientId: string;
};

export type CompanyInfo = {
  name: string;
  id: string; // RIF in Venezuela
  address: string; // Dirección fiscal
  addressWorksite?: string; // Dirección del centro de trabajo
  phone?: string;
  email?: string;
  contactPerson?: string;
  logo?: string; // URL o base64 del logo
  technicians: Technician[];
};

export type Technician = {
  name: string;
  id: string;
  role: string;
};

export type SamplingType = 'diurnal' | 'diurnal_nocturnal';

export type ReferenceStandardDoc = 'COVENIN_2249' | 'GO_36081' | 'OTHER_ATTACHED';

export type EquipmentInfo = {
  brand: string;
  model: string;
  serial: string;
  calibrationDate: string;
};

export type LampRel = {
  areaName: string;
  total: number;
  circular: number;
  rectangular: number;
  others: number;
  operatives: number;
  nonOperatives: number;
};

export type Project = {
  id: string;
  name: string;
  company: string;
  date: string;
  status: 'in_progress' | 'pending_approval' | 'completed' | 'archived';
  samplingType: SamplingType;
  selectedStandards: ReferenceStandardDoc[];
  areas: AreaData[];
  equipmentUsed: EquipmentInfo;
  lampRelationship: LampRel[];
  executiveSummary?: string;
  conclusions?: string;
  recommendations?: string;
  attachments?: Attachment[];
  // Nuevos campos para la especificación
  clientAddress?: string; // Dirección fiscal del cliente
  worksiteAddress?: string; // Dirección del centro de trabajo
  dimensions?: {
    length?: number; // Largo en metros
    width?: number; // Ancho en metros
    height?: number; // Alto en metros
  };
  weatherConditions?: {
    diurnal?: {
      temperature?: number; // Temperatura en °C
      humidity?: number; // Humedad relativa en %
    };
    nocturnal?: {
      temperature?: number; // Temperatura en °C
      humidity?: number; // Humedad relativa en %
    };
  };
  panoramicPhoto?: string; // URL o base64 de la foto panorámica
  pointPhotos?: Record<string, string>; // Mapa de pointId -> photoUrl
};

export type AreaData = {
  id: string;
  name: string;
  pointCount: number;
  standardLux: number;
  readings: Reading[];
};

export type Attachment = {
  id: string;
  type: 'minutes' | 'act' | 'calibration' | 'manual_form';
  name: string;
  url: string;
  size?: number; // Tamaño del archivo en bytes
  uploadedAt?: string; // Fecha de subida
};

export type Reading = {
  id: string;
  pointName: string;
  illuminance: number; // This will act as the primary or diurnal value
  illuminanceDiurnal?: number;
  illuminanceNocturnal?: number;
  lightType: 'natural' | 'artificial' | 'mixed';
  lampType?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  photoUri?: string;
  observation?: string; // Observaciones textuales
};


export type LampReference = {
  name: string;
  efficiencyLmW: number;
  avgLifeHours: number;
  spectrum: string;
};

export const VENEZUELA_INDUSTRIAL_LAMPS: LampReference[] = [
  { name: 'LED High Bay (Industrial)', efficiencyLmW: 140, avgLifeHours: 50000, spectrum: '5000K-6500K (Cool White)' },
  { name: 'Vapor de Sodio de Alta Presión (HPS)', efficiencyLmW: 100, avgLifeHours: 24000, spectrum: '2000K (Warm Yellow)' },
  { name: 'Aditivos Metálicos (Metal Halide)', efficiencyLmW: 85, avgLifeHours: 15000, spectrum: '4000K (Neutral White)' },
  { name: 'Tubos Fluorescentes T8', efficiencyLmW: 90, avgLifeHours: 20000, spectrum: 'Varies (Cool/Neutral)' },
  { name: 'Inducción Magnética', efficiencyLmW: 80, avgLifeHours: 100000, spectrum: 'Broad' },
];

export type LightingStandard = {
  area: string;
  minLux: number;
  maxLux?: number; // Rango máximo (opcional)
  activity?: string;
  source: 'COVENIN 2249-93' | 'RCHST' | 'BPF' | 'RESOLUCION_082';
  chapter?: string; // Capítulo de la norma
  article?: string; // Artículo específico
};

export const COVENIN_2249_STANDARDS: LightingStandard[] = [
  // COVENIN 2249-93 Tabla 1C - Alimentos (Industria)
  { area: 'Selección inicial (Materias Primas)', minLux: 300, activity: 'Industrial Alimentos', source: 'COVENIN 2249-93', chapter: 'Tabla 1C' },
  { area: 'Empacado Manual', minLux: 300, activity: 'Industrial Alimentos', source: 'COVENIN 2249-93', chapter: 'Tabla 1C' },
  { area: 'Almacenamiento de Productos Terminado', minLux: 200, activity: 'Logística', source: 'COVENIN 2249-93', chapter: 'Tabla 1C' },
  { area: 'Inspección de Muestras', minLux: 1500, activity: 'Control de Calidad', source: 'COVENIN 2249-93', chapter: 'Tabla 1C' },
  { area: 'Laboratorios (Físico-Químicos)', minLux: 750, activity: 'Análisis Técnico', source: 'COVENIN 2249-93', chapter: 'Tabla 1C' },
  { area: 'Análisis Químico', minLux: 500, maxLux: 750, activity: 'Análisis Técnico', source: 'COVENIN 2249-93', chapter: 'Tabla 1C' },
  { area: 'Inspección de Empaque', minLux: 1500, activity: 'Control de Calidad', source: 'COVENIN 2249-93', chapter: 'Tabla 1C' },
  
  // COVENIN 2249-93 Tabla 1A - General
  { area: 'Pasillos y Escaleras', minLux: 150, activity: 'Circulación', source: 'COVENIN 2249-93', chapter: 'Tabla 1A' },
  { area: 'Oficinas (Trabajo de Escritura)', minLux: 500, activity: 'Administración', source: 'COVENIN 2249-93', chapter: 'Tabla 1A' },
  { area: 'Salas de Maquinaria / Bombas', minLux: 200, activity: 'Servicios', source: 'COVENIN 2249-93', chapter: 'Tabla 1A' },
  
  // RCHST - Reglamento de las Condiciones de Higiene y Seguridad en el Trabajo
  { area: 'Depósitos (Nivel Suelo)', minLux: 150, activity: 'Logística', source: 'RCHST', chapter: 'Capítulo VI', article: 'Art. 12' },
  { area: 'Recibo y Despacho', minLux: 200, activity: 'Logística', source: 'RCHST', chapter: 'Capítulo VI', article: 'Art. 12' },
  { area: 'Áreas de Trabajo General', minLux: 200, activity: 'General', source: 'RCHST', chapter: 'Capítulo VI', article: 'Art. 12' },
  { area: 'Áreas de Control y Operación', minLux: 300, activity: 'Control', source: 'RCHST', chapter: 'Capítulo VI', article: 'Art. 12' },
  { area: 'Áreas de Inspección Precisa', minLux: 500, activity: 'Inspección', source: 'RCHST', chapter: 'Capítulo VI', article: 'Art. 12' },
  
  // BPF - Buenas Prácticas de Fabricación (Gaceta Oficial N° 36.081, Artículo 14)
  { area: 'Puntos de Inspección', minLux: 540, activity: 'Inspección', source: 'BPF', chapter: 'Artículo 14' },
  { area: 'Locales de Fabricación', minLux: 220, activity: 'Fabricación', source: 'BPF', chapter: 'Artículo 14' },
  { area: 'Otras Áreas del Establecimiento', minLux: 110, activity: 'General', source: 'BPF', chapter: 'Artículo 14' },
  
  // Resolución 082 (Envases en contacto con alimentos) - Aplica mismos valores de BPF
  { area: 'Zonas de Inspección de Envases', minLux: 540, activity: 'Inspección', source: 'RESOLUCION_082', chapter: 'Artículo 14 (BPF)' },
  { area: 'Áreas de Fabricación de Envases', minLux: 220, activity: 'Fabricación', source: 'RESOLUCION_082', chapter: 'Artículo 14 (BPF)' },
];
