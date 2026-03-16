import React, { useState } from "react";
import {
  X, FileText, Trash2, Edit3, CheckCircle2, Loader2, Clipboard
} from "lucide-react";
import { useIncExp } from "../../../context/IncExpContext";
import ModalConfirmSale from "./ModalConfirmSale";
import "../../../styles/ui/SalesDetailModal.css";

const SaleDetailModal = ({ isOpen, sale, onClose, onEdit }) => {
  const { confirmSale, getAllSales, deleteSaleById } = useIncExp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModalResult, setShowModalResult] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: "", message: "", type: "success" });

  if (!isOpen || !sale) return null;

  // --- LÓGICA DE ESTADO ---
  // Si sale.estatus es false, la venta no es editable ni accionable.
  const isActive = sale.estatus !== false;
  const isPending = sale.estado_venta?.toLowerCase() === "pendiente";
  
  // Solo se permiten acciones si está activa Y está pendiente
  const canModify = isActive && isPending;

  // --- HELPERS ---
  const formatNum = (val) => {
    return Number(val || 0).toLocaleString('de-DE', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // --- ACCIONES ---
  const handleConfirm = async () => {
    if (!canModify) return;
    setIsProcessing(true);
    try {
      const res = await confirmSale(sale.id);
      if (res.status || res.code === 200) {
        setModalConfig({
          title: "VENTA CONFIRMADA",
          message: res.msg || "El inventario se ha actualizado correctamente.",
          type: "success",
        });
        setShowModalResult(true);
        if (getAllSales) await getAllSales();
      }
    } catch (error) {
      setModalConfig({ title: "ERROR", message: "Error al procesar la transacción.", type: "error" });
      setShowModalResult(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!canModify || !window.confirm("¿Desea eliminar esta venta permanentemente?")) return;
    setIsProcessing(true);
    try {
      const res = await deleteSaleById(sale.id);
      if (res.status || res.code === 200) {
        onClose();
        if (getAllSales) await getAllSales();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const items = sale.items || [];
  const saldoPendiente = (parseFloat(sale.total) || 0) - (parseFloat(sale.abonado) || 0);

  return (
    <div className="sdm-overlay">
      <div className="sdm-modal-container">
        <button className="sdm-close-floating" onClick={onClose}><X size={20} /></button>

        <div className="sdm-invoice-paper">
          <div className="sdm-invoice-top-header">
            <div className="invoice-brand">
              <h2 className="sdm-main-title">DETALLE DE VENTA</h2>
              <p className="sdm-brand-sub">Ref: #{sale.id}</p>
            </div>
            <div className="sdm-meta-top">
              <p><strong>Factura:</strong> {sale.nro_factura || "PENDIENTE"}</p>
              <p><strong>Fecha:</strong> {formatDate(sale.fecha_creacion)}</p>
            </div>
          </div>

          <div className="sdm-invoice-client-row">
            <div className="client-info">
              <label>Factura a:</label>
              <h4>{sale.paciente_nombre || "Paciente General"}</h4>
              <p>Seguro: {sale.seguro_nombre || "N/A"}</p>
            </div>
            <div className="status-info">
              {/* Badge Dinámico: Cancelada tiene prioridad */}
              <div className={`sdm-badge ${!isActive ? "cancelled" : isPending ? "pending" : "confirmed"}`}>
                {!isActive ? "ANULADA" : isPending ? "PENDIENTE" : "CONFIRMADA"}
              </div>
              <div className={`sdm-badge ${sale.estado_pago === "Pagado" ? "paid" : "unpaid"}`}>
                {sale.estado_pago === "Pagado" ? "PAGADO" : "IMPAGADO"}
              </div>
            </div>
          </div>

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
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="item-name">{item.producto}</div>
                      <div className="item-sku">SKU: {item.sku || "N/A"}</div>
                    </td>
                    <td className="text-right">{parseFloat(item.cantidad)}</td>
                    <td className="text-right font-mono">{formatNum(item.precio_venta)}</td>
                    <td className="text-right font-mono">{formatNum(item.cantidad * item.precio_venta)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
                <span className="font-mono">{formatNum(sale.subtotal1)}</span>
              </div>
              <div className="sdm-total-row text-red">
                <span>Descuento ({sale.descuentopor}%)</span>
                <span className="font-mono">-{formatNum(sale.descuento)}</span>
              </div>
              <div className="sdm-total-row sdm-grand-total">
                <span className="bold">Total Neto</span>
                <span className="bold amount font-mono">$ {formatNum(sale.total)}</span>
              </div>
              <div className="sdm-balance-card">
                <span className="bold">Saldo Pendiente</span>
                <span className={`bold font-mono ${saldoPendiente > 0.01 ? 'text-red' : 'text-green'}`}>
                  $ {formatNum(saldoPendiente)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <footer className="sdm-modal-actions">
          <div className="action-group">
            {/* Solo se muestran botones de acción si la venta NO está cancelada y está pendiente */}
            {canModify && (
              <>
                <button className="btn-action btn-delete" onClick={handleDelete} disabled={isProcessing}>
                  <Trash2 size={16} /> Eliminar
                </button>
                <button className="btn-action btn-edit" onClick={() => onEdit(sale)} disabled={isProcessing}>
                  <Edit3 size={16} /> Editar
                </button>
              </>
            )}
          </div>
          <div className="action-group">
            <button className="btn-action btn-close" onClick={onClose}>Cerrar</button>
            {canModify && (
              <button className="btn-action btn-confirm" onClick={handleConfirm} disabled={isProcessing}>
                {isProcessing ? <Loader2 className="sdm-spin" size={16} /> : <CheckCircle2 size={16} />}
                Confirmar Transacción
              </button>
            )}
          </div>
        </footer>
      </div>

      <ModalConfirmSale
        isOpen={showModalResult}
        onClose={() => {
          setShowModalResult(false);
          if (modalConfig.type === "success") onClose();
        }}
        {...modalConfig}
      />
    </div>
  );
};

export default SaleDetailModal;