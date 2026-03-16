import React, { useEffect, useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, Plus, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";

// Context & Modals
import { usePurchases } from "../../context/PurchasesContext";
import SupplierDetailModal from './Ui/SupplierDetailModal';
import SupplierFormModal from './Ui/SupplierFormModal';

// Importación del nuevo CSS
import "../../styles/components/ListSuppliers.css";

const ListSuppliers = () => {
  const {
    suppliers,
    getAllSuppliers,
    createNewSupplier,
    editSupplier,
    deleteSupplierById,
    saveFilesSupplier
  } = usePurchases();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getAllSuppliers();
  }, []);

  const filteredSuppliers = useMemo(() => {
    return (suppliers || []).filter(s =>
      s.nombre.toUpperCase().includes(searchTerm.toUpperCase())
    );
  }, [suppliers, searchTerm]);

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const currentSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenCreate = () => {
    setSelectedSupplier(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setIsFormModalOpen(true);
  };

  const handleSaveSupplier = async (data, files) => {
    setIsSaving(true);
    try {
      let supplierId = null;
      if (selectedSupplier) {
        await editSupplier(selectedSupplier.id, data);
        supplierId = selectedSupplier.id;
      } else {
        const res = await createNewSupplier(data);
        supplierId = res?.data?.data?.id || res?.id || res?.data?.id;
      }

      if (files && files.length > 0 && supplierId) {
        const filesJson = files.map((f, idx) => ({
          id: null,
          name: f.name,
          order: idx + 1,
        }));
        await saveFilesSupplier(supplierId, files, filesJson);
      }

      await getAllSuppliers();
      setIsFormModalOpen(false);
      setSelectedSupplier(null);
    } catch (error) {
      console.error("Error al guardar proveedor:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    await deleteSupplierById(selectedSupplier.id);
    setIsDeleteModalOpen(false);
    setSelectedSupplier(null);
    getAllSuppliers();
  };

  return (
    <div className="lsu-container">
      {/* HEADER */}
      <div className="lsu-header">
        <div className="lsu-title-section">
          <h2>Gestión de Proveedores</h2>
          <p>{filteredSuppliers.length} proveedores registrados</p>
        </div>
        <button className="lsu-btn-primary" onClick={handleOpenCreate}>
          <Plus size={16} /> Nuevo Proveedor
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="lsu-toolbar">
        <div className="lsu-search-box">
          <Search size={16} className="lsu-search-icon" />
          <input
            placeholder="Buscar proveedor..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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
              <th className="lsu-hide-mobile">Teléfono</th>
              <th className="lsu-hide-mobile">Email</th>
              <th className="lsu-text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentSuppliers.length ? currentSuppliers.map(s => (
              <tr key={s.id}>
                <td className="lsu-col-id">#{s.id}</td>
                <td className="lsu-col-name">{s.nombre}</td>
                <td className="lsu-hide-mobile">{s.telefono ? `+${s.telefono}` : "—"}</td>
                <td className="lsu-hide-mobile">{s.email || "—"}</td>
                <td className="lsu-text-center">
                  <button className="lsu-icon-btn" onClick={() => { setSelectedSupplier(s); setIsDetailsModalOpen(true); }}>
                    <SlOptionsVertical size={16} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" className="lsu-no-results">No se encontraron proveedores</td></tr>
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
          <span className="lsu-page-info">Página {currentPage} de {totalPages}</span>
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
      <SupplierFormModal 
        isOpen={isFormModalOpen}
        supplier={selectedSupplier}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveSupplier}
        isSaving={isSaving} 
      />

      <SupplierDetailModal 
        isOpen={isDetailsModalOpen}
        supplier={selectedSupplier}
        onClose={() => setIsDetailsModalOpen(false)}
        onEdit={handleOpenEdit}
        onDelete={() => setIsDeleteModalOpen(true)}
      />

      {/* MODAL ELIMINAR */}
      {isDeleteModalOpen && selectedSupplier && (
        <div className="lsu-modal-overlay">
          <div className="lsu-modal-content">
            <div className="lsu-modal-header-danger">
              <AlertTriangle size={28} />
              <h3>¿Eliminar proveedor?</h3>
            </div>
            <p className="lsu-modal-text">Confirma que deseas eliminar a <strong>{selectedSupplier.nombre}</strong>.</p>
            <div className="lsu-modal-footer">
              <button className="lsu-btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
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

export default ListSuppliers;