import React, { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import PhoneInput from "react-phone-input-2";
import { Save, X, Plus, UploadCloud, XCircle, Loader2, Check, User, Phone, ShieldPlus } from "lucide-react";
import "react-phone-input-2/lib/style.css";

// Styles
import "../../../styles/ui/PatientFormModal.css";

const PatientFormModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  paciente, 
  seguros, 
  onCreateSeguro, 
  isSaving 
}) => {
  const [nombre, setNombre] = useState("");
  const [documentoField, setDocumentoField] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [idSeguro, setIdSeguro] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Estados para el MINI MODAL de seguro
  const [isCreatingSeguro, setIsCreatingSeguro] = useState(false);
  const [newSeguro, setNewSeguro] = useState({
    nombre: "",
    contacto: "",
    telefono: ""
  });
  const [isCreatingLoading, setIsCreatingLoading] = useState(false);

  useEffect(() => {
    if (paciente && isOpen) {
      setNombre(paciente.nombre || "");
      setDocumentoField(paciente.documento || "");
      setTelefono(paciente.telefono || "");
      setEmail(paciente.email || "");
      setIdSeguro(paciente.id_seguro || "");
      
      if (paciente.images) {
        setSelectedFiles(paciente.images.map(img => ({
          id: img.id,
          url: `data:${img.mime_type};base64,${img.data}`,
          mime_type: img.mime_type,
          isExisting: true
        })));
      }
    } else if (isOpen) {
      resetLocalForm();
    }
  }, [paciente, isOpen]);

  const resetLocalForm = () => {
    setNombre("");
    setDocumentoField("");
    setTelefono("");
    setEmail("");
    setIdSeguro("");
    setSelectedFiles([]);
    setIsCreatingSeguro(false);
    setNewSeguro({ nombre: "", contacto: "", telefono: "" });
  };

  const handleNameInput = (value, setter) => {
    setter(value.replace(/[^a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s]/g, "").toUpperCase());
  };

  const handleDocumentInput = (value) => {
    const cleanValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!cleanValue) return setDocumentoField("");
    const firstChar = cleanValue.charAt(0);
    const rest = cleanValue.slice(1);
    if (!/^[A-Z]$/.test(firstChar)) return;
    const numbersOnly = rest.replace(/[^0-9]/g, "").slice(0, 10);
    setDocumentoField(numbersOnly.length > 0 ? `${firstChar}-${numbersOnly}` : firstChar);
  };

  const handleSaveNewSeguro = async () => {
    if (!newSeguro.nombre.trim()) return;
    setIsCreatingLoading(true);
    try {
      const res = await onCreateSeguro({
        nombre: newSeguro.nombre.trim().toUpperCase(),
        contacto: newSeguro.contacto.trim().toUpperCase(),
        telefono: newSeguro.telefono,
        estatus: true
      });
      
      const createdId = res?.id || res?.data?.id;
      if (createdId) setIdSeguro(createdId);

      setIsCreatingSeguro(false);
      setNewSeguro({ nombre: "", contacto: "", telefono: "" });
    } catch (error) {
      console.error("Error al crear seguro:", error);
    } finally {
      setIsCreatingLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 5) return alert("Máximo 5 archivos");
    const newFiles = files.map((file) => ({
      url: URL.createObjectURL(file),
      mime_type: file.type,
      name: file.name,
      file,
      isExisting: false,
    }));
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!nombre || documentoField.length < 3) return alert("Verifique nombre y documento");
    const payload = {
      nombre,
      documento: documentoField,
      telefono,
      email: email.toLowerCase().trim(),
      id_seguro: idSeguro || null,
      estatus: true,
      keep_images: selectedFiles.filter(f => f.isExisting).map(f => f.id)
    };
    const newFiles = selectedFiles.filter(f => !f.isExisting).map(f => f.file);
    onSave(payload, newFiles);
  };

  const seguroOptions = useMemo(() => seguros.map(s => ({ value: s.id, label: s.nombre })), [seguros]);
  const currentSeguroValue = seguroOptions.find(opt => opt.value === idSeguro) || null;

  if (!isOpen) return null;

  return (
    <div className="lp-modal-overlay">
      <div className="lp-modal-content lp-modal-large">
        <div className="lp-modal-header">
          <div>
            <h3>{paciente ? "Editar Paciente" : "Nuevo Paciente"}</h3>
            <p>Datos de identidad y archivos adjuntos</p>
          </div>
          <button className="lp-btn-close-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="lp-modal-body-scroll">
          <div className="lp-modal-grid">
            <div className="lp-form-group">
              <label className="lp-modal-label">Nombre Completo</label>
              <input 
                className="lp-modal-input" 
                value={nombre} 
                onChange={(e) => handleNameInput(e.target.value, setNombre)} 
                placeholder="EJ: JUAN PÉREZ"
              />
            </div>

            <div className="lp-form-group">
              <label className="lp-modal-label">Documento</label>
              <input 
                className="lp-modal-input" 
                value={documentoField} 
                onChange={(e) => handleDocumentInput(e.target.value)} 
                placeholder="V-12345678"
              />
            </div>

            <div className="lp-form-group">
              <label className="lp-modal-label">Teléfono</label>
              <PhoneInput 
                country={"ve"} 
                value={telefono} 
                onChange={setTelefono} 
                inputClass="lp-phone-input-custom"
                containerClass="lp-phone-container"
              />
            </div>

            <div className="lp-form-group">
              <label className="lp-modal-label">Email</label>
              <input 
                className="lp-modal-input" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value.replace(/\s/g, ""))} 
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div className="lp-form-group lp-col-span-2">
              <label className="lp-modal-label">Seguro Médico</label>
              <div className="lp-select-row">
                <Select 
                  options={seguroOptions} 
                  value={currentSeguroValue} 
                  onChange={(opt) => setIdSeguro(opt?.value || "")} 
                  isClearable 
                  placeholder="Particular / Seleccionar Seguro"
                  className="lp-react-select-container"
                  classNamePrefix="lp-select"
                />
                <button 
                  type="button" 
                  className="lp-btn-icon-add" 
                  onClick={() => setIsCreatingSeguro(true)}
                  title="Nuevo Seguro"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            <div className="lp-form-group lp-col-span-2">
              <label className="lp-modal-label">Archivos Adjuntos (Máx. 5)</label>
              <div className="sfm-dropzone" onClick={() => document.getElementById("file-input").click()}>
                <UploadCloud size={24} />
                <p>Subir imágenes o videos</p>
                <input id="file-input" type="file" multiple accept="image/*,video/*" onChange={handleFileChange} hidden />
              </div>

              <div className="sfm-preview-grid">
                {selectedFiles.map((file, index) => (
                  <div key={index} className={`sfm-preview-item ${file.isExisting ? 'existing' : 'new'}`}>
                    {file.mime_type?.startsWith("video") ? (
                      <div className="sfm-video-placeholder">VIDEO</div>
                    ) : (
                      <img src={file.url} alt="preview" />
                    )}
                    <button className="sfm-remove-file" onClick={() => removeFile(index)}><XCircle size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lp-modal-footer">
          <button className="lp-btn-secondary" onClick={onClose} disabled={isSaving}>Cancelar</button>
          <button className="lp-btn-primary lp-btn-wide" onClick={handleSubmit} disabled={isSaving || isCreatingLoading}>
            {isSaving ? <Loader2 className="sfm-spin" size={18} /> : <Save size={16} />}
            {paciente ? "Actualizar" : "Guardar Paciente"}
          </button>
        </div>

        {/* --- MINI MODAL PARA CREAR SEGURO --- */}
        {isCreatingSeguro && (
          <div className="lp-mini-modal-overlay">
            <div className="lp-mini-modal-card">
              <div className="lp-mini-modal-header">
                <ShieldPlus size={20} className="lp-icon-red" />
                <h4>Nuevo Seguro</h4>
              </div>
              
              <div className="lp-mini-modal-body">
                <div className="lp-form-group">
                  <label className="lp-modal-label">Empresa</label>
                  <input 
                    className="lp-modal-input" 
                    placeholder="EJ: MAPFRE"
                    autoFocus
                    value={newSeguro.nombre}
                    onChange={(e) => handleNameInput(e.target.value, (v) => setNewSeguro({...newSeguro, nombre: v}))}
                  />
                </div>
                
                <div className="lp-form-group">
                  <label className="lp-modal-label">Contacto</label>
                  <input 
                    className="lp-modal-input" 
                    placeholder="NOMBRE DEL ASESOR"
                    value={newSeguro.contacto}
                    onChange={(e) => handleNameInput(e.target.value, (v) => setNewSeguro({...newSeguro, contacto: v}))}
                  />
                </div>

                <div className="lp-form-group">
                  <label className="lp-modal-label">Teléfono</label>
                  <PhoneInput 
                    country={'ve'}
                    value={newSeguro.telefono}
                    onChange={(v) => setNewSeguro({...newSeguro, telefono: v})}
                    inputClass="lp-phone-input-custom"
                    containerClass="lp-phone-container"
                  />
                </div>
              </div>

              <div className="lp-mini-modal-footer">
                <button 
                  className="lp-btn-mini-cancel" 
                  onClick={() => { setIsCreatingSeguro(false); setNewSeguro({nombre:"", contacto:"", telefono:""}); }}
                >
                  <X size={16} />
                </button>
                <button 
                  className="lp-btn-mini-save" 
                  disabled={isCreatingLoading || !newSeguro.nombre.trim()}
                  onClick={handleSaveNewSeguro}
                >
                  {isCreatingLoading ? <Loader2 className="sfm-spin" size={16} /> : <><Check size={16} /> Guardar</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientFormModal;