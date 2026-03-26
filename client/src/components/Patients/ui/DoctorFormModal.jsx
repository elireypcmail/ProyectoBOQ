import React, { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import PhoneInput from "react-phone-input-2";
import { Save, Plus, X } from "lucide-react";
import "react-phone-input-2/lib/style.css";
import "../../../styles/ui/DoctorFormModal.css"

const DoctorFormModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  tipoMedicos, 
  selectedMedico, 
  onCreateTipoMedico 
}) => {
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    email: "",
    notificaciones: false,
    id_tipomedico: ""
  });
  const [isCreatingTipo, setIsCreatingTipo] = useState(false);
  const [newTipoName, setNewTipoName] = useState("");

  // Utilidad para validar formato de email
  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  useEffect(() => {
    if (selectedMedico) {
      setFormData({
        nombre: selectedMedico.nombre,
        telefono: selectedMedico.telefono || "",
        email: selectedMedico.email || "",
        notificaciones: selectedMedico.notificaciones || false,
        id_tipomedico: selectedMedico.id_tipomedico
      });
    } else {
      setFormData({ 
        nombre: "", 
        telefono: "", 
        email: "", 
        notificaciones: false, 
        id_tipomedico: "" 
      });
    }
  }, [selectedMedico, isOpen]);

  // Regla: Si el email deja de ser válido, desactivamos notificaciones automáticamente
  useEffect(() => {
    if (!isValidEmail(formData.email) && formData.notificaciones) {
      setFormData(prev => ({ ...prev, notificaciones: false }));
    }
  }, [formData.email]);

  const handleNameInput = (value) => {
    const formatted = value.replace(/[^a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s]/g, "").toUpperCase();
    setFormData({ ...formData, nombre: formatted });
  };

  const handleNotificationChange = (e) => {
    const isChecked = e.target.checked;
    
    if (isChecked && !isValidEmail(formData.email)) {
      alert("Por favor, ingrese un correo electrónico válido para activar las notificaciones.");
      return;
    }
    
    setFormData({ ...formData, notificaciones: isChecked });
  };

  const tipoOptions = useMemo(() =>
    tipoMedicos.map(tipo => ({ value: tipo.id, label: tipo.nombre })),
    [tipoMedicos]
  );

  const selectedTipoOption = tipoOptions.find(
    opt => opt.value === Number(formData.id_tipomedico)
  ) || null;

  const handleSubmit = () => {
    if (!formData.nombre.trim() || !formData.id_tipomedico) return;
    
    // Validación extra al enviar si las notificaciones están marcadas
    if (formData.notificaciones && !isValidEmail(formData.email)) {
      alert("El correo electrónico no es válido.");
      return;
    }

    onSave(formData);
  };

  const handleCreateTipo = async () => {
    if (!newTipoName.trim()) return;
    const res = await onCreateTipoMedico({ nombre: newTipoName.trim().toUpperCase() });
    if (res) {
      setFormData({ ...formData, id_tipomedico: res.data.id });
      setIsCreatingTipo(false);
      setNewTipoName("");
    }
  };

  if (!isOpen) return null;

  // Determinar si el campo de email tiene algo pero es inválido (para estilo visual)
  const emailHasError = formData.email.length > 0 && !isValidEmail(formData.email);

  return (
    <div className="dfm-modal-overlay">
      <div className="dfm-modal-content">
        <h3 className="dfm-modal-title">
          {selectedMedico ? "Editar Médico" : "Crear Médico"}
        </h3>

        <label className="dfm-modal-label">Nombre Completo</label>
        <input
          className="dfm-modal-input"
          placeholder="Ej: DR. JUAN PÉREZ"
          value={formData.nombre}
          onChange={(e) => handleNameInput(e.target.value)}
        />

        <div className="dfm-grid-container">
          <div>
            <label className="dfm-modal-label">Teléfono</label>
            <div className="dfm-phone-wrapper">
              <PhoneInput
                country={'ve'}
                value={formData.telefono}
                onChange={(value) => setFormData({ ...formData, telefono: value })}
                inputClass="dfm-phone-input-custom"
                containerClass="dfm-phone-container"
              />
            </div>
          </div>

          <div>
            <label className="dfm-modal-label">Correo Electrónico</label>
            <input
              type="email"
              className={`dfm-modal-input ${emailHasError ? 'dfm-input-error' : ''}`}
              placeholder="ejemplo@correo.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
            />
            {emailHasError && <span style={{fontSize: '11px', color: '#dc3545'}}>Formato inválido</span>}
          </div>
        </div>

        <div className={`dfm-checkbox-group ${!isValidEmail(formData.email) ? 'dfm-disabled-opacity' : ''}`}>
          <input
            type="checkbox"
            className="dfm-checkbox-input"
            id="notificaciones"
            checked={formData.notificaciones}
            onChange={handleNotificationChange}
            disabled={!isValidEmail(formData.email)}
          />
          <label htmlFor="notificaciones" className="dfm-checkbox-label">
            ¿Desea recibir notificaciones? 
            {!isValidEmail(formData.email) && (
              <span style={{marginLeft: '8px', fontSize: '11px', color: 'gray'}}>
                (Requiere email válido)
              </span>
            )}
          </label>
        </div>

        <label className="dfm-modal-label">Especialidad / Tipo</label>
        {!isCreatingTipo ? (
          <div className="dfm-select-container">
            <div className="dfm-select-flex">
              <Select
                placeholder="Selecciona especialidad..."
                options={tipoOptions}
                value={selectedTipoOption}
                onChange={(opt) => setFormData({ ...formData, id_tipomedico: opt ? opt.value : "" })}
                isClearable
                classNamePrefix="dfm-react-select"
              />
            </div>
            <button className="dfm-btn-new" onClick={() => setIsCreatingTipo(true)}>
              <Plus size={16} /> Nuevo
            </button>
          </div>
        ) : (
          <div className="dfm-new-tipo-box">
            <div className="dfm-new-tipo-inputs">
              <input
                className="dfm-modal-input"
                placeholder="Nombre del nuevo tipo"
                value={newTipoName}
                onChange={(e) => setNewTipoName(e.target.value.toUpperCase())}
              />
              <div className="dfm-new-tipo-actions">
                <button className="dfm-btn-save-mini" onClick={handleCreateTipo}><Save size={16} /></button>
                <button className="dfm-btn-cancel-mini" onClick={() => { setIsCreatingTipo(false); setNewTipoName(""); }}><X size={16}/></button>
              </div>
            </div>
          </div>
        )}

        <div className="dfm-modal-footer">
          <button className="dfm-btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="dfm-btn-primary" onClick={handleSubmit}>
            <Save size={16} /> {selectedMedico ? "Guardar" : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorFormModal;