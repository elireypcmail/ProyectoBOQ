import React, { useState, useMemo, useEffect } from "react"
import { Search, Plus, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
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

  // --- Estado de Paginación ---
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    getAllSales()
  }, [])

  // Reiniciar a página 1 cuando el usuario busca algo
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

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

  // Filtrado y Ordenación (Fecha e ID de manera decreciente)
  const filteredSales = useMemo(() => {
    if (!sales) return []

    const filtered = sales.filter((s) =>
      s.nro_factura?.toUpperCase().includes(searchTerm.toUpperCase()) ||
      s.paciente?.toUpperCase().includes(searchTerm.toUpperCase())
    )

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.fecha_creacion || a.created_at || 0)
      const dateB = new Date(b.fecha_creacion || b.created_at || 0)
      
      if (dateB - dateA !== 0) {
        return dateB - dateA // Fecha más reciente primero
      }
      return (b.id || 0) - (a.id || 0) // ID más alto primero si las fechas son iguales
    })
  }, [sales, searchTerm])

  // --- Cálculos de Paginación ---
  const totalPages = Math.ceil(filteredSales.length / ITEMS_PER_PAGE)
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE
  const currentItems = filteredSales.slice(indexOfFirstItem, indexOfLastItem)

  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0
    return num.toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const formatDate = (dateString) => {
    if (!dateString) return "---"
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
  }

  const getRowStatusClass = (sale) => {
    if (sale.estatus === false) return "v-row-anulada"
    const estado = sale.estado_venta?.toUpperCase()
    if (estado === "CONFIRMADA" || estado === "PAGADA") return "v-row-confirmada"
    return "v-row-pendiente"
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
            style={{ textTransform: 'uppercase' }}
            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
          />
        </div>
      </div>

      <div className="v-table-container">
        <table className="v-data-table">
          <thead>
            <tr>
              <th className="v-text-center">Fecha</th>
              <th>Factura</th>
              <th>Cliente</th>
              <th className="v-text-right">Total</th>
              <th className="v-text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((s) => (
                <tr key={s.id} className={`v-table-row ${getRowStatusClass(s)}`}>
                  <td className="v-text-center">{formatDate(s.fecha_creacion || s.created_at)}</td>
                  <td className="v-text-center v-bold">{s.nro_factura}</td>
                  <td>{s.paciente}</td>
                  <td className="v-text-right v-bold">{formatCurrency(s.total)}</td>
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

      {/* --- Controles de Paginación --- */}
      {totalPages > 1 && (
        <div className="pagination-controls flex items-center justify-between" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            className="btn-secondary flex items-center gap-1"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
          >
            <ChevronLeft size={16} /> Anterior
          </button>
          
          <span className="v-page-info">
            Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
          </span>

          <button 
            className="btn-secondary flex items-center gap-1"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
          >
            Siguiente <ChevronRight size={16} />
          </button>
        </div>
      )}

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