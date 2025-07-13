import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useModal } from '../context/ModalContext';

const Collection = () => {
  const { nailPolishes, toppers, getAllColors, getAllFormulas, getAllTopperTypes, dispatch } = useData();
  const { success, confirm } = useModal();
  
  const [showAddPolish, setShowAddPolish] = useState(false);
  const [showAddTopper, setShowAddTopper] = useState(false);
  const [newPolish, setNewPolish] = useState({ name: '', brand: '', color: '', formula: '', collection: '' });
  const [newTopper, setNewTopper] = useState({ name: '', brand: '', type: '' });

  const handleAddPolish = (e) => {
    e.preventDefault();
    if (!newPolish.name || !newPolish.brand || !newPolish.color || !newPolish.formula) {
      success('Please fill in all fields', 'Missing Information');
      return;
    }
    
    dispatch({ type: 'ADD_POLISH', payload: newPolish });
    setNewPolish({ name: '', brand: '', color: '', formula: '', collection: '' });
    setShowAddPolish(false);
    success('Polish added successfully!');
  };

  const handleAddTopper = (e) => {
    e.preventDefault();
    if (!newTopper.name || !newTopper.brand || !newTopper.type) {
      success('Please fill in all fields', 'Missing Information');
      return;
    }
    
    dispatch({ type: 'ADD_TOPPER', payload: newTopper });
    setNewTopper({ name: '', brand: '', type: '' });
    setShowAddTopper(false);
    success('Topper added successfully!');
  };

  const handleDeletePolish = async (polish) => {
    const confirmed = await confirm(`Are you sure you want to delete "${polish.name}" by ${polish.brand}?`);
    if (confirmed) {
      dispatch({ type: 'REMOVE_POLISH', payload: polish });
      success('Polish deleted successfully!');
    }
  };

  const handleDeleteTopper = async (topper) => {
    const confirmed = await confirm(`Are you sure you want to delete "${topper.name}" by ${topper.brand}?`);
    if (confirmed) {
      dispatch({ type: 'REMOVE_TOPPER', payload: topper });
      success('Topper deleted successfully!');
    }
  };

  return (
    <div>
      <div className="stats-overview">
        <div className="stat-card">
          <h3>{nailPolishes.length}</h3>
          <p>Nail Polishes</p>
        </div>
        <div className="stat-card">
          <h3>{toppers.length}</h3>
          <p>Toppers</p>
        </div>
      </div>

      <div className="collection-buttons">
        <button className="secondary-button" onClick={() => setShowAddPolish(!showAddPolish)}>
          {showAddPolish ? 'Cancel' : 'Add Polish'}
        </button>
        <button className="secondary-button" onClick={() => setShowAddTopper(!showAddTopper)}>
          {showAddTopper ? 'Cancel' : 'Add Topper'}
        </button>
      </div>

      {showAddPolish && (
        <form className="add-polish-form" onSubmit={handleAddPolish}>
          <h3>Add New Polish</h3>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              value={newPolish.name}
              onChange={(e) => setNewPolish(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label>Brand:</label>
            <input
              type="text"
              value={newPolish.brand}
              onChange={(e) => setNewPolish(prev => ({ ...prev, brand: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label>Color:</label>
            <select
              value={newPolish.color}
              onChange={(e) => setNewPolish(prev => ({ ...prev, color: e.target.value }))}
              required
            >
              <option value="">Select Color</option>
              {getAllColors().map(color => (
                <option key={color} value={color}>
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                </option>
              ))}
              <option value="custom">+ Add Custom Color</option>
            </select>
            {newPolish.color === 'custom' && (
              <input
                type="text"
                placeholder="Enter custom color name"
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    const customColor = e.target.value.toLowerCase().trim();
                    dispatch({ type: 'ADD_CUSTOM_COLOR', payload: customColor });
                    setNewPolish(prev => ({ ...prev, color: customColor }));
                  } else {
                    setNewPolish(prev => ({ ...prev, color: '' }));
                  }
                }}
                style={{ marginTop: '10px' }}
              />
            )}
          </div>
          <div className="form-group">
            <label>Formula:</label>
            <select
              value={newPolish.formula}
              onChange={(e) => setNewPolish(prev => ({ ...prev, formula: e.target.value }))}
              required
            >
              <option value="">Select Formula</option>
              {getAllFormulas().map(formula => (
                <option key={formula} value={formula}>
                  {formula.charAt(0).toUpperCase() + formula.slice(1)}
                </option>
              ))}
              <option value="custom">+ Add Custom Formula</option>
            </select>
            {newPolish.formula === 'custom' && (
              <input
                type="text"
                placeholder="Enter custom formula name"
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    const customFormula = e.target.value.toLowerCase().trim();
                    dispatch({ type: 'ADD_CUSTOM_FORMULA', payload: customFormula });
                    setNewPolish(prev => ({ ...prev, formula: customFormula }));
                  } else {
                    setNewPolish(prev => ({ ...prev, formula: '' }));
                  }
                }}
                style={{ marginTop: '10px' }}
              />
            )}
          </div>
          <div className="form-group">
            <label>Collection (Optional):</label>
            <input
              type="text"
              value={newPolish.collection}
              onChange={(e) => setNewPolish(prev => ({ ...prev, collection: e.target.value }))}
              placeholder="e.g., Summer 2024, Holiday Collection"
            />
          </div>
          <div className="form-buttons">
            <button type="button" className="cancel-button" onClick={() => setShowAddPolish(false)}>
              Cancel
            </button>
            <button type="submit" className="save-button">
              Add Polish
            </button>
          </div>
        </form>
      )}

      {showAddTopper && (
        <form className="add-topper-form" onSubmit={handleAddTopper}>
          <h3>Add New Topper</h3>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              value={newTopper.name}
              onChange={(e) => setNewTopper(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label>Brand:</label>
            <input
              type="text"
              value={newTopper.brand}
              onChange={(e) => setNewTopper(prev => ({ ...prev, brand: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label>Type:</label>
            <select
              value={newTopper.type}
              onChange={(e) => setNewTopper(prev => ({ ...prev, type: e.target.value }))}
              required
            >
              <option value="">Select Type</option>
              {getAllTopperTypes().map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
              <option value="custom">+ Add Custom Type</option>
            </select>
            {newTopper.type === 'custom' && (
              <input
                type="text"
                placeholder="Enter custom topper type"
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    const customType = e.target.value.toLowerCase().trim();
                    dispatch({ type: 'ADD_CUSTOM_TOPPER_TYPE', payload: customType });
                    setNewTopper(prev => ({ ...prev, type: customType }));
                  } else {
                    setNewTopper(prev => ({ ...prev, type: '' }));
                  }
                }}
                style={{ marginTop: '10px' }}
              />
            )}
          </div>
          <div className="form-buttons">
            <button type="button" className="cancel-button" onClick={() => setShowAddTopper(false)}>
              Cancel
            </button>
            <button type="submit" className="save-button">
              Add Topper
            </button>
          </div>
        </form>
      )}

      <div>
        <h3>My Nail Polishes</h3>
        {nailPolishes.length === 0 ? (
          <p className="empty-message">No polishes in your collection yet. Add some above!</p>
        ) : (
          <div className="polish-list">
            {nailPolishes.map((polish, index) => (
              <div key={index} className="polish-item">
                <h4>{polish.name}</h4>
                <div className="polish-details">
                  <span className="brand">{polish.brand}</span>
                  <span className="color-tag">{polish.color}</span>
                  <span className="formula-tag">{polish.formula}</span>
                  {polish.collection && <span className="collection-tag">{polish.collection}</span>}
                </div>
                <button 
                  className="delete-button" 
                  onClick={() => handleDeletePolish(polish)}
                  style={{ marginTop: '10px' }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>My Toppers</h3>
        {toppers.length === 0 ? (
          <p className="empty-message">No toppers in your collection yet. Add some above!</p>
        ) : (
          <div className="topper-list">
            {toppers.map((topper, index) => (
              <div key={index} className="topper-item">
                <h4>{topper.name}</h4>
                <div className="topper-details">
                  <span className="brand">{topper.brand}</span>
                  <span className="formula-tag">{topper.type}</span>
                </div>
                <button 
                  className="delete-button" 
                  onClick={() => handleDeleteTopper(topper)}
                  style={{ marginTop: '10px' }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Collection;
