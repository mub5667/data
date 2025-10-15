import XLSX from 'xlsx';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import type { 
  AbeerRecord, DataRecord, CommissionRecord, InvoiceRecord, 
  AdvBillRecord, BonusRecord, RegistrationRecord,
  BonusClaimedRecord, BonusNotClaimedRecord,
  AgentRecord, AgentBonusRecord, StudentRecord
} from '@shared/schema';
import { sqliteStorage } from './db';

function excelDateToString(serial: number): string {
  if (!serial || typeof serial !== 'number') return '';
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  return date_info.toISOString().split('T')[0];
}

export async function loadAbeerDataToSQLite(): Promise<void> {
  const workbook = XLSX.readFile('attached_assets/ABEER 2025_1759717117628.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  for (const row of data) {
    await sqliteStorage.addAbeerRecord({
      month: row[' '] || '',
      incomeMalaysia: row['INCOME MALAYSIA'] || 0,
      totalIncome: row['TOTAL INCOME'] || 0,
      malaysiaOffice: row['MALAYSIA OFFICE'] || 0,
      salaries: row['SALARIES '] || 0,
      subAgent: row['SUB AGENT '] || 0,
      socialMedia: row['SOCIAL MEDIA'] || 0,
      totalOutcome: row['TOTAL OUTCOME'] || 0,
    });
  }
  
  console.log('Abeer data loaded to SQLite');
}

export async function loadIncomeOutcomeDataToSQLite(): Promise<void> {
  try {
    // Using the existing ABEER 2025 Excel file
    const workbook = XLSX.readFile('attached_assets/ABEER 2025_1759717117628.xlsx');
    
    // Helper to robustly read numeric columns across inconsistent headers
    const getNumber = (row: any, keys: string[]): number => {
      for (const k of keys) {
        if (Object.prototype.hasOwnProperty.call(row, k) && row[k] !== undefined && row[k] !== null && row[k] !== '') {
          const v = row[k];
          const n = typeof v === 'string' ? Number(v.replace(/[,\s]/g, '')) : Number(v);
          if (!Number.isNaN(n)) return n;
        }
      }
      return 0;
    };

    const getDateStr = (row: any): string => {
      const dateRaw = row['DATE'] ?? row['Date'] ?? row['DATE '] ?? row['date'] ?? row['MONTH'] ?? row['Month'];
      if (!dateRaw) return new Date().toISOString().split('T')[0];
      return typeof dateRaw === 'number' ? excelDateToString(dateRaw) : String(dateRaw);
    };

    // Process Malaysia sheet - all columns
    if (workbook.SheetNames.includes('Malaysia')) {
      const malaysiaSheet = workbook.Sheets['Malaysia'];
      const malaysiaData = XLSX.utils.sheet_to_json(malaysiaSheet, { defval: '' }) as any[];
      
      let counter = 1;
      for (const r of malaysiaData) {
        const row: any = r;
        const date = getDateStr(row);
        
        await sqliteStorage.addIncomeOutcomeRecord({
          no: counter++,
          date: date,
          country: 'Malaysia',
          income: getNumber(row, ['INCOME', 'INCOME ', 'TOTAL INCOME', 'INCOME MALAYSIA', 'TOTAL INCOME MALAYSIA']),
          office: getNumber(row, ['OFFICE', 'OFFICE ', 'MALAYSIA OFFICE', 'OFFICE MALAYSIA']),
          salaries: getNumber(row, ['SALARIES', 'SALARIES ']),
          subagent: getNumber(row, ['SUB AGENT', 'SUB AGENT ', 'Sub Agent']),
          socialmedia: getNumber(row, ['SOCIAL MEDIA', 'Social Media']),
          outcome: getNumber(row, ['OUTCOME', 'OUTCOME ', 'OUT COME', 'TOTAL OUTCOME', 'TOTAL OUTCOME MALAYSIA']),
        });
      }
      console.log('Malaysia Income & Outcome data loaded to SQLite');
    }
    
    // Process Egypt sheet - limited columns
    if (workbook.SheetNames.includes('Egypt')) {
      const egyptSheet = workbook.Sheets['Egypt'];
      const egyptData = XLSX.utils.sheet_to_json(egyptSheet, { defval: '' }) as any[];
      
      let counter = 1;
      for (const r of egyptData) {
        const row: any = r;
        const date = getDateStr(row);
        
        await sqliteStorage.addIncomeOutcomeRecord({
          no: counter++,
          date: date,
          country: 'Egypt',
          income: getNumber(row, ['INCOME', 'INCOME ', 'TOTAL INCOME', 'INCOME EGYPT', 'TOTAL INCOME EGYPT']),
          office: 0, // Not displayed for Egypt
          salaries: 0, // Not displayed for Egypt
          subagent: 0, // Not displayed for Egypt
          socialmedia: 0, // Not displayed for Egypt
          outcome: getNumber(row, ['OUTCOME', 'OUTCOME ', 'OUT COME', 'TOTAL OUTCOME']),
        });
      }
      console.log('Egypt Income & Outcome data loaded to SQLite');
    }
    
    // Process UAE sheet - limited columns
    if (workbook.SheetNames.includes('UAE')) {
      const uaeSheet = workbook.Sheets['UAE'];
      const uaeData = XLSX.utils.sheet_to_json(uaeSheet);
      
      let counter = 1;
      for (const row of uaeData) {
        const date = row['DATE'] ? 
          (typeof row['DATE'] === 'number' ? excelDateToString(row['DATE']) : row['DATE']) : 
          (row['MONTH'] || new Date().toISOString().split('T')[0]);
        
        await sqliteStorage.addIncomeOutcomeRecord({
          no: counter++,
          date: date,
          country: 'UAE',
          income: row['INCOME'] || 0,
          office: 0, // Not displayed for UAE
          salaries: 0, // Not displayed for UAE
          subagent: 0, // Not displayed for UAE
          socialmedia: 0, // Not displayed for UAE
          outcome: row['OUTCOME'] || row['TOTAL OUTCOME'] || 0,
        });
      }
      console.log('UAE Income & Outcome data loaded to SQLite');
    }
    
    // Process Saudi Arabia sheet - limited columns
    if (workbook.SheetNames.includes('SAUDI')) {
      const saudiSheet = workbook.Sheets['SAUDI'];
      const saudiData = XLSX.utils.sheet_to_json(saudiSheet, { defval: '' }) as any[];
      
      let counter = 1;
      for (const r of saudiData) {
        const row: any = r;
        const date = getDateStr(row);
        
        await sqliteStorage.addIncomeOutcomeRecord({
          no: counter++,
          date: date,
          country: 'Saudi Arabia',
          income: getNumber(row, ['INCOME', 'INCOME ', 'TOTAL INCOME', 'INCOME SAUDI', 'INCOME SAUDI ARABIA', 'INCOME KSA']),
          office: 0, // Not displayed for Saudi Arabia
          salaries: 0, // Not displayed for Saudi Arabia
          subagent: 0, // Not displayed for Saudi Arabia
          socialmedia: 0, // Not displayed for Saudi Arabia
          outcome: getNumber(row, ['OUTCOME', 'OUTCOME ', 'OUT COME', 'TOTAL OUTCOME', 'OUTCOME SAUDI', 'OUTCOME SAUDI ARABIA', 'OUTCOME KSA']),
        });
      }
      console.log('Saudi Arabia Income & Outcome data loaded to SQLite');
    }
    
    console.log('All Income & Outcome data loaded to SQLite');
  } catch (error) {
    console.error('Error loading Income & Outcome data:', error);
  }
}

export async function loadDataRecordsToSQLite(): Promise<void> {
  const workbook = XLSX.readFile('attached_assets/DATA 2025_1759717117629.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  for (const row of data) {
    await sqliteStorage.addDataRecord({
      month: row['Month'] || '',
      no: row['No'] || 0,
      name: row['Name'] || '',
      uni: row['Uni'] || '',
      program: row['Program'] || '',
    });
  }
  
  console.log('Data records loaded to SQLite');
}

export async function loadCommissionDataToSQLite(): Promise<void> {
  const workbook = XLSX.readFile("attached_assets/COMMISSION 24_1759717117630.xlsx");
  const sheetNames = workbook.SheetNames;

  for (const sheetName of sheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    console.log(`Processing sheet: ${sheetName} (${data.length} rows)`);

    for (const row of data) {
      await sqliteStorage.addCommissionRecord({
        no: row["NO."] || 0,
        university: row["UNIVERSITY"] || "",
        ref: row["REF"] || "", // static value for this file
        month: sheetName, // sheet name as month value
        otherIncome: row["OTHER INCOME"] || 0,
        receivedDate: excelDateToString(row["RECEIVED DATE"]),
        currency: "RM",
        amount: row["AMOUNT"] || 0,
        invoiceDate: excelDateToString(row["INVOICE DATE"]),
        notes: row["__EMPTY"] || "",
      });
    }
  }

  console.log("✅ All commission sheets loaded into SQLite");
}

export async function loadInvoiceDataToSQLite(): Promise<void> {
  const workbook = XLSX.readFile('attached_assets/INVOICES_1759717117630.xlsx');
  
  // Process main invoice sheet
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  for (const row of data) {
    await sqliteStorage.addInvoiceRecord({
      no: row['NO.'] || 0,
      uni: row['UNI'] || '',
      type: row['TYPE'] || '',
      date: excelDateToString(row['DATE']),
    });
  }
  
  // Process SENT sheet
  if (workbook.SheetNames.includes('SENT')) {
    const sentSheet = workbook.Sheets['SENT'];
    const sentData = XLSX.utils.sheet_to_json(sentSheet);
    
    for (const row of sentData) {
      await sqliteStorage.addSentInvoiceRecord({
        no: row['NO'] || row['NO.'] || 0,
        uni: row['UNI'] || '',
        type: row['TYPE'] || '',
        date: excelDateToString(row['DATE']),
        drHaniAccount: row['DR. HANI ACC'] || 0,
        currency: row['Currency'] || '',
        amount: row[' AMOUNT'] || row['AMOUNT'] || row['Amount'] || 0,
        applyuni: row['APPLYUNI'] || '',
      });
    }
    
    console.log('Sent Invoices data loaded to SQLite');
  }
  
  // Process UCSI sheet
  if (workbook.SheetNames.includes('UCSI')) {
    const ucsiSheet = workbook.Sheets['UCSI'];
    const ucsiData = XLSX.utils.sheet_to_json(ucsiSheet);
    
    for (const row of ucsiData) {
      await sqliteStorage.addUcsiRecord({
        no: row['NO.'] || 0,
        uni: row['UNI'] || '',
        type: row['TYPE'] || '',
        date: excelDateToString(row['DATE']),
        drHaniAccount: row['DR. HANI ACC'] || 0,
        currency: row['Currency'] || '',
        amount: row['AMOUNT'] || row['Amount'] || 0,
      });
    }
    
    console.log('UCSI data loaded to SQLite');
  }
  
  // Process UCSI INVOICES sheet
  if (workbook.SheetNames.includes('UCSI INVOICES')) {
    const ucsiInvoicesSheet = workbook.Sheets['UCSI INVOICES'];
    const ucsiInvoicesData = XLSX.utils.sheet_to_json(ucsiInvoicesSheet);
    
    for (const row of ucsiInvoicesData) {
      await sqliteStorage.addUcsiInvoiceRecord({
        no: row['NO'] || 0,
        uni: row['UNI'] || '',
        type: row['TYPE '] || row['TYPE'] || '',
        date: excelDateToString(row['DATE']),
        currency: row['Currency'] || '',
        amount: row[' AMOUNT'] || row['AMOUNT'] || row['Amount'] || 0,
        receivedDate: excelDateToString(row['Received Date']),
      });
    }
    
    console.log('UCSI Invoices data loaded to SQLite');
  }
  
  console.log('All Invoice data loaded to SQLite');
}

export async function loadAdvBillDataToSQLite(): Promise<void> {
  const workbook = XLSX.readFile('attached_assets/ADV BILLS 2025 - 2026.xlsx');
  // ADV Bills sheet
  if (workbook.SheetNames.includes('ADV Bills')) {
    const sheet = workbook.Sheets['ADV Bills'];
    const data = XLSX.utils.sheet_to_json(sheet);
    for (const row of data) {
      await sqliteStorage.addAdvBillRecord({
        no: row['No'] || row['NO'] || 0,
        billId: String(row['Bill id'] || ''),
        date: excelDateToString(row['Date'] as any),
        description: String(row['Description'] || ''),
        amount: Number(row['Amount spend'] || row['Amount'] || row['AMOUNT'] || 0),
      });
    }
    console.log('ADV Bills sheet loaded to SQLite');
  }

  // Subagent sheet
  if (workbook.SheetNames.includes('Subagent')) {
    const sheet = workbook.Sheets['Subagent'];
    const data = XLSX.utils.sheet_to_json(sheet);
    for (const row of data) {
      await sqliteStorage.addSubagentRecord({
        no: row['NO'] || 0,
        subagentName: String(row['Sub Agent\r\n Name'] || row['Sub Agent Name'] || row['Subagent name'] || row['Subagent Name'] || ''),
        date: excelDateToString(row['Date'] as any),
        ref: String(row['REF'] || ''),
        referralCommissionOn: String(row['Referral Commission On'] || ''),
        amount: Number(row['Amount'] || row['AMOUNT'] || 0),
        month: String(row['month'] || row['Month'] || ''),
      });
    }
    console.log('Subagent sheet loaded to SQLite');
  }
}


// Helper function to find or create an agent


export async function loadBonusDataToSQLite(): Promise<void> {
  const workbook = XLSX.readFile('attached_assets/BONUS 2024_1759717117632.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  for (const row of data) {
    await sqliteStorage.addBonusRecord({
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
    });
  }
  
  console.log('Bonus data loaded to SQLite');
}

export async function loadAgentBonusDataToSQLite(): Promise<void> {
  try {
    const workbook = XLSX.readFile('attached_assets/BONUS 2024_1759717117632.xlsx');
    const sheetNames = workbook.SheetNames;
    
    // Get all agent sheets (excluding the main sheet)
    const agentSheets = sheetNames.filter(name => 
      !name.toLowerCase().includes('claimed') && 
      !name.toLowerCase().includes('not claimed') &&
      name !== sheetNames[0]
    );
    
    // First, ensure all agents exist in the database
    for (const agentName of agentSheets) {
      // Check if agent exists
      const existingAgent = await sqliteStorage.getAgentByName(agentName);
      
      // If agent doesn't exist, create it
      if (!existingAgent) {
        await sqliteStorage.addAgentRecord({
          name: agentName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        console.log(`Created agent: ${agentName}`);
      }
    }
    
    // Now process each agent's sheet
    for (const agentName of agentSheets) {
      const sheet = workbook.Sheets[agentName];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      // Get agent ID
      const agent = await sqliteStorage.getAgentByName(agentName);
      
      if (!agent) {
        console.log(`Agent ${agentName} not found, skipping`);
        continue;
      }
      
      // Process each row in the sheet
      for (const row of data) {
        await sqliteStorage.addAgentBonusRecord({
          agentId: agent.id,
          studentName: row['Name'] || '',
          uni: row['Uni'] || '',
          program: row['Program'] || '',
          month: row['Month'] || '',
          enrollment: row['Enrollment'] || '',
          enrollmentBonus: (row['Enrollment Bonus'] || '0'),
          visaBonus: (row['Visa Bonus'] || '0'),
          commissionFromUni: (row['Comm from Uni'] || ''),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      console.log(`Processed ${data.length} bonus records for agent ${agentName}`);
    }
    
    console.log('Agent bonus data loaded to SQLite');
  } catch (error) {
    console.error('Error loading agent bonus data:', error);
  }
}

export async function loadBonusClaimedDataToSQLite(): Promise<void> {
  const workbook = XLSX.readFile('attached_assets/BONUS 2024_1759717117632.xlsx');
  const sheetNames = workbook.SheetNames;
  
  // Look for a sheet named "claimed" or similar
  const claimedSheetName = sheetNames.find(name => 
    name.toLowerCase().includes('claimed') && !name.toLowerCase().includes('not claimed')
  );
  
  if (!claimedSheetName) {
    console.log('No claimed bonus sheet found in the Excel file');
    return;
  }
  
  const sheet = workbook.Sheets[claimedSheetName];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  for (const row of data) {
    await sqliteStorage.addBonusClaimedRecord({
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
      claimedDate: excelDateToString(row['Claimed Date']) || new Date().toISOString().split('T')[0],
      claimedBy: row['Claimed By'] || '',
    });
  }
  
  console.log(`Loaded ${data.length} claimed bonus records into SQLite`);
}

export async function loadBonusNotClaimedDataToSQLite(): Promise<void> {
  const workbook = XLSX.readFile('attached_assets/BONUS 2024_1759717117632.xlsx');
  const sheetNames = workbook.SheetNames;
  
  // Look for a sheet named "not claimed" or similar
  const notClaimedSheetName = sheetNames.find(name => 
    name.toLowerCase().includes('not claimed')
  );
  
  if (!notClaimedSheetName) {
    console.log('No not claimed bonus sheet found in the Excel file');
    return;
  }
  
  const sheet = workbook.Sheets[notClaimedSheetName];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  for (const row of data) {
    await sqliteStorage.addBonusNotClaimedRecord({
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
    });
  }
  
  console.log(`Loaded ${data.length} not claimed bonus records into SQLite`);
}

export async function loadRegistrationDataToSQLite(): Promise<void> {
  const workbook = XLSX.readFile('attached_assets/Registeration Form 2025_1759717117632.xlsx');
  
  // Process each sheet separately
  const sheetNames = workbook.SheetNames;
  
  // Process Val Approved sheet
  if (sheetNames.includes('Val Approved')) {
    const worksheet = workbook.Sheets['Val Approved'];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    for (const row of data) {
      await sqliteStorage.addRegistrationValApprovedRecord({
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
        note: row['NOTE'] || '',
        sheetType: 'Val Approved'
      });
      
      // Also add to the legacy registration table for backward compatibility
      await sqliteStorage.addRegistrationRecord({
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
        sheetType: 'Val Approved'
      });
    }
    
    console.log(`Loaded ${data.length} Val Approved Registration records into SQLite`);
  }
  
  // Process Enrollment sheet
  if (sheetNames.includes('Enrollment')) {
    const worksheet = workbook.Sheets['Enrollment'];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    for (const row of data) {
      await sqliteStorage.addRegistrationEnrollmentRecord({
        almo: row['almo'] || 0,
        name: row['Name'] || '',
        uni: row['Uni'] || '',
        passportNumber: row['Passport Number'] || '',
        nationality: row['Nationality'] || '',
        visa: row['Visa '] || '',
        counselor: row['Counselor'] || '',
        program: (row as any)['Program'] || '',
        intake: row['Intake '] ? excelDateToString(row['Intake ']) : (row['Intake'] ? excelDateToString(row['Intake']) : ''),
        submissionMonth: excelDateToString(row['Submission Month']),
        paidMonth: excelDateToString(row['Paid Month']),
        sheetType: 'Enrollment'
      });
    }
    
    console.log(`Loaded ${data.length} Enrollment Registration records into SQLite`);
  }
  
  // Process Visa Process sheet
  if (sheetNames.includes('Visa Process')) {
    const worksheet = workbook.Sheets['Visa Process'];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    for (const row of data) {
      await sqliteStorage.addRegistrationVisaProcessRecord({
        no: row['No'] || 0,
        name: row['Name'] || '',
        uni: row['Uni'] || '',
        passportNumber: row['Passport Number'] || '',
        nationality: row['Nationality'] || '',
        visa: row['Visa'] || '',
        counselor: row['Counselor'] || '',
        program: row['Program'] || '',
        
        submissionMonth: excelDateToString(row['Submission Month']),
        paidMonth: excelDateToString(row['Paid Month']),
        note: row['NOTE'] || '',
        sheetType: 'Visa Process'
      });
    }
    
    console.log(`Loaded ${data.length} Visa Process Registration records into SQLite`);
  }
  
  // Process Not Submitted sheet
  if (sheetNames.includes('Not Submitted')) {
    const worksheet = workbook.Sheets['Not Submitted'];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    for (const row of data) {
      await sqliteStorage.addRegistrationNotSubmittedRecord({
        no: row['No'] || 0,
        name: row['Name'] || '',
        uni: row['Uni'] || '',
        passportNumber: row['Pass No.'] || '',
        nationality: '',
        program: row['Program'] || '',
        counselor: row['Counselor'] || '',
        month: typeof row['Month'] === 'number' ? excelDateToString(row['Month']) : row['Month'] || '',
        payment: row['PAYMENT'] || '',
        sheetType: 'Not Submitted'
      });
    }
    
    console.log(`Loaded ${data.length} Not Submitted Registration records into SQLite`);
  }
  
  // Process Cancelled sheet
  if (sheetNames.includes('Cancelled')) {
    const worksheet = workbook.Sheets['Cancelled'];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    for (const row of data) {
      await sqliteStorage.addRegistrationCancelledRecord({
        no: row['No'] || 0,
        name: row['Name'] || '',
        uni: row['Uni'] || '',
        program: row['Program'] || '',
        counselor: row['Counselor'] || '',
        month: typeof row['Month'] === 'number' ? excelDateToString(row['Month']) : row['Month'] || '',
        payment: row['PAYMENT'] || '',
        sheetType: 'Cancelled'
      });
    }
    
    console.log(`Loaded ${data.length} Cancelled Registration records into SQLite`);
  }
  
  console.log('Registration data loaded to SQLite');
}

export async function loadAgentDataToSQLite(): Promise<void> {
  // Predefined agents from the requirement
  const agentNames = [
    "Mamoun", "Dan", "Mokhar", "Hakam", "Ahmed KSA", 
    "Majd", "Omar", "Sara", "Mayar", "Christina"
  ];
  
  for (const name of agentNames) {
    // Check if agent already exists
    const existingAgent = await sqliteStorage.getAgentByName(name);
    if (!existingAgent) {
      await sqliteStorage.addAgent({ name });
      console.log(`Agent ${name} added to SQLite`);
    }
  }
  
  console.log('Agent data loaded to SQLite');
}

// This function was renamed to avoid duplication with the existing loadAgentBonusDataToSQLite function
// export async function loadAgentBonusData2ToSQLite(): Promise<void> {
//   // Implementation removed to avoid duplication
// }

export async function loadAbeerSheetsDataToSQLite(): Promise<void> {
  try {
    const workbook = XLSX.readFile('attached_assets/ABEER 2025_1759717117628.xlsx');
    const sheetNames = workbook.SheetNames;
    
    // Load Events data
    if (sheetNames.includes('Events')) {
      const sheet = workbook.Sheets['Events'];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      for (const row of data) {
        await sqliteStorage.addEventsRecord({
          no: row['No'] || 0,
          date: excelDateToString(row['Date']),
          uni: row['uni'] || '',
          currency: row['Currency'] || '',
          income: row['Income'] || 0,
          expenses: row['Expenses'] || 0,
          country: row['Country'] || '',
        });
      }
      console.log('Events data loaded to SQLite');
    }
    
    // Load Salaries data
    if (sheetNames.includes('Salaries')) {
      const sheet = workbook.Sheets['Salaries'];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      for (const row of data) {
        await sqliteStorage.addSalariesRecord({
          name: row['Name'] || '',
          amount: row['Amount'] || 0,
          date: excelDateToString(row['Date']),
        });
      }
      console.log('Salaries data loaded to SQLite');
    }
    
    // Load Services data
    if (sheetNames.includes('Services')) {
      const sheet = workbook.Sheets['Services'];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      for (const row of data) {
        await sqliteStorage.addServicesRecord({
          name: row['NAME'] || '',
          date: excelDateToString(row['DATE']),
          amount: row['AMOUNT'] || 0,
        });
      }
      console.log('Services data loaded to SQLite');
    }
    
    // Load Student Hotel data
    if (sheetNames.includes('Student Hotel')) {
      const sheet = workbook.Sheets['Student Hotel'];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      for (const row of data) {
        await sqliteStorage.addStudentHotelRecord({
          name: row['NAME'] || '',
          date: excelDateToString(row['DATE']),
          amount: row['AMOUNT'] || 0,
        });
      }
      console.log('Student Hotel data loaded to SQLite');
    }
    
    // Load Student Flight Ticket data
    if (sheetNames.includes('Student Flight Ticket')) {
      const sheet = workbook.Sheets['Student Flight Ticket'];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      for (const row of data) {
        await sqliteStorage.addStudentFlightTicketRecord({
          name: row['NAME'] || '',
          date: excelDateToString(row['DATE']),
          amount: row['AMOUNT'] || 0,
        });
      }
      console.log('Student Flight Ticket data loaded to SQLite');
    }
    
    // Load Authentication of Papers data
    if (sheetNames.includes('Authentication of Papers')) {
      const sheet = workbook.Sheets['Authentication of Papers'];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      for (const row of data) {
        await sqliteStorage.addAuthenticationPapersRecord({
          amount: row['AMOUNT'] || 0,
          ref: row['REF'] || '',
          date: excelDateToString(row['DATE']),
          ref1: row['REF_1'] || '',
        });
      }
      console.log('Authentication of Papers data loaded to SQLite');
    }
    
    // Load Student Visa data
    if (sheetNames.includes('Student Visa')) {
      const sheet = workbook.Sheets['Student Visa'];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      for (const row of data) {
        await sqliteStorage.addStudentVisaRecord({
          amount: row['AMOUNT'] || 0,
          date: excelDateToString(row['DATE']),
          ref: row['REF'] || '',
          uni: row['UNI'] || '',
        });
      }
      console.log('Student Visa data loaded to SQLite');
    }
    
    // Load Application Fees data
    if (sheetNames.includes('Application Fees')) {
      const sheet = workbook.Sheets['Application Fees'];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      for (const row of data) {
        await sqliteStorage.addApplicationFeesRecord({
          amount: row['AMOUNT'] || 0,
          date: excelDateToString(row['DATE']),
          ref: row['REF'] || '',
          uni: row['UNI'] || '',
        });
      }
      console.log('Application Fees data loaded to SQLite');
    }
    
    // Load Airline Tickets data
    if (sheetNames.includes('Airline Tickets')) {
      const sheet = workbook.Sheets['Airline Tickets'];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      for (const row of data) {
        await sqliteStorage.addAirlineTicketsRecord({
          amount: row['AMOUNT'] || 0,
          name: row['NAME'] || '',
          date: excelDateToString(row['DATE']),
          ref: row['REF'] || '',
        });
      }
      console.log('Airline Tickets data loaded to SQLite');
    }
    
    // Load Rent data
    if (sheetNames.includes('Rent')) {
      const sheet = workbook.Sheets['Rent'];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      for (const row of data) {
        await sqliteStorage.addRentRecord({
          amount: row['AMOUNT'] || 0,
          forMonth: row['FOR MONTH'] || '',
          date: excelDateToString(row['DATE']),
          ref: row['REF'] || '',
        });
      }
      console.log('Rent data loaded to SQLite');
    }
    
    // Load Lawyer_Tax_Contract data
    if (sheetNames.includes('Lawyer_Tax_Contract')) {
      const sheet = workbook.Sheets['Lawyer_Tax_Contract'];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      for (const row of data) {
        await sqliteStorage.addLawyerTaxContractRecord({
          amount: row['AMOUNT'] || 0,
          date: excelDateToString(row['DATE']),
          ref: row['REF'] || '',
        });
      }
      console.log('Lawyer_Tax_Contract data loaded to SQLite');
    }
    
    // Load Bills data
    if (sheetNames.includes('Bills')) {
      const sheet = workbook.Sheets['Bills'];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      for (const row of data) {
        await sqliteStorage.addBillsRecord({
          amount: row['AMOUNT'] || 0,
          date: excelDateToString(row['DATE']),
          billType: row['Bill Type'] || '',
          ref: row['REF'] || '',
        });
      }
      console.log('Bills data loaded to SQLite');
    }
    
    // Load Maintenance data
    if (sheetNames.includes('Maintenance')) {
      const sheet = workbook.Sheets['Maintenance'];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      for (const row of data) {
        await sqliteStorage.addMaintenanceRecord({
          amount: row['AMOUNT'] || 0,
          date: excelDateToString(row['DATE']),
          type: row['TYPE'] || '',
        });
      }
      console.log('Maintenance data loaded to SQLite');
    }
    
    // Load Medical Expenses data
    if (sheetNames.includes('Medical Expenses')) {
      const sheet = workbook.Sheets['Medical Expenses'];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      for (const row of data) {
        await sqliteStorage.addMedicalExpensesRecord({
          name: row['NAME'] || '',
          amount: row['AMOUNT'] || 0,
          date: excelDateToString(row['DATE']),
        });
      }
      console.log('Medical Expenses data loaded to SQLite');
    }
    
    // Load General Expenses data
    if (sheetNames.includes('General Expenses')) {
      const sheet = workbook.Sheets['General Expenses'];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      for (const row of data) {
        await sqliteStorage.addGeneralExpensesRecord({
          type: row['TYPE'] || '',
          amount: row['AMOUNT'] || 0,
          date: excelDateToString(row['DATE']),
        });
      }
      console.log('General Expenses data loaded to SQLite');
    }
    
    // Load Social Media data
    if (sheetNames.includes('Social Media')) {
      const sheet = workbook.Sheets['Social Media'];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      for (const row of data) {
        await sqliteStorage.addSocialMediaRecord({
          amount: row['AMOUNT'] || 0,
          date: excelDateToString(row['DATE']),
          ref: row['REF'] || '',
          bankRef: row['BANK REF'] || '',
        });
      }
      console.log('Social Media data loaded to SQLite');
    }
    
    // Load Trip_Travel_Bonus data
    if (sheetNames.includes('Trip_Travel_Bonus')) {
      const sheet = workbook.Sheets['Trip_Travel_Bonus'];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      for (const row of data) {
        await sqliteStorage.addTripTravelBonusRecord({
          name: row['NAME'] || '',
          amount: row['AMOUNT'] || 0,
          date: excelDateToString(row['DATE']),
        });
      }
      console.log('Trip_Travel_Bonus data loaded to SQLite');
    }
    
    // Load Employee Visa data
    if (sheetNames.includes('Employee Visa')) {
      const sheet = workbook.Sheets['Employee Visa'];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      for (const row of data) {
        await sqliteStorage.addEmployeeVisaRecord({
          employeeName: row['Employee Name'] || '',
          amount: row['AMOUNT'] || 0,
          date: excelDateToString(row['DATE']),
          ref: row['REF'] || '',
        });
      }
      console.log('Employee Visa data loaded to SQLite');
    }
    
    // Load Money Transfer data
    if (sheetNames.includes('Money Transfer')) {
      const sheet = workbook.Sheets['Money Transfer'];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      for (const row of data) {
        await sqliteStorage.addMoneyTransferRecord({
          amount: row['AMOUNT'] || 0,
          currency: row['Currency'] || '',
          date: excelDateToString(row['DATE']),
          name: row['NAME'] || '',
          ref: row['REF'] || '',
          country: row['Country'] || '',
        });
      }
      console.log('Money Transfer data loaded to SQLite');
    }
    
    console.log('All ABEER sheets data loaded to SQLite successfully');
  } catch (error) {
    console.error('Error loading ABEER sheets data:', error);
  }
}

export async function loadAllDataToSQLite(): Promise<void> {
  try {
    await loadAbeerDataToSQLite();
    await loadDataRecordsToSQLite();
    await loadCommissionDataToSQLite();
    await loadInvoiceDataToSQLite();
    await loadAdvBillDataToSQLite();
    await loadBonusDataToSQLite();
    await loadBonusClaimedDataToSQLite();
    await loadBonusNotClaimedDataToSQLite();
    await loadRegistrationDataToSQLite();
    await loadAgentBonusDataToSQLite(); // Add the new function call
    
    // Try to load IncomeOutcome data if the file exists
    try {
      await loadIncomeOutcomeDataToSQLite();
    } catch (e) {
      console.log('IncomeOutcome data file not found, skipping...');
    }
    
    // Load all new ABEER sheets data
    try {
      await loadAbeerSheetsDataToSQLite();
    } catch (e) {
      console.log('ABEER sheets data loading failed:', e);
    }
    
    console.log('All data loaded to SQLite successfully');
  } catch (error) {
    console.error('Error loading data to SQLite:', error);
  }
}