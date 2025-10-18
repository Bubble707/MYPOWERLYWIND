import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { 
  ArrowRightLeft, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  FileText
} from 'lucide-react';

interface FormRequest {
  id: string;
  vendorName: string;
  email: string;
  formType: string;
  status: string;
  attachedDocuments: string;
  updateDate: string;
}

interface TransferTo1099ModalProps {
  open: boolean;
  onClose: () => void;
  selectedForms: FormRequest[];
  transferType: 'all' | 'selected';
}

const FORM_1099_TYPES = [
  { id: '1099-NEC', name: '1099-NEC', description: 'Nonemployee Compensation', icon: '💼' },
  { id: '1099-MISC', name: '1099-MISC', description: 'Miscellaneous Information', icon: '📋' },
  { id: '1099-INT', name: '1099-INT', description: 'Interest Income', icon: '💰' },
  { id: '1099-DIV', name: '1099-DIV', description: 'Dividends and Distributions', icon: '📊' },
  { id: '1099-K', name: '1099-K', description: 'Payment Card and Third Party', icon: '💳' },
  { id: '1099-R', name: '1099-R', description: 'Distributions From Pensions', icon: '🏦' },
];

export function TransferTo1099Modal({ open, onClose, selectedForms, transferType }: TransferTo1099ModalProps) {
  const [selectedFormType, setSelectedFormType] = useState<string>('');
  const [transferring, setTransferring] = useState(false);
  const [response, setResponse] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleTransfer = async () => {
    if (!selectedFormType) {
      setResponse({
        success: false,
        message: 'Please select a 1099 form type'
      });
      return;
    }

    setTransferring(true);
    setResponse(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const count = selectedForms.length;
      
      setResponse({
        success: true,
        message: `Successfully transferred ${count} W-9 form${count > 1 ? 's' : ''} to ${selectedFormType}`
      });

      // Don't auto-close - let user close manually

    } catch (error) {
      setResponse({
        success: false,
        message: 'Failed to transfer forms. Please try again.'
      });
    } finally {
      setTransferring(false);
    }
  };

  const handleClose = () => {
    setSelectedFormType('');
    setResponse(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-blue-600" />
            Transfer W-9 to 1099
          </DialogTitle>
          <DialogDescription>
            Select which type of 1099 form to transfer the W-9 data to
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Transfer Info */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900 text-sm">
                {transferType === 'all' ? 'Transfer All Forms' : 'Transfer Selected Forms'}
              </span>
            </div>
            <Badge variant="secondary" className="bg-blue-600 text-white">
              {selectedForms.length} form{selectedForms.length > 1 ? 's' : ''}
            </Badge>
          </div>

          {/* Form Type Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Select 1099 Form Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {FORM_1099_TYPES.map((form) => (
                <Card
                  key={form.id}
                  className={`cursor-pointer transition-all hover:shadow-sm ${
                    selectedFormType === form.id
                      ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedFormType(form.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="text-2xl">{form.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="font-semibold text-sm text-gray-900">{form.name}</h3>
                          {selectedFormType === form.id && (
                            <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5 truncate">{form.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Forms to Transfer */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Forms to Transfer</Label>
            <div className="border rounded-lg bg-gray-50 max-h-40 overflow-y-auto">
              <div className="divide-y">
                {selectedForms.map((form) => (
                  <div
                    key={form.id}
                    className="flex items-center justify-between p-2.5 hover:bg-white transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{form.vendorName || 'No Name'}</p>
                      <p className="text-xs text-gray-600 truncate">{form.email}</p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`ml-2 text-xs ${
                        form.status === 'Completed'
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-orange-100 text-orange-700 border-orange-200'
                      }`}
                    >
                      {form.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Response Message */}
          {response && (
            <Alert className={response.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
              {response.success ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={response.success ? 'text-green-800' : 'text-red-800'}>
                {response.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t mt-4">
            <Button 
              variant="outline" 
              onClick={handleClose} 
              disabled={transferring}
              className="px-4"
            >
              Cancel
            </Button>
            <Button
              onClick={handleTransfer}
              disabled={transferring || !selectedFormType}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-4"
            >
              {transferring ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Transferring...
                </>
              ) : (
                <>
                  <ArrowRightLeft className="h-4 w-4" />
                  Transfer to 1099
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
