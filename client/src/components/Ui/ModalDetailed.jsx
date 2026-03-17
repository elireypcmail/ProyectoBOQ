import React, { useState, useEffect } from "react";
import { 
  Pencil, Trash2, X, Package, Tag, Layers, 
  TrendingUp, DollarSign, Bookmark, AlertCircle,
  History, Boxes, Warehouse, Lock, Image as ImageIcon,
  Loader2, Maximize2, Percent 
} from "lucide-react";
import { useProducts } from "../../context/ProductsContext";
import ListLots from "../Products/ListLots"; 
import ListPrices from "../Products/ListPrices";
import ListEdeposits from "../Products/ListEdeposits";
import "../../styles/ui/ModalDetailed.css";

const ModalDetailed = ({
  isOpen,
  product: initialProduct,
  category,
  brand,
  onClose,
  onEdit,
  onDelete
}) => {
  const [activeTab, setActiveTab] = useState("general");
  const [detailedProduct, setDetailedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const { getAuditProd, audits, getProductsById } = useProducts();

  useEffect(() => {
    const fetchFreshData = async () => {
      if (isOpen && initialProduct?.id) {
        setIsLoading(true);
        setActiveTab("general");
        setSelectedImgIdx(0);
        setIsZoomOpen(false);
        try {
          const freshData = await getProductsById(initialProduct.id);
          setDetailedProduct(freshData);
          getAuditProd(initialProduct.id);
        } catch (error) {
          console.error("Error cargando detalle:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchFreshData();
  }, [isOpen, initialProduct?.id]);

  if (!isOpen) return null;

  const product = detailedProduct || initialProduct;
  if (!product) return null;

  const tieneLotes = product.estatus_lotes === true || product.estatus_lotes === 1;
  const auditList = Array.isArray(audits) ? audits : (audits?.data || []);
  const hasHistory = auditList.length > 0;

  const formatCurrency = (val) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

  const handleRefreshProduct = async () => {
    const fresh = await getProductsById(product.id);
    setDetailedProduct(fresh);
  };

  const images = product.images || [];
  const currentImage = images.length > 0 ? images[selectedImgIdx] : null;
  const currentImageSrc = currentImage ? `data:${currentImage.mime_type};base64,${currentImage.data}` : null;

  return (
    <div className="pdm-overlay">
      <div className="pdm-container">
        
        {/* HEADER */}
        <div className="pdm-header">
          <div className="pdm-title-group">
            <div className="pdm-icon-main">
              {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Package size={24} />}
            </div>
            <div>
              <h3 className="pdm-title">{product.descripcion.toUpperCase()}</h3>
              <span className={`pdm-badge ${product.inventario_estatus ? 'active' : 'inactive'}`}>
                {product.inventario_estatus ? "ACTIVO" : "INACTIVO"}
              </span>
            </div>
          </div>
          <button className="pdm-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {/* TABS */}
        <div className="pdm-tabs">
          <button className={`pdm-tab-btn ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
            <Bookmark size={16} /> GENERAL
          </button>
          
          {tieneLotes && (
            <button className={`pdm-tab-btn ${activeTab === 'lotes' ? 'active' : ''}`} onClick={() => setActiveTab('lotes')}>
              <Boxes size={16} /> LOTES
            </button>
          )}

          <button className={`pdm-tab-btn ${activeTab === 'depositos' ? 'active' : ''}`} onClick={() => setActiveTab('depositos')}>
            <Warehouse size={16} /> EXISTENCIAS
          </button>
          <button className={`pdm-tab-btn ${activeTab === 'precios' ? 'active' : ''}`} onClick={() => setActiveTab('precios')}>
            <History size={16} /> AUDITORÍA
          </button>
        </div>

        {/* BODY */}
        <div className="pdm-body">
          {activeTab === "general" && (
            <div className="pdm-tab-content animate-fade-in">
              <div className="pdm-general-hero">
                <div className="pdm-image-section">
                    <div 
                      className={`pdm-image-container ${currentImage ? 'zoom-enabled' : ''}`}
                      onClick={() => currentImage && setIsZoomOpen(true)}
                    >
                      {currentImage ? (
                        <>
                          <img src={currentImageSrc} alt={product.descripcion} className="pdm-image-view" />
                          <div className="pdm-image-hover-icon">
                            <Maximize2 size={20} />
                          </div>
                        </>
                      ) : (
                        <div className="pdm-image-placeholder">
                          <ImageIcon size={48} strokeWidth={1.5} />
                          <span>SIN IMAGEN</span>
                        </div>
                      )}
                    </div>

                    {images.length > 1 && (
                      <div className="pdm-thumbnail-list">
                        {images.map((img, idx) => (
                          <img 
                            key={img.id || idx}
                            src={`data:${img.mime_type};base64,${img.data}`}
                            className={`pdm-thumb ${selectedImgIdx === idx ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImgIdx(idx);
                            }}
                            alt="thumb"
                          />
                        ))}
                      </div>
                    )}
                </div>

                <div className="pdm-main-info">
                  <div className="pdm-info-item">
                    <label><Layers size={14} /> CATEGORÍA</label>
                    <p>{(category || product.categoria || "N/A").toUpperCase()}</p>
                  </div>
                  <div className="pdm-info-item">
                    <label><Tag size={14} /> MARCA</label>
                    <p>{(brand || product.marca || "N/A").toUpperCase()}</p>
                  </div>
                  <div className="pdm-info-item">
                    <label><Lock size={14} /> SKU</label>
                    <p>{(product.sku || "N/A").toUpperCase()}</p>
                  </div>
                </div>
              </div>

              <div className="pdm-divider"></div>

              <div className="pdm-stat-card inventory" style={{ marginBottom: '1.5rem' }}>
                 <div className="pdm-stat-icon"><Package size={20} /></div>
                 <div className="pdm-stat-content">
                    <small>EXISTENCIA GENERAL ACTUALIZADA</small>
                    <strong style={{ fontSize: '1.2rem' }}>{product.existencia_general} UNIDADES</strong>
                 </div>
              </div>

              <div className="pdm-stats-grid">
                <div className="pdm-stat-card warning">
                  <div className="pdm-stat-icon"><AlertCircle size={18} /></div>
                  <div className="pdm-stat-content">
                    <small>STOCK MÍNIMO</small>
                    <strong>{product.stock_minimo_general} UNIDADES</strong>
                  </div>
                </div>
                <div className="pdm-stat-card finance">
                  <div className="pdm-stat-icon"><DollarSign size={18} /></div>
                  <div className="pdm-stat-content">
                    <small>COSTO UNITARIO</small>
                    <strong>{formatCurrency(product.costo_unitario)}</strong>
                  </div>
                </div>
                <div className="pdm-stat-card finance">
                  <div className="pdm-stat-icon"><TrendingUp size={18} /></div>
                  <div className="pdm-stat-content">
                    <small>PRECIO DE VENTA</small>
                    <strong>{formatCurrency(product.precio_venta)}</strong>
                  </div>
                </div>
                
                <div className="pdm-stat-card finance">
                  <div className="pdm-stat-icon" style={{ background: '#eef2ff', color: '#6366f1' }}>
                    <Percent size={18} /> 
                  </div>
                  <div className="pdm-stat-content">
                    <small>MARGEN DE GANANCIA</small>
                    <strong>{product.margen_ganancia}%</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "lotes" && tieneLotes && (
            <div className="pdm-tab-content animate-fade-in">
              <ListLots id_producto={product.id} onRefreshProducts={handleRefreshProduct} />
            </div>
          )}

          {activeTab === "depositos" && (
            <div className="pdm-tab-content animate-fade-in">
              <ListEdeposits id_producto={product.id} existenciaGeneral={product.existencia_general} onRefreshProducts={handleRefreshProduct} />
            </div>
          )}

          {activeTab === "precios" && (
            <div className="pdm-tab-content animate-fade-in">
              <ListPrices productId={product.id} />
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="pdm-footer">
          <button 
            className={`pdm-btn-action delete ${hasHistory ? 'disabled' : ''}`} 
            onClick={!hasHistory ? onDelete : null} 
            disabled={hasHistory || isLoading}
          >
            {hasHistory ? <Lock size={16} /> : <Trash2 size={16} />}
            <span>{hasHistory ? "ELIMINACIÓN BLOQUEADA" : "ELIMINAR PRODUCTO"}</span>
          </button>
          <div className="pdm-footer-right">
            <button className="pdm-btn-secondary" onClick={onClose}>CERRAR</button>
            <button className="pdm-btn-primary" onClick={onEdit} disabled={isLoading}>
              <Pencil size={16} /> EDITAR PRODUCTO
            </button>
          </div>
        </div>

      </div>

      {/* MODAL DE ZOOM DE IMAGEN */}
      {isZoomOpen && (
        <div className="pdm-zoom-overlay" onClick={() => setIsZoomOpen(false)}>
          <button className="pdm-zoom-close" onClick={() => setIsZoomOpen(false)}>
            <X size={32} />
          </button>
          <img 
            src={currentImageSrc} 
            alt="Zoomed" 
            className="pdm-zoom-image" 
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
};

export default ModalDetailed;