import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';

const Combinations = () => {
  const { usedCombinations, comboPhotos, nailPolishes, toppers, finishers, dispatch } = useData();
  const { confirm, success } = useModal();
  const { isAuthenticated } = useAuth();
  const [uploadingPhoto, setUploadingPhoto] = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);
  const [expandedVideo, setExpandedVideo] = useState(null);
  const [pendingPhotos, setPendingPhotos] = useState({}); // Store pending photos before save
  const [pendingVideos, setPendingVideos] = useState({}); // Store pending videos before save
  const [savingPhoto, setSavingPhoto] = useState(null);
  const [savingVideo, setSavingVideo] = useState(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [showWithPhotos, setShowWithPhotos] = useState(false);
  const [showWithVideos, setShowWithVideos] = useState(false);
  
  // Add combination form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCombination, setNewCombination] = useState({
    polishId: '',
    topperId: '',
    finisherId: '',
    date: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
  });
  
  // Search states for form inputs
  const [polishSearch, setPolishSearch] = useState('');
  const [topperSearch, setTopperSearch] = useState('');
  const [finisherSearch, setFinisherSearch] = useState('');
  const [showPolishSuggestions, setShowPolishSuggestions] = useState(false);
  const [showTopperSuggestions, setShowTopperSuggestions] = useState(false);
  const [showFinisherSuggestions, setShowFinisherSuggestions] = useState(false);

  const handleDeleteCombination = async (id) => {
    const confirmed = await confirm('Are you sure you want to delete this combination?');
    if (confirmed) {
      dispatch({ type: 'REMOVE_COMBINATION', payload: id });
      success('Combination deleted successfully!');
    }
  };

  const handlePhotoUpload = async (e, comboId) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        success('Image size must be less than 5MB. Please choose a smaller image.', 'File Too Large');
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const photoData = e.target.result;
        
        try {
          if (isAuthenticated) {
            // For authenticated users, save directly to Firebase
            await dispatch({ 
              type: 'UPDATE_COMBINATION', 
              payload: { 
                id: comboId, 
                updates: {
                  photoFile: file, // Include actual file for Firebase Storage
                  photo: photoData // Include preview for immediate display
                }
              } 
            });
          } else {
            // For non-authenticated users, save to local storage immediately
            dispatch({ 
              type: 'SAVE_COMBO_PHOTO', 
              payload: { 
                key: comboId.toString(), 
                photo: photoData 
              } 
            });
          }
        } catch (error) {
          console.error('Error uploading photo:', error);
          success('Error uploading photo. Please try again.', 'Error');
        }
        
        setUploadingPhoto(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = async (comboId) => {
    const pendingPhoto = pendingPhotos[comboId];
    if (!pendingPhoto) return;

    setSavingPhoto(comboId);
    
    try {
      const existingCombo = usedCombinations.find(combo => combo.id === comboId);
      if (existingCombo) {
        console.log('Combinations: Saving photo for combination:', {
          comboId,
          hasPhotoFile: !!pendingPhoto.file,
          fileName: pendingPhoto.file?.name,
          fileSize: pendingPhoto.file?.size
        });
        
        // Use UPDATE_COMBINATION to trigger Firebase sync with photo upload
        await dispatch({ 
          type: 'UPDATE_COMBINATION', 
          payload: { 
            id: comboId, 
            updates: {
              photoFile: pendingPhoto.file, // Include actual file for Firebase Storage
              photo: pendingPhoto.preview // Include preview for immediate display
            }
          } 
        });

        // Remove from pending photos
        setPendingPhotos(prev => {
          const newPending = { ...prev };
          delete newPending[comboId];
          return newPending;
        });

        success('Photo saved successfully!');
      }
    } catch (error) {
      console.error('Error saving photo:', error);
      success('Error saving photo. Please try again.', 'Error');
    } finally {
      setSavingPhoto(null);
    }
  };


  const handleCancelPhoto = (comboId) => {
    setPendingPhotos(prev => {
      const newPending = { ...prev };
      delete newPending[comboId];
      return newPending;
    });
    success('Photo upload cancelled.');
  };

  const handleImageClick = (comboId) => {
    setExpandedImage(expandedImage === comboId ? null : comboId);
  };

  const handleVideoClick = (comboId) => {
    setExpandedVideo(expandedVideo === comboId ? null : comboId);
  };

  const handleVideoUpload = async (e, comboId) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 5MB for videos)
      if (file.size > 5 * 1024 * 1024) {
        success('Video size must be less than 5MB. Please choose a smaller video.', 'File Too Large');
        return;
      }

      // Create a preview URL for the video
      const videoURL = URL.createObjectURL(file);
      
      try {
        if (isAuthenticated) {
          // For authenticated users, save directly to Firebase
          await dispatch({ 
            type: 'UPDATE_COMBINATION', 
            payload: { 
              id: comboId, 
              updates: {
                videoFile: file, // Include actual file for Firebase Storage
                video: videoURL // Include preview for immediate display
              }
            } 
          });
        } else {
          // For non-authenticated users, save to local storage immediately
          dispatch({ 
            type: 'UPDATE_COMBINATION', 
            payload: { 
              id: comboId, 
              updates: {
                video: videoURL,
                videoFile: file
              }
            } 
          });
        }
      } catch (error) {
        console.error('Error uploading video:', error);
        success('Error uploading video. Please try again.', 'Error');
        // Clean up the object URL on error
        URL.revokeObjectURL(videoURL);
      }
      
      setUploadingVideo(null);
    }
  };

  const handleSaveVideo = async (comboId) => {
    const pendingVideo = pendingVideos[comboId];
    if (!pendingVideo) return;

    setSavingVideo(comboId);
    
    try {
      const existingCombo = usedCombinations.find(combo => combo.id === comboId);
      if (existingCombo) {
        console.log('Combinations: Saving video for combination:', {
          comboId,
          hasVideoFile: !!pendingVideo.file,
          fileName: pendingVideo.file?.name,
          fileSize: pendingVideo.file?.size
        });
        
        // Use UPDATE_COMBINATION to trigger Firebase sync with video upload
        await dispatch({ 
          type: 'UPDATE_COMBINATION', 
          payload: { 
            id: comboId, 
            updates: {
              videoFile: pendingVideo.file, // Include actual file for Firebase Storage
              video: pendingVideo.preview // Include preview for immediate display
            }
          } 
        });

        // Remove from pending videos
        setPendingVideos(prev => {
          const newPending = { ...prev };
          delete newPending[comboId];
          return newPending;
        });

        success('Video saved successfully!');
      }
    } catch (error) {
      console.error('Error saving video:', error);
      success('Error saving video. Please try again.', 'Error');
    } finally {
      setSavingVideo(null);
    }
  };

  const handleCancelVideo = (comboId) => {
    // Clean up the object URL to prevent memory leaks
    const pendingVideo = pendingVideos[comboId];
    if (pendingVideo?.preview) {
      URL.revokeObjectURL(pendingVideo.preview);
    }
    
    setPendingVideos(prev => {
      const newPending = { ...prev };
      delete newPending[comboId];
      return newPending;
    });
    success('Video upload cancelled.');
  };

  const handleDeletePhoto = async (comboId) => {
    try {
      // For authenticated users, update the combination to remove photo
      if (isAuthenticated) {
        await dispatch({ 
          type: 'UPDATE_COMBINATION', 
          payload: { 
            id: comboId, 
            updates: {
              photo: null,
              photoURL: null,
              photoFile: null
            }
          } 
        });
      } else {
        // For non-authenticated users, remove from local storage
        dispatch({ 
          type: 'REMOVE_COMBO_PHOTO', 
          payload: comboId.toString() 
        });
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      success('Error deleting photo. Please try again.', 'Error');
    }
  };

  const handleDeleteVideo = async (comboId) => {
    try {
      // For authenticated users, update the combination to remove video
      if (isAuthenticated) {
        await dispatch({ 
          type: 'UPDATE_COMBINATION', 
          payload: { 
            id: comboId, 
            updates: {
              video: null,
              videoURL: null,
              videoFile: null
            }
          } 
        });
      } else {
        // For non-authenticated users, update local state
        dispatch({ 
          type: 'UPDATE_COMBINATION', 
          payload: { 
            id: comboId, 
            updates: {
              video: null,
              videoURL: null,
              videoFile: null
            }
          } 
        });
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      success('Error deleting video. Please try again.', 'Error');
    }
  };

  // Filter to only show combinations that are marked as used
  const usedCombinationsOnly = usedCombinations.filter(combo => combo.used === true);

  // Filter combinations based on search query and checkboxes
  const filteredCombinations = usedCombinationsOnly.filter(combo => {
    // Text search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const searchableText = [
        // Polish details
        combo.polish.name.toLowerCase(),
        combo.polish.brand.toLowerCase(),
        combo.polish.formula.toLowerCase(),
        // Handle both single color and multiple colors
        ...(Array.isArray(combo.polish.colors) 
          ? combo.polish.colors.map(color => color.toLowerCase())
          : [combo.polish.color?.toLowerCase() || '']),
        // Topper details (if exists)
        ...(combo.topper ? [
          combo.topper.name.toLowerCase(),
          combo.topper.brand.toLowerCase(),
          combo.topper.type.toLowerCase()
        ] : []),
        // Finisher details (if exists)
        ...(combo.finisher ? [
          combo.finisher.name.toLowerCase(),
          combo.finisher.brand.toLowerCase(),
          combo.finisher.type.toLowerCase()
        ] : [])
      ].join(' ');
      
      if (!searchableText.includes(query)) {
        return false;
      }
    }
    
    // Photo filter
    if (showWithPhotos) {
      const hasPhoto = !!(combo.photo || combo.photoURL || comboPhotos[combo.id]);
      if (!hasPhoto) {
        return false;
      }
    }
    
    // Video filter
    if (showWithVideos) {
      const hasVideo = !!(combo.video || combo.videoURL);
      if (!hasVideo) {
        return false;
      }
    }
    
    return true;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setShowWithPhotos(false);
    setShowWithVideos(false);
  };

  // Add combination form handlers
  const handleAddCombination = () => {
    if (nailPolishes.length === 0) {
      success('Please add some nail polishes to your collection first!', 'No Polishes Available');
      return;
    }
    if (finishers.length === 0) {
      success('Please add some finishers to your collection first!', 'No Finishers Available');
      return;
    }
    setShowAddForm(true);
  };

  const handleCancelAddCombination = () => {
    setShowAddForm(false);
    setNewCombination({
      polishId: '',
      topperId: '',
      finisherId: '',
      date: new Date().toISOString().split('T')[0]
    });
    // Reset search fields
    setPolishSearch('');
    setTopperSearch('');
    setFinisherSearch('');
    setShowPolishSuggestions(false);
    setShowTopperSuggestions(false);
    setShowFinisherSuggestions(false);
  };

  const handleSaveNewCombination = async () => {
    // Validate required fields
    if (!newCombination.polishId) {
      success('Please select a nail polish.', 'Missing Information');
      return;
    }
    if (!newCombination.finisherId) {
      success('Please select a finisher.', 'Missing Information');
      return;
    }
    if (!newCombination.date) {
      success('Please select a date.', 'Missing Information');
      return;
    }

    // Find the selected items
    const selectedPolish = nailPolishes.find(p => `${p.name}-${p.brand}` === newCombination.polishId);
    const selectedTopper = newCombination.topperId ? toppers.find(t => `${t.name}-${t.brand}` === newCombination.topperId) : null;
    const selectedFinisher = finishers.find(f => `${f.name}-${f.brand}` === newCombination.finisherId);

    if (!selectedPolish || !selectedFinisher) {
      success('Error finding selected items. Please try again.', 'Error');
      return;
    }

    // Create the combination object
    const combination = {
      id: Date.now(),
      polish: selectedPolish,
      topper: selectedTopper,
      finisher: selectedFinisher,
      date: new Date(newCombination.date).toISOString(),
      used: true // Mark as used since it's manually added
    };

    try {
      // Add the combination
      await dispatch({ type: 'ADD_COMBINATION', payload: combination });
      success('Combination added successfully!');
      
      // Reset form and close
      handleCancelAddCombination();
    } catch (error) {
      console.error('Error adding combination:', error);
      success('Error adding combination. Please try again.', 'Error');
    }
  };

  const handleFormChange = (field, value) => {
    setNewCombination(prev => ({ ...prev, [field]: value }));
  };

  // Helper functions for searchable inputs
  const getFilteredPolishes = () => {
    if (!polishSearch.trim()) return nailPolishes;
    const query = polishSearch.toLowerCase();
    return nailPolishes.filter(polish => 
      `${polish.brand}: ${polish.name}`.toLowerCase().includes(query) ||
      polish.brand.toLowerCase().includes(query) ||
      polish.name.toLowerCase().includes(query)
    );
  };

  const getFilteredToppers = () => {
    if (!topperSearch.trim()) return toppers;
    const query = topperSearch.toLowerCase();
    return toppers.filter(topper => 
      `${topper.brand}: ${topper.name}`.toLowerCase().includes(query) ||
      topper.brand.toLowerCase().includes(query) ||
      topper.name.toLowerCase().includes(query)
    );
  };

  const getFilteredFinishers = () => {
    if (!finisherSearch.trim()) return finishers;
    const query = finisherSearch.toLowerCase();
    return finishers.filter(finisher => 
      `${finisher.brand}: ${finisher.name}`.toLowerCase().includes(query) ||
      finisher.brand.toLowerCase().includes(query) ||
      finisher.name.toLowerCase().includes(query)
    );
  };

  const handlePolishSelect = (polish) => {
    setNewCombination(prev => ({ ...prev, polishId: `${polish.name}-${polish.brand}` }));
    setPolishSearch(`${polish.brand}: ${polish.name}`);
    setShowPolishSuggestions(false);
  };

  const handleTopperSelect = (topper) => {
    setNewCombination(prev => ({ ...prev, topperId: `${topper.name}-${topper.brand}` }));
    setTopperSearch(`${topper.brand}: ${topper.name}`);
    setShowTopperSuggestions(false);
  };

  const handleFinisherSelect = (finisher) => {
    setNewCombination(prev => ({ ...prev, finisherId: `${finisher.name}-${finisher.brand}` }));
    setFinisherSearch(`${finisher.brand}: ${finisher.name}`);
    setShowFinisherSuggestions(false);
  };

  const handlePolishSearchChange = (value) => {
    setPolishSearch(value);
    setShowPolishSuggestions(value.trim().length > 0);
    
    // Clear selection if search doesn't match exactly
    const exactMatch = nailPolishes.find(p => `${p.brand}: ${p.name}` === value);
    if (!exactMatch) {
      setNewCombination(prev => ({ ...prev, polishId: '' }));
    }
  };

  const handleTopperSearchChange = (value) => {
    setTopperSearch(value);
    setShowTopperSuggestions(value.trim().length > 0);
    
    // Clear selection if search doesn't match exactly
    const exactMatch = toppers.find(t => `${t.brand}: ${t.name}` === value);
    if (!exactMatch && value.trim() !== '') {
      setNewCombination(prev => ({ ...prev, topperId: '' }));
    } else if (value.trim() === '') {
      setNewCombination(prev => ({ ...prev, topperId: '' }));
    }
  };

  const handleFinisherSearchChange = (value) => {
    setFinisherSearch(value);
    setShowFinisherSuggestions(value.trim().length > 0);
    
    // Clear selection if search doesn't match exactly
    const exactMatch = finishers.find(f => `${f.brand}: ${f.name}` === value);
    if (!exactMatch) {
      setNewCombination(prev => ({ ...prev, finisherId: '' }));
    }
  };

  return (
    <div>
      <div className="combinations-header">
        <h2>Recent Combinations</h2>
        <button 
          className="add-combination-button"
          onClick={handleAddCombination}
          title="Add a combination you've used"
        >
          ➕ Add Combination
        </button>
      </div>
      
      {/* Add Combination Form */}
      {showAddForm && (
        <div className="add-combination-form">
          <h3>Add New Combination</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="polish-search">Nail Polish *</label>
              <div className="searchable-input-container">
                <input
                  id="polish-search"
                  type="text"
                  value={polishSearch}
                  onChange={(e) => handlePolishSearchChange(e.target.value)}
                  onFocus={() => setShowPolishSuggestions(polishSearch.trim().length > 0)}
                  onBlur={() => setTimeout(() => setShowPolishSuggestions(false), 200)}
                  placeholder="Type to search... (e.g., OPI: Big Apple Red)"
                  required
                />
                {showPolishSuggestions && getFilteredPolishes().length > 0 && (
                  <div className="suggestions-dropdown">
                    {getFilteredPolishes()
                      .sort((a, b) => `${a.brand}: ${a.name}`.localeCompare(`${b.brand}: ${b.name}`))
                      .slice(0, 10)
                      .map((polish) => (
                        <div
                          key={`${polish.name}-${polish.brand}`}
                          className="suggestion-item"
                          onClick={() => handlePolishSelect(polish)}
                        >
                          <strong>{polish.brand}:</strong> {polish.name}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="topper-search">Topper (Optional)</label>
              <div className="searchable-input-container">
                <input
                  id="topper-search"
                  type="text"
                  value={topperSearch}
                  onChange={(e) => handleTopperSearchChange(e.target.value)}
                  onFocus={() => setShowTopperSuggestions(topperSearch.trim().length > 0)}
                  onBlur={() => setTimeout(() => setShowTopperSuggestions(false), 200)}
                  placeholder="Type to search... (e.g., Essie: Set in Stones) or leave empty"
                />
                {showTopperSuggestions && getFilteredToppers().length > 0 && (
                  <div className="suggestions-dropdown">
                    {getFilteredToppers()
                      .sort((a, b) => `${a.brand}: ${a.name}`.localeCompare(`${b.brand}: ${b.name}`))
                      .slice(0, 10)
                      .map((topper) => (
                        <div
                          key={`${topper.name}-${topper.brand}`}
                          className="suggestion-item"
                          onClick={() => handleTopperSelect(topper)}
                        >
                          <strong>{topper.brand}:</strong> {topper.name}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="finisher-search">Finisher *</label>
              <div className="searchable-input-container">
                <input
                  id="finisher-search"
                  type="text"
                  value={finisherSearch}
                  onChange={(e) => handleFinisherSearchChange(e.target.value)}
                  onFocus={() => setShowFinisherSuggestions(finisherSearch.trim().length > 0)}
                  onBlur={() => setTimeout(() => setShowFinisherSuggestions(false), 200)}
                  placeholder="Type to search... (e.g., Seche Vite: Dry Fast Top Coat)"
                  required
                />
                {showFinisherSuggestions && getFilteredFinishers().length > 0 && (
                  <div className="suggestions-dropdown">
                    {getFilteredFinishers()
                      .sort((a, b) => `${a.brand}: ${a.name}`.localeCompare(`${b.brand}: ${b.name}`))
                      .slice(0, 10)
                      .map((finisher) => (
                        <div
                          key={`${finisher.name}-${finisher.brand}`}
                          className="suggestion-item"
                          onClick={() => handleFinisherSelect(finisher)}
                        >
                          <strong>{finisher.brand}:</strong> {finisher.name}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="date-input">Date Used *</label>
              <input
                id="date-input"
                type="date"
                value={newCombination.date}
                onChange={(e) => handleFormChange('date', e.target.value)}
                max={new Date().toISOString().split('T')[0]} // Can't select future dates
                required
              />
            </div>
          </div>

          <div className="form-buttons">
            <button 
              className="cancel-button"
              onClick={handleCancelAddCombination}
            >
              Cancel
            </button>
            <button 
              className="save-button"
              onClick={handleSaveNewCombination}
            >
              Add Combination
            </button>
          </div>
        </div>
      )}
      
      {usedCombinationsOnly.length === 0 && !showAddForm ? (
        <div className="empty-state">
          <p className="empty-message">
            No used combinations yet! Use the Polish Picker and check "I used this combination" to save combinations here, or add one manually using the button above.
          </p>
        </div>
      ) : !showAddForm && (
        <div className="tab-content-scrollable">
          {/* Search and Filter Section */}
          <div className="combinations-search-section">
            <div className="search-bar-container">
              <input
                type="text"
                placeholder="Search by polish name, brand, formula, color, topper, or finisher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="combinations-search-input"
              />
              {searchQuery && (
                <button 
                  className="clear-search-button"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            
            <div className="filter-checkboxes">
              <label className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={showWithPhotos}
                  onChange={(e) => setShowWithPhotos(e.target.checked)}
                />
                <span className="checkbox-text">📷 With Photos</span>
              </label>
              
              <label className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={showWithVideos}
                  onChange={(e) => setShowWithVideos(e.target.checked)}
                />
                <span className="checkbox-text">🎥 With Videos</span>
              </label>
              
              {(searchQuery || showWithPhotos || showWithVideos) && (
                <button 
                  className="clear-filters-button"
                  onClick={clearFilters}
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>

          {/* Results Summary */}
          <div className="results-summary">
            {(searchQuery || showWithPhotos || showWithVideos) ? (
              <p style={{ marginBottom: '20px', color: '#6c757d' }}>
                Showing {filteredCombinations.length} of {usedCombinationsOnly.length} combination{usedCombinationsOnly.length !== 1 ? 's' : ''}
                {searchQuery && <span> matching "{searchQuery}"</span>}
                {showWithPhotos && <span> with photos</span>}
                {showWithVideos && <span> with videos</span>}
              </p>
            ) : (
              <p style={{ marginBottom: '20px', color: '#6c757d' }}>
                You have {usedCombinationsOnly.length} used combination{usedCombinationsOnly.length !== 1 ? 's' : ''}.
              </p>
            )}
          </div>

          {/* No Results Message */}
          {filteredCombinations.length === 0 ? (
            <div className="no-results-message">
              <p>No combinations match your search criteria.</p>
              <button 
                className="clear-filters-button"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            /* Combinations List */
            filteredCombinations
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((combo) => (
              <div key={combo.id} className="combination-card">
                <div className="combination-header">
                  <div className="combination-title-section">
                    <h3 className="combination-polish">{combo.polish.name}</h3>
                    <span className="combination-date">{formatDate(combo.date)}</span>
                  </div>
                  <button 
                    className="delete-button-inline" 
                    onClick={() => handleDeleteCombination(combo.id)}
                    title="Delete combination"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="combination-content">
                  <div className="polish-section">
                    <div className="polish-details">
                      <span className="brand">{combo.polish.brand}</span>
                      {/* Display multiple colors or single color */}
                      {Array.isArray(combo.polish.colors) ? (
                        combo.polish.colors.map((color, colorIndex) => (
                          <span key={colorIndex} className="color-tag" style={{ marginRight: '3px' }}>
                            {color.charAt(0).toUpperCase() + color.slice(1)}
                          </span>
                        ))
                      ) : (
                        <span className="color-tag">{combo.polish.color}</span>
                      )}
                      <span className="formula-tag">{combo.polish.formula}</span>
                    </div>
                  </div>
                  
                  {combo.topper && (
                    <div className="topper-section">
                      <div className="topper-label">+ Topper:</div>
                      <div className="topper-info">
                        <strong>{combo.topper.name}</strong> by {combo.topper.brand}
                        <span className="formula-tag topper-type">
                          {combo.topper.type}
                        </span>
                      </div>
                    </div>
                  )}

                  {combo.finisher && (
                    <div className="finisher-section">
                      <div className="finisher-label">+ Finisher:</div>
                      <div className="finisher-info">
                        <strong>{combo.finisher.name}</strong> by {combo.finisher.brand}
                        <span className="formula-tag finisher-type">
                          {combo.finisher.type}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="combination-media">
                  {/* Media Display Section */}
                  <div className="media-display-row">
                    {/* Photo Display */}
                    {(combo.photo || combo.photoURL || comboPhotos[combo.id]) && (
                      <div className="photo-display">
                        <div className="photo-thumbnail-container">
                          <img 
                            src={combo.photo || combo.photoURL || comboPhotos[combo.id]} 
                            alt="Combination photo" 
                            className="photo-thumbnail-small"
                            onClick={() => handleImageClick(combo.id)}
                            title="Click to expand"
                          />
                          <button 
                            className="delete-photo-button"
                            onClick={() => handleDeletePhoto(combo.id)}
                            title="Delete photo"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Video Display */}
                    {(combo.video || combo.videoURL) && (
                      <div className="video-display">
                        <div className="video-thumbnail-container">
                          <video 
                            src={combo.video || combo.videoURL} 
                            className="video-thumbnail-small"
                            muted
                            onClick={() => handleVideoClick(combo.id)}
                            title="Click to expand"
                            style={{ cursor: 'pointer' }}
                          />
                          <button 
                            className="delete-video-button"
                            onClick={() => handleDeleteVideo(combo.id)}
                            title="Delete video"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Upload Buttons Section - Show buttons for missing media types */}
                  <div className="upload-buttons-row">
                    {/* Show photo upload button if no photo exists */}
                    {!(combo.photo || combo.photoURL || comboPhotos[combo.id]) && (
                      <>
                        <label htmlFor={`photo-upload-${combo.id}`} className="upload-button photo-upload-button">
                          📷 Upload Photo
                        </label>
                        <input
                          id={`photo-upload-${combo.id}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(e, combo.id)}
                          style={{ display: 'none' }}
                        />
                      </>
                    )}
                    
                    {/* Show video upload button if no video exists */}
                    {!(combo.video || combo.videoURL) && (
                      <>
                        <label htmlFor={`video-upload-${combo.id}`} className="upload-button video-upload-button">
                          🎥 Upload Video
                        </label>
                        <input
                          id={`video-upload-${combo.id}`}
                          type="file"
                          accept="video/*"
                          onChange={(e) => handleVideoUpload(e, combo.id)}
                          style={{ display: 'none' }}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Photo Modal - Rendered outside of cards for proper full-screen display */}
      {expandedImage && (
        <div className="photo-modal" onClick={() => setExpandedImage(null)}>
          <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <img 
              src={(() => {
                const combo = usedCombinationsOnly.find(c => c.id === expandedImage);
                return combo?.photo || combo?.photoURL || comboPhotos[expandedImage];
              })()} 
              alt="Combination photo expanded" 
              className="photo-expanded"
            />
            <button 
              className="close-modal-button"
              onClick={() => setExpandedImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Video Modal - Rendered outside of cards for proper full-screen display */}
      {expandedVideo && (
        <div className="photo-modal" onClick={() => setExpandedVideo(null)}>
          <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <video 
              src={(() => {
                const combo = usedCombinationsOnly.find(c => c.id === expandedVideo);
                return combo?.video || combo?.videoURL;
              })()} 
              className="photo-expanded"
              controls
              autoPlay
              muted
            />
            <button 
              className="close-modal-button"
              onClick={() => setExpandedVideo(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Combinations;
