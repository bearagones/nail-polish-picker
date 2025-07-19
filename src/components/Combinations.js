import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';

const Combinations = () => {
  const { usedCombinations, comboPhotos, dispatch } = useData();
  const { confirm, success } = useModal();
  const { isAuthenticated } = useAuth();
  const [uploadingPhoto, setUploadingPhoto] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);
  const [pendingPhotos, setPendingPhotos] = useState({}); // Store pending photos before save
  const [savingPhoto, setSavingPhoto] = useState(null);

  const handleDeleteCombination = async (id) => {
    const confirmed = await confirm('Are you sure you want to delete this combination?');
    if (confirmed) {
      dispatch({ type: 'REMOVE_COMBINATION', payload: id });
      success('Combination deleted successfully!');
    }
  };

  const handlePhotoUpload = (e, comboId) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        success('Image size must be less than 5MB. Please choose a smaller image.', 'File Too Large');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const photoData = e.target.result;
        
        if (isAuthenticated) {
          // For authenticated users, store as pending photo first
          setPendingPhotos(prev => ({
            ...prev,
            [comboId]: {
              file: file,
              preview: photoData
            }
          }));
          success('Photo selected! Click "Save Photo" to save it permanently.');
        } else {
          // For non-authenticated users, save to local storage immediately
          dispatch({ 
            type: 'SAVE_COMBO_PHOTO', 
            payload: { 
              key: comboId.toString(), 
              photo: photoData 
            } 
          });
          success('Photo uploaded successfully!');
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
        const updatedCombo = {
          ...existingCombo,
          photoFile: pendingPhoto.file, // Include actual file for Firebase Storage
          photo: pendingPhoto.preview // Include preview for display
        };
        
        console.log('Combinations: Saving photo for authenticated user:', {
          comboId,
          hasPhotoFile: !!updatedCombo.photoFile,
          hasPhoto: !!updatedCombo.photo
        });
        
        // Use UPDATE_COMBINATION to trigger Firebase sync
        await dispatch({ 
          type: 'UPDATE_COMBINATION', 
          payload: { 
            id: comboId, 
            updates: updatedCombo 
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

  const handleDeletePhoto = (comboId) => {
    dispatch({ 
      type: 'REMOVE_COMBO_PHOTO', 
      payload: comboId.toString() 
    });
    success('Photo deleted successfully!');
  };

  // Filter to only show combinations that are marked as used
  const usedCombinationsOnly = usedCombinations.filter(combo => combo.used === true);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <h2>Recent Combinations</h2>
      
      {usedCombinationsOnly.length === 0 ? (
        <p className="empty-message">
          No used combinations yet! Use the Polish Picker and check "I used this combination" to save combinations here.
        </p>
      ) : (
        <div className="tab-content-scrollable">
          <p style={{ marginBottom: '20px', color: '#6c757d' }}>
            You have {usedCombinationsOnly.length} used combination{usedCombinationsOnly.length !== 1 ? 's' : ''}.
          </p>
          
          {usedCombinationsOnly
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

                <div className="combination-photo">
                  {/* Check for pending photo first */}
                  {pendingPhotos[combo.id] ? (
                    <div className="photo-pending">
                      <div className="photo-preview-container">
                        <img 
                          src={pendingPhotos[combo.id].preview} 
                          alt="Photo preview" 
                          className="photo-thumbnail"
                          style={{ opacity: 0.8 }}
                        />
                        <div className="photo-pending-overlay">
                          <span>Photo Preview</span>
                        </div>
                      </div>
                      <div className="photo-actions">
                        <button 
                          className="save-photo-button"
                          onClick={() => handleSavePhoto(combo.id)}
                          disabled={savingPhoto === combo.id}
                        >
                          {savingPhoto === combo.id ? 'Saving...' : 'Save Photo'}
                        </button>
                        <button 
                          className="cancel-photo-button"
                          onClick={() => handleCancelPhoto(combo.id)}
                          disabled={savingPhoto === combo.id}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (combo.photo || combo.photoURL || comboPhotos[combo.id]) ? (
                    <div className="photo-display">
                      <div className="photo-thumbnail-container">
                        <img 
                          src={combo.photo || combo.photoURL || comboPhotos[combo.id]} 
                          alt="Combination photo" 
                          className="photo-thumbnail"
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
                      
                      {expandedImage === combo.id && (
                        <div className="photo-modal" onClick={() => setExpandedImage(null)}>
                          <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
                            <img 
                              src={combo.photo || combo.photoURL || comboPhotos[combo.id]} 
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
                    </div>
                  ) : (
                    <div className="photo-upload">
                      <label 
                        htmlFor={`photo-upload-${combo.id}`} 
                        className="photo-upload-label"
                      >
                        📷
                      </label>
                      <input
                        id={`photo-upload-${combo.id}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(e, combo.id)}
                        style={{ display: 'none' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Combinations;
