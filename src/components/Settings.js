import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useModal } from '../context/ModalContext';

const Settings = () => {
  const { 
    nailPolishes, 
    toppers, 
    usedCombinations,
    customColors,
    customFormulas,
    customTopperTypes,
    dispatch 
  } = useData();
  const { success, confirm } = useModal();
  
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const handleResetAllData = async () => {
    const confirmed = await confirm(
      'This will delete ALL your data including polishes, toppers, combinations, and custom options. This cannot be undone!',
      'Reset All Data'
    );
    if (confirmed) {
      dispatch({ type: 'RESET_DATA' });
      success('All data has been reset!');
    }
  };

  const handleExportData = () => {
    const data = {
      nailPolishes,
      toppers,
      usedCombinations,
      customColors,
      customFormulas,
      customTopperTypes,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nail-polish-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    success('Data exported successfully!');
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        dispatch({ type: 'IMPORT_DATA', payload: data });
        success('Data imported successfully!');
      } catch (error) {
        success('Invalid file format!', 'Import Error');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const totalItems = nailPolishes.length + toppers.length + usedCombinations.length;

  return (
    <div>
      <h2>Settings</h2>
      
      <div className="settings-section">
        <h3>Appearance</h3>
        <div className="appearance-setting">
          <div className="dark-mode-toggle">
            <label className="checkbox-label-inline">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
              />
              <span className="checkbox-text">Dark Mode</span>
            </label>
          </div>
          <p className="setting-description">
            Toggle between light and dark themes
          </p>
        </div>
      </div>

      <div className="settings-section">
        <h3>Data Management</h3>
        
        <div className="stats-overview" style={{ marginBottom: '20px' }}>
          <div className="stat-card">
            <h3>{nailPolishes.length}</h3>
            <p>Nail Polishes</p>
          </div>
          <div className="stat-card">
            <h3>{toppers.length}</h3>
            <p>Toppers</p>
          </div>
          <div className="stat-card">
            <h3>{usedCombinations.length}</h3>
            <p>Combinations</p>
          </div>
          <div className="stat-card">
            <h3>{customColors.length + customFormulas.length + customTopperTypes.length}</h3>
            <p>Custom Options</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <button className="secondary-button" onClick={handleExportData}>
              Export Data
            </button>
            <p style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '5px' }}>
              Download your collection data as a JSON file for backup
            </p>
          </div>
          
          <div>
            <label className="secondary-button" style={{ cursor: 'pointer', display: 'inline-block' }}>
              Import Data
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                style={{ display: 'none' }}
              />
            </label>
            <p style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '5px' }}>
              Upload a previously exported JSON file to restore your data
            </p>
          </div>
          
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #e9ecef' }}>
            <button 
              className="delete-button" 
              onClick={handleResetAllData}
              style={{ width: '100%' }}
            >
              Reset All Data
            </button>
            <p style={{ fontSize: '0.9rem', color: '#dc3545', marginTop: '5px' }}>
              ⚠️ This will permanently delete all your data ({totalItems} items total)
            </p>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>About</h3>
        <p style={{ color: '#6c757d', lineHeight: '1.6' }}>
          Nail Polish Picker helps you choose the perfect nail polish from your collection. 
          Add custom colors, formulas, and topper types when adding new items to your collection.
        </p>
        <p style={{ color: '#6c757d', marginTop: '10px', fontSize: '0.9rem' }}>
          Version 2.0 - React Edition
        </p>
      </div>
    </div>
  );
};

export default Settings;
