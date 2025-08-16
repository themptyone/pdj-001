// js/app.js

// --- DATA STRUCTURE ---
const initialData = {
    income: [],
    expenses: [],
    debts: [],
    fixedExpenses: [],
    goals: [],
    categories: ["Transportation", "Groceries", "Restaurant", "Entertainment", "Shopping", "Healthcare", "Subscription", "Debt Repayment", "Goal Savings", "Other"],
    settings: {
        apiKey: '',
        activeTheme: 'Liquid Glass',
        timePeriod: 'month',
        bgImage: '',
        bgOpacity: 1,
        borderRadius: 20,
        animationSpeed: 0.5,
        fontFamily: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
        textColorTitle: '#ffffff',
        textColorPrimary: '#ffffff',
        accentColorPositive: '#51cf66',
        accentColorNegative: '#ff6b6b',
        btnColorPrimary: '#667eea',
        btnColorSuccess: '#51cf66',
        btnColorDanger: '#ff6b6b',
        btnColorWarning: '#f39c12',
        uiScale: 1,
        allocation: { needs: 50, wants: 30, savings: 20 }
    }
};
let data = JSON.parse(JSON.stringify(initialData));
let expensePieChart = null;
let currentActionItem = { type: null, id: null };

// --- INITIALIZATION ---
function initializeApp() {
    loadData();
    initializeNavigation(); // From ui.js
    const today = new Date().toISOString().split('T')[0];
    document.querySelectorAll('input[type="date"]').forEach(input => input.value = today);
    showPage('dashboard');  // Load initial page using the new function
}

// --- DATA PERSISTENCE ---
function saveData() { localStorage.setItem('unifiedFinanceDataV6', JSON.stringify(data)); }
function loadData() {
    const savedData = localStorage.getItem('unifiedFinanceDataV6');
    if (savedData) {
        let parsedData = JSON.parse(savedData);
        data = { ...initialData, ...parsedData, settings: { ...initialData.settings, ...(parsedData.settings || {}) } };
        // Ensure new properties exist on loaded data
        ['income', 'expenses', 'debts', 'fixedExpenses', 'goals'].forEach(type => {
            if(data[type]) {
                data[type].forEach(item => {
                    if (item.isHidden === undefined) item.isHidden = false;
                });
            }
        });
    }
}

// --- MASTER RENDER FUNCTION ---
function renderAll() {
    try {
        const filteredData = getFilteredData();
        
        // Check if elements exist before trying to render into them
        if (document.getElementById('income-table')) renderIncomeTable(filteredData.income);
        if (document.getElementById('expense-table')) renderExpenseTable(filteredData.expenses);
        if (document.getElementById('debt-table')) renderDebtTable(filteredData.debts);
        if (document.getElementById('needs-percent')) renderAllocation(filteredData);
        if (document.getElementById('category-summary-grid')) renderCategorySummary(filteredData.expenses);
        if (document.getElementById('fixed-expense-table')) renderFixedExpenseTable(filteredData.fixedExpenses);
        if (document.getElementById('goals-grid')) renderGoals();
        if (document.getElementById('hidden-expense-table')) renderHiddenTables();
        if (document.getElementById('expense-category')) populateCategoryDropdown();
        if (document.getElementById('category-manager-list')) renderCategoryManager();
        if (document.getElementById('chart-toggle') && document.getElementById('chart-toggle').checked) { 
            renderPieChart(filteredData.expenses); 
        }
        if (document.getElementById('time-filter-controls')) updateActiveTimeFilterButton();
        if (document.getElementById('theme-selector')) initializeSettings();
        if (document.getElementById('needs-percent')) initializeAllocationListeners();
        if (document.getElementById('recent-expenses-log')) renderRecentExpensesLog(); // Render recent expenses log
        updateIncomeOverview(); // Call the new function here
    } catch (error) {
        console.error('Error in renderAll:', error);
        // Show error message on page if possible
        const pageContent = document.getElementById('page-content');
        if (pageContent) {
            pageContent.innerHTML = `<h1 class="page-title">Error Loading Dashboard</h1><p>There was an error loading the dashboard. Please check the console for details.</p><p>Error: ${error.message}</p>`;
        }
    }
}

// --- ALLOCATION LOGIC ---
function initializeAllocationListeners() {
    document.getElementById('needs-percent').value = data.settings.allocation.needs;
    document.getElementById('wants-percent').value = data.settings.allocation.wants;
    document.getElementById('savings-percent').value = data.settings.allocation.savings;
    ['needs-percent', 'wants-percent', 'savings-percent'].forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
            data.settings.allocation.needs = parseInt(document.getElementById('needs-percent').value) || 0;
            data.settings.allocation.wants = parseInt(document.getElementById('wants-percent').value) || 0;
            data.settings.allocation.savings = parseInt(document.getElementById('savings-percent').value) || 0;
            saveData();
            renderAll();
        });
    });
}

function renderAllocation(filteredData) {
    try {
        console.log('renderAllocation called with:', filteredData);
        
        // Calculate total income for the selected period
        const totalIncome = filteredData.income.reduce((sum, item) => sum + item.amount, 0);
        console.log('Total income calculated:', totalIncome);
        
        const { needs, wants, savings } = data.settings.allocation;
        console.log('Allocation settings:', { needs, wants, savings });
        const totalPercent = needs + wants + savings;
        
        const totalIncomeDisplay = document.getElementById('total-income-display');
        if (totalIncomeDisplay) {
            const periodText = data.settings.timePeriod === 'month' ? 'This Month' : 
                              data.settings.timePeriod === '14days' ? 'Last 14 Days' :
                              data.settings.timePeriod === '30days' ? 'Last 30 Days' : 'All Time';
            totalIncomeDisplay.textContent = `Total Income (${periodText}): $${totalIncome.toFixed(2)}`;
        } else {
            console.error('total-income-display element not found');
        }
        
        // Calculate allocated amounts based on income for the selected period
        const needsAmount = totalIncome * (needs / 100);
        const wantsAmount = totalIncome * (wants / 100);
        const savingsAmount = totalIncome * (savings / 100);
        
        const needsAmountEl = document.getElementById('needs-amount');
        const wantsAmountEl = document.getElementById('wants-amount');
        const savingsAmountEl = document.getElementById('savings-amount');
        
        if (needsAmountEl) needsAmountEl.textContent = `$${needsAmount.toFixed(2)}`;
        if (wantsAmountEl) wantsAmountEl.textContent = `$${wantsAmount.toFixed(2)}`;
        if (savingsAmountEl) savingsAmountEl.textContent = `$${savingsAmount.toFixed(2)}`;
        
        const totalPercentEl = document.getElementById('total-allocated-percent');
        if (totalPercentEl) {
            totalPercentEl.textContent = `Total Allocated: ${totalPercent}%`;
            totalPercentEl.classList.toggle('warning', totalPercent !== 100);
        }
        
        renderAllocationSummaryTable(needsAmount, wantsAmount, savingsAmount, filteredData);
        console.log('renderAllocation completed successfully');
    } catch (error) {
        console.error('Error in renderAllocation:', error);
        throw error; // Re-throw to be caught by renderAll
    }
}

function renderAllocationSummaryTable(needsAllocated, wantsAllocated, savingsAllocated, filteredData) {
    const tbody = document.getElementById('allocation-summary-table');
    tbody.innerHTML = '';
    const totalFixedExpenses = filteredData.fixedExpenses.reduce((sum, e) => sum + e.amount, 0);
    const needsSpent = filteredData.expenses.filter(e => e.allocationCategory === 'Needs').reduce((sum, e) => sum + e.amount, 0) + totalFixedExpenses;
    const wantsSpent = filteredData.expenses.filter(e => e.allocationCategory === 'Wants').reduce((sum, e) => sum + e.amount, 0);
    const savingsSpent = filteredData.expenses.filter(e => e.allocationCategory === 'Savings & Debt').reduce((sum, e) => sum + e.amount, 0);
    const createRow = (label, allocated, spent) => {
        const remaining = allocated - spent;
        const remainingClass = remaining < 0 ? 'debt-total' : 'expense-total';
        return `<tr><td>${label}</td><td>$${allocated.toFixed(2)}</td><td>$${spent.toFixed(2)}</td><td class="allocation-remaining ${remainingClass}">$${remaining.toFixed(2)}</td></tr>`;
    };
    tbody.innerHTML += createRow('Needs', needsAllocated, needsSpent);
    tbody.innerHTML += createRow('Wants', wantsAllocated, wantsSpent);
    tbody.innerHTML += createRow('Savings & Debt', savingsAllocated, savingsSpent);
    const totalAllocated = needsAllocated + wantsAllocated + savingsAllocated;
    const totalSpent = needsSpent + wantsSpent + savingsSpent;
    const totalRemaining = totalAllocated - totalSpent;
    tbody.innerHTML += `<tr class="total-row"><td>Total</td><td>$${totalAllocated.toFixed(2)}</td><td>$${totalSpent.toFixed(2)}</td><td class="allocation-remaining ${totalRemaining < 0 ? 'debt-total' : 'expense-total'}">$${totalRemaining.toFixed(2)}</td></tr>`;
}

// --- CRUD & DATA MANIPULATION ---
function addIncome(e) { 
    e.preventDefault(); 
    data.income.push({ 
        id: Date.now(), 
        date: document.getElementById('income-date').value, 
        source: document.getElementById('income-source').value, 
        mainCategory: document.getElementById('income-main-category').value,
        subCategory: document.getElementById('income-sub-category').value || '',
        description: document.getElementById('income-description').value, 
        amount: parseFloat(document.getElementById('income-amount').value), 
        isHidden: false 
    }); 
    closeModal('income-modal'); 
    e.target.reset(); 
    saveData(); 
    renderAll(); 
}
function addExpense(e) { 
    e.preventDefault(); 
    data.expenses.push({ 
        id: Date.now(), 
        date: document.getElementById('expense-date').value, 
        allocationCategory: document.getElementById('expense-allocation-category').value, 
        category: document.getElementById('expense-category').value, 
        description: document.getElementById('expense-description').value, 
        amount: parseFloat(document.getElementById('expense-amount').value), 
        isHidden: false 
    }); 
    closeModal('expense-modal'); 
    e.target.reset(); 
    saveData(); 
    renderAll(); 
}
function addDebt(e) { e.preventDefault(); data.debts.push({ id: Date.now(), creditor: document.getElementById('debt-creditor').value, description: document.getElementById('debt-description').value, originalAmount: parseFloat(document.getElementById('debt-original').value), paidAmount: 0, isHidden: false }); closeModal('debt-modal'); e.target.reset(); saveData(); renderAll(); }
function addFixedExpense(e) { e.preventDefault(); data.fixedExpenses.push({ id: Date.now(), dueDate: parseInt(document.getElementById('fixed-due-date').value), description: document.getElementById('fixed-description').value, amount: parseFloat(document.getElementById('fixed-amount').value), status: 'pending', isHidden: false }); saveData(); renderAll(); closeModal('fixed-expense-modal'); e.target.reset(); }
function addGoal(e) { e.preventDefault(); data.goals.push({ id: Date.now(), title: document.getElementById('goal-title').value, targetAmount: parseFloat(document.getElementById('goal-amount').value), savedAmount: 0, contributions: [], isHidden: false }); saveData(); renderGoals(); closeModal('goal-modal'); e.target.reset(); }

function deleteItem(type, id) {
    if (confirm(`Are you sure you want to permanently delete this item?`)) {
        const index = data[type].findIndex(i => i.id === id);
        if (index > -1) {
            data[type].splice(index, 1);
            saveData();
            renderAll();
        }
    }
}

function openPaymentModal(id) { currentDebtId = id; openModal('payment-modal'); }
function addPayment(e) { 
    e.preventDefault(); 
    const amount = parseFloat(document.getElementById('payment-amount').value); 
    const debt = data.debts.find(d => d.id === currentDebtId); 
    if (debt && amount > 0) { 
        debt.paidAmount += amount; 
        data.expenses.push({ id: Date.now(), date: new Date().toISOString().split('T')[0], allocationCategory: 'Savings & Debt', category: 'Debt Repayment', description: `Payment to ${debt.creditor}`, amount: amount, isHidden: false });
        saveData(); 
        renderAll(); 
    } 
    closeModal('payment-modal'); 
    e.target.reset(); 
}
function toggleFixedExpenseStatus(id) { const expense = data.fixedExpenses.find(exp => exp.id === id); if (expense) { expense.status = expense.status === 'pending' ? 'paid' : 'pending'; saveData(); renderFixedExpenseTable(); } }

function getAvailableSavings() {
    const filteredData = getFilteredData();
    const totalIncome = filteredData.income.reduce((sum, item) => sum + item.amount, 0);
    const savingsAllocated = totalIncome * (data.settings.allocation.savings / 100);
    const savingsSpent = filteredData.expenses.filter(e => e.allocationCategory === 'Savings & Debt').reduce((sum, e) => sum + e.amount, 0);
    return savingsAllocated - savingsSpent;
}

function openSavingsModal(id) { 
    currentActionItem = { type: 'goals', id: id };
    const available = getAvailableSavings();
    const input = document.getElementById('savings-amount');
    const msg = document.getElementById('available-savings-msg');
    input.max = available > 0 ? available.toFixed(2) : 0;
    msg.textContent = `You have $${available.toFixed(2)} available in your savings allocation for the current period.`;
    openModal('savings-modal');
}
function addSavingsToGoal(e) {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('savings-amount').value);
    const goal = data.goals.find(g => g.id === currentActionItem.id);
    if (goal && amount > 0 && amount <= getAvailableSavings()) {
        goal.savedAmount += amount;
        goal.contributions.push({ date: new Date().toISOString().split('T')[0], amount: amount });
        data.expenses.push({ id: Date.now(), date: new Date().toISOString().split('T')[0], allocationCategory: 'Savings & Debt', category: 'Goal Savings', description: `Contribution to ${goal.title}`, amount: amount, isHidden: false });
        saveData();
        renderAll();
    } else {
        alert("Cannot add savings. Amount is either zero or exceeds available savings funds for the selected period.");
    }
    closeModal('savings-modal');
    e.target.reset();
}

// --- TABLE & GOAL RENDERING ---
function renderActionBtn(type, id) {
    return `<button class="action-btn" onclick="openActionMenu(event, '${type}', ${id})">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
            </button>`;
}
function renderIncomeTable(tableData = data.income) {
    const tbody = document.getElementById('income-table');
    const tfoot = document.getElementById('income-table-foot');
    if (!tbody || !tfoot) return;
    
    tbody.innerHTML = '';
    tfoot.innerHTML = '';
    
    tableData.filter(item => !item.isHidden).forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td>${new Date(item.date).toLocaleDateString()}</td>
                <td>${item.source}</td>
                <td>${item.mainCategory || 'Uncategorized'}</td>
                <td>${item.subCategory || '-'}</td>
                <td>${item.description || '-'}</td>
                <td class="amount">$${item.amount.toFixed(2)}</td>
                <td class="cell-center">${renderActionBtn('income', item.id)}</td>
            </tr>
        `;
    });
    
    if (tableData.length > 0) {
        const total = tableData.reduce((sum, item) => sum + item.amount, 0);
        tfoot.innerHTML = `
            <tr>
                <td colspan="5"><strong>Total</strong></td>
                <td class="amount">$${total.toFixed(2)}</td>
                <td></td>
            </tr>
        `;
    }
}
function renderExpenseTable(tableData = data.expenses) {
    const tbody = document.getElementById('expense-table');
    const tfoot = document.getElementById('expense-table-foot');
    tbody.innerHTML = '';
    tfoot.innerHTML = '';
    tableData.filter(item => !item.isHidden).forEach(item => {
        tbody.innerHTML += `<tr><td>${new Date(item.date).toLocaleDateString()}</td><td>${item.allocationCategory} - ${item.category}</td><td>${item.description}</td><td class="amount">$${item.amount.toFixed(2)}</td><td class="cell-center">${renderActionBtn('expenses', item.id)}</td></tr>`;
    });
    if (tableData.length > 1) {
        const total = tableData.reduce((sum, item) => sum + item.amount, 0);
        tfoot.innerHTML = `<tr><td colspan="3"><strong>Total</strong></td><td class="amount">$${total.toFixed(2)}</td><td></td></tr>`;
    }
}
function renderDebtTable(tableData = data.debts) {
    const tbody = document.getElementById('debt-table');
    const tfoot = document.getElementById('debt-table-foot');
    tbody.innerHTML = '';
    tfoot.innerHTML = '';
    tableData.filter(item => !item.isHidden).forEach(debt => {
        const remaining = debt.originalAmount - debt.paidAmount;
        const percentPaid = debt.originalAmount > 0 ? (debt.paidAmount / debt.originalAmount * 100) : 0;
        tbody.innerHTML += `<tr><td>${debt.creditor}</td><td>${debt.description}</td><td class="amount">$${debt.originalAmount.toFixed(2)}</td><td class="amount">$${debt.paidAmount.toFixed(2)}</td><td class="amount ${remaining > 0 ? 'debt-total' : ''}">$${remaining.toFixed(2)}</td><td class="cell-center"><div class="progress-bar"><div class="progress-fill" style="width: ${Math.min(percentPaid, 100)}%;"></div></div></td><td class="cell-center">${renderActionBtn('debts', debt.id)}</td></tr>`;
    });
    if (tableData.length > 1) {
        const totalOriginal = tableData.reduce((sum, item) => sum + item.originalAmount, 0);
        const totalPaid = tableData.reduce((sum, item) => sum + item.paidAmount, 0);
        const totalRemaining = totalOriginal - totalPaid;
        tfoot.innerHTML = `<tr><td colspan="2"><strong>Total</strong></td><td class="amount">$${totalOriginal.toFixed(2)}</td><td class="amount">$${totalPaid.toFixed(2)}</td><td class="amount">$${totalRemaining.toFixed(2)}</td><td colspan="2"></td></tr>`;
    }
}
function renderFixedExpenseTable(tableData = data.fixedExpenses) {
    const tbody = document.getElementById('fixed-expense-table');
    const tfoot = document.getElementById('fixed-expense-table-foot');
    tbody.innerHTML = '';
    tfoot.innerHTML = '';
    tableData.filter(item => !item.isHidden).forEach(exp => {
        tbody.innerHTML += `<tr><td>${exp.dueDate}</td><td>${exp.description}</td><td class="amount">$${exp.amount.toFixed(2)}</td><td class="cell-center"><label class="status-toggle"><input type="checkbox" ${exp.status === 'paid' ? 'checked' : ''} onchange="toggleFixedExpenseStatus(${exp.id})"><span class="slider"></span></label><span class="status-label">${exp.status}</span></td><td class="cell-center">${renderActionBtn('fixedExpenses', exp.id)}</td></tr>`;
    });
    if (tableData.length > 1) {
        const total = tableData.reduce((sum, item) => sum + item.amount, 0);
        tfoot.innerHTML = `<tr><td colspan="2"><strong>Total</strong></td><td class="amount">$${total.toFixed(2)}</td><td colspan="2"></td></tr>`;
    }
}

function renderGoals() {
    const container = document.getElementById('goals-grid');
    const availableSavings = getAvailableSavings();
    container.innerHTML = '';
    data.goals.filter(g => !g.isHidden).forEach(goal => {
        const percentage = goal.targetAmount > 0 ? (goal.savedAmount / goal.targetAmount * 100) : 0;
        const avgContribution = goal.contributions.length > 0 ? goal.contributions.reduce((sum, c) => sum + c.amount, 0) / goal.contributions.length : 0;
        const card = document.createElement('div');
        card.className = 'goal-card glass';
        card.innerHTML = `
            <div class="goal-title">${goal.title}</div>
            <div class="goal-amount">$${goal.savedAmount.toFixed(2)} / $${goal.targetAmount.toFixed(2)}</div>
            <div class="progress-bar"><div class="progress-fill" style="width: ${Math.min(percentage, 100)}%;"></div></div>
            <div class="goal-details">${percentage.toFixed(1)}% Complete | Avg. Contribution: $${avgContribution.toFixed(2)}</div>
            <button class="btn btn-success" onclick="openSavingsModal(${goal.id})" ${availableSavings <= 0 ? 'disabled' : ''}>Add Savings</button>
            ${renderActionBtn('goals', goal.id)}
        `;
        container.appendChild(card);
    });
}
function getCategoryTotals(expenses) { return expenses.reduce((acc, expense) => { const key = `${expense.allocationCategory} - ${expense.category}`; acc[key] = (acc[key] || 0) + expense.amount; return acc; }, {}); }
function renderCategorySummary(expenses) { const grid = document.getElementById('category-summary-grid'); grid.innerHTML = ''; const totals = getCategoryTotals(expenses); const totalExpenses = Object.values(totals).reduce((sum, amount) => sum + amount, 0); for (const [category, amount] of Object.entries(totals)) { const percentage = totalExpenses > 0 ? (amount / totalExpenses * 100) : 0; const card = document.createElement('div'); card.className = 'allocation-item'; card.innerHTML = `<div style="font-weight: 500;">${category}</div><div class="allocation-amount" style="color: var(--text-primary); font-size: 1.5rem;">$${amount.toFixed(2)}</div><div>${percentage.toFixed(1)}% of total</div><div class="progress-bar"><div class="progress-fill" style="width: ${percentage}%;"></div></div>`; grid.appendChild(card); } }
function renderPieChart(expenses) { const ctx = document.getElementById('expensePieChart').getContext('2d'); const categoryTotals = getCategoryTotals(expenses); if (expensePieChart) expensePieChart.destroy(); expensePieChart = new Chart(ctx, { type: 'pie', data: { labels: Object.keys(categoryTotals), datasets: [{ data: Object.values(categoryTotals), backgroundColor: ['#ff6b6b', '#51cf66', '#ffd43b', '#4dabf7', '#748ffc', '#f06595', '#63e6be', '#fcc419'], borderColor: 'var(--glass-bg)', borderWidth: 2 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: 'white' } } } } }); }

// --- CATEGORY MANAGEMENT ---
function guessCategory() { const description = document.getElementById('expense-description').value.toLowerCase(); const categorySelect = document.getElementById('expense-category'); const allocationSelect = document.getElementById('expense-allocation-category'); const keywords = { 'Groceries': { allocation: 'Needs', words: ['grocery', 'market'] }, 'Transportation': { allocation: 'Needs', words: ['gas', 'uber', 'taxi', 'bus', 'metro'] }, 'Subscription': { allocation: 'Needs', words: ['netflix', 'spotify', 'prime'] }, 'Restaurant': { allocation: 'Wants', words: ['restaurant', 'cafe', 'pizza'] }, 'Entertainment': { allocation: 'Wants', words: ['movie', 'concert', 'bar'] }, 'Shopping': { allocation: 'Wants', words: ['shopping', 'clothes', 'amazon'] }, 'Healthcare': { allocation: 'Needs', words: ['pharmacy', 'doctor'] }, }; for (const category in keywords) { if (keywords[category].words.some(word => description.includes(word))) { categorySelect.value = category; allocationSelect.value = keywords[category].allocation; return; } } }
function populateCategoryDropdown() { const select = document.getElementById('expense-category'); select.innerHTML = '<option value="">Select Sub-Category</option>'; data.categories.forEach(cat => { const option = document.createElement('option'); option.value = cat; option.textContent = cat; select.appendChild(option); }); }
function renderCategoryManager() { const list = document.getElementById('category-manager-list'); list.innerHTML = ''; data.categories.forEach((cat, index) => { const li = document.createElement('li'); li.textContent = cat; const deleteBtn = document.createElement('button'); deleteBtn.textContent = '✖'; deleteBtn.className = 'btn btn-danger action-btn'; deleteBtn.onclick = () => deleteCategory(index); li.appendChild(deleteBtn); list.appendChild(li); }); }
function addCategory() { const input = document.getElementById('new-category-name'); const newCat = input.value.trim(); if (newCat && !data.categories.includes(newCat)) { data.categories.push(newCat); saveData(); renderCategoryManager(); populateCategoryDropdown(); input.value = ''; } }
function deleteCategory(index) { if (confirm(`Are you sure you want to delete the category "${data.categories[index]}"?`)) { data.categories.splice(index, 1); saveData(); renderCategoryManager(); populateCategoryDropdown(); } }

// --- HIDDEN ITEMS & EDIT LOGIC ---
function toggleHidden(type, id) {
    const item = data[type].find(i => i.id === id);
    if (item) {
        item.isHidden = !item.isHidden;
        saveData();
        renderAll();
    }
}
function renderHiddenTables() {
    const hiddenExpenses = data.expenses.filter(item => item.isHidden);
    const hiddenIncome = data.income.filter(item => item.isHidden);
    const expTbody = document.getElementById('hidden-expense-table');
    const incTbody = document.getElementById('hidden-income-table');
    expTbody.innerHTML = '';
    incTbody.innerHTML = '';
    hiddenExpenses.forEach(item => {
        expTbody.innerHTML += `<tr><td>${new Date(item.date).toLocaleDateString()}</td><td>${item.allocationCategory} - ${item.category}</td><td>${item.description}</td><td class="amount">$${item.amount.toFixed(2)}</td><td class="cell-center">${renderActionBtn('expenses', item.id)}</td></tr>`;
    });
    hiddenIncome.forEach(item => {
        incTbody.innerHTML += `<tr><td>${new Date(item.date).toLocaleDateString()}</td><td>${item.source}</td><td>${item.description}</td><td class="amount">$${item.amount.toFixed(2)}</td><td class="cell-center">${renderActionBtn('income', item.id)}</td></tr>`;
    });

    const hiddenDebts = data.debts.filter(item => item.isHidden);
    const debtTbody = document.getElementById('hidden-debt-table');
    debtTbody.innerHTML = '';
    hiddenDebts.forEach(item => {
        const remaining = item.originalAmount - item.paidAmount;
        debtTbody.innerHTML += `<tr><td>${item.creditor}</td><td>${item.description}</td><td class="amount">$${remaining.toFixed(2)}</td><td class="cell-center">${renderActionBtn('debts', item.id)}</td></tr>`;
    });

    const hiddenFixedExpenses = data.fixedExpenses.filter(item => item.isHidden);
    const fixedExpTbody = document.getElementById('hidden-fixed-expense-table');
    fixedExpTbody.innerHTML = '';
    hiddenFixedExpenses.forEach(item => {
        fixedExpTbody.innerHTML += `<tr><td>${item.dueDate}</td><td>${item.description}</td><td class="amount">$${item.amount.toFixed(2)}</td><td class="cell-center">${renderActionBtn('fixedExpenses', item.id)}</td></tr>`;
    });

    const hiddenGoals = data.goals.filter(item => item.isHidden);
    const goalTbody = document.getElementById('hidden-goal-table');
    goalTbody.innerHTML = '';
    hiddenGoals.forEach(item => {
        goalTbody.innerHTML += `<tr><td>${item.title}</td><td>$${item.targetAmount.toFixed(2)}</td><td class="amount">$${item.savedAmount.toFixed(2)}</td><td class="cell-center">${renderActionBtn('goals', item.id)}</td></tr>`;
    });
}
function openEditModal(type, id) {
    currentActionItem = { type, id };
    const item = data[type].find(i => i.id === id);
    const form = document.getElementById('edit-form');
    const title = document.getElementById('edit-modal-title');
    form.innerHTML = ''; // Clear previous form

    let formContent = '';
    if (type === 'income') {
        title.textContent = 'Edit Income';
        formContent = `
            <div class="form-group"><label>Date</label><input type="date" id="edit-income-date" value="${item.date}" required></div>
            <div class="form-group"><label>Source</label><input type="text" id="edit-income-source" value="${item.source}" required></div>
            <div class="form-group"><label>Description</label><input type="text" id="edit-income-description" value="${item.description}"></div>
            <div class="form-group"><label>Amount</label><input type="number" step="0.01" id="edit-income-amount" value="${item.amount}" required></div>
        `;
    } else if (type === 'expenses') {
        title.textContent = 'Edit Expense';
        formContent = `
            <div class="form-group"><label>Date</label><input type="date" id="edit-expense-date" value="${item.date}" required></div>
            <div class="form-group"><label>Allocation Category</label><select id="edit-expense-allocation-category" required>${['Needs', 'Wants', 'Savings & Debt'].map(o => `<option value="${o}" ${item.allocationCategory === o ? 'selected' : ''}>${o}</option>`).join('')}</select></div>
            <div class="form-group"><label>Sub-Category</label><select id="edit-expense-category" required>${data.categories.map(o => `<option value="${o}" ${item.category === o ? 'selected' : ''}>${o}</option>`).join('')}</select></div>
            <div class="form-group"><label>Description</label><input type="text" id="edit-expense-description" value="${item.description}" required></div>
            <div class="form-group"><label>Amount</label><input type="number" step="0.01" id="edit-expense-amount" value="${item.amount}" required></div>
        `;
    } else if (type === 'debts') {
        title.textContent = 'Edit Debt';
        formContent = `
            <div class="form-group"><label>Owed To</label><input type="text" id="edit-debt-creditor" value="${item.creditor}" required></div>
            <div class="form-group"><label>Description</label><input type="text" id="edit-debt-description" value="${item.description}" required></div>
            <div class="form-group"><label>Original Amount</label><input type="number" step="0.01" id="edit-debt-original" value="${item.originalAmount}" required></div>
        `;
    } else if (type === 'fixedExpenses') {
        title.textContent = 'Edit Fixed Expense';
        formContent = `
            <div class="form-group"><label>Due Date (Day)</label><input type="number" min="1" max="31" id="edit-fixed-due-date" value="${item.dueDate}" required></div>
            <div class="form-group"><label>Description</label><input type="text" id="edit-fixed-description" value="${item.description}" required></div>
            <div class="form-group"><label>Amount</label><input type="number" step="0.01" id="edit-fixed-amount" value="${item.amount}" required></div>
        `;
    } else if (type === 'goals') {
        title.textContent = 'Edit Goal';
        formContent = `
            <div class="form-group"><label>Goal Title</label><input type="text" id="edit-goal-title" value="${item.title}" required></div>
            <div class="form-group"><label>Target Amount</label><input type="number" step="0.01" id="edit-goal-amount" value="${item.targetAmount}" required></div>
        `;
    }
    
    form.innerHTML = formContent + `<button type="submit" class="btn btn-primary">Save Changes</button>`;
    openModal('edit-modal');
}

function saveEdit(e) {
    e.preventDefault();
    const { type, id } = currentActionItem;
    const item = data[type].find(i => i.id === id);

    if (type === 'income') {
        item.date = document.getElementById('edit-income-date').value;
        item.source = document.getElementById('edit-income-source').value;
        item.description = document.getElementById('edit-income-description').value;
        item.amount = parseFloat(document.getElementById('edit-income-amount').value);
    } else if (type === 'expenses') {
        item.date = document.getElementById('edit-expense-date').value;
        item.allocationCategory = document.getElementById('edit-expense-allocation-category').value;
        item.category = document.getElementById('edit-expense-category').value;
        item.description = document.getElementById('edit-expense-description').value;
        item.amount = parseFloat(document.getElementById('edit-expense-amount').value);
    } else if (type === 'debts') {
        item.creditor = document.getElementById('edit-debt-creditor').value;
        item.description = document.getElementById('edit-debt-description').value;
        item.originalAmount = parseFloat(document.getElementById('edit-debt-original').value);
    } else if (type === 'fixedExpenses') {
        item.dueDate = parseInt(document.getElementById('edit-fixed-due-date').value);
        item.description = document.getElementById('edit-fixed-description').value;
        item.amount = parseFloat(document.getElementById('edit-fixed-amount').value);
    } else if (type === 'goals') {
        item.title = document.getElementById('edit-goal-title').value;
        item.targetAmount = parseFloat(document.getElementById('edit-goal-amount').value);
    }

    saveData();
    renderAll();
    closeModal('edit-modal');
}

// --- DATA & TIME FILTERING ---
function clearDataSection(section) {
    if (confirm(`Are you sure you want to clear all data from "${section}"? This cannot be undone.`)) {
        data[section] = [];
        saveData();
        renderAll();
    }
}
function resetAllData() {
    if (confirm("Are you sure you want to reset ALL application data? This will restore the initial sample data and cannot be undone.")) {
        localStorage.removeItem('unifiedFinanceDataV6'); // Clear saved data
        data = JSON.parse(JSON.stringify(initialData)); // Load initial empty structure
        saveData(); // Save the empty structure
        window.location.reload(); // Reload the page to ensure a clean state
    }
}
function setTimeFilter(period) {
    data.settings.timePeriod = period;
    saveData();
    renderAll();
}

function getFilteredData() {
    try {
        console.log('getFilteredData called, data:', data);
        const period = data.settings.timePeriod || 'month';
        console.log('Time period:', period);
        const now = new Date();
        let startDate = new Date();

        if (period === 'month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (period === '14days') {
            startDate.setDate(now.getDate() - 14);
        } else if (period === '30days') {
            startDate.setDate(now.getDate() - 30);
        } else { // 'all'
            const result = {
                income: data.income.filter(i => !i.isHidden),
                expenses: data.expenses.filter(e => !e.isHidden),
                debts: data.debts.filter(d => !d.isHidden),
                fixedExpenses: data.fixedExpenses.filter(f => !f.isHidden),
            };
            console.log('getFilteredData returning all data:', result);
            return result;
        }
        
        const filterByDate = item => new Date(item.date) >= startDate;
        
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const filterFixed = item => {
            if (period === 'month') {
                return true; 
            } else {
                const dueDateThisMonth = new Date(currentYear, currentMonth, item.dueDate);
                return dueDateThisMonth >= startDate;
            }
        };

        const result = {
            income: data.income.filter(i => !i.isHidden && filterByDate(i)),
            expenses: data.expenses.filter(e => !e.isHidden && filterByDate(e)),
            debts: data.debts.filter(d => !d.isHidden), // Debts are not time-filtered
            fixedExpenses: data.fixedExpenses.filter(f => !f.isHidden && filterFixed(f)),
        };
        
        console.log('getFilteredData returning filtered data:', result);
        return result;
    } catch (error) {
        console.error('Error in getFilteredData:', error);
        throw error;
    }
}

// Add function to render recent expenses log
function renderRecentExpensesLog() {
    const logContainer = document.getElementById('recent-expenses-log');
    if (!logContainer) return;

    const filteredData = getFilteredData();
    const allTransactions = [
        ...filteredData.income.map(item => ({ ...item, type: 'income' })),
        ...filteredData.expenses.map(item => ({ ...item, type: 'expense' }))
    ];

    // Sort by date (most recent first) and take last 10
    const recentTransactions = allTransactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);

    if (recentTransactions.length === 0) {
        logContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No transactions yet. Add some income or expenses to get started!</p>';
        return;
    }

    logContainer.innerHTML = recentTransactions.map(item => {
        const isExpense = item.type === 'expense';
        const category = isExpense ? `${item.allocationCategory} - ${item.category}` : 'Income';
        const amount = isExpense ? -item.amount : item.amount;
        const amountClass = isExpense ? 'expense' : 'income';
        const amountSign = isExpense ? '-' : '+';
        
        return `
            <div class="expense-log-item ${item.type}">
                <div class="expense-log-details">
                    <div class="expense-log-category">${category}</div>
                    <div class="expense-log-description">${item.description || item.source}</div>
                </div>
                <div class="expense-log-amount ${amountClass}">${amountSign}$${Math.abs(amount).toFixed(2)}</div>
                <div class="expense-log-date">${new Date(item.date).toLocaleDateString()}</div>
            </div>
        `;
    }).join('');
}

// Add function to update income overview stats
function updateIncomeOverview() {
    const totalIncomeValue = document.getElementById('total-income-value');
    const monthlyIncomeValue = document.getElementById('monthly-income-value');
    const incomeSourcesCount = document.getElementById('income-sources-count');
    
    if (!totalIncomeValue || !monthlyIncomeValue || !incomeSourcesCount) return;
    
    const allIncome = data.income.filter(item => !item.isHidden);
    const totalIncome = allIncome.reduce((sum, item) => sum + item.amount, 0);
    
    // Calculate monthly income
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyIncome = allIncome
        .filter(item => new Date(item.date) >= startOfMonth)
        .reduce((sum, item) => sum + item.amount, 0);
    
    // Count unique sources
    const uniqueSources = new Set(allIncome.map(item => item.source)).size;
    
    totalIncomeValue.textContent = `$${totalIncome.toFixed(2)}`;
    monthlyIncomeValue.textContent = `$${monthlyIncome.toFixed(2)}`;
    incomeSourcesCount.textContent = uniqueSources;
}

// Add exportIncomeData function
function exportIncomeData() {
    try {
        const incomeData = data.income.filter(item => !item.isHidden);
        const csvContent = [
            ['Date', 'Source', 'Main Category', 'Sub-Category', 'Description', 'Amount'],
            ...incomeData.map(item => [
                item.date,
                item.source,
                item.mainCategory || 'Uncategorized',
                item.subCategory || '',
                item.description || '',
                item.amount.toFixed(2)
            ])
        ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `income-data-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting income data:', error);
        alert('Error exporting income data. Please check the console for details.');
    }
}

// Add missing function to update active time filter button
function updateActiveTimeFilterButton() {
    const timeFilterControls = document.getElementById('time-filter-controls');
    if (!timeFilterControls) return;
    
    const buttons = timeFilterControls.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.onclick && btn.onclick.toString().includes(data.settings.timePeriod || 'month')) {
            btn.classList.add('active');
        }
    });
}