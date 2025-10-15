import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import { randomUUID } from "crypto";
import { sql, eq, and } from "drizzle-orm";
import type { 
  AbeerRecord, DataRecord, CommissionRecord, 
  InvoiceRecord, AdvBillRecord, BonusRecord, RegistrationRecord,
  RegistrationValApprovedRecord, RegistrationEnrollmentRecord,
  RegistrationVisaProcessRecord, RegistrationNotSubmittedRecord,
  RegistrationCancelledRecord, StudentRecord, BonusClaimedRecord, BonusNotClaimedRecord,
  AgentRecord, AgentBonusRecord, SentInvoiceRecord, UcsiRecord, UcsiInvoiceRecord,
  IncomeOutcomeRecord, EventsRecord, SalariesRecord, ServicesRecord,
  StudentHotelRecord, StudentFlightTicketRecord, AuthenticationPapersRecord,
  StudentVisaRecord, ApplicationFeesRecord, AirlineTicketsRecord, RentRecord,
  LawyerTaxContractRecord, BillsRecord, MaintenanceRecord, MedicalExpensesRecord,
  GeneralExpensesRecord, SocialMediaRecord, TripTravelBonusRecord,
  EmployeeVisaRecord, MoneyTransferRecord
} from "@shared/schema";

// Initialize SQLite database
const sqlite = new Database("excel_flow.db");
export const db = drizzle(sqlite, { schema });

// Create tables if they don't exist
export function initializeDatabase() {
  // Create tables
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS abeer (
      id TEXT PRIMARY KEY,
      month TEXT,
      income_malaysia REAL DEFAULT 0,
      total_income REAL DEFAULT 0,
      malaysia_office REAL DEFAULT 0,
      salaries REAL DEFAULT 0,
      sub_agent REAL DEFAULT 0,
      social_media REAL DEFAULT 0,
      total_outcome REAL DEFAULT 0
    );
    
    CREATE TABLE IF NOT EXISTS income_outcome (
      id TEXT PRIMARY KEY,
      no INTEGER,
      date TEXT,
      country TEXT,
      income REAL DEFAULT 0,
      office REAL DEFAULT 0,
      salaries REAL DEFAULT 0,
      subagent REAL DEFAULT 0,
      socialmedia REAL DEFAULT 0,
      outcome REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS student (
    id TEXT PRIMARY KEY,
    passport_number TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    nationality TEXT NOT NULL,
    uni TEXT NOT NULL,
    program TEXT NOT NULL,
    counselor TEXT NOT NULL,
    created_at TEXT,
    updated_at TEXT
);

    CREATE TABLE IF NOT EXISTS agent (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

    CREATE TABLE IF NOT EXISTS agent_bonus (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    uni TEXT,
    program TEXT,
    month TEXT,
    enrollment TEXT,
    enrollment_bonus number DEFAULT 0,
    visa_bonus number DEFAULT 0,
    commission_from_uni TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agent(id)
);

    CREATE TABLE IF NOT EXISTS data (
      id TEXT PRIMARY KEY,
      month TEXT,
      no INTEGER DEFAULT 0,
      name TEXT,
      uni TEXT,
      program TEXT
    );

    CREATE TABLE IF NOT EXISTS commission (
      id TEXT PRIMARY KEY,
      no INTEGER DEFAULT 0,
      university TEXT,
      ref TEXT,
      month TEXT,
      other_income REAL DEFAULT 0,
      received_date TEXT,
      currency TEXT,
      amount REAL DEFAULT 0,
      invoice_date TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS invoice (
      id TEXT PRIMARY KEY,
      no INTEGER DEFAULT 0,
      uni TEXT,
      type TEXT,
      date TEXT
    );

    CREATE TABLE IF NOT EXISTS adv_bill (
      id TEXT PRIMARY KEY,
      no INTEGER DEFAULT 0,
      bill_id TEXT,
      date TEXT,
      description TEXT,
      amount REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS subagent (
      id TEXT PRIMARY KEY,
      no INTEGER DEFAULT 0,
      subagent_name TEXT,
      date TEXT,
      ref TEXT,
      referral_commission_on TEXT,
      amount REAL DEFAULT 0,
      month TEXT
    );

    CREATE TABLE IF NOT EXISTS bonus (
      id TEXT PRIMARY KEY,
      no INTEGER DEFAULT 0,
      name TEXT,
      uni TEXT,
      passport_number TEXT,
      nationality TEXT,
      visa TEXT,
      counselor TEXT,
      program TEXT,
      intake TEXT,
      tuition_fees_payment TEXT,
      enrollment TEXT,
      commission TEXT,
      usd REAL DEFAULT 0
    );
    
    CREATE TABLE IF NOT EXISTS bonus_claimed (
      id TEXT PRIMARY KEY,
      no INTEGER DEFAULT 0,
      name TEXT,
      uni TEXT,
      passport_number TEXT,
      nationality TEXT,
      visa TEXT,
      counselor TEXT,
      program TEXT,
      intake TEXT,
      tuition_fees_payment TEXT,
      enrollment TEXT,
      commission TEXT,
      rm REAL DEFAULT 0,
      usd REAL DEFAULT 0,
      claimed_date TEXT,
      claimed_by TEXT
    );
    
    CREATE TABLE IF NOT EXISTS bonus_not_claimed (
      id TEXT PRIMARY KEY,
      no INTEGER DEFAULT 0,
      name TEXT,
      uni TEXT,
      passport_number TEXT,
      nationality TEXT,
      visa TEXT,
      counselor TEXT,
      program TEXT,
      intake TEXT,
      tuition_fees_payment TEXT,
      enrollment TEXT,
      commission TEXT,
      rm REAL DEFAULT 0,
      usd REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS registration (
      id TEXT PRIMARY KEY,
      no INTEGER DEFAULT 0,
      name TEXT,
      uni TEXT,
      passport_number TEXT,
      nationality TEXT,
      visa TEXT,
      val_approval TEXT,
      counselor TEXT,
      program TEXT,
      submission_month TEXT,
      paid_month TEXT,
      arrival_date TEXT,
      sheet_type TEXT DEFAULT 'Val Approved'
    );
    
    CREATE TABLE IF NOT EXISTS registration_val_approved (
      id TEXT PRIMARY KEY,
      no INTEGER DEFAULT 0,
      name TEXT,
      uni TEXT,
      passport_number TEXT,
      nationality TEXT,
      visa TEXT,
      val_approval TEXT,
      counselor TEXT,
      program TEXT,
      submission_month TEXT,
      paid_month TEXT,
      note TEXT,
      arrival_date TEXT,
      sheet_type TEXT DEFAULT 'Val Approved'
    );
    
    CREATE TABLE IF NOT EXISTS registration_enrollment (
      id TEXT PRIMARY KEY,
      no INTEGER DEFAULT 0,
      
      name TEXT,
      uni TEXT,
      passport_number TEXT,
      nationality TEXT,
      visa TEXT,
      counselor TEXT,
      program TEXT,
      intake TEXT,
      submission_month TEXT,
      paid_month TEXT,
      sheet_type TEXT DEFAULT 'Enrollment'
    );
    
    CREATE TABLE IF NOT EXISTS registration_visa_process (
      id TEXT PRIMARY KEY,
      no INTEGER DEFAULT 0,
      name TEXT,
      uni TEXT,
      passport_number TEXT,
      nationality TEXT,
      visa TEXT,
      counselor TEXT,
      program TEXT,
      submission_month TEXT,
      paid_month TEXT,
      note TEXT,
      sheet_type TEXT DEFAULT 'Visa Process'
    );
    
    CREATE TABLE IF NOT EXISTS registration_not_submitted (
      id TEXT PRIMARY KEY,
      no INTEGER DEFAULT 0,
      name TEXT,
      uni TEXT,
      passport_number TEXT,
      nationality TEXT,
      visa TEXT,
      counselor TEXT,
      program TEXT,
      month TEXT,
      payment TEXT,
      sheet_type TEXT DEFAULT 'Not Submitted'
    );
    
    CREATE TABLE IF NOT EXISTS registration_cancelled (
      id TEXT PRIMARY KEY,
      no INTEGER DEFAULT 0,
      name TEXT,
      uni TEXT,
      passport_number TEXT,
      nationality TEXT,
      visa TEXT,
      counselor TEXT,
      program TEXT,
      month TEXT,
      payment TEXT,
      sheet_type TEXT DEFAULT 'Cancelled'
    );

    CREATE TABLE IF NOT EXISTS sent_invoices (
      id TEXT PRIMARY KEY,
      no INTEGER DEFAULT 0,
      uni TEXT,
      type TEXT,
      date TEXT,
      dr_hani_account REAL DEFAULT 0,
      currency TEXT,
      amount REAL DEFAULT 0,
      apply_uni TEXT
    );

    CREATE TABLE IF NOT EXISTS ucsi (
      id TEXT PRIMARY KEY,
      no INTEGER DEFAULT 0,
      university TEXT,
      type TEXT,
      date TEXT,
      dr_hani_account REAL DEFAULT 0,
      currency TEXT,
      amount REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS ucsi_invoices (
      id TEXT PRIMARY KEY,
      no INTEGER DEFAULT 0,
      university TEXT,
      type TEXT,
      date TEXT,
      currency TEXT,
      amount REAL DEFAULT 0,
      received_date TEXT
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      no INTEGER DEFAULT 0,
      date TEXT,
      uni TEXT,
      currency TEXT,
      income REAL DEFAULT 0,
      expenses REAL DEFAULT 0,
      country TEXT
    );

    CREATE TABLE IF NOT EXISTS salaries (
      id TEXT PRIMARY KEY,
      name TEXT,
      amount REAL DEFAULT 0,
      date TEXT
    );

    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      name TEXT,
      date TEXT,
      amount REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS student_hotel (
      id TEXT PRIMARY KEY,
      name TEXT,
      date TEXT,
      amount REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS student_flight_ticket (
      id TEXT PRIMARY KEY,
      name TEXT,
      date TEXT,
      amount REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS authentication_papers (
      id TEXT PRIMARY KEY,
      amount REAL DEFAULT 0,
      ref TEXT,
      date TEXT,
      ref_1 TEXT
    );

    CREATE TABLE IF NOT EXISTS student_visa (
      id TEXT PRIMARY KEY,
      amount REAL DEFAULT 0,
      date TEXT,
      ref TEXT,
      uni TEXT
    );

    CREATE TABLE IF NOT EXISTS application_fees (
      id TEXT PRIMARY KEY,
      amount REAL DEFAULT 0,
      date TEXT,
      ref TEXT,
      uni TEXT
    );

    CREATE TABLE IF NOT EXISTS airline_tickets (
      id TEXT PRIMARY KEY,
      amount REAL DEFAULT 0,
      name TEXT,
      date TEXT,
      ref TEXT
    );

    CREATE TABLE IF NOT EXISTS rent (
      id TEXT PRIMARY KEY,
      amount REAL DEFAULT 0,
      for_month TEXT,
      date TEXT,
      ref TEXT
    );

    CREATE TABLE IF NOT EXISTS lawyer_tax_contract (
      id TEXT PRIMARY KEY,
      amount REAL DEFAULT 0,
      date TEXT,
      ref TEXT
    );

    CREATE TABLE IF NOT EXISTS bills (
      id TEXT PRIMARY KEY,
      amount REAL DEFAULT 0,
      date TEXT,
      bill_type TEXT,
      ref TEXT
    );

    CREATE TABLE IF NOT EXISTS maintenance (
      id TEXT PRIMARY KEY,
      amount REAL DEFAULT 0,
      date TEXT,
      type TEXT
    );

    CREATE TABLE IF NOT EXISTS medical_expenses (
      id TEXT PRIMARY KEY,
      name TEXT,
      amount REAL DEFAULT 0,
      date TEXT
    );

    CREATE TABLE IF NOT EXISTS general_expenses (
      id TEXT PRIMARY KEY,
      type TEXT,
      amount REAL DEFAULT 0,
      date TEXT
    );

    CREATE TABLE IF NOT EXISTS social_media (
      id TEXT PRIMARY KEY,
      amount REAL DEFAULT 0,
      date TEXT,
      ref TEXT,
      bank_ref TEXT
    );

    CREATE TABLE IF NOT EXISTS trip_travel_bonus (
      id TEXT PRIMARY KEY,
      name TEXT,
      amount REAL DEFAULT 0,
      date TEXT
    );

    CREATE TABLE IF NOT EXISTS employee_visa (
      id TEXT PRIMARY KEY,
      employee_name TEXT,
      amount REAL DEFAULT 0,
      date TEXT,
      ref TEXT
    );

    CREATE TABLE IF NOT EXISTS money_transfer (
      id TEXT PRIMARY KEY,
      amount REAL DEFAULT 0,
      currency TEXT,
      date TEXT,
      name TEXT,
      ref TEXT,
      country TEXT
    );
  `);

  console.log("Database tables created successfully");
}

// Database service functions
export class SQLiteStorage {
  constructor() {
    initializeDatabase();
  }
  
  // Agent methods
  async getAgentData(): Promise<AgentRecord[]> {
    return await db.select().from(schema.agentTable);
  }
  
  async getAgentBonusData(): Promise<AgentBonusRecord[]> {
    return await db.select().from(schema.agentBonusTable);
  }
  
  async getAgentBonusByAgentId(agentId: string): Promise<AgentBonusRecord[]> {
    return await db.select().from(schema.agentBonusTable).where(eq(schema.agentBonusTable.agentId, agentId));
  }
  
  async addAgentRecord(record: Omit<AgentRecord, 'id'>): Promise<AgentRecord> {
    const id = randomUUID();
    const newRecord = { ...record, id };
    await db.insert(schema.agentTable).values(newRecord);
    return newRecord;
  }
  
  async addAgentBonusRecord(record: Omit<AgentBonusRecord, 'id'>): Promise<AgentBonusRecord> {
    const id = randomUUID();
    const newRecord = { ...record, id };
    await db.insert(schema.agentBonusTable).values(newRecord);
    return newRecord;
  }
  
  // Abeer data
  async getAbeerData(): Promise<AbeerRecord[]> {
    return db.select().from(schema.abeerTable).all();
  }

  async addAbeerRecord(record: Omit<AbeerRecord, 'id'>): Promise<AbeerRecord> {
    const id = randomUUID();
    const newRecord = { id, ...record };
    await db.insert(schema.abeerTable).values(newRecord);
    return newRecord;
  }

  async updateAbeerRecord(id: string, record: Partial<AbeerRecord>): Promise<AbeerRecord | undefined> {
    await db.update(schema.abeerTable).set(record).where(sql`id = ${id}`);
    return this.getAbeerRecordById(id);
  }

  async deleteAbeerRecord(id: string): Promise<boolean> {
    const result = await db.delete(schema.abeerTable).where(sql`id = ${id}`);
    return true; // SQLite doesn't return affected rows count in a way we can easily access
  }

  async getAbeerRecordById(id: string): Promise<AbeerRecord | undefined> {
    const records = await db.select().from(schema.abeerTable).where(sql`id = ${id}`).all();
    return records[0];
  }

  // Data records
  async getDataRecords(): Promise<DataRecord[]> {
    return db.select().from(schema.dataTable).all();
  }

  async addDataRecord(record: Omit<DataRecord, 'id'>): Promise<DataRecord> {
    const id = randomUUID();
    const newRecord = { id, ...record };
    await db.insert(schema.dataTable).values(newRecord);
    return newRecord;
  }

  async updateDataRecord(id: string, record: Partial<DataRecord>): Promise<DataRecord | undefined> {
    await db.update(schema.dataTable).set(record).where(sql`id = ${id}`);
    return this.getDataRecordById(id);
  }

  async deleteDataRecord(id: string): Promise<boolean> {
    await db.delete(schema.dataTable).where(sql`id = ${id}`);
    return true;
  }

  async getDataRecordById(id: string): Promise<DataRecord | undefined> {
    const records = await db.select().from(schema.dataTable).where(sql`id = ${id}`).all();
    return records[0];
  }

  // Commission data
  async getCommissionData(): Promise<CommissionRecord[]> {
    return db.select().from(schema.commissionTable).all();
  }

  async addCommissionRecord(record: Omit<CommissionRecord, 'id'>): Promise<CommissionRecord> {
    const id = randomUUID();
    const newRecord = { id, ...record };
    await db.insert(schema.commissionTable).values(newRecord);
    return newRecord;
  }

  async updateCommissionRecord(id: string, record: Partial<CommissionRecord>): Promise<CommissionRecord | undefined> {
    await db.update(schema.commissionTable).set(record).where(sql`id = ${id}`);
    return this.getCommissionRecordById(id);
  }

  async deleteCommissionRecord(id: string): Promise<boolean> {
    await db.delete(schema.commissionTable).where(sql`id = ${id}`);
    return true;
  }

  async getCommissionRecordById(id: string): Promise<CommissionRecord | undefined> {
    const records = await db.select().from(schema.commissionTable).where(sql`id = ${id}`).all();
    return records[0];
  }

  // Invoice data
  async getInvoiceData(): Promise<InvoiceRecord[]> {
    return db.select().from(schema.invoiceTable).all();
  }

  async addInvoiceRecord(record: Omit<InvoiceRecord, 'id'>): Promise<InvoiceRecord> {
    const id = randomUUID();
    const newRecord = { id, ...record };
    await db.insert(schema.invoiceTable).values(newRecord);
    return newRecord;
  }

  async updateInvoiceRecord(id: string, record: Partial<InvoiceRecord>): Promise<InvoiceRecord | undefined> {
    await db.update(schema.invoiceTable).set(record).where(sql`id = ${id}`);
    return this.getInvoiceRecordById(id);
  }

  async deleteInvoiceRecord(id: string): Promise<boolean> {
    await db.delete(schema.invoiceTable).where(sql`id = ${id}`);
    return true;
  }

  async getInvoiceRecordById(id: string): Promise<InvoiceRecord | undefined> {
    const records = await db.select().from(schema.invoiceTable).where(sql`id = ${id}`).all();
    return records[0];
  }
  
  // Sent Invoices methods
  async getSentInvoicesData(): Promise<SentInvoiceRecord[]> {
    return db.select().from(schema.sentInvoicesTable).all();
  }

  async addSentInvoiceRecord(record: Omit<SentInvoiceRecord, 'id'>): Promise<SentInvoiceRecord> {
    const id = randomUUID();
    const newRecord = { id, ...record };
    await db.insert(schema.sentInvoicesTable).values(newRecord);
    return newRecord;
  }

  async updateSentInvoiceRecord(id: string, record: Partial<SentInvoiceRecord>): Promise<SentInvoiceRecord | undefined> {
    await db.update(schema.sentInvoicesTable).set(record).where(sql`id = ${id}`);
    return this.getSentInvoiceRecordById(id);
  }

  async deleteSentInvoiceRecord(id: string): Promise<boolean> {
    await db.delete(schema.sentInvoicesTable).where(sql`id = ${id}`);
    return true;
  }

  async getSentInvoiceRecordById(id: string): Promise<SentInvoiceRecord | undefined> {
    const records = await db.select().from(schema.sentInvoicesTable).where(sql`id = ${id}`).all();
    return records[0];
  }
  
  // UCSI methods
  async getUcsiData(): Promise<UcsiRecord[]> {
    return db.select().from(schema.ucsiTable).all();
  }

  async addUcsiRecord(record: Omit<UcsiRecord, 'id'>): Promise<UcsiRecord> {
    const id = randomUUID();
    const newRecord = { id, ...record };
    await db.insert(schema.ucsiTable).values(newRecord);
    return newRecord;
  }

  async updateUcsiRecord(id: string, record: Partial<UcsiRecord>): Promise<UcsiRecord | undefined> {
    await db.update(schema.ucsiTable).set(record).where(sql`id = ${id}`);
    return this.getUcsiRecordById(id);
  }

  async deleteUcsiRecord(id: string): Promise<boolean> {
    await db.delete(schema.ucsiTable).where(sql`id = ${id}`);
    return true;
  }

  async getUcsiRecordById(id: string): Promise<UcsiRecord | undefined> {
    const records = await db.select().from(schema.ucsiTable).where(sql`id = ${id}`).all();
    return records[0];
  }
  
  // UCSI Invoices methods
  async getUcsiInvoiceData(): Promise<UcsiInvoiceRecord[]> {
    return db.select().from(schema.ucsiInvoicesTable).all();
  }

  async addUcsiInvoiceRecord(record: Omit<UcsiInvoiceRecord, 'id'>): Promise<UcsiInvoiceRecord> {
    const id = randomUUID();
    const newRecord = { id, ...record };
    await db.insert(schema.ucsiInvoicesTable).values(newRecord);
    return newRecord;
  }

  async updateUcsiInvoiceRecord(id: string, record: Partial<UcsiInvoiceRecord>): Promise<UcsiInvoiceRecord | undefined> {
    await db.update(schema.ucsiInvoicesTable).set(record).where(sql`id = ${id}`);
    return this.getUcsiInvoiceRecordById(id);
  }

  async deleteUcsiInvoiceRecord(id: string): Promise<boolean> {
    await db.delete(schema.ucsiInvoicesTable).where(sql`id = ${id}`);
    return true;
  }

  async getUcsiInvoiceRecordById(id: string): Promise<UcsiInvoiceRecord | undefined> {
    const records = await db.select().from(schema.ucsiInvoicesTable).where(sql`id = ${id}`).all();
    return records[0];
  }

  // Adv Bill data
  async getAdvBillData(): Promise<AdvBillRecord[]> {
    return db.select().from(schema.advBillTable).all();
  }

  async addAdvBillRecord(record: Omit<AdvBillRecord, 'id'>): Promise<AdvBillRecord> {
    const id = randomUUID();
    const newRecord = { id, ...record };
    await db.insert(schema.advBillTable).values(newRecord);
    return newRecord;
  }

  async updateAdvBillRecord(id: string, record: Partial<AdvBillRecord>): Promise<AdvBillRecord | undefined> {
    await db.update(schema.advBillTable).set(record).where(sql`id = ${id}`);
    return this.getAdvBillRecordById(id);
  }

  async deleteAdvBillRecord(id: string): Promise<boolean> {
    await db.delete(schema.advBillTable).where(sql`id = ${id}`);
    return true;
  }

  async getAdvBillRecordById(id: string): Promise<AdvBillRecord | undefined> {
    const records = await db.select().from(schema.advBillTable).where(sql`id = ${id}`).all();
    return records[0];
  }

  // Subagent data
  async getSubagentData(): Promise<any[]> {
    return db.select().from(schema.subagentTable).all();
  }

  async addSubagentRecord(record: Omit<any, 'id'>): Promise<any> {
    const id = randomUUID();
    const newRecord = { id, ...record };
    await db.insert(schema.subagentTable).values(newRecord);
    return newRecord;
  }

  async updateSubagentRecord(id: string, record: Partial<any>): Promise<any | undefined> {
    await db.update(schema.subagentTable).set(record).where(sql`id = ${id}`);
    const results = await db.select().from(schema.subagentTable).where(sql`id = ${id}`).all();
    return results[0];
  }

  async deleteSubagentRecord(id: string): Promise<boolean> {
    await db.delete(schema.subagentTable).where(sql`id = ${id}`);
    return true;
  }

  // Bonus data
  async getBonusData(): Promise<BonusRecord[]> {
    return db.select().from(schema.bonusTable).all();
  }

  async addBonusRecord(record: Omit<BonusRecord, 'id'>): Promise<BonusRecord> {
    const id = randomUUID();
    const newRecord = { id, ...record };
    await db.insert(schema.bonusTable).values(newRecord);
    return newRecord;
  }

  async updateBonusRecord(id: string, record: Partial<BonusRecord>): Promise<BonusRecord | undefined> {
    await db.update(schema.bonusTable).set(record).where(sql`id = ${id}`);
    return this.getBonusRecordById(id);
  }

  async deleteBonusRecord(id: string): Promise<boolean> {
    await db.delete(schema.bonusTable).where(sql`id = ${id}`);
    return true;
  }

  async getBonusRecordById(id: string): Promise<BonusRecord | undefined> {
    const records = await db.select().from(schema.bonusTable).where(sql`id = ${id}`).all();
    return records[0];
  }
  
  // Bonus Claimed data
  async getBonusClaimedData(): Promise<BonusClaimedRecord[]> {
    return db.select().from(schema.bonusClaimedTable).all();
  }

  async addBonusClaimedRecord(record: Omit<BonusClaimedRecord, 'id'>): Promise<BonusClaimedRecord> {
    const id = randomUUID();
    const newRecord = { id, ...record };
    await db.insert(schema.bonusClaimedTable).values(newRecord);
    return newRecord;
  }

  async updateBonusClaimedRecord(id: string, record: Partial<BonusClaimedRecord>): Promise<BonusClaimedRecord | undefined> {
    await db.update(schema.bonusClaimedTable).set(record).where(sql`id = ${id}`);
    return this.getBonusClaimedRecordById(id);
  }

  async deleteBonusClaimedRecord(id: string): Promise<boolean> {
    await db.delete(schema.bonusClaimedTable).where(sql`id = ${id}`);
    return true;
  }

  async getBonusClaimedRecordById(id: string): Promise<BonusClaimedRecord | undefined> {
    const records = await db.select().from(schema.bonusClaimedTable).where(sql`id = ${id}`).all();
    return records[0];
  }
  
  // Bonus Not Claimed data
  async getBonusNotClaimedData(): Promise<BonusNotClaimedRecord[]> {
    return db.select().from(schema.bonusNotClaimedTable).all();
  }

  async addBonusNotClaimedRecord(record: Omit<BonusNotClaimedRecord, 'id'>): Promise<BonusNotClaimedRecord> {
    const id = randomUUID();
    const newRecord = { id, ...record };
    await db.insert(schema.bonusNotClaimedTable).values(newRecord);
    return newRecord;
  }

  async updateBonusNotClaimedRecord(id: string, record: Partial<BonusNotClaimedRecord>): Promise<BonusNotClaimedRecord | undefined> {
    await db.update(schema.bonusNotClaimedTable).set(record).where(sql`id = ${id}`);
    return this.getBonusNotClaimedRecordById(id);
  }

  async deleteBonusNotClaimedRecord(id: string): Promise<boolean> {
    await db.delete(schema.bonusNotClaimedTable).where(sql`id = ${id}`);
    return true;
  }

  async getBonusNotClaimedRecordById(id: string): Promise<BonusNotClaimedRecord | undefined> {
    const records = await db.select().from(schema.bonusNotClaimedTable).where(sql`id = ${id}`).all();
    return records[0];
  }

  // Registration data - Legacy table
  async getRegistrationData(): Promise<RegistrationRecord[]> {
    return db.select().from(schema.registrationTable).all();
  }

  async addRegistrationRecord(record: Omit<RegistrationRecord, 'id'>): Promise<RegistrationRecord> {
    const id = randomUUID();
    const newRecord = { id, ...record };
    await db.insert(schema.registrationTable).values(newRecord);
    return newRecord;
  }

  async updateRegistrationRecord(id: string, record: Partial<RegistrationRecord>): Promise<RegistrationRecord | undefined> {
    await db.update(schema.registrationTable).set(record).where(sql`id = ${id}`);
    return this.getRegistrationRecordById(id);
  }

  async deleteRegistrationRecord(id: string): Promise<boolean> {
    await db.delete(schema.registrationTable).where(sql`id = ${id}`);
    return true;
  }

  async getRegistrationRecordById(id: string): Promise<RegistrationRecord | undefined> {
    const records = await db.select().from(schema.registrationTable).where(sql`id = ${id}`).all();
    return records[0];
  }
  
  // Registration Val Approved data
  async getRegistrationValApprovedData(): Promise<RegistrationValApprovedRecord[]> {
    return db.select().from(schema.registrationValApprovedTable).all();
  }

  async addRegistrationValApprovedRecord(record: Omit<RegistrationValApprovedRecord, 'id'>): Promise<RegistrationValApprovedRecord> {
    const id = randomUUID();
    const newRecord = { id, ...record, sheetType: 'Val Approved' };
    await db.insert(schema.registrationValApprovedTable).values(newRecord);
    return newRecord;
  }

  async updateRegistrationValApprovedRecord(id: string, record: Partial<RegistrationValApprovedRecord>): Promise<RegistrationValApprovedRecord | undefined> {
    await db.update(schema.registrationValApprovedTable).set(record).where(sql`id = ${id}`);
    return this.getRegistrationValApprovedRecordById(id);
  }

  async deleteRegistrationValApprovedRecord(id: string): Promise<boolean> {
    await db.delete(schema.registrationValApprovedTable).where(sql`id = ${id}`);
    return true;
  }

  async getRegistrationValApprovedRecordById(id: string): Promise<RegistrationValApprovedRecord | undefined> {
    const records = await db.select().from(schema.registrationValApprovedTable).where(sql`id = ${id}`).all();
    return records[0];
  }
  
  // Registration Enrollment data
  async getRegistrationEnrollmentData(): Promise<RegistrationEnrollmentRecord[]> {
    return db.select().from(schema.registrationEnrollmentTable).all();
  }
  
  async getRegistrationEnrollmentByPassport(passportNumber: string): Promise<RegistrationEnrollmentRecord[]> {
    return db.select()
      .from(schema.registrationEnrollmentTable)
      .where(sql`passport_number = ${passportNumber}`)
      .all();
  }

  async getRegistrationValApprovedByPassport(passportNumber: string): Promise<RegistrationValApprovedRecord[]> {
    return db.select()
      .from(schema.registrationValApprovedTable)
      .where(sql`passport_number = ${passportNumber}`)
      .all();
  }

  async getRegistrationVisaProcessByPassport(passportNumber: string): Promise<RegistrationVisaProcessRecord[]> {
    return db.select()
      .from(schema.registrationVisaProcessTable)
      .where(sql`passport_number = ${passportNumber}`)
      .all();
  }

  async getRegistrationNotSubmittedByPassport(passportNumber: string): Promise<RegistrationNotSubmittedRecord[]> {
    return db.select()
      .from(schema.registrationNotSubmittedTable)
      .where(sql`passport_number = ${passportNumber}`)
      .all();
  }

  async getRegistrationCancelledByPassport(passportNumber: string): Promise<RegistrationCancelledRecord[]> {
    return db.select()
      .from(schema.registrationCancelledTable)
      .where(sql`passport_number = ${passportNumber}`)
      .all();
  }

  async addRegistrationEnrollmentRecord(record: Omit<RegistrationEnrollmentRecord, 'id'>): Promise<RegistrationEnrollmentRecord> {
    const id = randomUUID();
    const newRecord = { id, ...record, sheetType: 'Enrollment' };
    await db.insert(schema.registrationEnrollmentTable).values(newRecord);
    return newRecord;
  }

  async updateRegistrationEnrollmentRecord(id: string, record: Partial<RegistrationEnrollmentRecord>): Promise<RegistrationEnrollmentRecord | undefined> {
    await db.update(schema.registrationEnrollmentTable).set(record).where(sql`id = ${id}`);
    return this.getRegistrationEnrollmentRecordById(id);
  }

  async deleteRegistrationEnrollmentRecord(id: string): Promise<boolean> {
    await db.delete(schema.registrationEnrollmentTable).where(sql`id = ${id}`);
    return true;
  }

  async getRegistrationEnrollmentRecordById(id: string): Promise<RegistrationEnrollmentRecord | undefined> {
    const records = await db.select().from(schema.registrationEnrollmentTable).where(sql`id = ${id}`).all();
    return records[0];
  }
  
  // Registration Visa Process data
  async getRegistrationVisaProcessData(): Promise<RegistrationVisaProcessRecord[]> {
    return db.select().from(schema.registrationVisaProcessTable).all();
  }

  async addRegistrationVisaProcessRecord(record: Omit<RegistrationVisaProcessRecord, 'id'>): Promise<RegistrationVisaProcessRecord> {
    const id = randomUUID();
    const newRecord = { id, ...record, sheetType: 'Visa Process' };
    await db.insert(schema.registrationVisaProcessTable).values(newRecord);
    return newRecord;
  }

  async updateRegistrationVisaProcessRecord(id: string, record: Partial<RegistrationVisaProcessRecord>): Promise<RegistrationVisaProcessRecord | undefined> {
    await db.update(schema.registrationVisaProcessTable).set(record).where(sql`id = ${id}`);
    return this.getRegistrationVisaProcessRecordById(id);
  }

  async deleteRegistrationVisaProcessRecord(id: string): Promise<boolean> {
    await db.delete(schema.registrationVisaProcessTable).where(sql`id = ${id}`);
    return true;
  }

  async getRegistrationVisaProcessRecordById(id: string): Promise<RegistrationVisaProcessRecord | undefined> {
    const records = await db.select().from(schema.registrationVisaProcessTable).where(sql`id = ${id}`).all();
    return records[0];
  }
  
  // Registration Not Submitted data
  async getRegistrationNotSubmittedData(): Promise<RegistrationNotSubmittedRecord[]> {
    return db.select().from(schema.registrationNotSubmittedTable).all();
  }

  async addRegistrationNotSubmittedRecord(record: Omit<RegistrationNotSubmittedRecord, 'id'>): Promise<RegistrationNotSubmittedRecord> {
    const id = randomUUID();
    const newRecord = { id, ...record, sheetType: 'Not Submitted' };
    await db.insert(schema.registrationNotSubmittedTable).values(newRecord);
    return newRecord;
  }

  async updateRegistrationNotSubmittedRecord(id: string, record: Partial<RegistrationNotSubmittedRecord>): Promise<RegistrationNotSubmittedRecord | undefined> {
    await db.update(schema.registrationNotSubmittedTable).set(record).where(sql`id = ${id}`);
    return this.getRegistrationNotSubmittedRecordById(id);
  }

  async deleteRegistrationNotSubmittedRecord(id: string): Promise<boolean> {
    await db.delete(schema.registrationNotSubmittedTable).where(sql`id = ${id}`);
    return true;
  }

  async getRegistrationNotSubmittedRecordById(id: string): Promise<RegistrationNotSubmittedRecord | undefined> {
    const records = await db.select().from(schema.registrationNotSubmittedTable).where(sql`id = ${id}`).all();
    return records[0];
  }
  
  // Registration Cancelled data
  async getRegistrationCancelledData(): Promise<RegistrationCancelledRecord[]> {
    return db.select().from(schema.registrationCancelledTable).all();
  }

  async addRegistrationCancelledRecord(record: Omit<RegistrationCancelledRecord, 'id'>): Promise<RegistrationCancelledRecord> {
    const id = randomUUID();
    const newRecord = { id, ...record, sheetType: 'Cancelled' };
    await db.insert(schema.registrationCancelledTable).values(newRecord);
    return newRecord;
  }

  async updateRegistrationCancelledRecord(id: string, record: Partial<RegistrationCancelledRecord>): Promise<RegistrationCancelledRecord | undefined> {
    await db.update(schema.registrationCancelledTable).set(record).where(sql`id = ${id}`);
    return this.getRegistrationCancelledRecordById(id);
  }

  async deleteRegistrationCancelledRecord(id: string): Promise<boolean> {
    await db.delete(schema.registrationCancelledTable).where(sql`id = ${id}`);
    return true;
  }

  async getRegistrationCancelledRecordById(id: string): Promise<RegistrationCancelledRecord | undefined> {
    const records = await db.select().from(schema.registrationCancelledTable).where(sql`id = ${id}`).all();
    return records[0];
  }

  // Student operations
  async getStudents(): Promise<StudentRecord[]> {
    return db.select().from(schema.studentTable).all();
  }

  async getStudentByPassport(passportNumber: string): Promise<StudentRecord | undefined> {
    const records = await db.select().from(schema.studentTable).where(sql`passport_number = ${passportNumber}`).all();
    return records[0];
  }

  async addStudent(record: Omit<StudentRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<StudentRecord> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const newRecord = { 
      id, 
      ...record, 
      createdAt: now,
      updatedAt: now
    };
    await db.insert(schema.studentTable).values(newRecord);
    return newRecord;
  }

  async updateStudent(id: string, record: Partial<StudentRecord>): Promise<StudentRecord | undefined> {
    const now = new Date().toISOString();
    await db.update(schema.studentTable).set({...record, updatedAt: now}).where(sql`id = ${id}`);
    return this.getStudentById(id);
  }

  async deleteStudent(id: string): Promise<boolean> {
    await db.delete(schema.studentTable).where(sql`id = ${id}`);
    return true;
  }

  async getStudentById(id: string): Promise<StudentRecord | undefined> {
    const records = await db.select().from(schema.studentTable).where(sql`id = ${id}`).all();
    return records[0];
  }

  // Agent operations
  async getAgents(): Promise<AgentRecord[]> {
    return db.select().from(schema.agentTable).all();
  }

  async getAgentById(id: string): Promise<AgentRecord | undefined> {
    const records = await db.select().from(schema.agentTable).where(sql`id = ${id}`).all();
    return records[0];
  }

  async getAgentByName(name: string): Promise<AgentRecord | undefined> {
    const records = await db.select().from(schema.agentTable).where(sql`name = ${name}`).all();
    return records[0];
  }

  async addAgent(record: Omit<AgentRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<AgentRecord> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const newRecord = { 
      id, 
      ...record, 
      createdAt: now,
      updatedAt: now
    };
    await db.insert(schema.agentTable).values(newRecord);
    return newRecord;
  }

  async updateAgent(id: string, record: Partial<AgentRecord>): Promise<AgentRecord | undefined> {
    const now = new Date().toISOString();
    await db.update(schema.agentTable).set({...record, updatedAt: now}).where(sql`id = ${id}`);
    return this.getAgentById(id);
  }

  async deleteAgent(id: string): Promise<boolean> {
    await db.delete(schema.agentTable).where(sql`id = ${id}`);
    return true;
  }

  // Agent Bonus operations
  async getAgentBonuses(): Promise<AgentBonusRecord[]> {
    return db.select().from(schema.agentBonusTable).all();
  }

  async getAgentBonusesByAgentId(agentId: string): Promise<AgentBonusRecord[]> {
    return db.select().from(schema.agentBonusTable).where(sql`agent_id = ${agentId}`).all();
  }

  async getAgentBonusById(id: string): Promise<AgentBonusRecord | undefined> {
    const records = await db.select().from(schema.agentBonusTable).where(sql`id = ${id}`).all();
    return records[0];
  }

  async addAgentBonus(record: Omit<AgentBonusRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<AgentBonusRecord> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const newRecord = { 
      id, 
      ...record, 
      createdAt: now,
      updatedAt: now
    };
    await db.insert(schema.agentBonusTable).values(newRecord);
    return newRecord;
  }

  async updateAgentBonus(id: string, record: Partial<AgentBonusRecord>): Promise<AgentBonusRecord | undefined> {
    const now = new Date().toISOString();
    await db.update(schema.agentBonusTable).set({...record, updatedAt: now}).where(sql`id = ${id}`);
    return this.getAgentBonusById(id);
  }

  async deleteAgentBonus(id: string): Promise<boolean> {
    await db.delete(schema.agentBonusTable).where(sql`id = ${id}`);
    return true;
  }

  // Income Outcome methods
  async getIncomeOutcomeData(): Promise<IncomeOutcomeRecord[]> {
    return db.select().from(schema.incomeOutcomeTable).all();
  }

  async getIncomeOutcomeByCountry(country: string): Promise<IncomeOutcomeRecord[]> {
    return db.select().from(schema.incomeOutcomeTable).where(eq(schema.incomeOutcomeTable.country, country)).all();
  }

  async addIncomeOutcomeRecord(record: Omit<IncomeOutcomeRecord, 'id'>): Promise<IncomeOutcomeRecord> {
    const id = randomUUID();
    const newRecord = { id, ...record };
    await db.insert(schema.incomeOutcomeTable).values(newRecord);
    return newRecord;
  }

  async getIncomeOutcomeById(id: string): Promise<IncomeOutcomeRecord | undefined> {
    const results = await db.select().from(schema.incomeOutcomeTable).where(sql`id = ${id}`).all();
    return results[0];
  }

  async updateIncomeOutcomeRecord(id: string, record: Partial<IncomeOutcomeRecord>): Promise<IncomeOutcomeRecord | undefined> {
    await db.update(schema.incomeOutcomeTable).set(record).where(sql`id = ${id}`);
    return this.getIncomeOutcomeById(id);
  }

  async deleteIncomeOutcomeRecord(id: string): Promise<boolean> {
    await db.delete(schema.incomeOutcomeTable).where(sql`id = ${id}`);
    return true;
  }

  // Events methods
  async getEventsData(): Promise<EventsRecord[]> {
    return db.select().from(schema.eventsTable).all();
  }

  async addEventsRecord(record: Omit<EventsRecord, 'id'>): Promise<EventsRecord> {
    const id = randomUUID();
    const newRecord = { id, ...record };
    await db.insert(schema.eventsTable).values(newRecord);
    return newRecord;
  }

  async updateEventsRecord(id: string, record: Partial<EventsRecord>): Promise<EventsRecord | undefined> {
    await db.update(schema.eventsTable).set(record).where(sql`id = ${id}`);
    return this.getEventsRecordById(id);
  }

  async deleteEventsRecord(id: string): Promise<boolean> {
    await db.delete(schema.eventsTable).where(sql`id = ${id}`);
    return true;
  }

  async getEventsRecordById(id: string): Promise<EventsRecord | undefined> {
    const records = await db.select().from(schema.eventsTable).where(sql`id = ${id}`).all();
    return records[0];
  }

  // Salaries methods
  async getSalariesData(): Promise<SalariesRecord[]> {
    return db.select().from(schema.salariesTable).all();
  }

  async addSalariesRecord(record: Omit<SalariesRecord, 'id'>): Promise<SalariesRecord> {
    const id = randomUUID();
    const newRecord = { id, ...record };
    await db.insert(schema.salariesTable).values(newRecord);
    return newRecord;
  }

  async updateSalariesRecord(id: string, record: Partial<SalariesRecord>): Promise<SalariesRecord | undefined> {
    await db.update(schema.salariesTable).set(record).where(sql`id = ${id}`);
    return this.getSalariesRecordById(id);
  }

  async deleteSalariesRecord(id: string): Promise<boolean> {
    await db.delete(schema.salariesTable).where(sql`id = ${id}`);
    return true;
  }

  async getSalariesRecordById(id: string): Promise<SalariesRecord | undefined> {
    const records = await db.select().from(schema.salariesTable).where(sql`id = ${id}`).all();
    return records[0];
  }

  // Services methods
  async getServicesData(): Promise<ServicesRecord[]> {
    return db.select().from(schema.servicesTable).all();
  }

  async addServicesRecord(record: Omit<ServicesRecord, 'id'>): Promise<ServicesRecord> {
    const id = randomUUID();
    const newRecord = { id, ...record };
    await db.insert(schema.servicesTable).values(newRecord);
    return newRecord;
  }

  async updateServicesRecord(id: string, record: Partial<ServicesRecord>): Promise<ServicesRecord | undefined> {
    await db.update(schema.servicesTable).set(record).where(sql`id = ${id}`);
    return this.getServicesRecordById(id);
  }

  async deleteServicesRecord(id: string): Promise<boolean> {
    await db.delete(schema.servicesTable).where(sql`id = ${id}`);
    return true;
  }

  async getServicesRecordById(id: string): Promise<ServicesRecord | undefined> {
    const records = await db.select().from(schema.servicesTable).where(sql`id = ${id}`).all();
    return records[0];
  }

  // Student Hotel methods
  async getStudentHotelData(): Promise<StudentHotelRecord[]> {
    return db.select().from(schema.studentHotelTable).all();
  }

  async addStudentHotelRecord(record: Omit<StudentHotelRecord, 'id'>): Promise<StudentHotelRecord> {
    const id = randomUUID();
    const newRecord = { id, ...record };
    await db.insert(schema.studentHotelTable).values(newRecord);
    return newRecord;
  }

  async updateStudentHotelRecord(id: string, record: Partial<StudentHotelRecord>): Promise<StudentHotelRecord | undefined> {
    await db.update(schema.studentHotelTable).set(record).where(sql`id = ${id}`);
    return this.getStudentHotelRecordById(id);
  }

  async deleteStudentHotelRecord(id: string): Promise<boolean> {
    await db.delete(schema.studentHotelTable).where(sql`id = ${id}`);
    return true;
  }

  async getStudentHotelRecordById(id: string): Promise<StudentHotelRecord | undefined> {
    const records = await db.select().from(schema.studentHotelTable).where(sql`id = ${id}`).all();
    return records[0];
  }

  // Student Flight Ticket methods
  async getStudentFlightTicketData(): Promise<StudentFlightTicketRecord[]> {
    return db.select().from(schema.studentFlightTicketTable).all();
  }

  async addStudentFlightTicketRecord(record: Omit<StudentFlightTicketRecord, 'id'>): Promise<StudentFlightTicketRecord> {
    const id = randomUUID();
    const newRecord = { id, ...record };
    await db.insert(schema.studentFlightTicketTable).values(newRecord);
    return newRecord;
  }

  async updateStudentFlightTicketRecord(id: string, record: Partial<StudentFlightTicketRecord>): Promise<StudentFlightTicketRecord | undefined> {
    await db.update(schema.studentFlightTicketTable).set(record).where(sql`id = ${id}`);
    return this.getStudentFlightTicketRecordById(id);
  }

  async deleteStudentFlightTicketRecord(id: string): Promise<boolean> {
    await db.delete(schema.studentFlightTicketTable).where(sql`id = ${id}`);
    return true;
  }

  async getStudentFlightTicketRecordById(id: string): Promise<StudentFlightTicketRecord | undefined> {
    const records = await db.select().from(schema.studentFlightTicketTable).where(sql`id = ${id}`).all();
    return records[0];
  }

  // Authentication Papers methods
  async getAuthenticationPapersData(): Promise<AuthenticationPapersRecord[]> {
    return db.select().from(schema.authenticationPapersTable).all();
  }

  async addAuthenticationPapersRecord(record: Omit<AuthenticationPapersRecord, 'id'>): Promise<AuthenticationPapersRecord> {
    const id = randomUUID();
    const newRecord = { id, ...record };
    await db.insert(schema.authenticationPapersTable).values(newRecord);
    return newRecord;
  }

  async updateAuthenticationPapersRecord(id: string, record: Partial<AuthenticationPapersRecord>): Promise<AuthenticationPapersRecord | undefined> {
    await db.update(schema.authenticationPapersTable).set(record).where(sql`id = ${id}`);
    return this.getAuthenticationPapersRecordById(id);
  }

  async deleteAuthenticationPapersRecord(id: string): Promise<boolean> {
    await db.delete(schema.authenticationPapersTable).where(sql`id = ${id}`);
    return true;
  }

  async getAuthenticationPapersRecordById(id: string): Promise<AuthenticationPapersRecord | undefined> {
    const records = await db.select().from(schema.authenticationPapersTable).where(sql`id = ${id}`).all();
    return records[0];
  }

  // Student Visa methods
  async getStudentVisaData(): Promise<StudentVisaRecord[]> {
    return db.select().from(schema.studentVisaTable).all();
  }

  async addStudentVisaRecord(record: Omit<StudentVisaRecord, 'id'>): Promise<StudentVisaRecord> {
    const id = randomUUID();
    const newRecord = { id, ...record };
    await db.insert(schema.studentVisaTable).values(newRecord);
    return newRecord;
  }

  async updateStudentVisaRecord(id: string, record: Partial<StudentVisaRecord>): Promise<StudentVisaRecord | undefined> {
    await db.update(schema.studentVisaTable).set(record).where(sql`id = ${id}`);
    return this.getStudentVisaRecordById(id);
  }

  async deleteStudentVisaRecord(id: string): Promise<boolean> {
    await db.delete(schema.studentVisaTable).where(sql`id = ${id}`);
    return true;
  }

  async getStudentVisaRecordById(id: string): Promise<StudentVisaRecord | undefined> {
    const records = await db.select().from(schema.studentVisaTable).where(sql`id = ${id}`).all();
    return records[0];
  }

  // Application Fees methods
  async getApplicationFeesData(): Promise<ApplicationFeesRecord[]> {
    return db.select().from(schema.applicationFeesTable).all();
  }

  async addApplicationFeesRecord(record: Omit<ApplicationFeesRecord, 'id'>): Promise<ApplicationFeesRecord> {
    const id = randomUUID();
    const newRecord = { id, ...record };
    await db.insert(schema.applicationFeesTable).values(newRecord);
    return newRecord;
  }

  async updateApplicationFeesRecord(id: string, record: Partial<ApplicationFeesRecord>): Promise<ApplicationFeesRecord | undefined> {
    await db.update(schema.applicationFeesTable).set(record).where(sql`id = ${id}`);
    return this.getApplicationFeesRecordById(id);
  }

  async deleteApplicationFeesRecord(id: string): Promise<boolean> {
    await db.delete(schema.applicationFeesTable).where(sql`id = ${id}`);
    return true;
  }

  async getApplicationFeesRecordById(id: string): Promise<ApplicationFeesRecord | undefined> {
    const records = await db.select().from(schema.applicationFeesTable).where(sql`id = ${id}`).all();
    return records[0];
  }

  // Airline Tickets methods
  async getAirlineTicketsData(): Promise<AirlineTicketsRecord[]> {
    return db.select().from(schema.airlineTicketsTable).all();
  }

  async addAirlineTicketsRecord(record: Omit<AirlineTicketsRecord, 'id'>): Promise<AirlineTicketsRecord> {
    const id = randomUUID();
    const newRecord = { id, ...record };
    await db.insert(schema.airlineTicketsTable).values(newRecord);
    return newRecord;
  }

  async updateAirlineTicketsRecord(id: string, record: Partial<AirlineTicketsRecord>): Promise<AirlineTicketsRecord | undefined> {
    await db.update(schema.airlineTicketsTable).set(record).where(sql`id = ${id}`);
    return this.getAirlineTicketsRecordById(id);
  }

  async deleteAirlineTicketsRecord(id: string): Promise<boolean> {
    await db.delete(schema.airlineTicketsTable).where(sql`id = ${id}`);
    return true;
  }

  async getAirlineTicketsRecordById(id: string): Promise<AirlineTicketsRecord | undefined> {
    const records = await db.select().from(schema.airlineTicketsTable).where(sql`id = ${id}`).all();
    return records[0];
  }

  // Rent methods
  async getRentData(): Promise<RentRecord[]> {
    return db.select().from(schema.rentTable).all();
  }

  async addRentRecord(record: Omit<RentRecord, 'id'>): Promise<RentRecord> {
    const id = randomUUID();
    const newRecord = { id, ...record };
    await db.insert(schema.rentTable).values(newRecord);
    return newRecord;
  }

  async updateRentRecord(id: string, record: Partial<RentRecord>): Promise<RentRecord | undefined> {
    await db.update(schema.rentTable).set(record).where(sql`id = ${id}`);
    return this.getRentRecordById(id);
  }

  async deleteRentRecord(id: string): Promise<boolean> {
    await db.delete(schema.rentTable).where(sql`id = ${id}`);
    return true;
  }

  async getRentRecordById(id: string): Promise<RentRecord | undefined> {
    const records = await db.select().from(schema.rentTable).where(sql`id = ${id}`).all();
    return records[0];
  }

  // Lawyer Tax Contract methods
  async getLawyerTaxContractData(): Promise<LawyerTaxContractRecord[]> {
    return db.select().from(schema.lawyerTaxContractTable).all();
  }

  async addLawyerTaxContractRecord(record: Omit<LawyerTaxContractRecord, 'id'>): Promise<LawyerTaxContractRecord> {
    const id = randomUUID();
    const newRecord = { id, ...record };
    await db.insert(schema.lawyerTaxContractTable).values(newRecord);
    return newRecord;
  }

  async updateLawyerTaxContractRecord(id: string, record: Partial<LawyerTaxContractRecord>): Promise<LawyerTaxContractRecord | undefined> {
    await db.update(schema.lawyerTaxContractTable).set(record).where(sql`id = ${id}`);
    return this.getLawyerTaxContractRecordById(id);
  }

  async deleteLawyerTaxContractRecord(id: string): Promise<boolean> {
    await db.delete(schema.lawyerTaxContractTable).where(sql`id = ${id}`);
    return true;
  }

  async getLawyerTaxContractRecordById(id: string): Promise<LawyerTaxContractRecord | undefined> {
    const records = await db.select().from(schema.lawyerTaxContractTable).where(sql`id = ${id}`).all();
    return records[0];
  }

  // Bills methods
  async getBillsData(): Promise<BillsRecord[]> {
    return db.select().from(schema.billsTable).all();
  }

  async addBillsRecord(record: Omit<BillsRecord, 'id'>): Promise<BillsRecord> {
    const id = randomUUID();
    const newRecord = { id, ...record };
    await db.insert(schema.billsTable).values(newRecord);
    return newRecord;
  }

  async updateBillsRecord(id: string, record: Partial<BillsRecord>): Promise<BillsRecord | undefined> {
    await db.update(schema.billsTable).set(record).where(sql`id = ${id}`);
    return this.getBillsRecordById(id);
  }

  async deleteBillsRecord(id: string): Promise<boolean> {
    await db.delete(schema.billsTable).where(sql`id = ${id}`);
    return true;
  }

  async getBillsRecordById(id: string): Promise<BillsRecord | undefined> {
    const records = await db.select().from(schema.billsTable).where(sql`id = ${id}`).all();
    return records[0];
  }

  // Maintenance methods
  async getMaintenanceData(): Promise<MaintenanceRecord[]> {
    return db.select().from(schema.maintenanceTable).all();
  }

  async addMaintenanceRecord(record: Omit<MaintenanceRecord, 'id'>): Promise<MaintenanceRecord> {
    const id = randomUUID();
    const newRecord = { id, ...record };
    await db.insert(schema.maintenanceTable).values(newRecord);
    return newRecord;
  }

  async updateMaintenanceRecord(id: string, record: Partial<MaintenanceRecord>): Promise<MaintenanceRecord | undefined> {
    await db.update(schema.maintenanceTable).set(record).where(sql`id = ${id}`);
    return this.getMaintenanceRecordById(id);
  }

  async deleteMaintenanceRecord(id: string): Promise<boolean> {
    await db.delete(schema.maintenanceTable).where(sql`id = ${id}`);
    return true;
  }

  async getMaintenanceRecordById(id: string): Promise<MaintenanceRecord | undefined> {
    const records = await db.select().from(schema.maintenanceTable).where(sql`id = ${id}`).all();
    return records[0];
  }

  // Medical Expenses methods
  async getMedicalExpensesData(): Promise<MedicalExpensesRecord[]> {
    return db.select().from(schema.medicalExpensesTable).all();
  }

  async addMedicalExpensesRecord(record: Omit<MedicalExpensesRecord, 'id'>): Promise<MedicalExpensesRecord> {
    const id = randomUUID();
    const newRecord = { id, ...record };
    await db.insert(schema.medicalExpensesTable).values(newRecord);
    return newRecord;
  }

  async updateMedicalExpensesRecord(id: string, record: Partial<MedicalExpensesRecord>): Promise<MedicalExpensesRecord | undefined> {
    await db.update(schema.medicalExpensesTable).set(record).where(sql`id = ${id}`);
    return this.getMedicalExpensesRecordById(id);
  }

  async deleteMedicalExpensesRecord(id: string): Promise<boolean> {
    await db.delete(schema.medicalExpensesTable).where(sql`id = ${id}`);
    return true;
  }

  async getMedicalExpensesRecordById(id: string): Promise<MedicalExpensesRecord | undefined> {
    const records = await db.select().from(schema.medicalExpensesTable).where(sql`id = ${id}`).all();
    return records[0];
  }

  // General Expenses methods
  async getGeneralExpensesData(): Promise<GeneralExpensesRecord[]> {
    return db.select().from(schema.generalExpensesTable).all();
  }

  async addGeneralExpensesRecord(record: Omit<GeneralExpensesRecord, 'id'>): Promise<GeneralExpensesRecord> {
    const id = randomUUID();
    const newRecord = { id, ...record };
    await db.insert(schema.generalExpensesTable).values(newRecord);
    return newRecord;
  }

  async updateGeneralExpensesRecord(id: string, record: Partial<GeneralExpensesRecord>): Promise<GeneralExpensesRecord | undefined> {
    await db.update(schema.generalExpensesTable).set(record).where(sql`id = ${id}`);
    return this.getGeneralExpensesRecordById(id);
  }

  async deleteGeneralExpensesRecord(id: string): Promise<boolean> {
    await db.delete(schema.generalExpensesTable).where(sql`id = ${id}`);
    return true;
  }

  async getGeneralExpensesRecordById(id: string): Promise<GeneralExpensesRecord | undefined> {
    const records = await db.select().from(schema.generalExpensesTable).where(sql`id = ${id}`).all();
    return records[0];
  }

  // Social Media methods
  async getSocialMediaData(): Promise<SocialMediaRecord[]> {
    return db.select().from(schema.socialMediaTable).all();
  }

  async addSocialMediaRecord(record: Omit<SocialMediaRecord, 'id'>): Promise<SocialMediaRecord> {
    const id = randomUUID();
    const newRecord = { id, ...record };
    await db.insert(schema.socialMediaTable).values(newRecord);
    return newRecord;
  }

  async updateSocialMediaRecord(id: string, record: Partial<SocialMediaRecord>): Promise<SocialMediaRecord | undefined> {
    await db.update(schema.socialMediaTable).set(record).where(sql`id = ${id}`);
    return this.getSocialMediaRecordById(id);
  }

  async deleteSocialMediaRecord(id: string): Promise<boolean> {
    await db.delete(schema.socialMediaTable).where(sql`id = ${id}`);
    return true;
  }

  async getSocialMediaRecordById(id: string): Promise<SocialMediaRecord | undefined> {
    const records = await db.select().from(schema.socialMediaTable).where(sql`id = ${id}`).all();
    return records[0];
  }

  // Trip Travel Bonus methods
  async getTripTravelBonusData(): Promise<TripTravelBonusRecord[]> {
    return db.select().from(schema.tripTravelBonusTable).all();
  }

  async addTripTravelBonusRecord(record: Omit<TripTravelBonusRecord, 'id'>): Promise<TripTravelBonusRecord> {
    const id = randomUUID();
    const newRecord = { id, ...record };
    await db.insert(schema.tripTravelBonusTable).values(newRecord);
    return newRecord;
  }

  async updateTripTravelBonusRecord(id: string, record: Partial<TripTravelBonusRecord>): Promise<TripTravelBonusRecord | undefined> {
    await db.update(schema.tripTravelBonusTable).set(record).where(sql`id = ${id}`);
    return this.getTripTravelBonusRecordById(id);
  }

  async deleteTripTravelBonusRecord(id: string): Promise<boolean> {
    await db.delete(schema.tripTravelBonusTable).where(sql`id = ${id}`);
    return true;
  }

  async getTripTravelBonusRecordById(id: string): Promise<TripTravelBonusRecord | undefined> {
    const records = await db.select().from(schema.tripTravelBonusTable).where(sql`id = ${id}`).all();
    return records[0];
  }

  // Employee Visa methods
  async getEmployeeVisaData(): Promise<EmployeeVisaRecord[]> {
    return db.select().from(schema.employeeVisaTable).all();
  }

  async addEmployeeVisaRecord(record: Omit<EmployeeVisaRecord, 'id'>): Promise<EmployeeVisaRecord> {
    const id = randomUUID();
    const newRecord = { id, ...record };
    await db.insert(schema.employeeVisaTable).values(newRecord);
    return newRecord;
  }

  async updateEmployeeVisaRecord(id: string, record: Partial<EmployeeVisaRecord>): Promise<EmployeeVisaRecord | undefined> {
    await db.update(schema.employeeVisaTable).set(record).where(sql`id = ${id}`);
    return this.getEmployeeVisaRecordById(id);
  }

  async deleteEmployeeVisaRecord(id: string): Promise<boolean> {
    await db.delete(schema.employeeVisaTable).where(sql`id = ${id}`);
    return true;
  }

  async getEmployeeVisaRecordById(id: string): Promise<EmployeeVisaRecord | undefined> {
    const records = await db.select().from(schema.employeeVisaTable).where(sql`id = ${id}`).all();
    return records[0];
  }

  // Money Transfer methods
  async getMoneyTransferData(): Promise<MoneyTransferRecord[]> {
    return db.select().from(schema.moneyTransferTable).all();
  }

  async addMoneyTransferRecord(record: Omit<MoneyTransferRecord, 'id'>): Promise<MoneyTransferRecord> {
    const id = randomUUID();
    const newRecord = { id, ...record };
    await db.insert(schema.moneyTransferTable).values(newRecord);
    return newRecord;
  }

  async updateMoneyTransferRecord(id: string, record: Partial<MoneyTransferRecord>): Promise<MoneyTransferRecord | undefined> {
    await db.update(schema.moneyTransferTable).set(record).where(sql`id = ${id}`);
    return this.getMoneyTransferRecordById(id);
  }

  async deleteMoneyTransferRecord(id: string): Promise<boolean> {
    await db.delete(schema.moneyTransferTable).where(sql`id = ${id}`);
    return true;
  }

  async getMoneyTransferRecordById(id: string): Promise<MoneyTransferRecord | undefined> {
    const records = await db.select().from(schema.moneyTransferTable).where(sql`id = ${id}`).all();
    return records[0];
  }
}

export const sqliteStorage = new SQLiteStorage();

// Export the schema for direct access if needed
export { schema };