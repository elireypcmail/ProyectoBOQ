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

const ListProducts = () => {
  const { 
    products = [],
    categories = [],
    brands = [],
    getAllProducts,
    getAllCategories,
    getAllBrands,
    createNewProduct,
    editedProduct,
    deleteProductById,
    createNewCategory,
    createNewBrand
  } = useProducts();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modales
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [editName, setEditName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState("");

  // Crear categoría/marca al vuelo
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingBrand, setIsCreatingBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");

  // Arrays seguros
  const safeProducts = Array.isArray(products) ? products : [];
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeBrands = Array.isArray(brands) ? brands : [];

  useEffect(() => {
    getAllProducts();
    getAllCategories();
    getAllBrands();
  }, []);

  // -------------------- Función de formateo --------------------
  const handleNameInput = (value, setter) => {
    const formatted = value.replace(/[^a-zA-Z0-9ÁÉÍÓÚÜÑáéíóúüñ\s]/g, "").toUpperCase();
    setter(formatted);
  };

  // -------------------- Filtrado y paginación --------------------
  const filteredProducts = useMemo(() => {
    return safeProducts.filter(p =>
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
        estatus: true
      });
      setIsCreateModalOpen(false);
      setEditName("");
      setSelectedCategoryId("");
      setSelectedBrandId("");
      getAllProducts();
    } catch (error) {
      console.error("Error creando producto:", error);
    }
  };

  const handleUpdate = async () => {
    if (!editName.trim() || !selectedCategoryId || !selectedBrandId || !selectedProduct) return;
    try {
      await editedProduct(selectedProduct.id, {
        descripcion: editName.trim(),
        id_categoria: Number(selectedCategoryId),
        id_marca: Number(selectedBrandId),
        estatus: true
      });
      setIsEditModalOpen(false);
      setSelectedProduct(null);
      setEditName("");
      setSelectedCategoryId("");
      setSelectedBrandId("");
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

  // -------------------- Render --------------------
  return (
    <div className="orders-container">
      {/* HEADER */}
      <div className="orders-header">
        <div>
          <h2>Gestión de Productos</h2>
          <p>Productos registrados: {filteredProducts.length}</p>
        </div>
        <button className="btn-primary" onClick={() => {
          setEditName(""); 
          setSelectedCategoryId(""); 
          setSelectedBrandId(""); 
          setIsCreateModalOpen(true);
        }}>
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
              <th className="hide-mobile">Categoría</th>
              <th className="hide-mobile">Marca</th>
              <th className="center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.length > 0 ? currentProducts.map(product => (
              <tr key={product.id}>
                <td className="id hide-mobile">#{product.id}</td>
                <td>{product.descripcion}</td>
                <td className="hide-mobile">{product.categoria || "-"}</td>
                <td className="hide-mobile">{product.marca || "-"}</td>
                <td className="center">
                  <div className="actions-desktop">
                    <button className="icon-btn edit" onClick={() => { setSelectedProduct(product); setIsDetailsModalOpen(true); }}>
                      <SlOptionsVertical size={16}/>
                    </button>
                  </div>
                  <div className="actions-mobile">
                    <button className="icon-btn" onClick={() => { setSelectedProduct(product); setIsDetailsModalOpen(true); }}>
                      &#8942;
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="no-results">No se encontraron productos</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="orders-pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={18} /></button>
          <span>Página {currentPage} de {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={18} /></button>
        </div>
      )}

      {/* MODAL CREAR / EDITAR PRODUCTO */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{isCreateModalOpen ? "Crear Producto" : "Editar Producto"}</h3>
            <input
              className="modal-input"
              placeholder="Nombre"
              value={editName}
              onChange={(e) => handleNameInput(e.target.value, setEditName)}
            />

            {/* CATEGORÍA */}
            {!isCreatingCategory ? (
              <div className="select-zone-container">
                <select className="modal-input" value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)}>
                  <option value="">Selecciona una categoría</option>
                  {safeCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                </select>
                <button className="btn-add-zone-primary" onClick={() => setIsCreatingCategory(true)}><Plus size={16} /> Categoría</button>
              </div>
            ) : (
              <div className="new-zone-container">
                <label>Nueva Categoría</label>
                <div className="new-zone-inputs">
                  <input
                    className="modal-input"
                    placeholder="Nombre de la categoría"
                    value={newCategoryName}
                    onChange={(e) => handleNameInput(e.target.value, setNewCategoryName)}
                  />
                  <button className="btn-primary" onClick={handleCreateCategory}><Save size={16} /> Guardar</button>
                  <button className="btn-secondary" onClick={() => { setIsCreatingCategory(false); setNewCategoryName(""); }}>Cancelar</button>
                </div>
              </div>
            )}

            {/* MARCA */}
            {!isCreatingBrand ? (
              <div className="select-zone-container">
                <select className="modal-input" value={selectedBrandId} onChange={(e) => setSelectedBrandId(e.target.value)}>
                  <option value="">Selecciona una marca</option>
                  {safeBrands.map(brand => <option key={brand.id} value={brand.id}>{brand.nombre}</option>)}
                </select>
                <button className="btn-add-zone-primary" onClick={() => setIsCreatingBrand(true)}><Plus size={16} /> Marca</button>
              </div>
            ) : (
              <div className="new-zone-container">
                <label>Nueva Marca</label>
                <div className="new-zone-inputs">
                  <input
                    className="modal-input"
                    placeholder="Nombre de la marca"
                    value={newBrandName}
                    onChange={(e) => handleNameInput(e.target.value, setNewBrandName)}
                  />
                  <button className="btn-primary" onClick={handleCreateBrand}><Save size={16} /> Guardar</button>
                  <button className="btn-secondary" onClick={() => { setIsCreatingBrand(false); setNewBrandName(""); }}>Cancelar</button>
                </div>
              </div>
            )}

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                setEditName("");
                setSelectedCategoryId("");
                setSelectedBrandId("");
                setIsCreatingCategory(false);
                setNewCategoryName("");
                setIsCreatingBrand(false);
                setNewBrandName("");
              }}>Cancelar</button>
              <button className="btn-primary" onClick={isCreateModalOpen ? handleCreate : handleUpdate}><Save size={16} /> {isCreateModalOpen ? "Crear" : "Guardar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListProducts;
