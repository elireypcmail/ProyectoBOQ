import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Select from "react-select";
import { FileText, X, User, Stethoscope, Pencil, ImageIcon, Upload, Save } from "lucide-react";

const HistoryFormModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  pacienteId, 
  pacienteOptions, 
  medicoOptions, 
  initialData,
  getPacienteNombre 
}) => {
  const [selectedPacienteId, setSelectedPacienteId] = useState("");
  const [selectedMedicoId, setSelectedMedicoId] = useState("");
  const [detalle, setDetalle] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  // Sincronizar estados cuando se abre para editar o crear
  useEffect(() => {
    if (isOpen) {
      setSelectedPacienteId(initialData?.id_paciente || pacienteId || "");
      setSelectedMedicoId(initialData?.id_medico || "");
      setDetalle(initialData?.detalle || "");
      setSelectedFiles([]);
    }
  }, [isOpen, initialData, pacienteId]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!selectedPacienteId || !selectedMedicoId || !detalle) return;
    onSave({
      id_paciente: Number(selectedPacienteId),
      id_medico: Number(selectedMedicoId),
      detalle,
      files: selectedFiles
    });
  };

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: '10px',
      borderColor: state.isFocused ? 'var(--ins-primary)' : '#e2e8f0',
      minHeight: '45px',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(236, 78, 83, 0,1)' : 'none',
      '&:hover': { borderColor: 'var(--ins-primary)' }
    })
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="stories-modal-overlay">
      <div className="stories-modal-card">
        <div className="stories-modal-header">
          <div className="stories-modal-title-group">
            <div className="stories-modal-icon-bg"><FileText size={22} color="var(--ins-primary)" /></div>
            <div>
              <h3 className="stories-modal-title">{initialData ? "Editar Historia" : "Nueva Entrada"}</h3>
              <p className="stories-modal-subtitle">Información médica del paciente</p>
            </div>
          </div>
          <button className="stories-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="stories-modal-grid">
          <div className="ins-col-span-2">
            <label className="lp-modal-label"><User size={14} /> Paciente</label>
            {!pacienteId ? (
              <Select 
                options={pacienteOptions} 
                value={pacienteOptions.find(opt => opt.value === selectedPacienteId)} 
                onChange={(opt) => setSelectedPacienteId(opt?.value)} 
                styles={customSelectStyles} 
              />
            ) : (
              <input className="stories-modal-input stories-input-disabled" value={getPacienteNombre(Number(pacienteId))} disabled />
            )}
          </div>

          <div className="ins-col-span-2">
            <label className="lp-modal-label"><Stethoscope size={14} /> Médico Tratante</label>
            <Select 
              options={medicoOptions} 
              value={medicoOptions.find(opt => opt.value === selectedMedicoId)} 
              onChange={(opt) => setSelectedMedicoId(opt?.value)} 
              styles={customSelectStyles} 
            />
          </div>

          <div className="ins-col-span-2">
            <label className="lp-modal-label"><Pencil size={14} /> Detalle del Diagnóstico</label>
            <textarea 
              className="stories-modal-input stories-textarea-clinical" 
              value={detalle} 
              onChange={(e) => setDetalle(e.target.value.toUpperCase())} 
              placeholder="Escriba el diagnóstico..." 
            />
          </div>

          <div className="ins-col-span-2">
            <label className="lp-modal-label"><ImageIcon size={14} /> Adjuntar Estudios</label>
            <div className="file-upload-zone" onClick={() => fileInputRef.current.click()}>
              <Upload size={24} color="var(--ins-muted)" style={{margin: '0 auto 8px'}} />
              <p style={{fontSize: '0,85rem'}}>Subir imágenes (JPG, PNG)</p>
              <input type="file" multiple hidden ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
            </div>

            {selectedFiles.length > 0 && (
              <div className="preview-files-container">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="preview-file-item">
                    <img src={URL.createObjectURL(file)} alt="preview" />
                    <button onClick={() => removeFile(idx)} className="remove-file-btn"><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="stories-modal-footer">
          <button className="stories-btn-tertiary" onClick={onClose}>Cancelar</button>
          <button className="stories-btn-primary stories-btn-wide" onClick={handleSubmit}>
            <Save size={18} /> {initialData ? "Guardar Cambios" : "Registrar"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default HistoryFormModal;