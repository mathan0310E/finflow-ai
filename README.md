# FinFlow AI Enterprise

**AI-Powered Enterprise Expense Management Platform**

A production-ready, multi-tenant SaaS platform for managing company expenses with AI-powered automation, intelligent insights, and beautiful UX.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28)

## ✨ Features

### 🏢 Multi-Tenant Architecture
- Company-level data isolation
- Role-based access control (5 roles)
- Department management
- Employee directory

### 💰 Expense Management
- Create, track, and manage expenses
- Receipt upload with drag-and-drop
- OCR receipt scanning (Tesseract.js)
- AI-powered expense categorization
- Multi-level approval workflow
- Policy violation detection

### 🤖 AI-Powered Intelligence
- AI Chat Assistant (OpenRouter)
- Automatic expense categorization
- Spending insights and recommendations
- Financial health scoring
- Expense prediction
- Monthly spending summaries
- Duplicate detection

### 📊 Analytics & Reports
- Role-specific dashboards
- Interactive charts (Recharts)
- Budget tracking and forecasting
- PDF/Excel/CSV report export
- Department and employee comparison
- Vendor analysis

### 🎨 Premium Design
- Glassmorphism UI with micro-interactions
- Dark/Light mode
- Responsive design (mobile-first)
- Command palette (Ctrl+K)
- Animated page transitions
- Accessible (WCAG AA)

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui + Radix Primitives
- **State**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js + Express.js
- **Language**: TypeScript
- **Auth**: Firebase Authentication
- **Database**: Cloud Firestore
- **AI**: OpenRouter API (GPT-3.5-turbo)
- **OCR**: Tesseract.js
- **Storage**: Cloudinary Free

### DevOps
- **Frontend Hosting**: Vercel Free
- **Backend Hosting**: Render Free
- **CI/CD**: GitHub Actions
- **Version Control**: GitHub

## 📁 Project Structure

```
finflow-ai/
├── client/                    # Next.js 15 frontend
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   ├── components/       # UI & layout components
│   │   ├── features/         # Feature-based modules
│   │   │   ├── auth/         # Authentication
│   │   │   ├── expenses/     # Expense management
│   │   │   ├── approvals/    # Approval workflow
│   │   │   ├── dashboard/    # Role-specific dashboards
│   │   │   ├── reports/      # Reports & analytics
│   │   │   ├── ai/           # AI features
│   │   │   ├── admin/        # Super admin panel
│   │   │   ├── company/      # Company management
│   │   │   ├── notifications/ # Notifications
│   │   │   └── settings/     # Settings
│   │   ├── hooks/            # Shared hooks
│   │   ├── stores/           # Zustand stores
│   │   ├── types/            # TypeScript types
│   │   ├── constants/        # Constants
│   │   └── utils/            # Utilities
│   └── package.json
├── server/                    # Express.js backend
│   ├── src/
│   │   ├── routes/           # API routes
│   │   ├── middleware/        # Auth, RBAC, validation
│   │   ├── services/         # Business logic
│   │   ├── config/           # Configuration
│   │   ├── types/            # Shared types
│   │   └── utils/            # Utilities
│   └── package.json
├── shared/                    # Shared types (future)
├── firestore.rules            # Security rules
├── storage.rules              # Storage rules
├── firestore.indexes.json     # Firestore indexes
├── ARCHITECTURE.md            # Architecture docs
├── FIRESTORE_SCHEMA.md        # Database schema
├── API.md                     # API documentation
├── SECURITY.md                # Security documentation
└── COMPONENTS.md              # Design system docs
```

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- Firebase account (free tier)
- OpenRouter API key (free)
- Cloudinary account (free)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/finflow-ai.git
cd finflow-ai

# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

### 2. Configure Environment

```bash
# Server environment
cp server/.env.example server/.env
# Edit server/.env with your credentials

# Client environment
cp client/.env.example client/.env.local
# Edit client/.env.local with your credentials
```

### 3. Run Development

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

### 4. Open Browser
Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

- [Architecture](ARCHITECTURE.md) - System architecture overview
- [API Reference](API.md) - Complete API documentation
- [Firestore Schema](FIRESTORE_SCHEMA.md) - Database schema design
- [Security](SECURITY.md) - Security architecture and measures
- [Components](COMPONENTS.md) - Design system components
- [API.md](API.md) - REST API endpoints

## 🔒 Security

FinFlow AI implements comprehensive security measures:

- **Authentication**: Firebase Authentication with JWT
- **Authorization**: Role-based access control (5 roles)
- **Data Isolation**: Firestore Security Rules per company
- **API Security**: CSRF, rate limiting, request validation
- **XSS Prevention**: Input sanitization on all endpoints
- **Audit Logging**: All operations logged
- **OWASP Top 10**: All categories addressed

See [SECURITY.md](SECURITY.md) for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Firebase](https://firebase.google.com)
- [OpenRouter](https://openrouter.ai)
- [Tesseract.js](https://tesseract.projectnatal.me)
- [Framer Motion](https://www.framer.com/motion)
- [Recharts](https://recharts.org)
