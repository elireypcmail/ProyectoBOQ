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
    <div className="orders-container">

      {/* HEADER */}
      <div className="orders-header">
        <div>
          <h2>GESTIÓN DE CATEGORÍAS</h2>
          <p>{filteredCategories.length} CATEGORÍAS REGISTRADAS</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditName(""); setIsCreateModalOpen(true); }}>
          <Plus size={16} /> NUEVA CATEGORÍA
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="orders-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="BUSCAR CATEGORÍA..."
            style={{ textTransform: 'uppercase' }}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value.toUpperCase()); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="orders-table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th className="hide-mobile">ID</th>
              <th>NOMBRE</th>
              <th className="hide-mobile">ESTATUS</th>
              <th className="center">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {currentCategories.length > 0 ? (
              currentCategories.map(category => (
                <tr key={category.id}>
                  <td className="id hide-mobile">#{category.id}</td>
                  <td className="bold">{category.nombre.toUpperCase()}</td>
                  <td className="hide-mobile">
                    <span className="badge active">ACTIVO</span>
                  </td>
                  <td className="center">
                    <button className="icon-btn" onClick={() => { setSelectedCategory(category); setIsDetailsModalOpen(true); }}>
                      <SlOptionsVertical size={16}/>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-results">NO SE ENCONTRARON RESULTADOS</td>
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
          <span>PÁGINA {currentPage} DE {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* MODAL CREAR */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>CREAR CATEGORÍA</h3>
            <input 
              placeholder="NOMBRE"
              className="modal-input" 
              style={{ textTransform: 'uppercase' }}
              value={editName} 
              onChange={(e) => handleNameInput(e.target.value, setEditName)} 
            />
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsCreateModalOpen(false)}>CANCELAR</button>
              <button className="btn-primary" onClick={handleCreate}><Save size={16} /> CREAR</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {isEditModalOpen && selectedCategory && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>EDITAR CATEGORÍA</h3>
            <input 
              placeholder="NOMBRE"
              className="modal-input" 
              style={{ textTransform: 'uppercase' }}
              value={editName} 
              onChange={(e) => handleNameInput(e.target.value, setEditName)} 
            />
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsEditModalOpen(false)}>CANCELAR</button>
              <button className="btn-primary" onClick={handleUpdate}><Save size={16} /> GUARDAR</button>
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
              <h3>¿ELIMINAR CATEGORÍA?</h3>
            </div>
            <p>CONFIRMA QUE DESEAS ELIMINAR: <br/><strong>{selectedCategory.nombre.toUpperCase()}</strong></p>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>CANCELAR</button>
              <button className="btn-danger" onClick={handleDelete}><Trash2 size={16} /> ELIMINAR</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLES */}
      {isDetailsModalOpen && selectedCategory && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>DETALLES DE CATEGORÍA</h3>
            <div className="modal-info-body">
              <div className="detail-card"><strong>ID:</strong> <span>#{selectedCategory.id}</span></div>
              <div className="detail-card"><strong>NOMBRE:</strong> <span className="bold">{selectedCategory.nombre.toUpperCase()}</span></div>
              <div className="detail-card"><strong>ESTADO:</strong> <span>ACTIVO</span></div>
            </div>
            <div className="modal-footer" style={{ flexDirection: "column", gap: "0.75rem" }}>
              <button className="btn-primary" onClick={() => { setIsDetailsModalOpen(false); openEditModal(selectedCategory); }}><Pencil size={16} /> EDITAR</button>
              <button className="btn-danger" onClick={() => { setIsDetailsModalOpen(false); openDeleteModal(selectedCategory); }}><Trash2 size={16} /> ELIMINAR</button>
              <button className="btn-secondary" onClick={() => setIsDetailsModalOpen(false)}>CERRAR</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ListCategories;