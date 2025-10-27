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
import {
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Users,
  Link as LinkIcon,
  Loader2,
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

interface WordPressImportsProps {
  onImport: (affiliates: any[]) => void;
  onClose: () => void;
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

  const testConnection = async () => {
    if (!wpUrl || !wpUsername || !wpPassword) {
      setError("Please fill in all connection fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Clean up URL
      let cleanUrl = wpUrl.trim();
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = 'https://' + cleanUrl;
      }
      cleanUrl = cleanUrl.replace(/\/+$/, ''); // Remove trailing slashes

      // Test WordPress REST API connection
      const authHeader = 'Basic ' + btoa(`${wpUsername}:${wpPassword}`);
      
      const response = await fetch(`${cleanUrl}/wp-json/wp/v2/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to connect: ${response.status} ${response.statusText}`);
      }

      const userData = await response.json();
      console.log('Connected as:', userData.name);

      setConnected(true);
      setError("");
      
      // Auto-load affiliates after successful connection
      await loadAffiliates(cleanUrl, authHeader);
    } catch (err: any) {
      setError(err.message || "Failed to connect to WordPress. Check your credentials.");
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
    const selectedAffiliates = affiliates.filter(aff => 
      selectedAffiliateIds.has(aff.id)
    );

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

    onImport(payees);
  };

  const selectedCount = selectedAffiliateIds.size;
  const totalEarnings = affiliates
    .filter(aff => selectedAffiliateIds.has(aff.id))
    .reduce((sum, aff) => sum + aff.total_earnings, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Import Affiliates from WordPress
          </CardTitle>
          <CardDescription>
            Connect to your WordPress site and import affiliate data for 1099 forms
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Connection Form */}
          {!connected ? (
            <div className="space-y-4">
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

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={testConnection}
                  disabled={loading || !wpUrl || !wpUsername || !wpPassword}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Connect & Load Affiliates
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Connected State - Show Affiliates */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-600">Connected to {wpUrl}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setConnected(false);
                      setAffiliates([]);
                      setSelectedAffiliateIds(new Set());
                    }}
                  >
                    Change Connection
                  </Button>
                </div>

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
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto max-h-[400px]">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left">
                              <Checkbox
                                checked={selectedAffiliateIds.size === affiliates.length}
                                onCheckedChange={toggleAll}
                              />
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Email
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              SSN/TIN
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Earnings
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {affiliates.map((affiliate) => {
                            const isSelected = selectedAffiliateIds.has(affiliate.id);
                            const needs1099 = affiliate.total_earnings >= 600;

                            return (
                              <tr
                                key={affiliate.id}
                                className={`hover:bg-blue-50 cursor-pointer ${
                                  isSelected ? 'bg-blue-50' : ''
                                }`}
                                onClick={() => toggleAffiliate(affiliate.id)}
                              >
                                <td className="px-4 py-3">
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() => toggleAffiliate(affiliate.id)}
                                  />
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                  {affiliate.name}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {affiliate.email}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {affiliate.ssn || (
                                    <span className="text-red-600 text-xs">Missing</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                  ${affiliate.total_earnings.toFixed(2)}
                                </td>
                                <td className="px-4 py-3">
                                  {needs1099 ? (
                                    <Badge className="bg-yellow-100 text-yellow-800">
                                      Requires 1099
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-gray-600">
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
                    <Button variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleImport}
                      disabled={selectedCount === 0}
                      className="bg-blue-600 hover:bg-blue-700"
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
