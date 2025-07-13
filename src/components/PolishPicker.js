import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useModal } from '../context/ModalContext';

const PolishPicker = () => {
  const { nailPolishes, toppers, getAllColors, getAllFormulas, dispatch } = useData();
  const { success } = useModal();
  
  const [filters, setFilters] = useState({
    color: 'any',
    formula: 'any',
    includeTopper: false
  });
  
  const [result, setResult] = useState(null);
  const [currentCombination, setCurrentCombination] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isUsed, setIsUsed] = useState(false);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCombination = () => {
    if (!currentCombination) return;

    const updatedCombination = {
      ...currentCombination,
      used: isUsed
    };

    // Save the combination
    dispatch({ type: 'ADD_COMBINATION', payload: updatedCombination });

    // Save photo if uploaded
    if (photoPreview && isUsed) {
      dispatch({ 
        type: 'SAVE_COMBO_PHOTO', 
        payload: { 
          key: currentCombination.id.toString(), 
          photo: photoPreview 
        } 
      });
    }

    if (isUsed) {
      success('Combination saved to Recent Combinations!');
    } else {
      success('Combination generated! Check "I used this combination" to save it to Recent Combinations.');
    }
  };

  const pickRandomPolish = () => {
    if (nailPolishes.length === 0) {
      success('Please add some nail polishes to your collection first!', 'No Polishes Available');
      return;
    }

    let filteredPolishes = nailPolishes;

    // Filter by color
    if (filters.color !== 'any') {
      filteredPolishes = filteredPolishes.filter(polish => 
        polish.color.toLowerCase() === filters.color.toLowerCase()
      );
    }

    // Filter by formula
    if (filters.formula !== 'any') {
      filteredPolishes = filteredPolishes.filter(polish => 
        polish.formula.toLowerCase() === filters.formula.toLowerCase()
      );
    }

    if (filteredPolishes.length === 0) {
      success('No polishes match your criteria. Try adjusting your filters!', 'No Matches Found');
      return;
    }

    // Pick random polish
    const randomPolish = filteredPolishes[Math.floor(Math.random() * filteredPolishes.length)];
    
    let selectedTopper = null;
    if (filters.includeTopper && toppers.length > 0) {
      selectedTopper = toppers[Math.floor(Math.random() * toppers.length)];
    }

    // Create combination but don't mark as used yet
    const combination = {
      id: Date.now(),
      polish: randomPolish,
      topper: selectedTopper,
      date: new Date().toISOString(),
      used: false
    };

    setCurrentCombination(combination);
    setResult({ polish: randomPolish, topper: selectedTopper });
    setIsUsed(false);
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  return (
    <div>
      <div className="filters">
        <div className="filter-group">
          <label>Color Preference:</label>
          <select 
            value={filters.color} 
            onChange={(e) => handleFilterChange('color', e.target.value)}
          >
            <option value="any">Any Color</option>
            {getAllColors().map(color => (
              <option key={color} value={color}>
                {color.charAt(0).toUpperCase() + color.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Formula Preference:</label>
          <select 
            value={filters.formula} 
            onChange={(e) => handleFilterChange('formula', e.target.value)}
          >
            <option value="any">Any Formula</option>
            {getAllFormulas().map(formula => (
              <option key={formula} value={formula}>
                {formula.charAt(0).toUpperCase() + formula.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.includeTopper}
              onChange={(e) => handleFilterChange('includeTopper', e.target.checked)}
            />
            Include a topper
          </label>
        </div>
      </div>

      <button className="pick-button" onClick={pickRandomPolish}>
        Pick My Polish!
      </button>

      {result && (
        <div className="result">
          <div className="polish-card">
            <h2>{result.polish.name}</h2>
            <div className="polish-details">
              <span className="brand">{result.polish.brand}</span>
              <span className="color-tag">{result.polish.color}</span>
              <span className="formula-tag">{result.polish.formula}</span>
            </div>
          </div>

          {result.topper && (
            <div className="topper-card">
              <h3>With Topper: {result.topper.name}</h3>
              <div className="topper-details">
                <span className="brand">{result.topper.brand}</span>
                <span className="formula-tag">{result.topper.type}</span>
              </div>
            </div>
          )}

          <div className="combination-actions">
            <div className="photo-upload-section">
              <label htmlFor="photo-upload" className="photo-upload-label">
                📷 Upload Photo (Optional)
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
              {photoPreview && (
                <div className="photo-preview">
                  <img src={photoPreview} alt="Combination preview" style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px' }} />
                </div>
              )}
            </div>

            <div className="used-checkbox">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isUsed}
                  onChange={(e) => setIsUsed(e.target.checked)}
                />
                I used this combination
              </label>
            </div>

            <button className="save-combination-button" onClick={handleSaveCombination}>
              {isUsed ? 'Save to Recent Combinations' : 'Generate Another'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolishPicker;
