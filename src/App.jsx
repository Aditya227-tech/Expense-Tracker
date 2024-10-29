import './App.css'
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Box,
  VStack,
  HStack,
  Button,
  Input,
  Select,
  Text,
  Heading,
  useToast,
  Container,
  SimpleGrid,
} from '@chakra-ui/react';
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

function App() {
  const [transactions, setTransactions] = useState(() => {
    const savedTransactions = localStorage.getItem('transactions');
    return savedTransactions ? JSON.parse(savedTransactions) : [];
  });
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Other');

  const toast = useToast();

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!description || !amount) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newTransaction = {
      id: uuidv4(),
      description,
      amount: parseFloat(amount),
      type,
      category,
      date: new Date().toISOString(),
    };

    setTransactions([...transactions, newTransaction]);
    setDescription('');
    setAmount('');

    toast({
      title: 'Success',
      description: 'Transaction added successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const calculateBalance = () => {
    return transactions.reduce((acc, transaction) => {
      if (transaction.type === 'income') {
        return acc + transaction.amount;
      } else {
        return acc - transaction.amount;
      }
    }, 0);
  };

  const getCategoryData = () => {
    const categoryTotals = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((transaction) => {
        categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + transaction.amount;
      });

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const getMonthlyData = () => {
    const monthlyData = {};
    transactions.forEach((transaction) => {
      const month = new Date(transaction.date).toLocaleString('default', { month: 'short' });
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

  return (
    <Container maxW="container.xl" py={5}>
      <VStack spacing={6}>
        <Heading>Expense Tracker</Heading>

        <Box p={5} shadow="md" borderWidth="1px" w="100%">
          <form onSubmit={handleSubmit}>
            <SimpleGrid columns={[1, null, 2]} spacing={4}>
              <Input
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Input
                placeholder="Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </Select>
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
              <Button colorScheme="blue" type="submit" gridColumn={[null, null, "span 2"]}>
                Add Transaction
              </Button>
            </SimpleGrid>
          </form>
        </Box>

        <Box p={5} shadow="md" borderWidth="1px" w="100%">
          <Heading size="md" mb={4}>Balance: ${calculateBalance().toFixed(2)}</Heading>
        </Box>

        <SimpleGrid columns={[1, null, 2]} spacing={6} w="100%">
          <Box p={5} shadow="md" borderWidth="1px">
            <Heading size="md" mb={4}>Monthly Overview</Heading>
            <Box overflow="auto">
              <BarChart width={500} height={300} data={getMonthlyData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="#82ca9d" name="Income" />
                <Bar dataKey="expense" fill="#ff7675" name="Expense" />
              </BarChart>
            </Box>
          </Box>

          <Box p={5} shadow="md" borderWidth="1px">
            <Heading size="md" mb={4}>Expense by Category</Heading>
            <Box overflow="auto">
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
            </Box>
          </Box>
        </SimpleGrid>

        <Box p={5} shadow="md" borderWidth="1px" w="100%">
          <Heading size="md" mb={4}>Recent Transactions</Heading>
          <VStack align="stretch" spacing={3}>
            {transactions.slice().reverse().map((transaction) => (
              <HStack
                key={transaction.id}
                p={3}
                shadow="sm"
                borderWidth="1px"
                justify="space-between"
              >
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">{transaction.description}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                  </Text>
                </VStack>
                <Text
                  fontWeight="bold"
                  color={transaction.type === 'income' ? 'green.500' : 'red.500'}
                >
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </Text>
              </HStack>
            ))}
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}

export default App;
