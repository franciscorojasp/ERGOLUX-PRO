import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  Plus,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MaintenanceSchedule() {
  const [tasks, setTasks] = useState([
    { id: '1', area: 'Ensacado #2', type: 'preventive', date: '2026-05-10', status: 'pending', desc: 'Limpieza de luminaria y revisión de driver' },
    { id: '2', area: 'Piso 7 ABA', type: 'corrective', date: '2026-04-28', status: 'urgent', desc: 'Reemplazo de panel LED parpadeante' },
    { id: '3', area: 'Almacén MP', type: 'preventive', date: '2026-06-15', status: 'scheduled', desc: 'Revisión semestral' },
  ]);

  return (
    <div className="space-y-8" id="maintenance-root">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Agenda de Mantenimiento</h1>
          <p className="text-slate-500 italic">Programación de intervenciones preventivas y correctivas.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
           <Plus className="mr-2 h-4 w-4" /> Programar Tarea
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Task List */}
        <div className="xl:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Clock className="text-blue-500" size={20} />
            Próximas Tareas
          </h2>
          {tasks.map((task) => (
            <Card key={task.id} className={cn(
              "group relative overflow-hidden border-l-4 transition-all hover:shadow-md",
              task.status === 'urgent' ? "border-l-red-500" : "border-l-blue-500"
            )}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                      task.type === 'preventive' ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"
                    )}>
                      {task.type === 'preventive' ? <Clock size={24} /> : <Wrench size={24} />}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900">{task.area}</h3>
                        {task.status === 'urgent' && <Badge variant="destructive" className="animate-pulse">Urgente</Badge>}
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-1">{task.desc}</p>
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                        <span className="flex items-center gap-1"><CalendarIcon size={12} /> {task.date}</span>
                        <span className="uppercase tracking-widest">{task.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <Button variant="outline" size="sm" className="bg-white border-slate-200">Detalles</Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Completar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sidebar/Stats */}
        <div className="space-y-6">
          <Card className="bg-slate-900 text-white shadow-xl shadow-slate-900/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon size={20} className="text-blue-400" />
                Resumen Mensual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Pendientes</p>
                   <p className="text-3xl font-bold">12</p>
                </div>
                <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Completados</p>
                   <p className="text-3xl font-bold text-green-400">45</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-300">Tasa de Efectividad</p>
                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full w-[78%]" />
                </div>
                <p className="text-right text-[10px] text-slate-500 font-bold uppercase">78% de cumplimiento</p>
              </div>
            </CardContent>
          </Card>

          <Card>
             <CardHeader>
               <CardTitle className="text-sm font-bold uppercase text-slate-500">Alertas de Repuesto</CardTitle>
             </CardHeader>
             <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {[
                    { item: 'Panel LED 60x60', stock: 2, min: 5 },
                    { item: 'Balastro Electrónico', stock: 0, min: 2 },
                  ].map((inv, i) => (
                    <div key={i} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{inv.item}</p>
                        <p className="text-xs text-red-500 font-medium">Bajo stock: {inv.stock} unidades</p>
                      </div>
                      <Button variant="ghost" size="icon" className="text-blue-600">
                        <Plus size={18} />
                      </Button>
                    </div>
                  ))}
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
