import React, { useState, useMemo, useEffect } from "react";
import Select from "react-select";
import { Save, X, Plus, Loader2 } from "lucide-react";
import { useEntity } from "../../../context/EntityContext";
import ZonesFormModal from "./ZonesFormModal";
import DepositsFormModal from "./DepositsFormModal";

const OfficesFormModal = ({ isOpen, onClose, office = null }) => {
  // ================= HOOKS =================
  const { entities, createNewEntity, editedEntity, getAllEntities } = useEntity();

  // Data from context
  const zones = entities?.zonas || [];
  const depositos = entities?.depositos || []; // CHECK: Ensure the key is exactly 'depositos'

  // Form State
  const [name, setName] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [depositoId, setDepositoId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  // Sub-modals State
  const [isCreateZoneOpen, setIsCreateZoneOpen] = useState(false);
  const [isCreateDepositOpen, setIsCreateDepositOpen] = useState(false);

  // ================= DEBUG & AUTO-FETCH =================
  useEffect(() => {
    if (isOpen) {
      // Debug: Check what keys exist in entities if deposits are missing
      if (!entities?.depositos) {
        console.log("Current entity keys:", Object.keys(entities || {}));
      }

      // Auto-fetch if data is missing
      if (zones.length === 0) getAllEntities("zonas");
      if (depositos.length === 0) getAllEntities("depositos");
    }
  }, [isOpen, entities, zones.length, depositos.length, getAllEntities]);

  // ================= DATA POPULATION =================
  useEffect(() => {
    if (isOpen) {
      if (office) {
        setName(office.nombre || "");
        setZoneId(office.id_zona || "");
        setDepositoId(office.id_deposito || "");
      } else {
        setName("");
        setZoneId("");
        setDepositoId("");
      }
    }
  }, [office, isOpen]);

  // ================= SELECT OPTIONS =================
  const zoneOptions = useMemo(
    () => zones.map((z) => ({
      value: z.id,
      label: z.nombre?.toUpperCase() || "SIN NOMBRE"
    })),
    [zones]
  );

  const depositoOptions = useMemo(
    () => depositos.map((d) => ({
      value: d.id,
      label: d.nombre?.toUpperCase() || "SIN NOMBRE"
    })),
    [depositos]
  );

  // ================= SELECT STYLES =================
  const selectStyles = {
    control: (base) => ({
      ...base,
      borderRadius: "8px",
      minHeight: "45px",
      borderColor: "var(--border)",
      textTransform: "uppercase",
      fontSize: "0.9rem",
      boxShadow: "none",
      "&:hover": { borderColor: "var(--primary)" }
    }),
    option: (base) => ({
      ...base,
      textTransform: "uppercase",
      fontSize: "0.85rem",
    }),
    singleValue: (base) => ({
      ...base,
      textTransform: "uppercase",
      color: "var(--text-main)"
    }),
    placeholder: (base) => ({
      ...base,
      textTransform: "uppercase",
      fontSize: "0.85rem",
    })
  };

  // ================= FUNCTIONS =================
  const handleSave = async () => {
    if (!name.trim() || !zoneId || !depositoId) {
      alert("POR FAVOR COMPLETE TODOS LOS CAMPOS OBLIGATORIOS");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        nombre: name.trim().toUpperCase(),
        id_zona: zoneId,
        id_deposito: depositoId,
        estatus: office ? office.estatus : true
      };

      if (office?.id) {
        await editedEntity("oficinas", office.id, payload);
      } else {
        await createNewEntity("oficinas", payload);
      }

      await getAllEntities("oficinas");
      onClose();
    } catch (error) {
      console.error("ERROR AL GUARDAR OFICINA:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-content">
          {/* HEADER */}
          <div className="modal-header">
            <h3 style={{ textTransform: 'uppercase' }}>
              {office ? "EDITAR OFICINA" : "NUEVA OFICINA"}
            </h3>
            <button className="sdm-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          {/* BODY */}
          <div className="modal-body" style={{ marginTop: '1rem' }}>
            {/* NAME */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="modal-label">NOMBRE DE LA OFICINA</label>
              <input
                className="modal-input"
                placeholder="EJ: SEDE CENTRAL"
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            {/* ZONE */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="modal-label">ZONA ASIGNADA</label>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <Select
                    options={zoneOptions}
                    value={zoneOptions.find((z) => z.value === zoneId) || null}
                    onChange={(opt) => setZoneId(opt?.value || "")}
                    placeholder="SELECCIONAR ZONA..."
                    isSearchable
                    styles={selectStyles}
                  />
                </div>
                <button
                  className="btn-add-zone-primary"
                  type="button"
                  onClick={() => setIsCreateZoneOpen(true)}
                  style={{ height: "45px", minWidth: "50px" }}
                  title="NUEVA ZONA"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* DEPOSIT */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="modal-label">DEPÓSITO VINCULADO</label>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <Select
                    options={depositoOptions}
                    value={depositoOptions.find((d) => d.value === depositoId) || null}
                    onChange={(opt) => setDepositoId(opt?.value || "")}
                    placeholder="SELECCIONAR DEPÓSITO..."
                    isSearchable
                    styles={selectStyles}
                  />
                </div>
                <button
                  className="btn-add-zone-primary"
                  type="button"
                  onClick={() => setIsCreateDepositOpen(true)}
                  style={{ height: "45px", minWidth: "50px" }}
                  title="NUEVO DEPÓSITO"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="modal-footer">
            <button 
              className="btn-secondary" 
              onClick={onClose} 
              disabled={isSaving}
              style={{ textTransform: 'uppercase' }}
            >
              CANCELAR
            </button>
            <button 
              className="btn-primary" 
              onClick={handleSave} 
              disabled={isSaving}
              style={{ textTransform: 'uppercase' }}
            >
              {isSaving ? <Loader2 className="sfm-spin" size={16} /> : <Save size={16} />}
              {office ? "ACTUALIZAR" : "GUARDAR"}
            </button>
          </div>
        </div>
      </div>

      {/* SUB-MODALS */}
      <ZonesFormModal
        isOpen={isCreateZoneOpen}
        onClose={() => setIsCreateZoneOpen(false)}
        onCreated={(zone) => {
          setZoneId(zone.id);
          getAllEntities("zonas"); 
        }}
      />

      <DepositsFormModal
        isOpen={isCreateDepositOpen}
        onClose={() => setIsCreateDepositOpen(false)}
        onCreated={(deposito) => {
          setDepositoId(deposito.id);
          getAllEntities("depositos");
        }}
      />
    </>
  );
};

export default OfficesFormModal;