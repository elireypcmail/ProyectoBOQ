import React from 'react';
import { Pencil, Trash2, X, User, Phone, Mail, Stethoscope, Hash, Bell, BellOff } from "lucide-react";
import "../../../styles/ui/ModalDetailedDoctor.css";

const ModalDetailedDoctor = ({ 
  isOpen, 
  onClose, 
  doctor, 
  onEdit, 
  onDelete 
}) => {
  if (!isOpen || !doctor) return null;

  return (
    <div className="ddm-overlay">
      <div className="ddm-content">
        {/* Cabecera con Perfil */}
        <div className="ddm-header">
          <div className="ddm-profile-section">
            <div className="ddm-avatar">
              <User size={32} />
            </div>
            <div>
              <h3 className="ddm-title">{doctor.nombre}</h3>
              <span className="ddm-badge-active">Médico Activo</span>
            </div>
          </div>
          <button onClick={onClose} className="ddm-close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="ddm-body">
          <div className="ddm-info-grid">
            <div className="ddm-info-item">
              <div className="ddm-icon-box"><Hash size={16} /></div>
              <div className="ddm-text-group">
                <label>ID Registro</label>
                <span>#{doctor.id}</span>
              </div>
            </div>

            <div className="ddm-info-item">
              <div className="ddm-icon-box"><Stethoscope size={16} /></div>
              <div className="ddm-text-group">
                <label>Especialidad</label>
                <span>{doctor.tipo}</span>
              </div>
            </div>

            <div className="ddm-info-item">
              <div className="ddm-icon-box"><Phone size={16} /></div>
              <div className="ddm-text-group">
                <label>Teléfono de Contacto</label>
                <span>{doctor.telefono ? `+${doctor.telefono}` : "No registrado"}</span>
              </div>
            </div>

            <div className="ddm-info-item">
              <div className="ddm-icon-box"><Mail size={16} /></div>
              <div className="ddm-text-group">
                <label>Correo Electrónico</label>
                <span>{doctor.email || "Sin correo"}</span>
              </div>
            </div>

            {/* Fila de Notificaciones */}
            <div className={`ddm-info-item ${doctor.notificaciones ? 'is-active' : 'is-inactive'}`}>
              <div className="ddm-icon-box">
                {doctor.notificaciones ? <Bell size={16} /> : <BellOff size={16} />}
              </div>
              <div className="ddm-text-group ddm-flex-between">
                <div>
                  <label>Notificaciones</label>
                  <span>{doctor.notificaciones ? "Activadas" : "Desactivadas"}</span>
                </div>
                <div className={`ddm-status-dot ${doctor.notificaciones ? 'bg-success' : 'bg-muted'}`}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="ddm-footer">
          <div className="ddm-actions-main">
            <button 
              className="ddm-btn-edit" 
              onClick={() => { onEdit(); onClose(); }}
            >
              <Pencil size={16} /> Editar
            </button>
            <button className="ddm-btn-close" onClick={onClose}>
              Cerrar
            </button>
          </div>
          
          <button 
            className="ddm-btn-delete" 
            onClick={() => { onDelete(); onClose(); }}
          >
            <Trash2 size={16} /> Eliminar Médico
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetailedDoctor;