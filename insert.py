import sqlite3
import pandas as pd
import uuid

# Path to your Excel file and SQLite database
excel_path = r"COMMISSION 24.xlsx"
db_path = r"excel_flow.db"

# Connect to SQLite
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Create the table if not exists
cursor.execute("""
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
)
""")

# Read all sheets
xls = pd.ExcelFile(excel_path)

for sheet_name in xls.sheet_names:
    df = pd.read_excel(xls, sheet_name=sheet_name)
    
    # Normalize column names
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    
    # Add 'month' column based on sheet name
    df['month'] = sheet_name
    
    # Add unique ID for each record
    df['id'] = [str(uuid.uuid4()) for _ in range(len(df))]
    
    # If all fields in current file should go under RM:
    df['ref'] = 'RM'
    
    # Ensure all expected columns exist
    expected_cols = ['id', 'no', 'university', 'ref', 'month', 'other_income', 
                     'received_date', 'currency', 'amount', 'invoice_date', 'notes']
    for col in expected_cols:
        if col not in df.columns:
            df[col] = None

    # Insert data into SQLite
    df[expected_cols].to_sql('commission', conn, if_exists='append', index=False)

conn.commit()
conn.close()

print("✅ All sheets inserted successfully into the commission table.")
