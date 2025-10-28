import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Download,
  Upload,
  Trash2,
  FileDown,
  History,
} from "lucide-react";
import WordPressImports from "./WordPressImports";
import { BulkActionsBar } from "@/components/BulkActionsBar";

interface ImportedAffiliate {
  id: number;
  vendorName: string;
  email: string;
  status: string;
  source: string;
  userId: number;
  paymentInfo: string;
  rateCommission: string;
  taxId: string;
  earnings: number;
  taxWithheld: {
    fed: number;
    state: number;
  };
  importDate: string;
}

interface WordPressImportsTabProps {
  importedData: ImportedAffiliate[];
  onImport: (affiliates: any[]) => void;
  onDelete: (ids: number[]) => void;
}

export function WordPressImportsTab({
  importedData,
  onImport,
  onDelete,
}: WordPressImportsTabProps) {
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const toggleSelection = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleAll = () => {
    if (selectedIds.size === importedData.length && importedData.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(importedData.map((a) => a.id)));
    }
  };

  const handleBulkExportCSV = () => {
    const selectedAffiliates = importedData.filter((a) =>
      selectedIds.has(a.id)
    );
    const csvContent = [
      "Name,Email,Tax ID,Earnings,Fed Tax,State Tax,Status,Source,Import Date",
      ...selectedAffiliates.map((a) =>
        `"${a.vendorName}","${a.email}","${a.taxId}",${a.earnings},${a.taxWithheld.fed.toFixed(2)},${a.taxWithheld.state.toFixed(2)},"${a.status}","${a.source}","${a.importDate}"`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wordpress-imports-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setSelectedIds(new Set());
  };

  const handleBulkExportPDF = () => {
    alert(`PDF export for ${selectedIds.size} affiliates coming soon!`);
    setSelectedIds(new Set());
  };

  const handleBulkDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedIds.size} affiliate${selectedIds.size !== 1 ? "s" : ""}?`
      )
    ) {
      onDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const downloadSampleCSV = () => {
    const csvContent =
      "Name,Email,Tax ID,Earnings\nJohn Doe,john@example.com,123-45-6789,5250.00";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wordpress_affiliate_sample.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">WordPress Imports</h2>
        <p className="text-gray-600 mt-1">
          Import and manage affiliate data from WordPress
        </p>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <BulkActionsBar
          selectedCount={selectedIds.size}
          totalCount={importedData.length}
          onExportCSV={handleBulkExportCSV}
          onExportPDF={handleBulkExportPDF}
          onDelete={handleBulkDelete}
          entityName="affiliate"
        />
      )}

      {/* Import History Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <History className="h-5 w-5 text-blue-600" />
                Imported Affiliates
              </CardTitle>
              <CardDescription>
                Affiliates imported from WordPress plugins
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={downloadSampleCSV}
                className="gap-2 border-green-600 text-green-600 hover:bg-green-50 hover:border-green-700 hover:shadow-md hover:scale-[1.02] transition-all duration-200 font-semibold"
              >
                <Download className="h-4 w-4" />
                Sample CSV
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowImportModal(true)}
                className="gap-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 hover:shadow-md hover:scale-[1.02] transition-all duration-200 font-semibold"
              >
                <Download className="h-4 w-4" />
                WordPress Imports
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {importedData.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No affiliates imported yet
              </h3>
              <p className="text-gray-500 mb-4">
                Click the "WordPress Imports" button to import affiliates from
                your WordPress site
              </p>
              <Button
                onClick={() => setShowImportModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Import from WordPress
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-blue-50 to-blue-100/80 border-b-2 border-blue-200 hover:from-blue-100 hover:to-blue-100 transition-colors">
                    <TableHead className="w-16 pl-6">
                      <Checkbox
                        checked={
                          selectedIds.size === importedData.length &&
                          importedData.length > 0
                        }
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead className="font-bold text-blue-900 text-xs uppercase tracking-wide w-16">
                      #
                    </TableHead>
                    <TableHead className="font-bold text-blue-900 text-xs uppercase tracking-wide">
                      Name
                    </TableHead>
                    <TableHead className="font-bold text-blue-900 text-xs uppercase tracking-wide">
                      Email
                    </TableHead>
                    <TableHead className="font-bold text-blue-900 text-xs uppercase tracking-wide">
                      Tax ID
                    </TableHead>
                    <TableHead className="font-bold text-blue-900 text-xs uppercase tracking-wide">
                      Earnings
                    </TableHead>
                    <TableHead className="font-bold text-blue-900 text-xs uppercase tracking-wide">
                      Status
                    </TableHead>
                    <TableHead className="font-bold text-blue-900 text-xs uppercase tracking-wide">
                      Source
                    </TableHead>
                    <TableHead className="font-bold text-blue-900 text-xs uppercase tracking-wide">
                      Import Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importedData.map((affiliate, index) => (
                    <TableRow
                      key={affiliate.id}
                      className="border-b border-gray-100 hover:bg-blue-50/50 transition-all duration-200 group"
                    >
                      <TableCell className="pl-6">
                        <Checkbox
                          checked={selectedIds.has(affiliate.id)}
                          onCheckedChange={() => toggleSelection(affiliate.id)}
                        />
                      </TableCell>
                      <TableCell className="font-semibold text-gray-600 text-sm">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900">
                        {affiliate.vendorName}
                      </TableCell>
                      <TableCell className="text-blue-600 hover:text-blue-700 hover:underline cursor-pointer">
                        {affiliate.email}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-gray-700">
                        {affiliate.taxId}
                      </TableCell>
                      <TableCell className="font-bold text-green-600 text-base">
                        ${affiliate.earnings.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            affiliate.status === "ACTIVE"
                              ? "default"
                              : "outline"
                          }
                          className={
                            affiliate.status === "ACTIVE"
                              ? "bg-green-500 hover:bg-green-600 text-white px-3 py-1 font-semibold shadow-sm"
                              : "border-gray-400 text-gray-700 px-3 py-1 font-semibold"
                          }
                        >
                          {affiliate.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50 px-3 py-1 font-medium">
                          {affiliate.source}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 font-medium">
                        {affiliate.importDate}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* WordPress Import Modal */}
      {showImportModal && (
        <WordPressImports
          onImport={(affiliates) => {
            onImport(affiliates);
            setShowImportModal(false);
          }}
          onClose={() => setShowImportModal(false)}
        />
      )}
    </div>
  );
}
