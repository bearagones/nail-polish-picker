import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null
  });

  const showModal = (type, title, message, onConfirm = null, onCancel = null) => {
    setModal({
      isOpen: true,
      type,
      title,
      message,
      onConfirm,
      onCancel
    });
  };

  const hideModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const success = (message, title = 'Success') => {
    return new Promise((resolve) => {
      showModal('success', title, message, () => {
        hideModal();
        resolve(true);
      });
    });
  };

  const error = (message, title = 'Error') => {
    return new Promise((resolve) => {
      showModal('error', title, message, () => {
        hideModal();
        resolve(true);
      });
    });
  };

  const warning = (message, title = 'Warning') => {
    return new Promise((resolve) => {
      showModal('warning', title, message, () => {
        hideModal();
        resolve(true);
      });
    });
  };

  const info = (message, title = 'Information') => {
    return new Promise((resolve) => {
      showModal('info', title, message, () => {
        hideModal();
        resolve(true);
      });
    });
  };

  const confirm = (message, title = 'Confirm') => {
    return new Promise((resolve) => {
      showModal('confirm', title, message, 
        () => {
          hideModal();
          resolve(true);
        },
        () => {
          hideModal();
          resolve(false);
        }
      );
    });
  };

  const value = {
    modal,
    showModal,
    hideModal,
    success,
    error,
    warning,
    info,
    confirm
  };

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
};
