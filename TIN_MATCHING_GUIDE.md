# TIN Matching Service - User Guide

## Overview
The TIN Matching service validates recipient TIN/SSN numbers against IRS records to ensure compliance and prevent filing rejections.

## Features

### 1. **Three Validation Methods**

#### A. Recipient-Based Validation
- Validates TINs for recipients already added in Step 3 (Payee)
- Click "Validate All Recipients" to check all at once
- Or select specific recipients and click "Validate Selected"

#### B. File Upload Validation
- Upload a text or CSV file with TIN numbers
- Supports bulk validation for large lists
- **File Format:**
  ```
  123-45-6789,John Doe
  234-56-7890,Jane Smith
  345-67-8901,Robert Johnson
  ```
  - One TIN per line
  - Optional: Include name after comma (TIN,Name)
  - Automatically removes non-numeric characters

#### C. Manual TIN Validation
- Enter individual TIN numbers for quick validation
- Optional: Add recipient name
- Click "Validate TIN" to check against IRS

## Status Indicators

- ✅ **Validated** (Green) - TIN matches IRS records, safe to e-file
- ❌ **Not Validated** (Red) - TIN doesn't match, verify information
- ⚠️ **Error** (Orange) - Unable to validate, service issue
- ⏳ **Pending** (Gray) - Not yet validated

## Workflow

### Step-by-Step:

1. **Navigate to Step 4 (TIN Match)** in the e-filing workflow

2. **Choose Your Validation Method:**
   - For recipients already in system: Click "Validate All Recipients"
   - For bulk TINs from a file: Click "Choose File" under "Upload TIN File"
   - For individual TIN: Enter in "Manual TIN Validation" form

3. **Review Results** in the validation table
   - Green = Good to proceed
   - Red = Needs attention
   - Orange = Try again later

4. **Take Action:**
   - **All Validated:** Click "Next" to proceed to E-Filing
   - **Some Failed:** Go back to Payee step and correct TIN numbers
   - **Skip (Not Recommended):** Click "Skip Validation" if testing

## File Upload Example

Create a text file (`tins.txt`) with this format:

```
123456789,John Doe
234567890,Jane Smith
345678901
456789012,Robert Johnson
```

**Notes:**
- Dashes are optional (123-45-6789 or 123456789)
- Name is optional (can be just TIN)
- Empty lines are ignored
- Supports both .txt and .csv files

## Best Practices

✅ **DO:**
- Validate all TINs before e-filing
- Use file upload for 10+ TINs (faster)
- Double-check "Not Validated" results
- Fix errors before proceeding to e-filing

❌ **DON'T:**
- Skip validation for production e-filing
- Ignore "Not Validated" warnings
- Proceed without reviewing results
- Use invalid file formats

## API Integration (Production)

In production, this connects to the **IRS TIN Matching API**:
- Real-time validation against IRS database
- Secure encrypted connection
- Audit logging for compliance
- Rate limiting applied

**Current Status:** Demo mode (simulated results for testing)

## Validation Table

The results table shows:
- **#** - Row number
- **Recipient Name** - Name from recipient or file
- **SSN/TIN** - Tax identification number
- **Email** - Email address (if available)
- **Status** - Validation result (badge)
- **Message** - Detailed validation message
- **Validated Date** - When validation occurred

**Special Rows:**
- Regular rows: Linked to recipients in system
- **Purple-highlighted rows:** From file upload or manual entry (marked with "Manual/File" badge)

## Troubleshooting

**Q: File upload isn't working?**
- Check file format (.txt or .csv only)
- Ensure TINs are on separate lines
- Verify file isn't empty

**Q: All showing as "Error"?**
- IRS service may be temporarily unavailable
- Try again in a few minutes
- Contact support if persists

**Q: Can I skip validation?**
- Yes, but **not recommended** for production
- May result in IRS rejections
- Only skip for testing purposes

**Q: How to fix "Not Validated" TINs?**
- Return to Step 3 (Payee)
- Edit the recipient
- Verify and correct the TIN number
- Return to Step 4 to re-validate

## Sample File

A sample TIN file is provided at:
`sample_tin_file.txt`

Use this as a template for your bulk uploads.

---

**Need Help?** Contact support or refer to IRS Publication 1220 for TIN validation requirements.
