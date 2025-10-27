# WordPress Affiliate Import Feature

## Overview

This feature allows you to import affiliate/vendor data from a connected WordPress site directly into the 1099/W-9 form system. It supports popular WordPress affiliate plugins and includes secure handling of sensitive tax information.

## Features

- **Secure Connection**: HTTPS-only connections with API key or OAuth authentication
- **Plugin Detection**: Automatically detects and maps data from AffiliateWP, Easy Affiliate, and WP Affiliate Manager
- **Selective Import**: Choose specific affiliates to import with search and filter capabilities
- **Sensitive Data Handling**: Optional SSN/FEIN import with AES-256-GCM encryption
- **Duplicate Prevention**: Automatically detects and updates existing vendors
- **Audit Logging**: Full audit trail of all import operations
- **Error Handling**: Clear, actionable error messages with retry logic

## Architecture

### Backend Services

1. **WordPress Client** (`server/services/wordpress-client.ts`)
   - REST API client for WordPress communication
   - Supports multiple affiliate plugin formats
   - HTTPS validation and authentication

2. **Encryption Service** (`server/services/encryption.ts`)
   - AES-256-GCM encryption for SSN/FEIN
   - Key derivation with PBKDF2
   - Secure masking for display

3. **Vendor Storage** (`server/services/vendor-storage.ts`)
   - In-memory vendor database (replace with PostgreSQL/MongoDB in production)
   - Duplicate detection by email and WP user ID
   - Automatic encryption of sensitive fields

4. **Audit Log** (`server/services/audit-log.ts`)
   - Tracks all import operations
   - Records timestamp, user, WP site, and imported IDs

### API Endpoints

- `POST /api/wordpress/test-connection` - Test WordPress site connectivity
- `POST /api/wordpress/fetch-affiliates` - Retrieve affiliate list
- `POST /api/wordpress/import` - Import selected affiliates

### Frontend Components

- **ImportFromWordPress** (`client/components/forms/ImportFromWordPress.tsx`)
  - Multi-step modal: Connection → Selection → Results
  - Real-time search and filtering
  - Progress indicators and error display

## Setup Instructions

### 1. Environment Configuration

Add the encryption key to your `.env` file:

```bash
# Generate a secure key (Linux/Mac):
openssl rand -base64 32

# Or use Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Update `.env`:
```
ENCRYPTION_KEY=your-generated-key-here
```

### 2. WordPress Site Requirements

Your WordPress site needs:

1. **HTTPS enabled** (required for security)
2. **REST API enabled** (WordPress default)
3. **Compatible affiliate plugin** installed:
   - AffiliateWP
   - Easy Affiliate
   - WP Affiliate Manager
   - Or custom plugin (see example below)

### 3. WordPress Connector Plugin

Install the provided connector plugin on your WordPress site to expose affiliate data via REST API.

See `wordpress-connector-plugin/` directory for:
- Plugin installation files
- API endpoint implementation
- Authentication setup

## Usage Guide

### For End Users

1. **Access the Import Button**
   - Navigate to the 1099 or W-9 page
   - Click "Import from WordPress" in the header

2. **Connect to WordPress**
   - Enter your WordPress site URL (must be HTTPS)
   - Choose authentication type:
     - **API Key**: Recommended for security
     - **OAuth 2.0**: For advanced setups
     - **None**: For public APIs (not recommended)
   - Enter API key if using API Key auth
   - Click "Test Connection"

3. **Select Affiliates**
   - Browse the list of detected affiliates
   - Use search to filter by name or email
   - Select individual affiliates or "Select All"
   - **Optional**: Check "Import sensitive fields (SSN/FEIN)" if:
     - Your WordPress site supports it
     - You have explicit permission
     - The data will be encrypted at rest

4. **Import**
   - Click "Import X Affiliate(s)"
   - Review the results:
     - Imported count
     - Skipped count (duplicates)
     - Errors (if any)
   - Check audit log for tracking

### For Developers

#### Authentication Setup

**API Key Method** (Recommended):

1. Generate API key on WordPress:
```php
// In WordPress admin or custom plugin
$api_key = wp_generate_password(32, true, true);
update_option('affiliate_api_key', $api_key);
```

2. Validate in REST endpoint:
```php
function validate_api_key($request) {
    $provided_key = $request->get_header('Authorization');
    $stored_key = get_option('affiliate_api_key');
    
    if ('Bearer ' . $stored_key !== $provided_key) {
        return new WP_Error('unauthorized', 'Invalid API key', ['status' => 401]);
    }
    
    return true;
}
```

#### Custom Plugin Integration

If you're using a custom affiliate system, implement these endpoints:

**Status Endpoint** (`/wp-json/ourplugin/v1/status`):
```json
{
  "plugin": "custom-affiliate",
  "version": "1.0.0",
  "scopes": ["read:affiliates", "read:payments"],
  "affiliate_count": 150
}
```

**Affiliates List** (`/wp-json/ourplugin/v1/affiliates?page=1&per_page=50`):
```json
{
  "data": [
    {
      "id": 123,
      "user_id": 456,
      "email": "affiliate@example.com",
      "display_name": "John Doe",
      "first_name": "John",
      "last_name": "Doe",
      "company_name": "Acme Corp",
      "payment_method": "PayPal",
      "last_payout_amount": 500.00,
      "total_earnings": 5000.00,
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip": "10001",
      "country": "US",
      "meta": {
        "tax_classification": "individual",
        "custom_field": "value"
      }
    }
  ],
  "total": 150,
  "page": 1,
  "per_page": 50
}
```

**Single Affiliate** (`/wp-json/ourplugin/v1/affiliates/123`):
Returns single affiliate object.

## Security Considerations

### Encryption

- **Algorithm**: AES-256-GCM with PBKDF2 key derivation
- **Iterations**: 100,000 (OWASP recommended)
- **Storage Format**: `salt:iv:tag:ciphertext` (base64)
- **Key Management**: Store `ENCRYPTION_KEY` in secure environment variables

### Authentication Scopes

The system supports permission-based imports:

- `read:affiliates` - Basic affiliate information
- `read:payments` - Payment history and amounts
- `read:identifiers` - SSN/FEIN (requires explicit user confirmation)

### Data Validation

All imported data is:
1. Validated server-side (SSN/EIN format, email, required fields)
2. Sanitized to prevent injection attacks
3. Checked for duplicates before insertion
4. Encrypted if sensitive (SSN/FEIN)

### HTTPS Requirement

All WordPress connections **must** use HTTPS. The system will reject `http://` URLs to prevent man-in-the-middle attacks.

## Error Handling

### Common Error Codes

- **401 Unauthorized**: Invalid API key or OAuth token
- **403 Forbidden**: Missing required scope (e.g., `read:identifiers`)
- **422 Validation Error**: Data format issues or mapping conflicts
- **429 Rate Limit**: Too many requests, retry after delay

### Error Messages

The system provides clear, actionable errors:

```
❌ "401 — Invalid API key"
❌ "403 — Missing scope: read:identifiers"
❌ "422 — Mapping conflict: duplicate email"
❌ "Invalid SSN format"
❌ "WordPress connection must use HTTPS"
```

## Testing

### Unit Tests

Run tests for encryption and validation:

```bash
pnpm test
```

Test files:
- `server/services/__tests__/encryption.test.ts`
- `server/services/__tests__/vendor-storage.test.ts`

### Manual Testing Checklist

- [ ] Connection test succeeds with valid API key
- [ ] Connection test fails with invalid API key
- [ ] Affiliates list loads with pagination
- [ ] Search filters work correctly
- [ ] Import creates new vendors
- [ ] Import updates existing vendors (no duplicates)
- [ ] SSN/FEIN encrypted when imported
- [ ] Audit log created for each import
- [ ] Error messages display correctly
- [ ] HTTPS validation rejects http:// URLs

## Database Migration (Production)

The current implementation uses in-memory storage. For production:

### PostgreSQL Schema

```sql
CREATE TABLE vendors (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company_name VARCHAR(255),
    
    -- Encrypted fields
    ssn_encrypted TEXT,
    ein_encrypted TEXT,
    
    -- Tax info
    tax_classification VARCHAR(50),
    
    -- Address
    address1 VARCHAR(255) NOT NULL,
    address2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip VARCHAR(20) NOT NULL,
    country VARCHAR(2) NOT NULL,
    
    -- Payment
    payment_method VARCHAR(50),
    total_paid DECIMAL(12, 2),
    
    -- Source tracking
    source VARCHAR(20) NOT NULL,
    wp_user_id INTEGER,
    wp_site_hostname VARCHAR(255),
    
    -- Metadata
    meta JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendors_email ON vendors(email);
CREATE INDEX idx_vendors_wp_user ON vendors(wp_user_id, wp_site_hostname);
CREATE INDEX idx_vendors_source ON vendors(source);

CREATE TABLE audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(50) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL,
    wp_site_hostname VARCHAR(255),
    imported_ids TEXT[],
    target_form_type VARCHAR(10),
    import_count INTEGER,
    metadata JSONB
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
```

### MongoDB Schema

```javascript
// vendors collection
{
  _id: "vendor_123",
  email: "affiliate@example.com",
  fullName: "John Doe",
  firstName: "John",
  lastName: "Doe",
  companyName: "Acme Corp",
  
  ssnEncrypted: "encrypted_value",
  einEncrypted: "encrypted_value",
  taxClassification: "individual",
  
  address1: "123 Main St",
  city: "New York",
  state: "NY",
  zip: "10001",
  country: "US",
  
  paymentMethod: "PayPal",
  totalPaid: 5000.00,
  
  source: "wordpress",
  wpUserId: 456,
  wpSiteHostname: "https://example.com",
  
  meta: {},
  createdAt: ISODate("2025-01-01T00:00:00Z"),
  updatedAt: ISODate("2025-01-01T00:00:00Z")
}

// Indexes
db.vendors.createIndex({ email: 1 }, { unique: true })
db.vendors.createIndex({ wpUserId: 1, wpSiteHostname: 1 })
db.vendors.createIndex({ source: 1 })
```

## Troubleshooting

### "Failed to fetch affiliates"

1. Check WordPress site is accessible
2. Verify API endpoints exist
3. Check browser console for CORS errors
4. Ensure WordPress REST API is enabled

### "Invalid API key"

1. Regenerate API key in WordPress
2. Ensure no extra spaces when copying
3. Check API key is saved in WordPress options

### "Import failed: Network error"

1. Check HTTPS is used
2. Verify no firewall blocking
3. Check WordPress server is running
4. Review server logs for errors

## Future Enhancements

- [ ] OAuth 2.0 implementation
- [ ] Batch import job queue for large datasets
- [ ] Real-time import progress via WebSockets
- [ ] Export audit logs to CSV
- [ ] WordPress plugin marketplace listing
- [ ] Support for additional affiliate plugins
- [ ] Automated field mapping suggestions
- [ ] Import scheduling (cron jobs)
- [ ] Webhook notifications for import completion

## Support

For issues or questions:
- Check error messages in the UI
- Review audit logs for import details
- Check server console for detailed errors
- Refer to WordPress connector plugin documentation
