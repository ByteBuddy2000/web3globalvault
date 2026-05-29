# KYC (Know Your Customer) Verification System

## Overview
This is a complete KYC verification system that allows users to submit their KYC documents and allows admins to verify them. The system includes:

- User KYC submission form with document upload
- Admin dashboard for reviewing and verifying KYC
- Database models for storing KYC information
- API endpoints for submission and verification

## Features

### User Features
- **KYC Submission Page** (`/dashboard/kyc`)
  - Submit personal information (name, date of birth, address)
  - Upload identity document (Passport, Driver's License, National ID, ID Card)
  - Upload selfie with document
  - View KYC status (Pending, Verified, Rejected)
  - See rejection reasons if rejected
  - View admin remarks after verification

### Admin Features
- **KYC Verification Dashboard** (`/admin/kyc-verification`)
  - View all pending KYC submissions
  - Review user information and documents
  - View document and selfie images with preview modal
  - Add remarks/comments
  - Approve or reject KYC with reason
  - Track verified and rejected records

## Database Schema

### KYC Model (`models/Kyc.ts`)
```javascript
{
  user: ObjectId (ref: User),
  firstName: String,
  lastName: String,
  dateOfBirth: Date,
  address: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
  documentType: String (passport, drivers-license, national-id, id-card),
  documentNumber: String,
  documentImage: String (Base64 or URL),
  selfieImage: String (Base64 or URL),
  status: String (pending, verified, rejected),
  submittedAt: Date,
  verifiedAt: Date,
  verifiedBy: ObjectId (ref: User - Admin),
  rejectionReason: String,
  remarks: String,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### User API
#### POST `/api/kyc/submit`
Submit KYC application
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "address": "123 Main Street",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "United States",
  "documentType": "passport",
  "documentNumber": "ABC123456",
  "documentImage": "base64_string",
  "selfieImage": "base64_string"
}
```

#### GET `/api/kyc/submit`
Get user's KYC status

### Admin API
#### GET `/api/admin/kyc?status=pending&page=1&limit=10`
Get pending KYC records (admin only)

#### POST `/api/admin/kyc`
Approve or reject KYC application (admin only)
```json
{
  "kycId": "kyc_id",
  "action": "approve" or "reject",
  "remarks": "optional remarks",
  "rejectionReason": "reason for rejection (required if action is reject)"
}
```

## File Structure
```
app/
├── api/
│   ├── kyc/
│   │   └── submit/
│   │       └── route.ts
│   └── admin/
│       └── kyc/
│           └── route.ts
├── dashboard/
│   └── kyc/
│       ├── page.tsx
│       └── KYCSubmission.tsx
└── admin/
    └── kyc-verification/
        ├── page.tsx
        └── KYCAdminDashboard.tsx

models/
└── Kyc.ts
```

## Usage

### For Users
1. Navigate to `/dashboard/kyc`
2. Fill in personal information
3. Upload identity document image
4. Upload selfie with document
5. Submit KYC
6. Wait for admin verification
7. Check status updates

### For Admins
1. Navigate to `/admin/kyc-verification`
2. View pending KYC submissions
3. Click expand button to view details
4. Review documents using preview modal
5. Add optional remarks
6. Choose to approve or reject
7. If rejecting, provide rejection reason
8. Submit decision

## Security Considerations

1. **Authentication**: All endpoints require valid session (via NextAuth)
2. **Authorization**: Admin endpoints check for admin role
3. **Duplicate Prevention**: Users cannot have multiple pending KYC submissions
4. **File Validation**: Document uploads are validated for file type and size (max 5MB)
5. **Base64 Encoding**: Images are stored as base64 or URLs for easier transmission

## Styling

The KYC system uses the global CSS design tokens from `globals.css`:
- `.card` and `.card-elevated` classes for card styling
- `.btn-primary`, `.btn-secondary`, `.btn-danger` for buttons
- CSS variables for colors, spacing, typography, and shadows
- Consistent with the rest of the application design system

## Status Flow

```
Submitted (Pending)
    ↓
    ├→ Verified (Admin approves)
    │   → User gets full access
    │   → User.kycVerified = true
    │
    └→ Rejected (Admin rejects)
        → User can resubmit
        → Reason provided to user
```

## Future Enhancements

- OCR for automatic document data extraction
- Liveness detection for selfie verification
- Document expiration tracking
- Bulk import/export KYC data
- Advanced filtering and search
- KYC history/audit trail
- Document storage in cloud (AWS S3, etc.)
- Webhook notifications for status changes
