const expenseForm = document.getElementById('expense-form');
const expenseList = document.getElementById('expense-list');
const homeCurrencySelect = document.getElementById('home-currency');
const homeCurrencyDisplay = document.getElementById('home-currency-display');
const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');
const filterButton = document.getElementById('filter-btn');
let expenses = [];
let homeCurrency = 'USD';

const conversionRates = {
  USD: 1,
  EUR: 0.85,
  GBP: 0.75,
  JPY: 110.0,
  AUD: 1.4,
  CAD: 1.3
};

function convertToHomeCurrency(amount, currency) {
  const usdAmount = amount / conversionRates[currency];
  return usdAmount * conversionRates[homeCurrency];
}

function updateExpenseList() {
  expenseList.innerHTML = expenses.map((expense, index) => `
    <li>
      ${expense.description} - ${expense.amount} ${expense.currency} 
      on ${expense.date.toLocaleDateString()}
      <button class="edit-btn" onclick="editExpense(${index})">Edit</button>
    </li>
  `).join('');
  updateDashboard();
}

function updateDashboard() {
  const filteredExpenses = expenses.filter(expense => {
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);
    return (!startDateInput.value || expense.date >= startDate) &&
           (!endDateInput.value || expense.date <= endDate);
  });

  const total = filteredExpenses.reduce((sum, expense) => 
    sum + convertToHomeCurrency(expense.amount, expense.currency), 0
  );
  document.getElementById('total-expenses').textContent = total.toFixed(2);
  homeCurrencyDisplay.textContent = homeCurrency;
}

function saveExpenses() {
  localStorage.setItem('expenses', JSON.stringify(expenses));
}

function loadExpenses() {
  const saved = JSON.parse(localStorage.getItem('expenses'));
  if (saved) {
    expenses = saved.map(exp => ({
      ...exp,
      date: new Date(exp.date)
    }));
    updateExpenseList();
  }
}

function editExpense(index) {
  const expense = expenses[index];
  document.getElementById('description').value = expense.description;
  document.getElementById('amount').value = expense.amount;
  document.getElementById('currency').value = expense.currency;
  document.getElementById('expense-date').value = expense.date.toISOString().split('T')[0];

  expenses.splice(index, 1);
  updateExpenseList();
}

expenseForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const description = document.getElementById('description').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const currency = document.getElementById('currency').value;
  const dateValue = document.getElementById('expense-date').value;
  const date = dateValue ? new Date(dateValue) : new Date();

  const expense = { description, amount, currency, date };
  expenses.push(expense);
  updateExpenseList();
  saveExpenses();
  expenseForm.reset();
});

homeCurrencySelect.addEventListener('change', function() {
  homeCurrency = homeCurrencySelect.value;
  updateDashboard();
  saveExpenses();
});

filterButton.addEventListener('click', updateDashboard);

loadExpenses();
