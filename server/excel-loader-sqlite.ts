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
  
  console.log('Invoice data loaded to SQLite');
}

export async function loadAdvBillDataToSQLite(): Promise<void> {
  const workbook = XLSX.readFile('attached_assets/ADV BILLS 2025 - 2026_1759717117631.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
   
  for (const row of data) {
    await sqliteStorage.addAdvBillRecord({
      amount: row['RM1,500.00'] || 0,
    });
  }
   
  console.log('Adv Bill data loaded to SQLite');
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
          enrollmentBonus: String(row['Enrollment Bonus'] || '0'),
          visaBonus: String(row['Visa Bonus'] || '0'),
          commissionFromUni: String(row['Commission from Uni'] || '0'),
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
  
    
    // Load bonus data with agent IDs
  
    
    console.log('All data loaded to SQLite successfully');
  } catch (error) {
    console.error('Error loading data to SQLite:', error);
  }
}