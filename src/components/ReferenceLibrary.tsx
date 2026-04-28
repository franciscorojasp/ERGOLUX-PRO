import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BookOpen, 
  Lightbulb, 
  Target, 
  Download,
  Info,
  Search
} from 'lucide-react';
import { 
  VENEZUELA_INDUSTRIAL_LAMPS, 
  COVENIN_2249_STANDARDS 
} from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function ReferenceLibrary() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStandards = COVENIN_2249_STANDARDS.filter(s => 
    s.area.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.activity?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500" id="library-root">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight text-gradient">Biblioteca Técnica</h1>
          <p className="text-primary/50 font-black uppercase tracking-[0.3em] text-[10px] mt-2 italic">Base de conocimiento normativa y especificaciones técnicas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Lamps Section */}
        <div className="space-y-6 lg:col-span-1">
          <div className="flex items-center gap-3 mb-2 group">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)] transition-all">
              <Lightbulb size={20} />
            </div>
            <h2 className="text-lg font-black text-foreground uppercase tracking-widest">Luminarias</h2>
          </div>
          <div className="space-y-4">
            {VENEZUELA_INDUSTRIAL_LAMPS.map((lamp) => (
              <Card key={lamp.name} className="glass-card border-none overflow-hidden group hover:bg-foreground/10 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-black text-xs text-foreground uppercase tracking-wider leading-relaxed">{lamp.name}</h3>
                    <div className="px-2 py-1 bg-primary/20 text-primary text-[9px] font-black uppercase tracking-tighter rounded-md border border-primary/30">
                      {lamp.efficiencyLmW} Lm/W
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <p className="text-foreground/30 font-black uppercase text-[8px] tracking-[0.2em] mb-1">Vida Útil</p>
                    <p className="text-foreground font-black text-sm">{lamp.avgLifeHours.toLocaleString()} <span className="text-foreground/40 text-[10px]">HRS</span></p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Standards Section */}
        <div className="space-y-6 lg:col-span-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                <Target size={20} />
              </div>
              <h2 className="text-lg font-black text-foreground uppercase tracking-widest">Criterios de Conformidad</h2>
            </div>
            <div className="relative w-full md:w-80">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 h-4 w-4" />
               <Input 
                 placeholder="Buscar área o tarea..." 
                 className="pl-11 h-12 bg-foreground/5 border-border text-foreground text-xs rounded-2xl focus:border-primary/50 transition-all"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
          </div>

          <Card className="glass-card border-none overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left bg-foreground/5 border-b border-border">
                      <th className="p-6 font-black text-[10px] text-foreground/40 uppercase tracking-[0.2em]">Área Evaluada</th>
                      <th className="p-6 font-black text-[10px] text-foreground/40 uppercase tracking-[0.2em]">Actividad</th>
                      <th className="p-6 font-black text-[10px] text-foreground/40 uppercase tracking-[0.2em] text-center">Lux (COVENIN)</th>
                      <th className="p-6 font-black text-[10px] text-foreground/40 uppercase tracking-[0.2em]">Fuente</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredStandards.map((std, i) => (
                      <tr key={i} className="hover:bg-foreground/5 transition-colors group">
                        <td className="p-6">
                          <span className="font-black text-xs text-primary uppercase tracking-wider">{std.area}</span>
                        </td>
                        <td className="p-6">
                          <p className="text-foreground/60 text-xs leading-relaxed max-w-xs">{std.activity || '-'}</p>
                        </td>
                        <td className="p-6 text-center">
                          <span className="inline-flex items-center justify-center min-w-[70px] h-9 bg-foreground/10 text-foreground font-black rounded-xl border border-border group-hover:border-primary/50 transition-all">
                            {std.minLux}
                          </span>
                        </td>
                        <td className="p-6">
                          <div className="px-3 py-1 bg-foreground/5 border border-border text-foreground/40 text-[9px] uppercase font-black tracking-widest rounded-lg inline-block">
                            {std.source}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredStandards.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-12 text-center text-foreground/20 font-black uppercase tracking-widest text-[10px]">No se encontraron criterios que coincidan.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
