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
      photo: z.any().optional()
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
      areas: [{ 
        name: 'Área General', 
        standardLux: 300, 
        readings: [{ 
          pointName: 'Punto 1', 
          illuminance: 0, 
          illuminanceDiurnal: 0, 
          illuminanceNocturnal: 0, 
          lightType: 'artificial', 
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

  const onSubmit = async (data: StudyFormValues) => {
    setIsSaving(true);
    try {
      await studyService.syncToSheets(data);
      setSavedData(data);
      setStep(3); // Success step
      toast.success('Estudio guardado y sincronizado exitosamente');
      
      // If was a draft, we can delete it or mark it as completed
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
    <div className="max-w-4xl mx-auto pb-20" id="study-wizard-root">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Registro de Estudio</h1>
          <p className="text-slate-500 italic">Determinación de conformidad de iluminancia media.</p>
        </div>
        <div className="flex gap-2 text-sm font-bold uppercase tracking-widest text-slate-400">
          <span className={cn(step === 1 && "text-blue-600")}>01 General</span>
          <span>/</span>
          <span className={cn(step === 2 && "text-blue-600")}>02 Puntos</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {step === 1 && (
          <div className="space-y-6">
            {drafts.length > 0 && (
              <Card className="border-amber-200 bg-amber-50/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Save size={16} className="text-amber-500" />
                    Borradores Guardados ({drafts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {drafts.map((draft) => (
                      <div key={draft.draftId} className="flex items-center justify-between p-3 bg-white border border-amber-100 rounded-lg shadow-sm">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{draft.projectName || 'Estudio sin nombre'}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                            Actualizado: {new Date(draft.lastUpdated).toLocaleString()} • {draft.samplingType === 'diurnal' ? 'Diurno' : 'Diurno/Nocturno'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleLoadDraft(draft)}
                            className="bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 text-[10px] font-black"
                          >
                            CARGAR
                          </Button>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={async () => {
                              await studyService.deleteDraft(draft.draftId);
                              loadDrafts();
                            }}
                            className="text-slate-300 hover:text-red-500"
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

            <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <Label htmlFor="contractorId" className="text-blue-900 font-bold mb-2 block">Empresa Prestadora (Contratista)</Label>
                    <select 
                      id="contractorId"
                      className="w-full h-11 px-3 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-900"
                      {...register('contractorId')}
                    >
                      {settings.contractors.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-blue-600 mt-2 italic">Entidad que realiza el estudio técnico.</p>
                 </div>

                 <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <Label htmlFor="clientId" className="text-slate-900 font-bold mb-2 block">Empresa Solicitante (Contratante)</Label>
                    <select 
                      id="clientId"
                      className="w-full h-11 px-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 outline-none font-bold text-slate-900"
                      {...register('clientId')}
                    >
                      {settings.clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500 mt-2 italic">Entidad que contrata el servicio.</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                   <Label className="text-slate-900 font-bold">Tipo de Muestreo</Label>
                   <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                         <input type="radio" value="diurnal" {...register('samplingType')} className="w-4 h-4 text-blue-600" />
                         <span className="text-sm">Diurno</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                         <input type="radio" value="diurnal_nocturnal" {...register('samplingType')} className="w-4 h-4 text-blue-600" />
                         <span className="text-sm">Diurno y Nocturno</span>
                      </label>
                   </div>
                </div>
                
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                   <Label className="text-slate-900 font-bold">Normativas de Referencia</Label>
                   <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: 'COVENIN_2249', label: 'COVENIN 2249-1993 (VZLA)' },
                        { id: 'GO_36081', label: 'GACETA OFICIAL 36.081 (VZLA)' },
                        { id: 'OTHER_ATTACHED', label: 'OTROS (PDF ANEXOS)' }
                      ].map(std => (
                        <label key={std.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-slate-100 rounded">
                           <input 
                             type="checkbox" 
                             value={std.id} 
                             checked={watch('selectedStandards').includes(std.id)}
                             onChange={(e) => {
                               const current = watch('selectedStandards');
                               if (e.target.checked) setValue('selectedStandards', [...current, std.id]);
                               else setValue('selectedStandards', current.filter(id => id !== std.id));
                             }}
                             className="w-4 h-4 rounded text-blue-600" 
                           />
                           <span className="text-[10px] font-bold uppercase">{std.label}</span>
                        </label>
                      ))}
                   </div>
                   {errors.selectedStandards && <p className="text-[10px] text-red-500">{errors.selectedStandards.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Nombre del Proyecto / Área</Label>
                  <Input id="projectName" {...register('projectName')} placeholder="Ej: Planta ABA - Mascotas" />
                  {errors.projectName && <p className="text-xs text-red-500">{errors.projectName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Sede o Instalación Específica</Label>
                  <Input id="company" {...register('company')} placeholder="Ej: Planta Chivacoa - Almacén" />
                  {errors.company && <p className="text-xs text-red-500">{errors.company.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha del Estudio</Label>
                  <Input id="date" type="date" {...register('date')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Estado del Proyecto</Label>
                  <select 
                    id="status"
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    {...register('status')}
                  >
                    <option value="in_progress">En Progreso</option>
                    <option value="pending_approval">Pendiente por Aprobación</option>
                    <option value="completed">Completado</option>
                    <option value="archived">Archivado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="p-4 bg-slate-900 text-white rounded-xl space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                    <Cpu size={14} /> Equipo de Medición
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[8px] uppercase opacity-50">Marca / Modelo</Label>
                      <Input {...register('equipmentUsed.brand')} placeholder="Marca" className="h-7 text-[10px] bg-white/10 border-white/20 text-white" />
                      <Input {...register('equipmentUsed.model')} placeholder="Modelo" className="h-7 text-[10px] bg-white/10 border-white/20 text-white mt-1" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[8px] uppercase opacity-50">Serial / Calib.</Label>
                      <Input {...register('equipmentUsed.serial')} placeholder="Serial" className="h-7 text-[10px] bg-white/10 border-white/20 text-white" />
                      <Input type="date" {...register('equipmentUsed.calibrationDate')} className="h-7 text-[10px] bg-white/10 border-white/20 text-white mt-1" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                   <Label className="text-xs font-black uppercase text-slate-400">Resumen Ejecutivo</Label>
                   <textarea 
                     {...register('executiveSummary')}
                     className="w-full h-24 p-3 text-xs bg-slate-50 border rounded-xl resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                     placeholder="Breve descripción del alcance y hallazgos principales..."
                   />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <Label className="flex items-center gap-2 mb-2">
                    <FileUp size={16} className="text-blue-600" />
                    Layout / Croquis (PDF)
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
                    className="bg-white" 
                  />
                  <p className="text-[10px] text-slate-400 mt-2 italic">Cargue el plano con la distribución de puntos de muestreo.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <Label className="flex items-center gap-2 mb-2">
                    <Camera size={16} className="text-blue-600" />
                    Imagen Panorámica (Área)
                  </Label>
                  <Input type="file" accept="image/*" {...register('panoramicPhoto')} className="bg-white" />
                  <p className="text-[10px] text-slate-400 mt-2 italic">Esta imagen será incluida en la portada del reporte.</p>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center bg-blue-50 p-6 rounded-xl border border-blue-100">
                <div>
                   <h3 className="font-bold text-blue-900 leading-tight">Anexos Técnicos</h3>
                   <p className="text-xs text-blue-600 italic">Cargue minutas, certificados o formas manuales.</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => appendAtt({ type: 'calibration', file: null })} className="bg-white text-blue-600 border-blue-200">
                   <Paperclip className="mr-1 h-3 w-3" /> Añadir Anexo
                </Button>
              </div>

              {attFields.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {attFields.map((field, i) => (
                    <div key={field.id} className="flex gap-2 items-center bg-white p-3 rounded-lg border border-slate-200">
                      <select {...register(`attachments.${i}.type`)} className="text-[10px] uppercase font-black bg-slate-100 p-1 rounded">
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
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeAtt(i)} className="h-8 w-8 text-red-400">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 flex justify-between gap-2">
                <Button type="button" variant="outline" onClick={handleSaveDraft} className="flex-1">
                   <Save className="mr-2 h-4 w-4" /> Guardar Borrador
                </Button>
                <Button type="button" onClick={() => setStep(2)} className="flex-1">
                  {t('common.next')} <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div className="flex items-center justify-between sticky top-0 z-10 bg-slate-50 py-2">
               <div className="flex flex-col">
                  <h2 className="text-xl font-bold text-slate-900 leading-none">Áreas y Puntos de Muestreo</h2>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">Defina las áreas y cargue las mediciones</p>
               </div>
               <Button type="button" variant="outline" size="sm" onClick={() => appendArea({ name: '', standardLux: 300, readings: [{ pointName: 'Punto 1', illuminance: 0, illuminanceDiurnal: 0, illuminanceNocturnal: 0, lightType: 'artificial', latitude: 0, longitude: 0 }] })} className="bg-white border-blue-200 text-blue-600 hover:bg-blue-50">
                 <Plus className="mr-1 h-3 w-3" /> Añadir Área
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
                    <Card className="border-l-4 border-l-blue-600 shadow-sm overflow-hidden">
                      <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between py-4">
                        <div className="flex gap-4 items-end flex-1">
                          <div className="flex items-center self-center mr-2 cursor-grab active:cursor-grabbing text-slate-300 hover:text-blue-600 transition-colors" title="Arrastrar para reordenar">
                             <GripVertical size={20} />
                          </div>
                          <div className="flex-1 max-w-xs space-y-1">
                            <Label className="text-[10px] uppercase font-black text-slate-400">Nombre del Área / Sector</Label>
                            <Input 
                              {...register(`areas.${areaIndex}.name`)} 
                              placeholder="Ej: Almacén de Granos" 
                              className="h-8 text-sm font-bold bg-white"
                            />
                          </div>
                          <div className="w-48 space-y-1">
                            <Label className="text-[10px] uppercase font-black text-slate-400">Norma Aplicable (Min Lux)</Label>
                            <select 
                              className="w-full text-xs bg-white border border-slate-200 rounded p-1 h-8 outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                              {...register(`areas.${areaIndex}.standardLux`, { valueAsNumber: true })}
                            >
                              {COVENIN_2249_STANDARDS.map(s => (
                                <option key={s.area} value={s.minLux}>{s.area} ({s.minLux} Lux)</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                           {isDiurnalNocturnal ? (
                             <>
                               <div className="text-right">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Media Diurna</p>
                                  <p className={cn("text-base font-black leading-none", avgDiurnal >= targetLux ? "text-green-600" : "text-amber-500")}>
                                    {avgDiurnal.toFixed(1)} <span className="text-[9px] opacity-70">Lux</span>
                                  </p>
                               </div>
                               <div className="text-right">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Media Nocturna</p>
                                  <p className={cn("text-base font-black leading-none", avgNocturnal >= targetLux ? "text-green-600" : "text-amber-500")}>
                                    {avgNocturnal.toFixed(1)} <span className="text-[9px] opacity-70">Lux</span>
                                  </p>
                               </div>
                             </>
                           ) : (
                             <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Media Area</p>
                                <p className={cn("text-lg font-black leading-none", isCompliant ? "text-green-600" : "text-amber-500")}>
                                  {avgDiurnal.toFixed(1)} <span className="text-[10px] opacity-70">Lux</span>
                                </p>
                             </div>
                           )}
                           <Button type="button" variant="ghost" size="icon" onClick={() => removeArea(areaIndex)} className="text-slate-300 hover:text-red-500">
                              <Trash2 size={18} />
                           </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="divide-y divide-slate-100">
                          {areaReadings.map((reading, pointIndex) => {
                            const diurnalVal = reading.illuminanceDiurnal || reading.illuminance || 0;
                            const nocturnalVal = reading.illuminanceNocturnal || 0;
                            const isDiurnalBelow = diurnalVal < targetLux;
                            const isNocturnalBelow = nocturnalVal < targetLux;
                            
                            return (
                              <div key={pointIndex} className={cn(
                                "p-4 grid gap-4 items-center bg-white hover:bg-slate-50/50 transition-colors",
                                isDiurnalNocturnal ? "grid-cols-1 md:grid-cols-5" : "grid-cols-1 md:grid-cols-4"
                              )}>
                                <div className="space-y-1">
                                  <Label className="text-[9px] font-bold text-slate-400 uppercase">Punto</Label>
                                  <Input 
                                    {...register(`areas.${areaIndex}.readings.${pointIndex}.pointName`)} 
                                    placeholder="Nombre" 
                                    className="h-8 text-xs"
                                  />
                                </div>
                                
                                {isDiurnalNocturnal ? (
                                  <>
                                    <div className="space-y-1">
                                      <Label className="text-[9px] font-bold text-slate-400 uppercase">Diurno (Lux)</Label>
                                      <div className="relative">
                                        <Input 
                                          type="number"
                                          {...register(`areas.${areaIndex}.readings.${pointIndex}.illuminanceDiurnal`, { valueAsNumber: true })} 
                                          className={cn("h-8 text-xs pr-8 font-bold", isDiurnalBelow && "border-amber-200 bg-amber-50/30")}
                                        />
                                        <div className="absolute right-2 top-1.5">
                                          {isDiurnalBelow ? <AlertCircle size={14} className="text-amber-500" /> : <CheckCircle2 size={14} className="text-green-500" />}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-[9px] font-bold text-slate-400 uppercase">Nocturno (Lux)</Label>
                                      <div className="relative">
                                        <Input 
                                          type="number"
                                          {...register(`areas.${areaIndex}.readings.${pointIndex}.illuminanceNocturnal`, { valueAsNumber: true })} 
                                          className={cn("h-8 text-xs pr-8 font-bold", isNocturnalBelow && "border-slate-200")}
                                        />
                                        <div className="absolute right-2 top-1.5">
                                          {isNocturnalBelow ? <AlertCircle size={14} className="text-amber-500" /> : <CheckCircle2 size={14} className="text-green-500" />}
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <div className="space-y-1">
                                    <Label className="text-[9px] font-bold text-slate-400 uppercase">Iluminancia (Lux)</Label>
                                    <div className="relative">
                                      <Input 
                                        type="number"
                                        {...register(`areas.${areaIndex}.readings.${pointIndex}.illuminance`, { valueAsNumber: true })} 
                                        className={cn("h-8 text-xs pr-8 font-bold", isDiurnalBelow && "border-amber-200 bg-amber-50/30")}
                                      />
                                      <div className="absolute right-2 top-1.5">
                                        {isDiurnalBelow ? <AlertCircle size={14} className="text-amber-500" /> : <CheckCircle2 size={14} className="text-green-500" />}
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                <div className="space-y-1">
                                  <Label className="text-[9px] font-bold text-slate-400 uppercase">Fuente / Lámpara</Label>
                                  <select 
                                    className="w-full h-8 px-2 text-xs bg-white border border-slate-200 rounded outline-none"
                                    {...register(`areas.${areaIndex}.readings.${pointIndex}.lampType`)}
                                  >
                                    <option value="">Tipo...</option>
                                    {VENEZUELA_INDUSTRIAL_LAMPS.map(l => (
                                      <option key={l.name} value={l.name}>{l.name}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="flex gap-2 pt-4">
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm"
                                    className={cn("flex-1 h-8 text-[9px] font-bold", reading.latitude !== 0 && "bg-green-50 text-green-700 border-green-200")}
                                    onClick={() => captureGPSPoint(areaIndex, pointIndex)}
                                  >
                                    <MapPin size={12} className="mr-1" /> GPS
                                  </Button>
                                  {!reading.photo ? (
                                    <div className="relative flex-1">
                                      <Button type="button" variant="outline" size="sm" className="w-full h-8 text-[9px] font-bold uppercase">
                                        <Camera size={12} className="mr-1" /> Foto
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
                                    <div className="flex gap-1 items-center flex-1 bg-slate-50 rounded border border-slate-200 p-0.5 overflow-hidden">
                                       <div 
                                         className="relative w-7 h-7 rounded overflow-hidden cursor-pointer group flex-shrink-0"
                                         onClick={() => setPreviewImage(reading.photo)}
                                       >
                                         <img src={reading.photo} className="w-full h-full object-cover" />
                                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                           <Eye size={10} className="text-white" />
                                         </div>
                                       </div>
                                       <p className="text-[8px] font-bold text-slate-500 truncate flex-1 uppercase px-1">IMG_{pointIndex+1}</p>
                                       <Button 
                                         type="button" 
                                         variant="ghost" 
                                         size="icon" 
                                         className="h-6 w-6 text-slate-300 hover:text-red-500"
                                         onClick={() => setValue(`areas.${areaIndex}.readings.${pointIndex}.photo` as any, null)}
                                       >
                                         <X size={12} />
                                       </Button>
                                    </div>
                                  )}
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => {
                                       const current = watch(`areas.${areaIndex}.readings`);
                                       setValue(`areas.${areaIndex}.readings`, current.filter((_, i) => i !== pointIndex));
                                    }}
                                    className="h-8 w-8 text-slate-300 hover:text-red-500"
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="p-3 bg-slate-50/30 flex justify-center">
                           <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-600 hover:bg-blue-50 text-[10px] font-bold uppercase"
                            onClick={() => {
                               const current = watch(`areas.${areaIndex}.readings`);
                               setValue(`areas.${areaIndex}.readings`, [...current, { pointName: `Punto ${current.length + 1}`, illuminance: 0, illuminanceDiurnal: 0, illuminanceNocturnal: 0, lightType: 'artificial', latitude: 0, longitude: 0 }]);
                            }}
                           >
                             <Plus className="mr-1 h-3 w-3" /> Añadir Punto en {watch(`areas.${areaIndex}.name`) || 'Área'}
                           </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>

            <Card className="border-slate-200">
               <CardHeader className="py-4">
                  <CardTitle className="text-sm">Análisis Final del Especialista</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-slate-400">Conclusiones del Estudio</Label>
                       <textarea 
                        {...register('conclusions')}
                        placeholder="Determine si el centro de trabajo cumple globalmente..."
                        className="w-full h-32 p-3 text-xs bg-white border border-slate-200 rounded-lg resize-none outline-none focus:ring-2 focus:ring-blue-500"
                       />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-slate-400">Recomendaciones Técnicas</Label>
                       <textarea 
                        {...register('recommendations')}
                        placeholder="Sugerencias de mejora (Luminarias LED, limpieza, etc)..."
                        className="w-full h-32 p-3 text-xs bg-white border border-slate-200 rounded-lg resize-none outline-none focus:ring-2 focus:ring-blue-500"
                       />
                    </div>
                  </div>
               </CardContent>
            </Card>

            <div className="pt-8 flex items-center justify-between border-t border-slate-200">
              <Button type="button" variant="ghost" onClick={() => setStep(1)} disabled={isSaving}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
              </Button>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" /> Guardar Borrador
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/10" disabled={isSaving}>
                  {isSaving ? 'Guardando...' : <><CheckCircle2 className="mr-2 h-4 w-4" /> Finalizar y Emitir</>}
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && savedData && (
          <div className="text-center py-12 space-y-8 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <CheckCircle2 size={48} />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900">{t('study.success.title')}</h2>
              <p className="text-slate-500 mt-2">{t('study.success.desc')}</p>
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
                   <Card key={idx} className="border-slate-200 overflow-hidden shadow-sm">
                     <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between py-3">
                       <div className="text-left">
                         <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-700">{area.name || 'Sin Nombre'}</CardTitle>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                            {savedData.samplingType === 'diurnal_nocturnal' ? (
                              <>D: {avgDiurnal.toFixed(1)} Lux | N: {avgNocturnal.toFixed(1)} Lux</>
                            ) : (
                              <>Promedio: {avgDiurnal.toFixed(1)} Lux</>
                            )}
                            {' '}vs Ref: {area.standardLux} Lux
                          </p>
                       </div>
                       <div className={cn(
                         "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                         isCompliant ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                       )}>
                         {isCompliant ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                         {isCompliant ? 'Cumple' : 'No Conforme'}
                       </div>
                     </CardHeader>
                     <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <table className="w-full text-[11px] text-left">
                             <thead>
                               <tr className="border-b bg-slate-50/30 text-[9px] uppercase font-black text-slate-400">
                                 <th className="px-4 py-2">Punto</th>
                                  {savedData.samplingType === 'diurnal_nocturnal' ? (
                                    <>
                                      <th className="px-4 py-2 text-right">Diurno</th>
                                      <th className="px-4 py-2 text-right">Nocturno</th>
                                    </>
                                  ) : (
                                    <th className="px-4 py-2 text-right">Medición</th>
                                  )}
                                 <th className="px-4 py-2 text-center">Estado</th>
                               </tr>
                             </thead>
                            <tbody className="divide-y divide-slate-50">
                              {area.readings.map((r, i) => {
                                const dVal = r.illuminanceDiurnal || r.illuminance || 0;
                                const nVal = r.illuminanceNocturnal || 0;
                                const pointCompliant = isDiurnalNocturnal 
                                  ? (dVal >= area.standardLux && nVal >= area.standardLux)
                                  : dVal >= area.standardLux;

                                return (
                                  <tr key={i}>
                                    <td className="px-4 py-2 font-medium">{r.pointName}</td>
                                    {isDiurnalNocturnal ? (
                                      <>
                                        <td className="px-4 py-2 text-right font-black">{dVal} Lux</td>
                                        <td className="px-4 py-2 text-right font-black">{nVal} Lux</td>
                                      </>
                                    ) : (
                                      <td className="px-4 py-2 text-right font-black">{dVal} <span className="opacity-50 font-normal">Lux</span></td>
                                    )}
                                    <td className="px-4 py-2 text-center">
                                      {pointCompliant ? <CheckCircle2 size={10} className="text-green-500 inline" /> : <AlertTriangle size={10} className="text-amber-500 inline" />}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                     </CardContent>
                   </Card>
                 );
               })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
              <Button type="button" onClick={handleEditAgain} size="lg" variant="outline" className="h-24 flex-col gap-2 border-slate-200">
                <Plus size={24} />
                <span>Editar Estudio</span>
              </Button>
              <Button onClick={handleDownloadPDF} size="lg" className="h-24 flex-col gap-2 bg-blue-600 hover:bg-blue-700">
                <Download size={24} />
                <span>{t('study.success.pdf')}</span>
              </Button>
              <Button onClick={handleShareWhatsApp} size="lg" className="h-24 flex-col gap-2 bg-green-500 hover:bg-green-600">
                <Share2 size={24} />
                <span>{t('study.success.whatsapp')}</span>
              </Button>
            </div>
            
            <Button variant="ghost" onClick={() => {
              setStep(1);
              setSavedData(null);
            }} className="text-slate-400">
              {t('study.success.again')}
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
                className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full"
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
