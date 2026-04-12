import React, { useEffect, useState, useMemo } from "react";
import { useProducts } from "../../context/ProductsContext";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Save,
  AlertTriangle,
  Plus,
  X
} from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";
import "../../styles/components/ListZone.css";

const ListCategories = ({ onClose }) => {
  const { 
    categories,
    getAllCategories,
    createNewCategory,
    editCategory,
    deleteCategoryById
  } = useProducts();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modales
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    getAllCategories();
  }, []);

  // -------------------- Función de formateo --------------------
  const handleNameInput = (value, setter) => {
    const formatted = value.replace(/[^a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s]/g, "").toUpperCase();
    setter(formatted);
  };

  // -------------------- Filtrado y Ordenación Alfabética --------------------
  const filteredCategories = useMemo(() => {
    const list = Array.isArray(categories) ? categories : [];
    
    // 1. Filtrar
    const filtered = list.filter(c =>
      (c.nombre ?? "")
        .toUpperCase()
        .includes(searchTerm.toUpperCase())
    );

    // 2. Ordenar A-Z
    return [...filtered].sort((a, b) => {
      const nameA = (a.nombre || "").toUpperCase();
      const nameB = (b.nombre || "").toUpperCase();
      return nameA.localeCompare(nameB);
    });
  }, [categories, searchTerm]);

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const currentCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  console.log("currentCategories")
  console.log(currentCategories)


  // -------------------- Acciones --------------------
  const openEditModal = (category) => {
    setSelectedCategory(category);
    setEditName(category.nombre.toUpperCase());
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleCreate = async () => {
    if (!editName.trim()) return;
    try {
      await createNewCategory({ nombre: editName.trim().toUpperCase() });
      setIsCreateModalOpen(false);
      setEditName("");
      getAllCategories();
    } catch (error) {
      console.error("Error al crear categoría:", error);
    }
  };

  const handleUpdate = async () => {
    if (!editName.trim() || !selectedCategory) return;
    try {
      await editCategory(selectedCategory.id, { nombre: editName.trim().toUpperCase() });
      setIsEditModalOpen(false);
      setSelectedCategory(null);
      setEditName("");
      getAllCategories();
    } catch (error) {
      console.error("Error al editar categoría:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    try {
      await deleteCategoryById(selectedCategory.id);
      setIsDeleteModalOpen(false);
      setSelectedCategory(null);
      getAllCategories();
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
    }
  };

  return (
    <div className="pl-main-container">
      {/* HEADER */}
      <div className="pl-header-section">
        <div className="pl-title-group">
          <h2>GESTIÓN DE CATEGORÍAS</h2>
          <p>{filteredCategories.length} CATEGORÍAS REGISTRADAS</p>
        </div>

        <div className="pl-actions-group">
          <button 
            className="pl-btn-action" 
            onClick={() => { setEditName(""); setIsCreateModalOpen(true); }}
          >
            <Plus size={16} /> NUEVA CATEGORÍA
          </button>

          {onClose && (
            <button 
              className="pl-btn-close" 
              onClick={onClose}
              title="Cerrar ventana"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="pl-toolbar">
        <div className="pl-search-wrapper">
          <Search size={16} />
          <input
            type="text"
            placeholder="BUSCAR CATEGORÍA..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value.toUpperCase()); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="pl-table-frame">
        <table className="pl-data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>NOMBRE</th>
              <th>ESTATUS</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {currentCategories.length > 0 ? (
              currentCategories.map(category => (
                <tr key={category.id}>
                  <td data-label="ID" className="pl-sku-cell">#{category.id}</td>
                  <td data-label="NOMBRE" style={{ fontWeight: 700 }}>{category.nombre.toUpperCase()}</td>
                  <td data-label="ESTATUS">ACTIVO</td>
                  <td data-label="ACCIONES">
                    <button className="pl-icon-only-btn" onClick={() => { setSelectedCategory(category); setIsDetailsModalOpen(true); }}>
                      <SlOptionsVertical size={16}/>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ padding: '2rem', color: 'var(--pl-muted)' }}>
                  NO SE ENCONTRARON RESULTADOS
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="pl-pagination-area">
          <button className="pl-page-node" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontWeight: 600 }}>{currentPage} / {totalPages}</span>
          <button className="pl-page-node" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* MODAL CREAR / EDITAR */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="pl-modal-overlay">
          <div className="pl-modal-box">
            <h3 className="pl-modal-title">
              {isCreateModalOpen ? "CREAR CATEGORÍA" : "EDITAR CATEGORÍA"}
            </h3>
            <div className="pl-modal-body">
              <label className="pl-modal-label">NOMBRE DE CATEGORÍA</label>
              <input 
                placeholder="EJ. BEBIDAS"
                className="pl-modal-input" 
                value={editName} 
                onChange={(e) => handleNameInput(e.target.value, setEditName)} 
              />
            </div>
            <div className="pl-modal-footer">
              <button className="pl-btn-secondary-outline" onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}>
                CANCELAR
              </button>
              <button className="pl-btn-action" onClick={isCreateModalOpen ? handleCreate : handleUpdate}>
                <Save size={16} /> {isCreateModalOpen ? "CREAR" : "GUARDAR"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {isDeleteModalOpen && selectedCategory && (
        <div className="pl-modal-overlay">
          <div className="pl-modal-box">
            <div className="pl-danger-header">
              <AlertTriangle size={28} />
              <h3>¿ELIMINAR CATEGORÍA?</h3>
            </div>
            <p className="pl-modal-text">
              ¿Estás seguro de eliminar <strong>{selectedCategory.nombre.toUpperCase()}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="pl-modal-footer">
              <button className="pl-btn-secondary-outline" onClick={() => setIsDeleteModalOpen(false)}>CANCELAR</button>
              <button className="pl-btn-action" style={{ background: 'var(--pl-danger)' }} onClick={handleDelete}>
                <Trash2 size={16} /> ELIMINAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLES */}
      {isDetailsModalOpen && selectedCategory && (
        <div className="pl-modal-overlay">
          <div className="pl-modal-box">
            <h3 className="pl-modal-title">DETALLES</h3>
            <div className="pl-info-list">
              <div className="pl-info-item"><strong>ID:</strong> <span>#{selectedCategory.id}</span></div>
              <div className="pl-info-item"><strong>NOMBRE:</strong> <span>{selectedCategory.nombre.toUpperCase()}</span></div>
              <div className="pl-info-item"><strong>ESTADO:</strong> <span>ACTIVO</span></div>
            </div>
            <div className="pl-modal-footer-stack">
              <button className="pl-btn-secondary" onClick={() => { setIsDetailsModalOpen(false); openEditModal(selectedCategory); }}>
                <Pencil size={16} /> EDITAR
              </button>
              <button className="pl-btn-danger-soft" onClick={() => { setIsDetailsModalOpen(false); openDeleteModal(selectedCategory); }}>
                <Trash2 size={16} /> ELIMINAR
              </button>
              <button className="pl-btn-secondary-outline" onClick={() => setIsDetailsModalOpen(false)}>CERRAR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListCategories;