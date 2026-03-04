import React from "react";
import { X, Save } from "lucide-react";
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
    <div className="insurances-modal-overlay">
      <div className="insurances-modal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 className="insurances-modal-title">{title}</h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>
        </div>

        <div className="insurances-modal-grid">
          <div className="ins-col-span-2">
            <label>Nombre de la Empresa</label>
            <input
              className="insurances-modal-input"
              value={formData.nombre}
              onChange={e => handleNameInput(e.target.value, (val) => setFormData({...formData, nombre: val}))}
            />
          </div>

          <div>
            <label>Persona de Contacto</label>
            <input
              className="insurances-modal-input"
              value={formData.contacto}
              onChange={e => handleNameInput(e.target.value, (val) => setFormData({...formData, contacto: val}))}
            />
          </div>

          <div>
            <label>Teléfono</label>
            <PhoneInput
              country={'ve'}
              value={formData.telefono}
              onChange={(val) => setFormData({...formData, telefono: val})}
              inputStyle={{ width: '100%', height: '45px', borderRadius: '10px' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button
            className="insurances-btn-secondary"
            style={{ flex: 1 }}
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="insurances-btn-primary"
            style={{ flex: 1 }}
            onClick={onSave}
          >
            <Save size={18} /> Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsuranceFormModal;