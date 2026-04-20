import React, { useState, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import { Save, X, Loader2, AlertCircle } from "lucide-react";
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
  
  const [errors, setErrors] = useState({});

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
    setErrors({});
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

  const isValidFormat = (text) => {
    const alphanumericOnly = text.replace(/[^a-zA-Z0-9]/g, "");
    return alphanumericOnly.length >= 3;
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = () => {
    let newErrors = {};

    // Validaciones de campos obligatorios
    if (!nombre.trim()) newErrors.nombre = "EL NOMBRE ES OBLIGATORIO";
    else if (!isValidFormat(nombre)) newErrors.nombre = "INGRESE UN NOMBRE VÁLIDO";

    // NUEVA VALIDACIÓN: RIF Obligatorio
    if (!rif.trim()) newErrors.rif = "EL RIF ES OBLIGATORIO";
    else if (!isValidFormat(rif)) newErrors.rif = "INGRESE UN RIF VÁLIDO";

    if (!contacto.trim()) newErrors.contacto = "EL CONTACTO ES OBLIGATORIO";
    else if (!isValidFormat(contacto)) newErrors.contacto = "NOMBRE DE CONTACTO INVÁLIDO";

    if (!direccion.trim()) newErrors.direccion = "LA DIRECCIÓN ES OBLIGATORIA";
    else if (!isValidFormat(direccion)) newErrors.direccion = "INGRESE UNA DIRECCIÓN REAL";

    if (email.trim() && !validateEmail(email)) {
      newErrors.email = "FORMATO DE EMAIL INVÁLIDO";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      nombre: nombre.trim(),
      rif: rif.trim().toUpperCase(),
      contacto: contacto.trim(),
      telefono: telefono || null,
      email: email.trim() ? email.toLowerCase().trim() : null,
      direccion: direccion.trim(),
      notas: notas.trim() || null,
      estatus: true,
    };

    onSave(payload);
  };

  const ErrorMessage = ({ message }) => (
    message ? (
      <div className="cfm-error-msg" style={{ color: "#ff4d4d", fontSize: "11px", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px", fontWeight: "600" }}>
        <AlertCircle size={12} /> {message}
      </div>
    ) : null
  );

  if (!isOpen) return null;

  return (
    <div className="cfm-modal-overlay">
      <div className="cfm-modal-content cfm-modal-large">
        <div className="cfm-modal-header">
          <div>
            <h3 className="cfm-title">{clinic ? "EDITAR CLÍNICA" : "NUEVA CLÍNICA"}</h3>
            <p className="cfm-subtitle">INFORMACIÓN GENERAL DE LA INSTITUCIÓN</p>
          </div>
          <button className="cfm-btn-close-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="cfm-modal-body-scroll">
          <div className="cfm-modal-grid">
            
            {/* NOMBRE */}
            <div className="cfm-form-group">
              <label className="cfm-modal-label">NOMBRE DE LA CLÍNICA *</label>
              <input 
                className={`cfm-modal-input ${errors.nombre ? "cfm-input-error" : ""}`}
                value={nombre} 
                onChange={(e) => {
                  setNombre(e.target.value.replace(/[^a-zA-Z0-9\s]/g, "").toUpperCase());
                  if (errors.nombre) setErrors({...errors, nombre: null});
                }} 
                placeholder="EJ: CLÍNICA SAN MARCOS"
              />
              <ErrorMessage message={errors.nombre} />
            </div>

            {/* RIF (Ahora con validación de error) */}
            <div className="cfm-form-group">
              <label className="cfm-modal-label">RIF *</label>
              <input 
                className={`cfm-modal-input ${errors.rif ? "cfm-input-error" : ""}`} 
                value={rif} 
                onChange={(e) => {
                  setRif(e.target.value.replace(/[^a-zA-Z0-9-]/g, "").toUpperCase());
                  if (errors.rif) setErrors({...errors, rif: null});
                }} 
                placeholder="EJ: J123456789"
              />
              <ErrorMessage message={errors.rif} />
            </div>

            {/* CONTACTO */}
            <div className="cfm-form-group">
              <label className="cfm-modal-label">PERSONA DE CONTACTO *</label>
              <input 
                className={`cfm-modal-input ${errors.contacto ? "cfm-input-error" : ""}`}
                value={contacto} 
                onChange={(e) => {
                  setContacto(e.target.value.replace(/[^a-zA-Z\s]/g, "").toUpperCase());
                  if (errors.contacto) setErrors({...errors, contacto: null});
                }} 
                placeholder="NOMBRE DEL CONTACTO"
              />
              <ErrorMessage message={errors.contacto} />
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
                className={`cfm-modal-input ${errors.email ? "cfm-input-error" : ""}`}
                type="email" 
                value={email} 
                onChange={(e) => {
                  setEmail(e.target.value.replace(/\s/g, ""));
                  if (errors.email) setErrors({...errors, email: null});
                }} 
                placeholder="contacto@clinica.com"
              />
              <ErrorMessage message={errors.email} />
            </div>

            {/* DIRECCIÓN */}
            <div className="cfm-form-group cfm-col-span-2">
              <label className="cfm-modal-label">DIRECCIÓN *</label>
              <input 
                className={`cfm-modal-input ${errors.direccion ? "cfm-input-error" : ""}`}
                value={direccion}
                onChange={(e) => {
                  setDireccion(e.target.value.toUpperCase());
                  if (errors.direccion) setErrors({...errors, direccion: null});
                }}
                placeholder="DIRECCIÓN COMPLETA DE LA CLÍNICA"
              />
              <ErrorMessage message={errors.direccion} />
            </div>

            <div className="cfm-form-group cfm-col-span-2">
              <label className="cfm-modal-label">NOTAS</label>
              <textarea 
                className="cfm-modal-textarea"
                value={notas}
                onChange={(e) => setNotas(e.target.value.toUpperCase())}
                placeholder="INFORMACIÓN ADICIONAL..."
                rows={3}
              />
            </div>

          </div>
        </div>

        <div className="cfm-modal-footer">
          <button className="cfm-btn-secondary" onClick={onClose} disabled={isSaving}>CANCELAR</button>
          <button className="cfm-btn-primary cfm-btn-wide" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? <Loader2 className="cfm-spin" size={18} /> : <Save size={16} />}
            <span>{clinic ? "ACTUALIZAR" : "GUARDAR"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClinicFormModal;