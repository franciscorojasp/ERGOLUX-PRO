import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Camera, MapPin, Plus, Trash2, ChevronRight, ChevronLeft, Save, CheckCircle2, AlertCircle, Share2, Download, FileUp, Paperclip, AlertTriangle, Cpu, GripVertical, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Reorder } from 'motion/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { COVENIN_2249_STANDARDS, VENEZUELA_INDUSTRIAL_LAMPS, SamplingType, ReferenceStandardDoc } from '@/types';
import { studyService } from '@/services/studyService';
import PDFReportTemplate from './PDFReportTemplate';
import { cn } from '@/lib/utils';
import { useApp } from '@/AppContext';

const studySchema = z.object({
  contractorId: z.string().min(1, 'Contratista requerido'),
  clientId: z.string().min(1, 'Contratante requerido'),
  projectName: z.string().min(3, 'Nombre requerido'),
  company: z.string().min(3, 'Sede/Planta requerida'),
  clientAddress: z.string().optional(),
  worksiteAddress: z.string().optional(),
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
  lampRelationship: z.array(z.object({
    areaName: z.string(),
    total: z.number(),
    circular: z.number(),
    rectangular: z.number(),
    others: z.number(),
    operatives: z.number(),
    nonOperatives: z.number()
  })),
  executiveSummary: z.string().optional(),
  conclusions: z.string().optional(),
  recommendations: z.string().optional(),
  layoutPdf: z.any().optional(),
  panoramicPhoto: z.any().optional(),
  dimensions: z.object({
    length: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional()
  }).optional(),
  weatherConditions: z.object({
    diurnal: z.object({
      temperature: z.number().optional(),
      humidity: z.number().optional()
    }).optional(),
    nocturnal: z.object({
      temperature: z.number().optional(),
      humidity: z.number().optional()
    }).optional()
  }).optional(),
  areas: z.array(z.object({
    name: z.string().min(1, 'Nombre de área requerido'),
    standardLux: z.number().min(0, 'Valor requerido'),
    readings: z.array(z.object({
      pointName: z.string().min(1, 'Punto requerido'),
      department: z.string().optional(),
      visualRequirement: z.enum(['low', 'medium', 'high']).default('medium'),
      illuminance: z.number().min(0, 'Debe ser positivo'), 
      illuminanceDiurnal: z.number().min(0).optional(),
      illuminanceNocturnal: z.number().min(0).optional(),
      lightType: z.enum(['natural', 'artificial', 'mixed']),
      lampType: z.string().optional(),
      lampCount: z.number().min(0).default(0),
      operativeLamps: z.number().min(0).default(0),
      nonOperativeLamps: z.number().min(0).default(0),
      latitude: z.number(),
      longitude: z.number(),
      photo: z.any().optional(),
      observation: z.string().optional()
    })).min(1, 'Debe haber al menos un punto en el área')
  })).min(1, 'Debe haber al menos un área de estudio'),
  attachments: z.array(z.object({
    type: z.string(),
    file: z.any()
  })).optional()
});

type StudyFormValues = z.infer<typeof studySchema>;

export default function StudyWizard() {
  const { t, settings } = useApp();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [savedData, setSavedData] = useState<StudyFormValues | null>(null);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  React.useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    const data = await studyService.getDrafts();
    setDrafts(data);
  };

  const { register, control, handleSubmit, watch, setValue, getValues, reset, formState: { errors } } = useForm<StudyFormValues>({
    resolver: zodResolver(studySchema),
    defaultValues: {
      contractorId: settings.activeContractorId,
      clientId: settings.activeClientId,
      projectName: '',
      company: settings.clients.find(c => c.id === settings.activeClientId)?.address || '',
      clientAddress: settings.clients.find(c => c.id === settings.activeClientId)?.address || '',
      worksiteAddress: settings.clients.find(c => c.id === settings.activeClientId)?.addressWorksite || '',
      date: new Date().toISOString().split('T')[0],
      status: 'in_progress',
      samplingType: 'diurnal',
      selectedStandards: ['COVENIN_2249'],
      equipmentUsed: {
        brand: 'Extech',
        model: 'LT300',
        serial: '11013700',
        calibrationDate: '2025-01-01'
      },
      lampRelationship: [],
      executiveSummary: '',
      conclusions: '',
      recommendations: '',
      dimensions: {},
      weatherConditions: {
        diurnal: { temperature: 25, humidity: 60 },
        nocturnal: { temperature: 22, humidity: 65 }
      },
      areas: [{ 
        name: 'Área General', 
        standardLux: 300, 
        readings: [{ 
          pointName: 'Punto 1', 
          department: '',
          visualRequirement: 'medium',
          illuminance: 0, 
          illuminanceDiurnal: 0, 
          illuminanceNocturnal: 0, 
          lightType: 'artificial', 
          lampCount: 0,
          operativeLamps: 0,
          nonOperativeLamps: 0,
          latitude: 0, 
          longitude: 0 
        }] 
      }],
      attachments: [],
      layoutPdf: null,
      panoramicPhoto: null
    }
  });

  const { fields: areaFields, append: appendArea, remove: removeArea, move: moveArea } = useFieldArray({
    control,
    name: "areas"
  });

  const { fields: attFields, append: appendAtt, remove: removeAtt } = useFieldArray({
    control,
    name: "attachments"
  });

  // Calcular iluminancia media en tiempo real
  const [areaAverages, setAreaAverages] = useState<Record<string, { diurnal: number; nocturnal: number; combined: number }>>({});

  React.useEffect(() => {
    const areas = watch('areas');
    const samplingType = watch('samplingType');
    const averages: Record<string, { diurnal: number; nocturnal: number; combined: number }> = {};

    areas.forEach((area: any, index: number) => {
      const readings = area.readings || [];
      if (readings.length > 0) {
        const diurnalSum = readings.reduce((sum: number, r: any) => sum + (r.illuminanceDiurnal || r.illuminance || 0), 0);
        const nocturnalSum = readings.reduce((sum: number, r: any) => sum + (r.illuminanceNocturnal || 0), 0);
        
        const diurnalAvg = diurnalSum / readings.length;
        const nocturnalAvg = nocturnalSum / readings.length;
        const combinedAvg = samplingType === 'diurnal_nocturnal' ? (diurnalAvg + nocturnalAvg) / 2 : diurnalAvg;

        averages[area.id] = { diurnal: diurnalAvg, nocturnal: nocturnalAvg, combined: combinedAvg };
      } else {
        averages[area.id] = { diurnal: 0, nocturnal: 0, combined: 0 };
      }
    });

    setAreaAverages(averages);
  }, [watch('areas'), watch('samplingType')]);

  const onSubmit = async (data: StudyFormValues) => {
    setIsSaving(true);
    try {
      await studyService.syncToSheets(data);
      setSavedData(data);
      setStep(4); // Success step
      toast.success('Estudio guardado y sincronizado exitosamente');
      
      if (currentDraftId) {
        await studyService.deleteDraft(currentDraftId);
        loadDrafts();
      }
    } catch (error) {
      toast.error('Error al sincronizar con Google Sheets');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    const data = getValues();
    const draftId = await studyService.saveDraft({ ...data, draftId: currentDraftId });
    setCurrentDraftId(draftId);
    toast.success('Borrador guardado localmente');
    loadDrafts();
  };

  const handleLoadDraft = (draft: any) => {
    reset(draft);
    setCurrentDraftId(draft.draftId);
    setStep(1);
    toast.success('Borrador cargado');
  };

  const handleEditAgain = () => {
    if (savedData) {
      setStep(2);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, areaIndex: number, pointIndex: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue(`areas.${areaIndex}.readings.${pointIndex}.photo` as any, reader.result as string);
        toast.success('Foto cargada');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadPDF = async () => {
    if (!savedData) return;
    const toastId = toast.loading('Generando PDF...');
    try {
      const pdf = await studyService.generatePDF('report-template', savedData.projectName);
      if (pdf) {
        pdf.save(`${savedData.projectName.replace(/\s+/g, '_')}_Reporte.pdf`);
        toast.success('Reporte descargado', { id: toastId });
      }
    } catch (err) {
      toast.error('Error generando PDF', { id: toastId });
    }
  };

  const handleShareWhatsApp = () => {
    if (!savedData) return;
    window.open(studyService.getWhatsAppShareUrl(savedData), '_blank');
  };

  const captureGPSPoint = (areaIndex: number, pointIndex: number) => {
    const pointPath = `areas.${areaIndex}.readings.${pointIndex}`;
    const pointName = watch(`${pointPath}.pointName` as any);
    
    if (!navigator.geolocation) {
      toast.error('GPS no soportado');
      return;
    }

    const toastId = toast.loading(`Capturando ubicación para ${pointName}...`);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue(`${pointPath}.latitude` as any, pos.coords.latitude);
        setValue(`${pointPath}.longitude` as any, pos.coords.longitude);
        toast.success(`Ubicación capturada`, { id: toastId });
      },
      (err) => {
        toast.error('Error capturando ubicación', { id: toastId });
      }
    );
  };

  const validatePdf = (e: React.ChangeEvent<HTMLInputElement>, fieldName: any) => {
    const file = e.target.files?.[0];
    if (file && file.type !== 'application/pdf') {
      toast.error('El archivo debe ser un PDF válido');
      e.target.value = ''; // Clear the input
      setValue(fieldName, null);
      return false;
    }
    return true;
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-700" id="study-wizard-root">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight text-gradient">{t('wizard.title')}</h1>
          <p className="text-primary font-medium uppercase tracking-[0.2em] text-[10px] mt-2">{t('wizard.subtitle')}</p>
        </div>
        <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
          {[
            { id: 1, label: `01 ${t('wizard.steps.general')}` },
            { id: 2, label: `02 ${t('wizard.steps.points')}` },
            { id: 3, label: `03 ${t('wizard.steps.review')}` }
          ].map((s) => (
            <div key={s.id} className={cn(
              "px-4 py-2 rounded-full border transition-all duration-500",
              step === s.id ? "bg-primary/20 border-primary text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]" : "bg-card/50 border-border text-muted-foreground"
            )}>
              {s.label}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {step === 1 && (
          <div className="space-y-6">
            {drafts.length > 0 && (
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-500">
                    <Save size={16} />
                    {t('wizard.drafts.title')} ({drafts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {drafts.map((draft) => (
                      <div key={draft.draftId} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg shadow-sm">
                        <div>
                          <p className="font-bold text-foreground text-sm">{draft.projectName || t('wizard.drafts.unnamed')}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                            {t('wizard.drafts.updated')}: {new Date(draft.lastUpdated).toLocaleString()} • {draft.samplingType === 'diurnal' ? t('wizard.sampling.diurnal') : t('wizard.sampling.diurnalNocturnal')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleLoadDraft(draft)}
                            className="bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20 text-[10px] font-black"
                          >
                            {t('common.load')}
                          </Button>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={async () => {
                              await studyService.deleteDraft(draft.draftId);
                              loadDrafts();
                            }}
                            className="text-muted-foreground hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="glass-card overflow-hidden">
            <CardHeader className="border-b border-border bg-card/50">
              <CardTitle className="text-xl font-black text-foreground flex items-center gap-2">
                <div className="w-1.5 h-6 bg-primary rounded-full" />
                {t('wizard.general.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 group">
                    <Label htmlFor="contractorId" className="text-xs font-black text-muted-foreground uppercase tracking-widest">{t('wizard.general.contractor')}</Label>
                    <select 
                      id="contractorId"
                      className="w-full h-12 px-4 bg-background border border-border rounded-2xl text-sm font-bold text-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none"
                      {...register('contractorId')}
                    >
                      {settings.contractors.map(c => (
                        <option key={c.id} value={c.id} className="bg-card text-foreground">{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 group">
                    <Label htmlFor="clientId" className="text-xs font-black text-muted-foreground uppercase tracking-widest">{t('wizard.general.client')}</Label>
                    <select 
                      id="clientId"
                      className="w-full h-12 px-4 bg-background border border-border rounded-2xl text-sm font-bold text-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none"
                      {...register('clientId')}
                    >
                      {settings.clients.map(c => (
                        <option key={c.id} value={c.id} className="bg-card text-foreground">{c.name}</option>
                      ))}
                    </select>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                   <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest">{t('wizard.sampling.title')}</Label>
                   <div className="flex gap-6">
                      <label className="flex items-center gap-3 cursor-pointer group">
                         <div className="relative flex items-center justify-center">
                            <input type="radio" value="diurnal" {...register('samplingType')} className="peer sr-only" />
                            <div className="w-5 h-5 border-2 border-border rounded-full peer-checked:border-primary peer-checked:bg-primary/20 transition-all" />
                            <div className="absolute w-2 h-2 bg-primary rounded-full scale-0 peer-checked:scale-100 transition-all" />
                         </div>
                         <span className="text-sm font-bold text-foreground/80 group-hover:text-foreground transition-colors">{t('wizard.sampling.diurnal')}</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                         <div className="relative flex items-center justify-center">
                            <input type="radio" value="diurnal_nocturnal" {...register('samplingType')} className="peer sr-only" />
                            <div className="w-5 h-5 border-2 border-border rounded-full peer-checked:border-primary peer-checked:bg-primary/20 transition-all" />
                            <div className="absolute w-2 h-2 bg-primary rounded-full scale-0 peer-checked:scale-100 transition-all" />
                         </div>
                         <span className="text-sm font-bold text-foreground/80 group-hover:text-foreground transition-colors">{t('wizard.sampling.diurnalNocturnal')}</span>
                      </label>
                   </div>
                </div>
                
                <div className="space-y-4">
                   <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest">{t('wizard.standards.title')}</Label>
                   <div className="grid grid-cols-1 gap-3">
                      {[
                        { id: 'COVENIN_2249', label: 'COVENIN 2249-1993 (VZLA)' },
                        { id: 'GO_36081', label: 'GACETA OFICIAL 36.081 (VZLA)' },
                        { id: 'OTHER_ATTACHED', label: t('wizard.standards.others') }
                      ].map(std => (
                        <label key={std.id} className="flex items-center gap-3 cursor-pointer p-3 bg-background border border-border rounded-xl hover:bg-card transition-all group">
                           <div className="relative flex items-center justify-center">
                              <input 
                                type="checkbox" 
                                value={std.id} 
                                checked={watch('selectedStandards').includes(std.id)}
                                onChange={(e) => {
                                  const current = watch('selectedStandards');
                                  if (e.target.checked) setValue('selectedStandards', [...current, std.id]);
                                  else setValue('selectedStandards', current.filter(id => id !== std.id));
                                }}
                                className="peer sr-only" 
                              />
                              <div className="w-5 h-5 border-2 border-border rounded-md peer-checked:border-primary peer-checked:bg-primary transition-all" />
                              <CheckCircle2 size={14} className="absolute text-foreground scale-0 peer-checked:scale-100 transition-all" />
                           </div>
                           <span className="text-[10px] font-black text-foreground/70 uppercase tracking-widest group-hover:text-foreground">{std.label}</span>
                        </label>
                      ))}
                   </div>
                   {errors.selectedStandards && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.selectedStandards.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                <div className="space-y-2">
                  <Label htmlFor="projectName" className="text-xs font-black text-muted-foreground uppercase tracking-widest">{t('wizard.general.projectName')}</Label>
                  <Input 
                    id="projectName" 
                    {...register('projectName')} 
                    placeholder="Ej: Planta ABA - Mascotas" 
                    className="h-12 bg-background border-border text-foreground rounded-2xl focus:ring-primary/20"
                  />
                  {errors.projectName && <p className="text-xs text-red-500 font-bold">{errors.projectName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-xs font-black text-muted-foreground uppercase tracking-widest">{t('wizard.general.location')}</Label>
                  <Input 
                    id="company" 
                    {...register('company')} 
                    placeholder="Ej: Planta Chivacoa - Almacén" 
                    className="h-12 bg-background border-border text-foreground rounded-2xl focus:ring-primary/20"
                  />
                  {errors.company && <p className="text-xs text-red-500 font-bold">{errors.company.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientAddress" className="text-xs font-black text-muted-foreground uppercase tracking-widest">Dirección Fiscal (Cliente)</Label>
                  <Input 
                    id="clientAddress" 
                    {...register('clientAddress')} 
                    placeholder="Dirección fiscal del cliente" 
                    className="h-12 bg-background border-border text-foreground rounded-2xl focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="worksiteAddress" className="text-xs font-black text-muted-foreground uppercase tracking-widest">Centro de Trabajo</Label>
                  <Input 
                    id="worksiteAddress" 
                    {...register('worksiteAddress')} 
                    placeholder="Dirección del centro de trabajo" 
                    className="h-12 bg-background border-border text-foreground rounded-2xl focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-xs font-black text-muted-foreground uppercase tracking-widest">{t('wizard.general.date')}</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    {...register('date')} 
                    className="h-12 bg-background border-border text-foreground rounded-2xl focus:ring-primary/20 [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-xs font-black text-muted-foreground uppercase tracking-widest">{t('wizard.general.status')}</Label>
                  <select 
                    id="status"
                    className="w-full h-12 px-4 bg-background border border-border rounded-2xl text-sm font-bold text-foreground focus:border-primary/50 outline-none appearance-none"
                    {...register('status')}
                  >
                    <option value="in_progress" className="bg-card text-foreground">{t('wizard.status.inProgress')}</option>
                    <option value="pending_approval" className="bg-card text-foreground">{t('wizard.status.pending')}</option>
                    <option value="completed" className="bg-card text-foreground">{t('wizard.status.completed')}</option>
                    <option value="archived" className="bg-card text-foreground">{t('wizard.status.archived')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border">
                <div className="p-6 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-3xl border border-border space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <Cpu size={16} /> {t('wizard.equipment.title')}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-[9px] uppercase font-black text-muted-foreground">{t('wizard.equipment.brand')}</Label>
                      <Input {...register('equipmentUsed.brand')} placeholder="Marca" className="h-9 text-xs bg-background border-border text-foreground rounded-xl" />
                      <Input {...register('equipmentUsed.model')} placeholder="Modelo" className="h-9 text-xs bg-background border-border text-foreground rounded-xl mt-2" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] uppercase font-black text-muted-foreground">{t('wizard.equipment.serial')}</Label>
                      <Input {...register('equipmentUsed.serial')} placeholder="Serial" className="h-9 text-xs bg-background border-border text-foreground rounded-xl" />
                      <Input type="date" {...register('equipmentUsed.calibrationDate')} className="h-9 text-xs bg-background border-border text-foreground rounded-xl mt-2 [color-scheme:dark]" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                   <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest">{t('report.summary')}</Label>
                   <textarea 
                     {...register('executiveSummary')}
                     className="w-full h-full min-h-[140px] p-4 text-sm bg-background border border-border rounded-3xl text-foreground resize-none focus:border-primary/50 outline-none transition-all"
                     placeholder={t('wizard.general.summaryPlaceholder')}
                   />
                </div>
              </div>

              {/* Condiciones Ambientales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border">
                <div className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl border border-border space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-blue-500 flex items-center gap-2">
                    <Cpu size={16} /> Condiciones Ambientales
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label className="text-[9px] uppercase font-black text-muted-foreground">Período Diurno</Label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number"
                            step="0.1"
                            {...register('weatherConditions.diurnal.temperature')} 
                            placeholder="25" 
                            className="h-9 text-xs bg-background border-border text-foreground rounded-xl flex-1" 
                          />
                          <span className="text-[10px] font-black text-muted-foreground whitespace-nowrap">°C</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number"
                            step="0.1"
                            {...register('weatherConditions.diurnal.humidity')} 
                            placeholder="60" 
                            className="h-9 text-xs bg-background border-border text-foreground rounded-xl flex-1" 
                          />
                          <span className="text-[10px] font-black text-muted-foreground whitespace-nowrap">% HR</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[9px] uppercase font-black text-muted-foreground">Período Nocturno</Label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number"
                            step="0.1"
                            {...register('weatherConditions.nocturnal.temperature')} 
                            placeholder="22" 
                            className="h-9 text-xs bg-background border-border text-foreground rounded-xl flex-1" 
                          />
                          <span className="text-[10px] font-black text-muted-foreground whitespace-nowrap">°C</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number"
                            step="0.1"
                            {...register('weatherConditions.nocturnal.humidity')} 
                            placeholder="65" 
                            className="h-9 text-xs bg-background border-border text-foreground rounded-xl flex-1" 
                          />
                          <span className="text-[10px] font-black text-muted-foreground whitespace-nowrap">% HR</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-3xl border border-border space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-green-500 flex items-center gap-2">
                    <Cpu size={16} /> Dimensiones del Área
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[9px] uppercase font-black text-muted-foreground">Largo (m)</Label>
                      <Input 
                        type="number"
                        {...register('dimensions.length')} 
                        placeholder="0.0" 
                        className="h-9 text-xs bg-background border-border text-foreground rounded-xl" 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] uppercase font-black text-muted-foreground">Ancho (m)</Label>
                      <Input 
                        type="number"
                        {...register('dimensions.width')} 
                        placeholder="0.0" 
                        className="h-9 text-xs bg-background border-border text-foreground rounded-xl" 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] uppercase font-black text-muted-foreground">Alto (m)</Label>
                      <Input 
                        type="number"
                        {...register('dimensions.height')} 
                        placeholder="0.0" 
                        className="h-9 text-xs bg-background border-border text-foreground rounded-xl" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border">
                <div className="p-6 bg-card rounded-3xl border border-border group hover:border-primary/30 transition-all">
                  <Label className="flex items-center gap-3 mb-4 text-xs font-black uppercase tracking-widest text-foreground/70">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <FileUp size={16} className="text-primary" />
                    </div>
                    {t('wizard.general.layout')}
                  </Label>
                  <Input 
                    type="file" 
                    accept=".pdf" 
                    {...register('layoutPdf')} 
                    onChange={(e) => {
                      if (validatePdf(e, 'layoutPdf')) {
                        register('layoutPdf').onChange(e);
                      }
                    }}
                    className="bg-background border-border text-foreground rounded-xl h-10 file:bg-primary file:text-foreground file:font-black file:text-[10px] file:uppercase file:border-none file:rounded-md file:mr-4 file:px-3" 
                  />
                  <p className="text-[10px] text-muted-foreground mt-3 italic">{t('wizard.general.layoutHint')}</p>
                </div>
                <div className="p-6 bg-card rounded-3xl border border-border group hover:border-purple-500/30 transition-all">
                  <Label className="flex items-center gap-3 mb-4 text-xs font-black uppercase tracking-widest text-foreground/70">
                    <div className="p-2 bg-accent/20 rounded-lg">
                      <Camera size={16} className="text-accent" />
                    </div>
                    {t('wizard.general.panoramic')}
                  </Label>
                  <Input type="file" accept="image/*" {...register('panoramicPhoto')} className="bg-background border-border text-foreground rounded-xl h-10 file:bg-accent file:text-foreground file:font-black file:text-[10px] file:uppercase file:border-none file:rounded-md file:mr-4 file:px-3" />
                  <p className="text-[10px] text-muted-foreground mt-3 italic">{t('wizard.general.panoramicHint')}</p>
                </div>
              </div>

              <div className="pt-8 flex justify-between items-center bg-primary/5 p-8 rounded-3xl border border-primary/20">
                <div>
                   <h3 className="font-black text-foreground text-lg leading-tight tracking-tight text-gradient">{t('wizard.general.attachments')}</h3>
                   <p className="text-[10px] text-primary/70 font-bold uppercase tracking-widest mt-1">{t('wizard.general.attachmentsHint')}</p>
                </div>
                <Button type="button" variant="outline" onClick={() => appendAtt({ type: 'calibration', file: null })} className="bg-primary text-foreground font-black border-none hover:bg-primary/80 transition-all rounded-xl px-6">
                   <Paperclip className="mr-2 h-4 w-4" /> {t('wizard.general.addAttachment')}
                </Button>
              </div>

              {attFields.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {attFields.map((field, i) => (
                    <div key={field.id} className="flex gap-2 items-center bg-card p-3 rounded-lg border border-border">
                      <select {...register(`attachments.${i}.type`)} className="text-[10px] uppercase font-black bg-foreground/10 p-1 rounded">
                        <option value="calibration">Calibración</option>
                        <option value="minutes">Minuta</option>
                        <option value="manual_form">Forma Manual</option>
                      </select>
                      <Input 
                        type="file" 
                        accept=".pdf"
                        {...register(`attachments.${i}.file`)} 
                        onChange={(e) => {
                          if (validatePdf(e, `attachments.${i}.file`)) {
                            register(`attachments.${i}.file`).onChange(e);
                          }
                        }}
                        className="h-8 text-[10px]" 
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeAtt(i)} className="h-8 w-8 text-destructive">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-10 flex flex-col md:flex-row justify-between gap-4">
                <Button type="button" variant="outline" onClick={handleSaveDraft} className="h-14 flex-1 bg-transparent border-border text-foreground font-black uppercase tracking-widest text-[10px] hover:bg-card rounded-2xl">
                   <Save className="mr-2 h-4 w-4 text-primary" /> {t('common.saveDraft')}
                </Button>
                <Button type="button" onClick={() => setStep(2)} className="h-14 flex-[2] bg-primary text-foreground font-black uppercase tracking-[0.2em] text-[11px] hover:bg-primary/80 hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.4)] transition-all duration-300 rounded-2xl group">
                  {t('common.next')} <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-6 border-b border-border">
               <div>
                  <h2 className="text-3xl font-black text-foreground tracking-tight text-gradient">{t('wizard.steps.points')}</h2>
                  <p className="text-[10px] text-primary/70 mt-1 uppercase font-black tracking-[0.2em]">{t('wizard.points.addSubtitle')}</p>
               </div>
               <Button type="button" onClick={() => appendArea({ name: '', standardLux: 300, readings: [{ pointName: t('wizard.points.point') + ' 1', illuminance: 0, illuminanceDiurnal: 0, illuminanceNocturnal: 0, lightType: 'artificial', latitude: 0, longitude: 0 }] })} className="bg-primary text-foreground font-black text-[10px] uppercase tracking-widest hover:bg-primary/80 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] rounded-xl px-8 h-12">
                 <Plus className="mr-2 h-4 w-4" /> {t('wizard.points.addBtn')}
               </Button>
            </div>

            <Reorder.Group axis="y" values={areaFields} onReorder={(newOrder) => {
              // Find which item was moved by looking for the first difference
              const diffIndex = newOrder.findIndex((item, index) => item.id !== areaFields[index]?.id);
              if (diffIndex !== -1) {
                // If there's a difference, find the original index of the item now at diffIndex
                const originalIndex = areaFields.findIndex(f => f.id === newOrder[diffIndex].id);
                if (originalIndex !== -1) {
                  moveArea(originalIndex, diffIndex);
                }
              }
            }} className="space-y-8">
              {areaFields.map((area, areaIndex) => {
                const areaReadings = watch(`areas.${areaIndex}.readings`);
                const isDiurnalNocturnal = watch('samplingType') === 'diurnal_nocturnal';

                const avgDiurnal = areaReadings.length > 0 
                  ? areaReadings.reduce((sum, r) => sum + (r.illuminanceDiurnal || r.illuminance || 0), 0) / areaReadings.length 
                  : 0;
                
                const avgNocturnal = areaReadings.length > 0 
                  ? areaReadings.reduce((sum, r) => sum + (r.illuminanceNocturnal || 0), 0) / areaReadings.length 
                  : 0;

                const avgLux = isDiurnalNocturnal ? (avgDiurnal + avgNocturnal) / 2 : avgDiurnal;
                const targetLux = watch(`areas.${areaIndex}.standardLux`);
                const isCompliant = isDiurnalNocturnal 
                  ? (avgDiurnal >= targetLux && avgNocturnal >= targetLux)
                  : avgDiurnal >= targetLux;

                return (
                  <Reorder.Item key={area.id} value={area}>
                    <Card className="glass-card border-l-4 border-l-primary overflow-hidden group/card hover:shadow-[0_0_40px_rgba(var(--primary-rgb),0.1)] transition-all duration-500">
                      <CardHeader className="bg-card/50 border-b border-border flex flex-col md:flex-row items-center justify-between py-6 px-8 gap-6">
                        <div className="flex gap-6 items-center flex-1 w-full">
                          <div className="flex items-center cursor-grab active:cursor-grabbing text-muted-foreground hover:text-primary transition-colors" title={t('wizard.points.dragHint')}>
                             <GripVertical size={24} />
                          </div>
                          <div className="flex-1 space-y-2">
                            <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">{t('wizard.points.areaName')}</Label>
                            <Input 
                              {...register(`areas.${areaIndex}.name`)} 
                              placeholder="Ej: Almacén de Granos" 
                              className="h-12 text-base font-black bg-background border-border text-foreground rounded-2xl focus:border-primary/50"
                            />
                          </div>
                          <div className="w-64 space-y-2">
                            <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">{t('wizard.points.standard')}</Label>
                            <select 
                              className="w-full h-12 text-sm bg-background border border-border text-foreground rounded-2xl px-4 outline-none focus:border-primary/50 font-black appearance-none"
                              {...register(`areas.${areaIndex}.standardLux`, { valueAsNumber: true })}
                            >
                              {COVENIN_2249_STANDARDS.map(s => (
                                <option key={s.area} value={s.minLux} className="bg-card text-foreground">{s.area} ({s.minLux} Lux)</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="flex items-center gap-8 bg-card/80 p-4 rounded-3xl border border-border">
                           {isDiurnalNocturnal ? (
                             <>
                               <div className="text-center px-4">
                                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">{t('report.averageDiurnal')}</p>
                                  <p className={cn("text-2xl font-black leading-none", avgDiurnal >= targetLux ? "text-primary drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]" : "text-amber-500")}>
                                    {avgDiurnal.toFixed(1)} <span className="text-xs opacity-50 font-medium">Lx</span>
                                  </p>
                               </div>
                               <div className="w-px h-8 bg-border" />
                               <div className="text-center px-4">
                                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">{t('report.averageNocturnal')}</p>
                                  <p className={cn("text-2xl font-black leading-none", avgNocturnal >= targetLux ? "text-primary drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]" : "text-amber-500")}>
                                    {avgNocturnal.toFixed(1)} <span className="text-xs opacity-50 font-medium">Lx</span>
                                  </p>
                               </div>
                             </>
                           ) : (
                             <div className="text-right px-4">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{t('report.average')}</p>
                                <p className={cn("text-xl font-black leading-none", isCompliant ? "text-primary" : "text-amber-500")}>
                                  {avgDiurnal.toFixed(1)} <span className="text-[10px] opacity-70">Lx</span>
                                </p>
                             </div>
                           )}
                           
                           <div className="flex items-center gap-4 border-l border-border pl-4">
                               <div className="space-y-0.5">
                                 <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{t('wizard.points.count')}</p>
                                 <Input 
                                   type="number" 
                                   placeholder="#"
                                   className="w-12 h-7 text-[10px] font-black bg-background border-border text-foreground rounded-lg text-center"
                                         onKeyDown={(e) => {
                                           if (e.key === 'Enter') {
                                             e.preventDefault();
                                             const val = parseInt((e.target as HTMLInputElement).value);
                                             if (val > 0) {
                                               const currentReadings = watch(`areas.${areaIndex}.readings`) || [];
                                               const newReadings = Array.from({ length: val }, (_, i) => ({
                                                 pointName: `${t('wizard.points.point')} ${currentReadings.length + i + 1}`,
                                                 department: '',
                                                 visualRequirement: 'medium',
                                                 illuminance: 0,
                                                 illuminanceDiurnal: 0,
                                                 illuminanceNocturnal: 0,
                                                 lightType: 'artificial' as const,
                                                 lampCount: 0,
                                                 operativeLamps: 0,
                                                 nonOperativeLamps: 0,
                                                 latitude: 0,
                                                 longitude: 0
                                               }));
                                               setValue(`areas.${areaIndex}.readings`, [...currentReadings, ...newReadings] as any);
                                               (e.target as HTMLInputElement).value = '';
                                               toast.success(`${val} ${t('wizard.points.added')}`);
                                             }
                                           }
                                         }}
                                 />
                               </div>
                               <Button type="button" variant="ghost" size="icon" onClick={() => removeArea(areaIndex)} className="text-muted-foreground hover:text-red-500 transition-colors">
                                  <Trash2 size={18} />
                               </Button>
                            </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="divide-y divide-border bg-card/30">
                          {areaReadings.map((reading, pointIndex) => {
                            const diurnalVal = reading.illuminanceDiurnal || reading.illuminance || 0;
                            const nocturnalVal = reading.illuminanceNocturnal || 0;
                            const isDiurnalBelow = diurnalVal < targetLux;
                            const isNocturnalBelow = nocturnalVal < targetLux;
                            
                            return (
                              <div key={pointIndex} className="p-6 border-b border-border last:border-0 hover:bg-card/50 transition-all duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                  <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{t('wizard.points.pointName')}</Label>
                                    <Input 
                                      {...register(`areas.${areaIndex}.readings.${pointIndex}.pointName`)} 
                                      placeholder="Punto" 
                                      className="h-9 text-xs font-bold bg-background border-border text-foreground rounded-lg"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{t('wizard.points.department')}</Label>
                                    <Input 
                                      {...register(`areas.${areaIndex}.readings.${pointIndex}.department`)} 
                                      placeholder="Ej: Control de Calidad" 
                                      className="h-9 text-xs bg-background border-border rounded-lg"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{t('wizard.points.visualReq')}</Label>
                                    <select 
                                      className="w-full h-9 px-3 text-xs bg-background border border-border rounded-lg outline-none focus:ring-1 focus:ring-primary/30 transition-all appearance-none cursor-pointer"
                                      {...register(`areas.${areaIndex}.readings.${pointIndex}.visualRequirement`)}
                                    >
                                      <option value="low">{t('wizard.visualReq.low')}</option>
                                      <option value="medium">{t('wizard.visualReq.medium')}</option>
                                      <option value="high">{t('wizard.visualReq.high')}</option>
                                    </select>
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{t('wizard.points.lampType')}</Label>
                                    <select 
                                      className="w-full h-9 px-3 text-xs bg-background border border-border text-foreground rounded-lg outline-none focus:border-primary/50 appearance-none font-bold"
                                      {...register(`areas.${areaIndex}.readings.${pointIndex}.lampType`)}
                                    >
                                      <option value="">{t('common.select')}...</option>
                                      {VENEZUELA_INDUSTRIAL_LAMPS.map(l => (
                                        <option key={l.name} value={l.name}>{l.name}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6 items-end">
                                  {isDiurnalNocturnal ? (
                                    <>
                                      <div className="space-y-1.5">
                                        <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{t('wizard.points.luxDiurnal')}</Label>
                                        <div className="relative">
                                          <Input 
                                            type="number"
                                            {...register(`areas.${areaIndex}.readings.${pointIndex}.illuminanceDiurnal`, { valueAsNumber: true })} 
                                            className={cn("h-9 text-xs pr-8 font-black bg-background border-border text-foreground rounded-lg", isDiurnalBelow ? "border-amber-500/50 text-amber-400" : "text-primary")}
                                          />
                                          <div className="absolute right-2 top-2">
                                            {isDiurnalBelow ? <AlertCircle size={14} className="text-amber-500" /> : <CheckCircle2 size={14} className="text-primary" />}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="space-y-1.5">
                                        <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{t('wizard.points.luxNocturnal')}</Label>
                                        <div className="relative">
                                          <Input 
                                            type="number"
                                            {...register(`areas.${areaIndex}.readings.${pointIndex}.illuminanceNocturnal`, { valueAsNumber: true })} 
                                            className={cn("h-9 text-xs pr-8 font-black bg-background border-border text-foreground rounded-lg", isNocturnalBelow ? "border-amber-500/50 text-amber-400" : "text-primary")}
                                          />
                                          <div className="absolute right-2 top-2">
                                            {isNocturnalBelow ? <AlertCircle size={14} className="text-amber-500" /> : <CheckCircle2 size={14} className="text-primary" />}
                                          </div>
                                        </div>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="space-y-1.5">
                                      <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{t('wizard.points.lux')}</Label>
                                      <div className="relative">
                                        <Input 
                                          type="number"
                                          {...register(`areas.${areaIndex}.readings.${pointIndex}.illuminance`, { valueAsNumber: true })} 
                                          className={cn("h-9 text-xs pr-8 font-black bg-background border-border text-foreground rounded-lg", isDiurnalBelow ? "border-amber-500/50 text-amber-400" : "text-primary")}
                                        />
                                        <div className="absolute right-2 top-2">
                                          {isDiurnalBelow ? <AlertCircle size={14} className="text-amber-500" /> : <CheckCircle2 size={14} className="text-primary" />}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{t('wizard.points.lampCount')}</Label>
                                    <Input type="number" {...register(`areas.${areaIndex}.readings.${pointIndex}.lampCount`, { valueAsNumber: true })} className="h-9 text-xs bg-background border-border rounded-lg" />
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 col-span-2">
                                    <div className="space-y-1.5">
                                      <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{t('wizard.points.operative')}</Label>
                                      <Input type="number" {...register(`areas.${areaIndex}.readings.${pointIndex}.operativeLamps`, { valueAsNumber: true })} className="h-9 text-xs bg-background border-border rounded-lg" />
                                    </div>
                                    <div className="space-y-1.5">
                                      <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{t('wizard.points.nonOperative')}</Label>
                                      <Input type="number" {...register(`areas.${areaIndex}.readings.${pointIndex}.nonOperativeLamps`, { valueAsNumber: true })} className="h-9 text-xs font-bold bg-background border-border rounded-lg text-amber-500" />
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button 
                                      type="button" 
                                      variant="outline" 
                                      size="icon"
                                      className={cn("h-9 w-9 bg-background border-border rounded-lg hover:bg-card", reading.latitude !== 0 && "bg-primary/20 text-primary border-primary/50")}
                                      onClick={() => captureGPSPoint(areaIndex, pointIndex)}
                                      title="GPS"
                                    >
                                      <MapPin size={14} />
                                    </Button>
                                    {!reading.photo ? (
                                      <div className="relative">
                                        <Button type="button" variant="outline" size="icon" className="h-9 w-9 bg-background border-border text-foreground rounded-lg hover:bg-card" title="Subir Foto">
                                          <Camera size={14} />
                                        </Button>
                                        <input 
                                          type="file" 
                                          accept="image/*" 
                                          capture="environment" 
                                          className="absolute inset-0 opacity-0 cursor-pointer"
                                          onChange={(e) => handlePhotoUpload(e, areaIndex, pointIndex)}
                                        />
                                      </div>
                                    ) : (
                                      <div 
                                        className="relative w-9 h-9 rounded-lg overflow-hidden cursor-pointer group border border-border"
                                        onClick={() => setPreviewImage(reading.photo)}
                                      >
                                        <img src={reading.photo} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                          <Eye size={12} className="text-foreground" />
                                        </div>
                                      </div>
                                    )}
                                    <Button 
                                      type="button" 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => {
                                         const current = watch(`areas.${areaIndex}.readings`);
                                         setValue(`areas.${areaIndex}.readings`, current.filter((_, i) => i !== pointIndex));
                                      }}
                                      className="h-9 w-9 text-muted-foreground hover:text-red-500 bg-background border border-border rounded-lg transition-colors"
                                    >
                                      <Trash2 size={14} />
                                    </Button>
                                  </div>
                                </div>

                                <div className="space-y-1.5">
                                  <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{t('wizard.points.observations')}</Label>
                                  <textarea 
                                    {...register(`areas.${areaIndex}.readings.${pointIndex}.observation`)}
                                    placeholder="Nota o detalle técnico del punto..."
                                    className="w-full h-16 p-3 text-xs bg-background border border-border text-foreground rounded-xl resize-none outline-none focus:border-primary/50 transition-all"
                                  />
                                </div>
                              </div>
                            );
                          })}

                        </div>
                        <div className="p-6 bg-card/10 flex justify-center border-t border-border">
                           <Button 
                            type="button" 
                            variant="ghost" 
                            className="text-primary hover:bg-primary/10 text-xs font-black uppercase tracking-[0.2em] transition-all"
                            onClick={() => {
                               const current = watch(`areas.${areaIndex}.readings`);
                               setValue(`areas.${areaIndex}.readings`, [...current, {                                   pointName: `${t('wizard.points.point')} ${current.length + 1}`, 
                                  department: '',
                                  visualRequirement: 'medium',
                                  illuminance: 0, 
                                  illuminanceDiurnal: 0, 
                                  illuminanceNocturnal: 0, 
                                  lightType: 'artificial', 
                                  lampCount: 0,
                                  operativeLamps: 0,
                                  nonOperativeLamps: 0,
                                  latitude: 0, 
                                  longitude: 0 
 }]);
                            }}
                           >
                             <Plus className="mr-2 h-4 w-4" /> {t('wizard.points.registerPoint')} {watch(`areas.${areaIndex}.name`) || t('wizard.points.area')}
                           </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>

            <div className="flex justify-center pb-10">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => appendArea({ 
                  name: '', 
                  standardLux: 300, 
                  readings: [{ 
                    pointName: t('wizard.points.point') + ' 1', 
                    department: '',
                    visualRequirement: 'medium',
                    illuminance: 0, 
                    illuminanceDiurnal: 0, 
                    illuminanceNocturnal: 0, 
                    lightType: 'artificial', 
                    lampCount: 0,
                    operativeLamps: 0,
                    nonOperativeLamps: 0,
                    latitude: 0, 
                    longitude: 0,
                    observation: ''
                  }] 
                })} 
                className="h-14 px-10 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] bg-background border-primary/20 text-primary hover:bg-primary/10 transition-all border-dashed border-2 shadow-xl hover:shadow-primary/10"
              >
                <Plus className="mr-3 h-5 w-5" /> {t('wizard.points.addBtn')}
              </Button>
            </div>


            <div className="pt-10 flex items-center justify-between border-t border-border">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setStep(1)} 
                className="h-12 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest text-muted-foreground hover:text-foreground hover:bg-card transition-all"
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> {t('common.previous')}
              </Button>
              <div className="flex gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleSaveDraft} 
                  className="h-12 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-transparent border-border text-muted-foreground hover:bg-card transition-all"
                >
                  <Save className="mr-2 h-4 w-4" /> {t('common.saveDraft')}
                </Button>
                <Button 
                  type="button" 
                  onClick={() => setStep(3)} 
                  className="h-12 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-primary text-foreground hover:bg-primary/80 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] transition-all group"
                >
                  {t('common.next')} <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-all" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in slide-in-from-right duration-500">
            <div className="py-6 border-b border-border">
              <h2 className="text-3xl font-black text-foreground tracking-tight text-gradient">{t('wizard.steps.review')}</h2>
              <p className="text-[10px] text-primary/70 mt-1 uppercase font-black tracking-[0.2em]">{t('wizard.review.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {watch('areas').map((area, idx) => {
                const isDiurnalNocturnal = watch('samplingType') === 'diurnal_nocturnal';
                const avgDiurnal = area.readings.reduce((sum, r) => sum + (r.illuminanceDiurnal || r.illuminance || 0), 0) / area.readings.length;
                const avgNocturnal = area.readings.reduce((sum, r) => sum + (r.illuminanceNocturnal || 0), 0) / area.readings.length;
                const isCompliant = isDiurnalNocturnal 
                  ? (avgDiurnal >= area.standardLux && avgNocturnal >= area.standardLux)
                  : avgDiurnal >= area.standardLux;

                return (
                  <Card key={idx} className="glass-card overflow-hidden border-l-4 border-l-primary">
                    <CardHeader className="bg-card/50 flex flex-row items-center justify-between p-6">
                      <div>
                        <h3 className="text-lg font-black text-foreground">{area.name || t('wizard.points.area')}</h3>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{t('wizard.points.standard')}: {area.standardLux} Lux</p>
                      </div>
                      <div className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        isCompliant ? "bg-primary/10 border-primary/50 text-primary" : "bg-amber-500/10 border-amber-500/50 text-amber-500"
                      )}>
                        {isCompliant ? t('report.compliant') : t('report.nonCompliant')}
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 border-t border-border">
                      <div className="grid grid-cols-2 bg-card/20 text-center divide-x divide-border">
                        <div className="p-4">
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">{t('report.averageDiurnal')}</p>
                          <p className="text-xl font-black text-foreground">{avgDiurnal.toFixed(1)} <span className="text-[10px] opacity-50">Lx</span></p>
                        </div>
                        <div className="p-4">
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">{t('report.averageNocturnal')}</p>
                          <p className="text-xl font-black text-foreground">{isDiurnalNocturnal ? `${avgNocturnal.toFixed(1)} Lx` : 'N/A'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="glass-card border-none overflow-hidden shadow-2xl">
               <CardHeader className="bg-card/50 border-b border-border p-8">
                  <CardTitle className="text-xl font-black text-foreground flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-primary rounded-full" />
                    {t('wizard.review.analysisTitle')}
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t('report.conclusions')}</Label>
                       <textarea 
                        {...register('conclusions')}
                        placeholder={t('wizard.review.conclusionsPlaceholder')}
                        className="w-full h-40 p-4 text-sm bg-background border border-border text-foreground rounded-[2rem] resize-none outline-none focus:border-primary/50 transition-all"
                       />
                    </div>
                    <div className="space-y-3">
                       <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t('report.recommendations')}</Label>
                       <textarea 
                        {...register('recommendations')}
                        placeholder={t('wizard.review.recommendationsPlaceholder')}
                        className="w-full h-40 p-4 text-sm bg-background border border-border text-foreground rounded-[2rem] resize-none outline-none focus:border-primary/50 transition-all"
                       />
                    </div>
                  </div>
               </CardContent>
            </Card>

            <div className="pt-10 flex items-center justify-between border-t border-border">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setStep(2)} 
                disabled={isSaving}
                className="h-12 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest text-muted-foreground hover:text-foreground hover:bg-card transition-all"
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> {t('common.previous')}
              </Button>
              <div className="flex gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleSaveDraft} 
                  disabled={isSaving}
                  className="h-12 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-transparent border-border text-muted-foreground hover:bg-card transition-all"
                >
                  <Save className="mr-2 h-4 w-4" /> {t('common.saveDraft')}
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="h-12 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-primary text-foreground hover:bg-primary/80 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] transition-all"
                >
                  {isSaving ? (
                    t('common.processing')
                  ) : (
                    <><CheckCircle2 className="mr-2 h-4 w-4" /> {t('wizard.review.finishBtn')}</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 4 && savedData && (
          <div className="text-center py-10 space-y-10 animate-in fade-in zoom-in duration-700">
            <div className="flex justify-center">
              <div className="w-32 h-32 bg-primary/20 text-primary rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(var(--primary-rgb),0.3)]">
                <CheckCircle2 size={64} className="animate-pulse" />
              </div>
            </div>
            <div>
              <h2 className="text-5xl font-black text-foreground tracking-tight text-gradient">{t('wizard.success.title')}</h2>
              <p className="text-primary/70 font-black uppercase tracking-[0.3em] text-[10px] mt-4">{t('wizard.success.subtitle')}</p>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
               {savedData.areas.map((area, idx) => {
                 const isDiurnalNocturnal = savedData.samplingType === 'diurnal_nocturnal';
                 const avgDiurnal = area.readings.reduce((sum, r) => sum + (r.illuminanceDiurnal || r.illuminance || 0), 0) / area.readings.length;
                 const avgNocturnal = area.readings.reduce((sum, r) => sum + (r.illuminanceNocturnal || 0), 0) / area.readings.length;
                 const isCompliant = isDiurnalNocturnal 
                   ? (avgDiurnal >= area.standardLux && avgNocturnal >= area.standardLux)
                   : avgDiurnal >= area.standardLux;
                 return (
                        <Card key={idx} className="glass-card overflow-hidden border-none shadow-xl text-left">
                     <CardHeader className="bg-foreground/5 border-b border-border flex flex-row items-center justify-between py-6 px-8">
                        <div>
                          <CardTitle className="text-sm font-black uppercase tracking-widest text-foreground/80">{area.name || t('wizard.points.area')}</CardTitle>
                          <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">
                            {savedData.samplingType === 'diurnal_nocturnal' ? (
                              <>D: {avgDiurnal.toFixed(1)} Lx | N: {avgNocturnal.toFixed(1)} Lx</>
                            ) : (
                              <>Promedio: {avgDiurnal.toFixed(1)} Lx</>
                            )}
                            {' '}vs Ref: {area.standardLux} Lx
                          </p>
                       </div>
                       <div className={cn(
                         "flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                         isCompliant ? "bg-primary/10 border-primary/50 text-primary" : "bg-amber-500/10 border-amber-500/50 text-amber-500"
                       )}>
                         {isCompliant ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                         {isCompliant ? t('report.compliant') : t('report.nonCompliant')}
                       </div>
                     </CardHeader>
                   </Card>
                 );
               })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <Button type="button" onClick={handleEditAgain} className="h-28 flex-col gap-3 glass-card border-border hover:border-primary/50 text-foreground rounded-3xl transition-all">
                <Plus size={32} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest">{t('wizard.success.editBtn')}</span>
              </Button>
              <Button onClick={handleDownloadPDF} className="h-28 flex-col gap-3 bg-primary text-primary-foreground hover:bg-primary/80 rounded-3xl transition-all shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]">
                <Download size={32} />
                <span className="text-[10px] font-black uppercase tracking-widest">{t('wizard.success.pdfBtn')}</span>
              </Button>
              <Button onClick={handleShareWhatsApp} className="h-28 flex-col gap-3 bg-[#25D366] text-white hover:bg-[#20b858] rounded-3xl transition-all shadow-[0_0_30px_rgba(37,211,102,0.3)]">
                <Share2 size={32} />
                <span className="text-[10px] font-black uppercase tracking-widest">WhatsApp</span>
              </Button>
            </div>
            
            <Button variant="ghost" onClick={() => {
              setStep(1);
              setSavedData(null);
            }} className="text-muted-foreground hover:text-foreground uppercase font-black tracking-widest text-[10px]">
              {t('wizard.success.newBtn')}
            </Button>

            {/* Hidden template for PDF generation */}
            <PDFReportTemplate data={savedData} id="report-template" />
          </div>
        )}
      </form>

      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-black/95 border-none shadow-2xl">
          <div className="relative w-full aspect-square md:aspect-video flex items-center justify-center">
             <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-4 right-4 z-50 text-foreground hover:bg-foreground/20 rounded-full"
                onClick={() => setPreviewImage(null)}
             >
                <X size={24} />
             </Button>
             {previewImage && (
               <img src={previewImage} alt="Preview" className="max-w-full max-h-full object-contain" />
             )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
