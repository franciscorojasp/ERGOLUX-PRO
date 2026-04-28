import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ClipboardList, 
  CheckCircle2, 
  ArrowUpRight,
  TrendingUp,
  Clock,
  ChevronRight,
  Zap
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
import { studyService } from '@/services/studyService';

export default function Dashboard({ onNavigate }: { onNavigate: (page: any) => void }) {
  const { t } = useApp();
  const [projects, setProjects] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await studyService.getProjects();
        setProjects(data);
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const stats = {
    total: projects.length,
    compliance: projects.length > 0 ? 94 : 0, 
    activePoints: projects.length * 12,
  };

  const chartData = projects.length > 0 ? [
    { name: 'Área A', lux: 480, standard: 300 },
    { name: 'Área B', lux: 290, standard: 300 },
    { name: 'Área C', lux: 520, standard: 500 },
    { name: 'Área D', lux: 310, standard: 300 },
  ] : [];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground mb-2 uppercase">
            {t('nav.dashboard').split(' ')[0]} <span className="text-primary">{t('nav.dashboard').split(' ').slice(1).join(' ')}</span>
          </h1>
          <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-xs">
            {t('dashboard.subtitle')}
          </p>
        </div>
        <Button 
          onClick={() => onNavigate('new-study')} 
          className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 shadow-[0_0_40px_rgba(var(--primary-rgb),0.3)] transition-all font-black uppercase tracking-widest text-xs text-primary-foreground"
        >
          <Zap className="mr-2 h-4 w-4 fill-primary-foreground" /> {t('study.btn.new')}
        </Button>
      </div>

      {/* Summary Cards - ERGODENTAL Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { id: 'total', label: t('dashboard.stats.total'), value: stats.total, icon: ClipboardList, color: 'text-primary', glow: 'shadow-primary/10' },
          { id: 'compliance', label: t('dashboard.stats.compliance'), value: `${stats.compliance}%`, icon: CheckCircle2, color: 'text-green-500', glow: 'shadow-emerald-500/10' },
          { id: 'points', label: t('dashboard.stats.points'), value: stats.activePoints, icon: Clock, color: 'text-accent', glow: 'shadow-accent/10' },
        ].map((stat) => (
          <div key={stat.id} className="group relative">
            <div className={cn(
              "p-8 rounded-[2rem] bg-card border border-border backdrop-blur-3xl transition-all duration-500 hover:bg-foreground/6 hover:border-border hover:-translate-y-2 shadow-2xl",
              stat.glow
            )}>
              <div className="flex justify-between items-start mb-6">
                <div className={cn("p-4 rounded-2xl bg-foreground/5", stat.color)}>
                  <stat.icon size={28} />
                </div>
                <ArrowUpRight className="text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <div>
                <h3 className="text-5xl font-black text-foreground tracking-tighter mb-1">{stat.value}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        {/* Main Chart Card */}
        <div className="lg:col-span-4 rounded-[2.5rem] bg-card border border-border p-8 backdrop-blur-3xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-foreground tracking-tight flex items-center gap-3 uppercase">
              <TrendingUp className="text-primary" /> {t('dashboard.chart.title')}
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('dashboard.chart.compliant')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('dashboard.chart.noncompliant')}</span>
              </div>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(var(--primary-rgb), 1)" stopOpacity={1} />
                    <stop offset="100%" stopColor="rgba(var(--primary-rgb), 0.7)" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    borderRadius: '20px', 
                    border: '1px solid var(--border)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                    color: 'var(--foreground)'
                  }}
                />
                <Bar dataKey="lux" radius={[8, 8, 0, 0]} barSize={45}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.lux < entry.standard ? '#a855f7' : 'url(#primaryGradient)'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Projects List */}
        <div className="lg:col-span-3 rounded-[2.5rem] bg-card border border-border p-8 backdrop-blur-3xl flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-foreground tracking-tight uppercase">{t('dashboard.recent.title')}</h3>
            <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full tracking-widest">LIVE</span>
          </div>

          <div className="space-y-4 flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground animate-pulse uppercase font-black tracking-widest text-[10px]">
                {t('dashboard.recent.loading')}
              </div>
            ) : projects.length > 0 ? (
              projects.slice(0, 5).map((project, i) => (
                <div key={i} className="group p-5 rounded-3xl bg-foreground/2 border border-transparent hover:border-border hover:bg-foreground/5 transition-all flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center shrink-0 group-hover:bg-primary transition-all duration-500">
                    <ClipboardList size={22} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-foreground truncate uppercase tracking-tight">{project.ProjectName}</p>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-[10px] text-muted-foreground font-bold truncate">{project.Company}</span>
                       <div className="w-1 h-1 rounded-full bg-border" />
                       <span className="text-[10px] text-muted-foreground font-bold">{new Date(project.CreatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight size={20} className="text-primary" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">{t('dashboard.recent.none')}</p>
              </div>
            )}
          </div>
          
          <Button variant="ghost" className="w-full mt-8 h-12 rounded-2xl border-border text-[10px] font-black uppercase tracking-[0.2em] hover:bg-foreground/5 hover:text-primary">
            {t('dashboard.recent.more')}
          </Button>
        </div>
      </div>
    </div>
  );
}
