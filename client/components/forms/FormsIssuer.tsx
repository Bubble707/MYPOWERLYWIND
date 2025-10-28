import { useState } from 'react';
import { BulkActionsBar } from '@/components/BulkActionsBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Download, 
  Upload, 
  Plus,
  Pencil,
  Trash2,
  Building2,
  Search
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface Issuer {
  id: string;
  businessName: string;
  einTin: string;
  contactName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  address?: string;
  zip?: string;
}

export function FormsIssuer() {
  const [issuers, setIssuers] = useState<Issuer[]>([
    {
      id: '1',
      businessName: 'Acme Corporation',
      einTin: '12-3456789',
      contactName: 'John Smith',
      email: 'john@acme.com',
      phone: '(555) 123-4567',
      city: 'New York',
      state: 'NY',
      address: '123 Main St',
      zip: '10001'
    },
    {
      id: '2',
      businessName: 'Tech Solutions LLC',
      einTin: '98-7654321',
      contactName: 'Jane Doe',
      email: 'jane@techsolutions.com',
      phone: '(555) 234-5678',
      city: 'San Francisco',
      state: 'CA',
      address: '456 Tech Ave',
      zip: '94102'
    },
    {
      id: '3',
      businessName: 'Global Enterprises',
      einTin: '45-6789012',
      contactName: 'Bob Johnson',
      email: 'bob@global.com',
      phone: '(555) 345-6789',
      city: 'Los Angeles',
      state: 'CA',
      address: '789 Business Blvd',
      zip: '90001'
    },
    {
      id: '4',
      businessName: 'Smith & Partners',
      einTin: '78-9012345',
      contactName: 'Alice Williams',
      email: 'alice@smithpartners.com',
      phone: '(555) 456-7890',
      city: 'Chicago',
      state: 'IL',
      address: '321 Partner Ln',
      zip: '60601'
    },
    {
      id: '5',
      businessName: 'Freelance Services',
      einTin: '11-2233445',
      contactName: 'Charlie Brown',
      email: 'charlie@freelance.com',
      phone: '(555) 567-8901',
      city: 'Austin',
      state: 'TX',
      address: '654 Freelance Dr',
      zip: '73301'
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIssuer, setEditingIssuer] = useState<Issuer | null>(null);
  const [formData, setFormData] = useState<Partial<Issuer>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIssuerIds, setSelectedIssuerIds] = useState<Set<string>>(new Set());

  const handleAdd = () => {
    setFormData({});
    setEditingIssuer(null);
    setShowAddModal(true);
  };

  const handleEdit = (issuer: Issuer) => {
    setFormData(issuer);
    setEditingIssuer(issuer);
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this issuer?')) {
      setIssuers(issuers.filter(issuer => issuer.id !== id));
    }
  };

  const toggleIssuerSelection = (id: string) => {
    const newSelected = new Set(selectedIssuerIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIssuerIds(newSelected);
  };

  const toggleAllIssuers = () => {
    if (selectedIssuerIds.size === filteredIssuers.length && filteredIssuers.length > 0) {
      setSelectedIssuerIds(new Set());
    } else {
      setSelectedIssuerIds(new Set(filteredIssuers.map(i => i.id)));
    }
  };

  const handleBulkExportCSV = () => {
    const selectedIssuers = issuers.filter(i => selectedIssuerIds.has(i.id));
    const csvContent = [
      'Business Name,EIN/TIN,Contact Name,Email,Phone,City,State',
      ...selectedIssuers.map(i => 
        `${i.businessName},${i.einTin},${i.contactName},${i.email},${i.phone},${i.city},${i.state}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `issuers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setSelectedIssuerIds(new Set());
  };

  const handleBulkExportPDF = () => {
    alert(`PDF export for ${selectedIssuerIds.size} issuers coming soon!`);
    setSelectedIssuerIds(new Set());
  };

  const handleBulkDelete = () => {
    setIssuers(issuers.filter(i => !selectedIssuerIds.has(i.id)));
    setSelectedIssuerIds(new Set());
  };

  const handleSave = () => {
    if (editingIssuer) {
      // Update existing
      setIssuers(issuers.map(i => i.id === editingIssuer.id ? { ...formData as Issuer } : i));
    } else {
      // Add new
      const newIssuer: Issuer = {
        id: Date.now().toString(),
        ...formData as Issuer
      };
      setIssuers([...issuers, newIssuer]);
    }
    setShowAddModal(false);
    setFormData({});
  };

  const downloadSampleCSV = () => {
    const csvContent = 'Business Name,EIN/TIN,Contact Name,Email,Phone,City,State,Address,ZIP\nAcme Corp,12-3456789,John Doe,john@acme.com,(555) 123-4567,New York,NY,123 Main St,10001';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'issuer_sample.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      // Skip header
      const startIndex = lines[0].toLowerCase().includes('business') ? 1 : 0;
      
      const newIssuers: Issuer[] = [];
      for (let i = startIndex; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
        if (parts.length >= 7) {
          newIssuers.push({
            id: Date.now().toString() + i,
            businessName: parts[0],
            einTin: parts[1],
            contactName: parts[2],
            email: parts[3],
            phone: parts[4],
            city: parts[5],
            state: parts[6],
            address: parts[7] || '',
            zip: parts[8] || ''
          });
        }
      }
      
      setIssuers([...issuers, ...newIssuers]);
    };
    
    reader.readAsText(file);
  };

  // Filter issuers based on search query
  const filteredIssuers = issuers.filter(issuer => {
    const query = searchQuery.toLowerCase();
    return (
      issuer.businessName.toLowerCase().includes(query) ||
      issuer.email.toLowerCase().includes(query) ||
      issuer.einTin.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">Issuer</h2>
        <p className="text-gray-600 mt-1">Enter your business information as the issuer</p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search issuers by name, email, or EIN/TIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedIssuerIds.size}
        totalCount={filteredIssuers.length}
        onExportCSV={handleBulkExportCSV}
        onExportPDF={handleBulkExportPDF}
        onDelete={handleBulkDelete}
        entityName="issuer"
      />

      {/* Issuer Information Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Issuer Information</CardTitle>
              <CardDescription>Add issuer details one by one or upload via CSV</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={downloadSampleCSV} 
                className="gap-2 border-green-600 text-green-600 hover:bg-green-50 hover:border-green-700 hover:shadow-md hover:scale-[1.02] transition-all duration-200 font-semibold"
              >
                <Download className="h-4 w-4" />
                Sample CSV
              </Button>
              <Button 
                variant="outline" 
                className="gap-2 relative border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 hover:shadow-md hover:scale-[1.02] transition-all duration-200 font-semibold"
              >
                <Upload className="h-4 w-4" />
                Upload CSV
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </Button>
              <Button 
                onClick={handleAdd} 
                className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white gap-2 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-semibold"
              >
                <Plus className="h-4 w-4" />
                Add Issuer
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-50 to-blue-100/80 border-b-2 border-blue-200 hover:from-blue-100 hover:to-blue-100 transition-colors">
                  <TableHead className="w-16 pl-6">
                    <Checkbox
                      checked={selectedIssuerIds.size === filteredIssuers.length && filteredIssuers.length > 0}
                      onCheckedChange={toggleAllIssuers}
                    />
                  </TableHead>
                  <TableHead className="w-16 font-bold text-blue-900 text-xs uppercase tracking-wide">#</TableHead>
                  <TableHead className="font-bold text-blue-900 text-xs uppercase tracking-wide">Business Name</TableHead>
                  <TableHead className="font-bold text-blue-900 text-xs uppercase tracking-wide">EIN/TIN</TableHead>
                  <TableHead className="font-bold text-blue-900 text-xs uppercase tracking-wide">Contact Name</TableHead>
                  <TableHead className="font-bold text-blue-900 text-xs uppercase tracking-wide">Email</TableHead>
                  <TableHead className="font-bold text-blue-900 text-xs uppercase tracking-wide">Phone</TableHead>
                  <TableHead className="font-bold text-blue-900 text-xs uppercase tracking-wide">City</TableHead>
                  <TableHead className="font-bold text-blue-900 text-xs uppercase tracking-wide">State</TableHead>
                  <TableHead className="text-right font-bold text-blue-900 text-xs uppercase tracking-wide pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIssuers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                      {searchQuery ? `No issuers found matching "${searchQuery}"` : 'No issuers added yet'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredIssuers.map((issuer, index) => (
                  <TableRow key={issuer.id} className="border-b border-gray-100 hover:bg-blue-50/50 transition-all duration-200 group">
                    <TableCell className="pl-6">
                      <Checkbox
                        checked={selectedIssuerIds.has(issuer.id)}
                        onCheckedChange={() => toggleIssuerSelection(issuer.id)}
                      />
                    </TableCell>
                    <TableCell className="font-semibold text-gray-600 text-sm">{index + 1}</TableCell>
                    <TableCell className="font-semibold text-gray-900">{issuer.businessName}</TableCell>
                    <TableCell className="font-mono text-sm text-gray-700">{issuer.einTin}</TableCell>
                    <TableCell className="text-gray-800">{issuer.contactName}</TableCell>
                    <TableCell className="text-blue-600 hover:text-blue-700 hover:underline cursor-pointer">{issuer.email}</TableCell>
                    <TableCell className="text-gray-700">{issuer.phone}</TableCell>
                    <TableCell className="text-gray-700">{issuer.city}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50 px-2.5 py-0.5 font-medium">{issuer.state}</Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(issuer)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 hover:shadow-sm transition-all duration-200 font-semibold px-4"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(issuer.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:shadow-sm transition-all duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Issuer Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              {editingIssuer ? 'Edit Issuer' : 'Add New Issuer'}
            </DialogTitle>
            <DialogDescription>
              Enter the business information for the issuer
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  value={formData.businessName || ''}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="Acme Corporation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="einTin">EIN/TIN *</Label>
                <Input
                  id="einTin"
                  value={formData.einTin || ''}
                  onChange={(e) => setFormData({ ...formData, einTin: e.target.value })}
                  placeholder="12-3456789"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Name *</Label>
                <Input
                  id="contactName"
                  value={formData.contactName || ''}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="John Smith"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@acme.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main Street"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="New York"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state || ''}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="NY"
                  maxLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  value={formData.zip || ''}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  placeholder="10001"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setShowAddModal(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 hover:shadow-md transition-all duration-200 font-semibold px-6"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-semibold px-6"
            >
              {editingIssuer ? 'Update Issuer' : 'Add Issuer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
