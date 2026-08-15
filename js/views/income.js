const renderIncome = () => {
    const container = document.createElement('div');
    const calc = store.getCalculations();
    
    const expectedPayments = store.data.income
        .filter(inc => inc.status === 'EXPECTED')
        .sort((a, b) => new Date(a.date) - new Date(b.date));
        
    const receivedPayments = store.data.income
        .filter(inc => inc.status === 'RECEIVED')
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const nextExpected = expectedPayments.length > 0 ? expectedPayments[0] : null;
    const upcomingExpected = expectedPayments;

    // Find last month's income
    const historyMonths = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    let lastMonthIncome = 0;
    const currentIdx = historyMonths.indexOf('AUGUST'); // hardcode for mockup
    if (currentIdx > 0) {
        const lastMonthStr = historyMonths[currentIdx - 1];
        const lastMonthData = store.data.history.find(h => h.month === lastMonthStr);
        if (lastMonthData) lastMonthIncome = lastMonthData.income;
    }

    // Days difference helper
    const getDaysLeftHtml = (dateStr) => {
        const d = new Date(dateStr);
        d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
        const today = new Date('2026-08-11');
        today.setHours(0,0,0,0);
        const timeDiff = d.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        if (daysDiff === 0) return `<span style="color:var(--color-green); font-weight: 500;">Today</span>`;
        if (daysDiff === 1) return `<span style="color:var(--color-green); font-weight: 500;">Tomorrow</span>`;
        if (daysDiff > 1) return `<span style="color:var(--color-green); font-weight: 500;">${daysDiff} days left</span>`;
        
        const daysPast = Math.abs(daysDiff);
        return `<span style="color:var(--color-yellow); font-weight: 500;">${daysPast} days overdue</span>`;
    };

    // Calculate days diff for logic
    const getDaysDiff = (dateStr) => {
        const d = new Date(dateStr);
        d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
        const today = new Date('2026-08-11');
        today.setHours(0,0,0,0);
        return Math.ceil((d.getTime() - today.getTime()) / (1000 * 3600 * 24));
    };

    // UI Tokens for the specific mockup
    const iconStyle = `width: 40px; height: 40px; border-radius: 50%; background: rgba(71, 114, 76, 0.1); color: var(--color-green); display: flex; align-items: center; justify-content: center; flex-shrink: 0;`;
    const btnGreenStyle = `background: #4A7753; color: white; border: none; padding: 0.6rem; border-radius: 4px; font-weight: 500; font-size: 0.85rem; cursor: pointer; text-transform: none;`;

    // Next to Receive UI
    let nextToReceiveHtml = '';
    if (nextExpected) {
        nextToReceiveHtml = `
            <div id="nextPaycheckPanel" class="panel" style="flex: 1; display: flex; flex-direction: column; justify-content: space-between; background: transparent;">
                <div style="font-size: 0.75rem; font-weight: 600; margin-bottom: 1.5rem;">Next to Receive</div>
                <div style="display: flex; gap: 1rem; align-items: flex-start; margin-bottom: 2rem;">
                    <div style="${iconStyle}">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </div>
                    <div>
                        <div style="font-weight: 500; font-size: 0.95rem; margin-bottom: 0.25rem;">${nextExpected.name}</div>
                        <div style="font-weight: 600; font-size: 1.15rem;">~${formatMoney(nextExpected.amount)}</div>
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 1rem; font-size: 0.85rem;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            ${getDaysLeftHtml(nextExpected.date)}
                        </div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem; padding-left: 1.5rem;">
                            ${formatDate(nextExpected.date)}, 2026
                        </div>
                    </div>
                </div>
                <button style="${btnGreenStyle} width: 100%;" onclick='window.handlePaycheckClick(${JSON.stringify(nextExpected).replace(/'/g, "&#39;")}, ${getDaysDiff(nextExpected.date)})'>Mark as received</button>
            </div>
        `;
    } else {
        nextToReceiveHtml = `
            <div id="nextPaycheckPanel" class="panel" style="flex: 1; display: flex; align-items: center; justify-content: center; color: var(--text-secondary); background: transparent;">
                No upcoming income expected.
            </div>
        `;
    }

    // All Upcoming Sources
    const upcomingListHtml = upcomingExpected.map((inc, index) => {
        const isLast = index === upcomingExpected.length - 1;
        return `
            <div style="flex: 1; display: flex; align-items: center; justify-content: space-between; padding: 0; border-bottom: ${isLast ? 'none' : '1px solid var(--border-color)'}; cursor: pointer;" onclick='openIncomeConfirmModal(${JSON.stringify(inc).replace(/'/g, "&#39;")})'>
                <div style="display: flex; align-items: center; gap: 1.25rem;">
                    <div style="${iconStyle}">
                        ${inc.name.toLowerCase().includes('rent') ? window.AppIcons['home'] : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>'}
                    </div>
                    <div>
                        <div style="font-weight: 500; font-size: 0.9rem; margin-bottom: 0.25rem;">${inc.name}</div>
                        <div style="font-weight: 600; font-size: 1.05rem;">~${formatMoney(inc.amount)}</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 2rem;">
                    <div style="text-align: left;">
                        <div style="font-size: 0.85rem; margin-bottom: 0.25rem;">${getDaysLeftHtml(inc.date)}</div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary);">${formatDate(inc.date)}, 2026</div>
                    </div>
                    <div style="color: var(--text-secondary);">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // All Records for Table
    const allRecords = [...receivedPayments].sort((a,b) => new Date(b.date) - new Date(a.date));

    // Combine UI
    container.innerHTML = `
        <div class="top-bar">
            <div class="page-title"><span class="page-title-num">03 /</span> INCOME</div>
            <div class="date-selector" style="font-weight: 500; font-size: 0.8rem; letter-spacing: 1px; color: var(--text-secondary); display:flex; align-items:center; gap:0.5rem;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                AUGUST 2026 <span style="font-size: 0.6rem; margin-left: 0.25rem;">▼</span>
            </div>
        </div>
        

        <!-- 1. Expected Income -->
        <h2 style="font-size: 0.95rem; font-weight: 600; margin-bottom: 1rem; font-family: var(--font-primary);">1. Expected Income</h2>
        <div style="display: flex; gap: 1.5rem; margin-bottom: 2.5rem;">
            ${nextToReceiveHtml}
            <div class="panel" style="flex: 1.5; display: flex; flex-direction: column; background: transparent; padding: 1.25rem;">
                <div style="font-size: 0.75rem; font-weight: 600; margin-bottom: 0.5rem;">All Upcoming Sources</div>
                <div style="flex: 1; display: flex; flex-direction: column;">
                    ${upcomingListHtml || '<div style="padding:1.5rem; text-align:center; color:var(--text-secondary);">No upcoming sources.</div>'}
                </div>
            </div>
        </div>

        <!-- 2. Month Overview -->
        <h2 style="font-size: 0.95rem; font-weight: 600; margin-bottom: 1rem; font-family: var(--font-primary);">2. Month Overview</h2>
        <div class="panel" style="display: flex; flex-direction: row; margin-bottom: 2.5rem; background: transparent; padding: 0;">
            <div style="flex: 1; display: flex; align-items: center; gap: 1.25rem; border-right: 1px solid var(--border-color); padding: 1.5rem 2rem;">
                <div style="${iconStyle}">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                </div>
                <div>
                    <div style="font-size: 1.2rem; font-weight: 600; margin-bottom: 0.1rem;">${formatMoney(calc.incomeReceived)}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Received this month</div>
                </div>
            </div>
            <div style="flex: 1; display: flex; align-items: center; gap: 1.25rem; padding-left: 2rem; border-right: 1px solid var(--border-color); padding: 1.5rem 2rem;">
                <div style="${iconStyle}">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <div>
                    <div style="font-size: 1.2rem; font-weight: 600; margin-bottom: 0.1rem;">~${formatMoney(calc.incomeExpected)}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Still expected</div>
                </div>
            </div>
            <div style="flex: 1; display: flex; align-items: center; gap: 1.25rem; padding-left: 2rem; padding: 1.5rem 2rem;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(0,0,0,0.05); color: var(--text-secondary); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
                </div>
                <div>
                    <div style="font-size: 1.2rem; font-weight: 600; margin-bottom: 0.1rem;">${formatMoney(lastMonthIncome)}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Last month</div>
                </div>
            </div>
        </div>

        <!-- 3. Income History -->
        <h2 style="font-size: 0.95rem; font-weight: 600; margin-bottom: 1rem; font-family: var(--font-primary);">3. Income History</h2>
        
        <div class="panel" style="padding: 1.25rem 1.5rem; background: transparent;">
            <div style="display: flex; justify-content: flex-end; align-items: center; margin-bottom: 1.5rem; gap: 1rem;">
                <button style="border: 1px solid var(--color-green); color: var(--color-green); background: transparent; padding: 0.4rem 0.75rem; font-size: 0.75rem; font-weight: 500; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 0.25rem;" onclick="openIncomeModal()">
                    <span>+</span> Add one-time income
                </button>
                <span style="font-size: 0.8rem; color: var(--color-green); cursor: pointer; font-weight: 500; display:flex; align-items:center; gap:0.25rem;" onclick="openIncomeSourcesManagerModal()">
                    Manage recurring <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1.5fr 1fr 1fr; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-color); font-size: 0.65rem; font-weight: 600; text-transform: uppercase; color: var(--text-secondary); letter-spacing: 0.5px;">
                <div>DATE</div>
                <div>SOURCE</div>
                <div>TYPE</div>
                <div>AMOUNT</div>
            </div>
            <div id="recordsList">
                ${allRecords.map((inc, index) => {
                    const typeText = inc.sourceId ? 'Recurring' : 'One-time';
                    const amountPrefix = inc.status === 'EXPECTED' ? '~' : '';
                    const isLast = index === allRecords.length - 1;
                    
                    return `
                        <div style="display: grid; grid-template-columns: 1fr 1.5fr 1fr 1fr; align-items: center; padding: 1rem 0; border-bottom: ${isLast ? 'none' : '1px solid rgba(0,0,0,0.05)'}; cursor: pointer;" onclick='${inc.status === 'EXPECTED' ? `openIncomeConfirmModal(${JSON.stringify(inc).replace(/'/g, "&#39;")})` : `openIncomeModal(${JSON.stringify(inc).replace(/'/g, "&#39;")})`}'>
                            <div style="font-size: 0.8rem;">${formatDate(inc.date)}, 2026</div>
                            <div style="font-size: 0.8rem;">${inc.name}</div>
                            <div style="font-size: 0.8rem;">${typeText}</div>
                            <div style="font-size: 0.8rem; font-weight: 500;">${amountPrefix}${formatMoney(inc.amount)}</div>
                        </div>
                    `;
                }).join('')}
                ${allRecords.length === 0 ? '<div style="padding: 1.5rem 0; text-align: center; color: var(--text-secondary); font-size: 0.8rem;">No records found.</div>' : ''}
            </div>
        </div>
    `;

    return container;
};

window.handlePaycheckClick = (entry, daysDiff) => {
    const confirmAction = () => {
        openIncomeConfirmModal(entry, (data) => {
            store.confirmExpectedIncome(entry.id, parseFloat(data.amount), data.date, data.description);
            
            // Show success state on the card
            const panel = document.getElementById('nextPaycheckPanel');
            if (panel) {
                panel.innerHTML = `
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center; color: var(--color-green); height: 100%;">
                        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">✓</div>
                        <div style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.25rem; color: var(--text-primary);">$${parseFloat(data.amount).toFixed(2)} RECEIVED</div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary);">Added to August income</div>
                    </div>
                `;
                setTimeout(() => {
                    if (window.app) window.app.handleRoute();
                }, 1500);
            } else {
                if (window.app) window.app.handleRoute();
            }
        });
    };

    if (daysDiff > 0) {
        // Early confirmation guard
        const d = new Date(entry.date);
        d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
        const dateStr = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d);
        
        const content = `
            <div style="text-align:center; padding: 1rem 0;">
                <p style="margin-bottom: 1.5rem; font-size: 1rem;">This paycheck was expected <strong>${dateStr}</strong>.</p>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">Did you already receive it?</p>
            </div>
            <div class="form-actions" style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 1.5rem;">
                <button type="button" class="btn" id="btnModalCancelLocal" style="flex:1;">CANCEL</button>
                <button type="button" class="btn-primary btn" id="btnConfirmEarly" style="flex:1;">YES, MARK RECEIVED</button>
            </div>
        `;
        
        modal.open('CONFIRM EARLY', content, () => {}, (close) => {
            document.getElementById('btnModalCancelLocal').addEventListener('click', close);
            document.getElementById('btnConfirmEarly').addEventListener('click', () => {
                close();
                setTimeout(() => {
                    confirmAction();
                }, 300); // Wait for first modal to close
            });
        });
    } else {
        confirmAction();
    }
};
