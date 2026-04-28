# DOCUMENTACIÓN TÉCNICA - ERGOLUX PRO

## Sistema de Gestión de Estudios de Iluminación para Empresas Contratistas

---

## INFORMACIÓN DEL PROPIETARIO Y DESARROLLADOR

### Empresa Desarrolladora y Propietaria

**RAZÓN SOCIAL:** ERGOEXPRESS, C.A.  
**RIF:** J-50251246-2  
**DIRECCIÓN FISCAL:** Calle 2, manzana F, Nro 12386, San Joaquín, Carabobo, Venezuela  
**TELÉFONOS:** +58 424 473 6489 | +58 412 411 6804  
**EMAIL:** ergoexpressca@gmail.com  
**DESARROLLADOR PRINCIPAL:** Francisco Rojas Pineda  

### Derechos de Autor

© 2025 ERGOEXPRESS, C.A. Todos los derechos reservados.

Este software y su documentación asociada son propiedad exclusiva de ERGOEXPRESS, C.A. Queda prohibida la reproducción, distribución, modificación o uso no autorizado de este software sin el consentimiento expreso y por escrito de ERGOEXPRESS, C.A.

---

## TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Módulos y Componentes](#módulos-y-componentes)
6. [Modelo de Datos](#modelo-de-datos)
7. [Servicios y APIs](#servicios-y-apis)
8. [Generación de Reportes PDF](#generación-de-reportes-pdf)
9. [Normativas Aplicables](#normativas-aplicables)
10. [Instalación y Configuración](#instalación-y-configuración)
11. [Despliegue](#despliegue)
12. [Seguridad](#seguridad)
13. [Mantenimiento y Soporte](#mantenimiento-y-soporte)
14. [Anexos](#anexos)

---

## 1. RESUMEN EJECUTIVO

### 1.1 Descripción General

**ERGOLUX PRO** es una Progressive Web Application (PWA) especializada en la gestión integral de estudios de iluminación para empresas contratistas en Venezuela. La aplicación permite realizar mediciones de iluminancia, evaluar el cumplimiento normativo según estándares venezolanos (COVENIN 2249-93, RCHST, BPF, Resolución 082), y generar reportes técnicos profesionales en formato PDF.

### 1.2 Objetivos del Sistema

- **Automatizar** el proceso de captura y análisis de datos de iluminación
- **Estandarizar** los estudios de iluminación según normativas venezolanas vigentes
- **Facilitar** la generación de reportes técnicos profesionales
- **Garantizar** la trazabilidad y confiabilidad de los datos
- **Permitir** el trabajo offline en campo con sincronización posterior

### 1.3 Características Principales

- ✅ Gestión de múltiples empresas contratistas y clientes
- ✅ Wizard de captura de datos paso a paso
- ✅ Soporte para muestreos diurnos y nocturnos
- ✅ Captura de coordenadas GPS
- ✅ Captura de fotografías por punto de muestreo
- ✅ Cálculo automático de promedios y conformidad
- ✅ Generación de reportes PDF profesionales
- ✅ Sincronización con Google Sheets
- ✅ Almacenamiento local de borradores
- ✅ Soporte multiidioma (Español/Inglés)
- ✅ Temas claro/medio/oscuro
- ✅ Diseño responsive para dispositivos móviles

---

## 2. ARQUITECTURA DEL SISTEMA

### 2.1 Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Dashboard   │  │ StudyWizard  │  │   Settings   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Library    │  │ PDFReport    │  │  Reference   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    CONTEXT & STATE (React)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              AppContext (Estado Global)               │  │
│  │  - Settings (Contractors, Clients, Theme, Language)  │  │
│  │  - LocalStorage Persistence                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVICES LAYER                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              studyService.ts                          │  │
│  │  - PDF Generation (jsPDF + html2canvas)              │  │
│  │  - Google Sheets Sync                                │  │
│  │  - Draft Management (LocalStorage)                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                         │
│  ┌──────────────────┐        ┌──────────────────┐          │
│  │  Google Sheets   │        │   LocalStorage   │          │
│  │  (via Apps Script)│        │   (Offline)      │          │
│  └──────────────────┘        └──────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Flujo de Datos

```
Usuario → StudyWizard → studyService → LocalStorage (Draft)
                                  ↓
                          Google Sheets (Sync)
                                  ↓
                          PDFReportTemplate → jsPDF → PDF
```

---

## 3. STACK TECNOLÓGICO

### 3.1 Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 19.x | Framework de UI |
| TypeScript | 5.x | Tipado estático |
| Vite | 6.x | Build tool y dev server |
| Tailwind CSS | 3.x | Framework de estilos |
| shadcn/ui | latest | Componentes UI |
| Lucide React | latest | Iconografía |
| Motion (Framer Motion) | 11.x | Animaciones |
| React Hook Form | 7.x | Manejo de formularios |
| Zod | 3.x | Validación de esquemas |
| Sonner | latest | Notificaciones toast |

### 3.2 Generación de PDF

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| jsPDF | latest | Generación de PDF |
| html2canvas | latest | Captura de HTML a imagen |

### 3.3 Herramientas de Desarrollo

| Herramienta | Propósito |
|-------------|-----------|
| ESLint | Linting de código |
| PostCSS | Procesamiento de CSS |
| TypeScript Compiler | Compilación y verificación de tipos |

---

## 4. ESTRUCTURA DEL PROYECTO

```
ERGOLUX-PRO/
├── docs/                              # Documentación
│   ├── DOCUMENTACION_TECNICA_ERGOLUX_PRO.md
│   └── DOCUMENTACION_TECNICA_ERGOLUX_PRO.pdf
├── src/
│   ├── components/                    # Componentes React
│   │   ├── ui/                        # Componentes UI base (shadcn)
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   └── tabs.tsx
│   │   ├── Dashboard.tsx              # Panel principal
│   │   ├── PDFReportTemplate.tsx      # Plantilla de reporte PDF
│   │   ├── ReferenceLibrary.tsx       # Biblioteca de normativas
│   │   ├── SettingsPage.tsx           # Configuración
│   │   └── StudyWizard.tsx            # Wizard de captura
│   ├── lib/
│   │   └── utils.ts                   # Utilidades
│   ├── services/
│   │   └── studyService.ts            # Servicios de negocio
│   ├── App.tsx                        # Componente raíz
│   ├── AppContext.tsx                 # Contexto global
│   ├── index.css                      # Estilos globales
│   ├── main.tsx                       # Punto de entrada
│   └── types.ts                       # Definiciones de tipos
├── .env.example                       # Variables de entorno (ejemplo)
├── components.json                    # Configuración shadcn/ui
├── index.html                         # HTML base
├── package.json                       # Dependencias
├── tsconfig.json                      # Configuración TypeScript
└── vite.config.ts                     # Configuración Vite
```

---

## 5. MÓDULOS Y COMPONENTES

### 5.1 App.tsx - Componente Raíz

**Ubicación:** `src/App.tsx`

**Propósito:** Componente principal que define la estructura de la aplicación, navegación y layout.

**Características:**
- Sidebar responsive con navegación
- Header con selector de tema e idioma
- Animaciones de transición entre páginas
- Integración con AppContext para estado global

**Código Principal:**

```typescript
type Page = 'dashboard' | 'new-study' | 'library' | 'settings';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { settings, setTheme, setLanguage, t } = useApp();

  // Navegación
  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'new-study', label: t('nav.newStudy'), icon: ClipboardList },
    { id: 'library', label: t('nav.library'), icon: BookOpen },
    { id: 'settings', label: t('nav.settings'), icon: Settings },
  ];

  // Renderizado condicional de páginas
  return (
    <AppProvider>
      <AnimatePresence mode="wait">
        {currentPage === 'dashboard' && <Dashboard onNavigate={setCurrentPage} />}
        {currentPage === 'new-study' && <StudyWizard />}
        {currentPage === 'library' && <ReferenceLibrary />}
        {currentPage === 'settings' && <SettingsPage />}
      </AnimatePresence>
    </AppProvider>
  );
}
```

---

### 5.2 AppContext.tsx - Estado Global

**Ubicación:** `src/AppContext.tsx`

**Propósito:** Proveer estado global de la aplicación, incluyendo configuraciones, empresas contratistas, clientes, tema e idioma.

**Tipos de Datos:**

```typescript
interface AppContextType {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  refreshSettings: () => Promise<void>;
}

type AppSettings = {
  theme: Theme;
  language: Language;
  contractors: CompanyInfo[];    // Prestadores de servicio
  activeContractorId: string;
  clients: CompanyInfo[];        // Empresas contratantes (clientes)
  activeClientId: string;
};

type CompanyInfo = {
  name: string;
  id: string; // RIF in Venezuela
  address: string;
  addressWorksite?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  logo?: string;
  technicians: Technician[];
};
```

**Funcionalidades:**
- Persistencia en LocalStorage
- Carga inicial de configuraciones
- Internacionalización (ES/EN)
- Cambio de tema dinámico

---

### 5.3 StudyWizard.tsx - Wizard de Captura

**Ubicación:** `src/components/StudyWizard.tsx`

**Propósito:** Componente principal para la captura de datos de estudios de iluminación mediante un wizard de 3 pasos.

**Estructura del Wizard:**

```
Paso 1: Datos Generales
├── Selección de contratista y cliente
├── Tipo de muestreo (diurno / diurno y nocturno)
├── Normativas aplicables
├── Información del proyecto
├── Equipo de medición
├── Condiciones ambientales (°C, % HR)
├── Dimensiones del área
├── Layout PDF y foto panorámica
└── Anexos

Paso 2: Puntos de Muestreo
├── Agregar múltiples áreas
├── Para cada área:
│   ├── Nombre del área
│   ├── Normativa de referencia (Lux)
│   ├── Cantidad de puntos
│   └── Para cada punto:
│       ├── Nombre/identificación
│       ├── Iluminancia (diurna/nocturna)
│       ├── Tipo de lámpara
│       ├── Coordenadas GPS
│       ├── Fotografía
│       └── Observaciones
└── Reordenamiento de áreas (drag & drop)

Paso 3: Revisión y Finalización
├── Resumen de áreas
├── Estado de conformidad
├── Conclusiones
├── Recomendaciones
└── Guardar estudio
```

**Validación con Zod:**

```typescript
const studySchema = z.object({
  contractorId: z.string().min(1, 'Contratista requerido'),
  clientId: z.string().min(1, 'Contratante requerido'),
  projectName: z.string().min(3, 'Nombre requerido'),
  company: z.string().min(3, 'Sede/Planta requerida'),
  date: z.string(),
  status: z.enum(['in_progress', 'pending_approval', 'completed', 'archived']),
  samplingType: z.enum(['diurnal', 'diurnal_nocturnal']),
  selectedStandards: z.array(z.string()).min(1, 'Seleccione al menos una normativa'),
  equipmentUsed: z.object({
    brand: z.string().min(1, 'Marca requerida'),
    model: z.string().min(1, 'Modelo requerido'),
    serial: z.string().min(1, 'Serial requerido'),
    calibrationDate: z.string()
  }),
  areas: z.array(z.object({
    name: z.string().min(1, 'Nombre de área requerido'),
    standardLux: z.number().min(0, 'Valor requerido'),
    readings: z.array(z.object({
      pointName: z.string().min(1, 'Punto requerido'),
      illuminance: z.number().min(0, 'Debe ser positivo'),
      illuminanceDiurnal: z.number().min(0).optional(),
      illuminanceNocturnal: z.number().min(0).optional(),
      lightType: z.enum(['natural', 'artificial', 'mixed']),
      lampType: z.string().optional(),
      latitude: z.number(),
      longitude: z.number(),
      photo: z.any().optional(),
      observation: z.string().optional()
    })).min(1, 'Debe haber al menos un punto en el área')
  })).min(1, 'Debe haber al menos un área de estudio'),
  weatherConditions: z.object({
    diurnal: z.object({
      temperature: z.number().optional(),
      humidity: z.number().optional()
    }).optional(),
    nocturnal: z.object({
      temperature: z.number().optional(),
      humidity: z.number().optional()
    }).optional()
  }).optional()
});
```

**Características Clave:**
- Formulario reactivo con React Hook Form
- Validación en tiempo real con Zod
- Cálculo automático de promedios
- Indicadores visuales de conformidad
- Drag & drop para reordenar áreas
- Captura de GPS mediante Geolocation API
- Carga de fotografías con preview
- Guardado de borradores en LocalStorage

---

### 5.4 PDFReportTemplate.tsx - Plantilla de Reporte

**Ubicación:** `src/components/PDFReportTemplate.tsx`

**Propósito:** Generar la estructura visual del reporte PDF profesional.

**Estructura del Reporte:**

```
Página 1: Portada
├── Logo del contratista
├── Título del estudio
├── Información del cliente
│   ├── Nombre/RIF
│   ├── Dirección fiscal
│   ├── Centro de trabajo
│   └── Dimensiones
├── Condiciones ambientales
│   ├── Diurno: Temperatura (°C), Humedad (% HR)
│   └── Nocturno: Temperatura (°C), Humedad (% HR)
├── Foto panorámica del área
└── Firmas (Elaborador, Revisor, Aprobador)

Página 2: Resumen y Marco Legal
├── Resumen ejecutivo
├── Marco legal
│   ├── LOPCYMAT
│   ├── RCHST
│   └── Normativas seleccionadas
├── Metodología
└── Equipo de medición

Páginas 3+: Resultados por Área
├── Encabezado del área
├── Promedios (diurno/nocturno)
├── Estado de conformidad
├── Tabla de puntos de muestreo
├── Observaciones
├── Fotos de puntos
└── Foto panorámica

Página Final: Conclusiones y Recomendaciones
├── Conclusiones
├── Recomendaciones
├── Relación de lámparas/luminarias
└── Código de integridad documental
```

**Código de Generación:**

```typescript
const Page = ({ children, pageNumber }: PageProps) => (
  <div className="h-[279.4mm] p-16 flex flex-col bg-white relative break-after-page">
    {/* Header con logo y número de página */}
    <div className="flex justify-between items-start mb-8 opacity-50">
      <div className="flex items-center gap-2">
        {selectedContractor.logo ? (
          <img src={selectedContractor.logo} alt="Logo" className="w-10 h-10 rounded-lg object-cover" />
        ) : (
          <div className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center font-black italic">K</div>
        )}
        <div className="text-[8px] font-bold leading-tight">
          <p>{selectedContractor.name}</p>
          <p>RIF: {selectedContractor.id}</p>
        </div>
      </div>
      <p className="text-[8px] font-black uppercase tracking-widest">
        {t('report.title')} - {t('report.page')} {pageNumber}
      </p>
    </div>
    
    {children}
    
    {/* Footer */}
    <div className="mt-auto pt-8 flex justify-between items-center text-[8px] text-slate-400 font-bold uppercase border-t border-slate-100">
      <p>{t('report.generated')}</p>
      <p>{t('report.confidential')} - {selectedClient.name}</p>
    </div>
  </div>
);
```

---

### 5.5 Dashboard.tsx - Panel Principal

**Ubicación:** `src/components/Dashboard.tsx`

**Propósito:** Mostrar resumen de estudios, estadísticas y acceso rápido a funcionalidades.

**Características:**
- Tarjetas de estadísticas
- Lista de estudios recientes
- Acceso rápido a nuevo estudio
- Indicadores de estado

---

### 5.6 SettingsPage.tsx - Configuración

**Ubicación:** `src/components/SettingsPage.tsx`

**Propósito:** Gestionar empresas contratistas, clientes, técnicos y configuraciones generales.

**Funcionalidades:**
- CRUD de empresas contratistas
- CRUD de clientes
- Gestión de técnicos por empresa
- Carga de logos
- Configuración de tema e idioma

---

### 5.7 ReferenceLibrary.tsx - Biblioteca de Normativas

**Ubicación:** `src/components/ReferenceLibrary.tsx`

**Propósito:** Mostrar las normativas de iluminación aplicables en Venezuela.

**Normativas Incluidas:**
- COVENIN 2249-93: Iluminancias en Tareas y Áreas de Trabajo
- RCHST: Reglamento de Condiciones de Higiene y Seguridad en el Trabajo
- BPF: Buenas Prácticas de Fabricación (Gaceta Oficial 36.081)
- Resolución 082: Envases en contacto con alimentos

---

## 6. MODELO DE DATOS

### 6.1 Tipos Principales

**Ubicación:** `src/types.ts`

```typescript
// Tema de la aplicación
export type Theme = 'light' | 'medium' | 'dark';

// Idioma
export type Language = 'es' | 'en';

// Tipo de muestreo
export type SamplingType = 'diurnal' | 'diurnal_nocturnal';

// Normativas de referencia
export type ReferenceStandardDoc = 'COVENIN_2249' | 'GO_36081' | 'OTHER_ATTACHED';

// Información de empresa
export type CompanyInfo = {
  name: string;
  id: string; // RIF in Venezuela
  address: string;
  addressWorksite?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  logo?: string;
  technicians: Technician[];
};

// Técnico
export type Technician = {
  name: string;
  id: string;
  role: string;
};

// Equipo de medición
export type EquipmentInfo = {
  brand: string;
  model: string;
  serial: string;
  calibrationDate: string;
};

// Proyecto/Estudio
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
  clientAddress?: string;
  worksiteAddress?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  weatherConditions?: {
    diurnal?: {
      temperature?: number;
      humidity?: number;
    };
    nocturnal?: {
      temperature?: number;
      humidity?: number;
    };
  };
  panoramicPhoto?: string;
  pointPhotos?: Record<string, string>;
};

// Área de estudio
export type AreaData = {
  id: string;
  name: string;
  pointCount: number;
  standardLux: number;
  readings: Reading[];
};

// Lectura/Punto de muestreo
export type Reading = {
  id: string;
  pointName: string;
  illuminance: number;
  illuminanceDiurnal?: number;
  illuminanceNocturnal?: number;
  lightType: 'natural' | 'artificial' | 'mixed';
  lampType?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  photoUri?: string;
  observation?: string;
};

// Anexo
export type Attachment = {
  id: string;
  type: 'minutes' | 'act' | 'calibration' | 'manual_form';
  name: string;
  url: string;
  size?: number;
  uploadedAt?: string;
};

// Relación de lámparas
export type LampRel = {
  areaName: string;
  total: number;
  circular: number;
  rectangular: number;
  others: number;
  operatives: number;
  nonOperatives: number;
};
```

### 6.2 Estándares de Iluminación

```typescript
export type LightingStandard = {
  area: string;
  minLux: number;
  maxLux?: number;
  activity?: string;
  source: 'COVENIN 2249-93' | 'RCHST' | 'BPF' | 'RESOLUCION_082';
  chapter?: string;
  article?: string;
};

// Ejemplos de estándares COVENIN 2249-93
export const COVENIN_2249_STANDARDS: LightingStandard[] = [
  { area: 'Selección inicial (Materias Primas)', minLux: 300, activity: 'Industrial Alimentos', source: 'COVENIN 2249-93', chapter: 'Tabla 1C' },
  { area: 'Empacado Manual', minLux: 300, activity: 'Industrial Alimentos', source: 'COVENIN 2249-93', chapter: 'Tabla 1C' },
  { area: 'Almacenamiento de Productos Terminado', minLux: 200, activity: 'Logística', source: 'COVENIN 2249-93', chapter: 'Tabla 1C' },
  { area: 'Inspección de Muestras', minLux: 1500, activity: 'Control de Calidad', source: 'COVENIN 2249-93', chapter: 'Tabla 1C' },
  { area: 'Laboratorios (Físico-Químicos)', minLux: 750, activity: 'Análisis Técnico', source: 'COVENIN 2249-93', chapter: 'Tabla 1C' },
  // ... más estándares
];
```

### 6.3 Tipos de Lámparas Industriales

```typescript
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
```

---

## 7. SERVICIOS Y APIs

### 7.1 studyService.ts

**Ubicación:** `src/services/studyService.ts`

**Propósito:** Centralizar todas las operaciones de negocio relacionadas con estudios.

#### 7.1.1 Generación de PDF

```typescript
async generatePDF(elementId: string, projectName: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  // Capturar elemento HTML como imagen
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    windowWidth: element.scrollWidth,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'letter');
  
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  
  const totalImgHeightInPDF = (imgProps.height * pdfWidth) / imgProps.width;
  
  let heightLeft = totalImgHeightInPDF;
  let position = 0;

  // Primera página
  pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalImgHeightInPDF);
  heightLeft -= pdfHeight;

  // Páginas adicionales si es necesario
  while (heightLeft >= 0) {
    position = heightLeft - totalImgHeightInPDF;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalImgHeightInPDF);
    heightLeft -= pdfHeight;
  }

  return pdf;
}
```

#### 7.1.2 Sincronización con Google Sheets

```typescript
async syncToSheets(data: any) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  if (!backendUrl) {
    console.warn('VITE_BACKEND_URL no está definida. Usando modo offline.');
    return { success: true, offline: true };
  }

  try {
    const response = await fetch(backendUrl, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        type: 'SYNC_STUDY',
        payload: data
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error al sincronizar con el backend:', error);
    throw error;
  }
}
```

#### 7.1.3 Gestión de Borradores

```typescript
// Guardar borrador
async saveDraft(data: any) {
  const drafts = JSON.parse(localStorage.getItem('lumex_study_drafts') || '[]');
  const draftId = data.draftId || Date.now().toString();
  const newData = { ...data, draftId, lastUpdated: new Date().toISOString() };
  
  const existingIndex = drafts.findIndex((d: any) => d.draftId === draftId);
  if (existingIndex >= 0) {
    drafts[existingIndex] = newData;
  } else {
    drafts.push(newData);
  }
  
  localStorage.setItem('lumex_study_drafts', JSON.stringify(drafts));
  return draftId;
}

// Obtener borradores
async getDrafts() {
  return JSON.parse(localStorage.getItem('lumex_study_drafts') || '[]');
}

// Eliminar borrador
async deleteDraft(draftId: string) {
  const drafts = JSON.parse(localStorage.getItem('lumex_study_drafts') || '[]');
  const filtered = drafts.filter((d: any) => d.draftId !== draftId);
  localStorage.setItem('lumex_study_drafts', JSON.stringify(filtered));
}
```

#### 7.1.4 Compartir por WhatsApp

```typescript
getWhatsAppShareUrl(data: any) {
  const areasText = data.areas.map((a: any) => {
    const avgLux = a.readings.reduce((sum: number, r: any) => 
      sum + (r.illuminanceDiurnal || r.illuminance || 0), 0) / a.readings.length;
    return `*${a.name}*: Avg ${avgLux.toFixed(1)} Lux (${avgLux >= a.standardLux ? 'CONFORME' : 'NO CONFORME'})`;
  }).join('\\n');
  
  const text = `*Reporte de Iluminancia ERGOLUX PRO*\\n\\nProyecto: ${data.projectName}\\nEmpresa: ${data.company}\\nFecha: ${data.date}\\n\\n*Resumen por Áreas:*\\n${areasText}\\n\\nPuede ver el reporte detallado en el sistema.`;
  
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
```

---

## 8. GENERACIÓN DE REPORTES PDF

### 8.1 Flujo de Generación

```
Usuario hace clic en "Descargar PDF"
          ↓
studyService.generatePDF()
          ↓
html2canvas captura el elemento HTML
          ↓
Se convierte a imagen PNG
          ↓
jsPDF crea el documento PDF
          ↓
Se divide en páginas según tamaño
          ↓
Se descarga el archivo PDF
```

### 8.2 Características del Reporte

- **Formato:** Carta (Letter) - 215.9mm x 279.4mm
- **Orientación:** Vertical (Portrait)
- **Resolución:** Escala 2x para calidad de impresión
- **Páginas:** Dinámicas según cantidad de áreas
- **Estilo:** Profesional, minimalista, con marca de agua de confidencialidad

### 8.3 Elementos del Reporte

#### Portada
- Logo del contratista
- Título del estudio
- Información del cliente
- Condiciones ambientales (°C, % HR)
- Foto panorámica
- Firmas

#### Contenido
- Resumen ejecutivo
- Marco legal
- Metodología
- Equipo de medición
- Resultados por área
- Tablas de mediciones
- Indicadores de conformidad
- Conclusiones
- Recomendaciones

---

## 9. NORMATIVAS APLICABLES

### 9.1 COVENIN 2249-93

**Nombre:** Norma Venezolana COVENIN 2249-93 "Iluminancias en Tareas y Áreas de Trabajo"

**Objetivo:** Establecer los niveles mínimos de iluminancia requeridos para diferentes tipos de tareas y áreas de trabajo.

**Aplicación:** Industrial, comercial, educativa, salud, oficinas.

**Tablas de Referencia:**
- Tabla 1A: Iluminancias generales
- Tabla 1B: Iluminancias por tipo de tarea
- Tabla 1C: Iluminancias para industria de alimentos

### 9.2 RCHST

**Nombre:** Reglamento de las Condiciones de Higiene y Seguridad en el Trabajo

**Decreto:** N° 1.564 del 31 de diciembre de 1973

**Capítulo VI:** Condiciones de iluminación

**Artículo 12:** Niveles mínimos de iluminación según tipo de área

### 9.3 BPF (Buenas Prácticas de Fabricación)

**Nombre:** Gaceta Oficial de la República de Venezuela N° 36.081

**Artículo 14:** Requisitos de iluminación para establecimientos de fabricación de alimentos y bebidas.

**Valores de Referencia:**
- Puntos de inspección: 540 Lux
- Locales de fabricación: 220 Lux
- Otras áreas: 110 Lux

### 9.4 Resolución 082

**Nombre:** Resolución sobre envases y materiales en contacto con alimentos

**Aplicación:** Aplica los mismos valores de BPF para áreas de fabricación e inspección de envases.

---

## 10. INSTALACIÓN Y CONFIGURACIÓN

### 10.1 Requisitos Previos

- Node.js 18.x o superior
- npm 9.x o superior
- Navegador moderno (Chrome, Firefox, Edge, Safari)

### 10.2 Instalación

```bash
# Clonar el repositorio
git{}
 https://github.com/ergoexpress/ergolux-pro.git

# Entrar al directorio
cd ERGOLUX-PRO

# Instalar dependencias
npm install

# Copiar archivo de variables de entorno
cp .env.example .env

# Editar variables de entorno
# VITE_BACKEND_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### 10.3 Configuración de Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# URL del backend (Google Apps Script Web App)
VITE_BACKEND_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

# Opcional: Modo de desarrollo
VITE_DEV_MODE=true
```

### 10.4 Configuración de Google Sheets Backend

1. Crear una hoja de cálculo en Google Sheets
2. Crear un script de Google Apps Script
3. Implementar como aplicación web
4. Obtener la URL del script y configurarla en `.env`

**Ejemplo de Google Apps Script:**

```javascript
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  
  if (data.type === 'SYNC_STUDY') {
    return syncStudy(data.payload);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    message: 'Tipo de operación no soportada'
  })).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'GET_PROJECTS') {
    return getProjects();
  }
  
  if (action === 'GET_SETTINGS') {
    return getSettings();
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    message: 'Acción no soportada'
  })).setMimeType(ContentService.MimeType.JSON);
}

function syncStudy(payload) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Estudios');
  
  // Agregar fila con datos del estudio
  sheet.appendRow([
    new Date(),
    payload.projectName,
    payload.company,
    payload.date,
    payload.samplingType,
    JSON.stringify(payload.areas),
    JSON.stringify(payload.weatherConditions),
    payload.status
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Estudio sincronizado correctamente'
  })).setMimeType(ContentService.MimeType.JSON);
}
```

### 10.5 Ejecución en Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# La aplicación estará disponible en:
# http://localhost:5173
```

### 10.6 Build de Producción

```bash
# Generar build de producción
npm run build

# Los archivos se generarán en la carpeta dist/
```

---

## 11. DESPLIEGUE

### 11.1 Opciones de Despliegue

#### 11.1.1 Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel --prod
```

#### 11.1.2 Netlify

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Desplegar
netlify deploy --prod --dir=dist
```

#### 11.1.3 GitHub Pages

```bash
# Instalar gh-pages
npm install --save-dev gh-pages

# Agregar script en package.json
# "deploy": "gh-pages -d dist"

# Desplegar
npm run build
npm run deploy
```

#### 11.1.4 Servidor Web Tradicional

1. Ejecutar `npm run build`
2. Subir contenido de `dist/` al servidor web
3. Configurar redirecciones para SPA

**Ejemplo de configuración Nginx:**

```nginx
server {
    listen 80;
    server_name ergolux-pro.com;
    root /var/www/ergolux-pro/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 11.2 Configuración de PWA

La aplicación está configurada como PWA. Para funcionalidad offline completa:

1. Configurar Service Worker
2. Agregar manifest.json
3. Configurar iconos de la aplicación

**manifest.json:**

```json
{
  "name": "ERGOLUX PRO",
  "short_name": "ERGOLUX",
  "description": "Sistema de Gestión de Estudios de Iluminación",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 12. SEGURIDAD

### 12.1 Autenticación y Autorización

Actualmente la aplicación no implementa autenticación de usuarios. Para ambientes de producción se recomienda:

- Implementar autenticación OAuth 2.0
- Integrar con proveedores de identidad (Google, Microsoft)
- Implementar control de acceso basado en roles (RBAC)

### 12.2 Protección de Datos

- **LocalStorage:** Los datos se almacenan localmente en el navegador
- **HTTPS:** Requerido para producción
- **CORS:** Configurar en el backend de Google Apps Script

### 12.3 Validación de Datos

- Validación de formularios con Zod
- Sanitización de inputs
- Validación de tipos de archivo (PDF, imágenes)

### 12.4 Recomendaciones de Seguridad

1. **No exponer credenciales** en el código fuente
2. **Usar variables de entorno** para configuración sensible
3. **Implementar rate limiting** en el backend
4. **Validar todos los inputs** en servidor y cliente
5. **Mantener dependencias actualizadas**
6. **Realizar auditorías de seguridad** periódicas

---

## 13. MANTENIMIENTO Y SOPORTE

### 13.1 Actualización de Dependencias

```bash
# Verificar dependencias desactualizadas
npm outdated

# Actualizar dependencias
npm update

# Actualizar dependencias major (con precaución)
npm install package@latest
```

### 13.2 Monitoreo

- **Errores de JavaScript:** Implementar Sentry o similar
- **Rendimiento:** Lighthouse CI
- **Uptime:** UptimeRobot o similar

### 13.3 Backup de Datos

Los datos se almacenan en:
- **LocalStorage:** Exportar periódicamente
- **Google Sheets:** Backup automático de Google

### 13.4 Soporte Técnico

**ERGOEXPRESS, C.A.**  
**Email:** ergoexpressca@gmail.com  
**Teléfonos:** +58 424 473 6489 | +58 412 411 6804  
**Horario de atención:** Lunes a Viernes, 8:00 AM - 5:00 PM (Hora Venezuela)

---

## 14. ANEXOS

### 14.1 Glosario de Términos

| Término | Definición |
|---------|------------|
| Iluminancia | Cantidad de flujo luminoso que incide sobre una superficie por unidad de área. Unidad: Lux (lx) |
| Lux | Unidad de medida de iluminancia. Equivale a un lumen por metro cuadrado (lm/m²) |
| Muestreo Diurno | Mediciones realizadas durante el día, con luz natural y/o artificial |
| Muestreo Nocturno | Mediciones realizadas durante la noche, solo con luz artificial |
| COVENIN | Comisión Venezolana de Normas Industriales |
| RCHST | Reglamento de las Condiciones de Higiene y Seguridad en el Trabajo |
| BPF | Buenas Prácticas de Fabricación |
| PWA | Progressive Web Application |

### 14.2 Conversión de Unidades

| De | A | Factor |
|----|----|--------|
| Foot-candle (fc) | Lux (lx) | x 10.764 |
| Lux (lx) | Foot-candle (fc) | x 0.0929 |

### 14.3 Fórmulas Utilizadas

**Promedio de Iluminancia por Área:**

```
Promedio = Σ(valores de iluminancia) / número de puntos
```

**Conformidad:**

```
Conforme = Promedio ≥ Valor de referencia (Lux)
No Conforme = Promedio < Valor de referencia (Lux)
```

**Promedio Combinado (Diurno + Nocturno):**

```
Promedio Combinado = (Promedio Diurno + Promedio Nocturno) / 2
```

### 14.4 Referencias Bibliográficas

1. COVENIN 2249-93: Norma Venezolana "Iluminancias en Tareas y Áreas de Trabajo"
2. Reglamento de las Condiciones de Higiene y Seguridad en el Trabajo (RCHST), Decreto N° 1.564
3. Gaceta Oficial de la República de Venezuela N° 36.081: Buenas Prácticas de Fabricación
4. IES Lighting Handbook, 10th Edition
5. CIE S 008/E-2001: Lighting of Indoor Work Places

### 14.5 Historial de Versiones

| Versión | Fecha | Descripción | Autor |
|---------|-------|-------------|-------|
| 1.0.0 | 2025-01-15 | Versión inicial | Francisco Rojas Pineda |
| 1.1.0 | 2025-01-20 | Agregado soporte para muestreo nocturno | Francisco Rojas Pineda |
| 1.2.0 | 2025-01-25 | Mejoras en UI/UX y condiciones ambientales | Francisco Rojas Pineda |
| 1.3.0 | 2025-04-28 | Correcciones de UI/UX, unidades de medida | Francisco Rojas Pineda |

---

## 15. CÓDIGO FUENTE COMPLETO

### 15.1 App.tsx

```typescript
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ERGOLUX PRO - Sistema de Gestión de Estudios de Iluminación
 * Copyright (c) 2025 ERGOEXPRESS, C.A.
 * Desarrollado por: Francisco Rojas Pineda
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
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:relative lg:translate-x-0 border-r border-border bg-card/98 backdrop-blur-2xl",
        !isSidebarOpen && "-translate-x-full"
      )}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary p-[2px]">
              <div className="w-full h-full bg-card rounded-[10px] flex items-center justify-center">
                <LayoutDashboard className="text-primary w-5 h-5" />
              </div>
            </div>
            <span className="font-black text-xl tracking-tight text-foreground italic uppercase">
              ERGOLUX <span className="text-primary">PRO</span>
            </span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-foreground/50 hover:text-foreground">
            <X size={24} />
          </button>
        </div>

        <nav className="mt-8 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentPage(item.id as Page);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative",
                currentPage === item.id 
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              )}
            >
              <item.icon size={22} className={cn("transition-transform duration-300 group-hover:scale-110", currentPage === item.id ? "text-primary" : "text-muted-foreground")} />
              <span className="font-bold text-sm tracking-wide uppercase">{item.label}</span>
              {currentPage === item.id && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-primary rounded-r-full" />
              )}
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-8 left-4 right-4">
          <div className="p-4 rounded-3xl bg-foreground/5 border border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center font-black text-foreground shadow-lg">
              {(activeContractor.technicians?.[0]?.name || 'U').split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-foreground truncate uppercase tracking-wider">
                {activeContractor.technicians?.[0]?.name || 'Usuario'}
              </p>
              <p className="text-[10px] text-muted-foreground truncate font-bold">
                {activeContractor.technicians?.[0]?.role || 'Técnico Especialista'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="h-20 border-b border-border flex items-center justify-between px-10 shrink-0 z-40 bg-background/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className={cn("p-2 hover:bg-foreground/5 rounded-2xl lg:hidden", isSidebarOpen && "hidden")}>
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2 bg-foreground/5 px-4 py-2 rounded-2xl border border-border">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">{t('header.online')}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Theme Switcher */}
            <div className="flex bg-foreground/5 p-1 rounded-2xl border border-border gap-1">
              <button onClick={() => setTheme('light')} className={cn("p-2 rounded-xl transition-all", settings.theme === 'light' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground")}>
                <Sun size={16} />
              </button>
              <button onClick={() => setTheme('medium')} className={cn("p-2 rounded-xl transition-all", settings.theme === 'medium' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground")}>
                <Monitor size={16} />
              </button>
              <button onClick={() => setTheme('dark')} className={cn("p-2 rounded-xl transition-all", settings.theme === 'dark' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground")}>
                <Moon size={16} />
              </button>
            </div>

            {/* Language Switcher */}
            <div className="flex bg-foreground/5 p-1 rounded-2xl border border-border gap-1">
              <button onClick={() => setLanguage('es')} className={cn("px-3 py-1 rounded-xl text-[10px] font-black transition-all", settings.language === 'es' ? "bg-accent text-accent-foreground shadow-lg" : "text-muted-foreground hover:text-foreground")}>
                ES
              </button>
              <button onClick={() => setLanguage('en')} className={cn("px-3 py-1 rounded-xl text-[10px] font-black transition-all", settings.language === 'en' ? "bg-accent text-accent-foreground shadow-lg" : "text-muted-foreground hover:text-foreground")}>
                EN
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
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
```

### 15.2 types.ts

```typescript
/**
 * ERGOLUX PRO - Tipos de Datos
 * Copyright (c) 2025 ERGOEXPRESS, C.A.
 */

export type Theme = 'light' | 'medium' | 'dark';
export type Language = 'es' | 'en';

export type AppSettings = {
  theme: Theme;
  language: Language;
  contractors: CompanyInfo[];
  activeContractorId: string;
  clients: CompanyInfo[];
  activeClientId: string;
};

export type CompanyInfo = {
  name: string;
  id: string; // RIF in Venezuela
  address: string;
  addressWorksite?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  logo?: string;
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
  clientAddress?: string;
  worksiteAddress?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  weatherConditions?: {
    diurnal?: {
      temperature?: number;
      humidity?: number;
    };
    nocturnal?: {
      temperature?: number;
      humidity?: number;
    };
  };
  panoramicPhoto?: string;
  pointPhotos?: Record<string, string>;
};

export type AreaData = {
  id: string;
  name: string;
  pointCount: number;
  standardLux: number;
  readings: Reading[];
};

export type Reading = {
  id: string;
  pointName: string;
  illuminance: number;
  illuminanceDiurnal?: number;
  illuminanceNocturnal?: number;
  lightType: 'natural' | 'artificial' | 'mixed';
  lampType?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  photoUri?: string;
  observation?: string;
};

export type Attachment = {
  id: string;
  type: 'minutes' | 'act' | 'calibration' | 'manual_form';
  name: string;
  url: string;
  size?: number;
  uploadedAt?: string;
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
  maxLux?: number;
  activity?: string;
  source: 'COVENIN 2249-93' | 'RCHST' | 'BPF' | 'RESOLUCION_082';
  chapter?: string;
  article?: string;
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
  
  // RCHST
  { area: 'Depósitos (Nivel Suelo)', minLux: 150, activity: 'Logística', source: 'RCHST', chapter: 'Capítulo VI', article: 'Art. 12' },
  { area: 'Recibo y Despacho', minLux: 200, activity: 'Logística', source: 'RCHST', chapter: 'Capítulo VI', article: 'Art. 12' },
  { area: 'Áreas de Trabajo General', minLux: 200, activity: 'General', source: 'RCHST', chapter: 'Capítulo VI', article: 'Art. 12' },
  { area: 'Áreas de Control y Operación', minLux: 300, activity: 'Control', source: 'RCHST', chapter: 'Capítulo VI', article: 'Art. 12' },
  { area: 'Áreas de Inspección Precisa', minLux: 500, activity: 'Inspección', source: 'RCHST', chapter: 'Capítulo VI', article: 'Art. 12' },
  
  // BPF
  { area: 'Puntos de Inspección', minLux: 540, activity: 'Inspección', source: 'BPF', chapter: 'Artículo 14' },
  { area: 'Locales de Fabricación', minLux: 220, activity: 'Fabricación', source: 'BPF', chapter: 'Artículo 14' },
  { area: 'Otras Áreas del Establecimiento', minLux: 110, activity: 'General', source: 'BPF', chapter: 'Artículo 14' },
  
  // Resolución 082
  { area: 'Zonas de Inspección de Envases', minLux: 540, activity: 'Inspección', source: 'RESOLUCION_082', chapter: 'Artículo 14 (BPF)' },
  { area: 'Áreas de Fabricación de Envases', minLux: 220, activity: 'Fabricación', source: 'RESOLUCION_082', chapter: 'Artículo 14 (BPF)' },
];
```

---

## 16. LICENCIA Y DERECHOS DE AUTOR

### 16.1 Licencia de Software

```
Copyright (c) 2025 ERGOEXPRESS, C.A.
RIF: J-50251246-2
Dirección: Calle 2, manzana F, Nro 12386, San Joaquín, Carabobo, Venezuela
Teléfonos: +58 424 473 6489 | +58 412 411 6804
Email: ergoexpressca@gmail.com
Desarrollador: Francisco Rojas Pineda

TODOS LOS DERECHOS RESERVADOS

Este software y su documentación asociada son propiedad exclusiva de ERGOEXPRESS, C.A.

Queda prohibida la reproducción, distribución, modificación, uso comercial, 
descompilación, ingeniería inversa o cualquier otro uso no autorizado de este 
software sin el consentimiento expreso y por escrito de ERGOEXPRESS, C.A.

El uso de este software está sujeto a los términos y condiciones del contrato 
de licencia adquirido. Para obtener una licencia de uso, contacte a:

ERGOEXPRESS, C.A.
Email: ergoexpressca@gmail.com
Teléfonos: +58 424 473 6489 | +58 412 411 6804
```

### 16.2 Aviso de Privacidad

Los datos ingresados en esta aplicación son responsabilidad del usuario. ERGOEXPRESS, C.A. no se hace responsable del uso, almacenamiento o procesamiento de datos realizados por los usuarios de este software.

### 16.3 Limitación de Responsabilidad

ERGOEXPRESS, C.A. no se hace responsable por:
- Daños directos o indirectos derivados del uso de este software
- Pérdida de datos o información
- Uso indebido del software
- Decisiones tomadas basándose en los resultados del software

---

**FIN DE LA DOCUMENTACIÓN TÉCNICA**

---

**Documento generado el:** 28 de abril de 2025  
**Versión del documento:** 1.3.0  
**Generado por:** Francisco Rojas Pineda  
**Empresa:** ERGOEXPRESS, C.A.  
**RIF:** J-50251246-2