import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

type ImportAffiliatesFromWordPressProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (affiliates: any[]) => void;
};

export function ImportAffiliatesFromWordPress({
  open,
  onOpenChange,
  onImport,
}: ImportAffiliatesFromWordPressProps) {
  const [siteUrl, setSiteUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    if (!siteUrl || !username || !password) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, this would call your backend API
      // which would then connect to WordPress
      const mockResponse = {
        success: true,
        affiliates: [
          {
            id: 1,
            name: 'John Smith',
            email: 'john@example.com',
            earnings: 1500.75,
            taxId: '123-45-6789',
          },
          {
            id: 2,
            name: 'Sarah Johnson',
            email: 'sarah@example.com',
            earnings: 2300.25,
            taxId: '987-65-4321',
          },
          {
            id: 3,
            name: 'Mike Williams',
            email: 'mike@example.com',
            earnings: 1800.5,
            taxId: '456-78-9012',
          },
        ],
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (mockResponse.success) {
        onImport(mockResponse.affiliates);
        onOpenChange(false);
      } else {
        setError('Failed to import affiliates. Please check your credentials and try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-blue-600">Import Affiliates from WordPress</span>
          </DialogTitle>
          <DialogDescription>
            Connect to your WordPress site to import affiliate data for 1099 forms
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="siteUrl">WordPress Site URL *</Label>
            <Input
              id="siteUrl"
              placeholder="https://your-wordpress-site.com"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">WordPress Username *</Label>
            <Input
              id="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Application Password *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Application Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex items-start gap-2 pt-1 text-sm text-gray-600">
              <Info className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
              <span>
                Generate an Application Password in WordPress: Users → Your Profile → Application Passwords
              </span>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={isLoading}
            >
              {isLoading ? 'Connecting...' : 'Connect & Load Affiliates'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
