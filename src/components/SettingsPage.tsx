import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/AppContext';
import { Building2, UserCog, Save, Globe, Palette, Plus, Trash2, CheckCircle2, Pencil, X } from 'lucide-react';
import { toast } from 'sonner';
import { CompanyInfo, Technician } from '@/types';

export default function SettingsPage() {
  const { settings, updateSettings, setTheme, setLanguage, t } = useApp();
  const [newContractor, setNewContractor] = useState<Partial<CompanyInfo>>({ name: '', id: '', address: '', technicians: [] });
  const [newClient, setNewClient] = useState<Partial<CompanyInfo>>({ name: '', id: '', address: '', technicians: [] });
  const [techEntry, setTechEntry] = useState<Technician>({ name: '', id: '', role: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<'contractors' | 'clients' | null>(null);

  const startEdit = (type: 'contractors' | 'clients', entity: CompanyInfo) => {
    setEditingId(entity.id);
    setEditingType(type);
    if (type === 'contractors') {
      setNewContractor({ ...entity });
    } else {
      setNewClient({ ...entity });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingType(null);
    setNewContractor({ name: '', id: '', address: '', phone: '', email: '', contactPerson: '', technicians: [] });
    setNewClient({ name: '', id: '', address: '', phone: '', email: '', contactPerson: '', technicians: [] });
  };

  const addTechToEntity = (type: 'contractors' | 'clients') => {
    if (!techEntry.name || !techEntry.role) {
      toast.error('Nombre y Cargo son requeridos');
      return;
    }
    if (type === 'contractors') {
      setNewContractor({
        ...newContractor,
        technicians: [...(newContractor.technicians || []), { ...techEntry }]
      });
    } else {
      setNewClient({
        ...newClient,
        technicians: [...(newClient.technicians || []), { ...techEntry }]
      });
    }
    setTechEntry({ name: '', id: '', role: '' });
  };

  const removeTechFromEntity = (type: 'contractors' | 'clients', index: number) => {
    if (type === 'contractors') {
      const updated = [...(newContractor.technicians || [])];
      updated.splice(index, 1);
      setNewContractor({ ...newContractor, technicians: updated });
    } else {
      const updated = [...(newClient.technicians || [])];
      updated.splice(index, 1);
      setNewClient({ ...newClient, technicians: updated });
    }
  };

  const addEntity = (type: 'contractors' | 'clients') => {
    const info = type === 'contractors' ? newContractor : newClient;
    if (!info.name || !info.id) {
      toast.error('Nombre y RIF son requeridos');
      return;
    }
    
    const currentList = settings[type];
    let updated;

    if (editingId && editingType === type) {
      // Update existing
      updated = currentList.map(item => item.id === editingId ? { ...item, ...info as CompanyInfo } : item);
      toast.success('Entidad actualizada correctamente');
    } else {
      // Add new
      updated = [...currentList, { ...info as CompanyInfo }];
      toast.success('Entidad agregada correctamente');
    }
    
    updateSettings({ [type]: updated });
    cancelEdit();
  };

  const removeEntity = (type: 'contractors' | 'clients', id: string) => {
    const updated = settings[type].filter(c => c.id !== id);
    if (updated.length === 0) {
      toast.error('Debe haber al menos una entidad registrada en esta categoría');
      return;
    }
    
    const activeIdKey = type === 'contractors' ? 'activeContractorId' : 'activeClientId';
    const activeId = settings[activeIdKey as 'activeContractorId' | 'activeClientId'];
    
    const newActiveId = activeId === id ? updated[0].id : activeId;
    
    updateSettings({ 
      [type]: updated,
      [activeIdKey]: newActiveId
    });
    
    toast.success('Entidad removida');
  };

  const selectActive = (type: 'activeContractorId' | 'activeClientId', id: string) => {
    updateSettings({ [type]: id });
    const name = type === 'activeContractorId' 
      ? settings.contractors.find(c => c.id === id)?.name 
      : settings.clients.find(c => c.id === id)?.name;
    toast.success(`Activo: ${name}`);
  };

  return (
    <div className="space-y-8" id="settings-root">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('nav.settings')}</h1>
        <p className="text-slate-500 italic">Configure prestadores de servicio (Contratistas) y contratantes (Clientes).</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Contractors List */}
        <Card className="shadow-sm border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between bg-blue-50/50">
            <div className="flex items-center gap-2">
              <UserCog className="text-blue-600" />
              <CardTitle>{t('settings.contractors')}</CardTitle>
            </div>
            <Badge variant="outline" className="bg-blue-100 text-blue-700 font-bold border-blue-200">PRESTADORES</Badge>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-6 mb-6 p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="space-y-1">
                   <Label className="text-[10px] uppercase font-black opacity-50">Nombre / Contratista</Label>
                   <Input 
                     placeholder="Ej: KATET INGENIERÍA" 
                     value={newContractor.name} 
                     onChange={e => setNewContractor({...newContractor, name: e.target.value})}
                     className="bg-white"
                   />
                 </div>
                 <div className="space-y-1">
                   <Label className="text-[10px] uppercase font-black opacity-50">RIF</Label>
                   <Input 
                     placeholder="J-00000000-0" 
                     value={newContractor.id} 
                     onChange={e => setNewContractor({...newContractor, id: e.target.value})}
                     className="bg-white"
                   />
                 </div>
                 <div className="space-y-1">
                   <Label className="text-[10px] uppercase font-black opacity-50">Localización / Dirección</Label>
                   <Input 
                     placeholder="Sede Principal" 
                     value={newContractor.address} 
                     onChange={e => setNewContractor({...newContractor, address: e.target.value})}
                     className="bg-white"
                   />
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                 <div className="space-y-1">
                   <Label className="text-[10px] uppercase font-black opacity-50">Teléfono</Label>
                   <Input 
                     placeholder="Ej: 0412-0000000" 
                     value={newContractor.phone} 
                     onChange={e => setNewContractor({...newContractor, phone: e.target.value})}
                     className="bg-white"
                   />
                 </div>
                 <div className="space-y-1">
                   <Label className="text-[10px] uppercase font-black opacity-50">Correo Electrónico</Label>
                   <Input 
                     placeholder="email@proveedor.com" 
                     value={newContractor.email} 
                     onChange={e => setNewContractor({...newContractor, email: e.target.value})}
                     className="bg-white"
                   />
                 </div>
                 <div className="space-y-1">
                   <Label className="text-[10px] uppercase font-black opacity-50">Persona de Contacto</Label>
                   <Input 
                     placeholder="Nombre del Enlace" 
                     value={newContractor.contactPerson} 
                     onChange={e => setNewContractor({...newContractor, contactPerson: e.target.value})}
                     className="bg-white"
                   />
                 </div>
               </div>

               <div className="space-y-3">
                  <Label className="text-[10px] uppercase font-black opacity-50">Personal / Técnicos Responsables</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                     {newContractor.technicians?.map((t, idx) => (
                       <Badge key={idx} variant="secondary" className="flex items-center gap-1 py-1 px-2">
                         {t.name} ({t.role})
                         <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => removeTechFromEntity('contractors', idx)} />
                       </Badge>
                     ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                     <Input placeholder="Nombre" value={techEntry.name} onChange={e => setTechEntry({...techEntry, name: e.target.value})} className="h-8 text-xs bg-white" />
                     <Input placeholder="Cargo" value={techEntry.role} onChange={e => setTechEntry({...techEntry, role: e.target.value})} className="h-8 text-xs bg-white" />
                     <Input placeholder="ID/Cédula" value={techEntry.id} onChange={e => setTechEntry({...techEntry, id: e.target.value})} className="h-8 text-xs bg-white" />
                     <Button type="button" variant="outline" size="sm" onClick={() => addTechToEntity('contractors')} className="h-8 text-[10px]">AÑADIR PERSONAL</Button>
                  </div>
               </div>

               <div className="flex items-center gap-2 pt-2 border-t">
                 <Button onClick={() => addEntity('contractors')} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    {editingId && editingType === 'contractors' ? (
                      <><Save className="mr-1 h-4 w-4" /> Guardar Cambios</>
                    ) : (
                      <><Plus className="mr-1 h-4 w-4" /> Registrar Prestador</>
                    )}
                 </Button>
                 {editingId && editingType === 'contractors' && (
                   <Button variant="outline" onClick={cancelEdit}>Cancelar</Button>
                 )}
               </div>
            </div>

            <div className="space-y-2">
               {settings.contractors.map((c) => (
                 <div key={c.id} className={`flex items-center justify-between p-4 rounded-lg border transition-all ${settings.activeContractorId === c.id ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' : 'bg-white border-slate-100'}`}>
                    <div className="flex items-center gap-4">
                       <Building2 size={20} className={settings.activeContractorId === c.id ? 'text-blue-600' : 'text-slate-300'} />
                       <div>
                          <p className="font-bold text-slate-900 leading-tight">{c.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{c.id} • {c.address}</p>
                          {(c.phone || c.email) && (
                            <p className="text-[10px] text-blue-600 font-medium mt-1 uppercase">
                              {c.phone} {c.phone && c.email && '•'} {c.email}
                            </p>
                          )}
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       {settings.activeContractorId === c.id ? (
                         <Badge className="bg-blue-600 text-white border-none">PREDETERMINADO</Badge>
                       ) : (
                         <Button variant="outline" size="sm" onClick={() => selectActive('activeContractorId', c.id)} className="text-[10px] h-7">SELECCIONAR</Button>
                       )}
                       <Button variant="ghost" size="icon" onClick={() => startEdit('contractors', c)} className="text-slate-300 hover:text-blue-500"><Pencil size={16} /></Button>
                       <Button variant="ghost" size="icon" onClick={() => removeEntity('contractors', c.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></Button>
                    </div>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>

        {/* Clients List */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Building2 className="text-slate-900" />
              <CardTitle>{t('settings.clients')}</CardTitle>
            </div>
            <Badge variant="outline" className="bg-slate-200 text-slate-700 font-bold border-slate-300">CONTRATANTES</Badge>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-6 mb-6 p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="space-y-1">
                   <Label className="text-[10px] uppercase font-black opacity-50">Nombre Empresa</Label>
                   <Input 
                     placeholder="Ej: PLANTA CHIVACOA" 
                     value={newClient.name} 
                     onChange={e => setNewClient({...newClient, name: e.target.value})}
                     className="bg-white"
                   />
                 </div>
                 <div className="space-y-1">
                   <Label className="text-[10px] uppercase font-black opacity-50">RIF</Label>
                   <Input 
                     placeholder="J-00000000-0" 
                     value={newClient.id} 
                     onChange={e => setNewClient({...newClient, id: e.target.value})}
                     className="bg-white"
                   />
                 </div>
                 <div className="space-y-1">
                   <Label className="text-[10px] uppercase font-black opacity-50">Localización / Dirección</Label>
                   <Input 
                     placeholder="Localidad" 
                     value={newClient.address} 
                     onChange={e => setNewClient({...newClient, address: e.target.value})}
                     className="bg-white"
                   />
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                 <div className="space-y-1">
                   <Label className="text-[10px] uppercase font-black opacity-50">Teléfono</Label>
                   <Input 
                     placeholder="Ej: 0424-0000000" 
                     value={newClient.phone} 
                     onChange={e => setNewClient({...newClient, phone: e.target.value})}
                     className="bg-white"
                   />
                 </div>
                 <div className="space-y-1">
                   <Label className="text-[10px] uppercase font-black opacity-50">Correo Electrónico</Label>
                   <Input 
                     placeholder="contacto@cliente.com" 
                     value={newClient.email} 
                     onChange={e => setNewClient({...newClient, email: e.target.value})}
                     className="bg-white"
                   />
                 </div>
                 <div className="space-y-1">
                   <Label className="text-[10px] uppercase font-black opacity-50">Persona de Contacto</Label>
                   <Input 
                     placeholder="Responsable Administrativo" 
                     value={newClient.contactPerson} 
                     onChange={e => setNewClient({...newClient, contactPerson: e.target.value})}
                     className="bg-white"
                   />
                 </div>
               </div>

               <div className="space-y-3">
                  <Label className="text-[10px] uppercase font-black opacity-50">Representantes Autorizados</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                     {newClient.technicians?.map((t, idx) => (
                       <Badge key={idx} variant="secondary" className="flex items-center gap-1 py-1 px-2">
                         {t.name} ({t.role})
                         <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => removeTechFromEntity('clients', idx)} />
                       </Badge>
                     ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                     <Input placeholder="Nombre" value={techEntry.name} onChange={e => setTechEntry({...techEntry, name: e.target.value})} className="h-8 text-xs bg-white" />
                     <Input placeholder="Cargo / Área" value={techEntry.role} onChange={e => setTechEntry({...techEntry, role: e.target.value})} className="h-8 text-xs bg-white" />
                     <Input placeholder="ID" value={techEntry.id} onChange={e => setTechEntry({...techEntry, id: e.target.value})} className="h-8 text-xs bg-white" />
                     <Button type="button" variant="outline" size="sm" onClick={() => addTechToEntity('clients')} className="h-8 text-[10px]">AÑADIR REPRESENTANTE</Button>
                  </div>
               </div>

               <div className="flex items-center gap-2 pt-2 border-t">
                 <Button onClick={() => addEntity('clients')} className="flex-1 bg-slate-900 hover:bg-slate-800">
                    {editingId && editingType === 'clients' ? (
                      <><Save className="mr-1 h-4 w-4" /> Guardar Cambios</>
                    ) : (
                      <><Plus className="mr-1 h-4 w-4" /> Registrar Cliente</>
                    )}
                 </Button>
                 {editingId && editingType === 'clients' && (
                   <Button variant="outline" onClick={cancelEdit}>Cancelar</Button>
                 )}
               </div>
            </div>

            <div className="space-y-2">
               {settings.clients.map((c) => (
                 <div key={c.id} className={`flex items-center justify-between p-4 rounded-lg border transition-all ${settings.activeClientId === c.id ? 'bg-slate-50 border-slate-400 ring-1 ring-slate-100' : 'bg-white border-slate-100'}`}>
                    <div className="flex items-center gap-4">
                       <Building2 size={20} className={settings.activeClientId === c.id ? 'text-slate-900' : 'text-slate-300'} />
                       <div>
                          <p className="font-bold text-slate-900 leading-tight">{c.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{c.id} • {c.address}</p>
                          {(c.phone || c.email) && (
                            <p className="text-[10px] text-slate-600 font-medium mt-1 uppercase">
                              {c.phone} {c.phone && c.email && '•'} {c.email}
                            </p>
                          )}
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       {settings.activeClientId === c.id ? (
                         <Badge className="bg-slate-900 text-white border-none">ACTIVO</Badge>
                       ) : (
                         <Button variant="outline" size="sm" onClick={() => selectActive('activeClientId', c.id)} className="text-[10px] h-7">SELECCIONAR</Button>
                       )}
                       <Button variant="ghost" size="icon" onClick={() => startEdit('clients', c)} className="text-slate-300 hover:text-blue-500"><Pencil size={16} /></Button>
                       <Button variant="ghost" size="icon" onClick={() => removeEntity('clients', c.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></Button>
                    </div>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>

        {/* App Appearance */}
        <Card className="max-w-md">
          <CardHeader className="flex flex-row items-center gap-2">
            <Palette className="text-blue-600" />
            <CardTitle>Regionalización</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="flex items-center gap-2"><Globe size={14} /> Idioma del Sistema</Label>
              <div className="flex gap-2">
                 <Button variant={settings.language === 'es' ? 'default' : 'outline'} onClick={() => setLanguage('es')} className="flex-1 text-xs">Español</Button>
                 <Button variant={settings.language === 'en' ? 'default' : 'outline'} onClick={() => setLanguage('en')} className="flex-1 text-xs">English</Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs">Tema Visual</Label>
              <div className="grid grid-cols-3 gap-2">
                 <Button variant={settings.theme === 'light' ? 'default' : 'outline'} onClick={() => setTheme('light')} className="text-[10px]">CLARO</Button>
                 <Button variant={settings.theme === 'medium' ? 'default' : 'outline'} onClick={() => setTheme('medium')} className="text-[10px]">MEDIO</Button>
                 <Button variant={settings.theme === 'dark' ? 'default' : 'outline'} onClick={() => setTheme('dark')} className="text-[10px]">OSCURO</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
