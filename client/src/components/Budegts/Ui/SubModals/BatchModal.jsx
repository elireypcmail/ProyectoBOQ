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

  console.log("lotes")
  console.log(lotes)

  const getRowId = (l) => l.id_temp || l.id_lote;

  // CORREGIDO: Se añadió [product] como dependencia para recargar datos al cambiar producto
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

  const currentProductEntry = useMemo(() => {
    return items.find(item =>
      (item.id && item.id === product?.id) ||
      (item.id_producto && item.id_producto === product?.id_producto)
    );
  }, [items, product]);

  const displayProduct = currentProductEntry || product;
  const maxQuantity = parseFloat(displayProduct?.cantidad) || 0;
  const currentBatches = useMemo(() => {
    return displayProduct?.lotes_compra || displayProduct?.lotes || [];
  }, [displayProduct]);

  const allocatedQuantity = currentBatches.reduce((acc, b) => acc + parseFloat(b.cantidad || 0), 0);
  const remainingQuantity = Math.max(0, maxQuantity - allocatedQuantity);

  const formatNumber = (num) => {
    if (num === undefined || num === null) return "0,00";
    return Number(num).toLocaleString('es-VE', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const batchOptions = useMemo(() => {
    return (lotes || [])
      .map(l => ({
        value: l.id,
        label: `Lote: ${l.nro_lote} - ${l.deposito_nombre || l.deposito} (Stock: ${formatNumber(l.cantidad)})`,
        existencia: parseFloat(l.cantidad || 0),
        nombre_deposito: l.deposito_nombre || l.deposito,
        id_deposito: l.id_deposito,
        nro_lote: l.nro_lote,
        vencimiento: l.fecha_vencimiento || l.fecha_caducidad || ""
      }));
  }, [lotes]);

  // CORREGIDO: Lógica de límites ahora considera lo que ya está en la fila de edición
  const getBatchLimits = (loteId) => {
    const selectedBatch = batchOptions.find(b => b.value === loteId);
    if (!selectedBatch) return { stockDisponible: 0, maxPermitido: 0 };

    const yaAsignadoEnOtrasFilas = currentBatches
      .filter(l => l.id_lote === loteId && getRowId(l) !== editingId)
      .reduce((acc, l) => acc + parseFloat(l.cantidad || 0), 0);

    const loteEditando = currentBatches.find(l => getRowId(l) === editingId);
    const cantidadEnEdicion = loteEditando ? parseFloat(loteEditando.cantidad || 0) : 0;

    // Stock real restante excluyendo la fila actual
    const stockRealDisponible = selectedBatch.existencia - yaAsignadoEnOtrasFilas;
    
    // El límite es el stock libre + lo que ya está en esta fila, limitado por el pendiente global
    const maxPermitido = Math.min(stockRealDisponible + cantidadEnEdicion, remainingQuantity + cantidadEnEdicion);

    return {
      stockDisponible: Math.max(0, stockRealDisponible),
      maxPermitido: Math.max(0, maxPermitido)
    };
  };

const handleBatchSelect = (opt) => {
    if (!opt) {
      setFormData({ id_lote: "", id_deposito: "", nro_lote: "", cantidad: "", fecha_vencimiento: "", deposito_nombre: "" });
      return;
    }
    
    // Extraer solo YYYY-MM-DD del string completo
    const fechaLimpia = opt.vencimiento ? opt.vencimiento.substring(0, 10) : "";
    
    const { maxPermitido } = getBatchLimits(opt.value);
    setFormData({
      ...formData,
      id_lote: opt.value,
      id_deposito: opt.id_deposito,
      nro_lote: opt.nro_lote,
      deposito_nombre: opt.nombre_deposito,
      fecha_vencimiento: fechaLimpia, // Aquí está el cambio
      cantidad: maxPermitido > 0 ? maxPermitido.toString().replace('.', ',') : ""
    });
  };

  const handleQuantityChange = (e) => {
    const val = e.target.value;
    if (val === "") {
      setFormData({ ...formData, cantidad: "" });
      return;
    }

    const numVal = parseFloat(val.replace(',', '.'));
    const { maxPermitido } = getBatchLimits(formData.id_lote);

    if (numVal > maxPermitido) {
      setFormData({ ...formData, cantidad: maxPermitido.toString().replace('.', ',') });
    } else {
      setFormData({ ...formData, cantidad: val });
    }
  };

  const handleAddLoteLocal = (e) => {
    e.preventDefault();
    const { id_lote, cantidad } = formData;
    if (!id_lote || !cantidad) return alert("Datos incompletos.");

    const numCantidad = parseFloat(cantidad.replace(',', '.'));
    const { stockDisponible } = getBatchLimits(id_lote);
    
    const loteEditando = currentBatches.find(l => getRowId(l) === editingId);
    const montoAnterior = loteEditando ? parseFloat(loteEditando.cantidad || 0) : 0;

    if (numCantidad > (stockDisponible + montoAnterior) + 0.0001) {
      return alert(`Error: Solo quedan ${formatNumber(stockDisponible + montoAnterior)} disponibles en este lote.`);
    }

    let updatedLotesCompra;
    const currentIdTemp = editingId || Date.now();

    if (editingId) {
      updatedLotesCompra = currentBatches.map(l => 
        getRowId(l) == editingId ? { ...formData, cantidad: numCantidad.toString(), id_temp: currentIdTemp } : l
      );
      setEditingId(null);
    } else {
      updatedLotesCompra = [...currentBatches, { ...formData, cantidad: numCantidad.toString(), id_temp: currentIdTemp }];
    }

    setItems(items.map(item => {
      const isSame = (item.id === product.id) || (item.id_producto === product.id_producto);
      return isSame ? { ...item, lotes_compra: updatedLotesCompra } : item;
    }));

    setFormData({ id_lote: "", id_deposito: "", nro_lote: "", cantidad: "", fecha_vencimiento: "", deposito_nombre: "" });
  };

  const removeLoteLocal = (idTarget) => {
    if (editingId === idTarget) setEditingId(null);
    setItems(items.map(item => {
      const isSame = (item.id === product.id) || (item.id_producto === product.id_producto);
      return isSame ? { 
        ...item, 
        lotes_compra: (item.lotes_compra || item.lotes || []).filter(l => getRowId(l) !== idTarget) 
      } : item;
    }));
  };

  const handleEditClick = (lote) => {
    setEditingId(getRowId(lote));
    setFormData({
      id_lote: lote.id_lote,
      id_deposito: lote.id_deposito,
      nro_lote: lote.nro_lote,
      deposito_nombre: lote.deposito_nombre || lote.deposito,
      cantidad: lote.cantidad.toString().replace('.', ','),
      fecha_vencimiento: lote.fecha_vencimiento || lote.fecha_caducidad ,
    });
  };

  if (!product) return null;

  return (
    <div className="bm-overlay">
      <div className="bm-container">
        <header className="bm-header">
          <div className="bm-header-info">
            <h3 className="bm-title">Distribución por Lotes</h3>
            <span className="bm-product-name">{displayProduct.descripcion || displayProduct.producto}</span>
          </div>
          <button className="bm-btn-close" onClick={onClose}><X size={24} /></button>
        </header>

        <div className="bm-content-grid">
          <div className="bm-card">
            <h4 className="bm-card-title">
              {editingId ? <Edit3 size={18} /> : <Plus size={18} />} 
              {editingId ? "Editar Selección" : "Añadir Lote"}
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
                  type="text"
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
              disabled={isLoading || !formData.id_lote || (remainingQuantity <= 0 && !editingId)}
              style={{ marginTop: "15px" }}
            >
              {editingId ? "Actualizar Lote" : "Añadir a la Lista"}
            </button>
          </div>

          <div className="bm-card">
            <h4 className="bm-card-title"><Info size={18} /> Resumen</h4>
            <div className="bm-summary-item bm-summary-info">
              <span>Requerido:</span> <strong>{formatNumber(maxQuantity)}</strong>
            </div>
            <div className="bm-summary-item bm-summary-success">
              <span>Asignado:</span> <strong>{formatNumber(allocatedQuantity)}</strong>
            </div>
            <div className="bm-summary-item">
              <span>Pendiente:</span>
              <strong className={remainingQuantity > 0.0001 ? "bm-text-danger" : "bm-text-success"}>
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
                <th className="bm-text-center">Cant.</th>
                <th className="bm-text-center">Vencimiento</th>
                <th className="bm-text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentBatches.map((l) => (
                <tr key={getRowId(l)} className={editingId === getRowId(l) ? "row-editing" : ""}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong>{l.nro_lote}</strong>
                        <small style={{ color: '#64748b' }}>{l.deposito_nombre || l.deposito}</small>
                    </div>
                  </td>
                  <td className="bm-text-center"><strong>{formatNumber(parseFloat(l.cantidad))}</strong></td>
                  <td className="bm-text-center">
                    {(l.fecha_vencimiento || l.fecha_caducidad) 
                    ? new Date((l.fecha_vencimiento || l.fecha_caducidad) + 'T00:00:00').toLocaleDateString('es-VE')
                    : ''}
                  </td>
                  <td className="bm-text-center">
                    <div className="bm-actions-container">
                      <button className="bm-btn-icon bm-btn-edit" onClick={() => handleEditClick(l)} title="Editar"><Edit3 size={16} /></button>
                      <button className="bm-btn-icon bm-btn-delete" onClick={() => removeLoteLocal(getRowId(l))} title="Eliminar"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="bm-footer">
          <button 
            className="bm-btn-save" 
            onClick={onClose} 
            disabled={remainingQuantity > 0.0001}
          >
            <Save size={18} /> 
            {remainingQuantity > 0.0001 ? "Debe completar la cantidad" : "Confirmar Selección"}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default BatchModal;