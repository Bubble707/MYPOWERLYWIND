/**
 * Form Registry - Central configuration for all tax forms
 * Supports 1099 series, W series, and authorization forms
 */

export type FormCategory = 'income' | 'employment' | 'authorization' | 'business';

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'currency' | 'number' | 'checkbox' | 'date' | 'email' | 'ssn' | 'ein' | 'phone' | 'select' | 'textarea';
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  irsLink?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface FormDefinition {
  id: string;
  title: string;
  category: FormCategory;
  icon: string;
  description: string;
  irsPublication?: string;
  fields: FormField[];
  sections?: {
    title: string;
    fields: string[]; // field IDs
  }[];
}

// 1099 Series Forms
export const form1099NEC: FormDefinition = {
  id: '1099-NEC',
  title: 'Nonemployee Compensation',
  category: 'income',
  icon: '💼',
  description: 'Report payments to independent contractors',
  irsPublication: 'https://www.irs.gov/forms-pubs/about-form-1099-nec',
  fields: [
    { id: 'box1', label: '1. Nonemployee compensation', type: 'currency', required: true, helpText: 'Enter total compensation paid' },
    { id: 'box2', label: '2. Payer made direct sales totaling $5,000 or more', type: 'checkbox', helpText: 'Check if applicable' },
    { id: 'box4', label: '4. Federal income tax withheld', type: 'currency', helpText: 'Enter federal tax withheld if any' },
    { id: 'box5', label: '5. State tax withheld', type: 'currency' },
    { id: 'box6', label: '6. State/Payer\'s state no.', type: 'text' },
    { id: 'box7', label: '7. State income', type: 'currency' },
  ]
};

export const form1099MISC: FormDefinition = {
  id: '1099-MISC',
  title: 'Miscellaneous Income',
  category: 'income',
  icon: '📄',
  description: 'Report miscellaneous income payments',
  irsPublication: 'https://www.irs.gov/forms-pubs/about-form-1099-misc',
  fields: [
    { id: 'box1', label: '1. Rents', type: 'currency', helpText: 'Enter rental income' },
    { id: 'box2', label: '2. Royalties', type: 'currency' },
    { id: 'box3', label: '3. Other income', type: 'currency' },
    { id: 'box4', label: '4. Federal income tax withheld', type: 'currency' },
    { id: 'box5', label: '5. Fishing boat proceeds', type: 'currency' },
    { id: 'box6', label: '6. Medical and health care payments', type: 'currency' },
    { id: 'box8', label: '8. Substitute payments', type: 'currency' },
    { id: 'box10', label: '10. Crop insurance proceeds', type: 'currency' },
    { id: 'box14', label: '14. Gross proceeds paid to an attorney', type: 'currency' },
  ]
};

export const form1099INT: FormDefinition = {
  id: '1099-INT',
  title: 'Interest Income',
  category: 'income',
  icon: '💰',
  description: 'Report interest income payments',
  irsPublication: 'https://www.irs.gov/forms-pubs/about-form-1099-int',
  fields: [
    { id: 'box1', label: '1. Interest income', type: 'currency', required: true },
    { id: 'box2', label: '2. Early withdrawal penalty', type: 'currency' },
    { id: 'box3', label: '3. Interest on U.S. Savings Bonds', type: 'currency' },
    { id: 'box4', label: '4. Federal income tax withheld', type: 'currency' },
    { id: 'box8', label: '8. Tax-exempt interest', type: 'currency' },
  ]
};

export const form1099DIV: FormDefinition = {
  id: '1099-DIV',
  title: 'Dividends and Distributions',
  category: 'income',
  icon: '📈',
  description: 'Report dividend and distribution payments',
  irsPublication: 'https://www.irs.gov/forms-pubs/about-form-1099-div',
  fields: [
    { id: 'box1a', label: '1a. Total ordinary dividends', type: 'currency', required: true },
    { id: 'box1b', label: '1b. Qualified dividends', type: 'currency' },
    { id: 'box2a', label: '2a. Total capital gain distributions', type: 'currency' },
    { id: 'box3', label: '3. Nondividend distributions', type: 'currency' },
    { id: 'box4', label: '4. Federal income tax withheld', type: 'currency' },
  ]
};

export const form1099R: FormDefinition = {
  id: '1099-R',
  title: 'Distributions From Pensions, Annuities, etc.',
  category: 'income',
  icon: '🏦',
  description: 'Report distributions from retirement accounts',
  irsPublication: 'https://www.irs.gov/forms-pubs/about-form-1099-r',
  fields: [
    { id: 'box1', label: '1. Gross distribution', type: 'currency', required: true },
    { id: 'box2a', label: '2a. Taxable amount', type: 'currency' },
    { id: 'box2b', label: '2b. Taxable amount not determined', type: 'checkbox' },
    { id: 'box4', label: '4. Federal income tax withheld', type: 'currency' },
    { id: 'box7', label: '7. Distribution code', type: 'text', helpText: 'Enter IRS distribution code' },
  ]
};

// W-Series Forms
export const formW2: FormDefinition = {
  id: 'W-2',
  title: 'Wage and Tax Statement',
  category: 'employment',
  icon: '💵',
  description: 'Report wages paid and taxes withheld for employees',
  irsPublication: 'https://www.irs.gov/forms-pubs/about-form-w-2',
  fields: [
    { id: 'box1', label: '1. Wages, tips, other compensation', type: 'currency', required: true },
    { id: 'box2', label: '2. Federal income tax withheld', type: 'currency', required: true },
    { id: 'box3', label: '3. Social security wages', type: 'currency' },
    { id: 'box4', label: '4. Social security tax withheld', type: 'currency' },
    { id: 'box5', label: '5. Medicare wages and tips', type: 'currency' },
    { id: 'box6', label: '6. Medicare tax withheld', type: 'currency' },
    { id: 'box12a', label: '12a. Code', type: 'text' },
    { id: 'box12b', label: '12b. Amount', type: 'currency' },
  ],
  sections: [
    { title: 'Employee Information', fields: ['employeeName', 'employeeSSN', 'employeeAddress'] },
    { title: 'Employer Information', fields: ['employerEIN', 'employerName', 'employerAddress'] },
    { title: 'Wage Information', fields: ['box1', 'box2', 'box3', 'box4', 'box5', 'box6'] },
  ]
};

export const formW4: FormDefinition = {
  id: 'W-4',
  title: 'Employee\'s Withholding Certificate',
  category: 'employment',
  icon: '📝',
  description: 'Employee tax withholding information',
  irsPublication: 'https://www.irs.gov/forms-pubs/about-form-w-4',
  fields: [
    { id: 'filingStatus', label: 'Filing Status', type: 'select', required: true, options: [
      { value: 'single', label: 'Single or Married filing separately' },
      { value: 'married', label: 'Married filing jointly' },
      { value: 'head', label: 'Head of household' }
    ]},
    { id: 'multipleJobs', label: 'Multiple Jobs or Spouse Works', type: 'checkbox' },
    { id: 'dependents', label: 'Number of dependents', type: 'number' },
    { id: 'otherIncome', label: 'Other income', type: 'currency' },
    { id: 'deductions', label: 'Deductions', type: 'currency' },
    { id: 'extraWithholding', label: 'Extra withholding', type: 'currency' },
  ]
};

export const formW9: FormDefinition = {
  id: 'W-9',
  title: 'Request for Taxpayer Identification Number',
  category: 'employment',
  icon: '🆔',
  description: 'Request TIN and certification from U.S. persons',
  irsPublication: 'https://www.irs.gov/forms-pubs/about-form-w-9',
  fields: [
    { id: 'name', label: 'Name', type: 'text', required: true },
    { id: 'businessName', label: 'Business name/disregarded entity', type: 'text' },
    { id: 'taxClassification', label: 'Federal tax classification', type: 'select', required: true, options: [
      { value: 'individual', label: 'Individual/sole proprietor' },
      { value: 'c-corp', label: 'C Corporation' },
      { value: 's-corp', label: 'S Corporation' },
      { value: 'partnership', label: 'Partnership' },
      { value: 'trust', label: 'Trust/estate' },
      { value: 'llc', label: 'Limited liability company' }
    ]},
    { id: 'ssn', label: 'Social Security Number', type: 'ssn', required: true },
    { id: 'ein', label: 'Employer Identification Number', type: 'ein' },
    { id: 'address', label: 'Address', type: 'text', required: true },
    { id: 'city', label: 'City', type: 'text', required: true },
    { id: 'state', label: 'State', type: 'text', required: true },
    { id: 'zip', label: 'ZIP Code', type: 'text', required: true },
  ]
};

export const formW8BEN: FormDefinition = {
  id: 'W-8BEN',
  title: 'Certificate of Foreign Status (Individual)',
  category: 'employment',
  icon: '🌍',
  description: 'Certificate for foreign individuals claiming treaty benefits',
  irsPublication: 'https://www.irs.gov/forms-pubs/about-form-w-8-ben',
  fields: [
    { id: 'name', label: 'Name of individual', type: 'text', required: true },
    { id: 'country', label: 'Country of citizenship', type: 'text', required: true },
    { id: 'address', label: 'Permanent residence address', type: 'text', required: true },
    { id: 'mailingAddress', label: 'Mailing address (if different)', type: 'text' },
    { id: 'ssn', label: 'U.S. taxpayer identification number', type: 'ssn' },
    { id: 'foreignTIN', label: 'Foreign tax identifying number', type: 'text' },
    { id: 'dateOfBirth', label: 'Date of birth', type: 'date', required: true },
    { id: 'treatyCountry', label: 'Treaty country', type: 'text' },
    { id: 'treatyArticle', label: 'Treaty article', type: 'text' },
  ]
};

export const formW8ECI: FormDefinition = {
  id: 'W-8ECI',
  title: 'Certificate of Foreign Person\'s Claim',
  category: 'employment',
  icon: '🏢',
  description: 'For foreign persons claiming income effectively connected with U.S. trade',
  irsPublication: 'https://www.irs.gov/forms-pubs/about-form-w-8-eci',
  fields: [
    { id: 'name', label: 'Name of organization/individual', type: 'text', required: true },
    { id: 'country', label: 'Country of incorporation/residence', type: 'text', required: true },
    { id: 'address', label: 'Permanent residence address', type: 'text', required: true },
    { id: 'ein', label: 'U.S. taxpayer identification number', type: 'ein', required: true },
    { id: 'businessType', label: 'Type of business', type: 'text' },
  ]
};

// Authorization Forms
export const form2848: FormDefinition = {
  id: '2848',
  title: 'Power of Attorney',
  category: 'authorization',
  icon: '⚖️',
  description: 'Authorize representative to act on your behalf with IRS',
  irsPublication: 'https://www.irs.gov/forms-pubs/about-form-2848',
  fields: [
    { id: 'taxpayerName', label: 'Taxpayer name', type: 'text', required: true },
    { id: 'taxpayerSSN', label: 'Taxpayer SSN/EIN', type: 'ssn', required: true },
    { id: 'representativeName', label: 'Representative name', type: 'text', required: true },
    { id: 'representativeCAF', label: 'CAF number', type: 'text' },
    { id: 'representativePTIN', label: 'PTIN', type: 'text' },
    { id: 'taxMatters', label: 'Tax matters', type: 'textarea', required: true, helpText: 'Describe the tax matters' },
    { id: 'taxYears', label: 'Tax years/periods', type: 'text', required: true },
    { id: 'specificActs', label: 'Specific acts authorized', type: 'textarea' },
  ]
};

export const form8821: FormDefinition = {
  id: '8821',
  title: 'Tax Information Authorization',
  category: 'authorization',
  icon: '🔐',
  description: 'Authorize someone to inspect/receive tax information',
  irsPublication: 'https://www.irs.gov/forms-pubs/about-form-8821',
  fields: [
    { id: 'taxpayerName', label: 'Taxpayer name', type: 'text', required: true },
    { id: 'taxpayerSSN', label: 'Taxpayer SSN/EIN', type: 'ssn', required: true },
    { id: 'appointeeName', label: 'Appointee name', type: 'text', required: true },
    { id: 'appointeeCAF', label: 'CAF number', type: 'text' },
    { id: 'taxMatters', label: 'Tax matters', type: 'textarea', required: true },
    { id: 'taxYears', label: 'Tax years/periods', type: 'text', required: true },
  ]
};

// Business/Request Forms
export const formW7: FormDefinition = {
  id: 'W-7',
  title: 'Application for IRS Individual Taxpayer Identification Number',
  category: 'business',
  icon: '🆔',
  description: 'Apply for an ITIN',
  irsPublication: 'https://www.irs.gov/forms-pubs/about-form-w-7',
  fields: [
    { id: 'reason', label: 'Reason for applying', type: 'select', required: true, options: [
      { value: 'nonresident', label: 'Nonresident alien required to get ITIN' },
      { value: 'resident', label: 'U.S. resident alien' },
      { value: 'dependent', label: 'Dependent of U.S. citizen/resident alien' },
      { value: 'spouse', label: 'Spouse of U.S. citizen/resident alien' },
      { value: 'other', label: 'Other' }
    ]},
    { id: 'firstName', label: 'First name', type: 'text', required: true },
    { id: 'lastName', label: 'Last name', type: 'text', required: true },
    { id: 'dateOfBirth', label: 'Date of birth', type: 'date', required: true },
    { id: 'countryOfCitizenship', label: 'Country of citizenship', type: 'text', required: true },
    { id: 'foreignAddress', label: 'Foreign address', type: 'text' },
    { id: 'usAddress', label: 'U.S. address', type: 'text' },
  ]
};

export const formW10: FormDefinition = {
  id: 'W-10',
  title: 'Dependent Care Provider\'s Identification',
  category: 'business',
  icon: '👶',
  description: 'Identification and certification for dependent care providers',
  irsPublication: 'https://www.irs.gov/forms-pubs/about-form-w-10',
  fields: [
    { id: 'providerName', label: 'Provider name', type: 'text', required: true },
    { id: 'providerAddress', label: 'Provider address', type: 'text', required: true },
    { id: 'providerTIN', label: 'Provider TIN', type: 'ein', required: true },
    { id: 'serviceLocation', label: 'Service location', type: 'text' },
  ]
};

export const formW12: FormDefinition = {
  id: 'W-12',
  title: 'IRS Paid Preparer Tax Identification Number Application',
  category: 'business',
  icon: '📋',
  description: 'Apply for PTIN',
  irsPublication: 'https://www.irs.gov/forms-pubs/about-form-w-12',
  fields: [
    { id: 'firstName', label: 'First name', type: 'text', required: true },
    { id: 'lastName', label: 'Last name', type: 'text', required: true },
    { id: 'ssn', label: 'Social Security Number', type: 'ssn', required: true },
    { id: 'dateOfBirth', label: 'Date of birth', type: 'date', required: true },
    { id: 'address', label: 'Address', type: 'text', required: true },
    { id: 'phone', label: 'Phone number', type: 'phone', required: true },
    { id: 'email', label: 'Email', type: 'email', required: true },
  ]
};

// Form Registry - W-Series Forms Only
export const allForms: FormDefinition[] = [
  formW9,
  formW2,
  formW4,
  formW8BEN,
  formW8ECI,
  form2848,
  form8821,
  formW7,
  formW10,
  formW12,
];

export const formRegistry: Record<string, FormDefinition> = {
  'W-9': formW9,
  'W-8BEN': formW8BEN,
  'W-8ECI': formW8ECI,
  '2848': form2848,
  '8821': form8821,
  'W-7': formW7,
  'W-10': formW10,
  'W-12': formW12,
};

export const getFormsByCategory = (category: FormCategory): FormDefinition[] => {
  return Object.values(formRegistry).filter(form => form.category === category);
};

export const getAllForms = (): FormDefinition[] => {
  return Object.values(formRegistry);
};

export const getFormById = (id: string): FormDefinition | undefined => {
  return formRegistry[id];
};
