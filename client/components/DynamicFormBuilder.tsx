import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  ArrowLeft, 
  Save, 
  Download, 
  Send, 
  HelpCircle, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Eye
} from 'lucide-react';
import { FormDefinition, FormField } from '@/lib/formRegistry';

interface DynamicFormBuilderProps {
  formDefinition: FormDefinition;
  onBack: () => void;
  onSave?: (data: Record<string, any>) => void;
  onSubmit?: (data: Record<string, any>) => void;
  initialData?: Record<string, any>;
}

export function DynamicFormBuilder({ 
  formDefinition, 
  onBack, 
  onSave, 
  onSubmit,
  initialData = {}
}: DynamicFormBuilderProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const handleFieldBlur = (fieldId: string) => {
    setTouched(prev => ({ ...prev, [fieldId]: true }));
    validateField(fieldId);
  };

  const validateField = (fieldId: string): boolean => {
    const field = formDefinition.fields.find(f => f.id === fieldId);
    if (!field) return true;

    const value = formData[fieldId];

    // Required validation
    if (field.required && (!value || value === '')) {
      setErrors(prev => ({ ...prev, [fieldId]: `${field.label} is required` }));
      return false;
    }

    // Custom validation
    if (field.validation) {
      const { min, max, pattern, message } = field.validation;
      
      if (min !== undefined && Number(value) < min) {
        setErrors(prev => ({ ...prev, [fieldId]: message || `Minimum value is ${min}` }));
        return false;
      }
      
      if (max !== undefined && Number(value) > max) {
        setErrors(prev => ({ ...prev, [fieldId]: message || `Maximum value is ${max}` }));
        return false;
      }
      
      if (pattern && !new RegExp(pattern).test(value)) {
        setErrors(prev => ({ ...prev, [fieldId]: message || 'Invalid format' }));
        return false;
      }
    }

    return true;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    formDefinition.fields.forEach(field => {
      if (field.required && (!formData[field.id] || formData[field.id] === '')) {
        newErrors[field.id] = `${field.label} is required`;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
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

  const renderField = (field: FormField) => {
    const value = formData[field.id] || '';
    const error = touched[field.id] && errors[field.id];

    const fieldWrapper = (content: React.ReactNode) => (
      <div key={field.id} className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor={field.id} className="text-sm font-medium">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {field.helpText && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{field.helpText}</p>
                  {field.irsLink && (
                    <a 
                      href={field.irsLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-xs mt-1 block"
                    >
                      View IRS Guidelines →
                    </a>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {content}
        {error && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
      </div>
    );

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return fieldWrapper(
          <Input
            id={field.id}
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            onBlur={() => handleFieldBlur(field.id)}
            placeholder={field.placeholder}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'currency':
        return fieldWrapper(
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <Input
              id={field.id}
              type="number"
              step="0.01"
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              onBlur={() => handleFieldBlur(field.id)}
              placeholder="0.00"
              className={`pl-7 ${error ? 'border-red-500' : ''}`}
            />
          </div>
        );

      case 'number':
        return fieldWrapper(
          <Input
            id={field.id}
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            onBlur={() => handleFieldBlur(field.id)}
            placeholder={field.placeholder}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'date':
        return fieldWrapper(
          <Input
            id={field.id}
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            onBlur={() => handleFieldBlur(field.id)}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'ssn':
        return fieldWrapper(
          <Input
            id={field.id}
            type="text"
            value={value}
            onChange={(e) => {
              // Format as XXX-XX-XXXX
              let val = e.target.value.replace(/\D/g, '');
              if (val.length > 3) val = val.slice(0, 3) + '-' + val.slice(3);
              if (val.length > 6) val = val.slice(0, 6) + '-' + val.slice(6, 10);
              handleFieldChange(field.id, val);
            }}
            onBlur={() => handleFieldBlur(field.id)}
            placeholder="XXX-XX-XXXX"
            maxLength={11}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'ein':
        return fieldWrapper(
          <Input
            id={field.id}
            type="text"
            value={value}
            onChange={(e) => {
              // Format as XX-XXXXXXX
              let val = e.target.value.replace(/\D/g, '');
              if (val.length > 2) val = val.slice(0, 2) + '-' + val.slice(2, 9);
              handleFieldChange(field.id, val);
            }}
            onBlur={() => handleFieldBlur(field.id)}
            placeholder="XX-XXXXXXX"
            maxLength={10}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'checkbox':
        return (
          <div key={field.id} className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={value === true}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
            />
            <Label htmlFor={field.id} className="text-sm font-normal cursor-pointer">
              {field.label}
            </Label>
            {field.helpText && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{field.helpText}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        );

      case 'select':
        return fieldWrapper(
          <Select value={value} onValueChange={(val) => handleFieldChange(field.id, val)}>
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'textarea':
        return fieldWrapper(
          <Textarea
            id={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            onBlur={() => handleFieldBlur(field.id)}
            placeholder={field.placeholder}
            rows={4}
            className={error ? 'border-red-500' : ''}
          />
        );

      default:
        return null;
    }
  };

  const completedFields = formDefinition.fields.filter(f => formData[f.id] && formData[f.id] !== '').length;
  const totalFields = formDefinition.fields.length;
  const progress = (completedFields / totalFields) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{formDefinition.icon}</span>
              <div>
                <h2 className="text-2xl font-bold">{formDefinition.id}</h2>
                <p className="text-gray-600">{formDefinition.title}</p>
              </div>
            </div>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          {completedFields} / {totalFields} fields completed
        </Badge>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Form Completion</span>
              <span className="font-semibold">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Form Details</CardTitle>
          <CardDescription>{formDefinition.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {formDefinition.sections ? (
            // Render sections if defined
            formDefinition.sections.map((section, idx) => (
              <div key={idx} className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">{section.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {section.fields.map(fieldId => {
                    const field = formDefinition.fields.find(f => f.id === fieldId);
                    return field ? renderField(field) : null;
                  })}
                </div>
              </div>
            ))
          ) : (
            // Render all fields in a grid
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formDefinition.fields.map(field => renderField(field))}
            </div>
          )}
        </CardContent>
      </Card>

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
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
            <Button 
              onClick={handleSubmit}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 gap-2"
            >
              <Send className="h-4 w-4" />
              Submit Form
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* IRS Publication Link */}
      {formDefinition.irsPublication && (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            Need help filling out this form?{' '}
            <a 
              href={formDefinition.irsPublication}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium"
            >
              View IRS Publication →
            </a>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
