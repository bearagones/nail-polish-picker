// Combinations Manager - Handles the Recent Combinations tab functionality
const CombinationsManager = {
    // DOM elements
    combinationsTriedElement: null,
    mostCommonColorElement: null,
    combinationsListElement: null,

    // Initialize combinations manager
    init() {
        this.getDOMElements();
        this.updateCombinationsDisplay();
        console.log('CombinationsManager initialized');
    },

    // Get all DOM elements
    getDOMElements() {
        this.combinationsTriedElement = document.getElementById('combinations-tried');
        this.mostCommonColorElement = document.getElementById('most-common-color');
        this.combinationsListElement = document.getElementById('combinations-list');
    },

    // Update all combinations display
    updateCombinationsDisplay() {
        this.updateStats();
        this.displayCombinations();
    },

    // Update statistics
    updateStats() {
        if (this.combinationsTriedElement) {
            this.combinationsTriedElement.textContent = DataManager.usedCombinations.length;
        }

        if (this.mostCommonColorElement) {
            const mostCommonColor = this.getMostCommonColor();
            this.mostCommonColorElement.textContent = mostCommonColor || '-';
        }
    },

    // Get most common color from used combinations
    getMostCommonColor() {
        if (DataManager.usedCombinations.length === 0) return null;

        const colorCounts = {};
        DataManager.usedCombinations.forEach(combo => {
            if (combo.polishColor) {
                colorCounts[combo.polishColor] = (colorCounts[combo.polishColor] || 0) + 1;
            }
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

    // Display combinations list
    displayCombinations() {
        if (!this.combinationsListElement) return;

        this.combinationsListElement.innerHTML = '';

        if (DataManager.usedCombinations.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.innerHTML = `
                <p>No combinations tried yet!</p>
                <p>When you pick a polish and mark it as "used", it will appear here.</p>
            `;
            this.combinationsListElement.appendChild(emptyMessage);
            return;
        }

        // Sort combinations by date (most recent first)
        const sortedCombinations = [...DataManager.usedCombinations].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );

        sortedCombinations.forEach(combo => {
            const comboCard = this.createCombinationCard(combo);
            this.combinationsListElement.appendChild(comboCard);
        });
    },

    // Create a combination card element
    createCombinationCard(combo) {
        const card = document.createElement('div');
        card.className = 'combination-card';

        const date = new Date(combo.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        card.innerHTML = `
            <div class="combination-header">
                <h3 class="combination-polish">${combo.polish}</h3>
                <span class="combination-date">${date}</span>
            </div>
            <div class="combination-details">
                <span class="combination-brand">${combo.polishBrand}</span>
                <span class="combination-color-tag">${combo.polishColor}</span>
                <span class="combination-formula-tag">${combo.polishFormula}</span>
            </div>
            ${combo.topper ? `
                <div class="combination-topper">
                    <span class="topper-label">+ Topper:</span>
                    <span class="topper-name">${combo.topper}</span>
                    <span class="topper-brand">${combo.topperBrand}</span>
                    <span class="topper-type-tag">${combo.topperType}</span>
                </div>
            ` : ''}
            <div class="combination-actions">
                <button class="delete-combination-btn" data-id="${combo.id}">
                    🗑️ Remove
                </button>
            </div>
        `;

        // Add delete functionality
        const deleteBtn = card.querySelector('.delete-combination-btn');
        deleteBtn.addEventListener('click', () => {
            this.deleteCombination(combo.id);
        });

        return card;
    },

    // Delete a combination
    async deleteCombination(combinationId) {
        const confirmed = await ModalManager.confirm('Are you sure you want to remove this combination from your history?', 'Delete Combination');
        if (confirmed) {
            const success = DataManager.removeCombination(combinationId);

            if (success) {
                this.updateCombinationsDisplay();

                // Update collection stats if available
                if (window.CollectionManager) {
                    CollectionManager.updateCollectionStats();
                }

                console.log(`Deleted combination: ${combinationId}`);
            }
        }
    }
};
