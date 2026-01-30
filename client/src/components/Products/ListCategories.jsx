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
  Plus
} from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";
import "../../styles/components/ListZone.css";

const ListCategories = () => {
  const { 
    categories,
    getAllCategories,
    createNewCategory,
    editCategory,
    deleteCategoryById
  } = useProducts();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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

  // -------------------- Filtrado y paginación --------------------
  const filteredCategories = useMemo(() => {
    return categories.filter(c =>
      c.nombre.toUpperCase().includes(searchTerm.toUpperCase())
    );
  }, [categories, searchTerm]);

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const currentCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // -------------------- Acciones --------------------
  const openEditModal = (category) => {
    setSelectedCategory(category);
    setEditName(category.nombre);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleCreate = async () => {
    if (!editName.trim()) return;
    try {
      await createNewCategory({ nombre: editName.trim() });
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
      await editCategory(selectedCategory.id, { nombre: editName.trim() });
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

  // -------------------- Render --------------------
  return (
    <div className="orders-container">

      {/* HEADER */}
      <div className="orders-header">
        <div>
          <h2>Gestión de Categorías</h2>
          <p>{filteredCategories.length} categorías registradas</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditName(""); setIsCreateModalOpen(true); }}>
          <Plus size={16} /> Nueva Categoría
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="orders-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar categoría..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="orders-table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th className="hide-mobile">ID</th>
              <th>Nombre</th>
              <th className="hide-mobile">Estatus</th>
              <th className="center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentCategories.length > 0 ? (
              currentCategories.map(category => (
                <tr key={category.id}>
                  <td className="id hide-mobile">#{category.id}</td>
                  <td>{category.nombre}</td>
                  <td className="hide-mobile">
                    <span className="badge active">Activo</span>
                  </td>
                  <td className="center">
                    <div className="actions-desktop">
                      <button className="icon-btn edit" onClick={() => { setSelectedCategory(category); setIsDetailsModalOpen(true); }}>
                        <SlOptionsVertical size={16}/>
                      </button>
                    </div>
                    <div className="actions-mobile">
                      <button className="icon-btn" onClick={() => { setSelectedCategory(category); setIsDetailsModalOpen(true); }}>
                        &#8942;
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-results">No se encontraron categorías</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="orders-pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
            <ChevronLeft size={18} />
          </button>
          <span>Página {currentPage} de {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* MODAL CREAR */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Crear Categoría</h3>
            <input 
              className="modal-input" 
              value={editName} 
              onChange={(e) => handleNameInput(e.target.value, setEditName)} 
            />
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsCreateModalOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleCreate}><Save size={16} /> Crear</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {isEditModalOpen && selectedCategory && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Editar Categoría</h3>
            <input 
              className="modal-input" 
              value={editName} 
              onChange={(e) => handleNameInput(e.target.value, setEditName)} 
            />
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleUpdate}><Save size={16} /> Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {isDeleteModalOpen && selectedCategory && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header-danger">
              <AlertTriangle size={28} />
              <h3>¿Eliminar categoría?</h3>
            </div>
            <p>Confirma que deseas eliminar <strong>{selectedCategory.nombre}</strong></p>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
              <button className="btn-danger" onClick={handleDelete}><Trash2 size={16} /> Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLES */}
      {isDetailsModalOpen && selectedCategory && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Detalles de {selectedCategory.nombre}</h3>
            <div className="modal-info-body">
              <div className="detail-card"><strong>ID:</strong> <span>#{selectedCategory.id}</span></div>
              <div className="detail-card"><strong>Nombre:</strong> <span>{selectedCategory.nombre}</span></div>
              <div className="detail-card"><strong>Estado:</strong> <span>Activo</span></div>
            </div>
            <div className="modal-footer" style={{ flexDirection: "column", gap: "0.75rem" }}>
              <button className="btn-primary" onClick={() => { setIsDetailsModalOpen(false); openEditModal(selectedCategory); }}><Pencil size={16} /> Editar</button>
              <button className="btn-danger" onClick={() => { setIsDetailsModalOpen(false); openDeleteModal(selectedCategory); }}><Trash2 size={16} /> Eliminar</button>
              <button className="btn-secondary" onClick={() => setIsDetailsModalOpen(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ListCategories;
