# Database Triggers & Procedures Documentation

## Overview
Added 11 PostgreSQL triggers to automate data cascading and maintain consistency across related tables. These triggers ensure that when one action completes, it automatically triggers related actions in other tables.

---

## Triggers Added

### **TRIGGER 1: Application Status Change Logging**
**Function:** `fn_log_application_status_change()`  
**Event:** BEFORE UPDATE on `loan_applications`

**What it does:**
- Automatically logs every status change to `application_status_history`
- Sets `submitted_at` when status changes to 'submitted'
- Sets `approved_at` when status changes to 'approved'
- Sets `rejected_at` when status changes to 'rejected'

**Example:**
```sql
UPDATE loan_applications SET application_status = 'submitted' WHERE id = 1;
-- Automatically creates entry in application_status_history
-- Automatically sets submitted_at = NOW()
```

---

### **TRIGGER 2: Auto-Notifications on Status Changes**
**Function:** `fn_notify_on_application_status_change()`  
**Event:** AFTER UPDATE on `loan_applications`

**What it does:**
- Creates automatic SMS notifications when application status changes
- Different messages for: submitted, under_review, approved, rejected, disbursed
- Links notification to customer and application
- Sets notification status to 'pending' for backend service to send

**Status Message Mapping:**
| Status | Message |
|--------|---------|
| submitted | "Your application has been received" |
| under_review | "Your application is under review" |
| approved | "Congratulations! Your loan is approved" |
| rejected | "Your application has been rejected" |
| disbursed | "Your loan amount has been disbursed" |

---

### **TRIGGER 3: Customer Creation Audit Logging**
**Function:** `fn_audit_customer_creation()`  
**Event:** AFTER INSERT on `customers`

**What it does:**
- Automatically logs every new customer creation
- Records: first_name, last_name, mobile_number, email, date_of_birth
- Creates audit trail for compliance

**Example:**
```sql
INSERT INTO customers (first_name, last_name, mobile_number, email) 
VALUES ('Raju', 'Bhai', '7772884698', 'raju@test.com');
-- Automatically creates audit_log entry with all customer details
```

---

### **TRIGGER 4: Document Validation**
**Function:** `fn_validate_document_application()`  
**Event:** BEFORE INSERT on `documents`

**What it does:**
- Validates that `application_id` exists in loan_applications
- Validates that `document_requirement_id` matches the application's category/subcategory
- Prevents orphaned document records
- Raises error if application doesn't exist (transaction rolls back)

**Example:**
```sql
-- This will FAIL - invalid application_id
INSERT INTO documents (application_id, document_type) VALUES (99999, 'pdf');
-- Error: Application ID 99999 does not exist

-- This will SUCCEED - valid application_id
INSERT INTO documents (application_id, document_type) VALUES (1, 'pdf');
```

---

### **TRIGGER 5: Question Response Validation**
**Function:** `fn_validate_question_response()`  
**Event:** BEFORE INSERT on `question_responses`

**What it does:**
- Validates that the question belongs to the application's category/subcategory
- Prevents saving responses to wrong questions
- Issues warning but allows insertion (soft validation)

---

### **TRIGGER 6: Auto-Update Customer KYC Status**
**Function:** `fn_update_customer_kyc_status()`  
**Event:** AFTER UPDATE on `kyc_verifications`

**What it does:**
- Tracks when all mandatory KYC steps are verified
- Automatically updates `customers.kyc_status` to 'verified'
- Sets `customers.kyc_completed_at` timestamp
- Marks workflow milestone automatically

**Example Workflow:**
```
1. KYC Step 1 verified (Aadhaar) → status still 'pending'
2. KYC Step 2 verified (PAN) → status still 'pending'
3. KYC Step 3 verified (Address) → status still 'pending'
4. KYC Step 4 verified (Bank) → status still 'pending'
5. KYC Step 5 verified (Credit Score) → status still 'pending'
6. KYC Step 6 verified (Documents) → **TRIGGER FIRES**
   → customers.kyc_status = 'verified' ✓
   → customers.kyc_completed_at = NOW() ✓
```

---

### **TRIGGER 7: KYC Verification Audit Logging**
**Function:** `fn_audit_kyc_verification()`  
**Event:** AFTER INSERT OR UPDATE on `kyc_verifications`

**What it does:**
- Logs every KYC verification creation and update
- Records: verification_method, status, date, verified_by, customer_id, application_id
- Maintains compliance and dispute resolution trail

---

### **TRIGGER 8: Status History Audit Logging**
**Function:** `fn_audit_status_history()`  
**Event:** AFTER INSERT on `application_status_history`

**What it does:**
- Logs every status history entry (double audit trail)
- Records: from_status, to_status, changed_by, remarks
- Provides complete audit trail of application lifecycle

---

### **TRIGGER 9: Document Upload Audit Logging**
**Function:** `fn_audit_document_upload()`  
**Event:** AFTER INSERT on `documents`

**What it does:**
- Logs every document upload
- Records: application_id, document_type, original_filename, file_size_kb
- Tracks all document activities

---

### **TRIGGER 10: Customer Timestamp Auto-Update**
**Function:** `fn_update_customer_timestamp()`  
**Event:** BEFORE UPDATE on `customers`

**What it does:**
- Automatically updates `customers.updated_at` to NOW()
- Ensures updated_at is always current when any field changes
- No manual timestamp management needed

---

### **TRIGGER 11: KYC Verification Notifications**
**Function:** `fn_notify_on_kyc_verified()`  
**Event:** AFTER UPDATE on `kyc_verifications`

**What it does:**
- Sends SMS notification when KYC verification is marked as 'verified'
- Notifies customer that their KYC has been completed
- Links to customer and application

---

## Data Flow Diagrams

### **Scenario 1: Application Submitted**
```
API Call: PUT /api/loan-applications/1
  ↓
Node.js: UPDATE loan_applications SET application_status = 'submitted'
  ↓
TRIGGER 1: fn_log_application_status_change()
  ├─ INSERT into application_status_history
  └─ SET submitted_at = NOW()
  ↓
TRIGGER 2: fn_notify_on_application_status_change()
  ├─ Fetch customer details
  └─ INSERT into notifications (with SMS message)
  ↓
TRIGGER 8: fn_audit_status_history()
  └─ INSERT into audit_logs
  ↓
Result: 3 related tables updated automatically ✓
```

---

### **Scenario 2: KYC Verification Completed**
```
API Call: PUT /api/kyc-verifications/5
  ↓
Node.js: UPDATE kyc_verifications SET verification_status = 'verified'
  ↓
TRIGGER 6: fn_update_customer_kyc_status()
  ├─ Check if all mandatory KYC steps are verified
  └─ UPDATE customers SET kyc_status = 'verified'
  ↓
TRIGGER 7: fn_audit_kyc_verification()
  └─ INSERT into audit_logs
  ↓
TRIGGER 11: fn_notify_on_kyc_verified()
  └─ INSERT into notifications (SMS to customer)
  ↓
Result: Customer KYC status auto-updated + notifications sent ✓
```

---

### **Scenario 3: Document Upload**
```
API Call: POST /api/documents
  ↓
Node.js: INSERT into documents (application_id = 1, ...)
  ↓
TRIGGER 4: fn_validate_document_application()
  ├─ Verify application_id exists
  ├─ Verify document_requirement matches category/subcategory
  └─ REJECT if invalid (transaction rolls back)
  ↓
TRIGGER 9: fn_audit_document_upload()
  └─ INSERT into audit_logs
  ↓
Result: Safe insertion with automatic validation & audit ✓
```

---

## Benefits

| Benefit | Impact |
|---------|--------|
| **Data Consistency** | No orphaned records; all relationships maintained |
| **Automation** | No need for manual logging or status updates |
| **Compliance** | Complete audit trail for regulatory requirements |
| **Notifications** | Customers automatically notified of status changes |
| **Error Prevention** | Invalid data rejected at database level (hard validation) |
| **Real-time** | All side effects happen instantly, not in background jobs |
| **No Code Duplication** | Logic centralized in database, not duplicated in controllers |

---

## Testing the Triggers

### **Test 1: Application Status Change Cascade**
```sql
-- Create test customer
INSERT INTO customers (first_name, last_name, mobile_number) 
VALUES ('Test', 'Customer', '9999999999');

-- Create test application
INSERT INTO loan_applications (application_number, customer_id, product_id, 
  loan_category_id, requested_amount)
VALUES ('APP-TEST-001', 1, 1, 1, 100000);

-- Update status (triggers cascade)
UPDATE loan_applications 
SET application_status = 'submitted' 
WHERE application_number = 'APP-TEST-001';

-- Verify cascading effects
SELECT * FROM application_status_history 
WHERE application_id = (SELECT id FROM loan_applications WHERE application_number = 'APP-TEST-001');
-- Should show: from_status='draft', to_status='submitted'

SELECT * FROM notifications 
WHERE application_id = (SELECT id FROM loan_applications WHERE application_number = 'APP-TEST-001');
-- Should show: notification created with SMS message

SELECT * FROM audit_logs 
WHERE entity_id = (SELECT id FROM application_status_history LIMIT 1) AND entity_type = 'application_status_history';
-- Should show: audit log created
```

### **Test 2: KYC Completion Cascade**
```sql
-- Verify customer KYC status BEFORE
SELECT kyc_status FROM customers WHERE id = 1;
-- Result: 'pending'

-- Mark all mandatory KYC steps as verified
UPDATE kyc_verifications 
SET verification_status = 'verified', verification_date = NOW()
WHERE customer_id = 1 AND kyc_step_id IN (
  SELECT id FROM kyc_steps WHERE is_mandatory = true
);

-- Verify customer KYC status AFTER
SELECT kyc_status, kyc_completed_at FROM customers WHERE id = 1;
-- Result: 'verified', kyc_completed_at = NOW()

-- Check notification was created
SELECT * FROM notifications 
WHERE customer_id = 1 AND message_body LIKE '%KYC%';
```

### **Test 3: Document Validation**
```sql
-- Try to insert document with invalid application_id (should FAIL)
INSERT INTO documents (application_id, document_type) 
VALUES (99999, 'pdf');
-- Error: Application ID 99999 does not exist

-- Insert document with valid application_id (should SUCCEED)
INSERT INTO documents (application_id, document_type) 
VALUES (1, 'pdf');
-- Success: Document created + audit log created
```

---

## Important Notes

1. **Triggers are Database-Level**: All logic runs in PostgreSQL, not in Node.js
2. **Automatic & Immediate**: No delay; all side effects happen instantly
3. **Error Handling**: Some triggers reject invalid data (Trigger 4), others warn (Trigger 5)
4. **No Backend Changes Needed**: Node.js controllers remain simple; triggers handle complexity
5. **Audit Trail**: Complete history of all changes for compliance

---

## Future Enhancements

- Add automatic EMI schedule generation trigger
- Add automatic eligibility check trigger
- Add automatic interest calculation trigger
- Add rate-limiting on notification triggers to prevent spam
- Add email notification triggers in addition to SMS

