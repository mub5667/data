import { loadInvoiceDataToSQLite } from './server/excel-loader-sqlite.ts';
import { sqliteStorage } from './server/db/index.ts';

async function testInvoiceLoading() {
  try {
    console.log('Testing invoice data loading...');
    
    // Clear existing data first
    console.log('Clearing existing invoice data...');
    const existingSentInvoices = await sqliteStorage.getSentInvoicesData();
    const existingUcsiInvoices = await sqliteStorage.getUcsiInvoiceData();
    console.log(`Found ${existingSentInvoices.length} existing sent invoices`);
    console.log(`Found ${existingUcsiInvoices.length} existing ucsi invoices`);
    
    // Load the data
    console.log('Loading invoice data...');
    await loadInvoiceDataToSQLite();
    
    // Check the results
    console.log('\n=== SENT INVOICES DATA ===');
    const sentInvoices = await sqliteStorage.getSentInvoicesData();
    console.log(`Total sent invoices loaded: ${sentInvoices.length}`);
    if (sentInvoices.length > 0) {
      console.log('Sample sent invoice:');
      console.log(JSON.stringify(sentInvoices[0], null, 2));
      
      // Check for non-zero amounts
      const nonZeroAmounts = sentInvoices.filter(inv => inv.amount > 0);
      console.log(`Sent invoices with non-zero amounts: ${nonZeroAmounts.length}`);
      if (nonZeroAmounts.length > 0) {
        console.log('Sample with amount:');
        console.log(JSON.stringify(nonZeroAmounts[0], null, 2));
      }
    }
    
    console.log('\n=== UCSI INVOICES DATA ===');
    const ucsiInvoices = await sqliteStorage.getUcsiInvoiceData();
    console.log(`Total ucsi invoices loaded: ${ucsiInvoices.length}`);
    if (ucsiInvoices.length > 0) {
      console.log('Sample ucsi invoice:');
      console.log(JSON.stringify(ucsiInvoices[0], null, 2));
      
      // Check for non-empty types and non-zero amounts
      const validUcsiInvoices = ucsiInvoices.filter(inv => inv.type && inv.amount > 0);
      console.log(`UCSI invoices with type and amount: ${validUcsiInvoices.length}`);
      if (validUcsiInvoices.length > 0) {
        console.log('Sample with type and amount:');
        console.log(JSON.stringify(validUcsiInvoices[0], null, 2));
      }
    }
    
  } catch (error) {
    console.error('Error testing invoice loading:', error);
  }
}

testInvoiceLoading();

