import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { Doughnut } from 'react-chartjs-2';
import AddTransactionForm from './AddTransactionForm';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartJSTooltip,
  Legend,
} from 'chart.js';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  IconButton,
  Modal,
  useTheme,
  useMediaQuery,
  Tooltip,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Typography,
} from '@mui/material';
import { FaEdit, FaTrash, FaSyncAlt, FaPlus, FaCheck, FaTimes } from 'react-icons/fa';
import StyledIconWrapper from './StyledIconWrapper';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import HomeIcon from '@mui/icons-material/Home';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import MovieIcon from '@mui/icons-material/Movie';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SchoolIcon from '@mui/icons-material/School';
import FlightIcon from '@mui/icons-material/Flight';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptIcon from '@mui/icons-material/Receipt';

ChartJS.register(ArcElement, ChartJSTooltip, Legend);

const centerTextPlugin = {
  id: 'centerText',
  beforeDraw: function (chart) {
    const { width, height, ctx } = chart;
    const { text, color, font } = chart.options.plugins.centerText || {};
    if (text) {
      ctx.save();
      ctx.font = `${font.weight} ${font.size}px ${font.family || 'Arial'}`;
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const centerX = width / 2;
      const centerY = height / 2;
      ctx.fillText(text, centerX, centerY);
      ctx.restore();
    }
  },
};

const categoryIcons = {
  food: <FastfoodIcon />,
  rent: <HomeIcon />,
  utilities: <LocalGasStationIcon />,
  entertainment: <MovieIcon />,
  transport: <LocalGasStationIcon />,
  health: <HealthAndSafetyIcon />,
  misc: <MoreHorizIcon />,
  salary: <AttachMoneyIcon />,
  bonus: <AttachMoneyIcon />,
  other: <MoreHorizIcon />,
  shopping: <ShoppingCartIcon />,
  education: <SchoolIcon />,
  travel: <FlightIcon />,
  bills: <ReceiptIcon />,
};

const incomeColors = ['#66BB6A', '#26A69A', '#FFEB3B', '#FFD54F', '#4FC3F7', '#9575CD', '#81C784', '#AED581', '#FFCC80', '#FFF176'];
const expenseColors = ['#FF5252', '#FF7043', '#FFAB40', '#D32F2F', '#E64A19', '#F57F17', '#C62828', '#F4511E', '#FFA726', '#EF6C00'];

const TransactionTable = ({ transactions, addTransaction, editTransaction, deleteTransaction }) => {
  const { currentTranslations } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [currentChart, setCurrentChart] = useState('expense');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    description: '',
    amount: '',
    date: '',
    category: '',
    isRecurring: false,
    recurringDay: '',
    recurringStartDate: '',
    recurringEndDate: '',
  });
  const [filterVisible, setFilterVisible] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState({
    startDate: '',
    endDate: '',
    category: '',
  });

  // Handle swiping to switch between charts
  const [startX, setStartX] = useState(null);

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0].clientX;
    if (startX - endX > 50) {
      setCurrentChart('income');
    } else if (endX - startX > 50) {
      setCurrentChart('expense');
    }
  };

  // Toggle pie chart click to show/hide table
  const handlePieClick = () => {
    setIsTableVisible((prev) => !prev);
  };

  const handleEdit = (transaction) => {
    setEditingId(transaction.id);
    setEditData({
      ...transaction,
      recurringDay: transaction.recurringDay || '',
      recurringStartDate: transaction.recurringStartDate || '',
      recurringEndDate: transaction.recurringEndDate || '',
    });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const saveEdit = () => {
    const updatedTransaction = {
      ...editData,
      amount: parseFloat(editData.amount),
    };
    editTransaction(updatedTransaction);
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({
      description: '',
      amount: '',
      date: '',
      category: '',
      isRecurring: false,
      recurringDay: '',
      recurringStartDate: '',
      recurringEndDate: '',
    });
  };

  const toggleAddTransactionForm = () => {
    setIsAddTransactionOpen(!isAddTransactionOpen);
  };

  const handleAddTransaction = (transaction) => {
    if (typeof addTransaction === 'function') {
      addTransaction(transaction);
      setIsAddTransactionOpen(false);
    }
  };

  // Filtered transactions for the table based on current chart (expense/income)
  const filteredTransactions = transactions.filter((transaction) => {
    const { startDate, endDate, category } = filterCriteria;

    // Filter by date and category
    const isDateValid =
      (!startDate || new Date(transaction.date) >= new Date(startDate)) &&
      (!endDate || new Date(transaction.date) <= new Date(endDate));
    const isCategoryValid = !category || transaction.category === category;

    // Filter by transaction type based on current chart
    const isTypeValid = transaction.type === (currentChart === 'expense' ? 'Expense' : 'Income');

    return isDateValid && isCategoryValid && isTypeValid;
  });

  const totalExpenses = transactions
    .filter((transaction) => transaction.type === 'Expense')
    .reduce((acc, transaction) => acc + transaction.amount, 0);

  const totalIncome = transactions
    .filter((transaction) => transaction.type === 'Income')
    .reduce((acc, transaction) => acc + transaction.amount, 0);

  const expenseData = transactions.reduce((acc, transaction) => {
    if (transaction.type === 'Expense') {
      const existingCategory = acc.find((item) => item.name === transaction.category);
      if (existingCategory) {
        existingCategory.value += transaction.amount;
      } else {
        acc.push({ name: transaction.category, value: transaction.amount });
      }
    }
    return acc;
  }, []);

  const incomeData = transactions.reduce((acc, transaction) => {
    if (transaction.type === 'Income') {
      const existingCategory = acc.find((item) => item.name === transaction.category);
      if (existingCategory) {
        existingCategory.value += transaction.amount;
      } else {
        acc.push({ name: transaction.category, value: transaction.amount });
      }
    }
    return acc;
  }, []);

  const formatAmountForChart = (amount) => {
    return amount >= 10000 ? `${(amount / 1000).toFixed(1)}k` : amount.toFixed(2);
  };

  const expensePieData = {
    labels: expenseData.map((entry) => currentTranslations.categories[entry.name]),
    datasets: [
      {
        data: expenseData.map((entry) => entry.value),
        backgroundColor: expenseColors,
        hoverBackgroundColor: expenseColors.map((color) => `${color}B3`),
        borderWidth: 1,
        borderDash: [5, 5],
      },
    ],
  };

  const incomePieData = {
    labels: incomeData.map((entry) => currentTranslations.categories[entry.name]),
    datasets: [
      {
        data: incomeData.map((entry) => entry.value),
        backgroundColor: incomeColors,
        hoverBackgroundColor: incomeColors.map((color) => `${color}B3`),
        borderWidth: 1,
        borderDash: [5, 5],
      },
    ],
  };

  const pieOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ₪${context.raw.toFixed(2)}`,
        },
      },
      legend: {
        display: false,
      },
      centerText: {
        display: true,
      },
    },
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10,
        bottom: 10,
      },
    },
    cutout: '70%',
  };

  const expensePieOptions = {
    ...pieOptions,
    plugins: {
      ...pieOptions.plugins,
      centerText: {
        text: `₪${formatAmountForChart(totalExpenses)}`,
        color: 'red',
        font: {
          size: isMobile ? 20 : 20,
          weight: 'bold',
        },
      },
    },
  };

  const incomePieOptions = {
    ...pieOptions,
    plugins: {
      ...pieOptions.plugins,
      centerText: {
        text: `₪${formatAmountForChart(totalIncome)}`,
        color: 'green',
        font: {
          size: isMobile ? 20 : 20,
          weight: 'bold',
        },
      },
    },
  };

  const toggleFilter = () => {
    setFilterVisible(!filterVisible);
  };

  return (
    <>
      {/* Table and Filter Section */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" gutterBottom>
          {currentTranslations.transactionTable}
        </Typography>

        {/* Conditionally render the Clear Filter button based on filterVisible */}
        {filterVisible && (
          <Grid item xs={12} sx={{ textAlign: 'left', mt: '17px' }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() =>
                setFilterCriteria({
                  startDate: '',
                  endDate: '',
                  category: '',
                })
              }
            >
              {currentTranslations.clearFilter || 'Clear Filter'}
            </Button>
          </Grid>
        )}

        {/* Filter Button */}
        <Button variant="outlined" onClick={toggleFilter} sx={{ mt: 2 }}>
          {currentTranslations.filter || 'Filter'}
        </Button>
      </Box>

      {/* Filter Section */}
      {filterVisible && (
        <Box sx={{ mb: 4, mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label={currentTranslations.date}
                type="date"
                fullWidth
                value={filterCriteria.startDate}
                onChange={(e) =>
                  setFilterCriteria((prev) => ({ ...prev, startDate: e.target.value }))
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={currentTranslations.date}
                type="date"
                fullWidth
                value={filterCriteria.endDate}
                onChange={(e) =>
                  setFilterCriteria((prev) => ({ ...prev, endDate: e.target.value }))
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>{currentTranslations.category}</InputLabel>
                <Select
                  label={currentTranslations.category}
                  value={filterCriteria.category}
                  onChange={(e) =>
                    setFilterCriteria((prev) => ({ ...prev, category: e.target.value }))
                  }
                >
                  <MenuItem value="">{currentTranslations.allCategories}</MenuItem>
                  {Object.keys(currentTranslations.categories).map((key) => (
                    <MenuItem key={key} value={key}>
                      {currentTranslations.categories[key]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Pie Charts Section */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mt: 3,
          position: 'relative',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Expense Pie Chart */}
        {currentChart === 'expense' && (
          <Box
            sx={{
              width: isMobile ? '80%' : '60%',
              height: isMobile ? 180 : 250,
            }}
            onClick={handlePieClick}
          >
            <Doughnut data={expensePieData} options={expensePieOptions} plugins={[centerTextPlugin]} />
          </Box>
        )}

        {/* Income Pie Chart */}
        {currentChart === 'income' && (
          <Box
            sx={{
              width: isMobile ? '80%' : '60%',
              height: isMobile ? 180 : 250,
            }}
            onClick={handlePieClick}
          >
            <Doughnut data={incomePieData} options={incomePieOptions} plugins={[centerTextPlugin]} />
          </Box>
        )}

        {/* Add Transaction Button */}
        <IconButton
          onClick={toggleAddTransactionForm}
          sx={{
            position: 'absolute',
            left: '0%',
            mt: 5.5,
            top: filterVisible ? '-45px' : '-110px',
            backgroundColor: 'primary.main',
            width: 51,
            height: 51,
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
          }}
        >
          <FaPlus color="white" size={24} />
        </IconButton>
      </Box>

      {/* SWIPE GUIDE */}
      <Typography
        variant="caption"
        display="block"
        textAlign="center"
        sx={{ mt: 2, color: 'gray' }}
      >
        {currentTranslations.swipeToChange || 'Swipe left or right to change the pie chart.'}
      </Typography>

      {/* Add Transaction Form Modal */}
      <Modal
        open={isAddTransactionOpen}
        onClose={toggleAddTransactionForm}
        aria-labelledby="add-transaction-modal"
        aria-describedby="add-transaction-form"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: isMobile ? '90%' : '50%',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <AddTransactionForm addTransaction={handleAddTransaction} />
        </Box>
      </Modal>

      {/* Transaction Table */}
      {isTableVisible && (
        <TableContainer component={Paper} sx={{ maxHeight: '60vh', overflowY: 'auto', mt: 3 }}>
          <Table stickyHeader size={isMobile ? 'small' : 'medium'} aria-label="transaction table">
            <TableHead>
              <TableRow>
                <TableCell>{currentTranslations.date}</TableCell>
                <TableCell>{currentTranslations.description}</TableCell>
                <TableCell>{currentTranslations.category}</TableCell>
                <TableCell>{currentTranslations.amount}</TableCell>
                {!isMobile && <TableCell>{currentTranslations.timestamp}</TableCell>}
                <TableCell>{currentTranslations.actions}</TableCell>
                <TableCell>{currentTranslations.recurring}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  sx={{
                    bgcolor: transaction.type === 'Income' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                  }}
                >
                  {editingId === transaction.id ? (
                    <TableCell colSpan={7}>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Box component="form" sx={{ width: isMobile ? '100%' : '80%', maxWidth: 400, mx: 'auto' }}>
                          <Grid container spacing={2}>
                            {/* Editing Form Inputs */}
                            <Grid item xs={12}>
                              <TextField
                                label={currentTranslations.date}
                                type="date"
                                name="date"
                                value={editData.date}
                                onChange={handleEditChange}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                size={isMobile ? 'small' : 'medium'}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                label={currentTranslations.description}
                                name="description"
                                value={editData.description}
                                onChange={handleEditChange}
                                fullWidth
                                size={isMobile ? 'small' : 'medium'}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <Select
                                label={currentTranslations.category}
                                name="category"
                                value={editData.category}
                                onChange={handleEditChange}
                                fullWidth
                                variant="outlined"
                                size={isMobile ? 'small' : 'medium'}
                                renderValue={(selected) => (
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <StyledIconWrapper>{categoryIcons[selected]}</StyledIconWrapper>
                                    <Box sx={{ ml: 1 }}>{currentTranslations.categories[selected]}</Box>
                                  </Box>
                                )}
                              >
                                {Object.keys(currentTranslations.categories).map((key) => (
                                  <MenuItem key={key} value={key}>
                                    <StyledIconWrapper>{categoryIcons[key]}</StyledIconWrapper>
                                    <Box sx={{ ml: 1 }}>{currentTranslations.categories[key]}</Box>
                                  </MenuItem>
                                ))}
                              </Select>
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                label={currentTranslations.amount}
                                type="number"
                                name="amount"
                                value={editData.amount}
                                onChange={handleEditChange}
                                fullWidth
                                size={isMobile ? 'small' : 'medium'}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={editData.isRecurring}
                                    onChange={handleEditChange}
                                    name="isRecurring"
                                  />
                                }
                                label={currentTranslations.recurringCheckboxLabel}
                              />
                            </Grid>
                            {editData.isRecurring && (
                              <>
                                <Grid item xs={12} sm={4}>
                                  <TextField
                                    label="Start Date"
                                    type="date"
                                    name="recurringStartDate"
                                    value={editData.recurringStartDate}
                                    onChange={handleEditChange}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    size={isMobile ? 'small' : 'medium'}
                                    helperText="Select the start date for the recurring transaction"
                                  />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                  <TextField
                                    label="Recurring Day"
                                    type="number"
                                    name="recurringDay"
                                    value={editData.recurringDay}
                                    onChange={handleEditChange}
                                    fullWidth
                                    size={isMobile ? 'small' : 'medium'}
                                    helperText="Enter the day of the month for the recurring transaction"
                                  />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                  <TextField
                                    label="End Date"
                                    type="date"
                                    name="recurringEndDate"
                                    value={editData.recurringEndDate}
                                    onChange={handleEditChange}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    size={isMobile ? 'small' : 'medium'}
                                    helperText="Select the end date for the recurring transaction"
                                  />
                                </Grid>
                              </>
                            )}
                            <Grid item xs={12}>
                              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Button onClick={saveEdit} sx={{ mr: 2 }} variant="contained" color="primary">
                                  <StyledIconWrapper>
                                    <FaCheck />
                                  </StyledIconWrapper>
                                </Button>
                                <Button onClick={cancelEdit} variant="contained" color="secondary">
                                  <StyledIconWrapper>
                                    <FaTimes />
                                  </StyledIconWrapper>
                                </Button>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      </Box>
                    </TableCell>
                  ) : (
                    <>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <StyledIconWrapper>
                            {categoryIcons[transaction.category] || <MoreHorizIcon />}
                          </StyledIconWrapper>
                          <Box sx={{ ml: 1 }}>{currentTranslations.categories[transaction.category]}</Box>
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: transaction.type === 'Income' ? 'green' : 'red',
                        }}
                      >
                        ₪{Number(transaction.amount).toFixed(2)}
                      </TableCell>
                      {!isMobile && <TableCell>{transaction.timestamp}</TableCell>}
                      <TableCell>
                        <Tooltip title={currentTranslations.updateBalance} arrow>
                          <Button onClick={() => handleEdit(transaction)} sx={{ minWidth: 36 }}>
                            <FaEdit />
                          </Button>
                        </Tooltip>
                        <Tooltip title={currentTranslations.transactionDeleted} arrow>
                          <Button onClick={() => deleteTransaction(transaction.id)} sx={{ minWidth: 36 }} color="error">
                            <FaTrash />
                          </Button>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        {transaction.isRecurring && (
                          <Tooltip title={currentTranslations.recurringTooltip} arrow>
                            <StyledIconWrapper>
                              <FaSyncAlt style={{ color: 'green' }} />
                            </StyledIconWrapper>
                          </Tooltip>
                        )}
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
};

export default TransactionTable;
