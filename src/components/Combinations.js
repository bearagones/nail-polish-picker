import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useModal } from '../context/ModalContext';

const Combinations = () => {
  const { usedCombinations, comboPhotos, dispatch } = useData();
  const { confirm, success } = useModal();
  const [uploadingPhoto, setUploadingPhoto] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);

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
      // Check file size (limit to 2MB)
      if (file.size > 2 * 1024 * 1024) {
        success('Image size must be less than 2MB. Please choose a smaller image.', 'File Too Large');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        dispatch({ 
          type: 'SAVE_COMBO_PHOTO', 
          payload: { 
            key: comboId.toString(), 
            photo: e.target.result 
          } 
        });
        success('Photo uploaded successfully!');
        setUploadingPhoto(null);
      };
      reader.readAsDataURL(file);
    }
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
                      <span className="color-tag">{combo.polish.color}</span>
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
                </div>

                <div className="combination-photo">
                  {comboPhotos[combo.id] ? (
                    <div className="photo-display">
                      <div className="photo-thumbnail-container">
                        <img 
                          src={comboPhotos[combo.id]} 
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
                              src={comboPhotos[combo.id]} 
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
