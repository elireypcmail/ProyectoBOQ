import React, { useEffect, useState, useMemo } from "react";
import { useProducts } from "../../context/ProductsContext";
import {
  Search,
  Trash2,
  AlertTriangle,
  Plus,
  X,
  Loader2 // Importado para feedback de carga
} from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";
import ProductFormModal from "../Ui/ProductFormModal";
import ModalDetailed from "../Ui/ModalDetailed";
import ListPrices from "./ListPrices";
import ListLots from "./ListLots";

import "../../styles/components/ListProd.css";

const ListProducts = () => {
  const {
    products,
    categories,
    brands,
    getAllProducts,
    getAllCategories,
    getAllBrands,
    getProductsById, // Inyectamos la función del contexto
    createNewProduct,
    editProduct,
    deleteProductById,
    createNewCategory,
    createNewBrand
  } = useProducts();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLotsOpen, setIsLotsOpen] = useState(false);

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

  // Handler para obtener info fresca del producto antes de abrir el detalle
  const handleOpenDetail = async (id) => {
    setIsLoadingProduct(true);
    try {
      const freshProduct = await getProductsById(id);
      if (freshProduct) {
        setSelectedProduct(freshProduct);
        setIsDetailOpen(true);
      }
    } finally {
      setIsLoadingProduct(false);
    }
  };

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
    <div className="prod-container">
      <div className="prod-header">
        <div>
          <h2>Gestión de Productos</h2>
          <p>{filteredProducts.length} productos registrados</p>
        </div>
        <button className="btn-primary" onClick={() => { setSelectedProduct(null); setIsFormOpen(true); }}>
          <Plus size={16} /> Nuevo Producto
        </button>
      </div>

      <div className="prod-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="prod-table-wrapper">
        <table className="prod-table">
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
                  <button 
                    className="icon-btn" 
                    onClick={() => handleOpenDetail(p.id)}
                    disabled={isLoadingProduct}
                  >
                    {isLoadingProduct && selectedProduct?.id === p.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <SlOptionsVertical size={16} />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODALES UI */}
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
        <div className="modalProd-overlay">
          <div className="modalProd-content">
            <div className="modalProd-header-danger">
              <AlertTriangle size={28} />
              <h3>¿Eliminar producto?</h3>
            </div>
            <p>Confirma que deseas eliminar <strong>{selectedProduct.descripcion}</strong></p>
            <div className="modalProd-footer">
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