// Format currency
const formatMoney = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
};

class App {
    constructor() {
        this.mainEl = document.getElementById('app-main');
        this.navLinks = document.querySelectorAll('.nav-link');
        
        store.init();
        this.initRouter();
        this.initGlobalEvents();
    }

    initRouter() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute(); // Initial load
    }

    handleRoute(animate = true) {
        const hash = window.location.hash || '#/';
        const route = hash.replace('#', '');
        
        // Update nav active state
        this.navLinks.forEach(link => {
            if (link.getAttribute('data-route') === route) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Context-aware main action button
        const actionBtn = document.getElementById('btn-main-action');
        if (actionBtn) {
            // Remove old event listeners by cloning
            const newBtn = actionBtn.cloneNode(true);
            actionBtn.parentNode.replaceChild(newBtn, actionBtn);
            
            if (route === '/income') {
                newBtn.textContent = '+ NEW INCOME';
                newBtn.addEventListener('click', () => openIncomeModal());
            } else if (route === '/bills') {
                newBtn.textContent = '+ NEW BILL';
                newBtn.addEventListener('click', () => openBillModal());
            } else if (route === '/wishlist') {
                newBtn.textContent = '+ WISHLIST ITEM';
                newBtn.addEventListener('click', () => openWishlistModal());
            } else {
                newBtn.textContent = '+ NEW EXPENSE';
                newBtn.addEventListener('click', () => openExpenseModal());
            }
        }

        // Render view
        this.mainEl.innerHTML = '';
        let viewEl;
        switch(route) {
            case '/':
                viewEl = renderOverview();
                break;
            case '/spending':
                viewEl = renderSpending();
                break;
            case '/bills':
                viewEl = renderBills();
                break;
            case '/income':
                viewEl = renderIncome();
                break;
            case '/wishlist':
                viewEl = renderWishlist();
                break;
            case '/history':
                viewEl = renderHistory();
                break;
            case '/settings':
                viewEl = renderSettings();
                break;
            default:
                viewEl = renderOverview();
        }
        
        if (viewEl) {
            if (animate) viewEl.classList.add('page-enter');
            this.mainEl.appendChild(viewEl);
        }
    }

    initGlobalEvents() {
        // Global events like keyboard shortcuts can go here
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

const initCustomSelects = (container = document) => {
    const selects = container.querySelectorAll('select.form-input');
    selects.forEach(select => {
        if (select.nextElementSibling && select.nextElementSibling.classList.contains('custom-select-wrapper')) {
            return; // Already initialized
        }
        
        select.style.display = 'none'; // hide native select
        
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-select-wrapper';
        
        const trigger = document.createElement('div');
        trigger.className = 'custom-select-trigger form-input';
        
        const selectedOption = select.options[select.selectedIndex];
        trigger.innerHTML = `<span>${selectedOption ? selectedOption.text : ''}</span><span class="custom-select-arrow" style="font-size:0.6rem;">▼</span>`;
        
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'custom-select-options';
        
        Array.from(select.options).forEach((option, index) => {
            const optDiv = document.createElement('div');
            optDiv.className = 'custom-select-option';
            optDiv.textContent = option.text;
            if (index === select.selectedIndex) optDiv.classList.add('selected');
            
            optDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                select.selectedIndex = index;
                trigger.querySelector('span').textContent = option.text;
                
                // Trigger change event on original select
                select.dispatchEvent(new Event('change'));
                
                // Update selected class
                optionsContainer.querySelectorAll('.custom-select-option').forEach(el => el.classList.remove('selected'));
                optDiv.classList.add('selected');
                
                wrapper.classList.remove('open');
            });
            optionsContainer.appendChild(optDiv);
        });
        
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Close other open selects
            document.querySelectorAll('.custom-select-wrapper').forEach(w => {
                if (w !== wrapper) w.classList.remove('open');
            });
            wrapper.classList.toggle('open');
        });
        
        wrapper.appendChild(trigger);
        wrapper.appendChild(optionsContainer);
        select.parentNode.insertBefore(wrapper, select.nextSibling);
    });
    
    // Close when clicking outside (handled globally once)
    if (!window.customSelectListenerAdded) {
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.custom-select-wrapper')) {
                document.querySelectorAll('.custom-select-wrapper').forEach(w => w.classList.remove('open'));
            }
        });
        window.customSelectListenerAdded = true;
    }
};
