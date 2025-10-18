import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SendFormRequest } from './SendFormRequest';
import { 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Download, 
  Save, 
  Send,
  Info,
  Shield,
  Mail
} from 'lucide-react';

interface W9FormData {
  // Part I: Taxpayer Identification
  name: string;
  businessName: string;
  taxClassification: string;
  otherClassification: string;
  exemptPayeeCode: string;
  exemptionFATCA: string;
  
  // Address
  address: string;
  city: string;
  state: string;
  zip: string;
  
  // Part II: Certification
  ssn: string;
  ein: string;
  
  // Signature
  signature: string;
  signatureDate: string;
  certifyUnderPenalty: boolean;

  // Payment Information (optional)
  includePayment: boolean;
  paymentMethod?: string; // 'credit_card' or 'ach'
  cardNumber?: string;
  expDate?: string;
  cvv?: string;
  accountNumber?: string;
  routingNumber?: string;
  bankName?: string;
  bankAddress?: string;
}

interface W9FormProps {
  onSave?: (data: W9FormData) => void;
  onSubmit?: (data: W9FormData) => void;
  initialData?: Partial<W9FormData>;
}

export function W9Form({ onSave, onSubmit, initialData }: W9FormProps) {
  const [formData, setFormData] = useState<W9FormData>({
    name: '',
    businessName: '',
    taxClassification: '',
    otherClassification: '',
    exemptPayeeCode: '',
    exemptionFATCA: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    ssn: '',
    ein: '',
    signature: '',
    signatureDate: new Date().toISOString().split('T')[0],
    certifyUnderPenalty: false,
    includePayment: false,
    paymentMethod: undefined,
    cardNumber: '',
    expDate: '',
    cvv: '',
    accountNumber: '',
    routingNumber: '',
    bankName: '',
    bankAddress: '',
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [showSendRequest, setShowSendRequest] = useState(false);

  const handleChange = (field: keyof W9FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const formatSSN = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`;
  };

  const formatEIN = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}-${digits.slice(2, 9)}`;
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name) newErrors.name = 'Name is required';
      if (!formData.taxClassification) newErrors.taxClassification = 'Tax classification is required';
      if (formData.taxClassification === 'other' && !formData.otherClassification) {
        newErrors.otherClassification = 'Please specify other classification';
      }
    }

    if (step === 2) {
      if (!formData.address) newErrors.address = 'Address is required';
      if (!formData.city) newErrors.city = 'City is required';
      if (!formData.state) newErrors.state = 'State is required';
      if (!formData.zip) newErrors.zip = 'ZIP code is required';
    }

    if (step === 3) {
      if (!formData.ssn && !formData.ein) {
        newErrors.ssn = 'Either SSN or EIN is required';
      }
      if (formData.ssn && formData.ssn.replace(/\D/g, '').length !== 9) {
        newErrors.ssn = 'SSN must be 9 digits';
      }
      if (formData.ein && formData.ein.replace(/\D/g, '').length !== 9) {
        newErrors.ein = 'EIN must be 9 digits';
      }
    }

    if (step === 4) {
      if (!formData.signature) newErrors.signature = 'Signature is required';
      if (!formData.certifyUnderPenalty) newErrors.certifyUnderPenalty = 'You must certify under penalty of perjury';
    }

    if (step === 5) {
      if (formData.includePayment) {
        if (!formData.paymentMethod) {
          newErrors.paymentMethod = 'Payment method is required';
        }
        if (formData.paymentMethod === 'credit_card') {
          if (!formData.cardNumber || formData.cardNumber.replace(/\D/g, '').length !== 16) {
            newErrors.cardNumber = 'Card number must be 16 digits';
          }
          if (!formData.expDate || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expDate)) {
            newErrors.expDate = 'Expiry date must be in MM/YY format';
          }
          if (!formData.cvv || !/^\d{3,4}$/.test(formData.cvv)) {
            newErrors.cvv = 'CVV must be 3 or 4 digits';
          }
        } else if (formData.paymentMethod === 'ach') {
          if (!formData.accountNumber || formData.accountNumber.length < 5) {
            newErrors.accountNumber = 'Account number is required';
          }
          if (!formData.routingNumber || formData.routingNumber.length !== 9) {
            newErrors.routingNumber = 'Routing number must be 9 digits';
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
  };

  const handleSubmit = () => {
    if (validateStep(5) && onSubmit) {
      onSubmit(formData);
    }
  };

  const progress = (currentStep / 5) * 100;

  return (
    <div className="space-y-6">
      {/* Send Request Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => setShowSendRequest(!showSendRequest)}
          className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
        >
          <Mail className="h-4 w-4" />
          {showSendRequest ? 'Hide' : 'Send'} Request via Email
        </Button>
      </div>

      {/* Send Request Component */}
      {showSendRequest && (
        <SendFormRequest
          formType="W-9"
          onClose={() => setShowSendRequest(false)}
        />
      )}

      {/* Header */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Form W-9</CardTitle>
                <CardDescription className="text-base">
                  Request for Taxpayer Identification Number and Certification
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              Step {currentStep} of 5
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Form Progress</span>
              <span className="font-semibold">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span className={currentStep >= 1 ? 'text-blue-600 font-medium' : ''}>Identification</span>
              <span className={currentStep >= 2 ? 'text-blue-600 font-medium' : ''}>Address</span>
              <span className={currentStep >= 3 ? 'text-blue-600 font-medium' : ''}>TIN</span>
              <span className={currentStep >= 4 ? 'text-blue-600 font-medium' : ''}>Certification</span>
              <span className={currentStep >= 5 ? 'text-blue-600 font-medium' : ''}>Payment</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Taxpayer Identification */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Part I: Taxpayer Identification</CardTitle>
            <CardDescription>Provide your name and tax classification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name (as shown on your income tax return) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Individual or Business Name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName">
                Business name/disregarded entity name (if different from above)
              </Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                placeholder="Optional"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>
                Federal tax classification <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.taxClassification}
                onValueChange={(value) => handleChange('taxClassification', value)}
              >
                <SelectTrigger className={errors.taxClassification ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select tax classification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual/sole proprietor or single-member LLC</SelectItem>
                  <SelectItem value="c-corp">C Corporation</SelectItem>
                  <SelectItem value="s-corp">S Corporation</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="trust">Trust/estate</SelectItem>
                  <SelectItem value="llc-c">Limited liability company (C Corp)</SelectItem>
                  <SelectItem value="llc-s">Limited liability company (S Corp)</SelectItem>
                  <SelectItem value="llc-p">Limited liability company (Partnership)</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.taxClassification && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.taxClassification}
                </p>
              )}
            </div>

            {formData.taxClassification === 'other' && (
              <div className="space-y-2">
                <Label htmlFor="otherClassification">
                  Specify other classification <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="otherClassification"
                  value={formData.otherClassification}
                  onChange={(e) => handleChange('otherClassification', e.target.value)}
                  placeholder="Enter classification"
                  className={errors.otherClassification ? 'border-red-500' : ''}
                />
                {errors.otherClassification && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.otherClassification}
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exemptPayeeCode">Exempt payee code (if any)</Label>
                <Input
                  id="exemptPayeeCode"
                  value={formData.exemptPayeeCode}
                  onChange={(e) => handleChange('exemptPayeeCode', e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exemptionFATCA">Exemption from FATCA reporting code (if any)</Label>
                <Input
                  id="exemptionFATCA"
                  value={formData.exemptionFATCA}
                  onChange={(e) => handleChange('exemptionFATCA', e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Select the federal tax classification that applies to you. If you are a single-member LLC that is 
                disregarded as an entity separate from its owner, check the appropriate box for your tax classification.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Address */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
            <CardDescription>Enter your current address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="address">
                Address (number, street, and apt. or suite no.) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="123 Main Street, Apt 4B"
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.address}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="City"
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.city}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">
                  State <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  placeholder="State"
                  maxLength={2}
                  className={errors.state ? 'border-red-500' : ''}
                />
                {errors.state && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.state}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip">
                  ZIP Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="zip"
                  value={formData.zip}
                  onChange={(e) => handleChange('zip', e.target.value)}
                  placeholder="12345"
                  maxLength={10}
                  className={errors.zip ? 'border-red-500' : ''}
                />
                {errors.zip && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.zip}
                  </p>
                )}
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Enter the address where you receive correspondence. This should match the address on your tax return.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Taxpayer Identification Number */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Part II: Taxpayer Identification Number (TIN)</CardTitle>
            <CardDescription>Enter your Social Security Number or Employer Identification Number</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Important:</strong> You must provide either your SSN or EIN. Do not enter both.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="ssn">Social Security Number (SSN)</Label>
              <Input
                id="ssn"
                value={formData.ssn}
                onChange={(e) => handleChange('ssn', formatSSN(e.target.value))}
                placeholder="XXX-XX-XXXX"
                maxLength={11}
                className={errors.ssn ? 'border-red-500' : ''}
              />
              {errors.ssn && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.ssn}
                </p>
              )}
              <p className="text-xs text-gray-500">For individuals and sole proprietors</p>
            </div>

            <div className="flex items-center gap-4">
              <Separator className="flex-1" />
              <span className="text-sm text-gray-500">OR</span>
              <Separator className="flex-1" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ein">Employer Identification Number (EIN)</Label>
              <Input
                id="ein"
                value={formData.ein}
                onChange={(e) => handleChange('ein', formatEIN(e.target.value))}
                placeholder="XX-XXXXXXX"
                maxLength={10}
                className={errors.ein ? 'border-red-500' : ''}
              />
              {errors.ein && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.ein}
                </p>
              )}
              <p className="text-xs text-gray-500">For businesses and organizations</p>
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Security Notice:</strong> Your TIN is confidential and will be encrypted. It will only be 
                used for tax reporting purposes as required by the IRS.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Certification */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Part III: Certification</CardTitle>
            <CardDescription>Sign and certify the information provided</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                <strong>Certification Requirements:</strong> Under penalties of perjury, I certify that:
                <ol className="list-decimal ml-4 mt-2 space-y-1 text-sm">
                  <li>The number shown on this form is my correct taxpayer identification number</li>
                  <li>I am not subject to backup withholding</li>
                  <li>I am a U.S. citizen or other U.S. person</li>
                  <li>The FATCA code(s) entered on this form (if any) indicating that I am exempt from FATCA reporting is correct</li>
                </ol>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="signature">
                Signature <span className="text-red-500">*</span>
              </Label>
              <Input
                id="signature"
                value={formData.signature}
                onChange={(e) => handleChange('signature', e.target.value)}
                placeholder="Type your full legal name"
                className={errors.signature ? 'border-red-500' : ''}
              />
              {errors.signature && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.signature}
                </p>
              )}
              <p className="text-xs text-gray-500">By typing your name, you are providing an electronic signature</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signatureDate">Date</Label>
              <Input
                id="signatureDate"
                type="date"
                value={formData.signatureDate}
                onChange={(e) => handleChange('signatureDate', e.target.value)}
              />
            </div>

            <div className="flex items-start space-x-2 p-4 bg-gray-50 rounded-lg">
              <Checkbox
                id="certify"
                checked={formData.certifyUnderPenalty}
                onCheckedChange={(checked) => handleChange('certifyUnderPenalty', checked)}
                className={errors.certifyUnderPenalty ? 'border-red-500' : ''}
              />
              <div className="space-y-1">
                <Label htmlFor="certify" className="text-sm font-medium cursor-pointer">
                  I certify under penalty of perjury <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-gray-600">
                  I understand that by checking this box and providing my signature, I am certifying that all 
                  information provided on this form is true, correct, and complete.
                </p>
                {errors.certifyUnderPenalty && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.certifyUnderPenalty}
                  </p>
                )}
              </div>
            </div>

            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-900">
                <strong>Warning:</strong> You must sign this form. The IRS does not require your consent to any 
                provision of this document other than the certifications required to avoid backup withholding.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Payment Information */}
      {currentStep === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
            <CardDescription>Provide payment details (optional)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="include-payment"
                checked={formData.includePayment}
                onCheckedChange={(checked) => handleChange('includePayment', checked)}
              />
              <div className="space-y-1">
                <Label htmlFor="include-payment" className="text-sm font-medium cursor-pointer">
                  I would like to provide payment information
                </Label>
                <p className="text-xs text-gray-600">
                  You can securely save your payment method for future use.
                </p>
              </div>
            </div>

            {formData.includePayment && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <div className="flex gap-4">
                    <Button
                      variant={formData.paymentMethod === 'credit_card' ? 'default' : 'outline'}
                      onClick={() => handleChange('paymentMethod', 'credit_card')}
                    >
                      Credit Card
                    </Button>
                    <Button
                      variant={formData.paymentMethod === 'ach' ? 'default' : 'outline'}
                      onClick={() => handleChange('paymentMethod', 'ach')}
                    >
                      Bank Transfer (ACH)
                    </Button>
                  </div>
                </div>

                {formData.paymentMethod === 'credit_card' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        value={formData.cardNumber}
                        onChange={(e) => handleChange('cardNumber', e.target.value)}
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expDate">Expiry Date</Label>
                        <Input
                          id="expDate"
                          value={formData.expDate}
                          onChange={(e) => handleChange('expDate', e.target.value)}
                          placeholder="MM/YY"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          value={formData.cvv}
                          onChange={(e) => handleChange('cvv', e.target.value)}
                          placeholder="123"
                          type="password"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.paymentMethod === 'ach' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        id="accountNumber"
                        value={formData.accountNumber}
                        onChange={(e) => handleChange('accountNumber', e.target.value)}
                        placeholder="Account number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="routingNumber">Routing Number</Label>
                      <Input
                        id="routingNumber"
                        value={formData.routingNumber}
                        onChange={(e) => handleChange('routingNumber', e.target.value)}
                        placeholder="Routing number"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              )}
              <Button variant="outline" onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                Save Draft
              </Button>
            </div>
            <div className="flex gap-3">
              {currentStep < 5 ? (
                <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
                  Next Step
                </Button>
              ) : (
                <>
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Submit Form
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* IRS Information */}
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          Need help with Form W-9?{' '}
          <a 
            href="https://www.irs.gov/forms-pubs/about-form-w-9"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline font-medium"
          >
            View IRS Instructions →
          </a>
        </AlertDescription>
      </Alert>
    </div>
  );
}
