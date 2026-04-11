import React from "react";
import { X, Save, Shield } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const InsuranceFormModal = ({ 
  isOpen, 
  onClose, 
  title, 
  formData, 
  setFormData, 
  onSave, 
  handleNameInput 
}) => {
  if (!isOpen) return null;

  return (
    <div className="is-modal-overlay">
      <div className="is-modal-box form-card">
        {/* HEADER DEL MODAL */}
        <div className="is-modal-header">
          <div className="is-modal-title-wrapper">
            <div className="is-modal-icon-small">
              <Shield size={20} />
            </div>
            <h3 className="is-modal-title">{title}</h3>
          </div>
          <button className="is-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* CUERPO DEL FORMULARIO */}
        <div className="is-modal-grid">
          <div className="is-col-span-2">
            <label className="is-modal-label">Nombre de la Aseguradora</label>
            <input
              className="is-modal-input"
              placeholder="EJ: SEGUROS CARACAS"
              value={formData.nombre}
              onChange={e => handleNameInput(e.target.value, (val) => setFormData({...formData, nombre: val}))}
            />
          </div>

          <div className="is-col-mobile-full">
            <label className="is-modal-label">Persona de Contacto</label>
            <input
              className="is-modal-input"
              placeholder="NOMBRE DEL ASESOR"
              value={formData.contacto}
              onChange={e => handleNameInput(e.target.value, (val) => setFormData({...formData, contacto: val}))}
            />
          </div>

          <div className="is-col-mobile-full">
            <label className="is-modal-label">Teléfono de Soporte</label>
            <PhoneInput
              country={'ve'}
              value={formData.telefono}
              onChange={(val) => setFormData({...formData, telefono: val})}
              containerClass="is-phone-container"
              inputClass="is-phone-input"
              buttonClass="is-phone-button"
            />
          </div>
        </div>

        {/* ACCIONES */}
        <div className="is-modal-footer">
          <button className="is-btn-secondary-outline" onClick={onClose}>
            CANCELAR
          </button>
          <button className="is-btn-primary" onClick={onSave}>
            <Save size={18} /> GUARDAR CAMBIOS
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsuranceFormModal;