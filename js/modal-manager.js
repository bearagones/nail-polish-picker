// Modal Manager - Handles custom modal dialogs
const ModalManager = {
    // Initialize modal manager
    init() {
        this.createModalHTML();
        this.attachEventListeners();
        console.log('ModalManager initialized');
    },

    // Create modal HTML structure
    createModalHTML() {
        const modalHTML = `
            <!-- Custom Modal -->
            <div id="custom-modal" class="modal-overlay hidden">
                <div class="modal-container">
                    <div class="modal-header">
                        <h3 id="modal-title">Notification</h3>
                        <button id="modal-close" class="modal-close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p id="modal-message">Message goes here</p>
                    </div>
                    <div class="modal-footer">
                        <button id="modal-confirm" class="modal-btn modal-btn-primary hidden">Confirm</button>
                        <button id="modal-cancel" class="modal-btn modal-btn-secondary hidden">Cancel</button>
                        <button id="modal-ok" class="modal-btn modal-btn-primary hidden">OK</button>
                    </div>
                </div>
            </div>
        `;

        // Add modal to the body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    // Attach event listeners
    attachEventListeners() {
        const modal = document.getElementById('custom-modal');
        const closeBtn = document.getElementById('modal-close');
        const confirmBtn = document.getElementById('modal-confirm');
        const cancelBtn = document.getElementById('modal-cancel');
        const okBtn = document.getElementById('modal-ok');

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideModal();
            }
        });

        // Close button
        closeBtn.addEventListener('click', () => {
            this.hideModal();
        });

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                this.hideModal();
            }
        });
    },

    // Show modal
    showModal() {
        const modal = document.getElementById('custom-modal');
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    },

    // Hide modal
    hideModal() {
        const modal = document.getElementById('custom-modal');
        modal.classList.add('hidden');
        document.body.style.overflow = ''; // Restore scrolling
        
        // Clean up any pending promises
        if (this.currentResolve) {
            this.currentResolve(false);
            this.currentResolve = null;
        }
    },

    // Custom alert replacement
    alert(message, title = 'Notification') {
        return new Promise((resolve) => {
            const titleElement = document.getElementById('modal-title');
            const messageElement = document.getElementById('modal-message');
            const confirmBtn = document.getElementById('modal-confirm');
            const cancelBtn = document.getElementById('modal-cancel');
            const okBtn = document.getElementById('modal-ok');

            // Set content
            titleElement.textContent = title;
            messageElement.textContent = message;

            // Show only OK button
            confirmBtn.style.display = 'none';
            cancelBtn.style.display = 'none';
            okBtn.style.display = 'inline-block';

            // Set up OK button handler
            const handleOk = () => {
                okBtn.removeEventListener('click', handleOk);
                this.hideModal();
                resolve(true);
            };

            okBtn.addEventListener('click', handleOk);
            this.currentResolve = resolve;

            this.showModal();
        });
    },

    // Custom confirm replacement
    confirm(message, title = 'Confirm Action') {
        return new Promise((resolve) => {
            const titleElement = document.getElementById('modal-title');
            const messageElement = document.getElementById('modal-message');
            const confirmBtn = document.getElementById('modal-confirm');
            const cancelBtn = document.getElementById('modal-cancel');
            const okBtn = document.getElementById('modal-ok');

            // Set content
            titleElement.textContent = title;
            messageElement.textContent = message;

            // Show confirm and cancel buttons only
            confirmBtn.style.display = 'inline-block';
            cancelBtn.style.display = 'inline-block';
            okBtn.style.display = 'none';

            // Set up button handlers
            const handleConfirm = () => {
                confirmBtn.removeEventListener('click', handleConfirm);
                cancelBtn.removeEventListener('click', handleCancel);
                this.hideModal();
                resolve(true);
            };

            const handleCancel = () => {
                confirmBtn.removeEventListener('click', handleConfirm);
                cancelBtn.removeEventListener('click', handleCancel);
                this.hideModal();
                resolve(false);
            };

            confirmBtn.addEventListener('click', handleConfirm);
            cancelBtn.addEventListener('click', handleCancel);
            this.currentResolve = resolve;

            this.showModal();
        });
    },

    // Success alert with green styling
    success(message, title = 'Success') {
        const modal = document.getElementById('custom-modal');
        modal.classList.add('modal-success');
        
        return this.alert(message, title).then((result) => {
            modal.classList.remove('modal-success');
            return result;
        });
    },

    // Error alert with red styling
    error(message, title = 'Error') {
        const modal = document.getElementById('custom-modal');
        modal.classList.add('modal-error');
        
        return this.alert(message, title).then((result) => {
            modal.classList.remove('modal-error');
            return result;
        });
    },

    // Warning alert with yellow styling
    warning(message, title = 'Warning') {
        const modal = document.getElementById('custom-modal');
        modal.classList.add('modal-warning');
        
        return this.alert(message, title).then((result) => {
            modal.classList.remove('modal-warning');
            return result;
        });
    }
};
