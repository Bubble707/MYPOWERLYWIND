import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PayeeData } from "@shared/api";
import { Upload, CheckCircle, XCircle, AlertTriangle, RefreshCw, FileText, Info, Download, FileDown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TinMatchValidationProps {
  payeeData: PayeeData[];
  onValidate: (results: TinValidationResult[]) => void;
  onSkip?: () => void;
}

export interface TinValidationResult {
  payeeIndex: number;
  payeeName: string;
  tinNumber: string;
  status: 'validated' | 'not-validated' | 'error' | 'pending';
  message?: string;
  validatedDate?: string;
}

export function TinMatchValidation({ payeeData, onValidate, onSkip }: TinMatchValidationProps) {
  const [validationResults, setValidationResults] = useState<TinValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<number[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadedTins, setUploadedTins] = useState<Array<{tin: string, name?: string}>>([]);
  const [manualTin, setManualTin] = useState('');
  const [manualName, setManualName] = useState('');

  // Get recipients that have TIN numbers
  const recipientsWithTin = payeeData.filter(p => p.ssnTin && p.ssnTin.trim() !== '');

  const handleValidateAll = async () => {
    setIsValidating(true);
    
    // Simulate API call to IRS TIN matching service
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const results: TinValidationResult[] = recipientsWithTin.map((payee, index) => {
      // Simulate validation results (in production, this would call actual IRS API)
      const random = Math.random();
      let status: 'validated' | 'not-validated' | 'error' = 'validated';
      let message = 'TIN matches IRS records';
      
      if (random < 0.15) {
        status = 'not-validated';
        message = 'TIN does not match IRS records';
      } else if (random < 0.25) {
        status = 'error';
        message = 'Unable to validate - IRS service temporarily unavailable';
      }
      
      return {
        payeeIndex: payeeData.indexOf(payee),
        payeeName: payee.fullName,
        tinNumber: payee.ssnTin,
        status,
        message,
        validatedDate: new Date().toLocaleDateString('en-US')
      };
    });
    
    setValidationResults(results);
    onValidate(results);
    setIsValidating(false);
  };

  const handleValidateSelected = async () => {
    if (selectedRecipients.length === 0) {
      alert('Please select recipients to validate');
      return;
    }
    
    setIsValidating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const results: TinValidationResult[] = selectedRecipients.map(index => {
      const payee = payeeData[index];
      const random = Math.random();
      
      return {
        payeeIndex: index,
        payeeName: payee.fullName,
        tinNumber: payee.ssnTin,
        status: random < 0.2 ? 'not-validated' : 'validated',
        message: random < 0.2 ? 'TIN does not match IRS records' : 'TIN matches IRS records',
        validatedDate: new Date().toLocaleDateString('en-US')
      };
    });
    
    setValidationResults(prev => {
      const updated = [...prev];
      results.forEach(result => {
        const existingIndex = updated.findIndex(r => r.payeeIndex === result.payeeIndex);
        if (existingIndex >= 0) {
          updated[existingIndex] = result;
        } else {
          updated.push(result);
        }
      });
      return updated;
    });
    
    onValidate(results);
    setIsValidating(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      // Parse TIN file - Expected format: TIN,Name or just TIN per line
      const tins: Array<{tin: string, name?: string}> = [];
      lines.forEach(line => {
        const parts = line.split(',').map(p => p.trim());
        if (parts[0]) {
          tins.push({
            tin: parts[0].replace(/[^0-9]/g, ''), // Remove non-numeric
            name: parts[1] || undefined
          });
        }
      });

      if (tins.length > 0) {
        setUploadedTins(tins);
        setShowUploadDialog(true);
        
        // Auto-validate uploaded TINs
        setIsValidating(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const results: TinValidationResult[] = tins.map((tin, index) => {
          const random = Math.random();
          return {
            payeeIndex: -1, // Not linked to existing payee
            payeeName: tin.name || `TIN Entry ${index + 1}`,
            tinNumber: tin.tin,
            status: random < 0.15 ? 'not-validated' : 'validated',
            message: random < 0.15 ? 'TIN does not match IRS records' : 'TIN matches IRS records',
            validatedDate: new Date().toLocaleDateString('en-US')
          };
        });
        
        setValidationResults(prev => [...results, ...prev]);
        onValidate(results);
        setIsValidating(false);
        alert(`Successfully validated ${tins.length} TIN(s) from file`);
      } else {
        alert('No valid TINs found in file');
      }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const handleManualValidation = async () => {
    if (!manualTin.trim()) {
      alert('Please enter a TIN number');
      return;
    }

    setIsValidating(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const random = Math.random();
    const result: TinValidationResult = {
      payeeIndex: -1,
      payeeName: manualName.trim() || 'Manual Entry',
      tinNumber: manualTin.trim(),
      status: random < 0.2 ? 'not-validated' : 'validated',
      message: random < 0.2 ? 'TIN does not match IRS records' : 'TIN matches IRS records',
      validatedDate: new Date().toLocaleDateString('en-US')
    };
    
    setValidationResults(prev => [result, ...prev]);
    onValidate([result]);
    setIsValidating(false);
    setManualTin('');
    setManualName('');
    alert('TIN validated successfully');
  };

  const toggleRecipientSelection = (index: number) => {
    setSelectedRecipients(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const downloadTinMatchFile = (type: 'all' | 'selected') => {
    let dataToDownload: TinValidationResult[] = [];
    
    if (type === 'all') {
      dataToDownload = validationResults;
    } else {
      dataToDownload = validationResults.filter((_, idx) => 
        selectedRecipients.includes(idx) || validationResults[idx].payeeIndex === -1
      );
    }
    
    if (dataToDownload.length === 0) {
      alert('No data to download');
      return;
    }
    
    // Create CSV content
    const headers = 'Name,TIN/SSN,Status,Message,Validated Date\n';
    const rows = dataToDownload.map(result => 
      `"${result.payeeName}","${result.tinNumber}","${result.status}","${result.message || ''}","${result.validatedDate || ''}"`
    ).join('\n');
    
    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tin_match_results_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    alert(`Downloaded ${dataToDownload.length} TIN validation record(s)`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'validated':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Validated
          </Badge>
        );
      case 'not-validated':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Not Validated
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-300 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-gray-600">
            Pending
          </Badge>
        );
    }
  };

  const validatedCount = validationResults.filter(r => r.status === 'validated').length;
  const failedCount = validationResults.filter(r => r.status === 'not-validated').length;
  const errorCount = validationResults.filter(r => r.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong>TIN Matching Service:</strong> Validate recipient TIN/SSN numbers against IRS records to ensure compliance.
          This helps prevent filing errors and delays.
        </AlertDescription>
      </Alert>

      {/* Statistics */}
      {validationResults.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">Total Recipients</div>
                <div className="text-2xl font-bold text-gray-900">{recipientsWithTin.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">Validated</div>
                <div className="text-2xl font-bold text-green-600">{validatedCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">Failed</div>
                <div className="text-2xl font-bold text-red-600">{failedCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">Errors</div>
                <div className="text-2xl font-bold text-orange-600">{errorCount}</div>
              </CardContent>
            </Card>
          </div>
          
          {/* Download Options */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Download TIN Match Results</h4>
                  <p className="text-xs text-gray-600">Export validation results as CSV file</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => downloadTinMatchFile('selected')}
                    disabled={selectedRecipients.length === 0}
                    variant="outline"
                    className="gap-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    <Download className="h-4 w-4" />
                    Download Selected ({selectedRecipients.length})
                  </Button>
                  <Button
                    onClick={() => downloadTinMatchFile('all')}
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <FileDown className="h-4 w-4" />
                    Download All Results ({validationResults.length})
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Manual TIN Validation & File Upload */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Manual TIN Entry */}
        <Card className="border-2 border-blue-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Manual TIN Validation</CardTitle>
            <CardDescription className="text-xs">Validate individual TIN numbers manually</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                TIN/SSN Number *
              </label>
              <Input
                placeholder="000-00-0000 or 00-0000000"
                value={manualTin}
                onChange={(e) => setManualTin(e.target.value)}
                maxLength={11}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Name (Optional)
              </label>
              <Input
                placeholder="Recipient name"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
              />
            </div>
            <Button
              onClick={handleManualValidation}
              disabled={isValidating || !manualTin.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
            >
              {isValidating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Validate TIN
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card className="border-2 border-purple-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Upload TIN File</CardTitle>
            <CardDescription className="text-xs">Upload a text file with TIN numbers for batch validation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>File Format:</strong></p>
              <p>• One TIN per line</p>
              <p>• Optional: TIN,Name format</p>
              <p>• Example: 123-45-6789,John Doe</p>
              <p>• Supports .txt files</p>
            </div>
            <input
              id="tin-file-upload"
              type="file"
              accept=".txt,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => document.getElementById('tin-file-upload')?.click()}
              disabled={isValidating}
              className="w-full bg-purple-600 hover:bg-purple-700 gap-2"
              variant="default"
            >
              <Upload className="h-4 w-4" />
              Choose File
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">TIN Validation Results</CardTitle>
              <CardDescription>
                {recipientsWithTin.length} recipient{recipientsWithTin.length !== 1 ? 's' : ''} with TIN numbers
                {validationResults.length > 0 && ` | ${validationResults.length} total validation(s)`}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleValidateSelected}
                disabled={isValidating || selectedRecipients.length === 0}
                variant="outline"
                className="gap-2"
              >
                {isValidating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Validate Selected ({selectedRecipients.length})
                  </>
                )}
              </Button>
              <Button
                onClick={handleValidateAll}
                disabled={isValidating || recipientsWithTin.length === 0}
                className="bg-blue-600 hover:bg-blue-700 gap-2"
              >
                {isValidating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Validate All Recipients
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {recipientsWithTin.length === 0 && validationResults.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 mb-2">No TIN validations yet</p>
              <p className="text-sm text-gray-400">Upload a file, enter manually, or add recipients with TIN/SSN</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedRecipients.length === recipientsWithTin.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRecipients(recipientsWithTin.map((_, i) => payeeData.indexOf(recipientsWithTin[i])));
                          } else {
                            setSelectedRecipients([]);
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SSN/TIN</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validated Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Recipient-linked validations */}
                  {recipientsWithTin.map((payee, idx) => {
                    const payeeIndex = payeeData.indexOf(payee);
                    const result = validationResults.find(r => r.payeeIndex === payeeIndex);
                    
                    return (
                      <tr key={`recipient-${payeeIndex}`} className="hover:bg-blue-50 transition-colors duration-200">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedRecipients.includes(payeeIndex)}
                            onChange={() => toggleRecipientSelection(payeeIndex)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{idx + 1}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{payee.fullName}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-mono">{payee.ssnTin}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{payee.email}</td>
                        <td className="px-4 py-3 text-sm">
                          {result ? getStatusBadge(result.status) : getStatusBadge('pending')}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {result?.message || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {result?.validatedDate || '-'}
                        </td>
                      </tr>
                    );
                  })}
                  
                  {/* Standalone validations (from file upload or manual entry) */}
                  {validationResults
                    .filter(r => r.payeeIndex === -1)
                    .map((result, idx) => (
                      <tr key={`standalone-${idx}`} className="hover:bg-purple-50 transition-colors duration-200 bg-purple-25">
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-purple-600 border-purple-300 text-xs">
                            Manual/File
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{recipientsWithTin.length + idx + 1}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{result.payeeName}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-mono">{result.tinNumber}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 italic">N/A</td>
                        <td className="px-4 py-3 text-sm">
                          {getStatusBadge(result.status)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {result.message}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {result.validatedDate}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skip Validation Option */}
      {onSkip && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <h4 className="font-semibold text-sm text-gray-900">Skip TIN Validation?</h4>
                </div>
                <p className="text-xs text-gray-700 mb-3">
                  You can skip TIN validation and proceed to e-filing. However, this may result in rejected filings if TIN numbers don't match IRS records.
                  <strong className="block mt-1">⚠️ Not recommended for production e-filing.</strong>
                </p>
              </div>
              <Button
                variant="outline"
                onClick={onSkip}
                className="ml-4 border-yellow-600 text-yellow-700 hover:bg-yellow-100"
              >
                Skip Validation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <h4 className="font-semibold text-sm text-gray-900 mb-3">About TIN Matching</h4>
          
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-800 mb-1">Validation Methods:</p>
              <ul className="text-xs text-gray-700 space-y-1 ml-2">
                <li>• <strong>Recipient-Based:</strong> Validate TINs for recipients already added to the system</li>
                <li>• <strong>File Upload:</strong> Upload a .txt or .csv file with TIN numbers (one per line or TIN,Name format)</li>
                <li>• <strong>Manual Entry:</strong> Enter individual TIN numbers for quick validation</li>
              </ul>
            </div>
            
            <div>
              <p className="text-xs font-semibold text-gray-800 mb-1">Status Indicators:</p>
              <ul className="text-xs text-gray-700 space-y-1 ml-2">
                <li>• <strong>✅ Validated:</strong> TIN matches IRS records - safe to proceed with e-filing</li>
                <li>• <strong>❌ Not Validated:</strong> TIN does not match - verify recipient information</li>
                <li>• <strong>⚠️ Error:</strong> Unable to validate - check connection or try again later</li>
                <li>• <strong>⏳ Pending:</strong> Not yet validated - click "Validate All" to check</li>
              </ul>
            </div>
            
            <div>
              <p className="text-xs font-semibold text-gray-800 mb-1">Best Practices:</p>
              <ul className="text-xs text-gray-700 space-y-1 ml-2">
                <li>• Validate all TINs before e-filing to avoid IRS rejections</li>
                <li>• Use file upload for bulk TIN validation (faster for many records)</li>
                <li>• Manual/File validations are marked with purple badges in the table</li>
                <li>• Double-check any "Not Validated" TINs before proceeding</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
