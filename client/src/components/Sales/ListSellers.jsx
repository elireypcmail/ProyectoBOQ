import React, { useEffect, useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, Plus, Trash2, AlertTriangle } from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";

// Contexts
import { useSales } from "../../context/SalesContext";
import { useEntity } from "../../context/EntityContext"; // Importamos el nuevo contexto

// Modals
import SellerDetailModal from './Ui/SellerDetailModal';
import SellerFormModal from './Ui/SellerFormModal';

// CSS
import "../../styles/components/ListSellers.css";

const ListSellers = () => {
  // Datos y acciones del Vendedor (SalesContext)
  const {
    sellers,
    getAllSellers,
    createNewSeller,
    editSeller,
    deleteSellerById,
    saveFilesSeller
  } = useSales();

  // Datos y acciones de Entidades (EntityContext)
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

  // Mapeamos los datos del EntityContext para que sean fáciles de usar
  const oficinas = entities.oficinas || [];
  const zonas = entities.zonas || [];

  // Cargamos los datos iniciales de ambos contextos
  useEffect(() => {
    getAllSellers();
    getAllEntities("oficinas");
    getAllEntities("zonas");
  }, []);

  const filteredSellers = useMemo(() => {
    return (sellers || []).filter(s =>
      s.nombre.toUpperCase().includes(searchTerm.toUpperCase())
    );
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
          name: f.name,
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

  // --- HANDLER PARA CREAR OFICINA DESDE EL MODAL DE VENDEDOR ---
  const handleCreateOficina = async (payload) => {
    try {
      // Usamos el createNewEntity del EntityContext
      const res = await createNewEntity("oficinas", payload);
      
      // Refrescamos la lista global de oficinas en el EntityContext
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

  return (
    <div className="lsu-container">
      {/* HEADER */}
      <div className="lsu-header">
        <div className="lsu-title-section">
          <h2>Gestión de Vendedores</h2>
          <p>{filteredSellers.length} vendedores registrados</p>
        </div>
        <button className="lsu-btn-primary" onClick={handleOpenCreate}>
          <Plus size={16} /> Nuevo Vendedor
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="lsu-toolbar">
        <div className="lsu-search-box">
          <Search size={16} className="lsu-search-icon" />
          <input
            placeholder="Buscar vendedor..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* TABLA */}
      <div className="lsu-table-wrapper">
        <table className="lsu-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th className="lsu-hide-mobile">Oficina</th>
              <th className="lsu-hide-mobile">Teléfono</th>
              <th className="lsu-hide-mobile">Email</th>
              <th className="lsu-text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentSellers.length ? currentSellers.map(s => (
              <tr key={s.id}>
                <td className="lsu-col-id">#{s.id}</td>
                <td className="lsu-col-name">{s.nombre}</td>
                <td className="lsu-hide-mobile">
                  <span className="lsu-badge">
                    {s.oficina}
                  </span>
                </td>
                <td className="lsu-hide-mobile">{s.telefono ? `+${s.telefono}` : "—"}</td>
                <td className="lsu-hide-mobile">{s.email || "—"}</td>
                <td className="lsu-text-center">
                  <button
                    className="lsu-icon-btn"
                    onClick={() => {
                      setSelectedSeller(s);
                      setIsDetailsModalOpen(true);
                    }}
                  >
                    <SlOptionsVertical size={16} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="lsu-no-results">
                  No se encontraron vendedores
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="lsu-pagination">
          <button
            className="lsu-page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            <ChevronLeft size={18} />
          </button>
          <span className="lsu-page-info">
            Página {currentPage} de {totalPages}
          </span>
          <button
            className="lsu-page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* MODALES */}
      <SellerFormModal
        isOpen={isFormModalOpen}
        seller={selectedSeller}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveSeller}
        isSaving={isSaving}
        oficinas={oficinas} // Vienen de EntityContext
        zonas={zonas}       // Vienen de EntityContext
        onCreateOficina={handleCreateOficina} 
      />

      <SellerDetailModal
        isOpen={isDetailsModalOpen}
        seller={selectedSeller}
        onClose={() => setIsDetailsModalOpen(false)}
        onEdit={handleOpenEdit}
        onDelete={() => setIsDeleteModalOpen(true)}
      />

      {/* MODAL ELIMINAR */}
      {isDeleteModalOpen && selectedSeller && (
        <div className="lsu-modal-overlay">
          <div className="lsu-modal-content">
            <div className="lsu-modal-header-danger">
              <AlertTriangle size={28} />
              <h3>¿Eliminar vendedor?</h3>
            </div>
            <p className="lsu-modal-text">
              Confirma que deseas eliminar a <strong>{selectedSeller.nombre}</strong>.
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