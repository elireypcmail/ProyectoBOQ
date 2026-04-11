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
      <div className="pl-modal-overlay">
        <div className="pl-modal-box">
          {/* HEADER */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className="pl-modal-title" style={{ margin: 0, textTransform: 'uppercase' }}>
              {office ? "Editar Oficina" : "Nueva Oficina"}
            </h3>
            <button 
              className="pl-icon-only-btn" 
              onClick={onClose}
              style={{ color: 'var(--pl-muted)' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* BODY */}
          <div className="pl-info-list" style={{ background: 'transparent', padding: 0 }}>
            {/* NOMBRE */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="pl-modal-label">NOMBRE DE LA OFICINA</label>
              <input
                className="pl-modal-input"
                placeholder="EJ: SEDE CENTRAL"
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
                style={{ textTransform: 'uppercase', marginBottom: 0 }}
              />
            </div>

            {/* ZONA */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="pl-modal-label">ZONA ASIGNADA</label>
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
                  className="pl-btn-secondary"
                  type="button"
                  onClick={() => setIsCreateZoneOpen(true)}
                  style={{ height: "38px", padding: "0 10px" }}
                  title="NUEVA ZONA"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* DEPÓSITO */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="pl-modal-label">DEPÓSITO VINCULADO</label>
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
                  className="pl-btn-secondary"
                  type="button"
                  onClick={() => setIsCreateDepositOpen(true)}
                  style={{ height: "38px", padding: "0 10px" }}
                  title="NUEVO DEPÓSITO"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="pl-modal-footer">
            <button 
              className="pl-btn-secondary-outline" 
              onClick={onClose} 
              disabled={isSaving}
              style={{ textTransform: 'uppercase' }}
            >
              CANCELAR
            </button>
            <button 
              className="pl-btn-action" 
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