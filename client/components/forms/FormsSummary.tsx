import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SendNewRequestModal } from './SendNewRequestModal';
import { ViewFormDetailsModal } from './ViewFormDetailsModal';
import { TransferTo1099Modal } from './TransferTo1099Modal';
import { downloadFormPDF, downloadAllFormsAsZip, downloadSelectedFormsAsZip } from '@/lib/pdfGenerator';
import { 
  Download, 
  MoreVertical, 
  Search,
  FileText,
  Mail,
  Trash2,
  Eye,
  Filter,
  Plus,
  Archive,
  ArrowRightLeft
} from 'lucide-react';

interface FormRequest {
  id: string;
  vendorName: string;
  email: string;
  formType: string;
  status: 'Pending' | 'Completed' | 'Expired';
  attachedDocuments: string;
  updateDate: string;
  issueNumber?: string;
}

interface FormsSummaryProps {
  formType?: string;
}

export function FormsSummary({ formType = 'All' }: FormsSummaryProps) {
  // Mock data - Replace with actual API data
  const [formRequests] = useState<FormRequest[]>([
    {
      id: '1',
      vendorName: 'Adar Finley',
      email: 'luisanatkins@gmail.com',
      formType: 'W-9',
      status: 'Pending',
      attachedDocuments: 'No document',
      updateDate: '10/07/25',
    },
    {
      id: '2',
      vendorName: 'David',
      email: 'David77@gmail.com',
      formType: 'W-2',
      status: 'Pending',
      attachedDocuments: 'No document',
      updateDate: '10/07/25',
    },
    {
      id: '3',
      vendorName: '',
      email: 'lucas1225@gmail.com',
      formType: 'W-9',
      status: 'Pending',
      attachedDocuments: 'No document',
      updateDate: '10/04/25',
    },
    {
      id: '4',
      vendorName: '',
      email: 'lucas1225@gmail.com',
      formType: 'W-4',
      status: 'Pending',
      attachedDocuments: 'No document',
      updateDate: '10/04/25',
    },
    {
      id: '5',
      vendorName: 'David',
      email: 'David77@gmail.com',
      formType: 'W-9',
      issueNumber: '1-C-Corp',
      status: 'Pending',
      attachedDocuments: 'No document',
      updateDate: '10/02/25',
    },
    {
      id: '6',
      vendorName: 'David',
      email: 'David77@gmail.com',
      formType: 'W-2',
      status: 'Pending',
      attachedDocuments: 'No document',
      updateDate: '10/02/25',
    },
    {
      id: '7',
      vendorName: 'Shaista',
      email: 'shaistasfareed45346@gmail.com',
      formType: 'W-8BEN',
      issueNumber: '1-C-Corp',
      status: 'Pending',
      attachedDocuments: 'No document',
      updateDate: '10/02/25',
    },
    {
      id: '8',
      vendorName: 'Shaista',
      email: 'shaistasfareed45346@gmail.com',
      formType: 'W-9',
      issueNumber: '1-C-Corp',
      status: 'Pending',
      attachedDocuments: 'No document',
      updateDate: '10/02/25',
    },
    {
      id: '9',
      vendorName: 'Aqib Balocj',
      email: 'shaistasfareed45346@gmail.com',
      formType: 'W-9',
      issueNumber: '1-C-Corp',
      status: 'Completed',
      attachedDocuments: 'No document',
      updateDate: '10/02/25',
    },
    {
      id: '10',
      vendorName: 'John Smith',
      email: 'john.smith@company.com',
      formType: 'W-4',
      status: 'Completed',
      attachedDocuments: 'No document',
      updateDate: '10/01/25',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formTypeFilter, setFormTypeFilter] = useState<string>('all');
  const [showSendModal, setShowSendModal] = useState(false);
  const [viewDetailsRequest, setViewDetailsRequest] = useState<FormRequest | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferType, setTransferType] = useState<'all' | 'selected'>('all');

  const filteredRequests = formRequests.filter(request => {
    const matchesSearch = 
      request.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.formType.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesFormType = formTypeFilter === 'all' || request.formType === formTypeFilter;
    
    return matchesSearch && matchesStatus && matchesFormType;
  });

  // Get unique form types for filter
  const formTypes = ['all', ...Array.from(new Set(formRequests.map(r => r.formType)))];

  const toggleRowSelection = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const toggleAllRows = () => {
    if (selectedRows.length === filteredRequests.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredRequests.map(r => r.id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'text-orange-600';
      case 'Completed':
        return 'text-green-600';
      case 'Expired':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleDownload = (request: FormRequest) => {
    downloadFormPDF(request);
  };

  const handleDownloadAll = () => {
    downloadAllFormsAsZip(filteredRequests);
  };

  const handleDownloadSelected = () => {
    if (selectedRows.length === 0) {
      alert('Please select at least one form to download');
      return;
    }
    downloadSelectedFormsAsZip(filteredRequests, selectedRows);
  };

  const handleView = (request: FormRequest) => {
    setViewDetailsRequest(request);
  };

  const handleResend = (request: FormRequest) => {
    console.log('Resending form to:', request.email);
    // TODO: Implement resend functionality
  };

  const handleDelete = (request: FormRequest) => {
    console.log('Deleting form for:', request.email);
    // TODO: Implement delete functionality
  };

  const handleTransferAll = () => {
    setTransferType('all');
    setShowTransferModal(true);
  };

  const handleTransferSelected = () => {
    if (selectedRows.length === 0) {
      alert('Please select at least one form to transfer');
      return;
    }
    setTransferType('selected');
    setShowTransferModal(true);
  };

  const getTransferForms = () => {
    if (transferType === 'all') {
      return filteredRequests;
    }
    return filteredRequests.filter(req => selectedRows.includes(req.id));
  };

  return (
    <div className="space-y-6">
      {/* Send New Request Modal */}
      <SendNewRequestModal 
        open={showSendModal} 
        onClose={() => setShowSendModal(false)} 
      />

      {/* View Details Modal */}
      <ViewFormDetailsModal
        open={viewDetailsRequest !== null}
        onClose={() => setViewDetailsRequest(null)}
        request={viewDetailsRequest}
      />

      {/* Transfer to 1099 Modal */}
      <TransferTo1099Modal
        open={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        selectedForms={getTransferForms()}
        transferType={transferType}
      />

      {/* Header */}
      <Card className="border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Form Requests Summary</CardTitle>
              <CardDescription className="mt-1">
                Total results: {filteredRequests.length}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => setShowSendModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <Plus className="h-4 w-4" />
                Send New Request
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="p-2">
                    <p className="text-sm font-semibold mb-2">Form Type</p>
                    {formTypes.map((type) => (
                      <DropdownMenuItem
                        key={type}
                        onClick={() => setFormTypeFilter(type)}
                        className={formTypeFilter === type ? 'bg-blue-50' : ''}
                      >
                        {type === 'all' ? 'All Forms' : type}
                        {formTypeFilter === type && (
                          <span className="ml-auto text-blue-600">✓</span>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDownloadAll}>
                    <Archive className="h-4 w-4 mr-2" />
                    Download All ({filteredRequests.length} forms)
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleDownloadSelected}
                    disabled={selectedRows.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Selected ({selectedRows.length} forms)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 border-green-300 text-green-700 hover:bg-green-50">
                    <ArrowRightLeft className="h-4 w-4" />
                    Transfer to 1099
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleTransferAll}>
                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                    Transfer All ({filteredRequests.length} forms)
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleTransferSelected}
                    disabled={selectedRows.length === 0}
                  >
                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                    Transfer Selected ({selectedRows.length} forms)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by vendor name, email, or form type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                size="sm"
                className={statusFilter === 'all' 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' 
                  : 'border-gray-300 hover:bg-gray-50'
                }
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('pending')}
                size="sm"
                className={statusFilter === 'pending' 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' 
                  : 'border-gray-300 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300'
                }
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === 'completed' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('completed')}
                size="sm"
                className={statusFilter === 'completed' 
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm' 
                  : 'border-gray-300 hover:bg-green-50 hover:text-green-700 hover:border-green-300'
                }
              >
                Completed
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedRows.length === filteredRequests.length && filteredRequests.length > 0}
                      onCheckedChange={toggleAllRows}
                    />
                  </TableHead>
                  <TableHead>Vendor Name</TableHead>
                  <TableHead>Issue 1099</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Attached Documents</TableHead>
                  <TableHead>Update</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No form requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id} className="hover:bg-gray-50">
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.includes(request.id)}
                          onCheckedChange={() => toggleRowSelection(request.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                            {request.vendorName ? request.vendorName[0].toUpperCase() : request.email[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {request.vendorName || 'No Name'}
                            </div>
                            <div className="text-sm text-gray-500">{request.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {request.issueNumber || '□'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm font-medium ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{request.attachedDocuments}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{request.updateDate}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownload(request)}
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleView(request)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleResend(request)}>
                                <Mail className="h-4 w-4 mr-2" />
                                Resend Email
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(request)} className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Show All Link */}
      {filteredRequests.length > 0 && (
        <div className="text-center">
          <Button variant="link" className="text-blue-600">
            Show all
          </Button>
        </div>
      )}
    </div>
  );
}
