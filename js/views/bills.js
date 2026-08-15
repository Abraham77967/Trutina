window.handleMarkBillPaid = (id) => {
    store.markBillPaid(id);
    if (window.app) window.app.handleRoute(false);
};

window.handleToggleBillPaid = (id) => {
    const bill = store.data.bills.find(b => b.id == id);
    if (bill) {
        if (bill.paid) store.unmarkBillPaid(id);
        else store.markBillPaid(id);
        if (window.app) window.app.handleRoute(false);
    }
};

const renderBills = () => {
    const container = document.createElement('div');
    
    const allBills = [...store.data.bills];
    
    const actualUpcoming = allBills.filter(b => !b.paid);
    const paid = allBills.filter(b => b.paid);
    
    // Project next cycle for paid bills so the list never looks completely empty
    const virtualBills = paid.map(b => {
        const nextD = new Date(b.dueDate);
        if (b.frequency === 'weekly') {
            nextD.setDate(nextD.getDate() + 7);
        } else {
            nextD.setMonth(nextD.getMonth() + 1);
        }
        return {
            ...b,
            id: 'virtual_' + b.id,
            dueDate: nextD.toISOString().split('T')[0],
            paid: false,
            isVirtual: true
        };
    });

    const upcoming = [...actualUpcoming, ...virtualBills].sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    const totalDue = actualUpcoming.reduce((acc, b) => acc + b.amount, 0);
    const totalPaid = paid.reduce((acc, b) => acc + b.amount, 0);
    const nextDue = upcoming.length > 0 ? upcoming[0] : null;

    const getDaysDiff = (dateStr) => {
        const today = new Date();
        today.setHours(0,0,0,0);
        const due = new Date(dateStr);
        due.setHours(0,0,0,0);
        const diffTime = due - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const formatDateShort = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }); 
    };

    const formatDateFull = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }); 
    };

    let nextDueText = 'None';
    let nextDueSubtext = '';
    if (nextDue) {
        const diffDays = getDaysDiff(nextDue.dueDate);
        if (diffDays === 0) nextDueText = `${nextDue.name} today`;
        else if (diffDays < 0) nextDueText = `${nextDue.name} is overdue`;
        else nextDueText = `${nextDue.name} in ${diffDays} days`;
        
        nextDueSubtext = `Due ${formatDateShort(nextDue.dueDate)}`;
    }

    const renderUpcomingRow = (bill) => {
        const diffDays = getDaysDiff(bill.dueDate);
        
        let statusBadge = '';
        let dueTextHtml = '';
        if (diffDays < 0) {
            statusBadge = `<span style="background: rgba(220, 53, 69, 0.15); color: #dc3545; padding: 4px 8px; border-radius: 4px; font-size: 0.65rem; font-weight: 700; letter-spacing: 1px;">OVERDUE</span>`;
            dueTextHtml = `<div style="color: #dc3545; font-size: 0.8rem; display: flex; align-items: center; gap: 0.4rem;"><span style="font-size: 1.2rem; line-height: 0;">•</span> Overdue</div><div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.2rem; padding-left: 1rem;">${Math.abs(diffDays)} days ago</div>`;
        } else if (diffDays === 0) {
            statusBadge = `<span style="background: rgba(240, 173, 78, 0.15); color: #f0ad4e; padding: 4px 8px; border-radius: 4px; font-size: 0.65rem; font-weight: 700; letter-spacing: 1px;">TODAY</span>`;
            dueTextHtml = `<div style="color: #f0ad4e; font-size: 0.8rem; display: flex; align-items: center; gap: 0.4rem;"><span style="font-size: 1.2rem; line-height: 0;">•</span> Due today</div><div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.2rem; padding-left: 1rem;">${formatDateFull(bill.dueDate)}</div>`;
        } else {
            statusBadge = `<span style="background: rgba(0,0,0,0.05); color: var(--text-secondary); padding: 4px 8px; border-radius: 4px; font-size: 0.65rem; font-weight: 700; letter-spacing: 1px;">UPCOMING</span>`;
            dueTextHtml = `<div style="font-size: 0.8rem; display: flex; align-items: center; gap: 0.4rem;"><span style="font-size: 1.2rem; line-height: 0; color: var(--text-secondary);">•</span> In ${diffDays} days</div><div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.2rem; padding-left: 1rem;">${formatDateFull(bill.dueDate)}</div>`;
        }

        const iconBg = 'rgba(71, 114, 76, 0.1)';
        const nameLower = bill.name.toLowerCase();
        let svgCode = window.AppIcons['star'];
        if (nameLower.includes('rent') || nameLower.includes('housing')) svgCode = window.AppIcons['home'];
        else if (nameLower.includes('spotify') || nameLower.includes('music')) svgCode = window.AppIcons['music'];
        else if (nameLower.includes('gemini') || nameLower.includes('chatgpt') || nameLower.includes('ai')) svgCode = window.AppIcons['cpu'];
        else if (bill.icon && window.AppIcons[bill.icon]) svgCode = window.AppIcons[bill.icon];

        return `
        <tr style="border-bottom: 1px solid var(--border-color);">
            <td style="padding: 1.5rem 0;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(0,0,0,0.04); color: var(--text-primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        ${svgCode}
                    </div>
                    <div>
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem;">
                            <div style="font-size: 0.95rem; font-weight: 600;">${bill.name}</div>
                            <span style="font-size: 0.55rem; font-weight: 700; background: rgba(0,0,0,0.06); color: #555; padding: 2px 6px; border-radius: 4px; letter-spacing: 1px; text-transform: uppercase;">${bill.frequency || 'MONTHLY'}</span>
                        </div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">Due ${formatDateShort(bill.dueDate)}</div>
                    </div>
                </div>
            </td>
            <td style="padding: 1.5rem 0;">
                ${dueTextHtml}
            </td>
            <td style="padding: 1.5rem 0; font-weight: 700; font-size: 1.15rem; color: var(--text-primary);">
                ${formatMoney(bill.amount)}
            </td>
            <td style="padding: 1.5rem 0; text-align: center;">
                ${statusBadge}
            </td>
            <td style="padding: 1.5rem 0; text-align: right;">
                <div style="display: flex; align-items: center; justify-content: flex-end; gap: 0.5rem;">
                    ${bill.isVirtual 
                        ? `<button style="border: 1px solid var(--border-color); color: var(--text-secondary); background: transparent; padding: 0.4rem 0.75rem; font-size: 0.75rem; font-weight: 500; border-radius: 4px; cursor: not-allowed; opacity: 0.6;" title="Current cycle is paid">Mark as paid</button>`
                        : `<button style="border: 1px solid var(--border-color); color: var(--text-primary); background: transparent; padding: 0.4rem 0.75rem; font-size: 0.75rem; font-weight: 500; border-radius: 4px; cursor: pointer;" onclick="handleMarkBillPaid(${bill.id})">Mark as paid</button>`
                    }
                    <button style="border: none; background: transparent; font-size: 1.2rem; cursor: pointer; color: var(--text-secondary); padding: 0.4rem; display: flex; align-items: center;">⋮</button>
                </div>
            </td>
        </tr>
        `;
    };

    const renderHistoryRow = (bill) => {
        const nameLower = bill.name.toLowerCase();
        let svgCode = window.AppIcons['star'];
        if (nameLower.includes('rent') || nameLower.includes('housing')) svgCode = window.AppIcons['home'];
        else if (nameLower.includes('spotify') || nameLower.includes('music')) svgCode = window.AppIcons['music'];
        else if (nameLower.includes('gemini') || nameLower.includes('chatgpt') || nameLower.includes('ai')) svgCode = window.AppIcons['cpu'];
        else if (bill.icon && window.AppIcons[bill.icon]) svgCode = window.AppIcons[bill.icon];
        
        const spendingRecord = store.data.spending.find(s => s.amount === bill.amount && s.description === bill.name && (s.category === 'Bills' || s.category === bill.category));
        const paidDateStr = spendingRecord ? formatDateFull(spendingRecord.date) : formatDateFull(bill.dueDate); 

        return `
        <tr style="border-bottom: 1px solid var(--border-color);">
            <td style="padding: 1.5rem 0;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 32px; height: 32px; border-radius: 50%; background: rgba(0,0,0,0.04); color: var(--text-secondary); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        ${svgCode}
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div style="font-size: 0.9rem; font-weight: 600;">${bill.name}</div>
                        <span style="font-size: 0.55rem; font-weight: 700; background: rgba(0,0,0,0.06); color: #555; padding: 2px 6px; border-radius: 4px; letter-spacing: 1px; text-transform: uppercase;">${bill.frequency || 'MONTHLY'}</span>
                    </div>
                </div>
            </td>
            <td style="padding: 1.5rem 0; font-size: 0.85rem; color: var(--text-secondary); font-weight: 500;">
                ${paidDateStr}
            </td>
            <td style="padding: 1.5rem 0; font-size: 0.85rem; color: var(--text-secondary); font-weight: 500;">
                ${formatDateFull(bill.dueDate)}
            </td>
            <td style="padding: 1.5rem 0; font-weight: 700; font-size: 1rem; color: var(--text-primary);">
                ${formatMoney(bill.amount)}
            </td>
            <td style="padding: 1.5rem 0; text-align: center;">
                <span style="background: rgba(71, 114, 76, 0.1); color: var(--color-green); padding: 4px 8px; border-radius: 4px; font-size: 0.65rem; font-weight: 700; letter-spacing: 1px;">PAID</span>
            </td>
        </tr>
        `;
    };

    container.innerHTML = `
        <div class="top-bar" style="margin-bottom: 0;">
            <div class="page-title" style="font-size: 0.8rem; font-family: var(--font-primary);"><span style="color: var(--text-secondary); font-weight: 400; margin-right: 0.5rem;">04 /</span> BILLS</div>
            <div class="date-selector" style="font-size: 0.75rem; font-weight: 600;">AUGUST 2026 <span>▼</span></div>
        </div>
        
        <div style="padding: 1rem 0 3rem 0; max-width: 900px; margin: 0 auto;">
            
            <!-- THIS MONTH SUMMARY -->
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1.5rem;">
                <div style="font-size: 0.85rem; font-weight: 600; letter-spacing: 1px; color: var(--text-primary); text-transform: uppercase;">THIS MONTH</div>
                <button style="border: 1px solid var(--border-color); color: var(--text-primary); background: transparent; padding: 0.4rem 0.75rem; font-size: 0.75rem; font-weight: 500; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 0.25rem;" onclick="openBillsManagerModal()">
                    <span style="font-size: 1rem; line-height: 0;">+</span> Add bill
                </button>
            </div>
            
            <div style="display: flex; margin-bottom: 4rem;">
                <div style="flex: 1; text-align: center; border-right: 1px solid var(--border-color); padding: 1rem;">
                    <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.75rem;">Total due this month</div>
                    <div style="font-size: 1.75rem; font-weight: 700;">${formatMoney(totalDue)}</div>
                </div>
                <div style="flex: 1.5; text-align: center; border-right: 1px solid var(--border-color); padding: 1rem;">
                    <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.75rem;">Next due</div>
                    <div style="font-size: 1.25rem; font-weight: 600;">${nextDueText}</div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.25rem;">${nextDueSubtext}</div>
                </div>
                <div style="flex: 1; text-align: center; padding: 1rem;">
                    <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.75rem;">Paid this month</div>
                    <div style="font-size: 1.75rem; font-weight: 700;">${formatMoney(totalPaid)}</div>
                </div>
            </div>

            <!-- DUE THIS MONTH -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; margin-bottom: 0;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="font-size: 0.85rem; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">UPCOMING BILLS</div>
                    <div style="background: rgba(0,0,0,0.06); color: #555; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700;">${upcoming.length}</div>
                </div>
                <a href="javascript:void(0)" onclick="openBillsManagerModal()" style="font-size: 0.8rem; color: var(--text-secondary); text-decoration: none;">Manage recurring bills ></a>
            </div>
            
            <div style="margin-top: 1.5rem;">
                ${actualUpcoming.length === 0 && paid.length > 0 ? `
                <div style="background: rgba(71, 114, 76, 0.08); border: 1px solid rgba(71, 114, 76, 0.15); color: var(--color-green); padding: 0.85rem 1rem; border-radius: 6px; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <div style="font-size: 0.85rem; font-weight: 500;">You're all caught up for this month! Showing upcoming bills for the next cycle.</div>
                </div>
                ` : ''}
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 2rem;">
                <thead>
                    <tr style="border-bottom: 1px solid var(--border-color); text-align: left; font-size: 0.7rem; color: var(--text-secondary); letter-spacing: 1px; text-transform: uppercase;">
                        <th style="padding: 1.5rem 0; font-weight: 600; width: 35%;">BILL</th>
                        <th style="padding: 1.5rem 0; font-weight: 600; width: 25%;">DUE</th>
                        <th style="padding: 1.5rem 0; font-weight: 600; width: 15%; text-align: left;">AMOUNT</th>
                        <th style="padding: 1.5rem 0; font-weight: 600; width: 10%; text-align: center;">STATUS</th>
                        <th style="padding: 1.5rem 0; font-weight: 600; width: 15%; text-align: right;">ACTION</th>
                    </tr>
                </thead>
                <tbody>
                    ${upcoming.length > 0 ? upcoming.map(renderUpcomingRow).join('') : '<tr><td colspan="5" style="padding: 2rem 0; text-align: center; color: var(--text-secondary);">No bills due.</td></tr>'}
                </tbody>
            </table>
            
            <div style="text-align: center; margin-bottom: 5rem;">
                <a href="javascript:void(0)" style="font-size: 0.8rem; color: var(--text-secondary); text-decoration: none;">View all recurring bills <span style="font-size: 0.6rem;">▼</span></a>
            </div>

            <!-- PAYMENT HISTORY -->
            <div style="display: flex; align-items: center; gap: 0.75rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; margin-bottom: 0;">
                <div style="font-size: 0.85rem; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">PAYMENT HISTORY</div>
                <div style="background: rgba(0,0,0,0.06); color: #555; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700;">${paid.length}</div>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 2rem;">
                <thead>
                    <tr style="border-bottom: 1px solid var(--border-color); text-align: left; font-size: 0.7rem; color: var(--text-secondary); letter-spacing: 1px; text-transform: uppercase;">
                        <th style="padding: 1.5rem 0; font-weight: 600; width: 35%;">BILL</th>
                        <th style="padding: 1.5rem 0; font-weight: 600; width: 20%;">PAID ON</th>
                        <th style="padding: 1.5rem 0; font-weight: 600; width: 20%;">DUE DATE</th>
                        <th style="padding: 1.5rem 0; font-weight: 600; width: 15%; text-align: left;">AMOUNT</th>
                        <th style="padding: 1.5rem 0; font-weight: 600; width: 10%; text-align: center;">STATUS</th>
                    </tr>
                </thead>
                <tbody>
                    ${paid.length > 0 ? paid.map(renderHistoryRow).join('') : '<tr><td colspan="5" style="padding: 2rem 0; text-align: center; color: var(--text-secondary);">No history yet.</td></tr>'}
                </tbody>
            </table>
            
            <div style="text-align: center; margin-bottom: 4rem;">
                <a href="javascript:void(0)" onclick="openPastPaymentsModal()" style="font-size: 0.8rem; color: var(--text-secondary); text-decoration: none;">View full payment history ></a>
            </div>

        </div>
    `;

    return container;
};
