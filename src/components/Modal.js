import React from 'react';
import { useModal } from '../context/ModalContext';

const Modal = () => {
  const { modal, hideModal } = useModal();

  if (!modal.isOpen) return null;

  return (
    <div className="modal-overlay" onClick={hideModal}>
      <div className={`modal ${modal.type}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{modal.title}</h3>
          <button className="modal-close" onClick={hideModal}>×</button>
        </div>
        <div className="modal-content">
          <p>{modal.message}</p>
        </div>
        <div className="modal-buttons">
          {modal.type === 'confirm' && (
            <>
              <button className="cancel-button" onClick={modal.onCancel}>
                Cancel
              </button>
              <button className="save-button" onClick={modal.onConfirm}>
                Confirm
              </button>
            </>
          )}
          {modal.type !== 'confirm' && (
            <button className="save-button" onClick={modal.onConfirm || hideModal}>
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
