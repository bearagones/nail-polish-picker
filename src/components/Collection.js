import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useModal } from '../context/ModalContext';

const Collection = () => {
  const { nailPolishes, toppers, getAllColors, getAllFormulas, getAllTopperTypes, dispatch } = useData();
  const { success, confirm } = useModal();
  
  const [showAddPolish, setShowAddPolish] = useState(false);
  const [showAddTopper, setShowAddTopper] = useState(false);
  const [newPolish, setNewPolish] = useState({ name: '', brand: '', color: '', formula: '', collection: '' });
  const [newTopper, setNewTopper] = useState({ name: '', brand: '', type: '', collection: '' });
  
  // Sort and search states
  const [polishSortBy, setPolishSortBy] = useState('date-newest');
  const [topperSortBy, setTopperSortBy] = useState('date-newest');
  const [polishSearchTerm, setPolishSearchTerm] = useState('');
  const [topperSearchTerm, setTopperSearchTerm] = useState('');

  // Color order for sorting
  const colorOrder = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'nude', 'black', 'brown', 'grey', 'white'];

  // Sorting function
  const sortItems = (items, sortBy) => {
    const sorted = [...items];
    
    switch (sortBy) {
      case 'date-newest':
        return sorted.reverse(); // Newest first (reverse of addition order)
      case 'date-oldest':
        return sorted; // Oldest first (original addition order)
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'brand':
        return sorted.sort((a, b) => a.brand.localeCompare(b.brand));
      case 'color':
        return sorted.sort((a, b) => {
          const aIndex = colorOrder.indexOf(a.color?.toLowerCase()) ?? 999;
          const bIndex = colorOrder.indexOf(b.color?.toLowerCase()) ?? 999;
          return aIndex - bIndex;
        });
      case 'collection':
        return sorted.sort((a, b) => {
          const aCollection = a.collection || 'zzz'; // Put items without collection at end
          const bCollection = b.collection || 'zzz';
          return aCollection.localeCompare(bCollection);
        });
      default:
        return sorted;
    }
  };

  // Filter function
  const filterItems = (items, searchTerm) => {
    if (!searchTerm) return items;
    
    const term = searchTerm.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(term) ||
      item.brand.toLowerCase().includes(term) ||
      item.color?.toLowerCase().includes(term) ||
      item.formula?.toLowerCase().includes(term) ||
      item.type?.toLowerCase().includes(term) ||
      item.collection?.toLowerCase().includes(term)
    );
  };

  // Memoized sorted and filtered lists
  const sortedAndFilteredPolishes = useMemo(() => {
    const filtered = filterItems(nailPolishes, polishSearchTerm);
    return sortItems(filtered, polishSortBy);
  }, [nailPolishes, polishSortBy, polishSearchTerm]);

  const sortedAndFilteredToppers = useMemo(() => {
    const filtered = filterItems(toppers, topperSearchTerm);
    return sortItems(filtered, topperSortBy);
  }, [toppers, topperSortBy, topperSearchTerm]);

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
    setNewTopper({ name: '', brand: '', type: '', collection: '' });
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
          <div className="form-group">
            <label>Collection (Optional):</label>
            <input
              type="text"
              value={newTopper.collection}
              onChange={(e) => setNewTopper(prev => ({ ...prev, collection: e.target.value }))}
              placeholder="e.g., Summer 2024, Holiday Collection"
            />
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
          <>
            <div className="collection-controls">
              <div className="search-sort-row">
                <input
                  type="text"
                  placeholder="Search polishes..."
                  value={polishSearchTerm}
                  onChange={(e) => setPolishSearchTerm(e.target.value)}
                  className="search-input"
                />
                <select
                  value={polishSortBy}
                  onChange={(e) => setPolishSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="date-newest">Newest First</option>
                  <option value="date-oldest">Oldest First</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="brand">Brand (A-Z)</option>
                  <option value="color">Color</option>
                  <option value="collection">Collection (A-Z)</option>
                </select>
              </div>
            </div>
            <div className="collection-content">
                <div className="polish-list">
                  {sortedAndFilteredPolishes.map((polish, index) => (
                    <div key={index} className="polish-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4>{polish.name}</h4>
                        <button 
                          className="delete-button-inline" 
                          onClick={() => handleDeletePolish(polish)}
                          title="Delete polish"
                        >
                          ×
                        </button>
                      </div>
                      <div className="polish-details">
                        <span className="brand">{polish.brand}</span>
                        <span className="color-tag">{polish.color}</span>
                        <span className="formula-tag">{polish.formula}</span>
                        {polish.collection && <span className="collection-tag">{polish.collection}</span>}
                      </div>
                    </div>
                  ))}
                </div>
            </div>
          </>
        )}
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>My Toppers</h3>
        {toppers.length === 0 ? (
          <p className="empty-message">No toppers in your collection yet. Add some above!</p>
        ) : (
          <>
            <div className="collection-controls">
              <div className="search-sort-row">
                <input
                  type="text"
                  placeholder="Search toppers..."
                  value={topperSearchTerm}
                  onChange={(e) => setTopperSearchTerm(e.target.value)}
                  className="search-input"
                />
                <select
                  value={topperSortBy}
                  onChange={(e) => setTopperSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="date-newest">Newest First</option>
                  <option value="date-oldest">Oldest First</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="brand">Brand (A-Z)</option>
                  <option value="collection">Collection (A-Z)</option>
                </select>
              </div>
            </div>
            <div className="collection-content">
              <div className="topper-list">
                {sortedAndFilteredToppers.map((topper, index) => (
                  <div key={index} className="topper-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4>{topper.name}</h4>
                      <button 
                        className="delete-button-inline" 
                        onClick={() => handleDeleteTopper(topper)}
                        title="Delete topper"
                      >
                        ×
                      </button>
                    </div>
                    <div className="topper-details">
                      <span className="brand">{topper.brand}</span>
                      <span className="formula-tag">{topper.type}</span>
                      {topper.collection && <span className="collection-tag">{topper.collection}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Collection;
