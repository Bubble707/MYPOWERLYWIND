import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { downloadFormPDF } from '@/lib/pdfGenerator';
import { 
  FileText, 
  User, 
  Mail, 
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Send
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

interface FormData {
  // W-9 specific fields
  name?: string;
  businessName?: string;
  taxClassification?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  ssn?: string;
  ein?: string;
  signature?: string;
  signatureDate?: string;
  
  // W-2 specific fields
  employeeName?: string;
  employeeSSN?: string;
  employerName?: string;
  employerEIN?: string;
  wages?: string;
  federalTaxWithheld?: string;
  
  // Common fields
  submittedDate?: string;
  completedDate?: string;
}

interface ViewFormDetailsModalProps {
  open: boolean;
  onClose: () => void;
  request: FormRequest | null;
  formData?: FormData;
}

export function ViewFormDetailsModal({ open, onClose, request, formData }: ViewFormDetailsModalProps) {
  if (!request) return null;

  const handleDownloadPDF = () => {
    downloadFormPDF(request, mockFormData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Expired':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'Pending':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Mock form data for demonstration
  const mockFormData: FormData = formData || {
    name: request.vendorName || 'Not provided',
    businessName: 'ABC Company LLC',
    taxClassification: 'Individual/Sole Proprietor',
    address: '123 Main Street, Suite 100',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    ssn: '***-**-6789',
    signature: request.vendorName || 'Not signed',
    signatureDate: request.updateDate,
    submittedDate: request.updateDate,
    completedDate: request.status === 'Completed' ? request.updateDate : undefined,
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-2xl">Form Details</DialogTitle>
                <DialogDescription>
                  {request.formType} Request Information
                </DialogDescription>
              </div>
            </div>
            <Badge className={`${getStatusColor(request.status)} gap-1`}>
              {getStatusIcon(request.status)}
              {request.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Request Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Request Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Vendor Name</p>
                  <p className="font-medium">{request.vendorName || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {request.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Form Type</p>
                  <p className="font-medium">{request.formType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Issue Number</p>
                  <p className="font-medium">{request.issueNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {request.updateDate}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Attached Documents</p>
                  <p className="font-medium">{request.attachedDocuments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Data */}
          {request.status === 'Completed' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Form Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {request.formType === 'W-9' && (
                  <>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-gray-700">Part I: Taxpayer Identification</h4>
                      <div className="grid grid-cols-2 gap-4 pl-4">
                        <div>
                          <p className="text-sm text-gray-600">Name</p>
                          <p className="font-medium">{mockFormData.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Business Name</p>
                          <p className="font-medium">{mockFormData.businessName}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600">Tax Classification</p>
                          <p className="font-medium">{mockFormData.taxClassification}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-gray-700">Address Information</h4>
                      <div className="grid grid-cols-2 gap-4 pl-4">
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600">Address</p>
                          <p className="font-medium">{mockFormData.address}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">City</p>
                          <p className="font-medium">{mockFormData.city}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">State</p>
                          <p className="font-medium">{mockFormData.state}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">ZIP Code</p>
                          <p className="font-medium">{mockFormData.zip}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-gray-700">Part II: Taxpayer Identification Number</h4>
                      <div className="grid grid-cols-2 gap-4 pl-4">
                        <div>
                          <p className="text-sm text-gray-600">SSN/EIN</p>
                          <p className="font-medium font-mono">{mockFormData.ssn}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-gray-700">Part III: Certification</h4>
                      <div className="grid grid-cols-2 gap-4 pl-4">
                        <div>
                          <p className="text-sm text-gray-600">Signature</p>
                          <p className="font-medium italic">{mockFormData.signature}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Date</p>
                          <p className="font-medium">{mockFormData.signatureDate}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {request.formType === 'W-2' && (
                  <>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-gray-700">Employee Information</h4>
                      <div className="grid grid-cols-2 gap-4 pl-4">
                        <div>
                          <p className="text-sm text-gray-600">Employee Name</p>
                          <p className="font-medium">{mockFormData.employeeName || mockFormData.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Employee SSN</p>
                          <p className="font-medium font-mono">{mockFormData.employeeSSN || mockFormData.ssn}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-gray-700">Employer Information</h4>
                      <div className="grid grid-cols-2 gap-4 pl-4">
                        <div>
                          <p className="text-sm text-gray-600">Employer Name</p>
                          <p className="font-medium">{mockFormData.employerName || 'ABC Corporation'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Employer EIN</p>
                          <p className="font-medium font-mono">{mockFormData.employerEIN || '12-3456789'}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-gray-700">Wage Information</h4>
                      <div className="grid grid-cols-2 gap-4 pl-4">
                        <div>
                          <p className="text-sm text-gray-600">Wages</p>
                          <p className="font-medium">${mockFormData.wages || '50,000.00'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Federal Tax Withheld</p>
                          <p className="font-medium">${mockFormData.federalTaxWithheld || '7,500.00'}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {request.formType !== 'W-9' && request.formType !== 'W-2' && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>Form data will be displayed here once submitted</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {request.status === 'Pending' && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 mx-auto mb-3 text-orange-600" />
                <h3 className="font-semibold text-lg mb-2">Awaiting Response</h3>
                <p className="text-sm text-gray-600 mb-4">
                  This form request is still pending. The recipient has not completed the form yet.
                </p>
                <Button variant="outline" className="gap-2">
                  <Send className="h-4 w-4" />
                  Resend Request
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {request.status === 'Completed' && (
              <Button 
                onClick={handleDownloadPDF}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
