# Card Notification & Archiving System - Implementation Guide

## Overview

This implementation adds a comprehensive notification system for card operations and follows banking standards for card lifecycle management (archiving, replacement, etc.).

## Features Implemented

### 1. ✅ Notification System for Cards

#### Notifications Created For:
1. **Card Approved** - When admin approves card payment
   - Title: `✅ Card Approved - {TIER}`
   - Type: `success`
   - Message includes card is now active

2. **Card Rejected** - When admin rejects card payment
   - Title: `❌ Card Application Rejected - {TIER}`
   - Type: `error`
   - Message includes rejection reason

3. **Card Blocked** - When user blocks a card
   - Title: `🔒 Card Blocked - {TIER}`
   - Type: `warning`
   - Message indicates can create new card

4. **Card Canceled** - When user cancels/deletes a card
   - Title: `❌ Card Canceled - {TIER}`
   - Type: `info`
   - Message indicates can create new card

### 2. 📦 Card Archiving (Bank-Standard Process)

When a new card is approved:
- Previous ACTIVE/BLOCKED cards are automatically archived
- Archived card status becomes "ARCHIVED"
- Fields tracked:
  - `archived: true`
  - `archivedAt: Date` - When archived
  - `archivedReason: string` - Why it was archived
  - `replacedByCardId: ObjectId` - Reference to new card

### 3. 🎯 Previous Card Removal UI

When a user blocks/replaces a card:
- Old card automatically hidden from active cards list
- Old card moved to archive/history
- User sees only current active card

### 4. 📊 Notification Display

Updated notification navbar to show:
- Card category notifications with 💳 icon
- KYC notifications with ✓ icon
- Transaction notifications with existing styling
- Color-coded by type (success: green, error: red, warning: yellow)

## Database Schema Changes

### Card Model Updates
```typescript
status: "ACTIVE" | "INACTIVE" | "BLOCKED" | "PENDING" | "ARCHIVED"

// New fields for archiving
archived: boolean
archivedAt: Date
archivedReason: string
replacedByCardId: ObjectId (ref to Card)
```

### Notification Model Updates
```typescript
category: "card" | "transaction" | "investment" | "withdrawal" | "deposit" | "kyc" | "medbed" | "security" | "system"

// Link to card
card: ObjectId (ref to Card)
```

## API Changes

### 1. `/api/cards` (GET)
- **Change**: Now excludes archived cards
- **Behavior**: Returns only active/pending cards
- **Before**: All cards shown
- **After**: Only current cards shown

### 2. `/api/cards/[id]` (PATCH)
- **Action**: Block card
- **Changes**: 
  - Sets `status = "BLOCKED"`
  - Sets `archived = true`
  - Creates blocking notification

### 3. `/api/cards/[id]` (DELETE)
- **Action**: Cancel card
- **Changes**:
  - Deletes card from DB
  - Creates cancellation notification

### 4. `/api/cards/verify` (POST)
- **Action**: Admin approves/rejects card
- **Approve Changes**:
  - Sets status to "ACTIVE"
  - Archives previous ACTIVE/BLOCKED cards
  - Creates approval notification
- **Reject Changes**:
  - Sets status to "INACTIVE"
  - Creates rejection notification

### 5. `/api/cards/history` (GET) - NEW
- **Purpose**: Retrieve archived cards
- **Returns**: List of archived cards with replacement info
- **Use**: For card history view

## Helper Functions

Created `/lib/notificationHelpers.ts` with functions:

```typescript
createCardNotification()         // Generic card notification
notifyCardApproved()            // Approval notification
notifyCardRejected()            // Rejection notification
notifyCardBlocked()             // Block notification
notifyCardCanceled()            // Cancel notification
notifyCardArchived()            // Archive notification (future)
```

## User Workflow

### Scenario 1: New Card Gets Approved
1. User creates card + payment
2. Admin approves in dashboard
3. **System**:
   - Archives previous card (if exists)
   - Sets new card to ACTIVE
   - Sends ✅ "Card Approved" notification
4. **User sees**:
   - New card in list (old card gone)
   - Success notification in navbar

### Scenario 2: User Blocks Card
1. User opens card details
2. Clicks "Block Card" button
3. **System**:
   - Sets card to BLOCKED
   - Archives card
   - Sends 🔒 "Card Blocked" notification
4. **User sees**:
   - Card removed from list
   - Warning notification in navbar
   - Can create new card immediately

### Scenario 3: User Cancels Card
1. User opens card details
2. Clicks "Cancel Card" button
3. **System**:
   - Deletes card from DB
   - Sends ❌ "Card Canceled" notification
4. **User sees**:
   - Card removed from list
   - Info notification in navbar
   - Can create new card immediately

### Scenario 4: Admin Rejects Card
1. User applies for card + pays
2. Admin views pending cards
3. Admin clicks "Reject" with reason
4. **System**:
   - Sets card to INACTIVE
   - Sends ❌ "Card Rejected" notification with reason
5. **User sees**:
   - Card remains in list (INACTIVE)
   - Error notification in navbar with reason
   - Can create new card or try again

## UI Display Features

### Notification Icon Indicators
- 💳 Card-related notifications
- ✓ KYC notifications  
- Transaction updates (existing)

### Card List Behavior
- **Active cards**: Show in main cards grid
- **Pending cards**: Show with "Continue Application" button
- **Blocked cards**: Archived, not shown (can view history)
- **Rejected cards**: Shown as INACTIVE, can retry

### Notification Dropdown
- Shows all unread notifications first
- Card category clearly labeled
- Can mark individual or all as read
- Newest first

## Banking Standards Implemented

✅ **Archiving**: Cards retained in system for audit (not permanently deleted)
✅ **Replacement**: New card tracked with reference to previous card
✅ **History**: Full card lifecycle preserved
✅ **Notifications**: Users informed of all card events
✅ **Soft Delete**: Archived flag instead of hard delete
✅ **Audit Trail**: All dates and reasons tracked

## Testing Scenarios

### Test 1: Approval Flow
- [ ] Create card + payment
- [ ] Admin approves
- [ ] Check notification created
- [ ] Check old card archived
- [ ] Check new card is ACTIVE
- [ ] Check card list updated

### Test 2: Rejection Flow
- [ ] Create card + payment
- [ ] Admin rejects with reason
- [ ] Check notification with reason
- [ ] Check card is INACTIVE
- [ ] Check can create new card

### Test 3: Block Flow
- [ ] Have ACTIVE card
- [ ] Block card
- [ ] Check notification
- [ ] Check card archived
- [ ] Check card removed from list
- [ ] Check can create new card

### Test 4: Cancel Flow
- [ ] Have DRAFT card
- [ ] Cancel card
- [ ] Check notification
- [ ] Check card deleted
- [ ] Check can create new card

### Test 5: Notification Display
- [ ] Approve card → See success notification
- [ ] Reject card → See error notification
- [ ] Block card → See warning notification
- [ ] Cancel card → See info notification
- [ ] Check category labels display correctly

## Error Handling

All operations include:
- Authorization checks (user ownership)
- Admin role verification (for admin operations)
- Card existence validation
- State validation (can't approve twice)
- Database error handling
- Notification failure handling (won't stop main operation)

## Performance Considerations

- Archived cards excluded from default queries (faster loading)
- Notifications created async (doesn't block main operation)
- Indexes recommended on: `user`, `archived`, `status`, `createdAt`

## Future Enhancements

1. **Card History Page**: View archived cards with replacement chain
2. **Unblock Feature**: Allow users to unblock archived cards
3. **Bulk Archive**: Admin tool to archive old cards
4. **Email Notifications**: Send emails for card events
5. **SMS Notifications**: Critical alerts via SMS
6. **Notification Preferences**: User control over notification types
7. **Notification Center**: Dedicated page for all notifications

## Migration Script (if needed)

For existing databases, run:
```javascript
// Add missing fields to Card schema
db.cards.updateMany({}, {
  $set: {
    archived: false,
    archivedAt: null,
    archivedReason: ""
  }
});

// Update notification schema
db.notifications.updateMany({}, {
  $set: { card: null }
});
```
