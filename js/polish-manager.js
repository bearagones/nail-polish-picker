// Polish Manager - Handles adding and managing nail polishes
const PolishManager = {
    // DOM elements
    addPolishButton: null,
    addPolishForm: null,
    polishNameInput: null,
    polishBrandInput: null,
    polishColorSelect: null,
    polishFormulaSelect: null,
    savePolishButton: null,
    cancelPolishButton: null,

    // Initialize polish manager
    init() {
        this.getDOMElements();
        this.attachEventListeners();
        this.updateFormOptions();
        console.log('PolishManager initialized');
    },

    // Get all DOM elements
    getDOMElements() {
        this.addPolishButton = document.getElementById('add-polish-toggle');
        this.addPolishForm = document.getElementById('add-polish-form');
        this.polishNameInput = document.getElementById('new-polish-name');
        this.polishBrandInput = document.getElementById('new-polish-brand');
        this.polishColorSelect = document.getElementById('new-polish-color');
        this.polishFormulaSelect = document.getElementById('new-polish-formula');
        this.savePolishButton = document.getElementById('save-polish');
        this.cancelPolishButton = document.getElementById('cancel-add');
    },

    // Attach event listeners
    attachEventListeners() {
        if (this.addPolishButton) {
            this.addPolishButton.addEventListener('click', () => this.toggleAddForm());
        }

        if (this.savePolishButton) {
            this.savePolishButton.addEventListener('click', () => this.savePolish());
        }

        if (this.cancelPolishButton) {
            this.cancelPolishButton.addEventListener('click', () => this.hideAddForm());
        }

        // Form submission on Enter key
        if (this.addPolishForm) {
            this.addPolishForm.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    this.savePolish();
                }
            });
        }
    },

    // Update form options
    updateFormOptions() {
        this.updateSelectOptions(this.polishColorSelect, DataManager.getAllColors());
        this.updateSelectOptions(this.polishFormulaSelect, DataManager.getAllFormulas());
    },

    // Update select element options
    updateSelectOptions(selectElement, options) {
        if (!selectElement) return;

        const currentValue = selectElement.value;
        selectElement.innerHTML = '';

        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option.charAt(0).toUpperCase() + option.slice(1);
            selectElement.appendChild(optionElement);
        });

        selectElement.value = currentValue;
    },

    // Toggle add form visibility
    toggleAddForm() {
        if (!this.addPolishForm) return;

        if (this.addPolishForm.classList.contains('hidden')) {
            this.showAddForm();
        } else {
            this.hideAddForm();
        }
    },

    // Show add form
    showAddForm() {
        if (!this.addPolishForm || !this.addPolishButton) return;

        this.addPolishForm.classList.remove('hidden');
        this.addPolishButton.textContent = '- Hide Form';
        this.clearForm();
        
        // Focus on first input
        if (this.polishNameInput) {
            this.polishNameInput.focus();
        }
    },

    // Hide add form
    hideAddForm() {
        if (!this.addPolishForm || !this.addPolishButton) return;

        this.addPolishForm.classList.add('hidden');
        this.addPolishButton.textContent = '+ Add New Polish';
        this.clearForm();
    },

    // Clear form inputs
    clearForm() {
        if (this.polishNameInput) this.polishNameInput.value = '';
        if (this.polishBrandInput) this.polishBrandInput.value = '';
        if (this.polishColorSelect) this.polishColorSelect.selectedIndex = 0;
        if (this.polishFormulaSelect) this.polishFormulaSelect.selectedIndex = 0;
    },

    // Validate form inputs
    validateForm() {
        const name = this.polishNameInput ? this.polishNameInput.value.trim() : '';
        const brand = this.polishBrandInput ? this.polishBrandInput.value.trim() : '';
        const color = this.polishColorSelect ? this.polishColorSelect.value : '';
        const formula = this.polishFormulaSelect ? this.polishFormulaSelect.value : '';

        if (!name) {
            ModalManager.warning('Please enter a polish name.');
            if (this.polishNameInput) this.polishNameInput.focus();
            return false;
        }

        if (!brand) {
            ModalManager.warning('Please enter a brand name.');
            if (this.polishBrandInput) this.polishBrandInput.focus();
            return false;
        }

        if (!color) {
            ModalManager.warning('Please select a color.');
            if (this.polishColorSelect) this.polishColorSelect.focus();
            return false;
        }

        if (!formula) {
            ModalManager.warning('Please select a formula.');
            if (this.polishFormulaSelect) this.polishFormulaSelect.focus();
            return false;
        }

        // Check for duplicates
        const duplicate = DataManager.nailPolishes.find(polish => 
            polish.name.toLowerCase() === name.toLowerCase() && 
            polish.brand.toLowerCase() === brand.toLowerCase()
        );

        if (duplicate) {
            ModalManager.warning('This polish already exists in your collection!');
            return false;
        }

        return true;
    },

    // Save polish to collection
    savePolish() {
        if (!this.validateForm()) return;

        const polish = {
            name: this.polishNameInput.value.trim(),
            brand: this.polishBrandInput.value.trim(),
            color: this.polishColorSelect.value,
            formula: this.polishFormulaSelect.value
        };

        DataManager.addPolish(polish);
        
        // Update UI
        this.hideAddForm();
        
        // Update picker options
        if (window.PolishPicker) {
            PolishPicker.updateFilterOptions();
        }
        
        // Update collection display if on collection tab
        if (window.CollectionManager) {
            CollectionManager.updateCollectionStats();
        }

        ModalManager.success(`Added "${polish.name}" by ${polish.brand} to your collection!`);
    },

    // Get form data
    getFormData() {
        return {
            name: this.polishNameInput ? this.polishNameInput.value.trim() : '',
            brand: this.polishBrandInput ? this.polishBrandInput.value.trim() : '',
            color: this.polishColorSelect ? this.polishColorSelect.value : '',
            formula: this.polishFormulaSelect ? this.polishFormulaSelect.value : ''
        };
    },

    // Set form data (for editing)
    setFormData(polish) {
        if (this.polishNameInput) this.polishNameInput.value = polish.name || '';
        if (this.polishBrandInput) this.polishBrandInput.value = polish.brand || '';
        if (this.polishColorSelect) this.polishColorSelect.value = polish.color || '';
        if (this.polishFormulaSelect) this.polishFormulaSelect.value = polish.formula || '';
    }
};
