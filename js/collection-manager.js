// Collection Manager - Handles the My Collection tab functionality
const CollectionManager = {
    // DOM elements
    totalPolishesElement: null,
    totalToppersElement: null,
    mostCommonColorElement: null,
    brandFilterElement: null,
    colorFilterElement: null,
    formulaFilterElement: null,
    polishListElement: null,
    topperListElement: null,
    colorBreakdownElement: null,
    formulaBreakdownElement: null,

    // Initialize collection manager
    init() {
        this.getDOMElements();
        this.attachEventListeners();
        this.updateCollectionStats();
        console.log('CollectionManager initialized');
    },

    // Get all DOM elements
    getDOMElements() {
        this.totalPolishesElement = document.getElementById('total-polishes');
        this.totalToppersElement = document.getElementById('total-toppers');
        this.mostCommonColorElement = document.getElementById('favorite-color');
        this.brandFilterElement = document.getElementById('collection-brand-filter');
        this.colorFilterElement = document.getElementById('collection-color-filter');
        this.formulaFilterElement = document.getElementById('collection-formula-filter');
        this.polishListElement = document.getElementById('polish-list');
        this.topperListElement = document.getElementById('topper-list');
        this.colorBreakdownElement = document.getElementById('color-breakdown');
        this.formulaBreakdownElement = document.getElementById('formula-breakdown');
    },

    // Attach event listeners
    attachEventListeners() {
        if (this.brandFilterElement) {
            this.brandFilterElement.addEventListener('change', () => this.filterPolishes());
        }

        if (this.colorFilterElement) {
            this.colorFilterElement.addEventListener('change', () => this.filterPolishes());
        }

        if (this.formulaFilterElement) {
            this.formulaFilterElement.addEventListener('change', () => this.filterPolishes());
        }
    },

    // Update all collection statistics and displays
    updateCollectionStats() {
        this.updateStatsOverview();
        this.updateFilters();
        this.filterPolishes();
        this.displayToppers();
        this.updateColorBreakdown();
        this.updateFormulaBreakdown();
    },

    // Update stats overview cards
    updateStatsOverview() {
        if (this.totalPolishesElement) {
            this.totalPolishesElement.textContent = DataManager.nailPolishes.length;
        }

        if (this.totalToppersElement) {
            this.totalToppersElement.textContent = DataManager.toppers.length;
        }

        if (this.mostCommonColorElement) {
            const mostCommonColor = this.getMostCommonColor();
            this.mostCommonColorElement.textContent = mostCommonColor || '-';
        }
    },

    // Get most common color in collection
    getMostCommonColor() {
        if (DataManager.nailPolishes.length === 0) return null;

        const colorCounts = {};
        DataManager.nailPolishes.forEach(polish => {
            colorCounts[polish.color] = (colorCounts[polish.color] || 0) + 1;
        });

        let maxCount = 0;
        let mostCommon = null;
        for (const [color, count] of Object.entries(colorCounts)) {
            if (count > maxCount) {
                maxCount = count;
                mostCommon = color;
            }
        }

        return mostCommon ? mostCommon.charAt(0).toUpperCase() + mostCommon.slice(1) : null;
    },

    // Update filter dropdowns
    updateFilters() {
        this.updateBrandFilter();
        this.updateColorFilter();
        this.updateFormulaFilter();
    },

    // Update brand filter options
    updateBrandFilter() {
        if (!this.brandFilterElement) return;

        const brands = [...new Set(DataManager.nailPolishes.map(polish => polish.brand))].sort();
        this.updateSelectOptions(this.brandFilterElement, brands, 'All Brands');
    },

    // Update color filter options
    updateColorFilter() {
        if (!this.colorFilterElement) return;

        const colors = [...new Set(DataManager.nailPolishes.map(polish => polish.color))].sort();
        this.updateSelectOptions(this.colorFilterElement, colors, 'All Colors');
    },

    // Update formula filter options
    updateFormulaFilter() {
        if (!this.formulaFilterElement) return;

        const formulas = [...new Set(DataManager.nailPolishes.map(polish => polish.formula))].sort();
        this.updateSelectOptions(this.formulaFilterElement, formulas, 'All Formulas');
    },

    // Update select element options
    updateSelectOptions(selectElement, options, defaultText) {
        const currentValue = selectElement.value;
        selectElement.innerHTML = '';

        // Add default "All" option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = defaultText;
        selectElement.appendChild(defaultOption);

        // Add options
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            selectElement.appendChild(optionElement);
        });

        selectElement.value = currentValue;
    },

    // Filter and display polishes
    filterPolishes() {
        if (!this.polishListElement) return;

        const brandFilter = this.brandFilterElement ? this.brandFilterElement.value : '';
        const colorFilter = this.colorFilterElement ? this.colorFilterElement.value : '';
        const formulaFilter = this.formulaFilterElement ? this.formulaFilterElement.value : '';

        const filteredPolishes = DataManager.nailPolishes.filter(polish => {
            const brandMatch = !brandFilter || polish.brand === brandFilter;
            const colorMatch = !colorFilter || polish.color === colorFilter;
            const formulaMatch = !formulaFilter || polish.formula === formulaFilter;
            return brandMatch && colorMatch && formulaMatch;
        });

        this.displayPolishes(filteredPolishes);
    },

    // Display polishes in the list
    displayPolishes(polishes) {
        if (!this.polishListElement) return;

        this.polishListElement.innerHTML = '';

        if (polishes.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'No polishes found. Try adjusting your filters or add some polishes to your collection!';
            this.polishListElement.appendChild(emptyMessage);
            return;
        }

        // Sort polishes by brand, then by name
        const sortedPolishes = polishes.sort((a, b) => {
            if (a.brand !== b.brand) {
                return a.brand.localeCompare(b.brand);
            }
            return a.name.localeCompare(b.name);
        });

        sortedPolishes.forEach(polish => {
            const polishCard = this.createPolishCard(polish);
            this.polishListElement.appendChild(polishCard);
        });
    },

    // Create a polish card element
    createPolishCard(polish) {
        const card = document.createElement('div');
        card.className = 'polish-card-collection';

        card.innerHTML = `
            <div class="polish-info">
                <h3 class="polish-name">${polish.name}</h3>
                <p class="polish-brand">${polish.brand}</p>
                <div class="polish-tags">
                    <span class="color-tag">${polish.color}</span>
                    <span class="formula-tag">${polish.formula}</span>
                </div>
            </div>
            <button class="delete-polish-btn" data-name="${polish.name}" data-brand="${polish.brand}">
                Delete
            </button>
        `;

        // Add delete functionality
        const deleteBtn = card.querySelector('.delete-polish-btn');
        deleteBtn.addEventListener('click', () => {
            this.deletePolish(polish.name, polish.brand);
        });

        return card;
    },

    // Delete a polish from the collection
    async deletePolish(polishName, polishBrand) {
        const confirmed = await ModalManager.confirm(`Are you sure you want to delete "${polishName}" by ${polishBrand} from your collection?`, 'Delete Polish');
        
        if (confirmed) {
            const success = DataManager.removePolish(polishName, polishBrand);

            if (success) {
                this.updateCollectionStats();

                // Update picker options if available
                if (window.PolishPicker) {
                    PolishPicker.updateFilterOptions();
                }

                console.log(`Deleted polish: ${polishName} by ${polishBrand}`);
            }
        }
    },

    // Update color breakdown chart
    updateColorBreakdown() {
        if (!this.colorBreakdownElement) return;

        this.colorBreakdownElement.innerHTML = '';

        if (DataManager.nailPolishes.length === 0) {
            this.colorBreakdownElement.innerHTML = '<p class="empty-message">No data available</p>';
            return;
        }

        const colorCounts = {};
        DataManager.nailPolishes.forEach(polish => {
            colorCounts[polish.color] = (colorCounts[polish.color] || 0) + 1;
        });

        Object.entries(colorCounts)
            .sort(([,a], [,b]) => b - a)
            .forEach(([color, count]) => {
                const item = document.createElement('div');
                item.className = 'breakdown-item';
                item.innerHTML = `
                    <span class="breakdown-label">${color.charAt(0).toUpperCase() + color.slice(1)}</span>
                    <span class="breakdown-count">${count}</span>
                `;
                this.colorBreakdownElement.appendChild(item);
            });
    },

    // Update formula breakdown chart
    updateFormulaBreakdown() {
        if (!this.formulaBreakdownElement) return;

        this.formulaBreakdownElement.innerHTML = '';

        if (DataManager.nailPolishes.length === 0) {
            this.formulaBreakdownElement.innerHTML = '<p class="empty-message">No data available</p>';
            return;
        }

        const formulaCounts = {};
        DataManager.nailPolishes.forEach(polish => {
            formulaCounts[polish.formula] = (formulaCounts[polish.formula] || 0) + 1;
        });

        Object.entries(formulaCounts)
            .sort(([,a], [,b]) => b - a)
            .forEach(([formula, count]) => {
                const item = document.createElement('div');
                item.className = 'breakdown-item';
                item.innerHTML = `
                    <span class="breakdown-label">${formula.charAt(0).toUpperCase() + formula.slice(1)}</span>
                    <span class="breakdown-count">${count}</span>
                `;
                this.formulaBreakdownElement.appendChild(item);
            });
    },

    // Display toppers in the list
    displayToppers() {
        if (!this.topperListElement) return;

        this.topperListElement.innerHTML = '';

        if (DataManager.toppers.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'No toppers found. Add some toppers to your collection!';
            this.topperListElement.appendChild(emptyMessage);
            return;
        }

        // Sort toppers by brand, then by name
        const sortedToppers = DataManager.toppers.sort((a, b) => {
            if (a.brand !== b.brand) {
                return a.brand.localeCompare(b.brand);
            }
            return a.name.localeCompare(b.name);
        });

        sortedToppers.forEach(topper => {
            const topperCard = this.createTopperCard(topper);
            this.topperListElement.appendChild(topperCard);
        });
    },

    // Create a topper card element
    createTopperCard(topper) {
        const card = document.createElement('div');
        card.className = 'topper-card-collection';

        card.innerHTML = `
            <div class="topper-info">
                <h3 class="topper-name">${topper.name}</h3>
                <p class="topper-brand">${topper.brand}</p>
                <div class="topper-details">
                    <span class="topper-type-tag">${topper.type}</span>
                </div>
            </div>
            <div class="topper-actions">
                <button class="delete-topper-btn" data-name="${topper.name}" data-brand="${topper.brand}">
                    Delete
                </button>
            </div>
        `;

        // Add delete functionality
        const deleteBtn = card.querySelector('.delete-topper-btn');
        deleteBtn.addEventListener('click', () => {
            this.deleteTopper(topper.name, topper.brand);
        });

        return card;
    },

    // Delete a topper from the collection
    async deleteTopper(topperName, topperBrand) {
        const confirmed = await ModalManager.confirm(`Are you sure you want to delete "${topperName}" by ${topperBrand} from your collection?`, 'Delete Topper');
        
        if (confirmed) {
            const success = DataManager.removeTopper(topperName, topperBrand);

            if (success) {
                this.updateCollectionStats();

                // Update picker options if available
                if (window.PolishPicker) {
                    PolishPicker.updateFilterOptions();
                }

                console.log(`Deleted topper: ${topperName} by ${topperBrand}`);
            }
        }
    },

};
