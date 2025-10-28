import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Mail, 
  X, 
  Plus, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  FileText,
  Upload,
  Users,
  Building2,
  CreditCard
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

// Mock issuers - In production, fetch from API or context
const MOCK_ISSUERS = [
  { id: '1', businessName: 'Acme Corporation', einTin: '12-3456789' },
  { id: '2', businessName: 'Tech Solutions LLC', einTin: '98-7654321' },
  { id: '3', businessName: 'Global Enterprises', einTin: '45-6789012' },
  { id: '4', businessName: 'Smith & Partners', einTin: '78-9012345' },
  { id: '5', businessName: 'Freelance Services', einTin: '11-2233445' },
];

interface Recipient {
  vendorName: string;
  email: string;
}

interface PrefilledFormData {
  name: string;
  businessName: string;
  taxClassification: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  ssn: string;
  ein: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
}

interface SendNewRequestModalProps {
  open: boolean;
  onClose: () => void;
}

const W_FORMS = [
  { 
    id: 'W-9', 
    name: 'W-9', 
    description: 'Request for Taxpayer Identification Number', 
    icon: '🆔',
    fields: ['Name', 'Business Name', 'Tax Classification', 'Address', 'City/State/ZIP', 'SSN/EIN', 'Signature']
  },
  { 
    id: 'W-2', 
    name: 'W-2', 
    description: 'Wage and Tax Statement', 
    icon: '💵',
    fields: ['Employer Info', 'Employee Info', 'Wages/Tips', 'Federal Tax Withheld', 'Social Security', 'Medicare', 'State/Local Taxes']
  },
  { 
    id: 'W-4', 
    name: 'W-4', 
    description: 'Employee\'s Withholding Certificate', 
    icon: '📝',
    fields: ['Personal Info', 'Filing Status', 'Dependents', 'Other Adjustments', 'Extra Withholding', 'Signature']
  },
  { 
    id: 'W-8BEN', 
    name: 'W-8BEN', 
    description: 'Certificate of Foreign Status', 
    icon: '🌐',
    fields: ['Name', 'Country of Citizenship', 'Permanent Address', 'Mailing Address', 'Tax ID', 'Reference Numbers', 'Treaty Benefits', 'Signature']
  },
  { 
    id: 'W-8ECI', 
    name: 'W-8ECI', 
    description: 'Certificate of Foreign Person', 
    icon: '🌍',
    fields: ['Name', 'Country', 'Address', 'Tax ID', 'Reference Numbers', 'Business Type', 'Income Details', 'Signature']
  },
  { 
    id: 'Form 2848', 
    name: 'Form 2848', 
    description: 'Power of Attorney', 
    icon: '⚖️',
    fields: ['Taxpayer Info', 'Representative Info', 'Acts Authorized', 'Tax Matters', 'Years/Periods', 'Additional Info', 'Signatures']
  },
  { 
    id: 'Form 8821', 
    name: 'Form 8821', 
    description: 'Tax Information Authorization', 
    icon: '📋',
    fields: ['Taxpayer Info', 'Appointee Info', 'Tax Matters', 'Years/Periods', 'Disclosure', 'Retention/Revocation', 'Signature']
  },
];

export function SendNewRequestModal({ open, onClose }: SendNewRequestModalProps) {
  const [step, setStep] = useState<'select' | 'recipients'>('select');
  const [selectedForm, setSelectedForm] = useState<string>('');
  const [selectedIssuer, setSelectedIssuer] = useState<string>('');
  const [formType, setFormType] = useState<'blank' | 'prefilled'>('blank');
  const [collectPaymentDetails, setCollectPaymentDetails] = useState(false);
  const [collectPaymentDetailsBlank, setCollectPaymentDetailsBlank] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([{ vendorName: '', email: '' }]);
  const [prefilledData, setPrefilledData] = useState<PrefilledFormData>({
    name: '',
    businessName: '',
    taxClassification: 'Individual/Sole Proprietor',
    address: '',
    city: '',
    state: '',
    zip: '',
    ssn: '',
    ein: '',
    bankName: '',
    accountNumber: '',
    routingNumber: ''
  });
  const [sending, setSending] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvError, setCsvError] = useState<string>('');
  const [response, setResponse] = useState<{
    success: boolean;
    message: string;
    sentTo?: string[];
  } | null>(null);

  const handleFormSelect = (formId: string) => {
    setSelectedForm(formId);
    setStep('recipients');
  };

  const addRecipient = () => {
    setRecipients([...recipients, { vendorName: '', email: '' }]);
  };

  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((_, i) => i !== index));
    }
  };

  const updateRecipient = (index: number, field: keyof Recipient, value: string) => {
    const updated = [...recipients];
    updated[index][field] = value;
    setRecipients(updated);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setCsvError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        // Skip header row if it exists
        const startIndex = lines[0].toLowerCase().includes('email') ? 1 : 0;
        
        const parsedRecipients: Recipient[] = [];
        
        for (let i = startIndex; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
          
          if (parts.length >= 1) {
            const email = parts[parts.length - 1]; // Last column is email
            const vendorName = parts.length > 1 ? parts[0] : ''; // First column is name
            
            if (email && validateEmail(email)) {
              parsedRecipients.push({ vendorName, email });
            }
          }
        }
        
        if (parsedRecipients.length === 0) {
          setCsvError('No valid email addresses found in CSV file');
        } else {
          setRecipients(parsedRecipients);
          setCsvError('');
        }
      } catch (error) {
        setCsvError('Error parsing CSV file. Please check the format.');
      }
    };
    
    reader.readAsText(file);
  };

  const downloadSampleCsv = () => {
    const csvContent = 'Vendor Name,Email\nJohn Doe,john@example.com\nJane Smith,jane@example.com';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_recipients.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSend = async () => {
    // Validate issuer selection
    if (!selectedIssuer) {
      setResponse({
        success: false,
        message: 'Please select an issuer before sending the request'
      });
      return;
    }

    // Validate all emails
    const invalidEmails = recipients.filter(r => r.email && !validateEmail(r.email));
    if (invalidEmails.length > 0) {
      setResponse({
        success: false,
        message: 'Please enter valid email addresses for all recipients'
      });
      return;
    }

    const emptyEmails = recipients.filter(r => !r.email);
    if (emptyEmails.length > 0) {
      setResponse({
        success: false,
        message: 'Please enter email addresses for all recipients'
      });
      return;
    }

    setSending(true);
    setResponse(null);

    try {
      // Simulate API call with issuer information
      const issuer = MOCK_ISSUERS.find(i => i.id === selectedIssuer);
      await new Promise(resolve => setTimeout(resolve, 2000));

      const sentEmails = recipients.map(r => r.email);
      const formTypeText = formType === 'blank' ? 'blank' : 'prefilled';
      
      setResponse({
        success: true,
        message: `${selectedForm} ${formTypeText} form request sent successfully from ${issuer?.businessName} to ${sentEmails.length} recipient${sentEmails.length > 1 ? 's' : ''}`,
        sentTo: sentEmails
      });

      // Don't auto-close - let user close manually

    } catch (error) {
      setResponse({
        success: false,
        message: 'Failed to send form request. Please try again.'
      });
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setStep('select');
    setSelectedForm('');
    setSelectedIssuer('');
    setFormType('blank');
    setCollectPaymentDetails(false);
    setRecipients([{ vendorName: '', email: '' }]);
    setPrefilledData({
      name: '',
      businessName: '',
      taxClassification: 'Individual/Sole Proprietor',
      address: '',
      city: '',
      state: '',
      zip: '',
      ssn: '',
      ein: '',
      bankName: '',
      accountNumber: '',
      routingNumber: ''
    });
    setResponse(null);
    setCsvFile(null);
    setCsvError('');
    onClose();
  };

  const handleBack = () => {
    setStep('select');
    setSelectedForm('');
    setSelectedIssuer('');
    setFormType('blank');
    setResponse(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Mail className="h-6 w-6 text-blue-600" />
            Send New Form Request
          </DialogTitle>
          <DialogDescription>
            {step === 'select' 
              ? 'Select a W-form type to send to your recipients'
              : `Send ${selectedForm} request to recipients`
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'select' ? (
          /* Step 1: Select Form Type */
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {W_FORMS.map((form) => (
                <Card
                  key={form.id}
                  className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-blue-500 border-2 border-gray-200 group"
                  onClick={() => handleFormSelect(form.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-lg bg-blue-50 group-hover:bg-blue-600 flex items-center justify-center text-2xl flex-shrink-0 transition-all duration-300">
                        <span className="group-hover:scale-110 transition-transform duration-300">{form.icon}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{form.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{form.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* Step 2: Add Recipients */
          <div className="space-y-6 py-4">
            {/* Selected Form Badge */}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-base px-4 py-2 bg-blue-50 text-blue-700">
                <FileText className="h-4 w-4 mr-2" />
                {selectedForm}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBack}
                className="hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
              >
                Change Form
              </Button>
            </div>

            {/* Issuer Selection */}
            <Card className="border-blue-200 bg-blue-50 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <Label className="text-base font-semibold text-blue-900">Select Issuer</Label>
                  </div>
                  <Select value={selectedIssuer} onValueChange={setSelectedIssuer}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Choose which issuer is requesting this form" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_ISSUERS.map((issuer) => (
                        <SelectItem key={issuer.id} value={issuer.id}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{issuer.businessName}</span>
                            <span className="text-sm text-gray-500">({issuer.einTin})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedIssuer && (
                    <div className="flex items-center gap-2 text-sm text-blue-700 animate-fade-in">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>
                        Issuer selected: {MOCK_ISSUERS.find(i => i.id === selectedIssuer)?.businessName}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Form Type Selection */}
            <Card className="border-blue-200 bg-blue-50 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <Label className="text-base font-semibold text-blue-900">Request Type</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Card
                      className={`cursor-pointer transition-all duration-300 group ${
                        formType === 'blank'
                          ? 'border-blue-600 bg-white ring-2 ring-blue-600 shadow-lg'
                          : 'border-gray-300 bg-white hover:border-blue-500 hover:shadow-md hover:scale-[1.02]'
                      }`}
                      onClick={() => setFormType('blank')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">📄</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-gray-900">Blank Form</h3>
                              {formType === 'blank' && (
                                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Send empty form for recipient to fill out completely
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card
                      className={`cursor-pointer transition-all duration-300 group ${
                        formType === 'prefilled'
                          ? 'border-blue-600 bg-white ring-2 ring-blue-600 shadow-lg'
                          : 'border-gray-300 bg-white hover:border-blue-500 hover:shadow-md hover:scale-[1.02]'
                      }`}
                      onClick={() => setFormType('prefilled')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">✍️</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-gray-900">Prefilled Form</h3>
                              {formType === 'prefilled' && (
                                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Send prefilled form for signature only
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  {formType === 'prefilled' && (
                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800 text-sm">
                        The form will be pre-filled with issuer information. Recipients only need to review and sign.
                      </AlertDescription>
                    </Alert>
                  )}
                  {formType === 'blank' && (
                    <Card className="border-blue-200 bg-blue-50">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="collect-payment-blank"
                            checked={collectPaymentDetailsBlank}
                            onCheckedChange={(checked) => setCollectPaymentDetailsBlank(checked as boolean)}
                          />
                          <div className="flex items-center gap-2 flex-1">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                            <Label
                              htmlFor="collect-payment-blank"
                              className="text-base font-semibold text-blue-900 cursor-pointer"
                            >
                              Collect Payment Details (Optional)
                            </Label>
                          </div>
                        </div>
                        {collectPaymentDetailsBlank && (
                          <Alert className="bg-blue-100 border-blue-300 mt-3">
                            <AlertCircle className="h-4 w-4 text-blue-700" />
                            <AlertDescription className="text-blue-900 text-sm">
                              Payment details collection will be included in the blank form request.
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Prefilled Form Data Section */}
            {formType === 'prefilled' && (
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Fill Form Information for Payee
                  </CardTitle>
                  <CardDescription>
                    Enter the payee information that will be prefilled in the form
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="payee-name">Name (as shown on tax return) *</Label>
                      <Input
                        id="payee-name"
                        value={prefilledData.name}
                        onChange={(e) => setPrefilledData({ ...prefilledData, name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payee-business">Business Name (if different)</Label>
                      <Input
                        id="payee-business"
                        value={prefilledData.businessName}
                        onChange={(e) => setPrefilledData({ ...prefilledData, businessName: e.target.value })}
                        placeholder="ABC Company LLC"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tax-classification">Federal Tax Classification *</Label>
                    <Select 
                      value={prefilledData.taxClassification}
                      onValueChange={(value) => setPrefilledData({ ...prefilledData, taxClassification: value })}
                    >
                      <SelectTrigger id="tax-classification">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Individual/Sole Proprietor">Individual/Sole Proprietor</SelectItem>
                        <SelectItem value="C Corporation">C Corporation</SelectItem>
                        <SelectItem value="S Corporation">S Corporation</SelectItem>
                        <SelectItem value="Partnership">Partnership</SelectItem>
                        <SelectItem value="Trust/Estate">Trust/Estate</SelectItem>
                        <SelectItem value="LLC">Limited Liability Company</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payee-address">Address *</Label>
                    <Input
                      id="payee-address"
                      value={prefilledData.address}
                      onChange={(e) => setPrefilledData({ ...prefilledData, address: e.target.value })}
                      placeholder="123 Main Street, Suite 100"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="payee-city">City *</Label>
                      <Input
                        id="payee-city"
                        value={prefilledData.city}
                        onChange={(e) => setPrefilledData({ ...prefilledData, city: e.target.value })}
                        placeholder="New York"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payee-state">State *</Label>
                      <Input
                        id="payee-state"
                        value={prefilledData.state}
                        onChange={(e) => setPrefilledData({ ...prefilledData, state: e.target.value })}
                        placeholder="NY"
                        maxLength={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payee-zip">ZIP Code *</Label>
                      <Input
                        id="payee-zip"
                        value={prefilledData.zip}
                        onChange={(e) => setPrefilledData({ ...prefilledData, zip: e.target.value })}
                        placeholder="10001"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="payee-ssn">Social Security Number</Label>
                      <Input
                        id="payee-ssn"
                        value={prefilledData.ssn}
                        onChange={(e) => setPrefilledData({ ...prefilledData, ssn: e.target.value })}
                        placeholder="XXX-XX-XXXX"
                        maxLength={11}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payee-ein">Employer ID Number</Label>
                      <Input
                        id="payee-ein"
                        value={prefilledData.ein}
                        onChange={(e) => setPrefilledData({ ...prefilledData, ein: e.target.value })}
                        placeholder="XX-XXXXXXX"
                        maxLength={10}
                      />
                    </div>
                  </div>

                  {/* Payment Details Toggle */}
                  <div className="flex items-center space-x-2 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 transition-all duration-300 hover:shadow-md hover:border-blue-400">
                    <Checkbox
                      id="collect-payment"
                      checked={collectPaymentDetails}
                      onCheckedChange={(checked) => setCollectPaymentDetails(checked as boolean)}
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <Label
                        htmlFor="collect-payment"
                        className="text-base font-semibold text-blue-900 cursor-pointer"
                      >
                        Collect Payment Details (Optional)
                      </Label>
                    </div>
                  </div>

                  {/* Payment Details Fields */}
                  {collectPaymentDetails && (
                    <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200 animate-fade-in">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                        <h4 className="font-semibold text-blue-900">Payment Information</h4>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bank-name">Bank Name</Label>
                        <Input
                          id="bank-name"
                          value={prefilledData.bankName}
                          onChange={(e) => setPrefilledData({ ...prefilledData, bankName: e.target.value })}
                          placeholder="Bank of America"
                          className="bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="account-number">Account Number</Label>
                          <Input
                            id="account-number"
                            value={prefilledData.accountNumber}
                            onChange={(e) => setPrefilledData({ ...prefilledData, accountNumber: e.target.value })}
                            placeholder="XXXXXXXXXX"
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="routing-number">Routing Number</Label>
                          <Input
                            id="routing-number"
                            value={prefilledData.routingNumber}
                            onChange={(e) => setPrefilledData({ ...prefilledData, routingNumber: e.target.value })}
                            placeholder="XXXXXXXXX"
                            maxLength={9}
                            className="bg-white"
                          />
                        </div>
                      </div>

                      <Alert className="bg-blue-100 border-blue-300">
                        <AlertCircle className="h-4 w-4 text-blue-700" />
                        <AlertDescription className="text-blue-900 text-sm">
                          Payment details will be included in the prefilled form for the recipient to review.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}

                  <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800 text-sm">
                      This information will be prefilled in the form. Recipients will only need to review and provide their signature.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}

            {/* Recipients Section with Tabs */}
            <Tabs defaultValue="manual" className="w-full">
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="manual" className="gap-2">
                    <Users className="h-4 w-4" />
                    Manual Entry
                  </TabsTrigger>
                  <TabsTrigger value="csv" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Bulk Upload (CSV)
                  </TabsTrigger>
                </TabsList>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                  {recipients.length} recipient{recipients.length > 1 ? 's' : ''}
                </Badge>
              </div>

              {/* Manual Entry Tab */}
              <TabsContent value="manual" className="space-y-4">
                {recipients.map((recipient, index) => (
                <Card key={index} className="border-gray-200 transition-all duration-300 hover:shadow-md hover:border-blue-300">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`vendor-${index}`}>
                            Vendor Name (Optional)
                          </Label>
                          <Input
                            id={`vendor-${index}`}
                            value={recipient.vendorName}
                            onChange={(e) => updateRecipient(index, 'vendorName', e.target.value)}
                            placeholder="Vendor Name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`email-${index}`}>
                            Email <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id={`email-${index}`}
                            type="email"
                            value={recipient.email}
                            onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                            placeholder="email@example.com"
                            className={recipient.email && !validateEmail(recipient.email) ? 'border-red-500' : ''}
                          />
                          {recipient.email && !validateEmail(recipient.email) && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Invalid email format
                            </p>
                          )}
                        </div>
                      </div>
                      {recipients.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRecipient(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

                <Button
                  variant="outline"
                  onClick={addRecipient}
                  className="w-full gap-2 border-dashed border-2 border-blue-300 text-blue-600 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md hover:scale-[1.01] transition-all duration-300 font-semibold"
                >
                  <Plus className="h-4 w-4" />
                  Add More Recipients
                </Button>
              </TabsContent>

              {/* CSV Upload Tab */}
              <TabsContent value="csv" className="space-y-4">
                <Card className="border-blue-200 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-6 space-y-4">
                    <div className="text-center space-y-4">
                      <div className="flex justify-center">
                        <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center transition-all duration-300 hover:bg-blue-100 hover:scale-110">
                          <Upload className="h-8 w-8 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Upload CSV File</h3>
                        <p className="text-sm text-gray-600">
                          Upload a CSV file with vendor names and email addresses
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-center gap-3">
                        <Input
                          type="file"
                          accept=".csv"
                          onChange={handleCsvUpload}
                          className="max-w-xs"
                        />
                        <Button
                          variant="link"
                          onClick={downloadSampleCsv}
                          className="text-blue-600 hover:text-blue-700 hover:underline transition-all duration-200 font-semibold"
                        >
                          Download Sample CSV
                        </Button>
                      </div>

                      {csvFile && !csvError && (
                        <Alert className="bg-green-50 border-green-200">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-800">
                            <strong>{csvFile.name}</strong> uploaded successfully!
                            <br />
                            {recipients.length} recipient{recipients.length > 1 ? 's' : ''} loaded.
                          </AlertDescription>
                        </Alert>
                      )}

                      {csvError && (
                        <Alert className="bg-red-50 border-red-200">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-red-800">
                            {csvError}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-semibold mb-2">CSV Format:</p>
                      <code className="text-xs bg-white p-2 rounded block">
                        Vendor Name,Email<br />
                        John Doe,john@example.com<br />
                        Jane Smith,jane@example.com
                      </code>
                    </div>

                    {recipients.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold">Preview ({recipients.length} recipients):</p>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {recipients.slice(0, 5).map((r, idx) => (
                            <div key={idx} className="text-sm bg-white p-2 rounded border">
                              <span className="font-medium">{r.vendorName || 'No name'}</span>
                              {' - '}
                              <span className="text-gray-600">{r.email}</span>
                            </div>
                          ))}
                          {recipients.length > 5 && (
                            <p className="text-xs text-gray-500 text-center">
                              +{recipients.length - 5} more recipients
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Response Message */}
            {response && (
              <Alert className={response.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                <div className="flex items-start gap-2">
                  {response.success ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <AlertDescription className={response.success ? 'text-green-800' : 'text-red-800'}>
                      <p className="font-semibold mb-1">{response.message}</p>
                      {response.success && response.sentTo && (
                        <div className="mt-2">
                          <p className="text-sm font-medium mb-1">Sent to:</p>
                          <div className="flex flex-wrap gap-2">
                            {response.sentTo.map((email, idx) => (
                              <Badge key={idx} variant="secondary" className="bg-green-100 text-green-800">
                                {email}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={sending}
                className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 hover:shadow-md transition-all duration-200 font-semibold px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={sending}
                className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white gap-2 min-w-[140px] shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-semibold px-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Request
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
