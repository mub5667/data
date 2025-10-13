import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to analyze Excel file structure
function analyzeExcelFile(filePath) {
  console.log(`Analyzing Excel file: ${filePath}`);
  
  try {
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    
    console.log(`Found ${sheetNames.length} sheets: ${sheetNames.join(', ')}`);
    
    // Store sheet structure information
    const sheetStructures = {};
    
    // Analyze each sheet
    for (const sheetName of sheetNames) {
      console.log(`\nAnalyzing sheet: ${sheetName}`);
      
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (data.length === 0) {
        console.log(`  Sheet "${sheetName}" is empty`);
        continue;
      }
      
      // Get headers (first row)
      const headers = data[0];
      console.log(`  Found ${headers.length} columns: ${headers.join(', ')}`);
      
      // Store the structure
      sheetStructures[sheetName] = headers;
    }
    
    // Write the structure to a JSON file
    fs.writeFileSync('excel-structure.json', JSON.stringify(sheetStructures, null, 2));
    console.log('\nStructure saved to excel-structure.json');
    
    return sheetStructures;
  } catch (error) {
    console.error('Error analyzing Excel file:', error);
    return null;
  }
}

// Analyze the BONUS Excel file
analyzeExcelFile('attached_assets/BONUS 2024_1759717117632.xlsx');