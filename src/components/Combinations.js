import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useModal } from '../context/ModalContext';

const Combinations = () => {
  const { usedCombinations, comboPhotos, dispatch } = useData();
  const { confirm, success } = useModal();
  const [uploadingPhoto, setUploadingPhoto] = useState(null);

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
        <div>
          <p style={{ marginBottom: '20px', color: '#6c757d' }}>
            You have {usedCombinationsOnly.length} used combination{usedCombinationsOnly.length !== 1 ? 's' : ''}.
          </p>
          
          {usedCombinationsOnly
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((combo) => (
              <div key={combo.id} className="combination-card">
                <div className="combination-header">
                  <h3 className="combination-polish">{combo.polish.name}</h3>
                  <span className="combination-date">{formatDate(combo.date)}</span>
                </div>
                
                <div className="combination-details">
                  <span className="brand">{combo.polish.brand}</span>
                  <span className="color-tag">{combo.polish.color}</span>
                  <span className="formula-tag">{combo.polish.formula}</span>
                </div>
                
                {combo.topper && (
                  <div className="combination-topper">
                    <div className="topper-label">With Topper:</div>
                    <div style={{ marginTop: '5px' }}>
                      <strong>{combo.topper.name}</strong> by {combo.topper.brand}
                      <span className="formula-tag" style={{ marginLeft: '10px' }}>
                        {combo.topper.type}
                      </span>
                    </div>
                  </div>
                )}

                <div className="combination-photo">
                  {comboPhotos[combo.id] ? (
                    <div className="photo-display">
                      <img 
                        src={comboPhotos[combo.id]} 
                        alt="Combination photo" 
                        style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px', marginTop: '10px' }}
                      />
                    </div>
                  ) : (
                    <div className="photo-upload">
                      <label 
                        htmlFor={`photo-upload-${combo.id}`} 
                        className="photo-upload-label"
                        style={{ cursor: 'pointer', color: '#6FABD0', textDecoration: 'underline' }}
                      >
                        📷 Add Photo
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
                
                <div className="combination-actions">
                  <button 
                    className="delete-button" 
                    onClick={() => handleDeleteCombination(combo.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Combinations;
