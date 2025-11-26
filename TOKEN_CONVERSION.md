# Token Conversion System

## Overview

The Love2Match platform implements a two-tier token system:
- **LOVE**: In-app currency for platform features
- **LOVE2**: Solana-based token for blockchain integration

## Features

### 1. Token Conversion (LOVE → LOVE2)

Users can request to convert their LOVE tokens to LOVE2 tokens through an admin-approved workflow.

**Conversion Rate**: 1 LOVE = 1 LOVE2

**Process**:
1. User initiates conversion request from Wallet page
2. Request is submitted to admin for approval
3. Admin reviews and approves/rejects the request
4. Upon approval, LOVE balance is deducted and LOVE2 balance is credited
5. Transaction history is recorded for both tokens

### 2. Admin Approval Interface

Admins can review pending conversion requests from the Admin dashboard.

**Features**:
- View all pending conversion requests
- See user details, amount, and timestamp
- Approve or reject requests with one click
- Automatic balance updates upon approval
- Transaction logging for audit trail

### 3. Conversion History

Users can view their conversion request history in the Wallet page.

**Information Displayed**:
- Request status (Pending, Approved, Rejected)
- Amount and token types
- Request and review timestamps
- Admin notes (if any)

## Database Schema

### conversion_requests Table

```sql
CREATE TABLE conversion_requests (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  from_token TEXT NOT NULL DEFAULT 'LOVE',
  to_token TEXT NOT NULL DEFAULT 'LOVE2',
  amount NUMERIC(20, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by BIGINT REFERENCES users(id),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## API Endpoints

### Wallet API

**exchangeTokens(userId, from, to, amount)**
- Creates a new conversion request
- Validates user balance
- Returns request details

### Admin API

**getPendingExchanges()**
- Fetches all pending conversion requests
- Includes user email and details

**approveExchange(requestId)**
- Approves a conversion request
- Updates user balances
- Creates transaction records
- Marks request as approved

**rejectExchange(requestId)**
- Rejects a conversion request
- Marks request as rejected
- Optionally adds admin notes

## UI Components

### ConversionHistory Component

Located at: `src/components/wallet/ConversionHistory.tsx`

Displays user's conversion request history with:
- Status badges (Pending, Approved, Rejected)
- Amount and token information
- Timestamps
- Admin notes

### Admin Dashboard

Located at: `src/pages/Admin.tsx`

Includes "Pending Token Exchanges" card with:
- List of all pending requests
- User information
- Approve/Reject buttons
- Real-time updates

### Wallet Page

Located at: `src/pages/Wallet.tsx`

Features:
- Exchange dialog for initiating conversions
- Conversion history display
- Balance overview

## Blockchain Integration

### Future Enhancements

The system is designed to support future blockchain bridging:

1. **Bridge to Solana**: Transfer LOVE2 tokens to user's Solana wallet
2. **Reverse Bridge**: Bring LOVE2 tokens back from Solana
3. **SOL-to-LOVE2 Swap**: Direct purchase using SOL
4. **Withdrawal System**: Claim approved LOVE2 tokens to external wallet

**Note**: These features require Solana wallet integration (Phantom) and are currently in development.

## Running Migrations

To apply the conversion_requests table migration:

1. Ensure Supabase CLI is installed
2. Run: `supabase db push`
3. Or manually execute the SQL in: `supabase/migrations/20251127000001_add_conversion_requests.sql`

## Security Considerations

- All conversion requests require admin approval
- Balance checks prevent overdrafts
- Transaction logging provides audit trail
- User IDs are validated before processing
- Admin actions are tracked with reviewer ID

## Testing

To test the conversion system:

1. **User Flow**:
   - Login as a regular user
   - Navigate to Wallet page
   - Click "Exchange" button
   - Enter amount and submit request
   - View request in Conversion History

2. **Admin Flow**:
   - Login as admin user
   - Navigate to Admin page
   - View pending requests
   - Approve or reject requests
   - Verify balance updates

## Troubleshooting

**Issue**: Conversion request not appearing
- Check user has sufficient LOVE balance
- Verify request was successfully created in database
- Refresh the page

**Issue**: Admin approval not updating balances
- Check database constraints
- Verify user_id exists in users table
- Check transaction logs for errors

**Issue**: Conversion history not loading
- Verify user is authenticated
- Check network requests in browser console
- Ensure conversion_requests table exists

## Future Improvements

1. Add email notifications for request status changes
2. Implement batch approval for multiple requests
3. Add conversion limits and rate limiting
4. Create detailed analytics dashboard
5. Implement automatic approval for small amounts
6. Add conversion fee structure
7. Support reverse conversion (LOVE2 → LOVE)
