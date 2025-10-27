/**
 * Vendor Storage Service
 * Handles CRUD operations for vendor data
 * In production, this would use a real database (PostgreSQL, MongoDB, etc.)
 */

import { VendorData } from '@shared/api';
import { encrypt, decrypt } from './encryption';

// In-memory storage (replace with database in production)
const vendors = new Map<string, VendorData>();

/**
 * Generate unique vendor ID
 */
function generateVendorId(): string {
  return `vendor_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Find vendor by email
 */
export function findVendorByEmail(email: string): VendorData | null {
  for (const vendor of vendors.values()) {
    if (vendor.email.toLowerCase() === email.toLowerCase()) {
      return vendor;
    }
  }
  return null;
}

/**
 * Find vendor by WordPress user ID and hostname
 */
export function findVendorByWPUser(wpUserId: number, wpSiteHostname: string): VendorData | null {
  for (const vendor of vendors.values()) {
    if (
      vendor.wpUserId === wpUserId &&
      vendor.wpSiteHostname?.toLowerCase() === wpSiteHostname.toLowerCase()
    ) {
      return vendor;
    }
  }
  return null;
}

/**
 * Create new vendor
 */
export function createVendor(data: Omit<VendorData, 'id' | 'createdAt' | 'updatedAt'>): VendorData {
  const id = generateVendorId();
  const now = new Date().toISOString();
  
  // Encrypt sensitive fields
  const vendor: VendorData = {
    ...data,
    id,
    ssn: data.ssn ? encrypt(data.ssn) : undefined,
    ein: data.ein ? encrypt(data.ein) : undefined,
    createdAt: now,
    updatedAt: now,
  };
  
  vendors.set(id, vendor);
  return vendor;
}

/**
 * Update existing vendor
 */
export function updateVendor(id: string, data: Partial<VendorData>): VendorData {
  const existing = vendors.get(id);
  if (!existing) {
    throw new Error(`Vendor ${id} not found`);
  }
  
  const updated: VendorData = {
    ...existing,
    ...data,
    id: existing.id,
    ssn: data.ssn ? encrypt(data.ssn) : existing.ssn,
    ein: data.ein ? encrypt(data.ein) : existing.ein,
    updatedAt: new Date().toISOString(),
  };
  
  vendors.set(id, updated);
  return updated;
}

/**
 * Get vendor by ID
 */
export function getVendor(id: string): VendorData | null {
  return vendors.get(id) || null;
}

/**
 * Get vendor with decrypted sensitive fields
 * Only call when necessary and with proper authorization
 */
export function getVendorDecrypted(id: string): VendorData | null {
  const vendor = vendors.get(id);
  if (!vendor) return null;
  
  return {
    ...vendor,
    ssn: vendor.ssn ? decrypt(vendor.ssn) : undefined,
    ein: vendor.ein ? decrypt(vendor.ein) : undefined,
  };
}

/**
 * List all vendors
 */
export function listVendors(): VendorData[] {
  return Array.from(vendors.values());
}

/**
 * Delete vendor
 */
export function deleteVendor(id: string): boolean {
  return vendors.delete(id);
}

/**
 * Check if vendor exists
 */
export function vendorExists(email: string): boolean {
  return findVendorByEmail(email) !== null;
}

/**
 * Get vendor count
 */
export function getVendorCount(): number {
  return vendors.size;
}
