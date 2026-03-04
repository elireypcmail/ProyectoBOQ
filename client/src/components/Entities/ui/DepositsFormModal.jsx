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
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 style={{ textTransform: "uppercase" }}>
            {deposit ? "Editar Depósito" : "Nuevo Depósito"}
          </h3>
          <button className="sdm-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ marginTop: "1rem" }}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label className="modal-label">NOMBRE DEL DEPÓSITO</label>
            <input
              className="modal-input"
              placeholder="EJ: DEPÓSITO PRINCIPAL"
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              style={{ textTransform: "uppercase" }}
              autoFocus
            />
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn-secondary" 
            onClick={onClose} 
            disabled={isSaving}
          >
            CANCELAR
          </button>
          <button 
            className="btn-primary" 
            onClick={handleSave} 
            disabled={isSaving || !name.trim()}
          >
            {isSaving ? <Loader2 className="sfm-spin" size={16} /> : <Save size={16} />}
            {deposit ? "ACTUALIZAR" : "GUARDAR"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepositsFormModal;