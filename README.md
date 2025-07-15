# 💰 MoneyTracker - Personal Expense Tracker

A modern, feature-rich personal finance management application built with **Next.js 15**, **TypeScript**, and **Tailwind CSS**. Track expenses, manage budgets, and gain AI-powered insights into your spending patterns with real-time analytics and beautiful visualizations.

## ✨ Features

### 🎯 **Core Functionality**
- ✅ **Transaction Management** - Add, edit, and delete income/expense transactions
- ✅ **Smart Categorization** - Organize transactions by categories (Food, Transportation, etc.)
- ✅ **Budget Tracking** - Set and monitor spending limits with visual indicators
- ✅ **Real-time Analytics** - Dynamic charts and financial insights
- ✅ **Search & Filter** - Advanced filtering by category, type, date, and amount
- ✅ **Responsive Design** - Works perfectly on desktop, tablet, and mobile

### 🤖 **AI-Powered Insights**
- 📊 **Savings Rate Analysis** - Track your monthly savings percentage
- 📈 **Spending Pattern Detection** - Identify your most expensive categories
- ⚡ **Smart Notifications** - Get alerts for budget overruns and spending trends
- 🎯 **Financial Recommendations** - Personalized tips based on your habits

### 🚀 **Advanced Performance Features**
- ⚡ **Lazy Loading** - Infinite scroll for large transaction lists
- 🎨 **Canvas Animations** - Smooth, animated charts with neon glow effects
- 🔄 **Background Processing** - Non-blocking financial calculations
- 👁️ **Visibility Detection** - Charts animate only when visible

## 🛠️ Technologies Used

### **Frontend Stack**
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - Modern UI components

### **Web APIs Integration**
- 🎨 **Canvas API** - Custom chart rendering with animations
- ⚡ **Background Tasks API** - Idle-time financial calculations
- 👁️ **Intersection Observer API** - Lazy loading and visibility detection

### **Key Features**
- 📱 **Responsive Design** - Mobile-first approach
- 🌙 **Dark Theme** - Modern dark UI design
- 🔔 **Real-time Notifications** - Smart alerts and updates
- 📊 **Interactive Charts** - Multiple chart types (bar, trend, category)

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ 
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/khajabasha7/Expense-Tracker
cd Expense-Tracker
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Run the development server**
```bash
npm run dev
# or
yarn dev
```

4. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production
```bash
npm run build
npm start
```

## 📖 Usage Guide

### 💳 **Adding Transactions**
1. Click the **floating "+" button** in the bottom-right corner
2. Select **Income** or **Expense**
3. Enter amount, category, date, and optional description
4. Click **"Add Transaction"**

### 📊 **Viewing Analytics**
- **Overview Tab**: Monthly stats and top spending categories
- **Analytics Tab**: Interactive charts (Category, Monthly, Trend)
- **Chart Controls**: Switch between different visualization types

### 🎯 **Managing Budgets**
1. Go to the **"Budgets"** tab
2. Click the **edit icon** next to any category
3. Set your monthly spending limit
4. Monitor progress with visual indicators:
   - 🟢 **Green**: On track (< 80%)
   - 🟡 **Yellow**: Warning (80-99%)
   - 🔴 **Red**: Over budget (100%+)

### 🔍 **Searching & Filtering**
- **Search Bar**: Find transactions by description or category
- **Category Filter**: Show only specific categories
- **Type Filter**: Filter by Income/Expense
- **Sort Options**: Order by date, amount, or category
- **Lazy Loading**: Automatically loads more as you scroll

### 🔔 **Smart Notifications**
The app automatically generates notifications for:
- 📈 **Budget Alerts**: When approaching or exceeding limits
- 💰 **Savings Insights**: Low/high savings rate notifications
- 📊 **Spending Patterns**: Daily spending averages
- ✅ **Transaction Updates**: Confirmations for add/delete actions

## 🎨 Chart Types

### 📊 **Category Chart**
- Bar chart showing spending by category
- Animated bars with neon glow effects
- Real-time updates when transactions change

### 📈 **Monthly Chart**
- Income vs Expenses comparison
- Side-by-side bars for each month
- Color-coded (Green for income, Red for expenses)

### 📉 **Trend Chart**
- Line chart showing balance over time
- Animated trend line with glowing points
- Helps visualize financial trajectory

## 🔧 API Reference

### **Web APIs Used**

#### Canvas API
```javascript
// Custom chart rendering
const ctx = canvas.getContext("2d")
ctx.createLinearGradient(x1, y1, x2, y2)
ctx.shadowColor = "#3B82F6"
ctx.shadowBlur = 15
```

#### Background Tasks API
```javascript
// Idle-time processing
requestIdleCallback(() => {
  calculateFinancialInsights()
}, { timeout: 5000 })
```

#### Intersection Observer API
```javascript
// Lazy loading implementation
const observer = new IntersectionObserver((entries) => {
  // Load more content when visible
}, { threshold: 0.1, rootMargin: "100px" })
```

## 📁 Project Structure

```
moneytracker/
├── app/
│   ├── page.tsx              # Main dashboard
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── expense-form.tsx      # Transaction form
│   ├── expense-chart.tsx     # Canvas-based charts
│   ├── transaction-history.tsx # Transaction list with lazy loading
│   ├── budget-tracker.tsx    # Budget management
│   ├── stats-overview.tsx    # Financial statistics
│   ├── notification-center.tsx # Smart notifications
│   └── ui/                   # Shadcn UI components
├── data/
│   └── sample-data.tsx       # Sample transactions
└── README.md
```

## 🎯 Performance Optimizations

### **Lazy Loading**
- Transactions load in batches of 20
- Infinite scroll with Intersection Observer
- Reduces initial page load time

### **Background Processing**
- Financial calculations run during browser idle time
- Non-blocking UI updates
- Smooth user experience even with large datasets

### **Canvas Optimization**
- Hardware-accelerated chart rendering
- Responsive canvas with device pixel ratio support
- Efficient redraw cycles

### **Memory Management**
- Proper cleanup of event listeners
- Observer disconnection on unmount
- Optimized re-renders with React hooks

### **Development Guidelines**
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Maintain responsive design principles
- Add proper error handling
- Write meaningful commit messages

## 🐛 Known Issues & Roadmap

### **Current Limitations**
- Data is stored in local state (no persistence)
- No user authentication
- Limited to single currency

### **Planned Features**
- 🔐 **User Authentication** - Multi-user support
- 💾 **Data Persistence** - Database integration
- 🌍 **Multi-currency** - Support for different currencies
- 📱 **Mobile App** - React Native version
- 🔄 **Data Export** - CSV/PDF export functionality
- 📊 **Advanced Analytics** - More chart types and insights

## 🙏 Acknowledgments

- **Shadcn/ui** for beautiful UI components
- **Tailwind CSS** for utility-first styling
- **Lucide React** for consistent icons
- **Next.js** team for the amazing framework

This comprehensive README includes:

✅ **Professional Overview** - Clear description and features
✅ **Technology Stack** - All frameworks and APIs used
✅ **Installation Guide** - Step-by-step setup instructions
✅ **Usage Documentation** - How to use each feature
✅ **API Reference** - Technical implementation details
✅ **Performance Details** - Optimization explanations
✅ **Contributing Guidelines** - How others can help
✅ **Project Structure** - Code organization
✅ **Roadmap** - Future plans and known issues

The README is structured to be both **user-friendly** for people wanting to use the app and **developer-friendly** for those wanting to contribute or understand the technical implementation! 🚀
