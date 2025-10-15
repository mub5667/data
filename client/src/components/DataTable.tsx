import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Pencil, 
  Trash2, 
  Check, 
  X, 
  Download, 
  Upload, 
  Plus, 
  Search, 
  FileDown,
  Filter,
  ChevronDown,
  MoreHorizontal
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type DataRow = Record<string, any>;

interface DataTableProps {
  title: string;
  data: DataRow[];
  columns: { key: string; label: string; type?: 'text' | 'number' | 'date' | 'status' }[];
  onAdd?: (row: DataRow) => void;
  onEdit?: (id: string, row: DataRow) => void;
  onDelete?: (id: string) => void;
  onExport?: () => void;
  onImport?: (file: File) => void;
  datasetName?: string;
}

export function DataTable({ title, data, columns, onAdd, onEdit, onDelete, onExport, onImport, datasetName }: DataTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedRow, setEditedRow] = useState<DataRow>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newRow, setNewRow] = useState<DataRow>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Enhanced filtering with search
  const filteredData = data.filter((row) =>
    Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Sorting functionality
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleEdit = (row: DataRow) => {
    setEditingId(row.id);
    setEditedRow({ ...row });
  };

  const handleSave = () => {
    if (editingId && onEdit) {
      onEdit(editingId, editedRow);
    }
    setEditingId(null);
    setEditedRow({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedRow({});
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId && onDelete) {
      onDelete(deleteId);
    }
    setDeleteId(null);
  };

  const handleAdd = () => {
    if (onAdd) {
      onAdd(newRow);
    }
    setNewRow({});
    setAddDialogOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImport) {
      onImport(file);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    
    const tableData = sortedData.map(row => 
      columns.map(col => String(row[col.key] || ''))
    );
    
    autoTable(doc, {
      head: [columns.map(col => col.label)],
      body: tableData,
      startY: 25,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });
    
    doc.save(`${datasetName || 'export'}.pdf`);
  };

  const exportToExcel = async () => {
    if (datasetName) {
      const response = await fetch(`/api/export/excel/${datasetName}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${datasetName}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    }
  };

  const renderCellContent = (value: any, columnType?: string) => {
    if (columnType === 'status') {
      const status = String(value).toLowerCase();
      const variant = status === 'active' || status === 'completed' || status === 'success' 
        ? 'default' 
        : status === 'pending' 
        ? 'secondary'
        : 'destructive';
      
      return (
        <Badge variant={variant} className="capitalize">
          {value}
        </Badge>
      );
    }

    if (columnType === 'date' && value) {
      return new Date(value).toLocaleDateString();
    }

    if (columnType === 'number' && typeof value === 'number') {
      return value.toLocaleString();
    }

    return value;
  };

  return (
    <TooltipProvider>
      <Card className="shadow-lg border-0 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-primary via-chart-5 to-chart-2" />
        <CardHeader className="border-b border-border bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">{title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {sortedData.length} of {data.length} records
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={exportToPDF}>
                    <FileDown className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export to PDF</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={exportToExcel}>
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export to Excel</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => setAddDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Record
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add new record</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search across all fields..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary transition-colors"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="whitespace-nowrap">
                  <Filter className="h-4 w-4 mr-2" />
                  Sort & Filter
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                {columns.map((col) => (
                  <DropdownMenuItem 
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="flex justify-between"
                  >
                    {col.label}
                    {sortConfig?.key === col.key && (
                      <span className="text-xs text-slate-500">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-gradient-to-r from-primary/10 to-transparent dark:from-primary/20">
                  <TableRow className="border-b border-border hover:bg-transparent">
                    {columns.map((col) => (
                      <TableHead 
                        key={col.key} 
                        className="font-semibold text-foreground whitespace-nowrap py-3 sm:py-4 cursor-pointer hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
                        onClick={() => handleSort(col.key)}
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          {sortConfig?.key === col.key && (
                            <span className="text-muted-foreground">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="text-right font-semibold text-foreground py-3 sm:py-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.map((row) => (
                    <TableRow 
                      key={row.id} 
                      className="border-b border-border last:border-0 odd:bg-muted/40 even:bg-card hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors group"
                    >
                      {columns.map((col) => (
                        <TableCell key={col.key} className="py-2 sm:py-3 text-xs sm:text-sm text-foreground">
                          {editingId === row.id ? (
                            <Input
                              value={editedRow[col.key] || ""}
                              onChange={(e) =>
                                setEditedRow({ ...editedRow, [col.key]: e.target.value })
                              }
                              className="h-8 text-xs sm:text-sm bg-card border-border focus:border-primary"
                            />
                          ) : (
                            <div className="text-xs sm:text-sm text-foreground">
                              {renderCellContent(row[col.key], col.type)}
                            </div>
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="py-2 sm:py-3">
                        <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          {editingId === row.id ? (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleSave}
                                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Save changes</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleCancel}
                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Cancel editing</TooltipContent>
                              </Tooltip>
                            </>
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => handleEdit(row)}
                                  className="flex items-center gap-2"
                                >
                                  <Pencil className="h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(row.id)}
                                  className="flex items-center gap-2 text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {sortedData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={columns.length + 1} className="text-center py-12 text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-12 w-12 text-muted-foreground/50" />
                          <p className="text-lg font-medium text-muted-foreground">No data found</p>
                          <p className="text-sm text-muted-foreground">
                            {searchTerm ? 'Try adjusting your search terms' : 'No records available'}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Record Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Add New Record</DialogTitle>
            <DialogDescription>Enter the details for the new record below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {columns.filter(col => col.key !== 'id' && col.key !== 'no').map((col) => (
              <div key={col.key} className="space-y-2">
                <label className="text-sm font-medium text-slate-700">{col.label}</label>
                <Input
                  value={newRow[col.key] || ""}
                  onChange={(e) => setNewRow({ ...newRow, [col.key]: e.target.value })}
                  className="border-slate-300 focus:border-blue-500"
                  placeholder={`Enter ${col.label.toLowerCase()}`}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setAddDialogOpen(false)}
              className="border-slate-300"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAdd}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              This action cannot be undone. This will permanently delete the record and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-300">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}