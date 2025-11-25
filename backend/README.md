# 401(k) Backend API

Express.js REST API for managing 401(k) contribution settings.

## Installation

```bash
npm install
```

## Running

```bash
npm start
```

Server runs on `http://localhost:3001`

## API Endpoints

### GET `/api/health`
Health check endpoint.

### GET `/api/contribution?userId=user123`
Get contribution settings for a user.

### POST `/api/contribution`
Update contribution settings.

**Request body:**
```json
{
  "userId": "user123",
  "contributionType": "percentage",
  "contributionValue": 8
}
```

### POST `/api/calculate-projection`
Calculate retirement projection.

**Request body:**
```json
{
  "currentAge": 30,
  "retirementAge": 65,
  "annualSalary": 75000,
  "contributionType": "percentage",
  "contributionValue": 6,
  "currentBalance": 0,
  "annualReturn": 0.07
}
```

## Environment Variables

- `PORT`: Server port (default: 3001)

## Data Storage

Currently uses in-memory storage. In production, this would be replaced with:
- PostgreSQL for relational data
- Redis for caching
- Or MongoDB for document storage
