/**
 * WordPress Imports Component
 * Displays imported affiliate data from WordPress in a detailed table
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ExternalLink, FileText } from 'lucide-react';

interface WordPressImportData {
  id: string;
  type: string;
  name: string;
  email: string;
  status: 'ACTIVE' | 'UNKNOWN';
  pluginSource: string;
  userId: string | number;
  paymentInfo: string;
  rateCommission: string;
  taxId: string;
  earnings: number;
  taxWithheld: {
    fed: number;
    state: number;
  };
}

interface WordPressImportsProps {
  importedData: any[];
  onOpenImport: () => void;
}

export function WordPressImports({ importedData, onOpenImport }: WordPressImportsProps) {
  // Transform imported data to match table structure
  const tableData: WordPressImportData[] = importedData.map((item, index) => ({
    id: item.id || String(index + 1),
    type: 'Affiliate',
    name: item.vendorName || '-',
    email: item.email || '-',
    status: item.status || 'UNKNOWN',
    pluginSource: item.source || 'WordPress',
    userId: item.userId || index + 1,
    paymentInfo: item.paymentInfo || (item.earnings ? `$${item.earnings.toFixed(2)}` : '-'),
    rateCommission: item.rateCommission || '-',
    taxId: item.taxId || '-',
    earnings: item.earnings || 0,
    taxWithheld: {
      fed: item.taxWithheld?.fed || 0,
      state: item.taxWithheld?.state || 0,
    },
  }));

  const getStatusColor = (status: string) => {
    return status === 'ACTIVE' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-yellow-100 text-yellow-700 border-yellow-300';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <ExternalLink className="h-6 w-6 text-blue-600" />
                WordPress Imported Affiliates
              </CardTitle>
              <CardDescription className="mt-1">
                Total imported: {tableData.length} {tableData.length === 1 ? 'affiliate' : 'affiliates'}
              </CardDescription>
            </div>
            <Button 
              onClick={onOpenImport}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Import from WordPress
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Table */}
      {tableData.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ExternalLink className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No WordPress Imports Yet</h3>
            <p className="text-gray-600 mb-6">
              Import affiliate data from your WordPress site to get started
            </p>
            <Button 
              onClick={onOpenImport}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Import from WordPress
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-900 hover:bg-blue-900">
                    <TableHead className="text-white font-semibold">ID</TableHead>
                    <TableHead className="text-white font-semibold">TYPE</TableHead>
                    <TableHead className="text-white font-semibold">NAME</TableHead>
                    <TableHead className="text-white font-semibold">EMAIL</TableHead>
                    <TableHead className="text-white font-semibold">STATUS</TableHead>
                    <TableHead className="text-white font-semibold">PLUGIN SOURCE</TableHead>
                    <TableHead className="text-white font-semibold">USER ID</TableHead>
                    <TableHead className="text-white font-semibold">PAYMENT INFO</TableHead>
                    <TableHead className="text-white font-semibold">RATE/COMMISSION</TableHead>
                    <TableHead className="text-white font-semibold">TAX ID</TableHead>
                    <TableHead className="text-white font-semibold">EARNINGS</TableHead>
                    <TableHead className="text-white font-semibold">TAX WITHHELD</TableHead>
                    <TableHead className="text-white font-semibold">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((row, index) => (
                    <TableRow key={row.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-900">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-gray-700">{row.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-gray-900">{row.name}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700">{row.email}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(row.status)}>
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                          {row.pluginSource}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700">{row.userId}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700">{row.paymentInfo}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700">{row.rateCommission}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700">{row.taxId}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-green-700">
                          ${row.earnings.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-gray-700">Fed: ${row.taxWithheld.fed.toFixed(2)}</div>
                          <div className="text-gray-600">State: ${row.taxWithheld.state.toFixed(2)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white gap-1 text-xs px-3"
                        >
                          <FileText className="h-3 w-3" />
                          W-9
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
