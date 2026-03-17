import React, { useEffect, useState, useMemo } from "react"
import { useProducts } from "../../context/ProductsContext"
import {
  Search,
  Trash2,
  AlertTriangle,
  Plus,
  X,
  Loader2,
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { SlOptionsVertical } from "react-icons/sl"
import ProductFormModal from "../Ui/ProductFormModal"
import ModalDetailed from "../Ui/ModalDetailed"
import ModalCreateCatalog from "../Ui/ModalCreateCatalog"

import "../../styles/components/ListProd.css"

const ListProducts = () => {
  const {
    products,
    categories,
    brands,
    getAllProducts,
    getAllCategories,
    getAllBrands,
    getProductsById,
    createNewProduct,
    editProduct,
    deleteProductById,
    createNewCategory,
    createNewBrand,
    saveFilesProduct,
  } = useProducts()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isLoadingProduct, setIsLoadingProduct] = useState(false)
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false)
  
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    getAllProducts()
    getAllCategories()
    getAllBrands()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const filteredProducts = useMemo(() => {
    const upperTerm = searchTerm.toUpperCase()

    return products
      .filter((p) => {
        const matchDesc = p.descripcion?.toUpperCase().includes(upperTerm)
        const matchSku = p.sku?.toUpperCase().includes(upperTerm)
        return matchDesc || matchSku
      })
      .sort((a, b) => {
        return a.descripcion.localeCompare(b.descripcion)
      })
  }, [products, searchTerm])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredProducts, currentPage])

  const handleOpenDetail = async (id) => {
    setIsLoadingProduct(true)
    try {
      const freshProduct = await getProductsById(id)
      if (freshProduct) {
        setSelectedProduct(freshProduct)
        setIsDetailOpen(true)
      }
    } finally {
      setIsLoadingProduct(false)
    }
  }

  const handleOnCreateCategory = async (nombre) => {
    const res = await createNewCategory({ nombre })
    await getAllCategories()
    return res.data
  }

  const handleOnCreateBrand = async (nombre) => {
    const res = await createNewBrand({ nombre })
    await getAllBrands()
    return res.data
  }

  const handleSaveProduct = async (data, files) => {
    try {
      let productId = null

      if (selectedProduct) {
        await editProduct(selectedProduct.id, data)
        productId = selectedProduct.id
      } else {
        const res = await createNewProduct(data)
        productId = res?.data?.data?.id || res?.id || res?.data?.id
      }

      if (files && files.length > 0 && productId) {
        const filesJson = files.map((f, idx) => ({
          id: null,
          name: f.name,
          order: idx + 1,
        }))

        await saveFilesProduct(productId, files, filesJson)
      }

      await getAllProducts()
      setIsFormOpen(false)
      setSelectedProduct(null)
    } catch (error) {
      console.error("Error en el flujo de guardado:", error)
    }
  }

  const handleGenerateCatalog = (filters) => {
    setIsCatalogModalOpen(false)
  }

  return (
    <div className="prod-container">
      <div className="prod-header">
        <div>
          <h2>Gestión de Productos</h2>
          <p>{filteredProducts.length} productos registrados</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="btn-secondary"
            onClick={() => setIsCatalogModalOpen(true)}
          >
            <FileText size={16} /> Crear Catálogo
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              setSelectedProduct(null)
              setIsFormOpen(true)
            }}
          >
            <Plus size={16} /> Nuevo Producto
          </button>
        </div>
      </div>

      <div className="prod-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
          />
        </div>
      </div>

      <div className="prod-table-wrapper">
        <table className="prod-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Descripción</th>
              <th>Existencia</th>
              <th className="center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((p) => (
              <tr key={p.id}>
                <td className="id">{p.sku}</td>
                <td className="desc-column">{p.descripcion}</td>
                <td>{p.existencia_general}</td>
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

      {totalPages > 1 && (
        <div className="pagination-controls">
          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={18} />
          </button>
          
          <span className="pagination-info">
            Página {currentPage} de {totalPages}
          </span>

          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setSelectedProduct(null)
        }}
        onSubmit={handleSaveProduct}
        initialData={selectedProduct}
        categories={categories}
        brands={brands}
        products={products}
        onCreateCategory={handleOnCreateCategory}
        onCreateBrand={handleOnCreateBrand}
      />

      <ModalDetailed
        isOpen={isDetailOpen}
        product={selectedProduct}
        category={
          categories.find((c) => c.id === selectedProduct?.id_categoria)?.nombre
        }
        brand={brands.find((b) => b.id === selectedProduct?.id_marca)?.nombre}
        onClose={() => {
          setIsDetailOpen(false)
          setSelectedProduct(null)
        }}
        onEdit={() => {
          setIsDetailOpen(false)
          setIsFormOpen(true)
        }}
        onDelete={() => {
          setIsDetailOpen(false)
          setIsDeleteModalOpen(true)
        }}
      />

      <ModalCreateCatalog
        isOpen={isCatalogModalOpen}
        onClose={() => setIsCatalogModalOpen(false)}
        categories={categories}
        brands={brands}
        onGenerate={handleGenerateCatalog}
      />

      {isDeleteModalOpen && selectedProduct && (
        <div className="modalProd-overlay">
          <div className="modalProd-content">
            <div className="modalProd-header-danger">
              <AlertTriangle size={28} />
              <h3>¿Eliminar producto?</h3>
            </div>
            <p>
              Confirma que deseas eliminar{" "}
              <strong>{selectedProduct.descripcion}</strong>
            </p>
            <div className="modalProd-footer">
              <button
                className="btn-secondary"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-danger"
                onClick={async () => {
                  await deleteProductById(selectedProduct.id)
                  setIsDeleteModalOpen(false)
                  setSelectedProduct(null)
                  getAllProducts()
                }}
              >
                <Trash2 size={16} /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ListProducts