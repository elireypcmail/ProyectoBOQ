import React, { useState, useMemo, useEffect } from "react"
import { Search, Plus, Loader2 } from "lucide-react"
import { SlOptionsVertical } from "react-icons/sl"
import { useIncExp } from "../../context/IncExpContext"
import SaleFormModal from "./Ui/SalesFormModal"
import SaleDetailModal from "./Ui/SalesDetailModal"
import "../../styles/components/ListSales.css"

const ListSales = () => {
  const { sales, getAllSales, getSaleById, loading } = useIncExp()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSale, setSelectedSale] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [fetchingId, setFetchingId] = useState(null)

  useEffect(() => {
    getAllSales()
  }, [])

  const handleOpenDetail = async (id) => {
    try {
      setFetchingId(id)
      const detailedData = await getSaleById(id)
      if (detailedData) {
        setSelectedSale(detailedData)
        setIsDetailOpen(true)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setFetchingId(null)
    }
  }

  const filteredSales = useMemo(() => {
    if (!sales) return []
    return sales.filter((s) =>
      s.nro_factura?.toUpperCase().includes(searchTerm.toUpperCase()) ||
      s.paciente?.toUpperCase().includes(searchTerm.toUpperCase())
    )
  }, [sales, searchTerm])

  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0
    return num.toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const renderStatus = (sale) => {
    if (sale.estatus === false) {
      return <span className="v-status-pill v-status-anulada">Anulada</span>
    }

    const estado = sale.estado_venta?.toUpperCase()
    if (estado === "CONFIRMADA" || estado === "PAGADA") {
      return <span className="v-status-pill v-status-confirmada">Confirmada</span>
    }
    
    return <span className="v-status-pill v-status-pendiente">Pendiente</span>
  }

  return (
    <div className="v-main-container">
      <div className="v-header-section">
        <div className="v-header-info">
          <h2 className="v-title">Gestión de Ventas</h2>
          <p className="v-subtitle">
            {loading ? (
              <span className="v-loader-text"><Loader2 size={14} className="v-spin" /> Cargando...</span>
            ) : (
              `${filteredSales.length} registros encontrados`
            )}
          </p>
        </div>

        <button className="v-btn-add" onClick={() => { setSelectedSale(null); setIsFormOpen(true) }}>
          <Plus size={16} /> Nueva Venta
        </button>
      </div>

      <div className="v-toolbar">
        <div className="v-search-box">
          <Search size={16} />
          <input
            placeholder="Buscar por factura o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
          />
        </div>
      </div>

      <div className="v-table-container">
        <table className="v-data-table">
          <thead>
            <tr>
              <th>Factura</th>
              <th>Cliente</th>
              <th className="v-text-right">Total</th>
              <th className="v-text-center">Estatus</th>
              <th className="v-text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.length > 0 ? (
              filteredSales.map((s) => (
                <tr key={s.id} className="v-table-row">
                  <td className="v-text-center v-bold">{s.nro_factura}</td>
                  <td>{s.paciente}</td>
                  <td className="v-text-right v-bold">{formatCurrency(s.total)}</td>
                  <td className="v-text-center">{renderStatus(s)}</td>
                  <td className="v-text-center">
                    <button
                      className="v-action-btn"
                      disabled={fetchingId === s.id}
                      onClick={() => handleOpenDetail(s.id)}
                    >
                      {fetchingId === s.id ? <Loader2 size={16} className="v-spin" /> : <SlOptionsVertical size={16} />}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="v-empty-state">
                  {loading ? "Cargando datos..." : "No se encontraron registros de ventas."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <SaleFormModal isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setSelectedSale(null) }} editData={selectedSale} />
      <SaleDetailModal 
        isOpen={isDetailOpen} 
        sale={selectedSale} 
        onClose={() => { setIsDetailOpen(false); setSelectedSale(null) }} 
        onEdit={(saleToEdit) => { setSelectedSale(saleToEdit); setIsDetailOpen(false); setIsFormOpen(true) }} 
      />
    </div>
  )
}

export default ListSales