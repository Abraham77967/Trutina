const renderHistory = () => {
    const container = document.createElement('div');
    const calc = store.getCalculations();
    
    // Calculate YTD
    let totalIncome = 0;
    let totalSpent = 0;
    store.data.history.forEach(h => {
        totalIncome += h.income;
        totalSpent += h.spent;
    });
    const netChange = totalIncome - totalSpent;
    const avgPerMonth = netChange / store.data.history.length;

    container.innerHTML = `
        <div class="top-bar">
            <div class="page-title"><span class="page-title-num">06</span> HISTORY</div>
            <div class="date-selector">SCHOOL YEAR 2025-2026 <span>▼</span></div>
        </div>
        
        <div class="panel mb-2" style="padding: 0;">
            <div style="display:grid; grid-template-columns: 1fr 1fr 1fr 1fr; padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: var(--text-secondary);">
                <div>MONTH</div>
                <div style="text-align:right;">INCOME</div>
                <div style="text-align:right;">SPENT</div>
                <div style="text-align:right;">NET</div>
            </div>
            
            <div class="list-container" style="padding: 0 1.5rem;">
                ${store.data.history.map(row => {
                    const isPositive = row.net > 0;
                    const netColor = isPositive ? 'var(--color-green)' : 'var(--color-red)';
                    const netPrefix = isPositive ? '+' : '';
                    const dotClass = isPositive ? 'status-green' : 'status-red';
                    
                    return `
                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr 1fr; padding: 1.25rem 0; border-bottom: 1px solid var(--border-color); align-items:center;">
                        <div style="font-size: 0.75rem; font-weight: 600;">${row.month}</div>
                        <div style="font-size: 0.85rem; text-align:right;">${formatMoney(row.income)}</div>
                        <div style="font-size: 0.85rem; text-align:right;">${formatMoney(row.spent)}</div>
                        <div style="font-size: 0.85rem; font-weight: 600; text-align:right; color: ${netColor};">
                            ${netPrefix}${formatMoney(row.net)}
                            <span class="status-light ${dotClass}" style="margin: 0 0 0 0.5rem; display:inline-block;"></span>
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>
            <a href="#" class="panel-footer-link" style="padding: 1rem 1.5rem;">VIEW ALL MONTHS <span>></span></a>
        </div>

        <div class="mb-2">
            <span class="text-label" style="margin-bottom: 1rem;">YEAR-TO-DATE SUMMARY</span>
            <div class="grid-4">
                <div class="panel" style="padding: 1rem; align-items:center;">
                    <span class="text-label" style="font-size:0.6rem;">TOTAL INCOME</span>
                    <div class="display-amount" style="font-size: 1.25rem; margin-top:0.5rem;">${formatMoney(totalIncome)}</div>
                </div>
                <div class="panel" style="padding: 1rem; align-items:center;">
                    <span class="text-label" style="font-size:0.6rem;">TOTAL SPENT</span>
                    <div class="display-amount" style="font-size: 1.25rem; margin-top:0.5rem;">${formatMoney(totalSpent)}</div>
                </div>
                <div class="panel" style="padding: 1rem; align-items:center;">
                    <span class="text-label" style="font-size:0.6rem;">NET CHANGE</span>
                    <div class="display-amount" style="font-size: 1.25rem; margin-top:0.5rem; color: var(--color-green);">+${formatMoney(Math.abs(netChange))}</div>
                </div>
                <div class="panel" style="padding: 1rem; align-items:center;">
                    <span class="text-label" style="font-size:0.6rem;">AVG. / MONTH</span>
                    <div class="display-amount" style="font-size: 1.25rem; margin-top:0.5rem; color: var(--color-green);">+${formatMoney(Math.abs(avgPerMonth))}</div>
                </div>
            </div>
        </div>

        <div class="panel">
            <span class="text-label" style="margin-bottom: 1.5rem;">MONTHLY SPENDING OVERVIEW</span>
            <div style="height: 200px; width: 100%;">
                <canvas id="historyChart"></canvas>
            </div>
        </div>
    `;

    // Wait for DOM to attach before rendering chart
    setTimeout(() => {
        const ctx = document.getElementById('historyChart');
        if (!ctx) return;
        
        let labels = [];
        let data = [];

        if (store.data.history && store.data.history.length > 0) {
            labels = store.data.history.map(item => item.month.substring(0, 3));
            data = store.data.history.map(item => item.spent);
        } else {
            const currentMonthIndex = new Date().getMonth();
            const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            for(let i=5; i>=0; i--) {
                let m = currentMonthIndex - i;
                if(m < 0) m += 12;
                labels.push(monthNames[m]);
                data.push(0);
            }
        }

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: '#B34E45', // Red color
                    barPercentage: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + (value / 1000) + 'k';
                            },
                            stepSize: 1000,
                            font: { family: "'Inter', sans-serif", size: 10 }
                        },
                        grid: { color: '#E2DFD6' },
                        border: { display: false }
                    },
                    x: {
                        grid: { display: false },
                        border: { display: false },
                        ticks: {
                            font: { family: "'Inter', sans-serif", size: 10, weight: 600 }
                        }
                    }
                }
            }
        });
    }, 50);

    return container;
};
