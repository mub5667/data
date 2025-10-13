import { DataTable } from "../DataTable";

export default function DataTableExample() {
  const sampleData = [
    { id: "1", name: "John Doe", email: "john@example.com", status: "Active" },
    { id: "2", name: "Jane Smith", email: "jane@example.com", status: "Pending" },
    { id: "3", name: "Bob Johnson", email: "bob@example.com", status: "Active" },
  ];

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "status", label: "Status" },
  ];

  return (
    <DataTable
      title="Sample Data Table"
      data={sampleData}
      columns={columns}
      onAdd={(row) => console.log("Add:", row)}
      onEdit={(id, row) => console.log("Edit:", id, row)}
      onDelete={(id) => console.log("Delete:", id)}
      datasetName="sample"
    />
  );
}
