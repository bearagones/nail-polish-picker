// Data Manager - Handles all data storage and retrieval
const DataManager = {
    // Data arrays
    nailPolishes: [],
    toppers: [],
    comboPhotos: {},
    customColors: [],
    customFormulas: [],
    customTopperTypes: [],
    usedCombinations: [],

    // Initialize data from localStorage
    init() {
        this.loadData();
        console.log('DataManager initialized');
    },

    // Load all data from localStorage
    loadData() {
        this.nailPolishes = JSON.parse(localStorage.getItem('nailPolishes')) || [];
        this.toppers = JSON.parse(localStorage.getItem('toppers')) || [];
        this.comboPhotos = JSON.parse(localStorage.getItem('comboPhotos')) || {};
        this.customColors = JSON.parse(localStorage.getItem('customColors')) || [];
        this.customFormulas = JSON.parse(localStorage.getItem('customFormulas')) || [];
        this.customTopperTypes = JSON.parse(localStorage.getItem('customTopperTypes')) || [];
        this.usedCombinations = JSON.parse(localStorage.getItem('usedCombinations')) || [];
        
        console.log(`Loaded ${this.nailPolishes.length} polishes and ${this.toppers.length} toppers`);
    },

    // Save all data to localStorage
    saveData() {
        localStorage.setItem('nailPolishes', JSON.stringify(this.nailPolishes));
        localStorage.setItem('toppers', JSON.stringify(this.toppers));
        localStorage.setItem('comboPhotos', JSON.stringify(this.comboPhotos));
        localStorage.setItem('customColors', JSON.stringify(this.customColors));
        localStorage.setItem('customFormulas', JSON.stringify(this.customFormulas));
        localStorage.setItem('customTopperTypes', JSON.stringify(this.customTopperTypes));
        localStorage.setItem('usedCombinations', JSON.stringify(this.usedCombinations));
    },

    // Polish management
    addPolish(polish) {
        this.nailPolishes.push(polish);
        this.saveData();
        console.log(`Added polish: ${polish.name} by ${polish.brand}`);
    },

    removePolish(polishName, polishBrand) {
        const index = this.nailPolishes.findIndex(polish => 
            polish.name === polishName && polish.brand === polishBrand
        );
        if (index !== -1) {
            this.nailPolishes.splice(index, 1);
            this.saveData();
            console.log(`Removed polish: ${polishName} by ${polishBrand}`);
            return true;
        }
        return false;
    },

    // Topper management
    addTopper(topper) {
        this.toppers.push(topper);
        this.saveData();
        console.log(`Added topper: ${topper.name} by ${topper.brand}`);
    },

    removeTopper(topperName, topperBrand) {
        const index = this.toppers.findIndex(topper => 
            topper.name === topperName && topper.brand === topperBrand
        );
        if (index !== -1) {
            this.toppers.splice(index, 1);
            this.saveData();
            console.log(`Removed topper: ${topperName} by ${topperBrand}`);
            return true;
        }
        return false;
    },

    // Combination tracking
    addCombination(polish, topper = null) {
        const combo = {
            id: Date.now().toString(), // Simple ID generation
            polish: polish.name,
            polishBrand: polish.brand,
            polishColor: polish.color,
            polishFormula: polish.formula,
            topper: topper ? topper.name : null,
            topperBrand: topper ? topper.brand : null,
            topperType: topper ? topper.type : null,
            date: new Date().toISOString()
        };
        this.usedCombinations.push(combo);
        this.saveData();
        console.log(`Added confirmed combination: ${combo.polish}${combo.topper ? ' + ' + combo.topper : ''}`);
        return combo;
    },

    // Remove a combination
    removeCombination(combinationId) {
        const index = this.usedCombinations.findIndex(combo => combo.id === combinationId);
        if (index !== -1) {
            const removedCombo = this.usedCombinations.splice(index, 1)[0];
            this.saveData();
            console.log(`Removed combination: ${removedCombo.polish}${removedCombo.topper ? ' + ' + removedCombo.topper : ''}`);
            return true;
        }
        return false;
    },

    // Photo management
    saveComboPhoto(polish, topper, photoData) {
        const comboKey = this.generateComboKey(polish, topper);
        this.comboPhotos[comboKey] = photoData;
        this.saveData();
    },

    getComboPhoto(polish, topper) {
        const comboKey = this.generateComboKey(polish, topper);
        return this.comboPhotos[comboKey];
    },

    generateComboKey(polish, topper) {
        const polishKey = `${polish.name}-${polish.brand}`;
        const topperKey = topper ? `${topper.name}-${topper.brand}` : 'no-topper';
        return `${polishKey}__${topperKey}`;
    },

    // Custom options management
    addCustomColor(color) {
        if (!this.customColors.includes(color)) {
            this.customColors.push(color);
            this.saveData();
            return true;
        }
        return false;
    },

    addCustomFormula(formula) {
        if (!this.customFormulas.includes(formula)) {
            this.customFormulas.push(formula);
            this.saveData();
            return true;
        }
        return false;
    },

    addCustomTopperType(type) {
        if (!this.customTopperTypes.includes(type)) {
            this.customTopperTypes.push(type);
            this.saveData();
            return true;
        }
        return false;
    },

    removeCustomColor(color) {
        const index = this.customColors.indexOf(color);
        if (index !== -1) {
            this.customColors.splice(index, 1);
            this.saveData();
            return true;
        }
        return false;
    },

    removeCustomFormula(formula) {
        const index = this.customFormulas.indexOf(formula);
        if (index !== -1) {
            this.customFormulas.splice(index, 1);
            this.saveData();
            return true;
        }
        return false;
    },

    removeCustomTopperType(type) {
        const index = this.customTopperTypes.indexOf(type);
        if (index !== -1) {
            this.customTopperTypes.splice(index, 1);
            this.saveData();
            return true;
        }
        return false;
    },

    // Utility functions
    getAllColors() {
        const defaultColors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'nude', 'black', 'brown', 'grey', 'white'];
        return [...defaultColors, ...this.customColors];
    },

    getAllFormulas() {
        const defaultFormulas = ['creme', 'shimmer', 'glitter', 'metallic', 'holographic', 'chrome'];
        return [...defaultFormulas, ...this.customFormulas];
    },

    getAllTopperTypes() {
        const defaultTypes = ['glossy', 'matte', 'glitter', 'shimmer', 'holographic', 'chrome'];
        return [...defaultTypes, ...this.customTopperTypes];
    },

    // Data export/import
    exportData() {
        return {
            nailPolishes: this.nailPolishes,
            toppers: this.toppers,
            comboPhotos: this.comboPhotos,
            customColors: this.customColors,
            customFormulas: this.customFormulas,
            customTopperTypes: this.customTopperTypes,
            usedCombinations: this.usedCombinations,
            exportDate: new Date().toISOString()
        };
    },

    importData(data) {
        if (data.nailPolishes) this.nailPolishes = data.nailPolishes;
        if (data.toppers) this.toppers = data.toppers;
        if (data.comboPhotos) this.comboPhotos = data.comboPhotos;
        if (data.customColors) this.customColors = data.customColors;
        if (data.customFormulas) this.customFormulas = data.customFormulas;
        if (data.customTopperTypes) this.customTopperTypes = data.customTopperTypes;
        if (data.usedCombinations) this.usedCombinations = data.usedCombinations;
        
        this.saveData();
        console.log('Data imported successfully');
    },

    // Reset all data
    resetAllData() {
        this.nailPolishes = [];
        this.toppers = [];
        this.comboPhotos = {};
        this.customColors = [];
        this.customFormulas = [];
        this.customTopperTypes = [];
        this.usedCombinations = [];
        
        localStorage.clear();
        console.log('All data reset');
    }
};
