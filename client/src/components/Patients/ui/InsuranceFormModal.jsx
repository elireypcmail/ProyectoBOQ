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

  // NEW REGEX:
  // 1. Ensures at least 3 letters: (?=(.*[a-zA-Z]){3,})
  // 2. Only allows letters (a-z, A-Z), numbers (0-9), and spaces (\s): ^[a-zA-Z0-9\s]+$
  const validationRegex = /^(?=(.*[a-zA-Z]){3,})[a-zA-Z0-9\s]+$/;

  // Validation states
  const isNombreValid = validationRegex.test(formData.nombre || "");
  const isContactoValid = validationRegex.test(formData.contacto || "");
  const isTelefonoValid = (formData.telefono || "").length >= 10;

  const canSave = isNombreValid && isContactoValid && isTelefonoValid;

  return (
    <div className="is-modal-overlay">
      <div className="is-modal-box form-card">
        <div className="is-modal-header">
          <div className="is-modal-title-wrapper">
            <div className="is-modal-icon-small"><Shield size={20} /></div>
            <h3 className="is-modal-title">{title}</h3>
          </div>
          <button className="is-close-btn" onClick={onClose}><X size={24} /></button>
        </div>

        <div className="is-modal-grid">
          {/* Insurance Name */}
          <div className="is-col-span-2">
            <label className="is-modal-label">Nombre de la Aseguradora</label>
            <input
              className="is-modal-input"
              placeholder="Ej: Seguros XYZ"
              value={formData.nombre}
              onChange={e => {
                // Remove any character that is NOT a letter, number, or space
                const cleanValue = e.target.value.replace(/[^a-zA-Z0-9\s]/g, "");
                handleNameInput(cleanValue, (val) => setFormData({...formData, nombre: val}));
              }}
            />
          </div>

          {/* Contact Person */}
          <div className="is-col-mobile-full">
            <label className="is-modal-label">Persona de Contacto</label>
            <input
              className="is-modal-input"
              placeholder="Ej: Juan Perez"
              value={formData.contacto}
              onChange={e => {
                const cleanValue = e.target.value.replace(/[^a-zA-Z0-9\s]/g, "");
                handleNameInput(cleanValue, (val) => setFormData({...formData, contacto: val}));
              }}
            />
          </div>

          {/* Phone */}
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

        <div className="is-modal-footer">
          <button className="is-btn-secondary-outline" onClick={onClose}>CANCELAR</button>
          <button 
            className={`is-btn-primary ${!canSave ? "is-btn-disabled" : ""}`} 
            onClick={onSave}
            disabled={!canSave}
            style={{ 
              opacity: !canSave ? 0.5 : 1, 
              cursor: !canSave ? 'not-allowed' : 'pointer' 
            }}
          >
            <Save size={18} /> GUARDAR CAMBIOS
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsuranceFormModal;