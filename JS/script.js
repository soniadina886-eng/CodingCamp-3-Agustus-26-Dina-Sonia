// Limit nominal untuk highlight transaksi tinggi (Challenge 2)
const SPENDING_LIMIT = 50.00;

// State Data
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let chartInstance = null;

// DOM Elements
const form = document.getElementById('transaction-form');
const itemNameInput = document.getElementById('item-name');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const totalBalanceEl = document.getElementById('total-balance');
const transactionListEl = document.getElementById('transaction-list');
const sortSelect = document.getElementById('sort-select');
const themeToggleBtn = document.getElementById('theme-toggle');

// Init App
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateUI();
});

// Event Listeners
form.addEventListener('submit', addTransaction);
sortSelect.addEventListener('change', updateUI);
themeToggleBtn.addEventListener('click', toggleTheme);

// Add New Transaction
function addTransaction(e) {
    e.preventDefault();

    const name = itemNameInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value;

    if (!name || isNaN(amount) || amount <= 0 || !category) {
        alert('Please fill all fields correctly.');
        return;
    }

    const transaction = {
        id: Date.now(),
        name,
        amount,
        category
    };

    transactions.push(transaction);
    saveData();
    updateUI();

    // Reset Form
    form.reset();
}

// Delete Transaction
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveData();
    updateUI();
}

// Save to LocalStorage
function saveData() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Update Interface (Balance, List, Chart)
function updateUI() {
    renderBalance();
    renderList();
    renderChart();
}

// Render Total Balance
function renderBalance() {
    const total = transactions.reduce((acc, curr) => acc + curr.amount, 0);
    totalBalanceEl.textContent = `$${total.toFixed(2)}`;
}

// Render Sorted List
function renderList() {
    transactionListEl.innerHTML = '';

    const sorted = [...transactions];
    const sortValue = sortSelect.value;

    if (sortValue === 'high-amount') {
        sorted.sort((a, b) => b.amount - a.amount);
    } else if (sortValue === 'low-amount') {
        sorted.sort((a, b) => a.amount - b.amount);
    } else {
        sorted.sort((a, b) => b.id - a.id); // Newest first
    }

    if (sorted.length === 0) {
        transactionListEl.innerHTML = '<p style="text-align:center; color: var(--text-muted);">No transactions added yet.</p>';
        return;
    }

    sorted.forEach(t => {
        const item = document.createElement('div');
        item.className = `transaction-item ${t.amount >= SPENDING_LIMIT ? 'over-limit' : ''}`;
        
        item.innerHTML = `
            <div class="item-info">
                <span class="item-title">${t.name}</span>
                <span class="item-amount">$${t.amount.toFixed(2)}</span>
                <span class="item-category">${t.category}</span>
            </div>
            <button class="btn-delete" onclick="deleteTransaction(${t.id})">Delete</button>
        `;
        
        transactionListEl.appendChild(item);
    });
}

// Render Category Pie Chart
function renderChart() {
    const categories = ['Food', 'Transport', 'Fun'];
    const dataSums = categories.map(cat => {
        return transactions
            .filter(t => t.category === cat)
            .reduce((sum, t) => sum + t.amount, 0);
    });

    const ctx = document.getElementById('expense-chart').getContext('2d');

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                data: dataSums,
                backgroundColor: ['#4caf50', '#2196f3', '#ff9800'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Challenge 3: Dark/Light Mode Switch
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeToggleBtn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggleBtn.textContent = '☀️ Light Mode';
    }
}