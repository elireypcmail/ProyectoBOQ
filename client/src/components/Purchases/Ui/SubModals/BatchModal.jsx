import React, { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import { X, Plus, Calendar, Hash, Trash2, Package, Warehouse, Save } from "lucide-react";
import { useProducts } from "../../../../context/ProductsContext";
import "../../../../styles/ui/subModals/BatchModal.css";

const BatchModal = ({ product, onClose, items = [], setItems }) => {
  const { deposits, getAllDeposits } = useProducts();

  useEffect(() => {
    getAllDeposits();
  }, []);

  const currentProductEntry = useMemo(() => {
    return items.find(item =>
      (item.id && item.id === product?.id) ||
      (item.id_producto && item.id_producto === product?.id_producto)
    );
  }, [items, product]);

  const displayProduct = currentProductEntry || product;
  const maxQuantity = parseFloat(displayProduct?.cantidad) || 0;
  const currentBatches = displayProduct?.lotes_compra || [];

  const allocatedQuantity = currentBatches.reduce((acc, b) => acc + parseFloat(b.cantidad || 0), 0);
  const remainingQuantity = maxQuantity - allocatedQuantity;
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    nro_lote: "",
    id_deposito: "",
    cantidad: "",
    fecha_vencimiento: "",
  });

  const depositOptions = useMemo(() => {
    return (deposits || []).map(d => ({
      value: d.id,
      label: d.nombre
    }));
  }, [deposits]);

  const handleQuantityChange = (e) => {
    const val = e.target.value;
    if (val.length > 9) return;
    const numVal = parseFloat(val);
    if (!isNaN(numVal) && numVal > remainingQuantity) {
        setFormData({ ...formData, cantidad: remainingQuantity.toString() });
        return;
    }
    setFormData({ ...formData, cantidad: val });
  };

  const handleAddLoteLocal = (e) => {
    e.preventDefault();
    const { nro_lote, id_deposito, cantidad, fecha_vencimiento } = formData;

    if (!nro_lote.trim() || !id_deposito || !fecha_vencimiento || !cantidad) {
      return alert("Error: Todos los campos del lote son obligatorios.");
    }

    const numCantidad = parseFloat(cantidad);
    if (numCantidad <= 0) return alert("Error: La cantidad debe ser mayor a 0.");

    if (numCantidad > (remainingQuantity + 0.0001)) {
      return alert(`Error: La cantidad excede el pendiente disponible.`);
    }

    const cleanLoteName = nro_lote.trim().toUpperCase();

    // --- LÓGICA DE UNIFICACIÓN ESTRICTA ---
    // Buscamos un registro donde coincidan: Lote AND Depósito AND Fecha Vencimiento
    const existingLoteIndex = currentBatches.findIndex(
      l => l.id_deposito === id_deposito && 
           l.nro_lote === cleanLoteName && 
           l.fecha_vencimiento === fecha_vencimiento
    );

    let updatedLotesCompra;

    if (existingLoteIndex !== -1) {
      // Si los TRES son iguales, sumamos cantidad
      updatedLotesCompra = [...currentBatches];
      const existingLote = updatedLotesCompra[existingLoteIndex];
      updatedLotesCompra[existingLoteIndex] = {
        ...existingLote,
        cantidad: (parseFloat(existingLote.cantidad) + numCantidad).toString()
      };
    } else {
      // Si alguno es diferente, es un nuevo ítem en la lista
      const depoName = deposits.find(d => d.id === Number(id_deposito))?.nombre;
      const nuevoLote = {
        ...formData,
        nro_lote: cleanLoteName,
        deposito_nombre: depoName,
        id_temp: Date.now()
      };
      updatedLotesCompra = [...currentBatches, nuevoLote];
    }

    const updatedItems = items.map((item) => {
      const isSameProduct = (item.id === product.id) || (item.id_producto === product.id_producto);
      return isSameProduct ? { ...item, lotes_compra: updatedLotesCompra } : item;
    });

    setItems(updatedItems);
    setFormData({ nro_lote: "", id_deposito: "", cantidad: "", fecha_vencimiento: "" });
  };

  const removeLoteLocal = (idTemp) => {
    const updatedItems = items.map((item) => {
      const isSameProduct = (item.id === product.id) || (item.id_producto === product.id_producto);
      return isSameProduct ? { ...item, lotes_compra: (item.lotes_compra || []).filter(l => l.id_temp !== idTemp) } : item;
    });
    setItems(updatedItems);
  };

  const handleFinalizeDistribution = () => {
    if (currentBatches.length === 0) return alert("Debe asignar al menos un lote.");
    if (remainingQuantity > 0.01) {
       if(!window.confirm(`Aún quedan ${remainingQuantity.toFixed(2)} unidades. ¿Guardar así?`)) return;
    }
    onClose();
  };

  const selectStyles = {
    control: base => ({
      ...base,
      borderRadius: "8px",
      borderColor: "#e2e8f0",
      minHeight: "38px",
      boxShadow: "none",
      fontSize: "0.9rem"
    })
  };

  if (!product) return null;

  // Determinar si el botón debe decir "Sumar" o "Asignar"
  const isMatchFound = currentBatches.some(
    l => l.id_deposito === formData.id_deposito && 
         l.nro_lote === formData.nro_lote.trim().toUpperCase() &&
         l.fecha_vencimiento === formData.fecha_vencimiento
  );

  return (
    <div className="bm-overlay">
      <div className="bm-container">
        <header className="bm-header">
          <div className="bm-header-info">
            <h3 className="bm-title">Fraccionar Lotes</h3>
            <span className="bm-product-name">{displayProduct.descripcion || displayProduct.nombre}</span>
          </div>
          <button className="bm-btn-close" onClick={onClose}>
            <X size={24} />
          </button>
        </header>

        <div className="bm-content-grid">
          <div className="bm-card">
            <h4 className="bm-card-title"><Plus size={18} /> Datos del Lote</h4>
            
            <div className="bm-form-grid">
              <div className="bm-form-group" style={{ gridColumn: "1 / -1" }}>
                <label><Hash size={14} /> Nro. Lote</label>
                <input
                  className="bm-input"
                  type="text"
                  value={formData.nro_lote}
                  onChange={e => setFormData({ ...formData, nro_lote: e.target.value.toUpperCase() })}
                  placeholder="EJ: LOT-2024"
                />
              </div>

              <div className="bm-form-group" style={{ gridColumn: "1 / -1", marginBottom: "10px" }}>
                <label><Warehouse size={14} /> Depósito</label>
                <Select
                  options={depositOptions}
                  styles={selectStyles}
                  placeholder="Seleccione..."
                  value={depositOptions.find(o => o.value === formData.id_deposito) || null}
                  onChange={opt => setFormData({ ...formData, id_deposito: opt ? opt.value : "" })}
                  isClearable
                />
              </div>

              <div className="bm-form-group">
                <label><Package size={14} /> Cantidad</label>
                <input
                  className="bm-input"
                  type="number"
                  value={formData.cantidad}
                  onChange={handleQuantityChange}
                  placeholder="0.00"
                />
                <small style={{ fontSize: '0.65rem', color: '#64748b' }}>
                  Máx: {remainingQuantity.toFixed(2)}
                </small>
              </div>

              <div className="bm-form-group">
                <label><Calendar size={14} /> Vencimiento</label>
                <input
                  className="bm-input"
                  type="date"
                  min={today}
                  value={formData.fecha_vencimiento}
                  onChange={e => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
                />
              </div>
            </div>

            <button
              className="bm-btn-add"
              onClick={handleAddLoteLocal}
              disabled={remainingQuantity <= 0}
              style={{ marginTop: "15px" }}
            >
              {isMatchFound ? "Sumar a lote existente" : "Asignar a la Lista"}
            </button>
          </div>

          <div className="bm-card">
            <h4 className="bm-card-title">Resumen de Distribución</h4>
            <div className="bm-summary-item bm-summary-info">
              <span>Total Producto:</span> <strong>{maxQuantity.toLocaleString()}</strong>
            </div>
            <div className="bm-summary-item bm-summary-success">
              <span>Asignado:</span> <strong>{allocatedQuantity.toLocaleString()}</strong>
            </div>
            <div className="bm-summary-item">
              <span>Pendiente:</span>
              <strong className={remainingQuantity > 0.01 ? "bm-text-danger" : "bm-text-success"}>
                {remainingQuantity.toFixed(2)}
              </strong>
            </div>
          </div>
        </div>

        <div className="bm-table-wrapper">
          <table className="bm-table">
            <thead>
              <tr>
                <th>Lote</th>
                <th>Depósito</th>
                <th className="bm-text-center">Cant.</th>
                <th className="bm-text-center">Venc.</th>
                <th className="bm-text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {currentBatches.map((l) => (
                <tr key={l.id_temp}>
                  <td><strong className="bm-td-lote">#{l.nro_lote}</strong></td>
                  <td>{l.deposito_nombre}</td>
                  <td className="bm-text-center">{parseFloat(l.cantidad).toLocaleString()}</td>
                  <td className="bm-text-center">
                    {l.fecha_vencimiento ? new Date(l.fecha_vencimiento + 'T00:00:00').toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="bm-text-center">
                    <button className="bm-btn-delete" onClick={() => removeLoteLocal(l.id_temp)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {currentBatches.length === 0 && (
                <tr><td colSpan="5" className="bm-table-empty">No hay lotes asignados.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="bm-footer">
          <button className="bm-btn-save" onClick={handleFinalizeDistribution} disabled={currentBatches.length === 0}>
            <Save size={18} /> Confirmar Distribución
          </button>
        </footer>
      </div>
    </div>
  );
};

export default BatchModal;