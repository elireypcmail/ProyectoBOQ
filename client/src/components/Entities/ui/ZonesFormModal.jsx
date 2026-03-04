import React, { useState } from "react";
import { Save, X } from "lucide-react";
import { useEntity } from "../../../context/EntityContext";

const ZonesFormModal = ({ isOpen, onClose, onCreated }) => {
  const { createNewEntity, getAllEntities } = useEntity();
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name.trim()) return;

    try {
      setIsSaving(true);

      const res = await createNewEntity("zonas", {
        nombre: name.trim().toUpperCase(),
      });

      await getAllEntities("zonas");

      onCreated?.(res.data);
      setName("");
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Nueva Zona</h3>

        <input
          className="modal-input"
          placeholder="Nombre de la zona"
          value={name}
          onChange={(e) => setName(e.target.value.toUpperCase())}
        />

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            <X size={16} /> Cancelar
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
            <Save size={16} /> Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ZonesFormModal;