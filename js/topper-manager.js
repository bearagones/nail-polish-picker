// Topper Manager - Handles adding and managing nail toppers
const TopperManager = {
    // DOM elements
    addTopperButton: null,
    addTopperForm: null,
    topperNameInput: null,
    topperBrandInput: null,
    topperTypeSelect: null,
    saveTopperButton: null,
    cancelTopperButton: null,

    // Initialize topper manager
    init() {
        this.getDOMElements();
        this.attachEventListeners();
        this.updateFormOptions();
        console.log('TopperManager initialized');
    },

    // Get all DOM elements
    getDOMElements() {
        this.addTopperButton = document.getElementById('add-topper-toggle');
        this.addTopperForm = document.getElementById('add-topper-form');
        this.topperNameInput = document.getElementById('new-topper-name');
        this.topperBrandInput = document.getElementById('new-topper-brand');
        this.topperTypeSelect = document.getElementById('new-topper-type');
        this.saveTopperButton = document.getElementById('save-topper');
        this.cancelTopperButton = document.getElementById('cancel-add-topper');
    },

    // Attach event listeners
    attachEventListeners() {
        if (this.addTopperButton) {
            this.addTopperButton.addEventListener('click', () => this.toggleAddForm());
        }

        if (this.saveTopperButton) {
            this.saveTopperButton.addEventListener('click', () => this.saveTopper());
        }

        if (this.cancelTopperButton) {
            this.cancelTopperButton.addEventListener('click', () => this.hideAddForm());
        }

        // Form submission on Enter key
        if (this.addTopperForm) {
            this.addTopperForm.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    this.saveTopper();
                }
            });
        }
    },

    // Update form options
    updateFormOptions() {
        this.updateSelectOptions(this.topperTypeSelect, DataManager.getAllTopperTypes());
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
        if (!this.addTopperForm) return;

        if (this.addTopperForm.classList.contains('hidden')) {
            this.showAddForm();
        } else {
            this.hideAddForm();
        }
    },

    // Show add form
    showAddForm() {
        if (!this.addTopperForm || !this.addTopperButton) return;

        this.addTopperForm.classList.remove('hidden');
        this.addTopperButton.textContent = '- Hide Form';
        this.clearForm();
        
        // Focus on first input
        if (this.topperNameInput) {
            this.topperNameInput.focus();
        }
    },

    // Hide add form
    hideAddForm() {
        if (!this.addTopperForm || !this.addTopperButton) return;

        this.addTopperForm.classList.add('hidden');
        this.addTopperButton.textContent = '+ Add New Topper';
        this.clearForm();
    },

    // Clear form inputs
    clearForm() {
        if (this.topperNameInput) this.topperNameInput.value = '';
        if (this.topperBrandInput) this.topperBrandInput.value = '';
        if (this.topperTypeSelect) this.topperTypeSelect.selectedIndex = 0;
    },

    // Validate form inputs
    validateForm() {
        const name = this.topperNameInput ? this.topperNameInput.value.trim() : '';
        const brand = this.topperBrandInput ? this.topperBrandInput.value.trim() : '';
        const type = this.topperTypeSelect ? this.topperTypeSelect.value : '';

        if (!name) {
            ModalManager.warning('Please enter a topper name.');
            if (this.topperNameInput) this.topperNameInput.focus();
            return false;
        }

        if (!brand) {
            ModalManager.warning('Please enter a brand name.');
            if (this.topperBrandInput) this.topperBrandInput.focus();
            return false;
        }

        if (!type) {
            ModalManager.warning('Please select a topper type.');
            if (this.topperTypeSelect) this.topperTypeSelect.focus();
            return false;
        }

        // Check for duplicates
        const duplicate = DataManager.toppers.find(topper => 
            topper.name.toLowerCase() === name.toLowerCase() && 
            topper.brand.toLowerCase() === brand.toLowerCase()
        );

        if (duplicate) {
            ModalManager.warning('This topper already exists in your collection!');
            return false;
        }

        return true;
    },

    // Save topper to collection
    saveTopper() {
        if (!this.validateForm()) return;

        const topper = {
            name: this.topperNameInput.value.trim(),
            brand: this.topperBrandInput.value.trim(),
            type: this.topperTypeSelect.value
        };

        DataManager.addTopper(topper);
        
        // Update UI
        this.hideAddForm();
        
        // Update collection display if on collection tab
        if (window.CollectionManager) {
            CollectionManager.updateCollectionStats();
        }

        ModalManager.success(`Added "${topper.name}" by ${topper.brand} to your collection!`);
    },

    // Get form data
    getFormData() {
        return {
            name: this.topperNameInput ? this.topperNameInput.value.trim() : '',
            brand: this.topperBrandInput ? this.topperBrandInput.value.trim() : '',
            type: this.topperTypeSelect ? this.topperTypeSelect.value : ''
        };
    },

    // Set form data (for editing)
    setFormData(topper) {
        if (this.topperNameInput) this.topperNameInput.value = topper.name || '';
        if (this.topperBrandInput) this.topperBrandInput.value = topper.brand || '';
        if (this.topperTypeSelect) this.topperTypeSelect.value = topper.type || '';
    }
};
