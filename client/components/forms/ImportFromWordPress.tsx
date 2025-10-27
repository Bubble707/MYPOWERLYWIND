/**
 * Import from WordPress Modal Component
 * Allows importing affiliate/vendor data from connected WordPress sites
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ExternalLink, 
  Shield,
  Search,
  Download,
  XCircle
} from 'lucide-react';
import {
  WordPressConnection,
  WordPressAffiliate,
  WordPressConnectionTestResponse,
  WordPressImportResponse,
  WordPressAffiliatesListResponse,
} from '@shared/api';

interface ImportFromWordPressProps {
  open: boolean;
  onClose: () => void;
  targetFormType: 'w9' | '1099';
  onImportComplete?: (result: WordPressImportResponse) => void;
}

export function ImportFromWordPress({
  open,
  onClose,
  targetFormType,
  onImportComplete,
}: ImportFromWordPressProps) {
  // Connection state
  const [hostname, setHostname] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [authType, setAuthType] = useState<'api_key' | 'oauth' | 'none'>('api_key');
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connected' | 'error'>('disconnected');
  const [connectionMessage, setConnectionMessage] = useState('');
  const [detectedPlugin, setDetectedPlugin] = useState<string>();
  
  // Affiliates state
  const [affiliates, setAffiliates] = useState<WordPressAffiliate[]>([]);
  const [selectedAffiliateIds, setSelectedAffiliateIds] = useState<Set<string | number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalAffiliates, setTotalAffiliates] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  
  // Import options
  const [importSensitiveFields, setImportSensitiveFields] = useState(false);
  
  // UI state
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isFetchingAffiliates, setIsFetchingAffiliates] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<WordPressImportResponse | null>(null);
  const [currentStep, setCurrentStep] = useState<'connection' | 'selection' | 'result'>('connection');
  
  // Test mode
  const [testMode, setTestMode] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setCurrentStep('connection');
      setImportResult(null);
      setSelectedAffiliateIds(new Set());
      setSearchQuery('');
    }
  }, [open]);

  /**
   * Load mock test data
   */
  const loadTestData = () => {
    const mockAffiliates: WordPressAffiliate[] = [
      {
        id: 1,
        email: 'john.doe@example.com',
        displayName: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        companyName: 'Acme Corp',
        paymentMethod: 'PayPal',
        lastPayoutAmount: 500.00,
        totalEarnings: 5000.00,
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'US',
        wpUserId: 101,
        meta: { tax_classification: 'individual' },
      },
      {
        id: 2,
        email: 'jane.smith@example.com',
        displayName: 'Jane Smith',
        firstName: 'Jane',
        lastName: 'Smith',
        companyName: 'Tech Solutions LLC',
        paymentMethod: 'Bank Transfer',
        lastPayoutAmount: 750.00,
        totalEarnings: 8500.00,
        address: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zip: '90001',
        country: 'US',
        wpUserId: 102,
        meta: { tax_classification: 'llc' },
      },
      {
        id: 3,
        email: 'bob.johnson@example.com',
        displayName: 'Bob Johnson',
        firstName: 'Bob',
        lastName: 'Johnson',
        paymentMethod: 'PayPal',
        lastPayoutAmount: 300.00,
        totalEarnings: 3200.00,
        address: '789 Pine Rd',
        city: 'Chicago',
        state: 'IL',
        zip: '60601',
        country: 'US',
        wpUserId: 103,
        meta: { tax_classification: 'individual' },
      },
    ];
    
    setAffiliates(mockAffiliates);
    setTotalAffiliates(mockAffiliates.length);
    setHasMore(false);
    setConnectionStatus('connected');
    setConnectionMessage('Connected to test WordPress site');
    setDetectedPlugin('Test Mode');
    setCurrentStep('selection');
  };

  /**
   * Test WordPress connection
   */
  const handleTestConnection = async () => {
    // Test mode bypass
    if (testMode) {
      loadTestData();
      return;
    }
    if (!hostname) {
      setConnectionStatus('error');
      setConnectionMessage('Hostname is required');
      return;
    }

    if (!hostname.startsWith('https://')) {
      setConnectionStatus('error');
      setConnectionMessage('WordPress site must use HTTPS');
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus('disconnected');
    setConnectionMessage('');

    try {
      const response = await fetch('/api/wordpress/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostname,
          apiKey: authType === 'api_key' ? apiKey : undefined,
          authType,
        }),
      });

      const result: WordPressConnectionTestResponse = await response.json();

      if (result.success) {
        setConnectionStatus('connected');
        setConnectionMessage(result.message);
        setDetectedPlugin(result.detectedPlugin);
        
        // Automatically fetch affiliates on successful connection
        fetchAffiliates();
      } else {
        setConnectionStatus('error');
        setConnectionMessage(result.message);
      }
    } catch (error) {
      setConnectionStatus('error');
      setConnectionMessage('Connection failed: Network error');
    } finally {
      setIsTestingConnection(false);
    }
  };

  /**
   * Fetch affiliates from WordPress
   */
  const fetchAffiliates = async (page: number = 1) => {
    setIsFetchingAffiliates(true);

    try {
      const connection: WordPressConnection = {
        hostname,
        apiKey: authType === 'api_key' ? apiKey : undefined,
        authType,
        status: 'connected',
        plugin: detectedPlugin as any,
      };

      const response = await fetch('/api/wordpress/fetch-affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connection,
          page,
          perPage: 50,
        }),
      });

      const result = await response.json();

      if (result.success) {
        const data: WordPressAffiliatesListResponse = result.data;
        setAffiliates(data.affiliates);
        setTotalAffiliates(data.total);
        setHasMore(data.hasMore);
        setCurrentPage(page);
        setCurrentStep('selection');
      } else {
        setConnectionStatus('error');
        setConnectionMessage(result.error || 'Failed to fetch affiliates');
      }
    } catch (error) {
      setConnectionStatus('error');
      setConnectionMessage('Failed to fetch affiliates: Network error');
    } finally {
      setIsFetchingAffiliates(false);
    }
  };

  /**
   * Handle affiliate selection
   */
  const toggleAffiliateSelection = (id: string | number) => {
    const newSet = new Set(selectedAffiliateIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedAffiliateIds(newSet);
  };

  const selectAllAffiliates = () => {
    const allIds = new Set(affiliates.map((a) => a.id));
    setSelectedAffiliateIds(allIds);
  };

  const deselectAllAffiliates = () => {
    setSelectedAffiliateIds(new Set());
  };

  /**
   * Import selected affiliates
   */
  const handleImport = async () => {
    if (selectedAffiliateIds.size === 0) {
      return;
    }

    setIsImporting(true);
    
    // Test mode bypass
    if (testMode) {
      setTimeout(() => {
        setImportResult({
          success: true,
          importedCount: selectedAffiliateIds.size,
          skippedCount: 0,
          errors: [],
          importedVendorIds: Array.from(selectedAffiliateIds).map(id => `vendor_${id}`),
          auditLogId: 'test_audit_' + Date.now(),
        });
        setCurrentStep('result');
        setIsImporting(false);
        
        if (onImportComplete) {
          onImportComplete({
            success: true,
            importedCount: selectedAffiliateIds.size,
            skippedCount: 0,
            errors: [],
            importedVendorIds: Array.from(selectedAffiliateIds).map(id => `vendor_${id}`),
          });
        }
      }, 1500);
      return;
    }

    try {
      const connection: WordPressConnection = {
        hostname,
        apiKey: authType === 'api_key' ? apiKey : undefined,
        authType,
        status: 'connected',
        plugin: detectedPlugin as any,
      };

      const response = await fetch('/api/wordpress/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wpConnection: connection,
          affiliateIds: Array.from(selectedAffiliateIds),
          importSensitiveFields,
          targetFormType,
        }),
      });

      const result: WordPressImportResponse = await response.json();
      setImportResult(result);
      setCurrentStep('result');

      if (onImportComplete) {
        onImportComplete(result);
      }
    } catch (error) {
      setImportResult({
        success: false,
        importedCount: 0,
        skippedCount: selectedAffiliateIds.size,
        errors: [
          {
            affiliateId: '',
            error: 'Import failed: Network error',
            code: 'network',
          },
        ],
        importedVendorIds: [],
      });
      setCurrentStep('result');
    } finally {
      setIsImporting(false);
    }
  };

  /**
   * Filter affiliates by search query
   */
  const filteredAffiliates = affiliates.filter((affiliate) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      affiliate.displayName.toLowerCase().includes(query) ||
      affiliate.email.toLowerCase().includes(query) ||
      affiliate.companyName?.toLowerCase().includes(query)
    );
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-600" />
            Import from WordPress
            {testMode && <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-700 border-yellow-300">Test Mode</Badge>}
          </DialogTitle>
          <DialogDescription>
            Connect to your WordPress site and import affiliate data for {targetFormType === 'w9' ? 'W-9' : '1099'} forms
          </DialogDescription>
        </DialogHeader>
        
        {/* Test Mode Toggle */}
        <div className="flex items-center justify-end gap-2 px-6 py-2 bg-gray-50 border-b">
          <Label htmlFor="test-mode" className="text-sm text-gray-600 cursor-pointer">
            Test Mode (No validation, mock data)
          </Label>
          <Checkbox
            id="test-mode"
            checked={testMode}
            onCheckedChange={(checked) => setTestMode(!!checked)}
          />
        </div>

        {/* Connection Step */}
        {currentStep === 'connection' && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="hostname">WordPress Site URL</Label>
              <Input
                id="hostname"
                placeholder="https://example.com"
                value={hostname}
                onChange={(e) => setHostname(e.target.value)}
                disabled={isTestingConnection}
              />
              <p className="text-xs text-gray-500">Must use HTTPS</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="authType">Authentication Type</Label>
              <Select value={authType} onValueChange={(value: any) => setAuthType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="api_key">API Key</SelectItem>
                  <SelectItem value="oauth">OAuth 2.0</SelectItem>
                  <SelectItem value="none">None (Public API)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {authType === 'api_key' && (
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your WordPress API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  disabled={isTestingConnection}
                />
              </div>
            )}

            {/* Connection Status */}
            {connectionStatus !== 'disconnected' && (
              <Alert className={connectionStatus === 'connected' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                {connectionStatus === 'connected' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={connectionStatus === 'connected' ? 'text-green-800' : 'text-red-800'}>
                  {connectionMessage}
                  {detectedPlugin && (
                    <div className="mt-1">
                      <Badge variant="outline" className="text-xs">
                        Plugin: {detectedPlugin}
                      </Badge>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Security:</strong> Your API key is transmitted securely via HTTPS and is not stored on our servers.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Selection Step */}
        {currentStep === 'selection' && (
          <div className="space-y-4 py-4 flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {totalAffiliates} total affiliate{totalAffiliates !== 1 ? 's' : ''}
                </Badge>
                <Badge variant="outline" className="bg-blue-50">
                  {selectedAffiliateIds.size} selected
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllAffiliates}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAllAffiliates}>
                  Deselect All
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Sensitive Fields Option */}
            <div className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <Checkbox
                id="import-sensitive"
                checked={importSensitiveFields}
                onCheckedChange={(checked) => setImportSensitiveFields(!!checked)}
              />
              <div className="space-y-1">
                <Label htmlFor="import-sensitive" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                  <Shield className="h-4 w-4 text-yellow-600" />
                  Import sensitive fields (SSN/FEIN)
                </Label>
                <p className="text-xs text-yellow-800">
                  Only enable if the WordPress site supports it and you have explicit permission. Data will be encrypted at rest.
                </p>
              </div>
            </div>

            {/* Affiliates List */}
            <ScrollArea className="flex-1 border rounded-lg">
              {isFetchingAffiliates ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : filteredAffiliates.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mb-2 text-gray-400" />
                  <p>No affiliates found</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredAffiliates.map((affiliate) => (
                    <div
                      key={affiliate.id}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => toggleAffiliateSelection(affiliate.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedAffiliateIds.has(affiliate.id)}
                          onCheckedChange={() => toggleAffiliateSelection(affiliate.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{affiliate.displayName}</p>
                            {affiliate.companyName && (
                              <Badge variant="outline" className="text-xs">
                                {affiliate.companyName}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{affiliate.email}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            {affiliate.paymentMethod && (
                              <span>Payment: {affiliate.paymentMethod}</span>
                            )}
                            {affiliate.lastPayoutAmount !== undefined && (
                              <span>Last Payout: ${affiliate.lastPayoutAmount.toFixed(2)}</span>
                            )}
                            {affiliate.totalEarnings !== undefined && (
                              <span>Total: ${affiliate.totalEarnings.toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        )}

        {/* Result Step */}
        {currentStep === 'result' && importResult && (
          <div className="space-y-4 py-4">
            <Alert className={importResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
              {importResult.success ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={importResult.success ? 'text-green-800' : 'text-red-800'}>
                <strong>Import {importResult.success ? 'Completed' : 'Failed'}</strong>
                <div className="mt-2 space-y-1">
                  <p>Imported: {importResult.importedCount}</p>
                  <p>Skipped: {importResult.skippedCount}</p>
                  {importResult.auditLogId && (
                    <p className="text-xs">Audit Log ID: {importResult.auditLogId}</p>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            {/* Errors */}
            {importResult.errors.length > 0 && (
              <div className="space-y-2">
                <Label className="text-red-600">Errors ({importResult.errors.length}):</Label>
                <ScrollArea className="max-h-48 border rounded-lg p-3 bg-red-50">
                  <div className="space-y-2">
                    {importResult.errors.map((error, idx) => (
                      <div key={idx} className="text-sm text-red-800">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4" />
                          <span className="font-medium">
                            {error.affiliateEmail || `ID: ${error.affiliateId}`}
                          </span>
                        </div>
                        <p className="ml-6 text-xs">{error.error}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {currentStep === 'connection' && (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleTestConnection} disabled={isTestingConnection}>
                {isTestingConnection && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Test Connection
              </Button>
            </>
          )}

          {currentStep === 'selection' && (
            <>
              <Button variant="outline" onClick={() => setCurrentStep('connection')}>
                Back
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={selectedAffiliateIds.size === 0 || isImporting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Import {selectedAffiliateIds.size} Affiliate{selectedAffiliateIds.size !== 1 ? 's' : ''}
              </Button>
            </>
          )}

          {currentStep === 'result' && (
            <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
