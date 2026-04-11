import React, { useState, useEffect } from "react";
import { Save, X, Loader2 } from "lucide-react";
import { useEntity } from "../../../context/EntityContext";

const DepositsFormModal = ({ isOpen, onClose, deposit = null }) => {
  const { createNewEntity, editedEntity, getAllEntities } = useEntity();
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(deposit ? deposit.nombre : "");
    }
  }, [deposit, isOpen]);

  const handleSave = async () => {
    if (!name.trim()) return;

    try {
      setIsSaving(true);
      const payload = { nombre: name.trim().toUpperCase() };

      if (deposit?.id) {
        await editedEntity("depositos", deposit.id, payload);
      } else {
        await createNewEntity("depositos", payload);
      }

      await getAllEntities("depositos");
      onClose();
    } catch (error) {
      console.error("ERROR AL GUARDAR DEPÓSITO:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="pl-modal-overlay">
      <div className="pl-modal-box">
        {/* CABECERA */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 className="pl-modal-title" style={{ margin: 0, textTransform: "uppercase" }}>
            {deposit ? "Editar Depósito" : "Nuevo Depósito"}
          </h3>
          <button 
            className="pl-icon-only-btn" 
            onClick={onClose}
            style={{ color: 'var(--pl-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* CUERPO */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label className="pl-modal-label">NOMBRE DEL DEPÓSITO</label>
          <input
            className="pl-modal-input"
            placeholder="EJ: DEPÓSITO PRINCIPAL"
            value={name}
            onChange={(e) => setName(e.target.value.toUpperCase())}
            style={{ textTransform: "uppercase", marginBottom: 0 }}
            autoFocus
          />
        </div>

        {/* PIE DE MODAL */}
        <div className="pl-modal-footer">
          <button 
            className="pl-btn-secondary-outline" 
            onClick={onClose} 
            disabled={isSaving}
          >
            CANCELAR
          </button>
          <button 
            className="pl-btn-action" 
            onClick={handleSave} 
            disabled={isSaving || !name.trim()}
          >
            {isSaving ? (
              <Loader2 className="sfm-spin" size={16} />
            ) : (
              <Save size={16} />
            )}
            {deposit ? "ACTUALIZAR" : "GUARDAR"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepositsFormModal;