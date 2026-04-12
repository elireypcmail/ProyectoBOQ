import React, { useEffect, useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, Plus, Trash2, AlertTriangle, Loader2, X } from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";

// Context & Modals
import { usePurchases } from "../../context/PurchasesContext";
import SupplierDetailModal from './Ui/SupplierDetailModal';
import SupplierFormModal from './Ui/SupplierFormModal';

// Importación del nuevo CSS
import "../../styles/components/ListSuppliers.css";

const ListSuppliers = ({ onClose }) => {
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
    <div className="sp-main-container">
      {/* HEADER */}
      <div className="sp-header-section">
        <div className="sp-title-group">
          <h2>GESTIÓN DE PROVEEDORES</h2>
          <p>{filteredSuppliers.length} PROVEEDORES REGISTRADOS</p>
        </div>

        <div className="sp-actions-group">
          <button className="sp-btn-action" onClick={handleOpenCreate}>
            <Plus size={16} /> NUEVO PROVEEDOR
          </button>

          {onClose && (
            <button 
              className="sp-btn-close" 
              onClick={onClose}
              title="Cerrar ventana"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="sp-toolbar">
        <div className="sp-search-wrapper">
          <Search size={16} />
          <input
            type="text"
            placeholder="BUSCAR PROVEEDOR POR NOMBRE O EMAIL..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="sp-table-frame">
        <table className="sp-data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>NOMBRE</th>
              <th className="sp-hide-mobile">TELÉFONO</th>
              <th className="sp-hide-mobile">EMAIL</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {currentSuppliers.length > 0 ? (
              currentSuppliers.map(s => (
                <tr key={s.id}>
                  <td data-label="ID" className="sp-sku-cell">#{s.id}</td>
                  <td data-label="NOMBRE" className="sp-col-bold" title={s.nombre}>
                    {s.nombre.toUpperCase()}
                  </td>
                  <td data-label="TELÉFONO" className="sp-hide-mobile">
                    {s.telefono ? `+${s.telefono}` : "—"}
                  </td>
                  <td data-label="EMAIL" className="sp-hide-mobile sp-truncate" title={s.email}>
                    {s.email || "—"}
                  </td>
                  <td data-label="ACCIONES">
                    <button className="sp-icon-only-btn" onClick={() => { setSelectedSupplier(s); setIsDetailsModalOpen(true); }}>
                      <SlOptionsVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="sp-no-results">
                  NO SE ENCONTRARON PROVEEDORES
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="sp-pagination-area">
          <button className="sp-page-node" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontWeight: 600 }}>{currentPage} / {totalPages}</span>
          <button className="sp-page-node" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
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