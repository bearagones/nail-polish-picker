import React from 'react';
import { useAuth } from '../context/AuthContext';

const UserBar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="user-bar">
      <span className="user-greeting">Hello, {user?.displayName || user?.name || 'User'}!</span>
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default UserBar;
