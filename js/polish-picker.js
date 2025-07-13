// Polish Picker - Handles the main polish selection functionality
const PolishPicker = {
    // DOM elements
    colorFilter: null,
    formulaFilter: null,
    topperCheckbox: null,
    pickButton: null,
    pickAgainButton: null,
    result: null,
    topperResult: null,
    polishName: null,
    polishBrand: null,
    polishColor: null,
    polishFormula: null,
    topperName: null,
    topperBrand: null,
    topperType: null,
    deletePolishButton: null,
    markAsUsedCheckbox: null,

    // Current selection
    currentPolish: null,
    currentTopper: null,

    // Initialize polish picker
    init() {
        this.getDOMElements();
        this.attachEventListeners();
        this.updateFilterOptions();
        console.log('PolishPicker initialized');
    },

    // Get all DOM elements
    getDOMElements() {
        this.colorFilter = document.getElementById('color-filter');
        this.formulaFilter = document.getElementById('formula-filter');
        this.topperCheckbox = document.getElementById('topper-checkbox');
        this.pickButton = document.getElementById('pick-button');
        this.pickAgainButton = document.getElementById('pick-again');
        this.result = document.getElementById('result');
        this.topperResult = document.getElementById('topper-result');

        // Result display elements
        this.polishName = document.getElementById('polish-name');
        this.polishBrand = document.getElementById('polish-brand');
        this.polishColor = document.getElementById('polish-color');
        this.polishFormula = document.getElementById('polish-formula');
        this.topperName = document.getElementById('topper-name');
        this.topperBrand = document.getElementById('topper-brand');
        this.topperType = document.getElementById('topper-type');

        this.deletePolishButton = document.getElementById('delete-polish');
        this.markAsUsedCheckbox = document.getElementById('mark-as-used');
    },

    // Attach event listeners
    attachEventListeners() {
        if (this.pickButton) {
            this.pickButton.addEventListener('click', () => this.pickPolish());
        }

        if (this.pickAgainButton) {
            this.pickAgainButton.addEventListener('click', () => this.pickPolish());
        }

        if (this.deletePolishButton) {
            this.deletePolishButton.addEventListener('click', () => this.deleteCurrentPolish());
        }

        if (this.markAsUsedCheckbox) {
            this.markAsUsedCheckbox.addEventListener('change', () => this.handleMarkAsUsed());
        }

        // Keyboard support
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !this.result.classList.contains('hidden')) {
                this.pickPolish();
            } else if (event.key === 'Escape') {
                this.resetPicker();
            }
        });
    },

    // Update filter options based on available data
    updateFilterOptions() {
        this.updateSelectOptions(this.colorFilter, DataManager.getAllColors(), true);
        this.updateSelectOptions(this.formulaFilter, DataManager.getAllFormulas(), true);
    },

    // Update select element options
    updateSelectOptions(selectElement, options, isFilter) {
        if (!selectElement) return;

        const currentValue = selectElement.value;
        selectElement.innerHTML = '';

        if (isFilter) {
            const anyOption = document.createElement('option');
            anyOption.value = '';
            anyOption.textContent = selectElement === this.colorFilter ? 'Any Color' : 'Any Formula';
            selectElement.appendChild(anyOption);
        }

        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option.charAt(0).toUpperCase() + option.slice(1);
            selectElement.appendChild(optionElement);
        });

        selectElement.value = currentValue;
    },

    // Filter polishes based on selected criteria
    filterPolishes() {
        const selectedColor = this.colorFilter ? this.colorFilter.value : '';
        const selectedFormula = this.formulaFilter ? this.formulaFilter.value : '';

        return DataManager.nailPolishes.filter(polish => {
            const colorMatch = !selectedColor || polish.color === selectedColor;
            const formulaMatch = !selectedFormula || polish.formula === selectedFormula;
            return colorMatch && formulaMatch;
        });
    },

    // Get random item from array
    getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    // Main pick function
    pickPolish() {
        const filteredPolishes = this.filterPolishes();

        if (filteredPolishes.length === 0) {
            ModalManager.warning('No polishes match your criteria! Try adjusting your filters or add some polishes to your collection.');
            return;
        }

        const selectedPolish = this.getRandomItem(filteredPolishes);
        let selectedTopper = null;

        if (this.topperCheckbox && this.topperCheckbox.checked && DataManager.toppers.length > 0) {
            selectedTopper = this.getRandomItem(DataManager.toppers);
        }

        this.displayResults(selectedPolish, selectedTopper);
    },

    // Handle mark as used checkbox
    handleMarkAsUsed() {
        if (!this.markAsUsedCheckbox || !this.currentPolish) return;

        if (this.markAsUsedCheckbox.checked) {
            // Add to confirmed combinations
            const combo = DataManager.addCombination(this.currentPolish, this.currentTopper);
            
            // Update combinations display if available
            if (window.CombinationsManager) {
                CombinationsManager.updateCombinationsDisplay();
            }

            // Update collection stats if available
            if (window.CollectionManager) {
                CollectionManager.updateCollectionStats();
            }

            console.log(`Marked as used: ${this.currentPolish.name}${this.currentTopper ? ' + ' + this.currentTopper.name : ''}`);
        }
    },

    // Display results
    displayResults(selectedPolish, selectedTopper = null) {
        // Store current selection
        this.currentPolish = selectedPolish;
        this.currentTopper = selectedTopper;

        // Display polish
        if (this.polishName) this.polishName.textContent = selectedPolish.name;
        if (this.polishBrand) this.polishBrand.textContent = selectedPolish.brand;
        if (this.polishColor) this.polishColor.textContent = selectedPolish.color;
        if (this.polishFormula) this.polishFormula.textContent = selectedPolish.formula;

        // Display topper if selected
        if (selectedTopper && this.topperResult) {
            if (this.topperName) this.topperName.textContent = selectedTopper.name;
            if (this.topperBrand) this.topperBrand.textContent = selectedTopper.brand;
            if (this.topperType) this.topperType.textContent = selectedTopper.type;
            this.topperResult.classList.remove('hidden');
        } else if (this.topperResult) {
            this.topperResult.classList.add('hidden');
        }

        // Reset mark as used checkbox
        if (this.markAsUsedCheckbox) {
            this.markAsUsedCheckbox.checked = false;
        }

        // Display photo section
        if (window.PhotoManager) {
            PhotoManager.displayPhotoSection(selectedPolish, selectedTopper);
        }

        // Show delete button and results
        if (this.deletePolishButton) this.deletePolishButton.classList.remove('hidden');
        if (this.result) this.result.classList.remove('hidden');
        if (this.pickAgainButton) this.pickAgainButton.classList.remove('hidden');

        console.log(`Picked: ${selectedPolish.name} by ${selectedPolish.brand}${selectedTopper ? ` + ${selectedTopper.name}` : ''}`);
    },

    // Delete current polish
    async deleteCurrentPolish() {
        if (!this.polishName || !this.polishBrand) return;

        const currentPolishName = this.polishName.textContent;
        const currentPolishBrand = this.polishBrand.textContent;

        const confirmed = await ModalManager.confirm(`Are you sure you want to delete "${currentPolishName}" by ${currentPolishBrand} from your collection?`, 'Delete Polish');
        
        if (confirmed) {
            const success = DataManager.removePolish(currentPolishName, currentPolishBrand);
            
            if (success) {
                await ModalManager.success('Polish deleted successfully!');
                this.resetPicker();
                
                // Update filter options in case this was the last polish of a certain color/formula
                this.updateFilterOptions();
            }
        }
    },

    // Reset picker to initial state
    resetPicker() {
        if (this.result) this.result.classList.add('hidden');
        if (this.pickAgainButton) this.pickAgainButton.classList.add('hidden');
        if (this.deletePolishButton) this.deletePolishButton.classList.add('hidden');
        if (this.colorFilter) this.colorFilter.value = '';
        if (this.formulaFilter) this.formulaFilter.value = '';
        if (this.topperCheckbox) this.topperCheckbox.checked = false;
    },

    // Check if picker has polishes available
    hasPolishes() {
        return DataManager.nailPolishes.length > 0;
    },

    // Check if picker has toppers available
    hasToppers() {
        return DataManager.toppers.length > 0;
    }
};
