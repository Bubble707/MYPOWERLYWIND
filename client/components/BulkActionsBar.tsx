import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileSpreadsheet, FileText, Trash2, CheckCircle } from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  onExportCSV: () => void;
  onExportPDF: () => void;
  onDelete: () => void;
  entityName?: string; // e.g., "issuer", "payee", "form"
}

export function BulkActionsBar({
  selectedCount,
  totalCount,
  onExportCSV,
  onExportPDF,
  onDelete,
  entityName = 'item'
}: BulkActionsBarProps) {
  const [selectedAction, setSelectedAction] = useState<string>('');

  const handleApply = () => {
    if (!selectedAction) {
      alert('Please select an action');
      return;
    }

    switch (selectedAction) {
      case 'export-csv':
        onExportCSV();
        break;
      case 'export-pdf':
        onExportPDF();
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete ${selectedCount} ${entityName}${selectedCount > 1 ? 's' : ''}?`)) {
          onDelete();
        }
        break;
    }
    
    setSelectedAction('');
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm animate-fade-in">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-blue-600" />
        <Badge variant="secondary" className="bg-blue-100 text-blue-700 font-semibold">
          {selectedCount} of {totalCount} selected
        </Badge>
      </div>

      <div className="flex-1 flex items-center gap-3">
        <Select value={selectedAction} onValueChange={setSelectedAction}>
          <SelectTrigger className="w-[200px] bg-white">
            <SelectValue placeholder="Bulk Actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="export-csv">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                Export as CSV
              </div>
            </SelectItem>
            <SelectItem value="export-pdf">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-red-600" />
                Export as PDF
              </div>
            </SelectItem>
            <SelectItem value="delete">
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-red-600" />
                Delete Selected
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <Button 
          onClick={handleApply}
          disabled={!selectedAction}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all duration-200"
        >
          Apply
        </Button>
      </div>
    </div>
  );
}
