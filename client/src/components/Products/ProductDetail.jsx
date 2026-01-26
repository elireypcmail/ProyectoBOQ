// Dependencies
import { useState, useEffect } from "react";
// Components
import ReviewForm from "../Common/ReviewForm";
// Styles
import "../../styles/common/ReviewForm.css";
import "../../styles/components/Tabs.css";

import products from "./products";

const ProductDetail = ({
  product,
  variants = [],
  images = [],
  onBackClick,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(
    variants.length > 0 ? variants[0].id : null
  );
  const [activeTab, setActiveTab] = useState("description");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [isInCart, setIsInCart] = useState(false);

  // --- Pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 3;
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) setCurrentPage(pageNumber);
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  const getCart = () => JSON.parse(localStorage.getItem("cart")) || [];
  const saveCart = (cart) => localStorage.setItem("cart", JSON.stringify(cart));

  // --- Verificar si la variante está en el carrito ---
  useEffect(() => {
    const currentCart = getCart();
    const exists = currentCart.some(
      (item) => item.id === product.id && item.variantId === selectedVariant
    );
    setIsInCart(exists);
  }, [selectedVariant]);

  const updateQuantityInCart = (newQuantity) => {
    const currentCart = getCart();
    const updatedCart = currentCart.map((item) =>
      item.id === product.id && item.variantId === selectedVariant
        ? { ...item, quantity: newQuantity }
        : item
    );

    saveCart(updatedCart);
    window.dispatchEvent(new Event("cartUpdated")); // 🔔
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    const variant = variants.find((v) => v.id === selectedVariant);

    if (value > 0 && value <= (variant?.stock || 1)) {
      setQuantity(value);
      if (isInCart) updateQuantityInCart(value);
    }
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => {
      const newQty = Math.max(1, prev - 1);
      if (isInCart) updateQuantityInCart(newQty);
      return newQty;
    });
  };

  const increaseQuantity = () => {
    const variant = variants.find((v) => v.id === selectedVariant);
    setQuantity((prev) => {
      const newQty = Math.min(prev + 1, variant?.stock || 1);
      if (isInCart) updateQuantityInCart(newQty);
      return newQty;
    });
  };

  const handleVariantChange = (id) => setSelectedVariant(id);
  const handleTabChange = (tab) => setActiveTab(tab);

  const handleReviewSubmit = (newReview) => {
    setReviews([newReview, ...reviews]);
    setShowReviewForm(false);
    setCurrentPage(1);
  };

  // --- Variante seleccionada ---
  const variant = variants.find((v) => v.id === selectedVariant);

  const numericPrice = variant ? parseFloat(variant.price) : 0;
  const hasDiscount =
    variant?.discount_active && variant?.discount_percentage > 0;

  const finalPrice = hasDiscount
    ? numericPrice - (numericPrice * variant.discount_percentage) / 100
    : numericPrice;

  // --- AGREGAR / QUITAR ---
  const handleToggleCart = () => {
    if (!variant) return;

    const currentCart = getCart();

    const exists = currentCart.some(
      (item) => item.id === product.id && item.variantId === variant.id
    );

    if (exists) {
      const updatedCart = currentCart.filter(
        (item) => !(item.id === product.id && item.variantId === variant.id)
      );
      saveCart(updatedCart);
      window.dispatchEvent(new Event("cartUpdated")); // 🔔
      setIsInCart(false);
    } else {
      const newItem = {
        id: product.id,
        name: product.name,
        variantId: variant.id,
        variantName:
          variant.material || variant.color || variant.size || "Variante",
        price: finalPrice,
        quantity,
        images,
        variants: [variant],
      };

      saveCart([...currentCart, newItem]);
      window.dispatchEvent(new Event("cartUpdated")); // 🔔
      setIsInCart(true);
    }
  };

  // --- COMPRAR AHORA ---
  const handleBuyNow = () => {
    if (!variant) return;

    const newItem = {
      id: product.id,
      name: product.name,
      variantId: variant.id,
      variantName:
        variant.material || variant.color || variant.size || "Variante",
      price: finalPrice,
      quantity,
      images,
      variants: [variant],
    };

    saveCart([newItem]);
    window.dispatchEvent(new Event("cartUpdated")); // 🔔
  };

  return (
    <section className="product-detail-section">
      <div className="container">
        {/* --- BREADCRUMBS --- */}
        <div className="breadcrumbs">
          <button onClick={onBackClick} className="back-buttonProduct">
            ← Volver a productos
          </button>
          <span className="breadcrumb-separator">/</span>
          <span className="current-page">{product.name}</span>
        </div>

        {/* --- PRODUCTO --- */}
        <div className="product-detail">
          {/* --- IMÁGENES DEL PRODUCTO --- */}
          <div className="product-detail-images">
            <div className="main-image">
              {images.find((img) => img.is_main) ? (
                <img
                  src={`data:${
                    images.find((img) => img.is_main).mime_type
                  }base64,${images.find((img) => img.is_main).data}`}
                  alt={product.name}
                  className="product-image-large"
                />
              ) : (
                <div className="product-image-large placeholder"></div>
              )}
            </div>

            <div className="thumbnail-images">
              {images.map((img) => (
                <img
                  key={img.id}
                  src={`data:${img.mime_type}base64,${img.data}`}
                  alt="Thumbnail"
                  className="thumbnail"
                />
              ))}
            </div>
          </div>

          {/* --- INFORMACIÓN DEL PRODUCTO --- */}
          <div className="product-detail-info">
            <h1 className="product-detail-name">{product.name}</h1>

            {/* --- PRECIO --- */}
            <div className="product-detail-price">
              {variant ? (
                <>
                  {hasDiscount && (
                    <span className="original-price">
                      {formatPrice(numericPrice)}
                    </span>
                  )}
                  <span className="current-price">
                    {formatPrice(finalPrice)}
                  </span>
                  {hasDiscount && (
                    <span className="discount-badge">
                      -{variant.discount_percentage}% OFF
                    </span>
                  )}
                </>
              ) : (
                <p className="no-variant-price">
                  Selecciona una variante para ver el precio.
                </p>
              )}
            </div>

            {/* --- VARIANTES --- */}
            {variants.length > 0 && (
              <div className="product-variants">
                <h3 className="variant-title">Variantes:</h3>
                <div className="variant-options">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      className={`variant-option ${
                        selectedVariant === v.id ? "selected" : ""
                      } ${v.stock === 0 ? "unavailable" : ""}`}
                      onClick={() => v.stock > 0 && handleVariantChange(v.id)}
                      disabled={v.stock === 0}
                    >
                      {v.material || v.color || v.size || "Variante"}
                      {v.stock === 0 && (
                        <span className="unavailable-text">Agotado</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* --- CANTIDAD --- */}
            <div className="quantity-selector">
              <h3 className="quantity-title">Cantidad:</h3>
              <div className="quantity-controls">
                <button onClick={decreaseQuantity} className="quantity-btn">
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={variant?.stock || 1}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="quantity-input"
                />
                <button onClick={increaseQuantity} className="quantity-btn">
                  +
                </button>
              </div>
              <span className="stock-info">
                {variant?.stock > 10
                  ? "En stock"
                  : variant?.stock > 0
                  ? `¡Solo quedan ${variant.stock} unidades!`
                  : "Agotado"}
              </span>
            </div>

            {/* --- BOTONES DE ACCIÓN --- */}
            <div className="product-actions-detail">
              <button
                className={`add-to-cart-btn-large ${
                  isInCart ? "remove-from-cart" : ""
                }`}
                onClick={handleToggleCart}
              >
                {isInCart ? "QUITAR DEL CARRITO" : "AGREGAR AL CARRITO"}
              </button>
              <button className="buy-now-btn" onClick={handleBuyNow}>
                COMPRAR AHORA
              </button>
            </div>
          </div>
        </div>

        {/* --- TABS (Descripción, Detalles, Reseñas) --- */}
        <div className="product-tabs">
          <div className="tabs-header">
            <button
              className={`tab-btn ${
                activeTab === "description" ? "active" : ""
              }`}
              onClick={() => handleTabChange("description")}
            >
              Descripción
            </button>
            <button
              className={`tab-btn ${activeTab === "details" ? "active" : ""}`}
              onClick={() => handleTabChange("details")}
            >
              Detalles
            </button>
            <button
              className={`tab-btn ${activeTab === "reviews" ? "active" : ""}`}
              onClick={() => handleTabChange("reviews")}
            >
              Reseñas ({reviews.length})
            </button>
          </div>

          {/* Descripción */}
          <div
            className={`tab-pane ${
              activeTab === "description" ? "active" : ""
            }`}
          >
            <h3>Descripción del Producto</h3>
            <p>{product.description}</p>
          </div>

          {/* Detalles */}
          <div
            className={`tab-pane ${activeTab === "details" ? "active" : ""}`}
          >
            <h3>Detalles de la Variante</h3>
            {variant ? (
              <ul>
                <li>
                  <strong>Material:</strong>{" "}
                  {variant.material || "No especificado"}
                </li>
                <li>
                  <strong>Tamaño:</strong> {variant.size || "No aplica"}
                </li>
                <li>
                  <strong>Color:</strong> {variant.color || "No aplica"}
                </li>
                <li>
                  <strong>Stock:</strong> {variant.stock} unidades
                </li>
                <li>
                  <strong>SKU:</strong> {variant.sku}
                </li>
              </ul>
            ) : (
              <p>No hay variantes disponibles.</p>
            )}
          </div>

          {/* Reseñas */}
          <div
            className={`tab-pane ${activeTab === "reviews" ? "active" : ""}`}
          >
            <div className="reviews-header">
              <h3>Opiniones</h3>
              <button
                className="write-review-btn"
                onClick={() => setShowReviewForm(true)}
              >
                ESCRIBIR OPINIÓN
              </button>
            </div>

            {showReviewForm && (
              <div className="review-form-modal">
                <div className="review-form-modal-content">
                  <button
                    className="review-form-modal-close"
                    onClick={() => setShowReviewForm(false)}
                  >
                    ×
                  </button>
                  <ReviewForm
                    onSubmit={handleReviewSubmit}
                    onCancel={() => setShowReviewForm(false)}
                  />
                </div>
              </div>
            )}

            <div className="reviews-list">
              {currentReviews.length === 0 ? (
                <p>No hay reseñas todavía.</p>
              ) : (
                currentReviews.map((review) => (
                  <div key={review.id} className="review-item">
                    <h4>{review.title}</h4>
                    <p>{review.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* --- PRODUCTOS RELACIONADOS --- */}
        <div className="related-products">
          <h2 className="related-title">También te puede interesar</h2>
          <div className="related-grid">
            {Array.from({ length: 4 }).map((_, i) => {
              const related = products[(product.id + i) % products.length];
              return (
                <div key={i} className="related-item">
                  <div className="related-info">
                    <h3 className="related-name">{related.name}</h3>
                    <div className="related-price">
                      {formatPrice(related.price)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- PAGINACIÓN DE RESEÑAS --- */}
        {activeTab === "reviews" && totalPages > 1 && (
          <div className="pagination">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
                onClick={() => paginate(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductDetail;
