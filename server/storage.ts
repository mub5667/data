import type { 
  User, InsertUser, AbeerRecord, DataRecord, CommissionRecord, 
  InvoiceRecord, AdvBillRecord, BonusRecord, BonusClaimedRecord, BonusNotClaimedRecord, RegistrationRecord, AgentRecord, AgentBonusRecord 
} from "@shared/schema";
import { randomUUID } from "crypto";
import { 
  loadAbeerData, loadDataRecords, loadCommissionData, 
  loadInvoiceData, loadAdvBillData, loadBonusData, loadBonusClaimedData, loadBonusNotClaimedData, loadRegistrationData 
} from "./excel-loader";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAbeerData(): Promise<AbeerRecord[]>;
  getDataRecords(): Promise<DataRecord[]>;
  getCommissionData(): Promise<CommissionRecord[]>;
  getInvoiceData(): Promise<InvoiceRecord[]>;
  getAdvBillData(): Promise<AdvBillRecord[]>;
  getBonusData(sheetName?: string): Promise<BonusRecord[]>;
  getBonusClaimedData(): Promise<BonusClaimedRecord[]>;
  getBonusNotClaimedData(): Promise<BonusNotClaimedRecord[]>;
  getRegistrationData(): Promise<RegistrationRecord[]>;
  
  // Agent related methods
  getAgentData(): Promise<AgentRecord[]>;
  getAgentBonusData(): Promise<AgentBonusRecord[]>;
  
  addAbeerRecord(record: Omit<AbeerRecord, 'id'>): Promise<AbeerRecord>;
  addDataRecord(record: Omit<DataRecord, 'id'>): Promise<DataRecord>;
  addCommissionRecord(record: Omit<CommissionRecord, 'id'>): Promise<CommissionRecord>;
  addInvoiceRecord(record: Omit<InvoiceRecord, 'id'>): Promise<InvoiceRecord>;
  addAdvBillRecord(record: Omit<AdvBillRecord, 'id'>): Promise<AdvBillRecord>;
  addBonusRecord(record: Omit<BonusRecord, 'id'>): Promise<BonusRecord>;
  addBonusClaimedRecord(record: Omit<BonusClaimedRecord, 'id'>): Promise<BonusClaimedRecord>;
  addBonusNotClaimedRecord(record: Omit<BonusNotClaimedRecord, 'id'>): Promise<BonusNotClaimedRecord>;
  addRegistrationRecord(record: Omit<RegistrationRecord, 'id'>): Promise<RegistrationRecord>;
  
  // Agent related methods
  addAgentRecord(record: Omit<AgentRecord, 'id'>): Promise<AgentRecord>;
  addAgentBonusRecord(record: Omit<AgentBonusRecord, 'id'>): Promise<AgentBonusRecord>;
  
  updateAbeerRecord(id: string, record: Partial<AbeerRecord>): Promise<AbeerRecord | undefined>;
  updateDataRecord(id: string, record: Partial<DataRecord>): Promise<DataRecord | undefined>;
  updateCommissionRecord(id: string, record: Partial<CommissionRecord>): Promise<CommissionRecord | undefined>;
  updateInvoiceRecord(id: string, record: Partial<InvoiceRecord>): Promise<InvoiceRecord | undefined>;
  updateAdvBillRecord(id: string, record: Partial<AdvBillRecord>): Promise<AdvBillRecord | undefined>;
  updateBonusRecord(id: string, record: Partial<BonusRecord>): Promise<BonusRecord | undefined>;
  updateBonusClaimedRecord(id: string, record: Partial<BonusClaimedRecord>): Promise<BonusClaimedRecord | undefined>;
  updateBonusNotClaimedRecord(id: string, record: Partial<BonusNotClaimedRecord>): Promise<BonusNotClaimedRecord | undefined>;
  updateRegistrationRecord(id: string, record: Partial<RegistrationRecord>): Promise<RegistrationRecord | undefined>;
  
  // Agent related methods
  updateAgentRecord(id: string, record: Partial<AgentRecord>): Promise<AgentRecord | undefined>;
  updateAgentBonusRecord(id: string, record: Partial<AgentBonusRecord>): Promise<AgentBonusRecord | undefined>;
  
  deleteAbeerRecord(id: string): Promise<boolean>;
  deleteDataRecord(id: string): Promise<boolean>;
  deleteCommissionRecord(id: string): Promise<boolean>;
  deleteInvoiceRecord(id: string): Promise<boolean>;
  deleteAdvBillRecord(id: string): Promise<boolean>;
  deleteBonusRecord(id: string): Promise<boolean>;
  deleteBonusClaimedRecord(id: string): Promise<boolean>;
  deleteBonusNotClaimedRecord(id: string): Promise<boolean>;
  deleteRegistrationRecord(id: string): Promise<boolean>;
  
  // Agent related methods
  deleteAgentRecord(id: string): Promise<boolean>;
  deleteAgentBonusRecord(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private abeerData: AbeerRecord[];
  private dataRecords: DataRecord[];
  private commissionData: CommissionRecord[];
  private invoiceData: InvoiceRecord[];
  private advBillData: AdvBillRecord[];
  private bonusData: BonusRecord[];
  private bonusClaimedData: BonusClaimedRecord[];
  private bonusNotClaimedData: BonusNotClaimedRecord[];
  private registrationData: RegistrationRecord[];
  private agentData: AgentRecord[];
  private agentBonusData: AgentBonusRecord[];

  constructor() {
    this.users = new Map();
    this.abeerData = loadAbeerData();
    this.dataRecords = loadDataRecords();
    this.commissionData = loadCommissionData();
    this.invoiceData = loadInvoiceData();
    this.advBillData = loadAdvBillData();
    this.bonusData = loadBonusData();
    this.bonusClaimedData = loadBonusClaimedData();
    this.bonusNotClaimedData = loadBonusNotClaimedData();
    this.registrationData = loadRegistrationData();
    this.agentData = [];
    this.agentBonusData = [];
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAbeerData(): Promise<AbeerRecord[]> {
    return this.abeerData;
  }

  async getDataRecords(): Promise<DataRecord[]> {
    return this.dataRecords;
  }

  async getCommissionData(): Promise<CommissionRecord[]> {
    return this.commissionData;
  }

  async getInvoiceData(): Promise<InvoiceRecord[]> {
    return this.invoiceData;
  }

  async getAdvBillData(): Promise<AdvBillRecord[]> {
    return this.advBillData;
  }

  async getBonusData(sheetName?: string): Promise<BonusRecord[]> {
    if (!sheetName) {
      return this.bonusData;
    }
    
    if (sheetName === 'claimed') {
      return this.bonusClaimedData as BonusRecord[];
    }
    
    if (sheetName === 'not-claimed') {
      return this.bonusNotClaimedData as BonusRecord[];
    }
    
    // If sheet name is provided but not recognized, return mock data
    const mockData = Array(10).fill(null).map((_, index) => ({
      id: `${index + 1}`,
      name: `Student ${index + 1}`,
      passportNumber: `P${100000 + index}`,
      visa: "Approved",
      intake: "Fall 2024",
      tuitionFeesPayment: "$5000",
      enrollment: "Completed",
      commission: "$500",
      amount: "$1000",
      visaBonus: "$300",
      enrollmentBonus: "$200",
      commFromUni: "$400"
    }));
    
    return mockData as BonusRecord[];
  }
  
  async getBonusClaimedData(): Promise<BonusClaimedRecord[]> {
    return this.bonusClaimedData;
  }
  
  async getBonusNotClaimedData(): Promise<BonusNotClaimedRecord[]> {
    return this.bonusNotClaimedData;
  }

  async getRegistrationData(): Promise<RegistrationRecord[]> {
    return this.registrationData;
  }
  
  async getAgentData(): Promise<AgentRecord[]> {
    return this.agentData;
  }
  
  async getAgentBonusData(): Promise<AgentBonusRecord[]> {
    return this.agentBonusData;
  }

  async addAbeerRecord(record: Omit<AbeerRecord, 'id'>): Promise<AbeerRecord> {
    const newRecord = { ...record, id: randomUUID() };
    this.abeerData.push(newRecord);
    return newRecord;
  }

  async addDataRecord(record: Omit<DataRecord, 'id'>): Promise<DataRecord> {
    const newRecord = { ...record, id: randomUUID() };
    this.dataRecords.push(newRecord);
    return newRecord;
  }

  async addCommissionRecord(record: Omit<CommissionRecord, 'id'>): Promise<CommissionRecord> {
    const newRecord = { ...record, id: randomUUID() };
    this.commissionData.push(newRecord);
    return newRecord;
  }

  async addInvoiceRecord(record: Omit<InvoiceRecord, 'id'>): Promise<InvoiceRecord> {
    const newRecord = { ...record, id: randomUUID() };
    this.invoiceData.push(newRecord);
    return newRecord;
  }

  async addAdvBillRecord(record: Omit<AdvBillRecord, 'id'>): Promise<AdvBillRecord> {
    const newRecord = { ...record, id: randomUUID() };
    this.advBillData.push(newRecord);
    return newRecord;
  }

  async addBonusRecord(record: Omit<BonusRecord, 'id'>): Promise<BonusRecord> {
    const newRecord = { ...record, id: randomUUID() };
    this.bonusData.push(newRecord);
    return newRecord;
  }
  
  async addBonusClaimedRecord(record: Omit<BonusClaimedRecord, 'id'>): Promise<BonusClaimedRecord> {
    const newRecord = { ...record, id: randomUUID() };
    this.bonusClaimedData.push(newRecord);
    return newRecord;
  }
  
  async addBonusNotClaimedRecord(record: Omit<BonusNotClaimedRecord, 'id'>): Promise<BonusNotClaimedRecord> {
    const newRecord = { ...record, id: randomUUID() };
    this.bonusNotClaimedData.push(newRecord);
    return newRecord;
  }

  async addRegistrationRecord(record: Omit<RegistrationRecord, 'id'>): Promise<RegistrationRecord> {
    const newRecord = { ...record, id: randomUUID() };
    this.registrationData.push(newRecord);
    return newRecord;
  }
  
  async addAgentRecord(record: Omit<AgentRecord, 'id'>): Promise<AgentRecord> {
    const newRecord = { ...record, id: randomUUID() };
    this.agentData.push(newRecord);
    return newRecord;
  }
  
  async addAgentBonusRecord(record: Omit<AgentBonusRecord, 'id'>): Promise<AgentBonusRecord> {
    const newRecord = { ...record, id: randomUUID() };
    this.agentBonusData.push(newRecord);
    return newRecord;
  }

  async updateAbeerRecord(id: string, record: Partial<AbeerRecord>): Promise<AbeerRecord | undefined> {
    const index = this.abeerData.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.abeerData[index] = { ...this.abeerData[index], ...record };
    return this.abeerData[index];
  }

  async updateDataRecord(id: string, record: Partial<DataRecord>): Promise<DataRecord | undefined> {
    const index = this.dataRecords.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.dataRecords[index] = { ...this.dataRecords[index], ...record };
    return this.dataRecords[index];
  }

  async updateCommissionRecord(id: string, record: Partial<CommissionRecord>): Promise<CommissionRecord | undefined> {
    const index = this.commissionData.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.commissionData[index] = { ...this.commissionData[index], ...record };
    return this.commissionData[index];
  }

  async updateInvoiceRecord(id: string, record: Partial<InvoiceRecord>): Promise<InvoiceRecord | undefined> {
    const index = this.invoiceData.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.invoiceData[index] = { ...this.invoiceData[index], ...record };
    return this.invoiceData[index];
  }

  async updateAdvBillRecord(id: string, record: Partial<AdvBillRecord>): Promise<AdvBillRecord | undefined> {
    const index = this.advBillData.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.advBillData[index] = { ...this.advBillData[index], ...record };
    return this.advBillData[index];
  }

  async updateBonusRecord(id: string, record: Partial<BonusRecord>): Promise<BonusRecord | undefined> {
    const index = this.bonusData.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.bonusData[index] = { ...this.bonusData[index], ...record };
    return this.bonusData[index];
  }
  
  async updateBonusClaimedRecord(id: string, record: Partial<BonusClaimedRecord>): Promise<BonusClaimedRecord | undefined> {
    const index = this.bonusClaimedData.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.bonusClaimedData[index] = { ...this.bonusClaimedData[index], ...record };
    return this.bonusClaimedData[index];
  }
  
  async updateBonusNotClaimedRecord(id: string, record: Partial<BonusNotClaimedRecord>): Promise<BonusNotClaimedRecord | undefined> {
    const index = this.bonusNotClaimedData.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.bonusNotClaimedData[index] = { ...this.bonusNotClaimedData[index], ...record };
    return this.bonusNotClaimedData[index];
  }

  async updateRegistrationRecord(id: string, record: Partial<RegistrationRecord>): Promise<RegistrationRecord | undefined> {
    const index = this.registrationData.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.registrationData[index] = { ...this.registrationData[index], ...record };
    return this.registrationData[index];
  }
  
  async updateAgentRecord(id: string, record: Partial<AgentRecord>): Promise<AgentRecord | undefined> {
    const index = this.agentData.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.agentData[index] = { ...this.agentData[index], ...record };
    return this.agentData[index];
  }
  
  async updateAgentBonusRecord(id: string, record: Partial<AgentBonusRecord>): Promise<AgentBonusRecord | undefined> {
    const index = this.agentBonusData.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.agentBonusData[index] = { ...this.agentBonusData[index], ...record };
    return this.agentBonusData[index];
  }

  async deleteAbeerRecord(id: string): Promise<boolean> {
    const index = this.abeerData.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.abeerData.splice(index, 1);
    return true;
  }

  async deleteDataRecord(id: string): Promise<boolean> {
    const index = this.dataRecords.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.dataRecords.splice(index, 1);
    return true;
  }

  async deleteCommissionRecord(id: string): Promise<boolean> {
    const index = this.commissionData.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.commissionData.splice(index, 1);
    return true;
  }

  async deleteInvoiceRecord(id: string): Promise<boolean> {
    const index = this.invoiceData.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.invoiceData.splice(index, 1);
    return true;
  }

  async deleteAdvBillRecord(id: string): Promise<boolean> {
    const index = this.advBillData.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.advBillData.splice(index, 1);
    return true;
  }

  async deleteBonusRecord(id: string): Promise<boolean> {
    const index = this.bonusData.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.bonusData.splice(index, 1);
    return true;
  }
  
  async deleteBonusClaimedRecord(id: string): Promise<boolean> {
    const index = this.bonusClaimedData.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.bonusClaimedData.splice(index, 1);
    return true;
  }
  
  async deleteBonusNotClaimedRecord(id: string): Promise<boolean> {
    const index = this.bonusNotClaimedData.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.bonusNotClaimedData.splice(index, 1);
    return true;
  }

  async deleteRegistrationRecord(id: string): Promise<boolean> {
    const index = this.registrationData.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.registrationData.splice(index, 1);
    return true;
  }
  
  async deleteAgentRecord(id: string): Promise<boolean> {
    const index = this.agentData.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.agentData.splice(index, 1);
    return true;
  }
  
  async deleteAgentBonusRecord(id: string): Promise<boolean> {
    const index = this.agentBonusData.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.agentBonusData.splice(index, 1);
    return true;
  }
}

export const storage = new MemStorage();
