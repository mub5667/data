import XLSX from 'xlsx';
import { randomUUID } from 'crypto';
import type { AbeerRecord, DataRecord, CommissionRecord, InvoiceRecord, AdvBillRecord, BonusRecord, RegistrationRecord } from '@shared/schema';

function excelDateToString(serial: number): string {
  if (!serial || typeof serial !== 'number') return '';
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  return date_info.toISOString().split('T')[0];
}

export function loadAbeerData(): AbeerRecord[] {
  const workbook = XLSX.readFile('attached_assets/ABEER 2025_1759717117628.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  return data.map((row: any) => ({
    id: randomUUID(),
    month: row[' '] || '',
    incomeMalaysia: row['INCOME MALAYSIA'] || 0,
    totalIncome: row['TOTAL INCOME'] || 0,
    malaysiaOffice: row['MALAYSIA OFFICE'] || 0,
    salaries: row['SALARIES '] || 0,
    subAgent: row['SUB AGENT '] || 0,
    socialMedia: row['SOCIAL MEDIA'] || 0,
    totalOutcome: row['TOTAL OUTCOME'] || 0,
  }));
}

export function loadDataRecords(): DataRecord[] {
  const workbook = XLSX.readFile('attached_assets/DATA 2025_1759717117629.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  return data.map((row: any) => ({
    id: randomUUID(),
    month: row['Month'] || '',
    no: row['No'] || 0,
    name: row['Name'] || '',
    uni: row['Uni'] || '',
    program: row['Program'] || '',
  }));
}

export function loadCommissionData(): CommissionRecord[] {
  const workbook = XLSX.readFile('attached_assets/COMMISSION 24_1759717117630.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  return data.map((row: any) => ({
    id: randomUUID(),
    no: row['NO.'] || 0,
    university: row['UNIVERSITY'] || '',
    ref: row['REF'] || '',
    receivedDate: excelDateToString(row['RECEIVED DATE']),
    amount: row['AMOUNT'] || '',
    invoiceDate: excelDateToString(row['INVOICE DATE']),
    notes: row['__EMPTY'] || '',
  }));
}

export function loadInvoiceData(): InvoiceRecord[] {
  const workbook = XLSX.readFile('attached_assets/INVOICES_1759717117630.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  return data.map((row: any) => ({
    id: randomUUID(),
    no: row['NO.'] || 0,
    uni: row['UNI'] || '',
    type: row['TYPE'] || '',
    date: excelDateToString(row['DATE']),
  }));
}

export function loadAdvBillData(): AdvBillRecord[] {
  const workbook = XLSX.readFile('attached_assets/ADV BILLS 2025 - 2026.xlsx');
  const sheet = workbook.Sheets['ADV Bills'] || workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  return data.map((row: any) => ({
    id: randomUUID(),
    no: row['No'] || row['NO'] || 0,
    billId: String(row['Bill id'] || row['Bill ID'] || row['BILL ID'] || ''),
    date: excelDateToString(row['Date']),
    description: String(row['Description'] || ''),
    amount: Number(row['Amount'] || row['AMOUNT'] || 0),
  }));
}

export function loadSubagentData(): any[] {
  const workbook = XLSX.readFile('attached_assets/ADV BILLS 2025 - 2026.xlsx');
  const sheet = workbook.Sheets['Subagent'];
  if (!sheet) return [];
  const data = XLSX.utils.sheet_to_json(sheet);
  return data.map((row: any) => ({
    id: randomUUID(),
    no: row['No'] || row['NO'] || 0,
    subagentName: String(row['Subagent name'] || row['Subagent Name'] || ''),
    date: excelDateToString(row['Date']),
    ref: String(row['REF'] || ''),
    referralCommissionOn: String(row['Referral commission on'] || ''),
    amount: Number(row['Amount'] || row['AMOUNT'] || 0),
    month: String(row['month'] || row['Month'] || ''),
  }));
}

export function loadBonusData(): BonusRecord[] {
  const workbook = XLSX.readFile('attached_assets/BONUS 2024_1759717117632.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  return data.map((row: any) => ({
    id: randomUUID(),
    no: row['No'] || 0,
    name: row['Name'] || '',
    uni: row['Uni'] || '',
    passportNumber: row['Passport Number'] || '',
    nationality: row['Nationality'] || '',
    visa: String(row['Visa '] || ''),
    counselor: row['Counselor'] || '',
    program: row['Program'] || '',
    intake: excelDateToString(row['Intake']),
    tuitionFeesPayment: row['Tutition fees Payment'] || '',
    enrollment: row['Enrollment'] || '',
    commission: row['Commission'] || '',
    usd: row['USD'] || 0,
  }));
}

export function loadBonusClaimedData(): any[] {
  try {
    const workbook = XLSX.readFile('attached_assets/BONUS 2024_1759717117632.xlsx');
    // Try to get the "Claimed" sheet, if it exists
    const sheetName = workbook.SheetNames.find(name => name.toLowerCase().includes('claimed'));
    
    if (!sheetName) {
      console.warn('No "Claimed" sheet found in BONUS 2024 Excel file');
      return [];
    }
    
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);
    
    return data.map((row: any) => ({
      id: randomUUID(),
      no: row['No'] || 0,
      name: row['Name'] || '',
      uni: row['Uni'] || '',
      passportNumber: row['Passport Number'] || '',
      nationality: row['Nationality'] || '',
      visa: String(row['Visa '] || ''),
      counselor: row['Counselor'] || '',
      program: row['Program'] || '',
      intake: excelDateToString(row['Intake']),
      tuitionFeesPayment: row['Tutition fees Payment'] || '',
      enrollment: row['Enrollment'] || '',
      commission: row['Commission'] || '',
      rm: row['RM'] || 0,
      usd: row['USD'] || 0,
      claimedDate: excelDateToString(row['Claimed Date']),
      claimedBy: row['Claimed By'] || '',
    }));
  } catch (error) {
    console.error('Error loading claimed bonus data:', error);
    return [];
  }
}

export function loadBonusNotClaimedData(): any[] {
  try {
    const workbook = XLSX.readFile('attached_assets/BONUS 2024_1759717117632.xlsx');
    // Try to get the "Not Claimed" sheet, if it exists
    const sheetName = workbook.SheetNames.find(name => name.toLowerCase().includes('not claimed'));
    
    if (!sheetName) {
      console.warn('No "Not Claimed" sheet found in BONUS 2024 Excel file');
      return [];
    }
    
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);
    
    return data.map((row: any) => ({
      id: randomUUID(),
      no: row['No'] || 0,
      name: row['Name'] || '',
      uni: row['Uni'] || '',
      passportNumber: row['Passport Number'] || '',
      nationality: row['Nationality'] || '',
      visa: String(row['Visa '] || ''),
      counselor: row['Counselor'] || '',
      program: row['Program'] || '',
      intake: excelDateToString(row['Intake']),
      tuitionFeesPayment: row['Tutition fees Payment'] || '',
      enrollment: row['Enrollment'] || '',
      commission: row['Commission'] || '',
      rm: row['RM'] || 0,
      usd: row['USD'] || 0,
    }));
  } catch (error) {
    console.error('Error loading not claimed bonus data:', error);
    return [];
  }
}

export function loadRegistrationData(): RegistrationRecord[] {
  const workbook = XLSX.readFile('attached_assets/Registeration Form 2025_1759717117632.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  return data.map((row: any) => ({
    id: randomUUID(),
    no: row['No'] || 0,
    name: row['Name'] || '',
    uni: row['Uni'] || '',
    passportNumber: row['Passport Number'] || '',
    nationality: row['Nationality'] || '',
    visa: row['Visa '] || '',
    valApproval: excelDateToString(row['VAL Approval']),
    counselor: row['Counselor'] || '',
    program: row['Program'] || '',
    submissionMonth: excelDateToString(row['Submission Month']),
    paidMonth: excelDateToString(row['Paid Month']),
    arrivalDate: excelDateToString(row['Arrival Date']),
  }));
}

export function loadAgentBonusData(agentName: string): any[] {
  try {
    const workbook = XLSX.readFile('attached_assets/BONUS 2024_1759717117632.xlsx');
    
    // Find the sheet that matches the agent name
    const sheetName = workbook.SheetNames.find(name => 
      name.toLowerCase() === agentName.toLowerCase() ||
      name.toLowerCase().includes(agentName.toLowerCase())
    );
    
    if (!sheetName) {
      console.warn(`No sheet found for agent "${agentName}" in BONUS 2024 Excel file`);
      return [];
    }
    
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);
    
    return data.map((row: any) => ({
      id: randomUUID(),
      month: row['Month'] || '',
      no: row['No'] || 0,
      name: row['Name'] || '',
      uni: row['Uni'] || '',
      program: row['Program'] || '',
      enrollment: row['Enrollment'] || '',
      visaBonus: row['Visa Bonus'] || 0,
      enrollmentBonus: row['Enrollment Bonus'] || 0,
      commFromUni: row['Comm from Uni'] || 0,
      passportNumber: row['Passport Number'] || '',
    }));
  } catch (error) {
    console.error(`Error loading bonus data for agent "${agentName}":`, error);
    return [];
  }
}

export function getAvailableAgentSheets(): string[] {
  try {
    const workbook = XLSX.readFile('attached_assets/BONUS 2024_1759717117632.xlsx');
    
    // Filter out sheets that are not agent-specific (like "Claimed", "Not Claimed", etc.)
    const nonAgentSheets = ['claimed', 'not claimed', 'not submitted', 'cancelled', 'val approved', 'enrollment', 'visa process'];
    
    return workbook.SheetNames.filter(name => 
      !nonAgentSheets.some(nonAgent => name.toLowerCase().includes(nonAgent))
    );
  } catch (error) {
    console.error('Error getting available agent sheets:', error);
    return [];
  }
}
