import React, { useEffect, useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, Plus, Trash2, AlertTriangle } from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";

// Contexts
import { useSales } from "../../context/SalesContext";
import { useEntity } from "../../context/EntityContext"; 

// Modals
import SellerDetailModal from './Ui/SellerDetailModal';
import SellerFormModal from './Ui/SellerFormModal';

// CSS
import "../../styles/components/ListSellers.css";

const ListSellers = () => {
  const {
    sellers,
    getAllSellers,
    createNewSeller,
    editSeller,
    deleteSellerById,
    saveFilesSeller
  } = useSales();

  const { 
    entities, 
    getAllEntities, 
    createNewEntity 
  } = useEntity();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const oficinas = entities.oficinas || [];
  const zonas = entities.zonas || [];

  useEffect(() => {
    getAllSellers();
    getAllEntities("oficinas");
    getAllEntities("zonas");
  }, []);

  // Filtrado y Ordenación Alfabética por Nombre
  const filteredSellers = useMemo(() => {
    const list = sellers || [];
    
    // 1. Filtramos
    const filtered = list.filter(s =>
      s.nombre.toUpperCase().includes(searchTerm.toUpperCase())
    );

    // 2. Ordenamos alfabéticamente
    return [...filtered].sort((a, b) => {
      const nameA = (a.nombre || "").toUpperCase();
      const nameB = (b.nombre || "").toUpperCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
  }, [sellers, searchTerm]);

  const totalPages = Math.ceil(filteredSellers.length / itemsPerPage);
  const currentSellers = filteredSellers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenCreate = () => {
    setSelectedSeller(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (seller) => {
    setSelectedSeller(seller);
    setIsFormModalOpen(true);
    setIsDetailsModalOpen(false); // Cerramos detalle si venimos de ahí
  };

  const handleSaveSeller = async (data, files) => {
    setIsSaving(true);
    try {
      let sellerId = null;

      if (selectedSeller) {
        await editSeller(selectedSeller.id, data);
        sellerId = selectedSeller.id;
      } else {
        const res = await createNewSeller(data);
        sellerId = res?.data?.id || res?.id;
      }

      if (files && files.length > 0 && sellerId) {
        const filesJson = files.map((f, idx) => ({
          id: null,
          name: f.name.toUpperCase(), // Coherencia en nombres de archivos
          order: idx + 1,
        }));
        await saveFilesSeller(sellerId, files, filesJson);
      }

      await getAllSellers();
      setIsFormModalOpen(false);
      setSelectedSeller(null);
    } catch (error) {
      console.error("Error al guardar vendedor:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateOficina = async (payload) => {
    try {
      const res = await createNewEntity("oficinas", payload);
      await getAllEntities("oficinas");
      return res?.data || res;
    } catch (error) {
      console.error("Error al crear la oficina:", error);
      throw error;
    }
  };

  const handleDelete = async () => {
    await deleteSellerById(selectedSeller.id);
    setIsDeleteModalOpen(false);
    setSelectedSeller(null);
    getAllSellers();
  };

  const handleOpenDetails = (seller) => {
    setSelectedSeller(seller);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="seller-panel-container">
      <div className="seller-top-header">
        <div className="seller-title-area">
          <h2>Gestión de Vendedores</h2>
          <p>{filteredSellers.length} registrados en el sistema</p>
        </div>
        <button className="seller-btn-main" onClick={handleOpenCreate}>
          <Plus size={18} /> Nuevo Vendedor
        </button>
      </div>

      <div className="seller-action-bar">
        <div className="seller-search-box">
          <Search size={18} style={{ color: 'var(--seller-muted)' }} />
          <input
            placeholder="BUSCAR VENDEDOR..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
          />
        </div>
      </div>

      <div className="seller-table-container">
        <table className="seller-grid-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre del Vendedor</th>
              <th>Oficina</th>
              <th>Contacto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentSellers.map((s) => (
              <tr key={s.id}>
                <td data-label="ID" className="seller-id-text">#{s.id}</td>
                <td data-label="Nombre" style={{ fontWeight: 700 }}>{s.nombre.toUpperCase()}</td>
                <td data-label="Oficina">
                  <span className="seller-badge-office">{s.oficina?.toUpperCase()}</span>
                </td>
                <td data-label="Contacto">
                  <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8rem' }}>
                    <span>{s.telefono || 'SIN TEL.'}</span>
                    <span style={{ color: 'var(--seller-muted)' }}>{s.email?.toLowerCase()}</span>
                  </div>
                </td>
                <td data-label="Acciones">
                  <button className="seller-btn-icon" onClick={() => handleOpenDetails(s)}>
                    <SlOptionsVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="seller-pagination-nav">
        <button className="seller-page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
          <ChevronLeft size={18} />
        </button>
        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{currentPage} / {totalPages}</span>
        <button className="seller-page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* MODALES */}
      <SellerFormModal
        isOpen={isFormModalOpen}
        seller={selectedSeller}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveSeller}
        isSaving={isSaving}
        oficinas={oficinas}
        zonas={zonas}
        onCreateOficina={handleCreateOficina} 
      />

      <SellerDetailModal
        isOpen={isDetailsModalOpen}
        seller={selectedSeller}
        onClose={() => setIsDetailsModalOpen(false)}
        onEdit={handleOpenEdit}
        onDelete={() => setIsDeleteModalOpen(true)}
      />

      {isDeleteModalOpen && selectedSeller && (
        <div className="lsu-modal-overlay">
          <div className="lsu-modal-content">
            <div className="lsu-modal-header-danger">
              <AlertTriangle size={28} />
              <h3>¿Eliminar vendedor?</h3>
            </div>
            <p className="lsu-modal-text">
              Confirma que deseas eliminar a <strong>{selectedSeller.nombre.toUpperCase()}</strong>.
            </p>
            <div className="lsu-modal-footer">
              <button
                className="lsu-btn-secondary"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancelar
              </button>
              <button className="lsu-btn-danger" onClick={handleDelete}>
                <Trash2 size={16} /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListSellers;