/**
 * WordPress Integration API Routes
 */

import { RequestHandler } from 'express';
import {
  WordPressConnectionTestRequest,
  WordPressConnectionTestResponse,
  WordPressImportRequest,
  WordPressImportResponse,
  WordPressAffiliate,
  VendorData,
  ImportError,
  WordPressConnection,
} from '@shared/api';
import { WordPressClient } from '../services/wordpress-client';
import {
  createVendor,
  findVendorByEmail,
  findVendorByWPUser,
  updateVendor,
} from '../services/vendor-storage';
import { logWordPressImport, logConnectionTest } from '../services/audit-log';
import { validateSSN, validateEIN } from '../services/encryption';

/**
 * Test WordPress connection
 * POST /api/wordpress/test-connection
 */
export const handleTestConnection: RequestHandler = async (req, res) => {
  try {
    const body = req.body as WordPressConnectionTestRequest;

    // Validate required fields
    if (!body.hostname) {
      res.status(400).json({
        success: false,
        status: 'error',
        message: 'Hostname is required',
      } as WordPressConnectionTestResponse);
      return;
    }

    // Validate HTTPS
    if (!body.hostname.startsWith('https://')) {
      res.status(400).json({
        success: false,
        status: 'error',
        message: 'WordPress connection must use HTTPS',
      } as WordPressConnectionTestResponse);
      return;
    }

    const connection: WordPressConnection = {
      hostname: body.hostname,
      apiKey: body.apiKey,
      oauthToken: body.oauthToken,
      authType: body.authType,
      status: 'disconnected',
    };

    const client = new WordPressClient(connection);
    const result = await client.testConnection();

    // Log the connection test
    logConnectionTest(
      'current_user_id', // TODO: Get from session/auth
      'Current User', // TODO: Get from session/auth
      body.hostname,
      result.success,
      {
        plugin: result.detectedPlugin,
        affiliateCount: result.affiliateCount,
      },
    );

    res.json(result);
  } catch (error) {
    console.error('Connection test error:', error);
    res.status(500).json({
      success: false,
      status: 'error',
      message: error instanceof Error ? error.message : 'Connection test failed',
    } as WordPressConnectionTestResponse);
  }
};

/**
 * Fetch affiliates from WordPress
 * POST /api/wordpress/fetch-affiliates
 */
export const handleFetchAffiliates: RequestHandler = async (req, res) => {
  try {
    const { connection, page = 1, perPage = 50 } = req.body;

    if (!connection || !connection.hostname) {
      res.status(400).json({
        success: false,
        error: 'Connection configuration is required',
      });
      return;
    }

    const client = new WordPressClient(connection);
    const result = await client.fetchAffiliates(page, perPage);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Fetch affiliates error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch affiliates',
    });
  }
};

/**
 * Import affiliates from WordPress
 * POST /api/wordpress/import
 */
export const handleImportAffiliates: RequestHandler = async (req, res) => {
  try {
    const body = req.body as WordPressImportRequest;

    // Validate request
    if (!body.wpConnection || !body.affiliateIds || body.affiliateIds.length === 0) {
      res.status(400).json({
        success: false,
        importedCount: 0,
        skippedCount: 0,
        errors: [
          {
            affiliateId: '',
            error: 'Invalid request: connection and affiliate IDs required',
            code: 'validation',
          },
        ],
        importedVendorIds: [],
      } as WordPressImportResponse);
      return;
    }

    const client = new WordPressClient(body.wpConnection);
    const errors: ImportError[] = [];
    const importedVendorIds: string[] = [];
    let importedCount = 0;
    let skippedCount = 0;

    // Process each affiliate
    for (const affiliateId of body.affiliateIds) {
      try {
        // Fetch affiliate data
        const affiliate = await client.fetchAffiliate(affiliateId);

        // Validate required fields
        const validationError = validateAffiliate(affiliate, body.importSensitiveFields);
        if (validationError) {
          errors.push({
            affiliateId,
            affiliateEmail: affiliate.email,
            error: validationError,
            code: 'validation',
          });
          skippedCount++;
          continue;
        }

        // Check for duplicates
        let existingVendor = findVendorByEmail(affiliate.email);
        if (!existingVendor && affiliate.wpUserId) {
          existingVendor = findVendorByWPUser(
            affiliate.wpUserId,
            body.wpConnection.hostname,
          );
        }

        if (existingVendor) {
          // Update existing vendor
          const updatedVendor = updateVendor(existingVendor.id!, {
            fullName: affiliate.displayName,
            firstName: affiliate.firstName,
            lastName: affiliate.lastName,
            companyName: affiliate.companyName,
            paymentMethod: affiliate.paymentMethod,
            totalPaid: affiliate.totalEarnings,
            wpUserId: affiliate.wpUserId,
            wpSiteHostname: body.wpConnection.hostname,
            meta: {
              ...existingVendor.meta,
              lastImportDate: new Date().toISOString(),
              wpAffiliateId: affiliate.id,
            },
          });

          importedVendorIds.push(updatedVendor.id!);
          importedCount++;
        } else {
          // Create new vendor
          const vendorData = mapAffiliateToVendor(
            affiliate,
            body.wpConnection.hostname,
            body.importSensitiveFields,
          );

          const newVendor = createVendor(vendorData);
          importedVendorIds.push(newVendor.id!);
          importedCount++;
        }
      } catch (error) {
        errors.push({
          affiliateId,
          error: error instanceof Error ? error.message : 'Import failed',
          code: 'network',
        });
        skippedCount++;
      }
    }

    // Create audit log
    const auditLog = logWordPressImport(
      'current_user_id', // TODO: Get from session/auth
      'Current User', // TODO: Get from session/auth
      body.wpConnection.hostname,
      body.affiliateIds,
      body.targetFormType,
      {
        importedCount,
        skippedCount,
        errorCount: errors.length,
        importSensitiveFields: body.importSensitiveFields,
      },
    );

    const response: WordPressImportResponse = {
      success: true,
      importedCount,
      skippedCount,
      errors,
      auditLogId: auditLog.id,
      importedVendorIds,
    };

    res.json(response);
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({
      success: false,
      importedCount: 0,
      skippedCount: 0,
      errors: [
        {
          affiliateId: '',
          error: error instanceof Error ? error.message : 'Import failed',
          code: 'network',
        },
      ],
      importedVendorIds: [],
    } as WordPressImportResponse);
  }
};

/**
 * Validate affiliate data
 */
function validateAffiliate(
  affiliate: WordPressAffiliate,
  importSensitiveFields: boolean,
): string | null {
  if (!affiliate.email) {
    return 'Email is required';
  }

  if (!affiliate.displayName) {
    return 'Name is required';
  }

  // Validate SSN/FEIN if importing sensitive fields
  if (importSensitiveFields) {
    if (affiliate.ssn && !validateSSN(affiliate.ssn)) {
      return 'Invalid SSN format';
    }
    if (affiliate.fein && !validateEIN(affiliate.fein)) {
      return 'Invalid FEIN/EIN format';
    }
  }

  return null;
}

/**
 * Map WordPress affiliate to vendor data
 */
function mapAffiliateToVendor(
  affiliate: WordPressAffiliate,
  wpSiteHostname: string,
  importSensitiveFields: boolean,
): Omit<VendorData, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    email: affiliate.email,
    fullName: affiliate.displayName,
    firstName: affiliate.firstName,
    lastName: affiliate.lastName,
    companyName: affiliate.companyName,
    ssn: importSensitiveFields ? affiliate.ssn : undefined,
    ein: importSensitiveFields ? affiliate.fein : undefined,
    taxClassification: affiliate.taxClassification,
    address1: affiliate.address || '',
    address2: affiliate.address2,
    city: affiliate.city || '',
    state: (affiliate.state || '') as any,
    zip: affiliate.zip || '',
    country: (affiliate.country || 'US') as any,
    paymentMethod: affiliate.paymentMethod,
    totalPaid: affiliate.totalEarnings,
    source: 'wordpress',
    wpUserId: affiliate.wpUserId,
    wpSiteHostname,
    meta: {
      wpAffiliateId: affiliate.id,
      lastPayoutAmount: affiliate.lastPayoutAmount,
      importDate: new Date().toISOString(),
      ...affiliate.meta,
    },
  };
}
