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
  address: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
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
  maintenance?: Maintenance;
};

export type Maintenance = {
  type: 'preventive' | 'corrective';
  scheduledDate: string;
  description: string;
  performed?: boolean;
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
  activity?: string;
  source: 'COVENIN 2249-93' | 'RCHST' | 'BPF';
};

export const COVENIN_2249_STANDARDS: LightingStandard[] = [
  // COVENIN 2249-93 Tabla 1C - Alimentos
  { area: 'Selección inicial (Materias Primas)', minLux: 300, activity: 'Industrial Alimentos', source: 'COVENIN 2249-93' },
  { area: 'Empacado Manual', minLux: 300, activity: 'Industrial Alimentos', source: 'COVENIN 2249-93' },
  { area: 'Almacenamiento de Productos Terminado', minLux: 200, activity: 'Logística', source: 'COVENIN 2249-93' },
  { area: 'Inspección de Muestras', minLux: 1500, activity: 'Control de Calidad', source: 'COVENIN 2249-93' },
  { area: 'Laboratorios (Físico-Químicos)', minLux: 750, activity: 'Análisis Técnico', source: 'COVENIN 2249-93' },
  
  // RCHST Reference
  { area: 'Depósitos (Nivel Suelo)', minLux: 150, activity: 'Logística', source: 'RCHST' },
  { area: 'Recibo y Despacho', minLux: 200, activity: 'Logística', source: 'RCHST' },
  
  // General Areas Tabla 1A
  { area: 'Pasillos y Escaleras', minLux: 150, activity: 'Circulación', source: 'COVENIN 2249-93' },
  { area: 'Oficinas (Trabajo de Escritura)', minLux: 500, activity: 'Administración', source: 'COVENIN 2249-93' },
  { area: 'Salas de Maquinaria / Bombas', minLux: 200, activity: 'Servicios', source: 'COVENIN 2249-93' },
];
