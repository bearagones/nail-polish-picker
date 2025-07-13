// Tab Navigation - Handles switching between different tabs
const TabNavigation = {
    // DOM elements
    pickerTab: null,
    collectionTab: null,
    combinationsTab: null,
    settingsTab: null,
    pickerContent: null,
    collectionContent: null,
    combinationsContent: null,
    settingsContent: null,

    // Initialize tab navigation
    init() {
        this.getDOMElements();
        this.attachEventListeners();
        console.log('TabNavigation initialized');
    },

    // Get all DOM elements
    getDOMElements() {
        this.pickerTab = document.getElementById('picker-tab');
        this.collectionTab = document.getElementById('collection-tab');
        this.combinationsTab = document.getElementById('combinations-tab');
        this.settingsTab = document.getElementById('settings-tab');
        this.pickerContent = document.getElementById('picker-content');
        this.collectionContent = document.getElementById('collection-content');
        this.combinationsContent = document.getElementById('combinations-content');
        this.settingsContent = document.getElementById('settings-content');
    },

    // Attach event listeners to tabs
    attachEventListeners() {
        if (this.pickerTab) {
            this.pickerTab.addEventListener('click', () => this.switchTab(this.pickerTab, this.pickerContent));
        }
        
        if (this.collectionTab) {
            this.collectionTab.addEventListener('click', () => this.switchTab(this.collectionTab, this.collectionContent));
        }
        
        if (this.combinationsTab) {
            this.combinationsTab.addEventListener('click', () => this.switchTab(this.combinationsTab, this.combinationsContent));
        }
        
        if (this.settingsTab) {
            this.settingsTab.addEventListener('click', () => this.switchTab(this.settingsTab, this.settingsContent));
        }
    },

    // Switch to a specific tab
    switchTab(activeTab, activeContent) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.tab-button').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
        
        // Add active class to selected tab and content
        activeTab.classList.add('active');
        activeContent.classList.remove('hidden');
        
        // Handle specific tab actions
        if (activeContent === this.collectionContent) {
            // Update collection when switching to collection tab
            if (window.CollectionManager) {
                CollectionManager.updateCollectionStats();
            }
        }
        
        if (activeContent === this.combinationsContent) {
            // Update combinations when switching to combinations tab
            if (window.CombinationsManager) {
                CombinationsManager.updateCombinationsDisplay();
            }
        }
        
        if (activeContent === this.settingsContent) {
            // Update settings when switching to settings tab
            if (window.SettingsManager) {
                SettingsManager.updateCustomOptionsDisplay();
            }
        }

        console.log(`Switched to tab: ${activeTab.textContent}`);
    },

    // Get currently active tab
    getActiveTab() {
        const activeTab = document.querySelector('.tab-button.active');
        return activeTab ? activeTab.textContent : null;
    },

    // Switch to tab by name
    switchToTab(tabName) {
        switch(tabName.toLowerCase()) {
            case 'picker':
            case 'polish picker':
                this.switchTab(this.pickerTab, this.pickerContent);
                break;
            case 'collection':
            case 'my collection':
                this.switchTab(this.collectionTab, this.collectionContent);
                break;
            case 'combinations':
            case 'recent combinations':
                this.switchTab(this.combinationsTab, this.combinationsContent);
                break;
            case 'settings':
                this.switchTab(this.settingsTab, this.settingsContent);
                break;
            default:
                console.warn(`Unknown tab: ${tabName}`);
        }
    }
};
