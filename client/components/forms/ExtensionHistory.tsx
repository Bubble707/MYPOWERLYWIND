import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar, FileText, Loader2, RefreshCw, Download } from 'lucide-react';

interface ExtensionRequest {
  id: string;
  confirmationNumber: string;
  taxYear: string;
  formType: string;
  payerName: string;
  requestDate: string;
}

interface ExtensionHistoryProps {
  taxYear?: string;
  ein?: string;
}

export function ExtensionHistory({ taxYear, ein }: ExtensionHistoryProps) {
  const [requests, setRequests] = useState<ExtensionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (taxYear) params.append('taxYear', taxYear);
      if (ein) params.append('ein', ein);

      const response = await fetch(`/api/extension-requests?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setRequests(data.requests || []);
      } else {
        setError(data.message || 'Failed to load extension requests');
      }
    } catch (err) {
      console.error('Error fetching extension requests:', err);
      setError('An error occurred while loading extension requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [taxYear, ein]);

  const downloadRequest = (request: ExtensionRequest) => {
    const confirmationText = `
IRS EXTENSION REQUEST CONFIRMATION
=====================================

Confirmation Number: ${request.confirmationNumber}
Request ID: ${request.id}
Tax Year: ${request.taxYear}
Form Type: ${request.formType}
Payer: ${request.payerName}
Request Date: ${new Date(request.requestDate).toLocaleDateString()}

Status: Submitted

Please keep this confirmation for your records.
=====================================
`;

    const blob = new Blob([confirmationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IRS_Extension_${request.confirmationNumber}_${request.taxYear}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Extension Request History
            </CardTitle>
            <CardDescription>
              View all IRS filing extension requests
              {taxYear && ` for tax year ${taxYear}`}
            </CardDescription>
          </div>
          <Button
            onClick={fetchRequests}
            variant="outline"
            size="sm"
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4 border-red-500 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-2">No extension requests found</p>
            <p className="text-sm text-gray-500">
              {taxYear 
                ? `No extension requests for tax year ${taxYear}`
                : 'Submit your first extension request to see it here'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Confirmation #</TableHead>
                  <TableHead>Tax Year</TableHead>
                  <TableHead>Form Type</TableHead>
                  <TableHead>Payer</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id} className="hover:bg-blue-50">
                    <TableCell className="font-mono text-sm">
                      {request.confirmationNumber}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                        {request.taxYear}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{request.formType}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {request.payerName}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(request.requestDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() => downloadRequest(request)}
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
