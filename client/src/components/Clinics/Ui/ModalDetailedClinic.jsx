import React from "react";
import { 
  Pencil, Trash2, X, 
  Phone, Mail, CreditCard, MapPin, User, FileText 
} from "lucide-react";

// Styles
import "../../../styles/ui/ModalDetailedClinic.css";

const ModalDetailedClinic = ({ 
  isOpen, 
  onClose, 
  clinic, 
  onEdit, 
  onDelete 
}) => {

  if (!isOpen || !clinic) return null;

  return (
    <div className="mcl-modal-overlay" onClick={onClose}>
      <div className="mcl-modal-content" onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <header className="mcl-header">
          <div className="mcl-header-info">
            <div className="mcl-avatar">
              {clinic.nombre?.charAt(0).toUpperCase()}
            </div>
            <div className="mcl-title-group">
              <h3 className="mcl-clinic-name">{clinic.nombre?.toUpperCase()}</h3>
              <span className="mcl-id-badge">ID REGISTRO: #{clinic.id}</span>
            </div>
          </div>
          <button className="mcl-close-btn" onClick={onClose} aria-label="Cerrar modal">
            <X size={22} />
          </button>
        </header>

        {/* BODY */}
        <div className="mcl-body">
          <div className="mcl-info-grid">

            {/* RIF */}
            <div className="mcl-info-card">
              <div className="mcl-icon-box"><CreditCard size={18} /></div>
              <div className="mcl-text-group">
                <label>RIF</label>
                <p>{clinic.rif?.toUpperCase() || "SIN RIF REGISTRADO"}</p>
              </div>
            </div>

            {/* CONTACTO */}
            <div className="mcl-info-card">
              <div className="mcl-icon-box"><User size={18} /></div>
              <div className="mcl-text-group">
                <label>Persona de Contacto</label>
                <p>{clinic.contacto?.toUpperCase() || "NO ESPECIFICADO"}</p>
              </div>
            </div>

            {/* TELÉFONO */}
            <div className="mcl-info-card">
              <div className="mcl-icon-box"><Phone size={18} /></div>
              <div className="mcl-text-group">
                <label>Teléfono de Contacto</label>
                <p>{clinic.telefono ? `+${clinic.telefono}` : "SIN TELÉFONO"}</p>
              </div>
            </div>

            {/* EMAIL */}
            <div className="mcl-info-card">
              <div className="mcl-icon-box"><Mail size={18} /></div>
              <div className="mcl-text-group">
                <label>Correo Electrónico</label>
                <p className="mcl-email-text">
                  {clinic.email?.toLowerCase() || "SIN EMAIL REGISTRADO"}
                </p>
              </div>
            </div>

            {/* DIRECCIÓN */}
            <div className="mcl-info-card mcl-col-full">
              <div className="mcl-icon-box"><MapPin size={18} /></div>
              <div className="mcl-text-group mcl-address-container">
                <label>Dirección Detallada</label>
                <div className="mcl-address-scroll">
                  <p>
                    {clinic.direccion?.toUpperCase() || 
                      "NO SE HA ESPECIFICADO UNA DIRECCIÓN PARA ESTA CLÍNICA."}
                  </p>
                </div>
              </div>
            </div>

            {/* NOTAS */}
            <div className="mcl-info-card mcl-col-full">
              <div className="mcl-icon-box"><FileText size={18} /></div>
              <div className="mcl-text-group">
                <label>Notas / Observaciones</label>
                <div className="mcl-address-scroll">
                  <p>
                    {clinic.notas?.toUpperCase() || 
                      "NO HAY NOTAS REGISTRADAS PARA ESTA CLÍNICA."}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* FOOTER */}
        <footer className="mcl-footer">
          <div className="mcl-actions-main">
            <button 
              className="mcl-btn mcl-btn-edit" 
              onClick={() => onEdit(clinic)}
            >
              <Pencil size={18} /> EDITAR INFORMACIÓN
            </button>

            <button 
              className="mcl-btn mcl-btn-delete" 
              onClick={() => { 
                onClose(); 
                onDelete(clinic.id); 
              }}
            >
              <Trash2 size={18} /> ELIMINAR
            </button>
          </div>

          <button 
            className="mcl-btn mcl-btn-close" 
            onClick={onClose}
          >
            CERRAR VENTANA
          </button>
        </footer>

      </div>
    </div>
  );
};

export default ModalDetailedClinic;