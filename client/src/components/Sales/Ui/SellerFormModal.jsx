import React, { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import PhoneInput from "react-phone-input-2";
import { Save, X, Plus, Loader2, Check, Building } from "lucide-react";
import "react-phone-input-2/lib/style.css";

import "../../../styles/ui/SellerFormModal.css";

const SellerFormModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  seller, 
  isSaving,
  oficinas = [],
  zonas = [],
  onCreateOficina 
}) => {

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [idOficina, setIdOficina] = useState("");
  const [idZona, setIdZona] = useState("");
  const [comision, setComision] = useState(""); 

  const [isCreatingOficina, setIsCreatingOficina] = useState(false);
  const [newOficina, setNewOficina] = useState({ nombre: "", id_zona: "" });
  const [isCreatingLoading, setIsCreatingLoading] = useState(false);

  useEffect(() => {
    if (seller && isOpen) {
      setNombre(seller.nombre || "");
      setTelefono(seller.telefono || "");
      setEmail(seller.email || "");
      setIdOficina(seller.id_oficina || "");
      setIdZona(seller.id_zona || "");
      setComision(seller.comision ? seller.comision.toString().replace(".", ",") : "");
    } else {
      resetLocalForm();
    }
  }, [seller, isOpen]);

  const resetLocalForm = () => {
    setNombre("");
    setTelefono("");
    setEmail("");
    setIdOficina("");
    setIdZona("");
    setComision("");
    setIsCreatingOficina(false);
    setNewOficina({ nombre: "", id_zona: "" });
  };

  const handleNameInput = (value, setter) => {
    setter(value.replace(/[^a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s]/g, "").toUpperCase());
  };

  const handleComisionInput = (value) => {
    let val = value.replace(/[^0-9,]/g, "");
    const parts = val.split(",");
    if (parts.length > 2) val = parts[0] + "," + parts[1];
    if (parts.length === 2) val = parts[0] + "," + parts[1].slice(0, 2);

    const numericValue = parseFloat(val.replace(",", "."));
    if (!isNaN(numericValue) && numericValue > 100) {
      setComision("100");
      return;
    }
    setComision(val);
  };

  const handleSaveNewOficina = async () => {
    if (!newOficina.nombre.trim() || !newOficina.id_zona) return;
    setIsCreatingLoading(true);
    try {
      const res = await onCreateOficina({
        nombre: newOficina.nombre.trim().toUpperCase(),
        id_zona: parseInt(newOficina.id_zona),
        estatus: true
      });
      const createdId = res?.id || res?.data?.id;
      if (createdId) {
        setIdOficina(createdId);
        setIdZona(newOficina.id_zona);
      }
      setIsCreatingOficina(false);
      setNewOficina({ nombre: "", id_zona: "" });
    } catch (error) {
      console.error("Error al crear oficina:", error);
    } finally {
      setIsCreatingLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!nombre.trim()) return alert("El nombre es obligatorio");
    if (!idOficina) return alert("Debe seleccionar una oficina");
    if (!idZona) return alert("Debe seleccionar una zona");
    if (!comision) return alert("Debe ingresar la comisión");

    const comisionParseada = parseFloat(comision.toString().replace(",", "."));

    const payload = {
      nombre: nombre.trim().toUpperCase(),
      telefono: telefono || null,
      email: email.trim().toLowerCase() || null,
      id_oficina: parseInt(idOficina),
      id_zona: parseInt(idZona),
      comision: comisionParseada,
      estatus: true
    };
    onSave(payload);
  };

  const oficinaOptions = useMemo(() => {
    return oficinas.map(of => ({
      value: of.id,
      label: of.nombre,
      id_zona: of.id_zona 
    }));
  }, [oficinas]);

  const currentOficinaValue = oficinaOptions.find(opt => opt.value === idOficina) || null;

  if (!isOpen) return null;

  return (
    <div className="sellerfm-overlay">
      <div className="sellerfm-content">
        <div className="sellerfm-header">
          <h3>{seller ? "Editar Vendedor" : "Nuevo Vendedor"}</h3>
          <button className="sellerfm-close-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="sellerfm-body">
          <div className="sellerfm-field">
            <label className="sellerfm-label">Nombre Completo</label>
            <input
              className="sellerfm-input"
              value={nombre}
              onChange={(e) => handleNameInput(e.target.value, setNombre)}
              placeholder="EJ: MARÍA LÓPEZ"
            />
          </div>

          <div className="sellerfm-field">
            <label className="sellerfm-label">Teléfono</label>
            <div className="sellerfm-phone-wrapper">
              <PhoneInput
                country={"ve"}
                value={telefono}
                onChange={setTelefono}
                containerClass="sellerfm-phone-container"
                inputClass="sellerfm-phone-input"
                buttonClass="sellerfm-phone-button"
                placeholder="Ingresar teléfono"
              />
            </div>
          </div>

          <div className="sellerfm-field">
            <label className="sellerfm-label">Email</label>
            <input
              className="sellerfm-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.replace(/\s/g, ""))}
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="sellerfm-field sellerfm-col-span-2">
            <label className="sellerfm-label">Oficina</label>
            <div className="sellerfm-input-group">
              <div className="sellerfm-select-container">
                <Select
                  options={oficinaOptions}
                  value={currentOficinaValue}
                  onChange={(opt) => {
                    setIdOficina(opt?.value || "");
                    if (opt?.id_zona) setIdZona(opt.id_zona);
                  }}
                  onInputChange={(inputValue, { action }) => {
                    if (action === "input-change") return inputValue.toUpperCase();
                    return inputValue;
                  }}
                  isClearable
                  placeholder="SELECCIONAR OFICINA"
                  classNamePrefix="sellerfm-select"
                />
              </div>
              <button
                type="button"
                className="sellerfm-btn-add-circle"
                onClick={() => setIsCreatingOficina(true)}
                title="Nueva Oficina"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="sellerfm-field">
            <label className="sellerfm-label">Zona</label>
            <select
              className="sellerfm-input"
              value={idZona}
              onChange={(e) => setIdZona(e.target.value)}
              disabled 
            >
              <option value="">Seleccione zona</option>
              {zonas.map(z => (
                <option key={z.id} value={z.id}>{z.nombre}</option>
              ))}
            </select>
          </div>

          <div className="sellerfm-field">
            <label className="sellerfm-label">Comisión (%)</label>
            <input
              type="text" 
              className="sellerfm-input"
              value={comision}
              onChange={(e) => handleComisionInput(e.target.value)}
              placeholder="EJ: 10,50"
            />
          </div>
        </div>

        <div className="sellerfm-footer">
          <button className="sellerfm-btn-cancel" onClick={onClose} disabled={isSaving}>
            Cancelar
          </button>
          <button className="sellerfm-btn-save" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? <Loader2 className="sellerfm-spin" size={18} /> : <Save size={18} />}
            {isSaving ? "Guardando..." : seller ? "Actualizar Vendedor" : "Guardar Vendedor"}
          </button>
        </div>

        {/* --- MINI MODAL PARA NUEVA OFICINA --- */}
        {isCreatingOficina && (
          <div className="sellerfm-mini-overlay">
            <div className="sellerfm-mini-card">
              <div className="sellerfm-mini-header">
                <Building size={20} className="sellerfm-icon-primary" />
                <h4>Nueva Oficina</h4>
              </div>
              
              <div className="sellerfm-mini-body">
                <div className="sellerfm-field">
                  <label className="sellerfm-label">Nombre de la Oficina</label>
                  <input 
                    className="sellerfm-input" 
                    placeholder="EJ: SEDE CENTRAL"
                    autoFocus
                    value={newOficina.nombre}
                    onChange={(e) => handleNameInput(e.target.value, (v) => setNewOficina({...newOficina, nombre: v}))}
                  />
                </div>
                
                <div className="sellerfm-field">
                  <label className="sellerfm-label">Zona Asignada</label>
                  <select
                    className="sellerfm-input"
                    value={newOficina.id_zona}
                    onChange={(e) => setNewOficina({...newOficina, id_zona: e.target.value})}
                  >
                    <option value="">Seleccione zona</option>
                    {zonas.map(z => (
                      <option key={z.id} value={z.id}>{z.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sellerfm-mini-footer">
                <button 
                  className="sellerfm-btn-mini-close" 
                  onClick={() => { setIsCreatingOficina(false); setNewOficina({nombre:"", id_zona:""}); }}
                >
                  <X size={16} />
                </button>
                <button 
                  className="sellerfm-btn-mini-save" 
                  disabled={isCreatingLoading || !newOficina.nombre.trim() || !newOficina.id_zona}
                  onClick={handleSaveNewOficina}
                >
                  {isCreatingLoading ? <Loader2 className="sellerfm-spin" size={16} /> : <><Check size={16} /> Guardar</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerFormModal;