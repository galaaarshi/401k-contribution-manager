# 401(k) Contribution Management Application

A full-stack web application for managing 401(k) retirement plan contributions with an intuitive interface and real-time savings projections.

## 🎯 Features

- **Flexible Contribution Types**: Choose between fixed dollar amount or percentage-based contributions
- **Interactive UI**: Intuitive sliders and inputs for adjusting contribution rates
- **Real-time Projections**: See how your contributions impact retirement savings at age 65
- **YTD Tracking**: View year-to-date contribution totals
- **Persistent Storage**: Backend API stores and retrieves user preferences
- **Responsive Design**: Beautiful, modern interface that works on all devices

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 with Hooks, Recharts for visualizations, Lucide React for icons
- **Backend**: Node.js with Express
- **Database**: In-memory storage (easily extensible to PostgreSQL/MongoDB)
- **Styling**: Tailwind CSS

### High-Level Design
```
┌─────────────┐         HTTP/REST        ┌─────────────┐
│   React     │ ◄─────────────────────►  │   Express   │
│   Frontend  │      JSON Data           │   Backend   │
│             │                          │             │
└─────────────┘                          └──────┬──────┘
                                                │
                                                ▼
                                         ┌─────────────┐
                                         │  In-Memory  │
                                         │   Storage   │
                                         └─────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm installed
- Git (for cloning)

### Installation & Running

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd 401k-contribution-app
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```
   Backend will run on `http://localhost:3001`

4. **Start the frontend (in a new terminal)**
   ```bash
   cd frontend
   npm start
   ```
   Frontend will open automatically at `http://localhost:3000`

## 📁 Project Structure

```
401k-contribution-app/
├── backend/
│   ├── server.js              # Express server and API routes
│   ├── package.json           # Backend dependencies
│   └── README.md              # Backend documentation
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main React component
│   │   ├── index.js          # React entry point
│   │   └── index.css         # Global styles
│   ├── public/
│   │   └── index.html        # HTML template
│   ├── package.json          # Frontend dependencies
│   └── README.md             # Frontend documentation
└── README.md                 # This file
```

## 🔧 API Endpoints

### GET `/api/contribution`
Retrieves the current contribution settings for a user.

**Response:**
```json
{
  "userId": "user123",
  "contributionType": "percentage",
  "contributionValue": 6,
  "annualSalary": 75000,
  "ytdContributions": 3750,
  "currentAge": 30,
  "retirementAge": 65
}
```

### POST `/api/contribution`
Updates the contribution settings.

**Request Body:**
```json
{
  "userId": "user123",
  "contributionType": "percentage",
  "contributionValue": 8
}
```

## 💡 Key Calculations

### Retirement Projection Formula
```javascript
Future Value = Present Value × (1 + annual_return)^years
              + Monthly Contribution × [((1 + monthly_return)^months - 1) / monthly_return]
```

**Assumptions:**
- 7% annual return (historical S&P 500 average)
- Monthly compounding
- 26 pay periods per year (bi-weekly)

## 🎨 Design Decisions

1. **React with Hooks**: Modern, functional approach for better code organization
2. **Tailwind CSS**: Utility-first CSS for rapid, consistent UI development
3. **Recharts**: Lightweight, declarative charts for retirement projections
4. **Express**: Minimal, flexible backend framework
5. **In-memory Storage**: Simple for demo; production would use PostgreSQL

### Additional Features (future scope)
- Feature1: AI-Powered Contribution Optimizer
- Feature2: Family Financial Planning Mode
- Feature3: Redis Caching Layer for Performance

## 🧪 Testing

```bash
# Backend tests (when implemented)
cd backend
npm test

# Frontend tests (when implemented)
cd frontend
npm test
```

## 🐛 Troubleshooting

**Port already in use?**
```bash
# Kill process on port 3001 (backend)
lsof -ti:3001 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

Aarshi Gala

---

