import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createId } from '@paralleldrive/cuid2';

// ABEER 2025 - Financial data
export const abeerTable = sqliteTable("abeer", {
  id: text("id").primaryKey(),
  month: text("month"),
  incomeMalaysia: real("income_malaysia").default(0),
  totalIncome: real("total_income").default(0),
  malaysiaOffice: real("malaysia_office").default(0),
  salaries: real("salaries").default(0),
  subAgent: real("sub_agent").default(0),
  socialMedia: real("social_media").default(0),
  totalOutcome: real("total_outcome").default(0),
});

// DATA 2025 - Student data
export const dataTable = sqliteTable("data", {
  id: text("id").primaryKey(),
  month: text("month"),
  no: integer("no").default(0),
  name: text("name"),
  uni: text("uni"),
  program: text("program"),
});

// COMMISSION 24
export const commissionTable = sqliteTable("commission", {
  id: text("id").primaryKey(),
  no: integer("no").default(0),
  university: text("university"),
  ref: text("ref"),
  month: text("month"),
  otherIncome: real("other_income").default(0),
  receivedDate: text("received_date"),
  currency: text("currency"),
  amount: real("amount").default(0),
  invoiceDate: text("invoice_date"),
  notes: text("notes"),
});

// INVOICES
export const invoiceTable = sqliteTable("invoice", {
  id: text("id").primaryKey(),
  no: integer("no").default(0),
  uni: text("uni"),
  type: text("type"),
  date: text("date"),
});

// ADV BILLS 2025-2026
export const advBillTable = sqliteTable("adv_bill", {
  id: text("id").primaryKey(),
  no: integer("no").default(0),
  billId: text("bill_id"),
  date: text("date"),
  description: text("description"),
  amount: real("amount").default(0),
});

// Subagent table
export const subagentTable = sqliteTable("subagent", {
  id: text("id").primaryKey(),
  no: integer("no").default(0),
  subagentName: text("subagent_name"),
  date: text("date"),
  ref: text("ref"),
  referralCommissionOn: text("referral_commission_on"),
  amount: real("amount").default(0),
  month: text("month"),
});

// BONUS 2024
export const bonusTable = sqliteTable("bonus", {
  id: text("id").primaryKey(),
  no: integer("no").default(0),
  name: text("name"),
  uni: text("uni"),
  passportNumber: text("passport_number"),
  nationality: text("nationality"),
  visa: text("visa"),
  counselor: text("counselor"),
  program: text("program"),
  intake: text("intake"),
  tuitionFeesPayment: text("tuition_fees_payment"),
  enrollment: text("enrollment"),
  commission: text("commission"),
  usd: real("usd").default(0),
});

// BONUS 2024 - Claimed
export const bonusClaimedTable = sqliteTable("bonus_claimed", {
  id: text("id").primaryKey(),
  no: integer("no").default(0),
  name: text("name"),
  uni: text("uni"),
  passportNumber: text("passport_number"),
  nationality: text("nationality"),
  visa: text("visa"),
  counselor: text("counselor"),
  program: text("program"),
  intake: text("intake"),
  tuitionFeesPayment: text("tuition_fees_payment"),
  enrollment: text("enrollment"),
  commission: text("commission"),
  rm: real("rm").default(0),
  usd: real("usd").default(0),
  claimedDate: text("claimed_date"),
  claimedBy: text("claimed_by"),
});

// BONUS 2024 - Not Claimed
export const bonusNotClaimedTable = sqliteTable("bonus_not_claimed", {
  id: text("id").primaryKey(),
  no: integer("no").default(0),
  name: text("name"),
  uni: text("uni"),
  passportNumber: text("passport_number"),
  nationality: text("nationality"),
  visa: text("visa"),
  counselor: text("counselor"),
  program: text("program"),
  intake: text("intake"),
  tuitionFeesPayment: text("tuition_fees_payment"),
  enrollment: text("enrollment"),
  commission: text("commission"),
  rm: real("rm").default(0),
  usd: real("usd").default(0),
});

// Registration Form 2025 - Val Approved
export const registrationValApprovedTable = sqliteTable("registration_val_approved", {
  id: text("id").primaryKey(),
  no: integer("no").default(0),
  name: text("name"),
  uni: text("uni"),
  passportNumber: text("passport_number"),
  nationality: text("nationality"),
  visa: text("visa"),
  valApproval: text("val_approval"),
  counselor: text("counselor"),
  program: text("program"),
  submissionMonth: text("submission_month"),
  paidMonth: text("paid_month"),
  arrivalDate: text("arrival_date"),
  note: text("note"),
  sheetType: text("sheet_type").default("Val Approved"),
});

// Registration Form 2025 - Enrollment
export const registrationEnrollmentTable = sqliteTable("registration_enrollment", {
  id: text("id").primaryKey(),
  
  name: text("name"),
  uni: text("uni"),
  passportNumber: text("passport_number"),
  nationality: text("nationality"),
  visa: text("visa"),
  counselor: text("counselor"),
  program: text("program"),
  intake: text("intake"),
  submissionMonth: text("submission_month"),
  paidMonth: text("paid_month"),
  sheetType: text("sheet_type").default("Enrollment"),
});

// Registration Form 2025 - Visa Process
export const registrationVisaProcessTable = sqliteTable("registration_visa_process", {
  id: text("id").primaryKey(),
  no: integer("no").default(0),
  name: text("name"),
  uni: text("uni"),
  passportNumber: text("passport_number"),
  nationality: text("nationality"),
  visa: text("visa"),
  counselor: text("counselor"),
  program: text("program"),
  submissionMonth: text("submission_month"),
  paidMonth: text("paid_month"),
  note: text("note"),
  sheetType: text("sheet_type").default("Visa Process"),


});

// Agent table for storing agent information
export const agentTable = sqliteTable("agent", {
  id: text("id").primaryKey().default(sql`(SELECT lower(hex(randomblob(16))))`),
  name: text("name").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Agent bonus table for tracking bonuses
export const agentBonusTable = sqliteTable("agent_bonus", {
  id: text("id").primaryKey().default(sql`(SELECT lower(hex(randomblob(16))))`),
  agentId: text("agent_id").notNull().references(() => agentTable.id),
  studentName: text("student_name").notNull(),
  uni: text("uni"),
  program: text("program"),
  month: text("month"),
  enrollment:text("enrollment"),
  enrollmentBonus: real("enrollment_bonus").default(0),
  visaBonus: real("visa_bonus").default(0),
  commissionFromUni: text("commission_from_uni"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});
  
// Registration Form 2025 - Not Submitted
export const registrationNotSubmittedTable = sqliteTable("registration_not_submitted", {
  id: text("id").primaryKey(),
  no: integer("no").default(0),
  name: text("name"),
  uni: text("uni"),
  passportNumber: text("passport_number"),
  nationality: text("nationality"),
  program: text("program"),
  counselor: text("counselor"),
  month: text("month"),
  payment: text("payment"),
  sheetType: text("sheet_type").default("Not Submitted"),
});

// Registration Form 2025 - Cancelled
export const registrationCancelledTable = sqliteTable("registration_cancelled", {
  id: text("id").primaryKey(),
  no: integer("no").default(0),
  name: text("name"),
  uni: text("uni"),
  passportNumber: text("passport_number"),
  nationality: text("nationality"),
  visa: text("visa"),
  program: text("program"),
  counselor: text("counselor"),
  month: text("month"),
  payment: text("payment"),
  sheetType: text("sheet_type").default("Cancelled"),
});

// Legacy table for backward compatibility
export const registrationTable = sqliteTable("registration", {
  id: text("id").primaryKey(),
  no: integer("no").default(0),
  name: text("name"),
  uni: text("uni"),
  passportNumber: text("passport_number"),
  nationality: text("nationality"),
  visa: text("visa"),
  valApproval: text("val_approval"),
  counselor: text("counselor"),
  program: text("program"),
  submissionMonth: text("submission_month"),
  paidMonth: text("paid_month"),
  arrivalDate: text("arrival_date"),
  sheetType: text("sheet_type").default("Val Approved"),
});

// Student table for registration
export const studentTable = sqliteTable("student", {
  id: text("id").primaryKey(),
  passportNumber: text("passport_number").notNull().unique(),
  name: text("name").notNull(),
  nationality: text("nationality").notNull(),
  uni: text("uni").notNull(),
  program: text("program").notNull(),
  counselor: text("counselor").notNull(),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

// Agent bonus details table for tracking additional bonus information
export const agentBonusDetailsTable = sqliteTable("agent_bonus_details", {
  id: text("id").primaryKey(),
  agentId: text("agent_id").notNull().references(() => agentTable.id),
  studentId: text("student_id").notNull().references(() => studentTable.id),
  passportNumber: text("passport_number").notNull(),
  month: text("month"),
  enrollmentStatus: text("enrollment_status"),
  enrollmentBonus: real("enrollment_bonus").default(0),
  visaBonus: real("visa_bonus").default(0),
  commissionFromUni: real("commission_from_uni").default(0),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Sent Invoices table
export const sentInvoicesTable = sqliteTable("sent_invoices", {
  id: text("id").primaryKey(),
  no: integer("no").default(0),
  uni: text("uni"),
  type: text("type"),
  date: text("date"),
  drHaniAccount: real("dr_hani_account").default(0),
  currency: text("currency"),
  amount: real("amount").default(0),
  applyuni: text("apply_uni"),
});

// UCSI table
export const ucsiTable = sqliteTable("ucsi", {
  id: text("id").primaryKey(),
  no: integer("no").default(0),
  uni: text("university"),
  type: text("type"),
  date: text("date"),
  drHaniAccount: real("dr_hani_account").default(0),
  currency: text("currency"),
  amount: real("amount").default(0),
});

// UCSI Invoices table
export const ucsiInvoicesTable = sqliteTable("ucsi_invoices", {
  id: text("id").primaryKey(),
  no: integer("no").default(0),
  uni: text("university"),
  type: text("type"),
  date: text("date"),
  currency: text("currency"),
  amount: real("amount").default(0),
  receivedDate: text("received_date"),
});

// Income Outcome table
export const incomeOutcomeTable = sqliteTable("income_outcome", {
  id: text("id").primaryKey(),
  no: integer("no").default(sql`(SELECT COALESCE(MAX(no), 0) + 1 FROM income_outcome)`),
  date: text("date"),
  country: text("country"),
  income: real("income").default(0),
  office: real("office").default(0),
  salaries: real("salaries").default(0),
  subagent: real("subagent").default(0),
  socialmedia: real("socialmedia").default(0),
  outcome: real("outcome").default(0),
});

// Events table
export const eventsTable = sqliteTable("events", {
  id: text("id").primaryKey(),
  no: integer("no").default(0),
  date: text("date"),
  uni: text("uni"),
  currency: text("currency"),
  income: real("income").default(0),
  expenses: real("expenses").default(0),
  country: text("country"),
});

// Salaries table
export const salariesTable = sqliteTable("salaries", {
  id: text("id").primaryKey(),
  name: text("name"),
  amount: real("amount").default(0),
  date: text("date"),
});

// Services table
export const servicesTable = sqliteTable("services", {
  id: text("id").primaryKey(),
  name: text("name"),
  date: text("date"),
  amount: real("amount").default(0),
});

// Student Hotel table
export const studentHotelTable = sqliteTable("student_hotel", {
  id: text("id").primaryKey(),
  name: text("name"),
  date: text("date"),
  amount: real("amount").default(0),
});

// Student Flight Ticket table
export const studentFlightTicketTable = sqliteTable("student_flight_ticket", {
  id: text("id").primaryKey(),
  name: text("name"),
  date: text("date"),
  amount: real("amount").default(0),
});

// Authentication of Papers table
export const authenticationPapersTable = sqliteTable("authentication_papers", {
  id: text("id").primaryKey(),
  amount: real("amount").default(0),
  ref: text("ref"),
  date: text("date"),
  ref1: text("ref_1"),
});

// Student Visa table
export const studentVisaTable = sqliteTable("student_visa", {
  id: text("id").primaryKey(),
  amount: real("amount").default(0),
  date: text("date"),
  ref: text("ref"),
  uni: text("uni"),
});

// Application Fees table
export const applicationFeesTable = sqliteTable("application_fees", {
  id: text("id").primaryKey(),
  amount: real("amount").default(0),
  date: text("date"),
  ref: text("ref"),
  uni: text("uni"),
});

// Airline Tickets table
export const airlineTicketsTable = sqliteTable("airline_tickets", {
  id: text("id").primaryKey(),
  amount: real("amount").default(0),
  name: text("name"),
  date: text("date"),
  ref: text("ref"),
});

// Rent table
export const rentTable = sqliteTable("rent", {
  id: text("id").primaryKey(),
  amount: real("amount").default(0),
  forMonth: text("for_month"),
  date: text("date"),
  ref: text("ref"),
});

// Lawyer Tax Contract table
export const lawyerTaxContractTable = sqliteTable("lawyer_tax_contract", {
  id: text("id").primaryKey(),
  amount: real("amount").default(0),
  date: text("date"),
  ref: text("ref"),
});

// Bills table
export const billsTable = sqliteTable("bills", {
  id: text("id").primaryKey(),
  amount: real("amount").default(0),
  date: text("date"),
  billType: text("bill_type"),
  ref: text("ref"),
});

// Maintenance table
export const maintenanceTable = sqliteTable("maintenance", {
  id: text("id").primaryKey(),
  amount: real("amount").default(0),
  date: text("date"),
  type: text("type"),
});

// Medical Expenses table
export const medicalExpensesTable = sqliteTable("medical_expenses", {
  id: text("id").primaryKey(),
  name: text("name"),
  amount: real("amount").default(0),
  date: text("date"),
});

// General Expenses table
export const generalExpensesTable = sqliteTable("general_expenses", {
  id: text("id").primaryKey(),
  type: text("type"),
  amount: real("amount").default(0),
  date: text("date"),
});

// Social Media table
export const socialMediaTable = sqliteTable("social_media", {
  id: text("id").primaryKey(),
  amount: real("amount").default(0),
  date: text("date"),
  ref: text("ref"),
  bankRef: text("bank_ref"),
});

// Trip Travel Bonus table
export const tripTravelBonusTable = sqliteTable("trip_travel_bonus", {
  id: text("id").primaryKey(),
  name: text("name"),
  amount: real("amount").default(0),
  date: text("date"),
});

// Employee Visa table
export const employeeVisaTable = sqliteTable("employee_visa", {
  id: text("id").primaryKey(),
  employeeName: text("employee_name"),
  amount: real("amount").default(0),
  date: text("date"),
  ref: text("ref"),
});

// Money Transfer table
export const moneyTransferTable = sqliteTable("money_transfer", {
  id: text("id").primaryKey(),
  amount: real("amount").default(0),
  currency: text("currency"),
  date: text("date"),
  name: text("name"),
  ref: text("ref"),
  country: text("country"),
});