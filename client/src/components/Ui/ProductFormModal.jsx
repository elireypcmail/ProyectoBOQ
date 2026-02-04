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
    nro_serie: "",
    existencia_general: 0, // Se mantiene internamente
    costo_unitario: 0,
    precio_venta: 0,
    margen_ganancia: 0,
    stock_minimo_general: 0, // Se mantiene internamente
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
        stock_minimo_general: Number(initialData.stock_minimo_general) || 0,
        precio_venta: Number(initialData.precio_venta) || 0,
        estatus: true
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialData, isOpen]);

  // Recalcular precio siempre
  useEffect(() => {
    const costo = Number(form.costo_unitario) || 0;
    let margen = Number(form.margen_ganancia) || 0;
    margen = Math.min(Math.max(margen, 0), 100);

    const precio = costo + Math.floor((costo * margen) / 100);
    setForm(prev => ({ ...prev, precio_venta: precio }));
  }, [form.costo_unitario, form.margen_ganancia]);

  if (!isOpen) return null;

  /* =========================
      Handlers
  ========================== */
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let val = value;

    if (type === "text") {
      val = val.toUpperCase();
    } else if (type === "number") {
      // Si el campo está vacío, guardamos 0 internamente pero permitimos el string vacío para el input
      val = value === "" ? "" : Number(value);
    }

    if (name === "margen_ganancia" && val !== "") val = Math.min(Math.max(val, 0), 100);
    if (name === "costo_unitario" && val !== "") val = Math.min(val, 1_000_000);

    setForm(prev => ({ ...prev, [name]: val }));
  };

  const handleSaveNewCategory = async () => {
    if (!newCatName.trim()) return;
    const res = await onCreateCategory(newCatName.trim().toUpperCase());
    if (res?.id) setForm(prev => ({ ...prev, id_categoria: res.id }));
    setIsCreatingCat(false);
    setNewCatName("");
  };

  const handleSaveNewBrand = async () => {
    if (!newBrandName.trim()) return;
    const res = await onCreateBrand(newBrandName.trim().toUpperCase());
    if (res?.id) setForm(prev => ({ ...prev, id_marca: res.id }));
    setIsCreatingBrand(false);
    setNewBrandName("");
  };

const handleSubmit = () => {
  const usuario_id = Number(localStorage.getItem("UserId"));

  // Validación de campos obligatorios
  const requiredFields = ["descripcion", "id_categoria", "id_marca", "costo_unitario", "margen_ganancia"];
  for (let field of requiredFields) {
    if (
      form[field] === "" || 
      form[field] === null || 
      form[field] === undefined || 
      (typeof form[field] === "number" && form[field] <= 0)
    ) {
      alert(`Por favor complete el campo obligatorio: ${field.toUpperCase()}`);
      return; // No continuar con el envío
    }
  }

  // Al enviar, nos aseguramos de convertir los campos numéricos
  const finalData = {
    ...form,
    costo_unitario: Number(form.costo_unitario) || 0,
    margen_ganancia: Number(form.margen_ganancia) || 0,
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
                <label className="pfm-label">DESCRIPCIÓN</label>
                <input className="pfm-input" type="text" name="descripcion" value={form.descripcion} onChange={handleChange} />
              </div>

              <div className="pfm-field">
                <label className="pfm-label">N° SERIE</label>
                <input className="pfm-input" type="text" name="nro_serie" value={form.nro_serie} onChange={handleChange} />
              </div>

              <div className="pfm-field">
                <label className="pfm-label">CATEGORÍA</label>
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
                    <input 
                      className="pfm-input" 
                      placeholder="Nueva Categoría" 
                      value={newCatName} 
                      onChange={(e) => setNewCatName(e.target.value.toUpperCase())} 
                    />
                    <button className="pfm-btn-save-small" onClick={handleSaveNewCategory}>OK</button>
                    <button className="pfm-btn-cancel-small" onClick={() => setIsCreatingCat(false)}>X</button>
                  </div>
                )}
              </div>

              <div className="pfm-field">
                <label className="pfm-label">MARCA</label>
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
                    <input 
                      className="pfm-input" 
                      placeholder="Nueva Marca" 
                      value={newBrandName} 
                      onChange={(e) => setNewBrandName(e.target.value.toUpperCase())} 
                    />
                    <button className="pfm-btn-save-small" onClick={handleSaveNewBrand}>OK</button>
                    <button className="pfm-btn-cancel-small" onClick={() => setIsCreatingBrand(false)}>X</button>
                  </div>
                )}
              </div>

            </div>
          </div>

          <div className="pfm-section">
            <h4 className="pfm-section-title">Precios</h4>
            <div className="pfm-grid">
              <div className="pfm-field">
                <label className="pfm-label">COSTO</label>
                <input 
                  className="pfm-input" 
                  type="number" 
                  name="costo_unitario" 
                  value={form.costo_unitario === 0 ? "" : form.costo_unitario} 
                  onChange={handleChange} 
                  placeholder="0"
                />
              </div>
              <div className="pfm-field">
                <label className="pfm-label">MARGEN (%)</label>
                <input 
                  className="pfm-input" 
                  type="number" 
                  name="margen_ganancia" 
                  value={form.margen_ganancia === 0 ? "" : form.margen_ganancia} 
                  onChange={handleChange} 
                  placeholder="0"
                />
              </div>
              <div className="pfm-field">
                <label className="pfm-label">PRECIO VENTA</label>
                <input className="pfm-input pfm-input--readonly" type="number" value={form.precio_venta} disabled />
              </div>
            </div>
          </div>
        </div>

        <div className="pfm-footer">
          <button className="pfm-btn pfm-btn--secondary" onClick={handleCancel}>Cancelar</button>
          <button className="pfm-btn pfm-btn--primary" onClick={handleSubmit}><Save size={16} /> Guardar</button>
        </div>
      </div>
    </div>
  );
};

export default ProductFormModal;