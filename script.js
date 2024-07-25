document.addEventListener('DOMContentLoaded', () => {
    const loggingSection = document.getElementById('logging-section');
    const entriesSection = document.getElementById('entries-section');
    const expensesTableBody = document.querySelector('#expenses-table tbody');
    const popup = document.getElementById('popup');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const filterDatesButton = document.getElementById('filter-dates');
    const otherCategoryContainer = document.getElementById('other-category-container');
    const otherCategoryInput = document.getElementById('other-category');
    const expenseCategorySelect = document.getElementById('expense-category');
    const detailsInput = document.getElementById('details');
    const goToEntriesButton = document.getElementById('go-to-entries');
    const backToLoggingButton = document.getElementById('back-to-logging');
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    let editIndex = null;

    function renderExpenses(filteredExpenses) {
        expensesTableBody.innerHTML = '';
        filteredExpenses.forEach((expense, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${expense.description}</td>
                <td>${expense.amount}</td>
                <td>${expense.currency}</td>
                <td>${expense.date || 'N/A'}</td>
                <td>${expense.category}</td>
                <td>${expense.details || 'N/A'}</td>
                <td>
                    <button class="edit" data-index="${index}">Edit</button>
                    <button class="delete" data-index="${index}">Delete</button>
                </td>
            `;
            expensesTableBody.appendChild(row);
        });
    }

    function saveExpenses() {
        localStorage.setItem('expenses', JSON.stringify(expenses));
        updateDashboardSummary();
    }

    function switchToLogging() {
        loggingSection.style.display = 'block';
        entriesSection.style.display = 'none';
        document.getElementById('expense-form').reset();
        otherCategoryContainer.style.display = 'none';

        if (editIndex !== null) {
            const expense = expenses[editIndex];
            document.getElementById('description').value = expense.description;
            document.getElementById('amount').value = expense.amount;
            document.getElementById('currency').value = expense.currency;
            document.getElementById('date').value = expense.date || '';
            document.getElementById('expense-category').value = expense.category;
            detailsInput.value = expense.details || '';
            if (expense.category === 'other') {
                otherCategoryInput.value = expense.details || ''; // Use details for 'other' category
                otherCategoryContainer.style.display = 'block';
            }
        } else {
            document.getElementById('expense-form').reset();
            otherCategoryContainer.style.display = 'none';
        }
    }

    function switchToEntries() {
        loggingSection.style.display = 'none';
        entriesSection.style.display = 'block';
        updateDashboardSummary();
    }

    function showPopup(message) {
        popup.textContent = message;
        popup.style.display = 'block';
        setTimeout(() => {
            popup.style.display = 'none';
        }, 3000);
    }

    function updateDashboardSummary() {
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);
        let totalAmount = 0;
        let totalExpenses = 0;

        const filteredExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return (isNaN(startDate) || expenseDate >= startDate) && (isNaN(endDate) || expenseDate <= endDate);
        });

        filteredExpenses.forEach(expense => {
            totalAmount += parseFloat(expense.amount);
            totalExpenses++;
        });

        renderExpenses(filteredExpenses);
    }

    document.getElementById('expense-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const description = document.getElementById('description').value;
        const amount = document.getElementById('amount').value;
        const currency = document.getElementById('currency').value;
        const date = document.getElementById('date').value || new Date().toISOString().split('T')[0];
        const category = document.getElementById('expense-category').value;
        const categoryDetail = category === 'other' ? otherCategoryInput.value : category;
        const details = detailsInput.value;

        if (editIndex !== null) {
            expenses[editIndex] = { description, amount, currency, date, category: categoryDetail, details };
            editIndex = null;
            showPopup('Expense updated successfully!');
        } else {
            expenses.push({ description, amount, currency, date, category: categoryDetail, details });
            showPopup('Expense added successfully!');
        }
        
        saveExpenses();
        switchToEntries();
    });

    document.querySelector('#expenses-table').addEventListener('click', (event) => {
        if (event.target.classList.contains('delete')) {
            const index = event.target.dataset.index;
            expenses.splice(index, 1);
            saveExpenses();
            showPopup('Expense deleted successfully!');
        } else if (event.target.classList.contains('edit')) {
            editIndex = event.target.dataset.index;
            switchToLogging();
            showPopup('Expense ready for editing.');
        }
    });

    expenseCategorySelect.addEventListener('change', () => {
        if (expenseCategorySelect.value === 'other') {
            otherCategoryContainer.style.display = 'block';
        } else {
            otherCategoryContainer.style.display = 'none';
        }
    });

    filterDatesButton.addEventListener('click', updateDashboardSummary);

    goToEntriesButton.addEventListener('click', switchToEntries);

    backToLoggingButton.addEventListener('click', switchToLogging);

    // Initialize view
    switchToLogging();
});
