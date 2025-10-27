# Affiliate REST API Connector - WordPress Plugin

This WordPress plugin exposes affiliate data via REST API for secure import into 1099/W-9 tax form systems.

## Installation

1. **Upload the plugin:**
   - Copy `affiliate-rest-api.php` to `/wp-content/plugins/affiliate-rest-api/`
   - Or zip the file and upload via WordPress admin

2. **Activate the plugin:**
   - Go to WordPress Admin → Plugins
   - Find "Affiliate REST API Connector"
   - Click "Activate"

3. **Generate API Key:**
   - Go to Settings → Affiliate API
   - Click "Generate New API Key"
   - Copy the API key for use in your 1099/W-9 system

## Supported Affiliate Plugins

The connector automatically detects and works with:

- **AffiliateWP** - Fully supported with all meta fields
- **WP Affiliate Manager** - Full support
- **Easy Affiliate** - Full support
- **Custom Implementations** - Works with users assigned 'affiliate' role

## API Endpoints

### 1. Status Endpoint

**GET** `/wp-json/ourplugin/v1/status`

Returns plugin information and affiliate count.

**Response:**
```json
{
  "plugin": "affiliatewp",
  "version": "1.0.0",
  "scopes": ["read:affiliates", "read:payments", "read:identifiers"],
  "affiliate_count": 150
}
```

### 2. List Affiliates

**GET** `/wp-json/ourplugin/v1/affiliates?page=1&per_page=50`

Returns paginated list of affiliates.

**Parameters:**
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Results per page (default: 50, max: 100)

**Response:**
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
      "address2": "Suite 100",
      "city": "New York",
      "state": "NY",
      "zip": "10001",
      "country": "US",
      "meta": {
        "tax_classification": "individual"
      }
    }
  ],
  "total": 150,
  "page": 1,
  "per_page": 50
}
```

### 3. Single Affiliate

**GET** `/wp-json/ourplugin/v1/affiliates/123`

Returns single affiliate by ID.

**Response:** Same as single affiliate object in list endpoint.

## Authentication

All endpoints require Bearer token authentication:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://yoursite.com/wp-json/ourplugin/v1/status
```

## Custom Implementation

If you're using a custom affiliate system, the plugin expects:

1. **User Role:** Users should have 'affiliate' role
2. **User Meta:** Store affiliate data in user meta:
   - `first_name` - First name
   - `last_name` - Last name
   - `billing_company` - Company name
   - `billing_address_1` - Address line 1
   - `billing_address_2` - Address line 2
   - `billing_city` - City
   - `billing_state` - State (2-letter code)
   - `billing_postcode` - ZIP code
   - `billing_country` - Country (2-letter code)
   - `payment_method` - Payment method
   - `last_payout` - Last payout amount (numeric)
   - `total_earnings` - Total earnings (numeric)
   - `tax_classification` - Tax classification (optional)

### Example: Add Custom Affiliate

```php
// Create user with affiliate role
$user_id = wp_create_user('affiliate123', 'password', 'affiliate@example.com');
$user = get_user_by('id', $user_id);
$user->set_role('affiliate');

// Add affiliate metadata
update_user_meta($user_id, 'first_name', 'John');
update_user_meta($user_id, 'last_name', 'Doe');
update_user_meta($user_id, 'billing_company', 'Acme Corp');
update_user_meta($user_id, 'billing_address_1', '123 Main St');
update_user_meta($user_id, 'billing_city', 'New York');
update_user_meta($user_id, 'billing_state', 'NY');
update_user_meta($user_id, 'billing_postcode', '10001');
update_user_meta($user_id, 'billing_country', 'US');
update_user_meta($user_id, 'payment_method', 'PayPal');
update_user_meta($user_id, 'total_earnings', 5000.00);
update_user_meta($user_id, 'tax_classification', 'individual');
```

## Security

- **HTTPS Required:** The 1099/W-9 system only accepts HTTPS connections
- **API Key:** 32-character random key generated using WordPress core functions
- **Nonce Validation:** Admin forms use WordPress nonces
- **Permission Checks:** All endpoints validate API key before returning data
- **Data Sanitization:** All inputs are sanitized before storage

## Troubleshooting

### "Authorization header required"

Make sure you're sending the API key in the Authorization header:
```
Authorization: Bearer YOUR_API_KEY
```

### "Invalid API key"

1. Regenerate the API key in Settings → Affiliate API
2. Copy the exact key without extra spaces
3. Update the key in your 1099/W-9 system

### Empty affiliate list

1. Check that you have affiliates in your system
2. Verify affiliate plugin is active
3. For custom implementation, ensure users have 'affiliate' role

### CORS errors

If importing from a different domain, add CORS headers:

```php
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: https://your-tax-system.com');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Authorization, Content-Type');
        return $value;
    });
});
```

## Support

For issues or questions:
- Check WordPress debug log: `wp-content/debug.log`
- Enable WP_DEBUG in `wp-config.php`
- Review API responses using curl or Postman

## License

GPL v2 or later
