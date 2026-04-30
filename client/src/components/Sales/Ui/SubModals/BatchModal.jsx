import React, { useState, useEffect, useMemo } from "react"
import Select from "react-select"
import { X, Plus, Calendar, Trash2, Package, Save, Edit3, Hash } from "lucide-react"
import { useProducts } from "../../../../context/ProductsContext"
import "../../../../styles/ui/subModals/BatchModal.css"

const BatchModal = ({ product, onClose, items = [], setItems }) => {
  const { lotes, getAllLotesByProd } = useProducts()
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)

  const [formData, setFormData] = useState({
    id_lote: "",
    id_deposito: "",
    nro_lote: "",
    cantidad: "",
    fecha_vencimiento: "",
    deposito_nombre: "",
    existencia_lote: 0 // Guardamos la existencia física aquí
  })

  const getRowId = (l) => l.id_temp || l.id_lote

  useEffect(() => {
    const loadBatchData = async () => {
      const catalogId = product?.id_producto || product?.id
      if (catalogId) {
        setIsLoading(true)
        await getAllLotesByProd(catalogId)
        setIsLoading(false)
      }
    }
    loadBatchData()
  }, [product])

  const displayProduct = useMemo(() => {
    return items.find(item => item.id === product.id) || product
  }, [items, product])

  const parseNum = (val) => {
    if (!val) return 0
    if (typeof val === "number") return val
    return parseFloat(val.toString().replace(/\./g, "").replace(",", ".")) || 0
  }

  const maxQuantity = parseNum(displayProduct?.cantidad)
  const currentBatches = useMemo(() => displayProduct?.lotes_compra || [], [displayProduct])
  const allocatedQuantity = currentBatches.reduce((acc, b) => acc + parseNum(b.cantidad), 0)
  const remainingQuantity = Math.max(0, maxQuantity - allocatedQuantity)

  // NUEVA LÓGICA: Calcular el límite real basado en Requerimiento vs Existencia de Lote
  const currentInputLimit = useMemo(() => {
    // 1. Cuánto falta por asignar del producto
    const editingQty = editingId 
      ? parseNum(currentBatches.find(l => getRowId(l) === editingId)?.cantidad) 
      : 0
    const reqLimit = remainingQuantity + editingQty

    // 2. Cuánto hay en el depósito seleccionado
    const stockLimit = formData.existencia_lote || 0

    // El límite es el menor de los dos
    return Math.min(reqLimit, stockLimit)
  }, [remainingQuantity, editingId, currentBatches, formData.existencia_lote, formData.id_lote])

  const formatNumber = (num) => {
    return Number(num || 0).toLocaleString('de-DE', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })
  }

  const handleQtyChange = (e) => {
    let val = e.target.value;
    if (val === "" || val === ",") {
      setFormData({ ...formData, cantidad: val });
      return;
    }

    const numericVal = parseNum(val);
    
    // Bloqueo estricto: no permite superar el stock del depósito ni el total requerido
    if (numericVal > currentInputLimit) {
      setFormData({ ...formData, cantidad: currentInputLimit.toString().replace(".", ",") });
    } else {
      setFormData({ ...formData, cantidad: val });
    }
  };

  const batchOptions = useMemo(() => {
    return (lotes || []).map(l => ({
      value: l.id,
      label: `Lote: ${l.nro_lote} - ${l.deposito_nombre || l.deposito} (Stock: ${formatNumber(l.cantidad)})`,
      existencia: parseNum(l.cantidad),
      nombre_deposito: l.deposito_nombre || l.deposito,
      id_deposito: l.id_deposito,
      nro_lote: l.nro_lote,
      vencimiento: l.fecha_vencimiento || l.fecha_caducidad || ""
    }))
  }, [lotes])

  const handleBatchSelect = (opt) => {
    if (!opt) {
      setFormData({ id_lote: "", id_deposito: "", nro_lote: "", cantidad: "", fecha_vencimiento: "", deposito_nombre: "", existencia_lote: 0 })
      return
    }

    // Al seleccionar, si la cantidad que ya estaba escrita supera el nuevo stock, se ajusta
    const currentQty = parseNum(formData.cantidad);
    const newLimit = opt.existencia; 

    setFormData({
      ...formData,
      id_lote: opt.value,
      id_deposito: opt.id_deposito,
      nro_lote: opt.nro_lote,
      deposito_nombre: opt.nombre_deposito,
      existencia_lote: opt.existencia,
      fecha_vencimiento: opt.vencimiento ? opt.vencimiento.substring(0, 10) : "",
      cantidad: currentQty > newLimit ? newLimit.toString().replace(".", ",") : formData.cantidad
    })
  }

  const handleAddLoteLocal = (e) => {
    e.preventDefault()
    const numCantidad = parseNum(formData.cantidad)
    if (!formData.id_lote || numCantidad <= 0) return

    let updatedLotesCompra

    if (editingId) {
      updatedLotesCompra = currentBatches.map(l => 
        getRowId(l) === editingId ? { ...formData, cantidad: numCantidad, id_temp: editingId } : l
      )
    } else {
      const existingIndex = currentBatches.findIndex(l => l.id_lote === formData.id_lote)
      if (existingIndex !== -1) {
        updatedLotesCompra = [...currentBatches]
        const currentQty = parseNum(updatedLotesCompra[existingIndex].cantidad)
        // Validar que la suma no exceda la existencia total del lote al agrupar
        const totalNueva = Math.min(currentQty + numCantidad, formData.existencia_lote);
        updatedLotesCompra[existingIndex] = {
          ...updatedLotesCompra[existingIndex],
          cantidad: totalNueva
        }
      } else {
        updatedLotesCompra = [...currentBatches, { ...formData, cantidad: numCantidad, id_temp: Date.now() }]
      }
    }

    setItems(prev => prev.map(item => (item.id === product.id) ? { ...item, lotes_compra: updatedLotesCompra } : item))
    setEditingId(null)
    setFormData({ id_lote: "", id_deposito: "", nro_lote: "", cantidad: "", fecha_vencimiento: "", deposito_nombre: "", existencia_lote: 0 })
  }

  const handleEditClick = (lote) => {
    // Al editar buscamos el lote en el catálogo original para saber su stock real actual
    const originalLote = lotes.find(l => l.id === lote.id_lote);
    const stockReal = originalLote ? parseNum(originalLote.cantidad) : parseNum(lote.cantidad);

    setEditingId(getRowId(lote))
    setFormData({
      id_lote: lote.id_lote,
      id_deposito: lote.id_deposito,
      nro_lote: lote.nro_lote,
      deposito_nombre: lote.deposito_nombre,
      existencia_lote: stockReal,
      cantidad: lote.cantidad.toString().replace('.', ','),
      fecha_vencimiento: (lote.fecha_vencimiento || lote.fecha_caducidad || "").substring(0, 10)
    })
  }

  const removeLoteLocal = (idTarget) => {
    const updated = currentBatches.filter(l => getRowId(l) !== idTarget)
    setItems(prev => prev.map(item => (item.id === product.id) ? { ...item, lotes_compra: updated } : item))
  }

  return (
    <div className="bm-overlay">
      <div className="bm-container">
        <header className="bm-header">
          <div className="bm-header-info">
            <h3 className="bm-title">{editingId ? "Editando Distribución" : "Fraccionar Lotes"}</h3>
            <span className="bm-product-name">{displayProduct.descripcion || displayProduct.nombre}</span>
          </div>
          <button className="bm-btn-close" onClick={onClose}><X size={24} /></button>
        </header>

        <div className="bm-content-grid">
          <div className="bm-card">
            <h4 className="bm-card-title">{editingId ? <Edit3 size={18} /> : <Plus size={18} />} {editingId ? "Editar Selección" : "Datos del Lote"}</h4>
            
            <div className="bm-form-grid">
              <div className="bm-form-group" style={{ gridColumn: "1 / -1" }}>
                <label><Hash size={14} /> Lote Disponible</label>
                <Select
                  options={batchOptions}
                  isLoading={isLoading}
                  value={batchOptions.find(o => o.value === formData.id_lote) || null}
                  onChange={handleBatchSelect}
                  placeholder="Seleccionar lote..."
                  isClearable
                  isDisabled={!!editingId}
                />
                {formData.id_lote && (
                  <small style={{ color: '#64748b', marginTop: '4px', display: 'block' }}>
                    Stock físico en depósito: <strong>{formatNumber(formData.existencia_lote)}</strong>
                  </small>
                )}
              </div>

              <div className="bm-form-group">
                <label><Package size={14} /> Cantidad</label>
                <input
                  className="bm-input"
                  type="text"
                  value={formData.cantidad}
                  onChange={handleQtyChange}
                  placeholder={`Máx: ${formatNumber(currentInputLimit)}`}
                />
              </div>

              <div className="bm-form-group">
                <label><Calendar size={14} /> Vencimiento</label>
                <input
                  className="bm-input"
                  type="date"
                  value={formData.fecha_vencimiento}
                  readOnly
                  style={{ background: '#f8fafc' }}
                />
              </div>
            </div>

            <button
              className="bm-btn-add"
              onClick={handleAddLoteLocal}
              disabled={!formData.id_lote || parseNum(formData.cantidad) <= 0}
            >
              {editingId ? "Actualizar" : "Asignar"}
            </button>
            {editingId && (
              <button className="bm-btn-cancel" onClick={() => {
                setEditingId(null);
                setFormData({ id_lote: "", id_deposito: "", nro_lote: "", cantidad: "", fecha_vencimiento: "", deposito_nombre: "", existencia_lote: 0 });
              }}>
                Cancelar Edición
              </button>
            )}
          </div>

          <div className="bm-card">
            <h4 className="bm-card-title">Resumen</h4>
            <div className="bm-summary-item">
              <span>Total Requerido:</span> <strong>{formatNumber(maxQuantity)}</strong>
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
                <th>Lote</th>
                <th>Depósito</th>
                <th className="bm-text-center">Cant.</th>
                <th className="bm-text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentBatches.map((l) => (
                <tr key={getRowId(l)} className={editingId === getRowId(l) ? "row-editing" : ""}>
                  <td><strong>#{l.nro_lote}</strong></td>
                  <td>{l.deposito_nombre}</td>
                  <td className="bm-text-center">{formatNumber(l.cantidad)}</td>
                  <td className="bm-text-center">
                    <div className="bm-actions-flex">
                      <button className="bm-btn-icon" title="Editar" onClick={() => handleEditClick(l)}>
                        <Edit3 size={16} />
                      </button>
                      <button className="bm-btn-delete" title="Eliminar" onClick={() => removeLoteLocal(getRowId(l))}>
                        <Trash2 size={16} />
                      </button>
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
            disabled={currentBatches.length === 0 || remainingQuantity > 0.0001}
          >
            <Save size={18} /> Confirmar Distribución
          </button>
        </footer>
      </div>
    </div>
  )
}

export default BatchModal