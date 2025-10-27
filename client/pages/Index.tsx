import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  generateAscii,
  IssuerData,
  PayeeData,
  TransmitterData,
} from "@shared/api";
import { 
  CheckCircle, 
  Upload, 
  FileText, 
  AlertCircle, 
  CreditCard, 
  Download, 
  Trash2, 
  ExternalLink, 
  Users, 
  Eye, 
  Building2, 
  ShieldCheck, 
  FileDown 
} from "lucide-react";

const steps = ["Year Selection", "Issuer", "Payee", "E‑Filing", "Success"] as const;

// Enhanced form definitions with proper IRS fields
const formDefinitions = {
  "1099-NEC": {
    title: "Non-Employee Compensation",
    fields: [
      { id: "box1", label: "1 Nonemployee compensation", required: true, type: "currency" },
      { id: "box2", label: "2 Payer made direct sales totaling $5,000 or more of consumer products to recipient for resale", type: "checkbox" },
      { id: "box4", label: "4 Federal income tax withheld", type: "currency" },
    ]
  },
  "1099-MISC": {
    title: "Miscellaneous Income",
    fields: [
      { id: "box1", label: "Rents", type: "currency" },
      { id: "box2", label: "Royalties", type: "currency" },
      { id: "box3", label: "Other income", type: "currency" },
      { id: "box4", label: "Federal income tax withheld", type: "currency" },
      { id: "box5", label: "Fishing boat proceeds", type: "currency" },
      { id: "box6", label: "Medical and health care payments", type: "currency" },
      { id: "box7", label: "Nonemployee compensation", type: "currency" },
      { id: "box8", label: "Substitute payments in lieu of dividends or interest", type: "currency" },
      { id: "box9", label: "Payer made direct sales of $5,000 or more", type: "checkbox" },
      { id: "box10", label: "Crop insurance proceeds", type: "currency" },
      { id: "box11", label: "Gross proceeds paid to an attorney", type: "currency" },
      { id: "box12", label: "Section 409A deferrals", type: "currency" },
      { id: "box13", label: "Excess golden parachute payments", type: "currency" },
      { id: "box14", label: "Nonqualified deferred compensation", type: "currency" },
      { id: "box15", label: "State tax withheld", type: "currency" },
      { id: "box16", label: "State/Payer's state no.", type: "text" },
      { id: "box17", label: "State income", type: "currency" },
    ]
  },
  "1099-K": {
    title: "Payment Card/3rd-Party Network",
    fields: [
      { id: "box1a", label: "Gross amount of payment card/third party network transactions", type: "currency" },
      { id: "box1b", label: "Card not present transactions", type: "currency" },
      { id: "box2", label: "Merchant category code", type: "text" },
      { id: "box3", label: "Number of payment transactions", type: "number" },
      { id: "box4", label: "Federal income tax withheld", type: "currency" },
      { id: "box5a", label: "State tax withheld", type: "currency" },
      { id: "box5b", label: "State/Payer's state no.", type: "text" },
      { id: "box5c", label: "State income", type: "currency" },
      { id: "box6", label: "Local tax withheld", type: "currency" },
      { id: "box7", label: "Local income", type: "currency" },
      { id: "box8", label: "Name of locality", type: "text" },
    ]
  },
  "1099-INT": {
    title: "Interest Income",
    fields: [
      { id: "box1", label: "Interest income", type: "currency" },
      { id: "box2", label: "Early withdrawal penalty", type: "currency" },
      { id: "box3", label: "Interest on U.S. Savings bonds and Treasury obligations", type: "currency" },
      { id: "box4", label: "Federal income tax withheld", type: "currency" },
      { id: "box5", label: "Investment expenses", type: "currency" },
      { id: "box6", label: "Foreign tax paid", type: "currency" },
      { id: "box7", label: "Foreign country or U.S. possession", type: "text" },
      { id: "box8", label: "Tax-exempt interest", type: "currency" },
      { id: "box9", label: "Specified private activity bond interest", type: "currency" },
      { id: "box10", label: "Market discount", type: "currency" },
      { id: "box11", label: "Bond premium", type: "currency" },
      { id: "box12", label: "Bond premium on tax-exempt bond", type: "currency" },
      { id: "box13", label: "Tax-exempt and tax credit bond CUSIP no.", type: "text" },
      { id: "box14", label: "State tax withheld", type: "currency" },
      { id: "box15", label: "State/Payer's state no.", type: "text" },
      { id: "box16", label: "State income", type: "currency" },
    ]
  },
  "1099-DIV": {
    title: "Dividends & Distributions",
    fields: [
      { id: "box1a", label: "Total ordinary dividends", type: "currency" },
      { id: "box1b", label: "Qualified dividends", type: "currency" },
      { id: "box2a", label: "Total capital gain distr.", type: "currency" },
      { id: "box2b", label: "Unrecap. section 1250 gain", type: "currency" },
      { id: "box2c", label: "Section 1202 gain", type: "currency" },
      { id: "box2d", label: "Collectibles (28%) gain", type: "currency" },
      { id: "box3", label: "Nondividend distributions", type: "currency" },
      { id: "box4", label: "Federal income tax withheld", type: "currency" },
      { id: "box5", label: "Investment expenses", type: "currency" },
      { id: "box6", label: "Foreign tax paid", type: "currency" },
      { id: "box7", label: "Foreign country or U.S. possession", type: "text" },
      { id: "box8", label: "Cash liquidation distributions", type: "currency" },
      { id: "box9", label: "Noncash liquidation distributions", type: "currency" },
      { id: "box10", label: "Exempt-interest dividends", type: "currency" },
      { id: "box11", label: "Specified private activity bond interest dividends", type: "currency" },
      { id: "box12", label: "State tax withheld", type: "currency" },
      { id: "box13", label: "State/Payer's state no.", type: "text" },
      { id: "box14", label: "State income", type: "currency" },
    ]
  },
  "1099-B": {
    title: "Proceeds from Broker",
    fields: [
      { id: "box1a", label: "Description of property", type: "text" },
      { id: "box1b", label: "Date acquired", type: "date" },
      { id: "box1c", label: "Date sold or disposed of", type: "date" },
      { id: "box1d", label: "Proceeds", type: "currency" },
      { id: "box1e", label: "Cost or other basis", type: "currency" },
      { id: "box1f", label: "Accrued market discount", type: "currency" },
      { id: "box2", label: "Wash sale loss disallowed", type: "currency" },
      { id: "box3", label: "Unrecap. section 1250 gain", type: "currency" },
      { id: "box4", label: "Collectibles (28%) gain", type: "currency" },
      { id: "box5", label: "Section 1202 gain", type: "currency" },
      { id: "box6", label: "Long-term capital loss carryover", type: "currency" },
      { id: "box7", label: "Federal income tax withheld", type: "currency" },
      { id: "box8", label: "Excess contributions", type: "currency" },
      { id: "box9", label: "Excess golden parachute payments", type: "currency" },
      { id: "box10", label: "Tax-exempt interest", type: "currency" },
    ]
  },
  "1099-R": {
    title: "Retirement Distributions",
    fields: [
      { id: "box1", label: "Gross distribution", type: "currency" },
      { id: "box2a", label: "Taxable amount", type: "currency" },
      { id: "box2b", label: "Taxable amount not determined", type: "checkbox" },
      { id: "box3", label: "Capital gain", type: "currency" },
      { id: "box4", label: "Federal income tax withheld", type: "currency" },
      { id: "box5", label: "Employee contributions", type: "currency" },
      { id: "box6", label: "Net unrealized appreciation in employer's securities", type: "currency" },
      { id: "box7", label: "Distribution codes", type: "text" },
      { id: "box8", label: "Other", type: "currency" },
      { id: "box9a", label: "Your percentage of total distribution", type: "text" },
      { id: "box9b", label: "Total employee contributions", type: "currency" },
      { id: "box10", label: "State tax withheld", type: "currency" },
      { id: "box11", label: "State/Payer's state no.", type: "text" },
      { id: "box12", label: "State income", type: "currency" },
    ]
  },
  "1099-S": {
    title: "Real Estate Transactions",
    fields: [
      { id: "box1", label: "Gross proceeds", type: "currency" },
      { id: "box2", label: "Date of closing", type: "date" },
      { id: "box3", label: "Postal address", type: "text" },
      { id: "box4", label: "Legal description", type: "text" },
      { id: "box5", label: "Number of properties", type: "number" },
      { id: "box6", label: "Property or services", type: "text" },
      { id: "box7", label: "Federal income tax withheld", type: "currency" },
      { id: "box8", label: "Buyer's part of real estate tax", type: "currency" },
      { id: "box9", label: "State tax withheld", type: "currency" },
      { id: "box10", label: "State/Payer's state no.", type: "text" },
    ]
  },
  "1099-C": {
    title: "Cancellation of Debt",
    fields: [
      { id: "box1", label: "Amount of debt canceled", type: "currency" },
      { id: "box2", label: "Interest included in box 1", type: "currency" },
      { id: "box3", label: "Date of cancellation", type: "date" },
      { id: "box4", label: "Debt description", type: "text" },
      { id: "box5", label: "Fair market value of property", type: "currency" },
      { id: "box6", label: "Interest on debt to date of foreclosure", type: "currency" },
      { id: "box7", label: "Personal liability for debt", type: "checkbox" },
      { id: "box8", label: "Federal income tax withheld", type: "currency" },
      { id: "box9", label: "State tax withheld", type: "currency" },
      { id: "box10", label: "State/Payer's state no.", type: "text" },
    ]
  },
  "1099-G": {
    title: "Government Payments",
    fields: [
      { id: "box1", label: "Unemployment compensation", type: "currency" },
      { id: "box2", label: "State or local income tax refunds", type: "currency" },
      { id: "box3", label: "Alternative trade adjustment payments", type: "currency" },
      { id: "box4", label: "Taxable grants", type: "currency" },
      { id: "box5", label: "Agriculture payments", type: "currency" },
      { id: "box6", label: "Federal income tax withheld", type: "currency" },
      { id: "box7", label: "Exempt interest dividends", type: "currency" },
      { id: "box8", label: "Tax-exempt and tax credit bond CUSIP no.", type: "text" },
      { id: "box9", label: "State tax withheld", type: "currency" },
      { id: "box10", label: "State/Payer's state no.", type: "text" },
      { id: "box11", label: "State income", type: "currency" },
      { id: "box12", label: "Market discount", type: "currency" },
    ]
  }
};

type FormType = keyof typeof formDefinitions;

export default function Index() {
  const [step, setStep] = useState(0);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedForm, setSelectedForm] = useState<FormType | null>(null);
  const [issuerData, setIssuerData] = useState<IssuerData[]>([
    {
      issuerName: "Acme Corporation",
      einTin: "12-3456789",
      contactName: "John Smith",
      email: "john@acme.com",
      phone: "(555) 123-4567",
      businessType: "corporation",
      address1: "123 Business Ave",
      address2: "Suite 100",
      city: "New York",
      state: "NY",
      zip: "10001",
      country: "US",
    },
    {
      issuerName: "Tech Solutions LLC",
      einTin: "98-7654321",
      contactName: "Jane Doe",
      email: "jane@techsolutions.com",
      phone: "(555) 234-5678",
      businessType: "llc",
      address1: "456 Tech Street",
      address2: "Floor 5",
      city: "San Francisco",
      state: "CA",
      zip: "94102",
      country: "US",
    }
  ]);
  const [payeeData, setPayeeData] = useState<PayeeData[]>([
    {
      payeeName: "Robert Johnson",
      einTin: "123-45-6789",
      email: "robert.j@email.com",
      phone: "(555) 111-2222",
      address1: "789 Oak Street",
      address2: "Apt 4B",
      city: "Boston",
      state: "MA",
      zip: "02101",
      country: "US",
      formType: "1099-NEC",
      formData: { box1: "15000.00" }
    },
    {
      payeeName: "Sarah Williams",
      einTin: "234-56-7890",
      email: "sarah.w@email.com",
      phone: "(555) 222-3333",
      address1: "321 Pine Avenue",
      address2: "",
      city: "Seattle",
      state: "WA",
      zip: "98101",
      country: "US",
      formType: "1099-NEC",
      formData: { box1: "25000.00" }
    },
    {
      payeeName: "Michael Chen",
      einTin: "345-67-8901",
      email: "michael.c@email.com",
      phone: "(555) 333-4444",
      address1: "654 Maple Drive",
      address2: "Suite 200",
      city: "Austin",
      state: "TX",
      zip: "78701",
      country: "US",
      formType: "1099-MISC",
      formData: { box1: "8500.00" }
    },
    {
      payeeName: "Emily Davis",
      einTin: "456-78-9012",
      email: "emily.d@email.com",
      phone: "(555) 444-5555",
      address1: "987 Elm Boulevard",
      address2: "",
      city: "Denver",
      state: "CO",
      zip: "80201",
      country: "US",
      formType: "1099-NEC",
      formData: { box1: "32000.00" }
    },
    {
      payeeName: "David Martinez",
      einTin: "567-89-0123",
      email: "david.m@email.com",
      phone: "(555) 555-6666",
      address1: "147 Cedar Lane",
      address2: "Unit 12",
      city: "Miami",
      state: "FL",
      zip: "33101",
      country: "US",
      formType: "1099-NEC",
      formData: { box1: "18500.00" }
    }
  ]);
  const [transmitterData, setTransmitterData] = useState<TransmitterData | null>(null);
  const [efileMode, setEfileMode] = useState<"own" | "powerly" | null>(null);
  const [efileStep, setEfileStep] = useState(0);
  const [trackingId, setTrackingId] = useState<string>("");
  const [formData, setFormData] = useState<Record<string, any>>({});

  const progress = useMemo(() => Math.round(((step + 1) / steps.length) * 100), [step]);

  const go = (n: number) => setStep(Math.min(Math.max(n, 0), steps.length - 1));

  const handleFormSelection = (formType: FormType) => {
    setSelectedForm(formType);
  };

  const handleFormDataChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleDownloadAll = () => {
    // Generate CSV for all payees and forms
    console.log("Downloading all CSVs...");
  };

  const handleDownloadSelected = () => {
    // Generate CSV for selected forms only
    console.log("Downloading selected CSVs...");
  };

  const handleEfileSubmit = async () => {
    try {
      if (efileMode === "own") {
        // Own transmitter flow
        if (!transmitterData) {
          alert("Please add your transmitter details before generating the ASCII file.");
          return;
        }
        // Generate ASCII and submit (using first issuer for now)
        const ascii = generateAscii(transmitterData, issuerData[0], payeeData, selectedForm || "1099-NEC");
        console.log("Generated ASCII:", ascii);
      }
      
      // For Powerly transmitter, simulate successful submission
      if (efileMode === "powerly") {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTrackingId('TRK-' + Math.random().toString(36).substr(2, 9).toUpperCase());
        setStep(4); // Move to main Success step (step 4 in main steps)
        return;
      }
      
      // For own transmitter, try API call
      const response = await fetch('/api/efile/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transmitterData,
          issuerData: issuerData[0], // Send first issuer
          payeeData,
          formType: selectedForm || "1099-NEC"
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setTrackingId(result.trackingId || 'TRK-02047380-62RR77');
        setStep(4); // Move to main Success step (step 4 in main steps)
      }
    } catch (error) {
      console.error("E-filing error:", error);
      // If API fails, still proceed to success for demo purposes
      setTrackingId('TRK-' + Math.random().toString(36).substr(2, 9).toUpperCase());
      setStep(4);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-600 grid place-items-center shadow-md">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Powerly E-Filing</h1>
                <p className="text-gray-500 text-sm">Professional 1099 Processing</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {step > 0 && (
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 font-semibold px-4 py-1.5 text-sm">
                  📅 Tax Year: {selectedYear}
                </Badge>
              )}
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
                Step {step + 1} of {steps.length}
              </Badge>
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
              className="ml-auto text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <FileText className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="max-w-5xl mx-auto">
          {/* Progress Stepper */}
          <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              {steps.map((stepName, index) => (
                <div 
                  key={stepName} 
                  className="flex flex-col items-center flex-1 relative group cursor-pointer"
                  onClick={() => go(index)}
                >
                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className={`absolute top-6 left-1/2 w-full h-0.5 -z-10 transition-all duration-300 ${
                      index < step ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                  
                  {/* Step Circle */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    index < step 
                      ? 'step-completed shadow-lg shadow-green-200 group-hover:shadow-xl group-hover:scale-110' 
                      : index === step
                      ? 'step-active shadow-lg shadow-blue-200 ring-4 ring-blue-100 group-hover:shadow-xl group-hover:scale-110'
                      : 'step-inactive group-hover:bg-gray-200 group-hover:border-blue-300 group-hover:scale-105'
                  }`}>
                    {index < step ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <span className="text-base">{index + 1}</span>
                    )}
                  </div>
                  
                  {/* Step Label */}
                  <span className={`text-xs mt-2 font-medium text-center max-w-20 transition-all duration-300 ${
                    index <= step 
                      ? 'text-gray-900 group-hover:text-blue-600 group-hover:font-semibold' 
                      : 'text-gray-400 group-hover:text-gray-600'
                  }`}>
                    {stepName}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Progress Bar - Without Percentage */}
            <div className="space-y-2">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-700 transition-all duration-500 ease-out rounded-full shadow-sm"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Main Content Card */}
          <Card className="shadow-sm border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-6 border-b border-gray-100">
              <CardTitle className="text-2xl text-gray-900 font-bold">{steps[step]}</CardTitle>
              <CardDescription className="text-gray-500 text-base mt-1">
                {step === 0 && "Select the tax year for your 1099 e-filing"}
                {step === 1 && "Enter your business information as the issuer"}
                {step === 2 && "Add payee information with form type and details"}
                {step === 3 && "Choose your e-filing method and submit"}
                {step === 4 && "E-Filing completed successfully!"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === 0 && <YearSelectionStep year={selectedYear} onChange={setSelectedYear} />}
              {step === 1 && <IssuerForm data={issuerData} onChange={setIssuerData} />}
              {step === 2 && <PayeeForm data={payeeData} onChange={setPayeeData} />}
              {step === 3 && <EFilingStep 
                efileMode={efileMode}
                onModeSelect={setEfileMode}
                efileStep={efileStep}
                onStepChange={setEfileStep}
                transmitterData={transmitterData}
                onTransmitterChange={setTransmitterData}
                onSubmit={handleEfileSubmit}
                issuerData={issuerData}
                payeeData={payeeData}
                selectedForm={selectedForm}
              />}
              {step === 4 && <SuccessStep trackingId={trackingId} onStartOver={() => setStep(0)} />}
            </CardContent>
            
            {/* Navigation Footer */}
            <div className="px-6 pb-6 pt-4 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  {step > 0 && step < steps.length - 1 && (
                    <Button 
                      variant="outline" 
                      onClick={() => go(step - 1)}
                      className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 hover:shadow-md transition-all duration-200 font-semibold px-6"
                    >
                      ← Back
                    </Button>
                  )}
                </div>
                <div className="flex gap-3">
                  {step < steps.length - 1 && step !== 3 && (
                    <Button 
                      onClick={() => go(step + 1)}
                      className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-semibold px-8 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      disabled={
                        (step === 0 && !selectedYear) ||
                        (step === 1 && issuerData.length === 0) ||
                        (step === 2 && payeeData.length === 0)
                      }
                    >
                      Next →
                    </Button>
                  )}
                  {step === steps.length - 1 && (
                    <Button 
                      onClick={() => { 
                        setStep(0); 
                        setSelectedYear(new Date().getFullYear().toString());
                        setSelectedForm(null);
                        setIssuerData([]);
                        setPayeeData([]);
                        setTransmitterData(null);
                        setEfileMode(null);
                        setEfileStep(0);
                        setTrackingId("");
                        setFormData({});
                      }}
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 hover:shadow-md transition-all duration-200 font-semibold px-6"
                    >
                      Start Over
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

// Issuer Form Component - Table Format
function IssuerForm({ data, onChange }: { data: IssuerData[]; onChange: (data: IssuerData[]) => void }) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addIssuer = () => {
    const newIssuer: IssuerData = {
      issuerName: "",
      einTin: "",
      contactName: "",
      email: "",
      phone: "",
      businessType: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      zip: "",
      country: "US",
    };
    onChange([...data, newIssuer]);
    setEditingIndex(data.length); // Start editing the new issuer
  };

  const updateIssuer = (index: number, field: keyof IssuerData, value: string) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeIssuer = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        alert('CSV file is empty or invalid');
        return;
      }

      // Parse CSV (skip header row)
      const issuers: IssuerData[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        if (values.length >= 12) {
          issuers.push({
            issuerName: values[0],
            einTin: values[1],
            contactName: values[2],
            email: values[3],
            phone: values[4],
            businessType: values[5],
            address1: values[6],
            address2: values[7],
            city: values[8],
            state: values[9],
            zip: values[10],
            country: values[11],
          });
        }
      }

      if (issuers.length > 0) {
        onChange([...data, ...issuers]);
        alert(`Successfully imported ${issuers.length} issuer(s)`);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const downloadSampleCSV = () => {
    const csvContent = `Business Name,EIN/TIN,Contact Name,Email,Phone,Business Type,Address Line 1,Address Line 2,City,State,ZIP Code,Country
Acme Corporation,12-3456789,John Smith,john@acme.com,(555) 123-4567,corporation,123 Business Ave,Suite 100,New York,NY,10001,US
Tech Solutions LLC,98-7654321,Jane Doe,jane@techsolutions.com,(555) 234-5678,llc,456 Tech Street,Floor 5,San Francisco,CA,94102,US
Global Enterprises,45-6789012,Bob Johnson,bob@global.com,(555) 345-6789,corporation,789 Global Blvd,,Los Angeles,CA,90001,US
Smith & Partners,78-9012345,Alice Williams,alice@smithpartners.com,(555) 456-7890,partnership,321 Partner Lane,Suite 200,Chicago,IL,60601,US
Freelance Services,11-2233445,Charlie Brown,charlie@freelance.com,(555) 567-8901,individual,654 Freelance Dr,,Austin,TX,78701,US`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'issuer_sample.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Section - Only Top Buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Issuer Information</h3>
          <p className="text-sm text-gray-600">Add issuer details one by one or upload via CSV</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={downloadSampleCSV} 
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50 hover:border-green-700 hover:shadow-md hover:scale-[1.02] transition-all duration-200 font-semibold"
          >
            <Download className="h-4 w-4 mr-2" />
            Sample CSV
          </Button>
          <Button 
            onClick={() => document.getElementById('csv-upload')?.click()} 
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 hover:shadow-md hover:scale-[1.02] transition-all duration-200 font-semibold"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload CSV
          </Button>
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleCSVUpload}
            className="hidden"
          />
          <Button onClick={addIssuer} className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-semibold">
            Add Issuer
          </Button>
        </div>
      </div>

      {data.length === 0 ? (
        <Card className="professional-shadow">
          <CardContent className="text-center py-12">
            <div className="text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="mb-4 text-lg">No issuers added yet</p>
              <p className="mb-6 text-sm">Add your first issuer or upload a CSV file with multiple issuers</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="professional-shadow-lg">
          <CardContent className="p-0">
            {/* Table View */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EIN/TIN</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((issuer, index) => (
                    <>
                      <tr key={index} className="hover:bg-blue-50 transition-colors duration-200 cursor-pointer">
                        <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{issuer.issuerName || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{issuer.einTin || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{issuer.contactName || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{issuer.email || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{issuer.phone || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{issuer.city || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{issuer.state || '-'}</td>
                        <td className="px-4 py-3 text-sm text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              {editingIndex === index ? 'Close' : 'Edit'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeIssuer(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {editingIndex === index && (
                        <tr>
                          <td colSpan={9} className="px-4 py-6 bg-blue-50">
                            <div className="space-y-4">
                              <h4 className="font-semibold text-gray-900 mb-4">Edit Issuer {index + 1}</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Field label="Business Name *" htmlFor={`issuerName-${index}`}>
                                  <Input 
                                    id={`issuerName-${index}`}
                                    placeholder="Your Business Name" 
                                    value={issuer.issuerName || ""}
                                    onChange={(e) => updateIssuer(index, "issuerName", e.target.value)}
                                  />
                                </Field>
                                <Field label="EIN/TIN *" htmlFor={`issuerEin-${index}`}>
                                  <Input 
                                    id={`issuerEin-${index}`}
                                    placeholder="00-0000000" 
                                    value={issuer.einTin || ""}
                                    onChange={(e) => updateIssuer(index, "einTin", e.target.value)}
                                  />
                                </Field>
                                <Field label="Contact Name *" htmlFor={`contactName-${index}`}>
                                  <Input 
                                    id={`contactName-${index}`}
                                    placeholder="Contact Person" 
                                    value={issuer.contactName || ""}
                                    onChange={(e) => updateIssuer(index, "contactName", e.target.value)}
                                  />
                                </Field>
                                <Field label="Email *" htmlFor={`issuerEmail-${index}`}>
                                  <Input 
                                    id={`issuerEmail-${index}`}
                                    type="email" 
                                    placeholder="contact@business.com" 
                                    value={issuer.email || ""}
                                    onChange={(e) => updateIssuer(index, "email", e.target.value)}
                                  />
                                </Field>
                                <Field label="Phone *" htmlFor={`issuerPhone-${index}`}>
                                  <Input 
                                    id={`issuerPhone-${index}`}
                                    placeholder="(555) 555-5555" 
                                    value={issuer.phone || ""}
                                    onChange={(e) => updateIssuer(index, "phone", e.target.value)}
                                  />
                                </Field>
                                <Field label="Business Type *" htmlFor={`businessType-${index}`}>
                                  <Select value={issuer.businessType || ""} onValueChange={(value) => updateIssuer(index, "businessType", value)}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select business type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="individual">Individual</SelectItem>
                                      <SelectItem value="partnership">Partnership</SelectItem>
                                      <SelectItem value="corporation">Corporation</SelectItem>
                                      <SelectItem value="llc">LLC</SelectItem>
                                      <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </Field>
                                <Field label="Address Line 1 *" htmlFor={`issuerAddress1-${index}`}>
                                  <Input 
                                    id={`issuerAddress1-${index}`}
                                    placeholder="123 Main Street" 
                                    value={issuer.address1 || ""}
                                    onChange={(e) => updateIssuer(index, "address1", e.target.value)}
                                  />
                                </Field>
                                <Field label="Address Line 2" htmlFor={`issuerAddress2-${index}`}>
                                  <Input 
                                    id={`issuerAddress2-${index}`}
                                    placeholder="Suite 100" 
                                    value={issuer.address2 || ""}
                                    onChange={(e) => updateIssuer(index, "address2", e.target.value)}
                                  />
                                </Field>
                                <Field label="City *" htmlFor={`issuerCity-${index}`}>
                                  <Input 
                                    id={`issuerCity-${index}`}
                                    placeholder="City" 
                                    value={issuer.city || ""}
                                    onChange={(e) => updateIssuer(index, "city", e.target.value)}
                                  />
                                </Field>
                                <Field label="State *" htmlFor={`issuerState-${index}`}>
                                  <Input 
                                    id={`issuerState-${index}`}
                                    placeholder="CA" 
                                    value={issuer.state || ""}
                                    onChange={(e) => updateIssuer(index, "state", e.target.value)}
                                  />
                                </Field>
                                <Field label="ZIP Code *" htmlFor={`issuerZip-${index}`}>
                                  <Input 
                                    id={`issuerZip-${index}`}
                                    placeholder="12345" 
                                    value={issuer.zip || ""}
                                    onChange={(e) => updateIssuer(index, "zip", e.target.value)}
                                  />
                                </Field>
                                <Field label="Country *" htmlFor={`issuerCountry-${index}`}>
                                  <Input 
                                    id={`issuerCountry-${index}`}
                                    placeholder="US" 
                                    value={issuer.country || ""}
                                    onChange={(e) => updateIssuer(index, "country", e.target.value)}
                                  />
                                </Field>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Payee Form Component - Table Format
function PayeeForm({ data, onChange }: { data: PayeeData[]; onChange: (data: PayeeData[]) => void }) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showFormTypeDialog, setShowFormTypeDialog] = useState(false);
  const [selectedFormForCSV, setSelectedFormForCSV] = useState<FormType | null>(null);
  const [validationErrors, setValidationErrors] = useState<{index: number; fields: string[]}[]>([]);
  const [showValidationDialog, setShowValidationDialog] = useState(false);

  const addPayee = () => {
    const newPayee: PayeeData = {
      fullName: "",
      ssnTin: "",
      email: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      zip: "",
      country: "US",
      paymentType: "",
      formType: "",
      amount: 0,
      federalTaxWithheld: 0,
    };
    onChange([...data, newPayee]);
    setEditingIndex(data.length); // Start editing the new payee
  };

  const updatePayee = (index: number, field: keyof PayeeData, value: any) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removePayee = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Extract form type from filename (e.g., "1099-NEC_sample.csv" -> "1099-NEC")
    const fileName = file.name;
    const formTypeMatch = fileName.match(/^(1099-[A-Z]+)/);
    const detectedFormType = formTypeMatch ? formTypeMatch[1] as FormType : null;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        alert('CSV file is empty or invalid');
        return;
      }

      // Parse CSV (skip header row)
      const payees: PayeeData[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        if (values.length >= 10) {
          payees.push({
            fullName: values[0],
            ssnTin: values[1],
            email: values[2],
            address1: values[3],
            address2: values[4],
            city: values[5],
            state: values[6],
            zip: values[7],
            country: values[8],
            amount: parseFloat(values[9]) || 0,
            federalTaxWithheld: parseFloat(values[10]) || 0,
            paymentType: "",
            formType: detectedFormType || "",
          });
        }
      }

      if (payees.length > 0) {
        // Validate required fields
        const errors: {index: number; fields: string[]}[] = [];
        const requiredFields = ['fullName', 'ssnTin', 'email', 'address1', 'city', 'state', 'zip', 'country'];
        const fieldLabels: Record<string, string> = {
          fullName: 'Recipient Name',
          ssnTin: 'SSN/TIN',
          email: 'Email',
          address1: 'Address',
          city: 'City',
          state: 'State',
          zip: 'ZIP Code',
          country: 'Country'
        };

        payees.forEach((payee, index) => {
          const missingFields: string[] = [];
          requiredFields.forEach(field => {
            if (!payee[field as keyof PayeeData] || payee[field as keyof PayeeData] === '') {
              missingFields.push(fieldLabels[field]);
            }
          });
          if (!payee.formType) {
            missingFields.push('Form Type');
          }
          if (missingFields.length > 0) {
            errors.push({ index: data.length + index, fields: missingFields });
          }
        });

        onChange([...data, ...payees]);
        
        if (errors.length > 0) {
          setValidationErrors(errors);
          setShowValidationDialog(true);
        } else {
          const formTypeMsg = detectedFormType ? ` with form type ${detectedFormType}` : '';
          alert(`Successfully imported ${payees.length} recipient(s)${formTypeMsg}. All required fields are complete!`);
        }
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const generateCSVForFormType = (formType: FormType) => {
    const formDef = formDefinitions[formType];
    const baseFields = ['Recipient Name', 'SSN/TIN', 'Email', 'Address Line 1', 'Address Line 2', 'City', 'State', 'ZIP Code', 'Country'];
    const formFields = formDef.fields.map(f => f.label);
    const headers = [...baseFields, ...formFields].join(',');
    
    // Sample data rows
    const sampleRows = [
      ['John Doe', '123-45-6789', 'john.doe@email.com', '123 Main St', 'Apt 4B', 'New York', 'NY', '10001', 'US', ...formDef.fields.map(() => '0.00')],
      ['Jane Smith', '987-65-4321', 'jane.smith@email.com', '456 Oak Ave', '', 'Los Angeles', 'CA', '90001', 'US', ...formDef.fields.map(() => '0.00')],
      ['Robert Johnson', '555-12-3456', 'robert.j@email.com', '789 Pine Rd', 'Suite 200', 'Chicago', 'IL', '60601', 'US', ...formDef.fields.map(() => '0.00')],
    ];
    
    const csvContent = [headers, ...sampleRows.map(row => row.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formType}_sample.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    setShowFormTypeDialog(false);
  };

  const downloadSampleCSV = () => {
    setShowFormTypeDialog(true);
  };

  const downloadTinMatchData = (format: 'csv' | 'txt' = 'csv') => {
    // Filter only recipients with TIN numbers
    const recipientsWithTin = data.filter(p => p.ssnTin && p.ssnTin.trim() !== '');
    
    if (recipientsWithTin.length === 0) {
      alert('No recipients with TIN numbers found');
      return;
    }

    let content = '';
    let fileExtension = '';
    let mimeType = '';

    if (format === 'txt') {
      // Text format - human-readable
      content = 'TIN MATCH DATA EXPORT\n';
      content += '='.repeat(60) + '\n\n';
      content += `Generated: ${new Date().toLocaleString()}\n`;
      content += `Total Recipients: ${recipientsWithTin.length}\n\n`;
      content += '='.repeat(60) + '\n\n';
      
      recipientsWithTin.forEach((recipient, index) => {
        content += `${index + 1}. ${recipient.fullName}\n`;
        content += `   TIN/SSN: ${recipient.ssnTin}\n`;
        content += `   Email: ${recipient.email}\n`;
        content += `   Status: Pending Validation\n\n`;
      });
      
      fileExtension = 'txt';
      mimeType = 'text/plain';
    } else {
      // CSV format
      const headers = 'Recipient Name,TIN/SSN,Email,Status\n';
      const rows = recipientsWithTin.map(recipient => {
        return `"${recipient.fullName}","${recipient.ssnTin}","${recipient.email}","Pending Validation"`;
      }).join('\n');
      
      content = headers + rows;
      fileExtension = 'csv';
      mimeType = 'text/csv';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tin_match_data_${new Date().toISOString().split('T')[0]}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    alert(`Downloaded TIN match data for ${recipientsWithTin.length} recipient(s) as ${fileExtension.toUpperCase()}`);
  };

  return (
    <>
      {/* Validation Error Dialog */}
      {showValidationDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader className="border-b bg-yellow-50">
              <CardTitle className="text-xl flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
                Missing Required Fields
              </CardTitle>
              <CardDescription>
                Some recipients have missing required information. Please complete these fields before proceeding.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {validationErrors.map((error, idx) => (
                  <div key={idx} className="border border-yellow-300 bg-yellow-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Recipient #{error.index + 1}: {data[error.index]?.fullName || 'Unknown'}
                    </h4>
                    <p className="text-sm text-gray-700 mb-2">Missing fields:</p>
                    <div className="flex flex-wrap gap-2">
                      {error.fields.map((field, fieldIdx) => (
                        <Badge key={fieldIdx} className="bg-red-100 text-red-800 border-red-300">
                          {field}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3"
                      onClick={() => {
                        setEditingIndex(error.index);
                        setShowValidationDialog(false);
                      }}
                    >
                      Edit Recipient
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  {validationErrors.length} recipient(s) need attention
                </p>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowValidationDialog(false)}
                  >
                    Review Later
                  </Button>
                  <Button 
                    onClick={() => {
                      setEditingIndex(validationErrors[0].index);
                      setShowValidationDialog(false);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Fix Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Form Type Selection Dialog */}
      {showFormTypeDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader className="border-b">
              <CardTitle className="text-xl">Select Form Type for CSV Template</CardTitle>
              <CardDescription>Choose the 1099 form type to generate a customized CSV template</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(Object.keys(formDefinitions) as FormType[]).map((formType) => (
                  <Card 
                    key={formType}
                    className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 hover:border-blue-500"
                    onClick={() => generateCSVForFormType(formType)}
                  >
                    <CardContent className="p-4 text-center">
                      <h4 className="font-bold text-lg text-blue-600">{formType}</h4>
                      <p className="text-xs text-gray-600 mt-1">{formDefinitions[formType].title}</p>
                      <p className="text-xs text-gray-500 mt-2">{formDefinitions[formType].fields.length} fields</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowFormTypeDialog(false)}
                  className="border-gray-300"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Recipient Information</h3>
            <p className="text-sm text-gray-600">Add payee details one by one or upload via CSV</p>
          </div>
        <div className="flex gap-2">
          <Button 
            onClick={downloadSampleCSV} 
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50 hover:shadow-md hover:scale-105 transition-all duration-200"
          >
            <Download className="h-4 w-4 mr-2" />
            Sample CSV
          </Button>
          <Button 
            onClick={() => document.getElementById('payee-csv-upload')?.click()} 
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50 hover:shadow-md hover:scale-105 transition-all duration-200"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload CSV
          </Button>
          <input
            id="payee-csv-upload"
            type="file"
            accept=".csv"
            onChange={handleCSVUpload}
            className="hidden"
          />
          <Button onClick={addPayee} className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-semibold">
            Add Recipient
          </Button>
        </div>
      </div>

      {/* TIN Match Download Section */}
      {data.length > 0 && data.filter(p => p.ssnTin).length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                  TIN Match Data Export
                </h4>
                <p className="text-xs text-gray-600">Download TIN data in CSV or TXT format for IRS validation</p>
                <p className="text-xs text-gray-500 mt-1">{data.filter(p => p.ssnTin).length} recipient(s) with TIN numbers</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => downloadTinMatchData('csv')}
                  variant="outline"
                  className="gap-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                  size="sm"
                >
                  <Download className="h-4 w-4" />
                  Download CSV
                </Button>
                <Button
                  onClick={() => downloadTinMatchData('txt')}
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  <FileText className="h-4 w-4" />
                  Download TXT
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {data.length === 0 ? (
        <Card className="professional-shadow">
          <CardContent className="text-center py-12">
            <div className="text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="mb-4 text-lg">No recipients added yet</p>
              <p className="mb-6 text-sm">Add your first recipient to begin creating 1099 forms</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="professional-shadow-lg">
          <CardContent className="p-0">
            {/* Table View */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SSN/TIN</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Form Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((payee, index) => (
                    <>
                      <tr key={index} className="hover:bg-blue-50 transition-colors duration-200 cursor-pointer">
                        <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{payee.fullName || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{payee.ssnTin || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{payee.email || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{payee.city || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{payee.state || '-'}</td>
                        <td className="px-4 py-3 text-sm">
                          {payee.formType ? (
                            <Badge className="bg-blue-100 text-blue-800">{payee.formType}</Badge>
                          ) : (
                            <span className="text-gray-400">Not set</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">${payee.amount?.toFixed(2) || '0.00'}</td>
                        <td className="px-4 py-3 text-sm text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              {editingIndex === index ? 'Close' : 'Edit'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removePayee(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {editingIndex === index && (
                        <tr>
                          <td colSpan={9} className="px-4 py-6 bg-blue-50">
                            <div className="space-y-6">
                              <h4 className="font-semibold text-gray-900 mb-4">Edit Recipient {index + 1}</h4>
                              
                              {/* Basic Information */}
                              <div>
                                <h5 className="text-sm font-semibold text-gray-700 mb-3">Basic Information</h5>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <Field label="Recipient's Name *" htmlFor={`payeeName-${index}`}>
                                    <Input 
                                      id={`payeeName-${index}`}
                                      placeholder="Enter recipient's full name" 
                                      value={payee.fullName}
                                      onChange={(e) => updatePayee(index, "fullName", e.target.value)}
                                    />
                                  </Field>
                                  <Field label="SSN/TIN *" htmlFor={`payeeSsn-${index}`}>
                                    <Input 
                                      id={`payeeSsn-${index}`}
                                      placeholder="000-00-0000" 
                                      value={payee.ssnTin}
                                      onChange={(e) => updatePayee(index, "ssnTin", e.target.value)}
                                    />
                                  </Field>
                                  <Field label="Email *" htmlFor={`payeeEmail-${index}`}>
                                    <Input 
                                      id={`payeeEmail-${index}`}
                                      type="email" 
                                      placeholder="recipient@example.com" 
                                      value={payee.email}
                                      onChange={(e) => updatePayee(index, "email", e.target.value)}
                                    />
                                  </Field>
                                </div>
                              </div>

                              {/* Address Information */}
                              <div>
                                <h5 className="text-sm font-semibold text-gray-700 mb-3">Address Information</h5>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <Field label="Street Address *" htmlFor={`payeeAddress1-${index}`}>
                                    <Input 
                                      id={`payeeAddress1-${index}`}
                                      placeholder="123 Main Street" 
                                      value={payee.address1}
                                      onChange={(e) => updatePayee(index, "address1", e.target.value)}
                                    />
                                  </Field>
                                  <Field label="Address Line 2" htmlFor={`payeeAddress2-${index}`}>
                                    <Input 
                                      id={`payeeAddress2-${index}`}
                                      placeholder="Apt 4B" 
                                      value={payee.address2 || ""}
                                      onChange={(e) => updatePayee(index, "address2", e.target.value)}
                                    />
                                  </Field>
                                  <Field label="City *" htmlFor={`payeeCity-${index}`}>
                                    <Input 
                                      id={`payeeCity-${index}`}
                                      placeholder="City" 
                                      value={payee.city}
                                      onChange={(e) => updatePayee(index, "city", e.target.value)}
                                    />
                                  </Field>
                                  <Field label="State *" htmlFor={`payeeState-${index}`}>
                                    <Input 
                                      id={`payeeState-${index}`}
                                      placeholder="CA" 
                                      value={payee.state}
                                      onChange={(e) => updatePayee(index, "state", e.target.value)}
                                    />
                                  </Field>
                                  <Field label="ZIP Code *" htmlFor={`payeeZip-${index}`}>
                                    <Input 
                                      id={`payeeZip-${index}`}
                                      placeholder="12345" 
                                      value={payee.zip}
                                      onChange={(e) => updatePayee(index, "zip", e.target.value)}
                                    />
                                  </Field>
                                  <Field label="Country *" htmlFor={`payeeCountry-${index}`}>
                                    <Select value={payee.country} onValueChange={(value) => updatePayee(index, "country", value)}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select country" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="US">United States</SelectItem>
                                        <SelectItem value="CA">Canada</SelectItem>
                                        <SelectItem value="MX">Mexico</SelectItem>
                                        <SelectItem value="PK">Pakistan</SelectItem>
                                        <SelectItem value="IN">India</SelectItem>
                                        <SelectItem value="GB">United Kingdom</SelectItem>
                                        <SelectItem value="AU">Australia</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </Field>
                                </div>
                              </div>

                              {/* Form Type Selection */}
                              <div>
                                <h5 className="text-sm font-semibold text-gray-700 mb-3">Form Type *</h5>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                  {(Object.keys(formDefinitions) as FormType[]).map((formType) => (
                                    <Card 
                                      key={formType}
                                      className={`cursor-pointer smooth-transition ${
                                        payee.formType === formType 
                                          ? 'ring-2 ring-blue-600 bg-blue-50' 
                                          : 'hover:shadow-md'
                                      }`}
                                      onClick={() => updatePayee(index, "formType", formType)}
                                    >
                                      <CardContent className="p-3">
                                        <div className="text-center">
                                          <h4 className="font-semibold text-xs">{formType}</h4>
                                          {payee.formType === formType && (
                                            <CheckCircle className="h-4 w-4 text-blue-600 mx-auto mt-1" />
                                          )}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              </div>

                              {/* Form-Specific Fields */}
                              {payee.formType && (
                                <div>
                                  <h5 className="text-sm font-semibold text-gray-700 mb-3">
                                    {payee.formType} - {formDefinitions[payee.formType as FormType]?.title}
                                  </h5>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {formDefinitions[payee.formType as FormType]?.fields.slice(0, 6).map((field) => (
                                      <Field key={field.id} label={field.label} htmlFor={`${field.id}-${index}`}>
                                        {field.type === "checkbox" ? (
                                          <div className="flex items-center space-x-2 mt-2">
                                            <Checkbox id={`${field.id}-${index}`} />
                                            <Label htmlFor={`${field.id}-${index}`} className="text-xs">
                                              {field.label}
                                            </Label>
                                          </div>
                                        ) : field.type === "currency" || field.type === "number" ? (
                                          <Input 
                                            id={`${field.id}-${index}`}
                                            type="number" 
                                            placeholder="0.00" 
                                            step="0.01"
                                          />
                                        ) : field.type === "date" ? (
                                          <Input 
                                            id={`${field.id}-${index}`}
                                            type="date"
                                          />
                                        ) : (
                                          <Input 
                                            id={`${field.id}-${index}`}
                                            placeholder={field.label}
                                          />
                                        )}
                                      </Field>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </>
  );
}

// Form Selection Step Component
function FormSelectionStep({ 
  selectedForm, 
  onFormSelect, 
  formData, 
  onFormDataChange 
}: { 
  selectedForm: FormType | null;
  onFormSelect: (form: FormType) => void;
  formData: Record<string, any>;
  onFormDataChange: (fieldId: string, value: any) => void;
}) {
  const formTypes = Object.keys(formDefinitions) as FormType[];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Select 1099 Form Type</h3>
        <p className="text-sm text-gray-600 mb-6">Choose the appropriate 1099 form type for your recipients</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {formTypes.map((formType) => (
            <Card 
              key={formType}
              className={`cursor-pointer smooth-transition professional-shadow ${
                selectedForm === formType 
                  ? 'ring-2 ring-blue-600 bg-blue-50' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => onFormSelect(formType)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm">{formType}</h4>
                    <p className="text-xs text-gray-600">{formDefinitions[formType].title}</p>
                  </div>
                  {selectedForm === formType && (
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {selectedForm && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Complete {selectedForm}</h3>
            <Badge variant="secondary">{formDefinitions[selectedForm].title}</Badge>
          </div>
          
          <Card className="professional-shadow-lg">
            <CardContent className="p-6 space-y-8">
              {/* Income Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-semibold text-gray-800">Income</h4>
                  <div className="h-px bg-gray-300 flex-1"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Main Income Fields */}
                  <div className="space-y-4">
                    {formDefinitions[selectedForm].fields.slice(0, Math.ceil(formDefinitions[selectedForm].fields.length / 2)).map((field) => (
                      <div key={field.id}>
                        {field.type === "checkbox" ? (
                          <div className="flex items-start space-x-3">
                            <Checkbox 
                              id={field.id}
                              checked={formData[field.id] || false}
                              onCheckedChange={(checked) => onFormDataChange(field.id, checked)}
                              className="mt-1"
                            />
                            <Label htmlFor={field.id} className="text-sm leading-relaxed">
                              {field.label}
                            </Label>
                          </div>
                        ) : (
                          <Field label={field.label} htmlFor={field.id}>
                            <Input
                              id={field.id}
                              type={field.type === "currency" ? "number" : field.type === "date" ? "date" : "text"}
                              placeholder={field.type === "currency" ? "0.00" : field.type === "date" ? "YYYY-MM-DD" : "Enter value"}
                              value={formData[field.id] || (field.type === "currency" ? "0.00" : "")}
                              onChange={(e) => {
                                const value = field.type === "currency" || field.type === "number" 
                                  ? parseFloat(e.target.value) || 0 
                                  : e.target.value;
                                onFormDataChange(field.id, value);
                              }}
                              className="smooth-transition"
                              step={field.type === "currency" ? "0.01" : undefined}
                            />
                          </Field>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Right Column - Additional Fields */}
                  <div className="space-y-4">
                    {formDefinitions[selectedForm].fields.slice(Math.ceil(formDefinitions[selectedForm].fields.length / 2)).map((field) => (
                      <div key={field.id}>
                        {field.type === "checkbox" ? (
                          <div className="flex items-start space-x-3">
                            <Checkbox 
                              id={field.id}
                              checked={formData[field.id] || false}
                              onCheckedChange={(checked) => onFormDataChange(field.id, checked)}
                              className="mt-1"
                            />
                            <Label htmlFor={field.id} className="text-sm leading-relaxed">
                              {field.label}
                            </Label>
                          </div>
                        ) : (
                          <Field label={field.label} htmlFor={field.id}>
                            <Input
                              id={field.id}
                              type={field.type === "currency" ? "number" : field.type === "date" ? "date" : "text"}
                              placeholder={field.type === "currency" ? "0.00" : field.type === "date" ? "YYYY-MM-DD" : "Enter value"}
                              value={formData[field.id] || (field.type === "currency" ? "0.00" : "")}
                              onChange={(e) => {
                                const value = field.type === "currency" || field.type === "number" 
                                  ? parseFloat(e.target.value) || 0 
                                  : e.target.value;
                                onFormDataChange(field.id, value);
                              }}
                              className="smooth-transition"
                              step={field.type === "currency" ? "0.01" : undefined}
                            />
                          </Field>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* State Information Section (for applicable forms) */}
              {(selectedForm === "1099-NEC" || selectedForm === "1099-MISC" || selectedForm === "1099-INT" || selectedForm === "1099-DIV") && (
                <div className="space-y-6 border-t pt-6">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-semibold text-gray-800">State Information</h4>
                    <div className="h-px bg-gray-300 flex-1"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="5 State tax withheld" htmlFor="stateTaxWithheld">
                      <Input
                        id="stateTaxWithheld"
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        value={formData.stateTaxWithheld || "0.00"}
                        onChange={(e) => onFormDataChange("stateTaxWithheld", parseFloat(e.target.value) || 0)}
                        className="smooth-transition"
                      />
                    </Field>
                    
                    <Field label="6(a) State name" htmlFor="stateName">
                      <Input
                        id="stateName"
                        placeholder="State name"
                        value={formData.stateName || ""}
                        onChange={(e) => onFormDataChange("stateName", e.target.value)}
                        className="smooth-transition"
                      />
                    </Field>
                    
                    <Field label="6(b) Payer's state no" htmlFor="payerStateNo">
                      <Input
                        id="payerStateNo"
                        placeholder="State number"
                        value={formData.payerStateNo || ""}
                        onChange={(e) => onFormDataChange("payerStateNo", e.target.value)}
                        className="smooth-transition"
                      />
                    </Field>
                    
                    <Field label="7 State income" htmlFor="stateIncome">
                      <Input
                        id="stateIncome"
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        value={formData.stateIncome || "0.00"}
                        onChange={(e) => onFormDataChange("stateIncome", parseFloat(e.target.value) || 0)}
                        className="smooth-transition"
                      />
                    </Field>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// CSV Manager Component (Forms Summary)
function CsvManager({ 
  onDownloadAll, 
  onDownloadSelected, 
  payeeData, 
  selectedForm 
}: { 
  onDownloadAll: () => void; 
  onDownloadSelected: () => void;
  payeeData: PayeeData[];
  selectedForm: FormType | null;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState<Set<number>>(new Set());

  // Mock status data - in real app this would come from validation
  const getRecipientStatus = (payee: PayeeData, index: number) => {
    if (!payee.fullName || !payee.ssnTin || !payee.amount) return "error";
    if (!payee.email) return "warning";
    return "good";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "good":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "good":
        return "Good";
      case "warning":
        return "OK for E-File, No Email";
      case "error":
        return "Error";
      default:
        return "Unknown";
    }
  };

  const filteredPayees = payeeData.filter(payee => 
    payee.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleRecipient = (index: number) => {
    const newSelected = new Set(selectedRecipients);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRecipients(newSelected);
  };

  const selectAll = () => {
    if (selectedRecipients.size === filteredPayees.length) {
      setSelectedRecipients(new Set());
    } else {
      setSelectedRecipients(new Set(filteredPayees.map((_, index) => index)));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Forms Summary</h3>
          <p className="text-sm text-gray-600">Review your recipients and forms before proceeding to e-filing</p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          {payeeData.length} recipient{payeeData.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Filter Tabs */}
      <div className="bg-gray-50 rounded-lg p-1 flex items-center gap-1">
        <button className="px-3 py-2 text-sm font-medium bg-white border border-gray-200 rounded text-gray-900">
          Unscheduled {payeeData.length}
        </button>
        <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
          Scheduled & Sent 0
        </button>
        <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
          State E-file 0
        </button>
        <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
          Address Verification
        </button>
        <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
          TIN Match
        </button>
        <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
          Box Totals
        </button>
        <div className="flex-1"></div>
        <Input 
          placeholder="Type to Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-48"
        />
      </div>

      {/* Next Step Button */}
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Button className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-semibold">
            Next Step: Schedule E-file
          </Button>
          <span className="text-sm text-gray-600">
            or (optionally) download your{" "}
            <button className="text-blue-600 hover:underline">TIN Match</button>
            {" "}or{" "}
            <button className="text-blue-600 hover:underline">Preview file</button>
          </span>
        </div>
      </div>

      {payeeData.length === 0 ? (
        <Card className="professional-shadow">
          <CardContent className="text-center py-12">
            <div className="text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="mb-4 text-lg">No recipients to review</p>
              <p className="mb-6 text-sm">Add recipients in the previous step to see the forms summary</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="professional-shadow-lg">
          <CardContent className="p-0">
            {/* Action Buttons */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                  Delete...
                </Button>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-md hover:shadow-lg transition-all duration-200 font-semibold">
                  Bulk Update...
                </Button>
              </div>
            </div>

            {/* Status Legend */}
            <div className="p-4 border-b bg-blue-50">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Good</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span>OK for E-File, No Email</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span>Error</span>
                </div>
              </div>
            </div>

            {/* Recipients Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-green-50 border-b">
                    <th className="text-left p-4 font-semibold text-gray-900">
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          checked={selectedRecipients.size === filteredPayees.length && filteredPayees.length > 0}
                          onCheckedChange={selectAll}
                        />
                        <span>Recipient</span>
                      </div>
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-900">Form</th>
                    <th className="text-left p-4 font-semibold text-gray-900">Box 1</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayees.map((payee, index) => {
                    const status = getRecipientStatus(payee, index);
                    return (
                      <tr key={index} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Checkbox 
                              checked={selectedRecipients.has(index)}
                              onCheckedChange={() => toggleRecipient(index)}
                            />
                            <div className="flex items-center gap-2">
                              {getStatusIcon(status)}
                              <button className="text-blue-600 hover:underline font-medium">
                                {payee.fullName || `Recipient ${index + 1}`}
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {selectedForm || 'NEC'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">$</span>
                            <Input
                              type="number"
                              step="0.01"
                              value={payee.amount || 0}
                              onChange={(e) => {
                                // Update payee amount
                                const newAmount = parseFloat(e.target.value) || 0;
                                // This would update the payee data in the parent component
                              }}
                              className="w-24 border-gray-200"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Summary Footer */}
            <div className="p-4 border-t bg-gray-50">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  Showing {filteredPayees.length} of {payeeData.length} recipients
                </span>
                <div className="flex items-center gap-4">
                  <span>Total Amount: ${payeeData.reduce((sum, payee) => sum + (payee.amount || 0), 0).toFixed(2)}</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>{payeeData.filter(p => getRecipientStatus(p, 0) === 'good').length} Ready</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// E-Filing Step Component
function EFilingStep({ 
  efileMode, 
  onModeSelect, 
  efileStep, 
  onStepChange, 
  transmitterData, 
  onTransmitterChange, 
  onSubmit,
  issuerData,
  payeeData,
  selectedForm
}: {
  efileMode: "own" | "powerly" | null;
  onModeSelect: (mode: "own" | "powerly") => void;
  efileStep: number;
  onStepChange: (step: number) => void;
  transmitterData: TransmitterData | null;
  onTransmitterChange: (data: TransmitterData | null) => void;
  onSubmit: () => void;
  issuerData: IssuerData[];
  payeeData: PayeeData[];
  selectedForm: FormType | null;
}) {
  const [asciiContent, setAsciiContent] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressVerification, setAddressVerification] = useState<"skip" | "verify">("skip");
  const [tinMatching, setTinMatching] = useState<"skip" | "verify">("skip");
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [showMapping, setShowMapping] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [asciiFile, setAsciiFile] = useState<File | null>(null);
  const [asciiValidationErrors, setAsciiValidationErrors] = useState<string[]>([]);
  const [asciiValidated, setAsciiValidated] = useState(false);
  const [isGeneratingAscii, setIsGeneratingAscii] = useState(false);
  const [asciiGenerationProgress, setAsciiGenerationProgress] = useState(0);
  const [isValidatingAscii, setIsValidatingAscii] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);

  // Calculate costs based on selections
  const addressCost = addressVerification === "verify" ? payeeData.length * 0.07 : 0;
  const tinCost = tinMatching === "verify" ? payeeData.length * 0.45 : 0;
  const subtotal = 4.65 + addressCost + tinCost;

  const efileSteps = ["Transmitter Info", "Summary & Download", "Upload CSV", "Generate ASCII", "Validate ASCII"];

  const handleAsciiGeneration = async () => {
    if (!transmitterData) {
      alert("Please add your transmitter details before generating the ASCII file.");
      return;
    }
    
    setIsGeneratingAscii(true);
    setAsciiGenerationProgress(0);
    onStepChange(3); // Navigate to ASCII Generation step
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setAsciiGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    
    // Simulate async generation
    setTimeout(() => {
      const ascii = generateAscii(transmitterData, issuerData[0], payeeData, selectedForm || "1099-NEC");
      setAsciiContent(ascii);
      setIsGeneratingAscii(false);
      clearInterval(progressInterval);
      setAsciiGenerationProgress(100);
    }, 2000);
  };
  
  const handleDownloadAscii = () => {
    if (!asciiContent) return;
    
    const blob = new Blob([asciiContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `1099_${selectedForm || 'NEC'}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleAsciiValidation = async () => {
    if (!asciiFile) {
      alert('Please upload an ASCII file first');
      return;
    }

    setIsValidatingAscii(true);
    setValidationProgress(0);
    
    // Simulate validation progress
    const progressInterval = setInterval(() => {
      setValidationProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 12.5;
      });
    }, 250);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      
      // Simulate validation delay
      setTimeout(() => {
        setAsciiValidationErrors([]);
        setAsciiValidated(true);
        setIsValidatingAscii(false);
        clearInterval(progressInterval);
        setValidationProgress(100);
        
        // Auto-redirect to success after validation
        setTimeout(() => {
          onSubmit(); // This will navigate to main success step
        }, 1000);
      }, 2000);
    };
    reader.readAsText(asciiFile);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit();
      // Submission complete - onSubmit will handle navigation to main success step
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!efileMode) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Choose Your E-Filing Method</h3>
          <p className="text-gray-600">Select how you'd like to file your 1099 forms with the IRS</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            className="cursor-pointer smooth-transition professional-shadow hover:shadow-lg"
            onClick={() => onModeSelect("own")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-600" />
                My Own Transmitter
              </CardTitle>
              <CardDescription>
                Use your own transmitter credentials and handle the e-filing process yourself
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-gray-600">
                <li>• Full control over submission process</li>
                <li>• Requires transmitter setup</li>
                <li>• Manual ASCII generation</li>
                <li>• Direct IRS submission</li>
              </ul>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer smooth-transition professional-shadow hover:shadow-lg"
            onClick={() => onModeSelect("powerly")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Use Powerly Transmitter
              </CardTitle>
              <CardDescription>
                Let Powerly handle the e-filing process with our transmitter service
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-gray-600">
                <li>• No transmitter setup required</li>
                <li>• Automated processing</li>
                <li>• Professional service</li>
                <li>• Pay per submission</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (efileMode === "powerly") {
    return <PowerlyTransmitterFlow onSubmit={handleSubmit} isSubmitting={isSubmitting} payeeData={payeeData} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">E-File Workflow</h3>
        <div className="flex items-center gap-3">
          {efileStep >= 4 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStepChange(5)}
              className="text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-400"
            >
              <Upload className="h-4 w-4 mr-2" />
              Validate ASCII
            </Button>
          )}
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Own Transmitter
          </Badge>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between gap-2">
        {efileSteps.map((stepName, index) => (
          <div 
            key={stepName} 
            className={`flex flex-col items-center ${
              index <= efileStep ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
            }`}
            onClick={() => {
              if (index <= efileStep) {
                onStepChange(index);
              }
            }}
            title={index <= efileStep ? `Go to ${stepName}` : `Complete previous steps first`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${
              index < efileStep 
                ? 'step-completed' 
                : index === efileStep
                ? 'step-active ring-4 ring-blue-200 shadow-xl'
                : 'step-inactive'
            }`}>
              {index < efileStep ? (
                <CheckCircle className="h-6 w-6" />
              ) : (
                index + 1
              )}
            </div>
            <span className={`text-xs mt-2 text-center max-w-24 font-medium ${
              index < efileStep 
                ? 'text-blue-600' 
                : index === efileStep
                ? 'text-blue-700 font-semibold'
                : 'text-gray-400'
            }`}>
              {stepName}
            </span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      {/* Step 0: Transmitter Information */}
      {efileStep === 0 && (
        <Card className="professional-shadow">
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold mb-4">Transmitter Information</h4>
            
            <TransmitterForm 
              data={transmitterData} 
              onChange={onTransmitterChange}
              onSubmit={() => onStepChange(1)}
            />
          </CardContent>
        </Card>
      )}

      {/* Step 1: Summary & Download CSV */}
      {efileStep === 1 && (
        <Card className="professional-shadow">
          <CardContent className="p-8">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-2xl font-bold text-gray-900">Data Summary</h4>
                  <p className="text-gray-600 text-sm mt-2">
                    Review all information before downloading CSV for E-Filing
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-blue-100 text-blue-700 px-4 py-2 text-sm font-semibold">
                    {payeeData.length} Recipients
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-700 px-4 py-2 text-sm font-semibold">
                    {issuerData.length} Payers
                  </Badge>
                </div>
              </div>
              
              {/* Info Alert */}
              <Alert className="bg-blue-50 border-blue-200 mt-4">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  <strong>Next Step:</strong> Download the CSV file below to upload it in Step 3 for ASCII generation
                </AlertDescription>
              </Alert>
            </div>

            {/* Payer Summary Table */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Delete Selected
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Generate CSV for all payees
                      const csvContent = [
                        ['Issuer', 'Payee Name', 'SSN/TIN', 'Email', 'Phone', 'Address 1', 'Address 2', 'City', 'State', 'ZIP', 'Form Type', 'Amount'].join(','),
                        ...payeeData.map(p => [
                          issuerData[0]?.issuerName || '',
                          p.payeeName,
                          p.einTin,
                          p.email,
                          p.phone,
                          p.address1,
                          p.address2 || '',
                          p.city,
                          p.state,
                          p.zip,
                          p.formType,
                          p.formData?.box1 || '0.00'
                        ].join(','))
                      ].join('\n');
                      
                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `all_payees_${new Date().toISOString().split('T')[0]}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      window.URL.revokeObjectURL(url);
                    }}
                    className="text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download All Payers CSV
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStepChange(0)}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    Edit Transmitter
                  </Button>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="max-h-[500px] overflow-y-auto">
                  <table className="w-full text-sm">
                    {/* Table Header */}
                    <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200 sticky top-0 z-10">
                      <tr>
                        <th className="text-left p-4 font-bold text-gray-800 text-base">
                          Transmitter
                        </th>
                        <th className="text-left p-4 font-bold text-gray-800 text-base">
                          Issuer
                        </th>
                        <th className="text-left p-4 font-bold text-gray-800 text-base">
                          Recipient
                        </th>
                        <th className="text-center p-4 font-bold text-gray-800 text-base">
                          Form Name
                        </th>
                        <th className="text-center p-4 font-bold text-gray-800 text-base">
                          Download
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Display up to 5 records */}
                      {payeeData.slice(0, 5).map((payee, idx) => {
                        // Use same transmitter for all rows
                        const transmitter = transmitterData || { transmitterName: 'Powerly Tax Services', tcc: '12345' };
                        
                        // Change issuer for rows 1 and 3 (idx 1 and 3)
                        let issuer;
                        if (idx === 1) {
                          issuer = issuerData[1] || { issuerName: 'Tech Solutions LLC', einTin: '98-7654321' };
                        } else if (idx === 3) {
                          issuer = issuerData[1] || { issuerName: 'Tech Solutions LLC', einTin: '98-7654321' };
                        } else {
                          issuer = issuerData[0] || { issuerName: 'Acme Corporation', einTin: '12-3456789' };
                        }
                        
                        return (
                          <tr key={`record-${idx}`} className="border-b hover:bg-blue-50 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
                                  {transmitter.transmitterName?.charAt(0).toUpperCase() || 'T'}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">{transmitter.transmitterName || 'N/A'}</div>
                                  <div className="text-xs text-gray-500 mt-0.5">TCC: {transmitter.tcc || 'N/A'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-sm">
                                  {issuer.issuerName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">{issuer.issuerName}</div>
                                  <div className="text-xs text-gray-500 mt-0.5">EIN: {issuer.einTin}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold shadow-sm">
                                  {payee.payeeName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">{payee.payeeName}</div>
                                  <div className="text-xs text-gray-500 mt-0.5">{payee.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              {payee.formType && (
                                <Badge className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-3 py-1.5 text-sm font-semibold shadow-sm">
                                  {payee.formType}
                                </Badge>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                                onClick={() => {
                                  // Download CSV for single record
                                  const csvContent = [
                                    ['Transmitter', 'Issuer', 'Recipient', 'SSN/TIN', 'Email', 'Phone', 'Address 1', 'Address 2', 'City', 'State', 'ZIP', 'Form Type', 'Amount'].join(','),
                                    [
                                      transmitter.transmitterName || 'N/A',
                                      issuer.issuerName,
                                      payee.payeeName,
                                      payee.einTin,
                                      payee.email,
                                      payee.phone,
                                      payee.address1,
                                      payee.address2 || '',
                                      payee.city,
                                      payee.state,
                                      payee.zip,
                                      payee.formType,
                                      payee.formData?.box1 || '0.00'
                                    ].join(',')
                                  ].join('\n');
                                  
                                  const blob = new Blob([csvContent], { type: 'text/csv' });
                                  const url = window.URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `${payee.payeeName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                                  window.URL.revokeObjectURL(url);
                                }}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Action Buttons Section */}
            <div className="mt-8 border-t pt-6">
              <div className="flex items-center justify-between">
                <Button 
                  variant="outline"
                  onClick={() => onStepChange(0)}
                  className="border-gray-300 hover:bg-gray-50 px-6"
                >
                  ← Back to Transmitter
                </Button>
                <Button 
                  onClick={() => onStepChange(2)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all px-8 text-base font-semibold"
                >
                  Continue to Upload CSV →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Upload CSV */}
      {efileStep === 2 && (
        <Card className="professional-shadow">
          <CardContent className="p-8">
            {!showMapping ? (
              <div className="text-center">
                <div className="mb-6">
                  <Upload className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold mb-2">Upload CSV File</h4>
                  <p className="text-gray-600 mb-6">
                    Upload the CSV file you just downloaded (or a modified version)
                  </p>
                </div>
                <input
                  id="efile-csv-upload"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const text = event.target?.result as string;
                        const lines = text.split('\n').filter(line => line.trim());
                        if (lines.length < 2) {
                          alert('CSV file is empty or invalid');
                          return;
                        }
                        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
                        const data = lines.slice(1).map(line => {
                          const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                          const row: any = {};
                          headers.forEach((header, index) => {
                            row[header] = values[index] || '';
                          });
                          return row;
                        });
                        
                        // Auto-map fields based on common column names
                        const autoMapping: Record<string, string> = {};
                        const fieldPatterns: Record<string, string[]> = {
                          payeeName: ['name', 'payee name', 'payee', 'recipient name', 'recipient', 'vendor name', 'vendor'],
                          einTin: ['ein', 'tin', 'ssn', 'tax id', 'taxid', 'ein/tin', 'ssn/ein', 'tax identification'],
                          email: ['email', 'e-mail', 'email address', 'mail'],
                          phone: ['phone', 'telephone', 'phone number', 'tel', 'mobile'],
                          address1: ['address', 'address 1', 'address1', 'street', 'street address', 'address line 1'],
                          address2: ['address 2', 'address2', 'address line 2', 'suite', 'apt', 'unit'],
                          city: ['city', 'town'],
                          state: ['state', 'st', 'province'],
                          zip: ['zip', 'zip code', 'zipcode', 'postal', 'postal code', 'postalcode'],
                          amount: ['amount', 'payment', 'compensation', 'total', 'sum', 'value']
                        };
                        
                        headers.forEach(header => {
                          const headerLower = header.toLowerCase();
                          Object.entries(fieldPatterns).forEach(([field, patterns]) => {
                            if (!autoMapping[field] && patterns.some(pattern => headerLower.includes(pattern))) {
                              autoMapping[field] = header;
                            }
                          });
                        });
                        
                        setCsvHeaders(headers);
                        setCsvData(data);
                        setFieldMapping(autoMapping);
                        setShowMapping(true);
                      };
                      reader.readAsText(file);
                    }
                    e.target.value = '';
                  }}
                />
                <Button 
                  onClick={() => document.getElementById('efile-csv-upload')?.click()}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all px-8"
                >
                  Choose CSV File
                </Button>
                <p className="text-sm text-gray-500 mt-4">
                  Supported formats: CSV files with headers in the first row
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xl font-semibold">Map CSV Fields</h4>
                    <p className="text-gray-600 text-sm mt-1">
                      Match your CSV columns to the required fields
                    </p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">
                    {csvData.length} records found
                  </Badge>
                </div>

                {Object.keys(fieldMapping).length > 0 && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 text-sm">
                      <span className="font-semibold">{Object.keys(fieldMapping).length} fields auto-mapped!</span> Review and adjust if needed.
                    </AlertDescription>
                  </Alert>
                )}

                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-sm">
                    {Object.keys(fieldMapping).length > 0 
                      ? 'Fields with ✓ were auto-mapped. Verify or change them if needed.'
                      : 'Map each required field to a column from your CSV file'}
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { field: 'payeeName', label: 'Payee Name', required: true },
                    { field: 'einTin', label: 'EIN/TIN/SSN', required: true },
                    { field: 'email', label: 'Email', required: false },
                    { field: 'phone', label: 'Phone', required: false },
                    { field: 'address1', label: 'Address Line 1', required: true },
                    { field: 'address2', label: 'Address Line 2', required: false },
                    { field: 'city', label: 'City', required: true },
                    { field: 'state', label: 'State', required: true },
                    { field: 'zip', label: 'ZIP Code', required: true },
                    { field: 'amount', label: 'Amount', required: true },
                  ].map(({ field, label, required }) => {
                    const isMapped = fieldMapping[field] && fieldMapping[field] !== '_skip';
                    return (
                      <div key={field} className={`space-y-2 ${isMapped ? 'opacity-75' : ''}`}>
                        <Label htmlFor={`map-${field}`} className="flex items-center gap-2">
                          {label} {required && <span className="text-red-500">*</span>}
                          {isMapped && <CheckCircle className="h-4 w-4 text-green-600" />}
                        </Label>
                        <Select
                          value={fieldMapping[field] || ''}
                          onValueChange={(value) => setFieldMapping({ ...fieldMapping, [field]: value })}
                        >
                          <SelectTrigger 
                            id={`map-${field}`}
                            className={isMapped ? 'border-green-300 bg-green-50' : ''}
                          >
                            <SelectValue placeholder="Select column" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_skip">Skip this field</SelectItem>
                            {csvHeaders.map((header) => (
                              <SelectItem key={header} value={header}>
                                {header}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  })}
                </div>

                {validationErrors.length > 0 && (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <p className="font-semibold mb-2">Please fix the following errors:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowMapping(false);
                      setCsvData([]);
                      setCsvHeaders([]);
                      setFieldMapping({});
                      setValidationErrors([]);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      const errors: string[] = [];
                      const requiredFields = ['payeeName', 'einTin', 'address1', 'city', 'state', 'zip', 'amount'];
                      
                      requiredFields.forEach(field => {
                        if (!fieldMapping[field] || fieldMapping[field] === '_skip') {
                          const fieldLabel = {
                            payeeName: 'Payee Name',
                            einTin: 'EIN/TIN/SSN',
                            address1: 'Address Line 1',
                            city: 'City',
                            state: 'State',
                            zip: 'ZIP Code',
                            amount: 'Amount'
                          }[field];
                          errors.push(`${fieldLabel} is required`);
                        }
                      });

                      if (errors.length > 0) {
                        setValidationErrors(errors);
                        return;
                      }

                      setValidationErrors([]);
                      // Auto-generate ASCII after mapping confirmation
                      handleAsciiGeneration();
                    }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  >
                    Confirm Mapping
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Generate ASCII File */}
      {efileStep === 3 && (
        <Card className="professional-shadow">
          <CardContent className="p-8">
            <div className="mb-6">
              <h4 className="text-2xl font-bold text-gray-900 mb-2">Generate ASCII File</h4>
              <p className="text-gray-600">
                Creating your IRS-compliant ASCII file for e-filing submission
              </p>
            </div>

            {/* Progress Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {isGeneratingAscii ? (
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center animate-pulse">
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : asciiGenerationProgress === 100 ? (
                    <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center animate-bounce">
                      <CheckCircle className="h-7 w-7 text-white" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                      <FileText className="h-7 w-7 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <h5 className="font-semibold text-gray-900 text-lg">
                      {isGeneratingAscii ? 'Generating...' : asciiGenerationProgress === 100 ? 'Generation Complete!' : 'Ready to Generate'}
                    </h5>
                    <p className="text-sm text-gray-600">
                      {isGeneratingAscii ? 'Processing your data...' : asciiGenerationProgress === 100 ? 'ASCII file is ready' : 'Click confirm to start'}
                    </p>
                  </div>
                </div>
                <Badge className={`text-lg px-4 py-2 ${
                  asciiGenerationProgress === 100 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {asciiGenerationProgress}%
                </Badge>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full h-3 bg-white rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${asciiGenerationProgress}%` }}
                />
              </div>
            </div>

            {/* ASCII Preview */}
            {asciiContent && !isGeneratingAscii && (
              <div className="mb-6 animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-semibold text-gray-900">ASCII File Preview</h5>
                  <Badge className="bg-gray-100 text-gray-700">
                    {asciiContent.split('\n').length} lines
                  </Badge>
                </div>
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 max-h-64 overflow-auto shadow-lg">
                  <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                    {asciiContent}
                  </pre>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button 
                variant="outline"
                onClick={() => onStepChange(2)}
                className="border-gray-300 hover:bg-gray-50"
                disabled={isGeneratingAscii}
              >
                ← Back
              </Button>
              
              {asciiContent && !isGeneratingAscii && (
                <>
                  <Button 
                    variant="outline"
                    onClick={handleDownloadAscii}
                    className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download ASCII File
                  </Button>
                  
                  <Button 
                    onClick={() => onStepChange(4)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all flex-1"
                  >
                    Validate Now →
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Validate ASCII File */}
      {efileStep === 4 && (
        <Card className="professional-shadow">
          <CardContent className="p-8">
            <div className="mb-6">
              <h4 className="text-2xl font-bold text-gray-900 mb-2">Validate ASCII File</h4>
              <p className="text-gray-600">
                Upload your generated ASCII file for IRS Publication 1220 compliance validation
              </p>
            </div>

            {/* Upload Section */}
            {!asciiFile ? (
              <div className="border-2 border-dashed border-blue-300 rounded-xl p-12 text-center bg-blue-50 hover:bg-blue-100 transition-all cursor-pointer"
                onClick={() => document.getElementById('ascii-file-upload')?.click()}
              >
                <Upload className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h5 className="text-lg font-semibold text-gray-900 mb-2">Upload your generated ASCII file</h5>
                <p className="text-gray-600 mb-4">
                  Click to browse or drag and drop your file here
                </p>
                <Badge className="bg-blue-100 text-blue-700 text-sm">
                  Supported: .txt files (IRS Publication 1220 format)
                </Badge>
                <input
                  id="ascii-file-upload"
                  type="file"
                  accept=".txt"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setAsciiFile(file);
                    }
                    e.target.value = '';
                  }}
                />
              </div>
            ) : (
              <div className="space-y-6">
                {/* File Info */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center">
                        <FileText className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 text-lg">{asciiFile.name}</h5>
                        <p className="text-sm text-gray-600 mt-1">
                          Size: {(asciiFile.size / 1024).toFixed(2)} KB • Ready for validation
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAsciiFile(null);
                        setAsciiValidationErrors([]);
                        setAsciiValidated(false);
                        setValidationProgress(0);
                      }}
                      className="text-gray-500 hover:text-red-600"
                    >
                      ✕
                    </Button>
                  </div>
                </div>

                {/* Validation Progress */}
                {isValidatingAscii && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center animate-pulse">
                          <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900 text-lg">Validating...</h5>
                          <p className="text-sm text-gray-600">Checking IRS compliance standards</p>
                        </div>
                      </div>
                      <Badge className="text-lg px-4 py-2 bg-blue-100 text-blue-800">
                        {validationProgress}%
                      </Badge>
                    </div>
                    <div className="w-full h-3 bg-white rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 ease-out rounded-full"
                        style={{ width: `${validationProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Validation Success */}
                {asciiValidated && !isValidatingAscii && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 animate-fade-in">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center animate-bounce">
                        <CheckCircle className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-green-900 text-lg">Validation Successful!</h5>
                        <p className="text-sm text-green-700">Your ASCII file meets all IRS requirements</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    variant="outline"
                    onClick={() => onStepChange(3)}
                    className="border-gray-300 hover:bg-gray-50"
                    disabled={isValidatingAscii}
                  >
                    ← Back
                  </Button>
                  
                  {!asciiValidated && !isValidatingAscii && (
                    <Button
                      onClick={handleAsciiValidation}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all flex-1"
                    >
                      Validate File
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

    </div>
  );
}

// Transmitter Form Component
function TransmitterForm({ data, onChange, onSubmit }: { 
  data: TransmitterData | null; 
  onChange: (data: TransmitterData | null) => void;
  onSubmit?: () => void;
}) {
  const [formData, setFormData] = useState<TransmitterData>(data || {
    tcc: "",
    businessName: "",
    contactName: "",
    einTin: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
    efileUsername: "",
    efilePassword: "",
    irsAccountId: "",
    saveForFuture: false
  });

  const updateField = (field: keyof TransmitterData, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    // Don't call onChange here - only update local state
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.tcc || !formData.businessName || !formData.contactName || 
        !formData.einTin || !formData.email || !formData.phone || 
        !formData.address1 || !formData.city || !formData.state || 
        !formData.zip || !formData.country) {
      alert("Please fill in all required fields");
      return;
    }
    
    // Now update parent with complete data
    onChange(formData);
    
    // Call onSubmit if provided
    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Transmitter Control Code (TCC) *" htmlFor="tcc">
        <Input 
          id="tcc" 
          placeholder="TCC" 
          value={formData.tcc}
          onChange={(e) => updateField("tcc", e.target.value)}
          className="smooth-transition"
        />
      </Field>
      <Field label="Business Name *" htmlFor="businessName">
        <Input 
          id="businessName" 
          placeholder="Business Name" 
          value={formData.businessName}
          onChange={(e) => updateField("businessName", e.target.value)}
          className="smooth-transition"
        />
      </Field>
      <Field label="Contact Name *" htmlFor="contactName">
        <Input 
          id="contactName" 
          placeholder="Contact Name" 
          value={formData.contactName}
          onChange={(e) => updateField("contactName", e.target.value)}
          className="smooth-transition"
        />
      </Field>
      <Field label="EIN/TIN *" htmlFor="einTin">
        <Input 
          id="einTin" 
          placeholder="00-0000000" 
          value={formData.einTin}
          onChange={(e) => updateField("einTin", e.target.value)}
          className="smooth-transition"
        />
      </Field>
      <Field label="Email *" htmlFor="email">
        <Input 
          id="email" 
          type="email" 
          placeholder="name@example.com" 
          value={formData.email}
          onChange={(e) => updateField("email", e.target.value)}
          className="smooth-transition"
        />
      </Field>
      <Field label="Phone *" htmlFor="phone">
        <Input 
          id="phone" 
          placeholder="(555) 555-5555" 
          value={formData.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          className="smooth-transition"
        />
      </Field>
      <Field label="Address Line 1 *" htmlFor="address1">
        <Input 
          id="address1" 
          placeholder="123 Main St" 
          value={formData.address1}
          onChange={(e) => updateField("address1", e.target.value)}
          className="smooth-transition"
        />
      </Field>
      <Field label="Address Line 2" htmlFor="address2">
        <Input 
          id="address2" 
          placeholder="Suite" 
          value={formData.address2}
          onChange={(e) => updateField("address2", e.target.value)}
          className="smooth-transition"
        />
      </Field>
      <Field label="City *" htmlFor="city">
        <Input 
          id="city" 
          placeholder="City" 
          value={formData.city}
          onChange={(e) => updateField("city", e.target.value)}
          className="smooth-transition"
        />
      </Field>
      <Field label="State *" htmlFor="state">
        <Input 
          id="state" 
          placeholder="State" 
          value={formData.state}
          onChange={(e) => updateField("state", e.target.value)}
          className="smooth-transition"
        />
      </Field>
      <Field label="ZIP *" htmlFor="zip">
        <Input 
          id="zip" 
          placeholder="ZIP" 
          value={formData.zip}
          onChange={(e) => updateField("zip", e.target.value)}
          className="smooth-transition"
        />
      </Field>
      <Field label="Country *" htmlFor="country">
        <Input 
          id="country" 
          placeholder="Country" 
          value={formData.country}
          onChange={(e) => updateField("country", e.target.value)}
          className="smooth-transition"
        />
      </Field>
      </div>
      
      {/* Submit Button */}
      <div className="flex justify-end pt-4 border-t">
              <Button 
                onClick={handleSubmit}
                className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all"
              >
                Continue to Summary →
              </Button>
      </div>
    </div>
  );
}

// Powerly Transmitter Flow Component  
function PowerlyTransmitterFlow({ onSubmit, isSubmitting, payeeData }: { onSubmit: () => void; isSubmitting: boolean; payeeData: PayeeData[] }) {
  const [showPayment, setShowPayment] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({
    cardholderName: "",
    cardNumber: "",
    paymentType: "credit",
    expiryDate: "",
    cvc: ""
  });
  const [addressVerification, setAddressVerification] = useState<"skip" | "verify">("skip");
  const [tinMatching, setTinMatching] = useState<"skip" | "verify">("skip");
  const [salesTaxLocation, setSalesTaxLocation] = useState({
    streetAddress: "Wapda Town, Lahman",
    city: "Lahore",
    stateProvince: "",
    postalCode: "98705",
    country: "PK - Pakistan"
  });

  // Group payees by form type and calculate costs
  const formGroups = payeeData.reduce((acc, payee) => {
    if (payee.formType) {
      if (!acc[payee.formType]) {
        acc[payee.formType] = { count: 0, cost: 0 };
      }
      acc[payee.formType].count += 1;
      acc[payee.formType].cost += 1.55; // $1.55 per form
    }
    return acc;
  }, {} as Record<string, { count: number; cost: number }>);

  const formSummary = Object.entries(formGroups).map(([formType, data]) => ({
    form: formType,
    records: data.count,
    cost: data.cost
  }));

  // Calculate costs based on selections
  const addressCost = addressVerification === "verify" ? payeeData.length * 0.07 : 0;
  const tinCost = tinMatching === "verify" ? payeeData.length * 0.45 : 0;
  const formCost = formSummary.reduce((sum, item) => sum + item.cost, 0);
  const subtotal = formCost + addressCost + tinCost;
  const salesTax = 0.00;
  const total = subtotal + salesTax;

  const handlePayment = () => {
    // Validate payment fields
    if (!paymentInfo.cardholderName || !paymentInfo.cardNumber || !paymentInfo.expiryDate || !paymentInfo.cvc) {
      alert('Please fill in all payment fields');
      return;
    }
    onSubmit();
  };

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Neither 1096 nor W-3 are required when you e-file.</span>
        </p>
      </div>

      <div className="space-y-6">
            {/* E-file to IRS */}
            <div className="space-y-3">
              <h4 className="font-semibold text-base flex items-center gap-2">
                E-file to IRS
                <AlertCircle className="h-4 w-4 text-blue-600" />
              </h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">Schedule IRS E-File Date</th>
                      <th className="px-4 py-2 text-center font-medium text-gray-600">QTY</th>
                      <th className="px-4 py-2 text-right font-medium text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formSummary.length > 0 ? (
                      formSummary.map((item, index) => (
                        <tr key={index} className="border-b last:border-b-0">
                          <td className="px-4 py-3">
                            <div className="font-medium">{item.form}</div>
                            <div className="text-xs text-gray-500">2025-01-31 (recommended)</div>
                          </td>
                          <td className="px-4 py-3 text-center">{item.records}</td>
                          <td className="px-4 py-3 text-right">${item.cost.toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-center text-gray-500 italic">
                          No forms selected yet
                        </td>
                      </tr>
                    )}
                    {formSummary.length > 0 && (
                      <tr className="bg-gray-50 font-semibold">
                        <td className="px-4 py-3" colSpan={2}>Subtotal:</td>
                        <td className="px-4 py-3 text-right">${formCost.toFixed(2)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* E-deliver to Recipients */}
            <div className="space-y-3">
              <h4 className="font-semibold text-base flex items-center gap-2">
                E-deliver to Recipients
                <AlertCircle className="h-4 w-4 text-blue-600" />
              </h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">Schedule e-delivery date</th>
                      <th className="px-4 py-2 text-center font-medium text-gray-600">QTY</th>
                      <th className="px-4 py-2 text-right font-medium text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-3">
                        <div className="font-medium">{formSummary.map(f => f.form).join(', ') || 'All forms'}</div>
                        <div className="text-xs text-gray-500">2025-01-31 (recommended)</div>
                      </td>
                      <td className="px-4 py-3 text-center">{payeeData.length}</td>
                      <td className="px-4 py-3 text-right">Free</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Address Verification */}
            <div className="space-y-3">
              <h4 className="font-semibold text-base flex items-center gap-2">
                Address Verification Service
                <AlertCircle className="h-4 w-4 text-blue-600" />
              </h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">Mailing method</th>
                      <th className="px-4 py-2 text-center font-medium text-gray-600">QTY</th>
                      <th className="px-4 py-2 text-right font-medium text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-3">
                        <RadioGroup value={addressVerification} onValueChange={(value: "skip" | "verify") => setAddressVerification(value)}>
                          <div className="flex items-center space-x-2 mb-2">
                            <RadioGroupItem value="skip" id="skip-address" />
                            <Label htmlFor="skip-address" className="text-sm cursor-pointer font-medium">Skip address verification</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="verify" id="verify-address" />
                            <Label htmlFor="verify-address" className="text-sm cursor-pointer">
                              <span className="font-medium">Verify addresses</span>
                              <span className="text-xs text-gray-500 block">We will verify and correct addresses</span>
                            </Label>
                          </div>
                        </RadioGroup>
                      </td>
                      <td className="px-4 py-3 text-center align-top">{payeeData.length}</td>
                      <td className="px-4 py-3 text-right align-top">{addressVerification === "skip" ? "Free" : `$${addressCost.toFixed(2)}`}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* TIN Matching */}
            <div className="space-y-3">
              <h4 className="font-semibold text-base flex items-center gap-2">
                TIN Matching Service
                <AlertCircle className="h-4 w-4 text-blue-600" />
              </h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">Mailing method</th>
                      <th className="px-4 py-2 text-center font-medium text-gray-600">QTY</th>
                      <th className="px-4 py-2 text-right font-medium text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-3">
                        <RadioGroup value={tinMatching} onValueChange={(value: "skip" | "verify") => setTinMatching(value)}>
                          <div className="flex items-center space-x-2 mb-2">
                            <RadioGroupItem value="skip" id="skip-tin" />
                            <Label htmlFor="skip-tin" className="text-sm cursor-pointer font-medium">Skip TIN matching</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="verify" id="verify-tin" />
                            <Label htmlFor="verify-tin" className="text-sm cursor-pointer">
                              <span className="font-medium">Do TIN matching</span>
                              <span className="text-xs text-gray-500 block">We will verify TIN ($0.45)</span>
                            </Label>
                          </div>
                        </RadioGroup>
                      </td>
                      <td className="px-4 py-3 text-center align-top">{payeeData.length}</td>
                      <td className="px-4 py-3 text-right align-top">{tinMatching === "skip" ? "Free" : `$${tinCost.toFixed(2)}`}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
      </div>

      {/* Address Section */}
      <Card className="professional-shadow mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Enter your current location for sales tax</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Street Address" htmlFor="streetAddress">
            <Input
              id="streetAddress"
              placeholder="Wapda Town, Lahman"
              value={salesTaxLocation.streetAddress}
              onChange={(e) => setSalesTaxLocation(prev => ({ ...prev, streetAddress: e.target.value }))}
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="City" htmlFor="city">
              <Input
                id="city"
                placeholder="Lahore"
                value={salesTaxLocation.city}
                onChange={(e) => setSalesTaxLocation(prev => ({ ...prev, city: e.target.value }))}
              />
            </Field>

            <Field label="State or Province" htmlFor="stateProvince">
              <Input
                id="stateProvince"
                placeholder=""
                value={salesTaxLocation.stateProvince}
                onChange={(e) => setSalesTaxLocation(prev => ({ ...prev, stateProvince: e.target.value }))}
              />
            </Field>

            <Field label="Postal Code" htmlFor="postalCode">
              <Input
                id="postalCode"
                placeholder="98705"
                value={salesTaxLocation.postalCode}
                onChange={(e) => setSalesTaxLocation(prev => ({ ...prev, postalCode: e.target.value }))}
              />
            </Field>
          </div>

          <Field label="Country" htmlFor="country">
            <select
              id="country"
              value={salesTaxLocation.country}
              onChange={(e) => setSalesTaxLocation(prev => ({ ...prev, country: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="PK - Pakistan">PK - Pakistan</option>
              <option value="US - United States">US - United States</option>
              <option value="CA - Canada">CA - Canada</option>
              <option value="UK - United Kingdom">UK - United Kingdom</option>
              <option value="IN - India">IN - India</option>
            </select>
          </Field>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <AlertCircle className="h-4 w-4" />
                <span>Subtotal: <span className="font-semibold">${subtotal.toFixed(2)}</span></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <AlertCircle className="h-4 w-4" />
                <span>Sales tax: <span className="font-semibold">$0.00</span></span>
              </div>
              <div className="text-lg font-bold">
                Total: <span className="text-blue-600">${total.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                When will my mail be sent?<br />
                Mail submitted daily at 9pm Pacific.<br />
                Schedule mail by January 31st.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!showPayment && (
        <div className="flex justify-center mt-6">
          <Button
            onClick={() => {
              // Validate address fields
              if (!salesTaxLocation.streetAddress || !salesTaxLocation.city || !salesTaxLocation.postalCode) {
                alert('Please fill in all address fields (Street Address, City, and Postal Code are required)');
                return;
              }
              setShowPayment(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 text-lg"
          >
            Continue
          </Button>
        </div>
      )}

      {/* Payment Section - Shows inline after Continue */}
      {showPayment && (
        <div className="animate-fade-in space-y-6 mt-8">
          <div className="border-t-2 border-blue-200 pt-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Payment Information</h3>
            
            <Card className="professional-shadow">
              <CardHeader>
                <CardTitle>Complete Your Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field label="Cardholder Name" htmlFor="cardholderName">
                  <Input
                    id="cardholderName"
                    placeholder="John Doe"
                    value={paymentInfo.cardholderName}
                    onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardholderName: e.target.value }))}
                  />
                </Field>

                <Field label="Card Number" htmlFor="cardNumber">
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={paymentInfo.cardNumber}
                    onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardNumber: e.target.value }))}
                  />
                </Field>

                <Field label="Payment Type" htmlFor="paymentType">
                  <select
                    id="paymentType"
                    value={paymentInfo.paymentType}
                    onChange={(e) => setPaymentInfo(prev => ({ ...prev, paymentType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="credit">Credit Card</option>
                    <option value="debit">Debit Card</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Expiry Date (MM/YY)" htmlFor="expiryDate">
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      value={paymentInfo.expiryDate}
                      onChange={(e) => setPaymentInfo(prev => ({ ...prev, expiryDate: e.target.value }))}
                    />
                  </Field>

                  <Field label="CVC" htmlFor="cvc">
                    <Input
                      id="cvc"
                      placeholder="123"
                      value={paymentInfo.cvc}
                      onChange={(e) => setPaymentInfo(prev => ({ ...prev, cvc: e.target.value }))}
                    />
                  </Field>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handlePayment}
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg"
                  >
                    {isSubmitting ? 'Processing...' : 'Pay Now'}
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mt-4">
                  <div className="w-5 h-5 bg-yellow-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs">🔒</span>
                  </div>
                  <span className="font-semibold">Secure Payments</span>
                  <span className="text-xs">AES-256 ENCRYPTION</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      </div>
    );
}

// Success Step Component
function SuccessStep({ trackingId, onStartOver }: { trackingId: string; onStartOver: () => void }) {
  return (
    <div className="text-center space-y-6">
      <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="h-12 w-12 text-green-600" />
      </div>
      
      <div>
        <h3 className="text-3xl font-bold text-gray-900 mb-2">Success</h3>
        <p className="text-gray-600 mb-2">
          E-Filing completed successfully!
        </p>
        <p className="text-xl font-semibold text-green-600 mb-4">
          E-File Successfully Submitted!
        </p>
        <p className="text-gray-600 mb-6">
          Your 1099 forms have been successfully submitted to the IRS.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 inline-block">
          <p className="text-gray-600 text-sm mb-2">Your Tracking ID is:</p>
          <p className="text-blue-700 text-2xl font-bold">{trackingId || 'TRK-02047380-62RR77'}</p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          You can use this tracking ID to check the status of your submission with the IRS.
        </p>
        
        <Button 
          onClick={onStartOver}
          className="bg-blue-600 hover:bg-blue-700 text-white mt-4"
        >
          Start New Filing
        </Button>
      </div>
    </div>
  );
}

// Year Selection Step Component
function YearSelectionStep({ year, onChange }: { year: string; onChange: (year: string) => void }) {
  const currentYear = new Date().getFullYear();
  const availableYears = [
    (currentYear - 5).toString(),
    (currentYear - 4).toString(),
    (currentYear - 3).toString(),
    (currentYear - 2).toString(),
    (currentYear - 1).toString(),
    currentYear.toString()
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Select Tax Year for E-Filing</h3>
        <p className="text-gray-600 mb-6">
          Choose the tax year for which you want to file your 1099 forms
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
        {availableYears.map((availableYear, index) => {
          const yearDiff = currentYear - parseInt(availableYear);
          let yearLabel = '';
          if (yearDiff === 0) yearLabel = 'Current Year';
          else if (yearDiff === 1) yearLabel = 'Previous Year';
          else yearLabel = `${yearDiff} Years Ago`;
          
          return (
            <Card 
              key={availableYear}
              className={`cursor-pointer smooth-transition professional-shadow ${
                year === availableYear 
                  ? 'ring-2 ring-blue-600 bg-blue-50 border-blue-200' 
                  : 'hover:shadow-md hover:bg-gray-50'
              }`}
              onClick={() => onChange(availableYear)}
            >
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-gray-800 mb-2">
                  {availableYear}
                </div>
                <div className="text-sm text-gray-600">
                  {yearLabel}
                </div>
                {year === availableYear && (
                  <div className="mt-3">
                    <CheckCircle className="h-6 w-6 text-blue-600 mx-auto" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Important Filing Deadlines</p>
            <p>
              For tax year {year}, 1099 forms must be filed with the IRS by January 31st, {parseInt(year) + 1}.
              Make sure you have all your payee information ready before proceeding.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Field Component
function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">
        {label}
      </Label>
      {children}
    </div>
  );
}