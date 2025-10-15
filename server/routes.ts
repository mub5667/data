import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sqliteStorage } from "./db";
import XLSX from 'xlsx';
import path from 'path';


// API endpoint to load bonus data with agent IDs


// Helper function to check for duplicate passport in a specific category
async function checkDuplicatePassport(passportNumber: string, category?: string) {
  if (!passportNumber) return null;
  
  try {
    // If category is provided, only check that specific category
    if (category) {
      switch (category) {
        case 'val-approved':
          const valApproved = await sqliteStorage.getRegistrationValApprovedByPassport(passportNumber);
          return valApproved.length > 0 ? "Val Approved" : null;
        case 'enrollment':
          const enrollment = await sqliteStorage.getRegistrationEnrollmentByPassport(passportNumber);
          return enrollment.length > 0 ? "Enrollment" : null;
        case 'visa-process':
          const visaProcess = await sqliteStorage.getRegistrationVisaProcessByPassport(passportNumber);
          return visaProcess.length > 0 ? "Visa Process" : null;
        case 'not-submitted':
          const notSubmitted = await sqliteStorage.getRegistrationNotSubmittedByPassport(passportNumber);
          return notSubmitted.length > 0 ? "Not Submitted" : null;
        case 'cancelled':
          const cancelled = await sqliteStorage.getRegistrationCancelledByPassport(passportNumber);
          return cancelled.length > 0 ? "Cancelled" : null;
        default:
          return null;
      }
    }
    
    // If no category is provided, check all categories (for backward compatibility)
    const [valApproved, enrollment, visaProcess, notSubmitted, cancelled] = await Promise.all([
      sqliteStorage.getRegistrationValApprovedByPassport(passportNumber),
      sqliteStorage.getRegistrationEnrollmentByPassport(passportNumber),
      sqliteStorage.getRegistrationVisaProcessByPassport(passportNumber),
      sqliteStorage.getRegistrationNotSubmittedByPassport(passportNumber),
      sqliteStorage.getRegistrationCancelledByPassport(passportNumber)
    ]);
    
    if (valApproved.length > 0) return "Val Approved";
    if (enrollment.length > 0) return "Enrollment";
    if (visaProcess.length > 0) return "Visa Process";
    if (notSubmitted.length > 0) return "Not Submitted";
    if (cancelled.length > 0) return "Cancelled";
    
    return null;
  } catch (error) {
    console.error("Error checking duplicate passport:", error);
    return null;
  }
}

// Helper function to check if student exists in specific category
async function checkStudentInCategory(passportNumber: string, category: string) {
  if (!passportNumber) return false;
  
  switch (category) {
    case 'val-approved':
      const valApproved = await sqliteStorage.getRegistrationValApprovedByPassport(passportNumber);
      return valApproved.length > 0;
    case 'enrollment':
      const enrollment = await sqliteStorage.getRegistrationEnrollmentByPassport(passportNumber);
      return enrollment.length > 0;
    case 'visa-process':
      const visaProcess = await sqliteStorage.getRegistrationVisaProcessByPassport(passportNumber);
      return visaProcess.length > 0;
    case 'not-submitted':
      const notSubmitted = await sqliteStorage.getRegistrationNotSubmittedByPassport(passportNumber);
      return notSubmitted.length > 0;
    case 'cancelled':
      const cancelled = await sqliteStorage.getRegistrationCancelledByPassport(passportNumber);
      return cancelled.length > 0;
    default:
      return false;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Agent routes
  app.get("/api/agents", async (req, res) => {
    try {
      const agents = await sqliteStorage.getAgents();
      res.json(agents);
    } catch (error) {
      console.error("Error fetching agents:", error);
      res.status(500).json({ error: "Failed to fetch agents" });
    }
  });
  
  app.post("/api/agents", async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Agent name is required" });
      }
      
      // Check if agent already exists
      const agents = await sqliteStorage.getAgents();
      const existingAgent = agents.find(agent => agent.name.toLowerCase() === name.toLowerCase());
      
      if (existingAgent) {
        return res.status(400).json({ error: "Agent with this name already exists" });
      }
      
      const agent = await sqliteStorage.addAgent({ name });
      res.status(201).json(agent);
    } catch (error) {
      console.error("Error adding agent:", error);
      res.status(500).json({ error: "Failed to add agent" });
    }
  });
  
  // Get students by agent ID
  app.get("/api/agents/:agentId/students", async (req, res) => {
    try {
      const { agentId } = req.params;
      const bonuses = await sqliteStorage.getAgentBonusesByAgentId(agentId);
      
      // Get unique student IDs
      const studentIds = [...new Set(bonuses.map(bonus => bonus.studentId))];
      
      // Fetch student details
      const students = await Promise.all(
        studentIds.map(id => sqliteStorage.getStudentById(id))
      );
      
      res.json(students.filter(Boolean));
    } catch (error) {
      console.error("Error fetching agent students:", error);
      res.status(500).json({ error: "Failed to fetch agent students" });
    }
  });
  
  // Search student by passport number
  app.get("/api/students/search", async (req, res) => {
    try {
      const { passport } = req.query;
      if (!passport) {
        return res.status(400).json({ error: "Passport number is required" });
      }
      
      const student = await sqliteStorage.getStudentByPassport(passport as string);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
      
      res.json(student);
    } catch (error) {
      console.error("Error searching student:", error);
      res.status(500).json({ error: "Failed to search student" });
    }
  });
  
  // Add agent bonus
  app.post("/api/agent-bonuses", async (req, res) => {
    try {
      const {
        agentId,
        // optional student identity fields (not stored in agent_bonus)
        studentId,
        passportNumber,
        // agent_bonus fields
        studentName,
        uni,
        program,
        month,
        enrollment,
        enrollmentStatus, // accept either "enrollment" or "enrollmentStatus"
        enrollmentBonus,
        visaBonus,
        commissionFromUni,
      } = req.body;

      if (!agentId) {
        return res.status(400).json({ error: "Agent ID is required" });
      }

      const payload = {
        agentId,
        studentName: (studentName || "").toString(),
        uni: (uni || "").toString(),
        program: (program || "").toString(),
        month: (month || "").toString(),
        enrollment: (enrollment || enrollmentStatus || "").toString(),
        enrollmentBonus: Number(enrollmentBonus) || 0,
        visaBonus: Number(visaBonus) || 0,
        commissionFromUni: commissionFromUni?.toString?.() ?? "0",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (!payload.studentName) {
        return res.status(400).json({ error: "studentName is required" });
      }

      const newBonus = await sqliteStorage.addAgentBonusRecord(payload as any);
      res.status(201).json(newBonus);
    } catch (error) {
      console.error("Error adding agent bonus:", error);
      res.status(500).json({ error: "Failed to add agent bonus" });
    }
  });
  
  // Get agent bonuses by agent ID
  app.get("/api/agent-bonuses/:agentId", async (req, res) => {
    try {
      const { agentId } = req.params;
      const bonuses = await sqliteStorage.getAgentBonusesByAgentId(agentId);
      res.json(bonuses);
    } catch (error) {
      console.error("Error fetching agent bonuses:", error);
      res.status(500).json({ error: "Failed to fetch agent bonuses" });
    }
  });
  
  // Create a new agent
  app.post("/api/agents", async (req, res) => {
    try {
      const { name } = req.body;
      const agent = await sqliteStorage.addAgent({ name });
      res.status(201).json(agent);
    } catch (error) {
      console.error("Error creating agent:", error);
      res.status(500).json({ error: "Failed to create agent" });
    }
  });
  
  // Add endpoint to get Excel data for a specific agent
  app.get("/api/agents/:agentId/excel-data", async (req, res) => {
    try {
      const { agentId } = req.params;
      
      // Get agent name
      const agents = await sqliteStorage.getAllAgents();
      const agent = agents.find(a => a.id === agentId);
      
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      
      // Path to the Excel file
      const excelFilePath = path.join(__dirname, "../attached_assets/BONUS 2024_1759717117632.xlsx");
      
      // Read the Excel file
      const workbook = XLSX.readFile(excelFilePath);
      
      // List of predefined agents to look for in sheet names
      const predefinedAgents = [
        "Mamoun", "Dan", "Mokhar", "Hakam", "Ahmed KSA", 
        "Majd", "Omar", "Sara", "Mayar", "Christina"
      ];
      
      // Find the sheet that matches the agent's name
      let sheetName = null;
      for (const name of predefinedAgents) {
        if (agent.name.toLowerCase().includes(name.toLowerCase()) || 
            name.toLowerCase().includes(agent.name.toLowerCase())) {
          // Find a sheet that contains this agent name
          const matchingSheet = workbook.SheetNames.find(
            sheet => sheet.toLowerCase().includes(name.toLowerCase())
          );
          
          if (matchingSheet) {
            sheetName = matchingSheet;
            break;
          }
        }
      }
      
      if (!sheetName) {
        return res.status(404).json({ 
          error: "No matching sheet found for this agent in the Excel file" 
        });
      }
      
      // Get the worksheet
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      // Return the data
      res.json({
        agentName: agent.name,
        sheetName,
        data: jsonData
      });
      
    } catch (error) {
      console.error("Error fetching Excel data for agent:", error);
      res.status(500).json({ error: "Failed to fetch Excel data" });
    }
  });
  
  // Agent bonus routes
  app.get("/api/agent-bonuses/:agentId", async (req, res) => {
    try {
      const { agentId } = req.params;
      const bonuses = await sqliteStorage.getAgentBonusesByAgentId(agentId);
      res.json(bonuses);
    } catch (error) {
      console.error("Error fetching agent bonuses:", error);
      res.status(500).json({ error: "Failed to fetch agent bonuses" });
    }
  });
  
  // Student search endpoint
  app.get("/api/students/search", async (req, res) => {
    try {
      const { passportNumber } = req.query;
      
      if (!passportNumber) {
        return res.status(400).json({ error: "Passport number is required" });
      }
      
      const student = await sqliteStorage.getStudentByPassport(passportNumber as string);
      
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
      
      res.json(student);
    } catch (error) {
      console.error("Error searching for student:", error);
      res.status(500).json({ error: "Failed to search for student" });
    }
  });

  app.post("/api/agent-bonuses", async (req, res) => {
    try {
      const { agentId, studentId, passportNumber, enrollmentBonus, visaBonus, commissionFromUni } = req.body;
      
      if (!agentId || !studentId || !passportNumber) {
        return res.status(400).json({ error: "Agent ID, student ID, and passport number are required" });
      }
      
      const bonus = await sqliteStorage.createAgentBonus({
        agentId,
        studentId,
        passportNumber,
        enrollmentBonus: enrollmentBonus || 0,
        visaBonus: visaBonus || 0,
        commissionFromUni: commissionFromUni || 0
      });
      
      res.status(201).json(bonus);
    } catch (error) {
      console.error("Error creating agent bonus:", error);
      res.status(500).json({ error: "Failed to create agent bonus" });
    }
  });
  // Student Routes
  app.get("/api/students", async (req, res) => {
    const data = await sqliteStorage.getStudents();
    res.json(data);
  });

  // Bonus API endpoints
  app.get("/api/bonus/claimed", async (req, res) => {
    try {
      const data = await sqliteStorage.getBonusClaimedData();
      res.json(data);
    } catch (error) {
      console.error("Error fetching claimed bonus data:", error);
      res.status(500).json({ error: "Failed to fetch claimed bonus data" });
    }
  });

  app.get("/api/bonus/not-claimed", async (req, res) => {
    try {
      const data = await sqliteStorage.getBonusNotClaimedData();
      res.json(data);
    } catch (error) {
      console.error("Error fetching not claimed bonus data:", error);
      res.status(500).json({ error: "Failed to fetch not claimed bonus data" });
    }
  });

  app.get("/api/agents", async (req, res) => {
    try {
      // Get agents from database
      const agents = await sqliteStorage.getAgentData();
      
      // If no agents in database yet, get available agent sheets from Excel
      if (agents.length === 0) {
        const { getAvailableAgentSheets } = require('./excel-loader');
        const agentSheets = getAvailableAgentSheets();
        
        // Return the agent sheets as potential agents
        return res.json(agentSheets.map(name => ({
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name,
          totalBonus: "$0",
          studentsCount: 0
        })));
      }
      
      res.json(agents);
    } catch (error) {
      console.error("Error fetching agents data:", error);
      res.status(500).json({ error: "Failed to fetch agents data" });
    }
  });

  app.post("/api/agents", async (req, res) => {
    try {
      const { name } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: "Agent name is required" });
      }
      
      // Check if agent already exists
      const agents = await sqliteStorage.getAgentData();
      const existingAgent = agents.find(agent => agent.name.toLowerCase() === name.toLowerCase());
      
      if (existingAgent) {
        return res.status(400).json({ error: "Agent with this name already exists" });
      }
      
      // Create new agent
      const newAgent = await sqliteStorage.addAgentRecord({
        name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      res.status(201).json(newAgent);
    } catch (error) {
      console.error("Error creating agent:", error);
      res.status(500).json({ error: "Failed to create agent" });
    }
  });

  app.get("/api/agents/:agentId", async (req, res) => {
    try {
      const { agentId } = req.params;
      
      // Get agent from database
      const agents = await sqliteStorage.getAgentData();
      const agent = agents.find(a => a.id === agentId);
      
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      
      // Get agent bonuses
      const bonuses = await sqliteStorage.getAgentBonusData();
      const agentBonuses = bonuses.filter(bonus => bonus.agentId === agentId);
      
      // Calculate total bonus and student count
      const totalBonus = agentBonuses.reduce((sum, bonus) => 
        sum + (parseFloat(bonus.enrollmentBonus) || 0) + 
              (parseFloat(bonus.visaBonus) || 0) + 
              (parseFloat(bonus.commissionFromUni) || 0), 0);
      
      const agentData = {
        ...agent,
        totalBonus: `$${totalBonus.toFixed(2)}`,
        studentsCount: agentBonuses.length,
        bonuses: agentBonuses
      };
      
      res.json(agentData);
    } catch (error) {
      console.error(`Error fetching agent data for ${req.params.agentId}:`, error);
      res.status(500).json({ error: "Failed to fetch agent data" });
    }
  });
  
  app.get("/api/agents/:agentId/excel-data", async (req, res) => {
    try {
      const { agentId } = req.params;
      
      // Get agent from database
      const agents = await sqliteStorage.getAgentData();
      const agent = agents.find(a => a.id === agentId);
      
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      
      // Load agent bonus data from Excel
      const { loadAgentBonusData } = require('./excel-loader');
      const excelData = loadAgentBonusData(agent.name);
      
      res.json(excelData);
    } catch (error) {
      console.error(`Error fetching Excel data for agent ${req.params.agentId}:`, error);
      res.status(500).json({ error: "Failed to fetch Excel data" });
    }
  });

  app.post("/api/bonus/claimed", async (req, res) => {
    try {
      const newRecord = req.body;
      const result = await sqliteStorage.addBonusClaimedRecord(newRecord);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error adding claimed bonus record:", error);
      res.status(500).json({ error: "Failed to add claimed bonus record" });
    }
  });

  app.post("/api/bonus/not-claimed", async (req, res) => {
    try {
      const newRecord = req.body;
      const result = await sqliteStorage.addBonusNotClaimedRecord(newRecord);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error adding not claimed bonus record:", error);
      res.status(500).json({ error: "Failed to add not claimed bonus record" });
    }
  });

  app.get("/api/agent-bonuses/:agentId", async (req, res) => {
    try {
      const { agentId } = req.params;
      
      // Get all agent bonuses
      const bonuses = await sqliteStorage.getAgentBonusData();
      
      // Filter bonuses by agent ID
      const agentBonuses = bonuses.filter(bonus => bonus.agentId === agentId);
      
      res.json(agentBonuses);
    } catch (error) {
      console.error(`Error fetching bonuses for agent ${req.params.agentId}:`, error);
      res.status(500).json({ error: "Failed to fetch agent bonuses" });
    }
  });
  
  app.post("/api/agent-bonuses", async (req, res) => {
    try {
      const { agentId, studentName, uni, program, month, enrollment, enrollmentBonus, visaBonus, commissionFromUni } = req.body;
      
      if (!agentId) {
        return res.status(400).json({ error: "Agent ID is required" });
      }
      
     
      // Create new agent bonus record
      const newBonus = await sqliteStorage.addAgentBonusRecord({
        agentId:agentId || '',
        studentName:studentName || '',
        uni:uni || '',
        program:program || '',
        month: month || '',
        enrollmentBonus: enrollmentBonus || 0,
        visaBonus: visaBonus || 0,
        commissionFromUni: commissionFromUni || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      res.status(201).json(newBonus);
    } catch (error) {
      console.error("Error creating agent bonus:", error);
      res.status(500).json({ error: "Failed to create agent bonus" });
    }
  });
  
  // Update agent bonus by ID
  app.put("/api/agent-bonuses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Check if the bonus exists
      const existingBonus = await sqliteStorage.getAgentBonusById(id);
      if (!existingBonus) {
        return res.status(404).json({ error: "Agent bonus record not found" });
      }
      
      // Update the bonus record
      const updatedBonus = await sqliteStorage.updateAgentBonus(id, updateData);
      res.json(updatedBonus);
    } catch (error) {
      console.error(`Error updating agent bonus ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to update agent bonus" });
    }
  });
  
  // Delete agent bonus by ID
  app.delete("/api/agent-bonuses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if the bonus exists
      const existingBonus = await sqliteStorage.getAgentBonusById(id);
      if (!existingBonus) {
        return res.status(404).json({ error: "Agent bonus record not found" });
      }
      
      // Delete the bonus record
      await sqliteStorage.deleteAgentBonus(id);
      res.json({ success: true });
    } catch (error) {
      console.error(`Error deleting agent bonus ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to delete agent bonus" });
    }
  });
  
  app.put("/api/bonus/claimed/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updatedRecord = req.body;
      const result = await sqliteStorage.updateBonusClaimedRecord(id, updatedRecord);
      if (!result) {
        return res.status(404).json({ error: "Claimed bonus record not found" });
      }
      res.json(result);
    } catch (error) {
      console.error(`Error updating claimed bonus record ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to update claimed bonus record" });
    }
  });
  
  app.put("/api/bonus/not-claimed/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updatedRecord = req.body;
      const result = await sqliteStorage.updateBonusNotClaimedRecord(id, updatedRecord);
      if (!result) {
        return res.status(404).json({ error: "Not claimed bonus record not found" });
      }
      res.json(result);
    } catch (error) {
      console.error(`Error updating not claimed bonus record ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to update not claimed bonus record" });
    }
  });
  
  app.delete("/api/bonus/claimed/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await sqliteStorage.deleteBonusClaimedRecord(id);
      if (!result) {
        return res.status(404).json({ error: "Claimed bonus record not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error(`Error deleting claimed bonus record ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to delete claimed bonus record" });
    }
  });
  
  app.delete("/api/bonus/not-claimed/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await sqliteStorage.deleteBonusNotClaimedRecord(id);
      if (!result) {
        return res.status(404).json({ error: "Not claimed bonus record not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error(`Error deleting not claimed bonus record ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to delete not claimed bonus record" });
    }
  });
  

  
  app.delete("/api/bonus/not-claimed/:id", async (req, res) => {
    try {
      const { id } = req.params;
      // Mock implementation - would be replaced with actual database operations
      res.json({ success: true, id });
    } catch (error) {
      console.error(`Error deleting not claimed bonus record ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to delete not claimed bonus record" });
    }
  });

  app.get("/api/students/search", async (req, res) => {
    const { passportNumber } = req.query;
    if (!passportNumber) {
      return res.status(400).json({ error: "Passport number is required" });
    }
    const student = await sqliteStorage.getStudentByPassport(passportNumber as string);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(student);
  });

  // Check if passport exists in main student database
  app.get("/api/students/check-passport", async (req, res) => {
    const { passportNumber } = req.query;
    if (!passportNumber) {
      return res.status(400).json({ error: "Passport number is required" });
    }
    
    try {
      const student = await sqliteStorage.getStudentByPassport(passportNumber as string);
      res.json({ exists: !!student });
    } catch (error) {
      console.error("Error checking passport:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Check if student exists in specific registration category
  app.get("/api/registration/check-student", async (req, res) => {
    const { passportNumber, category } = req.query;
    
    if (!passportNumber || !category) {
      return res.status(400).json({ 
        error: "Passport number and category are required" 
      });
    }

    // Validate category
    const validCategories = ['val-approved', 'enrollment', 'visa-process', 'not-submitted', 'cancelled'];
    if (!validCategories.includes(category as string)) {
      return res.status(400).json({ 
        error: "Invalid category. Must be one of: val-approved, enrollment, visa-process, not-submitted, cancelled" 
      });
    }

    try {
      const exists = await checkStudentInCategory(passportNumber as string, category as string);
      res.json({ exists });
    } catch (error) {
      console.error("Error checking student in category:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/students", async (req, res) => {
    try {
      const { passportNumber } = req.body;
      
      if (!passportNumber) {
        return res.status(400).json({ error: "Passport number is required" });
      }

      // Check if student already exists with this passport number
      const existingStudent = await sqliteStorage.getStudentByPassport(passportNumber);
      if (existingStudent) {
        return res.status(400).json({ 
          error: "Student already exists with this passport number" 
        });
      }

      const record = await sqliteStorage.addStudent(req.body);
      res.json(record);
    } catch (error: any) {
      console.error("Error adding student:", error);
      
      // Handle unique constraint violation
      if (error.message && error.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ 
          error: "Student already exists with this passport number" 
        });
      }
      
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/students/:id", async (req, res) => {
    const record = await sqliteStorage.updateStudent(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: "Student not found" });
    res.json(record);
  });

  app.delete("/api/students/:id", async (req, res) => {
    const success = await sqliteStorage.deleteStudent(req.params.id);
    if (!success) return res.status(404).json({ error: "Student not found" });
    res.json({ success: true });
  });

  // ABEER 2025 Routes
  app.get("/api/abeer", async (req, res) => {
    const data = await sqliteStorage.getAbeerData();
    res.json(data);
  });

  app.post("/api/abeer", async (req, res) => {
    const record = await sqliteStorage.addAbeerRecord(req.body);
    res.json(record);
  });

  app.put("/api/abeer/:id", async (req, res) => {
    const record = await sqliteStorage.updateAbeerRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  });

  app.delete("/api/abeer/:id", async (req, res) => {
    const success = await sqliteStorage.deleteAbeerRecord(req.params.id);
    if (!success) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  });

  // DATA 2025 Routes
  app.get("/api/data-records", async (req, res) => {
    const data = await sqliteStorage.getDataRecords();
    res.json(data);
  });

  app.post("/api/data-records", async (req, res) => {
    const record = await sqliteStorage.addDataRecord(req.body);
    res.json(record);
  });

  app.put("/api/data-records/:id", async (req, res) => {
    const record = await sqliteStorage.updateDataRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  });

  app.delete("/api/data-records/:id", async (req, res) => {
    const success = await sqliteStorage.deleteDataRecord(req.params.id);
    if (!success) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  });

  // COMMISSION Routes
  app.get("/api/commission", async (req, res) => {
    const data = await sqliteStorage.getCommissionData();
    res.json(data);
  });

  app.post("/api/commission", async (req, res) => {
    const record = await sqliteStorage.addCommissionRecord(req.body);
    res.json(record);
  });

  app.put("/api/commission/:id", async (req, res) => {
    const record = await sqliteStorage.updateCommissionRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  });

  app.delete("/api/commission/:id", async (req, res) => {
    const success = await sqliteStorage.deleteCommissionRecord(req.params.id);
    if (!success) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  });

  // INVOICES Routes
  app.get("/api/invoices", async (req, res) => {
    const data = await sqliteStorage.getInvoiceData();
    res.json(data);
  });

  app.post("/api/invoices", async (req, res) => {
    const record = await sqliteStorage.addInvoiceRecord(req.body);
    res.json(record);
  });

  app.put("/api/invoices/:id", async (req, res) => {
    const record = await sqliteStorage.updateInvoiceRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  });

  app.delete("/api/invoices/:id", async (req, res) => {
    const success = await sqliteStorage.deleteInvoiceRecord(req.params.id);
    if (!success) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  });
  
  // SENT INVOICES Routes
  app.get("/api/sent-invoices", async (req, res) => {
    const data = await sqliteStorage.getSentInvoicesData();
    res.json(data);
  });

  app.post("/api/sent-invoices", async (req, res) => {
    const record = await sqliteStorage.addSentInvoiceRecord(req.body);
    res.json(record);
  });

  app.put("/api/sent-invoices/:id", async (req, res) => {
    const record = await sqliteStorage.updateSentInvoiceRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  });

  app.delete("/api/sent-invoices/:id", async (req, res) => {
    const success = await sqliteStorage.deleteSentInvoiceRecord(req.params.id);
    if (!success) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  });
  
  // UCSI Routes
  app.get("/api/ucsi", async (req, res) => {
    const data = await sqliteStorage.getUcsiData();
    res.json(data);
  });

  app.post("/api/ucsi", async (req, res) => {
    const record = await sqliteStorage.addUcsiRecord(req.body);
    res.json(record);
  });

  app.put("/api/ucsi/:id", async (req, res) => {
    const record = await sqliteStorage.updateUcsiRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  });

  app.delete("/api/ucsi/:id", async (req, res) => {
    const success = await sqliteStorage.deleteUcsiRecord(req.params.id);
    if (!success) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  });
  
  // UCSI INVOICES Routes
  app.get("/api/ucsi-invoices", async (req, res) => {
    const data = await sqliteStorage.getUcsiInvoiceData();
    res.json(data);
  });

  app.post("/api/ucsi-invoices", async (req, res) => {
    const record = await sqliteStorage.addUcsiInvoiceRecord(req.body);
    res.json(record);
  });

  app.put("/api/ucsi-invoices/:id", async (req, res) => {
    const record = await sqliteStorage.updateUcsiInvoiceRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  });

  app.delete("/api/ucsi-invoices/:id", async (req, res) => {
    const success = await sqliteStorage.deleteUcsiInvoiceRecord(req.params.id);
    if (!success) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  });
  
  // Income Outcome Routes
  app.get("/api/incomeoutcome", async (req, res) => {
    const data = await sqliteStorage.getIncomeOutcomeData();
    res.json(data);
  });
  
  app.get("/api/incomeoutcome/country/:country", async (req, res) => {
    const data = await sqliteStorage.getIncomeOutcomeByCountry(req.params.country);
    res.json(data);
  });

  app.post("/api/incomeoutcome", async (req, res) => {
    const record = await sqliteStorage.addIncomeOutcomeRecord(req.body);
    res.json(record);
  });

  app.put("/api/incomeoutcome/:id", async (req, res) => {
    const record = await sqliteStorage.updateIncomeOutcomeRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  });

  app.delete("/api/incomeoutcome/:id", async (req, res) => {
    const success = await sqliteStorage.deleteIncomeOutcomeRecord(req.params.id);
    if (!success) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  });

  // ADV BILLS Routes
  app.get("/api/adv-bills", async (req, res) => {
    const data = await sqliteStorage.getAdvBillData();
    res.json(data);
  });

  app.post("/api/adv-bills", async (req, res) => {
    const record = await sqliteStorage.addAdvBillRecord(req.body);
    res.json(record);
  });

  app.put("/api/adv-bills/:id", async (req, res) => {
    const record = await sqliteStorage.updateAdvBillRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  });

  app.delete("/api/adv-bills/:id", async (req, res) => {
    const success = await sqliteStorage.deleteAdvBillRecord(req.params.id);
    if (!success) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  });

  // Subagent Routes
  app.get("/api/subagent", async (req, res) => {
    const data = await sqliteStorage.getSubagentData();
    res.json(data);
  });

  app.post("/api/subagent", async (req, res) => {
    const record = await sqliteStorage.addSubagentRecord(req.body);
    res.json(record);
  });

  app.put("/api/subagent/:id", async (req, res) => {
    const record = await sqliteStorage.updateSubagentRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  });

  app.delete("/api/subagent/:id", async (req, res) => {
    const success = await sqliteStorage.deleteSubagentRecord(req.params.id);
    if (!success) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  });

  // BONUS Routes
  app.get("/api/bonus", async (req, res) => {
    const data = await sqliteStorage.getBonusData();
    res.json(data);
  });

  app.post("/api/bonus", async (req, res) => {
    const record = await sqliteStorage.addBonusRecord(req.body);
    res.json(record);
  });

  app.put("/api/bonus/:id", async (req, res) => {
    const record = await sqliteStorage.updateBonusRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  });

  app.delete("/api/bonus/:id", async (req, res) => {
    const success = await sqliteStorage.deleteBonusRecord(req.params.id);
    if (!success) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  });

  // REGISTRATION Routes
  app.get("/api/registration", async (req, res) => {
    const data = await sqliteStorage.getRegistrationData();
    res.json(data);
  });
  
  // Val Approved Registration endpoints
  app.get("/api/registration/val-approved", async (req, res) => {
    const data = await sqliteStorage.getRegistrationValApprovedData();
    res.json(data);
  });
  
  app.post("/api/registration/val-approved", async (req, res) => {
    try {
      // Check if student with same passport exists in this specific category
      // The field might be coming as passportNumber or passport_number
      const passportNumber = req.body.passportNumber || req.body.passport_number;
      
      if (passportNumber) {
        const existingTable = await checkDuplicatePassport(passportNumber, 'val-approved');
        if (existingTable) {
          return res.status(400).json({ error: `Student with this passport number already exists in ${existingTable} records` });
        }
      }
      
      const record = await sqliteStorage.addRegistrationValApprovedRecord(req.body);
      res.json(record);
    } catch (error: any) {
      console.error("Error adding to val-approved:", error);
      
      // Handle unique constraint violation
      if (error.message && error.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ 
          error: "Student already exists in Val Approved records" 
        });
      }
      
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.put("/api/registration/val-approved/:id", async (req, res) => {
    const record = await sqliteStorage.updateRegistrationValApprovedRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  });
  
  app.delete("/api/registration/val-approved/:id", async (req, res) => {
    const success = await sqliteStorage.deleteRegistrationValApprovedRecord(req.params.id);
    if (!success) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  });
  
  // Enrollment Registration endpoints
  app.get("/api/registration/enrollment", async (req, res) => {
    const data = await sqliteStorage.getRegistrationEnrollmentData();
    res.json(data);
  });
  
  app.post("/api/registration/enrollment", async (req, res) => {
    try {
      // Check if student with same passport exists in this specific category
      // The field might be coming as passportNumber or passport_number
      const passportNumber = req.body.passportNumber || req.body.passport_number;
      
      if (passportNumber) {
        const existingTable = await checkDuplicatePassport(passportNumber, 'enrollment');
        if (existingTable) {
          return res.status(400).json({ error: `Student with this passport number already exists in ${existingTable} records` });
        }
      }
      
      const record = await sqliteStorage.addRegistrationEnrollmentRecord(req.body);
      res.json(record);
    } catch (error: any) {
      console.error("Error adding to enrollment:", error);
      
      // Handle unique constraint violation
      if (error.message && error.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ 
          error: "Student already exists in Enrollment records" 
        });
      }
      
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.put("/api/registration/enrollment/:id", async (req, res) => {
    const record = await sqliteStorage.updateRegistrationEnrollmentRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  });
  
  app.delete("/api/registration/enrollment/:id", async (req, res) => {
    const success = await sqliteStorage.deleteRegistrationEnrollmentRecord(req.params.id);
    if (!success) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  });
  
  // Visa Process Registration endpoints
  app.get("/api/registration/visa-process", async (req, res) => {
    const data = await sqliteStorage.getRegistrationVisaProcessData();
    res.json(data);
  });
  
  app.post("/api/registration/visa-process", async (req, res) => {
    try {
      // Check if student with same passport exists in this specific category
      const passportNumber = req.body.passportNumber || req.body.passport_number;
      if (passportNumber) {
        const existingTable = await checkDuplicatePassport(passportNumber, 'visa-process');
        if (existingTable) {
          return res.status(400).json({ error: `Student with this passport number already exists in ${existingTable} records` });
        }
      }
      
      const record = await sqliteStorage.addRegistrationVisaProcessRecord(req.body);
      res.json(record);
    } catch (error: any) {
      console.error("Error adding to visa-process:", error);
      
      // Handle unique constraint violation
      if (error.message && error.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ 
          error: "Student already exists in Visa Process records" 
        });
      }
      
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.put("/api/registration/visa-process/:id", async (req, res) => {
    const record = await sqliteStorage.updateRegistrationVisaProcessRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  });
  
  app.delete("/api/registration/visa-process/:id", async (req, res) => {
    const success = await sqliteStorage.deleteRegistrationVisaProcessRecord(req.params.id);
    if (!success) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  });
  
  // Not Submitted Registration endpoints
  app.get("/api/registration/not-submitted", async (req, res) => {
    const data = await sqliteStorage.getRegistrationNotSubmittedData();
    res.json(data);
  });
  
  app.post("/api/registration/not-submitted", async (req, res) => {
    try {
      // Check if student with same passport exists in this specific category
      const passportNumber = req.body.passportNumber || req.body.passport_number;
      if (passportNumber) {
        const existingTable = await checkDuplicatePassport(passportNumber, 'not-submitted');
        if (existingTable) {
          return res.status(400).json({ error: `Student with this passport number already exists in ${existingTable} records` });
        }
      }
      
      const record = await sqliteStorage.addRegistrationNotSubmittedRecord(req.body);
      res.json(record);
    } catch (error: any) {
      console.error("Error adding to not-submitted:", error);
      
      // Handle unique constraint violation
      if (error.message && error.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ 
          error: "Student already exists in Not Submitted records" 
        });
      }
      
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.put("/api/registration/not-submitted/:id", async (req, res) => {
    const record = await sqliteStorage.updateRegistrationNotSubmittedRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  });
  
  app.delete("/api/registration/not-submitted/:id", async (req, res) => {
    const success = await sqliteStorage.deleteRegistrationNotSubmittedRecord(req.params.id);
    if (!success) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  });
  
  // Cancelled Registration endpoints
  app.get("/api/registration/cancelled", async (req, res) => {
    const data = await sqliteStorage.getRegistrationCancelledData();
    res.json(data);
  });
  
  app.post("/api/registration/cancelled", async (req, res) => {
    try {
      // Check if student with same passport exists in this specific category
      const passportNumber = req.body.passportNumber || req.body.passport_number;
      if (passportNumber) {
        const existingTable = await checkDuplicatePassport(passportNumber, 'cancelled');
        if (existingTable) {
          return res.status(400).json({ error: `Student with this passport number already exists in ${existingTable} records` });
        }
      }
      
      const record = await sqliteStorage.addRegistrationCancelledRecord(req.body);
      res.json(record);
    } catch (error: any) {
      console.error("Error adding to cancelled:", error);
      
      // Handle unique constraint violation
      if (error.message && error.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ 
          error: "Student already exists in Cancelled records" 
        });
      }
      
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.put("/api/registration/cancelled/:id", async (req, res) => {
    const record = await sqliteStorage.updateRegistrationCancelledRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  });
  
  app.delete("/api/registration/cancelled/:id", async (req, res) => {
    const success = await sqliteStorage.deleteRegistrationCancelledRecord(req.params.id);
    if (!success) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  });

  app.post("/api/registration", async (req, res) => {
    const record = await sqliteStorage.addRegistrationRecord(req.body);
    res.json(record);
  });

  app.put("/api/registration/:id", async (req, res) => {
    const record = await sqliteStorage.updateRegistrationRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  });

  app.delete("/api/registration/:id", async (req, res) => {
    const success = await sqliteStorage.deleteRegistrationRecord(req.params.id);
    if (!success) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  });
  
  // Bonus API endpoints
  app.get("/api/bonus/claimed", async (req, res) => {
    try {
      // Get data from the "Claimed" sheet in BONUS excel file
      const data = await storage.getBonusData("Claimed") || [];
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch claimed bonus data" });
    }
  });
  
  app.get("/api/bonus/not-claimed", async (req, res) => {
    try {
      // Get data from the "Not Claimed" sheet in BONUS excel file
      const data = await storage.getBonusData("Not Claimed") || [];
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch not claimed bonus data" });
    }
  });
  
  app.get("/api/bonus/agents", async (req, res) => {
    try {
      // Default agents list
      const defaultAgents = [
        "Mamoun", "Dan", "Mokhar", "Hakam", "Ahmed KSA", 
        "Majd", "Omar", "Sara", "Mayar", "Christina"
      ].map(name => ({ name }));
      
      res.json(defaultAgents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch agents" });
    }
  });
  
  app.get("/api/bonus/agents/:agentSlug", async (req, res) => {
    try {
      const agentName = req.params.agentSlug.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      
      // Get data from the agent's sheet in BONUS excel file
      const data = await storage.getBonusData(agentName) || [];
      res.json({ data });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch agent data" });
    }
  });
  
  app.get("/api/students/search", async (req, res) => {
    try {
      const passportNumber = req.query.passportNumber as string;
      
      // Mock student search response for demonstration
      const mockStudent = {
        name: "Student " + passportNumber,
        passportNumber: passportNumber,
        nationality: "Sample Nationality",
        program: "Sample Program"
      };
      
      res.json(mockStudent);
    } catch (error) {
      res.status(500).json({ error: "Failed to search student" });
    }
  });

  // Export to Excel
  app.get("/api/export/:dataset", async (req, res) => {
    const { dataset } = req.params;
    let data: any[] = [];
    let filename = "export.xlsx";
    
    switch (dataset) {
      case "agents":
        data = await sqliteStorage.getAllAgents();
        filename = "AGENTS.xlsx";
        break;
      case "agent-bonus":
        data = await sqliteStorage.getAgentBonusesByAgentId();
        filename = "AGENT_BONUS.xlsx";
        break;
      case "abeer":
        data = await sqliteStorage.getAbeerData();
        filename = "ABEER_2025.xlsx";
        break;
      case "data":
        data = await sqliteStorage.getDataRecords();
        filename = "DATA_2025.xlsx";
        break;
      case "commission":
        data = await sqliteStorage.getCommissionData();
        filename = "COMMISSION_24.xlsx";
        break;
      case "invoice":
        data = await sqliteStorage.getInvoiceData();
        filename = "INVOICES.xlsx";
        break;
      case "sent-invoices":
        data = await sqliteStorage.getSentInvoiceData();
        filename = "SENT_INVOICES.xlsx";
        break;
      case "ucsi":
        data = await sqliteStorage.getUcsiData();
        filename = "UCSI.xlsx";
        break;
      case "ucsi-invoices":
        data = await sqliteStorage.getUcsiInvoiceData();
        filename = "UCSI_INVOICES.xlsx";
        break;
      case "adv-bill":
        data = await sqliteStorage.getAdvBillData();
        filename = "ADV_BILLS_2025_2026.xlsx";
        break;
      case "subagent":
        data = await sqliteStorage.getSubagentData();
        filename = "SUBAGENT_2025_2026.xlsx";
        break;
      case "bonus":
        data = await sqliteStorage.getBonusData();
        filename = "BONUS_2024.xlsx";
        break;
      case "bonus-claimed":
        data = await sqliteStorage.getBonusClaimedData();
        filename = "BONUS_CLAIMED_2024.xlsx";
        break;
      case "bonus-not-claimed":
        data = await sqliteStorage.getBonusNotClaimedData();
        filename = "BONUS_NOT_CLAIMED_2024.xlsx";
        break;
      case "registration-val-approved":
        data = await sqliteStorage.getRegistrationValApprovedData();
        filename = "REGISTRATION_VAL_APPROVED_2025.xlsx";
        break;
      case "registration-enrollment":
        data = await sqliteStorage.getRegistrationEnrollmentData();
        filename = "REGISTRATION_ENROLLMENT_2025.xlsx";
        break;
      case "registration-visa-process":
        data = await sqliteStorage.getRegistrationVisaProcessData();
        filename = "REGISTRATION_VISA_PROCESS_2025.xlsx";
        break;
      case "registration-not-submitted":
        data = await sqliteStorage.getRegistrationNotSubmittedData();
        filename = "REGISTRATION_NOT_SUBMITTED_2025.xlsx";
        break;
      case "registration-cancelled":
        data = await sqliteStorage.getRegistrationCancelledData();
        filename = "REGISTRATION_CANCELLED_2025.xlsx";
        break;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  });

  // Events Routes
  app.get("/api/events", async (req, res) => {
    const data = await sqliteStorage.getEventsData();
    res.json(data);
  });

  app.post("/api/events", async (req, res) => {
    const record = await sqliteStorage.addEventsRecord(req.body);
    res.json(record);
  });

  app.put("/api/events/:id", async (req, res) => {
    const record = await sqliteStorage.updateEventsRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  });

  app.delete("/api/events/:id", async (req, res) => {
    const success = await sqliteStorage.deleteEventsRecord(req.params.id);
    if (!success) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  });

  // Salaries Routes
  app.get("/api/salaries", async (req, res) => {
    const data = await sqliteStorage.getSalariesData();
    res.json(data);
  });

  app.post("/api/salaries", async (req, res) => {
    const record = await sqliteStorage.addSalariesRecord(req.body);
    res.json(record);
  });

  app.put("/api/salaries/:id", async (req, res) => {
    const record = await sqliteStorage.updateSalariesRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  });

  app.delete("/api/salaries/:id", async (req, res) => {
    const success = await sqliteStorage.deleteSalariesRecord(req.params.id);
    if (!success) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  });

  // Services Routes
  app.get("/api/services", async (req, res) => {
    const data = await sqliteStorage.getServicesData();
    res.json(data);
  });

  app.post("/api/services", async (req, res) => {
    const record = await sqliteStorage.addServicesRecord(req.body);
    res.json(record);
  });

  app.put("/api/services/:id", async (req, res) => {
    const record = await sqliteStorage.updateServicesRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  });

  app.delete("/api/services/:id", async (req, res) => {
    const success = await sqliteStorage.deleteServicesRecord(req.params.id);
    if (!success) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  });

  // Student Hotel Routes
  app.get("/api/student-hotel", async (req, res) => {
    const data = await sqliteStorage.getStudentHotelData();
    res.json(data);
  });

  app.post("/api/student-hotel", async (req, res) => {
    const record = await sqliteStorage.addStudentHotelRecord(req.body);
    res.json(record);
  });

  app.put("/api/student-hotel/:id", async (req, res) => {
    const record = await sqliteStorage.updateStudentHotelRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  });

  app.delete("/api/student-hotel/:id", async (req, res) => {
    const success = await sqliteStorage.deleteStudentHotelRecord(req.params.id);
    if (!success) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  });

  // Student Flight Ticket Routes
  app.get("/api/student-flight-ticket", async (req, res) => {
    const data = await sqliteStorage.getStudentFlightTicketData();
    res.json(data);
  });

  app.post("/api/student-flight-ticket", async (req, res) => {
    const record = await sqliteStorage.addStudentFlightTicketRecord(req.body);
    res.json(record);
  });

  app.put("/api/student-flight-ticket/:id", async (req, res) => {
    const record = await sqliteStorage.updateStudentFlightTicketRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  });

  app.delete("/api/student-flight-ticket/:id", async (req, res) => {
    const success = await sqliteStorage.deleteStudentFlightTicketRecord(req.params.id);
    if (!success) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  });

  // Authentication Papers Routes
  app.get("/api/authentication-papers", async (req, res) => {
    const data = await sqliteStorage.getAuthenticationPapersData();
    res.json(data);
  });

  app.post("/api/authentication-papers", async (req, res) => {
    const record = await sqliteStorage.addAuthenticationPapersRecord(req.body);
    res.json(record);
  });

  app.put("/api/authentication-papers/:id", async (req, res) => {
    const record = await sqliteStorage.updateAuthenticationPapersRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  });

  app.delete("/api/authentication-papers/:id", async (req, res) => {
    const success = await sqliteStorage.deleteAuthenticationPapersRecord(req.params.id);
    if (!success) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  });

  // Student Visa Routes
  app.get("/api/student-visa", async (req, res) => {
    const data = await sqliteStorage.getStudentVisaData();
    res.json(data);
  });

  app.post("/api/student-visa", async (req, res) => {
    const record = await sqliteStorage.addStudentVisaRecord(req.body);
    res.json(record);
  });

  app.put("/api/student-visa/:id", async (req, res) => {
    const record = await sqliteStorage.updateStudentVisaRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  });

  app.delete("/api/student-visa/:id", async (req, res) => {
    const success = await sqliteStorage.deleteStudentVisaRecord(req.params.id);
    if (!success) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  });

  // Application Fees Routes
  app.get("/api/application-fees", async (req, res) => {
    const data = await sqliteStorage.getApplicationFeesData();
    res.json(data);
  });

  app.post("/api/application-fees", async (req, res) => {
    const record = await sqliteStorage.addApplicationFeesRecord(req.body);
    res.json(record);
  });

  app.put("/api/application-fees/:id", async (req, res) => {
    const record = await sqliteStorage.updateApplicationFeesRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  });

  app.delete("/api/application-fees/:id", async (req, res) => {
    const success = await sqliteStorage.deleteApplicationFeesRecord(req.params.id);
    if (!success) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  });

  // Airline Tickets Routes
  app.get("/api/airline-tickets", async (req, res) => {
    const data = await sqliteStorage.getAirlineTicketsData();
    res.json(data);
  });

  app.post("/api/airline-tickets", async (req, res) => {
    const record = await sqliteStorage.addAirlineTicketsRecord(req.body);
    res.json(record);
  });

  app.put("/api/airline-tickets/:id", async (req, res) => {
    const record = await sqliteStorage.updateAirlineTicketsRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  });

  app.delete("/api/airline-tickets/:id", async (req, res) => {
    const success = await sqliteStorage.deleteAirlineTicketsRecord(req.params.id);
    if (!success) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  });

  // Rent Routes
  app.get("/api/rent", async (req, res) => {
    const data = await sqliteStorage.getRentData();
    res.json(data);
  });

  app.post("/api/rent", async (req, res) => {
    const record = await sqliteStorage.addRentRecord(req.body);
    res.json(record);
  });

  app.put("/api/rent/:id", async (req, res) => {
    const record = await sqliteStorage.updateRentRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  });

  app.delete("/api/rent/:id", async (req, res) => {
    const success = await sqliteStorage.deleteRentRecord(req.params.id);
    if (!success) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  });

  // Lawyer Tax Contract Routes
  app.get("/api/lawyer-tax-contract", async (req, res) => {
    const data = await sqliteStorage.getLawyerTaxContractData();
    res.json(data);
  });

  app.post("/api/lawyer-tax-contract", async (req, res) => {
    const record = await sqliteStorage.addLawyerTaxContractRecord(req.body);
    res.json(record);
  });

  app.put("/api/lawyer-tax-contract/:id", async (req, res) => {
    const record = await sqliteStorage.updateLawyerTaxContractRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  });

  app.delete("/api/lawyer-tax-contract/:id", async (req, res) => {
    const success = await sqliteStorage.deleteLawyerTaxContractRecord(req.params.id);
    if (!success) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  });

  // Bills Routes
  app.get("/api/bills", async (req, res) => {
    const data = await sqliteStorage.getBillsData();
    res.json(data);
  });

  app.post("/api/bills", async (req, res) => {
    const record = await sqliteStorage.addBillsRecord(req.body);
    res.json(record);
  });

  app.put("/api/bills/:id", async (req, res) => {
    const record = await sqliteStorage.updateBillsRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  });

  app.delete("/api/bills/:id", async (req, res) => {
    const success = await sqliteStorage.deleteBillsRecord(req.params.id);
    if (!success) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  });

  // Maintenance Routes
  app.get("/api/maintenance", async (req, res) => {
    const data = await sqliteStorage.getMaintenanceData();
    res.json(data);
  });

  app.post("/api/maintenance", async (req, res) => {
    const record = await sqliteStorage.addMaintenanceRecord(req.body);
    res.json(record);
  });

  app.put("/api/maintenance/:id", async (req, res) => {
    const record = await sqliteStorage.updateMaintenanceRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  });

  app.delete("/api/maintenance/:id", async (req, res) => {
    const success = await sqliteStorage.deleteMaintenanceRecord(req.params.id);
    if (!success) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  });

  // Medical Expenses Routes
  app.get("/api/medical-expenses", async (req, res) => {
    const data = await sqliteStorage.getMedicalExpensesData();
    res.json(data);
  });

  app.post("/api/medical-expenses", async (req, res) => {
    const record = await sqliteStorage.addMedicalExpensesRecord(req.body);
    res.json(record);
  });

  app.put("/api/medical-expenses/:id", async (req, res) => {
    const record = await sqliteStorage.updateMedicalExpensesRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  });

  app.delete("/api/medical-expenses/:id", async (req, res) => {
    const success = await sqliteStorage.deleteMedicalExpensesRecord(req.params.id);
    if (!success) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  });

  // General Expenses Routes
  app.get("/api/general-expenses", async (req, res) => {
    const data = await sqliteStorage.getGeneralExpensesData();
    res.json(data);
  });

  app.post("/api/general-expenses", async (req, res) => {
    const record = await sqliteStorage.addGeneralExpensesRecord(req.body);
    res.json(record);
  });

  app.put("/api/general-expenses/:id", async (req, res) => {
    const record = await sqliteStorage.updateGeneralExpensesRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  });

  app.delete("/api/general-expenses/:id", async (req, res) => {
    const success = await sqliteStorage.deleteGeneralExpensesRecord(req.params.id);
    if (!success) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  });

  // Social Media Routes
  app.get("/api/social-media", async (req, res) => {
    const data = await sqliteStorage.getSocialMediaData();
    res.json(data);
  });

  app.post("/api/social-media", async (req, res) => {
    const record = await sqliteStorage.addSocialMediaRecord(req.body);
    res.json(record);
  });

  app.put("/api/social-media/:id", async (req, res) => {
    const record = await sqliteStorage.updateSocialMediaRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  });

  app.delete("/api/social-media/:id", async (req, res) => {
    const success = await sqliteStorage.deleteSocialMediaRecord(req.params.id);
    if (!success) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  });

  // Trip Travel Bonus Routes
  app.get("/api/trip-travel-bonus", async (req, res) => {
    const data = await sqliteStorage.getTripTravelBonusData();
    res.json(data);
  });

  app.post("/api/trip-travel-bonus", async (req, res) => {
    const record = await sqliteStorage.addTripTravelBonusRecord(req.body);
    res.json(record);
  });

  app.put("/api/trip-travel-bonus/:id", async (req, res) => {
    const record = await sqliteStorage.updateTripTravelBonusRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  });

  app.delete("/api/trip-travel-bonus/:id", async (req, res) => {
    const success = await sqliteStorage.deleteTripTravelBonusRecord(req.params.id);
    if (!success) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  });

  // Employee Visa Routes
  app.get("/api/employee-visa", async (req, res) => {
    const data = await sqliteStorage.getEmployeeVisaData();
    res.json(data);
  });

  app.post("/api/employee-visa", async (req, res) => {
    const record = await sqliteStorage.addEmployeeVisaRecord(req.body);
    res.json(record);
  });

  app.put("/api/employee-visa/:id", async (req, res) => {
    const record = await sqliteStorage.updateEmployeeVisaRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  });

  app.delete("/api/employee-visa/:id", async (req, res) => {
    const success = await sqliteStorage.deleteEmployeeVisaRecord(req.params.id);
    if (!success) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  });

  // Money Transfer Routes
  app.get("/api/money-transfer", async (req, res) => {
    const data = await sqliteStorage.getMoneyTransferData();
    res.json(data);
  });

  app.post("/api/money-transfer", async (req, res) => {
    const record = await sqliteStorage.addMoneyTransferRecord(req.body);
    res.json(record);
  });

  app.put("/api/money-transfer/:id", async (req, res) => {
    const record = await sqliteStorage.updateMoneyTransferRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  });

  app.delete("/api/money-transfer/:id", async (req, res) => {
    const success = await sqliteStorage.deleteMoneyTransferRecord(req.params.id);
    if (!success) return res.status(404).json({ error: "Record not found" });
    res.json({ success: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}