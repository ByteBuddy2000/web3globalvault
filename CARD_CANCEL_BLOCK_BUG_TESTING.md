# Card Cancel/Block Feature - Bug Verification Guide

## Pre-Testing Checklist

### Environment
- [ ] Node.js running
- [ ] MongoDB connected
- [ ] Next.js dev server running on localhost:3000
- [ ] User authenticated and logged in
- [ ] Multiple test user accounts available

### Database State
- [ ] Database is clean (or has test data)
- [ ] User has no cards initially
- [ ] User has sufficient permissions

## Manual Bug Testing

### Bug Test 1: Duplicate Card Prevention
**Scenario**: User tries to create multiple active cards
**Expected**: 
- First card creation succeeds
- Second card creation fails with error message
**Verification**:
```bash
# Check POST /api/cards error response
# Should show: "You already have an active card..."
```

### Bug Test 2: Block Then Create
**Scenario**: Block a card, then immediately create a new one
**Expected**:
- Block succeeds
- New card creation succeeds
- Both cards exist in database
**Verification**:
```bash
# Check MongoDB
db.cards.find({user: ObjectId("...")})
# Should have 2 cards: one BLOCKED, one PENDING
```

### Bug Test 3: Cancel Then Create
**Scenario**: Cancel a card, then immediately create a new one
**Expected**:
- Card is deleted from database
- New card creation succeeds
- Only new card exists
**Verification**:
```bash
# Check MongoDB before and after
db.cards.count({user: ObjectId("...")})
# Should go from N -> N-1 -> N (after cancel) -> N (after create)
```

### Bug Test 4: Payment Flow After Cancel
**Scenario**: 
1. Create card A, get to PAYMENT_PENDING
2. Cancel card A
3. Create card B
4. Try to complete card A payment
**Expected**:
- Card B creation succeeds
- Cannot complete card A payment (card deleted)
**Verification**:
- Card B has fresh DRAFT status
- Card A not found in any API responses

### Bug Test 5: Modal State Cleanup
**Scenario**:
1. Open card details
2. Click "Block Card"
3. Close confirmation modal without confirming
4. Card still exists and is ACTIVE
5. Verify can still click block again
**Expected**:
- All modals close properly
- State is maintained correctly
- Can retry action
**Check**:
- No console errors
- Modal closes cleanly
- Card details still visible

### Bug Test 6: UI Button Visibility
**Scenario**: Check button visibility across different card states
**Expected**:
- ACTIVE cards: Show both buttons
- PENDING with DRAFT/PAYMENT_PENDING: Show both buttons
- PENDING with PAYMENT_RECEIVED: Show both buttons  
- BLOCKED cards: No action buttons
- INACTIVE cards: No action buttons
**Verification**:
- Inspect HTML: `document.querySelectorAll('[role="button"]')`
- Verify button visibility in each state

### Bug Test 7: Race Condition
**Scenario**:
1. Open card details for Card A
2. Quickly click "Block Card" twice
3. Or click "Block" and "Cancel" rapidly
**Expected**:
- First action processes
- Second action either ignored or properly handled
- No duplicate API calls
- Card state is consistent
**Check**:
- Network tab shows only 1 request
- No "Optimistic update" conflicts
- Card state is final and correct

### Bug Test 8: Error Handling
**Scenario**: Simulate API errors
**Expected Error Cases**:
- DELETE fails: Show "Error canceling card"
- PATCH fails: Show "Error blocking card"
- Network timeout: Show appropriate error
- 403 Forbidden: Show "Forbidden"
- 404 Not Found: Show "Card not found"
**Verification**:
- Use network throttling in DevTools
- Check error messages
- Verify UI still responsive

### Bug Test 9: Toast Notifications
**Scenario**: Check all toast messages
**Expected Messages**:
- ✓ Block: "Card blocked successfully..."
- ✓ Cancel: "Card canceled successfully..."
- ✓ Create: "Card draft created..."
- ✗ Create (active exists): Error message
- ✗ API error: Relevant error

### Bug Test 10: Responsive Design
**Scenario**: Test on different screen sizes
**Expected**:
- Mobile (375px): Modals fit, buttons readable
- Tablet (768px): Modals centered, proper spacing
- Desktop (1920px): Proper layout
**Check**:
- No text overflow
- Buttons clickable
- Modals centered

## Automated Bug Detection

### Console Errors
```javascript
// Run in DevTools console
window.addEventListener('error', (e) => {
  console.error('[ERROR]', e.message, e.stack);
});
```

### Network Errors
```javascript
// Monitor fetch errors
const originalFetch = window.fetch;
window.fetch = function(...args) {
  return originalFetch.apply(this, args)
    .then(r => {
      if (!r.ok) console.warn('[API Error]', r.status, r.statusText);
      return r;
    });
};
```

### State Validation
```javascript
// After each action, verify state
function validateState(cards) {
  let activeCount = cards.filter(c => c.status === 'ACTIVE').length;
  if (activeCount > 1) console.error('[BUG] Multiple ACTIVE cards!');
  
  let pendingIncomplete = cards.filter(c => 
    c.status === 'PENDING' && 
    ['DRAFT', 'PAYMENT_PENDING'].includes(c.requestStatus)
  ).length;
  if (pendingIncomplete > 1) console.error('[BUG] Multiple incomplete applications!');
}
```

## Performance Testing

### Load Testing
1. Create 10+ cards quickly
2. Block half of them
3. Cancel some
4. Create more
**Expected**: No slowdown, operations complete within 1-2s

### Memory Leaks
1. Create and delete 50+ cards
2. Check memory usage in DevTools
3. Expected: Memory stable or decreasing

## Security Testing

### Authorization
- [ ] Cannot delete other user's card
- [ ] Cannot block other user's card  
- [ ] Cannot access deleted card via API
- [ ] Token required for all operations

### Input Validation
- [ ] Invalid cardId rejected
- [ ] Invalid status values rejected
- [ ] SQL injection attempts blocked
- [ ] XSS attempts blocked

## Database Integrity

### Cascade Checks
After canceling a card, verify:
```javascript
// In MongoDB
db.transactions.count({cardId: ObjectId("...")})  // Should be 0 or handled
db.swaps.count({cardId: ObjectId("...")})         // Should be 0 or handled
db.cards.findOne({_id: ObjectId("...")})          // Should be null
```

### Consistency Checks
- User.cards array doesn't reference deleted card
- No orphaned card records
- Correct counts in database

## Success Criteria

✅ All tests pass without errors
✅ No console warnings or errors
✅ All toast notifications display correctly
✅ UI responsive on all screen sizes
✅ Database state is consistent
✅ No race conditions or duplicate operations
✅ Performance is acceptable (<2s per operation)
✅ Security validation passes

## Known Issues & Workarounds

### Issue: Block doesn't immediately show in UI
**Cause**: Card list not refreshed
**Fix**: Implemented card state update in handler

### Issue: Cannot create after block sometimes
**Cause**: Stale card data in component state
**Fix**: fetchCards() called after each action

### Issue: Modal doesn't close on error
**Cause**: Exception thrown in handler
**Fix**: Try-catch with finally blocks

## Debugging Commands

```bash
# Monitor API calls
# In DevTools Network tab, filter by XHR

# Check card data
# In DevTools Console:
fetch('/api/cards', {credentials: 'include'})
  .then(r => r.json())
  .then(d => console.table(d.cards))

# Test block endpoint
fetch('/api/cards/[id]', {
  method: 'PATCH',
  credentials: 'include',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({status: 'BLOCKED'})
})
.then(r => r.json())
.then(d => console.log(d))

# Test cancel endpoint  
fetch('/api/cards/[id]', {
  method: 'DELETE',
  credentials: 'include'
})
.then(r => r.json())
.then(d => console.log(d))
```

## Report Template

```
Bug Report: [Title]
Severity: [Critical/High/Medium/Low]
Steps to Reproduce:
1. 
2. 
3. 

Expected Result:

Actual Result:

Screenshots/Console Errors:

Database State:

Environment:
- Browser: 
- Node version:
- OS:
```
