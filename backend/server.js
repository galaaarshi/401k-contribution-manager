const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory storage (would be a database in production)
let userContributions = {
  user123: {
    userId: 'user123',
    contributionType: 'percentage', // 'percentage' or 'fixed'
    contributionValue: 6, // 6% or $X per paycheck
    annualSalary: 75000,
    ytdContributions: 3750, // Mock data: 6% * 75000 * (5/12 months)
    currentAge: 30,
    retirementAge: 65,
    employerMatch: 3, // Employer matches 3%
    paycheckFrequency: 'biweekly', // biweekly = 26 pay periods per year
    lastUpdated: new Date().toISOString()
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET contribution settings
app.get('/api/contribution', (req, res) => {
  const userId = req.query.userId || 'user123';
  
  const userData = userContributions[userId];
  
  if (!userData) {
    return res.status(404).json({ 
      error: 'User not found',
      message: 'No contribution data found for this user' 
    });
  }
  
  res.json(userData);
});

// POST/PUT contribution settings
app.post('/api/contribution', (req, res) => {
  const { 
    userId = 'user123', 
    contributionType, 
    contributionValue,
    annualSalary,
    currentAge,
    retirementAge
  } = req.body;
  
  // Validation
  if (!contributionType || contributionValue === undefined) {
    return res.status(400).json({ 
      error: 'Invalid request',
      message: 'contributionType and contributionValue are required' 
    });
  }
  
  if (!['percentage', 'fixed'].includes(contributionType)) {
    return res.status(400).json({ 
      error: 'Invalid contribution type',
      message: 'contributionType must be "percentage" or "fixed"' 
    });
  }
  
  // Additional validation for percentage
  if (contributionType === 'percentage' && (contributionValue < 0 || contributionValue > 100)) {
    return res.status(400).json({ 
      error: 'Invalid percentage',
      message: 'Percentage must be between 0 and 100' 
    });
  }
  
  // Additional validation for fixed amount
  if (contributionType === 'fixed' && contributionValue < 0) {
    return res.status(400).json({ 
      error: 'Invalid amount',
      message: 'Fixed amount must be non-negative' 
    });
  }
  
  // Get existing user data or create new
  const existingData = userContributions[userId] || {
    userId,
    annualSalary: 75000,
    ytdContributions: 3750,
    currentAge: 30,
    retirementAge: 65,
    employerMatch: 3,
    paycheckFrequency: 'biweekly'
  };
  
  // Update the contribution settings
  const updatedData = {
    ...existingData,
    contributionType,
    contributionValue,
    ...(annualSalary && { annualSalary }),
    ...(currentAge && { currentAge }),
    ...(retirementAge && { retirementAge }),
    lastUpdated: new Date().toISOString()
  };
  
  // Save to storage
  userContributions[userId] = updatedData;
  
  console.log(`Updated contribution for ${userId}:`, updatedData);
  
  res.json({
    success: true,
    message: 'Contribution settings updated successfully',
    data: updatedData
  });
});

// GET user profile (additional endpoint for user info)
app.get('/api/user/:userId', (req, res) => {
  const { userId } = req.params;
  const userData = userContributions[userId];
  
  if (!userData) {
    return res.status(404).json({ 
      error: 'User not found' 
    });
  }
  
  res.json({
    userId: userData.userId,
    annualSalary: userData.annualSalary,
    currentAge: userData.currentAge,
    retirementAge: userData.retirementAge,
    employerMatch: userData.employerMatch,
    paycheckFrequency: userData.paycheckFrequency
  });
});

// Calculate retirement projection endpoint
app.post('/api/calculate-projection', (req, res) => {
  const {
    currentAge,
    retirementAge,
    annualSalary,
    contributionType,
    contributionValue,
    currentBalance = 0,
    annualReturn = 0.07 // 7% default
  } = req.body;
  
  if (!currentAge || !retirementAge || !annualSalary || !contributionType || contributionValue === undefined) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'currentAge, retirementAge, annualSalary, contributionType, and contributionValue are required'
    });
  }
  
  const yearsToRetirement = retirementAge - currentAge;
  const monthsToRetirement = yearsToRetirement * 12;
  const monthlyReturn = annualReturn / 12;
  
  // Calculate monthly contribution
  let monthlyContribution;
  if (contributionType === 'percentage') {
    monthlyContribution = (annualSalary * (contributionValue / 100)) / 12;
  } else {
    // Fixed per paycheck - assuming biweekly (26 paychecks)
    monthlyContribution = (contributionValue * 26) / 12;
  }
  
  // Future value calculation
  // FV = PV * (1 + r)^n + PMT * [((1 + r)^n - 1) / r]
  const futureValueOfCurrentBalance = currentBalance * Math.pow(1 + monthlyReturn, monthsToRetirement);
  const futureValueOfContributions = monthlyContribution * 
    ((Math.pow(1 + monthlyReturn, monthsToRetirement) - 1) / monthlyReturn);
  
  const totalAtRetirement = futureValueOfCurrentBalance + futureValueOfContributions;
  
  // Calculate total contributions
  const totalContributions = monthlyContribution * monthsToRetirement;
  
  res.json({
    projection: {
      totalAtRetirement: Math.round(totalAtRetirement),
      totalContributions: Math.round(totalContributions),
      investmentGains: Math.round(totalAtRetirement - totalContributions - currentBalance),
      monthlyContribution: Math.round(monthlyContribution),
      yearsToRetirement,
      assumedAnnualReturn: annualReturn * 100
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 401(k) Backend API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💰 Test endpoint: http://localhost:${PORT}/api/contribution`);
});

module.exports = app;
