class ModalManager {
    constructor() {
        this.container = document.getElementById('modal-container');
    }

    open(title, contentHtml, onSave, customInit = null) {
        if (this.closeTimeout) {
            clearTimeout(this.closeTimeout);
            this.closeTimeout = null;
        }

        this.container.innerHTML = `
            <div class="modal-overlay" id="modalOverlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="modal-title">${title}</div>
                        <button class="btn-close" id="btnModalClose">&times;</button>
                    </div>
                    <form id="modalForm">
                        ${contentHtml}
                    </form>
                </div>
            </div>
        `;
        
        const overlay = document.getElementById('modalOverlay');
        const form = document.getElementById('modalForm');
        
        // Use timeout to allow DOM to render before adding active class for animation
        setTimeout(() => {
            overlay.classList.add('active');
            if (typeof initCustomSelects === 'function') {
                initCustomSelects(form);
            }
        }, 10);

        const close = () => {
            const overlay = document.getElementById('modalOverlay');
            if (overlay) overlay.classList.remove('active');
            this.closeTimeout = setTimeout(() => {
                this.container.innerHTML = '';
                this.closeTimeout = null;
            }, 300); // match transition time
        };

        document.getElementById('btnModalClose').addEventListener('click', close);
        
        const cancelBtn = document.getElementById('btnModalCancel');
        if(cancelBtn) cancelBtn.addEventListener('click', close);
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            onSave(data);
            close();
            // Re-render current view
            if (window.app) window.app.handleRoute();
        });
        
        if (customInit) {
            customInit(close, (data) => {
                onSave(data);
                close();
                if (window.app) window.app.handleRoute();
            });
        }
    }
}

const modal = new ModalManager();

// Helper to open specific forms
const openExpenseModal = (existingData = null) => {
    const isEdit = !!existingData;
    const budgets = store.data.budgets || [];
    const defaultCat = isEdit ? existingData.category : (budgets.length > 0 ? budgets[0].category : 'Other');
    
    // Find icon for default selected category
    let defaultIconSvg = window.AppIcons['box'];
    const defaultBudget = budgets.find(b => b.category === defaultCat);
    if (defaultBudget && defaultBudget.icon && window.AppIcons[defaultBudget.icon]) {
        defaultIconSvg = window.AppIcons[defaultBudget.icon];
    }

    const optionsHtml = budgets.map(b => {
        const svg = (b.icon && window.AppIcons[b.icon]) ? window.AppIcons[b.icon] : window.AppIcons['box'];
        return `<div class="custom-select-option" data-value="${b.category}" style="padding: 0.5rem; display: flex; align-items: center; cursor: pointer; border-bottom: 1px solid var(--border-color);">
            <span style="margin-right: 0.5rem; display: flex;">${svg}</span>
            <span>${b.category}</span>
        </div>`;
    }).join('');

    const content = `
        <div class="form-group">
            <label class="form-label">Amount</label>
            <input type="number" step="0.01" name="amount" class="form-input" required value="${isEdit ? existingData.amount : ''}">
        </div>
        <div class="form-group">
            <label class="form-label">Description</label>
            <input type="text" name="description" class="form-input" required value="${isEdit ? existingData.description : ''}">
        </div>
        <div class="form-group">
            <label class="form-label">Category</label>
            <div class="custom-select" style="position: relative;">
                <input type="hidden" name="category" id="expenseCategory" value="${defaultCat}" required>
                <div class="form-input custom-select-trigger" style="display: flex; align-items: center; cursor: pointer;">
                    <span class="selected-icon" style="margin-right: 0.5rem; display: flex; color: var(--text-primary);">${defaultIconSvg}</span>
                    <span class="selected-text" style="flex-grow: 1;">${defaultCat}</span>
                    <span style="font-size: 0.8rem; opacity: 0.6;">▼</span>
                </div>
                <div class="custom-select-options" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: var(--bg-color); border: 1px solid var(--border-color); border-radius: 4px; max-height: 200px; overflow-y: auto; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-top: 4px;">
                    ${optionsHtml}
                </div>
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">Date</label>
            <input type="date" name="date" class="form-input" required value="${isEdit ? existingData.date : new Date().toISOString().split('T')[0]}">
        </div>
        <div class="form-actions" style="display: flex; gap: 0.5rem; justify-content: flex-end;">
            ${isEdit ? '<button type="button" class="btn" id="btnModalDelete" style="margin-right: auto; color: var(--color-red); border-color: var(--color-red);">Delete</button>' : ''}
            <button type="button" class="btn" id="btnModalCancel">Cancel</button>
            <button type="submit" class="btn btn-primary">Save</button>
        </div>
    `;

    modal.open(isEdit ? 'Edit Expense' : 'Add Expense', content, (data) => {
        data.amount = parseFloat(data.amount);
        if (isEdit) {
            store.updateExpense(existingData.id, data);
        } else {
            store.addExpense(data);
        }
    }, (close) => {
        const trigger = document.querySelector('.custom-select-trigger');
        const optionsPanel = document.querySelector('.custom-select-options');
        const hiddenInput = document.getElementById('expenseCategory');
        
        if (trigger && optionsPanel) {
            trigger.addEventListener('click', () => {
                optionsPanel.style.display = optionsPanel.style.display === 'none' ? 'block' : 'none';
            });
            
            document.querySelectorAll('.custom-select-option').forEach(opt => {
                opt.addEventListener('click', (e) => {
                    hiddenInput.value = e.currentTarget.dataset.value;
                    trigger.querySelector('.selected-icon').innerHTML = e.currentTarget.children[0].innerHTML;
                    trigger.querySelector('.selected-text').textContent = e.currentTarget.children[1].textContent;
                    optionsPanel.style.display = 'none';
                });
            });
            
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.custom-select')) {
                    optionsPanel.style.display = 'none';
                }
            });
        }

        const delBtn = document.getElementById('btnModalDelete');
        if(delBtn) {
            delBtn.addEventListener('click', () => {
                store.deleteExpense(existingData.id);
                close();
                if(window.app) window.app.handleRoute();
            });
        }
    });
};

const openIncomeSourceModal = (existingData = null) => {
    const isEdit = !!existingData;
    const content = `
        <div class="form-group">
            <label class="form-label">Source Name</label>
            <input type="text" name="name" class="form-input" required value="${isEdit ? existingData.name : ''}" placeholder="e.g., Job (Part-time)">
        </div>
        <div class="form-group">
            <label class="form-label">Expected Amount</label>
            <div style="position:relative;">
                <span style="position:absolute; left:1rem; top:50%; transform:translateY(-50%);">$</span>
                <input type="number" step="0.01" name="amount" class="form-input" style="padding-left: 2rem;" required value="${isEdit ? existingData.amount : ''}">
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">Frequency</label>
            <select name="frequency" class="form-input" required>
                <option value="Weekly" ${isEdit && existingData.frequency === 'Weekly' ? 'selected' : ''}>Weekly</option>
                <option value="Biweekly" ${isEdit && existingData.frequency === 'Biweekly' ? 'selected' : ''}>Biweekly</option>
                <option value="Monthly" ${isEdit && existingData.frequency === 'Monthly' ? 'selected' : ''}>Monthly</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">Next Payment Date</label>
            <input type="date" name="nextDate" class="form-input" required value="${isEdit ? existingData.nextDate : ''}">
        </div>
        <div class="form-group">
            <label class="form-label">Optional End Date</label>
            <input type="date" name="endDate" class="form-input" value="${isEdit && existingData.endDate ? existingData.endDate : ''}">
        </div>
        <div class="form-actions" style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1.5rem;">
            ${isEdit ? '<button type="button" class="btn" id="btnModalDelete" style="margin-right: auto; color: var(--color-red); border-color: var(--color-red);">Delete</button>' : ''}
            <button type="button" class="btn" id="btnModalCancel" style="flex:1;">Cancel</button>
            <button type="submit" class="btn btn-primary" style="flex:1;">Save</button>
        </div>
    `;

    modal.open(isEdit ? 'EDIT SOURCE' : 'ADD SOURCE', content, (data) => {
        data.amount = parseFloat(data.amount);
        if (isEdit) { store.updateIncomeSource(existingData.id, data); } 
        else { store.addIncomeSource(data); }
    }, isEdit ? (close) => {
        document.getElementById('btnModalDelete').addEventListener('click', () => {
            if(confirm('Delete this source?')) {
                store.deleteIncomeSource(existingData.id);
                close();
                if (window.app) window.app.handleRoute();
            }
        });
    } : null);
};

const openIncomeConfirmModal = (entry, onConfirm) => {
    const d = new Date(entry.date);
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    const dateStr = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d);

    const content = `
        <div style="margin-bottom: 2rem;">
            <div style="font-weight: 600; font-size: 1.1rem; color: var(--text-primary); margin-bottom: 0.25rem;">${entry.name}</div>
            <div style="font-size: 0.85rem; color: var(--text-secondary);">Expected ${dateStr}</div>
        </div>
        
        <div class="form-group" style="margin-bottom: 1.5rem;">
            <label class="form-label" style="font-size: 0.75rem; letter-spacing: 1px; margin-bottom: 0.5rem; display:block;">AMOUNT RECEIVED</label>
            <div style="position:relative;">
                <span style="position:absolute; left:1rem; top:50%; transform:translateY(-50%); color: var(--text-secondary); font-size: 1.1rem;">$</span>
                <input type="number" step="0.01" name="amount" class="form-input" style="padding-left: 2rem; font-size: 1.1rem; font-weight: 500;" required value="${parseFloat(entry.amount).toFixed(2)}">
            </div>
        </div>
        
        <div class="form-group" style="margin-bottom: 2.5rem;">
            <label class="form-label" style="font-size: 0.75rem; letter-spacing: 1px; margin-bottom: 0.5rem; display:block;">DATE RECEIVED</label>
            <input type="date" name="date" class="form-input" style="font-size: 1rem;" required value="${entry.date}">
        </div>

        <div class="form-actions" style="display: flex; gap: 0.5rem; justify-content: flex-end;">
            <button type="button" class="btn" id="btnModalCancelLocal" style="flex:1;">CANCEL</button>
            <button type="button" class="btn btn-primary" id="btnConfirmSubmit" style="flex:1; background-color: var(--color-green); border-color: var(--color-green);">CONFIRM RECEIVED</button>
        </div>
    `;

    modal.open('MARK PAYCHECK AS RECEIVED', content, () => {}, (close) => {
        document.getElementById('btnModalCancelLocal').addEventListener('click', close);
        document.getElementById('btnConfirmSubmit').addEventListener('click', () => {
            const form = document.getElementById('modalForm');
            if(!form.checkValidity()) { form.reportValidity(); return; }
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            close();
            
            if (onConfirm) {
                onConfirm(data);
            } else {
                store.confirmExpectedIncome(entry.id, parseFloat(data.amount), data.date, data.description);
                if (window.app) window.app.handleRoute();
            }
        });
    });
};

const openIncomeModal = (existingData = null) => {
    const isEdit = !!existingData;
    const content = `
        <div class="form-group">
            <label class="form-label">Source Name</label>
            <input type="text" name="name" class="form-input" required value="${isEdit ? existingData.name : ''}">
        </div>
        <div class="form-group">
            <label class="form-label">Description</label>
            <input type="text" name="description" class="form-input" placeholder="e.g. Sold monitor" value="${isEdit ? (existingData.description || '') : ''}">
        </div>
        <div class="form-group">
            <label class="form-label">Amount</label>
            <input type="number" step="0.01" name="amount" class="form-input" required value="${isEdit ? existingData.amount : ''}">
        </div>
        <div class="form-group">
            <label class="form-label">Date</label>
            <input type="date" name="date" class="form-input" required value="${isEdit ? existingData.date : ''}">
        </div>
        <div class="form-actions" style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1.5rem;">
            ${isEdit ? '<button type="button" class="btn" id="btnModalDelete" style="margin-right: auto; color: var(--color-red); border-color: var(--color-red);">Delete</button>' : ''}
            <button type="button" class="btn" id="btnModalCancel" style="flex:1;">Cancel</button>
            <button type="submit" class="btn btn-primary" style="flex:1;">Save</button>
        </div>
    `;

    modal.open(isEdit ? 'EDIT INCOME' : 'ADD INCOME', content, (data) => {
        data.amount = parseFloat(data.amount);
        if (isEdit) { store.updateIncome(existingData.id, data); } 
        else { store.addIncome(data); }
    }, isEdit ? (close) => {
        document.getElementById('btnModalDelete').addEventListener('click', () => {
            if(confirm('Delete this entry?')) {
                store.deleteIncome(existingData.id);
                close();
                if (window.app) window.app.handleRoute();
            }
        });
    } : null);
};

const openIncomeSourcesManagerModal = () => {
    // Generate HTML for the list of sources
    const sourcesHtml = store.data.incomeSources.map(src => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding: 1rem; border: 1px solid var(--border-color); margin-bottom: 0.5rem;">
            <div>
                <div style="font-weight: 500; font-size: 0.85rem; margin-bottom: 0.25rem;">${src.name}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">${formatMoney(src.amount)} / ${src.frequency}</div>
            </div>
            <button type="button" class="btn btn-outline edit-source-btn" data-id="${src.id}" style="padding: 0.25rem 0.5rem; font-size: 0.7rem;">Edit</button>
        </div>
    `).join('') || '<div style="padding: 1rem; color: var(--text-secondary); text-align:center; font-size:0.85rem;">No recurring sources found.</div>';

    const content = `
        <div style="margin-bottom: 1.5rem;">
            ${sourcesHtml}
        </div>
        <div class="form-actions" style="display: flex; gap: 0.5rem;">
            <button type="button" class="btn" id="btnModalCancel" style="flex:1;">Close</button>
            <button type="button" class="btn btn-primary" id="btnAddSource" style="flex:1;">+ Add Source</button>
        </div>
    `;

    // Empty callback because it's a navigation modal essentially
    modal.open('MANAGE SOURCES', content, () => {}, (close) => {
        // Wire up Edit buttons
        const editBtns = document.querySelectorAll('.edit-source-btn');
        editBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const src = store.data.incomeSources.find(s => s.id == id);
                if (src) {
                    close(); // close manager first
                    openIncomeSourceModal(src); // open edit modal
                }
            });
        });
        // Wire up Add button
        const addBtn = document.getElementById('btnAddSource');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                close();
                openIncomeSourceModal(); // open add modal
            });
        }
    });
};

const openBillsManagerModal = () => {
    // Generate HTML for the list of bills
    const billsHtml = store.data.bills.map(bill => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding: 1rem; border: 1px solid var(--border-color); margin-bottom: 0.5rem; border-radius: 6px;">
            <div>
                <div style="font-weight: 600; font-size: 0.9rem; margin-bottom: 0.25rem;">${bill.name}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">
                    ${formatMoney(bill.amount)} • Due ${new Date(bill.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}
                </div>
            </div>
            <button type="button" class="btn btn-outline edit-bill-btn" data-id="${bill.id}" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;">Edit</button>
        </div>
    `).join('') || `
        <div style="padding: 2rem 1rem; text-align: center; color: var(--text-secondary); background: #F8F9FA; border-radius: 8px; border: 1px dashed var(--border-color);">
            <div style="margin-bottom: 0.5rem;">You haven't set up any bills yet.</div>
            <div style="font-size: 0.8rem;">Add your rent, internet, or phone bill here to start tracking them.</div>
        </div>
    `;

    const content = `
        <div style="margin-bottom: 1.5rem; max-height: 400px; overflow-y: auto; padding-right: 0.5rem;">
            ${billsHtml}
        </div>
        <div class="form-actions" style="display: flex; gap: 0.5rem;">
            <button type="button" class="btn" id="btnModalCancel" style="flex:1;">Close</button>
            <button type="button" class="btn btn-primary" id="btnAddBill" style="flex:1;">+ Add Bill</button>
        </div>
    `;

    modal.open('MANAGE BILLS', content, () => {}, (close) => {
        // Wire up Edit buttons
        const editBtns = document.querySelectorAll('.edit-bill-btn');
        editBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const bill = store.data.bills.find(s => s.id == id);
                if (bill) {
                    close(); // close manager first
                    openBillModal(bill); // open edit modal
                }
            });
        });
        // Wire up Add button
        const addBtn = document.getElementById('btnAddBill');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                close();
                openBillModal(); // open add modal
            });
        }
    });
};

const openBillModal = (existingData = null) => {
    const isEdit = !!existingData;
    const content = `
        <div class="form-group">
            <label class="form-label">Name</label>
            <input type="text" name="name" class="form-input" required value="${isEdit ? existingData.name : ''}" placeholder="e.g. Rent, Internet">
        </div>
        <div class="form-group">
            <label class="form-label">Amount</label>
            <input type="number" step="0.01" name="amount" class="form-input" required value="${isEdit ? existingData.amount : ''}">
        </div>
        <div class="form-group">
            <label class="form-label">Due Date</label>
            <input type="date" name="dueDate" class="form-input" required value="${isEdit ? existingData.dueDate : ''}">
        </div>
        <div class="form-group">
            <label class="form-label">Frequency</label>
            <select name="frequency" class="form-input" required>
                <option value="monthly" ${isEdit && existingData.frequency === 'monthly' ? 'selected' : ''}>Monthly</option>
                <option value="weekly" ${isEdit && existingData.frequency === 'weekly' ? 'selected' : ''}>Weekly</option>
            </select>
        </div>
        <div class="form-group" style="display:flex; align-items:center; gap: 0.5rem; margin-top: 1.5rem;">
            <input type="checkbox" name="autoPay" id="autoPayCheckbox" ${isEdit && existingData.autoPay ? 'checked' : ''}>
            <label for="autoPayCheckbox" class="form-label" style="margin:0; text-transform: uppercase; font-size: 0.75rem; font-weight: 600; letter-spacing: 1px;">Auto-pay (Auto-deduct on due date)</label>
        </div>
        ${isEdit ? `
        <div class="form-group" style="display:flex; align-items:center; gap: 0.5rem; margin-top: 1rem;">
            <input type="checkbox" name="paid" id="paidCheckbox" ${existingData.paid ? 'checked' : ''}>
            <label for="paidCheckbox" class="form-label" style="margin:0; text-transform: uppercase; font-size: 0.75rem; font-weight: 600; letter-spacing: 1px;">Paid this month</label>
        </div>
        ` : ''}
        <div class="form-actions" style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 2rem;">
            ${isEdit ? '<button type="button" class="btn" id="btnModalDelete" style="margin-right: auto; color: var(--color-red); border-color: var(--color-red);">Delete</button>' : ''}
            <button type="button" class="btn" id="btnModalCancel">Cancel</button>
            <button type="submit" class="btn btn-primary">Save</button>
        </div>
    `;
    modal.open(isEdit ? 'EDIT BILL' : 'ADD BILL', content, (data) => {
        data.amount = parseFloat(data.amount);
        data.paid = !!data.paid;
        if (isEdit) { store.updateBill(existingData.id, data); } 
        else { store.addBill(data); }
        // Re-open manager modal instead of closing entirely
        setTimeout(() => openBillsManagerModal(), 350); 
    }, isEdit ? (close) => {
        document.getElementById('btnModalDelete').addEventListener('click', () => {
            if(confirm('Delete this bill?')) {
                store.deleteBill(existingData.id);
                close();
                setTimeout(() => openBillsManagerModal(), 350); 
                if (window.app) window.app.handleRoute();
            }
        });
    } : null);
};

const openPastPaymentsModal = () => {
    const formatDateShort = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }); 
    };

    const billNames = store.data.bills.map(b => b.name);
    const pastPayments = store.data.spending
        .filter(s => s.category === 'Bills' || billNames.includes(s.description))
        .sort((a,b) => new Date(b.date) - new Date(a.date));

    const historyGroups = {};
    pastPayments.forEach(p => {
        const date = new Date(p.date);
        const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).toUpperCase();
        if (!historyGroups[monthYear]) historyGroups[monthYear] = [];
        historyGroups[monthYear].push(p);
    });

    let historyHtml = '';
    if (Object.keys(historyGroups).length > 0) {
        for (const [monthYear, payments] of Object.entries(historyGroups)) {
            historyHtml += `
            <div style="margin-bottom: 1.5rem;">
                <div style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: var(--text-secondary); border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 0.5rem;">
                    ${monthYear}
                </div>
                <div>
                    ${payments.map(p => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px dashed var(--border-color); color: var(--text-secondary);">
                        <div>
                            <div style="font-size: 0.95rem; font-weight: 500; margin-bottom: 0.2rem; color: var(--text-primary);">${p.description}</div>
                            <div style="font-size: 0.8rem;">Paid on ${formatDateShort(p.date)}</div>
                        </div>
                        <div style="font-size: 0.95rem; font-weight: 500; color: var(--text-primary);">${formatMoney(p.amount)}</div>
                    </div>
                    `).join('')}
                </div>
            </div>
            `;
        }
    } else {
        historyHtml = '<div style="padding: 2rem; text-align: center; color: var(--text-secondary);">No past payments recorded yet.</div>';
    }

    const content = `
        <div style="max-height: 400px; overflow-y: auto; padding-right: 0.5rem;">
            ${historyHtml}
        </div>
        <div class="form-actions" style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
            <button type="button" class="btn" id="btnModalCancel" style="flex:1;">Close</button>
        </div>
    `;

    modal.open('PAST PAYMENTS', content, () => {});
};

const openWishlistModal = (existingData = null) => {
    const isEdit = !!existingData;
    
    if (isEdit) {
        // Manual Edit Form
        const content = `
            <div class="form-group">
                <label class="form-label">Item Name</label>
                <input type="text" name="name" class="form-input" required value="${existingData.name}">
            </div>
            <div class="form-group">
                <label class="form-label">Store</label>
                <input type="text" name="store" class="form-input" required value="${existingData.store}">
            </div>
            <div class="form-group">
                <label class="form-label">Price</label>
                <input type="number" step="0.01" name="price" class="form-input" required value="${existingData.price}">
            </div>
            <div class="form-group">
                <label class="form-label">Image URL</label>
                <input type="text" name="img" class="form-input" value="${existingData.img}">
            </div>
            <div class="form-group">
                <label class="form-label">Status</label>
                <select name="status" class="form-input" required>
                    <option value="WANT" ${existingData.status === 'WANT' ? 'selected' : ''}>WANT</option>
                    <option value="AFFORDABLE" ${existingData.status === 'AFFORDABLE' ? 'selected' : ''}>AFFORDABLE</option>
                    <option value="NOT ENOUGH" ${existingData.status === 'NOT ENOUGH' ? 'selected' : ''}>NOT ENOUGH</option>
                    <option value="SAVE MORE" ${existingData.status === 'SAVE MORE' ? 'selected' : ''}>SAVING (SAVE MORE)</option>
                    <option value="BOUGHT" ${existingData.status === 'BOUGHT' ? 'selected' : ''}>BOUGHT</option>
                </select>
            </div>
            <div class="form-actions" style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1.5rem;">
                <button type="button" class="btn" id="btnModalDelete" style="margin-right: auto; color: var(--color-red); border-color: var(--color-red);">Delete</button>
                <button type="button" class="btn" id="btnModalCancel">Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
            </div>
        `;
        modal.open('Edit Wishlist Item', content, (data) => {
            data.price = parseFloat(data.price);
            // data.status is now populated from the form
            store.updateWishlist(existingData.id, data);
        }, (close) => {
            document.getElementById('btnModalDelete').addEventListener('click', () => {
                if(confirm('Delete this item?')) {
                    store.deleteWishlist(existingData.id);
                    close();
                    if (window.app) window.app.handleRoute();
                }
            });
        });
        return;
    }

    // Single-box Import Flow & Manual Flow
    const content = `
        <div class="tabs" style="margin-bottom: 1.5rem;">
            <div class="tab active" id="tabImport" style="cursor:pointer; flex: 1; text-align: center;">AUTO-IMPORT LINK</div>
            <div class="tab" id="tabManual" style="cursor:pointer; flex: 1; text-align: center;">MANUAL ENTRY</div>
        </div>

        <div id="importFlow">
            <div id="importContainer">
                <div class="form-group" style="margin-bottom: 2rem;">
                    <label class="form-label">Paste a product link...</label>
                    <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <input type="text" id="amazonImportUrl" class="form-input" placeholder="https://..." style="padding: 1rem; font-size: 1rem; flex-grow: 1;">
                        <button type="button" class="btn btn-primary" id="btnFetchLink">CONFIRM</button>
                    </div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.4rem;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                        Supports Amazon, Nike, Best Buy, Walmart, and most major stores!
                    </div>
                </div>
                <div id="importStatus" style="font-size: 0.8rem; text-align: center; color: var(--text-secondary); margin-bottom: 1rem;"></div>
                <div id="importLoading" style="display: none; text-align: center; padding: 1rem 0;">
                    <svg class="spinner" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="4.93" x2="19.07" y2="7.76"></line></svg>
                </div>
            </div>

            <div id="previewContainer" style="display: none; border: 1px solid var(--border-color); padding: 1rem; display: flex; gap: 1rem; margin-bottom: 2rem; background: var(--card-bg);">
                <div style="width: 100px; height: 100px; flex-shrink: 0; background: transparent; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                    <img id="previewImg" src="" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                </div>
                <div style="flex-grow: 1; display: flex; flex-direction: column; justify-content: center; min-width: 0;">
                    <div id="previewTitle" style="font-weight: 600; font-size: 0.9rem; margin-bottom: 0.25rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;"></div>
                    <div id="previewStore" style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.5rem;"></div>
                    <div id="previewPrice" style="font-size: 1.1rem; font-weight: 400;"></div>
                </div>
            </div>

            <div id="actionContainer" class="form-actions" style="display: none;">
                <button type="button" class="btn" id="btnModalCancelLocal">Cancel</button>
                <button type="button" class="btn btn-primary" id="btnConfirmAdd">ADD TO WISHLIST</button>
            </div>
        </div>

        <div id="manualFlow" style="display: none;">
            <div class="form-group">
                <label class="form-label">Item Name</label>
                <input type="text" id="manualName" class="form-input" required placeholder="e.g. Nike Air Max">
            </div>
            <div class="form-group">
                <label class="form-label">Store</label>
                <input type="text" id="manualStore" class="form-input" required placeholder="e.g. Nike">
            </div>
            <div class="form-group">
                <label class="form-label">Price</label>
                <input type="number" step="0.01" id="manualPrice" class="form-input" required placeholder="0.00">
            </div>
            <div class="form-group">
                <label class="form-label">Product Link (Optional)</label>
                <input type="text" id="manualUrl" class="form-input" placeholder="https://...">
            </div>
            <div class="form-group">
                <label class="form-label">Image URL (Optional)</label>
                <input type="text" id="manualImg" class="form-input" placeholder="https://...">
            </div>
            <div class="form-actions" style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1.5rem;">
                <button type="button" class="btn" id="btnManualCancel">Cancel</button>
                <button type="button" class="btn btn-primary" id="btnManualSave">SAVE ITEM</button>
            </div>
        </div>
    `;

    // Ensure display:none works correctly by hiding the preview initially (inline style above was overwritten)
    
    modal.open('Add to Wishlist', content, (data) => {
        store.addWishlist(data);
    }, (closeModal, saveAndClose) => {
        document.getElementById('previewContainer').style.display = 'none';
        
        let fetchedData = null;
        
        document.getElementById('btnModalCancelLocal').addEventListener('click', closeModal);
        
        document.getElementById('btnConfirmAdd').addEventListener('click', () => {
            if (fetchedData) {
                saveAndClose({
                    name: fetchedData.title,
                    price: parseFloat(fetchedData.price),
                    store: fetchedData.source || 'Amazon',
                    url: fetchedData.asin ? 'https://amazon.com/dp/' + fetchedData.asin : (fetchedData.originalUrl || ''),
                    img: fetchedData.img,
                    status: 'WANT'
                });
            }
        });

        const importInput = document.getElementById('amazonImportUrl');
        const statusText = document.getElementById('importStatus');
        const fetchBtn = document.getElementById('btnFetchLink');
        const loadingSpinner = document.getElementById('importLoading');
        
        fetchBtn.addEventListener('click', () => {
            const url = importInput.value.trim();
            if (url) {
                statusText.textContent = '';
                loadingSpinner.style.display = 'block';
                fetchBtn.disabled = true;
                
                fetch('http://localhost:8001/api/wishlist/import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: url })
                })
                .then(res => res.json())
                .then(data => {
                    loadingSpinner.style.display = 'none';
                    fetchBtn.disabled = false;
                    if (data.error) {
                        statusText.textContent = data.error;
                        statusText.style.color = 'var(--color-red)';
                    } else if (parseFloat(data.price) <= 1.50) {
                        // Price failed or hit $1 trap -> Route to Manual Entry seamlessly
                        document.getElementById('manualName').value = data.title || '';
                        document.getElementById('manualStore').value = data.source || '';
                        document.getElementById('manualUrl').value = url;
                        document.getElementById('manualImg').value = data.img || '';
                        document.getElementById('manualPrice').value = '';
                        
                        // Switch to manual tab
                        document.getElementById('tabManual').click();
                        document.getElementById('manualPrice').focus();
                    } else {
                        fetchedData = data;
                        // Add original url back into fetchedData just in case
                        fetchedData.originalUrl = url;
                        
                        document.getElementById('importContainer').style.display = 'none';
                        
                        document.getElementById('previewContainer').style.display = 'flex';
                        document.getElementById('actionContainer').style.display = 'flex';
                        
                        document.getElementById('previewImg').src = data.img;
                        document.getElementById('previewTitle').textContent = data.title;
                        document.getElementById('previewStore').textContent = data.source || 'Amazon';
                        document.getElementById('previewPrice').textContent = '$' + parseFloat(data.price).toFixed(2);
                    }
                })
                .catch(err => {
                    loadingSpinner.style.display = 'none';
                    fetchBtn.disabled = false;
                    statusText.textContent = 'Failed to fetch. Server may be down.';
                    statusText.style.color = 'var(--color-red)';
                });
            }
        });

        // Tabs Logic
        const tabImport = document.getElementById('tabImport');
        const tabManual = document.getElementById('tabManual');
        const importFlow = document.getElementById('importFlow');
        const manualFlow = document.getElementById('manualFlow');

        tabImport.addEventListener('click', () => {
            tabImport.classList.add('active');
            tabManual.classList.remove('active');
            importFlow.style.display = 'block';
            manualFlow.style.display = 'none';
        });

        tabManual.addEventListener('click', () => {
            tabManual.classList.add('active');
            tabImport.classList.remove('active');
            manualFlow.style.display = 'block';
            importFlow.style.display = 'none';
        });

        // Manual Flow Logic
        document.getElementById('btnManualCancel').addEventListener('click', closeModal);
        document.getElementById('btnManualSave').addEventListener('click', () => {
            const name = document.getElementById('manualName').value.trim();
            const storeName = document.getElementById('manualStore').value.trim();
            const price = parseFloat(document.getElementById('manualPrice').value);
            const url = document.getElementById('manualUrl').value.trim();
            const img = document.getElementById('manualImg').value.trim();

            if (!name || isNaN(price)) {
                alert('Please enter a valid Item Name and Price.');
                return;
            }

            saveAndClose({
                name: name,
                price: price,
                store: storeName || 'Other',
                url: url,
                img: img,
                status: 'WANT'
            });
        });
    });
};

const openEditBudgetsModal = () => {
    const generateRow = (cat = '', limit = '', icon = 'box') => `
        <div class="form-group budget-row" draggable="true" style="display:flex; justify-content:space-between; align-items:center; gap: 0.5rem; margin-bottom: 0.75rem; cursor: grab; background: var(--bg-color); padding: 0.25rem; border-radius: 6px; border: 1px solid transparent; transition: all 0.2s;">
            <input type="hidden" class="budget-icon-input" value="${icon}">
            <button type="button" class="btn-icon-picker" style="width: 48px; height: 48px; padding: 0; background: var(--bg-color); border: 1px solid var(--border-color); border-radius: 4px; display:flex; align-items:center; justify-content:center; cursor:pointer; color: var(--text-primary); flex-shrink: 0;">
                ${window.AppIcons[icon] || window.AppIcons['box']}
            </button>
            <input type="text" class="form-input budget-cat" placeholder="Category Name" value="${cat}" required style="flex-grow: 1;">
            <div class="limit-wrapper" style="position:relative; flex: 0 0 130px;">
                <span style="position:absolute; left:0.75rem; top:50%; transform:translateY(-50%); color: var(--text-secondary);">$</span>
                <input type="number" step="0.01" class="form-input budget-limit" style="width: 100%; padding-left: 1.75rem; box-sizing: border-box;" placeholder="Uncapped" value="${limit || ''}">
            </div>
            <button type="button" class="btn-remove-budget" style="background:none; border:none; color: var(--color-red); cursor: pointer; padding: 0.25rem;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>
    `;

    const initialRows = store.data.budgets.map(b => generateRow(b.category, b.limit, b.icon || 'box')).join('');

    const iconGridHtml = Object.keys(window.AppIcons).map(key => 
        `<button type="button" class="icon-grid-item" data-icon="${key}" style="padding: 0.5rem; background:none; border:none; color: var(--text-primary); cursor:pointer; border-radius:4px; display:flex; align-items:center; justify-content:center;">
            ${window.AppIcons[key]}
        </button>`
    ).join('');

    const content = `
        <div id="iconPickerPopover" style="display:none; position:absolute; z-index: 100; background: var(--bg-color); border: 1px solid var(--border-color); border-radius: 6px; padding: 0.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 220px;">
            <div style="display:grid; grid-template-columns: repeat(5, 1fr); gap: 0.25rem;">
                ${iconGridHtml}
            </div>
            <div id="iconPickerLabel" style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--border-color); text-align: center; font-size: 0.65rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; height: 18px;">
                SELECT AN ICON
            </div>
        </div>
        <div style="margin-bottom: 1.5rem; max-height: 50vh; overflow-y: auto; padding-right: 0.5rem; position:relative;">
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.5rem; display: flex; justify-content: space-between;">
                <span>Edit your monthly spending limits.</span>
                <span style="font-size: 0.75rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.25rem;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>
                    Drag to reorder
                </span>
            </p>
            <div id="budgetsList">
                ${initialRows}
            </div>
            <button type="button" class="btn btn-outline" id="btnAddBudget" style="width: 100%; margin-top: 1rem; border-style: dashed;">+ Add Category</button>
        </div>
        <div class="form-actions" style="display: flex; gap: 0.5rem; justify-content: flex-end;">
            <button type="button" class="btn" id="btnModalCancel" style="flex:1;">Cancel</button>
            <button type="submit" class="btn btn-primary" style="flex:1;">Save Budgets</button>
        </div>
    `;

    modal.open('EDIT BUDGETS', content, (data) => {
        const rows = document.querySelectorAll('#budgetsList .budget-row');
        const newBudgets = [];
        
        rows.forEach(row => {
            const icon = row.querySelector('.budget-icon-input').value.trim();
            const cat = row.querySelector('.budget-cat').value.trim();
            const limit = parseFloat(row.querySelector('.budget-limit').value) || 0;
            if (cat) {
                newBudgets.push({ category: cat, limit: limit, icon: icon || 'box' });
            }
        });
        
        store.updateBudgets(newBudgets);
    }, (closeModal) => {
        const list = document.getElementById('budgetsList');
        const popover = document.getElementById('iconPickerPopover');
        let currentActiveIconBtn = null;
        let currentActiveIconInput = null;

        // Hide popover if clicking outside
        document.addEventListener('click', (e) => {
            if (!popover.contains(e.target) && !e.target.closest('.btn-icon-picker')) {
                popover.style.display = 'none';
            }
        });

        const iconLabel = document.getElementById('iconPickerLabel');

        popover.addEventListener('mouseover', (e) => {
            const item = e.target.closest('.icon-grid-item');
            if (item) {
                iconLabel.textContent = item.dataset.icon.replace('-', ' ');
            }
        });

        popover.addEventListener('mouseleave', () => {
            iconLabel.textContent = 'SELECT AN ICON';
        });

        popover.addEventListener('click', (e) => {
            const item = e.target.closest('.icon-grid-item');
            if (item && currentActiveIconBtn) {
                const iconKey = item.dataset.icon;
                currentActiveIconBtn.innerHTML = window.AppIcons[iconKey];
                currentActiveIconInput.value = iconKey;
                popover.style.display = 'none';
            }
        });
        
        list.addEventListener('click', (e) => {
            const row = e.target.closest('.budget-row');
            if (!row) return;

            const iconBtn = e.target.closest('.btn-icon-picker');
            if (iconBtn) {
                currentActiveIconBtn = iconBtn;
                currentActiveIconInput = row.querySelector('.budget-icon-input');
                
                // Position popover relative to the button
                const btnRect = iconBtn.getBoundingClientRect();
                const containerRect = document.querySelector('.modal-content').getBoundingClientRect();
                
                popover.style.display = 'block';
                popover.style.top = (btnRect.bottom - containerRect.top + 5) + 'px';
                popover.style.left = (btnRect.left - containerRect.left) + 'px';
                return;
            }

            if (e.target.closest('.btn-remove-budget')) {
                row.remove();
            }
        });

        const autoIconMap = [
            { icon: 'shopping-cart', words: ['grocery', 'groceries', 'market', 'supermarket', 'walmart', 'target'] },
            { icon: 'dining', words: ['dining', 'eat', 'restaurant', 'lunch', 'dinner', 'breakfast', 'cafe', 'coffee', 'food', 'pizza', 'burger'] },
            { icon: 'shopping-bag', words: ['shopping', 'clothes', 'clothing', 'shoes', 'apparel', 'amazon', 'mall'] },
            { icon: 'truck', words: ['transport', 'transportation', 'car', 'gas', 'fuel', 'auto', 'uber', 'lyft', 'transit', 'bus', 'train', 'parking'] },
            { icon: 'book', words: ['school', 'education', 'tuition', 'class', 'book', 'college', 'university'] },
            { icon: 'home', words: ['house', 'home', 'rent', 'mortgage', 'apartment', 'apt', 'hoa', 'utility', 'utilities'] },
            { icon: 'activity', words: ['game', 'gaming', 'play', 'entertainment', 'movie', 'cinema', 'fun', 'hobby'] },
            { icon: 'smartphone', words: ['phone', 'mobile', 'cell', 'internet', 'wifi', 'cable'] },
            { icon: 'music', words: ['music', 'spotify', 'apple', 'concert', 'audio', 'podcast'] },
            { icon: 'heart', words: ['pet', 'dog', 'cat', 'vet', 'health', 'medical', 'doctor', 'medicine', 'hospital', 'gym', 'fitness'] },
            { icon: 'gift', words: ['gift', 'present', 'birthday', 'charity', 'donation', 'holiday'] },
            { icon: 'star', words: ['favorite', 'special', 'award', 'prize'] },
            { icon: 'cpu', words: ['tech', 'technology', 'computer', 'software', 'hardware', 'electronics', 'app'] },
            { icon: 'camera', words: ['photo', 'camera', 'photography', 'video'] }
        ];

        list.addEventListener('input', (e) => {
            if (e.target.classList.contains('budget-cat')) {
                const val = e.target.value.toLowerCase();
                const row = e.target.closest('.budget-row');
                const iconBtn = row.querySelector('.btn-icon-picker');
                const iconInput = row.querySelector('.budget-icon-input');
                
                for (let mapping of autoIconMap) {
                    if (mapping.words.some(w => val.includes(w))) {
                        iconBtn.innerHTML = window.AppIcons[mapping.icon];
                        iconInput.value = mapping.icon;
                        break;
                    }
                }
            }
        });

        document.getElementById('btnAddBudget').addEventListener('click', () => {
            const list = document.getElementById('budgetsList');
            list.insertAdjacentHTML('beforeend', generateRow());
        });

        // Drag and Drop Logic
        let draggedItem = null;

        list.addEventListener('dragstart', function(e) {
            const row = e.target.closest('.budget-row');
            if (row) {
                draggedItem = row;
                e.dataTransfer.effectAllowed = 'move';
                setTimeout(() => row.style.opacity = '0.4', 0);
            }
        });

        list.addEventListener('dragend', function(e) {
            const row = e.target.closest('.budget-row');
            if (row) {
                row.style.opacity = '1';
                draggedItem = null;
            }
        });

        list.addEventListener('dragover', function(e) {
            e.preventDefault(); 
            const row = e.target.closest('.budget-row');
            if (row && row !== draggedItem) {
                const bounding = row.getBoundingClientRect();
                const offset = bounding.y + (bounding.height / 2);
                if (e.clientY - offset > 0) {
                    row.style.borderBottom = '2px solid var(--color-green)';
                    row.style.borderTop = '1px solid transparent';
                } else {
                    row.style.borderTop = '2px solid var(--color-green)';
                    row.style.borderBottom = '1px solid transparent';
                }
            }
        });

        list.addEventListener('dragleave', function(e) {
            const row = e.target.closest('.budget-row');
            if (row) {
                row.style.borderTop = '1px solid transparent';
                row.style.borderBottom = '1px solid transparent';
            }
        });

        list.addEventListener('drop', function(e) {
            e.preventDefault();
            const row = e.target.closest('.budget-row');
            if (row && row !== draggedItem) {
                row.style.borderTop = '1px solid transparent';
                row.style.borderBottom = '1px solid transparent';
                const bounding = row.getBoundingClientRect();
                const offset = bounding.y + (bounding.height / 2);
                if (e.clientY - offset > 0) {
                    row.after(draggedItem);
                } else {
                    row.before(draggedItem);
                }
            }
        });
    });
};

window.openExpenseModal = openExpenseModal;
window.openIncomeModal = openIncomeModal;
window.openIncomeSourceModal = openIncomeSourceModal;
window.openIncomeConfirmModal = openIncomeConfirmModal;
window.openBillModal = openBillModal;
window.openWishlistModal = openWishlistModal;
window.openEditBudgetsModal = openEditBudgetsModal;
