# 401(k) Frontend

React-based user interface for managing 401(k) contributions.

## Features

- **Interactive contribution settings** with percentage or fixed amount options
- **Real-time retirement projections** with visual charts
- **Year-to-date tracking** of contributions
- **Responsive design** that works on all devices
- **Intuitive sliders** for easy adjustment

## Installation

```bash
npm install
```

## Running

```bash
npm start
```

Application will open at `http://localhost:3000`

## Tech Stack

- **React 18** with Hooks
- **Recharts** for data visualization
- **Lucide React** for icons
- **Custom CSS** with modern design

## Architecture

The app follows a component-based architecture:

```
App.jsx (Main Component)
├── State Management (useState, useEffect)
├── API Integration (fetch)
├── Contribution Settings UI
├── Retirement Projection Chart
└── Summary Statistics
```

## API Integration

The frontend communicates with the backend via:
- `GET /api/contribution` - Fetch user data
- `POST /api/contribution` - Save contribution settings
- `POST /api/calculate-projection` - Get retirement projections

## Key Calculations

### Paycheck Contribution
- Percentage: `(annual_salary / 26) * (percentage / 100)`
- Fixed: User-specified amount

### Annual Contribution
- Percentage: `annual_salary * (percentage / 100)`
- Fixed: `fixed_amount * 26`

### Retirement Projection
Uses compound interest formula with monthly contributions.

## Customization

To modify assumptions:
- Annual return rate: Edit `annualReturn` in `calculateProjection`
- Retirement age: Stored in user data from backend
- Pay periods: Currently set to 26 (biweekly)
