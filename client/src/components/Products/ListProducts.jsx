import React, { useEffect, useState, useMemo } from "react";
import { useProducts } from "../../context/ProductsContext";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  AlertTriangle,
  Plus,
  History,
  Boxes, // Nuevo icono para Lotes
  X
} from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";
import ProductFormModal from "../Ui/ProductFormModal";
import ModalDetailed from "../Ui/ModalDetailed";
import ListPrices from "./ListPrices";
import ListLots from "./ListLots"; // Importamos el componente de lotes
import "../../styles/components/ListZone.css";

const ListProducts = () => {
  const {
    products,
    categories,
    brands,
    getAllProducts,
    getAllCategories,
    getAllBrands,
    createNewProduct,
    editProduct,
    deleteProductById,
    createNewCategory,
    createNewBrand
  } = useProducts();

  console.log(products)

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // ESTADOS PARA MODALES DE SUB-GESTIÓN
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLotsOpen, setIsLotsOpen] = useState(false); // Estado para Lotes

  useEffect(() => {
    getAllProducts();
    getAllCategories();
    getAllBrands();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      p.descripcion.toUpperCase().includes(searchTerm.toUpperCase())
    );
  }, [products, searchTerm]);

  /* Handlers */
  const handleOnCreateCategory = async (nombre) => {
    const res = await createNewCategory({ nombre });
    await getAllCategories();
    return res.data;
  };

  const handleOnCreateBrand = async (nombre) => {
    const res = await createNewBrand({ nombre });
    await getAllBrands();
    return res.data;
  };

  return (
    <div className="orders-container">
      <div className="orders-header">
        <div>
          <h2>Gestión de Productos</h2>
          <p>{filteredProducts.length} productos registrados</p>
        </div>
        <button className="btn-primary" onClick={() => { setSelectedProduct(null); setIsFormOpen(true); }}>
          <Plus size={16} /> Nuevo Producto
        </button>
      </div>

      <div className="orders-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      <div className="orders-table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Descripción</th>
              <th>Existencia</th>
              <th>Estado</th>
              <th className="center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => (
              <tr key={p.id}>
                <td className="id">#{p.id}</td>
                <td>{p.descripcion}</td>
                <td>{p.existencia_general}</td>
                <td>
                  <span className={`badge ${p.estatus ? "active" : "inactive"}`}>
                    {p.estatus ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="center">
                  <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>


                    <button className="icon-btn" onClick={() => { setSelectedProduct(p); setIsDetailOpen(true); }}>
                      <SlOptionsVertical size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL DE LOTES (CONEXIÓN) --- */}
      {isLotsOpen && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '95%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>Lotes: {selectedProduct.descripcion}</h3>
              <button className="icon-btn" onClick={() => { setIsLotsOpen(false); setSelectedProduct(null); }}>
                <X size={20} />
              </button>
            </div>
            
            {/* Inyección de ListLots con la Prop requerida */}
            <ListLots id_producto={selectedProduct.id} />
            
            <div className="modal-footer" style={{ marginTop: '1rem' }}>
              <button className="btn-secondary" onClick={() => { setIsLotsOpen(false); setSelectedProduct(null); }}>
                Cerrar Lotes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL HISTORIAL DE PRECIOS --- */}
      {isHistoryOpen && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '95%', maxWidth: '1000px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>Historial de Precios: {selectedProduct.descripcion}</h3>
              <button className="icon-btn" onClick={() => { setIsHistoryOpen(false); setSelectedProduct(null); }}>
                <X size={20} />
              </button>
            </div>
            <ListPrices productId={selectedProduct.id} />
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => { setIsHistoryOpen(false); setSelectedProduct(null); }}>
                Cerrar Historial
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALES UI EXISTENTES */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedProduct(null); }}
        onSubmit={selectedProduct ? (data) => editProduct(selectedProduct.id, data) : createNewProduct}
        initialData={selectedProduct}
        categories={categories}
        brands={brands}
        onCreateCategory={handleOnCreateCategory}
        onCreateBrand={handleOnCreateBrand}
      />

      <ModalDetailed
        isOpen={isDetailOpen}
        product={selectedProduct}
        category={categories.find(c => c.id === selectedProduct?.id_categoria)?.nombre}
        brand={brands.find(b => b.id === selectedProduct?.id_marca)?.nombre}
        onClose={() => { setIsDetailOpen(false); setSelectedProduct(null); }}
        onEdit={() => { setIsDetailOpen(false); setIsFormOpen(true); }}
        onDelete={() => { setIsDetailOpen(false); setIsDeleteModalOpen(true); }}
      />

      {/* MODAL ELIMINAR */}
      {isDeleteModalOpen && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header-danger">
              <AlertTriangle size={28} />
              <h3>¿Eliminar producto?</h3>
            </div>
            <p>Confirma que deseas eliminar <strong>{selectedProduct.descripcion}</strong></p>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
              <button className="btn-danger" onClick={async () => {
                await deleteProductById(selectedProduct.id);
                setIsDeleteModalOpen(false);
                setSelectedProduct(null);
                getAllProducts();
              }}>
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