/**
 * Audit Log Service
 * Tracks all WordPress import operations and vendor changes
 */

import { AuditLogEntry } from '@shared/api';

// In-memory storage (replace with database in production)
const auditLogs = new Map<string, AuditLogEntry>();

/**
 * Generate unique audit log ID
 */
function generateAuditLogId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create audit log entry
 */
export function createAuditLog(
  entry: Omit<AuditLogEntry, 'id' | 'timestamp'>,
): AuditLogEntry {
  const id = generateAuditLogId();
  const timestamp = new Date().toISOString();
  
  const auditEntry: AuditLogEntry = {
    ...entry,
    id,
    timestamp,
  };
  
  auditLogs.set(id, auditEntry);
  
  // Log to console for debugging
  console.log('[AUDIT]', auditEntry);
  
  return auditEntry;
}

/**
 * Get audit log by ID
 */
export function getAuditLog(id: string): AuditLogEntry | null {
  return auditLogs.get(id) || null;
}

/**
 * List all audit logs
 */
export function listAuditLogs(
  filters?: {
    userId?: string;
    action?: AuditLogEntry['action'];
    wpSiteHostname?: string;
    limit?: number;
  },
): AuditLogEntry[] {
  let logs = Array.from(auditLogs.values());
  
  if (filters) {
    if (filters.userId) {
      logs = logs.filter((log) => log.userId === filters.userId);
    }
    if (filters.action) {
      logs = logs.filter((log) => log.action === filters.action);
    }
    if (filters.wpSiteHostname) {
      logs = logs.filter(
        (log) =>
          log.wpSiteHostname?.toLowerCase() === filters.wpSiteHostname?.toLowerCase(),
      );
    }
    if (filters.limit) {
      logs = logs.slice(0, filters.limit);
    }
  }
  
  // Sort by timestamp descending
  return logs.sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}

/**
 * Log WordPress import operation
 */
export function logWordPressImport(
  userId: string,
  userName: string,
  wpSiteHostname: string,
  importedIds: (string | number)[],
  targetFormType: 'w9' | '1099',
  metadata?: Record<string, any>,
): AuditLogEntry {
  return createAuditLog({
    userId,
    userName,
    action: 'wp_import',
    wpSiteHostname,
    importedIds,
    targetFormType,
    importCount: importedIds.length,
    metadata,
  });
}

/**
 * Log WordPress connection test
 */
export function logConnectionTest(
  userId: string,
  userName: string,
  wpSiteHostname: string,
  success: boolean,
  metadata?: Record<string, any>,
): AuditLogEntry {
  return createAuditLog({
    userId,
    userName,
    action: 'wp_connection_test',
    wpSiteHostname,
    metadata: {
      ...metadata,
      success,
    },
  });
}

/**
 * Log vendor creation
 */
export function logVendorCreate(
  userId: string,
  userName: string,
  vendorId: string,
  metadata?: Record<string, any>,
): AuditLogEntry {
  return createAuditLog({
    userId,
    userName,
    action: 'vendor_create',
    metadata: {
      ...metadata,
      vendorId,
    },
  });
}

/**
 * Log vendor update
 */
export function logVendorUpdate(
  userId: string,
  userName: string,
  vendorId: string,
  metadata?: Record<string, any>,
): AuditLogEntry {
  return createAuditLog({
    userId,
    userName,
    action: 'vendor_update',
    metadata: {
      ...metadata,
      vendorId,
    },
  });
}

/**
 * Get total audit log count
 */
export function getAuditLogCount(): number {
  return auditLogs.size;
}
