import './App.css'
import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { PlusCircle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

const CATEGORIES = [
  'Housing',
  'Food',
  'Transportation',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Other',
];

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
  '#FFC658',
  '#FF6B6B',
];

const App = () => {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Other');
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    // Simulate loading state for initial animation
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !amount) return;

    const newTransaction = {
      id: Math.random().toString(),
      description,
      amount: parseFloat(amount),
      type,
      category,
      date: new Date().toISOString(),
    };

    setTransactions([...transactions, newTransaction]);
    setDescription('');
    setAmount('');
    setShowForm(false);
  };

  const calculateBalance = () => {
    return transactions.reduce((acc, transaction) => {
      return transaction.type === 'income' 
        ? acc + transaction.amount 
        : acc - transaction.amount;
    }, 0);
  };

  const getCategoryData = () => {
    const categoryTotals = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        categoryTotals[transaction.category] = 
          (categoryTotals[transaction.category] || 0) + transaction.amount;
      });
    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const getMonthlyData = () => {
    const monthlyData = {};
    transactions.forEach(transaction => {
      const month = new Date(transaction.date)
        .toLocaleString('default', { month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expense: 0 };
      }
      if (transaction.type === 'income') {
        monthlyData[month].income += transaction.amount;
      } else {
        monthlyData[month].expense += transaction.amount;
      }
    });
    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data,
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 animate-fadeIn">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center animate-slideDown">
          <h1 className="text-3xl font-bold text-gray-800">Expense Tracker</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <PlusCircle className="w-5 h-5 animate-spin-slow" />
            <span>Add Transaction</span>
          </button>
        </div>

        {/* Form */}
        <div className={`transform transition-all duration-300 ${
          showForm 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 -translate-y-4 pointer-events-none h-0'
        }`}>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <input
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                  placeholder="Amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <select
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
                <select
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Add Transaction
              </button>
            </form>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 animate-slideUp">
          <div className="text-white">
            <p className="text-lg opacity-90">Current Balance</p>
            <h2 className="text-4xl font-bold animate-pulse">
              ${calculateBalance().toFixed(2)}
            </h2>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Overview */}
          <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl animate-slideLeft">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Monthly Overview</h3>
            <div className="overflow-x-auto">
              <BarChart width={500} height={300} data={getMonthlyData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="#4ade80" name="Income" />
                <Bar dataKey="expense" fill="#f87171" name="Expense" />
              </BarChart>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl animate-slideRight">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Expense by Category</h3>
            <div className="overflow-x-auto">
              <PieChart width={500} height={300}>
                <Pie
                  data={getCategoryData()}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {getCategoryData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-xl shadow-lg p-6 animate-slideUp">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Transactions</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transactions.slice().reverse().map((transaction, index) => (
              <div
                key={transaction.id}
                className="flex justify-between items-center p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300 hover:scale-102 animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3">
                  {transaction.type === 'income' ? (
                    <ArrowUpCircle className="w-6 h-6 text-green-500 animate-bounce" />
                  ) : (
                    <ArrowDownCircle className="w-6 h-6 text-red-500 animate-bounce" />
                  )}
                  <div>
                    <p className="font-semibold text-gray-800">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className={`font-bold ${
                  transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;