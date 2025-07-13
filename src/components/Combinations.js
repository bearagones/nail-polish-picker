import React from 'react';
import { useData } from '../context/DataContext';
import { useModal } from '../context/ModalContext';

const Combinations = () => {
  const { usedCombinations, dispatch } = useData();
  const { confirm, success } = useModal();

  const handleDeleteCombination = async (id) => {
    const confirmed = await confirm('Are you sure you want to delete this combination?');
    if (confirmed) {
      dispatch({ type: 'REMOVE_COMBINATION', payload: id });
      success('Combination deleted successfully!');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <h2>Recent Combinations</h2>
      
      {usedCombinations.length === 0 ? (
        <p className="empty-message">
          No combinations yet! Use the Polish Picker to generate some combinations.
        </p>
      ) : (
        <div>
          <p style={{ marginBottom: '20px', color: '#6c757d' }}>
            You have {usedCombinations.length} saved combination{usedCombinations.length !== 1 ? 's' : ''}.
          </p>
          
          {usedCombinations
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
