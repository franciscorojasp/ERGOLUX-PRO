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
    <div className="space-y-10 animate-in fade-in duration-500" id="settings-root">
      <div>
        <h1 className="text-4xl font-black text-foreground tracking-tight text-gradient">{t('nav.settings')}</h1>
        <p className="text-primary/50 font-black uppercase tracking-[0.3em] text-[10px] mt-2 italic">Gestión de Prestadores de Servicio y Entidades Contratantes</p>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {/* Contractors List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)] transition-all">
                <UserCog size={20} />
              </div>
              <h2 className="text-lg font-black text-foreground uppercase tracking-widest">{t('settings.contractors')}</h2>
            </div>
            <div className="px-3 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-primary/20">
              Prestadores de Servicio
            </div>
          </div>

          <Card className="glass-card border-none overflow-hidden">
            <CardContent className="p-8 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black text-foreground/40 tracking-widest">Nombre / Contratista</Label>
                  <Input 
                    placeholder="Ej: KATET INGENIERÍA" 
                    value={newContractor.name} 
                    onChange={e => setNewContractor({...newContractor, name: e.target.value})}
                    className="h-12 bg-foreground/5 border-border text-foreground rounded-2xl focus:border-cyan-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black text-foreground/40 tracking-widest">RIF</Label>
                  <Input 
                    placeholder="J-00000000-0" 
                    value={newContractor.id} 
                    onChange={e => setNewContractor({...newContractor, id: e.target.value})}
                    className="h-12 bg-foreground/5 border-border text-foreground rounded-2xl focus:border-cyan-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black text-foreground/40 tracking-widest">Dirección</Label>
                  <Input 
                    placeholder="Sede Principal" 
                    value={newContractor.address} 
                    onChange={e => setNewContractor({...newContractor, address: e.target.value})}
                    className="h-12 bg-foreground/5 border-border text-foreground rounded-2xl focus:border-cyan-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 border-t border-border">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black text-foreground/40 tracking-widest">Teléfono</Label>
                  <Input 
                    placeholder="Ej: 0412-0000000" 
                    value={newContractor.phone} 
                    onChange={e => setNewContractor({...newContractor, phone: e.target.value})}
                    className="h-12 bg-foreground/5 border-border text-foreground rounded-2xl focus:border-cyan-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black text-foreground/40 tracking-widest">Correo Electrónico</Label>
                  <Input 
                    placeholder="email@proveedor.com" 
                    value={newContractor.email} 
                    onChange={e => setNewContractor({...newContractor, email: e.target.value})}
                    className="h-12 bg-foreground/5 border-border text-foreground rounded-2xl focus:border-cyan-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black text-foreground/40 tracking-widest">Contacto</Label>
                  <Input 
                    placeholder="Nombre del Enlace" 
                    value={newContractor.contactPerson} 
                    onChange={e => setNewContractor({...newContractor, contactPerson: e.target.value})}
                    className="h-12 bg-foreground/5 border-border text-foreground rounded-2xl focus:border-cyan-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <Label className="text-[10px] uppercase font-black text-foreground/40 tracking-widest">Personal / Técnicos Responsables</Label>
                <div className="flex flex-wrap gap-2">
                  {newContractor.technicians?.map((t, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-foreground/5 hover:bg-foreground/10 text-foreground border-border px-3 py-1.5 rounded-xl gap-2 transition-all">
                      <span className="font-black text-primary">{t.name}</span>
                      <span className="text-foreground/40 text-[9px] uppercase tracking-tighter">{t.role}</span>
                      <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => removeTechFromEntity('contractors', idx)} />
                    </Badge>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Input placeholder="Nombre" value={techEntry.name} onChange={e => setTechEntry({...techEntry, name: e.target.value})} className="h-10 bg-foreground/5 border-border text-foreground text-xs rounded-xl" />
                  <Input placeholder="Cargo" value={techEntry.role} onChange={e => setTechEntry({...techEntry, role: e.target.value})} className="h-10 bg-foreground/5 border-border text-foreground text-xs rounded-xl" />
                  <Input placeholder="ID/Cédula" value={techEntry.id} onChange={e => setTechEntry({...techEntry, id: e.target.value})} className="h-10 bg-foreground/5 border-border text-foreground text-xs rounded-xl" />
                  <Button type="button" variant="outline" size="sm" onClick={() => addTechToEntity('contractors')} className="h-10 border-primary/30 text-primary font-black uppercase text-[9px] tracking-widest hover:bg-primary/10 rounded-xl">AÑADIR PERSONAL</Button>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-6 border-t border-border">
                <Button onClick={() => addEntity('contractors')} className="h-14 flex-1 bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-[11px] hover:bg-primary/80 hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] transition-all duration-300 rounded-2xl group">
                  {editingId && editingType === 'contractors' ? (
                    <><Save className="mr-2 h-4 w-4" /> Guardar Cambios</>
                  ) : (
                    <><Plus className="mr-2 h-4 w-4" /> Registrar Prestador</>
                  )}
                </Button>
                {editingId && editingType === 'contractors' && (
                  <Button variant="outline" onClick={cancelEdit} className="h-14 w-40 bg-transparent border-border text-foreground font-black uppercase tracking-widest text-[10px] hover:bg-foreground/5 rounded-2xl">Cancelar</Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settings.contractors.map((c) => (
              <div key={c.id} className={`group relative p-6 rounded-3xl border transition-all duration-500 ${settings.activeContractorId === c.id ? 'bg-primary/10 border-primary/50 shadow-[0_0_40px_rgba(var(--primary-rgb),0.15)]' : 'bg-foreground/5 border-border hover:border-border'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${settings.activeContractorId === c.id ? 'bg-primary text-primary-foreground' : 'bg-foreground/5 text-foreground/30'}`}>
                      <Building2 size={24} />
                    </div>
                    <div>
                      <p className="font-black text-foreground text-lg uppercase tracking-tight leading-tight">{c.name}</p>
                      <p className="text-[10px] text-foreground/40 font-black uppercase tracking-widest mt-1">{c.id} • {c.address}</p>
                      {(c.phone || c.email) && (
                        <div className="flex gap-4 mt-3">
                          {c.phone && <span className="text-[10px] text-primary font-black uppercase tracking-tighter">{c.phone}</span>}
                          {c.email && <span className="text-[10px] text-primary/60 font-black uppercase tracking-tighter">{c.email}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {settings.activeContractorId === c.id ? (
                      <div className="px-3 py-1 bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">PREDETERMINADO</div>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => selectActive('activeContractorId', c.id)} className="text-[9px] font-black uppercase tracking-widest h-8 px-4 text-foreground/40 hover:text-primary hover:bg-primary/10 rounded-xl">SELECCIONAR</Button>
                    )}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => startEdit('contractors', c)} className="w-8 h-8 rounded-lg bg-foreground/5 text-foreground/40 hover:text-primary hover:bg-foreground/10"><Pencil size={14} /></Button>
                      <Button variant="ghost" size="icon" onClick={() => removeEntity('contractors', c.id)} className="w-8 h-8 rounded-lg bg-foreground/5 text-foreground/40 hover:text-destructive hover:bg-red-500/10"><Trash2 size={14} /></Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clients List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)] transition-all">
                <Building2 size={20} />
              </div>
              <h2 className="text-lg font-black text-foreground uppercase tracking-widest">{t('settings.clients')}</h2>
            </div>
            <div className="px-3 py-1 bg-accent/10 text-accent text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-accent/20">
              Entidades Contratantes
            </div>
          </div>

          <Card className="glass-card border-none overflow-hidden">
            <CardContent className="p-8 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black text-foreground/40 tracking-widest">Nombre Empresa</Label>
                  <Input 
                    placeholder="Ej: PLANTA CHIVACOA" 
                    value={newClient.name} 
                    onChange={e => setNewClient({...newClient, name: e.target.value})}
                    className="h-12 bg-foreground/5 border-border text-foreground rounded-2xl focus:border-purple-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black text-foreground/40 tracking-widest">RIF</Label>
                  <Input 
                    placeholder="J-00000000-0" 
                    value={newClient.id} 
                    onChange={e => setNewClient({...newClient, id: e.target.value})}
                    className="h-12 bg-foreground/5 border-border text-foreground rounded-2xl focus:border-purple-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black text-foreground/40 tracking-widest">Dirección</Label>
                  <Input 
                    placeholder="Localidad" 
                    value={newClient.address} 
                    onChange={e => setNewClient({...newClient, address: e.target.value})}
                    className="h-12 bg-foreground/5 border-border text-foreground rounded-2xl focus:border-purple-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 border-t border-border">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black text-foreground/40 tracking-widest">Teléfono</Label>
                  <Input 
                    placeholder="Ej: 0424-0000000" 
                    value={newClient.phone} 
                    onChange={e => setNewClient({...newClient, phone: e.target.value})}
                    className="h-12 bg-foreground/5 border-border text-foreground rounded-2xl focus:border-purple-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black text-foreground/40 tracking-widest">Correo Electrónico</Label>
                  <Input 
                    placeholder="contacto@cliente.com" 
                    value={newClient.email} 
                    onChange={e => setNewClient({...newClient, email: e.target.value})}
                    className="h-12 bg-foreground/5 border-border text-foreground rounded-2xl focus:border-purple-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black text-foreground/40 tracking-widest">Contacto</Label>
                  <Input 
                    placeholder="Responsable Administrativo" 
                    value={newClient.contactPerson} 
                    onChange={e => setNewClient({...newClient, contactPerson: e.target.value})}
                    className="h-12 bg-foreground/5 border-border text-foreground rounded-2xl focus:border-purple-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <Label className="text-[10px] uppercase font-black text-foreground/40 tracking-widest">Representantes Autorizados</Label>
                <div className="flex flex-wrap gap-2">
                  {newClient.technicians?.map((t, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-foreground/5 hover:bg-foreground/10 text-foreground border-border px-3 py-1.5 rounded-xl gap-2 transition-all">
                      <span className="font-black text-accent">{t.name}</span>
                      <span className="text-foreground/40 text-[9px] uppercase tracking-tighter">{t.role}</span>
                      <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => removeTechFromEntity('clients', idx)} />
                    </Badge>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Input placeholder="Nombre" value={techEntry.name} onChange={e => setTechEntry({...techEntry, name: e.target.value})} className="h-10 bg-foreground/5 border-border text-foreground text-xs rounded-xl" />
                  <Input placeholder="Cargo" value={techEntry.role} onChange={e => setTechEntry({...techEntry, role: e.target.value})} className="h-10 bg-foreground/5 border-border text-foreground text-xs rounded-xl" />
                  <Input placeholder="ID" value={techEntry.id} onChange={e => setTechEntry({...techEntry, id: e.target.value})} className="h-10 bg-foreground/5 border-border text-foreground text-xs rounded-xl" />
                  <Button type="button" variant="outline" size="sm" onClick={() => addTechToEntity('clients')} className="h-10 border-accent/30 text-accent font-black uppercase text-[9px] tracking-widest hover:bg-accent/10 rounded-xl">AÑADIR REPRESENTANTE</Button>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-6 border-t border-border">
                <Button onClick={() => addEntity('clients')} className="h-14 flex-1 bg-accent text-accent-foreground font-black uppercase tracking-[0.2em] text-[11px] hover:bg-accent/80 hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] transition-all duration-300 rounded-2xl group">
                  {editingId && editingType === 'clients' ? (
                    <><Save className="mr-2 h-4 w-4" /> Guardar Cambios</>
                  ) : (
                    <><Plus className="mr-2 h-4 w-4" /> Registrar Cliente</>
                  )}
                </Button>
                {editingId && editingType === 'clients' && (
                  <Button variant="outline" onClick={cancelEdit} className="h-14 w-40 bg-transparent border-border text-foreground font-black uppercase tracking-widest text-[10px] hover:bg-foreground/5 rounded-2xl">Cancelar</Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settings.clients.map((c) => (
              <div key={c.id} className={`group relative p-6 rounded-3xl border transition-all duration-500 ${settings.activeClientId === c.id ? 'bg-accent/10 border-accent/50 shadow-[0_0_40px_rgba(var(--primary-rgb),0.15)]' : 'bg-foreground/5 border-border hover:border-border'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${settings.activeClientId === c.id ? 'bg-accent text-accent-foreground' : 'bg-foreground/5 text-foreground/30'}`}>
                      <Building2 size={24} />
                    </div>
                    <div>
                      <p className="font-black text-foreground text-lg uppercase tracking-tight leading-tight">{c.name}</p>
                      <p className="text-[10px] text-foreground/40 font-black uppercase tracking-widest mt-1">{c.id} • {c.address}</p>
                      {(c.phone || c.email) && (
                        <div className="flex gap-4 mt-3">
                          {c.phone && <span className="text-[10px] text-accent font-black uppercase tracking-tighter">{c.phone}</span>}
                          {c.email && <span className="text-[10px] text-accent/60 font-black uppercase tracking-tighter">{c.email}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {settings.activeClientId === c.id ? (
                      <div className="px-3 py-1 bg-accent text-accent-foreground text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">ACTIVO</div>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => selectActive('activeClientId', c.id)} className="text-[9px] font-black uppercase tracking-widest h-8 px-4 text-foreground/40 hover:text-accent hover:bg-accent/10 rounded-xl">SELECCIONAR</Button>
                    )}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => startEdit('clients', c)} className="w-8 h-8 rounded-lg bg-foreground/5 text-foreground/40 hover:text-accent hover:bg-foreground/10"><Pencil size={14} /></Button>
                      <Button variant="ghost" size="icon" onClick={() => removeEntity('clients', c.id)} className="w-8 h-8 rounded-lg bg-foreground/5 text-foreground/40 hover:text-destructive hover:bg-red-500/10"><Trash2 size={14} /></Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regionalization */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all">
              <Globe size={20} />
            </div>
            <h2 className="text-lg font-black text-foreground uppercase tracking-widest">Regionalización y Apariencia</h2>
          </div>

          <Card className="glass-card border-none overflow-hidden max-w-2xl">
            <CardContent className="p-8 space-y-10">
              <div className="space-y-4">
                <Label className="text-[10px] uppercase font-black text-foreground/40 tracking-widest flex items-center gap-2">
                  <Globe size={12} /> Idioma del Sistema
                </Label>
                <div className="flex gap-4">
                   <Button 
                    variant={settings.language === 'es' ? 'default' : 'outline'} 
                    onClick={() => setLanguage('es')} 
                    className={`h-12 flex-1 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${settings.language === 'es' ? 'bg-primary text-primary-foreground shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]' : 'bg-transparent border-border text-foreground/40 hover:bg-foreground/5'}`}
                   >
                     Español
                   </Button>
                   <Button 
                    variant={settings.language === 'en' ? 'default' : 'outline'} 
                    onClick={() => setLanguage('en')} 
                    className={`h-12 flex-1 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${settings.language === 'en' ? 'bg-primary text-primary-foreground shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]' : 'bg-transparent border-border text-foreground/40 hover:bg-foreground/5'}`}
                   >
                     English
                   </Button>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] uppercase font-black text-foreground/40 tracking-widest flex items-center gap-2">
                  <Palette size={12} /> Tema Visual
                </Label>
                <div className="grid grid-cols-3 gap-4">
                   {['light', 'medium', 'dark'].map((t) => (
                     <Button 
                      key={t}
                      variant={settings.theme === t ? 'default' : 'outline'} 
                      onClick={() => setTheme(t as any)} 
                      className={`h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${settings.theme === t ? 'bg-accent text-accent-foreground shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]' : 'bg-transparent border-border text-foreground/40 hover:bg-foreground/5'}`}
                     >
                       {t === 'light' ? 'Claro' : t === 'medium' ? 'Medio' : 'Oscuro'}
                     </Button>
                   ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
