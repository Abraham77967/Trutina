const renderOverview = () => {
    const container = document.createElement('div');
    const calc = store.getCalculations();
    
    // Sort upcoming bills
    const upcomingBills = store.data.bills
        .filter(b => !b.paid)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 4); // Only show top 4

    const formatDateShort = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }); 
    };

    const recentTransactions = [
        ...store.data.spending.map(s => ({ ...s, type: 'expense' })),
        ...store.data.income.filter(i => i.status === 'RECEIVED').map(i => ({ ...i, type: 'income', category: 'Income' }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    const planItems = store.data.wishlist.filter(w => w.inPlan);
    const taxRate = store.data.settings?.taxRate || 0;
    const planCost = planItems.reduce((sum, item) => sum + item.price * (1 + taxRate / 100), 0);
    const savingsPercentPlan = planCost > 0 ? Math.min(Math.round((calc.savingsAmount / planCost) * 100), 100) : 0;

    container.innerHTML = `
        <div class="top-bar">
            <div class="page-title"><span class="page-title-num">01</span> OVERVIEW</div>
            <div class="date-selector">AUGUST 2026 <span>▼</span></div>
        </div>
        
        <div class="grid-4 mb-2">
            <div class="panel">
                <div class="panel-header">
                    <span class="text-label">AVAILABLE</span>
                    <span class="status-light status-green"></span>
                </div>
                <div class="display-amount">${formatMoney(calc.available)}</div>
                <div class="amount-subtitle">Ready to save or budget</div>
            </div>
            
            <div class="panel">
                <div class="panel-header">
                    <span class="text-label">INCOME</span>
                    <span class="status-light status-green"></span>
                </div>
                <div class="display-amount">${formatMoney(calc.incomeReceived)}</div>
                <div class="amount-subtitle">Received this month</div>
            </div>
            
            <div class="panel">
                <div class="panel-header">
                    <span class="text-label">SPENDING</span>
                    <span class="status-light status-yellow"></span>
                </div>
                <div class="display-amount">${formatMoney(calc.spentThisMonth)}</div>
                <div class="amount-subtitle">of ${formatMoney(calc.spentLimit)} budget</div>
                <div class="progress-bar-container" style="margin-top: 1rem;">
                    <div class="progress-bar-fill fill-yellow" style="width: ${calc.spentPercent}%"></div>
                </div>
            </div>
            
            <div class="panel">
                <div class="panel-header">
                    <span class="text-label">SAVINGS</span>
                    <span class="status-light status-green"></span>
                </div>
                <div class="display-amount">${formatMoney(calc.savingsAmount)}</div>
                <div class="amount-subtitle">Wishlist savings</div>
            </div>
        </div>

        <div class="grid-3 mb-2">
            <div class="panel" style="grid-column: span 1;">
                <div class="panel-header">
                    <span class="text-label">CASH FLOW</span>
                    <span class="text-label" style="text-transform:none;">This Month ▼</span>
                </div>
                <div style="height: 200px; width: 100%; position: relative;">
                    <canvas id="cashFlowChart"></canvas>
                </div>
                <div style="display:flex; gap:1rem; font-size:0.7rem; color:var(--text-secondary); margin-top: 1rem; justify-content: center;">
                    <div><span class="status-light status-green"></span> Income</div>
                    <div><span class="status-light status-red"></span> Expenses</div>
                </div>
            </div>

            <div class="panel" style="grid-column: span 1;">
                <div class="panel-header" style="margin-bottom: 0;">
                    <span class="text-label">UPCOMING BILLS</span>
                </div>
                <div class="list-container" style="flex-grow: 1;">
                    ${upcomingBills.length > 0 ? upcomingBills.map(bill => `
                        <div class="list-item" style="display: flex; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid var(--border-color);">
                            <div>
                                <div style="font-size: 0.9rem; font-weight: 600;">${bill.name}</div>
                            </div>
                            <div style="display: flex; gap: 1rem; align-items: center;">
                                <div style="font-size: 0.85rem; color: var(--text-secondary);">${formatDateShort(bill.dueDate)}</div>
                                <div style="font-size: 0.9rem; font-weight: 600; width: 60px; text-align: right;">${formatMoney(bill.amount)}</div>
                            </div>
                        </div>
                    `).join('') : '<div style="padding: 1rem 0; color: var(--text-secondary);">No upcoming bills!</div>'}
                </div>
                <a href="#/bills" class="panel-footer-link" style="margin-top: 1rem;">View All Bills <span>></span></a>
            </div>

            <div class="panel" style="grid-column: span 1;">
                <div class="panel-header">
                    <span class="text-label">BUDGET USAGE</span>
                </div>
                <div class="list-container" style="flex-grow: 1;">
                    ${store.data.budgets.slice(0, 5).map(budget => {
                        const spent = store.getCategorySpending(budget.category);
                        const percent = budget.limit > 0 ? Math.min((spent / budget.limit) * 100, 100) : 0;
                        return `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
                            <div style="font-size: 0.9rem; font-weight: 600;">${budget.category}</div>
                            <div style="display: flex; gap: 1rem; align-items: center; width: 60%;">
                                <div class="progress-bar-container" style="flex-grow: 1; margin: 0; height: 6px; background: #eee; border-radius: 3px;">
                                    <div class="progress-bar-fill fill-yellow" style="width: ${percent}%; height: 100%; border-radius: 3px;"></div>
                                </div>
                                <div style="font-size: 0.8rem; color: var(--text-secondary); width: 35px; text-align: right;">${Math.round(percent)}%</div>
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
                <a href="#/spending" class="panel-footer-link" style="margin-top: 1rem;">Manage Budgets <span>></span></a>
            </div>
        </div>

        <div class="grid-2 mb-2">
            <div class="panel">
                <div class="panel-header" style="margin-bottom: 0;">
                    <span class="text-label">RECENT TRANSACTIONS</span>
                </div>
                <div class="list-container" style="flex-grow: 1;">
                    ${recentTransactions.length > 0 ? recentTransactions.map(tx => `
                        <div class="list-item" style="display: flex; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid var(--border-color);">
                            <div style="display: flex; gap: 1rem; align-items: center;">
                                <div style="font-size: 0.85rem; color: var(--text-secondary); width: 45px;">${formatDateShort(tx.date)}</div>
                                <div>
                                    <div style="font-size: 0.9rem; font-weight: 600;">${tx.description || tx.name}</div>
                                    <div style="font-size: 0.75rem; color: var(--text-secondary);">${tx.category}</div>
                                </div>
                            </div>
                            <div style="font-size: 0.9rem; font-weight: 600; color: ${tx.type === 'income' ? 'var(--color-green)' : 'inherit'};">
                                ${tx.type === 'income' ? '+' : '-'}${formatMoney(tx.amount)}
                            </div>
                        </div>
                    `).join('') : '<div style="padding: 1rem 0; color: var(--text-secondary);">No recent transactions.</div>'}
                </div>
                <a href="#/history" class="panel-footer-link" style="margin-top: 1rem;">View History <span>></span></a>
            </div>

            <div class="panel">
                <div class="panel-header">
                    <span class="text-label">WISHLIST PLAN</span>
                    <span class="status-light status-yellow"></span>
                </div>
                <div style="flex-grow: 1;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.8rem;">
                        <div><span style="color: var(--color-green); font-weight: 600;">${formatMoney(calc.savingsAmount)}</span> saved</div>
                        <div style="color: var(--text-secondary);">${formatMoney(planCost)} total ${taxRate > 0 ? '<span style="font-size:0.75em;">(incl. tax)</span>' : ''}</div>
                    </div>
                    <div class="progress-bar-container" style="height: 6px; background: #eee; border-radius: 3px; margin-bottom: 1.5rem;">
                        <div class="progress-bar-fill fill-green" style="width: ${savingsPercentPlan}%; height: 100%; border-radius: 3px;"></div>
                    </div>
                    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                        ${planItems.slice(0, 3).map(item => `
                            <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; width: 80px;">
                                <img src="${item.img}" style="width: 60px; height: 60px; object-fit: contain; border: 1px solid var(--border-color); border-radius: 8px; padding: 4px; background: white;" />
                                <div style="font-size: 0.7rem; font-weight: 600; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%;">${item.name}</div>
                                <div style="font-size: 0.7rem; color: var(--text-secondary);">${formatMoney(item.price)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <a href="#/wishlist" class="panel-footer-link" style="margin-top: auto;">Manage Wishlist <span>></span></a>
            </div>
        </div>

    `;
    
    // Initialize chart after container is in DOM
    setTimeout(() => {
        const ctx = document.getElementById('cashFlowChart');
        if (ctx) {
            let chartLabels = ['Aug 1', 'Aug 8', 'Aug 15', 'Aug 22', 'Aug 29'];
            let chartIncome = [300, 150, 400, 600, 150];
            let chartExpenses = [-200, -50, -250, -300, -150];

            if (store.mode === 'user') {
                chartLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
                chartIncome = [0, 0, 0, 0];
                chartExpenses = [0, 0, 0, 0];
                
                let totalInc = 0; let totalExp = 0;
                store.data.income.forEach(i => { if (i.status === 'RECEIVED') totalInc += i.amount; });
                store.data.spending.forEach(s => { totalExp += s.amount; });
                store.data.bills.forEach(b => { if (b.paid) totalExp += b.amount; }); // Include paid bills in cash flow expenses
                
                if (totalInc > 0 || totalExp > 0) {
                    chartIncome[3] = totalInc;
                    chartExpenses[3] = -totalExp;
                }
            }

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: chartLabels,
                    datasets: [
                        {
                            label: 'Income',
                            data: chartIncome,
                            backgroundColor: '#3D7847',
                            barThickness: 4
                        },
                        {
                            label: 'Expenses',
                            data: chartExpenses,
                            backgroundColor: '#B34E45',
                            barThickness: 4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: {
                            ticks: { 
                                callback: function(value) { return '$' + value; },
                                font: { size: 10, family: "'Inter', sans-serif" }
                            },
                            grid: { color: '#E2DFD6', drawBorder: false }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { font: { size: 10, family: "'Inter', sans-serif" } }
                        }
                    }
                }
            });
        }
    }, 100);

    return container;
};
