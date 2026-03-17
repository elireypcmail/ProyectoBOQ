import React, { useEffect, useState, useMemo } from "react";
import Select from "react-select";
import { Save, X, Plus, UploadCloud, XCircle } from "lucide-react"; 
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
    costo_unitario: "", 
    precio_venta: "0,00",
    margen_ganancia: "",
    stock_minimo_general: 1,
    estatus: true,
    estatus_lotes: true, 
  };

  const [form, setForm] = useState(emptyForm);
  const [selectedFiles, setSelectedFiles] = useState([]); 
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

  const parseLocaleNumber = (stringNumber) => {
    if (!stringNumber) return 0;
    return parseFloat(stringNumber.toString().replace(",", ".")) || 0;
  };

  useEffect(() => {
    if (initialData) {
      setForm({
        ...emptyForm,
        ...initialData,
        stock_minimo_general: Number(initialData.stock_minimo_general) || 1,
        costo_unitario: initialData.costo_unitario ? String(initialData.costo_unitario).replace(".", ",") : "",
        margen_ganancia: initialData.margen_ganancia ? String(initialData.margen_ganancia).replace(".", ",") : "",
        precio_venta: initialData.precio_venta ? String(initialData.precio_venta).replace(".", ",") : "0,00",
      });
    } else {
      setForm(emptyForm);
      setSelectedFiles([]); 
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    const costo = parseLocaleNumber(form.costo_unitario);
    const margen = parseLocaleNumber(form.margen_ganancia);
    let precio = costo + (costo * (margen / 100));
    
    setForm(prev => ({ 
      ...prev, 
      precio_venta: precio.toFixed(2).replace(".", ",")
    }));
  }, [form.costo_unitario, form.margen_ganancia]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let val = value;

    if (type === "text" && name !== "costo_unitario" && name !== "margen_ganancia") {
      val = val.toUpperCase();
    } else if (type === "number") {
      val = value === "" ? "" : Number(value);
    }

    if (name === "costo_unitario" || name === "margen_ganancia") {
      if (!/^[0-9,]*$/.test(val)) return; 
      
      if (name === "margen_ganancia" && val !== "") {
        const numVal = parseLocaleNumber(val);
        if (numVal > 100) val = "100";
        if (numVal < 0) val = "0";
      }
    }
    
    if (name === "stock_minimo_general" && val !== "") {
        val = Math.max(val, 1);
    }

    setForm(prev => ({ ...prev, [name]: val }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (selectedFiles.length >= 5) return alert("Máximo 5 archivos permitidos");

    const newFiles = files.slice(0, 5 - selectedFiles.length).map((file) => ({
      url: URL.createObjectURL(file),
      mime_type: file.type,
      name: file.name,
      file,
    }));
    setSelectedFiles((prev) => [...prev, ...newFiles]);
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
      costo_unitario: parseLocaleNumber(form.costo_unitario),
      precio_venta: parseLocaleNumber(form.precio_venta), 
      margen_ganancia: parseLocaleNumber(form.margen_ganancia),
      stock_minimo_general: Number(form.stock_minimo_general),
      usuario_id
    };

    onSubmit(finalData, selectedFiles.map(f => f.file));
    onClose();
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setSelectedFiles([]);
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
                <input className="pfm-input" type="number" name="stock_minimo_general" min="1" value={form.stock_minimo_general} onChange={handleChange} />
              </div>

            </div>
          </div>

          <div className="pfm-section">
            <h4 className="pfm-section-title">Precios y Márgenes</h4>
            <div className="pfm-grid">
              <div className="pfm-field">
                <label className="pfm-label">COSTO ($)</label>
                <input className="pfm-input" type="text" name="costo_unitario" value={form.costo_unitario} onChange={handleChange} placeholder="0,00" />
              </div>
              <div className="pfm-field">
                <label className="pfm-label">MARGEN (%)</label>
                <input className="pfm-input" type="text" name="margen_ganancia" value={form.margen_ganancia} onChange={handleChange} placeholder="0" />
              </div>
              <div className="pfm-field">
                <label className="pfm-label">PRECIO VENTA ($)</label>
                <input className="pfm-input pfm-input--readonly" type="text" value={form.precio_venta} readOnly />
              </div>
            </div>
          </div>

          <div className="pfm-section">
            <h4 className="pfm-section-title">Gestión de Inventario</h4>
            <div className="pfm-toggle-group">
              <button 
                type="button"
                className={`pfm-toggle-btn ${!form.estatus_lotes ? 'active' : ''}`}
                onClick={() => setForm(prev => ({ ...prev, estatus_lotes: false }))}
              >
                Sin Lotes
              </button>
              <button 
                type="button"
                className={`pfm-toggle-btn ${form.estatus_lotes ? 'active' : ''}`}
                onClick={() => setForm(prev => ({ ...prev, estatus_lotes: true }))}
              >
                Con Lotes
              </button>
            </div>
          </div>

          <div className="pfm-section">
            <h4 className="pfm-section-title">Archivos Multimedia</h4>
            <div className="pfm-field">
              <div 
                className="uploadAdm-box" 
                style={{ cursor: 'pointer', textAlign: 'center', padding: '20px', border: '2px dashed #d1d5db', borderRadius: '8px' }}
                onClick={() => document.getElementById("fileUpload").click()}
              >
                <UploadCloud size={30} style={{ margin: '0 auto', color: '#6b7280' }} />
                <span className="upload-label" style={{ display: 'block', marginTop: '10px', color: '#374151' }}>
                  Haz clic aquí para subir (Máx. 5 archivos)
                </span>
                <input id="fileUpload" type="file" multiple accept="image/*,video/*" style={{ display: 'none' }} onChange={handleFileChange} />
              </div>

              {selectedFiles.length > 0 && (
                <ul className="files_containerEdit" style={{ display: 'flex', gap: '10px', marginTop: '15px', padding: 0, listStyle: 'none', flexWrap: 'wrap' }}>
                  {selectedFiles.map((file, index) => (
                    <li key={index} className="file_itemEdit" style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                      <div className="file_order" style={{ position: 'absolute', top: '4px', left: '4px', background: 'rgba(0,0,0,0.5)', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', zIndex: 10 }}>{index + 1}</div>
                      <div className="file_background" style={{ width: '100%', height: '100%' }}>
                        {file.mime_type?.startsWith("video") 
                          ? <video src={file.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> 
                          : <img src={file.url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        }
                      </div>
                      {index === 0 && <div className="badge_portada" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'rgba(59, 130, 246, 0.8)', color: 'white', textAlign: 'center', fontSize: '10px', padding: '2px 0' }}>Portada</div>}
                      <XCircle 
                        className="cms-file-remove" 
                        color="#ef4444" 
                        size={20} 
                        style={{ position: 'absolute', top: '4px', right: '4px', cursor: 'pointer', background: 'white', borderRadius: '50%' }}
                        onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))} 
                      />
                    </li>
                  ))}
                </ul>
              )}
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