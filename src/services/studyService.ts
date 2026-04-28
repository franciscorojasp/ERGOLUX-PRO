import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const studyService = {
  /**
   * Generates a PDF report from a hidden or visible element
   */
  async generatePDF(elementId: string, projectName: string) {
    const element = document.getElementById(elementId);
    if (!element) return;

    // Use a higher scale for printing quality
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: element.scrollWidth,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'letter');
    
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Total height of the captured image in mm relative to PDF width
    const totalImgHeightInPDF = (imgProps.height * pdfWidth) / imgProps.width;
    
    let heightLeft = totalImgHeightInPDF;
    let position = 0;

    // First Page
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalImgHeightInPDF);
    heightLeft -= pdfHeight;

    // Subsequent Pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - totalImgHeightInPDF;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalImgHeightInPDF);
      heightLeft -= pdfHeight;
    }

    return pdf;
  },

  /**
   * Real sync with Google Sheets via Apps Script Web App.
   */
  async syncToSheets(data: any) {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    if (!backendUrl) {
      console.warn('VITE_BACKEND_URL no está definida. Usando modo offline.');
      return { success: true, offline: true };
    }

    try {
      console.log('Sincronizando con Google Sheets...', data);
      const response = await fetch(backendUrl, {
        method: 'POST',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // Using text/plain to avoid preflight in some cases
        },
        body: JSON.stringify({
          type: 'SYNC_STUDY',
          payload: data
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error al sincronizar con el backend:', error);
      throw error;
    }
  },

  /**
   * Formats WhatsApp message
   */
  getWhatsAppShareUrl(data: any) {
    const areasText = data.areas.map((a: any) => {
      const avgLux = a.readings.reduce((sum: number, r: any) => sum + (r.illuminanceDiurnal || r.illuminance || 0), 0) / a.readings.length;
      return `*${a.name}*: Avg ${avgLux.toFixed(1)} Lux (${avgLux >= a.standardLux ? 'CONFORME' : 'NO CONFORME'})`;
    }).join('\n');
    const text = `*Reporte de Iluminancia Lumex Study*\n\nProyecto: ${data.projectName}\nEmpresa: ${data.company}\nFecha: ${data.date}\n\n*Resumen por Áreas:*\n${areasText}\n\nPuede ver el reporte detallado en el sistema.`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  },

  /**
   * Formats email message with PDF attachment
   */
  getEmailShareUrl(data: any) {
    const subject = `Reporte de Iluminancia - ${data.projectName}`;
    const body = `Estimado/a,\n\nAdjunto encontrarás el reporte de iluminancia para el proyecto:\n${data.projectName}\n\nEmpresa: ${data.company}\nFecha: ${data.date}\n\nSaludos cordiales.`;
    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  },

  /**
   * Fetches projects from the backend.
   */
  async getProjects() {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    if (!backendUrl) return [];

    try {
      const response = await fetch(`${backendUrl}?action=GET_PROJECTS`, {
        redirect: 'follow'
      });
      const result = await response.json();
      return result.projects || [];
    } catch (error) {
      console.error('Error al obtener proyectos:', error);
      return [];
    }
  },

  /**
   * Fetches settings (Contractors and Clients) from the backend.
   */
  async getSettings() {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    if (!backendUrl) return { contractors: [], clients: [] };

    try {
      const response = await fetch(`${backendUrl}?action=GET_SETTINGS`, {
        redirect: 'follow'
      });
      const result = await response.json();
      return result || { contractors: [], clients: [] };
    } catch (error) {
      console.error('Error al obtener configuraciones:', error);
      return { contractors: [], clients: [] };
    }
  },

  /**
   * Persistence: Save Draft
   */
  async saveDraft(data: any) {
    const drafts = JSON.parse(localStorage.getItem('lumex_study_drafts') || '[]');
    const draftId = data.draftId || Date.now().toString();
    const newData = { ...data, draftId, lastUpdated: new Date().toISOString() };
    
    const existingIndex = drafts.findIndex((d: any) => d.draftId === draftId);
    if (existingIndex >= 0) {
      drafts[existingIndex] = newData;
    } else {
      drafts.push(newData);
    }
    
    localStorage.setItem('lumex_study_drafts', JSON.stringify(drafts));
    return draftId;
  },

  /**
   * Persistence: Get Drafts
   */
  async getDrafts() {
    return JSON.parse(localStorage.getItem('lumex_study_drafts') || '[]');
  },

  /**
   * Persistence: Delete Draft
   */
  async deleteDraft(draftId: string) {
    const drafts = JSON.parse(localStorage.getItem('lumex_study_drafts') || '[]');
    const filtered = drafts.filter((d: any) => d.draftId !== draftId);
    localStorage.setItem('lumex_study_drafts', JSON.stringify(filtered));
  }
};
