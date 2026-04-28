import React from 'react';
import { formatDate, cn } from '@/lib/utils';
import { FileText, ShieldCheck, PenTool, Cpu } from 'lucide-react';
import { useApp } from '@/AppContext';

interface PDFReportTemplateProps {
  data: any;
  id: string;
}

export default function PDFReportTemplate({ data, id }: PDFReportTemplateProps) {
  const { settings, t } = useApp();

  const selectedContractor = settings.contractors.find(c => c.id === data.contractorId) || settings.contractors.find(c => c.id === settings.activeContractorId) || settings.contractors[0];
  const selectedClient = settings.clients.find(c => c.id === data.clientId) || settings.clients.find(c => c.id === settings.activeClientId) || settings.clients[0];

  // Calcular promedios por área
  const calculateAreaAverages = (area: any) => {
    const readings = area.readings || [];
    if (readings.length === 0) return { diurnal: 0, nocturnal: 0, combined: 0 };
    
    const diurnalSum = readings.reduce((sum: number, r: any) => sum + (r.illuminanceDiurnal || r.illuminance || 0), 0);
    const nocturnalSum = readings.reduce((sum: number, r: any) => sum + (r.illuminanceNocturnal || 0), 0);
    
    const diurnalAvg = diurnalSum / readings.length;
    const nocturnalAvg = nocturnalSum / readings.length;
    const combinedAvg = data.samplingType === 'diurnal_nocturnal' ? (diurnalAvg + nocturnalAvg) / 2 : diurnalAvg;
    
    return { diurnal: diurnalAvg, nocturnal: nocturnalAvg, combined: combinedAvg };
  };

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

  // Renderizar foto de punto
  const renderPointPhoto = (photoData: any, pointId: string) => {
    if (!photoData) return null;
    if (typeof photoData === 'string') return photoData;
    if (photoData instanceof File) return URL.createObjectURL(photoData);
    if (photoData instanceof FileList && photoData.length > 0) return URL.createObjectURL(photoData[0]);
    return null;
  };

  interface PageProps {
    children: React.ReactNode;
    pageNumber: number;
    key?: React.Key;
  }

  const Page = ({ children, pageNumber }: PageProps) => (
    <div className="h-[279.4mm] p-16 flex flex-col bg-white relative break-after-page">
      <div className="flex justify-between items-start mb-8 opacity-50">
        <div className="flex items-center gap-2">
           {selectedContractor.logo ? (
             <div className="w-10 h-10 rounded-lg overflow-hidden">
               <img src={selectedContractor.logo} alt="Logo" className="w-full h-full object-cover" />
             </div>
           ) : (
             <div className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center font-black italic">K</div>
           )}
           <div className="text-[8px] font-bold leading-tight">
              <p>{selectedContractor.name}</p>
              <p>RIF: {selectedContractor.id}</p>
           </div>
        </div>
        <p className="text-[8px] font-black uppercase tracking-widest">{t('report.title')} - {t('report.page')} {pageNumber}</p>
      </div>
      {children}
      <div className="mt-auto pt-8 flex justify-between items-center text-[8px] text-slate-400 font-bold uppercase border-t border-slate-100">
         <p>{t('report.generated')}</p>
         <p>{t('report.confidential')} - {selectedClient.name}</p>
      </div>
    </div>
  );

  return (
    <div id={id} className="bg-slate-200 w-[215.9mm] font-sans absolute -left-[5000px] top-0 shadow-2xl">
      
      {/* COVER PAGE */}
      <Page pageNumber={1}>
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <div className="w-40 h-40 bg-slate-50 border-8 border-slate-900 rounded-full flex items-center justify-center mb-12 shadow-xl">
             {selectedContractor.logo ? (
               <img src={selectedContractor.logo} alt="Logo" className="w-full h-full object-cover rounded-full" />
             ) : (
               <span className="text-4xl font-black italic">KATET</span>
             )}
          </div>
          
          <div className="space-y-4 text-center mb-16">
            <h1 className="text-4xl font-black tracking-tighter uppercase text-slate-900">{t('report.title')}</h1>
            <div className="h-1.5 w-40 bg-slate-900 mx-auto" />
            <h2 className="text-2xl font-bold text-slate-500 uppercase">{data.projectName}</h2>
            <p className="text-xs font-black tracking-widest text-slate-900 uppercase">{t('report.subtitle')}</p>
          </div>

          <div className="w-full max-w-lg bg-slate-50 border p-8 rounded-2xl shadow-sm mb-12">
             <div className="flex items-center gap-4 mb-4">
               {selectedClient.logo ? (
                 <div className="w-16 h-16 rounded-lg overflow-hidden">
                   <img src={selectedClient.logo} alt="Logo Cliente" className="w-full h-full object-cover" />
                 </div>
               ) : (
                 <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center">
                   <span className="text-2xl font-black italic text-slate-400">C</span>
                 </div>
               )}
               <div>
                 <p className="text-[10px] font-black text-slate-900 uppercase">{selectedClient.name}</p>
                 <p className="text-[9px] text-slate-500">{selectedClient.id}</p>
               </div>
             </div>
             <table className="w-full text-xs font-bold">
               <tbody className="divide-y divide-slate-200">
                 <tr><td className="py-2 text-slate-400 uppercase tracking-widest text-[9px]">{t('report.contractor')}</td><td className="py-2 text-right">{selectedClient.name}</td></tr>
                 <tr><td className="py-2 text-slate-400 uppercase tracking-widest text-[9px]">{t('report.rif')}</td><td className="py-2 text-right">{selectedClient.id}</td></tr>
                 {selectedClient.address && (
                    <tr><td className="py-2 text-slate-400 uppercase tracking-widest text-[9px]">Dirección Fiscal</td><td className="py-2 text-right italic font-medium">{selectedClient.address}</td></tr>
                 )}
                 {data.worksiteAddress && (
                    <tr><td className="py-2 text-slate-400 uppercase tracking-widest text-[9px]">Centro de Trabajo</td><td className="py-2 text-right italic font-medium">{data.worksiteAddress}</td></tr>
                 )}
                 {data.dimensions && (data.dimensions.length || data.dimensions.width || data.dimensions.height) && (
                    <tr><td className="py-2 text-slate-400 uppercase tracking-widest text-[9px]">Dimensiones</td><td className="py-2 text-right text-[10px]">
                      {data.dimensions.length ? `${data.dimensions.length}m x ` : ''}{data.dimensions.width ? `${data.dimensions.width}m` : ''}{data.dimensions.height ? ` x ${data.dimensions.height}m alto` : ''}
                    </td></tr>
                 )}
                 {selectedClient.contactPerson && (
                    <tr><td className="py-2 text-slate-400 uppercase tracking-widest text-[9px]">{t('report.attention')}</td><td className="py-2 text-right">{selectedClient.contactPerson}</td></tr>
                 )}
                 {(selectedClient.phone || selectedClient.email) && (
                    <tr><td className="py-2 text-slate-400 uppercase tracking-widest text-[9px]">{t('report.contact')}</td><td className="py-2 text-right text-[10px]">{selectedClient.phone} {selectedClient.phone && selectedClient.email && '•'} {selectedClient.email}</td></tr>
                 )}
               </tbody>
             </table>
          </div>

          {/* Foto Panorámica */}
          {panoramicUrl && (
            <div className="w-full max-w-lg bg-slate-50 border p-4 rounded-xl shadow-sm mb-8">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Foto Panorámica del Área</p>
               <div className="w-full h-32 rounded-lg overflow-hidden">
                 <img src={panoramicUrl} className="w-full h-full object-cover" alt="Panoramic" />
               </div>
            </div>
          )}

          {/* Condiciones Ambientales */}
          {data.weatherConditions && (data.weatherConditions.diurnal?.temperature || data.weatherConditions.diurnal?.humidity || data.weatherConditions.nocturnal?.temperature || data.weatherConditions.nocturnal?.humidity) && (
            <div className="w-full max-w-lg bg-slate-50 border p-4 rounded-xl shadow-sm mb-8">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Condiciones Ambientales</p>
               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white p-3 rounded-lg">
                   <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Diurno</p>
                   <div className="flex items-center gap-2">
                     {data.weatherConditions.diurnal?.temperature && (
                       <span className="text-[10px] font-bold text-slate-900">{data.weatherConditions.diurnal.temperature}°C</span>
                     )}
                     {data.weatherConditions.diurnal?.humidity && (
                       <span className="text-[10px] font-bold text-slate-900">{data.weatherConditions.diurnal.humidity}% HR</span>
                     )}
                   </div>
                 </div>
                 <div className="bg-white p-3 rounded-lg">
                   <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Nocturno</p>
                   <div className="flex items-center gap-2">
                     {data.weatherConditions.nocturnal?.temperature && (
                       <span className="text-[10px] font-bold text-slate-900">{data.weatherConditions.nocturnal.temperature}°C</span>
                     )}
                     {data.weatherConditions.nocturnal?.humidity && (
                       <span className="text-[10px] font-bold text-slate-900">{data.weatherConditions.nocturnal.humidity}% HR</span>
                     )}
                   </div>
                 </div>
               </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-10 w-full text-center">
             <div className="space-y-4">
                <div className="h-20 flex items-end justify-center border-b border-slate-300 italic text-[10px] text-slate-400">{t('report.signature')}</div>
                <p className="text-[10px] font-black uppercase">{selectedContractor.technicians?.[0]?.name}</p>
                <p className="text-[8px] text-slate-500">{selectedContractor.technicians?.[0]?.role || 'Elaborador'}</p>
             </div>
             {selectedContractor.technicians?.[1] && (
               <div className="space-y-4">
                  <div className="h-20 flex items-end justify-center border-b border-slate-300 italic text-[10px] text-slate-400">Revisor</div>
                  <p className="text-[10px] font-black uppercase">{selectedContractor.technicians?.[1]?.name}</p>
                  <p className="text-[8px] text-slate-500">{selectedContractor.technicians?.[1]?.role || 'Revisor'}</p>
               </div>
             )}
             {selectedContractor.technicians?.[2] && (
               <div className="space-y-4">
                  <div className="h-20 flex items-end justify-center border-b border-slate-300 italic text-[10px] text-slate-400">Aprobador</div>
                  <p className="text-[10px] font-black uppercase">{selectedContractor.technicians?.[2]?.name}</p>
                  <p className="text-[8px] text-slate-500">{selectedContractor.technicians?.[2]?.role || 'Aprobador'}</p>
               </div>
             )}
          </div>
        </div>
      </Page>

      {/* PAGE 2: SUMMARY AND LEGAL FRAMEWORK */}
      <Page pageNumber={2}>
        <div className="space-y-10">
          <section>
            <h3 className="text-sm font-black uppercase text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck size={16} /> {t('report.summary')}
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 bg-slate-50 p-6 rounded-xl border border-slate-200">
              {data.executiveSummary || t('report.summary.default')}
            </p>
          </section>

          <section>
            <h3 className="text-sm font-black uppercase text-slate-900 mb-4 flex items-center gap-2">
              <FileText size={16} /> {t('report.legal')}
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
                  <div className="w-6 h-6 bg-slate-900 text-white rounded flex items-center justify-center font-bold">{i+3}</div>
                  <p className="font-black text-slate-900 uppercase">{standardsMap[std] || std}</p>
                </li>
              ))}
            </ul>
          </section>

          <div className="grid grid-cols-2 gap-8">
            <section>
              <h3 className="text-sm font-black uppercase text-slate-900 mb-4 flex items-center gap-2">
                <PenTool size={16} /> {t('report.methodology')}
              </h3>
              <p className="text-[10px] text-slate-600 leading-relaxed italic">
                 {t('report.methodology.default')} {data.samplingType === 'diurnal' ? t('wizard.sampling.diurnal') : t('wizard.sampling.diurnalNocturnal')}
              </p>
            </section>
            <section>
              <h3 className="text-sm font-black uppercase text-slate-900 mb-4 flex items-center gap-2">
                <Cpu size={16} /> {t('report.equipment')}
              </h3>
              <div className="bg-slate-900 text-white p-4 rounded-xl">
                 <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Measurement Instrument</p>
                 <table className="w-full text-[9px] font-bold">
                   <tbody>
                     <tr><td>BRAND/MODEL</td><td className="text-right">{data.equipmentUsed.brand} {data.equipmentUsed.model}</td></tr>
                     <tr><td>SERIAL</td><td className="text-right">{data.equipmentUsed.serial}</td></tr>
                     <tr><td>CALIBRATION</td><td className="text-right text-slate-300">{formatDate(data.equipmentUsed.calibrationDate)}</td></tr>
                   </tbody>
                 </table>
              </div>
            </section>
          </div>
        </div>
      </Page>

      {/* PAGE 3: DETAILED RESULTS */}
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
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Conformity determination by sector</p>
               </div>
               <div className="flex gap-10 text-center">
                  {isDiurnalNocturnal ? (
                    <>
                       <div><p className="text-[8px] font-black text-slate-400 uppercase">{t('report.averageDiurnal')}</p><p className={cn("text-base font-black", avgDiurnal >= area.standardLux ? "text-green-600" : "text-red-500")}>{avgDiurnal.toFixed(1)} <span className="text-[9px]">Lux</span></p></div>
                       <div><p className="text-[8px] font-black text-slate-400 uppercase">{t('report.averageNocturnal')}</p><p className={cn("text-base font-black", avgNocturnal >= area.standardLux ? "text-green-600" : "text-red-500")}>{avgNocturnal.toFixed(1)} <span className="text-[9px]">Lux</span></p></div>
                    </>
                  ) : (
                    <div><p className="text-[8px] font-black text-slate-400 uppercase">{t('report.average')}</p><p className={cn("text-xl font-black", isCompliant ? "text-green-600" : "text-red-500")}>{avgDiurnal.toFixed(1)} <span className="text-[10px]">Lux</span></p></div>
                  )}
                  <div><p className="text-[8px] font-black text-slate-400 uppercase">{t('report.standard')}</p><p className="text-xl font-black text-slate-900">{area.standardLux} <span className="text-[10px]">Lux</span></p></div>
                  <div className={cn("px-4 py-2 rounded font-black text-[10px] flex items-center", isCompliant ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                    {isCompliant ? t('study.compliance.conform') : t('study.compliance.nonconform')}
                  </div>
               </div>
            </div>

            <table className="w-full text-left border-collapse mb-10 shadow-sm border border-slate-200">
               <thead>
                 <tr className="bg-slate-900 text-white text-[9px] font-black uppercase">
                   <th className="p-3 border border-slate-700">Pto</th>
                   <th className="p-3 border border-slate-700">Name / Identification</th>
                   <th className="p-3 border border-slate-700">Source Type</th>
                   <th className="p-3 border border-slate-700 text-right">
                     {isDiurnalNocturnal ? 'Diurnal / Nocturnal' : 'Measured Lux'}
                   </th>
                   <th className="p-3 border border-slate-700 text-center">Status</th>
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

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
               <h4 className="text-[10px] font-black uppercase text-slate-900 mb-2">{t('report.observation.title')}:</h4>
               <p className="text-[11px] leading-relaxed text-slate-600 italic">
                 {isCompliant 
                   ? `The measured illumination levels in the ${area.name} area satisfactorily comply with the ${area.standardLux} Lux standard. It is recommended to maintain the lighting fixture cleaning program.` 
                   : `A lighting deficiency was detected in ${area.name}, with the average falling below the required ${area.standardLux} Lux. Review of the artificial lighting system is imperative.`}
               </p>
            </div>

            {/* Observaciones por punto */}
            {area.readings.some((r: any) => r.observation) && (
              <div className="mt-6">
                <h4 className="text-[10px] font-black uppercase text-slate-900 mb-2">Observaciones por Punto:</h4>
                <div className="space-y-2">
                  {area.readings.map((r: any, i: number) => (
                    r.observation && (
                      <div key={i} className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                        <p className="text-[9px] font-black text-slate-900 uppercase mb-1">Punto {i+1}: {r.pointName}</p>
                        <p className="text-[10px] text-slate-600 italic">{r.observation}</p>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Fotos de Puntos */}
            {area.readings.some((r: any) => r.photo) && (
              <div className="mt-6">
                <h4 className="text-[10px] font-black uppercase text-slate-900 mb-2">Fotos de Puntos:</h4>
                <div className="grid grid-cols-3 gap-2">
                  {area.readings.map((r: any, i: number) => (
                    r.photo && (
                      <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                        <div className="h-20 overflow-hidden">
                          <img src={r.photo} alt={`Punto ${i+1}`} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-[8px] font-black text-slate-900 uppercase text-center p-1">Punto {i+1}</p>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Foto Panorámica del Área */}
            {panoramicUrl && (
              <div className="mt-6">
                <h4 className="text-[10px] font-black uppercase text-slate-900 mb-2">Foto Panorámica del Área:</h4>
                <div className="w-full h-48 rounded-xl overflow-hidden border border-slate-200">
                  <img src={panoramicUrl} alt="Panorámica del Área" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </Page>
        );
      })}

      {/* FINAL PAGE: CONCLUSIONS AND RECOMMENDATIONS */}
      <Page pageNumber={3 + data.areas.length + 1}>
        <div className="space-y-12 h-full flex flex-col">
          <section>
            <h3 className="text-sm font-black uppercase text-slate-900 mb-4 border-b pb-1">{t('report.conclusions')}</h3>
            <div className="text-xs leading-relaxed text-slate-600 space-y-4">
               {data.conclusions ? (
                 <p className="whitespace-pre-wrap">{data.conclusions}</p>
               ) : (
                 <p>Conclusions generated automatically based on measurement data.</p>
               )}
            </div>
          </section>

          <section className="flex-1">
            <h3 className="text-sm font-black uppercase text-slate-900 mb-4 border-b pb-1">{t('report.recommendations')}</h3>
            <div className="text-xs leading-relaxed text-slate-600 space-y-4">
               {data.recommendations ? (
                 <p className="whitespace-pre-wrap">{data.recommendations}</p>
               ) : (
                 <p>Recommendations generated automatically based on measurement data.</p>
               )}
            </div>
          </section>

          {/* RELACIÓN DE LÁMPARAS/LUMINARIAS */}
          {data.lampRelationship && data.lampRelationship.length > 0 && (
            <section>
              <h3 className="text-sm font-black uppercase text-slate-900 mb-4 border-b pb-1">Relación de Lámparas/Luminarias</h3>
              <div className="space-y-4">
                {data.lampRelationship.map((lamp: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 border p-4 rounded-xl">
                    <p className="text-[10px] font-black text-slate-900 uppercase mb-2">{lamp.areaName}</p>
                    <div className="grid grid-cols-4 gap-2 text-[9px]">
                      <div><span className="text-slate-400 uppercase">Total:</span> {lamp.total}</div>
                      <div><span className="text-slate-400 uppercase">Circular:</span> {lamp.circular}</div>
                      <div><span className="text-slate-400 uppercase">Rectangular:</span> {lamp.rectangular}</div>
                      <div><span className="text-slate-400 uppercase">Otras:</span> {lamp.others}</div>
                      <div><span className="text-slate-400 uppercase">Operativas:</span> {lamp.operatives}</div>
                      <div><span className="text-slate-400 uppercase">No Operativas:</span> {lamp.nonOperatives}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="bg-slate-50 border rounded-2xl p-8 flex justify-between items-center">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center font-black">QR</div>
                <div>
                   <p className="text-[10px] font-black text-slate-800 uppercase">{t('report.integrity')}</p>
                   <p className="text-[8px] text-slate-400 font-mono tracking-tighter">ID-DOC: {new Date().getTime()}-LUMEX-{selectedClient.id.slice(-5)}</p>
                </div>
             </div>
             <div className="text-right text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                <p>Electronically signed document</p>
                <p>Regulated by Data Messages and Electronic Signatures Law</p>
             </div>
          </div>
        </div>
      </Page>

      {/* ANEXOS */}
      {data.attachments && data.attachments.length > 0 && (
        <Page pageNumber={4 + data.areas.length}>
          <div className="space-y-6">
            <h3 className="text-xl font-black uppercase text-slate-900 mb-6">ANEXOS</h3>
            <div className="space-y-4">
              {data.attachments.map((attachment: any, idx: number) => (
                <div key={idx} className="bg-slate-50 border p-4 rounded-xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
                    <FileText size={20} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-900 uppercase">{attachment.type}</p>
                    <p className="text-[9px] text-slate-600">{attachment.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Page>
      )}

      {/* FOTOS DE PUNTOS */}
      {data.pointPhotos && Object.keys(data.pointPhotos).length > 0 && (
        <Page pageNumber={5 + data.areas.length}>
          <div className="space-y-6">
            <h3 className="text-xl font-black uppercase text-slate-900 mb-6">FOTOS DE PUNTOS DE MUESTREO</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(data.pointPhotos).map(([pointId, photoUrl]: [string, string], idx: number) => (
                <div key={idx} className="bg-slate-50 border p-2 rounded-xl">
                  <div className="h-32 overflow-hidden rounded-lg">
                    <img src={photoUrl} alt={`Punto ${pointId}`} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[9px] font-black text-slate-900 uppercase mt-2 text-center">Punto {pointId}</p>
                </div>
              ))}
            </div>
          </div>
        </Page>
      )}
    </div>
  );
}
