# Fintech Dashboard

A modern, responsive fintech dashboard built with React, Vite, and Recharts. This dashboard provides a comprehensive view of financial metrics, transactions, portfolio allocation, and quick actions for financial management.

## Features

### 📊 Financial Overview
- **Real-time Metrics**: Display total balance, revenue, expenses, and net profit
- **Trend Indicators**: Visual indicators showing percentage changes from previous periods
- **Color-coded Cards**: Different colored cards for easy identification of metrics

### 📈 Data Visualization
- **Revenue vs Expenses Chart**: Area chart showing monthly revenue and expense trends
- **Portfolio Allocation**: Interactive pie chart displaying asset distribution across:
  - Stocks
  - Bonds
  - Cryptocurrency
  - Cash

### 💳 Transaction Management
- **Recent Transactions List**: Shows the 8 most recent transactions with:
  - Transaction type (income/expense)
  - Description and category
  - Amount and date
  - Visual indicators (green for income, red for expenses)

### ⚡ Quick Actions
Four convenient action buttons for common tasks:
- Send Money
- Request Payment
- Add Card
- View Reports

### 📱 Account Summary
Quick view of:
- Available Balance
- Pending Transactions
- Credit Available

### 🌓 Dark Mode
Toggle between light and dark themes for comfortable viewing in any environment.

### 📱 Responsive Design
Fully responsive layout that works seamlessly on:
- Desktop computers
- Tablets
- Mobile phones

## Technology Stack

- **React 19**: Modern UI library for building component-based interfaces
- **Vite**: Next-generation frontend build tool for fast development
- **Recharts**: Composable charting library for React
- **Lucide React**: Beautiful & consistent icon set
- **CSS3**: Custom styling with modern features

## Installation

1. Navigate to the fintech-dashboard directory:
```bash
cd fintech-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit:
```
http://localhost:3000
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Project Structure

```
fintech-dashboard/
├── src/
│   ├── App.jsx          # Main application component
│   ├── App.css          # Application styles
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
└── package.json         # Project dependencies
```

## Features Breakdown

### Dashboard Cards
The dashboard displays four key metric cards:

1. **Total Balance Card** (Purple gradient)
   - Shows current total balance
   - Displays positive growth trend

2. **Total Revenue Card** (Green gradient)
   - Shows accumulated revenue
   - Indicates revenue growth percentage

3. **Total Expenses Card** (Orange/Red gradient)
   - Shows total expenses
   - Tracks expense increases

4. **Net Profit Card** (Blue gradient)
   - Calculates and displays profit (revenue - expenses)
   - Shows profit margin growth

### Charts

#### Revenue vs Expenses Chart
- Interactive area chart
- Shows 6-month trend
- Hover to see exact values
- Color-coded areas for easy comparison

#### Portfolio Allocation Chart
- Interactive pie chart
- Visual breakdown of investment portfolio
- Percentage labels on each segment
- Tooltip with exact values

### Transaction List
- Chronologically ordered transactions
- Color-coded amounts (green for income, red for expenses)
- Category tags for easy filtering
- Hover effects for better UX

## Customization

### Changing Colors
Edit the CSS variables in `src/App.css` to match your brand:

```css
/* Primary gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Card gradients */
.card-primary::before {
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
}
```

### Adding New Metrics
To add new dashboard cards, modify the `cards-grid` section in `src/App.jsx`:

```jsx
<div className="card card-custom">
  <div className="card-header">
    <div className="card-icon">
      <YourIcon size={24} />
    </div>
    <span className="card-label">Your Metric</span>
  </div>
  <h2 className="card-value">$XX,XXX</h2>
  <div className="card-footer positive">
    <TrendingUp size={16} />
    <span>+X% from last month</span>
  </div>
</div>
```

### Updating Transaction Data
Modify the `transactions` array in `src/App.jsx` to use real data from your API:

```jsx
const transactions = [
  { 
    id: 1, 
    type: 'income', 
    description: 'Payment received', 
    amount: 1500, 
    date: '2024-02-15', 
    category: 'Income' 
  },
  // ... more transactions
];
```

## Future Enhancements

Potential features to add:
- User authentication
- Real-time data updates via API
- Export to PDF/Excel
- Customizable date ranges
- Budget tracking
- Bill reminders
- Multi-currency support
- Investment performance tracking
- Tax calculation tools
- Integration with banking APIs

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

ISC

## Contributing

Feel free to submit issues and enhancement requests!
