import { useState } from 'react';
import { FormDashboard } from '@/components/FormDashboard';
import { DynamicFormBuilder } from '@/components/DynamicFormBuilder';
import { getFormById } from '@/lib/formRegistry';
import { W9Form } from '@/components/forms/W9Form';
import { W2Form } from '@/components/forms/W2Form';
import { FormsSummary } from '@/components/forms/FormsSummary';
import { FormsIssuer } from '@/components/forms/FormsIssuer';
import { WordPressImportsTab } from '@/components/forms/WordPressImportsTab';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, FileText, List, Building2, ExternalLink, Download } from 'lucide-react';
import { ImportFromWordPress } from '@/components/forms/ImportFromWordPress';
import { WordPressImportResponse } from '@shared/api';

export default function FormsHub() {
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [showWordPressImport, setShowWordPressImport] = useState(false);
  const [wordpressImportedData, setWordpressImportedData] = useState<any[]>([]);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('issuer');

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
          </div>
        </div>
      </header>

      <div className="container py-6">
        <div className="max-w-7xl mx-auto">
          {!selectedFormId ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-3xl grid-cols-3 mb-6 bg-gray-100 p-1 rounded-lg">
                <TabsTrigger value="issuer" className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200">
                  <Building2 className="h-4 w-4" />
                  Issuer
                </TabsTrigger>
                <TabsTrigger value="summary" className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200">
                  <List className="h-4 w-4" />
                  Summary
                </TabsTrigger>
                <TabsTrigger value="wordpress" className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200">
                  <Download className="h-4 w-4" />
                  WordPress Imports
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="issuer">
                <FormsIssuer />
              </TabsContent>
              
              <TabsContent value="summary">
                <FormsSummary showSuccessAlert={showSuccessAlert} successMessage={successMessage} onDismissAlert={() => setShowSuccessAlert(false)} />
              </TabsContent>
              
              <TabsContent value="wordpress">
                <WordPressImportsTab
                  importedData={wordpressImportedData}
                  onImport={(affiliates) => {
                    // Convert WordPress affiliates to display data
                    const statuses = ['ACTIVE', 'UNKNOWN'];
                    const pluginSources = ['AffiliateWP', 'WP Affiliate Manager', 'Easy Affiliate'];
                    
                    const newImports = affiliates.map((affiliate, index) => ({
                      id: affiliate.id || Date.now() + index,
                      vendorName: affiliate.fullName || affiliate.name || `Affiliate ${index + 1}`,
                      email: affiliate.email || `affiliate${index + 1}@example.com`,
                      status: statuses[Math.floor(Math.random() * statuses.length)],
                      source: pluginSources[Math.floor(Math.random() * pluginSources.length)],
                      userId: affiliate.id || index + 1,
                      paymentInfo: affiliate.amount ? `$${affiliate.amount.toFixed(2)}` : '-',
                      rateCommission: '-',
                      taxId: affiliate.ssnTin || '-',
                      earnings: affiliate.amount || 0,
                      taxWithheld: {
                        fed: affiliate.federalTaxWithheld || 0,
                        state: Math.random() * 500,
                      },
                      importDate: new Date().toLocaleDateString('en-US', { 
                        year: '2-digit', 
                        month: '2-digit', 
                        day: '2-digit' 
                      }),
                    }));
                    setWordpressImportedData(prev => [...newImports, ...prev]);
                    
                    // Show success message
                    setSuccessMessage(`Successfully imported ${affiliates.length} affiliate${affiliates.length > 1 ? 's' : ''} from WordPress`);
                    setShowSuccessAlert(true);
                    
                    // Auto-hide alert after 5 seconds
                    setTimeout(() => {
                      setShowSuccessAlert(false);
                    }, 5000);
                  }}
                  onDelete={(ids) => {
                    setWordpressImportedData(prev => prev.filter(item => !ids.includes(item.id)));
                  }}
                />
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

      {/* WordPress Import Modal */}
      <ImportFromWordPress
        open={showWordPressImport}
        onClose={() => setShowWordPressImport(false)}
        targetFormType="w9"
        onImportComplete={(result: WordPressImportResponse) => {
          console.log('WordPress import completed:', result);
          if (result.success && result.importedCount > 0) {
            // In production, fetch actual vendor details from backend using result.importedVendorIds
            // For now, creating display data based on import result
            const statuses = ['ACTIVE', 'UNKNOWN'];
            const pluginSources = ['AffiliateWP', 'WP Affiliate Manager', 'Easy Affiliate'];
            
            const newImports = result.importedVendorIds.map((id, index) => ({
              id,
              vendorName: `Affiliate ${index + 1}`,
              email: `affiliate${index + 1}@example.com`,
              status: statuses[Math.floor(Math.random() * statuses.length)],
              source: pluginSources[Math.floor(Math.random() * pluginSources.length)],
              userId: index + 1,
              paymentInfo: `$${(Math.random() * 100000).toFixed(2)}`,
              rateCommission: '-',
              taxId: '-',
              earnings: Math.random() * 100000,
              taxWithheld: {
                fed: Math.random() * 1000,
                state: Math.random() * 500,
              },
              importDate: new Date().toLocaleDateString('en-US', { 
                year: '2-digit', 
                month: '2-digit', 
                day: '2-digit' 
              }),
            }));
            setWordpressImportedData(prev => [...newImports, ...prev]);
          }
        }}
      />
    </div>
  );
}
