import React, { useState, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { DollarSign, Percent, TrendingUp, Calendar, PiggyBank, AlertCircle, CheckCircle } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  // State management
  const [contributionType, setContributionType] = useState('percentage');
  const [contributionValue, setContributionValue] = useState(6);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [projection, setProjection] = useState(null);

  // Fetch initial data
  useEffect(() => {
    fetchUserData();
  }, []);

  // Calculate projection when contribution changes
  useEffect(() => {
    if (userData) {
      calculateProjection();
    }
  }, [contributionType, contributionValue, userData]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/contribution?userId=user123`);
      if (!response.ok) throw new Error('Failed to fetch user data');
      
      const data = await response.json();
      setUserData(data);
      setContributionType(data.contributionType);
      setContributionValue(data.contributionValue);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setSaveMessage({ type: 'error', text: 'Failed to load user data' });
    } finally {
      setLoading(false);
    }
  };

  const calculateProjection = async () => {
    if (!userData) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/calculate-projection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentAge: userData.currentAge,
          retirementAge: userData.retirementAge,
          annualSalary: userData.annualSalary,
          contributionType,
          contributionValue,
          currentBalance: 0,
          annualReturn: 0.07
        })
      });

      if (!response.ok) throw new Error('Failed to calculate projection');
      
      const data = await response.json();
      setProjection(data.projection);
    } catch (error) {
      console.error('Error calculating projection:', error);
    }
  };

  const handleSaveContribution = async () => {
    setSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/contribution`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user123',
          contributionType,
          contributionValue
        })
      });

      if (!response.ok) throw new Error('Failed to save contribution');
      
      const data = await response.json();
      setUserData(data.data);
      setSaveMessage({ 
        type: 'success', 
        text: 'Contribution settings saved successfully!' 
      });

      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error saving contribution:', error);
      setSaveMessage({ 
        type: 'error', 
        text: 'Failed to save contribution settings' 
      });
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getPaycheckContribution = () => {
    if (!userData) return 0;
    
    if (contributionType === 'percentage') {
      // 26 pay periods per year (biweekly)
      return (userData.annualSalary / 26) * (contributionValue / 100);
    } else {
      return contributionValue;
    }
  };

  const getAnnualContribution = () => {
    if (!userData) return 0;
    
    if (contributionType === 'percentage') {
      return userData.annualSalary * (contributionValue / 100);
    } else {
      return contributionValue * 26; // 26 pay periods
    }
  };

  const generateProjectionChart = () => {
    if (!userData || !projection) return [];
    
    const data = [];
    const yearsToRetirement = userData.retirementAge - userData.currentAge;
    const annualContribution = getAnnualContribution();
    const annualReturn = 0.07;
    
    let balance = 0;
    
    for (let year = 0; year <= yearsToRetirement; year++) {
      if (year > 0) {
        balance = balance * (1 + annualReturn) + annualContribution;
      }
      
      data.push({
        age: userData.currentAge + year,
        balance: Math.round(balance),
        contributions: Math.round(annualContribution * year)
      });
    }
    
    return data;
  };

  const hasChanges = () => {
    if (!userData) return false;
    return contributionType !== userData.contributionType || 
           contributionValue !== userData.contributionValue;
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <div style={{ color: 'white', fontSize: '24px' }}>Loading...</div>
      </div>
    );
  }

  const chartData = generateProjectionChart();

  return (
    <div className="container">
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px', color: 'white' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '8px' }}>
          401(k) Contribution Manager
        </h1>
        <p style={{ fontSize: '18px', opacity: '0.9' }}>
          Plan your retirement with confidence
        </p>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`alert ${saveMessage.type === 'success' ? 'alert-success' : 'alert-warning'} animate-in`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {saveMessage.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{saveMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* YTD Contributions */}
        <div className="stat-card animate-in">
          <div className="stat-label">Year-to-Date Contributions</div>
          <div className="stat-value">{formatCurrency(userData?.ytdContributions || 0)}</div>
          <div style={{ marginTop: '8px', fontSize: '14px', opacity: '0.9' }}>
            As of {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        {/* Annual Salary */}
        <div className="stat-card animate-in" style={{ animationDelay: '0.1s' }}>
          <div className="stat-label">Annual Salary</div>
          <div className="stat-value">{formatCurrency(userData?.annualSalary || 0)}</div>
          <div style={{ marginTop: '8px', fontSize: '14px', opacity: '0.9' }}>
            Per paycheck: {formatCurrency((userData?.annualSalary || 0) / 26)}
          </div>
        </div>
      </div>

      {/* Contribution Settings Card */}
      <div className="card animate-in" style={{ animationDelay: '0.2s' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PiggyBank size={28} color="#667eea" />
          Contribution Settings
        </h2>

        {/* Contribution Type Toggle */}
        <div className="input-group">
          <label className="label">Contribution Type</label>
          <div className="toggle-group">
            <button
              className={`toggle-button ${contributionType === 'percentage' ? 'active' : ''}`}
              onClick={() => setContributionType('percentage')}
            >
              <Percent size={16} style={{ display: 'inline', marginRight: '6px' }} />
              Percentage of Salary
            </button>
            <button
              className={`toggle-button ${contributionType === 'fixed' ? 'active' : ''}`}
              onClick={() => setContributionType('fixed')}
            >
              <DollarSign size={16} style={{ display: 'inline', marginRight: '6px' }} />
              Fixed Amount per Paycheck
            </button>
          </div>
        </div>

        {/* Contribution Value Input */}
        <div className="input-group">
          <label className="label">
            {contributionType === 'percentage' ? 'Contribution Percentage' : 'Amount per Paycheck'}
          </label>
          
          <input
            type="range"
            className="slider"
            min={contributionType === 'percentage' ? 0 : 0}
            max={contributionType === 'percentage' ? 20 : 1000}
            step={contributionType === 'percentage' ? 0.5 : 25}
            value={contributionValue}
            onChange={(e) => setContributionValue(parseFloat(e.target.value))}
          />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', alignItems: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#667eea' }}>
              {contributionType === 'percentage' ? `${contributionValue}%` : formatCurrency(contributionValue)}
            </div>
            <input
              type="number"
              className="input"
              style={{ width: '120px', textAlign: 'right' }}
              value={contributionValue}
              onChange={(e) => setContributionValue(parseFloat(e.target.value) || 0)}
              step={contributionType === 'percentage' ? 0.5 : 25}
            />
          </div>
        </div>

        {/* Impact Summary */}
        <div style={{ 
          background: '#f7fafc', 
          borderRadius: '12px', 
          padding: '20px', 
          marginTop: '20px',
          border: '2px solid #e2e8f0'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#2d3748' }}>
            Contribution Impact
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>Per Paycheck</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#2d3748' }}>
                {formatCurrency(getPaycheckContribution())}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>Annual Total</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#2d3748' }}>
                {formatCurrency(getAnnualContribution())}
              </div>
            </div>
          </div>
        </div>

        {/* IRS Limit Warning */}
        {getAnnualContribution() > 23000 && (
          <div className="alert alert-warning" style={{ marginTop: '16px' }}>
            <AlertCircle size={20} style={{ display: 'inline', marginRight: '8px' }} />
            Your annual contribution exceeds the 2024 IRS limit of $23,000
          </div>
        )}

        {/* Save Button */}
        <button
          className="button"
          style={{ 
            width: '100%', 
            marginTop: '24px',
            opacity: hasChanges() ? 1 : 0.5
          }}
          onClick={handleSaveContribution}
          disabled={saving || !hasChanges()}
        >
          {saving ? 'Saving...' : hasChanges() ? 'Save Changes' : 'No Changes to Save'}
        </button>
      </div>

      {/* Retirement Projection Card */}
      {projection && (
        <div className="card animate-in" style={{ animationDelay: '0.3s' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={28} color="#667eea" />
            Retirement Projection
          </h2>

          {/* Key Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: '#f7fafc', borderRadius: '12px', padding: '20px', border: '2px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>
                <Calendar size={16} style={{ display: 'inline', marginRight: '4px' }} />
                At Age {userData.retirementAge}
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#48bb78' }}>
                {formatCurrency(projection.totalAtRetirement)}
              </div>
            </div>
            
            <div style={{ background: '#f7fafc', borderRadius: '12px', padding: '20px', border: '2px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>Total Contributions</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#667eea' }}>
                {formatCurrency(projection.totalContributions)}
              </div>
            </div>
            
            <div style={{ background: '#f7fafc', borderRadius: '12px', padding: '20px', border: '2px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>Investment Gains</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#ed8936' }}>
                {formatCurrency(projection.investmentGains)}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div style={{ marginTop: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#2d3748' }}>
              Growth Over Time (Assuming 7% Annual Return)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorContributions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#48bb78" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#48bb78" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="age" 
                  label={{ value: 'Age', position: 'insideBottom', offset: -5 }}
                  stroke="#718096"
                />
                <YAxis 
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  stroke="#718096"
                />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="contributions" 
                  stroke="#48bb78" 
                  fillOpacity={1} 
                  fill="url(#colorContributions)"
                  name="Your Contributions"
                />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#667eea" 
                  fillOpacity={1} 
                  fill="url(#colorBalance)"
                  name="Total Balance"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Assumptions */}
          <div className="alert alert-info" style={{ marginTop: '24px' }}>
            <AlertCircle size={16} style={{ display: 'inline', marginRight: '8px' }} />
            This projection assumes a 7% annual return and {userData.retirementAge - userData.currentAge} years until retirement.
            Actual returns may vary. This is for illustrative purposes only.
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', color: 'white', marginTop: '48px', paddingBottom: '24px', opacity: '0.8' }}>
        <p>Built with React, Express, and Recharts</p>
        <p style={{ fontSize: '14px', marginTop: '8px' }}>
          © 2024 401(k) Contribution Manager
        </p>
      </div>
    </div>
  );
}

export default App;
