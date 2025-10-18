import { useState } from 'react';
import { FormDashboard } from '@/components/FormDashboard';
import { DynamicFormBuilder } from '@/components/DynamicFormBuilder';
import { getFormById } from '@/lib/formRegistry';
import { W9Form } from '@/components/forms/W9Form';
import { W2Form } from '@/components/forms/W2Form';
import { FormsSummary } from '@/components/forms/FormsSummary';
import { FormsIssuer } from '@/components/forms/FormsIssuer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, FileText, List, Building2 } from 'lucide-react';

export default function FormsHub() {
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Mock stats - replace with real data from your backend
  const mockStats = {
    total: 125,
    completed: 87,
    draft: 23,
    efiled: 15
  };

  const handleSelectForm = (formId: string) => {
    setSelectedFormId(formId);
  };

  const handleBack = () => {
    setSelectedFormId(null);
  };

  const handleSave = (data: Record<string, any>) => {
    setFormData(data);
    console.log('Saving form data:', data);
    // TODO: Implement API call to save draft
    alert('Form saved as draft!');
  };

  const handleSubmit = (data: Record<string, any>) => {
    setFormData(data);
    console.log('Submitting form data:', data);
    // TODO: Implement API call to submit form
    alert('Form submitted successfully!');
  };

  const selectedForm = selectedFormId ? getFormById(selectedFormId) : null;

  // Render specialized form components for W-9, W-2, and Form 2848
  const renderSpecializedForm = () => {
    switch (selectedFormId) {
      case 'W-9':
        return (
          <div>
            <Button
              variant="outline"
              onClick={handleBack}
              className="mb-6 gap-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 hover:shadow-md transition-all duration-200 font-semibold"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Forms
            </Button>
            <W9Form
              onSave={handleSave}
              onSubmit={handleSubmit}
              initialData={formData}
            />
          </div>
        );
      case 'W-2':
        return (
          <div>
            <Button
              variant="outline"
              onClick={handleBack}
              className="mb-6 gap-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 hover:shadow-md transition-all duration-200 font-semibold"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Forms
            </Button>
            <W2Form
              onSave={handleSave}
              onSubmit={handleSubmit}
              initialData={formData}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Tabs */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-600 grid place-items-center shadow-md">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Powerly E-Filing</h1>
                <p className="text-gray-500 text-sm">Professional Tax Forms</p>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <Button
              variant={window.location.pathname === '/' ? 'default' : 'outline'}
              onClick={() => window.location.href = '/'}
              className={window.location.pathname === '/' 
                ? 'tab-active px-6 py-2.5 rounded-t-lg' 
                : 'tab-inactive px-6 py-2.5 rounded-t-lg'
              }
            >
              1099
            </Button>
            <Button
              variant={window.location.pathname === '/forms' ? 'default' : 'outline'}
              onClick={() => window.location.href = '/forms'}
              className={window.location.pathname === '/forms' 
                ? 'tab-active px-6 py-2.5 rounded-t-lg' 
                : 'tab-inactive px-6 py-2.5 rounded-t-lg'
              }
            >
              W-9
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
              onClick={() => {/* Settings functionality */}}
            >
              <FileText className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-6">
        <div className="max-w-7xl mx-auto">
          {!selectedFormId ? (
            <Tabs defaultValue="issuer" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-6 bg-gray-100 p-1 rounded-lg">
                <TabsTrigger value="issuer" className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200">
                  <Building2 className="h-4 w-4" />
                  Issuer
                </TabsTrigger>
                <TabsTrigger value="summary" className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200">
                  <List className="h-4 w-4" />
                  Summary
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="issuer">
                <FormsIssuer />
              </TabsContent>
              
              <TabsContent value="summary">
                <FormsSummary />
              </TabsContent>
            </Tabs>
          ) : renderSpecializedForm() || (selectedForm ? (
            <DynamicFormBuilder
              formDefinition={selectedForm}
              onBack={handleBack}
              onSave={handleSave}
              onSubmit={handleSubmit}
              initialData={formData}
            />
          ) : (
            <div>Form not found</div>
          ))}
        </div>
      </div>
    </div>
  );
}
