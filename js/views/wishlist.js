const renderWishlist = () => {
    const container = document.createElement('div');
    const calc = store.getCalculations();
    
    // Calculate Purchase Plan stats
    const taxRate = store.data.settings?.taxRate || 0;
    const taxZip = store.data.settings?.taxZip || '';
    const planItems = store.data.wishlist.filter(item => item.inPlan);
    const totalPlanCost = planItems.reduce((sum, item) => sum + item.price * (1 + taxRate / 100), 0);
    // Dummy savings data for visual logic, since we don't have a direct mapping in store.
    // In a real app this would be driven by store budgets/savings.
    const savedAmount = 80.00; 
    const remainingAmount = Math.max(0, totalPlanCost - savedAmount);
    const percentSaved = totalPlanCost > 0 ? Math.min(100, Math.round((savedAmount / totalPlanCost) * 100)) : 0;

    let planBannerHTML = '';
    if (planItems.length > 0) {
        planBannerHTML = `
        <div class="purchase-plan-banner">
            <div class="plan-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--color-green);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                PURCHASE PLAN
            </div>
            
            <div class="plan-items-container">
                <div class="plan-items-mini-stack">
                    ${planItems.slice(0, 5).map((item) => `
                        <div class="mini-avatar">
                            <img src="${item.img || 'https://dummyimage.com/100x100/e2dfd6/111111&text=Item'}" alt="${item.name}">
                        </div>
                    `).join('')}
                    ${planItems.length > 5 ? `<div class="mini-avatar extra">+${planItems.length - 5}</div>` : ''}
                </div>
                
                <div class="plan-items-dropdown">
                    <div class="dropdown-header">Items in Plan</div>
                    <div class="dropdown-grid">
                        ${planItems.map((item) => `
                            <div class="dropdown-item">
                                <img src="${item.img || 'https://dummyimage.com/100x100/e2dfd6/111111&text=Item'}" alt="${item.name}" title="${item.name}">
                                <span>${formatMoney(item.price)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div class="plan-summary-col">
                <div class="plan-summary-title">TOTAL PLAN COST</div>
                <div class="plan-summary-val">${formatMoney(totalPlanCost)}</div>
                ${taxRate > 0 ? `<div style="font-size: 0.65rem; color: var(--text-secondary); margin-top: 0.25rem;">(incl. est. tax)</div>` : ''}
            </div>
            
            <div class="plan-summary-col">
                <div class="savings-progress-wrapper">
                    <div class="savings-progress-header">
                        <span class="saved">Saved ${formatMoney(savedAmount)}</span>
                        <span class="remaining">Remaining ${formatMoney(remainingAmount)}</span>
                    </div>
                    <div class="savings-progress-bar">
                        <div class="savings-progress-fill" style="width: ${percentSaved}%;"></div>
                    </div>
                    <div class="savings-progress-footer">
                        <span>Target: ${formatMoney(totalPlanCost)}</span>
                        <span>${percentSaved}%</span>
                    </div>
                </div>
            </div>
            
            <div>
                <button class="btn-outline" onclick="window.toggleWishlistReorderMode()">
                    ${window.isWishlistReorderMode ? 'DONE REORDERING' : 'MANAGE WISHLIST'}
                </button>
            </div>
        </div>
        `;
    }

    container.innerHTML = `
        <div class="top-bar">
            <div class="page-title"><span class="page-title-num">05</span> WISHLIST</div>
            <div style="margin-left: auto;">⋮</div>
        </div>
        
        <div class="tabs">
            <div class="tab ${window.wishlistCurrentTab === 'WANT' ? 'active' : ''}" onclick="window.setWishlistTab('WANT')">WANT</div>
            <div class="tab ${window.wishlistCurrentTab === 'SAVING' ? 'active' : ''}" onclick="window.setWishlistTab('SAVING')">SAVING</div>
            <div class="tab ${window.wishlistCurrentTab === 'BOUGHT' ? 'active' : ''}" onclick="window.setWishlistTab('BOUGHT')">BOUGHT</div>
            <div style="margin-left: auto;">
                <button class="btn btn-primary" onclick="openWishlistModal()" style="padding: 0.5rem 1rem; font-size: 0.7rem;">+ ADD ITEM</button>
            </div>
        </div>
        
        ${planBannerHTML}
        
        ${window.isWishlistReorderMode ? `
        <div style="background: rgba(61, 120, 71, 0.1); color: var(--color-green); padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; font-weight: 500; border: 1px dashed var(--color-green);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;"><polyline points="5 9 2 12 5 15"></polyline><polyline points="9 5 12 2 15 5"></polyline><polyline points="19 9 22 12 19 15"></polyline><polyline points="9 19 12 22 15 19"></polyline><line x1="2" y1="12" x2="22" y2="12"></line><line x1="12" y1="2" x2="12" y2="22"></line></svg>
            Drag and drop cards to reorder your wishlist
        </div>
        ` : ''}
        
        <div class="wishlist-grid ${window.isWishlistReorderMode ? 'reorder-mode' : ''}">
            ${store.data.wishlist.filter(item => {
                if (window.wishlistCurrentTab === 'WANT') return item.status === 'WANT' || item.status === 'AFFORDABLE' || item.status === 'NOT ENOUGH' || !item.status;
                if (window.wishlistCurrentTab === 'SAVING') return item.status === 'SAVE MORE' || item.status === 'SAVING' || item.inPlan;
                if (window.wishlistCurrentTab === 'BOUGHT') return item.status === 'BOUGHT';
                return true;
            }).map((item, index) => {
                const inPlan = !!item.inPlan;
                
                // Color mapping for new status style
                let statusColor = 'var(--text-primary)';
                if (item.status === 'WANT' || item.status === 'AFFORDABLE') statusColor = 'var(--color-green)';
                if (item.status === 'SAVE MORE') statusColor = 'var(--color-yellow)';
                if (item.status === 'NOT ENOUGH') statusColor = 'var(--color-red)';
                
                const imgSrc = item.img ? item.img : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="%23E2DFD6"><rect width="100" height="100"/></svg>';

                return `
                <div class="wishlist-card ${inPlan ? 'in-plan' : ''}" data-id="${item.id}">
                    ${inPlan ? '<div class="badge-in-plan">IN PLAN</div>' : ''}
                    <div class="wishlist-image">
                        <img src="${imgSrc}" alt="${item.name}">
                    </div>
                    <div class="wishlist-title">${item.name}</div>
                    <div class="wishlist-store">${item.store || 'Unknown'}</div>
                    
                    <div class="wishlist-price" style="font-weight: 700; font-size: 1.25rem;">${formatMoney(item.price)}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: -0.25rem; margin-bottom: 0.5rem;">
                        ${taxRate > 0 ? `Total: ${formatMoney(item.price * (1 + taxRate / 100))} (incl. ${formatMoney(item.price * (taxRate / 100))} tax)` : 'Tax not included'}
                    </div>
                    
                    <div class="wishlist-actions-stacked" style="margin-top: auto; padding-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
                        <button class="btn btn-full" style="font-size: 0.75rem; padding: 0.75rem;" onclick="window.open('${item.url || '#'}', '_blank')">VIEW ON ${item.store ? item.store.toUpperCase() : 'STORE'}</button>
                        <div style="display: flex; gap: 0.5rem; align-items: stretch;">
                            <button class="btn-plan ${inPlan ? 'active' : ''}" onclick="toggleWishlistPlan(${item.id})" style="padding: 0.75rem;">
                                ${inPlan ? 'IN PLAN ✓' : '+ ADD TO PLAN'}
                            </button>
                            <button class="action-btn" style="padding: 0.75rem; width: 40px; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center;" onclick='openWishlistModal(${JSON.stringify(item).replace(/'/g, "&#39;")})'>⋮</button>
                        </div>
                    </div>
                </div>
                `;
            }).join('')}
        </div>
    `;

    return container;
};

window.toggleWishlistPlan = (id) => {
    store.togglePlan(id);
    if (window.app) window.app.handleRoute(false);
};

window.wishlistCurrentTab = window.wishlistCurrentTab || 'WANT';

window.setWishlistTab = (tab) => {
    window.wishlistCurrentTab = tab;
    if(window.app) window.app.handleRoute(false);
};

window.isWishlistReorderMode = window.isWishlistReorderMode || false;

window.toggleWishlistReorderMode = () => {
    window.isWishlistReorderMode = !window.isWishlistReorderMode;
    if (window.app) {
        const viewEl = renderWishlist();
        window.app.mainEl.innerHTML = '';
        window.app.mainEl.appendChild(viewEl);
        
        if (window.isWishlistReorderMode) {
            const grid = window.app.mainEl.querySelector('.wishlist-grid');
            if (grid && window.Sortable) {
                window.wishlistSortable = new Sortable(grid, {
                    animation: 150,
                    ghostClass: 'sortable-ghost',
                    dataIdAttr: 'data-id',
                    onEnd: function (evt) {
                        const newOrderIds = window.wishlistSortable.toArray().map(id => parseInt(id));
                        store.updateWishlistOrderForSubset(newOrderIds);
                    }
                });
            }
        }
    }
};
