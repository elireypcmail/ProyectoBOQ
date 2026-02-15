import React, { useEffect, useState, useMemo } from "react";
import Select from "react-select";
import { Plus, Save, X } from "lucide-react";
import { usePurchases } from "../../../../context/PurchasesContext";
import "../../../../styles/ui/steps/StepInfo.css"

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const StepInfo = ({ formData, setFormData, onValidationChange }) => {
  const { suppliers, getAllSuppliers, createNewSupplier } = usePurchases();

  const [isCreateSupplierOpen, setIsCreateSupplierOpen] = useState(false);
  const [newSup, setNewSup] = useState({
    nombre: "",
    documento: "",
    telefono: "",
    email: "",
  });

  useEffect(() => {
    if (suppliers.length === 0) getAllSuppliers();
  }, []);

  // --- LÓGICA DE CÁLCULO DE VENCIMIENTO ---
  useEffect(() => {
    if (formData.fecha_emision) {
      // Usamos una copia de la fecha para no mutar el original
      const fecha = new Date(formData.fecha_emision + 'T00:00:00'); 
      // Si dias_plazo es vacío o 0, sumamos 0
      const dias = parseInt(formData.dias_plazo) || 0;
      
      fecha.setDate(fecha.getDate() + dias);
      
      const yyyy = fecha.getFullYear();
      const mm = String(fecha.getMonth() + 1).padStart(2, '0');
      const dd = String(fecha.getDate()).padStart(2, '0');
      
      const fechaVencimiento = `${yyyy}-${mm}-${dd}`;
      
      if (formData.fecha_vencimiento !== fechaVencimiento) {
        setFormData(prev => ({ ...prev, fecha_vencimiento: fechaVencimiento }));
      }
    }
  }, [formData.fecha_emision, formData.dias_plazo, setFormData]);

  // --- LÓGICA DE VALIDACIÓN ---
  useEffect(() => {
    const isValid =
      formData.nro_factura?.trim() !== "" &&
      formData.id_proveedor !== "" && 
      formData.rif?.trim() !== "" &&
      formData.fecha_emision !== "";

    if (onValidationChange) onValidationChange(isValid);
  }, [formData, onValidationChange]);

  const supplierOptions = useMemo(() => {
    return (suppliers || []).map((s) => ({
      value: s.id,
      label: s.nombre,
      documento: s.documento,
    }));
  }, [suppliers]);

  const currentSupplierValue = useMemo(() => {
    return (
      supplierOptions.find(
        (opt) => opt.value === parseInt(formData.id_proveedor),
      ) || null
    );
  }, [formData.id_proveedor, supplierOptions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Permitir vacío para campos numéricos como dias_plazo
    if (name === "dias_plazo" && value === "") {
        setFormData((prev) => ({ ...prev, [name]: "" }));
        return;
    }

    const upperCaseFields = ["nro_factura", "rif"];
    const finalValue = upperCaseFields.includes(name)
      ? value.toUpperCase()
      : value;

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleSelectChange = (option) => {
    setFormData((prev) => ({
      ...prev,
      id_proveedor: option ? option.value : "",
      proveedor: option ? option.label : "",
      rif: option && option.documento ? option.documento.toUpperCase() : "",
    }));
  };

  const handleSaveNewSupplier = async () => {
    if (!newSup.nombre || !newSup.documento)
      return alert("Nombre y Documento son requeridos");

    const payload = {
      ...newSup,
      nombre: newSup.nombre.trim().toUpperCase(),
      documento: newSup.documento.trim().toUpperCase(),
      email: newSup.email?.toLowerCase().trim() || null,
      estatus: true,
    };

    const res = await createNewSupplier(payload);
    if (res.status) {
      setFormData((prev) => ({
        ...prev,
        id_proveedor: res.data.id,
        proveedor: res.data.nombre.toUpperCase(),
        rif: res.data.documento.toUpperCase(),
      }));
      setIsCreateSupplierOpen(false);
      setNewSup({ nombre: "", documento: "", telefono: "", email: "" });
    }
  };

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      borderRadius: "8px",
      borderColor: "#e2e8f0",
      minHeight: "45px",
      boxShadow: "none",
      "&:hover": { borderColor: "#cbd5e1" },
    }),
    menu: (base) => ({ ...base, borderRadius: "8px", zIndex: 9999 }),
  };

  return (
    <section className="pform-section-white">
      <div className="section-header">
        <h3>Información de la Compra</h3>
        <p>Datos de factura y selección de proveedor</p>
      </div>

      <div className="pform-form-grid">
        <div className="pform-group col-span-1">
          <label>Nro. Factura <span className="required">*</span></label>
          <input
            name="nro_factura"
            value={formData.nro_factura}
            onChange={handleChange}
            placeholder="INV-001"
            required
          />
        </div>

        <div className="pform-group col-span-2">
          <label>Proveedor <span className="required">*</span></label>
          <div style={{ display: "flex", gap: "8px" }}>
            <div style={{ flex: 1 }}>
              <Select
                options={supplierOptions}
                value={currentSupplierValue}
                onChange={handleSelectChange}
                placeholder="BUSCAR PROVEEDOR..."
                isClearable
                isSearchable
                styles={customSelectStyles}
                onInputChange={(newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    proveedor_search: newValue.toUpperCase(),
                  }));
                }}
              />
            </div>
            <button
              type="button"
              className="pfm-btn-add"
              onClick={() => setIsCreateSupplierOpen(true)}
              style={{
                padding: "0 12px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        <div className="pform-group col-span-1">
          <label>Identificación Proveedor</label>
          <input
            name="rif"
            value={formData.rif}
            readOnly
            placeholder="J-00000000"
            className="input-disabled"
          />
        </div>

        <div className="pform-group col-span-1">
          <label>Fecha Emisión <span className="required">*</span></label>
          <input
            type="date"
            name="fecha_emision"
            value={formData.fecha_emision}
            onChange={handleChange}
            required
          />
        </div>

        <div className="pform-group col-span-1">
          <label>Días de Plazo</label>
          <input
            type="number"
            name="dias_plazo"
            // Lógica para no mostrar el 0 por defecto
            value={formData.dias_plazo === 0 || formData.dias_plazo === "0" ? "" : formData.dias_plazo}
            onChange={handleChange}
            placeholder="0"
            min="0"
          />
        </div>

        <div className="pform-group col-span-1">
          <label>Vencimiento</label>
          <input
            type="date"
            value={formData.fecha_vencimiento || ""}
            readOnly
            className="input-disabled"
            style={{ backgroundColor: "#f8fafc", color: "#64748b" }}
          />
        </div>
      </div>

      {/* MODAL DE NUEVO PROVEEDOR */}
      {isCreateSupplierOpen && (
        <div className="pform-submodal-overlay">
          <div className="pform-search-box-modal" style={{ maxWidth: "450px" }}>
            <header className="psbm-header">
              <h3>Nuevo Proveedor</h3>
              <button onClick={() => setIsCreateSupplierOpen(false)}><X size={20} /></button>
            </header>
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <input 
                placeholder="Nombre" 
                value={newSup.nombre} 
                onChange={(e) => setNewSup({...newSup, nombre: e.target.value.toUpperCase()})}
              />
              <input 
                placeholder="Documento" 
                value={newSup.documento} 
                onChange={(e) => setNewSup({...newSup, documento: e.target.value.toUpperCase()})}
              />
              <div className="modal-footer">
                <button onClick={handleSaveNewSupplier} className="btn-next-step"><Save size={16} /> Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default StepInfo;