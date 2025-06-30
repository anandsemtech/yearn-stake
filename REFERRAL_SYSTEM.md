# Referral System Implementation

This document describes the referral system implementation that automatically stores referral addresses when users visit the application via referral URLs.

## Overview

The referral system automatically detects and stores referral addresses from URL paths in the format `/ref/{address}` and persists them in localStorage for future use.

## Features

- **Automatic URL Detection**: Extracts referral addresses from URL paths
- **Local Storage Persistence**: Stores referral data with timestamps
- **Expiration Handling**: Referral data expires after 24 hours by default
- **UI Integration**: Shows referral status in header and referral modal
- **Context Provider**: Provides referral data throughout the app

## File Structure

```
src/
├── utils/
│   └── referral.ts              # Core referral utility functions
├── hooks/
│   └── useReferral.ts           # React hook for referral state management
├── contexts/
│   └── ReferralContext.tsx      # React context provider
└── components/
    ├── ReferralShareModal.tsx   # Updated modal with referral status
    ├── ReferralStatus.tsx       # Component to display referral status
    └── ReferralTest.tsx         # Test component for development
```

## Usage

### URL Format

Referral URLs should follow this format:

```
https://yourapp.com/ref/0x1234567890123456789012345678901234567890
```

### Automatic Detection

When a user visits a referral URL:

1. The system extracts the referral address from the URL path
2. Stores it in localStorage with a timestamp
3. Makes it available throughout the app via context

### Manual Referral Setting

You can also set referrals programmatically:

```typescript
import { useReferralContext } from "../contexts/ReferralContext";

const { setReferral } = useReferralContext();

// Set a referral
setReferral("0x1234567890123456789012345678901234567890", "manual");
```

### Accessing Referral Data

```typescript
import { useReferralContext } from "../contexts/ReferralContext";

const { referralData, hasValidReferral, referrerAddress, clearReferral } =
  useReferralContext();

if (hasValidReferral()) {
  console.log("Referred by:", referrerAddress);
}
```

## API Reference

### ReferralContext

#### Properties

- `referralData: ReferralData | null` - Current referral data
- `isLoading: boolean` - Loading state
- `referrerAddress: string | null` - Current referrer address
- `hasValidReferral(): boolean` - Check if referral is valid and not expired

#### Methods

- `setReferral(address: string, source?: string)` - Set a new referral
- `clearReferral()` - Clear current referral

### ReferralData Interface

```typescript
interface ReferralData {
  referrerAddress: string;
  timestamp: number;
  source: string;
}
```

### Utility Functions

#### `extractReferralFromUrl(): string | null`

Extracts referral address from current URL path.

#### `storeReferralData(referrerAddress: string): void`

Stores referral data in localStorage.

#### `getStoredReferralData(): ReferralData | null`

Retrieves stored referral data from localStorage.

#### `clearReferralData(): void`

Removes referral data from localStorage.

#### `isReferralDataValid(maxAgeMs?: number): boolean`

Checks if stored referral data is still valid (not expired).

## Testing

1. Visit a referral URL: `/ref/0x1234567890123456789012345678901234567890`
2. Check that the referral status appears in the header
3. Open the referral modal to see stored referral information
4. Use the test component in the dashboard to verify functionality

## Configuration

### Storage Key

The referral data is stored in localStorage under the key: `yearn_together_referral`

### Expiration Time

Default expiration time is 24 hours (86400000 ms). This can be customized by passing a different value to `isReferralDataValid()`.

## Integration Points

- **Header**: Shows referral status badge
- **ReferralShareModal**: Displays current referral and allows clearing
- **Provider**: Includes ReferralProvider in the app hierarchy
- **Dashboard**: Includes test component for development

## Future Enhancements

- Add referral analytics tracking
- Implement referral reward distribution
- Add referral link generation with QR codes
- Support for multiple referral sources
- Referral validation against blockchain data
