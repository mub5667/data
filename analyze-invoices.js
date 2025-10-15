import XLSX from 'xlsx';

console.log('Analyzing INVOICES Excel file...');

try {
  const workbook = XLSX.readFile('attached_assets/INVOICES_1759717117630.xlsx');
  console.log('Sheet Names:', workbook.SheetNames);
  
  for (const sheetName of workbook.SheetNames) {
    console.log(`\n=== ${sheetName} Sheet ===`);
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    console.log('First 5 rows:');
    console.log(JSON.stringify(data.slice(0, 5), null, 2));
    
    // Also check with regular sheet_to_json to see column names
    const jsonData = XLSX.utils.sheet_to_json(sheet);
    if (jsonData.length > 0) {
      console.log('Column names found:');
      console.log(Object.keys(jsonData[0]));
    }
  }
} catch (error) {
  console.error('Error:', error);
}
