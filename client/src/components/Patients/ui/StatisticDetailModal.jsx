// StatisticDetailModal.jsx
import React, { useEffect, useState } from "react";
import {
  X, UserCircle, ShieldCheck, Clipboard, CreditCard, Loader2
} from "lucide-react";
import { useIncExp } from "../../../context/IncExpContext";
// import PaymentsDetailModal from "../../Sales/Ui/PaymentsDetailModal";
import "../../../styles/ui/SalesDetailModal.css";

const StatisticDetailModal = ({ isOpen, operacionId, onClose }) => {
  const { getSaleById } = useIncExp();

  const [sale, setSale]                   = useState(null);
  const [isLoading, setIsLoading]         = useState(false);
  const [showPaymentsModal, setShowPaymentsModal] = useState(false);



  useEffect(() => {
    if (isOpen && operacionId) {
      fetchSale(operacionId);
    } else {
      setSale(null);
    }
  }, [isOpen]);


  const fetchSale = async (id) => {
    setIsLoading(true);
    try {
      console.log(id)
      const data = await getSaleById(id);
      if (data) setSale(data);
    } catch (error) {
      console.error("Error al obtener detalle de operación:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const totalNeto      = Number(sale?.total || 0);
  const abonado        = Number(sale?.abonado || 0);
  const saldoPendiente = totalNeto - abonado;
  const esPagado       = saldoPendiente <= 0.01;
  const isPending      = sale?.estado_venta?.toLowerCase() === "pendiente";
  const isActive       = sale?.estatus !== false;

  const formatNum = (val) =>
    Number(val || 0).toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div className="sdm-overlay">
      <div className="sdm-modal-container">
        <button className="sdm-close-floating" onClick={onClose}>
          <X size={20} />
        </button>

        {/* LOADING */}
        {isLoading ? (
          <div className="sdm-invoice-paper" style={{
            display: "flex", alignItems: "center",
            justifyContent: "center", minHeight: "300px", gap: "12px"
          }}>
            <Loader2 size={24} className="sdm-spin" />
            <span>Cargando detalle...</span>
          </div>
        ) : sale ? (
          <div className="sdm-invoice-paper">

            {/* HEADER */}
            <div className="sdm-invoice-top-header">
              <div className="invoice-brand">
                <h2 className="sdm-main-title">DETALLE DE OPERACIÓN</h2>
                <p className="sdm-brand-sub">Ref: #{sale.id}</p>
              </div>
              <div className="sdm-meta-top">
                <p><strong>Factura:</strong> {sale.nro_factura || "-"}</p>
                <p><strong>Fecha:</strong> {formatDate(sale.fecha_creacion)}</p>
              </div>
            </div>

            {/* CLIENTE + ESTADO */}
            <div className="sdm-invoice-client-row">
              <div className="client-info">
                <label><UserCircle size={12} style={{ marginRight: "4px" }} /> Factura a:</label>
                <h4 style={{ marginBottom: "8px" }}>
                  {sale.paciente_nombre || "Paciente General"}
                </h4>
                {sale.particular || !sale.seguro_nombre ? (
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: "5px",
                    backgroundColor: "#f1f5f9", color: "#475569",
                    padding: "3px 8px", borderRadius: "4px",
                    fontSize: "0.7rem", fontWeight: 800,
                    border: "1px solid #e2e8f0"
                  }}>
                    MODALIDAD: PARTICULAR
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: "5px",
                      backgroundColor: "#eff6ff", color: "#2563eb",
                      padding: "3px 8px", borderRadius: "4px",
                      fontSize: "0.7rem", fontWeight: 800,
                      border: "1px solid #dbeafe", width: "fit-content"
                    }}>
                      <ShieldCheck size={12} /> MODALIDAD: SEGURO
                    </div>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1e40af", marginTop: "2px" }}>
                      {sale.seguro_nombre}
                    </span>
                  </div>
                )}
              </div>

              <div className="status-info">
                <div className={`sdm-badge ${!isActive ? "cancelled" : isPending ? "pending" : "confirmed"}`}>
                  {!isActive ? "ANULADA" : isPending ? "PENDIENTE" : "CONFIRMADA"}
                </div>
                <div className={`sdm-badge ${esPagado ? "paid" : "unpaid"}`}>
                  {esPagado ? "PAGADO" : "SALDO PENDIENTE"}
                </div>
              </div>
            </div>

            {/* ITEMS */}
            <div className="sdm-table-wrapper">
              <table className="sdm-invoice-table">
                <thead>
                  <tr>
                    <th>Descripción</th>
                    <th className="text-right">Cant.</th>
                    <th className="text-right">Precio</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(sale.items || []).map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="item-name">{item.producto}</div>
                        <div className="item-sku">SKU: {item.sku || "N/A"}</div>
                      </td>
                      <td className="text-right">{parseFloat(item.cantidad)}</td>
                      <td className="text-right font-mono">$ {formatNum(item.precio_venta)}</td>
                      <td className="text-right font-mono">$ {formatNum(item.cantidad * item.precio_venta)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* FOOTER */}
            <div className="sdm-invoice-footer-grid">
              <div className="sdm-footer-left">
                {sale.personal?.length > 0 && (
                  <div className="sdm-staff-box">
                    <p className="sdm-section-label">Personal Asignado</p>
                    {sale.personal.map((p, i) => (
                      <p key={i} className="staff-item">
                        <strong>{p.tipo_medico}:</strong> {p.medico}
                      </p>
                    ))}
                  </div>
                )}
                {sale.notas_abono && (
                  <div className="sdm-notes-box">
                    <p className="sdm-section-label"><Clipboard size={12} /> Notas</p>
                    <p className="notes-text">{sale.notas_abono}</p>
                  </div>
                )}
              </div>

              <div className="sdm-totals-box">
                <div className="sdm-total-row">
                  <span>Subtotal</span>
                  <span className="font-mono">$ {formatNum(sale.subtotal1)}</span>
                </div>
                <div className="sdm-total-row text-red">
                  <span>Descuento ({sale.descuentopor}%)</span>
                  <span className="font-mono">-$ {formatNum(sale.descuento)}</span>
                </div>
                <div className="sdm-total-row sdm-grand-total">
                  <span className="bold">Total Neto</span>
                  <span className="bold amount font-mono">$ {formatNum(totalNeto)}</span>
                </div>
                <div className={`sdm-balance-card ${esPagado ? "bg-green-light" : ""}`}>
                  <span className="bold">Saldo Pendiente</span>
                  <span className={`bold font-mono ${esPagado ? "text-green" : "text-red"}`}>
                    $ {formatNum(saldoPendiente)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="sdm-invoice-paper" style={{
            display: "flex", alignItems: "center",
            justifyContent: "center", minHeight: "300px"
          }}>
            <p style={{ color: "var(--sdm-muted, #94a3b8)" }}>
              No se pudo cargar el detalle
            </p>
          </div>
        )}

        <footer className="sdm-modal-actions">
          <div className="action-group">
            {/* {sale && (
              <button className="btn-action btn-payments" onClick={() => setShowPaymentsModal(true)}>
                <CreditCard size={16} /> Ver Pagos
              </button>
            )} */}
            <button className="btn-action btn-close" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </footer>
      </div>

      {/* {sale && (
        <PaymentsDetailModal
          isOpen={showPaymentsModal}
          onClose={() => setShowPaymentsModal(false)}
          sale={sale}
        />
      )} */}
    </div>
  );
};

export default StatisticDetailModal;