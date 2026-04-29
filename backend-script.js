/**
 * ERGOLUX PRO - Google Sheets Backend
 * This script should be deployed as a Web App with "Anyone" access.
 */

// CONFIGURATION: Replace with your Spreadsheet ID or leave as null to use the bound spreadsheet
const SPREADSHEET_ID_OVERRIDE = null; 

function getSpreadsheet() {
  if (SPREADSHEET_ID_OVERRIDE) {
    return SpreadsheetApp.openById(SPREADSHEET_ID_OVERRIDE);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function doPost(e) {
  try {
    const contents = e.postData ? e.postData.contents : null;
    if (!contents) {
      throw new Error('No post data received');
    }
    const data = JSON.parse(contents);
    const ss = getSpreadsheet();
    
    if (data.type === 'SYNC_STUDY') {
      return syncStudy(ss, data.payload);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Unknown action' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const ss = getSpreadsheet();
    const action = e.parameter.action;
    
    if (action === 'GET_SETTINGS') {
      return getSettings(ss);
    }
    
    if (action === 'GET_PROJECTS') {
      return getProjects(ss);
    }

    if (action === 'TEST') {
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Backend connected!', spreadsheetName: ss.getName() }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Unknown action: ' + action }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString(), stack: err.stack }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function syncStudy(ss, payload) {
  const projectSheet = ss.getSheetByName('Projects');
  const areaSheet = ss.getSheetByName('Areas');
  const readingSheet = ss.getSheetByName('Readings');
  
  const projectId = 'PROJ_' + Date.now();
  
  // 1. Save Project
  projectSheet.appendRow([
    projectId,
    payload.projectName,
    payload.company,
    payload.date,
    payload.status,
    payload.samplingType,
    JSON.stringify(payload.selectedStandards),
    JSON.stringify(payload.equipmentUsed),
    payload.executiveSummary || '',
    payload.conclusions || '',
    payload.recommendations || '',
    new Date().toISOString()
  ]);
  
  // 2. Save Areas & Readings
  payload.areas.forEach(area => {
    const areaId = 'AREA_' + Math.random().toString(36).substr(2, 9);
    areaSheet.appendRow([
      areaId,
      projectId,
      area.name,
      area.standardLux
    ]);
    
    area.readings.forEach(reading => {
      readingSheet.appendRow([
        'READ_' + Math.random().toString(36).substr(2, 9),
        areaId,
        reading.pointName,
        reading.department || '',
        reading.visualRequirement || 'medium',
        reading.illuminance,
        reading.illuminanceDiurnal || 0,
        reading.illuminanceNocturnal || 0,
        reading.lightType,
        reading.lampType || '',
        reading.lampCount || 0,
        reading.operativeLamps || 0,
        reading.nonOperativeLamps || 0,
        reading.latitude || 0,
        reading.longitude || 0,
        reading.photo || '',
        reading.observation || ''
      ]);
    });
  });
  
  return ContentService.createTextOutput(JSON.stringify({ success: true, projectId }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSettings(ss) {
  const contractorSheet = ss.getSheetByName('Contractors');
  const clientSheet = ss.getSheetByName('Clients');
  
  let cList = [];
  try {
    const contractors = contractorSheet.getDataRange().getValues();
    const cHeaders = contractors.shift();
    if (contractors.length > 0) {
      cList = contractors.map(row => {
        let obj = {};
        cHeaders.forEach((h, i) => {
          if (h === 'technicians') {
            try { obj[h] = JSON.parse(row[i]); } catch(e) { obj[h] = []; }
          } else {
            obj[h] = row[i];
          }
        });
        return obj;
      });
    }
  } catch(e) {}

  let clList = [];
  try {
    const clients = clientSheet.getDataRange().getValues();
    const clHeaders = clients.shift();
    if (clients.length > 0) {
      clList = clients.map(row => {
        let obj = {};
        clHeaders.forEach((h, i) => {
           if (h === 'technicians') {
            try { obj[h] = JSON.parse(row[i]); } catch(e) { obj[h] = []; }
          } else {
            obj[h] = row[i];
          }
        });
        return obj;
      });
    }
  } catch(e) {}
  
  return ContentService.createTextOutput(JSON.stringify({ contractors: cList, clients: clList }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getProjects(ss) {
  const projectSheet = ss.getSheetByName('Projects');
  try {
    const data = projectSheet.getDataRange().getValues();
    const headers = data.shift();
    
    const projects = data.map(row => {
      let obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });
    
    return ContentService.createTextOutput(JSON.stringify({ success: true, projects }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(e) {
    return ContentService.createTextOutput(JSON.stringify({ success: true, projects: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Run this once to setup sheets
 */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const sheets = ['Projects', 'Areas', 'Readings', 'Contractors', 'Clients'];
  sheets.forEach(name => {
    if (!ss.getSheetByName(name)) {
      ss.insertSheet(name);
    }
  });
  
  // Set Headers
  ss.getSheetByName('Projects').getRange(1, 1, 1, 12).setValues([[
    'ProjectID', 'ProjectName', 'Company', 'Date', 'Status', 'SamplingType', 'Standards', 'Equipment', 'Summary', 'Conclusions', 'Recommendations', 'CreatedAt'
  ]]).setFontWeight('bold');
  
  ss.getSheetByName('Areas').getRange(1, 1, 1, 4).setValues([[
    'AreaID', 'ProjectID', 'AreaName', 'StandardLux'
  ]]).setFontWeight('bold');
  
  ss.getSheetByName('Readings').getRange(1, 1, 1, 17).setValues([[
    'ReadingID', 'AreaID', 'PointName', 'Department', 'VisualReq', 'Illuminance', 'IlluminanceDiurnal', 'IlluminanceNocturnal', 'LightType', 'LampType', 'LampCount', 'OperativeLamps', 'NonOperativeLamps', 'Lat', 'Lng', 'PhotoURL', 'Observations'
  ]]).setFontWeight('bold');

  ss.getSheetByName('Contractors').getRange(1, 1, 1, 7).setValues([[
    'id', 'name', 'address', 'phone', 'email', 'contactPerson', 'technicians'
  ]]).setFontWeight('bold');

  ss.getSheetByName('Clients').getRange(1, 1, 1, 7).setValues([[
    'id', 'name', 'address', 'phone', 'email', 'contactPerson', 'technicians'
  ]]).setFontWeight('bold');
}
