const SPENDING_LIMIT = 50; // Ambang batas untuk tantangan highlight spending
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let myChart = null;

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateUI();

    document.getElementById('transaction-form').addEventListener('submit', addTransaction);
    document.getElementById('sort-select').addEventListener('change', updateUI);
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
});

function addTransaction(e) {
    e.preventDefault();
    const name = document.getElementById('item-name').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;

    if (!name || isNaN(amount) || amount <= 0) return;

    transactions.push({ id: Date.now(), name, amount, category });
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    document.getElementById('transaction-form').reset();
    updateUI();
}

function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateUI();
}

function updateUI() {
    // 1. Update Total Balance
    const total = transactions.reduce((sum, t) => sum + t.amount, 0);
    document.getElementById('total-balance').textContent = `$${total.toFixed(2)}`;

    // 2. Update Transaction List & Sorting
    const listEl = document.getElementById('transaction-list');
    listEl.innerHTML = '';

    let sorted = [...transactions];
    const sortBy = document.getElementById('sort-select').value;

    if (sortBy === 'high-amount') sorted.sort((a, b) => b.amount - a.amount);
    if (sortBy === 'low-amount') sorted.sort((a, b) => a.amount - b.amount);
    if (sortBy === 'newest') sorted.sort((a, b) => b.id - a.id);

    sorted.forEach(t => {
        const item = document.createElement('div');
        // Fitur Highlight jika amount melebihi limit
        item.className = `transaction-item ${t.amount >= SPENDING_LIMIT ? 'over-limit' : ''}`;
        item.innerHTML = `
            <div class="item-info">
                <span class="item-title">${t.name}</span>
                <span class="item-amount">$${t.amount.toFixed(2)}</span>
                <span class="item-category">${t.category}</span>
            </div>
            <button class="btn-delete" onclick="deleteTransaction(${t.id})">Delete</button>
        `;
        listEl.appendChild(item);
    });

    // 3. Update Chart
    renderChart();
}

function renderChart() {
    const ctx = document.getElementById('expense-chart').getContext('2d');
    if (myChart) myChart.destroy();

    const categories = ['Food', 'Transport', 'Fun'];
    const dataSums = categories.map(cat => 
        transactions
            .filter(t => t.category === cat)
            .reduce((sum, t) => sum + t.amount, 0)
    );

    myChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                data: dataSums,
                backgroundColor: ['#4caf50', '#2196f3', '#ff9800']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.getElementById('theme-toggle').textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
}

function initTheme() {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('theme-toggle').textContent = '☀️ Light Mode';
    }
}