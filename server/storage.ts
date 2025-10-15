import type { 
  User, InsertUser, AbeerRecord, DataRecord, CommissionRecord, 
  InvoiceRecord,UcsiRecord, UcsiInvoiceRecord, SentInvoiceRecord,  AdvBillRecord, BonusRecord, BonusClaimedRecord, BonusNotClaimedRecord, RegistrationRecord, AgentRecord, AgentBonusRecord, IncomeOutcomeRecord,
  EventsRecord, SalariesRecord, ServicesRecord, StudentHotelRecord, StudentFlightTicketRecord, AuthenticationPapersRecord, StudentVisaRecord, ApplicationFeesRecord, AirlineTicketsRecord, RentRecord, LawyerTaxContractRecord, BillsRecord, MaintenanceRecord, MedicalExpensesRecord, GeneralExpensesRecord, SocialMediaRecord, TripTravelBonusRecord, EmployeeVisaRecord, MoneyTransferRecord
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
  getUcsiData(): Promise<UcsiRecord[]>;
  getUcsiInvoiceData(): Promise<UcsiInvoiceRecord[]>;
  getSentInvoiceData(): Promise<SentInvoiceRecord[]>;
  getAdvBillData(): Promise<AdvBillRecord[]>;
  getSubagentData(): Promise<any[]>;
  getBonusData(sheetName?: string): Promise<BonusRecord[]>;
  getBonusClaimedData(): Promise<BonusClaimedRecord[]>;
  getBonusNotClaimedData(): Promise<BonusNotClaimedRecord[]>;
  getRegistrationData(): Promise<RegistrationRecord[]>;
  getIncomeOutcomeData(): Promise<IncomeOutcomeRecord[]>;
  getIncomeOutcomeByCountry(country: string): Promise<IncomeOutcomeRecord[]>;
  
  // Agent related methods
  getAgentData(): Promise<AgentRecord[]>;
  getAgentBonusData(): Promise<AgentBonusRecord[]>;
  
  // New ABEER methods
  getEventsData(): Promise<EventsRecord[]>;
  getSalariesData(): Promise<SalariesRecord[]>;
  getServicesData(): Promise<ServicesRecord[]>;
  getStudentHotelData(): Promise<StudentHotelRecord[]>;
  getStudentFlightTicketData(): Promise<StudentFlightTicketRecord[]>;
  getAuthenticationPapersData(): Promise<AuthenticationPapersRecord[]>;
  getStudentVisaData(): Promise<StudentVisaRecord[]>;
  getApplicationFeesData(): Promise<ApplicationFeesRecord[]>;
  getAirlineTicketsData(): Promise<AirlineTicketsRecord[]>;
  getRentData(): Promise<RentRecord[]>;
  getLawyerTaxContractData(): Promise<LawyerTaxContractRecord[]>;
  getBillsData(): Promise<BillsRecord[]>;
  getMaintenanceData(): Promise<MaintenanceRecord[]>;
  getMedicalExpensesData(): Promise<MedicalExpensesRecord[]>;
  getGeneralExpensesData(): Promise<GeneralExpensesRecord[]>;
  getSocialMediaData(): Promise<SocialMediaRecord[]>;
  getTripTravelBonusData(): Promise<TripTravelBonusRecord[]>;
  getEmployeeVisaData(): Promise<EmployeeVisaRecord[]>;
  getMoneyTransferData(): Promise<MoneyTransferRecord[]>;
  
  addAbeerRecord(record: Omit<AbeerRecord, 'id'>): Promise<AbeerRecord>;
  addDataRecord(record: Omit<DataRecord, 'id'>): Promise<DataRecord>;
  addCommissionRecord(record: Omit<CommissionRecord, 'id'>): Promise<CommissionRecord>;
  addInvoiceRecord(record: Omit<InvoiceRecord, 'id'>): Promise<InvoiceRecord>;
  addUcsiRecord(record: Omit<UcsiRecord, 'id'>): Promise<UcsiRecord>;
  addUcsiInvoiceRecord(record: Omit<UcsiInvoiceRecord, 'id'>): Promise<UcsiInvoiceRecord>;
  addSentInvoiceRecord(record: Omit<SentInvoiceRecord, 'id'>): Promise<SentInvoiceRecord>;
  addAdvBillRecord(record: Omit<AdvBillRecord, 'id'>): Promise<AdvBillRecord>;
  addSubagentRecord(record: Omit<any, 'id'>): Promise<any>;
  addBonusRecord(record: Omit<BonusRecord, 'id'>): Promise<BonusRecord>;
  addBonusClaimedRecord(record: Omit<BonusClaimedRecord, 'id'>): Promise<BonusClaimedRecord>;
  addBonusNotClaimedRecord(record: Omit<BonusNotClaimedRecord, 'id'>): Promise<BonusNotClaimedRecord>;
  addRegistrationRecord(record: Omit<RegistrationRecord, 'id'>): Promise<RegistrationRecord>;
  
  // Agent related methods
  addAgentRecord(record: Omit<AgentRecord, 'id'>): Promise<AgentRecord>;
  addAgentBonusRecord(record: Omit<AgentBonusRecord, 'id'>): Promise<AgentBonusRecord>;
  addIncomeOutcomeRecord(record: Omit<IncomeOutcomeRecord, 'id'>): Promise<IncomeOutcomeRecord>;
  
  // New ABEER add methods
  addEventsRecord(record: Omit<EventsRecord, 'id'>): Promise<EventsRecord>;
  addSalariesRecord(record: Omit<SalariesRecord, 'id'>): Promise<SalariesRecord>;
  addServicesRecord(record: Omit<ServicesRecord, 'id'>): Promise<ServicesRecord>;
  addStudentHotelRecord(record: Omit<StudentHotelRecord, 'id'>): Promise<StudentHotelRecord>;
  addStudentFlightTicketRecord(record: Omit<StudentFlightTicketRecord, 'id'>): Promise<StudentFlightTicketRecord>;
  addAuthenticationPapersRecord(record: Omit<AuthenticationPapersRecord, 'id'>): Promise<AuthenticationPapersRecord>;
  addStudentVisaRecord(record: Omit<StudentVisaRecord, 'id'>): Promise<StudentVisaRecord>;
  addApplicationFeesRecord(record: Omit<ApplicationFeesRecord, 'id'>): Promise<ApplicationFeesRecord>;
  addAirlineTicketsRecord(record: Omit<AirlineTicketsRecord, 'id'>): Promise<AirlineTicketsRecord>;
  addRentRecord(record: Omit<RentRecord, 'id'>): Promise<RentRecord>;
  addLawyerTaxContractRecord(record: Omit<LawyerTaxContractRecord, 'id'>): Promise<LawyerTaxContractRecord>;
  addBillsRecord(record: Omit<BillsRecord, 'id'>): Promise<BillsRecord>;
  addMaintenanceRecord(record: Omit<MaintenanceRecord, 'id'>): Promise<MaintenanceRecord>;
  addMedicalExpensesRecord(record: Omit<MedicalExpensesRecord, 'id'>): Promise<MedicalExpensesRecord>;
  addGeneralExpensesRecord(record: Omit<GeneralExpensesRecord, 'id'>): Promise<GeneralExpensesRecord>;
  addSocialMediaRecord(record: Omit<SocialMediaRecord, 'id'>): Promise<SocialMediaRecord>;
  addTripTravelBonusRecord(record: Omit<TripTravelBonusRecord, 'id'>): Promise<TripTravelBonusRecord>;
  addEmployeeVisaRecord(record: Omit<EmployeeVisaRecord, 'id'>): Promise<EmployeeVisaRecord>;
  addMoneyTransferRecord(record: Omit<MoneyTransferRecord, 'id'>): Promise<MoneyTransferRecord>;
  
  updateAbeerRecord(id: string, record: Partial<AbeerRecord>): Promise<AbeerRecord | undefined>;
  updateIncomeOutcomeRecord(id: string, record: Partial<IncomeOutcomeRecord>): Promise<IncomeOutcomeRecord | undefined>;
  updateDataRecord(id: string, record: Partial<DataRecord>): Promise<DataRecord | undefined>;
  updateCommissionRecord(id: string, record: Partial<CommissionRecord>): Promise<CommissionRecord | undefined>;
  updateInvoiceRecord(id: string, record: Partial<InvoiceRecord>): Promise<InvoiceRecord | undefined>;
  updateUcsiRecord(id: string, record: Partial<UcsiRecord>): Promise<UcsiRecord | undefined>;
  updateUcsiInvoiceRecord(id: string, record: Partial<UcsiInvoiceRecord>): Promise<UcsiInvoiceRecord | undefined>;
  updateSentInvoiceRecord(id: string, record: Partial<SentInvoiceRecord>): Promise<SentInvoiceRecord | undefined>;
  updateAdvBillRecord(id: string, record: Partial<AdvBillRecord>): Promise<AdvBillRecord | undefined>;
  updateSubagentRecord(id: string, record: Partial<any>): Promise<any | undefined>;
  updateBonusRecord(id: string, record: Partial<BonusRecord>): Promise<BonusRecord | undefined>;
  updateBonusClaimedRecord(id: string, record: Partial<BonusClaimedRecord>): Promise<BonusClaimedRecord | undefined>;
  updateBonusNotClaimedRecord(id: string, record: Partial<BonusNotClaimedRecord>): Promise<BonusNotClaimedRecord | undefined>;
  updateRegistrationRecord(id: string, record: Partial<RegistrationRecord>): Promise<RegistrationRecord | undefined>;
  
  // Agent related methods
  updateAgentRecord(id: string, record: Partial<AgentRecord>): Promise<AgentRecord | undefined>;
  updateAgentBonusRecord(id: string, record: Partial<AgentBonusRecord>): Promise<AgentBonusRecord | undefined>;
  
  // New ABEER update methods
  updateEventsRecord(id: string, record: Partial<EventsRecord>): Promise<EventsRecord | undefined>;
  updateSalariesRecord(id: string, record: Partial<SalariesRecord>): Promise<SalariesRecord | undefined>;
  updateServicesRecord(id: string, record: Partial<ServicesRecord>): Promise<ServicesRecord | undefined>;
  updateStudentHotelRecord(id: string, record: Partial<StudentHotelRecord>): Promise<StudentHotelRecord | undefined>;
  updateStudentFlightTicketRecord(id: string, record: Partial<StudentFlightTicketRecord>): Promise<StudentFlightTicketRecord | undefined>;
  updateAuthenticationPapersRecord(id: string, record: Partial<AuthenticationPapersRecord>): Promise<AuthenticationPapersRecord | undefined>;
  updateStudentVisaRecord(id: string, record: Partial<StudentVisaRecord>): Promise<StudentVisaRecord | undefined>;
  updateApplicationFeesRecord(id: string, record: Partial<ApplicationFeesRecord>): Promise<ApplicationFeesRecord | undefined>;
  updateAirlineTicketsRecord(id: string, record: Partial<AirlineTicketsRecord>): Promise<AirlineTicketsRecord | undefined>;
  updateRentRecord(id: string, record: Partial<RentRecord>): Promise<RentRecord | undefined>;
  updateLawyerTaxContractRecord(id: string, record: Partial<LawyerTaxContractRecord>): Promise<LawyerTaxContractRecord | undefined>;
  updateBillsRecord(id: string, record: Partial<BillsRecord>): Promise<BillsRecord | undefined>;
  updateMaintenanceRecord(id: string, record: Partial<MaintenanceRecord>): Promise<MaintenanceRecord | undefined>;
  updateMedicalExpensesRecord(id: string, record: Partial<MedicalExpensesRecord>): Promise<MedicalExpensesRecord | undefined>;
  updateGeneralExpensesRecord(id: string, record: Partial<GeneralExpensesRecord>): Promise<GeneralExpensesRecord | undefined>;
  updateSocialMediaRecord(id: string, record: Partial<SocialMediaRecord>): Promise<SocialMediaRecord | undefined>;
  updateTripTravelBonusRecord(id: string, record: Partial<TripTravelBonusRecord>): Promise<TripTravelBonusRecord | undefined>;
  updateEmployeeVisaRecord(id: string, record: Partial<EmployeeVisaRecord>): Promise<EmployeeVisaRecord | undefined>;
  updateMoneyTransferRecord(id: string, record: Partial<MoneyTransferRecord>): Promise<MoneyTransferRecord | undefined>;
  
  deleteAbeerRecord(id: string): Promise<boolean>;
  deleteDataRecord(id: string): Promise<boolean>;
  deleteCommissionRecord(id: string): Promise<boolean>;
  deleteInvoiceRecord(id: string): Promise<boolean>;
  deleteUcsiRecord(id: string): Promise<boolean>;
  deleteUcsiInvoiceRecord(id: string): Promise<boolean>;
  deleteSentInvoiceRecord(id: string): Promise<boolean>;
  deleteAdvBillRecord(id: string): Promise<boolean>;
  deleteSubagentRecord(id: string): Promise<boolean>;
  deleteBonusRecord(id: string): Promise<boolean>;
  deleteBonusClaimedRecord(id: string): Promise<boolean>;
  deleteBonusNotClaimedRecord(id: string): Promise<boolean>;
  deleteRegistrationRecord(id: string): Promise<boolean>;
  
  // Agent related methods
  deleteAgentRecord(id: string): Promise<boolean>;
  deleteAgentBonusRecord(id: string): Promise<boolean>;
  deleteIncomeOutcomeRecord(id: string): Promise<boolean>;
  
  // New ABEER delete methods
  deleteEventsRecord(id: string): Promise<boolean>;
  deleteSalariesRecord(id: string): Promise<boolean>;
  deleteServicesRecord(id: string): Promise<boolean>;
  deleteStudentHotelRecord(id: string): Promise<boolean>;
  deleteStudentFlightTicketRecord(id: string): Promise<boolean>;
  deleteAuthenticationPapersRecord(id: string): Promise<boolean>;
  deleteStudentVisaRecord(id: string): Promise<boolean>;
  deleteApplicationFeesRecord(id: string): Promise<boolean>;
  deleteAirlineTicketsRecord(id: string): Promise<boolean>;
  deleteRentRecord(id: string): Promise<boolean>;
  deleteLawyerTaxContractRecord(id: string): Promise<boolean>;
  deleteBillsRecord(id: string): Promise<boolean>;
  deleteMaintenanceRecord(id: string): Promise<boolean>;
  deleteMedicalExpensesRecord(id: string): Promise<boolean>;
  deleteGeneralExpensesRecord(id: string): Promise<boolean>;
  deleteSocialMediaRecord(id: string): Promise<boolean>;
  deleteTripTravelBonusRecord(id: string): Promise<boolean>;
  deleteEmployeeVisaRecord(id: string): Promise<boolean>;
  deleteMoneyTransferRecord(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private abeerData: AbeerRecord[];
  private dataRecords: DataRecord[];
  private commissionData: CommissionRecord[];
  private invoiceData: InvoiceRecord[];
  private ucsiData: UcsiRecord[];
  private ucsiInvoiceData: UcsiInvoiceRecord[];
  private sentInvoiceData: SentInvoiceRecord[];
  private advBillData: AdvBillRecord[];
  private subagentData: any[];
  private bonusData: BonusRecord[];
  private bonusClaimedData: BonusClaimedRecord[];
  private bonusNotClaimedData: BonusNotClaimedRecord[];
  private registrationData: RegistrationRecord[];
  private agentData: AgentRecord[];
  private agentBonusData: AgentBonusRecord[];
  private incomeOutcomeData: IncomeOutcomeRecord[];
  
  // New ABEER data arrays
  private eventsData: EventsRecord[];
  private salariesData: SalariesRecord[];
  private servicesData: ServicesRecord[];
  private studentHotelData: StudentHotelRecord[];
  private studentFlightTicketData: StudentFlightTicketRecord[];
  private authenticationPapersData: AuthenticationPapersRecord[];
  private studentVisaData: StudentVisaRecord[];
  private applicationFeesData: ApplicationFeesRecord[];
  private airlineTicketsData: AirlineTicketsRecord[];
  private rentData: RentRecord[];
  private lawyerTaxContractData: LawyerTaxContractRecord[];
  private billsData: BillsRecord[];
  private maintenanceData: MaintenanceRecord[];
  private medicalExpensesData: MedicalExpensesRecord[];
  private generalExpensesData: GeneralExpensesRecord[];
  private socialMediaData: SocialMediaRecord[];
  private tripTravelBonusData: TripTravelBonusRecord[];
  private employeeVisaData: EmployeeVisaRecord[];
  private moneyTransferData: MoneyTransferRecord[];

  constructor() {
    this.users = new Map();
    this.abeerData = loadAbeerData();
    this.dataRecords = loadDataRecords();
    this.commissionData = loadCommissionData();
    this.invoiceData = loadInvoiceData();
    this.ucsiData = [];
    this.ucsiInvoiceData = [];
    this.sentInvoiceData = [];
    this.advBillData = loadAdvBillData();
    this.subagentData = [];
    this.bonusData = loadBonusData();
    this.bonusClaimedData = loadBonusClaimedData();
    this.bonusNotClaimedData = loadBonusNotClaimedData();
    this.registrationData = loadRegistrationData();
    this.agentData = [];
    this.agentBonusData = [];
    this.incomeOutcomeData = [];
    
    // Initialize new ABEER data arrays
    this.eventsData = [];
    this.salariesData = [];
    this.servicesData = [];
    this.studentHotelData = [];
    this.studentFlightTicketData = [];
    this.authenticationPapersData = [];
    this.studentVisaData = [];
    this.applicationFeesData = [];
    this.airlineTicketsData = [];
    this.rentData = [];
    this.lawyerTaxContractData = [];
    this.billsData = [];
    this.maintenanceData = [];
    this.medicalExpensesData = [];
    this.generalExpensesData = [];
    this.socialMediaData = [];
    this.tripTravelBonusData = [];
    this.employeeVisaData = [];
    this.moneyTransferData = [];
  }
  
  async getIncomeOutcomeData(): Promise<IncomeOutcomeRecord[]> {
    return this.incomeOutcomeData;
  }
  
  async getIncomeOutcomeByCountry(country: string): Promise<IncomeOutcomeRecord[]> {
    return this.incomeOutcomeData.filter(record => record.country === country);
  }
  
  async addIncomeOutcomeRecord(record: Omit<IncomeOutcomeRecord, 'id'>): Promise<IncomeOutcomeRecord> {
    const newRecord = { ...record, id: randomUUID() };
    this.incomeOutcomeData.push(newRecord);
    return newRecord;
  }
  
  async updateIncomeOutcomeRecord(id: string, record: Partial<IncomeOutcomeRecord>): Promise<IncomeOutcomeRecord | undefined> {
    const index = this.incomeOutcomeData.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.incomeOutcomeData[index] = { ...this.incomeOutcomeData[index], ...record };
    return this.incomeOutcomeData[index];
  }
  
  async deleteIncomeOutcomeRecord(id: string): Promise<boolean> {
    const index = this.incomeOutcomeData.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.incomeOutcomeData.splice(index, 1);
    return true;
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

  async getUcsiData(): Promise<UcsiRecord[]> {
    return this.ucsiData;
  }

  async getUcsiInvoiceData(): Promise<UcsiInvoiceRecord[]> {
    return this.ucsiInvoiceData;
  }

  async getSentInvoiceData(): Promise<SentInvoiceRecord[]> {
    return this.sentInvoiceData;
  }

  async getAdvBillData(): Promise<AdvBillRecord[]> {
    return this.advBillData;
  }

  async getSubagentData(): Promise<any[]> {
    return this.subagentData;
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
    
    return mockData as unknown as BonusRecord[];
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
  
  // New ABEER get methods
  async getEventsData(): Promise<EventsRecord[]> {
    return this.eventsData;
  }
  
  async getSalariesData(): Promise<SalariesRecord[]> {
    return this.salariesData;
  }
  
  async getServicesData(): Promise<ServicesRecord[]> {
    return this.servicesData;
  }
  
  async getStudentHotelData(): Promise<StudentHotelRecord[]> {
    return this.studentHotelData;
  }
  
  async getStudentFlightTicketData(): Promise<StudentFlightTicketRecord[]> {
    return this.studentFlightTicketData;
  }
  
  async getAuthenticationPapersData(): Promise<AuthenticationPapersRecord[]> {
    return this.authenticationPapersData;
  }
  
  async getStudentVisaData(): Promise<StudentVisaRecord[]> {
    return this.studentVisaData;
  }
  
  async getApplicationFeesData(): Promise<ApplicationFeesRecord[]> {
    return this.applicationFeesData;
  }
  
  async getAirlineTicketsData(): Promise<AirlineTicketsRecord[]> {
    return this.airlineTicketsData;
  }
  
  async getRentData(): Promise<RentRecord[]> {
    return this.rentData;
  }
  
  async getLawyerTaxContractData(): Promise<LawyerTaxContractRecord[]> {
    return this.lawyerTaxContractData;
  }
  
  async getBillsData(): Promise<BillsRecord[]> {
    return this.billsData;
  }
  
  async getMaintenanceData(): Promise<MaintenanceRecord[]> {
    return this.maintenanceData;
  }
  
  async getMedicalExpensesData(): Promise<MedicalExpensesRecord[]> {
    return this.medicalExpensesData;
  }
  
  async getGeneralExpensesData(): Promise<GeneralExpensesRecord[]> {
    return this.generalExpensesData;
  }
  
  async getSocialMediaData(): Promise<SocialMediaRecord[]> {
    return this.socialMediaData;
  }
  
  async getTripTravelBonusData(): Promise<TripTravelBonusRecord[]> {
    return this.tripTravelBonusData;
  }
  
  async getEmployeeVisaData(): Promise<EmployeeVisaRecord[]> {
    return this.employeeVisaData;
  }
  
  async getMoneyTransferData(): Promise<MoneyTransferRecord[]> {
    return this.moneyTransferData;
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

  async addUcsiRecord(record: Omit<UcsiRecord, 'id'>): Promise<UcsiRecord> {
    const newRecord = { ...record, id: randomUUID() };
    this.ucsiData.push(newRecord);
    return newRecord;
  }

  async addUcsiInvoiceRecord(record: Omit<UcsiInvoiceRecord, 'id'>): Promise<UcsiInvoiceRecord> {
    const newRecord = { ...record, id: randomUUID() };
    this.ucsiInvoiceData.push(newRecord);
    return newRecord;
  }

  async addSentInvoiceRecord(record: Omit<SentInvoiceRecord, 'id'>): Promise<SentInvoiceRecord> {
    const newRecord = { ...record, id: randomUUID() };
    this.sentInvoiceData.push(newRecord);
    return newRecord;
  }

  async addAdvBillRecord(record: Omit<AdvBillRecord, 'id'>): Promise<AdvBillRecord> {
    const newRecord = { ...record, id: randomUUID() };
    this.advBillData.push(newRecord);
    return newRecord;
  }

  async addSubagentRecord(record: Omit<any, 'id'>): Promise<any> {
    const newRecord = { ...record, id: randomUUID() };
    this.subagentData.push(newRecord);
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
  
  // New ABEER add methods
  async addEventsRecord(record: Omit<EventsRecord, 'id'>): Promise<EventsRecord> {
    const newRecord = { ...record, id: randomUUID() };
    this.eventsData.push(newRecord);
    return newRecord;
  }
  
  async addSalariesRecord(record: Omit<SalariesRecord, 'id'>): Promise<SalariesRecord> {
    const newRecord = { ...record, id: randomUUID() };
    this.salariesData.push(newRecord);
    return newRecord;
  }
  
  async addServicesRecord(record: Omit<ServicesRecord, 'id'>): Promise<ServicesRecord> {
    const newRecord = { ...record, id: randomUUID() };
    this.servicesData.push(newRecord);
    return newRecord;
  }
  
  async addStudentHotelRecord(record: Omit<StudentHotelRecord, 'id'>): Promise<StudentHotelRecord> {
    const newRecord = { ...record, id: randomUUID() };
    this.studentHotelData.push(newRecord);
    return newRecord;
  }
  
  async addStudentFlightTicketRecord(record: Omit<StudentFlightTicketRecord, 'id'>): Promise<StudentFlightTicketRecord> {
    const newRecord = { ...record, id: randomUUID() };
    this.studentFlightTicketData.push(newRecord);
    return newRecord;
  }
  
  async addAuthenticationPapersRecord(record: Omit<AuthenticationPapersRecord, 'id'>): Promise<AuthenticationPapersRecord> {
    const newRecord = { ...record, id: randomUUID() };
    this.authenticationPapersData.push(newRecord);
    return newRecord;
  }
  
  async addStudentVisaRecord(record: Omit<StudentVisaRecord, 'id'>): Promise<StudentVisaRecord> {
    const newRecord = { ...record, id: randomUUID() };
    this.studentVisaData.push(newRecord);
    return newRecord;
  }
  
  async addApplicationFeesRecord(record: Omit<ApplicationFeesRecord, 'id'>): Promise<ApplicationFeesRecord> {
    const newRecord = { ...record, id: randomUUID() };
    this.applicationFeesData.push(newRecord);
    return newRecord;
  }
  
  async addAirlineTicketsRecord(record: Omit<AirlineTicketsRecord, 'id'>): Promise<AirlineTicketsRecord> {
    const newRecord = { ...record, id: randomUUID() };
    this.airlineTicketsData.push(newRecord);
    return newRecord;
  }
  
  async addRentRecord(record: Omit<RentRecord, 'id'>): Promise<RentRecord> {
    const newRecord = { ...record, id: randomUUID() };
    this.rentData.push(newRecord);
    return newRecord;
  }
  
  async addLawyerTaxContractRecord(record: Omit<LawyerTaxContractRecord, 'id'>): Promise<LawyerTaxContractRecord> {
    const newRecord = { ...record, id: randomUUID() };
    this.lawyerTaxContractData.push(newRecord);
    return newRecord;
  }
  
  async addBillsRecord(record: Omit<BillsRecord, 'id'>): Promise<BillsRecord> {
    const newRecord = { ...record, id: randomUUID() };
    this.billsData.push(newRecord);
    return newRecord;
  }
  
  async addMaintenanceRecord(record: Omit<MaintenanceRecord, 'id'>): Promise<MaintenanceRecord> {
    const newRecord = { ...record, id: randomUUID() };
    this.maintenanceData.push(newRecord);
    return newRecord;
  }
  
  async addMedicalExpensesRecord(record: Omit<MedicalExpensesRecord, 'id'>): Promise<MedicalExpensesRecord> {
    const newRecord = { ...record, id: randomUUID() };
    this.medicalExpensesData.push(newRecord);
    return newRecord;
  }
  
  async addGeneralExpensesRecord(record: Omit<GeneralExpensesRecord, 'id'>): Promise<GeneralExpensesRecord> {
    const newRecord = { ...record, id: randomUUID() };
    this.generalExpensesData.push(newRecord);
    return newRecord;
  }
  
  async addSocialMediaRecord(record: Omit<SocialMediaRecord, 'id'>): Promise<SocialMediaRecord> {
    const newRecord = { ...record, id: randomUUID() };
    this.socialMediaData.push(newRecord);
    return newRecord;
  }
  
  async addTripTravelBonusRecord(record: Omit<TripTravelBonusRecord, 'id'>): Promise<TripTravelBonusRecord> {
    const newRecord = { ...record, id: randomUUID() };
    this.tripTravelBonusData.push(newRecord);
    return newRecord;
  }
  
  async addEmployeeVisaRecord(record: Omit<EmployeeVisaRecord, 'id'>): Promise<EmployeeVisaRecord> {
    const newRecord = { ...record, id: randomUUID() };
    this.employeeVisaData.push(newRecord);
    return newRecord;
  }
  
  async addMoneyTransferRecord(record: Omit<MoneyTransferRecord, 'id'>): Promise<MoneyTransferRecord> {
    const newRecord = { ...record, id: randomUUID() };
    this.moneyTransferData.push(newRecord);
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

  async updateUcsiRecord(id: string, record: Partial<UcsiRecord>): Promise<UcsiRecord | undefined> {
    const index = this.ucsiData.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.ucsiData[index] = { ...this.ucsiData[index], ...record };
    return this.ucsiData[index];
  }

  async updateUcsiInvoiceRecord(id: string, record: Partial<UcsiInvoiceRecord>): Promise<UcsiInvoiceRecord | undefined> {
    const index = this.ucsiInvoiceData.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.ucsiInvoiceData[index] = { ...this.ucsiInvoiceData[index], ...record };
    return this.ucsiInvoiceData[index];
  }

  async updateSentInvoiceRecord(id: string, record: Partial<SentInvoiceRecord>): Promise<SentInvoiceRecord | undefined> {
    const index = this.sentInvoiceData.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.sentInvoiceData[index] = { ...this.sentInvoiceData[index], ...record };
    return this.sentInvoiceData[index];
  }

  async updateAdvBillRecord(id: string, record: Partial<AdvBillRecord>): Promise<AdvBillRecord | undefined> {
    const index = this.advBillData.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.advBillData[index] = { ...this.advBillData[index], ...record };
    return this.advBillData[index];
  }

  async updateSubagentRecord(id: string, record: Partial<any>): Promise<any | undefined> {
    const index = this.subagentData.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.subagentData[index] = { ...this.subagentData[index], ...record };
    return this.subagentData[index];
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
  
  // New ABEER update methods
  async updateEventsRecord(id: string, record: Partial<EventsRecord>): Promise<EventsRecord | undefined> {
    const index = this.eventsData.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.eventsData[index] = { ...this.eventsData[index], ...record };
    return this.eventsData[index];
  }
  
  async updateSalariesRecord(id: string, record: Partial<SalariesRecord>): Promise<SalariesRecord | undefined> {
    const index = this.salariesData.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.salariesData[index] = { ...this.salariesData[index], ...record };
    return this.salariesData[index];
  }
  
  async updateServicesRecord(id: string, record: Partial<ServicesRecord>): Promise<ServicesRecord | undefined> {
    const index = this.servicesData.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.servicesData[index] = { ...this.servicesData[index], ...record };
    return this.servicesData[index];
  }
  
  async updateStudentHotelRecord(id: string, record: Partial<StudentHotelRecord>): Promise<StudentHotelRecord | undefined> {
    const index = this.studentHotelData.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.studentHotelData[index] = { ...this.studentHotelData[index], ...record };
    return this.studentHotelData[index];
  }
  
  async updateStudentFlightTicketRecord(id: string, record: Partial<StudentFlightTicketRecord>): Promise<StudentFlightTicketRecord | undefined> {
    const index = this.studentFlightTicketData.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.studentFlightTicketData[index] = { ...this.studentFlightTicketData[index], ...record };
    return this.studentFlightTicketData[index];
  }
  
  async updateAuthenticationPapersRecord(id: string, record: Partial<AuthenticationPapersRecord>): Promise<AuthenticationPapersRecord | undefined> {
    const index = this.authenticationPapersData.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.authenticationPapersData[index] = { ...this.authenticationPapersData[index], ...record };
    return this.authenticationPapersData[index];
  }
  
  async updateStudentVisaRecord(id: string, record: Partial<StudentVisaRecord>): Promise<StudentVisaRecord | undefined> {
    const index = this.studentVisaData.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.studentVisaData[index] = { ...this.studentVisaData[index], ...record };
    return this.studentVisaData[index];
  }
  
  async updateApplicationFeesRecord(id: string, record: Partial<ApplicationFeesRecord>): Promise<ApplicationFeesRecord | undefined> {
    const index = this.applicationFeesData.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.applicationFeesData[index] = { ...this.applicationFeesData[index], ...record };
    return this.applicationFeesData[index];
  }
  
  async updateAirlineTicketsRecord(id: string, record: Partial<AirlineTicketsRecord>): Promise<AirlineTicketsRecord | undefined> {
    const index = this.airlineTicketsData.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.airlineTicketsData[index] = { ...this.airlineTicketsData[index], ...record };
    return this.airlineTicketsData[index];
  }
  
  async updateRentRecord(id: string, record: Partial<RentRecord>): Promise<RentRecord | undefined> {
    const index = this.rentData.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.rentData[index] = { ...this.rentData[index], ...record };
    return this.rentData[index];
  }
  
  async updateLawyerTaxContractRecord(id: string, record: Partial<LawyerTaxContractRecord>): Promise<LawyerTaxContractRecord | undefined> {
    const index = this.lawyerTaxContractData.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.lawyerTaxContractData[index] = { ...this.lawyerTaxContractData[index], ...record };
    return this.lawyerTaxContractData[index];
  }
  
  async updateBillsRecord(id: string, record: Partial<BillsRecord>): Promise<BillsRecord | undefined> {
    const index = this.billsData.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.billsData[index] = { ...this.billsData[index], ...record };
    return this.billsData[index];
  }
  
  async updateMaintenanceRecord(id: string, record: Partial<MaintenanceRecord>): Promise<MaintenanceRecord | undefined> {
    const index = this.maintenanceData.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.maintenanceData[index] = { ...this.maintenanceData[index], ...record };
    return this.maintenanceData[index];
  }
  
  async updateMedicalExpensesRecord(id: string, record: Partial<MedicalExpensesRecord>): Promise<MedicalExpensesRecord | undefined> {
    const index = this.medicalExpensesData.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.medicalExpensesData[index] = { ...this.medicalExpensesData[index], ...record };
    return this.medicalExpensesData[index];
  }
  
  async updateGeneralExpensesRecord(id: string, record: Partial<GeneralExpensesRecord>): Promise<GeneralExpensesRecord | undefined> {
    const index = this.generalExpensesData.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.generalExpensesData[index] = { ...this.generalExpensesData[index], ...record };
    return this.generalExpensesData[index];
  }
  
  async updateSocialMediaRecord(id: string, record: Partial<SocialMediaRecord>): Promise<SocialMediaRecord | undefined> {
    const index = this.socialMediaData.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.socialMediaData[index] = { ...this.socialMediaData[index], ...record };
    return this.socialMediaData[index];
  }
  
  async updateTripTravelBonusRecord(id: string, record: Partial<TripTravelBonusRecord>): Promise<TripTravelBonusRecord | undefined> {
    const index = this.tripTravelBonusData.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.tripTravelBonusData[index] = { ...this.tripTravelBonusData[index], ...record };
    return this.tripTravelBonusData[index];
  }
  
  async updateEmployeeVisaRecord(id: string, record: Partial<EmployeeVisaRecord>): Promise<EmployeeVisaRecord | undefined> {
    const index = this.employeeVisaData.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.employeeVisaData[index] = { ...this.employeeVisaData[index], ...record };
    return this.employeeVisaData[index];
  }
  
  async updateMoneyTransferRecord(id: string, record: Partial<MoneyTransferRecord>): Promise<MoneyTransferRecord | undefined> {
    const index = this.moneyTransferData.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.moneyTransferData[index] = { ...this.moneyTransferData[index], ...record };
    return this.moneyTransferData[index];
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

  async deleteUcsiRecord(id: string): Promise<boolean> {
    const index = this.ucsiData.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.ucsiData.splice(index, 1);
    return true;
  }

  async deleteUcsiInvoiceRecord(id: string): Promise<boolean> {
    const index = this.ucsiInvoiceData.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.ucsiInvoiceData.splice(index, 1);
    return true;
  }

  async deleteSentInvoiceRecord(id: string): Promise<boolean> {
    const index = this.sentInvoiceData.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.sentInvoiceData.splice(index, 1);
    return true;
  }

  async deleteAdvBillRecord(id: string): Promise<boolean> {
    const index = this.advBillData.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.advBillData.splice(index, 1);
    return true;
  }

  async deleteSubagentRecord(id: string): Promise<boolean> {
    const index = this.subagentData.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.subagentData.splice(index, 1);
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
  
  // New ABEER delete methods
  async deleteEventsRecord(id: string): Promise<boolean> {
    const index = this.eventsData.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.eventsData.splice(index, 1);
    return true;
  }
  
  async deleteSalariesRecord(id: string): Promise<boolean> {
    const index = this.salariesData.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.salariesData.splice(index, 1);
    return true;
  }
  
  async deleteServicesRecord(id: string): Promise<boolean> {
    const index = this.servicesData.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.servicesData.splice(index, 1);
    return true;
  }
  
  async deleteStudentHotelRecord(id: string): Promise<boolean> {
    const index = this.studentHotelData.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.studentHotelData.splice(index, 1);
    return true;
  }
  
  async deleteStudentFlightTicketRecord(id: string): Promise<boolean> {
    const index = this.studentFlightTicketData.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.studentFlightTicketData.splice(index, 1);
    return true;
  }
  
  async deleteAuthenticationPapersRecord(id: string): Promise<boolean> {
    const index = this.authenticationPapersData.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.authenticationPapersData.splice(index, 1);
    return true;
  }
  
  async deleteStudentVisaRecord(id: string): Promise<boolean> {
    const index = this.studentVisaData.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.studentVisaData.splice(index, 1);
    return true;
  }
  
  async deleteApplicationFeesRecord(id: string): Promise<boolean> {
    const index = this.applicationFeesData.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.applicationFeesData.splice(index, 1);
    return true;
  }
  
  async deleteAirlineTicketsRecord(id: string): Promise<boolean> {
    const index = this.airlineTicketsData.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.airlineTicketsData.splice(index, 1);
    return true;
  }
  
  async deleteRentRecord(id: string): Promise<boolean> {
    const index = this.rentData.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.rentData.splice(index, 1);
    return true;
  }
  
  async deleteLawyerTaxContractRecord(id: string): Promise<boolean> {
    const index = this.lawyerTaxContractData.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.lawyerTaxContractData.splice(index, 1);
    return true;
  }
  
  async deleteBillsRecord(id: string): Promise<boolean> {
    const index = this.billsData.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.billsData.splice(index, 1);
    return true;
  }
  
  async deleteMaintenanceRecord(id: string): Promise<boolean> {
    const index = this.maintenanceData.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.maintenanceData.splice(index, 1);
    return true;
  }
  
  async deleteMedicalExpensesRecord(id: string): Promise<boolean> {
    const index = this.medicalExpensesData.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.medicalExpensesData.splice(index, 1);
    return true;
  }
  
  async deleteGeneralExpensesRecord(id: string): Promise<boolean> {
    const index = this.generalExpensesData.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.generalExpensesData.splice(index, 1);
    return true;
  }
  
  async deleteSocialMediaRecord(id: string): Promise<boolean> {
    const index = this.socialMediaData.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.socialMediaData.splice(index, 1);
    return true;
  }
  
  async deleteTripTravelBonusRecord(id: string): Promise<boolean> {
    const index = this.tripTravelBonusData.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.tripTravelBonusData.splice(index, 1);
    return true;
  }
  
  async deleteEmployeeVisaRecord(id: string): Promise<boolean> {
    const index = this.employeeVisaData.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.employeeVisaData.splice(index, 1);
    return true;
  }
  
  async deleteMoneyTransferRecord(id: string): Promise<boolean> {
    const index = this.moneyTransferData.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.moneyTransferData.splice(index, 1);
    return true;
  }
}

export const storage = new MemStorage();
