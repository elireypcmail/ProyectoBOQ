import React from 'react';
import { CheckCircle, XCircle } from "lucide-react";
import "../../../styles/ui/ModalConfirm.css";

const ModalConfirmSale = ({ isOpen, onClose, title, message, type = "success" }) => {
  if (!isOpen) return null;

  const isError = type === "error";

  return (
    <div className="pdm-modal-overlay" style={{ zIndex: 3000 }}>
      <div className="pdm-modal-content mconf-size">
        {/* Aplicamos la clase dinámica al contenedor del icono para activar las animaciones CSS */}
        <div className={`mconf-icon-wrapper ${isError ? "mconf-icon-wrapper-error" : "mconf-icon-wrapper-success"}`}>
          {isError ? (
            <XCircle size={64} color="#ef4444" strokeWidth={2.5} />
          ) : (
            <CheckCircle size={64} color="#10b981" strokeWidth={2.5} />
          )}
        </div>
        
        {/* Título con clase condicional para el color rojo si hay error */}
        <h2 className={`mconf-title ${isError ? "mconf-title-error" : ""}`}>
          {title || (isError ? "Hubo un problema" : "¡Éxito!")}
        </h2>
        
        <p className="mconf-message">
          {message || "La operación se ha completado correctamente."}
        </p>

        {/* Botón dinámico */}
        <button 
          className={isError ? "mconf-btn-error" : "mconf-btn-success"} 
          onClick={onClose}
        >
          {isError ? "Entendido" : "Aceptar y Continuar"}
        </button>
      </div>
    </div>
  );
};

export default ModalConfirmSale;