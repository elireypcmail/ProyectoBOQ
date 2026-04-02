import React from "react";
import { CheckCircle, XCircle } from "lucide-react";
import "../../../styles/ui/StatusModal.css";


const StatusModal = ({ isOpen, onClose, type = "success", message }) => {
  if (!isOpen) return null;

  const isSuccess = type === "success";

  return (
    <div className="cln-overlay-status">
      <div className="cln-status-card">
        <div className={`cln-status-icon-box ${isSuccess ? "success" : "error"}`}>
          {isSuccess ? <CheckCircle size={40} color="green" /> : <XCircle size={40} color="red" />}
        </div>
        <h2>{isSuccess ? "ÉXITO" : "ERROR"}</h2>
        <p>{message}</p>
        <div className="cln-status-footer">
          <button className="cln-confirm-btn" onClick={onClose}>
            ACEPTAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusModal;