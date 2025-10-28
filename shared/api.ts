/**
 * Shared types and pure utilities for the 1099 E-Filing workflow
 */

export type CountryCode = string;
export type StateCode = string;

export interface TransmitterData {
  tcc: string;
  businessName: string;
  contactName: string;
  einTin: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state: StateCode;
  zip: string;
  country: CountryCode;
  efileUsername?: string;
  efilePassword?: string;
  irsAccountId?: string;
  saveForFuture?: boolean;
}

export interface IssuerData {
  issuerName: string;
  einTin: string;
  address1: string;
  address2?: string;
  city: string;
  state: StateCode;
  zip: string;
  country: CountryCode;
  contactName: string;
  email: string;
  phone: string;
  businessType: string;
}

export interface PayeeData {
  fullName: string;
  ssnTin: string;
  email: string;
  address1: string;
  address2?: string;
  city: string;
  state: StateCode;
  zip: string;
  country: CountryCode;
  paymentType: string;
  formType: string; // e.g., 1099-NEC, 1099-MISC
  amount: number;
  federalTaxWithheld: number;
  notes?: string;
}

export interface EfileUploadRequest {
  transmitterData: TransmitterData;
  issuerData: IssuerData;
  payeeData: PayeeData[];
  formType: string;
}

export interface EfileUploadResponse {
  success: boolean;
  trackingId: string;
  message?: string;
}

export interface ExtensionRequest {
  taxYear: string;
  formType: string;
  payer: {
    name: string;
    ein: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  contact: {
    email: string;
    phone: string;
  };
  requestDate: string;
}

export interface ExtensionRequestResponse {
  success: boolean;
  message: string;
  confirmationNumber?: string;
  requestId?: string;
}

/**
 * Minimal ASCII generator. Not the official IRS FIRE spec; includes all fields in fixed-order
 * key=value pairs for each section, separated by CRLF lines.
 */
export function generateAscii(
  transmitter: TransmitterData,
  issuer: IssuerData,
  payees: PayeeData[],
  formType: string,
): string {
  const esc = (v: unknown) => String(v ?? "").replace(/\r?\n/g, " ").trim();
  const header = [
    "FILE=EFILE1099",
    `FORM_TYPE=${esc(formType)}`,
    `GENERATED_AT=${new Date().toISOString()}`,
  ].join("\r\n");

  const tx = [
    "[TRANSMITTER]",
    `TCC=${esc(transmitter.tcc)}`,
    `BUSINESS_NAME=${esc(transmitter.businessName)}`,
    `CONTACT_NAME=${esc(transmitter.contactName)}`,
    `EIN_TIN=${esc(transmitter.einTin)}`,
    `EMAIL=${esc(transmitter.email)}`,
    `PHONE=${esc(transmitter.phone)}`,
    `ADDRESS1=${esc(transmitter.address1)}`,
    `ADDRESS2=${esc(transmitter.address2)}`,
    `CITY=${esc(transmitter.city)}`,
    `STATE=${esc(transmitter.state)}`,
    `ZIP=${esc(transmitter.zip)}`,
    `COUNTRY=${esc(transmitter.country)}`,
    `IRS_ACCOUNT_ID=${esc(transmitter.irsAccountId)}`,
    `EFILE_USERNAME=${esc(transmitter.efileUsername)}`,
  ].join("\r\n");

  const iss = [
    "[ISSUER]",
    `NAME=${esc(issuer.issuerName)}`,
    `EIN_TIN=${esc(issuer.einTin)}`,
    `ADDRESS1=${esc(issuer.address1)}`,
    `ADDRESS2=${esc(issuer.address2)}`,
    `CITY=${esc(issuer.city)}`,
    `STATE=${esc(issuer.state)}`,
    `ZIP=${esc(issuer.zip)}`,
    `COUNTRY=${esc(issuer.country)}`,
    `CONTACT_NAME=${esc(issuer.contactName)}`,
    `EMAIL=${esc(issuer.email)}`,
    `PHONE=${esc(issuer.phone)}`,
    `BUSINESS_TYPE=${esc(issuer.businessType)}`,
  ].join("\r\n");

  const payeeBlocks = payees.map((p, i) =>
    [
      `[PAYEE_${i + 1}]`,
      `FULL_NAME=${esc(p.fullName)}`,
      `SSN_TIN=${esc(p.ssnTin)}`,
      `EMAIL=${esc(p.email)}`,
      `ADDRESS1=${esc(p.address1)}`,
      `ADDRESS2=${esc(p.address2)}`,
      `CITY=${esc(p.city)}`,
      `STATE=${esc(p.state)}`,
      `ZIP=${esc(p.zip)}`,
      `COUNTRY=${esc(p.country)}`,
      `PAYMENT_TYPE=${esc(p.paymentType)}`,
      `FORM_TYPE=${esc(p.formType)}`,
      `AMOUNT=${esc(p.amount)}`,
      `FEDERAL_TAX_WITHHELD=${esc(p.federalTaxWithheld)}`,
      `NOTES=${esc(p.notes)}`,
    ].join("\r\n"),
  );

  return [header, tx, iss, ...payeeBlocks, "[END]"]
    .filter(Boolean)
    .join("\r\n\r\n");
}

/** Example response type for /api/demo (kept for reference) */
export interface DemoResponse {
  message: string;
}

/**
 * WordPress Affiliate Import Types
 */

// WordPress Connection Configuration
export interface WordPressConnection {
  id?: string;
  hostname: string;
  apiKey?: string;
  oauthToken?: string;
  oauthRefreshToken?: string;
  authType: 'api_key' | 'oauth' | 'none';
  status: 'connected' | 'disconnected' | 'error';
  lastConnected?: string;
  plugin?: 'affiliatewp' | 'easy-affiliate' | 'wp-affiliate-manager' | 'custom';
}

// WordPress Affiliate Data Structure
export interface WordPressAffiliate {
  id: number | string;
  wpUserId?: number;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  
  // Payment details
  paymentMethod?: string;
  lastPayoutAmount?: number;
  totalEarnings?: number;
  payoutHistory?: PayoutHistoryItem[];
  
  // Tax information (optional)
  ssn?: string;
  fein?: string;
  taxClassification?: string;
  
  // Address
  address?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  
  // Custom meta fields
  meta?: Record<string, any>;
}

export interface PayoutHistoryItem {
  id: string | number;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'failed';
  method: string;
}

// Import Request/Response
export interface WordPressImportRequest {
  wpConnection: WordPressConnection;
  affiliateIds: (string | number)[];
  importSensitiveFields: boolean; // SSN/FEIN
  targetFormType: 'w9' | '1099';
  fieldMapping?: Record<string, string>; // WP field -> our field
}

export interface WordPressImportResponse {
  success: boolean;
  importedCount: number;
  skippedCount: number;
  errors: ImportError[];
  auditLogId?: string;
  importedVendorIds: string[];
}

export interface ImportError {
  affiliateId: string | number;
  affiliateEmail?: string;
  error: string;
  code: 'duplicate' | 'validation' | 'mapping' | 'permission' | 'network';
}

// WordPress API Response Types
export interface WordPressApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
  page?: number;
  perPage?: number;
  error?: string;
}

export interface WordPressAffiliatesListResponse {
  affiliates: WordPressAffiliate[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

// Connection Test
export interface WordPressConnectionTestRequest {
  hostname: string;
  apiKey?: string;
  oauthToken?: string;
  authType: 'api_key' | 'oauth' | 'none';
}

export interface WordPressConnectionTestResponse {
  success: boolean;
  status: 'connected' | 'error';
  message: string;
  detectedPlugin?: string;
  availableScopes?: string[];
  affiliateCount?: number;
}

// Audit Log
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'wp_import' | 'wp_connection_test' | 'vendor_create' | 'vendor_update';
  wpSiteHostname?: string;
  importedIds?: (string | number)[];
  targetFormType?: 'w9' | '1099';
  importCount?: number;
  metadata?: Record<string, any>;
}

// Vendor Schema (our internal vendor representation)
export interface VendorData {
  id?: string;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  
  // Tax info
  ssn?: string; // encrypted
  ein?: string; // encrypted
  taxClassification?: string;
  
  // Address
  address1: string;
  address2?: string;
  city: string;
  state: StateCode;
  zip: string;
  country: CountryCode;
  
  // Payment
  paymentMethod?: string;
  totalPaid?: number;
  
  // Source tracking
  source: 'manual' | 'wordpress' | 'csv' | 'api';
  wpUserId?: number;
  wpSiteHostname?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  meta?: Record<string, any>;
}
