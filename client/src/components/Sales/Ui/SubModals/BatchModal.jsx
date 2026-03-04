import React, { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import { X, Plus, Calendar, Trash2, Package, Save, Info, Edit3, Hash } from "lucide-react";
import { useProducts } from "../../../../context/ProductsContext";
import "../../../../styles/ui/subModals/BatchModal.css";

const BatchModal = ({ product, onClose, items = [], setItems }) => {
  const { lotes, getAllLotesByProd } = useProducts();
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    id_lote: "",
    id_deposito: "",
    nro_lote: "",
    cantidad: "",
    fecha_vencimiento: "",
    deposito_nombre: ""
  });

  /* ===================== CARGA DE DATOS ===================== */
  useEffect(() => {
    const loadBatchData = async () => {
      const productId = product?.id || product?.id_producto;
      if (productId) {
        setIsLoading(true);
        await getAllLotesByProd(productId);
        setIsLoading(false);
      }
    };
    loadBatchData();
  }, [product]);

  /* ===================== CÁLCULOS DE ESTADO ===================== */
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

  const formatNumber = (num) => {
    if (num === undefined || num === null) return "0,00";
    return Number(num).toLocaleString('es-VE', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const batchOptions = useMemo(() => {
    return (lotes || [])
      .filter(l => parseFloat(l.cantidad) > 0 || editingId) 
      .map(l => ({
        value: l.id,
        label: `Lote: ${l.nro_lote} - ${l.deposito_nombre} (Stock: ${formatNumber(l.cantidad)})`,
        existencia: parseFloat(l.cantidad || 0),
        nombre_deposito: l.deposito_nombre,
        id_deposito: l.id_deposito,
        nro_lote: l.nro_lote,
        vencimiento: l.fecha_vencimiento ? l.fecha_vencimiento.split('T')[0] : ""
      }));
  }, [lotes, editingId]);

  /* ===================== MANEJADORES ===================== */
  const handleBatchSelect = (opt) => {
    if (!opt) {
      setFormData({ id_lote: "", id_deposito: "", nro_lote: "", cantidad: "", fecha_vencimiento: "", deposito_nombre: "" });
      return;
    }

    // Calculamos cuánto falta por asignar para sugerir la cantidad
    const sugerido = Math.min(opt.existencia, remainingQuantity);

    setFormData({
      ...formData,
      id_lote: opt.value,
      id_deposito: opt.id_deposito,
      nro_lote: opt.nro_lote,
      deposito_nombre: opt.nombre_deposito,
      fecha_vencimiento: opt.vencimiento,
      cantidad: sugerido > 0 ? sugerido.toString() : ""
    });
  };

  const handleEditClick = (lote) => {
    setFormData({
      id_lote: lote.id_lote,
      id_deposito: lote.id_deposito,
      nro_lote: lote.nro_lote,
      deposito_nombre: lote.deposito_nombre,
      cantidad: lote.cantidad,
      fecha_vencimiento: lote.fecha_vencimiento,
    });
    setEditingId(lote.id_temp);
  };

  const handleQuantityChange = (e) => {
    const val = e.target.value;
    if (val.length > 9) return;
    
    const numVal = parseFloat(val);
    const selectedBatch = batchOptions.find(b => b.value === formData.id_lote);
    
    // Límite: No puede exceder la existencia del lote NI lo que falta por asignar
    const stockDisponible = selectedBatch ? selectedBatch.existencia : 0;
    const pendienteReal = editingId 
      ? remainingQuantity + parseFloat(currentBatches.find(l => l.id_temp === editingId)?.cantidad || 0)
      : remainingQuantity;

    const limit = Math.min(stockDisponible, pendienteReal);

    if (!isNaN(numVal) && numVal > limit) {
        setFormData({ ...formData, cantidad: limit.toString() });
        return;
    }
    setFormData({ ...formData, cantidad: val });
  };

  const handleAddLoteLocal = (e) => {
    e.preventDefault();
    const { id_lote, cantidad } = formData;

    if (!id_lote || !cantidad) return alert("Seleccione un lote e ingrese la cantidad.");

    const numCantidad = parseFloat(cantidad);
    const selectedBatch = batchOptions.find(b => b.value === id_lote);

    if (numCantidad <= 0) return alert("La cantidad debe ser mayor a 0.");

    // Validación de existencia física
    if (numCantidad > (selectedBatch?.existencia + 0.0001)) {
      return alert(`Error: Solo hay ${formatNumber(selectedBatch.existencia)} disponibles en este lote.`);
    }

    // Validación de requerimiento de producto
    const pendienteReal = editingId 
      ? remainingQuantity + parseFloat(currentBatches.find(l => l.id_temp === editingId)?.cantidad || 0)
      : remainingQuantity;

    if (numCantidad > (pendienteReal + 0.0001)) {
      return alert(`Error: No puede asignar más de lo pendiente (${formatNumber(pendienteReal)}).`);
    }

    let updatedLotesCompra;

    if (editingId) {
      updatedLotesCompra = currentBatches.map(l => 
        l.id_temp === editingId ? { ...formData, id_temp: editingId } : l
      );
      setEditingId(null);
    } else {
      const existingIndex = currentBatches.findIndex(l => l.id_lote === id_lote);

      if (existingIndex !== -1) {
        updatedLotesCompra = [...currentBatches];
        const existing = updatedLotesCompra[existingIndex];
        const nuevaCantTotal = parseFloat(existing.cantidad) + numCantidad;
        
        if (nuevaCantTotal > selectedBatch.existencia) {
            return alert("Error: La suma excede la existencia física del lote.");
        }

        updatedLotesCompra[existingIndex] = {
          ...existing,
          cantidad: nuevaCantTotal.toString()
        };
      } else {
        updatedLotesCompra = [...currentBatches, { ...formData, id_temp: Date.now() }];
      }
    }

    const updatedItems = items.map((item) => {
      const isSameProduct = (item.id === product.id) || (item.id_producto === product.id_producto);
      return isSameProduct ? { ...item, lotes_compra: updatedLotesCompra } : item;
    });

    setItems(updatedItems);
    setFormData({ id_lote: "", id_deposito: "", nro_lote: "", cantidad: "", fecha_vencimiento: "", deposito_nombre: "" });
  };

  const removeLoteLocal = (idTemp) => {
    if (editingId === idTemp) setEditingId(null);
    const updatedItems = items.map((item) => {
      const isSameProduct = (item.id === product.id) || (item.id_producto === product.id_producto);
      return isSameProduct ? { ...item, lotes_compra: (item.lotes_compra || []).filter(l => l.id_temp !== idTemp) } : item;
    });
    setItems(updatedItems);
  };

  const handleFinalizeDistribution = () => {
    if (currentBatches.length === 0) return alert("Debe asignar al menos un lote.");
    if (remainingQuantity > 0.01) {
       if(!window.confirm(`Quedan ${formatNumber(remainingQuantity)} por asignar. ¿Confirmar?`)) return;
    }
    onClose();
  };

  if (!product) return null;

  return (
    <div className="bm-overlay">
      <div className="bm-container">
        <header className="bm-header">
          <div className="bm-header-info">
            <h3 className="bm-title">Distribución por Lotes</h3>
            <span className="bm-product-name">{displayProduct.descripcion || displayProduct.nombre}</span>
          </div>
          <button className="bm-btn-close" onClick={onClose}><X size={24} /></button>
        </header>

        <div className="bm-content-grid">
          <div className="bm-card">
            <h4 className="bm-card-title">
              {editingId ? <Edit3 size={18} /> : <Plus size={18} />} 
              {editingId ? "Editar Selección" : "Seleccionar Lote de Origen"}
            </h4>
            
            <div className="bm-form-grid">
              <div className="bm-form-group" style={{ gridColumn: "1 / -1", marginBottom: "10px" }}>
                <label><Hash size={14} /> Lote Disponible</label>
                <Select
                  options={batchOptions}
                  placeholder={isLoading ? "Cargando..." : "Busque por Nro. de Lote..."}
                  isLoading={isLoading}
                  value={batchOptions.find(o => o.value === formData.id_lote) || null}
                  onChange={handleBatchSelect}
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
                  placeholder="0,00"
                />
              </div>

              <div className="bm-form-group">
                <label><Calendar size={14} /> Vencimiento</label>
                <input
                  className="bm-input"
                  type="date"
                  value={formData.fecha_vencimiento}
                  readOnly
                  style={{ background: '#f8fafc', cursor: 'not-allowed' }}
                />
              </div>
            </div>

            <button
              className={`bm-btn-add ${editingId ? 'is-editing' : ''}`}
              onClick={handleAddLoteLocal}
              disabled={(remainingQuantity <= 0 && !editingId) || isLoading || !formData.id_lote}
              style={{ marginTop: "15px" }}
            >
              {editingId ? "Actualizar Lote" : "Añadir a la Lista"}
            </button>
          </div>

          <div className="bm-card">
            <h4 className="bm-card-title"><Info size={18} /> Resumen</h4>
            <div className="bm-summary-item bm-summary-info">
              <span>Total Requerido:</span> <strong>{formatNumber(maxQuantity)}</strong>
            </div>
            <div className="bm-summary-item bm-summary-success">
              <span>Total Asignado:</span> <strong>{formatNumber(allocatedQuantity)}</strong>
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
                <th>Lote / Depósito</th>
                <th className="bm-text-center">Cant. Seleccionada</th>
                <th className="bm-text-center">Vencimiento</th>
                <th className="bm-text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentBatches.map((l) => (
                <tr key={l.id_temp} className={editingId === l.id_temp ? "row-editing" : ""}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong>{l.nro_lote}</strong>
                        <small style={{ color: '#64748b' }}>{l.deposito_nombre}</small>
                    </div>
                  </td>
                  <td className="bm-text-center"><strong>{formatNumber(parseFloat(l.cantidad))}</strong></td>
                  <td className="bm-text-center">
                    {l.fecha_vencimiento ? new Date(l.fecha_vencimiento).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="bm-text-center">
                    <div className="bm-actions-container">
                      <button className="bm-btn-icon bm-btn-edit" onClick={() => handleEditClick(l)} title="Editar"><Edit3 size={16} /></button>
                      <button className="bm-btn-icon bm-btn-delete" onClick={() => removeLoteLocal(l.id_temp)} title="Eliminar"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentBatches.length === 0 && (
                <tr><td colSpan="4" className="bm-table-empty">No hay lotes seleccionados.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="bm-footer">
          <button className="bm-btn-save" onClick={handleFinalizeDistribution} disabled={currentBatches.length === 0}>
            <Save size={18} /> Confirmar Selección
          </button>
        </footer>
      </div>
    </div>
  );
};

export default BatchModal;