# Card Cancellation & Blocking Feature - Test Plan

## Feature Overview
Users can now:
1. **Block Cards** - Temporarily disable a card while keeping it in the system
2. **Cancel Cards** - Permanently delete a card from the system
3. **Create New Cards** - After blocking or canceling a card, users can immediately create a new one

## Implementation Details

### Frontend Changes (page.tsx)
- Added state management for cancel/block confirmation modals
- Added `handleCancelCard()` - DELETE request to `/api/cards/[id]`
- Added `handleBlockCard()` - PATCH request to `/api/cards/[id]` with `status: "BLOCKED"`
- Added UI buttons in card details modal
- Added confirmation modals before destructive actions

### Backend Changes (route.ts - POST validation)
- Updated validation logic to allow creating new cards after deletion/blocking
- ACTIVE cards: Blocks new card creation (must cancel or block first)
- PENDING cards with incomplete applications (DRAFT, PAYMENT_PENDING, PAYMENT_RECEIVED): Blocks new card creation
- BLOCKED/INACTIVE cards: Allows new card creation immediately

## Test Scenarios

### Test Case 1: Block an Active Card
**Steps:**
1. Create a card and get it to ACTIVE status
2. Open card details
3. Click "Block Card" button
4. Confirm block action in confirmation modal
5. Verify card status changes to BLOCKED
6. Verify "Create New Card" button works immediately
7. Create a new card and verify it succeeds

**Expected Result:** ✓ Card is blocked, new card can be created

### Test Case 2: Cancel a Card
**Steps:**
1. Create a card (any status except BLOCKED)
2. Open card details
3. Click "Cancel Card" button
4. Confirm cancel action in confirmation modal
5. Verify card is removed from the cards list
6. Verify "Create New Card" button works immediately
7. Create a new card and verify it succeeds

**Expected Result:** ✓ Card is deleted, new card can be created

### Test Case 3: Block a Draft Card
**Steps:**
1. Create a card draft (DRAFT status)
2. Open card details
3. Click "Block Card" button
4. Confirm block action
5. Verify card status changes to BLOCKED
6. Try to create a new card

**Expected Result:** ✓ Draft card can be blocked, new card creation allowed

### Test Case 4: Cannot Create While Active
**Steps:**
1. Have an ACTIVE card
2. Try to create a new card without blocking/canceling first
3. Verify error message appears

**Expected Result:** ✓ Error message: "You already have an active card. Please block or delete it first."

### Test Case 5: Cannot Create While Pending Payment
**Steps:**
1. Create a card and proceed to PAYMENT_PENDING status
2. Try to create a new card without completing payment
3. Verify error message appears

**Expected Result:** ✓ Error message: "You have a pending card application. Complete or cancel it first."

### Test Case 6: Cascade Operations
**Steps:**
1. Block Card A
2. Create Card B (should succeed)
3. Verify both cards exist with different statuses
4. Block Card B
5. Cancel Card A
6. Create Card C (should succeed)

**Expected Result:** ✓ Multiple cards in different states, operations cascade correctly

## Verification Checklist

- [ ] UI buttons appear for active/pending cards
- [ ] Confirmation modals appear before actions
- [ ] Block action updates card status to BLOCKED
- [ ] Cancel action removes card from list
- [ ] New cards can be created after block/cancel
- [ ] Error messages display for invalid states
- [ ] No console errors or exceptions
- [ ] UI updates properly after each action
- [ ] Toast notifications appear for actions
- [ ] Modal closes after successful action

## Database State Verification

After each test, verify in MongoDB:
1. **Blocked Card**: `status: "BLOCKED"`, document still exists
2. **Canceled Card**: Document is deleted
3. **New Card**: Fresh document created with correct properties

## API Response Validation

### Block Card Response
```json
{
  "message": "Card updated",
  "card": {
    "_id": "...",
    "status": "BLOCKED",
    ...
  }
}
```

### Cancel Card Response
```json
{
  "message": "Card deleted successfully"
}
```

### Create New Card After Block/Cancel
```json
{
  "message": "Card draft created. Proceed to payment request.",
  "card": {
    "_id": "...",
    "status": "PENDING",
    "requestStatus": "DRAFT",
    ...
  }
}
```

## Known Limitations & Edge Cases

1. **BLOCKED cards take up a "slot"** - User still cannot create multiple active cards even with BLOCKED cards. This is by design.
2. **Soft vs Hard Delete** - Cancel uses hard delete (removes from DB), Block uses soft delete (status flag)
3. **Cascade Deletes** - When a card is deleted, transactions and references should be handled separately

## Future Enhancements

1. Add card history/archive view
2. Add temporary freeze option (24-hour auto-unblock)
3. Add reason/notes for blocking cards
4. Add admin-side card management
5. Add analytics on blocked/canceled cards
