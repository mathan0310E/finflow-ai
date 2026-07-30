# FinFlow AI - API Documentation

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://finflow-api.onrender.com/api`

## Authentication
All API requests require a Bearer token from Firebase Auth:
```
Authorization: Bearer <firebase-id-token>
```

## Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/register | Register new user + company |
| POST | /auth/login | Login (handled by Firebase) |
| POST | /auth/verify | Verify token |

### Companies
| Method | Path | Description |
|--------|------|-------------|
| GET | /companies | List companies (super admin) |
| GET | /companies/:id | Get company details |
| PUT | /companies/:id | Update company |
| DELETE | /companies/:id | Delete company |
| GET | /companies/:id/stats | Company statistics |

### Users
| Method | Path | Description |
|--------|------|-------------|
| GET | /users | List users (company scoped) |
| GET | /users/:id | Get user |
| PUT | /users/:id | Update user |
| DELETE | /users/:id | Delete user |
| POST | /users/invite | Invite employee |

### Departments
| Method | Path | Description |
|--------|------|-------------|
| GET | /departments | List departments |
| POST | /departments | Create department |
| PUT | /departments/:id | Update department |
| DELETE | /departments/:id | Delete department |

### Expenses
| Method | Path | Description |
|--------|------|-------------|
| GET | /expenses | List expenses (filtered by role) |
| POST | /expenses | Create expense |
| GET | /expenses/:id | Get expense |
| PUT | /expenses/:id | Update expense |
| DELETE | /expenses/:id | Delete expense |
| POST | /expenses/:id/receipt | Upload receipt |
| POST | /expenses/:id/approve | Approve expense |
| POST | /expenses/:id/reject | Reject expense |
| POST | /expenses/:id/request-changes | Request changes |
| POST | /expenses/ocr | OCR scan receipt |

### Budgets
| Method | Path | Description |
|--------|------|-------------|
| GET | /budgets | List budgets |
| POST | /budgets | Create budget |
| PUT | /budgets/:id | Update budget |
| GET | /budgets/:id/stats | Budget utilization |

### AI
| Method | Path | Description |
|--------|------|-------------|
| POST | /ai/chat | Chat with AI assistant |
| POST | /ai/categorize | Categorize expense |
| POST | /ai/insights | Get spending insights |
| POST | /ai/predict | Predict future expenses |
| POST | /ai/health-score | Financial health score |
| POST | /ai/summary | Monthly summary |

### Reports
| Method | Path | Description |
|--------|------|-------------|
| POST | /reports/generate | Generate report |
| GET | /reports/:id | Download report |
| GET | /reports/:id/excel | Export as Excel |
| GET | /reports/:id/pdf | Export as PDF |

### Notifications
| Method | Path | Description |
|--------|------|-------------|
| GET | /notifications | List notifications |
| PUT | /notifications/:id/read | Mark as read |
| PUT | /notifications/read-all | Mark all as read |

### Analytics
| Method | Path | Description |
|--------|------|-------------|
| GET | /analytics/dashboard | Dashboard data |
| GET | /analytics/department | Department analytics |
| GET | /analytics/trends | Spending trends |
| GET | /analytics/categories | Category breakdown |
