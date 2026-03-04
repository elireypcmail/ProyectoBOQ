import React from "react";
import { X, FileText, Calendar, Package, Hash, Truck, Layers } from "lucide-react";
import "../../../styles/ui/PurchaseDetailModal.css"; 

const PurchaseDetailModal = ({ isOpen, purchase, onClose }) => {
  if (!isOpen || !purchase) return null;

  console.log(purchase)

  // --- 1. HELPERS DE FORMATEO ---
  const safeParse = (val) => {
    if (val === null || val === undefined || val === "" || val === false) return 0;
    if (typeof val === "number") return val;
    let sVal = String(val);
    const cleanVal = sVal.replace(/\./g, "").replace(",", ".");
    return parseFloat(cleanVal) || 0;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const dateOnly = dateStr.split("T")[0];
    const [year, month, day] = dateOnly.split("-");
    return `${day}/${month}/${year}`;
  };

  const formatNum = (val) => {
    const num = safeParse(val);
    return num.toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // --- 2. EXTRACCIÓN DE DATOS ---
  const totals = purchase.totales_cargos || {};
  const items = purchase.items || [];
  const lotes = purchase.detalle_lotes || [];

  const subtotalBruto = safeParse(totals.subtotal);
  const descuento = safeParse(totals.monto_descuento_fijo);
  const cargos = safeParse(totals.cargos_monto);
  const abono = safeParse(totals.monto_abonado);

  const totalFacturaNeto = subtotalBruto - descuento;
  const saldoPendiente = totalFacturaNeto - abono + cargos;

  return (
    <div className="pdm-modal-overlay">
      <div className="pdm-modal-content" style={{ maxWidth: "900px", width: "95%", padding: 0 }}>
        
        {/* HEADER */}
        <div className="pdm-modal-header">
          <div className="pdm-header-title">
            <FileText size={22} className="pdm-icon-primary" />
            <h3>Detalle de Compra</h3>
          </div>
          <button className="pdm-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="pdm-modal-body">
          
          {/* RESUMEN CABECERA */}
          <div className="pdm-summary-grid">
            <div className="pdm-summary-card">
              <label><Hash size={14} /> Factura N°</label>
              <span>{purchase.nro_factura || "-"}</span>
            </div>
            <div className="pdm-summary-card">
              <label><Truck size={14} /> Proveedor</label>
              <span>{purchase.proveedor || purchase.proveedor_nombre || "-"}</span>
            </div>
            <div className="pdm-summary-card">
              <label><Calendar size={14} /> Emisión</label>
              <span>{formatDate(purchase.fecha_emision)}</span>
            </div>
            <div className="pdm-summary-card">
              <label><Calendar size={14} /> Vencimiento</label>
              <span>{formatDate(purchase.fecha_vencimiento)}</span>
            </div>
          </div>

          {/* ============================= */}
          {/* TABLA DE PRODUCTOS */}
          {/* ============================= */}
          <div className="pdm-section-title">
            <Package size={18} />
            <h4>Detalle de Mercancía</h4>
          </div>

          <div className="pdm-table-container">
            <table className="pdm-main-table">
              <thead>
                <tr>
                  <th>DESCRIPCIÓN</th>
                  <th className="pdm-text-center">CANTIDAD</th>
                  <th className="pdm-text-center">COSTO</th>
                  <th className="pdm-text-center">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={`prod-${index}`} className="pdm-row-product">
                    <td className="pdm-cell-desc">{item.Producto}</td>
                    <td className="pdm-text-center">{formatNum(item.Cant)}</td>
                    <td className="pdm-text-center">$ {formatNum(item.Costo_Base)}</td>
                    <td className="pdm-text-center">$ {formatNum(item.Subtotal_Linea)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ============================= */}
          {/* SECCIÓN INDEPENDIENTE DE LOTES */}
          {/* ============================= */}
          {lotes.length > 0 && (
            <>
              <div className="pdm-section-title">
                <Layers size={18} />
                <h4>Listado de Lotes</h4>
              </div>

              <div className="pdm-table-container">
                <table className="pdm-lotes-main-table">
                  <thead>
                    <tr>
                      <th>PRODUCTO</th>
                      <th>LOTE</th>
                      <th>DEPÓSITO</th>
                      <th className="pdm-text-center">CANTIDAD</th>
                      <th className="pdm-text-center">VENCIMIENTO</th>
                      <th className="pdm-text-center">ESTADO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lotes.map((lote, index) => {
                      const producto = items.find(
                        (p) => p.id_producto === lote.id_producto
                      );

                      return (
                        <tr key={`lote-main-${index}`} className="pdm-lote-row-main">
                          <td className="pdm-lote-text">
                            {producto?.Producto || "-"}
                          </td>
                          <td>
                            <span className="pdm-lote-tag">
                              #{lote.nro_lote}
                            </span>
                          </td>
                          <td className="pdm-lote-text">
                            {lote.Deposito}
                          </td>
                          <td className="pdm-text-center pdm-lote-text">
                            {formatNum(lote.cantidad)}
                          </td>
                          <td className="pdm-text-center pdm-lote-text">
                            {formatDate(lote.fecha_vencimiento)}
                          </td>
                          <td className="pdm-text-center">
                            <span className="pdm-status-pill">Cargado</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* PANEL DE TOTALES */}
          <div className="pdm-footer-flex">
            <div className="pdm-totals-panel">
              <div className="pdm-total-line">
                <span>Subtotal</span>
                <span>$ {formatNum(subtotalBruto)}</span>
              </div>

              <div className="pdm-total-line pdm-text-danger">
                <span>Descuento</span>
                <span>- $ {formatNum(descuento)}</span>
              </div>

              <div className="pdm-divider"></div>

              <div className="pdm-total-line pdm-main-total">
                <span>TOTAL FACTURA</span>
                <span className="pdm-price-large">
                  $ {formatNum(totalFacturaNeto)}
                </span>
              </div>

              <div className="pdm-divider"></div>

              <div className="pdm-total-line pdm-text-success">
                <span>Monto Abonado</span>
                <span>- $ {formatNum(abono)}</span>
              </div>

              <div className="pdm-total-line pdm-text-danger">
                <span>Cargos Adicionales</span>
                <span>+ $ {formatNum(cargos)}</span>
              </div>

              <div className="pdm-total-line pdm-grand-total">
                <span>Saldo Pendiente</span>
                <span className={saldoPendiente > 0 ? "pdm-text-danger" : ""}>
                  $ {formatNum(saldoPendiente)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pdm-modal-footer">
          <button className="pdm-btn-close" onClick={onClose}>
            Cerrar Detalle
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseDetailModal;
