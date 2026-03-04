import React, { useState, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import { Save, X, Loader2 } from "lucide-react";
import "react-phone-input-2/lib/style.css";

// Styles
import "../../../styles/ui/ClinicFormModal.css";

const ClinicFormModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  clinic, 
  isSaving
}) => {

  const [nombre, setNombre] = useState("");
  const [rif, setRif] = useState("");
  const [contacto, setContacto] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [direccion, setDireccion] = useState("");
  const [notas, setNotas] = useState("");

  useEffect(() => {
    if (clinic && isOpen) {
      setNombre(clinic.nombre?.toUpperCase() || "");
      setRif(clinic.rif?.toUpperCase() || "");
      setContacto(clinic.contacto?.toUpperCase() || "");
      setTelefono(clinic.telefono || "");
      setEmail(clinic.email || "");
      setDireccion(clinic.direccion?.toUpperCase() || "");
      setNotas(clinic.notas?.toUpperCase() || "");
    } else if (isOpen) {
      resetLocalForm();
    }
  }, [clinic, isOpen]);

  const resetLocalForm = () => {
    setNombre("");
    setRif("");
    setContacto("");
    setTelefono("");
    setEmail("");
    setDireccion("");
    setNotas("");
  };

  const handleSubmit = () => {
    if (!nombre.trim() || !contacto.trim() || !direccion.trim()) {
      return alert("POR FAVOR COMPLETE LOS CAMPOS OBLIGATORIOS");
    }

    const payload = {
      nombre: nombre.trim(),
      rif: rif.trim() || null,
      contacto: contacto.trim(),
      telefono: telefono || null,
      email: email.trim() ? email.toLowerCase().trim() : null,
      direccion: direccion.trim(),
      notas: notas.trim() || null,
      estatus: true,
    };

    onSave(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="cfm-modal-overlay">
      <div className="cfm-modal-content cfm-modal-large">

        {/* HEADER */}
        <div className="cfm-modal-header">
          <div>
            <h3 className="cfm-title">{clinic ? "EDITAR CLÍNICA" : "NUEVA CLÍNICA"}</h3>
            <p className="cfm-subtitle">INFORMACIÓN GENERAL DE LA INSTITUCIÓN</p>
          </div>
          <button className="cfm-btn-close-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="cfm-modal-body-scroll">
          <div className="cfm-modal-grid">

            <div className="cfm-form-group">
              <label className="cfm-modal-label">NOMBRE DE LA CLÍNICA *</label>
              <input 
                className="cfm-modal-input" 
                value={nombre} 
                onChange={(e) => setNombre(e.target.value.toUpperCase())} 
                placeholder="EJ: CLÍNICA SAN MARCOS"
              />
            </div>

            <div className="cfm-form-group">
              <label className="cfm-modal-label">RIF</label>
              <input 
                className="cfm-modal-input" 
                value={rif} 
                onChange={(e) => setRif(e.target.value.toUpperCase())} 
                placeholder="EJ: J123456789"
              />
            </div>

            <div className="cfm-form-group">
              <label className="cfm-modal-label">PERSONA DE CONTACTO *</label>
              <input 
                className="cfm-modal-input" 
                value={contacto} 
                onChange={(e) => setContacto(e.target.value.toUpperCase())} 
                placeholder="NOMBRE DEL CONTACTO"
              />
            </div>

            <div className="cfm-form-group">
              <label className="cfm-modal-label">TELÉFONO</label>
              <PhoneInput 
                country={"ve"} 
                value={telefono} 
                onChange={setTelefono} 
                inputClass="cfm-phone-input-custom"
                containerClass="cfm-phone-container"
              />
            </div>

            <div className="cfm-form-group">
              <label className="cfm-modal-label">EMAIL</label>
              <input 
                className="cfm-modal-input" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value.replace(/\s/g, ""))} 
                placeholder="contacto@clinica.com"
              />
            </div>

            <div className="cfm-form-group cfm-col-span-2">
              <label className="cfm-modal-label">DIRECCIÓN *</label>
              <input 
                className="cfm-modal-input" 
                value={direccion}
                onChange={(e) => setDireccion(e.target.value.toUpperCase())}
                placeholder="DIRECCIÓN COMPLETA DE LA CLÍNICA"
              />
            </div>

            <div className="cfm-form-group cfm-col-span-2">
              <label className="cfm-modal-label">NOTAS</label>
              <textarea 
                className="cfm-modal-textarea"
                value={notas}
                onChange={(e) => setNotas(e.target.value.toUpperCase())}
                placeholder="INFORMACIÓN ADICIONAL, OBSERVACIONES, CONDICIONES..."
                rows={3}
              />
            </div>

          </div>
        </div>

        {/* FOOTER */}
        <div className="cfm-modal-footer">
          <button className="cfm-btn-secondary" onClick={onClose} disabled={isSaving}>
            CANCELAR
          </button>

          <button className="cfm-btn-primary cfm-btn-wide" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? <Loader2 className="cfm-spin" size={18} /> : <Save size={16} />}
            <span>{clinic ? "ACTUALIZAR CLÍNICA" : "GUARDAR CLÍNICA"}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ClinicFormModal;