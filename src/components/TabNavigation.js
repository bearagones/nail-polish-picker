import React from 'react';

const TabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'picker', label: 'Polish Picker' },
    { id: 'collection', label: 'My Collection' },
    { id: 'combinations', label: 'Recent Combinations' },
    { id: 'settings', label: 'Settings' }
  ];

  return (
    <nav className="tab-navigation">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};

export default TabNavigation;
