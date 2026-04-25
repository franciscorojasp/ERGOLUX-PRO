import React from 'react';
import { formatDate, cn } from '@/lib/utils';
import { CheckCircle2, FileText, Paperclip, ShieldCheck, PenTool, Cpu } from 'lucide-react';
import { useApp } from '@/AppContext';

interface PDFReportTemplateProps {
  data: any;
  id: string;
}

export default function PDFReportTemplate({ data, id }: PDFReportTemplateProps) {
  const { settings } = useApp();

  const selectedContractor = settings.contractors.find(c => c.id === data.contractorId) || settings.contractors.find(c => c.id === settings.activeContractorId) || settings.contractors[0];
  const selectedClient = settings.clients.find(c => c.id === data.clientId) || settings.clients.find(c => c.id === settings.activeClientId) || settings.clients[0];

  const standardsMap: Record<string, string> = {
    'COVENIN_2249': 'COVENIN 2249-1993: "Iluminancias en Tareas y Áreas de Trabajo"',
    'GO_36081': 'Gaceta Oficial Nro. 36.081: "Buenas Prácticas de Fabricación"',
    'OTHER_ATTACHED': 'Normativas Adicionales Suministradas (Anexo PDF)'
  };

  const renderPhoto = (photoData: any) => {
    if (!photoData) return null;
    if (typeof photoData === 'string') return photoData;
    if (photoData instanceof File) return URL.createObjectURL(photoData);
    if (photoData instanceof FileList && photoData.length > 0) return URL.createObjectURL(photoData[0]);
    return null;
  };

  const panoramicUrl = renderPhoto(data.panoramicPhoto);
  const totalPoints = data.areas ? data.areas.reduce((sum: number, a: any) => sum + (a.readings?.length || 0), 0) : 0;

  interface PageProps {
    children: React.ReactNode;
    pageNumber: number;
    key?: React.Key;
  }

  const Page = ({ children, pageNumber }: PageProps) => (
    <div className="h-[279.4mm] p-16 flex flex-col bg-white relative break-after-page">
      <div className="flex justify-between items-start mb-8 opacity-50">
        <div className="flex items-center gap-2">
           <div className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center font-black italic">K</div>
           <div className="text-[8px] font-bold leading-tight">
              <p>{selectedContractor.name}</p>
              <p>RIF: {selectedContractor.id}</p>
           </div>
        </div>
        <p className="text-[8px] font-black uppercase tracking-widest">Estudio de Iluminación - Página {pageNumber}</p>
      </div>
      {children}
      <div className="mt-auto pt-8 flex justify-between items-center text-[8px] text-slate-400 font-bold uppercase border-t border-slate-100">
         <p>Documento Generado vía LUMEX Study Cloud v2.1</p>
         <p>Confidencial - {selectedClient.name}</p>
      </div>
    </div>
  );

  return (
    <div id={id} className="bg-slate-200 w-[215.9mm] font-sans absolute -left-[5000px] top-0 shadow-2xl">
      
      {/* COVER PAGE */}
      <Page pageNumber={1}>
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <div className="w-40 h-40 bg-slate-50 border-8 border-slate-900 rounded-full flex items-center justify-center mb-12 shadow-xl">
             <span className="text-4xl font-black italic">KATET</span>
          </div>
          
          <div className="space-y-4 text-center mb-16">
            <h1 className="text-4xl font-black tracking-tighter uppercase text-slate-900">Estudio de Iluminación</h1>
            <div className="h-1.5 w-40 bg-blue-600 mx-auto" />
            <h2 className="text-2xl font-bold text-slate-500 uppercase">{data.projectName}</h2>
            <p className="text-xs font-black tracking-widest text-blue-600 uppercase">Determinación de Conformidad de Iluminancia Media en Servicio</p>
          </div>

          <div className="w-full max-w-lg bg-slate-50 border p-8 rounded-2xl shadow-sm mb-12">
             <table className="w-full text-xs font-bold">
               <tbody className="divide-y divide-slate-200">
                 <tr><td className="py-2 text-slate-400 uppercase tracking-widest text-[9px]">Nombre del Aliado</td><td className="py-2 text-right">{selectedClient.name}</td></tr>
                 <tr><td className="py-2 text-slate-400 uppercase tracking-widest text-[9px]">Registro Fiscal (RIF)</td><td className="py-2 text-right">{selectedClient.id}</td></tr>
                 <tr><td className="py-2 text-slate-400 uppercase tracking-widest text-[9px]">Ubicación Centro</td><td className="py-2 text-right italic font-medium">{selectedClient.address}</td></tr>
                 {selectedClient.contactPerson && (
                    <tr><td className="py-2 text-slate-400 uppercase tracking-widest text-[9px]">Atención a</td><td className="py-2 text-right">{selectedClient.contactPerson}</td></tr>
                 )}
                 {(selectedClient.phone || selectedClient.email) && (
                    <tr><td className="py-2 text-slate-400 uppercase tracking-widest text-[9px]">Contacto</td><td className="py-2 text-right text-[10px]">{selectedClient.phone} {selectedClient.phone && selectedClient.email && '•'} {selectedClient.email}</td></tr>
                 )}
               </tbody>
             </table>
          </div>

          {panoramicUrl && (
            <div className="w-full h-40 rounded-xl overflow-hidden grayscale opacity-80 mb-12 border shadow-inner">
               <img src={panoramicUrl} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-20 w-full text-center">
             <div className="space-y-4">
                <div className="h-20 flex items-end justify-center border-b border-slate-300 italic text-[10px] text-slate-400">Firma Digital</div>
                <p className="text-[10px] font-black uppercase">{selectedContractor.technicians?.[0]?.name}</p>
                <p className="text-[8px] text-slate-500">{selectedContractor.technicians?.[0]?.role}</p>
             </div>
             <div className="space-y-4">
                <div className="h-20 flex items-end justify-center border-b border-slate-300 italic text-[10px] text-slate-400 text-transparent">Firma Digital</div>
                <p className="text-[10px] font-black uppercase">Responsable Cliente</p>
                <p className="text-[8px] text-slate-500">Aprobación Técnica</p>
             </div>
          </div>
        </div>
      </Page>

      {/* PAGE 2: RESUMEN Y MARCO LEGAL */}
      <Page pageNumber={2}>
        <div className="space-y-10">
          <section>
            <h3 className="text-sm font-black uppercase text-blue-600 mb-4 flex items-center gap-2">
              <ShieldCheck size={16} /> Resumen Ejecutivo
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 bg-slate-50 p-6 rounded-xl border border-slate-200">
              {data.executiveSummary || `El presente estudio para ${selectedClient.name} tuvo como objetivo principal evaluar y determinar la conformidad de los niveles de iluminancia en las áreas de ${data.projectName} con la normativa vigente. El estudio abarcó un total de ${data.areas.length} sectores críticos.`}
            </p>
          </section>

          <section>
            <h3 className="text-sm font-black uppercase text-blue-600 mb-4 flex items-center gap-2">
              <FileText size={16} /> Marco Técnico Legal
            </h3>
            <ul className="grid grid-cols-1 gap-3">
              <li className="text-[10px] bg-white border p-3 rounded-lg flex items-start gap-3">
                <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center font-bold">01</div>
                <div>
                   <p className="font-bold">Ley Orgánica de Prevención, Condiciones y Medio Ambiente de Trabajo (LOPCYMAT).</p>
                   <p className="text-[8px] text-slate-400 mt-0.5">Gaceta Oficial N.º 38.236 el día 26 de julio de 2005.</p>
                </div>
              </li>
              <li className="text-[10px] bg-white border p-3 rounded-lg flex items-start gap-3">
                <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center font-bold">02</div>
                <div>
                   <p className="font-bold">Reglamento de las Condiciones de Higiene y Seguridad en el Trabajo (RCHST).</p>
                   <p className="text-[8px] text-slate-400 mt-0.5">Decreto N° 1.564, publicado el 31 de diciembre de 1973.</p>
                </div>
              </li>
              {data.selectedStandards.map((std: string, i: number) => (
                <li key={std} className="text-[10px] bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded flex items-center justify-center font-bold">{i+3}</div>
                  <p className="font-black text-blue-900 uppercase">{standardsMap[std] || std}</p>
                </li>
              ))}
            </ul>
          </section>

          <div className="grid grid-cols-2 gap-8">
            <section>
              <h3 className="text-sm font-black uppercase text-blue-600 mb-4 flex items-center gap-2">
                < PenTool size={16} /> Metodología
              </h3>
              <p className="text-[10px] text-slate-600 leading-relaxed italic">
                 Se siguió el procedimiento estimado en la Norma Venezolana Covenin 2249-1993, estableciendo una cuadrícula de muestreo representativa. Las mediciones se realizaron en horario {data.samplingType === 'diurnal' ? 'Diurno' : 'Diurno y Nocturno'}.
              </p>
            </section>
            <section>
              <h3 className="text-sm font-black uppercase text-blue-600 mb-4 flex items-center gap-2">
                <Cpu size={16} /> Equipos Utilizados
              </h3>
              <div className="bg-slate-900 text-white p-4 rounded-xl">
                 <p className="text-[10px] font-black tracking-widest text-blue-400 uppercase mb-2">Instrumento de Medición</p>
                 <table className="w-full text-[9px] font-bold">
                   <tbody>
                     <tr><td>MARCA/MOD</td><td className="text-right">{data.equipmentUsed.brand} {data.equipmentUsed.model}</td></tr>
                     <tr><td>SERIAL</td><td className="text-right">{data.equipmentUsed.serial}</td></tr>
                     <tr><td>CALIBRACIÓN</td><td className="text-right text-blue-300">{formatDate(data.equipmentUsed.calibrationDate)}</td></tr>
                   </tbody>
                 </table>
              </div>
            </section>
          </div>
        </div>
      </Page>

      {/* PAGE 3: RESULTADOS DETALLADOS */}
      {data.areas.map((area: any, areaIdx: number) => {
        const isDiurnalNocturnal = data.samplingType === 'diurnal_nocturnal';
        const avgDiurnal = area.readings.reduce((sum: number, r: any) => sum + (r.illuminanceDiurnal || r.illuminance || 0), 0) / area.readings.length;
        const avgNocturnal = area.readings.reduce((sum: number, r: any) => sum + (r.illuminanceNocturnal || 0), 0) / area.readings.length;

        const isCompliant = isDiurnalNocturnal 
          ? (avgDiurnal >= area.standardLux && avgNocturnal >= area.standardLux)
          : avgDiurnal >= area.standardLux;

        return (
          <Page key={areaIdx} pageNumber={3 + areaIdx}>
            <div className="mb-10 p-6 bg-slate-50 border-l-8 border-l-slate-900 rounded-lg flex justify-between items-center shadow-sm">
               <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900">{area.name}</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Determinación de conformidad por sector</p>
               </div>
               <div className="flex gap-10 text-center">
                  {isDiurnalNocturnal ? (
                    <>
                       <div><p className="text-[8px] font-black text-slate-400 uppercase">Media Diurna</p><p className={cn("text-base font-black", avgDiurnal >= area.standardLux ? "text-green-600" : "text-red-500")}>{avgDiurnal.toFixed(1)} <span className="text-[9px]">Lux</span></p></div>
                       <div><p className="text-[8px] font-black text-slate-400 uppercase">Media Nocturna</p><p className={cn("text-base font-black", avgNocturnal >= area.standardLux ? "text-green-600" : "text-red-500")}>{avgNocturnal.toFixed(1)} <span className="text-[9px]">Lux</span></p></div>
                    </>
                  ) : (
                    <div><p className="text-[8px] font-black text-slate-400 uppercase">Media Area</p><p className={cn("text-xl font-black", isCompliant ? "text-green-600" : "text-red-500")}>{avgDiurnal.toFixed(1)} <span className="text-[10px]">Lux</span></p></div>
                  )}
                  <div><p className="text-[8px] font-black text-slate-400 uppercase">Requerido</p><p className="text-xl font-black text-slate-900">{area.standardLux} <span className="text-[10px]">Lux</span></p></div>
                  <div className={cn("px-4 py-2 rounded font-black text-[10px] flex items-center", isCompliant ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                    {isCompliant ? 'CONFORME' : 'NO CONFORME'}
                  </div>
               </div>
            </div>

            <table className="w-full text-left border-collapse mb-10 shadow-sm border border-slate-200">
               <thead>
                 <tr className="bg-slate-900 text-white text-[9px] font-black uppercase">
                   <th className="p-3 border border-slate-700">Pto</th>
                   <th className="p-3 border border-slate-700">Nombre / Identificación</th>
                   <th className="p-3 border border-slate-700">Tipo Fuente</th>
                   <th className="p-3 border border-slate-700 text-right">
                     {isDiurnalNocturnal ? 'Diurno / Nocturno' : 'Lux Medido'}
                   </th>
                   <th className="p-3 border border-slate-700 text-center">Estado</th>
                 </tr>
               </thead>
               <tbody className="text-[10px]">
                 {area.readings.map((r: any, i: number) => {
                   const dVal = r.illuminanceDiurnal || r.illuminance || 0;
                   const nVal = r.illuminanceNocturnal || 0;
                   const pointCompliant = isDiurnalNocturnal 
                     ? (dVal >= area.standardLux && nVal >= area.standardLux)
                     : dVal >= area.standardLux;

                   return (
                     <tr key={i} className="border-b even:bg-slate-50">
                       <td className="p-3 border border-slate-100 font-bold opacity-30">{i+1}</td>
                       <td className="p-3 border border-slate-100 font-bold text-slate-700 uppercase">{r.pointName}</td>
                       <td className="p-3 border border-slate-100 italic text-slate-500 uppercase">{r.lampType || r.lightType}</td>
                       <td className={cn("p-3 border border-slate-100 text-right font-black", pointCompliant ? "text-slate-900" : "text-red-600")}>
                         {isDiurnalNocturnal ? `${dVal} / ${nVal}` : dVal}
                       </td>
                       <td className="p-3 border border-slate-100 text-center">
                         <div className={cn("inline-flex w-3 h-3 rounded-full", pointCompliant ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)] animate-pulse")} />
                       </td>
                     </tr>
                   );
                 })}
               </tbody>
            </table>

            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
               <h4 className="text-[10px] font-black uppercase text-blue-900 mb-2">Observación Técnica de Área:</h4>
               <p className="text-[11px] leading-relaxed text-blue-800 italic">
                 {isCompliant 
                   ? `Los niveles de iluminación medidos en el área de ${area.name} cumplen satisfactoriamente con el estándar de ${area.standardLux} Lux. Se recomienda mantener el programa de limpieza de luminarias.` 
                   : `Se detectó una deficiencia lumínica en ${area.name}, situándose la media por debajo de los ${area.standardLux} Lux requeridos. Es imperativo la revisión del sistema de iluminación artificial.`}
               </p>
            </div>
          </Page>
        );
      })}

      {/* FINAL PAGE: CONCLUSIONES Y RECOMENDACIONES */}
      <Page pageNumber={3 + data.areas.length + 1}>
        <div className="space-y-12 h-full flex flex-col">
          <section>
            <h3 className="text-sm font-black uppercase text-blue-600 mb-4 border-b pb-1">Conclusiones Finales</h3>
            <div className="text-xs leading-relaxed text-slate-600 space-y-4">
               {data.conclusions ? (
                 <p className="whitespace-pre-wrap">{data.conclusions}</p>
               ) : (
                 <>
                   <p>• El estudio determinó una conformidad mixta en las instalaciones de <strong>{selectedClient.name}</strong>.</p>
                   <p>• Los sectores que requieren alta precisión visual (1500 Lux) presentan los mayores desafíos de cumplimiento.</p>
                   <p>• Se identificó una dependencia significativa de la luz natural en áreas de proceso, lo que incrementa el riesgo en turnos nocturnos.</p>
                 </>
               )}
            </div>
          </section>

          <section className="flex-1">
            <h3 className="text-sm font-black uppercase text-blue-600 mb-4 border-b pb-1">Recomendaciones del Especialista</h3>
            <div className="text-xs leading-relaxed text-slate-600 space-y-4">
               {data.recommendations ? (
                 <p className="whitespace-pre-wrap">{data.recommendations}</p>
               ) : (
                 <>
                   <p>1. <strong>Elevación de Niveles:</strong> Incrementar la densidad lumínica en áreas de análisis técnico mediante sistemas de iluminación local.</p>
                   <p>2. <strong>Plan de Transición:</strong> Ejecutar una migración progresiva a tecnología LED con mayor eficiencia lm/w en naves industriales.</p>
                   <p>3. <strong>Mantenimiento:</strong> Establecer un cronograma trimestral de limpieza de difusores y carcasas para optimizar la salida lumens.</p>
                 </>
               )}
            </div>
          </section>

          <div className="bg-slate-50 border rounded-2xl p-8 flex justify-between items-center bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] bg-opacity-5">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-black">QR</div>
                <div>
                   <p className="text-[10px] font-black text-slate-800 uppercase">Verificación de Integridad</p>
                   <p className="text-[8px] text-slate-400 font-mono tracking-tighter">ID-DOC: {new Date().getTime()}-LUMEX-{selectedClient.id.slice(-5)}</p>
                </div>
             </div>
             <div className="text-right text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                <p>Documento firmado electrónicamente</p>
                <p>Regulado por Decreto con Fuerza de Ley</p>
                <p>Sobre Mensajes de Datos y Firmas Electrónicas</p>
             </div>
          </div>
        </div>
      </Page>
    </div>
  );
}

