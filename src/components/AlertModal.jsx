import React from 'react';

const AlertModal = ({ message, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      <p>{message}</p>
      <button onClick={onClose}>Close</button>
    </div>
  </div>
);

export default AlertModal;