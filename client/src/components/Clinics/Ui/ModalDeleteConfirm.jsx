import React from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import "../../../styles/ui/ModalDeleteConfirm.css";

const ModalDeleteConfirm = ({ isOpen, onClose, onConfirm, clinicName }) => {
  if (!isOpen) return null;

  return (
    <div className="cln-overlay-delete">
      <div className="cln-delete-card">
        <div className="cln-delete-icon-box">
          <AlertTriangle size={40} />
        </div>
        <h2>¿ELIMINAR REGISTRO?</h2>
        <p>
          ESTA ACCIÓN ELIMINARÁ PERMANENTEMENTE A:<br />
          <strong className="cln-delete-target">
            {clinicName?.toUpperCase()}
          </strong>
        </p>
        <div className="cln-delete-footer">
          <button className="cln-cancel-btn" onClick={onClose}>
            CANCELAR
          </button>
          <button className="cln-confirm-btn" onClick={onConfirm}>
            <Trash2 size={18} /> CONFIRMAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDeleteConfirm;