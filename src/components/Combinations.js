import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';

const Combinations = () => {
  const { usedCombinations, comboPhotos, dispatch } = useData();
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
            ))}
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
