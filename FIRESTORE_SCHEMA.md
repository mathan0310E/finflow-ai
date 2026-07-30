# FinFlow AI - Firestore Schema

## Collections

### companies
```json
{
  "id": "string",
  "name": "string",
  "slug": "string",
  "logo": "string (url)",
  "website": "string",
  "industry": "string",
  "size": "number",
  "currency": "string (default: USD)",
  "timezone": "string",
  "tier": "string (free|starter|business|enterprise)",
  "status": "string (active|suspended|disabled)",
  "settings": {
    "requireManagerApproval": "boolean",
    "requireFinanceApproval": "boolean",
    "requireCeoApproval": "boolean",
    "autoApprovalLimit": "number",
    "maxExpenseAmount": "number",
    "enableAi": "boolean",
    "enableOcr": "boolean"
  },
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### users
```json
{
  "id": "string (firebase uid)",
  "email": "string",
  "displayName": "string",
  "photoURL": "string",
  "companyId": "string",
  "role": "string (super_admin|ceo|finance_manager|dept_manager|employee)",
  "department": "string",
  "designation": "string",
  "employeeId": "string",
  "managerId": "string",
  "costCenter": "string",
  "joiningDate": "timestamp",
  "status": "string (active|inactive|suspended)",
  "phone": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### departments
```json
{
  "id": "string",
  "companyId": "string",
  "name": "string",
  "headId": "string (user id)",
  "budget": "number",
  "budgetSpent": "number",
  "budgetRemaining": "number",
  "headCount": "number",
  "status": "string (active|inactive)",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### expenses
```json
{
  "id": "string",
  "companyId": "string",
  "userId": "string",
  "departmentId": "string",
  "title": "string",
  "description": "string",
  "amount": "number",
  "currency": "string",
  "category": "string",
  "subCategory": "string",
  "receiptUrl": "string",
  "invoiceUrl": "string",
  "vendor": "string",
  "project": "string",
  "tags": "string[]",
  "date": "timestamp",
  "status": "string (draft|pending|manager_approved|finance_approved|ceo_approved|approved|rejected|changes_requested|reimbursed)",
  "currentApprovalLevel": "number",
  "approvalChain": [
    {
      "level": "number",
      "role": "string",
      "userId": "string",
      "action": "string (pending|approved|rejected|changes_requested)",
      "comment": "string",
      "timestamp": "timestamp"
    }
  ],
  "ocrData": {
    "storeName": "string",
    "amount": "number",
    "gst": "string",
    "invoiceNumber": "string",
    "date": "string",
    "items": "array",
    "tax": "number",
    "confidence": "number"
  },
  "aiCategory": "string",
  "aiConfidence": "number",
  "isReimbursed": "boolean",
  "reimbursedAt": "timestamp",
  "policyViolations": "string[]",
  "notes": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### budgets
```json
{
  "id": "string",
  "companyId": "string",
  "departmentId": "string",
  "fiscalYear": "string",
  "period": "string (annual|quarterly|monthly)",
  "categories": [
    {
      "name": "string",
      "allocated": "number",
      "spent": "number",
      "remaining": "number"
    }
  ],
  "totalAllocated": "number",
  "totalSpent": "number",
  "totalRemaining": "number",
  "status": "string (active|closed)",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### notifications
```json
{
  "id": "string",
  "companyId": "string",
  "userId": "string",
  "type": "string",
  "title": "string",
  "message": "string",
  "data": "object",
  "read": "boolean",
  "createdAt": "timestamp"
}
```

### vendors
```json
{
  "id": "string",
  "companyId": "string",
  "name": "string",
  "category": "string",
  "contactPerson": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "gst": "string",
  "paymentTerms": "string",
  "totalSpent": "number",
  "lastTransaction": "timestamp",
  "status": "string (active|inactive)",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### auditLogs
```json
{
  "id": "string",
  "companyId": "string",
  "userId": "string",
  "action": "string",
  "resource": "string",
  "resourceId": "string",
  "details": "object",
  "ipAddress": "string",
  "userAgent": "string",
  "createdAt": "timestamp"
}
```

### aiChats
```json
{
  "id": "string",
  "companyId": "string",
  "userId": "string",
  "messages": [
    {
      "role": "string (user|assistant)",
      "content": "string",
      "timestamp": "timestamp"
    }
  ],
  "context": "object",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## Indexes
- expenses: companyId + status + date
- expenses: companyId + userId + date
- expenses: companyId + departmentId + date
- notifications: userId + read + createdAt
- auditLogs: companyId + createdAt
