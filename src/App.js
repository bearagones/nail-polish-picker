import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ModalProvider } from './context/ModalContext';
import Header from './components/Header';
import UserBar from './components/UserBar';
import TabNavigation from './components/TabNavigation';
import PolishPicker from './components/PolishPicker';
import Collection from './components/Collection';
import Combinations from './components/Combinations';
import Settings from './components/Settings';
import Modal from './components/Modal';
import Login from './components/Login';
import './styles/login.css';

const AppContent = () => {
  const { isAuthenticated, isLoading, login } = useAuth();
  const [activeTab, setActiveTab] = useState('picker');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'picker':
        return <PolishPicker />;
      case 'collection':
        return <Collection />;
      case 'combinations':
        return <Combinations />;
      case 'settings':
        return <Settings />;
      default:
        return <PolishPicker />;
    }
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Nail Polish Picker</h1>
            <p>Loading your collection...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }

  // Show main app if authenticated
  return (
    <DataProvider>
      <div className="container">
        <Header />
        <UserBar />
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="tab-content">
          {renderActiveTab()}
        </div>
      </div>
    </DataProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <ModalProvider>
        <AppContent />
        <Modal />
      </ModalProvider>
    </AuthProvider>
  );
}

export default App;
