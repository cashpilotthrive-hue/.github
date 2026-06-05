import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight,
  Send,
  Download,
  Bell,
  Settings,
  PieChart,
  BarChart3,
  Wallet
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import './App.css';

const App = () => {
  const [darkMode, setDarkMode] = useState(false);

  // Sample data for charts
  const revenueData = [
    { month: 'Jan', revenue: 4200, expenses: 2400 },
    { month: 'Feb', revenue: 5100, expenses: 2800 },
    { month: 'Mar', revenue: 4800, expenses: 2600 },
    { month: 'Apr', revenue: 6200, expenses: 3200 },
    { month: 'May', revenue: 7100, expenses: 3500 },
    { month: 'Jun', revenue: 8300, expenses: 3900 },
  ];

  const portfolioData = [
    { name: 'Stocks', value: 45000, color: '#6366f1' },
    { name: 'Bonds', value: 28000, color: '#8b5cf6' },
    { name: 'Crypto', value: 15000, color: '#ec4899' },
    { name: 'Cash', value: 12000, color: '#14b8a6' },
  ];

  const transactions = [
    { id: 1, type: 'income', description: 'Salary Deposit', amount: 5500, date: '2024-02-15', category: 'Income' },
    { id: 2, type: 'expense', description: 'Rent Payment', amount: -1500, date: '2024-02-14', category: 'Housing' },
    { id: 3, type: 'income', description: 'Freelance Project', amount: 2200, date: '2024-02-13', category: 'Income' },
    { id: 4, type: 'expense', description: 'Grocery Shopping', amount: -350, date: '2024-02-12', category: 'Food' },
    { id: 5, type: 'expense', description: 'Utilities', amount: -180, date: '2024-02-11', category: 'Bills' },
    { id: 6, type: 'income', description: 'Investment Return', amount: 1200, date: '2024-02-10', category: 'Investment' },
    { id: 7, type: 'expense', description: 'Car Insurance', amount: -450, date: '2024-02-09', category: 'Insurance' },
    { id: 8, type: 'expense', description: 'Restaurant', amount: -85, date: '2024-02-08', category: 'Food' },
  ];

  const totalBalance = 100000;
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalExpenses = revenueData.reduce((sum, item) => sum + item.expenses, 0);
  const profit = totalRevenue - totalExpenses;

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <Wallet className="logo-icon" />
          <h1 className="logo">FinTech Dashboard</h1>
        </div>
        <div className="header-right">
          <button className="icon-btn">
            <Bell size={20} />
          </button>
          <button className="icon-btn">
            <Settings size={20} />
          </button>
          <button 
            className="icon-btn"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Summary Cards */}
        <div className="cards-grid">
          <div className="card card-primary">
            <div className="card-header">
              <div className="card-icon">
                <DollarSign size={24} />
              </div>
              <span className="card-label">Total Balance</span>
            </div>
            <h2 className="card-value">${totalBalance.toLocaleString()}</h2>
            <div className="card-footer positive">
              <TrendingUp size={16} />
              <span>+12.5% from last month</span>
            </div>
          </div>

          <div className="card card-success">
            <div className="card-header">
              <div className="card-icon">
                <TrendingUp size={24} />
              </div>
              <span className="card-label">Total Revenue</span>
            </div>
            <h2 className="card-value">${totalRevenue.toLocaleString()}</h2>
            <div className="card-footer positive">
              <ArrowUpRight size={16} />
              <span>+8.2% from last month</span>
            </div>
          </div>

          <div className="card card-warning">
            <div className="card-header">
              <div className="card-icon">
                <TrendingDown size={24} />
              </div>
              <span className="card-label">Total Expenses</span>
            </div>
            <h2 className="card-value">${totalExpenses.toLocaleString()}</h2>
            <div className="card-footer negative">
              <ArrowDownRight size={16} />
              <span>+3.1% from last month</span>
            </div>
          </div>

          <div className="card card-info">
            <div className="card-header">
              <div className="card-icon">
                <BarChart3 size={24} />
              </div>
              <span className="card-label">Net Profit</span>
            </div>
            <h2 className="card-value">${profit.toLocaleString()}</h2>
            <div className="card-footer positive">
              <TrendingUp size={16} />
              <span>+15.3% from last month</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          <div className="chart-card">
            <h3 className="chart-title">Revenue vs Expenses</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stackId="1"
                  stroke="#6366f1" 
                  fill="#6366f1" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stackId="2"
                  stroke="#ec4899" 
                  fill="#ec4899" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3 className="chart-title">Portfolio Allocation</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={portfolioData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {portfolioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transactions and Quick Actions */}
        <div className="bottom-grid">
          <div className="transactions-card">
            <h3 className="section-title">Recent Transactions</h3>
            <div className="transactions-list">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-icon">
                    {transaction.type === 'income' ? (
                      <ArrowDownRight className="income-icon" size={20} />
                    ) : (
                      <ArrowUpRight className="expense-icon" size={20} />
                    )}
                  </div>
                  <div className="transaction-details">
                    <div className="transaction-description">{transaction.description}</div>
                    <div className="transaction-meta">
                      <span className="transaction-category">{transaction.category}</span>
                      <span className="transaction-date">{transaction.date}</span>
                    </div>
                  </div>
                  <div className={`transaction-amount ${transaction.type}`}>
                    {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="actions-card">
            <h3 className="section-title">Quick Actions</h3>
            <div className="actions-grid">
              <button className="action-btn action-primary">
                <Send size={24} />
                <span>Send Money</span>
              </button>
              <button className="action-btn action-secondary">
                <Download size={24} />
                <span>Request Payment</span>
              </button>
              <button className="action-btn action-tertiary">
                <CreditCard size={24} />
                <span>Add Card</span>
              </button>
              <button className="action-btn action-quaternary">
                <PieChart size={24} />
                <span>View Reports</span>
              </button>
            </div>

            <div className="account-summary">
              <h4 className="account-title">Account Summary</h4>
              <div className="account-item">
                <span>Available Balance</span>
                <span className="account-value">${totalBalance.toLocaleString()}</span>
              </div>
              <div className="account-item">
                <span>Pending Transactions</span>
                <span className="account-value">3</span>
              </div>
              <div className="account-item">
                <span>Credit Available</span>
                <span className="account-value">$25,000</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
