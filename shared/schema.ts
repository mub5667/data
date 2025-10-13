import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ABEER 2025 - Financial data
export interface AbeerRecord {
  id: string;
  month: string;
  incomeMalaysia: number;
  totalIncome: number;
  malaysiaOffice: number;
  salaries: number;
  subAgent: number;
  socialMedia: number;
  totalOutcome: number;
}

// DATA 2025 - Student data
export interface DataRecord {
  id: string;
  month: string;
  no: number;
  name: string;
  uni: string;
  program: string;
}

// COMMISSION 24
export interface CommissionRecord {
  id: string;
  no: number;
  university: string;
  ref: string;
  month: string;
  otherIncome: number;
  receivedDate: string;
  currency: string;
  amount: number;
  invoiceDate: string;
  notes: string;
}

// INVOICES
export interface InvoiceRecord {
  id: string;
  no: number;
  uni: string;
  type: string;
  date: string;
}

// ADV BILLS 2025-2026
export interface AdvBillRecord {
  id: string;
  amount: number;
}

// BONUS 2024
export interface BonusRecord {
  id: string;
  no: number;
  name: string;
  uni: string;
  passportNumber: string;
  nationality: string;
  visa: string;
  counselor: string;
  program: string;
  intake: string;
  tuitionFeesPayment: string;
  enrollment: string;
  commission: string;
  usd: number;
}

// BONUS 2024 - Claimed
export interface BonusClaimedRecord extends BonusRecord {
  rm: number;
  claimedDate: string;
  claimedBy: string;
}

// BONUS 2024 - Not Claimed
export interface BonusNotClaimedRecord extends BonusRecord {
  rm: number;
}

// Agent record for bonus management
export interface AgentRecord {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Agent bonus record for tracking bonuses
export interface AgentBonusRecord {
  id: string;
  agentId: string;
  studentId: string;
  passportNumber: string;
  month: string;
  enrollmentStatus: string;
  enrollmentBonus: number;
  visaBonus: number;
  commissionFromUni: string;
  createdAt: string;
  updatedAt: string;
}

// Registration Form 2025
export interface RegistrationRecord {
  id: string;
  no: number;
  name: string;
  uni: string;
  passportNumber: string;
  nationality: string;
  visa: string;
  valApproval: string;
  counselor: string;
  program: string;
  submissionMonth: string;
  paidMonth: string;
  arrivalDate: string;
  sheetType?: string;
}

// Registration Val Approved Record
export interface RegistrationValApprovedRecord extends RegistrationRecord {
  note: string;
  sheetType: string;
}

// Registration Enrollment Record
export interface RegistrationEnrollmentRecord extends RegistrationRecord {
  sheetType: string;
}

// Registration Visa Process Record
export interface RegistrationVisaProcessRecord extends RegistrationRecord {
  sheetType: string;
}

// Registration Not Submitted Record
export interface RegistrationNotSubmittedRecord extends RegistrationRecord {
  sheetType: string;
}

// Registration Cancelled Record
export interface RegistrationCancelledRecord extends RegistrationRecord {
  sheetType: string;
}

// Student Record
export interface StudentRecord {
  id: string;
  passportNumber: string;
  name: string;
  nationality: string;
  uni: string;
  program: string;
  counselor: string;
  createdAt?: string;
  updatedAt?: string;
}
