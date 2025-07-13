// Load data from localStorage or use default data for new users
let nailPolishes = JSON.parse(localStorage.getItem('nailPolishes')) || [];

// Topper Database with localStorage
let toppers = JSON.parse(localStorage.getItem('toppers')) || [];

// Photo storage for combinations with localStorage
let comboPhotos = JSON.parse(localStorage.getItem('comboPhotos')) || {};

// DOM Elements
const colorFilter = document.getElementById('color-filter');
const formulaFilter = document.getElementById('formula-filter');
const topperCheckbox = document.getElementById('topper-checkbox');
const pickButton = document.getElementById('pick-button');
const pickAgainButton = document.getElementById('pick-again');
const result = document.getElementById('result');
const topperResult = document.getElementById('topper-result');

// Result display elements
const polishName = document.getElementById('polish-name');
const polishBrand = document.getElementById('polish-brand');
const polishColor = document.getElementById('polish-color');
const polishFormula = document.getElementById('polish-formula');

const topperName = document.getElementById('topper-name');
const topperBrand = document.getElementById('topper-brand');
const topperType = document.getElementById('topper-type');

// Add polish form elements
const addPolishToggle = document.getElementById('add-polish-toggle');
const addPolishForm = document.getElementById('add-polish-form');
const newPolishName = document.getElementById('new-polish-name');
const newPolishBrand = document.getElementById('new-polish-brand');
const newPolishColor = document.getElementById('new-polish-color');
const newPolishFormula = document.getElementById('new-polish-formula');
const savePolishButton = document.getElementById('save-polish');
const cancelAddButton = document.getElementById('cancel-add');

// Add topper form elements
const addTopperToggle = document.getElementById('add-topper-toggle');
const addTopperForm = document.getElementById('add-topper-form');
const newTopperName = document.getElementById('new-topper-name');
const newTopperBrand = document.getElementById('new-topper-brand');
const newTopperType = document.getElementById('new-topper-type');
const saveTopperButton = document.getElementById('save-topper');
const cancelAddTopperButton = document.getElementById('cancel-add-topper');

// Photo elements
const existingPhoto = document.getElementById('existing-photo');
const comboImage = document.getElementById('combo-image');
const uploadPhotoSection = document.getElementById('upload-photo-section');
const photoUpload = document.getElementById('photo-upload');
const savePhotoButton = document.getElementById('save-photo');

// Filter function
function filterPolishes() {
    const selectedColor = colorFilter.value;
    const selectedFormula = formulaFilter.value;

    return nailPolishes.filter(polish => {
        const colorMatch = !selectedColor || polish.color === selectedColor;
        const formulaMatch = !selectedFormula || polish.formula === selectedFormula;
        return colorMatch && formulaMatch;
    });
}

// Random selection function
function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Display results function
function displayResults(selectedPolish, selectedTopper = null) {
    // Display polish
    polishName.textContent = selectedPolish.name;
    polishBrand.textContent = selectedPolish.brand;
    polishColor.textContent = selectedPolish.color;
    polishFormula.textContent = selectedPolish.formula;

    // Display topper if selected
    if (selectedTopper) {
        topperName.textContent = selectedTopper.name;
        topperBrand.textContent = selectedTopper.brand;
        topperType.textContent = selectedTopper.type;
        topperResult.classList.remove('hidden');
    } else {
        topperResult.classList.add('hidden');
    }

    // Show results
    result.classList.remove('hidden');
    pickAgainButton.classList.remove('hidden');
}

// Main pick function
function pickPolish() {
    const filteredPolishes = filterPolishes();

    if (filteredPolishes.length === 0) {
        alert('No polishes match your criteria! Try adjusting your filters.');
        return;
    }

    const selectedPolish = getRandomItem(filteredPolishes);
    let selectedTopper = null;

    if (topperCheckbox.checked) {
        selectedTopper = getRandomItem(toppers);
    }

    displayResults(selectedPolish, selectedTopper);
}

// Reset function
function resetPicker() {
    result.classList.add('hidden');
    pickAgainButton.classList.add('hidden');
    colorFilter.value = '';
    formulaFilter.value = '';
    topperCheckbox.checked = false;
}

// Event listeners
pickButton.addEventListener('click', pickPolish);
pickAgainButton.addEventListener('click', pickPolish);

// Optional: Add keyboard support
document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && !result.classList.contains('hidden')) {
        pickPolish();
    } else if (event.key === 'Escape') {
        resetPicker();
    }
});

// Add polish form functions
function toggleAddPolishForm() {
    const isHidden = addPolishForm.classList.contains('hidden');
    if (isHidden) {
        addPolishForm.classList.remove('hidden');
        addPolishToggle.textContent = '- Hide Form';
        // Hide results when adding new polish
        result.classList.add('hidden');
        pickAgainButton.classList.add('hidden');
    } else {
        hideAddPolishForm();
    }
}

function hideAddPolishForm() {
    addPolishForm.classList.add('hidden');
    addPolishToggle.textContent = '+ Add New Polish';
    clearAddPolishForm();
}

function clearAddPolishForm() {
    newPolishName.value = '';
    newPolishBrand.value = '';
    newPolishColor.value = 'red';
    newPolishFormula.value = 'creme';
}

function validatePolishForm() {
    const name = newPolishName.value.trim();
    const brand = newPolishBrand.value.trim();

    if (!name) {
        alert('Please enter a polish name.');
        newPolishName.focus();
        return false;
    }

    if (!brand) {
        alert('Please enter a brand name.');
        newPolishBrand.focus();
        return false;
    }

    // Check if polish already exists
    const existingPolish = nailPolishes.find(polish =>
        polish.name.toLowerCase() === name.toLowerCase() &&
        polish.brand.toLowerCase() === brand.toLowerCase()
    );

    if (existingPolish) {
        alert('A polish with this name and brand already exists!');
        newPolishName.focus();
        return false;
    }

    return true;
}

function saveNewPolish() {
    if (!validatePolishForm()) {
        return;
    }

    const newPolish = {
        name: newPolishName.value.trim(),
        brand: newPolishBrand.value.trim(),
        color: newPolishColor.value,
        formula: newPolishFormula.value
    };

    // Add to database
    nailPolishes.push(newPolish);

    // Show success message
    alert(`Successfully added "${newPolish.name}" by ${newPolish.brand} to your collection!`);

    // Hide form and clear inputs
    hideAddPolishForm();

    // Update console log
    console.log(`New polish added! Database now contains ${nailPolishes.length} polishes`);
    console.log('Added polish:', newPolish);
}

// Add topper form functions
function toggleAddTopperForm() {
    const isHidden = addTopperForm.classList.contains('hidden');
    if (isHidden) {
        addTopperForm.classList.remove('hidden');
        addTopperToggle.textContent = '- Hide Form';
        // Hide results when adding new topper
        result.classList.add('hidden');
        pickAgainButton.classList.add('hidden');
    } else {
        hideAddTopperForm();
    }
}

function hideAddTopperForm() {
    addTopperForm.classList.add('hidden');
    addTopperToggle.textContent = '+ Add New Topper';
    clearAddTopperForm();
}

function clearAddTopperForm() {
    newTopperName.value = '';
    newTopperBrand.value = '';
    newTopperType.value = 'glossy';
}

function validateTopperForm() {
    const name = newTopperName.value.trim();
    const brand = newTopperBrand.value.trim();

    if (!name) {
        alert('Please enter a topper name.');
        newTopperName.focus();
        return false;
    }

    if (!brand) {
        alert('Please enter a brand name.');
        newTopperBrand.focus();
        return false;
    }

    // Check if topper already exists
    const existingTopper = toppers.find(topper =>
        topper.name.toLowerCase() === name.toLowerCase() &&
        topper.brand.toLowerCase() === brand.toLowerCase()
    );

    if (existingTopper) {
        alert('A topper with this name and brand already exists!');
        newTopperName.focus();
        return false;
    }

    return true;
}

function saveNewTopper() {
    if (!validateTopperForm()) {
        return;
    }

    const newTopper = {
        name: newTopperName.value.trim(),
        brand: newTopperBrand.value.trim(),
        type: newTopperType.value
    };

    // Add to database
    toppers.push(newTopper);

    // Save to localStorage
    saveToLocalStorage();

    // Show success message
    alert(`Successfully added "${newTopper.name}" by ${newTopper.brand} to your topper collection!`);

    // Hide form and clear inputs
    hideAddTopperForm();

    // Update console log
    console.log(`New topper added! Database now contains ${toppers.length} toppers`);
    console.log('Added topper:', newTopper);
}

// Photo functionality
function generateComboKey(polish, topper) {
    const polishKey = `${polish.name}-${polish.brand}`;
    const topperKey = topper ? `${topper.name}-${topper.brand}` : 'no-topper';
    return `${polishKey}__${topperKey}`;
}

function checkForExistingPhoto(polish, topper) {
    const comboKey = generateComboKey(polish, topper);
    return comboPhotos[comboKey];
}

function displayPhotoSection(polish, topper) {
    const existingPhotoData = checkForExistingPhoto(polish, topper);
    
    if (existingPhotoData) {
        // Show existing photo
        comboImage.src = existingPhotoData;
        existingPhoto.classList.remove('hidden');
        uploadPhotoSection.querySelector('h4').textContent = 'Upload a New Photo of This Combination:';
    } else {
        // Hide existing photo section
        existingPhoto.classList.add('hidden');
        uploadPhotoSection.querySelector('h4').textContent = 'Upload a Photo of This Combination:';
    }
    
    // Reset photo upload
    photoUpload.value = '';
    savePhotoButton.classList.add('hidden');
}

function handlePhotoUpload() {
    const file = photoUpload.files[0];
    if (file) {
        savePhotoButton.classList.remove('hidden');
    } else {
        savePhotoButton.classList.add('hidden');
    }
}

function savePhoto() {
    const file = photoUpload.files[0];
    if (!file) {
        alert('Please select a photo first.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const polish = {
            name: polishName.textContent,
            brand: polishBrand.textContent
        };
        
        const topper = topperResult.classList.contains('hidden') ? null : {
            name: topperName.textContent,
            brand: topperBrand.textContent
        };

        const comboKey = generateComboKey(polish, topper);
        comboPhotos[comboKey] = e.target.result;
        
        // Save to localStorage
        saveToLocalStorage();
        
        // Update display
        displayPhotoSection(polish, topper);
        
        alert('Photo saved successfully!');
    };
    
    reader.readAsDataURL(file);
}

// localStorage functions
function saveToLocalStorage() {
    localStorage.setItem('nailPolishes', JSON.stringify(nailPolishes));
    localStorage.setItem('toppers', JSON.stringify(toppers));
    localStorage.setItem('comboPhotos', JSON.stringify(comboPhotos));
}

// Enhanced display results function with photo support
function displayResults(selectedPolish, selectedTopper = null) {
    // Display polish
    polishName.textContent = selectedPolish.name;
    polishBrand.textContent = selectedPolish.brand;
    polishColor.textContent = selectedPolish.color;
    polishFormula.textContent = selectedPolish.formula;

    // Display topper if selected
    if (selectedTopper) {
        topperName.textContent = selectedTopper.name;
        topperBrand.textContent = selectedTopper.brand;
        topperType.textContent = selectedTopper.type;
        topperResult.classList.remove('hidden');
    } else {
        topperResult.classList.add('hidden');
    }

    // Display photo section
    displayPhotoSection(selectedPolish, selectedTopper);

    // Show results
    result.classList.remove('hidden');
    pickAgainButton.classList.remove('hidden');
}

// Enhanced save polish function with localStorage
function saveNewPolish() {
    if (!validatePolishForm()) {
        return;
    }

    const newPolish = {
        name: newPolishName.value.trim(),
        brand: newPolishBrand.value.trim(),
        color: newPolishColor.value,
        formula: newPolishFormula.value
    };

    // Add to database
    nailPolishes.push(newPolish);

    // Save to localStorage
    saveToLocalStorage();

    // Show success message
    alert(`Successfully added "${newPolish.name}" by ${newPolish.brand} to your collection!`);

    // Hide form and clear inputs
    hideAddPolishForm();

    // Update console log
    console.log(`New polish added! Database now contains ${nailPolishes.length} polishes`);
    console.log('Added polish:', newPolish);
}

// Event listeners
addPolishToggle.addEventListener('click', toggleAddPolishForm);
savePolishButton.addEventListener('click', saveNewPolish);
cancelAddButton.addEventListener('click', hideAddPolishForm);

// Topper form event listeners
addTopperToggle.addEventListener('click', toggleAddTopperForm);
saveTopperButton.addEventListener('click', saveNewTopper);
cancelAddTopperButton.addEventListener('click', hideAddTopperForm);

// Photo event listeners
photoUpload.addEventListener('change', handlePhotoUpload);
savePhotoButton.addEventListener('click', savePhoto);

// Initialize the app
document.addEventListener('DOMContentLoaded', function () {
    console.log('Nail Polish Picker loaded successfully!');
    console.log(`Database contains ${nailPolishes.length} polishes and ${toppers.length} toppers`);
    
    // Save initial data to localStorage if it's a new user
    if (!localStorage.getItem('nailPolishes')) {
        saveToLocalStorage();
        console.log('Initial database saved to localStorage for new user');
    }
});
