import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useModal } from '../context/ModalContext';

const Collection = () => {
  const { nailPolishes, toppers, finishers, getAllColors, getAllFormulas, getAllTopperTypes, getAllFinisherTypes, getAllBrands, getAllCollections, dispatch } = useData();
  const { success, confirm } = useModal();
  
  const [showAddPolish, setShowAddPolish] = useState(false);
  const [showAddTopper, setShowAddTopper] = useState(false);
  const [showAddFinisher, setShowAddFinisher] = useState(false);
  const [editingPolish, setEditingPolish] = useState(null);
  const [newPolish, setNewPolish] = useState({ name: '', brand: '', colors: [], formula: '', collection: '' });
  const [newTopper, setNewTopper] = useState({ name: '', brand: '', type: '', collection: '' });
  const [newFinisher, setNewFinisher] = useState({ name: '', brand: '', type: '', collection: '' });
  
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
    if (!newPolish.name || !newPolish.brand || newPolish.colors.length === 0 || !newPolish.formula) {
      success('Please fill in all required fields', 'Missing Information');
      return;
    }
    
    dispatch({ type: 'ADD_POLISH', payload: newPolish });
    setNewPolish({ name: '', brand: '', colors: [], formula: '', collection: '' });
    setShowAddPolish(false);
    success('Polish added successfully!');
  };

  const handleEditPolish = (polish) => {
    setEditingPolish({
      ...polish,
      originalName: polish.name,
      originalBrand: polish.brand,
      colors: Array.isArray(polish.colors) ? polish.colors : [polish.color].filter(Boolean)
    });
  };

  const handleUpdatePolish = (e) => {
    e.preventDefault();
    if (!editingPolish.name || !editingPolish.brand || editingPolish.colors.length === 0 || !editingPolish.formula) {
      success('Please fill in all required fields', 'Missing Information');
      return;
    }
    
    dispatch({ 
      type: 'UPDATE_POLISH', 
      payload: {
        originalName: editingPolish.originalName,
        originalBrand: editingPolish.originalBrand,
        updatedPolish: {
          name: editingPolish.name,
          brand: editingPolish.brand,
          colors: editingPolish.colors,
          formula: editingPolish.formula,
          collection: editingPolish.collection
        }
      }
    });
    setEditingPolish(null);
    success('Polish updated successfully!');
  };

  const cancelEdit = () => {
    setEditingPolish(null);
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

  const handleEditTopper = (topper) => {
    // For now, we'll just show a message that topper editing isn't implemented yet
    success('Topper editing feature coming soon!', 'Feature Not Available');
  };

  const handleDeleteTopper = async (topper) => {
    const confirmed = await confirm(`Are you sure you want to delete "${topper.name}" by ${topper.brand}?`);
    if (confirmed) {
      dispatch({ type: 'REMOVE_TOPPER', payload: topper });
      success('Topper deleted successfully!');
    }
  };

  const handleAddFinisher = (e) => {
    e.preventDefault();
    if (!newFinisher.name || !newFinisher.brand || !newFinisher.type) {
      success('Please fill in all fields', 'Missing Information');
      return;
    }
    
    dispatch({ type: 'ADD_FINISHER', payload: newFinisher });
    setNewFinisher({ name: '', brand: '', type: '', collection: '' });
    setShowAddFinisher(false);
    success('Finisher added successfully!');
  };

  const handleEditFinisher = (finisher) => {
    // For now, we'll just show a message that finisher editing isn't implemented yet
    success('Finisher editing feature coming soon!', 'Feature Not Available');
  };

  const handleDeleteFinisher = async (finisher) => {
    const confirmed = await confirm(`Are you sure you want to delete "${finisher.name}" by ${finisher.brand}?`);
    if (confirmed) {
      dispatch({ type: 'REMOVE_FINISHER', payload: finisher });
      success('Finisher deleted successfully!');
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
        <div className="stat-card">
          <h3>{finishers.length}</h3>
          <p>Finishers</p>
        </div>
      </div>

      <div className="collection-buttons">
        <button className="secondary-button" onClick={() => setShowAddPolish(!showAddPolish)}>
          {showAddPolish ? 'Cancel' : 'Add Polish'}
        </button>
        <button className="secondary-button" onClick={() => setShowAddTopper(!showAddTopper)}>
          {showAddTopper ? 'Cancel' : 'Add Topper'}
        </button>
        <button className="secondary-button" onClick={() => setShowAddFinisher(!showAddFinisher)}>
          {showAddFinisher ? 'Cancel' : 'Add Finisher'}
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
            <select
              value={newPolish.brand}
              onChange={(e) => setNewPolish(prev => ({ ...prev, brand: e.target.value }))}
              required
            >
              <option value="">Select Brand</option>
              {getAllBrands().map(brand => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
              <option value="custom">+ Add Custom Brand</option>
            </select>
            {newPolish.brand === 'custom' && (
              <input
                type="text"
                placeholder="Enter custom brand name"
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    const customBrand = e.target.value.trim();
                    dispatch({ type: 'ADD_CUSTOM_BRAND', payload: customBrand });
                    setNewPolish(prev => ({ ...prev, brand: customBrand }));
                  } else {
                    setNewPolish(prev => ({ ...prev, brand: '' }));
                  }
                }}
                style={{ marginTop: '10px' }}
              />
            )}
          </div>
          <div className="form-group">
            <label>Colors:</label>
            <div style={{ marginBottom: '10px' }}>
              {newPolish.colors.map((color, index) => (
                <span key={index} className="color-tag" style={{ marginRight: '5px', marginBottom: '5px', display: 'inline-block' }}>
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                  <button 
                    type="button" 
                    onClick={() => setNewPolish(prev => ({ 
                      ...prev, 
                      colors: prev.colors.filter((_, i) => i !== index) 
                    }))}
                    style={{ marginLeft: '5px', background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value && !newPolish.colors.includes(e.target.value)) {
                  setNewPolish(prev => ({ 
                    ...prev, 
                    colors: [...prev.colors, e.target.value] 
                  }));
                }
              }}
            >
              <option value="">Add Color</option>
              {getAllColors().filter(color => !newPolish.colors.includes(color)).map(color => (
                <option key={color} value={color}>
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Or type custom color and press Enter"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const customColor = e.target.value.toLowerCase().trim();
                  if (customColor && !newPolish.colors.includes(customColor)) {
                    dispatch({ type: 'ADD_CUSTOM_COLOR', payload: customColor });
                    setNewPolish(prev => ({ 
                      ...prev, 
                      colors: [...prev.colors, customColor] 
                    }));
                    e.target.value = '';
                  }
                }
              }}
              style={{ marginTop: '10px', width: '100%' }}
            />
            {newPolish.colors.length === 0 && (
              <p style={{ color: 'red', fontSize: '0.9em', marginTop: '5px' }}>
                Please add at least one color
              </p>
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
            <select
              value={newPolish.collection}
              onChange={(e) => setNewPolish(prev => ({ ...prev, collection: e.target.value }))}
            >
              <option value="">No Collection</option>
              {getAllCollections().map(collection => (
                <option key={collection} value={collection}>
                  {collection}
                </option>
              ))}
              <option value="custom">+ Add Custom Collection</option>
            </select>
            {newPolish.collection === 'custom' && (
              <input
                type="text"
                placeholder="Enter custom collection name"
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    const customCollection = e.target.value.trim();
                    dispatch({ type: 'ADD_CUSTOM_COLLECTION', payload: customCollection });
                    setNewPolish(prev => ({ ...prev, collection: customCollection }));
                  } else {
                    setNewPolish(prev => ({ ...prev, collection: '' }));
                  }
                }}
                style={{ marginTop: '10px' }}
              />
            )}
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
            <select
              value={newTopper.brand}
              onChange={(e) => setNewTopper(prev => ({ ...prev, brand: e.target.value }))}
              required
            >
              <option value="">Select Brand</option>
              {getAllBrands().map(brand => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
              <option value="custom">+ Add Custom Brand</option>
            </select>
            {newTopper.brand === 'custom' && (
              <input
                type="text"
                placeholder="Enter custom brand name"
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    const customBrand = e.target.value.trim();
                    dispatch({ type: 'ADD_CUSTOM_BRAND', payload: customBrand });
                    setNewTopper(prev => ({ ...prev, brand: customBrand }));
                  } else {
                    setNewTopper(prev => ({ ...prev, brand: '' }));
                  }
                }}
                style={{ marginTop: '10px' }}
              />
            )}
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
            <select
              value={newTopper.collection}
              onChange={(e) => setNewTopper(prev => ({ ...prev, collection: e.target.value }))}
            >
              <option value="">No Collection</option>
              {getAllCollections().map(collection => (
                <option key={collection} value={collection}>
                  {collection}
                </option>
              ))}
              <option value="custom">+ Add Custom Collection</option>
            </select>
            {newTopper.collection === 'custom' && (
              <input
                type="text"
                placeholder="Enter custom collection name"
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    const customCollection = e.target.value.trim();
                    dispatch({ type: 'ADD_CUSTOM_COLLECTION', payload: customCollection });
                    setNewTopper(prev => ({ ...prev, collection: customCollection }));
                  } else {
                    setNewTopper(prev => ({ ...prev, collection: '' }));
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

      {showAddFinisher && (
        <form className="add-finisher-form" onSubmit={handleAddFinisher}>
          <h3>Add New Finisher</h3>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              value={newFinisher.name}
              onChange={(e) => setNewFinisher(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label>Brand:</label>
            <select
              value={newFinisher.brand}
              onChange={(e) => setNewFinisher(prev => ({ ...prev, brand: e.target.value }))}
              required
            >
              <option value="">Select Brand</option>
              {getAllBrands().map(brand => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
              <option value="custom">+ Add Custom Brand</option>
            </select>
            {newFinisher.brand === 'custom' && (
              <input
                type="text"
                placeholder="Enter custom brand name"
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    const customBrand = e.target.value.trim();
                    dispatch({ type: 'ADD_CUSTOM_BRAND', payload: customBrand });
                    setNewFinisher(prev => ({ ...prev, brand: customBrand }));
                  } else {
                    setNewFinisher(prev => ({ ...prev, brand: '' }));
                  }
                }}
                style={{ marginTop: '10px' }}
              />
            )}
          </div>
          <div className="form-group">
            <label>Type:</label>
            <select
              value={newFinisher.type}
              onChange={(e) => setNewFinisher(prev => ({ ...prev, type: e.target.value }))}
              required
            >
              <option value="">Select Type</option>
              {getAllFinisherTypes().map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
              <option value="custom">+ Add Custom Type</option>
            </select>
            {newFinisher.type === 'custom' && (
              <input
                type="text"
                placeholder="Enter custom finisher type"
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    const customType = e.target.value.toLowerCase().trim();
                    dispatch({ type: 'ADD_CUSTOM_FINISHER_TYPE', payload: customType });
                    setNewFinisher(prev => ({ ...prev, type: customType }));
                  } else {
                    setNewFinisher(prev => ({ ...prev, type: '' }));
                  }
                }}
                style={{ marginTop: '10px' }}
              />
            )}
          </div>
          <div className="form-group">
            <label>Collection (Optional):</label>
            <select
              value={newFinisher.collection}
              onChange={(e) => setNewFinisher(prev => ({ ...prev, collection: e.target.value }))}
            >
              <option value="">No Collection</option>
              {getAllCollections().map(collection => (
                <option key={collection} value={collection}>
                  {collection}
                </option>
              ))}
              <option value="custom">+ Add Custom Collection</option>
            </select>
            {newFinisher.collection === 'custom' && (
              <input
                type="text"
                placeholder="Enter custom collection name"
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    const customCollection = e.target.value.trim();
                    dispatch({ type: 'ADD_CUSTOM_COLLECTION', payload: customCollection });
                    setNewFinisher(prev => ({ ...prev, collection: customCollection }));
                  } else {
                    setNewFinisher(prev => ({ ...prev, collection: '' }));
                  }
                }}
                style={{ marginTop: '10px' }}
              />
            )}
          </div>
          <div className="form-buttons">
            <button type="button" className="cancel-button" onClick={() => setShowAddFinisher(false)}>
              Cancel
            </button>
            <button type="submit" className="save-button">
              Add Finisher
            </button>
          </div>
        </form>
      )}

      {editingPolish && (
        <form className="edit-polish-form" onSubmit={handleUpdatePolish}>
          <h3>Edit Polish</h3>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              value={editingPolish.name}
              onChange={(e) => setEditingPolish(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label>Brand:</label>
            <select
              value={editingPolish.brand}
              onChange={(e) => setEditingPolish(prev => ({ ...prev, brand: e.target.value }))}
              required
            >
              <option value="">Select Brand</option>
              {getAllBrands().map(brand => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
              <option value="custom">+ Add Custom Brand</option>
            </select>
            {editingPolish.brand === 'custom' && (
              <input
                type="text"
                placeholder="Enter custom brand name"
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    const customBrand = e.target.value.trim();
                    dispatch({ type: 'ADD_CUSTOM_BRAND', payload: customBrand });
                    setEditingPolish(prev => ({ ...prev, brand: customBrand }));
                  } else {
                    setEditingPolish(prev => ({ ...prev, brand: '' }));
                  }
                }}
                style={{ marginTop: '10px' }}
              />
            )}
          </div>
          <div className="form-group">
            <label>Colors:</label>
            <div style={{ marginBottom: '10px' }}>
              {editingPolish.colors.map((color, index) => (
                <span key={index} className="color-tag" style={{ marginRight: '5px', marginBottom: '5px', display: 'inline-block' }}>
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                  <button 
                    type="button" 
                    onClick={() => setEditingPolish(prev => ({ 
                      ...prev, 
                      colors: prev.colors.filter((_, i) => i !== index) 
                    }))}
                    style={{ marginLeft: '5px', background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value && !editingPolish.colors.includes(e.target.value)) {
                  setEditingPolish(prev => ({ 
                    ...prev, 
                    colors: [...prev.colors, e.target.value] 
                  }));
                }
              }}
            >
              <option value="">Add Color</option>
              {getAllColors().filter(color => !editingPolish.colors.includes(color)).map(color => (
                <option key={color} value={color}>
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Or type custom color and press Enter"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const customColor = e.target.value.toLowerCase().trim();
                  if (customColor && !editingPolish.colors.includes(customColor)) {
                    dispatch({ type: 'ADD_CUSTOM_COLOR', payload: customColor });
                    setEditingPolish(prev => ({ 
                      ...prev, 
                      colors: [...prev.colors, customColor] 
                    }));
                    e.target.value = '';
                  }
                }
              }}
              style={{ marginTop: '10px', width: '100%' }}
            />
            {editingPolish.colors.length === 0 && (
              <p style={{ color: 'red', fontSize: '0.9em', marginTop: '5px' }}>
                Please add at least one color
              </p>
            )}
          </div>
          <div className="form-group">
            <label>Formula:</label>
            <select
              value={editingPolish.formula}
              onChange={(e) => setEditingPolish(prev => ({ ...prev, formula: e.target.value }))}
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
            {editingPolish.formula === 'custom' && (
              <input
                type="text"
                placeholder="Enter custom formula name"
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    const customFormula = e.target.value.toLowerCase().trim();
                    dispatch({ type: 'ADD_CUSTOM_FORMULA', payload: customFormula });
                    setEditingPolish(prev => ({ ...prev, formula: customFormula }));
                  } else {
                    setEditingPolish(prev => ({ ...prev, formula: '' }));
                  }
                }}
                style={{ marginTop: '10px' }}
              />
            )}
          </div>
          <div className="form-group">
            <label>Collection (Optional):</label>
            <select
              value={editingPolish.collection}
              onChange={(e) => setEditingPolish(prev => ({ ...prev, collection: e.target.value }))}
            >
              <option value="">No Collection</option>
              {getAllCollections().map(collection => (
                <option key={collection} value={collection}>
                  {collection}
                </option>
              ))}
              <option value="custom">+ Add Custom Collection</option>
            </select>
            {editingPolish.collection === 'custom' && (
              <input
                type="text"
                placeholder="Enter custom collection name"
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    const customCollection = e.target.value.trim();
                    dispatch({ type: 'ADD_CUSTOM_COLLECTION', payload: customCollection });
                    setEditingPolish(prev => ({ ...prev, collection: customCollection }));
                  } else {
                    setEditingPolish(prev => ({ ...prev, collection: '' }));
                  }
                }}
                style={{ marginTop: '10px' }}
              />
            )}
          </div>
          <div className="form-buttons">
            <button type="button" className="cancel-button" onClick={cancelEdit}>
              Cancel
            </button>
            <button type="submit" className="save-button">
              Update Polish
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button 
                            className="edit-button-circular" 
                            onClick={() => handleEditPolish(polish)}
                            title="Edit polish"
                          >
                            ✏️
                          </button>
                          <button 
                            className="delete-button-inline" 
                            onClick={() => handleDeletePolish(polish)}
                            title="Delete polish"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      <div className="polish-details">
                        <span className="brand">{polish.brand}</span>
                        {/* Display multiple colors or single color */}
                        {Array.isArray(polish.colors) ? (
                          polish.colors.map((color, colorIndex) => (
                            <span key={colorIndex} className="color-tag" style={{ marginRight: '3px' }}>
                              {color.charAt(0).toUpperCase() + color.slice(1)}
                            </span>
                          ))
                        ) : (
                          <span className="color-tag">{polish.color}</span>
                        )}
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button 
                          className="edit-button-circular" 
                          onClick={() => handleEditTopper(topper)}
                          title="Edit topper"
                        >
                          ✏️
                        </button>
                        <button 
                          className="delete-button-inline" 
                          onClick={() => handleDeleteTopper(topper)}
                          title="Delete topper"
                        >
                          ×
                        </button>
                      </div>
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

      <div style={{ marginTop: '30px' }}>
        <h3>My Finishers</h3>
        {finishers.length === 0 ? (
          <p className="empty-message">No finishers in your collection yet. Add some above!</p>
        ) : (
          <div className="collection-content">
            <div className="finisher-list">
              {finishers.map((finisher, index) => (
                <div key={index} className="finisher-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4>{finisher.name}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button 
                        className="edit-button-circular" 
                        onClick={() => handleEditFinisher(finisher)}
                        title="Edit finisher"
                      >
                        ✏️
                      </button>
                      <button 
                        className="delete-button-inline" 
                        onClick={() => handleDeleteFinisher(finisher)}
                        title="Delete finisher"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <div className="finisher-details">
                    <span className="brand">{finisher.brand}</span>
                    <span className="formula-tag">{finisher.type}</span>
                    {finisher.collection && <span className="collection-tag">{finisher.collection}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Collection;
