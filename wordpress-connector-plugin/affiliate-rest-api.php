<?php
/**
 * Plugin Name: Affiliate REST API Connector
 * Description: Exposes affiliate data via WordPress REST API for 1099/W-9 import
 * Version: 1.0.0
 * Author: Your Company
 * License: GPL v2 or later
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register REST API routes
 */
add_action('rest_api_init', function () {
    // Status endpoint
    register_rest_route('ourplugin/v1', '/status', [
        'methods' => 'GET',
        'callback' => 'affiliate_api_status',
        'permission_callback' => 'affiliate_api_permission_check',
    ]);

    // List affiliates endpoint
    register_rest_route('ourplugin/v1', '/affiliates', [
        'methods' => 'GET',
        'callback' => 'affiliate_api_list',
        'permission_callback' => 'affiliate_api_permission_check',
        'args' => [
            'page' => [
                'required' => false,
                'default' => 1,
                'validate_callback' => function($param) {
                    return is_numeric($param) && $param > 0;
                }
            ],
            'per_page' => [
                'required' => false,
                'default' => 50,
                'validate_callback' => function($param) {
                    return is_numeric($param) && $param > 0 && $param <= 100;
                }
            ],
        ],
    ]);

    // Single affiliate endpoint
    register_rest_route('ourplugin/v1', '/affiliates/(?P<id>\d+)', [
        'methods' => 'GET',
        'callback' => 'affiliate_api_single',
        'permission_callback' => 'affiliate_api_permission_check',
        'args' => [
            'id' => [
                'required' => true,
                'validate_callback' => function($param) {
                    return is_numeric($param);
                }
            ],
        ],
    ]);
});

/**
 * Permission check - validates API key
 */
function affiliate_api_permission_check($request) {
    $auth_header = $request->get_header('Authorization');
    
    if (!$auth_header) {
        return new WP_Error(
            'unauthorized',
            'Authorization header required',
            ['status' => 401]
        );
    }

    // Get stored API key
    $stored_key = get_option('affiliate_api_key', '');
    
    if (empty($stored_key)) {
        return new WP_Error(
            'no_api_key',
            'API key not configured. Please set up API key in plugin settings.',
            ['status' => 500]
        );
    }

    // Validate Bearer token
    $expected = 'Bearer ' . $stored_key;
    if ($auth_header !== $expected) {
        return new WP_Error(
            'unauthorized',
            'Invalid API key',
            ['status' => 401]
        );
    }

    return true;
}

/**
 * Status endpoint - returns plugin info
 */
function affiliate_api_status($request) {
    global $wpdb;
    
    // Detect which affiliate plugin is installed
    $plugin = 'custom';
    $affiliate_count = 0;
    
    if (function_exists('affiliate_wp')) {
        $plugin = 'affiliatewp';
        $affiliate_count = affiliate_wp()->affiliates->count(['status' => 'active']);
    } elseif (class_exists('WPAM_Plugin')) {
        $plugin = 'wp-affiliate-manager';
        $table = $wpdb->prefix . 'affiliates_users';
        $affiliate_count = $wpdb->get_var("SELECT COUNT(*) FROM {$table}");
    } else {
        // Custom implementation - count users with affiliate role
        $users = count_users();
        $affiliate_count = isset($users['avail_roles']['affiliate']) ? 
            $users['avail_roles']['affiliate'] : 0;
    }

    return [
        'plugin' => $plugin,
        'version' => '1.0.0',
        'scopes' => ['read:affiliates', 'read:payments', 'read:identifiers'],
        'affiliate_count' => (int) $affiliate_count,
    ];
}

/**
 * List affiliates endpoint
 */
function affiliate_api_list($request) {
    $page = (int) $request->get_param('page');
    $per_page = (int) $request->get_param('per_page');
    
    // Detect which affiliate plugin is active
    if (function_exists('affiliate_wp')) {
        return affiliate_api_list_affiliatewp($page, $per_page);
    } elseif (class_exists('WPAM_Plugin')) {
        return affiliate_api_list_wpam($page, $per_page);
    } else {
        return affiliate_api_list_custom($page, $per_page);
    }
}

/**
 * AffiliateWP integration
 */
function affiliate_api_list_affiliatewp($page, $per_page) {
    $offset = ($page - 1) * $per_page;
    
    $affiliates = affiliate_wp()->affiliates->get_affiliates([
        'number' => $per_page,
        'offset' => $offset,
        'status' => 'active',
    ]);
    
    $total = affiliate_wp()->affiliates->count(['status' => 'active']);
    
    $data = [];
    foreach ($affiliates as $affiliate) {
        $user = get_userdata($affiliate->user_id);
        
        $data[] = [
            'id' => $affiliate->affiliate_id,
            'user_id' => $affiliate->user_id,
            'email' => $user->user_email,
            'display_name' => $user->display_name,
            'first_name' => get_user_meta($affiliate->user_id, 'first_name', true),
            'last_name' => get_user_meta($affiliate->user_id, 'last_name', true),
            'company_name' => get_user_meta($affiliate->user_id, 'billing_company', true),
            'payment_method' => $affiliate->payment_email ? 'PayPal' : 'Bank Transfer',
            'last_payout_amount' => 0, // Calculate from referrals
            'total_earnings' => (float) $affiliate->earnings,
            'address' => get_user_meta($affiliate->user_id, 'billing_address_1', true),
            'address2' => get_user_meta($affiliate->user_id, 'billing_address_2', true),
            'city' => get_user_meta($affiliate->user_id, 'billing_city', true),
            'state' => get_user_meta($affiliate->user_id, 'billing_state', true),
            'zip' => get_user_meta($affiliate->user_id, 'billing_postcode', true),
            'country' => get_user_meta($affiliate->user_id, 'billing_country', true) ?: 'US',
            'meta' => [
                'tax_classification' => get_user_meta($affiliate->user_id, 'tax_classification', true),
                'affiliate_status' => $affiliate->status,
            ],
        ];
    }
    
    return [
        'data' => $data,
        'total' => (int) $total,
        'page' => $page,
        'per_page' => $per_page,
    ];
}

/**
 * WP Affiliate Manager integration
 */
function affiliate_api_list_wpam($page, $per_page) {
    global $wpdb;
    
    $table = $wpdb->prefix . 'affiliates_users';
    $offset = ($page - 1) * $per_page;
    
    $affiliates = $wpdb->get_results($wpdb->prepare(
        "SELECT * FROM {$table} LIMIT %d OFFSET %d",
        $per_page,
        $offset
    ));
    
    $total = $wpdb->get_var("SELECT COUNT(*) FROM {$table}");
    
    $data = [];
    foreach ($affiliates as $affiliate) {
        $data[] = [
            'id' => $affiliate->member_id,
            'user_id' => $affiliate->wp_user_id,
            'email' => $affiliate->email,
            'display_name' => $affiliate->first_name . ' ' . $affiliate->last_name,
            'first_name' => $affiliate->first_name,
            'last_name' => $affiliate->last_name,
            'company_name' => $affiliate->company_name,
            'payment_method' => 'Bank Transfer',
            'last_payout_amount' => 0,
            'total_earnings' => 0,
            'address' => $affiliate->street_address,
            'city' => $affiliate->city,
            'state' => $affiliate->state,
            'zip' => $affiliate->zipcode,
            'country' => $affiliate->country ?: 'US',
            'meta' => [],
        ];
    }
    
    return [
        'data' => $data,
        'total' => (int) $total,
        'page' => $page,
        'per_page' => $per_page,
    ];
}

/**
 * Custom implementation - returns users with 'affiliate' role
 */
function affiliate_api_list_custom($page, $per_page) {
    $offset = ($page - 1) * $per_page;
    
    $args = [
        'role' => 'affiliate',
        'number' => $per_page,
        'offset' => $offset,
    ];
    
    $user_query = new WP_User_Query($args);
    $users = $user_query->get_results();
    $total = $user_query->get_total();
    
    $data = [];
    foreach ($users as $user) {
        $data[] = [
            'id' => $user->ID,
            'user_id' => $user->ID,
            'email' => $user->user_email,
            'display_name' => $user->display_name,
            'first_name' => get_user_meta($user->ID, 'first_name', true),
            'last_name' => get_user_meta($user->ID, 'last_name', true),
            'company_name' => get_user_meta($user->ID, 'billing_company', true),
            'payment_method' => get_user_meta($user->ID, 'payment_method', true) ?: 'PayPal',
            'last_payout_amount' => (float) get_user_meta($user->ID, 'last_payout', true),
            'total_earnings' => (float) get_user_meta($user->ID, 'total_earnings', true),
            'address' => get_user_meta($user->ID, 'billing_address_1', true),
            'address2' => get_user_meta($user->ID, 'billing_address_2', true),
            'city' => get_user_meta($user->ID, 'billing_city', true),
            'state' => get_user_meta($user->ID, 'billing_state', true),
            'zip' => get_user_meta($user->ID, 'billing_postcode', true),
            'country' => get_user_meta($user->ID, 'billing_country', true) ?: 'US',
            'meta' => [
                'tax_classification' => get_user_meta($user->ID, 'tax_classification', true),
            ],
        ];
    }
    
    return [
        'data' => $data,
        'total' => (int) $total,
        'page' => $page,
        'per_page' => $per_page,
    ];
}

/**
 * Single affiliate endpoint
 */
function affiliate_api_single($request) {
    $id = (int) $request->get_param('id');
    
    // Fetch using the same logic as list, but for single item
    $result = affiliate_api_list($request);
    
    if (empty($result['data'])) {
        return new WP_Error(
            'not_found',
            'Affiliate not found',
            ['status' => 404]
        );
    }
    
    return $result['data'][0];
}

/**
 * Admin menu for API key management
 */
add_action('admin_menu', function() {
    add_options_page(
        'Affiliate REST API',
        'Affiliate API',
        'manage_options',
        'affiliate-rest-api',
        'affiliate_api_settings_page'
    );
});

/**
 * Settings page
 */
function affiliate_api_settings_page() {
    if (!current_user_can('manage_options')) {
        return;
    }
    
    // Save API key
    if (isset($_POST['affiliate_api_key_nonce']) && 
        wp_verify_nonce($_POST['affiliate_api_key_nonce'], 'save_affiliate_api_key')) {
        
        if (isset($_POST['generate_new_key'])) {
            $new_key = wp_generate_password(32, true, true);
            update_option('affiliate_api_key', $new_key);
            echo '<div class="notice notice-success"><p>New API key generated!</p></div>';
        } elseif (isset($_POST['affiliate_api_key'])) {
            update_option('affiliate_api_key', sanitize_text_field($_POST['affiliate_api_key']));
            echo '<div class="notice notice-success"><p>API key saved!</p></div>';
        }
    }
    
    $api_key = get_option('affiliate_api_key', '');
    $site_url = get_site_url();
    
    ?>
    <div class="wrap">
        <h1>Affiliate REST API Settings</h1>
        
        <div class="card" style="max-width: 800px;">
            <h2>API Key</h2>
            <p>This API key is required to access affiliate data via REST API.</p>
            
            <form method="post">
                <?php wp_nonce_field('save_affiliate_api_key', 'affiliate_api_key_nonce'); ?>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="affiliate_api_key">API Key</label>
                        </th>
                        <td>
                            <input type="text" 
                                   id="affiliate_api_key" 
                                   name="affiliate_api_key" 
                                   value="<?php echo esc_attr($api_key); ?>" 
                                   class="regular-text"
                                   readonly>
                            <p class="description">
                                Share this key with your 1099/W-9 system administrator.
                            </p>
                        </td>
                    </tr>
                </table>
                
                <p class="submit">
                    <button type="submit" name="generate_new_key" class="button button-primary">
                        Generate New API Key
                    </button>
                </p>
            </form>
        </div>
        
        <div class="card" style="max-width: 800px; margin-top: 20px;">
            <h2>API Endpoints</h2>
            
            <table class="widefat">
                <thead>
                    <tr>
                        <th>Endpoint</th>
                        <th>URL</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Status</td>
                        <td><code><?php echo esc_url($site_url . '/wp-json/ourplugin/v1/status'); ?></code></td>
                    </tr>
                    <tr>
                        <td>List Affiliates</td>
                        <td><code><?php echo esc_url($site_url . '/wp-json/ourplugin/v1/affiliates'); ?></code></td>
                    </tr>
                    <tr>
                        <td>Single Affiliate</td>
                        <td><code><?php echo esc_url($site_url . '/wp-json/ourplugin/v1/affiliates/{id}'); ?></code></td>
                    </tr>
                </tbody>
            </table>
            
            <h3 style="margin-top: 20px;">Test Connection</h3>
            <p>Use this curl command to test the API:</p>
            <pre style="background: #f5f5f5; padding: 10px; overflow-x: auto;">curl -H "Authorization: Bearer <?php echo esc_attr($api_key); ?>" \
     <?php echo esc_url($site_url . '/wp-json/ourplugin/v1/status'); ?></pre>
        </div>
    </div>
    <?php
}
