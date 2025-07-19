import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useModal } from '../context/ModalContext';

const PolishPicker = () => {
  const { nailPolishes, toppers, finishers, getAllColors, getAllFormulas, getAllFinisherTypes, usedCombinations, comboPhotos, dispatch } = useData();
  const { success } = useModal();
  
  const [filters, setFilters] = useState({
    color: 'any',
    formula: 'any',
    finisher: 'any',
    includeTopper: false
  });
  
  const [result, setResult] = useState(null);
  const [currentCombination, setCurrentCombination] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [isUsed, setIsUsed] = useState(false);
  const [showAddTopper, setShowAddTopper] = useState(false);
  const [existingCombination, setExistingCombination] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Function to check if a combination already exists
  const findExistingCombination = (polish, topper) => {
    return usedCombinations.find(combo => 
      combo.used === true &&
      combo.polish.name === polish.name &&
      combo.polish.brand === polish.brand &&
      ((combo.topper && topper && combo.topper.name === topper.name && combo.topper.brand === topper.brand) ||
       (!combo.topper && !topper))
    );
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        success('Image size must be less than 5MB. Please choose a smaller image.', 'File Too Large');
        return;
      }

      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 10MB for videos)
      if (file.size > 10 * 1024 * 1024) {
        success('Video size must be less than 10MB. Please choose a smaller video.', 'File Too Large');
        return;
      }

      setVideoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setVideoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    success('Photo removed successfully!');
  };

  const handleDeleteVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
    success('Video removed successfully!');
  };

  const addTopperToResult = () => {
    if (toppers.length === 0) {
      success('Please add some toppers to your collection first!', 'No Toppers Available');
      return;
    }

    const randomTopper = toppers[Math.floor(Math.random() * toppers.length)];
    
    const updatedCombination = {
      ...currentCombination,
      topper: randomTopper
    };

    setCurrentCombination(updatedCombination);
    setResult(prev => ({ ...prev, topper: randomTopper }));
    setShowAddTopper(false);
  };

  const handleSaveCombination = async () => {
    if (!currentCombination) return;

    console.log('PolishPicker: Saving combination with:', {
      isUsed,
      hasPhotoFile: !!photoFile,
      hasPhotoPreview: !!photoPreview,
      photoFile,
      photoPreview: photoPreview ? 'base64 data present' : null
    });

    const updatedCombination = {
      ...currentCombination,
      used: isUsed,
      ...(photoFile && isUsed && { photoFile: photoFile }), // Include actual file for Firebase Storage
      ...(photoPreview && isUsed && { photo: photoPreview }) // Include preview for display/localStorage
    };

    console.log('PolishPicker: Final combination payload:', {
      ...updatedCombination,
      photoFile: updatedCombination.photoFile ? 'File object present' : null,
      photo: updatedCombination.photo ? 'base64 data present' : null
    });

    // Save the combination
    dispatch({ type: 'ADD_COMBINATION', payload: updatedCombination });

    // For local storage (non-authenticated users), also save photo separately for backward compatibility
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
      filteredPolishes = filteredPolishes.filter(polish => {
        // Handle both old single-color and new multi-color formats
        if (Array.isArray(polish.colors)) {
          return polish.colors.some(color => color.toLowerCase() === filters.color.toLowerCase());
        } else if (polish.color) {
          return polish.color.toLowerCase() === filters.color.toLowerCase();
        }
        return false;
      });
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

    // Always select a finisher
    let selectedFinisher = null;
    if (finishers.length === 0) {
      success('Please add some finishers to your collection first!', 'No Finishers Available');
      return;
    }

    // Filter finishers by preference
    let filteredFinishers = finishers;
    if (filters.finisher !== 'any') {
      filteredFinishers = finishers.filter(finisher => 
        finisher.type.toLowerCase() === filters.finisher.toLowerCase()
      );
    }

    if (filteredFinishers.length === 0) {
      success('No finishers match your preference. Try selecting "Any Finisher" or add more finishers to your collection!', 'No Matching Finishers');
      return;
    }

    selectedFinisher = filteredFinishers[Math.floor(Math.random() * filteredFinishers.length)];

    // Check if this combination has been used before
    const existingCombo = findExistingCombination(randomPolish, selectedTopper);
    
    // Create combination but don't mark as used yet
    const combination = {
      id: Date.now(),
      polish: randomPolish,
      topper: selectedTopper,
      finisher: selectedFinisher,
      date: new Date().toISOString(),
      used: false
    };

    setCurrentCombination(combination);
    setResult({ polish: randomPolish, topper: selectedTopper, finisher: selectedFinisher });
    setExistingCombination(existingCombo);
    setIsUsed(false);
    setPhotoFile(null);
    setPhotoPreview(null);
    setVideoFile(null);
    setVideoPreview(null);
    
    // Show add topper option if no topper was initially selected
    setShowAddTopper(!filters.includeTopper && !selectedTopper && toppers.length > 0);
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
          <label>Finisher Preference:</label>
          <select 
            value={filters.finisher} 
            onChange={(e) => handleFilterChange('finisher', e.target.value)}
          >
            <option value="any">Any Finisher</option>
            {getAllFinisherTypes().map(finisher => (
              <option key={finisher} value={finisher}>
                {finisher.charAt(0).toUpperCase() + finisher.slice(1)}
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
              {/* Display multiple colors or single color */}
              {Array.isArray(result.polish.colors) ? (
                result.polish.colors.map((color, colorIndex) => (
                  <span key={colorIndex} className="color-tag color-tag-spaced">
                    {color.charAt(0).toUpperCase() + color.slice(1)}
                  </span>
                ))
              ) : (
                <span className="color-tag">{result.polish.color}</span>
              )}
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

          {result.finisher && (
            <div className="finisher-card">
              <h3>With Finisher: {result.finisher.name}</h3>
              <div className="finisher-details">
                <span className="brand">{result.finisher.brand}</span>
                <span className="formula-tag">{result.finisher.type}</span>
              </div>
            </div>
          )}

          {existingCombination && (existingCombination.photoURL || existingCombination.photo || comboPhotos[existingCombination.id]) && (
            <div className="existing-combination-photo">
              <h4 className="existing-combination-title">
                ✨ You've used this combination before! Here's how it looked:
              </h4>
              <div className="photo-display">
                <img 
                  src={existingCombination.photoURL || existingCombination.photo || comboPhotos[existingCombination.id]} 
                  alt="Previous combination photo" 
                  className="existing-combination-image"
                  onClick={() => setExpandedImage('existing')}
                  title="Click to expand"
                />
                <p className="existing-combination-date">
                  Used on {new Date(existingCombination.date).toLocaleDateString()}
                </p>
              </div>
              
              {expandedImage === 'existing' && (
                <div className="photo-modal" onClick={() => setExpandedImage(null)}>
                  <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
                    <img 
                      src={existingCombination.photoURL || existingCombination.photo || comboPhotos[existingCombination.id]} 
                      alt="Previous combination photo expanded" 
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
            </div>
          )}

          {showAddTopper && (
            <div className="add-topper-section">
              <p>Want to add a topper to this polish?</p>
              <button className="secondary-button" onClick={addTopperToResult}>
                Add Random Topper
              </button>
              <button className="text-button" onClick={() => setShowAddTopper(false)}>
                No, keep as is
              </button>
            </div>
          )}

          <div className="combination-actions">
            <div className="photo-and-checkbox-row">
              <div className="upload-section">
                {!photoPreview && (
                  <div className="photo-upload-section">
                    <label htmlFor="photo-upload" className="upload-button photo-upload-button">
                      📷 Upload Photo
                    </label>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden-file-input"
                    />
                  </div>
                )}

                {!videoPreview && (
                  <div className="video-upload-section">
                    <label htmlFor="video-upload" className="upload-button video-upload-button">
                      🎥 Upload Video
                    </label>
                    <input
                      id="video-upload"
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden-file-input"
                    />
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
            </div>

            {photoPreview && (
              <div className="photo-preview-picker">
                <img 
                  src={photoPreview} 
                  alt="Combination preview" 
                  className="photo-preview-image"
                  onClick={() => setExpandedImage('preview')}
                  title="Click to expand"
                />
                <button 
                  className="delete-photo-button-picker"
                  onClick={handleDeletePhoto}
                  title="Delete photo"
                >
                  ✕
                </button>
                
                {expandedImage === 'preview' && (
                  <div className="photo-modal" onClick={() => setExpandedImage(null)}>
                    <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
                      <img 
                        src={photoPreview} 
                        alt="Combination preview expanded" 
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
              </div>
            )}

            {videoPreview && (
              <div className="video-preview-picker">
                <video 
                  src={videoPreview} 
                  controls
                  className="video-preview-video"
                  title="Video preview"
                />
                <button 
                  className="delete-video-button-picker"
                  onClick={handleDeleteVideo}
                  title="Delete video"
                >
                  ✕
                </button>
              </div>
            )}

            {isUsed && (
              <button className="save-combination-button" onClick={handleSaveCombination}>
                Save to Recent Combinations
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PolishPicker;
