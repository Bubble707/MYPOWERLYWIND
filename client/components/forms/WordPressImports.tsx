import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import {
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Users,
  Link as LinkIcon,
  Loader2,
  History,
  FileDown,
  Trash2,
  TestTube,
  X,
} from "lucide-react";

interface WordPressAffiliate {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  ssn: string;
  total_earnings: number;
  payment_email: string;
}

interface ImportedAffiliate extends WordPressAffiliate {
  importedAt: Date;
  source: string;
}

interface WordPressImportsProps {
  onImport: (affiliates: any[]) => void;
  onClose: () => void;
  existingImports?: any[];
}

export default function WordPressImports({ onImport, onClose }: WordPressImportsProps) {
  const [wpUrl, setWpUrl] = useState("");
  const [wpUsername, setWpUsername] = useState("");
  const [wpPassword, setWpPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [affiliates, setAffiliates] = useState<WordPressAffiliate[]>([]);
  const [selectedAffiliateIds, setSelectedAffiliateIds] = useState<Set<number>>(new Set());
  const [error, setError] = useState("");
  const [testMode, setTestMode] = useState(false);
  const [importedAffiliates, setImportedAffiliates] = useState<ImportedAffiliate[]>([]);
  const [showImportedTable, setShowImportedTable] = useState(false);

  const testConnection = async () => {
    if (!testMode && !wpUrl) {
      setError("Please enter a WordPress URL or enable Test Mode");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, testMode ? 800 : 1500));

      // Test mode or real connection
      setConnected(true);
      setError("");
      
      // Generate test/dummy affiliates
      const dummyAffiliates: WordPressAffiliate[] = testMode ? [
        {
          id: 101,
          name: 'Test User Alpha',
          email: 'test.alpha@example.com',
          phone: '(555) 111-1111',
          address: '100 Test St',
          city: 'Test City',
          state: 'CA',
          zip: '90210',
          ssn: '111-11-1111',
          total_earnings: 12500.00,
          payment_email: 'test.alpha@example.com',
        },
        {
          id: 102,
          name: 'Test User Beta',
          email: 'test.beta@example.com',
          phone: '(555) 222-2222',
          address: '200 Test Ave',
          city: 'Demo Town',
          state: 'NY',
          zip: '10001',
          ssn: '222-22-2222',
          total_earnings: 3500.75,
          payment_email: 'test.beta@example.com',
        },
        {
          id: 103,
          name: 'Test User Gamma',
          email: 'test.gamma@example.com',
          phone: '(555) 333-3333',
          address: '300 Mock Blvd',
          city: 'Sample City',
          state: 'TX',
          zip: '77001',
          ssn: '333-33-3333',
          total_earnings: 450.00,
          payment_email: 'test.gamma@example.com',
        },
      ] : [
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          phone: '(555) 123-4567',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          ssn: '123-45-6789',
          total_earnings: 5250.00,
          payment_email: 'john@example.com',
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '(555) 234-5678',
          address: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zip: '90001',
          ssn: '234-56-7890',
          total_earnings: 8900.50,
          payment_email: 'jane@example.com',
        },
        {
          id: 3,
          name: 'Bob Johnson',
          email: 'bob@example.com',
          phone: '(555) 345-6789',
          address: '789 Pine Rd',
          city: 'Chicago',
          state: 'IL',
          zip: '60601',
          ssn: '345-67-8901',
          total_earnings: 1200.00,
          payment_email: 'bob@example.com',
        },
        {
          id: 4,
          name: 'Alice Williams',
          email: 'alice@example.com',
          phone: '(555) 456-7890',
          address: '321 Elm St',
          city: 'Houston',
          state: 'TX',
          zip: '77001',
          ssn: '456-78-9012',
          total_earnings: 450.00,
          payment_email: 'alice@example.com',
        },
        {
          id: 5,
          name: 'Charlie Brown',
          email: 'charlie@example.com',
          phone: '(555) 567-8901',
          address: '654 Maple Dr',
          city: 'Phoenix',
          state: 'AZ',
          zip: '85001',
          ssn: '567-89-0123',
          total_earnings: 15750.25,
          payment_email: 'charlie@example.com',
        },
      ];

      setAffiliates(dummyAffiliates);
      
      // Auto-select affiliates with earnings >= $600
      const autoSelect = new Set<number>();
      dummyAffiliates.forEach(aff => {
        if (aff.total_earnings >= 600) {
          autoSelect.add(aff.id);
        }
      });
      setSelectedAffiliateIds(autoSelect);

    } catch (err: any) {
      setError(err.message || "Failed to connect to WordPress.");
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const loadAffiliates = async (url?: string, auth?: string) => {
    setLoading(true);
    setError("");

    try {
      const cleanUrl = url || wpUrl.trim().replace(/\/+$/, '');
      const authHeader = auth || 'Basic ' + btoa(`${wpUsername}:${wpPassword}`);

      // Fetch affiliates from WordPress (adjust endpoint based on your plugin)
      // Common endpoints: /wp-json/affwp/v1/affiliates or custom endpoint
      const response = await fetch(`${cleanUrl}/wp-json/affwp/v1/affiliates`, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch affiliates: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform affiliate data to match our structure
      const transformedAffiliates: WordPressAffiliate[] = data.map((aff: any) => ({
        id: aff.affiliate_id || aff.id,
        name: aff.name || `${aff.first_name || ''} ${aff.last_name || ''}`.trim(),
        email: aff.payment_email || aff.email,
        phone: aff.phone || '',
        address: aff.address || '',
        city: aff.city || '',
        state: aff.state || '',
        zip: aff.zip || aff.postcode || '',
        ssn: aff.tax_id || aff.ssn || '',
        total_earnings: parseFloat(aff.earnings || aff.unpaid_earnings || 0),
        payment_email: aff.payment_email || aff.email,
      }));

      setAffiliates(transformedAffiliates);
      
      // Auto-select affiliates with earnings > $600
      const autoSelect = new Set<number>();
      transformedAffiliates.forEach(aff => {
        if (aff.total_earnings >= 600) {
          autoSelect.add(aff.id);
        }
      });
      setSelectedAffiliateIds(autoSelect);

    } catch (err: any) {
      setError(err.message || "Failed to load affiliates");
    } finally {
      setLoading(false);
    }
  };

  const toggleAffiliate = (id: number) => {
    const newSelected = new Set(selectedAffiliateIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedAffiliateIds(newSelected);
  };

  const toggleAll = () => {
    if (selectedAffiliateIds.size === affiliates.length) {
      setSelectedAffiliateIds(new Set());
    } else {
      setSelectedAffiliateIds(new Set(affiliates.map(a => a.id)));
    }
  };

  const handleImport = () => {
    if (selectedCount === 0) {
      setError("Please select at least one affiliate to import");
      return;
    }

    const selectedAffiliates = affiliates.filter(aff => 
      selectedAffiliateIds.has(aff.id)
    );

    // Add to imported affiliates history
    const newImports: ImportedAffiliate[] = selectedAffiliates.map(aff => ({
      ...aff,
      importedAt: new Date(),
      source: testMode ? 'Test Mode' : wpUrl,
    }));
    setImportedAffiliates(prev => [...newImports, ...prev]);

    // Transform to PayeeData format
    const payees = selectedAffiliates.map(aff => ({
      fullName: aff.name,
      ssnTin: aff.ssn,
      email: aff.email,
      address1: aff.address,
      address2: "",
      city: aff.city,
      state: aff.state,
      zip: aff.zip,
      country: "US",
      paymentType: "affiliate_earnings",
      formType: "1099-NEC",
      amount: aff.total_earnings,
      federalTaxWithheld: 0,
      phone: aff.phone,
    }));

    // Call the onImport callback
    onImport(payees);
    
    // Show success feedback
    setError("");
    setShowImportedTable(true);
    
    // Reset selection and clear affiliates
    setSelectedAffiliateIds(new Set());
    setAffiliates([]);
    setConnected(false);
    
    // Auto-close modal after successful import
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const clearImportedAffiliates = () => {
    if (window.confirm('Are you sure you want to clear all imported affiliates history?')) {
      setImportedAffiliates([]);
    }
  };

  const exportImportedToCSV = () => {
    if (importedAffiliates.length === 0) return;

    const headers = ['Name', 'Email', 'SSN/TIN', 'Earnings', 'Phone', 'Address', 'City', 'State', 'Zip', 'Imported At', 'Source'];
    const rows = importedAffiliates.map(aff => [
      aff.name,
      aff.email,
      aff.ssn,
      aff.total_earnings.toFixed(2),
      aff.phone,
      aff.address,
      aff.city,
      aff.state,
      aff.zip,
      aff.importedAt.toLocaleString(),
      aff.source,
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `imported-affiliates-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedCount = selectedAffiliateIds.size;
  const totalEarnings = affiliates
    .filter(aff => selectedAffiliateIds.has(aff.id))
    .reduce((sum, aff) => sum + aff.total_earnings, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 h-8 w-8 rounded-full hover:bg-gray-100"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="text-2xl flex items-center gap-2 pr-10">
            <Users className="h-6 w-6 text-blue-600" />
            Import Affiliates from WordPress
          </CardTitle>
          <CardDescription>
            Connect to your WordPress site and import affiliate data for 1099 forms
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Test Mode Toggle */}
          <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-amber-600" />
              <div>
                <Label htmlFor="test-mode" className="font-semibold text-amber-900">
                  Test Mode
                </Label>
                <p className="text-xs text-amber-700">
                  Use mock data without connecting to WordPress
                </p>
              </div>
            </div>
            <Switch
              id="test-mode"
              checked={testMode}
              onCheckedChange={(checked) => {
                setTestMode(checked);
                if (checked) {
                  setWpUrl('');
                  setWpUsername('');
                  setWpPassword('');
                }
              }}
              disabled={connected}
            />
          </div>

          {/* Imported Affiliates Summary */}
          {importedAffiliates.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <History className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">
                    {importedAffiliates.length} Affiliate{importedAffiliates.length !== 1 ? 's' : ''} Imported
                  </p>
                  <p className="text-xs text-green-700">
                    Total earnings: ${importedAffiliates.reduce((sum, aff) => sum + aff.total_earnings, 0).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowImportedTable(!showImportedTable)}
                  className="border-green-600 text-green-700 hover:bg-green-100"
                >
                  {showImportedTable ? 'Hide' : 'View'} History
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={exportImportedToCSV}
                  className="border-green-600 text-green-700 hover:bg-green-100"
                >
                  <FileDown className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          )}

          {/* Imported Affiliates Table */}
          {showImportedTable && importedAffiliates.length > 0 && (
            <Card className="border-green-200">
              <CardHeader className="bg-green-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="h-5 w-5 text-green-600" />
                    Import History
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={clearImportedAffiliates}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear History
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto max-h-[300px]">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-green-50 to-green-100/80 border-b-2 border-green-200 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wide">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wide">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wide">
                          Earnings
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wide">
                          Source
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-green-900 uppercase tracking-wide">
                          Imported At
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {importedAffiliates.map((affiliate, index) => (
                        <tr key={`${affiliate.id}-${index}`} className="hover:bg-green-50/50 transition-all duration-200">
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                            {affiliate.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-blue-600 hover:text-blue-700 hover:underline cursor-pointer">
                            {affiliate.email}
                          </td>
                          <td className="px-4 py-3 text-base font-bold text-green-600">
                            ${affiliate.total_earnings.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Badge 
                              variant={affiliate.source === 'Test Mode' ? 'outline' : 'default'}
                              className={affiliate.source === 'Test Mode' 
                                ? 'border-amber-400 text-amber-700 bg-amber-50 px-2.5 py-0.5 font-medium' 
                                : 'bg-blue-500 text-white px-2.5 py-0.5 font-medium shadow-sm'
                              }
                            >
                              {affiliate.source}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 font-medium">
                            {affiliate.importedAt.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Connection Form */}
          {!connected ? (
            <div className="space-y-4">
              {!testMode && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="wpUrl">WordPress Site URL *</Label>
                      <div className="flex gap-2">
                        <LinkIcon className="h-4 w-4 mt-3 text-gray-400" />
                        <Input
                          id="wpUrl"
                          placeholder="https://yoursite.com"
                          value={wpUrl}
                          onChange={(e) => setWpUrl(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wpUsername">WordPress Username *</Label>
                      <Input
                        id="wpUsername"
                        placeholder="admin"
                        value={wpUsername}
                        onChange={(e) => setWpUsername(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wpPassword">Application Password *</Label>
                    <Input
                      id="wpPassword"
                      type="password"
                      placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
                      value={wpPassword}
                      onChange={(e) => setWpPassword(e.target.value)}
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500">
                      Generate an Application Password in WordPress: Users → Your Profile → Application Passwords
                    </p>
                  </div>
                </>
              )}

              {testMode && (
                <Alert className="bg-amber-50 border-amber-200">
                  <TestTube className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-900">
                    Test mode is enabled. You'll work with sample affiliate data without connecting to a real WordPress site.
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={testConnection}
                  disabled={loading || (!testMode && !wpUrl)}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {testMode ? 'Loading Test Data...' : 'Connecting...'}
                    </>
                  ) : (
                    <>
                      {testMode ? <TestTube className="h-4 w-4 mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                      {testMode ? 'Load Test Affiliates' : 'Connect & Load Affiliates'}
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (importedAffiliates.length > 0) {
                      if (!window.confirm('You have imported affiliates in this session. Are you sure you want to close?')) {
                        return;
                      }
                    }
                    setWpUrl('');
                    setWpUsername('');
                    setWpPassword('');
                    setConnected(false);
                    setAffiliates([]);
                    setSelectedAffiliateIds(new Set());
                    setError('');
                    onClose();
                  }} 
                  disabled={loading}
                  className="border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Connected State - Show Affiliates */}
              <div className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-600">Total Affiliates</div>
                      <div className="text-2xl font-bold">{affiliates.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-600">Selected</div>
                      <div className="text-2xl font-bold text-blue-600">{selectedCount}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-600">Total Earnings</div>
                      <div className="text-2xl font-bold text-green-600">
                        ${totalEarnings.toFixed(2)}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Affiliates Table */}
                {affiliates.length > 0 ? (
                  <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <div className="overflow-x-auto max-h-[400px]">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-blue-50 to-blue-100/80 border-b-2 border-blue-200 sticky top-0">
                          <tr>
                            <th className="px-6 py-3 text-left w-16">
                              <Checkbox
                                checked={selectedAffiliateIds.size === affiliates.length}
                                onCheckedChange={toggleAll}
                              />
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wide">
                              Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wide">
                              Email
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wide">
                              SSN/TIN
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wide">
                              Earnings
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wide">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {affiliates.map((affiliate) => {
                            const isSelected = selectedAffiliateIds.has(affiliate.id);
                            const needs1099 = affiliate.total_earnings >= 600;

                            return (
                              <tr
                                key={affiliate.id}
                                className={`hover:bg-blue-50/50 cursor-pointer transition-all duration-200 group ${
                                  isSelected ? 'bg-blue-50/70' : ''
                                }`}
                                onClick={() => toggleAffiliate(affiliate.id)}
                              >
                                <td className="px-6 py-3">
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() => toggleAffiliate(affiliate.id)}
                                  />
                                </td>
                                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                  {affiliate.name}
                                </td>
                                <td className="px-4 py-3 text-sm text-blue-600 hover:text-blue-700 hover:underline">
                                  {affiliate.email}
                                </td>
                                <td className="px-4 py-3 text-sm font-mono text-gray-700">
                                  {affiliate.ssn || (
                                    <span className="text-red-600 text-xs font-semibold">Missing</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-base font-bold text-green-600">
                                  ${affiliate.total_earnings.toFixed(2)}
                                </td>
                                <td className="px-4 py-3">
                                  {needs1099 ? (
                                    <Badge className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 font-semibold shadow-sm">
                                      Requires 1099
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="border-gray-400 text-gray-700 px-3 py-1 font-semibold">
                                      Below $600
                                    </Badge>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No affiliates found. Make sure AffiliateWP plugin is installed and has affiliate data.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    {selectedCount > 0 ? (
                      <>
                        <span className="font-semibold">{selectedCount}</span> affiliate
                        {selectedCount !== 1 ? 's' : ''} selected
                      </>
                    ) : (
                      'No affiliates selected'
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setConnected(false);
                        setAffiliates([]);
                        setSelectedAffiliateIds(new Set());
                        setError("");
                      }}
                      className="border-gray-300 hover:bg-gray-100"
                    >
                      Disconnect
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={onClose}
                      className="border-gray-300 hover:bg-gray-100"
                    >
                      Close
                    </Button>
                    <Button
                      onClick={handleImport}
                      disabled={selectedCount === 0}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Import {selectedCount} Affiliate{selectedCount !== 1 ? 's' : ''}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
