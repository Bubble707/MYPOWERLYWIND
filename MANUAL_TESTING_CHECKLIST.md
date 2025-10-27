# WordPress Import Feature - Manual Testing Checklist

## Pre-Testing Setup

- [ ] `.env` file has `ENCRYPTION_KEY` set
- [ ] Server is running (`pnpm dev`)
- [ ] WordPress site is set up with HTTPS
- [ ] WordPress connector plugin is installed and activated
- [ ] API key is generated in WordPress (Settings → Affiliate API)
- [ ] At least 5 test affiliates exist in WordPress

## Test 1: Connection Test

### Positive Tests
- [ ] Enter valid HTTPS WordPress URL
- [ ] Select "API Key" authentication
- [ ] Enter correct API key
- [ ] Click "Test Connection"
- [ ] ✅ Success message appears
- [ ] ✅ Detected plugin name is shown
- [ ] ✅ Affiliate count is displayed
- [ ] ✅ Moves to affiliate selection step

### Negative Tests
- [ ] Enter HTTP URL (not HTTPS)
  - [ ] ❌ Error: "WordPress site must use HTTPS"
- [ ] Enter invalid API key
  - [ ] ❌ Error: "401 — Invalid API key"
- [ ] Enter non-existent WordPress URL
  - [ ] ❌ Error: "Connection failed: Network error"
- [ ] Leave hostname empty
  - [ ] ❌ Error: "Hostname is required"

## Test 2: Affiliate Selection

### Display Tests
- [ ] Affiliates list loads
- [ ] Each affiliate shows:
  - [ ] Name
  - [ ] Email
  - [ ] Company name (if available)
  - [ ] Payment method
  - [ ] Last payout amount
  - [ ] Total earnings
- [ ] Pagination shows correct total count
- [ ] "X selected" badge updates when selecting affiliates

### Selection Tests
- [ ] Click individual checkbox to select affiliate
- [ ] Click "Select All" button
  - [ ] ✅ All visible affiliates selected
- [ ] Click "Deselect All" button
  - [ ] ✅ All selections cleared
- [ ] Select 3-5 specific affiliates manually

### Search Tests
- [ ] Type affiliate name in search box
  - [ ] ✅ List filters to matching names
- [ ] Type email in search box
  - [ ] ✅ List filters to matching emails
- [ ] Type non-existent search term
  - [ ] ✅ "No affiliates found" message appears
- [ ] Clear search box
  - [ ] ✅ Full list returns

## Test 3: Sensitive Fields Option

### SSN/FEIN Import
- [ ] Check "Import sensitive fields" checkbox
  - [ ] ✅ Warning message displays about encryption
- [ ] Uncheck "Import sensitive fields"
  - [ ] ✅ Warning disappears
- [ ] Attempt import WITH sensitive fields checked
  - [ ] ✅ SSN/FEIN data is imported (if available)
- [ ] Attempt import WITHOUT sensitive fields checked
  - [ ] ✅ SSN/FEIN data is NOT imported

## Test 4: Import Process

### Successful Import
- [ ] Select 2-3 affiliates
- [ ] Click "Import X Affiliate(s)" button
- [ ] ✅ Loading spinner appears
- [ ] ✅ Import completes successfully
- [ ] ✅ Results screen shows:
  - [ ] "Import Completed" message
  - [ ] Imported count matches selection
  - [ ] Skipped count is 0 (first import)
  - [ ] Audit log ID is shown
- [ ] Click "Done"
  - [ ] ✅ Modal closes
  - [ ] ✅ Success alert shows imported count

### Duplicate Detection
- [ ] Import same affiliates again
- [ ] ✅ Skipped count equals previously imported count
- [ ] ✅ Imported count is 0
- [ ] ✅ Vendors were updated, not duplicated

### Error Handling
- [ ] Import with invalid WordPress data (manually corrupt API response)
  - [ ] ❌ Error list shows specific failures
  - [ ] ✅ Valid affiliates still import
- [ ] Disconnect WiFi during import
  - [ ] ❌ "Network error" message appears
  
## Test 5: 1099 Page Integration

- [ ] Navigate to 1099 page (/)
- [ ] "Import from WordPress" button visible in header
- [ ] Click button
  - [ ] ✅ Modal opens
  - [ ] ✅ "targetFormType" is set to "1099"
- [ ] Complete import
  - [ ] ✅ Success callback fires
  - [ ] ✅ Alert shows imported count

## Test 6: W-9 Page Integration

- [ ] Navigate to W-9 page (/forms)
- [ ] "Import from WordPress" button visible in header
- [ ] Click button
  - [ ] ✅ Modal opens
  - [ ] ✅ "targetFormType" is set to "w9"
- [ ] Complete import
  - [ ] ✅ Success callback fires
  - [ ] ✅ Alert shows imported count

## Test 7: Data Validation

### WordPress Side
- [ ] Create affiliate with missing email
  - [ ] ❌ Error: "Email is required"
- [ ] Create affiliate with missing name
  - [ ] ❌ Error: "Name is required"
- [ ] Create affiliate with invalid SSN format (if importing sensitive fields)
  - [ ] ❌ Error: "Invalid SSN format"

### Application Side
- [ ] Verify imported vendor has all fields:
  - [ ] Email
  - [ ] Full name
  - [ ] Address (if provided)
  - [ ] Payment method (if provided)
  - [ ] Source = "wordpress"
  - [ ] WP User ID populated
  - [ ] WP Site Hostname populated

## Test 8: Encryption

- [ ] Import affiliate with SSN
- [ ] Check server logs/database
  - [ ] ✅ SSN is encrypted (not plain text)
  - [ ] ✅ Format is: `salt:iv:tag:ciphertext`
- [ ] Retrieve vendor with SSN
  - [ ] ✅ Can decrypt SSN correctly
  - [ ] ✅ Decrypted value matches original

## Test 9: Audit Logging

- [ ] Complete an import
- [ ] Check audit log (server console or database)
  - [ ] ✅ Log entry created
  - [ ] ✅ Contains:
    - [ ] Timestamp
    - [ ] User ID
    - [ ] Action = "wp_import"
    - [ ] WP site hostname
    - [ ] Imported IDs array
    - [ ] Target form type
    - [ ] Import count

## Test 10: Edge Cases

### Large Datasets
- [ ] Import from WP site with 100+ affiliates
  - [ ] ✅ Pagination works correctly
  - [ ] ✅ Can navigate pages
  - [ ] ✅ Performance is acceptable

### Special Characters
- [ ] Create affiliate with special chars in name (é, ñ, etc.)
  - [ ] ✅ Imports correctly
  - [ ] ✅ Displays correctly

### Long Field Values
- [ ] Create affiliate with very long company name (200+ chars)
  - [ ] ✅ Imports without truncation
  - [ ] ✅ Displays correctly in UI

## Test 11: Browser Compatibility

- [ ] Chrome: All tests pass
- [ ] Firefox: All tests pass
- [ ] Safari: All tests pass
- [ ] Edge: All tests pass

## Test 12: Accessibility

- [ ] Tab through modal with keyboard
  - [ ] ✅ All interactive elements reachable
- [ ] Use screen reader
  - [ ] ✅ Labels announced correctly
- [ ] Check color contrast
  - [ ] ✅ Meets WCAG AA standards

## Post-Testing Verification

- [ ] No console errors
- [ ] No memory leaks (check DevTools)
- [ ] Server logs show no errors
- [ ] All imported data appears in vendor system
- [ ] Audit logs are complete

## Known Issues / Notes

_Document any issues found during testing:_

---

## Sign-Off

**Tester Name:** _______________  
**Date:** _______________  
**Overall Result:** ☐ Pass ☐ Pass with issues ☐ Fail  
**Notes:**
