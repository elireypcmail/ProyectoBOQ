import React from "react";
import { Pencil, Trash2, X, Phone, Mail, MapPin, Briefcase, Percent, User, ArrowRight } from "lucide-react";

// Importación del CSS único basado en LPA Style
import "../../../styles/ui/SellerDetailModal.css";

const SellerDetailModal = ({ 
  isOpen, 
  onClose, 
  seller, 
  onEdit, 
  onDelete 
}) => {
  if (!isOpen || !seller) return null;

  // Obtenemos las iniciales para el avatar estilo LPA
  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'V';
  };

  return (
    <div className="lp-modal-overlay">
      <div className="lp-modal-content">
        
        {/* HEADER SECTION */}
        <div className="lp-details-header">
          <div className="lp-avatar-circle">
            {getInitials(seller.nombre)}
          </div>
          <div className="lp-header-info">
            <span className="lp-badge-id">Vendedor #{seller.id}</span>
            <h3>{seller.nombre}</h3>
          </div>
          <button className="vdm-close-x" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* INFO GRID SECTION */}
        <div className="lp-details-body">
          <div className="lp-details-grid">
            
            <div className="lp-detail-item">
              <div className="lp-detail-icon"><Briefcase size={18} /></div>
              <div className="lp-detail-text">
                <label>Oficina Principal</label>
                <p>{seller.oficina || "No asignada"}</p>
              </div>
            </div>

            <div className="lp-detail-item">
              <div className="lp-detail-icon"><MapPin size={18} /></div>
              <div className="lp-detail-text">
                <label>Zona de Cobertura</label>
                <p>{seller.zona || "—"}</p>
              </div>
            </div>

            <div className="lp-detail-item">
              <div className="lp-detail-icon"><Phone size={18} /></div>
              <div className="lp-detail-text">
                <label>Teléfono de Contacto</label>
                <p>{seller.telefono ? `+${seller.telefono}` : "—"}</p>
              </div>
            </div>

            <div className="lp-detail-item">
              <div className="lp-detail-icon"><Mail size={18} /></div>
              <div className="lp-detail-text">
                <label>Correo Electrónico</label>
                <p>{seller.email || "—"}</p>
              </div>
            </div>

            {/* Tarjeta de Comisión Estilo LPA */}
            <div className="lp-detail-item lp-featured-card">
              <div className="lp-detail-icon lp-icon-red"><Percent size={18} /></div>
              <div className="lp-detail-text">
                <label>Esquema de Comisión</label>
                <p className="lp-text-red">
                  {seller.comision ? `${seller.comision}% sobre ventas netas` : "Sin esquema definido"}
                </p>
              </div>
            </div>

            {seller.observaciones && (
              <div className="lp-detail-item lp-col-full">
                <div className="lp-detail-text">
                  <label>Notas y Observaciones</label>
                  <p className="lp-notes-text">{seller.observaciones}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ACTIONS SECTION */}
        <div className="lp-details-actions">
          <button 
            className="lp-btn-action-main" 
            onClick={() => { onEdit(seller); onClose(); }}
          >
            <Pencil size={18} /> Editar Perfil del Vendedor
          </button>
          
          <div className="lp-action-row">
            <button className="lp-btn-danger-soft" onClick={() => { onDelete(); onClose(); }}>
              <Trash2 size={16} /> Eliminar
            </button>
            <button className="lp-btn-secondary-soft" onClick={onClose}>
              Cerrar Detalle
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SellerDetailModal;