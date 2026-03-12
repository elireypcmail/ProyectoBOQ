import React from 'react';
import { Pencil, Trash2, X } from "lucide-react";

const ModalDetailedDoctor = ({ 
  isOpen, 
  onClose, 
  doctor, 
  onEdit, 
  onDelete 
}) => {
  if (!isOpen || !doctor) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Detalles del Médico</h3>
          <button onClick={onClose} className="icon-btn"><X size={20} /></button>
        </div>

        <div className="modal-info-body">
          <div className="detail-card">
            <strong>ID:</strong> <span>#{doctor.id}</span>
          </div>
          <div className="detail-card">
            <strong>Nombre:</strong> <span>{doctor.nombre}</span>
          </div>
          <div className="detail-card">
            <strong>Tipo:</strong> <span>{doctor.tipo}</span>
          </div>
          <div className="detail-card">
            <strong>Teléfono:</strong> <span>{doctor.telefono ? `+${doctor.telefono}` : "-"}</span>
          </div>
          <div className="detail-card">
            <strong>Estatus:</strong> <span>Activo</span>
          </div>
        </div>

        <div className="modal-footer" style={{ flexDirection: "column", gap: "0.75rem", marginTop: '1.5rem' }}>
          <button 
            className="btn-primary" 
            onClick={() => { onEdit(); onClose(); }}
          >
            <Pencil size={16} /> Editar Información
          </button>
          
          <button 
            className="btn-danger" 
            onClick={() => { onDelete(); onClose(); }}
          >
            <Trash2 size={16} /> Eliminar Registro
          </button>
          
          <button className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetailedDoctor;