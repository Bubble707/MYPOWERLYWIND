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
