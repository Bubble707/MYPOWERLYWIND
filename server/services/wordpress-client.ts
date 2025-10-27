/**
 * WordPress REST API Client
 * Handles connection and data fetching from WordPress affiliate plugins
 */

import {
  WordPressConnection,
  WordPressAffiliate,
  WordPressAffiliatesListResponse,
  WordPressConnectionTestResponse,
} from '@shared/api';

export class WordPressClient {
  private connection: WordPressConnection;

  constructor(connection: WordPressConnection) {
    this.connection = connection;
  }

  /**
   * Test connection to WordPress site
   */
  async testConnection(): Promise<WordPressConnectionTestResponse> {
    try {
      const url = this.buildUrl('/wp-json/ourplugin/v1/status');
      const response = await this.makeRequest<{
        plugin: string;
        version: string;
        scopes: string[];
        affiliate_count: number;
      }>(url);

      return {
        success: true,
        status: 'connected',
        message: 'Successfully connected to WordPress site',
        detectedPlugin: response.plugin,
        availableScopes: response.scopes,
        affiliateCount: response.affiliate_count,
      };
    } catch (error) {
      return {
        success: false,
        status: 'error',
        message: this.getErrorMessage(error),
      };
    }
  }

  /**
   * Fetch affiliates from WordPress
   */
  async fetchAffiliates(
    page: number = 1,
    perPage: number = 50,
  ): Promise<WordPressAffiliatesListResponse> {
    try {
      const url = this.buildUrl('/wp-json/ourplugin/v1/affiliates', {
        page: String(page),
        per_page: String(perPage),
      });

      const response = await this.makeRequest<{
        data: any[];
        total: number;
        page: number;
        per_page: number;
      }>(url);

      const affiliates = response.data.map((item) => this.mapAffiliate(item));

      return {
        affiliates,
        total: response.total,
        page: response.page,
        perPage: response.per_page,
        hasMore: response.page * response.per_page < response.total,
      };
    } catch (error) {
      throw new Error(`Failed to fetch affiliates: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Fetch specific affiliate by ID
   */
  async fetchAffiliate(affiliateId: string | number): Promise<WordPressAffiliate> {
    try {
      const url = this.buildUrl(`/wp-json/ourplugin/v1/affiliates/${affiliateId}`);
      const response = await this.makeRequest<any>(url);
      return this.mapAffiliate(response);
    } catch (error) {
      throw new Error(`Failed to fetch affiliate ${affiliateId}: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Map WordPress affiliate data to our schema
   * Handles different affiliate plugin formats
   */
  private mapAffiliate(data: any): WordPressAffiliate {
    // Detect plugin type and map accordingly
    if (this.connection.plugin === 'affiliatewp') {
      return this.mapAffiliateWP(data);
    } else if (this.connection.plugin === 'easy-affiliate') {
      return this.mapEasyAffiliate(data);
    } else if (this.connection.plugin === 'wp-affiliate-manager') {
      return this.mapWPAffiliateManager(data);
    } else {
      return this.mapGenericAffiliate(data);
    }
  }

  /**
   * Map AffiliateWP data
   */
  private mapAffiliateWP(data: any): WordPressAffiliate {
    return {
      id: data.affiliate_id || data.id,
      wpUserId: data.user_id,
      email: data.email || data.user?.user_email,
      displayName: data.display_name || data.name,
      firstName: data.first_name,
      lastName: data.last_name,
      companyName: data.company_name,
      paymentMethod: data.payment_method || data.meta?.payment_method,
      lastPayoutAmount: parseFloat(data.last_payout_amount || '0'),
      totalEarnings: parseFloat(data.earnings || data.total_earnings || '0'),
      ssn: data.meta?.ssn,
      fein: data.meta?.ein || data.meta?.fein,
      taxClassification: data.meta?.tax_classification,
      address: data.address || data.meta?.address,
      address2: data.address_2 || data.meta?.address_2,
      city: data.city || data.meta?.city,
      state: data.state || data.meta?.state,
      zip: data.zip || data.meta?.zip,
      country: data.country || data.meta?.country || 'US',
      meta: data.meta || {},
    };
  }

  /**
   * Map Easy Affiliate data
   */
  private mapEasyAffiliate(data: any): WordPressAffiliate {
    return {
      id: data.id,
      wpUserId: data.user_id,
      email: data.email,
      displayName: data.display_name || `${data.first_name} ${data.last_name}`.trim(),
      firstName: data.first_name,
      lastName: data.last_name,
      companyName: data.company,
      paymentMethod: data.payout_method,
      lastPayoutAmount: parseFloat(data.last_payment || '0'),
      totalEarnings: parseFloat(data.total_commissions || '0'),
      ssn: data.tax_info?.ssn,
      fein: data.tax_info?.ein,
      address: data.address?.street,
      city: data.address?.city,
      state: data.address?.state,
      zip: data.address?.postal_code,
      country: data.address?.country || 'US',
      meta: data.custom_fields || {},
    };
  }

  /**
   * Map WP Affiliate Manager data
   */
  private mapWPAffiliateManager(data: any): WordPressAffiliate {
    return {
      id: data.member_id || data.id,
      wpUserId: data.wp_user_id,
      email: data.email,
      displayName: data.display_name,
      firstName: data.first_name,
      lastName: data.last_name,
      companyName: data.company_name,
      paymentMethod: data.payment_preference,
      lastPayoutAmount: parseFloat(data.last_payment_amount || '0'),
      totalEarnings: parseFloat(data.total_commission || '0'),
      address: data.street_address,
      city: data.city,
      state: data.state,
      zip: data.zipcode,
      country: data.country || 'US',
      meta: data.meta_data || {},
    };
  }

  /**
   * Generic mapper for custom implementations
   */
  private mapGenericAffiliate(data: any): WordPressAffiliate {
    return {
      id: data.id,
      wpUserId: data.user_id || data.wp_user_id,
      email: data.email,
      displayName: data.display_name || data.name || data.full_name,
      firstName: data.first_name,
      lastName: data.last_name,
      companyName: data.company_name || data.company,
      paymentMethod: data.payment_method || data.payout_method,
      lastPayoutAmount: parseFloat(data.last_payout_amount || data.last_payment || '0'),
      totalEarnings: parseFloat(data.total_earnings || data.total_paid || '0'),
      ssn: data.ssn,
      fein: data.ein || data.fein,
      taxClassification: data.tax_classification,
      address: data.address || data.address1,
      address2: data.address2,
      city: data.city,
      state: data.state,
      zip: data.zip || data.postal_code || data.zipcode,
      country: data.country || 'US',
      meta: data.meta || data.custom_fields || {},
    };
  }

  /**
   * Build WordPress API URL
   */
  private buildUrl(path: string, params?: Record<string, string>): string {
    const hostname = this.connection.hostname.replace(/\/$/, '');
    const url = new URL(`${hostname}${path}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    return url.toString();
  }

  /**
   * Make authenticated request to WordPress
   */
  private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authentication
    if (this.connection.authType === 'api_key' && this.connection.apiKey) {
      headers['Authorization'] = `Bearer ${this.connection.apiKey}`;
    } else if (this.connection.authType === 'oauth' && this.connection.oauthToken) {
      headers['Authorization'] = `Bearer ${this.connection.oauthToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('401 — Invalid API key or OAuth token');
      } else if (response.status === 403) {
        const data = await response.json().catch(() => ({}));
        const missingScope = data.missing_scope || 'unknown';
        throw new Error(`403 — Missing scope: ${missingScope}`);
      } else if (response.status === 422) {
        throw new Error('422 — Mapping conflict or validation error');
      } else if (response.status === 429) {
        throw new Error('429 — Rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }

    return response.json();
  }

  /**
   * Extract error message
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  /**
   * Validate SSL certificate (HTTPS only)
   */
  private validateConnection(): void {
    const url = new URL(this.connection.hostname);
    if (url.protocol !== 'https:') {
      throw new Error('WordPress connection must use HTTPS');
    }
  }
}
