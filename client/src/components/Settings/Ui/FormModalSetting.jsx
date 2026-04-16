import React, { useState, useEffect, useCallback } from "react";
import { X, Loader2, Upload, FileText, MapPin, Phone, Hash, Mail } from "lucide-react";

const FormModalSetting = ({ isOpen, onClose, onSave, isSaving, allParams = [], imagesList = [] }) => {
  const [rif, setRif] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [nota, setNota] = useState("");

  const [firma, setFirma] = useState(null);
  const [sello, setSello] = useState(null);
  const [logo, setLogo] = useState(null);

  const [previewFirma, setPreviewFirma] = useState(null);
  const [previewSello, setPreviewSello] = useState(null);
  const [previewLogo, setPreviewLogo] = useState(null);

  const [imagesToDelete, setImagesToDelete] = useState([]);

  // Función para limpiar URLs de blobs y evitar fugas de memoria
  const revokeBlobs = useCallback(() => {
    [previewFirma, previewSello, previewLogo].forEach(p => {
      if (p && p.startsWith('blob:')) {
        URL.revokeObjectURL(p);
      }
    });
  }, [previewFirma, previewSello, previewLogo]);

  useEffect(() => {
    if (isOpen) {
      // 1. Cargar textos
      const findVal = (desc) => allParams.find(p => p.descripcion === desc)?.valor || "";
      
      setRif(findVal("Rif"));
      setDireccion(findVal("Direccion"));
      setTelefono(findVal("NroTlf"));
      setEmail(findVal("Email"));
      setNota(findVal("NotaPresupuesto"));
      
      // 2. Cargar previsualizaciones desde las imágenes ya existentes (Base64)
      const getExistingImg = (name) => {
        const img = imagesList.find(i => i.nombre.toLowerCase().includes(name.toLowerCase()));
        return img && img.data ? `data:${img.mime_type};base64,${img.data}` : null;
      };

      setPreviewLogo(getExistingImg("Logo"));
      setPreviewFirma(getExistingImg("Firma"));
      setPreviewSello(getExistingImg("Sello"));

      // Reiniciar archivos nuevos y lista de eliminación
      setFirma(null);
      setSello(null);
      setLogo(null);
      setImagesToDelete([]);
    } else {
      // Limpiar blobs cuando el modal se cierra para evitar ERR_FILE_NOT_FOUND en el siguiente render
      revokeBlobs();
    }
  }, [isOpen, allParams, imagesList]);

  const handleFileSelection = (file, setFileState, setPreviewState, currentPreview) => {
    if (file) {
      // Si ya había un blob previo, lo revocamos antes de crear uno nuevo
      if (currentPreview && currentPreview.startsWith('blob:')) {
        URL.revokeObjectURL(currentPreview);
      }
      const newUrl = URL.createObjectURL(file);
      setFileState(file);
      setPreviewState(newUrl);
    }
  };

  const handleRemoveImage = (imgName, setFileState, setPreviewState, currentPreview) => {
    const existingImg = imagesList.find(i => i.nombre.toLowerCase().includes(imgName.toLowerCase()));
    if (existingImg) {
      setImagesToDelete(prev => [...prev, existingImg.id]);
    }
    
    if (currentPreview && currentPreview.startsWith('blob:')) {
      URL.revokeObjectURL(currentPreview);
    }
    
    setFileState(null);
    setPreviewState(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave({
      rif,
      direccion,
      telefono,
      email,
      valor: nota,
      firmaDigital: firma,
      selloDigital: sello,
      logo: logo,
      imagesToDelete 
    });
  };

  if (!isOpen) return null;

  const FileInput = ({ id, label, state, preview, onChange, onRemove }) => (
    <div className="pl-form-group">
      <label className="pl-modal-label">{label}</label>
      <div className="pl-file-upload-container" style={{ textAlign: 'center', position: 'relative' }}>
        
        {preview && (
          <button
            type="button"
            onClick={onRemove}
            className="pl-remove-img-btn"
            style={{
              position: 'absolute', top: '-8px', right: '-8px',
              backgroundColor: '#e84053', color: 'white', border: 'none',
              borderRadius: '50%', width: '22px', height: '22px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}
          >
            <X size={14} strokeWidth={3} />
          </button>
        )}

        <div style={{ 
          marginBottom: '10px', display: 'flex', justifyContent: 'center', 
          height: '65px', alignItems: 'center', backgroundColor: '#fff',
          borderRadius: '4px', border: '1px solid #ddd', overflow: 'hidden'
        }}>
          {preview ? (
            <img 
              src={preview} 
              alt={label} 
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
            />
          ) : (
            <span style={{ fontSize: '0.7rem', color: '#999' }}>Sin imagen</span>
          )}
        </div>

        <input 
          type="file" id={id} style={{ display: 'none' }}
          onChange={(e) => onChange(e.target.files[0])} 
          accept="image/*"
        />
        <label 
          htmlFor={id} className="pl-btn-secondary-outline" 
          style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem', cursor: 'pointer', display: 'block' }}
        >
          <Upload size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} /> 
          {state || preview ? "Cambiar" : "Subir"}
        </label>
        
        {state && (
          <p style={{ fontSize: '0.65rem', color: '#b5fb7d', marginTop: '6px', wordBreak: 'break-all' }}>
            {state.name}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="pl-modal-overlay">
      <div className="pl-modal-box" style={{ maxWidth: "650px", width: '95%' }}>
        <div className="pl-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 className="pl-modal-title" style={{ margin: 0 }}>Ajustes Generales del Sistema</h3>
          <button onClick={onClose} className="pl-icon-only-btn"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="pl-form-group">
              <label className="pl-modal-label"><Hash size={14}/> RIF</label>
              <input type="text" className="pl-modal-input" value={rif} onChange={(e) => setRif(e.target.value)} placeholder="J-00000000-0" />
            </div>
            <div className="pl-form-group">
              <label className="pl-modal-label"><Phone size={14}/> Teléfono</label>
              <input type="text" className="pl-modal-input" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="0414-0000000" />
            </div>
            <div className="pl-form-group">
              <label className="pl-modal-label"><Mail size={14}/> Email</label>
              <input type="email" className="pl-modal-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ejemplo@correo.com" />
            </div>
          </div>

          <div className="pl-form-group">
            <label className="pl-modal-label"><MapPin size={14}/> Dirección Fiscal</label>
            <input type="text" className="pl-modal-input" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
          </div>

          <div className="pl-form-group">
            <label className="pl-modal-label"><FileText size={14}/> Nota Legal / Mensaje del Presupuesto</label>
            <textarea 
              className="pl-modal-input" 
              style={{ minHeight: '80px', resize: 'vertical' }}
              value={nota} onChange={(e) => setNota(e.target.value)}
            />
          </div>

          <div style={{ 
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', 
            padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px dashed #ced4da'
          }}>
            <FileInput 
              id="logo-in" label="Logo" state={logo} preview={previewLogo}
              onChange={(file) => handleFileSelection(file, setLogo, setPreviewLogo, previewLogo)} 
              onRemove={() => handleRemoveImage("Logo", setLogo, setPreviewLogo, previewLogo)}
            />
            <FileInput 
              id="firma-in" label="Firma" state={firma} preview={previewFirma}
              onChange={(file) => handleFileSelection(file, setFirma, setPreviewFirma, previewFirma)} 
              onRemove={() => handleRemoveImage("Firma", setFirma, setPreviewFirma, previewFirma)}
            />
            <FileInput 
              id="sello-in" label="Sello" state={sello} preview={previewSello}
              onChange={(file) => handleFileSelection(file, setSello, setPreviewSello, previewSello)} 
              onRemove={() => handleRemoveImage("Sello", setSello, setPreviewSello, previewSello)}
            />
          </div>

          <div className="pl-modal-footer" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} className="pl-btn-secondary-outline">Cancelar</button>
            <button type="submit" className="pl-btn-secondary" disabled={isSaving}>
              {isSaving ? <Loader2 className="v-spin" size={16} /> : "Actualizar Todo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormModalSetting;