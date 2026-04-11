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
    <div className="sellerMf-overlay">
      <div className="sellerMf-content">
        <div className="sellerMf-header">
          <h3>{seller ? "Editar Vendedor" : "Nuevo Vendedor"}</h3>
          <button className="sellerMf-close-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="sellerMf-body">
          <div className="sellerMf-field">
            <label className="sellerMf-label">Nombre Completo</label>
            <input
              className="sellerMf-input"
              value={nombre}
              onChange={(e) => handleNameInput(e.target.value, setNombre)}
              placeholder="EJ: MARÍA LÓPEZ"
            />
          </div>

          <div className="sellerMf-field">
            <label className="sellerMf-label">Teléfono</label>
            <div className="sellerMf-phone-wrapper">
              <PhoneInput
                country={"ve"}
                value={telefono}
                onChange={setTelefono}
                containerClass="sellerMf-phone-container"
                inputClass="sellerMf-phone-input"
                buttonClass="sellerMf-phone-button"
                placeholder="Ingresar teléfono"
              />
            </div>
          </div>

          <div className="sellerMf-field">
            <label className="sellerMf-label">Email</label>
            <input
              className="sellerMf-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.replace(/\s/g, ""))}
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="sellerMf-field sellerMf-col-span-2">
            <label className="sellerMf-label">Oficina</label>
            <div className="sellerMf-input-group">
              <div className="sellerMf-select-container">
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
                  classNamePrefix="sellerMf-select"
                />
              </div>
              <button
                type="button"
                className="sellerMf-btn-add-circle"
                onClick={() => setIsCreatingOficina(true)}
                title="Nueva Oficina"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="sellerMf-field">
            <label className="sellerMf-label">Zona</label>
            <select
              className="sellerMf-input"
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

          <div className="sellerMf-field">
            <label className="sellerMf-label">Comisión (%)</label>
            <input
              type="text" 
              className="sellerMf-input"
              value={comision}
              onChange={(e) => handleComisionInput(e.target.value)}
              placeholder="EJ: 10,50"
            />
          </div>
        </div>

        <div className="sellerMf-footer">
          <button className="sellerMf-btn-cancel" onClick={onClose} disabled={isSaving}>
            Cancelar
          </button>
          <button className="sellerMf-btn-save" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? <Loader2 className="sellerMf-spin" size={18} /> : <Save size={18} />}
            {isSaving ? "Guardando..." : seller ? "Actualizar Vendedor" : "Guardar Vendedor"}
          </button>
        </div>

        {/* --- MINI MODAL PARA NUEVA OFICINA --- */}
        {isCreatingOficina && (
          <div className="sellerMf-mini-overlay">
            <div className="sellerMf-mini-card">
              <div className="sellerMf-mini-header">
                <Building size={20} className="sellerMf-icon-primary" />
                <h4>Nueva Oficina</h4>
              </div>
              
              <div className="sellerMf-mini-body">
                <div className="sellerMf-field">
                  <label className="sellerMf-label">Nombre de la Oficina</label>
                  <input 
                    className="sellerMf-input" 
                    placeholder="EJ: SEDE CENTRAL"
                    autoFocus
                    value={newOficina.nombre}
                    onChange={(e) => handleNameInput(e.target.value, (v) => setNewOficina({...newOficina, nombre: v}))}
                  />
                </div>
                
                <div className="sellerMf-field">
                  <label className="sellerMf-label">Zona Asignada</label>
                  <select
                    className="sellerMf-input"
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

              <div className="sellerMf-mini-footer">
                <button 
                  className="sellerMf-btn-mini-close" 
                  onClick={() => { setIsCreatingOficina(false); setNewOficina({nombre:"", id_zona:""}); }}
                >
                  <X size={16} />
                </button>
                <button 
                  className="sellerMf-btn-mini-save" 
                  disabled={isCreatingLoading || !newOficina.nombre.trim() || !newOficina.id_zona}
                  onClick={handleSaveNewOficina}
                >
                  {isCreatingLoading ? <Loader2 className="sellerMf-spin" size={16} /> : <><Check size={16} /> Guardar</>}
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