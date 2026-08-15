const generatePDFReport = (exportData, type, typeName) => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add Header
    doc.setFontSize(22);
    doc.setTextColor(17, 17, 17); // --text-primary
    doc.text('TRUTINA', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(85, 85, 85); // --text-secondary
    doc.text('FINANCIAL REPORT - ' + typeName.toUpperCase(), 14, 30);
    
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text('Generated on: ' + date, 14, 36);
    
    let yPos = 45;
    
    const addTable = (title, columns, body) => {
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(17, 17, 17);
        doc.text(title, 14, yPos);
        
        doc.autoTable({
            startY: yPos + 4,
            head: [columns],
            body: body,
            theme: 'striped',
            headStyles: { fillColor: [17, 17, 17], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [246, 244, 239] },
            margin: { left: 14, right: 14 },
            didDrawCell: function(data) {
                if (data.section === 'body' && data.cell.raw && typeof data.cell.raw === 'string' && data.cell.raw.startsWith('http')) {
                    doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: data.cell.raw });
                }
            }
        });
        
        yPos = doc.lastAutoTable.finalY + 15;
    };
    
    if (type === 'all' || type === 'spending') {
        if (exportData.spending && exportData.spending.length > 0) {
            const cols = ['Date', 'Description', 'Category', 'Amount'];
            const body = exportData.spending.map(item => [
                item.date, item.description || 'Unknown', item.category, '$' + item.amount.toFixed(2)
            ]);
            addTable('Spending', cols, body);
        }
    }
    
    if (type === 'all' || type === 'income') {
        if (exportData.income && exportData.income.length > 0) {
            const cols = ['Date', 'Source', 'Amount'];
            const body = exportData.income.map(item => {
                const source = exportData.incomeSources?.find(s => s.id === item.sourceId)?.name || 'Unknown';
                return [item.date, source, '$' + item.amount.toFixed(2)];
            });
            addTable('Income', cols, body);
        }
    }
    
    if (type === 'all' || type === 'bills') {
        if (exportData.bills && exportData.bills.length > 0) {
            const cols = ['Name', 'Amount', 'Due Date', 'Status'];
            const body = exportData.bills.map(item => [
                item.name, '$' + item.amount.toFixed(2), 'Day ' + item.dueDate, item.paid ? 'Paid' : 'Unpaid'
            ]);
            addTable('Bills', cols, body);
        }
    }
    
    if (type === 'all' || type === 'wishlist') {
        if (exportData.wishlist && exportData.wishlist.length > 0) {
            const cols = ['Item', 'Store', 'Price', 'Link'];
            const body = exportData.wishlist.map(item => [
                item.name || 'Unknown', item.store || 'Unknown', '$' + (item.price || 0).toFixed(2), item.url || 'No link'
            ]);
            addTable('Wishlist', cols, body);
        }
    }
    
    if (type === 'all' || type === 'history') {
        if (exportData.history && exportData.history.length > 0) {
            const cols = ['Month', 'Income', 'Spending', 'Saved'];
            const body = exportData.history.map(item => [
                item.month, '$' + item.income.toFixed(2), '$' + item.spending.toFixed(2), '$' + item.saved.toFixed(2)
            ]);
            addTable('History', cols, body);
        }
    }
    
    if (yPos === 45) { // No tables added
        doc.setFontSize(12);
        doc.text('No data available for the selected section.', 14, yPos);
    }
    
    doc.save(`trutina_report_${type}_${new Date().toISOString().split('T')[0]}.pdf`);
};

const renderSettings = () => {
    const container = document.createElement('div');
    
    // Header
    const header = document.createElement('div');
    header.className = 'top-bar';
    header.innerHTML = `
        <div class="page-title"><span class="page-title-num">06</span> SETTINGS</div>
    `;
    
    // Main Content
    const content = document.createElement('div');
    content.className = 'grid-2';
    
    // Account Panel
    const accountPanel = document.createElement('div');
    accountPanel.className = 'panel';
    
    const accountHeader = document.createElement('div');
    accountHeader.className = 'panel-header';
    accountHeader.innerHTML = `<h3>ACCOUNT & SYNC</h3>`;
    accountPanel.appendChild(accountHeader);
    
    const accountInfo = document.createElement('div');
    
    if (window.krutinaAuth && window.krutinaAuth.currentUser) {
        accountInfo.innerHTML = `
            <div class="text-label">Status</div>
            <div class="mb-1">Signed in as <strong>${window.krutinaAuth.currentUser.email || 'User'}</strong></div>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1.5rem;">Your data is automatically syncing to the cloud.</p>
        `;
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'btn btn-primary';
        logoutBtn.textContent = 'Sign Out';
        logoutBtn.addEventListener('click', () => {
            window.krutinaAuth.logout();
        });
        accountInfo.appendChild(logoutBtn);
    } else {
        accountInfo.innerHTML = `
            <div class="text-label">Status</div>
            <div class="mb-1">Not signed in</div>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1.5rem;">Sign in to sync your data across devices.</p>
        `;
        const loginBtn = document.createElement('button');
        loginBtn.className = 'btn btn-primary';
        loginBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 8px;"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"></path><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path></svg>
            Sign In with Google
        `;
        loginBtn.addEventListener('click', () => {
            window.krutinaAuth.login();
        });
        accountInfo.appendChild(loginBtn);
    }
    
    accountPanel.appendChild(accountInfo);
    content.appendChild(accountPanel);
    
    // Mode Panel
    const modePanel = document.createElement('div');
    modePanel.className = 'panel';
    
    const modeHeader = document.createElement('div');
    modeHeader.className = 'panel-header';
    modeHeader.innerHTML = `<h3>APP MODE</h3>`;
    modePanel.appendChild(modeHeader);
    
    const modeInfo = document.createElement('div');
    const isDemo = store.mode === 'demo';
    
    modeInfo.innerHTML = `
        <div class="text-label">Current Mode</div>
        <div class="mb-1"><strong>${isDemo ? 'Demo Mode' : 'User Mode'}</strong></div>
        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1.5rem;">
            ${isDemo 
                ? 'Demo Mode loads fake placeholder data so you can see how the app looks when fully populated. Any changes made here are saved separately.' 
                : 'User Mode is your clean slate. All fake data is removed so you can input your real numbers.'}
        </p>
    `;
    
    const modeBtnContainer = document.createElement('div');
    modeBtnContainer.style.display = 'flex';
    modeBtnContainer.style.gap = '1rem';
    
    const demoBtn = document.createElement('button');
    demoBtn.className = isDemo ? 'btn btn-primary' : 'btn';
    demoBtn.style.flex = '1';
    demoBtn.textContent = 'Demo Mode';
    demoBtn.onclick = () => {
        if (!isDemo) {
            store.setMode('demo');
            if (window.app) window.app.handleRoute();
        }
    };
    
    const userBtn = document.createElement('button');
    userBtn.className = !isDemo ? 'btn btn-primary' : 'btn';
    userBtn.style.flex = '1';
    userBtn.textContent = 'User Mode';
    userBtn.onclick = () => {
        if (isDemo) {
            store.setMode('user');
            if (window.app) window.app.handleRoute();
        }
    };
    
    modeBtnContainer.appendChild(demoBtn);
    modeBtnContainer.appendChild(userBtn);
    modeInfo.appendChild(modeBtnContainer);
    
    modePanel.appendChild(modeInfo);
    content.appendChild(modePanel);
    
    // Helper for custom select
    const createCustomSelect = (options, defaultVal, onChange) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-select-wrapper form-input';
        wrapper.style.flex = '2';
        wrapper.style.padding = '0'; // override default form-input padding
        
        const trigger = document.createElement('div');
        trigger.className = 'custom-select-trigger';
        trigger.style.padding = '0.75rem';
        trigger.style.height = '100%';
        
        const display = document.createElement('span');
        const icon = document.createElement('span');
        icon.innerHTML = '▼';
        icon.style.fontSize = '0.6rem';
        
        trigger.appendChild(display);
        trigger.appendChild(icon);
        
        const optionsList = document.createElement('div');
        optionsList.className = 'custom-select-options';
        
        let currentValue = defaultVal;
        
        const updateDisplay = () => {
            optionsList.innerHTML = '';
            options.forEach(opt => {
                const item = document.createElement('div');
                item.className = 'custom-select-option' + (opt.value === currentValue ? ' selected' : '');
                item.textContent = opt.label;
                if (opt.value === currentValue) {
                    display.textContent = opt.label;
                }
                item.onclick = (e) => {
                    e.stopPropagation();
                    currentValue = opt.value;
                    updateDisplay();
                    wrapper.classList.remove('open');
                    if (onChange) onChange(currentValue);
                };
                optionsList.appendChild(item);
            });
        };
        
        updateDisplay();
        
        trigger.onclick = (e) => {
            e.stopPropagation();
            document.querySelectorAll('.custom-select-wrapper').forEach(el => {
                if (el !== wrapper) el.classList.remove('open');
            });
            wrapper.classList.toggle('open');
        };
        
        document.addEventListener('click', () => {
            wrapper.classList.remove('open');
        });
        
        wrapper.appendChild(trigger);
        wrapper.appendChild(optionsList);
        
        return {
            element: wrapper,
            getValue: () => currentValue,
            getText: () => options.find(o => o.value === currentValue)?.label
        };
    };

    const dataOptions = [
        { value: 'all', label: 'All Data' },
        { value: 'spending', label: 'Spending Data' },
        { value: 'income', label: 'Income Data' },
        { value: 'bills', label: 'Bills Data' },
        { value: 'wishlist', label: 'Wishlist Data' },
        { value: 'history', label: 'History Data' }
    ];

    // Tax Preferences Panel
    const taxPanel = document.createElement('div');
    taxPanel.className = 'panel';
    taxPanel.style.gridColumn = '1 / -1';
    
    const taxHeader = document.createElement('div');
    taxHeader.className = 'panel-header';
    taxHeader.innerHTML = `<h3>TAX PREFERENCES (WISHLIST)</h3>`;
    taxPanel.appendChild(taxHeader);
       const taxInfo = document.createElement('div');
    taxInfo.innerHTML = `
        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1rem;">
            Enter your 5-digit ZIP code to auto-estimate the local sales tax rate for your wishlist items, or manually override the rate.
        </p>
    `;
    
    const taxContainer = document.createElement('div');
    taxContainer.style.display = 'flex';
    taxContainer.style.gap = '1rem';
    taxContainer.style.alignItems = 'center';
    
    const currentTaxZip = store.data.settings?.taxZip || '';
    const currentTaxRate = store.data.settings?.taxRate || 0;
    
    const zipInputWrapper = document.createElement('div');
    zipInputWrapper.style.flex = '2';
    zipInputWrapper.style.display = 'flex';
    zipInputWrapper.style.gap = '0.5rem';
    
    const zipInput = document.createElement('input');
    zipInput.type = 'text';
    zipInput.className = 'form-input';
    zipInput.placeholder = 'ZIP Code (e.g. 90210)';
    zipInput.maxLength = 5;
    zipInput.value = currentTaxZip;
    zipInput.style.flex = '1';
    
    const lookupBtn = document.createElement('button');
    lookupBtn.className = 'btn-outline';
    lookupBtn.textContent = 'LOOKUP';
    lookupBtn.style.padding = '0 0.5rem';
    lookupBtn.onclick = async () => {
        const zip = zipInput.value.trim();
        if (zip.length === 5) {
            lookupBtn.textContent = '...';
            try {
                const res = await fetch(`http://localhost:8001/api/tax/${zip}`);
                if (res.ok) {
                    const data = await res.json();
                    rateInput.value = data.rate;
                } else {
                    alert('ZIP code not found in tax database.');
                }
            } catch (err) {
                alert('Error looking up tax rate.');
            }
            lookupBtn.textContent = 'LOOKUP';
        }
    };
    
    zipInputWrapper.appendChild(zipInput);
    zipInputWrapper.appendChild(lookupBtn);
    
    const rateInputWrapper = document.createElement('div');
    rateInputWrapper.style.position = 'relative';
    rateInputWrapper.style.flex = '1';
    
    const rateInput = document.createElement('input');
    rateInput.type = 'number';
    rateInput.step = '0.01';
    rateInput.className = 'form-input';
    rateInput.style.paddingRight = '2rem';
    rateInput.value = currentTaxRate;
    
    const percentSymbol = document.createElement('span');
    percentSymbol.textContent = '%';
    percentSymbol.style.position = 'absolute';
    percentSymbol.style.right = '0.75rem';
    percentSymbol.style.top = '50%';
    percentSymbol.style.transform = 'translateY(-50%)';
    percentSymbol.style.color = 'var(--text-secondary)';
    
    rateInputWrapper.appendChild(rateInput);
    rateInputWrapper.appendChild(percentSymbol);
    
    const saveTaxBtn = document.createElement('button');
    saveTaxBtn.className = 'btn btn-primary';
    saveTaxBtn.style.flex = '1';
    saveTaxBtn.textContent = 'SAVE TAX';
    saveTaxBtn.onclick = () => {
        if (!store.data.settings) store.data.settings = {};
        store.data.settings.taxZip = zipInput.value.trim();
        store.data.settings.taxRate = parseFloat(rateInput.value) || 0;
        store.save();
        saveTaxBtn.textContent = 'SAVED!';
        saveTaxBtn.style.backgroundColor = 'var(--color-green)';
        saveTaxBtn.style.borderColor = 'var(--color-green)';
        setTimeout(() => {
            saveTaxBtn.textContent = 'SAVE TAX';
            saveTaxBtn.style.backgroundColor = '';
            saveTaxBtn.style.borderColor = '';
        }, 2000);
    };
    
    taxContainer.appendChild(zipInputWrapper);
    taxContainer.appendChild(rateInputWrapper);
    taxContainer.appendChild(saveTaxBtn);
    
    taxInfo.appendChild(taxContainer);
    taxPanel.appendChild(taxInfo);
    content.appendChild(taxPanel);

    // Data Management Panel
    const dataPanel = document.createElement('div');
    dataPanel.className = 'panel';
    dataPanel.style.gridColumn = '1 / -1'; // span full width across the grid-2
    
    const dataHeader = document.createElement('div');
    dataHeader.className = 'panel-header';
    dataHeader.innerHTML = `<h3>DATA MANAGEMENT</h3>`;
    dataPanel.appendChild(dataHeader);
    
    const dataInfo = document.createElement('div');
    
    // Reset Data
    const resetSection = document.createElement('div');
    resetSection.className = 'mb-2';
    resetSection.innerHTML = `
        <div class="text-label">Reset Data</div>
        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1rem;">
            Clear out data for specific pages or completely reset all data. This action cannot be undone.
        </p>
    `;
    const resetContainer = document.createElement('div');
    resetContainer.style.display = 'flex';
    resetContainer.style.gap = '1rem';
    
    const customResetSelect = createCustomSelect(dataOptions, 'all');
    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn';
    resetBtn.style.flex = '1';
    resetBtn.style.borderColor = 'var(--color-red)';
    resetBtn.style.color = 'var(--color-red)';
    resetBtn.textContent = 'RESET DATA';
    resetBtn.onclick = () => {
        const type = customResetSelect.getValue();
        const typeName = customResetSelect.getText();
        
        const content = `
            <div style="text-align:center; padding: 1rem 0;">
                <p style="margin-bottom: 1.5rem; font-size: 1rem;">Are you sure you want to clear <strong>${typeName}</strong>?</p>
                <p style="color: var(--color-red); font-size: 0.8rem;">This action cannot be undone.</p>
            </div>
            <div class="form-actions" style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 1.5rem;">
                <button type="button" class="btn" id="btnModalCancelLocal" style="flex:1;">CANCEL</button>
                <button type="button" class="btn-primary btn" id="btnConfirmReset" style="flex:1; background-color: var(--color-red); border-color: var(--color-red);">YES, RESET</button>
            </div>
        `;
        
        modal.open('CONFIRM RESET', content, () => {}, (close) => {
            document.getElementById('btnModalCancelLocal').addEventListener('click', close);
            document.getElementById('btnConfirmReset').addEventListener('click', () => {
                store.resetData(type);
                close();
                if (window.app) window.app.handleRoute();
            });
        });
    };
    resetContainer.appendChild(customResetSelect.element);
    resetContainer.appendChild(resetBtn);
    resetSection.appendChild(resetContainer);
    dataInfo.appendChild(resetSection);
    
    // Export Data
    const exportSection = document.createElement('div');
    exportSection.className = 'mb-2';
    exportSection.innerHTML = `
        <div class="text-label">Export Data</div>
        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1rem;">
            Download your data as a JSON backup or a nicely formatted PDF report.
        </p>
    `;
    const exportContainer = document.createElement('div');
    exportContainer.style.display = 'flex';
    exportContainer.style.gap = '1rem';
    
    const customExportSelect = createCustomSelect(dataOptions, 'all');
    const formatOptions = [
        { value: 'json', label: 'JSON' },
        { value: 'pdf', label: 'PDF' }
    ];
    const customFormatSelect = createCustomSelect(formatOptions, 'json');
    customFormatSelect.element.style.flex = '1';
    
    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn';
    exportBtn.style.flex = '1';
    exportBtn.textContent = 'EXPORT DATA';
    exportBtn.onclick = () => {
        const type = customExportSelect.getValue();
        const format = customFormatSelect.getValue();
        const typeName = customExportSelect.getText();
        
        let exportData = {};
        if (type === 'all') {
            exportData = store.data;
        } else if (type === 'income') {
            exportData = { income: store.data.income, incomeSources: store.data.incomeSources };
        } else {
            exportData = { [type]: store.data[type] };
        }
        
        if (format === 'json') {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", `trutina_export_${type}_${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        } else if (format === 'pdf') {
            generatePDFReport(exportData, type, typeName);
        }
    };
    exportContainer.appendChild(customExportSelect.element);
    exportContainer.appendChild(customFormatSelect.element);
    exportContainer.appendChild(exportBtn);
    exportSection.appendChild(exportContainer);
    dataInfo.appendChild(exportSection);
    
    // Import Data
    const importSection = document.createElement('div');
    importSection.innerHTML = `
        <div class="text-label">Import Data</div>
        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1rem;">
            Restore your data from a previously exported JSON file. This will overwrite existing data for the imported sections.
        </p>
    `;
    const importContainer = document.createElement('div');
    importContainer.style.display = 'flex';
    importContainer.style.gap = '1rem';
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    
    const customFileTrigger = document.createElement('div');
    customFileTrigger.className = 'form-input';
    customFileTrigger.style.flex = '2';
    customFileTrigger.style.display = 'flex';
    customFileTrigger.style.alignItems = 'center';
    customFileTrigger.style.justifyContent = 'space-between';
    customFileTrigger.style.cursor = 'pointer';
    customFileTrigger.style.padding = '0.5rem 0.75rem';
    customFileTrigger.innerHTML = `
        <span id="file-name-display" style="color: var(--text-secondary); font-size: 0.85rem;">Choose a JSON file...</span>
        <button type="button" class="btn" style="padding: 0.25rem 0.75rem; font-size: 0.7rem; pointer-events: none;">BROWSE</button>
    `;
    customFileTrigger.onclick = () => fileInput.click();
    
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            customFileTrigger.querySelector('#file-name-display').textContent = file.name;
            customFileTrigger.querySelector('#file-name-display').style.color = 'var(--text-primary)';
        }
    };
    
    const importBtn = document.createElement('button');
    importBtn.className = 'btn';
    importBtn.style.flex = '1';
    importBtn.textContent = 'IMPORT DATA';
    importBtn.onclick = () => {
        if (!fileInput.files.length) return alert('Please select a file to import.');
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsed = JSON.parse(e.target.result);
                const content = `
                    <div style="text-align:center; padding: 1rem 0;">
                        <p style="margin-bottom: 1.5rem; font-size: 1rem;">Are you sure you want to import data from <strong>${file.name}</strong>?</p>
                        <p style="color: var(--color-red); font-size: 0.8rem;">This will overwrite current data for the imported sections.</p>
                    </div>
                    <div class="form-actions" style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 1.5rem;">
                        <button type="button" class="btn" id="btnModalCancelLocal2" style="flex:1;">CANCEL</button>
                        <button type="button" class="btn-primary btn" id="btnConfirmImport" style="flex:1;">YES, IMPORT</button>
                    </div>
                `;
                
                modal.open('CONFIRM IMPORT', content, () => {}, (close) => {
                    document.getElementById('btnModalCancelLocal2').addEventListener('click', close);
                    document.getElementById('btnConfirmImport').addEventListener('click', () => {
                        store.importData(parsed);
                        close();
                        if (window.app) window.app.handleRoute();
                    });
                });
            } catch (err) {
                alert('Invalid JSON file.');
            }
        };
        reader.readAsText(file);
    };
    
    importContainer.appendChild(fileInput);
    importContainer.appendChild(customFileTrigger);
    importContainer.appendChild(importBtn);
    importSection.appendChild(importContainer);
    dataInfo.appendChild(importSection);
    
    dataPanel.appendChild(dataInfo);
    content.appendChild(dataPanel);
    
    container.appendChild(header);
    container.appendChild(content);
    
    return container;
};
