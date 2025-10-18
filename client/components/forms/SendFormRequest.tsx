import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  X, 
  Plus, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Loader2
} from 'lucide-react';

interface Recipient {
  vendorName: string;
  email: string;
}

interface SendFormRequestProps {
  formType: string;
  onClose?: () => void;
}

export function SendFormRequest({ formType, onClose }: SendFormRequestProps) {
  const [recipients, setRecipients] = useState<Recipient[]>([{ vendorName: '', email: '' }]);
  const [sending, setSending] = useState(false);
  const [response, setResponse] = useState<{
    success: boolean;
    message: string;
    sentTo?: string[];
  } | null>(null);

  const addRecipient = () => {
    setRecipients([...recipients, { vendorName: '', email: '' }]);
  };

  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((_, i) => i !== index));
    }
  };

  const updateRecipient = (index: number, field: keyof Recipient, value: string) => {
    const updated = [...recipients];
    updated[index][field] = value;
    setRecipients(updated);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSend = async () => {
    // Validate all emails
    const invalidEmails = recipients.filter(r => r.email && !validateEmail(r.email));
    if (invalidEmails.length > 0) {
      setResponse({
        success: false,
        message: 'Please enter valid email addresses for all recipients'
      });
      return;
    }

    // Check for empty emails
    const emptyEmails = recipients.filter(r => !r.email);
    if (emptyEmails.length > 0) {
      setResponse({
        success: false,
        message: 'Please enter email addresses for all recipients'
      });
      return;
    }

    setSending(true);
    setResponse(null);

    try {
      // Simulate API call - Replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock successful response
      const sentEmails = recipients.map(r => r.email);
      
      setResponse({
        success: true,
        message: `Form request sent successfully to ${sentEmails.length} recipient${sentEmails.length > 1 ? 's' : ''}`,
        sentTo: sentEmails
      });

      // TODO: Implement actual API call
      // const response = await fetch('/api/forms/send-request', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     formType,
      //     recipients: recipients.map(r => ({
      //       vendorName: r.vendorName,
      //       email: r.email
      //     }))
      //   })
      // });
      // const data = await response.json();
      // setResponse(data);

    } catch (error) {
      setResponse({
        success: false,
        message: 'Failed to send form request. Please try again.'
      });
    } finally {
      setSending(false);
    }
  };

  const handleCancel = () => {
    setRecipients([{ vendorName: '', email: '' }]);
    setResponse(null);
    if (onClose) onClose();
  };

  return (
    <Card className="border-blue-200">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Send {formType} Request
            </CardTitle>
            <CardDescription className="mt-1">
              Send form requests to vendors or contractors via email
            </CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Recipients Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Recipients</Label>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
              {recipients.length} recipient{recipients.length > 1 ? 's' : ''}
            </Badge>
          </div>

          {recipients.map((recipient, index) => (
            <Card key={index} className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`vendor-${index}`}>
                        Vendor Name (Optional)
                      </Label>
                      <Input
                        id={`vendor-${index}`}
                        value={recipient.vendorName}
                        onChange={(e) => updateRecipient(index, 'vendorName', e.target.value)}
                        placeholder="Vendor Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`email-${index}`}>
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`email-${index}`}
                        type="email"
                        value={recipient.email}
                        onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                        placeholder="Type Email here (abc@gmail.com)"
                        className={recipient.email && !validateEmail(recipient.email) ? 'border-red-500' : ''}
                      />
                      {recipient.email && !validateEmail(recipient.email) && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Invalid email format
                        </p>
                      )}
                    </div>
                  </div>
                  {recipients.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRecipient(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            variant="outline"
            onClick={addRecipient}
            className="w-full gap-2 border-dashed border-2 hover:border-blue-400 hover:bg-blue-50"
          >
            <Plus className="h-4 w-4" />
            Add More
          </Button>
        </div>

        {/* Response Message */}
        {response && (
          <Alert className={response.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
            <div className="flex items-start gap-2">
              {response.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <AlertDescription className={response.success ? 'text-green-800' : 'text-red-800'}>
                  <p className="font-semibold mb-1">{response.message}</p>
                  {response.success && response.sentTo && (
                    <div className="mt-2">
                      <p className="text-sm font-medium mb-1">Sent to:</p>
                      <div className="flex flex-wrap gap-2">
                        {response.sentTo.map((email, idx) => (
                          <Badge key={idx} variant="secondary" className="bg-green-100 text-green-800">
                            {email}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={sending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={sending}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 min-w-[120px]"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send
              </>
            )}
          </Button>
        </div>

        {/* Info */}
        <Alert className="bg-blue-50 border-blue-200">
          <Mail className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 text-sm">
            Recipients will receive an email with a link to fill out the {formType} form. 
            They can complete it online and submit it back to you.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
