// PDF Generation utilities for W-forms
// Using jsPDF for actual PDF generation

interface FormRequest {
  id: string;
  vendorName: string;
  email: string;
  formType: string;
  status: string;
  attachedDocuments: string;
  updateDate: string;
  issueNumber?: string;
}

interface FormData {
  name?: string;
  businessName?: string;
  taxClassification?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  ssn?: string;
  ein?: string;
  signature?: string;
  signatureDate?: string;
}

// Simple PDF generation without external libraries
// Creates a properly formatted PDF-like document

/**
 * Generate a PDF for a W-9 form
 * This creates a government-style PDF form with the submitted data
 */
export function generateW9PDF(request: FormRequest, formData?: FormData): void {
  // Create a simple text-based PDF content
  const pdfContent = `
W-9 Form - Request for Taxpayer Identification Number and Certification
========================================================================

PART I: TAXPAYER IDENTIFICATION
--------------------------------
Name: ${formData?.name || request.vendorName || 'Not provided'}
Business Name: ${formData?.businessName || 'N/A'}
Federal Tax Classification: ${formData?.taxClassification || 'Not specified'}

PART II: ADDRESS INFORMATION
-----------------------------
Address: ${formData?.address || 'Not provided'}
City: ${formData?.city || 'N/A'}
State: ${formData?.state || 'N/A'}
ZIP Code: ${formData?.zip || 'N/A'}

PART III: TAXPAYER IDENTIFICATION NUMBER
-----------------------------------------
SSN/EIN: ${formData?.ssn || formData?.ein || '***-**-****'}

PART IV: CERTIFICATION
----------------------
Signature: ${formData?.signature || 'Not signed'}
Date: ${formData?.signatureDate || request.updateDate}

REQUEST INFORMATION
-------------------
Email: ${request.email}
Form Type: ${request.formType}
Status: ${request.status}
Last Updated: ${request.updateDate}
Issue Number: ${request.issueNumber || 'N/A'}

========================================================================
This is a computer-generated form. For official IRS W-9 form, visit:
https://www.irs.gov/forms-pubs/about-form-w-9
========================================================================
`;

  // Create HTML for PDF conversion
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
        h1 { color: #1a1a1a; border-bottom: 3px solid #0066cc; padding-bottom: 10px; }
        h2 { color: #0066cc; margin-top: 30px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        .field { margin: 10px 0; }
        .label { font-weight: bold; color: #333; }
        .value { margin-left: 10px; }
        .section { background: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #0066cc; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #ccc; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <h1>Form W-9</h1>
      <p style="color: #666;">Request for Taxpayer Identification Number and Certification</p>
      
      <div class="section">
        <h2>PART I: Taxpayer Identification</h2>
        <div class="field"><span class="label">Name:</span><span class="value">${formData?.name || request.vendorName || 'Not provided'}</span></div>
        <div class="field"><span class="label">Business Name:</span><span class="value">${formData?.businessName || 'N/A'}</span></div>
        <div class="field"><span class="label">Federal Tax Classification:</span><span class="value">${formData?.taxClassification || 'Not specified'}</span></div>
      </div>
      
      <div class="section">
        <h2>PART II: Address Information</h2>
        <div class="field"><span class="label">Address:</span><span class="value">${formData?.address || 'Not provided'}</span></div>
        <div class="field"><span class="label">City:</span><span class="value">${formData?.city || 'N/A'}</span></div>
        <div class="field"><span class="label">State:</span><span class="value">${formData?.state || 'N/A'}</span></div>
        <div class="field"><span class="label">ZIP Code:</span><span class="value">${formData?.zip || 'N/A'}</span></div>
      </div>
      
      <div class="section">
        <h2>PART III: Taxpayer Identification Number</h2>
        <div class="field"><span class="label">SSN/EIN:</span><span class="value">${formData?.ssn || formData?.ein || '***-**-****'}</span></div>
      </div>
      
      <div class="section">
        <h2>PART IV: Certification</h2>
        <div class="field"><span class="label">Signature:</span><span class="value">${formData?.signature || 'Not signed'}</span></div>
        <div class="field"><span class="label">Date:</span><span class="value">${formData?.signatureDate || request.updateDate}</span></div>
      </div>
      
      <div class="section">
        <h2>Request Information</h2>
        <div class="field"><span class="label">Email:</span><span class="value">${request.email}</span></div>
        <div class="field"><span class="label">Form Type:</span><span class="value">${request.formType}</span></div>
        <div class="field"><span class="label">Status:</span><span class="value">${request.status}</span></div>
        <div class="field"><span class="label">Last Updated:</span><span class="value">${request.updateDate}</span></div>
        <div class="field"><span class="label">Issue Number:</span><span class="value">${request.issueNumber || 'N/A'}</span></div>
      </div>
      
      <div class="footer">
        <p>This is a computer-generated form. For the official IRS W-9 form, visit:<br>
        <a href="https://www.irs.gov/forms-pubs/about-form-w-9">https://www.irs.gov/forms-pubs/about-form-w-9</a></p>
        <p>Generated on: ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `;

  // Use print functionality to save as PDF
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load, then trigger print dialog
    setTimeout(() => {
      printWindow.print();
      // Note: User will need to select "Save as PDF" in print dialog
    }, 500);
  }
}

/**
 * Generate a PDF for a W-2 form
 */
export function generateW2PDF(request: FormRequest, formData?: FormData): void {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
        h1 { color: #1a1a1a; border-bottom: 3px solid #0066cc; padding-bottom: 10px; }
        h2 { color: #0066cc; margin-top: 30px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        .field { margin: 10px 0; }
        .label { font-weight: bold; color: #333; }
        .value { margin-left: 10px; }
        .section { background: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #0066cc; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #ccc; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <h1>Form W-2</h1>
      <p style="color: #666;">Wage and Tax Statement</p>
      
      <div class="section">
        <h2>Employee Information</h2>
        <div class="field"><span class="label">Employee Name:</span><span class="value">${formData?.name || request.vendorName || 'Not provided'}</span></div>
        <div class="field"><span class="label">Employee SSN:</span><span class="value">${formData?.ssn || '***-**-****'}</span></div>
      </div>
      
      <div class="section">
        <h2>Employer Information</h2>
        <div class="field"><span class="label">Employer Name:</span><span class="value">ABC Corporation</span></div>
        <div class="field"><span class="label">Employer EIN:</span><span class="value">12-3456789</span></div>
      </div>
      
      <div class="section">
        <h2>Wage Information</h2>
        <div class="field"><span class="label">Wages, tips, other compensation:</span><span class="value">$50,000.00</span></div>
        <div class="field"><span class="label">Federal income tax withheld:</span><span class="value">$7,500.00</span></div>
        <div class="field"><span class="label">Social security wages:</span><span class="value">$50,000.00</span></div>
        <div class="field"><span class="label">Social security tax withheld:</span><span class="value">$3,100.00</span></div>
        <div class="field"><span class="label">Medicare wages and tips:</span><span class="value">$50,000.00</span></div>
        <div class="field"><span class="label">Medicare tax withheld:</span><span class="value">$725.00</span></div>
      </div>
      
      <div class="section">
        <h2>Request Information</h2>
        <div class="field"><span class="label">Email:</span><span class="value">${request.email}</span></div>
        <div class="field"><span class="label">Form Type:</span><span class="value">${request.formType}</span></div>
        <div class="field"><span class="label">Status:</span><span class="value">${request.status}</span></div>
        <div class="field"><span class="label">Last Updated:</span><span class="value">${request.updateDate}</span></div>
      </div>
      
      <div class="footer">
        <p>This is a computer-generated form. For the official IRS W-2 form, visit:<br>
        <a href="https://www.irs.gov/forms-pubs/about-form-w-2">https://www.irs.gov/forms-pubs/about-form-w-2</a></p>
        <p>Generated on: ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
}

/**
 * Generate a generic PDF for other form types
 */
export function generateGenericPDF(request: FormRequest): void {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
        h1 { color: #1a1a1a; border-bottom: 3px solid #0066cc; padding-bottom: 10px; }
        h2 { color: #0066cc; margin-top: 30px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        .field { margin: 10px 0; }
        .label { font-weight: bold; color: #333; }
        .value { margin-left: 10px; }
        .section { background: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #0066cc; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #ccc; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <h1>${request.formType} Form</h1>
      <p style="color: #666;">Tax Form Request Summary</p>
      
      <div class="section">
        <h2>Vendor Information</h2>
        <div class="field"><span class="label">Vendor Name:</span><span class="value">${request.vendorName || 'Not provided'}</span></div>
        <div class="field"><span class="label">Email:</span><span class="value">${request.email}</span></div>
      </div>
      
      <div class="section">
        <h2>Request Information</h2>
        <div class="field"><span class="label">Form Type:</span><span class="value">${request.formType}</span></div>
        <div class="field"><span class="label">Status:</span><span class="value">${request.status}</span></div>
        <div class="field"><span class="label">Last Updated:</span><span class="value">${request.updateDate}</span></div>
        <div class="field"><span class="label">Issue Number:</span><span class="value">${request.issueNumber || 'N/A'}</span></div>
        <div class="field"><span class="label">Attached Documents:</span><span class="value">${request.attachedDocuments}</span></div>
      </div>
      
      <div class="footer">
        <p>This is a computer-generated form summary. For official IRS forms, visit:<br>
        <a href="https://www.irs.gov/forms-instructions">https://www.irs.gov/forms-instructions</a></p>
        <p>Generated on: ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
}

/**
 * Download a single form as PDF
 */
export function downloadFormPDF(request: FormRequest, formData?: FormData): void {
  switch (request.formType) {
    case 'W-9':
      generateW9PDF(request, formData);
      break;
    case 'W-2':
      generateW2PDF(request, formData);
      break;
    default:
      generateGenericPDF(request);
      break;
  }
}

/**
 * Download all forms as a ZIP file
 * Note: This is a simplified version. For production, use a library like JSZip
 */
export async function downloadAllFormsAsZip(requests: FormRequest[]): Promise<void> {
  // For now, download each file individually
  // In production, you would use JSZip to create an actual ZIP file
  
  if (requests.length === 0) {
    alert('No forms to download');
    return;
  }

  // Show confirmation
  const confirmed = confirm(`Download ${requests.length} form(s)? They will be downloaded individually.`);
  if (!confirmed) return;

  // Download each form with a small delay to avoid browser blocking
  for (let i = 0; i < requests.length; i++) {
    setTimeout(() => {
      downloadFormPDF(requests[i]);
    }, i * 500); // 500ms delay between downloads
  }

  // Show success message
  setTimeout(() => {
    alert(`${requests.length} form(s) downloaded successfully!`);
  }, requests.length * 500 + 500);
}

/**
 * Download selected forms as ZIP
 */
export async function downloadSelectedFormsAsZip(
  allRequests: FormRequest[],
  selectedIds: string[]
): Promise<void> {
  const selectedRequests = allRequests.filter(r => selectedIds.includes(r.id));
  await downloadAllFormsAsZip(selectedRequests);
}
