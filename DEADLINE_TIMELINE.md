# 📊 Bill Expiration Timeline Visualization

---

## Current System (January 2026)

### Month-by-Month Submission Windows

```
╔════════════════════════════════════════════════════════════════════╗
║                    2025 & 2026 SUBMISSION TIMELINE                ║
╚════════════════════════════════════════════════════════════════════╝

SEPTEMBER 2025
├─ Incurred: Sept 1-30, 2025
├─ Deadline: Oct 31, 2025  ❌ EXPIRED
└─ Status: Cannot submit (already passed)

OCTOBER 2025
├─ Incurred: Oct 1-31, 2025
├─ Deadline: Nov 30, 2025  ❌ EXPIRED
└─ Status: Cannot submit (already passed)

NOVEMBER 2025
├─ Incurred: Nov 1-30, 2025
├─ Deadline: Dec 31, 2025  ❌ EXPIRED
└─ Status: Cannot submit (already passed)

DECEMBER 2025
├─ Incurred: Dec 1-31, 2025
├─ Deadline: Jan 31, 2026  ⏰ 21 DAYS LEFT (as of Jan 11)
└─ Status: ✅ Can still submit (deadline not passed)

────────────────────────── TODAY (January 11, 2026) ──────────────────────

JANUARY 2026 ✅ CURRENT MONTH
├─ Incurred: Jan 1-31, 2026
├─ Deadline: Feb 28, 2026  ⏰ 48 DAYS LEFT
└─ Status: ✅ Can submit

FEBRUARY 2026 (Future)
├─ Incurred: Feb 1-28, 2026
├─ Deadline: Mar 31, 2026  ⏰ 79 DAYS LEFT
└─ Status: ✅ Can submit when February comes

MARCH 2026 (Future)
├─ Incurred: Mar 1-31, 2026
├─ Deadline: Apr 30, 2026  ⏰ 110 DAYS LEFT
└─ Status: ✅ Can submit when March comes
```

---

## Visual Timeline

### Today: January 11, 2026

```
November 2025              January 2026              March 2026
(EXPIRED)              (CURRENT - OK)            (FUTURE - OK)
    │                        │                        │
    ├─ Deadline: Dec 31  ─────┤ TODAY               Deadline: Mar 31
    │     (21 days left)
    └─ Can still submit
    
December 2025              February 2026
  (PREVIOUS - OK)        (NEXT MONTH)
      │                       │
  Deadline: Jan 31     Deadline: Mar 31
  (21 days left)       (48 days left)
      │                       │
    Can submit          Can submit
```

---

## Deadline Calculation Formula

```
Submission Deadline = Month of Expense + 2 months - 1 day

EXAMPLES:
─────────────────────────────────────────────────────────

January 2026 Expense
└─ Deadline = January + 2 = March - 1 day = February 28, 2026

February 2026 Expense  
└─ Deadline = February + 2 = April - 1 day = March 31, 2026

December 2025 Expense
└─ Deadline = December + 2 = February - 1 day = January 31, 2026

June 2025 Expense (OLD - Expired)
└─ Deadline = June + 2 = August - 1 day = August 31, 2025 ❌ PASSED
```

---

## Real-World Example: January 2026

### Current Status Table

```
┌─────────────────────────────────────────────────────────────────┐
│ EXPENSE DATE       │ DEADLINE      │ STATUS       │ DAYS LEFT   │
├─────────────────────────────────────────────────────────────────┤
│ November 15, 2025  │ Dec 31, 2025  │ ❌ EXPIRED  │ 0           │
│ December 20, 2025  │ Jan 31, 2026  │ ⏰ VALID    │ 21          │
│ January 5, 2026    │ Feb 28, 2026  │ ✅ ACCEPTED │ 48          │
│ January 25, 2026   │ Feb 28, 2026  │ ✅ ACCEPTED │ 48          │
│ February 1, 2026   │ Mar 31, 2026  │ ✅ ACCEPTED │ 79          │
│ March 15, 2026     │ Apr 30, 2026  │ ✅ ACCEPTED │ 110         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Submission Window by Month

### 2025-2026 Calendar View

```
NOVEMBER 2025          DECEMBER 2025         JANUARY 2026          FEBRUARY 2026
┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ Nov 1-30     │      │ Dec 1-31     │      │ Jan 1-31     │      │ Feb 1-28     │
│ Deadline:    │  →   │ Deadline:    │  →   │ Deadline:    │  →   │ Deadline:    │
│ Dec 31, 2025 │      │ Jan 31, 2026 │      │ Feb 28, 2026 │      │ Mar 31, 2026 │
│ ❌ EXPIRED   │      │ ⏰ VALID     │      │ ✅ ACCEPTED  │      │ ✅ ACCEPTED  │
└──────────────┘      └──────────────┘      └──────────────┘      └──────────────┘
     (OLD)             (PREVIOUS)            (CURRENT)             (NEXT MONTH)
```

---

## System Behavior Examples

### Example 1: Submitting an Old Expense
```
User Action: "Submit expense from September 2025 on January 11, 2026"

System Calculation:
  Expense Month: September 2025
  Deadline: September + 2 months = November 2025 - 1 day = Oct 31, 2025
  Today: January 11, 2026
  Oct 31, 2025 < January 11, 2026 → EXPIRED

System Response: ❌ REJECTED
  "Expense from September 2025 expired on October 31, 2025"
  "This expense can no longer be submitted"
```

### Example 2: Submitting a Current Month Expense
```
User Action: "Submit expense from January 15, 2026 on January 11, 2026"

System Calculation:
  Expense Month: January 2026
  Deadline: January + 2 months = March 2026 - 1 day = Feb 28, 2026
  Today: January 11, 2026
  Jan 11, 2026 ≤ Feb 28, 2026 → VALID

System Response: ✅ ACCEPTED
  "Expense from January 2026 accepted"
  "Deadline: February 28, 2026"
  "Days remaining: 48"
```

### Example 3: Submitting on Deadline Day
```
User Action: "Submit expense from December 2025 on January 31, 2026"

System Calculation:
  Expense Month: December 2025
  Deadline: December + 2 months = February 2026 - 1 day = Jan 31, 2026
  Today: January 31, 2026
  Jan 31, 2026 ≤ Jan 31, 2026 → EXACTLY ON DEADLINE (Still Valid)

System Response: ✅ ACCEPTED
  "Expense from December 2025 accepted"
  "Deadline: January 31, 2026"
  "Days remaining: 0 (LAST DAY)"
  ⚠️ WARNING: "This is the last day to submit for December 2025"
```

### Example 4: Submitting After Deadline
```
User Action: "Submit expense from December 2025 on February 1, 2026"

System Calculation:
  Expense Month: December 2025
  Deadline: December + 2 months = February 2026 - 1 day = Jan 31, 2026
  Today: February 1, 2026
  Feb 1, 2026 > Jan 31, 2026 → EXPIRED (One day late!)

System Response: ❌ REJECTED
  "Expense from December 2025 expired on January 31, 2026"
  "This was due yesterday. Please submit for current/previous months only."
```

---

## Timeline Visualization for Each Month

### November 2025 Expense Dates
```
Incurred: Any date in November 2025 (Nov 1-30)
Submission Window: Nov 1 to Dec 31, 2025
Current Status (Jan 11, 2026): ❌ EXPIRED
Last Chance Was: Dec 31, 2025 (11 days ago)
```

### December 2025 Expense Dates
```
Incurred: Any date in December 2025 (Dec 1-31)
Submission Window: Dec 1, 2025 to Jan 31, 2026
Current Status (Jan 11, 2026): ⏰ VALID - 21 days left
Last Chance: Jan 31, 2026 (20 days from now)
Action: ✅ Can submit now
```

### January 2026 Expense Dates
```
Incurred: Any date in January 2026 (Jan 1-31)
Submission Window: Jan 1, 2026 to Feb 28, 2026
Current Status (Jan 11, 2026): ✅ ACCEPTED - 48 days left
Last Chance: Feb 28, 2026 (48 days from now)
Action: ✅ Can submit now
```

### February 2026 Expense Dates
```
Incurred: Any date in February 2026 (Feb 1-28)
Submission Window: Feb 1, 2026 to Mar 31, 2026
Current Status (Jan 11, 2026): ⏳ FUTURE - 79 days available
Last Chance: Mar 31, 2026 (79 days from now)
Action: ✅ Can submit when February arrives
```

---

## What Happens When?

### ✅ Submissions are ACCEPTED if:
- Expense date is from current month (January)
- Expense date is from previous month (December) AND deadline not passed
- AND deadline date >= today's date

### ❌ Submissions are REJECTED if:
- Expense is from 2+ months ago (November or older)
- Deadline date < today's date
- Even if the person forgot by 1 day

### ⏰ Edge Case: Exactly on Deadline
- If deadline = today, submission is STILL ACCEPTED
- Stops being valid at start of next day (00:00 AM)

---

## User-Friendly Messages

### When Submitting Valid Expense
```
✅ "Expense accepted!"
   "Submission deadline: February 28, 2026"
   "Days remaining: 48"
```

### When Submitting Expired Expense
```
❌ "Expense too old to submit"
   "Submission deadline was: December 31, 2025"
   "Please submit expenses from current or previous month only"
```

### When Submitting on Last Day
```
⚠️  "Warning: Last day to submit!"
    "Deadline: January 31, 2026 (TODAY)"
    "Submit now - deadline expires tomorrow"
```

---

## Summary

| Incurred | Deadline | Current Status | Can Submit? |
|----------|----------|----------------|------------|
| Sept 2025 or earlier | Oct 2025 or earlier | EXPIRED | ❌ NO |
| October 2025 | Nov 2025 | EXPIRED | ❌ NO |
| November 2025 | Dec 31, 2025 | EXPIRED | ❌ NO |
| December 2025 | Jan 31, 2026 | Valid (21 days left) | ✅ YES |
| **January 2026** | **Feb 28, 2026** | **CURRENT (48 days left)** | **✅ YES** |
| February 2026 (future) | Mar 31, 2026 | Future (79 days) | ✅ YES |

---

**Reference Date**: January 11, 2026  
**Current Submission Window**: December 2025 - February 2026 expenses  
**System Status**: ✅ Active and enforcing deadlines
