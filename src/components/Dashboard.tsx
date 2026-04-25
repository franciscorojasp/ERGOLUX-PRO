import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ClipboardList, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight,
  TrendingUp,
  Clock,
  Wrench
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useApp } from '@/AppContext';

const data = [
  { name: 'Ensacado', lux: 473, standard: 300 },
  { name: 'Empaque', lux: 494, standard: 300 },
  { name: 'Micro/Macro', lux: 500, standard: 500 },
  { name: 'Almacén', lux: 213, standard: 300 },
  { name: 'Silos', lux: 230, standard: 200 },
];

export default function Dashboard({ onNavigate }: { onNavigate: (page: any) => void }) {
  const { t, settings } = useApp();

  return (
    <div className="space-y-8" id="dashboard-root">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-slate-500 italic">{t('dashboard.subtitle')}</p>
        </div>
        <Button onClick={() => onNavigate('new-study')} className="bg-blue-600 hover:bg-blue-700 shadow-md">
          <ClipboardList className="mr-2 h-4 w-4" /> {t('study.btn.new')}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card id="stat-studies">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Estudios Totales</CardTitle>
            <ClipboardList className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-green-500 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" /> +12% este mes
            </p>
          </CardContent>
        </Card>

        <Card id="stat-maintenance">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Mantenimientos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-slate-400 mt-1">3 urgentes próximos</p>
          </CardContent>
        </Card>

        <Card id="stat-compliance">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Conformidad</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">92%</div>
            <p className="text-xs text-slate-400 mt-1">Promedio planta</p>
          </CardContent>
        </Card>

        <Card id="stat-active">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Puntos Monitoreo</CardTitle>
            <Clock className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">144</div>
            <p className="text-xs text-slate-400 mt-1">Luminarias LED</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-4" id="chart-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Niveles de Iluminancia (Lux)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="lux" radius={[4, 4, 0, 0]} barSize={40}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.lux < entry.standard ? '#ef4444' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-center gap-6 text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                 Cumple Norma
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                 No Conforme
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-3" id="recent-activity">
          <CardHeader>
            <CardTitle className="text-lg">Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { title: 'Estudio Planta ABA', company: 'Cervecera Polar', date: 'Hace 2 horas', type: 'study' },
                { title: 'Mant. Preventivo Piso 7', company: 'Equipo LED', date: 'Hace 5 horas', type: 'maint' },
                { title: 'Estudio Almacén MP', company: 'Ind. Alim.', date: 'Ayer', type: 'study' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    item.type === 'study' ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"
                  )}>
                    {item.type === 'study' ? <ClipboardList size={20} /> : <Wrench size={20} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.company}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">{item.date}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-slate-400">
                    <ArrowUpRight size={18} />
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-6 text-blue-600 border-blue-200 hover:bg-blue-50">
              Ver Historial Completo
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
