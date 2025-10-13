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
  AgentRecord, AgentBonusRecord
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
    enrollment_bonus TEXT,
    visa_bonus TEXT,
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
      amount REAL DEFAULT 0
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
}

export const sqliteStorage = new SQLiteStorage();

// Export the schema for direct access if needed
export { schema };