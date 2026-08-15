// Mock data for initial presentation
const initialData = {
    incomeSources: [
        { id: 1, name: 'Job (Part-time)', amount: 310, frequency: 'Weekly', nextDate: '2026-08-14' },
        { id: 2, name: 'Allowance (Family)', amount: 150, frequency: 'Monthly', nextDate: '2026-08-23' }
    ],
    income: [
        { id: 1, sourceId: 1, name: 'Job Paycheck', description: '', amount: 310, date: '2026-08-14', status: 'EXPECTED' },
        { id: 2, sourceId: 1, name: 'Job Paycheck', description: '', amount: 310, date: '2026-08-21', status: 'EXPECTED' },
        { id: 3, sourceId: 2, name: 'Allowance (Family)', description: '', amount: 150, date: '2026-08-23', status: 'EXPECTED' },
        { id: 4, sourceId: 1, name: 'Job Paycheck', description: 'Weekly paycheck', amount: 302.45, date: '2026-08-08', status: 'RECEIVED' },
        { id: 5, sourceId: null, name: 'Sold Monitor', description: 'Sold old monitor on Facebook Marketplace', amount: 120, date: '2026-08-04', status: 'RECEIVED' },
        { id: 6, sourceId: 1, name: 'Job Paycheck', description: 'Weekly paycheck', amount: 315, date: '2026-08-01', status: 'RECEIVED' }
    ],
    bills: [
        { id: 1, name: 'Rent', amount: 650, dueDate: '2026-09-01', frequency: 'monthly', category: 'Housing', paid: false },
        { id: 2, name: 'Internet', amount: 45, dueDate: '2026-09-03', frequency: 'monthly', category: 'Utilities', paid: false },
        { id: 3, name: 'Phone Bill', amount: 35, dueDate: '2026-08-15', frequency: 'monthly', category: 'Utilities', paid: true }
    ],
    spending: [
        { id: 1, amount: 92.18, category: 'Groceries', description: 'Walmart', date: '2026-08-08' },
        { id: 2, amount: 45.60, category: 'Dining Out', description: 'Restaurant', date: '2026-08-08' },
        { id: 3, amount: 32.00, category: 'Transportation', description: 'Gas Station', date: '2026-08-07' }
    ],
    budgets: [
        { category: 'Groceries', limit: 200, icon: 'shopping-cart' },
        { category: 'Dining Out', limit: 100, icon: 'dining' },
        { category: 'Shopping', limit: 120, icon: 'shopping-bag' },
        { category: 'Transportation', limit: 80, icon: 'truck' },
        { category: 'School', limit: 60, icon: 'book' },
        { category: 'Household', limit: 50, icon: 'home' },
        { category: 'Other', limit: 40, icon: 'box' }
    ],
    wishlist: [
        { id: 1, name: 'LED Floor Lamp with Remote Control', store: 'Amazon', price: 31.99, url: '#', status: 'WANT', inPlan: false, img: 'https://dummyimage.com/300x300/e2dfd6/111111&text=Lamp' },
        { id: 2, name: 'THE NORTH FACE Surge Commuter Laptop Backpack', store: 'Amazon', price: 120.17, url: '#', status: 'WANT', inPlan: true, img: 'https://dummyimage.com/300x300/e2dfd6/111111&text=Backpack' },
        { id: 3, name: 'ShedRain Vortex Windproof Compact Travel Umbrella', store: 'Amazon', price: 50.00, url: '#', status: 'WANT', inPlan: true, img: 'https://dummyimage.com/300x300/e2dfd6/111111&text=Umbrella' },
        { id: 4, name: 'Anker Nano Charging Station', store: 'Amazon', price: 69.99, url: '#', status: 'WANT', inPlan: false, img: 'https://dummyimage.com/300x300/e2dfd6/111111&text=Charger' }
    ],
    history: [
        { month: 'JULY', income: 1284.00, spent: 1100.00, net: 184.00 },
        { month: 'AUGUST', income: 1850.00, spent: 1532.76, net: 317.24 },
        { month: 'SEPTEMBER', income: 1620.00, spent: 1436.18, net: 183.82 },
        { month: 'OCTOBER', income: 1680.00, spent: 1742.63, net: -62.63 },
        { month: 'NOVEMBER', income: 1600.00, spent: 1328.91, net: 271.09 },
        { month: 'DECEMBER', income: 2140.00, spent: 1735.25, net: 404.75 }
    ],
    settings: { taxZip: '', taxRate: 0 }
};

const defaultEmptyData = {
    incomeSources: [],
    income: [],
    bills: [],
    spending: [],
    budgets: [
        { category: 'Groceries', limit: 200, icon: 'shopping-cart' },
        { category: 'Dining Out', limit: 100, icon: 'coffee' },
        { category: 'Shopping', limit: 120, icon: 'shopping-bag' },
        { category: 'Transportation', limit: 80, icon: 'truck' },
        { category: 'School', limit: 60, icon: 'book' },
        { category: 'Household', limit: 50, icon: 'home' },
        { category: 'Other', limit: 40, icon: 'box' }
    ],
    wishlist: [],
    history: [],
    settings: { taxZip: '', taxRate: 0 }
};

window.AppIcons = {
    'shopping-cart': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`,
    'coffee': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>`,
    'shopping-bag': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`,
    'truck': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>`,
    'book': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
    'home': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
    'box': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`,
    'activity': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`,
    'heart': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
    'monitor': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
    'smartphone': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>`,
    'tool': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`,
    'zap': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
    'music': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>`,
    'camera': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>`,
    'dining': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>`,
    'plane': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 5-4 4-3-1-2 2 5 2 2 5 2-2-1-3 4-4 5 6l1.2-.7c.4-.2.7-.6.6-1.1z"></path></svg>`,
    'gift': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>`,
    'star': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    'cpu': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>`
};

const store = {
    data: null,
    mode: 'demo',

    init(remoteData) {
        this.mode = localStorage.getItem('krutina_mode') || 'demo';
        const key = this.mode === 'demo' ? 'krutina_data_demo' : 'krutina_data_user';

        if (remoteData) {
            this.data = remoteData;
        } else {
            const stored = localStorage.getItem(key);
            if (stored) {
                this.data = JSON.parse(stored);
                // Auto-migrate icons for existing categories
                const defaultIconMap = {
                    'Groceries': 'shopping-cart',
                    'Dining Out': 'dining',
                    'Shopping': 'shopping-bag',
                    'Transportation': 'truck',
                    'School': 'book',
                    'Household': 'home',
                    'Other': 'box'
                };
                let needsSave = false;
                if (this.data.budgets) {
                    this.data.budgets.forEach(b => {
                        if (!b.icon || !window.AppIcons[b.icon]) {
                            b.icon = defaultIconMap[b.category] || 'box';
                            needsSave = true;
                        }
                    });
                }
                if (!this.data.settings) {
                    this.data.settings = { taxState: '', taxRate: 0 };
                    needsSave = true;
                }
                if (needsSave) this.save();
            } else {
                if (this.mode === 'demo') {
                    // Try to load from legacy v9 if it exists for backwards compatibility
                    const legacy = localStorage.getItem('krutina_data_v9');
                    if (legacy) {
                        this.data = JSON.parse(legacy);
                    } else {
                        this.data = JSON.parse(JSON.stringify(initialData));
                    }
                } else {
                    this.data = JSON.parse(JSON.stringify(defaultEmptyData));
                }
                this.save();
            }
        }
        
        // Cleanup: ensure only the ONE nearest upcoming payment is kept per source (removes the accidental 4-month projection spam)
        if (this.data && this.data.incomeSources) {
            let cleaned = false;
            this.data.incomeSources.forEach(source => {
                const expectedForSource = this.data.income
                    .filter(inc => inc.sourceId === source.id && inc.status === 'EXPECTED')
                    .sort((a, b) => new Date(a.date) - new Date(b.date));
                if (expectedForSource.length > 1) {
                    const toKeepId = expectedForSource[0].id;
                    this.data.income = this.data.income.filter(inc => 
                        !(inc.sourceId === source.id && inc.status === 'EXPECTED' && inc.id !== toKeepId)
                    );
                    cleaned = true;
                }
            });
            if (cleaned) this.save();
        }
        
        this.evaluateAutoPay();
    },

    evaluateAutoPay() {
        if (!this.data || !this.data.bills) return;
        const today = new Date().toISOString().split('T')[0];
        let needsSave = false;
        this.data.bills.forEach(bill => {
            if (bill.autoPay && !bill.paid && bill.dueDate <= today) {
                bill.paid = true;
                this.data.spending.push({
                    id: Date.now() + Math.floor(Math.random() * 1000),
                    amount: bill.amount,
                    category: bill.category || 'Bills',
                    description: bill.name,
                    date: today
                });
                needsSave = true;
            }
        });
        if (needsSave) this.save();
    },

    setMode(mode) {
        this.mode = mode;
        localStorage.setItem('krutina_mode', mode);
        this.init();
    },

    save() {
        if (window.saveToFirestore) {
            window.saveToFirestore(this.data);
        }
        const key = this.mode === 'demo' ? 'krutina_data_demo' : 'krutina_data_user';
        localStorage.setItem(key, JSON.stringify(this.data));
    },

    getCalculations() {
        // Calculate dynamically
        const incomeReceived = this.data.income.reduce((sum, item) => sum + (item.status === 'RECEIVED' ? item.amount : 0), 0);
        const incomeExpected = this.data.income.reduce((sum, item) => sum + (item.status === 'EXPECTED' ? item.amount : 0), 0);
        const incomeProjected = incomeReceived + incomeExpected;
        const incomePercent = incomeProjected > 0 ? Math.round((incomeReceived / incomeProjected) * 100) : 0;
        
        const flexCategories = this.data.budgets.map(b => b.category);
        const spentThisMonth = this.data.spending
            .filter(item => flexCategories.includes(item.category))
            .reduce((sum, item) => sum + item.amount, 0);
            
        const spentLimit = this.data.budgets.reduce((sum, item) => sum + item.limit, 0);
        const spentPercent = spentLimit > 0 ? Math.round((spentThisMonth / spentLimit) * 100) : 0;

        const paidBills = this.data.bills.reduce((sum, item) => sum + (item.paid ? item.amount : 0), 0);
        const reservedBills = this.data.bills.reduce((sum, item) => sum + (!item.paid ? item.amount : 0), 0);
        const totalBills = paidBills + reservedBills;

        const available = incomeReceived - totalBills - spentThisMonth;
        
        const taxRate = this.data.settings?.taxRate || 0;
        const savingsAmount = this.data.wishlist.reduce((sum, item) => sum + (item.saved || 0), 0);
        const savingsGoal = this.data.wishlist.reduce((sum, item) => sum + item.price * (1 + taxRate / 100), 0);
        const savingsPercent = savingsGoal > 0 ? Math.round((savingsAmount / savingsGoal) * 100) : 0;

        return {
            available,
            incomeReceived,
            incomeExpected,
            incomeProjected,
            incomePercent,
            spentThisMonth,
            spentLimit,
            spentPercent,
            savingsAmount,
            savingsGoal,
            savingsPercent,
            totalBills,
            paidBills,
            reservedBills
        };
    },

    getCategorySpending(categoryName) {
        return this.data.spending
            .filter(s => s.category === categoryName)
            .reduce((sum, item) => sum + item.amount, 0);
    },

    // --- CRUD OPERATIONS ---

    addExpense(expense) {
        this.data.spending.push({ id: Date.now(), ...expense });
        this.save();
    },
    updateExpense(id, expense) {
        const index = this.data.spending.findIndex(e => e.id == id);
        if (index !== -1) { this.data.spending[index] = { ...this.data.spending[index], ...expense }; this.save(); }
    },
    deleteExpense(id) {
        this.data.spending = this.data.spending.filter(e => e.id != id);
        this.save();
    },

    // Income Sources
    addIncomeSource(source) {
        const newSource = { id: Date.now(), ...source };
        this.data.incomeSources.push(newSource);
        
        // Auto-generate the first expected entry
        this.data.income.push({
            id: Date.now() + 1,
            sourceId: newSource.id,
            name: newSource.name,
            amount: newSource.amount,
            date: newSource.nextDate,
            status: 'EXPECTED'
        });
        this.save();
    },
    updateIncomeSource(id, source) {
        const index = this.data.incomeSources.findIndex(e => e.id == id);
        if (index !== -1) { this.data.incomeSources[index] = { ...this.data.incomeSources[index], ...source }; this.save(); }
    },
    deleteIncomeSource(id) {
        this.data.incomeSources = this.data.incomeSources.filter(e => e.id != id);
        this.save();
    },

    // Income Entries
    addIncome(income) {
        this.data.income.push({ id: Date.now(), ...income, status: 'RECEIVED' });
        this.save();
    },
    updateIncome(id, income) {
        const index = this.data.income.findIndex(e => e.id == id);
        if (index !== -1) { this.data.income[index] = { ...this.data.income[index], ...income }; this.save(); }
    },
    deleteIncome(id) {
        this.data.income = this.data.income.filter(e => e.id != id);
        this.save();
    },

    // Bills
    markBillPaid(id) {
        const bill = this.data.bills.find(b => b.id == id);
        if (bill && !bill.paid) {
            bill.paid = true;
            this.data.spending.push({
                id: Date.now(),
                amount: bill.amount,
                category: bill.category || 'Bills',
                description: bill.name,
                date: new Date().toISOString().split('T')[0]
            });
            this.save();
        }
    },
    unmarkBillPaid(id) {
        const bill = this.data.bills.find(b => b.id == id);
        if (bill && bill.paid) {
            bill.paid = false;
            // Find and remove the auto-generated transaction
            const reversed = [...this.data.spending].reverse();
            const revIndex = reversed.findIndex(s => s.amount === bill.amount && s.description === bill.name && (s.category === 'Bills' || s.category === bill.category));
            if (revIndex !== -1) {
                const actualIndex = this.data.spending.length - 1 - revIndex;
                this.data.spending.splice(actualIndex, 1);
            }
            this.save();
        }
    },

    confirmExpectedIncome(id, actualAmount, actualDate, description) {
        const index = this.data.income.findIndex(e => e.id == id);
        if (index !== -1) {
            const entry = this.data.income[index];
            entry.amount = actualAmount;
            entry.date = actualDate;
            if (description !== undefined) {
                entry.description = description;
            }
            entry.status = 'RECEIVED';
            
            // Spawn next if tied to a source
            if (entry.sourceId) {
                const source = this.data.incomeSources.find(s => s.id === entry.sourceId);
                if (source) {
                    const currentNextDate = new Date(source.nextDate);
                    // Determine next date based on frequency
                    if (source.frequency === 'Weekly') {
                        currentNextDate.setDate(currentNextDate.getDate() + 7);
                    } else if (source.frequency === 'Biweekly') {
                        currentNextDate.setDate(currentNextDate.getDate() + 14);
                    } else if (source.frequency === 'Monthly') {
                        currentNextDate.setMonth(currentNextDate.getMonth() + 1);
                    }
                    
                    const nextDateStr = currentNextDate.toISOString().split('T')[0];
                    source.nextDate = nextDateStr;
                    
                    this.data.income.push({
                        id: Date.now(),
                        sourceId: source.id,
                        name: source.name,
                        amount: source.amount,
                        date: nextDateStr,
                        status: 'EXPECTED'
                    });
                }
            }
            this.save();
        }
    },

    addBill(bill) {
        this.data.bills.push({ id: Date.now(), ...bill });
        this.save();
        this.evaluateAutoPay();
    },
    updateBill(id, bill) {
        const index = this.data.bills.findIndex(e => e.id == id);
        if (index !== -1) { 
            this.data.bills[index] = { ...this.data.bills[index], ...bill }; 
            this.save();
            this.evaluateAutoPay();
        }
    },
    deleteBill(id) {
        this.data.bills = this.data.bills.filter(e => e.id != id);
        this.save();
    },

    addWishlist(item) {
        this.data.wishlist.push({ id: Date.now(), ...item });
        this.save();
    },
    updateWishlist(id, item) {
        const index = this.data.wishlist.findIndex(e => e.id == id);
        if (index !== -1) { this.data.wishlist[index] = { ...this.data.wishlist[index], ...item }; this.save(); }
    },
    deleteWishlist(id) {
        this.data.wishlist = this.data.wishlist.filter(e => e.id != id);
        this.save();
    },
    togglePlan(id) {
        const index = this.data.wishlist.findIndex(e => e.id == id);
        if (index !== -1) {
            this.data.wishlist[index].inPlan = !this.data.wishlist[index].inPlan;
            this.save();
        }
    },
    reorderWishlist(startIndex, endIndex) {
        if (startIndex < 0 || startIndex >= this.data.wishlist.length || endIndex < 0 || endIndex >= this.data.wishlist.length) return;
        const [removed] = this.data.wishlist.splice(startIndex, 1);
        this.data.wishlist.splice(endIndex, 0, removed);
        this.save();
    },
    updateWishlistOrderForSubset(subsetIds) {
        // Extract the items that are in the subset
        const subsetItems = subsetIds.map(id => this.data.wishlist.find(i => i.id === id)).filter(Boolean);
        // Find their original indices in the main array
        const originalIndices = subsetIds.map(id => this.data.wishlist.findIndex(i => i.id === id)).filter(idx => idx !== -1).sort((a,b) => a - b);
        // Place them back in the new order at those indices
        originalIndices.forEach((origIdx, i) => {
            this.data.wishlist[origIdx] = subsetItems[i];
        });
        this.save();
    },

    updateBudgets(newBudgets) {
        this.data.budgets = newBudgets;
        this.save();
    },

    resetData(type) {
        if (type === 'spending') {
            this.data.spending = [];
        } else if (type === 'income') {
            this.data.income = [];
            this.data.incomeSources = [];
        } else if (type === 'bills') {
            this.data.bills = [];
        } else if (type === 'wishlist') {
            this.data.wishlist = [];
        } else if (type === 'history') {
            this.data.history = [];
        } else if (type === 'all') {
            this.data.incomeSources = [];
            this.data.income = [];
            this.data.bills = [];
            this.data.spending = [];
            this.data.wishlist = [];
            this.data.history = [];
        }
        this.save();
    },

    importData(parsedData) {
        if (typeof parsedData !== 'object' || !parsedData) return;
        const validKeys = ['spending', 'income', 'incomeSources', 'bills', 'wishlist', 'history', 'budgets'];
        for (const key of validKeys) {
            if (parsedData[key] && Array.isArray(parsedData[key])) {
                this.data[key] = parsedData[key];
            }
        }
        this.save();
    }
};
