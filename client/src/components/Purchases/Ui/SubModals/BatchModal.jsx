import React, { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import { X, Plus, Calendar, Hash, Trash2, Package, Warehouse, Save, Edit3 } from "lucide-react";
import { useProducts } from "../../../../context/ProductsContext";
import "../../../../styles/ui/subModals/BatchModal.css";

const BatchModal = ({ product, onClose, items = [], setItems }) => {
  const { deposits, getAllDeposits } = useProducts();
  const [editingId, setEditingId] = useState(null);

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

  // Cálculo del límite real permitido en el input
  const currentInputLimit = useMemo(() => {
    const editingQty = editingId 
      ? parseFloat(currentBatches.find(l => l.id_temp === editingId)?.cantidad || 0) 
      : 0;
    return remainingQuantity + editingQty;
  }, [remainingQuantity, editingId, currentBatches]);

  const depositOptions = useMemo(() => {
    return (deposits || []).map(d => ({
      value: d.id,
      label: d.nombre
    }));
  }, [deposits]);

  const formatNumber = (num) => {
    return num.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleQuantityChange = (e) => {
    const val = e.target.value;
    if (val.length > 9) return;
    
    const numVal = parseFloat(val);
    if (!isNaN(numVal) && numVal > currentInputLimit) {
        setFormData({ ...formData, cantidad: currentInputLimit.toString() });
        return;
    }
    setFormData({ ...formData, cantidad: val });
  };

  const handleEditClick = (lote) => {
    setEditingId(lote.id_temp);
    setFormData({
      nro_lote: lote.nro_lote,
      id_deposito: lote.id_deposito,
      cantidad: lote.cantidad.toString(),
      fecha_vencimiento: lote.fecha_vencimiento
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ nro_lote: "", id_deposito: "", cantidad: "", fecha_vencimiento: "" });
  };

  const handleAddLoteLocal = (e) => {
    e.preventDefault();
    const { nro_lote, id_deposito, cantidad, fecha_vencimiento } = formData;

    if (!nro_lote.trim() || !id_deposito || !fecha_vencimiento || !cantidad) {
      return alert("Error: Todos los campos del lote son obligatorios.");
    }

    const numCantidad = parseFloat(cantidad);
    if (numCantidad <= 0) return alert("Error: La cantidad debe ser mayor a 0.");

    const cleanLoteName = nro_lote.trim().toUpperCase();
    const depositoCompleto = deposits.find(d => d.id === Number(id_deposito));

    let updatedLotesCompra;

    if (editingId) {
      // Modo Edición
      updatedLotesCompra = currentBatches.map(l => 
        l.id_temp === editingId 
          ? { ...formData, nro_lote: cleanLoteName, deposito_nombre: depositoCompleto?.nombre, info_deposito: depositoCompleto, id_temp: editingId } 
          : l
      );
    } else {
      // Modo Nuevo (con unificación)
      const existingLoteIndex = currentBatches.findIndex(
        l => l.id_deposito === id_deposito && 
             l.nro_lote === cleanLoteName && 
             l.fecha_vencimiento === fecha_vencimiento
      );

      if (existingLoteIndex !== -1) {
        updatedLotesCompra = [...currentBatches];
        const existingLote = updatedLotesCompra[existingLoteIndex];
        updatedLotesCompra[existingLoteIndex] = {
          ...existingLote,
          cantidad: (parseFloat(existingLote.cantidad) + numCantidad).toString()
        };
      } else {
        const nuevoLote = {
          ...formData,
          nro_lote: cleanLoteName,
          deposito_nombre: depositoCompleto?.nombre, 
          info_deposito: depositoCompleto,
          id_temp: Date.now()
        };
        updatedLotesCompra = [...currentBatches, nuevoLote];
      }
    }

    const updatedItems = items.map((item) => {
      const isSameProduct = (item.id === product.id) || (item.id_producto === product.id_producto);
      return isSameProduct ? { ...item, lotes_compra: updatedLotesCompra } : item;
    });

    setItems(updatedItems);
    handleCancelEdit();
  };

  const removeLoteLocal = (idTemp) => {
    if (editingId === idTemp) handleCancelEdit();
    const updatedItems = items.map((item) => {
      const isSameProduct = (item.id === product.id) || (item.id_producto === product.id_producto);
      return isSameProduct ? { ...item, lotes_compra: (item.lotes_compra || []).filter(l => l.id_temp !== idTemp) } : item;
    });
    setItems(updatedItems);
  };

  const handleFinalizeDistribution = () => {
    if (currentBatches.length === 0) return alert("Debe asignar al menos un lote.");
    if (remainingQuantity > 0.01) {
        if(!window.confirm(`Aún quedan ${formatNumber(remainingQuantity)} unidades. ¿Guardar así?`)) return;
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

  return (
    <div className="bm-overlay">
      <div className="bm-container">
        <header className="bm-header">
          <div className="bm-header-info">
            <h3 className="bm-title">{editingId ? "Editando Lote" : "Fraccionar Lotes"}</h3>
            <span className="bm-product-name">{displayProduct.descripcion || displayProduct.nombre}</span>
          </div>
          <button className="bm-btn-close" onClick={onClose}>
            <X size={24} />
          </button>
        </header>

        <div className="bm-content-grid">
          <div className="bm-card">
            <h4 className="bm-card-title">
              {editingId ? <Edit3 size={18} /> : <Plus size={18} />} 
              {editingId ? " Modificar Datos" : " Datos del Lote"}
            </h4>
            
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
                  Límite: {formatNumber(currentInputLimit)}
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '15px' }}>
              <button
                className="bm-btn-add"
                onClick={handleAddLoteLocal}
                disabled={currentInputLimit <= 0 && !editingId}
              >
                {editingId ? "Actualizar Lote" : "Asignar a la Lista"}
              </button>
              
              {editingId && (
                <button className="bm-btn-cancel" onClick={handleCancelEdit}>
                  Cancelar Edición
                </button>
              )}
            </div>
          </div>

          <div className="bm-card">
            <h4 className="bm-card-title">Resumen de Distribución</h4>
            <div className="bm-summary-item bm-summary-info">
              <span>Total Producto:</span> <strong>{formatNumber(maxQuantity)}</strong>
            </div>
            <div className="bm-summary-item bm-summary-success">
              <span>Asignado:</span> <strong>{formatNumber(allocatedQuantity)}</strong>
            </div>
            <div className="bm-summary-item">
              <span>Pendiente:</span>
              <strong className={remainingQuantity > 0.01 ? "bm-text-danger" : "bm-text-success"}>
                {formatNumber(remainingQuantity)}
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
                <tr key={l.id_temp} className={editingId === l.id_temp ? "row-editing" : ""}>
                  <td><strong className="bm-td-lote">#{l.nro_lote}</strong></td>
                  <td>{l.deposito_nombre}</td>
                  <td className="bm-text-center">{formatNumber(parseFloat(l.cantidad))}</td>
                  <td className="bm-text-center">
                    {l.fecha_vencimiento ? new Date(l.fecha_vencimiento + 'T00:00:00').toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="bm-text-center">
                    <div className="bm-actions-flex">
                      <button className="bm-btn-icon" onClick={() => handleEditClick(l)} title="Editar">
                        <Edit3 size={16} />
                      </button>
                      <button className="bm-btn-delete" onClick={() => removeLoteLocal(l.id_temp)} title="Eliminar">
                        <Trash2 size={16} />
                      </button>
                    </div>
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