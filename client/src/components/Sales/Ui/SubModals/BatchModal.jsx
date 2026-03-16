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
    deposito_nombre: ""
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

  // Calcular el límite máximo permitido para el input actual
  const currentInputLimit = useMemo(() => {
    const editingQty = editingId 
      ? parseNum(currentBatches.find(l => getRowId(l) === editingId)?.cantidad) 
      : 0
    return remainingQuantity + editingQty
  }, [remainingQuantity, editingId, currentBatches])

  const formatNumber = (num) => {
    return Number(num || 0).toLocaleString('de-DE', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })
  }

  // Manejador para restringir la escritura
  const handleQtyChange = (e) => {
    let val = e.target.value;
    
    if (val === "" || val === ",") {
      setFormData({ ...formData, cantidad: val });
      return;
    }

    const numericVal = parseNum(val);
    
    // Si lo que intenta escribir supera el máximo pendiente, lo seteamos al máximo
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
      setFormData({ id_lote: "", id_deposito: "", nro_lote: "", cantidad: "", fecha_vencimiento: "", deposito_nombre: "" })
      return
    }
    setFormData({
      ...formData,
      id_lote: opt.value,
      id_deposito: opt.id_deposito,
      nro_lote: opt.nro_lote,
      deposito_nombre: opt.nombre_deposito,
      fecha_vencimiento: opt.vencimiento ? opt.vencimiento.substring(0, 10) : ""
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
        updatedLotesCompra[existingIndex] = {
          ...updatedLotesCompra[existingIndex],
          cantidad: currentQty + numCantidad
        }
      } else {
        updatedLotesCompra = [...currentBatches, { ...formData, cantidad: numCantidad, id_temp: Date.now() }]
      }
    }

    setItems(prev => prev.map(item => (item.id === product.id) ? { ...item, lotes_compra: updatedLotesCompra } : item))
    setEditingId(null)
    setFormData({ id_lote: "", id_deposito: "", nro_lote: "", cantidad: "", fecha_vencimiento: "", deposito_nombre: "" })
  }

  const removeLoteLocal = (idTarget) => {
    const updated = currentBatches.filter(l => getRowId(l) !== idTarget)
    setItems(prev => prev.map(item => (item.id === product.id) ? { ...item, lotes_compra: updated } : item))
  }

  const handleEditClick = (lote) => {
    setEditingId(getRowId(lote))
    setFormData({
      id_lote: lote.id_lote,
      id_deposito: lote.id_deposito,
      nro_lote: lote.nro_lote,
      deposito_nombre: lote.deposito_nombre,
      cantidad: lote.cantidad.toString().replace('.', ','),
      fecha_vencimiento: (lote.fecha_vencimiento || lote.fecha_caducidad || "").substring(0, 10)
    })
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
                setFormData({ id_lote: "", id_deposito: "", nro_lote: "", cantidad: "", fecha_vencimiento: "", deposito_nombre: "" });
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