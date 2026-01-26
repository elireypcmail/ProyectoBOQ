import React from "react"
import ProductItem from "./ProductItem"
import "../../styles/components/ProductGrid.css"

const ProductGrid = ({ listProducts = [], onProductClick }) => {
  return (
    <section className="product-grid">
      {listProducts.length > 0 ? (
        listProducts.map((product) => (
          <ProductItem
            key={product.id}
            product={product}
            onProductClick={onProductClick}
          />
        ))
      ) : (
        <div className="no-products-container">
          {/* <h2 className="no-products-title">No se encontraron productos</h2>
          <p className="no-products-text">
            Intenta cambiar los filtros o revisar otra categoría.
          </p> */}
        </div>
      )}
    </section>
  )
}

export default ProductGrid
