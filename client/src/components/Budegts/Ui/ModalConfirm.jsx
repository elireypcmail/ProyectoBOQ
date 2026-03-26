import React from 'react';
import { CheckCircle } from "lucide-react";
import "../../../styles/ui/ModalConfirm.css";

const ModalConfirm = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="pdm-modal-overlay" style={{ zIndex: 3000 }}>
      <div className="pdm-modal-content mconf-size">
        <div className="mconf-icon-wrapper">
          <CheckCircle size={64} color="#10b981" strokeWidth={2.5} />
        </div>
        
        <h2 className="mconf-title">
          {title || "¡Éxito!"}
        </h2>
        
        <p className="mconf-message">
          {message || "La operación se ha completado correctamente."}
        </p>

        <button className="mconf-btn-success" onClick={onClose}>
          Aceptar y Continuar
        </button>
      </div>
    </div>
  );
};

export default ModalConfirm;