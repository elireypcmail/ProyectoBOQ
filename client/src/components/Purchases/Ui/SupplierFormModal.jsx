import React, { useState, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import { Save, UploadCloud, XCircle, X, Loader2 } from "lucide-react";
import "react-phone-input-2/lib/style.css";

import "../../../styles/ui/SupplierFormModal.css";

const SupplierFormModal = ({ isOpen, onClose, onSave, supplier, isSaving }) => {
  const [nombre, setNombre] = useState("");
  const [documentoField, setDocumentoField] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [datosBancarios, setDatosBancarios] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    if (supplier && isOpen) {
      setNombre(supplier.nombre || "");
      setDocumentoField(supplier.documento || "");
      setTelefono(supplier.telefono || "");
      setEmail(supplier.email || "");
      setDatosBancarios(supplier.datos_bancarios || "");

      if (supplier.images && supplier.images.length > 0) {
        const existingFiles = supplier.images.map((img) => ({
          id: img.id,
          url: `data:${img.mime_type};base64,${img.data}`,
          mime_type: img.mime_type,
          isExisting: true,
        }));
        setSelectedFiles(existingFiles);
      } else {
        setSelectedFiles([]);
      }
    } else if (isOpen) {
      resetLocalForm();
    }
  }, [supplier, isOpen]);

  const resetLocalForm = () => {
    setNombre("");
    setDocumentoField("");
    setTelefono("");
    setEmail("");
    setDatosBancarios("");
    setSelectedFiles([]);
  };

  const handleDocumentInput = (value) => {
    setDocumentoField(value.toUpperCase());
  };

  if (!isOpen) return null;

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
    if (!nombre.trim()) return alert("El nombre es obligatorio");
    
    const payload = {
      nombre: nombre.trim(),
      documento: documentoField.trim() || null,
      telefono: telefono,
      email: email.toLowerCase().trim() || null,
      datos_bancarios: datosBancarios.trim() || null,
      estatus: true,
      existing_indices: selectedFiles.filter(f => f.isExisting).map(f => f.id)
    };

    const newFilesToUpload = selectedFiles
      .filter(f => !f.isExisting)
      .map(f => f.file);

    onSave(payload, newFilesToUpload);
  };

  return (
    <div className="sfm-overlay" onClick={onClose}>
      <div className="sfm-content" onClick={(e) => e.stopPropagation()}>
        <div className="sfm-header">
          <h3>{supplier ? "Editar Proveedor" : "Nuevo Proveedor"}</h3>
          <button className="sfm-close-icon" onClick={onClose}>
            <X size={20}/>
          </button>
        </div>

        <div className="sfm-body">
          <div className="sfm-field">
            <label className="sfm-label">Nombre / Razón Social</label>
            <input
              className="sfm-input"
              placeholder="Ej: CORPORACIÓN ACME C.A."
              value={nombre}
              onChange={(e) => setNombre(e.target.value.toUpperCase())}
            />
          </div>

          <div className="sfm-field">
            <label className="sfm-label">Documento (RIF / CI)</label>
            <input
              className="sfm-input"
              placeholder="J-12345678-0"
              value={documentoField}
              onChange={(e) => handleDocumentInput(e.target.value)}
            />
          </div>

          <div className="sfm-field">
            <label className="sfm-label">Teléfono</label>
            <div className="sfm-phone-wrapper">
              <PhoneInput
                country={"ve"}
                value={telefono}
                onChange={setTelefono}
                containerClass="sfm-phone-container"
                inputClass="sfm-phone-input"
                buttonClass="sfm-phone-button"
                placeholder="Ingresar teléfono"
              />
            </div>
          </div>

          <div className="sfm-field">
            <label className="sfm-label">Email</label>
            <input 
              className="sfm-input" 
              type="email"
              placeholder="correo@ejemplo.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <div className="sfm-field">
            <label className="sfm-label">Datos Bancarios</label>
            <textarea 
              className="sfm-textarea" 
              placeholder="Banco, Nro de Cuenta, Pago móvil..."
              value={datosBancarios} 
              onChange={(e) => setDatosBancarios(e.target.value)} 
            />
          </div>

          <div className="sfm-file-section">
            <label className="sfm-label">Documentos y Fotos (Máx. 5)</label>
            <div className="sfm-dropzone" onClick={() => document.getElementById("sfm-file-input").click()}>
              <UploadCloud size={24} />
              <p>Subir archivos</p>
              <input 
                id="sfm-file-input"
                type="file" 
                multiple 
                accept="image/*,application/pdf" 
                onChange={handleFileChange}
                hidden 
              />
            </div>

            {selectedFiles.length > 0 && (
              <div className="sfm-preview-grid">
                {selectedFiles.map((file, index) => (
                  <div key={index} className={`sfm-preview-item ${file.isExisting ? 'existing' : 'new'}`}>
                    {file.mime_type?.startsWith("image") ? (
                      <img src={file.url} alt="preview" />
                    ) : (
                      <div className="sfm-pdf-placeholder">PDF</div>
                    )}
                    <button className="sfm-remove-file" onClick={() => removeFile(index)}>
                      <XCircle size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="sfm-footer">
          <button className="sfm-btn-cancel" onClick={onClose} disabled={isSaving}>
            Cancelar
          </button>
          <button className="sfm-btn-save" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? <Loader2 className="sfm-spin" size={18} /> : <Save size={18} />}
            {isSaving ? "Guardando..." : supplier ? "Actualizar" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplierFormModal;