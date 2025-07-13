// Photo Manager - Handles photo upload and display functionality
const PhotoManager = {
    // DOM elements
    existingPhoto: null,
    comboImage: null,
    uploadPhotoSection: null,
    photoUpload: null,
    savePhotoButton: null,

    // Initialize photo manager
    init() {
        this.getDOMElements();
        this.attachEventListeners();
        console.log('PhotoManager initialized');
    },

    // Get all DOM elements
    getDOMElements() {
        this.existingPhoto = document.getElementById('existing-photo');
        this.comboImage = document.getElementById('combo-image');
        this.uploadPhotoSection = document.getElementById('upload-photo-section');
        this.photoUpload = document.getElementById('photo-upload');
        this.savePhotoButton = document.getElementById('save-photo');
    },

    // Attach event listeners
    attachEventListeners() {
        if (this.photoUpload) {
            this.photoUpload.addEventListener('change', () => this.handlePhotoUpload());
        }

        if (this.savePhotoButton) {
            this.savePhotoButton.addEventListener('click', () => this.savePhoto());
        }
    },

    // Display photo section for a combination
    displayPhotoSection(polish, topper) {
        const existingPhotoData = this.checkForExistingPhoto(polish, topper);
        
        if (existingPhotoData && this.existingPhoto && this.comboImage) {
            // Show existing photo
            this.comboImage.src = existingPhotoData;
            this.existingPhoto.classList.remove('hidden');
            
            if (this.uploadPhotoSection) {
                const heading = this.uploadPhotoSection.querySelector('h4');
                if (heading) {
                    heading.textContent = 'Upload a New Photo of This Combination:';
                }
            }
        } else {
            // Hide existing photo section
            if (this.existingPhoto) {
                this.existingPhoto.classList.add('hidden');
            }
            
            if (this.uploadPhotoSection) {
                const heading = this.uploadPhotoSection.querySelector('h4');
                if (heading) {
                    heading.textContent = 'Upload a Photo of This Combination:';
                }
            }
        }
        
        // Reset photo upload
        if (this.photoUpload) {
            this.photoUpload.value = '';
        }
        
        if (this.savePhotoButton) {
            this.savePhotoButton.classList.add('hidden');
        }
    },

    // Check for existing photo
    checkForExistingPhoto(polish, topper) {
        return DataManager.getComboPhoto(polish, topper);
    },

    // Handle photo upload
    handlePhotoUpload() {
        if (!this.photoUpload || !this.savePhotoButton) return;

        const file = this.photoUpload.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                ModalManager.warning('Please select a valid image file.');
                this.photoUpload.value = '';
                return;
            }

            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB in bytes
            if (file.size > maxSize) {
                ModalManager.warning('File size must be less than 5MB.');
                this.photoUpload.value = '';
                return;
            }

            this.savePhotoButton.classList.remove('hidden');
        } else {
            this.savePhotoButton.classList.add('hidden');
        }
    },

    // Save photo
    savePhoto() {
        if (!this.photoUpload) {
            ModalManager.error('Photo upload element not found.');
            return;
        }

        const file = this.photoUpload.files[0];
        if (!file) {
            ModalManager.warning('Please select a photo first.');
            return;
        }

        // Get current polish and topper from the result display
        const polishNameElement = document.getElementById('polish-name');
        const polishBrandElement = document.getElementById('polish-brand');
        const topperNameElement = document.getElementById('topper-name');
        const topperBrandElement = document.getElementById('topper-brand');
        const topperResult = document.getElementById('topper-result');

        if (!polishNameElement || !polishBrandElement) {
            ModalManager.warning('No polish selected. Please pick a polish first.');
            return;
        }

        const polish = {
            name: polishNameElement.textContent,
            brand: polishBrandElement.textContent
        };
        
        const topper = (topperResult && !topperResult.classList.contains('hidden') && topperNameElement && topperBrandElement) ? {
            name: topperNameElement.textContent,
            brand: topperBrandElement.textContent
        } : null;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                DataManager.saveComboPhoto(polish, topper, e.target.result);
                
                // Update display
                this.displayPhotoSection(polish, topper);
                
                ModalManager.success('Photo saved successfully!');
                console.log(`Photo saved for combination: ${polish.name} by ${polish.brand}${topper ? ` + ${topper.name}` : ''}`);
            } catch (error) {
                console.error('Error saving photo:', error);
                ModalManager.error('Error saving photo. Please try again.');
            }
        };
        
        reader.onerror = () => {
            ModalManager.error('Error reading file. Please try again.');
        };
        
        reader.readAsDataURL(file);
    },

    // Delete photo for a combination
    deletePhoto(polish, topper) {
        const comboKey = DataManager.generateComboKey(polish, topper);
        delete DataManager.comboPhotos[comboKey];
        DataManager.saveData();
        
        // Update display
        this.displayPhotoSection(polish, topper);
        
        console.log(`Photo deleted for combination: ${polish.name} by ${polish.brand}${topper ? ` + ${topper.name}` : ''}`);
    },

    // Get all photos
    getAllPhotos() {
        return DataManager.comboPhotos;
    },

    // Export photos as a zip file (would require additional library)
    exportPhotos() {
        const photos = this.getAllPhotos();
        const photoCount = Object.keys(photos).length;
        
        if (photoCount === 0) {
            ModalManager.warning('No photos to export.');
            return;
        }

        // For now, just log the photos
        console.log(`Found ${photoCount} photos:`, photos);
        ModalManager.alert(`Found ${photoCount} photos. Export functionality would require additional libraries.`);
    }
};
