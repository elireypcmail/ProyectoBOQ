import React, { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import { useProducts } from "../../../../context/ProductsContext";
import "../../../../styles/ui/subModals/SearchProductModal.css"

const SearchProductModal = ({ onClose, onSelect, selectedItems = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { products, getAllProducts } = useProducts();

  useEffect(() => {
    if (products.length === 0) getAllProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="spm-overlay">
      <div className="spm-container">
        <header className="spm-header">
          <h3 className="spm-title">Seleccionar Producto</h3>
          <button className="spm-btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        <div className="spm-search-wrapper">
          <Search size={18} className="spm-search-icon" />
          <input 
            className="spm-input"
            autoFocus 
            placeholder="Buscar por nombre o SKU..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
          />
        </div>

        <div className="spm-results-list">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(p => {
              const isAlreadySelected = selectedItems.some(item => item.id === p.id);

              return (
                <div 
                  key={p.id} 
                  className={`spm-product-item ${isAlreadySelected ? "spm-item-disabled" : ""}`} 
                  onClick={() => !isAlreadySelected && onSelect(p)}
                >
                  <div className="spm-item-info">
                    <span className="spm-item-sku">
                      {p.sku} 
                      {isAlreadySelected && <span className="spm-badge-selected">(SELECCIONADO)</span>}
                    </span>
                    <span className="spm-item-desc">{p.descripcion}</span>
                  </div>
                  <div className="spm-item-stats">
                    <span className="spm-stat">Costo: <b>${p.costo_unitario}</b></span>
                    <span className="spm-stat">Stock: <b>{p.existencia_general}</b></span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="spm-empty-state">
              No se encontraron productos.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchProductModal;