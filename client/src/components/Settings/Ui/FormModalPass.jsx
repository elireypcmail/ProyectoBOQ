import React, { useState } from 'react';
import { X, Save, Loader2, Key, CheckCircle, XCircle } from 'lucide-react';
import { useSettings } from "../../../context/SettingsContext";
import "../../../styles/components/ListZone.css";
// Importamos los estilos del StatusModal para que se vea igual
import "../../../styles/ui/StatusModal.css"; 

const FormModalPass = ({ isOpen, onClose }) => {
  const { editAuthParams } = useSettings();
  const [newPassword, setNewPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  // Estado para controlar la vista (form, success, error)
  const [view, setView] = useState("form"); // "form" | "success" | "error"
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleClose = () => {
    setNewPassword("");
    setView("form");
    setErrorMessage("");
    onClose();
  };

  const handleSave = async () => {
    if (!newPassword.trim()) return;

    try {
      setIsSaving(true);
      // Ajustado a la propiedad 'contrasena' que espera tu backend
      await editAuthParams({ newClave: newPassword });
      setView("success");
    } catch (error) {
      setErrorMessage(error.response?.data?.msg || "ERROR AL ACTUALIZAR LA CONTRASEÑA");
      setView("error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="is-modal-overlay">
      <div className="is-modal-box form-card" style={{ maxWidth: '400px' }}>
        
        {view === "form" ? (
          <>
            <div className="is-modal-header">
              <div className="is-modal-title-wrapper">
                <div className="is-modal-icon-small"><Key size={20} /></div>
                <h3 className="is-modal-title">ACTUALIZAR CLAVE DE PARÁMETRO</h3>
              </div>
              <button className="is-close-btn" onClick={handleClose}>
                <X size={24} />
              </button>
            </div>

            <div className="is-modal-grid" style={{ padding: '20px' }}>
              <div className="is-col-span-2">
                <label className="is-modal-label">NUEVA CLAVE</label>
                <input
                  type="password"
                  className="is-modal-input"
                  placeholder="INGRESE LA NUEVA CLAVE"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="is-modal-footer">
              <button className="is-btn-secondary-outline" onClick={handleClose} disabled={isSaving}>
                CANCELAR
              </button>
              <button 
                className="is-btn-primary" 
                onClick={handleSave}
                disabled={isSaving || !newPassword.trim()}
              >
                {isSaving ? <Loader2 className="v-spin" size={18} /> : <Save size={18} />} 
                GUARDAR CLAVE
              </button>
            </div>
          </>
        ) : (
          /* VISTA DE ESTATUS (Estilo StatusModal integrado) */
          <div className="cln-status-card" style={{ boxShadow: 'none', margin: 0 }}>
            <div className={`cln-status-icon-box ${view}`}>
              {view === "success" ? (
                <CheckCircle size={50} color="#10B981" />
              ) : (
                <XCircle size={50} color="#EF4444" />
              )}
            </div>
            <h2 style={{ marginTop: '15px', fontWeight: '800' }}>
              {view === "success" ? "ÉXITO" : "ERROR"}
            </h2>
            <p style={{ textAlign: 'center', padding: '0 20px', color: '#666' }}>
              {view === "success" ? "CONTRASEÑA ACTUALIZADA CORRECTAMENTE" : errorMessage}
            </p>
            <div className="cln-status-footer" style={{ marginTop: '20px', width: '100%' }}>
              <button 
                className="cln-confirm-btn" 
                style={{ width: '100%' }}
                onClick={view === "success" ? handleClose : () => setView("form")}
              >
                {view === "success" ? "ACEPTAR" : "REINTENTAR"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default FormModalPass;