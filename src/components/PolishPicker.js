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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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

    // Save combination
    const combination = {
      id: Date.now(),
      polish: randomPolish,
      topper: selectedTopper,
      date: new Date().toISOString()
    };

    dispatch({ type: 'ADD_COMBINATION', payload: combination });

    setResult({ polish: randomPolish, topper: selectedTopper });
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
        </div>
      )}
    </div>
  );
};

export default PolishPicker;
