import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Building2,
  User,
  DollarSign,
  FileText,
  AlertCircle,
  Save,
  Download,
  Send,
  Info
} from 'lucide-react';

interface W2FormData {
  // Employee Information
  employeeSSN: string;
  employeeName: string;
  employeeAddress: string;
  employeeCity: string;
  employeeState: string;
  employeeZip: string;
  
  // Employer Information
  employerEIN: string;
  employerName: string;
  employerAddress: string;
  employerCity: string;
  employerState: string;
  employerZip: string;
  
  // Wage Information
  box1: string; // Wages, tips, other compensation
  box2: string; // Federal income tax withheld
  box3: string; // Social security wages
  box4: string; // Social security tax withheld
  box5: string; // Medicare wages and tips
  box6: string; // Medicare tax withheld
  box7: string; // Social security tips
  box8: string; // Allocated tips
  box10: string; // Dependent care benefits
  box11: string; // Nonqualified plans
  box12a_code: string;
  box12a_amount: string;
  box12b_code: string;
  box12b_amount: string;
  box12c_code: string;
  box12c_amount: string;
  box12d_code: string;
  box12d_amount: string;
  box13_statutory: boolean;
  box13_retirement: boolean;
  box13_thirdParty: boolean;
  box14: string; // Other
  
  // State/Local Information
  box15_state: string;
  box15_ein: string;
  box16: string; // State wages
  box17: string; // State income tax
  box18: string; // Local wages
  box19: string; // Local income tax
  box20: string; // Locality name
}

interface W2FormProps {
  onSave?: (data: W2FormData) => void;
  onSubmit?: (data: W2FormData) => void;
  initialData?: Partial<W2FormData>;
}

export function W2Form({ onSave, onSubmit, initialData }: W2FormProps) {
  const [formData, setFormData] = useState<W2FormData>({
    employeeSSN: '',
    employeeName: '',
    employeeAddress: '',
    employeeCity: '',
    employeeState: '',
    employeeZip: '',
    employerEIN: '',
    employerName: '',
    employerAddress: '',
    employerCity: '',
    employerState: '',
    employerZip: '',
    box1: '',
    box2: '',
    box3: '',
    box4: '',
    box5: '',
    box6: '',
    box7: '',
    box8: '',
    box10: '',
    box11: '',
    box12a_code: '',
    box12a_amount: '',
    box12b_code: '',
    box12b_amount: '',
    box12c_code: '',
    box12c_amount: '',
    box12d_code: '',
    box12d_amount: '',
    box13_statutory: false,
    box13_retirement: false,
    box13_thirdParty: false,
    box14: '',
    box15_state: '',
    box15_ein: '',
    box16: '',
    box17: '',
    box18: '',
    box19: '',
    box20: '',
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof W2FormData, value: any) => {
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

  const formatCurrency = (value: string) => {
    const num = value.replace(/[^\d.]/g, '');
    return num;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.employeeSSN) newErrors.employeeSSN = 'Employee SSN is required';
    if (!formData.employeeName) newErrors.employeeName = 'Employee name is required';
    if (!formData.employerEIN) newErrors.employerEIN = 'Employer EIN is required';
    if (!formData.employerName) newErrors.employerName = 'Employer name is required';
    if (!formData.box1) newErrors.box1 = 'Wages are required';
    if (!formData.box2) newErrors.box2 = 'Federal tax withheld is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
  };

  const handleSubmit = () => {
    if (validateForm() && onSubmit) {
      onSubmit(formData);
    }
  };

  const calculateTotals = () => {
    const wages = parseFloat(formData.box1) || 0;
    const federalTax = parseFloat(formData.box2) || 0;
    const ssWages = parseFloat(formData.box3) || 0;
    const ssTax = parseFloat(formData.box4) || 0;
    const medicareWages = parseFloat(formData.box5) || 0;
    const medicareTax = parseFloat(formData.box6) || 0;
    
    return {
      totalWages: wages,
      totalWithheld: federalTax + ssTax + medicareTax,
      netPay: wages - (federalTax + ssTax + medicareTax)
    };
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-green-600 flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Form W-2</CardTitle>
                <CardDescription className="text-base">
                  Wage and Tax Statement
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-sm bg-white">
              Tax Year {new Date().getFullYear()}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Card */}
      <Card className="border-blue-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">Total Wages</p>
              <p className="text-2xl font-bold text-green-600">
                ${totals.totalWages.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Withheld</p>
              <p className="text-2xl font-bold text-red-600">
                ${totals.totalWithheld.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Net Pay</p>
              <p className="text-2xl font-bold text-blue-600">
                ${totals.netPay.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Form */}
      <Tabs defaultValue="employee" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="employee" className="gap-2">
            <User className="h-4 w-4" />
            Employee
          </TabsTrigger>
          <TabsTrigger value="employer" className="gap-2">
            <Building2 className="h-4 w-4" />
            Employer
          </TabsTrigger>
          <TabsTrigger value="wages" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Wages & Tax
          </TabsTrigger>
          <TabsTrigger value="state" className="gap-2">
            <FileText className="h-4 w-4" />
            State/Local
          </TabsTrigger>
        </TabsList>

        {/* Employee Tab */}
        <TabsContent value="employee">
          <Card>
            <CardHeader>
              <CardTitle>Employee Information</CardTitle>
              <CardDescription>Enter employee details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="employeeSSN">
                  Employee's Social Security Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="employeeSSN"
                  value={formData.employeeSSN}
                  onChange={(e) => handleChange('employeeSSN', formatSSN(e.target.value))}
                  placeholder="XXX-XX-XXXX"
                  maxLength={11}
                  className={errors.employeeSSN ? 'border-red-500' : ''}
                />
                {errors.employeeSSN && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.employeeSSN}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeName">
                  Employee's Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="employeeName"
                  value={formData.employeeName}
                  onChange={(e) => handleChange('employeeName', e.target.value)}
                  placeholder="First Name, Middle Initial, Last Name"
                  className={errors.employeeName ? 'border-red-500' : ''}
                />
                {errors.employeeName && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.employeeName}
                  </p>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="employeeAddress">Address</Label>
                <Input
                  id="employeeAddress"
                  value={formData.employeeAddress}
                  onChange={(e) => handleChange('employeeAddress', e.target.value)}
                  placeholder="Street Address"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeCity">City</Label>
                  <Input
                    id="employeeCity"
                    value={formData.employeeCity}
                    onChange={(e) => handleChange('employeeCity', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeState">State</Label>
                  <Input
                    id="employeeState"
                    value={formData.employeeState}
                    onChange={(e) => handleChange('employeeState', e.target.value)}
                    placeholder="State"
                    maxLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeZip">ZIP Code</Label>
                  <Input
                    id="employeeZip"
                    value={formData.employeeZip}
                    onChange={(e) => handleChange('employeeZip', e.target.value)}
                    placeholder="ZIP"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employer Tab */}
        <TabsContent value="employer">
          <Card>
            <CardHeader>
              <CardTitle>Employer Information</CardTitle>
              <CardDescription>Enter employer details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="employerEIN">
                  Employer Identification Number (EIN) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="employerEIN"
                  value={formData.employerEIN}
                  onChange={(e) => handleChange('employerEIN', formatEIN(e.target.value))}
                  placeholder="XX-XXXXXXX"
                  maxLength={10}
                  className={errors.employerEIN ? 'border-red-500' : ''}
                />
                {errors.employerEIN && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.employerEIN}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="employerName">
                  Employer's Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="employerName"
                  value={formData.employerName}
                  onChange={(e) => handleChange('employerName', e.target.value)}
                  placeholder="Company Name"
                  className={errors.employerName ? 'border-red-500' : ''}
                />
                {errors.employerName && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.employerName}
                  </p>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="employerAddress">Address</Label>
                <Input
                  id="employerAddress"
                  value={formData.employerAddress}
                  onChange={(e) => handleChange('employerAddress', e.target.value)}
                  placeholder="Street Address"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employerCity">City</Label>
                  <Input
                    id="employerCity"
                    value={formData.employerCity}
                    onChange={(e) => handleChange('employerCity', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employerState">State</Label>
                  <Input
                    id="employerState"
                    value={formData.employerState}
                    onChange={(e) => handleChange('employerState', e.target.value)}
                    placeholder="State"
                    maxLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employerZip">ZIP Code</Label>
                  <Input
                    id="employerZip"
                    value={formData.employerZip}
                    onChange={(e) => handleChange('employerZip', e.target.value)}
                    placeholder="ZIP"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wages & Tax Tab */}
        <TabsContent value="wages">
          <Card>
            <CardHeader>
              <CardTitle>Wage and Tax Information</CardTitle>
              <CardDescription>Enter compensation and withholding amounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="box1">
                    1. Wages, tips, other compensation <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="box1"
                      type="number"
                      step="0.01"
                      value={formData.box1}
                      onChange={(e) => handleChange('box1', e.target.value)}
                      placeholder="0.00"
                      className={`pl-7 ${errors.box1 ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.box1 && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.box1}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="box2">
                    2. Federal income tax withheld <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="box2"
                      type="number"
                      step="0.01"
                      value={formData.box2}
                      onChange={(e) => handleChange('box2', e.target.value)}
                      placeholder="0.00"
                      className={`pl-7 ${errors.box2 ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.box2 && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.box2}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="box3">3. Social security wages</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="box3"
                      type="number"
                      step="0.01"
                      value={formData.box3}
                      onChange={(e) => handleChange('box3', e.target.value)}
                      placeholder="0.00"
                      className="pl-7"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="box4">4. Social security tax withheld</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="box4"
                      type="number"
                      step="0.01"
                      value={formData.box4}
                      onChange={(e) => handleChange('box4', e.target.value)}
                      placeholder="0.00"
                      className="pl-7"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="box5">5. Medicare wages and tips</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="box5"
                      type="number"
                      step="0.01"
                      value={formData.box5}
                      onChange={(e) => handleChange('box5', e.target.value)}
                      placeholder="0.00"
                      className="pl-7"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="box6">6. Medicare tax withheld</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="box6"
                      type="number"
                      step="0.01"
                      value={formData.box6}
                      onChange={(e) => handleChange('box6', e.target.value)}
                      placeholder="0.00"
                      className="pl-7"
                    />
                  </div>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Tip:</strong> Box 3 and Box 5 are typically the same as Box 1, unless the employee 
                  earned more than the Social Security wage base.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* State/Local Tab */}
        <TabsContent value="state">
          <Card>
            <CardHeader>
              <CardTitle>State and Local Tax Information</CardTitle>
              <CardDescription>Enter state and local withholding (if applicable)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="box15_state">15. State</Label>
                  <Input
                    id="box15_state"
                    value={formData.box15_state}
                    onChange={(e) => handleChange('box15_state', e.target.value)}
                    placeholder="State abbreviation"
                    maxLength={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="box15_ein">Employer's state ID number</Label>
                  <Input
                    id="box15_ein"
                    value={formData.box15_ein}
                    onChange={(e) => handleChange('box15_ein', e.target.value)}
                    placeholder="State ID"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="box16">16. State wages, tips, etc.</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="box16"
                      type="number"
                      step="0.01"
                      value={formData.box16}
                      onChange={(e) => handleChange('box16', e.target.value)}
                      placeholder="0.00"
                      className="pl-7"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="box17">17. State income tax</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="box17"
                      type="number"
                      step="0.01"
                      value={formData.box17}
                      onChange={(e) => handleChange('box17', e.target.value)}
                      placeholder="0.00"
                      className="pl-7"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="box18">18. Local wages, tips, etc.</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="box18"
                      type="number"
                      step="0.01"
                      value={formData.box18}
                      onChange={(e) => handleChange('box18', e.target.value)}
                      placeholder="0.00"
                      className="pl-7"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="box19">19. Local income tax</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="box19"
                      type="number"
                      step="0.01"
                      value={formData.box19}
                      onChange={(e) => handleChange('box19', e.target.value)}
                      placeholder="0.00"
                      className="pl-7"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="box20">20. Locality name</Label>
                <Input
                  id="box20"
                  value={formData.box20}
                  onChange={(e) => handleChange('box20', e.target.value)}
                  placeholder="City or locality name"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                Save Draft
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
            <Button 
              onClick={handleSubmit}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 gap-2"
            >
              <Send className="h-4 w-4" />
              Submit W-2
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* IRS Information */}
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          Need help with Form W-2?{' '}
          <a 
            href="https://www.irs.gov/forms-pubs/about-form-w-2"
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
