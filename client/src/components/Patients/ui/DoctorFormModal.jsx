import React, { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import PhoneInput from "react-phone-input-2";
import { Save, Plus, X } from "lucide-react";
import "react-phone-input-2/lib/style.css";

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
    id_tipomedico: ""
  });
  const [isCreatingTipo, setIsCreatingTipo] = useState(false);
  const [newTipoName, setNewTipoName] = useState("");

  // Efecto para cargar datos si es edición
  useEffect(() => {
    if (selectedMedico) {
      setFormData({
        nombre: selectedMedico.nombre,
        telefono: selectedMedico.telefono || "",
        id_tipomedico: selectedMedico.id_tipomedico
      });
    } else {
      setFormData({ nombre: "", telefono: "", id_tipomedico: "" });
    }
  }, [selectedMedico, isOpen]);

  const handleNameInput = (value) => {
    const formatted = value.replace(/[^a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s]/g, "").toUpperCase();
    setFormData({ ...formData, nombre: formatted });
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

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{selectedMedico ? "Editar Médico" : "Crear Médico"}</h3>

        <label className="modal-label">Nombre Completo</label>
        <input
          className="modal-input"
          placeholder="Ej: DR. JUAN PÉREZ"
          value={formData.nombre}
          onChange={(e) => handleNameInput(e.target.value)}
        />

        <label className="modal-label">Teléfono</label>
        <div className="phone-input-container" style={{ marginBottom: '15px' }}>
          <PhoneInput
            country={'ve'}
            value={formData.telefono}
            onChange={(value) => setFormData({ ...formData, telefono: value })}
            inputStyle={{ width: '100%', height: '40px', borderRadius: '8px', border: '1px solid #ccc' }}
            buttonStyle={{ borderRadius: '8px 0 0 8px' }}
          />
        </div>

        <label className="modal-label">Especialidad / Tipo</label>
        {!isCreatingTipo ? (
          <div className="select-zone-container">
            <div style={{ flex: 1 }}>
              <Select
                placeholder="Selecciona especialidad..."
                options={tipoOptions}
                value={selectedTipoOption}
                onChange={(opt) => setFormData({ ...formData, id_tipomedico: opt ? opt.value : "" })}
                isClearable
                classNamePrefix="react-select"
              />
            </div>
            <button className="btn-add-zone-primary" onClick={() => setIsCreatingTipo(true)}>
              <Plus size={16} /> Nuevo
            </button>
          </div>
        ) : (
          <div className="new-zone-container">
            <div className="new-zone-inputs">
              <input
                className="modal-input"
                placeholder="Nombre del nuevo tipo"
                value={newTipoName}
                onChange={(e) => setNewTipoName(e.target.value.toUpperCase())}
              />
              <div style={{ display: 'flex', gap: '5px' }}>
                <button className="btn-primary" onClick={handleCreateTipo}><Save size={16} /></button>
                <button className="btn-secondary" onClick={() => { setIsCreatingTipo(false); setNewTipoName(""); }}><X size={16}/></button>
              </div>
            </div>
          </div>
        )}

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSubmit}>
            <Save size={16} /> {selectedMedico ? "Guardar" : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorFormModal;