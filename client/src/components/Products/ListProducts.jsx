import React, { useEffect, useState, useMemo } from "react";
import { useProducts } from "../../context/ProductsContext";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Save,
  FileText,
  AlertTriangle,
  Plus,
  X,
} from "lucide-react";
import ListLots from "./ListLots";
import ListEdeposits from "./ListEdeposits";
import ListInventory from "./ListInventory";
import { SlOptionsVertical } from "react-icons/sl";
import "../../styles/components/ListZone.css";
import "../../styles/components/ModalProductDetail.css";

const ListProducts = () => {
  const {
    products = [],
    categories = [],
    brands = [],
    getAllProducts,
    getAllCategories,
    getAllBrands,
    createNewProduct,
    editProduct,
    deleteProductById,
    createNewCategory,
    createNewBrand,
  } = useProducts();

  // Estados de paginación y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Estados de Modales
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isLotsModalOpen, setIsLotsModalOpen] = useState(false);
  
  // Estado de Tabs
  const [activeTab, setActiveTab] = useState("lotes");

  // Estados de Formulario
  const [editName, setEditName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState("");

  // Crear categoría/marca al vuelo
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingBrand, setIsCreatingBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");

  // Arrays seguros para evitar errores de map en undefined
  const safeProducts = Array.isArray(products) ? products : [];
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeBrands = Array.isArray(brands) ? brands : [];

  useEffect(() => {
    getAllProducts();
    getAllCategories();
    getAllBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------- Función de formateo --------------------
  const handleNameInput = (value, setter) => {
    const formatted = value
      .replace(/[^a-zA-Z0-9ÁÉÍÓÚÜÑáéíóúüñ\s]/g, "")
      .toUpperCase();
    setter(formatted);
  };

  const closeAllModals = () => {
  // Cerrar todos los modales
  setIsCreateModalOpen(false);
  setIsEditModalOpen(false);
  setIsDeleteModalOpen(false);
  setIsDetailsModalOpen(false);
  setIsLotsModalOpen(false);

  // Limpiar producto seleccionado
  setSelectedProduct(null);

  // Limpiar formularios
  resetForm();

  // Reiniciar creación al vuelo
  setIsCreatingCategory(false);
  setIsCreatingBrand(false);

  // Resetear tabs
  setActiveTab("lotes");
};


  // -------------------- Filtrado y paginación --------------------
  const filteredProducts = useMemo(() => {
    return safeProducts.filter((p) =>
      (p.descripcion || "").toUpperCase().includes(searchTerm.toUpperCase())
    );
  }, [safeProducts, searchTerm]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // -------------------- Acciones --------------------
  const openEditModal = (product) => {
    setSelectedProduct(product);
    setEditName(product.descripcion || "");
    setSelectedCategoryId(product.id_categoria || "");
    setSelectedBrandId(product.id_marca || "");
    setIsEditModalOpen(true);
    // Resetear estados de creación al vuelo
    setIsCreatingCategory(false);
    setIsCreatingBrand(false);
    setNewCategoryName("");
    setNewBrandName("");
  };

  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleCreate = async () => {
    if (!editName.trim() || !selectedCategoryId || !selectedBrandId) return;
    try {
      await createNewProduct({
        descripcion: editName.trim(),
        id_categoria: Number(selectedCategoryId),
        id_marca: Number(selectedBrandId),
        estatus: true,
      });
      setIsCreateModalOpen(false);
      resetForm();
      getAllProducts();
    } catch (error) {
      console.error("Error creando producto:", error);
    }
  };

  const handleUpdate = async () => {
    if (!editName.trim() || !selectedCategoryId || !selectedBrandId || !selectedProduct) return;
    try {
      await editProduct(selectedProduct.id, {
        descripcion: editName.trim(),
        id_categoria: Number(selectedCategoryId),
        id_marca: Number(selectedBrandId),
        estatus: true,
      });
      setIsEditModalOpen(false);
      setSelectedProduct(null);
      resetForm();
      getAllProducts();
    } catch (error) {
      console.error("Error editando producto:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    try {
      await deleteProductById(selectedProduct.id);
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
      getAllProducts();
    } catch (error) {
      console.error("Error eliminando producto:", error);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const res = await createNewCategory({ nombre: newCategoryName.trim() });
      setSelectedCategoryId(res.data.id);
      setIsCreatingCategory(false);
      setNewCategoryName("");
      getAllCategories();
    } catch (error) {
      console.error("Error creando categoría:", error);
    }
  };

  const handleCreateBrand = async () => {
    if (!newBrandName.trim()) return;
    try {
      const res = await createNewBrand({ nombre: newBrandName.trim() });
      setSelectedBrandId(res.data.id);
      setIsCreatingBrand(false);
      setNewBrandName("");
      getAllBrands();
    } catch (error) {
      console.error("Error creando marca:", error);
    }
  };

  const resetForm = () => {
    setEditName("");
    setSelectedCategoryId("");
    setSelectedBrandId("");
    setNewCategoryName("");
    setNewBrandName("");
  };

  // -------------------- Render --------------------
  return (
    <div className="orders-container">
      {/* HEADER */}
      <div className="orders-header">
        <div>
          <h2>Gestión de Productos</h2>
          <p>Productos registrados: {filteredProducts.length}</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
        >
          <Plus size={16} /> Nuevo Producto
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="orders-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
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
              <th className="hide-mobile">Categoría</th>
              <th className="hide-mobile">Marca</th>
              <th className="center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.length > 0 ? (
              currentProducts.map((product) => (
                <tr key={product.id}>
                  <td className="id hide-mobile">#{product.id}</td>
                  <td>{product.descripcion}</td>
                  <td className="hide-mobile">{product.categoria || "-"}</td>
                  <td className="hide-mobile">{product.marca || "-"}</td>
                  <td className="center">
                    <div className="actions-desktop">
                      <button
                        className="icon-btn edit"
                        onClick={() => {
                          setSelectedProduct(product);
                          setActiveTab("lotes"); // Resetear tab por defecto
                          setIsDetailsModalOpen(true);
                        }}
                      >
                        <SlOptionsVertical size={16} />
                      </button>
                    </div>
                    {/* Versión móvil simplificada */}
                    <div className="actions-mobile">
                      <button
                        className="icon-btn"
                        onClick={() => {
                          setSelectedProduct(product);
                          setActiveTab("lotes");
                          setIsDetailsModalOpen(true);
                        }}
                      >
                        &#8942;
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-results">
                  No se encontraron productos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="orders-pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            <ChevronLeft size={18} />
          </button>
          <span>
            Página {currentPage} de {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* MODAL CREAR / EDITAR PRODUCTO */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{isCreateModalOpen ? "Crear Producto" : "Editar Producto"}</h3>
            
            <label className="modal-label">Nombre del Producto</label>
            <input
              className="modal-input"
              placeholder="Ej: ASPIRINA 500MG"
              value={editName}
              onChange={(e) => handleNameInput(e.target.value, setEditName)}
            />

            {/* SELECCIÓN DE CATEGORÍA */}
            {!isCreatingCategory ? (
              <div className="select-zone-container">
                <div style={{ flex: 1 }}>
                  <label className="modal-label">Categoría</label>
                  <select
                    className="modal-input"
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                  >
                    <option value="">Selecciona una categoría</option>
                    {safeCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  className="btn-add-zone-primary"
                  style={{ marginTop: "24px" }}
                  onClick={() => setIsCreatingCategory(true)}
                  title="Nueva Categoría"
                >
                  <Plus size={16} />
                </button>
              </div>
            ) : (
              <div className="new-zone-container">
                <label className="modal-label">Nueva Categoría</label>
                <div className="new-zone-inputs">
                  <input
                    className="modal-input"
                    placeholder="Nombre de la categoría"
                    value={newCategoryName}
                    onChange={(e) =>
                      handleNameInput(e.target.value, setNewCategoryName)
                    }
                  />
                  <button className="btn-primary" onClick={handleCreateCategory}>
                    <Save size={16} />
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setIsCreatingCategory(false);
                      setNewCategoryName("");
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* SELECCIÓN DE MARCA */}
            {!isCreatingBrand ? (
              <div className="select-zone-container">
                <div style={{ flex: 1 }}>
                   <label className="modal-label">Marca</label>
                  <select
                    className="modal-input"
                    value={selectedBrandId}
                    onChange={(e) => setSelectedBrandId(e.target.value)}
                  >
                    <option value="">Selecciona una marca</option>
                    {safeBrands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  className="btn-add-zone-primary"
                  style={{ marginTop: "24px" }}
                  onClick={() => setIsCreatingBrand(true)}
                  title="Nueva Marca"
                >
                  <Plus size={16} />
                </button>
              </div>
            ) : (
              <div className="new-zone-container">
                <label className="modal-label">Nueva Marca</label>
                <div className="new-zone-inputs">
                  <input
                    className="modal-input"
                    placeholder="Nombre de la marca"
                    value={newBrandName}
                    onChange={(e) =>
                      handleNameInput(e.target.value, setNewBrandName)
                    }
                  />
                  <button className="btn-primary" onClick={handleCreateBrand}>
                    <Save size={16} />
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setIsCreatingBrand(false);
                      setNewBrandName("");
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setIsEditModalOpen(false);
                  resetForm();
                  setIsCreatingCategory(false);
                  setIsCreatingBrand(false);
                }}
              >
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={isCreateModalOpen ? handleCreate : handleUpdate}
              >
                <Save size={16} /> {isCreateModalOpen ? "Crear" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLES DEL PRODUCTO */}
      {isDetailsModalOpen && selectedProduct && (
        <div className="modal-overlay">
          <div className="product-modal" style={{ width: '90%', maxWidth: '1500px' }}>
            <div className="product-modal-header">
              <h3>Detalles del Producto</h3>
              <button
                className="close-btn"
                onClick={() => setIsDetailsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="product-modal-body">
              <div className="product-info">
                {/* Fallback de imagen por si no existe */}
                <img
                  src={selectedProduct.image || "/placeholder.png"}
                  alt={selectedProduct.descripcion}
                  // onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150"; }}  
                />
                <div className="product-details">
                  <div>
                    <strong>ID:</strong> <span>#{selectedProduct.id}</span>
                  </div>
                  <div>
                    <strong>Nombre:</strong> <span>{selectedProduct.descripcion}</span>
                  </div>
                  <div>
                    <strong>Categoría:</strong> <span>{selectedProduct.categoria || "N/A"}</span>
                  </div>
                  <div>
                    <strong>Marca:</strong> <span>{selectedProduct.marca || "N/A"}</span>
                  </div>
                  <div>
                    <strong>Existencia General:</strong> <span className="status-active">{selectedProduct.existencia_general || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* TABS DE NAVEGACIÓN */}
              <div className="product-modal-tabs">
                <button
                  className={activeTab === "lotes" ? "active" : ""}
                  onClick={() => setActiveTab("lotes")}
                >
                  Lotes
                </button>

                <button
                  className={activeTab === "depositos" ? "active" : ""}
                  onClick={() => setActiveTab("depositos")}
                >
                  Depósitos
                </button>

                <button
                  className={activeTab === "inventario" ? "active" : ""}
                  onClick={() => setActiveTab("inventario")}
                >
                  Inventario
                </button>
              </div>

              {/* CONTENIDO DE TABS */}
              <div className="product-lots-list">
                {activeTab === "lotes" && (
                  <ListLots id_producto={selectedProduct.id} />
                )}

                {activeTab === "depositos" && (
                  <ListEdeposits id_producto={selectedProduct.id} />
                )}

                {activeTab === "inventario" && (
                  <ListInventory id_producto={selectedProduct.id} />
                )}
              </div>

            </div>

            <div className="product-modal-footer">
              <button
                className="btn-primary"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  openEditModal(selectedProduct);
                }}
              >
                <Pencil size={16} /> Editar
              </button>
              <button
                className="btn-danger"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  openDeleteModal(selectedProduct);
                }}
              >
                <Trash2 size={16} /> Eliminar
              </button>
              <button
                className="btn-secondary"
                onClick={() => setIsDetailsModalOpen(false)}
                // onClick={closeAllModals}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LIST LOTES (INDIVIDUAL - OPCIONAL) */}
      {isLotsModalOpen && selectedProduct && (
        <div className="modal-overlay">
          <div
            className="modal-content"
            style={{ width: "90%", maxWidth: "1200px" }}
          >
            <div className="product-modal-header">
                <h3>Lotes de {selectedProduct.descripcion}</h3>
                <button className="close-btn" onClick={() => setIsLotsModalOpen(false)}><X size={20}/></button>
            </div>
            
            <ListLots id_producto={selectedProduct.id} />
            
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => {
                  setIsLotsModalOpen(false);
                  setSelectedProduct(null);
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR (AÑADIDO QUE FALTABA) */}
      {isDeleteModalOpen && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirmar Eliminación</h3>
            <div className="modal-body-text" style={{ padding: "20px 0", textAlign: "center" }}>
                <AlertTriangle size={48} color="#e63946" style={{ marginBottom: "10px" }} />
                <p>¿Estás seguro de que deseas eliminar el producto <strong>{selectedProduct.descripcion}</strong>?</p>
                <p style={{ fontSize: "0.9em", color: "#666" }}>Esta acción no se puede deshacer.</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedProduct(null);
                }}
              >
                Cancelar
              </button>
              <button
                className="btn-danger"
                onClick={handleDelete}
              >
                <Trash2 size={16} /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListProducts;
