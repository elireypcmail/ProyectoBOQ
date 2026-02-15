import React, { useEffect, useState, useMemo } from "react";
import Select from "react-select";
import { Save, X, Plus } from "lucide-react";
import "../../styles/ui/ProductFormModal.css";

const ProductFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  categories = [],
  brands = [],
  onCreateCategory,
  onCreateBrand
}) => {

  const emptyForm = {
    descripcion: "",
    id_categoria: "",
    id_marca: "",
    sku: "",
    existencia_general: 0,
    costo_unitario: 0,
    precio_venta: 0,
    margen_ganancia: 0,
    stock_minimo_general: 1,
    estatus: true
  };

  const [form, setForm] = useState(emptyForm);
  const [isCreatingCat, setIsCreatingCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [isCreatingBrand, setIsCreatingBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");

  const categoryOptions = useMemo(
    () => categories.map(c => ({ value: c.id, label: c.nombre })),
    [categories]
  );

  const brandOptions = useMemo(
    () => brands.map(b => ({ value: b.id, label: b.nombre })),
    [brands]
  );

  useEffect(() => {
    if (initialData) {
      setForm({
        ...emptyForm,
        ...initialData,
        existencia_general: Number(initialData.existencia_general) || 0,
        costo_unitario: Number(initialData.costo_unitario) || 0,
        margen_ganancia: Number(initialData.margen_ganancia) || 0,
        stock_minimo_general: Number(initialData.stock_minimo_general) || 1,
        precio_venta: Number(initialData.precio_venta) || 0,
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialData, isOpen]);

  // Recalcular precio automáticamente permitiendo decimales
  useEffect(() => {
    const costo = Number(form.costo_unitario) || 0;
    const margen = Number(form.margen_ganancia) || 0;
    const precio = costo + (costo * (margen / 100));
    
    // Se eliminó Math.floor para permitir decimales. 
    // toFixed(2) asegura una precisión estándar de moneda.
    setForm(prev => ({ 
      ...prev, 
      precio_venta: Number(precio.toFixed(2)) 
    }));
  }, [form.costo_unitario, form.margen_ganancia]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let val = value;

    if (type === "text") {
      val = val.toUpperCase();
    } else if (type === "number") {
      // Permitimos que el valor sea procesado como número con decimales
      val = value === "" ? "" : Number(value);
    }

    // Validaciones de límites
    if (name === "margen_ganancia" && val !== "") val = Math.min(Math.max(val, 0), 100);
    if (name === "costo_unitario" && val !== "") val = Math.min(val, 100_000_000);
    
    if (name === "stock_minimo_general" && val !== "") {
        val = Math.max(val, 1);
    }

    setForm(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = () => {
    const usuario_id = Number(localStorage.getItem("UserId"));

    const { descripcion, sku, id_categoria, id_marca, stock_minimo_general } = form;

    if (!descripcion.trim()) return alert("La descripción es obligatoria.");
    if (!sku.trim()) return alert("El SKU/N° de Serie es obligatorio.");
    if (!id_categoria) return alert("Debe seleccionar una categoría.");
    if (!id_marca) return alert("Debe seleccionar una marca.");
    if (!stock_minimo_general || stock_minimo_general < 1) {
        return alert("El stock mínimo debe ser al menos 1.");
    }

    const finalData = {
      ...form,
      costo_unitario: Number(form.costo_unitario) || 0,
      precio_venta: Number(form.precio_venta) || 0, // Aseguramos envío de decimales
      margen_ganancia: Number(form.margen_ganancia) || 0,
      stock_minimo_general: Number(form.stock_minimo_general),
      usuario_id
    };

    onSubmit(finalData);
    onClose();
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setIsCreatingCat(false);
    setIsCreatingBrand(false);
    onClose();
  };

  const selectStyles = {
    control: base => ({
      ...base,
      minHeight: 38,
      borderRadius: 6,
      borderColor: "#d1d5db",
      fontSize: "0.875rem",
    }),
    container: base => ({ ...base, flex: 1 })
  };

  return (
    <div className="pfm-overlay">
      <div className="pfm-container pfm-container--large">
        <div className="pfm-header">
          <h3 className="pfm-title">{initialData ? "Editar Producto" : "Crear Producto"}</h3>
          <button className="pfm-icon-btn" onClick={handleCancel}><X size={18} /></button>
        </div>

        <div className="pfm-body">
          <div className="pfm-section">
            <h4 className="pfm-section-title">Información básica</h4>
            <div className="pfm-grid">
              
              <div className="pfm-field">
                <label className="pfm-label">DESCRIPCIÓN *</label>
                <input className="pfm-input" type="text" name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Nombre del producto" />
              </div>

              <div className="pfm-field">
                <label className="pfm-label">SKU *</label>
                <input className="pfm-input" type="text" name="sku" value={form.sku} onChange={handleChange} placeholder="Código único" />
              </div>

              <div className="pfm-field">
                <label className="pfm-label">CATEGORÍA *</label>
                {!isCreatingCat ? (
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <Select
                      styles={selectStyles}
                      options={categoryOptions}
                      placeholder="Seleccionar..."
                      value={categoryOptions.find(o => o.value === form.id_categoria) || null}
                      onChange={opt => setForm(prev => ({ ...prev, id_categoria: opt ? opt.value : "" }))}
                    />
                    <button className="pfm-btn-add" onClick={() => setIsCreatingCat(true)}><Plus size={16}/></button>
                  </div>
                ) : (
                  <div className="pfm-new-inline">
                    <input className="pfm-input" placeholder="Nueva Categoría" value={newCatName} onChange={(e) => setNewCatName(e.target.value.toUpperCase())} />
                    <button className="pfm-btn-save-small" onClick={() => { onCreateCategory(newCatName).then(res => { if(res?.id) setForm(p => ({...p, id_categoria: res.id})); setIsCreatingCat(false); setNewCatName(""); })} }>OK</button>
                    <button className="pfm-btn-cancel-small" onClick={() => setIsCreatingCat(false)}>X</button>
                  </div>
                )}
              </div>

              <div className="pfm-field">
                <label className="pfm-label">MARCA *</label>
                {!isCreatingBrand ? (
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <Select
                      styles={selectStyles}
                      options={brandOptions}
                      placeholder="Seleccionar..."
                      value={brandOptions.find(o => o.value === form.id_marca) || null}
                      onChange={opt => setForm(prev => ({ ...prev, id_marca: opt ? opt.value : "" }))}
                    />
                    <button className="pfm-btn-add" onClick={() => setIsCreatingBrand(true)}><Plus size={16}/></button>
                  </div>
                ) : (
                  <div className="pfm-new-inline">
                    <input className="pfm-input" placeholder="Nueva Marca" value={newBrandName} onChange={(e) => setNewBrandName(e.target.value.toUpperCase())} />
                    <button className="pfm-btn-save-small" onClick={() => { onCreateBrand(newBrandName).then(res => { if(res?.id) setForm(p => ({...p, id_marca: res.id})); setIsCreatingBrand(false); setNewBrandName(""); })} }>OK</button>
                    <button className="pfm-btn-cancel-small" onClick={() => setIsCreatingBrand(false)}>X</button>
                  </div>
                )}
              </div>

              <div className="pfm-field">
                <label className="pfm-label">STOCK MÍNIMO *</label>
                <input 
                  className="pfm-input" 
                  type="number" 
                  name="stock_minimo_general" 
                  min="1"
                  value={form.stock_minimo_general} 
                  onChange={handleChange} 
                />
              </div>

            </div>
          </div>

          <div className="pfm-section">
            <h4 className="pfm-section-title">Precios y Márgenes</h4>
            <div className="pfm-grid">
              <div className="pfm-field">
                <label className="pfm-label">COSTO</label>
                <input 
                  className="pfm-input" 
                  type="number" 
                  name="costo_unitario" 
                  step="0.01"
                  value={form.costo_unitario === 0 ? "" : form.costo_unitario} 
                  onChange={handleChange} 
                  placeholder="0.00"
                />
              </div>
              <div className="pfm-field">
                <label className="pfm-label">MARGEN (%)</label>
                <input 
                  className="pfm-input" 
                  type="number" 
                  name="margen_ganancia" 
                  step="0.01"
                  value={form.margen_ganancia === 0 ? "" : form.margen_ganancia} 
                  onChange={handleChange} 
                  placeholder="0"
                />
              </div>
              <div className="pfm-field">
                <label className="pfm-label">PRECIO VENTA</label>
                <input 
                  className="pfm-input pfm-input--readonly" 
                  type="number" 
                  step="0.01"
                  value={form.precio_venta} 
                  readOnly 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pfm-footer">
          <button className="pfm-btn pfm-btn--secondary" onClick={handleCancel}>Cancelar</button>
          <button className="pfm-btn pfm-btn--primary" onClick={handleSubmit}><Save size={16} /> Guardar Producto</button>
        </div>
      </div>
    </div>
  );
};

export default ProductFormModal;