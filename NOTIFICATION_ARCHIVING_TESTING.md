# Card Notification & Archiving System - Testing Guide

## Pre-Testing Checklist

### Setup
- [ ] MongoDB connection verified
- [ ] Next.js dev server running
- [ ] Admin user account ready
- [ ] Regular user account ready
- [ ] DevTools console accessible
- [ ] Network tab ready for API monitoring

## Unit Tests

### Test 1: Card Approval Creates Notification
**Endpoint**: `POST /api/cards/verify`

**Steps**:
1. Create card as user (get to PAYMENT_RECEIVED status)
2. Log in as admin
3. Call POST with action="APPROVE" and notes
4. Check response

**Expected**:
```json
{
  "message": "Card approveved successfully",
  "card": {
    "status": "ACTIVE",
    "requestStatus": "ADMIN_APPROVED"
  }
}
```

**Database Check**:
```javascript
// In MongoDB console
db.notifications.findOne(
  {user: ObjectId("..."), category: "card", type: "success"}
)

// Should return:
{
  title: "✅ Card Approved - {TIER}",
  message: "Your ... card has been approved...",
  type: "success",
  category: "card",
  card: ObjectId("...")
}
```

### Test 2: Card Rejection Creates Notification
**Endpoint**: `POST /api/cards/verify`

**Steps**:
1. Create card as user (get to PAYMENT_RECEIVED status)
2. Log in as admin
3. Call POST with action="REJECT" and reason
4. Check response

**Expected**:
```json
{
  "message": "Card rejectted successfully",
  "card": {
    "status": "INACTIVE",
    "requestStatus": "ADMIN_REJECTED",
    "rejectionReason": "Your reason here"
  }
}
```

**Database Check**:
```javascript
db.notifications.findOne(
  {user: ObjectId("..."), category: "card", type: "error"}
)

// Should show rejection reason in message
```

### Test 3: Previous Card Gets Archived on Approval
**Steps**:
1. User 1: Create card A, get approved (ACTIVE)
2. User 1: Create card B, get to PAYMENT_RECEIVED
3. Admin: Approve card B
4. Check database for card A

**Expected**:
```javascript
// Card A after approval of card B
{
  _id: ObjectId("cardA"),
  status: "ARCHIVED",
  archived: true,
  archivedAt: ISODate("..."),
  archivedReason: "Replaced by new card",
  replacedByCardId: ObjectId("cardB")
}

// Card B
{
  _id: ObjectId("cardB"),
  status: "ACTIVE",
  archived: false
}
```

### Test 4: Block Card Creates Notification
**Endpoint**: `PATCH /api/cards/[id]`

**Steps**:
1. Have ACTIVE card
2. Call PATCH with status="BLOCKED"
3. Check response

**Expected**:
```json
{
  "message": "Card updated",
  "card": {
    "status": "BLOCKED",
    "archived": true
  }
}
```

**Notification Check**:
```javascript
db.notifications.findOne(
  {category: "card", title: /🔒 Card Blocked/}
)

// Should have type: "warning"
```

### Test 5: Cancel Card Creates Notification
**Endpoint**: `DELETE /api/cards/[id]`

**Steps**:
1. Have any card
2. Call DELETE
3. Check response

**Expected**:
```json
{
  "message": "Card deleted successfully"
}
```

**Database Check**:
```javascript
// Card should be gone
db.cards.findById(ObjectId("..."))
// Returns null

// But notification should exist
db.notifications.findOne(
  {title: /❌ Card Canceled/}
)
```

## Integration Tests

### Test 6: Complete Approval Flow
**Steps**:
1. User: Create card (DRAFT)
2. User: Proceed to payment (PAYMENT_PENDING)
3. User: Submit transaction (PAYMENT_RECEIVED)
4. Admin: Approve card
5. User: Check notifications
6. User: Check card list

**Expected**:
- User sees success notification
- Notification shows in navbar dropdown
- Card shows as ACTIVE
- Old card (if exists) is archived
- Old card doesn't show in card list
- User can see unread count badge

### Test 7: Complete Rejection Flow
**Steps**:
1. User: Create card (DRAFT)
2. User: Proceed to payment (PAYMENT_PENDING)
3. User: Submit transaction (PAYMENT_RECEIVED)
4. Admin: Reject card with reason
5. User: Check notifications
6. User: Tries to create new card

**Expected**:
- User sees error notification
- Reason displayed in notification
- Card shows as INACTIVE
- User can create new card immediately
- Old card can be viewed but not used

### Test 8: Block and Create New
**Steps**:
1. User: Have ACTIVE card A
2. User: Block card A
3. User: See notification
4. User: Create card B
5. Check database state

**Expected**:
- Card A: status="BLOCKED", archived=true
- Card B: status="PENDING"
- Card A not in cards list (GET /api/cards)
- Notification shows warning type
- Card B can proceed through payment flow

### Test 9: Cancel and Recreate
**Steps**:
1. User: Have DRAFT card A
2. User: Cancel card A
3. User: See notification
4. User: Create card B immediately
5. Check database state

**Expected**:
- Card A: deleted from DB
- Card B: created, status="PENDING"
- Notification shows info type
- No error when creating card B
- Both cards have notifications

### Test 10: Notification History
**Steps**:
1. Perform multiple card operations
2. Open notification dropdown
3. Check all notifications displayed
4. Mark as read
5. Refresh page
6. Check state persisted

**Expected**:
- All card notifications shown
- Newest first
- Unread badge on each unread
- Can mark individual as read
- "Mark all read" button works
- State persists after refresh

## UI/UX Tests

### Test 11: Notification Dropdown Display
**Steps**:
1. Click bell icon
2. Check notification list
3. Check category labels
4. Check message truncation

**Expected**:
- Card notifications show 💳 icon
- KYC notifications show ✓ icon
- Titles are clear and readable
- Messages summarize the event
- Long messages truncate with ellipsis

### Test 12: Card List Updates
**Steps**:
1. View cards list with ACTIVE card
2. Create new card
3. Approve new card
4. Check cards list

**Expected**:
- Old card disappears from list
- New card appears in list
- No page refresh needed
- UI responds smoothly

### Test 13: Mobile Responsiveness
**Steps**:
1. Open on mobile (375px)
2. Click notification bell
3. Check dropdown sizing
4. Check text readability

**Expected**:
- Notification dropdown fits screen
- Text readable (not cut off)
- Can scroll through notifications
- Close button accessible

## API Response Tests

### Test 14: Verify Error Cases

**Case 1: Approve non-existent card**
```bash
curl -X POST http://localhost:3000/api/cards/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"cardId":"invalid_id","action":"APPROVE"}'
```
**Expected**: 404 Card not found

**Case 2: Reject with missing reason**
```bash
curl -X POST http://localhost:3000/api/cards/verify \
  -H "Content-Type: application/json" \
  -d '{"cardId":"{id}","action":"REJECT"}'
```
**Expected**: 200 OK with default reason

**Case 3: Double approval**
```bash
# Approve same card twice
```
**Expected**: 400 Card already processed

**Case 4: Unauthorized access**
```bash
# Try to delete/block someone else's card
```
**Expected**: 403 Forbidden

## Database Validation Tests

### Test 15: Archive Chain Integrity
**Steps**:
1. Create cards A, B, C
2. Approve A, B, C sequentially
3. Check archive chain

**Expected**:
```javascript
// Card A
{archived: true, replacedByCardId: ObjectId("B")}

// Card B  
{archived: true, replacedByCardId: ObjectId("C")}

// Card C
{archived: false}
```

### Test 16: Notification Linking
**Steps**:
1. Create notification for card
2. Check card reference

**Expected**:
```javascript
{
  card: ObjectId("..."),
  category: "card",
  // Can populate to get card details
}
```

## Performance Tests

### Test 17: Query Performance
**Steps**:
1. Create 100+ cards (mix of active/archived)
2. Measure time for GET /api/cards
3. Check database query

**Expected**:
- Query excludes archived: `archived: {$ne: true}`
- Response time < 100ms
- Only active/pending cards returned

### Test 18: Notification Load
**Steps**:
1. Create 50+ notifications
2. Load notification dropdown
3. Check render time

**Expected**:
- Notifications load within 200ms
- Scroll smooth
- No lag when marking as read

## Regression Tests

### Test 19: Existing Functionality
**Steps**:
1. Create card (existing flow)
2. Make payment (existing flow)
3. Verify payment (existing flow)
4. Use card (existing flow)

**Expected**:
- All existing features work
- No new errors introduced
- Notifications added (new feature)
- Performance unchanged

### Test 20: Admin Functionality
**Steps**:
1. Admin views pending cards
2. Admin approves/rejects
3. Admin checks card status

**Expected**:
- All admin features work
- Notifications created
- Card status updated correctly

## Success Criteria

✅ All 20 tests pass
✅ No console errors
✅ Notifications display in dropdown
✅ Card list updates correctly
✅ Archive chain maintained
✅ API responses valid
✅ Database state consistent
✅ Mobile responsive
✅ Performance acceptable
✅ No existing features broken

## Debugging Commands

```javascript
// Check all notifications for user
db.notifications.find({user: ObjectId("...")}).pretty()

// Check card archive chain
db.cards.find({user: ObjectId("...")}).pretty()

// Find all archived cards
db.cards.find({archived: true}).pretty()

// Find cards waiting for approval
db.cards.find({requestStatus: "PAYMENT_RECEIVED"}).pretty()

// Check notification categories
db.notifications.aggregate([
  {$group: {_id: "$category", count: {$sum: 1}}}
])

// Recent notifications (last 10)
db.notifications.find().sort({createdAt: -1}).limit(10).pretty()
```

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Notification doesn't appear | Not created | Check logs, verify helper called |
| Old card still visible | Not archived | Check archived flag, update query |
| Can't create new card | Validation error | Check for ACTIVE/PENDING cards |
| Admin can't approve | Auth error | Verify admin role, JWT token |
| Card doubles | Race condition | Use transaction wrapper |

## Performance Benchmarks

| Operation | Expected | Actual |
|-----------|----------|--------|
| Create card | <200ms | ___ |
| Approve card | <300ms | ___ |
| Reject card | <300ms | ___ |
| Block card | <200ms | ___ |
| Cancel card | <200ms | ___ |
| Load cards | <100ms | ___ |
| Load notifications | <100ms | ___ |

## Sign-off

- Tester: ___________
- Date: ___________
- All tests passed: [ ]
- Issues found: [ ]
- Ready for production: [ ]
