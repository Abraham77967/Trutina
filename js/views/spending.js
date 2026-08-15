const renderSpending = () => {
    const container = document.createElement('div');
    const calc = store.getCalculations();
    
    const totalLimit = store.data.budgets.reduce((sum, b) => sum + b.limit, 0);
    const totalSpent = calc.spentThisMonth;
    const totalPercent = totalLimit > 0 ? Math.min(Math.round((totalSpent / totalLimit) * 100), 100) : 0;
    const amountLeft = Math.max(totalLimit - totalSpent, 0);
    
    // Progress bar color logic
    const progressColor = totalPercent > 90 ? 'var(--color-red)' : (totalPercent > 75 ? 'var(--color-yellow)' : 'var(--color-green)');

    const getIcon = (category) => {
        const budget = store.data.budgets.find(b => b.category === category);
        if (budget && budget.icon && window.AppIcons[budget.icon]) {
            return window.AppIcons[budget.icon];
        }
        return window.AppIcons['box'] || `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`;
    };

    container.innerHTML = `
        <div class="top-bar">
            <div class="page-title"><span class="page-title-num">02</span> SPENDING</div>
            <div class="date-selector">AUGUST 2026 <span>▼</span></div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; align-items: start;">
            <!-- LEFT COLUMN -->
            <div>
                <!-- MONTHLY BUDGET -->
                <div class="panel mb-2">
                    <div class="panel-header mb-2">
                        <span class="text-label" style="display:flex; align-items:center; gap:0.5rem; letter-spacing: 2px;">
                            MONTHLY BUDGET <span class="status-light status-green" style="margin:0;"></span>
                        </span>
                    </div>
                    <div style="display: flex; align-items: baseline; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <div class="display-amount" style="font-size: 3rem;">${formatMoney(amountLeft)}</div>
                        <div style="color: var(--color-green); font-weight: 600; font-size: 1rem; letter-spacing: 1px;">LEFT</div>
                    </div>
                    <div class="amount-subtitle" style="font-size: 1rem; margin-bottom: 1.5rem;">of ${formatMoney(totalLimit)} budget</div>
                    
                    <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                        <span>${formatMoney(totalSpent)} spent &middot; ${totalPercent}% used</span>
                    </div>
                    <div class="progress-bar-container" style="height: 4px; margin-top: 0; background-color: #E5E5E5; border-radius: 2px; overflow: hidden;">
                        <div class="progress-bar-fill" style="width: ${totalPercent}%; background-color: ${progressColor}; border-radius: 2px;"></div>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--text-secondary); margin-top: 2rem;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        22 days left
                    </div>
                </div>

                <!-- SPENDING PLAN -->
                <div class="panel">
                    <div class="panel-header" style="margin-bottom: 1.5rem;">
                        <span class="text-label" style="letter-spacing: 2px;">SPENDING PLAN</span>
                        <span class="text-label" onclick="openEditBudgetsModal()" style="display:flex; align-items:center; gap:0.25rem; letter-spacing: 1px; cursor: pointer; user-select: none;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                            EDIT BUDGETS
                        </span>
                    </div>
                    <div class="list-container">
                        ${store.data.budgets.map(budget => {
                            const spent = store.getCategorySpending(budget.category);
                            const hasLimit = budget.limit > 0;
                            
                            if (hasLimit) {
                                const percent = Math.round((spent / budget.limit) * 100);
                                const fillPercent = Math.min(percent, 100);
                                const bColor = percent > 90 ? 'var(--color-red)' : (percent > 75 ? 'var(--color-yellow)' : 'var(--color-green)');
                                const left = Math.max(budget.limit - spent, 0);
                                
                                const leftColor = percent > 90 ? 'var(--text-secondary)' : 'var(--color-green)';
                                const iconBg = percent > 90 ? 'rgba(0,0,0,0.05)' : '#E9F0EA';
                                const iconColor = percent > 90 ? 'var(--text-secondary)' : 'var(--color-green)';

                                return `
                                <div style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
                                    <div style="width: 32px; height: 32px; border-radius: 50%; background-color: ${iconBg}; color: ${iconColor}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                        ${getIcon(budget.category)}
                                    </div>
                                    
                                    <div style="width: 100px; flex-shrink: 0;">
                                        <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${budget.category}</div>
                                        <div style="font-size: 0.75rem; color: ${leftColor};">$${left.toFixed(0)} left</div>
                                    </div>
                                    
                                    <div style="flex-grow: 1; display: flex; flex-direction: column; justify-content: center; margin: 0 0.5rem;">
                                        <div class="progress-bar-container" style="margin:0; height:4px; background-color: #E5E5E5; border-radius: 2px;">
                                            <div class="progress-bar-fill" style="width: ${fillPercent}%; height: 100%; background-color: ${bColor}; border-radius: 2px;"></div>
                                        </div>
                                    </div>

                                    <div style="width: 85px; text-align: right; flex-shrink: 0;">
                                        <div style="font-size: 0.8rem; font-weight: 500; color: var(--text-primary);">$${spent.toFixed(0)} <span style="color: var(--text-secondary); font-size: 0.7rem;">/ $${budget.limit.toFixed(0)}</span></div>
                                    </div>
                                </div>
                                `;
                            } else {
                                // No limit, just tracking
                                return `
                                <div style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
                                    <div style="width: 32px; height: 32px; border-radius: 50%; background-color: #F0F4F8; color: var(--text-primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                        ${getIcon(budget.category)}
                                    </div>
                                    
                                    <div style="flex-grow: 1;">
                                        <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">${budget.category}</div>
                                        <div style="font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">Tracking Only</div>
                                    </div>

                                    <div style="text-align: right; flex-shrink: 0;">
                                        <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">$${spent.toFixed(2)}</div>
                                        <div style="font-size: 0.7rem; color: var(--text-secondary);">spent</div>
                                    </div>
                                </div>
                                `;
                            }
                        }).join('')}
                    </div>
                </div>
            </div>

            <!-- RIGHT COLUMN -->
            <div>
                <!-- QUICK RECORD -->
                <div class="panel mb-2">
                    <div class="panel-header mb-1">
                        <span class="text-label" style="letter-spacing: 2px;">QUICK RECORD</span>
                    </div>
                    <form id="quick-record-form" onsubmit="handleQuickRecord(event)">
                        <div class="grid-2 mb-1">
                            <div>
                                <label class="form-label" style="text-transform: none; letter-spacing: normal;">Amount</label>
                                <input type="number" id="qr-amount" class="form-input" placeholder="$0.00" step="0.01" required>
                            </div>
                            <div>
                                <label class="form-label" style="text-transform: none; letter-spacing: normal;">Item / Name</label>
                                <input type="text" id="qr-merchant" class="form-input" placeholder="What did you buy?" required>
                            </div>
                        </div>
                        <div class="grid-2 mb-1">
                            <div>
                                <label class="form-label" style="text-transform: none; letter-spacing: normal;">Category</label>
                                <div class="custom-select" id="qr-category-select" style="position: relative;">
                                    <input type="hidden" id="qr-category" value="${store.data.budgets.length > 0 ? store.data.budgets[0].category : 'Other'}" required>
                                    <div class="form-input custom-select-trigger" style="display: flex; align-items: center; cursor: pointer;">
                                        <span class="selected-icon" style="margin-right: 0.5rem; display: flex; color: var(--text-primary);">
                                            ${store.data.budgets.length > 0 ? getIcon(store.data.budgets[0].category) : window.AppIcons['box']}
                                        </span>
                                        <span class="selected-text" style="flex-grow: 1;">${store.data.budgets.length > 0 ? store.data.budgets[0].category : 'Other'}</span>
                                        <span style="font-size: 0.8rem; opacity: 0.6;">▼</span>
                                    </div>
                                    <div class="custom-select-options" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: var(--bg-color); border: 1px solid var(--border-color); border-radius: 4px; max-height: 200px; overflow-y: auto; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-top: 4px;">
                                        ${store.data.budgets.map(b => `
                                        <div class="custom-select-option" data-value="${b.category}" style="padding: 0.5rem; display: flex; align-items: center; cursor: pointer; border-bottom: 1px solid var(--border-color);">
                                            <span style="margin-right: 0.5rem; display: flex;">${getIcon(b.category)}</span>
                                            <span>${b.category}</span>
                                        </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label class="form-label" style="text-transform: none; letter-spacing: normal;">Date</label>
                                <input type="text" id="qr-date" class="form-input" placeholder="Select Date..." required>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 0.5rem; letter-spacing: 2px;">+ RECORD SPENDING</button>
                    </form>
                </div>

                <!-- RECENT SPENDING -->
                <div class="panel">
                    <div class="panel-header" style="margin-bottom: 1.5rem;">
                        <span class="text-label" style="letter-spacing: 2px;">RECENT SPENDING</span>
                    </div>
                    
                    <div style="display:flex; gap:1rem; margin-bottom: 1.5rem;">
                        <div style="width: 160px;">
                            <select class="form-input">
                                <option>All categories</option>
                                ${store.data.budgets.map(b => `<option>${b.category}</option>`).join('')}
                            </select>
                        </div>
                        <div style="width: 140px;">
                            <select class="form-input">
                                <option>This month</option>
                                <option>Last month</option>
                                <option>This year</option>
                                <option>All time</option>
                            </select>
                        </div>
                    </div>

                    <div class="list-container">
                        ${renderRecentSpendingList()}
                    </div>
                    
                    <a href="#/history" class="panel-footer-link" style="margin-top: 1.5rem; justify-content: space-between; display: flex; text-decoration: none;">
                        VIEW ALL TRANSACTIONS <span>></span>
                    </a>
                </div>
            </div>
        </div>
    `;

    // Set today's date in quick record after render
    setTimeout(() => {
        if (window.flatpickr) {
            flatpickr('#qr-date', {
                defaultDate: "today",
                dateFormat: "Y-m-d",
                monthSelectorType: "static",
                onReady: function(selectedDates, dateStr, instance) {
                    const btnContainer = document.createElement('div');
                    btnContainer.className = 'flatpickr-action-btns';
                    
                    const clearBtn = document.createElement('button');
                    clearBtn.className = 'flatpickr-action-btn';
                    clearBtn.textContent = 'Clear';
                    clearBtn.type = 'button';
                    clearBtn.addEventListener('click', () => instance.clear());
                    
                    const todayBtn = document.createElement('button');
                    todayBtn.className = 'flatpickr-action-btn';
                    todayBtn.textContent = 'Today';
                    todayBtn.type = 'button';
                    todayBtn.addEventListener('click', () => {
                        instance.setDate(new Date());
                        instance.close();
                    });
                    
                    btnContainer.appendChild(clearBtn);
                    btnContainer.appendChild(todayBtn);
                    instance.calendarContainer.appendChild(btnContainer);
                }
            });
        } else {
            const dateInput = document.getElementById('qr-date');
            if (dateInput) {
                dateInput.value = new Date().toISOString().split('T')[0];
            }
        }
        
        // Custom Select Logic for Quick Record
        const qrSelect = document.getElementById('qr-category-select');
        if (qrSelect) {
            const trigger = qrSelect.querySelector('.custom-select-trigger');
            const optionsPanel = qrSelect.querySelector('.custom-select-options');
            const hiddenInput = document.getElementById('qr-category');
            
            trigger.addEventListener('click', () => {
                optionsPanel.style.display = optionsPanel.style.display === 'none' ? 'block' : 'none';
            });
            
            qrSelect.querySelectorAll('.custom-select-option').forEach(opt => {
                opt.addEventListener('click', (e) => {
                    hiddenInput.value = e.currentTarget.dataset.value;
                    trigger.querySelector('.selected-icon').innerHTML = e.currentTarget.children[0].innerHTML;
                    trigger.querySelector('.selected-text').textContent = e.currentTarget.children[1].textContent;
                    optionsPanel.style.display = 'none';
                });
            });
            
            document.addEventListener('click', (e) => {
                if (!e.target.closest('#qr-category-select')) {
                    optionsPanel.style.display = 'none';
                }
            });
        }
        
        initCustomSelects(container);
    }, 0);

    return container;
};

// Helper for rendering the recent spending list grouped by date
const renderRecentSpendingList = () => {
    // Sort transactions by date descending
    const sorted = [...store.data.spending].sort((a,b) => new Date(b.date) - new Date(a.date));
    
    // Group by date
    const groups = {};
    sorted.forEach(tx => {
        if (!groups[tx.date]) groups[tx.date] = [];
        groups[tx.date].push(tx);
    });
    
    let html = '';
    
    // Iterate over groups
    for (const [dateStr, txs] of Object.entries(groups)) {
        // Date Header
        const dateObj = new Date(dateStr);
        // Correct time zone offset for accurate display
        dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset());
        const displayDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
        
        html += `<div style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin: 1.5rem 0 0.5rem 0;">${displayDate}</div>`;
        
        // Transactions
        txs.forEach(tx => {
            html += `
                <div style="display:grid; grid-template-columns: 1fr 100px 80px; align-items:center; gap:1rem; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick='openExpenseModal(${JSON.stringify(tx).replace(/'/g, "&#39;")})'>
                    <div style="font-size: 0.85rem; font-weight: 500;">${tx.description}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary); text-align: right;">${tx.category}</div>
                    <div style="font-size: 0.85rem; font-weight: 600; text-align:right;">-$${tx.amount.toFixed(2)}</div>
                </div>
            `;
        });
    }
    
    return html;
};

// Global handler for Quick Record form submission
window.handleQuickRecord = (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('qr-amount').value);
    const merchant = document.getElementById('qr-merchant').value;
    const category = document.getElementById('qr-category').value;
    const date = document.getElementById('qr-date').value;
    
    if (amount && merchant && category && date) {
        store.addExpense({
            amount,
            description: merchant,
            category,
            date
        });
        
        // Re-render the view
        if (window.app && window.app.handleRoute) {
            window.app.handleRoute();
        }
    }
};
