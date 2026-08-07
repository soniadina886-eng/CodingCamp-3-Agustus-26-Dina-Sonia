// Challenge 2: Batas nominal untuk highlight ($50.00 ke atas)
const SPENDING_LIMIT = 50.00;

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

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateUI();
});

// Event Listeners
if (form) form.addEventListener('submit', addTransaction);
if (sortSelect) sortSelect.addEventListener('change', updateUI);
if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);

// Add New Transaction
function addTransaction(e) {
    e.preventDefault();

    const name = itemNameInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value;

    if (!name || isNaN(amount) || amount <= 0 || !category) {
        alert('Please fill out all fields correctly.');
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

    form.reset();
}

// Delete Transaction
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveData();
    updateUI();
}

// Save Data to LocalStorage
function saveData() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Update UI Components
function updateUI() {
    renderBalance();
    renderList();
    renderChart();
}

// Render Balance Total
function renderBalance() {
    const total = transactions.reduce((acc, curr) => acc + curr.amount, 0);
    totalBalanceEl.textContent = `$${total.toFixed(2)}`;
}

// Render Sorted List
function renderList() {
    transactionListEl.innerHTML = '';

    let sorted = [...transactions];
    const sortValue = sortSelect ? sortSelect.value : 'newest';

    // Challenge 1: Sorting Logic
    if (sortValue === 'high-amount') {
        sorted.sort((a, b) => b.amount - a.amount);
    } else if (sortValue === 'low-amount') {
        sorted.sort((a, b) => a.amount - b.amount);
    } else {
        sorted.sort((a, b) => b.id - a.id); // Newest
    }

    if (sorted.length === 0) {
        transactionListEl.innerHTML = '<p style="text-align:center; color: var(--text-muted); margin-top: 10px;">No transactions added yet.</p>';
        return;
    }

    sorted.forEach(t => {
        const item = document.createElement('div');
        // Challenge 2: Highlight class
        item.className = `transaction-item ${t.amount >= SPENDING_LIMIT ? 'over-limit' : ''}`;
        
        item.innerHTML = `
            <div class="item-info">
                <span class="item-title">${t.name}</span>
                <span class="item-amount">$${t.amount.toFixed(2)}</span>
                <span class="item-category">${t.category}</span>
            </div>
            <button class="btn-delete">Delete</button>
        `;

        item.querySelector('.btn-delete').addEventListener('click', () => {
            deleteTransaction(t.id);
        });

        transactionListEl.appendChild(item);
    });
}

// Render Chart.js Pie Chart
function renderChart() {
    const canvas = document.getElementById('expense-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const categories = ['Food', 'Transport', 'Fun'];
    
    const dataSums = categories.map(cat => {
        return transactions
            .filter(t => t.category === cat)
            .reduce((sum, t) => sum + t.amount, 0);
    });

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
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Challenge 3: Dark Mode Toggle
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (themeToggleBtn) {
        themeToggleBtn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeToggleBtn) themeToggleBtn.textContent = '☀️ Light Mode';
    }
}