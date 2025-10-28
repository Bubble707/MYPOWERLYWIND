import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  FileText,
  Building2
} from 'lucide-react';

interface RequestExtensionModalProps {
  open: boolean;
  onClose: () => void;
  taxYear: string;
  payerInfo?: {
    name: string;
    ein: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
}

const FORM_1099_TYPES = [
  { id: '1099-NEC', name: '1099-NEC - Nonemployee Compensation' },
  { id: '1099-MISC', name: '1099-MISC - Miscellaneous Information' },
  { id: '1099-INT', name: '1099-INT - Interest Income' },
  { id: '1099-DIV', name: '1099-DIV - Dividends and Distributions' },
  { id: '1099-K', name: '1099-K - Payment Card and Third Party' },
  { id: '1099-R', name: '1099-R - Distributions From Pensions' },
  { id: '1099-B', name: '1099-B - Proceeds from Broker' },
  { id: '1099-S', name: '1099-S - Real Estate Transactions' },
  { id: '1099-C', name: '1099-C - Cancellation of Debt' },
  { id: '1099-G', name: '1099-G - Government Payments' },
];

export function RequestExtensionModal({ open, onClose, taxYear, payerInfo }: RequestExtensionModalProps) {
  const [formType, setFormType] = useState<string>('');
  const [payerName, setPayerName] = useState(payerInfo?.name || '');
  const [payerEIN, setPayerEIN] = useState(payerInfo?.ein || '');
  const [payerAddress, setPayerAddress] = useState(payerInfo?.address || '');
  const [payerCity, setPayerCity] = useState(payerInfo?.city || '');
  const [payerState, setPayerState] = useState(payerInfo?.state || '');
  const [payerZip, setPayerZip] = useState(payerInfo?.zip || '');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [response, setResponse] = useState<{
    success: boolean;
    message: string;
    confirmationNumber?: string;
  } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formType) newErrors.formType = 'Please select a 1099 form type';
    if (!payerName.trim()) newErrors.payerName = 'Payer name is required';
    if (!payerEIN.trim()) newErrors.payerEIN = 'EIN is required';
    if (payerEIN.trim() && !/^\d{2}-?\d{7}$/.test(payerEIN)) {
      newErrors.payerEIN = 'EIN must be in format XX-XXXXXXX';
    }
    if (!payerAddress.trim()) newErrors.payerAddress = 'Address is required';
    if (!payerCity.trim()) newErrors.payerCity = 'City is required';
    if (!payerState.trim()) newErrors.payerState = 'State is required';
    if (!payerZip.trim()) newErrors.payerZip = 'ZIP code is required';
    if (payerZip.trim() && !/^\d{5}(-\d{4})?$/.test(payerZip)) {
      newErrors.payerZip = 'ZIP must be in format XXXXX or XXXXX-XXXX';
    }
    if (!contactEmail.trim()) newErrors.contactEmail = 'Contact email is required';
    if (contactEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }
    if (!contactPhone.trim()) newErrors.contactPhone = 'Contact phone is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setResponse({
        success: false,
        message: 'Please correct the errors in the form'
      });
      return;
    }

    setSubmitting(true);
    setResponse(null);

    try {
      // Call API endpoint
      const extensionRequest = {
        taxYear,
        formType,
        payer: {
          name: payerName,
          ein: payerEIN,
          address: payerAddress,
          city: payerCity,
          state: payerState,
          zip: payerZip,
        },
        contact: {
          email: contactEmail,
          phone: contactPhone,
        },
        requestDate: new Date().toISOString(),
      };

      const apiResponse = await fetch('/api/extension-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(extensionRequest),
      });

      const data = await apiResponse.json();

      if (apiResponse.ok && data.success) {
        setResponse({
          success: true,
          message: 'Your extension request has been successfully submitted to the IRS.',
          confirmationNumber: data.confirmationNumber,
        });
      } else {
        setResponse({
          success: false,
          message: data.message || 'Failed to submit extension request. Please try again.',
        });
      }
    } catch (error) {
      console.error('Extension request error:', error);
      setResponse({
        success: false,
        message: 'An error occurred while submitting your request. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setFormType('');
      setContactEmail('');
      setContactPhone('');
      setResponse(null);
      setErrors({});
      onClose();
    }
  };

  const handleDownloadConfirmation = () => {
    if (!response?.confirmationNumber) return;

    const confirmationText = `
IRS EXTENSION REQUEST CONFIRMATION
=====================================

Confirmation Number: ${response.confirmationNumber}
Tax Year: ${taxYear}
Form Type: ${formType}
Request Date: ${new Date().toLocaleDateString()}

Payer Information:
${payerName}
EIN: ${payerEIN}
${payerAddress}
${payerCity}, ${payerState} ${payerZip}

Contact Information:
Email: ${contactEmail}
Phone: ${contactPhone}

Status: ${response.message}

Please keep this confirmation for your records.
=====================================
`;

    const blob = new Blob([confirmationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IRS_Extension_${response.confirmationNumber}_${taxYear}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            Request IRS Extension
          </DialogTitle>
          <DialogDescription className="text-base">
            Request a filing extension for your 1099 forms with the IRS
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Success/Error Messages */}
          {response && (
            <Alert className={response.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
              {response.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <AlertDescription className={response.success ? 'text-green-800' : 'text-red-800'}>
                {response.message}
                {response.confirmationNumber && (
                  <div className="mt-2 font-semibold">
                    Confirmation Number: {response.confirmationNumber}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {!response?.success && (
            <>
              {/* Tax Year (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="taxYear" className="text-sm font-semibold text-gray-700">
                  Tax Year
                </Label>
                <Input
                  id="taxYear"
                  value={taxYear}
                  disabled
                  className="bg-gray-50 border-gray-300"
                />
              </div>

              {/* Form Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="formType" className="text-sm font-semibold text-gray-700">
                  1099 Form Type <span className="text-red-500">*</span>
                </Label>
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger className={errors.formType ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select form type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {FORM_1099_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.formType && (
                  <p className="text-sm text-red-600">{errors.formType}</p>
                )}
              </div>

              {/* Payer Information Section */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Payer Information</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="payerName" className="text-sm font-semibold text-gray-700">
                      Business/Payer Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="payerName"
                      value={payerName}
                      onChange={(e) => setPayerName(e.target.value)}
                      placeholder="Enter business name"
                      className={errors.payerName ? 'border-red-500' : ''}
                    />
                    {errors.payerName && (
                      <p className="text-sm text-red-600">{errors.payerName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payerEIN" className="text-sm font-semibold text-gray-700">
                      EIN (Employer ID) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="payerEIN"
                      value={payerEIN}
                      onChange={(e) => setPayerEIN(e.target.value)}
                      placeholder="XX-XXXXXXX"
                      className={errors.payerEIN ? 'border-red-500' : ''}
                    />
                    {errors.payerEIN && (
                      <p className="text-sm text-red-600">{errors.payerEIN}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payerAddress" className="text-sm font-semibold text-gray-700">
                      Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="payerAddress"
                      value={payerAddress}
                      onChange={(e) => setPayerAddress(e.target.value)}
                      placeholder="Street address"
                      className={errors.payerAddress ? 'border-red-500' : ''}
                    />
                    {errors.payerAddress && (
                      <p className="text-sm text-red-600">{errors.payerAddress}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payerCity" className="text-sm font-semibold text-gray-700">
                      City <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="payerCity"
                      value={payerCity}
                      onChange={(e) => setPayerCity(e.target.value)}
                      placeholder="City"
                      className={errors.payerCity ? 'border-red-500' : ''}
                    />
                    {errors.payerCity && (
                      <p className="text-sm text-red-600">{errors.payerCity}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payerState" className="text-sm font-semibold text-gray-700">
                      State <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="payerState"
                      value={payerState}
                      onChange={(e) => setPayerState(e.target.value.toUpperCase())}
                      placeholder="ST"
                      maxLength={2}
                      className={errors.payerState ? 'border-red-500' : ''}
                    />
                    {errors.payerState && (
                      <p className="text-sm text-red-600">{errors.payerState}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payerZip" className="text-sm font-semibold text-gray-700">
                      ZIP Code <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="payerZip"
                      value={payerZip}
                      onChange={(e) => setPayerZip(e.target.value)}
                      placeholder="XXXXX or XXXXX-XXXX"
                      className={errors.payerZip ? 'border-red-500' : ''}
                    />
                    {errors.payerZip && (
                      <p className="text-sm text-red-600">{errors.payerZip}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail" className="text-sm font-semibold text-gray-700">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="your@email.com"
                      className={errors.contactEmail ? 'border-red-500' : ''}
                    />
                    {errors.contactEmail && (
                      <p className="text-sm text-red-600">{errors.contactEmail}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone" className="text-sm font-semibold text-gray-700">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="(XXX) XXX-XXXX"
                      className={errors.contactPhone ? 'border-red-500' : ''}
                    />
                    {errors.contactPhone && (
                      <p className="text-sm text-red-600">{errors.contactPhone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Information Notice */}
              <Alert className="bg-blue-50 border-blue-200">
                <FileText className="h-5 w-5 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Important:</strong> Filing extensions grant you additional time to file,
                  but do not extend the deadline for payment of taxes owed. Any taxes due must still
                  be paid by the original deadline to avoid penalties and interest.
                </AlertDescription>
              </Alert>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 border-t pt-4">
            {response?.success ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleDownloadConfirmation}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Download Confirmation
                </Button>
                <Button onClick={handleClose}>
                  Close
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4" />
                      Submit Extension Request
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
