import React, { useState } from "react";
import { 
  X, FileText, Package, User, ShieldCheck, Activity, 
  CreditCard, Clipboard, Loader2, Trash2, Edit3, CheckCircle2 
} from "lucide-react";
import { useIncExp } from "../../../context/IncExpContext";
import ModalConfirmSale from './ModalConfirmSale'; 
import "../../../styles/ui/SalesDetailModal.css"; 

const SaleDetailModal = ({ isOpen, sale, onClose, onEdit }) => {
  const { confirmSale, getAllSales, deleteSaleById } = useIncExp();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModalResult, setShowModalResult] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: "", message: "", type: "success" });

  if (!isOpen || !sale) return null;

  // --- HELPERS ---
  // Formato para moneda con coma decimal
  const formatNum = (val) => {
    const num = parseFloat(val) || 0;
    return num.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("es-ES", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  // --- ACCIONES ---
  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      const res = await confirmSale(sale.id);
      if (res.status || res.code === 200) {
        setModalConfig({
          title: "Venta Confirmada",
          message: res.msg || "El stock ha sido actualizado correctamente.",
          type: "success"
        });
        setShowModalResult(true);
        if (getAllSales) await getAllSales();
      } else {
        setModalConfig({ title: "Error", message: res.msg, type: "error" });
        setShowModalResult(true);
      }
    } catch (error) {
      setModalConfig({ title: "Error de Sistema", message: "Error al procesar la transacción.", type: "error" });
      setShowModalResult(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Desea eliminar esta venta permanentemente?")) return;
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

  const isPending = sale.estado_venta?.toLowerCase() === "pendiente";
  const items = sale.items || [];
  const saldoPendiente = (parseFloat(sale.total) || 0) - (parseFloat(sale.abonado) || 0);

  return (
    <div className="sdm-overlay">
      <div className="sdm-container">
        <header className="sdm-header">
          <div className="sdm-header-info">
            <div className="sdm-icon-wrapper">
              <FileText size={22} />
            </div>
            <div>
              <h3 className="sdm-title">Factura {sale.nro_factura}</h3>
              <p className="sdm-subtitle">Ref: #{sale.id} • {formatDate(sale.fecha_creacion)}</p>
            </div>
          </div>
          <button className="sdm-close-x" onClick={onClose}><X size={20} /></button>
        </header>

        <div className="sdm-body">
          <div className="sdm-stats-grid">
            <div className="sdm-stat-card">
              <label><Activity size={14} /> Estado de Venta</label>
              <span className={`sdm-status-pill isPending ? 'pending' : 'confirmed'}`}>
                {sale.estado_venta}
              </span>
            </div>
            <div className="sdm-stat-card">
              <label><CreditCard size={14} /> Pago</label>
              <span className={`sdm-status-pill sale.estado_pago === 'Pagado' ? 'success' : 'warning'}`}>
                {sale.estado_pago}
              </span>
            </div>
            <div className="sdm-stat-card">
              <label><User size={14} /> Paciente</label>
              <span className="sdm-val">{sale.paciente_nombre}</span>
            </div>
            <div className="sdm-stat-card">
              <label><ShieldCheck size={14} /> Seguro</label>
              <span className="sdm-val">{sale.seguro_nombre || "N/A"}</span>
            </div>
          </div>

          {sale.personal?.length > 0 && (
            <section className="sdm-sub-section">
              <h4 className="sdm-sub-title">Personal Asignado</h4>
              <div className="sdm-staff-flex">
                {sale.personal.map((p, i) => (
                  <div key={i} className="sdm-staff-tag">
                    <span className="staff-name">{p.medico}</span>
                    <span className="staff-role">{p.tipo_medico}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="sdm-sub-section">
            <h4 className="sdm-sub-title"><Package size={16} /> Detalle del Pedido</h4>
            <div className="sdm-table-container">
              <table className="sdm-table">
                <thead>
                  <tr>
                    <th>Descripción</th>
                    <th className="text-center">Cant.</th>
                    <th className="text-right">Precio</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="item-main">{item.producto}</div>
                        <div className="item-sub">SKU: {item.sku || "N/A"}</div>
                      </td>
                      <td className="text-center">{item.cantidad}</td>
                      <td className="text-right">{formatNum(item.precio_venta)}</td>
                      <td className="text-right bold">{formatNum(item.precio_venta)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="sdm-summary-grid">
            <div className="sdm-notes">
              {sale.notas_abono && (
                <div className="sdm-note-paper">
                  <label><Clipboard size={14} /> Notas Internas</label>
                  <p>{sale.notas_abono}</p>
                </div>
              )}
            </div>

            <div className="sdm-totals">
              <div className="sdm-total-line">
                <span>Subtotal</span>
                <span>{formatNum(sale.subtotal1)}</span>
              </div>
              <div className="sdm-total-line">
                <span>Descuento ({sale.descuentopor}%)</span>
                <span>- {formatNum(sale.descuento)}</span>
              </div>
              <div className="sdm-total-line">
                <span>Base Imponible</span>
                <span>{formatNum(sale.subtotal2)}</span>
              </div>
              <div className="sdm-total-line highlight">
                <span>Monto Total</span>
                <span className="price-big">{formatNum(sale.total)}</span>
              </div>
              <div className="sdm-total-line balance">
                <span>Saldo Pendiente</span>
                <span className={saldoPendiente > 0 ? "text-red" : "text-green"}>
                  {formatNum(saldoPendiente)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <footer className="sdm-footer">
          <div className="sdm-footer-actions">
            {isPending && (
              <>
                <button className="btn-delete" onClick={handleDelete} disabled={isProcessing}>
                  <Trash2 size={16} /> Eliminar
                </button>
                <button className="btn-edit" onClick={() => onEdit(sale)} disabled={isProcessing}>
                  <Edit3 size={16} /> Editar
                </button>
                <button className="btn-confirm" onClick={handleConfirm} disabled={isProcessing}>
                  {isProcessing ? <Loader2 className="sdm-spin" size={16} /> : <CheckCircle2 size={16} />}
                  Confirmar Venta
                </button>
              </>
            )}
          </div>
          <button className="btn-secondary" onClick={onClose}>Cerrar</button>
        </footer>
      </div>

      <ModalConfirmSale 
        isOpen={showModalResult}
        onClose={() => { setShowModalResult(false); if (modalConfig.type === "success") onClose(); }}
        {...modalConfig}
      />
    </div>
  );
};

export default SaleDetailModal;