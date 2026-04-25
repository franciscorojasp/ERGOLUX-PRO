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
    <div className="space-y-8" id="library-root">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Biblioteca Técnica</h1>
        <p className="text-slate-500 italic">Base de conocimiento normativa y especificaciones técnicas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lamps Section */}
        <div className="space-y-4 lg:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold">Luminarias</h2>
          </div>
          {VENEZUELA_INDUSTRIAL_LAMPS.map((lamp) => (
            <Card key={lamp.name} className="group hover:border-blue-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-sm text-slate-900">{lamp.name}</h3>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-[10px]">
                    {lamp.efficiencyLmW} Lm/W
                  </Badge>
                </div>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div>
                    <p className="text-slate-400 font-black uppercase text-[8px]">Vida Útil</p>
                    <p className="text-slate-700 font-semibold">{lamp.avgLifeHours.toLocaleString()} hrs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Standards Section */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Target className="text-amber-600" size={24} />
              <h2 className="text-xl font-bold">Criterios de Conformidad</h2>
            </div>
            <div className="relative max-w-sm">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
               <Input 
                 placeholder="Buscar área o tarea..." 
                 className="pl-10 h-9 text-sm"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left bg-slate-50 border-b border-slate-200">
                      <th className="p-4 font-bold text-slate-900">Área Evaluada</th>
                      <th className="p-4 font-bold text-slate-900">Actividad</th>
                      <th className="p-4 font-bold text-slate-900 text-center">Lux (COVENIN)</th>
                      <th className="p-4 font-bold text-slate-900">Fuente</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStandards.map((std, i) => (
                      <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                        <td className="p-4 font-black text-blue-900">{std.area}</td>
                        <td className="p-4 text-slate-500 text-xs">{std.activity || '-'}</td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center justify-center min-w-[60px] px-2 py-1 bg-white text-blue-700 font-black rounded border border-blue-200 shadow-sm">
                            {std.minLux}
                          </span>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="text-[10px] uppercase font-black">{std.source}</Badge>
                        </td>
                      </tr>
                    ))}
                    {filteredStandards.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-400 italic">No se encontraron criterios que coincidan.</td>
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
